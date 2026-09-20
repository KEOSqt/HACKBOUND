import { useState, useEffect, useCallback } from 'react';
import { gameEngine } from '../game';

export function useGameEngine() {
  const [state, setState] = useState(gameEngine.getState());

  useEffect(() => {
    const unsubscribe = gameEngine.subscribe(setState);
    gameEngine.startGameLoop();
    return () => {
      unsubscribe();
      gameEngine.stopGameLoop();
    };
  }, []);

  const startGame = useCallback(() => gameEngine.startGame(), []);
  const startTutorial = useCallback(() => gameEngine.startTutorial(), []);
  const skipTutorial = useCallback(() => gameEngine.skipTutorial(), []);
  const playCard = useCallback((card: any, targetId: string) => gameEngine.playCard(card, targetId), []);
  const respondWithCard = useCallback((card: any, targetId: string) => gameEngine.respondWithCard(card, targetId), []);
  const passResponse = useCallback(() => gameEngine.passResponse(), []);
  const endTurn = useCallback(() => gameEngine.endTurn(), []);
  const selectCard = useCallback((card: any) => gameEngine.selectCard(card), []);
  const restartGame = useCallback(() => gameEngine.restartGame(), []);
  const toggleSound = useCallback(() => gameEngine.toggleSound(), []);
  const toggleReducedMotion = useCallback(() => gameEngine.toggleReducedMotion(), []);

  return {
    state,
    startGame,
    startTutorial,
    skipTutorial,
    playCard,
    respondWithCard,
    passResponse,
    endTurn,
    selectCard,
    restartGame,
    toggleSound,
    toggleReducedMotion
  };
}