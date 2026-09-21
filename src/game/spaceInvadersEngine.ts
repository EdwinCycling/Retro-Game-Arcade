/**
 * Space Invaders (1978) Pure TypeScript Game Simulation Engine
 * Manages game state, alien march logic, projectile collision,
 * bunker destruction, UFO spawning, and controls.
 */

import {
  SpaceInvadersState,
  GameOverReason,
  InvaderEntity,
  PlayerCannonEntity,
  LaserEntity,
  AlienBombEntity,
  DefenseBunker,
  MysteryUfoEntity,
  SpaceScorePopup,
  InvaderType
} from './spaceInvadersTypes';
import { createBunkerGrid } from './spaceInvadersSprites';
import { spaceAudio } from './spaceInvadersAudio';
import { haptics } from '../utils/haptics';
import { Direction } from '../types';

export class SpaceInvadersEngine {
  public static readonly CANVAS_WIDTH = 448;
  public static readonly CANVAS_HEIGHT = 520;

  // Game state
  private state: SpaceInvadersState = 'READY';
  private score: number = 0;
  private wave: number = 1;
  private highScore: number = 0;
  private gameOverReason: GameOverReason = null;

  // Player Cannon
  private player: PlayerCannonEntity = {
    x: 208,
    y: 456,
    width: 32,
    height: 18,
    speed: 210,
    isDying: false,
    deathTimer: 0,
    deathFrame: 0,
    invulnerableTimer: 0,
    lives: 3
  };

  // Player Laser (Single shot on screen at a time, authentic 1978!)
  private laser: LaserEntity = {
    x: 0,
    y: 0,
    width: 3,
    height: 12,
    speed: 480,
    active: false
  };

  // Aliens Armada (5 rows of 11 = 55 invaders)
  private invaders: InvaderEntity[] = [];
  private fleetDirection: 1 | -1 = 1; // 1 = right, -1 = left
  private fleetStepTimer: number = 0;
  private marchNoteStep: number = 0;
  private invasionY: number = 440; // If aliens cross this, instant Game Over!

  // Alien Bombs
  private bombs: AlienBombEntity[] = [];
  private bombDropTimer: number = 0;

  // 4 Defense Bunkers
  private bunkers: DefenseBunker[] = [];

  // Mystery Flying Saucer (UFO)
  private ufo: MysteryUfoEntity = {
    active: false,
    x: -60,
    y: 52,
    width: 38,
    height: 18,
    speed: 120,
    direction: 1,
    points: 100,
    deathTimer: 0,
    displayScore: null
  };
  private ufoSpawnTimer: number = 20; // seconds until next spawn

  // Score popups
  private scorePopups: SpaceScorePopup[] = [];

  // Timers & State Transitions
  private stateTimer: number = 0;

  // Inputs
  private inputLeft: boolean = false;
  private inputRight: boolean = false;

  // Event callbacks
  private onGameOverCallback?: (finalScore: number, wave: number, reason: GameOverReason) => void;
  private onStateChangeCallback?: (state: SpaceInvadersState) => void;

  constructor(initialHighScore: number = 0) {
    this.highScore = initialHighScore;
    this.initGame();
  }

  public initGame() {
    this.score = 0;
    this.wave = 1;
    this.gameOverReason = null;
    this.player.lives = 3;
    this.player.isDying = false;
    this.player.invulnerableTimer = 0;
    this.player.x = (SpaceInvadersEngine.CANVAS_WIDTH - this.player.width) / 2;
    this.laser.active = false;
    this.bombs = [];
    this.scorePopups = [];
    this.ufo.active = false;
    this.ufoSpawnTimer = 22;

    this.initBunkers();
    this.initInvaders();
    this.setState('READY');
    this.stateTimer = 1.8;
  }

  public setHighScore(hs: number) {
    this.highScore = Math.max(this.highScore, hs);
  }

  public setWave(targetWave: number) {
    this.wave = Math.max(1, Math.min(5, targetWave));
    this.laser.active = false;
    this.bombs = [];
    this.scorePopups = [];
    this.ufo.active = false;
    this.ufoSpawnTimer = Math.max(8, 22 - (this.wave - 1) * 3);
    this.initInvaders();
    this.setState('READY');
    this.stateTimer = 1.2;
  }

