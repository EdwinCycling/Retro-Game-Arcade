/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Arcadians - BBC Micro Mode 2 Pixel-Perfect Canvas Renderer
 * High-fidelity 8-color graphics with sprite rotation, wing animations,
 * multi-layered parallax starfield, and CRT phosphor filter.
 */

import { Alien, AlienType, ArcadiansGameState } from './arcadiansTypes';
import { ArcadiansEngine } from './arcadiansEngine';
import { CANVAS_HEIGHT, CANVAS_WIDTH } from './arcadiansWaves';

export class ArcadiansRenderer {
  private ctx: CanvasRenderingContext2D;

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
  }

  public render(engine: ArcadiansEngine, enableCRT: boolean = true) {
    const ctx = this.ctx;

    // 1. Background Fill (Pure BBC Mode 2 Black)
    ctx.fillStyle = '#050508';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // 2. Parallax Multi-Colored Starfield
    this.renderStarfield(engine);

    // 3. Aliens in Formation & Diving
    this.renderAliens(engine);

    // 4. Player & Laser Bullet
    this.renderPlayer(engine);
    this.renderBullet(engine);

    // 5. Alien Projectiles
    this.renderAlienBullets(engine);

    // 6. Particles & Explosions
    this.renderParticles(engine);

    // 7. Floating Points popups
    this.renderFloatingTexts(engine);

    // 8. HUD & Wave Badges
    this.renderHUD(engine);

    // 9. State Overlays (Title, Wave Clear, Game Over)
    this.renderOverlays(engine);

    // 10. Optional CRT Scanline overlay
    if (enableCRT) {
      this.renderCRTScanlines();
    }
  }

  private renderStarfield(engine: ArcadiansEngine) {
    const ctx = this.ctx;
    for (const s of engine.stars) {
      ctx.fillStyle = s.color;
      // Twinkle effect
      const opacity = 0.6 + 0.4 * Math.sin(s.twinkleTimer * 0.1);
      ctx.globalAlpha = opacity;
      ctx.fillRect(Math.floor(s.x), Math.floor(s.y), s.size, s.size);
    }
    ctx.globalAlpha = 1.0;
  }

  private renderAliens(engine: ArcadiansEngine) {
    for (const alien of engine.aliens) {
      if (alien.state === 'DESTROYED') continue;
      this.drawAlienSprite(alien);
    }
  }

  /**
   * Draws authentic BBC Micro Mode 2 alien sprites with rotation for diving
   */
  private drawAlienSprite(alien: Alien) {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(Math.floor(alien.x), Math.floor(alien.y));

    if (alien.state === 'DIVING') {
      ctx.rotate(alien.angle);
    }

    const frame = alien.animFrame;

    switch (alien.type) {
      case 'FLAGSHIP':
        this.drawFlagshipSprite(ctx, frame);
        break;
      case 'HORNET':
        this.drawHornetSprite(ctx, frame);
        break;
      case 'EMISSARY':
        this.drawEmissarySprite(ctx, frame);
        break;
      case 'DRONE':
        this.drawDroneSprite(ctx, frame);
        break;
    }

    ctx.restore();
  }

  /**
   * Yellow Flagship (Galboss) with Red Crown & Cyan Cockpit
   */
  private drawFlagshipSprite(ctx: CanvasRenderingContext2D, frame: number) {
    const p = 2; // Pixel size

    // Red Crown
    ctx.fillStyle = '#ff0033';
    ctx.fillRect(-2 * p, -6 * p, 4 * p, 2 * p);
    ctx.fillRect(-1 * p, -7 * p, 2 * p, 1 * p);

    // Yellow Body & Wings
    ctx.fillStyle = '#ffff00';
    ctx.fillRect(-4 * p, -4 * p, 8 * p, 5 * p);

    if (frame === 0) {
      ctx.fillRect(-7 * p, -3 * p, 3 * p, 4 * p);
      ctx.fillRect(4 * p, -3 * p, 3 * p, 4 * p);
      ctx.fillRect(-8 * p, 0, 1 * p, 3 * p);
      ctx.fillRect(7 * p, 0, 1 * p, 3 * p);
    } else {
      ctx.fillRect(-6 * p, -4 * p, 2 * p, 5 * p);
      ctx.fillRect(4 * p, -4 * p, 2 * p, 5 * p);
      ctx.fillRect(-7 * p, -1 * p, 1 * p, 4 * p);
      ctx.fillRect(6 * p, -1 * p, 1 * p, 4 * p);
    }

    // Cyan Cockpit
    ctx.fillStyle = '#00ffff';
    ctx.fillRect(-1 * p, -2 * p, 2 * p, 2 * p);

    // Red Antennae / Core
    ctx.fillStyle = '#ff0033';
    ctx.fillRect(-2 * p, 2 * p, 4 * p, 1 * p);
  }

  /**
   * Red Hornet (Charger) with Flashing Wings & Stinger
   */
  private drawHornetSprite(ctx: CanvasRenderingContext2D, frame: number) {
    const p = 2;

    // Red Chitin
    ctx.fillStyle = '#ff0033';
    ctx.fillRect(-3 * p, -4 * p, 6 * p, 6 * p);

    // Wing animations
    if (frame === 0) {
      ctx.fillRect(-6 * p, -3 * p, 3 * p, 3 * p);
      ctx.fillRect(3 * p, -3 * p, 3 * p, 3 * p);
      // Yellow wing tips
      ctx.fillStyle = '#ffff00';
      ctx.fillRect(-7 * p, -2 * p, 1 * p, 3 * p);
      ctx.fillRect(6 * p, -2 * p, 1 * p, 3 * p);
    } else {
      ctx.fillRect(-5 * p, -2 * p, 2 * p, 4 * p);
      ctx.fillRect(3 * p, -2 * p, 2 * p, 4 * p);
      ctx.fillStyle = '#ffff00';
      ctx.fillRect(-6 * p, 1 * p, 1 * p, 2 * p);
      ctx.fillRect(5 * p, 1 * p, 1 * p, 2 * p);
    }

    // White Stinger
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-1 * p, 3 * p, 2 * p, 2 * p);
  }

  /**
   * Purple / Magenta Emissary with Cyan Claws
   */
  private drawEmissarySprite(ctx: CanvasRenderingContext2D, frame: number) {
    const p = 2;

    // Magenta Core
    ctx.fillStyle = '#ff00ff';
    ctx.fillRect(-3 * p, -3 * p, 6 * p, 5 * p);

    // Cyan Claws & Eyes
    ctx.fillStyle = '#00ffff';
    ctx.fillRect(-2 * p, -1 * p, 1 * p, 2 * p);
    ctx.fillRect(1 * p, -1 * p, 1 * p, 2 * p);

    if (frame === 0) {
      ctx.fillRect(-5 * p, -2 * p, 2 * p, 3 * p);
      ctx.fillRect(3 * p, -2 * p, 2 * p, 3 * p);
      ctx.fillRect(-6 * p, 0, 1 * p, 2 * p);
      ctx.fillRect(5 * p, 0, 1 * p, 2 * p);
    } else {
      ctx.fillRect(-4 * p, -3 * p, 1 * p, 4 * p);
      ctx.fillRect(3 * p, -3 * p, 1 * p, 4 * p);
      ctx.fillRect(-5 * p, -2 * p, 1 * p, 2 * p);
      ctx.fillRect(4 * p, -2 * p, 1 * p, 2 * p);
    }
  }

  /**
   * Green Drone with Cyan Accents
   */
  private drawDroneSprite(ctx: CanvasRenderingContext2D, frame: number) {
    const p = 2;

    // Bright Green Chitin
    ctx.fillStyle = '#00ff33';
    ctx.fillRect(-3 * p, -3 * p, 6 * p, 5 * p);

    if (frame === 0) {
      ctx.fillRect(-5 * p, -2 * p, 2 * p, 3 * p);
      ctx.fillRect(3 * p, -2 * p, 2 * p, 3 * p);
      // Cyan wing tips
      ctx.fillStyle = '#00ffff';
      ctx.fillRect(-6 * p, 0, 1 * p, 2 * p);
      ctx.fillRect(5 * p, 0, 1 * p, 2 * p);
    } else {
      ctx.fillRect(-4 * p, -1 * p, 1 * p, 3 * p);
      ctx.fillRect(3 * p, -1 * p, 1 * p, 3 * p);
      ctx.fillStyle = '#00ffff';
      ctx.fillRect(-5 * p, -1 * p, 1 * p, 2 * p);
      ctx.fillRect(4 * p, -1 * p, 1 * p, 2 * p);
    }

    // Abdomen
    ctx.fillStyle = '#ffff00';
    ctx.fillRect(-1 * p, 2 * p, 2 * p, 2 * p);
  }

  /**
   * BBC Micro Player Defender Ship
   */
  private renderPlayer(engine: ArcadiansEngine) {
    const player = engine.player;
    if (!player.isAlive) return;

    // Blink when invulnerable
    if (player.invulnerableTimer > 0 && Math.floor(player.invulnerableTimer / 4) % 2 === 0) {
      return;
    }

    const ctx = this.ctx;
    const px = Math.floor(player.x);
    const py = Math.floor(player.y);
    const p = 2;

    ctx.save();
    ctx.translate(px, py);

    // Delta Wings (White)
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-6 * p, 2 * p, 12 * p, 2 * p);
    ctx.fillRect(-4 * p, 0, 8 * p, 2 * p);
    ctx.fillRect(-2 * p, -3 * p, 4 * p, 3 * p);
    ctx.fillRect(-1 * p, -6 * p, 2 * p, 3 * p);

    // Red Wingtips & Stabilizers
    ctx.fillStyle = '#ff0033';
    ctx.fillRect(-7 * p, 0, 1 * p, 4 * p);
    ctx.fillRect(6 * p, 0, 1 * p, 4 * p);
    ctx.fillRect(-1 * p, -1 * p, 2 * p, 2 * p);

    // Cyan Cockpit Glass
    ctx.fillStyle = '#00ffff';
    ctx.fillRect(-1 * p, -4 * p, 2 * p, 2 * p);

    // Thruster Flames (Yellow / Red flicker)
    ctx.fillStyle = Math.random() > 0.5 ? '#ffff00' : '#ff0033';
    ctx.fillRect(-2 * p, 4 * p, 4 * p, 2 * p);
    ctx.fillRect(-1 * p, 6 * p, 2 * p, 2 * p);

    ctx.restore();
  }

  private renderBullet(engine: ArcadiansEngine) {
    if (!engine.bullet.active) return;
    const ctx = this.ctx;
    ctx.fillStyle = '#ffff00';
    ctx.fillRect(
      Math.floor(engine.bullet.x - 1.5),
      Math.floor(engine.bullet.y),
      3,
      14
    );
    // Glow tip
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(
      Math.floor(engine.bullet.x - 0.5),
      Math.floor(engine.bullet.y),
      1,
      4
    );
  }

  private renderAlienBullets(engine: ArcadiansEngine) {
    const ctx = this.ctx;
    ctx.fillStyle = '#ff0055';
    for (const b of engine.alienBullets) {
      ctx.fillRect(Math.floor(b.x - 1.5), Math.floor(b.y), 3, 9);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(Math.floor(b.x - 0.5), Math.floor(b.y + 1), 1, 3);
      ctx.fillStyle = '#ff0055';
    }
  }

  private renderParticles(engine: ArcadiansEngine) {
    const ctx = this.ctx;
    for (const p of engine.particles) {
      ctx.fillStyle = p.color;
      const alpha = Math.max(0, 1 - p.life / p.maxLife);
      ctx.globalAlpha = alpha;
      ctx.fillRect(Math.floor(p.x), Math.floor(p.y), p.size, p.size);
    }
    ctx.globalAlpha = 1.0;
  }

  private renderFloatingTexts(engine: ArcadiansEngine) {
    const ctx = this.ctx;
    ctx.font = 'bold 12px monospace';
    ctx.textAlign = 'center';
    for (const ft of engine.floatingTexts) {
      ctx.fillStyle = ft.color;
      const alpha = Math.max(0, 1 - ft.life / ft.maxLife);
      ctx.globalAlpha = alpha;
      ctx.fillText(ft.text, Math.floor(ft.x), Math.floor(ft.y));
    }
    ctx.globalAlpha = 1.0;
  }

  /**
   * Authentic BBC Micro Header & Footer HUD
   */
  private renderHUD(engine: ArcadiansEngine) {
    const ctx = this.ctx;
    ctx.font = 'bold 13px monospace';

    // Top Header: 1UP Score, High Score, Wave
    ctx.textAlign = 'left';
    ctx.fillStyle = '#ff0033';
    ctx.fillText('1UP', 20, 24);
    ctx.fillStyle = '#ffffff';
    ctx.fillText(engine.score.toString().padStart(6, '0'), 20, 42);

    ctx.textAlign = 'center';
    ctx.fillStyle = '#ff0033';
    ctx.fillText('HIGH SCORE', CANVAS_WIDTH / 2, 24);
    ctx.fillStyle = '#ffffff';
    ctx.fillText(engine.highScore.toString().padStart(6, '0'), CANVAS_WIDTH / 2, 42);

    ctx.textAlign = 'right';
    ctx.fillStyle = '#00ffff';
    ctx.fillText('WAVE', CANVAS_WIDTH - 20, 24);
    ctx.fillStyle = '#ffff00';
    ctx.fillText(engine.waveNumber.toString().padStart(2, '0'), CANVAS_WIDTH - 20, 42);

    // Bottom Bar: Lives (Mini-ships) on bottom left, Wave Badges on bottom right
    const bottomY = CANVAS_HEIGHT - 12;

    // Remaining lives
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < Math.max(0, engine.lives); i++) {
      const shipX = 25 + i * 22;
      ctx.fillRect(shipX - 4, bottomY - 6, 8, 2);
      ctx.fillRect(shipX - 1, bottomY - 10, 2, 4);
    }

    // Wave badges on bottom right
    this.renderWaveBadges(ctx, engine.waveNumber);
  }

  private renderWaveBadges(ctx: CanvasRenderingContext2D, wave: number) {
    const baseX = CANVAS_WIDTH - 30;
    const y = CANVAS_HEIGHT - 14;

    // Display level flags / icons
    const count = Math.min(10, wave);
    for (let i = 0; i < count; i++) {
      const x = baseX - i * 16;
      ctx.fillStyle = i >= 5 ? '#ff0033' : '#00ffff';
      ctx.fillRect(x, y - 8, 3, 10);
      ctx.fillStyle = '#ffff00';
      ctx.fillRect(x + 3, y - 8, 6, 5);
    }
  }

  private renderOverlays(engine: ArcadiansEngine) {
    const ctx = this.ctx;

    if (engine.gameState === 'TITLE') {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      ctx.textAlign = 'center';
      ctx.fillStyle = '#ffff00';
      ctx.font = 'bold 36px monospace';
      ctx.fillText('ARCADIANS', CANVAS_WIDTH / 2, 230);

      ctx.fillStyle = '#00ffff';
      ctx.font = 'bold 14px monospace';
      ctx.fillText('ACORNSOFT • NICK PELLING 1982', CANVAS_WIDTH / 2, 260);
      ctx.fillText('BBC MICRO MODEL B & ELECTRON', CANVAS_WIDTH / 2, 280);

      // Scoring table
      ctx.fillStyle = '#ffffff';
      ctx.font = '12px monospace';
      ctx.fillText('═ POINT VALUES ═', CANVAS_WIDTH / 2, 330);

      ctx.fillStyle = '#00ff33';
      ctx.fillText('GREEN DRONE:      30 PTS / 60 DIVING', CANVAS_WIDTH / 2, 360);
      ctx.fillStyle = '#ff00ff';
      ctx.fillText('PURPLE EMISSARY:  40 PTS / 80 DIVING', CANVAS_WIDTH / 2, 385);
      ctx.fillStyle = '#ff0033';
      ctx.fillText('RED HORNET:       50 PTS / 100 DIVING', CANVAS_WIDTH / 2, 410);
      ctx.fillStyle = '#ffff00';
      ctx.fillText('FLAGSHIP (SOLO):  60 PTS / 150 DIVING', CANVAS_WIDTH / 2, 435);
      ctx.fillStyle = '#ffff00';
      ctx.fillText('FLAGSHIP + 2 ESCORTS: 800 BONUS PTS!', CANVAS_WIDTH / 2, 460);

      // Prompt
      if (Math.floor(Date.now() / 450) % 2 === 0) {
        ctx.fillStyle = '#00ff33';
        ctx.font = 'bold 16px monospace';
        ctx.fillText('PRESS FIRE OR TAP TO LAUNCH', CANVAS_WIDTH / 2, 530);
      }
    } else if (engine.gameState === 'WAVE_CLEAR') {
      ctx.textAlign = 'center';
      ctx.fillStyle = '#00ff33';
      ctx.font = 'bold 24px monospace';
      ctx.fillText('WAVE COMPLETED!', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 20);

      ctx.fillStyle = '#ffff00';
      ctx.font = 'bold 16px monospace';
      ctx.fillText(`PREPARING WAVE ${engine.waveNumber + 1}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 15);
    } else if (engine.gameState === 'GAME_OVER') {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      ctx.textAlign = 'center';
      ctx.fillStyle = '#ff0033';
      ctx.font = 'bold 36px monospace';
      ctx.fillText('GAME OVER', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 30);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 16px monospace';
      ctx.fillText(`FINAL SCORE: ${engine.score.toLocaleString()}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 10);
      ctx.fillText(`WAVE REACHED: ${engine.waveNumber}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 35);

      if (Math.floor(Date.now() / 450) % 2 === 0) {
        ctx.fillStyle = '#00ffff';
        ctx.font = 'bold 14px monospace';
        ctx.fillText('PRESS FIRE OR TAP TO RETRY', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 80);
      }
    } else if (engine.gameState === 'PAUSED') {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      ctx.textAlign = 'center';
      ctx.fillStyle = '#ffff00';
      ctx.font = 'bold 26px monospace';
      ctx.fillText('PAUSED', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
    }
  }

  /**
   * Authentic CRT scanline overlay
   */
  private renderCRTScanlines() {
    const ctx = this.ctx;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    for (let y = 0; y < CANVAS_HEIGHT; y += 4) {
      ctx.fillRect(0, y, CANVAS_WIDTH, 1.5);
    }
  }
}
