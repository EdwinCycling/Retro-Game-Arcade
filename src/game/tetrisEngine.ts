/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Tetris Game Engine (Alexey Pajitnov / 1984 & 1989 Arcade)
 * Implements 7-bag randomizer, SRS wall kicks, Ghost piece, Hold, Lock delay & Scoring
 */

import {
  ActivePiece,
  BOARD_COLS,
  BOARD_ROWS,
  BUFFER_ROWS,
  CellColor,
  FloatingText,
  Particle,
  TetrisGameState,
  TetrominoDefinition,
  TetrominoType,
  TOTAL_ROWS,
} from './tetrisTypes';
import { tetrisAudio } from './tetrisAudio';

// The 7 Standard Tetromino shapes (in 4 rotation states)
export const TETROMINOES: Record<TetrominoType, TetrominoDefinition> = {
  I: {
    type: 'I',
    color: '#06b6d4',      // Cyan
    glowColor: '#67e8f9',
    shadowColor: '#0e7490',
    shapes: [
      [
        [0, 0, 0, 0],
        [1, 1, 1, 1],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
      ],
      [
        [0, 0, 1, 0],
        [0, 0, 1, 0],
        [0, 0, 1, 0],
        [0, 0, 1, 0],
      ],
      [
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [1, 1, 1, 1],
        [0, 0, 0, 0],
      ],
      [
        [0, 1, 0, 0],
        [0, 1, 0, 0],
        [0, 1, 0, 0],
        [0, 1, 0, 0],
      ],
    ],
  },
  O: {
    type: 'O',
    color: '#eab308',      // Yellow
    glowColor: '#fef08a',
    shadowColor: '#a16207',
    shapes: [
      [
        [1, 1],
        [1, 1],
      ],
      [
        [1, 1],
        [1, 1],
      ],
      [
        [1, 1],
        [1, 1],
      ],
      [
        [1, 1],
        [1, 1],
      ],
    ],
  },
  T: {
    type: 'T',
    color: '#a855f7',      // Purple
    glowColor: '#d8b4fe',
    shadowColor: '#7e22ce',
    shapes: [
      [
        [0, 1, 0],
        [1, 1, 1],
        [0, 0, 0],
      ],
      [
        [0, 1, 0],
        [0, 1, 1],
        [0, 1, 0],
      ],
      [
        [0, 0, 0],
        [1, 1, 1],
        [0, 1, 0],
      ],
      [
        [0, 1, 0],
        [1, 1, 0],
        [0, 1, 0],
      ],
    ],
  },
  S: {
    type: 'S',
    color: '#22c55e',      // Green
    glowColor: '#86efac',
    shadowColor: '#15803d',
    shapes: [
      [
        [0, 1, 1],
        [1, 1, 0],
        [0, 0, 0],
      ],
      [
        [0, 1, 0],
        [0, 1, 1],
        [0, 0, 1],
      ],
      [
        [0, 0, 0],
        [0, 1, 1],
        [1, 1, 0],
      ],
      [
        [1, 0, 0],
        [1, 1, 0],
        [0, 1, 0],
      ],
    ],
  },
  Z: {
    type: 'Z',
    color: '#ef4444',      // Red
    glowColor: '#fca5a5',
    shadowColor: '#b91c1c',
    shapes: [
      [
        [1, 1, 0],
        [0, 1, 1],
        [0, 0, 0],
      ],
      [
        [0, 0, 1],
        [0, 1, 1],
        [0, 1, 0],
      ],
      [
        [0, 0, 0],
        [1, 1, 0],
        [0, 1, 1],
      ],
      [
        [0, 1, 0],
        [1, 1, 0],
        [1, 0, 0],
      ],
    ],
  },
  J: {
    type: 'J',
    color: '#3b82f6',      // Blue
    glowColor: '#93c5fd',
    shadowColor: '#1d4ed8',
    shapes: [
      [
        [1, 0, 0],
        [1, 1, 1],
        [0, 0, 0],
      ],
      [
        [0, 1, 1],
        [0, 1, 0],
        [0, 1, 0],
      ],
      [
        [0, 0, 0],
        [1, 1, 1],
        [0, 0, 1],
      ],
      [
        [0, 1, 0],
        [0, 1, 0],
        [1, 1, 0],
      ],
    ],
  },
  L: {
    type: 'L',
    color: '#f97316',      // Orange
    glowColor: '#fdba74',
    shadowColor: '#c2410c',
    shapes: [
      [
        [0, 0, 1],
        [1, 1, 1],
        [0, 0, 0],
      ],
      [
        [0, 1, 0],
        [0, 1, 0],
        [0, 1, 1],
      ],
      [
        [0, 0, 0],
        [1, 1, 1],
        [1, 0, 0],
      ],
      [
        [1, 1, 0],
        [0, 1, 0],
        [0, 1, 0],
      ],
    ],
  },
};

