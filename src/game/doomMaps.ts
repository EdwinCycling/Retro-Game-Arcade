/**
 * DOOM 1993 Level Definitions:
 * - E1M1: Hangar (The legendary iconic opening map of Knee-Deep in the Dead!)
 * - E1M2: Nuclear Plant
 * - E1M3: Toxin Refinery
 */

export interface DoomMapMonster {
  type: 'zombie' | 'imp' | 'demon';
  x: number;
  z: number;
}

export interface DoomMapItem {
  type: 'medikit' | 'stimpack' | 'armor' | 'shotgun' | 'ammo_clip' | 'ammo_box' | 'blue_key' | 'barrel';
  x: number;
  z: number;
}

export interface DoomMapSecret {
  x: number;
  z: number;
  found: boolean;
}

export interface DoomMapDefinition {
  id: string;
  name: string;
  parTime: number; // Seconds
  playerStart: { x: number; z: number; angle: number };
  gridWidth: number;
  gridHeight: number;
  // Cell values:
  // 0 = Empty floor
  // 1 = STARGR1 Tech Wall
  // 2 = BROWN1 Brick Wall
  // 3 = BLAST SLIDING DOOR (Opens on Space, E, F, Click or Walk into it)
  // 4 = COMPUTE Tech Terminal
  // 5 = EXIT DOOR
  // 6 = BLUE KEYCARD DOOR
  // 8 = NUKAGE PIT (deals 5% damage per sec)
  // 9 = SECRET PUSH WALL
  layout: number[][];
  monsters: DoomMapMonster[];
  items: DoomMapItem[];
  secrets: DoomMapSecret[];
}

