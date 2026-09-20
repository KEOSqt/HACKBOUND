import type { PlayerState, Card } from '../game/types';

interface HandProps {
  player: PlayerState;
  isActive: boolean;
  onPlayCard: (card: Card, targetId: string) => void;
  onSelectCard: (card: Card | null) => void;
  validTargets: string[];
}

export function Hand({ player, isActive, onPlayCard, onSelectCard, validTargets }: HandProps) {
  const teamColor = player.team === 'RED' ? '#ff0040' : '#00d4ff';
  
  const handleCardClick = (card: Card) => {
    if (!isActive) return;
    onSelectCard(card);
  };
  
  const handleCardDoubleClick = (card: Card) => {
    if (!isActive) return;
    if (card.targetType === 'NONE' || validTargets.length === 0) {
      onPlayCard(card, 'self');
    }
  };
  
  const canPlayCard = (card: Card) => {
    return isActive && player.energy >= card.cost;
  };
  
  return (
    <div className="hand-container">
      <div className="hand-header">
        <div className="panel-title" style={{ color: teamColor }}>
          {player.team} HAND ({player.hand.length}/7)
        </div>
        {isActive && <div className="active-badge">ACTIVE</div>}
      </div>
      
      <div className="hand-cards">
        {player.hand.length === 0 ? (
          <div className="empty-hand">No cards in hand</div>
        ) : (
          player.hand.map(card => (
            <CardComponent
              key={card.id}
              card={card}
              teamColor={teamColor}
              isActive={isActive}
              canPlay={canPlayCard(card)}
              onClick={handleCardClick}
              onDoubleClick={handleCardDoubleClick}
            />
          ))
        )}
      </div>
      
      {player.deck.length > 0 && (
        <div className="deck-info">
          <span>Deck: {player.deck.length}</span>
          <span>Discard: {player.discard.length}</span>
        </div>
      )}
    </div>
  );
}

interface CardComponentProps {
  card: Card;
  teamColor: string;
  isActive: boolean;
  canPlay: boolean;
  onClick: (card: Card) => void;
  onDoubleClick: (card: Card) => void;
}

function CardComponent({ card, teamColor, isActive, canPlay, onClick, onDoubleClick }: CardComponentProps) {
  const categoryColors: Record<string, string> = {
    RECONNAISSANCE: '#00ffff',
    INITIAL_ACCESS: '#ff6b00',
    EXPLOITATION: '#ff0040',
    PRIVILEGE_ESCALATION: '#ffaa00',
    LATERAL_MOVEMENT: '#aa00ff',
    IMPACT: '#ff0000',
    PREVENTION: '#00ff88',
    DETECTION: '#00aaff',
    RESPONSE: '#ffaa00',
    RECOVERY: '#00ffcc',
    DECEPTION: '#ff8800'
  };
  
  const cardColor = categoryColors[card.category] || teamColor;
  
  return (
    <div
      className={`card ${canPlay ? 'playable' : ''} ${!isActive || !canPlay ? 'unplayable' : ''}`}
      style={{ 
        borderColor: cardColor,
        opacity: isActive ? 1 : 0.7
      }}
      onClick={() => onClick(card)}
      onDoubleClick={() => onDoubleClick(card)}
      title={`${card.name} - ${card.description}`}
    >
      <div className="card-top">
        <span className="card-icon">{card.icon}</span>
        <span className="card-cost" style={{ color: '#ffaa00' }}>
          ⚡ {card.cost}
        </span>
      </div>
      <div className="card-name" style={{ color: cardColor }}>{card.name}</div>
      <div className="card-category">{card.category.replace('_', ' ')}</div>
      <div className="card-description">{card.description}</div>
      {!isActive && <div className="card-wait">WAITING...</div>}
      {!canPlay && isActive && <div className="card-cost-warning">NEED {card.cost} ENERGY</div>}
    </div>
  );
}