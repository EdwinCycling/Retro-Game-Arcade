/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Arcadians - 60 FPS High-Speed Arcade Game Engine
 * Features 46-alien formation, swooping bezier dive physics,
 * escort flight patterns, accurate scoring and all wave levels.
 */

import {
  Alien,
  AlienBullet,
  AlienType,
  ArcadiansGameState,
  Bullet,
  FloatingText,
  Particle,
  PlayerShip,
  Star,
  WaveConfig,
} from './arcadiansTypes';
import { CANVAS_HEIGHT, CANVAS_WIDTH, getWaveConfig } from './arcadiansWaves';
import { arcadiansAudio } from './arcadiansAudio';

export class ArcadiansEngine {
  public gameState: ArcadiansGameState = 'TITLE';
  public score: number = 0;
  public highScore: number = 32450;
  public waveNumber: number = 1;
  public lives: number = 3;
  public speedMultiplier: number = 1.0; // 1.0 = BBC 60FPS, 1.25 = Turbo, 1.5 = Hyper

  public player: PlayerShip = {
    x: CANVAS_WIDTH / 2,
    y: CANVAS_HEIGHT - 48,
    width: 28,
    height: 24,
    speed: 5.2,
    isAlive: true,
    respawnTimer: 0,
    invulnerableTimer: 0,
  };

  public bullet: Bullet = {
    x: 0,
    y: 0,
    width: 3,
    height: 14,
    speed: 10.5,
    active: false,
  };

  public aliens: Alien[] = [];
  public alienBullets: AlienBullet[] = [];
  public stars: Star[] = [];
  public particles: Particle[] = [];
  public floatingTexts: FloatingText[] = [];

  // Formation sway state
  public formationCenterX: number = CANVAS_WIDTH / 2;
  public formationCenterY: number = 175;
  private formationDirection: number = 1;
  private formationTimer: number = 0;

  // Dive scheduler
  private lastDiveTime: number = 0;
  private waveConfig: WaveConfig = getWaveConfig(1);
  private waveClearTimer: number = 0;
  private deathTimer: number = 0;
  private nextTextId: number = 1;

  // Input states
  public keys = {
    left: false,
    right: false,
    fire: false,
  };

  constructor(initialWave: number = 1, currentHighScore: number = 32450) {
    this.waveNumber = initialWave;
    this.highScore = currentHighScore;
    this.initStars();
    this.initFormation(initialWave);
  }

  /**
   * Initializes the multi-colored parallax starfield (BBC Micro Mode 2)
   */
  private initStars() {
    this.stars = [];
    const colors = ['#ffffff', '#00ffff', '#ffff00', '#ff0055', '#00ff66', '#ff00ff'];
    for (let i = 0; i < 70; i++) {
      this.stars.push({
        x: Math.random() * CANVAS_WIDTH,
        y: Math.random() * CANVAS_HEIGHT,
        speed: 0.6 + Math.random() * 2.2,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() > 0.8 ? 2 : 1,
        twinkleTimer: Math.random() * 100,
      });
    }
  }

  /**
   * Builds the authentic 46-alien formation:
   * Row 0: 2 Flagships (Galboss)
   * Row 1: 6 Red Hornets
   * Row 2: 8 Purple Emissaries
   * Rows 3-5: 10 Green Drones each (30 total)
   */
  public initFormation(wave: number) {
    this.waveConfig = getWaveConfig(wave);
    this.aliens = [];
    let alienId = 1;

    const rowSpacing = 28;
    const colSpacing = 32;

    // Row 0: 2 Flagships (Galboss)
    const flagshipCols = [-0.5, 0.5];
    flagshipCols.forEach((cOffset, idx) => {
      this.aliens.push(
        this.createAlien(
          alienId++,
          'FLAGSHIP',
          0,
          idx,
          cOffset * (colSpacing * 1.5),
          -rowSpacing * 2.5,
          60,
          150
        )
      );
    });

    // Row 1: 6 Red Hornets
    for (let col = -3; col <= 2; col++) {
      const offsetX = (col + 0.5) * colSpacing;
      this.aliens.push(
        this.createAlien(
          alienId++,
          'HORNET',
          1,
          col + 3,
          offsetX,
          -rowSpacing * 1.5,
          50,
          100
        )
      );
    }

    // Row 2: 8 Purple Emissaries
    for (let col = -4; col <= 3; col++) {
      const offsetX = (col + 0.5) * colSpacing;
      this.aliens.push(
        this.createAlien(
          alienId++,
          'EMISSARY',
          2,
          col + 4,
          offsetX,
          -rowSpacing * 0.5,
          40,
          80
        )
      );
    }

    // Rows 3, 4, 5: 10 Green Drones each
    for (let row = 3; row <= 5; row++) {
      for (let col = -5; col <= 4; col++) {
        const offsetX = (col + 0.5) * colSpacing;
        this.aliens.push(
          this.createAlien(
            alienId++,
            'DRONE',
            row,
            col + 5,
            offsetX,
            (row - 2.5) * rowSpacing,
            30,
            60
          )
        );
      }
    }
  }