  public onGameOver(cb: (finalScore: number, wave: number, reason: GameOverReason) => void) {
    this.onGameOverCallback = cb;
  }

  public onStateChange(cb: (state: SpaceInvadersState) => void) {
    this.onStateChangeCallback = cb;
  }

  public getGameOverReason(): GameOverReason {
    return this.gameOverReason;
  }

  private setState(newState: SpaceInvadersState) {
    this.state = newState;
    if (this.onStateChangeCallback) {
      this.onStateChangeCallback(newState);
    }
  }

  public getState(): SpaceInvadersState {
    return this.state;
  }

  public getScore(): number {
    return this.score;
  }

  public getWave(): number {
    return this.wave;
  }

  public getPlayer(): PlayerCannonEntity {
    return this.player;
  }

  public getLaser(): LaserEntity {
    return this.laser;
  }

  public getInvaders(): InvaderEntity[] {
    return this.invaders;
  }

  public getBombs(): AlienBombEntity[] {
    return this.bombs;
  }

  public getBunkers(): DefenseBunker[] {
    return this.bunkers;
  }

  public getUfo(): MysteryUfoEntity {
    return this.ufo;
  }

  public getScorePopups(): SpaceScorePopup[] {
    return this.scorePopups;
  }

  /**
   * Set up the 4 defense bunkers spaced across the screen
   */
  private initBunkers() {
    this.bunkers = [];
    const bunkerWidth = 44;
    const bunkerHeight = 32;
    const bunkerY = 384;
    const positions = [50, 148, 246, 344];

    for (let i = 0; i < 4; i++) {
      this.bunkers.push({
        id: i,
        x: positions[i],
        y: bunkerY,
        width: bunkerWidth,
        height: bunkerHeight,
        blocks: createBunkerGrid()
      });
    }
  }

  /**
   * Spawn 55 invaders (5 rows x 11 columns)
   */
  private initInvaders() {
    this.invaders = [];
    this.fleetDirection = 1;
    this.marchNoteStep = 0;

    // In higher waves, the fleet starts slightly lower (down to a safe limit)
    const waveOffset = Math.min((this.wave - 1) * 16, 80);
    const startY = 96 + waveOffset;
    const startX = 36;
    const spacingX = 34;
    const spacingY = 26;

    for (let row = 0; row < 5; row++) {
      let type: InvaderType = 'BOTTOM';
      let points = 10;
      let width = 28;
      let height = 18;

      if (row === 0) {
        type = 'TOP';
        points = 30;
        width = 20;
        height = 18;
      } else if (row === 1 || row === 2) {
        type = 'MIDDLE';
        points = 20;
        width = 26;
        height = 18;
      }

      for (let col = 0; col < 11; col++) {
        const x = startX + col * spacingX;
        const y = startY + row * spacingY;

        this.invaders.push({
          id: `${row}-${col}`,
          row,
          col,
          x,
          y,
          width,
          height,
          type,
          points,
          alive: true,
          frame: 0,
          deathTimer: 0
        });
      }
    }
  }

  /**
   * Compute dynamic marching interval based on living invaders.
   * As aliens die, they speed up exponentially!
   */
  private getFleetStepInterval(): number {
    const aliveCount = this.invaders.filter(inv => inv.alive).length;
    if (aliveCount <= 1) return 0.05; // Lone invader lightning speed!
    if (aliveCount <= 5) return 0.12;
    if (aliveCount <= 12) return 0.22;
    if (aliveCount <= 25) return 0.36;
    if (aliveCount <= 40) return 0.52;
    return 0.72; // Full fleet relaxed tempo
  }

  // Input Handlers
  public setMoveLeft(val: boolean) {
    this.inputLeft = val;
  }

  public setMoveRight(val: boolean) {
    this.inputRight = val;
  }

  public setCannonX(targetX: number) {
    const clamped = Math.max(16, Math.min(SpaceInvadersEngine.CANVAS_WIDTH - this.player.width - 16, targetX));
    this.player.x = clamped;
  }

