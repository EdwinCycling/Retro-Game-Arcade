/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * FRAK! (BBC Micro 1984) Canvas Renderer
 * Authentic Mode 1 Visuals, Caveman Trogg Sprites, Animated Yo-Yo,
 * Surreal Monsters (Scrubbly, Poglet, Hooter), and "FRAK!" Comic Speech Bubble
 */

import { FrakEngine } from './frakEngine';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from './frakLevels';
import { FrakClimbable, FrakEnemy, FrakPlatform } from './frakTypes';

export class FrakRenderer {
  private ctx: CanvasRenderingContext2D;
  public enableCRT: boolean = true;

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
  }

  public render(engine: FrakEngine) {
    const ctx = this.ctx;

    ctx.save();

    // Loop 2 / Easter Egg: Upside-Down Mode
    if (engine.isUpsideDown) {
      ctx.translate(CANVAS_WIDTH, CANVAS_HEIGHT);
      ctx.rotate(Math.PI);
    }

    // 1. Background
    if (engine.isInDarkness) {
      ctx.fillStyle = '#06080c';
    } else {
      ctx.fillStyle = '#0a0d14';
    }
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Subtle cavern background grid or bedrock texture
    this.renderBackdrop(engine);

    // 2. Platforms & Letter Architecture
    this.renderPlatforms(engine);

    // 3. Ladders, Ropes, and Chains
    this.renderClimbables(engine);

    // 4. Exit Door
    this.renderDoor(engine);

    // 5. Collectibles (Keys & Light Bulbs)
    this.renderCollectibles(engine);

    // 6. Enemies (Scrubbly, Poglet, Hooter, Balloons, Daggers)
    this.renderEnemies(engine);

    // 7. Trogg Player & Yo-Yo
    this.renderTrogg(engine);

    // 8. "FRAK!" Death Speech Bubble
    if (engine.showFrakBubble) {
      this.renderFrakBubble(engine);
    }

    // 9. HUD Marquee
    this.renderHUD(engine);

    // 10. Overlays (Title, Game Over, Level Clear, Darkness)
    this.renderOverlays(engine);

    ctx.restore();

    // 11. CRT Scanlines effect
    if (this.enableCRT) {
      this.renderScanlines();
    }
  }

  private renderBackdrop(engine: FrakEngine) {
    const ctx = this.ctx;
    // Retro star dust / cavern flecks
    ctx.fillStyle = engine.isInDarkness ? 'rgba(0, 255, 255, 0.04)' : 'rgba(255, 255, 255, 0.06)';
    for (let x = 16; x < CANVAS_WIDTH; x += 32) {
      for (let y = 30; y < CANVAS_HEIGHT; y += 32) {
        ctx.fillRect(x + ((y * 13) % 7), y, 1.5, 1.5);
      }
    }
  }

  private renderPlatforms(engine: FrakEngine) {
    const ctx = this.ctx;
    const plats = engine.platforms?.length ? engine.platforms : engine.level.platforms;

    plats.forEach((p: FrakPlatform) => {
      // Platform body
      ctx.save();

      const isMoving = p.type === 'moving' || !!p.moving;

      // Top glowing edge (amber/gold for moving rafts & elevator, cyan for stationary)
      ctx.fillStyle = isMoving ? '#fbbf24' : '#00ffff'; // Gold vs BBC Mode 1 Cyan
      ctx.fillRect(p.x, p.y, p.width, 3);

      // Main beam
      if (isMoving) {
        // Dynamic Moving Raft / Elevator Platform
        ctx.fillStyle = '#78350f'; // Dark amber teak wood
        ctx.fillRect(p.x, p.y + 3, p.width, p.height - 3);

        // Bronze metal bindings & animated motion arrows
        ctx.fillStyle = '#d97706';
        ctx.fillRect(p.x, p.y + 3, 5, p.height - 3);
        ctx.fillRect(p.x + p.width - 5, p.y + 3, 5, p.height - 3);

        // Motion direction arrow indicator in center
        ctx.font = 'bold 8px monospace';
        ctx.fillStyle = '#fef08a';
        ctx.textAlign = 'center';
        const arrow = p.moving?.axis === 'y' ? (p.moving.dir > 0 ? '▼' : '▲') : (p.moving?.dir ?? 1) > 0 ? '►' : '◄';
        ctx.fillText(arrow, p.x + p.width / 2, p.y + p.height - 3);
        ctx.textAlign = 'start';
      } else if (p.type === 'log') {
        ctx.fillStyle = '#b45309'; // Wooden log
        ctx.fillRect(p.x, p.y + 3, p.width, p.height - 3);
        // Wood grain rings
        ctx.strokeStyle = '#78350f';
        ctx.lineWidth = 1;
        for (let gx = p.x + 8; gx < p.x + p.width - 8; gx += 16) {
          ctx.strokeRect(gx, p.y + 5, 6, p.height - 7);
        }
      } else if (p.type === 'stone') {
        ctx.fillStyle = '#475569'; // Slate stone
        ctx.fillRect(p.x, p.y + 3, p.width, p.height - 3);
        // Stone brick seams
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 1;
        for (let sx = p.x + 12; sx < p.x + p.width; sx += 24) {
          ctx.beginPath();
          ctx.moveTo(sx, p.y + 3);
          ctx.lineTo(sx, p.y + p.height);
          ctx.stroke();
        }
      } else {
        // High-tech BBC Mode 1 cross-hatch girder
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(p.x, p.y + 3, p.width, p.height - 3);

        ctx.strokeStyle = '#0284c7';
        ctx.lineWidth = 1;
        // Cross struts
        for (let gx = p.x; gx < p.x + p.width - 8; gx += 10) {
          ctx.beginPath();
          ctx.moveTo(gx, p.y + 3);
          ctx.lineTo(gx + 8, p.y + p.height);
          ctx.stroke();
        }
      }

      // Bottom border
      ctx.fillStyle = isMoving ? '#b45309' : '#0284c7';
      ctx.fillRect(p.x, p.y + p.height - 1.5, p.width, 1.5);

      // Letter markers in Zone 1 (F, R, A, K)
      if (p.label && engine.currentLevelIndex === 0) {
        ctx.font = '8px monospace';
        ctx.fillStyle = 'rgba(255, 255, 0, 0.45)';
        ctx.fillText(p.label, p.x + 4, p.y - 4);
      } else if (isMoving && p.label) {
        // Small label above moving elevator or raft
        ctx.font = '7px monospace';
        ctx.fillStyle = 'rgba(251, 191, 36, 0.7)';
        ctx.fillText(p.label, p.x + 2, p.y - 3);
      }

      ctx.restore();
    });
  }

  private renderClimbables(engine: FrakEngine) {
    const ctx = this.ctx;

    engine.level.climbables.forEach((c: FrakClimbable) => {
      ctx.save();
      const cx = c.x + c.width / 2;

      if (c.type === 'ladder') {
        // Wooden/Steel ladder rails
        ctx.fillStyle = '#ffff00'; // Yellow
        ctx.fillRect(c.x, c.y, 3, c.height);
        ctx.fillRect(c.x + c.width - 3, c.y, 3, c.height);

        // Rungs
        ctx.fillStyle = '#ffffff';
        for (let ry = c.y + 6; ry < c.y + c.height; ry += 12) {
          ctx.fillRect(c.x + 3, ry, c.width - 6, 2.5);
        }
      } else if (c.type === 'rope') {
        // Braided rope
        ctx.strokeStyle = '#fef08a';
        ctx.lineWidth = 3;
        ctx.setLineDash([4, 2]);
        ctx.beginPath();
        ctx.moveTo(cx, c.y);
        ctx.lineTo(cx, c.y + c.height);
        ctx.stroke();
        ctx.setLineDash([]);
      } else if (c.type === 'chain') {
        // Metallic interlocked oval chain links
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 2;
        for (let ly = c.y + 4; ly < c.y + c.height; ly += 9) {
          ctx.strokeRect(cx - 3, ly, 6, 7);
        }
      }

      ctx.restore();
    });
  }

  private renderDoor(engine: FrakEngine) {
    const ctx = this.ctx;
    const d = engine.door;

    ctx.save();
    // Door frame
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(d.x, d.y, d.width, d.height);

    ctx.strokeStyle = d.isOpen ? '#ffff00' : '#475569';
    ctx.lineWidth = 2.5;
    ctx.strokeRect(d.x, d.y, d.width, d.height);

    if (d.isOpen) {
      // Swirling open vortex / doorway
      const grad = ctx.createLinearGradient(d.x, d.y, d.x + d.width, d.y + d.height);
      grad.addColorStop(0, '#ffff00');
      grad.addColorStop(0.5, '#00ffff');
      grad.addColorStop(1, '#ff0055');
      ctx.fillStyle = grad;
      ctx.fillRect(d.x + 3, d.y + 3, d.width - 6, d.height - 6);

      // Pulsing EXIT text
      ctx.font = 'bold 9px monospace';
      ctx.fillStyle = '#000000';
      ctx.textAlign = 'center';
      ctx.fillText('EXIT', d.x + d.width / 2, d.y + 24);
    } else {
      // Closed portal with 3 Keyholes indicator
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(d.x + 3, d.y + 3, d.width - 6, d.height - 6);

      // Keyholes
      const collectedCount = engine.keys.filter((k) => k.collected).length;
      for (let i = 0; i < 3; i++) {
        const kx = d.x + 7 + i * 9;
        const ky = d.y + 20;
        ctx.fillStyle = i < collectedCount ? '#ffff00' : '#334155';
        ctx.beginPath();
        ctx.arc(kx, ky, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.font = '7px monospace';
      ctx.fillStyle = '#94a3b8';
      ctx.textAlign = 'center';
      ctx.fillText('3 KEYS', d.x + d.width / 2, d.y + 34);
    }

    ctx.restore();
  }

  private renderCollectibles(engine: FrakEngine) {
    const ctx = this.ctx;

    // Keys
    engine.keys.forEach((key) => {
      if (key.collected) return;
      ctx.save();
      const pulse = Math.sin(engine.animTimer * 0.1 + key.id) * 2;

      // Golden Key
      ctx.fillStyle = '#ffff00';
      ctx.strokeStyle = '#ca8a04';
      ctx.lineWidth = 1;

      // Key ring head
      ctx.beginPath();
      ctx.arc(key.x + 5, key.y + 6 + pulse, 4.5, 0, Math.PI * 2);
      ctx.stroke();

      // Key shaft
      ctx.fillRect(key.x + 8, key.y + 5 + pulse, 8, 2.5);
      // Key teeth
      ctx.fillRect(key.x + 13, key.y + 7.5 + pulse, 2, 3);
      ctx.fillRect(key.x + 15, key.y + 7.5 + pulse, 2, 4);

      // Glow flare
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(key.x + 4, key.y + 5 + pulse, 1.5, 1.5);

      ctx.restore();
    });

    // Light Bulbs
    engine.bulbs.forEach((bulb) => {
      if (bulb.collected) return;
      ctx.save();
      const glow = Math.sin(engine.animTimer * 0.15 + bulb.id) > 0;

      // Glass bulb
      ctx.fillStyle = glow ? '#fef08a' : '#e2e8f0';
      ctx.beginPath();
      ctx.arc(bulb.x + 7, bulb.y + 7, 5.5, 0, Math.PI * 2);
      ctx.fill();

      // Filament
      ctx.strokeStyle = glow ? '#ea580c' : '#94a3b8';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(bulb.x + 5, bulb.y + 7);
      ctx.lineTo(bulb.x + 7, bulb.y + 5);
      ctx.lineTo(bulb.x + 9, bulb.y + 7);
      ctx.stroke();

      // Screw base
      ctx.fillStyle = '#64748b';
      ctx.fillRect(bulb.x + 5, bulb.y + 12, 4, 3);

      // Radiating light rays
      if (glow) {
        ctx.strokeStyle = 'rgba(254, 240, 138, 0.4)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(bulb.x + 7, bulb.y - 2);
        ctx.lineTo(bulb.x + 7, bulb.y + 1);
        ctx.moveTo(bulb.x - 2, bulb.y + 7);
        ctx.lineTo(bulb.x + 1, bulb.y + 7);
        ctx.moveTo(bulb.x + 16, bulb.y + 7);
        ctx.lineTo(bulb.x + 13, bulb.y + 7);
        ctx.stroke();
      }

      ctx.restore();
    });
  }

  private renderEnemies(engine: FrakEngine) {
    const ctx = this.ctx;

    engine.enemies.forEach((e: FrakEnemy) => {
      if (!e.alive) return;
      ctx.save();

      if (e.type === 'scrubbly') {
        // Scrubbly: The Hairy Scrubbing Brush / Bristle Monster
        const ex = e.x;
        const ey = e.y - e.height;

        // Wooden brush block
        ctx.fillStyle = '#b45309';
        ctx.fillRect(ex, ey, e.width, 5);

        // Bristles (twitching)
        ctx.fillStyle = '#fef08a';
        const bristleShift = (e.animFrame % 2) * 1.5;
        for (let bx = ex + 1; bx < ex + e.width - 1; bx += 3) {
          ctx.fillRect(bx + bristleShift, ey + 5, 1.5, e.height - 5);
        }

        // Two angry eyes on the brush back!
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(ex + 4, ey + 1, 3, 3);
        ctx.fillRect(ex + 12, ey + 1, 3, 3);
        ctx.fillStyle = '#000000';
        ctx.fillRect(ex + (e.facingLeft ? 4 : 5), ey + 2, 1.5, 1.5);
        ctx.fillRect(ex + (e.facingLeft ? 12 : 13), ey + 2, 1.5, 1.5);
      } else if (e.type === 'poglet') {
        // Poglet: Pig-faced creature with curly snout and round body
        const cx = e.x + e.width / 2;
        const cy = e.y - e.height / 2;

        // Pink body
        ctx.fillStyle = '#f472b6';
        ctx.beginPath();
        ctx.arc(cx, cy, 9, 0, Math.PI * 2);
        ctx.fill();

        // Pig snout
        ctx.fillStyle = '#ec4899';
        const snoutX = e.facingLeft ? cx - 6 : cx + 2;
        ctx.fillRect(snoutX, cy - 2, 5, 4);
        ctx.fillStyle = '#831843';
        ctx.fillRect(snoutX + 1, cy - 1, 1, 2);
        ctx.fillRect(snoutX + 3, cy - 1, 1, 2);

        // Ears
        ctx.fillStyle = '#db2777';
        ctx.fillRect(cx - 6, cy - 10, 3, 3);
        ctx.fillRect(cx + 3, cy - 10, 3, 3);

        // Eye
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(cx + (e.facingLeft ? -4 : 1), cy - 6, 3, 3);
        ctx.fillStyle = '#000000';
        ctx.fillRect(cx + (e.facingLeft ? -4 : 2), cy - 5, 1.5, 1.5);

        // Little trotters
        ctx.fillStyle = '#db2777';
        ctx.fillRect(cx - 5, e.y - 3, 3, 3);
        ctx.fillRect(cx + 2, e.y - 3, 3, 3);
      } else if (e.type === 'hooter') {
        // Hooter: The giant-nosed stone creature
        const ex = e.x;
        const ey = e.y - e.height;

        // Heavy stone head
        ctx.fillStyle = '#64748b';
        ctx.fillRect(ex + 3, ey, 14, 15);

        // THE GIANT PROTRUDING NOSE
        ctx.fillStyle = '#94a3b8';
        if (e.facingLeft) {
          ctx.beginPath();
          ctx.moveTo(ex + 4, ey + 4);
          ctx.lineTo(ex - 6, ey + 10);
          ctx.lineTo(ex + 4, ey + 12);
          ctx.closePath();
          ctx.fill();
        } else {
          ctx.beginPath();
          ctx.moveTo(ex + 16, ey + 4);
          ctx.lineTo(ex + 26, ey + 10);
          ctx.lineTo(ex + 16, ey + 12);
          ctx.closePath();
          ctx.fill();
        }

        // Grumpy eye
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(ex + (e.facingLeft ? 5 : 10), ey + 3, 4, 3);
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(ex + (e.facingLeft ? 5 : 12), ey + 4, 2, 2);

        // Stone stomping feet
        ctx.fillStyle = '#334155';
        ctx.fillRect(ex + 2, e.y - 4, 6, 4);
        ctx.fillRect(ex + 12, e.y - 4, 6, 4);
      } else if (e.type === 'balloon') {
        // Floating Balloon
        const bx = e.x + e.width / 2;
        const by = e.y - e.height / 2;

        // Balloon envelope
        ctx.fillStyle = '#ef4444'; // Red
        ctx.beginPath();
        ctx.ellipse(bx, by - 2, 9, 11, 0, 0, Math.PI * 2);
        ctx.fill();

        // Highlight sheen
        ctx.fillStyle = '#fca5a5';
        ctx.beginPath();
        ctx.arc(bx - 3, by - 6, 2.5, 0, Math.PI * 2);
        ctx.fill();

        // Balloon knot & string
        ctx.fillStyle = '#b91c1c';
        ctx.fillRect(bx - 1.5, by + 8, 3, 2);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(bx, by + 10);
        ctx.quadraticCurveTo(bx + 4, by + 16, bx - 2, by + 22);
        ctx.stroke();
      } else if (e.type === 'dagger') {
        // Flying Dagger
        ctx.translate(e.x + e.width / 2, e.y - e.height / 2);
        ctx.rotate(-0.7); // Diagonally tilted downwards

        // Steel blade
        ctx.fillStyle = '#f8fafc';
        ctx.beginPath();
        ctx.moveTo(10, 0);
        ctx.lineTo(-4, -4);
        ctx.lineTo(-4, 4);
        ctx.closePath();
        ctx.fill();

        // Crossguard
        ctx.fillStyle = '#eab308';
        ctx.fillRect(-6, -6, 2, 12);

        // Hilt
        ctx.fillStyle = '#78350f';
        ctx.fillRect(-10, -2, 4, 4);

        // Pommel
        ctx.fillStyle = '#eab308';
        ctx.fillRect(-12, -3, 2, 6);
      }

      ctx.restore();
    });
  }

  private renderTrogg(engine: FrakEngine) {
    const ctx = this.ctx;
    const t = engine.trogg;

    ctx.save();
    ctx.translate(t.x, t.y);

    // 1. Draw Physical Yo-Yo String and Disc
    if (t.yoYo.active) {
      const handX = t.facingLeft ? -10 : 10;
      const handY = -14;
      const yoX = t.yoYo.x - t.x;
      const yoY = t.yoYo.y - t.y;

      // Yo-yo string
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(handX, handY);
      ctx.lineTo(yoX, yoY);
      ctx.stroke();

      // Spinning Yo-Yo Disc
      ctx.save();
      ctx.translate(yoX, yoY);
      ctx.rotate(t.yoYo.spinAngle);

      // Red outer disc
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(0, 0, 5.5, 0, Math.PI * 2);
      ctx.fill();

      // Yellow inner ring
      ctx.fillStyle = '#ffff00';
      ctx.beginPath();
      ctx.arc(0, 0, 3, 0, Math.PI * 2);
      ctx.fill();

      // Spinning cross
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(-5, 0);
      ctx.lineTo(5, 0);
      ctx.moveTo(0, -5);
      ctx.lineTo(0, 5);
      ctx.stroke();

      ctx.restore();
    }

    // 2. Flip horizontally if facing left
    if (t.facingLeft) {
      ctx.scale(-1, 1);
    }

    // 3. Render Trogg the Caveman
    // Legs
    ctx.fillStyle = '#fed7aa'; // Bare skin legs
    const legAnim = t.isGrounded ? Math.sin(t.animFrame * 1.5) * 4 : 0;
    if (t.isClimbing) {
      const climbLeg = (t.animFrame % 2 === 0) ? -3 : 3;
      ctx.fillRect(-5, -7 + climbLeg, 3, 7);
      ctx.fillRect(2, -7 - climbLeg, 3, 7);
    } else if (t.isJumping) {
      // Tucked jump legs
      ctx.fillRect(-6, -7, 4, 5);
      ctx.fillRect(2, -7, 4, 5);
    } else {
      // Walking legs
      ctx.fillRect(-5 + legAnim, -7, 3.5, 7);
      ctx.fillRect(2 - legAnim, -7, 3.5, 7);
    }

    // Leopard Skin Tunic (Yellow with dark spots)
    ctx.fillStyle = '#facc15';
    ctx.fillRect(-6, -20, 12, 14);
    // Leopard spots
    ctx.fillStyle = '#713f12';
    ctx.fillRect(-4, -17, 2, 2);
    ctx.fillRect(1, -15, 2, 2);
    ctx.fillRect(-2, -11, 2, 2);
    ctx.fillRect(2, -9, 2, 2);

    // Single shoulder strap pelt
    ctx.fillStyle = '#ca8a04';
    ctx.fillRect(-5, -22, 4, 3);

    // Caveman Head & Skin
    ctx.fillStyle = '#fed7aa';
    ctx.fillRect(-4, -26, 9, 8);

    // Bushy Brown Caveman Hair & Beard
    ctx.fillStyle = '#78350f';
    // Hair on top & back
    ctx.fillRect(-7, -29, 12, 6);
    ctx.fillRect(-7, -26, 4, 10); // Wild hair falling down back
    // Big Bushy Beard
    ctx.fillRect(1, -21, 6, 5);

    // THE PROMINENT CAVEMAN NOSE (trogg signature!)
    ctx.fillStyle = '#f97316';
    ctx.fillRect(4, -24, 4, 4);

    // Eye
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(1, -26, 3, 3);
    ctx.fillStyle = '#000000';
    ctx.fillRect(2, -25, 1.5, 1.5);

    // Caveman Arms
    ctx.fillStyle = '#fed7aa';
    if (t.isClimbing) {
      const armShift = (t.animFrame % 2 === 0) ? 4 : -4;
      ctx.fillRect(-6, -27 + armShift, 3, 8);
      ctx.fillRect(3, -27 - armShift, 3, 8);
    } else if (t.yoYo.active) {
      // Extended arm throwing yo-yo
      ctx.fillRect(2, -17, 8, 3.5);
    } else {
      // Resting / swinging arm
      ctx.fillRect(0, -17, 3.5, 7);
    }

    ctx.restore();
  }

  // Comic-style Speech Bubble for the iconic "FRAK!" scream
  private renderFrakBubble(engine: FrakEngine) {
    const ctx = this.ctx;
    const t = engine.trogg;

    ctx.save();
    const bx = Math.min(CANVAS_WIDTH - 60, Math.max(60, t.x + (t.facingLeft ? -40 : 40)));
    const by = Math.max(45, t.y - 45);

    // Bubble Tail pointing to Trogg's mouth
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(t.x, t.y - 24);
    ctx.lineTo(bx - 10, by + 12);
    ctx.lineTo(bx + 10, by + 12);
    ctx.closePath();
    ctx.fill();

    // Comic Bubble Body
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3;

    ctx.beginPath();
    ctx.ellipse(bx, by, 36, 18, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Bold, fiery red text "FRAK!"
    ctx.font = '900 18px Impact, "Arial Black", sans-serif';
    ctx.fillStyle = '#ef4444';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(engine.frakBubbleText, bx, by);

    ctx.restore();
  }

  private renderHUD(engine: FrakEngine) {
    const ctx = this.ctx;

    ctx.save();
    // Top Bar Background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, 26);
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 1;
    ctx.strokeRect(0, 0, CANVAS_WIDTH, 26);

    ctx.font = 'bold 11px monospace';

    // 1UP Score
    ctx.fillStyle = '#00ffff';
    ctx.fillText('1UP:', 12, 17);
    ctx.fillStyle = '#ffffff';
    ctx.fillText(engine.score.toString().padStart(6, '0'), 44, 17);

    // Level / Zone
    ctx.fillStyle = '#ffff00';
    ctx.fillText(`ZONE ${engine.currentLevelIndex + 1}`, 115, 17);

    // Keys Status
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('KEYS:', 185, 17);
    engine.keys.forEach((key, idx) => {
      ctx.fillStyle = key.collected ? '#ffff00' : '#475569';
      ctx.fillText('🗝', 225 + idx * 16, 17);
    });

    // Time remaining
    ctx.fillStyle = engine.timeRemaining < 20 ? '#ef4444' : '#38bdf8';
    ctx.fillText(`TIME: ${engine.timeRemaining.toString().padStart(3, '0')}`, 295, 17);

    // Lives
    ctx.fillStyle = '#f43f5e';
    ctx.fillText('LIVES:', 380, 17);
    ctx.fillStyle = '#facc15';
    for (let l = 0; l < Math.min(5, engine.lives); l++) {
      ctx.fillText('🪓', 430 + l * 14, 17);
    }

    ctx.restore();
  }

  private renderOverlays(engine: FrakEngine) {
    const ctx = this.ctx;

    if (engine.state === 'TITLE') {
      // Title Screen Attract Mode
      ctx.save();
      ctx.fillStyle = 'rgba(0, 0, 0, 0.82)';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Main Logo
      ctx.font = '900 48px Impact, sans-serif';
      ctx.fillStyle = '#ef4444';
      ctx.textAlign = 'center';
      ctx.fillText('FRAK!', CANVAS_WIDTH / 2, 100);

      // Subtitle
      ctx.font = 'bold 13px monospace';
      ctx.fillStyle = '#00ffff';
      ctx.fillText('AARDVARK SOFTWARE 1984 • NICK PELLING', CANVAS_WIDTH / 2, 130);

      // Lore & Objective Box
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(CANVAS_WIDTH / 2 - 210, 150, 420, 170);
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(CANVAS_WIDTH / 2 - 210, 150, 420, 170);

      ctx.font = '11px monospace';
      ctx.fillStyle = '#f8fafc';
      ctx.textAlign = 'left';
      const startX = CANVAS_WIDTH / 2 - 190;
      ctx.fillText('• Kruip in de huid van holbewoner TROGG', startX, 175);
      ctx.fillText('• Verzamel alle 3 GOUDEN SLEUTELS in elk doolhof', startX, 195);
      ctx.fillText('• Gooi je YO-YO om Scrubbly, Poglet & Hooter te zappen', startX, 215);
      ctx.fillText('• Pas op voor dodelijke valpartijen (TROGG roept FRAK!)', startX, 235);
      ctx.fillText('• Vind gloeilampen voor extra bonustijd!', startX, 255);
      ctx.fillText('• Bereik de geopende uitgangsdeur naar het volgende level!', startX, 275);
      ctx.fillText('• Level 1 spel de letters F - R - A - K met platformen!', startX, 295);

      // Start prompt
      ctx.font = 'bold 15px monospace';
      ctx.fillStyle = '#ffff00';
      ctx.textAlign = 'center';
      ctx.fillText('DRUK OP SPATIE OF START SPEL', CANVAS_WIDTH / 2, 355);

      ctx.restore();
    } else if (engine.state === 'LEVEL_CLEAR') {
      ctx.save();
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      ctx.font = '900 32px Impact, sans-serif';
      ctx.fillStyle = '#00ffff';
      ctx.textAlign = 'center';
      ctx.fillText('ZONE VOLTOOID!', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 20);

      ctx.font = 'bold 14px monospace';
      ctx.fillStyle = '#ffff00';
      ctx.fillText(`BONUS TIJD: +${engine.timeRemaining * 15} PUNTEN`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 15);
      ctx.fillText('VOLGENDE DOOLHOF WORDT GELADEN...', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 45);

      ctx.restore();
    } else if (engine.state === 'GAME_OVER') {
      ctx.save();
      ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      ctx.font = '900 36px Impact, sans-serif';
      ctx.fillStyle = '#ef4444';
      ctx.textAlign = 'center';
      ctx.fillText('GAME OVER', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 30);

      ctx.font = 'bold 14px monospace';
      ctx.fillStyle = '#f8fafc';
      ctx.fillText(`EINDSCORE: ${engine.score.toLocaleString()}`, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 10);

      ctx.font = 'bold 13px monospace';
      ctx.fillStyle = '#ffff00';
      ctx.fillText('DRUK OP RESTART VOOR EEN NIEUWE POGING', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 50);

      ctx.restore();
    }
  }

  private renderScanlines() {
    const ctx = this.ctx;
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.18)';
    for (let y = 0; y < CANVAS_HEIGHT; y += 3) {
      ctx.fillRect(0, y, CANVAS_WIDTH, 1.2);
    }
    ctx.restore();
  }
}
