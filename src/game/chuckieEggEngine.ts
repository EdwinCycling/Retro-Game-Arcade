/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Chuckie Egg (BBC Micro / A&F Software 1983) Game Engine
 */

import {
  ChuckieEggGameState,
  DuckEnemy,
  EggItem,
  GrainItem,
  HarryState,
  Ladder,
  LevelConfig,
  Lift,
  Platform,
} from './chuckieEggTypes';
import { CANVAS_HEIGHT, CANVAS_WIDTH, CHUCKIE_EGG_LEVELS } from './chuckieEggLevels';
import { chuckieEggAudio } from './chuckieEggAudio';

export class ChuckieEggEngine {
  public gameState: ChuckieEggGameState = 'TITLE';
  public score: number = 0;
  public highScore: number = 18450;
  public lives: number = 5;
  public levelIndex: number = 0;
  public bonusTimer: number = 1000;
  public eggsRemaining: number = 12;

  // Level elements
  public platforms: Platform[] = [];
  public ladders: Ladder[] = [];
  public lifts: Lift[] = [];
  public eggs: EggItem[] = [];
  public grains: GrainItem[] = [];
  public ducks: DuckEnemy[] = [];

  // Giant Duck
  public cagedDuckPos = { x: 410, y: 24 };
  public isGiantDuckFree: boolean = false;
  public giantDuck = {
    x: 410,
    y: 24,
    vx: -70,
    vy: 35,
    wingAngle: 0,
    active: false,
  };

  // Harry
  public harry: HarryState = {
    x: 48,
    y: 336,
    vx: 0,
    vy: 0,
    isGrounded: true,
    isOnLadder: false,
    isJumping: false,
    facingLeft: false,
    animFrame: 0,
    onLiftId: null,
  };

  // Input states
  private keys = {
    left: false,
    right: false,
    up: false,
    down: false,
    jump: false,
  };

  // State timers
  private deathTimer: number = 0;
  private levelClearTimer: number = 0;
  public animTimer: number = 0;
  private stepSoundTimer: number = 0;

  // Subscriptions for UI sync
  private subscribers: (() => void)[] = [];

  constructor() {
    this.loadLevel(0);
  }

  public subscribe(fn: () => void): () => void {
    this.subscribers.push(fn);
    return () => {
      this.subscribers = this.subscribers.filter(sub => sub !== fn);
    };
  }

  private notify() {
    this.subscribers.forEach(fn => fn());
  }

  public startGame() {
    this.score = 0;
    this.lives = 5;
    this.levelIndex = 0;
    this.loadLevel(0);
    this.gameState = 'PLAYING';
    this.notify();
  }

  public loadLevel(idx: number) {
    this.levelIndex = idx % CHUCKIE_EGG_LEVELS.length;
    const config: LevelConfig = CHUCKIE_EGG_LEVELS[this.levelIndex];

    this.bonusTimer = config.bonusStart;
    this.platforms = config.platforms.map(p => ({ ...p }));
    this.ladders = config.ladders.map(l => ({ ...l }));
    this.lifts = config.lifts.map(lift => ({ ...lift }));

    this.eggs = config.eggs.map((e, id) => ({
      id,
      x: e.x,
      y: e.y,
      collected: false,
    }));
    this.eggsRemaining = this.eggs.length;

    this.grains = config.grains.map((g, id) => ({
      id,
      x: g.x,
      y: g.y,
      collected: false,
    }));

    this.ducks = config.ducks.map((d, id) => ({
      id,
      x: d.x,
      y: d.y,
      vx: d.speed,
      facingLeft: false,
      platformIndex: d.platformIndex,
      animFrame: 0,
      isJumping: false,
    }));

    this.cagedDuckPos = { ...config.cagedDuck };
    this.isGiantDuckFree = false;
    this.giantDuck = {
      x: config.cagedDuck.x,
      y: config.cagedDuck.y,
      vx: -75,
      vy: 40,
      wingAngle: 0,
      active: false,
    };

    this.respawnHarry();
  }

  public respawnHarry() {
    this.harry = {
      x: 48,
      y: 336,
      vx: 0,
      vy: 0,
      isGrounded: true,
      isOnLadder: false,
      isJumping: false,
      facingLeft: false,
      animFrame: 0,
      onLiftId: null,
    };
    this.keys = { left: false, right: false, up: false, down: false, jump: false };
  }

