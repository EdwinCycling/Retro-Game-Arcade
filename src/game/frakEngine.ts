/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * FRAK! (BBC Micro 1984 - Nick Pelling / Aardvark Software) Physics & Game Engine
 */

import {
  FrakGameState,
  TroggState,
  FrakLevelConfig,
  FrakPlatform,
  FrakEnemy,
  FrakKeyItem,
  FrakLightBulb,
  FrakDoor,
} from './frakTypes';
import { FRAK_LEVELS, CANVAS_WIDTH, CANVAS_HEIGHT } from './frakLevels';
import { frakAudio } from './frakAudio';

export class FrakEngine {
  // Game states
  public state: FrakGameState = 'TITLE';
  public currentLevelIndex: number = 0;
  public score: number = 0;
  public lives: number = 5;
  public timeRemaining: number = 120;
  public isUpsideDown: boolean = false;
  public isInDarkness: boolean = false;

  // Level data
  public level!: FrakLevelConfig;
  public platforms: FrakPlatform[] = [];
  public keys: FrakKeyItem[] = [];
  public bulbs: FrakLightBulb[] = [];
  public door!: FrakDoor;
  public enemies: FrakEnemy[] = [];

  // Spawners timers
  private balloonTimer: number = 0;
  private daggerTimer: number = 0;

  // Trogg player entity
  public trogg!: TroggState;

  // Timers & animation
  public animTimer: number = 0;
  public deathTimer: number = 0;
  public levelClearTimer: number = 0;
  private stepSoundTimer: number = 0;
  private timeTickTimer: number = 0;

  // Speech bubble state for the iconic "FRAK!" exclamation
  public showFrakBubble: boolean = false;
  public frakBubbleText: string = 'FRAK!';

  // Input states
  public inputLeft: boolean = false;
  public inputRight: boolean = false;
  public inputUp: boolean = false;
  public inputDown: boolean = false;
  public inputJump: boolean = false;
  public inputFire: boolean = false;

  // High score tracking
  public highScore: number = 24850;

  // Subscriptions for UI sync
  private subscribers: Set<() => void> = new Set();

  constructor() {
    this.loadLevel(0);
    this.state = 'TITLE';
  }

  public subscribe(cb: () => void): () => void {
    this.subscribers.add(cb);
    return () => this.subscribers.delete(cb);
  }

  public setOnStateChange(cb: () => void) {
    this.subscribe(cb);
  }

  private notify() {
    this.subscribers.forEach((cb) => cb());
  }

  public handleKeyDown(key: string) {
    if (this.state === 'TITLE' || this.state === 'GAME_OVER') {
      if (['Space', ' ', 'Enter', 'r', 'R'].includes(key)) {
        this.startNewGame();
        return;
      }
    }

    switch (key) {
      case 'ArrowLeft':
      case 'a':
      case 'A':
      case 'o':
      case 'O':
        this.inputLeft = true;
        break;
      case 'ArrowRight':
      case 'd':
      case 'D':
      case 'p':
      case 'P':
        this.inputRight = true;
        break;
      case 'ArrowUp':
      case 'w':
      case 'W':
      case 'q':
      case 'Q':
        this.inputUp = true;
        this.inputJump = true;
        break;
      case 'ArrowDown':
      case 's':
      case 'S':
      case 'z':
      case 'Z':
        this.inputDown = true;
        break;
      case 'j':
      case 'J':
      case 'x':
      case 'X':
        this.inputJump = true;
        break;
      case ' ':
      case 'Space':
      case 'Enter':
      case 'f':
      case 'F':
        this.inputFire = true;
        this.launchYoYo();
        break;
    }
  }

  public handleKeyUp(key: string) {
    switch (key) {
      case 'ArrowLeft':
      case 'a':
      case 'A':
      case 'o':
      case 'O':
        this.inputLeft = false;
        break;
      case 'ArrowRight':
      case 'd':
      case 'D':
      case 'p':
      case 'P':
        this.inputRight = false;
        break;
      case 'ArrowUp':
      case 'w':
      case 'W':
      case 'q':
      case 'Q':
        this.inputUp = false;
        this.inputJump = false;
        break;
      case 'ArrowDown':
      case 's':
      case 'S':
      case 'z':
      case 'Z':
        this.inputDown = false;
        break;
      case 'j':
      case 'J':
      case 'x':
      case 'X':
        this.inputJump = false;
        break;
      case ' ':
      case 'Space':
      case 'Enter':
      case 'f':
      case 'F':
        this.inputFire = false;
        break;
    }
  }

