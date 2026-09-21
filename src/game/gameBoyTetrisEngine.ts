/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Game Boy Tetris (1989 / Nintendo / Alexey Pajitnov / DMG Edition)
 * Native 160x144 LCD resolution with authentic Game Boy side panel, A-Type/B-Type & Rocket Launch!
 */

import { gameBoyAudio } from './gameBoyAudio';
import { GAME_BOY_PALETTES, GameBoyPaletteMode } from './gameBoyTypes';
import { saveTetrisScore, getTetrisScores } from './gameBoyHighScores';

export type TetrisPieceType = 'I' | 'J' | 'L' | 'O' | 'S' | 'T' | 'Z';

export interface TetrisPiece {
  type: TetrisPieceType;
  x: number;
  y: number;
  rotation: number;
  shape: number[][];
}

const TETROMINO_SHAPES: Record<TetrisPieceType, number[][][]> = {
  I: [
    [[0,0,0,0], [1,1,1,1], [0,0,0,0], [0,0,0,0]],
    [[0,0,1,0], [0,0,1,0], [0,0,1,0], [0,0,1,0]],
    [[0,0,0,0], [0,0,0,0], [1,1,1,1], [0,0,0,0]],
    [[0,1,0,0], [0,1,0,0], [0,1,0,0], [0,1,0,0]]
  ],
  J: [
    [[1,0,0], [1,1,1], [0,0,0]],
    [[0,1,1], [0,1,0], [0,1,0]],
    [[0,0,0], [1,1,1], [0,0,1]],
    [[0,1,0], [0,1,0], [1,1,0]]
  ],
  L: [
    [[0,0,1], [1,1,1], [0,0,0]],
    [[0,1,0], [0,1,0], [0,1,1]],
    [[0,0,0], [1,1,1], [1,0,0]],
    [[1,1,0], [0,1,0], [0,1,0]]
  ],
  O: [
    [[1,1], [1,1]],
    [[1,1], [1,1]],
    [[1,1], [1,1]],
    [[1,1], [1,1]]
  ],
  S: [
    [[0,1,1], [1,1,0], [0,0,0]],
    [[0,1,0], [0,1,1], [0,0,1]],
    [[0,0,0], [0,1,1], [1,1,0]],
    [[1,0,0], [1,1,0], [0,1,0]]
  ],
  T: [
    [[0,1,0], [1,1,1], [0,0,0]],
    [[0,1,0], [0,1,1], [0,1,0]],
    [[0,0,0], [1,1,1], [0,1,0]],
    [[0,1,0], [1,1,0], [0,1,0]]
  ],
  Z: [
    [[1,1,0], [0,1,1], [0,0,0]],
    [[0,0,1], [0,1,1], [0,1,0]],
    [[0,0,0], [1,1,0], [0,1,1]],
    [[0,1,0], [1,1,0], [1,0,0]]
  ]
};

export class GameBoyTetrisEngine {
  public width = 160;
  public height = 144;

  // 10x20 Matrix (0 = empty, 1-7 = piece fill patterns)
  public grid: number[][] = [];
  public currentPiece: TetrisPiece | null = null;
  public nextPieceType: TetrisPieceType = 'T';

  // Game Stats
  public score: number = 0;
  public lines: number = 0;
  public level: number = 0;
  public topScore: number = 298400;
  public mode: 'A-TYPE' | 'B-TYPE' = 'A-TYPE';
  public bTypeTargetLines: number = 25;

  // State
  public state: 'MENU' | 'PLAYING' | 'PAUSED' | 'LINE_CLEAR_ANIM' | 'ROCKET_LAUNCH' | 'GAME_OVER' = 'MENU';
  public menuModeSelection: 'A-TYPE' | 'B-TYPE' = 'A-TYPE';
  public menuMusicSelection: 'A' | 'B' | 'OFF' = 'A';

