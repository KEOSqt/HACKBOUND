import type { GameState, Card, CardCategory, Team, NetworkNode } from './types';
import { getPlayer, getOpponent, getNode } from './gameState';

const pretty = (s: string) => s.replace(/_/g, ' ');

export function canPlayCard(state: GameState, team: Team, card: Card): { valid: boolean; reason?: string } {
  const player = getPlayer(state, team);

  if (player.energy < card.cost) {
    return { valid: false, reason: `Needs ${card.cost} energy (have ${player.energy})` };
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
        const nodes = req.nodeType ? state.network.filter(n => n.type === req.nodeType) : state.network;
        const hasMatching = nodes.some(n => n.status === req.status);
        if (!hasMatching) {
          return { valid: false, reason: `Needs: ${req.status} ${pretty(req.nodeType ?? 'system')}` };
        }
        break;
      }
      case 'NODE_COMPROMISED': {
        const nodes = req.nodeType ? state.network.filter(n => n.type === req.nodeType) : state.network;
        const hasCompromised = nodes.some(n => n.status === 'COMPROMISED');
        if (!hasCompromised) {
          return { valid: false, reason: `Needs: compromised ${pretty(req.nodeType ?? 'system')}` };
        }
        break;
      }
      case 'HAS_CARD': {
        if (!req.cardId) return { valid: false, reason: 'Invalid requirement: missing cardId' };
        const hasCard = [...player.hand, ...player.discard, ...player.activeCards].some(c => c.id.startsWith(req.cardId!));
        if (!hasCard) {
          return { valid: false, reason: `Needs: ${pretty(req.cardId)} played or in hand` };
        }
        break;
      }
      case 'ENERGY_MIN': {
        if (player.energy < (req.value || 0)) {
          return { valid: false, reason: `Needs ${req.value} energy (have ${player.energy})` };
        }
        break;
      }
      case 'TURN_MIN': {
        if (state.turnNumber < (req.value || 0)) {
          return { valid: false, reason: `Needs: turn ${req.value}+` };
        }
        break;
      }
      case 'NO_ACTIVE_BLOCK': {
        const nodes = req.nodeType
          ? state.network.filter(n => n.type === req.nodeType)
          : state.network;
        const blocked = nodes.some(n => n.defenses.some(d => d.includes('block') || d.includes('dlp')));
        if (blocked) {
          return { valid: false, reason: 'Blocked by active defense' };
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
    if (card.effect.type === 'EXFILTRATE' && targetNode.type !== 'SENSITIVE_DATA') return false;
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
  if (responseCard.team === originalCard.team) return false;

  // Standard counters.
  if (responseCard.effect.type === 'COUNTER' || responseCard.effect.type === 'BLOCK') {
    return true;
  }
  // DLP-style monitoring can be played as a response to data exfiltration.
  if (originalCard.effect.type === 'EXFILTRATE' && responseCard.effect.type === 'REVEAL') {
    return true;
  }

  return false;
}



export interface NextStep {
  action: 'play' | 'end';
  card: Card | null;
  targetId: string | null;
  targetLabel: string;
  text: string;
}

const RED_LADDER: CardCategory[] = [
  'RECON', 'INITIAL_ACCESS', 'EXPLOIT', 'PRIVILEGE_ESCALATION',
  'LATERAL_MOVEMENT', 'PERSISTENCE', 'IMPACT', 'EXFILTRATION'
];
const BLUE_LADDER: CardCategory[] = [
  'PREVENTION', 'DETECTION', 'RESPONSE', 'CONTAINMENT', 'RECOVERY', 'DECEPTION'
];

/**
 * Beginner coach: the earliest currently-playable attack-chain step for `team`.
 * Pure function — same inputs always give the same suggestion.
 */
export function getNextStep(state: GameState, team: Team): NextStep {
  const player = getPlayer(state, team);
  const ladder = team === 'RED' ? RED_LADDER : BLUE_LADDER;
  const playable = player.hand.filter(c => c.team === team && canPlayCard(state, team, c).valid);
  const ordered = [...playable].sort((a, b) => ladder.indexOf(a.category) - ladder.indexOf(b.category));
  const pick = ordered[0];
  if (!pick) {
    return { action: 'end', card: null, targetId: null, targetLabel: '', text: 'END TURN — nothing playable right now' };
  }
  const targets = getValidTargets(state, team, pick);
  const tid = targets[0] ?? null;
  let label = 'plays immediately';
  if (tid && tid !== 'self') {
    const node = getNode(state, tid);
    const foe = getOpponent(state, team);
    if (node) label = `click ${node.name}`;
    else if (tid === foe.team) label = `target ${foe.team} TEAM`;
    else label = `use on ${pretty(tid)}`;
  }
  return { action: 'play', card: pick, targetId: tid, targetLabel: label, text: `NEXT: Play ${pick.name} → ${label}` };
}

export const CHAIN_STAGES = ['RECON', 'ACCESS', 'EXPLOIT', 'EXFIL'] as const;

/** 0-3 progress of the Red attack chain, derived from live network state. */
export function getChainStage(state: GameState): number {
  if (state.redPlayer.dataTokens > 0) return 3;
  if (state.network.some(n => n.status === 'COMPROMISED')) return 2;
  if (state.network.some(n => n.status === 'SCANNED' || n.status === 'VULNERABLE')) return 1;
  return 0;
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