/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Tetris (Alexey Pajitnov / 1984 Elektronika 60 & 1989 Arcade) Game Types
 */

export type TetrominoType = 'I' | 'O' | 'T' | 'S' | 'Z' | 'J' | 'L';

export type TetrisGameState = 'TITLE' | 'PLAYING' | 'PAUSED' | 'LINE_CLEAR' | 'GAME_OVER';

export interface TetrominoDefinition {
  type: TetrominoType;
  color: string;
  glowColor: string;
  shadowColor: string;
  shapes: number[][][]; // 4 rotations, each a square matrix
}

export interface ActivePiece {
  type: TetrominoType;
  rotation: number; // 0, 1, 2, 3
  x: number; // grid col (0..BOARD_COLS-1)
  y: number; // grid row (can be negative during spawn)
}

export interface CellColor {
  type: TetrominoType;
  color: string;
  glowColor: string;
  shadowColor: string;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  alpha: number;
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
  alpha: number;
  scale: number;
  duration: number;
  elapsed: number;
}

export interface TetrisHighScore {
  initials: string;
  score: number;
  lines: number;
  level: number;
  date: string;
}

export const BOARD_COLS = 10;
export const BOARD_ROWS = 20;
export const BUFFER_ROWS = 2; // invisible spawn rows
export const TOTAL_ROWS = BOARD_ROWS + BUFFER_ROWS;

export const CANVAS_WIDTH = 480;
export const CANVAS_HEIGHT = 640;
