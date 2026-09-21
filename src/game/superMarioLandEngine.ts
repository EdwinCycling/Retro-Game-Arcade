/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Super Mario Land (1989 / Nintendo R&D1) - Complete Engine & Renderer
 * 160x144 Native Game Boy Resolution with 4-Shade LCD Matrix
 */

import { gameBoyAudio } from './gameBoyAudio';
import { GAME_BOY_PALETTES, GameBoyPaletteMode } from './gameBoyTypes';
import { saveMarioLandScore, getMarioLandScores } from './gameBoyHighScores';

export type MarioPowerState = 'SMALL' | 'SUPER' | 'SUPERBALL';

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  type: 'brick' | 'sparkle' | 'smoke' | 'score';
  text?: string;
}

export interface Superball {
  x: number;
  y: number;
  vx: number;
  vy: number;
  bounces: number;
  active: boolean;
}

export interface SmlEnemy {
  id: string;
  type: 'chibibo' | 'nokobon' | 'pakkun' | 'gao';
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  alive: boolean;
  state: 'walk' | 'shell_ticking' | 'pipe_rising' | 'pipe_hiding' | 'dead';
  timer: number;
  pipeBaseY?: number;
}

export interface SmlItem {
  type: 'coin' | 'mushroom' | 'flower' | 'heart';
  x: number;
  y: number;
  vx: number;
  vy: number;
  collected: boolean;
}

export interface SmlBlock {
  x: number;
  y: number;
  type: 'brick' | 'question' | 'empty' | 'hard' | 'pyramid' | 'pipe_top' | 'pipe_body' | 'exit_door_top' | 'exit_door_bottom';
  item?: 'coin' | 'mushroom' | 'flower' | 'heart';
  coinsLeft?: number;
  bumpOffsetY: number;
}

export class SuperMarioLandEngine {
  public width = 160;
  public height = 144;

  // Mario physics & state
  public x: number = 24;
  public y: number = 104;
  public vx: number = 0;
  public vy: number = 0;
  public facing: 'left' | 'right' = 'right';
  public isGrounded: boolean = true;
  public isJumping: boolean = false;
  public isCrouching: boolean = false;
  public isSomersault: boolean = false;
  public somersaultAngle: number = 0;
  public powerState: MarioPowerState = 'SMALL';
  public invincibilityTimer: number = 0;
  public shootCooldown: number = 0;

  // Level & Camera
  public world: string = '1-1';
  public cameraX: number = 0;
  public levelWidth: number = 2400;
  public score: number = 0;
  public coins: number = 0;
  public lives: number = 3;
  public time: number = 400;
  public topScore: number = 148500;

  // Level Elements
  public blocks: SmlBlock[] = [];
  public enemies: SmlEnemy[] = [];
  public items: SmlItem[] = [];
  public superballs: Superball[] = [];
  public particles: Particle[] = [];
  public lifts: { x: number; y: number; width: number; vy: number; minY: number; maxY: number }[] = [];

  // Game Lifecycle
  public state: 'TITLE' | 'PLAYING' | 'BONUS_GAME' | 'LEVEL_CLEAR' | 'MARIO_DYING' | 'GAME_OVER' = 'TITLE';
  public titleMenuSelect: number = 0;
  public bonusRouletteStep: number = 0;
  public bonusReward: string | null = null;
  public stateTimer: number = 0;

  // Input states
  private keys: {
    left: boolean;
    right: boolean;
    up: boolean;
    down: boolean;
    a: boolean; // Jump
    b: boolean; // Run / Shoot Superball
  } = { left: false, right: false, up: false, down: false, a: false, b: false };

  public palette: GameBoyPaletteMode = 'dmg';

  constructor() {
    const scores = getMarioLandScores();
    if (scores.length > 0) {
      this.topScore = scores[0].score;
    }
    this.initLevel('1-1');
  }

  public setKey(key: 'left' | 'right' | 'up' | 'down' | 'a' | 'b', pressed: boolean) {
    this.keys[key] = pressed;

    if (this.state === 'TITLE' && pressed && (key === 'a' || key === 'b')) {
      this.startGame();
    }
  }

  public startGame() {
    this.state = 'PLAYING';
    this.score = 0;
    this.coins = 0;
    this.lives = 3;
    this.powerState = 'SMALL';
    this.initLevel('1-1');
    gameBoyAudio.startSuperMarioLandBGM();
  }

  public initLevel(world: string) {
    this.world = world;
    this.x = 24;
    this.y = 104;
    this.vx = 0;
    this.vy = 0;
    this.cameraX = 0;
    this.time = 400;
    this.isGrounded = true;
    this.superballs = [];
    this.particles = [];
    this.items = [];
    this.enemies = [];
    this.blocks = [];
    this.lifts = [];

    if (world.startsWith('1-')) {
      this.buildBirabutoLevel(world);
    } else if (world.startsWith('2-')) {
      this.buildMudaLevel(world);
    } else if (world.startsWith('3-')) {
      this.buildEastonLevel(world);
    } else {
      this.buildChaiLevel(world);
    }
  }