  public startNewGame() {
    this.score = 0;
    this.lives = 5;
    this.currentLevelIndex = 0;
    this.loadLevel(0);
    this.state = 'PLAYING';
    this.notify();
  }

  public selectZone(zoneIndex: number) {
    this.currentLevelIndex = zoneIndex % FRAK_LEVELS.length;
    this.loadLevel(this.currentLevelIndex);
    this.state = 'PLAYING';
    this.notify();
  }

  public toggleUpsideDown() {
    this.isUpsideDown = !this.isUpsideDown;
    this.notify();
  }

  public loadLevel(levelIndex: number) {
    this.currentLevelIndex = levelIndex % FRAK_LEVELS.length;
    this.level = FRAK_LEVELS[this.currentLevelIndex];
    this.timeRemaining = this.level.timeLimit;
    this.isInDarkness = false;
    this.showFrakBubble = false;
    this.balloonTimer = 0;
    this.daggerTimer = 0;

    // Platforms (deep copy for dynamic moving rafts, shuttles and elevator)
    this.platforms = this.level.platforms.map((p) => ({
      ...p,
      moving: p.moving ? { ...p.moving } : undefined,
    }));

    // Keys
    this.keys = this.level.keys.map((p, idx) => ({
      id: idx + 1,
      x: p.x,
      y: p.y,
      collected: false,
    }));

    // Light bulbs
    this.bulbs = this.level.bulbs.map((p, idx) => ({
      id: idx + 1,
      x: p.x,
      y: p.y,
      collected: false,
    }));

    // Door
    this.door = { ...this.level.door, isOpen: false };

    // Static / Patrolling Enemies
    let enemyId = 1;
    this.enemies = this.level.staticEnemies.map((e) => {
      const isScrubbly = e.type === 'scrubbly';
      return {
        id: enemyId++,
        type: e.type,
        x: e.x,
        y: e.y,
        vx: e.vx || 0.8,
        vy: 0,
        width: isScrubbly ? 20 : 22,
        height: isScrubbly ? 16 : 20,
        alive: true,
        facingLeft: false,
        animFrame: 0,
        patrolMinX: e.patrolMinX,
        patrolMaxX: e.patrolMaxX,
      };
    });

    // Spawn Trogg
    this.resetTroggPosition();
    this.notify();
  }

  public resetTroggPosition() {
    this.trogg = {
      x: this.level.spawnPoint.x,
      y: this.level.spawnPoint.y,
      vx: 0,
      vy: 0,
      isGrounded: true,
      isClimbing: false,
      climbType: null,
      isJumping: false,
      facingLeft: false,
      animFrame: 0,
      fallDistance: 0,
      isSlidingOffEdge: false,
      slideDir: 1,
      yoYo: {
        active: false,
        x: 0,
        y: 0,
        vx: 0,
        dist: 0,
        maxDist: 140,
        returning: false,
        spinAngle: 0,
      },
    };
    this.showFrakBubble = false;
  }

  // Trigger Trogg's death with the classic "FRAK!" scream and comic bubble
  public killTrogg() {
    if (this.state === 'DYING' || this.state === 'GAME_OVER') return;
    this.state = 'DYING';
    this.deathTimer = 110; // ~1.8 seconds
    this.showFrakBubble = true;
    this.frakBubbleText = 'FRAK!';
    this.trogg.isClimbing = false;
    this.trogg.yoYo.active = false;
    frakAudio.playFrakDeath();
    this.notify();
  }

