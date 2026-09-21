/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ExileEngine, TILE_SIZE, MAP_COLS, MAP_ROWS, WORLD_WIDTH, WORLD_HEIGHT } from './exileEngine';
import { PhysicsItem, EnemyEntity, Projectile, Particle, WindVent, SecurityGate, GeneratorSocket, WaterBody } from './exileTypes';

// BBC Micro Mode 5 & Mode 1 Authentic 8-Color Palette
const BBC_COLORS = {
  black: '#000000',
  white: '#ffffff',
  cyan: '#00ffff',
  magenta: '#ff00ff',
  yellow: '#ffff00',
  red: '#ff0000',
  green: '#00ff00',
  blue: '#0000ff',
  darkGray: '#22262c',
  midGray: '#484d56',
  lightGray: '#8a919e',
  rockDark: '#352e2a',
  rockMid: '#6a5a4d',
  rockLight: '#9b8875',
};

export class ExileRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private crtEnabled: boolean = true;
  private animTick: number = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const context = canvas.getContext('2d', { alpha: false });
    if (!context) {
      throw new Error('Canvas 2D context not supported');
    }
    this.ctx = context;
  }

  public setCrtEnabled(enabled: boolean) {
    this.crtEnabled = enabled;
  }

  public render(engine: ExileEngine) {
    this.animTick++;
    const ctx = this.ctx;
    const width = this.canvas.width;
    const height = this.canvas.height;
    const state = engine.state;
    const cam = state.camera;

    // 1. Clear background (BBC Micro Pitch Black Void)
    ctx.fillStyle = BBC_COLORS.black;
    ctx.fillRect(0, 0, width, height);

    // If Map View is toggled
    if (state.mapRevealed) {
      this.renderFullMap(engine, width, height);
      return;
    }

    ctx.save();
    // Screen shake if low energy or high explosion
    if (state.mike.energy < 20 && state.mike.energy > 0 && Math.random() < 0.2) {
      ctx.translate((Math.random() * 2 - 1) * 2, (Math.random() * 2 - 1) * 2);
    }

    // 2. Render Starfield & Surface Background in upper area
    if (cam.y < 30 * TILE_SIZE) {
      this.renderSurfaceStars(cam.x, cam.y, width, height);
    }

    // 3. Render World Tiles in Viewport
    this.renderTiles(engine, cam.x, cam.y, width, height);

    // 4. Render Wind Vents
    this.renderWindVents(state.windVents, cam.x, cam.y);

    // 5. Render Security Gates & Generator Sockets
    this.renderGatesAndGenerators(state.gates, state.generators, cam.x, cam.y);

    // 6. Render Water Bodies
    this.renderWater(state.waterBodies, cam.x, cam.y);

    // 7. Render Physics Items (Boulders, Keys, Canisters, Teleport Beacon)
    this.renderItems(state.items, cam.x, cam.y);

    // 8. Render Enemies (Magpie birds, Turrets, Drones, Boss Triax)
    this.renderEnemies(state.enemies, cam.x, cam.y);

    // 9. Render Player (Commander Mike Finn)
    this.renderPlayer(state.mike, cam.x, cam.y);

    // 10. Render Projectiles
    this.renderProjectiles(state.projectiles, cam.x, cam.y);

    // 11. Render Particles
    this.renderParticles(state.particles, cam.x, cam.y);

    ctx.restore();

    // 12. Render BBC Micro Telemetry HUD & Status Bar
    this.renderTelemetryHUD(state, width, height);

    // 13. Render CRT Scanlines overlay
    if (this.crtEnabled) {
      this.renderCRTOverlay(width, height);
    }

    // 14. Render Overlays for Game Over / Victory
    if (state.status === 'game_over') {
      this.renderGameOver(width, height, state.mike.score);
    } else if (state.status === 'victory') {
      this.renderVictory(width, height, state.mike.score);
    }
  }

  private renderSurfaceStars(camX: number, camY: number, width: number, height: number) {
    const ctx = this.ctx;
    ctx.fillStyle = BBC_COLORS.white;
    // Fixed procedural stars
    for (let i = 0; i < 40; i++) {
      const sx = ((i * 137) % 1800) - camX * 0.3;
      const sy = ((i * 89) % 350) - camY * 0.3;
      if (sx >= 0 && sx < width && sy >= 0 && sy < height) {
        const size = (i % 3 === 0) ? 2 : 1;
        ctx.fillRect(sx, sy, size, size);
      }
    }

    // Distant Alien Moons of Phoebus
    const moonX = 500 - camX * 0.15;
    const moonY = 80 - camY * 0.15;
    if (moonX > -50 && moonX < width + 50) {
      ctx.strokeStyle = BBC_COLORS.cyan;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(moonX, moonY, 18, 0, Math.PI * 2);
      ctx.stroke();

      // Small secondary ringed moon
      ctx.strokeStyle = BBC_COLORS.magenta;
      ctx.beginPath();
      ctx.arc(moonX + 45, moonY - 20, 8, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  private renderTiles(engine: ExileEngine, camX: number, camY: number, width: number, height: number) {
    const ctx = this.ctx;
    const minCol = Math.max(0, Math.floor(camX / TILE_SIZE));
    const maxCol = Math.min(MAP_COLS - 1, Math.ceil((camX + width) / TILE_SIZE));
    const minRow = Math.max(0, Math.floor(camY / TILE_SIZE));
    const maxRow = Math.min(MAP_ROWS - 1, Math.ceil((camY + height) / TILE_SIZE));

    for (let r = minRow; r <= maxRow; r++) {
      for (let c = minCol; c <= maxCol; c++) {
        const tile = engine.mapGrid[r * MAP_COLS + c];
        if (tile === 0) continue;

        const screenX = c * TILE_SIZE - camX;
        const screenY = r * TILE_SIZE - camY;

        switch (tile) {
          case 1: {
            // Surface Rock / Granite
            ctx.fillStyle = BBC_COLORS.rockMid;
            ctx.fillRect(screenX, screenY, TILE_SIZE, TILE_SIZE);
            ctx.strokeStyle = BBC_COLORS.rockLight;
            ctx.lineWidth = 1;
            ctx.strokeRect(screenX + 0.5, screenY + 0.5, TILE_SIZE - 1, TILE_SIZE - 1);
            // BBC Micro stippling
            ctx.fillStyle = BBC_COLORS.rockDark;
            ctx.fillRect(screenX + 4, screenY + 4, 3, 3);
            ctx.fillRect(screenX + 14, screenY + 12, 3, 3);
            break;
          }
          case 2: {
            // Cavern Rock Wall
            ctx.fillStyle = BBC_COLORS.rockDark;
            ctx.fillRect(screenX, screenY, TILE_SIZE, TILE_SIZE);
            ctx.strokeStyle = BBC_COLORS.rockMid;
            ctx.lineWidth = 1;
            ctx.strokeRect(screenX, screenY, TILE_SIZE, TILE_SIZE);
            // Internal rock fissure
            ctx.strokeStyle = '#1b1714';
            ctx.beginPath();
            ctx.moveTo(screenX + 2, screenY + 6);
            ctx.lineTo(screenX + 16, screenY + 18);
            ctx.stroke();
            break;
          }
          case 3: {
            // Triax Base Steel Plating
            ctx.fillStyle = '#1c222b';
            ctx.fillRect(screenX, screenY, TILE_SIZE, TILE_SIZE);
            ctx.strokeStyle = BBC_COLORS.cyan;
            ctx.lineWidth = 1;
            ctx.strokeRect(screenX, screenY, TILE_SIZE, TILE_SIZE);
            // Rivets at corners
            ctx.fillStyle = BBC_COLORS.white;
            ctx.fillRect(screenX + 2, screenY + 2, 2, 2);
            ctx.fillRect(screenX + TILE_SIZE - 4, screenY + 2, 2, 2);
            ctx.fillRect(screenX + 2, screenY + TILE_SIZE - 4, 2, 2);
            ctx.fillRect(screenX + TILE_SIZE - 4, screenY + TILE_SIZE - 4, 2, 2);
            break;
          }
          case 4: {
            // Magma / Lava (Animated heat cycle)
            const phase = Math.sin(this.animTick * 0.1 + c * 0.5);
            ctx.fillStyle = phase > 0 ? BBC_COLORS.red : '#ff5500';
            ctx.fillRect(screenX, screenY, TILE_SIZE, TILE_SIZE);
            ctx.fillStyle = BBC_COLORS.yellow;
            ctx.fillRect(screenX + 3, screenY + 3, TILE_SIZE - 6, 4);
            break;
          }
          case 5: {
            // Destructible Cracked Rock
            ctx.fillStyle = '#4c3f35';
            ctx.fillRect(screenX, screenY, TILE_SIZE, TILE_SIZE);
            ctx.strokeStyle = BBC_COLORS.yellow;
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(screenX + 2, screenY + 12);
            ctx.lineTo(screenX + 12, screenY + 4);
            ctx.lineTo(screenX + 22, screenY + 18);
            ctx.stroke();
            break;
          }
          case 6: {
            // Spikes / Stalagmites
            ctx.fillStyle = BBC_COLORS.white;
            ctx.beginPath();
            ctx.moveTo(screenX, screenY + TILE_SIZE);
            ctx.lineTo(screenX + TILE_SIZE / 2, screenY);
            ctx.lineTo(screenX + TILE_SIZE, screenY + TILE_SIZE);
            ctx.closePath();
            ctx.fill();
            break;
          }
          case 7: {
            // Recharge / Refueling Pad
            ctx.fillStyle = '#003311';
            ctx.fillRect(screenX, screenY, TILE_SIZE, TILE_SIZE);
            ctx.strokeStyle = BBC_COLORS.green;
            ctx.lineWidth = 1.5;
            ctx.strokeRect(screenX + 1, screenY + 1, TILE_SIZE - 2, TILE_SIZE - 2);
            // Pulsating green cross
            ctx.fillStyle = Math.floor(this.animTick / 10) % 2 === 0 ? BBC_COLORS.green : BBC_COLORS.white;
            ctx.fillRect(screenX + TILE_SIZE / 2 - 2, screenY + 4, 4, TILE_SIZE - 8);
            ctx.fillRect(screenX + 4, screenY + TILE_SIZE / 2 - 2, TILE_SIZE - 8, 4);
            break;
          }
        }
      }
    }
  }

  private renderWindVents(vents: WindVent[], camX: number, camY: number) {
    const ctx = this.ctx;
    for (const wv of vents) {
      const sx = wv.x - camX;
      const sy = wv.y - camY;
      ctx.strokeStyle = 'rgba(0, 255, 255, 0.25)';
      ctx.lineWidth = 1;
      ctx.strokeRect(sx, sy, wv.width, wv.height);

      // Upward air velocity lines
      const linePhase = (this.animTick * 3) % 20;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.beginPath();
      for (let ly = sy + wv.height - linePhase; ly > sy; ly -= 20) {
        ctx.moveTo(sx + 4, ly);
        ctx.lineTo(sx + wv.width - 4, ly - 6);
      }
      ctx.stroke();
    }
  }

  private renderGatesAndGenerators(gates: SecurityGate[], gens: GeneratorSocket[], camX: number, camY: number) {
    const ctx = this.ctx;

    // 1. Generator Sockets
    for (const gen of gens) {
      const gx = gen.x - camX;
      const gy = gen.y - camY;
      ctx.fillStyle = gen.powered ? '#003311' : '#330011';
      ctx.fillRect(gx - 12, gy - 12, 24, 24);
      ctx.strokeStyle = gen.powered ? BBC_COLORS.green : BBC_COLORS.red;
      ctx.lineWidth = 2;
      ctx.strokeRect(gx - 12, gy - 12, 24, 24);

      ctx.fillStyle = gen.powered ? BBC_COLORS.green : BBC_COLORS.red;
      ctx.textAlign = 'center';
      ctx.font = '8px monospace';
      ctx.fillText(gen.powered ? 'GEN OK' : 'NO PWR', gx, gy + 3);
    }

    // 2. Security Gates
    for (const gate of gates) {
      const gx = gate.x - camX;
      const gy = gate.y - camY;
      const h = gate.height * (1 - gate.openProgress);

      if (h > 1) {
        let gateColor = BBC_COLORS.red;
        if (gate.requiredKey === 'blue') gateColor = BBC_COLORS.blue;
        if (gate.requiredKey === 'yellow') gateColor = BBC_COLORS.yellow;

        ctx.fillStyle = '#111';
        ctx.fillRect(gx, gy, gate.width, h);
        ctx.strokeStyle = gateColor;
        ctx.lineWidth = 2;
        ctx.strokeRect(gx, gy, gate.width, h);

        // Security diagonal hazard stripes
        ctx.strokeStyle = gateColor;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        for (let y = gy + 4; y < gy + h; y += 12) {
          ctx.moveTo(gx, y);
          ctx.lineTo(gx + gate.width, y + 8);
        }
        ctx.stroke();

        // Lock icon in center
        ctx.fillStyle = BBC_COLORS.white;
        ctx.fillRect(gx + gate.width / 2 - 3, gy + h / 2 - 3, 6, 6);
      }
    }
  }

  private renderWater(bodies: WaterBody[], camX: number, camY: number) {
    const ctx = this.ctx;
    for (const wb of bodies) {
      const sx = wb.x - camX;
      const sy = wb.y + wb.waveOffset - camY;

      // Deep cyan/blue water
      ctx.fillStyle = 'rgba(0, 100, 200, 0.45)';
      ctx.fillRect(sx, sy, wb.width, wb.height);

      // Surface water wave line
      ctx.strokeStyle = BBC_COLORS.cyan;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      for (let x = sx; x <= sx + wb.width; x += 16) {
        const wave = Math.sin((x + this.animTick * 3) * 0.08) * 3;
        ctx.lineTo(x, sy + wave);
      }
      ctx.stroke();
    }
  }

  private renderItems(items: PhysicsItem[], camX: number, camY: number) {
    const ctx = this.ctx;
    for (const item of items) {
      if (item.isCarried) continue;
      const ix = item.x - camX;
      const iy = item.y - camY;

      switch (item.type) {
        case 'boulder': {
          // Grey/rock boulder with rough edges
          ctx.fillStyle = BBC_COLORS.midGray;
          ctx.beginPath();
          ctx.arc(ix, iy, item.radius, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = BBC_COLORS.white;
          ctx.lineWidth = 1;
          ctx.stroke();
          // Rock texture dot
          ctx.fillStyle = BBC_COLORS.rockDark;
          ctx.fillRect(ix - 2, iy - 2, 4, 3);
          break;
        }
        case 'teleport_beacon': {
          // Iconic Exile Pulsing Teleport Locator Beacon
          const pulse = Math.sin(this.animTick * 0.15) > 0;
          ctx.fillStyle = pulse ? BBC_COLORS.cyan : BBC_COLORS.magenta;
          ctx.fillRect(ix - 5, iy - 7, 10, 14);
          ctx.strokeStyle = BBC_COLORS.white;
          ctx.lineWidth = 1;
          ctx.strokeRect(ix - 5, iy - 7, 10, 14);

          // Antenna stalk
          ctx.strokeStyle = BBC_COLORS.yellow;
          ctx.beginPath();
          ctx.moveTo(ix, iy - 7);
          ctx.lineTo(ix, iy - 13);
          ctx.stroke();
          ctx.fillStyle = pulse ? BBC_COLORS.yellow : BBC_COLORS.white;
          ctx.beginPath();
          ctx.arc(ix, iy - 13, 2.5, 0, Math.PI * 2);
          ctx.fill();
          break;
        }
        case 'fuel_canister': {
          // Orange/Yellow Fuel Drum
          ctx.fillStyle = BBC_COLORS.yellow;
          ctx.fillRect(ix - 6, iy - 7, 12, 14);
          ctx.strokeStyle = BBC_COLORS.red;
          ctx.lineWidth = 1.5;
          ctx.strokeRect(ix - 6, iy - 7, 12, 14);
          ctx.fillStyle = BBC_COLORS.black;
          ctx.font = 'bold 8px monospace';
          ctx.textAlign = 'center';
          ctx.fillText('F', ix, iy + 3);
          break;
        }
        case 'energy_cell': {
          // Plutonium glowing cell (Cyan / Green)
          ctx.fillStyle = BBC_COLORS.green;
          ctx.fillRect(ix - 5, iy - 6, 10, 12);
          ctx.strokeStyle = BBC_COLORS.cyan;
          ctx.lineWidth = 1.5;
          ctx.strokeRect(ix - 5, iy - 6, 10, 12);
          // High-voltage lightning bolt
          ctx.fillStyle = BBC_COLORS.white;
          ctx.beginPath();
          ctx.moveTo(ix, iy - 4);
          ctx.lineTo(ix - 2, iy);
          ctx.lineTo(ix + 1, iy);
          ctx.lineTo(ix - 1, iy + 4);
          ctx.stroke();
          break;
        }
        case 'keycard_red':
        case 'keycard_blue':
        case 'keycard_yellow': {
          const cardColor = item.type === 'keycard_red' ? BBC_COLORS.red : (item.type === 'keycard_blue' ? BBC_COLORS.blue : BBC_COLORS.yellow);
          ctx.fillStyle = cardColor;
          ctx.fillRect(ix - 6, iy - 4, 12, 8);
          ctx.strokeStyle = BBC_COLORS.white;
          ctx.lineWidth = 1;
          ctx.strokeRect(ix - 6, iy - 4, 12, 8);
          ctx.fillStyle = BBC_COLORS.black;
          ctx.fillRect(ix - 3, iy - 2, 4, 4);
          break;
        }
        case 'oxygen_tank': {
          ctx.fillStyle = BBC_COLORS.cyan;
          ctx.fillRect(ix - 5, iy - 8, 10, 16);
          ctx.strokeStyle = BBC_COLORS.white;
          ctx.lineWidth = 1;
          ctx.strokeRect(ix - 5, iy - 8, 10, 16);
          ctx.fillStyle = BBC_COLORS.black;
          ctx.font = 'bold 7px monospace';
          ctx.textAlign = 'center';
          ctx.fillText('O2', ix, iy + 3);
          break;
        }
        case 'triax_data_cube': {
          // Mysterious glowing data cube
          ctx.fillStyle = BBC_COLORS.magenta;
          ctx.fillRect(ix - 7, iy - 7, 14, 14);
          ctx.strokeStyle = BBC_COLORS.white;
          ctx.lineWidth = 1.5;
          ctx.strokeRect(ix - 7, iy - 7, 14, 14);
          ctx.strokeStyle = BBC_COLORS.yellow;
          ctx.strokeRect(ix - 3, iy - 3, 6, 6);
          break;
        }
      }
    }
  }

  private renderEnemies(enemies: EnemyEntity[], camX: number, camY: number) {
    const ctx = this.ctx;
    for (const enemy of enemies) {
      if (!enemy.active) continue;
      const ex = enemy.x - camX;
      const ey = enemy.y - camY;

      switch (enemy.type) {
        case 'magpie_bird': {
          // Alien flying pterodactyl / magpie
          const wingFlap = Math.sin(this.animTick * 0.3) * 8;
          ctx.fillStyle = BBC_COLORS.cyan;
          ctx.beginPath();
          ctx.arc(ex, ey, 5, 0, Math.PI * 2); // Head/body
          ctx.fill();

          // Wings
          ctx.strokeStyle = BBC_COLORS.white;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(ex - 10, ey + wingFlap);
          ctx.lineTo(ex, ey);
          ctx.lineTo(ex + 10, ey + wingFlap);
          ctx.stroke();

          // Sharp beak
          ctx.fillStyle = BBC_COLORS.yellow;
          const beakDir = enemy.facing === 'right' ? 1 : -1;
          ctx.beginPath();
          ctx.moveTo(ex + beakDir * 5, ey - 2);
          ctx.lineTo(ex + beakDir * 10, ey);
          ctx.lineTo(ex + beakDir * 5, ey + 2);
          ctx.closePath();
          ctx.fill();
          break;
        }
        case 'turret': {
          // Ceiling mounted tracking laser turret
          ctx.fillStyle = BBC_COLORS.midGray;
          ctx.fillRect(ex - 8, ey - 10, 16, 6);
          ctx.fillStyle = BBC_COLORS.red;
          ctx.beginPath();
          ctx.arc(ex, ey - 3, 6, 0, Math.PI * 2);
          ctx.fill();
          // Barrel pointing
          const bDir = enemy.facing === 'right' ? 1 : -1;
          ctx.strokeStyle = BBC_COLORS.white;
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(ex, ey - 3);
          ctx.lineTo(ex + bDir * 10, ey + 4);
          ctx.stroke();
          break;
        }
        case 'triax_drone': {
          // Triax Flying Security Drone
          ctx.fillStyle = BBC_COLORS.midGray;
          ctx.beginPath();
          ctx.arc(ex, ey, 8, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = BBC_COLORS.red;
          ctx.lineWidth = 1.5;
          ctx.stroke();

          // Glowing red camera eye
          ctx.fillStyle = BBC_COLORS.red;
          ctx.fillRect(ex - 2, ey - 2, 4, 4);

          // Spinning rotor blade
          const rotorW = Math.cos(this.animTick * 0.5) * 14;
          ctx.strokeStyle = BBC_COLORS.cyan;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(ex - rotorW, ey - 8);
          ctx.lineTo(ex + rotorW, ey - 8);
          ctx.stroke();
          break;
        }
        case 'magma_worm': {
          // Fiery burrowing worm
          ctx.fillStyle = BBC_COLORS.red;
          ctx.beginPath();
          ctx.arc(ex, ey, 9, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = BBC_COLORS.yellow;
          ctx.beginPath();
          ctx.arc(ex, ey, 5, 0, Math.PI * 2);
          ctx.fill();
          break;
        }
        case 'boss_triax': {
          // Triax in his Hovering Command Platform
          ctx.fillStyle = '#220033';
          ctx.fillRect(ex - 18, ey - 10, 36, 24);
          ctx.strokeStyle = BBC_COLORS.magenta;
          ctx.lineWidth = 2;
          ctx.strokeRect(ex - 18, ey - 10, 36, 24);

          // Glowing Forcefield shield around Triax
          ctx.strokeStyle = 'rgba(255, 0, 255, 0.6)';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(ex, ey + 2, 24 + Math.sin(this.animTick * 0.1) * 3, 0, Math.PI * 2);
          ctx.stroke();

          // Triax cyborg head & red ocular implant
          ctx.fillStyle = BBC_COLORS.white;
          ctx.fillRect(ex - 6, ey - 8, 12, 10);
          ctx.fillStyle = BBC_COLORS.red;
          ctx.fillRect(ex - 4, ey - 6, 4, 4); // Cyborg red eye

          // Dual plasma cannons on throne
          ctx.fillStyle = BBC_COLORS.yellow;
          ctx.fillRect(ex - 22, ey + 4, 6, 4);
          ctx.fillRect(ex + 16, ey + 4, 6, 4);

          // Boss HP Bar above
          ctx.fillStyle = BBC_COLORS.black;
          ctx.fillRect(ex - 24, ey - 22, 48, 6);
          ctx.fillStyle = BBC_COLORS.red;
          ctx.fillRect(ex - 23, ey - 21, 46 * (enemy.hp / enemy.maxHp), 4);
          ctx.strokeStyle = BBC_COLORS.white;
          ctx.lineWidth = 1;
          ctx.strokeRect(ex - 24, ey - 22, 48, 6);
          break;
        }
      }
    }
  }

  private renderPlayer(mike: ExileEngine['state']['mike'], camX: number, camY: number) {
    const ctx = this.ctx;
    const px = mike.x - camX;
    const py = mike.y - camY;
    const isFacingRight = mike.facing === 'right';

    ctx.save();
    ctx.translate(px, py);

    // Flash when taking damage / low energy
    if (mike.energy < 20 && Math.floor(this.animTick / 6) % 2 === 0) {
      ctx.globalAlpha = 0.5;
    }

    // 1. Jetpack unit on back
    const jetpackX = isFacingRight ? -6 : 2;
    ctx.fillStyle = BBC_COLORS.midGray;
    ctx.fillRect(jetpackX, -4, 4, 10);
    ctx.strokeStyle = BBC_COLORS.white;
    ctx.lineWidth = 1;
    ctx.strokeRect(jetpackX, -4, 4, 10);

    // 2. Space Suit Body (Classic BBC Micro White & Yellow)
    ctx.fillStyle = BBC_COLORS.yellow;
    ctx.fillRect(-4, -5, 8, 11); // Torso

    // Legs / Boots
    const walkOffset = mike.isWalking ? Math.sin(this.animTick * 0.3) * 3 : 0;
    ctx.fillStyle = BBC_COLORS.white;
    ctx.fillRect(-4, 6, 3, 6 + walkOffset);
    ctx.fillRect(1, 6, 3, 6 - walkOffset);

    // 3. Astronaut Helmet
    ctx.fillStyle = BBC_COLORS.white;
    ctx.beginPath();
    ctx.arc(0, -9, 5.5, 0, Math.PI * 2);
    ctx.fill();

    // Cyan Visor
    ctx.fillStyle = BBC_COLORS.cyan;
    const visorX = isFacingRight ? 1 : -4;
    ctx.fillRect(visorX, -11, 4, 4);

    // 4. Arm & Weapon Blaster
    ctx.strokeStyle = BBC_COLORS.white;
    ctx.lineWidth = 2;
    const armEndX = isFacingRight ? 8 : -8;
    ctx.beginPath();
    ctx.moveTo(0, -2);
    ctx.lineTo(armEndX, -2);
    ctx.stroke();

    // Weapon barrel
    ctx.fillStyle = BBC_COLORS.yellow;
    ctx.fillRect(isFacingRight ? 8 : -11, -4, 3, 3);

    // 5. If carrying an item, draw item above head
    if (mike.carriedItem) {
      ctx.fillStyle = BBC_COLORS.white;
      ctx.strokeStyle = BBC_COLORS.cyan;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(0, -18, 5, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fill();
    }

    ctx.restore();
  }

  private renderProjectiles(projectiles: Projectile[], camX: number, camY: number) {
    const ctx = this.ctx;
    for (const p of projectiles) {
      const sx = p.x - camX;
      const sy = p.y - camY;

      if (p.weaponType === 'blaster') {
        // Fast white/cyan laser pulse
        ctx.strokeStyle = BBC_COLORS.white;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(sx - p.vx * 0.8, sy);
        ctx.lineTo(sx + p.vx * 0.8, sy);
        ctx.stroke();
      } else if (p.weaponType === 'grenade') {
        // Round flashing grenade
        ctx.fillStyle = Math.floor(this.animTick / 4) % 2 === 0 ? BBC_COLORS.yellow : BBC_COLORS.red;
        ctx.beginPath();
        ctx.arc(sx, sy, p.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = BBC_COLORS.white;
        ctx.lineWidth = 1;
        ctx.stroke();
      } else if (p.weaponType === 'plasma' || p.weaponType === 'plasma_turret') {
        // Glowing cyan / magenta plasma orb
        ctx.fillStyle = p.isEnemy ? BBC_COLORS.red : BBC_COLORS.cyan;
        ctx.beginPath();
        ctx.arc(sx, sy, p.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = BBC_COLORS.white;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      } else {
        // Standard enemy bullet
        ctx.fillStyle = BBC_COLORS.yellow;
        ctx.fillRect(sx - 2, sy - 2, 4, 4);
      }
    }
  }

  private renderParticles(particles: Particle[], camX: number, camY: number) {
    const ctx = this.ctx;
    for (const pt of particles) {
      const sx = pt.x - camX;
      const sy = pt.y - camY;
      ctx.fillStyle = pt.color;
      ctx.fillRect(sx - pt.size / 2, sy - pt.size / 2, pt.size, pt.size);
    }
  }

  // BBC MICRO AUTHENTIC TELEMETRY HUD
  private renderTelemetryHUD(state: ExileEngine['state'], width: number, height: number) {
    const ctx = this.ctx;
    const mike = state.mike;

    // Top Telemetry Header Bar
    ctx.fillStyle = '#0a0d12';
    ctx.fillRect(0, 0, width, 28);
    ctx.strokeStyle = BBC_COLORS.cyan;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, 28.5);
    ctx.lineTo(width, 28.5);
    ctx.stroke();

    ctx.font = 'bold 11px monospace';
    ctx.textAlign = 'left';

    // 1. SUIT SHIELD / ENERGY GAUGE
    ctx.fillStyle = BBC_COLORS.white;
    ctx.fillText('SHIELD', 8, 18);
    this.drawGauge(ctx, 56, 9, 70, 10, mike.energy / mike.maxEnergy, BBC_COLORS.green, BBC_COLORS.red);

    // 2. JET FUEL GAUGE
    ctx.fillStyle = BBC_COLORS.white;
    ctx.fillText('FUEL', 136, 18);
    this.drawGauge(ctx, 170, 9, 70, 10, mike.fuel / mike.maxFuel, BBC_COLORS.yellow, BBC_COLORS.red);

    // 3. OXYGEN GAUGE
    ctx.fillStyle = BBC_COLORS.white;
    ctx.fillText('O2', 250, 18);
    this.drawGauge(ctx, 272, 9, 55, 10, mike.oxygen / mike.maxOxygen, BBC_COLORS.cyan, BBC_COLORS.red);

    // 4. WEAPON & AMMO
    ctx.fillStyle = BBC_COLORS.white;
    const wpnText = mike.selectedWeapon === 'blaster' ? 'BLASTER: ∞' : (mike.selectedWeapon === 'grenade' ? `GRN: ${mike.ammo.grenade}` : `PLS: ${mike.ammo.plasma}`);
    ctx.fillText(wpnText, 340, 18);

    // 5. SCORE & LIVES
    ctx.textAlign = 'right';
    ctx.fillStyle = BBC_COLORS.yellow;
    ctx.fillText(`SCORE: ${mike.score.toString().padStart(6, '0')}`, width - 70, 18);
    ctx.fillStyle = BBC_COLORS.white;
    ctx.fillText(`LIVES: ${mike.lives}`, width - 8, 18);

    // Bottom Telemetry Bar (Ticker & Compass)
    const botY = height - 24;
    ctx.fillStyle = '#0a0d12';
    ctx.fillRect(0, botY, width, 24);
    ctx.strokeStyle = BBC_COLORS.cyan;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, botY - 0.5);
    ctx.lineTo(width, botY - 0.5);
    ctx.stroke();

    // Radar ticker message
    ctx.textAlign = 'left';
    ctx.font = '10px monospace';
    ctx.fillStyle = state.radarMessageTimer > 0 ? BBC_COLORS.yellow : BBC_COLORS.cyan;
    ctx.fillText(`▶ ${state.radarMessage}`, 10, botY + 16);

    // Keycard pass indicators
    ctx.textAlign = 'right';
    const keyRedStr = mike.hasKeycardRed ? 'R' : '-';
    const keyBlueStr = mike.hasKeycardBlue ? 'B' : '-';
    const keyYelStr = mike.hasKeycardYellow ? 'Y' : '-';
    ctx.fillStyle = BBC_COLORS.white;
    ctx.fillText(`KEYS: [${keyRedStr}${keyBlueStr}${keyYelStr}]  MAP: [M]`, width - 10, botY + 16);
  }

  private drawGauge(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, pct: number, okColor: string, lowColor: string) {
    ctx.fillStyle = '#111';
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = BBC_COLORS.white;
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, w, h);

    const fillW = Math.max(0, Math.min(w - 2, (w - 2) * pct));
    ctx.fillStyle = pct > 0.25 ? okColor : lowColor;
    ctx.fillRect(x + 1, y + 1, fillW, h - 2);
  }

  private renderFullMap(engine: ExileEngine, width: number, height: number) {
    const ctx = this.ctx;
    const state = engine.state;
    const grid = engine.mapGrid;

    ctx.fillStyle = '#040608';
    ctx.fillRect(0, 0, width, height);

    const mapW = width - 40;
    const mapH = height - 70;
    const startX = 20;
    const startY = 35;

    ctx.strokeStyle = BBC_COLORS.cyan;
    ctx.lineWidth = 2;
    ctx.strokeRect(startX, startY, mapW, mapH);

    // Map tiles
    const cellW = mapW / MAP_COLS;
    const cellH = mapH / MAP_ROWS;

    for (let r = 0; r < MAP_ROWS; r += 2) {
      for (let c = 0; c < MAP_COLS; c += 2) {
        const t = grid[r * MAP_COLS + c];
        if (t === 0) continue;
        if (t === 1 || t === 2) ctx.fillStyle = '#3a342c';
        else if (t === 3) ctx.fillStyle = '#1b3a4b';
        else if (t === 4) ctx.fillStyle = '#991100';
        else ctx.fillStyle = '#555';
        ctx.fillRect(startX + c * cellW, startY + r * cellH, cellW * 2, cellH * 2);
      }
    }

    // Teleport Beacon on Map (Blinking Cyan)
    if (state.mike.beaconPlaced) {
      const bx = startX + (state.mike.beaconPlaced.x / WORLD_WIDTH) * mapW;
      const by = startY + (state.mike.beaconPlaced.y / WORLD_HEIGHT) * mapH;
      ctx.fillStyle = Math.floor(this.animTick / 10) % 2 === 0 ? BBC_COLORS.cyan : BBC_COLORS.magenta;
      ctx.fillRect(bx - 3, by - 3, 6, 6);
    }

    // Player position (Blinking Yellow)
    const px = startX + (state.mike.x / WORLD_WIDTH) * mapW;
    const py = startY + (state.mike.y / WORLD_HEIGHT) * mapH;
    ctx.fillStyle = Math.floor(this.animTick / 8) % 2 === 0 ? BBC_COLORS.yellow : BBC_COLORS.white;
    ctx.beginPath();
    ctx.arc(px, py, 4, 0, Math.PI * 2);
    ctx.fill();

    // Map Title & Instructions
    ctx.font = 'bold 12px monospace';
    ctx.fillStyle = BBC_COLORS.white;
    ctx.textAlign = 'center';
    ctx.fillText('PLANEET PHOEBUS: ONDERGRONDS DOOLHOF (BBC MICRO KAART)', width / 2, 22);

    ctx.font = '10px monospace';
    ctx.fillStyle = BBC_COLORS.green;
    ctx.fillText("DRUK OP 'M' OF (SELECT) OM TERUG TE KEREN NAAR DE EXPLORATIE", width / 2, height - 14);
  }

  private renderCRTOverlay(width: number, height: number) {
    const ctx = this.ctx;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.12)';
    for (let y = 0; y < height; y += 3) {
      ctx.fillRect(0, y, width, 1);
    }
  }

  private renderGameOver(width: number, height: number, score: number) {
    const ctx = this.ctx;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = BBC_COLORS.red;
    ctx.font = 'bold 24px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('MISSION FAILED', width / 2, height / 2 - 30);

    ctx.fillStyle = BBC_COLORS.white;
    ctx.font = '14px monospace';
    ctx.fillText('MIKE FINN IS BEZWEKEN OP PHOEBUS', width / 2, height / 2);
    ctx.fillText(`EINDSCORE: ${score}`, width / 2, height / 2 + 25);

    ctx.fillStyle = BBC_COLORS.yellow;
    ctx.fillText('DRUK OP SPATIE OF (A) OM OPNIEUW TE BEGINNEN', width / 2, height / 2 + 65);
  }

  private renderVictory(width: number, height: number, score: number) {
    const ctx = this.ctx;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.82)';
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = BBC_COLORS.green;
    ctx.font = 'bold 24px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('MISSION ACCOMPLISHED!', width / 2, height / 2 - 40);

    ctx.fillStyle = BBC_COLORS.cyan;
    ctx.font = '14px monospace';
    ctx.fillText('TRIAX IS VERSLAGEN EN DE DATA IS VEILIGGESTELD!', width / 2, height / 2 - 10);
    ctx.fillText('DE BEMANNING VAN DE PERSEUS IS GERED!', width / 2, height / 2 + 15);

    ctx.fillStyle = BBC_COLORS.yellow;
    ctx.fillText(`FINALE SCORE: ${score}`, width / 2, height / 2 + 45);

    ctx.fillStyle = BBC_COLORS.white;
    ctx.fillText('DRUK OP SPATIE OF (A) OM NOG EENS TE SPELEN', width / 2, height / 2 + 80);
  }
}