  public handleDirectionInput(dir: Direction) {
    if (dir === 'LEFT') {
      this.inputLeft = true;
      this.inputRight = false;
      setTimeout(() => { this.inputLeft = false; }, 160);
    } else if (dir === 'RIGHT') {
      this.inputRight = true;
      this.inputLeft = false;
      setTimeout(() => { this.inputRight = false; }, 160);
    } else if (dir === 'UP') {
      this.fireLaser();
    }
  }

  public fireLaser() {
    if (this.state === 'READY') {
      this.setState('PLAYING');
    }
    if (this.state !== 'PLAYING' || this.player.isDying) return;

    // Authentic 1978 rule: only 1 laser on screen at a time
    if (!this.laser.active) {
      this.laser.x = this.player.x + this.player.width / 2 - this.laser.width / 2;
      this.laser.y = this.player.y - this.laser.height;
      this.laser.active = true;
      spaceAudio.playShoot();
      haptics.laserShoot();
    }
  }

  public togglePause() {
    if (this.state === 'PLAYING') {
      this.setState('PAUSED');
      spaceAudio.stopUfoSound();
    } else if (this.state === 'PAUSED') {
      this.setState('PLAYING');
      if (this.ufo.active) {
        spaceAudio.startUfoSound();
      }
    }
  }

  /**
   * Main Frame Simulation Tick
   */
  public update(dt: number) {
    // Clamp delta time to avoid frame skips
    const delta = Math.min(dt, 0.1);

    // Update floating score popups
    for (let i = this.scorePopups.length - 1; i >= 0; i--) {
      this.scorePopups[i].timer -= delta;
      this.scorePopups[i].y -= 15 * delta;
      if (this.scorePopups[i].timer <= 0) {
        this.scorePopups.splice(i, 1);
      }
    }

    // State machine handling
    switch (this.state) {
      case 'READY':
        this.stateTimer -= delta;
        if (this.stateTimer <= 0) {
          this.setState('PLAYING');
        }
        break;

      case 'PLAYING':
        this.updatePlaying(delta);
        break;

      case 'PLAYER_DYING':
        this.updatePlayerDying(delta);
        break;

      case 'WAVE_CLEAR':
        this.stateTimer -= delta;
        if (this.stateTimer <= 0) {
          this.startNextWave();
        }
        break;

      case 'PAUSED':
      case 'GAME_OVER':
        break;
    }
  }

