/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * EINDELOOS (ENDLESS) - Radarsoft 1985 (Commodore 64) Types
 */

export interface Point {
  x: number;
  y: number;
}

export interface Helicopter {
  x: number; // World coordinates (in pixels, 0 to 8192)
  y: number; // World coordinates (in pixels, 0 to 4096)
  vx: number;
  vy: number;
  angle: number; // Facing direction in radians
  facingDir: 'left' | 'right' | 'up' | 'down' | 'up-left' | 'up-right' | 'down-left' | 'down-right';
  rotorFrame: number;
  isInvulnerable: boolean;
  invulnerableTimer: number;
}

export interface Rocket {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
}

export interface Enemy {
  id: number;
  x: number;
  y: number;
  type: 'skull' | 'mine' | 'morph';
  vx: number;
  vy: number;
  state: number;
  health: number;
  blinkTimer: number;
  isBlinking: boolean;
}

export interface EnergyBarrier {
  id: number;
  x: number;
  y: number;
  w: number;
  h: number;
  active: boolean;
  cycleTimer: number;
}

export interface MovingWall {
  id: number;
  x: number; // Base anchor x
  y: number; // Base anchor y
  w: number; // Width
  h: number; // Height
  dx: number; // Horizontal movement amplitude
  dy: number; // Vertical movement amplitude
  speed: number; // Oscillation speed / frequency
  phase: number; // Movement phase
  currentX: number; // Current calculated X
  currentY: number; // Current calculated Y
  type: 'stone_vertical' | 'stone_horizontal' | 'hydraulic_crusher' | 'key_gate';
  name: string;
  isUnlocked?: boolean;
  requiredKeyId?: number;
  retractProgress?: number; // 0 (closed) to 1 (fully open)
}

export interface Checkpoint {
  id: number;
  x: number;
  y: number;
  activated: boolean;
}

export interface MazeItem {
  id: number;
  x: number;
  y: number;
  type: 'key' | 'fuel' | 'powerup' | 'cross_boost' | 'energy_orb';
  collected: boolean;
  name: string;
  pulsePhase?: number;
}

export interface HeartBoss {
  x: number;
  y: number;
  health: number;
  maxHealth: number;
  pulsePhase: number;
  isDestroyed: boolean;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  alpha: number;
  life: number;
  maxLife: number;
}

export type EindeloosGameStatus = 'title' | 'playing' | 'checkpoint_activated' | 'crashed' | 'game_over' | 'victory';

export interface EindeloosGameState {
  status: EindeloosGameStatus;
  helicopter: Helicopter;
  lives: number; // Starts at 14!
  score: number;
  fuel: number; // 0 to 100
  keysCollected: number;
  activeCheckpoint: Point;
  rockets: Rocket[];
  enemies: Enemy[];
  barriers: EnergyBarrier[];
  movingWalls: MovingWall[];
  checkpoints: Checkpoint[];
  items: MazeItem[];
  heart: HeartBoss;
  particles: Particle[];
  mapWidth: number; // 8192
  mapHeight: number; // 4096
  visitedSectors: boolean[]; // 16x16 grid of discovered areas
  exploredPercent: number;
  radarMode: 'mini' | 'fullscreen' | 'off';
  message: string;
  messageTimer: number;
}
