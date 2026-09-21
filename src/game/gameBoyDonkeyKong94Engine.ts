/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Nintendo Game Boy (1994) Donkey Kong '94 Engine (DMG-QD-USA)
 * Recreates Mario with Handstands, Triple Backflips, Key Carrying & 101 Puzzle Stage mechanics.
 */

import { GameBoyPaletteMode, GAME_BOY_PALETTES } from './gameBoyTypes';
import { gameBoyAudio } from './gameBoyAudio';

export interface DkBarrel {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

export class GameBoyDonkeyKong94Engine {
  public palette: GameBoyPaletteMode = 'dmg';
  public state: 'TITLE' | 'PLAYING' | 'GAMEOVER' | 'VICTORY' = 'TITLE';
  public score: number = 0;
  public stage: number = 1;
  public lives: number = 3;
  public time: number = 100;

  // Mario State
  public x: number = 24;
  public y: number = 108;
  public vx: number = 0;
  public vy: number = 0;
  public facing: 'left' | 'right' = 'right';
  public isGrounded: boolean = true;
  public isClimbing: boolean = false;
  public isHandstanding: boolean = false;
  public hasKey: boolean = false;

  // Key & Door coordinates
  public keyX: number = 80;
  public keyY: number = 68;
  public doorX: number = 130;
  public doorY: number = 30;

  public barrels: DkBarrel[] = [];
  private animTimer: number = 0;
  private barrelSpawnTimer: number = 0;
  private keyState = { left: false, right: false, up: false, down: false, a: false, b: false };

  constructor() {
    this.initStage();
  }

  public initStage() {
    this.x = 24;
    this.y = 108;
    this.vx = 0;
    this.vy = 0;
    this.hasKey = false;
    this.keyX = 80;
    this.keyY = 68;
    this.doorX = 130;
    this.doorY = 30;
    this.time = 100;
    this.barrels = [];
  }

  public startGame() {
    this.state = 'PLAYING';
    this.initStage();
    gameBoyAudio.startDk94BGM();
  }

  public setKey(key: 'left' | 'right' | 'up' | 'down' | 'a' | 'b', pressed: boolean) {
    this.keyState[key] = pressed;
    if (this.state !== 'PLAYING') return;

    if (key === 'down') {
      this.isHandstanding = pressed && this.isGrounded;
    }

    if (key === 'a' && pressed) {
      if (this.isGrounded) {
        // Higher jump from handstand (backflip)
        const jumpPow = this.isHandstanding ? -5.2 : -4.2;
        this.vy = jumpPow;
        this.isGrounded = false;
        gameBoyAudio.playMarioJump(this.isHandstanding);
      }
    }

    if (key === 'b' && pressed) {
      // Pick up or throw key
      if (!this.hasKey && Math.abs(this.x - this.keyX) < 14 && Math.abs(this.y - this.keyY) < 14) {
        this.hasKey = true;
        gameBoyAudio.playDk94KeyGrab();
      } else if (this.hasKey) {
        this.hasKey = false;
        this.keyX = this.x + (this.facing === 'right' ? 16 : -16);
        this.keyY = this.y;
      }
    }
  }

  public update(dt: number) {
    if (this.state !== 'PLAYING') return;

    this.animTimer += dt;
    this.time = Math.max(0, this.time - dt * 1.5);
    this.barrelSpawnTimer += dt;

    if (this.barrelSpawnTimer > 3.5) {
      this.barrelSpawnTimer = 0;
      this.barrels.push({ x: 30, y: 36, vx: 1.2, vy: 0 });
    }

    // Mario Horizontal Movement
    const speed = 1.6;
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

    // Ladder climbing check
    const onLadder1 = Math.abs(this.x - 120) < 6 && this.y > 68 && this.y < 112;
    const onLadder2 = Math.abs(this.x - 40) < 6 && this.y > 32 && this.y < 74;

    if ((onLadder1 || onLadder2) && (this.keyState.up || this.keyState.down)) {
      this.isClimbing = true;
      this.vy = this.keyState.up ? -1.4 : 1.4;
      this.y += this.vy;
    } else {
      this.isClimbing = false;
      this.vy += 9.8 * dt;
      this.y += this.vy;
    }

    // Platform collisions
    // Floor 1: y = 108
    // Floor 2: y = 68
    // Floor 3: y = 32
    if (this.y >= 108) {
      this.y = 108;
      this.vy = 0;
      this.isGrounded = true;
    } else if (this.y >= 68 && this.y <= 72 && this.vy >= 0 && !this.keyState.down) {
      this.y = 68;
      this.vy = 0;
      this.isGrounded = true;
    } else if (this.y >= 32 && this.y <= 36 && this.vy >= 0 && !this.keyState.down) {
      this.y = 32;
      this.vy = 0;
      this.isGrounded = true;
    }

    // Move key if carried
    if (this.hasKey) {
      this.keyX = this.x;
      this.keyY = this.y - 12;

      // Check door unlock
      if (Math.abs(this.keyX - this.doorX) < 14 && Math.abs(this.keyY - this.doorY) < 14) {
        this.state = 'VICTORY';
        this.score += 1500;
        gameBoyAudio.playDk94DoorUnlock();
      }
    }

    // Update Barrels
    for (let i = this.barrels.length - 1; i >= 0; i--) {
      const b = this.barrels[i];
      b.x += b.vx;
      if (b.x > 146 && b.y < 68) {
        b.y = 68;
        b.vx = -1.2;
      } else if (b.x < 14 && b.y >= 68 && b.y < 108) {
        b.y = 108;
        b.vx = 1.2;
      }

      // Hit Mario
      if (Math.abs(this.x - b.x) < 8 && Math.abs(this.y - b.y) < 8) {
        this.state = 'GAMEOVER';
        gameBoyAudio.stopBgm();
      }
    }
  }

