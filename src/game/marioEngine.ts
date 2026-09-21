/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Mario Bros. (1983 Nintendo Arcade) - Physics Engine & Simulation
 * Faithful reproduction of Shigeru Miyamoto's classic coin-op.
 */

import { marioAudio } from './marioAudio';

export type CharacterType = 'MARIO' | 'LUIGI';

export type EnemyType = 'shellcreeper' | 'sidestepper' | 'fighter_fly' | 'slipice';

export interface BumpRipple {
  platformId: number;
  x: number;
  y: number;
  duration: number; // in frames (starts at 12)
  maxDuration: number;
}

export interface Enemy {
  id: number;
  type: EnemyType;
  x: number;
  y: number;
  vx: number;
  vy: number;
  onGround: boolean;
  flipped: boolean;
  flipTimer: number; // frames remaining on back
  maxFlipTimer: number;
  health: number; // for sidesteppers (needs 2 hits)
  isEnraged: boolean; // angry red turbo state
  facing: 1 | -1;
  animFrame: number;
  hopTimer?: number; // for fighter fly
  isKicked: boolean;
  kickVy: number;
}

export interface Coin {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  onGround: boolean;
  value: number;
  collected: boolean;
  animFrame: number;
}

export interface Fireball {
  id: number;
  color: 'red' | 'green';
  x: number;
  y: number;
  vx: number;
  baseY: number;
  waveAngle: number;
  active: boolean;
}

export interface Platform {
  id: number;
  x: number;
  y: number;
  width: number;
  isIcy?: boolean;
}

export interface MarioGameState {
  phase: number;
  score: number;
  lives: number;
  character: CharacterType;
  gameOver: boolean;
  phaseWon: boolean;
  isBonusPhase: boolean;
  bonusTimer: number;
  screenShake: number;
  powUsesLeft: number; // 3 down to 0
  mario: {
    x: number;
    y: number;
    vx: number;
    vy: number;
    onGround: boolean;
    facing: 1 | -1;
    isSkidding: boolean;
    isJumping: boolean;
    animFrame: number;
    invulnerableTimer: number;
    isDead: boolean;
    deathTimer: number;
  };
  enemies: Enemy[];
  coins: Coin[];
  fireballs: Fireball[];
  bumpRipples: BumpRipple[];
  scorePopups: { x: number; y: number; text: string; timer: number }[];
  phaseIntroTimer: number;
  enemiesSpawnedCount: number;
  enemiesToSpawn: number;
  spawnCooldown: number;
}

export const VIRTUAL_WIDTH = 256;
export const VIRTUAL_HEIGHT = 224;

export const INITIAL_PLATFORMS: Platform[] = [
  // Bottom ground
  { id: 0, x: 0, y: 208, width: 256 },
  // Lower tier shelves (left & right)
  { id: 1, x: 0, y: 164, width: 92 },
  { id: 2, x: 164, y: 164, width: 92 },
  // Middle tier shelf (center)
  { id: 3, x: 44, y: 116, width: 168 },
  // Upper tier shelves (left & right)
  { id: 4, x: 0, y: 68, width: 92 },
  { id: 5, x: 164, y: 68, width: 92 },
];

export const POW_BLOCK_RECT = {
  x: 120,
  y: 164,
  width: 16,
  height: 16,
};

export class MarioEngine {
  public state: MarioGameState;
  private nextEnemyId = 1;
  private nextCoinId = 1;
  private nextFireballId = 1;

  constructor(character: CharacterType = 'MARIO') {
    this.state = this.createInitialState(character);
  }

  public reset(character: CharacterType = this.state.character) {
    this.nextEnemyId = 1;
    this.nextCoinId = 1;
    this.nextFireballId = 1;
    this.state = this.createInitialState(character);
    marioAudio.playIntroTheme();
  }

