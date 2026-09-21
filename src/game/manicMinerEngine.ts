/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Authentic Sinclair ZX Spectrum Engine for Manic Miner (1983)
 */

import {
  MANIC_MINER_CAVERNS,
  CavernDef,
  GuardianDef,
  ZX_WIDTH,
  ZX_HEIGHT,
  TILE_SIZE,
  GRID_COLS,
  GRID_ROWS,
} from './manicMinerLevels';
import { manicMinerAudio } from './manicMinerAudio';
import { haptics } from '../utils/haptics';

export type GameState = 'TITLE' | 'PLAYING' | 'CAVERN_CLEAR' | 'DEATH' | 'GAME_OVER' | 'VICTORY' | 'BOOT_CRUSH';

export interface KeyItem {
  gridX: number;
  gridY: number;
  collected: boolean;
  color: string;
}

export interface CrumblyTile {
  gridX: number;
  gridY: number;
  life: number; // 0 to 4 (dissolves in stages)
}

export interface Willy {
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  facing: 1 | -1; // 1 = right, -1 = left
  isJumping: boolean;
  jumpPhase: number; // 0 to 6
  jumpDir: number; // -1, 0, 1
  isGrounded: boolean;
  fallDistance: number; // For lethal high falls
  animFrame: number;
  animTimer: number;
  deathTimer: number;
}

export interface ActiveGuardian {
  def: GuardianDef;
  x: number;
  y: number;
  direction: number;
  animFrame: number;
  animTimer: number;
}

export class ManicMinerEngine {
  public state: GameState = 'TITLE';
  public currentCavernIndex: number = 0;
  public cavern: CavernDef;
  
  public willy: Willy;
  public guardians: ActiveGuardian[] = [];
  public keys: KeyItem[] = [];
  public crumblyTiles: Map<string, CrumblyTile> = new Map();
  public keysRemaining: number = 0;
  public isExitOpen: boolean = false;
  
  public score: number = 0;
  public highScore: number = 10450;
  public lives: number = 3;
  public air: number = 36;
  public maxAir: number = 36;
  public cavernTime: number = 0;
  
  public kongDropped: boolean = false;
  public solarRayX: number = 128;
  public solarRayDir: number = 1;
  
  // Trainer / Cheats
  public cheatInfiniteLives: boolean = false;
  public cheatInfiniteAir: boolean = false;
  public cheatMoonJump: boolean = false;
  
  // Visual effects
  public borderFlashColor: string = '#000000';
  public tapeBorderTimer: number = 0;
  public bootY: number = -60; // Monty Python boot animation
  public stateTimer: number = 0;
  public musicMode: 'music' | 'effects' = 'music';
  
  private listeners: Set<() => void> = new Set();
  
  // Controls state
  public inputLeft: boolean = false;
  public inputRight: boolean = false;
  public inputJump: boolean = false;

  constructor() {
    this.cavern = MANIC_MINER_CAVERNS[0];
    this.willy = this.createWilly(this.cavern);
    this.resetToTitle();
  }

  public subscribe(cb: () => void) {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }

  private notify() {
    this.listeners.forEach((cb) => cb());
  }

  private createWilly(cavern: CavernDef): Willy {
    return {
      x: cavern.willyStartX,
      y: cavern.willyStartY,
      vx: 0,
      vy: 0,
      width: 8,
      height: 16,
      facing: cavern.willyStartFacing,
      isJumping: false,
      jumpPhase: 0,
      jumpDir: 0,
      isGrounded: true,
      fallDistance: 0,
      animFrame: 0,
      animTimer: 0,
      deathTimer: 0,
    };
  }

  public resetToTitle() {
    this.state = 'TITLE';
    this.score = 0;
    this.lives = 3;
    this.currentCavernIndex = 0;
    this.loadCavern(0);
    manicMinerAudio.stopMusic();
    this.notify();
  }

