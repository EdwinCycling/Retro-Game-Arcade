/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Prince of Persia (1989/1990) - Core Game Engine
 * Jordan Mechner's rotoscoped physics, dungeon tile logic, traps & sword combat.
 */

import { princeAudio } from './princeAudio';

export type TileType = 
  | 'empty'
  | 'floor'
  | 'pillar'
  | 'wall'
  | 'gate'
  | 'plate_open'
  | 'plate_close'
  | 'spikes'
  | 'loose_floor'
  | 'chomper'
  | 'potion_small'
  | 'potion_big'
  | 'sword_item'
  | 'exit_door'
  | 'torch'
  | 'magic_mirror';

export interface DungeonTile {
  type: TileType;
  x: number; // tile grid col (0-9)
  y: number; // tile grid row (0-2)
  roomX: number; // room col in world
  roomY: number; // room row in world
  state?: number; // for animations/traps (e.g. gate height, spikes out, loose falling y, mirror shattered)
  gateId?: string;
  targetGateId?: string;
}

export type PlayerAction =
  | 'idle'
  | 'running'
  | 'tiptoe'
  | 'skid'
  | 'jumping'
  | 'run_jump'
  | 'falling'
  | 'hanging'
  | 'climbing'
  | 'crouching'
  | 'sword_draw'
  | 'sword_idle'
  | 'sword_strike'
  | 'sword_parry'
  | 'hurt'
  | 'dead'
  | 'victory';

export interface Guard {
  id: string;
  x: number;
  y: number;
  roomX: number;
  roomY: number;
  vx: number;
  facing: 'left' | 'right';
  action: 'idle' | 'patrol' | 'draw' | 'combat' | 'strike' | 'parry' | 'hurt' | 'dead';
  health: number;
  maxHealth: number;
  frame: number;
  attackCooldown: number;
  type: 'blue' | 'yellow' | 'red' | 'skeleton' | 'shadow';
}

export interface PrinceGameSettings {
  infiniteTime: boolean;
  invincible: boolean;
  startWithSword: boolean;
  crtFilter: boolean;
  scanlines: boolean;
  outfitSkin?: 'rose_ribbon' | 'classic' | 'royal_blue';
}

export class PrinceEngine {
  public screenWidth: number = 320;
  public screenHeight: number = 200;
  public tileWidth: number = 32;
  public tileHeight: number = 60; // 3 floors: y=0..59, y=60..119, y=120..179, hud=180..199

  // Level & World map (multiple rooms per level)
  public currentLevel: number = 1;
  public currentRoomX: number = 0;
  public currentRoomY: number = 0;
  public rooms: Map<string, DungeonTile[][]> = new Map();

  // Player state
  public px: number = 40;
  public py: number = 120; // on floor 2
  public pvx: number = 0;
  public pvy: number = 0;
  public facing: 'left' | 'right' = 'right';
  public action: PlayerAction = 'idle';
  public frame: number = 0;
  public animTimer: number = 0;

  public health: number = 3;
  public maxHealth: number = 3;
  public hasSword: boolean = false;
  public isHanging: boolean = false;
  public hangLedgeX: number = 0;
  public hangLedgeY: number = 0;

  // Time limit (60 minutes)
  public minutesRemaining: number = 60;
  public secondsRemaining: number = 0;
  public timeAccumulator: number = 0;
  public isGameOver: boolean = false;
  public isLevelWon: boolean = false;
  public isDead: boolean = false;
  public deathReason: string = '';
  public deathTimer: number = 0;
  public canRespawn: boolean = false;

  // Dungeon gates state
  public gates: Map<string, { height: number; isOpen: boolean; timer: number }> = new Map();

  // Guards
  public guards: Guard[] = [];

  // Messages
  public bannerText: string = 'TIME REMAINING: 60 MINUTES';
  public bannerTimer: number = 180;

  // Game Settings & Trainer
  public settings: PrinceGameSettings = {
    infiniteTime: false,
    invincible: false,
    startWithSword: false,
    crtFilter: true,
    scanlines: true,
  };

  // Stats
  public guardsDefeated: number = 0;
  public potionsFound: number = 0;

  constructor() {
    this.initLevel(1);
  }

  public initLevel(level: number) {
    this.currentLevel = level;
    this.rooms.clear();
    this.gates.clear();
    this.guards = [];
    this.isGameOver = false;
    this.isLevelWon = false;

    if (level === 1) {
      this.buildLevel1();
      this.bannerText = 'LEVEL 1: THE DUNGEON';
    } else if (level === 2) {
      this.buildLevel2();
      this.bannerText = 'LEVEL 2: THE PALACE VAULT';
    } else if (level === 3) {
      this.buildLevel3();
      this.bannerText = 'LEVEL 3: THE SKELETON CRYPT';
    } else {
      this.buildLevel4();
      this.bannerText = 'LEVEL 4: THE MIRROR CHAMBER & SHADOW';
    }

    if (this.settings.startWithSword || level >= 2) {
      this.hasSword = true;
    }

    this.bannerTimer = 180;
    princeAudio.playIntroTheme();
  }

