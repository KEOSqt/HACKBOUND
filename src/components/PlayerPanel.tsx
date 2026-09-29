import type { PlayerState } from '../game/types';

interface PlayerPanelProps {
  player: PlayerState;
  isActive: boolean;
  onPlayCard: (card: any, targetId: string) => void;
  onSelectCard: (card: any | null) => void;
}

export function PlayerPanel({ player, isActive }: PlayerPanelProps) {
  const teamColor = player.team === 'RED' ? '#ff0040' : '#00d4ff';
  const teamGlow = player.team === 'RED' ? 'rgba(255, 0, 64, 0.4)' : 'rgba(0, 212, 255, 0.4)';
  
  return (
    <div 
      className={`player-panel ${player.team.toLowerCase()} ${isActive ? 'active' : ''}`}
      style={{ 
        borderColor: isActive ? teamColor : 'var(--border-color)',
        boxShadow: isActive ? `0 0 20px ${teamGlow}` : 'var(--shadow-md)'
      }}
    >
      <div className="panel-header">
        <div className="team-badge" style={{ background: teamColor }}>
          {player.team} TEAM
        </div>
        <div className="player-role">
          {player.team === 'RED' ? 'ATTACKER' : 'DEFENDER'}
        </div>
        {isActive && <div className="turn-indicator">YOUR TURN</div>}
      </div>
      
      <div className="stats-grid">
        <div className="stat-box">
          <div className="stat-label">CYBER ENERGY</div>
          <div className="stat-value" style={{ color: '#ffaa00' }}>
            {player.energy} / {player.maxEnergy}
          </div>
          <div className="energy-bar">
            <div 
              className="energy-fill" 
              style={{ 
                width: `${(player.energy / player.maxEnergy) * 100}%`,
                background: 'linear-gradient(90deg, #ffaa00, #ffcc00)'
              }} 
            />
          </div>
        </div>
        
        <div className="stat-box">
          <div className="stat-label">NETWORK INTEGRITY</div>
          <div className="stat-value" style={{ color: player.networkIntegrity > 50 ? '#00ff88' : player.networkIntegrity > 25 ? '#ffaa00' : '#ff0040' }}>
            {player.networkIntegrity}%
          </div>
          <div className="integrity-bar">
            <div 
              className="integrity-fill" 
              style={{ 
                width: `${player.networkIntegrity}%`,
                background: player.networkIntegrity > 50 ? 'linear-gradient(90deg, #00ff88, #00cc6a)' : 
                          player.networkIntegrity > 25 ? 'linear-gradient(90deg, #ffaa00, #ff8800)' : 
                          'linear-gradient(90deg, #ff0040, #cc0033)'
              }} 
            />
          </div>
        </div>
        
        <div className="stat-box">
          <div className="stat-label">DECK</div>
          <div className="stat-value" style={{ color: 'var(--fg-secondary)' }}>{player.deck.length}</div>
        </div>
        
        <div className="stat-box">
          <div className="stat-label">DISCARD</div>
          <div className="stat-value" style={{ color: 'var(--fg-secondary)' }}>{player.discard.length}</div>
        </div>
        
        <div className="stat-box">
          <div className="stat-label">HAND</div>
          <div className="stat-value" style={{ color: 'var(--fg-secondary)' }}>{player.hand.length}/7</div>
        </div>
      </div>
      
      <div className="active-cards">
        <div className="panel-title">ACTIVE EFFECTS</div>
        {player.activeCards.length === 0 ? (
          <div className="empty-state">No active effects</div>
        ) : (
          <div className="active-cards-list">
            {player.activeCards.map(card => (
              <div key={card.id} className="active-card-tag" style={{ borderColor: teamColor }}>
                {card.name} ({card.category})
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}