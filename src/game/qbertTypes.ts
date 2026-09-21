/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Q*bert Type Definitions (Acorn BBC Micro 1983 / Gottlieb 1982)
 */

export type Direction = 'UL' | 'UR' | 'DL' | 'DR';

export type DisplayPalette = 'authentic' | 'bbc_micro' | 'green' | 'amber';

export interface CubeData {
  row: number;
  col: number;
  state: number;        // 0: initial, 1: intermediate, 2: target
  targetState: number;  // 1 or 2 depending on round
  flashTimer: number;
}

export interface FlyingDisk {
  id: number;
  side: 'left' | 'right';
  row: number; // adjacent row
  col: number; // adjacent col
  x: number;
  y: number;
  active: boolean;
  isAscending: boolean;
  ascendProgress: number; // 0 to 1
}

export interface Ball {
  id: number;
  type: 'red' | 'green';
  row: number;
  col: number;
  visualX: number;
  visualY: number;
  isJumping: boolean;
  jumpProgress: number;
  jumpFromX: number;
  jumpFromY: number;
  jumpToX: number;
  jumpToY: number;
  jumpTimer: number;
}

export interface CoilyEnemy {
  row: number;
  col: number;
  visualX: number;
  visualY: number;
  isHatched: boolean;
  isJumping: boolean;
  jumpProgress: number;
  jumpFromX: number;
  jumpFromY: number;
  jumpToX: number;
  jumpToY: number;
  facing: Direction;
  active: boolean;
  jumpTimer: number;
  isFalling: boolean;
}

export interface QbertPlayer {
  row: number;
  col: number;
  visualX: number;
  visualY: number;
  isJumping: boolean;
  jumpProgress: number;
  jumpFromX: number;
  jumpFromY: number;
  jumpToX: number;
  jumpToY: number;
  facing: Direction;
  isAlive: boolean;
  isSwearing: boolean;
  swearTimer: number;
  swearText: string;
  isRidingDisk: boolean;
  diskId?: number;
  isFalling: boolean;
}

export type GameState = 'TITLE' | 'PLAYING' | 'PLAYER_HIT' | 'LEVEL_CLEAR' | 'GAMEOVER';

export interface HighScoreEntry {
  score: number;
  initials: string;
  date: string;
  levelReached: number;
}
