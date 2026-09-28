import type { GameState, Team, Card, ChainLink } from './types';
import {
  processTurnStart, processTurnEnd,
  checkWinCondition, getWinReason
} from './effects';
import { selectCard, setValidTargets, setPhase, clearResponseChain, addLogEntry, tickMatchTimer, startMatchTimer, bumpStat, setWinner } from './gameState';
import { createInitialGameState } from './gameState';
import { canPlayCard, isValidResponse } from './rules';
import { resolveCardEffect } from './effects';

/** Apply a win (if any) with its human-readable reason. */
function applyWinCheck(state: GameState): GameState {
  const winner = checkWinCondition(state);
  if (!winner || state.phase === 'GAME_OVER') return state;
  let newState = setWinner(state, winner, getWinReason(state));
  newState = addLogEntry(newState, winner, `${winner} TEAM WINS!`, 'win');
  return newState;
}

export function startGame(state: GameState): GameState {
  let newState = setPhase(state, 'GAME_SETUP');
  newState = addLogEntry(newState, 'RED', 'Initializing CYBERCLASH...', 'info');
  newState = addLogEntry(newState, 'BLUE', 'Network topology loaded', 'info');

  newState = setPhase(newState, 'RED_TURN');
  newState = processTurnStart(newState, 'RED');
  newState = startMatchTimer(newState);
  newState = addLogEntry(newState, 'RED', 'Match timer started (06:00). RED needs 3 Data Tokens; BLUE must survive.', 'info');

  return newState;
}

export function startTutorial(state: GameState): GameState {
  let newState = setPhase(state, 'TUTORIAL');
  newState = addLogEntry(newState, 'RED', 'TUTORIAL: Step 1 - Discover the network with RECONNAISSANCE cards', 'info');
  return newState;
}

export function nextTutorialStep(state: GameState): GameState {
  const step = state.tutorialStep + 1;
  let newState = { ...state, tutorialStep: step };
  
  const messages = [
    'TUTORIAL: Step 2 - Attack vulnerable systems with EXPLOITATION cards',
    'TUTORIAL: Step 3 - Defend or compromise the network. BLUE TEAM responds to threats',
    'TUTORIAL: Complete! Starting battle...'
  ];
  
  if (step < messages.length) {
    newState = addLogEntry(newState, step % 2 === 0 ? 'RED' : 'BLUE', messages[step], 'info');
  }
  
  if (step >= 3) {
    newState = startGame(newState);
  }
  
  return newState;
}

export function playCard(state: GameState, card: Card, targetId: string): GameState {
  if (state.winner || state.phase === 'GAME_OVER') return state;
  const currentTeam = state.currentTurn;

  // No actions during the opponent's turn and no playing the opponent's cards.
  if (card.team !== currentTeam) {
    return addLogEntry(state, currentTeam, `Cannot play ${card.name}: not your team's card`, 'info');
  }

  const canPlay = canPlayCard(state, currentTeam, card);
  if (!canPlay.valid) {
    return addLogEntry(state, currentTeam, `Cannot play ${card.name}: ${canPlay.reason}`, 'info');
  }
  
  let newState = state;
  newState = selectCard(newState, null);
  newState = setValidTargets(newState, []);
  
  const effect = card.effect;
  
  if (effect.chainable || effect.type === 'COUNTER' || effect.type === 'BLOCK') {
    newState = addLogEntry(newState, currentTeam, `${card.name} played - RESPONSE WINDOW OPEN`, 'action');
    newState = { ...newState, responseWindowActive: true, responseWindowTimer: 5000 };
    newState = addToResponseChain(newState, card, currentTeam, targetId);
  } else {
    newState = resolveCardEffect(newState, currentTeam, card, targetId);
    newState = applyWinCheck(newState);
  }

  return newState;
}

function addToResponseChain(state: GameState, card: Card, player: Team, targetId: string): GameState {
  const link: ChainLink = {
    id: `chain_${Date.now()}`,
    card,
    player,
    targetId,
    timestamp: Date.now(),
    resolved: false
  };
  
  return {
    ...state,
    responseChain: [...state.responseChain, link]
  };
}