  // Trigger Yo-Yo launch
  public launchYoYo() {
    if (this.state !== 'PLAYING') return;
    if (this.trogg.yoYo.active) return;
    if (this.trogg.isClimbing) return; // Cannot throw while on rope/ladder

    this.trogg.yoYo.active = true;
    this.trogg.yoYo.returning = false;
    this.trogg.yoYo.spinAngle = 0;
    this.trogg.yoYo.dist = 0;
    this.trogg.yoYo.maxDist = 135;

    const spawnOffsetX = this.trogg.facingLeft ? -12 : 12;
    this.trogg.yoYo.x = this.trogg.x + spawnOffsetX;
    this.trogg.yoYo.y = this.trogg.y - 14;
    this.trogg.yoYo.vx = this.trogg.facingLeft ? -6.2 : 6.2;

    frakAudio.playYoYoThrow();
  }

  // Main physics update loop (called 60 times per second)
  public update() {
    this.animTimer++;

    if (this.state === 'TITLE') {
      return;
    }

    if (this.state === 'DYING') {
      this.deathTimer--;
      // Let Trogg tumble downwards if in air
      if (this.trogg.y < CANVAS_HEIGHT - 35) {
        this.trogg.y += 3.5;
      }
      if (this.deathTimer <= 0) {
        this.lives--;
        if (this.lives <= 0) {
          this.state = 'GAME_OVER';
          frakAudio.playGameOver();
        } else {
          this.resetTroggPosition();
          this.state = 'PLAYING';
        }
        this.notify();
      }
      return;
    }

    if (this.state === 'LEVEL_CLEAR') {
      this.levelClearTimer--;
      if (this.levelClearTimer <= 0) {
        this.loadLevel(this.currentLevelIndex + 1);
        this.state = 'PLAYING';
        this.notify();
      }
      return;
    }

    if (this.state !== 'PLAYING') return;

    // Countdown time
    this.timeTickTimer++;
    if (this.timeTickTimer >= 60) {
      this.timeTickTimer = 0;
      if (this.timeRemaining > 0) {
        this.timeRemaining--;
        if (this.timeRemaining === 0) {
          this.isInDarkness = true;
        }
      }
    }

    // Process Moving Platforms (Rafts, Shuttles & Elevators)
    this.updateMovingPlatforms();

    // Process Player Movement
    this.updateTrogg();

    // Process Yo-Yo mechanics
    this.updateYoYo();

    // Process Spawners & Enemies
    this.updateEnemies();

    // Check Collectibles (Keys & Light Bulbs)
    this.checkCollectibles();

    // Check Door / Exit reached
    this.checkDoor();
  }

