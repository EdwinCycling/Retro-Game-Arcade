/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  ExileGameState,
  PlayerMike,
  PhysicsItem,
  EnemyEntity,
  Projectile,
  Particle,
  WaterBody,
  WindVent,
  SecurityGate,
  GeneratorSocket,
  WeaponType
} from './exileTypes';
import { exileAudio } from './exileAudio';

export const TILE_SIZE = 24;
export const MAP_COLS = 160;
export const MAP_ROWS = 100;
export const WORLD_WIDTH = MAP_COLS * TILE_SIZE; // 3840 px
export const WORLD_HEIGHT = MAP_ROWS * TILE_SIZE; // 2400 px

export class ExileEngine {
  public state: ExileGameState;
  public mapGrid: Uint8Array; // 0=air, 1=surface rock, 2=cave wall, 3=base steel, 4=magma, 5=cracked rock, 6=spikes, 7=recharge pad
  private keys: Record<string, boolean> = {};
  private onGameOverCb?: (score: number, victory: boolean) => void;
  private animTick = 0;

  constructor() {
    this.mapGrid = new Uint8Array(MAP_COLS * MAP_ROWS);
    this.buildWorldMap();
    this.state = this.createInitialState();
  }

  public setCallbacks(onGameOver: (score: number, victory: boolean) => void) {
    this.onGameOverCb = onGameOver;
  }

  private buildWorldMap() {
    const grid = this.mapGrid;
    grid.fill(0);

    // Boundary walls (unbreakable cavern borders)
    for (let x = 0; x < MAP_COLS; x++) {
      grid[0 * MAP_COLS + x] = 1;
      grid[(MAP_ROWS - 1) * MAP_COLS + x] = 1;
    }
    for (let y = 0; y < MAP_ROWS; y++) {
      grid[y * MAP_COLS + 0] = 1;
      grid[y * MAP_COLS + (MAP_COLS - 1)] = 1;
    }

    // 1. Surface Area (y: 1 to 24)
    // Mountain ridges and crater surface
    for (let x = 0; x < MAP_COLS; x++) {
      const groundY = Math.floor(18 + Math.sin(x * 0.12) * 4 + Math.cos(x * 0.05) * 3);
      for (let y = groundY; y < 28; y++) {
        grid[y * MAP_COLS + x] = 1;
      }
    }

    // Crashed Perseus Ship site at surface (x: 10 to 30, y: 12 to 20)
    // Clear landing pad
    for (let x = 12; x < 28; x++) {
      for (let y = 14; y < 22; y++) {
        grid[y * MAP_COLS + x] = 0;
      }
      grid[22 * MAP_COLS + x] = 7; // Recharge and repair platform
    }

    // Vertical shaft down into the Phoebus caverns (x: 24 to 28, y: 22 to 45)
    for (let y = 22; y < 45; y++) {
      for (let x = 24; x < 28; x++) {
        grid[y * MAP_COLS + x] = 0;
      }
    }

    // 2. Upper Alien Caverns (y: 28 to 60)
    // Cellular automaton / procedural cave carving
    for (let y = 28; y < 65; y++) {
      for (let x = 1; x < MAP_COLS - 1; x++) {
        // Default cave rock
        grid[y * MAP_COLS + x] = 2;
      }
    }

    // Carve main interconnected cavern chambers and tunnels
    const carveRect = (cx: number, cy: number, w: number, h: number, tile = 0) => {
      for (let y = cy; y < cy + h; y++) {
        for (let x = cx; x < cx + w; x++) {
          if (x > 0 && x < MAP_COLS - 1 && y > 0 && y < MAP_ROWS - 1) {
            grid[y * MAP_COLS + x] = tile;
          }
        }
      }
    };

    // Magpie Roost Chamber (Upper West)
    carveRect(5, 30, 35, 15);
    // Rocky platforms in roost
    for (let px = 10; px < 25; px += 2) {
      grid[38 * MAP_COLS + px] = 2;
    }
    for (let px = 20; px < 35; px += 3) {
      grid[34 * MAP_COLS + px] = 2;
    }

    // Tunnel connecting Roost to Central Chasm
    carveRect(35, 34, 25, 7);

    // Central Grand Hall (x: 55 to 95, y: 30 to 52)
    carveRect(55, 30, 40, 22);
    // Stalagmites on floor of Grand Hall
    for (let sx = 60; sx < 90; sx += 4) {
      grid[51 * MAP_COLS + sx] = 6; // Spikes
    }
    // Recharge station in Grand Hall
    for (let rx = 72; rx <= 76; rx++) {
      grid[51 * MAP_COLS + rx] = 7;
    }

    // 3. Subterranean Hydro-Chamber (Water Lake) (x: 95 to 145, y: 25 to 55)
    carveRect(95, 26, 50, 28);
    // Submerged islands and rock shelves
    carveRect(110, 42, 18, 4, 2);
    carveRect(132, 38, 10, 3, 2);

    // Tunnel down to Triax Outpost
    carveRect(140, 45, 8, 25);

    // 4. Lower Caves & Magma Chasms (y: 60 to 98)
    for (let y = 60; y < MAP_ROWS - 1; y++) {
      for (let x = 1; x < MAP_COLS - 1; x++) {
        grid[y * MAP_COLS + x] = 2;
      }
    }

    // Deep Magma Cavern (South-West: x: 10 to 65, y: 65 to 95)
    carveRect(10, 68, 55, 24);
    // Magma pool at bottom
    for (let mx = 15; mx < 60; mx++) {
      grid[91 * MAP_COLS + mx] = 4; // Magma
      grid[90 * MAP_COLS + mx] = 4;
    }

    // Destructible cracked rock walls hiding secrets
    for (let cy = 72; cy < 82; cy++) {
      grid[cy * MAP_COLS + 32] = 5; // Cracked rock wall
      grid[cy * MAP_COLS + 33] = 5;
    }

    // Wind Shaft from Magma chamber to upper caves
    carveRect(45, 45, 6, 25);

    // 5. Triax High-Tech Security Complex (East: x: 75 to 155, y: 62 to 95)
    // Steel lined base
    carveRect(75, 65, 80, 30, 3); // Base background
    // Interior corridors
    carveRect(78, 68, 74, 8, 0); // Upper corridor
    carveRect(78, 78, 74, 8, 0); // Middle corridor
    carveRect(78, 88, 74, 6, 0); // Lower corridor
    // Connecting vertical shafts
    carveRect(85, 68, 6, 26, 0);
    carveRect(115, 68, 6, 26, 0);
    carveRect(142, 68, 8, 26, 0);

    // Triax Inner Sanctum (x: 125 to 152, y: 78 to 94)
    carveRect(125, 78, 28, 16, 0);
    // Reinforced platform for Triax
    for (let bx = 135; bx < 148; bx++) {
      grid[86 * MAP_COLS + bx] = 3;
    }
  }

