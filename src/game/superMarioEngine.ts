/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Super Mario Bros. (1985 NES) - Complete Multi-World Authentic Engine
 * Features:
 * - All Worlds: 1-1 (Overworld), 1-2 (Underground), 1-3 (Athletic), 1-4 (Bowser Castle),
 *   2-1 (Spiny Ridge), 2-2 (Underwater), 2-3 (Sea Bridge), 2-4 (Bowser Citadel)
 * - Powerups: Small, Super Mushroom, Fire Flower (Bouncing Fireballs), Starman (Invincibility), 1-Up
 * - Enemies: Goomba, Koopa, Red Koopa, Paratroopa, Piranha Plant, Buzzy Beetle, Spiny, Lakitu,
 *   Cheep Cheep, Blooper, Podoboo, Firebars, and Bowser Boss with Axe bridge collapse!
 * - Rescued NPCs: Toad & Princess Peach
 */

import { superMarioAudio, MarioMusicTrack } from './superMarioAudio';
import {
  SUPER_MARIO_LEVELS,
  LevelDefinition,
  MarioWorldTheme,
  TILE_EMPTY,
  TILE_GROUND,
  TILE_BRICK,
  TILE_QUESTION_COIN,
  TILE_QUESTION_MUSHROOM,
  TILE_EMPTY_BLOCK,
  TILE_PIPE_TOP_LEFT,
  TILE_PIPE_TOP_RIGHT,
  TILE_PIPE_BODY_LEFT,
  TILE_PIPE_BODY_RIGHT,
  TILE_STAIR_STONE,
  TILE_FLAGPOLE,
  TILE_FLAGPOLE_TOP,
  TILE_CASTLE_BRICK,
  TILE_CASTLE_DOOR,
  TILE_QUESTION_FIRE,
  TILE_QUESTION_STAR,
  TILE_QUESTION_1UP,
  TILE_MULTI_COIN_BRICK,
  TILE_LAVA,
  TILE_BRIDGE,
  TILE_AXE,
  TILE_WATER_SURFACE,
  TILE_CORAL,
  TILE_WOOD_PLATFORM,
} from './superMarioLevels';

export interface SuperMarioStats {
  score: number;
  coins: number;
  world: string;
  time: number;
  lives: number;
  isSuper: boolean;
  isFire: boolean;
  isStar: boolean;
  gameOver: boolean;
  stageComplete: boolean;
  gameWon: boolean;
  rescuedNpc: 'none' | 'toad' | 'peach';
}

export type MarioAction = 'left' | 'right' | 'down' | 'jump' | 'dash' | 'fire';

interface Fireball {
  x: number;
  y: number;
  vx: number;
  vy: number;
  timer: number;
}

interface ItemEntity {
  type: 'mushroom' | 'fireflower' | 'star' | '1up';
  x: number;
  y: number;
  vx: number;
  vy: number;
  emergeY: number;
  emerging: boolean;
}

interface EnemyEntity {
  id: number;
  type: 'goomba' | 'koopa' | 'red_koopa' | 'paratroopa' | 'piranha' | 'buzzy' | 'spiny' | 'lakitu' | 'cheep' | 'blooper' | 'podoboo' | 'bowser';
  x: number;
  y: number;
  vx: number;
  vy: number;
  originX: number;
  originY: number;
  state: 'walk' | 'squished' | 'shell_idle' | 'shell_moving' | 'dead_fall' | 'pipe_rising' | 'pipe_down' | 'jumping' | 'flaming';
  stateTimer: number;
  animFrame: number;
  animTimer: number;
  hp?: number;
  isFlying?: boolean;
  bowserTimer?: number;
}

interface FirebarInstance {
  col: number;
  row: number;
  length: number;
  speed: number;
  angle: number;
}

interface BowserFlame {
  x: number;
  y: number;
  vx: number;
  vy: number;
  timer: number;
}

