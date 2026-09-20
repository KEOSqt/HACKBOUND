import type { GameState, PlayerState, NetworkNode, Team, GamePhase, Card, LogEntry, ChainLink } from './types';
import { createNetwork } from '../data/network';
import { createDecks } from './deck';
import { getNode as getNodeUtil, getConnectedNodes as getConnectedNodesUtil } from '../data/network';

function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

export function getNode(state: GameState, nodeId: string): NetworkNode | undefined {
  return getNodeUtil(state.network, nodeId);
}

export function getConnectedNodes(state: GameState, nodeId: string): NetworkNode[] {
  return getConnectedNodesUtil(state.network, nodeId);
}

export function createInitialGameState(): GameState {
  const { red, blue } = createDecks();
  const network = createNetwork();
  
  const redDrawn = red.slice(0, 5);
  const blueDrawn = blue.slice(0, 5);
  
  return {
    phase: 'MAIN_MENU',
    currentTurn: 'RED',
    turnNumber: 1,
    redPlayer: {
      team: 'RED',
      deck: red.slice(5),
      hand: redDrawn,
      discard: [],
      activeCards: [],
      energy: 3,
      maxEnergy: 3,
      networkIntegrity: 100,
      score: 0
    },
    bluePlayer: {
      team: 'BLUE',
      deck: blue.slice(5),
      hand: blueDrawn,
      discard: [],
      activeCards: [],
      energy: 3,
      maxEnergy: 3,
      networkIntegrity: 100,
      score: 0
    },
    network,
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

export function getPlayer(state: GameState, team: Team): PlayerState {
  return team === 'RED' ? state.redPlayer : state.bluePlayer;
}

export function getOpponent(state: GameState, team: Team): PlayerState {
  return team === 'RED' ? state.bluePlayer : state.redPlayer;
}

export function setPlayer(state: GameState, team: Team, player: PlayerState): GameState {
  return {
    ...state,
    [team === 'RED' ? 'redPlayer' : 'bluePlayer']: player
  };
}

export function addLogEntry(state: GameState, team: Team, message: string, type: LogEntry['type'] = 'action'): GameState {
  const entry: LogEntry = {
    id: generateId(),
    timestamp: Date.now(),
    team,
    message,
    type
  };
  return {
    ...state,
    log: [...state.log, entry].slice(-50)
  };
}

export function addToResponseChain(state: GameState, card: Card, player: Team, targetId: string): GameState {
  const link: ChainLink = {
    id: generateId(),
    card,
    player,
    targetId,
    timestamp: Date.now(),
    resolved: false
  };
  return {
    ...state,
    responseChain: [...state.responseChain, link],
    responseWindowActive: true,
    responseWindowTimer: 5000
  };
}

export function resolveResponseChain(state: GameState): GameState {
  return {
    ...state,
    responseChain: state.responseChain.map(l => ({ ...l, resolved: true })),
    responseWindowActive: false,
    responseWindowTimer: 0
  };
}

export function clearResponseChain(state: GameState): GameState {
  return {
    ...state,
    responseChain: [],
    responseWindowActive: false,
    responseWindowTimer: 0
  };
}

export function updateNetworkNode(state: GameState, nodeId: string, updates: Partial<NetworkNode>): GameState {
  return {
    ...state,
    network: state.network.map(node => 
      node.id === nodeId ? { ...node, ...updates } : node
    )
  };
}

export function setPhase(state: GameState, phase: GamePhase): GameState {
  return { ...state, phase };
}

export function setCurrentTurn(state: GameState, team: Team): GameState {
  return { ...state, currentTurn: team };
}

export function incrementTurn(state: GameState): GameState {
  return { ...state, turnNumber: state.turnNumber + 1 };
}

export function setWinner(state: GameState, winner: Team | null): GameState {
  return { ...state, winner, phase: 'GAME_OVER' };
}

export function selectCard(state: GameState, card: Card | null): GameState {
  return { ...state, selectedCard: card };
}

export function setValidTargets(state: GameState, targets: string[]): GameState {
  return { ...state, validTargets: targets };
}

export function spendEnergy(state: GameState, team: Team, amount: number): GameState {
  const player = getPlayer(state, team);
  return setPlayer(state, team, {
    ...player,
    energy: Math.max(0, player.energy - amount)
  });
}

export function gainEnergy(state: GameState, team: Team, amount: number): GameState {
  const player = getPlayer(state, team);
  return setPlayer(state, team, {
    ...player,
    energy: Math.min(player.maxEnergy, player.energy + amount)
  });
}

export function setEnergy(state: GameState, team: Team, energy: number): GameState {
  const player = getPlayer(state, team);
  return setPlayer(state, team, {
    ...player,
    energy: Math.min(player.maxEnergy, Math.max(0, energy))
  });
}

export function increaseMaxEnergy(state: GameState, team: Team, amount: number): GameState {
  const player = getPlayer(state, team);
  return setPlayer(state, team, {
    ...player,
    maxEnergy: player.maxEnergy + amount,
    energy: player.energy + amount
  });
}

export function drawCard(state: GameState, team: Team, count: number = 1): GameState {
  const player = getPlayer(state, team);
  let { newHand, newDeck } = drawFromDeck(player.deck, player.hand, count);
  
  if (newDeck.length === 0 && player.discard.length > 0) {
    const { newDeck: reshuffled, newDiscard } = reshuffleDiscardIntoDeck(newDeck, player.discard);
    newDeck = reshuffled;
    return setPlayer(state, team, { ...player, hand: newHand, deck: newDeck, discard: newDiscard });
  }
  
  return setPlayer(state, team, { ...player, hand: newHand, deck: newDeck });
}

export function playCardFromHand(state: GameState, team: Team, cardId: string): GameState {
  const player = getPlayer(state, team);
  const cardIndex = player.hand.findIndex(c => c.id === cardId);
  if (cardIndex === -1) return state;
  
  const card = player.hand[cardIndex];
  const newHand = player.hand.filter((_, i) => i !== cardIndex);
  const newActiveCards = [...player.activeCards, card];
  
  return setPlayer(state, team, {
    ...player,
    hand: newHand,
    activeCards: newActiveCards
  });
}

export function discardCardFromHand(state: GameState, team: Team, cardId: string): GameState {
  const player = getPlayer(state, team);
  const { newHand, newDiscard } = discardCard(player.hand, player.discard, cardId);
  return setPlayer(state, team, { ...player, hand: newHand, discard: newDiscard });
}

export function reduceNetworkIntegrity(state: GameState, amount: number): GameState {
  const newIntegrity = Math.max(0, state.redPlayer.networkIntegrity - amount);
  return {
    ...state,
    redPlayer: { ...state.redPlayer, networkIntegrity: newIntegrity },
    bluePlayer: { ...state.bluePlayer, networkIntegrity: newIntegrity }
  };
}

export function increaseNetworkIntegrity(state: GameState, amount: number): GameState {
  const newIntegrity = Math.min(100, state.redPlayer.networkIntegrity + amount);
  return {
    ...state,
    redPlayer: { ...state.redPlayer, networkIntegrity: newIntegrity },
    bluePlayer: { ...state.bluePlayer, networkIntegrity: newIntegrity }
  };
}

export function setTutorialStep(state: GameState, step: number): GameState {
  return { ...state, tutorialStep: step };
}

export function setShowTutorial(state: GameState, show: boolean): GameState {
  return { ...state, showTutorial: show };
}

export function toggleSound(state: GameState): GameState {
  return { ...state, soundEnabled: !state.soundEnabled };
}

export function toggleReducedMotion(state: GameState): GameState {
  return { ...state, reducedMotion: !state.reducedMotion };
}

export function resetGameState(): GameState {
  return createInitialGameState();
}

function drawFromDeck(deck: Card[], hand: Card[], count: number): { newHand: Card[]; newDeck: Card[] } {
  let currentDeck = [...deck];
  let currentHand = [...hand];
  
  for (let i = 0; i < count; i++) {
    if (currentDeck.length === 0) break;
    const drawn = currentDeck[0];
    currentDeck = currentDeck.slice(1);
    currentHand = [...currentHand, drawn];
  }
  
  return { newHand: currentHand, newDeck: currentDeck };
}

function discardCard(hand: Card[], discard: Card[], cardId: string): { newHand: Card[]; newDiscard: Card[] } {
  const cardIndex = hand.findIndex(c => c.id === cardId);
  if (cardIndex === -1) return { newHand: hand, newDiscard: discard };
  
  const card = hand[cardIndex];
  const newHand = hand.filter((_, i) => i !== cardIndex);
  const newDiscard = [...discard, card];
  return { newHand, newDiscard };
}

function reshuffleDiscardIntoDeck(deck: Card[], discard: Card[]): { newDeck: Card[]; newDiscard: Card[] } {
  if (discard.length === 0) return { newDeck: deck, newDiscard: discard };
  const shuffled = [...discard].sort(() => Math.random() - 0.5);
  return { newDeck: [...deck, ...shuffled], newDiscard: [] };
}