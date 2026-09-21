/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Tetris Arcade Canvas Renderer (Alexey Pajitnov / 1984 & 1989 Arcade)
 * Features retro beveled blocks, ghost piece, side panels, CRT scanlines & particles
 */

import {
  BOARD_COLS,
  BOARD_ROWS,
  BUFFER_ROWS,
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  TetrominoType,
} from './tetrisTypes';
import { TETROMINOES, TetrisEngine } from './tetrisEngine';

const CELL_SIZE = 24;
const BOARD_WIDTH = BOARD_COLS * CELL_SIZE; // 240px
const BOARD_HEIGHT = BOARD_ROWS * CELL_SIZE; // 480px

const BOARD_X = 120; // x offset on canvas
const BOARD_Y = 110; // y offset on canvas

export class TetrisRenderer {
  private ctx: CanvasRenderingContext2D;
  public enableCRT: boolean = true;

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
  }

  public render(engine: TetrisEngine) {
    const ctx = this.ctx;
    ctx.save();

    // Clear canvas
    ctx.fillStyle = '#09090b';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Apply Screen Shake if any
    if (engine.screenShake > 0) {
      const shakeX = (Math.random() - 0.5) * engine.screenShake;
      const shakeY = (Math.random() - 0.5) * engine.screenShake;
      ctx.translate(shakeX, shakeY);
    }

    // Draw Marquee Header
    this.drawHeader(ctx);

    // Draw Left Panel (Hold Piece + Stats)
    this.drawLeftPanel(ctx, engine);

    // Draw Right Panel (Next Piece + Scores)
    this.drawRightPanel(ctx, engine);

    // Draw Matrix Board Frame & Background
    this.drawBoardBackground(ctx);

    // Draw Locked Blocks on Board
    this.drawLockedBlocks(ctx, engine);

    // Draw Ghost Piece
    if (engine.gameState === 'PLAYING' && engine.currentPiece) {
      this.drawGhostPiece(ctx, engine);
    }

    // Draw Active Falling Piece
    if (engine.currentPiece && (engine.gameState === 'PLAYING' || engine.gameState === 'PAUSED')) {
      this.drawActivePiece(ctx, engine);
    }

    // Draw Line Clearing Flash
    if (engine.gameState === 'LINE_CLEAR') {
      this.drawLineClearFlash(ctx, engine);
    }

    // Draw Particles
    this.drawParticles(ctx, engine);

    // Draw Floating Text (TETRIS!!, +800, LEVEL UP)
    this.drawFloatingTexts(ctx, engine);

    // Draw Game Over or Title Overlays
    if (engine.gameState === 'TITLE') {
      this.drawTitleOverlay(ctx);
    } else if (engine.gameState === 'GAME_OVER') {
      this.drawGameOverOverlay(ctx, engine);
    } else if (engine.gameState === 'PAUSED') {
      this.drawPausedOverlay(ctx);
    }

    // Draw CRT Scanlines and Glass Curvature
    if (this.enableCRT) {
      this.drawCRTEffect(ctx);
    }

    ctx.restore();
  }

  private drawHeader(ctx: CanvasRenderingContext2D) {
    // Vintage arcade top banner
    ctx.fillStyle = '#18181b';
    ctx.fillRect(10, 10, CANVAS_WIDTH - 20, 85);

    // Decorative retro border
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 2;
    ctx.strokeRect(10, 10, CANVAS_WIDTH - 20, 85);

    // Inner gold border
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 1;
    ctx.strokeRect(14, 14, CANVAS_WIDTH - 28, 77);

    // Russian Cyrillic & English title
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ef4444';
    ctx.font = '900 24px monospace';
    ctx.shadowColor = '#ef4444';
    ctx.shadowBlur = 10;
    ctx.fillText('ТЕТРИС  ★  TETRIS', CANVAS_WIDTH / 2, 42);

    ctx.shadowBlur = 0;
    ctx.fillStyle = '#facc15';
    ctx.font = 'bold 11px monospace';
    ctx.fillText('1984 • ALEXEY PAJITNOV • MOSCOW ACADEMY', CANVAS_WIDTH / 2, 62);

    ctx.fillStyle = '#38bdf8';
    ctx.font = '10px monospace';
    ctx.fillText('ORIGINAL ELEKTRONIKA 60 & ARCADE ENGINE', CANVAS_WIDTH / 2, 78);
  }

  private drawBoardBackground(ctx: CanvasRenderingContext2D) {
    // Outer border frame
    ctx.fillStyle = '#111827';
    ctx.fillRect(BOARD_X - 4, BOARD_Y - 4, BOARD_WIDTH + 8, BOARD_HEIGHT + 8);

    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.shadowColor = '#0284c7';
    ctx.shadowBlur = 8;
    ctx.strokeRect(BOARD_X - 4, BOARD_Y - 4, BOARD_WIDTH + 8, BOARD_HEIGHT + 8);
    ctx.shadowBlur = 0;

    // Inside matrix
    ctx.fillStyle = '#030712';
    ctx.fillRect(BOARD_X, BOARD_Y, BOARD_WIDTH, BOARD_HEIGHT);

    // Grid lines
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.08)';
    ctx.lineWidth = 1;
    for (let c = 1; c < BOARD_COLS; c++) {
      ctx.beginPath();
      ctx.moveTo(BOARD_X + c * CELL_SIZE, BOARD_Y);
      ctx.lineTo(BOARD_X + c * CELL_SIZE, BOARD_Y + BOARD_HEIGHT);
      ctx.stroke();
    }
    for (let r = 1; r < BOARD_ROWS; r++) {
      ctx.beginPath();
      ctx.moveTo(BOARD_X, BOARD_Y + r * CELL_SIZE);
      ctx.lineTo(BOARD_X + BOARD_WIDTH, BOARD_Y + r * CELL_SIZE);
      ctx.stroke();
    }
  }

  private drawLockedBlocks(ctx: CanvasRenderingContext2D, engine: TetrisEngine) {
    for (let r = BUFFER_ROWS; r < engine.board.length; r++) {
      const displayY = r - BUFFER_ROWS;
      for (let c = 0; c < BOARD_COLS; c++) {
        const cell = engine.board[r][c];
        if (cell) {
          const px = BOARD_X + c * CELL_SIZE;
          const py = BOARD_Y + displayY * CELL_SIZE;
          this.drawBeveledBlock(ctx, px, py, CELL_SIZE, cell.color, cell.glowColor, cell.shadowColor);
        }
      }
    }
  }

  private drawGhostPiece(ctx: CanvasRenderingContext2D, engine: TetrisEngine) {
    if (!engine.currentPiece) return;
    const def = TETROMINOES[engine.currentPiece.type];
    const shape = def.shapes[engine.currentPiece.rotation];
    const ghostY = engine.getGhostY();

    ctx.save();
    ctx.strokeStyle = def.glowColor;
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 2]);

    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[r].length; c++) {
        if (shape[r][c] !== 0) {
          const displayR = ghostY + r - BUFFER_ROWS;
          if (displayR >= 0 && displayR < BOARD_ROWS) {
            const px = BOARD_X + (engine.currentPiece.x + c) * CELL_SIZE;
            const py = BOARD_Y + displayR * CELL_SIZE;
            ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
            ctx.fillRect(px + 1, py + 1, CELL_SIZE - 2, CELL_SIZE - 2);
            ctx.strokeRect(px + 1.5, py + 1.5, CELL_SIZE - 3, CELL_SIZE - 3);
          }
        }
      }
    }

    ctx.restore();
  }

  private drawActivePiece(ctx: CanvasRenderingContext2D, engine: TetrisEngine) {
    if (!engine.currentPiece) return;
    const def = TETROMINOES[engine.currentPiece.type];
    const shape = def.shapes[engine.currentPiece.rotation];

    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[r].length; c++) {
        if (shape[r][c] !== 0) {
          const displayR = engine.currentPiece.y + r - BUFFER_ROWS;
          if (displayR >= 0 && displayR < BOARD_ROWS) {
            const px = BOARD_X + (engine.currentPiece.x + c) * CELL_SIZE;
            const py = BOARD_Y + displayR * CELL_SIZE;
            this.drawBeveledBlock(ctx, px, py, CELL_SIZE, def.color, def.glowColor, def.shadowColor);
          }
        }
      }
    }
  }

  private drawBeveledBlock(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    size: number,
    mainColor: string,
    lightColor: string,
    darkColor: string
  ) {
    const bevel = 3;

    // Main body
    ctx.fillStyle = mainColor;
    ctx.fillRect(x, y, size, size);

    // Top light edge
    ctx.fillStyle = lightColor;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + size, y);
    ctx.lineTo(x + size - bevel, y + bevel);
    ctx.lineTo(x + bevel, y + bevel);
    ctx.closePath();
    ctx.fill();

    // Left light edge
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + bevel, y + bevel);
    ctx.lineTo(x + bevel, y + size - bevel);
    ctx.lineTo(x, y + size);
    ctx.closePath();
    ctx.fill();

    // Bottom dark edge
    ctx.fillStyle = darkColor;
    ctx.beginPath();
    ctx.moveTo(x, y + size);
    ctx.lineTo(x + bevel, y + size - bevel);
    ctx.lineTo(x + size - bevel, y + size - bevel);
    ctx.lineTo(x + size, y + size);
    ctx.closePath();
    ctx.fill();

    // Right dark edge
    ctx.beginPath();
    ctx.moveTo(x + size, y);
    ctx.lineTo(x + size, y + size);
    ctx.lineTo(x + size - bevel, y + size - bevel);
    ctx.lineTo(x + size - bevel, y + bevel);
    ctx.closePath();
    ctx.fill();

    // Center shine dot
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.fillRect(x + bevel + 1, y + bevel + 1, 2, 2);
  }

  private drawLeftPanel(ctx: CanvasRenderingContext2D, engine: TetrisEngine) {
    const panelX = 14;
    const panelY = 110;
    const panelW = 96;

    // 1. HOLD BOX
    this.drawSubBox(ctx, panelX, panelY, panelW, 90, 'HOLD (C)');
    if (engine.holdPiece) {
      this.drawMiniPiece(ctx, engine.holdPiece, panelX + panelW / 2, panelY + 50, engine.canHold ? 1 : 0.4);
    } else {
      ctx.fillStyle = '#52525b';
      ctx.font = '10px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('EMPTY', panelX + panelW / 2, panelY + 54);
    }

    // 2. STATS BOXES
    const statsY = panelY + 105;

    // LEVEL
    this.drawSubBox(ctx, panelX, statsY, panelW, 65, 'LEVEL');
    ctx.fillStyle = '#4ade80';
    ctx.font = 'bold 20px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`${engine.level}`, panelX + panelW / 2, statsY + 45);

    // LINES
    const linesY = statsY + 80;
    this.drawSubBox(ctx, panelX, linesY, panelW, 65, 'LINES');
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 20px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`${engine.lines}`, panelX + panelW / 2, linesY + 45);

    // CONTROLS HINT
    const hintsY = linesY + 80;
    ctx.fillStyle = '#71717a';
    ctx.font = '9px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('CONTROLS:', panelX, hintsY + 12);
    ctx.fillText('◄ / ► : Move', panelX, hintsY + 26);
    ctx.fillText('▲ : Rotate', panelX, hintsY + 40);
    ctx.fillText('▼ : Soft Drop', panelX, hintsY + 54);
    ctx.fillText('SPACE: Drop', panelX, hintsY + 68);
    ctx.fillText('C : Hold', panelX, hintsY + 82);
    ctx.fillText('P : Pause', panelX, hintsY + 96);
  }

  private drawRightPanel(ctx: CanvasRenderingContext2D, engine: TetrisEngine) {
    const panelX = 370;
    const panelY = 110;
    const panelW = 96;

    // 1. NEXT PIECE BOX
    this.drawSubBox(ctx, panelX, panelY, panelW, 90, 'NEXT');
    if (engine.nextPiece) {
      this.drawMiniPiece(ctx, engine.nextPiece, panelX + panelW / 2, panelY + 50, 1);
    }

    // 2. SCORE BOX
    const scoreY = panelY + 105;
    this.drawSubBox(ctx, panelX, scoreY, panelW, 75, 'SCORE');
    ctx.fillStyle = '#facc15';
    ctx.font = 'bold 16px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(engine.score.toLocaleString(), panelX + panelW / 2, scoreY + 45);

    // 3. TOP RECORD BOX
    const topY = scoreY + 90;
    this.drawSubBox(ctx, panelX, topY, panelW, 75, 'HI-SCORE');
    ctx.fillStyle = '#f43f5e';
    ctx.font = 'bold 16px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(engine.highScore.toLocaleString(), panelX + panelW / 2, topY + 45);

    // 4. SPEED TIER
    const speedY = topY + 90;
    this.drawSubBox(ctx, panelX, speedY, panelW, 60, 'DROP RATE');
    ctx.fillStyle = '#a855f7';
    ctx.font = 'bold 14px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`LVL ${engine.level} SPD`, panelX + panelW / 2, speedY + 40);
  }

  private drawSubBox(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    title: string
  ) {
    ctx.fillStyle = '#18181b';
    ctx.fillRect(x, y, w, h);

    ctx.strokeStyle = '#27272a';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, w, h);

    // Header label
    ctx.fillStyle = '#3f3f46';
    ctx.fillRect(x, y, w, 18);

    ctx.fillStyle = '#e4e4e7';
    ctx.font = 'bold 10px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(title, x + w / 2, y + 13);
  }

  private drawMiniPiece(
    ctx: CanvasRenderingContext2D,
    type: TetrominoType,
    centerX: number,
    centerY: number,
    alpha: number = 1
  ) {
    ctx.save();
    ctx.globalAlpha = alpha;
    const def = TETROMINOES[type];
    const shape = def.shapes[0];
    const miniSize = 15;

    const shapeW = shape[0].length * miniSize;
    const shapeH = shape.length * miniSize;
    const startX = centerX - shapeW / 2;
    const startY = centerY - shapeH / 2;

    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[r].length; c++) {
        if (shape[r][c] !== 0) {
          const px = startX + c * miniSize;
          const py = startY + r * miniSize;
          this.drawBeveledBlock(ctx, px, py, miniSize, def.color, def.glowColor, def.shadowColor);
        }
      }
    }
    ctx.restore();
  }

  private drawLineClearFlash(ctx: CanvasRenderingContext2D, engine: TetrisEngine) {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    // Flash white on all clearing rows
    for (let r = BUFFER_ROWS; r < engine.board.length; r++) {
      if (engine.board[r].every((c) => c !== null)) {
        const py = BOARD_Y + (r - BUFFER_ROWS) * CELL_SIZE;
        ctx.fillRect(BOARD_X, py, BOARD_WIDTH, CELL_SIZE);
      }
    }
  }

  private drawParticles(ctx: CanvasRenderingContext2D, engine: TetrisEngine) {
    for (const p of engine.particles) {
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      const px = BOARD_X + p.x * CELL_SIZE;
      const py = BOARD_Y + p.y * CELL_SIZE;
      ctx.beginPath();
      ctx.arc(px, py, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  private drawFloatingTexts(ctx: CanvasRenderingContext2D, engine: TetrisEngine) {
    for (const ft of engine.floatingTexts) {
      ctx.save();
      ctx.globalAlpha = ft.alpha;
      ctx.fillStyle = ft.color;
      ctx.shadowColor = ft.color;
      ctx.shadowBlur = 12;
      ctx.font = `bold ${Math.floor(20 * ft.scale)}px monospace`;
      ctx.textAlign = 'center';
      const px = BOARD_X + ft.x * CELL_SIZE;
      const py = BOARD_Y + ft.y * CELL_SIZE;
      ctx.fillText(ft.text, px, py);
      ctx.restore();
    }
  }

  private drawTitleOverlay(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
    ctx.fillRect(BOARD_X - 4, BOARD_Y - 4, BOARD_WIDTH + 8, BOARD_HEIGHT + 8);

    ctx.textAlign = 'center';

    // Title
    ctx.fillStyle = '#ef4444';
    ctx.font = 'bold 28px monospace';
    ctx.shadowColor = '#ef4444';
    ctx.shadowBlur = 12;
    ctx.fillText('ТЕТРИС', BOARD_X + BOARD_WIDTH / 2, BOARD_Y + 160);

    ctx.shadowBlur = 0;
    ctx.fillStyle = '#facc15';
    ctx.font = 'bold 13px monospace';
    ctx.fillText('1984 RUSSIAN CLASSIC', BOARD_X + BOARD_WIDTH / 2, BOARD_Y + 195);

    // Instructions
    ctx.fillStyle = '#38bdf8';
    ctx.font = '11px monospace';
    ctx.fillText('ROTATE & FIT FALLING BLOCKS', BOARD_X + BOARD_WIDTH / 2, BOARD_Y + 240);
    ctx.fillText('CLEAR 4 LINES FOR A TETRIS!', BOARD_X + BOARD_WIDTH / 2, BOARD_Y + 260);

    // Blinking Start Prompt
    const blink = Math.floor(Date.now() / 400) % 2 === 0;
    if (blink) {
      ctx.fillStyle = '#4ade80';
      ctx.font = 'bold 14px monospace';
      ctx.shadowColor = '#4ade80';
      ctx.shadowBlur = 8;
      ctx.fillText('PRESS SPACE / START', BOARD_X + BOARD_WIDTH / 2, BOARD_Y + 340);
      ctx.shadowBlur = 0;
    }
  }

  private drawGameOverOverlay(ctx: CanvasRenderingContext2D, engine: TetrisEngine) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.88)';
    ctx.fillRect(BOARD_X - 4, BOARD_Y - 4, BOARD_WIDTH + 8, BOARD_HEIGHT + 8);

    ctx.textAlign = 'center';

    ctx.fillStyle = '#ef4444';
    ctx.font = 'bold 26px monospace';
    ctx.shadowColor = '#ef4444';
    ctx.shadowBlur = 12;
    ctx.fillText('GAME OVER', BOARD_X + BOARD_WIDTH / 2, BOARD_Y + 150);

    ctx.shadowBlur = 0;
    ctx.fillStyle = '#facc15';
    ctx.font = '14px monospace';
    ctx.fillText(`SCORE: ${engine.score.toLocaleString()}`, BOARD_X + BOARD_WIDTH / 2, BOARD_Y + 200);

    ctx.fillStyle = '#38bdf8';
    ctx.font = '13px monospace';
    ctx.fillText(`LINES: ${engine.lines}  •  LEVEL: ${engine.level}`, BOARD_X + BOARD_WIDTH / 2, BOARD_Y + 230);

    const blink = Math.floor(Date.now() / 400) % 2 === 0;
    if (blink) {
      ctx.fillStyle = '#4ade80';
      ctx.font = 'bold 13px monospace';
      ctx.fillText('PRESS SPACE TO RETRY', BOARD_X + BOARD_WIDTH / 2, BOARD_Y + 320);
    }
  }

  private drawPausedOverlay(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    ctx.fillRect(BOARD_X - 4, BOARD_Y - 4, BOARD_WIDTH + 8, BOARD_HEIGHT + 8);

    ctx.fillStyle = '#facc15';
    ctx.font = 'bold 22px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('PAUSED', BOARD_X + BOARD_WIDTH / 2, BOARD_Y + BOARD_HEIGHT / 2);

    ctx.fillStyle = '#a1a1aa';
    ctx.font = '12px monospace';
    ctx.fillText('PRESS P TO RESUME', BOARD_X + BOARD_WIDTH / 2, BOARD_Y + BOARD_HEIGHT / 2 + 35);
  }

  private drawCRTEffect(ctx: CanvasRenderingContext2D) {
    // Scanlines
    ctx.fillStyle = 'rgba(0, 0, 0, 0.16)';
    for (let y = 0; y < CANVAS_HEIGHT; y += 3) {
      ctx.fillRect(0, y, CANVAS_WIDTH, 1);
    }

    // Vignette
    const gradient = ctx.createRadialGradient(
      CANVAS_WIDTH / 2,
      CANVAS_HEIGHT / 2,
      CANVAS_WIDTH / 3,
      CANVAS_WIDTH / 2,
      CANVAS_HEIGHT / 2,
      CANVAS_WIDTH * 0.75
    );
    gradient.addColorStop(0, 'rgba(0,0,0,0)');
    gradient.addColorStop(1, 'rgba(0,0,0,0.5)');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  }
}
