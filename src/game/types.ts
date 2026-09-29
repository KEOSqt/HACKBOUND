export type Team = 'RED' | 'BLUE';
export type GamePhase = 'MAIN_MENU' | 'GAME_SETUP' | 'TUTORIAL' | 'RED_TURN' | 'BLUE_TURN' | 'RESPONSE_WINDOW' | 'CARD_RESOLUTION' | 'GAME_OVER';
export type CardCategory =
  | 'RECON'
  | 'INITIAL_ACCESS'
  | 'EXPLOIT'
  | 'PRIVILEGE_ESCALATION'
  | 'LATERAL_MOVEMENT'
  | 'PERSISTENCE'
  | 'IMPACT'
  | 'EXFILTRATION'
  | 'PREVENTION'
  | 'DETECTION'
  | 'RESPONSE'
  | 'CONTAINMENT'
  | 'RECOVERY'
  | 'DECEPTION';
export type NetworkNodeType = 'INTERNET' | 'FIREWALL' | 'WEB_SERVER' | 'APP_SERVER' | 'AUTH_SERVER' | 'DATABASE' | 'SENSITIVE_DATA' | 'MONITORING' | 'ENDPOINT';
export type NodeStatus = 'SECURE' | 'SCANNED' | 'VULNERABLE' | 'COMPROMISED' | 'ISOLATED' | 'OFFLINE';
export type TargetType = 'NODE' | 'PLAYER' | 'CARD' | 'NONE';

export interface Card {
  id: string;
  name: string;
  team: Team;
  category: CardCategory;
  cost: number;
  description: string;
  educationalDescription: string;
  requirements?: Requirement[];
  effect: Effect;
  targetType: TargetType;
  icon: string;
  color: string;
}

export interface Requirement {
  type: 'NODE_STATUS' | 'NODE_COMPROMISED' | 'HAS_CARD' | 'ENERGY_MIN' | 'TURN_MIN' | 'NO_ACTIVE_BLOCK';
  nodeType?: NetworkNodeType;
  status?: NodeStatus;
  cardId?: string;
  value?: number;
}

export interface Effect {
  type: 'SCAN' | 'COMPROMISE' | 'EXFILTRATE' | 'BLOCK' | 'ISOLATE' | 'HEAL' | 'DRAW' | 'ENERGY' | 'DAMAGE' | 'REVEAL' | 'COUNTER' | 'DESTROY' | 'PATCH' | 'DECOY';
  target?: TargetType;
  nodeType?: NetworkNodeType;
  value?: number;
  /** HP damage dealt to the opposing team when this effect resolves. */
  damage?: number;
  /** EXFILTRATE only: grants +1 Data Token to RED on success. */
  grantsToken?: boolean;
  duration?: number;
  chainable?: boolean;
  description: string;
}

export interface NetworkNode {
  id: string;
  type: NetworkNodeType;
  name: string;
  status: NodeStatus;
  position: { x: number; y: number };
  connections: string[];
  compromiseLevel: number;
  maxCompromise: number;
  defenses: string[];
  isCritical: boolean;
}

export interface PlayerStats {
  successfulAttacks: number;
  systemsCompromised: number;
  dataStolen: number;
  attacksBlocked: number;
  systemsSecured: number;
  exfilBlocked: number;
}

export interface PlayerState {
  team: Team;
  deck: Card[];
  hand: Card[];
  discard: Card[];
  activeCards: Card[];
  energy: number;
  maxEnergy: number;
  networkIntegrity: number;
  score: number;
  hp: number;
  maxHp: number;
  /** RED only: successful data exfiltrations (0-3). */
  dataTokens: number;
  stats: PlayerStats;
}

export const MAX_DATA_TOKENS = 3;
export const MATCH_DURATION_MS = 6 * 60 * 1000;

export interface GameState {
  phase: GamePhase;
  currentTurn: Team;
  turnNumber: number;
  redPlayer: PlayerState;
  bluePlayer: PlayerState;
  network: NetworkNode[];
  responseChain: ChainLink[];
  responseWindowActive: boolean;
  responseWindowTimer: number;
  winner: Team | null;
  winReason: string | null;
  /** Once-per-turn discard-to-draw already used this turn. */
  cycledThisTurn: boolean;
  timeLeftMs: number;
  matchDurationMs: number;
  timerRunning: boolean;
  log: LogEntry[];
  selectedCard: Card | null;
  validTargets: string[];
  tutorialStep: number;
  showTutorial: boolean;
  soundEnabled: boolean;
  reducedMotion: boolean;
}

export interface ChainLink {
  id: string;
  card: Card;
  player: Team;
  targetId: string;
  timestamp: number;
  resolved: boolean;
}

export interface LogEntry {
  id: string;
  timestamp: number;
  team: Team;
  message: string;
  type: 'action' | 'defense' | 'compromise' | 'win' | 'info';
}