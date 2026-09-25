/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * ARKANOID / BREAKOUT (1986 Taito / 1976 Atari)
 * Clean-room TypeScript Game Engine
 * Features:
 * - High-precision ball physics with angle deflections based on paddle contact point
 * - Vaus spaceship paddle with laser cannons, expanding width, catch/sticky mode
 * - 7 Iconic Powerup Capsules: Laser (L), Expand (E), Catch (C), Slow (S), Disruption 3-Balls (D), Break/Warp (B), Player Life (P)
 * - Multiple rounds / stages with colorful destructible, multi-hit silver, and indestructible gold bricks
 * - Descending geometric alien enemies with spawning gates
 * - Procedural Web Audio API sound synthesis (No external audio files)
 */

export interface ArkanoidGameState {
  score: number;
  highScore: number;
  lives: number;
  round: number;
  gameOver: boolean;
  gameWon: boolean;
  paused: boolean;
  activePowerUp: 'none' | 'laser' | 'expand' | 'catch' | 'slow';
}

interface Ball {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  speed: number;
  isStuck: boolean;
  stuckOffset: number;
}

interface Brick {
  x: number;
  y: number;
  w: number;
  h: number;
  color: string;
  points: number;
  type: 'normal' | 'silver' | 'gold';
  hitsLeft: number;
  maxHits: number;
  powerUp?: 'L' | 'E' | 'C' | 'S' | 'D' | 'B' | 'P';
}

interface Capsule {
  x: number;
  y: number;
  w: number;
  h: number;
  type: 'L' | 'E' | 'C' | 'S' | 'D' | 'B' | 'P';
  color: string;
  label: string;
  vy: number;
  rotation: number;
}

interface LaserBullet {
  x: number;
  y: number;
  vx: number;
  vy: number;
  w: number;
  h: number;
}

interface Enemy {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  type: 'pyramid' | 'sphere' | 'cube';
  color: string;
  animFrame: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  alpha: number;
  life: number;
}

