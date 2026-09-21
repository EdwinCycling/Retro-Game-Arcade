/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Lemmings (1991 DMA Design) - Destructible Terrain Engine & Bitmask
 */

import { LemmingsLevel, TerrainElement } from './lemmingsTypes';

export class LemmingsTerrain {
  public width: number = 800;
  public height: number = 320;
  
  // Offscreen canvas containing the live rendered destructible terrain
  public canvas: HTMLCanvasElement;
  public ctx: CanvasRenderingContext2D;
  
  // Steel mask canvas (steel is indestructible)
  private steelCanvas: HTMLCanvasElement;
  private steelCtx: CanvasRenderingContext2D;

  constructor(width: number = 800, height: number = 320) {
    this.width = width;
    this.height = height;

    this.canvas = document.createElement('canvas');
    this.canvas.width = width;
    this.canvas.height = height;
    this.ctx = this.canvas.getContext('2d', { willReadFrequently: true })!;

    this.steelCanvas = document.createElement('canvas');
    this.steelCanvas.width = width;
    this.steelCanvas.height = height;
    this.steelCtx = this.steelCanvas.getContext('2d', { willReadFrequently: true })!;
  }

  public initLevel(level: LemmingsLevel) {
    this.width = level.width;
    this.height = level.height;

    this.canvas.width = level.width;
    this.canvas.height = level.height;
    this.steelCanvas.width = level.width;
    this.steelCanvas.height = level.height;

    this.ctx.clearRect(0, 0, this.width, this.height);
    this.steelCtx.clearRect(0, 0, this.width, this.height);

    // Draw all terrain elements
    for (const elem of level.elements) {
      this.drawTerrainElement(elem);
    }
  }

  private drawTerrainElement(elem: TerrainElement) {
    const isSteel = elem.material === 'steel';
    const ctx = this.ctx;

    ctx.save();

    if (elem.type === 'rect') {
      const x = elem.x;
      const y = elem.y;
      const w = elem.w || 50;
      const h = elem.h || 50;

      if (isSteel) {
        // Metallic steel plate with rivets
        ctx.fillStyle = '#64748b';
        ctx.fillRect(x, y, w, h);
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(x, y, w, 2);
        ctx.fillStyle = '#334155';
        ctx.fillRect(x, y + h - 2, w, 2);

        // Draw rivets
        ctx.fillStyle = '#cbd5e1';
        for (let rx = x + 4; rx < x + w - 2; rx += 16) {
          ctx.fillRect(rx, y + 3, 2, 2);
          ctx.fillRect(rx, y + h - 5, 2, 2);
        }

        // Also mark on steel canvas
        this.steelCtx.fillStyle = '#ffffff';
        this.steelCtx.fillRect(x, y, w, h);
      } else if (elem.texture === 'moss' || elem.material === 'dirt') {
        // Earth / Dirt with lush green moss on top
        const grad = ctx.createLinearGradient(x, y, x, y + h);
        grad.addColorStop(0, '#5c3a21');
        grad.addColorStop(0.3, '#42220f');
        grad.addColorStop(1, '#2c1407');
        ctx.fillStyle = grad;
        ctx.fillRect(x, y, w, h);

        // Mossy grass fringe along top edge
        ctx.fillStyle = '#15803d';
        ctx.fillRect(x, y, w, 3);
        ctx.fillStyle = '#22c55e';
        for (let gx = x; gx < x + w; gx += 3) {
          const grassH = 2 + ((gx * 7) % 4);
          ctx.fillRect(gx, y - grassH + 2, 2, grassH);
        }

        // Earth pebble speckles
        ctx.fillStyle = '#78350f';
        for (let px = x + 4; px < x + w - 4; px += 12) {
          const py = y + 4 + ((px * 13) % Math.max(1, h - 8));
          ctx.fillRect(px, py, 3, 2);
        }
      } else if (elem.material === 'stone' || elem.texture === 'brick') {
        // Ancient Aztec / Roman stone masonry
        ctx.fillStyle = '#52525b';
        ctx.fillRect(x, y, w, h);

        ctx.fillStyle = '#71717a';
        ctx.fillRect(x, y, w, 2);
        ctx.fillStyle = '#27272a';
        ctx.fillRect(x, y + h - 2, w, 2);

        // Brick mortar lines
        ctx.fillStyle = '#18181b';
        const rowH = 10;
        for (let ry = y; ry < y + h; ry += rowH) {
          ctx.fillRect(x, ry, w, 1);
          const offset = ((ry - y) / rowH) % 2 === 0 ? 0 : 10;
          for (let rx = x + offset; rx < x + w; rx += 20) {
            ctx.fillRect(rx, ry, 1, Math.min(rowH, y + h - ry));
          }
        }
      } else if (elem.texture === 'crystal') {
        // Glowing cyan crystal cavern rock
        const grad = ctx.createLinearGradient(x, y, x, y + h);
        grad.addColorStop(0, '#0e7490');
        grad.addColorStop(1, '#164e63');
        ctx.fillStyle = grad;
        ctx.fillRect(x, y, w, h);
        ctx.fillStyle = '#22d3ee';
        ctx.fillRect(x, y, w, 2);
      }
    }

    ctx.restore();
  }