  private buildBirabutoLevel(subWorld: string) {
    const floorY = 120;
    this.levelWidth = subWorld === '1-3' ? 1800 : 2800;

    for (let x = 0; x < this.levelWidth; x += 16) {
      if ((x >= 380 && x <= 420) || (x >= 920 && x <= 970) || (x >= 1480 && x <= 1530) || (x >= 2100 && x <= 2160)) {
        continue;
      }
      this.blocks.push({ x, y: floorY, type: 'pyramid', bumpOffsetY: 0 });
      this.blocks.push({ x, y: floorY + 16, type: 'hard', bumpOffsetY: 0 });
    }

    const blockLayout: { x: number; y: number; type: SmlBlock['type']; item?: SmlItem['type'] }[] = [
      { x: 120, y: 88, type: 'question', item: 'mushroom' },
      { x: 152, y: 88, type: 'brick' },
      { x: 168, y: 88, type: 'question', item: 'coin' },
      { x: 184, y: 88, type: 'brick' },
      { x: 200, y: 88, type: 'question', item: 'flower' },
      { x: 340, y: 96, type: 'pipe_top' },
      { x: 340, y: 112, type: 'pipe_body' },
      { x: 500, y: 104, type: 'pyramid' },
      { x: 516, y: 88, type: 'pyramid' },
      { x: 680, y: 80, type: 'question', item: 'heart' },
      { x: 1100, y: 96, type: 'pipe_top' },
      { x: 1100, y: 112, type: 'pipe_body' },
      { x: 1700, y: 88, type: 'pyramid' },
      { x: 2300, y: 104, type: 'exit_door_bottom' },
      { x: 2300, y: 40, type: 'exit_door_top' },
      { x: 2300, y: 56, type: 'hard' },
      { x: 2300, y: 72, type: 'hard' },
      { x: 2300, y: 88, type: 'hard' }
    ];

    blockLayout.forEach(b => {
      this.blocks.push({ x: b.x, y: b.y, type: b.type, item: b.item, bumpOffsetY: 0 });
    });

    this.enemies = [
      { id: '1', type: 'chibibo', x: 230, y: 106, vx: -0.5, vy: 0, width: 14, height: 14, alive: true, state: 'walk', timer: 0 },
      { id: '2', type: 'nokobon', x: 450, y: 106, vx: -0.4, vy: 0, width: 14, height: 14, alive: true, state: 'walk', timer: 0 },
      { id: '3', type: 'gao', x: 1250, y: 104, vx: -0.3, vy: 0, width: 16, height: 16, alive: true, state: 'walk', timer: 0 }
    ];
  }

  private buildMudaLevel(subWorld: string) {
    const floorY = 120;
    this.levelWidth = 3000;

    for (let x = 0; x < this.levelWidth; x += 16) {
      if ((x >= 200 && x <= 260) || (x >= 600 && x <= 680) || (x >= 1200 && x <= 1280) || (x >= 1800 && x <= 1880)) {
        continue;
      }
      this.blocks.push({ x, y: floorY, type: 'hard', bumpOffsetY: 0 });
    }

    this.blocks.push(
      { x: 150, y: 88, type: 'question', item: 'mushroom', bumpOffsetY: 0 },
      { x: 400, y: 72, type: 'question', item: 'flower', bumpOffsetY: 0 },
      { x: 2500, y: 104, type: 'exit_door_bottom', bumpOffsetY: 0 },
      { x: 2500, y: 40, type: 'exit_door_top', bumpOffsetY: 0 }
    );

    this.enemies = [
      { id: 'm1', type: 'nokobon', x: 300, y: 106, vx: -0.6, vy: 0, width: 14, height: 14, alive: true, state: 'walk', timer: 0 },
      { id: 'm2', type: 'chibibo', x: 800, y: 106, vx: -0.5, vy: 0, width: 14, height: 14, alive: true, state: 'walk', timer: 0 },
      { id: 'm3', type: 'gao', x: 1500, y: 104, vx: -0.4, vy: 0, width: 16, height: 16, alive: true, state: 'walk', timer: 0 }
    ];
  }

  private buildEastonLevel(subWorld: string) {
    const floorY = 120;
    this.levelWidth = 3200;

    for (let x = 0; x < this.levelWidth; x += 16) {
      if ((x >= 500 && x <= 580) || (x >= 1400 && x <= 1480) || (x >= 2200 && x <= 2280)) {
        continue;
      }
      this.blocks.push({ x, y: floorY, type: 'pyramid', bumpOffsetY: 0 });
    }

    this.blocks.push(
      { x: 200, y: 88, type: 'question', item: 'flower', bumpOffsetY: 0 },
      { x: 2700, y: 104, type: 'exit_door_bottom', bumpOffsetY: 0 },
      { x: 2700, y: 40, type: 'exit_door_top', bumpOffsetY: 0 }
    );

    this.enemies = [
      { id: 'e1', type: 'gao', x: 400, y: 104, vx: -0.5, vy: 0, width: 16, height: 16, alive: true, state: 'walk', timer: 0 },
      { id: 'e2', type: 'nokobon', x: 1000, y: 106, vx: -0.6, vy: 0, width: 14, height: 14, alive: true, state: 'walk', timer: 0 }
    ];
  }

