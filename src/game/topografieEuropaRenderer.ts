/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Topografie Europa (Cees Kramer & Roel Kramer • Radarsoft, 1984)
 * Authentic Commodore 64 VIC-II Scrolling Canvas 2D Renderer
 * Renders genuine European geography with pre-rendered offscreen bitmap raster
 */

import { TopografieEuropaEngine } from './topografieEuropaEngine';
import {
  WORLD_WIDTH,
  WORLD_HEIGHT,
  SCREEN_WIDTH,
  SCREEN_HEIGHT,
  HUD_TOP_HEIGHT,
  HUD_BOTTOM_HEIGHT,
  VIEW_HEIGHT,
  C64_COLORS,
  HOME_HELIPORT,
  EUROPE_RIVERS,
  EUROPE_MOUNTAINS,
  EUROPEAN_CAPITALS,
  MAJOR_CITIES,
  REAL_EUROPE_COUNTRIES
} from './topografieEuropaData';

export class TopografieEuropaRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private blinkTimer: number = 0;
  private offscreenMap: HTMLCanvasElement | null = null;
  private offscreenRadar: HTMLCanvasElement | null = null;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Could not initialize 2D context');
    this.ctx = context;

    this.initOffscreenMap();
  }

  /**
   * Pre-renders the complete genuine geography of Europe onto an offscreen canvas
   * Produces authentic 1984 60 FPS raster blitting with zero polygon lag.
   */
  private initOffscreenMap() {
    const offscreen = document.createElement('canvas');
    offscreen.width = WORLD_WIDTH;
    offscreen.height = WORLD_HEIGHT;
    const offCtx = offscreen.getContext('2d');
    if (!offCtx) return;

    offCtx.imageSmoothingEnabled = false;

    // 1. Sea Background (Radarsoft Pure Sea Blue #1a6fd8)
    offCtx.fillStyle = C64_COLORS.radarSeaBlue;
    offCtx.fillRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);

    // 2. Draw all 50 European Nations with real coastlines & islands
    // First pass: Landmass fills
    offCtx.fillStyle = C64_COLORS.radarLandGreen;
    for (const country of REAL_EUROPE_COUNTRIES) {
      for (const ring of country.rings) {
        if (ring.length < 3) continue;
        offCtx.beginPath();
        offCtx.moveTo(ring[0][0], ring[0][1]);
        for (let i = 1; i < ring.length; i++) {
          offCtx.lineTo(ring[i][0], ring[i][1]);
        }
        offCtx.closePath();
        offCtx.fill();
      }
    }

    // Second pass: Crisp white national borders
    offCtx.strokeStyle = C64_COLORS.radarBorderWhite;
    offCtx.lineWidth = 1.0;
    for (const country of REAL_EUROPE_COUNTRIES) {
      for (const ring of country.rings) {
        if (ring.length < 3) continue;
        offCtx.beginPath();
        offCtx.moveTo(ring[0][0], ring[0][1]);
        for (let i = 1; i < ring.length; i++) {
          offCtx.lineTo(ring[i][0], ring[i][1]);
        }
        offCtx.closePath();
        offCtx.stroke();
      }
    }

    // 3. Draw Major European Rivers with Organic Bezier Curve Smoothing
    offCtx.strokeStyle = '#38bdf8'; // Crisp sky blue river water
    offCtx.lineWidth = 2.0;
    offCtx.lineCap = 'round';
    offCtx.lineJoin = 'round';
    for (const river of EUROPE_RIVERS) {
      const pts = river.points;
      if (pts.length < 2) continue;
      
      offCtx.beginPath();
      offCtx.moveTo(pts[0][0], pts[0][1]);
      
      if (pts.length === 2) {
        offCtx.lineTo(pts[1][0], pts[1][1]);
      } else {
        // Smooth spline drawing using midpoints as quadratic control points
        for (let i = 0; i < pts.length - 1; i++) {
          const xc = (pts[i][0] + pts[i + 1][0]) / 2;
          const yc = (pts[i][1] + pts[i + 1][1]) / 2;
          offCtx.quadraticCurveTo(pts[i][0], pts[i][1], xc, yc);
        }
        // Connect to final point
        offCtx.lineTo(pts[pts.length - 1][0], pts[pts.length - 1][1]);
      }
      offCtx.stroke();
    }

    // 4. Draw Mountain Ridges
    offCtx.fillStyle = '#ffffff';
    offCtx.strokeStyle = '#1e3a8a';
    offCtx.lineWidth = 1;
    for (const [mx, my] of EUROPE_MOUNTAINS) {
      offCtx.beginPath();
      offCtx.moveTo(mx - 4, my + 3);
      offCtx.lineTo(mx, my - 4);
      offCtx.lineTo(mx + 4, my + 3);
      offCtx.closePath();
      offCtx.fill();
      offCtx.stroke();
    }

    // 5. Draw Home Base Heliport (Schiphol / Amsterdam)
    const hx = HOME_HELIPORT.x;
    const hy = HOME_HELIPORT.y;
    offCtx.fillStyle = '#475569';
    offCtx.beginPath();
    offCtx.arc(hx, hy, 8, 0, Math.PI * 2);
    offCtx.fill();
    offCtx.strokeStyle = C64_COLORS.yellow;
    offCtx.lineWidth = 1.5;
    offCtx.stroke();
    offCtx.fillStyle = C64_COLORS.white;
    offCtx.font = 'bold 7px monospace';
    offCtx.textAlign = 'center';
    offCtx.textBaseline = 'middle';
    offCtx.fillText('H', hx, hy);

    this.offscreenMap = offscreen;

    // Create a mini-version for the Radar Box
    const radar = document.createElement('canvas');
    radar.width = 64;
    radar.height = 48;
    const radarCtx = radar.getContext('2d');
    if (radarCtx) {
      radarCtx.imageSmoothingEnabled = false;
      radarCtx.drawImage(offscreen, 0, 0, WORLD_WIDTH, WORLD_HEIGHT, 0, 0, 64, 48);
      this.offscreenRadar = radar;
    }
  }

  public render(engine: TopografieEuropaEngine, lang: 'nl' | 'en' = 'nl') {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    this.blinkTimer += 0.08;

    ctx.save();
    ctx.imageSmoothingEnabled = false;

    // Scale from logical 320x200 (Commodore 64 screen) to actual canvas dimensions
    const scaleX = w / SCREEN_WIDTH;
    const scaleY = h / SCREEN_HEIGHT;
    ctx.scale(scaleX, scaleY);

    // 1. Clear with Deep Black (Commodore 64 border)
    ctx.fillStyle = C64_COLORS.black;
    ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);

    // 2. Render Top HUD Bar (0 - 18px: 0023 PNT   TIJD: 2'16)
    this.drawTopHud(ctx, engine, lang);

    // 3. Render Scrolling Map Viewport (y: 18 - 178px, 160px height)
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, HUD_TOP_HEIGHT, SCREEN_WIDTH, VIEW_HEIGHT);
    ctx.clip();

    if (engine.isGameOver && engine.gameMode !== 'free') {
      this.drawEndReportCard(ctx, engine, lang);
    } else {
      if (engine.isOverviewMap) {
        this.renderOverviewMap(ctx, engine, lang);
      } else {
        this.renderScrollingMap(ctx, engine, lang);
      }

      // Mini-map Radar in top-right corner of viewport
      this.drawRadarMiniMap(ctx, engine);
    }

    ctx.restore();

    // 4. Render Bottom HUD Bar (178 - 200px: ANKARA / Teleprompter)
    this.drawBottomHud(ctx, engine, lang);

    // 5. CRT Scanlines
    this.drawCrtScanlines(ctx);

    ctx.restore();
  }

  private drawTopHud(ctx: CanvasRenderingContext2D, engine: TopografieEuropaEngine, lang: 'nl' | 'en') {
    ctx.fillStyle = C64_COLORS.black;
    ctx.fillRect(0, 0, SCREEN_WIDTH, HUD_TOP_HEIGHT);

    ctx.font = 'bold 9px monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';

    // Yellow C64 Pixel Font for Score
    const formattedScore = String(engine.score).padStart(4, '0');
    const pntLabel = lang === 'nl' ? 'PNT' : 'PTS';
    ctx.fillStyle = C64_COLORS.brightYellow;
    ctx.fillText(`${formattedScore} ${pntLabel}`, 10, HUD_TOP_HEIGHT / 2);

    // Difficulty badge in HUD
    const diffLabel = engine.difficulty === 'hard'
      ? (lang === 'nl' ? '[MOEILIJK]' : '[HARD]')
      : (lang === 'nl' ? '[MAKKELIJK]' : '[EASY]');
    ctx.font = '7px monospace';
    ctx.fillStyle = engine.difficulty === 'hard' ? C64_COLORS.orange : C64_COLORS.green;
    ctx.fillText(diffLabel, 60, HUD_TOP_HEIGHT / 2);

    // Fuel Gauge in Center
    ctx.fillStyle = C64_COLORS.grey;
    ctx.font = '7px monospace';
    ctx.fillText('KEROSINE:', 116, HUD_TOP_HEIGHT / 2);

    const fuelW = 38;
    const fuelH = 5;
    const fuelX = 162;
    const fuelY = Math.floor(HUD_TOP_HEIGHT / 2 - fuelH / 2);

    ctx.strokeStyle = C64_COLORS.white;
    ctx.lineWidth = 1;
    ctx.strokeRect(fuelX, fuelY, fuelW, fuelH);

    const fuelFillW = Math.max(0, (engine.fuel / 100) * (fuelW - 2));
    ctx.fillStyle = engine.fuel > 25 ? C64_COLORS.green : C64_COLORS.red;
    ctx.fillRect(fuelX + 1, fuelY + 1, fuelFillW, fuelH - 2);

    // Timer on Right (e.g. "TIJD:2'16")
    const minutes = Math.floor(engine.timeLeft / 60);
    const seconds = Math.floor(engine.timeLeft % 60);
    const timeStr = `${minutes}'${String(seconds).padStart(2, '0')}`;
    const timeLabel = lang === 'nl' ? 'TIJD' : 'TIME';

    ctx.textAlign = 'right';
    ctx.font = 'bold 9px monospace';
    ctx.fillStyle = engine.timeLeft < 30 && Math.sin(this.blinkTimer * 3) > 0 ? C64_COLORS.red : C64_COLORS.brightYellow;
    ctx.fillText(`${timeLabel}:${timeStr}`, SCREEN_WIDTH - 12, HUD_TOP_HEIGHT / 2);
  }

  private renderScrollingMap(ctx: CanvasRenderingContext2D, engine: TopografieEuropaEngine, lang: 'nl' | 'en') {
    if (!this.offscreenMap) return;

    const camX = Math.round(Math.max(0, Math.min(WORLD_WIDTH - SCREEN_WIDTH, engine.cameraX)));
    const camY = Math.round(Math.max(0, Math.min(WORLD_HEIGHT - VIEW_HEIGHT, engine.cameraY)));

    // Hardware-accelerated blit of authentic European geography
    ctx.drawImage(
      this.offscreenMap,
      camX,
      camY,
      SCREEN_WIDTH,
      VIEW_HEIGHT,
      0,
      HUD_TOP_HEIGHT,
      SCREEN_WIDTH,
      VIEW_HEIGHT
    );

    ctx.save();
    ctx.translate(-camX, -camY + HUD_TOP_HEIGHT);

    // Draw Target Dot / Cities
    this.drawTargetsAndCities(ctx, engine, lang);

    // Draw Helicopter Sprite with Altitude Shadow
    this.drawHelicopterSprite(ctx, engine);

    ctx.restore();
  }

  private renderOverviewMap(ctx: CanvasRenderingContext2D, engine: TopografieEuropaEngine, lang: 'nl' | 'en') {
    if (!this.offscreenMap) return;

    // Scale entire 1000x750 map into 320x160 viewport
    ctx.drawImage(
      this.offscreenMap,
      0,
      0,
      WORLD_WIDTH,
      WORLD_HEIGHT,
      0,
      HUD_TOP_HEIGHT,
      SCREEN_WIDTH,
      VIEW_HEIGHT
    );

    ctx.save();
    ctx.translate(0, HUD_TOP_HEIGHT);
    const scaleX = SCREEN_WIDTH / WORLD_WIDTH;
    const scaleY = VIEW_HEIGHT / WORLD_HEIGHT;

    // Viewport box on overview
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(
      engine.cameraX * scaleX,
      engine.cameraY * scaleY,
      SCREEN_WIDTH * scaleX,
      VIEW_HEIGHT * scaleY
    );

    // Target blip on overview (ONLY IN EASY MODE!)
    if (engine.currentMission && engine.difficulty === 'easy') {
      const isRedBlink = Math.sin(this.blinkTimer * 4) > -0.2;
      if (isRedBlink) {
        ctx.fillStyle = C64_COLORS.radarDotRed;
        ctx.beginPath();
        ctx.arc(engine.currentMission.x * scaleX, engine.currentMission.y * scaleY, 4, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Player Blip on Overview Map
    ctx.fillStyle = C64_COLORS.brightYellow;
    ctx.beginPath();
    ctx.arc(engine.x * scaleX, engine.y * scaleY, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = C64_COLORS.black;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.restore();
  }

  private drawTargetsAndCities(ctx: CanvasRenderingContext2D, engine: TopografieEuropaEngine, lang: 'nl' | 'en') {
    const target = engine.currentMission;

    // 1. Red Dot for Target Mission (ONLY IN EASY MODE!)
    // In Hard Mode (default), player must fly to and identify locations using real geography!
    if (target && engine.difficulty === 'easy') {
      const isRedBlink = Math.sin(this.blinkTimer * 4) > -0.2;
      if (isRedBlink) {
        ctx.fillStyle = C64_COLORS.radarDotRed;
        ctx.beginPath();
        ctx.arc(target.x, target.y, 5, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }

    // 2. City Dots when 'H' (Hint / Toon Steden) is active
    if (engine.showCityDots) {
      const allCities = [...EUROPEAN_CAPITALS, ...MAJOR_CITIES];
      for (const city of allCities) {
        ctx.fillStyle = city.isCapital ? '#ff3b30' : '#ffffff';
        ctx.beginPath();
        ctx.arc(city.x, city.y, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 0.8;
        ctx.stroke();

        ctx.fillStyle = C64_COLORS.white;
        ctx.font = 'bold 7px monospace';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'bottom';
        ctx.fillText(city.name[lang], city.x + 5, city.y - 1);
      }
    }
  }

  private drawHelicopterSprite(ctx: CanvasRenderingContext2D, engine: TopografieEuropaEngine) {
    const x = engine.x;
    const y = engine.y;
    const alt = engine.altitude;
    const heading = engine.heading;
    const rotor = engine.rotorAngle;

    // 1. Ground Shadow (shifts with altitude)
    if (alt > 0) {
      const shadowDist = alt * 9;
      ctx.save();
      ctx.translate(x + shadowDist, y + shadowDist);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';

      // Fuselage shadow
      ctx.beginPath();
      ctx.ellipse(0, 0, 6, 4, heading, 0, Math.PI * 2);
      ctx.fill();

      // Rotor disc shadow
      ctx.beginPath();
      ctx.arc(0, 0, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // 2. Authentic Radarsoft Brown 4-Blade Helicopter Sprite
    ctx.save();
    ctx.translate(x, y);

    if (Math.hypot(engine.vx, engine.vy) > 8) {
      ctx.rotate(heading);
    }

    // Main Fuselage (Brown Radarsoft cross)
    ctx.fillStyle = C64_COLORS.radarCopterBrown;
    ctx.fillRect(-8, -2.5, 16, 5);
    ctx.fillRect(-2.5, -8, 5, 16);

    // Rounded arm lobes (4 points)
    ctx.beginPath();
    ctx.arc(-8, 0, 3, 0, Math.PI * 2);
    ctx.arc(8, 0, 3, 0, Math.PI * 2);
    ctx.arc(0, -8, 3, 0, Math.PI * 2);
    ctx.arc(0, 8, 3, 0, Math.PI * 2);
    ctx.fill();

    // Dark Cockpit Center
    ctx.fillStyle = C64_COLORS.radarCopterDark;
    ctx.beginPath();
    ctx.arc(0, 0, 3.5, 0, Math.PI * 2);
    ctx.fill();

    // White Center Hub
    ctx.fillStyle = C64_COLORS.white;
    ctx.beginPath();
    ctx.arc(0, 0, 1.5, 0, Math.PI * 2);
    ctx.fill();

    // 3. Spinning 4-Blade Rotor Animation
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.lineWidth = 1.2;
    const bladeR = 12;

    for (let i = 0; i < 4; i++) {
      const bAngle = rotor + (i * Math.PI) / 2;
      const bx = Math.cos(bAngle) * bladeR;
      const by = Math.sin(bAngle) * bladeR;

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(bx, by);
      ctx.stroke();
    }

    // Rotor disc blur when airborne
    if (alt > 0.1) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.beginPath();
      ctx.arc(0, 0, bladeR, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.restore();
  }

  private drawRadarMiniMap(ctx: CanvasRenderingContext2D, engine: TopografieEuropaEngine) {
    const rw = 52;
    const rh = 40;
    const rx = SCREEN_WIDTH - rw - 8;
    const ry = HUD_TOP_HEIGHT + 6;

    // Semi-transparent dark background & border
    ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    ctx.fillRect(rx, ry, rw, rh);
    ctx.strokeStyle = C64_COLORS.white;
    ctx.lineWidth = 1;
    ctx.strokeRect(rx, ry, rw, rh);

    if (this.offscreenRadar) {
      ctx.save();
      ctx.beginPath();
      ctx.rect(rx, ry, rw, rh);
      ctx.clip();
      ctx.drawImage(this.offscreenRadar, 0, 0, 64, 48, rx, ry, rw, rh);

      const radarScaleX = rw / WORLD_WIDTH;
      const radarScaleY = rh / WORLD_HEIGHT;

      // Viewport rectangle
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.lineWidth = 1;
      ctx.strokeRect(
        rx + engine.cameraX * radarScaleX,
        ry + engine.cameraY * radarScaleY,
        SCREEN_WIDTH * radarScaleX,
        VIEW_HEIGHT * radarScaleY
      );

      // Target blip (Red) - ONLY IN EASY MODE!
      // In HARD mode (default), the radar minimap only displays the player helicopter and terrain without a cheat dot!
      if (engine.currentMission && engine.difficulty === 'easy') {
        ctx.fillStyle = '#ff2222';
        ctx.beginPath();
        ctx.arc(
          rx + engine.currentMission.x * radarScaleX,
          ry + engine.currentMission.y * radarScaleY,
          2.5,
          0,
          Math.PI * 2
        );
        ctx.fill();
      }

      // Player position blip (Yellow)
      ctx.fillStyle = '#ffff00';
      ctx.beginPath();
      ctx.arc(
        rx + engine.x * radarScaleX,
        ry + engine.y * radarScaleY,
        2.5,
        0,
        Math.PI * 2
      );
      ctx.fill();

      ctx.restore();
    }
  }

  private drawBottomHud(ctx: CanvasRenderingContext2D, engine: TopografieEuropaEngine, lang: 'nl' | 'en') {
    const by = SCREEN_HEIGHT - HUD_BOTTOM_HEIGHT;

    ctx.fillStyle = C64_COLORS.black;
    ctx.fillRect(0, by, SCREEN_WIDTH, HUD_BOTTOM_HEIGHT);

    ctx.textBaseline = 'middle';

    // 1. Landing Result Banner (teleprompter feedback)
    if (engine.landingResult) {
      const res = engine.landingResult;
      ctx.font = 'bold 8px monospace';
      ctx.textAlign = 'center';

      if (res.type === 'success' || res.type === 'close') {
        ctx.fillStyle = C64_COLORS.brightYellow;
      } else if (res.type === 'refuel') {
        ctx.fillStyle = C64_COLORS.brightCyan;
      } else {
        ctx.fillStyle = C64_COLORS.lightRed;
      }

      ctx.fillText(res.message[lang], SCREEN_WIDTH / 2, by + HUD_BOTTOM_HEIGHT / 2);
      return;
    }

    // 2. Game Over
    if (engine.isGameOver) {
      ctx.font = 'bold 8px monospace';
      ctx.textAlign = 'center';
      ctx.fillStyle = C64_COLORS.brightYellow;
      const isComplete = engine.completedCount >= engine.totalMissions && engine.totalMissions > 0;
      if (isComplete) {
        ctx.fillText(
          lang === 'nl' ? '*** GEFELICITEERD! ALLE MISSIES VOLBRACHT! ***' : '*** CONGRATULATIONS! ALL MISSIONS COMPLETED! ***',
          SCREEN_WIDTH / 2,
          by + HUD_BOTTOM_HEIGHT / 2
        );
      } else {
        ctx.fillText(
          lang === 'nl' ? '*** TIJD IS OM! SPEL AFGELOPEN ***' : '*** TIME UP! GAME OVER ***',
          SCREEN_WIDTH / 2,
          by + HUD_BOTTOM_HEIGHT / 2
        );
      }
      return;
    }

    // 3. Active Mission Target Display (ANKARA / BULGARIJE as seen in screenshots)
    if (engine.currentMission) {
      ctx.textAlign = 'left';
      ctx.font = 'bold 10px monospace';

      const targetName = engine.currentMission.name[lang].toUpperCase();
      ctx.fillStyle = C64_COLORS.brightCyan;
      ctx.fillText(targetName, 12, by + HUD_BOTTOM_HEIGHT / 2);

      ctx.textAlign = 'right';
      ctx.font = '7px monospace';
      ctx.fillStyle = C64_COLORS.white;

      const actionPrompt =
        engine.flightState === 'airborne'
          ? (lang === 'nl' ? 'SPATIE: DALEN & LANDEN' : 'SPACE: DESCEND & LAND')
          : (lang === 'nl' ? 'SPATIE: OPSTIJGEN' : 'SPACE: TAKE OFF');

      ctx.fillText(actionPrompt, SCREEN_WIDTH - 12, by + HUD_BOTTOM_HEIGHT / 2);
    } else {
      ctx.textAlign = 'center';
      ctx.font = 'bold 8px monospace';
      ctx.fillStyle = C64_COLORS.brightCyan;
      ctx.fillText(
        lang === 'nl' ? 'VRIJE VLUCHT DOOR HEEL EUROPA' : 'FREE FLIGHT OVER EUROPE',
        SCREEN_WIDTH / 2,
        by + HUD_BOTTOM_HEIGHT / 2
      );
    }
  }

  private drawEndReportCard(ctx: CanvasRenderingContext2D, engine: TopografieEuropaEngine, lang: 'nl' | 'en') {
    const rx = 10;
    const ry = HUD_TOP_HEIGHT + 6;
    const rw = SCREEN_WIDTH - 20;
    const rh = VIEW_HEIGHT - 12;

    // Draw C64 Blue background
    ctx.fillStyle = '#1c2b75'; // Authentic C64 Blue
    ctx.fillRect(rx, ry, rw, rh);

    // Draw C64 Light Blue border
    ctx.strokeStyle = '#7b96ff'; // Authentic C64 Light Blue
    ctx.lineWidth = 2;
    ctx.strokeRect(rx, ry, rw, rh);

    // Header
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.font = 'bold 9px monospace';
    ctx.fillStyle = C64_COLORS.brightYellow;
    ctx.fillText(lang === 'nl' ? '*** C64 TOPOGRAFIE RAPPORT ***' : '*** C64 GEOGRAPHY REPORT ***', SCREEN_WIDTH / 2, ry + 5);

    // Subheader with Mode & Difficulty
    ctx.font = '7px monospace';
    ctx.fillStyle = C64_COLORS.white;
    const modeLabel = engine.gameMode === 'capitals' ? (lang === 'nl' ? 'HOOFDSTEDEN' : 'CAPITALS')
                    : engine.gameMode === 'countries' ? (lang === 'nl' ? 'LANDEN' : 'COUNTRIES')
                    : engine.gameMode === 'cities' ? (lang === 'nl' ? 'STEDEN & HAVENS' : 'CITIES & PORTS')
                    : engine.gameMode === 'geo' ? (lang === 'nl' ? 'RIVIEREN & NATUUR' : 'RIVERS & GEOGRAPHY')
                    : (lang === 'nl' ? 'GEOGRAFIE' : 'GEOGRAPHY');
    const diffLabel = engine.difficulty === 'hard' ? (lang === 'nl' ? 'MOEILIJK (Zonder Baken)' : 'HARD (No Beacon)') : (lang === 'nl' ? 'MAKKELIJK (Met Baken)' : 'EASY (With Beacon)');
    ctx.fillText(`${modeLabel} • ${diffLabel}`, SCREEN_WIDTH / 2, ry + 16);

    // Line separator
    ctx.strokeStyle = '#7b96ff';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(rx + 8, ry + 25);
    ctx.lineTo(rx + rw - 8, ry + 25);
    ctx.stroke();

    // Render columns of history
    ctx.textAlign = 'left';
    ctx.font = 'bold 7px monospace';
    
    const maxLines = 10;
    const startY = ry + 29;
    const rowHeight = 9;

    const history = engine.missionHistory;

    for (let i = 0; i < maxLines; i++) {
      const cy = startY + i * rowHeight;
      ctx.fillStyle = '#7b96ff';
      ctx.fillText(`${i + 1}.`, rx + 12, cy);

      const record = history[i];
      if (record) {
        ctx.fillStyle = C64_COLORS.white;
        const nameClean = record.targetName[lang].toUpperCase().substring(0, 16);
        ctx.fillText(nameClean, rx + 26, cy);

        // Score & status
        if (record.type === 'success') {
          ctx.fillStyle = C64_COLORS.green;
          ctx.fillText(lang === 'nl' ? 'EXACT HIT' : 'EXACT HIT', rx + 120, cy);
          ctx.textAlign = 'right';
          ctx.fillText(`+${record.points} PT`, rx + rw - 12, cy);
          ctx.textAlign = 'left';
        } else if (record.type === 'close') {
          ctx.fillStyle = C64_COLORS.brightYellow;
          ctx.fillText(`+${record.distanceKm} KM`, rx + 120, cy);
          ctx.textAlign = 'right';
          ctx.fillText(`+${record.points} PT`, rx + rw - 12, cy);
          ctx.textAlign = 'left';
        } else {
          ctx.fillStyle = C64_COLORS.red;
          ctx.fillText(lang === 'nl' ? 'GEMIST' : 'MISSED', rx + 120, cy);
          ctx.textAlign = 'right';
          ctx.fillText('0 PT', rx + rw - 12, cy);
          ctx.textAlign = 'left';
        }
      } else {
        // Empty placeholder
        ctx.fillStyle = '#4f69db';
        ctx.fillText('----------------', rx + 26, cy);
      }
    }

    // Line separator
    ctx.strokeStyle = '#7b96ff';
    ctx.beginPath();
    ctx.moveTo(rx + 8, ry + 121);
    ctx.lineTo(rx + rw - 8, ry + 121);
    ctx.stroke();

    // Grade and Total score at the bottom
    ctx.fillStyle = C64_COLORS.brightYellow;
    ctx.font = 'bold 8px monospace';
    ctx.textAlign = 'left';
    
    const landedCount = history.filter(h => h.type === 'success' || h.type === 'close').length;
    const rawGrade = 1.0 + (landedCount * 0.9); 
    const grade = Math.min(10.0, Math.max(1.0, parseFloat(rawGrade.toFixed(1))));

    const gradeLabel = lang === 'nl' ? `RAPPORTCIJFER: ${grade.toFixed(1)}/10` : `SCHOOL MARK: ${grade.toFixed(1)}/10`;
    ctx.fillText(gradeLabel, rx + 12, ry + 129);

    ctx.textAlign = 'right';
    const totalLabel = lang === 'nl' ? `TOTAAL: ${engine.score} PNT` : `TOTAL: ${engine.score} PTS`;
    ctx.fillText(totalLabel, rx + rw - 12, ry + 129);

    // Flashing restart prompt at the bottom
    ctx.textAlign = 'center';
    ctx.font = '7px monospace';
    const isFlash = Math.sin(this.blinkTimer * 4.5) > 0;
    ctx.fillStyle = isFlash ? C64_COLORS.white : '#7b96ff';
    ctx.fillText(
      lang === 'nl' ? 'DRUK SPATIE / KLIK HIER OM OPNIEUW TE BEGINNEN' : 'PRESS SPACE / CLICK HERE TO PLAY AGAIN',
      SCREEN_WIDTH / 2,
      ry + rh - 6
    );
  }

  private drawCrtScanlines(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
    for (let y = 0; y < SCREEN_HEIGHT; y += 2) {
      ctx.fillRect(0, y, SCREEN_WIDTH, 1);
    }
  }
}
