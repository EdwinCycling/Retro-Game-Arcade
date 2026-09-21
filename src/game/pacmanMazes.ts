/**
 * Authentic Pac-Man & Ms. Pac-Man Maze Layouts and Color Profiles
 */
import { FruitType, TileCoord } from '../types';

export interface MazeDefinition {
  id: string;
  name: string;
  subtitle: string;
  wallColor: string;
  wallOutlineColor?: string;
  dotColor: string;
  energizerColor: string;
  tunnelRows: number[]; // row indices with side wrap-around tunnels
  pacmanStart: TileCoord;
  ghostHouseDoor: TileCoord;
  fruitType: FruitType;
  fruitPoints: number;
  grid: string[];
}

// 1. Classic 1980 Pac-Man Maze (1 Central Warp Tunnel)
export const CLASSIC_MAZE_GRID = [
  "WWWWWWWWWWWWWWWWWWWWWWWWWWWW", // 0
  "W............WW............W", // 1
  "W.WWWW.WWWWW.WW.WWWWW.WWWW.W", // 2
  "WoWWWW.WWWWW.WW.WWWWW.WWWWoW", // 3
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
  "Wo..WW................WW..oW", // 23
  "WWW.WW.WW.WWWWWWWW.WW.WW.WWW", // 24
  "WWW.WW.WW.WWWWWWWW.WW.WW.WWW", // 25
  "W......WW....WW....WW......W", // 26
  "W.WWWWWWWWWW.WW.WWWWWWWWWW.W", // 27
  "W.WWWWWWWWWW.WW.WWWWWWWWWW.W", // 28
  "W..........................W", // 29
  "WWWWWWWWWWWWWWWWWWWWWWWWWWWW", // 30
];

// 2. Ms. Pac-Man Maze 1 (Pink / Sky Blue, 2 Tunnels at rows 10 and 20)
export const MS_PACMAN_MAZE_1 = [
  "WWWWWWWWWWWWWWWWWWWWWWWWWWWW", // 0
  "W............WW............W", // 1
  "W.WWWW.WWWWW.WW.WWWWW.WWWW.W", // 2
  "WoWWWW.WWWWW.WW.WWWWW.WWWWoW", // 3
  "W.WWWW.WWWWW.WW.WWWWW.WWWW.W", // 4
  "W..........................W", // 5
  "W.WWWW.WW.WWWWWWWW.WW.WWWW.W", // 6
  "W.WWWW.WW.WWWWWWWW.WW.WWWW.W", // 7
  "W......WW....WW....WW......W", // 8
  "WWWWWW.WWWWW.WW.WWWWW.WWWWWW", // 9
  "======.WW          WW.======", // 10 (Upper Tunnel)
  "WWWWWW.WW WWW--WWW WW.WWWWWW", // 11
  "     W.WW WGGGGGGW WW.W     ", // 12
  "     W.WW WGGGGGGW WW.W     ", // 13
  "     W.   WGGGGGGW   .W     ", // 14
  "     W.WW WWWWWWWW WW.W     ", // 15
  "     W.WW          WW.W     ", // 16
  "     W.WW WWWWWWWW WW.W     ", // 17
  "WWWWWW.WW.WWWWWWWW.WW.WWWWWW", // 18
  "W............WW............W", // 19
  "======.WWWWW.WW.WWWWW.======", // 20 (Lower Tunnel)
  "WWWWWW.WWWWW.WW.WWWWW.WWWWWW", // 21
  "W.WWWW.WWWWW.WW.WWWWW.WWWW.W", // 22
  "Wo..WW................WW..oW", // 23
  "WWW.WW.WW.WWWWWWWW.WW.WW.WWW", // 24
  "WWW.WW.WW.WWWWWWWW.WW.WW.WWW", // 25
  "W......WW....WW....WW......W", // 26
  "W.WWWWWWWWWW.WW.WWWWWWWWWW.W", // 27
  "W.WWWWWWWWWW.WW.WWWWWWWWWW.W", // 28
  "W..........................W", // 29
  "WWWWWWWWWWWWWWWWWWWWWWWWWWWW", // 30
];

