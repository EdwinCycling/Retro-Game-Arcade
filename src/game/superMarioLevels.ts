/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Super Mario Bros. (1985 NES) - Multi-World Level Definitions & Enemy Specifications
 */

export type MarioWorldTheme = 'overworld' | 'underground' | 'athletic' | 'castle' | 'underwater';

export interface PipeWarp {
  col: number;
  row: number;
  type: 'down' | 'right';
  targetWorld: string;
  targetCol: number;
  targetRow: number;
  isSecretRoom?: boolean;
}

export interface EnemyDef {
  type: 'goomba' | 'koopa' | 'red_koopa' | 'paratroopa' | 'piranha' | 'buzzy' | 'spiny' | 'lakitu' | 'cheep' | 'blooper' | 'podoboo' | 'bowser';
  col: number;
  row: number;
  vx?: number;
  isFlying?: boolean;
}

export interface FirebarDef {
  col: number;
  row: number;
  length: number;
  speed: number;
  initialAngle?: number;
}

export interface LevelDefinition {
  world: string; // e.g. "1-1", "1-2", "1-3", "1-4", "2-1", "2-2", "2-3", "2-4"
  name: string;
  theme: MarioWorldTheme;
  timeLimit: number;
  widthCols: number;
  skyColor: string;
  groundTileColor: string;
  groundTopColor: string;
  brickColor: string;
  questionColor: string;
  pipeColor: string;
  hasWaterPhysics?: boolean;
  isCastleBoss?: boolean;
  bossType?: 'bowser';
  bossCol?: number;
  axeCol?: number;
  rescuedNpc?: 'toad' | 'peach';
  warps?: PipeWarp[];
  firebars?: FirebarDef[];
  buildMap: (tiles: number[][], placePipe: (col: number, height: number, hasPiranha?: boolean) => void, placeStairs: (startCol: number, height: number, ascending: boolean) => void, placeCastle: (col: number) => void) => void;
  enemies: EnemyDef[];
}

// Block / Tile Constants matching engine
export const TILE_EMPTY = 0;
export const TILE_GROUND = 1;
export const TILE_BRICK = 2;
export const TILE_QUESTION_COIN = 3;
export const TILE_QUESTION_MUSHROOM = 4;
export const TILE_EMPTY_BLOCK = 5;
export const TILE_PIPE_TOP_LEFT = 6;
export const TILE_PIPE_TOP_RIGHT = 7;
export const TILE_PIPE_BODY_LEFT = 8;
export const TILE_PIPE_BODY_RIGHT = 9;
export const TILE_STAIR_STONE = 10;
export const TILE_FLAGPOLE = 11;
export const TILE_FLAGPOLE_TOP = 12;
export const TILE_CASTLE_BRICK = 13;
export const TILE_CASTLE_DOOR = 14;
export const TILE_QUESTION_FIRE = 15;
export const TILE_QUESTION_STAR = 16;
export const TILE_QUESTION_1UP = 17;
export const TILE_MULTI_COIN_BRICK = 18;
export const TILE_LAVA = 19;
export const TILE_BRIDGE = 20;
export const TILE_AXE = 21;
export const TILE_WATER_SURFACE = 22;
export const TILE_CORAL = 23;
export const TILE_WOOD_PLATFORM = 24;

