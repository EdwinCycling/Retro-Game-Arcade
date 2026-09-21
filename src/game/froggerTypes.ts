/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Frogger (Atari 2600 / Arcade 1981-1982) Types
 */

export type FroggerGameState = 'TITLE' | 'PLAYING' | 'HOPPING' | 'DYING' | 'HOME_REACHED' | 'LEVEL_CLEARED' | 'GAME_OVER';

export type LaneDirection = 'LEFT' | 'RIGHT';

export type LaneType = 
  | 'SAFE'
  | 'ROAD_CAR_1'
  | 'ROAD_TRACTOR'
  | 'ROAD_CAR_2'
  | 'ROAD_RACECAR'
  | 'ROAD_TRUCK'
  | 'RIVER_TURTLES_3'
  | 'RIVER_LOG_SHORT'
  | 'RIVER_LOG_LONG'
  | 'RIVER_TURTLES_2'
  | 'RIVER_LOG_MED';

export interface RiverObstacle {
  x: number;
  width: number;
  type: 'log_short' | 'log_med' | 'log_long' | 'turtles_2' | 'turtles_3' | 'croc';
  isDiving?: boolean;
  diveState?: number; // 0 = surfaced, 1 = warning, 2 = submerged
  hasLadyFrog?: boolean;
}

export interface RoadObstacle {
  x: number;
  width: number;
  type: 'car_pink' | 'racecar' | 'car_yellow' | 'tractor' | 'truck';
}

export interface Lane {
  row: number; // 0 to 12
  y: number;
  speed: number; // positive = right, negative = left
  type: LaneType;
  items: (RiverObstacle | RoadObstacle)[];
}

export interface HomeBay {
  index: number;
  x: number;
  isFilled: boolean;
  hasFly: boolean;
  flyTimer: number;
  hasCroc: boolean;
  crocTimer: number;
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