  /**
   * Build Level 1: 3 Rooms (Room 0,0: Prison Cell; Room 1,0: Great Hall with Sword; Room 2,0: Exit Gate & Guard)
   */
  private buildLevel1() {
    this.currentRoomX = 0;
    this.currentRoomY = 0;
    this.px = 50;
    this.py = 120;
    this.facing = 'right';
    this.action = 'idle';
    this.hasSword = this.settings.startWithSword;

    // Gate 1 (Cell Gate) & Gate 2 (Exit Gate)
    this.gates.set('gate_cell', { height: 0, isOpen: false, timer: 0 });
    this.gates.set('gate_exit', { height: 0, isOpen: false, timer: 0 });

    // Room (0,0): Prison Cell
    const r0 = this.createEmptyRoom(0, 0);
    // Floor 0 (top)
    for (let c = 0; c < 10; c++) r0[0][c] = { type: 'floor', x: c, y: 0, roomX: 0, roomY: 0 };
    // Floor 1 (middle): chasm on left, floor on right
    for (let c = 4; c < 10; c++) r0[1][c] = { type: 'floor', x: c, y: 1, roomX: 0, roomY: 0 };
    r0[1][2] = { type: 'loose_floor', x: 2, y: 1, roomX: 0, roomY: 0, state: 0 };
    r0[1][7] = { type: 'torch', x: 7, y: 1, roomX: 0, roomY: 0 };
    // Floor 2 (bottom): Solid ground
    for (let c = 0; c < 10; c++) r0[2][c] = { type: 'floor', x: c, y: 2, roomX: 0, roomY: 0 };
    // Cell gate at x=8, floor 2
    r0[2][8] = { type: 'gate', x: 8, y: 2, roomX: 0, roomY: 0, gateId: 'gate_cell' };
    // Pressure plate to open cell gate at x=2, floor 2
    r0[2][2] = { type: 'plate_open', x: 2, y: 2, roomX: 0, roomY: 0, targetGateId: 'gate_cell' };
    r0[2][1] = { type: 'potion_small', x: 1, y: 2, roomX: 0, roomY: 0 };
    r0[2][5] = { type: 'torch', x: 5, y: 2, roomX: 0, roomY: 0 };
    this.rooms.set('0,0', r0);

    // Room (1,0): Great Hall with Sword & Traps
    const r1 = this.createEmptyRoom(1, 0);
    for (let c = 0; c < 10; c++) r1[0][c] = { type: 'floor', x: c, y: 0, roomX: 1, roomY: 0 };
    // Middle floor
    for (let c = 0; c < 10; c++) {
      if (c === 3 || c === 4) continue; // Gap
      r1[1][c] = { type: 'floor', x: c, y: 1, roomX: 1, roomY: 0 };
    }
    r1[1][2] = { type: 'spikes', x: 2, y: 1, roomX: 1, roomY: 0, state: 0 };
    r1[1][7] = { type: 'sword_item', x: 7, y: 1, roomX: 1, roomY: 0 };
    r1[1][8] = { type: 'torch', x: 8, y: 1, roomX: 1, roomY: 0 };

    // Bottom floor
    for (let c = 0; c < 10; c++) r1[2][c] = { type: 'floor', x: c, y: 2, roomX: 1, roomY: 0 };
    r1[2][4] = { type: 'spikes', x: 4, y: 2, roomX: 1, roomY: 0, state: 0 };
    r1[2][7] = { type: 'chomper', x: 7, y: 2, roomX: 1, roomY: 0, state: 0 };
    r1[2][3] = { type: 'torch', x: 3, y: 2, roomX: 1, roomY: 0 };
    this.rooms.set('1,0', r1);

    // Room (2,0): Exit Door, Big Elixir & Guard
    const r2 = this.createEmptyRoom(2, 0);
    for (let c = 0; c < 10; c++) r2[0][c] = { type: 'floor', x: c, y: 0, roomX: 2, roomY: 0 };
    // Upper ledge with big potion
    for (let c = 1; c <= 4; c++) r2[1][c] = { type: 'floor', x: c, y: 1, roomX: 2, roomY: 0 };
    r2[1][1] = { type: 'potion_big', x: 1, y: 1, roomX: 2, roomY: 0 };
    r2[1][4] = { type: 'torch', x: 4, y: 1, roomX: 2, roomY: 0 };

    // Bottom floor
    for (let c = 0; c < 10; c++) r2[2][c] = { type: 'floor', x: c, y: 2, roomX: 2, roomY: 0 };
    r2[2][2] = { type: 'plate_open', x: 2, y: 2, roomX: 2, roomY: 0, targetGateId: 'gate_exit' };
    r2[2][6] = { type: 'gate', x: 6, y: 2, roomX: 2, roomY: 0, gateId: 'gate_exit' };
    r2[2][9] = { type: 'exit_door', x: 9, y: 2, roomX: 2, roomY: 0 };
    r2[2][7] = { type: 'torch', x: 7, y: 2, roomX: 2, roomY: 0 };
    this.rooms.set('2,0', r2);

    // Add Guard guarding exit gate in Room 2,0
    this.guards.push({
      id: 'guard_1',
      x: 180,
      y: 120,
      roomX: 2,
      roomY: 0,
      vx: 0,
      facing: 'left',
      action: 'patrol',
      health: 3,
      maxHealth: 3,
      frame: 0,
      attackCooldown: 60,
      type: 'blue'
    });
  }

