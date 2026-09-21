/**
 * Type definitions for Classic Pac-Man Arcade
 */

export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT' | 'NONE';

export type GhostName = 'blinky' | 'pinky' | 'inky' | 'clyde';

export type GhostMode = 'SCATTER' | 'CHASE' | 'FRIGHTENED' | 'EATEN' | 'IN_HOUSE';

export type GameState = 
  | 'READY' 
  | 'PLAYING' 
  | 'PAUSED' 
  | 'PACMAN_DYING' 
  | 'LEVEL_CLEAR' 
  | 'GAME_OVER';

export type Difficulty = 'classic' | 'casual' | 'turbo';

export type FruitType = 
  | 'CHERRY' 
  | 'STRAWBERRY' 
  | 'PEACH' 
  | 'APPLE' 
  | 'MELON' 
  | 'GALAXIAN' 
  | 'BELL' 
  | 'KEY'
  | 'PRETZEL'
  | 'PEAR'
  | 'BANANA';

export interface TileCoord {
  x: number;
  y: number;
}

export interface PacmanEntity {
  x: number;
  y: number;
  tileX: number;
  tileY: number;
  dir: Direction;
  nextDir: Direction;
  speed: number;
  mouthAngle: number;
  mouthDir: number; // 1 for opening, -1 for closing
  deathProgress: number; // 0 to 1
  isDead: boolean;
}

export interface GhostEntity {
  name: GhostName;
  displayName: string;
  characterName: string;
  color: string;
  scatterColor: string;
  x: number;
  y: number;
  tileX: number;
  tileY: number;
  dir: Direction;
  targetTile: TileCoord;
  mode: GhostMode;
  speed: number;
  inHouse: boolean;
  houseExitDotLimit: number;
  animationFrame: number;
  frightenedFlash: boolean;
  reverseNextTile: boolean;
  scatterCorner: TileCoord;
}

export interface FruitBonus {
  type: FruitType;
  points: number;
  active: boolean;
  x: number;
  y: number;
  timer: number;
  eatenDisplayTimer: number;
}

export interface ScorePopup {
  id: string;
  text: string;
  x: number;
  y: number;
  color: string;
  timer: number;
}

export interface LevelConfig {
  levelNumber: number;
  fruit: FruitType;
  fruitPoints: number;
  pacmanSpeedNormal: number;
  pacmanSpeedDots: number;
  pacmanSpeedFrightened: number;
  ghostSpeedNormal: number;
  ghostSpeedTunnel: number;
  ghostSpeedFrightened: number;
  elroy1Dots: number;
  elroy1Speed: number;
  elroy2Dots: number;
  elroy2Speed: number;
  frightenedDurationSeconds: number;
  frightenedFlashes: number;
  scatterChaseWaves: { scatter: number; chase: number }[];
}

export interface HighScoreEntry {
  id: string;
  initials: string;
  score: number;
  level: number;
  difficulty: Difficulty;
  date: string;
}
