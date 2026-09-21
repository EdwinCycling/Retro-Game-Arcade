/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * EINDELOOS - Canvas 2D Retro C64 Renderer
 */

import { EindeloosEngine, MAP_WIDTH, MAP_HEIGHT, HEART_POS } from './eindeloosEngine';
import { MovingWall } from './eindeloosTypes';

export class EindeloosRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get 2D canvas context');
    this.ctx = ctx;
  }

  public render(engine: EindeloosEngine, isFullscreenMap = false) {
    const ctx = this.ctx;
    const width = this.canvas.width;
    const height = this.canvas.height;
    const state = engine.state;
    const h = state.helicopter;
    const mapImg = engine.getMapImage();

    // Clear background to C64 black
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, width, height);

    if (isFullscreenMap && mapImg) {
      this.renderFullscreenRadar(engine, mapImg);
      return;
    }

    // Viewport calculations: center camera on helicopter
    const camX = Math.floor(h.x - width / 2);
    const camY = Math.floor(h.y - height / 2);

    // 1. Render Map Segment from authentic 8192x4096 image
    if (mapImg && mapImg.complete && mapImg.naturalWidth > 0) {
      // Clamp source rectangle to image bounds
      const sx = Math.max(0, camX);
      const sy = Math.max(0, camY);
      const sRight = Math.min(MAP_WIDTH, camX + width);
      const sBottom = Math.min(MAP_HEIGHT, camY + height);
      const sw = Math.max(0, sRight - sx);
      const sh = Math.max(0, sBottom - sy);

      const dx = sx - camX;
      const dy = sy - camY;

      if (sw > 0 && sh > 0) {
        ctx.drawImage(mapImg, sx, sy, sw, sh, dx, dy, sw, sh);
      }
    } else {
      // Loading screen or fallback pattern
      ctx.fillStyle = '#111';
      ctx.fillRect(0, 0, width, height);
      ctx.fillStyle = '#00ffff';
      ctx.font = '16px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('KAART WORDT GELADEN...', width / 2, height / 2);
    }

    // 2. Render Checkpoints (!)
    for (const cp of state.checkpoints) {
      const scrX = cp.x - camX;
      const scrY = cp.y - camY;
      if (scrX >= -50 && scrX <= width + 50 && scrY >= -50 && scrY <= height + 50) {
        ctx.save();
        ctx.translate(scrX, scrY);

        if (cp.activated) {
          // Activated Checkpoint: Green beacon with soft glow
          ctx.shadowColor = '#55ff55';
          ctx.shadowBlur = 10;
          ctx.fillStyle = '#55ff55';
          ctx.beginPath();
          ctx.arc(0, 0, 11, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;

          ctx.fillStyle = '#000000';
          ctx.font = 'bold 12px monospace';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('✓', 0, 0);

          // Subtle green pulse ring
          ctx.strokeStyle = 'rgba(85, 255, 85, 0.5)';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(0, 0, 16 + Math.sin(Date.now() * 0.005) * 2, 0, Math.PI * 2);
          ctx.stroke();
        } else {
          // Unactivated Checkpoint: Pulsing yellow beacon
          const pulse = Math.sin(Date.now() * 0.008) * 3;
          ctx.shadowColor = '#ffff55';
          ctx.shadowBlur = 8;
          ctx.fillStyle = '#ffff55';
          ctx.beginPath();
          ctx.arc(0, 0, 10, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;

          ctx.fillStyle = '#000000';
          ctx.font = 'bold 13px monospace';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('!', 0, 0);

          ctx.strokeStyle = '#ffff55';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(0, 0, 14 + pulse, 0, Math.PI * 2);
          ctx.stroke();

          // If helicopter is near, show hint
          const distToHeli = Math.hypot(state.helicopter.x - cp.x, state.helicopter.y - cp.y);
          if (distToHeli < 70) {
            ctx.fillStyle = '#ffff55';
            ctx.font = 'bold 9px monospace';
            ctx.fillText('CHECKPOINT', 0, -18);
          }
        }
        ctx.restore();
      }
    }

    // 2b. Render Interactive Items (Keys & Fuel Canisters)
    if (state.items) {
      for (const item of state.items) {
        if (item.collected) continue;
        const scrX = item.x - camX;
        const scrY = item.y - camY;
        if (scrX >= -30 && scrX <= width + 30 && scrY >= -30 && scrY <= height + 30) {
          ctx.save();
          ctx.translate(scrX, scrY);
          const bob = Math.sin(Date.now() * 0.006 + item.id) * 3;

          if (item.type === 'key') {
            // Glowing animated key
            ctx.shadowColor = '#ffff55';
            ctx.shadowBlur = 8;

            // Key bow
            ctx.strokeStyle = '#ffff55';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(-4, bob, 5, 0, Math.PI * 2);
            ctx.stroke();

            // Key shaft & teeth
            ctx.fillStyle = '#ffff55';
            ctx.fillRect(1, bob - 1.5, 9, 3);
            ctx.fillRect(6, bob + 1.5, 2, 3);
            ctx.fillRect(9, bob + 1.5, 2, 4);

            ctx.shadowBlur = 0;

            // Subtle pulsing halo
            ctx.strokeStyle = 'rgba(85, 255, 255, 0.6)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(0, bob, 11 + Math.sin(Date.now() * 0.01) * 2, 0, Math.PI * 2);
            ctx.stroke();
          } else if (item.type === 'fuel') {
            // Fuel canister
            ctx.shadowColor = '#ff9900';
            ctx.shadowBlur = 6;
            ctx.fillStyle = '#ff6600';
            ctx.fillRect(-6, bob - 6, 12, 12);
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(-2, bob - 8, 4, 3);
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 8px monospace';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('F', 0, bob);
            ctx.shadowBlur = 0;
          } else if (item.type === 'cross_boost') {
            // 4-Way Arrow Cross Booster (Authentic Radarsoft C64 Cross sprite)
            ctx.shadowColor = '#55ffff';
            ctx.shadowBlur = 8;
            ctx.fillStyle = '#aaffff';

            // Center cross arms
            ctx.fillRect(-2, bob - 7, 4, 14);
            ctx.fillRect(-7, bob - 2, 14, 4);

            // Up arrow head
            ctx.fillRect(-4, bob - 6, 8, 2);
            ctx.fillRect(-2, bob - 8, 4, 2);
            // Down arrow head
            ctx.fillRect(-4, bob + 4, 8, 2);
            ctx.fillRect(-2, bob + 6, 4, 2);
            // Left arrow head
            ctx.fillRect(-6, bob - 4, 2, 8);
            ctx.fillRect(-8, bob - 2, 2, 4);
            // Right arrow head
            ctx.fillRect(4, bob - 4, 2, 8);
            ctx.fillRect(6, bob - 2, 2, 4);

            ctx.shadowBlur = 0;

            // Pulsing cyan halo
            ctx.strokeStyle = 'rgba(85, 255, 255, 0.5)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(0, bob, 12 + Math.sin(Date.now() * 0.008) * 3, 0, Math.PI * 2);
            ctx.stroke();
          } else if (item.type === 'energy_orb') {
            // Yellow Diamond Energy Pellet
            ctx.shadowColor = '#ffff55';
            ctx.shadowBlur = 6;
            ctx.fillStyle = '#ffff55';
            ctx.beginPath();
            ctx.moveTo(0, bob - 4);
            ctx.lineTo(4, bob);
            ctx.lineTo(0, bob + 4);
            ctx.lineTo(-4, bob);
            ctx.closePath();
            ctx.fill();
            ctx.shadowBlur = 0;
          }
          ctx.restore();
        }
      }
    }

    // 3. Render Energy Barriers
    for (const b of state.barriers) {
      if (!b.active) continue;
      const scrX = b.x - camX;
      const scrY = b.y - camY;
      if (scrX + b.w >= 0 && scrX <= width && scrY + b.h >= 0 && scrY <= height) {
        ctx.fillStyle = Math.random() > 0.3 ? '#55ffff' : '#ffffff';
        ctx.shadowColor = '#55ffff';
        ctx.shadowBlur = 8;
        ctx.fillRect(scrX, scrY, b.w, b.h);
        ctx.shadowBlur = 0;
      }
    }

    // 3b. Render Moving Stone Walls, Hydraulic Crushers & Fortified Gates
    if (state.movingWalls) {
      for (const mw of state.movingWalls) {
        const scrX = mw.currentX - camX;
        const scrY = mw.currentY - camY;
        const totalW = mw.w;
        const totalH = mw.type === 'key_gate' && mw.retractProgress !== undefined
          ? mw.h * (1 - mw.retractProgress)
          : mw.h;

        if (totalH > 1 && scrX + totalW >= -30 && scrX <= width + 30 && scrY + totalH >= -30 && scrY <= height + 30) {
          this.renderMovingWall(scrX, scrY, totalW, totalH, mw, camX, camY);
        }
      }
    }

    // 4. Render The Pulsating Heart Boss
    const heartScrX = state.heart.x - camX;
    const heartScrY = state.heart.y - camY;
    if (
      heartScrX >= -60 &&
      heartScrX <= width + 60 &&
      heartScrY >= -60 &&
      heartScrY <= height + 60
    ) {
      this.renderHeartBoss(heartScrX, heartScrY, state.heart);
    }

    // 5. Render Rockets
    for (const r of state.rockets) {
      const rx = r.x - camX;
      const ry = r.y - camY;
      ctx.fillStyle = '#ffff55';
      ctx.beginPath();
      ctx.arc(rx, ry, 3, 0, Math.PI * 2);
      ctx.fill();

      // Smoke trail
      ctx.fillStyle = 'rgba(255, 100, 0, 0.6)';
      ctx.beginPath();
      ctx.arc(rx - r.vx * 1.5, ry - r.vy * 1.5, 2, 0, Math.PI * 2);
      ctx.fill();
    }

    // 6. Render Enemies
    for (const e of state.enemies) {
      const ex = e.x - camX;
      const ey = e.y - camY;
      if (ex >= -30 && ex <= width + 30 && ey >= -30 && ey <= height + 30) {
        if (e.type === 'skull') {
          this.renderSkull(ex, ey, e.isBlinking);
        } else {
          this.renderMine(ex, ey, e.state);
        }
      }
    }

    // 7. Render Particles
    for (const p of state.particles) {
      const px = p.x - camX;
      const py = p.y - camY;
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.fillRect(px - p.size / 2, py - p.size / 2, p.size, p.size);
      ctx.restore();
    }

    // 8. Render Helicopter (Player)
    const hScrX = h.x - camX;
    const hScrY = h.y - camY;
    if (state.status !== 'crashed') {
      this.renderHelicopter(hScrX, hScrY, h);
    }

    // 9. C64 HUD
    this.renderHUD(engine);

    // 10. Mini-Radar (Bottom Right)
    if (state.radarMode === 'mini' && mapImg) {
      this.renderMiniRadar(engine, mapImg);
    }
  }

  private renderHelicopter(x: number, y: number, h: { facingDir: string; rotorFrame: number; isInvulnerable: boolean }) {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(x, y);

    // Invulnerability blinking
    if (h.isInvulnerable && Math.floor(Date.now() / 80) % 2 === 0) {
      ctx.globalAlpha = 0.4;
    }

    const isLeft = h.facingDir.includes('left');

    // Helicopter body (authentic C64 white & cyan livery)
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(0, 2, 9, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Cockpit windscreen (C64 cyan)
    ctx.fillStyle = '#55ffff';
    const glassX = isLeft ? -4 : 4;
    ctx.beginPath();
    ctx.arc(glassX, 0, 4, 0, Math.PI * 2);
    ctx.fill();

    // Tail boom
    ctx.strokeStyle = '#cccccc';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(isLeft ? 6 : -6, 2);
    ctx.lineTo(isLeft ? 15 : -15, 0);
    ctx.stroke();

    // Tail rotor
    ctx.fillStyle = '#ff5555';
    ctx.fillRect(isLeft ? 14 : -16, -3, 2, 6);

    // Landing skids
    ctx.strokeStyle = '#777777';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-7, 8);
    ctx.lineTo(7, 8);
    ctx.moveTo(-4, 6);
    ctx.lineTo(-4, 8);
    ctx.moveTo(4, 6);
    ctx.lineTo(4, 8);
    ctx.stroke();

    // Rotor Mast
    ctx.fillStyle = '#555555';
    ctx.fillRect(-1, -4, 2, 3);

    // Main Rotor Blades (spinning animation)
    const rotorWidths = [18, 12, 4, 14];
    const rw = rotorWidths[h.rotorFrame % 4];
    ctx.fillStyle = '#ffff55';
    ctx.shadowColor = '#ffff55';
    ctx.shadowBlur = 4;
    ctx.fillRect(-rw / 2, -5, rw, 2);
    ctx.shadowBlur = 0;

    ctx.restore();
  }

  private renderSkull(x: number, y: number, isBlinking: boolean) {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(x, y);

    // Skull body (C64 light grey/white)
    ctx.fillStyle = '#dddddd';
    ctx.beginPath();
    ctx.arc(0, -2, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(-4, 2, 8, 4);

    // Teeth marks
    ctx.fillStyle = '#000000';
    ctx.fillRect(-3, 4, 1.5, 2);
    ctx.fillRect(0, 4, 1.5, 2);
    ctx.fillRect(2.5, 4, 1.5, 2);

    // Eye sockets
    if (isBlinking) {
      // Closed winking slit
      ctx.fillStyle = '#ff0000';
      ctx.fillRect(-4, -2, 3, 1);
      ctx.fillRect(1, -2, 3, 1);
    } else {
      // Glowing red menacing eyes
      ctx.fillStyle = '#ff0000';
      ctx.fillRect(-4, -3, 3, 3);
      ctx.fillRect(1, -3, 3, 3);
    }

    ctx.restore();
  }

  private renderMine(x: number, y: number, state: number) {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(state);

    ctx.fillStyle = '#ff9900';
    ctx.beginPath();
    ctx.arc(0, 0, 6, 0, Math.PI * 2);
    ctx.fill();

    // Spikes
    ctx.strokeStyle = '#ffff55';
    ctx.lineWidth = 2;
    for (let i = 0; i < 4; i++) {
      const ang = (i * Math.PI) / 2;
      ctx.beginPath();
      ctx.moveTo(Math.cos(ang) * 4, Math.sin(ang) * 4);
      ctx.lineTo(Math.cos(ang) * 9, Math.sin(ang) * 9);
      ctx.stroke();
    }
    ctx.restore();
  }

  private renderHeartBoss(x: number, y: number, heart: { health: number; maxHealth: number; pulsePhase: number; isDestroyed: boolean }) {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(x, y);

    if (heart.isDestroyed) {
      ctx.fillStyle = '#331111';
      ctx.beginPath();
      ctx.arc(0, 0, 20, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      return;
    }

    const scale = 1 + Math.sin(heart.pulsePhase) * 0.18;
    ctx.scale(scale, scale);

    // Pulsing Heart Shape
    ctx.fillStyle = '#ff0055';
    ctx.shadowColor = '#ff0055';
    ctx.shadowBlur = 15;

    ctx.beginPath();
    ctx.moveTo(0, -10);
    ctx.bezierCurveTo(-15, -25, -28, 5, 0, 26);
    ctx.bezierCurveTo(28, 5, 15, -25, 0, -10);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Organic Veins
    ctx.strokeStyle = '#990022';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, -5);
    ctx.lineTo(-6, 8);
    ctx.moveTo(0, 0);
    ctx.lineTo(8, 6);
    ctx.stroke();

    // Health bar
    ctx.restore();
    ctx.fillStyle = '#440011';
    ctx.fillRect(x - 24, y - 35, 48, 5);
    ctx.fillStyle = '#00ff88';
    const hpRatio = Math.max(0, heart.health / heart.maxHealth);
    ctx.fillRect(x - 24, y - 35, 48 * hpRatio, 5);
  }

  private renderHUD(engine: EindeloosEngine) {
    const ctx = this.ctx;
    const width = this.canvas.width;
    const state = engine.state;
    const h = state.helicopter;

    // Top retro C64 Banner
    ctx.fillStyle = 'rgba(0, 0, 68, 0.9)';
    ctx.fillRect(0, 0, width, 28);
    ctx.strokeStyle = '#5555ff';
    ctx.lineWidth = 1;
    ctx.strokeRect(0, 0, width, 28);

    ctx.font = 'bold 12px monospace';
    ctx.fillStyle = '#55ffff';
    ctx.textAlign = 'left';
    ctx.fillText(`SCORE:${state.score.toString().padStart(6, '0')}`, 10, 18);

    // 14 Lives as Mini Helicopter icons
    ctx.fillStyle = '#ffffff';
    ctx.fillText('HELIS:', 140, 18);
    const shownLives = Math.min(14, state.lives);
    for (let i = 0; i < shownLives; i++) {
      ctx.fillStyle = '#ffff55';
      ctx.fillRect(190 + i * 8, 12, 5, 3);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(191 + i * 8, 10, 3, 2);
    }
    if (state.lives > 14) {
      ctx.fillStyle = '#55ffff';
      ctx.fillText(`+${state.lives - 14}`, 305, 18);
    }

    // Explored %
    ctx.fillStyle = '#ffaa00';
    ctx.fillText(`VERKEND:${state.exploredPercent}%`, width - 290, 18);

    // Keys collected
    ctx.fillStyle = '#ffff55';
    ctx.fillText(`SLEUTELS:${state.keysCollected || 0}`, width - 180, 18);

    // Compass pointing to the Heart Boss
    const dx = HEART_POS.x - h.x;
    const dy = HEART_POS.y - h.y;
    const distToHeart = Math.round(Math.hypot(dx, dy));
    const angleToHeart = Math.atan2(dy, dx);

    ctx.save();
    ctx.translate(width - 45, 14);
    ctx.strokeStyle = '#ff0055';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, 10, 0, Math.PI * 2);
    ctx.stroke();

    ctx.rotate(angleToHeart);
    ctx.fillStyle = '#ff0055';
    ctx.beginPath();
    ctx.moveTo(8, 0);
    ctx.lineTo(-4, -4);
    ctx.lineTo(-2, 0);
    ctx.lineTo(-4, 4);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    ctx.font = '10px monospace';
    ctx.fillStyle = '#ff55aa';
    ctx.textAlign = 'right';
    ctx.fillText(`HART:${distToHeart}`, width - 60, 18);

    // Active Mission / Event message bar
    if (state.message) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
      ctx.fillRect(width / 2 - 200, 34, 400, 22);
      ctx.strokeStyle = '#ffff55';
      ctx.strokeRect(width / 2 - 200, 34, 400, 22);

      ctx.fillStyle = '#ffff55';
      ctx.font = 'bold 11px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(state.message, width / 2, 49);
    }

    // Title / Game Over / Victory Overlays
    if (state.status === 'title') {
      this.renderTitleScreen(width, this.canvas.height);
    } else if (state.status === 'game_over') {
      this.renderGameOverScreen(width, this.canvas.height, state.score);
    } else if (state.status === 'victory') {
      this.renderVictoryScreen(width, this.canvas.height, state.score);
    }
  }

  private renderMiniRadar(engine: EindeloosEngine, mapImg: HTMLImageElement) {
    const ctx = this.ctx;
    const width = this.canvas.width;
    const height = this.canvas.height;
    const state = engine.state;
    const h = state.helicopter;

    const radarW = 140;
    const radarH = 70;
    const radarX = width - radarW - 10;
    const radarY = height - radarH - 10;

    // Radar border & background
    ctx.fillStyle = 'rgba(0, 20, 0, 0.85)';
    ctx.fillRect(radarX, radarY, radarW, radarH);
    ctx.strokeStyle = '#00ff66';
    ctx.lineWidth = 1;
    ctx.strokeRect(radarX, radarY, radarW, radarH);

    // Thumbnail of map
    ctx.globalAlpha = 0.55;
    ctx.drawImage(mapImg, 0, 0, MAP_WIDTH, MAP_HEIGHT, radarX, radarY, radarW, radarH);
    ctx.globalAlpha = 1.0;

    // Moving Walls & Mechanical Gates on mini radar
    if (state.movingWalls) {
      for (const mw of state.movingWalls) {
        const mx = radarX + (mw.currentX / MAP_WIDTH) * radarW;
        const my = radarY + (mw.currentY / MAP_HEIGHT) * radarH;
        ctx.fillStyle = mw.type === 'key_gate' ? (mw.isUnlocked ? '#55ff55' : '#ff0055') : '#ffaa00';
        ctx.fillRect(mx - 1, my - 1, 2, 2);
      }
    }

    // Player position (blinking yellow dot)
    const px = radarX + (h.x / MAP_WIDTH) * radarW;
    const py = radarY + (h.y / MAP_HEIGHT) * radarH;
    ctx.fillStyle = Math.floor(Date.now() / 150) % 2 === 0 ? '#ffff00' : '#ffffff';
    ctx.beginPath();
    ctx.arc(px, py, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Heart position (pulsing red cross)
    const hx = radarX + (HEART_POS.x / MAP_WIDTH) * radarW;
    const hy = radarY + (HEART_POS.y / MAP_HEIGHT) * radarH;
    ctx.fillStyle = '#ff0055';
    ctx.fillRect(hx - 2, hy, 5, 1);
    ctx.fillRect(hx, hy - 2, 1, 5);

    // Radar title
    ctx.font = '8px monospace';
    ctx.fillStyle = '#00ff66';
    ctx.textAlign = 'left';
    ctx.fillText('RADAR (M)', radarX + 4, radarY + 9);
  }

  private renderFullscreenRadar(engine: EindeloosEngine, mapImg: HTMLImageElement) {
    const ctx = this.ctx;
    const width = this.canvas.width;
    const height = this.canvas.height;
    const state = engine.state;
    const h = state.helicopter;

    ctx.fillStyle = '#001100';
    ctx.fillRect(0, 0, width, height);

    // Full tactical map
    const pad = 24;
    const mapAreaW = width - pad * 2;
    const mapAreaH = height - pad * 2 - 30;

    ctx.strokeStyle = '#00ff66';
    ctx.lineWidth = 2;
    ctx.strokeRect(pad, pad, mapAreaW, mapAreaH);

    // Render entire 8192x4096 map in amber/green phosphor style
    ctx.drawImage(mapImg, 0, 0, MAP_WIDTH, MAP_HEIGHT, pad, pad, mapAreaW, mapAreaH);

    // Checkpoints
    for (const cp of state.checkpoints) {
      const cpx = pad + (cp.x / MAP_WIDTH) * mapAreaW;
      const cpy = pad + (cp.y / MAP_HEIGHT) * mapAreaH;
      ctx.fillStyle = cp.activated ? '#55ff55' : '#ffff55';
      ctx.beginPath();
      ctx.arc(cpx, cpy, 3, 0, Math.PI * 2);
      ctx.fill();
    }

    // Moving Walls & Gates
    if (state.movingWalls) {
      for (const mw of state.movingWalls) {
        const mx = pad + (mw.currentX / MAP_WIDTH) * mapAreaW;
        const my = pad + (mw.currentY / MAP_HEIGHT) * mapAreaH;
        ctx.fillStyle = mw.type === 'key_gate' ? (mw.isUnlocked ? '#55ff55' : '#ff3366') : '#ffaa00';
        ctx.fillRect(mx - 2, my - 2, 4, 4);
      }
    }

    // Items (Keys & Fuel)
    if (state.items) {
      for (const item of state.items) {
        if (item.collected) continue;
        const itx = pad + (item.x / MAP_WIDTH) * mapAreaW;
        const ity = pad + (item.y / MAP_HEIGHT) * mapAreaH;
        ctx.fillStyle = item.type === 'key' ? '#ffff00' : '#ff7700';
        ctx.beginPath();
        ctx.arc(itx, ity, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Player position
    const px = pad + (h.x / MAP_WIDTH) * mapAreaW;
    const py = pad + (h.y / MAP_HEIGHT) * mapAreaH;
    ctx.fillStyle = '#ffff00';
    ctx.beginPath();
    ctx.arc(px, py, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(px, py, 9 + Math.sin(Date.now() * 0.01) * 3, 0, Math.PI * 2);
    ctx.stroke();

    // Heart position
    const hx = pad + (HEART_POS.x / MAP_WIDTH) * mapAreaW;
    const hy = pad + (HEART_POS.y / MAP_HEIGHT) * mapAreaH;
    ctx.strokeStyle = '#ff0055';
    ctx.lineWidth = 2;
    ctx.strokeRect(hx - 6, hy - 6, 12, 12);
    ctx.fillStyle = '#ff0055';
    ctx.font = '9px monospace';
    ctx.fillText('HART', hx + 8, hy + 3);

    // Footer info
    ctx.font = '12px monospace';
    ctx.fillStyle = '#00ff66';
    ctx.textAlign = 'center';
    ctx.fillText(
      `EINDELOOS KAART OVERZICHT (1024x512 KARAKTERS) - ORANJE = BEWEGENDE MUREN, ROOD/GROEN = POORTEN`,
      width / 2,
      height - 12
    );
  }

  private renderMovingWall(
    scrX: number,
    scrY: number,
    w: number,
    h: number,
    mw: MovingWall,
    camX: number,
    camY: number
  ) {
    const ctx = this.ctx;
    ctx.save();

    // 1. Draw shaft guide tracks in the background
    ctx.strokeStyle = '#22252a';
    ctx.lineWidth = 1;
    if (mw.dy > 0) {
      const trackTop = mw.y - camY;
      const trackBottom = mw.y + mw.h + mw.dy - camY;
      ctx.strokeRect(mw.x - camX, trackTop, mw.w, trackBottom - trackTop);
      // Track guide rail center groove
      ctx.strokeStyle = '#181a1f';
      ctx.beginPath();
      ctx.moveTo(mw.x + mw.w / 2 - camX, trackTop);
      ctx.lineTo(mw.x + mw.w / 2 - camX, trackBottom);
      ctx.stroke();
    } else if (mw.dx > 0) {
      const trackLeft = mw.x - camX;
      const trackRight = mw.x + mw.w + mw.dx - camX;
      ctx.strokeRect(trackLeft, mw.y - camY, trackRight - trackLeft, mw.h);
      ctx.strokeStyle = '#181a1f';
      ctx.beginPath();
      ctx.moveTo(trackLeft, mw.y + mw.h / 2 - camY);
      ctx.lineTo(trackRight, mw.y + mw.h / 2 - camY);
      ctx.stroke();
    }

    if (mw.type === 'key_gate') {
      // Fortified Security Blast Gate
      const isUnlocked = mw.isUnlocked;
      ctx.fillStyle = isUnlocked ? '#1b2a1e' : '#2d1e22';
      ctx.fillRect(scrX, scrY, w, h);

      // Gate Outer Frame
      ctx.strokeStyle = isUnlocked ? '#55ff55' : '#ff4444';
      ctx.lineWidth = 2;
      ctx.strokeRect(scrX, scrY, w, h);

      // Steel vertical portcullis bars
      ctx.strokeStyle = isUnlocked ? 'rgba(85, 255, 85, 0.6)' : 'rgba(255, 68, 68, 0.7)';
      ctx.lineWidth = 1.5;
      const barSpacing = 4;
      for (let bx = scrX + 3; bx < scrX + w - 2; bx += barSpacing) {
        ctx.beginPath();
        ctx.moveTo(bx, scrY + 2);
        ctx.lineTo(bx, scrY + h - 2);
        ctx.stroke();
      }

      // Center lock status indicator
      if (!isUnlocked) {
        const lockY = scrY + h / 2;
        ctx.fillStyle = Math.floor(Date.now() / 200) % 2 === 0 ? '#ff3333' : '#ff8888';
        ctx.beginPath();
        ctx.arc(scrX + w / 2, lockY, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    } else {
      // Solid Mechanical Stone Slab / Hydraulic Crusher
      // Base stone fill
      const isCrusher = mw.type === 'hydraulic_crusher';
      ctx.fillStyle = isCrusher ? '#4a535e' : '#5a5d68';
      ctx.fillRect(scrX, scrY, w, h);

      // Beveled high-contrast edges (retro 3D stone block)
      ctx.fillStyle = '#8f95a5'; // Top / Left highlight
      ctx.fillRect(scrX, scrY, w, 2);
      ctx.fillRect(scrX, scrY, 2, h);

      ctx.fillStyle = '#282a30'; // Bottom / Right shadow
      ctx.fillRect(scrX, scrY + h - 2, w, 2);
      ctx.fillRect(scrX + w - 2, scrY, 2, h);

      // Mortar Stone block joints & rivets
      ctx.fillStyle = '#3a3d45';
      if (h > 16) {
        for (let gy = 8; gy < h - 4; gy += 10) {
          ctx.fillRect(scrX + 2, scrY + gy, w - 4, 1);
        }
      }
      if (w > 16) {
        for (let gx = 10; gx < w - 4; gx += 12) {
          ctx.fillRect(scrX + gx, scrY + 2, 1, h - 4);
        }
      }

      // Yellow/Black diagonal hazard stripes on leading edge
      const stripeW = 4;
      ctx.save();
      ctx.beginPath();
      ctx.rect(scrX, scrY, w, h);
      ctx.clip();

      if (isCrusher) {
        // Red / Amber flashing crusher strobe
        ctx.fillStyle = Math.floor(Date.now() / 150) % 2 === 0 ? '#ffcc00' : '#ff3300';
        ctx.fillRect(scrX + w / 2 - 2, scrY + 2, 4, 3);
      } else {
        // Mechanical piston rivet hub in the center
        ctx.fillStyle = '#ffff55';
        ctx.fillRect(scrX + w / 2 - 1.5, scrY + h / 2 - 1.5, 3, 3);
      }

      ctx.restore();
    }

    ctx.restore();
  }

  private renderTitleScreen(width: number, height: number) {
    const ctx = this.ctx;
    // Dark authentic C64 royal backdrop
    ctx.fillStyle = '#080816';
    ctx.fillRect(0, 0, width, height);

    // Decorative retro border frame
    ctx.strokeStyle = '#352879';
    ctx.lineWidth = 6;
    ctx.strokeRect(10, 10, width - 20, height - 20);

    ctx.strokeStyle = '#6c5eb5';
    ctx.lineWidth = 2;
    ctx.strokeRect(18, 18, width - 36, height - 36);

    // Title with 3D retro shadow
    ctx.textAlign = 'center';
    ctx.font = 'bold 38px monospace';
    ctx.fillStyle = '#000000';
    ctx.fillText('E I N D E L O O S', width / 2 + 3, 68);
    ctx.fillStyle = '#1e1b4b';
    ctx.fillText('E I N D E L O O S', width / 2 + 1, 66);
    ctx.fillStyle = '#55ffff';
    ctx.fillText('E I N D E L O O S', width / 2, 65);

    ctx.fillStyle = '#ffff55';
    ctx.font = 'bold 12px monospace';
    ctx.fillText('RADARSOFT (C) 1985 • COMMODORE 64 RECONSTRUCTIE', width / 2, 92);

    // Animated C64 helicopter showcase in center
    const heliX = width / 2;
    const heliY = 145;
    const bobY = Math.sin(Date.now() / 250) * 4;

    // Draw animated helicopter display
    ctx.save();
    ctx.translate(heliX, heliY + bobY);
    ctx.scale(2.2, 2.2);

    // Spinning rotor
    const rotorPhase = Math.floor(Date.now() / 60) % 4;
    ctx.fillStyle = '#ffffff';
    if (rotorPhase === 0) ctx.fillRect(-18, -10, 36, 1.5);
    else if (rotorPhase === 1) ctx.fillRect(-12, -10, 24, 1.5);
    else if (rotorPhase === 2) ctx.fillRect(-6, -10, 12, 1.5);
    else ctx.fillRect(-15, -10, 30, 1.5);

    // Mast
    ctx.fillStyle = '#888888';
    ctx.fillRect(-1, -8, 2, 4);

    // Cockpit body (classic yellow Eindeloos helicopter)
    ctx.fillStyle = '#ffff55';
    ctx.beginPath();
    ctx.ellipse(0, 0, 11, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Blue glass canopy
    ctx.fillStyle = '#55ffff';
    ctx.beginPath();
    ctx.ellipse(4, -1, 5, 3.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Tail boom & tail rotor
    ctx.fillStyle = '#ffff55';
    ctx.fillRect(-18, -2, 10, 3);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-19, -6, 2, 8);

    // Landing skids
    ctx.fillStyle = '#888888';
    ctx.fillRect(-2, 5, 2, 3);
    ctx.fillRect(4, 5, 2, 3);
    ctx.fillRect(-10, 8, 22, 1.5);
    ctx.restore();

    // Mission & Controls info panel
    const boxY = 195;
    const boxH = 140;
    const boxW = width - 60;
    const boxX = 30;

    ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
    ctx.fillRect(boxX, boxY, boxW, boxH);
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1;
    ctx.strokeRect(boxX, boxY, boxW, boxH);

    ctx.fillStyle = '#f87171';
    ctx.font = 'bold 12px monospace';
    ctx.fillText('MISSIE: VLIEG DIEP HET DOOLHOF IN & VERNIETIG HET HART [♥]', width / 2, boxY + 24);

    ctx.fillStyle = '#67e8f9';
    ctx.font = 'bold 12px monospace';
    ctx.fillText('★ BESTURING: NUMPAD 7 8 9 / 4 6 / 1 2 3 (8 RICHTINGEN) ★', width / 2, boxY + 48);

    ctx.fillStyle = '#cbd5e1';
    ctx.font = '11px monospace';
    ctx.fillText('NumLock AAN/UIT (Home, PgUp, End, PgDn) • Pijltoetsen • Touch Controls', width / 2, boxY + 68);
    ctx.fillText('Spatiebalk / Numpad 0 / Enter = Raket Afvuren & Checkpoint [!] Opslaan', width / 2, boxY + 88);

    ctx.fillStyle = '#38bdf8';
    ctx.font = '11px monospace';
    ctx.fillText('M = 500-Schermen Radarkaart  •  P = Pauze  •  14 Helikopters', width / 2, boxY + 112);

    // Blinking prompt at bottom
    ctx.fillStyle = Math.floor(Date.now() / 350) % 2 === 0 ? '#4ade80' : '#fef08a';
    ctx.font = 'bold 14px monospace';
    ctx.fillText('► DRUK OP SPATIEBALK OF KLIK OP HET SCHERM OM TE BEGINNEN ◄', width / 2, height - 34);
  }

  private renderGameOverScreen(width: number, height: number, score: number) {
    const ctx = this.ctx;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = '#ff3333';
    ctx.font = 'bold 28px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('G A M E   O V E R', width / 2, height / 2 - 40);

    ctx.fillStyle = '#ffffff';
    ctx.font = '14px monospace';
    ctx.fillText(`EINDSCORE: ${score}`, width / 2, height / 2);
    ctx.fillText('Alle 14 helikopters zijn gecrasht in het doolhof.', width / 2, height / 2 + 25);

    ctx.fillStyle = '#ffff55';
    ctx.font = 'bold 14px monospace';
    ctx.fillText('KLIK OP HERSTART OF DRUK OP SPATIE OM OPNIEUW TE BEGINNEN', width / 2, height / 2 + 70);
  }

  private renderVictoryScreen(width: number, height: number, score: number) {
    const ctx = this.ctx;
    ctx.fillStyle = 'rgba(0, 0, 50, 0.9)';
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = '#55ff55';
    ctx.font = 'bold 28px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('G E F E L I C I T E E R D !', width / 2, height / 2 - 50);

    ctx.fillStyle = '#ffff55';
    ctx.font = '16px monospace';
    ctx.fillText('JE HEBT HET KLOPPENDE HART VERNIETIGD!', width / 2, height / 2 - 15);

    ctx.fillStyle = '#ffffff';
    ctx.font = '14px monospace';
    ctx.fillText(`EINDSCORE: ${score}`, width / 2, height / 2 + 15);
    ctx.fillText('Je bent een van de weinige piloten die ooit het einde van Eindeloos heeft bereikt!', width / 2, height / 2 + 40);

    ctx.fillStyle = '#55ffff';
    ctx.font = 'bold 14px monospace';
    ctx.fillText('DRUK OP SPATIEBALK OF KLIK OP OPNIEUW SPELEN', width / 2, height / 2 + 80);
  }
}
