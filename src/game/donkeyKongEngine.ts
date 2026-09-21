/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Donkey Kong (1981 Nintendo Arcade) - Complete Game Engine
 * Featuring all 4 original arcade levels: 25m, 50m, 75m, 100m
 */

import { donkeyKongAudio } from './donkeyKongAudio';

export const VIRTUAL_WIDTH = 224;
export const VIRTUAL_HEIGHT = 256;

export type StageType = '25m' | '50m' | '75m' | '100m';

export interface PlatformSegment {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface Ladder {
  x: number;
  topY: number;
  bottomY: number;
  broken?: boolean; // broken ladders cannot be climbed completely
}

export interface Barrel {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  state: 'rolling' | 'falling' | 'dropping';
  rollingDir: 1 | -1;
  isBlue?: boolean; // blue wild barrel
  animFrame: number;
}

export interface Fireball {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  onLadder: boolean;
  color: string;
  animFrame: number;
}

export interface CementPie {
  id: number;
  x: number;
  y: number;
  vx: number;
  platformIndex: number;
}

export interface Spring {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  bouncePhase: number;
}

export interface Elevator {
  id: number;
  x: number;
  y: number;
  dir: 1 | -1; // 1 = down, -1 = up
  minY: number;
  maxY: number;
}

export interface Rivet {
  id: number;
  x: number;
  y: number;
  removed: boolean;
  platformIndex: number;
}

export interface BonusItem {
  type: 'umbrella' | 'purse' | 'hat';
  x: number;
  y: number;
  points: number;
  collected: boolean;
}

export interface Hammer {
  id: number;
  x: number;
  y: number;
  collected: boolean;
}

export interface ScorePopup {
  x: number;
  y: number;
  text: string;
  timer: number;
  color: string;
}

export class DonkeyKongEngine {
  // Game Loop & State
  public gameState: 'how_high_screen' | 'intro' | 'playing' | 'level_clear' | 'mario_dead' | 'game_over' = 'how_high_screen';
  public stage: StageType = '25m';
  public levelCycle: number = 1; // 1, 2, 3...
  public score: number = 0;
  public bonusTimer: number = 5000;
  public bonusTickTimer: number = 0;
  public lives: number = 3;
  public gameTimer: number = 0;
  public stateTimer: number = 0;

  // Mario (Jumpman) State
  public px: number = 24;
  public py: number = 236;
  public pvx: number = 0;
  public pvy: number = 0;
  public facing: 'left' | 'right' = 'right';
  public isGrounded: boolean = true;
  public isJumping: boolean = false;
  public isClimbing: boolean = false;
  public climbingLadder: Ladder | null = null;
  public isHammerActive: boolean = false;
  public hammerTimer: number = 0;
  public hammerPhase: 'up' | 'down' = 'up';
  public animFrame: number = 0;
  public deathTimer: number = 0;
  public invulnerableTimer: number = 0;

  // Donkey Kong State
  public dkX: number = 30;
  public dkY: number = 56;
  public dkAction: 'idle' | 'chest_thump' | 'throw_barrel' | 'defeat_fall' = 'idle';
  public dkAnimFrame: number = 0;
  public dkFallY: number = 56;
  public barrelThrowCooldown: number = 120;

  // Pauline State
  public paulineX: number = 90;
  public paulineY: number = 26;
  public paulineState: 'help' | 'heart' = 'help';
  public heartAnimFrame: number = 0;

  // Stage Specific Objects
  public platforms: PlatformSegment[] = [];
  public ladders: Ladder[] = [];
  public barrels: Barrel[] = [];
  public fireballs: Fireball[] = [];
  public cementPies: CementPie[] = [];
  public springs: Spring[] = [];
  public elevators: Elevator[] = [];
  public rivets: Rivet[] = [];
  public hammers: Hammer[] = [];
  public bonusItems: BonusItem[] = [];
  public scorePopups: ScorePopup[] = [];

  // Oil Drum linksonder
  public oilDrum = { x: 18, y: 228, flaming: false, animFrame: 0 };

  // Callbacks
  public onStateChange?: () => void;
  public onGameOver?: (finalScore: number) => void;

  private nextId: number = 1;

  constructor() {
    this.initStage('25m');
  }

