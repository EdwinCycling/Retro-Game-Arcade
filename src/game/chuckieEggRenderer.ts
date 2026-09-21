/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Chuckie Egg BBC Micro Mode 1 Pixel Renderer
 */

import { ChuckieEggEngine } from './chuckieEggEngine';
import { CANVAS_HEIGHT, CANVAS_WIDTH } from './chuckieEggLevels';

export class ChuckieEggRenderer {
  private ctx: CanvasRenderingContext2D;
  public enableCRT: boolean = true;

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
  }

  public render(engine: ChuckieEggEngine) {
    const ctx = this.ctx;

    // Clear Screen (BBC Micro black background)
    ctx.fillStyle = '#08080c';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Render HUD (BBC Micro Mode 1 styled header)
    this.renderHUD(engine);

    // Render Platforms
    this.renderPlatforms(engine);

    // Render Ladders
    this.renderLadders(engine);

    // Render Lifts
    this.renderLifts(engine);

    // Render Items: Grains & Eggs
    this.renderItems(engine);

    // Render Ducks
    this.renderDucks(engine);

    // Render Giant Duck & Cage
    this.renderGiantDuckAndCage(engine);

    // Render Hen-House Harry
    this.renderHarry(engine);

    // Render Game State Overlays (Title, Game Over, Level Clear)
    this.renderOverlays(engine);

    // Render CRT Scanline Filter if enabled
    if (this.enableCRT) {
      this.renderCRTOverlay();
    }
  }

  private renderHUD(engine: ChuckieEggEngine) {
    const ctx = this.ctx;

    // Top status strip
    ctx.fillStyle = '#101018';
    ctx.fillRect(0, 0, CANVAS_WIDTH, 28);
    ctx.strokeStyle = '#22223a';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, 28);
    ctx.lineTo(CANVAS_WIDTH, 28);
    ctx.stroke();

    ctx.font = 'bold 11px monospace';
    ctx.textAlign = 'left';

    // 1UP Score
    ctx.fillStyle = '#55ffff';
    ctx.fillText('1UP', 16, 18);
    ctx.fillStyle = '#ffff55';
    ctx.fillText(engine.score.toString().padStart(6, '0'), 46, 18);

    // High Score
    ctx.fillStyle = '#ff5555';
    ctx.fillText('HIGH', 130, 18);
    ctx.fillStyle = '#ffffff';
    ctx.fillText(engine.highScore.toString().padStart(6, '0'), 165, 18);

    // Barn / Level
    ctx.fillStyle = '#55ff55';
    ctx.fillText(`BARN:${engine.levelIndex + 1}`, 250, 18);

    // Bonus Countdown
    ctx.fillStyle = '#ff55ff';
    ctx.fillText('BONUS', 320, 18);
    ctx.fillStyle = engine.bonusTimer < 200 ? '#ff3333' : '#ffff55';
    ctx.fillText(Math.floor(engine.bonusTimer).toString().padStart(4, '0'), 368, 18);

    // Eggs left icon & count
    ctx.fillStyle = '#ffff55';
    ctx.beginPath();
    ctx.ellipse(434, 15, 4, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillText(`x${engine.eggsRemaining}`, 444, 18);

    // Lives count at bottom
    ctx.fillStyle = '#ffff55';
    ctx.font = 'bold 10px monospace';
    ctx.fillText(`LIVES:`, 16, CANVAS_HEIGHT - 8);
    for (let i = 0; i < engine.lives; i++) {
      ctx.fillStyle = '#ff3333';
      ctx.fillRect(65 + i * 14, CANVAS_HEIGHT - 16, 8, 10);
      ctx.fillStyle = '#ffccaa';
      ctx.fillRect(67 + i * 14, CANVAS_HEIGHT - 20, 4, 4);
    }
  }

  private renderPlatforms(engine: ChuckieEggEngine) {
    const ctx = this.ctx;

    for (const p of engine.platforms) {
      // Girder body (BBC Cyan / Blue)
      ctx.fillStyle = '#00aaff';
      ctx.fillRect(p.x, p.y, p.width, p.height);

      // Girder top highlight
      ctx.fillStyle = '#55ffff';
      ctx.fillRect(p.x, p.y, p.width, 2);

      // Cross-hatch lattice girder pattern
      ctx.strokeStyle = '#0055aa';
      ctx.lineWidth = 1;
      const step = 12;
      for (let x = p.x; x < p.x + p.width - step; x += step) {
        ctx.beginPath();
        ctx.moveTo(x, p.y + 2);
        ctx.lineTo(x + step, p.y + p.height);
        ctx.moveTo(x + step, p.y + 2);
        ctx.lineTo(x, p.y + p.height);
        ctx.stroke();
      }

      // Bottom shadow
      ctx.fillStyle = '#002255';
      ctx.fillRect(p.x, p.y + p.height - 2, p.width, 2);
    }
  }

  private renderLadders(engine: ChuckieEggEngine) {
    const ctx = this.ctx;

    for (const lad of engine.ladders) {
      // Side rails (Green)
      ctx.fillStyle = '#00dd55';
      ctx.fillRect(lad.x, lad.y, 4, lad.height);
      ctx.fillRect(lad.x + lad.width - 4, lad.y, 4, lad.height);

      // Rail highlights
      ctx.fillStyle = '#55ff99';
      ctx.fillRect(lad.x + 1, lad.y, 1, lad.height);
      ctx.fillRect(lad.x + lad.width - 3, lad.y, 1, lad.height);

      // Rungs
      const rungStep = 8;
      for (let y = lad.y + 4; y < lad.y + lad.height; y += rungStep) {
        ctx.fillStyle = '#00ff66';
        ctx.fillRect(lad.x + 4, y, lad.width - 8, 3);
        ctx.fillStyle = '#aaffcc';
        ctx.fillRect(lad.x + 4, y, lad.width - 8, 1);
      }
    }
  }

  private renderLifts(engine: ChuckieEggEngine) {
    const ctx = this.ctx;

    for (const lift of engine.lifts) {
      // Lift cable wire
      ctx.strokeStyle = '#555577';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(lift.x + lift.width / 2, lift.minY - 10);
      ctx.lineTo(lift.x + lift.width / 2, lift.y);
      ctx.stroke();

      // Lift platform body (Yellow / Orange industrial hoist)
      ctx.fillStyle = '#ffaa00';
      ctx.fillRect(lift.x, lift.y, lift.width, lift.height);

      // Warning hazard stripes
      ctx.fillStyle = '#222222';
      for (let x = lift.x + 4; x < lift.x + lift.width; x += 8) {
        ctx.fillRect(x, lift.y + 2, 4, lift.height - 4);
      }

      ctx.fillStyle = '#ffff55';
      ctx.fillRect(lift.x, lift.y, lift.width, 2);
    }
  }

  private renderItems(engine: ChuckieEggEngine) {
    const ctx = this.ctx;

    // Golden Eggs (12 per level)
    for (const egg of engine.eggs) {
      if (egg.collected) continue;

      ctx.save();
      ctx.translate(egg.x, egg.y);

      // Golden outer egg
      ctx.fillStyle = '#ffff33';
      ctx.beginPath();
      ctx.ellipse(7, 8, 7, 9, 0, 0, Math.PI * 2);
      ctx.fill();

      // Egg shade
      ctx.fillStyle = '#ddaa00';
      ctx.beginPath();
      ctx.ellipse(8, 10, 5, 6, 0, 0, Math.PI * 2);
      ctx.fill();

      // Specular shine highlight
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.ellipse(5, 5, 2, 3, -0.3, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }

    // Grain Piles
    for (const grain of engine.grains) {
      if (grain.collected) continue;

      ctx.save();
      ctx.translate(grain.x, grain.y);

      // Seed bowl / grain pile
      ctx.fillStyle = '#ff8800';
      ctx.beginPath();
      ctx.moveTo(0, 8);
      ctx.lineTo(6, 0);
      ctx.lineTo(12, 8);
      ctx.closePath();
      ctx.fill();

      // Yellow seeds
      ctx.fillStyle = '#ffff66';
      ctx.fillRect(2, 4, 2, 2);
      ctx.fillRect(6, 2, 2, 2);
      ctx.fillRect(8, 5, 2, 2);

      ctx.restore();
    }
  }

  private renderDucks(engine: ChuckieEggEngine) {
    const ctx = this.ctx;

    for (const duck of engine.ducks) {
      ctx.save();
      ctx.translate(duck.x + 10, duck.y + 10);
      if (duck.facingLeft) {
        ctx.scale(-1, 1);
      }

      // Yellow Duck Body
      ctx.fillStyle = '#ffee00';
      ctx.beginPath();
      ctx.ellipse(0, 2, 8, 6, 0, 0, Math.PI * 2);
      ctx.fill();

      // Head
      ctx.beginPath();
      ctx.ellipse(5, -4, 5, 5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Orange Beak
      ctx.fillStyle = '#ff6600';
      ctx.beginPath();
      ctx.moveTo(9, -6);
      ctx.lineTo(14, -4);
      ctx.lineTo(9, -2);
      ctx.closePath();
      ctx.fill();

      // Eye
      ctx.fillStyle = '#000000';
      ctx.fillRect(7, -6, 2, 2);

      // Wing (flapping animation)
      ctx.fillStyle = '#ddaa00';
      ctx.beginPath();
      if (duck.animFrame === 0) {
        ctx.ellipse(-2, 0, 5, 3, 0.2, 0, Math.PI * 2);
      } else {
        ctx.ellipse(-2, -3, 5, 4, -0.4, 0, Math.PI * 2);
      }
      ctx.fill();

      // Orange Feet
      ctx.fillStyle = '#ff6600';
      ctx.fillRect(-3, 8, 4, 3);
      ctx.fillRect(2, 8, 4, 3);

      ctx.restore();
    }
  }

  private renderGiantDuckAndCage(engine: ChuckieEggEngine) {
    const ctx = this.ctx;

    // Cage at top
    const cx = engine.cagedDuckPos.x;
    const cy = engine.cagedDuckPos.y;

    if (!engine.isGiantDuckFree) {
      // Closed Cage Bars
      ctx.fillStyle = '#333344';
      ctx.fillRect(cx - 16, cy - 8, 32, 28);

      // Iron bars
      ctx.strokeStyle = '#8888aa';
      ctx.lineWidth = 2;
      for (let x = cx - 14; x <= cx + 14; x += 7) {
        ctx.beginPath();
        ctx.moveTo(x, cy - 8);
        ctx.lineTo(x, cy + 20);
        ctx.stroke();
      }

      // Giant Duck eyes peeking from cage
      ctx.fillStyle = '#ffee00';
      ctx.fillRect(cx - 6, cy + 2, 12, 10);
      ctx.fillStyle = '#ff0000'; // Menacing red eyes
      ctx.fillRect(cx - 4, cy + 5, 3, 3);
      ctx.fillRect(cx + 1, cy + 5, 3, 3);
    } else {
      // Broken open cage
      ctx.strokeStyle = '#555566';
      ctx.lineWidth = 2;
      ctx.strokeRect(cx - 16, cy - 8, 32, 28);
      ctx.fillStyle = '#ff3333';
      ctx.font = 'bold 9px monospace';
      ctx.fillText('ESCAPED!', cx - 18, cy + 32);

      // The Giant Duck flying across the screen!
      const g = engine.giantDuck;
      ctx.save();
      ctx.translate(g.x, g.y);

      // Facing direction
      if (g.vx < 0) {
        ctx.scale(-1, 1);
      }

      // Giant body (Double size)
      ctx.fillStyle = '#ffee00';
      ctx.beginPath();
      ctx.ellipse(0, 0, 16, 12, 0, 0, Math.PI * 2);
      ctx.fill();

      // Giant Head
      ctx.beginPath();
      ctx.ellipse(12, -8, 10, 9, 0, 0, Math.PI * 2);
      ctx.fill();

      // Sharp Orange Beak
      ctx.fillStyle = '#ff5500';
      ctx.beginPath();
      ctx.moveTo(20, -10);
      ctx.lineTo(30, -7);
      ctx.lineTo(20, -4);
      ctx.closePath();
      ctx.fill();

      // Giant Red Eye
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(15, -9, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ff0000';
      ctx.beginPath();
      ctx.arc(16, -9, 2, 0, Math.PI * 2);
      ctx.fill();

      // Giant flapping wings
      const wingFlap = Math.sin(g.wingAngle) * 12;
      ctx.fillStyle = '#cc9900';
      ctx.beginPath();
      ctx.moveTo(-6, -4);
      ctx.lineTo(2, -18 - wingFlap);
      ctx.lineTo(10, -4);
      ctx.closePath();
      ctx.fill();

      ctx.restore();
    }
  }

  private renderHarry(engine: ChuckieEggEngine) {
    const h = engine.harry;
    const ctx = this.ctx;

    ctx.save();
    ctx.translate(h.x + 10, h.y + 12);

    if (h.facingLeft) {
      ctx.scale(-1, 1);
    }

    if (engine.gameState === 'DYING') {
      // Spinning tumble death
      ctx.rotate(engine.animTimer * 14);
    }

    // Red Cap / Hat
    ctx.fillStyle = '#ee2222';
    ctx.fillRect(-6, -12, 12, 5);
    ctx.fillRect(-2, -14, 8, 3); // Peak of cap

    // Face / Head
    ctx.fillStyle = '#ffccaa';
    ctx.fillRect(-5, -7, 10, 6);

    // Eye
    ctx.fillStyle = '#000000';
    ctx.fillRect(1, -6, 2, 2);

    // Blue Dungarees / Overalls
    ctx.fillStyle = '#0044cc';
    ctx.fillRect(-5, -1, 10, 8);

    // Red Shirt Sleeves
    ctx.fillStyle = '#ee2222';
    ctx.fillRect(-7, 0, 3, 5);
    ctx.fillRect(4, 0, 3, 5);

    // Legs / Running animation
    ctx.fillStyle = '#002288';
    if (h.isOnLadder) {
      // Climbing ladder pose
      if (h.animFrame % 2 === 0) {
        ctx.fillRect(-5, 7, 3, 6);
        ctx.fillRect(2, 7, 3, 4);
      } else {
        ctx.fillRect(-5, 7, 3, 4);
        ctx.fillRect(2, 7, 3, 6);
      }
    } else if (h.isJumping || !h.isGrounded) {
      // Jumping leg tuck
      ctx.fillRect(-6, 6, 4, 4);
      ctx.fillRect(1, 6, 5, 5);
    } else if (h.vx !== 0) {
      // Running cycle
      if (h.animFrame === 0 || h.animFrame === 2) {
        ctx.fillRect(-4, 7, 3, 6);
        ctx.fillRect(1, 7, 3, 6);
      } else if (h.animFrame === 1) {
        ctx.fillRect(-6, 7, 4, 5);
        ctx.fillRect(2, 7, 4, 5);
      } else {
        ctx.fillRect(-3, 7, 3, 6);
        ctx.fillRect(0, 7, 4, 4);
      }
    } else {
      // Standing legs
      ctx.fillRect(-4, 7, 3, 6);
      ctx.fillRect(1, 7, 3, 6);
    }

    // Yellow boots
    ctx.fillStyle = '#ddaa00';
    ctx.fillRect(-5, 12, 4, 2);
    ctx.fillRect(1, 12, 4, 2);

    ctx.restore();
  }

  private renderOverlays(engine: ChuckieEggEngine) {
    const ctx = this.ctx;

    if (engine.gameState === 'TITLE') {
      // Dark backdrop
      ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Title Banner
      ctx.fillStyle = '#ffff33';
      ctx.font = '900 28px monospace';
      ctx.textAlign = 'center';
      ctx.shadowColor = '#ff6600';
      ctx.shadowBlur = 12;
      ctx.fillText('CHUCKIE EGG', CANVAS_WIDTH / 2, 130);
      ctx.shadowBlur = 0;

      ctx.fillStyle = '#55ffff';
      ctx.font = 'bold 12px monospace';
      ctx.fillText('A&F SOFTWARE • BBC MICRO 1983', CANVAS_WIDTH / 2, 160);

      ctx.fillStyle = '#ffffff';
      ctx.font = '11px monospace';
      ctx.fillText('BY NIGEL ALDERTON', CANVAS_WIDTH / 2, 185);

      ctx.fillStyle = '#ff8800';
      ctx.font = '11px monospace';
      ctx.fillText('VERZAMEL ALLE 12 GOUDEN EIEREN PER SCHUUR!', CANVAS_WIDTH / 2, 225);
      ctx.fillText('PAS OP VOOR PATROUILLE-EENDEN EN DE REUZENEEND', CANVAS_WIDTH / 2, 245);

      // Blinking start prompt
      const blink = Math.floor(Date.now() / 400) % 2 === 0;
      if (blink) {
        ctx.fillStyle = '#55ff55';
        ctx.font = 'bold 14px monospace';
        ctx.fillText('DRUK OP SPATIE OF TIK OM TE STARTEN', CANVAS_WIDTH / 2, 305);
      }

      ctx.fillStyle = '#aaaaaa';
      ctx.font = '10px monospace';
      ctx.fillText('BESTURING: PIJLTJESTOETSEN / WASD + SPATIE OM TE SPRINGEN', CANVAS_WIDTH / 2, 345);
    } else if (engine.gameState === 'GAME_OVER') {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      ctx.fillStyle = '#ff3333';
      ctx.font = '900 26px monospace';
      ctx.textAlign = 'center';
      ctx.shadowColor = '#ff0000';
      ctx.shadowBlur = 15;
      ctx.fillText('GAME OVER', CANVAS_WIDTH / 2, 160);
      ctx.shadowBlur = 0;

      ctx.fillStyle = '#ffff55';
      ctx.font = 'bold 14px monospace';
      ctx.fillText(`EINDSCORE: ${engine.score.toLocaleString()}`, CANVAS_WIDTH / 2, 200);

      ctx.fillStyle = '#ffffff';
      ctx.font = '11px monospace';
      ctx.fillText('DRUK OP SPATIE OF HERSTART OM OPNIEUW TE SPELEN', CANVAS_WIDTH / 2, 260);
    } else if (engine.gameState === 'LEVEL_CLEAR') {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      ctx.fillStyle = '#55ff55';
      ctx.font = '900 24px monospace';
      ctx.textAlign = 'center';
      ctx.shadowColor = '#00ff66';
      ctx.shadowBlur = 15;
      ctx.fillText('SCHUUR VOLTOOID!', CANVAS_WIDTH / 2, 160);
      ctx.shadowBlur = 0;

      ctx.fillStyle = '#ffff55';
      ctx.font = 'bold 13px monospace';
      ctx.fillText(`BONUS TOEGEVOEGD: +${Math.floor(engine.bonusTimer)} PTS`, CANVAS_WIDTH / 2, 195);
      ctx.fillText(`SCORE: ${engine.score.toLocaleString()}`, CANVAS_WIDTH / 2, 220);

      ctx.fillStyle = '#55ffff';
      ctx.font = '11px monospace';
      ctx.fillText('VOLGENDE SCHUUR WORDT GELADEN...', CANVAS_WIDTH / 2, 260);
    }
  }

  private renderCRTOverlay() {
    const ctx = this.ctx;

    // Scanlines
    ctx.fillStyle = 'rgba(0, 0, 0, 0.18)';
    for (let y = 0; y < CANVAS_HEIGHT; y += 2) {
      ctx.fillRect(0, y, CANVAS_WIDTH, 1);
    }

    // Subtle phosphor vignette
    const grad = ctx.createRadialGradient(
      CANVAS_WIDTH / 2,
      CANVAS_HEIGHT / 2,
      CANVAS_WIDTH * 0.35,
      CANVAS_WIDTH / 2,
      CANVAS_HEIGHT / 2,
      CANVAS_WIDTH * 0.7
    );
    grad.addColorStop(0, 'rgba(0, 0, 0, 0)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0.35)');

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  }
}
