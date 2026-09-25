/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Lode Runner (Apple II, 1983 - Doug Smith / Brøderbund)
 * Authentic 6502 Logic & Physics Engine
 * Grid: 28 columns × 16 rows (280×192 Apple II Hi-Res equivalent)
 */

import { lodeRunnerAudio } from './lodeRunnerAudio';

export const COLS = 28;
export const ROWS = 16;
export const TILE_WIDTH = 10;
export const TILE_HEIGHT = 12;

export enum TileType {
  EMPTY = 0,
  BRICK = 1,
  SOLID = 2,
  LADDER = 3,
  ROPE = 4,
  FALSE_BRICK = 5,
  ESCAPE_LADDER = 6,
  GOLD = 7
}

export interface DugHole {
  col: number;
  row: number;
  timer: number;       // Counts down from HOLE_DURATION (seconds)
  maxTimer: number;
  trappedEnemyIndex: number | null;
}

export type ActorState = 
  | 'idle' 
  | 'run_left' 
  | 'run_right' 
  | 'climb_up' 
  | 'climb_down' 
  | 'climb_idle'
  | 'hang_left' 
  | 'hang_right' 
  | 'hang_idle'
  | 'fall' 
  | 'dig_left' 
  | 'dig_right';

export interface Player {
  x: number;          // Tile units (e.g. 1.0 = col 1)
  y: number;          // Tile units (e.g. 14.0 = row 14)
  state: ActorState;
  frame: number;
  digTimer: number;
  isDead: boolean;
}

export interface Enemy {
  id: number;
  x: number;
  y: number;
  spawnCol: number;
  spawnRow: number;
  state: ActorState;
  frame: number;
  isTrapped: boolean;
  trapTimer: number;
  hasGold: boolean;
  respawnTimer: number;
}

export interface LevelData {
  name: string;
  grid: number[][]; // ROWS x COLS
  playerSpawn: { col: number; row: number };
  enemySpawns: { col: number; row: number }[];
}

export class LodeRunnerEngine {
  public grid: number[][] = [];
  public originalGrid: number[][] = [];
  public dugHoles: DugHole[] = [];
  
  public player: Player = {
    x: 1,
    y: 14,
    state: 'idle',
    frame: 0,
    digTimer: 0,
    isDead: false
  };

  public enemies: Enemy[] = [];
  public goldCount: number = 0;
  public totalGold: number = 0;
  public escapeLadderRevealed: boolean = false;

  public score: number = 0;
  public highScore: number = 0;
  public lives: number = 5;
  public currentLevelIndex: number = 0;
  public maxLevels: number = 5;

  public isPaused: boolean = false;
  public isGameOver: boolean = false;
  public isLevelClear: boolean = false;
  public levelClearTimer: number = 0;

  private stepSoundTimer: number = 0;
  private animTimer: number = 0;

