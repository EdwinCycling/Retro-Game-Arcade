/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Frogger (Atari 2600 / Arcade 1982) Simulation Engine
 */

import { FroggerGameState, Lane, HomeBay, Particle, RiverObstacle, RoadObstacle } from './froggerTypes';
import { froggerAudio } from './froggerAudio';
import { isFroggerHighScore } from './froggerHighScores';

export const CANVAS_WIDTH = 448;
export const CANVAS_HEIGHT = 512;
export const ROW_HEIGHT = 32;
export const COL_WIDTH = 32;

// Home bay X positions (centers)
export const HOME_X_POSITIONS = [24, 114, 208, 302, 392];

export interface FrogState {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  gridCol: number;
  gridRow: number; // 0 to 12
  dir: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
  isHopping: boolean;
  hopProgress: number; // 0 to 1
  animFrame: number;
  highestRowReached: number;
}

export class FroggerEngine {
  public gameState: FroggerGameState = 'TITLE';
  public score: number = 0;
  public highScore: number = 0;
  public lives: number = 3;
  public level: number = 1;
  public timeRemaining: number = 30; // seconds
  public maxTime: number = 30;
  public frog: FrogState;
  public lanes: Lane[] = [];
  public homeBays: HomeBay[] = [];
  public particles: Particle[] = [];
  public deathReason: 'SQUASH' | 'DROWN' | 'TIME' | 'BANK' | null = null;
  public deathTimer: number = 0;
  public levelClearTimer: number = 0;

  // Atari 2600 mode toggle
  public isAtariMode: boolean = false;

  private subscribers: (() => void)[] = [];
  private timeTickAccumulator: number = 0;
  private flySpawnTimer: number = 0;

  constructor() {
    this.frog = this.createInitialFrog();
    this.initHomeBays();
    this.initLanes();
  }

  public subscribe(cb: () => void) {
    this.subscribers.push(cb);
    return () => {
      this.subscribers = this.subscribers.filter(s => s !== cb);
    };
  }

  private notify() {
    this.subscribers.forEach(cb => cb());
  }

  public createInitialFrog(): FrogState {
    return {
      x: 7 * COL_WIDTH,
      y: 12 * ROW_HEIGHT + 32, // Row 12
      targetX: 7 * COL_WIDTH,
      targetY: 12 * ROW_HEIGHT + 32,
      gridCol: 7,
      gridRow: 12,
      dir: 'UP',
      isHopping: false,
      hopProgress: 0,
      animFrame: 0,
      highestRowReached: 12,
    };
  }

  public initHomeBays() {
    this.homeBays = HOME_X_POSITIONS.map((x, index) => ({
      index,
      x,
      isFilled: false,
      hasFly: false,
      flyTimer: 0,
      hasCroc: false,
      crocTimer: 0,
    }));
  }