  private updateTrogg() {
    const t = this.trogg;

    // Check if player wants to initiate a jump
    if (this.inputJump && !t.isJumping && t.isGrounded && !t.isClimbing) {
      t.isJumping = true;
      t.isGrounded = false;
      t.vy = -6.4;
      t.fallDistance = 0;
      frakAudio.playJump();
    }

    // Check Climbable (Ladders / Ropes / Chains)
    const nearbyClimbable = this.level.climbables.find((c) => {
      return (
        Math.abs(t.x - (c.x + c.width / 2)) < 16 &&
        t.y >= c.y - 4 &&
        t.y <= c.y + c.height + 12
      );
    });

    if (nearbyClimbable && (this.inputUp || this.inputDown)) {
      if (!t.isClimbing) {
        t.isClimbing = true;
        t.climbType = nearbyClimbable.type;
        t.isJumping = false;
        t.isGrounded = false;
        t.fallDistance = 0;
        t.vx = 0;
        t.vy = 0;
        // Snap to ladder center
        t.x = nearbyClimbable.x + nearbyClimbable.width / 2;
      }
    }

    // While climbing
    if (t.isClimbing) {
      t.fallDistance = 0;
      let climbed = false;

      if (this.inputUp) {
        t.y -= 1.8;
        climbed = true;
        t.facingLeft = false;
      } else if (this.inputDown) {
        t.y += 1.8;
        climbed = true;
      }

      if (climbed) {
        t.animFrame = Math.floor(this.animTimer / 6) % 4;
        if (this.animTimer % 14 === 0) {
          frakAudio.playClimb();
        }
      }

      // If climbed above top of ladder or below bottom, or player presses Jump to leap off
      if (!nearbyClimbable || this.inputJump) {
        t.isClimbing = false;
        t.climbType = null;
        if (this.inputJump) {
          t.isJumping = true;
          t.vy = -5.5;
          t.vx = this.inputLeft ? -2.2 : this.inputRight ? 2.2 : 0;
          frakAudio.playJump();
        }
      } else {
        // Can step sideways off onto an aligned platform
        if ((this.inputLeft || this.inputRight) && this.animTimer % 10 === 0) {
          const platUnderfoot = this.findPlatformUnder(t.x + (this.inputLeft ? -14 : 14), t.y);
          if (platUnderfoot) {
            t.isClimbing = false;
            t.climbType = null;
            t.isGrounded = true;
            t.y = platUnderfoot.y;
            t.x += this.inputLeft ? -10 : 10;
          }
        }
        return;
      }
    }

    // Walking controls
    if (!t.isClimbing) {
      if (this.inputLeft) {
        t.vx = -2.2;
        t.facingLeft = true;
        if (t.isGrounded) {
          t.animFrame = Math.floor(this.animTimer / 5) % 4;
          this.stepSoundTimer++;
          if (this.stepSoundTimer % 12 === 0) {
            frakAudio.playStep();
          }
        }
      } else if (this.inputRight) {
        t.vx = 2.2;
        t.facingLeft = false;
        if (t.isGrounded) {
          t.animFrame = Math.floor(this.animTimer / 5) % 4;
          this.stepSoundTimer++;
          if (this.stepSoundTimer % 12 === 0) {
            frakAudio.playStep();
          }
        }
      } else {
        t.vx = 0;
        if (t.isGrounded) {
          t.animFrame = 0;
        }
      }
    }

    // Gravity & Fall Physics
    if (!t.isGrounded && !t.isClimbing) {
      t.vy += 0.28;
      if (t.vy > 7.0) t.vy = 7.0;

      // Track fall distance for the infamous lethal Frak! fall
      if (t.vy > 0) {
        t.fallDistance += t.vy;
      }
    }

    // Apply horizontal & vertical motion
    t.x += t.vx;
    t.y += t.vy;

    // Screen bounds clamping
    if (t.x < 24) t.x = 24;
    if (t.x > CANVAS_WIDTH - 24) t.x = CANVAS_WIDTH - 24;

    // Platform collision & Diagonal Slide detection
    if (!t.isClimbing) {
      const plat = this.findPlatformUnder(t.x, t.y);

      if (plat && t.vy >= 0 && t.y - t.vy <= plat.y + 8) {
        // FATAL FALL CHECK: In Frak!, falling from excessive height (>105px) without a ladder is fatal!
        if (t.fallDistance > 105) {
          this.killTrogg();
          return;
        }

        // Safe landing
        t.y = plat.y;
        t.vy = 0;
        t.isGrounded = true;
        t.isJumping = false;
        t.fallDistance = 0;
        t.isSlidingOffEdge = false;
      } else {
        // Not on a platform
        t.isGrounded = false;

        // DIAGONAL SLIDE OFF EDGE:
        // When Trogg walks off a platform edge, Frak! famously makes him slide diagonally downward
        if (!t.isJumping && t.vy > 0 && t.vy < 2.5) {
          t.isSlidingOffEdge = true;
          t.slideDir = t.facingLeft ? -1 : 1;
          t.x += t.slideDir * 1.2;
        }
      }
    }

    // Abyss pit check
    if (t.y > CANVAS_HEIGHT + 20) {
      this.killTrogg();
    }
  }

