import type { GameState } from '../game/types';

interface TurnIndicatorProps {
  state: GameState;
  onEndTurn: () => void;
}

export function TurnIndicator({ state, onEndTurn }: TurnIndicatorProps) {
  const isRedTurn = state.currentTurn === 'RED';
  const teamColor = isRedTurn ? '#ff0040' : '#00d4ff';
  const teamGlow = isRedTurn ? 'rgba(255, 0, 64, 0.4)' : 'rgba(0, 212, 255, 0.4)';
  
  const getPhaseLabel = () => {
    switch (state.phase) {
      case 'RED_TURN': return 'RED TEAM TURN';
      case 'BLUE_TURN': return 'BLUE TEAM TURN';
      case 'RESPONSE_WINDOW': return '⚡ RESPONSE WINDOW';
      case 'CARD_RESOLUTION': return 'RESOLVING...';
      case 'GAME_SETUP': return 'INITIALIZING...';
      default: return 'STANDBY';
    }
  };
  
  return (
    <div 
      className="turn-indicator-bar"
      style={{ 
        borderColor: teamColor,
        boxShadow: `0 0 16px ${teamGlow}`
      }}
    >
      <div className="turn-info">
        <div className="phase-label">{getPhaseLabel()}</div>
        <div className="turn-counter">
          <span className="turn-number">TURN {state.turnNumber}</span>
          {state.responseWindowActive && (
            <span className="response-timer">
              {Math.ceil(state.responseWindowTimer / 1000)}s
            </span>
          )}
        </div>
      </div>
      
      <div className="turn-player" style={{ color: teamColor }}>
        <div className="player-avatar" style={{ background: teamColor }}>
          {isRedTurn ? '🔴' : '🔵'}
        </div>
        <div className="player-name">
          {isRedTurn ? 'RED TEAM' : 'BLUE TEAM'}
          <span className="player-role">{isRedTurn ? 'ATTACKER' : 'DEFENDER'}</span>
        </div>
      </div>
      
      <button 
        className="btn btn-secondary end-turn-btn"
        onClick={onEndTurn}
        disabled={state.phase !== 'RED_TURN' && state.phase !== 'BLUE_TURN' || state.responseWindowActive}
        style={{ 
          borderColor: teamColor,
          color: teamColor
        }}
      >
        END TURN
      </button>
    </div>
  );
}