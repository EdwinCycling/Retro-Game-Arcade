/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * EINDELOOS - Core Game Engine
 */

import {
  EindeloosGameState,
  Point,
  Rocket,
  Enemy,
  EnergyBarrier,
  MovingWall,
  Checkpoint,
  MazeItem,
  HeartBoss,
  Particle,
} from './eindeloosTypes';
import { eindeloosAudio } from './eindeloosAudio';

export const MAP_WIDTH = 8192;
export const MAP_HEIGHT = 4096;
export const CHAR_SIZE = 8;
export const GRID_COLS = 1024;
export const GRID_ROWS = 512;

// Default starting point in wide open airfield above runway
export const DEFAULT_START_POS: Point = { x: 330 * CHAR_SIZE, y: 35 * CHAR_SIZE };

// Heart chamber coordinates (deep inside the cavern maze)
export const HEART_POS: Point = { x: 860 * CHAR_SIZE, y: 410 * CHAR_SIZE };

export class EindeloosEngine {
  public state: EindeloosGameState;
  public speedMultiplier: number = 0.85; // Default to calm, accessible flight speed!
  public bumperEnabled: boolean = true; // Soft bumper: low-speed wall contact bounces safely instead of instant death
  private collisionGrid: Uint8Array | null = null;
  private rocketIdCounter = 0;
  private enemyIdCounter = 0;
  private isLoaded = false;
  private mapImage: HTMLImageElement | null = null;

  constructor() {
    this.state = this.createInitialState();
  }

