/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Nintendo Game Boy (1991) Metroid II: Return of Samus Engine (DMG-ME-USA)
 * Recreates Samus Aran on Planet SR388 with Arm Cannon, Morph Ball, Missiles & Metroid Alpha Battles.
 */

import { GameBoyPaletteMode, GAME_BOY_PALETTES } from './gameBoyTypes';
import { gameBoyAudio } from './gameBoyAudio';

export interface MetroidEnemy {
  x: number;
  y: number;
  vx: number;
  vy: number;
  hp: number;
  maxHp: number;
  type: 'crawler' | 'metroid_alpha' | 'skree';
  alive: boolean;
}

export interface BeamShot {
  x: number;
  y: number;
  vx: number;
  vy: number;
  isMissile: boolean;
  life: number;
}

export class GameBoyMetroid2Engine {
  public palette: GameBoyPaletteMode = 'dmg';
  public state: 'TITLE' | 'PLAYING' | 'GAMEOVER' | 'VICTORY' = 'TITLE';
  public score: number = 0;
  public energy: number = 99;
  public maxEnergy: number = 99;
  public missiles: number = 30;
  public metroidsLeft: number = 39;

  // Samus Physics & State
  public x: number = 24;
  public y: number = 90;
  public vx: number = 0;
  public vy: number = 0;
  public facing: 'left' | 'right' = 'right';
  public isMorphBall: boolean = false;
  public isGrounded: boolean = true;
  public weaponMode: 'beam' | 'missile' = 'beam';

  // Camera scroll
  public cameraX: number = 0;

  // Entities
  public shots: BeamShot[] = [];
  public enemies: MetroidEnemy[] = [];
  private animTimer: number = 0;
  private keyState = { left: false, right: false, up: false, down: false, a: false, b: false };

  constructor() {
    this.initLevel();
  }

  public initLevel() {
    this.x = 24;
    this.y = 90;
    this.vx = 0;
    this.vy = 0;
    this.energy = 99;
    this.missiles = 30;
    this.metroidsLeft = 39;
    this.cameraX = 0;
    this.shots = [];
    this.isMorphBall = false;

    // Spawn initial enemies
    this.enemies = [
      { x: 120, y: 96, vx: -0.4, vy: 0, hp: 2, maxHp: 2, type: 'crawler', alive: true },
      { x: 220, y: 80, vx: 0, vy: 0.5, hp: 1, maxHp: 1, type: 'skree', alive: true },
      { x: 340, y: 60, vx: 0.8, vy: 0.4, hp: 10, maxHp: 10, type: 'metroid_alpha', alive: true },
      { x: 480, y: 96, vx: -0.4, vy: 0, hp: 2, maxHp: 2, type: 'crawler', alive: true },
      { x: 620, y: 50, vx: -0.9, vy: 0.5, hp: 12, maxHp: 12, type: 'metroid_alpha', alive: true }
    ];
  }

  public startGame() {
    this.state = 'PLAYING';
    this.initLevel();
    gameBoyAudio.startMetroid2BGM();
  }

  public setKey(key: 'left' | 'right' | 'up' | 'down' | 'a' | 'b' | 'select', pressed: boolean) {
    if (key === 'select' && pressed && this.state === 'PLAYING') {
      this.weaponMode = this.weaponMode === 'beam' ? 'missile' : 'beam';
      gameBoyAudio.playMetroidWeaponSwitch();
      return;
    }

    if (key in this.keyState) {
      this.keyState[key as 'left' | 'right' | 'up' | 'down' | 'a' | 'b'] = pressed;
    }

    if (this.state !== 'PLAYING') return;

    if (key === 'down' && pressed) {
      this.isMorphBall = !this.isMorphBall;
      gameBoyAudio.playMetroidMorph();
    } else if (key === 'up' && pressed && this.isMorphBall) {
      this.isMorphBall = false;
      gameBoyAudio.playMetroidMorph();
    }

    if (key === 'a' && pressed && this.isGrounded) {
      this.vy = -4.2;
      this.isGrounded = false;
      gameBoyAudio.playMetroidJump();
    }

    if (key === 'b' && pressed) {
      this.fireWeapon();
    }
  }

