/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Rocket Raid Game Engine (Acornsoft 1982 - BBC Micro / Acorn Electron)
 * Complete physics, 5 continuous sections, terrain collision, dual weapons & fuel.
 */

import {
  Bomb,
  DancingAlien,
  FinalBase,
  FuelDepot,
  GameState,
  GroundRocket,
  LaserBullet,
  Meteor,
  Particle,
  PlayerShip,
  RadarBase,
  SectionConfig,
  TerrainPoint,
} from './rocketRaidTypes';
import { rocketRaidAudio } from './rocketRaidAudio';

export const NATIVE_WIDTH = 320;
export const NATIVE_HEIGHT = 240;
export const SECTION_LENGTH = 3600; // pixels of terrain per section (longer, authentic arcade progression)

export const SECTIONS: SectionConfig[] = [
  {
    sectionIndex: 1,
    name: 'SECTION 1',
    subtitle: 'LUNAR OUTPOST',
    colorTheme: '#ec4899', // Magenta
    hasCeiling: false,
    scrollLength: SECTION_LENGTH,
  },
  {
    sectionIndex: 2,
    name: 'SECTION 2',
    subtitle: 'CAVERN OF MINES',
    colorTheme: '#06b6d4', // Cyan
    hasCeiling: true,
    scrollLength: SECTION_LENGTH,
  },
  {
    sectionIndex: 3,
    name: 'SECTION 3',
    subtitle: 'METEOR CANYON',
    colorTheme: '#22c55e', // Green
    hasCeiling: false,
    scrollLength: SECTION_LENGTH,
  },
  {
    sectionIndex: 4,
    name: 'SECTION 4',
    subtitle: 'SKYSCRAPER CITY',
    colorTheme: '#3b82f6', // Blue
    hasCeiling: false,
    scrollLength: SECTION_LENGTH,
  },
  {
    sectionIndex: 5,
    name: 'SECTION 5',
    subtitle: 'COMMAND MAZE & CORE',
    colorTheme: '#eab308', // Yellow
    hasCeiling: true,
    scrollLength: SECTION_LENGTH + 600,
  },
];

export class RocketRaidEngine {
  public gameState: GameState = 'TITLE';
  public score: number = 0;
  public highScore: number = 18450;
  public lives: number = 3;
  public loopNumber: number = 1; // Raid 1, Raid 2...
  public currentSectionIndex: number = 1; // 1 to 5

  public worldScrollX: number = 0;
  public baseScrollSpeed: number = 1.6;
  public extraSpeed: number = 0;

  // Respawn & Restart Protection
  public invulnerabilityTimer: number = 3.5; // Seconds of invulnerability shield upon start & respawn

  public player: PlayerShip = {
    x: 48,
    y: 100,
    vx: 0,
    vy: 0,
    width: 22,
    height: 10,
    speed: 2.2,
    isAlive: true,
    fuel: 100,
    maxFuel: 100,
  };

  public lasers: LaserBullet[] = [];
  public bombs: Bomb[] = [];
  public groundRockets: GroundRocket[] = [];
  public fuelDepots: FuelDepot[] = [];
  public radarBases: RadarBase[] = [];
  public dancingAliens: DancingAlien[] = [];
  public meteors: Meteor[] = [];
  public finalBase: FinalBase | null = null;
  public particles: Particle[] = [];

  public terrain: TerrainPoint[] = [];

  // Keys state
  private keys: Record<string, boolean> = {};

  // Timing & flags
  private respawnTimer: number = 0;
  private fuelAlertTimer: number = 0;
  private bonusLifeGiven: boolean = false;
  private meteorSpawnTimer: number = 0;

  constructor() {
    this.initTerrain();
  }

  public resetGame() {
    this.gameState = 'PLAYING';
    this.score = 0;
    this.lives = 3;
    this.loopNumber = 1;
    this.currentSectionIndex = 1;
    this.worldScrollX = 0;
    this.baseScrollSpeed = 1.6;
    this.bonusLifeGiven = false;
    this.invulnerabilityTimer = 3.5;

    this.groundRockets = [];
    this.fuelDepots = [];
    this.radarBases = [];
    this.dancingAliens = [];
    this.meteors = [];
    this.finalBase = null;

    this.initTerrain();
    this.spawnEntitiesForSection(1);
    this.resetPlayer(false);
  }