  private buildChaiLevel(subWorld: string) {
    const floorY = 120;
    this.levelWidth = 3400;

    for (let x = 0; x < this.levelWidth; x += 16) {
      if ((x >= 700 && x <= 780) || (x >= 1600 && x <= 1680) || (x >= 2500 && x <= 2580)) {
        continue;
      }
      this.blocks.push({ x, y: floorY, type: 'hard', bumpOffsetY: 0 });
    }

    this.blocks.push(
      { x: 180, y: 88, type: 'question', item: 'flower', bumpOffsetY: 0 },
      { x: 2900, y: 104, type: 'exit_door_bottom', bumpOffsetY: 0 },
      { x: 2900, y: 40, type: 'exit_door_top', bumpOffsetY: 0 }
    );

    this.enemies = [
      { id: 'c1', type: 'gao', x: 500, y: 104, vx: -0.6, vy: 0, width: 16, height: 16, alive: true, state: 'walk', timer: 0 },
      { id: 'c2', type: 'chibibo', x: 1200, y: 106, vx: -0.5, vy: 0, width: 14, height: 14, alive: true, state: 'walk', timer: 0 },
      { id: 'c3', type: 'gao', x: 2000, y: 104, vx: -0.7, vy: 0, width: 16, height: 16, alive: true, state: 'walk', timer: 0 }
    ];
  }

  public update(dt: number) {
    if (this.state === 'PLAYING') {
      this.updatePlaying(dt);
    } else if (this.state === 'BONUS_GAME') {
      this.updateBonusGame(dt);
    } else if (this.state === 'LEVEL_CLEAR') {
      this.stateTimer += dt;
      if (this.stateTimer > 3.0) {
        const progression: Record<string, string> = {
          '1-1': '1-2',
          '1-2': '1-3',
          '1-3': '2-1',
          '2-1': '2-2',
          '2-2': '2-3',
          '2-3': '3-1',
          '3-1': '3-2',
          '3-2': '3-3',
          '3-3': '4-1',
          '4-1': '4-2',
          '4-2': '4-3',
          '4-3': '1-1'
        };
        const nextWorld = progression[this.world] || '1-1';
        this.initLevel(nextWorld);
        this.state = 'PLAYING';
        gameBoyAudio.startSuperMarioLandBGM();
      }
    } else if (this.state === 'MARIO_DYING') {
      this.vy += 0.25;
      this.y += this.vy;
      this.stateTimer += dt;
      if (this.stateTimer > 2.5) {
        this.lives--;
        if (this.lives <= 0) {
          this.state = 'GAME_OVER';
          saveMarioLandScore({
            initials: 'MAR',
            score: this.score,
            world: this.world,
            coins: this.coins
          });
        } else {
          this.powerState = 'SMALL';
          this.initLevel(this.world);
          this.state = 'PLAYING';
          gameBoyAudio.startSuperMarioLandBGM();
        }
      }
    }
  }

  private updatePlaying(dt: number) {
    // Timer countdown
    this.time -= dt * 1.5;
    if (this.time <= 0) {
      this.killMario();
      return;
    }

    if (this.invincibilityTimer > 0) {
      this.invincibilityTimer -= dt;
    }
    if (this.shootCooldown > 0) {
      this.shootCooldown -= dt;
    }

    // Horizontal Movement
    const maxSpeed = this.keys.b ? 2.4 : 1.6;
    const accel = 0.15;
    const friction = 0.85;

    if (this.keys.left) {
      this.vx -= accel;
      this.facing = 'left';
    } else if (this.keys.right) {
      this.vx += accel;
      this.facing = 'right';
    } else {
      this.vx *= friction;
      if (Math.abs(this.vx) < 0.05) this.vx = 0;
    }

    this.vx = Math.max(-maxSpeed, Math.min(maxSpeed, this.vx));

    // Jump Input
    if (this.keys.a && this.isGrounded && !this.isJumping) {
      this.vy = -4.8;
      this.isGrounded = false;
      this.isJumping = true;
      gameBoyAudio.playMarioJump(this.powerState !== 'SMALL');

      // Somersault when running fast
      if (Math.abs(this.vx) > 1.8) {
        this.isSomersault = true;
        this.somersaultAngle = 0;
      } else {
        this.isSomersault = false;
      }
    }

    // Gravity
    this.vy += 0.28;
    if (this.vy > 6) this.vy = 6;

    // Apply Velocity
    this.x += this.vx;
    this.resolveHorizontalCollisions();

    this.y += this.vy;
    this.resolveVerticalCollisions();

    if (this.isSomersault) {
      this.somersaultAngle += (this.facing === 'right' ? 1 : -1) * 20;
    }

    // Shoot Superball (B Button)
    if (this.keys.b && this.powerState === 'SUPERBALL' && this.shootCooldown <= 0 && this.superballs.length < 2) {
      this.shootCooldown = 0.35;
      const ballVx = this.facing === 'right' ? 3.0 : -3.0;
      this.superballs.push({
        x: this.x + (this.facing === 'right' ? 12 : -4),
        y: this.y + 12,
        vx: ballVx,
        vy: 2.2,
        bounces: 0,
        active: true
      });
      gameBoyAudio.playSuperballShoot();
    }

    // Update Superballs
    this.updateSuperballs();

    // Update Moving Lifts
    this.lifts.forEach(lift => {
      lift.y += lift.vy;
      if (lift.y <= lift.minY || lift.y >= lift.maxY) {
        lift.vy *= -1;
      }

      // Mario standing on lift
      const marioBottom = this.y + (this.powerState === 'SMALL' ? 16 : 24);
      if (this.x + 12 > lift.x && this.x < lift.x + lift.width &&
          marioBottom >= lift.y && marioBottom <= lift.y + 8 && this.vy >= 0) {
        this.y = lift.y - (this.powerState === 'SMALL' ? 16 : 24);
        this.vy = 0;
        this.isGrounded = true;
        this.x += (lift.vy > 0 ? 0 : 0); // follow platform
      }
    });

    // Update Enemies
    this.updateEnemies(dt);

    // Update Items
    this.updateItems();

    // Update Particles
    this.updateParticles(dt);

    // Camera follow Mario (never moves backward)
    const targetCamX = this.x - 70;
    if (targetCamX > this.cameraX) {
      this.cameraX = Math.min(this.levelWidth - this.width, targetCamX);
    }
    if (this.x < this.cameraX) {
      this.x = this.cameraX;
      this.vx = 0;
    }

    // Check Bottom Pit Fall
    if (this.y > 150) {
      this.killMario();
    }
  }

