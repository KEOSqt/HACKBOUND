import type { GameState, Card, Team, NetworkNode, NodeStatus, Effect } from './types';
import { MAX_DATA_TOKENS } from './types';
import {
  getPlayer, getOpponent, getNode, getConnectedNodes,
  updateNetworkNode, addLogEntry, spendEnergy, drawCard,
  gainEnergy, playCardFromHand, reduceNetworkIntegrity,
  increaseNetworkIntegrity, setPhase, setCurrentTurn,
  incrementTurn, setWinner, clearResponseChain, setEnergy,
  damagePlayer, addDataToken, bumpStat
} from './gameState';
import { calculateDamage } from './rules';

function opponentOf(team: Team): Team {
  return team === 'RED' ? 'BLUE' : 'RED';
}

/** Apply the card's HP damage to the opposing team (clamped, never negative). */
function applyHpDamage(state: GameState, team: Team, card: Card): GameState {
  const dmg = card.effect.damage ?? 0;
  if (dmg <= 0) return state;
  const foe = opponentOf(team);
  let newState = damagePlayer(state, foe, dmg);
  newState = addLogEntry(newState, team, `${card.name} deals ${dmg} damage to ${foe} (${newState[foe === 'RED' ? 'redPlayer' : 'bluePlayer'].hp} HP left)`, team === 'RED' ? 'compromise' : 'defense');
  return newState;
}

export function resolveCardEffect(state: GameState, team: Team, card: Card, targetId: string): GameState {
  if (state.winner || state.phase === 'GAME_OVER') return state;
  let newState = state;

  newState = spendEnergy(newState, team, card.cost);
  newState = playCardFromHand(newState, team, card.id);
  newState = addLogEntry(newState, team, `played ${card.name}`, 'action');

  const effect = card.effect;
  
  switch (effect.type) {
    case 'SCAN':
      newState = resolveScan(newState, team, card, targetId, effect);
      break;
    case 'COMPROMISE':
      newState = resolveCompromise(newState, team, card, targetId, effect);
      break;
    case 'EXFILTRATE':
      newState = resolveExfiltrate(newState, team, card, targetId, effect);
      break;
    case 'BLOCK':
      newState = resolveBlock(newState, team, card, targetId, effect);
      break;
    case 'ISOLATE':
      newState = resolveIsolate(newState, team, card, targetId, effect);
      break;
    case 'HEAL':
      newState = resolveHeal(newState, team, card, targetId, effect);
      break;
    case 'DRAW':
      newState = resolveDraw(newState, team, card, effect);
      break;
    case 'ENERGY':
      newState = resolveEnergy(newState, team, card, effect);
      break;
    case 'DAMAGE':
      newState = resolveDamage(newState, team, card, targetId, effect);
      break;
    case 'REVEAL':
      newState = resolveReveal(newState, team, card, targetId, effect);
      break;
    case 'COUNTER':
      newState = resolveCounter(newState, team, card, targetId, effect);
      break;
    case 'DESTROY':
      newState = resolveDestroy(newState, team, card, targetId, effect);
      break;
    case 'PATCH':
      newState = resolvePatch(newState, team, card, targetId, effect);
      break;
    case 'DECOY':
      newState = resolveDecoy(newState, team, card, targetId, effect);
      break;
  }

  // Centralized HP pressure: any card with effect.damage hits the opposing team.
  newState = applyHpDamage(newState, team, card);

  return newState;
}