  private updatePlaying(dt: number) {
    // 0. Update player invulnerability cooldown
    if (this.player.invulnerableTimer > 0) {
      this.player.invulnerableTimer -= dt;
    }

    // 1. Move Player Cannon
    if (this.inputLeft) {
      this.player.x -= this.player.speed * dt;
    }
    if (this.inputRight) {
      this.player.x += this.player.speed * dt;
    }
    this.player.x = Math.max(16, Math.min(SpaceInvadersEngine.CANVAS_WIDTH - this.player.width - 16, this.player.x));

    // 2. Move Player Laser
    if (this.laser.active) {
      this.laser.y -= this.laser.speed * dt;
      if (this.laser.y < 40) {
        this.laser.active = false; // Laser went off the top of screen
      }
    }

    // 3. Update Invader Explosions timers
    this.invaders.forEach(inv => {
      if (!inv.alive && inv.deathTimer > 0) {
        inv.deathTimer -= dt;
      }
    });

    // 4. Invader Fleet Marching Step
    this.fleetStepTimer += dt;
    const currentStepInterval = this.getFleetStepInterval();

    if (this.fleetStepTimer >= currentStepInterval) {
      this.fleetStepTimer = 0;
      this.stepFleet();
    }

    // 5. Check if aliens reached bunkers or baseline
    const aliveInvaders = this.invaders.filter(inv => inv.alive);
    if (aliveInvaders.length === 0) {
      this.triggerWaveClear();
      return;
    }

    // Baseline breach test (Instant Game Over!)
    for (const inv of aliveInvaders) {
      if (inv.y + inv.height >= this.invasionY) {
        this.triggerGameOver('INVASION_BREACH');
        return;
      }

      // If aliens reach bunker height, they erode the bunker completely
      this.bunkers.forEach(bunker => {
        if (
          inv.x < bunker.x + bunker.width &&
          inv.x + inv.width > bunker.x &&
          inv.y + inv.height > bunker.y &&
          inv.y < bunker.y + bunker.height
        ) {
          this.eraseBunkerArea(bunker, inv.x, inv.y, inv.width, inv.height);
        }
      });
    }

    // 6. Alien Bombs Logic
    this.bombDropTimer += dt;
    const bombInterval = Math.max(1.1 - this.wave * 0.12, 0.45);
    if (this.bombDropTimer >= bombInterval && this.bombs.length < 3) {
      this.bombDropTimer = 0;
      this.dropAlienBomb();
    }

    // Update active bombs
    for (let i = this.bombs.length - 1; i >= 0; i--) {
      const bomb = this.bombs[i];
      bomb.y += bomb.speed * dt;
      bomb.frame = (bomb.frame + 1) % 4;

      // Offscreen bottom
      if (bomb.y > SpaceInvadersEngine.CANVAS_HEIGHT - 30) {
        this.bombs.splice(i, 1);
        continue;
      }

      // Check collision with Player Laser (bullets colliding cancels both!)
      if (this.laser.active && this.checkCollision(this.laser, bomb)) {
        this.laser.active = false;
        this.bombs.splice(i, 1);
        continue;
      }

      // Check collision with Bunkers
      let hitBunker = false;
      for (const bunker of this.bunkers) {
        if (this.checkPointInBunker(bunker, bomb.x + bomb.width / 2, bomb.y + bomb.height)) {
          this.damageBunker(bunker, bomb.x + bomb.width / 2, bomb.y + bomb.height, 6);
          this.bombs.splice(i, 1);
          hitBunker = true;
          haptics.bunkerHit();
          break;
        }
      }
      if (hitBunker) continue;

      // Check collision with Player Cannon (respect invulnerability)
      if (this.player.invulnerableTimer <= 0 && !this.player.isDying && this.checkCollision(bomb, this.player)) {
        this.bombs.splice(i, 1);
        this.killPlayer();
        break;
      }
    }

    // 7. Player Laser Collisions
    if (this.laser.active) {
      // With Mystery UFO
      if (this.ufo.active && this.checkCollision(this.laser, this.ufo)) {
        this.laser.active = false;
        this.killUfo();
      }

      // With Invaders
      if (this.laser.active) {
        for (const inv of aliveInvaders) {
          if (this.checkCollision(this.laser, inv)) {
            this.laser.active = false;
            this.killInvader(inv);
            break;
          }
        }
      }

      // With Bunkers
      if (this.laser.active) {
        for (const bunker of this.bunkers) {
          if (this.checkPointInBunker(bunker, this.laser.x + this.laser.width / 2, this.laser.y)) {
            this.damageBunker(bunker, this.laser.x + this.laser.width / 2, this.laser.y, 4);
            this.laser.active = false;
            haptics.bunkerHit();
            break;
          }
        }
      }
    }

    // 8. Mystery UFO Saucer Logic
    this.updateUfo(dt);
  }

  /**
   * Fleet Step: Move horizontally or shift down when hit bounds
   */
  private stepFleet() {
    const aliveInvaders = this.invaders.filter(inv => inv.alive);
    if (aliveInvaders.length === 0) return;

    let hitEdge = false;
    const padding = 16;

    for (const inv of aliveInvaders) {
      if (
        (this.fleetDirection === 1 && inv.x + inv.width + 8 >= SpaceInvadersEngine.CANVAS_WIDTH - padding) ||
        (this.fleetDirection === -1 && inv.x - 8 <= padding)
      ) {
        hitEdge = true;
        break;
      }
    }

    if (hitEdge) {
      // Drop fleet down by 1 step & invert direction
      this.fleetDirection = this.fleetDirection === 1 ? -1 : 1;
      this.invaders.forEach(inv => {
        inv.y += 14;
        inv.frame = 1 - inv.frame;
      });
    } else {
      // Step fleet horizontally
      const stepDist = 9 * this.fleetDirection;
      this.invaders.forEach(inv => {
        inv.x += stepDist;
        inv.frame = 1 - inv.frame;
      });
    }

    // Play heartbeat march note
    spaceAudio.playMarchNote(this.marchNoteStep);
    this.marchNoteStep = (this.marchNoteStep + 1) % 4;
  }