  private fireWeapon() {
    const isMissile = this.weaponMode === 'missile';
    if (isMissile && this.missiles <= 0) return;

    if (isMissile) this.missiles--;

    const dir = this.facing === 'right' ? 1 : -1;
    const shotY = this.isMorphBall ? this.y + 8 : this.y + 4;
    this.shots.push({
      x: this.x + (dir === 1 ? 12 : -4),
      y: shotY,
      vx: dir * (isMissile ? 4.5 : 5.0),
      vy: 0,
      isMissile,
      life: 0.6
    });

    if (isMissile) {
      gameBoyAudio.playMetroidMissile();
    } else {
      gameBoyAudio.playMetroidBeam();
    }
  }

  public update(dt: number) {
    if (this.state !== 'PLAYING') return;

    this.animTimer += dt;

    // Horizontal Movement
    const speed = this.isMorphBall ? 1.4 : 1.8;
    if (this.keyState.left) {
      this.vx = -speed;
      this.facing = 'left';
    } else if (this.keyState.right) {
      this.vx = speed;
      this.facing = 'right';
    } else {
      this.vx = 0;
    }

    this.x += this.vx;

    // Gravity
    this.vy += 9.8 * dt * 0.8;
    this.y += this.vy;

    // Ground Floor collision at y = 92
    const floorY = this.isMorphBall ? 98 : 92;
    if (this.y >= floorY) {
      this.y = floorY;
      this.vy = 0;
      this.isGrounded = true;
    }

    // Camera follow Samus
    this.cameraX = Math.max(0, this.x - 70);

    // Update Shots
    for (let i = this.shots.length - 1; i >= 0; i--) {
      const s = this.shots[i];
      s.x += s.vx;
      s.life -= dt;

      // Hit enemies
      for (const e of this.enemies) {
        if (e.alive && Math.abs(s.x - e.x) < 14 && Math.abs(s.y - e.y) < 14) {
          const dmg = s.isMissile ? 5 : 1;
          e.hp -= dmg;
          s.life = 0;
          gameBoyAudio.playMetroidHit();
          if (e.hp <= 0) {
            e.alive = false;
            if (e.type === 'metroid_alpha') {
              this.metroidsLeft--;
              this.score += 1000;
              gameBoyAudio.playMetroidKilled();
            } else {
              this.score += 150;
            }
          }
          break;
        }
      }

      if (s.life <= 0) {
        this.shots.splice(i, 1);
      }
    }

    // Update Enemies
    for (const e of this.enemies) {
      if (!e.alive) continue;

      if (e.type === 'crawler') {
        e.x += e.vx;
        if (e.x < 80 || e.x > 550) e.vx = -e.vx;
      } else if (e.type === 'metroid_alpha') {
        // Floating Sine Hover + Chase Samus
        e.x += Math.sin(this.animTimer * 2) * 0.8 + (this.x > e.x ? 0.3 : -0.3);
        e.y += Math.cos(this.animTimer * 3) * 0.6;
      }

      // Contact Damage with Samus
      if (Math.abs(this.x - e.x) < 10 && Math.abs(this.y - e.y) < 12) {
        this.energy = Math.max(0, this.energy - 1);
        if (this.energy <= 0) {
          this.state = 'GAMEOVER';
          gameBoyAudio.stopBgm();
        }
      }
    }

    if (this.metroidsLeft <= 37) {
      this.state = 'VICTORY';
    }
  }