  public handleKeyDown(key: string) {
    if (this.gameState === 'TITLE' || this.gameState === 'GAME_OVER') {
      if (key === ' ' || key === 'Enter') {
        this.startGame();
        return;
      }
    }

    if (key === 'ArrowLeft' || key === 'a' || key === 'A') {
      this.keys.left = true;
    } else if (key === 'ArrowRight' || key === 'd' || key === 'D') {
      this.keys.right = true;
    } else if (key === 'ArrowUp' || key === 'w' || key === 'W') {
      this.keys.up = true;
    } else if (key === 'ArrowDown' || key === 's' || key === 'S') {
      this.keys.down = true;
    } else if (key === ' ' || key === 'j' || key === 'J' || key === 'z' || key === 'Z') {
      this.triggerJump();
    }
  }

  public handleKeyUp(key: string) {
    if (key === 'ArrowLeft' || key === 'a' || key === 'A') {
      this.keys.left = false;
    } else if (key === 'ArrowRight' || key === 'd' || key === 'D') {
      this.keys.right = false;
    } else if (key === 'ArrowUp' || key === 'w' || key === 'W') {
      this.keys.up = false;
    } else if (key === 'ArrowDown' || key === 's' || key === 'S') {
      this.keys.down = false;
    }
  }

  public triggerJump() {
    if (this.gameState !== 'PLAYING') return;
    const h = this.harry;
    if (h.isGrounded || h.onLiftId !== null) {
      h.vy = -230;
      h.isGrounded = false;
      h.isOnLadder = false;
      h.isJumping = true;
      h.onLiftId = null;
      chuckieEggAudio.playJump();
    }
  }

  public update(dt: number) {
    this.animTimer += dt;

    if (this.gameState === 'DYING') {
      this.deathTimer -= dt;
      if (this.deathTimer <= 0) {
        this.lives--;
        if (this.lives <= 0) {
          this.gameState = 'GAME_OVER';
          chuckieEggAudio.playGameOver();
          if (this.score > this.highScore) {
            this.highScore = this.score;
          }
        } else {
          this.gameState = 'PLAYING';
          this.respawnHarry();
        }
        this.notify();
      }
      return;
    }

    if (this.gameState === 'LEVEL_CLEAR') {
      this.levelClearTimer -= dt;
      if (this.levelClearTimer <= 0) {
        this.loadLevel(this.levelIndex + 1);
        this.gameState = 'PLAYING';
        this.notify();
      }
      return;
    }

    if (this.gameState !== 'PLAYING') return;

    // Bonus timer countdown
    this.bonusTimer = Math.max(0, this.bonusTimer - dt * 25);
    if (this.bonusTimer <= 0 && !this.isGiantDuckFree) {
      this.isGiantDuckFree = true;
      this.giantDuck.active = true;
      chuckieEggAudio.playGiantDuckAlarm();
    }

    // Update Lifts
    this.updateLifts(dt);

    // Update Harry
    this.updateHarry(dt);

    // Update Ducks
    this.updateDucks(dt);

    // Update Giant Duck if free
    if (this.isGiantDuckFree) {
      this.updateGiantDuck(dt);
    }

    // Check item pickups
    this.checkPickups();

    // Check hazard collisions
    this.checkCollisions();

    // Check level clear
    if (this.eggsRemaining <= 0) {
      this.gameState = 'LEVEL_CLEAR';
      const bonusPts = Math.floor(this.bonusTimer);
      this.score += bonusPts + 1000;
      if (this.score > this.highScore) {
        this.highScore = this.score;
      }
      chuckieEggAudio.playLevelClear();
      this.levelClearTimer = 2.5;
      this.notify();
    }
  }

  private updateLifts(dt: number) {
    for (const lift of this.lifts) {
      lift.y += lift.dir * lift.speed * dt;
      if (lift.y <= lift.minY) {
        lift.y = lift.minY;
        lift.dir = 1;
      } else if (lift.y >= lift.maxY) {
        lift.y = lift.maxY;
        lift.dir = -1;
      }
    }
  }