  private createInitialState(): ExileGameState {
    const startX = 20 * TILE_SIZE;
    const startY = 18 * TILE_SIZE;

    const items: PhysicsItem[] = [
      // 1. Initial Teleport Locator Beacon (starts near crashed Perseus)
      {
        id: 'item_beacon_1',
        type: 'teleport_beacon',
        name: 'Teleport Baken',
        x: 16 * TILE_SIZE,
        y: 20 * TILE_SIZE,
        vx: 0,
        vy: 0,
        radius: 6,
        mass: 1.2,
        grounded: true,
        inWater: false,
        isCarried: false,
      },
      // 2. Portable Boulder near crash site (can be picked up and rolled)
      {
        id: 'boulder_1',
        type: 'boulder',
        name: 'Zware Rotskei',
        x: 22 * TILE_SIZE,
        y: 20 * TILE_SIZE,
        vx: 0,
        vy: 0,
        radius: 8,
        mass: 4.5,
        grounded: true,
        inWater: false,
        isCarried: false,
      },
      // 3. Fuel Canister at crash site
      {
        id: 'fuel_1',
        type: 'fuel_canister',
        name: 'Brandstofvat (+50 Fuel)',
        x: 25 * TILE_SIZE,
        y: 20 * TILE_SIZE,
        vx: 0,
        vy: 0,
        radius: 7,
        mass: 2.0,
        grounded: true,
        inWater: false,
        isCarried: false,
      },
      // 4. Energy Cell in Upper Magpie Roost
      {
        id: 'energy_cell_1',
        type: 'energy_cell',
        name: 'Plutonium Energiecel',
        x: 12 * TILE_SIZE,
        y: 32 * TILE_SIZE,
        vx: 0,
        vy: 0,
        radius: 6,
        mass: 2.5,
        grounded: true,
        inWater: false,
        isCarried: false,
      },
      // 5. Red Keycard (deep in the Subterranean Water Aquifer)
      {
        id: 'key_red',
        type: 'keycard_red',
        name: 'Rode Beveiligingspas',
        x: 120 * TILE_SIZE,
        y: 50 * TILE_SIZE,
        vx: 0,
        vy: 0,
        radius: 6,
        mass: 0.8,
        grounded: true,
        inWater: true,
        isCarried: false,
      },
      // 6. Oxygen Tank underwater
      {
        id: 'o2_tank_1',
        type: 'oxygen_tank',
        name: 'Zuurstoffles (+100% O2)',
        x: 105 * TILE_SIZE,
        y: 48 * TILE_SIZE,
        vx: 0,
        vy: 0,
        radius: 6,
        mass: 1.5,
        grounded: true,
        inWater: true,
        isCarried: false,
      },
      // 7. Blue Keycard (guarded by Magpie birds in roost)
      {
        id: 'key_blue',
        type: 'keycard_blue',
        name: 'Blauwe Beveiligingspas',
        x: 8 * TILE_SIZE,
        y: 42 * TILE_SIZE,
        vx: 0,
        vy: 0,
        radius: 6,
        mass: 0.8,
        grounded: true,
        inWater: false,
        isCarried: false,
      },
      // 8. Yellow Keycard (perched above the Magma Cavern)
      {
        id: 'key_yellow',
        type: 'keycard_yellow',
        name: 'Gele Master Pas',
        x: 58 * TILE_SIZE,
        y: 72 * TILE_SIZE,
        vx: 0,
        vy: 0,
        radius: 6,
        mass: 0.8,
        grounded: true,
        inWater: false,
        isCarried: false,
      },
      // 9. Extra boulders for physics puzzles
      {
        id: 'boulder_2',
        type: 'boulder',
        name: 'Massief Rotsblok',
        x: 42 * TILE_SIZE,
        y: 35 * TILE_SIZE,
        vx: 0,
        vy: 0,
        radius: 9,
        mass: 5.0,
        grounded: true,
        inWater: false,
        isCarried: false,
      },
      {
        id: 'boulder_3',
        type: 'boulder',
        name: 'Granite Slagkei',
        x: 48 * TILE_SIZE,
        y: 46 * TILE_SIZE,
        vx: 0,
        vy: 0,
        radius: 8,
        mass: 4.8,
        grounded: true,
        inWater: false,
        isCarried: false,
      },
      // 10. Triax Data Cube (Inner Sanctum)
      {
        id: 'data_cube',
        type: 'triax_data_cube',
        name: 'Triax Geheugen Core',
        x: 145 * TILE_SIZE,
        y: 84 * TILE_SIZE,
        vx: 0,
        vy: 0,
        radius: 7,
        mass: 2.0,
        grounded: true,
        inWater: false,
        isCarried: false,
      }
    ];

    const enemies: EnemyEntity[] = [
      // Magpie birds in upper caverns (they dive, snatch items and peck!)
      {
        id: 'bird_1',
        type: 'magpie_bird',
        x: 28 * TILE_SIZE,
        y: 32 * TILE_SIZE,
        vx: 1.2,
        vy: 0,
        radius: 9,
        mass: 1.5,
        grounded: false,
        inWater: false,
        hp: 30,
        maxHp: 30,
        active: true,
        facing: 'right',
        shootCooldown: 0,
        stateTimer: 0,
        behaviorState: 'patrol',
      },
      {
        id: 'bird_2',
        type: 'magpie_bird',
        x: 15 * TILE_SIZE,
        y: 36 * TILE_SIZE,
        vx: -1.0,
        vy: 0,
        radius: 9,
        mass: 1.5,
        grounded: false,
        inWater: false,
        hp: 30,
        maxHp: 30,
        active: true,
        facing: 'left',
        shootCooldown: 0,
        stateTimer: 40,
        behaviorState: 'patrol',
      },
      // Magma worms in lower chasms
      {
        id: 'worm_1',
        type: 'magma_worm',
        x: 35 * TILE_SIZE,
        y: 88 * TILE_SIZE,
        vx: 0,
        vy: -1.5,
        radius: 11,
        mass: 3.0,
        grounded: false,
        inWater: false,
        hp: 50,
        maxHp: 50,
        active: true,
        facing: 'left',
        shootCooldown: 60,
        stateTimer: 0,
      },
      // Automated Turrets in Triax base
      {
        id: 'turret_1',
        type: 'turret',
        x: 92 * TILE_SIZE,
        y: 68 * TILE_SIZE + 4,
        vx: 0,
        vy: 0,
        radius: 10,
        mass: 10,
        grounded: true,
        inWater: false,
        hp: 40,
        maxHp: 40,
        active: true,
        facing: 'left',
        shootCooldown: 80,
        stateTimer: 0,
      },
      {
        id: 'turret_2',
        type: 'turret',
        x: 118 * TILE_SIZE,
        y: 78 * TILE_SIZE + 4,
        vx: 0,
        vy: 0,
        radius: 10,
        mass: 10,
        grounded: true,
        inWater: false,
        hp: 40,
        maxHp: 40,
        active: true,
        facing: 'right',
        shootCooldown: 100,
        stateTimer: 0,
      },
      // Hunter Drones
      {
        id: 'drone_1',
        type: 'triax_drone',
        x: 88 * TILE_SIZE,
        y: 82 * TILE_SIZE,
        vx: 1.5,
        vy: 0,
        radius: 8,
        mass: 2.0,
        grounded: false,
        inWater: false,
        hp: 35,
        maxHp: 35,
        active: true,
        facing: 'right',
        shootCooldown: 90,
        stateTimer: 0,
      },
      {
        id: 'drone_2',
        type: 'triax_drone',
        x: 108 * TILE_SIZE,
        y: 84 * TILE_SIZE,
        vx: -1.5,
        vy: 0,
        radius: 8,
        mass: 2.0,
        grounded: false,
        inWater: false,
        hp: 35,
        maxHp: 35,
        active: true,
        facing: 'left',
        shootCooldown: 110,
        stateTimer: 0,
      },
      // THE BOSS: TRIAX
      {
        id: 'boss_triax',
        type: 'boss_triax',
        x: 140 * TILE_SIZE,
        y: 82 * TILE_SIZE,
        vx: 0,
        vy: 0,
        radius: 16,
        mass: 20,
        grounded: false,
        inWater: false,
        hp: 300,
        maxHp: 300,
        active: true,
        facing: 'left',
        shootCooldown: 70,
        stateTimer: 0,
      }
    ];

    // Water bodies (Phoebus Subterranean Aquifer)
    const waterBodies: WaterBody[] = [
      {
        x: 95 * TILE_SIZE,
        y: 38 * TILE_SIZE,
        width: 48 * TILE_SIZE,
        height: 16 * TILE_SIZE,
        waveOffset: 0,
      }
    ];

    // Wind Vents (blowing upward in vertical shafts)
    const windVents: WindVent[] = [
      {
        x: 45 * TILE_SIZE,
        y: 46 * TILE_SIZE,
        width: 6 * TILE_SIZE,
        height: 22 * TILE_SIZE,
        windVx: 0,
        windVy: -0.45,
        active: true,
      }
    ];

    // Fortified Blast Gates requiring specific security keycards
    const gates: SecurityGate[] = [
      // Red Gate guarding Triax Base Entrance
      {
        id: 'gate_red',
        x: 77 * TILE_SIZE,
        y: 68 * TILE_SIZE,
        width: 2 * TILE_SIZE,
        height: 8 * TILE_SIZE,
        requiredKey: 'red',
        isOpen: false,
        openProgress: 0,
      },
      // Blue Gate guarding Middle Level & Drones
      {
        id: 'gate_blue',
        x: 98 * TILE_SIZE,
        y: 78 * TILE_SIZE,
        width: 2 * TILE_SIZE,
        height: 8 * TILE_SIZE,
        requiredKey: 'blue',
        isOpen: false,
        openProgress: 0,
      },
      // Yellow Gate guarding Triax Boss Lair
      {
        id: 'gate_yellow',
        x: 124 * TILE_SIZE,
        y: 78 * TILE_SIZE,
        width: 2 * TILE_SIZE,
        height: 8 * TILE_SIZE,
        requiredKey: 'yellow',
        isOpen: false,
        openProgress: 0,
      },
    ];

    // Power Generator Socket (drop an Energy Cell nearby to power down base defense)
    const generators: GeneratorSocket[] = [
      {
        id: 'gen_1',
        x: 82 * TILE_SIZE,
        y: 74 * TILE_SIZE,
        powered: false,
        connectedGateId: 'gate_red',
      }
    ];

    const mike: PlayerMike = {
      x: startX,
      y: startY,
      vx: 0,
      vy: 0,
      radius: 7,
      mass: 2.0,
      grounded: true,
      inWater: false,
      facing: 'right',
      aimAngle: 0,
      fuel: 100,
      energy: 100,
      oxygen: 100,
      maxFuel: 100,
      maxEnergy: 100,
      maxOxygen: 100,
      isThrusting: false,
      isWalking: false,
      score: 0,
      lives: 3,
      selectedWeapon: 'blaster',
      ammo: {
        blaster: -1, // Infinite
        grenade: 6,
        plasma: 25,
      },
      carriedItem: null,
      beaconPlaced: { x: 16 * TILE_SIZE, y: 20 * TILE_SIZE }, // Initial beacon at Perseus ship
      invulnerableTimer: 0,
      flashTimer: 0,
      hasKeycardRed: false,
      hasKeycardBlue: false,
      hasKeycardYellow: false,
    };

    return {
      status: 'playing',
      mike,
      items,
      enemies,
      projectiles: [],
      particles: [],
      waterBodies,
      windVents,
      gates,
      generators,
      camera: {
        x: startX - 320,
        y: startY - 200,
      },
      radarMessage: 'EXILE: VIND TRIAX EN RED DE BEMANNING VAN DE PERSEUS',
      radarMessageTimer: 280,
      mapRevealed: false,
      gameTime: 0,
      triaxDefeated: false,
    };
  }

