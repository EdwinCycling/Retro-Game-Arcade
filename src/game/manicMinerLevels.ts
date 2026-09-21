/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 20 Authentic Sinclair ZX Spectrum Caverns for Manic Miner (Matthew Smith 1983)
 */

export const ZX_WIDTH = 256;
export const ZX_HEIGHT = 192;
export const TILE_SIZE = 8;
export const GRID_COLS = 32;
export const GRID_ROWS = 16; // 16 rows of 8px = 128px playfield; bottom 64px is status & air gauge

export interface GuardianDef {
  id: string;
  type: 'robot' | 'spider' | 'toilet' | 'penguin' | 'phone' | 'kong' | 'amoeba' | 'skylab' | 'barrel' | 'laser';
  name: string;
  startX: number; // in pixels
  startY: number;
  minX?: number;
  maxX?: number;
  minY?: number;
  maxY?: number;
  speed: number;
  direction: number; // 1 for right/down, -1 for left/up
  color: string; // Spectrum ink
  frames: number;
  isSpecial?: boolean;
}

export interface CavernDef {
  id: number;
  name: string;
  willyStartX: number;
  willyStartY: number;
  willyStartFacing: 1 | -1;
  portalX: number;
  portalY: number;
  inkColor: string; // foreground
  paperColor: string; // background
  borderFlash: string;
  layout: string[]; // 16 lines of 32 characters
  guardians: GuardianDef[];
  air: number; // Oxygen level (starts at ~35-40 seconds)
  specialMechanism?: 'kong_lever' | 'solar_ray' | 'skylab_debris';
}

/**
 * Tile characters:
 * ' ' = Air
 * '#' = Solid wall/floor (indestructible)
 * '=' = Crumbly floor (breaks down on contact)
 * '<' = Conveyor belt (moves left)
 * '>' = Conveyor belt (moves right)
 * '^' = Spikes / Fire / Lethal Stalagmite
 * 'v' = Stalactite / Overhead hazard
 * '*' = Flashing key / collectible item
 * 'D' = Exit Portal Door
 * 'L' = Switch / Lever
 */