  public startGame(startCavernIndex: number = 0) {
    this.state = 'PLAYING';
    this.score = 0;
    this.lives = 3;
    this.currentCavernIndex = startCavernIndex;
    this.loadCavern(startCavernIndex);
    if (this.musicMode === 'music') {
      manicMinerAudio.startInGameMusic();
    }
    this.notify();
  }

  public loadCavern(index: number) {
    this.currentCavernIndex = index % MANIC_MINER_CAVERNS.length;
    this.cavern = MANIC_MINER_CAVERNS[this.currentCavernIndex];
    this.willy = this.createWilly(this.cavern);
    this.air = this.cavern.air;
    this.maxAir = this.cavern.air;
    this.cavernTime = 0;
    this.isExitOpen = false;
    this.kongDropped = false;
    this.solarRayX = 128;
    this.solarRayDir = 1;
    this.bootY = -60;

    // Parse keys & crumbly tiles
    this.keys = [];
    this.crumblyTiles.clear();

    for (let r = 0; r < this.cavern.layout.length; r++) {
      const row = this.cavern.layout[r];
      for (let c = 0; c < row.length; c++) {
        const ch = row[c];
        if (ch === '*') {
          this.keys.push({
            gridX: c,
            gridY: r,
            collected: false,
            color: '#ffff00',
          });
        } else if (ch === '=') {
          this.crumblyTiles.set(`${c},${r}`, {
            gridX: c,
            gridY: r,
            life: 4,
          });
        }
      }
    }
    this.keysRemaining = this.keys.length;
    if (this.keysRemaining === 0) {
      this.isExitOpen = true;
    }

    // Initialize guardians
    this.guardians = this.cavern.guardians.map((def) => ({
      def,
      x: def.startX,
      y: def.startY,
      direction: def.direction,
      animFrame: 0,
      animTimer: 0,
    }));

    this.notify();
  }

  public toggleMusic() {
    if (this.musicMode === 'music') {
      this.musicMode = 'effects';
      manicMinerAudio.stopMusic();
    } else {
      this.musicMode = 'music';
      if (this.state === 'PLAYING') {
        manicMinerAudio.startInGameMusic();
      }
    }
    this.notify();
  }

  public warpToCavern(index: number) {
    this.loadCavern(index);
    if (this.state !== 'PLAYING') {
      this.state = 'PLAYING';
      if (this.musicMode === 'music') manicMinerAudio.startInGameMusic();
    }
    this.notify();
  }

  public update(dt: number) {
    // Sinclair border tape stripe effect
    this.tapeBorderTimer += dt;

    if (this.state === 'TITLE') {
      this.updateGuardians(dt);
      return;
    }

    if (this.state === 'PLAYING') {
      this.updateAir(dt);
      this.updateWilly(dt);
      this.updateGuardians(dt);
      this.updateSpecialMechanics(dt);
      this.checkCollisions();
      this.notify();
      return;
    }

    if (this.state === 'CAVERN_CLEAR') {
      this.stateTimer += dt;
      // Bonus score tallying for remaining air
      if (this.air > 0) {
        this.air = Math.max(0, this.air - dt * 25);
        this.score += Math.floor(dt * 250);
      }
      if (this.stateTimer >= 2.0) {
        if (this.currentCavernIndex + 1 >= MANIC_MINER_CAVERNS.length) {
          this.state = 'VICTORY';
          this.stateTimer = 0;
        } else {
          this.loadCavern(this.currentCavernIndex + 1);
          this.state = 'PLAYING';
          this.stateTimer = 0;
        }
      }
      this.notify();
      return;
    }

    if (this.state === 'DEATH') {
      this.stateTimer += dt;
      if (this.stateTimer >= 1.5) {
        this.lives--;
        if (this.lives <= 0 && !this.cheatInfiniteLives) {
          this.state = 'BOOT_CRUSH';
          this.bootY = -60;
          this.stateTimer = 0;
          manicMinerAudio.playBootStomp();
          haptics.heavy();
        } else {
          this.loadCavern(this.currentCavernIndex);
          this.state = 'PLAYING';
        }
      }
      this.notify();
      return;
    }

    if (this.state === 'BOOT_CRUSH') {
      this.stateTimer += dt;
      if (this.bootY < 80) {
        this.bootY += dt * 140;
      }
      if (this.stateTimer >= 3.0) {
        this.state = 'GAME_OVER';
        this.stateTimer = 0;
      }
      this.notify();
      return;
    }

    if (this.state === 'GAME_OVER' || this.state === 'VICTORY') {
      this.stateTimer += dt;
      if (this.stateTimer >= 4.5) {
        this.resetToTitle();
      }
      this.notify();
    }
  }

