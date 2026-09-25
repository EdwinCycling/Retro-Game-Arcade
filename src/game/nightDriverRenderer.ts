/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Night Driver (Bill Budge / Apple II, 1980 / 1983)
 * Authentic Canvas 2D Retro Renderer (Apple Monitor II P31 Green & Hi-Res Color)
 * Clean-room re-engineered with true perspective projection and authentic HUD
 */

import { NightDriverEngine, MonitorMode } from './nightDriverEngine';

export class NightDriverRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  // Starfield in the night sky
  private stars: Array<{ x: number; y: number; brightness: number }> = [];

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Could not get 2D context');
    this.ctx = context;

    // Generate static stars for night sky
    for (let i = 0; i < 48; i++) {
      this.stars.push({
        x: Math.random() * 280,
        y: Math.random() * (NightDriverEngine.HORIZON_Y - 8),
        brightness: 0.35 + Math.random() * 0.65
      });
    }
  }

  public render(engine: NightDriverEngine) {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    const mode = engine.monitorMode;

    ctx.save();

    // Scale from logical 280x192 to canvas resolution
    const scaleX = w / 280;
    const scaleY = h / 192;
    ctx.scale(scaleX, scaleY);

    // Apply crash screen shake
    if (engine.isCrashed) {
      const shakeIntensity = engine.crashTimer * 5.0;
      const shakeX = (Math.random() - 0.5) * shakeIntensity;
      const shakeY = (Math.random() - 0.5) * shakeIntensity;
      ctx.translate(shakeX, shakeY);
    }

    // 1. Draw Night Background & Sky
    this.drawBackground(ctx, engine, mode);

    // 2. Draw Stars with steering parallax
    this.drawStars(ctx, engine, mode);

    // 3. Draw Horizon Line & Road Surface
    this.drawRoadBase(ctx, engine, mode);

    // 4. Draw Roadside Trees
    this.drawRoadsideObjects(ctx, engine, mode);

    // 5. Draw 3D Reflector Pylons
    this.drawPylons(ctx, engine, mode);

    // 6. Draw Oncoming Traffic
    this.drawOncomingTraffic(ctx, engine, mode);

    // 7. Draw Player Car Cockpit & Hood
    this.drawCarHood(ctx, engine, mode);

    // 8. Draw Crash Flash / Sparks
    if (engine.isCrashed) {
      this.drawCrashFX(ctx, mode);
    }

    // 9. Draw Scanlines & Phosphor CRT Overlay
    this.drawCrtEffects(ctx, mode);

    ctx.restore();
  }

  private drawBackground(ctx: CanvasRenderingContext2D, engine: NightDriverEngine, mode: MonitorMode) {
    // Deep black night sky
    ctx.fillStyle = mode === 'green' ? '#030a04' : '#050508';
    ctx.fillRect(0, 0, 280, 192);
  }

  private drawStars(ctx: CanvasRenderingContext2D, engine: NightDriverEngine, mode: MonitorMode) {
    const starColor = mode === 'green' ? '#4ade80' : '#e2e8f0';
    // Parallax stars slightly when steering
    const drift = (engine.steerAngle * 18 + engine.currentCurve * 25) % 280;

    for (const star of this.stars) {
      let sx = (star.x - drift) % 280;
      if (sx < 0) sx += 280;
      ctx.fillStyle = starColor;
      ctx.globalAlpha = star.brightness;
      ctx.fillRect(Math.floor(sx), Math.floor(star.y), 1, 1);
    }
    ctx.globalAlpha = 1.0;
  }

  private drawRoadBase(ctx: CanvasRenderingContext2D, engine: NightDriverEngine, mode: MonitorMode) {
    const hy = NightDriverEngine.HORIZON_Y;

    // Horizon line
    ctx.strokeStyle = mode === 'green' ? '#166534' : '#1e293b';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, hy);
    ctx.lineTo(280, hy);
    ctx.stroke();

    // Road asphalt dark surface
    ctx.fillStyle = mode === 'green' ? '#041006' : '#080b12';
    ctx.fillRect(0, hy, 280, 192 - hy);

    // Headlight cone beam on the asphalt in front of the car
    const beamGrad = ctx.createRadialGradient(140, 192, 15, 140, 145, 95);
    if (mode === 'green') {
      beamGrad.addColorStop(0, 'rgba(74, 222, 128, 0.18)');
      beamGrad.addColorStop(1, 'rgba(20, 83, 45, 0)');
    } else {
      beamGrad.addColorStop(0, 'rgba(254, 240, 138, 0.20)');
      beamGrad.addColorStop(1, 'rgba(30, 41, 59, 0)');
    }
    ctx.fillStyle = beamGrad;
    ctx.beginPath();
    ctx.moveTo(70, 192);
    ctx.lineTo(210, 192);
    ctx.lineTo(165, hy + 18);
    ctx.lineTo(115, hy + 18);
    ctx.closePath();
    ctx.fill();
  }

  private drawPylons(ctx: CanvasRenderingContext2D, engine: NightDriverEngine, mode: MonitorMode) {
    const primaryPylonColor = mode === 'green' ? '#86efac' : '#ffffff';
    const accentPylonColor = mode === 'green' ? '#22c55e' : '#f97316';
    const postColor = mode === 'green' ? '#15803d' : '#94a3b8';

    // Draw from farthest to nearest
    for (const p of engine.pylons) {
      if (p.z <= NightDriverEngine.Z_NEAR) continue;

      // Normalized depth from 0 (at car) to 1 (at horizon)
      const normZ = Math.max(0, Math.min(1, (p.z - NightDriverEngine.Z_NEAR) / (NightDriverEngine.Z_FAR - NightDriverEngine.Z_NEAR)));

      // Perspective Y position
      const y = 192 - (192 - NightDriverEngine.HORIZON_Y) * Math.pow(normZ, 0.65);
      if (y < NightDriverEngine.HORIZON_Y || y > 192) continue;

      // Perspective scale factor
      const scale = Math.pow(1 - normZ, 1.8);

      // Road half-width
      const roadHalfWidth = 16 + scale * 115;

      // Curvature displacement
      const curveOffset = engine.currentCurve * Math.pow(normZ, 1.5) * 85;

      // Road center on screen
      const roadCenterX = 140 - engine.carX * (scale * 80) + curveOffset;

      const leftX = roadCenterX - roadHalfWidth;
      const rightX = roadCenterX + roadHalfWidth;

      const pylonH = Math.max(2, Math.floor(scale * 16));
      const pylonW = Math.max(2, Math.floor(scale * 4.5));
      const capH = Math.max(1, Math.floor(pylonH * 0.4));

      // Left Reflector Pylon
      if (leftX >= -15 && leftX <= 295) {
        // Lower post
        ctx.fillStyle = postColor;
        ctx.fillRect(Math.floor(leftX - pylonW / 2), Math.floor(y - pylonH), pylonW, pylonH);

        // Reflective top cap (glints brightly in headlights)
        ctx.fillStyle = p.z < 350 ? primaryPylonColor : accentPylonColor;
        ctx.fillRect(Math.floor(leftX - pylonW / 2), Math.floor(y - pylonH), pylonW, capH);
      }

      // Right Reflector Pylon
      if (rightX >= -15 && rightX <= 295) {
        // Lower post
        ctx.fillStyle = postColor;
        ctx.fillRect(Math.floor(rightX - pylonW / 2), Math.floor(y - pylonH), pylonW, pylonH);

        // Reflective top cap
        ctx.fillStyle = p.z < 350 ? primaryPylonColor : accentPylonColor;
        ctx.fillRect(Math.floor(rightX - pylonW / 2), Math.floor(y - pylonH), pylonW, capH);
      }
    }
  }

  private drawRoadsideObjects(ctx: CanvasRenderingContext2D, engine: NightDriverEngine, mode: MonitorMode) {
    const treeColor = mode === 'green' ? '#166534' : '#14532d';
    const trunkColor = mode === 'green' ? '#14532d' : '#78350f';

    for (const p of engine.pylons) {
      if (p.z <= NightDriverEngine.Z_NEAR) continue;

      const normZ = Math.max(0, Math.min(1, (p.z - NightDriverEngine.Z_NEAR) / (NightDriverEngine.Z_FAR - NightDriverEngine.Z_NEAR)));
      const y = 192 - (192 - NightDriverEngine.HORIZON_Y) * Math.pow(normZ, 0.65);
      if (y < NightDriverEngine.HORIZON_Y || y > 192) continue;

      const scale = Math.pow(1 - normZ, 1.8);
      const roadHalfWidth = 16 + scale * 115;
      const curveOffset = engine.currentCurve * Math.pow(normZ, 1.5) * 85;
      const roadCenterX = 140 - engine.carX * (scale * 80) + curveOffset;

      const treeScale = Math.max(3, scale * 26);

      // Left roadside pine tree
      if (p.hasTreeLeft) {
        const tx = roadCenterX - roadHalfWidth - treeScale * 1.4;
        if (tx > -30 && tx < 310) {
          // Trunk
          ctx.fillStyle = trunkColor;
          ctx.fillRect(Math.floor(tx + treeScale * 0.4), Math.floor(y - treeScale * 0.3), Math.max(1, treeScale * 0.2), treeScale * 0.3);

          // Foliage triangle
          ctx.fillStyle = treeColor;
          ctx.beginPath();
          ctx.moveTo(tx + treeScale * 0.5, y - treeScale * 1.2);
          ctx.lineTo(tx, y - treeScale * 0.3);
          ctx.lineTo(tx + treeScale, y - treeScale * 0.3);
          ctx.closePath();
          ctx.fill();
        }
      }

      // Right roadside pine tree
      if (p.hasTreeRight) {
        const tx = roadCenterX + roadHalfWidth + treeScale * 0.6;
        if (tx > -30 && tx < 310) {
          // Trunk
          ctx.fillStyle = trunkColor;
          ctx.fillRect(Math.floor(tx + treeScale * 0.4), Math.floor(y - treeScale * 0.3), Math.max(1, treeScale * 0.2), treeScale * 0.3);

          // Foliage
          ctx.fillStyle = treeColor;
          ctx.beginPath();
          ctx.moveTo(tx + treeScale * 0.5, y - treeScale * 1.2);
          ctx.lineTo(tx, y - treeScale * 0.3);
          ctx.lineTo(tx + treeScale, y - treeScale * 0.3);
          ctx.closePath();
          ctx.fill();
        }
      }
    }
  }

  private drawOncomingTraffic(ctx: CanvasRenderingContext2D, engine: NightDriverEngine, mode: MonitorMode) {
    for (const car of engine.oncomingCars) {
      if (car.z <= NightDriverEngine.Z_NEAR) continue;

      const normZ = Math.max(0, Math.min(1, (car.z - NightDriverEngine.Z_NEAR) / (NightDriverEngine.Z_FAR - NightDriverEngine.Z_NEAR)));
      const y = 192 - (192 - NightDriverEngine.HORIZON_Y) * Math.pow(normZ, 0.65);
      if (y < NightDriverEngine.HORIZON_Y || y > 192) continue;

      const scale = Math.pow(1 - normZ, 1.8);
      const roadHalfWidth = 16 + scale * 115;
      const curveOffset = engine.currentCurve * Math.pow(normZ, 1.5) * 85;
      const roadCenterX = 140 - engine.carX * (scale * 80) + curveOffset;

      const cx = roadCenterX + car.laneOffset * roadHalfWidth * 0.75;
      const carW = Math.max(5, Math.floor(scale * 38));
      const carH = Math.max(3, Math.floor(scale * 18));

      const leftLightX = cx - carW * 0.32;
      const rightLightX = cx + carW * 0.32;

      // Car body silhouette
      ctx.fillStyle = mode === 'green' ? '#14532d' : (car.color === 'yellow' ? '#ca8a04' : '#b91c1c');
      ctx.fillRect(Math.floor(cx - carW / 2), Math.floor(y - carH), carW, carH);

      // Cabin roof
      ctx.fillStyle = mode === 'green' ? '#052e16' : '#1e293b';
      ctx.fillRect(Math.floor(cx - carW * 0.3), Math.floor(y - carH * 1.35), Math.floor(carW * 0.6), Math.floor(carH * 0.45));

      // Glowing headlights
      const lightRadius = Math.max(1.2, Math.floor(scale * 4.0));
      ctx.fillStyle = mode === 'green' ? '#bbf7d0' : '#fef08a';
      ctx.beginPath();
      ctx.arc(leftLightX, y - carH * 0.4, lightRadius, 0, Math.PI * 2);
      ctx.arc(rightLightX, y - carH * 0.4, lightRadius, 0, Math.PI * 2);
      ctx.fill();

      // Headlight glare beams on camera when close
      if (car.z < 300) {
        ctx.fillStyle = mode === 'green' ? 'rgba(187, 247, 208, 0.18)' : 'rgba(254, 240, 138, 0.22)';
        ctx.beginPath();
        ctx.moveTo(leftLightX, y - carH * 0.4);
        ctx.lineTo(leftLightX - scale * 25, y + scale * 40);
        ctx.lineTo(leftLightX + scale * 10, y + scale * 40);
        ctx.closePath();
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(rightLightX, y - carH * 0.4);
        ctx.lineTo(rightLightX - scale * 10, y + scale * 40);
        ctx.lineTo(rightLightX + scale * 25, y + scale * 40);
        ctx.closePath();
        ctx.fill();
      }
    }
  }

  private drawCarHood(ctx: CanvasRenderingContext2D, engine: NightDriverEngine, mode: MonitorMode) {
    const steer = engine.steerAngle;
    const hoodOffset = steer * 7;

    // Cockpit base & hood contour
    const hoodColor = mode === 'green' ? '#14532d' : '#1e3a8a';
    const hoodHighlight = mode === 'green' ? '#22c55e' : '#3b82f6';
    const hoodDark = mode === 'green' ? '#052e16' : '#0f172a';

    // Sleek sports car nose (fits cleanly within the lane between pylons)
    ctx.fillStyle = hoodColor;
    ctx.beginPath();
    ctx.moveTo(82 + hoodOffset, 192);
    ctx.lineTo(112 + hoodOffset, 162);
    ctx.lineTo(168 + hoodOffset, 162);
    ctx.lineTo(198 + hoodOffset, 192);
    ctx.closePath();
    ctx.fill();

    // Center power bulge & bonnet lines
    ctx.strokeStyle = hoodHighlight;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(126 + hoodOffset, 162);
    ctx.lineTo(120 + hoodOffset, 192);
    ctx.moveTo(154 + hoodOffset, 162);
    ctx.lineTo(160 + hoodOffset, 192);
    ctx.stroke();

    // Hood nose air scoop
    ctx.fillStyle = hoodDark;
    ctx.fillRect(128 + hoodOffset, 162, 24, 3);

    // Instrument cowl / hood reflection
    ctx.strokeStyle = hoodHighlight;
    ctx.beginPath();
    ctx.moveTo(112 + hoodOffset, 162);
    ctx.lineTo(168 + hoodOffset, 162);
    ctx.stroke();

    // Hood corner reflector rivets
    ctx.fillStyle = mode === 'green' ? '#4ade80' : '#f59e0b';
    ctx.fillRect(113 + hoodOffset, 163, 2, 2);
    ctx.fillRect(165 + hoodOffset, 163, 2, 2);
  }

  private drawCrashFX(ctx: CanvasRenderingContext2D, mode: MonitorMode) {
    // Intense crash sparks and CRT static burst
    const sparkColor = mode === 'green' ? '#86efac' : '#ef4444';
    ctx.fillStyle = sparkColor;

    for (let i = 0; i < 24; i++) {
      const sx = 140 + (Math.random() - 0.5) * 200;
      const sy = 160 + (Math.random() - 0.5) * 50;
      const sw = Math.floor(Math.random() * 4) + 1;
      const sh = Math.floor(Math.random() * 4) + 1;
      ctx.fillRect(sx, sy, sw, sh);
    }
  }

  private drawCrtEffects(ctx: CanvasRenderingContext2D, mode: MonitorMode) {
    // Subtle Apple II phosphor scanlines
    ctx.fillStyle = mode === 'green' ? 'rgba(0, 20, 5, 0.15)' : 'rgba(0, 0, 0, 0.18)';
    for (let y = 0; y < 192; y += 2) {
      ctx.fillRect(0, y, 280, 1);
    }

    // Phosphor glow vignette border
    const vigGrad = ctx.createRadialGradient(140, 96, 100, 140, 96, 175);
    vigGrad.addColorStop(0, 'rgba(0,0,0,0)');
    vigGrad.addColorStop(1, mode === 'green' ? 'rgba(4, 30, 10, 0.45)' : 'rgba(0, 0, 0, 0.55)');
    ctx.fillStyle = vigGrad;
    ctx.fillRect(0, 0, 280, 192);
  }
}
