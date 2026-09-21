/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Nintendo Game Boy (1992) Super Mario Land 2: 6 Golden Coins Engine (DMG-MQ-USA)
 * Recreates Mario with Bunny Ears (Carrot flutter), Spin Jump, and 6 Golden Coins Zone mechanics.
 */

import { GameBoyPaletteMode, GAME_BOY_PALETTES } from './gameBoyTypes';
import { gameBoyAudio } from './gameBoyAudio';

export interface Sml2Enemy {
  x: number;
  y: number;
  vx: number;
  type: 'goomba' | 'koopa' | 'ant';
  alive: boolean;
}

export interface Sml2Coin {
  x: number;
  y: number;
  collected: boolean;
}

export class GameBoyMarioLand2Engine {
  public palette: GameBoyPaletteMode = 'dmg';
  public state: 'TITLE' | 'PLAYING' | 'GAMEOVER' | 'VICTORY' = 'TITLE';
  public score: number = 0;
  public coins: number = 24;
  public lives: number = 5;
  public goldenCoins: number = 3; // Out of 6
  public powerState: 'SMALL' | 'SUPER' | 'BUNNY' = 'BUNNY';

  // Mario physics
  public x: number = 24;
  public y: number = 88;
  public vx: number = 0;
  public vy: number = 0;
  public facing: 'left' | 'right' = 'right';
  public isGrounded: boolean = true;
  public isFluttering: boolean = false;

  public cameraX: number = 0;
  public enemies: Sml2Enemy[] = [];
  public coinsList: Sml2Coin[] = [];
  private animTimer: number = 0;
  private keyState = { left: false, right: false, up: false, down: false, a: false, b: false };

  constructor() {
    this.initLevel();
  }

  public initLevel() {
    this.x = 24;
    this.y = 88;
    this.vx = 0;
    this.vy = 0;
    this.powerState = 'BUNNY';
    this.cameraX = 0;

    this.enemies = [
      { x: 140, y: 96, vx: -0.5, type: 'goomba', alive: true },
      { x: 260, y: 96, vx: -0.6, type: 'koopa', alive: true },
      { x: 380, y: 96, vx: 0.5, type: 'ant', alive: true },
      { x: 520, y: 96, vx: -0.6, type: 'goomba', alive: true },
      { x: 640, y: 96, vx: -0.5, type: 'koopa', alive: true }
    ];

    this.coinsList = [
      { x: 80, y: 70, collected: false },
      { x: 96, y: 70, collected: false },
      { x: 112, y: 70, collected: false },
      { x: 200, y: 50, collected: false },
      { x: 216, y: 50, collected: false },
      { x: 340, y: 60, collected: false },
      { x: 480, y: 50, collected: false }
    ];
  }

  public startGame() {
    this.state = 'PLAYING';
    this.initLevel();
    gameBoyAudio.startMarioLand2BGM();
  }

  public setKey(key: 'left' | 'right' | 'up' | 'down' | 'a' | 'b', pressed: boolean) {
    this.keyState[key] = pressed;
    if (this.state !== 'PLAYING') return;

    if (key === 'a' && pressed) {
      if (this.isGrounded) {
        this.vy = -4.4;
        this.isGrounded = false;
        gameBoyAudio.playMarioJump(this.powerState !== 'SMALL');
      } else if (this.powerState === 'BUNNY' && this.vy > 0) {
        // Bunny ear flutter glide!
        this.vy = 0.4;
        this.isFluttering = true;
        gameBoyAudio.playMarioBunnyFlap();
      }
    }

    if (key === 'b' && pressed && this.isGrounded && this.keyState.down) {
      // Spin jump
      this.vy = -4.0;
      this.isGrounded = false;
      gameBoyAudio.playMarioJump(true);
    }
  }

  public update(dt: number) {
    if (this.state !== 'PLAYING') return;

    this.animTimer += dt;

    // Run movement
    const runSpeed = this.keyState.b ? 2.4 : 1.8;
    if (this.keyState.left) {
      this.vx = -runSpeed;
      this.facing = 'left';
    } else if (this.keyState.right) {
      this.vx = runSpeed;
      this.facing = 'right';
    } else {
      this.vx = 0;
    }

    this.x += this.vx;

    // Gravity
    const grav = (this.isFluttering && this.keyState.a && this.vy > 0) ? 2.0 : 9.5;
    this.vy += grav * dt;
    this.y += this.vy;

    const floorY = 92;
    if (this.y >= floorY) {
      this.y = floorY;
      this.vy = 0;
      this.isGrounded = true;
      this.isFluttering = false;
    }

    this.cameraX = Math.max(0, this.x - 70);

    // Collect Coins
    for (const c of this.coinsList) {
      if (!c.collected && Math.abs(this.x - c.x) < 12 && Math.abs(this.y - c.y) < 14) {
        c.collected = true;
        this.coins++;
        this.score += 100;
        gameBoyAudio.playCoinCollect();
      }
    }

    // Enemies Stomp
    for (const e of this.enemies) {
      if (!e.alive) continue;
      e.x += e.vx;
      if (e.x < 100 || e.x > 750) e.vx = -e.vx;

      if (Math.abs(this.x - e.x) < 12 && Math.abs(this.y - e.y) < 14) {
        if (this.vy > 0 && this.y < e.y) {
          // Stomp!
          e.alive = false;
          this.vy = -3.2;
          this.score += 200;
          gameBoyAudio.playStomp();
        } else {
          // Mario damage
          if (this.powerState === 'BUNNY') this.powerState = 'SUPER';
          else if (this.powerState === 'SUPER') this.powerState = 'SMALL';
          else {
            this.state = 'GAMEOVER';
            gameBoyAudio.stopBgm();
          }
        }
      }
    }

    if (this.x > 760) {
      this.state = 'VICTORY';
    }
  }