  /**
   * Build Level 2: The Palace Vault
   */
  private buildLevel2() {
    this.currentRoomX = 0;
    this.currentRoomY = 0;
    this.px = 40;
    this.py = 60; // Upper floor
    this.facing = 'right';
    this.action = 'idle';
    this.hasSword = true;

    this.gates.set('gate_vault', { height: 0, isOpen: false, timer: 0 });

    const r0 = this.createEmptyRoom(0, 0);
    for (let c = 0; c < 10; c++) r0[0][c] = { type: 'floor', x: c, y: 0, roomX: 0, roomY: 0 };
    for (let c = 0; c < 6; c++) r0[1][c] = { type: 'floor', x: c, y: 1, roomX: 0, roomY: 0 };
    r0[1][6] = { type: 'loose_floor', x: 6, y: 1, roomX: 0, roomY: 0, state: 0 };
    r0[1][7] = { type: 'loose_floor', x: 7, y: 1, roomX: 0, roomY: 0, state: 0 };
    for (let c = 0; c < 10; c++) r0[2][c] = { type: 'floor', x: c, y: 2, roomX: 0, roomY: 0 };
    r0[2][4] = { type: 'spikes', x: 4, y: 2, roomX: 0, roomY: 0, state: 0 };
    r0[2][8] = { type: 'plate_open', x: 8, y: 2, roomX: 0, roomY: 0, targetGateId: 'gate_vault' };
    this.rooms.set('0,0', r0);

    const r1 = this.createEmptyRoom(1, 0);
    for (let c = 0; c < 10; c++) r1[0][c] = { type: 'floor', x: c, y: 0, roomX: 1, roomY: 0 };
    for (let c = 0; c < 10; c++) r1[1][c] = { type: 'floor', x: c, y: 1, roomX: 1, roomY: 0 };
    r1[1][3] = { type: 'gate', x: 3, y: 1, roomX: 1, roomY: 0, gateId: 'gate_vault' };
    r1[1][5] = { type: 'chomper', x: 5, y: 1, roomX: 1, roomY: 0, state: 0 };
    r1[1][8] = { type: 'potion_big', x: 8, y: 1, roomX: 1, roomY: 0 };
    for (let c = 0; c < 10; c++) r1[2][c] = { type: 'floor', x: c, y: 2, roomX: 1, roomY: 0 };
    r1[2][9] = { type: 'exit_door', x: 9, y: 2, roomX: 1, roomY: 0 };
    this.rooms.set('1,0', r1);

    this.guards.push({
      id: 'guard_2',
      x: 180,
      y: 60,
      roomX: 1,
      roomY: 0,
      vx: 0,
      facing: 'left',
      action: 'patrol',
      health: 4,
      maxHealth: 4,
      frame: 0,
      attackCooldown: 40,
      type: 'yellow'
    });
  }

  /**
   * Build Level 3: The Skeleton Crypt
   * Features the legendary immortal Skeleton that reassembles unless driven into the pit!
   */
  private buildLevel3() {
    this.currentRoomX = 0;
    this.currentRoomY = 0;
    this.px = 40;
    this.py = 60; // Upper floor
    this.facing = 'right';
    this.action = 'idle';
    this.hasSword = true;

    this.gates.set('gate_crypt', { height: 0, isOpen: false, timer: 0 });

    // Room 0,0: Upper Crypt entry with crumbling loose floor tiles over bottom floor
    const r0 = this.createEmptyRoom(0, 0);
    for (let c = 0; c < 10; c++) r0[0][c] = { type: 'floor', x: c, y: 0, roomX: 0, roomY: 0 };
    for (let c = 0; c < 5; c++) r0[1][c] = { type: 'floor', x: c, y: 1, roomX: 0, roomY: 0 };
    r0[1][5] = { type: 'loose_floor', x: 5, y: 1, roomX: 0, roomY: 0, state: 0 };
    r0[1][6] = { type: 'loose_floor', x: 6, y: 1, roomX: 0, roomY: 0, state: 0 };
    r0[1][8] = { type: 'torch', x: 8, y: 1, roomX: 0, roomY: 0 };
    for (let c = 0; c < 10; c++) r0[2][c] = { type: 'floor', x: c, y: 2, roomX: 0, roomY: 0 };
    r0[2][2] = { type: 'potion_small', x: 2, y: 2, roomX: 0, roomY: 0 };
    r0[2][5] = { type: 'spikes', x: 5, y: 2, roomX: 0, roomY: 0, state: 0 };
    r0[2][9] = { type: 'torch', x: 9, y: 2, roomX: 0, roomY: 0 };
    this.rooms.set('0,0', r0);

    // Room 1,0: The Catacombs & The Immortal Skeleton!
    // Middle floor is a high bridge: cols 0-6 solid, cols 7-8 EMPTY (abyss/chasm), col 9 solid with pressure plate!
    const r1 = this.createEmptyRoom(1, 0);
    for (let c = 0; c < 10; c++) r1[0][c] = { type: 'floor', x: c, y: 0, roomX: 1, roomY: 0 };
    for (let c = 0; c <= 6; c++) r1[1][c] = { type: 'floor', x: c, y: 1, roomX: 1, roomY: 0 };
    r1[1][1] = { type: 'torch', x: 1, y: 1, roomX: 1, roomY: 0 };
    // Col 9 has the pressure plate that opens the exit gate
    r1[1][9] = { type: 'plate_open', x: 9, y: 1, roomX: 1, roomY: 0, targetGateId: 'gate_crypt' };

    // Bottom floor has floor & spikes
    for (let c = 0; c < 10; c++) r1[2][c] = { type: 'floor', x: c, y: 2, roomX: 1, roomY: 0 };
    r1[2][4] = { type: 'spikes', x: 4, y: 2, roomX: 1, roomY: 0, state: 0 };
    r1[2][7] = { type: 'torch', x: 7, y: 2, roomX: 1, roomY: 0 };
    this.rooms.set('1,0', r1);

    // The Undead Skeleton guarding the bridge
    this.guards.push({
      id: 'skeleton_1',
      x: 150,
      y: 60,
      roomX: 1,
      roomY: 0,
      vx: 0,
      facing: 'left',
      action: 'combat',
      health: 999, // Cannot be killed by blade! Must be pushed into chasm!
      maxHealth: 999,
      frame: 0,
      attackCooldown: 40,
      type: 'skeleton'
    });

    // Room 2,0: The Crypt Sanctum with Gate, Big Elixir & Exit Door
    const r2 = this.createEmptyRoom(2, 0);
    for (let c = 0; c < 10; c++) r2[0][c] = { type: 'floor', x: c, y: 0, roomX: 2, roomY: 0 };
    for (let c = 0; c < 10; c++) r2[1][c] = { type: 'floor', x: c, y: 1, roomX: 2, roomY: 0 };
    r2[1][3] = { type: 'gate', x: 3, y: 1, roomX: 2, roomY: 0, gateId: 'gate_crypt' };
    r2[1][6] = { type: 'potion_big', x: 6, y: 1, roomX: 2, roomY: 0 };
    r2[1][9] = { type: 'exit_door', x: 9, y: 1, roomX: 2, roomY: 0 };
    r2[1][1] = { type: 'torch', x: 1, y: 1, roomX: 2, roomY: 0 };
    for (let c = 0; c < 10; c++) r2[2][c] = { type: 'floor', x: c, y: 2, roomX: 2, roomY: 0 };
    this.rooms.set('2,0', r2);
  }

