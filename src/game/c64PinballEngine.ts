/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// 1989 Commodore 64 "3D Pinball Power" & Multi-Table Retro Physics Engine
// Authentic retro simulation with 3D perspective playfield, SID audio hooks,
// dynamic flipper angular momentum, sub-step collision detection, and anti-tunneling physics.

import { c64PinballAudio } from './c64PinballAudio';

export type PinballTableId = 'c64_power' | 'space_cadet' | 'cyber_neon' | 'medieval_dragon';

export interface PinballTableTheme {
  id: PinballTableId;
  name: string;
  year: string;
  bgCabinet: string;
  bgPlayfield: string;
  gridColor: string;
  accentColor: string;
  bumperColors: string[];
  dropTargetColor: string;
  sinkholeColor: string;
  sinkholeLabel: string;
  title: string;
  subtitle: string;
  marqueeBadge: string;
}

export const PINBALL_TABLES: Record<PinballTableId, PinballTableTheme> = {
  c64_power: {
    id: 'c64_power',
    name: '3D Pinball Power',
    year: '1989',
    bgCabinet: '#100c28',
    bgPlayfield: '#18123b',
    gridColor: 'rgba(103, 182, 189, 0.15)',
    accentColor: '#38bdf8',
    bumperColors: ['#facc15', '#facc15', '#ef4444'],
    dropTargetColor: '#ef4444',
    sinkholeColor: '#a855f7',
    sinkholeLabel: 'BLACK HOLE',
    title: '3D PINBALL POWER',
    subtitle: 'COMMODORE 64 • MASTERTRONIC 1989',
    marqueeBadge: 'MOS 6581 SID'
  },
  space_cadet: {
    id: 'space_cadet',
    name: 'Space Cadet 3D',
    year: '1995',
    bgCabinet: '#080918',
    bgPlayfield: '#0f142a',
    gridColor: 'rgba(56, 189, 248, 0.16)',
    accentColor: '#06b6d4',
    bumperColors: ['#38bdf8', '#818cf8', '#ec4899'],
    dropTargetColor: '#06b6d4',
    sinkholeColor: '#3b82f6',
    sinkholeLabel: 'WARP GATE',
    title: 'SPACE CADET 3D',
    subtitle: 'HYPERSPACE STATION • GALAXY ORBIT 1995',
    marqueeBadge: 'WARP CORE'
  },
  cyber_neon: {
    id: 'cyber_neon',
    name: 'Cyberpunk Neon City',
    year: '1992',
    bgCabinet: '#070512',
    bgPlayfield: '#140c24',
    gridColor: 'rgba(236, 72, 153, 0.16)',
    accentColor: '#ec4899',
    bumperColors: ['#f43f5e', '#ec4899', '#06b6d4'],
    dropTargetColor: '#f43f5e',
    sinkholeColor: '#10b981',
    sinkholeLabel: 'MAINFRAME',
    title: 'CYBERPUNK 2099',
    subtitle: 'SYNTHWAVE ARCADE • NEON MATRIX 1992',
    marqueeBadge: 'CYBER GRID'
  },
  medieval_dragon: {
    id: 'medieval_dragon',
    name: "Dragon's Castle",
    year: '1986',
    bgCabinet: '#120f0d',
    bgPlayfield: '#1f1917',
    gridColor: 'rgba(245, 158, 11, 0.15)',
    accentColor: '#f59e0b',
    bumperColors: ['#eab308', '#f97316', '#dc2626'],
    dropTargetColor: '#eab308',
    sinkholeColor: '#dc2626',
    sinkholeLabel: 'DRAGON LAIR',
    title: "DRAGON'S CASTLE",
    subtitle: 'MEDIEVAL QUEST • ROYAL ARCADE 1986',
    marqueeBadge: 'ROYAL GUILD'
  }
};

export interface Ball {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  inPlay: boolean;
  inSinkhole: boolean;
  sinkholeTimer: number;
  stuckFrames: number;
}

export interface Bumper {
  x: number;
  y: number;
  radius: number;
  points: number;
  color: string;
  flashTimer: number;
}

export interface DropTarget {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  isDown: boolean;
}

export interface RolloverLane {
  id: number;
  x: number;
  y: number;
  radius: number;
  isLit: boolean;
  label: string;
}

export interface PinballState {
  tableId: PinballTableId;
  score: number;
  highScore: number;
  ballNumber: number;
  maxBalls: number;
  multiplier: number;
  bonusPool: number;
  gameOver: boolean;
  isTilt: boolean;
  tiltWarnings: number;
  message: string;
  messageTimer: number;
  plungerCharge: number; // 0 to 1
  isPlungerCharging: boolean;
}

