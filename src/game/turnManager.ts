import type { GameState, Team, Card, ChainLink } from './types';
import { 
  processTurnStart, processTurnEnd, 
  checkWinCondition
} from './effects';
import { selectCard, setValidTargets, setPhase, clearResponseChain, addLogEntry } from './gameState';
import { canPlayCard } from './rules';
import { resolveCardEffect } from './effects';

export function startGame(state: GameState): GameState {
  let newState = setPhase(state, 'GAME_SETUP');
  newState = addLogEntry(newState, 'RED', 'Initializing CYBERCLASH...', 'info');
  newState = addLogEntry(newState, 'BLUE', 'Network topology loaded', 'info');
  
  newState = setPhase(newState, 'RED_TURN');
  newState = processTurnStart(newState, 'RED');
  
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
  const currentTeam = state.currentTurn;
  
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
  const currentTeam = state.currentTurn;
  const respondingTeam: Team = currentTeam === 'RED' ? 'BLUE' : 'RED';
  
  let newState = state;
  newState = resolveCardEffect(newState, respondingTeam, responseCard, targetId);
  newState = addLogEntry(newState, respondingTeam, `RESPONDED with ${responseCard.name}`, 'defense');
  
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
  
  return newState;
}

export function endTurn(state: GameState): GameState {
  let newState = state;
  const currentTeam = state.currentTurn;
  
  newState = addLogEntry(newState, currentTeam, 'End turn', 'info');
  newState = processTurnEnd(newState, currentTeam);
  
  const winner = checkWinCondition(newState);
  if (winner) {
    newState = { ...newState, winner, phase: 'GAME_OVER' };
    newState = addLogEntry(newState, winner, `${winner} TEAM WINS!`, 'win');
  }
  
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

export function restartGame(_state: GameState): GameState {
  let newState = createFreshGameState();
  newState = setPhase(newState, 'MAIN_MENU');
  return newState;
}

function createFreshGameState(): GameState {
  return {
    phase: 'MAIN_MENU',
    currentTurn: 'RED',
    turnNumber: 1,
    redPlayer: {
      team: 'RED',
      deck: [],
      hand: [],
      discard: [],
      activeCards: [],
      energy: 3,
      maxEnergy: 3,
      networkIntegrity: 100,
      score: 0
    },
    bluePlayer: {
      team: 'BLUE',
      deck: [],
      hand: [],
      discard: [],
      activeCards: [],
      energy: 3,
      maxEnergy: 3,
      networkIntegrity: 100,
      score: 0
    },
    network: [],
    responseChain: [],
    responseWindowActive: false,
    responseWindowTimer: 0,
    winner: null,
    log: [],
    selectedCard: null,
    validTargets: [],
    tutorialStep: 0,
    showTutorial: true,
    soundEnabled: true,
    reducedMotion: false
  };
}