  public resetGame() {
    this.state = this.createInitialState();
  }

  // Key Event Handlers
  public handleKeyDown(code: string) {
    this.keys[code.toLowerCase()] = true;

    // Direct weapon cycle
    if (code === 'Digit1') this.state.mike.selectedWeapon = 'blaster';
    if (code === 'Digit2') this.state.mike.selectedWeapon = 'grenade';
    if (code === 'Digit3') this.state.mike.selectedWeapon = 'plasma';

    // Teleport to beacon (<kbd>T</kbd>)
    if (code === 'KeyT') {
      this.activateTeleporter();
    }

    // Drop Teleport Beacon (<kbd>B</kbd>)
    if (code === 'KeyB') {
      this.deployTeleportBeacon();
    }

    // Pick up / Drop item (<kbd>G</kbd> or <kbd>Enter</kbd>)
    if (code === 'KeyG' || code === 'Enter') {
      this.toggleItemGrab();
    }

    // Toggle Map (<kbd>M</kbd>)
    if (code === 'KeyM') {
      this.state.mapRevealed = !this.state.mapRevealed;
    }
  }

  public handleKeyUp(code: string) {
    this.keys[code.toLowerCase()] = false;
  }

  public isKeyPressed(code: string): boolean {
    return !!this.keys[code.toLowerCase()];
  }