  private createAlien(
    id: number,
    type: AlienType,
    row: number,
    col: number,
    formationOffsetX: number,
    formationOffsetY: number,
    points: number,
    divingPoints: number
  ): Alien {
    return {
      id,
      type,
      row,
      col,
      formationOffsetX,
      formationOffsetY,
      x: this.formationCenterX + formationOffsetX,
      y: this.formationCenterY + formationOffsetY,
      vx: 0,
      vy: 0,
      angle: 0,
      state: 'IN_FORMATION',
      animFrame: 0,
      animTimer: Math.random() * 30,
      pathProgress: 0,
      pathDuration: 120,
      startPoint: { x: 0, y: 0 },
      controlPoint1: { x: 0, y: 0 },
      controlPoint2: { x: 0, y: 0 },
      targetPoint: { x: 0, y: 0 },
      points,
      divingPoints,
    };
  }

  public startGame(startWave: number = 1) {
    this.score = 0;
    this.lives = 3;
    this.waveNumber = startWave;
    this.alienBullets = [];
    this.particles = [];
    this.floatingTexts = [];
    this.bullet.active = false;
    this.player.isAlive = true;
    this.player.x = CANVAS_WIDTH / 2;
    this.player.invulnerableTimer = 60;
    this.initFormation(startWave);
    this.gameState = 'PLAYING';
    arcadiansAudio.playWaveClear();
  }

  public jumpToWave(targetWave: number) {
    this.waveNumber = Math.max(1, targetWave);
    this.alienBullets = [];
    this.particles = [];
    this.bullet.active = false;
    this.initFormation(this.waveNumber);
    this.gameState = 'PLAYING';
    arcadiansAudio.playWaveClear();
  }

  /**
   * Main 60 FPS update tick
   */
  public update(dtScale: number = 1.0) {
    const effDt = dtScale * this.speedMultiplier;

    // Always animate starfield
    this.updateStars(effDt);

    // Particles & Floating points
    this.updateParticles(effDt);
    this.updateFloatingTexts(effDt);

    if (this.gameState === 'PLAYING') {
      this.updatePlayer(effDt);
      this.updateBullet(effDt);
      this.updateFormation(effDt);
      this.updateDivingAliens(effDt);
      this.updateAlienBullets(effDt);
      this.checkCollisions();
      this.checkWaveClear();
    } else if (this.gameState === 'WAVE_CLEAR') {
      this.waveClearTimer += effDt;
      if (this.waveClearTimer >= 90) {
        this.waveClearTimer = 0;
        this.waveNumber++;
        this.initFormation(this.waveNumber);
        this.gameState = 'PLAYING';
        arcadiansAudio.playWaveClear();
      }
    } else if (this.gameState === 'PLAYER_DYING') {
      this.deathTimer += effDt;
      this.updateFormation(effDt * 0.5);
      this.updateDivingAliens(effDt * 0.5);
      if (this.deathTimer >= 80) {
        this.deathTimer = 0;
        if (this.lives > 0) {
          this.player.isAlive = true;
          this.player.x = CANVAS_WIDTH / 2;
          this.player.invulnerableTimer = 90;
          this.bullet.active = false;
          this.alienBullets = [];
          this.gameState = 'PLAYING';
        } else {
          this.gameState = 'GAME_OVER';
          arcadiansAudio.playGameOver();
        }
      }
    }
  }

  private updateStars(dt: number) {
    const baseSpeed = this.waveConfig.starSpeed * 1.5 * dt;
    for (const star of this.stars) {
      star.y += star.speed * baseSpeed;
      if (star.y > CANVAS_HEIGHT) {
        star.y = 0;
        star.x = Math.random() * CANVAS_WIDTH;
      }
      star.twinkleTimer += dt;
    }
  }