  private createInitialState(character: CharacterType): MarioGameState {
    const isBonus = false;
    return {
      phase: 1,
      score: 0,
      lives: 3,
      character,
      gameOver: false,
      phaseWon: false,
      isBonusPhase: isBonus,
      bonusTimer: 0,
      screenShake: 0,
      powUsesLeft: 3,
      mario: {
        x: 60,
        y: 192,
        vx: 0,
        vy: 0,
        onGround: true,
        facing: 1,
        isSkidding: false,
        isJumping: false,
        animFrame: 0,
        invulnerableTimer: 90,
        isDead: false,
        deathTimer: 0,
      },
      enemies: [],
      coins: [],
      fireballs: [],
      bumpRipples: [],
      scorePopups: [],
      phaseIntroTimer: 100,
      enemiesSpawnedCount: 0,
      enemiesToSpawn: 4,
      spawnCooldown: 60,
    };
  }

  public nextPhase() {
    const nextP = this.state.phase + 1;
    const isBonus = nextP % 3 === 0;
    this.state.phase = nextP;
    this.state.phaseWon = false;
    this.state.isBonusPhase = isBonus;
    this.state.bonusTimer = isBonus ? 20 * 60 : 0; // 20s at 60fps
    this.state.powUsesLeft = isBonus ? 3 : Math.min(3, this.state.powUsesLeft + 1); // recharge on bonus
    this.state.mario.x = 60;
    this.state.mario.y = 192;
    this.state.mario.vx = 0;
    this.state.mario.vy = 0;
    this.state.mario.onGround = true;
    this.state.mario.invulnerableTimer = 90;
    this.state.enemies = [];
    this.state.coins = [];
    this.state.fireballs = [];
    this.state.bumpRipples = [];
    this.state.phaseIntroTimer = 90;
    this.state.enemiesSpawnedCount = 0;
    this.state.enemiesToSpawn = isBonus ? 0 : Math.min(10, 3 + nextP);
    this.state.spawnCooldown = 60;

    // In bonus phase, spawn 10 floating gold coins on platforms
    if (isBonus) {
      const coinPositions = [
        { x: 30, y: 152 }, { x: 70, y: 152 }, { x: 185, y: 152 }, { x: 225, y: 152 },
        { x: 80, y: 104 }, { x: 128, y: 104 }, { x: 176, y: 104 },
        { x: 40, y: 56 }, { x: 215, y: 56 }, { x: 128, y: 196 }
      ];
      coinPositions.forEach(pos => {
        this.state.coins.push({
          id: this.nextCoinId++,
          x: pos.x,
          y: pos.y,
          vx: 0,
          vy: 0,
          onGround: true,
          value: 800,
          collected: false,
          animFrame: 0
        });
      });
    }

    marioAudio.playPhaseClear();
  }