  /**
   * Build Level 4: The Mirror Chamber & The Shadow Prince
   * Features the mystical Magic Mirror and the enigmatic Shadow Prince!
   */
  private buildLevel4() {
    this.currentRoomX = 0;
    this.currentRoomY = 0;
    this.px = 40;
    this.py = 120; // Bottom floor
    this.facing = 'right';
    this.action = 'idle';
    this.hasSword = true;

    this.gates.set('gate_mirror', { height: 0, isOpen: false, timer: 0 });
    this.gates.set('gate_mirror_exit', { height: 0, isOpen: false, timer: 0 });

    // Room 0,0: Royal Antechamber
    const r0 = this.createEmptyRoom(0, 0);
    for (let c = 0; c < 10; c++) r0[0][c] = { type: 'floor', x: c, y: 0, roomX: 0, roomY: 0 };
    for (let c = 2; c < 8; c++) r0[1][c] = { type: 'floor', x: c, y: 1, roomX: 0, roomY: 0 };
    r0[1][4] = { type: 'torch', x: 4, y: 1, roomX: 0, roomY: 0 };
    r0[1][5] = { type: 'potion_small', x: 5, y: 1, roomX: 0, roomY: 0 };
    for (let c = 0; c < 10; c++) r0[2][c] = { type: 'floor', x: c, y: 2, roomX: 0, roomY: 0 };
    r0[2][3] = { type: 'plate_open', x: 3, y: 2, roomX: 0, roomY: 0, targetGateId: 'gate_mirror' };
    r0[2][8] = { type: 'gate', x: 8, y: 2, roomX: 0, roomY: 0, gateId: 'gate_mirror' };
    this.rooms.set('0,0', r0);

    // Room 1,0: THE MAGIC MIRROR CHAMBER
    const r1 = this.createEmptyRoom(1, 0);
    for (let c = 0; c < 10; c++) r1[0][c] = { type: 'floor', x: c, y: 0, roomX: 1, roomY: 0 };
    for (let c = 0; c < 10; c++) r1[1][c] = { type: 'floor', x: c, y: 1, roomX: 1, roomY: 0 };
    r1[1][2] = { type: 'torch', x: 2, y: 1, roomX: 1, roomY: 0 };
    r1[1][8] = { type: 'torch', x: 8, y: 1, roomX: 1, roomY: 0 };
    for (let c = 0; c < 10; c++) r1[2][c] = { type: 'floor', x: c, y: 2, roomX: 1, roomY: 0 };
    // The Magic Mirror at col 5, floor 2
    r1[2][5] = { type: 'magic_mirror', x: 5, y: 2, roomX: 1, roomY: 0, state: 0 };
    r1[2][1] = { type: 'torch', x: 1, y: 2, roomX: 1, roomY: 0 };
    r1[2][9] = { type: 'torch', x: 9, y: 2, roomX: 1, roomY: 0 };
    this.rooms.set('1,0', r1);

    // Room 2,0: The Shadow Prince Encounter & Final Escape
    const r2 = this.createEmptyRoom(2, 0);
    for (let c = 0; c < 10; c++) r2[0][c] = { type: 'floor', x: c, y: 0, roomX: 2, roomY: 0 };
    for (let c = 0; c < 10; c++) r2[1][c] = { type: 'floor', x: c, y: 1, roomX: 2, roomY: 0 };
    r2[1][4] = { type: 'chomper', x: 4, y: 1, roomX: 2, roomY: 0, state: 0 };
    for (let c = 0; c < 10; c++) r2[2][c] = { type: 'floor', x: c, y: 2, roomX: 2, roomY: 0 };
    r2[2][6] = { type: 'gate', x: 6, y: 2, roomX: 2, roomY: 0, gateId: 'gate_mirror_exit' };
    r2[2][9] = { type: 'exit_door', x: 9, y: 2, roomX: 2, roomY: 0 };
    r2[2][2] = { type: 'torch', x: 2, y: 2, roomX: 2, roomY: 0 };
    this.rooms.set('2,0', r2);
  }