export const DOOM_MAPS: Record<string, DoomMapDefinition> = {
  e1m1: {
    id: 'e1m1',
    name: 'E1M1: HANGAR',
    parTime: 30, // Official par time: 30s
    playerStart: { x: 2.5, z: 2.5, angle: -Math.PI / 2 },
    gridWidth: 24,
    gridHeight: 24,
    // prettier-ignore
    layout: [
      // 0  1  2  3  4  5  6  7  8  9 10 11 12 13 14 15 16 17 18 19 20 21 22 23
      [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1 ], // 0
      [ 1, 0, 0, 0, 1, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1 ], // 1 Start room
      [ 1, 0, 0, 0, 3, 0, 0, 0, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1, 1, 1, 1, 1 ], // 2 Player start (2.5, 2.5)
      [ 1, 0, 0, 0, 1, 0, 0, 0, 1, 2, 0, 0, 0, 0, 0, 0, 0, 2, 1, 1, 1, 1, 1, 1 ], // 3
      [ 1, 1, 3, 1, 1, 0, 0, 0, 1, 2, 0, 8, 8, 8, 8, 8, 0, 2, 1, 1, 1, 1, 1, 1 ], // 4 Acid pool room
      [ 1, 0, 0, 0, 0, 0, 0, 0, 1, 2, 0, 8, 0, 0, 0, 8, 0, 2, 1, 1, 1, 1, 1, 1 ], // 5 Zig-zag catwalk
      [ 1, 0, 4, 4, 0, 0, 0, 0, 1, 2, 0, 8, 0, 8, 0, 8, 0, 2, 1, 1, 1, 1, 1, 1 ], // 6
      [ 1, 0, 4, 4, 0, 0, 0, 0, 1, 2, 0, 8, 8, 8, 0, 8, 0, 2, 1, 1, 1, 1, 1, 1 ], // 7
      [ 1, 1, 1, 1, 1, 0, 0, 0, 1, 2, 0, 0, 0, 0, 0, 0, 0, 2, 1, 1, 1, 1, 1, 1 ], // 8
      [ 1, 1, 1, 1, 1, 0, 0, 0, 6, 0, 0, 0, 0, 0, 0, 0, 0, 2, 1, 1, 1, 1, 1, 1 ], // 9 Blue key door to hallway
      [ 1, 1, 1, 1, 1, 1, 3, 1, 1, 2, 2, 2, 2, 0, 2, 2, 2, 2, 1, 1, 1, 1, 1, 1 ], // 10
      [ 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 2, 0, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1 ], // 11
      [ 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1 ], // 12 Long ascending hallway
      [ 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 2, 0, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1 ], // 13
      [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 0, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1 ], // 14
      [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 0, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1 ], // 15
      [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 0, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1 ], // 16
      [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 0, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1 ], // 17
      [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 0, 0, 0, 0, 0, 0, 0, 0, 2, 1, 1 ], // 18 Exit lobby
      [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 0, 4, 4, 0, 0, 4, 4, 0, 2, 1, 1 ], // 19 Terminal pedestals
      [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 0, 0, 0, 0, 5, 0, 0, 0, 2, 1, 1 ], // 20 5 = Exit Door!
      [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 0, 2, 2, 2, 2, 1, 1 ], // 21 Exit chamber
      [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 4, 2, 1, 1, 1, 1, 1 ], // 22 Switch room (4=switch)
      [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1 ], // 23
    ],
    monsters: [
      // Starting room / immediate corridor
      { type: 'zombie', x: 6.5, z: 2.5 },
      { type: 'zombie', x: 6.5, z: 6.5 },
      // Acid pool catwalk room
      { type: 'zombie', x: 14.5, z: 3.5 },
      { type: 'imp', x: 16.5, z: 6.5 },
      { type: 'imp', x: 11.5, z: 7.5 },
      // Hallway
      { type: 'zombie', x: 13.5, z: 12.5 },
      { type: 'zombie', x: 7.5, z: 12.5 },
      { type: 'imp', x: 13.5, z: 15.5 },
      // Exit lobby
      { type: 'demon', x: 17.5, z: 18.5 },
      { type: 'imp', x: 14.5, z: 19.5 },
      { type: 'imp', x: 19.5, z: 19.5 },
    ],
    items: [
      // Starting room items
      { type: 'stimpack', x: 2.5, z: 6.5 },
      { type: 'ammo_clip', x: 3.5, z: 6.5 },
      // Acid room: Shotgun + Armor in secret center
      { type: 'shotgun', x: 6.5, z: 4.5 },
      { type: 'armor', x: 14.5, z: 5.5 },
      { type: 'ammo_box', x: 16.5, z: 3.5 },
      { type: 'barrel', x: 11.5, z: 3.5 },
      { type: 'barrel', x: 17.5, z: 8.5 },
      // Blue keycard to unlock passage
      { type: 'blue_key', x: 16.5, z: 7.5 },
      // Hallway & Exit pickups
      { type: 'medikit', x: 9.5, z: 12.5 },
      { type: 'ammo_clip', x: 13.5, z: 14.0 },
      { type: 'barrel', x: 14.5, z: 17.5 },
      { type: 'medikit', x: 20.5, z: 18.5 },
    ],
    secrets: [
      { x: 14.5, z: 5.5, found: false }, // Catwalk green armor
    ]
  },

  e1m2: {
    id: 'e1m2',
    name: 'E1M2: NUCLEAR PLANT',
    parTime: 45,
    playerStart: { x: 2.5, z: 2.5, angle: -Math.PI / 2 },
    gridWidth: 20,
    gridHeight: 20,
    layout: [
      [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1 ],
      [ 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1 ],
      [ 1, 0, 0, 0, 3, 0, 0, 8, 8, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 1 ],
      [ 1, 0, 0, 0, 1, 0, 0, 8, 8, 0, 1, 0, 2, 2, 2, 2, 2, 0, 0, 1 ],
      [ 1, 1, 3, 1, 1, 0, 0, 0, 0, 0, 1, 0, 2, 0, 0, 0, 2, 0, 0, 1 ],
      [ 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 2, 0, 5, 0, 2, 0, 0, 1 ],
      [ 1, 0, 4, 4, 0, 0, 1, 1, 1, 0, 1, 0, 2, 0, 4, 0, 2, 0, 0, 1 ],
      [ 1, 0, 4, 4, 0, 0, 1, 0, 0, 0, 1, 0, 2, 2, 2, 2, 2, 0, 0, 1 ],
      [ 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1 ],
      [ 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1 ],
      [ 1, 0, 2, 2, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1 ],
      [ 1, 0, 2, 8, 8, 8, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1 ],
      [ 1, 0, 2, 8, 0, 8, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1 ],
      [ 1, 0, 2, 8, 8, 8, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1 ],
      [ 1, 0, 2, 2, 2, 2, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1 ],
      [ 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1 ],
      [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1 ],
      [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1 ],
      [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1 ],
      [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1 ],
    ],
    monsters: [
      { type: 'zombie', x: 5.5, z: 2.5 },
      { type: 'zombie', x: 8.5, z: 5.5 },
      { type: 'imp', x: 14.5, z: 2.5 },
      { type: 'imp', x: 15.5, z: 7.5 },
      { type: 'demon', x: 5.5, z: 12.5 },
      { type: 'demon', x: 13.5, z: 5.5 },
    ],
    items: [
      { type: 'shotgun', x: 3.5, z: 4.5 },
      { type: 'medikit', x: 14.5, z: 3.5 },
      { type: 'armor', x: 4.5, z: 12.5 },
      { type: 'ammo_box', x: 9.5, z: 2.5 },
      { type: 'barrel', x: 7.5, z: 4.5 },
    ],
    secrets: [
      { x: 4.5, z: 12.5, found: false }
    ]
  },

  e1m3: {
    id: 'e1m3',
    name: 'E1M3: TOXIN REFINERY',
    parTime: 60,
    playerStart: { x: 2.5, z: 2.5, angle: -Math.PI / 2 },
    gridWidth: 20,
    gridHeight: 20,
    layout: [
      [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1 ],
      [ 1, 0, 0, 0, 1, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 1, 0, 0, 0, 1 ],
      [ 1, 0, 0, 0, 3, 8, 0, 0, 0, 0, 0, 0, 0, 0, 8, 3, 0, 0, 0, 1 ],
      [ 1, 0, 0, 0, 1, 8, 0, 2, 2, 2, 2, 2, 2, 0, 8, 1, 0, 5, 0, 1 ],
      [ 1, 1, 3, 1, 1, 8, 0, 2, 0, 0, 0, 0, 2, 0, 8, 1, 0, 4, 0, 1 ],
      [ 1, 0, 0, 0, 0, 8, 0, 2, 0, 0, 0, 0, 2, 0, 8, 1, 1, 1, 1, 1 ],
      [ 1, 0, 4, 4, 0, 8, 0, 2, 2, 0, 0, 2, 2, 0, 8, 0, 0, 0, 0, 1 ],
      [ 1, 0, 4, 4, 0, 8, 0, 0, 0, 0, 0, 0, 0, 0, 8, 0, 0, 0, 0, 1 ],
      [ 1, 1, 1, 1, 1, 8, 8, 8, 8, 0, 0, 8, 8, 8, 8, 0, 0, 0, 0, 1 ],
      [ 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1 ],
      [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1 ],
      [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1 ],
      [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1 ],
      [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1 ],
      [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1 ],
      [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1 ],
      [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1 ],
      [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1 ],
      [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1 ],
      [ 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1 ],
    ],
    monsters: [
      { type: 'zombie', x: 3.5, z: 6.5 },
      { type: 'imp', x: 8.5, z: 2.5 },
      { type: 'imp', x: 12.5, z: 2.5 },
      { type: 'demon', x: 9.5, z: 4.5 },
      { type: 'demon', x: 10.5, z: 4.5 },
      { type: 'imp', x: 17.5, z: 3.5 },
    ],
    items: [
      { type: 'shotgun', x: 3.5, z: 3.5 },
      { type: 'medikit', x: 9.5, z: 3.5 },
      { type: 'armor', x: 10.5, z: 3.5 },
      { type: 'ammo_box', x: 17.5, z: 4.5 },
      { type: 'barrel', x: 6.5, z: 2.5 },
      { type: 'barrel', x: 14.5, z: 2.5 },
    ],
    secrets: [
      { x: 10.5, z: 3.5, found: false }
    ]
  }
};
