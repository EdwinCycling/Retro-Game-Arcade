/**
 * Authentic Level Specifications matching Namco Arcade ROM specifications
 */
import { LevelConfig, Difficulty } from '../types';

export const LEVEL_CONFIGS: LevelConfig[] = [
  // Level 1: Cherry
  {
    levelNumber: 1,
    fruit: 'CHERRY',
    fruitPoints: 100,
    pacmanSpeedNormal: 0.80,
    pacmanSpeedDots: 0.71,
    pacmanSpeedFrightened: 0.90,
    ghostSpeedNormal: 0.75,
    ghostSpeedTunnel: 0.40,
    ghostSpeedFrightened: 0.50,
    elroy1Dots: 20,
    elroy1Speed: 0.80,
    elroy2Dots: 10,
    elroy2Speed: 0.85,
    frightenedDurationSeconds: 6,
    frightenedFlashes: 5,
    scatterChaseWaves: [
      { scatter: 7, chase: 20 },
      { scatter: 7, chase: 20 },
      { scatter: 5, chase: 20 },
      { scatter: 5, chase: 999999 } // permanent chase
    ]
  },
  // Level 2: Strawberry
  {
    levelNumber: 2,
    fruit: 'STRAWBERRY',
    fruitPoints: 300,
    pacmanSpeedNormal: 0.90,
    pacmanSpeedDots: 0.79,
    pacmanSpeedFrightened: 0.95,
    ghostSpeedNormal: 0.85,
    ghostSpeedTunnel: 0.45,
    ghostSpeedFrightened: 0.55,
    elroy1Dots: 30,
    elroy1Speed: 0.90,
    elroy2Dots: 15,
    elroy2Speed: 0.95,
    frightenedDurationSeconds: 5,
    frightenedFlashes: 5,
    scatterChaseWaves: [
      { scatter: 7, chase: 20 },
      { scatter: 7, chase: 20 },
      { scatter: 5, chase: 1033 },
      { scatter: 0.016, chase: 999999 }
    ]
  },
  // Level 3: Peach / Orange
  {
    levelNumber: 3,
    fruit: 'PEACH',
    fruitPoints: 500,
    pacmanSpeedNormal: 0.90,
    pacmanSpeedDots: 0.79,
    pacmanSpeedFrightened: 0.95,
    ghostSpeedNormal: 0.85,
    ghostSpeedTunnel: 0.45,
    ghostSpeedFrightened: 0.55,
    elroy1Dots: 40,
    elroy1Speed: 0.90,
    elroy2Dots: 20,
    elroy2Speed: 0.95,
    frightenedDurationSeconds: 4,
    frightenedFlashes: 5,
    scatterChaseWaves: [
      { scatter: 7, chase: 20 },
      { scatter: 7, chase: 20 },
      { scatter: 5, chase: 1033 },
      { scatter: 0.016, chase: 999999 }
    ]
  },
  // Level 4: Peach / Orange
  {
    levelNumber: 4,
    fruit: 'PEACH',
    fruitPoints: 500,
    pacmanSpeedNormal: 0.90,
    pacmanSpeedDots: 0.79,
    pacmanSpeedFrightened: 0.95,
    ghostSpeedNormal: 0.85,
    ghostSpeedTunnel: 0.45,
    ghostSpeedFrightened: 0.55,
    elroy1Dots: 40,
    elroy1Speed: 0.90,
    elroy2Dots: 20,
    elroy2Speed: 0.95,
    frightenedDurationSeconds: 3,
    frightenedFlashes: 5,
    scatterChaseWaves: [
      { scatter: 7, chase: 20 },
      { scatter: 7, chase: 20 },
      { scatter: 5, chase: 1033 },
      { scatter: 0.016, chase: 999999 }
    ]
  },
  // Level 5: Apple
  {
    levelNumber: 5,
    fruit: 'APPLE',
    fruitPoints: 700,
    pacmanSpeedNormal: 1.00,
    pacmanSpeedDots: 0.87,
    pacmanSpeedFrightened: 1.00,
    ghostSpeedNormal: 0.95,
    ghostSpeedTunnel: 0.50,
    ghostSpeedFrightened: 0.60,
    elroy1Dots: 40,
    elroy1Speed: 1.00,
    elroy2Dots: 20,
    elroy2Speed: 1.05,
    frightenedDurationSeconds: 2,
    frightenedFlashes: 5,
    scatterChaseWaves: [
      { scatter: 5, chase: 20 },
      { scatter: 5, chase: 20 },
      { scatter: 5, chase: 1037 },
      { scatter: 0.016, chase: 999999 }
    ]
  },
  // Level 6: Apple
  {
    levelNumber: 6,
    fruit: 'APPLE',
    fruitPoints: 700,
    pacmanSpeedNormal: 1.00,
    pacmanSpeedDots: 0.87,
    pacmanSpeedFrightened: 1.00,
    ghostSpeedNormal: 0.95,
    ghostSpeedTunnel: 0.50,
    ghostSpeedFrightened: 0.60,
    elroy1Dots: 50,
    elroy1Speed: 1.00,
    elroy2Dots: 25,
    elroy2Speed: 1.05,
    frightenedDurationSeconds: 5,
    frightenedFlashes: 5,
    scatterChaseWaves: [
      { scatter: 5, chase: 20 },
      { scatter: 5, chase: 20 },
      { scatter: 5, chase: 1037 },
      { scatter: 0.016, chase: 999999 }
    ]
  },
  // Level 7: Melon
  {
    levelNumber: 7,
    fruit: 'MELON',
    fruitPoints: 1000,
    pacmanSpeedNormal: 1.00,
    pacmanSpeedDots: 0.87,
    pacmanSpeedFrightened: 1.00,
    ghostSpeedNormal: 0.95,
    ghostSpeedTunnel: 0.50,
    ghostSpeedFrightened: 0.60,
    elroy1Dots: 50,
    elroy1Speed: 1.00,
    elroy2Dots: 25,
    elroy2Speed: 1.05,
    frightenedDurationSeconds: 2,
    frightenedFlashes: 5,
    scatterChaseWaves: [
      { scatter: 5, chase: 20 },
      { scatter: 5, chase: 20 },
      { scatter: 5, chase: 1037 },
      { scatter: 0.016, chase: 999999 }
    ]
  },
  // Level 8: Melon
  {
    levelNumber: 8,
    fruit: 'MELON',
    fruitPoints: 1000,
    pacmanSpeedNormal: 1.00,
    pacmanSpeedDots: 0.87,
    pacmanSpeedFrightened: 1.00,
    ghostSpeedNormal: 0.95,
    ghostSpeedTunnel: 0.50,
    ghostSpeedFrightened: 0.60,
    elroy1Dots: 50,
    elroy1Speed: 1.00,
    elroy2Dots: 25,
    elroy2Speed: 1.05,
    frightenedDurationSeconds: 2,
    frightenedFlashes: 5,
    scatterChaseWaves: [
      { scatter: 5, chase: 20 },
      { scatter: 5, chase: 20 },
      { scatter: 5, chase: 1037 },
      { scatter: 0.016, chase: 999999 }
    ]
  },
  // Level 9: Galaxian Flagship
  {
    levelNumber: 9,
    fruit: 'GALAXIAN',
    fruitPoints: 2000,
    pacmanSpeedNormal: 1.00,
    pacmanSpeedDots: 0.87,
    pacmanSpeedFrightened: 1.00,
    ghostSpeedNormal: 0.95,
    ghostSpeedTunnel: 0.50,
    ghostSpeedFrightened: 0.60,
    elroy1Dots: 60,
    elroy1Speed: 1.00,
    elroy2Dots: 30,
    elroy2Speed: 1.05,
    frightenedDurationSeconds: 1,
    frightenedFlashes: 3,
    scatterChaseWaves: [
      { scatter: 5, chase: 20 },
      { scatter: 5, chase: 20 },
      { scatter: 5, chase: 1037 },
      { scatter: 0.016, chase: 999999 }
    ]
  },
  // Level 11: Bell
  {
    levelNumber: 11,
    fruit: 'BELL',
    fruitPoints: 3000,
    pacmanSpeedNormal: 1.00,
    pacmanSpeedDots: 0.87,
    pacmanSpeedFrightened: 1.00,
    ghostSpeedNormal: 0.95,
    ghostSpeedTunnel: 0.50,
    ghostSpeedFrightened: 0.60,
    elroy1Dots: 70,
    elroy1Speed: 1.00,
    elroy2Dots: 35,
    elroy2Speed: 1.05,
    frightenedDurationSeconds: 2,
    frightenedFlashes: 5,
    scatterChaseWaves: [
      { scatter: 5, chase: 20 },
      { scatter: 5, chase: 20 },
      { scatter: 5, chase: 1037 },
      { scatter: 0.016, chase: 999999 }
    ]
  },
  // Level 13+: Key
  {
    levelNumber: 13,
    fruit: 'KEY',
    fruitPoints: 5000,
    pacmanSpeedNormal: 1.00,
    pacmanSpeedDots: 0.87,
    pacmanSpeedFrightened: 1.00,
    ghostSpeedNormal: 0.95,
    ghostSpeedTunnel: 0.50,
    ghostSpeedFrightened: 0.60,
    elroy1Dots: 100,
    elroy1Speed: 1.00,
    elroy2Dots: 50,
    elroy2Speed: 1.05,
    frightenedDurationSeconds: 0, // Level 17+ has 0 seconds frightened
    frightenedFlashes: 0,
    scatterChaseWaves: [
      { scatter: 5, chase: 20 },
      { scatter: 5, chase: 20 },
      { scatter: 5, chase: 1037 },
      { scatter: 0.016, chase: 999999 }
    ]
  }
];

