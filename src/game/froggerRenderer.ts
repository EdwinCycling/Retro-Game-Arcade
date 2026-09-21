/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Frogger (Atari 2600 / Arcade 1982) Canvas 2D Pixel Renderer
 */

import { CANVAS_WIDTH, CANVAS_HEIGHT, FroggerEngine, ROW_HEIGHT, COL_WIDTH } from './froggerEngine';
import { RiverObstacle, RoadObstacle } from './froggerTypes';

export class FroggerRenderer {
  private ctx: CanvasRenderingContext2D;
  public enableCRT: boolean = true;

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
  }

  public render(engine: FroggerEngine) {
    const ctx = this.ctx;
    ctx.save();

    // 1. Clear background
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // 2. Render Scoreboard Header
    this.renderHeader(engine);

    // 3. Render World Layers (River, Homes, Safe strips, Road)
    this.renderEnvironment(engine);

    // 4. Render Moving Obstacles (Logs, Turtles, Cars, Trucks)
    this.renderObstacles(engine);

    // 5. Render Player Frog
    this.renderFrog(engine);

    // 6. Render Particles
    this.renderParticles(engine);

    // 7. Render Footer (Timer Bar, Lives & Level)
    this.renderFooter(engine);

    // 8. Render Overlays (Title, Game Over, Level Clear)
    if (engine.gameState === 'TITLE') {
      this.renderTitleOverlay();
    } else if (engine.gameState === 'GAME_OVER') {
      this.renderGameOverOverlay(engine);
    } else if (engine.gameState === 'LEVEL_CLEARED') {
      this.renderLevelClearOverlay(engine);
    }

    // 9. CRT Scanline Filter
    if (this.enableCRT) {
      this.renderCRTOverlay();
    }

    ctx.restore();
  }

  private renderHeader(engine: FroggerEngine) {
    const ctx = this.ctx;
    ctx.font = 'bold 12px monospace';
    ctx.textBaseline = 'top';

    // 1-UP (Current Score)
    ctx.fillStyle = '#ff4444';
    ctx.fillText('1-UP', 30, 6);
    ctx.fillStyle = '#ffffff';
    ctx.fillText(engine.score.toString().padStart(5, '0'), 30, 20);

    // HI-SCORE
    ctx.fillStyle = '#ff4444';
    ctx.fillText('HI-SCORE', CANVAS_WIDTH / 2 - 28, 6);
    ctx.fillStyle = '#ffff55';
    ctx.fillText(Math.max(engine.score, engine.highScore).toString().padStart(5, '0'), CANVAS_WIDTH / 2 - 20, 20);

    // Atari badge / mode
    if (engine.isAtariMode) {
      ctx.fillStyle = '#f97316';
      ctx.fillText('ATARI 2600', CANVAS_WIDTH - 90, 10);
    } else {
      ctx.fillStyle = '#38bdf8';
      ctx.fillText('ARCADE 1982', CANVAS_WIDTH - 95, 10);
    }
  }

  private renderEnvironment(engine: FroggerEngine) {
    const ctx = this.ctx;
    const isAtari = engine.isAtariMode;

    // RIVER SECTION (Rows 1 to 5, Y = 64 to 224)
    ctx.fillStyle = isAtari ? '#1e1b4b' : '#000088';
    ctx.fillRect(0, 64, CANVAS_WIDTH, 160);

    // Subtle river flow ripples
    ctx.fillStyle = isAtari ? '#312e81' : '#0011bb';
    for (let y = 68; y < 224; y += 16) {
      const offset = (performance.now() / 60) % 32;
      for (let x = -32; x < CANVAS_WIDTH + 32; x += 32) {
        ctx.fillRect(x + offset, y, 14, 2);
      }
    }

    // HOME BAY SECTION (Row 0, Y = 32 to 64)
    // Dark green riverbank background
    ctx.fillStyle = isAtari ? '#14532d' : '#006600';
    ctx.fillRect(0, 32, CANVAS_WIDTH, 32);

    // Draw the 5 open water bays
    for (const bay of engine.homeBays) {
      // Open water bay
      ctx.fillStyle = isAtari ? '#1e1b4b' : '#000088';
      ctx.fillRect(bay.x, 32, 36, 32);

      // Water lily / reed decoration
      ctx.fillStyle = '#15803d';
      ctx.fillRect(bay.x + 2, 60, 32, 4);

      // If bay is filled with a frog
      if (bay.isFilled) {
        this.drawHappyFrog(bay.x + 4, 34);
      } else if (bay.hasFly) {
        // Juicy bonus fly
        this.drawBonusFly(bay.x + 10, 40);
      }
    }

    // MIDDLE SIDEWALK (Row 6, Y = 224 to 256)
    ctx.fillStyle = isAtari ? '#6b21a8' : '#880088';
    ctx.fillRect(0, 224, CANVAS_WIDTH, 32);
    // Sidewalk texture stones
    ctx.fillStyle = isAtari ? '#7e22ce' : '#aa00aa';
    for (let x = 0; x < CANVAS_WIDTH; x += 16) {
      ctx.fillRect(x, 226, 14, 28);
    }

    // HIGHWAY ROAD (Rows 7 to 11, Y = 256 to 416)
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 256, CANVAS_WIDTH, 160);

    // Lane dividing dashed lines
    ctx.fillStyle = '#555555';
    for (let r = 1; r < 5; r++) {
      const lineY = 256 + r * 32;
      for (let x = 8; x < CANVAS_WIDTH; x += 24) {
        ctx.fillRect(x, lineY - 1, 12, 2);
      }
    }

    // STARTING SIDEWALK (Row 12, Y = 416 to 448)
    ctx.fillStyle = isAtari ? '#6b21a8' : '#880088';
    ctx.fillRect(0, 416, CANVAS_WIDTH, 32);
    ctx.fillStyle = isAtari ? '#7e22ce' : '#aa00aa';
    for (let x = 0; x < CANVAS_WIDTH; x += 16) {
      ctx.fillRect(x, 418, 14, 28);
    }
  }

  private renderObstacles(engine: FroggerEngine) {
    const ctx = this.ctx;

    for (const lane of engine.lanes) {
      if (lane.speed === 0) continue;

      if (lane.row >= 1 && lane.row <= 5) {
        // RIVER OBSTACLES
        for (const item of lane.items as RiverObstacle[]) {
          if (item.type.startsWith('log')) {
            this.drawLog(item.x, lane.y, item.width, engine.isAtariMode);
          } else if (item.type.startsWith('turtles')) {
            const count = item.type === 'turtles_3' ? 3 : 2;
            this.drawTurtles(item.x, lane.y, count, item.diveState || 0, engine.isAtariMode);
          }
        }
      } else if (lane.row >= 7 && lane.row <= 11) {
        // ROAD VEHICLES
        for (const car of lane.items as RoadObstacle[]) {
          this.drawVehicle(car.x, lane.y, car.type, lane.speed > 0, engine.isAtariMode);
        }
      }
    }
  }

  private drawLog(x: number, y: number, width: number, isAtari: boolean) {
    const ctx = this.ctx;
    const logH = 24;
    const logY = y + 4;

    // Log body
    ctx.fillStyle = isAtari ? '#92400e' : '#a0522d';
    ctx.fillRect(x, logY, width, logH);

    // Rounded ends
    ctx.fillStyle = isAtari ? '#78350f' : '#8b4513';
    ctx.fillRect(x, logY + 2, 4, logH - 4);
    ctx.fillRect(x + width - 4, logY + 2, 4, logH - 4);

    // Woodgrain stripes
    ctx.fillStyle = isAtari ? '#b45309' : '#cd853f';
    ctx.fillRect(x + 8, logY + 5, width - 16, 3);
    ctx.fillRect(x + 12, logY + 14, width - 24, 3);
  }

  private drawTurtles(x: number, y: number, count: number, diveState: number, isAtari: boolean) {
    const ctx = this.ctx;
    if (diveState === 2) {
      // Submerged - show water bubbles only
      ctx.fillStyle = 'rgba(85, 255, 255, 0.4)';
      for (let i = 0; i < count; i++) {
        const tx = x + i * 32 + 10;
        ctx.fillRect(tx, y + 10, 8, 8);
      }
      return;
    }

    const turtleW = 28;
    const turtleH = 22;
    const legPhase = Math.floor(performance.now() / 150) % 2;

    for (let i = 0; i < count; i++) {
      const tx = x + i * 32 + 2;
      const ty = y + 5;

      // Diving warning color change
      const shellColor = diveState === 1 
        ? '#0284c7' // Blueish warning
        : (isAtari ? '#ea580c' : '#cc3300'); // Classic red-orange retro shell

      // Swimming flippers
      ctx.fillStyle = '#15803d';
      if (legPhase === 0) {
        ctx.fillRect(tx - 2, ty + 2, 4, 6);
        ctx.fillRect(tx - 2, ty + turtleH - 8, 4, 6);
        ctx.fillRect(tx + turtleW - 2, ty + 2, 4, 6);
        ctx.fillRect(tx + turtleW - 2, ty + turtleH - 8, 4, 6);
      } else {
        ctx.fillRect(tx, ty - 2, 6, 4);
        ctx.fillRect(tx, ty + turtleH - 2, 6, 4);
        ctx.fillRect(tx + turtleW - 6, ty - 2, 6, 4);
        ctx.fillRect(tx + turtleW - 6, ty + turtleH - 2, 6, 4);
      }

      // Shell
      ctx.fillStyle = shellColor;
      ctx.beginPath();
      ctx.ellipse(tx + turtleW / 2, ty + turtleH / 2, turtleW / 2, turtleH / 2, 0, 0, Math.PI * 2);
      ctx.fill();

      // Shell rings
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(tx + 8, ty + 6, turtleW - 16, turtleH - 12);
    }
  }

  private drawVehicle(x: number, y: number, type: RoadObstacle['type'], movingRight: boolean, isAtari: boolean) {
    const ctx = this.ctx;
    const vY = y + 6;

    if (type === 'truck') {
      // Large Freight Truck
      const truckW = 75;
      const truckH = 20;

      // Cargo Trailer
      ctx.fillStyle = isAtari ? '#0284c7' : '#ffffff';
      ctx.fillRect(x, vY, truckW - 16, truckH);

      // Cab
      ctx.fillStyle = isAtari ? '#e11d48' : '#cc0000';
      const cabX = movingRight ? x + truckW - 16 : x;
      ctx.fillRect(cabX, vY + 2, 16, truckH - 4);

      // Wheels
      ctx.fillStyle = '#000000';
      ctx.fillRect(x + 4, vY - 2, 8, 4);
      ctx.fillRect(x + 4, vY + truckH - 2, 8, 4);
      ctx.fillRect(x + truckW - 12, vY - 2, 8, 4);
      ctx.fillRect(x + truckW - 12, vY + truckH - 2, 8, 4);
    } else if (type === 'racecar') {
      // Sleek Racing Hot Rod
      const carW = 34;
      const carH = 20;
      ctx.fillStyle = isAtari ? '#dc2626' : '#ffffff';
      ctx.fillRect(x + 4, vY + 4, carW - 8, carH - 8);

      // Spoiler & nose
      ctx.fillStyle = '#ef4444';
      if (movingRight) {
        ctx.fillRect(x, vY + 2, 4, carH - 4); // Rear spoiler
        ctx.fillRect(x + carW - 6, vY + 6, 6, carH - 12); // Front nose
      } else {
        ctx.fillRect(x + carW - 4, vY + 2, 4, carH - 4);
        ctx.fillRect(x, vY + 6, 6, carH - 12);
      }

      // Wheels
      ctx.fillStyle = '#333333';
      ctx.fillRect(x + 6, vY - 1, 6, 3);
      ctx.fillRect(x + 6, vY + carH - 2, 6, 3);
      ctx.fillRect(x + carW - 12, vY - 1, 6, 3);
      ctx.fillRect(x + carW - 12, vY + carH - 2, 6, 3);
    } else if (type === 'tractor') {
      // Tractor / Bulldozer
      const carW = 38;
      const carH = 20;
      ctx.fillStyle = isAtari ? '#ca8a04' : '#ff9900';
      ctx.fillRect(x + 4, vY + 3, carW - 8, carH - 6);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x + 12, vY + 6, 8, carH - 12); // Cabin window

      // Crawler tracks
      ctx.fillStyle = '#444444';
      ctx.fillRect(x + 2, vY - 1, carW - 4, 3);
      ctx.fillRect(x + 2, vY + carH - 2, carW - 4, 3);
    } else {
      // Standard Sedans (Pink or Yellow)
      const carW = 36;
      const carH = 20;
      const bodyColor = type === 'car_pink' ? '#ec4899' : '#eab308';

      ctx.fillStyle = bodyColor;
      ctx.fillRect(x + 4, vY + 3, carW - 8, carH - 6);

      // Windshield
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(x + 10, vY + 5, carW - 20, carH - 10);

      // Wheels
      ctx.fillStyle = '#111111';
      ctx.fillRect(x + 6, vY - 1, 6, 3);
      ctx.fillRect(x + 6, vY + carH - 2, 6, 3);
      ctx.fillRect(x + carW - 12, vY - 1, 6, 3);
      ctx.fillRect(x + carW - 12, vY + carH - 2, 6, 3);
    }
  }

  private renderFrog(engine: FroggerEngine) {
    const f = engine.frog;
    const ctx = this.ctx;

    if (engine.gameState === 'DYING') {
      // Draw death skull / splash icon
      ctx.save();
      ctx.fillStyle = engine.deathReason === 'DROWN' ? '#55ffff' : '#ff4444';
      ctx.font = 'bold 20px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(engine.deathReason === 'DROWN' ? '♒' : '☠', f.x + 16, f.y + 16);
      ctx.restore();
      return;
    }

    ctx.save();
    ctx.translate(f.x + COL_WIDTH / 2, f.y + ROW_HEIGHT / 2);

    // Rotate according to facing direction
    if (f.dir === 'DOWN') ctx.rotate(Math.PI);
    else if (f.dir === 'LEFT') ctx.rotate(-Math.PI / 2);
    else if (f.dir === 'RIGHT') ctx.rotate(Math.PI / 2);

    // Frog Dimensions
    const isHopping = f.isHopping;
    const bodyColor = '#22c55e'; // Bright arcade green
    const eyeColor = '#ffffff';

    // Back legs (stretched if hopping, folded if crouching)
    ctx.fillStyle = bodyColor;
    if (isHopping) {
      // Stretched jumping legs
      ctx.fillRect(-12, 4, 5, 12);
      ctx.fillRect(7, 4, 5, 12);
      // Feet
      ctx.fillRect(-15, 14, 8, 3);
      ctx.fillRect(7, 14, 8, 3);
    } else {
      // Folded sitting legs
      ctx.fillRect(-11, 2, 5, 7);
      ctx.fillRect(6, 2, 5, 7);
    }

    // Front arms
    if (isHopping) {
      ctx.fillRect(-11, -12, 4, 9);
      ctx.fillRect(7, -12, 4, 9);
    } else {
      ctx.fillRect(-10, -6, 4, 6);
      ctx.fillRect(6, -6, 4, 6);
    }

    // Body oval
    ctx.beginPath();
    ctx.ellipse(0, 0, 7, 9, 0, 0, Math.PI * 2);
    ctx.fill();

    // Belly stripe
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.ellipse(0, 2, 4, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Eyes
    ctx.fillStyle = eyeColor;
    ctx.fillRect(-6, -9, 4, 4);
    ctx.fillRect(2, -9, 4, 4);
    // Pupils
    ctx.fillStyle = '#000000';
    ctx.fillRect(-5, -9, 2, 2);
    ctx.fillRect(3, -9, 2, 2);

    ctx.restore();
  }

  private drawHappyFrog(x: number, y: number) {
    const ctx = this.ctx;
    ctx.fillStyle = '#22c55e';
    ctx.fillRect(x + 6, y + 6, 16, 14);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x + 8, y + 4, 4, 4);
    ctx.fillRect(x + 16, y + 4, 4, 4);
    ctx.fillStyle = '#000000';
    ctx.fillRect(x + 9, y + 5, 2, 2);
    ctx.fillRect(x + 17, y + 5, 2, 2);
  }

  private drawBonusFly(x: number, y: number) {
    const ctx = this.ctx;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x, y, 16, 12);
    ctx.fillStyle = '#000000';
    ctx.fillRect(x + 4, y + 2, 8, 8);
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(x + 6, y + 4, 4, 4);
  }

  private renderParticles(engine: FroggerEngine) {
    const ctx = this.ctx;
    for (const p of engine.particles) {
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
      ctx.restore();
    }
  }

  private renderFooter(engine: FroggerEngine) {
    const ctx = this.ctx;
    const footerY = 458;

    // Remaining Lives Icons
    ctx.fillStyle = '#22c55e';
    for (let i = 0; i < Math.max(0, engine.lives - 1); i++) {
      const lx = 24 + i * 18;
      ctx.fillRect(lx, footerY + 16, 12, 10);
      ctx.fillRect(lx + 2, footerY + 13, 3, 3);
      ctx.fillRect(lx + 7, footerY + 13, 3, 3);
    }

    // Time Label
    ctx.font = 'bold 12px monospace';
    ctx.fillStyle = '#ffff55';
    ctx.textAlign = 'right';
    ctx.fillText('TIME', 320, footerY + 10);

    // Time Progress Bar
    const barWidth = 100;
    const barHeight = 12;
    const barX = 330;
    const barY = footerY;

    ctx.strokeStyle = '#555555';
    ctx.lineWidth = 2;
    ctx.strokeRect(barX, barY, barWidth, barHeight);

    const timeRatio = Math.max(0, engine.timeRemaining / engine.maxTime);
    const filledWidth = barWidth * timeRatio;

    // Bar color changes based on urgency
    let barColor = '#22c55e';
    if (engine.timeRemaining <= 5) {
      barColor = Math.floor(performance.now() / 150) % 2 === 0 ? '#ef4444' : '#ffffff';
    } else if (engine.timeRemaining <= 10) {
      barColor = '#eab308';
    }

    ctx.fillStyle = barColor;
    ctx.fillRect(barX + 2, barY + 2, Math.max(0, filledWidth - 4), barHeight - 4);

    // Current Level tag
    ctx.textAlign = 'center';
    ctx.fillStyle = '#38bdf8';
    ctx.fillText(`LEVEL ${engine.level}`, CANVAS_WIDTH / 2, footerY + 26);
  }

  private renderTitleOverlay() {
    const ctx = this.ctx;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.82)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Title border
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 4;
    ctx.strokeRect(16, 16, CANVAS_WIDTH - 32, CANVAS_HEIGHT - 32);

    ctx.textAlign = 'center';
    ctx.font = 'bold 44px monospace';
    ctx.fillStyle = '#000000';
    ctx.fillText('F R O G G E R', CANVAS_WIDTH / 2 + 3, 113);
    ctx.fillStyle = '#22c55e';
    ctx.fillText('F R O G G E R', CANVAS_WIDTH / 2, 110);

    ctx.font = 'bold 13px monospace';
    ctx.fillStyle = '#ffff55';
    ctx.fillText('PARKER BROTHERS / ATARI 2600 (C) 1982', CANVAS_WIDTH / 2, 145);

    // Big animated display frog
    ctx.save();
    ctx.translate(CANVAS_WIDTH / 2, 210);
    ctx.scale(2.5, 2.5);
    ctx.fillStyle = '#22c55e';
    ctx.beginPath();
    ctx.ellipse(0, 0, 10, 12, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.ellipse(0, 2, 6, 7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-8, -12, 5, 5);
    ctx.fillRect(3, -12, 5, 5);
    ctx.fillStyle = '#000000';
    ctx.fillRect(-7, -11, 3, 3);
    ctx.fillRect(4, -11, 3, 3);
    ctx.restore();

    // Instructions Box
    const boxY = 270;
    ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
    ctx.fillRect(35, boxY, CANVAS_WIDTH - 70, 130);
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1;
    ctx.strokeRect(35, boxY, CANVAS_WIDTH - 70, 130);

    ctx.fillStyle = '#67e8f9';
    ctx.font = 'bold 13px monospace';
    ctx.fillText('★ MISSIE: LEID 5 KIKKERS NAAR HUIS ★', CANVAS_WIDTH / 2, boxY + 24);

    ctx.fillStyle = '#ffffff';
    ctx.font = '12px monospace';
    ctx.fillText('Doorkruis de drukke snelweg', CANVAS_WIDTH / 2, boxY + 50);
    ctx.fillText('& spring over boomstammen en schildpadden!', CANVAS_WIDTH / 2, boxY + 70);

    ctx.fillStyle = '#cbd5e1';
    ctx.font = '11px monospace';
    ctx.fillText('Pijltoetsen • WASD • Numpad 8/4/6/2 • Swipe / Touch', CANVAS_WIDTH / 2, boxY + 95);
    ctx.fillText('Pas op voor duikende schildpadden!', CANVAS_WIDTH / 2, boxY + 115);

    // Blinking prompt
    ctx.fillStyle = Math.floor(performance.now() / 350) % 2 === 0 ? '#4ade80' : '#ffff55';
    ctx.font = 'bold 14px monospace';
    ctx.fillText('► KLIK HIER OF DRUK SPATIE OM TE BEGINNEN ◄', CANVAS_WIDTH / 2, CANVAS_HEIGHT - 45);
  }

  private renderGameOverOverlay(engine: FroggerEngine) {
    const ctx = this.ctx;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    ctx.textAlign = 'center';
    ctx.font = 'bold 36px monospace';
    ctx.fillStyle = '#ef4444';
    ctx.fillText('G A M E   O V E R', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 40);

    ctx.font = 'bold 16px monospace';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`EINDSCORE: ${engine.score.toLocaleString()}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 10);
    ctx.fillText(`BEREIKT LEVEL: ${engine.level}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 35);

    ctx.fillStyle = Math.floor(performance.now() / 350) % 2 === 0 ? '#4ade80' : '#fef08a';
    ctx.font = 'bold 13px monospace';
    ctx.fillText('► KLIK OF DRUK OP SPATIE VOOR HERSTART ◄', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 90);
  }

  private renderLevelClearOverlay(engine: FroggerEngine) {
    const ctx = this.ctx;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    ctx.textAlign = 'center';
    ctx.font = 'bold 32px monospace';
    ctx.fillStyle = '#4ade80';
    ctx.fillText('LEVEL VOLTOOID!', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 30);

    ctx.font = 'bold 16px monospace';
    ctx.fillStyle = '#ffff55';
    ctx.fillText('+1000 BONUS PUNTEN', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 10);
    ctx.fillStyle = '#38bdf8';
    ctx.fillText(`VOORBEREIDEN OP LEVEL ${engine.level + 1}...`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 45);
  }

  private renderCRTOverlay() {
    const ctx = this.ctx;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.12)';
    for (let y = 0; y < CANVAS_HEIGHT; y += 3) {
      ctx.fillRect(0, y, CANVAS_WIDTH, 1);
    }
  }
}
