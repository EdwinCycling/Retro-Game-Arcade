import { Direction, Position, ReptonGameState, TileType } from './reptonTypes';
import { REPTON_LEVELS } from './reptonLevels';

export class ReptonRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private tileSize: number = 32;
  public viewMode: 'camera' | 'map' = 'camera';
  public showRadar: boolean = true;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Could not get 2D context');
    this.ctx = context;
  }

  public resize(width: number, height: number) {
    this.canvas.width = width;
    this.canvas.height = height;
  }

  public toggleViewMode() {
    this.viewMode = this.viewMode === 'camera' ? 'map' : 'camera';
  }

  public toggleRadar() {
    this.showRadar = !this.showRadar;
  }

  public render(state: ReptonGameState, crtEnabled: boolean = true) {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    // Clear with BBC Micro pitch black
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, w, h);

    const level = REPTON_LEVELS[state.levelIndex] || REPTON_LEVELS[0];

    const topBarHeight = 44;
    const bottomBarHeight = 36;
    const availableW = w - 16;
    const availableH = h - topBarHeight - bottomBarHeight - 16;

    // 1. Draw BBC Micro Mode 1 Status Marquee Top
    this.renderTopHUD(state, level, topBarHeight);

    if (this.viewMode === 'camera') {
      // SCROLLING VIEWPORT (BBC Micro Mode 5 authentic scale)
      const tileSize = Math.max(26, Math.min(38, Math.floor(Math.min(availableW / 14, availableH / 11))));
      this.tileSize = tileSize;

      const viewPixelW = Math.min(availableW, state.width * tileSize);
      const viewPixelH = Math.min(availableH, state.height * tileSize);
      const offsetX = Math.floor((w - viewPixelW) / 2);
      const offsetY = topBarHeight + Math.floor((availableH - viewPixelH) / 2) + 8;

      const totalWorldW = state.width * tileSize;
      const totalWorldH = state.height * tileSize;
      const targetCamX = (state.reptonVisualPos.x + 0.5) * tileSize - viewPixelW / 2;
      const targetCamY = (state.reptonVisualPos.y + 0.5) * tileSize - viewPixelH / 2;
      const camX = Math.max(0, Math.min(Math.max(0, totalWorldW - viewPixelW), targetCamX));
      const camY = Math.max(0, Math.min(Math.max(0, totalWorldH - viewPixelH), targetCamY));

      ctx.save();
      ctx.beginPath();
      ctx.rect(offsetX, offsetY, viewPixelW, viewPixelH);
      ctx.clip();

      const minTileX = Math.max(0, Math.floor(camX / tileSize));
      const maxTileX = Math.min(state.width - 1, Math.ceil((camX + viewPixelW) / tileSize));
      const minTileY = Math.max(0, Math.floor(camY / tileSize));
      const maxTileY = Math.min(state.height - 1, Math.ceil((camY + viewPixelH) / tileSize));

      for (let y = minTileY; y <= maxTileY; y++) {
        for (let x = minTileX; x <= maxTileX; x++) {
          const px = offsetX + x * tileSize - camX;
          const py = offsetY + y * tileSize - camY;
          const tile = state.grid[y][x];

          if (tile === 'empty') {
            ctx.fillStyle = '#000000';
            ctx.fillRect(px, py, tileSize, tileSize);
          } else if (tile === 'earth') {
            this.drawEarth(px, py, tileSize);
          } else if (tile === 'wall') {
            this.drawWall(px, py, tileSize);
          } else if (tile === 'boulder') {
            this.drawBoulder(px, py, tileSize);
          } else if (tile === 'diamond') {
            this.drawDiamond(px, py, tileSize);
          } else if (tile === 'egg') {
            this.drawEgg(px, py, tileSize);
          } else if (tile === 'key') {
            this.drawKey(px, py, tileSize);
          } else if (tile === 'safe') {
            this.drawSafe(px, py, tileSize);
          } else if (tile === 'transporter') {
            this.drawTransporter(px, py, tileSize);
          }
        }
      }

      // Draw Monsters
      for (const monster of state.monsters) {
        const mx = offsetX + monster.x * tileSize - camX;
        const my = offsetY + monster.y * tileSize - camY;
        if (
          mx + tileSize >= offsetX &&
          mx <= offsetX + viewPixelW &&
          my + tileSize >= offsetY &&
          my <= offsetY + viewPixelH
        ) {
          this.drawMonster(mx, my, tileSize, monster.direction, monster.animFrame);
        }
      }

      // Draw Repton
      const rx = offsetX + state.reptonVisualPos.x * tileSize - camX;
      const ry = offsetY + state.reptonVisualPos.y * tileSize - camY;
      this.drawRepton(rx, ry, tileSize, state.reptonDir, state.reptonAnimFrame);

      ctx.restore();

      // Outer border around playfield
      ctx.strokeStyle = '#00F8F8';
      ctx.lineWidth = 2;
      ctx.strokeRect(offsetX - 2, offsetY - 2, viewPixelW + 4, viewPixelH + 4);

      // Radar mini-map
      if (this.showRadar) {
        const radarSize = Math.min(84, Math.floor(viewPixelW * 0.26));
        this.drawRadar(state, offsetX + viewPixelW - radarSize - 6, offsetY + 6, radarSize, radarSize);
      }
    } else {
      // FULL MAP OVERVIEW (Press 'M' to toggle)
      const scaleX = Math.floor(availableW / state.width);
      const scaleY = Math.floor(availableH / state.height);
      const tileSize = Math.max(8, Math.min(scaleX, scaleY));
      this.tileSize = tileSize;

      const gridPixelW = state.width * tileSize;
      const gridPixelH = state.height * tileSize;
      const offsetX = Math.floor((w - gridPixelW) / 2);
      const offsetY = topBarHeight + Math.floor((availableH - gridPixelH) / 2) + 8;

      ctx.strokeStyle = '#00F8F8';
      ctx.lineWidth = 2;
      ctx.strokeRect(offsetX - 2, offsetY - 2, gridPixelW + 4, gridPixelH + 4);

      for (let y = 0; y < state.height; y++) {
        for (let x = 0; x < state.width; x++) {
          const px = offsetX + x * tileSize;
          const py = offsetY + y * tileSize;
          const tile = state.grid[y][x];

          if (tile === 'empty') {
            ctx.fillStyle = '#000000';
            ctx.fillRect(px, py, tileSize, tileSize);
          } else if (tile === 'earth') {
            this.drawEarth(px, py, tileSize);
          } else if (tile === 'wall') {
            this.drawWall(px, py, tileSize);
          } else if (tile === 'boulder') {
            this.drawBoulder(px, py, tileSize);
          } else if (tile === 'diamond') {
            this.drawDiamond(px, py, tileSize);
          } else if (tile === 'egg') {
            this.drawEgg(px, py, tileSize);
          } else if (tile === 'key') {
            this.drawKey(px, py, tileSize);
          } else if (tile === 'safe') {
            this.drawSafe(px, py, tileSize);
          } else if (tile === 'transporter') {
            this.drawTransporter(px, py, tileSize);
          }
        }
      }

      for (const monster of state.monsters) {
        const mx = offsetX + monster.x * tileSize;
        const my = offsetY + monster.y * tileSize;
        this.drawMonster(mx, my, tileSize, monster.direction, monster.animFrame);
      }

      const rx = offsetX + state.reptonVisualPos.x * tileSize;
      const ry = offsetY + state.reptonVisualPos.y * tileSize;
      this.drawRepton(rx, ry, tileSize, state.reptonDir, state.reptonAnimFrame);
    }

    // 6. Draw Bottom Status & Controls helper
    this.renderBottomHUD(state, level, h - bottomBarHeight, bottomBarHeight);

    // 7. Modals / Overlays (Paused, Game Over, Level Won)
    if (state.isPaused) {
      this.renderOverlay(w, h, 'GAME PAUZED', 'Druk op P of SPATIE om verder te spelen', '#F8F800');
    } else if (state.isGameOver) {
      this.renderOverlay(
        w,
        h,
        'GAME OVER',
        `Score: ${state.score.toLocaleString()} • Druk op ENTER om opnieuw te beginnen`,
        '#D82800'
      );
    } else if (state.isLevelComplete) {
      this.renderOverlay(
        w,
        h,
        `LEVEL ${level.letter} VOLTOOID!`,
        `Wachtwoord: ${level.password} • Bonus +${state.timeLeft * 2} ptn`,
        '#00D800'
      );
    }

    // 8. CRT Scanlines
    if (crtEnabled) {
      this.renderCRT(w, h);
    }
  }

  // --- Tile Drawing Routines in Authentic BBC Micro Pixel Art ---

  private drawEarth(x: number, y: number, size: number) {
    const ctx = this.ctx;
    // Dark earthy brown background
    ctx.fillStyle = '#804000';
    ctx.fillRect(x, y, size, size);

    // Characteristic Mode 1 soil dither pattern
    ctx.fillStyle = '#C06000';
    for (let i = 2; i < size; i += 4) {
      for (let j = 2; j < size; j += 4) {
        ctx.fillRect(x + i, y + j, 2, 2);
      }
    }
    ctx.fillStyle = '#F8F800'; // Little mineral specks
    ctx.fillRect(x + 4, y + 4, 1.5, 1.5);
    ctx.fillRect(x + size - 6, y + size - 6, 1.5, 1.5);
    ctx.fillRect(x + Math.floor(size / 2), y + Math.floor(size / 2), 1.5, 1.5);
  }

  private drawWall(x: number, y: number, size: number) {
    const ctx = this.ctx;
    // Brick mortar base
    ctx.fillStyle = '#000000';
    ctx.fillRect(x, y, size, size);

    // Red BBC Micro bricks
    ctx.fillStyle = '#D82800';
    const half = Math.floor(size / 2);
    // Top brick row
    ctx.fillRect(x + 1, y + 1, half - 2, half - 2);
    ctx.fillRect(x + half, y + 1, half - 1, half - 2);
    // Bottom offset brick row
    ctx.fillRect(x + 1, y + half, size - 2, half - 1);

    // Subtle brick highlight
    ctx.fillStyle = '#FF6040';
    ctx.fillRect(x + 2, y + 2, half - 4, 1.5);
    ctx.fillRect(x + half + 1, y + 2, half - 3, 1.5);
    ctx.fillRect(x + 2, y + half + 1, size - 4, 1.5);
  }

  private drawBoulder(x: number, y: number, size: number) {
    const ctx = this.ctx;
    const cx = x + size / 2;
    const cy = y + size / 2;
    const r = size * 0.42;

    // Dark outline
    ctx.fillStyle = '#C07000';
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();

    // Golden / Yellow main stone
    ctx.fillStyle = '#F8F800';
    ctx.beginPath();
    ctx.arc(cx - 1, cy - 1, r * 0.85, 0, Math.PI * 2);
    ctx.fill();

    // Chiseled rock cracks / ridges (authentic Repton boulder texture)
    ctx.strokeStyle = '#804000';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.6, 0.4, 2.2);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(cx - 3, cy - 4);
    ctx.lineTo(cx + 4, cy + 2);
    ctx.stroke();

    // White shine speck
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(cx - r * 0.5, cy - r * 0.5, 3, 3);
  }

  private drawDiamond(x: number, y: number, size: number) {
    const ctx = this.ctx;
    const cx = x + size / 2;
    const cy = y + size / 2;
    const r = size * 0.4;

    // Cyan base diamond
    ctx.fillStyle = '#00F8F8';
    ctx.beginPath();
    ctx.moveTo(cx, cy - r);
    ctx.lineTo(cx + r, cy);
    ctx.lineTo(cx, cy + r);
    ctx.lineTo(cx - r, cy);
    ctx.closePath();
    ctx.fill();

    // Dark blue internal facet
    ctx.fillStyle = '#0000D8';
    ctx.beginPath();
    ctx.moveTo(cx, cy - r * 0.5);
    ctx.lineTo(cx + r * 0.5, cy);
    ctx.lineTo(cx, cy + r * 0.5);
    ctx.lineTo(cx - r * 0.5, cy);
    ctx.closePath();
    ctx.fill();

    // Bright white center sparkle
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.moveTo(cx, cy - r * 0.25);
    ctx.lineTo(cx + r * 0.25, cy);
    ctx.lineTo(cx, cy + r * 0.25);
    ctx.lineTo(cx - r * 0.25, cy);
    ctx.closePath();
    ctx.fill();
  }

  private drawEgg(x: number, y: number, size: number) {
    const ctx = this.ctx;
    const cx = x + size / 2;
    const cy = y + size / 2;
    const rx = size * 0.32;
    const ry = size * 0.42;

    // White egg shell
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();

    // Grey shaded rim
    ctx.strokeStyle = '#808080';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Pale blue / pink speckles & small hairline crack
    ctx.strokeStyle = '#D82800';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cx - 2, cy - 4);
    ctx.lineTo(cx + 1, cy - 1);
    ctx.lineTo(cx - 1, cy + 3);
    ctx.stroke();
  }

  private drawMonster(
    x: number,
    y: number,
    size: number,
    dir: Direction,
    anim: number
  ) {
    const ctx = this.ctx;
    const cx = x + size / 2;
    const cy = y + size / 2;

    // Magenta / Violet insect body
    ctx.fillStyle = '#F800F8';
    ctx.beginPath();
    ctx.arc(cx, cy, size * 0.35, 0, Math.PI * 2);
    ctx.fill();

    // Crawling legs
    ctx.strokeStyle = '#F800F8';
    ctx.lineWidth = 2;
    const legOffset = anim === 0 ? 3 : -3;
    // Left legs
    ctx.beginPath();
    ctx.moveTo(cx - 6, cy - 2);
    ctx.lineTo(cx - 12, cy - 6 + legOffset);
    ctx.moveTo(cx - 6, cy + 4);
    ctx.lineTo(cx - 12, cy + 8 - legOffset);
    // Right legs
    ctx.moveTo(cx + 6, cy - 2);
    ctx.lineTo(cx + 12, cy - 6 - legOffset);
    ctx.moveTo(cx + 6, cy + 4);
    ctx.lineTo(cx + 12, cy + 8 + legOffset);
    ctx.stroke();

    // Glowing yellow eyes with red pupils
    ctx.fillStyle = '#F8F800';
    ctx.fillRect(cx - 4, cy - 4, 3, 3);
    ctx.fillRect(cx + 2, cy - 4, 3, 3);
    ctx.fillStyle = '#D82800';
    ctx.fillRect(cx - 3, cy - 3, 1.5, 1.5);
    ctx.fillRect(cx + 3, cy - 3, 1.5, 1.5);
  }

  private drawKey(x: number, y: number, size: number) {
    const ctx = this.ctx;
    const cx = x + size / 2;
    const cy = y + size / 2;

    ctx.fillStyle = '#F8F800';
    // Ring head
    ctx.beginPath();
    ctx.arc(cx - 4, cy, size * 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(cx - 4, cy, size * 0.08, 0, Math.PI * 2);
    ctx.fill();

    // Shaft & teeth
    ctx.fillStyle = '#F8F800';
    ctx.fillRect(cx - 1, cy - 1.5, size * 0.35, 3);
    ctx.fillRect(cx + 6, cy, 2, 4);
    ctx.fillRect(cx + 10, cy, 2, 5);
  }

  private drawSafe(x: number, y: number, size: number) {
    const ctx = this.ctx;
    const pad = 3;
    // Metal grey safe body
    ctx.fillStyle = '#808080';
    ctx.fillRect(x + pad, y + pad, size - pad * 2, size - pad * 2);

    // Rim border
    ctx.strokeStyle = '#C0C0C0';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(x + pad, y + pad, size - pad * 2, size - pad * 2);

    // Dial center
    const cx = x + size / 2;
    const cy = y + size / 2;
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(cx, cy, size * 0.18, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#F8F800';
    ctx.beginPath();
    ctx.arc(cx, cy, size * 0.08, 0, Math.PI * 2);
    ctx.fill();
  }

  private drawTransporter(x: number, y: number, size: number) {
    const ctx = this.ctx;
    const cx = x + size / 2;
    const cy = y + size / 2;

    // Glowing cyan/magenta vortex ring
    const now = Date.now() * 0.005;
    const r = (Math.sin(now) * 0.1 + 0.35) * size;

    ctx.strokeStyle = '#00F8F8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = '#F800F8';
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.5, 0, Math.PI * 2);
    ctx.fill();
  }

  private drawRepton(
    x: number,
    y: number,
    size: number,
    dir: Direction,
    animFrame: number
  ) {
    const ctx = this.ctx;
    const cx = x + size / 2;
    const cy = y + size / 2;
    const r = size * 0.4;

    // Iconic Bright Green Repton body
    ctx.fillStyle = '#00D800';
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();

    // Yellow belly patch
    ctx.fillStyle = '#F8F800';
    ctx.beginPath();
    ctx.arc(cx, cy + 2, r * 0.5, 0, Math.PI);
    ctx.fill();

    // Big white eyes with black pupils
    const eyeOffsetX = dir === 'left' ? -3 : dir === 'right' ? 3 : 0;
    const eyeOffsetY = dir === 'up' ? -3 : dir === 'down' ? 2 : 0;

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(cx - 5 + eyeOffsetX, cy - 6 + eyeOffsetY, 4, 5);
    ctx.fillRect(cx + 1 + eyeOffsetX, cy - 6 + eyeOffsetY, 4, 5);

    ctx.fillStyle = '#000000';
    ctx.fillRect(cx - 4 + eyeOffsetX * 1.3, cy - 4 + eyeOffsetY, 2.5, 2.5);
    ctx.fillRect(cx + 2 + eyeOffsetX * 1.3, cy - 4 + eyeOffsetY, 2.5, 2.5);

    // Cute green snout
    ctx.fillStyle = '#00A000';
    if (dir === 'left') {
      ctx.fillRect(cx - r - 1, cy - 1, 4, 4);
    } else if (dir === 'right') {
      ctx.fillRect(cx + r - 3, cy - 1, 4, 4);
    }

    // Walking feet animation
    ctx.fillStyle = '#00A000';
    const footAnim = (animFrame % 2 === 0) ? 2 : -2;
    ctx.fillRect(cx - 5, cy + r - 2 + footAnim, 3.5, 3.5);
    ctx.fillRect(cx + 2, cy + r - 2 - footAnim, 3.5, 3.5);
  }

  // --- Top and Bottom Status Banners in authentic BBC Micro font & styling ---

  private renderTopHUD(state: ReptonGameState, level: typeof REPTON_LEVELS[0], height: number) {
    const ctx = this.ctx;
    const w = this.canvas.width;

    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, w, height);

    ctx.font = 'bold 12px monospace';
    ctx.textAlign = 'left';

    // BBC Micro Color Bands
    // Level & Name
    ctx.fillStyle = '#F8F800';
    ctx.fillText(`LEVEL ${level.letter}: ${level.name.toUpperCase()}`, 12, 18);

    // Score
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(`SCORE: ${state.score.toString().padStart(6, '0')}`, 12, 36);

    // Diamonds Remaining (Target)
    ctx.textAlign = 'center';
    ctx.fillStyle = '#00F8F8';
    ctx.fillText(`DIAMONDS: ${state.diamondsRemaining} / ${state.totalDiamonds}`, w / 2, 18);

    // Safes or Key
    if (state.hasKey) {
      ctx.fillStyle = '#F8F800';
      ctx.fillText(`★ SLEUTEL GEVONDEN!`, w / 2, 36);
    } else if (state.safesCount > 0) {
      ctx.fillStyle = '#808080';
      ctx.fillText(`KLUISEN: ${state.safesCount}`, w / 2, 36);
    } else {
      ctx.fillStyle = '#00D800';
      ctx.fillText(`SUPERIOR SOFTWARE 1985`, w / 2, 36);
    }

    // Time & Lives Right
    ctx.textAlign = 'right';
    ctx.fillStyle = state.timeLeft <= 20 ? '#D82800' : '#FFFFFF';
    ctx.fillText(`TIME: ${state.timeLeft}s`, w - 12, 18);

    ctx.fillStyle = '#00D800';
    const livesIcons = '🦎 '.repeat(Math.max(0, state.lives));
    ctx.fillText(`LIVES: ${livesIcons}`, w - 12, 36);

    // Divider line
    ctx.strokeStyle = '#D82800';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, height - 2);
    ctx.lineTo(w, height - 2);
    ctx.stroke();
  }

  private renderBottomHUD(state: ReptonGameState, level: typeof REPTON_LEVELS[0], y: number, height: number) {
    const ctx = this.ctx;
    const w = this.canvas.width;

    ctx.fillStyle = '#000000';
    ctx.fillRect(0, y, w, height);

    ctx.strokeStyle = '#00F8F8';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();

    ctx.font = '10px monospace';
    ctx.textAlign = 'left';
    ctx.fillStyle = '#808080';
    ctx.fillText(`WACHTWOORD: "${level.password}"`, 12, y + 18);

    ctx.textAlign = 'right';
    ctx.fillStyle = '#C0C0C0';
    ctx.fillText(`BESTURING: PIJLTJES / WASD • R: HERSTART LEVEL • P: PAUZE`, w - 12, y + 18);
  }

  private renderOverlay(w: number, h: number, title: string, subtitle: string, color: string) {
    const ctx = this.ctx;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.82)';
    ctx.fillRect(0, 0, w, h);

    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    const boxW = Math.min(500, w - 40);
    const boxH = 140;
    const boxX = (w - boxW) / 2;
    const boxY = (h - boxH) / 2;

    ctx.fillStyle = '#000000';
    ctx.fillRect(boxX, boxY, boxW, boxH);
    ctx.strokeRect(boxX, boxY, boxW, boxH);

    ctx.font = 'bold 24px monospace';
    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.fillText(title, w / 2, boxY + 50);

    ctx.font = '12px monospace';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(subtitle, w / 2, boxY + 90);
  }

  private drawRadar(state: ReptonGameState, rx: number, ry: number, rw: number, rh: number) {
    const ctx = this.ctx;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.78)';
    ctx.fillRect(rx, ry, rw, rh);
    ctx.strokeStyle = '#00F8F8';
    ctx.lineWidth = 1;
    ctx.strokeRect(rx, ry, rw, rh);

    const cellW = rw / state.width;
    const cellH = rh / state.height;

    for (let y = 0; y < state.height; y++) {
      for (let x = 0; x < state.width; x++) {
        const t = state.grid[y][x];
        const px = rx + x * cellW;
        const py = ry + y * cellH;
        if (t === 'diamond') {
          ctx.fillStyle = '#F8F800';
          ctx.fillRect(px, py, Math.max(1.5, cellW), Math.max(1.5, cellH));
        } else if (t === 'wall') {
          ctx.fillStyle = '#444444';
          ctx.fillRect(px, py, cellW, cellH);
        } else if (t === 'boulder') {
          ctx.fillStyle = '#AAAAAA';
          ctx.fillRect(px, py, cellW, cellH);
        } else if (t === 'safe') {
          ctx.fillStyle = '#00D800';
          ctx.fillRect(px, py, cellW, cellH);
        } else if (t === 'key') {
          ctx.fillStyle = '#FF8800';
          ctx.fillRect(px, py, cellW, cellH);
        } else if (t === 'egg') {
          ctx.fillStyle = '#F8F8F8';
          ctx.fillRect(px, py, cellW, cellH);
        }
      }
    }

    // Repton blip on radar (blinking)
    const repX = rx + state.reptonPos.x * cellW;
    const repY = ry + state.reptonPos.y * cellH;
    ctx.fillStyle = Math.floor(Date.now() / 250) % 2 === 0 ? '#FFFFFF' : '#00F8F8';
    ctx.fillRect(repX - 1, repY - 1, Math.max(3, cellW + 1), Math.max(3, cellH + 1));
  }

  private renderCRT(w: number, h: number) {
    const ctx = this.ctx;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.12)';
    for (let y = 0; y < h; y += 3) {
      ctx.fillRect(0, y, w, 1);
    }
  }
}
