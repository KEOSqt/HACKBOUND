export type Team = 'RED' | 'BLUE';
export type GamePhase = 'MAIN_MENU' | 'GAME_SETUP' | 'TUTORIAL' | 'RED_TURN' | 'BLUE_TURN' | 'RESPONSE_WINDOW' | 'CARD_RESOLUTION' | 'GAME_OVER';
export type CardCategory = 
  | 'RECONNAISSANCE' 
  | 'INITIAL_ACCESS' 
  | 'EXPLOITATION' 
  | 'PRIVILEGE_ESCALATION' 
  | 'LATERAL_MOVEMENT' 
  | 'IMPACT'
  | 'PREVENTION' 
  | 'DETECTION' 
  | 'RESPONSE' 
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
  type: 'NODE_STATUS' | 'NODE_COMPROMISED' | 'HAS_CARD' | 'ENERGY_MIN' | 'TURN_MIN';
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
}

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