  // Gravity & Timing
  public dropTimer: number = 0;
  public dropInterval: number = 0.8;
  public linesBeingCleared: number[] = [];
  public animTimer: number = 0;
  public rocketY: number = 100;
  public rocketPhase: number = 0;

  public palette: GameBoyPaletteMode = 'dmg';

  // Input states
  private keys: {
    left: boolean;
    right: boolean;
    down: boolean;
    rotateCW: boolean;
    rotateCCW: boolean;
    hardDrop: boolean;
  } = { left: false, right: false, down: false, rotateCW: false, rotateCCW: false, hardDrop: false };

  constructor() {
    const scores = getTetrisScores();
    if (scores.length > 0) {
      this.topScore = scores[0].score;
    }
    this.resetGrid();
  }

  public resetGrid() {
    this.grid = [];
    for (let r = 0; r < 20; r++) {
      this.grid.push(new Array(10).fill(0));
    }
  }

  public startGame(mode: 'A-TYPE' | 'B-TYPE' = 'A-TYPE', level: number = 0) {
    this.mode = mode;
    this.level = level;
    this.score = 0;
    this.lines = 0;
    this.resetGrid();

    if (mode === 'B-TYPE') {
      // Add random garbage height
      for (let r = 17; r < 20; r++) {
        for (let c = 0; c < 10; c++) {
          if (Math.random() > 0.4) {
            this.grid[r][c] = Math.floor(Math.random() * 3) + 1;
          }
        }
      }
    }

    this.updateDropInterval();
    this.nextPieceType = this.randomPieceType();
    this.spawnPiece();
    this.state = 'PLAYING';

    if (this.menuMusicSelection !== 'OFF') {
      gameBoyAudio.startTetrisBGM(this.menuMusicSelection);
    }
  }

  private randomPieceType(): TetrisPieceType {
    const types: TetrisPieceType[] = ['I', 'J', 'L', 'O', 'S', 'T', 'Z'];
    return types[Math.floor(Math.random() * types.length)];
  }

  private spawnPiece() {
    const type = this.nextPieceType;
    this.nextPieceType = this.randomPieceType();
    const shapes = TETROMINO_SHAPES[type];
    const initialRotation = 0;

    const piece: TetrisPiece = {
      type,
      x: 3,
      y: 0,
      rotation: initialRotation,
      shape: shapes[initialRotation]
    };

    if (this.checkCollision(piece, 0, 0)) {
      // Game Over
      this.state = 'GAME_OVER';
      gameBoyAudio.stopBgm();
      saveTetrisScore({
        initials: 'TET',
        score: this.score,
        lines: this.lines,
        level: this.level,
        mode: this.mode
      });
      return;
    }

    this.currentPiece = piece;
  }

  private checkCollision(piece: TetrisPiece, offsetX: number, offsetY: number, shapeOverride?: number[][]): boolean {
    const s = shapeOverride || piece.shape;
    for (let r = 0; r < s.length; r++) {
      for (let c = 0; c < s[r].length; c++) {
        if (s[r][c] !== 0) {
          const gx = piece.x + c + offsetX;
          const gy = piece.y + r + offsetY;
          if (gx < 0 || gx >= 10 || gy >= 20) return true;
          if (gy >= 0 && this.grid[gy][gx] !== 0) return true;
        }
      }
    }
    return false;
  }

  public rotatePiece(dir: 1 | -1 = 1) {
    if (!this.currentPiece || this.state !== 'PLAYING') return;
    const shapes = TETROMINO_SHAPES[this.currentPiece.type];
    const nextRot = (this.currentPiece.rotation + dir + shapes.length) % shapes.length;
    const nextShape = shapes[nextRot];

    // Try rotation with simple wall kicks
    if (!this.checkCollision(this.currentPiece, 0, 0, nextShape)) {
      this.currentPiece.rotation = nextRot;
      this.currentPiece.shape = nextShape;
      gameBoyAudio.playTetrisRotate();
    } else if (!this.checkCollision(this.currentPiece, -1, 0, nextShape)) {
      this.currentPiece.x -= 1;
      this.currentPiece.rotation = nextRot;
      this.currentPiece.shape = nextShape;
      gameBoyAudio.playTetrisRotate();
    } else if (!this.checkCollision(this.currentPiece, 1, 0, nextShape)) {
      this.currentPiece.x += 1;
      this.currentPiece.rotation = nextRot;
      this.currentPiece.shape = nextShape;
      gameBoyAudio.playTetrisRotate();
    }
  }