function resolveScan(state: GameState, team: Team, _card: Card, targetId: string, effect: Effect): GameState {
  const targetNode = getNode(state, targetId);
  if (!targetNode) return state;
  
  let newState = state;
  const scanValue = effect.value || 1;
  
  if (scanValue >= 1 && targetNode.status === 'SECURE') {
    newState = updateNetworkNode(newState, targetId, { status: 'SCANNED' });
    newState = addLogEntry(newState, team, `${targetNode.name} discovered (SCANNED)`, 'info');
  }
  
  if (scanValue >= 2 && targetNode.status === 'SCANNED') {
    newState = updateNetworkNode(newState, targetId, { status: 'VULNERABLE' });
    newState = addLogEntry(newState, team, `${targetNode.name} is VULNERABLE`, 'info');
  }
  
  if (scanValue >= 3) {
    newState = updateNetworkNode(newState, targetId, { 
      compromiseLevel: Math.min(targetNode.maxCompromise, targetNode.compromiseLevel + 2),
      status: 'VULNERABLE'
    });
    newState = addLogEntry(newState, team, `${targetNode.name} deeply scanned - vulnerabilities found`, 'info');
  }
  
  const connected = getConnectedNodes(state, targetId);
  connected.forEach(node => {
    if (node.status === 'SECURE') {
      newState = updateNetworkNode(newState, node.id, { status: 'SCANNED' });
      newState = addLogEntry(newState, team, `${node.name} revealed`, 'info');
    }
  });
  
  return newState;
}

function resolveCompromise(state: GameState, team: Team, card: Card, targetId: string, _effect: Effect): GameState {
  const targetNode = getNode(state, targetId);
  if (!targetNode) return state;
  
  let newState = state;
  const damage = calculateDamage(card, targetNode);
  const newCompromise = Math.min(targetNode.maxCompromise, targetNode.compromiseLevel + damage);
  
  let newStatus: NodeStatus = targetNode.status;
  if (newCompromise >= targetNode.maxCompromise) {
    newStatus = 'COMPROMISED';
  } else if (newCompromise > 0 && targetNode.status === 'SECURE') {
    newStatus = 'VULNERABLE';
  }
  
  newState = updateNetworkNode(newState, targetId, { 
    compromiseLevel: newCompromise,
    status: newStatus
  });
  
  newState = addLogEntry(newState, team, `${targetNode.name} compromised (level ${newCompromise}/${targetNode.maxCompromise})`, 'compromise');

  if (team === 'RED') {
    newState = bumpStat(newState, 'RED', 'successfulAttacks');
    if (newStatus === 'COMPROMISED' && targetNode.status !== 'COMPROMISED') {
      newState = bumpStat(newState, 'RED', 'systemsCompromised');
    }
  }

  if (newStatus === 'COMPROMISED') {
    newState = reduceNetworkIntegrity(newState, 10);
    newState = addLogEntry(newState, team, `Network integrity reduced to ${newState.redPlayer.networkIntegrity}%`, 'compromise');
  }

  return newState;
}

function resolveExfiltrate(state: GameState, team: Team, _card: Card, targetId: string, _effect: Effect): GameState {
  const targetNode = getNode(state, targetId);
  if (!targetNode) return state;

  let newState = state;

  // Only RED can exfiltrate, and only from compromised sensitive data.
  // (Requirements + target validation enforce database compromise beforehand.)
  if (team !== 'RED') return state;
  if (targetNode.type !== 'SENSITIVE_DATA' || targetNode.status !== 'COMPROMISED') {
    newState = addLogEntry(newState, team, 'Exfiltration failed — sensitive data is not compromised.', 'info');
    return newState;
  }
  if (state.redPlayer.dataTokens >= MAX_DATA_TOKENS) return state;

  newState = updateNetworkNode(newState, targetId, {
    compromiseLevel: targetNode.maxCompromise,
    status: 'COMPROMISED'
  });
  newState = addDataToken(newState);
  const tokens = newState.redPlayer.dataTokens;
  newState = bumpStat(newState, 'RED', 'successfulAttacks');
  newState = addLogEntry(newState, team, `DATA EXFILTRATED! Data Token ${tokens}/${MAX_DATA_TOKENS}.`, 'win');

  if (tokens >= MAX_DATA_TOKENS) {
    newState = setWinner(newState, 'RED', 'DATA EXFILTRATED — 3/3 DATA TOKENS');
  }

  return newState;
}