  private updateAir(dt: number) {
    if (this.cheatInfiniteAir) return;
    this.cavernTime += dt;
    this.air -= dt * 1.0;
    if (this.air <= 0) {
      this.air = 0;
      this.triggerDeath('suffocated');
    }
  }

  /**
   * Authentic Fixed Parabolic Arc Jumping for Manic Miner
   */
  private updateWilly(dt: number) {
    const w = this.willy;
    const walkSpeed = 48; // px/sec

    // Gravity & Ground check
    const currentTileBelow = this.getTileAt(w.x + 4, w.y + w.height);
    const tileLeftBelow = this.getTileAt(w.x, w.y + w.height);
    const tileRightBelow = this.getTileAt(w.x + w.width - 1, w.y + w.height);

    const onGround = (
      this.isSolidTile(currentTileBelow) ||
      this.isSolidTile(tileLeftBelow) ||
      this.isSolidTile(tileRightBelow)
    );

    // Conveyor Belt interaction
    const underFootTile = this.getTileUnderFoot(w.x, w.y);
    let conveyorSpeed = 0;
    if (underFootTile === '<') conveyorSpeed = -36;
    if (underFootTile === '>') conveyorSpeed = 36;

    if (conveyorSpeed !== 0 && onGround && !w.isJumping) {
      w.x += conveyorSpeed * dt;
      if (Math.random() < 0.05) manicMinerAudio.playConveyor();
    }

    // Crumbly Floor interaction
    this.checkCrumblyUnderWilly(w.x, w.y);

    if (w.isJumping) {
      // Fixed jump trajectory phases: 0, 1, 2 (up), 3 (apex), 4, 5, 6 (down)
      w.animTimer += dt;
      const JUMP_PHASE_TIME = 0.07;
      const jumpYOffset = [-4, -3, -2, 0, 2, 3, 4];
      const jumpXStep = (this.cheatMoonJump ? 1.5 : 1.0) * 12;

      if (w.animTimer >= JUMP_PHASE_TIME) {
        w.animTimer = 0;
        w.jumpPhase++;

        if (w.jumpPhase < jumpYOffset.length) {
          const dy = jumpYOffset[w.jumpPhase] * (this.cheatMoonJump ? 1.4 : 1.0);
          const dx = w.jumpDir * jumpXStep;

          // Check ceiling collision
          if (dy < 0 && this.isTileSolidAt(w.x + 4, w.y + dy)) {
            w.jumpPhase = 4; // bump head, start falling
          } else {
            w.y += dy;
          }

          // Check horizontal wall collision
          if (dx !== 0) {
            const checkX = dx > 0 ? w.x + w.width + dx : w.x + dx;
            if (!this.isTileSolidAt(checkX, w.y + 4) && !this.isTileSolidAt(checkX, w.y + 12)) {
              w.x += dx;
            }
          }
        } else {
          // Jump finished
          w.isJumping = false;
        }
      }
    } else {
      // Walking & falling
      if (onGround) {
        // High fall check
        if (w.fallDistance > 38 && !this.cheatMoonJump) {
          this.triggerDeath('splat');
          return;
        }
        w.fallDistance = 0;
        w.isGrounded = true;
        w.vy = 0;

        // Jump initiate
        if (this.inputJump) {
          w.isJumping = true;
          w.jumpPhase = 0;
          w.animTimer = 0;
          w.jumpDir = this.inputLeft ? -1 : this.inputRight ? 1 : 0;
          manicMinerAudio.playJump();
          haptics.light();
          return;
        }

        // Left / Right walking
        if (this.inputLeft) {
          w.facing = -1;
          const nextX = w.x - walkSpeed * dt;
          if (!this.isTileSolidAt(nextX, w.y + 4) && !this.isTileSolidAt(nextX, w.y + 12)) {
            w.x = nextX;
            w.animTimer += dt;
            if (w.animTimer > 0.08) {
              w.animTimer = 0;
              w.animFrame = (w.animFrame + 1) % 4;
              manicMinerAudio.playFootstep();
            }
          }
        } else if (this.inputRight) {
          w.facing = 1;
          const nextX = w.x + walkSpeed * dt;
          if (!this.isTileSolidAt(nextX + w.width, w.y + 4) && !this.isTileSolidAt(nextX + w.width, w.y + 12)) {
            w.x = nextX;
            w.animTimer += dt;
            if (w.animTimer > 0.08) {
              w.animTimer = 0;
              w.animFrame = (w.animFrame + 1) % 4;
              manicMinerAudio.playFootstep();
            }
          }
        } else {
          w.animFrame = 0;
        }
      } else {
        // Falling down
        w.isGrounded = false;
        const fallSpeed = 64;
        const dy = fallSpeed * dt;
        w.fallDistance += dy;
        w.y += dy;
      }
    }

    // Boundary constraints
    w.x = Math.max(8, Math.min(ZX_WIDTH - 16, w.x));
    if (w.y > 128) {
      this.triggerDeath('pit');
    }
  }

