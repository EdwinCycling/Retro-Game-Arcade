/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Atari Asteroids (1979) Core Physics & Simulation Engine
 */

import { asteroidsAudio } from './asteroidsAudio';

export type AsteroidSize = 'large' | 'medium' | 'small';

export interface Point {
  x: number;
  y: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  length: number;
  angle: number;
}

export interface Bullet {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number; // remaining frames/time
  isSaucerBullet: boolean;
}

export interface Asteroid {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  size: AsteroidSize;
  angle: number;
  rotSpeed: number;
  vertices: Point[]; // Relative offsets from center
}

export interface Saucer {
  x: number;
  y: number;
  vx: number;
  vy: number;
  isSmall: boolean;
  shootTimer: number;
  changeDirTimer: number;
}

export interface Ship {
  x: number;
  y: number;
  vx: number;
  vy: number;
  angle: number; // radians, 0 pointing UP
  rotSpeed: number;
  isThrusting: boolean;
  isRespawning: boolean;
  respawnTimer: number;
  invulnerableTimer: number;
  isDead: boolean;
}

export interface AsteroidsGameSettings {
  phosphorColor: 'white' | 'green' | 'amber' | 'cyan';
  beamGlowIntensity: number; // 0.5 - 2.0
  vectorTrails: boolean;
  shieldsActive: boolean;
  safeHyperspace: boolean;
  autoAim: boolean;
  slowMotion: boolean;
}

export class AsteroidsEngine {
  public width: number = 800;
  public height: number = 600;

  public ship: Ship = {
    x: 400,
    y: 300,
    vx: 0,
    vy: 0,
    angle: -Math.PI / 2, // Facing UP
    rotSpeed: 0,
    isThrusting: false,
    isRespawning: false,
    respawnTimer: 0,
    invulnerableTimer: 180, // 3 seconds at 60fps
    isDead: false,
  };

  public asteroids: Asteroid[] = [];
  public bullets: Bullet[] = [];
  public particles: Particle[] = [];
  public saucer: Saucer | null = null;

  public score: number = 0;
  public highScore: number = 0;
  public lives: number = 3;
  public wave: number = 1;
  public isGameOver: boolean = false;
  public isPaused: boolean = false;
  public isAttractMode: boolean = false;

  private saucerSpawnTimer: number = 600; // ~10s
  private nextLifeScore: number = 10000;
  private asteroidIdCounter: number = 1;

  // Input states
  public keys = {
    left: false,
    right: false,
    thrust: false,
    fire: false,
    hyperspace: false,
  };

  public settings: AsteroidsGameSettings = {
    phosphorColor: 'white',
    beamGlowIntensity: 1.2,
    vectorTrails: true,
    shieldsActive: false,
    safeHyperspace: false,
    autoAim: false,
    slowMotion: false,
  };

  constructor(w = 800, h = 600) {
    this.width = w;
    this.height = h;
  }

  public initNewGame() {
    this.score = 0;
    this.lives = 3;
    this.wave = 1;
    this.isGameOver = false;
    this.isPaused = false;
    this.isAttractMode = false;
    this.nextLifeScore = 10000;
    this.bullets = [];
    this.particles = [];
    this.saucer = null;
    this.saucerSpawnTimer = 600;

    this.resetShip(true);
    this.spawnWave(this.wave);
  }

  public resetShip(hard: boolean = false) {
    this.ship = {
      x: this.width / 2,
      y: this.height / 2,
      vx: 0,
      vy: 0,
      angle: -Math.PI / 2,
      rotSpeed: 0,
      isThrusting: false,
      isRespawning: false,
      respawnTimer: 0,
      invulnerableTimer: 180,
      isDead: false,
    };
    if (hard) {
      this.bullets = [];
    }
  }

  public spawnWave(waveNum: number) {
    this.asteroids = [];
    const count = Math.min(4 + (waveNum - 1) * 2, 12);
    for (let i = 0; i < count; i++) {
      // Spawn away from ship center
      let x = Math.random() * this.width;
      let y = Math.random() * this.height;
      const distFromCenter = Math.hypot(x - this.width / 2, y - this.height / 2);
      if (distFromCenter < 140) {
        if (Math.random() < 0.5) {
          x = (x < this.width / 2 ? 60 : this.width - 60);
        } else {
          y = (y < this.height / 2 ? 60 : this.height - 60);
        }
      }
      this.asteroids.push(this.createAsteroid(x, y, 'large'));
    }
    this.updateHeartbeatAudio();
  }

