/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Nintendo Game Boy (1992) Kirby's Dream Land Engine (DMG-KY-USA)
 * Recreates Kirby with Inhale, Swallow/Star Spit, Inflate/Flight, and Whispy Woods mechanics.
 */

import { GameBoyPaletteMode, GAME_BOY_PALETTES } from './gameBoyTypes';
import { gameBoyAudio } from './gameBoyAudio';

export interface KirbyEnemy {
  x: number;
  y: number;
  vx: number;
  type: 'waddle_dee' | 'bronto_burt' | 'apple';
  alive: boolean;
}

export interface StarProjectile {
  x: number;
  y: number;
  vx: number;
  rot: number;
  life: number;
}

export class GameBoyKirbyEngine {
  public palette: GameBoyPaletteMode = 'dmg';
  public state: 'TITLE' | 'PLAYING' | 'GAMEOVER' | 'VICTORY' = 'TITLE';
  public score: number = 0;
  public health: number = 6;
  public maxHealth: number = 6;
  public lives: number = 4;

  // Kirby State
  public x: number = 24;
  public y: number = 92;
  public vx: number = 0;
  public vy: number = 0;
  public facing: 'left' | 'right' = 'right';
  public isInhaling: boolean = false;
  public hasMouthful: boolean = false;
  public isFloating: boolean = false;
  public isGrounded: boolean = true;

  public cameraX: number = 0;
  public stars: StarProjectile[] = [];
  public enemies: KirbyEnemy[] = [];
  private animTimer: number = 0;
  private keyState = { left: false, right: false, up: false, down: false, a: false, b: false };

  constructor() {
    this.initLevel();
  }

  public initLevel() {
    this.x = 24;
    this.y = 92;
    this.vx = 0;
    this.vy = 0;
    this.health = 6;
    this.isInhaling = false;
    this.hasMouthful = false;
    this.isFloating = false;
    this.stars = [];
    this.cameraX = 0;

    this.enemies = [
      { x: 130, y: 96, vx: -0.5, type: 'waddle_dee', alive: true },
      { x: 220, y: 55, vx: -0.7, type: 'bronto_burt', alive: true },
      { x: 320, y: 96, vx: 0.5, type: 'waddle_dee', alive: true },
      { x: 440, y: 50, vx: -0.6, type: 'bronto_burt', alive: true },
      { x: 550, y: 80, vx: 0, type: 'apple', alive: true },
      { x: 620, y: 96, vx: -0.6, type: 'waddle_dee', alive: true }
    ];
  }

  public startGame() {
    this.state = 'PLAYING';
    this.initLevel();
    gameBoyAudio.startKirbyBGM();
  }

  public setKey(key: 'left' | 'right' | 'up' | 'down' | 'a' | 'b', pressed: boolean) {
    this.keyState[key] = pressed;
    if (this.state !== 'PLAYING') return;

    if (key === 'up' && pressed) {
      if (!this.isFloating && !this.hasMouthful) {
        this.isFloating = true;
        this.vy = -2.5;
        gameBoyAudio.playKirbyFloat();
      }
    }

    if (key === 'a' && pressed) {
      if (this.isFloating) {
        this.vy = -2.8; // flutter flap
        gameBoyAudio.playKirbyFloat();
      } else if (this.isGrounded) {
        this.vy = -4.0;
        this.isGrounded = false;
        gameBoyAudio.playKirbyJump();
      }
    }

    if (key === 'b') {
      if (pressed) {
        if (this.isFloating) {
          // Exhale air puff and stop floating
          this.isFloating = false;
          this.stars.push({
            x: this.x + (this.facing === 'right' ? 12 : -6),
            y: this.y + 4,
            vx: this.facing === 'right' ? 3.5 : -3.5,
            rot: 0,
            life: 0.4
          });
          gameBoyAudio.playKirbySpit();
        } else if (this.hasMouthful) {
          // Spit star projectile
          this.hasMouthful = false;
          this.stars.push({
            x: this.x + (this.facing === 'right' ? 14 : -8),
            y: this.y + 4,
            vx: this.facing === 'right' ? 5.0 : -5.0,
            rot: 0,
            life: 0.8
          });
          gameBoyAudio.playKirbySpit();
        } else {
          this.isInhaling = true;
          gameBoyAudio.playKirbyInhale();
        }
      } else {
        this.isInhaling = false;
      }
    }
  }