export interface DifficultyTuningInfo {
  id: Difficulty;
  label: string;
  name: string;
  badge: string;
  ghostSpeedPct: string;
  pacmanSpeedPct: string;
  frightenedTime: string;
  description: string;
}

export const DIFFICULTY_TUNING: Record<Difficulty, DifficultyTuningInfo> = {
  casual: {
    id: 'casual',
    label: 'EASY',
    name: 'Easy Modus',
    badge: 'Relaxed & Vergevingsgezind',
    ghostSpeedPct: '75% (-25% rustiger)',
    pacmanSpeedPct: '105% (+5% wendbaarder)',
    frightenedTime: '+60% langere blauwe tijd (min. 6s)',
    description: 'Ideaal voor beginners: spoken bewegen merkbaar rustiger en zijn veel makkelijker te ontwijken.'
  },
  classic: {
    id: 'classic',
    label: 'CLASSIC',
    name: 'Classic 1980 Arcade',
    badge: '100% Origineel Namco',
    ghostSpeedPct: '100% (Originele arcade)',
    pacmanSpeedPct: '100% (Originele arcade)',
    frightenedTime: 'Originele arcade timers',
    description: 'De authentieke 1980 arcade ervaring met originele Namco ROM-snelheden en timer-cycli.'
  },
  turbo: {
    id: 'turbo',
    label: 'EXPERT',
    name: 'Expert Turbo',
    badge: 'Snel & Uitdagend',
    ghostSpeedPct: '115% (+15% snellere spoken)',
    pacmanSpeedPct: '118% (+18% turbosnelheid)',
    frightenedTime: '-40% kortere blauwe tijd (min. 2s)',
    description: 'Voor ervaren spelers: hoog tempo, agressieve achtervolging door spoken en kortere blauw-tijd.'
  }
};