  public initLanes() {
    const speedScale = 1 + (this.level - 1) * 0.15;

    this.lanes = [
      // Row 0: Homes (no moving obstacles)
      { row: 0, y: 32, speed: 0, type: 'SAFE', items: [] },

      // RIVER LANES (Rows 1 to 5)
      // Row 1: Fast small logs (moving right)
      {
        row: 1,
        y: 64,
        speed: 1.4 * speedScale,
        type: 'RIVER_LOG_SHORT',
        items: [
          { x: 30, width: 85, type: 'log_short' },
          { x: 180, width: 85, type: 'log_short' },
          { x: 330, width: 85, type: 'log_short' },
        ] as RiverObstacle[],
      },
      // Row 2: Diving turtles x 3 (moving left)
      {
        row: 2,
        y: 96,
        speed: -1.2 * speedScale,
        type: 'RIVER_TURTLES_3',
        items: [
          { x: 50, width: 96, type: 'turtles_3', isDiving: true, diveState: 0 },
          { x: 210, width: 96, type: 'turtles_3', isDiving: false, diveState: 0 },
          { x: 360, width: 96, type: 'turtles_3', isDiving: true, diveState: 0 },
        ] as RiverObstacle[],
      },
      // Row 3: Long logs (moving right)
      {
        row: 3,
        y: 128,
        speed: 1.8 * speedScale,
        type: 'RIVER_LOG_LONG',
        items: [
          { x: 20, width: 170, type: 'log_long' },
          { x: 250, width: 170, type: 'log_long' },
        ] as RiverObstacle[],
      },
      // Row 4: Turtles x 2 (moving left)
      {
        row: 4,
        y: 160,
        speed: -1.0 * speedScale,
        type: 'RIVER_TURTLES_2',
        items: [
          { x: 40, width: 64, type: 'turtles_2', isDiving: true, diveState: 0 },
          { x: 150, width: 64, type: 'turtles_2', isDiving: false, diveState: 0 },
          { x: 260, width: 64, type: 'turtles_2', isDiving: true, diveState: 0 },
          { x: 370, width: 64, type: 'turtles_2', isDiving: false, diveState: 0 },
        ] as RiverObstacle[],
      },
      // Row 5: Medium logs (moving right)
      {
        row: 5,
        y: 192,
        speed: 1.1 * speedScale,
        type: 'RIVER_LOG_MED',
        items: [
          { x: 20, width: 115, type: 'log_med' },
          { x: 180, width: 115, type: 'log_med' },
          { x: 330, width: 115, type: 'log_med' },
        ] as RiverObstacle[],
      },

      // Row 6: Middle sidewalk safe strip
      { row: 6, y: 224, speed: 0, type: 'SAFE', items: [] },

      // HIGHWAY LANES (Rows 7 to 11)
      // Row 7: Big heavy trucks (moving left)
      {
        row: 7,
        y: 256,
        speed: -1.0 * speedScale,
        type: 'ROAD_TRUCK',
        items: [
          { x: 60, width: 75, type: 'truck' },
          { x: 220, width: 75, type: 'truck' },
          { x: 380, width: 75, type: 'truck' },
        ] as RoadObstacle[],
      },
      // Row 8: Fast race cars (moving right)
      {
        row: 8,
        y: 288,
        speed: 2.3 * speedScale,
        type: 'ROAD_RACECAR',
        items: [
          { x: 40, width: 36, type: 'racecar' },
          { x: 240, width: 36, type: 'racecar' },
        ] as RoadObstacle[],
      },
      // Row 9: Pink bug sedans (moving left)
      {
        row: 9,
        y: 320,
        speed: -1.4 * speedScale,
        type: 'ROAD_CAR_1',
        items: [
          { x: 40, width: 38, type: 'car_pink' },
          { x: 180, width: 38, type: 'car_pink' },
          { x: 320, width: 38, type: 'car_pink' },
        ] as RoadObstacle[],
      },
      // Row 10: Slow tractors / bulldozers (moving right)
      {
        row: 10,
        y: 352,
        speed: 0.9 * speedScale,
        type: 'ROAD_TRACTOR',
        items: [
          { x: 50, width: 40, type: 'tractor' },
          { x: 190, width: 40, type: 'tractor' },
          { x: 330, width: 40, type: 'tractor' },
        ] as RoadObstacle[],
      },
      // Row 11: Yellow vintage cars (moving left)
      {
        row: 11,
        y: 384,
        speed: -1.3 * speedScale,
        type: 'ROAD_CAR_2',
        items: [
          { x: 30, width: 38, type: 'car_yellow' },
          { x: 170, width: 38, type: 'car_yellow' },
          { x: 310, width: 38, type: 'car_yellow' },
        ] as RoadObstacle[],
      },

      // Row 12: Starting safe grass/curb
      { row: 12, y: 416, speed: 0, type: 'SAFE', items: [] },
    ];
  }

  public startGame() {
    this.score = 0;
    this.lives = 3;
    this.level = 1;
    this.timeRemaining = 30;
    this.initHomeBays();
    this.initLanes();
    this.frog = this.createInitialFrog();
    this.gameState = 'PLAYING';
    this.particles = [];
    this.notify();
  }

  public setLevel(lvl: number) {
    this.level = Math.max(1, Math.min(5, lvl));
    this.timeRemaining = Math.max(20, 32 - (this.level - 1) * 2);
    this.maxTime = this.timeRemaining;
    this.initHomeBays();
    this.initLanes();
    this.frog = this.createInitialFrog();
    this.gameState = 'PLAYING';
    this.notify();
  }

