/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Nokia Snake (1997) - Authentic 84x48 Monochromatic LCD Pixel Renderer
 */

import { NokiaSnakeEngine } from './nokiaSnakeEngine';

export class NokiaSnakeRenderer {
  // LCD Display Palette
  private readonly cBg = '#96b56f';        // Lit LCD green/grey
  private readonly cPixel = '#131e0f';     // Active dark liquid crystal
  private readonly cGhostPixel = '#8ea866'; // Inactive LCD ghost matrix

  public render(ctx: CanvasRenderingContext2D, engine: NokiaSnakeEngine) {
    const w = engine.lcdWidth;
    const h = engine.lcdHeight;

    // 1. Clear background with LCD backlight color
    ctx.fillStyle = this.cBg;
    ctx.fillRect(0, 0, w, h);

    // 2. Render Top Status Bar (Signal, Title / Score, Battery)
    this.renderStatusBar(ctx, engine);

    // 3. Render Mode Specific Content
    if (engine.state === 'MENU') {
      this.renderMenu(ctx, engine);
    } else if (engine.state === 'PLAYING' || engine.state === 'PAUSED') {
      this.renderPlayfield(ctx, engine);
      if (engine.state === 'PAUSED') {
        this.renderPaused(ctx);
      }
    } else if (engine.state === 'GAME_OVER') {
      this.renderGameOver(ctx, engine);
    }
  }

  private renderStatusBar(ctx: CanvasRenderingContext2D, engine: NokiaSnakeEngine) {
    ctx.fillStyle = this.cPixel;

    // Signal bars on the far left (4 bars: 2px, 3px, 4px, 5px high)
    const sx = 2;
    for (let i = 0; i < 4; i++) {
      if (i < engine.signalBars) {
        ctx.fillRect(sx + i * 2, 6 - (i + 1), 1, i + 2);
      }
    }

    // Battery meter on the far right
    const bx = 74;
    // Battery outline
    ctx.fillRect(bx, 2, 7, 5);
    ctx.fillStyle = this.cBg;
    ctx.fillRect(bx + 1, 3, 5, 3);
    ctx.fillStyle = this.cPixel;
    ctx.fillRect(bx + 7, 3, 1, 3); // Battery nipple
    // Battery level bars
    for (let i = 0; i < engine.batteryBars; i++) {
      ctx.fillRect(bx + 1 + i, 3, 1, 3);
    }

    // Middle Header Info (Score or Snake title)
    if (engine.state === 'PLAYING' || engine.state === 'PAUSED') {
      this.drawPixelText(ctx, `${engine.score}`, 38, 2);
    } else {
      this.drawPixelText(ctx, 'SNAKE', 32, 2);
    }

    // Horizontal separator rule under status bar
    ctx.fillRect(2, 9, 80, 1);
  }

  private renderPlayfield(ctx: CanvasRenderingContext2D, engine: NokiaSnakeEngine) {
    ctx.fillStyle = this.cPixel;

    // Outer playfield boundary border
    ctx.strokeRect(engine.originX - 1.5, engine.originY - 1.5, engine.gridCols * engine.cellSize + 3, engine.gridRows * engine.cellSize + 3);

    // Maze obstacle walls
    engine.walls.forEach(w => {
      const px = engine.originX + w.x * engine.cellSize;
      const py = engine.originY + w.y * engine.cellSize;
      ctx.fillRect(px, py, engine.cellSize, engine.cellSize);
    });

    // Snake Body & Head
    engine.snake.forEach((segment, idx) => {
      const px = engine.originX + segment.x * engine.cellSize;
      const py = engine.originY + segment.y * engine.cellSize;

      if (idx === 0) {
        // Snake Head with tiny tongue or eyes
        ctx.fillRect(px, py, engine.cellSize, engine.cellSize);
      } else {
        // Body segment
        ctx.fillRect(px, py, engine.cellSize, engine.cellSize);
      }
    });

    // Regular Food (Dot)
    const fx = engine.originX + engine.food.x * engine.cellSize;
    const fy = engine.originY + engine.food.y * engine.cellSize;
    // Classic Nokia Food: a blinking 2x2 dot
    if (Math.floor(engine.getAnimTick() / 8) % 2 === 0) {
      ctx.fillRect(fx, fy, 2, 2);
    } else {
      ctx.fillRect(fx, fy, 1, 1);
    }

    // Bonus Food (Insect / 5-point Bonus)
    if (engine.bonusFood) {
      const bfx = engine.originX + engine.bonusFood.x * engine.cellSize;
      const bfy = engine.originY + engine.bonusFood.y * engine.cellSize;
      if (Math.floor(engine.getAnimTick() / 4) % 2 === 0) {
        ctx.fillRect(bfx - 1, bfy, 3, 2);
        ctx.fillRect(bfx, bfy - 1, 1, 4);
      }
    }
  }

  private renderMenu(ctx: CanvasRenderingContext2D, engine: NokiaSnakeEngine) {
    // Menu icon / animated small snake banner
    const tick = engine.getAnimTick();
    const animX = Math.floor(Math.sin(tick * 0.08) * 8);

    // Small snake crawling graphic
    ctx.fillStyle = this.cPixel;
    ctx.fillRect(16 + animX, 14, 12, 2);
    ctx.fillRect(28 + animX, 13, 3, 3); // Head

    // Menu options box
    const options = [
      '1. CONTINUE',
      `2. SPEED: ${engine.speedLevel}`,
      `3. MAZE: ${engine.selectedMaze.toUpperCase()}`,
      `4. TOP: ${engine.highScore}`
    ];

    options.forEach((opt, idx) => {
      const y = 20 + idx * 7;
      if (idx === engine.menuIndex) {
        // Inverted highlighted text box
        ctx.fillRect(6, y - 1, 72, 7);
        ctx.fillStyle = this.cBg;
        this.drawPixelText(ctx, opt, 8, y);
        ctx.fillStyle = this.cPixel;
      } else {
        this.drawPixelText(ctx, opt, 8, y);
      }
    });
  }