  public movePiece(dx: number) {
    if (!this.currentPiece || this.state !== 'PLAYING') return;
    if (!this.checkCollision(this.currentPiece, dx, 0)) {
      this.currentPiece.x += dx;
      gameBoyAudio.playTetrisMove();
    }
  }

  public hardDrop() {
    if (!this.currentPiece || this.state !== 'PLAYING') return;
    let dropDist = 0;
    while (!this.checkCollision(this.currentPiece, 0, 1)) {
      this.currentPiece.y += 1;
      dropDist++;
    }
    this.score += dropDist * 2;
    gameBoyAudio.playTetrisDrop();
    this.lockPiece();
  }

  private lockPiece() {
    if (!this.currentPiece) return;
    const s = this.currentPiece.shape;
    const pieceColorVal = this.getPieceColorIndex(this.currentPiece.type);

    for (let r = 0; r < s.length; r++) {
      for (let c = 0; c < s[r].length; c++) {
        if (s[r][c] !== 0) {
          const gx = this.currentPiece.x + c;
          const gy = this.currentPiece.y + r;
          if (gy >= 0 && gy < 20 && gx >= 0 && gx < 10) {
            this.grid[gy][gx] = pieceColorVal;
          }
        }
      }
    }

    this.currentPiece = null;
    this.checkLines();
  }

  private getPieceColorIndex(type: TetrisPieceType): number {
    switch (type) {
      case 'I': case 'O': return 1;
      case 'T': case 'J': return 2;
      case 'L': case 'S': case 'Z': return 3;
      default: return 2;
    }
  }

  private checkLines() {
    const fullLines: number[] = [];
    for (let r = 0; r < 20; r++) {
      if (this.grid[r].every(cell => cell !== 0)) {
        fullLines.push(r);
      }
    }

    if (fullLines.length > 0) {
      this.linesBeingCleared = fullLines;
      this.state = 'LINE_CLEAR_ANIM';
      this.animTimer = 0;
      gameBoyAudio.playTetrisLineClear(fullLines.length);

      // Award points (Original Nintendo Game Boy scoring formula)
      const basePoints = [0, 40, 100, 300, 1200];
      this.score += (basePoints[fullLines.length] || 0) * (this.level + 1);
      this.lines += fullLines.length;

      // Check Level Up
      const nextLevel = Math.floor(this.lines / 10);
      if (nextLevel > this.level && this.mode === 'A-TYPE') {
        this.level = nextLevel;
        this.updateDropInterval();
        gameBoyAudio.playTetrisLevelUp();
      }

      // Check B-Type Victory
      if (this.mode === 'B-TYPE' && this.lines >= this.bTypeTargetLines) {
        setTimeout(() => {
          this.triggerRocketLaunch();
        }, 600);
      }
    } else {
      this.spawnPiece();
    }
  }

  private triggerRocketLaunch() {
    this.state = 'ROCKET_LAUNCH';
    this.rocketY = 110;
    this.rocketPhase = 0;
    this.animTimer = 0;
    gameBoyAudio.stopBgm();
    gameBoyAudio.playRocketLaunch();
  }

  private updateDropInterval() {
    // Game Boy drop speeds
    const speeds = [0.8, 0.72, 0.63, 0.55, 0.47, 0.38, 0.3, 0.22, 0.13, 0.08];
    this.dropInterval = speeds[Math.min(this.level, speeds.length - 1)] || 0.08;
  }