  public render(ctx: CanvasRenderingContext2D) {
    const pal = GAME_BOY_PALETTES[this.palette].colors;
    const [c0, c1, c2, c3] = pal;

    // Background Tree Zone / Mario Castle
    ctx.fillStyle = c0;
    ctx.fillRect(0, 0, 160, 144);

    if (this.state === 'TITLE') {
      ctx.fillStyle = c3;
      ctx.font = 'bold 9px monospace';
      ctx.fillText('SUPER MARIO LAND 2', 22, 32);
      ctx.font = '8px monospace';
      ctx.fillText('6 GOLDEN COINS', 38, 46);
      ctx.fillText('©1992 NINTENDO', 38, 62);

      // Mario with Bunny Ears Title Art
      ctx.fillStyle = c2;
      ctx.fillRect(72, 76, 16, 16);
      ctx.fillStyle = c3;
      // Ears
      ctx.fillRect(72, 68, 4, 8);
      ctx.fillRect(84, 68, 4, 8);

      ctx.fillText('PRESS START', 46, 118);
      return;
    }

    ctx.save();
    ctx.translate(-Math.floor(this.cameraX), 0);

    // Tree Hills & Castles
    ctx.fillStyle = c1;
    for (let h = 0; h < 900; h += 90) {
      ctx.fillRect(h + 20, 70, 40, 40);
      ctx.beginPath();
      ctx.arc(h + 40, 70, 24, Math.PI, 0);
      ctx.fill();
    }

    // Floor Brick Ground
    ctx.fillStyle = c3;
    ctx.fillRect(0, 108, 900, 36);

    // Brick Patterns
    ctx.fillStyle = c2;
    for (let bx = 0; bx < 900; bx += 16) {
      ctx.fillRect(bx, 108, 14, 8);
      ctx.fillRect(bx + 8, 118, 14, 8);
    }

    // Coins
    for (const c of this.coinsList) {
      if (c.collected) continue;
      ctx.fillStyle = c2;
      ctx.beginPath();
      ctx.arc(c.x + 4, c.y + 4, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = c3;
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Enemies
    for (const e of this.enemies) {
      if (!e.alive) continue;
      ctx.fillStyle = c3;
      ctx.fillRect(e.x + 2, e.y + 4, 10, 8);
      ctx.fillStyle = c1;
      ctx.fillRect(e.x + 4, e.y + 6, 2, 2);
      ctx.fillRect(e.x + 8, e.y + 6, 2, 2);
    }

    // Render Mario
    const mx = this.x;
    const my = this.y;

    ctx.fillStyle = c3;
    // Cap & Head
    ctx.fillRect(mx + (this.facing === 'right' ? 2 : 0), my - 8, 12, 6);
    // Face
    ctx.fillStyle = c1;
    ctx.fillRect(mx + (this.facing === 'right' ? 4 : 2), my - 4, 8, 6);

    // Bunny Ears (Flapping if in mid-air)
    if (this.powerState === 'BUNNY') {
      ctx.fillStyle = c3;
      const flap = this.isFluttering ? Math.sin(this.animTimer * 20) * 3 : 0;
      ctx.fillRect(mx + 2, my - 16 + flap, 3, 8);
      ctx.fillRect(mx + 9, my - 16 - flap, 3, 8);
    }

    // Body & Overalls
    ctx.fillStyle = c3;
    ctx.fillRect(mx + 2, my + 2, 10, 8);
    // Shoes
    ctx.fillStyle = c2;
    ctx.fillRect(mx, my + 10, 5, 4);
    ctx.fillRect(mx + 9, my + 10, 5, 4);

    ctx.restore();

    // Top HUD
    ctx.fillStyle = c0;
    ctx.fillRect(0, 0, 160, 14);
    ctx.fillStyle = c3;
    ctx.font = 'bold 8px monospace';
    ctx.fillText(`MARIO ${this.score.toString().padStart(6, '0')}`, 4, 10);
    ctx.fillText(`🪙${this.coins.toString().padStart(2, '0')}`, 90, 10);
    ctx.fillText(`👑${this.goldenCoins}/6`, 126, 10);
  }
}