  public resetPlayer(_isRespawn: boolean = false) {
    this.player.x = 48;
    this.player.vx = 0;
    this.player.vy = 0;
    this.player.isAlive = true;
    if (this.player.fuel < 60) {
      this.player.fuel = Math.max(60, this.player.fuel);
    }
    this.lasers = [];
    this.bombs = [];
    this.invulnerabilityTimer = 3.5; // Always give 3.5s shield on reset/respawn

    // Calculate safe dynamic spawn height between ceiling and floor
    const spawnWorldX = this.worldScrollX + 48;
    const floorY = this.getFloorYAt(spawnWorldX);
    const ceilingY = this.getCeilingYAt(spawnWorldX);

    if (ceilingY !== undefined) {
      // In cavern or maze: position ship safely midway
      this.player.y = Math.round((ceilingY + floorY) / 2 - this.player.height / 2);
    } else {
      // In open sky: safe cruising altitude well above floor
      this.player.y = Math.min(100, Math.max(50, floorY - 60));
    }
    this.player.y = Math.max(25, Math.min(NATIVE_HEIGHT - 35, this.player.y));

    // Clear immediate hazards on screen to guarantee no immediate explosion
    this.meteors = [];
    for (const r of this.groundRockets) {
      const screenX = r.x - this.worldScrollX;
      if (screenX > 0 && screenX < 200 && r.launched) {
        r.launched = false;
        r.y = r.baseY;
      }
    }
    for (const a of this.dancingAliens) {
      const screenX = a.x - this.worldScrollX;
      if (screenX > 0 && screenX < 140) {
        a.x += 160; // push alien wave forward
      }
    }
  }

  public setKeyDown(code: string) {
    this.keys[code] = true;
    if (this.gameState === 'TITLE' || this.gameState === 'GAMEOVER') {
      if (code === 'Space' || code === 'Enter' || code === 'KeyZ') {
        this.resetGame();
      }
    }
  }

  public setKeyUp(code: string) {
    this.keys[code] = false;
  }

  public fireLaser() {
    if (this.gameState !== 'PLAYING' || !this.player.isAlive) return;
    if (this.lasers.length >= 4) return; // Max 4 on screen like original

    this.lasers.push({
      x: this.player.x + this.player.width,
      y: this.player.y + 4,
      vx: 7.5,
      width: 8,
      height: 2,
    });
    rocketRaidAudio.playLaser();
  }

  public dropBomb() {
    if (this.gameState !== 'PLAYING' || !this.player.isAlive) return;
    if (this.bombs.length >= 2) return; // Max 2 bombs at once

    this.bombs.push({
      x: this.player.x + 6,
      y: this.player.y + this.player.height,
      vx: 1.2,
      vy: 1.0,
      width: 4,
      height: 6,
    });
    rocketRaidAudio.playBombDrop();
  }