  public update(keys: { left: boolean; right: boolean; jump: boolean; pow: boolean }) {
    if (this.state.gameOver) return;

    // Screen shake decay
    if (this.state.screenShake > 0) {
      this.state.screenShake--;
    }

    // Phase Intro timer
    if (this.state.phaseIntroTimer > 0) {
      this.state.phaseIntroTimer--;
      return;
    }

    // Death animation
    if (this.state.mario.isDead) {
      this.state.mario.deathTimer++;
      this.state.mario.vy += 0.22;
      this.state.mario.y += this.state.mario.vy;
      if (this.state.mario.deathTimer > 110) {
        if (this.state.lives > 1) {
          this.state.lives--;
          this.respawnMario();
        } else {
          this.state.lives = 0;
          this.state.gameOver = true;
        }
      }
      return;
    }

    // Invulnerability decay
    if (this.state.mario.invulnerableTimer > 0) {
      this.state.mario.invulnerableTimer--;
    }

    // Bonus Phase countdown
    if (this.state.isBonusPhase) {
      this.state.bonusTimer--;
      if (this.state.coins.every(c => c.collected)) {
        // Perfection bonus!
        this.addScore(3000, 128, 90, 'PERFECT! +3000');
        this.state.phaseWon = true;
        setTimeout(() => this.nextPhase(), 2000);
      } else if (this.state.bonusTimer <= 0) {
        this.state.phaseWon = true;
        setTimeout(() => this.nextPhase(), 1500);
      }
    }

    // 1. UPDATE MARIO
    this.updateMario(keys);

    // 2. UPDATE BUMP RIPPLES
    this.updateBumpRipples();

    // 3. SPAWN ENEMIES & FIREBALLS
    if (!this.state.isBonusPhase) {
      this.handleSpawning();
    }

    // 4. UPDATE ENEMIES
    this.updateEnemies();

    // 5. UPDATE COINS
    this.updateCoins();

    // 6. UPDATE FIREBALLS
    this.updateFireballs();

    // 7. SCORE POPUPS
    this.state.scorePopups.forEach(p => {
      p.timer--;
      p.y -= 0.4;
    });
    this.state.scorePopups = this.state.scorePopups.filter(p => p.timer > 0);

    // 8. WIN CONDITION (Non-bonus phase)
    if (!this.state.isBonusPhase && !this.state.phaseWon) {
      if (this.state.enemiesSpawnedCount >= this.state.enemiesToSpawn && this.state.enemies.length === 0) {
        this.state.phaseWon = true;
        marioAudio.playPhaseClear();
        setTimeout(() => this.nextPhase(), 2200);
      }
    }
  }

  private updateMario(keys: { left: boolean; right: boolean; jump: boolean; pow: boolean }) {
    const m = this.state.mario;
    const accel = m.onGround ? 0.12 : 0.05;
    const maxSpeed = 1.6;
    const friction = m.onGround ? 0.08 : 0.015;
    const gravity = 0.26;

    // Movement input
    if (keys.left && !keys.right) {
      if (m.vx > 0.4 && m.onGround) {
        // Skidding to halt!
        if (!m.isSkidding) {
          m.isSkidding = true;
          marioAudio.playSkid();
        }
        m.vx -= friction * 2.5;
      } else {
        m.isSkidding = false;
        m.facing = -1;
        m.vx = Math.max(-maxSpeed, m.vx - accel);
      }
    } else if (keys.right && !keys.left) {
      if (m.vx < -0.4 && m.onGround) {
        // Skidding to halt!
        if (!m.isSkidding) {
          m.isSkidding = true;
          marioAudio.playSkid();
        }
        m.vx += friction * 2.5;
      } else {
        m.isSkidding = false;
        m.facing = 1;
        m.vx = Math.min(maxSpeed, m.vx + accel);
      }
    } else {
      // Apply friction
      m.isSkidding = false;
      if (m.vx > 0) {
        m.vx = Math.max(0, m.vx - friction);
      } else if (m.vx < 0) {
        m.vx = Math.min(0, m.vx + friction);
      }
    }

    // Animation frames
    if (m.onGround && Math.abs(m.vx) > 0.1) {
      m.animFrame = (m.animFrame + 0.2) % 3;
    } else if (!m.onGround) {
      m.animFrame = 3; // Jumping frame
    } else {
      m.animFrame = 0; // Standing
    }

    // Jump
    if (keys.jump && m.onGround && !m.isJumping) {
      m.vy = -4.4;
      m.onGround = false;
      m.isJumping = true;
      marioAudio.playJump();
    }
    if (!keys.jump) {
      m.isJumping = false;
    }

    // Gravity
    m.vy += gravity;

    // Apply Velocity
    m.x += m.vx;
    m.y += m.vy;

    // Screen wraparound (Mario exits left, enters right)
    if (m.x < -8) {
      m.x = VIRTUAL_WIDTH + 4;
    } else if (m.x > VIRTUAL_WIDTH + 4) {
      m.x = -8;
    }

    // Platform Collisions
    m.onGround = false;
    const marioFootY = m.y + 16;
    const marioHeadY = m.y;
    const marioCenterX = m.x + 8;

    // 1. Landing on platform (falling downward)
    if (m.vy >= 0) {
      for (const plat of INITIAL_PLATFORMS) {
        if (marioCenterX >= plat.x && marioCenterX <= plat.x + plat.width) {
          if (marioFootY >= plat.y && marioFootY <= plat.y + 8) {
            m.y = plat.y - 16;
            m.vy = 0;
            m.onGround = true;
            break;
          }
        }
      }
      // Landing on POW block if present
      if (this.state.powUsesLeft > 0) {
        if (marioCenterX >= POW_BLOCK_RECT.x && marioCenterX <= POW_BLOCK_RECT.x + POW_BLOCK_RECT.width) {
          if (marioFootY >= POW_BLOCK_RECT.y && marioFootY <= POW_BLOCK_RECT.y + 8) {
            m.y = POW_BLOCK_RECT.y - 16;
            m.vy = 0;
            m.onGround = true;
          }
        }
      }
    }

    // 2. Head-bump underneath platform (jumping upward)
    if (m.vy < 0) {
      // Check platforms
      for (const plat of INITIAL_PLATFORMS) {
        if (plat.id === 0) continue; // ground has no underside
        if (marioCenterX >= plat.x && marioCenterX <= plat.x + plat.width) {
          if (marioHeadY <= plat.y + 8 && marioHeadY >= plat.y) {
            // Bumped underside!
            m.vy = 1.2; // Bounce down
            m.y = plat.y + 8;
            this.triggerPlatformBump(plat.id, marioCenterX, plat.y);
            marioAudio.playBump();
            break;
          }
        }
      }

      // Check POW Block underside
      if (this.state.powUsesLeft > 0) {
        if (marioCenterX >= POW_BLOCK_RECT.x && marioCenterX <= POW_BLOCK_RECT.x + POW_BLOCK_RECT.width) {
          if (marioHeadY <= POW_BLOCK_RECT.y + POW_BLOCK_RECT.height && marioHeadY >= POW_BLOCK_RECT.y) {
            // Hit POW Block!
            m.vy = 1.2;
            m.y = POW_BLOCK_RECT.y + POW_BLOCK_RECT.height;
            this.hitPOWBlock();
          }
        }
      }
    }

    // POW shortcut trigger from UI button
    if (keys.pow && this.state.powUsesLeft > 0) {
      this.hitPOWBlock();
    }
  }