  private resolveHorizontalCollisions() {
    const marioH = this.powerState === 'SMALL' ? 16 : 24;
    const marioW = 12;

    this.blocks.forEach(b => {
      if (b.type === 'empty') return;
      if (this.x + marioW > b.x && this.x < b.x + 16 &&
          this.y + marioH > b.y && this.y < b.y + 16) {
        if (this.vx > 0) {
          this.x = b.x - marioW;
          this.vx = 0;
        } else if (this.vx < 0) {
          this.x = b.x + 16;
          this.vx = 0;
        }
      }
    });
  }

  private resolveVerticalCollisions() {
    const marioH = this.powerState === 'SMALL' ? 16 : 24;
    const marioW = 12;
    this.isGrounded = false;

    this.blocks.forEach(b => {
      if (b.type === 'empty') return;

      // Check Exit Doors
      if (this.x + marioW > b.x && this.x < b.x + 16 &&
          this.y + marioH > b.y && this.y < b.y + 16) {
        if (b.type === 'exit_door_top') {
          this.triggerBonusGame();
          return;
        } else if (b.type === 'exit_door_bottom') {
          this.triggerStageClear();
          return;
        }
      }

      if (this.x + marioW > b.x + 2 && this.x < b.x + 14) {
        // Landing on top of block
        if (this.vy >= 0 && this.y + marioH >= b.y && this.y + marioH <= b.y + 10) {
          this.y = b.y - marioH;
          this.vy = 0;
          this.isGrounded = true;
          this.isJumping = false;
          this.isSomersault = false;
        }
        // Hitting block from below
        else if (this.vy < 0 && this.y <= b.y + 16 && this.y >= b.y + 8) {
          this.y = b.y + 16;
          this.vy = 0;
          this.hitBlock(b);
        }
      }
    });
  }

  private hitBlock(b: SmlBlock) {
    if (b.type === 'question') {
      b.type = 'empty';
      b.bumpOffsetY = -4;
      if (b.item === 'coin') {
        this.coins++;
        this.score += 100;
        gameBoyAudio.playCoin();
        this.particles.push({ x: b.x + 4, y: b.y - 12, vx: 0, vy: -2, life: 0.5, type: 'sparkle' });
      } else if (b.item === 'mushroom' || b.item === 'flower' || b.item === 'heart') {
        this.items.push({
          type: b.item,
          x: b.x,
          y: b.y - 16,
          vx: 0.8,
          vy: -1.5,
          collected: false
        });
        gameBoyAudio.playPowerUp();
      }
    } else if (b.type === 'brick') {
      if (this.powerState !== 'SMALL') {
        b.type = 'empty';
        gameBoyAudio.playBrickSmash();
        this.score += 50;
        // 4 brick fragment particles
        for (let i = 0; i < 4; i++) {
          this.particles.push({
            x: b.x + (i % 2) * 8,
            y: b.y + Math.floor(i / 2) * 8,
            vx: (i % 2 === 0 ? -1 : 1) * 1.5,
            vy: -2.5 - Math.random() * 1.5,
            life: 1.0,
            type: 'brick'
          });
        }
      } else {
        b.bumpOffsetY = -3;
        gameBoyAudio.playStomp();
      }
    }
  }