  public initStage(stage: StageType) {
    this.stage = stage;
    this.gameState = 'how_high_screen';
    this.stateTimer = 110; // ~2 seconds for "HOW HIGH CAN YOU GET?"
    this.bonusTimer = Math.min(5000 + (this.levelCycle - 1) * 1000, 8000);
    this.bonusTickTimer = 0;

    // Reset entities
    this.barrels = [];
    this.fireballs = [];
    this.cementPies = [];
    this.springs = [];
    this.elevators = [];
    this.rivets = [];
    this.hammers = [];
    this.bonusItems = [];
    this.scorePopups = [];
    this.isHammerActive = false;
    this.hammerTimer = 0;
    donkeyKongAudio.stopHammerMusic();

    // Setup stage layout
    switch (stage) {
      case '25m':
        this.setupStage25m();
        break;
      case '50m':
        this.setupStage50m();
        break;
      case '75m':
        this.setupStage75m();
        break;
      case '100m':
        this.setupStage100m();
        break;
    }

    donkeyKongAudio.playStageIntro();
  }

  public loadStage(stage: StageType) {
    this.initStage(stage);
  }

  /**
   * LEVEL 1 (25m): Girders & Barrels
   */
  private setupStage25m() {
    this.px = 24;
    this.py = 236;
    this.facing = 'right';
    this.dkX = 30;
    this.dkY = 56;
    this.paulineX = 90;
    this.paulineY = 24;
    this.oilDrum = { x: 18, y: 228, flaming: false, animFrame: 0 };

    // 6 sloped girder tiers
    this.platforms = [
      // Bottom floor (flat base + slight slant right)
      { x1: 0, y1: 240, x2: 224, y2: 240 },
      // Tier 2 (slopes down to the left)
      { x1: 0, y1: 206, x2: 204, y2: 198 },
      // Tier 3 (slopes down to the right)
      { x1: 20, y1: 166, x2: 224, y2: 174 },
      // Tier 4 (slopes down to the left)
      { x1: 0, y1: 138, x2: 204, y2: 130 },
      // Tier 5 (slopes down to the right)
      { x1: 20, y1: 98, x2: 224, y2: 106 },
      // Tier 6 (top flat platform where DK stands)
      { x1: 0, y1: 68, x2: 120, y2: 68 },
      // Pauline high girder
      { x1: 80, y1: 34, x2: 120, y2: 34 },
    ];

    // Ladders (complete & broken)
    this.ladders = [
      { x: 190, topY: 199, bottomY: 240 },
      { x: 100, topY: 203, bottomY: 240, broken: true },
      { x: 38, topY: 167, bottomY: 205 },
      { x: 70, topY: 168, bottomY: 203, broken: true },
      { x: 190, topY: 131, bottomY: 173 },
      { x: 130, topY: 134, bottomY: 170, broken: true },
      { x: 38, topY: 99, bottomY: 137 },
      { x: 80, topY: 101, bottomY: 134, broken: true },
      { x: 74, topY: 68, bottomY: 102 },
      { x: 88, topY: 34, bottomY: 68 },
      { x: 108, topY: 34, bottomY: 68 },
    ];

    // 2 Hammers
    this.hammers = [
      { id: 1, x: 28, y: 192, collected: false },
      { id: 2, x: 180, y: 122, collected: false },
    ];

    // Bonus items (Pauline's parasol and hat)
    this.bonusItems = [
      { type: 'umbrella', x: 186, y: 92, points: 300, collected: false },
      { type: 'hat', x: 26, y: 156, points: 500, collected: false },
    ];
  }

  /**
   * LEVEL 2 (50m): Conveyor Belts & Cement Pies
   */
  private setupStage50m() {
    this.px = 20;
    this.py = 236;
    this.facing = 'right';
    this.dkX = 140;
    this.dkY = 56;
    this.paulineX = 90;
    this.paulineY = 24;
    this.oilDrum = { x: 18, y: 228, flaming: true, animFrame: 0 };

    // 5 horizontal conveyor tiers
    this.platforms = [
      // Floor 1
      { x1: 0, y1: 240, x2: 224, y2: 240 },
      // Floor 2 (Conveyor)
      { x1: 16, y1: 196, x2: 208, y2: 196 },
      // Floor 3 (Conveyor)
      { x1: 16, y1: 152, x2: 208, y2: 152 },
      // Floor 4 (Conveyor)
      { x1: 16, y1: 108, x2: 208, y2: 108 },
      // Floor 5 (Top DK Platform)
      { x1: 120, y1: 68, x2: 220, y2: 68 },
      // Pauline perch
      { x1: 80, y1: 34, x2: 120, y2: 34 },
    ];

    this.ladders = [
      { x: 30, topY: 196, bottomY: 240 },
      { x: 190, topY: 196, bottomY: 240 },
      // Middle telescoping ladders
      { x: 112, topY: 152, bottomY: 196 },
      { x: 30, topY: 108, bottomY: 152 },
      { x: 190, topY: 108, bottomY: 152 },
      { x: 130, topY: 68, bottomY: 108 },
      { x: 88, topY: 34, bottomY: 68 },
      { x: 108, topY: 34, bottomY: 68 },
    ];

    this.hammers = [
      { id: 1, x: 26, y: 140, collected: false },
      { id: 2, x: 194, y: 140, collected: false },
    ];

    this.bonusItems = [
      { type: 'purse', x: 112, y: 184, points: 300, collected: false },
      { type: 'umbrella', x: 26, y: 96, points: 500, collected: false },
      { type: 'hat', x: 190, y: 96, points: 800, collected: false },
    ];

    // Spawn 2 initial fireballs
    this.fireballs = [
      { id: 1, x: 50, y: 196, vx: 0.6, vy: 0, onLadder: false, color: '#f97316', animFrame: 0 },
      { id: 2, x: 160, y: 152, vx: -0.6, vy: 0, onLadder: false, color: '#38bdf8', animFrame: 0 }
    ];
  }