  public hitPOWBlock() {
    if (this.state.powUsesLeft <= 0) return;
    this.state.powUsesLeft--;
    this.state.screenShake = 16;
    marioAudio.playPOW();

    // Flip or enrage ALL grounded enemies on screen!
    this.state.enemies.forEach(e => {
      if (e.onGround && !e.isKicked) {
        this.flipOrEnrageEnemy(e);
      }
    });

    this.addScore(100, POW_BLOCK_RECT.x + 8, POW_BLOCK_RECT.y - 6, 'POW! 100');
  }

  private triggerPlatformBump(platformId: number, x: number, y: number) {
    this.state.bumpRipples.push({
      platformId,
      x,
      y,
      duration: 12,
      maxDuration: 12
    });

    // Check enemies standing directly on this platform near x
    this.state.enemies.forEach(e => {
      if (!e.isKicked && e.onGround) {
        // If enemy is within 26px horizontally and vertically on this platform
        if (Math.abs((e.x + 8) - x) < 26 && Math.abs((e.y + 16) - y) < 8) {
          this.flipOrEnrageEnemy(e);
        }
      }
    });

    // Slipice melt if hit from underneath
    this.state.enemies.forEach(e => {
      if (e.type === 'slipice' && !e.isKicked) {
        if (Math.abs((e.x + 8) - x) < 24 && Math.abs((e.y + 16) - y) < 8) {
          e.isKicked = true;
          e.kickVy = -3.5;
          marioAudio.playKick();
          this.addScore(500, e.x, e.y, 'MELT 500');
        }
      }
    });
  }

