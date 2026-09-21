/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Double Dragon (1987 / Technos Japan) - 2.5D Belt-Scrolling Beat 'em Up Game Engine
 */

import { doubleDragonAudio } from './doubleDragonAudio';
import { saveDoubleDragonScore } from './doubleDragonHighScores';

export type DDAction = 'idle' | 'walk' | 'punch1' | 'punch2' | 'uppercut' | 'kick' | 'jump' | 'jump_kick' | 'elbow' | 'throw_barrel' | 'hurt' | 'knockdown' | 'dead';
export type EnemyType = 'williams' | 'roper' | 'linda' | 'abobo';

export interface HitSpark {
  x: number;
  y: number;
  life: number;
  maxLife: number;
  type: 'spark' | 'smoke' | 'wood';
}

export interface Barrel {
  id: string;
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  isHeld: boolean;
  broken: boolean;
}

export interface Fighter {
  id: string;
  isPlayer: boolean;
  type?: EnemyType;
  x: number;
  y: number; // Ground depth (140 to 215)
  z: number; // Height above ground (>= 0)
  vz: number;
  facing: 1 | -1; // 1 = right, -1 = left
  action: DDAction;
  actionTimer: number;
  hp: number;
  maxHp: number;
  punchCombo: number; // 0, 1, 2
  invincibleTimer: number;
  heldBarrel: Barrel | null;
}

export class DoubleDragonEngine {
  public readonly viewWidth = 320;
  public readonly viewHeight = 224;

  public player!: Fighter;
  public enemies: Fighter[] = [];
  public barrels: Barrel[] = [];
  public hitSparks: HitSpark[] = [];

  public score: number = 0;
  public highScore: number = 48500;
  public lives: number = 3;
  public stage: number = 1;
  public timeLeft: number = 100;
  public thugsDefeated: number = 0;

  public state: 'INTRO' | 'PLAYING' | 'STAGE_CLEAR' | 'GAME_OVER' = 'PLAYING';
  public introTimer: number = 0;

  // Cheats / Trainer
  public godMode: boolean = false;
  public oneHitKO: boolean = false;

  private tickCount: number = 0;

  constructor() {
    this.initGame();
  }

  public initGame() {
    this.player = {
      id: 'billy',
      isPlayer: true,
      x: 60,
      y: 175,
      z: 0,
      vz: 0,
      facing: 1,
      action: 'idle',
      actionTimer: 0,
      hp: 6,
      maxHp: 6,
      punchCombo: 0,
      invincibleTimer: 0,
      heldBarrel: null
    };

    this.barrels = [
      { id: 'b1', x: 180, y: 160, z: 0, vx: 0, vy: 0, vz: 0, isHeld: false, broken: false },
      { id: 'b2', x: 260, y: 195, z: 0, vx: 0, vy: 0, vz: 0, isHeld: false, broken: false }
    ];

    this.enemies = [];
    this.hitSparks = [];
    this.score = 0;
    this.lives = 3;
    this.stage = 1;
    this.timeLeft = 100;
    this.thugsDefeated = 0;
    this.state = 'PLAYING';

    this.spawnWave();
    doubleDragonAudio.startStageBGM();
  }

  public spawnWave() {
    if (this.stage === 1) {
      this.enemies = [
        this.createEnemy('williams', 280, 160),
        this.createEnemy('roper', 310, 185)
      ];
    } else if (this.stage === 2) {
      this.enemies = [
        this.createEnemy('roper', 280, 150),
        this.createEnemy('linda', 310, 180),
        this.createEnemy('williams', 290, 205)
      ];
    } else {
      // Boss stage: Abobo!
      this.enemies = [
        this.createEnemy('abobo', 290, 175),
        this.createEnemy('williams', 310, 200)
      ];
    }
  }

  private createEnemy(type: EnemyType, x: number, y: number): Fighter {
    const hpMap: Record<EnemyType, number> = {
      williams: 4,
      roper: 5,
      linda: 5,
      abobo: 14
    };

    return {
      id: Math.random().toString(),
      isPlayer: false,
      type,
      x,
      y,
      z: 0,
      vz: 0,
      facing: -1,
      action: 'idle',
      actionTimer: 0,
      hp: hpMap[type],
      maxHp: hpMap[type],
      punchCombo: 0,
      invincibleTimer: 0,
      heldBarrel: null
    };
  }