  public createInitialState(): EindeloosGameState {
    const checkpoints: Checkpoint[] = [
      // Starting airfield runway
      { id: 1, x: 330 * CHAR_SIZE, y: 35 * CHAR_SIZE, activated: true },
      // First Cavern Room (directly below start runway - from user screenshot!)
      { id: 2, x: 322 * CHAR_SIZE, y: 56 * CHAR_SIZE, activated: false },
      // West Bastion
      { id: 3, x: 260 * CHAR_SIZE, y: 95 * CHAR_SIZE, activated: false },
      // North East Outpost
      { id: 4, x: 740 * CHAR_SIZE, y: 130 * CHAR_SIZE, activated: false },
      // Deep West Mines
      { id: 5, x: 180 * CHAR_SIZE, y: 220 * CHAR_SIZE, activated: false },
      // Central Hub
      { id: 6, x: 490 * CHAR_SIZE, y: 240 * CHAR_SIZE, activated: false },
      // East Generator
      { id: 7, x: 820 * CHAR_SIZE, y: 270 * CHAR_SIZE, activated: false },
      // South West Tunnels
      { id: 8, x: 330 * CHAR_SIZE, y: 360 * CHAR_SIZE, activated: false },
      // Heart Entrance Outpost
      { id: 9, x: 670 * CHAR_SIZE, y: 380 * CHAR_SIZE, activated: false },
    ];

    const barriers: EnergyBarrier[] = [
      { id: 1, x: 420 * CHAR_SIZE, y: 60 * CHAR_SIZE, w: 4, h: 48, active: true, cycleTimer: 0 },
      { id: 2, x: 580 * CHAR_SIZE, y: 110 * CHAR_SIZE, w: 64, h: 4, active: true, cycleTimer: 40 },
      { id: 3, x: 310 * CHAR_SIZE, y: 190 * CHAR_SIZE, w: 4, h: 64, active: false, cycleTimer: 80 },
      { id: 4, x: 710 * CHAR_SIZE, y: 230 * CHAR_SIZE, w: 48, h: 4, active: true, cycleTimer: 20 },
      { id: 5, x: 840 * CHAR_SIZE, y: 390 * CHAR_SIZE, w: 80, h: 4, active: true, cycleTimer: 60 },
    ];

    const heart: HeartBoss = {
      x: HEART_POS.x,
      y: HEART_POS.y,
      health: 20,
      maxHealth: 20,
      pulsePhase: 0,
      isDestroyed: false,
    };

    const items: MazeItem[] = [
      // 1. Golden Keys
      { id: 1, x: 295 * CHAR_SIZE, y: 62 * CHAR_SIZE, type: 'key', collected: false, name: 'Sleutel van de Noorderpoort' },
      { id: 2, x: 240 * CHAR_SIZE, y: 110 * CHAR_SIZE, type: 'key', collected: false, name: 'Sleutel van de Westelijke Sluis' },
      { id: 3, x: 720 * CHAR_SIZE, y: 145 * CHAR_SIZE, type: 'key', collected: false, name: 'Sleutel van de Oostergrot' },
      { id: 4, x: 480 * CHAR_SIZE, y: 260 * CHAR_SIZE, type: 'key', collected: false, name: 'Sleutel van het Centraal Bastion' },
      { id: 5, x: 800 * CHAR_SIZE, y: 380 * CHAR_SIZE, type: 'key', collected: false, name: 'Hoofdsleutel Hartkamer' },

      // 2. Fuel Canisters
      { id: 101, x: 350 * CHAR_SIZE, y: 70 * CHAR_SIZE, type: 'fuel', collected: false, name: 'Brandstofvat (+50% Brandstof)' },
      { id: 102, x: 280 * CHAR_SIZE, y: 180 * CHAR_SIZE, type: 'fuel', collected: false, name: 'Brandstofvat (+50% Brandstof)' },
      { id: 103, x: 650 * CHAR_SIZE, y: 220 * CHAR_SIZE, type: 'fuel', collected: false, name: 'Brandstofvat (+50% Brandstof)' },
      { id: 104, x: 810 * CHAR_SIZE, y: 330 * CHAR_SIZE, type: 'fuel', collected: false, name: 'Brandstofvat (+50% Brandstof)' },

      // 3. 4-Way Arrow Cross Boosters (Cyan Cross Icons from C64 Eindeloos!)
      { id: 201, x: 322 * CHAR_SIZE, y: 44 * CHAR_SIZE, type: 'cross_boost', collected: false, name: '4-Wegen Turbo Booster' },
      { id: 202, x: 270 * CHAR_SIZE, y: 100 * CHAR_SIZE, type: 'cross_boost', collected: false, name: '4-Wegen Turbo Booster' },
      { id: 203, x: 450 * CHAR_SIZE, y: 160 * CHAR_SIZE, type: 'cross_boost', collected: false, name: '4-Wegen Turbo Booster' },
      { id: 204, x: 710 * CHAR_SIZE, y: 200 * CHAR_SIZE, type: 'cross_boost', collected: false, name: '4-Wegen Turbo Booster' },
      { id: 205, x: 550 * CHAR_SIZE, y: 320 * CHAR_SIZE, type: 'cross_boost', collected: false, name: '4-Wegen Turbo Booster' },
      { id: 206, x: 830 * CHAR_SIZE, y: 360 * CHAR_SIZE, type: 'cross_boost', collected: false, name: '4-Wegen Turbo Booster' },

      // 4. Yellow Diamond Energy Pellets (Around the HOOG skull chambers)
      { id: 301, x: 308 * CHAR_SIZE, y: 58 * CHAR_SIZE, type: 'energy_orb', collected: false, name: 'Energie Baken' },
      { id: 302, x: 312 * CHAR_SIZE, y: 58 * CHAR_SIZE, type: 'energy_orb', collected: false, name: 'Energie Baken' },
      { id: 303, x: 304 * CHAR_SIZE, y: 62 * CHAR_SIZE, type: 'energy_orb', collected: false, name: 'Energie Baken' },
      { id: 304, x: 316 * CHAR_SIZE, y: 62 * CHAR_SIZE, type: 'energy_orb', collected: false, name: 'Energie Baken' },
      { id: 305, x: 304 * CHAR_SIZE, y: 66 * CHAR_SIZE, type: 'energy_orb', collected: false, name: 'Energie Baken' },
      { id: 306, x: 316 * CHAR_SIZE, y: 66 * CHAR_SIZE, type: 'energy_orb', collected: false, name: 'Energie Baken' },
      { id: 307, x: 308 * CHAR_SIZE, y: 68 * CHAR_SIZE, type: 'energy_orb', collected: false, name: 'Energie Baken' },
      { id: 308, x: 312 * CHAR_SIZE, y: 68 * CHAR_SIZE, type: 'energy_orb', collected: false, name: 'Energie Baken' },
    ];

    const movingWalls: MovingWall[] = [
      // 1. Starting Cavern Exit Sluice (vertical mechanical door)
      {
        id: 1,
        x: 326 * CHAR_SIZE,
        y: 48 * CHAR_SIZE,
        w: 16,
        h: 48,
        dx: 0,
        dy: 42,
        speed: 0.025,
        phase: 0,
        currentX: 326 * CHAR_SIZE,
        currentY: 48 * CHAR_SIZE,
        type: 'stone_vertical',
        name: 'Startgrot Sluisdeur',
      },
      // 2. West Bastion Sliding Wall (horizontal moving stone block)
      {
        id: 2,
        x: 275 * CHAR_SIZE,
        y: 92 * CHAR_SIZE,
        w: 48,
        h: 16,
        dx: 42,
        dy: 0,
        speed: 0.03,
        phase: Math.PI / 2,
        currentX: 275 * CHAR_SIZE,
        currentY: 92 * CHAR_SIZE,
        type: 'stone_horizontal',
        name: 'Westelijk Schuifblok',
      },
      // 3. North-East Hydraulic Crusher (fast vertical pressure block)
      {
        id: 3,
        x: 735 * CHAR_SIZE,
        y: 135 * CHAR_SIZE,
        w: 16,
        h: 52,
        dx: 0,
        dy: 46,
        speed: 0.035,
        phase: Math.PI,
        currentX: 735 * CHAR_SIZE,
        currentY: 135 * CHAR_SIZE,
        type: 'hydraulic_crusher',
        name: 'Noordoostelijke Vergruizer',
      },
      // 4. Central Hub Gate (locked with Central Bastion Key #4)
      {
        id: 4,
        x: 470 * CHAR_SIZE,
        y: 245 * CHAR_SIZE,
        w: 18,
        h: 56,
        dx: 0,
        dy: 0,
        speed: 0,
        phase: 0,
        currentX: 470 * CHAR_SIZE,
        currentY: 245 * CHAR_SIZE,
        type: 'key_gate',
        name: 'Poort Centraal Bastion',
        requiredKeyId: 4,
        isUnlocked: false,
        retractProgress: 0,
      },
      // 5. East Core Generator Crusher (horizontal hydraulic slammer)
      {
        id: 5,
        x: 810 * CHAR_SIZE,
        y: 265 * CHAR_SIZE,
        w: 48,
        h: 16,
        dx: 44,
        dy: 0,
        speed: 0.032,
        phase: 0,
        currentX: 810 * CHAR_SIZE,
        currentY: 265 * CHAR_SIZE,
        type: 'hydraulic_crusher',
        name: 'Generator Drukmuur',
      },
      // 6. South-West Shaft Sluice Gate
      {
        id: 6,
        x: 335 * CHAR_SIZE,
        y: 355 * CHAR_SIZE,
        w: 16,
        h: 54,
        dx: 0,
        dy: 48,
        speed: 0.028,
        phase: Math.PI * 0.7,
        currentX: 335 * CHAR_SIZE,
        currentY: 355 * CHAR_SIZE,
        type: 'stone_vertical',
        name: 'Zuidelijke Valklep',
      },
      // 7. Master Gate to Heart Chamber (locked with Master Key #5)
      {
        id: 7,
        x: 675 * CHAR_SIZE,
        y: 375 * CHAR_SIZE,
        w: 20,
        h: 64,
        dx: 0,
        dy: 0,
        speed: 0,
        phase: 0,
        currentX: 675 * CHAR_SIZE,
        currentY: 375 * CHAR_SIZE,
        type: 'key_gate',
        name: 'Grote Poort der Hartkamer',
        requiredKeyId: 5,
        isUnlocked: false,
        retractProgress: 0,
      },
    ];

    return {
      status: 'title',
      helicopter: {
        x: DEFAULT_START_POS.x,
        y: DEFAULT_START_POS.y,
        vx: 0,
        vy: 0,
        angle: 0,
        facingDir: 'right',
        rotorFrame: 0,
        isInvulnerable: false,
        invulnerableTimer: 0,
      },
      lives: 14, // Authentic Radarsoft 1985 rule: 14 helicopters!
      score: 0,
      fuel: 100,
      keysCollected: 0,
      activeCheckpoint: { ...DEFAULT_START_POS },
      rockets: [],
      enemies: [],
      barriers,
      movingWalls,
      checkpoints,
      items,
      heart,
      particles: [],
      mapWidth: MAP_WIDTH,
      mapHeight: MAP_HEIGHT,
      visitedSectors: new Array(16 * 16).fill(false),
      exploredPercent: 1,
      radarMode: 'mini',
      message: 'MISSIE: VIND EN VERNIETIG HET KLOPPENDE HART!',
      messageTimer: 300,
    };
  }

