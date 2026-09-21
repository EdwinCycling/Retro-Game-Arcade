/**
 * Space Invaders (1978) Pixel Canvas Renderer
 * Renders authentic 1-bit sprites, color cellophane stripes,
 * destructible bunker grids, CRT phosphor scanlines, and score popups.
 */

import { SpaceInvadersEngine } from './spaceInvadersEngine';
import {
  SQUID_SPRITE,
  CRAB_SPRITE,
  LARGE_OCTOPUS_SPRITE,
  INVADER_EXPLOSION_SPRITE,
  MYSTERY_UFO_SPRITE,
  PLAYER_CANNON_SPRITE,
  PLAYER_EXPLOSION_FRAME0,
  PLAYER_EXPLOSION_FRAME1
} from './spaceInvadersSprites';

export class SpaceInvadersRenderer {
  private ctx: CanvasRenderingContext2D;
  private width: number;
  private height: number;
  private isCrtEnabled: boolean = true;

  constructor(ctx: CanvasRenderingContext2D, width: number, height: number) {
    this.ctx = ctx;
    this.width = width;
    this.height = height;
  }

  public setCrtEnabled(val: boolean) {
    this.isCrtEnabled = val;
  }

  public render(engine: SpaceInvadersEngine) {
    const ctx = this.ctx;
    ctx.save();

    // 1. Pure deep retro arcade black background
    ctx.fillStyle = '#030303';
    ctx.fillRect(0, 0, this.width, this.height);

    // 2. Draw Top Scores & Header HUD
    this.drawHud(engine);

    // 3. Draw Mystery UFO (Saucer)
    this.drawUfo(engine);

    // 4. Draw Alien Armada
    this.drawInvaders(engine);

    // 5. Draw Defense Bunkers
    this.drawBunkers(engine);

    // 6. Draw Player Laser
    this.drawLaser(engine);

    // 7. Draw Alien Bombs
    this.drawBombs(engine);

    // 8. Draw Player Cannon (or explosion if dying)
    this.drawPlayer(engine);

    // 9. Draw Bottom Baseline & Lives Display
    this.drawBottomBar(engine);

    // 10. Draw Score Popups
    this.drawScorePopups(engine);

    // 11. Draw State Overlays (READY, PAUSED, GAME OVER)
    this.drawStateOverlays(engine);

    // 12. Authentic CRT Scanlines & Screen Glass Curve
    if (this.isCrtEnabled) {
      this.drawCrtScanlines();
    }

    ctx.restore();
  }

  private drawHud(engine: SpaceInvadersEngine) {
    const ctx = this.ctx;
    ctx.font = 'bold 13px "Courier New", monospace';

    // 1UP Score (White/Red)
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'left';
    ctx.fillText('SCORE<1>', 30, 24);
    ctx.fillStyle = '#00FF41';
    ctx.fillText(engine.getScore().toString().padStart(4, '0'), 30, 40);

    // HIGH SCORE
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.fillText('HI-SCORE', this.width / 2, 24);
    ctx.fillStyle = '#FFE600';
    const hs = Math.max(engine.getScore(), 1000);
    ctx.fillText(hs.toString().padStart(4, '0'), this.width / 2, 40);

    // WAVE / LEVEL
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'right';
    ctx.fillText('LEVEL / WAVE', this.width - 24, 24);
    ctx.fillStyle = '#00FFFF';
    ctx.fillText(`LVL ${engine.getWave().toString().padStart(2, '0')}`, this.width - 24, 40);
  }

  private drawUfo(engine: SpaceInvadersEngine) {
    const ufo = engine.getUfo();
    const ctx = this.ctx;

    if (ufo.active) {
      // Red cellophane overlay color
      this.drawMatrixSprite(
        MYSTERY_UFO_SPRITE.pixels,
        ufo.x,
        ufo.y,
        ufo.width,
        ufo.height,
        '#FF2222'
      );
    }
  }