  private updateMovingPlatforms() {
    const plats = this.platforms.length > 0 ? this.platforms : this.level.platforms;

    for (const plat of plats) {
      if (!plat.moving) continue;
      const m = plat.moving;
      const prevX = plat.x;
      const prevY = plat.y;

      if (m.axis === 'x') {
        plat.x += m.speed * m.dir;
        if (plat.x <= m.min) {
          plat.x = m.min;
          m.dir = 1;
        } else if (plat.x >= m.max) {
          plat.x = m.max;
          m.dir = -1;
        }
      } else if (m.axis === 'y') {
        plat.y += m.speed * m.dir;
        if (plat.y <= m.min) {
          plat.y = m.min;
          m.dir = 1;
        } else if (plat.y >= m.max) {
          plat.y = m.max;
          m.dir = -1;
        }
      }

      const deltaX = plat.x - prevX;
      const deltaY = plat.y - prevY;

      // If Trogg is currently standing on this moving platform, move Trogg along with it!
      const t = this.trogg;
      if (t && t.isGrounded && !t.isClimbing && !t.isJumping) {
        const onPlat =
          t.x >= plat.x - 6 &&
          t.x <= plat.x + plat.width + 6 &&
          Math.abs(t.y - plat.y) <= 4;

        if (onPlat) {
          t.x += deltaX;
          t.y += deltaY;

          // Keep Trogg within screen bounds
          if (t.x < 24) t.x = 24;
          if (t.x > CANVAS_WIDTH - 24) t.x = CANVAS_WIDTH - 24;
        }
      }

      // If Key 3 in Level 2 is riding on PERCH-4, transport the key along
      if (plat.label === 'PERCH-4' && this.currentLevelIndex === 1) {
        const k3 = this.keys.find((k) => k.id === 3 && !k.collected);
        if (k3) {
          k3.x = plat.x + Math.floor(plat.width / 2) - 6;
          k3.y = plat.y - 20;
        }
      }
    }
  }

  private findPlatformUnder(x: number, y: number) {
    // Check if any platform can support Trogg at (x, y)
    const plats = this.platforms.length > 0 ? this.platforms : this.level.platforms;
    return plats.find((p) => {
      const withinX = x >= p.x - 10 && x <= p.x + p.width + 10;
      const atSurface = y >= p.y - 2 && y <= p.y + 12;
      return withinX && atSurface;
    });
  }

  private updateYoYo() {
    const y = this.trogg.yoYo;
    if (!y.active) return;

    y.spinAngle += 0.45;

    if (!y.returning) {
      y.x += y.vx;
      y.dist += Math.abs(y.vx);

      if (y.dist >= y.maxDist || y.x < 10 || y.x > CANVAS_WIDTH - 10) {
        y.returning = true;
      }
    } else {
      // Pull back towards Trogg's hand
      const targetX = this.trogg.x + (this.trogg.facingLeft ? -12 : 12);
      const targetY = this.trogg.y - 14;
      const dx = targetX - y.x;
      const dy = targetY - y.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 10) {
        y.active = false;
        return;
      }

      const speed = 7.5;
      y.x += (dx / dist) * speed;
      y.y += (dy / dist) * speed;
    }