  // Generate terrain for all 5 sections with progressive length & challenges
  private initTerrain() {
    this.terrain = [];
    const step = 8;
    const totalWorldLength = SECTION_LENGTH * 5 + 1000;

    for (let x = 0; x <= totalWorldLength; x += step) {
      const section = Math.min(5, Math.floor(x / SECTION_LENGTH) + 1);
      const localX = x % SECTION_LENGTH;

      let floorY = 210;
      let ceilingY: number | undefined = undefined;

      switch (section) {
        case 1: // Lunar Outpost (rolling hills, wide open plains)
          // First 380px is completely flat runway for zero-risk start/restart
          if (x < 380) {
            floorY = 205;
          } else {
            // Gentle rolling hills: floor between 185 and 212, no ceiling
            floorY = 196 + Math.sin(x * 0.009) * 14 + Math.sin(x * 0.02) * 6;
          }
          break;

        case 2: // Cavern of Mines (Introduces ceiling, generous 140px clearance)
          floorY = 198 + Math.sin(x * 0.012) * 12;
          ceilingY = 46 + Math.cos(x * 0.014) * 12;
          break;

        case 3: // Meteor Canyon (Jagged mountains and deep canyons)
          const peak = Math.abs((localX % 160) - 80);
          floorY = 158 + (peak / 80) * 55;
          break;

        case 4: // Skyscraper City (Steep vertical pillars & towers)
          const block = Math.floor(localX / 110);
          const blockMod = block % 3;
          if (blockMod === 1) {
            floorY = 130; // High tower
          } else if (blockMod === 2) {
            floorY = 160; // Mid tower
          } else {
            floorY = 215; // Street level
          }
          break;

        case 5: // Command Maze & Core (Tight undulating corridor)
          floorY = 182 + Math.sin(x * 0.018) * 18;
          ceilingY = 72 + Math.sin(x * 0.018) * 18;
          // Final command chamber where reactor core sits
          if (localX > SECTION_LENGTH - 400) {
            floorY = 210;
            ceilingY = 40;
          }
          break;
      }

      this.terrain.push({ x, floorY, ceilingY });
    }
  }

  public spawnEntitiesForSection(section: number) {
    const startX = (section - 1) * SECTION_LENGTH;
    const endX = section * SECTION_LENGTH;

    // 1. Ground Rockets (Difficulty buildup: spaced & slow in S1, tight & fast in S4/S5)
    if (section === 1) {
      // Starts past runway (startX + 420), spaced generously
      for (let x = startX + 420; x < endX - 120; x += 260 + Math.random() * 80) {
        const floorY = this.getFloorYAt(x);
        this.groundRockets.push({
          id: Math.random(),
          x,
          y: floorY - 14,
          baseY: floorY - 14,
          launched: false,
          vy: 0,
          width: 6,
          height: 14,
        });
      }
    } else if (section === 2) {
      for (let x = startX + 180; x < endX - 100; x += 220 + Math.random() * 70) {
        const floorY = this.getFloorYAt(x);
        this.groundRockets.push({
          id: Math.random(),
          x,
          y: floorY - 14,
          baseY: floorY - 14,
          launched: false,
          vy: 0,
          width: 6,
          height: 14,
        });
      }
    } else if (section === 4) {
      for (let x = startX + 120; x < endX - 80; x += 170 + Math.random() * 60) {
        const floorY = this.getFloorYAt(x);
        this.groundRockets.push({
          id: Math.random(),
          x,
          y: floorY - 14,
          baseY: floorY - 14,
          launched: false,
          vy: 0,
          width: 6,
          height: 14,
        });
      }
    } else if (section === 5) {
      for (let x = startX + 140; x < endX - 500; x += 190 + Math.random() * 50) {
        const floorY = this.getFloorYAt(x);
        this.groundRockets.push({
          id: Math.random(),
          x,
          y: floorY - 14,
          baseY: floorY - 14,
          launched: false,
          vy: 0,
          width: 6,
          height: 14,
        });
      }
    }

    // 2. Fuel Depots (Plentiful in S1, progressively scarcer as levels advance)
    let fuelStep = 240;
    if (section === 1) fuelStep = 220; // plentiful fuel for beginner
    else if (section === 2) fuelStep = 290;
    else if (section === 3) fuelStep = 340;
    else if (section === 4) fuelStep = 380;
    else if (section === 5) fuelStep = 450;

    const fuelOffset = section === 1 ? 300 : 120;
    for (let x = startX + fuelOffset; x < endX - 100; x += fuelStep + Math.random() * 60) {
      const floorY = this.getFloorYAt(x);
      this.fuelDepots.push({
        id: Math.random(),
        x,
        y: floorY - 12,
        width: 16,
        height: 12,
        destroyed: false,
      });
    }

    // 3. Radar Bases (radar tracking stations)
    for (let x = startX + 240; x < endX - 150; x += 380 + Math.random() * 80) {
      const floorY = this.getFloorYAt(x);
      this.radarBases.push({
        id: Math.random(),
        x,
        y: floorY - 10,
        width: 14,
        height: 10,
        destroyed: false,
      });
    }

    // 4. Dancing Aliens & Mines in Section 2
    if (section === 2) {
      for (let x = startX + 160; x < endX - 80; x += 140) {
        this.dancingAliens.push({
          id: Math.random(),
          x,
          y: 110,
          baseY: 90 + Math.random() * 40,
          amplitude: 22,
          phase: Math.random() * Math.PI * 2,
          speed: 0.04 + Math.random() * 0.02,
          width: 12,
          height: 10,
          type: Math.random() > 0.5 ? 'mine' : 'saucer',
        });
      }
    }

    // 5. Final Base in Section 5 (Command Reactor Core)
    if (section === 5) {
      const coreX = startX + SECTION_LENGTH - 120;
      this.finalBase = {
        x: coreX,
        y: 110,
        width: 32,
        height: 32,
        health: 5 + (this.loopNumber - 1) * 2,
        maxHealth: 5 + (this.loopNumber - 1) * 2,
        pulsing: 0,
      };
    }
  }