function resolveBlock(state: GameState, team: Team, card: Card, targetId: string, effect: Effect): GameState {
  const targetNode = getNode(state, targetId);
  if (!targetNode) return state;
  
  let newState = state;
  const duration = effect.duration || 2;
  
  newState = updateNetworkNode(newState, targetId, { 
    defenses: [...new Set([...targetNode.defenses, `${card.id}_block_${duration}`])]
  });
  
  newState = addLogEntry(newState, team, `${targetNode.name} fortified with ${card.name} (${duration} turns)`, 'defense');
  if (team === 'BLUE') newState = bumpStat(newState, 'BLUE', 'systemsSecured');

  return newState;
}

function resolveIsolate(state: GameState, team: Team, _card: Card, targetId: string, _effect: Effect): GameState {
  const targetNode = getNode(state, targetId);
  if (!targetNode) return state;
  
  let newState = state;
  
  newState = updateNetworkNode(newState, targetId, { 
    status: 'ISOLATED',
    defenses: [...new Set([...targetNode.defenses, 'isolated'])]
  });
  
  newState = addLogEntry(newState, team, `${targetNode.name} ISOLATED from network`, 'defense');
  newState = addLogEntry(newState, getOpponent(state, team).team, `Lost access to ${targetNode.name}`, 'info');
  if (team === 'BLUE') newState = bumpStat(newState, 'BLUE', 'systemsSecured');

  return newState;
}

function resolveHeal(state: GameState, team: Team, _card: Card, targetId: string, effect: Effect): GameState {
  const targetNode = getNode(state, targetId);
  if (!targetNode) return state;
  
  let newState = state;
  const healAmount = effect.value || 3;
  
  const newCompromise = Math.max(0, targetNode.compromiseLevel - healAmount);
  let newStatus: NodeStatus = targetNode.status;
  
  if (newCompromise === 0) {
    newStatus = 'SECURE';
  } else if (newCompromise < targetNode.maxCompromise) {
    newStatus = 'VULNERABLE';
  }
  
  newState = updateNetworkNode(newState, targetId, { 
    compromiseLevel: newCompromise,
    status: newStatus,
    defenses: targetNode.defenses.filter(d => !d.includes('isolated'))
  });
  
  newState = addLogEntry(newState, team, `${targetNode.name} recovered to ${newStatus} (level ${newCompromise})`, 'defense');
  
  if (newStatus === 'SECURE') {
    newState = increaseNetworkIntegrity(newState, 10);
    newState = addLogEntry(newState, team, `Network integrity restored to ${newState.redPlayer.networkIntegrity}%`, 'defense');
  }
  if (team === 'BLUE') newState = bumpStat(newState, 'BLUE', 'systemsSecured');

  return newState;
}

function resolveDraw(state: GameState, team: Team, _card: Card, effect: Effect): GameState {
  const drawCount = effect.value || 1;
  let newState = state;
  
  for (let i = 0; i < drawCount; i++) {
    newState = drawCard(newState, team, 1);
  }
  
  newState = addLogEntry(newState, team, `Drew ${drawCount} card(s)`, 'info');
  return newState;
}

function resolveEnergy(state: GameState, team: Team, _card: Card, effect: Effect): GameState {
  const energyGain = effect.value || 1;
  let newState = state;
  
  newState = gainEnergy(newState, team, energyGain);
  newState = addLogEntry(newState, team, `Gained ${energyGain} energy`, 'info');
  
  return newState;
}

function resolveDamage(state: GameState, team: Team, _card: Card, targetId: string, effect: Effect): GameState {
  const targetNode = getNode(state, targetId);
  if (!targetNode) return state;
  
  let newState = state;
  const duration = effect.duration || 2;
  
  newState = updateNetworkNode(newState, targetId, { 
    status: 'OFFLINE',
    defenses: [...new Set([...targetNode.defenses, `offline_${duration}`])]
  });
  
  newState = reduceNetworkIntegrity(newState, 15);
  newState = addLogEntry(newState, team, `${targetNode.name} taken OFFLINE for ${duration} turns`, 'compromise');
  newState = addLogEntry(newState, team, `Network integrity reduced to ${newState.redPlayer.networkIntegrity}%`, 'compromise');
  if (team === 'RED') newState = bumpStat(newState, 'RED', 'successfulAttacks');

  return newState;
}