  private renderPaused(ctx: CanvasRenderingContext2D) {
    // Dim translucent mask & "PAUSED" message box
    ctx.fillStyle = this.cBg;
    ctx.fillRect(24, 20, 36, 12);
    ctx.fillStyle = this.cPixel;
    ctx.strokeRect(24.5, 20.5, 35, 11);
    this.drawPixelText(ctx, 'PAUSED', 28, 24);
  }

  private renderGameOver(ctx: CanvasRenderingContext2D, engine: NokiaSnakeEngine) {
    // Inverted banner
    ctx.fillStyle = this.cPixel;
    ctx.fillRect(10, 14, 64, 11);
    ctx.fillStyle = this.cBg;
    this.drawPixelText(ctx, 'GAME OVER!', 16, 17);

    ctx.fillStyle = this.cPixel;
    this.drawPixelText(ctx, `SCORE: ${engine.score}`, 22, 28);
    this.drawPixelText(ctx, `HIGH:  ${engine.highScore}`, 22, 36);

    // Flashing press key prompt
    if (Math.floor(engine.getAnimTick() / 15) % 2 === 0) {
      ctx.fillRect(20, 44, 44, 1);
    }
  }

  /**
   * Minimalist 3x5 Nokia LCD Pixel Font Renderer
   */
  private drawPixelText(ctx: CanvasRenderingContext2D, text: string, startX: number, startY: number) {
    let curX = startX;
    const str = text.toUpperCase();

    for (let i = 0; i < str.length; i++) {
      const ch = str[i];
      const glyph = GLYPHS[ch] || GLYPHS[' '];

      for (let r = 0; r < 5; r++) {
        const rowBits = glyph[r];
        for (let c = 0; c < 3; c++) {
          if ((rowBits >> (2 - c)) & 1) {
            ctx.fillRect(curX + c, startY + r, 1, 1);
          }
        }
      }
      curX += 4; // 3px glyph + 1px spacing
    }
  }
}

// 3x5 Bitmap font definitions for retro LCD
const GLYPHS: Record<string, number[]> = {
  ' ': [0, 0, 0, 0, 0],
  '0': [0b111, 0b101, 0b101, 0b101, 0b111],
  '1': [0b010, 0b110, 0b010, 0b010, 0b111],
  '2': [0b111, 0b001, 0b111, 0b100, 0b111],
  '3': [0b111, 0b001, 0b111, 0b001, 0b111],
  '4': [0b101, 0b101, 0b111, 0b001, 0b001],
  '5': [0b111, 0b100, 0b111, 0b001, 0b111],
  '6': [0b111, 0b100, 0b111, 0b101, 0b111],
  '7': [0b111, 0b001, 0b010, 0b010, 0b010],
  '8': [0b111, 0b101, 0b111, 0b101, 0b111],
  '9': [0b111, 0b101, 0b111, 0b001, 0b111],
  'A': [0b010, 0b101, 0b111, 0b101, 0b101],
  'B': [0b110, 0b101, 0b110, 0b101, 0b110],
  'C': [0b011, 0b100, 0b100, 0b100, 0b011],
  'D': [0b110, 0b101, 0b101, 0b101, 0b110],
  'E': [0b111, 0b100, 0b110, 0b100, 0b111],
  'F': [0b111, 0b100, 0b110, 0b100, 0b100],
  'G': [0b011, 0b100, 0b101, 0b101, 0b011],
  'H': [0b101, 0b101, 0b111, 0b101, 0b101],
  'I': [0b111, 0b010, 0b010, 0b010, 0b111],
  'J': [0b001, 0b001, 0b001, 0b101, 0b010],
  'K': [0b101, 0b110, 0b100, 0b110, 0b101],
  'L': [0b100, 0b100, 0b100, 0b100, 0b111],
  'M': [0b101, 0b111, 0b101, 0b101, 0b101],
  'N': [0b110, 0b101, 0b101, 0b101, 0b101],
  'O': [0b010, 0b101, 0b101, 0b101, 0b010],
  'P': [0b110, 0b101, 0b110, 0b100, 0b100],
  'Q': [0b010, 0b101, 0b101, 0b110, 0b011],
  'R': [0b110, 0b101, 0b110, 0b101, 0b101],
  'S': [0b011, 0b100, 0b010, 0b001, 0b110],
  'T': [0b111, 0b010, 0b010, 0b010, 0b010],
  'U': [0b101, 0b101, 0b101, 0b101, 0b010],
  'V': [0b101, 0b101, 0b101, 0b010, 0b010],
  'W': [0b101, 0b101, 0b101, 0b111, 0b101],
  'X': [0b101, 0b101, 0b010, 0b101, 0b101],
  'Y': [0b101, 0b101, 0b010, 0b010, 0b010],
  'Z': [0b111, 0b001, 0b010, 0b100, 0b111],
  ':': [0b000, 0b010, 0b000, 0b010, 0b000],
  '.': [0b000, 0b000, 0b000, 0b000, 0b010],
  '!': [0b010, 0b010, 0b010, 0b000, 0b010],
  '-': [0b000, 0b000, 0b111, 0b000, 0b000]
};