  private createEmptyRoom(rx: number, ry: number): DungeonTile[][] {
    const grid: DungeonTile[][] = [];
    for (let row = 0; row < 3; row++) {
      grid[row] = [];
      for (let col = 0; col < 10; col++) {
        grid[row][col] = { type: 'empty', x: col, y: row, roomX: rx, roomY: ry };
      }
    }
    return grid;
  }

  public getTile(rx: number, ry: number, col: number, row: number): DungeonTile | null {
    const key = `${rx},${ry}`;
    const r = this.rooms.get(key);
    if (!r || row < 0 || row >= 3 || col < 0 || col >= 10) return null;
    return r[row][col];
  }

  /**
   * Main game update loop tick (60 FPS)
   */
  public update(keys: Record<string, boolean>) {
    if (this.isGameOver) return;

    // Time countdown
    if (!this.settings.infiniteTime) {
      this.timeAccumulator++;
      if (this.timeAccumulator >= 60) {
        this.timeAccumulator = 0;
        if (this.secondsRemaining > 0) {
          this.secondsRemaining--;
        } else if (this.minutesRemaining > 0) {
          this.minutesRemaining--;
          this.secondsRemaining = 59;
        } else {
          this.killPlayer('TIME HAS RUN OUT!');
          return;
        }
      }
    }

    if (this.bannerTimer > 0) {
      this.bannerTimer--;
    }

    // Update Gates (slowly close if timer runs out)
    this.gates.forEach((gate) => {
      if (gate.isOpen) {
        if (gate.height < 50) {
          gate.height += 2;
        }
        if (gate.timer > 0) {
          gate.timer--;
          if (gate.timer === 0) {
            gate.isOpen = false;
            princeAudio.playGateSlam();
          }
        }
      } else {
        if (gate.height > 0) {
          gate.height -= 3;
        }
      }
    });

    // Handle Player Input & Physics
    this.updatePlayer(keys);

    // Handle Guards
    this.updateGuards();
  }