  /**
   * LEVEL 3 (75m): Elevators & Springs
   */
  private setupStage75m() {
    this.px = 16;
    this.py = 236;
    this.facing = 'right';
    this.dkX = 140;
    this.dkY = 56;
    this.paulineX = 26;
    this.paulineY = 24;

    this.platforms = [
      // Bottom floor
      { x1: 0, y1: 240, x2: 224, y2: 240 },
      // Left side mid-low platform
      { x1: 0, y1: 184, x2: 64, y2: 184 },
      // Left side mid-high platform
      { x1: 0, y1: 126, x2: 64, y2: 126 },
      // Pauline perch top left
      { x1: 16, y1: 34, x2: 74, y2: 34 },
      // Right side mid-platforms
      { x1: 140, y1: 184, x2: 224, y2: 184 },
      { x1: 140, y1: 126, x2: 224, y2: 126 },
      // Top DK catwalk
      { x1: 120, y1: 68, x2: 224, y2: 68 },
    ];

    this.ladders = [
      { x: 30, topY: 184, bottomY: 240 },
      { x: 190, topY: 184, bottomY: 240 },
      { x: 190, topY: 126, bottomY: 184 },
      { x: 30, topY: 34, bottomY: 126 },
      { x: 160, topY: 68, bottomY: 126 },
    ];

    // 2 Elevator shafts
    // Shaft 1 (going up) around x = 80
    // Shaft 2 (going down) around x = 120
    this.elevators = [
      { id: 1, x: 74, y: 220, dir: -1, minY: 64, maxY: 236 },
      { id: 2, x: 74, y: 134, dir: -1, minY: 64, maxY: 236 },
      { id: 3, x: 114, y: 80, dir: 1, minY: 64, maxY: 236 },
      { id: 4, x: 114, y: 166, dir: 1, minY: 64, maxY: 236 },
    ];

    this.hammers = [
      { id: 1, x: 16, y: 172, collected: false },
      { id: 2, x: 200, y: 114, collected: false },
    ];

    this.bonusItems = [
      { type: 'purse', x: 200, y: 172, points: 300, collected: false },
      { type: 'hat', x: 16, y: 114, points: 500, collected: false },
      { type: 'umbrella', x: 160, y: 56, points: 800, collected: false },
    ];

    this.fireballs = [
      { id: 1, x: 160, y: 184, vx: 0.5, vy: 0, onLadder: false, color: '#fb923c', animFrame: 0 },
      { id: 2, x: 30, y: 126, vx: -0.5, vy: 0, onLadder: false, color: '#38bdf8', animFrame: 0 }
    ];
  }

