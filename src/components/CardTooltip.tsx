import type { Card } from '../game/types';

interface CardTooltipProps {
  card: Card;
}

export function CardTooltip({ card }: CardTooltipProps) {
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
  
  const cardColor = categoryColors[card.category] || '#00d4ff';
  
  const [position, setPosition] = React.useState({ x: 100, y: 100 });
  
  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX + 20, y: e.clientY - 100 });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);
  
  return (
    <div 
      className="card-tooltip"
      style={{ 
        left: position.x, 
        top: position.y,
        borderColor: cardColor
      }}
    >
      <div className="tooltip-title" style={{ color: cardColor }}>
        {card.icon} {card.name}
      </div>
      <div className="tooltip-category">{card.category.replace('_', ' ')}</div>
      <div className="tooltip-cost" style={{ color: '#ffaa00' }}>
        Cost: ⚡ {card.cost} Energy
      </div>
      <div className="tooltip-description">{card.description}</div>
      <div className="tooltip-educational">
        📚 {card.educationalDescription}
      </div>
      {card.requirements && card.requirements.length > 0 && (
        <div className="tooltip-requirements">
          <strong>Requirements:</strong>
          <ul>
            {card.requirements.map((req, i) => (
              <li key={i}>{formatRequirement(req)}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function formatRequirement(req: any): string {
  switch (req.type) {
    case 'NODE_STATUS':
      return `${req.nodeType} must be ${req.status}`;
    case 'NODE_COMPROMISED':
      return `${req.nodeType} must be compromised`;
    case 'HAS_CARD':
      return `Must have ${req.cardId} in play`;
    case 'ENERGY_MIN':
      return `Minimum ${req.value} energy`;
    case 'TURN_MIN':
      return `Turn ${req.value} or later`;
    default:
      return 'Unknown requirement';
  }
}

import React from 'react';