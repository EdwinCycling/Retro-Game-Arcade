/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Nintendo Game Boy (1990) Dr. Mario Engine (DMG-VU-USA)
 * Recreates the pill tossing, virus clearing, magnifying glass animation & match-4 mechanics.
 */

import { GameBoyPaletteMode, GAME_BOY_PALETTES } from './gameBoyTypes';
import { gameBoyAudio } from './gameBoyAudio';

export interface Virus {
  x: number;
  y: number;
  type: 1 | 2 | 3; // 1: Light, 2: Medium, 3: Dark
  alive: boolean;
  animFrame: number;
}

export interface PillBlock {
  type: 1 | 2 | 3;
}

export class GameBoyDrMarioEngine {
  public palette: GameBoyPaletteMode = 'dmg';
  public state: 'TITLE' | 'PLAYING' | 'GAMEOVER' | 'VICTORY' = 'TITLE';
  public score: number = 0;
  public topScore: number = 12000;
  public level: number = 5;
  public speed: 'LOW' | 'MED' | 'HI' = 'MED';
  public virusesRemaining: number = 4;

  // Grid: 8 columns x 16 rows
  public grid: (PillBlock | null)[][] = [];
  public viruses: Virus[] = [];

  // Active Pill
  public pillX: number = 3;
  public pillY: number = 0;
  public pillRot: 0 | 1 | 2 | 3 = 0; // 0: horizontal, 1: vertical, 2: flipped horiz, 3: flipped vert
  public pillLeftType: 1 | 2 | 3 = 1;
  public pillRightType: 1 | 2 | 3 = 2;
  public nextLeftType: 1 | 2 | 3 = 1;
  public nextRightType: 1 | 2 | 3 = 3;

  private dropTimer: number = 0;
  private dropInterval: number = 0.6;
  private animTimer: number = 0;
  private keyState = { left: false, right: false, down: false, a: false, b: false };

  constructor() {
    this.initGrid();
  }

  public initGrid() {
    this.grid = [];
    for (let r = 0; r < 16; r++) {
      this.grid.push(new Array(8).fill(null));
    }
  }

  public startGame(lvl = 5) {
    this.level = lvl;
    this.score = 0;
    this.virusesRemaining = lvl * 2 + 4;
    this.state = 'PLAYING';
    this.initGrid();
    this.spawnViruses();
    this.spawnPill();
    gameBoyAudio.startDrMarioBGM();
  }

  private spawnViruses() {
    this.viruses = [];
    let count = this.virusesRemaining;
    while (count > 0) {
      const rx = Math.floor(Math.random() * 8);
      const ry = Math.floor(Math.random() * 9) + 7; // bottom half
      if (!this.grid[ry][rx]) {
        const type = ((count % 3) + 1) as 1 | 2 | 3;
        this.grid[ry][rx] = { type };
        this.viruses.push({ x: rx, y: ry, type, alive: true, animFrame: 0 });
        count--;
      }
    }
  }

  private spawnPill() {
    this.pillX = 3;
    this.pillY = 0;
    this.pillRot = 0;
    this.pillLeftType = this.nextLeftType;
    this.pillRightType = this.nextRightType;
    this.nextLeftType = (Math.floor(Math.random() * 3) + 1) as 1 | 2 | 3;
    this.nextRightType = (Math.floor(Math.random() * 3) + 1) as 1 | 2 | 3;

    if (this.grid[0][3] || this.grid[0][4]) {
      this.state = 'GAMEOVER';
      gameBoyAudio.stopBgm();
      gameBoyAudio.playDrMarioGameOver();
    }
  }

  public setKey(key: 'left' | 'right' | 'down' | 'a' | 'b', pressed: boolean) {
    this.keyState[key] = pressed;
    if (!pressed || this.state !== 'PLAYING') return;

    if (key === 'left') {
      if (this.canMoveTo(this.pillX - 1, this.pillY, this.pillRot)) {
        this.pillX--;
        gameBoyAudio.playDrMarioPillRotate();
      }
    } else if (key === 'right') {
      if (this.canMoveTo(this.pillX + 1, this.pillY, this.pillRot)) {
        this.pillX++;
        gameBoyAudio.playDrMarioPillRotate();
      }
    } else if (key === 'a') {
      const newRot = ((this.pillRot + 1) % 4) as 0 | 1 | 2 | 3;
      if (this.canMoveTo(this.pillX, this.pillY, newRot)) {
        this.pillRot = newRot;
        gameBoyAudio.playDrMarioPillRotate();
      }
    } else if (key === 'b') {
      const newRot = ((this.pillRot + 3) % 4) as 0 | 1 | 2 | 3;
      if (this.canMoveTo(this.pillX, this.pillY, newRot)) {
        this.pillRot = newRot;
        gameBoyAudio.playDrMarioPillRotate();
      }
    } else if (key === 'down') {
      this.dropInterval = 0.05;
    }
  }