  /**
   * LEVEL 4 (100m): Rivet Removal & Donkey Kong Defeat
   */
  private setupStage100m() {
    this.px = 30;
    this.py = 236;
    this.facing = 'right';
    this.dkX = 96;
    this.dkY = 64;
    this.dkFallY = 64;
    this.paulineX = 96;
    this.paulineY = 24;
    this.paulineState = 'help';

    // 5 wide girder platforms
    this.platforms = [
      { x1: 16, y1: 240, x2: 208, y2: 240 },
      { x1: 16, y1: 196, x2: 208, y2: 196 },
      { x1: 16, y1: 152, x2: 208, y2: 152 },
      { x1: 16, y1: 108, x2: 208, y2: 108 },
      { x1: 16, y1: 64, x2: 208, y2: 64 },
      // Pauline high beam
      { x1: 84, y1: 34, x2: 140, y2: 34 },
    ];

    this.ladders = [
      // Left side ladders
      { x: 36, topY: 196, bottomY: 240 },
      { x: 36, topY: 152, bottomY: 196 },
      { x: 36, topY: 108, bottomY: 152 },
      { x: 36, topY: 64, bottomY: 108 },
      // Right side ladders
      { x: 188, topY: 196, bottomY: 240 },
      { x: 188, topY: 152, bottomY: 196 },
      { x: 188, topY: 108, bottomY: 152 },
      { x: 188, topY: 64, bottomY: 108 },
      // Central top ladders to Pauline
      { x: 92, topY: 34, bottomY: 64 },
      { x: 132, topY: 34, bottomY: 64 },
    ];

    // 8 Yellow Rivets (Plugs)
    this.rivets = [
      // Floor 2 (y = 196)
      { id: 1, x: 76, y: 196, removed: false, platformIndex: 1 },
      { id: 2, x: 148, y: 196, removed: false, platformIndex: 1 },
      // Floor 3 (y = 152)
      { id: 3, x: 76, y: 152, removed: false, platformIndex: 2 },
      { id: 4, x: 148, y: 152, removed: false, platformIndex: 2 },
      // Floor 4 (y = 108)
      { id: 5, x: 76, y: 108, removed: false, platformIndex: 3 },
      { id: 6, x: 148, y: 108, removed: false, platformIndex: 3 },
      // Floor 5 (y = 64)
      { id: 7, x: 76, y: 64, removed: false, platformIndex: 4 },
      { id: 8, x: 148, y: 64, removed: false, platformIndex: 4 },
    ];

    this.hammers = [
      { id: 1, x: 24, y: 140, collected: false },
      { id: 2, x: 196, y: 140, collected: false },
    ];

    this.bonusItems = [
      { type: 'hat', x: 24, y: 184, points: 300, collected: false },
      { type: 'purse', x: 196, y: 184, points: 500, collected: false },
      { type: 'umbrella', x: 112, y: 96, points: 800, collected: false },
    ];

    // Spawn 2 initial fire sparks
    this.fireballs = [
      { id: 1, x: 50, y: 152, vx: 0.6, vy: 0, onLadder: false, color: '#fb923c', animFrame: 0 },
      { id: 2, x: 170, y: 108, vx: -0.6, vy: 0, onLadder: false, color: '#38bdf8', animFrame: 0 }
    ];
  }

  /**
   * Main Physics and Game Step (60 FPS)
   */
  public update(keys: { left: boolean; right: boolean; up: boolean; down: boolean; jump: boolean; hammer: boolean }) {
    this.gameTimer++;

    // 1. "HOW HIGH CAN YOU GET?" Intro screen timer
    if (this.gameState === 'how_high_screen') {
      this.stateTimer--;
      if (this.stateTimer <= 0) {
        this.gameState = 'playing';
      }
      return;
    }

    // 2. Level clear cutscene (e.g. Donkey Kong falling on 100m, or Mario reaching Pauline)
    if (this.gameState === 'level_clear') {
      this.stateTimer++;
      this.heartAnimFrame = Math.floor(this.gameTimer / 8) % 2;

      // Donkey Kong falling animation on 100m
      if (this.stage === '100m') {
        if (this.dkFallY < 210) {
          this.dkFallY += 2.5;
        }
      }

      // Bonus points countdown
      if (this.bonusTimer > 0) {
        const dec = Math.min(this.bonusTimer, 100);
        this.bonusTimer -= dec;
        this.score += dec;
      }

      if (this.stateTimer > 200) {
        this.nextStage();
      }
      return;
    }

    // 3. Mario death animation
    if (this.gameState === 'mario_dead') {
      this.deathTimer++;
      if (this.deathTimer > 120) {
        this.lives--;
        if (this.lives <= 0) {
          this.gameState = 'game_over';
          if (this.onGameOver) this.onGameOver(this.score);
        } else {
          this.initStage(this.stage);
        }
      }
      return;
    }

    if (this.gameState === 'game_over') {
      return;
    }

    // --- PLAYING STATE ---

    // Bonus Timer Countdown
    this.bonusTickTimer++;
    if (this.bonusTickTimer >= 60) {
      this.bonusTickTimer = 0;
      if (this.bonusTimer > 0) {
        this.bonusTimer = Math.max(0, this.bonusTimer - 100);
      } else {
        // Bonus timer expired -> Mario dies
        this.killMario();
        return;
      }
    }

    // Hammer timer decrement
    if (this.isHammerActive) {
      this.hammerTimer--;
      this.hammerPhase = Math.floor(this.gameTimer / 6) % 2 === 0 ? 'up' : 'down';
      if (this.hammerTimer <= 0) {
        this.isHammerActive = false;
        donkeyKongAudio.stopHammerMusic();
      }
    }

    // Update Mario
    this.updateMario(keys);

    // Update Donkey Kong
    this.updateDonkeyKong();

    // Stage Specific Entity Updates
    if (this.stage === '25m') {
      this.updateBarrels();
    } else if (this.stage === '50m') {
      this.updateCementPies();
    } else if (this.stage === '75m') {
      this.updateElevators();
      this.updateSprings();
    }

    // Update Fireballs & Oil drum
    this.updateFireballs();

    // Check Collisions
    this.checkCollisions();

    // Update score popups
    this.scorePopups = this.scorePopups.filter(p => {
      p.timer--;
      p.y -= 0.3;
      return p.timer > 0;
    });

    if (this.invulnerableTimer > 0) {
      this.invulnerableTimer--;
    }
  }