  private updateHarry(dt: number) {
    const h = this.harry;
    const speed = 115;
    const climbSpeed = 85;
    const gravity = 550;

    // Check ladder overlap
    const harryCenterX = h.x + 10;
    const harryCenterY = h.y + 12;
    let nearbyLadder: Ladder | null = null;

    for (const lad of this.ladders) {
      if (
        harryCenterX >= lad.x - 6 &&
        harryCenterX <= lad.x + lad.width + 6 &&
        h.y + 24 >= lad.y &&
        h.y <= lad.y + lad.height + 4
      ) {
        nearbyLadder = lad;
        break;
      }
    }

    // Ladder climbing input
    if (nearbyLadder) {
      if (this.keys.up) {
        h.isOnLadder = true;
        h.isGrounded = false;
        h.isJumping = false;
        h.onLiftId = null;
        h.vy = -climbSpeed;
        h.x = nearbyLadder.x + nearbyLadder.width / 2 - 10; // snap to ladder center
        this.stepSoundTimer += dt;
        if (this.stepSoundTimer > 0.18) {
          chuckieEggAudio.playClimb();
          this.stepSoundTimer = 0;
        }
      } else if (this.keys.down) {
        h.isOnLadder = true;
        h.isGrounded = false;
        h.isJumping = false;
        h.onLiftId = null;
        h.vy = climbSpeed;
        h.x = nearbyLadder.x + nearbyLadder.width / 2 - 10;
        this.stepSoundTimer += dt;
        if (this.stepSoundTimer > 0.18) {
          chuckieEggAudio.playClimb();
          this.stepSoundTimer = 0;
        }
      } else if (h.isOnLadder) {
        h.vy = 0;
      }
    } else {
      h.isOnLadder = false;
    }

    // Horizontal movement
    if (this.keys.left) {
      h.vx = -speed;
      h.facingLeft = true;
      if (h.isGrounded || h.onLiftId !== null) {
        this.stepSoundTimer += dt;
        if (this.stepSoundTimer > 0.2) {
          chuckieEggAudio.playStep();
          this.stepSoundTimer = 0;
        }
      }
    } else if (this.keys.right) {
      h.vx = speed;
      h.facingLeft = false;
      if (h.isGrounded || h.onLiftId !== null) {
        this.stepSoundTimer += dt;
        if (this.stepSoundTimer > 0.2) {
          chuckieEggAudio.playStep();
          this.stepSoundTimer = 0;
        }
      }
    } else {
      h.vx = 0;
    }

    // Apply movement if not climbing
    if (!h.isOnLadder) {
      h.x += h.vx * dt;

      // Gravity if not grounded or on lift
      if (!h.isGrounded && h.onLiftId === null) {
        h.vy += gravity * dt;
      }
      h.y += h.vy * dt;
    } else {
      h.y += h.vy * dt;
    }

    // Boundary constraints
    h.x = Math.max(16, Math.min(CANVAS_WIDTH - 36, h.x));

    // Fall off bottom check
    if (h.y > CANVAS_HEIGHT + 10) {
      this.triggerHarryDeath();
      return;
    }

    // Platform landing collision
    let landed = false;
    const feetY = h.y + 24;
    const prevFeetY = feetY - h.vy * dt;

    if (h.vy >= 0 && !h.isOnLadder) {
      for (const plat of this.platforms) {
        if (
          h.x + 16 >= plat.x &&
          h.x + 4 <= plat.x + plat.width &&
          prevFeetY <= plat.y + 6 &&
          feetY >= plat.y
        ) {
          h.y = plat.y - 24;
          h.vy = 0;
          h.isGrounded = true;
          h.isJumping = false;
          h.onLiftId = null;
          landed = true;
          break;
        }
      }

      // Lift landing collision
      if (!landed) {
        for (const lift of this.lifts) {
          if (
            h.x + 16 >= lift.x &&
            h.x + 4 <= lift.x + lift.width &&
            prevFeetY <= lift.y + 6 &&
            feetY >= lift.y
          ) {
            h.y = lift.y - 24;
            h.vy = 0;
            h.isGrounded = true;
            h.isJumping = false;
            h.onLiftId = lift.id;
            landed = true;
            break;
          }
        }
      }
    }

    // If standing on lift, follow lift vertically
    if (h.onLiftId !== null) {
      const activeLift = this.lifts.find(l => l.id === h.onLiftId);
      if (activeLift) {
        h.y = activeLift.y - 24;
        if (h.x + 16 < activeLift.x || h.x + 4 > activeLift.x + activeLift.width) {
          h.onLiftId = null;
          h.isGrounded = false;
        }
      } else {
        h.onLiftId = null;
      }
    } else if (!landed && !h.isOnLadder) {
      h.isGrounded = false;
    }

    // Animation frame
    if (h.vx !== 0 || (h.isOnLadder && h.vy !== 0)) {
      h.animFrame = Math.floor(this.animTimer * 10) % 4;
    } else {
      h.animFrame = 0;
    }
  }

