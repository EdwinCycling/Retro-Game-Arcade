/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Authentic 1982 Sega Zaxxon Isometric 3D Game Engine
 */

import { zaxxonAudio } from './zaxxonAudio';

export type ZaxxonStageType = 'fortress_1' | 'space' | 'fortress_2_boss';

export interface ZaxxonSettings {
  invertFlightStick: boolean; // true = flight simulator (Down=Climb, Up=Dive); false = casual (Up=Climb, Down=Dive)
  scanlines: boolean;
  infiniteFuel: boolean;
  godMode: boolean;
}

export interface PlayerBullet {
  x: number;
  y: number;
  z: number;
  active: boolean;
}

export interface EnemyBullet {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  active: boolean;
}

export interface Particle {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  color: string;
  size: number;
  life: number;
  maxLife: number;
}

export interface FortressWall {
  y: number; // Y position along corridor
  minX: number;
  maxX: number;
  height: number; // 1 to 3
  gapMinX: number;
  gapMaxX: number;
  gapMinZ: number;
  gapMaxZ: number;
  isForceField?: boolean;
  forceFieldTimer?: number;
  active: boolean;
}

export interface GroundTarget {
  id: number;
  type: 'fuel' | 'radar' | 'turret' | 'missile_silo' | 'parked_plane';
  x: number;
  y: number;
  z: number;
  destroyed: boolean;
  points: number;
  fireCooldown?: number;
  missileLaunched?: boolean;
  missileZ?: number;
  missileVy?: number;
  radarAngle?: number;
}

export interface SpaceEnemy {
  id: number;
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  active: boolean;
  points: number;
  hp: number;
  color: string;
}

export interface RobotBoss {
  x: number;
  y: number;
  z: number;
  vx: number;
  hp: number;
  maxHp: number;
  missileLaunched: boolean;
  missileX: number;
  missileY: number;
  missileZ: number;
  missileHp: number;
  active: boolean;
  destroyed: boolean;
}

export class ZaxxonEngine {
  public width: number;
  public height: number;

  // Game state
  public score: number = 0;
  public highScore: number = 88400;
  public lives: number = 3;
  public fuel: number = 100;
  public maxFuel: number = 100;
  public round: number = 1;
  public stage: ZaxxonStageType = 'fortress_1';
  public enemyPlanesRemaining: number = 20;
  public isGameOver: boolean = false;
  public isPaused: boolean = false;
  public isStageClearing: boolean = false;
  public stageClearTimer: number = 0;

  // Player ship
  // World bounds: X is corridor width (-150 to +150), Y is player fixed forward anchor (e.g. 100)
  public playerX: number = 0;
  public playerY: number = 120; // Fixed screen anchor position
  public playerZ: number = 1.5; // Altitude from 0.0 (ground) to 3.0 (high ceiling)
  public playerRoll: number = 0; // Bank angle when banking left/right
  public playerSpeed: number = 4.0;
  public isDying: boolean = false;
  public respawnTimer: number = 0;
  public invulnerableTimer: number = 0;

  // Scroll distance
  public scrollDistance: number = 0;
  public stageDistance: number = 0;
  public readonly STAGE_1_LENGTH = 3200;
  public readonly STAGE_2_LENGTH = 2400;
  public readonly STAGE_3_LENGTH = 3600;

  // Entities
  public bullets: PlayerBullet[] = [];
  public enemyBullets: EnemyBullet[] = [];
  public walls: FortressWall[] = [];
  public targets: GroundTarget[] = [];
  public spaceEnemies: SpaceEnemy[] = [];
  public robotBoss: RobotBoss | null = null;
  public particles: Particle[] = [];

  // Input states
  public keys: Record<string, boolean> = {};

  // Settings
  public settings: ZaxxonSettings = {
    invertFlightStick: false,
    scanlines: true,
    infiniteFuel: false,
    godMode: false
  };

  // Starfield for deep space
  public stars: { x: number; y: number; speed: number; size: number; brightness: number }[] = [];

