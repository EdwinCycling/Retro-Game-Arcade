/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Nintendo Game Boy (1993) The Legend of Zelda: Link's Awakening Engine (DMG-ZL-USA)
 * Recreates Link on Koholint Island with Sword Slash, Shield Block, Bush Cutting, and Tail Cave puzzles.
 */

import { GameBoyPaletteMode, GAME_BOY_PALETTES } from './gameBoyTypes';
import { gameBoyAudio } from './gameBoyAudio';

export interface ZeldaBush {
  x: number;
  y: number;
  cut: boolean;
}

export interface ZeldaEnemy {
  x: number;
  y: number;
  vx: number;
  vy: number;
  hp: number;
  type: 'octorok' | 'keese' | 'moblin';
  alive: boolean;
}

export class GameBoyZeldaLaEngine {
  public palette: GameBoyPaletteMode = 'dmg';
  public state: 'TITLE' | 'PLAYING' | 'GAMEOVER' | 'VICTORY' = 'TITLE';
  public rupees: number = 25;
  public hearts: number = 3;
  public maxHearts: number = 3;
  public keysCount: number = 1;

  // Link State
  public x: number = 72;
  public y: number = 72;
  public facing: 'up' | 'down' | 'left' | 'right' = 'down';
  public isAttacking: boolean = false;
  public attackTimer: number = 0;
  public isShielding: boolean = false;

  public bushes: ZeldaBush[] = [];
  public enemies: ZeldaEnemy[] = [];
  private animTimer: number = 0;
  private keyState = { left: false, right: false, up: false, down: false, a: false, b: false };

  constructor() {
    this.initRoom();
  }

  public initRoom() {
    this.x = 72;
    this.y = 72;
    this.facing = 'down';
    this.isAttacking = false;
    this.hearts = 3;
    this.rupees = 25;

    this.bushes = [
      { x: 24, y: 24, cut: false },
      { x: 40, y: 24, cut: false },
      { x: 120, y: 24, cut: false },
      { x: 136, y: 24, cut: false },
      { x: 24, y: 96, cut: false },
      { x: 40, y: 96, cut: false },
      { x: 120, y: 96, cut: false },
      { x: 136, y: 96, cut: false }
    ];

    this.enemies = [
      { x: 30, y: 60, vx: 0.6, vy: 0, hp: 2, type: 'octorok', alive: true },
      { x: 120, y: 60, vx: -0.6, vy: 0.4, hp: 1, type: 'keese', alive: true },
      { x: 80, y: 30, vx: 0, vy: 0.5, hp: 3, type: 'moblin', alive: true }
    ];
  }

  public startGame() {
    this.state = 'PLAYING';
    this.initRoom();
    gameBoyAudio.startZeldaLaBGM();
  }

  public setKey(key: 'left' | 'right' | 'up' | 'down' | 'a' | 'b', pressed: boolean) {
    this.keyState[key] = pressed;
    if (this.state !== 'PLAYING') return;

    if (key === 'b' && pressed && !this.isAttacking) {
      this.isAttacking = true;
      this.attackTimer = 0.2;
      gameBoyAudio.playZeldaSwordSlash();
      this.checkSwordHit();
    }

    if (key === 'a') {
      this.isShielding = pressed;
      if (pressed) gameBoyAudio.playZeldaShield();
    }
  }

  private checkSwordHit() {
    // Check bushes
    for (const b of this.bushes) {
      if (!b.cut && Math.abs(this.x - b.x) < 18 && Math.abs(this.y - b.y) < 18) {
        b.cut = true;
        this.rupees += Math.random() > 0.5 ? 5 : 1;
        gameBoyAudio.playZeldaBushCut();
      }
    }

    // Check enemies
    for (const e of this.enemies) {
      if (e.alive && Math.abs(this.x - e.x) < 22 && Math.abs(this.y - e.y) < 22) {
        e.hp--;
        gameBoyAudio.playZeldaEnemyHit();
        if (e.hp <= 0) {
          e.alive = false;
          this.rupees += 10;
        }
      }
    }
  }

  public update(dt: number) {
    if (this.state !== 'PLAYING') return;

    this.animTimer += dt;

    if (this.isAttacking) {
      this.attackTimer -= dt;
      if (this.attackTimer <= 0) {
        this.isAttacking = false;
      }
    }

    // Link Movement (when not swinging sword)
    if (!this.isAttacking) {
      const speed = this.isShielding ? 1.0 : 1.6;
      if (this.keyState.left) {
        this.x -= speed;
        this.facing = 'left';
      } else if (this.keyState.right) {
        this.x += speed;
        this.facing = 'right';
      }
      if (this.keyState.up) {
        this.y -= speed;
        this.facing = 'up';
      } else if (this.keyState.down) {
        this.y += speed;
        this.facing = 'down';
      }

      // Clamp to screen borders
      this.x = Math.max(16, Math.min(136, this.x));
      this.y = Math.max(24, Math.min(116, this.y));
    }

    // Update Enemies
    for (const e of this.enemies) {
      if (!e.alive) continue;
      e.x += e.vx;
      e.y += e.vy;

      if (e.x < 20 || e.x > 130) e.vx = -e.vx;
      if (e.y < 24 || e.y > 110) e.vy = -e.vy;

      // Contact with Link
      if (Math.abs(this.x - e.x) < 10 && Math.abs(this.y - e.y) < 10) {
        if (!this.isShielding) {
          this.hearts = Math.max(0, this.hearts - 1);
          gameBoyAudio.playZeldaDamage();
          if (this.hearts <= 0) {
            this.state = 'GAMEOVER';
            gameBoyAudio.stopBgm();
          }
        }
      }
    }

    if (this.enemies.every(e => !e.alive)) {
      this.state = 'VICTORY';
    }
  }