  // Actions
  public activateTeleporter() {
    const mike = this.state.mike;
    if (!mike.beaconPlaced) {
      this.setMessage('GEEN TELEPORT BAKEN GEPLAATST!');
      return;
    }

    if (mike.energy < 15) {
      this.setMessage('ONVOLDOENDE PAK-ENERGIE VOOR TELEPORT!');
      exileAudio.playAlarmBeep();
      return;
    }

    mike.energy = Math.max(0, mike.energy - 15);

    // Spawn dematerialization particles at current location
    for (let i = 0; i < 24; i++) {
      this.state.particles.push({
        x: mike.x + (Math.random() * 16 - 8),
        y: mike.y + (Math.random() * 20 - 10),
        vx: (Math.random() * 2 - 1) * 3,
        vy: (Math.random() * 2 - 1) * 3,
        color: '#00ffff',
        size: 3,
        life: 25,
        maxLife: 25,
        type: 'teleport',
      });
    }

    // Warp to beacon position
    mike.x = mike.beaconPlaced.x;
    mike.y = mike.beaconPlaced.y - 12;
    mike.vx = 0;
    mike.vy = 0;

    // Rematerialization particles
    for (let i = 0; i < 28; i++) {
      this.state.particles.push({
        x: mike.x + (Math.random() * 16 - 8),
        y: mike.y + (Math.random() * 20 - 10),
        vx: (Math.random() * 2 - 1) * 4,
        vy: (Math.random() * 2 - 1) * 4,
        color: '#ffff00',
        size: 3.5,
        life: 30,
        maxLife: 30,
        type: 'teleport',
      });
    }

    exileAudio.playTeleport();
    this.setMessage('TELEPORT NAAR BAKEN VOLTOOID!');
  }

  public deployTeleportBeacon() {
    const mike = this.state.mike;
    mike.beaconPlaced = { x: mike.x, y: mike.y };

    // Update or find beacon item
    let beaconItem = this.state.items.find(it => it.type === 'teleport_beacon');
    if (!beaconItem) {
      beaconItem = {
        id: `beacon_${Date.now()}`,
        type: 'teleport_beacon',
        name: 'Teleport Baken',
        x: mike.x,
        y: mike.y,
        vx: 0,
        vy: 0,
        radius: 6,
        mass: 1.2,
        grounded: true,
        inWater: false,
        isCarried: false,
      };
      this.state.items.push(beaconItem);
    } else {
      beaconItem.x = mike.x;
      beaconItem.y = mike.y;
      beaconItem.vx = 0;
      beaconItem.vy = 0;
      beaconItem.isCarried = false;
    }

    exileAudio.playPickup();
    this.setMessage('NIEUW TELEPORT BAKEN GEPOSITIONEERD!');
  }

  public toggleItemGrab() {
    const mike = this.state.mike;

    // If already carrying an item: throw/drop it
    if (mike.carriedItem) {
      const item = mike.carriedItem;
      item.isCarried = false;
      mike.carriedItem = null;

      // Impart throw momentum in facing direction
      const throwSpeed = 6.5;
      item.vx = (mike.facing === 'right' ? throwSpeed : -throwSpeed) + mike.vx * 0.5;
      item.vy = -3.0 + mike.vy * 0.5;
      item.x = mike.x + (mike.facing === 'right' ? 14 : -14);
      item.y = mike.y - 4;

      exileAudio.playGrenadeLaunch();
      this.setMessage(`${item.name.toUpperCase()} GEWORPEN!`);

      // Check if dropped near generator socket
      this.checkGeneratorPlacement(item);
      return;
    }

    // Not carrying anything: search for closest reachable item
    const grabRadius = 24;
    let closestItem: PhysicsItem | null = null;
    let closestDist = grabRadius;

    for (const item of this.state.items) {
      if (item.isCarried) continue;
      const d = Math.hypot(mike.x - item.x, mike.y - item.y);
      if (d < closestDist) {
        closestDist = d;
        closestItem = item;
      }
    }

    if (closestItem) {
      // Pick up item
      closestItem.isCarried = true;
      mike.carriedItem = closestItem;
      exileAudio.playPickup();
      this.setMessage(`${closestItem.name.toUpperCase()} OPGEPAKT!`);

      // If it's a keycard, update passcards
      if (closestItem.type === 'keycard_red') mike.hasKeycardRed = true;
      if (closestItem.type === 'keycard_blue') mike.hasKeycardBlue = true;
      if (closestItem.type === 'keycard_yellow') mike.hasKeycardYellow = true;
    }
  }

  private checkGeneratorPlacement(item: PhysicsItem) {
    if (item.type !== 'energy_cell') return;

    for (const gen of this.state.generators) {
      const d = Math.hypot(item.x - gen.x, item.y - gen.y);
      if (d < 30 && !gen.powered) {
        gen.powered = true;
        item.x = gen.x;
        item.y = gen.y;
        item.vx = 0;
        item.vy = 0;

        // Open connected gate
        const gate = this.state.gates.find(g => g.id === gen.connectedGateId);
        if (gate) {
          gate.isOpen = true;
          exileAudio.playGateOpen();
          this.setMessage('GENERATOR GEACTIVEERD: BEVEILIGINGSPOORT GEOPEND!');
        }
      }
    }
  }