  private updateMario(keys: { left: boolean; right: boolean; up: boolean; down: boolean; jump: boolean; hammer: boolean }) {
    const moveSpeed = 1.25;
    const gravity = 0.32;
    const jumpPower = -4.8;

    // Check if on ladder
    const ladderUnderneath = this.findLadderNear(this.px, this.py);

    if (this.isClimbing) {
      this.pvx = 0;
      this.pvy = 0;

      if (keys.up) {
        this.py -= 0.9;
        this.animFrame++;
        if (this.animFrame % 6 === 0) donkeyKongAudio.playClimb(this.animFrame);
      } else if (keys.down) {
        this.py += 0.9;
        this.animFrame++;
        if (this.animFrame % 6 === 0) donkeyKongAudio.playClimb(this.animFrame);
      }

      // Check ladder exit top or bottom
      if (this.climbingLadder) {
        if (this.py <= this.climbingLadder.topY - 2) {
          this.py = this.climbingLadder.topY;
          this.isClimbing = false;
          this.isGrounded = true;
          this.climbingLadder = null;
        } else if (this.py >= this.climbingLadder.bottomY) {
          this.py = this.climbingLadder.bottomY;
          this.isClimbing = false;
          this.isGrounded = true;
          this.climbingLadder = null;
        }
      }
      return;
    }

    // Enter ladder
    if (ladderUnderneath && !this.isHammerActive) {
      if (keys.up && this.py > ladderUnderneath.topY + 2) {
        this.isClimbing = true;
        this.climbingLadder = ladderUnderneath;
        this.px = ladderUnderneath.x;
        this.pvx = 0;
        this.pvy = 0;
        return;
      } else if (keys.down && this.py < ladderUnderneath.bottomY - 4) {
        this.isClimbing = true;
        this.climbingLadder = ladderUnderneath;
        this.px = ladderUnderneath.x;
        this.pvx = 0;
        this.pvy = 0;
        return;
      }
    }

    // Horizontal Movement
    if (keys.left) {
      this.pvx = -moveSpeed;
      this.facing = 'left';
      this.animFrame++;
      if (this.isGrounded && this.animFrame % 8 === 0) {
        donkeyKongAudio.playWalk(this.animFrame);
      }
    } else if (keys.right) {
      this.pvx = moveSpeed;
      this.facing = 'right';
      this.animFrame++;
      if (this.isGrounded && this.animFrame % 8 === 0) {
        donkeyKongAudio.playWalk(this.animFrame);
      }
    } else {
      this.pvx = 0;
    }

    // Conveyor speed influence on 50m stage
    if (this.stage === '50m' && this.isGrounded) {
      const platIdx = this.getPlatformIndexAt(this.px, this.py);
      if (platIdx === 1 || platIdx === 3) {
        this.px += 0.4; // conveyor moves right
      } else if (platIdx === 2) {
        this.px -= 0.4; // conveyor moves left
      }
    }

    // Jumping
    if (keys.jump && this.isGrounded && !this.isHammerActive) {
      this.pvy = jumpPower;
      this.isGrounded = false;
      this.isJumping = true;
      donkeyKongAudio.playJump();
    }

    // Apply Gravity
    if (!this.isGrounded) {
      this.pvy += gravity;
      if (this.pvy > 6) this.pvy = 6;
    }

    // Move X
    this.px += this.pvx;
    if (this.px < 8) this.px = 8;
    if (this.px > VIRTUAL_WIDTH - 8) this.px = VIRTUAL_WIDTH - 8;

    // Move Y & Floor Collision
    this.py += this.pvy;

    const floor = this.getFloorHeightAt(this.px, this.py);
    if (floor !== null && this.py >= floor - 1 && this.py <= floor + 6 && this.pvy >= 0) {
      this.py = floor;
      this.pvy = 0;
      this.isGrounded = true;
      this.isJumping = false;
    } else if (floor !== null && this.py < floor - 1) {
      this.isGrounded = false;
    }

    // Fall death below screen
    if (this.py > VIRTUAL_HEIGHT + 16) {
      this.killMario();
    }

    // Goal Reach check on 25m, 50m, 75m
    if (this.stage !== '100m') {
      const distToPauline = Math.hypot(this.px - this.paulineX, this.py - this.paulineY);
      if (distToPauline < 24) {
        this.completeLevel();
      }
    }
  }