  private updatePlayer(keys: Record<string, boolean>) {
    if (this.action === 'dead') {
      this.deathTimer++;
      if (this.deathTimer >= 30) {
        this.canRespawn = true;
        const respawnKey = keys['Space'] || keys['Enter'] || keys['KeyR'] || keys['ArrowUp'] || keys['KeyW'] || keys['KeyZ'] || keys['KeyX'];
        if (respawnKey) {
          this.respawn();
        }
      }
      return;
    }
    if (this.action === 'victory') return;

    const left = keys['ArrowLeft'] || keys['KeyA'];
    const right = keys['ArrowRight'] || keys['KeyD'];
    const up = keys['ArrowUp'] || keys['KeyW'];
    const down = keys['ArrowDown'] || keys['KeyS'];
    const shift = keys['ShiftLeft'] || keys['ShiftRight'] || keys['KeyZ']; // Tiptoe / Grab
    const space = keys['Space'] || keys['KeyX'] || keys['Enter']; // Action / Attack / Draw sword

    this.animTimer++;

    // Hanging on ledge check
    if (this.isHanging) {
      this.pvx = 0;
      this.pvy = 0;
      if (up) {
        // Climb up
        this.action = 'climbing';
        this.frame++;
        if (this.frame > 12) {
          this.isHanging = false;
          this.py = this.hangLedgeY - 30;
          this.px = this.hangLedgeX + (this.facing === 'right' ? 12 : -12);
          this.action = 'idle';
          this.frame = 0;
        }
      } else if (down) {
        // Let go and drop
        this.isHanging = false;
        this.action = 'falling';
        this.pvy = 1;
      }
      return;
    }

    // Check if guard is close in front of player -> draw sword or enter combat
    const nearbyGuard = this.guards.find(g => 
      g.roomX === this.currentRoomX && 
      g.roomY === this.currentRoomY && 
      Math.abs(g.x - this.px) < 70 && 
      Math.abs(g.y - this.py) < 20 &&
      g.health > 0
    );

    if (this.hasSword && (nearbyGuard || space) && this.action === 'idle') {
      if (space || nearbyGuard) {
        this.action = 'sword_draw';
        this.frame = 0;
        princeAudio.playSwordDraw();
      }
    }

    // Sword combat state
    if (this.action === 'sword_draw') {
      if (this.animTimer % 4 === 0) this.frame++;
      if (this.frame >= 6) {
        this.action = 'sword_idle';
        this.frame = 0;
      }
      return;
    }

    if (this.action === 'sword_idle') {
      if (left) {
        this.facing = 'left';
        this.px -= 1.2;
      } else if (right) {
        this.facing = 'right';
        this.px += 1.2;
      }

      if (space && nearbyGuard) {
        // Strike attack!
        this.action = 'sword_strike';
        this.frame = 0;
      } else if (up) {
        // Parry stance
        this.action = 'sword_parry';
        this.frame = 0;
        princeAudio.playSwordClash();
      } else if (down) {
        // Sheathe sword
        this.action = 'idle';
      }
      return;
    }

    if (this.action === 'sword_strike') {
      if (this.animTimer % 3 === 0) this.frame++;
      if (this.frame === 3 && nearbyGuard) {
        if (nearbyGuard.action === 'parry') {
          princeAudio.playSwordClash();
        } else if (nearbyGuard.type === 'skeleton') {
          // The immortal skeleton cannot be slain by normal sword strikes!
          princeAudio.playBonesRattle();
          nearbyGuard.action = 'hurt';
          const knockDir = this.facing === 'right' ? 1 : -1;
          nearbyGuard.x += knockDir * 18;
          this.setBanner('THE SKELETON CANNOT DIE! KNOCK HIM INTO THE PIT!');
          setTimeout(() => {
            if (nearbyGuard.action === 'hurt') nearbyGuard.action = 'combat';
          }, 350);
        } else if (nearbyGuard.type === 'shadow') {
          // Striking your own shadow harms yourself!
          nearbyGuard.action = 'hurt';
          nearbyGuard.health--;
          this.damagePlayer(1);
          princeAudio.playSwordHit();
          this.setBanner('HE IS YOUR SHADOW REFLECTION! YOU HURT YOURSELF!');
          if (nearbyGuard.health <= 0) {
            nearbyGuard.action = 'dead';
          }
        } else {
          nearbyGuard.health--;
          nearbyGuard.action = 'hurt';
          princeAudio.playSwordHit();
          if (nearbyGuard.health <= 0) {
            nearbyGuard.action = 'dead';
            this.guardsDefeated++;
            this.setBanner('GUARD DEFEATED!');
          }
        }
      }
      if (this.frame >= 6) {
        this.action = 'sword_idle';
        this.frame = 0;
      }
      return;
    }

    if (this.action === 'sword_parry') {
      if (this.animTimer % 4 === 0) this.frame++;
      if (this.frame >= 4) {
        this.action = 'sword_idle';
        this.frame = 0;
      }
      return;
    }

    // Normal movement & platforming
    const onFloor = this.checkFloorCollision();

    if (onFloor) {
      this.pvy = 0;

      if (this.action === 'falling') {
        princeAudio.playStep();
        this.action = 'idle';
        this.frame = 0;
      }

      // Jump
      if (up) {
        if (this.action === 'running') {
          this.action = 'run_jump';
          this.pvy = -5.5;
          this.pvx = this.facing === 'right' ? 3.5 : -3.5;
          princeAudio.playJump();
        } else {
          this.action = 'jumping';
          this.pvy = -6.0;
          this.pvx = (left ? -2 : right ? 2 : 0);
          princeAudio.playJump();
        }
        this.frame = 0;
      } else if (down) {
        this.action = 'crouching';
        this.pvx = 0;
      } else if (left) {
        this.facing = 'left';
        if (shift) {
          this.action = 'tiptoe';
          this.pvx = -1.2;
          if (this.animTimer % 15 === 0) princeAudio.playTiptoe();
        } else {
          this.action = 'running';
          this.pvx = -3.2;
          if (this.animTimer % 10 === 0) princeAudio.playStep();
        }
      } else if (right) {
        this.facing = 'right';
        if (shift) {
          this.action = 'tiptoe';
          this.pvx = 1.2;
          if (this.animTimer % 15 === 0) princeAudio.playTiptoe();
        } else {
          this.action = 'running';
          this.pvx = 3.2;
          if (this.animTimer % 10 === 0) princeAudio.playStep();
        }
      } else {
        this.action = 'idle';
        this.pvx = 0;
      }
    } else {
      // In air / falling
      this.pvy += 0.38; // gravity
      if (this.pvy > 7) this.pvy = 7;

      if (this.action !== 'run_jump' && this.action !== 'jumping') {
        this.action = 'falling';
      }

      // Ledge grabbing detection (up or shift to grab!)
      if ((up || shift) && this.pvy > 0) {
        const grabLedge = this.checkLedgeGrab();
        if (grabLedge) {
          this.isHanging = true;
          this.hangLedgeX = grabLedge.x;
          this.hangLedgeY = grabLedge.y;
          this.px = grabLedge.x + (this.facing === 'right' ? -10 : 10);
          this.py = grabLedge.y + 20;
          this.action = 'hanging';
          this.frame = 0;
          princeAudio.playLedgeGrab();
          return;
        }
      }
    }

    // Apply movement velocity
    this.px += this.pvx;
    this.py += this.pvy;

    // Room boundaries & screen transition
    if (this.px < 5) {
      if (this.rooms.has(`${this.currentRoomX - 1},${this.currentRoomY}`)) {
        this.currentRoomX--;
        this.px = this.screenWidth - 15;
      } else {
        this.px = 5;
      }
    } else if (this.px > this.screenWidth - 10) {
      if (this.rooms.has(`${this.currentRoomX + 1},${this.currentRoomY}`)) {
        this.currentRoomX++;
        this.px = 10;
      } else {
        this.px = this.screenWidth - 10;
      }
    }

    // Check interaction with dungeon items, tiles & traps
    this.checkTileInteractions();
  }