  public update(dt: number) {
    if (this.state === 'PLAYING') {
      this.dropTimer += dt;
      const speedMod = this.keys.down ? 0.05 : this.dropInterval;

      if (this.dropTimer >= speedMod) {
        this.dropTimer = 0;
        if (this.currentPiece) {
          if (!this.checkCollision(this.currentPiece, 0, 1)) {
            this.currentPiece.y += 1;
            if (this.keys.down) this.score += 1;
          } else {
            this.lockPiece();
          }
        }
      }
    } else if (this.state === 'LINE_CLEAR_ANIM') {
      this.animTimer += dt;
      if (this.animTimer >= 0.3) {
        // Clear the lines
        this.linesBeingCleared.forEach(lineIdx => {
          this.grid.splice(lineIdx, 1);
          this.grid.unshift(new Array(10).fill(0));
        });
        this.linesBeingCleared = [];
        this.state = 'PLAYING';
        this.spawnPiece();
      }
    } else if (this.state === 'ROCKET_LAUNCH') {
      this.animTimer += dt;
      if (this.animTimer > 1.2) {
        this.rocketY -= dt * 35;
      }
    }
  }

  public setKey(key: 'left' | 'right' | 'down' | 'rotateCW' | 'rotateCCW' | 'hardDrop', pressed: boolean) {
    this.keys[key] = pressed;

    if (pressed) {
      if (this.state === 'MENU') {
        if (key === 'rotateCW' || key === 'rotateCCW' || key === 'hardDrop') {
          this.startGame(this.menuModeSelection, 0);
        } else if (key === 'left' || key === 'right') {
          this.menuModeSelection = this.menuModeSelection === 'A-TYPE' ? 'B-TYPE' : 'A-TYPE';
        }
      } else if (this.state === 'PLAYING') {
        if (key === 'left') this.movePiece(-1);
        else if (key === 'right') this.movePiece(1);
        else if (key === 'rotateCW') this.rotatePiece(1);
        else if (key === 'rotateCCW') this.rotatePiece(-1);
        else if (key === 'hardDrop') this.hardDrop();
      } else if (this.state === 'GAME_OVER' || this.state === 'ROCKET_LAUNCH') {
        if (key === 'rotateCW' || key === 'rotateCCW' || key === 'hardDrop') {
          this.state = 'MENU';
        }
      }
    }
  }

  // ==========================================
  // RENDERER (AUTHENTIC GAME BOY SIDEBAR & 4-SHADE LCD)
  // ==========================================