// 3. Ms. Pac-Man Maze 2 (Light Blue / Orange, 3 Tunnels at rows 4, 14, 24)
export const MS_PACMAN_MAZE_2 = [
  "WWWWWWWWWWWWWWWWWWWWWWWWWWWW", // 0
  "W............WW............W", // 1
  "W.WWWW.WWWWW.WW.WWWWW.WWWW.W", // 2
  "WoWWWW.WWWWW.WW.WWWWW.WWWWoW", // 3
  "======.WWWWW....WWWWW.======", // 4 (Top Tunnel)
  "WWWWWW.WWWWW.WW.WWWWW.WWWWWW", // 5
  "W............WW............W", // 6
  "W.WWWW.WW.WWWWWWWW.WW.WWWW.W", // 7
  "W.WWWW.WW.WWWWWWWW.WW.WWWW.W", // 8
  "W......WW....WW....WW......W", // 9
  "WWWWWW.WWWWW WW WWWWW.WWWWWW", // 10
  "     W.WW          WW.W     ", // 11
  "     W.WW WWW--WWW WW.W     ", // 12
  "     W.WW WGGGGGGW WW.W     ", // 13
  "======.   WGGGGGGW   .======", // 14 (Mid Tunnel)
  "     W.WW WGGGGGGW WW.W     ", // 15
  "     W.WW WWWWWWWW WW.W     ", // 16
  "     W.WW          WW.W     ", // 17
  "WWWWWW.WW WWWWWWWW WW.WWWWWW", // 18
  "W............WW............W", // 19
  "W.WWWW.WWWWW.WW.WWWWW.WWWW.W", // 20
  "W.WWWW.WWWWW.WW.WWWWW.WWWW.W", // 21
  "W...WW................WW...W", // 22
  "Wo..WW.WW.WWWWWWWW.WW.WW..oW", // 23
  "======.WW.WWWWWWWW.WW.======", // 24 (Bottom Tunnel)
  "WWWWWW.WW.WWWWWWWW.WW.WWWWWW", // 25
  "W......WW....WW....WW......W", // 26
  "W.WWWWWWWWWW.WW.WWWWWWWWWW.W", // 27
  "W.WWWWWWWWWW.WW.WWWWWWWWWW.W", // 28
  "W..........................W", // 29
  "WWWWWWWWWWWWWWWWWWWWWWWWWWWW", // 30
];

// 4. Ms. Pac-Man Maze 3 (Wine Red / Golden Brown, 2 Tunnels at rows 10 & 20)
export const MS_PACMAN_MAZE_3 = [
  "WWWWWWWWWWWWWWWWWWWWWWWWWWWW", // 0
  "W............WW............W", // 1
  "W.WW.WWWWWWW.WW.WWWWWWW.WW.W", // 2
  "WoWW.WWWWWWW.WW.WWWWWWW.WWoW", // 3
  "W.WW....................WW.W", // 4
  "W.WW.WW.WWWWWWWWWWWW.WW.WW.W", // 5
  "W....WW.WWWWWWWWWWWW.WW....W", // 6
  "WWWW.WW......WW......WW.WWWW", // 7
  "WWWW.WWWWWWW.WW.WWWWWWW.WWWW", // 8
  "WWWW.WWWWWWW.WW.WWWWWWW.WWWW", // 9
  "======.......  ........======", // 10 (Upper Tunnel)
  "WWWW.WWWW WWW--WWW WWWW.WWWW", // 11
  "WWWW.WWWW WGGGGGGW WWWW.WWWW", // 12
  "     WWWW WGGGGGGW WWWW     ", // 13
  "     WWWW WGGGGGGW WWWW     ", // 14
  "     WWWW WWWWWWWW WWWW     ", // 15
  "WWWW.WWWW          WWWW.WWWW", // 16
  "WWWW.WWWW WWWWWWWW WWWW.WWWW", // 17
  "WWWW.WWWW.WWWWWWWW.WWWW.WWWW", // 18
  "W............WW............W", // 19
  "======.WWWWW.WW.WWWWW.======", // 20 (Lower Tunnel)
  "WWWWWW.WWWWW.WW.WWWWW.WWWWWW", // 21
  "W............WW............W", // 22
  "WoWW.WWWWWWW....WWWWWWW.WWoW", // 23
  "W.WW.WWWWWWW.WW.WWWWWWW.WW.W", // 24
  "W.WW.........WW.........WW.W", // 25
  "W.WWWWWWWWWW.WW.WWWWWWWWWW.W", // 26
  "W.WWWWWWWWWW.WW.WWWWWWWWWW.W", // 27
  "W..........................W", // 28
  "WWWWWWWWWWWWWWWWWWWWWWWWWWWW", // 29
  "WWWWWWWWWWWWWWWWWWWWWWWWWWWW", // 30
];