  private checkFloorCollision(): boolean {
    // Check points at left and right feet for realistic ledge mechanics
    const footLeft = this.px - 4;
    const footRight = this.px + 4;
    const targetY = this.py;

    // Bottom floor boundary of screen
    if (this.py >= 150) {
      this.py = 150;
      return true;
    }

    const checkPoint = (x: number): boolean => {
      const col = Math.floor(x / this.tileWidth);
      const row = Math.floor((targetY + 4) / this.tileHeight);
      const tile = this.getTile(this.currentRoomX, this.currentRoomY, col, row);
      if (!tile) return false;

      if (tile.type === 'floor' || tile.type === 'wall' || tile.type === 'plate_open' || tile.type === 'plate_close' || tile.type === 'spikes' || tile.type === 'chomper') {
        const floorY = row * this.tileHeight;
        if (targetY >= floorY - 6 && targetY <= floorY + 8) {
          this.py = floorY;
          return true;
        }
      }

      if (tile.type === 'loose_floor') {
        const floorY = row * this.tileHeight;
        if (targetY >= floorY - 6 && targetY <= floorY + 8) {
          this.py = floorY;
          if (tile.state === 0) {
            tile.state = 1;
            princeAudio.playLooseTile();
            setTimeout(() => {
              if (tile.state === 1) tile.state = 2;
            }, 350);
          }
          return tile.state !== 2;
        }
      }
      return false;
    };

    return checkPoint(footLeft) || checkPoint(footRight) || checkPoint(this.px);
  }

  private checkLedgeGrab(): { x: number; y: number } | null {
    const checkCol = Math.floor((this.px + (this.facing === 'right' ? 8 : -8)) / this.tileWidth);
    const rowAbove = Math.floor((this.py - 12) / this.tileHeight);

    const tile = this.getTile(this.currentRoomX, this.currentRoomY, checkCol, rowAbove);
    if (tile && (tile.type === 'floor' || tile.type === 'wall' || tile.type === 'loose_floor')) {
      const ledgeX = checkCol * this.tileWidth + (this.facing === 'right' ? 0 : this.tileWidth);
      const ledgeY = rowAbove * this.tileHeight;
      return { x: ledgeX, y: ledgeY };
    }
    return null;
  }

  private checkTileInteractions() {
    const col = Math.floor(this.px / this.tileWidth);
    const row = Math.floor((this.py - 2) / this.tileHeight);
    const tile = this.getTile(this.currentRoomX, this.currentRoomY, col, row);
    if (!tile) return;

    // Pressure plate to OPEN gate
    if (tile.type === 'plate_open' && tile.targetGateId) {
      const g = this.gates.get(tile.targetGateId);
      if (g) {
        if (!g.isOpen || g.height < 48) {
          g.isOpen = true;
          g.timer = 720; // open for 12 full seconds
          princeAudio.playPressurePlate();
          princeAudio.playGateOpen();
          this.setBanner('HEK GAAT OPEN! REN ERDOOR!');
        }
      }
    }

    // Gate collision (if closed or partially closed)
    if (tile.type === 'gate' && tile.gateId) {
      const g = this.gates.get(tile.gateId);
      const gateOpenAmount = g ? g.height : 0;
      // If gate is not high enough to walk under (needs at least 32px clearance):
      if (gateOpenAmount < 36) {
        // Stop player from walking through
        if (this.facing === 'right') {
          this.px = Math.min(this.px, col * this.tileWidth - 2);
        } else {
          this.px = Math.max(this.px, (col + 1) * this.tileWidth + 2);
        }
        this.pvx = 0;
      }
    }

    // Spikes (spring if running, safe if tiptoe)
    if (tile.type === 'spikes') {
      if (this.action === 'running' || this.action === 'falling') {
        tile.state = 2; // extended
        princeAudio.playSpikes();
        this.killPlayer('SKEWERED ON SPIKES!');
        return;
      } else {
        tile.state = 1; // harmless peek
      }
    }

    // Chomper trap
    if (tile.type === 'chomper') {
      if (Math.floor(this.animTimer / 30) % 2 === 0) {
        tile.state = 1; // snapped
        princeAudio.playChomper();
        if (Math.abs(this.px - (col * this.tileWidth + 16)) < 12) {
          this.killPlayer('SLICED BY STEEL CHOMPER!');
          return;
        }
      } else {
        tile.state = 0;
      }
    }

    // Sword item pickup
    if (tile.type === 'sword_item') {
      tile.type = 'empty';
      this.hasSword = true;
      princeAudio.playVictory();
      this.setBanner('YOU FOUND A SWORD!');
    }

    // Small potion pickup
    if (tile.type === 'potion_small') {
      tile.type = 'empty';
      this.health = Math.min(this.maxHealth, this.health + 1);
      this.potionsFound++;
      princeAudio.playPotion();
      this.setBanner('LIFE POTION: RESTORED 1 HP');
    }

    // Big potion pickup
    if (tile.type === 'potion_big') {
      tile.type = 'empty';
      this.maxHealth++;
      this.health = this.maxHealth;
      this.potionsFound++;
      princeAudio.playPotion();
      this.setBanner('ELIXIR OF LIFE: MAX HP INCREASED!');
    }

    // Magic Mirror interaction (Level 4 Room 1,0)
    if (tile.type === 'magic_mirror' && (tile.state === 0 || tile.state === undefined)) {
      if (Math.abs(this.px - (col * this.tileWidth + 16)) < 18) {
        tile.state = 1; // Shatter mirror!
        princeAudio.playMirrorShatter();
        this.setBanner('THE MIRROR SHATTERS! YOUR SHADOW LEAPS OUT!');
        // Spawn the Shadow Prince in Room 2,0 guarding the exit
        this.guards.push({
          id: 'shadow_prince',
          x: 100,
          y: 120,
          roomX: 2,
          roomY: 0,
          vx: 0,
          facing: 'left',
          action: 'combat',
          health: 4,
          maxHealth: 4,
          frame: 0,
          attackCooldown: 30,
          type: 'shadow'
        });
      }
    }

    // Exit Door
    if (tile.type === 'exit_door') {
      if (!this.isLevelWon) {
        this.isLevelWon = true;
        this.action = 'victory';
        princeAudio.playVictory();
        const nextLevel = this.currentLevel + 1;
        if (nextLevel <= 4) {
          this.setBanner(`LEVEL ${this.currentLevel} COMPLETED! PROCEEDING TO LEVEL ${nextLevel}...`);
          setTimeout(() => {
            this.initLevel(nextLevel);
          }, 2500);
        } else {
          this.setBanner('VICTORY! JAFFAR DEFEATED & THE PRINCESS FREED!');
        }
      }
    }
  }

