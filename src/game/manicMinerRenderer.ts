/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Authentic Sinclair ZX Spectrum 48K Renderer for Manic Miner (1983)
 */

import {
  ZX_WIDTH,
  ZX_HEIGHT,
  TILE_SIZE,
  GRID_COLS,
  GRID_ROWS,
  CavernDef,
} from './manicMinerLevels';
import { ManicMinerEngine, ActiveGuardian } from './manicMinerEngine';

export class ManicMinerRenderer {
  private ctx: CanvasRenderingContext2D;
  public enableCRT: boolean = true;
  private blinkTimer: number = 0;

  // ZX Spectrum Standard Color Palette
  private readonly ZX_COLORS = {
    black: '#000000',
    blue: '#0000d7',
    red: '#d70000',
    magenta: '#d700d7',
    green: '#00d700',
    cyan: '#00d7d7',
    yellow: '#d7d700',
    white: '#ffffff',
    // Bright palette
    brightBlue: '#0000ff',
    brightRed: '#ff2222',
    brightMagenta: '#ff22ff',
    brightGreen: '#00ff00',
    brightCyan: '#00ffff',
    brightYellow: '#ffff00',
    brightWhite: '#ffffff',
  };

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
  }

  public render(engine: ManicMinerEngine) {
    this.blinkTimer += 0.05;
    const ctx = this.ctx;

    // Clear border with Sinclair border color
    ctx.fillStyle = engine.borderFlashColor || this.ZX_COLORS.black;
    ctx.fillRect(0, 0, ZX_WIDTH, ZX_HEIGHT);

    // Tape loading stripe border effect during title or state changes
    if (engine.state === 'TITLE' || engine.tapeBorderTimer % 1.0 < 0.1) {
      this.renderSinclairBorderStripes(engine);
    }

    // Render Cavern Background & Tiles
    this.renderCavern(engine);

    // Render Keys / Collectibles
    this.renderKeys(engine);

    // Render Guardians / Monsters
    this.renderGuardians(engine);

    // Render Special Mechanisms (Solar ray / Kong)
    this.renderSpecialMechanisms(engine);

    // Render Miner Willy
    if (engine.state === 'PLAYING' || engine.state === 'CAVERN_CLEAR' || (engine.state === 'DEATH' && Math.floor(engine.stateTimer * 10) % 2 === 0)) {
      this.renderWilly(engine);
    }

    // Render Monty Python Boot Crush on Game Over
    if (engine.state === 'BOOT_CRUSH') {
      this.renderBoot(engine);
    }

    // Render Spectrum HUD & Air Bar
    this.renderHUD(engine);

    // Overlays for Title / Game Over / Victory
    if (engine.state === 'TITLE') {
      this.renderTitleScreen(engine);
    } else if (engine.state === 'GAME_OVER') {
      this.renderGameOver(engine);
    } else if (engine.state === 'VICTORY') {
      this.renderVictory(engine);
    }

    // Optional CRT scanline filter
    if (this.enableCRT) {
      this.renderScanlines();
    }
  }

  private renderSinclairBorderStripes(engine: ManicMinerEngine) {
    const ctx = this.ctx;
    const t = Math.floor(engine.tapeBorderTimer * 20);
    const stripeColor = t % 2 === 0 ? this.ZX_COLORS.cyan : this.ZX_COLORS.red;
    ctx.fillStyle = stripeColor;
    ctx.fillRect(0, 0, ZX_WIDTH, 4);
    ctx.fillRect(0, ZX_HEIGHT - 4, ZX_WIDTH, 4);
    ctx.fillRect(0, 0, 4, ZX_HEIGHT);
    ctx.fillRect(ZX_WIDTH - 4, 0, 4, ZX_HEIGHT);
  }

  private renderCavern(engine: ManicMinerEngine) {
    const ctx = this.ctx;
    const cavern = engine.cavern;

    // Playfield background
    ctx.fillStyle = cavern.paperColor;
    ctx.fillRect(0, 0, ZX_WIDTH, 128);

    const animConveyorOffset = Math.floor(this.blinkTimer * 8) % 8;

    for (let r = 0; r < GRID_ROWS; r++) {
      const row = cavern.layout[r];
      if (!row) continue;

      for (let c = 0; c < GRID_COLS; c++) {
        const ch = row[c];
        const px = c * TILE_SIZE;
        const py = r * TILE_SIZE;

        if (ch === '#') {
          // Solid Wall / Brick
          this.drawSolidBrick(px, py, cavern.inkColor);
        } else if (ch === '=') {
          // Crumbly Floor
          const crumbly = engine.crumblyTiles.get(`${c},${r}`);
          if (crumbly && crumbly.life > 0) {
            this.drawCrumblyFloor(px, py, crumbly.life, cavern.inkColor);
          }
        } else if (ch === '<') {
          // Conveyor Left
          this.drawConveyor(px, py, -1, animConveyorOffset, this.ZX_COLORS.brightYellow);
        } else if (ch === '>') {
          // Conveyor Right
          this.drawConveyor(px, py, 1, animConveyorOffset, this.ZX_COLORS.brightYellow);
        } else if (ch === '^') {
          // Lethal Floor Spikes / Stalagmites
          this.drawSpikes(px, py, this.ZX_COLORS.brightRed);
        } else if (ch === 'v') {
          // Overhead Stalactites
          this.drawStalactite(px, py, this.ZX_COLORS.brightCyan);
        } else if (ch === 'L') {
          // Kong Lever Switch
          this.drawLever(px, py, engine.kongDropped);
        }
      }
    }

    // Portal Door (Exit)
    this.drawPortal(cavern.portalX, cavern.portalY, engine.isExitOpen);
  }

  private drawSolidBrick(x: number, y: number, color: string) {
    const ctx = this.ctx;
    ctx.fillStyle = color;
    ctx.fillRect(x, y, 8, 8);
    // Spectrum brick pattern mortar lines
    ctx.fillStyle = '#000000';
    ctx.fillRect(x, y, 8, 1);
    ctx.fillRect(x, y + 4, 8, 1);
    ctx.fillRect(x + 4, y + 1, 1, 3);
    ctx.fillRect(x + 1, y + 5, 1, 3);
  }

  private drawCrumblyFloor(x: number, y: number, life: number, color: string) {
    const ctx = this.ctx;
    ctx.fillStyle = color;
    const height = Math.max(1, Math.floor(life * 2));
    ctx.fillRect(x, y + (8 - height), 8, height);
  }

  private drawConveyor(x: number, y: number, dir: number, offset: number, color: string) {
    const ctx = this.ctx;
    ctx.fillStyle = '#000000';
    ctx.fillRect(x, y, 8, 8);
    ctx.fillStyle = color;
    ctx.fillRect(x, y + 6, 8, 2);

    // Moving arrow stripes
    ctx.fillStyle = this.ZX_COLORS.brightWhite;
    for (let i = 0; i < 8; i += 4) {
      const arrowX = x + ((i + (dir > 0 ? offset : -offset) + 8) % 8);
      ctx.fillRect(arrowX, y + 2, 2, 3);
    }
  }

  private drawSpikes(x: number, y: number, color: string) {
    const ctx = this.ctx;
    ctx.fillStyle = color;
    // 2 lethal spikes per 8px tile
    ctx.beginPath();
    ctx.moveTo(x, y + 8);
    ctx.lineTo(x + 2, y + 2);
    ctx.lineTo(x + 4, y + 8);
    ctx.lineTo(x + 6, y + 2);
    ctx.lineTo(x + 8, y + 8);
    ctx.closePath();
    ctx.fill();
  }

  private drawStalactite(x: number, y: number, color: string) {
    const ctx = this.ctx;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + 4, y + 6);
    ctx.lineTo(x + 8, y);
    ctx.closePath();
    ctx.fill();
  }

  private drawLever(x: number, y: number, activated: boolean) {
    const ctx = this.ctx;
    ctx.fillStyle = this.ZX_COLORS.brightYellow;
    ctx.fillRect(x + 2, y + 5, 4, 3);
    ctx.strokeStyle = activated ? this.ZX_COLORS.brightGreen : this.ZX_COLORS.brightRed;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x + 4, y + 5);
    ctx.lineTo(activated ? x + 7 : x + 1, y + 1);
    ctx.stroke();
  }

  private drawPortal(x: number, y: number, isOpen: boolean) {
    const ctx = this.ctx;
    // Spectrum flashing portal archway
    const colors = [
      this.ZX_COLORS.brightYellow,
      this.ZX_COLORS.brightCyan,
      this.ZX_COLORS.brightMagenta,
      this.ZX_COLORS.brightGreen,
    ];
    const flashCol = isOpen
      ? colors[Math.floor(this.blinkTimer * 10) % colors.length]
      : this.ZX_COLORS.blue;

    ctx.fillStyle = flashCol;
    ctx.fillRect(x, y, 16, 16);
    ctx.fillStyle = isOpen ? '#000000' : '#111155';
    ctx.fillRect(x + 2, y + 2, 12, 14);

    if (isOpen) {
      // Swirling portal vortex
      ctx.fillStyle = flashCol;
      ctx.fillRect(x + 4, y + 4, 8, 8);
      ctx.fillStyle = '#000000';
      ctx.fillRect(x + 6, y + 6, 4, 4);
    }
  }

  private renderKeys(engine: ManicMinerEngine) {
    const ctx = this.ctx;
    const colors = [
      this.ZX_COLORS.brightYellow,
      this.ZX_COLORS.brightWhite,
      this.ZX_COLORS.brightCyan,
    ];
    const flashCol = colors[Math.floor(this.blinkTimer * 8) % colors.length];

    for (const key of engine.keys) {
      if (key.collected) continue;
      const px = key.gridX * TILE_SIZE;
      const py = key.gridY * TILE_SIZE;

      ctx.fillStyle = flashCol;
      // Key head
      ctx.fillRect(px + 1, py + 1, 4, 4);
      ctx.fillStyle = '#000000';
      ctx.fillRect(px + 2, py + 2, 2, 2);
      // Key stem & teeth
      ctx.fillStyle = flashCol;
      ctx.fillRect(px + 3, py + 5, 2, 3);
      ctx.fillRect(px + 5, py + 6, 2, 1);
    }
  }

  private renderWilly(engine: ManicMinerEngine) {
    const ctx = this.ctx;
    const w = engine.willy;
    const px = Math.floor(w.x);
    const py = Math.floor(w.y);

    // Spectrum Miner Willy Character Sprite (White miner top hat & face, Cyan suit, White boots)
    // Hat
    ctx.fillStyle = this.ZX_COLORS.brightWhite;
    ctx.fillRect(px + 1, py, 6, 3);
    ctx.fillRect(px, py + 3, 8, 1);

    // Head / Face
    ctx.fillStyle = this.ZX_COLORS.brightYellow;
    ctx.fillRect(px + 1, py + 4, 6, 4);
    // Eye
    ctx.fillStyle = '#000000';
    if (w.facing > 0) {
      ctx.fillRect(px + 5, py + 5, 1, 1);
    } else {
      ctx.fillRect(px + 2, py + 5, 1, 1);
    }

    // Torso / Miner Suit
    ctx.fillStyle = this.ZX_COLORS.brightCyan;
    ctx.fillRect(px + 1, py + 8, 6, 4);

    // Legs & Running animation
    ctx.fillStyle = this.ZX_COLORS.brightWhite;
    const legFrame = w.isJumping ? 2 : w.animFrame;
    if (legFrame === 0) {
      ctx.fillRect(px + 1, py + 12, 2, 4);
      ctx.fillRect(px + 5, py + 12, 2, 4);
    } else if (legFrame === 1) {
      ctx.fillRect(px, py + 12, 3, 4);
      ctx.fillRect(px + 4, py + 12, 2, 3);
    } else if (legFrame === 2) {
      // Jump pose
      ctx.fillRect(px, py + 12, 2, 3);
      ctx.fillRect(px + 6, py + 12, 2, 3);
    } else {
      ctx.fillRect(px + 2, py + 12, 2, 3);
      ctx.fillRect(px + 5, py + 12, 3, 4);
    }
  }

  private renderGuardians(engine: ManicMinerEngine) {
    const ctx = this.ctx;
    for (const g of engine.guardians) {
      const px = Math.floor(g.x);
      const py = Math.floor(g.y);
      const col = g.def.color;

      ctx.fillStyle = col;

      switch (g.def.type) {
        case 'robot':
          // Mining Droid / Robot
          ctx.fillRect(px + 2, py, 8, 4);
          // Eyes
          ctx.fillStyle = '#000000';
          ctx.fillRect(px + (g.direction > 0 ? 7 : 3), py + 1, 2, 2);
          // Torso
          ctx.fillStyle = col;
          ctx.fillRect(px + 1, py + 4, 10, 6);
          // Legs
          if (g.animFrame % 2 === 0) {
            ctx.fillRect(px + 2, py + 10, 2, 4);
            ctx.fillRect(px + 8, py + 10, 2, 4);
          } else {
            ctx.fillRect(px + 4, py + 10, 4, 4);
          }
          break;

        case 'spider':
          // Cave Spider hanging on thread
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(px + 5, 0, 1, py);
          ctx.fillStyle = col;
          ctx.beginPath();
          ctx.arc(px + 6, py + 6, 5, 0, Math.PI * 2);
          ctx.fill();
          // Legs
          ctx.fillRect(px + 1, py + 3, 2, 2);
          ctx.fillRect(px + 9, py + 3, 2, 2);
          ctx.fillRect(px, py + 7, 2, 2);
          ctx.fillRect(px + 10, py + 7, 2, 2);
          break;

        case 'toilet':
          // Eugene (The infamous toilet boss)
          ctx.fillRect(px + 2, py, 12, 4); // Tank
          ctx.fillRect(px + 4, py + 4, 8, 6); // Seat
          ctx.fillStyle = '#000000';
          ctx.fillRect(px + 6, py + 6, 4, 3); // Hole
          ctx.fillStyle = this.ZX_COLORS.brightRed;
          // Eugene's eyes
          ctx.fillRect(px + 4, py + 1, 2, 2);
          ctx.fillRect(px + 10, py + 1, 2, 2);
          break;

        case 'penguin':
          // Chilly Penguin
          ctx.fillStyle = col;
          ctx.fillRect(px + 2, py, 8, 10);
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(px + 4, py + 3, 4, 6);
          ctx.fillStyle = '#ff8800'; // Beak & feet
          ctx.fillRect(px + (g.direction > 0 ? 8 : 1), py + 2, 3, 2);
          ctx.fillRect(px + 2, py + 10, 8, 2);
          break;

        case 'phone':
          // Mutant Ringing Rotary Telephone
          ctx.fillStyle = col;
          ctx.fillRect(px + 1, py + 4, 12, 8); // Body
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(px + 4, py + 6, 6, 4); // Dial
          ctx.fillStyle = this.ZX_COLORS.brightRed;
          // Handset ringing
          const jiggle = g.animFrame % 2 === 0 ? -1 : 1;
          ctx.fillRect(px + 2 + jiggle, py, 10, 3);
          break;

        case 'kong':
          // Giant Kong Alien Beast
          ctx.fillStyle = col;
          ctx.fillRect(px + 2, py, 20, 20);
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(px + 6, py + 4, 4, 4);
          ctx.fillRect(px + 14, py + 4, 4, 4);
          ctx.fillStyle = '#000000';
          ctx.fillRect(px + 8, py + 6, 2, 2);
          ctx.fillRect(px + 16, py + 6, 2, 2);
          break;

        case 'amoeba':
          // Floating Amoebatron
          ctx.fillStyle = col;
          ctx.beginPath();
          ctx.arc(px + 6, py + 6, 6 + (g.animFrame % 2), 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(px + 4, py + 4, 2, 2);
          break;

        case 'skylab':
          // Orbiting Skylab Module
          ctx.fillStyle = col;
          ctx.fillRect(px + 3, py + 3, 6, 6);
          ctx.fillStyle = this.ZX_COLORS.brightCyan;
          ctx.fillRect(px, py + 5, 3, 2); // Solar panel left
          ctx.fillRect(px + 9, py + 5, 3, 2); // Solar panel right
          break;

        case 'barrel':
          // Rolling Crate / Boulder
          ctx.fillStyle = col;
          ctx.fillRect(px + 1, py + 1, 10, 10);
          ctx.fillStyle = '#000000';
          ctx.fillRect(px + 3, py + 3, 6, 6);
          break;
      }
    }
  }

  private renderSpecialMechanisms(engine: ManicMinerEngine) {
    const ctx = this.ctx;
    // Solar Laser Beam (Cavern 19)
    if (engine.cavern.specialMechanism === 'solar_ray') {
      const rx = Math.floor(engine.solarRayX);
      ctx.fillStyle = this.ZX_COLORS.brightYellow;
      ctx.fillRect(rx - 1, 16, 2, 104);
      ctx.fillStyle = this.ZX_COLORS.brightWhite;
      ctx.fillRect(rx, 16, 1, 104);
    }
  }

  private renderBoot(engine: ManicMinerEngine) {
    const ctx = this.ctx;
    const by = Math.floor(engine.bootY);
    // Giant Monty Python 16-ton Foot
    ctx.fillStyle = this.ZX_COLORS.brightWhite;
    ctx.fillRect(80, by - 60, 60, 60); // Leg
    ctx.fillRect(60, by, 120, 28); // Foot
    ctx.fillStyle = this.ZX_COLORS.brightRed;
    ctx.fillRect(60, by + 24, 120, 6); // Sole
  }

  private renderHUD(engine: ManicMinerEngine) {
    const ctx = this.ctx;

    // Bottom Screen Status Area (128 to 192 px)
    ctx.fillStyle = this.ZX_COLORS.black;
    ctx.fillRect(0, 128, ZX_WIDTH, 64);

    ctx.font = '8px monospace';
    ctx.textAlign = 'left';

    // Top HUD line: Cavern Name & High Score
    ctx.fillStyle = this.ZX_COLORS.brightYellow;
    ctx.fillText(engine.cavern.name.toUpperCase(), 8, 140);

    ctx.fillStyle = this.ZX_COLORS.brightCyan;
    ctx.textAlign = 'right';
    ctx.fillText(`HIGH: ${engine.highScore.toString().padStart(6, '0')}`, ZX_WIDTH - 8, 140);

    // Score & Level
    ctx.textAlign = 'left';
    ctx.fillStyle = this.ZX_COLORS.brightWhite;
    ctx.fillText(`SCORE: ${engine.score.toString().padStart(6, '0')}`, 8, 152);

    ctx.textAlign = 'right';
    ctx.fillStyle = this.ZX_COLORS.brightGreen;
    ctx.fillText(`CAVERN ${engine.currentCavernIndex + 1}/20`, ZX_WIDTH - 8, 152);

    // Air Gauge Bar
    ctx.textAlign = 'left';
    ctx.fillStyle = this.ZX_COLORS.brightWhite;
    ctx.fillText('AIR:', 8, 164);

    const airRatio = Math.max(0, engine.air / engine.maxAir);
    const barWidth = 180;
    const filledWidth = Math.floor(barWidth * airRatio);

    ctx.fillStyle = '#222222';
    ctx.fillRect(36, 158, barWidth, 6);

    const airColor =
      airRatio > 0.4
        ? this.ZX_COLORS.brightGreen
        : airRatio > 0.2
        ? this.ZX_COLORS.brightYellow
        : this.ZX_COLORS.brightRed;

    ctx.fillStyle = airColor;
    ctx.fillRect(36, 158, filledWidth, 6);

    // Lives Icons (Tiny Miner Willy Sprites)
    ctx.fillStyle = this.ZX_COLORS.brightWhite;
    ctx.fillText('LIVES:', 8, 178);

    for (let i = 0; i < engine.lives; i++) {
      const lx = 44 + i * 12;
      ctx.fillStyle = this.ZX_COLORS.brightYellow;
      ctx.fillRect(lx, 172, 4, 3);
      ctx.fillStyle = this.ZX_COLORS.brightCyan;
      ctx.fillRect(lx, 175, 4, 4);
    }

    // Audio status icon
    ctx.textAlign = 'right';
    ctx.fillStyle = this.ZX_COLORS.brightYellow;
    ctx.fillText(engine.musicMode === 'music' ? '🎵 BGM: ON' : '🔊 SFX ONLY', ZX_WIDTH - 8, 178);
  }

  private renderTitleScreen(engine: ManicMinerEngine) {
    const ctx = this.ctx;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.82)';
    ctx.fillRect(16, 20, ZX_WIDTH - 32, 90);

    ctx.strokeStyle = this.ZX_COLORS.brightCyan;
    ctx.lineWidth = 1;
    ctx.strokeRect(16, 20, ZX_WIDTH - 32, 90);

    ctx.font = 'bold 12px monospace';
    ctx.textAlign = 'center';

    ctx.fillStyle = this.ZX_COLORS.brightYellow;
    ctx.fillText('★ MANIC MINER ★', ZX_WIDTH / 2, 38);

    ctx.font = '8px monospace';
    ctx.fillStyle = this.ZX_COLORS.brightWhite;
    ctx.fillText('MATTHEW SMITH • BUG-BYTE / 1983', ZX_WIDTH / 2, 52);

    ctx.fillStyle = this.ZX_COLORS.brightCyan;
    ctx.fillText('SINCLAIR ZX SPECTRUM 48K', ZX_WIDTH / 2, 64);

    const flash = Math.floor(this.blinkTimer * 4) % 2 === 0;
    if (flash) {
      ctx.fillStyle = this.ZX_COLORS.brightGreen;
      ctx.fillText('▶ DRUK OP START / ENTER ◀', ZX_WIDTH / 2, 82);
    }

    ctx.fillStyle = this.ZX_COLORS.brightMagenta;
    ctx.fillText('[O] LINKS • [P] RECHTS • [SPACE] SPRING', ZX_WIDTH / 2, 96);
  }

  private renderGameOver(engine: ManicMinerEngine) {
    const ctx = this.ctx;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.88)';
    ctx.fillRect(24, 35, ZX_WIDTH - 48, 60);
    ctx.strokeStyle = this.ZX_COLORS.brightRed;
    ctx.lineWidth = 1;
    ctx.strokeRect(24, 35, ZX_WIDTH - 48, 60);

    ctx.font = 'bold 12px monospace';
    ctx.textAlign = 'center';
    ctx.fillStyle = this.ZX_COLORS.brightRed;
    ctx.fillText('GAME OVER', ZX_WIDTH / 2, 55);

    ctx.font = '8px monospace';
    ctx.fillStyle = this.ZX_COLORS.brightWhite;
    ctx.fillText(`EINDSCORE: ${engine.score}`, ZX_WIDTH / 2, 70);
    ctx.fillStyle = this.ZX_COLORS.brightYellow;
    ctx.fillText('WILLY WAS CRUSHED!', ZX_WIDTH / 2, 82);
  }

  private renderVictory(engine: ManicMinerEngine) {
    const ctx = this.ctx;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
    ctx.fillRect(20, 25, ZX_WIDTH - 40, 80);
    ctx.strokeStyle = this.ZX_COLORS.brightGreen;
    ctx.lineWidth = 1;
    ctx.strokeRect(20, 25, ZX_WIDTH - 40, 80);

    ctx.font = 'bold 11px monospace';
    ctx.textAlign = 'center';
    ctx.fillStyle = this.ZX_COLORS.brightYellow;
    ctx.fillText('GEFELICITEERD!', ZX_WIDTH / 2, 45);

    ctx.font = '8px monospace';
    ctx.fillStyle = this.ZX_COLORS.brightWhite;
    ctx.fillText('WILLY HEEFT ALLE 20 GROTTEN', ZX_WIDTH / 2, 60);
    ctx.fillText('OVERLEEFD EN IS MULTIMILJONAIR!', ZX_WIDTH / 2, 72);

    ctx.fillStyle = this.ZX_COLORS.brightCyan;
    ctx.fillText(`EINDSCORE: ${engine.score}`, ZX_WIDTH / 2, 88);
  }

  private renderScanlines() {
    const ctx = this.ctx;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.18)';
    for (let y = 0; y < ZX_HEIGHT; y += 2) {
      ctx.fillRect(0, y, ZX_WIDTH, 1);
    }
  }
}