  public render(ctx: CanvasRenderingContext2D) {
    const pal = GAME_BOY_PALETTES[this.palette].colors;
    const [c0, c1, c2, c3] = pal;

    // Background Planet SR388 Cave
    ctx.fillStyle = c0;
    ctx.fillRect(0, 0, 160, 144);

    if (this.state === 'TITLE') {
      ctx.fillStyle = c3;
      ctx.font = 'bold 11px monospace';
      ctx.fillText('METROID II', 46, 32);
      ctx.font = '8px monospace';
      ctx.fillText('RETURN OF SAMUS', 34, 46);
      ctx.fillText('©1991 NINTENDO', 38, 62);

      // Samus Sprite
      ctx.fillStyle = c2;
      ctx.fillRect(72, 74, 16, 24);
      ctx.fillStyle = c3;
      ctx.fillRect(76, 78, 8, 4);

      ctx.fillText('PRESS START', 46, 118);
      return;
    }

    ctx.save();
    ctx.translate(-Math.floor(this.cameraX), 0);

    // Render SR388 Cavern Floor & Rocks
    ctx.fillStyle = c3;
    ctx.fillRect(0, 108, 1000, 36);

    // Cave Texture Dithering
    ctx.fillStyle = c2;
    for (let bx = 0; bx < 1000; bx += 16) {
      ctx.fillRect(bx, 108, 16, 2);
      ctx.fillRect(bx + 4, 114, 8, 4);
    }

    // Render Enemies
    for (const e of this.enemies) {
      if (!e.alive) continue;
      if (e.type === 'metroid_alpha') {
        // Metroid Alpha: Floating Jelly Shell + Core + Mandibles
        ctx.fillStyle = c2;
        ctx.beginPath();
        ctx.arc(e.x + 8, e.y + 6, 9, Math.PI, 0);
        ctx.fill();
        ctx.strokeStyle = c3;
        ctx.lineWidth = 1.2;
        ctx.stroke();

        // Glowing nuclei
        ctx.fillStyle = c3;
        ctx.fillRect(e.x + 4, e.y + 3, 3, 3);
        ctx.fillRect(e.x + 9, e.y + 3, 3, 3);

        // Fangs
        ctx.fillStyle = c3;
        ctx.fillRect(e.x + 3, e.y + 8, 2, 5);
        ctx.fillRect(e.x + 11, e.y + 8, 2, 5);
      } else {
        // Crawler
        ctx.fillStyle = c2;
        ctx.fillRect(e.x, e.y + 6, 12, 6);
        ctx.fillStyle = c3;
        ctx.fillRect(e.x + 2, e.y + 4, 8, 2);
      }
    }

    // Render Samus Aran
    const sx = this.x;
    const sy = this.y;

    if (this.isMorphBall) {
      // Morph Ball
      const rot = this.animTimer * 12;
      ctx.fillStyle = c3;
      ctx.beginPath();
      ctx.arc(sx + 6, sy + 6, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = c1;
      ctx.fillRect(sx + 4, sy + 4, 4, 4);
    } else {
      // Samus Power Suit
      // Helmet Visor
      ctx.fillStyle = c2;
      ctx.fillRect(sx + 2, sy - 14, 10, 8);
      ctx.fillStyle = c0;
      ctx.fillRect(sx + (this.facing === 'right' ? 6 : 2), sy - 12, 4, 2);

      // Pauldrons & Chest
      ctx.fillStyle = c3;
      ctx.fillRect(sx, sy - 6, 14, 10);

      // Arm Cannon
      ctx.fillStyle = c2;
      const gunX = this.facing === 'right' ? sx + 12 : sx - 4;
      ctx.fillRect(gunX, sy - 2, 6, 4);

      // Legs
      ctx.fillStyle = c2;
      ctx.fillRect(sx + 2, sy + 4, 4, 8);
      ctx.fillRect(sx + 8, sy + 4, 4, 8);
    }

    // Render Shots
    for (const s of this.shots) {
      if (s.isMissile) {
        ctx.fillStyle = c3;
        ctx.fillRect(s.x, s.y - 1, 6, 3);
        ctx.fillStyle = c1;
        ctx.fillRect(s.x + 2, s.y, 2, 1);
      } else {
        ctx.fillStyle = c2;
        ctx.fillRect(s.x, s.y, 4, 2);
      }
    }

    ctx.restore();

    // Top HUD
    ctx.fillStyle = c0;
    ctx.fillRect(0, 0, 160, 14);
    ctx.fillStyle = c3;
    ctx.font = 'bold 8px monospace';
    ctx.fillText(`EN ${this.energy.toString().padStart(2, '0')}`, 4, 10);
    ctx.fillText(`M ${this.missiles.toString().padStart(2, '0')}`, 44, 10);
    ctx.fillText(`METROIDS ${this.metroidsLeft}`, 84, 10);
  }
}
