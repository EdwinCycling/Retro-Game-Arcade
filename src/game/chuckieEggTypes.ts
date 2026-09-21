/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Chuckie Egg (BBC Micro / A&F Software 1983) Types
 */

export type ChuckieEggGameState = 'TITLE' | 'PLAYING' | 'DYING' | 'LEVEL_CLEAR' | 'GAME_OVER';

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

export interface Platform {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Ladder {
  x: number;
  y: number;
  height: number;
  width: number;
}

export interface Lift {
  id: number;
  x: number;
  y: number;
  minY: number;
  maxY: number;
  width: number;
  height: number;
  speed: number;
  dir: 1 | -1; // 1 = down, -1 = up
}

export interface EggItem {
  id: number;
  x: number;
  y: number;
  collected: boolean;
}

export interface GrainItem {
  id: number;
  x: number;
  y: number;
  collected: boolean;
}

export interface DuckEnemy {
  id: number;
  x: number;
  y: number;
  vx: number;
  facingLeft: boolean;
  platformIndex: number;
  animFrame: number;
  isJumping: boolean;
}

export interface HarryState {
  x: number;
  y: number;
  vx: number;
  vy: number;
  isGrounded: boolean;
  isOnLadder: boolean;
  isJumping: boolean;
  facingLeft: boolean;
  animFrame: number;
  onLiftId: number | null;
}

export interface LevelConfig {
  id: number;
  name: string;
  bonusStart: number;
  platforms: Platform[];
  ladders: Ladder[];
  lifts: Lift[];
  eggs: Point[];
  grains: Point[];
  ducks: { x: number; y: number; platformIndex: number; speed: number }[];
  cagedDuck: { x: number; y: number };
}
