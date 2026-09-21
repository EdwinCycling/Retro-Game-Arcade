/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Double Dragon (1987 / Technos Japan) - Authentic 320x224 Arcade Pixel Art Renderer
 */

import { DoubleDragonEngine, Fighter, Barrel } from './doubleDragonEngine';

export class DoubleDragonRenderer {
  public render(ctx: CanvasRenderingContext2D, engine: DoubleDragonEngine) {
    const w = engine.viewWidth;
    const h = engine.viewHeight;

    // 1. Draw 1987 Street Scenery (Background)
    this.renderStageBackground(ctx, engine);

    // 2. Sort all ground objects by Y depth (Pseudo-Isometric sorting)
    type Renderable = { type: 'fighter'; item: Fighter } | { type: 'barrel'; item: Barrel };
    const items: Renderable[] = [
      { type: 'fighter', item: engine.player },
      ...engine.enemies.map(e => ({ type: 'fighter' as const, item: e })),
      ...engine.barrels.map(b => ({ type: 'barrel' as const, item: b }))
    ];

    items.sort((a, b) => a.item.y - b.item.y);

    // 3. Render all entities in depth order
    items.forEach(obj => {
      if (obj.type === 'fighter') {
        this.renderFighter(ctx, obj.item);
      } else {
        this.renderBarrel(ctx, obj.item);
      }
    });

    // 4. Render Hit Sparks and Debris
    this.renderHitSparks(ctx, engine);

    // 5. Render Classic 1987 Arcade HUD
    this.renderHUD(ctx, engine);

    // 6. Game Over / Stage Clear Overlay
    if (engine.state === 'GAME_OVER') {
      this.renderGameOver(ctx, engine);
    }
  }

  private renderStageBackground(ctx: CanvasRenderingContext2D, engine: DoubleDragonEngine) {
    const w = engine.viewWidth;

    // Sky gradient (New York dusk purple/indigo)
    const skyGrad = ctx.createLinearGradient(0, 0, 0, 80);
    skyGrad.addColorStop(0, '#1c1033');
    skyGrad.addColorStop(1, '#4a2558');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, w, 80);

    // Distant City Skyline Silhouettes
    ctx.fillStyle = '#181226';
    ctx.fillRect(20, 35, 30, 45);
    ctx.fillRect(60, 20, 25, 60);
    ctx.fillRect(110, 40, 40, 40);
    ctx.fillRect(180, 25, 35, 55);
    ctx.fillRect(240, 32, 50, 48);

    // Distant window lights (yellow specs)
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(66, 30, 3, 3);
    ctx.fillRect(72, 38, 3, 3);
    ctx.fillRect(190, 35, 3, 3);
    ctx.fillRect(198, 48, 3, 3);
    ctx.fillRect(255, 45, 3, 3);

    // Brick Slum Tenements (Midground)
    ctx.fillStyle = '#5c2c20'; // Reddish brick
    ctx.fillRect(0, 70, w, 68);

    // Brick pattern lines
    ctx.fillStyle = '#3a1a12';
    for (let y = 74; y < 136; y += 8) {
      ctx.fillRect(0, y, w, 1);
    }

    // Garage Rolling Shutter Door (Iconic opening scene)
    ctx.fillStyle = '#475569';
    ctx.fillRect(40, 75, 75, 63);
    // Garage shutter horizontal slats
    ctx.fillStyle = '#1e293b';
    for (let sy = 78; sy < 138; sy += 4) {
      ctx.fillRect(40, sy, 75, 1);
    }
    // Shutter frame
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2;
    ctx.strokeRect(40, 75, 75, 63);

    // Graffiti on garage door ("BLACK WARRIORS")
    ctx.fillStyle = '#dc2626';
    ctx.font = 'bold 8px monospace';
    ctx.fillText('WARRIORS', 48, 98);

    // Fire Escape Staircase (right side)
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(220, 72, 4, 66);
    ctx.fillRect(270, 72, 4, 66);
    for (let fy = 80; fy < 138; fy += 14) {
      ctx.fillRect(220, fy, 54, 2);
    }