export const MANIC_MINER_CAVERNS: CavernDef[] = [
  // 1. Central Cavern
  {
    id: 1,
    name: 'Central Cavern',
    willyStartX: 24,
    willyStartY: 104,
    willyStartFacing: 1,
    portalX: 232,
    portalY: 104,
    inkColor: '#ffffff',
    paperColor: '#000000',
    borderFlash: '#0000d7',
    air: 36,
    layout: [
      '################################',
      '#                              #',
      '#  *                           #',
      '#######                        #',
      '#                              #',
      '#         ====                 #',
      '#             *                #',
      '#          #######             #',
      '#                              #',
      '#    <<<<<<<<<    >>>>>>       #',
      '#                             *#',
      '#   *          ^^^^^^^   #######',
      '# #######     #########        #',
      '#                              #',
      '#                              D',
      '################################'
    ],
    guardians: [
      {
        id: 'c1_robot',
        type: 'robot',
        name: 'Mining Droid',
        startX: 110,
        startY: 104,
        minX: 70,
        maxX: 200,
        speed: 38,
        direction: 1,
        color: '#ffdd00',
        frames: 4
      },
      {
        id: 'c1_spider',
        type: 'spider',
        name: 'Cave Spider',
        startX: 32,
        startY: 32,
        minY: 16,
        maxY: 72,
        speed: 28,
        direction: 1,
        color: '#ff2222',
        frames: 2
      }
    ]
  },

  // 2. The Cold Room
  {
    id: 2,
    name: 'The Cold Room',
    willyStartX: 16,
    willyStartY: 104,
    willyStartFacing: 1,
    portalX: 232,
    portalY: 24,
    inkColor: '#00ffff',
    paperColor: '#000000',
    borderFlash: '#00ffff',
    air: 38,
    layout: [
      '################################',
      '#v v v v v v v v v v v v v v   D',
      '#                            ###',
      '#   *                          #',
      '#  ===                         #',
      '#        *                     #',
      '#       ===                    #',
      '#              *               #',
      '#             ===              #',
      '#    <<<<<          >>>>>      #',
      '#                              #',
      '#  *       ^^^^^^^^^^^         #',
      '# ===     #############        #',
      '#                              #',
      '#                              #',
      '################################'
    ],
    guardians: [
      {
        id: 'c2_penguin_1',
        type: 'penguin',
        name: 'Chilly Penguin',
        startX: 80,
        startY: 104,
        minX: 60,
        maxX: 220,
        speed: 45,
        direction: 1,
        color: '#ffffff',
        frames: 4
      },
      {
        id: 'c2_penguin_2',
        type: 'penguin',
        name: 'Fast Penguin',
        startX: 180,
        startY: 56,
        minX: 100,
        maxX: 210,
        speed: 55,
        direction: -1,
        color: '#00ffff',
        frames: 4
      }
    ]
  },

  // 3. The Menagerie
  {
    id: 3,
    name: 'The Menagerie',
    willyStartX: 24,
    willyStartY: 24,
    willyStartFacing: 1,
    portalX: 232,
    portalY: 104,
    inkColor: '#00ff00',
    paperColor: '#000000',
    borderFlash: '#00ff00',
    air: 35,
    layout: [
      '################################',
      '#                              #',
      '#                              #',
      '######   *   ====   *   ########',
      '#     ######      ######       #',
      '#                              #',
      '#    >>>>>>        <<<<<<      #',
      '#                              #',
      '#       *            *         #',
      '#      ===          ===        #',
      '#                              #',
      '#  *       ^^^^^^^^            #',
      '######    ##########    ########',
      '#                              #',
      '#                              D',
      '################################'
    ],
    guardians: [
      {
        id: 'c3_ostrich_1',
        type: 'robot',
        name: 'Crazy Ostrich',
        startX: 40,
        startY: 80,
        minX: 30,
        maxX: 210,
        speed: 44,
        direction: 1,
        color: '#ff55ff',
        frames: 4
      },
      {
        id: 'c3_spider',
        type: 'spider',
        name: 'Giant Spider',
        startX: 160,
        startY: 20,
        minY: 16,
        maxY: 75,
        speed: 35,
        direction: 1,
        color: '#ffff00',
        frames: 2
      }
    ]
  },

  // 4. Abandoned Uranium Workings
  {
    id: 4,
    name: 'Abandoned Uranium Workings',
    willyStartX: 24,
    willyStartY: 104,
    willyStartFacing: 1,
    portalX: 232,
    portalY: 104,
    inkColor: '#ffff00',
    paperColor: '#000000',
    borderFlash: '#d700d7',
    air: 34,
    layout: [
      '################################',
      '#   v   v   v   v   v   v      #',
      '#                              #',
      '#   *          *               #',
      '#  ===        ===              #',
      '#                              #',
      '#       <<<<<<<<<<<<<<         #',
      '#                              #',
      '#   *                  *       #',
      '#  ###                ###      #',
      '#                              #',
      '#         ^^^^^^^^             #',
      '#       ############           #',
      '#                              #',
      '#                              D',
      '################################'
    ],
    guardians: [
      {
        id: 'c4_phone_1',
        type: 'phone',
        name: 'Radiation Droid',
        startX: 80,
        startY: 40,
        minX: 60,
        maxX: 180,
        speed: 48,
        direction: 1,
        color: '#00ff00',
        frames: 4
      },
      {
        id: 'c4_phone_2',
        type: 'phone',
        name: 'Mutant Phone',
        startX: 140,
        startY: 104,
        minX: 80,
        maxX: 210,
        speed: 52,
        direction: -1,
        color: '#ff2222',
        frames: 4
      }
    ]
  },

  // 5. Eugene's Lair (Iconic toilet seat boss!)
  {
    id: 5,
    name: "Eugene's Lair",
    willyStartX: 16,
    willyStartY: 104,
    willyStartFacing: 1,
    portalX: 232,
    portalY: 104,
    inkColor: '#ff55ff',
    paperColor: '#000000',
    borderFlash: '#ff55ff',
    air: 37,
    layout: [
      '################################',
      '#  *   *   *   *   *   *   *   #',
      '# ============================ #',
      '#                              #',
      '#                              #',
      '#   <<<<<<<<        >>>>>>>>   #',
      '#                              #',
      '#     *                  *     #',
      '#    ###                ###    #',
      '#                              #',
      '#       *              *       #',
      '#      ===            ===      #',
      '#                              #',
      '#           ^^^^^^^^           #',
      '#          ##########          D',
      '################################'
    ],
    guardians: [
      {
        id: 'eugene_boss',
        type: 'toilet',
        name: 'Eugene',
        startX: 124,
        startY: 24,
        minY: 20,
        maxY: 96,
        speed: 60,
        direction: 1,
        color: '#ffdd00',
        frames: 4,
        isSpecial: true
      }
    ]
  },

  // 6. Processing Plant
  {
    id: 6,
    name: 'Processing Plant',
    willyStartX: 24,
    willyStartY: 24,
    willyStartFacing: 1,
    portalX: 232,
    portalY: 104,
    inkColor: '#00d700',
    paperColor: '#000000',
    borderFlash: '#00d700',
    air: 36,
    layout: [
      '################################',
      '#                              #',
      '#  *                           #',
      '######   >>>>>>>>>>>>>>   ######',
      '#                              #',
      '#       *              *       #',
      '#      ===            ===      #',
      '#                              #',
      '#   <<<<<<<<<<<<<<<<<<<<<<     #',
      '#                              #',
      '#     *                  *     #',
      '#    ###                ###    #',
      '#                              #',
      '#          ^^^^^^^^^^          #',
      '#         ############         D',
      '################################'
    ],
    guardians: [
      {
        id: 'c6_robot_1',
        type: 'robot',
        name: 'Piston Bot',
        startX: 50,
        startY: 64,
        minX: 40,
        maxX: 190,
        speed: 46,
        direction: 1,
        color: '#ff2222',
        frames: 4
      },
      {
        id: 'c6_spider',
        type: 'spider',
        name: 'Vat Crawler',
        startX: 120,
        startY: 16,
        minY: 16,
        maxY: 75,
        speed: 30,
        direction: 1,
        color: '#00ffff',
        frames: 2
      }
    ]
  },

  // 7. The Vat
  {
    id: 7,
    name: 'The Vat',
    willyStartX: 16,
    willyStartY: 104,
    willyStartFacing: 1,
    portalX: 232,
    portalY: 24,
    inkColor: '#d7d700',
    paperColor: '#000000',
    borderFlash: '#d70000',
    air: 35,
    layout: [
      '################################',
      '#                              D',
      '#                            ###',
      '#     *        *               #',
      '#    ===      ===              #',
      '#                              #',
      '#          *        *          #',
      '#         ===      ===         #',
      '#                              #',
      '#    <<<<<<<<<    >>>>>>>>>    #',
      '#                              #',
      '#    ^^^^^^^^^^^^^^^^^^^^^^    #',
      '#   ########################   #',
      '#                              #',
      '#  *                           #',
      '################################'
    ],
    guardians: [
      {
        id: 'c7_amoeba_1',
        type: 'amoeba',
        name: 'Slime Glob',
        startX: 60,
        startY: 40,
        minX: 40,
        maxX: 210,
        speed: 40,
        direction: 1,
        color: '#00ff00',
        frames: 4
      },
      {
        id: 'c7_amoeba_2',
        type: 'amoeba',
        name: 'Acid Droplet',
        startX: 170,
        startY: 64,
        minX: 80,
        maxX: 220,
        speed: 50,
        direction: -1,
        color: '#ff00ff',
        frames: 4
      }
    ]
  },

  // 8. Miner Willy meets the Kong Beast
  {
    id: 8,
    name: 'Miner Willy meets the Kong Beast',
    willyStartX: 16,
    willyStartY: 104,
    willyStartFacing: 1,
    portalX: 232,
    portalY: 104,
    inkColor: '#ff2222',
    paperColor: '#000000',
    borderFlash: '#ff2222',
    air: 40,
    specialMechanism: 'kong_lever',
    layout: [
      '################################',
      '#                    *         #',
      '#                   ###        #',
      '#   *                          #',
      '#  ===                         #',
      '#         *        *           #',
      '#        ===      ===          #',
      '#                              #',
      '#   >>>>>>>>>>>>>>    <<<<<<   #',
      '#                              #',
      '#     *                  *   L #',
      '#    ###                ###### #',
      '#                              #',
      '#          ^^^^^^^^^^          #',
      '#         ############         D',
      '################################'
    ],
    guardians: [
      {
        id: 'kong_beast_1',
        type: 'kong',
        name: 'Alien Kong',
        startX: 180,
        startY: 16,
        speed: 0,
        direction: 1,
        color: '#ff8800',
        frames: 2,
        isSpecial: true
      },
      {
        id: 'c8_barrel_1',
        type: 'barrel',
        name: 'Rolling Boulder',
        startX: 170,
        startY: 56,
        minX: 40,
        maxX: 190,
        speed: 45,
        direction: -1,
        color: '#ffff00',
        frames: 4
      }
    ]
  },

  // 9. Wacky Amoebatrons
  {
    id: 9,
    name: 'Wacky Amoebatrons',
    willyStartX: 16,
    willyStartY: 24,
    willyStartFacing: 1,
    portalX: 232,
    portalY: 104,
    inkColor: '#00ffff',
    paperColor: '#000000',
    borderFlash: '#0000d7',
    air: 35,
    layout: [
      '################################',
      '#                              #',
      '#  *                           #',
      '######   ====   ====   #########',
      '#                              #',
      '#       *          *           #',
      '#      ===        ===          #',
      '#                              #',
      '#   <<<<<<<<<  >>>>>>>>>       #',
      '#                              #',
      '#     *              *         #',
      '#    ###            ###        #',
      '#                              #',
      '#          ^^^^^^^^            #',
      '#         ##########           D',
      '################################'
    ],
    guardians: [
      {
        id: 'c9_amoeba_1',
        type: 'amoeba',
        name: 'Amoebatron Alpha',
        startX: 50,
        startY: 64,
        minX: 30,
        maxX: 210,
        speed: 55,
        direction: 1,
        color: '#00ffff',
        frames: 4
      },
      {
        id: 'c9_amoeba_2',
        type: 'amoeba',
        name: 'Amoebatron Beta',
        startX: 180,
        startY: 104,
        minX: 50,
        maxX: 220,
        speed: 48,
        direction: -1,
        color: '#ff55ff',
        frames: 4
      }
    ]
  },

  // 10. The Endorian Forest
  {
    id: 10,
    name: 'The Endorian Forest',
    willyStartX: 16,
    willyStartY: 104,
    willyStartFacing: 1,
    portalX: 232,
    portalY: 104,
    inkColor: '#00d700',
    paperColor: '#000000',
    borderFlash: '#00d700',
    air: 38,
    layout: [
      '################################',
      '#    *        *        *       #',
      '#   ===      ===      ===      #',
      '#                              #',
      '#        *        *            #',
      '#       ###      ###           #',
      '#                              #',
      '#    >>>>>>>>  <<<<<<<<        #',
      '#                              #',
      '#      *            *          #',
      '#     ===          ===         #',
      '#                              #',
      '#          ^^^^^^^^            #',
      '#        ############          #',
      '#                              D',
      '################################'
    ],
    guardians: [
      {
        id: 'c10_spider_1',
        type: 'spider',
        name: 'Forest Spider',
        startX: 64,
        startY: 16,
        minY: 16,
        maxY: 75,
        speed: 32,
        direction: 1,
        color: '#ffff00',
        frames: 2
      },
      {
        id: 'c10_robot_1',
        type: 'robot',
        name: 'Tree Dweller',
        startX: 120,
        startY: 104,
        minX: 60,
        maxX: 210,
        speed: 42,
        direction: 1,
        color: '#ff00ff',
        frames: 4
      }
    ]
  },

  // 11. Attack of the Mutant Telephones
  {
    id: 11,
    name: 'Attack of the Mutant Telephones',
    willyStartX: 16,
    willyStartY: 24,
    willyStartFacing: 1,
    portalX: 232,
    portalY: 104,
    inkColor: '#ffff00',
    paperColor: '#000000',
    borderFlash: '#d70000',
    air: 36,
    layout: [
      '################################',
      '#                              #',
      '#  *                           #',
      '######   ====   ====   #########',
      '#                              #',
      '#       *          *           #',
      '#      ###        ###          #',
      '#                              #',
      '#   <<<<<<<<<  >>>>>>>>>       #',
      '#                              #',
      '#     *              *         #',
      '#    ===            ===        #',
      '#                              #',
      '#         ^^^^^^^^^^           #',
      '#        ############          D',
      '################################'
    ],
    guardians: [
      {
        id: 'c11_phone_1',
        type: 'phone',
        name: 'Ringing Phone',
        startX: 50,
        startY: 64,
        minX: 40,
        maxX: 190,
        speed: 55,
        direction: 1,
        color: '#ff2222',
        frames: 4
      },
      {
        id: 'c11_phone_2',
        type: 'phone',
        name: 'Rotary Dial Terror',
        startX: 180,
        startY: 104,
        minX: 60,
        maxX: 220,
        speed: 58,
        direction: -1,
        color: '#ffff00',
        frames: 4
      }
    ]
  },

  // 12. Return of the Alien Kong Beast
  {
    id: 12,
    name: 'Return of the Alien Kong Beast',
    willyStartX: 16,
    willyStartY: 104,
    willyStartFacing: 1,
    portalX: 232,
    portalY: 24,
    inkColor: '#ff55ff',
    paperColor: '#000000',
    borderFlash: '#ff55ff',
    air: 40,
    specialMechanism: 'kong_lever',
    layout: [
      '################################',
      '#                              D',
      '#                            ###',
      '#   *                    *     #',
      '#  ===                  ===    #',
      '#                              #',
      '#         *        *           #',
      '#        ###      ###          #',
      '#                              #',
      '#   >>>>>>>>>>>>>>    <<<<<< L #',
      '#                            ###',
      '#     *                  *     #',
      '#    ###                ###    #',
      '#                              #',
      '#          ^^^^^^^^^^          #',
      '################################'
    ],
    guardians: [
      {
        id: 'kong_beast_2',
        type: 'kong',
        name: 'Vengeful Kong',
        startX: 180,
        startY: 16,
        speed: 0,
        direction: 1,
        color: '#ff0000',
        frames: 2,
        isSpecial: true
      },
      {
        id: 'c12_barrel',
        type: 'barrel',
        name: 'Magma Rock',
        startX: 160,
        startY: 56,
        minX: 40,
        maxX: 190,
        speed: 50,
        direction: -1,
        color: '#ffdd00',
        frames: 4
      }
    ]
  },

  // 13. Ore Refinery
  {
    id: 13,
    name: 'Ore Refinery',
    willyStartX: 16,
    willyStartY: 104,
    willyStartFacing: 1,
    portalX: 232,
    portalY: 104,
    inkColor: '#ffffff',
    paperColor: '#000000',
    borderFlash: '#ffffff',
    air: 35,
    layout: [
      '################################',
      '#  *       *        *       *  #',
      '# ===     ===      ===     === #',
      '#                              #',
      '#   <<<<<<<<<<<<<<<<<<<<<<<<   #',
      '#                              #',
      '#     *                  *     #',
      '#    ###                ###    #',
      '#                              #',
      '#   >>>>>>>>>>>>>>>>>>>>>>>>   #',
      '#                              #',
      '#         ^^^^^^^^^^^^         #',
      '#        ##############        #',
      '#                              #',
      '#                              D',
      '################################'
    ],
    guardians: [
      {
        id: 'c13_robot_1',
        type: 'robot',
        name: 'Smelter Bot',
        startX: 50,
        startY: 64,
        minX: 40,
        maxX: 210,
        speed: 52,
        direction: 1,
        color: '#ff5555',
        frames: 4
      },
      {
        id: 'c13_robot_2',
        type: 'robot',
        name: 'Refinery Drone',
        startX: 170,
        startY: 104,
        minX: 60,
        maxX: 210,
        speed: 48,
        direction: -1,
        color: '#55ffff',
        frames: 4
      }
    ]
  },

  // 14. Skylab Landing Bay
  {
    id: 14,
    name: 'Skylab Landing Bay',
    willyStartX: 16,
    willyStartY: 104,
    willyStartFacing: 1,
    portalX: 232,
    portalY: 104,
    inkColor: '#00d7d7',
    paperColor: '#000000',
    borderFlash: '#0000d7',
    air: 37,
    specialMechanism: 'skylab_debris',
    layout: [
      '################################',
      '#  *                        *  #',
      '# ===                      === #',
      '#                              #',
      '#   >>>>>>>>>>>>>>>>>>>>>>>>   #',
      '#                              #',
      '#       *              *       #',
      '#      ===            ===      #',
      '#                              #',
      '#   <<<<<<<<<<<<<<<<<<<<<<<<   #',
      '#                              #',
      '#        ^^^^^^^^^^^^^^        #',
      '#       ################       #',
      '#                              #',
      '#                              D',
      '################################'
    ],
    guardians: [
      {
        id: 'c14_skylab_1',
        type: 'skylab',
        name: 'Orbiting Debris',
        startX: 70,
        startY: 16,
        minY: 16,
        maxY: 104,
        speed: 45,
        direction: 1,
        color: '#ffff00',
        frames: 4
      },
      {
        id: 'c14_skylab_2',
        type: 'skylab',
        name: 'Skylab Module',
        startX: 170,
        startY: 32,
        minY: 16,
        maxY: 104,
        speed: 55,
        direction: 1,
        color: '#00ffff',
        frames: 4
      }
    ]
  },

  // 15. The Bank
  {
    id: 15,
    name: 'The Bank',
    willyStartX: 16,
    willyStartY: 24,
    willyStartFacing: 1,
    portalX: 232,
    portalY: 104,
    inkColor: '#ffff00',
    paperColor: '#000000',
    borderFlash: '#ffff00',
    air: 36,
    layout: [
      '################################',
      '#                              #',
      '#  *                           #',
      '######   ====   ====   #########',
      '#                              #',
      '#      *            *          #',
      '#     ###          ###         #',
      '#                              #',
      '#   <<<<<<<<    >>>>>>>>       #',
      '#                              #',
      '#    *                *        #',
      '#   ===              ===       #',
      '#                              #',
      '#         ^^^^^^^^^^           #',
      '#        ############          D',
      '################################'
    ],
    guardians: [
      {
        id: 'c15_toilet_1',
        type: 'toilet',
        name: 'Bank Guard',
        startX: 60,
        startY: 64,
        minX: 40,
        maxX: 190,
        speed: 50,
        direction: 1,
        color: '#ffffff',
        frames: 4
      },
      {
        id: 'c15_phone',
        type: 'phone',
        name: 'Vault Alarm',
        startX: 160,
        startY: 104,
        minX: 50,
        maxX: 210,
        speed: 56,
        direction: -1,
        color: '#ff2222',
        frames: 4
      }
    ]
  },

  // 16. The Sixteenth Cavern
  {
    id: 16,
    name: 'The Sixteenth Cavern',
    willyStartX: 16,
    willyStartY: 104,
    willyStartFacing: 1,
    portalX: 232,
    portalY: 24,
    inkColor: '#ff2222',
    paperColor: '#000000',
    borderFlash: '#ff2222',
    air: 34,
    layout: [
      '################################',
      '#                              D',
      '#                            ###',
      '#   *          *               #',
      '#  ===        ===              #',
      '#                              #',
      '#       *              *       #',
      '#      ===            ===      #',
      '#                              #',
      '#   <<<<<<<<<      >>>>>>>>>   #',
      '#                              #',
      '#   ^^^^^^^^^^^^^^^^^^^^^^^^   #',
      '#  ##########################  #',
      '#                              #',
      '#  *                           #',
      '################################'
    ],
    guardians: [
      {
        id: 'c16_spider_1',
        type: 'spider',
        name: 'Death Spider',
        startX: 80,
        startY: 16,
        minY: 16,
        maxY: 75,
        speed: 38,
        direction: 1,
        color: '#ffffff',
        frames: 2
      },
      {
        id: 'c16_robot',
        type: 'robot',
        name: 'Precision Sentry',
        startX: 140,
        startY: 64,
        minX: 60,
        maxX: 210,
        speed: 60,
        direction: 1,
        color: '#ffff00',
        frames: 4
      }
    ]
  },

  // 17. The Warehouse
  {
    id: 17,
    name: 'The Warehouse',
    willyStartX: 16,
    willyStartY: 24,
    willyStartFacing: 1,
    portalX: 232,
    portalY: 104,
    inkColor: '#00ff00',
    paperColor: '#000000',
    borderFlash: '#00ff00',
    air: 36,
    layout: [
      '################################',
      '#                              #',
      '#  *                           #',
      '######   >>>>>>>>>>>>   ########',
      '#                              #',
      '#       *          *           #',
      '#      ===        ===          #',
      '#                              #',
      '#   <<<<<<<<<<<<<<<<<<<<       #',
      '#                              #',
      '#     *              *         #',
      '#    ###            ###        #',
      '#                              #',
      '#         ^^^^^^^^^^           #',
      '#        ############          D',
      '################################'
    ],
    guardians: [
      {
        id: 'c17_barrel_1',
        type: 'barrel',
        name: 'Dancing Crate',
        startX: 50,
        startY: 64,
        minX: 40,
        maxX: 190,
        speed: 52,
        direction: 1,
        color: '#ffdd00',
        frames: 4
      },
      {
        id: 'c17_robot',
        type: 'robot',
        name: 'Forklift Sentry',
        startX: 160,
        startY: 104,
        minX: 60,
        maxX: 210,
        speed: 50,
        direction: -1,
        color: '#00ffff',
        frames: 4
      }
    ]
  },

  // 18. Amoebatrons' Revenge
  {
    id: 18,
    name: "Amoebatrons' Revenge",
    willyStartX: 16,
    willyStartY: 104,
    willyStartFacing: 1,
    portalX: 232,
    portalY: 104,
    inkColor: '#ff55ff',
    paperColor: '#000000',
    borderFlash: '#ff55ff',
    air: 35,
    layout: [
      '################################',
      '#    *        *        *       #',
      '#   ===      ===      ===      #',
      '#                              #',
      '#   >>>>>>>>  <<<<<<<<         #',
      '#                              #',
      '#        *        *            #',
      '#       ###      ###           #',
      '#                              #',
      '#    <<<<<<<<  >>>>>>>>        #',
      '#                              #',
      '#          ^^^^^^^^            #',
      '#        ############          #',
      '#                              #',
      '#                              D',
      '################################'
    ],
    guardians: [
      {
        id: 'c18_amoeba_1',
        type: 'amoeba',
        name: 'Hyper Amoeba',
        startX: 60,
        startY: 32,
        minX: 40,
        maxX: 210,
        speed: 65,
        direction: 1,
        color: '#ff0055',
        frames: 4
      },
      {
        id: 'c18_amoeba_2',
        type: 'amoeba',
        name: 'Super Amoeba',
        startX: 170,
        startY: 72,
        minX: 60,
        maxX: 210,
        speed: 62,
        direction: -1,
        color: '#ffff00',
        frames: 4
      }
    ]
  },

  // 19. Solar Power Generator (Solar Ray Beam!)
  {
    id: 19,
    name: 'Solar Power Generator',
    willyStartX: 16,
    willyStartY: 104,
    willyStartFacing: 1,
    portalX: 232,
    portalY: 24,
    inkColor: '#ffff00',
    paperColor: '#000000',
    borderFlash: '#ffff00',
    air: 38,
    specialMechanism: 'solar_ray',
    layout: [
      '################################',
      '#                              D',
      '#                            ###',
      '#   *          *               #',
      '#  ===        ===              #',
      '#                              #',
      '#       *              *       #',
      '#      ===            ===      #',
      '#                              #',
      '#   <<<<<<<<<      >>>>>>>>>   #',
      '#                              #',
      '#   ^^^^^^^^^^^^^^^^^^^^^^^^   #',
      '#  ##########################  #',
      '#                              #',
      '#  *                           #',
      '################################'
    ],
    guardians: [
      {
        id: 'solar_laser',
        type: 'laser',
        name: 'Solar Ray Beam',
        startX: 128,
        startY: 16,
        minX: 40,
        maxX: 220,
        speed: 70,
        direction: 1,
        color: '#ffffff',
        frames: 1,
        isSpecial: true
      },
      {
        id: 'c19_robot',
        type: 'robot',
        name: 'Solar Drone',
        startX: 80,
        startY: 64,
        minX: 40,
        maxX: 200,
        speed: 55,
        direction: 1,
        color: '#ff2222',
        frames: 4
      }
    ]
  },

  // 20. The Final Barrier
  {
    id: 20,
    name: 'The Final Barrier',
    willyStartX: 16,
    willyStartY: 104,
    willyStartFacing: 1,
    portalX: 232,
    portalY: 104,
    inkColor: '#ffffff',
    paperColor: '#000000',
    borderFlash: '#ff0000',
    air: 42,
    layout: [
      '################################',
      '#  *   *   *   *   *   *   *   #',
      '# ============================ #',
      '#                              #',
      '#   <<<<<<<<        >>>>>>>>   #',
      '#                              #',
      '#     *                  *     #',
      '#    ###                ###    #',
      '#                              #',
      '#   >>>>>>>>        <<<<<<<<   #',
      '#                              #',
      '#       *              *       #',
      '#      ===            ===      #',
      '#                              #',
      '#           ^^^^^^^^           #',
      '#          ##########          D'
    ],
    guardians: [
      {
        id: 'c20_guard_1',
        type: 'phone',
        name: 'Master Guardian',
        startX: 50,
        startY: 32,
        minX: 30,
        maxX: 220,
        speed: 68,
        direction: 1,
        color: '#ff0000',
        frames: 4
      },
      {
        id: 'c20_guard_2',
        type: 'spider',
        name: 'Sentinel Spider',
        startX: 128,
        startY: 16,
        minY: 16,
        maxY: 80,
        speed: 45,
        direction: 1,
        color: '#ffff00',
        frames: 2
      },
      {
        id: 'c20_guard_3',
        type: 'toilet',
        name: 'Final Toilet Stomper',
        startX: 170,
        startY: 80,
        minX: 60,
        maxX: 210,
        speed: 64,
        direction: -1,
        color: '#00ffff',
        frames: 4
      }
    ]
  }
];