  private createAsteroid(x: number, y: number, size: AsteroidSize): Asteroid {
    const baseRadius = size === 'large' ? 38 : size === 'medium' ? 22 : 11;
    const speed = size === 'large' ? 0.8 + Math.random() * 0.8 : size === 'medium' ? 1.4 + Math.random() * 1.0 : 2.0 + Math.random() * 1.5;
    const dir = Math.random() * Math.PI * 2;

    // Generate irregular asteroid polygon vertices
    const numVerts = 10 + Math.floor(Math.random() * 4);
    const vertices: Point[] = [];
    for (let i = 0; i < numVerts; i++) {
      const angle = (i / numVerts) * Math.PI * 2;
      const r = baseRadius * (0.75 + Math.random() * 0.5);
      vertices.push({
        x: Math.cos(angle) * r,
        y: Math.sin(angle) * r,
      });
    }

    return {
      id: this.asteroidIdCounter++,
      x,
      y,
      vx: Math.cos(dir) * speed,
      vy: Math.sin(dir) * speed,
      radius: baseRadius,
      size,
      angle: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.04,
      vertices,
    };
  }

  // Toroidal screen wrap-around
  private wrap(entity: { x: number; y: number; radius?: number }) {
    const r = entity.radius || 10;
    if (entity.x < -r) entity.x = this.width + r;
    else if (entity.x > this.width + r) entity.x = -r;

    if (entity.y < -r) entity.y = this.height + r;
    else if (entity.y > this.height + r) entity.y = -r;
  }

  public fireBullet() {
    if (this.ship.isDead || this.ship.isRespawning) return;
    // Classic Asteroids limit: maximum 4 simultaneous player bullets
    const playerBullets = this.bullets.filter(b => !b.isSaucerBullet);
    if (playerBullets.length >= 4) return;

    let targetAngle = this.ship.angle;

    // Auto-Aim assistance if enabled
    if (this.settings.autoAim && this.asteroids.length > 0) {
      let nearestDist = 999999;
      let bestAngle = targetAngle;
      for (const ast of this.asteroids) {
        const dx = ast.x - this.ship.x;
        const dy = ast.y - this.ship.y;
        const dist = Math.hypot(dx, dy);
        const ang = Math.atan2(dy, dx);
        const angleDiff = Math.abs(this.normalizeAngle(ang - this.ship.angle));
        if (angleDiff < 0.6 && dist < nearestDist) {
          nearestDist = dist;
          bestAngle = ang;
        }
      }
      targetAngle = bestAngle;
    }

    const noseX = this.ship.x + Math.cos(targetAngle) * 16;
    const noseY = this.ship.y + Math.sin(targetAngle) * 16;
    const bulletSpeed = 9.5;

    this.bullets.push({
      x: noseX,
      y: noseY,
      vx: this.ship.vx * 0.4 + Math.cos(targetAngle) * bulletSpeed,
      vy: this.ship.vy * 0.4 + Math.sin(targetAngle) * bulletSpeed,
      life: 65, // ~1.1 seconds
      isSaucerBullet: false,
    });

    asteroidsAudio.playFire();
  }

  private normalizeAngle(rad: number): number {
    while (rad > Math.PI) rad -= Math.PI * 2;
    while (rad < -Math.PI) rad += Math.PI * 2;
    return rad;
  }