  public fireWeapon() {
    const mike = this.state.mike;
    if (mike.energy <= 0) return;

    const spawnDist = 12;
    const dirX = mike.facing === 'right' ? 1 : -1;
    const bulletX = mike.x + dirX * spawnDist;
    const bulletY = mike.y - 2;

    if (mike.selectedWeapon === 'blaster') {
      // Fast straight laser pulse
      this.state.projectiles.push({
        id: `p_${Date.now()}_${Math.random()}`,
        x: bulletX,
        y: bulletY,
        vx: dirX * 11,
        vy: 0,
        radius: 2.5,
        damage: 15,
        isEnemy: false,
        weaponType: 'blaster',
        life: 45,
        maxLife: 45,
        bounceCount: 0,
      });
      exileAudio.playBlaster();
    } else if (mike.selectedWeapon === 'grenade') {
      if (mike.ammo.grenade <= 0) {
        this.setMessage('GEEN GRANATEN MEER!');
        exileAudio.playAlarmBeep();
        return;
      }
      mike.ammo.grenade--;

      // Bouncing explosive grenade with trajectory
      this.state.projectiles.push({
        id: `g_${Date.now()}_${Math.random()}`,
        x: bulletX,
        y: bulletY,
        vx: dirX * 6.5 + mike.vx * 0.4,
        vy: -3.8 + mike.vy * 0.4,
        radius: 4,
        damage: 60,
        isEnemy: false,
        weaponType: 'grenade',
        life: 90,
        maxLife: 90,
        bounceCount: 3,
      });
      exileAudio.playGrenadeLaunch();
    } else if (mike.selectedWeapon === 'plasma') {
      if (mike.ammo.plasma <= 0) {
        this.setMessage('GEEN PLASMA MUNITIE MEER!');
        exileAudio.playAlarmBeep();
        return;
      }
      mike.ammo.plasma--;

      // Heavy plasma bolt
      this.state.projectiles.push({
        id: `pl_${Date.now()}_${Math.random()}`,
        x: bulletX,
        y: bulletY,
        vx: dirX * 9,
        vy: 0,
        radius: 5,
        damage: 40,
        isEnemy: false,
        weaponType: 'plasma',
        life: 55,
        maxLife: 55,
      });
      exileAudio.playPlasma();
    }
  }

  public setMessage(msg: string) {
    this.state.radarMessage = msg;
    this.state.radarMessageTimer = 180;
  }