  private updateDucks(dt: number) {
    for (const duck of this.ducks) {
      duck.animFrame = Math.floor(this.animTimer * 6) % 2;
      const plat = this.platforms[duck.platformIndex];
      if (!plat) continue;

      duck.x += duck.vx * dt;

      // Platform edges patrol turnaround
      if (duck.x <= plat.x) {
        duck.x = plat.x;
        duck.vx = Math.abs(duck.vx);
        duck.facingLeft = false;
      } else if (duck.x + 20 >= plat.x + plat.width) {
        duck.x = plat.x + plat.width - 20;
        duck.vx = -Math.abs(duck.vx);
        duck.facingLeft = true;
      }

      // Small bounce animation
      duck.y = plat.y - 20 - (duck.animFrame === 1 ? 3 : 0);
    }
  }

  private updateGiantDuck(dt: number) {
    const g = this.giantDuck;
    g.wingAngle += dt * 12;

    // Swoop towards Harry horizontally and vertically
    const targetX = this.harry.x;
    const targetY = this.harry.y;

    const dx = targetX - g.x;
    const dy = targetY - g.y;

    g.vx += (dx > 0 ? 40 : -40) * dt;
    g.vy += (dy > 0 ? 30 : -30) * dt;

    // Cap velocity
    g.vx = Math.max(-95, Math.min(95, g.vx));
    g.vy = Math.max(-70, Math.min(70, g.vy));

    g.x += g.vx * dt;
    g.y += g.vy * dt;
  }

  private checkPickups() {
    const h = this.harry;
    const harryBox = { x: h.x + 2, y: h.y + 2, w: 16, h: 22 };

    // Eggs
    for (const egg of this.eggs) {
      if (!egg.collected) {
        if (
          harryBox.x < egg.x + 14 &&
          harryBox.x + harryBox.w > egg.x &&
          harryBox.y < egg.y + 16 &&
          harryBox.y + harryBox.h > egg.y
        ) {
          egg.collected = true;
          this.eggsRemaining--;
          this.score += 100;
          if (this.score > this.highScore) {
            this.highScore = this.score;
          }
          chuckieEggAudio.playEggPickup();
          this.notify();
        }
      }
    }

    // Grains
    for (const grain of this.grains) {
      if (!grain.collected) {
        if (
          harryBox.x < grain.x + 14 &&
          harryBox.x + harryBox.w > grain.x &&
          harryBox.y < grain.y + 12 &&
          harryBox.y + harryBox.h > grain.y
        ) {
          grain.collected = true;
          this.score += 50;
          this.bonusTimer = Math.min(2000, this.bonusTimer + 150);
          chuckieEggAudio.playGrainPickup();
          this.notify();
        }
      }
    }
  }

  private checkCollisions() {
    const h = this.harry;
    const harryBox = { x: h.x + 4, y: h.y + 4, w: 12, h: 18 };

    // Check ducks
    for (const duck of this.ducks) {
      const duckBox = { x: duck.x + 2, y: duck.y + 2, w: 16, h: 16 };
      if (
        harryBox.x < duckBox.x + duckBox.w &&
        harryBox.x + harryBox.w > duckBox.x &&
        harryBox.y < duckBox.y + duckBox.h &&
        harryBox.y + harryBox.h > duckBox.y
      ) {
        this.triggerHarryDeath();
        return;
      }
    }

    // Check Giant Duck
    if (this.isGiantDuckFree) {
      const g = this.giantDuck;
      const gBox = { x: g.x - 12, y: g.y - 12, w: 24, h: 24 };
      if (
        harryBox.x < gBox.x + gBox.w &&
        harryBox.x + harryBox.w > gBox.x &&
        harryBox.y < gBox.y + gBox.h &&
        harryBox.y + harryBox.h > gBox.y
      ) {
        this.triggerHarryDeath();
        return;
      }
    }
  }

  private triggerHarryDeath() {
    this.gameState = 'DYING';
    this.deathTimer = 1.2;
    chuckieEggAudio.playDeath();
    this.notify();
  }
}