  // Player Controls
  public movePlayer(dx: number, dy: number) {
    if (this.player.action === 'dead' || this.player.action === 'knockdown' || this.player.action === 'hurt') return;

    // Can only change position if not locked in an attack animation
    const isAttacking = ['punch1', 'punch2', 'uppercut', 'kick', 'elbow', 'throw_barrel'].includes(this.player.action);
    if (isAttacking) return;

    if (dx !== 0) {
      this.player.facing = dx > 0 ? 1 : -1;
      this.player.x = Math.max(20, Math.min(this.viewWidth - 20, this.player.x + dx * 2.2));
    }
    if (dy !== 0) {
      this.player.y = Math.max(140, Math.min(212, this.player.y + dy * 1.5));
    }

    if (this.player.z === 0) {
      this.player.action = dx !== 0 || dy !== 0 ? 'walk' : 'idle';
    }
  }

  public playerPunch() {
    if (this.isBusy(this.player)) return;

    // Check if player can pick up a barrel
    if (!this.player.heldBarrel) {
      const nearBarrel = this.barrels.find(b => !b.broken && !b.isHeld && Math.abs(b.x - this.player.x) < 22 && Math.abs(b.y - this.player.y) < 16);
      if (nearBarrel) {
        nearBarrel.isHeld = true;
        this.player.heldBarrel = nearBarrel;
        this.player.action = 'idle';
        doubleDragonAudio.playPunchWhoosh();
        return;
      }
    } else {
      // Throw held barrel!
      this.throwHeldBarrel(this.player);
      return;
    }

    doubleDragonAudio.playPunchWhoosh();

    if (this.player.punchCombo === 0) {
      this.player.action = 'punch1';
      this.player.actionTimer = 10;
      this.player.punchCombo = 1;
      this.checkPlayerHit(1, false);
    } else if (this.player.punchCombo === 1) {
      this.player.action = 'punch2';
      this.player.actionTimer = 10;
      this.player.punchCombo = 2;
      this.checkPlayerHit(1.5, false);
    } else {
      this.player.action = 'uppercut';
      this.player.actionTimer = 14;
      this.player.punchCombo = 0;
      this.checkPlayerHit(2.5, true);
    }
  }

  public playerKick() {
    if (this.isBusy(this.player)) return;

    if (this.player.heldBarrel) {
      this.throwHeldBarrel(this.player);
      return;
    }

    doubleDragonAudio.playPunchWhoosh();
    this.player.action = 'kick';
    this.player.actionTimer = 14;
    this.player.punchCombo = 0;
    this.checkPlayerHit(2, true);
  }

  public playerElbow() {
    if (this.isBusy(this.player)) return;

    if (this.player.heldBarrel) {
      this.throwHeldBarrel(this.player);
      return;
    }

    // Iconic Double Dragon Rear Elbow Smash: hits enemies in opposite direction!
    doubleDragonAudio.playElbowSmash();
    this.player.action = 'elbow';
    this.player.actionTimer = 16;
    this.player.punchCombo = 0;

    // Check hit behind the player!
    const hitFacing = -this.player.facing as 1 | -1;
    this.checkPlayerHit(4, true, hitFacing);
  }

  public playerJump() {
    if (this.player.z > 0 || this.isBusy(this.player)) return;

    this.player.z = 1;
    this.player.vz = 5.8;
    this.player.action = 'jump';
    doubleDragonAudio.playJumpKick();
  }

  public playerJumpKick() {
    if (this.player.z <= 0 || this.player.action === 'jump_kick') return;

    this.player.action = 'jump_kick';
    doubleDragonAudio.playJumpKick();
    this.checkPlayerHit(3, true);
  }