  // MAIN PHYSICS & GAME LOOP UPDATE
  public update() {
    if (this.state.status !== 'playing') return;
    this.animTick++;
    this.state.gameTime++;

    if (this.state.radarMessageTimer > 0) {
      this.state.radarMessageTimer--;
    }

    const mike = this.state.mike;

    // 1. UPDATE WATER LEVEL OFFSET
    for (const wb of this.state.waterBodies) {
      wb.waveOffset = Math.sin(this.animTick * 0.05) * 2;
    }

    // 2. CHECK IF MIKE IS IN WATER
    mike.inWater = this.isInWater(mike.x, mike.y);

    // Oxygen depletion
    if (mike.inWater) {
      mike.oxygen = Math.max(0, mike.oxygen - 0.08);
      if (mike.oxygen <= 0) {
        mike.energy = Math.max(0, mike.energy - 0.25);
        if (this.animTick % 30 === 0) {
          exileAudio.playAlarmBeep();
          this.setMessage('WAARSCHUWING: ZUURSTOF OP! ZOEKT LUCHT OF FLES!');
        }
      }
      // Bubbles
      if (Math.random() < 0.15) {
        this.state.particles.push({
          x: mike.x,
          y: mike.y - 4,
          vx: (Math.random() * 2 - 1) * 0.5,
          vy: -1.2,
          color: '#55ffff',
          size: 2,
          life: 35,
          maxLife: 35,
          type: 'bubble',
        });
      }
    } else {
      // Refill oxygen in open air
      mike.oxygen = Math.min(mike.maxOxygen, mike.oxygen + 0.15);
    }

    // 3. APPLY WIND FORCES
    for (const wv of this.state.windVents) {
      if (!wv.active) continue;
      if (
        mike.x >= wv.x &&
        mike.x <= wv.x + wv.width &&
        mike.y >= wv.y &&
        mike.y <= wv.y + wv.height
      ) {
        mike.vx += wv.windVx;
        mike.vy += wv.windVy;
        // Wind particle trail
        if (Math.random() < 0.4) {
          this.state.particles.push({
            x: wv.x + Math.random() * wv.width,
            y: wv.y + wv.height - 4,
            vx: wv.windVx * 2,
            vy: wv.windVy * 8,
            color: '#aaddff',
            size: 1.5,
            life: 20,
            maxLife: 20,
            type: 'thrust',
          });
        }
      }
    }

    // 4. PLAYER MOVEMENT & JETPACK INPUT
    const leftPressed = this.isKeyPressed('arrowleft') || this.isKeyPressed('keya');
    const rightPressed = this.isKeyPressed('arrowright') || this.isKeyPressed('keyd');
    const thrustPressed = this.isKeyPressed('arrowup') || this.isKeyPressed('keyw') || this.isKeyPressed('space');
    const downPressed = this.isKeyPressed('arrowdown') || this.isKeyPressed('keys');
    const firePressed = this.isKeyPressed('keyf') || this.isKeyPressed('control') || this.isKeyPressed('keyx');

    // Walking / Air drift
    const walkSpeed = mike.inWater ? 0.15 : 0.28;
    mike.isWalking = false;
    if (leftPressed) {
      mike.vx -= walkSpeed;
      mike.facing = 'left';
      mike.isWalking = true;
    }
    if (rightPressed) {
      mike.vx += walkSpeed;
      mike.facing = 'right';
      mike.isWalking = true;
    }

    // Jetpack Thrust
    if (thrustPressed && mike.fuel > 0) {
      mike.isThrusting = true;
      const thrustPower = mike.inWater ? -0.22 : -0.38;
      mike.vy += thrustPower;
      mike.fuel = Math.max(0, mike.fuel - 0.08);

      exileAudio.startThrust();

      // Jetpack particle plume
      const plumeDirX = mike.facing === 'right' ? -1 : 1;
      this.state.particles.push({
        x: mike.x + plumeDirX * 5,
        y: mike.y + 6,
        vx: plumeDirX * 1.5 + (Math.random() * 2 - 1) * 0.8,
        vy: 2.5 + Math.random() * 1.5,
        color: Math.random() > 0.4 ? '#ffff00' : '#ff4400',
        size: 2.5 + Math.random() * 1.5,
        life: 18,
        maxLife: 18,
        type: 'thrust',
      });
    } else {
      mike.isThrusting = false;
      exileAudio.stopThrust();
    }

    // Weapon Fire on key trigger
    if (firePressed && this.animTick % 12 === 0) {
      this.fireWeapon();
    }

    // 5. NEWTONIAN PHYSICS ON PLAYER
    // Gravity & Friction
    const gravity = mike.inWater ? 0.05 : 0.16;
    mike.vy += gravity;

    // Environmental Damping
    if (mike.inWater) {
      mike.vx *= 0.92;
      mike.vy *= 0.92;
      // Buoyancy lift
      mike.vy -= 0.12;
    } else {
      mike.vx *= mike.grounded ? 0.82 : 0.985;
      mike.vy *= 0.995;
    }

    // Terminal velocity caps
    const maxV = mike.inWater ? 4.5 : 9.0;
    mike.vx = Math.max(-maxV, Math.min(maxV, mike.vx));
    mike.vy = Math.max(-maxV, Math.min(maxV, mike.vy));

    // Collision Detection with World Grid & Gates
    this.updateBodyCollision(mike);

    // If standing on recharge pad
    const tileUnder = this.getTileAt(mike.x, mike.y + mike.radius + 2);
    if (tileUnder === 7) {
      mike.energy = Math.min(mike.maxEnergy, mike.energy + 0.35);
      mike.fuel = Math.min(mike.maxFuel, mike.fuel + 0.45);
      if (this.animTick % 20 === 0) {
        this.state.particles.push({
          x: mike.x + (Math.random() * 16 - 8),
          y: mike.y + mike.radius,
          vx: 0,
          vy: -1.2,
          color: '#00ff66',
          size: 2,
          life: 20,
          maxLife: 20,
          type: 'spark',
        });
      }
    }

    // If touching magma
    if (tileUnder === 4 || this.getTileAt(mike.x, mike.y) === 4) {
      mike.energy = Math.max(0, mike.energy - 0.7);
      mike.vy -= 2.5; // Bounce up from heat
      exileAudio.playExplosion(false);
      this.setMessage('GEVAAR: VLOEIBAAR MAGMA! HITTE SCHADE!');
    }

    // If touching spikes
    if (tileUnder === 6) {
      mike.energy = Math.max(0, mike.energy - 0.5);
      mike.vy -= 2.0;
      exileAudio.playBounce();
    }

    // Carried item tracks player position
    if (mike.carriedItem) {
      mike.carriedItem.x = mike.x;
      mike.carriedItem.y = mike.y - 14;
      mike.carriedItem.vx = mike.vx;
      mike.carriedItem.vy = mike.vy;
    }

    // 6. UPDATE PHYSICS ITEMS (boulders, fuel, keycards)
    for (const item of this.state.items) {
      if (item.isCarried) continue;

      item.inWater = this.isInWater(item.x, item.y);
      const itemGrav = item.inWater ? 0.08 : 0.18;
      item.vy += itemGrav;

      // Damping
      if (item.inWater) {
        item.vx *= 0.94;
        item.vy *= 0.94;
      } else {
        item.vx *= item.grounded ? 0.85 : 0.99;
        item.vy *= 0.99;
      }

      // Wind force on items
      for (const wv of this.state.windVents) {
        if (
          item.x >= wv.x &&
          item.x <= wv.x + wv.width &&
          item.y >= wv.y &&
          item.y <= wv.y + wv.height
        ) {
          item.vx += wv.windVx * 0.7;
          item.vy += wv.windVy * 0.7;
        }
      }

      this.updateBodyCollision(item, true);

      // Automatic pickup of fuel & oxygen if touching player
      const distToMike = Math.hypot(mike.x - item.x, mike.y - item.y);
      if (distToMike < mike.radius + item.radius + 4) {
        if (item.type === 'fuel_canister' && mike.fuel < 95) {
          mike.fuel = Math.min(mike.maxFuel, mike.fuel + 45);
          mike.score += 250;
          exileAudio.playPickup();
          this.setMessage('BRANDSTOFVAT VERBRUIKT (+45% FUEL, +250 PTN)');
          // Remove canister
          this.state.items = this.state.items.filter(it => it.id !== item.id);
        } else if (item.type === 'oxygen_tank' && mike.oxygen < 80) {
          mike.oxygen = 100;
          mike.score += 200;
          exileAudio.playPickup();
          this.setMessage('ZUURSTOFFLES OPGEPAKT (100% O2, +200 PTN)');
          this.state.items = this.state.items.filter(it => it.id !== item.id);
        } else if (item.type === 'triax_data_cube' && this.state.triaxDefeated) {
          // VICTORY!
          this.state.status = 'victory';
          mike.score += 10000;
          exileAudio.playTeleport();
          if (this.onGameOverCb) this.onGameOverCb(mike.score, true);
        }
      }
    }

    // 7. UPDATE SECURITY GATES & KEYCARD UNLOCKING
    for (const gate of this.state.gates) {
      if (!gate.isOpen) {
        // Check if player is near gate with required keycard
        const d = Math.hypot(mike.x - (gate.x + gate.width / 2), mike.y - (gate.y + gate.height / 2));
        if (d < 45) {
          let hasKey = false;
          if (gate.requiredKey === 'red' && mike.hasKeycardRed) hasKey = true;
          if (gate.requiredKey === 'blue' && mike.hasKeycardBlue) hasKey = true;
          if (gate.requiredKey === 'yellow' && mike.hasKeycardYellow) hasKey = true;

          if (hasKey) {
            gate.isOpen = true;
            exileAudio.playGateOpen();
            this.setMessage(`BEVEILIGINGSPOORT (${gate.requiredKey.toUpperCase()}) ONTGRENDELD!`);
          }
        }
      } else {
        // Animate gate sliding open
        if (gate.openProgress < 1) {
          gate.openProgress = Math.min(1, gate.openProgress + 0.02);
        }
      }
    }

    // 8. UPDATE PROJECTILES
    for (let i = this.state.projectiles.length - 1; i >= 0; i--) {
      const p = this.state.projectiles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life--;

      if (p.weaponType === 'grenade') {
        p.vy += 0.22; // Grenade gravity
      }

      // Check wall collision
      const tile = this.getTileAt(p.x, p.y);
      if (tile === 1 || tile === 2 || tile === 3 || tile === 5) {
        if (p.weaponType === 'grenade' && p.bounceCount && p.bounceCount > 0) {
          p.bounceCount--;
          p.vy = -p.vy * 0.6;
          p.vx = p.vx * 0.7;
          exileAudio.playBounce();
        } else {
          // Blast!
          if (tile === 5) {
            // Destructible rock destroyed!
            const col = Math.floor(p.x / TILE_SIZE);
            const row = Math.floor(p.y / TILE_SIZE);
            this.mapGrid[row * MAP_COLS + col] = 0;
            this.setMessage('ROTSWAND VERPLETTERD DOOR EXPLOSIE!');
          }
          this.spawnExplosion(p.x, p.y, p.weaponType === 'grenade');
          this.state.projectiles.splice(i, 1);
          continue;
        }
      }

      // Check player hit by enemy projectile
      if (p.isEnemy) {
        const d = Math.hypot(p.x - mike.x, p.y - mike.y);
        if (d < mike.radius + p.radius) {
          mike.energy = Math.max(0, mike.energy - p.damage);
          this.spawnExplosion(p.x, p.y, false);
          this.state.projectiles.splice(i, 1);
          exileAudio.playExplosion(false);
          continue;
        }
      } else {
        // Player shot hitting enemies
        let hitEnemy = false;
        for (const enemy of this.state.enemies) {
          if (!enemy.active) continue;
          const d = Math.hypot(p.x - enemy.x, p.y - enemy.y);
          if (d < enemy.radius + p.radius) {
            enemy.hp -= p.damage;
            hitEnemy = true;
            this.spawnExplosion(p.x, p.y, false);

            if (enemy.hp <= 0) {
              enemy.active = false;
              mike.score += enemy.type === 'boss_triax' ? 5000 : 300;
              this.spawnExplosion(enemy.x, enemy.y, true);

              if (enemy.type === 'boss_triax') {
                this.state.triaxDefeated = true;
                this.setMessage('TRIAX VERSLAGEN! PAK DE DATA CUBE EN ONTSNAP!');
              } else {
                this.setMessage(`${enemy.type.toUpperCase()} NEERGEHAALD! (+300 PTN)`);
              }
            }
            break;
          }
        }
        if (hitEnemy) {
          this.state.projectiles.splice(i, 1);
          continue;
        }
      }

      if (p.life <= 0) {
        if (p.weaponType === 'grenade') {
          this.spawnExplosion(p.x, p.y, true);
        }
        this.state.projectiles.splice(i, 1);
      }
    }

    // 9. UPDATE ENEMIES AI & BEHAVIORS
    for (const enemy of this.state.enemies) {
      if (!enemy.active) continue;
      enemy.stateTimer++;

      if (enemy.type === 'magpie_bird') {
        // Roost / Dive AI: dives down when player is below, pecks or snatches
        const dx = mike.x - enemy.x;
        const dy = mike.y - enemy.y;
        const dist = Math.hypot(dx, dy);

        if (dist < 180) {
          // Swoop toward player
          enemy.vx += (dx / dist) * 0.18;
          enemy.vy += (dy / dist) * 0.14;
          enemy.facing = enemy.vx > 0 ? 'right' : 'left';
          if (Math.random() < 0.02) exileAudio.playAlienScreech();

          // Peck damage
          if (dist < enemy.radius + mike.radius + 2) {
            mike.energy = Math.max(0, mike.energy - 0.2);
            // Bird can knock carried items loose!
            if (mike.carriedItem && Math.random() < 0.05) {
              this.toggleItemGrab();
              this.setMessage('MAGPIE VOGEL HEEFT JE VOORWERP AFGEPAKT!');
            }
          }
        } else {
          // Patrol wander
          enemy.vx = Math.sin(enemy.stateTimer * 0.04) * 1.8;
          enemy.vy = Math.cos(enemy.stateTimer * 0.02) * 0.6;
        }

        enemy.x += enemy.vx;
        enemy.y += enemy.vy;
      } else if (enemy.type === 'turret') {
        // Ceiling tracking laser turret
        const dx = mike.x - enemy.x;
        const dy = mike.y - enemy.y;
        const dist = Math.hypot(dx, dy);

        if (dist < 220 && dy > 0) {
          enemy.facing = dx > 0 ? 'right' : 'left';
          enemy.shootCooldown--;
          if (enemy.shootCooldown <= 0) {
            enemy.shootCooldown = 90;
            // Fire tracking laser bolt
            const aimLen = Math.hypot(dx, dy);
            this.state.projectiles.push({
              id: `tur_${Date.now()}`,
              x: enemy.x,
              y: enemy.y + 8,
              vx: (dx / aimLen) * 6,
              vy: (dy / aimLen) * 6,
              radius: 3,
              damage: 18,
              isEnemy: true,
              weaponType: 'plasma_turret',
              life: 60,
              maxLife: 60,
            });
            exileAudio.playBlaster();
          }
        }
      } else if (enemy.type === 'triax_drone') {
        // Hovering combat drone
        const dx = mike.x - enemy.x;
        const dy = mike.y - enemy.y;
        const dist = Math.hypot(dx, dy);

        if (dist < 240) {
          enemy.vx += (dx / dist) * 0.08;
          enemy.vy += (dy / dist) * 0.08;
          enemy.facing = enemy.vx > 0 ? 'right' : 'left';

          enemy.shootCooldown--;
          if (enemy.shootCooldown <= 0) {
            enemy.shootCooldown = 110;
            this.state.projectiles.push({
              id: `dr_${Date.now()}`,
              x: enemy.x,
              y: enemy.y,
              vx: enemy.facing === 'right' ? 5.5 : -5.5,
              vy: 0,
              radius: 2.5,
              damage: 15,
              isEnemy: true,
              weaponType: 'laser_bolt',
              life: 50,
              maxLife: 50,
            });
            exileAudio.playBlaster();
          }
        }
        enemy.vx *= 0.96;
        enemy.vy *= 0.96;
        enemy.x += enemy.vx;
        enemy.y += enemy.vy;
      } else if (enemy.type === 'boss_triax') {
        // Boss Triax: floats in his platform, summons drones and shoots plasma barrage
        enemy.x = 140 * TILE_SIZE + Math.sin(enemy.stateTimer * 0.03) * 40;
        enemy.y = 82 * TILE_SIZE + Math.cos(enemy.stateTimer * 0.04) * 20;

        enemy.shootCooldown--;
        if (enemy.shootCooldown <= 0) {
          enemy.shootCooldown = 75;
          const dx = mike.x - enemy.x;
          const dy = mike.y - enemy.y;
          const len = Math.hypot(dx, dy) || 1;

          this.state.projectiles.push({
            id: `triax_${Date.now()}`,
            x: enemy.x,
            y: enemy.y,
            vx: (dx / len) * 6.5,
            vy: (dy / len) * 6.5,
            radius: 5,
            damage: 25,
            isEnemy: true,
            weaponType: 'plasma_turret',
            life: 70,
            maxLife: 70,
          });
          exileAudio.playPlasma();
        }
      }
    }

    // 10. UPDATE PARTICLES
    for (let i = this.state.particles.length - 1; i >= 0; i--) {
      const pt = this.state.particles[i];
      pt.x += pt.vx;
      pt.y += pt.vy;
      pt.life--;
      if (pt.life <= 0) {
        this.state.particles.splice(i, 1);
      }
    }

    // 11. CHECK GAME OVER CONDITION
    if (mike.energy <= 0) {
      this.spawnExplosion(mike.x, mike.y, true);
      mike.lives--;
      if (mike.lives > 0) {
        // Respawn at beacon or start
        mike.energy = 100;
        mike.fuel = 100;
        mike.oxygen = 100;
        if (mike.beaconPlaced) {
          mike.x = mike.beaconPlaced.x;
          mike.y = mike.beaconPlaced.y;
        } else {
          mike.x = 20 * TILE_SIZE;
          mike.y = 18 * TILE_SIZE;
        }
        mike.vx = 0;
        mike.vy = 0;
        this.setMessage(`LEVEN VERLOREN! HERSTART VANAF BAKEN (${mike.lives} LEVENS OVER)`);
        exileAudio.playAlarmBeep();
      } else {
        this.state.status = 'game_over';
        exileAudio.playExplosion(true);
        if (this.onGameOverCb) this.onGameOverCb(mike.score, false);
      }
    }

    // 12. SMOOTH CAMERA TRACKING
    const targetCamX = mike.x - 320;
    const targetCamY = mike.y - 200;
    this.state.camera.x += (targetCamX - this.state.camera.x) * 0.08;
    this.state.camera.y += (targetCamY - this.state.camera.y) * 0.08;

    // Constrain camera to world bounds
    this.state.camera.x = Math.max(0, Math.min(WORLD_WIDTH - 640, this.state.camera.x));
    this.state.camera.y = Math.max(0, Math.min(WORLD_HEIGHT - 400, this.state.camera.y));
  }

