/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Arcadians - All Wave Levels & Progression Configurations
 * Complete wave hierarchy with speed and difficulty curves.
 */

import { WaveConfig } from './arcadiansTypes';

export const CANVAS_WIDTH = 560;
export const CANVAS_HEIGHT = 680;

// Curated definitions for Waves 1 through 20+
export const ARCADIANS_WAVES: WaveConfig[] = [
  {
    waveNumber: 1,
    title: 'WAVE 1: PATROL PROBE',
    starSpeed: 1.0,
    formationSwaySpeed: 1.2,
    formationSwayRange: 35,
    diveIntervalMs: 2400,
    maxSimultaneousDivers: 2,
    alienDiveSpeed: 2.5,
    bulletFireChance: 0.15,
    alienBulletSpeed: 3.2,
    escortProbability: 0.2,
    scoreMultiplier: 1.0,
    badgeType: 'single',
  },
  {
    waveNumber: 2,
    title: 'WAVE 2: SCOUT SWARM',
    starSpeed: 1.2,
    formationSwaySpeed: 1.4,
    formationSwayRange: 42,
    diveIntervalMs: 2000,
    maxSimultaneousDivers: 3,
    alienDiveSpeed: 2.8,
    bulletFireChance: 0.22,
    alienBulletSpeed: 3.5,
    escortProbability: 0.35,
    scoreMultiplier: 1.1,
    badgeType: 'single',
  },
  {
    waveNumber: 3,
    title: 'WAVE 3: HORNET STRIKE',
    starSpeed: 1.4,
    formationSwaySpeed: 1.6,
    formationSwayRange: 48,
    diveIntervalMs: 1700,
    maxSimultaneousDivers: 3,
    alienDiveSpeed: 3.2,
    bulletFireChance: 0.3,
    alienBulletSpeed: 3.8,
    escortProbability: 0.5,
    scoreMultiplier: 1.2,
    badgeType: 'single',
  },
  {
    waveNumber: 4,
    title: 'WAVE 4: FLAGSHIP FLANK',
    starSpeed: 1.6,
    formationSwaySpeed: 1.8,
    formationSwayRange: 55,
    diveIntervalMs: 1400,
    maxSimultaneousDivers: 4,
    alienDiveSpeed: 3.5,
    bulletFireChance: 0.38,
    alienBulletSpeed: 4.2,
    escortProbability: 0.65,
    scoreMultiplier: 1.35,
    badgeType: 'single',
  },
  {
    waveNumber: 5,
    title: 'WAVE 5: ARCADIANS ARMADA',
    starSpeed: 1.9,
    formationSwaySpeed: 2.1,
    formationSwayRange: 60,
    diveIntervalMs: 1200,
    maxSimultaneousDivers: 4,
    alienDiveSpeed: 3.9,
    bulletFireChance: 0.45,
    alienBulletSpeed: 4.6,
    escortProbability: 0.8,
    scoreMultiplier: 1.5,
    badgeType: 'stripe5',
  },
  {
    waveNumber: 6,
    title: 'WAVE 6: DEEP SPACE FURY',
    starSpeed: 2.1,
    formationSwaySpeed: 2.3,
    formationSwayRange: 65,
    diveIntervalMs: 1100,
    maxSimultaneousDivers: 5,
    alienDiveSpeed: 4.2,
    bulletFireChance: 0.5,
    alienBulletSpeed: 4.9,
    escortProbability: 0.85,
    scoreMultiplier: 1.65,
    badgeType: 'single',
  },
  {
    waveNumber: 7,
    title: 'WAVE 7: METEOR DRIFT BLITZ',
    starSpeed: 2.3,
    formationSwaySpeed: 2.5,
    formationSwayRange: 68,
    diveIntervalMs: 1000,
    maxSimultaneousDivers: 5,
    alienDiveSpeed: 4.5,
    bulletFireChance: 0.55,
    alienBulletSpeed: 5.2,
    escortProbability: 0.88,
    scoreMultiplier: 1.8,
    badgeType: 'single',
  },
  {
    waveNumber: 8,
    title: 'WAVE 8: DUAL HORNET SWOOP',
    starSpeed: 2.5,
    formationSwaySpeed: 2.7,
    formationSwayRange: 72,
    diveIntervalMs: 950,
    maxSimultaneousDivers: 6,
    alienDiveSpeed: 4.8,
    bulletFireChance: 0.6,
    alienBulletSpeed: 5.5,
    escortProbability: 0.9,
    scoreMultiplier: 2.0,
    badgeType: 'single',
  },
  {
    waveNumber: 9,
    title: 'WAVE 9: HYPER DRIVE ASSAULT',
    starSpeed: 2.7,
    formationSwaySpeed: 2.9,
    formationSwayRange: 75,
    diveIntervalMs: 900,
    maxSimultaneousDivers: 6,
    alienDiveSpeed: 5.1,
    bulletFireChance: 0.65,
    alienBulletSpeed: 5.8,
    escortProbability: 0.92,
    scoreMultiplier: 2.2,
    badgeType: 'single',
  },
  {
    waveNumber: 10,
    title: 'WAVE 10: ACORNSOFT LEGEND',
    starSpeed: 3.0,
    formationSwaySpeed: 3.2,
    formationSwayRange: 80,
    diveIntervalMs: 800,
    maxSimultaneousDivers: 7,
    alienDiveSpeed: 5.5,
    bulletFireChance: 0.7,
    alienBulletSpeed: 6.2,
    escortProbability: 0.95,
    scoreMultiplier: 2.5,
    badgeType: 'star10',
  },
  {
    waveNumber: 15,
    title: 'WAVE 15: QUANTUM DIVE STORM',
    starSpeed: 3.5,
    formationSwaySpeed: 3.6,
    formationSwayRange: 85,
    diveIntervalMs: 700,
    maxSimultaneousDivers: 8,
    alienDiveSpeed: 6.0,
    bulletFireChance: 0.78,
    alienBulletSpeed: 6.8,
    escortProbability: 0.98,
    scoreMultiplier: 3.0,
    badgeType: 'stripe5',
  },
  {
    waveNumber: 20,
    title: 'WAVE 20: EMPEROR COMMAND',
    starSpeed: 4.0,
    formationSwaySpeed: 4.0,
    formationSwayRange: 90,
    diveIntervalMs: 600,
    maxSimultaneousDivers: 9,
    alienDiveSpeed: 6.5,
    bulletFireChance: 0.85,
    alienBulletSpeed: 7.5,
    escortProbability: 1.0,
    scoreMultiplier: 4.0,
    badgeType: 'crown20',
  },
];

