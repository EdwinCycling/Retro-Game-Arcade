/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Q*bert Canvas 2D Renderer (Isometric 3D & BBC Micro CRT Shader)
 */

import { QbertEngine, NATIVE_WIDTH, NATIVE_HEIGHT, getCubeCenter } from './qbertEngine';
import { DisplayPalette, Direction } from './qbertTypes';

export class QbertRenderer {
  private ctx: CanvasRenderingContext2D;
  public palette: DisplayPalette = 'authentic';
  public enableCRT: boolean = true;

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
  }

  public setPalette(p: DisplayPalette) {
    this.palette = p;
  }

  public render(engine: QbertEngine) {
    const ctx = this.ctx;
    ctx.save();

    // 1. Clear Screen with dark void
    ctx.fillStyle = '#020617';
    ctx.fillRect(0, 0, NATIVE_WIDTH, NATIVE_HEIGHT);

    // 2. Render Flying Disks (under/around pyramid)
    this.renderDisks(engine);

    // 3. Render Pyramid Cubes (Row by row from 0 to 6 for correct Z-order depth)
    this.renderPyramid(engine);

    // 4. Render Balls (Red & Green)
    this.renderBalls(engine);

    // 5. Render Coily (Egg / Snake)
    this.renderCoily(engine);

    // 6. Render Q*bert Player
    this.renderPlayer(engine);

    // 7. Render HUD
    this.renderHUD(engine);

    // 8. Title / Game Over / Level Clear Overlays
    if (engine.gameState === 'TITLE') {
      this.renderTitleOverlay();
    } else if (engine.gameState === 'GAMEOVER') {
      this.renderGameOverOverlay(engine);
    } else if (engine.gameState === 'LEVEL_CLEAR') {
      this.renderLevelClearOverlay(engine);
    }

    // 9. CRT Scanline Simulation
    if (this.enableCRT) {
      this.renderCRTOverlay();
    }

    ctx.restore();
  }

  private renderPyramid(engine: QbertEngine) {
    const ctx = this.ctx;

    // Palette Colors
    let colorTopInitial = '#1e1b4b'; // Deep Indigo
    let colorTopTarget = '#eab308';  // Bright Gold
    let colorTopAlt = '#10b981';     // Emerald green (intermediate)
    let colorLeft = '#312e81';       // Shadow Left
    let colorRight = '#4338ca';      // Shadow Right

    if (this.palette === 'bbc_micro') {
      colorTopInitial = '#0000ff';
      colorTopTarget = '#ffff00';
      colorTopAlt = '#00ff00';
      colorLeft = '#00ffff';
      colorRight = '#ff00ff';
    } else if (this.palette === 'green') {
      colorTopInitial = '#064e3b';
      colorTopTarget = '#22c55e';
      colorTopAlt = '#15803d';
      colorLeft = '#047857';
      colorRight = '#059669';
    } else if (this.palette === 'amber') {
      colorTopInitial = '#78350f';
      colorTopTarget = '#f59e0b';
      colorTopAlt = '#d97706';
      colorLeft = '#92400e';
      colorRight = '#b45309';
    }

    // Sort cubes by row and col for natural isometric depth
    const sortedCubes = [...engine.cubes].sort((a, b) => {
      if (a.row !== b.row) return a.row - b.row;
      return a.col - b.col;
    });

    sortedCubes.forEach((cube) => {
      const center = getCubeCenter(cube.row, cube.col);
      const cx = center.x;
      const cy = center.y;

      let topColor = colorTopInitial;
      if (engine.gameState === 'LEVEL_CLEAR') {
        const rainbow = ['#ef4444', '#f59e0b', '#10b981', '#06b6d4', '#8b5cf6', '#ec4899'];
        topColor = rainbow[Math.floor(cube.flashTimer * 2 + cube.row) % rainbow.length];
      } else {
        if (cube.state === 1) {
          topColor = cube.targetState === 1 ? colorTopTarget : colorTopAlt;
        } else if (cube.state === 2) {
          topColor = colorTopTarget;
        }
      }

      // --- 1. Top Diamond Face ---
      ctx.fillStyle = topColor;
      ctx.beginPath();
      ctx.moveTo(cx, cy - 11);
      ctx.lineTo(cx + 16, cy);
      ctx.lineTo(cx, cy + 11);
      ctx.lineTo(cx - 16, cy);
      ctx.closePath();
      ctx.fill();

      // Top face subtle inner highlight
      ctx.strokeStyle = 'rgba(255,255,255,0.22)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // --- 2. Left Shaded Face ---
      ctx.fillStyle = colorLeft;
      ctx.beginPath();
      ctx.moveTo(cx - 16, cy);
      ctx.lineTo(cx, cy + 11);
      ctx.lineTo(cx, cy + 23);
      ctx.lineTo(cx - 16, cy + 12);
      ctx.closePath();
      ctx.fill();

      // --- 3. Right Shaded Face ---
      ctx.fillStyle = colorRight;
      ctx.beginPath();
      ctx.moveTo(cx, cy + 11);
      ctx.lineTo(cx + 16, cy);
      ctx.lineTo(cx + 16, cy + 12);
      ctx.lineTo(cx, cy + 23);
      ctx.closePath();
      ctx.fill();

      // Cube Edge outlines for clean pixel sharpness
      ctx.strokeStyle = '#020617';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cx, cy + 11);
      ctx.lineTo(cx, cy + 23);
      ctx.moveTo(cx - 16, cy);
      ctx.lineTo(cx - 16, cy + 12);
      ctx.moveTo(cx + 16, cy);
      ctx.lineTo(cx + 16, cy + 12);
      ctx.stroke();
    });
  }

  private renderDisks(engine: QbertEngine) {
    const ctx = this.ctx;
    const now = Date.now();

    engine.disks.forEach((disk) => {
      if (!disk.active) return;
      ctx.save();
      ctx.translate(disk.x, disk.y);

      // Rotating glow rim
      const angle = (now * 0.005) % (Math.PI * 2);
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 6;

      ctx.fillStyle = '#0284c7';
      ctx.beginPath();
      ctx.ellipse(0, 0, 14, 6, 0, 0, Math.PI * 2);
      ctx.fill();

      // Inner disc surface
      ctx.fillStyle = '#bae6fd';
      ctx.beginPath();
      ctx.ellipse(0, -1, 10, 4, 0, 0, Math.PI * 2);
      ctx.fill();

      // Rotating dots on rim
      ctx.fillStyle = '#ffffff';
      for (let i = 0; i < 4; i++) {
        const dotA = angle + (i * Math.PI) / 2;
        const dx = Math.cos(dotA) * 11;
        const dy = Math.sin(dotA) * 4;
        ctx.beginPath();
        ctx.arc(dx, dy, 1.2, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    });
  }

  private renderBalls(engine: QbertEngine) {
    const ctx = this.ctx;

    engine.balls.forEach((b) => {
      ctx.save();
      const x = b.visualX;
      const y = b.visualY;

      if (b.type === 'green') {
        // Green Freeze Ball (Pulsing)
        ctx.shadowColor = '#22c55e';
        ctx.shadowBlur = 8;
        ctx.fillStyle = '#16a34a';
        ctx.beginPath();
        ctx.arc(x, y, 6.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#bbf7d0';
        ctx.beginPath();
        ctx.arc(x - 2, y - 2, 2.5, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Red Lethal Ball
        ctx.shadowColor = '#ef4444';
        ctx.shadowBlur = 4;
        ctx.fillStyle = '#dc2626';
        ctx.beginPath();
        ctx.arc(x, y, 6.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#fca5a5';
        ctx.beginPath();
        ctx.arc(x - 2, y - 2, 2.2, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    });
  }

  private renderCoily(engine: QbertEngine) {
    const c = engine.coily;
    if (!c || !c.active) return;
    const ctx = this.ctx;
    ctx.save();

    const x = c.visualX;
    const y = c.visualY;

    if (!c.isHatched) {
      // 1. Purple Bouncing Egg
      ctx.shadowColor = '#a855f7';
      ctx.shadowBlur = 4;
      ctx.fillStyle = '#7e22ce';
      ctx.beginPath();
      ctx.ellipse(x, y, 6, 8, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#e9d5ff';
      ctx.beginPath();
      ctx.arc(x - 2, y - 3, 2, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // 2. Coily the Snake!
      ctx.shadowColor = '#9333ea';
      ctx.shadowBlur = 6;

      // Coiled spring body segments
      ctx.fillStyle = '#7e22ce';
      ctx.beginPath();
      ctx.ellipse(x, y + 4, 8, 4, 0, 0, Math.PI * 2);
      ctx.ellipse(x, y, 7, 4, 0, 0, Math.PI * 2);
      ctx.ellipse(x, y - 4, 6, 4, 0, 0, Math.PI * 2);
      ctx.fill();

      // Snake Head
      ctx.fillStyle = '#9333ea';
      const headOffsetY = y - 9;
      ctx.beginPath();
      ctx.arc(x, headOffsetY, 6, 0, Math.PI * 2);
      ctx.fill();

      // Red menacing eyes
      const eyeDir = c.facing === 'UL' || c.facing === 'DL' ? -2 : 2;
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(x + eyeDir - 1, headOffsetY - 1, 1.8, 0, Math.PI * 2);
      ctx.arc(x + eyeDir + 2, headOffsetY - 1, 1.8, 0, Math.PI * 2);
      ctx.fill();

      // Flickering yellow tongue
      if (Math.floor(Date.now() / 120) % 2 === 0) {
        ctx.strokeStyle = '#facc15';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(x + eyeDir * 1.5, headOffsetY + 2);
        ctx.lineTo(x + eyeDir * 3.5, headOffsetY + 3);
        ctx.stroke();
      }
    }

    ctx.restore();
  }

  private renderPlayer(engine: QbertEngine) {
    const p = engine.player;
    const ctx = this.ctx;
    ctx.save();

    const x = p.visualX;
    const y = p.visualY;

    // Mini drop shadow on the cube
    if (!p.isFalling && !p.isRidingDisk) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.beginPath();
      ctx.ellipse(x, y + 10, 8, 3.5, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // --- Q*bert Body (Orange sphere) ---
    ctx.fillStyle = '#f97316';
    ctx.beginPath();
    ctx.arc(x, y, 9, 0, Math.PI * 2);
    ctx.fill();

    // Body highlight
    ctx.fillStyle = '#fdba74';
    ctx.beginPath();
    ctx.arc(x - 3, y - 3, 3.5, 0, Math.PI * 2);
    ctx.fill();

    // --- Snoot / Trumpet Nose depending on direction ---
    ctx.fillStyle = '#ea580c';
    let noseX = x;
    let noseY = y + 2;
    let noseR = 4.2;

    switch (p.facing) {
      case 'UL':
        noseX = x - 7;
        noseY = y - 3;
        break;
      case 'UR':
        noseX = x + 7;
        noseY = y - 3;
        break;
      case 'DL':
        noseX = x - 7;
        noseY = y + 4;
        break;
      case 'DR':
        noseX = x + 7;
        noseY = y + 4;
        break;
    }

    ctx.beginPath();
    ctx.arc(noseX, noseY, noseR, 0, Math.PI * 2);
    ctx.fill();

    // Hollow snout tip
    ctx.fillStyle = '#7c2d12';
    ctx.beginPath();
    ctx.arc(noseX, noseY, 2, 0, Math.PI * 2);
    ctx.fill();

    // --- Eyes (Two white cartoon eyes with pupils) ---
    const eyeOffset = {
      UL: { left: { x: -3, y: -5 }, right: { x: 2, y: -6 }, look: { x: -1, y: -1 } },
      UR: { left: { x: -2, y: -6 }, right: { x: 3, y: -5 }, look: { x: 1, y: -1 } },
      DL: { left: { x: -4, y: -4 }, right: { x: 1, y: -4 }, look: { x: -1, y: 1 } },
      DR: { left: { x: -1, y: -4 }, right: { x: 4, y: -4 }, look: { x: 1, y: 1 } },
    }[p.facing];

    // Left Eye
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(x + eyeOffset.left.x, y + eyeOffset.left.y, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#020617';
    ctx.beginPath();
    ctx.arc(x + eyeOffset.left.x + eyeOffset.look.x, y + eyeOffset.left.y + eyeOffset.look.y, 1.4, 0, Math.PI * 2);
    ctx.fill();

    // Right Eye
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(x + eyeOffset.right.x, y + eyeOffset.right.y, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#020617';
    ctx.beginPath();
    ctx.arc(x + eyeOffset.right.x + eyeOffset.look.x, y + eyeOffset.right.y + eyeOffset.look.y, 1.4, 0, Math.PI * 2);
    ctx.fill();

    // Two little kicking feet
    ctx.fillStyle = '#ea580c';
    ctx.beginPath();
    ctx.ellipse(x - 4, y + 9, 3, 2, 0, 0, Math.PI * 2);
    ctx.ellipse(x + 4, y + 9, 3, 2, 0, 0, Math.PI * 2);
    ctx.fill();

    // --- Swearing Speech Balloon (@!#?@!) ---
    if (p.isSwearing) {
      const bubbleX = x + 16;
      const bubbleY = y - 24;
      const bw = 54;
      const bh = 18;

      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#020617';
      ctx.lineWidth = 1.5;

      // Comic balloon with rounded rect
      ctx.beginPath();
      ctx.roundRect(bubbleX, bubbleY, bw, bh, 5);
      ctx.fill();
      ctx.stroke();

      // Balloon pointer
      ctx.beginPath();
      ctx.moveTo(bubbleX + 6, bubbleY + bh);
      ctx.lineTo(x + 6, y - 6);
      ctx.lineTo(bubbleX + 16, bubbleY + bh);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.stroke();

      // Curse Text
      ctx.fillStyle = '#ef4444';
      ctx.font = 'bold 10px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(p.swearText, bubbleX + bw / 2, bubbleY + 13);
    }

    ctx.restore();
  }

  private renderHUD(engine: QbertEngine) {
    const ctx = this.ctx;
    ctx.save();
    ctx.font = '8px "Press Start 2P", monospace, sans-serif';

    // Top Header: Score & High Score
    ctx.fillStyle = '#38bdf8';
    ctx.fillText('PLAYER 1', 12, 14);

    ctx.fillStyle = '#ffffff';
    ctx.fillText(engine.score.toString().padStart(6, '0'), 12, 26);

    ctx.fillStyle = '#ef4444';
    ctx.fillText('HIGH SCORE', 115, 14);
    ctx.fillStyle = '#ffffff';
    ctx.fillText(engine.highScore.toString().padStart(6, '0'), 125, 26);

    ctx.fillStyle = '#facc15';
    ctx.fillText(`LVL ${engine.level}`, 240, 14);
    ctx.fillText(`RND ${engine.round}`, 240, 26);

    // Target Color preview box
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('CHANGE TO:', 12, 50);

    // Mini target diamond
    const miniX = 94;
    const miniY = 47;
    ctx.fillStyle = '#eab308';
    ctx.beginPath();
    ctx.moveTo(miniX, miniY - 5);
    ctx.lineTo(miniX + 7, miniY);
    ctx.lineTo(miniX, miniY + 5);
    ctx.lineTo(miniX - 7, miniY);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();

    // Freeze Status Banner
    if (engine.freezeTimer > 0) {
      ctx.fillStyle = '#38bdf8';
      ctx.fillText(`FROZEN! ${engine.freezeTimer.toFixed(1)}s`, 12, 64);
    }

    // Lives counter (mini orange icons)
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('LIVES:', 12, NATIVE_HEIGHT - 12);
    for (let i = 0; i < Math.min(5, engine.lives); i++) {
      const lx = 64 + i * 14;
      const ly = NATIVE_HEIGHT - 15;
      ctx.fillStyle = '#f97316';
      ctx.beginPath();
      ctx.arc(lx, ly, 4, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  private renderTitleOverlay() {
    const ctx = this.ctx;
    ctx.save();
    ctx.fillStyle = 'rgba(2, 6, 23, 0.82)';
    ctx.fillRect(0, 0, NATIVE_WIDTH, NATIVE_HEIGHT);

    ctx.font = '16px "Press Start 2P", monospace, sans-serif';
    ctx.textAlign = 'center';

    // Title Q*bert
    ctx.shadowColor = '#f97316';
    ctx.shadowBlur = 10;
    ctx.fillStyle = '#f97316';
    ctx.fillText('Q * B E R T', NATIVE_WIDTH / 2, 70);

    ctx.shadowBlur = 0;
    ctx.font = '8px "Press Start 2P", monospace, sans-serif';
    ctx.fillStyle = '#e2e8f0';
    ctx.fillText('ACORN BBC MICRO / GOTTLIEB', NATIVE_WIDTH / 2, 92);

    ctx.fillStyle = '#38bdf8';
    ctx.fillText('CHANGE ALL CUBES TO GOLD', NATIVE_WIDTH / 2, 122);
    ctx.fillText('AVOID COILY THE SNAKE', NATIVE_WIDTH / 2, 138);
    ctx.fillText('USE DISKS TO ESCAPE CLIFF', NATIVE_WIDTH / 2, 154);

    if (Math.floor(Date.now() / 450) % 2 === 0) {
      ctx.fillStyle = '#facc15';
      ctx.fillText('PRESS START / SPACE TO PLAY', NATIVE_WIDTH / 2, 190);
    }

    ctx.fillStyle = '#64748b';
    ctx.fillText('DIAGONAL CONTROLS: 7 9 1 3 OR Q W A S', NATIVE_WIDTH / 2, 214);

    ctx.restore();
  }

  private renderGameOverOverlay(engine: QbertEngine) {
    const ctx = this.ctx;
    ctx.save();
    ctx.fillStyle = 'rgba(2, 6, 23, 0.78)';
    ctx.fillRect(0, 0, NATIVE_WIDTH, NATIVE_HEIGHT);

    ctx.font = '16px "Press Start 2P", monospace, sans-serif';
    ctx.textAlign = 'center';

    ctx.fillStyle = '#ef4444';
    ctx.fillText('GAME OVER', NATIVE_WIDTH / 2, 95);

    ctx.font = '9px "Press Start 2P", monospace, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`FINAL SCORE: ${engine.score}`, NATIVE_WIDTH / 2, 125);
    ctx.fillText(`LEVEL REACHED: ${engine.level}`, NATIVE_WIDTH / 2, 142);

    if (Math.floor(Date.now() / 400) % 2 === 0) {
      ctx.fillStyle = '#facc15';
      ctx.fillText('PRESS START TO RETRY', NATIVE_WIDTH / 2, 178);
    }

    ctx.restore();
  }

  private renderLevelClearOverlay(engine: QbertEngine) {
    const ctx = this.ctx;
    ctx.save();

    ctx.font = '14px "Press Start 2P", monospace, sans-serif';
    ctx.textAlign = 'center';
    ctx.shadowColor = '#facc15';
    ctx.shadowBlur = 8;
    ctx.fillStyle = '#facc15';
    ctx.fillText('LEVEL COMPLETE!', NATIVE_WIDTH / 2, 105);

    ctx.shadowBlur = 0;
    ctx.font = '8px "Press Start 2P", monospace, sans-serif';
    ctx.fillStyle = '#38bdf8';
    ctx.fillText('BONUS +1000 PTS', NATIVE_WIDTH / 2, 130);
    ctx.fillText(`NEXT: LEVEL ${engine.level} ROUND ${engine.round}`, NATIVE_WIDTH / 2, 150);

    ctx.restore();
  }

  private renderCRTOverlay() {
    const ctx = this.ctx;
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.16)';
    for (let y = 0; y < NATIVE_HEIGHT; y += 2) {
      ctx.fillRect(0, y, NATIVE_WIDTH, 1);
    }

    // CRT Vignette
    const grad = ctx.createRadialGradient(
      NATIVE_WIDTH / 2,
      NATIVE_HEIGHT / 2,
      NATIVE_WIDTH * 0.45,
      NATIVE_WIDTH / 2,
      NATIVE_HEIGHT / 2,
      NATIVE_WIDTH * 0.75
    );
    grad.addColorStop(0, 'rgba(0,0,0,0)');
    grad.addColorStop(1, 'rgba(0,0,0,0.55)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, NATIVE_WIDTH, NATIVE_HEIGHT);

    ctx.restore();
  }
}