  private throwHeldBarrel(f: Fighter) {
    if (!f.heldBarrel) return;
    const b = f.heldBarrel;
    f.heldBarrel = null;
    f.action = 'throw_barrel';
    f.actionTimer = 12;

    b.isHeld = false;
    b.x = f.x + f.facing * 18;
    b.y = f.y;
    b.z = 16;
    b.vx = f.facing * 6;
    b.vz = 2;
    doubleDragonAudio.playPunchWhoosh();
  }

  private isBusy(f: Fighter): boolean {
    return ['punch1', 'punch2', 'uppercut', 'kick', 'elbow', 'throw_barrel', 'hurt', 'knockdown', 'dead'].includes(f.action);
  }

  private checkPlayerHit(damage: number, causesKnockdown: boolean, customFacing?: 1 | -1) {
    const attackDir = customFacing !== undefined ? customFacing : this.player.facing;
    const hitDistX = 32;
    const hitDistY = 16;

    this.enemies.forEach(en => {
      if (en.action === 'dead' || en.action === 'knockdown') return;

      const dx = en.x - this.player.x;
      const dy = Math.abs(en.y - this.player.y);

      // Check depth alignment and horizontal reach
      const isFacingTarget = attackDir > 0 ? dx > 0 && dx < hitDistX : dx < 0 && dx > -hitDistX;

      if (isFacingTarget && dy < hitDistY) {
        // Hit connected!
        const finalDamage = this.oneHitKO ? 99 : damage;
        en.hp -= finalDamage;

        // Hit spark animation
        this.addHitSpark(en.x, en.y - 20, 'spark');

        if (en.hp <= 0 || causesKnockdown) {
          en.action = 'knockdown';
          en.actionTimer = 35;
          en.vz = 3.5;
          en.z = 1;
          doubleDragonAudio.playKnockdown();
        } else {
          en.action = 'hurt';
          en.actionTimer = 12;
          en.x += attackDir * 8; // Knockback push
          doubleDragonAudio.playPunchImpact();
        }

        // Score awarded
        this.score += causesKnockdown ? 200 : 100;
        if (this.score > this.highScore) {
          this.highScore = this.score;
        }

        if (en.hp <= 0) {
          this.thugsDefeated++;
        }
      }
    });
  }

  public update(): void {
    this.tickCount++;

    // 1-second timer tick (~60 frames)
    if (this.tickCount % 60 === 0 && this.state === 'PLAYING') {
      this.timeLeft = Math.max(0, this.timeLeft - 1);
      if (this.timeLeft === 0 && !this.godMode) {
        this.playerKilled();
      }
    }

    if (this.state !== 'PLAYING') return;

    // Update Player
    this.updateFighter(this.player);

    // Update Barrels
    this.updateBarrels();

    // Update Enemies & AI
    this.enemies.forEach(en => {
      this.updateFighter(en);
      this.updateEnemyAI(en);
    });

    // Clean up dead enemies or advance wave
    this.cleanUpEnemies();

    // Update hit sparks
    for (let i = this.hitSparks.length - 1; i >= 0; i--) {
      this.hitSparks[i].life--;
      if (this.hitSparks[i].life <= 0) {
        this.hitSparks.splice(i, 1);
      }
    }
  }

  private updateFighter(f: Fighter) {
    // Jump / Gravity Physics
    if (f.z > 0 || f.vz !== 0) {
      f.z += f.vz;
      f.vz -= 0.45; // Gravity
      if (f.z <= 0) {
        f.z = 0;
        f.vz = 0;
        if (f.action === 'jump' || f.action === 'jump_kick') {
          f.action = 'idle';
        }
      }
    }

    // Action timer countdown
    if (f.actionTimer > 0) {
      f.actionTimer--;
      if (f.actionTimer === 0) {
        if (f.action === 'knockdown') {
          if (f.hp <= 0) {
            f.action = 'dead';
          } else {
            f.action = 'idle';
          }
        } else if (f.action === 'dead') {
          // Stay dead
        } else {
          f.action = 'idle';
        }
      }
    }

    // Invincibility flashing timer
    if (f.invincibleTimer > 0) {
      f.invincibleTimer--;
    }
  }