  public triggerHyperspace() {
    if (this.ship.isDead || this.ship.isRespawning) return;

    asteroidsAudio.playHyperspace();

    // Check chance of self-destruction (1/6 unless safe hyperspace is toggled on)
    if (!this.settings.safeHyperspace && !this.settings.shieldsActive && Math.random() < 0.166) {
      this.killShip();
      return;
    }

    // Teleport to random spot
    this.ship.x = Math.random() * (this.width - 100) + 50;
    this.ship.y = Math.random() * (this.height - 100) + 50;
    this.ship.vx = 0;
    this.ship.vy = 0;
    this.ship.invulnerableTimer = 60; // 1s safety window

    // Spawn warp particle ring
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2;
      this.particles.push({
        x: this.ship.x,
        y: this.ship.y,
        vx: Math.cos(a) * 3,
        vy: Math.sin(a) * 3,
        life: 25,
        maxLife: 25,
        length: 8,
        angle: a,
      });
    }
  }

  public spawnSaucer() {
    if (this.saucer) return;
    const isSmall = this.score > 25000 || Math.random() < (this.wave * 0.12);
    const side = Math.random() < 0.5 ? -20 : this.width + 20;
    const y = Math.random() * (this.height - 160) + 80;
    const speed = isSmall ? 2.8 : 1.8;
    const vx = side < 0 ? speed : -speed;

    this.saucer = {
      x: side,
      y,
      vx,
      vy: (Math.random() - 0.5) * 1.2,
      isSmall,
      shootTimer: isSmall ? 70 : 110,
      changeDirTimer: 120,
    };

    asteroidsAudio.startSaucerSound(isSmall);
  }

  private updateSaucer() {
    if (!this.saucer) {
      this.saucerSpawnTimer--;
      if (this.saucerSpawnTimer <= 0) {
        this.spawnSaucer();
        this.saucerSpawnTimer = 900 + Math.random() * 600;
      }
      return;
    }

    // Movement
    this.saucer.x += this.saucer.vx;
    this.saucer.y += this.saucer.vy;

    // Change vertical drift
    this.saucer.changeDirTimer--;
    if (this.saucer.changeDirTimer <= 0) {
      this.saucer.vy = (Math.random() - 0.5) * 1.5;
      this.saucer.changeDirTimer = 80 + Math.random() * 100;
    }

    // Wrap Y, despawn if exited X
    if (this.saucer.y < 0) this.saucer.y = this.height;
    if (this.saucer.y > this.height) this.saucer.y = 0;

    if ((this.saucer.vx > 0 && this.saucer.x > this.width + 40) ||
        (this.saucer.vx < 0 && this.saucer.x < -40)) {
      asteroidsAudio.stopSaucerSound();
      this.saucer = null;
      return;
    }

    // Saucer Shooting
    this.saucer.shootTimer--;
    if (this.saucer.shootTimer <= 0) {
      let shootAngle: number;
      if (this.saucer.isSmall && !this.ship.isDead) {
        // Predictive lead aiming towards ship
        const dx = this.ship.x - this.saucer.x;
        const dy = this.ship.y - this.saucer.y;
        shootAngle = Math.atan2(dy, dx) + (Math.random() - 0.5) * 0.3; // small sniper spread
      } else {
        // Random inaccurate firing
        shootAngle = Math.random() * Math.PI * 2;
      }

      this.bullets.push({
        x: this.saucer.x,
        y: this.saucer.y,
        vx: Math.cos(shootAngle) * 5.5,
        vy: Math.sin(shootAngle) * 5.5,
        life: 75,
        isSaucerBullet: true,
      });

      asteroidsAudio.playFire();
      this.saucer.shootTimer = this.saucer.isSmall ? 65 + Math.random() * 30 : 100 + Math.random() * 60;
    }
  }

  public killShip() {
    if (this.ship.isDead || this.ship.isRespawning) return;
    if (this.settings.shieldsActive) return;

    this.ship.isDead = true;
    asteroidsAudio.stopThrust();
    asteroidsAudio.playExplosion('ship');

    // Create ship debris shards
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2 + Math.random() * 0.5;
      const spd = 1.5 + Math.random() * 3.5;
      this.particles.push({
        x: this.ship.x,
        y: this.ship.y,
        vx: Math.cos(a) * spd,
        vy: Math.sin(a) * spd,
        life: 70,
        maxLife: 70,
        length: 12 + Math.random() * 8,
        angle: a,
      });
    }

    this.lives--;
    if (this.lives <= 0) {
      this.isGameOver = true;
      asteroidsAudio.stopHeartbeat();
      asteroidsAudio.stopSaucerSound();
    } else {
      this.ship.isRespawning = true;
      this.ship.respawnTimer = 120; // 2 seconds delay
    }
  }

  private splitAsteroid(ast: Asteroid, bulletVx: number, bulletVy: number) {
    asteroidsAudio.playExplosion(ast.size);

    // Add score
    if (ast.size === 'large') this.score += 20;
    else if (ast.size === 'medium') this.score += 50;
    else if (ast.size === 'small') this.score += 100;

    this.checkBonusLife();

    // Spawn explosion vector shards
    const particleCount = ast.size === 'large' ? 14 : ast.size === 'medium' ? 9 : 5;
    for (let i = 0; i < particleCount; i++) {
      const a = Math.random() * Math.PI * 2;
      const spd = 0.5 + Math.random() * 2.8;
      this.particles.push({
        x: ast.x,
        y: ast.y,
        vx: Math.cos(a) * spd,
        vy: Math.sin(a) * spd,
        life: 30 + Math.random() * 20,
        maxLife: 50,
        length: 6 + Math.random() * 6,
        angle: a,
      });
    }

    // Split logic
    if (ast.size === 'large') {
      this.asteroids.push(this.createAsteroid(ast.x, ast.y, 'medium'));
      this.asteroids.push(this.createAsteroid(ast.x, ast.y, 'medium'));
    } else if (ast.size === 'medium') {
      this.asteroids.push(this.createAsteroid(ast.x, ast.y, 'small'));
      this.asteroids.push(this.createAsteroid(ast.x, ast.y, 'small'));
    }

    // Remove original asteroid
    this.asteroids = this.asteroids.filter(a => a.id !== ast.id);
    this.updateHeartbeatAudio();

    // Check if wave is cleared
    if (this.asteroids.length === 0) {
      this.wave++;
      this.spawnWave(this.wave);
    }
  }

  private checkBonusLife() {
    if (this.score >= this.nextLifeScore) {
      this.lives++;
      this.nextLifeScore += 10000;
      asteroidsAudio.playExtraLife();
    }
    if (this.score > this.highScore) {
      this.highScore = this.score;
    }
  }

  private updateHeartbeatAudio() {
    const totalRocks = Math.max(4, this.wave * 4);
    asteroidsAudio.setHeartbeatRate(this.asteroids.length, totalRocks);
  }

  public update() {
    if (this.isPaused || this.isGameOver) return;

    const timeScale = this.settings.slowMotion ? 0.5 : 1.0;

    // 1. Update Ship
    if (!this.ship.isDead && !this.ship.isRespawning) {
      // Rotation
      const ROT_SPEED = 0.08 * timeScale;
      if (this.keys.left) this.ship.angle -= ROT_SPEED;
      if (this.keys.right) this.ship.angle += ROT_SPEED;

      // Thrust Physics (Newtonian acceleration with minimal space drag)
      if (this.keys.thrust) {
        const THRUST_POWER = 0.16 * timeScale;
        this.ship.vx += Math.cos(this.ship.angle) * THRUST_POWER;
        this.ship.vy += Math.sin(this.ship.angle) * THRUST_POWER;
        this.ship.isThrusting = true;
        asteroidsAudio.startThrust();

        // Rocket exhaust vector spark
        if (Math.random() < 0.7) {
          const rearAngle = this.ship.angle + Math.PI + (Math.random() - 0.5) * 0.6;
          const rearX = this.ship.x - Math.cos(this.ship.angle) * 12;
          const rearY = this.ship.y - Math.sin(this.ship.angle) * 12;
          this.particles.push({
            x: rearX,
            y: rearY,
            vx: Math.cos(rearAngle) * (2 + Math.random() * 2) + this.ship.vx * 0.2,
            vy: Math.sin(rearAngle) * (2 + Math.random() * 2) + this.ship.vy * 0.2,
            life: 12,
            maxLife: 12,
            length: 4,
            angle: rearAngle,
          });
        }
      } else {
        this.ship.isThrusting = false;
        asteroidsAudio.stopThrust();
      }

      // Space Friction (very slight damping)
      this.ship.vx *= 0.99;
      this.ship.vy *= 0.99;

      // Speed clamp
      const speed = Math.hypot(this.ship.vx, this.ship.vy);
      const MAX_SPEED = 8.0;
      if (speed > MAX_SPEED) {
        this.ship.vx = (this.ship.vx / speed) * MAX_SPEED;
        this.ship.vy = (this.ship.vy / speed) * MAX_SPEED;
      }

      this.ship.x += this.ship.vx * timeScale;
      this.ship.y += this.ship.vy * timeScale;
      this.wrap(this.ship);

      if (this.ship.invulnerableTimer > 0) {
        this.ship.invulnerableTimer -= timeScale;
      }
    } else if (this.ship.isRespawning) {
      this.ship.respawnTimer -= timeScale;
      if (this.ship.respawnTimer <= 0) {
        // Ensure center is safe from big asteroids before spawning
        const centerThreat = this.asteroids.some(a => Math.hypot(a.x - this.width / 2, a.y - this.height / 2) < a.radius + 50);
        if (!centerThreat || this.ship.respawnTimer < -120) {
          this.resetShip(false);
        }
      }
    }

    // 2. Update Asteroids
    for (const ast of this.asteroids) {
      ast.x += ast.vx * timeScale;
      ast.y += ast.vy * timeScale;
      ast.angle += ast.rotSpeed * timeScale;
      this.wrap(ast);
    }

    // 3. Update Saucer
    this.updateSaucer();

    // 4. Update Bullets
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const b = this.bullets[i];
      b.x += b.vx * timeScale;
      b.y += b.vy * timeScale;
      b.life -= timeScale;
      this.wrap(b);

      if (b.life <= 0) {
        this.bullets.splice(i, 1);
        continue;
      }

      // Check Bullet Collision with Asteroids
      let bulletHit = false;
      for (const ast of this.asteroids) {
        if (Math.hypot(b.x - ast.x, b.y - ast.y) < ast.radius) {
          this.splitAsteroid(ast, b.vx, b.vy);
          bulletHit = true;
          break;
        }
      }

      if (bulletHit) {
        this.bullets.splice(i, 1);
        continue;
      }

      // Check Bullet Collision with Saucer
      if (!b.isSaucerBullet && this.saucer) {
        const saucerRadius = this.saucer.isSmall ? 12 : 20;
        if (Math.hypot(b.x - this.saucer.x, b.y - this.saucer.y) < saucerRadius) {
          asteroidsAudio.playExplosion(this.saucer.isSmall ? 'small' : 'large');
          this.score += this.saucer.isSmall ? 1000 : 200;
          this.checkBonusLife();

          // Explosion shards
          for (let p = 0; p < 12; p++) {
            const a = Math.random() * Math.PI * 2;
            this.particles.push({
              x: this.saucer.x,
              y: this.saucer.y,
              vx: Math.cos(a) * (1 + Math.random() * 3),
              vy: Math.sin(a) * (1 + Math.random() * 3),
              life: 40,
              maxLife: 40,
              length: 8,
              angle: a,
            });
          }

          asteroidsAudio.stopSaucerSound();
          this.saucer = null;
          this.bullets.splice(i, 1);
          continue;
        }
      }

      // Check Saucer Bullet Collision with Player Ship
      if (b.isSaucerBullet && !this.ship.isDead && !this.ship.isRespawning && this.ship.invulnerableTimer <= 0) {
        if (Math.hypot(b.x - this.ship.x, b.y - this.ship.y) < 12) {
          this.killShip();
          this.bullets.splice(i, 1);
          continue;
        }
      }
    }

    // 5. Check Ship Collision with Asteroids & Saucer
    if (!this.ship.isDead && !this.ship.isRespawning && this.ship.invulnerableTimer <= 0 && !this.settings.shieldsActive) {
      for (const ast of this.asteroids) {
        if (Math.hypot(this.ship.x - ast.x, this.ship.y - ast.y) < ast.radius + 8) {
          this.killShip();
          this.splitAsteroid(ast, this.ship.vx, this.ship.vy);
          break;
        }
      }

      if (this.saucer && Math.hypot(this.ship.x - this.saucer.x, this.ship.y - this.saucer.y) < (this.saucer.isSmall ? 16 : 24)) {
        this.killShip();
        asteroidsAudio.stopSaucerSound();
        this.saucer = null;
      }
    }

    // 6. Update Particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * timeScale;
      p.y += p.vy * timeScale;
      p.life -= timeScale;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }
}
