export * from './types';
export * from './deck';
export * from './gameState';
export * from './rules';
export * from './effects';
export * from './turnManager';

import type { GameState, Card, Team } from './types';
import { createInitialGameState } from './gameState';
import { startGame, startTutorial, playCard, respondToCard, passResponse, endTurn, cycleCard, skipTutorial, restartGame, updateResponseTimer, tickMatchClock } from './turnManager';
import { getValidTargets, canPlayCard } from './rules';

export class GameEngine {
  private state: GameState;
  private listeners: Set<(state: GameState) => void> = new Set();
  private animationFrame: number | null = null;
  private lastTime: number = 0;

  constructor() {
    this.state = createInitialGameState();
  }

  getState(): GameState {
    return this.state;
  }

  subscribe(listener: (state: GameState) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    this.listeners.forEach(listener => listener(this.state));
  }

  private setState(newState: GameState): void {
    this.state = newState;
    this.notify();
  }

  startGame(): void {
    this.setState(startGame(this.state));
  }

  startTutorial(): void {
    this.setState(startTutorial(this.state));
  }

  skipTutorial(): void {
    this.setState(skipTutorial(this.state));
  }

  playCard(card: Card, targetId: string): void {
    if (this.state.phase !== 'RED_TURN' && this.state.phase !== 'BLUE_TURN') return;
    if (this.state.responseWindowActive) return;
    
    this.setState(playCard(this.state, card, targetId));
  }

  respondWithCard(responseCard: Card, targetId: string): void {
    if (!this.state.responseWindowActive) return;
    
    this.setState(respondToCard(this.state, responseCard, targetId));
  }

  passResponse(): void {
    if (!this.state.responseWindowActive) return;
    
    this.setState(passResponse(this.state));
  }

  endTurn(): void {
    if (this.state.phase !== 'RED_TURN' && this.state.phase !== 'BLUE_TURN') return;
    if (this.state.responseWindowActive) return;

    this.setState(endTurn(this.state));
  }

  cycleCard(team: Team, cardId: string): void {
    if (this.state.phase !== 'RED_TURN' && this.state.phase !== 'BLUE_TURN') return;
    if (this.state.responseWindowActive) return;

    this.setState(cycleCard(this.state, team, cardId));
  }

  selectCard(card: Card | null): void {
    this.setState({ ...this.state, selectedCard: card });

    if (card) {
      // Honest highlighting: nodes light up only when the card's requirements
      // are actually met. Otherwise the UI shows the blocker instead of
      // baiting a click that the engine would reject.
      const playable = canPlayCard(this.state, this.state.currentTurn, card).valid;
      const targets = playable ? getValidTargets(this.state, this.state.currentTurn, card) : [];
      this.setState({ ...this.state, validTargets: targets });
    } else {
      this.setState({ ...this.state, validTargets: [] });
    }
  }

  getValidTargets(card: Card): string[] {
    return getValidTargets(this.state, this.state.currentTurn, card);
  }

  canPlayCard(card: Card): { valid: boolean; reason?: string } {
    return canPlayCard(this.state, this.state.currentTurn, card);
  }

  restartGame(): void {
    this.setState(restartGame(this.state));
  }

  toggleSound(): void {
    this.setState({ ...this.state, soundEnabled: !this.state.soundEnabled });
  }

  toggleReducedMotion(): void {
    this.setState({ ...this.state, reducedMotion: !this.state.reducedMotion });
  }

  startGameLoop(): void {
    const loop = (time: number) => {
      const deltaTime = time - this.lastTime;
      this.lastTime = time;

      // The 6-minute match clock runs continuously during play (never paused
      // for card interactions), alongside the 5s response-window countdown.
      if (this.state.timerRunning) {
        this.setState(tickMatchClock(this.state, deltaTime));
      }
      if (this.state.responseWindowActive) {
        this.setState(updateResponseTimer(this.state, deltaTime));
      }

      this.animationFrame = requestAnimationFrame(loop);
    };
    
    this.lastTime = performance.now();
    this.animationFrame = requestAnimationFrame(loop);
  }

  stopGameLoop(): void {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
  }
}

export const gameEngine = new GameEngine();