export class ArkanoidEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private animId: number | null = null;
  private isDestroyed = false;

  // Audio Context
  private audioCtx: AudioContext | null = null;
  private isAudioMuted = false;

  // Virtual Game Dimensions (Vertical Arcade layout 320 x 480)
  public readonly width = 320;
  public readonly height = 480;

  // Vaus Paddle
  private paddleX = 160;
  private paddleY = 445;
  private normalPaddleWidth = 52;
  private paddleWidth = 52;
  private paddleHeight = 12;
  private paddleSpeed = 3.8;
  private laserActive = false;
  private catchActive = false;
  private expandActive = false;

  // Game Objects
  private balls: Ball[] = [];
  private bricks: Brick[] = [];
  private capsules: Capsule[] = [];
  private lasers: LaserBullet[] = [];
  private enemies: Enemy[] = [];
  private particles: Particle[] = [];

  // State
  private score = 0;
  private highScore = 20000;
  private lives = 3;
  private round = 1;
  private maxRounds = 5;
  private isGameOver = false;
  private isGameWon = false;
  private isPaused = false;
  private warpOpen = false;
  private warpX = 308;
  private warpY = 430;
  private warpMessageTimer = 0;

  // Spawning timer
  private enemySpawnTimer = 0;

  // Controls input
  private keys: { [key: string]: boolean } = {};
  private onStateChangeCallback?: (state: ArkanoidGameState) => void;

  constructor(canvas: HTMLCanvasElement, onStateChange?: (state: ArkanoidGameState) => void) {
    this.canvas = canvas;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Could not get 2D context');
    this.ctx = context;
    this.onStateChangeCallback = onStateChange;

    // Load Highscore
    const saved = localStorage.getItem('arkanoid_high_score');
    if (saved) {
      this.highScore = parseInt(saved, 10) || 20000;
    }

    this.initAudio();
    this.setupListeners();
    this.resetRound(1);
  }

  private initAudio() {
    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.audioCtx = new AudioContextClass();
    } catch {
      // Audio not supported or blocked
    }
  }

  public setAudioMuted(muted: boolean) {
    this.isAudioMuted = muted;
  }

  // --- Procedural Sound Synthesis ---
  private playPaddleHitSound() {
    if (this.isAudioMuted || !this.audioCtx) return;
    try {
      const ctx = this.audioCtx;
      if (ctx.state === 'suspended') ctx.resume();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.06);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.06);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.06);
    } catch { /* ignore */ }
  }

  private playBrickHitSound(isHard = false) {
    if (this.isAudioMuted || !this.audioCtx) return;
    try {
      const ctx = this.audioCtx;
      if (ctx.state === 'suspended') ctx.resume();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = isHard ? 'triangle' : 'square';
      const startFreq = isHard ? 300 : 600 + Math.random() * 200;
      osc.frequency.setValueAtTime(startFreq, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } catch { /* ignore */ }
  }

  private playLaserSound() {
    if (this.isAudioMuted || !this.audioCtx) return;
    try {
      const ctx = this.audioCtx;
      if (ctx.state === 'suspended') ctx.resume();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(900, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } catch { /* ignore */ }
  }

  private playPowerupSound() {
    if (this.isAudioMuted || !this.audioCtx) return;
    try {
      const ctx = this.audioCtx;
      if (ctx.state === 'suspended') ctx.resume();
      const now = ctx.currentTime;
      [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + i * 0.05);
        gain.gain.setValueAtTime(0.12, now + i * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.01, now + (i + 1) * 0.05);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + i * 0.05);
        osc.stop(now + (i + 1) * 0.05);
      });
    } catch { /* ignore */ }
  }

  private playRoundWinSound() {
    if (this.isAudioMuted || !this.audioCtx) return;
    try {
      const ctx = this.audioCtx;
      if (ctx.state === 'suspended') ctx.resume();
      const notes = [440, 554, 659, 880, 1108];
      const now = ctx.currentTime;
      notes.forEach((f, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(f, now + i * 0.09);
        gain.gain.setValueAtTime(0.15, now + i * 0.09);
        gain.gain.exponentialRampToValueAtTime(0.01, now + (i + 1) * 0.09);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + i * 0.09);
        osc.stop(now + (i + 1) * 0.09);
      });
    } catch { /* ignore */ }
  }

  private playLoseLifeSound() {
    if (this.isAudioMuted || !this.audioCtx) return;
    try {
      const ctx = this.audioCtx;
      if (ctx.state === 'suspended') ctx.resume();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(300, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(60, ctx.currentTime + 0.4);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } catch { /* ignore */ }
  }

  // --- Input Setup ---
  private handleKeyDown = (e: KeyboardEvent) => {
    this.keys[e.code] = true;
    if (e.code === 'Space') {
      this.fireLaserOrReleaseBall();
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
    this.setPaddlePosition(mouseX);
  };

  private handleTouchMove = (e: TouchEvent) => {
    if (e.touches.length > 0) {
      const rect = this.canvas.getBoundingClientRect();
      const scaleX = this.width / rect.width;
      const touchX = (e.touches[0].clientX - rect.left) * scaleX;
      this.setPaddlePosition(touchX);
    }
  };

  private setupListeners() {
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
    this.canvas.addEventListener('mousemove', this.handleMouseMove);
    this.canvas.addEventListener('touchmove', this.handleTouchMove, { passive: true });
    this.canvas.addEventListener('click', () => this.fireLaserOrReleaseBall());
  }

  public setPaddlePosition(x: number) {
    const halfW = this.paddleWidth / 2;
    this.paddleX = Math.max(16 + halfW, Math.min(this.width - 16 - halfW, x));
    // Move stuck balls
    this.balls.forEach(b => {
      if (b.isStuck) {
        b.x = this.paddleX + b.stuckOffset;
      }
    });
  }

  public movePaddleLeft() {
    this.setPaddlePosition(this.paddleX - this.paddleSpeed);
  }

  public movePaddleRight() {
    this.setPaddlePosition(this.paddleX + this.paddleSpeed);
  }

  public movePaddleAnalog(deltaX: number) {
    this.setPaddlePosition(this.paddleX + deltaX);
  }

  public fireLaserOrReleaseBall() {
    if (this.isGameOver || this.isPaused) return;

    // Release any stuck balls
    let released = false;
    this.balls.forEach(b => {
      if (b.isStuck) {
        b.isStuck = false;
        b.vy = -Math.abs(b.speed);
        // compute initial angle based on offset
        const norm = b.stuckOffset / (this.paddleWidth / 2);
        b.vx = norm * b.speed * 0.9;
        released = true;
      }
    });

    // Fire laser if active
    if (!released && this.laserActive && this.lasers.length < 6) {
      const halfW = this.paddleWidth / 2;
      this.lasers.push(
        { x: this.paddleX - halfW + 6, y: this.paddleY - 4, vx: 0, vy: -7, w: 3, h: 10 },
        { x: this.paddleX + halfW - 9, y: this.paddleY - 4, vx: 0, vy: -7, w: 3, h: 10 }
      );
      this.playLaserSound();
    }
  }

  // --- Level Builder ---
  private buildRoundBricks(round: number) {
    this.bricks = [];
    const cols = 11;
    const brickW = 24;
    const brickH = 10;
    const startX = 28;
    const startY = 60;

    // Color definitions
    const C = {
      W: { color: '#ffffff', points: 50, type: 'normal' as const },
      O: { color: '#f97316', points: 60, type: 'normal' as const },
      C: { color: '#06b6d4', points: 70, type: 'normal' as const },
      G: { color: '#22c55e', points: 80, type: 'normal' as const },
      R: { color: '#ef4444', points: 90, type: 'normal' as const },
      B: { color: '#3b82f6', points: 100, type: 'normal' as const },
      M: { color: '#ec4899', points: 110, type: 'normal' as const },
      Y: { color: '#eab308', points: 120, type: 'normal' as const },
      S: { color: '#94a3b8', points: 200, type: 'silver' as const }, // Takes 2 hits
      X: { color: '#d97706', points: 0, type: 'gold' as const }, // Indestructible
    };

    let layout: (keyof typeof C | null)[][] = [];

    if (round === 1) {
      // Classic Wall
      layout = [
        ['S', 'S', 'S', 'S', 'S', 'S', 'S', 'S', 'S', 'S', 'S'],
        ['R', 'R', 'R', 'R', 'R', 'R', 'R', 'R', 'R', 'R', 'R'],
        ['Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y'],
        ['B', 'B', 'B', 'B', 'B', 'B', 'B', 'B', 'B', 'B', 'B'],
        ['M', 'M', 'M', 'M', 'M', 'M', 'M', 'M', 'M', 'M', 'M'],
        ['G', 'G', 'G', 'G', 'G', 'G', 'G', 'G', 'G', 'G', 'G'],
      ];
    } else if (round === 2) {
      // Pyramid and Gates
      layout = [
        [null, null, null, null, null, 'S', null, null, null, null, null],
        [null, null, null, null, 'R', 'R', 'R', null, null, null, null],
        [null, null, null, 'Y', 'Y', 'X', 'Y', 'Y', null, null, null],
        [null, null, 'B', 'B', 'B', 'B', 'B', 'B', 'B', null, null],
        [null, 'G', 'G', 'G', 'X', 'G', 'X', 'G', 'G', 'G', null],
        ['C', 'C', 'C', 'C', 'C', 'C', 'C', 'C', 'C', 'C', 'C'],
      ];
    } else if (round === 3) {
      // Twin Pillars
      layout = [
        ['X', 'R', 'R', 'X', null, null, null, 'X', 'R', 'R', 'X'],
        ['X', 'Y', 'Y', 'X', null, 'S', null, 'X', 'Y', 'Y', 'X'],
        ['X', 'G', 'G', 'X', 'S', 'S', 'S', 'X', 'G', 'G', 'X'],
        ['X', 'B', 'B', 'X', null, 'S', null, 'X', 'B', 'B', 'X'],
        ['X', 'M', 'M', 'X', null, null, null, 'X', 'M', 'M', 'X'],
        ['S', 'C', 'C', 'S', 'C', 'C', 'C', 'S', 'C', 'C', 'S'],
      ];
    } else if (round === 4) {
      // Diamond Fortress
      layout = [
        [null, null, null, null, 'S', 'S', 'S', null, null, null, null],
        [null, null, 'R', 'R', 'X', 'R', 'X', 'R', 'R', null, null],
        [null, 'Y', 'Y', 'Y', 'Y', 'S', 'Y', 'Y', 'Y', 'Y', null],
        ['B', 'B', 'X', 'B', 'B', 'X', 'B', 'B', 'X', 'B', 'B'],
        [null, 'M', 'M', 'M', 'M', 'S', 'M', 'M', 'M', 'M', null],
        [null, null, 'G', 'G', 'X', 'G', 'X', 'G', 'G', null, null],
        [null, null, null, null, 'C', 'C', 'C', null, null, null, null],
      ];
    } else {
      // High-density Master Round
      layout = [
        ['S', 'X', 'S', 'X', 'S', 'X', 'S', 'X', 'S', 'X', 'S'],
        ['R', 'R', 'R', 'R', 'R', 'R', 'R', 'R', 'R', 'R', 'R'],
        ['Y', 'Y', 'X', 'Y', 'Y', 'S', 'Y', 'Y', 'X', 'Y', 'Y'],
        ['G', 'G', 'G', 'G', 'G', 'G', 'G', 'G', 'G', 'G', 'G'],
        ['B', 'X', 'B', 'B', 'X', 'B', 'X', 'B', 'B', 'X', 'B'],
        ['M', 'M', 'M', 'M', 'M', 'M', 'M', 'M', 'M', 'M', 'M'],
        ['C', 'C', 'C', 'C', 'C', 'C', 'C', 'C', 'C', 'C', 'C'],
      ];
    }

    // Weighted power-up capsule pool: Common utility capsules, rare B (Break Warp) and P (Extra Life)
    const powerUpPool: ('L' | 'E' | 'C' | 'S' | 'D' | 'B' | 'P')[] = [
      'L', 'L', 'L', 'L',
      'E', 'E', 'E', 'E',
      'C', 'C', 'C',
      'S', 'S', 'S',
      'D', 'D', 'D',
      'P',
      'B'
    ];

    for (let r = 0; r < layout.length; r++) {
      for (let c = 0; c < layout[r].length; c++) {
        const key = layout[r][c];
        if (key && C[key]) {
          const info = C[key];
          const hasPowerUp = info.type === 'normal' && Math.random() < 0.20;
          const pType = hasPowerUp ? powerUpPool[Math.floor(Math.random() * powerUpPool.length)] : undefined;
          
          this.bricks.push({
            x: startX + c * (brickW + 2),
            y: startY + r * (brickH + 2),
            w: brickW,
            h: brickH,
            color: info.color,
            points: info.points,
            type: info.type,
            hitsLeft: info.type === 'silver' ? 2 : 1,
            maxHits: info.type === 'silver' ? 2 : 1,
            powerUp: pType,
          });
        }
      }
    }
  }

  // --- Reset / Lifecycle ---
  public resetRound(roundNumber: number) {
    this.round = roundNumber;
    this.warpOpen = false;
    this.laserActive = false;
    this.catchActive = false;
    this.expandActive = false;
    this.paddleWidth = this.normalPaddleWidth;
    this.paddleX = this.width / 2;

    this.lasers = [];
    this.capsules = [];
    this.enemies = [];
    this.particles = [];

    // Create starting ball stuck on paddle
    this.balls = [{
      x: this.paddleX,
      y: this.paddleY - 7,
      vx: 0,
      vy: 0,
      radius: 4,
      speed: 4.2 + (this.round - 1) * 0.3,
      isStuck: true,
      stuckOffset: 0
    }];

    this.buildRoundBricks(this.round);
    this.notifyState();
  }

  public resetGame() {
    this.score = 0;
    this.lives = 3;
    this.isGameOver = false;
    this.isGameWon = false;
    this.resetRound(1);
  }

  public start() {
    if (this.animId) cancelAnimationFrame(this.animId);
    let lastTime = performance.now();

    const loop = (time: number) => {
      if (this.isDestroyed) return;
      const dt = Math.min(32, time - lastTime);
      lastTime = time;

      if (!this.isPaused && !this.isGameOver && !this.isGameWon) {
        this.update(dt);
      }
      this.render();

      this.animId = requestAnimationFrame(loop);
    };

    this.animId = requestAnimationFrame(loop);
  }

  public destroy() {
    this.isDestroyed = true;
    if (this.animId) cancelAnimationFrame(this.animId);
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
    this.canvas.removeEventListener('mousemove', this.handleMouseMove);
    this.canvas.removeEventListener('touchmove', this.handleTouchMove);
  }

  // --- Updates ---
  private update(_dt: number) {
    // Keyboard paddle continuous motion
    if (this.keys['ArrowLeft'] || this.keys['KeyA']) {
      this.movePaddleLeft();
    }
    if (this.keys['ArrowRight'] || this.keys['KeyD']) {
      this.movePaddleRight();
    }

    // Vaus Paddle Warp Check (Escape to next round via opened right gate)
    const halfW = this.paddleWidth / 2;
    if (this.warpOpen && this.paddleX + halfW >= this.width - 18 && this.paddleY >= this.warpY - 15) {
      this.advanceRound(true);
      return;
    }

    // Update Lasers
    for (let i = this.lasers.length - 1; i >= 0; i--) {
      const l = this.lasers[i];
      l.y += l.vy;

      // Laser hit brick
      let laserDead = false;
      for (let j = this.bricks.length - 1; j >= 0; j--) {
        const b = this.bricks[j];
        if (l.x + l.w >= b.x && l.x <= b.x + b.w && l.y <= b.y + b.h && l.y + l.h >= b.y) {
          laserDead = true;
          this.hitBrick(b, j);
          break;
        }
      }

      if (laserDead || l.y < 20) {
        this.lasers.splice(i, 1);
      }
    }

    // Update Capsules
    for (let i = this.capsules.length - 1; i >= 0; i--) {
      const cap = this.capsules[i];
      cap.y += cap.vy;
      cap.rotation += 0.05;

      // Check paddle catch
      const halfW = this.paddleWidth / 2;
      if (
        cap.y + cap.h >= this.paddleY &&
        cap.y <= this.paddleY + this.paddleHeight &&
        cap.x + cap.w >= this.paddleX - halfW &&
        cap.x <= this.paddleX + halfW
      ) {
        this.applyPowerUp(cap.type);
        this.capsules.splice(i, 1);
        continue;
      }

      // Fell off screen
      if (cap.y > this.height) {
        this.capsules.splice(i, 1);
      }
    }

    // Spawn and update Enemies
    this.enemySpawnTimer++;
    if (this.enemySpawnTimer > 360 && this.enemies.length < 4) {
      this.enemySpawnTimer = 0;
      const types: ('pyramid' | 'sphere' | 'cube')[] = ['pyramid', 'sphere', 'cube'];
      const colors = ['#f43f5e', '#38bdf8', '#fbbf24'];
      const randType = types[Math.floor(Math.random() * types.length)];
      const randColor = colors[Math.floor(Math.random() * colors.length)];
      const spawnX = Math.random() < 0.5 ? 50 : 270;
      this.enemies.push({
        x: spawnX,
        y: 40,
        vx: (Math.random() - 0.5) * 1.5,
        vy: 0.8 + Math.random() * 0.6,
        size: 14,
        type: randType,
        color: randColor,
        animFrame: 0
      });
    }

    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const e = this.enemies[i];
      e.x += e.vx;
      e.y += e.vy;
      e.animFrame += 0.08;

      if (e.x < 24 || e.x > this.width - 24) e.vx *= -1;

      // Laser hit enemy
      for (let l = this.lasers.length - 1; l >= 0; l--) {
        const laser = this.lasers[l];
        if (Math.hypot(laser.x - e.x, laser.y - e.y) < e.size) {
          this.createExplosion(e.x, e.y, e.color, 10);
          this.score += 100;
          this.enemies.splice(i, 1);
          this.lasers.splice(l, 1);
          this.playBrickHitSound();
          break;
        }
      }

      // Ball hit enemy
      if (this.enemies[i]) {
        for (const b of this.balls) {
          if (!b.isStuck && Math.hypot(b.x - e.x, b.y - e.y) < b.radius + e.size / 2) {
            b.vy = -b.vy;
            this.createExplosion(e.x, e.y, e.color, 12);
            this.score += 100;
            this.enemies.splice(i, 1);
            this.playBrickHitSound();
            break;
          }
        }
      }

      // Reached bottom
      if (this.enemies[i] && e.y > this.height) {
        this.enemies.splice(i, 1);
      }
    }

    // Update Balls
    for (let i = this.balls.length - 1; i >= 0; i--) {
      const b = this.balls[i];
      if (b.isStuck) continue;

      b.x += b.vx;
      b.y += b.vy;

      // Left & Right Wall Collision
      if (b.x - b.radius <= 16) {
        b.x = 16 + b.radius;
        b.vx = Math.abs(b.vx);
        this.playPaddleHitSound();
      } else if (b.x + b.radius >= this.width - 16) {
        // Warp gate check on right edge
        if (this.warpOpen && b.y >= this.warpY - 10 && b.y <= this.warpY + 30) {
          this.advanceRound(true);
          return;
        }
        b.x = this.width - 16 - b.radius;
        b.vx = -Math.abs(b.vx);
        this.playPaddleHitSound();
      }

      // Top Ceiling Collision
      if (b.y - b.radius <= 24) {
        b.y = 24 + b.radius;
        b.vy = Math.abs(b.vy);
        this.playPaddleHitSound();
      }

      // Paddle Collision
      const halfW = this.paddleWidth / 2;
      if (
        b.y + b.radius >= this.paddleY &&
        b.y - b.radius <= this.paddleY + this.paddleHeight &&
        b.x >= this.paddleX - halfW - 2 &&
        b.x <= this.paddleX + halfW + 2 &&
        b.vy > 0
      ) {
        if (this.catchActive) {
          b.isStuck = true;
          b.stuckOffset = b.x - this.paddleX;
          b.vx = 0;
          b.vy = 0;
          this.playPaddleHitSound();
          continue;
        }

        // Angle deflection based on hit distance from center
        const hitOffset = (b.x - this.paddleX) / halfW; // -1.0 to 1.0
        const maxAngle = (75 * Math.PI) / 180;
        const angle = hitOffset * maxAngle;

        b.vx = b.speed * Math.sin(angle);
        b.vy = -b.speed * Math.cos(angle);
        b.y = this.paddleY - b.radius;

        this.playPaddleHitSound();
        this.createExplosion(b.x, b.y, '#38bdf8', 4);
      }

      // Brick Collision
      for (let j = this.bricks.length - 1; j >= 0; j--) {
        const brick = this.bricks[j];
        if (
          b.x + b.radius >= brick.x &&
          b.x - b.radius <= brick.x + brick.w &&
          b.y + b.radius >= brick.y &&
          b.y - b.radius <= brick.y + brick.h
        ) {
          // Determine collision face
          const prevX = b.x - b.vx;
          const prevY = b.y - b.vy;

          if (prevX < brick.x || prevX > brick.x + brick.w) {
            b.vx = -b.vx;
          } else {
            b.vy = -b.vy;
          }

          this.hitBrick(brick, j);
          break;
        }
      }

      // Fall off bottom edge
      if (b.y - b.radius > this.height) {
        this.balls.splice(i, 1);
      }
    }

    // If no balls remaining, lose a life
    if (this.balls.length === 0) {
      this.lives--;
      this.playLoseLifeSound();
      if (this.lives <= 0) {
        this.isGameOver = true;
        this.saveHighScore();
      } else {
        // Respawn ball
        this.laserActive = false;
        this.catchActive = false;
        this.expandActive = false;
        this.paddleWidth = this.normalPaddleWidth;
        this.balls = [{
          x: this.paddleX,
          y: this.paddleY - 7,
          vx: 0,
          vy: 0,
          radius: 4,
          speed: 4.2 + (this.round - 1) * 0.3,
          isStuck: true,
          stuckOffset: 0
        }];
      }
      this.notifyState();
    }

    // Check Round Clearance (Ignore gold bricks)
    const destructibleLeft = this.bricks.filter(b => b.type !== 'gold').length;
    if (destructibleLeft === 0) {
      this.advanceRound(false);
    }

    // Update Particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life -= 0.03;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  private hitBrick(brick: Brick, index: number) {
    if (brick.type === 'gold') {
      this.playBrickHitSound(true);
      this.createExplosion(brick.x + brick.w / 2, brick.y + brick.h / 2, '#d97706', 4);
      return;
    }

    brick.hitsLeft--;
    if (brick.hitsLeft <= 0) {
      this.score += brick.points;
      if (this.score > this.highScore) {
        this.highScore = this.score;
      }
      this.playBrickHitSound(false);
      this.createExplosion(brick.x + brick.w / 2, brick.y + brick.h / 2, brick.color, 8);

      // Spawn Power-Up Capsule if present
      if (brick.powerUp) {
        const labels: { [key: string]: { label: string; color: string } } = {
          L: { label: 'L', color: '#ef4444' }, // Red Laser
          E: { label: 'E', color: '#3b82f6' }, // Blue Expand
          C: { label: 'C', color: '#22c55e' }, // Green Catch
          S: { label: 'S', color: '#f97316' }, // Orange Slow
          D: { label: 'D', color: '#06b6d4' }, // Cyan Disruption
          B: { label: 'B', color: '#ec4899' }, // Pink Break/Warp
          P: { label: 'P', color: '#a855f7' }, // Purple Player Extra Life
        };
        const info = labels[brick.powerUp] || { label: 'L', color: '#ef4444' };
        this.capsules.push({
          x: brick.x + brick.w / 2 - 8,
          y: brick.y,
          w: 16,
          h: 8,
          type: brick.powerUp,
          color: info.color,
          label: info.label,
          vy: 1.6,
          rotation: 0
        });
      }

      this.bricks.splice(index, 1);
    } else {
      // Silver brick took 1 hit
      brick.color = '#cbd5e1';
      this.playBrickHitSound(true);
      this.createExplosion(brick.x + brick.w / 2, brick.y + brick.h / 2, '#94a3b8', 5);
    }

    this.notifyState();
  }

  private applyPowerUp(type: 'L' | 'E' | 'C' | 'S' | 'D' | 'B' | 'P') {
    this.playPowerupSound();
    this.score += 1000;

    // Reset standard buffs before applying new one
    this.laserActive = false;
    this.catchActive = false;
    this.expandActive = false;
    this.paddleWidth = this.normalPaddleWidth;

    if (type === 'L') {
      this.laserActive = true;
    } else if (type === 'E') {
      this.expandActive = true;
      this.paddleWidth = this.normalPaddleWidth * 1.5;
    } else if (type === 'C') {
      this.catchActive = true;
    } else if (type === 'S') {
      this.balls.forEach(b => {
        b.speed = Math.max(3.2, b.speed * 0.75);
        const curAngle = Math.atan2(b.vy, b.vx);
        b.vx = Math.cos(curAngle) * b.speed;
        b.vy = Math.sin(curAngle) * b.speed;
      });
    } else if (type === 'D') {
      // Multi-ball Disruption: spawn 2 extra balls
      if (this.balls.length > 0) {
        const base = this.balls[0];
        this.balls.push(
          {
            x: base.x,
            y: base.y,
            vx: base.speed * Math.cos(-Math.PI / 4),
            vy: -base.speed * Math.sin(Math.PI / 4),
            radius: base.radius,
            speed: base.speed,
            isStuck: false,
            stuckOffset: 0
          },
          {
            x: base.x,
            y: base.y,
            vx: -base.speed * Math.cos(-Math.PI / 4),
            vy: -base.speed * Math.sin(Math.PI / 4),
            radius: base.radius,
            speed: base.speed,
            isStuck: false,
            stuckOffset: 0
          }
        );
      }
    } else if (type === 'B') {
      // Break: Open warp gate
      this.warpOpen = true;
    } else if (type === 'P') {
      // Player life
      this.lives = Math.min(5, this.lives + 1);
    }

    this.notifyState();
  }

  private advanceRound(isWarp: boolean) {
    if (isWarp) {
      this.score += 10000;
      this.warpMessageTimer = 2.5;
    }
    this.playRoundWinSound();

    if (this.round >= this.maxRounds) {
      this.isGameWon = true;
      this.saveHighScore();
    } else {
      this.resetRound(this.round + 1);
    }
    this.notifyState();
  }

  private createExplosion(x: number, y: number, color: string, count: number) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const spd = 1 + Math.random() * 3;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd,
        color,
        size: 2 + Math.random() * 3,
        alpha: 1,
        life: 1
      });
    }
  }

  private saveHighScore() {
    if (this.score > this.highScore) {
      this.highScore = this.score;
      localStorage.setItem('arkanoid_high_score', this.score.toString());
    }
  }

  private notifyState() {
    if (this.onStateChangeCallback) {
      let activePow: 'none' | 'laser' | 'expand' | 'catch' | 'slow' = 'none';
      if (this.laserActive) activePow = 'laser';
      else if (this.expandActive) activePow = 'expand';
      else if (this.catchActive) activePow = 'catch';

      this.onStateChangeCallback({
        score: this.score,
        highScore: this.highScore,
        lives: this.lives,
        round: this.round,
        gameOver: this.isGameOver,
        gameWon: this.isGameWon,
        paused: this.isPaused,
        activePowerUp: activePow
      });
    }
  }

  // --- Render ---
  private render() {
    const ctx = this.ctx;
    ctx.fillStyle = '#05070f';
    ctx.fillRect(0, 0, this.width, this.height);

    // Grid Matrix Background
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1;
    for (let x = 16; x < this.width - 16; x += 16) {
      ctx.beginPath();
      ctx.moveTo(x, 24);
      ctx.lineTo(x, this.height);
      ctx.stroke();
    }
    for (let y = 24; y < this.height; y += 16) {
      ctx.beginPath();
      ctx.moveTo(16, y);
      ctx.lineTo(this.width - 16, y);
      ctx.stroke();
    }

    // Border Frame (Authentic Arcade Frame)
    ctx.fillStyle = '#334155';
    // Top border
    ctx.fillRect(0, 0, this.width, 24);
    // Left border
    ctx.fillRect(0, 0, 16, this.height);
    // Right border
    ctx.fillRect(this.width - 16, 0, 16, this.height);

    // Frame Highlights
    ctx.fillStyle = '#64748b';
    ctx.fillRect(14, 22, 2, this.height);
    ctx.fillRect(this.width - 16, 22, 2, this.height);
    ctx.fillRect(14, 22, this.width - 28, 2);

    // Warp Door on Right Border
    if (this.warpOpen) {
      ctx.fillStyle = '#ec4899';
      ctx.shadowColor = '#f472b6';
      ctx.shadowBlur = 10;
      ctx.fillRect(this.warpX, this.warpY, 12, 32);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 8px monospace';
      ctx.fillText('EXIT', this.warpX - 18, this.warpY + 18);
      ctx.shadowBlur = 0;
    }

    // Render Bricks
    this.bricks.forEach(b => {
      ctx.fillStyle = b.color;
      ctx.fillRect(b.x, b.y, b.w, b.h);

      // Bevel 3D effect
      ctx.fillStyle = 'rgba(255,255,255,0.45)';
      ctx.fillRect(b.x, b.y, b.w, 2);
      ctx.fillRect(b.x, b.y, 2, b.h);

      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.fillRect(b.x, b.y + b.h - 2, b.w, 2);
      ctx.fillRect(b.x + b.w - 2, b.y, 2, b.h);

      if (b.type === 'silver') {
        // Silver rivets
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(b.x + 3, b.y + 3, 2, 2);
        ctx.fillRect(b.x + b.w - 5, b.y + 3, 2, 2);
      } else if (b.type === 'gold') {
        // Gold metal pattern
        ctx.fillStyle = '#b45309';
        ctx.fillRect(b.x + 4, b.y + 2, b.w - 8, b.h - 4);
      }
    });

    // Render Powerup Capsules
    this.capsules.forEach(cap => {
      ctx.save();
      ctx.translate(cap.x + cap.w / 2, cap.y + cap.h / 2);
      ctx.rotate(cap.rotation);
      ctx.fillStyle = cap.color;
      ctx.beginPath();
      ctx.roundRect(-cap.w / 2, -cap.h / 2, cap.w, cap.h, 4);
      ctx.fill();

      // Pill label
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 9px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(cap.label, 0, 0);
      ctx.restore();
    });

    // Render Lasers
    ctx.fillStyle = '#ef4444';
    ctx.shadowColor = '#f87171';
    ctx.shadowBlur = 8;
    this.lasers.forEach(l => {
      ctx.fillRect(l.x, l.y, l.w, l.h);
    });
    ctx.shadowBlur = 0;

    // Render Enemies
    this.enemies.forEach(e => {
      ctx.save();
      ctx.translate(e.x, e.y);
      ctx.fillStyle = e.color;
      ctx.shadowColor = e.color;
      ctx.shadowBlur = 6;

      if (e.type === 'pyramid') {
        ctx.beginPath();
        ctx.moveTo(0, -e.size / 2);
        ctx.lineTo(e.size / 2, e.size / 2);
        ctx.lineTo(-e.size / 2, e.size / 2);
        ctx.closePath();
        ctx.fill();
      } else if (e.type === 'sphere') {
        ctx.beginPath();
        ctx.arc(0, 0, e.size / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(-2, -2, 4, 4);
      } else {
        ctx.fillRect(-e.size / 2, -e.size / 2, e.size, e.size);
      }
      ctx.restore();
    });

    // Render Vaus Paddle
    const halfW = this.paddleWidth / 2;
    ctx.save();
    ctx.translate(this.paddleX, this.paddleY);

    // Paddle base
    const grad = ctx.createLinearGradient(-halfW, 0, halfW, 0);
    if (this.laserActive) {
      grad.addColorStop(0, '#ef4444');
      grad.addColorStop(0.5, '#fca5a5');
      grad.addColorStop(1, '#ef4444');
    } else if (this.catchActive) {
      grad.addColorStop(0, '#10b981');
      grad.addColorStop(0.5, '#6ee7b7');
      grad.addColorStop(1, '#10b981');
    } else {
      grad.addColorStop(0, '#dc2626');
      grad.addColorStop(0.3, '#38bdf8');
      grad.addColorStop(0.7, '#38bdf8');
      grad.addColorStop(1, '#dc2626');
    }

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.roundRect(-halfW, 0, this.paddleWidth, this.paddleHeight, 6);
    ctx.fill();

    // Metallic center cap
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(-halfW + 6, 2, this.paddleWidth - 12, 3);

    // Laser nozzles if active
    if (this.laserActive) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-halfW + 4, -4, 4, 4);
      ctx.fillRect(halfW - 8, -4, 4, 4);
    }
    ctx.restore();

    // Render Balls
    this.balls.forEach(b => {
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.shadowBlur = 0;

    // Render Particles
    this.particles.forEach(p => {
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.life;
      ctx.fillRect(p.x, p.y, p.size, p.size);
    });
    ctx.globalAlpha = 1.0;

    // Header HUD Text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 10px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`1UP ${this.score.toString().padStart(6, '0')}`, 24, 16);
    ctx.textAlign = 'center';
    ctx.fillText(`HIGH ${this.highScore.toString().padStart(6, '0')}`, this.width / 2, 16);
    ctx.textAlign = 'right';
    ctx.fillText(`ROUND ${this.round}`, this.width - 24, 16);

    // Render Active Warp Gate
    if (this.warpOpen) {
      const pulse = (Math.sin(Date.now() / 120) + 1) / 2;
      ctx.fillStyle = `rgba(236, 72, 153, ${0.5 + pulse * 0.5})`;
      ctx.fillRect(this.width - 16, this.warpY, 16, 28);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 8px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('WARP', this.width - 8, this.warpY + 17);

      // On-screen notification
      ctx.fillStyle = '#ec4899';
      ctx.font = 'bold 8px monospace';
      ctx.fillText('⚡ WARP POORT ACTIEF (STUUR RECHTSOM VOOR +10.000) ⚡', this.width / 2, 34);
    }

    // Warp Bonus Toast Banner
    if (this.warpMessageTimer > 0) {
      this.warpMessageTimer -= 0.016;
      ctx.fillStyle = 'rgba(0,0,0,0.7)';
      ctx.fillRect(20, this.height / 2 - 20, this.width - 40, 36);
      ctx.strokeStyle = '#ec4899';
      ctx.lineWidth = 2;
      ctx.strokeRect(20, this.height / 2 - 20, this.width - 40, 36);

      ctx.fillStyle = '#f472b6';
      ctx.font = 'bold 13px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('★ WARP DOORGANG! +10.000 PTN ★', this.width / 2, this.height / 2 + 3);
    }

    // Footer Lives (Vaus icons)
    for (let i = 0; i < this.lives; i++) {
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(24 + i * 18, this.height - 12, 14, 4);
    }

    // Overlay Game Over / Win
    if (this.isGameOver) {
      ctx.fillStyle = 'rgba(0,0,0,0.8)';
      ctx.fillRect(0, 0, this.width, this.height);
      ctx.fillStyle = '#ef4444';
      ctx.font = 'bold 24px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('GAME OVER', this.width / 2, this.height / 2 - 20);
      ctx.fillStyle = '#ffffff';
      ctx.font = '12px monospace';
      ctx.fillText('PRESS SPACE OR TAP TO RESTART', this.width / 2, this.height / 2 + 15);
    } else if (this.isGameWon) {
      ctx.fillStyle = 'rgba(0,0,0,0.85)';
      ctx.fillRect(0, 0, this.width, this.height);
      ctx.fillStyle = '#eab308';
      ctx.font = 'bold 22px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('VICTORY!', this.width / 2, this.height / 2 - 30);
      ctx.fillStyle = '#38bdf8';
      ctx.font = '12px monospace';
      ctx.fillText('DOH HAS BEEN DEFEATED', this.width / 2, this.height / 2);
      ctx.fillStyle = '#ffffff';
      ctx.font = '11px monospace';
      ctx.fillText(`FINAL SCORE: ${this.score}`, this.width / 2, this.height / 2 + 25);
    }
  }
}