  public render(ctx: CanvasRenderingContext2D) {
    const pal = GAME_BOY_PALETTES[this.palette].colors;
    const [c0, c1, c2, c3] = pal;

    // Clear screen
    ctx.fillStyle = c0;
    ctx.fillRect(0, 0, this.width, this.height);

    if (this.state === 'MENU') {
      this.renderMenu(ctx, pal);
      return;
    }

    if (this.state === 'ROCKET_LAUNCH') {
      this.renderRocketLaunch(ctx, pal);
      return;
    }

    // Left Border & Playfield (10 cols * 8px = 80px wide, 144px high)
    const playfieldX = 8;
    const playfieldY = 4;
    const cellSize = 6.8;

    // Playfield outer border
    ctx.fillStyle = c3;
    ctx.fillRect(playfieldX - 2, playfieldY - 2, 10 * cellSize + 4, 20 * cellSize + 4);
    ctx.fillStyle = c0;
    ctx.fillRect(playfieldX, playfieldY, 10 * cellSize, 20 * cellSize);

    // Render Grid
    for (let r = 0; r < 20; r++) {
      const isClearing = this.linesBeingCleared.includes(r);
      for (let c = 0; c < 10; c++) {
        const val = this.grid[r][c];
        if (val !== 0) {
          if (isClearing && Math.floor(this.animTimer * 15) % 2 === 0) {
            ctx.fillStyle = c0;
          } else {
            ctx.fillStyle = val === 1 ? c2 : val === 2 ? c3 : c1;
          }
          ctx.fillRect(playfieldX + c * cellSize + 0.5, playfieldY + r * cellSize + 0.5, cellSize - 1, cellSize - 1);
          // 8-bit stipple inner border
          ctx.fillStyle = c3;
          ctx.strokeRect(playfieldX + c * cellSize + 0.5, playfieldY + r * cellSize + 0.5, cellSize - 1, cellSize - 1);
        }
      }
    }

    // Render Active Piece & Ghost
    if (this.currentPiece && this.state === 'PLAYING') {
      const s = this.currentPiece.shape;
      const colorVal = this.getPieceColorIndex(this.currentPiece.type);

      for (let r = 0; r < s.length; r++) {
        for (let c = 0; c < s[r].length; c++) {
          if (s[r][c] !== 0) {
            const gx = this.currentPiece.x + c;
            const gy = this.currentPiece.y + r;
            if (gy >= 0 && gy < 20 && gx >= 0 && gx < 10) {
              ctx.fillStyle = colorVal === 1 ? c2 : colorVal === 2 ? c3 : c1;
              ctx.fillRect(playfieldX + gx * cellSize + 0.5, playfieldY + gy * cellSize + 0.5, cellSize - 1, cellSize - 1);
              ctx.fillStyle = c3;
              ctx.strokeRect(playfieldX + gx * cellSize + 0.5, playfieldY + gy * cellSize + 0.5, cellSize - 1, cellSize - 1);
            }
          }
        }
      }
    }

    // ==========================================
    // RIGHT SIDEBAR (GAME BOY STATS & NEXT PIECE)
    // ==========================================
    const sideX = 86;

    // Mode Tag
    ctx.fillStyle = c3;
    ctx.font = 'bold 8px monospace';
    ctx.fillText(this.mode, sideX, 14);

    // SCORE
    ctx.fillStyle = c2;
    ctx.font = '7px monospace';
    ctx.fillText('SCORE', sideX, 28);
    ctx.fillStyle = c3;
    ctx.font = 'bold 8px monospace';
    ctx.fillText(String(this.score).padStart(6, '0'), sideX, 38);

    // LEVEL
    ctx.fillStyle = c2;
    ctx.font = '7px monospace';
    ctx.fillText('LEVEL', sideX, 50);
    ctx.fillStyle = c3;
    ctx.font = 'bold 8px monospace';
    ctx.fillText(String(this.level), sideX + 12, 60);

    // LINES
    ctx.fillStyle = c2;
    ctx.font = '7px monospace';
    ctx.fillText('LINES', sideX, 72);
    ctx.fillStyle = c3;
    ctx.font = 'bold 8px monospace';
    ctx.fillText(String(this.lines).padStart(3, '0'), sideX, 82);

    // NEXT PIECE PREVIEW BOX
    ctx.fillStyle = c3;
    ctx.strokeRect(sideX, 92, 48, 44);
    ctx.fillStyle = c2;
    ctx.font = '7px monospace';
    ctx.fillText('NEXT', sideX + 14, 102);

    const nextShapes = TETROMINO_SHAPES[this.nextPieceType][0];
    const nCellSize = 6;
    const nOffsetX = sideX + 24 - (nextShapes[0].length * nCellSize) / 2;
    const nOffsetY = 112;

    for (let r = 0; r < nextShapes.length; r++) {
      for (let c = 0; c < nextShapes[r].length; c++) {
        if (nextShapes[r][c] !== 0) {
          ctx.fillStyle = c3;
          ctx.fillRect(nOffsetX + c * nCellSize, nOffsetY + r * nCellSize, nCellSize - 1, nCellSize - 1);
        }
      }
    }

    if (this.state === 'GAME_OVER') {
      ctx.fillStyle = c3;
      ctx.fillRect(18, 55, 60, 24);
      ctx.fillStyle = c0;
      ctx.font = 'bold 8px monospace';
      ctx.fillText('GAME OVER', 22, 70);
    }
  }

