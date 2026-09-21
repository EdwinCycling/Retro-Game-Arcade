/**
 * Authentic 1980 Pac-Man Maze & Game Constants
 */
import { TileCoord } from '../types';

export const CANVAS_WIDTH = 448; // 28 tiles * 16px
export const CANVAS_HEIGHT = 576; // 36 tiles * 16px (31 maze rows + 3 top HUD rows + 2 bottom icon rows)
export const TILE_SIZE = 16;
export const MAZE_COLS = 28;
export const MAZE_ROWS = 31;
export const MAZE_Y_OFFSET = 3 * TILE_SIZE; // Top 3 rows reserved for 1UP / HIGH SCORE HUD

/**
 * 28x31 Original Arcade Maze Layout:
 * W = Wall
 * . = Dot (small pellet, 10 pts)
 * o = Energizer (Power Pellet, 50 pts)
 *   = Empty corridor (no dot)
 * G = Ghost house interior (pen)
 * - = Ghost house door (barrier)
 * = = Tunnel (slow zone + left/right screen warp)
 * P = Pac-Man starting point (no dot)
 */
export const ORIGINAL_MAZE_MAP = [
  "WWWWWWWWWWWWWWWWWWWWWWWWWWWW", // 0
  "W............WW............W", // 1
  "W.WWWW.WWWWW.WW.WWWWW.WWWW.W", // 2
  "WoWWWW.WWWWW.WW.WWWWW.WWWWoW", // 3 (Energizers at 1,3 and 26,3)
  "W.WWWW.WWWWW.WW.WWWWW.WWWW.W", // 4
  "W..........................W", // 5
  "W.WWWW.WW.WWWWWWWW.WW.WWWW.W", // 6
  "W.WWWW.WW.WWWWWWWW.WW.WWWW.W", // 7
  "W......WW....WW....WW......W", // 8
  "WWWWWW.WWWWW WW WWWWW.WWWWWW", // 9
  "     W.WWWWW WW WWWWW.W     ", // 10
  "     W.WW          WW.W     ", // 11
  "     W.WW WWW--WWW WW.W     ", // 12
  "WWWWWW.WW WGGGGGGW WW.WWWWWW", // 13
  "======.   WGGGGGGW   .======", // 14 (Tunnel)
  "WWWWWW.WW WGGGGGGW WW.WWWWWW", // 15
  "     W.WW WWWWWWWW WW.W     ", // 16
  "     W.WW          WW.W     ", // 17
  "     W.WW WWWWWWWW WW.W     ", // 18
  "WWWWWW.WW WWWWWWWW WW.WWWWWW", // 19
  "W............WW............W", // 20
  "W.WWWW.WWWWW.WW.WWWWW.WWWW.W", // 21
  "W.WWWW.WWWWW.WW.WWWWW.WWWW.W", // 22
  "Wo..WW................WW..oW", // 23 (Energizers at 1,23 and 26,23)
  "WWW.WW.WW.WWWWWWWW.WW.WW.WWW", // 24
  "WWW.WW.WW.WWWWWWWW.WW.WW.WWW", // 25
  "W......WW....WW....WW......W", // 26
  "W.WWWWWWWWWW.WW.WWWWWWWWWW.W", // 27
  "W.WWWWWWWWWW.WW.WWWWWWWWWW.W", // 28
  "W..........................W", // 29
  "WWWWWWWWWWWWWWWWWWWWWWWWWWWW", // 30
];

// Specific classic tile locations
export const PACMAN_START_POS = { x: 13 * TILE_SIZE + 8, y: 23 * TILE_SIZE + 8 + MAZE_Y_OFFSET };
export const PACMAN_START_TILE: TileCoord = { x: 13, y: 23 };

export const BLINKY_START_POS = { x: 13 * TILE_SIZE + 8, y: 11 * TILE_SIZE + 8 + MAZE_Y_OFFSET };
export const PINKY_START_POS = { x: 13 * TILE_SIZE + 8, y: 14 * TILE_SIZE + 8 + MAZE_Y_OFFSET };
export const INKY_START_POS = { x: 11 * TILE_SIZE + 8, y: 14 * TILE_SIZE + 8 + MAZE_Y_OFFSET };
export const CLYDE_START_POS = { x: 15 * TILE_SIZE + 8, y: 14 * TILE_SIZE + 8 + MAZE_Y_OFFSET };

export const GHOST_DOOR_TILE: TileCoord = { x: 13, y: 12 };
export const GHOST_REVIVE_TARGET: TileCoord = { x: 13, y: 11 };

// Scatter target corners (outside maze bounds per original game)
export const SCATTER_CORNERS: Record<string, TileCoord> = {
  blinky: { x: 25, y: -3 }, // Top-Right
  pinky: { x: 2, y: -3 },   // Top-Left
  inky: { x: 27, y: 34 },   // Bottom-Right
  clyde: { x: 0, y: 34 },   // Bottom-Left
};

// Intersection tiles where ghosts are forbidden from turning UP (Original arcade quirk)
export const FORBIDDEN_UP_TILES: TileCoord[] = [
  { x: 12, y: 11 },
  { x: 15, y: 11 },
  { x: 12, y: 23 },
  { x: 15, y: 23 }
];

// Fruit bonus location (directly below ghost house)
export const FRUIT_POS = { x: 13.5 * TILE_SIZE + 8, y: 17 * TILE_SIZE + 8 + MAZE_Y_OFFSET };

// Base speeds (pixels per frame at 60 FPS)
export const BASE_PIXELS_PER_FRAME = 1.35; // Standard arcade speed
