/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Lemmings (1991 DMA Design / Psygnosis) - Retro Pixel-Art Renderer
 */

import { LemmingsEngine } from './lemmingsEngine';
import { Lemming, LemmingsLevel } from './lemmingsTypes';

export class LemmingsRenderer {
  private ctx: CanvasRenderingContext2D;
  public enableCRT: boolean = true;
  private animTick: number = 0;

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
  }

  public render(
    engine: LemmingsEngine,
    viewWidth: number = 800,
    viewHeight: number = 320
  ) {
    const ctx = this.ctx;
    this.animTick++;

    const level = engine.currentLevel;
    const vpX = Math.max(0, Math.min(level.width - viewWidth, engine.stats.viewportX));
    const vpY = 0;

    ctx.save();
    ctx.clearRect(0, 0, viewWidth, viewHeight);

    // 1. Draw Amiga Copper Gradient & Cavern Background
    this.renderBackground(ctx, level, viewWidth, viewHeight, vpX);

    // 2. Translate view to Viewport
    ctx.save();
    ctx.translate(-vpX, -vpY);

    // 3. Render Destructible Terrain
    ctx.drawImage(engine.terrain.canvas, 0, 0);

    // 4. Render Hazards (Acid / Water)
    this.renderHazards(ctx, level);

    // 5. Render Trapdoor & Exit Arch
    this.renderTrapdoor(ctx, level, engine.trapdoorOpened);
    this.renderExitPortal(ctx, level);

    // 6. Render Lemmings
    for (const lem of engine.lemmings) {
      if (lem.action !== 'dead') {
        this.renderLemming(ctx, lem, engine.hoveredLemmingId === lem.id);
      }
    }

    // 7. Render Particles
    this.renderParticles(ctx, engine);

    // 8. Render Floating Texts
    this.renderFloatingTexts(ctx, engine);

    // 9. Render Targeting Reticle if Lemming hovered
    if (engine.hoveredLemmingId !== null) {
      const target = engine.lemmings.find((l) => l.id === engine.hoveredLemmingId);
      if (target) {
        this.renderTargetReticle(ctx, target, engine.stats.activeSkill);
      }
    }

    ctx.restore(); // Restore Viewport translation

    // 10. Minimap Radar at top-right
    this.renderMinimap(ctx, engine, viewWidth, viewHeight, vpX);

    // 11. Optional CRT Scanlines
    if (this.enableCRT) {
      this.renderCRTOverlay(ctx, viewWidth, viewHeight);
    }

    ctx.restore();
  }

  // --- Background with Amiga / C64 styling ---
  private renderBackground(
    ctx: CanvasRenderingContext2D,
    level: LemmingsLevel,
    w: number,
    h: number,
    vpX: number
  ) {
    // Copper Gradient Sky
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    if (level.theme === 'crystal') {
      grad.addColorStop(0, '#030712');
      grad.addColorStop(0.5, '#082f49');
      grad.addColorStop(1, '#0c4a6e');
    } else if (level.theme === 'hell') {
      grad.addColorStop(0, '#1c1917');
      grad.addColorStop(0.6, '#450a0a');
      grad.addColorStop(1, '#7f1d1d');
    } else {
      grad.addColorStop(0, '#020617');
      grad.addColorStop(0.5, '#0f172a');
      grad.addColorStop(1, '#1e1b4b');
    }

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Parallax background cave stalactites & stars
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    for (let i = 0; i < 30; i++) {
      const sx = ((i * 47) - vpX * 0.2 + w * 2) % w;
      const sy = (i * 19) % (h * 0.6);
      ctx.fillRect(sx, sy, 1.5, 1.5);
    }
  }

  // --- Hazard Water / Acid waves ---
  private renderHazards(ctx: CanvasRenderingContext2D, level: LemmingsLevel) {
    if (!level.hazardY) return;

    const hy = level.hazardY;
    const isAcid = level.hazardType === 'acid';
    const waveOffset = (this.animTick * 0.05) % (Math.PI * 2);

    ctx.save();
    ctx.fillStyle = isAcid ? 'rgba(34, 197, 94, 0.85)' : 'rgba(56, 189, 248, 0.85)';
    ctx.beginPath();
    ctx.moveTo(0, level.height);
    ctx.lineTo(0, hy);

    for (let x = 0; x <= level.width; x += 10) {
      const y = hy + Math.sin((x * 0.08) + waveOffset) * 3;
      ctx.lineTo(x, y);
    }

    ctx.lineTo(level.width, level.height);
    ctx.closePath();
    ctx.fill();

    // Floating bubbles
    ctx.fillStyle = isAcid ? '#86efac' : '#bae6fd';
    for (let bx = 20; bx < level.width; bx += 40) {
      const bubbleY = hy + ((this.animTick * 0.8 + bx * 7) % 20);
      ctx.fillRect(bx, bubbleY, 2, 2);
    }

    ctx.restore();
  }

  // --- Trapdoor Hatch ---
  private renderTrapdoor(ctx: CanvasRenderingContext2D, level: LemmingsLevel, isOpen: boolean) {
    const tx = level.spawnX;
    const ty = level.spawnY - 20;

    ctx.save();

    // Wooden / Iron Truss Box
    ctx.fillStyle = '#78350f';
    ctx.fillRect(tx - 16, ty, 32, 8);
    ctx.fillStyle = '#b45309';
    ctx.fillRect(tx - 14, ty + 1, 28, 6);

    // Steel Rivet Chains
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(tx - 12, 0, 2, ty);
    ctx.fillRect(tx + 10, 0, 2, ty);

    // Trapdoor flaps
    if (isOpen) {
      ctx.fillStyle = '#451a03';
      ctx.fillRect(tx - 14, ty + 8, 4, 12);
      ctx.fillRect(tx + 10, ty + 8, 4, 12);
    } else {
      ctx.fillStyle = '#451a03';
      ctx.fillRect(tx - 14, ty + 8, 28, 3);
    }

    ctx.restore();
  }

  // --- Exit Portal Archway ---
  private renderExitPortal(ctx: CanvasRenderingContext2D, level: LemmingsLevel) {
    const ex = level.exitX;
    const ey = level.exitY;

    ctx.save();

    // Stone Pillars & Arch
    ctx.fillStyle = '#3f3f46';
    ctx.fillRect(ex - 12, ey - 22, 6, 22);
    ctx.fillRect(ex + 6, ey - 22, 6, 22);
    ctx.fillRect(ex - 14, ey - 26, 28, 6);

    // Arch Cap with "EXIT" or Psygnosis rune
    ctx.fillStyle = '#71717a';
    ctx.fillRect(ex - 12, ey - 25, 24, 2);

    // Glowing Magical Portal Center
    const pulse = 0.5 + 0.5 * Math.sin(this.animTick * 0.1);
    ctx.fillStyle = `rgba(250, 204, 21, ${0.4 + pulse * 0.4})`;
    ctx.fillRect(ex - 6, ey - 20, 12, 20);

    ctx.fillStyle = '#fef08a';
    ctx.fillRect(ex - 3, ey - 16, 6, 16);

    // Torches on sides
    ctx.fillStyle = '#f97316';
    const flameH = 3 + (this.animTick % 3);
    ctx.fillRect(ex - 10, ey - 28 - flameH, 2, flameH);
    ctx.fillRect(ex + 8, ey - 28 - flameH, 2, flameH);

    ctx.restore();
  }

  // --- Pixel-Art Lemming Sprite ---
  private renderLemming(ctx: CanvasRenderingContext2D, lem: Lemming, isHovered: boolean) {
    const lx = Math.round(lem.x);
    const ly = Math.round(lem.y);
    const dir = lem.direction;

    ctx.save();

    // 1. Floater Umbrella
    if (lem.action === 'floater') {
      const bob = Math.sin(this.animTick * 0.15) * 1.5;
      ctx.fillStyle = '#ef4444'; // Red & White striped umbrella
      ctx.beginPath();
      ctx.arc(lx, ly - 14 + bob, 8, Math.PI, 0);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(lx - 4, ly - 21 + bob, 3, 7);
      ctx.fillRect(lx + 2, ly - 21 + bob, 3, 7);

      // Umbrella Handle
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(lx - 0.5, ly - 14 + bob, 1, 8);
    }

    // 2. Lemming Body (Classic 8x10 Pixel Creature)
    // Green Hair: #22c55e / #15803d
    // Flesh Face: #fed7aa / #f97316
    // Blue Robe:  #2563eb / #1d4ed8

    // Green Iconic Hair Mop
    ctx.fillStyle = '#22c55e';
    ctx.fillRect(lx - 2, ly - 9, 5, 3);
    ctx.fillStyle = '#16a34a';
    ctx.fillRect(lx - 1, ly - 10, 3, 1);

    // Peach Face & Eye
    ctx.fillStyle = '#fed7aa';
    ctx.fillRect(lx - 1, ly - 7, 3, 2);
    // Dark Eye looking in direction
    ctx.fillStyle = '#000000';
    ctx.fillRect(dir === 1 ? lx + 1 : lx - 1, ly - 7, 1, 1);

    // Blue Robe Body
    ctx.fillStyle = '#2563eb';
    ctx.fillRect(lx - 2, ly - 5, 4, 4);

    // Action Specific Accessories & Postures
    if (lem.action === 'blocker') {
      // Outstretched arms
      ctx.fillStyle = '#fed7aa';
      ctx.fillRect(lx - 4, ly - 4, 8, 1);
      // Red Stop Badge above head
      ctx.fillStyle = '#f43f5e';
      ctx.fillRect(lx - 3, ly - 13, 6, 2);
    } else if (lem.action === 'builder') {
      // Hammer swing in hand
      ctx.fillStyle = '#b45309';
      ctx.fillRect(lx + dir * 3, ly - 5, 3, 1);
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(lx + dir * 4, ly - 7, 2, 2);
    } else if (lem.action === 'basher' || lem.action === 'miner') {
      // Pickaxe
      ctx.fillStyle = '#78350f';
      ctx.fillRect(lx + dir * 2, ly - 6, 4, 1);
      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(lx + dir * 5, ly - 8, 2, 4);
    } else if (lem.action === 'digger') {
      // Shovel straight down
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(lx - 1, ly - 2, 2, 3);
    } else if (lem.action === 'climber') {
      // Arms reaching up wall
      ctx.fillStyle = '#fed7aa';
      ctx.fillRect(lx + dir * 1, ly - 9, 2, 1);
    }

    // Legs / Feet with walking swing
    ctx.fillStyle = '#1e3a8a';
    const legOffset = (lem.frame % 2 === 0) ? 1 : 0;
    ctx.fillRect(lx - 2 + legOffset, ly - 1, 2, 2);
    ctx.fillRect(lx + 1 - legOffset, ly - 1, 2, 2);

    // 3. Permanent Skill Indicator Badges (Floater / Climber)
    if (lem.isPermanentClimber) {
      ctx.fillStyle = '#22c55e';
      ctx.fillRect(lx - 3, ly - 11, 2, 2);
    }
    if (lem.isPermanentFloater) {
      ctx.fillStyle = '#06b6d4';
      ctx.fillRect(lx + 2, ly - 11, 2, 2);
    }

    // 4. Hover Reticle Highlight
    if (isHovered) {
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 1;
      ctx.strokeRect(lx - 5, ly - 12, 11, 14);
    }

    ctx.restore();
  }

  // --- Targeting Reticle for Selected Skill ---
  private renderTargetReticle(
    ctx: CanvasRenderingContext2D,
    lem: Lemming,
    skill: string | null
  ) {
    const lx = Math.round(lem.x);
    const ly = Math.round(lem.y);

    ctx.save();
    // Animated crosshair
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 1;
    ctx.setLineDash([2, 2]);
    ctx.strokeRect(lx - 7, ly - 14, 14, 16);

    // Arrow pointing to direction
    ctx.fillStyle = '#facc15';
    const arrowX = lem.direction === 1 ? lx + 10 : lx - 10;
    ctx.beginPath();
    ctx.moveTo(arrowX, ly - 6);
    ctx.lineTo(arrowX + lem.direction * 3, ly - 6);
    ctx.stroke();

    ctx.restore();
  }

  // --- Particles & Explosions ---
  private renderParticles(ctx: CanvasRenderingContext2D, engine: LemmingsEngine) {
    for (const p of engine.particles) {
      ctx.fillStyle = p.color;
      ctx.fillRect(Math.round(p.x), Math.round(p.y), p.size, p.size);
    }
  }

  // --- Floating Text ---
  private renderFloatingTexts(ctx: CanvasRenderingContext2D, engine: LemmingsEngine) {
    ctx.save();
    ctx.font = 'bold 9px "Press Start 2P", monospace, sans-serif';
    ctx.textAlign = 'center';

    for (const t of engine.floatingTexts) {
      const alpha = 1 - (t.life / t.maxLife);
      ctx.fillStyle = t.color;
      ctx.globalAlpha = alpha;
      ctx.fillText(t.text, Math.round(t.x), Math.round(t.y));
    }

    ctx.restore();
  }

  // --- Top-Right / Bottom Minimap Radar ---
  private renderMinimap(
    ctx: CanvasRenderingContext2D,
    engine: LemmingsEngine,
    viewWidth: number,
    viewHeight: number,
    vpX: number
  ) {
    const level = engine.currentLevel;
    const miniW = 120;
    const miniH = 34;
    const miniX = viewWidth - miniW - 12;
    const miniY = 10;

    const scaleX = miniW / level.width;
    const scaleY = miniH / level.height;

    ctx.save();

    // Minimap frame & background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    ctx.fillRect(miniX, miniY, miniW, miniH);
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1;
    ctx.strokeRect(miniX, miniY, miniW, miniH);

    // Spawn Trapdoor marker (Yellow)
    ctx.fillStyle = '#facc15';
    ctx.fillRect(miniX + level.spawnX * scaleX - 2, miniY + level.spawnY * scaleY - 2, 4, 3);

    // Exit Arch marker (Green)
    ctx.fillStyle = '#22c55e';
    ctx.fillRect(miniX + level.exitX * scaleX - 2, miniY + level.exitY * scaleY - 4, 4, 5);

    // Lemming dots (Cyan/White)
    ctx.fillStyle = '#38bdf8';
    for (const lem of engine.lemmings) {
      if (lem.action !== 'dead') {
        ctx.fillRect(miniX + lem.x * scaleX, miniY + lem.y * scaleY, 1.5, 1.5);
      }
    }

    // Viewport Window Box (White Outline)
    const boxX = miniX + vpX * scaleX;
    const boxW = viewWidth * scaleX;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.lineWidth = 1;
    ctx.strokeRect(boxX, miniY, boxW, miniH);

    ctx.restore();
  }

  // --- CRT Scanline Simulation ---
  private renderCRTOverlay(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number
  ) {
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
    for (let y = 0; y < height; y += 3) {
      ctx.fillRect(0, y, width, 1);
    }
    // Subtle vignette
    const vignette = ctx.createRadialGradient(
      width / 2,
      height / 2,
      width * 0.3,
      width / 2,
      height / 2,
      width * 0.7
    );
    vignette.addColorStop(0, 'rgba(0,0,0,0)');
    vignette.addColorStop(1, 'rgba(0,0,0,0.3)');
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, width, height);
    ctx.restore();
  }
}
