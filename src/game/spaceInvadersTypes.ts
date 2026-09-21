/**
 * Space Invaders (1978) Arcade Types & Definitions
 */

export type InvaderType = 'TOP' | 'MIDDLE' | 'BOTTOM';

export type SpaceInvadersState = 
  | 'READY' 
  | 'PLAYING' 
  | 'PAUSED' 
  | 'PLAYER_DYING' 
  | 'WAVE_CLEAR' 
  | 'GAME_OVER';

export type GameOverReason = 'LIVES_DEPLETED' | 'INVASION_BREACH' | null;

export interface InvaderEntity {
  id: string;
  row: number;
  col: number;
  x: number;
  y: number;
  width: number;
  height: number;
  type: InvaderType;
  points: number;
  alive: boolean;
  frame: number; // 0 or 1 for 2-step walk cycle
  deathTimer: number; // For explosion sprite display
}

export interface PlayerCannonEntity {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  isDying: boolean;
  deathTimer: number;
  deathFrame: number;
  invulnerableTimer: number;
  lives: number;
}

export interface LaserEntity {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  active: boolean;
}

export interface AlienBombEntity {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  active: boolean;
  type: 'rolling' | 'plunger' | 'squiggly';
  frame: number;
}

export interface BunkerPixelBlock {
  x: number;
  y: number;
  width: number;
  height: number;
  alive: boolean;
}

export interface DefenseBunker {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  blocks: boolean[][]; // 2D grid of intact mini-blocks (e.g. 24 x 16)
}

export interface MysteryUfoEntity {
  active: boolean;
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  direction: 1 | -1;
  points: number;
  deathTimer: number;
  displayScore: number | null;
}

export interface SpaceInvaderScoreEntry {
  id: string;
  initials: string;
  score: number;
  wave: number;
  date: string;
}

export interface SpaceScorePopup {
  id: string;
  text: string;
  x: number;
  y: number;
  color: string;
  timer: number;
}