  public render(ctx: CanvasRenderingContext2D) {
    const pal = GAME_BOY_PALETTES[this.palette].colors;
    const [c0, c1, c2, c3] = pal;

    // Background Overworld Ground
    ctx.fillStyle = c0;
    ctx.fillRect(0, 0, 160, 144);

    if (this.state === 'TITLE') {
      ctx.fillStyle = c3;
      ctx.font = 'bold 8px monospace';
      ctx.fillText('THE LEGEND OF ZELDA', 22, 30);
      ctx.font = 'bold 10px monospace';
      ctx.fillText("LINK'S AWAKENING", 24, 44);
      ctx.font = '8px monospace';
      ctx.fillText('©1993 NINTENDO', 38, 60);

      // Triforce
      ctx.fillStyle = c2;
      ctx.beginPath();
      ctx.moveTo(80, 72);
      ctx.lineTo(68, 92);
      ctx.lineTo(92, 92);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = c3;
      ctx.fillText('PRESS START', 46, 120);
      return;
    }

    // Room Walls & Borders
    ctx.fillStyle = c3;
    ctx.fillRect(0, 14, 160, 8); // Top wall
    ctx.fillRect(0, 134, 160, 10); // Bottom wall
    ctx.fillRect(0, 14, 8, 130); // Left wall
    ctx.fillRect(152, 14, 8, 130); // Right wall

    // Tree / Rock Wall patterns
    ctx.fillStyle = c2;
    for (let i = 8; i < 152; i += 16) {
      ctx.fillRect(i, 16, 14, 4);
      ctx.fillRect(i, 136, 14, 4);
    }

    // Bushes
    for (const b of this.bushes) {
      if (b.cut) continue;
      ctx.fillStyle = c2;
      ctx.fillRect(b.x, b.y, 14, 14);
      ctx.fillStyle = c3;
      ctx.fillRect(b.x + 2, b.y + 2, 10, 10);
      ctx.fillStyle = c1;
      ctx.fillRect(b.x + 4, b.y + 4, 6, 6);
    }

    // Enemies
    for (const e of this.enemies) {
      if (!e.alive) continue;
      if (e.type === 'octorok') {
        ctx.fillStyle = c3;
        ctx.beginPath();
        ctx.arc(e.x + 6, e.y + 6, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = c0;
        ctx.fillRect(e.x + 4, e.y + 4, 2, 2);
        ctx.fillRect(e.x + 8, e.y + 4, 2, 2);
      } else {
        // Keese bat
        ctx.fillStyle = c3;
        ctx.fillRect(e.x, e.y + 2, 12, 4);
        ctx.fillRect(e.x + 4, e.y, 4, 8);
      }
    }

    // Render Link
    const lx = this.x;
    const ly = this.y;

    // Green Cap & Tunic
    ctx.fillStyle = c2;
    ctx.fillRect(lx + 2, ly, 10, 6); // Hat
    ctx.fillStyle = c1;
    ctx.fillRect(lx + 3, ly + 5, 8, 5); // Face
    ctx.fillStyle = c3;
    ctx.fillRect(lx + 2, ly + 10, 10, 8); // Tunic

    // Shield
    if (this.isShielding) {
      ctx.fillStyle = c3;
      ctx.fillRect(lx + 12, ly + 6, 4, 10);
      ctx.fillStyle = c0;
      ctx.fillRect(lx + 13, ly + 8, 2, 6);
    }

    // Sword (Swinging)
    if (this.isAttacking) {
      ctx.fillStyle = c3;
      let sx = lx + 12;
      let sy = ly + 4;
      let sw = 14;
      let sh = 3;
      if (this.facing === 'left') { sx = lx - 14; }
      else if (this.facing === 'up') { sx = lx + 4; sy = ly - 12; sw = 3; sh = 14; }
      else if (this.facing === 'down') { sx = lx + 4; sy = ly + 16; sw = 3; sh = 14; }
      ctx.fillRect(sx, sy, sw, sh);
    }

    // Top HUD
    ctx.fillStyle = c0;
    ctx.fillRect(0, 0, 160, 14);
    ctx.fillStyle = c3;
    ctx.font = 'bold 8px monospace';
    ctx.fillText(`💎${this.rupees}`, 6, 10);
    ctx.fillText(`🗝️${this.keysCount}`, 52, 10);

    // Hearts
    for (let h = 0; h < this.maxHearts; h++) {
      ctx.fillText(h < this.hearts ? '♥' : '♡', 110 + h * 12, 10);
    }
  }
}