function resolveReveal(state: GameState, team: Team, _card: Card, targetId: string, effect: Effect): GameState {
  let newState = state;
  const revealValue = effect.value || 1;
  
  if (targetId === 'RED' || targetId === 'BLUE') {
    const targetPlayer = targetId === 'RED' ? state.redPlayer : state.bluePlayer;
    newState = addLogEntry(newState, team, `Revealed ${targetPlayer.team} hand: ${targetPlayer.hand.map(c => c.name).join(', ')}`, 'info');
    newState = drawCard(newState, team, revealValue);
  } else {
    const nodes = targetId ? [getNode(state, targetId)].filter(Boolean) : state.network;
    nodes.forEach(node => {
      if (node) {
        newState = addLogEntry(newState, team, `${node.name}: ${node.status} (compromise: ${node.compromiseLevel}/${node.maxCompromise})`, 'info');
      }
    });
    newState = drawCard(newState, team, revealValue);
  }
  
  return newState;
}

function resolveCounter(state: GameState, team: Team, card: Card, _targetId: string, effect: Effect): GameState {
  let newState = state;
  
  newState = addLogEntry(newState, team, `Countered with ${card.name}!`, 'defense');
  if (team === 'BLUE') newState = bumpStat(newState, 'BLUE', 'attacksBlocked');
  
  if (effect.value && effect.value > 0) {
    newState = addLogEntry(newState, team, `Attacker must pay +${effect.value} energy to bypass`, 'info');
  }
  
  return newState;
}

function resolveDestroy(state: GameState, team: Team, card: Card, targetId: string, _effect: Effect): GameState {
  const targetNode = getNode(state, targetId);
  if (!targetNode) return state;
  
  let newState = state;
  
  newState = updateNetworkNode(newState, targetId, { 
    status: 'OFFLINE',
    compromiseLevel: targetNode.maxCompromise
  });
  
  newState = reduceNetworkIntegrity(newState, 25);
  newState = addLogEntry(newState, team, `${targetNode.name} DESTROYED permanently`, 'compromise');
  newState = addLogEntry(newState, team, `Network integrity reduced to ${newState.redPlayer.networkIntegrity}%`, 'compromise');
  if (team === 'RED') newState = bumpStat(newState, 'RED', 'successfulAttacks');
  
  if (card.id.startsWith('red_ransomware')) {
    newState = drawCard(newState, team, 2);
  }
  
  return newState;
}

function resolvePatch(state: GameState, team: Team, _card: Card, targetId: string, _effect: Effect): GameState {
  const targetNode = getNode(state, targetId);
  if (!targetNode) return state;
  
  let newState = state;
  
  newState = updateNetworkNode(newState, targetId, { 
    status: 'SECURE',
    compromiseLevel: 0
  });
  
  newState = addLogEntry(newState, team, `${targetNode.name} PATCHED and secured`, 'defense');
  newState = increaseNetworkIntegrity(newState, 5);
  if (team === 'BLUE') newState = bumpStat(newState, 'BLUE', 'systemsSecured');

  return newState;
}

function resolveDecoy(state: GameState, team: Team, card: Card, _targetId: string, effect: Effect): GameState {
  let newState = state;
  
  const decoyId = `decoy_${card.id}_${Date.now()}`;
  const decoyNode: NetworkNode = {
    id: decoyId,
    type: effect.nodeType || 'DATABASE',
    name: `DECOY ${(effect.nodeType || 'DATABASE').replace('_', ' ')}`,
    status: 'SECURE',
    position: { x: 50, y: 90 },
    connections: [],
    compromiseLevel: 0,
    maxCompromise: 1,
    defenses: ['decoy', `trap_${card.id}`],
    isCritical: false
  };
  
  newState = {
    ...newState,
    network: [...newState.network, decoyNode]
  };
  
  newState = addLogEntry(newState, team, `Deployed ${decoyNode.name} as decoy`, 'defense');
  
  return newState;
}

