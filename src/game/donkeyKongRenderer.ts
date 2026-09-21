/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Donkey Kong (1981 Nintendo Arcade) - Authentic Pixel-Art Canvas Renderer
 */

import { DonkeyKongEngine, VIRTUAL_WIDTH, VIRTUAL_HEIGHT } from './donkeyKongEngine';

export class DonkeyKongRenderer {
  public render(ctx: CanvasRenderingContext2D, engine: DonkeyKongEngine, isCrtEnabled: boolean = true) {
    // Clear background
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, VIRTUAL_WIDTH, VIRTUAL_HEIGHT);

    // 1. Draw "HOW HIGH CAN YOU GET?" Intro screen
    if (engine.gameState === 'how_high_screen') {
      this.drawHowHighScreen(ctx, engine);
      return;
    }

    // 2. Draw Arcade HUD
    this.drawHUD(ctx, engine);

    // 3. Draw Stage Platforms & Girders
    this.drawGirders(ctx, engine);

    // 4. Draw Ladders
    this.drawLadders(ctx, engine);

    // 5. Draw Oil Drum
    if (engine.stage === '25m' || engine.stage === '50m') {
      this.drawOilDrum(ctx, engine);
    }

    // 6. Draw Elevators (75m)
    if (engine.stage === '75m') {
      this.drawElevators(ctx, engine);
    }

    // 7. Draw Rivets (100m)
    if (engine.stage === '100m') {
      this.drawRivets(ctx, engine);
    }

    // 8. Draw Bonus Items & Hammers
    this.drawHammers(ctx, engine);
    this.drawBonusItems(ctx, engine);

    // 9. Draw Enemies (Barrels, Fireballs, Cement Pies, Springs)
    this.drawBarrels(ctx, engine);
    this.drawCementPies(ctx, engine);
    this.drawSprings(ctx, engine);
    this.drawFireballs(ctx, engine);

    // 10. Draw Pauline
    this.drawPauline(ctx, engine);

    // 11. Draw Donkey Kong
    this.drawDonkeyKong(ctx, engine);

    // 12. Draw Mario (Jumpman)
    this.drawMario(ctx, engine);

    // 13. Draw Score Popups
    this.drawScorePopups(ctx, engine);

    // 14. Level Clear Heart / Game Over Overlays
    if (engine.gameState === 'level_clear') {
      this.drawLevelClearHeart(ctx, engine);
    } else if (engine.gameState === 'game_over') {
      this.drawGameOver(ctx);
    }