  // Load the 8192x4096 map image and generate the 1024x512 collision grid
  public async loadMap(imagePath: string = '/games/eindeloos/map.png'): Promise<void> {
    if (this.isLoaded && this.collisionGrid) return;

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = imagePath;
      img.onload = () => {
        this.mapImage = img;
        try {
          const offCanvas = document.createElement('canvas');
          offCanvas.width = GRID_COLS;
          offCanvas.height = GRID_ROWS;
          const ctx = offCanvas.getContext('2d');
          if (!ctx) {
            this.fallbackCollisionGrid();
            resolve();
            return;
          }

          // Draw scaled 1024x512 version to detect solid walls vs black empty space
          ctx.drawImage(img, 0, 0, GRID_COLS, GRID_ROWS);
          const imgData = ctx.getImageData(0, 0, GRID_COLS, GRID_ROWS);
          const data = imgData.data;

          this.collisionGrid = new Uint8Array(GRID_COLS * GRID_ROWS);
          for (let i = 0; i < GRID_COLS * GRID_ROWS; i++) {
            const r = data[i * 4];
            const g = data[i * 4 + 1];
            const b = data[i * 4 + 2];
            // If pixel is not nearly black, it's solid cave wall
            if (r > 35 || g > 35 || b > 35) {
              this.collisionGrid[i] = 1;
            } else {
              this.collisionGrid[i] = 0;
            }
          }

          // Ensure starting zone, all checkpoints, items and moving wall shafts are cleared of accidental solid pixels
          this.clearSafeZone(this.state.helicopter.x, this.state.helicopter.y, 48);
          for (const cp of this.state.checkpoints) {
            this.clearSafeZone(cp.x, cp.y, 36);
          }
          for (const item of this.state.items) {
            this.clearSafeZone(item.x, item.y, 28);
          }
          for (const mw of this.state.movingWalls) {
            this.clearSafeZone(mw.x + mw.w / 2 + mw.dx / 2, mw.y + mw.h / 2 + mw.dy / 2, Math.max(mw.w + mw.dx, mw.h + mw.dy) / 2 + 16);
          }
          this.clearSafeZone(HEART_POS.x, HEART_POS.y, 48);

          this.isLoaded = true;
          resolve();
        } catch {
          this.fallbackCollisionGrid();
          resolve();
        }
      };
      img.onerror = () => {
        this.fallbackCollisionGrid();
        resolve();
      };
    });
  }

  private fallbackCollisionGrid() {
    this.collisionGrid = new Uint8Array(GRID_COLS * GRID_ROWS);
    // Safe empty grid with border walls
    for (let r = 0; r < GRID_ROWS; r++) {
      for (let c = 0; c < GRID_COLS; c++) {
        if (r < 4 || r >= GRID_ROWS - 4 || c < 4 || c >= GRID_COLS - 4) {
          this.collisionGrid[r * GRID_COLS + c] = 1;
        }
      }
    }
    this.isLoaded = true;
  }

  private clearSafeZone(worldX: number, worldY: number, radiusPx: number) {
    if (!this.collisionGrid) return;
    const centerCol = Math.floor(worldX / CHAR_SIZE);
    const centerRow = Math.floor(worldY / CHAR_SIZE);
    const charRadius = Math.ceil(radiusPx / CHAR_SIZE);

    for (let r = centerRow - charRadius; r <= centerRow + charRadius; r++) {
      for (let c = centerCol - charRadius; c <= centerCol + charRadius; c++) {
        if (r >= 0 && r < GRID_ROWS && c >= 0 && c < GRID_COLS) {
          this.collisionGrid[r * GRID_COLS + c] = 0;
        }
      }
    }
  }

  public getMapImage(): HTMLImageElement | null {
    return this.mapImage;
  }

  public isWall(worldX: number, worldY: number): boolean {
    if (worldX < 0 || worldX >= MAP_WIDTH || worldY < 0 || worldY >= MAP_HEIGHT) {
      return true;
    }
    if (!this.collisionGrid) return false;
    const col = Math.floor(worldX / CHAR_SIZE);
    const row = Math.floor(worldY / CHAR_SIZE);
    return this.collisionGrid[row * GRID_COLS + col] === 1;
  }

  public isMovingWallHit(worldX: number, worldY: number): boolean {
    for (const mw of this.state.movingWalls) {
      if (mw.isUnlocked && mw.retractProgress !== undefined && mw.retractProgress >= 0.95) {
        continue;
      }
      const wallX = mw.currentX;
      const wallY = mw.currentY;
      const wallW = mw.w;
      const wallH = mw.h * (1 - (mw.retractProgress || 0));

      if (
        worldX >= wallX &&
        worldX <= wallX + wallW &&
        worldY >= wallY &&
        worldY <= wallY + wallH
      ) {
        return true;
      }
    }
    return false;
  }

  public checkHelicopterCollision(x: number, y: number, radius = 4.2): boolean {
    // Check 8 bounding points around the helicopter core (forgiving hitbox)
    const points = [
      { x: x - radius, y: y },
      { x: x + radius, y: y },
      { x: x, y: y - radius },
      { x: x, y: y + radius },
      { x: x - radius * 0.7, y: y - radius * 0.7 },
      { x: x + radius * 0.7, y: y - radius * 0.7 },
      { x: x - radius * 0.7, y: y + radius * 0.7 },
      { x: x + radius * 0.7, y: y + radius * 0.7 },
    ];

    for (const p of points) {
      if (this.isWall(p.x, p.y)) return true;
    }

    // Check active energy barriers
    for (const b of this.state.barriers) {
      if (b.active) {
        if (
          x + radius > b.x &&
          x - radius < b.x + b.w &&
          y + radius > b.y &&
          y - radius < b.y + b.h
        ) {
          return true;
        }
      }
    }

    // Check moving stone walls and hydraulic gates
    for (const mw of this.state.movingWalls) {
      if (mw.isUnlocked && mw.retractProgress !== undefined && mw.retractProgress >= 0.95) {
        continue;
      }
      const wallX = mw.currentX;
      const wallY = mw.currentY;
      const wallW = mw.w;
      const wallH = mw.h * (1 - (mw.retractProgress || 0));

      if (
        x + radius > wallX &&
        x - radius < wallX + wallW &&
        y + radius > wallY &&
        y - radius < wallY + wallH
      ) {
        return true;
      }
    }

    return false;
  }

  public startGame() {
    this.state.status = 'playing';
    this.state.helicopter.isInvulnerable = true;
    this.state.helicopter.invulnerableTimer = 180; // 3 seconds safety grace on start
    eindeloosAudio.startEngine();
    this.state.message = 'MISSIE GESTART: VLIEG HET LABYRINT BINNEN!';
    this.state.messageTimer = 200;
  }

  public fireRocket() {
    if (this.state.status !== 'playing') return;
    if (this.state.rockets.length >= 4) return; // Max 4 rockets at a time

    const h = this.state.helicopter;
    let rvx = 0;
    let rvy = 0;
    const speed = 7;

    switch (h.facingDir) {
      case 'left':
        rvx = -speed;
        break;
      case 'right':
        rvx = speed;
        break;
      case 'up':
        rvy = -speed;
        break;
      case 'down':
        rvy = speed;
        break;
      case 'up-left':
        rvx = -speed * 0.707;
        rvy = -speed * 0.707;
        break;
      case 'up-right':
        rvx = speed * 0.707;
        rvy = -speed * 0.707;
        break;
      case 'down-left':
        rvx = -speed * 0.707;
        rvy = speed * 0.707;
        break;
      case 'down-right':
        rvx = speed * 0.707;
        rvy = speed * 0.707;
        break;
    }

    this.state.rockets.push({
      id: ++this.rocketIdCounter,
      x: h.x,
      y: h.y,
      vx: rvx + h.vx * 0.3,
      vy: rvy + h.vy * 0.3,
      life: 70,
    });

    eindeloosAudio.playRocketFire();
  }

  public activateCheckpointUnderHelicopter(actionPressed = false): boolean {
    if (this.state.status !== 'playing') return false;
    const h = this.state.helicopter;

    for (const cp of this.state.checkpoints) {
      const dist = Math.hypot(h.x - cp.x, h.y - cp.y);
      // Trigger if within 36px or within 55px when action is pressed
      if (dist < 36 || (actionPressed && dist < 55)) {
        if (!cp.activated) {
          cp.activated = true;
          this.state.activeCheckpoint = { x: cp.x, y: cp.y };
          this.state.score += 500;
          this.state.fuel = 100; // Refill fuel completely at checkpoint!
          this.state.message = 'CHECKPOINT GEACTIVEERD! (+500 PT, BRANDSTOF 100%)';
          this.state.messageTimer = 220;
          eindeloosAudio.playCheckpoint();
          this.spawnConfetti(cp.x, cp.y);
          return true;
        } else if (actionPressed && this.state.fuel < 98) {
          this.state.fuel = 100;
          this.state.message = 'BRANDSTOF WEER VOLGETANKT! (100%)';
          this.state.messageTimer = 140;
          eindeloosAudio.playCheckpoint();
          return true;
        }
      }
    }
    return false;
  }

  public update(inputs: {
    up: boolean;
    down: boolean;
    left: boolean;
    right: boolean;
    fire: boolean;
    action: boolean; // For checkpoint
  }) {
    if (this.state.status !== 'playing') {
      this.updateParticles();
      return;
    }

    const h = this.state.helicopter;

    // 1. Helicopter movement & inertia (Calm, controllable Radarsoft retro physics)
    const baseAccel = 0.072;
    const baseMaxSpeed = 1.25; // Calm and pleasant baseline speed
    const accel = baseAccel * this.speedMultiplier;
    const maxSpeed = baseMaxSpeed * this.speedMultiplier;

    let ax = 0;
    let ay = 0;

    if (inputs.left) ax -= accel;
    if (inputs.right) ax += accel;
    if (inputs.up) ay -= accel;
    if (inputs.down) ay += accel;

    const hasInput = inputs.left || inputs.right || inputs.up || inputs.down;
    // Active hover stabilization when keys are released, preventing accidental runaway drifting!
    const friction = hasInput ? 0.94 : 0.85;

    // Diagonal speed normalization
    if (ax !== 0 && ay !== 0) {
      ax *= 0.707;
      ay *= 0.707;
    }

    h.vx = (h.vx + ax) * friction;
    h.vy = (h.vy + ay) * friction;

    // Micro speed cutoff to avoid indefinite sub-pixel creeping
    if (!hasInput) {
      if (Math.abs(h.vx) < 0.02) h.vx = 0;
      if (Math.abs(h.vy) < 0.02) h.vy = 0;
    }

    // Cap maximum velocity
    const currentSpeed = Math.hypot(h.vx, h.vy);
    if (currentSpeed > maxSpeed) {
      h.vx = (h.vx / currentSpeed) * maxSpeed;
      h.vy = (h.vy / currentSpeed) * maxSpeed;
    }

    // Dynamic rotor sound speed modulation
    eindeloosAudio.updateSpeed(maxSpeed > 0 ? currentSpeed / maxSpeed : 0);

    // Determine facing direction
    if (Math.abs(h.vx) > 0.15 || Math.abs(h.vy) > 0.15) {
      if (Math.abs(h.vx) > Math.abs(h.vy) * 1.5) {
        h.facingDir = h.vx > 0 ? 'right' : 'left';
      } else if (Math.abs(h.vy) > Math.abs(h.vx) * 1.5) {
        h.facingDir = h.vy > 0 ? 'down' : 'up';
      } else {
        if (h.vx > 0 && h.vy < 0) h.facingDir = 'up-right';
        else if (h.vx < 0 && h.vy < 0) h.facingDir = 'up-left';
        else if (h.vx > 0 && h.vy > 0) h.facingDir = 'down-right';
        else if (h.vx < 0 && h.vy > 0) h.facingDir = 'down-left';
      }
    }

    // Rotor animation
    h.rotorFrame = (h.rotorFrame + 1) % 4;

    // Invulnerability timer
    if (h.isInvulnerable) {
      h.invulnerableTimer--;
      if (h.invulnerableTimer <= 0) {
        h.isInvulnerable = false;
      }
    }

    // Move helicopter step-by-step for continuous collision
    const steps = 4;
    const stepX = h.vx / steps;
    const stepY = h.vy / steps;

    for (let s = 0; s < steps; s++) {
      const nextX = h.x + stepX;
      const nextY = h.y + stepY;

      if (!h.isInvulnerable && this.checkHelicopterCollision(nextX, nextY)) {
        const impactSpeed = Math.hypot(h.vx, h.vy);
        // If soft bumper is enabled and impact was relatively gentle, bounce safely!
        if (this.bumperEnabled && impactSpeed < 1.15) {
          h.vx = -h.vx * 0.55;
          h.vy = -h.vy * 0.55;
          eindeloosAudio.playBumper();
          this.spawnExplosion(nextX, nextY, 5, '#facc15');
          // Brief safety cushion of 12 frames
          h.isInvulnerable = true;
          h.invulnerableTimer = 14;
          break;
        } else {
          this.crashHelicopter();
          return;
        }
      }

      h.x = Math.max(8, Math.min(MAP_WIDTH - 8, nextX));
      h.y = Math.max(8, Math.min(MAP_HEIGHT - 8, nextY));
    }

    // 2. Exploration tracking (16x16 macro sector grid)
    const sectorCol = Math.floor(h.x / (MAP_WIDTH / 16));
    const sectorRow = Math.floor(h.y / (MAP_HEIGHT / 16));
    const sectorIdx = sectorRow * 16 + sectorCol;
    if (sectorIdx >= 0 && sectorIdx < 256 && !this.state.visitedSectors[sectorIdx]) {
      this.state.visitedSectors[sectorIdx] = true;
      const count = this.state.visitedSectors.filter(Boolean).length;
      this.state.exploredPercent = Math.round((count / 256) * 100);
      this.state.score += 50;
    }

    // 3. Update rockets
    for (let i = this.state.rockets.length - 1; i >= 0; i--) {
      const r = this.state.rockets[i];
      r.x += r.vx;
      r.y += r.vy;
      r.life--;

      if (r.life <= 0 || this.isWall(r.x, r.y) || this.isMovingWallHit(r.x, r.y)) {
        this.spawnExplosion(r.x, r.y, 8, '#ff9900');
        this.state.rockets.splice(i, 1);
        continue;
      }

      // Check rocket hits enemy
      for (let j = this.state.enemies.length - 1; j >= 0; j--) {
        const e = this.state.enemies[j];
        if (Math.hypot(r.x - e.x, r.y - e.y) < 14) {
          e.health--;
          this.spawnExplosion(e.x, e.y, 14, '#ff3333');
          eindeloosAudio.playEnemyDestroyed();
          this.state.rockets.splice(i, 1);

          if (e.health <= 0) {
            this.state.enemies.splice(j, 1);
            this.state.score += e.type === 'skull' ? 250 : 150;
          }
          break;
        }
      }

      // Check rocket hits heart
      if (!this.state.heart.isDestroyed && Math.hypot(r.x - this.state.heart.x, r.y - this.state.heart.y) < 36) {
        this.state.heart.health--;
        this.spawnExplosion(r.x, r.y, 16, '#ff0055');
        eindeloosAudio.playEnemyDestroyed();
        this.state.rockets.splice(i, 1);

        if (this.state.heart.health <= 0) {
          this.destroyHeart();
          return;
        }
      }
    }

    // 4. Update energy barriers cycle
    for (const b of this.state.barriers) {
      b.cycleTimer = (b.cycleTimer + 1) % 120;
      b.active = b.cycleTimer < 80;
    }

    // 4b. Update moving mechanical stone walls & gates
    for (const mw of this.state.movingWalls) {
      if (mw.type === 'key_gate') {
        if (mw.isUnlocked) {
          if (mw.retractProgress === undefined) mw.retractProgress = 0;
          if (mw.retractProgress < 1) {
            mw.retractProgress = Math.min(1, mw.retractProgress + 0.015);
            if (Math.random() < 0.2) {
              this.spawnExplosion(mw.x + Math.random() * mw.w, mw.y + mw.h * (1 - mw.retractProgress), 2, '#a4a4a4');
            }
          }
        }
      } else {
        mw.phase = (mw.phase + mw.speed) % (Math.PI * 2);
        const wave = (Math.sin(mw.phase) + 1) / 2; // 0 to 1 smooth sinusoidal motion
        mw.currentX = mw.x + mw.dx * wave;
        mw.currentY = mw.y + mw.dy * wave;

        // Sound effect if near moving door
        if (Math.hypot(h.x - (mw.currentX + mw.w / 2), h.y - (mw.currentY + mw.h / 2)) < 200) {
          if (Math.abs(Math.sin(mw.phase)) > 0.98) {
            eindeloosAudio.playDoorServo();
          }
        }
      }
    }

    // 5. Dynamic enemy spawning & AI near helicopter
    this.manageEnemies(h);

    // 6. Check enemy collision with helicopter
    if (!h.isInvulnerable) {
      for (const e of this.state.enemies) {
        if (Math.hypot(h.x - e.x, h.y - e.y) < 16) {
          this.crashHelicopter();
          return;
        }
      }
    }

    // 7. Checkpoint interaction (Activate on button press or by hovering directly over it)
    this.activateCheckpointUnderHelicopter(inputs.action);

    // 7b. Interactive Item Pickup (Keys, Fuel Tanks, 4-Way Cross Boosters, Energy Orbs)
    for (const item of this.state.items) {
      if (item.collected) continue;
      const dist = Math.hypot(h.x - item.x, h.y - item.y);
      if (dist < 28) {
        item.collected = true;
        if (item.type === 'key') {
          this.state.keysCollected++;
          this.state.score += 1000;
          this.state.fuel = Math.min(100, this.state.fuel + 40);
          this.state.message = 'SLEUTEL VERZAMELD! (+1000 PUNTEN, BRANDSTOF +40%)';
          this.state.messageTimer = 200;
          eindeloosAudio.playKeyPickup();
          this.spawnConfetti(item.x, item.y);

          // Unlock corresponding key gates
          for (const mw of this.state.movingWalls) {
            if (mw.type === 'key_gate' && (mw.requiredKeyId === item.id || !mw.requiredKeyId)) {
              mw.isUnlocked = true;
              this.state.message = `${mw.name.toUpperCase()} GEOPEND!`;
              this.state.messageTimer = 220;
              eindeloosAudio.playGateOpen();
            }
          }

          // Unlock closest barrier if any
          const lockedBarrier = this.state.barriers.find(b => b.active);
          if (lockedBarrier) {
            lockedBarrier.active = false;
          }
        } else if (item.type === 'fuel') {
          this.state.fuel = 100;
          this.state.score += 500;
          this.state.message = 'BRANDSTOFVOLTANK! (+500 PUNTEN)';
          this.state.messageTimer = 180;
          eindeloosAudio.playCheckpoint();
          this.spawnConfetti(item.x, item.y);
        } else if (item.type === 'cross_boost') {
          // 4-Way Arrow Cross: Turbo surge + temporary shield invulnerability
          this.state.score += 250;
          this.state.fuel = Math.min(100, this.state.fuel + 25);
          h.isInvulnerable = true;
          h.invulnerableTimer = 180; // 3 seconds of shield!
          // Apply velocity boost
          if (Math.abs(h.vx) > 0.1 || Math.abs(h.vy) > 0.1) {
            h.vx *= 1.6;
            h.vy *= 1.6;
          } else {
            h.vx = h.facingDir === 'left' ? -3.5 : 3.5;
          }
          this.state.message = '4-WEGEN TURBO BOOST! (+250 PT, ONKWETSBAAR SCHILD)';
          this.state.messageTimer = 200;
          eindeloosAudio.playBoost();
          this.spawnConfetti(item.x, item.y, '#55ffff');
        } else if (item.type === 'energy_orb') {
          // Energy Diamond / Orb
          this.state.score += 50;
          this.state.fuel = Math.min(100, this.state.fuel + 5);
          eindeloosAudio.playBlip();
          this.spawnConfetti(item.x, item.y, '#ffff55');
        }
      }
    }

    // 8. Heart pulsating effect & sound
    const distToHeart = Math.hypot(h.x - this.state.heart.x, h.y - this.state.heart.y);
    this.state.heart.pulsePhase = (this.state.heart.pulsePhase + 0.08) % (Math.PI * 2);

    if (distToHeart < 450 && Math.sin(this.state.heart.pulsePhase) > 0.98) {
      eindeloosAudio.playHeartBeat();
    }

    // 9. Messages timer
    if (this.state.messageTimer > 0) {
      this.state.messageTimer--;
      if (this.state.messageTimer === 0) {
        this.state.message = '';
      }
    }

    this.updateParticles();
  }

  private manageEnemies(h: { x: number; y: number }) {
    // Remove far away enemies
    this.state.enemies = this.state.enemies.filter(e => Math.hypot(e.x - h.x, e.y - h.y) < 800);

    // Spawn skull or mine if density is low
    if (this.state.enemies.length < 5 && Math.random() < 0.03) {
      const angle = Math.random() * Math.PI * 2;
      const dist = 320 + Math.random() * 200;
      const ex = h.x + Math.cos(angle) * dist;
      const ey = h.y + Math.sin(angle) * dist;

      if (!this.isWall(ex, ey)) {
        const isSkull = Math.random() > 0.4;
        this.state.enemies.push({
          id: ++this.enemyIdCounter,
          x: ex,
          y: ey,
          type: isSkull ? 'skull' : 'mine',
          vx: 0,
          vy: 0,
          state: 0,
          health: isSkull ? 2 : 1,
          blinkTimer: 0,
          isBlinking: false,
        });
      }
    }

    // Update enemy movement
    for (const e of this.state.enemies) {
      if (e.type === 'skull') {
        // Skulls slowly stalk toward the helicopter
        const angle = Math.atan2(h.y - e.y, h.x - e.x);
        e.vx = Math.cos(angle) * 1.1;
        e.vy = Math.sin(angle) * 1.1;

        const nextX = e.x + e.vx;
        const nextY = e.y + e.vy;
        if (!this.isWall(nextX, nextY)) {
          e.x = nextX;
          e.y = nextY;
        }

        e.blinkTimer = (e.blinkTimer + 1) % 40;
        e.isBlinking = e.blinkTimer < 8; // Winking skull effect!
      } else {
        // Floating mines oscillate
        e.state = (e.state + 0.05) % (Math.PI * 2);
        const nextX = e.x + Math.cos(e.state) * 0.8;
        const nextY = e.y + Math.sin(e.state * 1.5) * 0.8;
        if (!this.isWall(nextX, nextY)) {
          e.x = nextX;
          e.y = nextY;
        }
      }
    }
  }

  private crashHelicopter() {
    const h = this.state.helicopter;
    eindeloosAudio.stopEngine();
    eindeloosAudio.playExplosion();
    this.spawnExplosion(h.x, h.y, 35, '#ff4400');

    this.state.lives--;
    if (this.state.lives <= 0) {
      this.state.status = 'game_over';
      this.state.message = 'GAME OVER - GEEN HELIKOPTERS MEER OVER!';
      return;
    }

    this.state.status = 'crashed';
    this.state.message = `HELIKOPTER VERLOREN! NOG ${this.state.lives} OVER. HERSTART VANAF CHECKPOINT...`;

    setTimeout(() => {
      if (this.state.status === 'crashed') {
        this.respawnAtCheckpoint();
      }
    }, 1800);
  }

  public respawnAtCheckpoint() {
    const cp = this.state.activeCheckpoint;
    const h = this.state.helicopter;
    h.x = cp.x;
    h.y = cp.y;
    h.vx = 0;
    h.vy = 0;
    h.isInvulnerable = true;
    h.invulnerableTimer = 180; // 3 seconds invulnerability
    this.state.status = 'playing';
    this.state.message = 'VLUCHT HERVAT!';
    this.state.messageTimer = 120;
    eindeloosAudio.startEngine();
  }

  private destroyHeart() {
    this.state.heart.isDestroyed = true;
    this.state.status = 'victory';
    this.state.score += 10000;
    this.state.message = 'GEWELDIG! HET KLOPPENDE HART IS VERNIETIGD! JE HEBT EINDELOOS OVERWONNEN!';
    eindeloosAudio.stopEngine();
    eindeloosAudio.playCheckpoint();
    this.spawnExplosion(this.state.heart.x, this.state.heart.y, 60, '#ff00aa');
  }

  private spawnExplosion(x: number, y: number, count: number, color: string) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1 + Math.random() * 4;
      this.state.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color,
        size: 2 + Math.random() * 3,
        alpha: 1,
        life: 25 + Math.random() * 20,
        maxLife: 45,
      });
    }
  }

  private spawnConfetti(x: number, y: number, customColor?: string) {
    const colors = customColor ? [customColor, '#ffffff'] : ['#55ffff', '#ffffff', '#ffff55', '#55ff55'];
    for (let i = 0; i < 20; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.5 + Math.random() * 3;
      this.state.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: colors[i % colors.length],
        size: 3,
        alpha: 1,
        life: 40,
        maxLife: 40,
      });
    }
  }

  private updateParticles() {
    for (let i = this.state.particles.length - 1; i >= 0; i--) {
      const p = this.state.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.96;
      p.vy *= 0.96;
      p.life--;
      p.alpha = Math.max(0, p.life / p.maxLife);
      if (p.life <= 0) {
        this.state.particles.splice(i, 1);
      }
    }
  }
}
