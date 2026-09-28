import type { NetworkNodeType } from '../game/types';

/** Base topology positions, in percent of battlefield width/height. */
export const POS: Record<string, { x: number; y: number }> = {
  internet: { x: 50, y: 9 },
  firewall: { x: 50, y: 24 },
  web_server: { x: 24, y: 46 },
  app_server: { x: 50, y: 46 },
  database: { x: 76, y: 46 },
  endpoint: { x: 24, y: 74 },
  monitoring: { x: 50, y: 74 },
  auth_server: { x: 76, y: 74 },
  sensitive_data: { x: 50, y: 90 },
};

export const LABELS: Record<NetworkNodeType, string> = {
  INTERNET: 'INTERNET', FIREWALL: 'FIREWALL', WEB_SERVER: 'WEB SERVER', APP_SERVER: 'APP SERVER',
  AUTH_SERVER: 'AUTH SERVER', DATABASE: 'DATABASE', SENSITIVE_DATA: 'SENSITIVE DATA', MONITORING: 'INTERNAL SERVER', ENDPOINT: 'ENDPOINTS',
};

// Reserve bottom-edge slots for runtime-created nodes (e.g. Blue decoys) so
// they never stack on the center topology.
export const DECOY_SLOTS = [
  { x: 12, y: 90 }, { x: 26, y: 90 }, { x: 62, y: 90 }, { x: 88, y: 90 },
];

/** Stable bottom-edge slot for ids with no fixed position (never the center). */
export function slotFor(id: string): { x: number; y: number } {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return DECOY_SLOTS[h % DECOY_SLOTS.length];
}

/** Resolve any node id to a percent position. */
export function positionFor(id: string): { x: number; y: number } {
  return POS[id] || slotFor(id);
}