  // Next target id
  private targetSeq: number = 1;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.initStars();
  }

  private initStars() {
    this.stars = [];
    for (let i = 0; i < 120; i++) {
      this.stars.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        speed: 1.5 + Math.random() * 3.5,
        size: Math.random() > 0.8 ? 2 : 1,
        brightness: 0.4 + Math.random() * 0.6
      });
    }
  }

  public resetGame() {
    this.score = 0;
    this.lives = 3;
    this.fuel = 100;
    this.round = 1;
    this.stage = 'fortress_1';
    this.enemyPlanesRemaining = 20;
    this.isGameOver = false;
    this.isPaused = false;
    this.isStageClearing = false;
    this.isDying = false;
    this.respawnTimer = 0;
    this.invulnerableTimer = 180; // 3 seconds grace
    this.playerX = 0;
    this.playerZ = 1.5;
    this.playerRoll = 0;
    this.scrollDistance = 0;
    this.stageDistance = 0;
    this.bullets = [];
    this.enemyBullets = [];
    this.particles = [];
    this.spaceEnemies = [];
    this.robotBoss = null;

    zaxxonAudio.stopLowFuelSiren();
    zaxxonAudio.startEngine(this.playerZ);

    this.buildFortressStage(1);
  }

  /**
   * Procedurally generates fortress structures for Stage 1 or Stage 3
   */
  private buildFortressStage(roundNum: number) {
    this.walls = [];
    this.targets = [];
    this.targetSeq = 1;

    const length = this.stage === 'fortress_1' ? this.STAGE_1_LENGTH : this.STAGE_3_LENGTH;

    // Create walls at rhythmic intervals
    for (let dist = 600; dist < length - 400; dist += 550) {
      const isForceField = Math.random() > 0.55;
      const height = isForceField ? 3 : (Math.random() > 0.4 ? 2 : 3);

      // Gap opening in wall
      const gapWidth = Math.max(50, 75 - roundNum * 5);
      const gapCenter = (Math.random() - 0.5) * 160;
      const gapMinX = gapCenter - gapWidth / 2;
      const gapMaxX = gapCenter + gapWidth / 2;

      // Slot opening height
      let gapMinZ = 0;
      let gapMaxZ = 3;
      if (!isForceField) {
        if (height === 3) {
          // Window slot
          const slotTier = Math.floor(Math.random() * 3); // 0, 1, or 2
          gapMinZ = slotTier * 0.9;
          gapMaxZ = gapMinZ + 1.2;
        } else {
          // Low wall gap
          gapMinZ = 0;
          gapMaxZ = 3;
        }
      }

      this.walls.push({
        y: dist,
        minX: -150,
        maxX: 150,
        height,
        gapMinX,
        gapMaxX,
        gapMinZ,
        gapMaxZ,
        isForceField,
        forceFieldTimer: 0,
        active: true
      });
    }

    // Populate ground targets (Fuel tanks, Radars, Gun Turrets, Missile Silos, Parked Planes)
    for (let dist = 300; dist < length - 200; dist += 110 + Math.random() * 70) {
      const typeRoll = Math.random();
      let type: GroundTarget['type'] = 'fuel';
      let points = 200;

      if (typeRoll < 0.32) {
        type = 'fuel';
        points = 300;
      } else if (typeRoll < 0.52) {
        type = 'turret';
        points = 500;
      } else if (typeRoll < 0.72) {
        type = 'missile_silo';
        points = 150;
      } else if (typeRoll < 0.86) {
        type = 'parked_plane';
        points = 100;
      } else {
        type = 'radar';
        points = 1000;
      }

      const x = (Math.random() - 0.5) * 220;

      this.targets.push({
        id: this.targetSeq++,
        type,
        x,
        y: dist,
        z: 0,
        destroyed: false,
        points,
        fireCooldown: 60 + Math.random() * 120,
        missileLaunched: false,
        missileZ: 0,
        missileVy: 0,
        radarAngle: Math.random() * Math.PI * 2
      });
    }

    // If stage 3, spawn Zaxxon Robot boss at the end!
    if (this.stage === 'fortress_2_boss') {
      this.robotBoss = {
        x: 0,
        y: length - 250,
        z: 0,
        vx: 1.5,
        hp: 6,
        maxHp: 6,
        missileLaunched: false,
        missileX: 0,
        missileY: length - 250,
        missileZ: 1.5,
        missileHp: 6,
        active: true,
        destroyed: false
      };
    }
  }

  /**
   * Fires twin laser cannons from player ship
   */
  public fireBullet() {
    if (this.isDying || this.isGameOver || this.isPaused || this.isStageClearing) return;
    if (this.bullets.filter(b => b.active).length >= 4) return; // Max 4 on screen like original

    // Twin lasers offset slightly left and right
    this.bullets.push({
      x: this.playerX - 6,
      y: this.playerY + 20,
      z: this.playerZ,
      active: true
    });
    this.bullets.push({
      x: this.playerX + 6,
      y: this.playerY + 20,
      z: this.playerZ,
      active: true
    });

    zaxxonAudio.playLaser();
  }

  /**
   * Main Engine Update Loop (called ~60 FPS)
   */
  public update() {
    if (this.isPaused) return;

    // Stage transition animation
    if (this.isStageClearing) {
      this.stageClearTimer--;
      this.playerZ = Math.min(3.0, this.playerZ + 0.03); // Ascend into the cosmos
      this.playerY += 3;
      if (this.stageClearTimer <= 0) {
        this.nextStage();
      }
      this.updateParticles();
      return;
    }

    // Death / Respawn timer
    if (this.isDying) {
      this.respawnTimer--;
      this.updateParticles();
      if (this.respawnTimer <= 0) {
        if (this.lives > 0) {
          this.respawnPlayer();
        } else {
          this.isGameOver = true;
          zaxxonAudio.playGameOver();
        }
      }
      return;
    }

    if (this.isGameOver) {
      this.updateParticles();
      return;
    }

    // Invulnerability grace counter
    if (this.invulnerableTimer > 0) {
      this.invulnerableTimer--;
    }

    // --- 1. HANDLE PLAYER INPUT & MOVEMENT ---
    const moveSpeed = this.playerSpeed;

    // Lateral (X) movement
    let movingX = 0;
    if (this.keys['ArrowLeft'] || this.keys['KeyA']) movingX -= 1;
    if (this.keys['ArrowRight'] || this.keys['KeyD']) movingX += 1;

    this.playerX += movingX * moveSpeed;
    // Bank angle interpolation
    const targetRoll = movingX * 0.35;
    this.playerRoll += (targetRoll - this.playerRoll) * 0.2;

    // Clamp X to corridor walls
    const bound = 135;
    if (this.playerX < -bound) this.playerX = -bound;
    if (this.playerX > bound) this.playerX = bound;

    // Altitude (Z) movement
    let movingZ = 0;
    if (this.keys['ArrowUp'] || this.keys['KeyW']) {
      movingZ += this.settings.invertFlightStick ? -1 : 1;
    }
    if (this.keys['ArrowDown'] || this.keys['KeyS']) {
      movingZ += this.settings.invertFlightStick ? 1 : -1;
    }

    this.playerZ += movingZ * 0.055;
    if (this.playerZ < 0.1) this.playerZ = 0.1;
    if (this.playerZ > 3.0) this.playerZ = 3.0;

    zaxxonAudio.updateEngineAltitude(this.playerZ);

    // Continuous fire on Space or KeyK
    if (this.keys['Space'] || this.keys['KeyK'] || this.keys['Enter']) {
      // Rate limit fire
      if (Math.random() < 0.25) {
        this.fireBullet();
      }
    }

    // --- 2. FUEL SYSTEM ---
    if (!this.settings.infiniteFuel) {
      this.fuel = Math.max(0, this.fuel - 0.028);

      if (this.fuel < 25 && this.fuel > 0) {
        zaxxonAudio.startLowFuelSiren();
      } else {
        zaxxonAudio.stopLowFuelSiren();
      }

      if (this.fuel <= 0) {
        // Fuel starved! Ship flames out and crashes!
        this.killPlayer('Out of fuel!');
        return;
      }
    }

    // --- 3. SCROLLING & STAGE PROGRESSION ---
    const scrollSpeed = 3.2;
    this.scrollDistance += scrollSpeed;
    this.stageDistance += scrollSpeed;

    // Deep space star movement (drifting downwards and to the left, opposing up-right flight)
    for (const star of this.stars) {
      star.x -= star.speed * 0.95;
      star.y += star.speed * 0.55;
      if (star.x < 0) star.x = this.width + 10;
      if (star.y > this.height) {
        star.y = 0;
        star.x = Math.random() * this.width;
      }
    }

    // Check stage completion
    const targetLength =
      this.stage === 'fortress_1'
        ? this.STAGE_1_LENGTH
        : this.stage === 'space'
        ? this.STAGE_2_LENGTH
        : this.STAGE_3_LENGTH;

    if (this.stageDistance >= targetLength && !this.isStageClearing) {
      if (this.stage === 'fortress_2_boss' && this.robotBoss && !this.robotBoss.destroyed) {
        // Must defeat boss to clear!
      } else {
        this.startStageClear();
      }
    }

    // --- 4. UPDATE WEAPONS & PROJECTILES ---
    for (const bullet of this.bullets) {
      if (!bullet.active) continue;
      bullet.y += 12.0; // Fly forward up the corridor
      if (bullet.y > this.playerY + 650) {
        bullet.active = false;
      }
    }

    for (const bullet of this.enemyBullets) {
      if (!bullet.active) continue;
      bullet.x += bullet.vx;
      bullet.y += bullet.vy;
      bullet.z += bullet.vz;

      // Check collision with player
      const dx = Math.abs(bullet.x - this.playerX);
      const dy = Math.abs(bullet.y - this.playerY);
      const dz = Math.abs(bullet.z - this.playerZ);

      if (dx < 16 && dy < 20 && dz < 0.45 && !this.settings.godMode && this.invulnerableTimer <= 0) {
        bullet.active = false;
        this.killPlayer('Shot down by enemy flak!');
        return;
      }

      if (bullet.y < this.playerY - 200 || bullet.y > this.playerY + 800) {
        bullet.active = false;
      }
    }

    // --- 5. STAGE-SPECIFIC UPDATES ---
    if (this.stage === 'fortress_1' || this.stage === 'fortress_2_boss') {
      this.updateFortressElements();
    } else if (this.stage === 'space') {
      this.updateSpaceDogfight();
    }

    // Update particles
    this.updateParticles();
  }

  /**
   * Updates fortress walls, fuel tanks, gun turrets, radar towers, and missile silos
   */
  private updateFortressElements() {
    // 1. Force fields & Wall collisions
    for (const wall of this.walls) {
      if (!wall.active) continue;
      if (wall.isForceField && wall.forceFieldTimer !== undefined) {
        wall.forceFieldTimer++;
      }

      // Check if player reaches wall Y position
      // Wall relative Y to player:
      const relY = wall.y - this.stageDistance;
      const playerDist = Math.abs(relY - this.playerY);

      if (playerDist < 12) {
        // In the wall plane! Check if passing through gap
        const inGapX = this.playerX >= wall.gapMinX && this.playerX <= wall.gapMaxX;
        const inGapZ = this.playerZ >= wall.gapMinZ && this.playerZ <= wall.gapMaxZ;

        // Force field state
        const fieldFlickerOn = wall.isForceField && Math.floor((wall.forceFieldTimer || 0) / 20) % 2 === 0;

        if (wall.isForceField) {
          if (fieldFlickerOn && inGapX && inGapZ && !this.settings.godMode && this.invulnerableTimer <= 0) {
            this.killPlayer('Vaporized by Electronic Force Field!');
            return;
          }
        } else {
          // Solid wall
          if ((!inGapX || !inGapZ) && !this.settings.godMode && this.invulnerableTimer <= 0) {
            this.killPlayer('Crashed into Fortress Wall!');
            return;
          }
        }
      }

      // Check bullets hitting wall
      for (const bullet of this.bullets) {
        if (!bullet.active) continue;
        const bRelY = wall.y - this.stageDistance;
        if (Math.abs(bullet.y - bRelY) < 14) {
          const inGapX = bullet.x >= wall.gapMinX && bullet.x <= wall.gapMaxX;
          const inGapZ = bullet.z >= wall.gapMinZ && bullet.z <= wall.gapMaxZ;
          if (!inGapX || !inGapZ) {
            bullet.active = false;
            this.spawnSparks(bullet.x, bullet.y, bullet.z, '#fbbf24', 6);
          }
        }
      }
    }

    // 2. Ground Targets (Fuel, Turrets, Radars, Silos)
    for (const target of this.targets) {
      if (target.destroyed) continue;

      const relY = target.y - this.stageDistance;

      // Radar dish rotation
      if (target.type === 'radar' && target.radarAngle !== undefined) {
        target.radarAngle += 0.05;
      }

      // Gun Turrets firing
      if (target.type === 'turret' && relY > this.playerY && relY < this.playerY + 500) {
        target.fireCooldown = (target.fireCooldown || 60) - 1;
        if (target.fireCooldown <= 0) {
          target.fireCooldown = 90 + Math.random() * 60;
          // Fire flak shell towards player
          this.enemyBullets.push({
            x: target.x,
            y: relY,
            z: 0.2,
            vx: (this.playerX - target.x) * 0.015,
            vy: -4.5,
            vz: (this.playerZ - 0.2) * 0.02,
            active: true
          });
        }
      }

      // Missile Silos launching
      if (target.type === 'missile_silo' && !target.missileLaunched) {
        if (relY > this.playerY + 100 && relY < this.playerY + 380) {
          target.missileLaunched = true;
          target.missileZ = 0;
          target.missileVy = 1.8;
          zaxxonAudio.playMissileLaunch();
        }
      }

      if (target.missileLaunched && target.missileZ !== undefined) {
        target.missileZ += 0.04;
        // Check collision between launched missile and player
        const dx = Math.abs(target.x - this.playerX);
        const dy = Math.abs(relY - this.playerY);
        const dz = Math.abs(target.missileZ - this.playerZ);
        if (dx < 18 && dy < 22 && dz < 0.4 && !this.settings.godMode && this.invulnerableTimer <= 0) {
          this.killPlayer('Struck by Surface-to-Air Missile!');
          return;
        }
      }

      // Check bullet hits on ground targets
      for (const bullet of this.bullets) {
        if (!bullet.active) continue;

        // Ground targets are at altitude z = 0 (or low skimming < 0.6)
        // Launched missile is at target.missileZ
        let hit = false;

        if (target.type === 'missile_silo' && target.missileLaunched && target.missileZ !== undefined) {
          // Can shoot the rising missile in mid-air!
          const dx = Math.abs(bullet.x - target.x);
          const dy = Math.abs(bullet.y - relY);
          const dz = Math.abs(bullet.z - target.missileZ);
          if (dx < 18 && dy < 24 && dz < 0.5) {
            hit = true;
          }
        }

        // Standard ground target hit
        if (!hit && bullet.z <= 0.6) {
          const dx = Math.abs(bullet.x - target.x);
          const dy = Math.abs(bullet.y - relY);
          if (dx < 20 && dy < 26) {
            hit = true;
          }
        }

        if (hit) {
          bullet.active = false;
          target.destroyed = true;
          this.score += target.points;
          this.checkBonusLife();

          if (target.type === 'fuel') {
            // Restore Fuel by 25%!
            this.fuel = Math.min(this.maxFuel, this.fuel + 25);
            zaxxonAudio.playFuelChime();
            this.spawnSparks(target.x, relY, target.z, '#38bdf8', 15);
          } else if (target.type === 'parked_plane') {
            this.enemyPlanesRemaining = Math.max(0, this.enemyPlanesRemaining - 1);
            zaxxonAudio.playExplosion(false);
            this.spawnExplosion(target.x, relY, target.z, false);
          } else {
            zaxxonAudio.playExplosion(target.type === 'radar');
            this.spawnExplosion(target.x, relY, target.z, target.type === 'radar');
          }
          break;
        }
      }
    }

    // 3. Robot Boss (in stage 3)
    if (this.robotBoss && this.robotBoss.active && !this.robotBoss.destroyed) {
      const bossRelY = this.robotBoss.y - this.stageDistance;

      // Boss moves laterally back and forth
      this.robotBoss.x += this.robotBoss.vx;
      if (this.robotBoss.x > 110 || this.robotBoss.x < -110) {
        this.robotBoss.vx = -this.robotBoss.vx;
      }

      // Launch seeking missile when player enters chamber
      if (!this.robotBoss.missileLaunched && bossRelY < this.playerY + 450) {
        this.robotBoss.missileLaunched = true;
        this.robotBoss.missileX = this.robotBoss.x;
        this.robotBoss.missileY = bossRelY - 20;
        this.robotBoss.missileZ = 1.5;
        this.robotBoss.missileHp = 6;
        zaxxonAudio.playRobotBossHum();
        zaxxonAudio.playMissileLaunch();
      }

      // Update boss homing missile
      if (this.robotBoss.missileLaunched && this.robotBoss.missileHp > 0) {
        // Tracks player smoothly
        this.robotBoss.missileX += (this.playerX - this.robotBoss.missileX) * 0.025;
        this.robotBoss.missileY -= 2.2;
        this.robotBoss.missileZ += (this.playerZ - this.robotBoss.missileZ) * 0.03;

        // Check collision with player
        const dx = Math.abs(this.robotBoss.missileX - this.playerX);
        const dy = Math.abs(this.robotBoss.missileY - this.playerY);
        const dz = Math.abs(this.robotBoss.missileZ - this.playerZ);

        if (dx < 20 && dy < 22 && dz < 0.45 && !this.settings.godMode && this.invulnerableTimer <= 0) {
          this.killPlayer('Obliterated by Zaxxon Robot Homing Missile!');
          return;
        }

        // Bullets hitting homing missile
        for (const bullet of this.bullets) {
          if (!bullet.active) continue;
          const bDx = Math.abs(bullet.x - this.robotBoss.missileX);
          const bDy = Math.abs(bullet.y - this.robotBoss.missileY);
          const bDz = Math.abs(bullet.z - this.robotBoss.missileZ);

          if (bDx < 18 && bDy < 22 && bDz < 0.5) {
            bullet.active = false;
            this.robotBoss.missileHp--;
            this.spawnSparks(this.robotBoss.missileX, this.robotBoss.missileY, this.robotBoss.missileZ, '#f97316', 8);

            if (this.robotBoss.missileHp <= 0) {
              zaxxonAudio.playExplosion(true);
              this.spawnExplosion(this.robotBoss.missileX, this.robotBoss.missileY, this.robotBoss.missileZ, true);
              this.score += 2000;
              this.checkBonusLife();
            }
          }
        }
      }

      // Bullets hitting Robot Boss body
      for (const bullet of this.bullets) {
        if (!bullet.active) continue;
        const bDx = Math.abs(bullet.x - this.robotBoss.x);
        const bDy = Math.abs(bullet.y - bossRelY);
        const bDz = Math.abs(bullet.z - 1.5);

        if (bDx < 35 && bDy < 40 && bDz < 1.0) {
          bullet.active = false;
          this.robotBoss.hp--;
          this.spawnSparks(this.robotBoss.x, bossRelY, 1.5, '#e11d48', 12);

          if (this.robotBoss.hp <= 0) {
            this.robotBoss.destroyed = true;
            zaxxonAudio.playExplosion(true);
            this.spawnExplosion(this.robotBoss.x, bossRelY, 1.5, true);
            this.score += 10000; // Giant boss bonus!
            this.checkBonusLife();
            this.startStageClear();
          }
          break;
        }
      }
    }
  }

  /**
   * Updates Stage 2: Deep Space Dogfight squadrons
   */
  private updateSpaceDogfight() {
    // Spawn space squadrons
    if (Math.random() < 0.04 && this.spaceEnemies.length < 6) {
      const startX = (Math.random() - 0.5) * 200;
      this.spaceEnemies.push({
        id: this.targetSeq++,
        x: startX,
        y: this.playerY + 500,
        z: 0.5 + Math.random() * 2.0,
        vx: (Math.random() - 0.5) * 2.5,
        vy: -5.5 - Math.random() * 2.0,
        vz: (Math.random() - 0.5) * 0.04,
        active: true,
        points: 500,
        hp: 1,
        color: Math.random() > 0.5 ? '#f43f5e' : '#a855f7'
      });
    }

    for (const enemy of this.spaceEnemies) {
      if (!enemy.active) continue;

      enemy.x += enemy.vx;
      enemy.y += enemy.vy;
      enemy.z += enemy.vz;

      // Bounce at corridor bounds
      if (enemy.x < -140 || enemy.x > 140) enemy.vx = -enemy.vx;
      if (enemy.z < 0.3 || enemy.z > 2.8) enemy.vz = -enemy.vz;

      // Enemy fire
      if (Math.random() < 0.025 && enemy.y > this.playerY + 80) {
        this.enemyBullets.push({
          x: enemy.x,
          y: enemy.y,
          z: enemy.z,
          vx: (this.playerX - enemy.x) * 0.02,
          vy: -6.0,
          vz: (this.playerZ - enemy.z) * 0.02,
          active: true
        });
      }

      // Check collision with player
      const dx = Math.abs(enemy.x - this.playerX);
      const dy = Math.abs(enemy.y - this.playerY);
      const dz = Math.abs(enemy.z - this.playerZ);

      if (dx < 20 && dy < 24 && dz < 0.45 && !this.settings.godMode && this.invulnerableTimer <= 0) {
        enemy.active = false;
        this.killPlayer('Mid-air collision with enemy fighter!');
        return;
      }

      // Check bullet hits on enemy
      for (const bullet of this.bullets) {
        if (!bullet.active) continue;
        const bDx = Math.abs(bullet.x - enemy.x);
        const bDy = Math.abs(bullet.y - enemy.y);
        const bDz = Math.abs(bullet.z - enemy.z);

        if (bDx < 22 && bDy < 26 && bDz < 0.55) {
          bullet.active = false;
          enemy.active = false;
          this.score += enemy.points;
          this.enemyPlanesRemaining = Math.max(0, this.enemyPlanesRemaining - 1);
          this.checkBonusLife();
          zaxxonAudio.playExplosion(false);
          this.spawnExplosion(enemy.x, enemy.y, enemy.z, false);
          break;
        }
      }

      if (enemy.y < this.playerY - 150) {
        enemy.active = false;
      }
    }
  }

  private checkBonusLife() {
    if (this.score >= 10000 && (this.score - 10000) < 1000 && this.lives < 5) {
      // Extra life!
      this.lives++;
      zaxxonAudio.playFuelChime();
    }
  }

  private startStageClear() {
    this.isStageClearing = true;
    this.stageClearTimer = 140;
    zaxxonAudio.playStageClear();
  }

  private nextStage() {
    this.isStageClearing = false;
    this.stageDistance = 0;
    this.bullets = [];
    this.enemyBullets = [];
    this.spaceEnemies = [];
    this.playerY = 120;
    this.playerZ = 1.5;

    this.enemyPlanesRemaining = 20;

    if (this.stage === 'fortress_1') {
      this.stage = 'space';
      // Deep space dogfight
    } else if (this.stage === 'space') {
      this.stage = 'fortress_2_boss';
      this.buildFortressStage(this.round + 1);
    } else {
      // Completed full round!
      this.round++;
      this.stage = 'fortress_1';
      this.buildFortressStage(this.round);
    }
  }

  private killPlayer(reason: string) {
    if (this.settings.godMode || this.invulnerableTimer > 0) return;
    this.isDying = true;
    this.lives--;
    this.respawnTimer = 110;
    zaxxonAudio.playExplosion(true);
    this.spawnExplosion(this.playerX, this.playerY, this.playerZ, true);
  }

  private respawnPlayer() {
    this.isDying = false;
    this.playerX = 0;
    this.playerZ = 1.5;
    this.playerRoll = 0;
    this.invulnerableTimer = 180; // 3 seconds invulnerability on respawn
    this.fuel = Math.min(100, this.fuel + 30); // Give player boost of fuel
    this.bullets = [];
    this.enemyBullets = [];
    zaxxonAudio.startEngine(this.playerZ);
  }

  private spawnExplosion(x: number, y: number, z: number, isBig: boolean) {
    const count = isBig ? 32 : 16;
    const colors = ['#f97316', '#ef4444', '#facc15', '#ffffff'];
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.5 + Math.random() * (isBig ? 6 : 3.5);
      this.particles.push({
        x,
        y,
        z,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        vz: (Math.random() - 0.5) * 0.08,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 2 + Math.random() * (isBig ? 4 : 2.5),
        life: 0,
        maxLife: 30 + Math.random() * 25
      });
    }
  }

  private spawnSparks(x: number, y: number, z: number, color: string, count: number) {
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x,
        y,
        z,
        vx: (Math.random() - 0.5) * 3,
        vy: (Math.random() - 0.5) * 3,
        vz: (Math.random() - 0.5) * 0.05,
        color,
        size: 1.5,
        life: 0,
        maxLife: 15 + Math.random() * 15
      });
    }
  }

  private updateParticles() {
    for (const p of this.particles) {
      p.x += p.vx;
      p.y += p.vy;
      p.z += p.vz;
      p.life++;
    }
    this.particles = this.particles.filter(p => p.life < p.maxLife);
  }

  // --- 6. ISOMETRIC PROJECTION COORDINATES ---
  /**
   * Converts world coordinates (x, y, z) into screen canvas coordinates (screenX, screenY).
   * Authentic 1982 Sega Zaxxon axonometric perspective:
   * Forward flight path points towards TOP-RIGHT (+X_screen, -Y_screen) at ~30° angle.
   * Lateral cross-deck axis points towards DOWN-RIGHT (+X_screen, +Y_screen).
   * Altitude Z points straight UP (0, -Z * scale).
   */
  public worldToScreen(x: number, y: number, z: number): { x: number; y: number } {
    // Screen anchor: player anchored in lower-left quadrant
    const anchorX = this.width * 0.28;
    const anchorY = this.height * 0.68;

    // Forward flight vector (up and to the right)
    const forwardX = 0.95;
    const forwardY = 0.55;

    // Lateral cross-corridor vector (down and to the right)
    const lateralX = 1.15;
    const lateralY = 0.65;

    // Altitude vertical displacement
    const altitudeScale = 36;

    const dy = y - this.playerY; // Distance ahead of player
    const isoX = anchorX + (x * lateralX) + (dy * forwardX);
    const isoY = anchorY + (x * lateralY) - (dy * forwardY) - (z * altitudeScale);

    return { x: isoX, y: isoY };
  }

  /**
   * Returns screen position of ground shadow (altitude z = 0)
   */
  public worldToShadowScreen(x: number, y: number): { x: number; y: number } {
    return this.worldToScreen(x, y, 0);
  }
}
