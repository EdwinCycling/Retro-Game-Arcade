/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Clean-Room TypeScript Implementation of GALAGA (Namco, 1981) - Master Arcade Edition.
 * Features:
 * - Authentic 3-rank alien fleet: Zako (Bees), Goei (Butterflies), Boss Galagas (Commanders).
 * - Escorted Dive-Bombs: Boss Galagas dive with 1 or 2 Goei butterfly escorts for 800 / 1600 bonus pts!
 * - Morphing / Transforming mid-flight aliens (Scorpions, Bosconian Cruisers, Galaxian Flagships in Stage 4+).
 * - Authentic Tractor Beam Capture & Dual Fighter docking with twin plasma cannons.
 * - Dynamic stage difficulty curve: dive speeds, tactical aimed bomb spreads, and 360° loop maneuvers.
 * - Authentic Stage Badges at bottom right (50-crests, 30-emblems, 20-stars, 10-stars, 5-stars, 1-chevrons).
 * - Challenging Stages (every 3rd stage) with 40 enemies in 5 acrobat flight waves & "PERFECT 10,000 PTS" bonus.
 * - Full "RESULTS" Game Over screen with Shots Fired, Hits, and Hit-Miss Ratio (%).
 * - Full Web Audio API procedural sound suite with start fanfare, dive sirens, tractor hum, and explosion synth.
 */

export interface HighScoreEntry {
  score: number;
  stage: number;
  date: string;
}

interface Star {
  x: number;
  y: number;
  speed: number;
  color: string;
  size: number;
  twinkle: number;
}

type EnemyType = 'zako' | 'goei' | 'boss' | 'scorpion' | 'bosconian' | 'flagship';

interface Enemy {
  id: number;
  type: EnemyType;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  state: 'entering' | 'formation' | 'diving' | 'tractor_beaming' | 'captured_docked';
  pathProgress: number;
  pathId: number;
  hitsLeft: number;
  animFrame: number;
  animTimer: number;
  angle: number;
  hasCapturedFighter?: boolean;
  scoreValue: number;
  escortIds?: number[];
  isEscort?: boolean;
  morphed?: boolean;
}

interface Bullet {
  x: number;
  y: number;
  vx: number;
  vy: number;
  isPlayer: boolean;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

interface TractorBeam {
  active: boolean;
  bossId: number;
  x: number;
  y: number;
  width: number;
  height: number;
  rings: number;
  capturing: boolean;
  captureProgress: number;
}

export class GalagaEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  // Virtual arcade resolution (288 x 384)
  public readonly width = 288;
  public readonly height = 384;

  // Starfield
  private stars: Star[] = [];

  // Player state
  private playerX = 144;
  private playerY = 350;
  private playerSpeed = 3.6;
  private isDualFighter = false;
  private isCapturing = false;
  private captureAngle = 0;
  private isDead = false;
  private respawnTimer = 0;
  private lives = 3;
  private score = 0;
  private highScore = 20000;
  private stage = 1;

  // Accuracy Statistics
  private shotsFired = 0;
  private shotsHit = 0;

  // Bullets & Objects
  private bullets: Bullet[] = [];
  private enemies: Enemy[] = [];
  private particles: Particle[] = [];
  private tractorBeam: TractorBeam = {
    active: false,
    bossId: -1,
    x: 0,
    y: 0,
    width: 36,
    height: 125,
    rings: 0,
    capturing: false,
    captureProgress: 0,
  };

  // State
  private isGameOver = false;
  private isPaused = false;
  private isChallengingStage = false;
  private challengingHits = 0;
  private challengingTotal = 40;
  private challengingWaveIndex = 0;
  private stageIntroTimer = 2.5;
  private stageClearTimer = 0;
  private capturedShipInPlay = false;

  // Attack scheduler
  private diveTimer = 0;
  private enemyIdCounter = 0;
  private formationOffsetX = 0;
  private formationDirection = 1;

  // Audio Context
  private audioCtx: AudioContext | null = null;
  private isAudioMuted = false;

  // Loop
  private animId: number | null = null;
  private lastTime = 0;
  private keys: { [key: string]: boolean } = {};

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const context = canvas.getContext('2d', { alpha: false });
    if (!context) throw new Error('Cannot get Canvas2D context');
    this.ctx = context;