/**
 * Returns wave configuration for any wave number (1 to infinite).
 * Seamlessly generates procedural high-level configs if wave > 20.
 */
export function getWaveConfig(waveNumber: number): WaveConfig {
  const existing = ARCADIANS_WAVES.find((w) => w.waveNumber === waveNumber);
  if (existing) return existing;

  // Find nearest lower config
  const clampedBase = [...ARCADIANS_WAVES]
    .reverse()
    .find((w) => w.waveNumber <= waveNumber) || ARCADIANS_WAVES[0];

  const scale = Math.min(3.5, 1 + (waveNumber - 1) * 0.08);

  return {
    waveNumber,
    title: `WAVE ${waveNumber}: SECTOR EXTREME`,
    starSpeed: Math.min(4.5, clampedBase.starSpeed * scale),
    formationSwaySpeed: Math.min(4.2, clampedBase.formationSwaySpeed * (1 + waveNumber * 0.04)),
    formationSwayRange: Math.min(95, clampedBase.formationSwayRange + waveNumber * 0.5),
    diveIntervalMs: Math.max(500, Math.floor(clampedBase.diveIntervalMs / (1 + (waveNumber - 1) * 0.05))),
    maxSimultaneousDivers: Math.min(10, clampedBase.maxSimultaneousDivers + Math.floor(waveNumber / 3)),
    alienDiveSpeed: Math.min(7.2, clampedBase.alienDiveSpeed * (1 + (waveNumber - 1) * 0.04)),
    bulletFireChance: Math.min(0.9, clampedBase.bulletFireChance + 0.02 * (waveNumber - 1)),
    alienBulletSpeed: Math.min(8.0, clampedBase.alienBulletSpeed + 0.15 * (waveNumber - 1)),
    escortProbability: Math.min(1.0, 0.7 + waveNumber * 0.03),
    scoreMultiplier: 1.0 + (waveNumber - 1) * 0.25,
    badgeType: waveNumber >= 20 ? 'crown20' : waveNumber % 10 === 0 ? 'star10' : waveNumber % 5 === 0 ? 'stripe5' : 'single',
  };
}
