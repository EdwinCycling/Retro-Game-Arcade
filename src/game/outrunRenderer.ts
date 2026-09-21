/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Sega OutRun (1986) - Canvas 2D Pseudo-3D Road & Sprite Renderer
 */

import {
  RoadSegment,
  TrafficCar,
  CAMERA_HEIGHT,
  CAMERA_DEPTH,
  ROAD_WIDTH,
  DRAW_DISTANCE,
  SEGMENT_LENGTH,
  STAGE_CONFIGS,
  StageId
} from './outrunTypes';
import { OutrunEngine } from './outrunEngine';

export class OutrunRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  public crtFilter: boolean = true;
  private skyOffset: number = 0;
  private hillsOffset: number = 0;
  private windmillAngle: number = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
  }

  // Safe roundRect implementation that never throws on older/embedded canvas engines
  private roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number = 0) {
    const radius = Math.max(0, Math.min(r, Math.abs(w) / 2, Math.abs(h) / 2));
    if (typeof (ctx as unknown as { roundRect?: Function }).roundRect === 'function') {
      try {
        (ctx as unknown as { roundRect: Function }).roundRect(x, y, w, h, radius);
        return;
      } catch {
        // Fall back to quadratic curves
      }
    }
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + w - radius, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
    ctx.lineTo(x + w, y + h - radius);
    ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
    ctx.lineTo(x + radius, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
  }

  public render(engine: OutrunEngine) {
    const ctx = this.ctx;
    const width = this.canvas.width;
    const height = this.canvas.height;
    this.windmillAngle += 0.03;

    // Get current stage config
    const currentSegment = engine.findSegment(engine.player.z);
    const stageId: StageId = currentSegment?.stageId || engine.currentStageId || 'coconut_beach';
    const stageCfg = STAGE_CONFIGS[stageId] || STAGE_CONFIGS.coconut_beach;

    // Camera setup
    const playerZ = engine.player.z;
    const cameraHeight = CAMERA_HEIGHT + engine.player.bounceOffset;
    const baseSegment = currentSegment;
    const startPos = Math.floor(playerZ / SEGMENT_LENGTH) % engine.totalSegments;
    const playerX = engine.player.x;

    // Track rendering horizon & background
    const horizon = Math.round(height * 0.44);

    // 1. SKY & TERRAIN BACKGROUND
    // Never leave black behind: fill upper sky and lower ground completely
    this.renderBackground(ctx, width, height, horizon, engine, stageCfg);

    // 2. PASS 1: CURVE ACCUMULATION & SEGMENT 3D PROJECTION
    // Accumulate horizontal curvature along depth to create natural snake-like curves
    let dx = -(baseSegment.curve * ((playerZ % SEGMENT_LENGTH) / SEGMENT_LENGTH));
    let accumulatedX = 0;
    let maxY = height; // Occlusion clipping line starting at bottom of screen

    const visibleSegments: RoadSegment[] = [];

    for (let n = 0; n < DRAW_DISTANCE; n++) {
      const segIdx = (startPos + n) % engine.totalSegments;
      const segment = engine.segments[segIdx];
      const looped = segIdx < startPos;
      const cameraZ = playerZ - (looped ? engine.trackLength : 0);

      // Project segment world coordinates with accumulated curve
      segment.p1.world.x = accumulatedX;
      accumulatedX += dx;
      dx += segment.curve;
      segment.p2.world.x = accumulatedX;

      this.project(
        segment.p1,
        playerX * ROAD_WIDTH,
        cameraHeight + baseSegment.p1.world.y,
        cameraZ,
        width,
        height
      );

      this.project(
        segment.p2,
        playerX * ROAD_WIDTH,
        cameraHeight + baseSegment.p1.world.y,
        cameraZ,
        width,
        height
      );

      // Clip behind camera
      if (segment.p1.screen.scale <= 0) {
        continue;
      }

      // If segment top is completely off-screen below, skip
      if (segment.p2.screen.y >= height) {
        continue;
      }

      // If segment top is below or equal to maxY, it's occluded behind a hill crest
      if (segment.p2.screen.y >= maxY) {
        continue;
      }

      // Draw road polygon with rumble strips and lanes
      this.renderSegment(ctx, width, segment, stageCfg);
      maxY = segment.p2.screen.y;
      visibleSegments.push(segment);
    }

    // 3. PASS 2: SPRITES, ROADSIDE SCENERY & TRAFFIC (Back to Front)
    for (let n = visibleSegments.length - 1; n >= 0; n--) {
      const segment = visibleSegments[n];

      // Scenery sprites
      for (const sprite of segment.sprites) {
        this.renderScenery(ctx, width, height, segment, sprite);
      }

      // Traffic cars
      for (const car of engine.traffic) {
        const carSegIdx = Math.floor(car.z / SEGMENT_LENGTH) % engine.totalSegments;
        if (carSegIdx === segment.index) {
          this.renderTrafficCar(ctx, width, height, segment, car);
        }
      }
    }

    // 4. PLAYER'S FERRARI TESTAROSSA SPIDER (16-Bit Pixel-Crafted)
    this.renderPlayerFerrari(ctx, width, height, engine);

    // 5. START COUNTDOWN (3, 2, 1, GO!)
    if (engine.startCountdown > 0) {
      this.renderCountdown(ctx, width, height, engine);
    }

    // 6. ARCADE HUD & MINI-PYRAMID ROUTE MAP
    this.renderHUD(ctx, width, height, engine);

    // 7. TITLE / GAMEOVER / CLEAR OVERLAYS
    this.renderGameStates(ctx, width, height, engine);

    // 8. CRT SCANLINES
    if (this.crtFilter) {
      this.renderCRT(ctx, width, height);
    }
  }

  // 3D Perspective Projection
  private project(
    p: { world: { x: number; y: number; z: number }; screen: { x: number; y: number; w: number; scale: number } },
    cameraX: number,
    cameraY: number,
    cameraZ: number,
    width: number,
    height: number
  ) {
    const transZ = p.world.z - cameraZ;
    p.screen.scale = CAMERA_DEPTH / (transZ <= 0 ? 0.0001 : transZ);
    p.screen.x = Math.round((width / 2) + (p.screen.scale * (p.world.x - cameraX) * (width / 2)));
    p.screen.y = Math.round((height / 2) - (p.screen.scale * (p.world.y - cameraY) * (height / 2)));
    p.screen.w = Math.round(p.screen.scale * ROAD_WIDTH * (width / 2));
  }

  // Background sky, ocean, mountains, and complete ground fill (No black holes)
  private renderBackground(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    horizon: number,
    engine: OutrunEngine,
    stageCfg: typeof STAGE_CONFIGS['coconut_beach']
  ) {
    // 1. SKY GRADIENT
    const skyGrad = ctx.createLinearGradient(0, 0, 0, horizon);
    skyGrad.addColorStop(0, stageCfg.skyTop);
    skyGrad.addColorStop(1, stageCfg.skyBottom);
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, width, horizon);

    // 2. SUN / HAZE
    ctx.save();
    if (stageCfg.id === 'desert') {
      // Golden desert sun
      const sunGrad = ctx.createRadialGradient(width * 0.7, horizon * 0.45, 10, width * 0.7, horizon * 0.45, 120);
      sunGrad.addColorStop(0, 'rgba(255, 240, 200, 0.9)');
      sunGrad.addColorStop(0.3, 'rgba(255, 160, 50, 0.6)');
      sunGrad.addColorStop(1, 'rgba(255, 120, 0, 0)');
      ctx.fillStyle = sunGrad;
      ctx.beginPath();
      ctx.arc(width * 0.7, horizon * 0.45, 120, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Brilliant OutRun midday sun
      const sunGrad = ctx.createRadialGradient(width * 0.75, horizon * 0.35, 15, width * 0.75, horizon * 0.35, 90);
      sunGrad.addColorStop(0, 'rgba(255, 255, 255, 1)');
      sunGrad.addColorStop(0.35, 'rgba(255, 235, 150, 0.7)');
      sunGrad.addColorStop(1, 'rgba(255, 200, 100, 0)');
      ctx.fillStyle = sunGrad;
      ctx.beginPath();
      ctx.arc(width * 0.75, horizon * 0.35, 90, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // 3. PARALLAX HORIZON & MOUNTAINS
    const baseSegment = engine.findSegment(engine.player.z);
    this.hillsOffset += (baseSegment?.curve || 0) * (engine.player.speed / 293) * 0.005;

    ctx.save();
    if (stageCfg.hasOcean) {
      // Coconut Beach: Sparkling turquoise ocean strip on horizon
      const oceanH = Math.round(horizon * 0.18);
      const oceanY = horizon - oceanH;
      const oceanGrad = ctx.createLinearGradient(0, oceanY, 0, horizon);
      oceanGrad.addColorStop(0, '#0088cc');
      oceanGrad.addColorStop(0.5, '#00b4d8');
      oceanGrad.addColorStop(1, '#90e0ef');
      ctx.fillStyle = oceanGrad;
      ctx.fillRect(0, oceanY, width, oceanH);

      // Gentle white ocean wave lines
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      for (let i = 0; i < 4; i++) {
        const wy = oceanY + (oceanH * (i + 1) / 5) + Math.sin(Date.now() / 400 + i) * 1.5;
        ctx.fillRect(0, wy, width, 1.5);
      }
    } else if (stageCfg.mountainType === 'alpine_peaks') {
      // Alps: Majestic snowcapped blue/white peaks
      ctx.fillStyle = '#4a75a0';
      for (let i = -1; i < 8; i++) {
        const peakX = ((i * 180 + this.hillsOffset * 40) % (width + 360)) - 100;
        ctx.beginPath();
        ctx.moveTo(peakX, horizon);
        ctx.lineTo(peakX + 90, horizon - 55);
        ctx.lineTo(peakX + 180, horizon);
        ctx.fill();

        // Snowcap
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.moveTo(peakX + 65, horizon - 40);
        ctx.lineTo(peakX + 90, horizon - 55);
        ctx.lineTo(peakX + 115, horizon - 40);
        ctx.lineTo(peakX + 90, horizon - 35);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#4a75a0';
      }
    } else if (stageCfg.mountainType === 'desert_mesas') {
      // Desert: Red-rock plateau mesas
      ctx.fillStyle = '#994422';
      for (let i = -1; i < 6; i++) {
        const mesaX = ((i * 240 + this.hillsOffset * 30) % (width + 400)) - 120;
        ctx.beginPath();
        ctx.moveTo(mesaX, horizon);
        ctx.lineTo(mesaX + 40, horizon - 45);
        ctx.lineTo(mesaX + 180, horizon - 45);
        ctx.lineTo(mesaX + 220, horizon);
        ctx.fill();
      }
    } else {
      // Rolling green European countryside hills (Gateway)
      ctx.fillStyle = '#3f7324';
      ctx.beginPath();
      ctx.moveTo(0, horizon);
      for (let x = 0; x <= width; x += 40) {
        const hy = horizon - 28 - Math.sin((x * 0.01) + this.hillsOffset) * 18;
        ctx.lineTo(x, hy);
      }
      ctx.lineTo(width, horizon);
      ctx.fill();
    }
    ctx.restore();

    // 4. CRITICAL: COMPLETE GROUND FILL BELOW HORIZON
    // This completely eliminates any black borders or gaps between clipped segments!
    ctx.fillStyle = stageCfg.groundColorLight;
    ctx.fillRect(0, horizon, width, height - horizon);
  }

  // Draw 3D road segment with rumble strips, lane markings and fork medians
  private renderSegment(
    ctx: CanvasRenderingContext2D,
    width: number,
    segment: RoadSegment,
    stageCfg: typeof STAGE_CONFIGS['coconut_beach']
  ) {
    const p1 = segment.p1.screen;
    const p2 = segment.p2.screen;

    // Roadside grass polygon for this specific strip
    ctx.fillStyle = segment.color.grass;
    ctx.fillRect(0, p2.y, width, p1.y - p2.y);

    const r1 = p1.w / 6.5; // Rumble width
    const r2 = p2.w / 6.5;
    const l1 = p1.w / 34;  // Lane divider
    const l2 = p2.w / 34;

    // Fork in the road: widen road & add branching median
    if (segment.isFork && segment.forkProgress !== undefined) {
      const forkFactor = 1 + segment.forkProgress * 0.65;
      const w1 = p1.w * forkFactor;
      const w2 = p2.w * forkFactor;

      // Road asphalt surface
      ctx.fillStyle = segment.color.road;
      this.drawPolygon(ctx, p1.x - w1, p1.y, p1.x + w1, p1.y, p2.x + w2, p2.y, p2.x - w2, p2.y);

      // Outer Rumble strips
      ctx.fillStyle = segment.color.rumble;
      this.drawPolygon(ctx, p1.x - w1 - r1, p1.y, p1.x - w1, p1.y, p2.x - w2, p2.y, p2.x - w2 - r2, p2.y);
      this.drawPolygon(ctx, p1.x + w1, p1.y, p1.x + w1 + r1, p1.y, p2.x + w2 + r2, p2.y, p2.x + w2, p2.y);

      // Center Branching Fork Island (V-divider)
      const splitW1 = (segment.forkProgress * w1 * 0.45);
      const splitW2 = (segment.forkProgress * w2 * 0.45);
      if (splitW1 > 2) {
        // Yellow & Black chevron median
        ctx.fillStyle = (segment.index % 2 === 0) ? '#ffcc00' : '#222222';
        this.drawPolygon(ctx, p1.x - splitW1, p1.y, p1.x + splitW1, p1.y, p2.x + splitW2, p2.y, p2.x - splitW2, p2.y);
      }
      return;
    }

    // Standard road asphalt
    ctx.fillStyle = segment.color.road;
    this.drawPolygon(ctx, p1.x - p1.w, p1.y, p1.x + p1.w, p1.y, p2.x + p2.w, p2.y, p2.x - p2.w, p2.y);

    // Rumble strips (red & white alternating kerbs)
    ctx.fillStyle = segment.color.rumble;
    this.drawPolygon(ctx, p1.x - p1.w - r1, p1.y, p1.x - p1.w, p1.y, p2.x - p2.w, p2.y, p2.x - p2.w - r2, p2.y);
    this.drawPolygon(ctx, p1.x + p1.w, p1.y, p1.x + p1.w + r1, p1.y, p2.x + p2.w + r2, p2.y, p2.x + p2.w, p2.y);

    // Lane dividers (3-lane Sega OutRun road = 2 dashed white lane strips)
    if (segment.color.lane !== 'transparent') {
      ctx.fillStyle = segment.color.lane;
      const laneOffset1 = p1.w * 0.38;
      const laneOffset2 = p2.w * 0.38;

      // Left divider
      this.drawPolygon(ctx, p1.x - laneOffset1 - l1, p1.y, p1.x - laneOffset1 + l1, p1.y, p2.x - laneOffset2 + l2, p2.y, p2.x - laneOffset2 - l2, p2.y);
      // Right divider
      this.drawPolygon(ctx, p1.x + laneOffset1 - l1, p1.y, p1.x + laneOffset1 + l1, p1.y, p2.x + laneOffset2 + l2, p2.y, p2.x + laneOffset2 - l2, p2.y);
    }
  }

  private drawPolygon(
    ctx: CanvasRenderingContext2D,
    x1: number, y1: number,
    x2: number, y2: number,
    x3: number, y3: number,
    x4: number, y4: number
  ) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.lineTo(x3, y3);
    ctx.lineTo(x4, y4);
    ctx.closePath();
    ctx.fill();
  }

  // Render scenery sprites (Palm trees, Roman Aqueduct, Windmills, Billboards, Start & Checkpoint arches)
  private renderScenery(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    segment: RoadSegment,
    scenery: { z: number; offset: number; sprite: string }
  ) {
    const scale = segment.p1.screen.scale;
    if (scale <= 0) return;

    const spriteX = segment.p1.screen.x + (scale * scenery.offset * ROAD_WIDTH * (width / 2));
    const spriteY = segment.p1.screen.y;

    ctx.save();
    ctx.translate(spriteX, spriteY);

    switch (scenery.sprite) {
      case 'palm_tree': {
        // Authentic curved Sega palm tree
        const treeH = 340 * scale * (width / 2);
        const treeW = 190 * scale * (width / 2);

        // Brown scaly segmented trunk
        ctx.strokeStyle = '#6f4e24';
        ctx.lineWidth = Math.max(3, 14 * scale * (width / 2));
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(scenery.offset < 0 ? -treeW * 0.3 : treeW * 0.3, -treeH * 0.6, 0, -treeH);
        ctx.stroke();

        // Lush green fronds fan
        ctx.fillStyle = '#1c7428';
        for (let i = 0; i < 7; i++) {
          const angle = -Math.PI * 0.85 + (i * Math.PI * 0.28);
          const leafLen = treeW * 0.75;
          ctx.beginPath();
          ctx.moveTo(0, -treeH);
          ctx.quadraticCurveTo(Math.cos(angle) * leafLen, -treeH + Math.sin(angle) * leafLen, Math.cos(angle) * leafLen * 0.8, -treeH + 20);
          ctx.lineTo(0, -treeH);
          ctx.fill();
        }
        // Bright green highlights
        ctx.fillStyle = '#44aa33';
        for (let i = 0; i < 5; i++) {
          const angle = -Math.PI * 0.75 + (i * Math.PI * 0.35);
          const leafLen = treeW * 0.5;
          ctx.beginPath();
          ctx.arc(Math.cos(angle) * leafLen, -treeH + Math.sin(angle) * leafLen * 0.4, 8 * scale * (width / 2), 0, Math.PI * 2);
          ctx.fill();
        }
        break;
      }

      case 'aqueduct_arch': {
        // Grand Roman Aqueduct arch spanning above the road (Gateway)
        const archW = segment.p1.screen.w * 2.4;
        const archH = 280 * scale * (width / 2);

        // Stone pillars
        ctx.fillStyle = '#a89f91';
        ctx.fillRect(-archW / 2, -archH, archW * 0.16, archH);
        ctx.fillRect(archW / 2 - archW * 0.16, -archH, archW * 0.16, archH);

        // Stone horizontal aqueduct trough
        ctx.fillRect(-archW / 2, -archH, archW, archH * 0.35);

        // Stone arch curve cutout
        ctx.fillStyle = '#000000'; // Dark inner arch
        ctx.beginPath();
        ctx.arc(0, -archH * 0.45, archW * 0.34, Math.PI, 0);
        ctx.fill();

        // Stone brick seams
        ctx.strokeStyle = '#686055';
        ctx.lineWidth = Math.max(1, 2 * scale * (width / 2));
        ctx.strokeRect(-archW / 2, -archH, archW, archH * 0.35);
        break;
      }

      case 'aqueduct_pillar': {
        const pilW = 80 * scale * (width / 2);
        const pilH = 260 * scale * (width / 2);
        ctx.fillStyle = '#b5ac9d';
        ctx.fillRect(-pilW / 2, -pilH, pilW, pilH);
        ctx.fillStyle = '#8f8677';
        ctx.fillRect(-pilW / 2, -pilH, pilW * 0.25, pilH);
        break;
      }

      case 'windmill': {
        // Authentic Dutch stone windmill with rotating sails (Alps)
        const millW = 140 * scale * (width / 2);
        const millH = 260 * scale * (width / 2);

        // Brick tower
        ctx.fillStyle = '#cfc5b4';
        ctx.beginPath();
        ctx.moveTo(-millW * 0.4, 0);
        ctx.lineTo(-millW * 0.25, -millH);
        ctx.lineTo(millW * 0.25, -millH);
        ctx.lineTo(millW * 0.4, 0);
        ctx.closePath();
        ctx.fill();

        // Cone cap
        ctx.fillStyle = '#802222';
        ctx.beginPath();
        ctx.moveTo(-millW * 0.28, -millH);
        ctx.lineTo(0, -millH - millH * 0.2);
        ctx.lineTo(millW * 0.28, -millH);
        ctx.closePath();
        ctx.fill();

        // Rotating sails
        ctx.save();
        ctx.translate(0, -millH * 0.85);
        ctx.rotate(this.windmillAngle);
        ctx.strokeStyle = '#3d2514';
        ctx.lineWidth = Math.max(2, 4 * scale * (width / 2));
        ctx.fillStyle = 'rgba(240, 240, 230, 0.85)';

        for (let i = 0; i < 4; i++) {
          ctx.rotate(Math.PI / 2);
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(0, -millH * 0.7);
          ctx.stroke();
          ctx.fillRect(2, -millH * 0.65, millW * 0.2, millH * 0.55);
        }
        ctx.restore();
        break;
      }

      case 'cactus': {
        // Saguaro Desert Cactus
        const cacW = 90 * scale * (width / 2);
        const cacH = 220 * scale * (width / 2);
        ctx.fillStyle = '#2d7335';
        ctx.fillRect(-cacW * 0.12, -cacH, cacW * 0.24, cacH);
        // Left arm
        ctx.fillRect(-cacW * 0.45, -cacH * 0.6, cacW * 0.35, cacH * 0.15);
        ctx.fillRect(-cacW * 0.45, -cacH * 0.85, cacW * 0.16, cacH * 0.3);
        // Right arm
        ctx.fillRect(cacW * 0.12, -cacH * 0.45, cacW * 0.35, cacH * 0.15);
        ctx.fillRect(cacW * 0.32, -cacH * 0.7, cacW * 0.16, cacH * 0.3);
        break;
      }

      case 'flower_patch': {
        const patchW = 120 * scale * (width / 2);
        ctx.fillStyle = '#ffdd00';
        for (let i = 0; i < 6; i++) {
          ctx.beginPath();
          ctx.arc(-patchW / 2 + (i * patchW / 5), -8, 6 * scale * (width / 2), 0, Math.PI * 2);
          ctx.fill();
        }
        break;
      }

      case 'billboard_sega': {
        const bW = 220 * scale * (width / 2);
        const bH = 120 * scale * (width / 2);
        // Posts
        ctx.fillStyle = '#888888';
        ctx.fillRect(-bW * 0.35, -bH, 8 * scale * (width / 2), bH);
        ctx.fillRect(bW * 0.35, -bH, 8 * scale * (width / 2), bH);
        // Board
        ctx.fillStyle = '#0044aa';
        ctx.fillRect(-bW / 2, -bH - bH * 0.85, bW, bH * 0.85);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = Math.max(2, 3 * scale * (width / 2));
        ctx.strokeRect(-bW / 2, -bH - bH * 0.85, bW, bH * 0.85);

        ctx.fillStyle = '#ffffff';
        ctx.font = `bold ${Math.round(26 * scale * (width / 2))}px "Press Start 2P", monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('SEGA', 0, -bH - bH * 0.42);
        break;
      }

      case 'billboard_outrun': {
        const bW = 240 * scale * (width / 2);
        const bH = 130 * scale * (width / 2);
        ctx.fillStyle = '#888888';
        ctx.fillRect(-bW * 0.35, -bH, 8 * scale * (width / 2), bH);
        ctx.fillRect(bW * 0.35, -bH, 8 * scale * (width / 2), bH);

        ctx.fillStyle = '#ff2200';
        ctx.fillRect(-bW / 2, -bH - bH * 0.85, bW, bH * 0.85);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = Math.max(2, 3 * scale * (width / 2));
        ctx.strokeRect(-bW / 2, -bH - bH * 0.85, bW, bH * 0.85);

        ctx.fillStyle = '#ffff00';
        ctx.font = `bold ${Math.round(20 * scale * (width / 2))}px "Press Start 2P", monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('OutRun', 0, -bH - bH * 0.42);
        break;
      }

      case 'start_banner': {
        // Authentic Sega OutRun Start Gantry with 3-lamp traffic signal & checkered banner
        const archW = segment.p1.screen.w * 2.3;
        const archH = 260 * scale * (width / 2);

        // Truss posts
        ctx.fillStyle = '#dddddd';
        ctx.fillRect(-archW / 2, -archH, archW * 0.05, archH);
        ctx.fillRect(archW / 2 - archW * 0.05, -archH, archW * 0.05, archH);

        // Header truss banner
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(-archW / 2, -archH, archW, archH * 0.35);

        // Sega OutRun Banner Text
        ctx.fillStyle = '#ff1100';
        ctx.font = `bold ${Math.round(22 * scale * (width / 2))}px "Press Start 2P", monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('START', 0, -archH + archH * 0.17);

        // Hanging 3-lamp traffic light
        const lightBoxW = 70 * scale * (width / 2);
        const lightBoxH = 26 * scale * (width / 2);
        ctx.fillStyle = '#111111';
        ctx.fillRect(-lightBoxW / 2, -archH + archH * 0.35, lightBoxW, lightBoxH);

        // Red, Yellow, Green bulbs
        ctx.fillStyle = '#ff2200';
        ctx.beginPath();
        ctx.arc(-lightBoxW * 0.3, -archH + archH * 0.35 + lightBoxH / 2, lightBoxH * 0.35, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffcc00';
        ctx.beginPath();
        ctx.arc(0, -archH + archH * 0.35 + lightBoxH / 2, lightBoxH * 0.35, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#00ff44';
        ctx.beginPath();
        ctx.arc(lightBoxW * 0.3, -archH + archH * 0.35 + lightBoxH / 2, lightBoxH * 0.35, 0, Math.PI * 2);
        ctx.fill();
        break;
      }

      case 'checkpoint_arch': {
        // Authentic OutRun Checkpoint Arch
        const archW = segment.p1.screen.w * 2.3;
        const archH = 260 * scale * (width / 2);

        // Posts
        ctx.fillStyle = '#e67e22';
        ctx.fillRect(-archW / 2, -archH, archW * 0.05, archH);
        ctx.fillRect(archW / 2 - archW * 0.05, -archH, archW * 0.05, archH);

        // Banner
        ctx.fillStyle = '#f39c12';
        ctx.fillRect(-archW / 2, -archH, archW, archH * 0.36);

        ctx.fillStyle = '#ffffff';
        ctx.font = `bold ${Math.round(20 * scale * (width / 2))}px "Press Start 2P", monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('CHECKPOINT', 0, -archH + archH * 0.18);
        break;
      }

      case 'fork_gantry': {
        // Authentic Route Selection Gantry: LEFT vs RIGHT
        const gantryW = segment.p1.screen.w * 2.6;
        const gantryH = 280 * scale * (width / 2);

        // Support pillars
        ctx.fillStyle = '#333333';
        ctx.fillRect(-gantryW / 2, -gantryH, gantryW * 0.04, gantryH);
        ctx.fillRect(gantryW / 2 - gantryW * 0.04, -gantryH, gantryW * 0.04, gantryH);

        // Green Highway Route Board
        ctx.fillStyle = '#0b6623';
        ctx.fillRect(-gantryW / 2, -gantryH, gantryW, gantryH * 0.38);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = Math.max(2, 3 * scale * (width / 2));
        ctx.strokeRect(-gantryW / 2, -gantryH, gantryW, gantryH * 0.38);

        // White divider in center of route board
        ctx.beginPath();
        ctx.moveTo(0, -gantryH);
        ctx.lineTo(0, -gantryH + gantryH * 0.38);
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        const fontSize = Math.max(9, Math.round(14 * scale * (width / 2)));
        ctx.font = `bold ${fontSize}px "Press Start 2P", monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        const leftLabel = segment.forkLeftLabel || 'GATEWAY';
        const rightLabel = segment.forkRightLabel || 'DESERT';

        ctx.fillText(`◀ ${leftLabel}`, -gantryW * 0.25, -gantryH + gantryH * 0.19);
        ctx.fillText(`${rightLabel} ▶`, gantryW * 0.25, -gantryH + gantryH * 0.19);
        break;
      }

      case 'flag_girl': {
        // Iconic 1986 Flag Girl waving the checkered flag!
        const girlH = 140 * scale * (width / 2);
        const girlW = 60 * scale * (width / 2);

        // Boots & Legs
        ctx.fillStyle = '#ffeedd';
        ctx.fillRect(-girlW * 0.2, -girlH * 0.45, girlW * 0.16, girlH * 0.45);
        ctx.fillRect(girlW * 0.05, -girlH * 0.45, girlW * 0.16, girlH * 0.45);
        ctx.fillStyle = '#ffffff'; // White boots
        ctx.fillRect(-girlW * 0.22, -girlH * 0.2, girlW * 0.2, girlH * 0.2);
        ctx.fillRect(girlW * 0.03, -girlH * 0.2, girlW * 0.2, girlH * 0.2);

        // Red Mini dress
        ctx.fillStyle = '#ee2200';
        ctx.fillRect(-girlW * 0.25, -girlH * 0.75, girlW * 0.5, girlH * 0.32);

        // Blonde hair & Head
        ctx.fillStyle = '#ffdd44';
        ctx.beginPath();
        ctx.arc(0, -girlH * 0.88, girlW * 0.25, 0, Math.PI * 2);
        ctx.fill();

        // Checkered Flag held high
        ctx.strokeStyle = '#333333';
        ctx.lineWidth = Math.max(2, 3 * scale * (width / 2));
        ctx.beginPath();
        ctx.moveTo(girlW * 0.1, -girlH * 0.65);
        ctx.lineTo(girlW * 0.6, -girlH * 1.1);
        ctx.stroke();

        ctx.fillStyle = '#000000';
        ctx.fillRect(girlW * 0.4, -girlH * 1.1, girlW * 0.4, girlH * 0.22);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(girlW * 0.4, -girlH * 1.1, girlW * 0.2, girlH * 0.11);
        ctx.fillRect(girlW * 0.6, -girlH * 1.1 + girlH * 0.11, girlW * 0.2, girlH * 0.11);
        break;
      }

      case 'cameraman': {
        const camH = 130 * scale * (width / 2);
        const camW = 60 * scale * (width / 2);
        // Tripod legs
        ctx.strokeStyle = '#222222';
        ctx.lineWidth = Math.max(2, 2.5 * scale * (width / 2));
        ctx.beginPath();
        ctx.moveTo(0, -camH * 0.6); ctx.lineTo(-camW * 0.4, 0);
        ctx.moveTo(0, -camH * 0.6); ctx.lineTo(camW * 0.4, 0);
        ctx.stroke();
        // TV camera body
        ctx.fillStyle = '#444444';
        ctx.fillRect(-camW * 0.3, -camH * 0.85, camW * 0.6, camH * 0.25);
        // Lens
        ctx.fillStyle = '#111111';
        ctx.fillRect(-camW * 0.45, -camH * 0.8, camW * 0.18, camH * 0.15);
        break;
      }

      case 'spectator_crowd': {
        // Cheering arcade spectators
        const crowdW = 160 * scale * (width / 2);
        const crowdH = 100 * scale * (width / 2);
        const colors = ['#e74c3c', '#3498db', '#2ecc71', '#f1c40f', '#9b59b6'];

        for (let i = 0; i < 6; i++) {
          const cx = -crowdW / 2 + (i * crowdW / 5);
          ctx.fillStyle = colors[i % colors.length];
          ctx.fillRect(cx - 8, -crowdH * 0.7, 16, crowdH * 0.7);
          ctx.fillStyle = '#ffd1b3';
          ctx.beginPath();
          ctx.arc(cx, -crowdH * 0.85, 7, 0, Math.PI * 2);
          ctx.fill();
        }
        break;
      }
    }

    ctx.restore();
  }

  // AI Traffic Cars with authentic arcade sprite rendering
  private renderTrafficCar(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    segment: RoadSegment,
    car: TrafficCar
  ) {
    const scale = segment.p1.screen.scale;
    if (scale <= 0) return;

    const carX = segment.p1.screen.x + (scale * car.offset * ROAD_WIDTH * (width / 2));
    const carY = segment.p1.screen.y;

    const carW = 150 * scale * (width / 2);
    const carH = 75 * scale * (width / 2);

    ctx.save();
    ctx.translate(carX, carY);

    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.beginPath();
    ctx.ellipse(0, -2, carW * 0.52, carH * 0.18, 0, 0, Math.PI * 2);
    ctx.fill();

    // Wheels
    ctx.fillStyle = '#111111';
    ctx.fillRect(-carW * 0.48, -carH * 0.35, carW * 0.18, carH * 0.35);
    ctx.fillRect(carW * 0.30, -carH * 0.35, carW * 0.18, carH * 0.35);

    // Car Body
    ctx.fillStyle = car.color;
    ctx.beginPath();
    this.roundRect(ctx, -carW * 0.46, -carH * 0.75, carW * 0.92, carH * 0.55, Math.max(0, 6 * scale * (width / 2)));
    ctx.fill();

    // Cabin / Roof
    ctx.fillStyle = '#1a1a1a';
    ctx.beginPath();
    this.roundRect(ctx, -carW * 0.32, -carH * 1.05, carW * 0.64, carH * 0.4, Math.max(0, 4 * scale * (width / 2)));
    ctx.fill();

    // Rear Windshield
    ctx.fillStyle = '#87ceeb';
    ctx.fillRect(-carW * 0.28, -carH * 0.98, carW * 0.56, carH * 0.28);

    // Tail lights
    ctx.fillStyle = '#ff1100';
    ctx.fillRect(-carW * 0.42, -carH * 0.58, carW * 0.18, carH * 0.18);
    ctx.fillRect(carW * 0.24, -carH * 0.58, carW * 0.18, carH * 0.18);

    // License plate
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-carW * 0.12, -carH * 0.48, carW * 0.24, carH * 0.12);

    ctx.restore();
  }

  // 1:1 AUTHENTIC PIXEL-CRAFTED FERRARI TESTAROSSA SPIDER
  // Features: Corsa Red, blonde companion with waving hair, 80s driver, tail louvers, chrome exhaust tips, tire smoke!
  private renderPlayerFerrari(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    engine: OutrunEngine
  ) {
    const carW = width * 0.34;
    const carH = carW * 0.46;
    const carX = width / 2;
    const carY = height - 18 + engine.player.bounceOffset;

    ctx.save();
    ctx.translate(carX, carY);

    // Turning lean/roll tilt
    const tilt = engine.player.steerAngle * 0.08;
    ctx.rotate(tilt);

    // 1. TIRE SMOKE & SLIPSTREAM PARTICLES (During high-speed or drift)
    if (engine.player.isDrifting || (engine.player.speed > 240 && Math.random() < 0.35)) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
      for (let i = 0; i < 4; i++) {
        const puffSize = 12 + Math.random() * 16;
        ctx.beginPath();
        ctx.arc(-carW * 0.44 - Math.random() * 20, -10 - Math.random() * 14, puffSize, 0, Math.PI * 2);
        ctx.arc(carW * 0.44 + Math.random() * 20, -10 - Math.random() * 14, puffSize, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // 2. SHADOW UNDER CAR
    ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
    ctx.beginPath();
    ctx.ellipse(0, -4, carW * 0.48, carH * 0.16, 0, 0, Math.PI * 2);
    ctx.fill();

    // 3. WIDE PIRELLI TIRES WITH DEEP TREADS
    ctx.fillStyle = '#111111';
    ctx.fillRect(-carW * 0.48, -carH * 0.42, carW * 0.22, carH * 0.42);
    ctx.fillRect(carW * 0.26, -carH * 0.42, carW * 0.22, carH * 0.42);

    // Inner alloy rims
    ctx.fillStyle = '#444444';
    ctx.fillRect(-carW * 0.45, -carH * 0.35, carW * 0.16, carH * 0.28);
    ctx.fillRect(carW * 0.29, -carH * 0.35, carW * 0.16, carH * 0.28);

    // 4. LOWER DIFFUSER & QUAD CHROME EXHAUSTS
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(-carW * 0.36, -carH * 0.22, carW * 0.72, carH * 0.2);

    // Chrome twin exhausts on left & right
    ctx.fillStyle = '#dcdcdc';
    ctx.beginPath();
    ctx.arc(-carW * 0.26, -carH * 0.12, carH * 0.08, 0, Math.PI * 2);
    ctx.arc(-carW * 0.18, -carH * 0.12, carH * 0.08, 0, Math.PI * 2);
    ctx.arc(carW * 0.18, -carH * 0.12, carH * 0.08, 0, Math.PI * 2);
    ctx.arc(carW * 0.26, -carH * 0.12, carH * 0.08, 0, Math.PI * 2);
    ctx.fill();

    // Exhaust dark hollows
    ctx.fillStyle = '#050505';
    ctx.beginPath();
    ctx.arc(-carW * 0.26, -carH * 0.12, carH * 0.05, 0, Math.PI * 2);
    ctx.arc(-carW * 0.18, -carH * 0.12, carH * 0.05, 0, Math.PI * 2);
    ctx.arc(carW * 0.18, -carH * 0.12, carH * 0.05, 0, Math.PI * 2);
    ctx.arc(carW * 0.26, -carH * 0.12, carH * 0.05, 0, Math.PI * 2);
    ctx.fill();

    // 5. ICONIC FERRARI CORSA RED REAR BUMPER & HAUNCHES
    const bodyGrad = ctx.createLinearGradient(0, -carH * 0.85, 0, 0);
    bodyGrad.addColorStop(0, '#ff3b30'); // Highlight red
    bodyGrad.addColorStop(0.3, '#d31212'); // Ferrari classic red
    bodyGrad.addColorStop(1, '#9b0b0b'); // Shadow red
    ctx.fillStyle = bodyGrad;

    ctx.beginPath();
    ctx.moveTo(-carW * 0.44, -carH * 0.2);
    ctx.lineTo(-carW * 0.46, -carH * 0.65);
    ctx.lineTo(-carW * 0.38, -carH * 0.85);
    ctx.lineTo(carW * 0.38, -carH * 0.85);
    ctx.lineTo(carW * 0.46, -carH * 0.65);
    ctx.lineTo(carW * 0.44, -carH * 0.2);
    ctx.closePath();
    ctx.fill();

    // 6. TESTAROSSA REAR BLACK STRAKES & LOUVERS PANEL
    ctx.fillStyle = '#111111';
    ctx.fillRect(-carW * 0.36, -carH * 0.72, carW * 0.72, carH * 0.38);

    // Horizontal black vent louvers
    ctx.strokeStyle = '#282828';
    ctx.lineWidth = 2;
    for (let y = -carH * 0.70; y < -carH * 0.36; y += carH * 0.07) {
      ctx.beginPath();
      ctx.moveTo(-carW * 0.35, y);
      ctx.lineTo(carW * 0.35, y);
      ctx.stroke();
    }

    // 7. TAIL LIGHT ASSEMBLIES (Amber Blinker + Red Brake + White Reverse)
    // Left Light cluster
    ctx.fillStyle = '#ff8800'; // Amber blinker
    ctx.fillRect(-carW * 0.35, -carH * 0.68, carW * 0.07, carH * 0.24);
    ctx.fillStyle = '#ff1100'; // Ruby red brake lamp
    ctx.fillRect(-carW * 0.27, -carH * 0.68, carW * 0.09, carH * 0.24);
    ctx.fillStyle = '#ffffff'; // White reverse
    ctx.fillRect(-carW * 0.17, -carH * 0.68, carW * 0.04, carH * 0.24);

    // Right Light cluster
    ctx.fillStyle = '#ffffff'; // White reverse
    ctx.fillRect(carW * 0.13, -carH * 0.68, carW * 0.04, carH * 0.24);
    ctx.fillStyle = '#ff1100'; // Ruby red brake lamp
    ctx.fillRect(carW * 0.18, -carH * 0.68, carW * 0.09, carH * 0.24);
    ctx.fillStyle = '#ff8800'; // Amber blinker
    ctx.fillRect(carW * 0.28, -carH * 0.68, carW * 0.07, carH * 0.24);

    // Yellow Ferrari Badge in center
    ctx.fillStyle = '#ffea00';
    ctx.fillRect(-carW * 0.035, -carH * 0.62, carW * 0.07, carH * 0.12);
    ctx.fillStyle = '#000000';
    ctx.fillRect(-carW * 0.015, -carH * 0.58, carW * 0.03, carH * 0.05);

    // 8. COCKPIT INTERIOR (TAN LEATHER SPORT SEATS)
    ctx.fillStyle = '#bfa175'; // Tan Connolly leather
    // Driver seat headrest (left)
    ctx.beginPath();
    this.roundRect(ctx, -carW * 0.28, -carH * 1.15, carW * 0.18, carH * 0.34, 6);
    ctx.fill();
    // Passenger seat headrest (right)
    ctx.beginPath();
    this.roundRect(ctx, carW * 0.10, -carH * 1.15, carW * 0.18, carH * 0.34, 6);
    ctx.fill();

    // Rearview mirror
    ctx.fillStyle = '#111111';
    ctx.fillRect(-carW * 0.06, -carH * 1.05, carW * 0.12, carH * 0.08);

    // 9. DRIVER (LEFT): 80s Styled Brown Hair & Denim Blue Shirt
    ctx.fillStyle = '#2c3e50'; // Denim jacket
    ctx.fillRect(-carW * 0.26, -carH * 1.02, carW * 0.14, carH * 0.24);
    // Hands on sport steering wheel
    ctx.fillStyle = '#f5cba7';
    ctx.fillRect(-carW * 0.30, -carH * 0.92, carW * 0.05, carH * 0.08);
    ctx.fillRect(-carW * 0.15, -carH * 0.92, carW * 0.05, carH * 0.08);
    // Head & Hair
    ctx.fillStyle = '#4a2e18'; // Brown styled 80s hair
    ctx.beginPath();
    ctx.arc(-carW * 0.19, -carH * 1.16, carW * 0.07, 0, Math.PI * 2);
    ctx.fill();

    // 10. PASSENGER (RIGHT): BLONDE COMPANION WITH FLOWING HAIR & PINK TOP
    ctx.fillStyle = '#ff2a70'; // Fuchsia / Pink top
    ctx.fillRect(carW * 0.12, -carH * 1.02, carW * 0.14, carH * 0.24);
    // Golden blonde head
    ctx.fillStyle = '#ffd700'; // Bright gold
    ctx.beginPath();
    ctx.arc(carW * 0.19, -carH * 1.16, carW * 0.07, 0, Math.PI * 2);
    ctx.fill();
    // Beautiful flowing golden hair blowing in the wind behind her
    const hairWave = Math.sin(Date.now() / 60) * (carW * 0.025);
    ctx.beginPath();
    ctx.moveTo(carW * 0.15, -carH * 1.2);
    ctx.lineTo(carW * 0.32 + hairWave, -carH * 1.25);
    ctx.lineTo(carW * 0.28 + hairWave, -carH * 1.05);
    ctx.lineTo(carW * 0.18, -carH * 1.08);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  // START COUNTDOWN BANNER & LIGHTS (3, 2, 1, GO!)
  private renderCountdown(ctx: CanvasRenderingContext2D, width: number, height: number, engine: OutrunEngine) {
    const cd = engine.startCountdown;
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const cx = width / 2;
    const cy = height * 0.32;

    let text = '';
    let color = '#ff2200';
    let subText = 'GET READY!';

    if (cd > 2.0) {
      text = '3';
      color = '#ff2200';
    } else if (cd > 1.0) {
      text = '2';
      color = '#ffcc00';
    } else if (cd > 0.1) {
      text = '1';
      color = '#ffcc00';
    } else {
      text = 'GO!';
      color = '#00ff66';
      subText = 'STEP ON THE GAS!';
    }

    // Glowing background capsule
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.beginPath();
    this.roundRect(ctx, cx - 140, cy - 50, 280, 100, 16);
    ctx.fill();
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.stroke();

    // Shadow & glow
    ctx.shadowColor = color;
    ctx.shadowBlur = 20;

    // Main countdown number / GO!
    ctx.fillStyle = color;
    ctx.font = `bold ${text === 'GO!' ? '48' : '56'}px "Press Start 2P", monospace`;
    ctx.fillText(text, cx, cy - 8);

    // Subtitle
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 10px "Press Start 2P", monospace';
    ctx.fillText(subText, cx, cy + 30);

    ctx.restore();
  }

  // 3D CHROME & GOLD OUTRUN LOGO (Image 2 Authentic Arcade Recreation)
  private drawOutRun3DLogo(ctx: CanvasRenderingContext2D, cx: number, cy: number, scale: number = 1) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(scale, scale);

    // 1. Black 3D Extrusion Drop-Shadow (Depth Effect)
    ctx.font = 'italic 900 68px "Press Start 2P", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    for (let d = 12; d >= 1; d--) {
      ctx.fillStyle = '#050505';
      ctx.fillText('Out Run', d * 0.8, d * 0.8);
    }

    // 2. Outer Bevel Outline
    ctx.lineWidth = 14;
    ctx.strokeStyle = '#220000';
    ctx.strokeText('Out Run', 0, 0);

    ctx.lineWidth = 8;
    ctx.strokeStyle = '#ff9900';
    ctx.strokeText('Out Run', 0, 0);

    // 3. Metallic Chrome & Gold Gradient Fill
    const grad = ctx.createLinearGradient(0, -35, 0, 35);
    grad.addColorStop(0, '#ffffff');    // Specular white highlight
    grad.addColorStop(0.25, '#cce6ff'); // Chrome blue glint
    grad.addColorStop(0.48, '#3a5f8a'); // Chrome shadow line
    grad.addColorStop(0.50, '#ffea00'); // Gold top edge
    grad.addColorStop(0.78, '#ff8800'); // Vivid arcade orange
    grad.addColorStop(1, '#8b0000');    // Deep crimson bottom
    ctx.fillStyle = grad;
    ctx.fillText('Out Run', 0, 0);

    // 4. Specular White Shimmer Line
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.strokeText('Out Run', -1, -2);

    // 5. Sega Trademark TM
    ctx.font = 'bold 10px "Press Start 2P", monospace';
    ctx.fillStyle = '#ffcc00';
    ctx.fillText('TM', 175, -20);

    // 6. Sparkling Star Glints on Logo Corners
    const time = Date.now() / 300;
    const drawSparkle = (sx: number, sy: number, phase: number) => {
      const sparkScale = (Math.sin(time + phase) + 1) * 0.5;
      if (sparkScale > 0.3) {
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(sx, sy, 3 * sparkScale, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5 * sparkScale;
        ctx.beginPath();
        ctx.moveTo(sx - 10 * sparkScale, sy);
        ctx.lineTo(sx + 10 * sparkScale, sy);
        ctx.moveTo(sx, sy - 10 * sparkScale);
        ctx.lineTo(sx, sy + 10 * sparkScale);
        ctx.stroke();
      }
    };

    drawSparkle(-150, -25, 0);
    drawSparkle(20, -30, 2);
    drawSparkle(130, -10, 4);

    ctx.restore();
  }

  // ARCADE-AUTHENTIC HUD & MINI-PYRAMID ROUTE MAP (Matching Image 3)
  private renderHUD(ctx: CanvasRenderingContext2D, width: number, height: number, engine: OutrunEngine) {
    ctx.save();

    // 1. TOP STATUS CAPSULES
    // Capsule 1 (Left): TIME (Red-Orange outer border pill with yellow bold digits)
    const timeCapsuleW = 150;
    const timeCapsuleH = 50;
    ctx.fillStyle = 'rgba(15, 15, 25, 0.85)';
    ctx.beginPath();
    this.roundRect(ctx, 16, 14, timeCapsuleW, timeCapsuleH, 10);
    ctx.fill();
    ctx.strokeStyle = '#ff3322';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    ctx.font = 'bold 11px "Press Start 2P", monospace';
    ctx.fillStyle = '#ff4433';
    ctx.textAlign = 'left';
    ctx.fillText('TIME', 28, 32);

    const timeVal = Math.ceil(engine.timeRemaining);
    ctx.font = 'bold 22px "Press Start 2P", monospace';
    ctx.fillStyle = timeVal <= 10 ? '#ff1100' : '#ffee00';
    ctx.fillText(timeVal.toString().padStart(2, '0'), 86, 51);

    // Capsule 2 (Center-Left): SCORE (Magenta/Purple outer border with white digits)
    const scoreCapsuleW = 220;
    ctx.fillStyle = 'rgba(15, 15, 25, 0.85)';
    ctx.beginPath();
    this.roundRect(ctx, 178, 14, scoreCapsuleW, timeCapsuleH, 10);
    ctx.fill();
    ctx.strokeStyle = '#af52de';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    ctx.font = 'bold 11px "Press Start 2P", monospace';
    ctx.fillStyle = '#da77f2';
    ctx.fillText('SCORE', 192, 32);

    ctx.font = 'bold 18px "Press Start 2P", monospace';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(engine.score.toString().padStart(8, '0'), 192, 51);

    // Capsule 3 (Center-Right): STAGE & LAP TIME (Cyan outer border pill)
    const stageCapsuleW = 210;
    ctx.fillStyle = 'rgba(15, 15, 25, 0.85)';
    ctx.beginPath();
    this.roundRect(ctx, 410, 14, stageCapsuleW, timeCapsuleH, 10);
    ctx.fill();
    ctx.strokeStyle = '#00e5ff';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    ctx.font = 'bold 11px "Press Start 2P", monospace';
    ctx.fillStyle = '#00e5ff';
    ctx.fillText(`STAGE ${engine.stage}`, 424, 32);

    ctx.font = 'bold 11px "Press Start 2P", monospace';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(engine.stageName, 424, 51);

    // 2. AUTHENTIC MINI-PYRAMID ROUTE MAP (Top Right)
    const mapW = 136;
    const mapH = 68;
    const mapX = width - mapW - 16;
    const mapY = 14;

    ctx.fillStyle = 'rgba(15, 15, 25, 0.88)';
    ctx.beginPath();
    this.roundRect(ctx, mapX, mapY, mapW, mapH, 10);
    ctx.fill();
    ctx.strokeStyle = '#ff9900';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.font = 'bold 7px "Press Start 2P", monospace';
    ctx.fillStyle = '#ffaa00';
    ctx.textAlign = 'center';
    ctx.fillText('COURSE MAP', mapX + mapW / 2, mapY + 14);

    const t1X = mapX + mapW / 2;
    const t1Y = mapY + 24;

    const t2LX = mapX + mapW * 0.32;
    const t2RX = mapX + mapW * 0.68;
    const t2Y = mapY + 38;

    const t3AX = mapX + mapW * 0.20;
    const t3BX = mapX + mapW * 0.50;
    const t3CX = mapX + mapW * 0.80;
    const t3Y = mapY + 54;

    // Branches
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(t1X, t1Y); ctx.lineTo(t2LX, t2Y);
    ctx.moveTo(t1X, t1Y); ctx.lineTo(t2RX, t2Y);
    ctx.moveTo(t2LX, t2Y); ctx.lineTo(t3AX, t3Y);
    ctx.moveTo(t2LX, t2Y); ctx.lineTo(t3BX, t3Y);
    ctx.moveTo(t2RX, t2Y); ctx.lineTo(t3BX, t3Y);
    ctx.moveTo(t2RX, t2Y); ctx.lineTo(t3CX, t3Y);
    ctx.stroke();

    // Node dots
    const drawNode = (nx: number, ny: number, active: boolean) => {
      ctx.fillStyle = active ? '#ff2200' : '#777777';
      ctx.beginPath();
      ctx.arc(nx, ny, active ? 5 : 3, 0, Math.PI * 2);
      ctx.fill();
      if (active) {
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    };

    drawNode(t1X, t1Y, engine.stage === 1);
    drawNode(t2LX, t2Y, engine.stage === 2 && engine.forkChosen === 'LEFT');
    drawNode(t2RX, t2Y, engine.stage === 2 && engine.forkChosen === 'RIGHT');
    drawNode(t3AX, t3Y, engine.stage === 3 && engine.currentStageId === 'alps');
    drawNode(t3BX, t3Y, engine.stage === 3 && engine.currentStageId === 'vineyard');
    drawNode(t3CX, t3Y, false);

    // 3. BOTTOM SPEEDOMETER, GEAR & TACHOMETER (Matching Image 3)
    const speed = Math.floor(engine.player.speed);
    const speedBoxW = 220;
    const speedBoxH = 74;
    const speedBoxX = 16;
    const speedBoxY = height - speedBoxH - 16;

    ctx.fillStyle = 'rgba(15, 15, 25, 0.88)';
    ctx.beginPath();
    this.roundRect(ctx, speedBoxX, speedBoxY, speedBoxW, speedBoxH, 12);
    ctx.fill();
    ctx.strokeStyle = '#ff3322';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Speed label & value
    ctx.textAlign = 'left';
    ctx.font = 'bold 8px "Press Start 2P", monospace';
    ctx.fillStyle = '#ffaa00';
    ctx.fillText('SPEED', speedBoxX + 14, speedBoxY + 20);

    ctx.font = 'italic bold 24px "Press Start 2P", monospace';
    ctx.fillStyle = speed > 260 ? '#ff2200' : '#00ffee';
    ctx.fillText(`${speed}`, speedBoxX + 14, speedBoxY + 48);

    ctx.font = 'bold 10px "Press Start 2P", monospace';
    ctx.fillStyle = '#ffd700';
    ctx.fillText('km/h', speedBoxX + 88, speedBoxY + 48);

    // Gear indicator pill
    const isHigh = engine.player.gear === 'HIGH';
    ctx.fillStyle = isHigh ? '#27ae60' : '#e67e22';
    ctx.beginPath();
    this.roundRect(ctx, speedBoxX + 150, speedBoxY + 12, 54, 48, 8);
    ctx.fill();

    ctx.font = 'bold 8px "Press Start 2P", monospace';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.fillText('GEAR', speedBoxX + 177, speedBoxY + 28);
    ctx.font = 'bold 15px "Press Start 2P", monospace';
    ctx.fillText(engine.player.gear === 'HIGH' ? 'HI' : 'LOW', speedBoxX + 177, speedBoxY + 50);

    // Multi-segment LED Tachometer bar (cyan -> green -> yellow -> red)
    const rpmRatio = Math.min(1, engine.player.speed / 293);
    const rpmW = 190;
    const rpmX = speedBoxX + 14;
    const rpmY = speedBoxY + 58;
    ctx.fillStyle = '#111111';
    ctx.fillRect(rpmX, rpmY, rpmW, 7);

    const totalBars = 18;
    const activeBars = Math.floor(rpmRatio * totalBars);
    const barW = (rpmW / totalBars) - 1.5;

    for (let b = 0; b < totalBars; b++) {
      const bx = rpmX + b * (barW + 1.5);
      if (b < activeBars) {
        if (b < 6) ctx.fillStyle = '#00e5ff'; // Cyan
        else if (b < 12) ctx.fillStyle = '#2ecc71'; // Green
        else if (b < 15) ctx.fillStyle = '#f1c40f'; // Yellow
        else ctx.fillStyle = '#e74c3c'; // Red
      } else {
        ctx.fillStyle = '#222222';
      }
      ctx.fillRect(bx, rpmY, barW, 7);
    }

    // Near miss bonus banner
    if (engine.isNearMissAlert) {
      ctx.fillStyle = '#ffeb3b';
      ctx.font = 'bold 18px "Press Start 2P", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('★ NEAR MISS! +10000 ★', width / 2, height * 0.28);
    }

    ctx.restore();
  }

  // ARCADE TITLE SCREEN, STAGE CLEAR & GAME OVER
  private renderGameStates(ctx: CanvasRenderingContext2D, width: number, height: number, engine: OutrunEngine) {
    ctx.save();

    // 1. AUTHENTIC TITLE / ATTRACT SCREEN (Image 2)
    if (engine.gameState === 'TITLE') {
      // Semi-transparent gradient overlay to allow the live 3D Start Scene to shine through!
      const titleGrad = ctx.createLinearGradient(0, 0, 0, height);
      titleGrad.addColorStop(0, 'rgba(0, 15, 35, 0.45)');
      titleGrad.addColorStop(0.5, 'rgba(0, 0, 0, 0.25)');
      titleGrad.addColorStop(1, 'rgba(0, 10, 25, 0.7)');
      ctx.fillStyle = titleGrad;
      ctx.fillRect(0, 0, width, height);

      // 3D Chrome & Gold OutRun Script Logo (Image 2)
      this.drawOutRun3DLogo(ctx, width / 2, height * 0.24, 0.95);

      // Subtitle & Sega Yu Suzuki Copyright
      ctx.font = 'bold 11px "Press Start 2P", monospace';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
      ctx.shadowBlur = 6;
      ctx.fillText('© 1986 SEGA ENTERPRISES, LTD. / YU SUZUKI', width / 2, height * 0.38);

      // Route Stage Line
      ctx.fillStyle = '#00ffee';
      ctx.font = 'bold 10px "Press Start 2P", monospace';
      ctx.fillText('STAGE 1: COCONUT BEACH ➔ GATEWAY / DESERT ➔ ALPS', width / 2, height * 0.45);

      // Pulsing "INSERT COIN" & "PRESS START"
      const blink = Math.floor(Date.now() / 400) % 2 === 0;
      if (blink) {
        ctx.fillStyle = '#ffea00';
        ctx.font = 'bold 14px "Press Start 2P", monospace';
        ctx.fillText('★ INSERT COIN (FREE PLAY) ★', width / 2, height * 0.53);

        ctx.fillStyle = '#00ff66';
        ctx.font = 'bold 16px "Press Start 2P", monospace';
        ctx.fillText('PRESS [A / RT] OR CLICK TO RACE!', width / 2, height * 0.60);
      }

      // Controls Summary Glass Card
      ctx.fillStyle = 'rgba(10, 15, 30, 0.82)';
      ctx.beginPath();
      this.roundRect(ctx, width * 0.16, height * 0.66, width * 0.68, height * 0.28, 14);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 200, 50, 0.5)';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#ffcc00';
      ctx.font = 'bold 10px "Press Start 2P", monospace';
      ctx.fillText('🎮 XBOX / CONTROLLER & KEYBOARD READY:', width / 2, height * 0.72);

      ctx.fillStyle = '#ffffff';
      ctx.font = '9px "Press Start 2P", monospace';
      ctx.fillText('STEER: Left Stick / D-Pad OR [A / D] [← / →]', width / 2, height * 0.78);
      ctx.fillText('GAS: Right Trigger (RT) / (A) OR [W] / [↑]', width / 2, height * 0.83);
      ctx.fillText('BRAKE: Left Trigger (LT) / (X) OR [S] / [↓]', width / 2, height * 0.88);
      ctx.fillText('SHIFT GEAR: (Y) / Bumpers OR [SPACE] / [G]', width / 2, height * 0.92);
    }

    // 2. STAGE CLEAR CELEBRATION
    if (engine.gameState === 'STAGE_CLEAR') {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = '#ffcc00';
      ctx.font = 'bold 32px "Press Start 2P", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('CONGRATULATIONS!', width / 2, height * 0.32);

      ctx.fillStyle = '#00ffcc';
      ctx.font = 'bold 16px "Press Start 2P", monospace';
      ctx.fillText('YOU HAVE COMPLETED THE COURSE!', width / 2, height * 0.42);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 14px "Press Start 2P", monospace';
      ctx.fillText(`FINAL SCORE: ${engine.score.toLocaleString()}`, width / 2, height * 0.54);

      const blink = Math.floor(Date.now() / 400) % 2 === 0;
      if (blink) {
        ctx.fillStyle = '#ffea00';
        ctx.font = 'bold 12px "Press Start 2P", monospace';
        ctx.fillText('PRESS [A / RT] OR CLICK TO RACE AGAIN', width / 2, height * 0.68);
      }
    }

    // 3. GAME OVER
    if (engine.gameState === 'GAMEOVER') {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = '#ff2222';
      ctx.font = 'bold 36px "Press Start 2P", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('GAME OVER', width / 2, height * 0.36);

      ctx.fillStyle = '#ffcc00';
      ctx.font = 'bold 14px "Press Start 2P", monospace';
      ctx.fillText(`STAGE REACHED: ${engine.stage} (${engine.stageName})`, width / 2, height * 0.48);
      ctx.fillText(`SCORE: ${engine.score.toLocaleString()}`, width / 2, height * 0.56);

      const blink = Math.floor(Date.now() / 400) % 2 === 0;
      if (blink) {
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px "Press Start 2P", monospace';
        ctx.fillText('PRESS [A / RT] OR CLICK TO TRY AGAIN', width / 2, height * 0.70);
      }
    }

    ctx.restore();
  }

  // CRT Arcade Scanlines Filter
  private renderCRT(ctx: CanvasRenderingContext2D, width: number, height: number) {
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.12)';
    for (let y = 0; y < height; y += 3) {
      ctx.fillRect(0, y, width, 1.2);
    }

    // Vignette
    const grad = ctx.createRadialGradient(width / 2, height / 2, width * 0.35, width / 2, height / 2, width * 0.65);
    grad.addColorStop(0, 'rgba(0, 0, 0, 0)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0.4)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
    ctx.restore();
  }
}