  private renderMenu(ctx: CanvasRenderingContext2D, pal: string[]) {
    const [c0, c1, c2, c3] = pal;

    ctx.fillStyle = c3;
    ctx.fillRect(0, 0, 160, 144);
    ctx.fillStyle = c0;
    ctx.fillRect(6, 6, 148, 132);

    // TETRIS Big Title
    ctx.fillStyle = c3;
    ctx.font = 'bold 18px monospace';
    ctx.fillText('TETRIS', 48, 30);

    ctx.fillStyle = c2;
    ctx.font = '7px monospace';
    ctx.fillText('© 1989 Nintendo', 46, 42);
    ctx.fillText('© 1989 V/O Electronorgtechnica', 20, 52);

    // Game Mode Selection
    ctx.fillStyle = c3;
    ctx.font = 'bold 9px monospace';
    ctx.fillText('GAME TYPE', 50, 72);

    ctx.fillStyle = this.menuModeSelection === 'A-TYPE' ? c3 : c1;
    ctx.fillText(`${this.menuModeSelection === 'A-TYPE' ? '▶ ' : '  '}A-TYPE (Endless)`, 26, 88);

    ctx.fillStyle = this.menuModeSelection === 'B-TYPE' ? c3 : c1;
    ctx.fillText(`${this.menuModeSelection === 'B-TYPE' ? '▶ ' : '  '}B-TYPE (25 Lines)`, 26, 102);

    ctx.fillStyle = c2;
    ctx.font = '8px monospace';
    ctx.fillText('PRESS [A] OR [START]', 28, 126);
  }

  private renderRocketLaunch(ctx: CanvasRenderingContext2D, pal: string[]) {
    const [c0, c1, c2, c3] = pal;

    ctx.fillStyle = c0;
    ctx.fillRect(0, 0, 160, 144);

    // Launch Pad St. Basil's cathedral silhouette
    ctx.fillStyle = c1;
    ctx.fillRect(0, 120, 160, 24);
    ctx.fillStyle = c2;
    ctx.fillRect(20, 105, 30, 15);
    ctx.fillRect(110, 105, 30, 15);

    // Flying Soyuz/Buran Rocket
    const rx = 80;
    const ry = this.rocketY;

    // Rocket Body
    ctx.fillStyle = c3;
    ctx.fillRect(rx - 8, ry, 16, 32);
    ctx.beginPath();
    ctx.moveTo(rx - 8, ry);
    ctx.lineTo(rx, ry - 14);
    ctx.lineTo(rx + 8, ry);
    ctx.fill();

    // Boosters
    ctx.fillRect(rx - 13, ry + 12, 5, 20);
    ctx.fillRect(rx + 8, ry + 12, 5, 20);

    // Rocket Fire & Exhaust Smoke
    if (this.animTimer > 1.0) {
      ctx.fillStyle = c2;
      ctx.beginPath();
      ctx.moveTo(rx - 6, ry + 32);
      ctx.lineTo(rx, ry + 46 + Math.sin(this.animTimer * 20) * 4);
      ctx.lineTo(rx + 6, ry + 32);
      ctx.fill();

      // Smoke clouds
      for (let i = 0; i < 8; i++) {
        const sx = rx + Math.sin(i + this.animTimer * 5) * 20;
        const sy = ry + 38 + i * 4;
        ctx.fillStyle = c1;
        ctx.beginPath();
        ctx.arc(sx, sy, 6 + i, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Triumph Banner
    ctx.fillStyle = c3;
    ctx.font = 'bold 10px monospace';
    ctx.fillText('CONGRATULATIONS!', 28, 20);
    ctx.font = 'bold 8px monospace';
    ctx.fillText(`SCORE: ${this.score}`, 50, 34);
    ctx.fillStyle = c2;
    ctx.fillText('PRESS [START] TO RETURN', 24, 138);
  }
}