  private updateDonkeyKong() {
    this.dkAnimFrame = Math.floor(this.gameTimer / 12) % 4;

    if (this.stage === '25m') {
      this.barrelThrowCooldown--;
      if (this.barrelThrowCooldown <= 0) {
        this.spawnBarrel();
        this.barrelThrowCooldown = Math.max(90, 160 - this.levelCycle * 15);
      }
    } else if (this.stage === '75m') {
      this.barrelThrowCooldown--;
      if (this.barrelThrowCooldown <= 0) {
        this.spawnSpring();
        this.barrelThrowCooldown = Math.max(100, 180 - this.levelCycle * 20);
      }
    }
  }

  private spawnBarrel() {
    const isWild = Math.random() < 0.15;
    const barrel: Barrel = {
      id: this.nextId++,
      x: 74,
      y: 64,
      vx: 1.2,
      vy: 0,
      state: 'rolling',
      rollingDir: 1,
      isBlue: isWild,
      animFrame: 0
    };
    this.barrels.push(barrel);
    donkeyKongAudio.playBarrelRoll();
  }

  private spawnSpring() {
    const spring: Spring = {
      id: this.nextId++,
      x: this.dkX + 16,
      y: this.dkY + 12,
      vx: 1.4,
      vy: 0,
      bouncePhase: 0
    };
    this.springs.push(spring);
  }

  private updateBarrels() {
    for (let i = this.barrels.length - 1; i >= 0; i--) {
      const b = this.barrels[i];
      b.animFrame++;

      // Physics for rolling barrel
      const floor = this.getFloorHeightAt(b.x, b.y);

      if (b.state === 'rolling') {
        b.x += b.rollingDir * 1.3;

        // Follow girder slope
        if (floor !== null) {
          b.y = floor;
        }

        // Check if barrel reached the end of platform and needs to drop
        if (b.rollingDir === 1 && b.x > 214) {
          b.rollingDir = -1;
          b.state = 'dropping';
          b.vy = 2.0;
        } else if (b.rollingDir === -1 && b.x < 14) {
          b.rollingDir = 1;
          b.state = 'dropping';
          b.vy = 2.0;
        }

        // Random chance to fall down ladder
        const ladder = this.findLadderNear(b.x, b.y);
        if (ladder && !ladder.broken && Math.random() < 0.015 && b.y < 210) {
          b.state = 'falling';
          b.x = ladder.x;
          b.vy = 2.2;
        }
      } else {
        // Dropping / Falling
        b.y += b.vy;
        if (floor !== null && b.y >= floor) {
          b.y = floor;
          b.state = 'rolling';
          b.vy = 0;
        }
      }

      // Check collision with Oil Drum at bottom left
      if (b.x <= 28 && b.y >= 230) {
        this.oilDrum.flaming = true;
        // Spawn fireball from oil drum
        if (this.fireballs.length < 4 && Math.random() < 0.6) {
          this.fireballs.push({
            id: this.nextId++,
            x: 24,
            y: 226,
            vx: 0.6,
            vy: 0,
            onLadder: false,
            color: b.isBlue ? '#38bdf8' : '#f97316',
            animFrame: 0
          });
        }
        this.barrels.splice(i, 1);
        continue;
      }

      // Despawn off bottom screen
      if (b.y > VIRTUAL_HEIGHT + 20) {
        this.barrels.splice(i, 1);
      }
    }
  }

