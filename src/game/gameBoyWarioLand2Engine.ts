/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Nintendo Game Boy (1998) Wario Land II Engine (DMG-AW2E-USA)
 * Recreates immortal Wario with Shoulder Barge, Ground Pound, Coin Sacks & Pirate Castle mechanics.
 */

import { GameBoyPaletteMode, GAME_BOY_PALETTES } from './gameBoyTypes';
import { gameBoyAudio } from './gameBoyAudio';

export interface WarioBlock {
  x: number;
  y: number;
  cracked: boolean;
  broken: boolean;
}

export interface WarioCoin {
  x: number;
  y: number;
  value: number;
  collected: boolean;
}

export interface WarioEnemy {
  x: number;
  y: number;
  vx: number;
  type: 'pirate_goom' | 'crab';
  stunned: boolean;
  alive: boolean;
}

export class GameBoyWarioLand2Engine {
  public palette: GameBoyPaletteMode = 'dmg';
  public state: 'TITLE' | 'PLAYING' | 'GAMEOVER' | 'VICTORY' = 'TITLE';
  public coins: number = 350;
  public treasures: number = 2;

  // Wario Physics & Actions
  public x: number = 24;
  public y: number = 90;
  public vx: number = 0;
  public vy: number = 0;
  public facing: 'left' | 'right' = 'right';
  public isBarging: boolean = false;
  public isGroundPounding: boolean = false;
  public isGrounded: boolean = true;

  public cameraX: number = 0;
  public blocks: WarioBlock[] = [];
  public coinsList: WarioCoin[] = [];
  public enemies: WarioEnemy[] = [];
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
    this.coins = 350;
    this.isBarging = false;
    this.isGroundPounding = false;
    this.cameraX = 0;

    this.blocks = [
      { x: 120, y: 76, cracked: true, broken: false },
      { x: 120, y: 92, cracked: true, broken: false },
      { x: 260, y: 76, cracked: true, broken: false },
      { x: 260, y: 92, cracked: true, broken: false },
      { x: 420, y: 92, cracked: true, broken: false }
    ];

    this.coinsList = [
      { x: 80, y: 60, value: 50, collected: false },
      { x: 140, y: 60, value: 100, collected: false },
      { x: 280, y: 50, value: 50, collected: false },
      { x: 450, y: 60, value: 100, collected: false },
      { x: 550, y: 60, value: 200, collected: false }
    ];

