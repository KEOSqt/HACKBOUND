import type { NetworkNode, NodeStatus } from '../game/types';

export const INITIAL_NETWORK: NetworkNode[] = [
  {
    id: 'internet',
    type: 'INTERNET',
    name: 'INTERNET',
    status: 'SECURE',
    position: { x: 50, y: 10 },
    connections: ['firewall'],
    compromiseLevel: 0,
    maxCompromise: 0,
    defenses: [],
    isCritical: false
  },
  {
    id: 'firewall',
    type: 'FIREWALL',
    name: 'FIREWALL',
    status: 'SECURE',
    position: { x: 50, y: 22 },
    connections: ['internet', 'web_server', 'monitoring'],
    compromiseLevel: 0,
    maxCompromise: 3,
    defenses: ['default_deny'],
    isCritical: true
  },
  {
    id: 'web_server',
    type: 'WEB_SERVER',
    name: 'WEB SERVER',
    status: 'SECURE',
    position: { x: 25, y: 38 },
    connections: ['firewall', 'app_server', 'auth_server'],
    compromiseLevel: 0,
    maxCompromise: 5,
    defenses: [],
    isCritical: true
  },
  {
    id: 'app_server',
    type: 'APP_SERVER',
    name: 'APP SERVER',
    status: 'SECURE',
    position: { x: 50, y: 54 },
    connections: ['web_server', 'database', 'auth_server'],
    compromiseLevel: 0,
    maxCompromise: 5,
    defenses: [],
    isCritical: true
  },
  {
    id: 'auth_server',
    type: 'AUTH_SERVER',
    name: 'AUTH SERVER',
    status: 'SECURE',
    position: { x: 75, y: 38 },
    connections: ['firewall', 'web_server', 'app_server', 'database'],
    compromiseLevel: 0,
    maxCompromise: 4,
    defenses: [],
    isCritical: true
  },
  {
    id: 'database',
    type: 'DATABASE',
    name: 'DATABASE',
    status: 'SECURE',
    position: { x: 50, y: 70 },
    connections: ['app_server', 'auth_server', 'sensitive_data'],
    compromiseLevel: 0,
    maxCompromise: 5,
    defenses: [],
    isCritical: true
  },
  {
    id: 'sensitive_data',
    type: 'SENSITIVE_DATA',
    name: 'SENSITIVE DATA',
    status: 'SECURE',
    position: { x: 50, y: 86 },
    connections: ['database'],
    compromiseLevel: 0,
    maxCompromise: 10,
    defenses: ['encryption'],
    isCritical: true
  },
  {
    id: 'monitoring',
    type: 'MONITORING',
    name: 'MONITORING',
    status: 'SECURE',
    position: { x: 80, y: 22 },
    connections: ['firewall', 'web_server', 'app_server', 'database'],
    compromiseLevel: 0,
    maxCompromise: 3,
    defenses: ['encryption'],
    isCritical: false
  },
  {
    id: 'endpoint',
    type: 'ENDPOINT',
    name: 'ENDPOINT',
    status: 'SECURE',
    position: { x: 15, y: 38 },
    connections: ['firewall'],
    compromiseLevel: 0,
    maxCompromise: 3,
    defenses: ['edr'],
    isCritical: false
  }
];

export function createNetwork(): NetworkNode[] {
  return JSON.parse(JSON.stringify(INITIAL_NETWORK));
}

export function getNode(network: NetworkNode[], id: string): NetworkNode | undefined {
  return network.find(n => n.id === id);
}

export function getConnectedNodes(network: NetworkNode[], nodeId: string): NetworkNode[] {
  const node = getNode(network, nodeId);
  if (!node) return [];
  return node.connections.map(id => getNode(network, id)!).filter(Boolean);
}

export function getNodeStatusColor(status: NodeStatus): string {
  switch (status) {
    case 'SECURE': return '#00ff88';
    case 'SCANNED': return '#00aaff';
    case 'VULNERABLE': return '#ffaa00';
    case 'COMPROMISED': return '#ff0040';
    case 'ISOLATED': return '#aa00ff';
    case 'OFFLINE': return '#666666';
  }
}

export function getNodeStatusLabel(status: NodeStatus): string {
  switch (status) {
    case 'SECURE': return '🟢 SECURE';
    case 'SCANNED': return '🔵 SCANNED';
    case 'VULNERABLE': return '🟡 VULNERABLE';
    case 'COMPROMISED': return '🔴 COMPROMISED';
    case 'ISOLATED': return '🟣 ISOLATED';
    case 'OFFLINE': return '⚫ OFFLINE';
  }
}