export const SUPER_MARIO_LEVELS: LevelDefinition[] = [
  // ==========================================
  // WORLD 1-1: CLASSIC OVERWORLD
  // ==========================================
  {
    world: '1-1',
    name: 'World 1-1 (Grassland Odyssey)',
    theme: 'overworld',
    timeLimit: 400,
    widthCols: 215,
    skyColor: '#5c94fc',
    groundTileColor: '#d88b20',
    groundTopColor: '#00a800',
    brickColor: '#b84418',
    questionColor: '#fc9838',
    pipeColor: '#00a800',
    enemies: [
      { type: 'goomba', col: 22, row: 12 },
      { type: 'goomba', col: 40, row: 12 },
      { type: 'goomba', col: 51, row: 12 },
      { type: 'goomba', col: 53, row: 12 },
      { type: 'goomba', col: 80, row: 12 },
      { type: 'goomba', col: 82, row: 12 },
      { type: 'koopa', col: 107, row: 11 },
      { type: 'goomba', col: 114, row: 12 },
      { type: 'goomba', col: 116, row: 12 },
      { type: 'goomba', col: 124, row: 12 },
      { type: 'goomba', col: 126, row: 12 },
      { type: 'koopa', col: 140, row: 11 },
      { type: 'goomba', col: 174, row: 12 },
      { type: 'goomba', col: 176, row: 12 },
    ],
    buildMap: (tiles, placePipe, placeStairs, placeCastle) => {
      // Pits
      [[69, 71], [86, 88], [153, 155]].forEach(([start, end]) => {
        for (let c = start; c <= end; c++) {
          tiles[c][13] = TILE_EMPTY;
          tiles[c][14] = TILE_EMPTY;
        }
      });

      // Mystery & Brick Blocks
      tiles[16][9] = TILE_QUESTION_COIN;
      tiles[20][9] = TILE_BRICK;
      tiles[21][9] = TILE_QUESTION_MUSHROOM;
      tiles[22][9] = TILE_BRICK;
      tiles[23][9] = TILE_QUESTION_COIN;
      tiles[24][9] = TILE_BRICK;
      tiles[22][5] = TILE_QUESTION_COIN;

      // Pipes
      placePipe(28, 2);
      placePipe(38, 3, true);
      placePipe(46, 4, true);
      placePipe(57, 4, true);

      // Hidden 1-up block
      tiles[64][9] = TILE_QUESTION_1UP;

      // Bricks formation
      tiles[77][9] = TILE_BRICK;
      tiles[78][9] = TILE_QUESTION_STAR;
      tiles[79][9] = TILE_BRICK;
      for (let c = 80; c <= 87; c++) tiles[c][5] = TILE_BRICK;
      for (let c = 91; c <= 93; c++) tiles[c][5] = TILE_BRICK;
      tiles[94][5] = TILE_QUESTION_COIN;

      // Multi coin block
      tiles[101][9] = TILE_MULTI_COIN_BRICK;
      tiles[109][9] = TILE_QUESTION_FIRE;

      placePipe(163, 3, true);
      placePipe(179, 2);

      // Staircases
      placeStairs(134, 4, true);
      placeStairs(140, 4, false);
      placeStairs(148, 4, true);
      placeStairs(155, 4, false);
      placeStairs(181, 8, true);

      // Flagpole
      for (let r = 3; r <= 12; r++) tiles[198][r] = TILE_FLAGPOLE;
      tiles[198][2] = TILE_FLAGPOLE_TOP;
      tiles[198][13] = TILE_STAIR_STONE;

      placeCastle(202);
    }
  },

  // ==========================================
  // WORLD 1-2: UNDERGROUND SEWER & CAVERN
  // ==========================================
  {
    world: '1-2',
    name: 'World 1-2 (Underground Cavern)',
    theme: 'underground',
    timeLimit: 400,
    widthCols: 220,
    skyColor: '#000000',
    groundTileColor: '#0050b8',
    groundTopColor: '#0080f8',
    brickColor: '#0050b8',
    questionColor: '#fc9838',
    pipeColor: '#00a800',
    enemies: [
      { type: 'goomba', col: 18, row: 12 },
      { type: 'goomba', col: 20, row: 12 },
      { type: 'buzzy', col: 34, row: 12 },
      { type: 'koopa', col: 50, row: 12 },
      { type: 'goomba', col: 65, row: 12 },
      { type: 'goomba', col: 67, row: 12 },
      { type: 'buzzy', col: 85, row: 12 },
      { type: 'koopa', col: 104, row: 12 },
      { type: 'goomba', col: 118, row: 12 },
      { type: 'goomba', col: 120, row: 12 },
      { type: 'buzzy', col: 142, row: 12 },
      { type: 'koopa', col: 160, row: 12 },
    ],
    buildMap: (tiles, placePipe, placeStairs, placeCastle) => {
      // Solid subterranean ceiling along top 2 rows
      for (let c = 0; c < 200; c++) {
        tiles[c][0] = TILE_BRICK;
        tiles[c][1] = TILE_BRICK;
      }

      // Pits in underground
      [[88, 91], [128, 131], [168, 170]].forEach(([start, end]) => {
        for (let c = start; c <= end; c++) {
          tiles[c][13] = TILE_EMPTY;
          tiles[c][14] = TILE_EMPTY;
        }
      });

      // Entry intro pipe
      placePipe(10, 3, true);

      // Elevated brick walkways
      for (let c = 15; c <= 25; c++) tiles[c][9] = TILE_BRICK;
      tiles[20][9] = TILE_QUESTION_FIRE;
      tiles[22][9] = TILE_QUESTION_COIN;

      // Question blocks and multi coins
      for (let c = 38; c <= 48; c++) tiles[c][7] = TILE_BRICK;
      tiles[42][7] = TILE_MULTI_COIN_BRICK;
      tiles[44][7] = TILE_QUESTION_STAR;

      // Mid-level pipes
      placePipe(55, 3, true);
      placePipe(70, 4, true);
      placePipe(95, 2, true);
      placePipe(110, 3, true);

      // High overhead coin bonus bridge
      for (let c = 120; c <= 135; c++) {
        tiles[c][5] = TILE_BRICK;
        if (c % 2 === 0) tiles[c][4] = TILE_QUESTION_COIN;
      }

      // Elevators / Stair steps
      placeStairs(148, 5, true);
      placeStairs(156, 5, false);
      placeStairs(175, 7, true);

      // Exit pipe that shoots Mario up to surface flagpole
      placePipe(190, 6, false);

      // Surface area at end (col 196 to 215)
      for (let c = 196; c < 215; c++) {
        tiles[c][0] = TILE_EMPTY;
        tiles[c][1] = TILE_EMPTY;
      }

      // Flagpole at col 204
      for (let r = 3; r <= 12; r++) tiles[204][r] = TILE_FLAGPOLE;
      tiles[204][2] = TILE_FLAGPOLE_TOP;
      tiles[204][13] = TILE_STAIR_STONE;

      placeCastle(208);
    }
  },

  // ==========================================
  // WORLD 1-3: ATHLETIC CANOPY & TREETOP MUSHROOMS
  // ==========================================
  {
    world: '1-3',
    name: 'World 1-3 (Treetop Canopy & Floating Islands)',
    theme: 'athletic',
    timeLimit: 300,
    widthCols: 210,
    skyColor: '#5c94fc',
    groundTileColor: '#d88b20',
    groundTopColor: '#00a800',
    brickColor: '#b84418',
    questionColor: '#fc9838',
    pipeColor: '#00a800',
    enemies: [
      { type: 'paratroopa', col: 25, row: 6, isFlying: true },
      { type: 'red_koopa', col: 45, row: 8 },
      { type: 'paratroopa', col: 60, row: 5, isFlying: true },
      { type: 'goomba', col: 75, row: 9 },
      { type: 'red_koopa', col: 90, row: 6 },
      { type: 'paratroopa', col: 110, row: 4, isFlying: true },
      { type: 'red_koopa', col: 130, row: 7 },
      { type: 'paratroopa', col: 155, row: 5, isFlying: true },
      { type: 'koopa', col: 172, row: 10 },
    ],
    buildMap: (tiles, placePipe, placeStairs, placeCastle) => {
      // Extensive abyss gaps - mostly floating wooden & mushroom platforms!
      for (let c = 15; c < 180; c++) {
        tiles[c][13] = TILE_EMPTY;
        tiles[c][14] = TILE_EMPTY;
      }

      // Tree Trunk islands and wooden platforms
      const makePlatform = (startCol: number, len: number, row: number) => {
        for (let c = startCol; c < startCol + len; c++) {
          tiles[c][row] = TILE_WOOD_PLATFORM;
        }
      };

      makePlatform(18, 6, 10);
      tiles[21][6] = TILE_QUESTION_FIRE;

      makePlatform(28, 5, 8);
      makePlatform(36, 7, 6);
      tiles[39][3] = TILE_QUESTION_COIN;

      makePlatform(48, 6, 8);
      tiles[50][5] = TILE_QUESTION_STAR;

      makePlatform(58, 8, 10);
      makePlatform(70, 5, 7);
      makePlatform(80, 7, 5);
      tiles[83][2] = TILE_QUESTION_1UP;

      makePlatform(92, 6, 8);
      makePlatform(103, 5, 6);
      makePlatform(112, 8, 9);
      tiles[115][6] = TILE_MULTI_COIN_BRICK;

      makePlatform(125, 6, 7);
      makePlatform(136, 7, 5);
      makePlatform(148, 8, 8);

      makePlatform(160, 6, 10);
      makePlatform(170, 5, 8);

      // Final solid ground leading to stairs
      for (let c = 180; c < 210; c++) {
        tiles[c][13] = TILE_GROUND;
        tiles[c][14] = TILE_GROUND;
      }

      placeStairs(182, 6, true);

      // Flagpole at col 196
      for (let r = 3; r <= 12; r++) tiles[196][r] = TILE_FLAGPOLE;
      tiles[196][2] = TILE_FLAGPOLE_TOP;
      tiles[196][13] = TILE_STAIR_STONE;

      placeCastle(200);
    }
  },

  // ==========================================
  // WORLD 1-4: BOWSER'S LAVA FORTRESS (CASTLE 1)
  // ==========================================
  {
    world: '1-4',
    name: "World 1-4 (Bowser's Lava Castle)",
    theme: 'castle',
    timeLimit: 300,
    widthCols: 180,
    skyColor: '#000000',
    groundTileColor: '#808080',
    groundTopColor: '#a0a0a0',
    brickColor: '#808080',
    questionColor: '#fc9838',
    pipeColor: '#008080',
    isCastleBoss: true,
    bossType: 'bowser',
    bossCol: 145,
    axeCol: 156,
    rescuedNpc: 'toad',
    firebars: [
      { col: 30, row: 8, length: 5, speed: 1.8 },
      { col: 55, row: 6, length: 6, speed: -2.0 },
      { col: 85, row: 8, length: 5, speed: 2.2 },
      { col: 110, row: 7, length: 6, speed: -1.9 },
    ],
    enemies: [
      { type: 'podoboo', col: 42, row: 13 },
      { type: 'podoboo', col: 72, row: 13 },
      { type: 'podoboo', col: 125, row: 13 },
      { type: 'bowser', col: 145, row: 9 },
    ],
    buildMap: (tiles) => {
      // Solid dark castle ceiling
      for (let c = 0; c < 180; c++) {
        tiles[c][0] = TILE_CASTLE_BRICK;
        tiles[c][1] = TILE_CASTLE_BRICK;
      }

      // Lava Pits
      [[38, 45], [68, 75], [98, 103], [122, 128], [138, 155]].forEach(([start, end]) => {
        for (let c = start; c <= end; c++) {
          tiles[c][13] = TILE_LAVA;
          tiles[c][14] = TILE_LAVA;
        }
      });

      // Castle obstacles, corridors and Firebar pivots
      for (let c = 12; c <= 20; c++) tiles[c][8] = TILE_CASTLE_BRICK;
      tiles[16][5] = TILE_QUESTION_FIRE;

      // Firebar pivots (stone blocks in air)
      tiles[30][8] = TILE_CASTLE_BRICK;
      tiles[55][6] = TILE_CASTLE_BRICK;
      tiles[85][8] = TILE_CASTLE_BRICK;
      tiles[110][7] = TILE_CASTLE_BRICK;

      // Stepping stones over lava
      tiles[40][10] = TILE_CASTLE_BRICK;
      tiles[43][10] = TILE_CASTLE_BRICK;

      tiles[70][9] = TILE_CASTLE_BRICK;
      tiles[73][9] = TILE_CASTLE_BRICK;

      tiles[124][9] = TILE_CASTLE_BRICK;
      tiles[126][9] = TILE_CASTLE_BRICK;

      // Bridge leading to Bowser & Axe
      for (let c = 138; c <= 155; c++) {
        tiles[c][10] = TILE_BRIDGE;
      }

      // The iconic Axe switch at end of bridge
      tiles[156][9] = TILE_AXE;

      // Castle chamber wall behind Axe
      for (let r = 2; r <= 12; r++) {
        tiles[158][r] = TILE_CASTLE_BRICK;
      }
      tiles[158][11] = TILE_EMPTY; // Passage to Toad
      tiles[158][12] = TILE_EMPTY;

      // Final Chamber for Toad (cols 159 to 175)
      for (let c = 159; c < 180; c++) {
        tiles[c][13] = TILE_GROUND;
        tiles[c][14] = TILE_GROUND;
      }
    }
  },

  // ==========================================
  // WORLD 2-1: SUNSET OVERWORLD & LAKITU
  // ==========================================
  {
    world: '2-1',
    name: 'World 2-1 (Sunset Ridge & Spiny Siege)',
    theme: 'overworld',
    timeLimit: 400,
    widthCols: 220,
    skyColor: '#fc9838', // Sunset orange
    groundTileColor: '#b84418',
    groundTopColor: '#fca044',
    brickColor: '#b84418',
    questionColor: '#fce0a8',
    pipeColor: '#00a800',
    enemies: [
      { type: 'lakitu', col: 30, row: 3, isFlying: true },
      { type: 'koopa', col: 20, row: 12 },
      { type: 'paratroopa', col: 50, row: 7, isFlying: true },
      { type: 'buzzy', col: 75, row: 12 },
      { type: 'red_koopa', col: 100, row: 8 },
      { type: 'spiny', col: 120, row: 12 },
      { type: 'koopa', col: 145, row: 12 },
      { type: 'paratroopa', col: 165, row: 6, isFlying: true },
    ],
    buildMap: (tiles, placePipe, placeStairs, placeCastle) => {
      // Pits
      [[55, 58], [112, 115], [148, 151]].forEach(([start, end]) => {
        for (let c = start; c <= end; c++) {
          tiles[c][13] = TILE_EMPTY;
          tiles[c][14] = TILE_EMPTY;
        }
      });

      tiles[15][9] = TILE_QUESTION_FIRE;
      tiles[22][9] = TILE_QUESTION_COIN;
      tiles[23][9] = TILE_QUESTION_STAR;

      placePipe(35, 3, true);
      placePipe(48, 4, true);

      // Elevated bricks
      for (let c = 65; c <= 78; c++) tiles[c][8] = TILE_BRICK;
      tiles[70][5] = TILE_QUESTION_1UP;
      tiles[74][8] = TILE_MULTI_COIN_BRICK;

      placePipe(90, 3, true);

      for (let c = 105; c <= 118; c++) tiles[c][6] = TILE_BRICK;
      tiles[110][3] = TILE_QUESTION_FIRE;

      placePipe(135, 4, true);

      placeStairs(170, 7, true);

      // Flagpole at col 195
      for (let r = 3; r <= 12; r++) tiles[195][r] = TILE_FLAGPOLE;
      tiles[195][2] = TILE_FLAGPOLE_TOP;
      tiles[195][13] = TILE_STAIR_STONE;

      placeCastle(199);
    }
  },

  // ==========================================
  // WORLD 2-2: UNDERWATER OCEAN WONDERLAND
  // ==========================================
  {
    world: '2-2',
    name: 'World 2-2 (Coral Sea & Blooper Trench)',
    theme: 'underwater',
    timeLimit: 400,
    widthCols: 200,
    skyColor: '#2038ec', // Deep ocean blue
    groundTileColor: '#e4a010', // Golden sand
    groundTopColor: '#fce0a8',
    brickColor: '#0050b8',
    questionColor: '#fc9838',
    pipeColor: '#00a800',
    hasWaterPhysics: true,
    enemies: [
      { type: 'blooper', col: 30, row: 6 },
      { type: 'cheep', col: 45, row: 8, vx: -1.2 },
      { type: 'blooper', col: 65, row: 5 },
      { type: 'cheep', col: 80, row: 4, vx: -1.5 },
      { type: 'cheep', col: 95, row: 9, vx: -1.0 },
      { type: 'blooper', col: 115, row: 7 },
      { type: 'cheep', col: 135, row: 6, vx: -1.4 },
      { type: 'blooper', col: 155, row: 5 },
    ],
    buildMap: (tiles, placePipe, placeStairs, placeCastle) => {
      // Water surface at top
      for (let c = 0; c < 200; c++) {
        tiles[c][0] = TILE_WATER_SURFACE;
      }

      // Coral formations
      const placeCoral = (col: number, height: number) => {
        for (let h = 0; h < height; h++) {
          tiles[col][12 - h] = TILE_CORAL;
        }
      };

      placeCoral(20, 3);
      placeCoral(40, 4);
      placeCoral(60, 5);
      placeCoral(85, 3);
      placeCoral(105, 5);
      placeCoral(130, 4);
      placeCoral(150, 6);

      // Hidden coin blocks underwater
      tiles[35][8] = TILE_QUESTION_COIN;
      tiles[55][6] = TILE_QUESTION_FIRE;
      tiles[75][7] = TILE_QUESTION_STAR;
      tiles[100][8] = TILE_MULTI_COIN_BRICK;
      tiles[120][5] = TILE_QUESTION_1UP;
      tiles[145][7] = TILE_QUESTION_COIN;

      // Pipe exit to surface
      placePipe(175, 4, false);

      // Flagpole at col 188
      for (let r = 3; r <= 12; r++) tiles[188][r] = TILE_FLAGPOLE;
      tiles[188][2] = TILE_FLAGPOLE_TOP;
      tiles[188][13] = TILE_STAIR_STONE;

      placeCastle(192);
    }
  },

  // ==========================================
  // WORLD 2-3: HIGH SEA BRIDGE & FLYING CHEEP CHEEPS
  // ==========================================
  {
    world: '2-3',
    name: 'World 2-3 (High Sea Bridge & Flying Cheep-Cheeps)',
    theme: 'athletic',
    timeLimit: 300,
    widthCols: 200,
    skyColor: '#5c94fc',
    groundTileColor: '#d88b20',
    groundTopColor: '#00a800',
    brickColor: '#b84418',
    questionColor: '#fc9838',
    pipeColor: '#00a800',
    enemies: [
      { type: 'cheep', col: 25, row: 12, isFlying: true },
      { type: 'paratroopa', col: 40, row: 7, isFlying: true },
      { type: 'cheep', col: 55, row: 12, isFlying: true },
      { type: 'koopa', col: 70, row: 9 },
      { type: 'cheep', col: 85, row: 12, isFlying: true },
      { type: 'paratroopa', col: 105, row: 6, isFlying: true },
      { type: 'cheep', col: 120, row: 12, isFlying: true },
      { type: 'red_koopa', col: 140, row: 8 },
      { type: 'cheep', col: 155, row: 12, isFlying: true },
    ],
    buildMap: (tiles, placePipe, placeStairs, placeCastle) => {
      // Open sea abyss underneath bridge
      for (let c = 10; c < 175; c++) {
        tiles[c][13] = TILE_EMPTY;
        tiles[c][14] = TILE_EMPTY;
      }

      // Wooden Bridges of various heights over ocean
      for (let c = 12; c <= 35; c++) tiles[c][10] = TILE_WOOD_PLATFORM;
      tiles[20][7] = TILE_QUESTION_FIRE;

      for (let c = 40; c <= 65; c++) tiles[c][9] = TILE_WOOD_PLATFORM;
      tiles[50][6] = TILE_QUESTION_STAR;

      for (let c = 72; c <= 98; c++) tiles[c][8] = TILE_WOOD_PLATFORM;
      tiles[80][5] = TILE_MULTI_COIN_BRICK;

      for (let c = 105; c <= 135; c++) tiles[c][9] = TILE_WOOD_PLATFORM;
      tiles[120][6] = TILE_QUESTION_1UP;

      for (let c = 142; c <= 170; c++) tiles[c][10] = TILE_WOOD_PLATFORM;

      // Ground resumption
      for (let c = 175; c < 200; c++) {
        tiles[c][13] = TILE_GROUND;
        tiles[c][14] = TILE_GROUND;
      }

      placeStairs(178, 6, true);

      // Flagpole at col 190
      for (let r = 3; r <= 12; r++) tiles[190][r] = TILE_FLAGPOLE;
      tiles[190][2] = TILE_FLAGPOLE_TOP;
      tiles[190][13] = TILE_STAIR_STONE;

      placeCastle(194);
    }
  },

  // ==========================================
  // WORLD 2-4: GRAND BOWSER CITADEL & PRINCESS PEACH
  // ==========================================
  {
    world: '2-4',
    name: "World 2-4 (Bowser's Royal Citadel & Princess Peach)",
    theme: 'castle',
    timeLimit: 400,
    widthCols: 190,
    skyColor: '#000000',
    groundTileColor: '#808080',
    groundTopColor: '#a0a0a0',
    brickColor: '#808080',
    questionColor: '#fc9838',
    pipeColor: '#008080',
    isCastleBoss: true,
    bossType: 'bowser',
    bossCol: 150,
    axeCol: 162,
    rescuedNpc: 'peach',
    firebars: [
      { col: 25, row: 8, length: 6, speed: 2.2 },
      { col: 45, row: 5, length: 6, speed: -2.4 },
      { col: 70, row: 8, length: 7, speed: 2.0 },
      { col: 95, row: 6, length: 7, speed: -2.2 },
      { col: 120, row: 8, length: 6, speed: 2.5 },
    ],
    enemies: [
      { type: 'podoboo', col: 35, row: 13 },
      { type: 'podoboo', col: 60, row: 13 },
      { type: 'podoboo', col: 85, row: 13 },
      { type: 'podoboo', col: 110, row: 13 },
      { type: 'podoboo', col: 135, row: 13 },
      { type: 'bowser', col: 150, row: 9 },
    ],
    buildMap: (tiles) => {
      // Solid roof
      for (let c = 0; c < 190; c++) {
        tiles[c][0] = TILE_CASTLE_BRICK;
        tiles[c][1] = TILE_CASTLE_BRICK;
      }

      // Lava Pits
      [[30, 38], [55, 63], [80, 88], [105, 113], [130, 138], [144, 161]].forEach(([start, end]) => {
        for (let c = start; c <= end; c++) {
          tiles[c][13] = TILE_LAVA;
          tiles[c][14] = TILE_LAVA;
        }
      });

      // Firebar pivots
      tiles[25][8] = TILE_CASTLE_BRICK;
      tiles[45][5] = TILE_CASTLE_BRICK;
      tiles[70][8] = TILE_CASTLE_BRICK;
      tiles[95][6] = TILE_CASTLE_BRICK;
      tiles[120][8] = TILE_CASTLE_BRICK;

      tiles[18][6] = TILE_QUESTION_FIRE;
      tiles[65][7] = TILE_QUESTION_STAR;

      // Bridge for boss fight
      for (let c = 144; c <= 161; c++) {
        tiles[c][10] = TILE_BRIDGE;
      }

      // Golden Axe
      tiles[162][9] = TILE_AXE;

      // Back wall
      for (let r = 2; r <= 12; r++) {
        tiles[165][r] = TILE_CASTLE_BRICK;
      }
      tiles[165][11] = TILE_EMPTY;
      tiles[165][12] = TILE_EMPTY;

      // Princess Chamber
      for (let c = 166; c < 190; c++) {
        tiles[c][13] = TILE_GROUND;
        tiles[c][14] = TILE_GROUND;
      }
    }
  }
];