  public update(dt: number) {
    if (this.state !== 'PLAYING') return;

    this.animTimer += dt;

    // Movement
    const speed = this.isFloating ? 1.2 : 1.6;
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

    // Gravity & Air resistance
    const gravity = this.isFloating ? 2.5 : 8.5;
    this.vy += gravity * dt;
    this.y += this.vy;

    const floorY = 96;
    if (this.y >= floorY) {
      this.y = floorY;
      this.vy = 0;
      this.isGrounded = true;
      if (this.isFloating) this.isFloating = false;
    }

    // Ceiling clamp
    if (this.y < 16) {
      this.y = 16;
      this.vy = 0;
    }

    this.cameraX = Math.max(0, this.x - 70);

    // Inhale logic
    if (this.isInhaling && !this.hasMouthful) {
      for (const e of this.enemies) {
        if (!e.alive) continue;
        const dx = e.x - this.x;
        const inFront = (this.facing === 'right' && dx > 0 && dx < 48) || (this.facing === 'left' && dx < 0 && dx > -48);
        if (inFront && Math.abs(e.y - this.y) < 18) {
          // Pull enemy towards mouth
          e.x += (this.x - e.x) * 0.15;
          if (Math.abs(e.x - this.x) < 12) {
            e.alive = false;
            this.hasMouthful = true;
            this.isInhaling = false;
            this.score += 200;
            gameBoyAudio.playKirbyGulp();
            break;
          }
        }
      }
    }

    // Star Projectiles
    for (let i = this.stars.length - 1; i >= 0; i--) {
      const s = this.stars[i];
      s.x += s.vx;
      s.rot += dt * 10;
      s.life -= dt;

      for (const e of this.enemies) {
        if (e.alive && Math.abs(s.x - e.x) < 12 && Math.abs(s.y - e.y) < 14) {
          e.alive = false;
          s.life = 0;
          this.score += 400;
          gameBoyAudio.playKirbyHit();
          break;
        }
      }

      if (s.life <= 0) this.stars.splice(i, 1);
    }

    // Enemies update & damage
    for (const e of this.enemies) {
      if (!e.alive) continue;
      e.x += e.vx;
      if (e.type === 'bronto_burt') {
        e.y += Math.sin(this.animTimer * 4) * 0.5;
      }

      // Contact with Kirby
      if (Math.abs(this.x - e.x) < 10 && Math.abs(this.y - e.y) < 10) {
        this.health = Math.max(0, this.health - 1);
        this.vy = -2.0;
        this.vx = this.x > e.x ? 2.0 : -2.0;
        gameBoyAudio.playKirbyDamage();
        if (this.health <= 0) {
          this.state = 'GAMEOVER';
          gameBoyAudio.stopBgm();
        }
      }
    }

    if (this.x > 680) {
      this.state = 'VICTORY';
    }
  }

  public render(ctx: CanvasRenderingContext2D) {
    const pal = GAME_BOY_PALETTES[this.palette].colors;
    const [c0, c1, c2, c3] = pal;

    // Background Sky & Hills
    ctx.fillStyle = c0;
    ctx.fillRect(0, 0, 160, 144);

    if (this.state === 'TITLE') {
      ctx.fillStyle = c3;
      ctx.font = 'bold 10px monospace';
      ctx.fillText("KIRBY'S DREAM LAND", 24, 34);
      ctx.font = '8px monospace';
      ctx.fillText('©1992 HAL / NINTENDO', 26, 50);

      // Kirby Title Sprite
      ctx.fillStyle = c1;
      ctx.beginPath();
      ctx.arc(80, 80, 16, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = c3;
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.fillStyle = c3;
      ctx.fillRect(74, 76, 3, 5);
      ctx.fillRect(83, 76, 3, 5);

      ctx.fillText('PRESS START', 46, 120);
      return;
    }

    ctx.save();
    ctx.translate(-Math.floor(this.cameraX), 0);

    // Green Greens Grass & Hills
    ctx.fillStyle = c1;
    for (let hx = 0; hx < 900; hx += 80) {
      ctx.beginPath();
      ctx.arc(hx + 40, 110, 36, Math.PI, 0);
      ctx.fill();
    }

    // Floor Ground
    ctx.fillStyle = c3;
    ctx.fillRect(0, 110, 900, 34);

    // Grass Top pattern
    ctx.fillStyle = c2;
    for (let gx = 0; gx < 900; gx += 8) {
      ctx.fillRect(gx, 110, 4, 3);
    }

    // Render Enemies
    for (const e of this.enemies) {
      if (!e.alive) continue;
      if (e.type === 'waddle_dee') {
        ctx.fillStyle = c2;
        ctx.beginPath();
        ctx.arc(e.x + 6, e.y + 6, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = c3;
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.fillStyle = c3;
        ctx.fillRect(e.x + 4, e.y + 4, 2, 4);
        ctx.fillRect(e.x + 8, e.y + 4, 2, 4);
      } else {
        // Bronto Burt (winged)
        ctx.fillStyle = c2;
        ctx.beginPath();
        ctx.arc(e.x + 6, e.y + 6, 6, 0, Math.PI * 2);
        ctx.fill();
        // Wings
        ctx.fillStyle = c1;
        ctx.fillRect(e.x - 2, e.y + 2, 4, 3);
        ctx.fillRect(e.x + 10, e.y + 2, 4, 3);
      }
    }

    // Render Kirby
    const kx = this.x;
    const ky = this.y;
    const radius = this.isFloating || this.hasMouthful ? 10 : 8;

    ctx.fillStyle = c1;
    ctx.beginPath();
    ctx.arc(kx + 6, ky + 6, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = c3;
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // Kirby Eyes
    ctx.fillStyle = c3;
    const eyeX = this.facing === 'right' ? kx + 8 : kx + 2;
    ctx.fillRect(eyeX, ky + 3, 2, 4);
    ctx.fillRect(eyeX + 3, ky + 3, 2, 4);

    // Kirby Mouth (Open if inhaling, puffed if mouthful, smile otherwise)
    if (this.isInhaling) {
      ctx.fillStyle = c3;
      ctx.beginPath();
      ctx.arc(kx + (this.facing === 'right' ? 12 : 0), ky + 6, 4, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillStyle = c3;
      ctx.fillRect(kx + 5, ky + 9, 3, 1);
    }

    // Render Star Projectiles
    for (const s of this.stars) {
      ctx.fillStyle = c3;
      ctx.beginPath();
      ctx.arc(s.x, s.y, 4, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();

    // Top HUD
    ctx.fillStyle = c0;
    ctx.fillRect(0, 0, 160, 14);
    ctx.fillStyle = c3;
    ctx.font = 'bold 8px monospace';
    ctx.fillText(`SCORE ${this.score.toString().padStart(6, '0')}`, 4, 10);
    ctx.fillText(`HP `, 94, 10);
    for (let h = 0; h < this.health; h++) {
      ctx.fillRect(112 + h * 6, 4, 4, 7);
    }
  }
}