// 5. Ms. Pac-Man Maze 4 (Navy Blue / Bright Yellow, 2 Tunnels at rows 12 & 18)
export const MS_PACMAN_MAZE_4 = [
  "WWWWWWWWWWWWWWWWWWWWWWWWWWWW", // 0
  "W............WW............W", // 1
  "W.WWWWWWWWWW.WW.WWWWWWWWWW.W", // 2
  "WoWWWWWWWWWW.WW.WWWWWWWWWWoW", // 3
  "W............WW............W", // 4
  "W.WWWW.WWWWWWWWWWWW.WWWW.W",   // 5
  "W.WWWW.WWWWWWWWWWWW.WWWW.W",   // 6
  "W......WW....WW....WW......W", // 7
  "WWWWWW.WWWWW.WW.WWWWW.WWWWWW", // 8
  "WWWWWW.WW          WW.WWWWWW", // 9
  "     W.WW.WWWWWWWW.WW.W     ", // 10
  "     W.WW WWW--WWW WW.W     ", // 11
  "======.WW WGGGGGGW WW.======", // 12 (Upper Tunnel)
  "     W.WW WGGGGGGW WW.W     ", // 13
  "     W.   WGGGGGGW   .W     ", // 14
  "     W.WW WWWWWWWW WW.W     ", // 15
  "     W.WW          WW.W     ", // 16
  "     W.WW WWWWWWWW WW.W     ", // 17
  "======.WW.WWWWWWWW.WW.======", // 18 (Lower Tunnel)
  "WWWWWW.WW..........WW.WWWWWW", // 19
  "W............WW............W", // 20
  "W.WWWWWWWWWW.WW.WWWWWWWWWW.W", // 21
  "W.WWWWWWWWWW.WW.WWWWWWWWWW.W", // 22
  "Wo..WW................WW..oW", // 23
  "WWW.WW.WW.WWWWWWWW.WW.WW.WWW", // 24
  "WWW.WW.WW.WWWWWWWW.WW.WW.WWW", // 25
  "W......WW....WW....WW......W", // 26
  "W.WWWWWWWWWW.WW.WWWWWWWWWW.W", // 27
  "W.WWWWWWWWWW.WW.WWWWWWWWWW.W", // 28
  "W..........................W", // 29
  "WWWWWWWWWWWWWWWWWWWWWWWWWWWW", // 30
];

export const MAZE_DEFINITIONS: MazeDefinition[] = [
  {
    id: 'classic',
    name: '1980 CLASSIC PAC-MAN',
    subtitle: 'Origineel Namco Doolhof (1 Warp Tunnel)',
    wallColor: '#2563eb', // Neon Electric Blue
    dotColor: '#ffb8ae',
    energizerColor: '#ffb8ae',
    tunnelRows: [14],
    pacmanStart: { x: 13, y: 23 },
    ghostHouseDoor: { x: 13, y: 12 },
    fruitType: 'CHERRY',
    fruitPoints: 100,
    grid: CLASSIC_MAZE_GRID,
  },
  {
    id: 'ms_maze1',
    name: 'MS. PAC-MAN: MAZE 1 (ROZE)',
    subtitle: 'Niveaus 1-2 • Dubbele Warp Tunnels',
    wallColor: '#ec4899', // Pink
    dotColor: '#ffffff',
    energizerColor: '#ffffff',
    tunnelRows: [10, 20],
    pacmanStart: { x: 13, y: 23 },
    ghostHouseDoor: { x: 13, y: 11 },
    fruitType: 'CHERRY',
    fruitPoints: 100,
    grid: MS_PACMAN_MAZE_1,
  },
  {
    id: 'ms_maze2',
    name: 'MS. PAC-MAN: MAZE 2 (CYAAN)',
    subtitle: 'Niveaus 3-5 • 3 Warp Tunnels & Pretzel',
    wallColor: '#06b6d4', // Cyan
    dotColor: '#ffedd5',
    energizerColor: '#ffedd5',
    tunnelRows: [4, 14, 24],
    pacmanStart: { x: 13, y: 23 },
    ghostHouseDoor: { x: 13, y: 12 },
    fruitType: 'PRETZEL',
    fruitPoints: 700,
    grid: MS_PACMAN_MAZE_2,
  },
  {
    id: 'ms_maze3',
    name: 'MS. PAC-MAN: MAZE 3 (BRUIN-ROOD)',
    subtitle: 'Niveaus 6-9 • Peer & Banaan Bonussen',
    wallColor: '#b45309', // Amber Brown
    dotColor: '#fef08a',
    energizerColor: '#fef08a',
    tunnelRows: [10, 20],
    pacmanStart: { x: 13, y: 23 },
    ghostHouseDoor: { x: 13, y: 11 },
    fruitType: 'PEAR',
    fruitPoints: 2000,
    grid: MS_PACMAN_MAZE_3,
  },
  {
    id: 'ms_maze4',
    name: 'MS. PAC-MAN: MAZE 4 (MARINE-GEEL)',
    subtitle: 'Niveaus 10-13+ • Banaan & Hoge Snelheid',
    wallColor: '#1e3a8a', // Dark Navy Blue
    wallOutlineColor: '#facc15',
    dotColor: '#ffffff',
    energizerColor: '#ffffff',
    tunnelRows: [12, 18],
    pacmanStart: { x: 13, y: 23 },
    ghostHouseDoor: { x: 13, y: 11 },
    fruitType: 'BANANA',
    fruitPoints: 5000,
    grid: MS_PACMAN_MAZE_4,
  },
];