  private updateGuardians(dt: number) {
    for (const g of this.guardians) {
      g.animTimer += dt;
      if (g.animTimer > 0.12) {
        g.animTimer = 0;
        g.animFrame = (g.animFrame + 1) % (g.def.frames || 4);
      }

      // Horizontal patrol
      if (g.def.minX !== undefined && g.def.maxX !== undefined) {
        g.x += g.def.speed * g.direction * dt;
        if (g.x >= g.def.maxX) {
          g.x = g.def.maxX;
          g.direction = -1;
        } else if (g.x <= g.def.minX) {
          g.x = g.def.minX;
          g.direction = 1;
        }
      }

      // Vertical bouncing (e.g. Eugene or Spiders)
      if (g.def.minY !== undefined && g.def.maxY !== undefined) {
        g.y += g.def.speed * g.direction * dt;
        if (g.y >= g.def.maxY) {
          g.y = g.def.maxY;
          g.direction = -1;
        } else if (g.y <= g.def.minY) {
          g.y = g.def.minY;
          g.direction = 1;
        }
      }
    }
  }

  private updateSpecialMechanics(dt: number) {
    // Solar Laser beam scanning
    if (this.cavern.specialMechanism === 'solar_ray') {
      this.solarRayX += this.solarRayDir * 80 * dt;
      if (this.solarRayX > 220) {
        this.solarRayX = 220;
        this.solarRayDir = -1;
      } else if (this.solarRayX < 40) {
        this.solarRayX = 40;
        this.solarRayDir = 1;
      }
    }
  }

