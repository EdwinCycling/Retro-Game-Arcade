/**
 * Wolfenstein 3D (id Software 1992) Floor Maps & Entity Configurations
 */

export interface FloorEntitySpawn {
  x: number;
  z: number;
  type: 'guard' | 'ss' | 'dog' | 'boss';
}

export interface FloorItemSpawn {
  x: number;
  z: number;
  type: 'chalice' | 'ammo' | 'medkit' | 'machinegun';
}

export interface FloorSecretPushWall {
  x: number;
  z: number;
  targetX: number;
  targetZ: number;
}

export interface FloorDefinition {
  floorNumber: number;
  title: string;
  subtitle: string;
  mapSize: number;
  map: number[][];
  startX: number;
  startZ: number;
  startAngle: number;
  enemies: FloorEntitySpawn[];
  items: FloorItemSpawn[];
  pushWalls: FloorSecretPushWall[];
}

export const WOLFENSTEIN_FLOORS: FloorDefinition[] = [
  // ==========================================
  // FLOOR 1: DUNGEON CELL BLOCK ESCAPE
  // ==========================================
  {
    floorNumber: 1,
    title: 'VERDIEPING 1: KERKER ONTSNAPPING',
    subtitle: 'Vind het machinegeweer achter de geheime muur en bereik de lift',
    mapSize: 18,
    startX: 2.5,
    startZ: 2.5,
    startAngle: 0,
    map: [
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 0, 0, 0, 1, 4, 0, 0, 1, 2, 2, 2, 2, 2, 2, 2, 2, 1],
      [1, 0, 0, 0, 7, 0, 0, 0, 1, 2, 0, 0, 0, 0, 0, 0, 2, 1],
      [1, 0, 0, 0, 1, 0, 0, 0, 1, 2, 0, 0, 0, 0, 0, 0, 2, 1],
      [1, 1, 7, 1, 1, 1, 0, 1, 1, 2, 0, 2, 7, 2, 0, 0, 2, 1],
      [1, 0, 0, 0, 0, 1, 0, 1, 3, 3, 0, 2, 0, 2, 0, 0, 2, 1],
      [1, 0, 0, 0, 0, 7, 0, 7, 0, 0, 0, 2, 0, 2, 2, 7, 2, 1],
      [1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 2, 0, 0, 0, 0, 2, 1],
      [1, 1, 8, 1, 1, 1, 0, 1, 3, 3, 3, 3, 0, 0, 0, 0, 2, 1],
      [1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 3, 2, 2, 0, 0, 2, 1],
      [1, 0, 0, 0, 1, 0, 4, 0, 0, 0, 0, 3, 2, 0, 0, 0, 2, 1],
      [1, 1, 1, 1, 1, 0, 1, 1, 1, 7, 1, 1, 2, 0, 6, 0, 2, 1], // (14, 11) Elevator to Floor 2
      [1, 5, 0, 0, 5, 0, 1, 0, 0, 0, 0, 1, 2, 2, 2, 2, 2, 1],
      [1, 5, 0, 0, 5, 0, 7, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 7, 1, 1, 0, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1],
      [1, 0, 0, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1],
      [1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 7, 0, 0, 0, 1, 1],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    ],
    pushWalls: [
      { x: 2, z: 8, targetX: 2, targetZ: 10 },
    ],
    enemies: [
      { x: 6.5, z: 3.5, type: 'guard' },
      { x: 9.5, z: 6.5, type: 'guard' },
      { x: 11.5, z: 2.5, type: 'guard' },
      { x: 14.5, z: 6.5, type: 'guard' },
      { x: 12.5, z: 9.5, type: 'guard' },
      { x: 6.5, z: 9.5, type: 'guard' },
      { x: 9.5, z: 15.5, type: 'guard' },
      { x: 13.5, z: 10.5, type: 'guard' },
    ],
    items: [
      { x: 3.5, z: 1.5, type: 'chalice' },
      { x: 1.5, z: 6.5, type: 'ammo' },
      { x: 2.5, z: 10.5, type: 'medkit' },
      { x: 1.5, z: 9.5, type: 'machinegun' },
      { x: 2.5, z: 9.5, type: 'chalice' },
      { x: 3.5, z: 9.5, type: 'chalice' },
      { x: 6.5, z: 2.5, type: 'ammo' },
      { x: 10.5, z: 3.5, type: 'chalice' },
      { x: 13.5, z: 2.5, type: 'medkit' },
      { x: 15.5, z: 3.5, type: 'ammo' },
      { x: 6.5, z: 14.5, type: 'medkit' },
      { x: 9.5, z: 13.5, type: 'ammo' },
      { x: 14.5, z: 16.5, type: 'chalice' },
    ],
  },

  // ==========================================
  // FLOOR 2: BLUE BASTION & SS OFFICERS + DOGS
  // ==========================================
  {
    floorNumber: 2,
    title: 'VERDIEPING 2: BLAUWE BASTION',
    subtitle: 'Pas op voor patrouillerende SS-officieren en aanvallende waakhonden',
    mapSize: 18,
    startX: 1.5,
    startZ: 1.5,
    startAngle: 0,
    map: [
      [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
      [2, 0, 0, 0, 2, 0, 0, 0, 2, 4, 0, 0, 2, 3, 3, 3, 3, 2],
      [2, 0, 0, 0, 7, 0, 0, 0, 7, 0, 0, 0, 7, 0, 0, 0, 3, 2],
      [2, 0, 0, 0, 2, 0, 0, 0, 2, 0, 0, 0, 2, 0, 0, 0, 3, 2],
      [2, 2, 7, 2, 2, 2, 0, 2, 2, 2, 7, 2, 2, 3, 7, 3, 3, 2],
      [2, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 2],
      [2, 0, 2, 2, 0, 2, 0, 2, 2, 8, 2, 2, 0, 2, 2, 0, 0, 2], // (9, 6) is Secret PushWall 1
      [2, 0, 2, 2, 0, 7, 0, 2, 0, 0, 0, 2, 0, 2, 2, 0, 0, 2],
      [2, 0, 0, 0, 0, 2, 0, 2, 0, 0, 0, 2, 0, 0, 0, 0, 0, 2],
      [2, 2, 2, 7, 2, 2, 0, 2, 2, 2, 2, 2, 2, 7, 2, 2, 2, 2],
      [2, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 2],
      [2, 0, 0, 0, 0, 2, 2, 2, 7, 2, 2, 0, 2, 0, 0, 0, 0, 2],
      [2, 0, 2, 2, 0, 0, 0, 2, 0, 2, 0, 0, 7, 0, 2, 2, 0, 2],
      [2, 0, 2, 2, 0, 0, 0, 2, 0, 2, 0, 0, 2, 0, 2, 2, 0, 2],
      [2, 8, 2, 2, 2, 2, 0, 2, 0, 2, 0, 2, 2, 0, 2, 2, 0, 2], // (1, 14) is Secret PushWall 2
      [2, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 2],
      [2, 0, 0, 0, 0, 2, 0, 0, 6, 0, 0, 2, 0, 0, 0, 0, 0, 2], // (8, 16) Elevator to Boss Chamber
      [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
    ],
    pushWalls: [
      { x: 9, z: 6, targetX: 9, targetZ: 8 },
      { x: 1, z: 14, targetX: 1, targetZ: 16 },
    ],
    enemies: [
      // Guard Dogs
      { x: 6.5, z: 1.5, type: 'dog' },
      { x: 14.5, z: 2.5, type: 'dog' },
      { x: 7.5, z: 10.5, type: 'dog' },
      { x: 10.5, z: 14.5, type: 'dog' },

      // Standard Guards
      { x: 1.5, z: 5.5, type: 'guard' },
      { x: 10.5, z: 2.5, type: 'guard' },
      { x: 3.5, z: 10.5, type: 'guard' },
      { x: 15.5, z: 11.5, type: 'guard' },

      // SS Officers (Heavy submachine guns)
      { x: 14.5, z: 5.5, type: 'ss' },
      { x: 6.5, z: 5.5, type: 'ss' },
      { x: 13.5, z: 15.5, type: 'ss' },
      { x: 3.5, z: 15.5, type: 'ss' },
    ],
    items: [
      { x: 2.5, z: 1.5, type: 'ammo' },
      { x: 15.5, z: 1.5, type: 'chalice' },
      { x: 9.5, z: 7.5, type: 'chalice' }, // Inside secret 1
      { x: 9.5, z: 8.5, type: 'medkit' },
      { x: 10.5, z: 8.5, type: 'ammo' },
      { x: 1.5, z: 15.5, type: 'chalice' }, // Inside secret 2
      { x: 2.5, z: 15.5, type: 'chalice' },
      { x: 10.5, z: 5.5, type: 'ammo' },
      { x: 16.5, z: 6.5, type: 'medkit' },
      { x: 6.5, z: 12.5, type: 'medkit' },
      { x: 15.5, z: 14.5, type: 'ammo' },
      { x: 7.5, z: 15.5, type: 'chalice' },
    ],
  },

  // ==========================================
  // FLOOR 3: FORTRESS BOSS CHAMBER (HANS GROSSE)
  // ==========================================
  {
    floorNumber: 3,
    title: 'VERDIEPING 3: EINDGELAG (HANS GROSSE)',
    subtitle: 'Versla bevelhebber Hans Grosse met zijn dubbele snelvuurkanonnen!',
    mapSize: 18,
    startX: 8.5,
    startZ: 16.5,
    startAngle: Math.PI, // Facing forward into the fortress
    map: [
      [4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
      [4, 0, 0, 0, 4, 4, 0, 0, 6, 0, 0, 4, 4, 0, 0, 0, 0, 4], // (8, 1) Exit Gate
      [4, 0, 0, 0, 4, 4, 0, 0, 0, 0, 0, 4, 4, 0, 0, 0, 0, 4],
      [4, 0, 4, 0, 7, 0, 0, 0, 0, 0, 0, 0, 7, 0, 4, 0, 0, 4],
      [4, 0, 4, 0, 4, 4, 0, 0, 0, 0, 0, 4, 4, 0, 4, 0, 0, 4],
      [4, 0, 0, 0, 4, 4, 0, 0, 0, 0, 0, 4, 4, 0, 0, 0, 0, 4],
      [4, 4, 7, 4, 4, 4, 7, 4, 4, 4, 7, 4, 4, 4, 7, 4, 4, 4],
      [4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4],
      [4, 0, 4, 4, 0, 4, 4, 0, 0, 0, 4, 4, 0, 4, 4, 0, 0, 4],
      [4, 0, 4, 4, 0, 4, 4, 0, 0, 0, 4, 4, 0, 4, 4, 0, 0, 4],
      [4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4],
      [4, 4, 7, 4, 4, 4, 4, 2, 7, 2, 4, 4, 4, 4, 7, 4, 4, 4],
      [4, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 0, 0, 4],
      [4, 0, 0, 0, 7, 0, 0, 0, 0, 0, 0, 0, 7, 0, 0, 0, 0, 4],
      [4, 0, 4, 0, 4, 0, 0, 0, 0, 0, 0, 0, 4, 0, 4, 0, 0, 4],
      [4, 8, 4, 0, 4, 0, 0, 0, 0, 0, 0, 0, 4, 0, 4, 0, 0, 4], // (1, 15) PushWall Armory
      [4, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 0, 0, 4],
      [4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
    ],
    pushWalls: [
      { x: 1, z: 15, targetX: 1, targetZ: 13 },
    ],
    enemies: [
      // BOSS: HANS GROSSE (In the central grand hall)
      { x: 8.5, z: 4.5, type: 'boss' },

      // Elite SS Guards
      { x: 3.5, z: 3.5, type: 'ss' },
      { x: 14.5, z: 3.5, type: 'ss' },
      { x: 2.5, z: 8.5, type: 'ss' },
      { x: 15.5, z: 8.5, type: 'ss' },

      // Attack Dogs
      { x: 5.5, z: 13.5, type: 'dog' },
      { x: 11.5, z: 13.5, type: 'dog' },
    ],
    items: [
      { x: 8.5, z: 14.5, type: 'ammo' },
      { x: 7.5, z: 14.5, type: 'ammo' },
      { x: 9.5, z: 14.5, type: 'ammo' },
      { x: 1.5, z: 14.5, type: 'medkit' }, // Secret armory
      { x: 1.5, z: 13.5, type: 'machinegun' },
      { x: 2.5, z: 14.5, type: 'ammo' },
      { x: 14.5, z: 16.5, type: 'chalice' },
      { x: 2.5, z: 16.5, type: 'chalice' },
      { x: 8.5, z: 7.5, type: 'medkit' },
      { x: 3.5, z: 1.5, type: 'chalice' },
      { x: 14.5, z: 1.5, type: 'chalice' },
      { x: 8.5, z: 2.5, type: 'medkit' },
    ],
  },
];
