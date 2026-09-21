/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Prince of Persia (1989/1990) - High-Fidelity 16-Bit / 32-Bit Pixel-Art Renderer
 * Faithfully matches Jordan Mechner's rotoscoped physics & the authentic slate-blue stone block dungeon aesthetic.
 */

import { PrinceEngine, DungeonTile, Guard } from './princeEngine';

export class PrinceRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private offscreen: HTMLCanvasElement;
  private offCtx: CanvasRenderingContext2D;

  private width: number = 320;
  private height: number = 200;
  private animTick: number = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Could not get 2D context');
    this.ctx = context;

    this.offscreen = document.createElement('canvas');
    this.offscreen.width = this.width;
    this.offscreen.height = this.height;
    const offContext = this.offscreen.getContext('2d');
    if (!offContext) throw new Error('Could not get offscreen 2D context');
    this.offCtx = offContext;
    this.offCtx.imageSmoothingEnabled = false;
  }

  public render(engine: PrinceEngine) {
    this.animTick++;
    const ctx = this.offCtx;

    // 1. Clear background with deep dungeon void (pure black & dark indigo)
    ctx.fillStyle = '#03060c';
    ctx.fillRect(0, 0, this.width, this.height);

    // 2. Render Dungeon Background Bricks & Architectural Wall Pillars
    this.renderDungeonBackdrop(ctx, engine);

    // 3. Render Dungeon Floor Slabs, Slate-Blue Stone Blocks & Interactive Traps
    this.renderDungeonTiles(ctx, engine);

    // 4. Render Decorative Dungeon Remains (Floor Skeletons)
    this.renderDungeonDecorations(ctx, engine);

    // 5. Render Guards & Foes
    this.renderGuards(ctx, engine);

    // 6. Render Prince with Jordan Mechner's Rotoscoped Sprites & Flowing Rose Ribbon
    this.renderPrince(ctx, engine);

    // 7. Render Foreground Overlays (Torches, Portcullis Gates, Chompers)
    this.renderForegroundOverlays(ctx, engine);

    // 8. Render Authentic HUD (Health Triangles, Messages & 60-min timer)
    this.renderHUD(ctx, engine);

    // 9. Scale up to display canvas with sharp pixel rendering & optional CRT
    this.drawToScreen(engine);
  }

  /**
   * Authentic slate-blue stone brick wall pattern with relief lines
   */
  private renderDungeonBackdrop(ctx: CanvasRenderingContext2D, engine: PrinceEngine) {
    // 1. Deep atmospheric black dungeon canvas
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, this.width, 180);

    // 2. Subtle architectural brick relief in background (slate-blue mortar matching image.png)
    const brickW = 32;
    const brickH = 15;

    for (let y = 0; y < 180; y += brickH) {
      const row = Math.floor(y / brickH);
      const xOffset = (row % 2 === 0) ? 0 : 16;

      for (let x = -16; x < this.width + 16; x += brickW) {
        // Very subtle dark slate brick tone
        ctx.fillStyle = (row % 3 === 0) ? '#070b14' : (row % 3 === 1) ? '#090f1b' : '#050810';
        ctx.fillRect(x + xOffset, y, brickW - 1, brickH - 1);

        // Very faint mortar lines
        ctx.fillStyle = '#101726';
        ctx.fillRect(x + xOffset, y, brickW - 1, 1);
        ctx.fillRect(x + xOffset, y, 1, brickH - 1);
      }
    }

    // 3. Authentic background architectural pillars
    this.drawBackgroundPillar(ctx, 48, 0, 180);
    this.drawBackgroundPillar(ctx, 160, 0, 180);
    this.drawBackgroundPillar(ctx, 272, 0, 180);
  }

  private drawBackgroundPillar(ctx: CanvasRenderingContext2D, x: number, y: number, height: number) {
    ctx.fillStyle = '#080d1d';
    ctx.fillRect(x, y, 14, height);
    ctx.fillStyle = '#141e38';
    ctx.fillRect(x + 2, y, 3, height);
    ctx.fillStyle = '#04070e';
    ctx.fillRect(x + 10, y, 4, height);
  }

  /**
   * Render Dungeon Tiles with Authentic Slate-Blue Stone Blocks
   */
  private renderDungeonTiles(ctx: CanvasRenderingContext2D, engine: PrinceEngine) {
    const roomKey = `${engine.currentRoomX},${engine.currentRoomY}`;
    const room = engine.rooms.get(roomKey);
    if (!room) return;

    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 10; c++) {
        const tile = room[r][c];
        const tileX = c * engine.tileWidth;
        const tileY = r * engine.tileHeight;

        // Solid floor block
        if (tile.type === 'floor' || tile.type === 'plate_open' || tile.type === 'plate_close' || tile.type === 'spikes' || tile.type === 'chomper') {
          this.drawSlateFloorBlock(ctx, tileX, tileY + 30);
        }

        // Structural Pillar Column
        if (tile.type === 'pillar') {
          this.drawArchitecturalPillar(ctx, tileX, tileY);
        }

        // Loose floor tile
        if (tile.type === 'loose_floor') {
          const dropOffset = tile.state === 2 ? 80 : (tile.state === 1 ? (Math.sin(this.animTick * 0.5) * 2) : 0);
          if (tile.state !== 2) {
            this.drawSlateFloorBlock(ctx, tileX, tileY + 30 + dropOffset);
            // Fractures and cracks
            ctx.fillStyle = '#020617';
            ctx.fillRect(tileX + 8, tileY + 33 + dropOffset, 14, 2);
            ctx.fillRect(tileX + 15, tileY + 35 + dropOffset, 2, 8);
          }
        }

        // Pressure plate (Golden bronze stone slab)
        if (tile.type === 'plate_open' || tile.type === 'plate_close') {
          ctx.fillStyle = '#64748b';
          ctx.fillRect(tileX + 6, tileY + 28, 20, 3);
          ctx.fillStyle = '#94a3b8';
          ctx.fillRect(tileX + 8, tileY + 27, 16, 2);
        }

        // Floor Spikes
        if (tile.type === 'spikes') {
          if (tile.state && tile.state > 0) {
            const h = tile.state === 2 ? 18 : 6;
            ctx.fillStyle = '#e2e8f0';
            for (let s = 0; s < 4; s++) {
              const sx = tileX + 4 + s * 7;
              ctx.beginPath();
              ctx.moveTo(sx, tileY + 30);
              ctx.lineTo(sx + 3, tileY + 30 - h);
              ctx.lineTo(sx + 6, tileY + 30);
              ctx.closePath();
              ctx.fill();
            }
          }
        }

        // Sword item resting on floor
        if (tile.type === 'sword_item') {
          this.drawSwordItem(ctx, tileX + 10, tileY + 25);
        }

        // Potions
        if (tile.type === 'potion_small') {
          this.drawPotion(ctx, tileX + 12, tileY + 18, 'red');
        } else if (tile.type === 'potion_big') {
          this.drawPotion(ctx, tileX + 10, tileY + 14, 'blue');
        }

        // Exit Door
        if (tile.type === 'exit_door') {
          this.drawExitDoor(ctx, tileX, tileY);
        }

        // Magic Mirror (Level 4)
        if (tile.type === 'magic_mirror') {
          this.drawMagicMirror(ctx, tileX, tileY - 18, tile.state || 0);
        }
      }
    }
  }

  /**
   * Draw Slate-Blue Stone Blocks matching the reference screenshot (image.png)!
   */
  private drawSlateFloorBlock(ctx: CanvasRenderingContext2D, x: number, y: number) {
    const w = 32;
    const h = 30;

    // 1. Top walking plane (Ledge surface)
    ctx.fillStyle = '#8ea2be'; // Crisp top lip highlight
    ctx.fillRect(x, y, w, 1);
    ctx.fillStyle = '#5d6f8a'; // Walking plane surface
    ctx.fillRect(x, y + 1, w, 2);

    // 2. Deep groove under the walking lip
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(x, y + 3, w, 1);

    // 3. Main block body (Slate blue-grey stone masonry from image.png)
    ctx.fillStyle = '#344256';
    ctx.fillRect(x, y + 4, w, h - 4);

    // Left edge highlight (3D chiseled light source)
    ctx.fillStyle = '#475872';
    ctx.fillRect(x, y + 4, 2, h - 5);

    // Right edge shadow
    ctx.fillStyle = '#1c2637';
    ctx.fillRect(x + w - 2, y + 4, 2, h - 5);

    // 4. Vertical mortar groove separating two stones
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(x + 15, y + 4, 2, h - 5);
    ctx.fillRect(x, y + 16, w, 2); // Mid horizontal seam

    // 5. Authentic stone surface chisel pits & speckles (matching image.png)
    ctx.fillStyle = '#141c2b'; // Dark shadow crater
    ctx.fillRect(x + 4, y + 8, 3, 2);
    ctx.fillStyle = '#52637a'; // Lower rim highlight
    ctx.fillRect(x + 4, y + 10, 3, 1);

    ctx.fillStyle = '#141c2b';
    ctx.fillRect(x + 21, y + 9, 3, 2);
    ctx.fillStyle = '#52637a';
    ctx.fillRect(x + 21, y + 11, 3, 1);

    ctx.fillStyle = '#141c2b';
    ctx.fillRect(x + 8, y + 21, 2, 2);
    ctx.fillStyle = '#52637a';
    ctx.fillRect(x + 8, y + 23, 2, 1);

    ctx.fillStyle = '#141c2b';
    ctx.fillRect(x + 25, y + 22, 2, 2);
    ctx.fillStyle = '#52637a';
    ctx.fillRect(x + 25, y + 24, 2, 1);

    // 6. Deep bottom shadow (Ledge overhang)
    ctx.fillStyle = '#050810';
    ctx.fillRect(x, y + h - 1, w, 1);
  }

  /**
   * Vertical Architectural Stone Column / Pillar (matching image.png)
   */
  private drawArchitecturalPillar(ctx: CanvasRenderingContext2D, x: number, y: number) {
    const pw = 28;
    const ph = 60;
    const px = x + 2;

    // Capital (Top Cornice Overhang)
    ctx.fillStyle = '#64748b';
    ctx.fillRect(px - 2, y, pw + 4, 3);
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(px - 2, y, pw + 4, 1);
    ctx.fillStyle = '#334155';
    ctx.fillRect(px - 1, y + 3, pw + 2, 3);

    // Column Shaft (Segmented Stone Blocks)
    for (let s = 0; s < 4; s++) {
      const sy = y + 6 + s * 12;
      ctx.fillStyle = '#334155';
      ctx.fillRect(px, sy, pw, 10);

      // Left highlight
      ctx.fillStyle = '#475569';
      ctx.fillRect(px, sy, 3, 10);
      ctx.fillStyle = '#64748b';
      ctx.fillRect(px, sy, pw, 1);

      // Right shadow
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(px + pw - 3, sy, 3, 10);

      // Mortar groove
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(px, sy + 10, pw, 2);

      // Stone texture pits
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(px + 6 + (s % 2) * 8, sy + 4, 2, 2);
    }

    // Base Plinth (Bottom Foot)
    ctx.fillStyle = '#475569';
    ctx.fillRect(px - 2, y + ph - 6, pw + 4, 6);
    ctx.fillStyle = '#64748b';
    ctx.fillRect(px - 2, y + ph - 6, pw + 4, 1);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(px - 2, y + ph - 1, pw + 4, 1);
  }

  /**
   * Decorative Dungeon Elements: Human Skeletons on the floor (as seen in image.png)
   */
  private renderDungeonDecorations(ctx: CanvasRenderingContext2D, engine: PrinceEngine) {
    // In Level 1 room (0,0) or (1,0) and Level 3, render realistic skeleton remains on the floor
    if (engine.currentRoomX === 1 || engine.currentLevel === 3) {
      this.drawFloorSkeleton(ctx, 220, 142);
    }
    if (engine.currentLevel === 1 && engine.currentRoomX === 0) {
      this.drawFloorSkeleton(ctx, 80, 142);
    }
  }

  /**
   * Floor Skeleton with Skull, Eye Sockets, Ribs and Scattered Bones (from image.png)
   */
  private drawFloorSkeleton(ctx: CanvasRenderingContext2D, x: number, y: number) {
    const cBone = '#f8fafc';
    const cShadowBone = '#cbd5e1';
    const cDeepDark = '#020617';

    // 1. Skull
    ctx.fillStyle = cBone;
    ctx.beginPath();
    ctx.arc(x + 20, y - 5, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(x + 17, y - 4, 6, 4);

    // Eye sockets & nasal hole
    ctx.fillStyle = cDeepDark;
    ctx.fillRect(x + 18, y - 6, 1.5, 2);
    ctx.fillRect(x + 21, y - 6, 1.5, 2);
    ctx.fillRect(x + 19.5, y - 3, 1, 1);

    // Teeth & Jaw
    ctx.fillStyle = cShadowBone;
    ctx.fillRect(x + 18, y - 1, 4, 1.5);

    // 2. Spine & Ribcage
    ctx.fillStyle = cBone;
    ctx.fillRect(x + 2, y - 3, 15, 2); // Spine
    ctx.fillRect(x + 4, y - 6, 2, 6); // Rib 1
    ctx.fillRect(x + 8, y - 7, 2, 7); // Rib 2
    ctx.fillRect(x + 12, y - 6, 2, 6); // Rib 3

    // 3. Pelvis & Leg Bones
    ctx.fillStyle = cShadowBone;
    ctx.fillRect(x - 2, y - 4, 4, 4);
    ctx.fillStyle = cBone;
    ctx.fillRect(x - 10, y - 2, 8, 1.5); // Femur
    ctx.fillRect(x - 18, y - 2, 7, 1.5); // Tibia

    // 4. Forearm bone
    ctx.fillStyle = cBone;
    ctx.fillRect(x + 6, y - 8, 1.5, 5);
    ctx.fillRect(x + 8, y - 9, 3, 1.5);
  }

  private drawSwordItem(ctx: CanvasRenderingContext2D, x: number, y: number) {
    const glint = (this.animTick % 20 < 10);
    ctx.fillStyle = glint ? '#ffffff' : '#e2e8f0';
    ctx.fillRect(x, y, 16, 2);
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(x + 14, y - 2, 3, 5); // Guard
    ctx.fillStyle = '#eab308';
    ctx.fillRect(x + 17, y, 4, 2); // Golden Hilt
  }

  private drawPotion(ctx: CanvasRenderingContext2D, x: number, y: number, color: 'red' | 'blue') {
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.fillRect(x + 2, y + 4, 8, 8);
    ctx.fillStyle = color === 'red' ? '#ef4444' : '#3b82f6';
    ctx.fillRect(x + 3, y + 6, 6, 5);
    ctx.fillStyle = '#d97706';
    ctx.fillRect(x + 4, y + 2, 4, 2);
    if (this.animTick % 16 < 8) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x + 5, y + 7, 2, 2);
    }
  }

  private drawExitDoor(ctx: CanvasRenderingContext2D, x: number, y: number) {
    // Slate-blue stone archway
    ctx.fillStyle = '#475569';
    ctx.fillRect(x + 2, y, 28, 30);
    ctx.fillStyle = '#020617';
    ctx.fillRect(x + 6, y + 4, 20, 26);

    // Stairs descending into golden moonlight
    ctx.fillStyle = '#ca8a04';
    ctx.fillRect(x + 8, y + 12, 16, 4);
    ctx.fillStyle = '#eab308';
    ctx.fillRect(x + 10, y + 18, 12, 4);
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(x + 12, y + 24, 8, 4);
  }

  private drawMagicMirror(ctx: CanvasRenderingContext2D, x: number, y: number, state: number) {
    const isShattered = state === 1;

    ctx.fillStyle = '#78350f';
    ctx.fillRect(x + 3, y, 26, 48);
    ctx.fillStyle = '#d97706';
    ctx.fillRect(x + 5, y + 2, 22, 44);
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(x + 7, y + 4, 18, 2);

    if (!isShattered) {
      const pulse = Math.sin(this.animTick * 0.1) * 0.2 + 0.8;
      const grad = ctx.createLinearGradient(x + 7, y + 6, x + 25, y + 44);
      grad.addColorStop(0, `rgba(186, 230, 253, ${pulse})`);
      grad.addColorStop(0.5, `rgba(129, 140, 248, ${pulse * 0.85})`);
      grad.addColorStop(1, `rgba(192, 132, 252, ${pulse * 0.9})`);
      ctx.fillStyle = grad;
      ctx.fillRect(x + 7, y + 6, 18, 38);

      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.beginPath();
      ctx.moveTo(x + 9, y + 8);
      ctx.lineTo(x + 17, y + 8);
      ctx.lineTo(x + 9, y + 24);
      ctx.closePath();
      ctx.fill();

      // Shadow silhouette reflection
      ctx.fillStyle = 'rgba(15, 23, 42, 0.5)';
      ctx.fillRect(x + 13, y + 16, 6, 8);
      ctx.fillRect(x + 14, y + 24, 4, 12);
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(x + 15, y + 18, 1.5, 1.5);
    } else {
      ctx.fillStyle = '#05060f';
      ctx.fillRect(x + 7, y + 6, 18, 38);

      ctx.fillStyle = '#93c5fd';
      ctx.beginPath();
      ctx.moveTo(x + 7, y + 6);
      ctx.lineTo(x + 12, y + 13);
      ctx.lineTo(x + 16, y + 6);
      ctx.lineTo(x + 20, y + 11);
      ctx.lineTo(x + 25, y + 6);
      ctx.closePath();
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(x + 7, y + 44);
      ctx.lineTo(x + 11, y + 38);
      ctx.lineTo(x + 16, y + 44);
      ctx.lineTo(x + 21, y + 36);
      ctx.lineTo(x + 25, y + 44);
      ctx.closePath();
      ctx.fill();
    }
  }

  private renderForegroundOverlays(ctx: CanvasRenderingContext2D, engine: PrinceEngine) {
    const roomKey = `${engine.currentRoomX},${engine.currentRoomY}`;
    const room = engine.rooms.get(roomKey);
    if (!room) return;

    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 10; c++) {
        const tile = room[r][c];
        const tileX = c * engine.tileWidth;
        const tileY = r * engine.tileHeight;

        // Torches with vibrant 4-frame fire & iron bracket (as in image.png)
        if (tile.type === 'torch') {
          this.drawTorch(ctx, tileX + 12, tileY + 12);
        }

        // Iron Portcullis Gate
        if (tile.type === 'gate' && tile.gateId) {
          const g = engine.gates.get(tile.gateId);
          const openH = g ? g.height : 0;
          this.drawIronGate(ctx, tileX, tileY - openH);
        }

        // Chomper Trap Jaws
        if (tile.type === 'chomper') {
          this.drawChomper(ctx, tileX, tileY + 10, tile.state || 0);
        }
      }
    }
  }

  /**
   * Wall Torch with Authentic Cast Iron Sconce & Dancing Pixel Fire (from image.png)
   * Note: No artificial radial gradient circles so the dungeon background stays authentic pitch-black!
   */
  private drawTorch(ctx: CanvasRenderingContext2D, x: number, y: number) {
    // 1. Cast Iron Wall Mount Bracket (Authentic dark slate & iron)
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(x + 1, y + 6, 6, 9);
    ctx.fillStyle = '#475569';
    ctx.fillRect(x + 2, y + 7, 4, 2); // Iron rim
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(x + 2, y + 15, 4, 4); // Wall spike

    // 2. Animated Multi-Layer Pixel Fire (4 distinct frames matching image.png)
    const f = Math.floor(this.animTick / 3) % 4;
    const flameY = y - 6;

    // Dark red outer envelope
    ctx.fillStyle = '#b91c1c';
    ctx.fillRect(x + 1, flameY + 1 + (f === 2 ? 1 : 0), 6, 11);
    ctx.fillRect(x + 2, flameY - 1 + (f % 2), 4, 3);

    // Vivid orange flame body
    ctx.fillStyle = '#ea580c';
    ctx.fillRect(x + 2, flameY + 2 + (f === 1 ? 1 : 0), 4, 9);
    ctx.fillRect(x + 2, flameY + (f === 0 ? 0 : 1), 3, 3);

    // Intense golden yellow core
    ctx.fillStyle = '#facc15';
    ctx.fillRect(x + 2.5, flameY + 4, 3, 6);
    ctx.fillRect(x + 3, flameY + 2, 2, 3);

    // White-hot center spark
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x + 3, flameY + 5, 2, 3);

    // Flickering embers floating up
    if (f === 1 || f === 3) {
      ctx.fillStyle = '#f97316';
      ctx.fillRect(x + 3, flameY - 4, 1.5, 1.5);
    }
    if (f === 0 || f === 2) {
      ctx.fillStyle = '#facc15';
      ctx.fillRect(x + 4, flameY - 6, 1.5, 1.5);
    }
  }

  private drawIronGate(ctx: CanvasRenderingContext2D, x: number, y: number) {
    ctx.fillStyle = '#475569';
    ctx.fillRect(x + 4, y, 24, 60);

    ctx.fillStyle = '#080d1a';
    ctx.fillRect(x + 6, y + 6, 4, 48);
    ctx.fillRect(x + 14, y + 6, 4, 48);
    ctx.fillRect(x + 22, y + 6, 4, 48);

    ctx.fillStyle = '#94a3b8';
    for (let i = 0; i < 4; i++) {
      const bx = x + 5 + i * 6;
      ctx.beginPath();
      ctx.moveTo(bx, y + 55);
      ctx.lineTo(bx + 2, y + 60);
      ctx.lineTo(bx + 4, y + 55);
      ctx.closePath();
      ctx.fill();
    }
  }

  private drawChomper(ctx: CanvasRenderingContext2D, x: number, y: number, state: number) {
    const closed = state === 1;
    const offset = closed ? 0 : 8;

    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(x + 4 + offset, y, 6, 20);
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(x + 22 - offset, y, 6, 20);

    ctx.fillStyle = '#dc2626';
    ctx.fillRect(x + 8 + offset, y + 6, 2, 8);
  }

  /**
   * Render the Prince matching the rotoscoped aesthetics from image.png:
   * - Long flowing rose silk ribbon/sash in the wind
   * - White harem pants, athletic tunic/vest & boots
   * - Dynamic running, jumping, ledge hanging, and curved scimitar stances
   */
  private renderPrince(ctx: CanvasRenderingContext2D, engine: PrinceEngine) {
    const x = Math.round(engine.px);
    const y = Math.round(engine.py);
    const facingRight = engine.facing === 'right';

    ctx.save();
    ctx.translate(x, y);
    if (!facingRight) {
      ctx.scale(-1, 1);
    }

    // Color definitions based on skin choice
    const skinChoice = engine.settings.outfitSkin || 'rose_ribbon';
    const cSkin = '#fed7aa';
    const cSkinShadow = '#fba36e';
    const cHair = '#451a03';
    const cHairHighlight = '#78350f';
    const cTunic = '#ffffff';
    const cTunicMid = '#e2e8f0';
    const cTunicShade = '#94a3b8';

    // Sash colors
    const isRose = skinChoice === 'rose_ribbon';
    const isBlue = skinChoice === 'royal_blue';
    const cVest = isRose ? '#f472b6' : isBlue ? '#2563eb' : '#ffffff';
    const cVestShadow = isRose ? '#db2777' : isBlue ? '#1d4ed8' : '#cbd5e1';
    const cSash = isRose ? '#ec4899' : isBlue ? '#f59e0b' : '#dc2626';
    const cSashLight = isRose ? '#f43f5e' : isBlue ? '#fbbf24' : '#ef4444';
    const cSashDark = isRose ? '#be185d' : isBlue ? '#d97706' : '#991b1b';

    const cBoots = '#5c2c16';
    const cBootsHighlight = '#8c4220';
    const cSword = '#f8fafc';
    const cSwordShadow = '#94a3b8';

    switch (engine.action) {
      case 'idle': {
        const breathe = Math.floor(engine.animTimer / 15) % 2;

        // Head & Hair
        ctx.fillStyle = cHair;
        ctx.fillRect(-3, -29 + breathe, 7, 5);
        ctx.fillStyle = cHairHighlight;
        ctx.fillRect(-2, -29 + breathe, 4, 1);
        ctx.fillStyle = cSkin;
        ctx.fillRect(-1, -26 + breathe, 5, 5);
        ctx.fillStyle = cSkinShadow;
        ctx.fillRect(-1, -22 + breathe, 4, 1);
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(2, -25 + breathe, 1.5, 1.5); // Eye

        // Vest / Torso
        ctx.fillStyle = cVest;
        ctx.fillRect(-3, -21 + breathe, 8, 10);
        ctx.fillStyle = cVestShadow;
        ctx.fillRect(-3, -21 + breathe, 2, 10);

        // Waist Sash with knot
        ctx.fillStyle = cSash;
        ctx.fillRect(-4, -12 + breathe, 9, 3);
        ctx.fillStyle = cSashDark;
        ctx.fillRect(-4, -10 + breathe, 9, 1);
        ctx.fillStyle = cSashLight;
        ctx.fillRect(-5, -10 + breathe, 2, 5); // Hanging sash end

        // White Harem Pants
        ctx.fillStyle = cTunic;
        ctx.fillRect(-3, -8, 3, 7);
        ctx.fillRect(1, -8, 3, 7);
        ctx.fillStyle = cTunicMid;
        ctx.fillRect(-3, -8, 1, 7);
        ctx.fillRect(1, -8, 1, 7);
        ctx.fillStyle = cTunicShade;
        ctx.fillRect(-1, -8, 2, 7);

        // Leather Boots
        ctx.fillStyle = cBoots;
        ctx.fillRect(-4, -1, 4, 3);
        ctx.fillRect(1, -1, 4, 3);
        ctx.fillStyle = cBootsHighlight;
        ctx.fillRect(-4, -1, 3, 1);
        ctx.fillRect(1, -1, 3, 1);
        break;
      }

      case 'running': {
        const f = Math.floor(engine.animTimer / 3.2) % 6;
        const runFrames = [
          { legL: -6, legR: 5, bodyY: -1, armX: 3, sashWave: -10 },
          { legL: -4, legR: 3, bodyY: 0, armX: 4, sashWave: -13 },
          { legL: -1, legR: 1, bodyY: -2, armX: 2, sashWave: -16 },
          { legL: 4, legR: -5, bodyY: -1, armX: -2, sashWave: -14 },
          { legL: 6, legR: -3, bodyY: 0, armX: -3, sashWave: -12 },
          { legL: 2, legR: -1, bodyY: -2, armX: 1, sashWave: -11 },
        ][f];

        // Head leaning dynamically forward
        ctx.fillStyle = cHair;
        ctx.fillRect(0, -28 + runFrames.bodyY, 7, 5);
        ctx.fillStyle = cHairHighlight;
        ctx.fillRect(1, -28 + runFrames.bodyY, 4, 1);
        ctx.fillStyle = cSkin;
        ctx.fillRect(2, -25 + runFrames.bodyY, 5, 4);
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(5, -24 + runFrames.bodyY, 1.5, 1.5);

        // Torso leaning forward
        ctx.fillStyle = cVest;
        ctx.fillRect(-1, -21 + runFrames.bodyY, 8, 10);
        ctx.fillStyle = cVestShadow;
        ctx.fillRect(-1, -21 + runFrames.bodyY, 2, 10);

        // ICONIC FLOWING ROSE SILK RIBBON SASH STREAMING BEHIND (from image.png)
        ctx.fillStyle = cSash;
        ctx.fillRect(-4, -12 + runFrames.bodyY, 10, 3);

        // 3-wave billowing silk ribbon trail
        const wave1 = runFrames.sashWave;
        const wave2 = wave1 - 8;
        const wave3 = wave2 - 8;

        ctx.fillStyle = cSash;
        ctx.fillRect(wave1, -12 + runFrames.bodyY + Math.sin(this.animTick * 0.4) * 2, 8, 3);
        ctx.fillStyle = cSashLight;
        ctx.fillRect(wave2, -14 + runFrames.bodyY + Math.sin(this.animTick * 0.4 + 1) * 3, 9, 2.5);
        ctx.fillStyle = cSashDark;
        ctx.fillRect(wave3, -13 + runFrames.bodyY + Math.sin(this.animTick * 0.4 + 2) * 4, 8, 2);

        // Rotoscoped White Legs in Motion
        ctx.fillStyle = cTunic;
        ctx.fillRect(-3 + runFrames.legL, -8 + runFrames.bodyY, 3.5, 7);
        ctx.fillRect(1 + runFrames.legR, -8 + runFrames.bodyY, 3.5, 7);
        ctx.fillStyle = cTunicMid;
        ctx.fillRect(-3 + runFrames.legL, -8 + runFrames.bodyY, 1.5, 7);
        ctx.fillRect(1 + runFrames.legR, -8 + runFrames.bodyY, 1.5, 7);

        // Boots with momentum
        ctx.fillStyle = cBoots;
        ctx.fillRect(-4 + runFrames.legL, -1, 4, 3);
        ctx.fillRect(1 + runFrames.legR, -1, 4, 3);
        ctx.fillStyle = cBootsHighlight;
        ctx.fillRect(-4 + runFrames.legL, -1, 3, 1);
        ctx.fillRect(1 + runFrames.legR, -1, 3, 1);
        break;
      }

      case 'tiptoe': {
        const step = Math.floor(engine.animTimer / 7) % 2;
        ctx.fillStyle = cHair;
        ctx.fillRect(-2, -28, 6, 4);
        ctx.fillStyle = cSkin;
        ctx.fillRect(0, -25, 4, 4);
        ctx.fillStyle = cVest;
        ctx.fillRect(-2, -21, 7, 10);
        ctx.fillStyle = cSash;
        ctx.fillRect(-3, -11, 7, 2);
        ctx.fillStyle = cTunic;
        ctx.fillRect(-2, -8, 3, 7);
        ctx.fillRect(1 + (step ? 2 : 0), -8, 3, 7);
        ctx.fillStyle = cBoots;
        ctx.fillRect(-3, -1, 3, 2);
        ctx.fillRect(1 + (step ? 2 : 0), -1, 4, 2);
        break;
      }

      case 'jumping':
      case 'run_jump': {
        // Grand Jordan Mechner Athletic Leap (from image.png top-left)
        ctx.fillStyle = cHair;
        ctx.fillRect(0, -29, 7, 4);
        ctx.fillStyle = cHairHighlight;
        ctx.fillRect(1, -29, 4, 1);
        ctx.fillStyle = cSkin;
        ctx.fillRect(2, -26, 5, 4);

        // Forward reaching arms
        ctx.fillStyle = cVest;
        ctx.fillRect(5, -27, 7, 3);
        ctx.fillStyle = cSkin;
        ctx.fillRect(11, -27, 3, 3);

        ctx.fillStyle = cVest;
        ctx.fillRect(-2, -23, 9, 10);
        ctx.fillStyle = cSash;
        ctx.fillRect(-5, -14, 9, 3);
        // Ribbon trailing in air
        ctx.fillStyle = cSashLight;
        ctx.fillRect(-14, -13, 10, 2);
        ctx.fillRect(-22, -12, 9, 2);

        // Tucked athletic legs
        ctx.fillStyle = cTunic;
        ctx.fillRect(-6, -11, 7, 4);
        ctx.fillRect(1, -9, 7, 4);
        ctx.fillStyle = cBoots;
        ctx.fillRect(-8, -9, 4, 3);
        ctx.fillRect(5, -7, 5, 3);
        break;
      }

      case 'hanging': {
        // Hanging by fingertips from the stone block ledge (from image.png mid-left)
        ctx.fillStyle = cSkin;
        ctx.fillRect(0, -5, 5, 5); // Firm grip on top ledge
        ctx.fillStyle = cVest;
        ctx.fillRect(-1, 0, 5, 4); // Arms
        ctx.fillStyle = cHair;
        ctx.fillRect(-2, 4, 7, 4);
        ctx.fillStyle = cSkin;
        ctx.fillRect(-1, 7, 5, 4);
        ctx.fillStyle = cVest;
        ctx.fillRect(-2, 11, 7, 9);
        ctx.fillStyle = cSash;
        ctx.fillRect(-3, 19, 8, 2);
        ctx.fillStyle = cTunic;
        ctx.fillRect(-2, 21, 5, 8);
        ctx.fillStyle = cBoots;
        ctx.fillRect(-3, 28, 5, 3);
        break;
      }

      case 'climbing': {
        const pullProgress = Math.min(engine.frame, 12);
        const yShift = -pullProgress * 2;
        ctx.fillStyle = cHair;
        ctx.fillRect(-1, yShift - 8, 7, 5);
        ctx.fillStyle = cSkin;
        ctx.fillRect(0, yShift - 5, 5, 4);
        ctx.fillStyle = cVest;
        ctx.fillRect(-2, yShift - 1, 8, 14);
        ctx.fillStyle = cSash;
        ctx.fillRect(-3, yShift + 10, 8, 3);
        ctx.fillStyle = cBoots;
        ctx.fillRect(-3, yShift + 14, 6, 3);
        break;
      }

      case 'crouching': {
        ctx.fillStyle = cHair;
        ctx.fillRect(-1, -17, 7, 4);
        ctx.fillStyle = cSkin;
        ctx.fillRect(1, -14, 5, 4);
        ctx.fillStyle = cVest;
        ctx.fillRect(-3, -11, 9, 8);
        ctx.fillStyle = cSash;
        ctx.fillRect(-4, -4, 9, 2);
        ctx.fillStyle = cBoots;
        ctx.fillRect(-5, -2, 10, 3);
        break;
      }

      case 'sword_idle': {
        // Fencing ready stance with curved scimitar (from image.png bottom center)
        ctx.fillStyle = cHair;
        ctx.fillRect(-2, -29, 7, 5);
        ctx.fillStyle = cHairHighlight;
        ctx.fillRect(-1, -29, 4, 1);
        ctx.fillStyle = cSkin;
        ctx.fillRect(-1, -26, 5, 4);
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(2, -25, 1.5, 1.5);

        ctx.fillStyle = cVest;
        ctx.fillRect(-3, -22, 8, 10);
        ctx.fillStyle = cSash;
        ctx.fillRect(-4, -13, 8, 3);

        ctx.fillStyle = cTunic;
        ctx.fillRect(-5, -10, 4, 8);
        ctx.fillRect(2, -10, 4, 8);
        ctx.fillStyle = cBoots;
        ctx.fillRect(-6, -2, 4, 3);
        ctx.fillRect(3, -2, 4, 3);

        // Raised gleaming curved steel scimitar
        ctx.fillStyle = cSword;
        ctx.fillRect(6, -25, 14, 2);
        ctx.fillRect(18, -27, 3, 2);
        ctx.fillStyle = cSwordShadow;
        ctx.fillRect(6, -24, 14, 1);
        ctx.fillStyle = '#eab308';
        ctx.fillRect(4, -25, 2, 4);
        ctx.fillStyle = '#78350f';
        ctx.fillRect(2, -24, 3, 2);
        break;
      }

      case 'sword_strike': {
        ctx.fillStyle = cHair;
        ctx.fillRect(-1, -28, 7, 5);
        ctx.fillStyle = cSkin;
        ctx.fillRect(1, -25, 5, 4);
        ctx.fillStyle = cVest;
        ctx.fillRect(-2, -21, 10, 10);
        ctx.fillStyle = cSash;
        ctx.fillRect(-4, -12, 9, 3);

        ctx.fillStyle = cTunic;
        ctx.fillRect(-7, -9, 6, 7);
        ctx.fillRect(3, -9, 7, 7);
        ctx.fillStyle = cBoots;
        ctx.fillRect(-9, -2, 5, 3);
        ctx.fillRect(5, -2, 6, 3);

        // Thrusting curved steel scimitar with blade trail
        ctx.fillStyle = cSword;
        ctx.fillRect(8, -19, 20, 2);
        ctx.fillRect(26, -21, 3, 3);
        ctx.fillStyle = cSwordShadow;
        ctx.fillRect(8, -18, 20, 1);

        ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
        ctx.fillRect(10, -24, 16, 2);
        ctx.fillRect(14, -22, 14, 2);
        break;
      }

      case 'sword_parry': {
        ctx.fillStyle = cHair;
        ctx.fillRect(-2, -29, 7, 5);
        ctx.fillStyle = cSkin;
        ctx.fillRect(-1, -26, 5, 4);
        ctx.fillStyle = cVest;
        ctx.fillRect(-3, -22, 8, 10);
        ctx.fillStyle = cSash;
        ctx.fillRect(-4, -13, 8, 3);
        ctx.fillStyle = cBoots;
        ctx.fillRect(-5, -2, 4, 3);
        ctx.fillRect(2, -2, 4, 3);

        ctx.fillStyle = cSword;
        ctx.fillRect(4, -32, 2, 18);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(5, -34, 3, 3);
        break;
      }

      case 'dead': {
        // Pool of dark crimson blood on the dungeon floor
        ctx.fillStyle = '#450a0a';
        ctx.fillRect(-22, -1, 36, 2);
        ctx.fillStyle = '#991b1b';
        ctx.fillRect(-18, -2, 28, 2);
        ctx.fillStyle = '#dc2626';
        ctx.fillRect(-12, -2, 16, 1);

        // Limp rotoscoped defeated Prince lying prone
        ctx.fillStyle = cHair;
        ctx.fillRect(-18, -4, 8, 4);
        ctx.fillStyle = cSkin;
        ctx.fillRect(-10, -3, 4, 3);
        ctx.fillStyle = cVest;
        ctx.fillRect(-7, -4, 15, 4);
        ctx.fillStyle = cSash;
        ctx.fillRect(-1, -4, 5, 4);
        ctx.fillStyle = cTunic;
        ctx.fillRect(4, -4, 8, 4);
        ctx.fillStyle = cBoots;
        ctx.fillRect(11, -3, 6, 3);

        // Fallen scimitar on the floor
        if (engine.hasSword) {
          ctx.fillStyle = '#94a3b8';
          ctx.fillRect(-14, -1, 16, 1);
          ctx.fillStyle = '#e2e8f0';
          ctx.fillRect(-12, -2, 12, 1);
          ctx.fillStyle = '#eab308';
          ctx.fillRect(2, -3, 2, 3); // Gold hilt
        }
        break;
      }

      default: {
        ctx.fillStyle = cVest;
        ctx.fillRect(-3, -21, 7, 18);
      }
    }

    ctx.restore();
  }

  /**
   * Render Palace Guards, Skeletons & Shadow Prince
   */
  private renderGuards(ctx: CanvasRenderingContext2D, engine: PrinceEngine) {
    engine.guards.forEach((guard) => {
      if (guard.roomX !== engine.currentRoomX || guard.roomY !== engine.currentRoomY) return;

      const x = Math.round(guard.x);
      const y = Math.round(guard.y);
      const facingRight = guard.facing === 'right';

      ctx.save();
      ctx.translate(x, y);
      if (!facingRight) {
        ctx.scale(-1, 1);
      }

      // 1. SKELETON GUARD (Level 3 - The Undead Fighter)
      if (guard.type === 'skeleton') {
        const cBone = '#f8fafc';
        const cShadowBone = '#cbd5e1';

        if (guard.action === 'dead') {
          ctx.fillStyle = cBone;
          ctx.fillRect(-10, -3, 6, 2);
          ctx.fillRect(-4, -2, 8, 2);
          ctx.fillRect(2, -3, 6, 2);
          ctx.fillRect(-8, -6, 5, 4);
          ctx.fillStyle = '#000000';
          ctx.fillRect(-6, -5, 1.5, 1.5);
          ctx.restore();
          return;
        }

        const rattle = guard.action === 'hurt' ? (Math.sin(this.animTick * 2.5) * 3) : 0;
        ctx.translate(rattle, 0);

        ctx.fillStyle = cBone;
        ctx.fillRect(-3, -28, 7, 7);
        ctx.fillStyle = '#020617';
        ctx.fillRect(-1, -26, 2, 2);
        ctx.fillRect(2, -26, 2, 2);
        ctx.fillRect(1, -23, 1, 1);
        ctx.fillStyle = cShadowBone;
        ctx.fillRect(-2, -21, 5, 2);

        ctx.fillStyle = cBone;
        ctx.fillRect(0, -19, 2, 9);
        ctx.fillRect(-4, -18, 9, 2);
        ctx.fillRect(-3, -15, 8, 2);
        ctx.fillRect(-2, -12, 6, 2);
        ctx.fillRect(-3, -9, 8, 3);

        ctx.fillStyle = cBone;
        ctx.fillRect(-3, -6, 2, 6);
        ctx.fillRect(2, -6, 2, 6);
        ctx.fillRect(-4, -1, 3, 2);
        ctx.fillRect(2, -1, 3, 2);

        if (guard.action === 'strike') {
          ctx.fillStyle = cBone;
          ctx.fillRect(2, -17, 8, 2);
          ctx.fillStyle = '#e2e8f0';
          ctx.fillRect(10, -18, 16, 2);
          ctx.fillStyle = '#78350f';
          ctx.fillRect(9, -20, 2, 5);
        } else {
          ctx.fillStyle = cBone;
          ctx.fillRect(2, -16, 4, 2);
          ctx.fillStyle = '#e2e8f0';
          ctx.fillRect(6, -24, 12, 2);
          ctx.fillStyle = '#78350f';
          ctx.fillRect(5, -25, 2, 4);
        }

        ctx.restore();
        return;
      }

      // 2. SHADOW PRINCE (Level 4)
      if (guard.type === 'shadow') {
        const cShadowTunic = '#020617';
        const cShadowSash = '#4338ca';
        const cShadowSkin = '#0f172a';
        const cShadowHair = '#000000';
        const cEyeGlow = '#ef4444';

        if (guard.action === 'dead') {
          ctx.fillStyle = 'rgba(99, 102, 241, 0.4)';
          ctx.fillRect(-8, -4, 16, 4);
          ctx.restore();
          return;
        }

        const auraPulse = Math.sin(this.animTick * 0.15) * 2;
        ctx.fillStyle = 'rgba(99, 102, 241, 0.2)';
        ctx.fillRect(-7 - auraPulse, -32, 16 + auraPulse * 2, 32);

        ctx.fillStyle = cShadowHair;
        ctx.fillRect(-2, -28, 6, 5);
        ctx.fillStyle = cShadowSkin;
        ctx.fillRect(-1, -25, 5, 5);
        ctx.fillStyle = cEyeGlow;
        ctx.fillRect(2, -24, 2, 2);

        ctx.fillStyle = cShadowTunic;
        ctx.fillRect(-3, -20, 7, 9);
        ctx.fillStyle = cShadowSash;
        ctx.fillRect(-3, -11, 7, 3);
        ctx.fillStyle = cShadowTunic;
        ctx.fillRect(-4, -8, 4, 6);
        ctx.fillRect(1, -8, 4, 6);
        ctx.fillStyle = '#000000';
        ctx.fillRect(-5, -2, 4, 3);
        ctx.fillRect(2, -2, 4, 3);

        if (guard.action === 'strike') {
          ctx.fillStyle = '#818cf8';
          ctx.fillRect(6, -18, 16, 2);
        } else {
          ctx.fillStyle = '#818cf8';
          ctx.fillRect(4, -24, 12, 2);
        }

        ctx.restore();
        return;
      }

      // 3. PALACE GUARDS (with Turban, Leather Armor & Curved Scimitar from image.png)
      const cVest = guard.type === 'yellow' ? '#ca8a04' : '#2563eb';
      const cTurban = guard.type === 'yellow' ? '#ea580c' : '#dc2626';

      if (guard.action === 'dead') {
        ctx.fillStyle = cTurban;
        ctx.fillRect(-12, -4, 6, 4);
        ctx.fillStyle = cVest;
        ctx.fillRect(-6, -4, 12, 4);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(6, -3, 6, 3);
        ctx.restore();
        return;
      }

      // Turban & Feather
      ctx.fillStyle = cTurban;
      ctx.fillRect(-3, -30, 8, 6);
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(0, -32, 2, 3);

      // Face & Beard
      ctx.fillStyle = '#fed7aa';
      ctx.fillRect(-1, -25, 5, 4);
      ctx.fillStyle = '#1e1b4b';
      ctx.fillRect(0, -22, 4, 3);

      // Vest & Trousers
      ctx.fillStyle = cVest;
      ctx.fillRect(-4, -19, 8, 9);
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(-4, -10, 4, 7);
      ctx.fillRect(1, -10, 4, 7);
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(-5, -3, 4, 3);
      ctx.fillRect(2, -3, 4, 3);

      // Curved Steel Scimitar
      if (guard.action === 'strike') {
        ctx.fillStyle = '#e2e8f0';
        ctx.fillRect(6, -18, 16, 2);
        ctx.fillRect(20, -20, 2, 2);
      } else {
        ctx.fillStyle = '#e2e8f0';
        ctx.fillRect(4, -24, 10, 2);
        ctx.fillRect(12, -26, 2, 2);
      }

      ctx.restore();
    });
  }

  /**
   * Authentic Prince of Persia HUD:
   * Left: Player red health triangles with gold border
   * Right: Guard health triangles
   * Center: Golden serif text banner & 60-min timer
   */
  private renderHUD(ctx: CanvasRenderingContext2D, engine: PrinceEngine) {
    ctx.fillStyle = '#020409';
    ctx.fillRect(0, 180, this.width, 20);
    ctx.fillStyle = '#334155';
    ctx.fillRect(0, 180, this.width, 1);

    // 1. Player Health (Red Triangles)
    for (let i = 0; i < engine.maxHealth; i++) {
      const tx = 10 + i * 11;
      const ty = 188;
      const isFilled = i < engine.health;

      ctx.fillStyle = isFilled ? '#dc2626' : '#450a0a';
      ctx.beginPath();
      ctx.moveTo(tx, ty);
      ctx.lineTo(tx + 8, ty);
      ctx.lineTo(tx + 4, ty + 7);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = '#eab308';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // 2. Active Guard Health
    const activeGuard = engine.guards.find(g => 
      g.roomX === engine.currentRoomX && 
      g.roomY === engine.currentRoomY && 
      g.health > 0
    );

    if (activeGuard) {
      for (let i = 0; i < activeGuard.maxHealth; i++) {
        const tx = this.width - 20 - i * 11;
        const ty = 188;
        const isFilled = i < activeGuard.health;

        ctx.fillStyle = isFilled ? '#2563eb' : '#172554';
        ctx.beginPath();
        ctx.moveTo(tx, ty);
        ctx.lineTo(tx + 8, ty);
        ctx.lineTo(tx + 4, ty + 7);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = '#60a5fa';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }

    // 3. Center Banner Message or Countdown Timer
    ctx.font = '7px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    if (engine.bannerTimer > 0) {
      ctx.fillStyle = '#fbbf24';
      ctx.fillText(engine.bannerText, this.width / 2, 190);
    } else {
      const minStr = engine.minutesRemaining.toString().padStart(2, '0');
      const secStr = engine.secondsRemaining.toString().padStart(2, '0');
      ctx.fillStyle = '#94a3b8';
      ctx.fillText(`TIME: ${minStr}:${secStr}`, this.width / 2, 190);
    }
  }

  private drawToScreen(engine: PrinceEngine) {
    const destW = this.canvas.width;
    const destH = this.canvas.height;

    this.ctx.imageSmoothingEnabled = false;
    this.ctx.drawImage(this.offscreen, 0, 0, destW, destH);

    // Optional CRT Scanlines Filter
    if (engine.settings.scanlines) {
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.16)';
      for (let y = 0; y < destH; y += 3) {
        this.ctx.fillRect(0, y, destW, 1);
      }
    }
  }
}