    this.enemies = [
      { x: 160, y: 96, vx: -0.5, type: 'pirate_goom', stunned: false, alive: true },
      { x: 320, y: 96, vx: 0.6, type: 'crab', stunned: false, alive: true },
      { x: 500, y: 96, vx: -0.6, type: 'pirate_goom', stunned: false, alive: true }
    ];
  }

  public startGame() {
    this.state = 'PLAYING';
    this.initLevel();
    gameBoyAudio.startWarioLand2BGM();
  }

  public setKey(key: 'left' | 'right' | 'up' | 'down' | 'a' | 'b', pressed: boolean) {
    this.keyState[key] = pressed;
    if (this.state !== 'PLAYING') return;

    if (key === 'a' && pressed) {
      if (this.isGrounded) {
        this.vy = -4.2;
        this.isGrounded = false;
        gameBoyAudio.playWarioJump();
      }
    }

    if (key === 'down' && pressed && !this.isGrounded) {
      // Ground pound!
      this.isGroundPounding = true;
      this.vy = 6.0;
      gameBoyAudio.playWarioGroundPound();
    }

    if (key === 'b') {
      if (pressed && this.isGrounded) {
        // Shoulder Barge Dash!
        this.isBarging = true;
        gameBoyAudio.playWarioBash();
      } else if (!pressed) {
        this.isBarging = false;
      }
    }
  }

  public update(dt: number) {
    if (this.state !== 'PLAYING') return;

    this.animTimer += dt;

    // Movement
    let speed = this.isBarging ? 3.2 : 1.8;
    if (this.keyState.left) {
      this.vx = -speed;
      this.facing = 'left';
    } else if (this.keyState.right) {
      this.vx = speed;
      this.facing = 'right';
    } else {
      this.vx = this.isBarging ? (this.facing === 'right' ? speed : -speed) : 0;
    }

    this.x += this.vx;

    // Gravity
    const grav = this.isGroundPounding ? 16.0 : 9.8;
    this.vy += grav * dt;
    this.y += this.vy;

    const floorY = 92;
    if (this.y >= floorY) {
      this.y = floorY;
      this.vy = 0;
      this.isGrounded = true;
      this.isGroundPounding = false;
    }

    this.cameraX = Math.max(0, this.x - 70);

    // Break blocks on shoulder barge
    if (this.isBarging) {
      for (const b of this.blocks) {
        if (!b.broken && Math.abs(this.x - b.x) < 16 && Math.abs(this.y - b.y) < 16) {
          b.broken = true;
          this.coins += 20;
          gameBoyAudio.playWarioBlockBreak();
        }
      }
    }

    // Collect Coins
    for (const c of this.coinsList) {
      if (!c.collected && Math.abs(this.x - c.x) < 14 && Math.abs(this.y - c.y) < 14) {
        c.collected = true;
        this.coins += c.value;
        gameBoyAudio.playCoinCollect();
      }
    }

    // Enemies interaction
    for (const e of this.enemies) {
      if (!e.alive) continue;
      e.x += e.vx;
      if (e.x < 100 || e.x > 600) e.vx = -e.vx;

      if (Math.abs(this.x - e.x) < 14 && Math.abs(this.y - e.y) < 14) {
        if (this.isBarging || this.isGroundPounding) {
          // Flatten enemy
          e.alive = false;
          this.coins += 50;
          gameBoyAudio.playWarioEnemyHit();
        } else {
          // Bounced away (Wario cannot die!)
          this.vx = this.facing === 'right' ? -3 : 3;
          this.coins = Math.max(0, this.coins - 10);
        }
      }
    }

    if (this.x > 650) {
      this.state = 'VICTORY';
    }
  }

  public render(ctx: CanvasRenderingContext2D) {
    const pal = GAME_BOY_PALETTES[this.palette].colors;
    const [c0, c1, c2, c3] = pal;

    // Background Pirate Castle
    ctx.fillStyle = c0;
    ctx.fillRect(0, 0, 160, 144);

    if (this.state === 'TITLE') {
      ctx.fillStyle = c3;
      ctx.font = 'bold 12px monospace';
      ctx.fillText('WARIO LAND II', 32, 34);
      ctx.font = '8px monospace';
      ctx.fillText('©1998 NINTENDO', 38, 50);

      // Wario Head
      ctx.fillStyle = c2;
      ctx.fillRect(70, 68, 20, 18);
      ctx.fillStyle = c3;
      // Wario Mustache & Cap
      ctx.fillRect(66, 76, 28, 4);
      ctx.fillRect(72, 64, 16, 6);

      ctx.fillText('PRESS START', 46, 118);
      return;
    }

    ctx.save();
    ctx.translate(-Math.floor(this.cameraX), 0);

    // Pirate Castle Stone Wall Background
    ctx.fillStyle = c1;
    for (let bx = 0; bx < 800; bx += 32) {
      for (let by = 20; by < 110; by += 20) {
        ctx.strokeRect(bx, by, 32, 20);
      }
    }

    // Floor
    ctx.fillStyle = c3;
    ctx.fillRect(0, 108, 800, 36);

    // Blocks
    for (const b of this.blocks) {
      if (b.broken) continue;
      ctx.fillStyle = c2;
      ctx.fillRect(b.x, b.y, 16, 16);
      ctx.strokeStyle = c3;
      ctx.strokeRect(b.x, b.y, 16, 16);
      // Crack line
      ctx.fillStyle = c3;
      ctx.fillRect(b.x + 4, b.y + 4, 8, 2);
    }

    // Coins / Sacks
    for (const c of this.coinsList) {
      if (c.collected) continue;
      ctx.fillStyle = c2;
      ctx.fillRect(c.x, c.y + 2, 12, 10);
      ctx.fillStyle = c3;
      ctx.fillRect(c.x + 3, c.y, 6, 4);
      ctx.fillText('$', c.x + 3, c.y + 10);
    }

    // Enemies
    for (const e of this.enemies) {
      if (!e.alive) continue;
      ctx.fillStyle = c3;
      ctx.fillRect(e.x, e.y + 4, 12, 8);
      ctx.fillStyle = c0;
      ctx.fillRect(e.x + 2, e.y + 6, 2, 2);
    }

    // Render Wario
    const wx = this.x;
    const wy = this.y;

    ctx.fillStyle = c3;
    // Cap
    ctx.fillRect(wx + (this.facing === 'right' ? 2 : 0), wy - 6, 14, 6);
    // Face & Big Pink Nose
    ctx.fillStyle = c1;
    ctx.fillRect(wx + 2, wy, 12, 8);
    // Zigzag Mustache
    ctx.fillStyle = c3;
    ctx.fillRect(wx, wy + 4, 16, 3);
    // Big Body
    ctx.fillRect(wx + 2, wy + 8, 14, 10);

    ctx.restore();

    // Top HUD
    ctx.fillStyle = c0;
    ctx.fillRect(0, 0, 160, 14);
    ctx.fillStyle = c3;
    ctx.font = 'bold 8px monospace';
    ctx.fillText(`WARIO`, 4, 10);
    ctx.fillText(`🪙 ${this.coins}`, 70, 10);
    ctx.fillText(`🏆 ${this.treasures}`, 126, 10);
  }
}