  private drawInvaders(engine: SpaceInvadersEngine) {
    const invaders = engine.getInvaders();

    invaders.forEach(inv => {
      if (inv.alive) {
        // Color cellophane banding:
        // Top row = Red / Pink, Middle = Orange / Cyan, Bottom = Yellow / White
        let color = '#FFFFFF';
        if (inv.type === 'TOP') {
          color = '#FF4444'; // Red top squid
          const sprite = inv.frame === 0 ? SQUID_SPRITE.frame0 : SQUID_SPRITE.frame1;
          this.drawMatrixSprite(sprite, inv.x, inv.y, inv.width, inv.height, color);
        } else if (inv.type === 'MIDDLE') {
          color = '#00FFFF'; // Cyan middle crab
          const sprite = inv.frame === 0 ? CRAB_SPRITE.frame0 : CRAB_SPRITE.frame1;
          this.drawMatrixSprite(sprite, inv.x, inv.y, inv.width, inv.height, color);
        } else {
          color = '#FFFF00'; // Yellow bottom octopus
          const sprite = inv.frame === 0 ? LARGE_OCTOPUS_SPRITE.frame0 : LARGE_OCTOPUS_SPRITE.frame1;
          this.drawMatrixSprite(sprite, inv.x, inv.y, inv.width, inv.height, color);
        }
      } else if (inv.deathTimer > 0) {
        // Invader exploding burst
        this.drawMatrixSprite(
          INVADER_EXPLOSION_SPRITE.pixels,
          inv.x,
          inv.y,
          inv.width,
          inv.height,
          '#FFFFFF'
        );
      }
    });
  }