    // Yo-Yo collision with enemies
    this.enemies.forEach((enemy) => {
      if (!enemy.alive) return;

      const hitDist = Math.hypot(y.x - (enemy.x + enemy.width / 2), y.y - (enemy.y - enemy.height / 2));
      if (hitDist < 18) {
        // Darkness rule: In darkness, yo-yo cannot defeat flying weapons (balloons and daggers)
        if (this.isInDarkness && (enemy.type === 'balloon' || enemy.type === 'dagger')) {
          return;
        }

        enemy.alive = false;
        y.returning = true;

        if (enemy.type === 'balloon') {
          this.score += 150;
          frakAudio.playBalloonPop();
        } else if (enemy.type === 'dagger') {
          this.score += 300;
          frakAudio.playEnemyHit();
        } else {
          this.score += 200;
          frakAudio.playEnemyHit();
        }
        this.notify();
      }
    });
  }

  private updateEnemies() {
    // 1. Static / Patrolling Enemies
    this.enemies.forEach((enemy) => {
      if (!enemy.alive) return;

      enemy.animFrame = Math.floor(this.animTimer / 8) % 4;

      if (enemy.type === 'scrubbly' || enemy.type === 'poglet' || enemy.type === 'hooter') {
        enemy.x += enemy.vx;
        if (enemy.patrolMinX && enemy.x <= enemy.patrolMinX) {
          enemy.x = enemy.patrolMinX;
          enemy.vx = Math.abs(enemy.vx);
          enemy.facingLeft = false;
        } else if (enemy.patrolMaxX && enemy.x >= enemy.patrolMaxX) {
          enemy.x = enemy.patrolMaxX;
          enemy.vx = -Math.abs(enemy.vx);
          enemy.facingLeft = true;
        }
      } else if (enemy.type === 'balloon') {
        enemy.y += enemy.vy;
        // Gentle horizontal sine wobble
        enemy.x += Math.sin(this.animTimer * 0.05 + enemy.id) * 0.6;
        if (enemy.y < -30) {
          enemy.alive = false;
        }
      } else if (enemy.type === 'dagger') {
        enemy.x += enemy.vx;
        enemy.y += enemy.vy;
        if (enemy.y > CANVAS_HEIGHT + 30 || enemy.x < -30) {
          enemy.alive = false;
        }
      }

      // Check collision with Trogg
      const troggBox = {
        x: this.trogg.x - 10,
        y: this.trogg.y - 28,
        w: 20,
        h: 28,
      };

      const enemyBox = {
        x: enemy.x,
        y: enemy.y - enemy.height,
        w: enemy.width,
        h: enemy.height,
      };

      if (
        troggBox.x < enemyBox.x + enemyBox.w &&
        troggBox.x + troggBox.w > enemyBox.x &&
        troggBox.y < enemyBox.y + enemyBox.h &&
        troggBox.y + troggBox.h > enemyBox.y
      ) {
        this.killTrogg();
      }
    });

    // Clean up dead/off-screen enemies
    this.enemies = this.enemies.filter((e) => e.alive);

    // 2. Balloon Spawner (float upwards from bottom)
    if (this.level.balloonSpawner.enabled) {
      this.balloonTimer++;
      if (this.balloonTimer >= this.level.balloonSpawner.interval) {
        this.balloonTimer = 0;
        const coords = this.level.balloonSpawner.xCoords;
        const spawnX = coords[Math.floor(Math.random() * coords.length)];
        this.enemies.push({
          id: Date.now() + Math.random(),
          type: 'balloon',
          x: spawnX,
          y: CANVAS_HEIGHT + 10,
          vx: 0,
          vy: -1.2,
          width: 20,
          height: 24,
          alive: true,
          facingLeft: false,
          animFrame: 0,
        });
      }
    }

    // 3. Dagger Spawner (swoop down diagonally)
    if (this.level.daggerSpawner.enabled) {
      this.daggerTimer++;
      if (this.daggerTimer >= this.level.daggerSpawner.interval) {
        this.daggerTimer = 0;
        const startXs = this.level.daggerSpawner.startX;
        const spawnX = startXs[Math.floor(Math.random() * startXs.length)];
        this.enemies.push({
          id: Date.now() + Math.random(),
          type: 'dagger',
          x: spawnX,
          y: -15,
          vx: -1.9,
          vy: 2.2,
          width: 22,
          height: 12,
          alive: true,
          facingLeft: true,
          animFrame: 0,
        });
      }
    }
  }

  private checkCollectibles() {
    // Keys
    this.keys.forEach((key) => {
      if (key.collected) return;
      const dist = Math.hypot(this.trogg.x - (key.x + 8), this.trogg.y - 14 - (key.y + 8));
      if (dist < 22) {
        key.collected = true;
        this.score += 500;
        frakAudio.playKeyPickup();

        const allKeysCollected = this.keys.every((k) => k.collected);
        if (allKeysCollected) {
          this.door.isOpen = true;
          frakAudio.playDoorOpen();
        }
        this.notify();
      }
    });

    // Light bulbs
    this.bulbs.forEach((bulb) => {
      if (bulb.collected) return;
      const dist = Math.hypot(this.trogg.x - (bulb.x + 8), this.trogg.y - 14 - (bulb.y + 8));
      if (dist < 22) {
        bulb.collected = true;
        this.score += 300;
        this.timeRemaining = Math.min(this.level.timeLimit, this.timeRemaining + 20);
        this.isInDarkness = false;
        frakAudio.playBulbPickup();
        this.notify();
      }
    });
  }

  private checkDoor() {
    if (!this.door.isOpen) return;

    const doorCenter = {
      x: this.door.x + this.door.width / 2,
      y: this.door.y + this.door.height / 2,
    };

    const dist = Math.hypot(this.trogg.x - doorCenter.x, this.trogg.y - 14 - doorCenter.y);
    if (dist < 26) {
      // Level Cleared!
      this.state = 'LEVEL_CLEAR';
      this.levelClearTimer = 140;
      const timeBonus = this.timeRemaining * 15;
      this.score += 1000 + timeBonus;
      frakAudio.playLevelClear();
      this.notify();
    }
  }
}