  public handleInput(direction: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT') {
    if (this.gameState === 'TITLE') {
      this.startGame();
      return;
    }

    if (this.gameState !== 'PLAYING') return;
    if (this.frog.isHopping) return;

    let targetCol = this.frog.gridCol;
    let targetRow = this.frog.gridRow;

    switch (direction) {
      case 'UP':
        targetRow = Math.max(0, targetRow - 1);
        break;
      case 'DOWN':
        targetRow = Math.min(12, targetRow + 1);
        break;
      case 'LEFT':
        targetCol = Math.max(0, targetCol - 1);
        break;
      case 'RIGHT':
        targetCol = Math.min(13, targetCol + 1);
        break;
    }

    // Initiate hop
    this.frog.dir = direction;
    this.frog.isHopping = true;
    this.frog.hopProgress = 0;
    this.frog.gridCol = targetCol;
    this.frog.gridRow = targetRow;
    this.frog.targetX = targetCol * COL_WIDTH;
    this.frog.targetY = targetRow * ROW_HEIGHT + 32;

    froggerAudio.playHop();

    // Reward points for hopping forward to a new highest row
    if (targetRow < this.frog.highestRowReached) {
      this.score += 10;
      this.frog.highestRowReached = targetRow;
      if (this.score > this.highScore) {
        this.highScore = this.score;
      }
    }
  }

  public update(dt: number) {
    if (this.gameState === 'TITLE') return;

    // Handle Dying animation
    if (this.gameState === 'DYING') {
      this.deathTimer -= dt;
      this.updateParticles(dt);
      if (this.deathTimer <= 0) {
        this.lives--;
        if (this.lives <= 0) {
          this.gameState = 'GAME_OVER';
          froggerAudio.playGameOver();
          this.notify();
        } else {
          this.respawnFrog();
        }
      }
      return;
    }

    // Handle Level Cleared celebration
    if (this.gameState === 'LEVEL_CLEARED') {
      this.levelClearTimer -= dt;
      this.updateParticles(dt);
      if (this.levelClearTimer <= 0) {
        this.level++;
        this.initHomeBays();
        this.initLanes();
        this.respawnFrog();
      }
      return;
    }

    // 1. Update Timer countdown
    this.timeTickAccumulator += dt;
    if (this.timeTickAccumulator >= 1.0) {
      this.timeTickAccumulator -= 1.0;
      this.timeRemaining = Math.max(0, this.timeRemaining - 1);

      if (this.timeRemaining <= 5 && this.timeRemaining > 0) {
        froggerAudio.playTimeAlert();
      } else if (this.timeRemaining === 0) {
        this.killFrog('TIME');
        return;
      }
    }

    // 2. Update Obstacle Lanes
    this.updateLanes(dt);

    // 3. Update Home Bay bonus fly & croc appearances
    this.updateHomeBays(dt);

    // 4. Update Frog Hopping movement
    this.updateFrogMovement(dt);

    // 5. Update Collision & Water Carry
    if (!this.frog.isHopping && this.gameState === 'PLAYING') {
      this.checkCollisionsAndRiding();
    }

    // 6. Update visual particles
    this.updateParticles(dt);
  }

  private updateLanes(dt: number) {
    for (const lane of this.lanes) {
      if (lane.speed === 0) continue;

      const movement = lane.speed * (dt * 60);

      for (const item of lane.items) {
        item.x += movement;

        // Wrap around seamlessly
        if (lane.speed > 0 && item.x > CANVAS_WIDTH + 20) {
          item.x = -item.width - 20;
        } else if (lane.speed < 0 && item.x < -item.width - 20) {
          item.x = CANVAS_WIDTH + 20;
        }

        // Handle diving turtles
        if ('isDiving' in item && item.isDiving) {
          const cycleTime = (performance.now() / 1000) % 4.0;
          if (cycleTime > 3.0) {
            item.diveState = 2; // Submerged!
          } else if (cycleTime > 2.4) {
            item.diveState = 1; // Warning bubble
          } else {
            item.diveState = 0; // Floating
          }
        }
      }
    }
  }