  private updateBarrels() {
    this.barrels.forEach(b => {
      if (b.broken) return;

      if (b.isHeld && this.player.heldBarrel === b) {
        b.x = this.player.x + this.player.facing * 8;
        b.y = this.player.y;
        b.z = 24;
        return;
      }

      // Flying barrel in air
      if (b.vx !== 0 || b.vz !== 0 || b.z > 0) {
        b.x += b.vx;
        b.z += b.vz;
        b.vz -= 0.4;

        // Collision with floor
        if (b.z <= 0) {
          b.z = 0;
          b.broken = true;
          doubleDragonAudio.playBarrelSmash();
          this.addHitSpark(b.x, b.y, 'wood');

          // Damage any nearby enemy
          this.enemies.forEach(en => {
            if (Math.abs(en.x - b.x) < 26 && Math.abs(en.y - b.y) < 20) {
              en.hp -= 4;
              en.action = 'knockdown';
              en.actionTimer = 35;
              en.vz = 3;
              this.score += 400;
            }
          });
        }

        // Collision with screen walls
        if (b.x < 10 || b.x > this.viewWidth - 10) {
          b.broken = true;
          doubleDragonAudio.playBarrelSmash();
          this.addHitSpark(b.x, b.y, 'wood');
        }
      }
    });
  }

  private updateEnemyAI(en: Fighter) {
    if (en.action === 'dead' || en.action === 'knockdown' || en.action === 'hurt') return;

    const dx = this.player.x - en.x;
    const dy = this.player.y - en.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    en.facing = dx > 0 ? 1 : -1;

    // Movement toward player with slight depth variation
    const speed = en.type === 'abobo' ? 0.9 : 1.3;

    if (dist > 36) {
      en.action = 'walk';
      en.x += Math.sign(dx) * speed;
      en.y += Math.sign(dy) * (speed * 0.7);
    } else {
      // In strike range! Attack periodically
      if (Math.random() < 0.04 && en.actionTimer === 0) {
        en.action = 'punch1';
        en.actionTimer = 16;
        doubleDragonAudio.playPunchWhoosh();

        // Check if hit connects on player
        if (Math.abs(dy) < 14 && Math.abs(dx) < 32 && !this.godMode && this.player.invincibleTimer === 0) {
          const dmg = en.type === 'abobo' ? 2 : 1;
          this.player.hp -= dmg;
          this.player.action = 'hurt';
          this.player.actionTimer = 14;
          this.player.invincibleTimer = 40;
          this.player.x += en.facing * 10;
          doubleDragonAudio.playPunchImpact();

          if (this.player.hp <= 0) {
            this.playerKilled();
          }
        }
      } else {
        en.action = 'idle';
      }
    }
  }

  private playerKilled() {
    this.player.action = 'knockdown';
    this.player.actionTimer = 45;
    this.player.vz = 4;
    doubleDragonAudio.playKnockdown();

    this.lives--;
    if (this.lives <= 0) {
      this.state = 'GAME_OVER';
      doubleDragonAudio.stopBGM();
      saveDoubleDragonScore({
        initials: 'BLY',
        score: this.score,
        stage: this.stage,
        thugsKO: this.thugsDefeated,
        date: new Date().toISOString().split('T')[0]
      });
    } else {
      // Respawn player
      setTimeout(() => {
        this.player.hp = this.player.maxHp;
        this.player.action = 'idle';
        this.player.invincibleTimer = 80;
        this.player.x = 60;
      }, 1000);
    }
  }

  private cleanUpEnemies() {
    const aliveEnemies = this.enemies.filter(e => e.action !== 'dead');
    if (aliveEnemies.length === 0) {
      // Stage cleared! Advance to next stage
      this.stage++;
      this.timeLeft = 100;
      this.score += 2000;
      if (this.score > this.highScore) this.highScore = this.score;

      this.spawnWave();
    }
  }

  public addHitSpark(x: number, y: number, type: 'spark' | 'smoke' | 'wood') {
    this.hitSparks.push({
      x,
      y,
      life: 8,
      maxLife: 8,
      type
    });
  }
}
