/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * FRAK! (BBC Micro / Aardvark Software 1984 - Nick Pelling) Types
 */

export type FrakGameState = 'TITLE' | 'PLAYING' | 'DYING' | 'LEVEL_CLEAR' | 'GAME_OVER';

export interface Point {
  x: number;
  y: number;
}

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface FrakPlatformMoving {
  axis: 'x' | 'y';
  min: number;
  max: number;
  speed: number;
  dir: number; // 1 or -1
}

export interface FrakPlatform {
  x: number;
  y: number;
  width: number;
  height: number;
  label?: string;
  type?: 'solid' | 'log' | 'stone' | 'moving';
  moving?: FrakPlatformMoving;
}

export interface FrakClimbable {
  x: number;
  y: number;
  height: number;
  width: number;
  type: 'ladder' | 'rope' | 'chain';
}

export interface FrakKeyItem {
  id: number;
  x: number;
  y: number;
  collected: boolean;
}

export interface FrakLightBulb {
  id: number;
  x: number;
  y: number;
  collected: boolean;
}

export interface FrakDoor {
  x: number;
  y: number;
  width: number;
  height: number;
  isOpen: boolean;
}

export type EnemyType = 'scrubbly' | 'poglet' | 'hooter' | 'balloon' | 'dagger';

export interface FrakEnemy {
  id: number;
  type: EnemyType;
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  alive: boolean;
  facingLeft: boolean;
  animFrame: number;
  respawnTime?: number;
  patrolMinX?: number;
  patrolMaxX?: number;
}

export interface YoYoState {
  active: boolean;
  x: number;
  y: number;
  vx: number;
  dist: number;
  maxDist: number;
  returning: boolean;
  spinAngle: number;
}

export interface TroggState {
  x: number;
  y: number;
  vx: number;
  vy: number;
  isGrounded: boolean;
  isClimbing: boolean;
  climbType: 'ladder' | 'rope' | 'chain' | null;
  isJumping: boolean;
  facingLeft: boolean;
  animFrame: number;
  fallDistance: number;
  isSlidingOffEdge: boolean;
  slideDir: 1 | -1;
  yoYo: YoYoState;
}

export interface FrakLevelConfig {
  id: number;
  name: string;
  subtitle: string;
  timeLimit: number;
  spawnPoint: Point;
  door: FrakDoor;
  platforms: FrakPlatform[];
  climbables: FrakClimbable[];
  keys: Point[];
  bulbs: Point[];
  staticEnemies: {
    type: 'scrubbly' | 'poglet' | 'hooter';
    x: number;
    y: number;
    patrolMinX?: number;
    patrolMaxX?: number;
    vx?: number;
  }[];
  balloonSpawner: {
    enabled: boolean;
    interval: number;
    xCoords: number[];
  };
  daggerSpawner: {
    enabled: boolean;
    interval: number;
    startX: number[];
  };
}

export interface FrakHighScore {
  initials: string;
  score: number;
  level: number;
  date: string;
}