  private flipOrEnrageEnemy(e: Enemy) {
    if (e.isKicked) return;

    // Fighter fly is ONLY vulnerable if its feet touch ground!
    if (e.type === 'fighter_fly' && !e.onGround) {
      return;
    }

    if (e.type === 'sidestepper') {
      if (!e.isEnraged && !e.flipped) {
        // 1st hit: Enrages! Turns red & double speed!
        e.isEnraged = true;
        e.vx = e.facing * 1.5;
        e.vy = -1.8; // little pop
        marioAudio.playBump();
        return;
      }
    }

    // Flip enemy onto back!
    if (!e.flipped) {
      e.flipped = true;
      e.flipTimer = 480; // 8 seconds
      e.maxFlipTimer = 480;
      e.vy = -2.5; // launch upwards
      marioAudio.playEnemyFlip();
    } else {
      // Already flipped: bump again rights it!
      e.flipped = false;
      e.flipTimer = 0;
      e.vy = -1.5;
      e.vx = e.facing * (e.isEnraged ? 1.4 : 0.8);
      marioAudio.playBump();
    }
  }

  private updateBumpRipples() {
    this.state.bumpRipples.forEach(r => r.duration--);
    this.state.bumpRipples = this.state.bumpRipples.filter(r => r.duration > 0);
  }

  private handleSpawning() {
    if (this.state.enemiesSpawnedCount >= this.state.enemiesToSpawn) return;

    this.state.spawnCooldown--;
    if (this.state.spawnCooldown <= 0) {
      this.state.spawnCooldown = Math.max(90, 180 - this.state.phase * 15);
      this.spawnEnemy();
    }
  }

  private spawnEnemy() {
    const leftOrRight = Math.random() > 0.5 ? 1 : -1;
    const spawnX = leftOrRight === 1 ? 16 : 240;
    const spawnY = 48; // Top pipes
    const vx = leftOrRight * 0.8;

    // Determine enemy type based on phase
    let type: EnemyType = 'shellcreeper';
    const roll = Math.random();
    if (this.state.phase >= 4 && roll > 0.65) {
      type = 'fighter_fly';
    } else if (this.state.phase >= 2 && roll > 0.4) {
      type = 'sidestepper';
    } else if (this.state.phase >= 3 && Math.random() < 0.25) {
      type = 'slipice';
    }

    const enemy: Enemy = {
      id: this.nextEnemyId++,
      type,
      x: spawnX,
      y: spawnY,
      vx,
      vy: 0,
      onGround: false,
      flipped: false,
      flipTimer: 0,
      maxFlipTimer: 480,
      health: type === 'sidestepper' ? 2 : 1,
      isEnraged: false,
      facing: leftOrRight === 1 ? 1 : -1,
      animFrame: 0,
      hopTimer: type === 'fighter_fly' ? 40 : undefined,
      isKicked: false,
      kickVy: 0,
    };

    this.state.enemies.push(enemy);
    this.state.enemiesSpawnedCount++;
  }