  // Check if pixel at (x, y) is solid terrain
  public isSolid(x: number, y: number): boolean {
    const ix = Math.floor(x);
    const iy = Math.floor(y);
    if (ix < 0 || ix >= this.width || iy < 0 || iy >= this.height) {
      return false;
    }
    try {
      const pixel = this.ctx.getImageData(ix, iy, 1, 1).data;
      return pixel[3] > 60; // Alpha threshold
    } catch {
      return false;
    }
  }

  // Check if pixel at (x, y) is indestructible steel
  public isSteel(x: number, y: number): boolean {
    const ix = Math.floor(x);
    const iy = Math.floor(y);
    if (ix < 0 || ix >= this.width || iy < 0 || iy >= this.height) {
      return false;
    }
    try {
      const pixel = this.steelCtx.getImageData(ix, iy, 1, 1).data;
      return pixel[3] > 60;
    } catch {
      return false;
    }
  }

  // Bomber explosion: Carves a circular hole out of the terrain
  public carveCircle(x: number, y: number, radius: number = 14): boolean {
    // Check if hitting solid steel
    if (this.isSteel(x, y)) {
      return false;
    }

    this.ctx.save();
    this.ctx.globalCompositeOperation = 'destination-out';
    this.ctx.beginPath();
    this.ctx.arc(x, y, radius, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.restore();
    return true;
  }

  // Digger: Carves 8px wide vertical tunnel downwards
  public carveDigger(x: number, y: number): boolean {
    if (this.isSteel(x, y + 2)) {
      return false;
    }

    this.ctx.save();
    this.ctx.globalCompositeOperation = 'destination-out';
    this.ctx.fillRect(x - 5, y, 10, 3);
    this.ctx.restore();
    return true;
  }

  // Basher: Carves horizontal tunnel 6px wide, 12px high in direction
  public carveBasher(x: number, y: number, dir: 1 | -1): boolean {
    const targetX = dir === 1 ? x : x - 6;
    if (this.isSteel(x + dir * 4, y - 6)) {
      return false;
    }

    this.ctx.save();
    this.ctx.globalCompositeOperation = 'destination-out';
    this.ctx.fillRect(targetX, y - 12, 6, 13);
    this.ctx.restore();
    return true;
  }

  // Miner: Carves diagonal shaft downwards (45 degrees)
  public carveMiner(x: number, y: number, dir: 1 | -1): boolean {
    const targetX = dir === 1 ? x : x - 8;
    if (this.isSteel(x + dir * 5, y + 2)) {
      return false;
    }

    this.ctx.save();
    this.ctx.globalCompositeOperation = 'destination-out';
    this.ctx.fillRect(targetX, y - 8, 8, 12);
    this.ctx.restore();
    return true;
  }

  // Builder: Places a solid brick step (4px wide, 2px high)
  public placeBuilderBrick(x: number, y: number, dir: 1 | -1): boolean {
    const brickX = dir === 1 ? x - 1 : x - 4;
    const brickY = y - 1;

    this.ctx.save();
    this.ctx.fillStyle = '#b45309';
    this.ctx.fillRect(brickX, brickY, 5, 2);
    this.ctx.fillStyle = '#f59e0b';
    this.ctx.fillRect(brickX, brickY, 5, 1);
    this.ctx.restore();

    return true;
  }
}
