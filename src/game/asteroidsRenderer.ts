/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Atari Asteroids (1979) Vector (QuadraScan) CRT Canvas Renderer
 */

import { AsteroidsEngine, Asteroid, Saucer, Ship, Bullet, Particle } from './asteroidsEngine';

export class AsteroidsRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const context = canvas.getContext('2d', { alpha: false });
    if (!context) throw new Error('Could not get 2D canvas context');
    this.ctx = context;
  }

  public render(engine: AsteroidsEngine) {
    const { ctx, canvas } = this;
    const w = canvas.width;
    const h = canvas.height;

    // Color definitions based on phosphor selection
    const colorScheme = this.getColorScheme(engine.settings.phosphorColor);

    // Fade effect for vector beam persistence trails
    if (engine.settings.vectorTrails) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
      ctx.fillRect(0, 0, w, h);
    } else {
      ctx.fillStyle = '#050505';
      ctx.fillRect(0, 0, w, h);
    }

    // Set vector line styles
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Apply glow effect
    ctx.shadowBlur = 8 * engine.settings.beamGlowIntensity;
    ctx.shadowColor = colorScheme.glow;

    // 1. Render Asteroids
    for (const ast of engine.asteroids) {
      this.drawAsteroid(ast, colorScheme.primary);
    }

    // 2. Render Bullets
    for (const b of engine.bullets) {
      this.drawBullet(b, colorScheme.bullet);
    }

    // 3. Render Saucer
    if (engine.saucer) {
      this.drawSaucer(engine.saucer, colorScheme.saucer);
    }

    // 4. Render Player Ship
    if (!engine.ship.isDead && !engine.ship.isRespawning) {
      // If invulnerable, flash vector
      if (engine.ship.invulnerableTimer <= 0 || Math.floor(Date.now() / 80) % 2 === 0) {
        this.drawShip(engine.ship, engine.settings.shieldsActive, colorScheme.primary);
      }
    }

    // 5. Render Explosion / Shard Particles
    for (const p of engine.particles) {
      this.drawParticle(p, colorScheme.primary);
    }

    // 6. Reset Shadow for clean UI text and HUD
    ctx.shadowBlur = 4 * engine.settings.beamGlowIntensity;
    ctx.shadowColor = colorScheme.glow;

    // 7. Render Score & High Score HUD
    this.drawHUD(engine, colorScheme.primary);

    // 8. Render Game Over / Pause Overlay
    if (engine.isGameOver) {
      this.drawGameOver(engine, colorScheme);
    } else if (engine.isPaused) {
      this.drawPauseOverlay(colorScheme);
    }
  }

  private getColorScheme(color: 'white' | 'green' | 'amber' | 'cyan') {
    switch (color) {
      case 'green':
        return {
          primary: '#22c55e',
          glow: '#16a34a',
          saucer: '#4ade80',
          bullet: '#86efac',
        };
      case 'amber':
        return {
          primary: '#f59e0b',
          glow: '#d97706',
          saucer: '#fbbf24',
          bullet: '#fde68a',
        };
      case 'cyan':
        return {
          primary: '#06b6d4',
          glow: '#0891b2',
          saucer: '#22d3ee',
          bullet: '#a5f3fc',
        };
      case 'white':
      default:
        return {
          primary: '#e6edf3',
          glow: '#93c5fd',
          saucer: '#f1f5f9',
          bullet: '#ffffff',
        };
    }
  }

  private drawShip(ship: Ship, hasShields: boolean, color: string) {
    const { ctx } = this;
    ctx.save();
    ctx.translate(ship.x, ship.y);
    ctx.rotate(ship.angle + Math.PI / 2); // default ship drawing points up

    ctx.strokeStyle = color;
    ctx.lineWidth = 2.0;

    // Iconic Asteroids Triangular Arrow Ship
    ctx.beginPath();
    ctx.moveTo(0, -16); // Nose
    ctx.lineTo(11, 14);  // Right wing
    ctx.lineTo(6, 9);    // Inner notch
    ctx.lineTo(-6, 9);   // Inner notch
    ctx.lineTo(-11, 14); // Left wing
    ctx.closePath();
    ctx.stroke();

    // Thrust Flame Vector
    if (ship.isThrusting && Math.floor(Date.now() / 50) % 2 === 0) {
      ctx.beginPath();
      ctx.moveTo(-4, 10);
      ctx.lineTo(0, 19 + Math.random() * 4);
      ctx.lineTo(4, 10);
      ctx.stroke();
    }

    // Force Field Shield Vector Bubble
    if (hasShields) {
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(0, 0, 20, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.restore();
  }

  private drawAsteroid(ast: Asteroid, color: string) {
    const { ctx } = this;
    ctx.save();
    ctx.translate(ast.x, ast.y);
    ctx.rotate(ast.angle);

    ctx.strokeStyle = color;
    ctx.lineWidth = 2.0;

    ctx.beginPath();
    if (ast.vertices.length > 0) {
      ctx.moveTo(ast.vertices[0].x, ast.vertices[0].y);
      for (let i = 1; i < ast.vertices.length; i++) {
        ctx.lineTo(ast.vertices[i].x, ast.vertices[i].y);
      }
      ctx.closePath();
    }
    ctx.stroke();

    ctx.restore();
  }

  private drawSaucer(saucer: Saucer, color: string) {
    const { ctx } = this;
    const scale = saucer.isSmall ? 0.65 : 1.1;

    ctx.save();
    ctx.translate(saucer.x, saucer.y);
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.8;

    // QuadraScan Vector Saucer Hull
    ctx.beginPath();
    // Bottom base line
    ctx.moveTo(-18 * scale, 4 * scale);
    ctx.lineTo(18 * scale, 4 * scale);
    // Lower hull
    ctx.lineTo(9 * scale, 10 * scale);
    ctx.lineTo(-9 * scale, 10 * scale);
    ctx.closePath();
    ctx.stroke();

    // Upper canopy
    ctx.beginPath();
    ctx.moveTo(-18 * scale, 4 * scale);
    ctx.lineTo(-8 * scale, -4 * scale);
    ctx.lineTo(8 * scale, -4 * scale);
    ctx.lineTo(18 * scale, 4 * scale);
    ctx.stroke();

    // Top dome
    ctx.beginPath();
    ctx.moveTo(-8 * scale, -4 * scale);
    ctx.lineTo(-4 * scale, -10 * scale);
    ctx.lineTo(4 * scale, -10 * scale);
    ctx.lineTo(8 * scale, -4 * scale);
    ctx.stroke();

    ctx.restore();
  }

  private drawBullet(b: Bullet, color: string) {
    const { ctx } = this;
    ctx.save();
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.isSaucerBullet ? 2.5 : 2.0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  private drawParticle(p: Particle, color: string) {
    const { ctx } = this;
    ctx.save();
    const alpha = Math.max(0, p.life / p.maxLife);
    ctx.strokeStyle = color;
    ctx.globalAlpha = alpha;
    ctx.lineWidth = 1.5;

    ctx.beginPath();
    const hx = Math.cos(p.angle) * (p.length / 2);
    const hy = Math.sin(p.angle) * (p.length / 2);
    ctx.moveTo(p.x - hx, p.y - hy);
    ctx.lineTo(p.x + hx, p.y + hy);
    ctx.stroke();

    ctx.restore();
  }

  private drawHUD(engine: AsteroidsEngine, color: string) {
    const { ctx } = this;
    ctx.save();
    ctx.fillStyle = color;
    ctx.strokeStyle = color;
    ctx.font = '22px "Courier New", Courier, monospace';
    ctx.textBaseline = 'top';

    // 1. Current Score (Left)
    const scoreStr = engine.score.toString().padStart(2, '0');
    ctx.fillText(scoreStr, 30, 24);

    // 2. High Score (Center)
    const highScoreStr = Math.max(engine.score, engine.highScore).toString().padStart(2, '0');
    ctx.textAlign = 'center';
    ctx.fillText(highScoreStr, engine.width / 2, 24);

    // 3. Wave Number (Right)
    ctx.textAlign = 'right';
    ctx.font = '14px "Courier New", Courier, monospace';
    ctx.fillText(`WAVE ${engine.wave}`, engine.width - 30, 24);

    // 4. Lives Icons (Mini Ships below score)
    const livesToShow = Math.min(engine.lives, 8);
    for (let i = 0; i < livesToShow; i++) {
      const lx = 34 + i * 16;
      const ly = 58;

      ctx.save();
      ctx.translate(lx, ly);
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, -9);
      ctx.lineTo(6, 8);
      ctx.lineTo(3, 5);
      ctx.lineTo(-3, 5);
      ctx.lineTo(-6, 8);
      ctx.closePath();
      ctx.stroke();
      ctx.restore();
    }

    ctx.restore();
  }

  private drawGameOver(engine: AsteroidsEngine, scheme: ReturnType<typeof this.getColorScheme>) {
    const { ctx } = this;
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.fillStyle = scheme.primary;
    ctx.font = 'bold 36px "Courier New", Courier, monospace';
    ctx.fillText('GAME OVER', engine.width / 2, engine.height / 2 - 20);

    ctx.font = '16px "Courier New", Courier, monospace';
    ctx.fillText('PRESS FIRE OR 1 TO PLAY AGAIN', engine.width / 2, engine.height / 2 + 25);

    ctx.restore();
  }

  private drawPauseOverlay(scheme: ReturnType<typeof this.getColorScheme>) {
    const { ctx, canvas } = this;
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = scheme.primary;
    ctx.font = 'bold 32px "Courier New", Courier, monospace';
    ctx.fillText('PAUSED', canvas.width / 2, canvas.height / 2);
    ctx.restore();
  }
}