export function processTurnStart(state: GameState, team: Team): GameState {
  let newState = state;
  const player = getPlayer(newState, team);
  
  newState = setEnergy(newState, team, player.maxEnergy);
  newState = drawCard(newState, team, 1);
  newState = { ...newState, cycledThisTurn: false };
  
  newState = addLogEntry(newState, team, `Turn ${newState.turnNumber} - ${team} TEAM starts (${player.maxEnergy} energy)`, 'info');
  
  newState = processActiveEffects(newState, team);
  
  return newState;
}

function processActiveEffects(state: GameState, team: Team): GameState {
  let newState = state;
  
  newState.network.forEach(node => {
    const offlineDefense = node.defenses.find(d => d.startsWith('offline_'));
    if (offlineDefense) {
      const turns = parseInt(offlineDefense.split('_')[1]);
      if (turns <= 1) {
        newState = updateNetworkNode(newState, node.id, { 
          status: node.compromiseLevel > 0 ? 'COMPROMISED' : 'SECURE',
          defenses: node.defenses.filter(d => !d.startsWith('offline_'))
        });
        newState = addLogEntry(newState, team, `${node.name} is back ONLINE`, 'info');
      } else {
        newState = updateNetworkNode(newState, node.id, { 
          defenses: node.defenses.map(d => d.startsWith('offline_') ? `offline_${turns - 1}` : d)
        });
      }
    }
    
    const blockDefense = node.defenses.find(d => d.includes('_block_'));
    if (blockDefense) {
      const parts = blockDefense.split('_');
      const turns = parseInt(parts[parts.length - 1]);
      if (turns <= 1) {
        newState = updateNetworkNode(newState, node.id, { 
          defenses: node.defenses.filter(d => !d.includes('_block_'))
        });
        newState = addLogEntry(newState, team, `Protection on ${node.name} expired`, 'info');
      } else {
        newState = updateNetworkNode(newState, node.id, { 
          defenses: node.defenses.map(d => d.includes('_block_') ? d.replace(`_${turns}`, `_${turns - 1}`) : d)
        });
      }
    }
    
    const isolateDefense = node.defenses.find(d => d === 'isolated');
    if (isolateDefense && node.status === 'ISOLATED') {
      newState = updateNetworkNode(newState, node.id, { 
        status: 'SECURE',
        defenses: node.defenses.filter(d => d !== 'isolated'),
        compromiseLevel: 0
      });
      newState = addLogEntry(newState, team, `${node.name} isolation lifted - system cleaned`, 'defense');
    }
  });
  
  return newState;
}

export function processTurnEnd(state: GameState, team: Team): GameState {
  let newState = state;
  const nextTeam: Team = team === 'RED' ? 'BLUE' : 'RED';
  
  newState = clearResponseChain(newState);
  newState = setCurrentTurn(newState, nextTeam);
  newState = incrementTurn(newState);
  newState = setPhase(newState, nextTeam === 'RED' ? 'RED_TURN' : 'BLUE_TURN');
  newState = processTurnStart(newState, nextTeam);
  
  const winner = checkWinCondition(newState);
  if (winner) {
    newState = setWinner(newState, winner);
  }
  
  return newState;
}

export function checkWinCondition(state: GameState): Team | null {
  if (state.winner) return state.winner;
  // RED: 3 Data Tokens.
  if (state.redPlayer.dataTokens >= MAX_DATA_TOKENS) return 'RED';
  // HP victories (checked in order so simultaneous 0 HP favors the attacker).
  if (state.bluePlayer.hp <= 0) return 'RED';
  if (state.redPlayer.hp <= 0) return 'BLUE';
  return null;
}

/** Human-readable reason for the current winner (null when no winner yet). */
export function getWinReason(state: GameState): string | null {
  if (state.winReason) return state.winReason;
  const winner = checkWinCondition(state);
  if (!winner) return null;
  if (winner === 'RED') {
    if (state.redPlayer.dataTokens >= MAX_DATA_TOKENS) return 'DATA EXFILTRATED — 3/3 DATA TOKENS';
    return 'BLUE TEAM HP DEPLETED';
  }
  if (state.timeLeftMs <= 0) return 'TIME EXPIRED — NETWORK SECURED';
  return 'RED TEAM HP DEPLETED';
}