  private updateGuards() {
    this.guards.forEach((guard) => {
      if (guard.health <= 0) return;

      // Skeleton abyss check
      if (guard.type === 'skeleton' && guard.roomX === this.currentRoomX && guard.roomY === this.currentRoomY) {
        const gCol = Math.floor(guard.x / this.tileWidth);
        const gRow = Math.floor((guard.y + 10) / this.tileHeight);
        const tileBelow = this.getTile(guard.roomX, guard.roomY, gCol, gRow);
        if (!tileBelow || tileBelow.type === 'empty') {
          // Skeleton falls into abyss!
          guard.y += 5;
          if (guard.y > 210) {
            guard.health = 0;
            guard.action = 'dead';
            this.guardsDefeated++;
            princeAudio.playBonesRattle();
            this.setBanner('THE SKELETON HAS FALLEN INTO THE CHASM!');
          }
          return;
        }
      }

      // Shadow Prince union / merging check
      if (guard.type === 'shadow' && guard.roomX === this.currentRoomX && guard.roomY === this.currentRoomY) {
        const dist = Math.abs(this.px - guard.x);
        // If player has sheathed sword (idle/crouch/tiptoe) and approaches:
        if (dist < 22 && this.action !== 'sword_strike' && this.action !== 'sword_idle' && this.action !== 'sword_draw') {
          guard.health = 0;
          guard.action = 'dead';
          this.maxHealth++;
          this.health = this.maxHealth;
          princeAudio.playVictory();
          this.setBanner('YOU AND YOUR SHADOW HAVE MERGED INTO ONE! THE WAY IS OPEN!');
          const exitGate = this.gates.get('gate_mirror_exit');
          if (exitGate) {
            exitGate.isOpen = true;
            exitGate.timer = 9999;
            princeAudio.playGateOpen();
          }
          return;
        }
      }

      if (guard.roomX === this.currentRoomX && guard.roomY === this.currentRoomY) {
        const dx = this.px - guard.x;
        guard.facing = dx > 0 ? 'right' : 'left';

        if (Math.abs(dx) < 140) {
          // Alert / combat
          guard.action = 'combat';
          if (Math.abs(dx) > 35) {
            guard.x += (dx > 0 ? 0.9 : -0.9);
          } else {
            // In attack range
            guard.attackCooldown--;
            if (guard.attackCooldown <= 0) {
              guard.action = 'strike';
              guard.attackCooldown = 55;
              setTimeout(() => {
                if (guard.action === 'strike' && Math.abs(this.px - guard.x) < 45) {
                  if (this.action === 'sword_parry') {
                    princeAudio.playSwordClash();
                    this.setBanner('PARRIED!');
                  } else {
                    this.damagePlayer(1);
                    princeAudio.playSwordHit();
                  }
                }
                guard.action = 'combat';
              }, 200);
            }
          }
        }
      }
    });
  }

  public damagePlayer(amt: number) {
    if (this.settings.invincible) return;
    this.health -= amt;
    this.action = 'hurt';
    setTimeout(() => {
      if (this.health <= 0) {
        this.killPlayer('SLAIN IN COMBAT!');
      } else {
        this.action = 'sword_idle';
      }
    }, 250);
  }

  public killPlayer(reason: string) {
    if (this.settings.invincible) return;
    this.health = 0;
    this.action = 'dead';
    this.isGameOver = true;
    this.isDead = true;
    this.deathReason = reason;
    this.deathTimer = 0;
    this.canRespawn = false;
    princeAudio.playDeath();
    this.setBanner(reason);
  }

  public respawn() {
    this.health = this.maxHealth;
    this.action = 'idle';
    this.isGameOver = false;
    this.isDead = false;
    this.deathTimer = 0;
    this.canRespawn = false;
    this.pvx = 0;
    this.pvy = 0;
    this.isHanging = false;

    // Reset Prince position to entrance of current room
    if (this.currentLevel === 1) {
      if (this.currentRoomX === 0) {
        this.px = 50;
        this.py = 120;
      } else if (this.currentRoomX === 1) {
        this.px = 20;
        this.py = 60;
      } else {
        this.px = 20;
        this.py = 120;
      }
    } else {
      this.px = 40;
      this.py = 60;
    }
    this.facing = 'right';

    // Reset guards in current room if they were in combat
    this.guards.forEach(g => {
      if (g.roomX === this.currentRoomX && g.roomY === this.currentRoomY) {
        if (g.action === 'strike' || g.action === 'parry' || g.action === 'hurt') {
          g.action = 'patrol';
        }
      }
    });

    this.setBanner('DE PRINS HERRIJST! SPOED JE VOORT!');
    princeAudio.playPotionDrink();
  }

  public setBanner(msg: string) {
    this.bannerText = msg;
    this.bannerTimer = 160;
  }
}
