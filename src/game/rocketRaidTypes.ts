/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Rocket Raid (Acornsoft / Jonathan Griffiths 1982 - BBC Micro / Acorn)
 * Game Engine Types & Interfaces
 */

export type DisplayPalette = 'grey' | 'color' | 'green';

export type GameState = 'TITLE' | 'PLAYING' | 'PLAYER_HIT' | 'GAMEOVER' | 'VICTORY';

export interface PlayerShip {
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  speed: number;
  isAlive: boolean;
  fuel: number;       // Max 100
  maxFuel: number;
}

export interface LaserBullet {
  x: number;
  y: number;
  vx: number;
  width: number;
  height: number;
}

export interface Bomb {
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
}

export interface GroundRocket {
  id: number;
  x: number;
  y: number;
  baseY: number;
  launched: boolean;
  vy: number;
  width: number;
  height: number;
}

export interface FuelDepot {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  destroyed: boolean;
}

export interface RadarBase {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  destroyed: boolean;
}

export interface DancingAlien {
  id: number;
  x: number;
  y: number;
  baseY: number;
  amplitude: number;
  phase: number;
  speed: number;
  width: number;
  height: number;
  type: 'mine' | 'saucer';
}

export interface Meteor {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
}

export interface FinalBase {
  x: number;
  y: number;
  width: number;
  height: number;
  health: number;
  maxHealth: number;
  pulsing: number;
}

export interface TerrainPoint {
  x: number;
  floorY: number;
  ceilingY?: number; // Optional ceiling for cave / maze sections
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

export interface HighScoreEntry {
  score: number;
  initials: string;
  date: string;
  sectionReached: number;
}

export interface SectionConfig {
  sectionIndex: number; // 1 to 5
  name: string;
  subtitle: string;
  colorTheme: string;
  hasCeiling: boolean;
  scrollLength: number;
}
