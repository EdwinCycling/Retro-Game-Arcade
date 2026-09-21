/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Sega OutRun (1986) - Types & Constants
 */

export type OutrunTrack = 'magical_sound_shower' | 'passing_breeze' | 'splash_wave' | 'off';

export type Gear = 'LOW' | 'HIGH';

export type StageId = 'coconut_beach' | 'gateway' | 'desert' | 'alps' | 'vineyard';

export interface StageConfig {
  id: StageId;
  name: string;
  stageNumber: number;
  groundColorDark: string;
  groundColorLight: string;
  roadColorDark: string;
  roadColorLight: string;
  rumbleColorDark: string;
  rumbleColorLight: string;
  skyTop: string;
  skyBottom: string;
  hasOcean: boolean;
  mountainType: 'tropical_hills' | 'roman_hills' | 'desert_mesas' | 'alpine_peaks';
  defaultScenery: ScenerySpriteType[];
}

export type ScenerySpriteType = 
  | 'palm_tree'
  | 'aqueduct_arch'
  | 'aqueduct_pillar'
  | 'windmill'
  | 'cactus'
  | 'flower_patch'
  | 'billboard_sega'
  | 'billboard_outrun'
  | 'start_banner'
  | 'checkpoint_arch'
  | 'fork_gantry'
  | 'spectator_crowd'
  | 'flag_girl'
  | 'cameraman'
  | 'podium'
  | 'street_lamp';

export interface TrafficCar {
  id: number;
  z: number; // Position along track in world units
  offset: number; // -1 (left edge) to +1 (right edge)
  speed: number;
  type: 'truck' | 'bug' | 'porsche' | 'pickup';
  color: string;
}

export interface SceneryObject {
  z: number;
  offset: number; // < -1 is left roadside, > 1 is right roadside
  sprite: ScenerySpriteType;
  customScale?: number;
}

export interface RoadSegment {
  index: number;
  p1: { world: { x: number; y: number; z: number }; screen: { x: number; y: number; w: number; scale: number } };
  p2: { world: { x: number; y: number; z: number }; screen: { x: number; y: number; w: number; scale: number } };
  curve: number; // -4 to +4
  elevation: number; // hill heights
  color: {
    road: string;
    grass: string;
    rumble: string;
    lane: string;
  };
  sprites: SceneryObject[];
  cars: TrafficCar[];
  stageId: StageId;
  isFork?: boolean;
  forkProgress?: number; // 0 to 1 through the fork
  isCheckpoint?: boolean;
  isFinish?: boolean;
  checkpointLabel?: string;
  forkLeftLabel?: string;
  forkRightLabel?: string;
}

export interface OutrunPlayer {
  x: number; // -1 to 1 (road center = 0, edges = -1 and +1)
  z: number; // Distance down the track
  speed: number; // 0 to maxSpeed
  maxSpeedLow: number;
  maxSpeedHigh: number;
  accel: number;
  braking: number;
  gear: Gear;
  steerAngle: number;
  isDrifting: boolean;
  isCrashed: boolean;
  crashTimer: number;
  bounceOffset: number;
}

export interface OutrunHighScore {
  initials: string;
  score: number;
  stageReached: number;
  date: string;
}

export const SEGMENT_LENGTH = 200;
export const RUMBLE_LENGTH = 3;
export const ROAD_WIDTH = 2200;
export const CAMERA_HEIGHT = 1000;
export const CAMERA_DEPTH = 0.84;
export const DRAW_DISTANCE = 300;
export const MAX_SPEED_LOW = 180;
export const MAX_SPEED_HIGH = 293;

export const STAGE_CONFIGS: Record<StageId, StageConfig> = {
  coconut_beach: {
    id: 'coconut_beach',
    name: 'Coconut Beach',
    stageNumber: 1,
    groundColorDark: '#d4b483', // Warm golden sand
    groundColorLight: '#e0c294',
    roadColorDark: '#676b73',
    roadColorLight: '#737780',
    rumbleColorDark: '#cc1100',
    rumbleColorLight: '#ffffff',
    skyTop: '#0066cc',
    skyBottom: '#ffeedd',
    hasOcean: true,
    mountainType: 'tropical_hills',
    defaultScenery: ['palm_tree', 'billboard_sega', 'billboard_outrun']
  },
  gateway: {
    id: 'gateway',
    name: 'Gateway',
    stageNumber: 2,
    groundColorDark: '#4e8c28', // Lush European green
    groundColorLight: '#5ba631',
    roadColorDark: '#5e636b',
    roadColorLight: '#696e77',
    rumbleColorDark: '#dd2200',
    rumbleColorLight: '#ffffff',
    skyTop: '#0055bb',
    skyBottom: '#d0eaff',
    hasOcean: false,
    mountainType: 'roman_hills',
    defaultScenery: ['aqueduct_arch', 'aqueduct_pillar', 'billboard_sega']
  },
  desert: {
    id: 'desert',
    name: 'Desert',
    stageNumber: 2,
    groundColorDark: '#b87333', // Arid red-gold canyon sand
    groundColorLight: '#c98442',
    roadColorDark: '#6b6660',
    roadColorLight: '#79736c',
    rumbleColorDark: '#cc3300',
    rumbleColorLight: '#ffcc00',
    skyTop: '#ff7733', // Desert sunset haze
    skyBottom: '#ffeedd',
    hasOcean: false,
    mountainType: 'desert_mesas',
    defaultScenery: ['cactus', 'billboard_outrun']
  },
  alps: {
    id: 'alps',
    name: 'Alps',
    stageNumber: 3,
    groundColorDark: '#387c2b', // Alpine green with yellow flowers
    groundColorLight: '#449635',
    roadColorDark: '#555b63',
    roadColorLight: '#626871',
    rumbleColorDark: '#bb1100',
    rumbleColorLight: '#ffffff',
    skyTop: '#0044aa',
    skyBottom: '#cce6ff',
    hasOcean: false,
    mountainType: 'alpine_peaks',
    defaultScenery: ['windmill', 'flower_patch', 'billboard_sega']
  },
  vineyard: {
    id: 'vineyard',
    name: 'Vineyard',
    stageNumber: 3,
    groundColorDark: '#8a6230',
    groundColorLight: '#9b703a',
    roadColorDark: '#60646c',
    roadColorLight: '#6c717a',
    rumbleColorDark: '#cc2200',
    rumbleColorLight: '#ffffff',
    skyTop: '#1166cc',
    skyBottom: '#ffe8cc',
    hasOcean: false,
    mountainType: 'roman_hills',
    defaultScenery: ['flower_patch', 'billboard_outrun']
  }
};