  /**
   * Random bottom-most invader drops a bomb
   */
  private dropAlienBomb() {
    const columnsWithAliens: Map<number, InvaderEntity> = new Map();
    this.invaders
      .filter(inv => inv.alive)
      .forEach(inv => {
        const existing = columnsWithAliens.get(inv.col);
        if (!existing || inv.row > existing.row) {
          columnsWithAliens.set(inv.col, inv);
        }
      });

    const bottomInvaders = Array.from(columnsWithAliens.values());
    if (bottomInvaders.length === 0) return;

    const shooter = bottomInvaders[Math.floor(Math.random() * bottomInvaders.length)];
    const types: ('rolling' | 'plunger' | 'squiggly')[] = ['rolling', 'plunger', 'squiggly'];
    const chosenType = types[Math.floor(Math.random() * types.length)];

    this.bombs.push({
      id: `${Date.now()}-${Math.random()}`,
      x: shooter.x + shooter.width / 2 - 1.5,
      y: shooter.y + shooter.height,
      width: 3,
      height: 10,
      speed: 190 + this.wave * 15,
      active: true,
      type: chosenType,
      frame: 0
    });
  }

  /**
   * Handle Invader Destroyed
   */
  private killInvader(inv: InvaderEntity) {
    inv.alive = false;
    inv.deathTimer = 0.22; // Show explosion sprite briefly
    this.score += inv.points;
    this.highScore = Math.max(this.highScore, this.score);

    spaceAudio.playInvaderHit();
    haptics.invaderKilled();

    // Check if wave is finished
    const remaining = this.invaders.filter(i => i.alive).length;
    if (remaining === 0) {
      this.triggerWaveClear();
    }
  }

  /**
   * Mystery UFO (Saucer) Spawning & Movement
   */
  private updateUfo(dt: number) {
    if (this.ufo.active) {
      this.ufo.x += this.ufo.speed * this.ufo.direction * dt;

      // Offscreen
      if (
        (this.ufo.direction === 1 && this.ufo.x > SpaceInvadersEngine.CANVAS_WIDTH + 50) ||
        (this.ufo.direction === -1 && this.ufo.x < -60)
      ) {
        this.ufo.active = false;
        spaceAudio.stopUfoSound();
      }
    } else {
      // UFO dying explosion score popup display
      if (this.ufo.deathTimer > 0) {
        this.ufo.deathTimer -= dt;
      }

      this.ufoSpawnTimer -= dt;
      if (this.ufoSpawnTimer <= 0) {
        this.spawnUfo();
      }
    }
  }

  private spawnUfo() {
    this.ufo.active = true;
    this.ufo.direction = Math.random() > 0.5 ? 1 : -1;
    this.ufo.x = this.ufo.direction === 1 ? -45 : SpaceInvadersEngine.CANVAS_WIDTH + 45;
    this.ufo.speed = 110 + Math.random() * 30;

    // Classic arcade UFO mystery points: 50, 100, 150, 300
    const pointOptions = [50, 100, 150, 300];
    this.ufo.points = pointOptions[Math.floor(Math.random() * pointOptions.length)];
    this.ufoSpawnTimer = 25 + Math.random() * 15;

    spaceAudio.startUfoSound();
  }

  private killUfo() {
    this.ufo.active = false;
    this.ufo.deathTimer = 1.0;
    this.ufo.displayScore = this.ufo.points;
    this.score += this.ufo.points;
    this.highScore = Math.max(this.highScore, this.score);

    this.scorePopups.push({
      id: `ufo-${Date.now()}`,
      text: `${this.ufo.points}`,
      x: this.ufo.x,
      y: this.ufo.y + 4,
      color: '#FF0000',
      timer: 1.2
    });

    spaceAudio.playUfoHit();
    haptics.ufoKilled();
  }

