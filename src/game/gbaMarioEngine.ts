/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Super Mario Advance 4 GBA Engine (240x160 32-bit Game Boy Advance Platformer)
 */

import { gbaAudio } from './gbaAudio';
import { saveMarioAdvanceScore } from './gbaHighScores';

export class GbaMarioEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private animId: number = 0;
  private isRunning: boolean = false;

  // Game state
  public score: number = 0;
  public coins: number = 0;
  public lives: number = 3;
  public world: string = '1-1';
  public isGameOver: boolean = false;
  public isLevelClear: boolean = false;

  // Mario physics & state
  public mario = {
    x: 30,
    y: 110,
    vx: 0,
    vy: 0,
    width: 12,
    height: 16,
    isGrounded: false,
    isSuper: false,
    isSpinning: false,
    spinAngle: 0,
    facing: 'RIGHT' as 'LEFT' | 'RIGHT',
    invincibleTimer: 0
  };

  // Level & Entities
  public cameraX: number = 0;
  public levelWidth: number = 2400;

  // Blocks & items
  public blocks: { x: number; y: number; type: 'brick' | 'question' | 'ground' | 'pipe'; hit: boolean; hasCoin?: boolean; hasMushroom?: boolean }[] = [];
  public coinsList: { x: number; y: number; collected: boolean }[] = [];
  public enemies: { x: number; y: number; vx: number; type: 'goomba' | 'koopa'; alive: boolean; squishedTimer: number }[] = [];
  public particles: { x: number; y: number; vx: number; vy: number; color: string; life: number }[] = [];
  public flagPoleX: number = 2250;

  // Inputs
  private keys = {
    left: false,
    right: false,
    up: false,
    down: false,
    a: false,
    b: false,
    start: false,
    select: false
  };

  public onScoreUpdate?: (score: number, coins: number, lives: number) => void;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { alpha: false })!;
  }

  public init() {
    this.canvas.width = 240;
    this.canvas.height = 160;
    this.resetLevel();
    this.startLoop();
  }

  public resetLevel() {
    this.cameraX = 0;
    this.mario.x = 30;
    this.mario.y = 110;
    this.mario.vx = 0;
    this.mario.vy = 0;
    this.mario.isGrounded = false;
    this.mario.isSuper = false;
    this.isGameOver = false;
    this.isLevelClear = false;

    // Generate Blocks
    this.blocks = [];
    // Ground
    for (let x = 0; x < this.levelWidth; x += 16) {
      if (x > 350 && x < 390) continue; // Pit gap
      if (x > 700 && x < 750) continue; // Pit gap 2
      this.blocks.push({ x, y: 136, type: 'ground', hit: false });
      this.blocks.push({ x, y: 152, type: 'ground', hit: false });
    }

    // Question blocks and Bricks
    const blockDefs: [number, number, 'brick' | 'question', boolean, boolean][] = [
      [80, 88, 'question', true, false],
      [112, 88, 'brick', false, false],
      [128, 88, 'question', false, true], // mushroom
      [144, 88, 'brick', true, false],
      [160, 88, 'question', true, false],
      [220, 56, 'brick', true, false],
      [236, 56, 'question', false, true],
      [252, 56, 'brick', true, false],
      [420, 88, 'brick', true, false],
      [436, 88, 'question', true, false],
      [452, 88, 'brick', true, false],
      [550, 70, 'question', true, false],
      [580, 70, 'question', true, false],
      [610, 70, 'question', true, false],
      [800, 88, 'brick', true, false],
      [816, 88, 'brick', true, false],
      [832, 88, 'question', false, true]
    ];

    blockDefs.forEach(([x, y, type, hasCoin, hasMushroom]) => {
      this.blocks.push({ x, y, type, hit: false, hasCoin, hasMushroom });
    });

    // Pipes
    const pipeX = [180, 300, 500, 660, 920];
    pipeX.forEach(px => {
      this.blocks.push({ x: px, y: 104, type: 'pipe', hit: false });
      this.blocks.push({ x: px, y: 120, type: 'pipe', hit: false });
    });

    // Floating coins
    this.coinsList = [
      { x: 90, y: 70, collected: false },
      { x: 106, y: 70, collected: false },
      { x: 228, y: 38, collected: false },
      { x: 244, y: 38, collected: false },
      { x: 480, y: 100, collected: false },
      { x: 496, y: 100, collected: false },
      { x: 512, y: 100, collected: false }
    ];

    // Enemies
    this.enemies = [
      { x: 140, y: 120, vx: -0.6, type: 'goomba', alive: true, squishedTimer: 0 },
      { x: 260, y: 120, vx: -0.6, type: 'goomba', alive: true, squishedTimer: 0 },
      { x: 330, y: 120, vx: -0.8, type: 'koopa', alive: true, squishedTimer: 0 },
      { x: 470, y: 120, vx: -0.6, type: 'goomba', alive: true, squishedTimer: 0 },
      { x: 600, y: 120, vx: -0.8, type: 'koopa', alive: true, squishedTimer: 0 },
      { x: 790, y: 120, vx: -0.6, type: 'goomba', alive: true, squishedTimer: 0 },
      { x: 860, y: 120, vx: -0.8, type: 'koopa', alive: true, squishedTimer: 0 }
    ];

    this.particles = [];
  }

  public setInput(input: Partial<typeof this.keys>) {
    const prevA = this.keys.a;
    const prevB = this.keys.b;
    this.keys = { ...this.keys, ...input };

    if (this.isGameOver || this.isLevelClear) {
      if (this.keys.start || this.keys.a) {
        this.resetLevel();
      }
      return;
    }

    // Jump (A)
    if (this.keys.a && !prevA && this.mario.isGrounded) {
      this.mario.vy = -6.2;
      this.mario.isGrounded = false;
      this.mario.isSpinning = false;
      gbaAudio.playMarioJump();
    }

    // Spin Jump (B + A or dedicated B spin)
    if (this.keys.b && !prevB && this.mario.isGrounded) {
      this.mario.vy = -5.5;
      this.mario.isGrounded = false;
      this.mario.isSpinning = true;
      this.mario.spinAngle = 0;
      gbaAudio.playMarioJump();
    }
  }

  private update() {
    if (this.isGameOver || this.isLevelClear) return;

    // Movement & Acceleration
    const maxSpeed = this.keys.b ? 2.8 : 2.0;
    const accel = 0.2;
    const friction = 0.85;

    if (this.keys.left) {
      this.mario.vx = Math.max(-maxSpeed, this.mario.vx - accel);
      this.mario.facing = 'LEFT';
    } else if (this.keys.right) {
      this.mario.vx = Math.min(maxSpeed, this.mario.vx + accel);
      this.mario.facing = 'RIGHT';
    } else {
      this.mario.vx *= friction;
      if (Math.abs(this.mario.vx) < 0.05) this.mario.vx = 0;
    }

    // Gravity
    this.mario.vy += 0.32;
    if (this.mario.vy > 6) this.mario.vy = 6;

    // Apply X position & block collisions
    this.mario.x += this.mario.vx;
    this.mario.x = Math.max(0, Math.min(this.levelWidth, this.mario.x));

    // Apply Y position & block collisions
    this.mario.y += this.mario.vy;
    this.mario.isGrounded = false;

    if (this.mario.isSpinning) {
      this.mario.spinAngle += 0.35;
    }

    // Check block collisions
    const mLeft = this.mario.x;
    const mRight = this.mario.x + this.mario.width;
    const mTop = this.mario.y;
    const mBottom = this.mario.y + (this.mario.isSuper ? 22 : 16);

    for (const b of this.blocks) {
      const bLeft = b.x;
      const bRight = b.x + 16;
      const bTop = b.y;
      const bBottom = b.y + 16;

      // Check overlap
      if (mRight > bLeft && mLeft < bRight && mBottom > bTop && mTop < bBottom) {
        // Landing on top
        if (this.mario.vy > 0 && mBottom - this.mario.vy <= bTop + 4) {
          this.mario.y = bTop - (this.mario.isSuper ? 22 : 16);
          this.mario.vy = 0;
          this.mario.isGrounded = true;
          this.mario.isSpinning = false;
        }
        // Hitting from bottom
        else if (this.mario.vy < 0 && mTop - this.mario.vy >= bBottom - 6) {
          this.mario.y = bBottom;
          this.mario.vy = 0;

          if (!b.hit) {
            b.hit = true;
            if (b.hasCoin) {
              this.coins++;
              this.score += 200;
              gbaAudio.playMarioCoin();
              this.onScoreUpdate?.(this.score, this.coins, this.lives);
            } else if (b.hasMushroom) {
              this.mario.isSuper = true;
              this.score += 1000;
              gbaAudio.playMarioPowerup();
              this.onScoreUpdate?.(this.score, this.coins, this.lives);
            } else if (b.type === 'brick') {
              gbaAudio.playMarioJump();
              // Brick smash particles
              for (let p = 0; p < 4; p++) {
                this.particles.push({
                  x: b.x + 8,
                  y: b.y + 8,
                  vx: (Math.random() - 0.5) * 4,
                  vy: -Math.random() * 4 - 2,
                  color: '#b45309',
                  life: 20
                });
              }
            }
          }
        }
      }
    }

    // Collect floating coins
    for (const c of this.coinsList) {
      if (!c.collected && Math.hypot(this.mario.x + 6 - c.x, this.mario.y + 8 - c.y) < 14) {
        c.collected = true;
        this.coins++;
        this.score += 200;
        gbaAudio.playMarioCoin();
        this.onScoreUpdate?.(this.score, this.coins, this.lives);
      }
    }

    // Pit fall check
    if (this.mario.y > 170) {
      this.lives--;
      gbaAudio.playPokemonAttack('tackle');
      if (this.lives <= 0) {
        this.isGameOver = true;
        saveMarioAdvanceScore('MAR', this.score, `World ${this.world} | Coins: ${this.coins}`);
      } else {
        this.mario.x = Math.max(20, this.cameraX + 20);
        this.mario.y = 80;
        this.mario.vy = 0;
      }
      this.onScoreUpdate?.(this.score, this.coins, this.lives);
    }

    // Enemy AI & Collision
    for (const en of this.enemies) {
      if (!en.alive) {
        if (en.squishedTimer > 0) en.squishedTimer--;
        continue;
      }

      en.x += en.vx;
      if (en.x < 10 || en.x > this.levelWidth) en.vx *= -1;

      // Check collision with Mario
      const enLeft = en.x;
      const enRight = en.x + 14;
      const enTop = en.y;
      const enBottom = en.y + 14;

      if (mRight > enLeft && mLeft < enRight && mBottom > enTop && mTop < enBottom) {
        // Stomp from above
        if (this.mario.vy > 0 && mBottom <= enTop + 8) {
          en.alive = false;
          en.squishedTimer = 25;
          this.mario.vy = -4.5; // Bounce
          this.score += 500;
          gbaAudio.playMarioJump();
          this.onScoreUpdate?.(this.score, this.coins, this.lives);
        } else {
          // Mario hurt
          if (this.mario.isSuper) {
            this.mario.isSuper = false;
            this.mario.invincibleTimer = 40;
            gbaAudio.playPokemonAttack('tackle');
          } else if (this.mario.invincibleTimer <= 0) {
            this.lives--;
            gbaAudio.playPokemonAttack('tackle');
            if (this.lives <= 0) {
              this.isGameOver = true;
              saveMarioAdvanceScore('MAR', this.score, `World ${this.world} | Coins: ${this.coins}`);
            } else {
              this.mario.x = Math.max(20, this.cameraX + 20);
              this.mario.y = 80;
            }
            this.onScoreUpdate?.(this.score, this.coins, this.lives);
          }
        }
      }
    }

    // Flagpole Goal Clear
    if (this.mario.x >= this.flagPoleX && !this.isLevelClear) {
      this.isLevelClear = true;
      this.score += 5000;
      gbaAudio.playZeldaChestFanfare();
      saveMarioAdvanceScore('MAR', this.score, `World ${this.world} Clear ★ Coins: ${this.coins}`);
      this.onScoreUpdate?.(this.score, this.coins, this.lives);
    }

    // Camera follow Mario smoothly
    const targetCamX = Math.max(0, Math.min(this.levelWidth - 240, this.mario.x - 100));
    this.cameraX += (targetCamX - this.cameraX) * 0.15;

    // Update particles
    this.particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.2;
      p.life--;
    });
    this.particles = this.particles.filter(p => p.life > 0);
  }

  public render() {
    this.update();
    const ctx = this.ctx;
    const cam = Math.floor(this.cameraX);

    // GBA Super Mario 32-bit Sky Gradient (Rich vivid cyan blue)
    const sky = ctx.createLinearGradient(0, 0, 0, 160);
    sky.addColorStop(0, '#38bdf8');
    sky.addColorStop(0.7, '#7dd3fc');
    sky.addColorStop(1, '#bae6fd');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, 240, 160);

    // Parallax rolling hills (back layer)
    ctx.fillStyle = '#86efac';
    for (let h = -cam * 0.3; h < 300; h += 90) {
      ctx.beginPath();
      ctx.arc(h + 40, 150, 50, Math.PI, 0);
      ctx.fill();
    }

    // Parallax clouds
    ctx.fillStyle = '#ffffff';
    for (let c = -cam * 0.5; c < 300; c += 120) {
      ctx.beginPath();
      ctx.arc(c + 30, 30, 12, 0, Math.PI * 2);
      ctx.arc(c + 42, 26, 16, 0, Math.PI * 2);
      ctx.arc(c + 54, 30, 12, 0, Math.PI * 2);
      ctx.fill();
    }

    // Render Blocks
    for (const b of this.blocks) {
      const bx = b.x - cam;
      if (bx < -20 || bx > 260) continue;

      if (b.type === 'ground') {
        ctx.fillStyle = '#f97316'; // orange-brown soil
        ctx.fillRect(bx, b.y, 16, 16);
        ctx.fillStyle = '#22c55e'; // green grass cap
        ctx.fillRect(bx, b.y, 16, 4);
        ctx.fillStyle = '#15803d';
        ctx.fillRect(bx + 2, b.y + 4, 3, 2);
        ctx.fillRect(bx + 10, b.y + 4, 3, 2);
      } else if (b.type === 'brick') {
        ctx.fillStyle = '#b45309';
        ctx.fillRect(bx, b.y, 16, 16);
        ctx.fillStyle = '#000000';
        ctx.strokeRect(bx, b.y, 16, 16);
        ctx.fillRect(bx + 1, b.y + 7, 14, 1);
        ctx.fillRect(bx + 7, b.y + 1, 1, 6);
        ctx.fillRect(bx + 7, b.y + 8, 1, 7);
      } else if (b.type === 'question') {
        ctx.fillStyle = b.hit ? '#9ca3af' : '#eab308';
        ctx.fillRect(bx, b.y, 16, 16);
        ctx.fillStyle = '#000000';
        ctx.strokeRect(bx, b.y, 16, 16);
        if (!b.hit) {
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 8px "Press Start 2P", monospace';
          ctx.fillText('?', bx + 4, b.y + 12);
        }
      } else if (b.type === 'pipe') {
        ctx.fillStyle = '#16a34a';
        ctx.fillRect(bx, b.y, 16, 16);
        ctx.fillStyle = '#4ade80';
        ctx.fillRect(bx + 2, b.y, 4, 16);
        ctx.fillStyle = '#14532d';
        ctx.fillRect(bx + 13, b.y, 3, 16);
      }
    }

    // Render Floating Coins
    for (const c of this.coinsList) {
      if (c.collected) continue;
      const cx = c.x - cam;
      if (cx < -10 || cx > 250) continue;

      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.ellipse(cx + 6, c.y + 8, 4, 6, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ca8a04';
      ctx.stroke();
    }

    // Render Flagpole
    const fx = this.flagPoleX - cam;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(fx + 6, 40, 4, 96);
    ctx.fillStyle = '#eab308';
    ctx.beginPath();
    ctx.arc(fx + 8, 38, 5, 0, Math.PI * 2);
    ctx.fill();
    // Green flag
    ctx.fillStyle = '#22c55e';
    ctx.beginPath();
    ctx.moveTo(fx + 6, 42);
    ctx.lineTo(fx - 14, 52);
    ctx.lineTo(fx + 6, 62);
    ctx.fill();

    // Render Enemies
    for (const en of this.enemies) {
      const ex = en.x - cam;
      if (ex < -20 || ex > 260) continue;

      if (en.alive) {
        if (en.type === 'goomba') {
          ctx.fillStyle = '#92400e';
          ctx.beginPath();
          ctx.arc(ex + 7, en.y + 7, 7, Math.PI, 0);
          ctx.fill();
          ctx.fillRect(ex + 1, en.y + 7, 12, 6);
          // Eyes
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(ex + 3, en.y + 4, 3, 4);
          ctx.fillRect(ex + 8, en.y + 4, 3, 4);
          ctx.fillStyle = '#000000';
          ctx.fillRect(ex + 4, en.y + 6, 2, 2);
          ctx.fillRect(ex + 8, en.y + 6, 2, 2);
        } else {
          // Koopa Troopa (Green shell)
          ctx.fillStyle = '#22c55e';
          ctx.beginPath();
          ctx.arc(ex + 7, en.y + 7, 6, 0, Math.PI * 2);
          ctx.fill();
          // Yellow head
          ctx.fillStyle = '#fde047';
          ctx.fillRect(ex + 10, en.y + 2, 5, 5);
        }
      } else if (en.squishedTimer > 0) {
        // Flat squished sprite
        ctx.fillStyle = '#92400e';
        ctx.fillRect(ex, en.y + 10, 14, 4);
      }
    }

    // Render Particles
    for (const p of this.particles) {
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x - cam, p.y, 3, 3);
    }

    // Render Mario
    const mx = this.mario.x - cam;
    const my = this.mario.y;
    const h = this.mario.isSuper ? 22 : 16;

    ctx.save();
    if (this.mario.isSpinning) {
      ctx.translate(mx + 6, my + 8);
      ctx.rotate(this.mario.spinAngle);
      ctx.translate(-(mx + 6), -(my + 8));
    }

    // Red Hat & Shirt
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(mx + 2, my, 8, 4);
    ctx.fillRect(mx + 1, my + 7, 10, 5);

    // Blue Overalls
    ctx.fillStyle = '#2563eb';
    ctx.fillRect(mx + 2, my + 11, 8, h - 11);

    // Face / Mustache
    ctx.fillStyle = '#fcd34d'; // skin
    ctx.fillRect(mx + 2, my + 4, 8, 3);
    ctx.fillStyle = '#000000'; // mustache
    ctx.fillRect(this.mario.facing === 'RIGHT' ? mx + 6 : mx + 2, my + 5, 4, 2);

    ctx.restore();

    // Top GBA HUD (World, Score, Coins, Lives)
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, 240, 16);
    ctx.fillStyle = '#ffffff';
    ctx.font = '6px "Press Start 2P", monospace';
    ctx.fillText('MARIO', 8, 11);
    ctx.fillText(this.score.toString().padStart(6, '0'), 46, 11);
    ctx.fillStyle = '#facc15';
    ctx.fillText(`● x${this.coins.toString().padStart(2, '0')}`, 120, 11);
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`WORLD ${this.world}`, 165, 11);

    // Overlay Game Over / Stage Clear
    if (this.isGameOver) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
      ctx.fillRect(0, 0, 240, 160);
      ctx.fillStyle = '#ef4444';
      ctx.font = '10px "Press Start 2P", monospace';
      ctx.fillText('GAME OVER', 65, 75);
      ctx.fillStyle = '#ffffff';
      ctx.font = '6px "Press Start 2P", monospace';
      ctx.fillText('Press START or A to Retry', 35, 100);
    } else if (this.isLevelClear) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
      ctx.fillRect(0, 0, 240, 160);
      ctx.fillStyle = '#22c55e';
      ctx.font = '10px "Press Start 2P", monospace';
      ctx.fillText('COURSE CLEAR!', 45, 75);
      ctx.fillStyle = '#facc15';
      ctx.font = '6px "Press Start 2P", monospace';
      ctx.fillText(`FINAL SCORE: ${this.score}`, 48, 98);
      ctx.fillText('Press START to Replay!', 45, 115);
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
