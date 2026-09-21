export type TileType =
  | 'empty'
  | 'earth'
  | 'wall'
  | 'boulder'
  | 'diamond'
  | 'egg'
  | 'monster'
  | 'key'
  | 'safe'
  | 'transporter';

export type Direction = 'up' | 'down' | 'left' | 'right' | 'none';

export interface Position {
  x: number;
  y: number;
}

export interface MonsterEntity {
  id: number;
  x: number;
  y: number;
  direction: 'up' | 'down' | 'left' | 'right';
  animFrame: number;
  moveTimer: number;
}

export interface FallingBoulder {
  x: number;
  y: number;
  fallProgress: number; // 0 to 1
  isFalling: boolean;
  rollDir?: 'left' | 'right';
}

export interface ReptonLevel {
  id: string;
  name: string;
  letter: string;
  password: string;
  width: number;
  height: number;
  map: string[];
  timeLimit: number; // in seconds
  description: string;
}

export interface ReptonScoreEntry {
  initials: string;
  score: number;
  levelLetter: string;
  diamonds: number;
  date: string;
}

export interface ReptonGameState {
  levelIndex: number;
  grid: TileType[][];
  width: number;
  height: number;
  reptonPos: Position;
  reptonVisualPos: { x: number; y: number };
  reptonDir: Direction;
  reptonMoving: boolean;
  reptonAnimFrame: number;
  
  score: number;
  lives: number;
  diamondsRemaining: number;
  totalDiamonds: number;
  timeLeft: number;
  hasKey: boolean;
  safesCount: number;

  monsters: MonsterEntity[];
  fallingBoulders: Map<string, { fallSpeed: number; falling: boolean }>;

  isGameOver: boolean;
  isLevelComplete: boolean;
  isPaused: boolean;
  deathReason?: 'crushed' | 'monster' | 'time' | 'stuck';
}
