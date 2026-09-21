/**
 * Types and interfaces for Demon Attack (1982, Imagic / Atari 2600)
 */

export type DemonType = 'classic' | 'bird' | 'insect' | 'split_small';

export type GameState = 'READY' | 'PLAYING' | 'PLAYER_HIT' | 'WAVE_TRANSITION' | 'GAME_OVER';

export interface Demon {
  id: string;
  type: DemonType;
  x: number;
  y: number;
  width: number;
  height: number;
  vx: number;
  vy: number;
  baseY: number;
  color: string;
  wingFrame: number;
  wingTimer: number;
  points: number;
  canSplit: boolean;
  isSplitChild?: boolean;
  splitChildSide?: 'left' | 'right';
  isDiving?: boolean;
  diveTimer?: number;
  diveAngle?: number;
  diveTargetX?: number;
  diveSpeed?: number;
  diveProgress?: number;
  diveOriginX?: number;
  diveOriginY?: number;
  health: number;
  fireCooldown: number;
}

export interface PlayerCannon {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  isAlive: boolean;
  respawnTimer: number;
}

export interface LaserMissile {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
}

export interface DemonBomb {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  isGuided?: boolean;
  width: number;
  height: number;
}

export interface ExplosionParticle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  radius: number;
  alpha: number;
  decay: number;
}

export interface FloatingText {
  id: string;
  text: string;
  x: number;
  y: number;
  alpha: number;
  color: string;
  vy: number;
}

export interface DemonHighScore {
  initials: string;
  score: number;
  wave: number;
  date: string;
}

export interface WaveConfig {
  waveNumber: number;
  demonColor: string;
  groundColor: string;
  demonType: DemonType;
  canSplit: boolean;
  canDive: boolean;
  basePoints: number;
  splitPoints: number;
  divePoints: number;
  demonCount: number;
  fireIntervalMin: number;
  fireIntervalMax: number;
  demonSpeedX: number;
  guidedBombs: boolean;
  description: string;
}
