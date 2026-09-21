/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * The Legend of Zelda: The Minish Cap GBA Engine (240x160 32-bit Game Boy Advance Action-Adventure)
 */

import { gbaAudio } from './gbaAudio';
import { saveZeldaScore } from './gbaHighScores';

export class GbaZeldaEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private animId: number = 0;
  private isRunning: boolean = false;

  // Link state
  public link = {
    x: 120,
    y: 90,
    dir: 'DOWN' as 'UP' | 'DOWN' | 'LEFT' | 'RIGHT',
    isAttacking: false,
    attackTimer: 0,
    isRolling: false,
    rollTimer: 0,
    hearts: 6,
    maxHearts: 6,
    rupees: 45,
    keys: 1,
    invincibleTimer: 0
  };

  // World objects
  public bushes: { x: number; y: number; cut: boolean }[] = [];
  public rupeesList: { x: number; y: number; value: number; color: string; collected: boolean }[] = [];
  public heartsList: { x: number; y: number; collected: boolean }[] = [];
  public enemies: { x: number; y: number; type: 'octorok' | 'keese' | 'moblin'; hp: number; vx: number; vy: number; timer: number }[] = [];
  public projectiles: { x: number; y: number; vx: number; vy: number; life: number }[] = [];
  public chest = { x: 112, y: 32, opened: false };

  // Status
  public isChestFanfare: boolean = false;
  public fanfareTimer: number = 0;
  public messageText: string = 'Press A to Swing Sword, B to Roll!';

  private keys = {
    up: false,
    down: false,
    left: false,
    right: false,
    a: false,
    b: false,
    start: false,
    select: false
  };

  public onStatsUpdate?: (hearts: number, rupees: number, keys: number) => void;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { alpha: false })!;
  }

  public init() {
    this.canvas.width = 240;
    this.canvas.height = 160;
    this.resetWorld();
    this.startLoop();
  }

  public resetWorld() {
    this.link = {
      x: 120,
      y: 110,
      dir: 'UP',
      isAttacking: false,
      attackTimer: 0,
      isRolling: false,
      rollTimer: 0,
      hearts: 6,
      maxHearts: 6,
      rupees: 45,
      keys: 1,
      invincibleTimer: 0
    };

    this.chest = { x: 112, y: 32, opened: false };
    this.isChestFanfare = false;
    this.fanfareTimer = 0;

    // Bushes
    this.bushes = [];
    const bushPositions = [
      [40, 50], [56, 50], [72, 50],
      [160, 50], [176, 50], [192, 50],
      [40, 100], [56, 100],
      [176, 100], [192, 100],
      [90, 80], [140, 80]
    ];
    bushPositions.forEach(([x, y]) => {
      this.bushes.push({ x, y, cut: false });
    });

    // Enemies
    this.enemies = [
      { x: 50, y: 70, type: 'octorok', hp: 2, vx: 0.5, vy: 0, timer: 0 },
      { x: 180, y: 70, type: 'octorok', hp: 2, vx: -0.5, vy: 0, timer: 0 },
      { x: 70, y: 30, type: 'keese', hp: 1, vx: 0.8, vy: 0.6, timer: 0 },
      { x: 160, y: 30, type: 'moblin', hp: 3, vx: -0.4, vy: 0, timer: 0 }
    ];

    this.rupeesList = [];
    this.heartsList = [];
    this.projectiles = [];
  }

  public setInput(input: Partial<typeof this.keys>) {
    const prevA = this.keys.a;
    const prevB = this.keys.b;
    this.keys = { ...this.keys, ...input };

    if (this.link.hearts <= 0) {
      if (this.keys.start || this.keys.a) {
        this.resetWorld();
      }
      return;
    }

    // Sword Swing (A)
    if (this.keys.a && !prevA && !this.link.isAttacking && !this.link.isRolling) {
      this.link.isAttacking = true;
      this.link.attackTimer = 12;
      gbaAudio.playZeldaSword();
      this.checkSwordHit();
    }

    // Roll (B)
    if (this.keys.b && !prevB && !this.link.isRolling && !this.link.isAttacking) {
      this.link.isRolling = true;
      this.link.rollTimer = 14;
      gbaAudio.playHingeClick();
    }
  }

  private checkSwordHit() {
    let hitX = this.link.x;
    let hitY = this.link.y;

    if (this.link.dir === 'UP') hitY -= 16;
    if (this.link.dir === 'DOWN') hitY += 16;
    if (this.link.dir === 'LEFT') hitX -= 16;
    if (this.link.dir === 'RIGHT') hitX += 16;

    // Cut bushes
    this.bushes.forEach(b => {
      if (!b.cut && Math.hypot(b.x + 8 - hitX, b.y + 8 - hitY) < 16) {
        b.cut = true;
        gbaAudio.playZeldaSword();

        // Spawn rupee or heart
        if (Math.random() < 0.5) {
          const val = Math.random() < 0.2 ? 5 : 1;
          this.rupeesList.push({
            x: b.x + 4,
            y: b.y + 4,
            value: val,
            color: val === 5 ? '#3b82f6' : '#22c55e',
            collected: false
          });
        } else if (Math.random() < 0.3) {
          this.heartsList.push({ x: b.x + 4, y: b.y + 4, collected: false });
        }
      }
    });

    // Hit enemies
    this.enemies.forEach(en => {
      if (en.hp > 0 && Math.hypot(en.x + 8 - hitX, en.y + 8 - hitY) < 18) {
        en.hp--;
        gbaAudio.playPokemonAttack('tackle');
        if (en.hp <= 0) {
          this.link.rupees += 10;
          this.rupeesList.push({ x: en.x + 4, y: en.y + 4, value: 5, color: '#3b82f6', collected: false });
          this.onStatsUpdate?.(this.link.hearts, this.link.rupees, this.link.keys);
        }
      }
    });

    // Open Chest
    if (!this.chest.opened && Math.hypot(this.chest.x + 8 - hitX, this.chest.y + 8 - hitY) < 20) {
      this.chest.opened = true;
      this.isChestFanfare = true;
      this.fanfareTimer = 60;
      this.link.rupees += 100;
      this.link.maxHearts = 8;
      this.link.hearts = 8;
      this.messageText = 'You got a Heart Container & 100 Rupees!';
      gbaAudio.playZeldaChestFanfare();
      saveZeldaScore('LNK', this.link.rupees, 'Heart Container Found ★ Minish Cap');
      this.onStatsUpdate?.(this.link.hearts, this.link.rupees, this.link.keys);
    }
  }

  private update() {
    if (this.link.hearts <= 0) return;

    if (this.link.invincibleTimer > 0) this.link.invincibleTimer--;

    if (this.isChestFanfare) {
      this.fanfareTimer--;
      if (this.fanfareTimer <= 0) this.isChestFanfare = false;
    }

    if (this.link.isAttacking) {
      this.link.attackTimer--;
      if (this.link.attackTimer <= 0) this.link.isAttacking = false;
      return;
    }

    if (this.link.isRolling) {
      this.link.rollTimer--;
      const speed = 2.8;
      if (this.link.dir === 'UP') this.link.y -= speed;
      if (this.link.dir === 'DOWN') this.link.y += speed;
      if (this.link.dir === 'LEFT') this.link.x -= speed;
      if (this.link.dir === 'RIGHT') this.link.x += speed;

      if (this.link.rollTimer <= 0) this.link.isRolling = false;
    } else {
      // Normal 4-directional movement
      const speed = 1.4;
      if (this.keys.up) { this.link.y -= speed; this.link.dir = 'UP'; }
      if (this.keys.down) { this.link.y += speed; this.link.dir = 'DOWN'; }
      if (this.keys.left) { this.link.x -= speed; this.link.dir = 'LEFT'; }
      if (this.keys.right) { this.link.x += speed; this.link.dir = 'RIGHT'; }
    }

    // Constrain inside room
    this.link.x = Math.max(20, Math.min(210, this.link.x));
    this.link.y = Math.max(30, Math.min(135, this.link.y));

    // Collect rupees
    this.rupeesList.forEach(r => {
      if (!r.collected && Math.hypot(this.link.x - r.x, this.link.y - r.y) < 12) {
        r.collected = true;
        this.link.rupees += r.value;
        gbaAudio.playZeldaRupee();
        this.onStatsUpdate?.(this.link.hearts, this.link.rupees, this.link.keys);
      }
    });

    // Collect hearts
    this.heartsList.forEach(h => {
      if (!h.collected && Math.hypot(this.link.x - h.x, this.link.y - h.y) < 12) {
        h.collected = true;
        this.link.hearts = Math.min(this.link.maxHearts, this.link.hearts + 2);
        gbaAudio.playMarioPowerup();
        this.onStatsUpdate?.(this.link.hearts, this.link.rupees, this.link.keys);
      }
    });

    // Update Enemies & collision
    this.enemies.forEach(en => {
      if (en.hp <= 0) return;

      en.timer++;
      en.x += en.vx;
      en.y += en.vy;

      if (en.x < 30 || en.x > 200) en.vx *= -1;
      if (en.y < 30 || en.y > 130) en.vy *= -1;

      // Hurt Link
      if (this.link.invincibleTimer <= 0 && !this.link.isRolling && Math.hypot(this.link.x - en.x, this.link.y - en.y) < 12) {
        this.link.hearts--;
        this.link.invincibleTimer = 40;
        gbaAudio.playPokemonAttack('tackle');
        this.onStatsUpdate?.(this.link.hearts, this.link.rupees, this.link.keys);
      }
    });
  }

  public render() {
    this.update();
    const ctx = this.ctx;

    // Room Floor (Hyrule Temple / Courtyard Green Stone Tiles)
    ctx.fillStyle = '#1e3a2b';
    ctx.fillRect(0, 0, 240, 160);

    // Stone border walls
    ctx.fillStyle = '#475569';
    ctx.fillRect(0, 0, 240, 20);
    ctx.fillRect(0, 146, 240, 14);
    ctx.fillRect(0, 0, 16, 160);
    ctx.fillRect(224, 0, 16, 160);

    // Wall bricks pattern
    ctx.fillStyle = '#64748b';
    for (let x = 16; x < 224; x += 16) {
      ctx.fillRect(x, 16, 16, 2);
    }

    // Bushes
    this.bushes.forEach(b => {
      if (b.cut) {
        ctx.fillStyle = '#15803d';
        ctx.fillRect(b.x + 2, b.y + 6, 12, 4);
      } else {
        ctx.fillStyle = '#16a34a';
        ctx.beginPath();
        ctx.arc(b.x + 8, b.y + 8, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#22c55e';
        ctx.beginPath();
        ctx.arc(b.x + 6, b.y + 6, 4, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    // Treasure Chest
    ctx.fillStyle = this.chest.opened ? '#92400e' : '#f59e0b';
    ctx.fillRect(this.chest.x, this.chest.y, 16, 14);
    ctx.strokeStyle = '#000000';
    ctx.strokeRect(this.chest.x, this.chest.y, 16, 14);
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(this.chest.x + 6, this.chest.y + 5, 4, 4);

    // Render Rupees
    this.rupeesList.forEach(r => {
      if (r.collected) return;
      ctx.fillStyle = r.color;
      ctx.beginPath();
      ctx.moveTo(r.x + 4, r.y);
      ctx.lineTo(r.x + 7, r.y + 4);
      ctx.lineTo(r.x + 4, r.y + 8);
      ctx.lineTo(r.x + 1, r.y + 4);
      ctx.closePath();
      ctx.fill();
    });

    // Render Hearts
    this.heartsList.forEach(h => {
      if (h.collected) return;
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(h.x + 3, h.y + 3, 3, Math.PI, 0);
      ctx.arc(h.x + 7, h.y + 3, 3, Math.PI, 0);
      ctx.lineTo(h.x + 5, h.y + 9);
      ctx.closePath();
      ctx.fill();
    });

    // Render Enemies
    this.enemies.forEach(en => {
      if (en.hp <= 0) return;
      if (en.type === 'octorok') {
        ctx.fillStyle = '#dc2626'; // Red Octorok
        ctx.beginPath();
        ctx.arc(en.x + 7, en.y + 7, 6, 0, Math.PI * 2);
        ctx.fill();
        // Snout
        ctx.fillStyle = '#991b1b';
        ctx.fillRect(en.x + 5, en.y + 8, 4, 4);
      } else if (en.type === 'keese') {
        ctx.fillStyle = '#7c3aed'; // Purple Keese Bat
        ctx.beginPath();
        ctx.arc(en.x + 6, en.y + 6, 4, 0, Math.PI * 2);
        ctx.fill();
        // Wings
        ctx.fillRect(en.x - 2, en.y + 4, 4, 2);
        ctx.fillRect(en.x + 10, en.y + 4, 4, 2);
      } else {
        // Moblin (Orange spear guard)
        ctx.fillStyle = '#ea580c';
        ctx.fillRect(en.x + 2, en.y + 2, 10, 12);
        ctx.fillStyle = '#cbd5e1';
        ctx.fillRect(en.x + 10, en.y - 2, 2, 16);
      }
    });

    // Render Link
    const lx = this.link.x;
    const ly = this.link.y;

    if (this.link.invincibleTimer % 4 < 2) {
      // Green Cap & Tunic
      ctx.fillStyle = '#15803d'; // Green
      ctx.fillRect(lx - 4, ly - 6, 8, 10);
      // Cap tip (Ezlo style!)
      ctx.fillStyle = '#16a34a';
      if (this.link.dir === 'LEFT') ctx.fillRect(lx + 2, ly - 8, 4, 3);
      else ctx.fillRect(lx - 6, ly - 8, 4, 3);

      // Blond Hair & Face
      ctx.fillStyle = '#fde047';
      ctx.fillRect(lx - 3, ly - 5, 6, 3);
      ctx.fillStyle = '#fcd34d';
      ctx.fillRect(lx - 3, ly - 2, 6, 3);

      // Sword Swing Effect
      if (this.link.isAttacking) {
        ctx.fillStyle = '#e2e8f0';
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1;

        if (this.link.dir === 'UP') {
          ctx.fillRect(lx - 2, ly - 14, 4, 10);
        } else if (this.link.dir === 'DOWN') {
          ctx.fillRect(lx - 2, ly + 4, 4, 10);
        } else if (this.link.dir === 'LEFT') {
          ctx.fillRect(lx - 14, ly - 2, 10, 4);
        } else {
          ctx.fillRect(lx + 4, ly - 2, 10, 4);
        }
      }
    }

    // Top Zelda HUD (Hearts, Rupees, Keys)
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, 240, 16);

    // Hearts (Red / White containers)
    for (let h = 0; h < this.link.maxHearts; h += 2) {
      const hx = 6 + (h / 2) * 9;
      const isFull = this.link.hearts >= h + 2;
      const isHalf = this.link.hearts === h + 1;
      ctx.fillStyle = isFull ? '#ef4444' : isHalf ? '#f87171' : '#475569';
      ctx.beginPath();
      ctx.arc(hx + 2, 8, 2.5, Math.PI, 0);
      ctx.arc(hx + 5, 8, 2.5, Math.PI, 0);
      ctx.lineTo(hx + 3.5, 13);
      ctx.closePath();
      ctx.fill();
    }

    // Rupee counter
    ctx.fillStyle = '#22c55e';
    ctx.beginPath();
    ctx.moveTo(110, 5);
    ctx.lineTo(113, 8);
    ctx.lineTo(110, 11);
    ctx.lineTo(107, 8);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = '6px "Press Start 2P", monospace';
    ctx.fillText(`${this.link.rupees.toString().padStart(3, '0')}`, 118, 11);

    // Keys
    ctx.fillStyle = '#f59e0b';
    ctx.fillText(`KEY: ${this.link.keys}`, 175, 11);

    // Fanfare / Banner notification
    if (this.isChestFanfare) {
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.fillRect(10, 60, 220, 36);
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2;
      ctx.strokeRect(10, 60, 220, 36);

      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 7px "Press Start 2P", monospace';
      ctx.fillText('TREASURE OPENED!', 48, 74);
      ctx.fillStyle = '#ffffff';
      ctx.font = '5px "Press Start 2P", monospace';
      ctx.fillText(this.messageText, 14, 87);
    }
  }

  private startLoop() {
    this.isRunning = true;
    const loop = () => {
      if (!this.isRunning) return;
      this.render();
      this.animId = requestAnimationFrame(loop);
    };
    this.animId = requestAnimationFrame(loop);
  }

  public destroy() {
    this.isRunning = false;
    cancelAnimationFrame(this.animId);
  }
}