    // Street Curb Border (Upper)
    ctx.fillStyle = '#64748b';
    ctx.fillRect(0, 138, w, 4);
    ctx.fillStyle = '#334155';
    ctx.fillRect(0, 142, w, 2);

    // Asphalt Street Surface
    ctx.fillStyle = '#1e232a';
    ctx.fillRect(0, 144, w, 80);

    // Street Details: Yellow lane lines & Sewer Grates
    ctx.fillStyle = '#ca8a04';
    ctx.fillRect(30, 175, 35, 2);
    ctx.fillRect(110, 175, 35, 2);
    ctx.fillRect(190, 175, 35, 2);
    ctx.fillRect(270, 175, 35, 2);

    // Sewer manhole cover
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.ellipse(150, 202, 16, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#334155';
    ctx.stroke();
  }

  private renderFighter(ctx: CanvasRenderingContext2D, f: Fighter) {
    if (f.action === 'dead') return;

    // Invincibility flashing
    if (f.invincibleTimer > 0 && Math.floor(f.invincibleTimer / 4) % 2 === 0) {
      return;
    }

    const groundX = f.x;
    const groundY = f.y;
    const drawY = groundY - f.z;

    // Drop Shadow on Asphalt
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.beginPath();
    ctx.ellipse(groundX, groundY, 14, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.save();
    ctx.translate(groundX, drawY);
    ctx.scale(f.facing, 1);

    if (f.isPlayer) {
      this.drawBillyLee(ctx, f);
    } else {
      this.drawEnemy(ctx, f);
    }

    ctx.restore();
  }

  private drawBillyLee(ctx: CanvasRenderingContext2D, f: Fighter) {
    // Billy Lee Colors: Blue Gi, Red Belt, Tan Skin, Brown Spiky Hair
    const cSkin = '#fcd34d';
    const cHair = '#78350f';
    const cGi = '#2563eb';
    const cGiDark = '#1d4ed8';
    const cBelt = '#dc2626';
    const cBoots = '#f8fafc';

    const act = f.action;

    if (act === 'knockdown') {
      // Knocked down horizontal on ground
      ctx.fillStyle = cHair;
      ctx.fillRect(-22, -8, 8, 8);
      ctx.fillStyle = cSkin;
      ctx.fillRect(-14, -7, 6, 6);
      ctx.fillStyle = cGi;
      ctx.fillRect(-8, -9, 18, 9);
      ctx.fillStyle = cBelt;
      ctx.fillRect(0, -9, 3, 9);
      ctx.fillStyle = cBoots;
      ctx.fillRect(10, -7, 6, 6);
      return;
    }

    // 1. Spiky Brown Martial Arts Hair & Head
    ctx.fillStyle = cHair;
    ctx.fillRect(-6, -38, 12, 6);
    ctx.fillRect(-8, -36, 4, 4); // Spikes
    ctx.fillRect(4, -36, 4, 4);

    // Face / Head
    ctx.fillStyle = cSkin;
    ctx.fillRect(-5, -32, 10, 8);
    // Eye
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(2, -30, 2, 2);

    // 2. Torso (Blue sleeveless martial arts Gi)
    ctx.fillStyle = cGi;
    ctx.fillRect(-6, -24, 12, 14);

    // Muscular chest V-neck slit
    ctx.fillStyle = cSkin;
    ctx.beginPath();
    ctx.moveTo(-2, -24);
    ctx.lineTo(2, -24);
    ctx.lineTo(0, -18);
    ctx.fill();

    // Red Belt (Obi) with hanging knot
    ctx.fillStyle = cBelt;
    ctx.fillRect(-6, -13, 12, 3);
    ctx.fillRect(2, -10, 2, 6);

    // 3. Legs & Arms based on Action
    if (act === 'punch1' || act === 'punch2') {
      // Punching forward with extended arm
      ctx.fillStyle = cSkin;
      ctx.fillRect(-8, -22, 6, 4); // Back arm
      ctx.fillRect(2, -22, 18, 4); // Punching arm
      ctx.fillStyle = cBoots;
      ctx.fillRect(18, -23, 5, 5); // White wristband & fist

      // Legs in forward lunge stance
      ctx.fillStyle = cGiDark;
      ctx.fillRect(-6, -10, 5, 10);
      ctx.fillRect(2, -10, 6, 10);
      ctx.fillStyle = cBoots;
      ctx.fillRect(-7, 0, 6, 4);
      ctx.fillRect(4, 0, 7, 4);
    } else if (act === 'uppercut') {
      // Uppercut rising arm
      ctx.fillStyle = cSkin;
      ctx.fillRect(0, -32, 5, 14);
      ctx.fillStyle = cBoots;
      ctx.fillRect(0, -36, 6, 6);

      ctx.fillStyle = cGiDark;
      ctx.fillRect(-5, -10, 5, 10);
      ctx.fillRect(2, -10, 5, 10);
      ctx.fillStyle = cBoots;
      ctx.fillRect(-6, 0, 6, 4);
      ctx.fillRect(2, 0, 6, 4);
    } else if (act === 'kick') {
      // High Roundhouse Kick!
      ctx.fillStyle = cSkin;
      ctx.fillRect(-6, -22, 4, 8);
      ctx.fillRect(2, -22, 4, 8);

      // Support leg
      ctx.fillStyle = cGiDark;
      ctx.fillRect(-4, -10, 5, 10);
      ctx.fillStyle = cBoots;
      ctx.fillRect(-5, 0, 6, 4);

      // Extended kicking leg
      ctx.fillStyle = cGiDark;
      ctx.fillRect(2, -18, 16, 5);
      ctx.fillStyle = cBoots;
      ctx.fillRect(18, -20, 6, 6);
    } else if (act === 'elbow') {
      // The Legendary Double Dragon REAR ELBOW SMASH!
      // Torso turned, rear elbow driven backward
      ctx.fillStyle = cSkin;
      ctx.fillRect(-16, -22, 12, 5); // Rear elbow jutting backward!
      ctx.fillStyle = cBoots;
      ctx.fillRect(-17, -23, 5, 6);

      // Impact speed lines behind elbow
      ctx.fillStyle = '#fde047';
      ctx.fillRect(-22, -24, 4, 2);
      ctx.fillRect(-20, -18, 4, 2);

      ctx.fillStyle = cGiDark;
      ctx.fillRect(-5, -10, 5, 10);
      ctx.fillRect(2, -10, 5, 10);
      ctx.fillStyle = cBoots;
      ctx.fillRect(-6, 0, 6, 4);
      ctx.fillRect(2, 0, 6, 4);
    } else if (act === 'jump_kick') {
      // Flying jump side-kick in mid-air
      ctx.fillStyle = cSkin;
      ctx.fillRect(-8, -22, 5, 5);
      ctx.fillStyle = cGiDark;
      ctx.fillRect(-6, -10, 6, 6);
      ctx.fillRect(2, -14, 18, 6); // Horizontal kicking leg
      ctx.fillStyle = cBoots;
      ctx.fillRect(18, -16, 6, 7);
    } else if (act === 'walk') {
      // Animated walking stride
      const frame = Math.floor(Date.now() / 120) % 4;
      const legOff = frame === 0 ? 3 : frame === 2 ? -3 : 0;

      ctx.fillStyle = cSkin;
      ctx.fillRect(-8 - legOff, -22, 4, 8);
      ctx.fillRect(4 + legOff, -22, 4, 8);

      ctx.fillStyle = cGiDark;
      ctx.fillRect(-5 - legOff, -10, 5, 10);
      ctx.fillRect(1 + legOff, -10, 5, 10);
      ctx.fillStyle = cBoots;
      ctx.fillRect(-6 - legOff, 0, 6, 4);
      ctx.fillRect(1 + legOff, 0, 6, 4);
    } else {
      // Idle / Normal stance
      ctx.fillStyle = cSkin;
      ctx.fillRect(-8, -22, 4, 8);
      ctx.fillRect(4, -22, 4, 8);
      ctx.fillStyle = cBoots;
      ctx.fillRect(-9, -16, 4, 4);
      ctx.fillRect(4, -16, 4, 4);

      ctx.fillStyle = cGiDark;
      ctx.fillRect(-5, -10, 5, 10);
      ctx.fillRect(1, -10, 5, 10);
      ctx.fillStyle = cBoots;
      ctx.fillRect(-6, 0, 6, 4);
      ctx.fillRect(1, 0, 6, 4);
    }
  }

  private drawEnemy(ctx: CanvasRenderingContext2D, f: Fighter) {
    const type = f.type || 'williams';

    if (f.action === 'knockdown') {
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(-18, -8, 24, 8);
      return;
    }

    if (type === 'abobo') {
      // Giant Muscular Boss Abobo (Huge frame, bare chest, dark shorts)
      ctx.fillStyle = '#b45309'; // Bald head
      ctx.fillRect(-7, -46, 14, 10);
      ctx.fillStyle = '#78350f'; // Sideburns & beard
      ctx.fillRect(-8, -42, 3, 6);
      ctx.fillRect(5, -42, 3, 6);

      // Huge Torso
      ctx.fillStyle = '#d97706';
      ctx.fillRect(-12, -36, 24, 20);

      // Massive Arms
      ctx.fillStyle = '#b45309';
      ctx.fillRect(-16, -34, 6, 16);
      ctx.fillRect(10, -34, 6, 16);

      // Dark Combat Shorts
      ctx.fillStyle = '#18181b';
      ctx.fillRect(-10, -16, 20, 10);

      // Massive Legs
      ctx.fillStyle = '#d97706';
      ctx.fillRect(-9, -6, 7, 8);
      ctx.fillRect(2, -6, 7, 8);
      ctx.fillStyle = '#3f3f46';
      ctx.fillRect(-10, 0, 8, 5);
      ctx.fillRect(2, 0, 8, 5);
      return;
    }

    if (type === 'linda') {
      // Linda with spiked whip and leotard
      ctx.fillStyle = '#f59e0b'; // Blonde hair
      ctx.fillRect(-6, -36, 12, 6);
      ctx.fillStyle = '#fde68a'; // Face
      ctx.fillRect(-4, -30, 8, 6);
      // Purple leotard
      ctx.fillStyle = '#9333ea';
      ctx.fillRect(-5, -24, 10, 14);
      // Legs with tall boots
      ctx.fillStyle = '#fde68a';
      ctx.fillRect(-4, -10, 4, 6);
      ctx.fillRect(1, -10, 4, 6);
      ctx.fillStyle = '#581c87';
      ctx.fillRect(-5, -4, 5, 8);
      ctx.fillRect(1, -4, 5, 8);

      // Whip in hand
      ctx.strokeStyle = '#dc2626';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(6, -20);
      ctx.quadraticCurveTo(18, -25, 24, -12);
      ctx.stroke();
      return;
    }

    // Default: Williams / Roper Thugs
    const cShirt = type === 'williams' ? '#f59e0b' : '#dc2626'; // Yellow vs Red
    const cPants = type === 'williams' ? '#1d4ed8' : '#15803d'; // Blue jeans vs Green combat

    // Head
    ctx.fillStyle = '#451a03';
    ctx.fillRect(-5, -34, 10, 6); // Dark hair / bandana
    ctx.fillStyle = '#fcd34d';
    ctx.fillRect(-4, -28, 8, 6);

    // Torso (Tank Top)
    ctx.fillStyle = cShirt;
    ctx.fillRect(-5, -22, 10, 12);

    // Arms
    ctx.fillStyle = '#fcd34d';
    if (f.action === 'punch1') {
      ctx.fillRect(2, -20, 14, 4); // Punching arm
      ctx.fillRect(-7, -20, 4, 6);
    } else {
      ctx.fillRect(-7, -20, 4, 8);
      ctx.fillRect(3, -20, 4, 8);
    }

    // Pants & Shoes
    ctx.fillStyle = cPants;
    ctx.fillRect(-5, -10, 4, 10);
    ctx.fillRect(1, -10, 4, 10);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-6, 0, 5, 4);
    ctx.fillRect(1, 0, 5, 4);
  }

