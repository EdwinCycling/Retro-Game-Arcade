/**
 * Impossible Mission Types & Interfaces
 * Commodore 64 / Epyx (1984)
 */

export type AgentState =
  | 'idle'
  | 'running'
  | 'jumping'
  | 'searching'
  | 'falling'
  | 'electrocuted'
  | 'riding_lift';

export interface Agent {
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  direction: 1 | -1; // 1 = right, -1 = left
  state: AgentState;
  frame: number;
  animTimer: number;
  flipAngle: number; // For the gymnastic 360-degree somersault!
  searchTimer: number;
  searchTarget: Furniture | null;
  currentPlatformId: string | null;
  ridingLiftId: string | null;
}

export type FurnitureType =
  | 'computer'
  | 'terminal'
  | 'console'
  | 'filing_cabinet'
  | 'desk'
  | 'safe'
  | 'water_cooler';

export interface Furniture {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: FurnitureType;
  searched: boolean;
  contentType: 'piece' | 'snooze' | 'reset_lift' | 'empty';
  pieceIndex?: number; // 0 to 35
}

export type RobotType = 'patrol' | 'chaser' | 'zapper' | 'dormant';

export interface Robot {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: RobotType;
  direction: 1 | -1;
  speed: number;
  platformY: number;
  minX: number;
  maxX: number;
  laserCharging: boolean;
  laserFiring: boolean;
  laserCooldown: number;
  laserBeam?: { x1: number; y1: number; x2: number; y2: number };
  snoozedTimer: number;
  animFrame: number;
}

export interface FloatingOrb {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  active: boolean;
}

export interface Platform {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  isLift?: boolean;
  liftAxis?: 'vertical' | 'horizontal';
  liftMin?: number;
  liftMax?: number;
  liftSpeed?: number;
  liftDir?: 1 | -1;
}

export interface RoomExit {
  x: number;
  y: number;
  width: number;
  height: number;
  targetShaftFloor: number;
}

export interface SecurityRoom {
  id: string;
  name: string;
  colorTheme: string; // C64 color code
  platforms: Platform[];
  furniture: Furniture[];
  robots: Robot[];
  orb?: FloatingOrb;
  entryX: number;
  entryY: number;
  exit: RoomExit;
}

export interface PuzzlePiece {
  id: number; // 0 to 35
  cardIndex: number; // 0 to 8 (9 total punch cards)
  slotIndex: number; // 0 to 3 (4 quadrants per punch card)
  rotation: 0 | 90 | 180 | 270;
  flipped: boolean;
  colorId: number; // 0 to 3
  found: boolean;
  placedInSlot: number | null; // null if in inventory
}

export interface PunchCard {
  id: number; // 0 to 8
  solved: boolean;
  slots: (PuzzlePiece | null)[];
}

export interface PocketComputerState {
  isOpen: boolean;
  activeTab: 'puzzle' | 'codes' | 'map';
  selectedPieceIndex: number | null;
  snoozePasscodes: number;
  liftResetPasscodes: number;
}

export type GameScreen =
  | 'shaft' // Central elevator shaft
  | 'room'  // Inside one of the subterranean rooms
  | 'elvin_lair' // Confrontation with Professor Elvin Atombender!
  | 'game_over'
  | 'victory';