  public getFloorYAt(worldX: number): number {
    if (this.terrain.length === 0) return 210;
    const idx = Math.floor(worldX / 8);
    if (idx < 0) return this.terrain[0].floorY;
    if (idx >= this.terrain.length) return this.terrain[this.terrain.length - 1].floorY;
    return this.terrain[idx].floorY;
  }

  public getCeilingYAt(worldX: number): number | undefined {
    if (this.terrain.length === 0) return undefined;
    const idx = Math.floor(worldX / 8);
    if (idx < 0) return this.terrain[0].ceilingY;
    if (idx >= this.terrain.length) return this.terrain[this.terrain.length - 1].ceilingY;
    return this.terrain[idx].ceilingY;
  }

  public update(dt: number) {
    if (this.gameState === 'TITLE') return;

    if (this.gameState === 'PLAYER_HIT') {
      this.updateParticles();
      this.respawnTimer -= dt;
      if (this.respawnTimer <= 0) {
        if (this.lives > 0) {
          // Roll back scroll slightly to give player breathing room before obstacle
          const sectionStart = (this.currentSectionIndex - 1) * SECTION_LENGTH;
          this.worldScrollX = Math.max(sectionStart, this.worldScrollX - 180);
          this.resetPlayer(true);
          this.gameState = 'PLAYING';
        } else {
          this.gameState = 'GAMEOVER';
          rocketRaidAudio.playGameOver();
        }
      }
      return;
    }

    if (this.gameState === 'VICTORY') {
      this.updateParticles();
      this.respawnTimer -= dt;
      if (this.respawnTimer <= 0) {
        // Next loop!
        this.loopNumber++;
        this.currentSectionIndex = 1;
        this.worldScrollX = 0;
        this.baseScrollSpeed += 0.25;
        this.initTerrain();
        this.groundRockets = [];
        this.fuelDepots = [];
        this.radarBases = [];
        this.dancingAliens = [];
        this.meteors = [];
        this.finalBase = null;
        this.spawnEntitiesForSection(1);
        this.resetPlayer(false);
        this.gameState = 'PLAYING';
      }
      return;
    }

    if (this.gameState !== 'PLAYING') return;

    // Countdown invulnerability shield
    if (this.invulnerabilityTimer > 0) {
      this.invulnerabilityTimer = Math.max(0, this.invulnerabilityTimer - dt);
    }

    // Progressive Fuel depletion per section (easy in S1, tight in S4/S5)
    let fuelDrainRate = 0.022; // Section 1 (generous)
    if (this.currentSectionIndex === 2) fuelDrainRate = 0.028;
    else if (this.currentSectionIndex === 3) fuelDrainRate = 0.034;
    else if (this.currentSectionIndex === 4) fuelDrainRate = 0.040;
    else if (this.currentSectionIndex >= 5) fuelDrainRate = 0.046;

    this.player.fuel -= fuelDrainRate * (1 + (this.loopNumber - 1) * 0.15);
    if (this.player.fuel <= 20 && this.player.fuel > 0) {
      this.fuelAlertTimer += dt;
      if (this.fuelAlertTimer > 0.8) {
        rocketRaidAudio.playLowFuelAlert();
        this.fuelAlertTimer = 0;
      }
    }

    if (this.player.fuel <= 0) {
      this.player.fuel = 0;
      this.player.y += 1.8; // gravity drops ship without fuel
    }

    // Player Movement
    const pSpeed = this.player.speed;
    if (this.keys['ArrowUp'] || this.keys['KeyW']) {
      this.player.y -= pSpeed;
    }
    if (this.keys['ArrowDown'] || this.keys['KeyS']) {
      this.player.y += pSpeed;
    }
    if (this.keys['ArrowLeft'] || this.keys['KeyA']) {
      this.player.x = Math.max(16, this.player.x - pSpeed * 0.9);
    }
    if (this.keys['ArrowRight'] || this.keys['KeyD']) {
      this.player.x = Math.min(NATIVE_WIDTH - 64, this.player.x + pSpeed * 1.1);
    }

    // World Scroll
    this.worldScrollX += this.baseScrollSpeed;
    const sectionCalculated = Math.min(5, Math.floor(this.worldScrollX / SECTION_LENGTH) + 1);
    if (sectionCalculated !== this.currentSectionIndex) {
      this.currentSectionIndex = sectionCalculated;
      this.spawnEntitiesForSection(this.currentSectionIndex);
    }

    // Screen Bounds
    this.player.y = Math.max(18, Math.min(NATIVE_HEIGHT - 20, this.player.y));

    // Collision with Terrain (Floor & Ceiling)
    const playerWorldX = this.worldScrollX + this.player.x;
    const floorY = this.getFloorYAt(playerWorldX + this.player.width / 2);
    const ceilingY = this.getCeilingYAt(playerWorldX + this.player.width / 2);

    if (this.invulnerabilityTimer > 0) {
      // Safe bounce during invulnerability shield so player never explodes on respawn
      if (this.player.y + this.player.height >= floorY - 1) {
        this.player.y = floorY - this.player.height - 2;
      }
      if (ceilingY !== undefined && this.player.y <= ceilingY + 1) {
        this.player.y = ceilingY + 2;
      }
    } else {
      if (this.player.y + this.player.height >= floorY - 1) {
        this.killPlayer('CRASHED INTO TERRAIN');
        return;
      }
      if (ceilingY !== undefined && this.player.y <= ceilingY + 1) {
        this.killPlayer('CRASHED INTO CEILING');
        return;
      }
    }

    // Update Lasers
    for (let i = this.lasers.length - 1; i >= 0; i--) {
      const laser = this.lasers[i];
      laser.x += laser.vx;
      if (laser.x > NATIVE_WIDTH) {
        this.lasers.splice(i, 1);
        continue;
      }

      // Check terrain collision
      const laserWorldX = this.worldScrollX + laser.x;
      const lFloor = this.getFloorYAt(laserWorldX);
      const lCeil = this.getCeilingYAt(laserWorldX);
      if (laser.y >= lFloor || (lCeil !== undefined && laser.y <= lCeil)) {
        this.createExplosion(laser.x, laser.y, '#f43f5e', 4);
        this.lasers.splice(i, 1);
      }
    }

    // Update Bombs
    for (let i = this.bombs.length - 1; i >= 0; i--) {
      const bomb = this.bombs[i];
      bomb.x += bomb.vx;
      bomb.y += bomb.vy;
      bomb.vy += 0.12; // gravity parabola

      const bWorldX = this.worldScrollX + bomb.x;
      const bFloor = this.getFloorYAt(bWorldX);
      if (bomb.y >= bFloor || bomb.x > NATIVE_WIDTH || bomb.y > NATIVE_HEIGHT) {
        this.createExplosion(bomb.x, Math.min(bomb.y, bFloor), '#facc15', 8);
        rocketRaidAudio.playExplosion(false);
        this.bombs.splice(i, 1);
      }
    }

    // Update Ground Rockets (Difficulty buildup: slow & forgiving in S1, fast & reactive in S4/S5)
    for (const r of this.groundRockets) {
      const screenX = r.x - this.worldScrollX;

      let triggerDist = 75; // S1 default
      let launchVy = -1.3;
      if (this.currentSectionIndex === 2) {
        triggerDist = 95;
        launchVy = -1.8;
      } else if (this.currentSectionIndex === 3) {
        triggerDist = 110;
        launchVy = -2.2;
      } else if (this.currentSectionIndex === 4) {
        triggerDist = 125;
        launchVy = -2.6;
      } else if (this.currentSectionIndex >= 5) {
        triggerDist = 145;
        launchVy = -3.1;
      }
      launchVy -= (this.loopNumber - 1) * 0.3;

      // Launch when player gets near
      if (!r.launched && screenX < NATIVE_WIDTH - 25 && screenX > this.player.x) {
        if (Math.abs(screenX - this.player.x) < triggerDist) {
          r.launched = true;
          r.vy = launchVy;
          rocketRaidAudio.playRocketLaunch();
        }
      }

      if (r.launched) {
        r.y += r.vy;
        // Smoke particles
        if (Math.random() > 0.4) {
          this.particles.push({
            x: screenX + r.width / 2,
            y: r.y + r.height,
            vx: -this.baseScrollSpeed,
            vy: Math.random() * 0.8,
            life: 1,
            maxLife: 0.35,
            color: '#e2e8f0',
            size: 2,
          });
        }
      }

      // Check collision with player (shield immune)
      if (
        this.invulnerabilityTimer <= 0 &&
        this.checkCollision(
          this.player.x,
          this.player.y,
          this.player.width,
          this.player.height,
          screenX,
          r.y,
          r.width,
          r.height
        )
      ) {
        this.killPlayer('HIT BY MISSILE');
        return;
      }

      // Check bullet collision
      for (let bIdx = this.lasers.length - 1; bIdx >= 0; bIdx--) {
        const bullet = this.lasers[bIdx];
        if (
          this.checkCollision(
            bullet.x,
            bullet.y,
            bullet.width,
            bullet.height,
            screenX,
            r.y,
            r.width,
            r.height
          )
        ) {
          this.addScore(r.launched ? 80 : 50);
          this.createExplosion(screenX, r.y, '#f97316', 10);
          rocketRaidAudio.playExplosion(false);
          this.lasers.splice(bIdx, 1);
          r.y = -999; // destroy
          break;
        }
      }

      // Check bomb collision
      for (let bmIdx = this.bombs.length - 1; bmIdx >= 0; bmIdx--) {
        const bomb = this.bombs[bmIdx];
        if (
          this.checkCollision(
            bomb.x,
            bomb.y,
            bomb.width,
            bomb.height,
            screenX,
            r.y,
            r.width,
            r.height
          )
        ) {
          this.addScore(r.launched ? 80 : 50);
          this.createExplosion(screenX, r.y, '#f97316', 12);
          rocketRaidAudio.playExplosion(false);
          this.bombs.splice(bmIdx, 1);
          r.y = -999;
          break;
        }
      }
    }

    // Update Fuel Depots
    for (const f of this.fuelDepots) {
      if (f.destroyed) continue;
      const screenX = f.x - this.worldScrollX;

      // Check bomb collision
      for (let bmIdx = this.bombs.length - 1; bmIdx >= 0; bmIdx--) {
        const bomb = this.bombs[bmIdx];
        if (
          this.checkCollision(
            bomb.x,
            bomb.y,
            bomb.width,
            bomb.height,
            screenX,
            f.y,
            f.width,
            f.height
          )
        ) {
          f.destroyed = true;
          this.player.fuel = Math.min(this.player.maxFuel, this.player.fuel + 28);
          this.addScore(150);
          this.createExplosion(screenX + f.width / 2, f.y + f.height / 2, '#38bdf8', 14);
          rocketRaidAudio.playFuelChime();
          this.bombs.splice(bmIdx, 1);
          break;
        }
      }

      // Check laser collision
      for (let lIdx = this.lasers.length - 1; lIdx >= 0; lIdx--) {
        const laser = this.lasers[lIdx];
        if (
          this.checkCollision(
            laser.x,
            laser.y,
            laser.width,
            laser.height,
            screenX,
            f.y,
            f.width,
            f.height
          )
        ) {
          f.destroyed = true;
          this.player.fuel = Math.min(this.player.maxFuel, this.player.fuel + 28);
          this.addScore(150);
          this.createExplosion(screenX + f.width / 2, f.y + f.height / 2, '#38bdf8', 14);
          rocketRaidAudio.playFuelChime();
          this.lasers.splice(lIdx, 1);
          break;
        }
      }
    }

    // Update Radar Bases
    for (const rb of this.radarBases) {
      if (rb.destroyed) continue;
      const screenX = rb.x - this.worldScrollX;
      for (let bmIdx = this.bombs.length - 1; bmIdx >= 0; bmIdx--) {
        const bomb = this.bombs[bmIdx];
        if (
          this.checkCollision(
            bomb.x,
            bomb.y,
            bomb.width,
            bomb.height,
            screenX,
            rb.y,
            rb.width,
            rb.height
          )
        ) {
          rb.destroyed = true;
          this.addScore(100);
          this.createExplosion(screenX, rb.y, '#fbbf24', 12);
          rocketRaidAudio.playExplosion(false);
          this.bombs.splice(bmIdx, 1);
          break;
        }
      }
    }

    // Update Dancing Aliens in Section 2
    for (const alien of this.dancingAliens) {
      alien.phase += alien.speed;
      alien.y = alien.baseY + Math.sin(alien.phase) * alien.amplitude;
      const screenX = alien.x - this.worldScrollX;

      // Player collision (immune during invulnerability shield)
      if (
        this.invulnerabilityTimer <= 0 &&
        this.checkCollision(
          this.player.x,
          this.player.y,
          this.player.width,
          this.player.height,
          screenX,
          alien.y,
          alien.width,
          alien.height
        )
      ) {
        this.killPlayer('CRASHED INTO ALIEN MINE');
        return;
      }

      // Laser collision
      for (let lIdx = this.lasers.length - 1; lIdx >= 0; lIdx--) {
        const laser = this.lasers[lIdx];
        if (
          this.checkCollision(
            laser.x,
            laser.y,
            laser.width,
            laser.height,
            screenX,
            alien.y,
            alien.width,
            alien.height
          )
        ) {
          this.addScore(100);
          this.createExplosion(screenX, alien.y, '#a855f7', 12);
          rocketRaidAudio.playExplosion(false);
          this.lasers.splice(lIdx, 1);
          alien.y = -999;
          break;
        }
      }
    }

    // Spawn Meteors in Section 3 (Interval & speed progressive)
    if (this.currentSectionIndex === 3) {
      this.meteorSpawnTimer += dt;
      const meteorInterval = Math.max(0.65, 1.1 - (this.loopNumber - 1) * 0.15);
      if (this.meteorSpawnTimer > meteorInterval) {
        this.meteorSpawnTimer = 0;
        const baseVx = -2.6 - (this.loopNumber - 1) * 0.5;
        this.meteors.push({
          id: Math.random(),
          x: NATIVE_WIDTH + 10,
          y: 35 + Math.random() * 140,
          vx: baseVx - Math.random() * 1.4,
          vy: (Math.random() - 0.5) * 0.8,
          size: 7 + Math.random() * 5,
        });
      }
    }

    // Update Meteors
    for (let mIdx = this.meteors.length - 1; mIdx >= 0; mIdx--) {
      const m = this.meteors[mIdx];
      m.x += m.vx;
      m.y += m.vy;

      if (m.x < -20) {
        this.meteors.splice(mIdx, 1);
        continue;
      }

      // Player collision (immune during invulnerability shield)
      if (
        this.invulnerabilityTimer <= 0 &&
        this.checkCollision(
          this.player.x,
          this.player.y,
          this.player.width,
          this.player.height,
          m.x,
          m.y,
          m.size,
          m.size
        )
      ) {
        this.killPlayer('HIT BY METEOR');
        return;
      }

      // Laser collision
      for (let lIdx = this.lasers.length - 1; lIdx >= 0; lIdx--) {
        const laser = this.lasers[lIdx];
        if (
          this.checkCollision(
            laser.x,
            laser.y,
            laser.width,
            laser.height,
            m.x,
            m.y,
            m.size,
            m.size
          )
        ) {
          this.addScore(120);
          this.createExplosion(m.x, m.y, '#22c55e', 14);
          rocketRaidAudio.playExplosion(false);
          this.lasers.splice(lIdx, 1);
          this.meteors.splice(mIdx, 1);
          break;
        }
      }
    }

    // Update Final Base in Section 5
    if (this.finalBase) {
      this.finalBase.pulsing = (this.finalBase.pulsing + 0.08) % (Math.PI * 2);
      const screenX = this.finalBase.x - this.worldScrollX;

      // Bomb and Laser hit on Final Base Core
      for (let bmIdx = this.bombs.length - 1; bmIdx >= 0; bmIdx--) {
        const bomb = this.bombs[bmIdx];
        if (
          this.checkCollision(
            bomb.x,
            bomb.y,
            bomb.width,
            bomb.height,
            screenX,
            this.finalBase.y,
            this.finalBase.width,
            this.finalBase.height
          )
        ) {
          this.finalBase.health--;
          this.createExplosion(screenX + 16, this.finalBase.y + 16, '#facc15', 16);
          rocketRaidAudio.playExplosion(true);
          this.bombs.splice(bmIdx, 1);

          if (this.finalBase.health <= 0) {
            this.triggerVictory();
            return;
          }
        }
      }

      for (let lIdx = this.lasers.length - 1; lIdx >= 0; lIdx--) {
        const laser = this.lasers[lIdx];
        if (
          this.checkCollision(
            laser.x,
            laser.y,
            laser.width,
            laser.height,
            screenX,
            this.finalBase.y,
            this.finalBase.width,
            this.finalBase.height
          )
        ) {
          this.finalBase.health--;
          this.createExplosion(screenX + 16, this.finalBase.y + 16, '#facc15', 16);
          rocketRaidAudio.playExplosion(true);
          this.lasers.splice(lIdx, 1);

          if (this.finalBase.health <= 0) {
            this.triggerVictory();
            return;
          }
        }
      }
    }

    this.updateParticles();
  }