  private canMoveTo(px: number, py: number, rot: 0 | 1 | 2 | 3): boolean {
    const isVertical = rot === 1 || rot === 3;
    if (isVertical) {
      if (px < 0 || px >= 8 || py < 0 || py + 1 >= 16) return false;
      return !this.grid[py][px] && !this.grid[py + 1][px];
    } else {
      if (px < 0 || px + 1 >= 8 || py < 0 || py >= 16) return false;
      return !this.grid[py][px] && !this.grid[py][px + 1];
    }
  }

  public update(dt: number) {
    if (this.state !== 'PLAYING') return;

    this.animTimer += dt;
    this.dropTimer += dt;

    const interval = this.keyState.down ? 0.06 : 0.55;
    if (this.dropTimer >= interval) {
      this.dropTimer = 0;
      if (this.canMoveTo(this.pillX, this.pillY + 1, this.pillRot)) {
        this.pillY++;
      } else {
        this.lockPill();
      }
    }
  }

  private lockPill() {
    const isVertical = this.pillRot === 1 || this.pillRot === 3;
    if (isVertical) {
      const topType = this.pillRot === 1 ? this.pillLeftType : this.pillRightType;
      const botType = this.pillRot === 1 ? this.pillRightType : this.pillLeftType;
      this.grid[this.pillY][this.pillX] = { type: topType };
      this.grid[this.pillY + 1][this.pillX] = { type: botType };
    } else {
      const leftType = this.pillRot === 0 ? this.pillLeftType : this.pillRightType;
      const rightType = this.pillRot === 0 ? this.pillRightType : this.pillLeftType;
      this.grid[this.pillY][this.pillX] = { type: leftType };
      this.grid[this.pillY][this.pillX + 1] = { type: rightType };
    }

    this.checkMatches();
    if (this.virusesRemaining <= 0) {
      this.state = 'VICTORY';
      gameBoyAudio.stopBgm();
      gameBoyAudio.playDrMarioStageClear();
    } else {
      this.spawnPill();
    }
  }

  private checkMatches() {
    const toClear: boolean[][] = [];
    for (let r = 0; r < 16; r++) toClear.push(new Array(8).fill(false));

    let clearedAny = false;

    // Check horizontal 4-matches
    for (let r = 0; r < 16; r++) {
      for (let c = 0; c <= 4; c++) {
        const b = this.grid[r][c];
        if (b) {
          let count = 1;
          while (c + count < 8 && this.grid[r][c + count]?.type === b.type) {
            count++;
          }
          if (count >= 4) {
            for (let i = 0; i < count; i++) toClear[r][c + i] = true;
            clearedAny = true;
          }
        }
      }
    }

    // Check vertical 4-matches
    for (let c = 0; c < 8; c++) {
      for (let r = 0; r <= 12; r++) {
        const b = this.grid[r][c];
        if (b) {
          let count = 1;
          while (r + count < 16 && this.grid[r + count][c]?.type === b.type) {
            count++;
          }
          if (count >= 4) {
            for (let i = 0; i < count; i++) toClear[r + i][c] = true;
            clearedAny = true;
          }
        }
      }
    }

    if (clearedAny) {
      let virKilled = 0;
      for (let r = 0; r < 16; r++) {
        for (let c = 0; c < 8; c++) {
          if (toClear[r][c]) {
            // Check if it was a virus
            const virIdx = this.viruses.findIndex(v => v.alive && v.x === c && v.y === r);
            if (virIdx !== -1) {
              this.viruses[virIdx].alive = false;
              virKilled++;
            }
            this.grid[r][c] = null;
          }
        }
      }
      this.virusesRemaining = Math.max(0, this.virusesRemaining - virKilled);
      this.score += 200 * (virKilled > 0 ? virKilled : 1);
      gameBoyAudio.playDrMarioVirusClear();
    }
  }