  private updateHomeBays(dt: number) {
    this.flySpawnTimer += dt;
    if (this.flySpawnTimer > 6.0) {
      this.flySpawnTimer = 0;
      // Randomly spawn fly on unfilled home bay
      const unfilled = this.homeBays.filter(h => !h.isFilled);
      if (unfilled.length > 0) {
        const pick = unfilled[Math.floor(Math.random() * unfilled.length)];
        pick.hasFly = true;
        pick.flyTimer = 4.0; // flies stay for 4 seconds
      }
    }

    for (const bay of this.homeBays) {
      if (bay.hasFly) {
        bay.flyTimer -= dt;
        if (bay.flyTimer <= 0) bay.hasFly = false;
      }
    }
  }

  private updateFrogMovement(dt: number) {
    const f = this.frog;
    if (f.isHopping) {
      f.hopProgress += dt * 8.5; // ~7 frames per hop
      if (f.hopProgress >= 1.0) {
        f.hopProgress = 1.0;
        f.isHopping = false;
        f.x = f.targetX;
        f.y = f.targetY;
        f.animFrame = 0;

        // Check if safely landed in Home row (Row 0)
        if (f.gridRow === 0) {
          this.checkHomeLanding();
        }
      } else {
        f.x = f.targetX * f.hopProgress + f.x * (1 - f.hopProgress);
        f.y = f.targetY * f.hopProgress + f.y * (1 - f.hopProgress);
        f.animFrame = f.hopProgress < 0.5 ? 1 : 2;
      }
    }
  }

  private checkHomeLanding() {
    const f = this.frog;
    const frogCenterX = f.x + COL_WIDTH / 2;

    // Check distance to all 5 bays
    let landedBay: HomeBay | null = null;
    for (const bay of this.homeBays) {
      const bayCenterX = bay.x + 18;
      if (Math.abs(frogCenterX - bayCenterX) < 18) {
        landedBay = bay;
        break;
      }
    }

    if (landedBay && !landedBay.isFilled) {
      // SUCCESSFUL HOME ARRIVAL!
      landedBay.isFilled = true;
      let points = 50;

      if (landedBay.hasFly) {
        points += 200;
        landedBay.hasFly = false;
        froggerAudio.playBonusFly();
        this.spawnPointsSparkle(landedBay.x, 32, '+200 FLY');
      } else {
        froggerAudio.playHome();
      }

      // Add time bonus: +10 pts per remaining second
      const timeBonus = Math.floor(this.timeRemaining) * 10;
      points += timeBonus;
      this.score += points;

      if (this.score > this.highScore) {
        this.highScore = this.score;
      }

      // Spawn celebratory confetti
      this.spawnConfetti(landedBay.x + 18, 48);

      // Check if all 5 home bays filled
      const allFilled = this.homeBays.every(b => b.isFilled);
      if (allFilled) {
        this.score += 1000;
        froggerAudio.playLevelClear();
        this.gameState = 'LEVEL_CLEARED';
        this.levelClearTimer = 2.5;
        this.spawnConfetti(CANVAS_WIDTH / 2, 200);
      } else {
        this.respawnFrog();
      }
    } else {
      // Landed on green bush/bank or already filled bay!
      this.killFrog('BANK');
    }
  }