export class C64PinballEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  // Visual dimensions
  public readonly width = 460;
  public readonly height = 700;

  // Active Theme
  public currentTable: PinballTableTheme;

  // Ball
  public ball: Ball;

  // Game state
  public state: PinballState;

  // Controls state
  private leftFlipperPressed = false;
  private rightFlipperPressed = false;

  // Flipper angles & angular velocities (in radians)
  private leftFlipperAngle: number;
  private rightFlipperAngle: number;
  private prevLeftFlipperAngle: number;
  private prevRightFlipperAngle: number;
  private leftFlipperAngularVel = 0;
  private rightFlipperAngularVel = 0;

  private readonly flipperLength = 56;
  private readonly leftFlipperPivot = { x: 162, y: 612 };
  private readonly rightFlipperPivot = { x: 278, y: 612 };
  private readonly flipperRestAngle = 0.54; // ~31 deg down
  private readonly flipperActiveAngle = -0.46; // ~26 deg up

  // Bumpers (Pop Bumpers)
  public bumpers: Bumper[] = [];

  // Tombstone Drop Targets (Left Bank)
  public dropTargets: DropTarget[] = [];

  // Rollover Lanes (Top Arch)
  public rollovers: RolloverLane[] = [];

  // Sinkhole
  public readonly blackHole = { x: 120, y: 160, radius: 20 };

  // Callbacks
  public onStateChange?: (state: PinballState) => void;
  public onGameOver?: (finalScore: number) => void;

  // Animation frame
  private animationId: number | null = null;
  private isRunning = false;
  private gameOverReported = false;

  constructor(canvas: HTMLCanvasElement, initialHighScore: number = 185000, initialTable: PinballTableId = 'c64_power') {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.canvas.width = this.width;
    this.canvas.height = this.height;

    this.currentTable = PINBALL_TABLES[initialTable] || PINBALL_TABLES.c64_power;
    this.leftFlipperAngle = this.flipperRestAngle;
    this.rightFlipperAngle = -this.flipperRestAngle;
    this.prevLeftFlipperAngle = this.leftFlipperAngle;
    this.prevRightFlipperAngle = this.rightFlipperAngle;

    this.state = {
      tableId: this.currentTable.id,
      score: 0,
      highScore: Math.min(initialHighScore, 50000000),
      ballNumber: 1,
      maxBalls: 5,
      multiplier: 1,
      bonusPool: 1000,
      gameOver: false,
      isTilt: false,
      tiltWarnings: 0,
      message: 'PRESS LAUNCH OR SPACE',
      messageTimer: 180,
      plungerCharge: 0,
      isPlungerCharging: false
    };

    this.ball = {
      x: 418,
      y: 620,
      vx: 0,
      vy: 0,
      radius: 7.5,
      inPlay: false,
      inSinkhole: false,
      sinkholeTimer: 0,
      stuckFrames: 0
    };

    this.setupTableComponents();
  }

  public setTable(tableId: PinballTableId) {
    if (PINBALL_TABLES[tableId]) {
      this.currentTable = PINBALL_TABLES[tableId];
      this.state.tableId = tableId;
      this.setupTableComponents();
      this.showMessage(`TABLE: ${this.currentTable.name.toUpperCase()}`, 120);
      this.notifyState();
    }
  }

  private setupTableComponents() {
    const t = this.currentTable;
    this.bumpers = [
      { x: 175, y: 210, radius: 23, points: 100, color: t.bumperColors[0], flashTimer: 0 },
      { x: 265, y: 210, radius: 23, points: 100, color: t.bumperColors[1], flashTimer: 0 },
      { x: 220, y: 278, radius: 25, points: 250, color: t.bumperColors[2], flashTimer: 0 }
    ];

    this.dropTargets = [
      { id: 1, x: 74, y: 280, width: 8, height: 25, isDown: false },
      { id: 2, x: 74, y: 314, width: 8, height: 25, isDown: false },
      { id: 3, x: 74, y: 348, width: 8, height: 25, isDown: false }
    ];

    const labels = t.id === 'space_cadet' ? ['W', 'A', 'R'] : t.id === 'cyber_neon' ? ['C', 'Y', 'B'] : t.id === 'medieval_dragon' ? ['D', 'R', 'G'] : ['S', 'I', 'D'];
    this.rollovers = [
      { id: 1, x: 160, y: 110, radius: 10, isLit: false, label: labels[0] },
      { id: 2, x: 220, y: 95, radius: 10, isLit: false, label: labels[1] },
      { id: 3, x: 280, y: 110, radius: 10, isLit: false, label: labels[2] }
    ];
  }

  public start() {
    if (this.isRunning) return;
    this.isRunning = true;
    let lastTime = performance.now();

    const loop = (currentTime: number) => {
      if (!this.isRunning) return;
      const dt = Math.min((currentTime - lastTime) / 1000, 0.05);
      lastTime = currentTime;

      this.update(dt);
      this.render();

      this.animationId = requestAnimationFrame(loop);
    };

    this.animationId = requestAnimationFrame(loop);
  }

  public stop() {
    this.isRunning = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  // Flipper input
  public setLeftFlipper(pressed: boolean) {
    if (this.state.isTilt) return;
    if (pressed && !this.leftFlipperPressed) {
      c64PinballAudio.playFlipper();
    }
    this.leftFlipperPressed = pressed;
  }

  public setRightFlipper(pressed: boolean) {
    if (this.state.isTilt) return;
    if (pressed && !this.rightFlipperPressed) {
      c64PinballAudio.playFlipper();
    }
    this.rightFlipperPressed = pressed;
  }

  // Plunger controls
  public startPlunger() {
    if (this.ball.inPlay || this.state.gameOver) return;
    this.state.isPlungerCharging = true;
  }

  public releasePlunger() {
    if (!this.state.isPlungerCharging || this.ball.inPlay || this.state.gameOver) return;
    this.state.isPlungerCharging = false;
    const power = Math.max(0.4, this.state.plungerCharge);
    this.launchBall(power);
    this.state.plungerCharge = 0;
  }

  public triggerPlungerInstant() {
    if (this.ball.inPlay || this.state.gameOver) return;
    this.launchBall(0.95);
  }

  private launchBall(power: number) {
    this.ball.x = 418;
    this.ball.y = 590;
    this.ball.vx = 0;
    this.ball.vy = -12.5 - power * 5.5; // Controlled realistic launch speed
    this.ball.inPlay = true;
    this.ball.stuckFrames = 0;
    this.gameOverReported = false;
    c64PinballAudio.playPlungerRelease();
    this.showMessage('BALL IN PLAY!', 90);
  }

  // Nudge / Tilt mechanics
  public nudge() {
    if (this.state.gameOver || !this.ball.inPlay || this.state.isTilt) return;
    this.state.tiltWarnings++;
    c64PinballAudio.playSlingshot();

    // Add slight random impulse to ball
    this.ball.vx += (Math.random() - 0.5) * 3.5;
    this.ball.vy += -2.2;
    this.ball.stuckFrames = 0;

    if (this.state.tiltWarnings >= 3) {
      this.state.isTilt = true;
      this.showMessage('TILT! FLIPPERS DEAD', 180);
      c64PinballAudio.playTilt();
      this.leftFlipperPressed = false;
      this.rightFlipperPressed = false;
    } else {
      this.showMessage(`NUDGE WARNING (${this.state.tiltWarnings}/3)`, 60);
    }
  }

  public resetGame() {
    this.state.score = 0;
    this.state.ballNumber = 1;
    this.state.multiplier = 1;
    this.state.bonusPool = 1000;
    this.state.gameOver = false;
    this.state.isTilt = false;
    this.state.tiltWarnings = 0;
    this.gameOverReported = false;
    this.resetDropTargets();
    this.resetRollovers();
    this.resetBallToPlunger();
    this.showMessage('READY PLAYER 1', 120);
    this.notifyState();
  }

  private resetBallToPlunger() {
    this.ball.x = 418;
    this.ball.y = 620;
    this.ball.vx = 0;
    this.ball.vy = 0;
    this.ball.inPlay = false;
    this.ball.inSinkhole = false;
    this.ball.sinkholeTimer = 0;
    this.ball.stuckFrames = 0;
    this.state.isTilt = false;
    this.state.tiltWarnings = 0;
  }

  private resetDropTargets() {
    this.dropTargets.forEach(t => (t.isDown = false));
  }

  private resetRollovers() {
    this.rollovers.forEach(r => (r.isLit = false));
  }

  private showMessage(msg: string, durationFrames: number = 90) {
    this.state.message = msg;
    this.state.messageTimer = durationFrames;
    this.notifyState();
  }

  private addScore(points: number) {
    if (this.state.gameOver) return;
    const safePoints = Math.max(0, Math.floor(points));
    this.state.score = Math.min(50000000, this.state.score + safePoints);
    this.state.bonusPool = Math.min(50000, this.state.bonusPool + Math.floor(safePoints * 0.05));
    if (this.state.score > this.state.highScore) {
      this.state.highScore = this.state.score;
    }
    this.notifyState();
  }

  private notifyState() {
    if (this.onStateChange) {
      this.onStateChange({ ...this.state });
    }
  }

  // Physics update loop with sub-steps for precision
  private update(_dt: number) {
    // Message timer
    if (this.state.messageTimer > 0) {
      this.state.messageTimer--;
      if (this.state.messageTimer === 0) {
        this.state.message = '';
        this.notifyState();
      }
    }

    // Plunger charging
    if (this.state.isPlungerCharging) {
      this.state.plungerCharge = Math.min(1.0, this.state.plungerCharge + 0.03);
      this.notifyState();
    }

    // Animate bumpers flash
    this.bumpers.forEach(b => {
      if (b.flashTimer > 0) b.flashTimer--;
    });

    // Update Flipper Angles and compute angular velocity
    this.prevLeftFlipperAngle = this.leftFlipperAngle;
    this.prevRightFlipperAngle = this.rightFlipperAngle;

    const flipperSpeed = 0.40; // Fast responsive rotation
    if (this.leftFlipperPressed && !this.state.isTilt) {
      this.leftFlipperAngle = Math.max(this.flipperActiveAngle, this.leftFlipperAngle - flipperSpeed);
    } else {
      this.leftFlipperAngle = Math.min(this.flipperRestAngle, this.leftFlipperAngle + flipperSpeed * 0.65);
    }

    if (this.rightFlipperPressed && !this.state.isTilt) {
      this.rightFlipperAngle = Math.min(-this.flipperActiveAngle, this.rightFlipperAngle + flipperSpeed);
    } else {
      this.rightFlipperAngle = Math.max(-this.flipperRestAngle, this.rightFlipperAngle - flipperSpeed * 0.65);
    }

    this.leftFlipperAngularVel = this.leftFlipperAngle - this.prevLeftFlipperAngle;
    this.rightFlipperAngularVel = this.rightFlipperAngle - this.prevRightFlipperAngle;

    // If ball is not in play, wait for launch
    if (!this.ball.inPlay) return;

    // Handle Black Hole capture
    if (this.ball.inSinkhole) {
      this.ball.sinkholeTimer--;
      if (this.ball.sinkholeTimer <= 0) {
        // Eject ball downwards with realistic kick
        this.ball.inSinkhole = false;
        this.ball.x = this.blackHole.x + 10;
        this.ball.y = this.blackHole.y + 24;
        this.ball.vx = 2.5 + Math.random() * 3.5;
        this.ball.vy = 8.5;
        c64PinballAudio.playBlackHole();
      }
      return;
    }

    // 6 Sub-steps per frame for smooth, continuous collision detection (CCD)
    const SUB_STEPS = 6;
    const gravity = 0.20 / SUB_STEPS; // Natural pinball table tilt
    const friction = Math.pow(0.998, 1 / SUB_STEPS);
    const maxSpeed = 15.5; // Controlled pinball velocity

    for (let step = 0; step < SUB_STEPS; step++) {
      this.ball.vy += gravity;
      this.ball.vx *= friction;
      this.ball.vy *= friction;

      // Speed clamp
      const currentSpeed = Math.hypot(this.ball.vx, this.ball.vy);
      if (currentSpeed > maxSpeed) {
        this.ball.vx = (this.ball.vx / currentSpeed) * maxSpeed;
        this.ball.vy = (this.ball.vy / currentSpeed) * maxSpeed;
      }

      this.ball.x += this.ball.vx / SUB_STEPS;
      this.ball.y += this.ball.vy / SUB_STEPS;

      // 1. Collisions: Outer table bounds & Plunger lane gate
      this.checkOuterWallsCollision();

      // 2. Bumpers
      this.checkBumpersCollision();

      // 3. Drop Targets
      this.checkDropTargetsCollision();

      // 4. Rollovers
      this.checkRolloversCollision();

      // 5. Black Hole Sinkhole
      this.checkBlackHoleCollision();

      // 6. Slingshots
      this.checkSlingshotsCollision();

      // 7. Flippers
      this.checkFlippersCollision();

      // 8. Ball Drain check
      if (this.ball.y > 678) {
        this.handleBallDrain();
        break;
      }
    }

    // Anti-Stuck Watchdog: if ball moves too slowly in play for > 1.2 seconds, give a gentle nudge
    const ballSpeed = Math.hypot(this.ball.vx, this.ball.vy);
    if (this.ball.inPlay && ballSpeed < 0.20 && this.ball.y < 640 && !this.ball.inSinkhole) {
      this.ball.stuckFrames++;
      if (this.ball.stuckFrames > 70) {
        this.ball.stuckFrames = 0;
        this.ball.vx += (Math.random() > 0.5 ? 2.5 : -2.5);
        this.ball.vy += (this.ball.y > 540 ? -3.0 : 2.5);
        this.showMessage('ANTI-STUCK KICKBACK!', 60);
      }
    } else {
      this.ball.stuckFrames = 0;
    }
  }

  private checkOuterWallsCollision() {
    const b = this.ball;
    const plungerWallX = 398;

    // In plunger lane: ball travels up
    if (b.x > plungerWallX && b.y > 115) {
      if (b.x < plungerWallX + b.radius) {
        b.x = plungerWallX + b.radius;
        b.vx = -b.vx * 0.5;
      }
      if (b.x > 440 - b.radius) {
        b.x = 440 - b.radius;
        b.vx = -b.vx * 0.5;
      }
      return;
    }

    // Top curved arch (perspective arc from x: 60 to x: 440)
    if (b.y < 130) {
      const centerX = 220;
      const centerY = 130;
      const r = 180;
      const dist = Math.hypot(b.x - centerX, b.y - centerY);
      if (dist > r - b.radius && b.y < centerY) {
        const nx = (b.x - centerX) / dist;
        const ny = (b.y - centerY) / dist;
        b.x = centerX + nx * (r - b.radius);
        b.y = centerY + ny * (r - b.radius);
        const dot = b.vx * nx + b.vy * ny;
        b.vx = (b.vx - 2 * dot * nx) * 0.75;
        b.vy = (b.vy - 2 * dot * ny) * 0.75;
        c64PinballAudio.playRollover();
      }
    }

    // Left outer angled wall (perspective narrowing)
    if (b.x < 65 + b.radius && b.y < 530) {
      b.x = 65 + b.radius;
      b.vx = Math.abs(b.vx) * 0.75 + 0.8;
      c64PinballAudio.playRollover();
    }

    // Right outer angled wall
    if (b.x > plungerWallX - b.radius && b.y > 115 && b.y < 530) {
      b.x = plungerWallX - b.radius;
      b.vx = -Math.abs(b.vx) * 0.75 - 0.8;
      c64PinballAudio.playRollover();
    }

    // Left inlane guide towards left flipper: line from (65, 530) to (142, 595)
    this.collideWithLine(65, 530, 142, 595, 0.65);

    // Right inlane guide towards right flipper: line from (395, 530) to (298, 595)
    this.collideWithLine(395, 530, 298, 595, 0.65);

    // Left Outlane outer guide and sloped bottom (never stuck)
    this.collideWithLine(55, 530, 55, 620, 0.65);
    this.collideWithLine(55, 620, 100, 675, 0.65); // 45 degree slope guiding straight down to drain

    // Left Inlane/Outlane divider wire
    this.collideWithLine(95, 480, 95, 580, 0.65);

    // Right Outlane outer guide and sloped bottom
    this.collideWithLine(398, 530, 398, 620, 0.65);
    this.collideWithLine(398, 620, 345, 675, 0.65); // 45 degree slope guiding straight down to drain

    // Right Inlane/Outlane divider wire
    this.collideWithLine(355, 480, 355, 580, 0.65);
  }

  private checkBumpersCollision() {
    const b = this.ball;
    this.bumpers.forEach((bumper, idx) => {
      const dx = b.x - bumper.x;
      const dy = b.y - bumper.y;
      const dist = Math.hypot(dx, dy);
      const minDist = bumper.radius + b.radius;

      if (dist < minDist) {
        // Collision!
        const nx = dx / (dist || 1);
        const ny = dy / (dist || 1);

        // Separate
        b.x = bumper.x + nx * (minDist + 0.5);
        b.y = bumper.y + ny * (minDist + 0.5);

        // Energetic pop bumper bounce
        const kickSpeed = 9.5 + Math.random() * 2.5;
        b.vx = nx * kickSpeed;
        b.vy = ny * kickSpeed;

        bumper.flashTimer = 10;
        this.addScore(bumper.points * this.state.multiplier);
        c64PinballAudio.playBumper(idx);
      }
    });
  }

  private checkDropTargetsCollision() {
    const b = this.ball;
    this.dropTargets.forEach(target => {
      if (target.isDown) return;

      if (
        b.x + b.radius > target.x &&
        b.x - b.radius < target.x + target.width &&
        b.y + b.radius > target.y &&
        b.y - b.radius < target.y + target.height
      ) {
        target.isDown = true;
        b.vx = Math.abs(b.vx) * 0.75 + 2; // Bounce off rightwards
        this.addScore(250 * this.state.multiplier);
        c64PinballAudio.playDropTarget();

        // Check if all are down
        const allDown = this.dropTargets.every(t => t.isDown);
        if (allDown) {
          this.state.multiplier = Math.min(5, this.state.multiplier + 1);
          this.addScore(2500);
          this.showMessage(`BANK CLEARED! ${this.state.multiplier}X MULTIPLIER`, 120);
          c64PinballAudio.playFanfare();

          // Reset targets after delay
          setTimeout(() => {
            this.resetDropTargets();
          }, 1600);
        }
      }
    });
  }

  private checkRolloversCollision() {
    const b = this.ball;
    this.rollovers.forEach(lane => {
      const dist = Math.hypot(b.x - lane.x, b.y - lane.y);
      if (dist < lane.radius + b.radius && !lane.isLit) {
        lane.isLit = true;
        this.addScore(100);
        c64PinballAudio.playRollover();

        const allLit = this.rollovers.every(r => r.isLit);
        if (allLit) {
          this.addScore(5000);
          this.showMessage('EXTRA BONUS! 5,000 PTS', 120);
          c64PinballAudio.playFanfare();
          setTimeout(() => {
            this.resetRollovers();
          }, 2000);
        }
      }
    });
  }

  private checkBlackHoleCollision() {
    const b = this.ball;
    if (b.inSinkhole) return;

    const dx = b.x - this.blackHole.x;
    const dy = b.y - this.blackHole.y;
    const dist = Math.hypot(dx, dy);

    // Magnetic pull when near
    if (dist < 36 && dist > 12) {
      b.vx -= (dx / dist) * 0.5;
      b.vy -= (dy / dist) * 0.5;
    } else if (dist <= 12) {
      // Captured into sinkhole!
      b.inSinkhole = true;
      b.sinkholeTimer = 45; // 0.75 seconds
      b.vx = 0;
      b.vy = 0;
      b.x = this.blackHole.x;
      b.y = this.blackHole.y;

      const bonusAward = 1000 * this.state.multiplier;
      this.addScore(bonusAward);
      this.showMessage(`${this.currentTable.sinkholeLabel} BONUS! +${bonusAward.toLocaleString()}`, 90);
      c64PinballAudio.playBlackHole();
    }
  }

  private checkSlingshotsCollision() {
    // Left Slingshot angled line: from (118, 515) to (146, 578)
    if (this.collideWithLine(118, 515, 146, 578, 1.25)) {
      this.addScore(50);
      c64PinballAudio.playSlingshot();
    }

    // Right Slingshot angled line: from (332, 515) to (294, 578)
    if (this.collideWithLine(332, 515, 294, 578, 1.25)) {
      this.addScore(50);
      c64PinballAudio.playSlingshot();
    }
  }

  private checkFlippersCollision() {
    // Left Flipper
    const leftTipX = this.leftFlipperPivot.x + Math.cos(this.leftFlipperAngle) * this.flipperLength;
    const leftTipY = this.leftFlipperPivot.y + Math.sin(this.leftFlipperAngle) * this.flipperLength;

    const leftHit = this.collideWithFlipper(
      this.leftFlipperPivot.x,
      this.leftFlipperPivot.y,
      leftTipX,
      leftTipY,
      this.leftFlipperAngularVel,
      this.leftFlipperPressed && !this.state.isTilt,
      true
    );

    if (leftHit) {
      c64PinballAudio.playFlipper();
    }

    // Right Flipper
    const rightTipX = this.rightFlipperPivot.x - Math.cos(-this.rightFlipperAngle) * this.flipperLength;
    const rightTipY = this.rightFlipperPivot.y + Math.sin(-this.rightFlipperAngle) * this.flipperLength;

    const rightHit = this.collideWithFlipper(
      this.rightFlipperPivot.x,
      this.rightFlipperPivot.y,
      rightTipX,
      rightTipY,
      this.rightFlipperAngularVel,
      this.rightFlipperPressed && !this.state.isTilt,
      false
    );

    if (rightHit) {
      c64PinballAudio.playFlipper();
    }
  }

  private collideWithLine(x1: number, y1: number, x2: number, y2: number, elasticity: number): boolean {
    const b = this.ball;
    const dx = x2 - x1;
    const dy = y2 - y1;
    const lenSq = dx * dx + dy * dy;
    if (lenSq === 0) return false;

    // Projection scalar t of ball onto segment
    const t = Math.max(0, Math.min(1, ((b.x - x1) * dx + (b.y - y1) * dy) / lenSq));
    const projX = x1 + t * dx;
    const projY = y1 + t * dy;

    const dist = Math.hypot(b.x - projX, b.y - projY);
    if (dist < b.radius) {
      const nx = (b.x - projX) / (dist || 1);
      const ny = (b.y - projY) / (dist || 1);

      b.x = projX + nx * (b.radius + 0.1);
      b.y = projY + ny * (b.radius + 0.1);

      const dot = b.vx * nx + b.vy * ny;
      if (dot < 0) {
        b.vx -= (1 + elasticity) * dot * nx;
        b.vy -= (1 + elasticity) * dot * ny;
      }
      return true;
    }
    return false;
  }

  private collideWithFlipper(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    angularVel: number,
    isPressed: boolean,
    isLeft: boolean
  ): boolean {
    const b = this.ball;
    const dx = x2 - x1;
    const dy = y2 - y1;
    const lenSq = dx * dx + dy * dy;
    if (lenSq === 0) return false;

    // Flipper thickness (capsule)
    const flipperRadius = 5.0;
    const combinedRadius = b.radius + flipperRadius;

    const t = Math.max(0, Math.min(1, ((b.x - x1) * dx + (b.y - y1) * dy) / lenSq));
    const projX = x1 + t * dx;
    const projY = y1 + t * dy;

    const dist = Math.hypot(b.x - projX, b.y - projY);
    if (dist < combinedRadius) {
      // Normal vector
      let nx = -dy / Math.sqrt(lenSq);
      let ny = dx / Math.sqrt(lenSq);

      // Flipper top face normal must point generally upwards
      if (ny > 0) {
        nx = -nx;
        ny = -ny;
      }

      // Position pushout
      b.x = projX + nx * (combinedRadius + 0.2);
      b.y = projY + ny * (combinedRadius + 0.2);

      // Distance from pivot (0 at pivot, 1 at tip)
      const distFromPivot = t;

      // Determine if flipper is ACTIVELY SWINGING UP
      // Left flipper swings UP when angle is decreasing (angularVel < -0.05)
      // Right flipper swings UP when angle is increasing (angularVel > 0.05)
      const isActivelySwingingUp = isLeft ? angularVel < -0.04 : angularVel > 0.04;

      if (isActivelySwingingUp) {
        // DYNAMIC HIT: Transmit strong kinetic impulse based on impact location!
        const swingPower = Math.abs(angularVel) * 28;
        const tipBonus = 8.5 + distFromPivot * 7.5; // Tip hits much harder
        const impulseSpeed = Math.min(15.5, swingPower + tipBonus);

        // Impart energetic directional shot
        b.vx = nx * impulseSpeed * 0.45 + (isLeft ? 1 : -1) * (distFromPivot * 4.0);
        b.vy = -Math.abs(impulseSpeed);
      } else if (isPressed) {
        // FLIPPER IS HELD UP (CRADLING / TRAPPING):
        // Very low restitution so the ball rolls softly down or stays cradled in the pocket!
        const cradleRestitution = 0.25;
        const dot = b.vx * nx + b.vy * ny;
        if (dot < 0) {
          b.vx -= (1 + cradleRestitution) * dot * nx;
          b.vy -= (1 + cradleRestitution) * dot * ny;
        }

        // Allow ball to gently slide along the flipper incline
        const tangentX = isLeft ? -Math.cos(this.leftFlipperAngle) : Math.cos(-this.rightFlipperAngle);
        const tangentY = isLeft ? -Math.sin(this.leftFlipperAngle) : Math.sin(-this.rightFlipperAngle);
        b.vx += tangentX * 0.12;
        b.vy += tangentY * 0.12;
      } else {
        // FLIPPER IS RESTING DOWN (PASSIVE RUBBER BOUNCE):
        const restingRestitution = 0.48;
        const dot = b.vx * nx + b.vy * ny;
        if (dot < 0) {
          b.vx -= (1 + restingRestitution) * dot * nx;
          b.vy -= (1 + restingRestitution) * dot * ny;
        }
      }

      return true;
    }
    return false;
  }

  private handleBallDrain() {
    if (!this.ball.inPlay) return;

    // Immediately stop ball and flag out of play to prevent multiple triggers
    this.ball.inPlay = false;
    this.ball.vx = 0;
    this.ball.vy = 0;
    this.ball.x = 418;
    this.ball.y = 620;

    c64PinballAudio.playDrain();

    // Calculate end-of-ball bonus cleanly without exponential growth
    const earnedBonus = Math.min(25000, this.state.bonusPool) * Math.min(5, this.state.multiplier);
    this.state.score = Math.min(50000000, this.state.score + earnedBonus);
    if (this.state.score > this.state.highScore) {
      this.state.highScore = this.state.score;
    }

    if (this.state.ballNumber < this.state.maxBalls) {
      this.state.ballNumber++;
      this.state.multiplier = 1;
      this.state.bonusPool = 1000;
      this.showMessage(`BALL ${this.state.ballNumber} OF ${this.state.maxBalls}`, 150);
      this.resetBallToPlunger();
      this.notifyState();
    } else {
      // Game Over
      this.state.gameOver = true;
      this.showMessage('GAME OVER', 300);
      c64PinballAudio.playFanfare();
      this.notifyState();
      if (!this.gameOverReported && this.onGameOver) {
        this.gameOverReported = true;
        this.onGameOver(this.state.score);
      }
    }
  }

  // Canvas Rendering (Authentic Multi-Table 3D Wireframe Perspective)
  public render() {
    const ctx = this.ctx;
    ctx.save();

    const t = this.currentTable;

    // Deep border / cabinet background
    ctx.fillStyle = t.bgCabinet;
    ctx.fillRect(0, 0, this.width, this.height);

    // 3D Perspective Cabinet Depth Rails
    this.draw3DCabinetPerspective(ctx);

    // Playfield Surface & Wireframe Grid
    this.drawPlayfieldSurface(ctx);

    // Rollovers & Black Hole
    this.drawRollovers(ctx);
    this.drawBlackHole(ctx);

    // Bumpers
    this.drawBumpers(ctx);

    // Drop Targets
    this.drawDropTargets(ctx);

    // Slingshots
    this.drawSlingshots(ctx);

    // Inlanes & Guides
    this.drawInlanes(ctx);

    // Flippers
    this.drawFlippers(ctx);

    // Plunger Lane & Spring
    this.drawPlungerLane(ctx);

    // Ball with dynamic metallic highlight and shadow
    if (this.ball.inPlay || !this.state.gameOver) {
      this.drawBall(ctx);
    }

    // In-canvas HUD
    this.drawHUD(ctx);

    ctx.restore();
  }

  private draw3DCabinetPerspective(ctx: CanvasRenderingContext2D) {
    const t = this.currentTable;
    // Angled perspective side rails
    ctx.fillStyle = t.id === 'space_cadet' ? '#131b38' : t.id === 'cyber_neon' ? '#210d32' : t.id === 'medieval_dragon' ? '#2a221f' : '#1e1454';
    ctx.beginPath();
    ctx.moveTo(35, 70);
    ctx.lineTo(55, 90);
    ctx.lineTo(45, 660);
    ctx.lineTo(15, 680);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = t.accentColor;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Right cabinet border
    ctx.beginPath();
    ctx.moveTo(425, 70);
    ctx.lineTo(405, 90);
    ctx.lineTo(415, 660);
    ctx.lineTo(445, 680);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Top arch perspective rim
    ctx.beginPath();
    ctx.arc(220, 130, 182, Math.PI, 2 * Math.PI, false);
    ctx.strokeStyle = t.accentColor;
    ctx.lineWidth = 3;
    ctx.stroke();
  }

  private drawPlayfieldSurface(ctx: CanvasRenderingContext2D) {
    const t = this.currentTable;
    // Playfield background
    ctx.fillStyle = t.bgPlayfield;
    ctx.beginPath();
    ctx.arc(220, 130, 178, Math.PI, 2 * Math.PI, false);
    ctx.lineTo(398, 620);
    ctx.lineTo(55, 620);
    ctx.closePath();
    ctx.fill();

    // Retro 3D perspective wireframe grid lines
    ctx.strokeStyle = t.gridColor;
    ctx.lineWidth = 1;

    // Horizontal perspective grid lines
    for (let y = 140; y <= 580; y += 35) {
      const scale = 0.75 + (y / 580) * 0.25;
      const w = 340 * scale;
      ctx.beginPath();
      ctx.moveTo(220 - w / 2, y);
      ctx.lineTo(220 + w / 2, y);
      ctx.stroke();
    }

    // Radial perspective lines converging to vanishing point above
    for (let x = -140; x <= 140; x += 35) {
      ctx.beginPath();
      ctx.moveTo(220 + x * 0.7, 90);
      ctx.lineTo(220 + x * 1.3, 620);
      ctx.stroke();
    }

    // Central retro logo graphic on table
    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.font = '900 28px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(t.title, 220, 390);
    ctx.font = '700 11px monospace';
    ctx.fillStyle = t.accentColor;
    ctx.fillText(t.subtitle, 220, 412);
  }

  private drawBumpers(ctx: CanvasRenderingContext2D) {
    this.bumpers.forEach(bumper => {
      ctx.save();
      const isFlashing = bumper.flashTimer > 0;

      // Outer drop shadow
      ctx.shadowColor = isFlashing ? '#ffffff' : 'rgba(0,0,0,0.6)';
      ctx.shadowBlur = isFlashing ? 18 : 6;

      // Base ring
      ctx.beginPath();
      ctx.arc(bumper.x, bumper.y, bumper.radius, 0, Math.PI * 2);
      ctx.fillStyle = isFlashing ? '#ffffff' : '#221b44';
      ctx.fill();
      ctx.strokeStyle = isFlashing ? '#ffe040' : bumper.color;
      ctx.lineWidth = 3;
      ctx.stroke();

      // Middle ring
      ctx.beginPath();
      ctx.arc(bumper.x, bumper.y, bumper.radius * 0.65, 0, Math.PI * 2);
      ctx.fillStyle = isFlashing ? '#fef08a' : bumper.color;
      ctx.fill();

      // Inner bulb
      ctx.beginPath();
      ctx.arc(bumper.x - 3, bumper.y - 3, bumper.radius * 0.3, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();

      // Score label
      ctx.fillStyle = '#000000';
      ctx.font = '900 10px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${bumper.points}`, bumper.x, bumper.y);

      ctx.restore();
    });
  }

  private drawDropTargets(ctx: CanvasRenderingContext2D) {
    const t = this.currentTable;
    this.dropTargets.forEach(target => {
      ctx.save();
      if (!target.isDown) {
        // Upright target
        ctx.fillStyle = '#e2e8f0';
        ctx.fillRect(target.x, target.y, target.width, target.height);
        ctx.strokeStyle = t.dropTargetColor;
        ctx.lineWidth = 2;
        ctx.strokeRect(target.x, target.y, target.width, target.height);

        // Center stripe
        ctx.fillStyle = t.dropTargetColor;
        ctx.fillRect(target.x + 2, target.y + 7, target.width - 4, target.height - 14);
      } else {
        // Dropped slot
        ctx.fillStyle = '#080614';
        ctx.fillRect(target.x, target.y, target.width, target.height);
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 1;
        ctx.strokeRect(target.x, target.y, target.width, target.height);
      }
      ctx.restore();
    });
  }

  private drawRollovers(ctx: CanvasRenderingContext2D) {
    const t = this.currentTable;
    this.rollovers.forEach(lane => {
      ctx.save();
      ctx.beginPath();
      ctx.arc(lane.x, lane.y, lane.radius, 0, Math.PI * 2);
      ctx.fillStyle = lane.isLit ? '#fbbf24' : '#1e1b4b';
      ctx.fill();
      ctx.strokeStyle = lane.isLit ? '#fef08a' : t.accentColor;
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = lane.isLit ? '#000000' : '#e2e8f0';
      ctx.font = '900 11px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(lane.label, lane.x, lane.y);
      ctx.restore();
    });
  }

  private drawBlackHole(ctx: CanvasRenderingContext2D) {
    const t = this.currentTable;
    ctx.save();
    ctx.beginPath();
    ctx.arc(this.blackHole.x, this.blackHole.y, this.blackHole.radius, 0, Math.PI * 2);
    ctx.fillStyle = '#000000';
    ctx.fill();
    ctx.strokeStyle = t.sinkholeColor;
    ctx.lineWidth = 3;
    ctx.stroke();

    // Swirling rings
    ctx.beginPath();
    ctx.arc(this.blackHole.x, this.blackHole.y, this.blackHole.radius * 0.6, 0, Math.PI * 2);
    ctx.strokeStyle = t.accentColor;
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = t.accentColor;
    ctx.font = '800 7.5px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(t.sinkholeLabel, this.blackHole.x, this.blackHole.y + 27);
    ctx.restore();
  }

  private drawSlingshots(ctx: CanvasRenderingContext2D) {
    const t = this.currentTable;
    ctx.save();
    ctx.fillStyle = '#1c1538';
    ctx.strokeStyle = t.dropTargetColor;
    ctx.lineWidth = 3;

    // Left Slingshot
    ctx.beginPath();
    ctx.moveTo(118, 515);
    ctx.lineTo(146, 578);
    ctx.lineTo(118, 578);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Right Slingshot
    ctx.beginPath();
    ctx.moveTo(332, 515);
    ctx.lineTo(294, 578);
    ctx.lineTo(332, 578);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  private drawInlanes(ctx: CanvasRenderingContext2D) {
    const t = this.currentTable;
    ctx.save();
    ctx.strokeStyle = t.accentColor;
    ctx.lineWidth = 3;

    // Left guides
    ctx.beginPath();
    ctx.moveTo(65, 530);
    ctx.lineTo(142, 595);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(95, 480);
    ctx.lineTo(95, 580);
    ctx.stroke();

    // Left Outlane bottom ramp to drain
    ctx.beginPath();
    ctx.moveTo(55, 530);
    ctx.lineTo(55, 620);
    ctx.lineTo(100, 675);
    ctx.stroke();

    // Right guides
    ctx.beginPath();
    ctx.moveTo(395, 530);
    ctx.lineTo(298, 595);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(355, 480);
    ctx.lineTo(355, 580);
    ctx.stroke();

    // Right Outlane bottom ramp to drain
    ctx.beginPath();
    ctx.moveTo(398, 530);
    ctx.lineTo(398, 620);
    ctx.lineTo(345, 675);
    ctx.stroke();

    ctx.restore();
  }

  private drawFlippers(ctx: CanvasRenderingContext2D) {
    ctx.save();

    // Left Flipper
    const leftTipX = this.leftFlipperPivot.x + Math.cos(this.leftFlipperAngle) * this.flipperLength;
    const leftTipY = this.leftFlipperPivot.y + Math.sin(this.leftFlipperAngle) * this.flipperLength;

    ctx.shadowColor = '#eab308';
    ctx.shadowBlur = 8;
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 8;
    ctx.lineCap = 'round';

    ctx.beginPath();
    ctx.moveTo(this.leftFlipperPivot.x, this.leftFlipperPivot.y);
    ctx.lineTo(leftTipX, leftTipY);
    ctx.stroke();

    // Flipper pivot cap
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(this.leftFlipperPivot.x, this.leftFlipperPivot.y, 6, 0, Math.PI * 2);
    ctx.fill();

    // Right Flipper
    const rightTipX = this.rightFlipperPivot.x - Math.cos(-this.rightFlipperAngle) * this.flipperLength;
    const rightTipY = this.rightFlipperPivot.y + Math.sin(-this.rightFlipperAngle) * this.flipperLength;

    ctx.beginPath();
    ctx.moveTo(this.rightFlipperPivot.x, this.rightFlipperPivot.y);
    ctx.lineTo(rightTipX, rightTipY);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(this.rightFlipperPivot.x, this.rightFlipperPivot.y, 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  private drawPlungerLane(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(398, 120);
    ctx.lineTo(398, 660);
    ctx.stroke();

    // Spring graphic at bottom
    const springY = 640 + this.state.plungerCharge * 20;
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(412, springY, 14, 25);
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 2;
    ctx.strokeRect(412, springY, 14, 25);
    ctx.restore();
  }

  private drawBall(ctx: CanvasRenderingContext2D) {
    if (this.ball.inSinkhole) return;

    ctx.save();
    // Drop shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.beginPath();
    ctx.ellipse(this.ball.x + 2, this.ball.y + 3, this.ball.radius, this.ball.radius * 0.7, 0, 0, Math.PI * 2);
    ctx.fill();

    // Chrome sphere gradient
    const grad = ctx.createRadialGradient(
      this.ball.x - 2,
      this.ball.y - 2,
      1,
      this.ball.x,
      this.ball.y,
      this.ball.radius
    );
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(0.35, '#e2e8f0');
    grad.addColorStop(0.85, '#94a3b8');
    grad.addColorStop(1, '#475569');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(this.ball.x, this.ball.y, this.ball.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();
  }

  private drawHUD(ctx: CanvasRenderingContext2D) {
    const t = this.currentTable;
    ctx.save();
    // Top marquee border
    ctx.fillStyle = '#08051a';
    ctx.fillRect(0, 0, this.width, 50);
    ctx.strokeStyle = t.accentColor;
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, this.width, 50);

    // Left score
    ctx.font = '900 13px monospace';
    ctx.fillStyle = '#facc15';
    ctx.textAlign = 'left';
    ctx.fillText(`SCORE: ${this.state.score.toLocaleString()}`, 12, 22);

    ctx.font = '700 10px monospace';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText(`BALL: ${this.state.ballNumber}/${this.state.maxBalls}  ${this.state.multiplier}X MULTI`, 12, 38);

    // Right High score
    ctx.textAlign = 'right';
    ctx.fillStyle = t.accentColor;
    ctx.fillText(`HIGH: ${this.state.highScore.toLocaleString()}`, this.width - 12, 22);

    ctx.fillStyle = '#a855f7';
    ctx.fillText(`BONUS: ${this.state.bonusPool.toLocaleString()}`, this.width - 12, 38);

    // Active message banner
    if (this.state.message) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.88)';
      ctx.fillRect(35, 290, this.width - 70, 42);
      ctx.strokeStyle = this.state.isTilt ? '#ef4444' : '#facc15';
      ctx.lineWidth = 2;
      ctx.strokeRect(35, 290, this.width - 70, 42);

      ctx.fillStyle = this.state.isTilt ? '#f87171' : '#fef08a';
      ctx.font = '900 12px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(this.state.message, this.width / 2, 316);
    }

    ctx.restore();
  }
}