  private triggerVictory() {
    this.addScore(5000);
    this.createExplosion(this.player.x + 100, 110, '#facc15', 36);
    rocketRaidAudio.playVictoryFanfare();
    this.gameState = 'VICTORY';
    this.respawnTimer = 4.0;
  }

  private killPlayer(_reason: string) {
    if (this.invulnerabilityTimer > 0) return; // Immune during respawn & restart shield
    this.player.isAlive = false;
    this.lives--;
    this.gameState = 'PLAYER_HIT';
    this.respawnTimer = 2.0;
    this.createExplosion(this.player.x + 10, this.player.y + 5, '#ef4444', 24);
    rocketRaidAudio.playExplosion(true);
  }

  public addScore(pts: number) {
    this.score += pts;
    if (this.score > this.highScore) {
      this.highScore = this.score;
    }
    if (!this.bonusLifeGiven && this.score >= 10000) {
      this.lives++;
      this.bonusLifeGiven = true;
      rocketRaidAudio.playVictoryFanfare();
    }
  }

  private checkCollision(
    x1: number,
    y1: number,
    w1: number,
    h1: number,
    x2: number,
    y2: number,
    w2: number,
    h2: number
  ): boolean {
    return x1 < x2 + w2 && x1 + w1 > x2 && y1 < y2 + h2 && y1 + h1 > y2;
  }

  private createExplosion(x: number, y: number, color: string, count: number) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.0 + Math.random() * 2.5;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        maxLife: 0.35 + Math.random() * 0.3,
        color,
        size: 1 + Math.random() * 3,
      });
    }
  }

  private updateParticles() {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life -= 0.035;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }
}
