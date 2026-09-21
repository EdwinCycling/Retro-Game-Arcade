/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Sinclair ZX81 3D First-Person Raycasting & Character Display Renderer (1981)
 */

import { MonsterMazeEngine, DIR_VECTORS, MAZE_SIZE } from './monsterMazeEngine';

export type DisplayMode = 'bw' | 'green' | 'amber';

export const ZX81_SCREEN_WIDTH = 320;
export const ZX81_SCREEN_HEIGHT = 240;

export class MonsterMazeRenderer {
  private ctx: CanvasRenderingContext2D;
  public displayMode: DisplayMode = 'bw';
  public enableScanlines = true;
  public enableCurvature = true;

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
  }

  private getColors() {
    switch (this.displayMode) {
      case 'green':
        return {
          bg: '#051205',
          fg: '#44ff44',
          dim: '#1a551a',
          accent: '#88ff88',
          alert: '#ccffcc',
        };
      case 'amber':
        return {
          bg: '#120800',
          fg: '#ffaa00',
          dim: '#663b00',
          accent: '#ffcc44',
          alert: '#ffeeaa',
        };
      case 'bw':
      default:
        return {
          bg: '#0c0c0e',
          fg: '#f0f0f0',
          dim: '#44444c',
          accent: '#ffffff',
          alert: '#ffffff',
        };
    }
  }

  public render(engine: MonsterMazeEngine) {
    const ctx = this.ctx;
    const colors = this.getColors();

    // Clear background
    ctx.fillStyle = colors.bg;
    ctx.fillRect(0, 0, ZX81_SCREEN_WIDTH, ZX81_SCREEN_HEIGHT);

    if (engine.state === 'TITLE') {
      this.renderTitleScreen(engine, colors);
    } else {
      this.render3DView(engine, colors);
      this.renderHUD(engine, colors);
    }

    // Render CRT scanlines
    if (this.enableScanlines) {
      this.renderScanlines();
    }
  }

  private renderTitleScreen(engine: MonsterMazeEngine, colors: ReturnType<typeof this.getColors>) {
    const ctx = this.ctx;

    // ZX81 Inverted Header Box
    ctx.fillStyle = colors.fg;
    ctx.fillRect(16, 12, ZX81_SCREEN_WIDTH - 32, 28);
    ctx.fillStyle = colors.bg;
    ctx.font = 'bold 16px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('3D MONSTER MAZE', ZX81_SCREEN_WIDTH / 2, 32);

    // Subtitle
    ctx.fillStyle = colors.fg;
    ctx.font = '10px monospace';
    ctx.fillText('(C) 1981 J.K. GREYE SOFTWARE', ZX81_SCREEN_WIDTH / 2, 54);
    ctx.fillText('BY MALCOLM EVANS • SINCLAIR ZX81 16K', ZX81_SCREEN_WIDTH / 2, 68);

    // Draw Giant Rex silhouette in center
    this.drawRexSprite(ZX81_SCREEN_WIDTH / 2 - 40, 78, 2.0, engine.rexAnimFrame, colors);

    // Instructions Box
    ctx.fillStyle = colors.dim;
    ctx.strokeStyle = colors.fg;
    ctx.lineWidth = 1;
    ctx.strokeRect(24, 150, ZX81_SCREEN_WIDTH - 48, 48);

    ctx.fillStyle = colors.fg;
    ctx.font = '9px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('CONTROLS:', ZX81_SCREEN_WIDTH / 2, 162);
    ctx.fillText('[5] TURN LEFT  •  [6] FORWARD  •  [8] TURN RIGHT', ZX81_SCREEN_WIDTH / 2, 175);
    ctx.fillText('[7] BACKWARD   •  [0] ABOUT TURN (BEHIND)', ZX81_SCREEN_WIDTH / 2, 188);

    // Prompt to start
    const blink = Math.floor(Date.now() / 400) % 2 === 0;
    if (blink) {
      ctx.fillStyle = colors.accent;
      ctx.font = 'bold 12px monospace';
      ctx.fillText('PRESS [SPACE] OR [START] TO ENTER MAZE', ZX81_SCREEN_WIDTH / 2, 222);
    }
  }

  private render3DView(engine: MonsterMazeEngine, colors: ReturnType<typeof this.getColors>) {
    const ctx = this.ctx;
    const vpX = 16;
    const vpY = 24;
    const vpW = ZX81_SCREEN_WIDTH - 32;
    const vpH = 145;

    // Viewport Border
    ctx.strokeStyle = colors.fg;
    ctx.lineWidth = 2;
    ctx.strokeRect(vpX, vpY, vpW, vpH);

    // Viewport background
    ctx.fillStyle = colors.bg;
    ctx.fillRect(vpX + 1, vpY + 1, vpW - 2, vpH - 2);

    // Horizon line
    const cx = vpX + vpW / 2;
    const cy = vpY + vpH / 2;

    // Depth slicing: 5 distance steps (1 to 5)
    // We inspect what is ahead of the player up to depth 5
    const pDir = engine.playerDir;
    const forward = DIR_VECTORS[pDir];
    const right = DIR_VECTORS[(pDir + 1) % 4];
    const left = DIR_VECTORS[(pDir + 3) % 4];

    // Scale factors for depths 0 to 5
    // depth 0: edge of screen, depth 1..5: narrowing rectangles
    const depths = [
      { w: vpW, h: vpH },
      { w: vpW * 0.72, h: vpH * 0.72 },
      { w: vpW * 0.50, h: vpH * 0.50 },
      { w: vpW * 0.32, h: vpH * 0.32 },
      { w: vpW * 0.18, h: vpH * 0.18 },
      { w: vpW * 0.08, h: vpH * 0.08 },
    ];

    // Check cells ahead and render from back (depth 5) to front (depth 1)
    let hitSolidWallDepth = 6;
    for (let d = 1; d <= 5; d++) {
      const cxPos = engine.playerX + forward.dx * d;
      const cyPos = engine.playerY + forward.dy * d;

      if (
        cxPos < 0 ||
        cxPos >= MAZE_SIZE ||
        cyPos < 0 ||
        cyPos >= MAZE_SIZE ||
        engine.maze[cyPos][cxPos] === 1
      ) {
        hitSolidWallDepth = d;
        break;
      }
    }

    // Render wireframe / blocky corridors from back to front
    for (let d = Math.min(5, hitSolidWallDepth); d >= 1; d--) {
      const cur = depths[d];
      const prev = depths[d - 1];

      const curX1 = cx - cur.w / 2;
      const curX2 = cx + cur.w / 2;
      const curY1 = cy - cur.h / 2;
      const curY2 = cy + cur.h / 2;

      const prevX1 = cx - prev.w / 2;
      const prevX2 = cx + prev.w / 2;
      const prevY1 = cy - prev.h / 2;
      const prevY2 = cy + prev.h / 2;

      const cellX = engine.playerX + forward.dx * (d - 1);
      const cellY = engine.playerY + forward.dy * (d - 1);

      // Check left wall at distance d-1
      const leftX = cellX + left.dx;
      const leftY = cellY + left.dy;
      const hasLeftWall =
        leftX < 0 || leftX >= MAZE_SIZE || leftY < 0 || leftY >= MAZE_SIZE || engine.maze[leftY][leftX] === 1;

      // Check right wall at distance d-1
      const rightX = cellX + right.dx;
      const rightY = cellY + right.dy;
      const hasRightWall =
        rightX < 0 || rightX >= MAZE_SIZE || rightY < 0 || rightY >= MAZE_SIZE || engine.maze[rightY][rightX] === 1;

      // Draw Left Wall Segment
      if (hasLeftWall) {
        ctx.fillStyle = colors.fg;
        ctx.strokeStyle = colors.fg;
        ctx.lineWidth = 1;

        // Semigraphic hatching on left wall
        this.drawTexturedTrapezoid(
          prevX1, prevY1,
          curX1, curY1,
          curX1, curY2,
          prevX1, prevY2,
          colors,
          d
        );
      } else {
        // Open corridor branch to left
        ctx.strokeStyle = colors.dim;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(prevX1, prevY1);
        ctx.lineTo(curX1, curY1);
        ctx.moveTo(prevX1, prevY2);
        ctx.lineTo(curX1, curY2);
        ctx.stroke();
      }

      // Draw Right Wall Segment
      if (hasRightWall) {
        this.drawTexturedTrapezoid(
          curX2, curY1,
          prevX2, prevY1,
          prevX2, prevY2,
          curX2, curY2,
          colors,
          d
        );
      } else {
        // Open corridor branch to right
        ctx.strokeStyle = colors.dim;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(prevX2, prevY1);
        ctx.lineTo(curX2, curY1);
        ctx.moveTo(prevX2, prevY2);
        ctx.lineTo(curX2, curY2);
        ctx.stroke();
      }

      // Ceiling and floor lines
      ctx.strokeStyle = colors.fg;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(prevX1, prevY1);
      ctx.lineTo(prevX2, prevY1);
      ctx.moveTo(prevX1, prevY2);
      ctx.lineTo(prevX2, prevY2);
      ctx.stroke();

      // If this distance is a solid dead-end wall facing the player
      if (d === hitSolidWallDepth) {
        ctx.fillStyle = colors.fg;
        this.drawBrickWall(curX1, curY1, cur.w, cur.h, colors, d);
      }

      // Check if exit is at this tile!
      const isExit =
        cellX >= 0 && cellX < MAZE_SIZE && cellY >= 0 && cellY < MAZE_SIZE && engine.maze[cellY][cellX] === 2;
      if (isExit) {
        this.drawExitGate(curX1, curY1, cur.w, cur.h, colors);
      }

      // Check if Rex is at this tile!
      if (engine.rexX === cellX && engine.rexY === cellY) {
        const scale = (6 - d) * 0.45;
        this.drawRexSprite(cx - (scale * 20), curY2 - (scale * 45), scale, engine.rexAnimFrame, colors);
      }
    }

    // Check if Rex is standing right in front at hit wall or empty corridor
    for (let d = 1; d <= 5; d++) {
      const rx = engine.playerX + forward.dx * d;
      const ry = engine.playerY + forward.dy * d;
      if (engine.rexX === rx && engine.rexY === ry && d <= hitSolidWallDepth) {
        const cur = depths[d];
        const scale = Math.max(0.4, (5.5 - d) * 0.45);
        this.drawRexSprite(cx - (scale * 20), cy + cur.h / 2 - (scale * 40), scale, engine.rexAnimFrame, colors);
        break;
      }
    }
  }

  private drawTexturedTrapezoid(
    x1: number, y1: number,
    x2: number, y2: number,
    x3: number, y3: number,
    x4: number, y4: number,
    colors: ReturnType<typeof this.getColors>,
    depth: number
  ) {
    const ctx = this.ctx;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.lineTo(x3, y3);
    ctx.lineTo(x4, y4);
    ctx.closePath();

    ctx.strokeStyle = colors.fg;
    ctx.lineWidth = 1;
    ctx.stroke();

    // ZX81 Dither / Hatch lines
    ctx.save();
    ctx.clip();
    ctx.strokeStyle = depth % 2 === 0 ? colors.dim : colors.fg;
    const step = 8;
    for (let py = Math.min(y1, y2); py <= Math.max(y3, y4); py += step) {
      ctx.beginPath();
      ctx.moveTo(Math.min(x1, x2) - 10, py);
      ctx.lineTo(Math.max(x3, x4) + 10, py);
      ctx.stroke();
    }
    ctx.restore();
  }

  private drawBrickWall(x: number, y: number, w: number, h: number, colors: ReturnType<typeof this.getColors>, depth: number) {
    const ctx = this.ctx;
    ctx.fillStyle = colors.bg;
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = colors.fg;
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, w, h);

    // Sinclair ZX81 Character Brick Texture (Checkerboard characters)
    ctx.strokeStyle = colors.dim;
    ctx.lineWidth = 1;
    const rowH = Math.max(6, Math.floor(h / 6));
    const colW = Math.max(10, Math.floor(w / 4));

    for (let r = 0; r < 6; r++) {
      const ry = y + r * rowH;
      ctx.beginPath();
      ctx.moveTo(x, ry);
      ctx.lineTo(x + w, ry);
      ctx.stroke();

      const offset = (r % 2) * (colW / 2);
      for (let cx = x + offset; cx < x + w; cx += colW) {
        ctx.beginPath();
        ctx.moveTo(cx, ry);
        ctx.lineTo(cx, Math.min(y + h, ry + rowH));
        ctx.stroke();
      }
    }
  }

  private drawExitGate(x: number, y: number, w: number, h: number, colors: ReturnType<typeof this.getColors>) {
    const ctx = this.ctx;
    const blink = Math.floor(Date.now() / 200) % 2 === 0;

    ctx.fillStyle = blink ? colors.fg : colors.bg;
    ctx.fillRect(x + w * 0.2, y + h * 0.1, w * 0.6, h * 0.8);

    ctx.fillStyle = blink ? colors.bg : colors.fg;
    ctx.font = `bold ${Math.max(8, Math.floor(h * 0.2))}px monospace`;
    ctx.textAlign = 'center';
    ctx.fillText('EXIT', x + w / 2, y + h * 0.55);
  }

  private drawRexSprite(x: number, y: number, scale: number, animFrame: number, colors: ReturnType<typeof this.getColors>) {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);

    // Sinclair ZX81 Blocky T-Rex Character Silhouette
    ctx.fillStyle = colors.fg;

    // Head and Snout
    ctx.fillRect(10, 0, 24, 14);
    ctx.fillRect(26, 4, 12, 10); // Snout

    // Eye
    ctx.fillStyle = colors.bg;
    ctx.fillRect(16, 3, 3, 3);
    ctx.fillStyle = colors.fg;

    // Jaw / Open Mouth (animated)
    const jawOpen = animFrame % 2 === 1;
    if (jawOpen) {
      ctx.fillStyle = colors.bg;
      ctx.fillRect(20, 10, 16, 4); // open mouth gap
      ctx.fillStyle = colors.fg;
      ctx.fillRect(20, 14, 18, 5); // lower jaw
      // Teeth
      ctx.fillRect(24, 8, 2, 2);
      ctx.fillRect(30, 8, 2, 2);
    } else {
      ctx.fillRect(20, 12, 18, 4);
    }

    // Neck and Torso
    ctx.fillRect(6, 12, 16, 24);
    ctx.fillRect(0, 18, 20, 20);

    // Arms
    ctx.fillRect(18, 24, 6, 3);
    ctx.fillRect(22, 27, 3, 4);

    // Tail (Extending left)
    ctx.fillRect(-10, 24, 12, 8);
    ctx.fillRect(-18, 22, 10, 6);
    ctx.fillRect(-24, 20, 8, 4);

    // Powerful Legs (Animated walking)
    const legOffset = animFrame === 0 ? 0 : animFrame === 1 ? 4 : animFrame === 2 ? 0 : -4;

    // Left Leg
    ctx.fillRect(2 + legOffset, 36, 8, 12);
    ctx.fillRect(4 + legOffset, 48, 10, 4); // foot

    // Right Leg
    ctx.fillRect(12 - legOffset, 36, 8, 12);
    ctx.fillRect(14 - legOffset, 48, 10, 4); // foot

    ctx.restore();
  }

  private renderHUD(engine: MonsterMazeEngine, colors: ReturnType<typeof this.getColors>) {
    const ctx = this.ctx;

    // Top Status Header: Compass, Score, Steps
    ctx.fillStyle = colors.fg;
    ctx.font = 'bold 9px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`DIR: ${DIR_VECTORS[engine.playerDir].name}`, 16, 16);

    ctx.textAlign = 'center';
    ctx.fillText(`STEPS: ${engine.steps}`, ZX81_SCREEN_WIDTH / 2, 16);

    ctx.textAlign = 'right';
    ctx.fillText(`SCORE: ${engine.score}`, ZX81_SCREEN_WIDTH - 16, 16);

    // Bottom Suspense Message Box (The iconic ZX81 ticker)
    ctx.fillStyle = colors.fg;
    ctx.fillRect(16, 174, ZX81_SCREEN_WIDTH - 32, 28);

    ctx.fillStyle = colors.bg;
    ctx.font = 'bold 11px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(engine.statusMessage, ZX81_SCREEN_WIDTH / 2, 192);

    // Bottom Subtitle info
    ctx.fillStyle = colors.fg;
    ctx.font = '9px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(engine.subMessage, ZX81_SCREEN_WIDTH / 2, 216);

    // Quick control reminder
    ctx.fillStyle = colors.dim;
    ctx.font = '8px monospace';
    ctx.fillText('5:LEFT • 6:AHEAD • 7:BACK • 8:RIGHT • 0:ABOUT TURN', ZX81_SCREEN_WIDTH / 2, 230);

    // Radar Minimap (if cheat/trainer enabled)
    if (engine.cheatRadar) {
      this.renderMinimap(engine, colors);
    }
  }

  private renderMinimap(engine: MonsterMazeEngine, colors: ReturnType<typeof this.getColors>) {
    const ctx = this.ctx;
    const size = 52;
    const mx = ZX81_SCREEN_WIDTH - size - 20;
    const my = 28;
    const cellSize = size / MAZE_SIZE;

    ctx.fillStyle = 'rgba(0,0,0,0.85)';
    ctx.fillRect(mx - 2, my - 2, size + 4, size + 4);
    ctx.strokeStyle = colors.fg;
    ctx.lineWidth = 1;
    ctx.strokeRect(mx - 2, my - 2, size + 4, size + 4);

    for (let y = 0; y < MAZE_SIZE; y++) {
      for (let x = 0; x < MAZE_SIZE; x++) {
        const val = engine.maze[y][x];
        if (val === 1) {
          ctx.fillStyle = colors.dim;
          ctx.fillRect(mx + x * cellSize, my + y * cellSize, cellSize, cellSize);
        } else if (val === 2) {
          ctx.fillStyle = '#44ff44';
          ctx.fillRect(mx + x * cellSize, my + y * cellSize, cellSize, cellSize);
        }
      }
    }

    // Draw Rex (Red/Solid block)
    ctx.fillStyle = '#ff4444';
    ctx.fillRect(
      mx + engine.rexX * cellSize,
      my + engine.rexY * cellSize,
      cellSize * 1.5,
      cellSize * 1.5
    );

    // Draw Player (White/Green dot with direction line)
    ctx.fillStyle = colors.accent;
    ctx.fillRect(
      mx + engine.playerX * cellSize,
      my + engine.playerY * cellSize,
      cellSize,
      cellSize
    );
  }

  private renderScanlines() {
    const ctx = this.ctx;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.22)';
    for (let y = 0; y < ZX81_SCREEN_HEIGHT; y += 2) {
      ctx.fillRect(0, y, ZX81_SCREEN_WIDTH, 1);
    }
  }
}