  private updateCementPies() {
    // Spawn cement pies periodically on 50m
    if (this.gameTimer % 140 === 0 && this.cementPies.length < 5) {
      this.cementPies.push({
        id: this.nextId++,
        x: 190,
        y: 68,
        vx: -0.9,
        platformIndex: 4
      });
    }

    for (let i = this.cementPies.length - 1; i >= 0; i--) {
      const p = this.cementPies[i];
      p.x += p.vx;

      // Fall to lower conveyor
      if (p.vx < 0 && p.x < 24) {
        p.y += 44;
        p.vx = 0.9;
      } else if (p.vx > 0 && p.x > 200) {
        p.y += 44;
        p.vx = -0.9;
      }

      if (p.y > 242) {
        this.cementPies.splice(i, 1);
      }
    }
  }

  private updateElevators() {
    for (const e of this.elevators) {
      e.y += e.dir * 0.8;
      if (e.dir === -1 && e.y < e.minY) {
        e.y = e.maxY;
      } else if (e.dir === 1 && e.y > e.maxY) {
        e.y = e.minY;
      }

      // If Mario is standing on this elevator, move him with it
      if (
        this.isGrounded &&
        Math.abs(this.px - e.x) < 14 &&
        Math.abs(this.py - e.y) < 5
      ) {
        this.py = e.y;
        // If elevator reaches top/bottom extremes, Mario falls off
        if (e.y <= e.minY + 2 || e.y >= e.maxY - 2) {
          this.isGrounded = false;
        }
      }
    }
  }

  private updateSprings() {
    for (let i = this.springs.length - 1; i >= 0; i--) {
      const s = this.springs[i];
      s.x += s.vx;
      s.bouncePhase += 0.15;
      s.y = 68 - Math.abs(Math.sin(s.bouncePhase)) * 20;

      // Drop down at edge of catwalk
      if (s.x > 210) {
        s.vx = 0;
        s.y += 3.5;
      }

      if (s.y > VIRTUAL_HEIGHT + 20) {
        this.springs.splice(i, 1);
      }
    }
  }

  private updateFireballs() {
    for (const f of this.fireballs) {
      f.animFrame++;

      // Move horizontally
      f.x += f.vx;
      const floor = this.getFloorHeightAt(f.x, f.y);
      if (floor !== null) {
        f.y = floor;
      }

      if (f.x < 16) {
        f.x = 16;
        f.vx = Math.abs(f.vx);
      } else if (f.x > VIRTUAL_WIDTH - 16) {
        f.x = VIRTUAL_WIDTH - 16;
        f.vx = -Math.abs(f.vx);
      }

      // Random direction change
      if (Math.random() < 0.01) {
        f.vx = -f.vx;
      }
    }
  }

  private checkCollisions() {
    if (this.invulnerableTimer > 0) return;

    // 1. Hammer pickups
    for (const h of this.hammers) {
      if (!h.collected && Math.hypot(this.px - h.x, this.py - h.y) < 14) {
        h.collected = true;
        this.isHammerActive = true;
        this.hammerTimer = 550; // ~9 seconds
        donkeyKongAudio.startHammerMusic();
        this.addScore(500, h.x, h.y, '#eab308');
      }
    }

    // 2. Bonus Items (Umbrella, Purse, Hat)
    for (const item of this.bonusItems) {
      if (!item.collected && Math.hypot(this.px - item.x, this.py - item.y) < 12) {
        item.collected = true;
        this.addScore(item.points, item.x, item.y, '#f43f5e');
        donkeyKongAudio.playItemCollect();
      }
    }

    // 3. Rivets on 100m stage
    if (this.stage === '100m') {
      for (const r of this.rivets) {
        if (!r.removed && Math.hypot(this.px - r.x, this.py - r.y) < 8) {
          r.removed = true;
          this.addScore(100, r.x, r.y, '#eab308');
          donkeyKongAudio.playRivetPop();

          // Check if all 8 rivets are removed!
          const allRemoved = this.rivets.every(rv => rv.removed);
          if (allRemoved) {
            this.triggerDonkeyKongDefeat();
            return;
          }
        }
      }
    }

    // 4. Barrel Collisions (25m)
    for (let i = this.barrels.length - 1; i >= 0; i--) {
      const b = this.barrels[i];
      const dist = Math.hypot(this.px - b.x, this.py - b.y);

      // Smashed with hammer
      if (this.isHammerActive && dist < 22) {
        this.barrels.splice(i, 1);
        this.addScore(500, b.x, b.y, '#22c55e');
        donkeyKongAudio.playHammerSmash();
        continue;
      }

      // Jump over barrel bonus
      if (
        this.isJumping &&
        Math.abs(this.px - b.x) < 10 &&
        this.py < b.y &&
        b.y - this.py < 24
      ) {
        this.addScore(100, b.x, b.y - 12, '#38bdf8');
        donkeyKongAudio.playJumpScore();
      }

      // Deadly collision
      if (dist < 10 && !this.isHammerActive) {
        this.killMario();
        return;
      }
    }

    // 5. Fireball Collisions
    for (let i = this.fireballs.length - 1; i >= 0; i--) {
      const f = this.fireballs[i];
      const dist = Math.hypot(this.px - f.x, this.py - f.y);

      if (this.isHammerActive && dist < 22) {
        this.fireballs.splice(i, 1);
        this.addScore(800, f.x, f.y, '#22c55e');
        donkeyKongAudio.playHammerSmash();
        continue;
      }

      if (dist < 10 && !this.isHammerActive) {
        this.killMario();
        return;
      }
    }

    // 6. Cement Pie Collisions (50m)
    for (let i = this.cementPies.length - 1; i >= 0; i--) {
      const p = this.cementPies[i];
      const dist = Math.hypot(this.px - p.x, this.py - p.y);

      if (this.isHammerActive && dist < 22) {
        this.cementPies.splice(i, 1);
        this.addScore(300, p.x, p.y, '#22c55e');
        donkeyKongAudio.playHammerSmash();
        continue;
      }

      if (dist < 10 && !this.isHammerActive) {
        this.killMario();
        return;
      }
    }

    // 7. Spring Collisions (75m)
    for (const s of this.springs) {
      if (Math.hypot(this.px - s.x, this.py - s.y) < 10 && !this.isHammerActive) {
        this.killMario();
        return;
      }
    }
  }