    // 15. Optional CRT scanline / bloom overlay
    if (isCrtEnabled) {
      this.drawCRTOverlay(ctx);
    }
  }

  private drawHowHighScreen(ctx: CanvasRenderingContext2D, engine: DonkeyKongEngine) {
    ctx.fillStyle = '#ffffff';
    ctx.font = '8px "Press Start 2P", monospace';
    ctx.textAlign = 'center';

    ctx.fillText('HOW HIGH CAN YOU GET ?', VIRTUAL_WIDTH / 2, 80);

    ctx.fillStyle = '#f43f5e';
    ctx.font = '12px "Press Start 2P", monospace';
    ctx.fillText(engine.stage.toUpperCase(), VIRTUAL_WIDTH / 2, 110);

    // Little DK & Pauline icons
    ctx.fillStyle = '#eab308';
    ctx.font = '8px "Press Start 2P", monospace';
    ctx.fillText(`ROUND ${engine.levelCycle}`, VIRTUAL_WIDTH / 2, 150);
    ctx.fillText(`BONUS - ${engine.bonusTimer}`, VIRTUAL_WIDTH / 2, 180);
  }

  private drawHUD(ctx: CanvasRenderingContext2D, engine: DonkeyKongEngine) {
    ctx.font = '7px "Press Start 2P", monospace';
    ctx.textAlign = 'left';

    // 1UP & SCORE
    ctx.fillStyle = '#f43f5e';
    ctx.fillText('1UP', 16, 10);
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`${engine.score.toString().padStart(6, '0')}`, 16, 18);

    // HIGH SCORE
    ctx.fillStyle = '#38bdf8';
    ctx.textAlign = 'center';
    ctx.fillText('HIGH SCORE', VIRTUAL_WIDTH / 2, 10);
    ctx.fillStyle = '#ffffff';
    ctx.fillText('087400', VIRTUAL_WIDTH / 2, 18);

    // BONUS TIMER
    ctx.fillStyle = '#fb923c';
    ctx.textAlign = 'right';
    ctx.fillText('BONUS', VIRTUAL_WIDTH - 16, 10);
    ctx.fillStyle = '#38bdf8';
    ctx.fillText(`${engine.bonusTimer}`, VIRTUAL_WIDTH - 16, 18);

    // Level indicator
    ctx.fillStyle = '#38bdf8';
    ctx.fillText(`L=${engine.levelCycle.toString().padStart(2, '0')}`, VIRTUAL_WIDTH - 16, 26);

    // Mario Lives (Mini hats/heads)
    for (let i = 0; i < engine.lives - 1; i++) {
      const lx = 16 + i * 10;
      const ly = 22;
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(lx, ly, 6, 3);
      ctx.fillStyle = '#3b82f6';
      ctx.fillRect(lx + 1, ly + 3, 4, 3);
    }
  }

  private drawGirders(ctx: CanvasRenderingContext2D, engine: DonkeyKongEngine) {
    const girderColor = engine.stage === '100m' ? '#3b82f6' : '#f43f5e'; // blue girders in 100m, red/pink in 25m/50m/75m
    const trussColor = engine.stage === '100m' ? '#60a5fa' : '#fda4af';

    for (const p of engine.platforms) {
      ctx.strokeStyle = girderColor;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(p.x1, p.y1);
      ctx.lineTo(p.x2, p.y2);
      ctx.stroke();

      // Girder cross-truss lattice
      ctx.strokeStyle = trussColor;
      ctx.lineWidth = 1;
      const steps = Math.floor((p.x2 - p.x1) / 8);
      for (let i = 0; i < steps; i++) {
        const sx = p.x1 + i * 8;
        const ex = sx + 8;
        const r1 = (sx - p.x1) / (p.x2 - p.x1 || 1);
        const r2 = (ex - p.x1) / (p.x2 - p.x1 || 1);
        const sy = p.y1 + r1 * (p.y2 - p.y1);
        const ey = p.y1 + r2 * (p.y2 - p.y1);

        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(ex, ey + 4);
        ctx.moveTo(ex, sy);
        ctx.lineTo(sx, ey + 4);
        ctx.stroke();
      }
    }
  }

  private drawLadders(ctx: CanvasRenderingContext2D, engine: DonkeyKongEngine) {
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1;

    for (const l of engine.ladders) {
      const top = l.topY;
      const bottom = l.broken ? l.topY + (l.bottomY - l.topY) * 0.45 : l.bottomY;

      // Left and right rails
      ctx.beginPath();
      ctx.moveTo(l.x - 4, top);
      ctx.lineTo(l.x - 4, bottom);
      ctx.moveTo(l.x + 4, top);
      ctx.lineTo(l.x + 4, bottom);
      ctx.stroke();

      // Rungs
      const rungs = Math.floor((bottom - top) / 4);
      for (let r = 0; r <= rungs; r++) {
        const ry = top + r * 4;
        ctx.beginPath();
        ctx.moveTo(l.x - 4, ry);
        ctx.lineTo(l.x + 4, ry);
        ctx.stroke();
      }

      // If broken, draw lower detached segment
      if (l.broken) {
        const brokenBottom = l.bottomY;
        const brokenTop = l.bottomY - (l.bottomY - l.topY) * 0.35;
        ctx.beginPath();
        ctx.moveTo(l.x - 4, brokenTop);
        ctx.lineTo(l.x - 4, brokenBottom);
        ctx.moveTo(l.x + 4, brokenTop);
        ctx.lineTo(l.x + 4, brokenBottom);
        ctx.stroke();

        const lowerRungs = Math.floor((brokenBottom - brokenTop) / 4);
        for (let r = 0; r <= lowerRungs; r++) {
          const ry = brokenTop + r * 4;
          ctx.beginPath();
          ctx.moveTo(l.x - 4, ry);
          ctx.lineTo(l.x + 4, ry);
          ctx.stroke();
        }
      }
    }
  }

  private drawOilDrum(ctx: CanvasRenderingContext2D, engine: DonkeyKongEngine) {
    const o = engine.oilDrum;
    ctx.fillStyle = '#2563eb';
    ctx.fillRect(o.x - 8, o.y - 12, 16, 12);
    ctx.fillStyle = '#ffffff';
    ctx.font = '5px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('OIL', o.x, o.y - 4);

    if (o.flaming) {
      const fFrame = Math.floor(engine.gameTimer / 6) % 2;
      ctx.fillStyle = fFrame === 0 ? '#f97316' : '#eab308';
      ctx.beginPath();
      ctx.moveTo(o.x - 6, o.y - 12);
      ctx.lineTo(o.x, o.y - 19 - fFrame * 3);
      ctx.lineTo(o.x + 6, o.y - 12);
      ctx.fill();
    }
  }

  private drawElevators(ctx: CanvasRenderingContext2D, engine: DonkeyKongEngine) {
    for (const e of engine.elevators) {
      // Platform plate
      ctx.fillStyle = '#f97316';
      ctx.fillRect(e.x - 12, e.y - 2, 24, 4);
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(e.x - 10, e.y - 1, 20, 2);

      // Cable guide wire
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(e.x, e.minY);
      ctx.lineTo(e.x, e.maxY);
      ctx.stroke();
    }
  }

  private drawRivets(ctx: CanvasRenderingContext2D, engine: DonkeyKongEngine) {
    for (const r of engine.rivets) {
      if (!r.removed) {
        ctx.fillStyle = '#eab308';
        ctx.beginPath();
        ctx.arc(r.x, r.y - 1, 3.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(r.x - 1, r.y - 2, 2, 2);
      } else {
        // Empty rivet gap (hole)
        ctx.fillStyle = '#000000';
        ctx.fillRect(r.x - 4, r.y - 4, 8, 6);
      }
    }
  }

  private drawHammers(ctx: CanvasRenderingContext2D, engine: DonkeyKongEngine) {
    for (const h of engine.hammers) {
      if (!h.collected) {
        // Hammer handle
        ctx.fillStyle = '#a16207';
        ctx.fillRect(h.x - 1, h.y - 6, 2, 10);
        // Hammer head
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(h.x - 5, h.y - 9, 10, 5);
        ctx.fillStyle = '#cbd5e1';
        ctx.fillRect(h.x - 4, h.y - 8, 8, 2);
      }
    }
  }

  private drawBonusItems(ctx: CanvasRenderingContext2D, engine: DonkeyKongEngine) {
    for (const b of engine.bonusItems) {
      if (!b.collected) {
        if (b.type === 'umbrella') {
          ctx.fillStyle = '#f43f5e';
          ctx.beginPath();
          ctx.arc(b.x, b.y - 4, 6, Math.PI, 0);
          ctx.fill();
          ctx.fillStyle = '#cbd5e1';
          ctx.fillRect(b.x - 1, b.y - 4, 2, 7);
        } else if (b.type === 'purse') {
          ctx.fillStyle = '#eab308';
          ctx.fillRect(b.x - 4, b.y - 6, 8, 7);
          ctx.fillStyle = '#f59e0b';
          ctx.fillRect(b.x - 2, b.y - 8, 4, 2);
        } else if (b.type === 'hat') {
          ctx.fillStyle = '#ec4899';
          ctx.fillRect(b.x - 6, b.y - 2, 12, 2);
          ctx.fillRect(b.x - 3, b.y - 6, 6, 4);
        }
      }
    }
  }

  private drawBarrels(ctx: CanvasRenderingContext2D, engine: DonkeyKongEngine) {
    for (const b of engine.barrels) {
      const color = b.isBlue ? '#38bdf8' : '#b45309';
      const rim = b.isBlue ? '#bae6fd' : '#f59e0b';

      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(b.x, b.y - 5, 5, 0, Math.PI * 2);
      ctx.fill();

      // Rolling spoke animation
      ctx.strokeStyle = rim;
      ctx.lineWidth = 1;
      const angle = (b.animFrame * 0.2) * b.rollingDir;
      ctx.beginPath();
      ctx.moveTo(b.x - Math.cos(angle) * 4, b.y - 5 - Math.sin(angle) * 4);
      ctx.lineTo(b.x + Math.cos(angle) * 4, b.y - 5 + Math.sin(angle) * 4);
      ctx.stroke();
    }
  }

  private drawCementPies(ctx: CanvasRenderingContext2D, engine: DonkeyKongEngine) {
    for (const p of engine.cementPies) {
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(p.x - 5, p.y - 4, 10, 4);
      ctx.fillStyle = '#bae6fd';
      ctx.fillRect(p.x - 3, p.y - 6, 6, 2);
    }
  }

  private drawSprings(ctx: CanvasRenderingContext2D, engine: DonkeyKongEngine) {
    for (const s of engine.springs) {
      ctx.strokeStyle = '#eab308';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(s.x, s.y - 4, 4, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  private drawFireballs(ctx: CanvasRenderingContext2D, engine: DonkeyKongEngine) {
    for (const f of engine.fireballs) {
      const fToggle = Math.floor(f.animFrame / 6) % 2;
      ctx.fillStyle = f.color;
      ctx.beginPath();
      ctx.arc(f.x, f.y - 6, 5, 0, Math.PI * 2);
      ctx.fill();

      // Sparkle flame tips
      ctx.fillStyle = '#fde047';
      ctx.fillRect(f.x - 2, f.y - 12 + fToggle * 2, 4, 4);

      // Eye
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(f.x + (f.vx > 0 ? 1 : -3), f.y - 7, 2, 2);
    }
  }

  private drawPauline(ctx: CanvasRenderingContext2D, engine: DonkeyKongEngine) {
    const px = engine.paulineX;
    const py = engine.paulineY;

    // Pink Dress
    ctx.fillStyle = '#f43f5e';
    ctx.fillRect(px - 3, py - 9, 6, 9);
    // Blond hair & Face
    ctx.fillStyle = '#fde047';
    ctx.fillRect(px - 4, py - 15, 8, 4);
    ctx.fillStyle = '#fed7aa';
    ctx.fillRect(px - 2, py - 13, 4, 4);

    // "HELP!" Speech bubble
    if (engine.paulineState === 'help') {
      const bubbleFrame = Math.floor(engine.gameTimer / 30) % 2;
      if (bubbleFrame === 0) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(px + 8, py - 18, 28, 10);
        ctx.fillStyle = '#000000';
        ctx.font = '5px "Press Start 2P", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('HELP!', px + 22, py - 11);
      }
    }
  }

  private drawDonkeyKong(ctx: CanvasRenderingContext2D, engine: DonkeyKongEngine) {
    const x = engine.dkX;
    const y = engine.stage === '100m' && engine.gameState === 'level_clear' ? engine.dkFallY : engine.dkY;

    ctx.save();
    ctx.translate(x, y);

    // If defeat fall on 100m: upside down!
    if (engine.dkAction === 'defeat_fall') {
      ctx.rotate(Math.PI);
      // Dizzyness stars
      const starPhase = engine.gameTimer * 0.1;
      ctx.fillStyle = '#eab308';
      ctx.fillText('★', Math.cos(starPhase) * 16, Math.sin(starPhase) * 16);
      ctx.fillText('★', -Math.cos(starPhase) * 16, -Math.sin(starPhase) * 16);
    }

    // Body (dark brown)
    ctx.fillStyle = '#78350f';
    ctx.fillRect(-12, -22, 24, 22);

    // Chest & Mouth (Beige)
    ctx.fillStyle = '#fed7aa';
    ctx.fillRect(-6, -14, 12, 12);
    ctx.fillRect(-5, -20, 10, 5);

    // Teeth & Eyes
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-3, -19, 2, 2);
    ctx.fillRect(1, -19, 2, 2);

    // Arms animated (Chest Thumping)
    const armUp = engine.dkAnimFrame % 2 === 0;
    ctx.fillStyle = '#78350f';
    if (armUp) {
      ctx.fillRect(-16, -24, 5, 12); // Left arm raised
      ctx.fillRect(11, -16, 5, 12);
    } else {
      ctx.fillRect(-16, -16, 5, 12);
      ctx.fillRect(11, -24, 5, 12); // Right arm raised
    }

    ctx.restore();
  }

  private drawMario(ctx: CanvasRenderingContext2D, engine: DonkeyKongEngine) {
    if (engine.gameState === 'mario_dead') {
      // Spinning death animation
      ctx.save();
      ctx.translate(engine.px, engine.py - 6);
      ctx.rotate(engine.deathTimer * 0.15);
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(-4, -6, 8, 12);
      ctx.restore();
      return;
    }

    ctx.save();
    ctx.translate(engine.px, engine.py);
    if (engine.facing === 'left') {
      ctx.scale(-1, 1);
    }

    // Red Hat & Overalls, Blue Shirt & Pants (Classic 1981 colors)
    const cRed = '#ef4444';
    const cBlue = '#2563eb';
    const cSkin = '#fed7aa';

    if (engine.isClimbing) {
      // Climbing pose (back facing)
      ctx.fillStyle = cRed;
      ctx.fillRect(-3, -13, 6, 4); // Hat back
      ctx.fillStyle = cBlue;
      ctx.fillRect(-4, -9, 8, 6);
      ctx.fillStyle = cRed;
      ctx.fillRect(-4, -3, 3, 4);
      ctx.fillRect(1, -3, 3, 4);
    } else if (engine.isHammerActive) {
      // Mario with swinging Hammer
      ctx.fillStyle = cRed;
      ctx.fillRect(-2, -15, 6, 4);
      ctx.fillStyle = cSkin;
      ctx.fillRect(-1, -11, 4, 3);
      ctx.fillStyle = cBlue;
      ctx.fillRect(-3, -8, 6, 5);
      ctx.fillStyle = cRed;
      ctx.fillRect(-3, -3, 6, 4);

      // Hammer above or smashed down
      if (engine.hammerPhase === 'up') {
        ctx.fillStyle = '#a16207';
        ctx.fillRect(1, -24, 2, 12); // Handle
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(-4, -28, 12, 6); // Hammer head
      } else {
        ctx.fillStyle = '#a16207';
        ctx.fillRect(4, -8, 10, 2); // Handle forward
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(12, -12, 6, 10); // Hammer head down
      }
    } else if (engine.isJumping) {
      // Jump pose
      ctx.fillStyle = cRed;
      ctx.fillRect(-2, -15, 6, 4);
      ctx.fillStyle = cSkin;
      ctx.fillRect(-1, -11, 4, 3);
      ctx.fillStyle = cBlue;
      ctx.fillRect(-3, -8, 7, 5);
      ctx.fillStyle = cRed;
      ctx.fillRect(-5, -4, 4, 4);
      ctx.fillRect(2, -4, 4, 4);
    } else {
      // Running / Idle
      const runCycle = Math.floor(engine.animFrame / 4) % 2;
      ctx.fillStyle = cRed;
      ctx.fillRect(-2, -15, 6, 4); // Hat
      ctx.fillStyle = cSkin;
      ctx.fillRect(0, -11, 4, 3); // Face
      ctx.fillStyle = '#1e1b4b';
      ctx.fillRect(2, -11, 2, 2); // Moustache
      ctx.fillStyle = cBlue;
      ctx.fillRect(-3, -8, 6, 5); // Overalls
      ctx.fillStyle = cRed;
      if (runCycle === 0 || !engine.isGrounded) {
        ctx.fillRect(-3, -3, 3, 4);
        ctx.fillRect(1, -3, 3, 4);
      } else {
        ctx.fillRect(-5, -3, 4, 4);
        ctx.fillRect(2, -3, 4, 4);
      }
    }

    ctx.restore();
  }

  private drawScorePopups(ctx: CanvasRenderingContext2D, engine: DonkeyKongEngine) {
    for (const p of engine.scorePopups) {
      ctx.fillStyle = p.color;
      ctx.font = '6px "Press Start 2P", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(p.text, p.x, p.y);
    }
  }

  private drawLevelClearHeart(ctx: CanvasRenderingContext2D, engine: DonkeyKongEngine) {
    const hx = 94;
    const hy = 20;

    ctx.fillStyle = engine.heartAnimFrame === 0 ? '#f43f5e' : '#ec4899';
    ctx.font = '10px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('♥', hx, hy);
  }

  private drawGameOver(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = '#ef4444';
    ctx.font = '10px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', VIRTUAL_WIDTH / 2, VIRTUAL_HEIGHT / 2);
  }

  private drawCRTOverlay(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.12)';
    for (let y = 0; y < VIRTUAL_HEIGHT; y += 2) {
      ctx.fillRect(0, y, VIRTUAL_WIDTH, 1);
    }
  }
}

export const donkeyKongRenderer = new DonkeyKongRenderer();