  private checkCollisions() {
    const w = this.willy;

    // 1. Collect Keys
    for (const key of this.keys) {
      if (!key.collected) {
        const kx = key.gridX * TILE_SIZE;
        const ky = key.gridY * TILE_SIZE;
        if (
          w.x < kx + 8 &&
          w.x + w.width > kx &&
          w.y < ky + 8 &&
          w.y + w.height > ky
        ) {
          key.collected = true;
          this.keysRemaining--;
          this.score += 100;
          manicMinerAudio.playKeyCollect();
          haptics.medium();

          if (this.keysRemaining <= 0) {
            this.isExitOpen = true;
            manicMinerAudio.playExitOpen();
          }
        }
      }
    }

    // 2. Check Lever / Switch (Kong levels)
    if (this.cavern.specialMechanism === 'kong_lever' && !this.kongDropped) {
      const tile = this.getTileUnderFoot(w.x, w.y);
      if (tile === 'L' || this.getTileAt(w.x, w.y) === 'L') {
        this.kongDropped = true;
        this.score += 250;
        manicMinerAudio.playKeyCollect();
        haptics.heavy();
        // Remove Kong guardian
        this.guardians = this.guardians.filter((g) => g.def.type !== 'kong');
      }
    }

    // 3. Lethal Hazard Tiles (^ or v)
    const hazard1 = this.getTileAt(w.x + 2, w.y + w.height - 2);
    const hazard2 = this.getTileAt(w.x + w.width - 2, w.y + w.height - 2);
    const hazardTop = this.getTileAt(w.x + 4, w.y);
    if (hazard1 === '^' || hazard2 === '^' || hazardTop === 'v') {
      this.triggerDeath('hazard');
      return;
    }

    // 4. Guardian Collision
    for (const g of this.guardians) {
      const gx = g.x;
      const gy = g.y;
      const gw = g.def.type === 'kong' ? 24 : 12;
      const gh = g.def.type === 'kong' ? 24 : 14;

      if (
        w.x < gx + gw &&
        w.x + w.width > gx &&
        w.y < gy + gh &&
        w.y + w.height > gy
      ) {
        this.triggerDeath('guardian');
        return;
      }
    }

    // 5. Solar Ray Laser
    if (this.cavern.specialMechanism === 'solar_ray') {
      if (Math.abs(w.x + 4 - this.solarRayX) < 6) {
        this.triggerDeath('laser');
        return;
      }
    }

    // 6. Portal Door (Exit)
    if (this.isExitOpen) {
      const px = this.cavern.portalX;
      const py = this.cavern.portalY;
      if (
        w.x < px + 16 &&
        w.x + w.width > px &&
        w.y < py + 16 &&
        w.y + w.height > py
      ) {
        this.triggerCavernComplete();
      }
    }
  }

  private checkCrumblyUnderWilly(x: number, y: number) {
    const gx = Math.floor((x + 4) / TILE_SIZE);
    const gy = Math.floor((y + 16) / TILE_SIZE);
    const key = `${gx},${gy}`;
    const tile = this.crumblyTiles.get(key);
    if (tile && tile.life > 0) {
      tile.life -= 0.05;
      if (tile.life <= 0) {
        this.crumblyTiles.delete(key);
      }
      manicMinerAudio.playCrumble();
    }
  }

  public triggerDeath(reason: string) {
    if (this.state === 'DEATH' || this.state === 'BOOT_CRUSH') return;
    this.state = 'DEATH';
    this.stateTimer = 0;
    manicMinerAudio.playDeath();
    haptics.heavy();
    this.borderFlashColor = '#d70000';
    this.notify();
  }

  private triggerCavernComplete() {
    this.state = 'CAVERN_CLEAR';
    this.stateTimer = 0;
    manicMinerAudio.playCavernComplete();
    haptics.success();
    this.borderFlashColor = '#ffffff';
    this.notify();
  }

  public getTileAt(pixelX: number, pixelY: number): string {
    const col = Math.floor(pixelX / TILE_SIZE);
    const row = Math.floor(pixelY / TILE_SIZE);
    if (row < 0 || row >= GRID_ROWS || col < 0 || col >= GRID_COLS) {
      return ' ';
    }
    const crumbly = this.crumblyTiles.get(`${col},${row}`);
    if (crumbly && crumbly.life > 0) return '=';
    if (crumbly && crumbly.life <= 0) return ' ';

    return this.cavern.layout[row]?.[col] || ' ';
  }

  public getTileUnderFoot(pixelX: number, pixelY: number): string {
    return this.getTileAt(pixelX + 4, pixelY + 16);
  }

  public isSolidTile(tileChar: string): boolean {
    return tileChar === '#' || tileChar === '=' || tileChar === '<' || tileChar === '>' || tileChar === 'L';
  }

  public isTileSolidAt(pixelX: number, pixelY: number): boolean {
    return this.isSolidTile(this.getTileAt(pixelX, pixelY));
  }
}