  // COLLISION ENGINE (Grid Tiles & Security Gates)
  private updateBodyCollision(body: { x: number; y: number; vx: number; vy: number; radius: number; grounded: boolean }, isItem = false) {
    body.grounded = false;

    // Move X first
    body.x += body.vx;
    if (this.checkCollision(body.x, body.y, body.radius)) {
      if (body.vx > 0) {
        body.x = Math.floor((body.x + body.radius) / TILE_SIZE) * TILE_SIZE - body.radius - 0.1;
      } else if (body.vx < 0) {
        body.x = Math.floor((body.x - body.radius) / TILE_SIZE + 1) * TILE_SIZE + body.radius + 0.1;
      }
      if (isItem && Math.abs(body.vx) > 1.5) exileAudio.playBounce();
      body.vx = isItem ? -body.vx * 0.45 : 0;
    }

    // Move Y
    body.y += body.vy;
    if (this.checkCollision(body.x, body.y, body.radius)) {
      if (body.vy > 0) {
        body.y = Math.floor((body.y + body.radius) / TILE_SIZE) * TILE_SIZE - body.radius - 0.1;
        body.grounded = true;
      } else if (body.vy < 0) {
        body.y = Math.floor((body.y - body.radius) / TILE_SIZE + 1) * TILE_SIZE + body.radius + 0.1;
      }
      if (isItem && Math.abs(body.vy) > 1.5) exileAudio.playBounce();
      body.vy = isItem ? -body.vy * 0.35 : 0;
    }
  }

