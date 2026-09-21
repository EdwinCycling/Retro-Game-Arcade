/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Rocket Raid Canvas Renderer (BBC Micro / Acorn Electron Mode 2 raster)
 * Supports 'grey' (Acorn Grijs Monochroom), 'color' (Mode 2), and 'green' phosphor.
 */

import { RocketRaidEngine, NATIVE_HEIGHT, NATIVE_WIDTH, SECTIONS } from './rocketRaidEngine';
import { DisplayPalette } from './rocketRaidTypes';

export class RocketRaidRenderer {
  private ctx: CanvasRenderingContext2D;
  public palette: DisplayPalette = 'grey'; // Default to grey as user explicitly played and requested!
  public enableCRT: boolean = true;

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
  }

  public setPalette(p: DisplayPalette) {
    this.palette = p;
  }

  public render(engine: RocketRaidEngine) {
    const ctx = this.ctx;
    ctx.save();

    // Background clearing
    ctx.fillStyle = '#08090c';
    ctx.fillRect(0, 0, NATIVE_WIDTH, NATIVE_HEIGHT);

    // Draw stars in background (sections 1, 3, 4)
    if (engine.currentSectionIndex === 1 || engine.currentSectionIndex === 3 || engine.currentSectionIndex === 4) {
      this.drawStars(engine.worldScrollX);
    }

    // Draw terrain (floor and optional ceiling)
    this.drawTerrain(engine);

    // Draw Ground entities
    this.drawGroundEntities(engine);

    // Draw Meteors (Section 3)
    this.drawMeteors(engine);

    // Draw Dancing Aliens (Section 2)
    this.drawDancingAliens(engine);

    // Draw Final Base (Section 5)
    if (engine.finalBase && engine.currentSectionIndex === 5) {
      this.drawFinalBase(engine);
    }

    // Draw Lasers & Bombs
    this.drawProjectiles(engine);

    // Draw Particles
    this.drawParticles(engine);

    // Draw Player Ship
    if (engine.player.isAlive && engine.gameState === 'PLAYING') {
      this.drawPlayer(engine);
    }

    // Draw HUD
    this.drawHUD(engine);

    // Draw Game State Overlays
    if (engine.gameState === 'TITLE') {
      this.drawTitleScreen(engine);
    } else if (engine.gameState === 'GAMEOVER') {
      this.drawGameOver(engine);
    } else if (engine.gameState === 'VICTORY') {
      this.drawVictory(engine);
    }

    // Scanlines
    if (this.enableCRT) {
      this.drawScanlines();
    }

    ctx.restore();
  }

  private getColor(originalColor: string): string {
    if (this.palette === 'grey') {
      // Map colors to authentic BBC Micro monochrome grey phosphor
      switch (originalColor) {
        case '#ec4899': return '#94a3b8'; // magenta -> mid grey
        case '#06b6d4': return '#cbd5e1'; // cyan -> light grey
        case '#22c55e': return '#94a3b8'; // green -> mid grey
        case '#3b82f6': return '#64748b'; // blue -> slate grey
        case '#eab308': return '#e2e8f0'; // yellow -> white grey
        case '#f43f5e': return '#e2e8f0'; // red laser -> bright white
        case '#facc15': return '#f8fafc'; // bomb/gold -> white
        default: return '#cbd5e1';
      }
    } else if (this.palette === 'green') {
      // Acorn Green Screen monitor
      return '#22c55e';
    }
    return originalColor;
  }

  private drawStars(scrollX: number) {
    const ctx = this.ctx;
    ctx.fillStyle = this.palette === 'grey' ? '#64748b' : this.palette === 'green' ? '#15803d' : '#94a3b8';
    for (let i = 0; i < 40; i++) {
      const sx = ((i * 73) - scrollX * 0.25) % NATIVE_WIDTH;
      const x = sx < 0 ? sx + NATIVE_WIDTH : sx;
      const y = 20 + ((i * 37) % (NATIVE_HEIGHT - 60));
      ctx.fillRect(Math.floor(x), Math.floor(y), 1.5, 1.5);
    }
  }

  private drawTerrain(engine: RocketRaidEngine) {
    const ctx = this.ctx;
    const secConfig = SECTIONS[engine.currentSectionIndex - 1] || SECTIONS[0];
    const terrainColor = this.getColor(secConfig.colorTheme);

    ctx.save();
    ctx.fillStyle = terrainColor;
    ctx.strokeStyle = terrainColor;
    ctx.lineWidth = 1;

    // Floor
    ctx.beginPath();
    ctx.moveTo(0, NATIVE_HEIGHT);
    for (let screenX = 0; screenX <= NATIVE_WIDTH; screenX += 8) {
      const worldX = engine.worldScrollX + screenX;
      const floorY = engine.getFloorYAt(worldX);
      ctx.lineTo(screenX, floorY);
    }
    ctx.lineTo(NATIVE_WIDTH, NATIVE_HEIGHT);
    ctx.closePath();
    ctx.fill();

    // Terrain top border accent
    ctx.beginPath();
    for (let screenX = 0; screenX <= NATIVE_WIDTH; screenX += 8) {
      const worldX = engine.worldScrollX + screenX;
      const floorY = engine.getFloorYAt(worldX);
      if (screenX === 0) ctx.moveTo(screenX, floorY);
      else ctx.lineTo(screenX, floorY);
    }
    ctx.strokeStyle = this.palette === 'grey' ? '#f8fafc' : '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Ceiling if present
    if (secConfig.hasCeiling) {
      ctx.fillStyle = terrainColor;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      for (let screenX = 0; screenX <= NATIVE_WIDTH; screenX += 8) {
        const worldX = engine.worldScrollX + screenX;
        const ceilY = engine.getCeilingYAt(worldX) ?? 30;
        ctx.lineTo(screenX, ceilY);
      }
      ctx.lineTo(NATIVE_WIDTH, 0);
      ctx.closePath();
      ctx.fill();

      // Ceiling bottom border
      ctx.beginPath();
      for (let screenX = 0; screenX <= NATIVE_WIDTH; screenX += 8) {
        const worldX = engine.worldScrollX + screenX;
        const ceilY = engine.getCeilingYAt(worldX) ?? 30;
        if (screenX === 0) ctx.moveTo(screenX, ceilY);
        else ctx.lineTo(screenX, ceilY);
      }
      ctx.strokeStyle = this.palette === 'grey' ? '#f8fafc' : '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    ctx.restore();
  }

  private drawGroundEntities(engine: RocketRaidEngine) {
    const ctx = this.ctx;

    // Fuel Depots
    for (const f of engine.fuelDepots) {
      if (f.destroyed) continue;
      const sx = f.x - engine.worldScrollX;
      if (sx < -20 || sx > NATIVE_WIDTH + 20) continue;

      ctx.save();
      const tankColor = this.getColor('#38bdf8');
      ctx.fillStyle = tankColor;
      ctx.fillRect(sx, f.y, f.width, f.height);
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 7px monospace';
      ctx.fillText('FUEL', sx + 1, f.y + 9);
      ctx.restore();
    }

    // Radar Bases
    for (const rb of engine.radarBases) {
      if (rb.destroyed) continue;
      const sx = rb.x - engine.worldScrollX;
      if (sx < -20 || sx > NATIVE_WIDTH + 20) continue;

      ctx.save();
      ctx.fillStyle = this.getColor('#fbbf24');
      ctx.fillRect(sx + 3, rb.y + 4, rb.width - 6, rb.height - 4); // base
      // dish
      ctx.beginPath();
      ctx.arc(sx + rb.width / 2, rb.y + 3, 5, Math.PI, 0, false);
      ctx.strokeStyle = this.getColor('#fbbf24');
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.restore();
    }

    // Ground Rockets
    for (const r of engine.groundRockets) {
      const sx = r.x - engine.worldScrollX;
      if (sx < -20 || sx > NATIVE_WIDTH + 20 || r.y < -20) continue;

      ctx.save();
      const rocketColor = this.getColor('#f97316');
      ctx.fillStyle = rocketColor;
      // Rocket body
      ctx.fillRect(sx + 1, r.y + 4, r.width - 2, r.height - 4);
      // Nose cone
      ctx.beginPath();
      ctx.moveTo(sx + r.width / 2, r.y);
      ctx.lineTo(sx, r.y + 4);
      ctx.lineTo(sx + r.width, r.y + 4);
      ctx.closePath();
      ctx.fillStyle = this.palette === 'grey' ? '#ffffff' : '#ffffff';
      ctx.fill();

      // Launch thrust flame if launched
      if (r.launched) {
        ctx.fillStyle = this.getColor('#facc15');
        ctx.beginPath();
        ctx.moveTo(sx + 1, r.y + r.height);
        ctx.lineTo(sx + r.width / 2, r.y + r.height + 6);
        ctx.lineTo(sx + r.width - 1, r.y + r.height);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();
    }
  }

  private drawDancingAliens(engine: RocketRaidEngine) {
    const ctx = this.ctx;
    for (const a of engine.dancingAliens) {
      if (a.y < -50) continue;
      const sx = a.x - engine.worldScrollX;
      if (sx < -20 || sx > NATIVE_WIDTH + 20) continue;

      ctx.save();
      ctx.fillStyle = this.getColor('#a855f7');
      if (a.type === 'saucer') {
        ctx.beginPath();
        ctx.ellipse(sx + a.width / 2, a.y + a.height / 2, a.width / 2, a.height / 3, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(sx + a.width / 2 - 1.5, a.y + 1, 3, 3);
      } else {
        // Mine
        ctx.fillRect(sx + 2, a.y + 2, a.width - 4, a.height - 4);
        ctx.strokeStyle = this.getColor('#e2e8f0');
        ctx.strokeRect(sx, a.y, a.width, a.height);
      }
      ctx.restore();
    }
  }

  private drawMeteors(engine: RocketRaidEngine) {
    const ctx = this.ctx;
    for (const m of engine.meteors) {
      ctx.save();
      ctx.fillStyle = this.getColor('#22c55e');
      ctx.beginPath();
      ctx.arc(m.x, m.y, m.size / 2, 0, Math.PI * 2);
      ctx.fill();
      // tail
      ctx.strokeStyle = this.getColor('#16a34a');
      ctx.beginPath();
      ctx.moveTo(m.x, m.y);
      ctx.lineTo(m.x - m.vx * 3, m.y - m.vy * 3);
      ctx.stroke();
      ctx.restore();
    }
  }

  private drawFinalBase(engine: RocketRaidEngine) {
    if (!engine.finalBase) return;
    const ctx = this.ctx;
    const sx = engine.finalBase.x - engine.worldScrollX;
    if (sx < -40 || sx > NATIVE_WIDTH + 40) return;

    ctx.save();
    ctx.fillStyle = this.getColor('#eab308');
    ctx.fillRect(sx, engine.finalBase.y, engine.finalBase.width, engine.finalBase.height);

    // Pulsing reactor core
    const pulse = Math.sin(engine.finalBase.pulsing) * 4;
    ctx.fillStyle = this.palette === 'grey' ? '#ffffff' : '#ef4444';
    ctx.beginPath();
    ctx.arc(
      sx + engine.finalBase.width / 2,
      engine.finalBase.y + engine.finalBase.height / 2,
      6 + pulse,
      0,
      Math.PI * 2
    );
    ctx.fill();

    ctx.fillStyle = '#000000';
    ctx.font = 'bold 7px monospace';
    ctx.fillText('CORE', sx + 6, engine.finalBase.y + 12);
    ctx.restore();
  }

  private drawProjectiles(engine: RocketRaidEngine) {
    const ctx = this.ctx;

    // Lasers
    ctx.fillStyle = this.getColor('#f43f5e');
    for (const l of engine.lasers) {
      ctx.fillRect(l.x, l.y, l.width, l.height);
    }

    // Bombs
    ctx.fillStyle = this.getColor('#facc15');
    for (const b of engine.bombs) {
      ctx.fillRect(b.x, b.y, b.width, b.height);
      // bomb fin
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(b.x - 1, b.y - 1, b.width + 2, 1);
    }
  }

  private drawParticles(engine: RocketRaidEngine) {
    const ctx = this.ctx;
    for (const p of engine.particles) {
      ctx.fillStyle = this.palette === 'grey' ? '#f8fafc' : p.color;
      ctx.fillRect(p.x, p.y, p.size, p.size);
    }
  }

  private drawPlayer(engine: RocketRaidEngine) {
    const ctx = this.ctx;
    const p = engine.player;

    ctx.save();

    // Invulnerability shield visual feedback
    if (engine.invulnerabilityTimer > 0) {
      // Forcefield aura ring
      const shieldColor = Math.floor(Date.now() / 90) % 2 === 0 ? '#38bdf8' : '#ffffff';
      ctx.strokeStyle = this.palette === 'grey' ? '#cbd5e1' : shieldColor;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.ellipse(p.x + p.width / 2, p.y + p.height / 2, p.width * 0.75, p.height * 1.1, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Retro flicker effect during respawn grace period
      if (Math.floor(Date.now() / 60) % 2 === 0) {
        ctx.restore();
        return;
      }
    }

    const shipColor = this.palette === 'grey' ? '#f8fafc' : this.palette === 'green' ? '#22c55e' : '#ffffff';
    const accentColor = this.palette === 'grey' ? '#94a3b8' : this.palette === 'green' ? '#15803d' : '#38bdf8';

    // Ship fuselage
    ctx.fillStyle = shipColor;
    ctx.beginPath();
    ctx.moveTo(p.x + p.width, p.y + p.height / 2); // nose
    ctx.lineTo(p.x + 4, p.y);                      // upper wing
    ctx.lineTo(p.x, p.y + 2);                      // engine top
    ctx.lineTo(p.x + 3, p.y + p.height / 2);       // engine center
    ctx.lineTo(p.x, p.y + p.height - 2);           // engine bottom
    ctx.lineTo(p.x + 4, p.y + p.height);           // lower wing
    ctx.closePath();
    ctx.fill();

    // Cockpit
    ctx.fillStyle = accentColor;
    ctx.fillRect(p.x + p.width - 9, p.y + p.height / 2 - 2, 5, 4);

    // Thruster exhaust flame
    const flameLen = 4 + Math.random() * 4;
    ctx.fillStyle = this.palette === 'grey' ? '#cbd5e1' : '#f97316';
    ctx.beginPath();
    ctx.moveTo(p.x, p.y + p.height / 2 - 2);
    ctx.lineTo(p.x - flameLen, p.y + p.height / 2);
    ctx.lineTo(p.x, p.y + p.height / 2 + 2);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  private drawHUD(engine: RocketRaidEngine) {
    const ctx = this.ctx;
    ctx.save();
    ctx.font = 'bold 8px monospace';

    // Top Row: 1UP and HIGH SCORE
    ctx.fillStyle = '#f8fafc';
    ctx.fillText(`1UP ${engine.score.toString().padStart(6, '0')}`, 10, 10);
    ctx.fillText(`HIGH ${engine.highScore.toString().padStart(6, '0')}`, 110, 10);

    // Invulnerability shield timer banner or Raid counter
    if (engine.invulnerabilityTimer > 0) {
      ctx.fillStyle = this.palette === 'grey' ? '#cbd5e1' : '#38bdf8';
      ctx.fillText(`SHIELD ${engine.invulnerabilityTimer.toFixed(1)}S`, 190, 10);
    } else {
      ctx.fillStyle = '#facc15';
      ctx.fillText(`DIFF LVL ${engine.currentSectionIndex}`, 190, 10);
    }
    ctx.fillText(`RAID ${engine.loopNumber}`, 268, 10);

    // Bottom Bar: Section & Fuel gauge
    const secConfig = SECTIONS[engine.currentSectionIndex - 1] || SECTIONS[0];
    ctx.fillStyle = this.getColor(secConfig.colorTheme);
    ctx.fillText(`${secConfig.name}: ${secConfig.subtitle}`, 10, NATIVE_HEIGHT - 6);

    // Fuel Bar
    ctx.fillStyle = '#cbd5e1';
    ctx.fillText('FUEL', 180, NATIVE_HEIGHT - 6);
    ctx.strokeStyle = '#475569';
    ctx.strokeRect(205, NATIVE_HEIGHT - 12, 60, 7);

    const fuelPct = Math.max(0, engine.player.fuel / engine.player.maxFuel);
    ctx.fillStyle = fuelPct > 0.3 ? (this.palette === 'grey' ? '#f8fafc' : '#22c55e') : '#ef4444';
    ctx.fillRect(206, NATIVE_HEIGHT - 11, Math.floor(58 * fuelPct), 5);

    // Ships / Lives icons
    for (let i = 0; i < Math.min(5, engine.lives); i++) {
      ctx.fillStyle = this.palette === 'grey' ? '#f8fafc' : '#38bdf8';
      ctx.fillRect(280 + i * 8, NATIVE_HEIGHT - 11, 5, 5);
    }

    ctx.restore();
  }

  private drawTitleScreen(engine: RocketRaidEngine) {
    const ctx = this.ctx;
    ctx.save();

    ctx.fillStyle = 'rgba(0, 0, 0, 0.78)';
    ctx.fillRect(16, 26, NATIVE_WIDTH - 32, NATIVE_HEIGHT - 48);
    ctx.strokeStyle = this.palette === 'grey' ? '#cbd5e1' : '#38bdf8';
    ctx.lineWidth = 2;
    ctx.strokeRect(16, 26, NATIVE_WIDTH - 32, NATIVE_HEIGHT - 48);

    ctx.textAlign = 'center';

    // Title
    ctx.font = 'black 18px monospace';
    ctx.fillStyle = this.palette === 'grey' ? '#ffffff' : '#facc15';
    ctx.fillText('ROCKET RAID', NATIVE_WIDTH / 2, 58);

    ctx.font = 'bold 9px monospace';
    ctx.fillStyle = this.palette === 'grey' ? '#cbd5e1' : '#ec4899';
    ctx.fillText('ACORNSOFT • JONATHAN GRIFFITHS 1982', NATIVE_WIDTH / 2, 74);

    ctx.font = '8px monospace';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('BBC MICROCOMPUTER MODEL B • SCRAMBLE CLONE', NATIVE_WIDTH / 2, 88);

    // 5 Sections breakdown
    ctx.textAlign = 'left';
    ctx.font = 'bold 7px monospace';
    ctx.fillStyle = this.getColor('#ec4899');
    ctx.fillText('SECTION 1: LUNAR OUTPOST - SILOS & FUEL', 36, 110);
    ctx.fillStyle = this.getColor('#06b6d4');
    ctx.fillText('SECTION 2: CAVERN - DANCING ALIEN MINES', 36, 122);
    ctx.fillStyle = this.getColor('#22c55e');
    ctx.fillText('SECTION 3: METEOR CANYON - BURNING HAZARDS', 36, 134);
    ctx.fillStyle = this.getColor('#3b82f6');
    ctx.fillText('SECTION 4: SKYSCRAPERS - TALL CITY TOWERS', 36, 146);
    ctx.fillStyle = this.getColor('#eab308');
    ctx.fillText('SECTION 5: YELLOW MAZE - DESTROY ENEMY CORE!', 36, 158);

    // Controls
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 8px monospace';
    ctx.fillText('CONTROLS: ARROWS / WASD = FLY • SPACE = LASER • B / TAB = BOMB', NATIVE_WIDTH / 2, 178);

    ctx.fillStyle = this.palette === 'grey' ? '#f8fafc' : '#f59e0b';
    ctx.font = 'bold 10px monospace';
    ctx.fillText('DRUK OP SPATIE OF KLIK OM TE STARTEN', NATIVE_WIDTH / 2, 202);

    ctx.restore();
  }

  private drawGameOver(engine: RocketRaidEngine) {
    const ctx = this.ctx;
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
    ctx.fillRect(30, 60, NATIVE_WIDTH - 60, 110);
    ctx.strokeStyle = '#ef4444';
    ctx.strokeRect(30, 60, NATIVE_WIDTH - 60, 110);

    ctx.textAlign = 'center';
    ctx.font = 'bold 16px monospace';
    ctx.fillStyle = '#ef4444';
    ctx.fillText('GAME OVER', NATIVE_WIDTH / 2, 95);

    ctx.font = 'bold 9px monospace';
    ctx.fillStyle = '#f8fafc';
    ctx.fillText(`EINDSCORE: ${engine.score.toLocaleString()}`, NATIVE_WIDTH / 2, 120);

    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 8px monospace';
    ctx.fillText('DRUK OP SPATIE OM OPNIEUW TE SPELEN', NATIVE_WIDTH / 2, 145);

    ctx.restore();
  }

  private drawVictory(engine: RocketRaidEngine) {
    const ctx = this.ctx;
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
    ctx.fillRect(20, 50, NATIVE_WIDTH - 40, 130);
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 2;
    ctx.strokeRect(20, 50, NATIVE_WIDTH - 40, 130);

    ctx.textAlign = 'center';
    ctx.font = 'bold 14px monospace';
    ctx.fillStyle = '#22c55e';
    ctx.fillText('BASE CORE DESTROYED!', NATIVE_WIDTH / 2, 80);

    ctx.font = 'bold 9px monospace';
    ctx.fillStyle = '#facc15';
    ctx.fillText('RAID COMPLETED! +5000 BONUS', NATIVE_WIDTH / 2, 105);

    ctx.fillStyle = '#ffffff';
    ctx.fillText(`VOLGEND NIVEAU: RAID ${engine.loopNumber + 1}`, NATIVE_WIDTH / 2, 130);

    ctx.font = '8px monospace';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('VOORBEREIDEN OP HOGERE SNELHEID...', NATIVE_WIDTH / 2, 155);

    ctx.restore();
  }

  private drawScanlines() {
    const ctx = this.ctx;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.22)';
    for (let y = 0; y < NATIVE_HEIGHT; y += 2) {
      ctx.fillRect(0, y, NATIVE_WIDTH, 1);
    }
  }
}