  private checkCollisionsAndRiding() {
    const f = this.frog;
    const row = f.gridRow;
    const frogBox = {
      x: f.x + 5,
      y: f.y + 5,
      w: COL_WIDTH - 10,
      h: ROW_HEIGHT - 10,
    };

    // 1. ROAD CHECK (Rows 7 to 11)
    if (row >= 7 && row <= 11) {
      const lane = this.lanes.find(l => l.row === row);
      if (lane) {
        for (const car of lane.items) {
          const carBox = {
            x: car.x + 2,
            y: lane.y + 4,
            w: car.width - 4,
            h: ROW_HEIGHT - 8,
          };

          if (this.boxesOverlap(frogBox, carBox)) {
            this.killFrog('SQUASH');
            return;
          }
        }
      }
    }

    // 2. RIVER CHECK (Rows 1 to 5)
    if (row >= 1 && row <= 5) {
      const lane = this.lanes.find(l => l.row === row);
      if (!lane) return;

      let onObstacle = false;
      let ridingSpeed = lane.speed;

      for (const obs of lane.items as RiverObstacle[]) {
        const obsBox = {
          x: obs.x,
          y: lane.y,
          w: obs.width,
          h: ROW_HEIGHT,
        };

        // Frog center point check
        const frogCenterX = f.x + COL_WIDTH / 2;
        const frogCenterY = f.y + ROW_HEIGHT / 2;

        if (
          frogCenterX >= obsBox.x &&
          frogCenterX <= obsBox.x + obsBox.w &&
          frogCenterY >= obsBox.y &&
          frogCenterY <= obsBox.y + obsBox.h
        ) {
          // Check if diving turtle is completely submerged
          if (obs.diveState === 2) {
            this.killFrog('DROWN');
            return;
          }

          onObstacle = true;
          break;
        }
      }

      if (onObstacle) {
        // Carry frog with log/turtle movement
        f.x += ridingSpeed;
        f.targetX = f.x;
        f.gridCol = Math.round(f.x / COL_WIDTH);

        // Check if carried off the edge of screen
        if (f.x < -10 || f.x > CANVAS_WIDTH - COL_WIDTH + 10) {
          this.killFrog('DROWN');
          return;
        }
      } else {
        // Plunged into the deep water!
        this.killFrog('DROWN');
        return;
      }
    }
  }

  private boxesOverlap(
    a: { x: number; y: number; w: number; h: number },
    b: { x: number; y: number; w: number; h: number }
  ): boolean {
    return (
      a.x < b.x + b.w &&
      a.x + a.w > b.x &&
      a.y < b.y + b.h &&
      a.y + a.h > b.y
    );
  }

  public killFrog(reason: 'SQUASH' | 'DROWN' | 'TIME' | 'BANK') {
    this.gameState = 'DYING';
    this.deathReason = reason;
    this.deathTimer = 1.6;

    if (reason === 'SQUASH' || reason === 'BANK') {
      froggerAudio.playSquash();
      this.spawnDeathParticles(this.frog.x + 16, this.frog.y + 16, '#ff4444');
    } else if (reason === 'DROWN') {
      froggerAudio.playSplash();
      this.spawnWaterRipple(this.frog.x + 16, this.frog.y + 16);
    } else if (reason === 'TIME') {
      froggerAudio.playSquash();
      this.spawnDeathParticles(this.frog.x + 16, this.frog.y + 16, '#facc15');
    }

    this.notify();
  }

  private respawnFrog() {
    this.frog = this.createInitialFrog();
    this.timeRemaining = 30;
    this.gameState = 'PLAYING';
    this.notify();
  }

  public checkIsHighScore(): boolean {
    return isFroggerHighScore(this.score);
  }

  private spawnDeathParticles(x: number, y: number, color: string) {
    for (let i = 0; i < 16; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1 + Math.random() * 3;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color,
        size: 3 + Math.random() * 2,
        alpha: 1,
        life: 0.8 + Math.random() * 0.4,
        maxLife: 1.2,
      });
    }
  }

  private spawnWaterRipple(x: number, y: number) {
    for (let i = 0; i < 12; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.5 + Math.random() * 1.8;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: '#55ffff',
        size: 2 + Math.random() * 2,
        alpha: 1,
        life: 0.6 + Math.random() * 0.4,
        maxLife: 1.0,
      });
    }
  }

  private spawnConfetti(x: number, y: number) {
    const colors = ['#55ff55', '#ffff55', '#55ffff', '#ff55ff'];
    for (let i = 0; i < 20; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.5 + Math.random() * 3.5;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: colors[i % colors.length],
        size: 3,
        alpha: 1,
        life: 1.2,
        maxLife: 1.2,
      });
    }
  }

  private spawnPointsSparkle(x: number, y: number, _label: string) {
    this.spawnConfetti(x + 16, y + 16);
  }

  private updateParticles(dt: number) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life -= dt;
      p.alpha = Math.max(0, p.life / p.maxLife);
      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }
}
