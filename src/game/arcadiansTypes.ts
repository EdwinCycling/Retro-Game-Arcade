/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Arcadians (Acornsoft / Nick Pelling 1982 - BBC Micro Model B)
 * Type Definitions
 */

export type ArcadiansGameState =
  | 'TITLE'
  | 'PLAYING'
  | 'WAVE_CLEAR'
  | 'PLAYER_DYING'
  | 'GAME_OVER'
  | 'PAUSED';

export type AlienType = 'FLAGSHIP' | 'HORNET' | 'EMISSARY' | 'DRONE';

export type AlienState =
  | 'IN_FORMATION'
  | 'DIVING'
  | 'RETURNING'
  | 'DESTROYED';

export interface Alien {
  id: number;
  type: AlienType;
  row: number;
  col: number;
  // Base offset in formation relative to formation center
  formationOffsetX: number;
  formationOffsetY: number;
  // Current position
  x: number;
  y: number;
  vx: number;
  vy: number;
  angle: number; // in radians, for rotated diving sprite
  state: AlienState;
  animFrame: number;
  animTimer: number;
  // Dive path data
  pathProgress: number;
  pathDuration: number;
  startPoint: { x: number; y: number };
  controlPoint1: { x: number; y: number };
  controlPoint2: { x: number; y: number };
  targetPoint: { x: number; y: number };
  hasEscort?: boolean;
  escortLeaderId?: number;
  escortOffsetX?: number;
  escortOffsetY?: number;
  points: number;
  divingPoints: number;
}

export interface PlayerShip {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  isAlive: boolean;
  respawnTimer: number;
  invulnerableTimer: number;
}

export interface Bullet {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  active: boolean;
}

export interface AlienBullet {
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  active: boolean;
}

export interface Star {
  x: number;
  y: number;
  speed: number;
  color: string;
  size: number;
  twinkleTimer: number;
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
}

export interface FloatingText {
  id: number;
  text: string;
  x: number;
  y: number;
  color: string;
  life: number;
  maxLife: number;
}

export interface WaveConfig {
  waveNumber: number;
  title: string;
  starSpeed: number;
  formationSwaySpeed: number;
  formationSwayRange: number;
  diveIntervalMs: number;
  maxSimultaneousDivers: number;
  alienDiveSpeed: number;
  bulletFireChance: number;
  alienBulletSpeed: number;
  escortProbability: number; // 0 to 1
  scoreMultiplier: number;
  badgeType: 'single' | 'stripe5' | 'star10' | 'crown20';
}

export interface ArcadiansHighScore {
  initials: string;
  score: number;
  wave: number;
  date: string;
}