  private triggerDonkeyKongDefeat() {
    this.gameState = 'level_clear';
    this.stateTimer = 0;
    this.dkAction = 'defeat_fall';
    this.paulineState = 'heart';
    donkeyKongAudio.playDonkeyFall();
    donkeyKongAudio.playLevelClear();
  }

  private completeLevel() {
    this.gameState = 'level_clear';
    this.stateTimer = 0;
    this.paulineState = 'heart';
    donkeyKongAudio.playLevelClear();
  }

  private nextStage() {
    if (this.stage === '25m') {
      this.initStage('50m');
    } else if (this.stage === '50m') {
      this.initStage('75m');
    } else if (this.stage === '75m') {
      this.initStage('100m');
    } else {
      // Completed all 4 levels -> increment cycle and start at 25m again
      this.levelCycle++;
      this.initStage('25m');
    }
  }

  private killMario() {
    if (this.gameState === 'mario_dead' || this.gameState === 'game_over') return;
    this.gameState = 'mario_dead';
    this.deathTimer = 0;
    this.isHammerActive = false;
    donkeyKongAudio.stopHammerMusic();
    donkeyKongAudio.playDeath();
  }

  public addScore(points: number, x: number, y: number, color: string = '#ffffff') {
    this.score += points;
    this.scorePopups.push({
      x,
      y,
      text: `${points}`,
      timer: 45,
      color
    });
  }

  public getFloorHeightAt(x: number, y: number): number | null {
    let closestFloor: number | null = null;
    let minDiff = 999;

    for (const p of this.platforms) {
      if (x >= Math.min(p.x1, p.x2) - 2 && x <= Math.max(p.x1, p.x2) + 2) {
        const ratio = (x - p.x1) / (p.x2 - p.x1 || 1);
        const floorY = p.y1 + ratio * (p.y2 - p.y1);

        const diff = floorY - y;
        if (diff >= -4 && diff < minDiff && diff <= 16) {
          minDiff = diff;
          closestFloor = floorY;
        }
      }
    }

    return closestFloor;
  }

  public getPlatformIndexAt(x: number, y: number): number {
    for (let i = 0; i < this.platforms.length; i++) {
      const p = this.platforms[i];
      if (x >= Math.min(p.x1, p.x2) && x <= Math.max(p.x1, p.x2)) {
        if (Math.abs(y - p.y1) < 8) return i;
      }
    }
    return 0;
  }

  private findLadderNear(x: number, y: number): Ladder | null {
    for (const ladder of this.ladders) {
      if (Math.abs(x - ladder.x) < 8 && y >= ladder.topY - 4 && y <= ladder.bottomY + 4) {
        return ladder;
      }
    }
    return null;
  }
}