export function getLevelConfig(level: number, difficulty: Difficulty = 'classic'): LevelConfig {
  let baseConfig: LevelConfig;
  if (level <= 1) baseConfig = LEVEL_CONFIGS[0];
  else if (level === 2) baseConfig = LEVEL_CONFIGS[1];
  else if (level === 3) baseConfig = LEVEL_CONFIGS[2];
  else if (level === 4) baseConfig = LEVEL_CONFIGS[3];
  else if (level === 5) baseConfig = LEVEL_CONFIGS[4];
  else if (level === 6) baseConfig = LEVEL_CONFIGS[5];
  else if (level === 7 || level === 8) baseConfig = LEVEL_CONFIGS[6];
  else if (level >= 9 && level <= 10) baseConfig = LEVEL_CONFIGS[8];
  else if (level >= 11 && level <= 12) baseConfig = LEVEL_CONFIGS[9];
  else baseConfig = LEVEL_CONFIGS[10];

  // Adjust for difficulty mode
  const copy = { ...baseConfig, levelNumber: level };
  if (difficulty === 'casual') {
    // EASY: Spoken -25% snelheid, tunnel -30%, Pac-Man +5%, verlengde blauwe-tijd
    copy.ghostSpeedNormal *= 0.75;
    copy.ghostSpeedTunnel *= 0.70;
    copy.pacmanSpeedNormal *= 1.05;
    copy.pacmanSpeedDots *= 1.05;
    copy.frightenedDurationSeconds = Math.max(Math.round(copy.frightenedDurationSeconds * 1.6), 6);
    copy.elroy1Speed *= 0.85;
    copy.elroy2Speed *= 0.85;
  } else if (difficulty === 'turbo') {
    // EXPERT: Spoken +15% snelheid, tunnel +10%, Pac-Man +18% turbo, kortere blauwe-tijd
    copy.pacmanSpeedNormal *= 1.18;
    copy.pacmanSpeedDots *= 1.18;
    copy.ghostSpeedNormal *= 1.15;
    copy.ghostSpeedTunnel *= 1.10;
    copy.frightenedDurationSeconds = Math.max(Math.floor(copy.frightenedDurationSeconds * 0.6), 2);
    copy.elroy1Speed *= 1.15;
    copy.elroy2Speed *= 1.15;
  }
  // CLASSIC: 100% authentieke originele 1980 Namco specificaties
  return copy;
}
