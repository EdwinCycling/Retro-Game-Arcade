/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Authentic Levels for FRAK! (BBC Micro 1984)
 * Screen coordinates calibrated for 512x400 Canvas
 */

import { FrakLevelConfig } from './frakTypes';

export const CANVAS_WIDTH = 512;
export const CANVAS_HEIGHT = 400;

export const FRAK_LEVELS: FrakLevelConfig[] = [
  // ==========================================
  // LEVEL 1: THE MAZE OF "FRAK!"
  // Platforms and ropes literally spelling F - R - A - K !
  // ==========================================
  {
    id: 1,
    name: 'ZONE 1: THE MAZE OF "FRAK!"',
    subtitle: 'Aardvark Software 1984 - Collect all 3 keys to open the exit!',
    timeLimit: 120, // seconds
    spawnPoint: { x: 36, y: 330 },
    door: { x: 440, y: 52, width: 32, height: 40, isOpen: false },
    platforms: [
      // Base safety bedrock
      { x: 16, y: 372, width: 480, height: 14, type: 'solid' },

      // --- LETTER 'F' (x: 24 .. 120) ---
      // Top bar of 'F'
      { x: 30, y: 92, width: 90, height: 12, label: 'F-TOP' },
      // Middle crossbar of 'F'
      { x: 30, y: 190, width: 70, height: 12, label: 'F-MID' },
      // Lower shelf of 'F'
      { x: 30, y: 280, width: 80, height: 12, label: 'F-BOT' },

      // Bridge connecting F to R
      { x: 115, y: 190, width: 35, height: 10 },

      // --- LETTER 'R' (x: 140 .. 240) ---
      // Top roof of 'R'
      { x: 145, y: 92, width: 85, height: 12, label: 'R-TOP' },
      // Middle loop of 'R'
      { x: 145, y: 180, width: 85, height: 12, label: 'R-MID' },
      // R's right curved wall shelf
      { x: 215, y: 136, width: 20, height: 10 },
      // R's diagonal lower leg platform
      { x: 175, y: 270, width: 65, height: 12, label: 'R-LEG' },

      // Bridge connecting R to A
      { x: 235, y: 180, width: 30, height: 10 },

      // --- LETTER 'A' (x: 260 .. 360) ---
      // Top apex of 'A'
      { x: 290, y: 80, width: 40, height: 12, label: 'A-APEX' },
      // Left shoulder of 'A'
      { x: 265, y: 130, width: 30, height: 10 },
      // Right shoulder of 'A'
      { x: 325, y: 130, width: 30, height: 10 },
      // Middle crossbar of 'A'
      { x: 270, y: 210, width: 80, height: 12, label: 'A-BAR' },
      // Left lower leg of 'A'
      { x: 255, y: 290, width: 35, height: 12 },
      // Right lower leg of 'A'
      { x: 330, y: 290, width: 35, height: 12 },

      // Stepping stone connecting A to K
      { x: 360, y: 210, width: 25, height: 10 },

      // --- LETTER 'K' (x: 385 .. 490) ---
      // K's main spine top
      { x: 385, y: 92, width: 35, height: 12, label: 'K-TOP' },
      // K's main spine middle
      { x: 385, y: 190, width: 35, height: 12, label: 'K-MID' },
      // K's main spine lower
      { x: 385, y: 290, width: 35, height: 12, label: 'K-BOT' },
      // K's upper diagonal branch (leading to exit door!)
      { x: 425, y: 92, width: 65, height: 12, label: 'EXIT-LEDGE' },
      // K's lower diagonal branch
      { x: 425, y: 260, width: 65, height: 12, label: 'K-ARM' },
    ],
    climbables: [
      // F's vertical ladders/ropes
      { x: 34, y: 92, height: 98, width: 16, type: 'rope' },
      { x: 34, y: 190, height: 90, width: 16, type: 'ladder' },
      { x: 34, y: 280, height: 92, width: 16, type: 'ladder' },

      // R's vertical climb
      { x: 150, y: 92, height: 88, width: 16, type: 'chain' },
      { x: 150, y: 180, height: 90, width: 16, type: 'ladder' },
      { x: 220, y: 180, height: 90, width: 16, type: 'rope' },

      // A's ladders
      { x: 275, y: 130, height: 80, width: 16, type: 'rope' },
      { x: 335, y: 130, height: 80, width: 16, type: 'rope' },
      { x: 300, y: 210, height: 80, width: 16, type: 'ladder' },

      // K's climb
      { x: 395, y: 92, height: 98, width: 16, type: 'chain' },
      { x: 395, y: 190, height: 100, width: 16, type: 'ladder' },
      { x: 455, y: 92, height: 168, width: 16, type: 'rope' },
    ],
    keys: [
      { x: 80, y: 70 },   // Key 1: Top of 'F'
      { x: 175, y: 158 }, // Key 2: Inside loop of 'R'
      { x: 450, y: 240 }, // Key 3: Lower arm of 'K'
    ],
    bulbs: [
      { x: 305, y: 60 },  // Light bulb at Apex of 'A' (+Bonus time & points)
      { x: 50, y: 260 },  // Lower shelf of 'F'
      { x: 305, y: 190 }, // Crossbar of 'A'
    ],
    staticEnemies: [
      // Scrubbly bristle monster on F-Mid
      { type: 'scrubbly', x: 70, y: 190, patrolMinX: 45, patrolMaxX: 90, vx: 0.8 },
      // Pig-faced Poglet on R-Mid
      { type: 'poglet', x: 180, y: 180, patrolMinX: 160, patrolMaxX: 210, vx: 0.7 },
      // Hooter on K lower branch
      { type: 'hooter', x: 440, y: 260, patrolMinX: 430, patrolMaxX: 475, vx: 0.6 },
    ],
    balloonSpawner: {
      enabled: true,
      interval: 420, // Frames between balloon spawns
      xCoords: [110, 240, 360],
    },
    daggerSpawner: {
      enabled: true,
      interval: 500,
      startX: [200, 340, 480],
    },
  },

  // ==========================================
  // LEVEL 2: THE CHASM OF LOGS & CHAINS
  // Moving log rafts, long vertical drops, high ropes, tricky key placements!
  // ==========================================
  {
    id: 2,
    name: 'ZONE 2: CHASM OF LOGS & CHAINS',
    subtitle: 'Watch your step! Moving log rafts across the chasms - falling too far is fatal!',
    timeLimit: 110,
    spawnPoint: { x: 40, y: 330 },
    door: { x: 445, y: 46, width: 32, height: 40, isOpen: false },
    platforms: [
      // Bottom bedrock floor
      { x: 16, y: 372, width: 480, height: 14, type: 'solid' },

      // Lowest Tier
      { x: 28, y: 310, width: 90, height: 12, type: 'log' },
      // Moving log raft 1 across lower gap
      {
        x: 160,
        y: 310,
        width: 80,
        height: 12,
        type: 'moving',
        moving: { axis: 'x', min: 135, max: 235, speed: 0.95, dir: 1 },
        label: 'RAFT-1',
      },
      { x: 340, y: 310, width: 140, height: 12, type: 'log' },

      // Middle Tier
      { x: 50, y: 230, width: 100, height: 12, type: 'stone' },
      // Moving log raft 2 across mid chasm
      {
        x: 190,
        y: 230,
        width: 80,
        height: 12,
        type: 'moving',
        moving: { axis: 'x', min: 160, max: 265, speed: 1.15, dir: -1 },
        label: 'RAFT-2',
      },
      { x: 330, y: 230, width: 145, height: 12, type: 'stone' },

      // Upper-Middle Tier
      { x: 30, y: 150, width: 105, height: 12, type: 'log' },
      // Moving log raft 3
      {
        x: 180,
        y: 150,
        width: 80,
        height: 12,
        type: 'moving',
        moving: { axis: 'x', min: 150, max: 255, speed: 1.05, dir: 1 },
        label: 'RAFT-3',
      },
      { x: 350, y: 150, width: 130, height: 12, type: 'log' },

      // High Perch & Doorway
      { x: 70, y: 80, width: 90, height: 12, type: 'stone' },
      // High moving perch
      {
        x: 210,
        y: 80,
        width: 75,
        height: 12,
        type: 'moving',
        moving: { axis: 'x', min: 185, max: 280, speed: 1.25, dir: -1 },
        label: 'PERCH-4',
      },
      { x: 395, y: 86, width: 95, height: 12, type: 'solid', label: 'EXIT-DOOR' },
    ],
    climbables: [
      // Chains from floor to tier 1
      { x: 75, y: 310, height: 62, width: 16, type: 'chain' },
      { x: 265, y: 310, height: 62, width: 16, type: 'rope' },
      { x: 410, y: 310, height: 62, width: 16, type: 'ladder' },

      // Tier 1 to Tier 2
      { x: 120, y: 230, height: 80, width: 16, type: 'ladder' },
      { x: 350, y: 230, height: 80, width: 16, type: 'chain' },

      // Tier 2 to Tier 3
      { x: 75, y: 150, height: 80, width: 16, type: 'rope' },
      { x: 285, y: 150, height: 80, width: 16, type: 'ladder' },
      { x: 420, y: 150, height: 80, width: 16, type: 'chain' },

      // Tier 3 to Top Perch
      { x: 130, y: 80, height: 70, width: 16, type: 'chain' },
      { x: 300, y: 80, height: 70, width: 16, type: 'rope' },
      { x: 440, y: 86, height: 64, width: 16, type: 'ladder' },
    ],
    keys: [
      { x: 420, y: 290 }, // Key 1: Far lower right log shelf
      { x: 55, y: 130 },  // Key 2: Left high ledge
      { x: 245, y: 60 },  // Key 3: Riding on high moving perch
    ],
    bulbs: [
      { x: 360, y: 290 },
      { x: 390, y: 210 },
      { x: 100, y: 60 },
    ],
    staticEnemies: [
      { type: 'scrubbly', x: 360, y: 310, patrolMinX: 345, patrolMaxX: 430, vx: 0.9 },
      { type: 'hooter', x: 90, y: 230, patrolMinX: 65, patrolMaxX: 135, vx: 0.8 },
      { type: 'poglet', x: 360, y: 230, patrolMinX: 335, patrolMaxX: 430, vx: 1.0 },
      { type: 'scrubbly', x: 70, y: 150, patrolMinX: 45, patrolMaxX: 115, vx: 0.9 },
    ],
    balloonSpawner: {
      enabled: true,
      interval: 360,
      xCoords: [140, 280, 420],
    },
    daggerSpawner: {
      enabled: true,
      interval: 440,
      startX: [150, 300, 460],
    },
  },

  // ==========================================
  // LEVEL 3: THE NIGHTMARE LAIR
  // Moving stepping stones, vertical elevator lift, bottomless abyss & relentless traps!
  // ==========================================
  {
    id: 3,
    name: 'ZONE 3: THE NIGHTMARE LAIR',
    subtitle: 'Precision leaps, vertical moving elevators and survival above the void!',
    timeLimit: 100,
    spawnPoint: { x: 30, y: 330 },
    door: { x: 240, y: 44, width: 32, height: 40, isOpen: false },
    platforms: [
      // Bottom floor with abyss drop sections
      { x: 16, y: 372, width: 140, height: 14, type: 'solid' },
      { x: 195, y: 372, width: 120, height: 14, type: 'solid' },
      { x: 355, y: 372, width: 141, height: 14, type: 'solid' },

      // Floating stone steps & horizontal shuttles
      { x: 24, y: 310, width: 65, height: 12, type: 'stone' },
      // Moving stone step 1
      {
        x: 125,
        y: 310,
        width: 60,
        height: 12,
        type: 'moving',
        moving: { axis: 'x', min: 100, max: 185, speed: 1.2, dir: 1 },
        label: 'SHUTTLE-1',
      },
      { x: 225, y: 310, width: 60, height: 12, type: 'stone' },
      // Moving stone step 2
      {
        x: 320,
        y: 310,
        width: 60,
        height: 12,
        type: 'moving',
        moving: { axis: 'x', min: 300, max: 385, speed: 1.3, dir: -1 },
        label: 'SHUTTLE-2',
      },
      { x: 420, y: 310, width: 70, height: 12, type: 'stone' },

      // Mid tier & Central Vertical Elevator
      { x: 50, y: 230, width: 95, height: 12, type: 'stone' },
      // Vertical Elevator Lift in the center shaft!
      {
        x: 215,
        y: 240,
        width: 70,
        height: 12,
        type: 'moving',
        moving: { axis: 'y', min: 155, max: 255, speed: 0.85, dir: 1 },
        label: 'ELEVATOR',
      },
      { x: 355, y: 230, width: 95, height: 12, type: 'stone' },

      // Upper tier moving stepping stones
      { x: 30, y: 150, width: 85, height: 12, type: 'stone' },
      {
        x: 145,
        y: 150,
        width: 65,
        height: 12,
        type: 'moving',
        moving: { axis: 'x', min: 125, max: 205, speed: 1.1, dir: -1 },
        label: 'SHUTTLE-3',
      },
      {
        x: 285,
        y: 150,
        width: 65,
        height: 12,
        type: 'moving',
        moving: { axis: 'x', min: 265, max: 350, speed: 1.25, dir: 1 },
        label: 'SHUTTLE-4',
      },
      { x: 395, y: 150, width: 90, height: 12, type: 'stone' },

      // Top Exit Sanctuary
      { x: 215, y: 84, width: 82, height: 12, label: 'SANCTUARY', type: 'solid' },
      { x: 80, y: 84, width: 65, height: 12, type: 'stone' },
      { x: 365, y: 84, width: 65, height: 12, type: 'stone' },
    ],
    climbables: [
      { x: 45, y: 310, height: 62, width: 16, type: 'chain' },
      { x: 450, y: 310, height: 62, width: 16, type: 'chain' },

      { x: 95, y: 230, height: 80, width: 16, type: 'ladder' },
      { x: 400, y: 230, height: 80, width: 16, type: 'ladder' },

      { x: 65, y: 150, height: 80, width: 16, type: 'rope' },
      { x: 440, y: 150, height: 80, width: 16, type: 'rope' },

      { x: 110, y: 84, height: 66, width: 16, type: 'chain' },
      { x: 395, y: 84, height: 66, width: 16, type: 'chain' },
    ],
    keys: [
      { x: 450, y: 290 }, // Key 1: bottom right step
      { x: 55, y: 130 },  // Key 2: upper left
      { x: 440, y: 130 }, // Key 3: upper right
    ],
    bulbs: [
      { x: 245, y: 290 },
      { x: 100, y: 64 },
      { x: 385, y: 64 },
    ],
    staticEnemies: [
      { type: 'scrubbly', x: 75, y: 230, patrolMinX: 55, patrolMaxX: 130, vx: 1.1 },
      { type: 'hooter', x: 380, y: 230, patrolMinX: 360, patrolMaxX: 435, vx: 1.1 },
      { type: 'poglet', x: 45, y: 150, patrolMinX: 35, patrolMaxX: 105, vx: 1.1 },
      { type: 'scrubbly', x: 410, y: 150, patrolMinX: 400, patrolMaxX: 470, vx: 1.0 },
    ],
    balloonSpawner: {
      enabled: true,
      interval: 300,
      xCoords: [100, 210, 320, 430],
    },
    daggerSpawner: {
      enabled: true,
      interval: 380,
      startX: [100, 240, 380, 480],
    },
  },
];