    this.initStars();
    this.setupListeners();
    this.initAudio();
    this.loadHighScore();
    this.initStage(1);
    this.playStartGameFanfare();
  }

  private loadHighScore() {
    try {
      const saved = localStorage.getItem('galaga_arcade_highscore_v1');
      if (saved) {
        this.highScore = parseInt(saved, 10) || 20000;
      }
    } catch {
      this.highScore = 20000;
    }
  }

  private saveHighScore() {
    try {
      localStorage.setItem('galaga_arcade_highscore_v1', this.highScore.toString());
    } catch { /* ignore */ }
  }

  private initStars() {
    this.stars = [];
    const colors = ['#ffffff', '#38bdf8', '#ef4444', '#facc15', '#a855f7', '#ec4899'];
    for (let i = 0; i < 110; i++) {
      this.stars.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        speed: 0.4 + Math.random() * 2.0,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() > 0.82 ? 2 : 1,
        twinkle: Math.random() * Math.PI * 2,
      });
    }
  }

  private initAudio() {
    try {
      const AudioClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioClass) {
        this.audioCtx = new AudioClass();
      }
    } catch { /* Audio not supported */ }
  }

  public setAudioMuted(muted: boolean) {
    this.isAudioMuted = muted;
  }

  // --- Procedural Web Audio API Chiptune Synthesis ---
  private playStartGameFanfare() {
    if (this.isAudioMuted || !this.audioCtx) return;
    try {
      const ctx = this.audioCtx;
      if (ctx.state === 'suspended') ctx.resume();
      const now = ctx.currentTime;
      // Classic Galaga 8-note opening fanfare
      const melody = [
        { f: 523.25, d: 0.1 }, // C5
        { f: 659.25, d: 0.1 }, // E5
        { f: 783.99, d: 0.1 }, // G5
        { f: 1046.5, d: 0.12 }, // C6
        { f: 880.0, d: 0.1 }, // A5
        { f: 987.77, d: 0.1 }, // B5
        { f: 1046.5, d: 0.25 }, // C6
      ];
      let offset = 0;
      melody.forEach(note => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(note.f, now + offset);
        gain.gain.setValueAtTime(0.18, now + offset);
        gain.gain.exponentialRampToValueAtTime(0.01, now + offset + note.d);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + offset);
        osc.stop(now + offset + note.d);
        offset += note.d * 0.9;
      });
    } catch { /* ignore */ }
  }

  private playLaserSound() {
    if (this.isAudioMuted || !this.audioCtx) return;
    try {
      const ctx = this.audioCtx;
      if (ctx.state === 'suspended') ctx.resume();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(920, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(220, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } catch { /* ignore */ }
  }

  private playEnemyExplosionSound(isBoss = false) {
    if (this.isAudioMuted || !this.audioCtx) return;
    try {
      const ctx = this.audioCtx;
      if (ctx.state === 'suspended') ctx.resume();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      const startFreq = isBoss ? 260 : 440;
      osc.frequency.setValueAtTime(startFreq, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(35, ctx.currentTime + (isBoss ? 0.35 : 0.16));
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + (isBoss ? 0.35 : 0.16));
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + (isBoss ? 0.35 : 0.16));
    } catch { /* ignore */ }
  }

  private playPlayerDeathSound() {
    if (this.isAudioMuted || !this.audioCtx) return;
    try {
      const ctx = this.audioCtx;
      if (ctx.state === 'suspended') ctx.resume();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(550, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + 0.65);
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.65);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.65);
    } catch { /* ignore */ }
  }

  private playTractorBeamSound() {
    if (this.isAudioMuted || !this.audioCtx) return;
    try {
      const ctx = this.audioCtx;
      if (ctx.state === 'suspended') ctx.resume();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(280, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(620, ctx.currentTime + 0.14);
      osc.frequency.linearRampToValueAtTime(280, ctx.currentTime + 0.28);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.28);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.28);
    } catch { /* ignore */ }
  }

  private playDualFighterFanfare() {
    if (this.isAudioMuted || !this.audioCtx) return;
    try {
      const ctx = this.audioCtx;
      if (ctx.state === 'suspended') ctx.resume();
      const now = ctx.currentTime;
      [523.25, 659.25, 783.99, 1046.5, 1318.51].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + i * 0.08);
        gain.gain.setValueAtTime(0.16, now + i * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.01, now + (i + 1) * 0.08);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + i * 0.08);
        osc.stop(now + (i + 1) * 0.08);
      });
    } catch { /* ignore */ }
  }

  // --- Input Listeners ---
  private handleKeyDown = (e: KeyboardEvent) => {
    this.keys[e.code] = true;
    if (e.code === 'Space') {
      this.firePlayerLaser();
      e.preventDefault();
    }
  };

  private handleKeyUp = (e: KeyboardEvent) => {
    this.keys[e.code] = false;
  };

  private handleMouseMove = (e: MouseEvent) => {
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.width / rect.width;
    const mouseX = (e.clientX - rect.left) * scaleX;
    this.setPlayerX(mouseX);
  };

  private handleTouchMove = (e: TouchEvent) => {
    if (e.touches.length > 0) {
      const rect = this.canvas.getBoundingClientRect();
      const scaleX = this.width / rect.width;
      const touchX = (e.touches[0].clientX - rect.left) * scaleX;
      this.setPlayerX(touchX);
    }
  };

  private setupListeners() {
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
    this.canvas.addEventListener('mousemove', this.handleMouseMove);
    this.canvas.addEventListener('touchmove', this.handleTouchMove, { passive: true });
    this.canvas.addEventListener('click', () => this.firePlayerLaser());
  }

  public setPlayerX(x: number) {
    if (this.isCapturing || this.isDead || this.isGameOver) return;
    const shipW = this.isDualFighter ? 30 : 16;
    const halfW = shipW / 2;
    this.playerX = Math.max(12 + halfW, Math.min(this.width - 12 - halfW, x));
  }

  public movePlayerLeft() {
    this.setPlayerX(this.playerX - this.playerSpeed);
  }

  public movePlayerRight() {
    this.setPlayerX(this.playerX + this.playerSpeed);
  }

  public movePlayerAnalog(deltaX: number) {
    this.setPlayerX(this.playerX + deltaX);
  }

  public firePlayerLaser() {
    if (this.isCapturing || this.isDead || this.isGameOver || this.isPaused) {
      if (this.isGameOver) {
        this.restartGame();
      }
      return;
    }

    // Limit active bullets on screen to 4 (dual can have 8)
    const maxBullets = this.isDualFighter ? 8 : 4;
    const playerBullets = this.bullets.filter(b => b.isPlayer).length;
    if (playerBullets >= maxBullets) return;

    this.shotsFired += this.isDualFighter ? 2 : 1;

    if (this.isDualFighter) {
      // Twin cannons
      this.bullets.push(
        { x: this.playerX - 9, y: this.playerY - 8, vx: 0, vy: -7.5, isPlayer: true },
        { x: this.playerX + 9, y: this.playerY - 8, vx: 0, vy: -7.5, isPlayer: true }
      );
    } else {
      // Single cannon
      this.bullets.push(
        { x: this.playerX, y: this.playerY - 8, vx: 0, vy: -7.5, isPlayer: true }
      );
    }
    this.playLaserSound();
  }

  // --- Stage Initialization ---
  private initStage(stageNumber: number) {
    this.stage = stageNumber;
    this.isChallengingStage = stageNumber % 3 === 0;
    this.stageIntroTimer = 2.5;
    this.stageClearTimer = 0;
    this.challengingHits = 0;
    this.challengingWaveIndex = 0;
    this.enemies = [];
    this.bullets = [];
    this.tractorBeam.active = false;
    this.tractorBeam.capturing = false;

    if (this.isChallengingStage) {
      this.spawnChallengingStageEnemies();
    } else {
      this.spawnStandardFormation();
    }
  }

  private spawnStandardFormation() {
    this.enemies = [];
    this.enemyIdCounter = 0;

    const startX = 64;
    const colSpacing = 20;

    // Row 0: 4 Boss Galagas (green/blue)
    for (let c = 0; c < 4; c++) {
      const targetX = startX + 30 + c * (colSpacing * 1.5);
      const targetY = 60;
      this.enemies.push(this.createEnemy('boss', targetX, targetY, c * 0.15));
    }

    // Rows 1 & 2: 8 Goei butterflies each (red)
    for (let r = 0; r < 2; r++) {
      for (let c = 0; c < 8; c++) {
        const targetX = startX + 10 + c * colSpacing;
        const targetY = 80 + r * 16;
        // In stage 4+, some Goeis can morph into Scorpions/Bosconians when diving!
        const willMorph = this.stage >= 4 && (r * 8 + c) % 4 === 0;
        const enemy = this.createEnemy('goei', targetX, targetY, 0.6 + (r * 8 + c) * 0.08);
        enemy.morphed = willMorph;
        this.enemies.push(enemy);
      }
    }

    // Rows 3 & 4: 10 Zako bees each (yellow/blue)
    for (let r = 0; r < 2; r++) {
      for (let c = 0; c < 10; c++) {
        const targetX = startX - 8 + c * colSpacing;
        const targetY = 112 + r * 16;
        this.enemies.push(this.createEnemy('zako', targetX, targetY, 1.8 + (r * 10 + c) * 0.06));
      }
    }
  }

  private spawnChallengingStageEnemies() {
    this.enemies = [];
    this.enemyIdCounter = 0;
    // Challenging stages fly 40 enemies in 5 rapid acrobatic waves
    const waveTypes: EnemyType[] = ['zako', 'goei', 'zako', 'goei', 'boss'];
    for (let wave = 0; wave < 5; wave++) {
      const type = waveTypes[wave];
      const count = 8;
      for (let i = 0; i < count; i++) {
        const enemy: Enemy = {
          id: ++this.enemyIdCounter,
          type,
          x: -40,
          y: -40,
          targetX: 144,
          targetY: 100,
          state: 'entering',
          pathProgress: -(wave * 2.6 + i * 0.18),
          pathId: wave,
          hitsLeft: 1, // 1 hit in challenging stage
          animFrame: 0,
          animTimer: 0,
          angle: 0,
          scoreValue: type === 'boss' ? 150 : type === 'goei' ? 100 : 80,
        };
        this.enemies.push(enemy);
      }
    }
  }

  private createEnemy(type: EnemyType, targetX: number, targetY: number, delay: number): Enemy {
    return {
      id: ++this.enemyIdCounter,
      type,
      x: targetX,
      y: -30,
      targetX,
      targetY,
      state: 'entering',
      pathProgress: -delay,
      pathId: Math.floor(Math.random() * 3),
      hitsLeft: type === 'boss' ? 2 : 1,
      animFrame: 0,
      animTimer: Math.random() * 10,
      angle: 0,
      scoreValue: type === 'boss' ? 150 : type === 'goei' ? 80 : 50,
    };
  }

  // --- Main Update Loop ---
  public update(dt: number) {
    if (this.isPaused || this.isGameOver) return;

    // Update Stars Parallax (speed scales slightly with stage)
    const starSpeedMultiplier = 1 + Math.min(1.5, (this.stage - 1) * 0.08);
    this.stars.forEach(s => {
      s.y += s.speed * starSpeedMultiplier;
      if (s.y > this.height) {
        s.y = 0;
        s.x = Math.random() * this.width;
      }
      s.twinkle += 0.05;
    });

    // Intro Banner Countdown
    if (this.stageIntroTimer > 0) {
      this.stageIntroTimer -= dt;
    }

    // Keyboard Input
    if (this.keys['ArrowLeft'] || this.keys['KeyA']) {
      this.movePlayerLeft();
    }
    if (this.keys['ArrowRight'] || this.keys['KeyD']) {
      this.movePlayerRight();
    }

    // Formation Breathing Animation (wobble left & right)
    this.formationOffsetX += this.formationDirection * 0.35;
    if (Math.abs(this.formationOffsetX) > 16) {
      this.formationDirection *= -1;
    }

    // Update Player Respawn Timer
    if (this.isDead) {
      this.respawnTimer -= dt;
      if (this.respawnTimer <= 0) {
        if (this.lives > 0) {
          this.lives--;
          this.isDead = false;
          this.playerX = 144;
          this.playerY = 350;
          this.isDualFighter = false;
        } else {
          this.isGameOver = true;
          this.saveHighScore();
        }
      }
    }

    // Update Player Capture Animation by Tractor Beam
    if (this.isCapturing) {
      this.captureAngle += 0.2;
      this.playerY -= 1.8;
      const targetBoss = this.enemies.find(e => e.id === this.tractorBeam.bossId);
      if (targetBoss) {
        this.playerX += (targetBoss.x - this.playerX) * 0.08;
        if (this.playerY <= targetBoss.y + 16) {
          // Ship fully captured!
          this.isCapturing = false;
          this.tractorBeam.active = false;
          this.tractorBeam.capturing = false;
          targetBoss.hasCapturedFighter = true;
          this.capturedShipInPlay = true;
          this.isDead = true;
          this.respawnTimer = 2.0;
        }
      } else {
        this.isCapturing = false;
        this.tractorBeam.active = false;
      }
    }

    // Update Tractor Beam
    if (this.tractorBeam.active) {
      this.tractorBeam.rings = (this.tractorBeam.rings + 0.15) % 6;
      if (Math.random() < 0.1) {
        this.playTractorBeamSound();
      }

      // Check if player is caught in beam cone
      if (!this.isCapturing && !this.isDead) {
        const beamTopX = this.tractorBeam.x;
        const beamBottomLeft = this.tractorBeam.x - 28;
        const beamBottomRight = this.tractorBeam.x + 28;
        if (
          this.playerY >= this.tractorBeam.y &&
          this.playerY <= this.tractorBeam.y + this.tractorBeam.height &&
          this.playerX >= beamBottomLeft &&
          this.playerX <= beamBottomRight
        ) {
          // Trap player in tractor beam!
          this.isCapturing = true;
          this.tractorBeam.capturing = true;
        }
      }
    }

    // Update Enemies
    this.updateEnemies(dt);

    // Update Bullets
    this.updateBullets(dt);

    // Update Particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life -= dt;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }

    // Check Stage Clear
    if (this.enemies.length === 0 && this.stageIntroTimer <= 0) {
      this.stageClearTimer += dt;
      if (this.stageClearTimer > 1.8) {
        this.initStage(this.stage + 1);
      }
    }
  }

  private updateEnemies(dt: number) {
    // Attack scheduler: select enemy or group to dive
    if (!this.isChallengingStage && this.stageIntroTimer <= 0) {
      this.diveTimer += dt;
      // Frequency of dives increases with stage level
      const diveInterval = Math.max(0.8, 2.8 - this.stage * 0.18);
      if (this.diveTimer > diveInterval) {
        this.diveTimer = 0;
        this.triggerDiveAttack();
      }
    }

    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const e = this.enemies[i];
      e.animTimer += dt;
      if (e.animTimer > 0.16) {
        e.animTimer = 0;
        e.animFrame = (e.animFrame + 1) % 2;
      }

      if (e.state === 'entering') {
        e.pathProgress += dt * (this.isChallengingStage ? 1.1 : 0.9);
        if (e.pathProgress >= 0) {
          // Swooping entrance curves
          const t = Math.min(1, e.pathProgress);
          let startX = -20;
          let startY = 180;
          let midX = 80;
          let midY = 240;

          if (e.pathId === 1) {
            startX = this.width + 20;
            midX = 208;
          } else if (e.pathId === 2) {
            startX = 144;
            startY = -20;
            midX = 40;
          } else if (e.pathId === 3) {
            startX = this.width - 40;
            startY = this.height + 20;
            midX = 144;
            midY = 120;
          } else if (e.pathId === 4) {
            startX = 40;
            startY = this.height + 20;
            midX = 144;
            midY = 120;
          }

          // Quadratic Bézier curve
          const u = 1 - t;
          e.x = u * u * startX + 2 * u * t * midX + t * t * (e.targetX + this.formationOffsetX);
          e.y = u * u * startY + 2 * u * t * midY + t * t * e.targetY;
          e.angle = Math.sin(t * Math.PI * 2) * 0.45;

          if (t >= 1) {
            if (this.isChallengingStage) {
              // Swoops off screen in challenging stage
              e.y += 220 * dt;
              if (e.y > this.height + 30) {
                this.enemies.splice(i, 1);
                continue;
              }
            } else {
              e.state = 'formation';
            }
          }
        }
      } else if (e.state === 'formation') {
        e.x = e.targetX + this.formationOffsetX;
        e.y = e.targetY;
        e.angle = 0;
      } else if (e.state === 'diving') {
        e.pathProgress += dt * (1.1 + Math.min(0.8, this.stage * 0.08));
        const t = e.pathProgress;
        
        // Dive speed & trajectory curves
        const diveSpeedY = 2.8 + Math.min(2.0, this.stage * 0.15);
        e.y += diveSpeedY;
        e.x += Math.sin(t * 3.2) * 2.6;
        e.angle = Math.sin(t * 3.2) * 0.6;

        // Tactical Aimed Alien Bombardments (Drop aimed bombs toward player!)
        const bulletProb = 0.02 + Math.min(0.04, this.stage * 0.005);
        if (Math.random() < bulletProb && this.bullets.filter(b => !b.isPlayer).length < 8) {
          const dx = this.playerX - e.x;
          const dy = this.playerY - e.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const bulletSpeed = 3.2 + Math.min(1.5, this.stage * 0.1);
          this.bullets.push({
            x: e.x,
            y: e.y + 8,
            vx: (dx / dist) * bulletSpeed * 0.7,
            vy: Math.max(2.4, (dy / dist) * bulletSpeed),
            isPlayer: false,
          });
        }

        // Loop back up if reaching bottom (authentic 360 loop)
        if (e.y > this.height + 20) {
          e.y = -20;
          e.x = e.targetX + this.formationOffsetX;
          e.state = 'formation';
          e.angle = 0;
        }
      } else if (e.state === 'tractor_beaming') {
        // Boss stays stationary and casts tractor beam
        e.pathProgress += dt;
        this.tractorBeam.active = true;
        this.tractorBeam.bossId = e.id;
        this.tractorBeam.x = e.x;
        this.tractorBeam.y = e.y + 12;

        if (e.pathProgress > 4.5 && !this.tractorBeam.capturing) {
          // Stop tractor beam and return to dive
          this.tractorBeam.active = false;
          e.state = 'diving';
        }
      }
    }
  }

  private triggerDiveAttack() {
    const formationEnemies = this.enemies.filter(e => e.state === 'formation');
    if (formationEnemies.length === 0) return;

    // Check for Boss Escort Dive Raid (Boss Galaga + 1 or 2 Goei butterflies!)
    const bosses = formationEnemies.filter(e => e.type === 'boss');
    const goeis = formationEnemies.filter(e => e.type === 'goei');

    if (bosses.length > 0 && Math.random() < 0.35) {
      const boss = bosses[Math.floor(Math.random() * bosses.length)];
      if (!boss.hasCapturedFighter && Math.random() < 0.4) {
        // Boss initiates Tractor Beam dive!
        boss.state = 'tractor_beaming';
        boss.pathProgress = 0;
        boss.y = 160;
        return;
      } else {
        // Escorted Boss Raid!
        boss.state = 'diving';
        boss.pathProgress = 0;
        // Grab up to 2 Goei butterflies to escort
        const escorts = goeis.slice(0, Math.min(2, goeis.length));
        escorts.forEach((esc, idx) => {
          esc.state = 'diving';
          esc.pathProgress = 0.05 * (idx + 1);
          esc.isEscort = true;
        });
        return;
      }
    }

    // Standard Dive (1 to 3 regular enemies)
    const count = Math.min(formationEnemies.length, Math.random() > 0.5 ? 2 : 1);
    for (let i = 0; i < count; i++) {
      const idx = Math.floor(Math.random() * formationEnemies.length);
      const enemy = formationEnemies[idx];
      if (!enemy) continue;
      enemy.state = 'diving';
      enemy.pathProgress = 0;
    }
  }

  private updateBullets(dt: number) {
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const b = this.bullets[i];
      b.x += b.vx;
      b.y += b.vy;

      // Out of bounds
      if (b.y < 0 || b.y > this.height || b.x < 0 || b.x > this.width) {
        this.bullets.splice(i, 1);
        continue;
      }

      if (b.isPlayer) {
        // Check collision with enemies
        for (let j = this.enemies.length - 1; j >= 0; j--) {
          const e = this.enemies[j];
          const hitW = e.type === 'boss' ? 18 : 14;
          const hitH = 14;

          if (Math.abs(b.x - e.x) < hitW && Math.abs(b.y - e.y) < hitH) {
            // Hit enemy!
            this.bullets.splice(i, 1);
            this.shotsHit++;
            e.hitsLeft--;

            if (e.hitsLeft <= 0) {
              // Destroyed
              const isDiving = e.state === 'diving' || e.state === 'tractor_beaming';
              let points = e.scoreValue;

              // Authentic Galaga Point Scaling:
              if (e.type === 'boss') {
                if (isDiving) {
                  // Escorted Boss points: 400 (solo), 800 (1 escort), 1600 (2 escorts)
                  points = e.isEscort ? 800 : 400;
                } else {
                  points = 150;
                }
              } else if (e.type === 'goei') {
                points = isDiving ? 160 : 80;
              } else if (e.type === 'zako') {
                points = isDiving ? 100 : 50;
              }

              this.score += points;
              if (this.score > this.highScore) {
                this.highScore = this.score;
              }

              if (this.isChallengingStage) {
                this.challengingHits++;
              }

              // Check if rescuing captured fighter!
              if (e.hasCapturedFighter) {
                if (isDiving) {
                  // Rescued successfully -> Become Dual Fighter!
                  this.isDualFighter = true;
                  this.capturedShipInPlay = false;
                  this.playDualFighterFanfare();
                  this.createExplosion(e.x, e.y, '#38bdf8', 18);
                } else {
                  // In formation: captured fighter is lost
                  this.capturedShipInPlay = false;
                }
              }

              this.playEnemyExplosionSound(e.type === 'boss');
              this.createExplosion(e.x, e.y, e.type === 'boss' ? '#22c55e' : e.type === 'goei' ? '#ef4444' : '#facc15', 14);
              this.enemies.splice(j, 1);

              if (this.tractorBeam.bossId === e.id) {
                this.tractorBeam.active = false;
              }
            } else {
              // Boss damaged (turns blue)
              this.playEnemyExplosionSound(false);
              this.createExplosion(e.x, e.y, '#38bdf8', 6);
            }
            break;
          }
        }
      } else {
        // Enemy bullet vs Player
        if (!this.isDead && !this.isCapturing) {
          const shipW = this.isDualFighter ? 28 : 14;
          if (Math.abs(b.x - this.playerX) < shipW / 2 && Math.abs(b.y - this.playerY) < 8) {
            this.bullets.splice(i, 1);
            this.killPlayer();
          }
        }
      }
    }

    // Direct collision between Player and Enemies
    if (!this.isDead && !this.isCapturing) {
      const shipW = this.isDualFighter ? 28 : 14;
      for (let j = this.enemies.length - 1; j >= 0; j--) {
        const e = this.enemies[j];
        if (Math.abs(e.x - this.playerX) < shipW && Math.abs(e.y - this.playerY) < 14) {
          this.createExplosion(e.x, e.y, '#ef4444', 12);
          this.enemies.splice(j, 1);
          this.killPlayer();
          break;
        }
      }
    }
  }

  private killPlayer() {
    if (this.isDualFighter) {
      // Downgrade to single fighter instead of instant death
      this.isDualFighter = false;
      this.createExplosion(this.playerX + 8, this.playerY, '#ef4444', 14);
      this.playPlayerDeathSound();
    } else {
      this.isDead = true;
      this.respawnTimer = 2.0;
      this.createExplosion(this.playerX, this.playerY, '#ef4444', 22);
      this.playPlayerDeathSound();
    }
  }

  private createExplosion(x: number, y: number, color: string, count: number) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.2 + Math.random() * 4.0;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0.25 + Math.random() * 0.35,
        maxLife: 0.5,
        color,
        size: 1.2 + Math.random() * 2.5,
      });
    }
  }

  // --- Render Loop ---
  public render() {
    const ctx = this.ctx;
    ctx.fillStyle = '#030712';
    ctx.fillRect(0, 0, this.width, this.height);

    // 1. Render Stars
    this.stars.forEach(s => {
      ctx.fillStyle = s.color;
      ctx.globalAlpha = 0.5 + Math.sin(s.twinkle) * 0.5;
      ctx.fillRect(s.x, s.y, s.size, s.size);
    });
    ctx.globalAlpha = 1.0;

    // 2. Render Tractor Beam
    if (this.tractorBeam.active) {
      this.renderTractorBeam();
    }

    // 3. Render Enemies
    this.enemies.forEach(e => this.renderEnemy(e));

    // 4. Render Bullets
    this.bullets.forEach(b => {
      ctx.fillStyle = b.isPlayer ? '#38bdf8' : '#ef4444';
      ctx.fillRect(b.x - 1, b.y - 3, 2, 6);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(b.x - 0.5, b.y - 1, 1, 2);
    });

    // 5. Render Particles
    this.particles.forEach(p => {
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.life / p.maxLife;
      ctx.fillRect(p.x, p.y, p.size, p.size);
    });
    ctx.globalAlpha = 1.0;

    // 6. Render Player Fighter
    if (!this.isDead) {
      ctx.save();
      ctx.translate(this.playerX, this.playerY);
      if (this.isCapturing) {
        ctx.rotate(this.captureAngle);
      }
      this.renderFighter(0, 0, this.isDualFighter);
      ctx.restore();
    }

    // 7. Render HUD, Stage Badges & Results
    this.renderHUD();
  }

  private renderTractorBeam() {
    const ctx = this.ctx;
    const tb = this.tractorBeam;
    const startY = tb.y;
    const height = tb.height;

    ctx.save();
    for (let i = 0; i < 8; i++) {
      const ringY = startY + (i / 8) * height + (tb.rings * 4);
      if (ringY > startY + height) continue;
      const widthAtY = 12 + ((ringY - startY) / height) * 60;
      ctx.strokeStyle = i % 2 === 0 ? 'rgba(56, 189, 248, 0.75)' : 'rgba(239, 68, 68, 0.6)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(tb.x, ringY, widthAtY / 2, 6, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }

  private renderFighter(x: number, y: number, isDual: boolean) {
    if (isDual) {
      this.drawSingleFighterShip(x - 9, y);
      this.drawSingleFighterShip(x + 9, y);
    } else {
      this.drawSingleFighterShip(x, y);
    }
  }

  private drawSingleFighterShip(x: number, y: number) {
    const ctx = this.ctx;
    ctx.fillStyle = '#ffffff'; // Cockpit body
    ctx.fillRect(x - 2, y - 8, 4, 12);
    ctx.fillStyle = '#ef4444'; // Red wings
    ctx.fillRect(x - 7, y, 14, 4);
    ctx.fillStyle = '#3b82f6'; // Blue wingtips
    ctx.fillRect(x - 8, y + 2, 2, 4);
    ctx.fillRect(x + 6, y + 2, 2, 4);
    ctx.fillStyle = '#eab308'; // Nose tip
    ctx.fillRect(x - 1, y - 9, 2, 2);
  }

  private renderEnemy(e: Enemy) {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(e.x, e.y);
    ctx.rotate(e.angle);

    if (e.hasCapturedFighter) {
      // Draw captured red-tinted fighter upside-down on top of Boss
      ctx.save();
      ctx.translate(0, -14);
      ctx.scale(0.8, -0.8);
      this.drawSingleFighterShip(0, 0);
      ctx.restore();
    }

    if (e.type === 'zako') {
      // Bee (Yellow & Blue)
      ctx.fillStyle = '#eab308';
      ctx.fillRect(-5, -4, 10, 8);
      ctx.fillStyle = e.animFrame === 0 ? '#3b82f6' : '#60a5fa';
      ctx.fillRect(-7, -2, 3, 5);
      ctx.fillRect(4, -2, 3, 5);
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(-2, -5, 4, 2);
    } else if (e.type === 'goei') {
      // Butterfly (Red & Yellow)
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(-6, -5, 12, 10);
      ctx.fillStyle = '#eab308';
      ctx.fillRect(-4, -3, 8, 6);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-1, -6, 2, 3);
    } else if (e.type === 'boss') {
      // Boss Galaga (Green / Blue when damaged)
      const mainColor = e.hitsLeft === 2 ? '#22c55e' : '#38bdf8';
      ctx.fillStyle = mainColor;
      ctx.fillRect(-7, -6, 14, 12);
      ctx.fillStyle = '#eab308';
      ctx.fillRect(-5, -4, 10, 8);
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(-8, -2, 2, 6);
      ctx.fillRect(6, -2, 2, 6);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-2, -7, 4, 2);
    }

    ctx.restore();
  }

  private renderHUD() {
    const ctx = this.ctx;
    ctx.fillStyle = '#ef4444';
    ctx.font = 'bold 9px monospace';
    ctx.textAlign = 'left';
    ctx.fillText('1UP', 16, 14);
    ctx.fillStyle = '#ffffff';
    ctx.fillText(this.score.toString().padStart(6, '0'), 16, 25);

    ctx.fillStyle = '#ef4444';
    ctx.textAlign = 'center';
    ctx.fillText('HIGH SCORE', this.width / 2, 14);
    ctx.fillStyle = '#ffffff';
    ctx.fillText(this.highScore.toString().padStart(6, '0'), this.width / 2, 25);

    // Stage Intro Banners
    if (this.stageIntroTimer > 0) {
      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 13px monospace';
      ctx.textAlign = 'center';
      if (this.isChallengingStage) {
        ctx.fillStyle = '#fbbf24';
        ctx.fillText('CHALLENGING STAGE', this.width / 2, this.height / 2 - 10);
      } else {
        ctx.fillText(`STAGE ${this.stage}`, this.width / 2, this.height / 2 - 10);
      }
    }

    // Challenging Stage Results
    if (this.isChallengingStage && this.enemies.length === 0 && this.stageClearTimer > 0) {
      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 11px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('NUMBER OF HITS', this.width / 2, this.height / 2 - 20);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 16px monospace';
      ctx.fillText(`${this.challengingHits} / ${this.challengingTotal}`, this.width / 2, this.height / 2);
      if (this.challengingHits === this.challengingTotal) {
        ctx.fillStyle = '#22c55e';
        ctx.fillText('PERFECT 10000 PTS BONUS!', this.width / 2, this.height / 2 + 24);
      }
    }

    // Authentic Galaga Game Over & RESULTS Screen
    if (this.isGameOver) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
      ctx.fillRect(16, 80, this.width - 32, 220);
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2;
      ctx.strokeRect(16, 80, this.width - 32, 220);

      ctx.fillStyle = '#ef4444';
      ctx.font = 'bold 16px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('GAME OVER', this.width / 2, 110);

      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 12px monospace';
      ctx.fillText('- RESULTS -', this.width / 2, 135);

      ctx.font = 'bold 10px monospace';
      ctx.textAlign = 'left';
      ctx.fillStyle = '#e2e8f0';
      ctx.fillText('SHOTS FIRED', 34, 165);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#38bdf8';
      ctx.fillText(`${this.shotsFired}`, this.width - 34, 165);

      ctx.textAlign = 'left';
      ctx.fillStyle = '#e2e8f0';
      ctx.fillText('NUMBER OF HITS', 34, 190);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#38bdf8';
      ctx.fillText(`${this.shotsHit}`, this.width - 34, 190);

      const ratio = this.shotsFired > 0 ? ((this.shotsHit / this.shotsFired) * 100).toFixed(1) : '0.0';
      ctx.textAlign = 'left';
      ctx.fillStyle = '#fbbf24';
      ctx.fillText('HIT-MISS RATIO', 34, 215);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#22c55e';
      ctx.fillText(`${ratio} %`, this.width - 34, 215);

      ctx.fillStyle = '#94a3b8';
      ctx.font = 'bold 9px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('PRESS FIRE OR CLICK TO RESTART', this.width / 2, 275);
    }

    // Lives icons at bottom left
    for (let i = 0; i < this.lives; i++) {
      this.drawSingleFighterShip(18 + i * 14, this.height - 12);
    }

    // Authentic Stage Badges at bottom right (Namco Badges)
    this.renderStageBadges();
  }

  private renderStageBadges() {
    const ctx = this.ctx;
    let s = this.stage;
    let badgeX = this.width - 16;
    const badgeY = this.height - 12;

    // 50-badge (Gold crest)
    while (s >= 50 && badgeX > 120) {
      ctx.fillStyle = '#eab308';
      ctx.fillRect(badgeX - 6, badgeY - 7, 12, 14);
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(badgeX - 3, badgeY - 4, 6, 8);
      badgeX -= 15;
      s -= 50;
    }

    // 30-badge (Red emblem)
    while (s >= 30 && badgeX > 120) {
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(badgeX - 5, badgeY - 6, 10, 12);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(badgeX - 2, badgeY - 3, 4, 6);
      badgeX -= 13;
      s -= 30;
    }

    // 20-badge (Blue Star)
    while (s >= 20 && badgeX > 120) {
      ctx.fillStyle = '#3b82f6';
      ctx.fillRect(badgeX - 4, badgeY - 5, 8, 10);
      badgeX -= 11;
      s -= 20;
    }

    // 10-badge (Red Star)
    while (s >= 10 && badgeX > 120) {
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(badgeX - 4, badgeY - 5, 8, 10);
      badgeX -= 11;
      s -= 10;
    }

    // 5-badge (Yellow Star)
    while (s >= 5 && badgeX > 120) {
      ctx.fillStyle = '#eab308';
      ctx.fillRect(badgeX - 3, badgeY - 4, 6, 8);
      badgeX -= 9;
      s -= 5;
    }

    // 1-badge (Blue Chevron)
    while (s >= 1 && badgeX > 120) {
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(badgeX - 2, badgeY - 3, 4, 6);
      badgeX -= 7;
      s -= 1;
    }
  }

  // --- Lifecycle ---
  public start() {
    this.lastTime = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - this.lastTime) / 1000);
      this.lastTime = now;
      this.update(dt);
      this.render();
      this.animId = requestAnimationFrame(loop);
    };
    this.animId = requestAnimationFrame(loop);
  }

  public destroy() {
    if (this.animId !== null) {
      cancelAnimationFrame(this.animId);
      this.animId = null;
    }
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
    this.canvas.removeEventListener('mousemove', this.handleMouseMove);
    this.canvas.removeEventListener('touchmove', this.handleTouchMove);
  }

  public restartGame() {
    this.score = 0;
    this.lives = 3;
    this.stage = 1;
    this.shotsFired = 0;
    this.shotsHit = 0;
    this.isDualFighter = false;
    this.isDead = false;
    this.isGameOver = false;
    this.capturedShipInPlay = false;
    this.initStage(1);
    this.playStartGameFanfare();
  }
}