  private updateParticles(dt: number) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life += dt;
      if (p.life >= p.maxLife) {
        this.particles.splice(i, 1);
      }
    }
  }

  private updateFloatingTexts(dt: number) {
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.y -= 0.6 * dt;
      ft.life += dt;
      if (ft.life >= ft.maxLife) {
        this.floatingTexts.splice(i, 1);
      }
    }
  }

  private updatePlayer(dt: number) {
    if (!this.player.isAlive) return;

    if (this.player.invulnerableTimer > 0) {
      this.player.invulnerableTimer -= dt;
    }

    const moveSpeed = this.player.speed * dt;
    if (this.keys.left) {
      this.player.x = Math.max(this.player.width / 2 + 10, this.player.x - moveSpeed);
    }
    if (this.keys.right) {
      this.player.x = Math.min(CANVAS_WIDTH - this.player.width / 2 - 10, this.player.x + moveSpeed);
    }

    // Fire laser: authentic Arcadians single shot on screen
    if (this.keys.fire && !this.bullet.active) {
      this.bullet.active = true;
      this.bullet.x = this.player.x;
      this.bullet.y = this.player.y - this.player.height / 2;
      arcadiansAudio.playLaser();
    }
  }

  private updateBullet(dt: number) {
    if (!this.bullet.active) return;
    this.bullet.y -= this.bullet.speed * dt;
    if (this.bullet.y < 20) {
      this.bullet.active = false;
    }
  }

  /**
   * Formation breathes and sways horizontally
   */
  private updateFormation(dt: number) {
    this.formationTimer += 0.03 * this.waveConfig.formationSwaySpeed * dt;
    const swayRange = this.waveConfig.formationSwayRange;
    this.formationCenterX = CANVAS_WIDTH / 2 + Math.sin(this.formationTimer) * swayRange;

    // Update positions of aliens still in formation
    for (const alien of this.aliens) {
      if (alien.state === 'IN_FORMATION') {
        alien.x = this.formationCenterX + alien.formationOffsetX;
        alien.y = this.formationCenterY + alien.formationOffsetY;
        alien.angle = 0;
      }
      // Animation frames
      alien.animTimer += dt;
      if (alien.animTimer >= 15) {
        alien.animTimer = 0;
        alien.animFrame = (alien.animFrame + 1) % 2;
      }
    }

    // Schedule dives
    const now = Date.now();
    const divingCount = this.aliens.filter((a) => a.state === 'DIVING').length;
    if (
      divingCount < this.waveConfig.maxSimultaneousDivers &&
      now - this.lastDiveTime > this.waveConfig.diveIntervalMs / this.speedMultiplier
    ) {
      this.triggerDive();
      this.lastDiveTime = now;
    }
  }

  /**
   * Triggers swooping alien dives, including flagship attack runs with escorts!
   */
  private triggerDive() {
    const formationAliens = this.aliens.filter((a) => a.state === 'IN_FORMATION');
    if (formationAliens.length === 0) return;

    // Check if Flagship can initiate an attack run with Red Hornet escorts
    const flagships = formationAliens.filter((a) => a.type === 'FLAGSHIP');
    const hornets = formationAliens.filter((a) => a.type === 'HORNET');

    if (flagships.length > 0 && Math.random() < this.waveConfig.escortProbability) {
      const leader = flagships[Math.floor(Math.random() * flagships.length)];
      this.startAlienDive(leader, true);
      arcadiansAudio.playFlagshipDive();

      // Flank with up to 2 hornets
      const availableHornets = hornets.slice(0, 2);
      availableHornets.forEach((h, idx) => {
        const offsetDirection = idx === 0 ? -28 : 28;
        this.startAlienDive(h, false, leader.id, offsetDirection, -18);
      });
      return;
    }

    // Otherwise choose a random formation alien to swoop
    const diver = formationAliens[Math.floor(Math.random() * formationAliens.length)];
    this.startAlienDive(diver, false);
    arcadiansAudio.playDiveSwoop();
  }

  private startAlienDive(
    alien: Alien,
    isFlagshipLeader: boolean = false,
    leaderId?: number,
    escortOffsetX?: number,
    escortOffsetY?: number
  ) {
    alien.state = 'DIVING';
    alien.pathProgress = 0;
    alien.startPoint = { x: alien.x, y: alien.y };

    alien.hasEscort = isFlagshipLeader;
    alien.escortLeaderId = leaderId;
    alien.escortOffsetX = escortOffsetX || 0;
    alien.escortOffsetY = escortOffsetY || 0;

    // Target the player's general vicinity
    const targetX = leaderId
      ? this.player.x + (escortOffsetX || 0)
      : this.player.x + (Math.random() * 80 - 40);
    const targetY = CANVAS_HEIGHT + 60;
    alien.targetPoint = { x: targetX, y: targetY };

    // Bezier control points for swooping arc
    const sweepSign = alien.x < CANVAS_WIDTH / 2 ? 1 : -1;
    alien.controlPoint1 = {
      x: alien.x + sweepSign * (80 + Math.random() * 60),
      y: alien.y + 100 + Math.random() * 50,
    };
    alien.controlPoint2 = {
      x: targetX - sweepSign * (100 + Math.random() * 80),
      y: CANVAS_HEIGHT - 180 + Math.random() * 80,
    };

    // Duration based on dive speed
    alien.pathDuration = Math.max(70, Math.floor(160 / (this.waveConfig.alienDiveSpeed * 0.35)));
  }

  /**
   * Updates diving aliens along cubic Bezier curves with banking angles
   */
  private updateDivingAliens(dt: number) {
    for (const alien of this.aliens) {
      if (alien.state !== 'DIVING') continue;

      alien.pathProgress += (1 / alien.pathDuration) * dt * (this.waveConfig.alienDiveSpeed * 0.45);

      if (alien.pathProgress >= 1.0) {
        // Reached bottom: wrap around to top and return to formation
        alien.y = -30;
        alien.x = this.formationCenterX + alien.formationOffsetX;
        alien.state = 'IN_FORMATION';
        alien.angle = 0;
        alien.hasEscort = false;
        alien.escortLeaderId = undefined;
        continue;
      }

      const t = alien.pathProgress;
      const prevX = alien.x;
      const prevY = alien.y;

      // Cubic Bezier calculation: B(t) = (1-t)^3 P0 + 3(1-t)^2 t P1 + 3(1-t) t^2 P2 + t^3 P3
      const oneMinusT = 1 - t;
      const term0 = Math.pow(oneMinusT, 3);
      const term1 = 3 * Math.pow(oneMinusT, 2) * t;
      const term2 = 3 * oneMinusT * Math.pow(t, 2);
      const term3 = Math.pow(t, 3);

      alien.x =
        term0 * alien.startPoint.x +
        term1 * alien.controlPoint1.x +
        term2 * alien.controlPoint2.x +
        term3 * alien.targetPoint.x;

      alien.y =
        term0 * alien.startPoint.y +
        term1 * alien.controlPoint1.y +
        term2 * alien.controlPoint2.y +
        term3 * alien.targetPoint.y;

      // Calculate directional flight angle for sprite tilt
      const dx = alien.x - prevX;
      const dy = alien.y - prevY;
      if (Math.abs(dx) > 0.01 || Math.abs(dy) > 0.01) {
        alien.angle = Math.atan2(dy, dx) - Math.PI / 2;
      }

      // Diving alien dropping bullets towards player
      if (
        alien.y > 100 &&
        alien.y < CANVAS_HEIGHT - 120 &&
        Math.random() < (this.waveConfig.bulletFireChance * 0.035 * dt)
      ) {
        this.fireAlienBullet(alien.x, alien.y);
      }
    }
  }

  private fireAlienBullet(x: number, y: number) {
    if (this.alienBullets.length >= 8) return;
    const dx = this.player.x - x;
    const dy = this.player.y - y;
    const dist = Math.hypot(dx, dy) || 1;
    const speed = this.waveConfig.alienBulletSpeed;

    this.alienBullets.push({
      x,
      y: y + 10,
      vx: (dx / dist) * (speed * 0.4),
      vy: (dy / dist) * speed,
      width: 3,
      height: 9,
      active: true,
    });
  }

  private updateAlienBullets(dt: number) {
    for (let i = this.alienBullets.length - 1; i >= 0; i--) {
      const b = this.alienBullets[i];
      b.x += b.vx * dt;
      b.y += b.vy * dt;
      if (b.y > CANVAS_HEIGHT || b.x < 0 || b.x > CANVAS_WIDTH) {
        this.alienBullets.splice(i, 1);
      }
    }
  }

  /**
   * Collision Detection: Laser vs Aliens, Alien vs Player, Bullet vs Player
   */
  private checkCollisions() {
    // 1. Player laser vs Aliens
    if (this.bullet.active) {
      for (let i = this.aliens.length - 1; i >= 0; i--) {
        const alien = this.aliens[i];
        if (alien.state === 'DESTROYED') continue;

        const hitDist = alien.type === 'FLAGSHIP' ? 18 : 14;
        if (
          Math.abs(this.bullet.x - alien.x) < hitDist &&
          Math.abs(this.bullet.y - alien.y) < hitDist
        ) {
          // Hit alien!
          this.bullet.active = false;
          this.destroyAlien(alien, i);
          break;
        }
      }
    }

    // 2. Player vs Diving Alien / Alien Bullets
    if (this.player.isAlive && this.player.invulnerableTimer <= 0) {
      // Alien bullets vs player
      for (let i = this.alienBullets.length - 1; i >= 0; i--) {
        const b = this.alienBullets[i];
        if (
          Math.abs(b.x - this.player.x) < 14 &&
          Math.abs(b.y - this.player.y) < 14
        ) {
          this.alienBullets.splice(i, 1);
          this.destroyPlayer();
          return;
        }
      }

      // Diving alien collision with player ship
      for (const alien of this.aliens) {
        if (alien.state === 'DIVING') {
          if (
            Math.abs(alien.x - this.player.x) < 18 &&
            Math.abs(alien.y - this.player.y) < 18
          ) {
            this.destroyPlayer();
            return;
          }
        }
      }
    }
  }

  private destroyAlien(alien: Alien, index: number) {
    let earnedPoints = alien.state === 'DIVING' ? alien.divingPoints : alien.points;

    // Special bonus: Flagship destroyed while diving with escorts!
    if (alien.type === 'FLAGSHIP' && alien.state === 'DIVING') {
      const divingEscorts = this.aliens.filter(
        (a) => a.escortLeaderId === alien.id && a.state === 'DIVING'
      );
      if (divingEscorts.length >= 2) {
        earnedPoints = 800; // Historic 800 pts for flagship + 2 escorts
      } else if (divingEscorts.length === 1) {
        earnedPoints = 300; // Historic 300 pts
      }
    }

    // Apply wave multiplier
    const totalAward = Math.round(earnedPoints * this.waveConfig.scoreMultiplier);
    this.score += totalAward;
    if (this.score > this.highScore) {
      this.highScore = this.score;
    }

    // Floating text feedback
    this.floatingTexts.push({
      id: this.nextTextId++,
      text: `+${totalAward}`,
      x: alien.x,
      y: alien.y - 12,
      color: alien.type === 'FLAGSHIP' ? '#ffff00' : '#00ffff',
      life: 0,
      maxLife: 45,
    });

    // Particle explosion
    this.createExplosion(
      alien.x,
      alien.y,
      alien.type === 'FLAGSHIP' ? '#ffff00' : alien.type === 'HORNET' ? '#ff0055' : '#00ff66'
    );

    arcadiansAudio.playAlienExplosion(alien.type === 'FLAGSHIP');

    // Remove alien
    this.aliens.splice(index, 1);
  }

  private destroyPlayer() {
    this.player.isAlive = false;
    this.lives--;
    this.createExplosion(this.player.x, this.player.y, '#ffffff', 32);
    arcadiansAudio.playPlayerExplosion();
    this.gameState = 'PLAYER_DYING';
    this.deathTimer = 0;
  }

  private createExplosion(x: number, y: number, primaryColor: string, count: number = 18) {
    const colors = [primaryColor, '#ff0055', '#ffff00', '#ffffff', '#00ffff'];
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.2 + Math.random() * 4.2;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 1.5 + Math.random() * 2.5,
        life: 0,
        maxLife: 20 + Math.random() * 25,
      });
    }
  }

  private checkWaveClear() {
    if (this.aliens.length === 0 && this.gameState === 'PLAYING') {
      this.gameState = 'WAVE_CLEAR';
      this.waveClearTimer = 0;
      arcadiansAudio.playWaveClear();
    }
  }
}
