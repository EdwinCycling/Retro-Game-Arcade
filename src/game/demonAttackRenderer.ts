/**
 * Demon Attack Pixel-Art Canvas Renderer (1982, Imagic / Atari 2600)
 * Renders the lunar landscape of Krydos, animated winged demons with multiple frames,
 * splitting mini-demons, player laser cannon, glowing particle explosions,
 * and high-contrast retro arcade HUD.
 */

import { CANVAS_HEIGHT, CANVAS_WIDTH, DemonAttackEngine } from './demonAttackEngine';
import { Demon } from './demonAttackTypes';

export class DemonAttackRenderer {
  private ctx: CanvasRenderingContext2D;
  public enableCRT: boolean = true;

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
  }

  public render(engine: DemonAttackEngine) {
    const ctx = this.ctx;

    // Deep space backdrop
    ctx.fillStyle = '#05050c';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Render Starfield
    this.renderStars(engine);

    // Render Planet Krydos lunar surface (ground terrain)
    this.renderGround(engine);

    // Render Player Laser Missiles
    this.renderMissiles(engine);

    // Render Enemy Bombs
    this.renderBombs(engine);

    // Render Winged Demons
    for (const demon of engine.demons) {
      this.renderDemon(demon);
    }

    // Render Player Cannon
    if (engine.player.isAlive) {
      this.renderPlayer(engine);
    }

    // Render Explosion Particles
    this.renderParticles(engine);

    // Render Floating Score Texts
    this.renderFloatingTexts(engine);

    // Render HUD (Score, Bunkers/Lives, Wave/Level)
    this.renderHUD(engine);

    // Render Overlay States (Ready, Wave Clear, Game Over)
    this.renderOverlays(engine);

    // Optional CRT scanline & curvature effect
    if (this.enableCRT) {
      this.renderCRTOverlay();
    }
  }

  private renderStars(engine: DemonAttackEngine) {
    const ctx = this.ctx;
    for (const star of engine.stars) {
      ctx.fillStyle = `rgba(255, 255, 255, ${star.alpha})`;
      ctx.fillRect(Math.floor(star.x), Math.floor(star.y), star.size, star.size);
    }
  }

  private renderGround(engine: DemonAttackEngine) {
    const ctx = this.ctx;
    const groundY = CANVAS_HEIGHT - 28;
    const baseColor = engine.waveConfig.groundColor;

    // Jagged lunar surface
    ctx.fillStyle = baseColor;
    ctx.beginPath();
    ctx.moveTo(0, groundY);
    for (let x = 0; x <= CANVAS_WIDTH; x += 20) {
      const offset = (Math.sin(x * 0.05) * 3) + (Math.cos(x * 0.02) * 2);
      ctx.lineTo(x, groundY + offset);
    }
    ctx.lineTo(CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.lineTo(0, CANVAS_HEIGHT);
    ctx.closePath();
    ctx.fill();

    // Fluorescent highlight line on ground edge
    ctx.strokeStyle = engine.waveConfig.demonColor;
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  private renderPlayer(engine: DemonAttackEngine) {
    const ctx = this.ctx;
    const p = engine.player;

    // Blinking effect during respawn invulnerability
    if (p.respawnTimer > 0 && Math.floor(Date.now() / 80) % 2 === 0) {
      return;
    }

    // Authentic Imagic Laser Cannon styling
    const x = Math.floor(p.x);
    const y = Math.floor(p.y);

    // Base body (Cyan / Silver metallic)
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(x + 4, y + 10, 24, 8);

    // Side treads
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(x, y + 12, 6, 8);
    ctx.fillRect(x + 26, y + 12, 6, 8);

    // Upper cockpit
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(x + 10, y + 5, 12, 6);

    // Twin laser emitter tip
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(x + 14, y, 4, 6);
  }

  private renderMissiles(engine: DemonAttackEngine) {
    const ctx = this.ctx;
    ctx.fillStyle = '#38bdf8';
    ctx.shadowColor = '#00ffff';
    ctx.shadowBlur = 6;

    for (const m of engine.missiles) {
      ctx.fillRect(Math.floor(m.x), Math.floor(m.y), m.width, m.height);
      // Hot white core
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(Math.floor(m.x + 1), Math.floor(m.y + 2), m.width - 2, m.height - 4);
      ctx.fillStyle = '#38bdf8';
    }

    ctx.shadowBlur = 0;
  }

  private renderBombs(engine: DemonAttackEngine) {
    const ctx = this.ctx;
    for (const b of engine.bombs) {
      ctx.fillStyle = b.color;
      ctx.shadowColor = b.color;
      ctx.shadowBlur = 4;

      if (b.isGuided) {
        // Diamond shaped guided missile
        ctx.beginPath();
        ctx.moveTo(b.x + b.width / 2, b.y);
        ctx.lineTo(b.x + b.width, b.y + b.height / 2);
        ctx.lineTo(b.x + b.width / 2, b.y + b.height);
        ctx.lineTo(b.x, b.y + b.height / 2);
        ctx.closePath();
        ctx.fill();
      } else {
        // Vertical energy bolt
        ctx.fillRect(Math.floor(b.x), Math.floor(b.y), b.width, b.height);
      }
    }
    ctx.shadowBlur = 0;
  }

  /**
   * Renders the iconic winged Demon Attack creature
   * with flapping pixel-art wings and glowing eyes
   */
  private renderDemon(demon: Demon) {
    const ctx = this.ctx;
    const x = Math.floor(demon.x);
    const y = Math.floor(demon.y);
    const w = demon.width;
    const h = demon.height;
    const wing = demon.wingFrame; // 0, 1, 2, 3

    ctx.save();

    // If diving, apply slight rotation towards direction
    if (demon.isDiving) {
      ctx.translate(x + w / 2, y + h / 2);
      ctx.rotate((demon.vx > 0 ? 0.2 : -0.2));
      ctx.translate(-(x + w / 2), -(y + h / 2));
    }

    const color = demon.color;
    ctx.fillStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = demon.isSplitChild ? 4 : 8;

    if (demon.type === 'split_small') {
      // Smaller agile demon
      const wingYOffset = wing % 2 === 0 ? -2 : 2;

      // Body core
      ctx.fillRect(x + 8, y + 4, 10, 10);
      // Wings
      ctx.fillRect(x, y + 4 + wingYOffset, 8, 4);
      ctx.fillRect(x + 18, y + 4 + wingYOffset, 8, 4);
      // Bright Eye
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x + 11, y + 7, 4, 3);
    } else {
      // Full sized feathered Demon
      const wingOffsetY = [ -4, 0, 4, 0 ][wing];

      // Central Torso
      ctx.fillRect(x + 14, y + 6, 16, 16);

      // Crown / Crest
      ctx.fillRect(x + 18, y + 1, 8, 5);
      ctx.fillRect(x + 20, y - 2, 4, 4);

      // Wing flaps left
      ctx.fillRect(x + 2, y + 6 + wingOffsetY, 12, 6);
      ctx.fillRect(x - 2, y + 2 + wingOffsetY, 8, 6);

      // Wing flaps right
      ctx.fillRect(x + 30, y + 6 + wingOffsetY, 12, 6);
      ctx.fillRect(x + 38, y + 2 + wingOffsetY, 8, 6);

      // Demon Tail / Feathers
      ctx.fillRect(x + 17, y + 22, 10, 6);
      ctx.fillRect(x + 19, y + 28, 6, 4);

      // Piercing glowing Eyes
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x + 17, y + 10, 3, 3);
      ctx.fillRect(x + 24, y + 10, 3, 3);

      // Secondary contrasting highlight on wings
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(x + 4, y + 8 + wingOffsetY, 4, 2);
      ctx.fillRect(x + 36, y + 8 + wingOffsetY, 4, 2);
    }

    ctx.restore();
  }

  private renderParticles(engine: DemonAttackEngine) {
    const ctx = this.ctx;
    for (const p of engine.particles) {
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.alpha;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1.0;
  }

  private renderFloatingTexts(engine: DemonAttackEngine) {
    const ctx = this.ctx;
    ctx.font = '11px "Press Start 2P", monospace';
    ctx.textAlign = 'center';

    for (const ft of engine.floatingTexts) {
      ctx.fillStyle = ft.color;
      ctx.globalAlpha = ft.alpha;
      ctx.fillText(ft.text, ft.x, ft.y);
    }
    ctx.globalAlpha = 1.0;
  }

  private renderHUD(engine: DemonAttackEngine) {
    const ctx = this.ctx;
    ctx.font = '12px "Press Start 2P", monospace';
    ctx.textBaseline = 'top';

    // Top Left: Score (authentic Imagic top-left score display)
    ctx.fillStyle = '#e2e8f0';
    ctx.textAlign = 'left';
    ctx.fillText(engine.score.toString().padStart(5, '0'), 18, 14);

    // Top Center: IMAGIC DEMON ATTACK label
    ctx.fillStyle = '#94a3b8';
    ctx.textAlign = 'center';
    ctx.font = '8px "Press Start 2P", monospace';
    ctx.fillText('DEMON ATTACK', CANVAS_WIDTH / 2, 8);

    // Top Right: WAVE / LEVEL
    ctx.fillStyle = engine.waveConfig.demonColor;
    ctx.textAlign = 'right';
    ctx.font = '12px "Press Start 2P", monospace';
    ctx.fillText(`WAVE ${engine.wave.toString().padStart(2, '0')}`, CANVAS_WIDTH - 18, 14);

    // Bottom Left: Bunkers (Lives) - Little Laser Cannon icons
    const bunkerY = CANVAS_HEIGHT - 18;
    for (let i = 0; i < engine.lives; i++) {
      const bx = 18 + i * 18;
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(bx, bunkerY + 4, 12, 5);
      ctx.fillRect(bx + 4, bunkerY, 4, 4);
    }
    ctx.fillStyle = '#64748b';
    ctx.font = '8px "Press Start 2P", monospace';
    ctx.textAlign = 'left';
    ctx.fillText('BUNKERS', 18 + Math.max(1, engine.lives) * 18 + 6, bunkerY + 2);
  }

  private renderOverlays(engine: DemonAttackEngine) {
    const ctx = this.ctx;

    if (engine.gameState === 'READY') {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      ctx.textAlign = 'center';
      ctx.font = '18px "Press Start 2P", monospace';
      ctx.fillStyle = '#f43f5e';
      ctx.fillText('DEMON ATTACK', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 60);

      ctx.font = '9px "Press Start 2P", monospace';
      ctx.fillStyle = '#cbd5e1';
      ctx.fillText('IMAGIC • 1982', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 30);

      ctx.fillStyle = '#facc15';
      ctx.font = '11px "Press Start 2P", monospace';
      ctx.fillText(`WAVE ${engine.wave}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 10);

      ctx.font = '9px "Press Start 2P", monospace';
      ctx.fillStyle = '#ffffff';
      ctx.fillText('DRUK SPATIE OF VUUR', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 50);
      ctx.fillText('OM TE BEGINNEN', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 70);
    } else if (engine.gameState === 'WAVE_TRANSITION') {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      ctx.textAlign = 'center';
      ctx.font = '14px "Press Start 2P", monospace';
      ctx.fillStyle = '#4ade80';
      ctx.fillText(`WAVE ${engine.wave - 1} OVERWONNEN!`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 20);

      ctx.fillStyle = '#facc15';
      ctx.font = '10px "Press Start 2P", monospace';
      ctx.fillText(`VOLGENDE WAVE: ${engine.wave}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 15);
    }
  }

  private renderCRTOverlay() {
    const ctx = this.ctx;
    // Scanlines
    ctx.fillStyle = 'rgba(0, 0, 0, 0.18)';
    for (let y = 0; y < CANVAS_HEIGHT; y += 3) {
      ctx.fillRect(0, y, CANVAS_WIDTH, 1);
    }

    // Subtle edge vignette
    const grad = ctx.createRadialGradient(
      CANVAS_WIDTH / 2,
      CANVAS_HEIGHT / 2,
      CANVAS_WIDTH * 0.4,
      CANVAS_WIDTH / 2,
      CANVAS_HEIGHT / 2,
      CANVAS_WIDTH * 0.75
    );
    grad.addColorStop(0, 'rgba(0,0,0,0)');
    grad.addColorStop(1, 'rgba(0,0,0,0.4)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  }
}