  public render(ctx: CanvasRenderingContext2D) {
    const pal = GAME_BOY_PALETTES[this.palette].colors;
    const [c0, c1, c2, c3] = pal;

    // Background
    ctx.fillStyle = c0;
    ctx.fillRect(0, 0, 160, 144);

    if (this.state === 'TITLE') {
      ctx.fillStyle = c3;
      ctx.font = 'bold 11px monospace';
      ctx.fillText("DONKEY KONG '94", 26, 34);
      ctx.font = '8px monospace';
      ctx.fillText('©1994 NINTENDO', 38, 50);

      // DK Sprite
      ctx.fillStyle = c2;
      ctx.fillRect(68, 66, 24, 20);
      ctx.fillStyle = c3;
      ctx.fillRect(72, 70, 16, 12);

      ctx.fillText('PRESS START', 46, 118);
      return;
    }

    // Render Red Girders / Steel Beams
    ctx.fillStyle = c3;
    ctx.fillRect(0, 120, 160, 6); // Floor 1
    ctx.fillRect(10, 80, 140, 6); // Floor 2
    ctx.fillRect(10, 44, 140, 6); // Floor 3

    // Ladders
    ctx.fillStyle = c2;
    for (let ly = 80; ly < 120; ly += 6) {
      ctx.fillRect(118, ly, 8, 2);
    }
    for (let ly = 44; ly < 80; ly += 6) {
      ctx.fillRect(38, ly, 8, 2);
    }

    // Donkey Kong at top left
    ctx.fillStyle = c3;
    ctx.fillRect(16, 20, 24, 24);
    ctx.fillStyle = c1;
    ctx.fillRect(20, 24, 16, 12);

    // Pauline at top
    ctx.fillStyle = c2;
    ctx.fillRect(130, 14, 10, 16);
    ctx.font = '6px monospace';
    ctx.fillStyle = c3;
    ctx.fillText('HELP!', 124, 10);

    // Door
    ctx.fillStyle = c3;
    ctx.fillRect(this.doorX, this.doorY, 12, 14);
    ctx.fillStyle = c1;
    ctx.fillRect(this.doorX + 2, this.doorY + 2, 8, 10);

    // Key
    if (!this.hasKey) {
      ctx.fillStyle = c3;
      ctx.fillRect(this.keyX, this.keyY, 8, 4);
      ctx.fillRect(this.keyX + 6, this.keyY + 4, 2, 4);
    }

    // Barrels
    for (const b of this.barrels) {
      ctx.fillStyle = c3;
      ctx.beginPath();
      ctx.arc(b.x + 4, b.y + 4, 5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Mario
    const mx = this.x;
    const my = this.y;
    ctx.fillStyle = c3;
    ctx.fillRect(mx + (this.facing === 'right' ? 2 : 0), my, 10, 6);
    ctx.fillStyle = c1;
    ctx.fillRect(mx + 2, my + 4, 6, 4);
    ctx.fillStyle = c3;
    ctx.fillRect(mx, my + 8, 10, 6);

    if (this.hasKey) {
      // Key held overhead
      ctx.fillStyle = c3;
      ctx.fillRect(mx + 2, my - 8, 8, 4);
      ctx.fillRect(mx + 8, my - 4, 2, 4);
    }

    // Top HUD
    ctx.fillStyle = c0;
    ctx.fillRect(0, 0, 160, 14);
    ctx.fillStyle = c3;
    ctx.font = 'bold 8px monospace';
    ctx.fillText(`1-${this.stage}`, 6, 10);
    ctx.fillText(`TIME ${Math.ceil(this.time)}`, 54, 10);
    ctx.fillText(`SCORE ${this.score}`, 104, 10);
  }
}