export function respondToCard(state: GameState, responseCard: Card, targetId: string): GameState {
  if (state.winner || state.phase === 'GAME_OVER') return state;
  const currentTeam = state.currentTurn;
  const respondingTeam: Team = currentTeam === 'RED' ? 'BLUE' : 'RED';

  const original = state.responseChain[state.responseChain.length - 1];
  if (original && !isValidResponse(responseCard, original.card)) {
    return addLogEntry(state, respondingTeam, `Cannot respond with ${responseCard.name} to ${original.card.name}`, 'info');
  }

  let newState = state;
  newState = resolveCardEffect(newState, respondingTeam, responseCard, targetId);
  newState = addLogEntry(newState, respondingTeam, `RESPONDED with ${responseCard.name}`, 'defense');

  // A resolved response fully negates the chained attack — including exfiltration.
  if (original && original.card.effect.type === 'EXFILTRATE' && respondingTeam === 'BLUE') {
    newState = bumpStat(newState, 'BLUE', 'exfilBlocked');
    newState = addLogEntry(newState, 'BLUE', 'Data exfiltration BLOCKED. No Data Token.', 'defense');
  }
  
  if (state.responseChain.length > 0) {
    newState = {
      ...newState,
      responseChain: state.responseChain.map((l, i) => 
        i === state.responseChain.length - 1 ? { ...l, resolved: true } : l
      )
    };
  }
  
  return newState;
}

export function passResponse(state: GameState): GameState {
  const currentTeam = state.currentTurn;
  let newState = state;
  
  newState = addLogEntry(newState, currentTeam === 'RED' ? 'BLUE' : 'RED', 'No response - effect resolves', 'info');
  newState = resolveResponseChain(newState);
  
  return newState;
}

function resolveResponseChain(state: GameState): GameState {
  let newState = state;

  if (state.responseChain.length > 0) {
    const lastLink = state.responseChain[state.responseChain.length - 1];
    if (!lastLink.resolved) {
      newState = resolveCardEffect(newState, lastLink.player, lastLink.card, lastLink.targetId);
    }
  }

  newState = clearResponseChain(newState);
  newState = applyWinCheck(newState);

  return newState;
}

export function endTurn(state: GameState): GameState {
  if (state.winner || state.phase === 'GAME_OVER') return state;
  let newState = state;
  const currentTeam = state.currentTurn;

  newState = addLogEntry(newState, currentTeam, 'End turn', 'info');
  newState = processTurnEnd(newState, currentTeam);
  newState = applyWinCheck(newState);

  return newState;
}

/** Advance the 6-minute match clock. On expiry with RED below 3 tokens, BLUE wins. */
export function tickMatchClock(state: GameState, deltaMs: number): GameState {
  const { state: ticked, expired } = tickMatchTimer(state, deltaMs);
  if (!expired || ticked.winner || ticked.phase === 'GAME_OVER') return ticked;
  // RED at 3 tokens would already have won; anything less means BLUE survives.
  let newState = setWinner(ticked, 'BLUE', 'TIME EXPIRED — NETWORK SECURED');
  newState = addLogEntry(newState, 'BLUE', `TIME! RED has ${ticked.redPlayer.dataTokens}/3 Data Tokens. BLUE TEAM WINS!`, 'win');
  return newState;
}

export function handleResponseWindowTimeout(state: GameState): GameState {
  if (!state.responseWindowActive) return state;
  
  let newState = state;
  newState = addLogEntry(newState, state.currentTurn, 'Response window expired', 'info');
  newState = resolveResponseChain(newState);
  
  return newState;
}

export function updateResponseTimer(state: GameState, deltaTime: number): GameState {
  if (!state.responseWindowActive) return state;
  
  const newTimer = state.responseWindowTimer - deltaTime;
  if (newTimer <= 0) {
    return handleResponseWindowTimeout(state);
  }
  
  return { ...state, responseWindowTimer: newTimer };
}

export function skipTutorial(state: GameState): GameState {
  return startGame(state);
}

export function restartGame(state: GameState): GameState {
  // Full reset: fresh decks, hands, HP, energy, tokens, timer, network, log.
  const fresh = createInitialGameState();
  return {
    ...fresh,
    phase: 'MAIN_MENU',
    soundEnabled: state.soundEnabled,
    reducedMotion: state.reducedMotion
  };
}