  private updateSuperballs() {
    this.superballs.forEach(ball => {
      if (!ball.active) return;
      ball.x += ball.vx;
      ball.y += ball.vy;

      // Bounce off boundaries and blocks
      this.blocks.forEach(b => {
        if (b.type === 'empty') return;
        if (ball.x >= b.x && ball.x <= b.x + 16 && ball.y >= b.y && ball.y <= b.y + 16) {
          ball.vy *= -1;
          ball.bounces++;
          gameBoyAudio.playSuperballBounce();
          if (ball.bounces > 5) ball.active = false;
        }
      });

      // Hit enemies
      this.enemies.forEach(e => {
        if (!e.alive) return;
        if (ball.x >= e.x && ball.x <= e.x + e.width && ball.y >= e.y && ball.y <= e.y + e.height) {
          e.alive = false;
          ball.active = false;
          this.score += 400;
          gameBoyAudio.playStomp();
          this.particles.push({ x: e.x, y: e.y, vx: 0, vy: -1.5, life: 0.6, type: 'score', text: '400' });
        }
      });

      if (ball.y > 144 || ball.x < this.cameraX || ball.x > this.cameraX + 170) {
        ball.active = false;
      }
    });

    this.superballs = this.superballs.filter(b => b.active);
  }

  private updateEnemies(dt: number) {
    const marioH = this.powerState === 'SMALL' ? 16 : 24;
    const marioW = 12;

    this.enemies.forEach(e => {
      if (!e.alive) return;

      if (e.type === 'chibibo' || e.type === 'nokobon' || e.type === 'gao') {
        if (e.state === 'walk') {
          e.x += e.vx;
          // Reverse on blocks/walls
          this.blocks.forEach(b => {
            if (b.type === 'empty') return;
            if (e.x + e.width > b.x && e.x < b.x + 16 && e.y + e.height > b.y && e.y < b.y + 16) {
              e.vx *= -1;
            }
          });
        } else if (e.state === 'shell_ticking') {
          e.timer += dt;
          if (e.timer >= 1.6) {
            // Nokobon shell explodes!
            e.alive = false;
            gameBoyAudio.playBrickSmash();
            for (let i = 0; i < 6; i++) {
              this.particles.push({
                x: e.x + 8,
                y: e.y + 8,
                vx: (Math.random() - 0.5) * 4,
                vy: (Math.random() - 0.5) * 4,
                life: 0.6,
                type: 'smoke'
              });
            }
          }
        }
      }

      // Check collision with Mario
      if (this.x + marioW > e.x && this.x < e.x + e.width &&
          this.y + marioH > e.y && this.y < e.y + e.height) {
        // Stomping enemy from above
        if (this.vy > 0 && this.y + marioH <= e.y + 10) {
          this.vy = -3.5;
          gameBoyAudio.playStomp();

          if (e.type === 'chibibo') {
            e.alive = false;
            this.score += 100;
            this.particles.push({ x: e.x, y: e.y, vx: 0, vy: -1.2, life: 0.5, type: 'score', text: '100' });
          } else if (e.type === 'nokobon') {
            e.state = 'shell_ticking';
            e.timer = 0;
            e.vx = 0;
            this.score += 200;
          } else if (e.type === 'gao') {
            e.alive = false;
            this.score += 800;
          }
        } else if (this.invincibilityTimer <= 0 && e.state !== 'shell_ticking') {
          this.takeDamage();
        }
      }
    });
  }

  private updateItems() {
    const marioH = this.powerState === 'SMALL' ? 16 : 24;
    const marioW = 12;

    this.items.forEach(item => {
      if (item.collected) return;
      item.x += item.vx;
      item.vy += 0.2;
      item.y += item.vy;

      // Ground collision
      this.blocks.forEach(b => {
        if (b.type === 'empty') return;
        if (item.x + 12 > b.x && item.x < b.x + 16 && item.y + 14 >= b.y && item.y + 14 <= b.y + 8) {
          item.y = b.y - 14;
          item.vy = 0;
        }
      });

      // Mario pickup
      if (this.x + marioW > item.x && this.x < item.x + 14 &&
          this.y + marioH > item.y && this.y < item.y + 14) {
        item.collected = true;
        if (item.type === 'mushroom') {
          if (this.powerState === 'SMALL') this.powerState = 'SUPER';
          this.score += 400;
          gameBoyAudio.playPowerUp();
        } else if (item.type === 'flower') {
          this.powerState = 'SUPERBALL';
          this.score += 1000;
          gameBoyAudio.playPowerUp();
        } else if (item.type === 'heart') {
          this.lives++;
          this.score += 1000;
          gameBoyAudio.playPowerUp();
        }
      }
    });

    this.items = this.items.filter(i => !i.collected);
  }