  private updateEnemies() {
    const gravity = 0.22;
    const remainingEnemies = this.state.enemies.filter(e => !e.isKicked);

    // If only 1 enemy remains, enrage it (Turbo last enemy)!
    if (remainingEnemies.length === 1 && !remainingEnemies[0].isEnraged && !remainingEnemies[0].flipped) {
      const last = remainingEnemies[0];
      last.isEnraged = true;
      last.vx = last.facing * 1.6;
    }

    this.state.enemies.forEach(e => {
      // Kicked enemy arcs off screen
      if (e.isKicked) {
        e.kickVy += 0.25;
        e.y += e.kickVy;
        e.x += e.facing * 2;
        return;
      }

      // Flipped on back
      if (e.flipped) {
        e.vy += gravity;
        e.y += e.vy;
        e.animFrame = (e.animFrame + 0.15) % 2;
        e.flipTimer--;

        // Landing check
        for (const plat of INITIAL_PLATFORMS) {
          if (e.x + 8 >= plat.x && e.x + 8 <= plat.x + plat.width) {
            if (e.y + 16 >= plat.y && e.y + 16 <= plat.y + 8) {
              e.y = plat.y - 16;
              e.vy = 0;
              e.onGround = true;
              break;
            }
          }
        }

        // Timer expired: recover and get enraged!
        if (e.flipTimer <= 0) {
          e.flipped = false;
          e.isEnraged = true;
          e.facing = (Math.random() > 0.5 ? 1 : -1) as 1 | -1;
          e.vx = e.facing * (e.type === 'sidestepper' ? 1.5 : 1.2);
          marioAudio.playEnemyFlip();
        }
        return;
      }

      // Active Walking / Hopping enemy
      if (e.type === 'fighter_fly') {
        if (e.hopTimer !== undefined) {
          e.hopTimer--;
          if (e.hopTimer <= 0 && e.onGround) {
            e.vy = -3.8;
            e.onGround = false;
            e.hopTimer = 35 + Math.floor(Math.random() * 25);
          }
        }
      }

      e.vy += gravity;
      e.x += e.vx;
      e.y += e.vy;
      e.animFrame = (e.animFrame + (e.isEnraged ? 0.25 : 0.15)) % 3;

      // Wraparound
      if (e.x < -8) {
        e.x = VIRTUAL_WIDTH + 4;
      } else if (e.x > VIRTUAL_WIDTH + 4) {
        e.x = -8;
      }

      // Platform landing
      e.onGround = false;
      const footY = e.y + 16;
      const centerX = e.x + 8;

      if (e.vy >= 0) {
        for (const plat of INITIAL_PLATFORMS) {
          if (centerX >= plat.x && centerX <= plat.x + plat.width) {
            if (footY >= plat.y && footY <= plat.y + 8) {
              e.y = plat.y - 16;
              e.vy = 0;
              e.onGround = true;
              break;
            }
          }
        }
      }

      // Exit pipes at bottom ground level (y > 200)
      if (e.y >= 192) {
        if (e.x <= 8 && e.vx < 0) {
          // Entered bottom left pipe, wraps back to top right pipe!
          e.x = 240;
          e.y = 48;
          e.facing = -1;
          e.vx = -0.9;
        } else if (e.x >= 240 && e.vx > 0) {
          // Entered bottom right pipe, wraps back to top left pipe!
          e.x = 16;
          e.y = 48;
          e.facing = 1;
          e.vx = 0.9;
        }
      }

      // Mario vs Enemy Collision
      if (!this.state.mario.isDead && this.state.mario.invulnerableTimer <= 0) {
        const mx = this.state.mario.x + 8;
        const my = this.state.mario.y + 8;
        const ex = e.x + 8;
        const ey = e.y + 8;

        if (Math.abs(mx - ex) < 12 && Math.abs(my - ey) < 12) {
          if (e.flipped) {
            // Kick enemy off the screen!
            e.isKicked = true;
            e.facing = (mx < ex ? 1 : -1) as 1 | -1;
            e.kickVy = -3.8;
            marioAudio.playKick();

            const pts = e.isEnraged ? 1600 : 800;
            this.addScore(pts, e.x, e.y, `+${pts}`);

            // Spawn gold coin popping out from top pipe
            this.spawnCoin(Math.random() > 0.5 ? 24 : 232, 48);
          } else {
            // Mario dies!
            this.killMario();
          }
        }
      }
    });

    // Clean up kicked enemies that fell off screen
    this.state.enemies = this.state.enemies.filter(e => e.y < VIRTUAL_HEIGHT + 30);
  }

  private spawnCoin(x: number, y: number) {
    this.state.coins.push({
      id: this.nextCoinId++,
      x,
      y,
      vx: (x < 128 ? 1 : -1) * 1.2,
      vy: -1.5,
      onGround: false,
      value: 800,
      collected: false,
      animFrame: 0
    });
  }