  private checkCollision(x: number, y: number, radius: number): boolean {
    // 1. Check solid tiles in 3x3 surrounding grid
    const minCol = Math.floor((x - radius) / TILE_SIZE);
    const maxCol = Math.floor((x + radius) / TILE_SIZE);
    const minRow = Math.floor((y - radius) / TILE_SIZE);
    const maxRow = Math.floor((y + radius) / TILE_SIZE);

    for (let r = minRow; r <= maxRow; r++) {
      for (let c = minCol; c <= maxCol; c++) {
        if (c < 0 || c >= MAP_COLS || r < 0 || r >= MAP_ROWS) return true;
        const tile = this.mapGrid[r * MAP_COLS + c];
        // 1=surface rock, 2=cave wall, 3=base steel, 5=cracked rock are solid
        if (tile === 1 || tile === 2 || tile === 3 || tile === 5) {
          return true;
        }
      }
    }

    // 2. Check closed security gates
    for (const gate of this.state.gates) {
      if (!gate.isOpen || gate.openProgress < 0.9) {
        const effectiveHeight = gate.height * (1 - gate.openProgress);
        if (
          x + radius > gate.x &&
          x - radius < gate.x + gate.width &&
          y + radius > gate.y &&
          y - radius < gate.y + effectiveHeight
        ) {
          return true;
        }
      }
    }

    return false;
  }

  public getTileAt(worldX: number, worldY: number): number {
    const col = Math.floor(worldX / TILE_SIZE);
    const row = Math.floor(worldY / TILE_SIZE);
    if (col < 0 || col >= MAP_COLS || row < 0 || row >= MAP_ROWS) return 1;
    return this.mapGrid[row * MAP_COLS + col];
  }

  public isInWater(x: number, y: number): boolean {
    for (const wb of this.state.waterBodies) {
      if (
        x >= wb.x &&
        x <= wb.x + wb.width &&
        y >= wb.y + wb.waveOffset &&
        y <= wb.y + wb.height
      ) {
        return true;
      }
    }
    return false;
  }

  public spawnExplosion(x: number, y: number, isLarge = false) {
    const count = isLarge ? 24 : 12;
    const colors = ['#ffffff', '#ffff00', '#ff8800', '#ff0000', '#555555'];

    for (let i = 0; i < count; i++) {
      const speed = isLarge ? Math.random() * 5 + 2 : Math.random() * 3 + 1;
      const angle = Math.random() * Math.PI * 2;
      this.state.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * (isLarge ? 4.5 : 3) + 1.5,
        life: Math.floor(Math.random() * 20 + 15),
        maxLife: 35,
        type: 'explosion',
      });
    }
    exileAudio.playExplosion(isLarge);
  }
}