  private drawBunkers(engine: SpaceInvadersEngine) {
    const bunkers = engine.getBunkers();
    const ctx = this.ctx;

    // Classic arcade green bunkers
    ctx.fillStyle = '#00FF41';

    bunkers.forEach(bunker => {
      const rows = bunker.blocks.length;
      const cols = bunker.blocks[0].length;
      const blockW = bunker.width / cols;
      const blockH = bunker.height / rows;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          if (bunker.blocks[r][c]) {
            ctx.fillRect(
              Math.floor(bunker.x + c * blockW),
              Math.floor(bunker.y + r * blockH),
              Math.ceil(blockW),
              Math.ceil(blockH)
            );
          }
        }
      }
    });
  }

  private drawLaser(engine: SpaceInvadersEngine) {
    const laser = engine.getLaser();
    if (!laser.active) return;

    const ctx = this.ctx;
    ctx.fillStyle = '#FFFFFF';
    ctx.shadowColor = '#00FFFF';
    ctx.shadowBlur = 6;
    ctx.fillRect(laser.x, laser.y, laser.width, laser.height);
    ctx.shadowBlur = 0;
  }

  private drawBombs(engine: SpaceInvadersEngine) {
    const bombs = engine.getBombs();
    const ctx = this.ctx;

    bombs.forEach(bomb => {
      ctx.fillStyle = '#FFFFFF';

      if (bomb.type === 'squiggly') {
        // Squiggly lightning zigzag
        const offset = (bomb.frame % 2) * 2;
        ctx.fillRect(bomb.x + offset, bomb.y, 2, 3);
        ctx.fillRect(bomb.x - offset + 2, bomb.y + 3, 2, 3);
        ctx.fillRect(bomb.x + offset, bomb.y + 6, 2, 4);
      } else {
        // Straight line / plunger missile
        ctx.fillRect(bomb.x, bomb.y, bomb.width, bomb.height);
        ctx.fillRect(bomb.x - 1, bomb.y + 2, 5, 2);
      }
    });
  }

  private drawPlayer(engine: SpaceInvadersEngine) {
    const player = engine.getPlayer();
    const ctx = this.ctx;

    if (player.isDying) {
      // Explosive debris frame
      const sprite = player.deathFrame === 0 ? PLAYER_EXPLOSION_FRAME0 : PLAYER_EXPLOSION_FRAME1;
      this.drawMatrixSprite(
        sprite.pixels,
        player.x - 2,
        player.y,
        player.width + 4,
        player.height,
        '#00FF41'
      );
    } else {
      // If invulnerable after respawn, blink
      if (player.invulnerableTimer > 0 && Math.floor(player.invulnerableTimer * 10) % 2 === 1) {
        return;
      }

      // Authentic green cannon
      this.drawMatrixSprite(
        PLAYER_CANNON_SPRITE.pixels,
        player.x,
        player.y,
        player.width,
        player.height,
        '#00FF41'
      );
    }
  }

  private drawBottomBar(engine: SpaceInvadersEngine) {
    const ctx = this.ctx;
    const player = engine.getPlayer();

    // 1. Continuous Green Baseline (Classic 1978 ground line)
    ctx.fillStyle = '#00FF41';
    ctx.fillRect(16, 484, this.width - 32, 2);

    // 2. Remaining Lives Count (digits + mini cannon sprites)
    ctx.font = 'bold 12px "Courier New", monospace';
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'left';
    ctx.fillText(`${player.lives}`, 20, 506);

    const miniCannonW = 20;
    const miniCannonH = 11;
    for (let i = 0; i < player.lives - 1; i++) {
      this.drawMatrixSprite(
        PLAYER_CANNON_SPRITE.pixels,
        38 + i * 26,
        495,
        miniCannonW,
        miniCannonH,
        '#00FF41'
      );
    }

    // 3. Right side Credit indicator
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'right';
    ctx.fillText('CREDIT 02', this.width - 20, 506);
  }

  private drawScorePopups(engine: SpaceInvadersEngine) {
    const popups = engine.getScorePopups();
    const ctx = this.ctx;
    ctx.font = 'bold 13px "Courier New", monospace';
    ctx.textAlign = 'center';

    popups.forEach(popup => {
      ctx.fillStyle = popup.color;
      ctx.fillText(popup.text, popup.x, popup.y);
    });
  }

  private drawStateOverlays(engine: SpaceInvadersEngine) {
    const state = engine.getState();
    const ctx = this.ctx;
    ctx.font = 'bold 20px "Courier New", monospace';
    ctx.textAlign = 'center';

    if (state === 'READY') {
      ctx.fillStyle = '#00FF41';
      ctx.fillText('READY', this.width / 2, 290);
    } else if (state === 'PAUSED') {
      ctx.fillStyle = '#FFE600';
      ctx.fillText('PAUSED', this.width / 2, 290);
      ctx.font = 'bold 12px "Courier New", monospace';
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText('DRUK OP PAUZE OM VERDER TE GAAN', this.width / 2, 315);
    } else if (state === 'GAME_OVER') {
      const reason = engine.getGameOverReason();
      ctx.fillStyle = '#FF2222';
      ctx.fillText('GAME OVER', this.width / 2, 260);

      ctx.font = 'bold 12px "Courier New", monospace';
      if (reason === 'INVASION_BREACH') {
        ctx.fillStyle = '#FF4444';
        ctx.fillText('ALIENS BEREIKTEN DE AARDE!', this.width / 2, 286);
        ctx.fillStyle = '#AAAAAA';
        ctx.fillText('(Onderste grens doorbroken)', this.width / 2, 304);
      } else {
        ctx.fillStyle = '#FF4444';
        ctx.fillText('ALLE KANONNEN VERNIETIGD', this.width / 2, 286);
        ctx.fillStyle = '#AAAAAA';
        ctx.fillText('(3 van de 3 levens verloren)', this.width / 2, 304);
      }

      ctx.font = 'bold 13px "Courier New", monospace';
      ctx.fillStyle = '#FFFFFF';
      ctx.fillText(`EINDSCORE: ${engine.getScore()}`, this.width / 2, 330);
      ctx.fillStyle = '#FFE600';
      ctx.fillText('DRUK OP HERSTART', this.width / 2, 352);
    } else if (state === 'WAVE_CLEAR') {
      ctx.fillStyle = '#00FFFF';
      ctx.fillText('WAVE VOLTOOID!', this.width / 2, 280);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 13px "Courier New", monospace';
      ctx.fillText(`VOLGENDE WAVE: ${engine.getWave() + 1}`, this.width / 2, 308);
    }
  }

  /**
   * Universal 1-bit pixel matrix sprite drawer
   */
  private drawMatrixSprite(
    matrix: number[][],
    x: number,
    y: number,
    targetW: number,
    targetH: number,
    color: string
  ) {
    const ctx = this.ctx;
    const rows = matrix.length;
    const cols = matrix[0].length;
    const pixelW = targetW / cols;
    const pixelH = targetH / rows;

    ctx.fillStyle = color;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (matrix[r][c] === 1) {
          ctx.fillRect(
            Math.floor(x + c * pixelW),
            Math.floor(y + r * pixelH),
            Math.ceil(pixelW),
            Math.ceil(pixelH)
          );
        }
      }
    }
  }

  /**
   * CRT scanlines & phosphor bloom
   */
  private drawCrtScanlines() {
    const ctx = this.ctx;

    // Scanlines
    ctx.fillStyle = 'rgba(0, 0, 0, 0.22)';
    for (let y = 0; y < this.height; y += 3) {
      ctx.fillRect(0, y, this.width, 1.2);
    }

    // Subtle edge vignette
    const gradient = ctx.createRadialGradient(
      this.width / 2,
      this.height / 2,
      this.width * 0.4,
      this.width / 2,
      this.height / 2,
      this.width * 0.72
    );
    gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0.4)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, this.width, this.height);
  }
}
