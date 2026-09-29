import type { GameState } from '../game/types';
import { NetworkVisualization } from './NetworkVisualization';
import { PlayerPanel } from './PlayerPanel';
import { Hand } from './Hand';
import { CardTooltip } from './CardTooltip';
import { useGameEngine } from '../hooks/useGameEngine';

interface GameBoardProps {
  state: GameState;
  onPlayCard: (card: any, targetId: string) => void;
  onSelectCard: (card: any | null) => void;
}

export function GameBoard({ state, onPlayCard, onSelectCard }: GameBoardProps) {
  const { state: engineState } = useGameEngine();
  const currentState = engineState || state;
  
  const redPlayer = currentState.redPlayer;
  const bluePlayer = currentState.bluePlayer;
  const isRedTurn = currentState.currentTurn === 'RED';
  
  return (
    <div className="game-board">
      <div className="top-row">
        <PlayerPanel 
          player={redPlayer} 
          isActive={isRedTurn}
          onPlayCard={onPlayCard}
          onSelectCard={onSelectCard}
        />
        
        <div className="network-area">
          <NetworkVisualization 
            network={currentState.network}
            currentTurn={currentState.currentTurn}
            validTargets={currentState.validTargets}
            selectedCard={currentState.selectedCard}
            responseChain={currentState.responseChain}
          />
        </div>
        
        <PlayerPanel 
          player={bluePlayer} 
          isActive={!isRedTurn}
          onPlayCard={onPlayCard}
          onSelectCard={onSelectCard}
        />
      </div>
      
      <div className="bottom-row">
        <Hand 
          player={redPlayer} 
          isActive={isRedTurn && !currentState.responseWindowActive}
          onPlayCard={onPlayCard}
          onSelectCard={onSelectCard}
          validTargets={currentState.validTargets}
        />
        
        <Hand 
          player={bluePlayer} 
          isActive={!isRedTurn && !currentState.responseWindowActive}
          onPlayCard={onPlayCard}
          onSelectCard={onSelectCard}
          validTargets={currentState.validTargets}
        />
      </div>
      
      {currentState.selectedCard && (
        <CardTooltip card={currentState.selectedCard} />
      )}
    </div>
  );
}