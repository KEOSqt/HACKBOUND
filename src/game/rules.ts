import type { GameState, Card, Team, NetworkNode } from './types';
import { getPlayer, getOpponent, getNode } from './gameState';

export function canPlayCard(state: GameState, team: Team, card: Card): { valid: boolean; reason?: string } {
  const player = getPlayer(state, team);
  
  if (player.energy < card.cost) {
    return { valid: false, reason: `Not enough energy (need ${card.cost}, have ${player.energy})` };
  }
  
  const reqCheck = checkRequirements(state, team, card);
  if (!reqCheck.valid) {
    return { valid: false, reason: reqCheck.reason };
  }
  
  return { valid: true };
}

export function checkRequirements(state: GameState, team: Team, card: Card): { valid: boolean; reason?: string } {
  if (!card.requirements || card.requirements.length === 0) {
    return { valid: true };
  }
  
  const player = getPlayer(state, team);
  
  for (const req of card.requirements) {
    switch (req.type) {
      case 'NODE_STATUS': {
        if (!req.nodeType) return { valid: false, reason: 'Invalid requirement: missing nodeType' };
        const nodes = state.network.filter(n => n.type === req.nodeType);
        const hasMatching = nodes.some(n => n.status === req.status);
        if (!hasMatching) {
          return { valid: false, reason: `Requires a ${req.status} ${req.nodeType}` };
        }
        break;
      }
      case 'NODE_COMPROMISED': {
        if (!req.nodeType) return { valid: false, reason: 'Invalid requirement: missing nodeType' };
        const nodes = state.network.filter(n => n.type === req.nodeType);
        const hasCompromised = nodes.some(n => n.status === 'COMPROMISED');
        if (!hasCompromised) {
          return { valid: false, reason: `Requires compromised ${req.nodeType}` };
        }
        break;
      }
      case 'HAS_CARD': {
        if (!req.cardId) return { valid: false, reason: 'Invalid requirement: missing cardId' };
        const hasCard = [...player.hand, ...player.discard, ...player.activeCards].some(c => c.id.startsWith(req.cardId!));
        if (!hasCard) {
          return { valid: false, reason: `Requires ${req.cardId} in play or discard` };
        }
        break;
      }
      case 'ENERGY_MIN': {
        if (player.energy < (req.value || 0)) {
          return { valid: false, reason: `Requires ${req.value} energy` };
        }
        break;
      }
      case 'TURN_MIN': {
        if (state.turnNumber < (req.value || 0)) {
          return { valid: false, reason: `Requires turn ${req.value} or later` };
        }
        break;
      }
    }
  }
  
  return { valid: true };
}

export function getValidTargets(state: GameState, team: Team, card: Card): string[] {
  const targets: string[] = [];
  const opponent = getOpponent(state, team);
  
  switch (card.targetType) {
    case 'NODE': {
      if (card.effect.nodeType) {
        state.network
          .filter(n => n.type === card.effect.nodeType)
          .forEach(n => targets.push(n.id));
      } else {
        state.network.forEach(n => targets.push(n.id));
      }
      break;
    }
    case 'PLAYER': {
      targets.push(opponent.team);
      break;
    }
    case 'CARD': {
      opponent.hand.forEach(c => targets.push(c.id));
      opponent.activeCards.forEach(c => targets.push(c.id));
      break;
    }
    case 'NONE': {
      targets.push('self');
      break;
    }
  }
  
  return targets.filter(targetId => isValidTarget(state, team, card, targetId));
}

function isValidTarget(state: GameState, team: Team, card: Card, targetId: string): boolean {
  if (targetId === 'self') return true;
  
  const targetNode = getNode(state, targetId);
  if (targetNode) {
    if (card.effect.type === 'SCAN' && targetNode.status !== 'SECURE') return false;
    if (card.effect.type === 'COMPROMISE' && targetNode.status === 'OFFLINE') return false;
    if (card.effect.type === 'ISOLATE' && targetNode.status !== 'COMPROMISED') return false;
    if (card.effect.type === 'HEAL' && targetNode.status === 'SECURE') return false;
    if (card.effect.type === 'PATCH' && targetNode.status !== 'VULNERABLE') return false;
    if (card.effect.type === 'BLOCK' && targetNode.status === 'OFFLINE') return false;
    if (card.effect.type === 'DESTROY' && targetNode.status === 'OFFLINE') return false;
    return true;
  }
  
  if (targetId === 'RED' || targetId === 'BLUE') {
    return targetId !== team;
  }
  
  return true;
}

export function isValidResponse(responseCard: Card, originalCard: Card): boolean {
  if (responseCard.effect.type !== 'COUNTER' && responseCard.effect.type !== 'BLOCK') {
    return false;
  }
  
  if (responseCard.team === originalCard.team) return false;
  
  return true;
}



export function calculateDamage(card: Card, targetNode: NetworkNode): number {
  const baseDamage = card.effect.value || 1;
  let multiplier = 1;
  
  if (targetNode.defenses.includes('encryption') && card.effect.type === 'EXFILTRATE') {
    multiplier = 0.5;
  }
  
  if (targetNode.defenses.includes('edr') && (card.effect.type === 'COMPROMISE' || card.effect.type === 'DESTROY')) {
    multiplier = 0.7;
  }
  
  return Math.floor(baseDamage * multiplier);
}