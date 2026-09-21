/**
 * Duke Nukem 3D Level Maps & Sector Definitions
 * Recreates Hollywood Holocaust (E1L1) & Blood E1M1: Cradle to the Grave
 *
 * Map Legend:
 * 0 = Open Floor / Walkable Space
 * 1 = Hollywood Red Brick Wall
 * 2 = Cinema Neon Marquee Facade ("HOLLYWOOD THEATER")
 * 3 = Steel Blast Door (Opens on Space / E / Proximity)
 * 4 = Red Keycard Locked Blast Door
 * 5 = Yellow Keycard Locked Blast Door
 * 6 = Blue Keycard Locked Blast Door
 * 7 = Soda Vending Machine ("DUKE COLA" - +10 HP on interact)
 * 8 = Restroom Tiles & Working Mirror / Toilet / Light Switch
 * 9 = Level Exit Nuke Symbol Switch
 * 10 = Toxic Slime / Sewer Water
 * 11 = Security TV Camera & Monitor
 * 12 = Explosive Fire Extinguisher / Barrel
 */

export interface DukeMapSector {
  id: string;
  name: string;
  subtitle: string;
  parTime: number; // Seconds
  startX: number;
  startZ: number;
  startAngle: number;
  gridWidth: number;
  gridHeight: number;
  layout: number[][];
  secretsCount: number;
  monsters: {
    x: number;
    z: number;
    type: 'pigcop' | 'trooper' | 'cultist' | 'octabrain';
  }[];
  items: {
    x: number;
    z: number;
    type: 'shotgun' | 'chaingun' | 'rpg' | 'pipebomb' | 'atomic_health' | 'medkit' | 'steroids' | 'red_key' | 'blue_key' | 'yellow_key' | 'armor';
  }[];
}

// 1. Hollywood Holocaust (E1L1 - Duke Nukem 3D Episode 1 Level 1)
export const HOLLYWOOD_HOLOCAUST_MAP: DukeMapSector = {
  id: 'e1l1',
  name: 'E1L1: HOLLYWOOD HOLOCAUST',
  subtitle: 'L.A. Meltdown • Hollywood Boulevard & Cinema',
  parTime: 45,
  startX: 2.5,
  startZ: 2.5,
  startAngle: 0,
  gridWidth: 20,
  gridHeight: 20,
  secretsCount: 3,
  layout: [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 1, 0, 0, 0, 0, 1, 2, 2, 2, 2, 1, 8, 8, 8, 8, 1],
    [1, 0, 0, 0, 1, 0, 0, 0, 0, 3, 0, 0, 0, 0, 3, 8, 8, 8, 8, 1],
    [1, 0, 0, 0, 3, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 8, 8, 8, 8, 1],
    [1, 1, 3, 1, 1, 0, 0, 0, 0, 1, 1, 3, 1, 1, 1, 1, 3, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 7, 0, 0, 0, 12, 0, 0, 0, 0, 0, 0, 0, 0, 0, 7, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 3, 1, 1, 1, 1, 1, 1, 1, 4, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 11, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 3, 1, 1, 1, 1, 1, 6, 1, 1, 1, 1, 1, 1, 1],
    [1, 10, 10, 10, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 9, 1],
    [1, 10, 10, 10, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 10, 10, 10, 3, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
  ],
  monsters: [
    // Street Alley Patrol
    { x: 6.5, z: 6.5, type: 'pigcop' },
    { x: 12.5, z: 6.5, type: 'trooper' },
    { x: 15.5, z: 7.5, type: 'pigcop' },
    // Cinema Lobby Guard
    { x: 12.5, z: 2.5, type: 'trooper' },
    { x: 13.5, z: 3.5, type: 'pigcop' },
    // Arcade & Projector Room
    { x: 4.5, z: 10.5, type: 'cultist' },
    { x: 6.5, z: 11.5, type: 'pigcop' },
    // Sewer & Toxic Waste
    { x: 2.5, z: 15.5, type: 'octabrain' },
    { x: 7.5, z: 16.5, type: 'trooper' },
    // Exit Chamber Guardians
    { x: 14.5, z: 15.5, type: 'pigcop' },
    { x: 16.5, z: 16.5, type: 'pigcop' },
    { x: 17.5, z: 14.5, type: 'trooper' }
  ],
  items: [
    // Street Pickups
    { x: 1.5, z: 6.5, type: 'shotgun' },
    { x: 8.5, z: 6.5, type: 'pipebomb' },
    { x: 16.5, z: 1.5, type: 'medkit' },
    // Restroom Secret
    { x: 17.5, z: 3.5, type: 'atomic_health' },
    { x: 18.5, z: 2.5, type: 'steroids' },
    // Cinema Projector Key & Guns
    { x: 2.5, z: 11.5, type: 'red_key' },
    { x: 6.5, z: 9.5, type: 'chaingun' },
    // Sewer Secret & Blue Key
    { x: 2.5, z: 14.5, type: 'rpg' },
    { x: 3.5, z: 16.5, type: 'blue_key' },
    { x: 7.5, z: 18.5, type: 'armor' }
  ]
};