  /**
   * Player Cannon Destroyed
   */
  private killPlayer() {
    this.player.isDying = true;
    this.player.deathTimer = 1.4;
    this.player.deathFrame = 0;
    this.setState('PLAYER_DYING');
    this.laser.active = false;
    this.bombs = []; // Clear falling bombs so respawning player isn't immediately spawn-killed!

    spaceAudio.playPlayerDeath();
    haptics.death();
  }

  private updatePlayerDying(dt: number) {
    this.player.deathTimer -= dt;
    this.player.deathFrame = Math.floor((1.4 - this.player.deathTimer) * 10) % 2;

    if (this.player.deathTimer <= 0) {
      this.player.lives -= 1;
      this.player.isDying = false;

      if (this.player.lives <= 0) {
        this.triggerGameOver('LIVES_DEPLETED');
      } else {
        // Respawn player at center with brief invulnerability cushion
        this.player.x = (SpaceInvadersEngine.CANVAS_WIDTH - this.player.width) / 2;
        this.player.invulnerableTimer = 1.6;
        this.setState('PLAYING');
      }
    }
  }

  /**
   * Bunker pixel destruction calculations
   */
  private checkPointInBunker(bunker: DefenseBunker, px: number, py: number): boolean {
    if (px < bunker.x || px >= bunker.x + bunker.width || py < bunker.y || py >= bunker.y + bunker.height) {
      return false;
    }
    const cols = bunker.blocks[0].length;
    const rows = bunker.blocks.length;
    const col = Math.floor(((px - bunker.x) / bunker.width) * cols);
    const row = Math.floor(((py - bunker.y) / bunker.height) * rows);

    return !!(bunker.blocks[row] && bunker.blocks[row][col]);
  }

  private damageBunker(bunker: DefenseBunker, hitX: number, hitY: number, radiusPx: number) {
    const cols = bunker.blocks[0].length;
    const rows = bunker.blocks.length;
    const blockW = bunker.width / cols;
    const blockH = bunker.height / rows;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (!bunker.blocks[r][c]) continue;
        const bx = bunker.x + c * blockW + blockW / 2;
        const by = bunker.y + r * blockH + blockH / 2;
        const dist = Math.hypot(bx - hitX, by - hitY);
        // Damage radius with jagged randomized outer edge
        if (dist <= radiusPx || (dist <= radiusPx + 2 && Math.random() > 0.45)) {
          bunker.blocks[r][c] = false;
        }
      }
    }
  }

  private eraseBunkerArea(bunker: DefenseBunker, ex: number, ey: number, ew: number, eh: number) {
    const cols = bunker.blocks[0].length;
    const rows = bunker.blocks.length;
    const blockW = bunker.width / cols;
    const blockH = bunker.height / rows;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const bx = bunker.x + c * blockW;
        const by = bunker.y + r * blockH;
        if (bx + blockW > ex && bx < ex + ew && by + blockH > ey && by < ey + eh) {
          bunker.blocks[r][c] = false;
        }
      }
    }
  }

  /**
   * Wave Complete!
   */
  private triggerWaveClear() {
    this.setState('WAVE_CLEAR');
    this.stateTimer = 2.2;
    this.laser.active = false;
    this.bombs = [];
    spaceAudio.stopUfoSound();
    spaceAudio.playWaveClear();
    haptics.levelClear();
  }

  private startNextWave() {
    this.wave += 1;
    this.initInvaders();
    this.laser.active = false;
    this.bombs = [];
    this.setState('PLAYING');
  }

  /**
   * Game Over
   */
  private triggerGameOver(reason: GameOverReason = 'LIVES_DEPLETED') {
    this.gameOverReason = reason;
    this.setState('GAME_OVER');
    spaceAudio.stopUfoSound();
    if (this.onGameOverCallback) {
      this.onGameOverCallback(this.score, this.wave, reason);
    }
  }

  // AABB Collision Detection
  private checkCollision(
    a: { x: number; y: number; width: number; height: number },
    b: { x: number; y: number; width: number; height: number }
  ): boolean {
    return (
      a.x < b.x + b.width &&
      a.x + a.width > b.x &&
      a.y < b.y + b.height &&
      a.y + a.height > b.y
    );
  }
}