  private updateParticles(dt: number) {
    this.particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.15;
      p.life -= dt;
    });
    this.particles = this.particles.filter(p => p.life > 0);

    // Ease bump offsets
    this.blocks.forEach(b => {
      if (b.bumpOffsetY < 0) {
        b.bumpOffsetY += 0.5;
        if (b.bumpOffsetY > 0) b.bumpOffsetY = 0;
      }
    });
  }

  private takeDamage() {
    if (this.powerState === 'SUPERBALL') {
      this.powerState = 'SUPER';
      this.invincibilityTimer = 2.0;
      gameBoyAudio.playPowerDown();
    } else if (this.powerState === 'SUPER') {
      this.powerState = 'SMALL';
      this.invincibilityTimer = 2.0;
      gameBoyAudio.playPowerDown();
    } else {
      this.killMario();
    }
  }

  public killMario() {
    if (this.state === 'MARIO_DYING') return;
    this.state = 'MARIO_DYING';
    this.stateTimer = 0;
    this.vy = -5.0;
    this.vx = 0;
    gameBoyAudio.playMarioDeath();
  }

  public triggerStageClear() {
    this.state = 'LEVEL_CLEAR';
    this.stateTimer = 0;
    this.score += Math.floor(this.time) * 10;
    gameBoyAudio.playStageClear();
  }

  public triggerBonusGame() {
    this.state = 'BONUS_GAME';
    this.bonusRouletteStep = 0;
    this.stateTimer = 0;
    this.bonusReward = null;
    gameBoyAudio.playStageClear();
  }

  private updateBonusGame(dt: number) {
    this.stateTimer += dt;
    if (this.stateTimer > 0.15 && !this.bonusReward) {
      this.bonusRouletteStep = (this.bonusRouletteStep + 1) % 4;
      this.stateTimer = 0;
    }

    if (this.keys.a && !this.bonusReward) {
      const rewards = ['1-UP ❤️', '2-UP ❤️❤️', '3-UP ❤️❤️❤️', 'SUPERBALL 🌸'];
      this.bonusReward = rewards[this.bonusRouletteStep];
      if (this.bonusRouletteStep === 0) this.lives += 1;
      else if (this.bonusRouletteStep === 1) this.lives += 2;
      else if (this.bonusRouletteStep === 2) this.lives += 3;
      else if (this.bonusRouletteStep === 3) this.powerState = 'SUPERBALL';

      gameBoyAudio.playPowerUp();
      setTimeout(() => {
        this.initLevel('1-1');
        this.state = 'PLAYING';
        gameBoyAudio.startSuperMarioLandBGM();
      }, 2500);
    }
  }

  // ==========================================
  // RENDERER (4-SHADE LCD MATRIX)
  // ==========================================

  public render(ctx: CanvasRenderingContext2D) {
    const pal = GAME_BOY_PALETTES[this.palette].colors;
    const [c0, c1, c2, c3] = pal; // Lightest to Darkest

    // Clear Screen (Color 0)
    ctx.fillStyle = c0;
    ctx.fillRect(0, 0, this.width, this.height);

    if (this.state === 'TITLE') {
      this.renderTitle(ctx, pal);
      return;
    }

    if (this.state === 'BONUS_GAME') {
      this.renderBonusGame(ctx, pal);
      return;
    }

    // Save camera transform
    ctx.save();
    ctx.translate(-Math.floor(this.cameraX), 0);

    // Background Egyptian Pyramids & Palm Trees
    this.renderBackground(ctx, pal);

    // Render Blocks
    this.blocks.forEach(b => {
      if (b.x + 16 < this.cameraX || b.x > this.cameraX + this.width) return;
      this.renderBlock(ctx, b, pal);
    });

    // Render Moving Lifts
    ctx.fillStyle = c2;
    this.lifts.forEach(lift => {
      ctx.fillRect(lift.x, lift.y, lift.width, 6);
      ctx.fillStyle = c3;
      ctx.fillRect(lift.x + 2, lift.y + 1, lift.width - 4, 4);
    });

    // Render Items
    this.items.forEach(item => {
      this.renderItem(ctx, item, pal);
    });

    // Render Enemies
    this.enemies.forEach(e => {
      if (!e.alive) return;
      if (e.x + e.width < this.cameraX || e.x > this.cameraX + this.width) return;
      this.renderEnemy(ctx, e, pal);
    });

    // Render Superballs
    ctx.fillStyle = c3;
    this.superballs.forEach(ball => {
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, 3, 0, Math.PI * 2);
      ctx.fill();
    });

    // Render Mario
    this.renderMario(ctx, pal);

    // Render Particles
    this.particles.forEach(p => {
      if (p.type === 'score' && p.text) {
        ctx.fillStyle = c3;
        ctx.font = 'bold 9px monospace';
        ctx.fillText(p.text, p.x, p.y);
      } else {
        ctx.fillStyle = c2;
        ctx.fillRect(p.x, p.y, 3, 3);
      }
    });

    ctx.restore();

    // Top HUD
    this.renderHUD(ctx, pal);
  }

  private renderBackground(ctx: CanvasRenderingContext2D, pal: string[]) {
    const [, c1, c2] = pal;

    // Distant pyramids with parallax
    const bgParallax = this.cameraX * 0.3;
    for (let i = 0; i < 6; i++) {
      const px = i * 200 - (bgParallax % 200);
      ctx.fillStyle = c1;
      ctx.beginPath();
      ctx.moveTo(px, 120);
      ctx.lineTo(px + 40, 75);
      ctx.lineTo(px + 80, 120);
      ctx.fill();

      // Shadow side of pyramid
      ctx.fillStyle = c2;
      ctx.beginPath();
      ctx.moveTo(px + 40, 75);
      ctx.lineTo(px + 80, 120);
      ctx.lineTo(px + 50, 120);
      ctx.fill();
    }
  }

  private renderBlock(ctx: CanvasRenderingContext2D, b: SmlBlock, pal: string[]) {
    const [c0, c1, c2, c3] = pal;
    const y = b.y + b.bumpOffsetY;

    if (b.type === 'pyramid') {
      ctx.fillStyle = c2;
      ctx.fillRect(b.x, y, 16, 16);
      ctx.fillStyle = c1;
      ctx.fillRect(b.x + 2, y + 2, 12, 12);
      ctx.fillStyle = c3;
      ctx.fillRect(b.x + 4, y + 4, 8, 8);
    } else if (b.type === 'question') {
      ctx.fillStyle = c2;
      ctx.fillRect(b.x, y, 16, 16);
      ctx.fillStyle = c1;
      ctx.fillRect(b.x + 1, y + 1, 14, 14);
      ctx.fillStyle = c3;
      ctx.font = 'bold 11px monospace';
      ctx.fillText('?', b.x + 4, y + 12);
    } else if (b.type === 'brick') {
      ctx.fillStyle = c3;
      ctx.fillRect(b.x, y, 16, 16);
      ctx.fillStyle = c2;
      ctx.fillRect(b.x + 1, y + 1, 6, 6);
      ctx.fillRect(b.x + 9, y + 1, 6, 6);
      ctx.fillRect(b.x + 1, y + 9, 6, 6);
      ctx.fillRect(b.x + 9, y + 9, 6, 6);
    } else if (b.type === 'empty') {
      ctx.fillStyle = c2;
      ctx.fillRect(b.x, y, 16, 16);
      ctx.fillStyle = c1;
      ctx.fillRect(b.x + 2, y + 2, 12, 12);
    } else if (b.type === 'pipe_top') {
      ctx.fillStyle = c3;
      ctx.fillRect(b.x - 2, y, 20, 16);
      ctx.fillStyle = c1;
      ctx.fillRect(b.x, y + 2, 16, 12);
      ctx.fillStyle = c2;
      ctx.fillRect(b.x + 3, y + 3, 10, 10);
    } else if (b.type === 'pipe_body') {
      ctx.fillStyle = c3;
      ctx.fillRect(b.x, y, 16, 16);
      ctx.fillStyle = c1;
      ctx.fillRect(b.x + 2, y, 12, 16);
    } else if (b.type === 'exit_door_top' || b.type === 'exit_door_bottom') {
      ctx.fillStyle = c3;
      ctx.fillRect(b.x, y, 16, 16);
      ctx.fillStyle = c0;
      ctx.fillRect(b.x + 3, y + 2, 10, 12);
    } else if (b.type === 'hard') {
      ctx.fillStyle = c3;
      ctx.fillRect(b.x, y, 16, 16);
      ctx.fillStyle = c2;
      ctx.fillRect(b.x + 2, y + 2, 12, 12);
    }
  }

  private renderMario(ctx: CanvasRenderingContext2D, pal: string[]) {
    const [, c1, c2, c3] = pal;
    const isFlash = this.invincibilityTimer > 0 && Math.floor(this.invincibilityTimer * 10) % 2 === 0;
    if (isFlash) return;

    ctx.save();
    ctx.translate(Math.floor(this.x + 6), Math.floor(this.y + (this.powerState === 'SMALL' ? 8 : 12)));

    if (this.isSomersault) {
      ctx.rotate((this.somersaultAngle * Math.PI) / 180);
    } else if (this.facing === 'left') {
      ctx.scale(-1, 1);
    }

    if (this.powerState === 'SMALL') {
      // Small Mario (12x16)
      ctx.fillStyle = c3;
      // Cap & head
      ctx.fillRect(-5, -8, 10, 4);
      ctx.fillRect(-3, -4, 8, 4);
      // Body & overalls
      ctx.fillStyle = c2;
      ctx.fillRect(-4, 0, 8, 5);
      // Feet
      ctx.fillStyle = c3;
      ctx.fillRect(-5, 5, 4, 3);
      ctx.fillRect(1, 5, 4, 3);
    } else {
      // Super / Superball Mario (14x24)
      ctx.fillStyle = this.powerState === 'SUPERBALL' ? c1 : c3;
      ctx.fillRect(-6, -12, 12, 5);
      ctx.fillRect(-4, -7, 10, 5);
      // Overalls
      ctx.fillStyle = c2;
      ctx.fillRect(-5, -2, 10, 8);
      // Legs & shoes
      ctx.fillStyle = c3;
      ctx.fillRect(-6, 6, 5, 6);
      ctx.fillRect(1, 6, 5, 6);
    }

    ctx.restore();
  }

  private renderEnemy(ctx: CanvasRenderingContext2D, e: SmlEnemy, pal: string[]) {
    const [c0, c1, c2, c3] = pal;

    if (e.type === 'chibibo') {
      // Walking Mushroom
      ctx.fillStyle = c3;
      ctx.beginPath();
      ctx.arc(e.x + 7, e.y + 6, 6, Math.PI, 0);
      ctx.fill();
      ctx.fillStyle = c2;
      ctx.fillRect(e.x + 3, e.y + 6, 8, 5);
      ctx.fillStyle = c3;
      ctx.fillRect(e.x + 1, e.y + 11, 4, 3);
      ctx.fillRect(e.x + 9, e.y + 11, 4, 3);
    } else if (e.type === 'nokobon') {
      // Exploding Shell Turtle
      ctx.fillStyle = e.state === 'shell_ticking' ? (Math.floor(e.timer * 8) % 2 === 0 ? c0 : c3) : c3;
      ctx.fillRect(e.x + 2, e.y + 2, 10, 10);
      ctx.fillStyle = c2;
      ctx.fillRect(e.x + 4, e.y + 4, 6, 6);
    } else if (e.type === 'gao') {
      // Egyptian Sphinx
      ctx.fillStyle = c3;
      ctx.fillRect(e.x, e.y + 4, 16, 12);
      ctx.fillStyle = c1;
      ctx.fillRect(e.x + 2, e.y + 6, 6, 4);
    } else if (e.type === 'pakkun') {
      // Piranha Plant
      ctx.fillStyle = c3;
      ctx.fillRect(e.x + 2, e.y, 12, 10);
      ctx.fillStyle = c0;
      ctx.fillRect(e.x + 4, e.y + 3, 4, 4);
    }
  }

  private renderItem(ctx: CanvasRenderingContext2D, item: SmlItem, pal: string[]) {
    const [c0, c1, c2, c3] = pal;
    if (item.type === 'mushroom') {
      ctx.fillStyle = c3;
      ctx.beginPath();
      ctx.arc(item.x + 7, item.y + 6, 6, Math.PI, 0);
      ctx.fill();
      ctx.fillStyle = c1;
      ctx.fillRect(item.x + 4, item.y + 6, 6, 6);
    } else if (item.type === 'flower') {
      ctx.fillStyle = c3;
      ctx.beginPath();
      ctx.arc(item.x + 7, item.y + 7, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = c0;
      ctx.beginPath();
      ctx.arc(item.x + 7, item.y + 7, 2, 0, Math.PI * 2);
      ctx.fill();
    } else if (item.type === 'heart') {
      ctx.fillStyle = c3;
      ctx.font = 'bold 12px monospace';
      ctx.fillText('❤️', item.x, item.y + 12);
    }
  }

  private renderHUD(ctx: CanvasRenderingContext2D, pal: string[]) {
    const [, , , c3] = pal;
    ctx.fillStyle = c3;
    ctx.font = 'bold 8px monospace';

    // MARIO  WORLD  TIME
    ctx.fillText('MARIO', 8, 9);
    ctx.fillText(String(this.score).padStart(6, '0'), 8, 18);

    ctx.fillText(`🪙x${String(this.coins).padStart(2, '0')}`, 64, 9);
    ctx.fillText(`❤️x${this.lives}`, 64, 18);

    ctx.fillText('WORLD', 106, 9);
    ctx.fillText(this.world, 114, 18);

    ctx.fillText('TIME', 136, 9);
    ctx.fillText(String(Math.max(0, Math.floor(this.time))).padStart(3, '0'), 140, 18);
  }

  private renderTitle(ctx: CanvasRenderingContext2D, pal: string[]) {
    const [c0, c1, c2, c3] = pal;

    ctx.fillStyle = c3;
    ctx.fillRect(0, 0, 160, 144);

    ctx.fillStyle = c0;
    ctx.fillRect(8, 8, 144, 128);

    ctx.fillStyle = c3;
    ctx.font = 'bold 12px monospace';
    ctx.fillText('SUPER', 24, 28);
    ctx.font = 'bold 14px monospace';
    ctx.fillText('MARIO LAND', 24, 44);

    ctx.fillStyle = c2;
    ctx.font = '8px monospace';
    ctx.fillText('©1989 NINTENDO', 32, 60);

    // Birabuto Pyramid Icon
    ctx.fillStyle = c1;
    ctx.beginPath();
    ctx.moveTo(80, 70);
    ctx.lineTo(120, 100);
    ctx.lineTo(40, 100);
    ctx.fill();

    ctx.fillStyle = c3;
    ctx.font = 'bold 9px monospace';
    ctx.fillText('PRESS A OR B TO START', 16, 120);
  }

  private renderBonusGame(ctx: CanvasRenderingContext2D, pal: string[]) {
    const [c0, , c2, c3] = pal;

    ctx.fillStyle = c0;
    ctx.fillRect(0, 0, 160, 144);

    ctx.fillStyle = c3;
    ctx.font = 'bold 11px monospace';
    ctx.fillText('BONUS GAME', 44, 24);

    const options = ['1-UP ❤️', '2-UP ❤️❤️', '3-UP ❤️❤️❤️', 'SUPERBALL 🌸'];
    options.forEach((opt, idx) => {
      const y = 48 + idx * 20;
      ctx.fillStyle = this.bonusRouletteStep === idx ? c3 : c2;
      ctx.fillText(`${this.bonusRouletteStep === idx ? '▶ ' : '  '}${opt}`, 24, y);
    });

    if (this.bonusReward) {
      ctx.fillStyle = c3;
      ctx.font = 'bold 10px monospace';
      ctx.fillText(`WON: ${this.bonusReward}!`, 30, 134);
    } else {
      ctx.fillStyle = c2;
      ctx.font = '8px monospace';
      ctx.fillText('PRESS [A] TO STOP ROULETTE', 14, 134);
    }
  }
}