// 2. Red Light District (E1L2 - Duke Nukem 3D Episode 1 Level 2)
export const RED_LIGHT_DISTRICT_MAP: DukeMapSector = {
  id: 'e1l2',
  name: 'E1L2: RED LIGHT DISTRICT',
  subtitle: 'Downtown L.A. • Neon Strip Club, Bar & Secret Backstage',
  parTime: 65,
  startX: 2.5,
  startZ: 2.5,
  startAngle: 0,
  gridWidth: 20,
  gridHeight: 20,
  secretsCount: 4,
  layout: [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 1, 0, 0, 0, 0, 1, 13, 13, 13, 13, 1, 8, 8, 8, 8, 1],
    [1, 0, 0, 0, 1, 0, 0, 0, 0, 3, 0, 0, 0, 0, 3, 8, 8, 8, 8, 1],
    [1, 0, 0, 0, 3, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 8, 8, 8, 8, 1],
    [1, 1, 3, 1, 1, 0, 0, 0, 0, 1, 1, 3, 1, 1, 1, 1, 3, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 7, 0, 0, 0, 12, 0, 0, 0, 0, 0, 12, 0, 0, 0, 7, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 4, 1, 1, 1, 1, 1, 1, 1, 5, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 13, 13, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 13, 13, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 3, 1, 1, 1, 1, 1, 6, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 9, 1],
    [1, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 3, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
  ],
  monsters: [
    { x: 5.5, z: 6.5, type: 'pigcop' },
    { x: 12.5, z: 6.5, type: 'trooper' },
    { x: 16.5, z: 7.5, type: 'pigcop' },
    { x: 12.5, z: 2.5, type: 'octabrain' },
    { x: 13.5, z: 3.5, type: 'pigcop' },
    { x: 4.5, z: 10.5, type: 'cultist' },
    { x: 6.5, z: 11.5, type: 'pigcop' },
    { x: 2.5, z: 15.5, type: 'octabrain' },
    { x: 7.5, z: 16.5, type: 'cultist' },
    { x: 14.5, z: 15.5, type: 'pigcop' },
    { x: 16.5, z: 16.5, type: 'trooper' },
    { x: 17.5, z: 14.5, type: 'octabrain' }
  ],
  items: [
    { x: 1.5, z: 6.5, type: 'shotgun' },
    { x: 8.5, z: 6.5, type: 'pipebomb' },
    { x: 16.5, z: 1.5, type: 'medkit' },
    { x: 17.5, z: 3.5, type: 'atomic_health' },
    { x: 18.5, z: 2.5, type: 'steroids' },
    { x: 2.5, z: 11.5, type: 'red_key' },
    { x: 6.5, z: 9.5, type: 'chaingun' },
    { x: 2.5, z: 14.5, type: 'rpg' },
    { x: 3.5, z: 16.5, type: 'blue_key' },
    { x: 7.5, z: 18.5, type: 'yellow_key' },
    { x: 14.5, z: 17.5, type: 'armor' }
  ]
};