  public render(ctx: CanvasRenderingContext2D) {
    const pal = GAME_BOY_PALETTES[this.palette].colors;
    const [c0, c1, c2, c3] = pal;

    // Background
    ctx.fillStyle = c0;
    ctx.fillRect(0, 0, 160, 144);

    if (this.state === 'TITLE') {
      ctx.fillStyle = c3;
      ctx.font = 'bold 12px monospace';
      ctx.fillText('DR. MARIO', 48, 36);
      ctx.font = '8px monospace';
      ctx.fillText('©1990 NINTENDO', 38, 54);

      // Pill Graphic
      ctx.fillStyle = c2;
      ctx.fillRect(60, 68, 20, 10);
      ctx.fillStyle = c1;
      ctx.fillRect(80, 68, 20, 10);
      ctx.strokeRect(60, 68, 40, 10);

      ctx.fillStyle = c3;
      ctx.fillText('PRESS START', 46, 110);
      ctx.fillText(`TOP SCORE: ${this.topScore}`, 34, 126);
      return;
    }

    // Draw Beaker Bottle (Left side)
    const bx = 16;
    const by = 16;
    const bw = 8 * 7;
    const bh = 16 * 7;

    // Beaker border
    ctx.strokeStyle = c3;
    ctx.lineWidth = 2;
    ctx.strokeRect(bx - 2, by - 2, bw + 4, bh + 4);

    // Grid contents
    for (let r = 0; r < 16; r++) {
      for (let c = 0; c < 8; c++) {
        const b = this.grid[r][c];
        if (b) {
          const px = bx + c * 7;
          const py = by + r * 7;
          const isVir = this.viruses.some(v => v.alive && v.x === c && v.y === r);

          if (isVir) {
            // Virus rendering
            ctx.fillStyle = b.type === 1 ? c1 : b.type === 2 ? c2 : c3;
            ctx.fillRect(px + 1, py + 1, 5, 5);
            ctx.fillStyle = c0;
            ctx.fillRect(px + 2, py + 2, 1, 1);
            ctx.fillRect(px + 4, py + 2, 1, 1);
          } else {
            // Capsule half
            ctx.fillStyle = b.type === 1 ? c1 : b.type === 2 ? c2 : c3;
            ctx.beginPath();
            ctx.arc(px + 3.5, py + 3.5, 3, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = c3;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }
    }

    // Render Active Dropping Pill
    const isVertical = this.pillRot === 1 || this.pillRot === 3;
    if (isVertical) {
      const topType = this.pillRot === 1 ? this.pillLeftType : this.pillRightType;
      const botType = this.pillRot === 1 ? this.pillRightType : this.pillLeftType;
      this.drawCapsuleSegment(ctx, bx + this.pillX * 7, by + this.pillY * 7, topType, pal);
      this.drawCapsuleSegment(ctx, bx + this.pillX * 7, by + (this.pillY + 1) * 7, botType, pal);
    } else {
      const leftType = this.pillRot === 0 ? this.pillLeftType : this.pillRightType;
      const rightType = this.pillRot === 0 ? this.pillRightType : this.pillLeftType;
      this.drawCapsuleSegment(ctx, bx + this.pillX * 7, by + this.pillY * 7, leftType, pal);
      this.drawCapsuleSegment(ctx, bx + (this.pillX + 1) * 7, by + this.pillY * 7, rightType, pal);
    }

    // Right HUD Panel
    const hx = 88;
    ctx.fillStyle = c3;
    ctx.font = '8px monospace';
    ctx.fillText(`SCORE`, hx, 22);
    ctx.fillText(`${this.score.toString().padStart(6, '0')}`, hx, 32);

    ctx.fillText(`TOP`, hx, 46);
    ctx.fillText(`${this.topScore.toString().padStart(6, '0')}`, hx, 56);

    ctx.fillText(`LVL  ${this.level}`, hx, 72);
    ctx.fillText(`VIRUS`, hx, 86);
    ctx.font = 'bold 10px monospace';
    ctx.fillText(`${this.virusesRemaining.toString().padStart(2, '0')}`, hx + 12, 98);

    // Magnifying Glass with bouncing animated virus
    ctx.strokeStyle = c3;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(hx + 24, 122, 14, 0, Math.PI * 2);
    ctx.stroke();

    const bounce = Math.sin(this.animTimer * 6) * 2;
    ctx.fillStyle = c2;
    ctx.fillRect(hx + 20, 118 + bounce, 8, 8);
    ctx.fillStyle = c0;
    ctx.fillRect(hx + 22, 120 + bounce, 2, 2);
    ctx.fillRect(hx + 25, 120 + bounce, 2, 2);

    if (this.state === 'GAMEOVER') {
      ctx.fillStyle = c3;
      ctx.fillRect(24, 60, 112, 30);
      ctx.fillStyle = c0;
      ctx.font = 'bold 10px monospace';
      ctx.fillText('GAME OVER', 46, 78);
    } else if (this.state === 'VICTORY') {
      ctx.fillStyle = c3;
      ctx.fillRect(24, 60, 112, 30);
      ctx.fillStyle = c0;
      ctx.font = 'bold 10px monospace';
      ctx.fillText('STAGE CLEAR!', 40, 78);
    }
  }

  private drawCapsuleSegment(ctx: CanvasRenderingContext2D, x: number, y: number, type: 1 | 2 | 3, pal: string[]) {
    const [, c1, c2, c3] = pal;
    ctx.fillStyle = type === 1 ? c1 : type === 2 ? c2 : c3;
    ctx.fillRect(x + 1, y + 1, 5, 5);
    ctx.strokeStyle = c3;
    ctx.lineWidth = 0.8;
    ctx.strokeRect(x + 1, y + 1, 5, 5);
  }
}
