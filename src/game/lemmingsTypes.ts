/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Lemmings (1991 DMA Design / Psygnosis / C64 / Amiga) - Types
 */

export type LemmingSkill =
  | 'climber'
  | 'floater'
  | 'bomber'
  | 'blocker'
  | 'builder'
  | 'basher'
  | 'miner'
  | 'digger';

export type LemmingAction =
  | 'faller'
  | 'walker'
  | 'climber'
  | 'floater'
  | 'bomber'
  | 'blocker'
  | 'builder'
  | 'basher'
  | 'miner'
  | 'digger'
  | 'splatter'
  | 'drowner'
  | 'exiter'
  | 'dead';

export interface Lemming {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  direction: 1 | -1; // 1 = right, -1 = left
  action: LemmingAction;
  isClimber: boolean;
  isFloater: boolean;
  isPermanentClimber: boolean;
  isPermanentFloater: boolean;
  fallDistance: number;
  bombCountdown: number | null; // seconds remaining e.g. 5..4..3..2..1..0
  bombTimer: number; // internal tick counter
  builderBricks: number; // 0..12
  builderDelay: number;
  digDelay: number;
  bashDelay: number;
  mineDelay: number;
  climbProgress: number;
  frame: number;
  animTimer: number;
  selected: boolean;
  splatTimer: number;
  exitTimer: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  life: number;
  maxLife: number;
  gravity?: number;
}

export interface FloatingText {
  id: number;
  x: number;
  y: number;
  text: string;
  color: string;
  life: number;
  maxLife: number;
  vy: number;
}

export interface SkillInventory {
  climber: number;
  floater: number;
  bomber: number;
  blocker: number;
  builder: number;
  basher: number;
  miner: number;
  digger: number;
}

export type TerrainMaterial = 'dirt' | 'stone' | 'steel' | 'wood' | 'water' | 'acid' | 'crystal';

export interface TerrainElement {
  type: 'rect' | 'circle' | 'polygon' | 'pillar' | 'bridge' | 'arch';
  material: TerrainMaterial;
  x: number;
  y: number;
  w?: number;
  h?: number;
  r?: number;
  points?: Array<[number, number]>;
  color?: string;
  texture?: 'moss' | 'brick' | 'steel' | 'dirt' | 'crystal';
}

export interface LemmingsLevel {
  id: string;
  category: 'fun' | 'tricky' | 'taxing' | 'mayhem';
  number: number;
  title: string;
  subtitle: string;
  lemmingCount: number;
  toSave: number; // Required percentage (0-100)
  releaseRate: number; // 1 to 99
  timeLimit: number; // seconds (e.g. 300 = 5 mins)
  width: number;
  height: number;
  spawnX: number;
  spawnY: number;
  exitX: number;
  exitY: number;
  theme: 'dirt' | 'crystal' | 'hell' | 'brick' | 'snow';
  skills: SkillInventory;
  elements: TerrainElement[];
  hazardY?: number; // Level floor water/acid hazard height
  hazardType?: 'water' | 'acid' | 'lava';
}

export interface LemmingsScore {
  id: string;
  initials: string;
  score: number;
  levelTitle: string;
  savedCount: number;
  totalCount: number;
  savedPercent: number;
  date: string;
}

export interface GameStats {
  level: LemmingsLevel;
  state: 'INTRO' | 'PLAYING' | 'PAUSED' | 'WON' | 'LOST';
  lemmingsOut: number;
  lemmingsIn: number;
  lemmingsAlive: number;
  lemmingsDead: number;
  timeRemaining: number;
  releaseRate: number;
  minReleaseRate: number;
  activeSkill: LemmingSkill | null;
  skills: SkillInventory;
  fastForward: boolean;
  speedMultiplier: number;
  nukeActive: boolean;
  score: number;
  viewportX: number;
  viewportY: number;
}
