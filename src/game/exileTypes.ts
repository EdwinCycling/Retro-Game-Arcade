/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type WeaponType = 'blaster' | 'grenade' | 'plasma';

export interface PhysicsBody {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  mass: number;
  grounded: boolean;
  inWater: boolean;
}

export interface PlayerMike extends PhysicsBody {
  facing: 'left' | 'right';
  aimAngle: number; // in radians
  fuel: number;     // 0 - 100
  energy: number;   // 0 - 100 (suit shields / health)
  oxygen: number;   // 0 - 100
  maxFuel: number;
  maxEnergy: number;
  maxOxygen: number;
  isThrusting: boolean;
  isWalking: boolean;
  score: number;
  lives: number;
  selectedWeapon: WeaponType;
  ammo: {
    blaster: number;  // Infinity represented as -1
    grenade: number;
    plasma: number;
  };
  carriedItem: PhysicsItem | null;
  beaconPlaced: { x: number; y: number } | null;
  invulnerableTimer: number;
  flashTimer: number;
  hasKeycardRed: boolean;
  hasKeycardBlue: boolean;
  hasKeycardYellow: boolean;
}

export type ItemType = 
  | 'boulder' 
  | 'fuel_canister' 
  | 'energy_cell' 
  | 'teleport_beacon' 
  | 'keycard_red' 
  | 'keycard_blue' 
  | 'keycard_yellow'
  | 'oxygen_tank'
  | 'triax_data_cube';

export interface PhysicsItem extends PhysicsBody {
  id: string;
  type: ItemType;
  name: string;
  isCarried: boolean;
  collected?: boolean;
}

export type EnemyType = 
  | 'magpie_bird' 
  | 'triax_drone' 
  | 'turret' 
  | 'magma_worm' 
  | 'boss_triax';

export interface EnemyEntity extends PhysicsBody {
  id: string;
  type: EnemyType;
  hp: number;
  maxHp: number;
  active: boolean;
  facing: 'left' | 'right';
  shootCooldown: number;
  stateTimer: number;
  behaviorState?: string;
  targetX?: number;
  targetY?: number;
  carriedItem?: PhysicsItem | null;
}

export interface Projectile {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  damage: number;
  isEnemy: boolean;
  weaponType: WeaponType | 'laser_bolt' | 'plasma_turret';
  life: number;
  maxLife: number;
  bounceCount?: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  life: number;
  maxLife: number;
  type?: 'thrust' | 'spark' | 'bubble' | 'smoke' | 'teleport' | 'explosion';
}

export interface WaterBody {
  x: number;
  y: number;
  width: number;
  height: number;
  waveOffset: number;
}

export interface WindVent {
  x: number;
  y: number;
  width: number;
  height: number;
  windVx: number;
  windVy: number;
  active: boolean;
}

export interface SecurityGate {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  requiredKey: 'red' | 'blue' | 'yellow' | 'generator';
  isOpen: boolean;
  openProgress: number; // 0 (closed) to 1 (open)
}

export interface GeneratorSocket {
  id: string;
  x: number;
  y: number;
  powered: boolean;
  connectedGateId: string;
}

export interface ExileGameState {
  status: 'title' | 'playing' | 'paused' | 'game_over' | 'victory';
  mike: PlayerMike;
  items: PhysicsItem[];
  enemies: EnemyEntity[];
  projectiles: Projectile[];
  particles: Particle[];
  waterBodies: WaterBody[];
  windVents: WindVent[];
  gates: SecurityGate[];
  generators: GeneratorSocket[];
  camera: {
    x: number;
    y: number;
  };
  radarMessage: string;
  radarMessageTimer: number;
  mapRevealed: boolean;
  gameTime: number;
  triaxDefeated: boolean;
}