export class TetrisEngine {
  public gameState: TetrisGameState = 'TITLE';

  // The 10x22 grid (0..21 rows, with rows 0..1 hidden buffer)
  public board: Array<Array<CellColor | null>> = [];

  // Active falling piece
  public currentPiece: ActivePiece | null = null;
  public nextPiece: TetrominoType | null = null;
  public holdPiece: TetrominoType | null = null;
  public canHold: boolean = true;

  // 7-Bag Randomizer
  private bag: TetrominoType[] = [];

  // Scoring & Stats
  public score: number = 0;
  public lines: number = 0;
  public level: number = 1;
  public highScore: number = 125000;
  public combo: number = -1;

  // Timing
  private dropTimer: number = 0;
  private lockDelayTimer: number = 0;
  private readonly lockDelayDuration: number = 0.5; // 500ms lock delay
  private clearingRows: number[] = [];
  private clearAnimTimer: number = 0;
  private readonly clearAnimDuration: number = 0.25; // 250ms line flash

  // Particles and visual juice
  public particles: Particle[] = [];
  public floatingTexts: FloatingText[] = [];
  public screenShake: number = 0;

  // Observers
  private subscribers: Array<() => void> = [];

  constructor() {
    this.resetBoard();
  }

  public subscribe(cb: () => void): () => void {
    this.subscribers.push(cb);
    return () => {
      this.subscribers = this.subscribers.filter((s) => s !== cb);
    };
  }

  private notify() {
    for (const sub of this.subscribers) {
      sub();
    }
  }

  public resetBoard() {
    this.board = Array.from({ length: TOTAL_ROWS }, () =>
      Array.from({ length: BOARD_COLS }, () => null)
    );
  }

  public startNewGame() {
    this.resetBoard();
    this.score = 0;
    this.lines = 0;
    this.level = 1;
    this.combo = -1;
    this.holdPiece = null;
    this.canHold = true;
    this.bag = [];
    this.particles = [];
    this.floatingTexts = [];
    this.clearingRows = [];

    this.nextPiece = this.drawFromBag();
    this.spawnPiece();
    this.gameState = 'PLAYING';

    tetrisAudio.startMusic();
    this.notify();
  }