  private updateCoins() {
    const gravity = 0.22;
    this.state.coins.forEach(c => {
      if (c.collected) return;

      c.vy += gravity;
      c.x += c.vx;
      c.y += c.vy;
      c.animFrame = (c.animFrame + 0.2) % 4;

      // Wraparound
      if (c.x < -8) c.x = VIRTUAL_WIDTH + 4;
      if (c.x > VIRTUAL_WIDTH + 4) c.x = -8;

      // Platform landing
      const footY = c.y + 12;
      const centerX = c.x + 6;
      if (c.vy >= 0) {
        for (const plat of INITIAL_PLATFORMS) {
          if (centerX >= plat.x && centerX <= plat.x + plat.width) {
            if (footY >= plat.y && footY <= plat.y + 8) {
              c.y = plat.y - 12;
              c.vy = 0;
              c.onGround = true;
              break;
            }
          }
        }
      }

      // Mario collecting coin
      if (!this.state.mario.isDead) {
        const mx = this.state.mario.x + 8;
        const my = this.state.mario.y + 8;
        if (Math.abs(mx - centerX) < 14 && Math.abs(my - (c.y + 6)) < 14) {
          c.collected = true;
          marioAudio.playCoin();
          this.addScore(c.value, c.x, c.y, `+${c.value}`);
        }
      }
    });

    this.state.coins = this.state.coins.filter(c => !c.collected && c.y < VIRTUAL_HEIGHT + 20);
  }

  private updateFireballs() {
    // Random fireball spawns if phase takes too long
    if (this.state.fireballs.length === 0 && Math.random() < 0.003 && !this.state.isBonusPhase) {
      const isGreen = Math.random() < 0.3;
      this.state.fireballs.push({
        id: this.nextFireballId++,
        color: isGreen ? 'green' : 'red',
        x: Math.random() > 0.5 ? 0 : VIRTUAL_WIDTH,
        y: 60 + Math.random() * 120,
        baseY: 60 + Math.random() * 120,
        vx: (Math.random() > 0.5 ? 1 : -1) * (isGreen ? 2.2 : 1.1),
        waveAngle: 0,
        active: true
      });
      marioAudio.playFireball();
    }

    this.state.fireballs.forEach(f => {
      f.x += f.vx;
      f.waveAngle += 0.08;
      f.y = f.baseY + Math.sin(f.waveAngle) * 14;

      // Collision with Mario
      if (!this.state.mario.isDead && this.state.mario.invulnerableTimer <= 0) {
        const mx = this.state.mario.x + 8;
        const my = this.state.mario.y + 8;
        if (Math.abs(mx - f.x) < 10 && Math.abs(my - f.y) < 10) {
          this.killMario();
        }
      }
    });

    this.state.fireballs = this.state.fireballs.filter(f => f.x > -20 && f.x < VIRTUAL_WIDTH + 20);
  }

  private killMario() {
    const m = this.state.mario;
    m.isDead = true;
    m.deathTimer = 0;
    m.vy = -4.5;
    m.vx = 0;
    marioAudio.playDie();
  }

  private respawnMario() {
    const m = this.state.mario;
    m.x = 60;
    m.y = 192;
    m.vx = 0;
    m.vy = 0;
    m.onGround = true;
    m.isDead = false;
    m.deathTimer = 0;
    m.invulnerableTimer = 120;
    m.isSkidding = false;
  }

  private addScore(pts: number, x: number, y: number, text: string) {
    const prevScore = this.state.score;
    this.state.score += pts;
    this.state.scorePopups.push({ x, y, text, timer: 45 });

    // Extra life at 20,000 points
    if (prevScore < 20000 && this.state.score >= 20000) {
      this.state.lives++;
      marioAudio.playPhaseClear();
    }
  }
}