  private renderBarrel(ctx: CanvasRenderingContext2D, b: Barrel) {
    if (b.broken) return;

    const drawY = b.y - b.z;

    // Barrel Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.beginPath();
    ctx.ellipse(b.x, b.y, 10, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Wooden Barrel Cylinder
    ctx.fillStyle = '#92400e'; // Brown wood
    ctx.fillRect(b.x - 8, drawY - 18, 16, 18);

    // Metallic Metal Rings / Hoops
    ctx.fillStyle = '#64748b';
    ctx.fillRect(b.x - 8, drawY - 17, 16, 2);
    ctx.fillRect(b.x - 8, drawY - 3, 16, 2);

    // Vertical wooden staves
    ctx.fillStyle = '#78350f';
    ctx.fillRect(b.x - 4, drawY - 18, 1, 18);
    ctx.fillRect(b.x + 3, drawY - 18, 1, 18);
  }

  private renderHitSparks(ctx: CanvasRenderingContext2D, engine: DoubleDragonEngine) {
    engine.hitSparks.forEach(sp => {
      const alpha = sp.life / sp.maxLife;

      if (sp.type === 'wood') {
        // Flying splinter particles
        ctx.fillStyle = `rgba(180, 83, 9, ${alpha})`;
        ctx.fillRect(sp.x - 4, sp.y - 6, 3, 3);
        ctx.fillRect(sp.x + 5, sp.y - 4, 4, 2);
        ctx.fillRect(sp.x - 2, sp.y + 4, 3, 3);
      } else {
        // Classic 1987 Explosive Hit Flash
        ctx.fillStyle = `rgba(250, 204, 21, ${alpha})`;
        ctx.fillRect(sp.x - 4, sp.y - 4, 8, 8);
        ctx.fillStyle = `rgba(239, 68, 68, ${alpha})`;
        ctx.fillRect(sp.x - 2, sp.y - 8, 4, 16);
        ctx.fillRect(sp.x - 8, sp.y - 2, 16, 4);
      }
    });
  }

  private renderHUD(ctx: CanvasRenderingContext2D, engine: DoubleDragonEngine) {
    // Classic 1987 Arcade Font HUD
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 9px monospace';

    // 1P Score
    ctx.fillStyle = '#38bdf8';
    ctx.fillText('1P', 14, 12);
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`${engine.score.toString().padStart(6, '0')}`, 32, 12);

    // HIGH Score
    ctx.fillStyle = '#ef4444';
    ctx.fillText('HIGH', 130, 12);
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`${engine.highScore.toString().padStart(6, '0')}`, 158, 12);

