/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Lode Runner (Apple II, 1983 - Doug Smith / Brøderbund)
 * Authentic Apple II Hi-Res Graphics Renderer (280×192)
 * Supports Green Phosphor (P31), Amber (P134) & Apple II 6-Color NTSC
 */

import { LodeRunnerEngine, COLS, ROWS, TILE_WIDTH, TILE_HEIGHT, TileType } from './lodeRunnerEngine';

export type LodeRunnerMonitorMode = 'green' | 'amber' | 'color';

export class LodeRunnerRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private offscreen: HTMLCanvasElement;
  private offCtx: CanvasRenderingContext2D;

  private monitorMode: LodeRunnerMonitorMode = 'green';
  private frameCount: number = 0;

  // Virtual Apple II Hi-Res Resolution
  public static readonly V_WIDTH = 280;
  public static readonly V_HEIGHT = 192;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;

    this.offscreen = document.createElement('canvas');
    this.offscreen.width = LodeRunnerRenderer.V_WIDTH;
    this.offscreen.height = LodeRunnerRenderer.V_HEIGHT;
    this.offCtx = this.offscreen.getContext('2d')!;
    this.offCtx.imageSmoothingEnabled = false;
  }

  public setMonitorMode(mode: LodeRunnerMonitorMode) {
    this.monitorMode = mode;
  }

  public getMonitorMode(): LodeRunnerMonitorMode {
    return this.monitorMode;
  }

  /**
   * Main Render Method
   */
  public render(engine: LodeRunnerEngine) {
    this.frameCount++;
    const ctx = this.offCtx;

    // Palette Definitions
    const colors = this.getPalette();

    // 1. Clear Screen
    ctx.fillStyle = colors.bg;
    ctx.fillRect(0, 0, LodeRunnerRenderer.V_WIDTH, LodeRunnerRenderer.V_HEIGHT);

    // 2. Render Tilemap Grid
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const tile = engine.grid[r][c];
        const x = c * TILE_WIDTH;
        const y = r * TILE_HEIGHT;

        switch (tile) {
          case TileType.BRICK:
            this.drawBrick(ctx, x, y, colors);
            break;
          case TileType.SOLID:
            this.drawSolid(ctx, x, y, colors);
            break;
          case TileType.LADDER:
            this.drawLadder(ctx, x, y, colors);
            break;
          case TileType.ESCAPE_LADDER:
            if (engine.escapeLadderRevealed) {
              this.drawEscapeLadder(ctx, x, y, colors);
            }
            break;
          case TileType.ROPE:
            this.drawRope(ctx, x, y, colors);
            break;
          case TileType.FALSE_BRICK:
            this.drawBrick(ctx, x, y, colors);
            break;
          case TileType.GOLD:
            this.drawGold(ctx, x, y, colors);
            break;
        }
      }
    }

    // 3. Render Dug Holes (Dig animations / regenerating brick effect)
    engine.dugHoles.forEach((hole) => {
      const x = hole.col * TILE_WIDTH;
      const y = hole.row * TILE_HEIGHT;
      this.drawDugHole(ctx, x, y, hole.timer, hole.maxTimer, colors);
    });

    // 4. Render Enemy Bungeling Monks
    engine.enemies.forEach((enemy) => {
      if (enemy.respawnTimer > 0) return;
      const x = enemy.x * TILE_WIDTH;
      const y = enemy.y * TILE_HEIGHT;
      this.drawEnemy(ctx, x, y, enemy.state, enemy.isTrapped, enemy.hasGold, colors);
    });

    // 5. Render Player (Runner)
    if (!engine.player.isDead) {
      const px = engine.player.x * TILE_WIDTH;
      const py = engine.player.y * TILE_HEIGHT;
      this.drawPlayer(ctx, px, py, engine.player.state, colors);
    } else {
      // Death flash / dissolve
      const px = engine.player.x * TILE_WIDTH;
      const py = engine.player.y * TILE_HEIGHT;
      this.drawDeathAnimation(ctx, px, py, colors);
    }

    // 6. Draw HUD Banner on top of screen (Classic Apple II Status Line)
    this.drawHUD(ctx, engine, colors);

    // 7. Blit offscreen buffer to display canvas with aspect ratio and CRT scanline filter
    this.blitToScreen();
  }

  private getPalette() {
    if (this.monitorMode === 'green') {
      return {
        bg: '#041808',
        brick: '#22c55e',
        brickMortar: '#15803d',
        solid: '#16a34a',
        ladder: '#4ade80',
        rope: '#22c55e',
        gold: '#86efac',
        player: '#ffffff',
        enemy: '#34d399',
        hud: '#4ade80',
        glow: 'rgba(74, 222, 128, 0.4)'
      };
    } else if (this.monitorMode === 'amber') {
      return {
        bg: '#1a0d00',
        brick: '#f59e0b',
        brickMortar: '#b45309',
        solid: '#d97706',
        ladder: '#fbbf24',
        rope: '#f59e0b',
        gold: '#fef08a',
        player: '#ffffff',
        enemy: '#fb923c',
        hud: '#fbbf24',
        glow: 'rgba(251, 191, 36, 0.4)'
      };
    } else {
      // Apple II 6-Color NTSC Mode
      return {
        bg: '#000000',
        brick: '#f97316',        // Orange bricks
        brickMortar: '#7c2d12',
        solid: '#0284c7',        // Cyan/Blue solid
        ladder: '#ffffff',       // White ladder
        rope: '#ffffff',         // White rope
        gold: '#facc15',         // Yellow gold
        player: '#ffffff',       // White runner
        enemy: '#c084fc',        // Violet/Purple Bungeling monk
        hud: '#38bdf8',          // Cyan HUD
        glow: 'rgba(255, 255, 255, 0.3)'
      };
    }
  }

  /**
   * Tile: Brick
   */
  private drawBrick(ctx: CanvasRenderingContext2D, x: number, y: number, colors: ReturnType<typeof this.getPalette>) {
    ctx.fillStyle = colors.brick;
    ctx.fillRect(x, y, TILE_WIDTH, TILE_HEIGHT);

    // Staggered Apple II brick mortar lines
    ctx.fillStyle = colors.brickMortar;
    ctx.fillRect(x, y + 5, TILE_WIDTH, 1);
    ctx.fillRect(x, y + 11, TILE_WIDTH, 1);

    // Vertical mortar notches
    ctx.fillRect(x + 4, y, 1, 5);
    ctx.fillRect(x + 8, y + 6, 1, 5);
  }

  /**
   * Tile: Solid Concrete Block (Indestructible)
   */
  private drawSolid(ctx: CanvasRenderingContext2D, x: number, y: number, colors: ReturnType<typeof this.getPalette>) {
    ctx.fillStyle = colors.solid;
    ctx.fillRect(x, y, TILE_WIDTH, TILE_HEIGHT);

    // Cross pattern border
    ctx.fillStyle = colors.bg;
    ctx.fillRect(x + 1, y + 1, TILE_WIDTH - 2, TILE_HEIGHT - 2);

    ctx.fillStyle = colors.solid;
    ctx.fillRect(x + 3, y + 3, 4, 6);
  }

  /**
   * Tile: Ladder
   */
  private drawLadder(ctx: CanvasRenderingContext2D, x: number, y: number, colors: ReturnType<typeof this.getPalette>) {
    ctx.fillStyle = colors.ladder;
    // Left and right rails
    ctx.fillRect(x + 1, y, 2, TILE_HEIGHT);
    ctx.fillRect(x + 7, y, 2, TILE_HEIGHT);

    // Horizontal rungs
    ctx.fillRect(x + 3, y + 2, 4, 1);
    ctx.fillRect(x + 3, y + 6, 4, 1);
    ctx.fillRect(x + 3, y + 10, 4, 1);
  }

  /**
   * Tile: Escape Ladder (Flashes when revealed)
   */
  private drawEscapeLadder(ctx: CanvasRenderingContext2D, x: number, y: number, colors: ReturnType<typeof this.getPalette>) {
    const isFlashing = (Math.floor(this.frameCount / 6) % 2 === 0);
    ctx.fillStyle = isFlashing ? '#ffffff' : colors.ladder;
    
    ctx.fillRect(x + 1, y, 2, TILE_HEIGHT);
    ctx.fillRect(x + 7, y, 2, TILE_HEIGHT);
    ctx.fillRect(x + 3, y + 2, 4, 1);
    ctx.fillRect(x + 3, y + 6, 4, 1);
    ctx.fillRect(x + 3, y + 10, 4, 1);
  }

  /**
   * Tile: Overhead Rope / Monkey Bar
   */
  private drawRope(ctx: CanvasRenderingContext2D, x: number, y: number, colors: ReturnType<typeof this.getPalette>) {
    ctx.fillStyle = colors.rope;
    // Single pixel continuous high wire
    ctx.fillRect(x, y + 2, TILE_WIDTH, 1);
    // Knot dots
    ctx.fillRect(x + 2, y + 3, 2, 1);
    ctx.fillRect(x + 7, y + 3, 2, 1);
  }

  /**
   * Tile: Gold Chest / Pouch
   */
  private drawGold(ctx: CanvasRenderingContext2D, x: number, y: number, colors: ReturnType<typeof this.getPalette>) {
    ctx.fillStyle = colors.gold;
    // Shimmering treasure chest
    const shimmer = (Math.floor(this.frameCount / 10) % 2 === 0);

    ctx.fillRect(x + 1, y + 3, 8, 7);
    ctx.fillStyle = colors.bg;
    // Clasp
    ctx.fillRect(x + 4, y + 5, 2, 3);

    if (shimmer) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x + 2, y + 4, 2, 2);
    }
  }

  /**
   * Dug Hole with Crumbling Dust and Regeneration Countdown
   */
  private drawDugHole(ctx: CanvasRenderingContext2D, x: number, y: number, timer: number, maxTimer: number, colors: ReturnType<typeof this.getPalette>) {
    ctx.fillStyle = colors.bg;
    ctx.fillRect(x, y, TILE_WIDTH, TILE_HEIGHT);

    // Cavity depth indicator
    ctx.fillStyle = colors.brickMortar;
    ctx.fillRect(x + 1, y + TILE_HEIGHT - 2, TILE_WIDTH - 2, 2);

    // If regenerating (< 1.2s remaining), flash brick outline
    if (timer < 1.2) {
      const flash = Math.floor(timer * 10) % 2 === 0;
      if (flash) {
        ctx.fillStyle = colors.brick;
        ctx.fillRect(x + 1, y + 1, TILE_WIDTH - 2, 2);
        ctx.fillRect(x + 1, y + TILE_HEIGHT - 3, TILE_WIDTH - 2, 2);
      }
    }
  }

  /**
   * Actor: Player (Runner)
   */
  private drawPlayer(ctx: CanvasRenderingContext2D, x: number, y: number, state: string, colors: ReturnType<typeof this.getPalette>) {
    const rx = Math.round(x);
    const ry = Math.round(y);
    const animStep = Math.floor(this.frameCount / 4) % 3;

    ctx.fillStyle = colors.player;

    // Head (Circle/Square 3x3)
    ctx.fillRect(rx + 3, ry, 4, 3);

    switch (state) {
      case 'run_right': {
        // Torso
        ctx.fillRect(rx + 4, ry + 3, 2, 4);
        // Arms swinging
        if (animStep === 0) {
          ctx.fillRect(rx + 6, ry + 4, 3, 1);
          ctx.fillRect(rx + 2, ry + 4, 2, 1);
          // Legs
          ctx.fillRect(rx + 5, ry + 7, 2, 4);
          ctx.fillRect(rx + 2, ry + 7, 2, 4);
        } else if (animStep === 1) {
          ctx.fillRect(rx + 6, ry + 3, 2, 2);
          ctx.fillRect(rx + 1, ry + 5, 3, 1);
          // Legs spread
          ctx.fillRect(rx + 6, ry + 7, 3, 4);
          ctx.fillRect(rx + 1, ry + 7, 2, 3);
        } else {
          ctx.fillRect(rx + 5, ry + 5, 3, 1);
          ctx.fillRect(rx + 2, ry + 3, 2, 2);
          // Legs together
          ctx.fillRect(rx + 4, ry + 7, 2, 4);
        }
        break;
      }

      case 'run_left': {
        // Torso
        ctx.fillRect(rx + 4, ry + 3, 2, 4);
        // Arms swinging left
        if (animStep === 0) {
          ctx.fillRect(rx + 1, ry + 4, 3, 1);
          ctx.fillRect(rx + 6, ry + 4, 2, 1);
          ctx.fillRect(rx + 3, ry + 7, 2, 4);
          ctx.fillRect(rx + 6, ry + 7, 2, 4);
        } else if (animStep === 1) {
          ctx.fillRect(rx + 2, ry + 3, 2, 2);
          ctx.fillRect(rx + 6, ry + 5, 3, 1);
          ctx.fillRect(rx + 1, ry + 7, 3, 4);
          ctx.fillRect(rx + 7, ry + 7, 2, 3);
        } else {
          ctx.fillRect(rx + 2, ry + 5, 3, 1);
          ctx.fillRect(rx + 6, ry + 3, 2, 2);
          ctx.fillRect(rx + 4, ry + 7, 2, 4);
        }
        break;
      }

      case 'climb_up':
      case 'climb_down': {
        // Climbing animation (alternating hands on ladder rungs)
        const climbAlt = Math.floor(this.frameCount / 5) % 2 === 0;
        ctx.fillRect(rx + 4, ry + 3, 2, 5);
        if (climbAlt) {
          ctx.fillRect(rx + 1, ry + 2, 3, 2);
          ctx.fillRect(rx + 6, ry + 4, 3, 2);
          ctx.fillRect(rx + 2, ry + 8, 2, 4);
          ctx.fillRect(rx + 6, ry + 7, 2, 3);
        } else {
          ctx.fillRect(rx + 6, ry + 2, 3, 2);
          ctx.fillRect(rx + 1, ry + 4, 3, 2);
          ctx.fillRect(rx + 6, ry + 8, 2, 4);
          ctx.fillRect(rx + 2, ry + 7, 2, 3);
        }
        break;
      }

      case 'hang_left':
      case 'hang_right':
      case 'hang_idle': {
        // Hanging from rope
        // Hands up holding rope
        ctx.fillRect(rx + 2, ry - 1, 2, 2);
        ctx.fillRect(rx + 6, ry - 1, 2, 2);
        ctx.fillRect(rx + 4, ry + 3, 2, 4);
        // Swinging legs
        const legSwing = (Math.floor(this.frameCount / 4) % 2 === 0);
        if (legSwing) {
          ctx.fillRect(rx + 2, ry + 7, 3, 4);
        } else {
          ctx.fillRect(rx + 5, ry + 7, 3, 4);
        }
        break;
      }

      case 'dig_left': {
        // Crouched digging pose aimed lower-left
        ctx.fillRect(rx + 3, ry + 3, 3, 4);
        ctx.fillRect(rx + 1, ry + 7, 4, 4);
        // Blaster / spade laser beam pointing down-left
        ctx.fillStyle = colors.brick;
        ctx.fillRect(rx - 4, ry + 8, 6, 2);
        ctx.fillRect(rx - 7, ry + 10, 4, 2);
        break;
      }

      case 'dig_right': {
        // Crouched digging pose aimed lower-right
        ctx.fillRect(rx + 4, ry + 3, 3, 4);
        ctx.fillRect(rx + 5, ry + 7, 4, 4);
        ctx.fillStyle = colors.brick;
        ctx.fillRect(rx + 8, ry + 8, 6, 2);
        ctx.fillRect(rx + 13, ry + 10, 4, 2);
        break;
      }

      case 'fall': {
        // Falling pose: arms flailing up, legs apart
        ctx.fillRect(rx + 4, ry + 3, 2, 4);
        ctx.fillRect(rx + 1, ry + 2, 3, 2);
        ctx.fillRect(rx + 6, ry + 2, 3, 2);
        ctx.fillRect(rx + 1, ry + 7, 3, 4);
        ctx.fillRect(rx + 6, ry + 7, 3, 4);
        break;
      }

      default: {
        // Idle
        ctx.fillRect(rx + 4, ry + 3, 2, 4);
        ctx.fillRect(rx + 2, ry + 4, 6, 1);
        ctx.fillRect(rx + 3, ry + 7, 2, 4);
        ctx.fillRect(rx + 5, ry + 7, 2, 4);
        break;
      }
    }
  }

  /**
   * Actor: Enemy Bungeling Monk
   */
  private drawEnemy(ctx: CanvasRenderingContext2D, x: number, y: number, state: string, isTrapped: boolean, hasGold: boolean, colors: ReturnType<typeof this.getPalette>) {
    const ex = Math.round(x);
    const ey = Math.round(y);

    if (isTrapped) {
      // Monk trapped in hole: head sticking out with flailing hands
      ctx.fillStyle = colors.enemy;
      ctx.fillRect(ex + 3, ey + 4, 4, 4);
      // Waving hands
      const wave = Math.floor(this.frameCount / 6) % 2 === 0;
      if (wave) {
        ctx.fillRect(ex + 1, ey + 2, 2, 3);
        ctx.fillRect(ex + 7, ey + 3, 2, 3);
      } else {
        ctx.fillRect(ex + 1, ey + 3, 2, 3);
        ctx.fillRect(ex + 7, ey + 2, 2, 3);
      }
      return;
    }

    // Monk Hood & Robe
    ctx.fillStyle = colors.enemy;
    ctx.fillRect(ex + 3, ey, 4, 3); // Hood
    // White menacing face slit
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(ex + 4, ey + 1, 2, 1);

    // Robe body
    ctx.fillStyle = colors.enemy;
    ctx.fillRect(ex + 2, ey + 3, 6, 5);

    // Walking robe skirts / legs
    const animStep = Math.floor(this.frameCount / 4) % 2 === 0;
    if (animStep) {
      ctx.fillRect(ex + 2, ey + 8, 3, 3);
      ctx.fillRect(ex + 6, ey + 8, 2, 2);
    } else {
      ctx.fillRect(ex + 5, ey + 8, 3, 3);
      ctx.fillRect(ex + 2, ey + 8, 2, 2);
    }

    // If carrying gold, draw gold icon above monk head
    if (hasGold) {
      ctx.fillStyle = colors.gold;
      ctx.fillRect(ex + 3, ey - 3, 4, 3);
    }
  }

  /**
   * Death Animation
   */
  private drawDeathAnimation(ctx: CanvasRenderingContext2D, x: number, y: number, colors: ReturnType<typeof this.getPalette>) {
    ctx.fillStyle = colors.player;
    // Dissolving pixel cloud
    for (let i = 0; i < 8; i++) {
      const ox = (i * 3 + this.frameCount * 2) % 12 - 6;
      const oy = (i * 2 + this.frameCount) % 12 - 6;
      ctx.fillRect(x + 5 + ox, y + 6 + oy, 2, 2);
    }
  }

  /**
   * HUD: Score, Lives, Level, Gold Left
   */
  private drawHUD(ctx: CanvasRenderingContext2D, engine: LodeRunnerEngine, colors: ReturnType<typeof this.getPalette>) {
    ctx.fillStyle = colors.bg;
    ctx.fillRect(0, 0, LodeRunnerRenderer.V_WIDTH, 12);

    ctx.fillStyle = colors.hud;
    ctx.font = '8px monospace';
    ctx.textBaseline = 'top';

    const scoreStr = `SCORE:${engine.score.toString().padStart(6, '0')}`;
    const livesStr = `MEN:${engine.lives}`;
    const levelStr = `LEVEL:${(engine.currentLevelIndex + 1).toString().padStart(2, '0')}`;
    const goldStr = `GOLD:${engine.goldCount}`;

    ctx.fillText(scoreStr, 4, 2);
    ctx.fillText(livesStr, 95, 2);
    ctx.fillText(goldStr, 150, 2);
    ctx.fillText(levelStr, 215, 2);

    // Separator line
    ctx.fillStyle = colors.hud;
    ctx.fillRect(0, 11, LodeRunnerRenderer.V_WIDTH, 1);
  }

  /**
   * Blit offscreen buffer to high-DPI display canvas with nearest-neighbor CRT scaling
   */
  private blitToScreen() {
    const width = this.canvas.width;
    const height = this.canvas.height;
    const ctx = this.ctx;

    ctx.save();
    ctx.imageSmoothingEnabled = false;

    // Clear main canvas
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, width, height);

    // Calculate integer scaling maintaining 280:192 aspect ratio
    const scale = Math.min(width / LodeRunnerRenderer.V_WIDTH, height / LodeRunnerRenderer.V_HEIGHT);
    const destW = Math.floor(LodeRunnerRenderer.V_WIDTH * scale);
    const destH = Math.floor(LodeRunnerRenderer.V_HEIGHT * scale);
    const destX = Math.floor((width - destW) / 2);
    const destY = Math.floor((height - destH) / 2);

    // Draw game buffer
    ctx.drawImage(this.offscreen, 0, 0, LodeRunnerRenderer.V_WIDTH, LodeRunnerRenderer.V_HEIGHT, destX, destY, destW, destH);

    // CRT Scanlines Overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.22)';
    for (let y = destY; y < destY + destH; y += 3) {
      ctx.fillRect(destX, y, destW, 1);
    }

    // Subtle Phosphor CRT curvature shadow
    const grad = ctx.createRadialGradient(
      destX + destW / 2, destY + destH / 2, destH * 0.4,
      destX + destW / 2, destY + destH / 2, destH * 0.75
    );
    grad.addColorStop(0, 'rgba(0,0,0,0)');
    grad.addColorStop(1, 'rgba(0,0,0,0.5)');
    ctx.fillStyle = grad;
    ctx.fillRect(destX, destY, destW, destH);

    ctx.restore();
  }
}
