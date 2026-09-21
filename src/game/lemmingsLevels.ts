/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Lemmings (1991 DMA Design / Psygnosis) - Authentic Levels
 */

import { LemmingsLevel } from './lemmingsTypes';

export const LEMMINGS_LEVELS: LemmingsLevel[] = [
  {
    id: 'fun_1',
    category: 'fun',
    number: 1,
    title: 'Just Dig!',
    subtitle: 'Classic Introduction to Diggers & Gravity',
    lemmingCount: 20,
    toSave: 50, // 50% = 10 lemmings
    releaseRate: 50,
    timeLimit: 300,
    width: 800,
    height: 320,
    spawnX: 180,
    spawnY: 60,
    exitX: 620,
    exitY: 260,
    theme: 'dirt',
    skills: {
      climber: 10,
      floater: 10,
      bomber: 10,
      blocker: 10,
      builder: 10,
      basher: 10,
      miner: 10,
      digger: 20
    },
    elements: [
      // Top spawn platform
      { type: 'rect', material: 'dirt', x: 120, y: 110, w: 220, h: 20, texture: 'moss' },
      // Left border pillar
      { type: 'rect', material: 'steel', x: 100, y: 0, w: 20, h: 320, texture: 'steel' },
      // Right border pillar
      { type: 'rect', material: 'steel', x: 700, y: 0, w: 20, h: 320, texture: 'steel' },
      
      // Giant middle dirt block (the core digging obstacle)
      { type: 'rect', material: 'dirt', x: 160, y: 150, w: 480, h: 50, texture: 'dirt' },
      
      // Stepped bottom plate
      { type: 'rect', material: 'dirt', x: 140, y: 230, w: 540, h: 30, texture: 'moss' },
      
      // Bottom main ground
      { type: 'rect', material: 'stone', x: 100, y: 280, w: 620, h: 40, texture: 'brick' }
    ]
  },
  {
    id: 'fun_2',
    category: 'fun',
    number: 2,
    title: 'Only Floaters Can Survive This',
    subtitle: 'High Drop & Bashing Through Earth Pillars',
    lemmingCount: 20,
    toSave: 70, // 70% = 14 lemmings
    releaseRate: 30,
    timeLimit: 300,
    width: 900,
    height: 320,
    spawnX: 160,
    spawnY: 40,
    exitX: 740,
    exitY: 260,
    theme: 'dirt',
    skills: {
      climber: 10,
      floater: 20,
      bomber: 5,
      blocker: 5,
      builder: 10,
      basher: 20,
      miner: 10,
      digger: 10
    },
    elements: [
      // Outer boundaries
      { type: 'rect', material: 'steel', x: 60, y: 0, w: 20, h: 320, texture: 'steel' },
      { type: 'rect', material: 'steel', x: 840, y: 0, w: 20, h: 320, texture: 'steel' },
      
      // Sky-high starting ledge
      { type: 'rect', material: 'dirt', x: 80, y: 80, w: 160, h: 20, texture: 'moss' },
      
      // Middle drop buffer
      { type: 'rect', material: 'dirt', x: 260, y: 190, w: 80, h: 15, texture: 'moss' },
      
      // Giant vertical earthen pillar 1 to bash through
      { type: 'rect', material: 'dirt', x: 380, y: 180, w: 70, h: 100, texture: 'dirt' },
      
      // Giant vertical earthen pillar 2 to bash through
      { type: 'rect', material: 'dirt', x: 530, y: 180, w: 70, h: 100, texture: 'dirt' },
      
      // Exit ledge
      { type: 'rect', material: 'dirt', x: 660, y: 260, w: 180, h: 25, texture: 'moss' },
      
      // Bottom floor
      { type: 'rect', material: 'stone', x: 60, y: 280, w: 800, h: 40, texture: 'brick' }
    ]
  },
  {
    id: 'fun_3',
    category: 'fun',
    number: 3,
    title: 'Tailor-made for Blockers',
    subtitle: 'Trap Hazards & Builder Staircases',
    lemmingCount: 30,
    toSave: 80, // 80% = 24 lemmings
    releaseRate: 40,
    timeLimit: 360,
    width: 950,
    height: 320,
    spawnX: 200,
    spawnY: 60,
    exitX: 780,
    exitY: 150,
    theme: 'brick',
    skills: {
      climber: 10,
      floater: 10,
      bomber: 5,
      blocker: 15,
      builder: 25,
      basher: 10,
      miner: 10,
      digger: 10
    },
    hazardY: 295,
    hazardType: 'water',
    elements: [
      // Left border
      { type: 'rect', material: 'steel', x: 80, y: 0, w: 20, h: 320, texture: 'steel' },
      { type: 'rect', material: 'steel', x: 880, y: 0, w: 20, h: 320, texture: 'steel' },
      
      // Spawn platform (narrow ledge over dangerous pit)
      { type: 'rect', material: 'dirt', x: 120, y: 110, w: 180, h: 20, texture: 'moss' },
      
      // Lower middle platform
      { type: 'rect', material: 'stone', x: 340, y: 190, w: 160, h: 20, texture: 'brick' },
      
      // Elevated wall in the middle
      { type: 'rect', material: 'dirt', x: 530, y: 120, w: 60, h: 100, texture: 'dirt' },
      
      // High right exit platform
      { type: 'rect', material: 'stone', x: 680, y: 150, w: 200, h: 25, texture: 'brick' },
      
      // Bottom support pillars
      { type: 'rect', material: 'stone', x: 160, y: 130, w: 40, h: 150, texture: 'brick' },
      { type: 'rect', material: 'stone', x: 400, y: 210, w: 40, h: 80, texture: 'brick' },
      { type: 'rect', material: 'stone', x: 740, y: 175, w: 40, h: 110, texture: 'brick' }
    ]
  },
  {
    id: 'tricky_1',
    category: 'tricky',
    number: 4,
    title: 'Now Use Miners and Climbers',
    subtitle: 'Subterranean Cavern Multi-Skill Route',
    lemmingCount: 40,
    toSave: 80,
    releaseRate: 45,
    timeLimit: 360,
    width: 1000,
    height: 320,
    spawnX: 180,
    spawnY: 50,
    exitX: 840,
    exitY: 260,
    theme: 'crystal',
    skills: {
      climber: 20,
      floater: 10,
      bomber: 5,
      blocker: 5,
      builder: 20,
      basher: 15,
      miner: 20,
      digger: 15
    },
    elements: [
      // Outer borders
      { type: 'rect', material: 'steel', x: 80, y: 0, w: 20, h: 320, texture: 'steel' },
      { type: 'rect', material: 'steel', x: 920, y: 0, w: 20, h: 320, texture: 'steel' },
      
      // Top platform
      { type: 'rect', material: 'dirt', x: 120, y: 95, w: 240, h: 20, texture: 'crystal' },
      
      // Giant diagonal stone plateau
      { type: 'rect', material: 'dirt', x: 380, y: 130, w: 200, h: 70, texture: 'dirt' },
      
      // Tall vertical climb wall
      { type: 'rect', material: 'stone', x: 620, y: 80, w: 25, h: 170, texture: 'brick' },
      
      // Hanging crystal ceiling obstacle
      { type: 'rect', material: 'steel', x: 680, y: 0, w: 40, h: 140, texture: 'steel' },
      
      // Stepped lower tier
      { type: 'rect', material: 'dirt', x: 660, y: 220, w: 140, h: 30, texture: 'crystal' },
      
      // Bottom exit grounds
      { type: 'rect', material: 'stone', x: 100, y: 280, w: 820, h: 40, texture: 'brick' }
    ]
  },
  {
    id: 'tricky_2',
    category: 'tricky',
    number: 5,
    title: 'We All Fall Down',
    subtitle: 'Multi-Tiered Stepped Shafts & Precision Digging',
    lemmingCount: 50,
    toSave: 90, // 90% = 45 lemmings
    releaseRate: 60,
    timeLimit: 300,
    width: 900,
    height: 320,
    spawnX: 180,
    spawnY: 30,
    exitX: 740,
    exitY: 260,
    theme: 'dirt',
    skills: {
      climber: 10,
      floater: 10,
      bomber: 5,
      blocker: 10,
      builder: 20,
      basher: 20,
      miner: 10,
      digger: 30
    },
    elements: [
      { type: 'rect', material: 'steel', x: 60, y: 0, w: 20, h: 320, texture: 'steel' },
      { type: 'rect', material: 'steel', x: 840, y: 0, w: 20, h: 320, texture: 'steel' },
      
      // Tier 1
      { type: 'rect', material: 'dirt', x: 100, y: 70, w: 700, h: 18, texture: 'moss' },
      // Tier 2
      { type: 'rect', material: 'dirt', x: 120, y: 125, w: 680, h: 18, texture: 'moss' },
      // Tier 3
      { type: 'rect', material: 'dirt', x: 100, y: 180, w: 700, h: 18, texture: 'moss' },
      // Tier 4
      { type: 'rect', material: 'dirt', x: 120, y: 235, w: 680, h: 18, texture: 'moss' },
      
      // Bottom exit floor
      { type: 'rect', material: 'stone', x: 60, y: 280, w: 800, h: 40, texture: 'brick' }
    ]
  },
  {
    id: 'mayhem_1',
    category: 'mayhem',
    number: 6,
    title: 'The Steel Mines of DMA',
    subtitle: 'Armored Steel Plates & Acid Reservoirs',
    lemmingCount: 60,
    toSave: 85,
    releaseRate: 70,
    timeLimit: 360,
    width: 1050,
    height: 320,
    spawnX: 180,
    spawnY: 50,
    exitX: 890,
    exitY: 240,
    theme: 'hell',
    skills: {
      climber: 20,
      floater: 20,
      bomber: 10,
      blocker: 10,
      builder: 30,
      basher: 20,
      miner: 15,
      digger: 15
    },
    hazardY: 295,
    hazardType: 'acid',
    elements: [
      { type: 'rect', material: 'steel', x: 60, y: 0, w: 20, h: 320, texture: 'steel' },
      { type: 'rect', material: 'steel', x: 980, y: 0, w: 20, h: 320, texture: 'steel' },
      
      // Steel spawn platform
      { type: 'rect', material: 'steel', x: 100, y: 95, w: 180, h: 20, texture: 'steel' },
      
      // Diggable earthen bridge
      { type: 'rect', material: 'dirt', x: 290, y: 130, w: 220, h: 35, texture: 'dirt' },
      
      // Impassable steel monolith in center
      { type: 'rect', material: 'steel', x: 530, y: 70, w: 50, h: 180, texture: 'steel' },
      
      // Secondary platform over acid
      { type: 'rect', material: 'stone', x: 600, y: 200, w: 160, h: 25, texture: 'brick' },
      
      // Floating exit bastion
      { type: 'rect', material: 'steel', x: 800, y: 240, w: 180, h: 30, texture: 'steel' },
      
      // Acid pit pillars
      { type: 'rect', material: 'stone', x: 660, y: 225, w: 40, h: 70, texture: 'brick' }
    ]
  }
];