  // Level layouts (Authentic Apple II Lode Runner recreation)
  public static readonly LEVELS: LevelData[] = [
    // Level 1: Classic Apple II Level 1 (Doug Smith)
    {
      name: 'Level 1: The Bungeling Mines',
      playerSpawn: { col: 13, row: 14 },
      enemySpawns: [
        { col: 5, row: 2 },
        { col: 14, row: 2 },
        { col: 22, row: 2 }
      ],
      grid: [
        // Row 0
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        // Row 1 (Escape Ladder target at col 13)
        [0,0,0,0,0,0,0,0,0,0,0,0,0,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        // Row 2
        [0,0,0,0,7,0,0,0,0,0,0,0,0,6,0,0,0,0,0,0,0,0,0,7,0,0,0,0],
        // Row 3
        [0,0,0,1,1,1,1,1,3,1,1,1,1,6,1,1,1,1,3,1,1,1,1,1,0,0,0,0],
        // Row 4
        [0,0,0,0,0,0,0,0,3,0,0,0,0,6,0,0,0,0,3,0,0,0,0,0,0,0,0,0],
        // Row 5
        [0,0,7,0,0,0,0,0,3,4,4,4,4,6,4,4,4,4,3,0,0,0,0,0,7,0,0,0],
        // Row 6
        [0,1,1,1,1,3,1,1,1,1,1,0,0,6,0,0,1,1,1,1,1,3,1,1,1,1,0,0],
        // Row 7
        [0,0,0,0,0,3,0,0,0,0,0,0,0,6,0,0,0,0,0,0,0,3,0,0,0,0,0,0],
        // Row 8
        [0,0,0,0,0,3,4,4,4,4,4,4,4,6,4,4,4,4,4,4,4,3,0,0,0,0,0,0],
        // Row 9
        [0,0,0,1,1,1,1,1,3,1,1,1,1,1,1,1,1,1,3,1,1,1,1,1,0,0,0,0],
        // Row 10
        [0,0,0,0,0,0,0,0,3,0,0,0,7,0,0,7,0,0,3,0,0,0,0,0,0,0,0,0],
        // Row 11
        [0,0,7,0,0,0,0,0,3,0,1,1,1,1,1,1,1,0,3,0,0,0,0,0,7,0,0,0],
        // Row 12
        [1,1,1,1,1,3,1,1,1,1,0,0,0,0,0,0,0,0,1,1,1,1,3,1,1,1,1,1],
        // Row 13
        [0,0,0,0,0,3,0,0,0,0,0,0,7,0,0,7,0,0,0,0,0,0,3,0,0,0,0,0],
        // Row 14
        [0,0,0,0,0,3,0,0,0,0,1,1,1,1,1,1,1,1,0,0,0,0,3,0,0,0,0,0],
        // Row 15 (Floor - Solid concrete bottom)
        [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2]
      ]
    },
    // Level 2: The Terraced Pyramids & Hanging Ropes
    {
      name: 'Level 2: The Golden Terraces',
      playerSpawn: { col: 2, row: 14 },
      enemySpawns: [
        { col: 13, row: 3 },
        { col: 20, row: 5 },
        { col: 7, row: 7 }
      ],
      grid: [
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,7,0,6,0,7,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,1,1,1,1,6,1,1,1,1,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,7,0,0,0,0,3,6,3,0,0,0,0,7,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,1,1,1,1,0,0,3,6,3,0,0,1,1,1,1,0,0,0,0,0,0,0],
        [0,0,0,0,7,0,0,0,0,0,4,4,3,6,3,4,4,0,0,0,0,0,7,0,0,0,0,0],
        [0,0,0,1,1,1,1,0,0,0,0,0,3,6,3,0,0,0,0,0,1,1,1,1,0,0,0,0],
        [0,0,0,0,0,0,0,3,0,0,7,0,3,6,3,0,7,0,0,3,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,3,1,1,1,1,1,1,1,1,1,1,1,3,0,0,0,0,0,0,0,0],
        [0,0,0,7,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,7,0,0,0,0],
        [0,1,1,1,1,3,1,1,1,0,0,0,0,0,0,0,0,0,1,1,1,3,1,1,1,1,0,0],
        [0,0,0,0,0,3,0,0,0,4,4,4,4,4,4,4,4,4,0,0,0,3,0,0,0,0,0,0],
        [0,0,0,0,0,3,0,0,7,0,0,0,7,0,0,7,0,0,7,0,0,3,0,0,0,0,0,0],
        [0,0,0,0,0,3,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,3,0,0,0,0,0,0],
        [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2]
      ]
    },
    // Level 3: The High Altitude Tightrope Labyrinth
    {
      name: 'Level 3: The Sky Ropes',
      playerSpawn: { col: 1, row: 14 },
      enemySpawns: [
        { col: 10, row: 2 },
        { col: 18, row: 2 },
        { col: 25, row: 7 }
      ],
      grid: [
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,7,0,0,0,0,7,0,0,0,7,0,0,6,0,0,7,0,0,0,7,0,0,0,0,7,0,0],
        [1,1,1,1,3,1,1,1,1,3,1,1,1,6,1,1,1,3,1,1,1,1,3,1,1,1,1,0],
        [0,0,0,0,3,0,0,0,0,3,0,0,0,6,0,0,0,3,0,0,0,0,3,0,0,0,0,0],
        [4,4,4,4,3,4,4,4,4,3,4,4,4,6,4,4,4,3,4,4,4,4,3,4,4,4,4,4],
        [0,0,0,0,3,0,0,0,0,3,0,0,0,6,0,0,0,3,0,0,0,0,3,0,0,0,0,0],
        [0,0,7,0,3,0,0,7,0,3,0,0,7,6,7,0,0,3,0,7,0,0,3,0,7,0,0,0],
        [1,1,1,1,1,1,1,1,1,1,1,1,1,6,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        [0,0,0,0,3,0,0,0,0,0,0,0,0,6,0,0,0,0,0,0,0,0,3,0,0,0,0,0],
        [0,0,0,0,3,4,4,4,4,4,4,4,4,6,4,4,4,4,4,4,4,4,3,0,0,0,0,0],
        [0,0,0,0,3,0,0,0,0,0,0,0,0,6,0,0,0,0,0,0,0,0,3,0,0,0,0,0],
        [0,0,7,0,3,0,0,0,7,0,0,0,0,6,0,0,0,0,7,0,0,0,3,0,7,0,0,0],
        [1,1,1,1,1,1,3,1,1,1,1,1,1,1,1,1,1,1,1,3,1,1,1,1,1,1,1,1],
        [0,0,0,0,0,0,3,0,0,0,0,0,0,0,0,0,0,0,0,3,0,0,0,0,0,0,0,0],
        [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2]
      ]
    },
    // Level 4: The Bungeling Shafts & False Bricks
    {
      name: 'Level 4: The False Brick Shafts',
      playerSpawn: { col: 2, row: 14 },
      enemySpawns: [
        { col: 8, row: 3 },
        { col: 14, row: 3 },
        { col: 20, row: 3 }
      ],
      grid: [
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,7,0,0,0,0,7,0,0,0,0,7,6,7,0,0,0,0,7,0,0,0,0,7,0,0,0],
        [0,1,1,1,3,1,1,1,1,3,1,1,1,6,1,1,1,3,1,1,1,1,3,1,1,1,0,0],
        [0,0,0,0,3,0,0,0,0,3,0,0,0,6,0,0,0,3,0,0,0,0,3,0,0,0,0,0],
        [0,0,0,0,3,0,0,7,0,3,0,0,0,6,0,0,0,3,0,7,0,0,3,0,0,0,0,0],
        [0,0,1,1,1,1,1,1,1,1,1,1,1,6,1,1,1,1,1,1,1,1,1,1,1,0,0,0],
        [0,0,0,0,3,0,0,0,0,0,0,0,0,6,0,0,0,0,0,0,0,0,3,0,0,0,0,0],
        [0,0,0,0,3,4,4,4,4,4,4,4,4,6,4,4,4,4,4,4,4,4,3,0,0,0,0,0],
        [0,0,7,0,3,0,0,0,0,0,0,0,0,6,0,0,0,0,0,0,0,0,3,0,7,0,0,0],
        [0,1,1,1,1,1,5,1,1,1,1,5,1,1,1,5,1,1,1,1,5,1,1,1,1,1,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,7,0,0,0,7,0,0,0,7,0,6,0,7,0,0,0,7,0,0,0,7,0,0,0,0],
        [1,1,1,1,1,3,1,1,1,1,3,1,1,1,1,1,1,3,1,1,1,1,3,1,1,1,1,1],
        [0,0,0,0,0,3,0,0,0,0,3,0,0,0,0,0,0,3,0,0,0,0,3,0,0,0,0,0],
        [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2]
      ]
    },
    // Level 5: The Fortress Vault of Doug Smith
    {
      name: 'Level 5: The Master Vault',
      playerSpawn: { col: 13, row: 14 },
      enemySpawns: [
        { col: 3, row: 2 },
        { col: 24, row: 2 },
        { col: 7, row: 6 },
        { col: 20, row: 6 }
      ],
      grid: [
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,7,0,0,7,0,0,7,0,0,7,0,0,6,0,0,7,0,0,7,0,0,7,0,0,7,0,0],
        [1,1,3,1,1,3,1,1,3,1,1,3,1,6,1,3,1,1,3,1,1,3,1,1,3,1,1,0],
        [0,0,3,0,0,3,0,0,3,0,0,3,0,6,0,3,0,0,3,0,0,3,0,0,3,0,0,0],
        [4,4,3,4,4,3,4,4,3,4,4,3,4,6,4,3,4,4,3,4,4,3,4,4,3,4,4,4],
        [0,0,3,0,0,3,0,0,3,0,0,3,0,6,0,3,0,0,3,0,0,3,0,0,3,0,0,0],
        [0,0,3,1,1,1,1,1,1,1,1,1,1,6,1,1,1,1,1,1,1,1,1,1,3,0,0,0],
        [0,0,3,0,0,0,0,0,0,0,0,0,0,6,0,0,0,0,0,0,0,0,0,0,3,0,0,0],
        [0,7,3,0,7,0,0,7,0,0,7,0,0,6,0,0,7,0,0,7,0,0,7,0,3,7,0,0],
        [1,1,1,1,1,1,1,1,1,1,1,1,1,6,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        [0,0,0,0,0,0,0,0,3,0,0,0,0,6,0,0,0,0,3,0,0,0,0,0,0,0,0,0],
        [0,0,7,0,0,7,0,0,3,0,0,7,0,6,0,7,0,0,3,0,0,7,0,0,7,0,0,0],
        [1,1,1,1,1,1,1,1,3,1,1,1,1,1,1,1,1,1,3,1,1,1,1,1,1,1,1,1],
        [0,0,0,0,0,0,0,0,3,0,0,0,0,0,0,0,0,0,3,0,0,0,0,0,0,0,0,0],
        [2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2]
      ]
    }
  ];

  constructor(startingLevel: number = 0) {
    this.currentLevelIndex = Math.max(0, Math.min(startingLevel, LodeRunnerEngine.LEVELS.length - 1));
    this.loadHighScore();
    this.initLevel(this.currentLevelIndex);
  }

  private loadHighScore() {
    try {
      const saved = localStorage.getItem('arcade_vault_lode_runner_highscore');
      if (saved) {
        this.highScore = parseInt(saved, 10) || 0;
      }
    } catch {
      this.highScore = 0;
    }
  }

  private saveHighScore() {
    if (this.score > this.highScore) {
      this.highScore = this.score;
      try {
        localStorage.setItem('arcade_vault_lode_runner_highscore', this.highScore.toString());
      } catch {
        // storage fallback
      }
    }
  }

  public initLevel(levelIndex: number) {
    this.currentLevelIndex = levelIndex % LodeRunnerEngine.LEVELS.length;
    const level = LodeRunnerEngine.LEVELS[this.currentLevelIndex];

    // Deep copy grid
    this.grid = level.grid.map(row => [...row]);
    this.originalGrid = level.grid.map(row => [...row]);
    this.dugHoles = [];

    // Count gold
    this.goldCount = 0;
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (this.grid[r][c] === TileType.GOLD) {
          this.goldCount++;
        }
      }
    }
    this.totalGold = this.goldCount;
    this.escapeLadderRevealed = false;

    // Reset Player
    this.player = {
      x: level.playerSpawn.col,
      y: level.playerSpawn.row,
      state: 'idle',
      frame: 0,
      digTimer: 0,
      isDead: false
    };

    // Reset Enemies
    this.enemies = level.enemySpawns.map((spawn, idx) => ({
      id: idx + 1,
      x: spawn.col,
      y: spawn.row,
      spawnCol: spawn.col,
      spawnRow: spawn.row,
      state: 'idle',
      frame: 0,
      isTrapped: false,
      trapTimer: 0,
      hasGold: false,
      respawnTimer: 0
    }));

    this.isLevelClear = false;
    this.levelClearTimer = 0;
    lodeRunnerAudio.playDiskDriveSeek();
  }

  public restartGame() {
    this.score = 0;
    this.lives = 5;
    this.isGameOver = false;
    this.initLevel(0);
  }

  public restartLevel() {
    this.initLevel(this.currentLevelIndex);
  }

  public setLevel(index: number) {
    this.initLevel(index);
  }

  // Check tile at grid coordinate
  public getTile(col: number, row: number): TileType {
    if (col < 0 || col >= COLS || row < 0 || row >= ROWS) {
      return TileType.SOLID;
    }
    return this.grid[row][col] as TileType;
  }

  public isSolid(col: number, row: number): boolean {
    const t = this.getTile(col, row);
    return t === TileType.BRICK || t === TileType.SOLID;
  }

  public isStandable(col: number, row: number): boolean {
    if (row >= ROWS - 1) return true;
    const t = this.getTile(col, row + 1);
    if (t === TileType.BRICK || t === TileType.SOLID || t === TileType.LADDER) return true;
    // Check if an enemy is trapped in a hole directly below
    const hole = this.dugHoles.find(h => h.col === col && h.row === row + 1 && h.trappedEnemyIndex !== null);
    if (hole) return true;
    return false;
  }

  public canClimb(col: number, row: number): boolean {
    const t = this.getTile(col, row);
    return t === TileType.LADDER || (t === TileType.ESCAPE_LADDER && this.escapeLadderRevealed);
  }

  public canHang(col: number, row: number): boolean {
    const t = this.getTile(col, row);
    return t === TileType.ROPE;
  }

  /**
   * Action: Dig Left
   */
  public digLeft() {
    if (this.player.isDead || this.player.digTimer > 0) return;

    const targetCol = Math.round(this.player.x) - 1;
    const targetRow = Math.round(this.player.y) + 1;
    const aboveTargetRow = Math.round(this.player.y);

    // Can only dig if standing on solid/ladder/rope
    if (targetCol >= 0 && targetRow < ROWS) {
      const tile = this.getTile(targetCol, targetRow);
      const aboveTile = this.getTile(targetCol, aboveTargetRow);

      // Rule: Tile below must be BRICK, tile directly above hole must NOT be solid/ladder
      if (tile === TileType.BRICK && aboveTile !== TileType.SOLID && aboveTile !== TileType.LADDER) {
        // Make sure hole is not already open
        const existing = this.dugHoles.find(h => h.col === targetCol && h.row === targetRow);
        if (!existing) {
          this.grid[targetRow][targetCol] = TileType.EMPTY;
          this.dugHoles.push({
            col: targetCol,
            row: targetRow,
            timer: 4.5,
            maxTimer: 4.5,
            trappedEnemyIndex: null
          });
          this.player.state = 'dig_left';
          this.player.digTimer = 0.35;
          lodeRunnerAudio.playDig();
        }
      }
    }
  }

  /**
   * Action: Dig Right
   */
  public digRight() {
    if (this.player.isDead || this.player.digTimer > 0) return;

    const targetCol = Math.round(this.player.x) + 1;
    const targetRow = Math.round(this.player.y) + 1;
    const aboveTargetRow = Math.round(this.player.y);

    if (targetCol < COLS && targetRow < ROWS) {
      const tile = this.getTile(targetCol, targetRow);
      const aboveTile = this.getTile(targetCol, aboveTargetRow);

      if (tile === TileType.BRICK && aboveTile !== TileType.SOLID && aboveTile !== TileType.LADDER) {
        const existing = this.dugHoles.find(h => h.col === targetCol && h.row === targetRow);
        if (!existing) {
          this.grid[targetRow][targetCol] = TileType.EMPTY;
          this.dugHoles.push({
            col: targetCol,
            row: targetRow,
            timer: 4.5,
            maxTimer: 4.5,
            trappedEnemyIndex: null
          });
          this.player.state = 'dig_right';
          this.player.digTimer = 0.35;
          lodeRunnerAudio.playDig();
        }
      }
    }
  }

  /**
   * Main game update loop
   */
  public update(dt: number, input: { left: boolean; right: boolean; up: boolean; down: boolean; digL: boolean; digR: boolean }) {
    if (this.isPaused || this.isGameOver) return;

    // Handle Level Clear state
    if (this.isLevelClear) {
      this.levelClearTimer += dt;
      if (this.levelClearTimer > 2.0) {
        this.nextLevel();
      }
      return;
    }

    // Handle Player Dead state
    if (this.player.isDead) {
      this.levelClearTimer += dt;
      if (this.levelClearTimer > 1.8) {
        this.lives--;
        if (this.lives <= 0) {
          this.isGameOver = true;
          this.saveHighScore();
        } else {
          this.restartLevel();
        }
      }
      return;
    }

    this.animTimer += dt;
    this.stepSoundTimer += dt;

    // Digging inputs
    if (input.digL) {
      this.digLeft();
    } else if (input.digR) {
      this.digRight();
    }

    // Update dug holes timers
    this.updateDugHoles(dt);

    // Update player movement
    this.updatePlayer(dt, input);

    // Update enemy AI & physics
    this.updateEnemies(dt);

    // Check collisions
    this.checkCollisions();
  }

  private updateDugHoles(dt: number) {
    for (let i = this.dugHoles.length - 1; i >= 0; i--) {
      const hole = this.dugHoles[i];
      hole.timer -= dt;

      // When ~1s left, warn with regeneration sound once
      if (hole.timer <= 0.6 && hole.timer + dt > 0.6) {
        lodeRunnerAudio.playRegenerate();
      }

      // Hole closes and brick regenerates
      if (hole.timer <= 0) {
        this.grid[hole.row][hole.col] = TileType.BRICK;

        // If enemy was trapped inside, squash enemy!
        if (hole.trappedEnemyIndex !== null && this.enemies[hole.trappedEnemyIndex]) {
          const enemy = this.enemies[hole.trappedEnemyIndex];
          enemy.isTrapped = false;
          enemy.respawnTimer = 2.0;
          enemy.x = enemy.spawnCol;
          enemy.y = enemy.spawnRow;
          this.score += 75;
          this.saveHighScore();
          lodeRunnerAudio.playEnemySquish();
        }

        // If player was standing in hole, player dies!
        const playerCol = Math.round(this.player.x);
        const playerRow = Math.round(this.player.y);
        if (playerCol === hole.col && playerRow === hole.row) {
          this.killPlayer();
        }

        this.dugHoles.splice(i, 1);
      }
    }
  }

  private updatePlayer(dt: number, input: { left: boolean; right: boolean; up: boolean; down: boolean }) {
    if (this.player.digTimer > 0) {
      this.player.digTimer -= dt;
      return;
    }

    const col = Math.round(this.player.x);
    const row = Math.round(this.player.y);
    const currentTile = this.getTile(col, row);
    const tileBelow = this.getTile(col, row + 1);

    const speed = 4.2 * dt;

    // Check if falling (in empty space with no ladder, no rope, and no standable surface below)
    const onLadder = this.canClimb(col, row);
    const onRope = this.canHang(col, row);
    const standsOnSomething = this.isStandable(col, row);

    // If standing on false brick, it falls through
    if (tileBelow === TileType.FALSE_BRICK) {
      // player falls through
    }

    if (!onLadder && !onRope && !standsOnSomething) {
      // Falling
      this.player.y += 6.5 * dt;
      this.player.state = 'fall';
      this.player.x = col; // snap to col while falling
      if (this.player.y >= ROWS - 2) {
        this.player.y = ROWS - 2;
      }
      return;
    }

    // Walking / Climbing Controls
    let moved = false;

    if (input.up) {
      // Can climb if on ladder or bottom of ladder
      if (onLadder || this.canClimb(col, row + 1)) {
        this.player.x = col;
        this.player.y -= speed;
        this.player.state = 'climb_up';
        moved = true;
        if (this.stepSoundTimer > 0.22) {
          lodeRunnerAudio.playClimb();
          this.stepSoundTimer = 0;
        }
      }
    } else if (input.down) {
      // Can climb down if ladder below, or drop from rope
      if (this.canClimb(col, row + 1) || onLadder) {
        this.player.x = col;
        this.player.y += speed;
        this.player.state = 'climb_down';
        moved = true;
        if (this.stepSoundTimer > 0.22) {
          lodeRunnerAudio.playClimb();
          this.stepSoundTimer = 0;
        }
      } else if (onRope && !this.isSolid(col, row + 1)) {
        // Drop down from rope
        this.player.y += 0.4;
      }
    } else if (input.left) {
      const nextCol = Math.round(this.player.x - 0.5);
      if (!this.isSolid(nextCol, row)) {
        this.player.x -= speed;
        if (onRope) {
          this.player.state = 'hang_left';
        } else {
          this.player.state = 'run_left';
        }
        moved = true;
        if (this.stepSoundTimer > 0.2) {
          lodeRunnerAudio.playFootstep();
          this.stepSoundTimer = 0;
        }
      }
    } else if (input.right) {
      const nextCol = Math.round(this.player.x + 0.5);
      if (!this.isSolid(nextCol, row)) {
        this.player.x += speed;
        if (onRope) {
          this.player.state = 'hang_right';
        } else {
          this.player.state = 'run_right';
        }
        moved = true;
        if (this.stepSoundTimer > 0.2) {
          lodeRunnerAudio.playFootstep();
          this.stepSoundTimer = 0;
        }
      }
    }

    if (!moved) {
      if (onLadder) {
        this.player.state = 'climb_idle';
      } else if (onRope) {
        this.player.state = 'hang_idle';
      } else {
        this.player.state = 'idle';
      }
    }

    // Keep player in bounds
    this.player.x = Math.max(0, Math.min(COLS - 1, this.player.x));
    this.player.y = Math.max(0, Math.min(ROWS - 2, this.player.y));

    // Check gold pickup
    const pCol = Math.round(this.player.x);
    const pRow = Math.round(this.player.y);
    if (this.grid[pRow][pCol] === TileType.GOLD) {
      this.grid[pRow][pCol] = TileType.EMPTY;
      this.goldCount--;
      this.score += 250;
      this.saveHighScore();
      lodeRunnerAudio.playGoldPickup();

      // Check if all gold collected
      if (this.goldCount <= 0 && !this.escapeLadderRevealed) {
        this.revealEscapeLadder();
      }
    }

    // Check level clear (reached row 0 on escape ladder)
    if (this.escapeLadderRevealed && pRow <= 1 && currentTile === TileType.ESCAPE_LADDER) {
      this.triggerLevelClear();
    }
  }

  private revealEscapeLadder() {
    this.escapeLadderRevealed = true;
    lodeRunnerAudio.playEscapeLadderRevealed();
  }

  private triggerLevelClear() {
    this.isLevelClear = true;
    this.levelClearTimer = 0;
    this.score += 1500;
    this.saveHighScore();
    lodeRunnerAudio.playLevelComplete();
  }

  public nextLevel() {
    this.initLevel(this.currentLevelIndex + 1);
  }

  private updateEnemies(dt: number) {
    const enemySpeed = 2.8 * dt;

    this.enemies.forEach((enemy, index) => {
      if (enemy.respawnTimer > 0) {
        enemy.respawnTimer -= dt;
        return;
      }

      const eCol = Math.round(enemy.x);
      const eRow = Math.round(enemy.y);
      const onLadder = this.canClimb(eCol, eRow);
      const onRope = this.canHang(eCol, eRow);
      const standsOn = this.isStandable(eCol, eRow);

      // Check if trapped in a dug hole
      const hole = this.dugHoles.find(h => h.col === eCol && h.row === eRow);
      if (hole) {
        if (!enemy.isTrapped) {
          enemy.isTrapped = true;
          enemy.trapTimer = 3.8;
          hole.trappedEnemyIndex = index;
          lodeRunnerAudio.playEnemyTrapped();

          // Drop gold if monk was carrying it
          if (enemy.hasGold) {
            enemy.hasGold = false;
            // Place gold on top of hole or adjacent
            if (this.getTile(eCol, eRow - 1) === TileType.EMPTY) {
              this.grid[eRow - 1][eCol] = TileType.GOLD;
              this.goldCount++;
            }
          }
        } else {
          // Count down trap timer
          enemy.trapTimer -= dt;
          if (enemy.trapTimer <= 0) {
            // Climb out of hole
            enemy.isTrapped = false;
            hole.trappedEnemyIndex = null;
            enemy.y -= 1.0;
          }
        }
        return;
      }

      // If falling
      if (!onLadder && !onRope && !standsOn) {
        enemy.y += 5.5 * dt;
        enemy.x = eCol;
        return;
      }

      // Monk AI: Track player x, y
      const pCol = Math.round(this.player.x);
      const pRow = Math.round(this.player.y);

      // Vertical decision (prioritize climbing towards player height if on ladder)
      let movedY = false;
      if (onLadder) {
        if (pRow < eRow && (onLadder || this.canClimb(eCol, eRow - 1))) {
          enemy.y -= enemySpeed;
          enemy.x = eCol;
          enemy.state = 'climb_up';
          movedY = true;
        } else if (pRow > eRow && (this.canClimb(eCol, eRow + 1) || !this.isSolid(eCol, eRow + 1))) {
          enemy.y += enemySpeed;
          enemy.x = eCol;
          enemy.state = 'climb_down';
          movedY = true;
        }
      }

      // Horizontal decision
      if (!movedY) {
        if (pCol < eCol) {
          const nextCol = Math.round(enemy.x - 0.4);
          if (!this.isSolid(nextCol, eRow)) {
            enemy.x -= enemySpeed;
            enemy.state = onRope ? 'hang_left' : 'run_left';
          }
        } else if (pCol > eCol) {
          const nextCol = Math.round(enemy.x + 0.4);
          if (!this.isSolid(nextCol, eRow)) {
            enemy.x += enemySpeed;
            enemy.state = onRope ? 'hang_right' : 'run_right';
          }
        } else {
          enemy.state = onLadder ? 'climb_idle' : (onRope ? 'hang_idle' : 'idle');
        }
      }

      // Can pick up gold lying on ground
      if (!enemy.hasGold && this.grid[eRow][eCol] === TileType.GOLD) {
        this.grid[eRow][eCol] = TileType.EMPTY;
        enemy.hasGold = true;
        this.goldCount--;
        if (this.goldCount <= 0 && !this.escapeLadderRevealed) {
          this.revealEscapeLadder();
        }
      }
    });
  }

  private checkCollisions() {
    if (this.player.isDead) return;

    this.enemies.forEach((enemy) => {
      if (enemy.respawnTimer > 0) return;

      const dist = Math.hypot(this.player.x - enemy.x, this.player.y - enemy.y);

      // If monk is trapped in a hole, player can safely walk across monk's head!
      if (enemy.isTrapped) {
        return;
      }

      // Collision with live enemy monk
      if (dist < 0.65) {
        this.killPlayer();
      }
    });
  }

  public killPlayer() {
    if (this.player.isDead) return;
    this.player.isDead = true;
    this.player.state = 'idle';
    this.levelClearTimer = 0;
    lodeRunnerAudio.playDeath();
  }
}
