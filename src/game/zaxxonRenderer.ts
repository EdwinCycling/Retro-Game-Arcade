/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Authentic 1982 Sega Zaxxon Isometric 2.5D Canvas Renderer
 * Faithfully recreating the 1982 arcade visual aesthetic:
 * - Up-Right (~30°) isometric axonometric projection
 * - Cobalt blue runway deck with neon cyan directional chevron arrows
 * - Multi-level left fortress industrial battlements & radar towers
 * - Concrete hazard-striped barrier walls & pulsing electric force fields
 * - Authentic ground targets: Orange Fuel tanks, SAM missile silos, Green/Orange Turrets, Radars & Parked Jets
 * - Up-Right oriented Z-21 Fighter craft with roll bank animations & ground altitude shadow
 * - Pixel-accurate Sega 1982 HUD: TOP / 1UP, Left Altimeter (H/L), Equalizer Fuel gauge (E/F), and ENEMY PLANE count
 */

import { ZaxxonEngine, FortressWall, GroundTarget } from './zaxxonEngine';

export class ZaxxonRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const context = canvas.getContext('2d', { alpha: false });
    if (!context) throw new Error('Could not get 2D context');
    this.ctx = context;
  }

  public render(engine: ZaxxonEngine) {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    // 1. Deep space background fill
    ctx.fillStyle = '#030712';
    ctx.fillRect(0, 0, w, h);

    // 2. Starfield (visible in all stages, behind or in deep space)
    this.drawStarfield(engine);

    // 3. Fortress Base Grid, Runway & Left Battlement Wall (in Stage 1 and Stage 3)
    if (engine.stage === 'fortress_1' || engine.stage === 'fortress_2_boss') {
      this.drawFortressFloor(engine);
      this.drawLeftFortressWall(engine);
    }

    // 4. Ground Targets & Barrier Walls
    if (engine.stage === 'fortress_1' || engine.stage === 'fortress_2_boss') {
      this.drawGroundTargets(engine);
      this.drawWalls(engine);
    }

    // 5. Space Enemies (Stage 2)
    if (engine.stage === 'space') {
      this.drawSpaceEnemies(engine);
    }

    // 6. Robot Boss (Stage 3)
    if (engine.stage === 'fortress_2_boss' && engine.robotBoss) {
      this.drawRobotBoss(engine);
    }

    // 7. Enemy Bullets
    this.drawEnemyBullets(engine);

    // 8. Player Ship & Shadow
    if (!engine.isDying && (!engine.isGameOver || engine.isStageClearing)) {
      this.drawPlayerShadow(engine);
      this.drawPlayerShip(engine);
    }

    // 9. Player Bullets / Lasers
    this.drawPlayerBullets(engine);

    // 10. Explosions & Particles
    this.drawParticles(engine);

    // 11. Authentic Sega Arcade HUD
    this.drawHUD(engine);

    // 12. CRT Scanlines
    if (engine.settings.scanlines) {
      this.drawScanlines();
    }
  }

  private drawStarfield(engine: ZaxxonEngine) {
    const ctx = this.ctx;
    ctx.save();
    for (const star of engine.stars) {
      ctx.fillStyle = `rgba(220, 235, 255, ${star.brightness})`;
      ctx.fillRect(star.x, star.y, star.size, star.size);
    }
    ctx.restore();
  }

  /**
   * Draws the iconic Sega cobalt blue isometric runway deck
   */
  private drawFortressFloor(engine: ZaxxonEngine) {
    const ctx = this.ctx;
    ctx.save();

    const corridorMinX = -150;
    const corridorMaxX = 150;
    const viewNearY = engine.playerY - 220;
    const viewFarY = engine.playerY + 800;

    // Floor surface corners
    const p1 = engine.worldToScreen(corridorMinX, viewNearY, 0);
    const p2 = engine.worldToScreen(corridorMaxX, viewNearY, 0);
    const p3 = engine.worldToScreen(corridorMaxX, viewFarY, 0);
    const p4 = engine.worldToScreen(corridorMinX, viewFarY, 0);

    // 1. Deck base fill: Classic 1982 Sega royal cobalt blue
    const deckBaseColor = engine.stage === 'fortress_1' ? '#0033aa' : '#221133';
    ctx.fillStyle = deckBaseColor;
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.lineTo(p3.x, p3.y);
    ctx.lineTo(p4.x, p4.y);
    ctx.closePath();
    ctx.fill();

    // 2. Right border cliff drop-off into deep space
    const pDrop2 = { x: p2.x, y: p2.y + 45 };
    const pDrop3 = { x: p3.x, y: p3.y + 45 };
    ctx.fillStyle = '#020b1e';
    ctx.beginPath();
    ctx.moveTo(p2.x, p2.y);
    ctx.lineTo(p3.x, p3.y);
    ctx.lineTo(pDrop3.x, pDrop3.y);
    ctx.lineTo(pDrop2.x, pDrop2.y);
    ctx.closePath();
    ctx.fill();

    // Right rim cyan neon edge
    ctx.strokeStyle = '#00d0ff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(p2.x, p2.y);
    ctx.lineTo(p3.x, p3.y);
    ctx.stroke();

    // 3. Runway grid lines
    ctx.strokeStyle = engine.stage === 'fortress_1' ? 'rgba(0, 180, 255, 0.28)' : 'rgba(230, 70, 150, 0.3)';
    ctx.lineWidth = 1;

    // Longitudinal lane lines (parallel to flight path towards top-right)
    const xStep = 30;
    for (let x = corridorMinX; x <= corridorMaxX; x += xStep) {
      const start = engine.worldToScreen(x, viewNearY, 0);
      const end = engine.worldToScreen(x, viewFarY, 0);
      ctx.beginPath();
      ctx.moveTo(start.x, start.y);
      ctx.lineTo(end.x, end.y);
      ctx.stroke();
    }

    // Transverse lane stripes (scrolling)
    const yStep = 50;
    const startY = Math.floor(viewNearY / yStep) * yStep;
    for (let y = startY; y <= viewFarY; y += yStep) {
      const start = engine.worldToScreen(corridorMinX, y, 0);
      const end = engine.worldToScreen(corridorMaxX, y, 0);
      ctx.beginPath();
      ctx.moveTo(start.x, start.y);
      ctx.lineTo(end.x, end.y);
      ctx.stroke();
    }

    // 4. Directional Chevron Runway Arrows (Authentic Sega Arcade detail from image)
    const arrowStep = 180;
    const arrowStartY = Math.floor(viewNearY / arrowStep) * arrowStep;
    for (let y = arrowStartY; y <= viewFarY; y += arrowStep) {
      // Draw 2 chevron arrows pointing UP-RIGHT along runway
      for (const arrowX of [-45, 45]) {
        const tip = engine.worldToScreen(arrowX, y + 24, 0);
        const leftWing = engine.worldToScreen(arrowX - 18, y, 0);
        const rightWing = engine.worldToScreen(arrowX + 18, y, 0);
        const notch = engine.worldToScreen(arrowX, y + 8, 0);

        ctx.fillStyle = '#00f0ff';
        ctx.beginPath();
        ctx.moveTo(tip.x, tip.y);
        ctx.lineTo(rightWing.x, rightWing.y);
        ctx.lineTo(notch.x, notch.y);
        ctx.lineTo(leftWing.x, leftWing.y);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }

    // Centerline dashed guide line
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.setLineDash([12, 14]);
    const centerStart = engine.worldToScreen(0, viewNearY, 0);
    const centerEnd = engine.worldToScreen(0, viewFarY, 0);
    ctx.beginPath();
    ctx.moveTo(centerStart.x, centerStart.y);
    ctx.lineTo(centerEnd.x, centerEnd.y);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.restore();
  }

  /**
   * Draws the massive multi-tier left fortress industrial battlements & radar wall
   */
  private drawLeftFortressWall(engine: ZaxxonEngine) {
    const ctx = this.ctx;
    ctx.save();

    const wallX = -150;
    const viewNearY = engine.playerY - 220;
    const viewFarY = engine.playerY + 800;
    const wallHeight = 3.6;

    const baseNear = engine.worldToScreen(wallX, viewNearY, 0);
    const baseFar = engine.worldToScreen(wallX, viewFarY, 0);
    const topNear = engine.worldToScreen(wallX, viewNearY, wallHeight);
    const topFar = engine.worldToScreen(wallX, viewFarY, wallHeight);

    // Wall Top deck ledge
    const ledgeWidth = -60;
    const ledgeNear = engine.worldToScreen(wallX + ledgeWidth, viewNearY, wallHeight);
    const ledgeFar = engine.worldToScreen(wallX + ledgeWidth, viewFarY, wallHeight);

    // 1. Concrete front vertical wall face
    ctx.fillStyle = '#6b7a90';
    ctx.beginPath();
    ctx.moveTo(baseNear.x, baseNear.y);
    ctx.lineTo(baseFar.x, baseFar.y);
    ctx.lineTo(topFar.x, topFar.y);
    ctx.lineTo(topNear.x, topNear.y);
    ctx.closePath();
    ctx.fill();

    // 2. Concrete top ledge face
    ctx.fillStyle = '#94a3b8';
    ctx.beginPath();
    ctx.moveTo(topNear.x, topNear.y);
    ctx.lineTo(topFar.x, topFar.y);
    ctx.lineTo(ledgeFar.x, ledgeFar.y);
    ctx.lineTo(ledgeNear.x, ledgeNear.y);
    ctx.closePath();
    ctx.fill();

    // 3. Horizontal yellow caution hazard stripes along wall face
    ctx.strokeStyle = '#ffee00';
    ctx.lineWidth = 2;
    for (const h of [1.2, 2.4]) {
      const lineStart = engine.worldToScreen(wallX, viewNearY, h);
      const lineEnd = engine.worldToScreen(wallX, viewFarY, h);
      ctx.beginPath();
      ctx.moveTo(lineStart.x, lineStart.y);
      ctx.lineTo(lineEnd.x, lineEnd.y);
      ctx.stroke();
    }

    // 4. Observation Windows & Surveillance Slits
    const windowStep = 120;
    const startY = Math.floor(viewNearY / windowStep) * windowStep;
    for (let y = startY; y <= viewFarY; y += windowStep) {
      const wPos = engine.worldToScreen(wallX, y, 1.8);
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(wPos.x - 4, wPos.y - 4, 8, 8);
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(wPos.x - 2, wPos.y - 2, 4, 4);

      // Upper battlement gun port on top ledge
      const battlementPos = engine.worldToScreen(wallX - 20, y + 40, wallHeight);
      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(battlementPos.x - 6, battlementPos.y - 12, 12, 12);
      ctx.fillStyle = '#334155';
      ctx.fillRect(battlementPos.x - 3, battlementPos.y - 9, 6, 6);
    }

    // Edge highlight
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(topNear.x, topNear.y);
    ctx.lineTo(topFar.x, topFar.y);
    ctx.stroke();

    ctx.restore();
  }

  /**
   * Draws fortress barrier walls and electronic force fields
   */
  private drawWalls(engine: ZaxxonEngine) {
    // Sort walls from far to near for correct painter's algorithm depth
    const sortedWalls = [...engine.walls].sort((a, b) => b.y - a.y);

    for (const wall of sortedWalls) {
      const relY = wall.y - engine.stageDistance;
      if (relY < engine.playerY - 200 || relY > engine.playerY + 750) continue;

      if (wall.isForceField) {
        this.drawForceField(engine, wall, relY);
      } else {
        this.drawSolidWall(engine, wall, relY);
      }
    }
  }

  private drawSolidWall(engine: ZaxxonEngine, wall: FortressWall, relY: number) {
    const ctx = this.ctx;
    ctx.save();

    // Authentic Sega industrial gray wall colors with warning borders
    const wallFrontColor = '#64748b';
    const wallTopColor = '#94a3b8';
    const borderColor = '#f1f5f9';

    // Wall consists of 2 segments: Left of gap, and Right of gap
    const segments = [
      { minX: wall.minX, maxX: wall.gapMinX },
      { minX: wall.gapMaxX, maxX: wall.maxX }
    ];

    for (const seg of segments) {
      if (seg.maxX <= seg.minX) continue;

      const pBottomLeft = engine.worldToScreen(seg.minX, relY, 0);
      const pBottomRight = engine.worldToScreen(seg.maxX, relY, 0);
      const pTopLeft = engine.worldToScreen(seg.minX, relY, wall.height);
      const pTopRight = engine.worldToScreen(seg.maxX, relY, wall.height);

      // Front vertical face
      ctx.fillStyle = wallFrontColor;
      ctx.beginPath();
      ctx.moveTo(pBottomLeft.x, pBottomLeft.y);
      ctx.lineTo(pBottomRight.x, pBottomRight.y);
      ctx.lineTo(pTopRight.x, pTopRight.y);
      ctx.lineTo(pTopLeft.x, pTopLeft.y);
      ctx.closePath();
      ctx.fill();

      // Top horizontal ledge
      const pLedgeLeft = engine.worldToScreen(seg.minX, relY + 12, wall.height);
      const pLedgeRight = engine.worldToScreen(seg.maxX, relY + 12, wall.height);
      ctx.fillStyle = wallTopColor;
      ctx.beginPath();
      ctx.moveTo(pTopLeft.x, pTopLeft.y);
      ctx.lineTo(pTopRight.x, pTopRight.y);
      ctx.lineTo(pLedgeRight.x, pLedgeRight.y);
      ctx.lineTo(pLedgeLeft.x, pLedgeLeft.y);
      ctx.closePath();
      ctx.fill();

      // Hazard hazard warning chevrons on wall face
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 2;
      const heightStep = wall.height / 3;
      for (let h = heightStep; h < wall.height; h += heightStep) {
        const lineL = engine.worldToScreen(seg.minX, relY, h);
        const lineR = engine.worldToScreen(seg.maxX, relY, h);
        ctx.beginPath();
        ctx.moveTo(lineL.x, lineL.y);
        ctx.lineTo(lineR.x, lineR.y);
        ctx.stroke();
      }

      // Edge border
      ctx.strokeStyle = borderColor;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(pBottomLeft.x, pBottomLeft.y);
      ctx.lineTo(pBottomRight.x, pBottomRight.y);
      ctx.lineTo(pTopRight.x, pTopRight.y);
      ctx.lineTo(pTopLeft.x, pTopLeft.y);
      ctx.closePath();
      ctx.stroke();
    }

    // If wall has a closed header over the gap (window slot)
    if (wall.gapMaxZ < wall.height) {
      const pGapBottomLeft = engine.worldToScreen(wall.gapMinX, relY, wall.gapMaxZ);
      const pGapBottomRight = engine.worldToScreen(wall.gapMaxX, relY, wall.gapMaxZ);
      const pGapTopLeft = engine.worldToScreen(wall.gapMinX, relY, wall.height);
      const pGapTopRight = engine.worldToScreen(wall.gapMaxX, relY, wall.height);

      ctx.fillStyle = wallFrontColor;
      ctx.beginPath();
      ctx.moveTo(pGapBottomLeft.x, pGapBottomLeft.y);
      ctx.lineTo(pGapBottomRight.x, pGapBottomRight.y);
      ctx.lineTo(pGapTopRight.x, pGapTopRight.y);
      ctx.lineTo(pGapTopLeft.x, pGapTopLeft.y);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = borderColor;
      ctx.stroke();
    }

    ctx.restore();
  }

  private drawForceField(engine: ZaxxonEngine, wall: FortressWall, relY: number) {
    const ctx = this.ctx;
    ctx.save();

    // Twin electrical pylon towers on left and right
    const pylonLeft = engine.worldToScreen(wall.gapMinX, relY, 0);
    const pylonLeftTop = engine.worldToScreen(wall.gapMinX, relY, 3);
    const pylonRight = engine.worldToScreen(wall.gapMaxX, relY, 0);
    const pylonRightTop = engine.worldToScreen(wall.gapMaxX, relY, 3);

    // Draw Pylons
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(pylonLeft.x, pylonLeft.y);
    ctx.lineTo(pylonLeftTop.x, pylonLeftTop.y);
    ctx.moveTo(pylonRight.x, pylonRight.y);
    ctx.lineTo(pylonRightTop.x, pylonRightTop.y);
    ctx.stroke();

    // Force field electricity flicker
    const flicker = Math.floor((wall.forceFieldTimer || 0) / 10) % 2 === 0;
    if (flicker) {
      ctx.fillStyle = 'rgba(249, 115, 22, 0.32)';
      ctx.beginPath();
      ctx.moveTo(pylonLeft.x, pylonLeft.y);
      ctx.lineTo(pylonRight.x, pylonRight.y);
      ctx.lineTo(pylonRightTop.x, pylonRightTop.y);
      ctx.lineTo(pylonLeftTop.x, pylonLeftTop.y);
      ctx.closePath();
      ctx.fill();

      // Pulsing lightning bolts across field
      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 2;
      for (let z = 0.5; z <= 2.5; z += 0.8) {
        const left = engine.worldToScreen(wall.gapMinX, relY, z);
        const right = engine.worldToScreen(wall.gapMaxX, relY, z);
        ctx.beginPath();
        ctx.moveTo(left.x, left.y);
        const midX = (left.x + right.x) / 2 + (Math.random() - 0.5) * 10;
        const midY = (left.y + right.y) / 2 + (Math.random() - 0.5) * 8;
        ctx.lineTo(midX, midY);
        ctx.lineTo(right.x, right.y);
        ctx.stroke();
      }
    }

    ctx.restore();
  }

  /**
   * Draws Ground Targets: Fuel tanks, SAM missile silos, Green/Orange Turrets, Radars, and Parked Planes
   */
  private drawGroundTargets(engine: ZaxxonEngine) {
    const ctx = this.ctx;

    // Sort targets by Y distance for correct depth
    const sortedTargets = [...engine.targets].sort((a, b) => b.y - a.y);

    for (const target of sortedTargets) {
      if (target.destroyed) continue;

      const relY = target.y - engine.stageDistance;
      if (relY < engine.playerY - 200 || relY > engine.playerY + 750) continue;

      const pos = engine.worldToScreen(target.x, relY, 0);

      ctx.save();

      if (target.type === 'fuel') {
        // --- 1. ORANGE FUEL TANK (Matching image.png: orange body, white band, dark lid) ---
        const tankH = 22;
        const tankW = 24;

        // Base ground shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
        ctx.beginPath();
        ctx.ellipse(pos.x, pos.y + 4, 15, 8, 0, 0, Math.PI * 2);
        ctx.fill();

        // Tank Body: Bright Orange
        ctx.fillStyle = '#ff5500';
        ctx.beginPath();
        ctx.rect(pos.x - tankW / 2, pos.y - tankH, tankW, tankH);
        ctx.fill();

        // White reflective center band
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(pos.x - tankW / 2, pos.y - tankH * 0.65, tankW, 7);

        // Dark metallic top lid
        ctx.fillStyle = '#262626';
        ctx.beginPath();
        ctx.ellipse(pos.x, pos.y - tankH, tankW / 2, 6, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Pressure valve pip
        ctx.fillStyle = '#facc15';
        ctx.fillRect(pos.x - 2, pos.y - tankH - 4, 4, 4);

        // Bold black "FUEL" label on white stripe
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 7px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('FUEL', pos.x, pos.y - tankH * 0.65 + 6);

      } else if (target.type === 'turret') {
        // --- 2. GUN TURRET (Matching image.png: Green hemispherical dome, orange crown, dual guns) ---
        // Base plate
        ctx.fillStyle = '#334155';
        ctx.beginPath();
        ctx.ellipse(pos.x, pos.y, 16, 9, 0, 0, Math.PI * 2);
        ctx.fill();

        // Dome: Arcade Green
        ctx.fillStyle = '#22c55e';
        ctx.beginPath();
        ctx.arc(pos.x, pos.y - 6, 12, 0, Math.PI * 2);
        ctx.fill();

        // Orange top crown cap
        ctx.fillStyle = '#ff6600';
        ctx.beginPath();
        ctx.arc(pos.x, pos.y - 11, 6, 0, Math.PI * 2);
        ctx.fill();

        // Dual Gun barrels pointing towards incoming player (bottom-left)
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(pos.x - 4, pos.y - 6);
        ctx.lineTo(pos.x - 14, pos.y + 4);
        ctx.moveTo(pos.x + 2, pos.y - 6);
        ctx.lineTo(pos.x - 8, pos.y + 4);
        ctx.stroke();

      } else if (target.type === 'missile_silo') {
        // --- 3. SAM MISSILE SILO (Hex launch pad with vertical orange/white missile) ---
        // Circular silo base pit
        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        ctx.ellipse(pos.x, pos.y, 14, 8, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#00e5ff';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Missile position (rising if launched)
        const missileZ = target.missileLaunched ? (target.missileZ || 0) : 0.1;
        const missilePos = engine.worldToScreen(target.x, relY, missileZ);

        // Rocket body: Orange with white nosecone
        ctx.fillStyle = '#ff5500';
        ctx.fillRect(missilePos.x - 3, missilePos.y - 18, 6, 16);

        // White nosecone
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.moveTo(missilePos.x - 3, missilePos.y - 18);
        ctx.lineTo(missilePos.x, missilePos.y - 25);
        ctx.lineTo(missilePos.x + 3, missilePos.y - 18);
        ctx.closePath();
        ctx.fill();

        // Stabilizer fins
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.moveTo(missilePos.x - 3, missilePos.y - 6);
        ctx.lineTo(missilePos.x - 7, missilePos.y - 2);
        ctx.lineTo(missilePos.x - 3, missilePos.y - 2);
        ctx.moveTo(missilePos.x + 3, missilePos.y - 6);
        ctx.lineTo(missilePos.x + 7, missilePos.y - 2);
        ctx.lineTo(missilePos.x + 3, missilePos.y - 2);
        ctx.fill();

        // Exhaust launch thruster flame if ascending
        if (target.missileLaunched) {
          ctx.fillStyle = '#facc15';
          ctx.beginPath();
          ctx.ellipse(missilePos.x, missilePos.y + 4, 4, 8, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#ef4444';
          ctx.beginPath();
          ctx.ellipse(missilePos.x, missilePos.y + 8, 2, 5, 0, 0, Math.PI * 2);
          ctx.fill();
        }

      } else if (target.type === 'radar') {
        // --- 4. RADAR TOWER & SPINNING DISH ---
        const towerTop = engine.worldToScreen(target.x, relY, 0.7);

        // Mast
        ctx.strokeStyle = '#0284c7';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(pos.x, pos.y);
        ctx.lineTo(towerTop.x, towerTop.y);
        ctx.stroke();

        // Rotating dish
        const angle = target.radarAngle || 0;
        const dishW = 14 * Math.cos(angle);
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.ellipse(towerTop.x, towerTop.y, Math.max(3, Math.abs(dishW)), 10, 0.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.stroke();

      } else if (target.type === 'parked_plane') {
        // --- 5. PARKED ENEMY JET (Matching image.png: parked blue/white delta fighter on runway) ---
        // Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
        ctx.beginPath();
        ctx.ellipse(pos.x, pos.y + 2, 12, 6, -0.4, 0, Math.PI * 2);
        ctx.fill();

        // Parked plane pointing up-right
        ctx.save();
        ctx.translate(pos.x, pos.y - 6);
        ctx.rotate(-0.52); // ~30° angle along runway

        // Delta fuselage
        ctx.fillStyle = '#1e3a8a';
        ctx.beginPath();
        ctx.moveTo(12, 0); // Nose
        ctx.lineTo(-10, -8); // Left wing
        ctx.lineTo(-6, 0);   // Tail notch
        ctx.lineTo(-10, 8);  // Right wing
        ctx.closePath();
        ctx.fill();

        // White canopy & wing trims
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(-2, -2, 6, 4);

        ctx.restore();
      }

      ctx.restore();
    }
  }

  /**
   * Draws Stage 2: Deep Space Interceptor Fighters
   */
  private drawSpaceEnemies(engine: ZaxxonEngine) {
    const ctx = this.ctx;
    ctx.save();

    for (const enemy of engine.spaceEnemies) {
      if (!enemy.active) continue;

      // Enemy ground shadow in space
      const shadowPos = engine.worldToShadowScreen(enemy.x, enemy.y);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
      ctx.beginPath();
      ctx.ellipse(shadowPos.x, shadowPos.y, 10, 5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Enemy fighter craft at altitude
      const pos = engine.worldToScreen(enemy.x, enemy.y, enemy.z);

      ctx.save();
      ctx.translate(pos.x, pos.y);
      ctx.rotate(2.6); // Flying towards player (down-left)

      // Swept wing geometric interceptor
      ctx.fillStyle = enemy.color;
      ctx.beginPath();
      ctx.moveTo(14, 0); // Nose
      ctx.lineTo(-10, -10); // Wing left
      ctx.lineTo(-4, 0);   // Tail
      ctx.lineTo(-10, 10);  // Wing right
      ctx.closePath();
      ctx.fill();

      // Yellow core
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(0, 0, 3, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }

    ctx.restore();
  }

  /**
   * Draws Stage 3: Zaxxon Robot Boss & Chest Homing Missile
   */
  private drawRobotBoss(engine: ZaxxonEngine) {
    const boss = engine.robotBoss;
    if (!boss || !boss.active || boss.destroyed) return;

    const ctx = this.ctx;
    ctx.save();

    const relY = boss.y - engine.stageDistance;
    const shadowPos = engine.worldToShadowScreen(boss.x, relY);

    // Giant boss ground shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.beginPath();
    ctx.ellipse(shadowPos.x, shadowPos.y, 36, 18, 0, 0, Math.PI * 2);
    ctx.fill();

    // Robot body at altitude z = 1.2
    const bodyPos = engine.worldToScreen(boss.x, relY, 1.2);

    // Torso / Head
    ctx.fillStyle = '#475569';
    ctx.beginPath();
    ctx.rect(bodyPos.x - 28, bodyPos.y - 42, 56, 48);
    ctx.fill();
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Glowing red visor eyes
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(bodyPos.x - 20, bodyPos.y - 34, 40, 8);

    // Chest missile launcher bay
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(bodyPos.x - 12, bodyPos.y - 16, 24, 16);

    // HP indicator pips
    ctx.fillStyle = '#22c55e';
    for (let i = 0; i < boss.hp; i++) {
      ctx.fillRect(bodyPos.x - 22 + i * 8, bodyPos.y - 52, 6, 5);
    }

    // Boss Homing Missile (if launched)
    if (boss.missileLaunched && boss.missileHp > 0) {
      const mShadow = engine.worldToShadowScreen(boss.missileX, boss.missileY);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.beginPath();
      ctx.ellipse(mShadow.x, mShadow.y, 10, 5, 0, 0, Math.PI * 2);
      ctx.fill();

      const mPos = engine.worldToScreen(boss.missileX, boss.missileY, boss.missileZ);

      // Large glowing homing missile
      ctx.fillStyle = '#f97316';
      ctx.beginPath();
      ctx.arc(mPos.x, mPos.y, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(mPos.x, mPos.y, 4, 0, Math.PI * 2);
      ctx.fill();

      // Flame exhaust
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.ellipse(mPos.x + 8, mPos.y - 4, 5, 8, 0.5, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  /**
   * Draws player's ground shadow (essential for altitude judgment!)
   */
  private drawPlayerShadow(engine: ZaxxonEngine) {
    const ctx = this.ctx;
    ctx.save();

    const shadowPos = engine.worldToShadowScreen(engine.playerX, engine.playerY);

    // Authentic dark isometric ground shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.beginPath();
    ctx.ellipse(shadowPos.x, shadowPos.y, 18, 9, -0.52, 0, Math.PI * 2);
    ctx.fill();

    // Altitude reference guideline connecting shadow to ship (Sega Zaxxon visual aid)
    if (engine.playerZ > 0.2) {
      const shipPos = engine.worldToScreen(engine.playerX, engine.playerY, engine.playerZ);
      ctx.strokeStyle = 'rgba(0, 229, 255, 0.2)';
      ctx.setLineDash([2, 4]);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(shadowPos.x, shadowPos.y);
      ctx.lineTo(shipPos.x, shipPos.y);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    ctx.restore();
  }

  /**
   * Draws the authentic 1982 Z-21 Fighter craft pointing towards TOP-RIGHT
   */
  private drawPlayerShip(engine: ZaxxonEngine) {
    const ctx = this.ctx;
    ctx.save();

    const pos = engine.worldToScreen(engine.playerX, engine.playerY, engine.playerZ);

    // Invulnerability flashing
    if (engine.invulnerableTimer > 0 && Math.floor(engine.invulnerableTimer / 8) % 2 === 0) {
      ctx.globalAlpha = 0.4;
    }

    ctx.translate(pos.x, pos.y);

    // Base forward angle towards TOP-RIGHT (~ -30° or -0.52 rad) + bank roll
    ctx.rotate(-0.52 + engine.playerRoll);

    // --- 1. TWIN JET THRUSTER EXHAUST FLAMES ---
    const flameLength = 8 + Math.random() * 8;
    ctx.fillStyle = '#ff6600';
    ctx.beginPath();
    ctx.ellipse(-14, -4, flameLength, 3, 0, 0, Math.PI * 2);
    ctx.ellipse(-14, 4, flameLength, 3, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffea00';
    ctx.beginPath();
    ctx.ellipse(-12, -4, flameLength * 0.6, 2, 0, 0, Math.PI * 2);
    ctx.ellipse(-12, 4, flameLength * 0.6, 2, 0, 0, Math.PI * 2);
    ctx.fill();

    // --- 2. Z-21 DELTA WING FUSELAGE ---
    // Deep Charcoal / Navy main fuselage
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.moveTo(18, 0);   // Nosecone pointing forward (Top-Right)
    ctx.lineTo(-14, -14); // Left wingtip
    ctx.lineTo(-8, -4);   // Left engine intake notch
    ctx.lineTo(-12, 0);   // Center tail
    ctx.lineTo(-8, 4);    // Right engine intake notch
    ctx.lineTo(-14, 14);  // Right wingtip
    ctx.closePath();
    ctx.fill();

    // Wing panels: Vivid Sega Royal Blue
    ctx.fillStyle = '#1d4ed8';
    ctx.beginPath();
    ctx.moveTo(16, 0);
    ctx.lineTo(-10, -11);
    ctx.lineTo(-6, -3);
    ctx.lineTo(2, 0);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(16, 0);
    ctx.lineTo(-10, 11);
    ctx.lineTo(-6, 3);
    ctx.lineTo(2, 0);
    ctx.closePath();
    ctx.fill();

    // Yellow & Orange Wing Hazard Markings (from arcade cabinet art)
    ctx.fillStyle = '#facc15';
    ctx.beginPath();
    ctx.moveTo(10, 0);
    ctx.lineTo(-6, -9);
    ctx.lineTo(-4, -6);
    ctx.lineTo(4, 0);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(10, 0);
    ctx.lineTo(-6, 9);
    ctx.lineTo(-4, 6);
    ctx.lineTo(4, 0);
    ctx.closePath();
    ctx.fill();

    // Red Laser Blaster Pods on Wingtips
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(-14, -14, 5, 2);
    ctx.fillRect(-14, 12, 5, 2);

    // Center Cockpit Fuselage
    ctx.fillStyle = '#e2e8f0';
    ctx.beginPath();
    ctx.ellipse(2, 0, 8, 3, 0, 0, Math.PI * 2);
    ctx.fill();

    // Golden Amber Cockpit Bubble Canopy
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.ellipse(3, 0, 5, 2, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  /**
   * Draws Player's Twin Lasers firing towards TOP-RIGHT
   */
  private drawPlayerBullets(engine: ZaxxonEngine) {
    const ctx = this.ctx;
    ctx.save();

    for (const bullet of engine.bullets) {
      if (!bullet.active) continue;

      // Laser ground shadow
      const sPos = engine.worldToShadowScreen(bullet.x, bullet.y);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.beginPath();
      ctx.ellipse(sPos.x, sPos.y, 6, 3, -0.52, 0, Math.PI * 2);
      ctx.fill();

      // Laser projectile (twin cyan energy bolts)
      const pos = engine.worldToScreen(bullet.x, bullet.y, bullet.z);
      ctx.fillStyle = '#00f0ff';
      ctx.shadowColor = '#00f0ff';
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.ellipse(pos.x, pos.y, 8, 3, -0.52, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.ellipse(pos.x, pos.y, 4, 1.5, -0.52, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    ctx.restore();
  }

  private drawEnemyBullets(engine: ZaxxonEngine) {
    const ctx = this.ctx;
    ctx.save();

    for (const bullet of engine.enemyBullets) {
      if (!bullet.active) continue;
      const pos = engine.worldToScreen(bullet.x, bullet.y, bullet.z);

      ctx.fillStyle = '#ef4444';
      ctx.shadowColor = '#ef4444';
      ctx.shadowBlur = 4;
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    ctx.restore();
  }

  /**
   * Draws arcade explosion bursts (matching image.png fireball bursts)
   */
  private drawParticles(engine: ZaxxonEngine) {
    const ctx = this.ctx;
    ctx.save();

    for (const p of engine.particles) {
      const pos = engine.worldToScreen(p.x, p.y, p.z);
      const alpha = 1 - p.life / p.maxLife;
      ctx.fillStyle = p.color;
      ctx.globalAlpha = Math.max(0, alpha);
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  /**
   * Draws authentic 1982 Sega Zaxxon arcade HUD (matching image.png pixel-for-pixel):
   * - Top Left: TOP [score] in Cyan, 1UP [score] in White
   * - Left Side: Altimeter (Red H, segmented Cyan/Green LED bar, Green L)
   * - Bottom Left: Reserve Lives icons, FUEL label in Green, Equalizer Tooth Bar (E/F)
   * - Bottom Right: ENEMY PLANE = [count], © SEGA 1982
   */
  private drawHUD(engine: ZaxxonEngine) {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    ctx.save();

    // --- 1. TOP-LEFT SCORE & HIGH SCORE BAR ---
    ctx.font = 'bold 16px "Courier New", Courier, monospace';
    ctx.textAlign = 'left';

    // "TOP" in bright Cyan
    ctx.fillStyle = '#00f0ff';
    ctx.fillText('TOP', 24, 28);
    ctx.fillText(`${engine.highScore.toString().padStart(6, '0')}`, 72, 28);

    // "1UP" in crisp White
    ctx.fillStyle = '#ffffff';
    ctx.fillText('1UP', 24, 48);
    ctx.fillText(`${engine.score.toString().padStart(6, '0')}`, 72, 48);

    // Round indicator
    ctx.fillStyle = '#facc15';
    ctx.textAlign = 'center';
    ctx.fillText(`ROUND ${engine.round}`, w / 2, 28);

    // --- 2. LEFT ALTIMETER (Authentic Sega Height Gauge with Red H and Green L) ---
    const altX = 30;
    const altY = h * 0.35;
    const altH = 160;
    const altW = 12;

    // Red "H" at top
    ctx.fillStyle = '#ef4444';
    ctx.font = 'bold 16px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('H', altX, altY - 8);

    // Green "L" at bottom
    ctx.fillStyle = '#22c55e';
    ctx.fillText('L', altX, altY + altH + 18);

    // Background track
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(altX - altW / 2, altY, altW, altH);
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1;
    ctx.strokeRect(altX - altW / 2, altY, altW, altH);

    // Segmented altitude bars (e.g. 16 discrete LED steps)
    const numSteps = 16;
    const stepH = altH / numSteps;
    const playerStep = Math.round((Math.max(0, Math.min(3, engine.playerZ)) / 3) * (numSteps - 1));

    for (let i = 0; i < numSteps; i++) {
      const segY = altY + altH - (i + 1) * stepH;
      if (i <= playerStep) {
        // Active altitude block: Green at bottom, Cyan at mid, Yellow at high
        ctx.fillStyle = i > 12 ? '#facc15' : i > 6 ? '#00f0ff' : '#22c55e';
        ctx.fillRect(altX - altW / 2 + 1, segY + 1, altW - 2, stepH - 2);
      } else {
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(altX - altW / 2 + 1, segY + 1, altW - 2, stepH - 2);
      }
    }

    // --- 3. BOTTOM-LEFT LIVES & EQUALIZER FUEL BAR ---
    // Reserve lives: mini Z-21 ships
    const livesY = h - 55;
    for (let i = 0; i < Math.max(0, engine.lives - 1); i++) {
      const lx = 28 + i * 22;
      ctx.save();
      ctx.translate(lx, livesY);
      ctx.rotate(-0.52);
      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.moveTo(8, 0);
      ctx.lineTo(-6, -6);
      ctx.lineTo(-3, 0);
      ctx.lineTo(-6, 6);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    // "FUEL" in bright Arcade Green
    ctx.fillStyle = '#00ff00';
    ctx.font = 'bold 14px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('FUEL', 24, h - 24);

    // Fuel Equalizer Teeth Bar
    const fuelX = 72;
    const fuelY = h - 35;
    const fuelW = 180;
    const fuelH = 14;

    // Red "E" (Empty)
    ctx.fillStyle = '#ef4444';
    ctx.font = 'bold 13px monospace';
    ctx.textAlign = 'right';
    ctx.fillText('E', fuelX - 6, fuelY + 11);

    // Red "F" (Full)
    ctx.fillStyle = '#ef4444';
    ctx.textAlign = 'left';
    ctx.fillText('F', fuelX + fuelW + 6, fuelY + 11);

    // Equalizer teeth (vertical orange slats)
    const numTeeth = 24;
    const toothW = fuelW / numTeeth;
    const fuelRatio = Math.max(0, Math.min(1, engine.fuel / engine.maxFuel));
    const activeTeeth = Math.round(fuelRatio * numTeeth);

    for (let i = 0; i < numTeeth; i++) {
      const tx = fuelX + i * toothW;
      if (i < activeTeeth) {
        // Active tooth
        let toothColor = '#ff6600';
        if (engine.fuel < 25) {
          toothColor = Math.floor(performance.now() / 150) % 2 === 0 ? '#ef4444' : '#7f1d1d';
        } else if (engine.fuel < 50) {
          toothColor = '#facc15';
        }
        ctx.fillStyle = toothColor;
        ctx.fillRect(tx + 1, fuelY, toothW - 2, fuelH);
      } else {
        // Empty tooth slot
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(tx + 1, fuelY, toothW - 2, fuelH);
      }
    }

    // Orange Indicator Flag Marker at current fuel level
    const markerX = fuelX + activeTeeth * toothW;
    ctx.fillStyle = '#ff5500';
    ctx.beginPath();
    ctx.moveTo(markerX, fuelY - 4);
    ctx.lineTo(markerX - 4, fuelY - 9);
    ctx.lineTo(markerX + 4, fuelY - 9);
    ctx.closePath();
    ctx.fill();

    // --- 4. BOTTOM-RIGHT ENEMY PLANE COUNTER & SEGA COPYRIGHT ---
    const rightX = w - 24;
    ctx.textAlign = 'right';
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px monospace';
    ctx.fillText('ENEMY', rightX, h - 56);
    ctx.fillText('PLANE', rightX, h - 42);

    // Plane icon & count
    ctx.fillStyle = '#ef4444';
    ctx.fillText(`= ${engine.enemyPlanesRemaining}`, rightX, h - 26);

    // Miniature red enemy plane icon next to count
    ctx.save();
    ctx.translate(rightX - 45, h - 30);
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.moveTo(6, 0);
    ctx.lineTo(-5, -4);
    ctx.lineTo(-2, 0);
    ctx.lineTo(-5, 4);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // © SEGA 1982
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.font = '10px monospace';
    ctx.fillText('© SEGA 1982', rightX, h - 10);

    // --- 5. OVERLAYS (Game Over, Paused, Stage Clear) ---
    if (engine.isGameOver) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.78)';
      ctx.fillRect(0, h * 0.38, w, 110);

      ctx.fillStyle = '#ef4444';
      ctx.font = 'black 32px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('GAME OVER', w / 2, h * 0.46);

      ctx.fillStyle = '#facc15';
      ctx.font = 'bold 14px monospace';
      ctx.fillText('PRESS FIRE OR RESTART TO PLAY AGAIN', w / 2, h * 0.52);
    } else if (engine.isPaused) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
      ctx.fillRect(0, h * 0.40, w, 90);

      ctx.fillStyle = '#38bdf8';
      ctx.font = 'black 28px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('PAUSED', w / 2, h * 0.48);
    } else if (engine.isStageClearing) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
      ctx.fillRect(0, h * 0.38, w, 90);

      ctx.fillStyle = '#22c55e';
      ctx.font = 'black 24px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('ZONE COMPLETED!', w / 2, h * 0.46);
      ctx.fillStyle = '#facc15';
      ctx.font = 'bold 13px monospace';
      ctx.fillText(engine.stage === 'fortress_1' ? 'ENTERING DEEP SPACE...' : 'PREPARING NEXT ASSAULT...', w / 2, h * 0.51);
    }

    ctx.restore();
  }

  private drawScanlines() {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.18)';
    for (let y = 0; y < h; y += 3) {
      ctx.fillRect(0, y, w, 1);
    }
    ctx.restore();
  }
}