  private drawFromBag(): TetrominoType {
    if (this.bag.length === 0) {
      const types: TetrominoType[] = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];
      // Fisher-Yates shuffle
      for (let i = types.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [types[i], types[j]] = [types[j], types[i]];
      }
      this.bag = types;
    }
    return this.bag.pop()!;
  }

  private spawnPiece() {
    const type = this.nextPiece || this.drawFromBag();
    this.nextPiece = this.drawFromBag();

    const shape = TETROMINOES[type].shapes[0];
    const pieceWidth = shape[0].length;
    const startX = Math.floor((BOARD_COLS - pieceWidth) / 2);
    const startY = type === 'I' ? 0 : 1; // start in top buffer row

    this.currentPiece = {
      type,
      rotation: 0,
      x: startX,
      y: startY,
    };

    this.canHold = true;
    this.dropTimer = 0;
    this.lockDelayTimer = 0;

    // Check if spawn position collides immediately -> GAME OVER
    if (this.checkCollision(this.currentPiece.x, this.currentPiece.y, this.currentPiece.rotation)) {
      this.triggerGameOver();
    }
  }

  public hold() {
    if (this.gameState !== 'PLAYING' || !this.currentPiece || !this.canHold) return;

    tetrisAudio.playHold();
    const currentType = this.currentPiece.type;

    if (this.holdPiece === null) {
      this.holdPiece = currentType;
      this.spawnPiece();
    } else {
      const temp = this.holdPiece;
      this.holdPiece = currentType;

      const shape = TETROMINOES[temp].shapes[0];
      const pieceWidth = shape[0].length;
      this.currentPiece = {
        type: temp,
        rotation: 0,
        x: Math.floor((BOARD_COLS - pieceWidth) / 2),
        y: temp === 'I' ? 0 : 1,
      };
      this.dropTimer = 0;
      this.lockDelayTimer = 0;
    }

    this.canHold = false;
    this.notify();
  }

  public move(dir: -1 | 1) {
    if (this.gameState !== 'PLAYING' || !this.currentPiece) return;

    if (!this.checkCollision(this.currentPiece.x + dir, this.currentPiece.y, this.currentPiece.rotation)) {
      this.currentPiece.x += dir;
      tetrisAudio.playMove();
      // If piece is resting on bottom, reset lock delay slightly (up to a limit)
      if (this.checkCollision(this.currentPiece.x, this.currentPiece.y + 1, this.currentPiece.rotation)) {
        this.lockDelayTimer = 0;
      }
      this.notify();
    }
  }

  public rotate(direction: 1 | -1 = 1) {
    if (this.gameState !== 'PLAYING' || !this.currentPiece) return;

    const newRotation = (this.currentPiece.rotation + direction + 4) % 4;

    // Standard wall kicks (test offsets: [0,0], [-1,0], [1,0], [0,-1], [-1,-1], [1,-1])
    const kickOffsets: Array<[number, number]> = [
      [0, 0],
      [-1, 0],
      [1, 0],
      [0, -1],
      [-1, -1],
      [1, -1],
      [-2, 0],
      [2, 0],
    ];

    for (const [ox, oy] of kickOffsets) {
      if (!this.checkCollision(this.currentPiece.x + ox, this.currentPiece.y + oy, newRotation)) {
        this.currentPiece.x += ox;
        this.currentPiece.y += oy;
        this.currentPiece.rotation = newRotation;
        tetrisAudio.playRotate();
        this.lockDelayTimer = 0;
        this.notify();
        return;
      }
    }
  }

  public softDrop() {
    if (this.gameState !== 'PLAYING' || !this.currentPiece) return;

    if (!this.checkCollision(this.currentPiece.x, this.currentPiece.y + 1, this.currentPiece.rotation)) {
      this.currentPiece.y += 1;
      this.score += 1;
      tetrisAudio.playSoftDrop();
      this.dropTimer = 0;
      this.notify();
    } else {
      this.lockPiece();
    }
  }

  public hardDrop() {
    if (this.gameState !== 'PLAYING' || !this.currentPiece) return;

    let dropDist = 0;
    while (!this.checkCollision(this.currentPiece.x, this.currentPiece.y + 1, this.currentPiece.rotation)) {
      this.currentPiece.y += 1;
      dropDist++;
    }

    this.score += dropDist * 2;
    this.screenShake = 6;
    tetrisAudio.playHardDrop();
    this.spawnHardDropParticles();
    this.lockPiece();
  }

  public getGhostY(): number {
    if (!this.currentPiece) return 0;
    let ghostY = this.currentPiece.y;
    while (!this.checkCollision(this.currentPiece.x, ghostY + 1, this.currentPiece.rotation)) {
      ghostY++;
    }
    return ghostY;
  }

  private checkCollision(pieceX: number, pieceY: number, rotation: number): boolean {
    if (!this.currentPiece) return false;
    const shape = TETROMINOES[this.currentPiece.type].shapes[rotation];

    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[r].length; c++) {
        if (shape[r][c] !== 0) {
          const boardX = pieceX + c;
          const boardY = pieceY + r;

          // Out of bounds
          if (boardX < 0 || boardX >= BOARD_COLS || boardY >= TOTAL_ROWS) {
            return true;
          }

          // Collides with existing locked block on board
          if (boardY >= 0 && this.board[boardY][boardX] !== null) {
            return true;
          }
        }
      }
    }
    return false;
  }

  private lockPiece() {
    if (!this.currentPiece) return;

    const def = TETROMINOES[this.currentPiece.type];
    const shape = def.shapes[this.currentPiece.rotation];

    let lockedAboveBuffer = true;

    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[r].length; c++) {
        if (shape[r][c] !== 0) {
          const boardX = this.currentPiece.x + c;
          const boardY = this.currentPiece.y + r;

          if (boardY >= BUFFER_ROWS) {
            lockedAboveBuffer = false;
          }

          if (boardY >= 0 && boardY < TOTAL_ROWS && boardX >= 0 && boardX < BOARD_COLS) {
            this.board[boardY][boardX] = {
              type: this.currentPiece.type,
              color: def.color,
              glowColor: def.glowColor,
              shadowColor: def.shadowColor,
            };
          }
        }
      }
    }

    this.currentPiece = null;

    if (lockedAboveBuffer) {
      this.triggerGameOver();
      return;
    }

    // Check for completed lines
    this.checkForLines();
  }

  private checkForLines() {
    const fullRows: number[] = [];

    for (let r = TOTAL_ROWS - 1; r >= 0; r--) {
      const isFull = this.board[r].every((cell) => cell !== null);
      if (isFull) {
        fullRows.push(r);
      }
    }

    if (fullRows.length > 0) {
      this.clearingRows = fullRows;
      this.clearAnimTimer = this.clearAnimDuration;
      this.gameState = 'LINE_CLEAR';
      this.combo++;

      // Trigger SFX
      if (fullRows.length === 4) {
        tetrisAudio.playTetris();
        this.addFloatingText('TETRIS! +800', '#facc15', 1.4);
        this.screenShake = 10;
      } else {
        tetrisAudio.playLineClear();
        const names = ['', 'SINGLE! +100', 'DOUBLE! +300', 'TRIPLE! +500'];
        this.addFloatingText(names[fullRows.length] || 'CLEAR!', '#38bdf8', 1.1);
        this.screenShake = 4;
      }

      this.spawnLineClearParticles(fullRows);
    } else {
      this.combo = -1;
      this.spawnPiece();
    }

    this.notify();
  }

  private collapseLines() {
    const linesCount = this.clearingRows.length;

    // Filter out cleared lines and unshift new empty rows at top
    this.board = this.board.filter((_, idx) => !this.clearingRows.includes(idx));
    while (this.board.length < TOTAL_ROWS) {
      this.board.unshift(Array.from({ length: BOARD_COLS }, () => null));
    }

    // Base scores: Single 100, Double 300, Triple 500, Tetris 800
    const baseScores = [0, 100, 300, 500, 800];
    const earned = (baseScores[linesCount] || 100) * this.level;
    const comboBonus = this.combo > 0 ? this.combo * 50 * this.level : 0;
    this.score += earned + comboBonus;

    this.lines += linesCount;

    // Level progression every 10 lines
    const newLevel = Math.floor(this.lines / 10) + 1;
    if (newLevel > this.level) {
      this.level = newLevel;
      tetrisAudio.playLevelUp();
      this.addFloatingText(`LEVEL ${this.level}!`, '#4ade80', 1.5);
    }

    if (this.score > this.highScore) {
      this.highScore = this.score;
    }

    this.clearingRows = [];
    this.gameState = 'PLAYING';
    this.spawnPiece();
    this.notify();
  }

  private triggerGameOver() {
    this.gameState = 'GAME_OVER';
    tetrisAudio.playGameOver();
    this.addFloatingText('GAME OVER', '#ef4444', 1.6);
    this.notify();
  }

  public togglePause() {
    if (this.gameState === 'PLAYING') {
      this.gameState = 'PAUSED';
      tetrisAudio.stopMusic();
    } else if (this.gameState === 'PAUSED') {
      this.gameState = 'PLAYING';
      tetrisAudio.startMusic();
    }
    this.notify();
  }

  public update(dt: number) {
    // Screen shake decay
    if (this.screenShake > 0) {
      this.screenShake = Math.max(0, this.screenShake - dt * 25);
    }

    // Update particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt;
      p.alpha = Math.max(0, p.life / p.maxLife);
      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }

    // Update floating texts
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.elapsed += dt;
      ft.y -= 30 * dt;
      ft.alpha = Math.max(0, 1 - ft.elapsed / ft.duration);
      if (ft.elapsed >= ft.duration) {
        this.floatingTexts.splice(i, 1);
      }
    }

    if (this.gameState === 'LINE_CLEAR') {
      this.clearAnimTimer -= dt;
      if (this.clearAnimTimer <= 0) {
        this.collapseLines();
      }
      return;
    }

    if (this.gameState !== 'PLAYING' || !this.currentPiece) return;

    // Drop speed based on level (ms to seconds)
    // Level 1: 0.8s, Level 10: 0.1s
    const dropInterval = Math.max(0.08, 0.85 - (this.level - 1) * 0.075);
    this.dropTimer += dt;

    if (this.dropTimer >= dropInterval) {
      this.dropTimer = 0;
      if (!this.checkCollision(this.currentPiece.x, this.currentPiece.y + 1, this.currentPiece.rotation)) {
        this.currentPiece.y += 1;
        this.notify();
      }
    }

    // Lock delay check when piece is touching floor
    if (this.checkCollision(this.currentPiece.x, this.currentPiece.y + 1, this.currentPiece.rotation)) {
      this.lockDelayTimer += dt;
      if (this.lockDelayTimer >= this.lockDelayDuration) {
        this.lockPiece();
      }
    } else {
      this.lockDelayTimer = 0;
    }
  }

  // Visual effects helpers

  public addFloatingText(text: string, color: string, scale: number = 1.0) {
    this.floatingTexts.push({
      id: Math.random(),
      text,
      x: BOARD_COLS / 2,
      y: 10,
      color,
      alpha: 1.0,
      scale,
      duration: 1.2,
      elapsed: 0,
    });
  }

  private spawnLineClearParticles(rows: number[]) {
    for (const r of rows) {
      const displayY = r - BUFFER_ROWS;
      for (let c = 0; c < BOARD_COLS; c++) {
        for (let k = 0; k < 3; k++) {
          const colors = ['#fde047', '#38bdf8', '#4ade80', '#f472b6', '#ffffff'];
          const color = colors[Math.floor(Math.random() * colors.length)];
          this.particles.push({
            x: c + 0.5,
            y: displayY + 0.5,
            vx: (Math.random() - 0.5) * 12,
            vy: (Math.random() - 0.5) * 12 - 2,
            color,
            alpha: 1,
            size: Math.random() * 4 + 2,
            life: Math.random() * 0.4 + 0.3,
            maxLife: 0.6,
          });
        }
      }
    }
  }

  private spawnHardDropParticles() {
    if (!this.currentPiece) return;
    const shape = TETROMINOES[this.currentPiece.type].shapes[this.currentPiece.rotation];
    const def = TETROMINOES[this.currentPiece.type];

    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[r].length; c++) {
        if (shape[r][c] !== 0) {
          const px = this.currentPiece.x + c;
          const py = this.currentPiece.y + r - BUFFER_ROWS;
          for (let k = 0; k < 2; k++) {
            this.particles.push({
              x: px + 0.5,
              y: py + 1,
              vx: (Math.random() - 0.5) * 6,
              vy: -Math.random() * 3,
              color: def.glowColor,
              alpha: 0.9,
              size: 3,
              life: 0.25,
              maxLife: 0.25,
            });
          }
        }
      }
    }
  }
}