// 3. Toxic Dump (E1L3 - Duke Nukem 3D Episode 1 Level 3)
export const TOXIC_DUMP_MAP: DukeMapSector = {
  id: 'e1l3',
  name: 'E1L3: TOXIC DUMP',
  subtitle: 'Subterranean Waste Facility • Radioactive Slime Vats & Octabrain Nest',
  parTime: 80,
  startX: 2.5,
  startZ: 2.5,
  startAngle: 0,
  gridWidth: 20,
  gridHeight: 20,
  secretsCount: 5,
  layout: [
    [14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14],
    [14, 0, 0, 0, 14, 10, 10, 10, 10, 14, 14, 14, 14, 14, 14, 8, 8, 8, 8, 14],
    [14, 0, 0, 0, 14, 10, 10, 10, 10, 3, 0, 0, 0, 0, 3, 8, 8, 8, 8, 14],
    [14, 0, 0, 0, 3, 10, 10, 10, 10, 14, 0, 0, 0, 0, 14, 8, 8, 8, 8, 14],
    [14, 14, 3, 14, 14, 10, 10, 10, 10, 14, 14, 3, 14, 14, 14, 14, 3, 14, 14, 14],
    [14, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 14],
    [14, 10, 7, 10, 0, 0, 12, 0, 0, 10, 10, 0, 12, 0, 0, 10, 7, 10, 0, 14],
    [14, 10, 10, 10, 0, 0, 0, 0, 0, 10, 10, 0, 0, 0, 0, 10, 10, 10, 0, 14],
    [14, 14, 14, 4, 14, 14, 14, 14, 14, 14, 14, 5, 14, 14, 14, 14, 14, 14, 14, 14],
    [14, 10, 10, 10, 10, 10, 10, 10, 10, 14, 0, 0, 0, 0, 0, 0, 0, 0, 0, 14],
    [14, 10, 14, 14, 10, 10, 10, 10, 10, 14, 0, 0, 0, 0, 0, 0, 0, 0, 0, 14],
    [14, 10, 14, 14, 10, 10, 10, 10, 10, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 14],
    [14, 10, 10, 10, 10, 10, 10, 10, 10, 14, 0, 0, 0, 0, 0, 0, 0, 0, 0, 14],
    [14, 14, 14, 14, 14, 14, 3, 14, 14, 14, 14, 14, 6, 14, 14, 14, 14, 14, 14, 14],
    [14, 10, 10, 10, 14, 0, 0, 0, 0, 14, 0, 0, 0, 0, 0, 0, 0, 0, 9, 14],
    [14, 10, 10, 10, 14, 0, 0, 0, 0, 14, 0, 0, 0, 0, 0, 0, 0, 0, 0, 14],
    [14, 10, 10, 10, 3, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 14],
    [14, 14, 14, 14, 14, 0, 0, 0, 0, 14, 0, 0, 0, 0, 0, 0, 0, 0, 0, 14],
    [14, 0, 0, 0, 0, 0, 0, 0, 0, 14, 0, 0, 0, 0, 0, 0, 0, 0, 0, 14],
    [14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14]
  ],
  monsters: [
    { x: 5.5, z: 6.5, type: 'octabrain' },
    { x: 8.5, z: 2.5, type: 'octabrain' },
    { x: 12.5, z: 6.5, type: 'trooper' },
    { x: 16.5, z: 7.5, type: 'pigcop' },
    { x: 12.5, z: 2.5, type: 'octabrain' },
    { x: 4.5, z: 10.5, type: 'cultist' },
    { x: 6.5, z: 11.5, type: 'octabrain' },
    { x: 2.5, z: 15.5, type: 'octabrain' },
    { x: 7.5, z: 16.5, type: 'cultist' },
    { x: 14.5, z: 15.5, type: 'pigcop' },
    { x: 16.5, z: 16.5, type: 'trooper' },
    { x: 17.5, z: 14.5, type: 'octabrain' }
  ],
  items: [
    { x: 1.5, z: 6.5, type: 'shotgun' },
    { x: 8.5, z: 6.5, type: 'pipebomb' },
    { x: 16.5, z: 1.5, type: 'medkit' },
    { x: 17.5, z: 3.5, type: 'atomic_health' },
    { x: 18.5, z: 2.5, type: 'steroids' },
    { x: 2.5, z: 11.5, type: 'red_key' },
    { x: 6.5, z: 9.5, type: 'chaingun' },
    { x: 2.5, z: 14.5, type: 'rpg' },
    { x: 3.5, z: 16.5, type: 'blue_key' },
    { x: 7.5, z: 18.5, type: 'yellow_key' },
    { x: 14.5, z: 17.5, type: 'armor' }
  ]
};

// 4. Blood Episode 1 Level 1: Cradle to the Grave
export const CRADLE_GRAVE_MAP: DukeMapSector = {
  id: 'blood_e1m1',
  name: 'BLOOD E1M1: CRADLE TO THE GRAVE',
  subtitle: 'I Live... Again! • Graveyard & Mortuary',
  parTime: 50,
  startX: 2.5,
  startZ: 2.5,
  startAngle: 0,
  gridWidth: 16,
  gridHeight: 16,
  secretsCount: 2,
  layout: [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 3, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 3, 1, 1, 1, 3, 1, 1, 1, 1, 3, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 12, 0, 0, 0, 0, 0, 0, 0, 12, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 4, 1, 1, 1, 1, 1, 1, 1, 6, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 3, 1, 1, 1, 1, 1, 1, 3, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 9, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
  ],
  monsters: [
    { x: 5.5, z: 2.5, type: 'cultist' },
    { x: 6.5, z: 6.5, type: 'cultist' },
    { x: 10.5, z: 6.5, type: 'cultist' },
    { x: 3.5, z: 10.5, type: 'trooper' },
    { x: 12.5, z: 13.5, type: 'cultist' }
  ],
  items: [
    { x: 2.5, z: 6.5, type: 'shotgun' },
    { x: 13.5, z: 6.5, type: 'pipebomb' },
    { x: 3.5, z: 9.5, type: 'red_key' },
    { x: 11.5, z: 10.5, type: 'blue_key' },
    { x: 13.5, z: 14.5, type: 'atomic_health' }
  ]
};

export const DUKE_LEVELS: DukeMapSector[] = [
  HOLLYWOOD_HOLOCAUST_MAP,
  RED_LIGHT_DISTRICT_MAP,
  TOXIC_DUMP_MAP,
  CRADLE_GRAVE_MAP
];

export const DUKE_MAPS: Record<string, DukeMapSector> = {
  e1l1: HOLLYWOOD_HOLOCAUST_MAP,
  e1l2: RED_LIGHT_DISTRICT_MAP,
  e1l3: TOXIC_DUMP_MAP,
  blood_e1m1: CRADLE_GRAVE_MAP
};