    // TIME
    ctx.fillStyle = '#eab308';
    ctx.fillText('TIME', 255, 12);
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`${engine.timeLeft.toString().padStart(3, '0')}`, 284, 12);

    // Energy Gauge (Health Pips)
    ctx.fillStyle = '#38bdf8';
    ctx.fillText('PLAYER', 14, 24);
    for (let i = 0; i < engine.player.maxHp; i++) {
      if (i < engine.player.hp) {
        ctx.fillStyle = '#22c55e'; // Green energy
      } else {
        ctx.fillStyle = '#7f1d1d'; // Depleted red
      }
      ctx.fillRect(56 + i * 8, 17, 6, 8);
      ctx.strokeStyle = '#000000';
      ctx.strokeRect(56 + i * 8, 17, 6, 8);
    }

    // Lives counter
    ctx.fillStyle = '#fde047';
    ctx.fillText(`LIVES: ${engine.lives}`, 115, 24);

    // Stage indicator
    ctx.fillStyle = '#a855f7';
    ctx.fillText(`MISSION ${engine.stage}`, 240, 24);
  }

  private renderGameOver(ctx: CanvasRenderingContext2D, engine: DoubleDragonEngine) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    ctx.fillRect(0, 0, engine.viewWidth, engine.viewHeight);

    ctx.fillStyle = '#ef4444';
    ctx.font = 'bold 18px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', engine.viewWidth / 2, 100);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 10px monospace';
    ctx.fillText(`FINAL SCORE: ${engine.score}`, engine.viewWidth / 2, 125);
    ctx.fillText(`THUGS DEFEATED: ${engine.thugsDefeated}`, engine.viewWidth / 2, 140);

    ctx.fillStyle = '#fde047';
    ctx.fillText('PRESS COIN OR START TO RETRY', engine.viewWidth / 2, 165);
    ctx.textAlign = 'left';
  }
}