export class SuperMarioEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private animationFrameId: number | null = null;
  private lastTime = 0;
  private onStatsChange: (stats: SuperMarioStats) => void;

  // NES Native Dimensions
  public readonly V_WIDTH = 256;
  public readonly V_HEIGHT = 240;
  public readonly TILE_SIZE = 16;

  // Input states
  public inputLeft = false;
  public inputRight = false;
  public inputDown = false;
  public inputJump = false;
  public inputDash = false;
  public inputFire = false;
  private jumpHeld = false;
  private fireCooldown = 0;

  // Camera
  public cameraX = 0;

  // Current Level Definition
  public currentLevelIndex = 0;
  public currentLevel: LevelDefinition = SUPER_MARIO_LEVELS[0];

  // Mario State
  public mario = {
    x: 40,
    y: 192,
    vx: 0,
    vy: 0,
    width: 14,
    height: 16, // 16 small, 28 super/fire
    isSuper: false,
    isFire: false,
    isStar: false,
    starTimer: 0,
    isGrounded: false,
    facingRight: true,
    runFrame: 0,
    runAnimTimer: 0,
    invincibleTimer: 0,
    transformTimer: 0,
    isDucking: false,
    isDead: false,
    deathTimer: 0,
    flagpoleState: 'none' as 'none' | 'sliding' | 'walking' | 'axe_collapse' | 'done',
    flagSlideY: 0,
    isSwimming: false,
  };

  // Stats
  public stats: SuperMarioStats = {
    score: 0,
    coins: 0,
    world: '1-1',
    time: 400,
    lives: 3,
    isSuper: false,
    isFire: false,
    isStar: false,
    gameOver: false,
    stageComplete: false,
    gameWon: false,
    rescuedNpc: 'none',
  };

  private timerCountdown = 0;
  private isPaused = false;

  // Level Tilemap
  private levelTiles: number[][] = [];
  private levelWidthCols = 220;

  // Entities & Animations
  private items: ItemEntity[] = [];
  private fireballs: Fireball[] = [];
  private bowserFlames: BowserFlame[] = [];
  private enemies: EnemyEntity[] = [];
  private firebars: FirebarInstance[] = [];

  private activeBlockBounces: {
    col: number;
    row: number;
    type: number;
    offsetY: number;
    timer: number;
  }[] = [];

  private scorePopups: { x: number; y: number; text: string; timer: number }[] = [];
  private spawnedCoins: { x: number; y: number; vy: number; timer: number }[] = [];
  private brickParticles: {
    x: number;
    y: number;
    vx: number;
    vy: number;
    rot: number;
    rotSpeed: number;
    timer: number;
  }[] = [];

  // Flag & Boss variables
  private flagY = 32;
  private bridgeCollapsed = false;
  private bridgeCollapseTimer = 0;
  private bossDefeated = false;

  constructor(canvas: HTMLCanvasElement, onStatsChange: (stats: SuperMarioStats) => void) {
    this.canvas = canvas;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('2D context not available');
    this.ctx = context;
    this.onStatsChange = onStatsChange;

    this.canvas.width = this.V_WIDTH;
    this.canvas.height = this.V_HEIGHT;

    this.loadLevel(0);
    this.startLoop();
  }

  /**
   * Load any level by index (0..7)
   */
  public loadLevel(levelIndex: number, preserveMarioState = false) {
    const idx = Math.max(0, Math.min(SUPER_MARIO_LEVELS.length - 1, levelIndex));
    this.currentLevelIndex = idx;
    this.currentLevel = SUPER_MARIO_LEVELS[idx];

    this.cameraX = 0;
    this.flagY = 32;
    this.bridgeCollapsed = false;
    this.bossDefeated = false;
    this.levelWidthCols = this.currentLevel.widthCols;

    const prevSuper = preserveMarioState ? this.mario.isSuper : false;
    const prevFire = preserveMarioState ? this.mario.isFire : false;

    this.mario = {
      x: 40,
      y: 192,
      vx: 0,
      vy: 0,
      width: 14,
      height: prevSuper || prevFire ? 28 : 16,
      isSuper: prevSuper,
      isFire: prevFire,
      isStar: false,
      starTimer: 0,
      isGrounded: false,
      facingRight: true,
      runFrame: 0,
      runAnimTimer: 0,
      invincibleTimer: 0,
      transformTimer: 0,
      isDucking: false,
      isDead: false,
      deathTimer: 0,
      flagpoleState: 'none',
      flagSlideY: 0,
      isSwimming: Boolean(this.currentLevel.hasWaterPhysics),
    };

    this.stats.world = this.currentLevel.world;
    this.stats.time = this.currentLevel.timeLimit;
    this.stats.stageComplete = false;
    this.stats.gameOver = false;
    this.stats.gameWon = false;
    this.stats.rescuedNpc = 'none';
    this.stats.isSuper = this.mario.isSuper;
    this.stats.isFire = this.mario.isFire;
    this.stats.isStar = false;
    this.timerCountdown = 0;

    this.activeBlockBounces = [];
    this.scorePopups = [];
    this.spawnedCoins = [];
    this.brickParticles = [];
    this.items = [];
    this.fireballs = [];
    this.bowserFlames = [];
    this.enemies = [];
    this.firebars = [];

    // Initialize 2D tile array [col][row] (15 rows)
    this.levelTiles = [];
    for (let c = 0; c < this.levelWidthCols; c++) {
      const col = new Array(15).fill(TILE_EMPTY);
      col[13] = TILE_GROUND;
      col[14] = TILE_GROUND;
      this.levelTiles.push(col);
    }

    // Helper functions passed to level builder
    const placePipe = (col: number, height: number, hasPiranha = false) => {
      const topRow = 13 - height;
      this.levelTiles[col][topRow] = TILE_PIPE_TOP_LEFT;
      this.levelTiles[col + 1][topRow] = TILE_PIPE_TOP_RIGHT;
      for (let r = topRow + 1; r < 13; r++) {
        this.levelTiles[col][r] = TILE_PIPE_BODY_LEFT;
        this.levelTiles[col + 1][r] = TILE_PIPE_BODY_RIGHT;
      }
      if (hasPiranha) {
        this.enemies.push({
          id: this.enemies.length + 100,
          type: 'piranha',
          x: col * this.TILE_SIZE + 4,
          y: topRow * this.TILE_SIZE,
          vx: 0,
          vy: 0,
          originX: col * this.TILE_SIZE + 4,
          originY: topRow * this.TILE_SIZE,
          state: 'pipe_rising',
          stateTimer: 2.0,
          animFrame: 0,
          animTimer: 0,
        });
      }
    };

    const placeStairs = (startCol: number, height: number, ascending: boolean) => {
      for (let step = 0; step < height; step++) {
        const col = ascending ? startCol + step : startCol + step;
        const currentH = ascending ? step + 1 : height - step;
        for (let h = 0; h < currentH; h++) {
          const row = 12 - h;
          if (col >= 0 && col < this.levelWidthCols && row >= 0 && row < 15) {
            this.levelTiles[col][row] = TILE_STAIR_STONE;
          }
        }
      }
    };

    const placeCastle = (startCol: number) => {
      for (let c = startCol; c < startCol + 5; c++) {
        for (let r = 8; r < 13; r++) {
          if (c < this.levelWidthCols) {
            this.levelTiles[c][r] = TILE_CASTLE_BRICK;
          }
        }
      }
      if (startCol + 2 < this.levelWidthCols) {
        this.levelTiles[startCol + 2][11] = TILE_CASTLE_DOOR;
        this.levelTiles[startCol + 2][12] = TILE_CASTLE_DOOR;
      }
    };

    // Execute level blueprint
    this.currentLevel.buildMap(this.levelTiles, placePipe, placeStairs, placeCastle);

    // Initialize Firebars
    if (this.currentLevel.firebars) {
      this.currentLevel.firebars.forEach((fb) => {
        this.firebars.push({
          col: fb.col,
          row: fb.row,
          length: fb.length,
          speed: fb.speed,
          angle: fb.initialAngle || 0,
        });
      });
    }

    // Spawn defined enemies
    let enemyId = 1;
    this.currentLevel.enemies.forEach((e) => {
      this.enemies.push({
        id: enemyId++,
        type: e.type,
        x: e.col * this.TILE_SIZE,
        y: e.row * this.TILE_SIZE,
        vx: e.vx !== undefined ? e.vx : -0.6,
        vy: 0,
        originX: e.col * this.TILE_SIZE,
        originY: e.row * this.TILE_SIZE,
        state: 'walk',
        stateTimer: 0,
        animFrame: 0,
        animTimer: 0,
        hp: e.type === 'bowser' ? 5 : 1,
        isFlying: Boolean(e.isFlying),
        bowserTimer: e.type === 'bowser' ? 0 : undefined,
      });
    });

    // Start background theme music
    this.startThemeMusic();
    this.notifyStats();
  }

  private startThemeMusic() {
    if (this.mario.isStar) {
      superMarioAudio.playMusic('starman');
      return;
    }
    const theme = this.currentLevel.theme;
    if (theme === 'overworld' || theme === 'athletic') {
      superMarioAudio.playMusic('overworld');
    } else if (theme === 'underground') {
      superMarioAudio.playMusic('underground');
    } else if (theme === 'castle') {
      superMarioAudio.playMusic('castle');
    } else if (theme === 'underwater') {
      superMarioAudio.playMusic('underwater');
    }
  }

  public nextLevel() {
    if (this.currentLevelIndex < SUPER_MARIO_LEVELS.length - 1) {
      this.loadLevel(this.currentLevelIndex + 1, true);
    } else {
      // Completed all 8 levels - Victory!
      this.stats.gameWon = true;
      this.stats.stageComplete = true;
      superMarioAudio.playWorldClear();
      this.notifyStats();
    }
  }

  public selectWorld(worldKey: string) {
    const idx = SUPER_MARIO_LEVELS.findIndex((l) => l.world === worldKey);
    if (idx !== -1) {
      this.loadLevel(idx, false);
    }
  }

  public handleAction(action: MarioAction, pressed: boolean) {
    if (this.stats.gameOver || this.mario.isDead) return;

    if (action === 'left') this.inputLeft = pressed;
    if (action === 'right') this.inputRight = pressed;
    if (action === 'down') {
      this.inputDown = pressed;
      this.mario.isDucking = pressed && (this.mario.isSuper || this.mario.isFire);
    }
    if (action === 'jump') {
      this.inputJump = pressed;
      if (pressed && !this.jumpHeld) {
        this.performJump();
      }
      this.jumpHeld = pressed;
    }
    if (action === 'dash' || action === 'fire') {
      this.inputDash = pressed;
      if (pressed && this.mario.isFire && this.fireCooldown <= 0) {
        this.shootFireball();
      }
    }
  }

  private shootFireball() {
    if (!this.mario.isFire) return;
    if (this.fireballs.length >= 2) return;

    const fbX = this.mario.facingRight ? this.mario.x + 14 : this.mario.x - 4;
    const fbY = this.mario.y + 10;
    const fbVx = this.mario.facingRight ? 4.5 : -4.5;

    this.fireballs.push({
      x: fbX,
      y: fbY,
      vx: fbVx,
      vy: 1.5,
      timer: 2.5,
    });

    this.fireCooldown = 0.25;
    superMarioAudio.playFireball();
  }

  private performJump() {
    if (this.mario.flagpoleState !== 'none') return;

    if (this.currentLevel.hasWaterPhysics) {
      // Swimming stroke
      this.mario.vy = -3.8;
      superMarioAudio.playJumpSmall();
      return;
    }

    if (this.mario.isGrounded) {
      this.mario.vy = this.inputDash ? -9.2 : -8.5;
      this.mario.isGrounded = false;
      if (this.mario.isSuper || this.mario.isFire) {
        superMarioAudio.playJumpSuper();
      } else {
        superMarioAudio.playJumpSmall();
      }
    }
  }

  private startLoop() {
    this.lastTime = performance.now();
    const loop = (currentTime: number) => {
      const dt = Math.min((currentTime - this.lastTime) / 1000, 0.05);
      this.lastTime = currentTime;

      if (!this.isPaused) {
        this.update(dt);
      }
      this.render();

      this.animationFrameId = requestAnimationFrame(loop);
    };
    this.animationFrameId = requestAnimationFrame(loop);
  }

  private update(dt: number) {
    if (this.stats.gameOver || this.stats.gameWon) return;

    // Fire cooldown
    if (this.fireCooldown > 0) this.fireCooldown -= dt;

    // Star powerup countdown
    if (this.mario.isStar) {
      this.mario.starTimer -= dt;
      if (this.mario.starTimer <= 0) {
        this.mario.isStar = false;
        this.stats.isStar = false;
        this.startThemeMusic();
        this.notifyStats();
      }
    }

    // Invincible blink timer
    if (this.mario.invincibleTimer > 0) {
      this.mario.invincibleTimer -= dt;
    }

    // Timer Countdown
    if (!this.mario.isDead && this.mario.flagpoleState === 'none') {
      this.timerCountdown += dt;
      if (this.timerCountdown >= 1.0) {
        this.timerCountdown -= 1.0;
        if (this.stats.time > 0) {
          this.stats.time -= 1;
          if (this.stats.time === 0) {
            this.killMario();
          }
          this.notifyStats();
        }
      }
    }

    // Flagpole / Castle Cutscene sequence
    if (this.mario.flagpoleState !== 'none') {
      this.updateFlagpoleSequence(dt);
      this.updateParticles(dt);
      return;
    }

    // Mario Death Animation
    if (this.mario.isDead) {
      this.mario.deathTimer += dt;
      if (this.mario.deathTimer > 0.4) {
        this.mario.vy += 22 * dt;
        this.mario.y += this.mario.vy;
      }
      if (this.mario.y > this.V_HEIGHT + 40) {
        this.stats.lives -= 1;
        if (this.stats.lives <= 0) {
          this.stats.gameOver = true;
        } else {
          this.loadLevel(this.currentLevelIndex, false);
        }
        this.notifyStats();
      }
      return;
    }

    // Regular Gameplay Updates
    this.updateMarioPhysics(dt);
    this.updateCamera();
    this.updateBlocks(dt);
    this.updateItems(dt);
    this.updateFireballs(dt);
    this.updateBowserFlames(dt);
    this.updateFirebars(dt);
    this.updateEnemies(dt);
    this.updateParticles(dt);
  }

  private updateMarioPhysics(dt: number) {
    const isWater = Boolean(this.currentLevel.hasWaterPhysics);
    const maxSpeed = isWater ? 60 : this.inputDash ? 160 : 105;
    const accel = isWater ? 180 : 380;
    const friction = isWater ? 220 : 320;
    const gravity = isWater ? 9 : 22;

    // Horizontal acceleration
    if (this.inputLeft && !this.mario.isDucking) {
      this.mario.vx = Math.max(-maxSpeed, this.mario.vx - accel * dt);
      this.mario.facingRight = false;
    } else if (this.inputRight && !this.mario.isDucking) {
      this.mario.vx = Math.min(maxSpeed, this.mario.vx + accel * dt);
      this.mario.facingRight = true;
    } else {
      // Natural Deceleration
      if (this.mario.vx > 0) {
        this.mario.vx = Math.max(0, this.mario.vx - friction * dt);
      } else if (this.mario.vx < 0) {
        this.mario.vx = Math.min(0, this.mario.vx + friction * dt);
      }
    }

    // Apply Gravity
    this.mario.vy = Math.min(10, this.mario.vy + gravity * dt);

    // Run animation frames
    if (this.mario.isGrounded && Math.abs(this.mario.vx) > 5) {
      this.mario.runAnimTimer += Math.abs(this.mario.vx) * dt * 0.12;
      if (this.mario.runAnimTimer >= 1) {
        this.mario.runAnimTimer = 0;
        this.mario.runFrame = (this.mario.runFrame + 1) % 3;
      }
    } else {
      this.mario.runFrame = 0;
    }

    // Horizontal Movement & Collisions
    this.mario.x += this.mario.vx * dt;
    this.checkTileCollisionX();

    // Prevent going left of camera
    if (this.mario.x < this.cameraX) {
      this.mario.x = this.cameraX;
      this.mario.vx = 0;
    }

    // Vertical Movement & Collisions
    this.mario.y += this.mario.vy;
    this.checkTileCollisionY();

    // Pit Fall Check
    if (this.mario.y > this.V_HEIGHT + 10) {
      this.killMario();
    }
  }

  private updateCamera() {
    // Camera moves forward to keep Mario centered, never scrolls back
    const targetCamX = this.mario.x - this.V_WIDTH / 2 + 10;
    const maxCam = (this.levelWidthCols - 16) * this.TILE_SIZE;
    if (targetCamX > this.cameraX) {
      this.cameraX = Math.min(maxCam, targetCamX);
    }
  }

  private checkTileCollisionX() {
    const leftCol = Math.floor(this.mario.x / this.TILE_SIZE);
    const rightCol = Math.floor((this.mario.x + this.mario.width) / this.TILE_SIZE);
    const topRow = Math.floor((this.mario.y + 2) / this.TILE_SIZE);
    const bottomRow = Math.floor((this.mario.y + this.mario.height - 2) / this.TILE_SIZE);

    for (let r = topRow; r <= bottomRow; r++) {
      if (this.mario.vx > 0) {
        const tile = this.getTile(rightCol, r);
        if (this.isSolidTile(tile)) {
          this.mario.x = rightCol * this.TILE_SIZE - this.mario.width - 0.01;
          this.mario.vx = 0;
          break;
        }
      } else if (this.mario.vx < 0) {
        const tile = this.getTile(leftCol, r);
        if (this.isSolidTile(tile)) {
          this.mario.x = (leftCol + 1) * this.TILE_SIZE + 0.01;
          this.mario.vx = 0;
          break;
        }
      }
    }
  }

  private checkTileCollisionY() {
    const leftCol = Math.floor((this.mario.x + 2) / this.TILE_SIZE);
    const rightCol = Math.floor((this.mario.x + this.mario.width - 2) / this.TILE_SIZE);
    const topRow = Math.floor(this.mario.y / this.TILE_SIZE);
    const bottomRow = Math.floor((this.mario.y + this.mario.height) / this.TILE_SIZE);

    if (this.mario.vy >= 0) {
      // Falling down: check floor
      for (let c = leftCol; c <= rightCol; c++) {
        const tile = this.getTile(c, bottomRow);
        if (tile === TILE_LAVA) {
          this.killMario();
          return;
        }
        if (this.isSolidTile(tile)) {
          this.mario.y = bottomRow * this.TILE_SIZE - this.mario.height;
          this.mario.vy = 0;
          this.mario.isGrounded = true;
          return;
        }
      }
      this.mario.isGrounded = false;
    } else {
      // Jumping up: check ceiling
      for (let c = leftCol; c <= rightCol; c++) {
        const tile = this.getTile(c, topRow);
        if (this.isSolidTile(tile)) {
          this.mario.y = (topRow + 1) * this.TILE_SIZE;
          this.mario.vy = 0;
          this.hitBlockFromBelow(c, topRow, tile);
          break;
        }
      }
    }

    // Check Flagpole or Golden Axe Hit
    const centerCol = Math.floor((this.mario.x + this.mario.width / 2) / this.TILE_SIZE);
    for (let r = topRow; r <= bottomRow; r++) {
      const tile = this.getTile(centerCol, r);
      if (tile === TILE_FLAGPOLE || tile === TILE_FLAGPOLE_TOP) {
        this.startFlagpoleSequence();
        break;
      }
      if (tile === TILE_AXE) {
        this.triggerAxeCollapse();
        break;
      }
    }
  }

  private isSolidTile(tile: number): boolean {
    return (
      tile === TILE_GROUND ||
      tile === TILE_BRICK ||
      tile === TILE_QUESTION_COIN ||
      tile === TILE_QUESTION_MUSHROOM ||
      tile === TILE_QUESTION_FIRE ||
      tile === TILE_QUESTION_STAR ||
      tile === TILE_QUESTION_1UP ||
      tile === TILE_MULTI_COIN_BRICK ||
      tile === TILE_EMPTY_BLOCK ||
      tile === TILE_PIPE_TOP_LEFT ||
      tile === TILE_PIPE_TOP_RIGHT ||
      tile === TILE_PIPE_BODY_LEFT ||
      tile === TILE_PIPE_BODY_RIGHT ||
      tile === TILE_STAIR_STONE ||
      tile === TILE_CASTLE_BRICK ||
      tile === TILE_BRIDGE ||
      tile === TILE_WOOD_PLATFORM ||
      tile === TILE_CORAL
    );
  }

  private getTile(col: number, row: number): number {
    if (col < 0 || col >= this.levelWidthCols || row < 0 || row >= 15) return TILE_EMPTY;
    return this.levelTiles[col][row];
  }

  private hitBlockFromBelow(col: number, row: number, tile: number) {
    if (tile === TILE_QUESTION_COIN) {
      this.levelTiles[col][row] = TILE_EMPTY_BLOCK;
      this.activeBlockBounces.push({ col, row, type: tile, offsetY: 0, timer: 0.2 });
      superMarioAudio.playCoin();
      this.addCoin();
      this.spawnedCoins.push({
        x: col * this.TILE_SIZE + 4,
        y: (row - 1) * this.TILE_SIZE,
        vy: -5.5,
        timer: 0.45,
      });
    } else if (tile === TILE_MULTI_COIN_BRICK) {
      this.activeBlockBounces.push({ col, row, type: tile, offsetY: 0, timer: 0.18 });
      superMarioAudio.playCoin();
      this.addCoin();
      this.spawnedCoins.push({
        x: col * this.TILE_SIZE + 4,
        y: (row - 1) * this.TILE_SIZE,
        vy: -5.5,
        timer: 0.45,
      });
    } else if (tile === TILE_QUESTION_MUSHROOM) {
      this.levelTiles[col][row] = TILE_EMPTY_BLOCK;
      this.activeBlockBounces.push({ col, row, type: tile, offsetY: 0, timer: 0.2 });
      superMarioAudio.playPowerupSprout();
      this.items.push({
        type: this.mario.isSuper ? 'fireflower' : 'mushroom',
        x: col * this.TILE_SIZE,
        y: row * this.TILE_SIZE,
        vx: 1.0,
        vy: 0,
        emergeY: (row - 1) * this.TILE_SIZE,
        emerging: true,
      });
    } else if (tile === TILE_QUESTION_FIRE) {
      this.levelTiles[col][row] = TILE_EMPTY_BLOCK;
      this.activeBlockBounces.push({ col, row, type: tile, offsetY: 0, timer: 0.2 });
      superMarioAudio.playPowerupSprout();
      this.items.push({
        type: 'fireflower',
        x: col * this.TILE_SIZE,
        y: row * this.TILE_SIZE,
        vx: 0,
        vy: 0,
        emergeY: (row - 1) * this.TILE_SIZE,
        emerging: true,
      });
    } else if (tile === TILE_QUESTION_STAR) {
      this.levelTiles[col][row] = TILE_EMPTY_BLOCK;
      this.activeBlockBounces.push({ col, row, type: tile, offsetY: 0, timer: 0.2 });
      superMarioAudio.playPowerupSprout();
      this.items.push({
        type: 'star',
        x: col * this.TILE_SIZE,
        y: row * this.TILE_SIZE,
        vx: 1.2,
        vy: -4.0,
        emergeY: (row - 1) * this.TILE_SIZE,
        emerging: true,
      });
    } else if (tile === TILE_QUESTION_1UP) {
      this.levelTiles[col][row] = TILE_EMPTY_BLOCK;
      this.activeBlockBounces.push({ col, row, type: tile, offsetY: 0, timer: 0.2 });
      superMarioAudio.playPowerupSprout();
      this.items.push({
        type: '1up',
        x: col * this.TILE_SIZE,
        y: row * this.TILE_SIZE,
        vx: 1.0,
        vy: 0,
        emergeY: (row - 1) * this.TILE_SIZE,
        emerging: true,
      });
    } else if (tile === TILE_BRICK) {
      if (this.mario.isSuper || this.mario.isFire) {
        this.levelTiles[col][row] = TILE_EMPTY;
        superMarioAudio.playBrickBreak();
        this.addScore(50, col * this.TILE_SIZE, row * this.TILE_SIZE);
        const px = col * this.TILE_SIZE + 4;
        const py = row * this.TILE_SIZE + 4;
        this.brickParticles.push(
          { x: px, y: py, vx: -1.8, vy: -5.5, rot: 0, rotSpeed: -10, timer: 0.8 },
          { x: px + 8, y: py, vx: 1.8, vy: -5.5, rot: 0, rotSpeed: 10, timer: 0.8 },
          { x: px, y: py + 8, vx: -1.2, vy: -3.8, rot: 0, rotSpeed: -8, timer: 0.8 },
          { x: px + 8, y: py + 8, vx: 1.2, vy: -3.8, rot: 0, rotSpeed: 8, timer: 0.8 }
        );
      } else {
        this.activeBlockBounces.push({ col, row, type: tile, offsetY: 0, timer: 0.18 });
        superMarioAudio.playBlockBump();
      }
    } else if (tile === TILE_EMPTY_BLOCK) {
      superMarioAudio.playBlockBump();
    }
  }

  // Golden Axe bridge drop sequence
  private triggerAxeCollapse() {
    if (this.mario.flagpoleState === 'axe_collapse') return;
    this.mario.flagpoleState = 'axe_collapse';
    this.bridgeCollapsed = true;
    this.levelTiles[this.currentLevel.axeCol || 156][9] = TILE_EMPTY; // remove axe

    // Collapse bridge tiles one by one
    for (let c = 138; c <= (this.currentLevel.axeCol || 156) - 1; c++) {
      this.levelTiles[c][10] = TILE_EMPTY;
    }

    // Drop Bowser into lava
    this.enemies.forEach((e) => {
      if (e.type === 'bowser') {
        e.state = 'dead_fall';
        e.vy = 2.0;
        superMarioAudio.playBowserFall();
        this.addScore(5000, e.x, e.y);
      }
    });

    superMarioAudio.playStageClear();
    this.stats.rescuedNpc = this.currentLevel.rescuedNpc || 'toad';
    this.notifyStats();
  }

  private startFlagpoleSequence() {
    this.mario.flagpoleState = 'sliding';
    this.mario.vx = 0;
    this.mario.vy = 0;
    superMarioAudio.playStageClear();
    this.addScore(2000, this.mario.x, this.mario.y);
  }

  private updateFlagpoleSequence(dt: number) {
    if (this.mario.flagpoleState === 'sliding') {
      const bottomY = 12 * this.TILE_SIZE - (this.mario.isSuper || this.mario.isFire ? 28 : 16);
      if (this.mario.y < bottomY) {
        this.mario.y += 80 * dt;
        this.flagY = Math.min(11 * this.TILE_SIZE, this.flagY + 80 * dt);
      } else {
        this.mario.y = bottomY;
        this.mario.x += 16;
        this.mario.facingRight = true;
        this.mario.flagpoleState = 'walking';
      }
    } else if (this.mario.flagpoleState === 'walking') {
      this.mario.x += 45 * dt;
      this.mario.runAnimTimer += dt * 8;
      if (this.mario.runAnimTimer >= 1) {
        this.mario.runAnimTimer = 0;
        this.mario.runFrame = (this.mario.runFrame + 1) % 3;
      }
      if (this.mario.x >= (this.levelWidthCols - 10) * this.TILE_SIZE) {
        this.mario.flagpoleState = 'done';
        this.stats.stageComplete = true;
        this.notifyStats();
      }
    } else if (this.mario.flagpoleState === 'axe_collapse') {
      this.mario.x += 35 * dt;
      if (this.mario.x >= (this.currentLevel.axeCol || 156) * this.TILE_SIZE + 24) {
        this.mario.flagpoleState = 'done';
        this.stats.stageComplete = true;
        if (this.currentLevel.rescuedNpc === 'peach') {
          this.stats.gameWon = true;
          superMarioAudio.playWorldClear();
        }
        this.notifyStats();
      }
    }
  }

  private updateBlocks(dt: number) {
    for (let i = this.activeBlockBounces.length - 1; i >= 0; i--) {
      const b = this.activeBlockBounces[i];
      b.timer -= dt;
      if (b.timer > 0.1) {
        b.offsetY = -6 * (1 - (b.timer - 0.1) / 0.1);
      } else if (b.timer > 0) {
        b.offsetY = -6 * (b.timer / 0.1);
      } else {
        this.activeBlockBounces.splice(i, 1);
      }
    }
  }

  private updateItems(dt: number) {
    for (let i = this.items.length - 1; i >= 0; i--) {
      const item = this.items[i];
      if (item.emerging) {
        item.y -= 25 * dt;
        if (item.y <= item.emergeY) {
          item.y = item.emergeY;
          item.emerging = false;
        }
        continue;
      }

      if (item.type === 'mushroom' || item.type === '1up') {
        item.vy = Math.min(10, item.vy + 18 * dt);
        item.x += item.vx * 45 * dt;
        item.y += item.vy;

        const col = Math.floor((item.x + 8) / this.TILE_SIZE);
        const row = Math.floor((item.y + 15) / this.TILE_SIZE);
        if (this.isSolidTile(this.getTile(col, row))) {
          item.y = row * this.TILE_SIZE - 16;
          item.vy = 0;
        }

        const frontCol = Math.floor((item.x + (item.vx > 0 ? 16 : 0)) / this.TILE_SIZE);
        const midRow = Math.floor((item.y + 8) / this.TILE_SIZE);
        if (this.isSolidTile(this.getTile(frontCol, midRow))) {
          item.vx *= -1;
        }
      } else if (item.type === 'star') {
        item.vy = Math.min(8, item.vy + 15 * dt);
        item.x += item.vx * 55 * dt;
        item.y += item.vy;

        const col = Math.floor((item.x + 8) / this.TILE_SIZE);
        const row = Math.floor((item.y + 15) / this.TILE_SIZE);
        if (this.isSolidTile(this.getTile(col, row))) {
          item.y = row * this.TILE_SIZE - 16;
          item.vy = -6.0; // Bounce!
        }
      }

      // Check collision with Mario
      if (
        this.mario.x < item.x + 16 &&
        this.mario.x + this.mario.width > item.x &&
        this.mario.y < item.y + 16 &&
        this.mario.y + this.mario.height > item.y
      ) {
        this.items.splice(i, 1);
        if (item.type === '1up') {
          superMarioAudio.play1Up();
          this.stats.lives += 1;
          this.addScore(1000, item.x, item.y, '1UP');
        } else if (item.type === 'star') {
          superMarioAudio.playPowerupCollect();
          this.mario.isStar = true;
          this.mario.starTimer = 12.0;
          this.stats.isStar = true;
          this.addScore(1000, item.x, item.y);
          this.startThemeMusic();
        } else if (item.type === 'fireflower') {
          superMarioAudio.playPowerupCollect();
          this.mario.isSuper = true;
          this.mario.isFire = true;
          this.mario.height = 28;
          this.stats.isSuper = true;
          this.stats.isFire = true;
          this.addScore(1000, item.x, item.y);
        } else {
          // Mushroom
          superMarioAudio.playPowerupCollect();
          this.mario.isSuper = true;
          this.mario.height = 28;
          this.mario.y -= 12;
          this.stats.isSuper = true;
          this.addScore(1000, item.x, item.y);
        }
        this.notifyStats();
      }
    }
  }

  private updateFireballs(dt: number) {
    for (let i = this.fireballs.length - 1; i >= 0; i--) {
      const fb = this.fireballs[i];
      fb.timer -= dt;
      if (fb.timer <= 0) {
        this.fireballs.splice(i, 1);
        continue;
      }

      fb.vy += 20 * dt;
      fb.x += fb.vx * 70 * dt;
      fb.y += fb.vy;

      const col = Math.floor((fb.x + 4) / this.TILE_SIZE);
      const row = Math.floor((fb.y + 8) / this.TILE_SIZE);
      if (this.isSolidTile(this.getTile(col, row))) {
        fb.y = row * this.TILE_SIZE - 8;
        fb.vy = -4.2; // Bounce!
      }

      // Check collision with enemies
      for (let j = 0; j < this.enemies.length; j++) {
        const e = this.enemies[j];
        if (e.state === 'dead_fall' || e.state === 'squished') continue;
        if (e.type === 'buzzy') continue; // Buzzy Beetles resist fireballs

        if (Math.abs(fb.x - e.x) < 14 && Math.abs(fb.y - e.y) < 16) {
          this.fireballs.splice(i, 1);
          if (e.type === 'bowser') {
            e.hp = (e.hp || 5) - 1;
            superMarioAudio.playKick();
            if (e.hp <= 0) {
              e.state = 'dead_fall';
              e.vy = 2.0;
              superMarioAudio.playBowserFall();
              this.addScore(5000, e.x, e.y);
            }
          } else {
            e.state = 'dead_fall';
            e.vy = -4.5;
            superMarioAudio.playKick();
            this.addScore(200, e.x, e.y);
          }
          break;
        }
      }
    }
  }

  private updateBowserFlames(dt: number) {
    for (let i = this.bowserFlames.length - 1; i >= 0; i--) {
      const f = this.bowserFlames[i];
      f.timer -= dt;
      f.x += f.vx * 65 * dt;
      f.y += f.vy * dt;
      if (f.timer <= 0 || f.x < this.cameraX - 30) {
        this.bowserFlames.splice(i, 1);
        continue;
      }

      // Check collision with Mario
      if (
        this.mario.x < f.x + 16 &&
        this.mario.x + this.mario.width > f.x &&
        this.mario.y < f.y + 8 &&
        this.mario.y + this.mario.height > f.y
      ) {
        this.handlePlayerHit();
      }
    }
  }

  private updateFirebars(dt: number) {
    this.firebars.forEach((fb) => {
      fb.angle += fb.speed * dt;
    });

    // Check collision with Mario
    if (this.mario.isStar || this.mario.invincibleTimer > 0) return;
    const mCenterX = this.mario.x + this.mario.width / 2;
    const mCenterY = this.mario.y + this.mario.height / 2;

    this.firebars.forEach((fb) => {
      const pivotX = fb.col * this.TILE_SIZE + 8;
      const pivotY = fb.row * this.TILE_SIZE + 8;
      for (let step = 1; step <= fb.length; step++) {
        const dist = step * 8;
        const fx = pivotX + Math.cos(fb.angle) * dist;
        const fy = pivotY + Math.sin(fb.angle) * dist;

        if (Math.hypot(mCenterX - fx, mCenterY - fy) < 9) {
          this.handlePlayerHit();
          break;
        }
      }
    });
  }

  private updateEnemies(dt: number) {
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const e = this.enemies[i];

      if (e.state === 'squished') {
        e.stateTimer -= dt;
        if (e.stateTimer <= 0) this.enemies.splice(i, 1);
        continue;
      }

      if (e.state === 'dead_fall') {
        e.vy += 22 * dt;
        e.y += e.vy;
        e.stateTimer -= dt;
        if (e.y > this.V_HEIGHT + 30) this.enemies.splice(i, 1);
        continue;
      }

      // Activate enemies when near camera
      if (e.x > this.cameraX + this.V_WIDTH + 80 || e.x < this.cameraX - 80) {
        continue;
      }

      // Animation
      e.animTimer += dt * 6;
      if (e.animTimer >= 1) {
        e.animTimer = 0;
        e.animFrame = (e.animFrame + 1) % 2;
      }

      // Specific enemy behaviors
      if (e.type === 'piranha') {
        e.stateTimer -= dt;
        if (e.stateTimer <= 0) {
          e.stateTimer = 3.0;
          e.state = e.state === 'pipe_rising' ? 'pipe_down' : 'pipe_rising';
        }
        if (e.state === 'pipe_rising') {
          e.y = Math.max(e.originY - 24, e.y - 30 * dt);
        } else {
          e.y = Math.min(e.originY, e.y + 30 * dt);
        }
      } else if (e.type === 'podoboo') {
        e.vy += 16 * dt;
        e.y += e.vy;
        if (e.y > 14 * this.TILE_SIZE + 10) {
          e.y = 14 * this.TILE_SIZE + 10;
          e.vy = -7.5; // Jump up from lava!
        }
      } else if (e.type === 'paratroopa') {
        e.vy += 12 * dt;
        e.y += e.vy;
        e.x += e.vx * 40 * dt;
        const col = Math.floor((e.x + 8) / this.TILE_SIZE);
        const footRow = Math.floor((e.y + 15) / this.TILE_SIZE);
        if (this.isSolidTile(this.getTile(col, footRow))) {
          e.y = footRow * this.TILE_SIZE - 16;
          e.vy = -5.0; // Hopping flight
        }
      } else if (e.type === 'lakitu') {
        // Floating cloud
        e.x = this.mario.x + Math.sin(performance.now() * 0.002) * 50;
        e.stateTimer += dt;
        if (e.stateTimer > 3.5) {
          e.stateTimer = 0;
          // Drop Spiny!
          this.enemies.push({
            id: this.enemies.length + 200,
            type: 'spiny',
            x: e.x,
            y: e.y + 16,
            vx: -0.6,
            vy: -2.0,
            originX: e.x,
            originY: e.y,
            state: 'walk',
            stateTimer: 0,
            animFrame: 0,
            animTimer: 0,
          });
        }
      } else if (e.type === 'blooper') {
        // Ocean squid pulsating towards Mario
        if (Math.abs(e.x - this.mario.x) > 10) {
          e.x += (this.mario.x > e.x ? 1 : -1) * 20 * dt;
        }
        e.y += Math.sin(performance.now() * 0.003) * 0.8;
      } else if (e.type === 'cheep') {
        if (e.isFlying) {
          e.vy += 14 * dt;
          e.y += e.vy;
          e.x -= 30 * dt;
          if (e.y > this.V_HEIGHT + 20) {
            e.y = this.V_HEIGHT;
            e.vy = -7.0;
            e.x = this.cameraX + Math.random() * this.V_WIDTH;
          }
        } else {
          e.x += (e.vx || -1.0) * 35 * dt;
          e.y += Math.sin(performance.now() * 0.004) * 0.5;
        }
      } else if (e.type === 'bowser') {
        // Bowser boss AI
        e.bowserTimer = (e.bowserTimer || 0) + dt;
        if (e.bowserTimer > 2.5) {
          e.bowserTimer = 0;
          // Shoot fire breath!
          this.bowserFlames.push({
            x: e.x - 10,
            y: e.y + 6,
            vx: -2.8,
            vy: Math.sin(performance.now() * 0.005) * 15,
            timer: 4.0,
          });
          superMarioAudio.playBowserFlame();
        }
        e.x = e.originX + Math.sin(performance.now() * 0.002) * 20;
      } else {
        // Standard walk (Goomba, Koopa, Red Koopa, Buzzy, Spiny)
        e.vy = Math.min(10, e.vy + 20 * dt);
        const speed = e.state === 'shell_moving' ? 220 : 35;
        e.x += e.vx * speed * dt;
        e.y += e.vy;

        const col = Math.floor((e.x + 8) / this.TILE_SIZE);
        const footRow = Math.floor((e.y + 15) / this.TILE_SIZE);
        if (this.isSolidTile(this.getTile(col, footRow))) {
          e.y = footRow * this.TILE_SIZE - 16;
          e.vy = 0;
        }

        // Red Koopa patrols without falling into pits
        if (e.type === 'red_koopa') {
          const checkAheadCol = Math.floor((e.x + (e.vx > 0 ? 18 : -2)) / this.TILE_SIZE);
          if (!this.isSolidTile(this.getTile(checkAheadCol, footRow))) {
            e.vx *= -1;
          }
        }

        const frontCol = Math.floor((e.x + (e.vx > 0 ? 16 : 0)) / this.TILE_SIZE);
        const midRow = Math.floor((e.y + 8) / this.TILE_SIZE);
        if (this.isSolidTile(this.getTile(frontCol, midRow))) {
          e.vx *= -1;
          if (e.state === 'shell_moving') {
            superMarioAudio.playBlockBump();
          }
        }
      }

      // Collision with Mario
      const mLeft = this.mario.x;
      const mRight = this.mario.x + this.mario.width;
      const mTop = this.mario.y;
      const mBottom = this.mario.y + this.mario.height;

      const eLeft = e.x;
      const eRight = e.x + (e.type === 'bowser' ? 32 : 16);
      const eTop = e.y;
      const eBottom = e.y + (e.type === 'bowser' ? 32 : 16);

      if (mRight > eLeft && mLeft < eRight && mBottom > eTop && mTop < eBottom) {
        // Starman destroys everything instantly!
        if (this.mario.isStar) {
          e.state = 'dead_fall';
          e.vy = -5.0;
          superMarioAudio.playKick();
          this.addScore(400, e.x, e.y);
          continue;
        }

        // Check Stomp
        const isStomp = this.mario.vy > 0 && mBottom - eTop < 10;

        if (isStomp && e.type !== 'spiny' && e.type !== 'podoboo' && e.type !== 'piranha') {
          this.mario.vy = -6.5;

          if (e.type === 'goomba') {
            e.state = 'squished';
            e.stateTimer = 0.5;
            superMarioAudio.playStomp();
            this.addScore(100, e.x, e.y);
          } else if (e.type === 'paratroopa') {
            e.type = 'koopa'; // Loses wings
            e.isFlying = false;
            superMarioAudio.playStomp();
            this.addScore(400, e.x, e.y);
          } else if (e.type === 'koopa' || e.type === 'red_koopa' || e.type === 'buzzy') {
            if (e.state === 'walk') {
              e.state = 'shell_idle';
              e.vx = 0;
              superMarioAudio.playStomp();
              this.addScore(200, e.x, e.y);
            } else if (e.state === 'shell_idle' || e.state === 'shell_moving') {
              e.state = 'shell_moving';
              e.vx = this.mario.x < e.x ? 1 : -1;
              superMarioAudio.playKick();
              this.addScore(400, e.x, e.y);
            }
          }
        } else {
          // Side touch
          if (e.state === 'shell_idle') {
            e.state = 'shell_moving';
            e.vx = this.mario.x < e.x ? 1 : -1;
            superMarioAudio.playKick();
            this.addScore(400, e.x, e.y);
          } else {
            this.handlePlayerHit();
          }
        }
      }

      // Shell moving knocks other enemies
      if (e.state === 'shell_moving') {
        for (let j = 0; j < this.enemies.length; j++) {
          if (j === i) continue;
          const other = this.enemies[j];
          if (other.state === 'dead_fall' || other.state === 'squished') continue;
          if (Math.abs(e.x - other.x) < 14 && Math.abs(e.y - other.y) < 14) {
            other.state = 'dead_fall';
            other.vy = -5.0;
            superMarioAudio.playKick();
            this.addScore(500, other.x, other.y);
          }
        }
      }
    }
  }

  private handlePlayerHit() {
    if (this.mario.invincibleTimer > 0 || this.mario.isStar || this.mario.isDead) return;

    if (this.mario.isFire) {
      this.mario.isFire = false;
      this.mario.isSuper = true;
      this.mario.invincibleTimer = 2.0;
      this.stats.isFire = false;
      superMarioAudio.playPipe();
      this.notifyStats();
    } else if (this.mario.isSuper) {
      this.mario.isSuper = false;
      this.mario.height = 16;
      this.mario.y += 12;
      this.mario.invincibleTimer = 2.0;
      this.stats.isSuper = false;
      superMarioAudio.playPipe();
      this.notifyStats();
    } else {
      this.killMario();
    }
  }

  private killMario() {
    if (this.mario.isDead) return;
    this.mario.isDead = true;
    this.mario.vx = 0;
    this.mario.vy = -8.0;
    this.mario.deathTimer = 0;
    this.mario.isSuper = false;
    this.mario.isFire = false;
    this.mario.isStar = false;
    superMarioAudio.playDeath();
    this.notifyStats();
  }

  private updateParticles(dt: number) {
    for (let i = this.scorePopups.length - 1; i >= 0; i--) {
      const p = this.scorePopups[i];
      p.timer -= dt;
      p.y -= 25 * dt;
      if (p.timer <= 0) this.scorePopups.splice(i, 1);
    }

    for (let i = this.spawnedCoins.length - 1; i >= 0; i--) {
      const c = this.spawnedCoins[i];
      c.timer -= dt;
      c.vy += 18 * dt;
      c.y += c.vy;
      if (c.timer <= 0) this.spawnedCoins.splice(i, 1);
    }

    for (let i = this.brickParticles.length - 1; i >= 0; i--) {
      const bp = this.brickParticles[i];
      bp.timer -= dt;
      bp.vy += 18 * dt;
      bp.x += bp.vx * 30 * dt;
      bp.y += bp.vy;
      bp.rot += bp.rotSpeed * dt;
      if (bp.timer <= 0) this.brickParticles.splice(i, 1);
    }
  }

  private addCoin() {
    this.stats.coins += 1;
    if (this.stats.coins >= 100) {
      this.stats.coins -= 100;
      this.stats.lives += 1;
      superMarioAudio.play1Up();
    }
    this.addScore(200);
  }

  private addScore(pts: number, x?: number, y?: number, customText?: string) {
    this.stats.score += pts;
    if (x !== undefined && y !== undefined) {
      this.scorePopups.push({
        x,
        y: y - 8,
        text: customText || pts.toString(),
        timer: 0.8,
      });
    }
    this.notifyStats();
  }

  private notifyStats() {
    this.onStatsChange({ ...this.stats });
  }

  /**
   * Complete Rendering Pipeline
   */
  private render() {
    const ctx = this.ctx;
    ctx.imageSmoothingEnabled = false;

    // 1. Sky & Background Color
    ctx.fillStyle = this.currentLevel.skyColor;
    ctx.fillRect(0, 0, this.V_WIDTH, this.V_HEIGHT);

    ctx.save();
    ctx.translate(-Math.floor(this.cameraX), 0);

    // 2. Scenery
    if (this.currentLevel.theme === 'overworld' || this.currentLevel.theme === 'athletic') {
      this.renderOverworldScenery();
    } else if (this.currentLevel.theme === 'underground') {
      this.renderUndergroundScenery();
    } else if (this.currentLevel.theme === 'castle') {
      this.renderCastleScenery();
    }

    // 3. Tilemap
    this.renderTilemap();

    // 4. Bouncing Blocks
    this.renderBouncingBlocks();

    // 5. Firebars
    this.renderFirebars();

    // 6. Items
    this.renderItems();

    // 7. Fireballs & Flames
    this.renderProjectiles();

    // 8. Enemies
    this.renderEnemies();

    // 9. Mario Character
    this.renderMario();

    // 10. NPC Rescues (Toad / Peach)
    if (this.currentLevel.isCastleBoss) {
      this.renderRescuedNPC();
    }

    // 11. Particles & Popups
    this.renderParticles();

    ctx.restore();

    // 12. Top HUD
    this.renderHUD();
  }

  private renderOverworldScenery() {
    const ctx = this.ctx;
    const startCol = Math.max(0, Math.floor(this.cameraX / this.TILE_SIZE) - 2);
    const endCol = Math.min(this.levelWidthCols, Math.floor((this.cameraX + this.V_WIDTH) / this.TILE_SIZE) + 2);

    for (let c = startCol; c <= endCol; c++) {
      if (c % 48 === 0) {
        const hx = c * this.TILE_SIZE;
        ctx.fillStyle = '#00a800';
        ctx.beginPath();
        ctx.arc(hx + 32, 13 * this.TILE_SIZE, 32, Math.PI, 0);
        ctx.fill();
      }
      if (c % 24 === 10) {
        const bx = c * this.TILE_SIZE;
        ctx.fillStyle = '#4cd828';
        ctx.beginPath();
        ctx.arc(bx + 12, 13 * this.TILE_SIZE, 10, Math.PI, 0);
        ctx.arc(bx + 24, 13 * this.TILE_SIZE, 14, Math.PI, 0);
        ctx.arc(bx + 36, 13 * this.TILE_SIZE, 10, Math.PI, 0);
        ctx.fill();
      }
      if (c % 32 === 8) {
        const cx = c * this.TILE_SIZE;
        const cy = 40;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(cx + 10, cy, 8, 0, Math.PI * 2);
        ctx.arc(cx + 20, cy - 4, 12, 0, Math.PI * 2);
        ctx.arc(cx + 32, cy, 8, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  private renderUndergroundScenery() {
    const ctx = this.ctx;
    ctx.fillStyle = '#002060';
    ctx.fillRect(this.cameraX, 0, this.V_WIDTH, 16);
  }

  private renderCastleScenery() {
    const ctx = this.ctx;
    // Glowing lava bottom
    ctx.fillStyle = '#fc2004';
    ctx.fillRect(this.cameraX, 13 * this.TILE_SIZE, this.V_WIDTH, 32);
  }

  private renderTilemap() {
    const ctx = this.ctx;
    const startCol = Math.max(0, Math.floor(this.cameraX / this.TILE_SIZE) - 1);
    const endCol = Math.min(this.levelWidthCols - 1, Math.floor((this.cameraX + this.V_WIDTH) / this.TILE_SIZE) + 1);

    for (let c = startCol; c <= endCol; c++) {
      for (let r = 0; r < 15; r++) {
        const tile = this.levelTiles[c][r];
        if (tile === TILE_EMPTY) continue;
        const x = c * this.TILE_SIZE;
        const y = r * this.TILE_SIZE;
        this.drawTile(tile, x, y);
      }
    }
  }

  private drawTile(tile: number, x: number, y: number) {
    const ctx = this.ctx;
    const s = this.TILE_SIZE;

    if (tile === TILE_GROUND) {
      ctx.fillStyle = this.currentLevel.groundTileColor;
      ctx.fillRect(x, y, s, s);
      ctx.fillStyle = this.currentLevel.groundTopColor;
      ctx.fillRect(x, y, s, 3);
    } else if (tile === TILE_BRICK || tile === TILE_MULTI_COIN_BRICK) {
      ctx.fillStyle = this.currentLevel.brickColor;
      ctx.fillRect(x, y, s, s);
      ctx.fillStyle = '#000000';
      ctx.fillRect(x, y + 7, s, 1);
      ctx.fillRect(x + 7, y, 1, 7);
      ctx.fillRect(x + 3, y + 8, 1, 8);
      ctx.fillRect(x + 12, y + 8, 1, 8);
    } else if (
      tile === TILE_QUESTION_COIN ||
      tile === TILE_QUESTION_MUSHROOM ||
      tile === TILE_QUESTION_FIRE ||
      tile === TILE_QUESTION_STAR ||
      tile === TILE_QUESTION_1UP
    ) {
      ctx.fillStyle = this.currentLevel.questionColor;
      ctx.fillRect(x, y, s, s);
      ctx.fillStyle = '#000000';
      ctx.strokeRect(x + 0.5, y + 0.5, s - 1, s - 1);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 10px monospace';
      ctx.fillText('?', x + 4.5, y + 12);
    } else if (tile === TILE_EMPTY_BLOCK) {
      ctx.fillStyle = '#843800';
      ctx.fillRect(x, y, s, s);
      ctx.strokeStyle = '#000000';
      ctx.strokeRect(x + 0.5, y + 0.5, s - 1, s - 1);
    } else if (tile === TILE_PIPE_TOP_LEFT) {
      ctx.fillStyle = this.currentLevel.pipeColor;
      ctx.fillRect(x, y, s, s);
      ctx.fillStyle = '#80d010';
      ctx.fillRect(x + 2, y + 1, 3, s - 2);
    } else if (tile === TILE_PIPE_TOP_RIGHT) {
      ctx.fillStyle = this.currentLevel.pipeColor;
      ctx.fillRect(x, y, s, s);
      ctx.fillStyle = '#004000';
      ctx.fillRect(x + s - 3, y + 1, 2, s - 2);
    } else if (tile === TILE_PIPE_BODY_LEFT) {
      ctx.fillStyle = this.currentLevel.pipeColor;
      ctx.fillRect(x + 2, y, s - 2, s);
      ctx.fillStyle = '#80d010';
      ctx.fillRect(x + 4, y, 3, s);
    } else if (tile === TILE_PIPE_BODY_RIGHT) {
      ctx.fillStyle = this.currentLevel.pipeColor;
      ctx.fillRect(x, y, s - 2, s);
      ctx.fillStyle = '#004000';
      ctx.fillRect(x + s - 4, y, 2, s);
    } else if (tile === TILE_STAIR_STONE || tile === TILE_CASTLE_BRICK) {
      ctx.fillStyle = this.currentLevel.brickColor;
      ctx.fillRect(x, y, s, s);
      ctx.strokeStyle = '#000000';
      ctx.strokeRect(x + 0.5, y + 0.5, s - 1, s - 1);
    } else if (tile === TILE_FLAGPOLE) {
      ctx.fillStyle = '#80d010';
      ctx.fillRect(x + 7, y, 2, s);
    } else if (tile === TILE_FLAGPOLE_TOP) {
      ctx.fillStyle = '#00a800';
      ctx.beginPath();
      ctx.arc(x + 8, y + 8, 5, 0, Math.PI * 2);
      ctx.fill();
    } else if (tile === TILE_BRIDGE) {
      ctx.fillStyle = '#843800';
      ctx.fillRect(x, y + 6, s, 4);
      ctx.fillStyle = '#fc9838';
      ctx.fillRect(x, y + 6, s, 1);
    } else if (tile === TILE_AXE) {
      ctx.fillStyle = '#fce0a8';
      ctx.fillRect(x + 6, y + 2, 4, 12);
      ctx.fillStyle = '#fc2004';
      ctx.beginPath();
      ctx.arc(x + 8, y + 4, 6, 0, Math.PI * 2);
      ctx.fill();
    } else if (tile === TILE_WOOD_PLATFORM) {
      ctx.fillStyle = '#d88b20';
      ctx.fillRect(x, y + 4, s, 8);
      ctx.fillStyle = '#fce0a8';
      ctx.fillRect(x, y + 4, s, 2);
    } else if (tile === TILE_CORAL) {
      ctx.fillStyle = '#fc7460';
      ctx.fillRect(x + 3, y, 10, s);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x + 5, y + 2, 6, 4);
    } else if (tile === TILE_WATER_SURFACE) {
      ctx.fillStyle = '#0080f8';
      ctx.fillRect(x, y, s, 4);
    }
  }

  private renderBouncingBlocks() {
    const ctx = this.ctx;
    this.activeBlockBounces.forEach((b) => {
      const x = b.col * this.TILE_SIZE;
      const y = b.row * this.TILE_SIZE + b.offsetY;
      this.drawTile(b.type, x, y);
    });
  }

  private renderFirebars() {
    const ctx = this.ctx;
    this.firebars.forEach((fb) => {
      const pivotX = fb.col * this.TILE_SIZE + 8;
      const pivotY = fb.row * this.TILE_SIZE + 8;
      for (let step = 1; step <= fb.length; step++) {
        const dist = step * 8;
        const fx = pivotX + Math.cos(fb.angle) * dist;
        const fy = pivotY + Math.sin(fb.angle) * dist;
        ctx.fillStyle = '#fc9838';
        ctx.beginPath();
        ctx.arc(fx, fy, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(fx, fy, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    });
  }

  private renderItems() {
    const ctx = this.ctx;
    this.items.forEach((item) => {
      if (item.type === 'mushroom' || item.type === '1up') {
        ctx.fillStyle = item.type === '1up' ? '#00a800' : '#fc2004';
        ctx.beginPath();
        ctx.arc(item.x + 8, item.y + 7, 7, Math.PI, 0);
        ctx.fill();
        ctx.fillStyle = '#fce0a8';
        ctx.fillRect(item.x + 3, item.y + 7, 10, 8);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(item.x + 6, item.y + 2, 4, 4);
      } else if (item.type === 'fireflower') {
        ctx.fillStyle = '#fc2004';
        ctx.beginPath();
        ctx.arc(item.x + 8, item.y + 6, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fc9838';
        ctx.beginPath();
        ctx.arc(item.x + 8, item.y + 6, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#00a800';
        ctx.fillRect(item.x + 7, item.y + 11, 2, 5);
      } else if (item.type === 'star') {
        ctx.fillStyle = Math.floor(performance.now() / 100) % 2 === 0 ? '#fc9838' : '#fce0a8';
        ctx.fillRect(item.x + 3, item.y + 3, 10, 10);
        ctx.fillStyle = '#000000';
        ctx.fillRect(item.x + 5, item.y + 5, 2, 3);
        ctx.fillRect(item.x + 9, item.y + 5, 2, 3);
      }
    });

    this.spawnedCoins.forEach((c) => {
      ctx.fillStyle = '#fc9838';
      ctx.fillRect(c.x + 2, c.y, 6, 12);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(c.x + 4, c.y + 2, 2, 8);
    });
  }

  private renderProjectiles() {
    const ctx = this.ctx;
    this.fireballs.forEach((fb) => {
      ctx.fillStyle = '#fc2004';
      ctx.beginPath();
      ctx.arc(fb.x + 4, fb.y + 4, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(fb.x + 4, fb.y + 4, 2, 0, Math.PI * 2);
      ctx.fill();
    });

    this.bowserFlames.forEach((f) => {
      ctx.fillStyle = '#fc2004';
      ctx.fillRect(f.x, f.y, 16, 8);
      ctx.fillStyle = '#fc9838';
      ctx.fillRect(f.x + 4, f.y + 2, 10, 4);
    });
  }

  private renderEnemies() {
    const ctx = this.ctx;
    this.enemies.forEach((e) => {
      if (e.type === 'goomba') {
        if (e.state === 'squished') {
          ctx.fillStyle = '#843800';
          ctx.fillRect(e.x, e.y + 10, 16, 6);
        } else {
          ctx.fillStyle = '#843800';
          ctx.fillRect(e.x + 3, e.y + 2, 10, 10);
          ctx.fillStyle = '#fce0a8';
          ctx.fillRect(e.x + 4, e.y + 4, 2, 4);
          ctx.fillRect(e.x + 10, e.y + 4, 2, 4);
          ctx.fillStyle = '#000000';
          ctx.fillRect(e.x + (e.animFrame === 0 ? 0 : 2), e.y + 12, 5, 4);
          ctx.fillRect(e.x + (e.animFrame === 0 ? 11 : 9), e.y + 12, 5, 4);
        }
      } else if (e.type === 'koopa' || e.type === 'red_koopa' || e.type === 'paratroopa') {
        const shellColor = e.type === 'red_koopa' ? '#fc2004' : '#00a800';
        if (e.state === 'shell_idle' || e.state === 'shell_moving') {
          ctx.fillStyle = shellColor;
          ctx.beginPath();
          ctx.arc(e.x + 8, e.y + 10, 6, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillStyle = shellColor;
          ctx.fillRect(e.x + 2, e.y + 6, 12, 10);
          ctx.fillStyle = '#fce0a8';
          ctx.fillRect(e.x + 4, e.y, 8, 6);
          if (e.type === 'paratroopa') {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(e.x + 12, e.y + 2, 6, 6);
          }
        }
      } else if (e.type === 'piranha') {
        ctx.fillStyle = '#fc2004';
        ctx.beginPath();
        ctx.arc(e.x + 6, e.y + 8, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(e.x + 2, e.y + 4, 3, 3);
        ctx.fillRect(e.x + 8, e.y + 4, 3, 3);
      } else if (e.type === 'buzzy') {
        ctx.fillStyle = '#0050b8';
        ctx.beginPath();
        ctx.arc(e.x + 8, e.y + 8, 7, Math.PI, 0);
        ctx.fill();
        ctx.fillStyle = '#fce0a8';
        ctx.fillRect(e.x + 3, e.y + 8, 10, 6);
      } else if (e.type === 'spiny') {
        ctx.fillStyle = '#fc2004';
        ctx.fillRect(e.x + 2, e.y + 4, 12, 10);
        ctx.fillStyle = '#ffffff'; // Spikes
        ctx.fillRect(e.x + 3, e.y, 2, 4);
        ctx.fillRect(e.x + 7, e.y, 2, 4);
        ctx.fillRect(e.x + 11, e.y, 2, 4);
      } else if (e.type === 'lakitu') {
        // Cloud
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(e.x + 8, e.y + 12, 8, 0, Math.PI * 2);
        ctx.arc(e.x + 16, e.y + 12, 6, 0, Math.PI * 2);
        ctx.fill();
        // Lakitu face
        ctx.fillStyle = '#00a800';
        ctx.fillRect(e.x + 4, e.y, 8, 8);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(e.x + 6, e.y + 2, 4, 2);
      } else if (e.type === 'blooper') {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(e.x + 3, e.y + 2, 10, 12);
        ctx.fillStyle = '#000000';
        ctx.fillRect(e.x + 5, e.y + 5, 2, 2);
        ctx.fillRect(e.x + 9, e.y + 5, 2, 2);
      } else if (e.type === 'cheep') {
        ctx.fillStyle = '#fc2004';
        ctx.beginPath();
        ctx.arc(e.x + 8, e.y + 8, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(e.x + 2, e.y + 4, 4, 4);
      } else if (e.type === 'bowser') {
        // Giant Bowser (32x32)
        ctx.fillStyle = '#00a800';
        ctx.fillRect(e.x + 6, e.y + 6, 20, 22);
        ctx.fillStyle = '#fc9838';
        ctx.fillRect(e.x + 2, e.y + 8, 8, 14); // Spiky shell
        ctx.fillStyle = '#fc2004'; // Red hair
        ctx.fillRect(e.x + 14, e.y, 10, 6);
        ctx.fillStyle = '#ffffff'; // Horns & Teeth
        ctx.fillRect(e.x + 24, e.y + 2, 4, 4);
        ctx.fillRect(e.x + 2, e.y + 14, 4, 4);
      }
    });
  }

  private renderRescuedNPC() {
    const ctx = this.ctx;
    const npcX = (this.currentLevel.axeCol || 156) * this.TILE_SIZE + 40;
    const npcY = 11 * this.TILE_SIZE;

    if (this.currentLevel.rescuedNpc === 'peach') {
      // Princess Peach
      ctx.fillStyle = '#fc98a8';
      ctx.fillRect(npcX, npcY + 6, 12, 14); // Pink dress
      ctx.fillStyle = '#fce0a8';
      ctx.fillRect(npcX + 2, npcY, 8, 6); // Face
      ctx.fillStyle = '#fc9838';
      ctx.fillRect(npcX, npcY, 12, 3); // Golden hair
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 8px monospace';
      ctx.fillText('PEACH: THANK YOU MARIO!', npcX - 25, npcY - 14);
      ctx.fillText('YOUR QUEST IS OVER!', npcX - 18, npcY - 4);
    } else {
      // Toad
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(npcX + 6, npcY + 4, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fc2004';
      ctx.fillRect(npcX + 4, npcY + 2, 4, 4);
      ctx.fillStyle = '#0050b8';
      ctx.fillRect(npcX + 2, npcY + 10, 8, 6);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 7px monospace';
      ctx.fillText('THANK YOU MARIO!', npcX - 20, npcY - 12);
      ctx.fillText('PRINCESS IS IN CASTLE 2!', npcX - 35, npcY - 4);
    }
  }

  private renderMario() {
    const ctx = this.ctx;
    const m = this.mario;

    if (m.invincibleTimer > 0 && Math.floor(m.invincibleTimer * 14) % 2 === 0) {
      return;
    }

    ctx.save();
    ctx.translate(m.x, m.y);

    if (!m.facingRight) {
      ctx.translate(m.width, 0);
      ctx.scale(-1, 1);
    }

    // Dynamic color palettes
    let shirtColor = '#fc2004';
    let overallColor = '#0048c4';

    if (m.isFire) {
      shirtColor = '#ffffff';
      overallColor = '#fc2004';
    } else if (m.isStar) {
      const colors = ['#fc2004', '#00a800', '#fc9838', '#ffffff'];
      shirtColor = colors[Math.floor(performance.now() / 80) % colors.length];
      overallColor = colors[Math.floor(performance.now() / 80 + 1) % colors.length];
    }

    if (m.isDead) {
      ctx.fillStyle = '#fc2004';
      ctx.fillRect(3, 0, 8, 6);
      ctx.fillStyle = '#fce0a8';
      ctx.fillRect(3, 6, 8, 4);
      ctx.fillStyle = '#fc2004';
      ctx.fillRect(2, 10, 10, 6);
      ctx.restore();
      return;
    }

    if (!m.isSuper && !m.isFire) {
      // Small Mario (16px)
      ctx.fillStyle = shirtColor;
      ctx.fillRect(3, 0, 9, 3);
      ctx.fillRect(5, 3, 7, 2);

      ctx.fillStyle = '#fce0a8';
      ctx.fillRect(2, 3, 6, 4);
      ctx.fillStyle = '#843800';
      ctx.fillRect(0, 4, 4, 3);
      ctx.fillRect(4, 6, 4, 1.5);

      ctx.fillStyle = overallColor;
      ctx.fillRect(3, 7, 8, 5);
      ctx.fillStyle = shirtColor;
      ctx.fillRect(1, 8, 3, 3);
      ctx.fillRect(9, 8, 3, 3);

      ctx.fillStyle = '#843800';
      if (!m.isGrounded) {
        ctx.fillRect(0, 12, 4, 4);
        ctx.fillRect(9, 10, 4, 4);
      } else if (m.runFrame === 0) {
        ctx.fillRect(2, 12, 4, 4);
        ctx.fillRect(8, 12, 4, 4);
      } else {
        ctx.fillRect(0, 12, 5, 4);
        ctx.fillRect(9, 12, 5, 4);
      }
    } else {
      // Super / Fire Mario (28px)
      ctx.fillStyle = shirtColor;
      ctx.fillRect(4, 0, 10, 4);
      ctx.fillRect(6, 4, 8, 3);

      ctx.fillStyle = '#fce0a8';
      ctx.fillRect(3, 5, 8, 6);
      ctx.fillStyle = '#843800';
      ctx.fillRect(1, 6, 4, 4);
      ctx.fillRect(6, 9, 6, 2);

      ctx.fillStyle = shirtColor;
      ctx.fillRect(2, 11, 11, 6);
      ctx.fillStyle = overallColor;
      ctx.fillRect(4, 13, 8, 8);
      ctx.fillStyle = '#fca044';
      ctx.fillRect(5, 14, 2, 2);
      ctx.fillRect(9, 14, 2, 2);

      ctx.fillStyle = '#843800';
      if (!m.isGrounded) {
        ctx.fillRect(0, 22, 5, 6);
        ctx.fillRect(10, 20, 5, 6);
      } else if (m.runFrame === 0) {
        ctx.fillRect(2, 22, 5, 6);
        ctx.fillRect(8, 22, 5, 6);
      } else {
        ctx.fillRect(0, 22, 6, 6);
        ctx.fillRect(9, 22, 6, 6);
      }
    }

    ctx.restore();
  }

  private renderParticles() {
    const ctx = this.ctx;
    this.brickParticles.forEach((p) => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = this.currentLevel.brickColor;
      ctx.fillRect(-3, -3, 6, 6);
      ctx.restore();
    });

    this.scorePopups.forEach((s) => {
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 8px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(s.text, s.x, s.y);
    });
  }

  private renderHUD() {
    const ctx = this.ctx;
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 8px monospace';
    ctx.textBaseline = 'top';

    ctx.textAlign = 'left';
    ctx.fillText('MARIO', 20, 8);
    ctx.fillText(this.stats.score.toString().padStart(6, '0'), 20, 17);

    ctx.fillText('🪙×' + this.stats.coins.toString().padStart(2, '0'), 86, 17);

    ctx.textAlign = 'center';
    ctx.fillText('WORLD', 150, 8);
    ctx.fillText(this.stats.world, 150, 17);

    ctx.textAlign = 'right';
    ctx.fillText('TIME', 236, 8);
    ctx.fillText(this.stats.time.toString().padStart(3, '0'), 236, 17);

    // Powerup badge status
    if (this.mario.isFire) {
      ctx.textAlign = 'left';
      ctx.fillStyle = '#fc2004';
      ctx.fillText('🔥 FIRE', 20, 28);
    } else if (this.mario.isStar) {
      ctx.textAlign = 'left';
      ctx.fillStyle = '#fc9838';
      ctx.fillText('⭐ STAR', 20, 28);
    } else if (this.mario.isSuper) {
      ctx.textAlign = 'left';
      ctx.fillStyle = '#00a800';
      ctx.fillText('🍄 SUPER', 20, 28);
    }
  }

  public restartGame() {
    this.stats.score = 0;
    this.stats.coins = 0;
    this.stats.lives = 3;
    this.loadLevel(0, false);
  }

  public setPaused(paused: boolean) {
    this.isPaused = paused;
    if (paused) {
      superMarioAudio.stopMusic();
    } else {
      this.startThemeMusic();
    }
  }

  public destroy() {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
    }
    superMarioAudio.stopMusic();
  }
}
