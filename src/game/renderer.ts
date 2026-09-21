/**
 * Authentic 1980 Pac-Man Canvas Renderer
 */

import { FruitBonus, FruitType, GameState, GhostEntity, PacmanEntity, ScorePopup } from '../types';
import {
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  MAZE_COLS,
  MAZE_ROWS,
  MAZE_Y_OFFSET,
  ORIGINAL_MAZE_MAP,
  TILE_SIZE
} from './constants';

export class PacmanRenderer {
  private ctx: CanvasRenderingContext2D;

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
  }

  public clear() {
    this.ctx.fillStyle = '#000000';
    this.ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  }

  /**
   * Draw the classic maze walls, dots, and energizers
   */
  public drawMaze(
    maze: string[],
    flashEnergizer: boolean,
    levelClearFlash: boolean = false,
    customColors?: { wallColor?: string; dotColor?: string; energizerColor?: string }
  ) {
    const ctx = this.ctx;
    // Walls color based on active maze theme or flash
    const wallColor = levelClearFlash ? '#ffffff' : (customColors?.wallColor || '#2563eb');
    const dotColor = customColors?.dotColor || '#ffb8ae';
    const energizerColor = customColors?.energizerColor || '#ffb8ae';

    for (let r = 0; r < MAZE_ROWS; r++) {
      const row = maze[r];
      const y = r * TILE_SIZE + MAZE_Y_OFFSET;

      for (let c = 0; c < MAZE_COLS; c++) {
        const char = row[c];
        const x = c * TILE_SIZE;

        if (char === 'W') {
          this.drawWallTile(c, r, maze, wallColor);
        } else if (char === '.') {
          // Normal dot (pellet)
          ctx.fillStyle = dotColor;
          ctx.fillRect(x + 7, y + 7, 2.5, 2.5);
        } else if (char === 'o') {
          // Energizer (Power Pellet)
          if (flashEnergizer) {
            ctx.fillStyle = energizerColor;
            ctx.beginPath();
            ctx.arc(x + 8, y + 8, 5, 0, Math.PI * 2);
            ctx.fill();
          }
        } else if (char === '-') {
          // Ghost house door
          ctx.fillStyle = '#ffb8ff';
          ctx.fillRect(x, y + 7, TILE_SIZE, 3);
        }
      }
    }
  }

  /**
   * Draw wall tiles with classic arcade connected outlines
   */
  private drawWallTile(c: number, r: number, maze: string[], color: string) {
    const ctx = this.ctx;
    const x = c * TILE_SIZE;
    const y = r * TILE_SIZE + MAZE_Y_OFFSET;

    ctx.fillStyle = color;

    // Check adjacent neighbors to render clean solid connected corridors
    const up = r > 0 && maze[r - 1][c] === 'W';
    const down = r < MAZE_ROWS - 1 && maze[r + 1][c] === 'W';
    const left = c > 0 && maze[r][c - 1] === 'W';
    const right = c < MAZE_COLS - 1 && maze[r][c + 1] === 'W';

    // Draw central node and arms
    const w = 4;
    const offset = (TILE_SIZE - w) / 2;

    // Center block
    ctx.fillRect(x + offset, y + offset, w, w);

    // Connected segments
    if (up) ctx.fillRect(x + offset, y, w, offset);
    if (down) ctx.fillRect(x + offset, y + offset + w, w, offset);
    if (left) ctx.fillRect(x, y + offset, offset, w);
    if (right) ctx.fillRect(x + offset + w, y + offset, offset, w);
  }

  /**
   * Draw Pac-Man with mouth animation or death animation
   */
  public drawPacman(pacman: PacmanEntity) {
    const ctx = this.ctx;

    if (pacman.isDead) {
      this.drawPacmanDeath(pacman);
      return;
    }

    ctx.save();
    ctx.translate(pacman.x, pacman.y);

    let rotation = 0;
    if (pacman.dir === 'RIGHT') rotation = 0;
    else if (pacman.dir === 'DOWN') rotation = Math.PI * 0.5;
    else if (pacman.dir === 'LEFT') rotation = Math.PI;
    else if (pacman.dir === 'UP') rotation = Math.PI * 1.5;

    ctx.rotate(rotation);

    // Mouth angle radians (0 to ~0.35 * PI)
    const mouthRad = pacman.mouthAngle;

    ctx.fillStyle = '#ffff00';
    ctx.beginPath();
    ctx.arc(0, 0, 9, mouthRad, Math.PI * 2 - mouthRad);
    ctx.lineTo(0, 0);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  /**
   * Draw the authentic death collapse animation
   */
  private drawPacmanDeath(pacman: PacmanEntity) {
    const ctx = this.ctx;
    const progress = Math.min(1, Math.max(0, pacman.deathProgress));

    ctx.save();
    ctx.translate(pacman.x, pacman.y);

    if (progress < 0.85) {
      const mouthOpen = (progress / 0.85) * Math.PI;
      ctx.fillStyle = '#ffff00';
      ctx.beginPath();
      ctx.arc(0, 0, 9, -Math.PI * 0.5 + mouthOpen, -Math.PI * 0.5 - mouthOpen + Math.PI * 2);
      ctx.lineTo(0, 0);
      ctx.closePath();
      ctx.fill();
    } else {
      // Small pop spark at the very end
      const sparkProgress = (progress - 0.85) / 0.15;
      const len = 4 * (1 - sparkProgress);
      ctx.strokeStyle = '#ffff00';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-len, 0); ctx.lineTo(len, 0);
      ctx.moveTo(0, -len); ctx.lineTo(0, len);
      ctx.stroke();
    }

    ctx.restore();
  }

  /**
   * Draw Ghost with authentic skirt animation, eyes, frightened and eaten states
   */
  public drawGhost(ghost: GhostEntity, tick: number) {
    const ctx = this.ctx;
    const x = ghost.x;
    const y = ghost.y;
    const radius = 8.5;

    ctx.save();
    ctx.translate(x, y);

    if (ghost.mode === 'EATEN') {
      // Only draw the floating eyeballs
      this.drawGhostEyes(ctx, ghost.dir);
      ctx.restore();
      return;
    }

    // Determine Ghost Body Color
    let bodyColor = ghost.color;
    if (ghost.mode === 'FRIGHTENED') {
      if (ghost.frightenedFlash) {
        // Flash between white and blue
        bodyColor = (Math.floor(tick / 10) % 2 === 0) ? '#ffffff' : '#2121ff';
      } else {
        bodyColor = '#2121ff'; // Classic deep blue
      }
    }

    // Body shape: dome on top, vertical sides, wavy skirt on bottom
    ctx.fillStyle = bodyColor;
    ctx.beginPath();
    ctx.arc(0, -2, radius, Math.PI, 0, false);
    ctx.lineTo(radius, 6);

    // Skirt waves (alternates 2 frames based on ghost.animationFrame or tick)
    const waveFrame = Math.floor(tick / 8) % 2;
    const feetCount = 3;
    const step = (radius * 2) / feetCount;

    if (waveFrame === 0) {
      ctx.lineTo(radius - 2, 4);
      ctx.lineTo(radius - 5, 6);
      ctx.lineTo(0, 4);
      ctx.lineTo(-5, 6);
      ctx.lineTo(-7, 4);
      ctx.lineTo(-radius, 6);
    } else {
      ctx.lineTo(radius - 3, 7);
      ctx.lineTo(radius - 6, 4);
      ctx.lineTo(0, 7);
      ctx.lineTo(-4, 4);
      ctx.lineTo(-7, 7);
      ctx.lineTo(-radius, 6);
    }

    ctx.closePath();
    ctx.fill();

    // Eyes / Face details
    if (ghost.mode === 'FRIGHTENED') {
      // Frightened face: small white eyes and wavy mouth
      const faceColor = ghost.frightenedFlash && bodyColor === '#ffffff' ? '#ff0000' : '#ffb8ae';
      
      // Eyes
      ctx.fillStyle = faceColor;
      ctx.fillRect(-4, -4, 2.5, 2.5);
      ctx.fillRect(2, -4, 2.5, 2.5);

      // Wavy mouth
      ctx.strokeStyle = faceColor;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(-5, 2);
      ctx.lineTo(-3, 0);
      ctx.lineTo(-1, 2);
      ctx.lineTo(1, 0);
      ctx.lineTo(3, 2);
      ctx.lineTo(5, 0);
      ctx.stroke();
    } else {
      // Normal looking eyes pointing in direction
      this.drawGhostEyes(ctx, ghost.dir);
    }

    ctx.restore();
  }

  /**
   * Draw Ghost Eyes looking in current direction
   */
  private drawGhostEyes(ctx: CanvasRenderingContext2D, dir: string) {
    let pupilDx = 0;
    let pupilDy = 0;

    if (dir === 'LEFT') pupilDx = -2;
    else if (dir === 'RIGHT') pupilDx = 2;
    else if (dir === 'UP') pupilDy = -2;
    else if (dir === 'DOWN') pupilDy = 2;

    // White eye sclera
    ctx.fillStyle = '#ffffff';
    // Left eye
    ctx.beginPath();
    ctx.ellipse(-3.5, -2, 3, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    // Right eye
    ctx.beginPath();
    ctx.ellipse(3.5, -2, 3, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Blue pupils
    ctx.fillStyle = '#0000de';
    ctx.beginPath();
    ctx.arc(-3.5 + pupilDx, -2 + pupilDy, 1.8, 0, Math.PI * 2);
    ctx.arc(3.5 + pupilDx, -2 + pupilDy, 1.8, 0, Math.PI * 2);
    ctx.fill();
  }

  /**
   * Draw Fruit bonus sprite
   */
  public drawFruit(fruit: FruitBonus) {
    if (!fruit.active) return;
    this.drawFruitIcon(this.ctx, fruit.type, fruit.x, fruit.y, 14);
  }

  /**
   * Draw standalone fruit icon at any position
   */
  public drawFruitIcon(
    ctx: CanvasRenderingContext2D,
    type: FruitType,
    x: number,
    y: number,
    size: number = 14
  ) {
    ctx.save();
    ctx.translate(x, y);
    const half = size / 2;

    switch (type) {
      case 'CHERRY': {
        // Red cherries
        ctx.fillStyle = '#ff0000';
        ctx.beginPath();
        ctx.arc(-3, 3, 4, 0, Math.PI * 2);
        ctx.arc(4, 2, 4, 0, Math.PI * 2);
        ctx.fill();
        // Green stems
        ctx.strokeStyle = '#00ff00';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(-3, 1);
        ctx.quadraticCurveTo(-1, -5, 2, -6);
        ctx.moveTo(4, 0);
        ctx.quadraticCurveTo(3, -5, 2, -6);
        ctx.stroke();
        break;
      }
      case 'STRAWBERRY': {
        // Red body with green top
        ctx.fillStyle = '#ff0000';
        ctx.beginPath();
        ctx.ellipse(0, 2, 5, 6, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#00ff00';
        ctx.fillRect(-4, -4, 8, 2);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(-2, 0, 1, 1);
        ctx.fillRect(2, 1, 1, 1);
        ctx.fillRect(0, 4, 1, 1);
        break;
      }
      case 'PEACH': {
        // Orange peach with green stem
        ctx.fillStyle = '#ffb851';
        ctx.beginPath();
        ctx.arc(0, 2, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#00ff00';
        ctx.fillRect(-1, -5, 3, 2);
        break;
      }
      case 'APPLE': {
        ctx.fillStyle = '#ff0000';
        ctx.beginPath();
        ctx.arc(0, 2, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#00ff00';
        ctx.fillRect(0, -4, 2, 3);
        break;
      }
      case 'MELON': {
        ctx.fillStyle = '#00ff00';
        ctx.beginPath();
        ctx.ellipse(0, 1, 7, 5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#006600';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        break;
      }
      case 'GALAXIAN': {
        // Galaxian Boss icon: yellow top, blue wings, red core
        ctx.fillStyle = '#ffff00';
        ctx.beginPath();
        ctx.moveTo(0, -6);
        ctx.lineTo(-4, -1);
        ctx.lineTo(4, -1);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#0000ff';
        ctx.fillRect(-6, 0, 12, 3);
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(-2, 3, 4, 3);
        break;
      }
      case 'BELL': {
        ctx.fillStyle = '#ffff00';
        ctx.beginPath();
        ctx.moveTo(0, -6);
        ctx.lineTo(6, 4);
        ctx.lineTo(-6, 4);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(-2, 4, 4, 2);
        break;
      }
      case 'KEY': {
        ctx.fillStyle = '#00ffff';
        ctx.fillRect(-2, -6, 4, 8);
        ctx.fillRect(-4, -6, 8, 3);
        ctx.fillRect(0, 2, 3, 2);
        break;
      }
      case 'PRETZEL': {
        ctx.strokeStyle = '#d97706';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(-3, 0, 4, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(3, 0, 4, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(-4, -2, 1.5, 1.5);
        ctx.fillRect(3, 1, 1.5, 1.5);
        break;
      }
      case 'PEAR': {
        ctx.fillStyle = '#84cc16';
        ctx.beginPath();
        ctx.moveTo(0, -6);
        ctx.quadraticCurveTo(5, -2, 6, 3);
        ctx.quadraticCurveTo(0, 7, -6, 3);
        ctx.quadraticCurveTo(-5, -2, 0, -6);
        ctx.fill();
        ctx.fillStyle = '#78350f';
        ctx.fillRect(-0.5, -8, 2, 3);
        break;
      }
      case 'BANANA': {
        ctx.fillStyle = '#facc15';
        ctx.beginPath();
        ctx.arc(0, 0, 7, 0.4 * Math.PI, 1.3 * Math.PI, false);
        ctx.lineWidth = 3.5;
        ctx.strokeStyle = '#facc15';
        ctx.stroke();
        ctx.fillStyle = '#78350f';
        ctx.fillRect(-5, 4, 2, 2);
        break;
      }
    }

    ctx.restore();
  }

  /**
   * Draw floating score popups (200, 400, 800, 1600, etc.)
   */
  public drawScorePopups(popups: ScorePopup[]) {
    const ctx = this.ctx;
    ctx.font = '9px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    for (const p of popups) {
      ctx.fillStyle = p.color;
      ctx.fillText(p.text, p.x, p.y);
    }
  }

  /**
   * Draw the authentic classic arcade HUD (Scores, Lives, Fruit list, Ready/Game Over)
   */
  public drawHUD(
    score: number,
    highScore: number,
    lives: number,
    levelFruitHistory: FruitType[],
    gameState: GameState,
    level: number = 1
  ) {
    const ctx = this.ctx;

    // Top Header: 1UP, HIGH SCORE, LEVEL
    ctx.font = '11px "Press Start 2P", monospace';
    ctx.textBaseline = 'top';

    // 1UP Score
    ctx.fillStyle = '#ec4899';
    ctx.textAlign = 'left';
    ctx.fillText('1UP', 20, 8);
    ctx.fillStyle = '#ffffff';
    ctx.fillText(score.toString().padStart(2, ' '), 20, 22);

    // HIGH SCORE
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ec4899';
    ctx.fillText('HIGH SCORE', CANVAS_WIDTH / 2 - 15, 8);
    ctx.fillStyle = '#ffffff';
    ctx.fillText(highScore.toString().padStart(2, ' '), CANVAS_WIDTH / 2 - 15, 22);

    // LEVEL in Top Right of Canvas
    ctx.textAlign = 'right';
    ctx.fillStyle = '#00ffff';
    ctx.fillText('LVL', CANVAS_WIDTH - 20, 8);
    ctx.fillStyle = '#ffff00';
    ctx.fillText(level.toString().padStart(2, '0'), CANVAS_WIDTH - 20, 22);

    // Messages in center of maze
    if (gameState === 'READY') {
      ctx.fillStyle = '#ffff00';
      ctx.textAlign = 'center';
      ctx.font = '12px "Press Start 2P", monospace';
      ctx.fillText('READY!', CANVAS_WIDTH / 2, 17 * TILE_SIZE + MAZE_Y_OFFSET + 2);
    } else if (gameState === 'GAME_OVER') {
      ctx.fillStyle = '#ff0000';
      ctx.textAlign = 'center';
      ctx.font = '12px "Press Start 2P", monospace';
      ctx.fillText('GAME  OVER', CANVAS_WIDTH / 2, 17 * TILE_SIZE + MAZE_Y_OFFSET + 2);
    } else if (gameState === 'PAUSED') {
      ctx.fillStyle = '#00ffff';
      ctx.textAlign = 'center';
      ctx.font = '12px "Press Start 2P", monospace';
      ctx.fillText('PAUSED', CANVAS_WIDTH / 2, 17 * TILE_SIZE + MAZE_Y_OFFSET + 2);
    }

    // Bottom HUD: Lives (Pac-Man mini icons)
    const bottomY = CANVAS_HEIGHT - 16;
    for (let i = 0; i < Math.min(lives - 1, 5); i++) {
      ctx.save();
      ctx.translate(28 + i * 20, bottomY);
      ctx.fillStyle = '#ffff00';
      ctx.beginPath();
      ctx.arc(0, 0, 7, 0.25 * Math.PI, 1.75 * Math.PI, false);
      ctx.lineTo(0, 0);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    // Bottom HUD: Fruit Icons (Up to last 7 fruits)
    const visibleFruits = levelFruitHistory.slice(-7);
    for (let i = 0; i < visibleFruits.length; i++) {
      const fx = CANVAS_WIDTH - 28 - (visibleFruits.length - 1 - i) * 22;
      this.drawFruitIcon(ctx, visibleFruits[i], fx, bottomY, 13);
    }
  }

  /**
   * Draw Ghost AI Debug Overlay (Lines from ghosts to their authentic target tiles)
   */
  public drawDebugOverlay(ghosts: GhostEntity[], pacman: PacmanEntity) {
    const ctx = this.ctx;
    ctx.lineWidth = 1;

    for (const ghost of ghosts) {
      if (ghost.mode === 'IN_HOUSE') continue;

      const targetX = ghost.targetTile.x * TILE_SIZE + 8;
      const targetY = ghost.targetTile.y * TILE_SIZE + 8 + MAZE_Y_OFFSET;

      // Draw line from ghost to its target
      ctx.strokeStyle = ghost.color;
      ctx.beginPath();
      ctx.setLineDash([3, 3]);
      ctx.moveTo(ghost.x, ghost.y);
      ctx.lineTo(targetX, targetY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw crosshair at target
      ctx.strokeStyle = ghost.color;
      ctx.strokeRect(targetX - 4, targetY - 4, 8, 8);
    }
  }
}
