/**
 * Level & Wave Configuration for Demon Attack (1982)
 * Authentic progression through Krydos planet waves with increasing enemy types,
 * wing colors, splitting demons (starting wave 5), guided firepower, and dive bombers.
 */

import { WaveConfig } from './demonAttackTypes';

export const DEMON_WAVE_CONFIGS: WaveConfig[] = [
  // Wave 1: Maroong/Red classic bird demons, single straight bombs, 10 pts
  {
    waveNumber: 1,
    demonColor: '#e11d48', // Crimson Red
    groundColor: '#9f1239',
    demonType: 'classic',
    canSplit: false,
    canDive: false,
    basePoints: 10,
    splitPoints: 20,
    divePoints: 40,
    demonCount: 3,
    fireIntervalMin: 1.8,
    fireIntervalMax: 3.2,
    demonSpeedX: 85,
    guidedBombs: false,
    description: 'Wave 1: Rode Gevleugelde Demonen (10 ptn). Schiet ze neer voor ze Krydos bestoken.'
  },
  // Wave 2: Yellow/Gold demons, slightly faster, 10 pts
  {
    waveNumber: 2,
    demonColor: '#eab308', // Radiant Gold
    groundColor: '#854d0e',
    demonType: 'classic',
    canSplit: false,
    canDive: false,
    basePoints: 10,
    splitPoints: 20,
    divePoints: 40,
    demonCount: 3,
    fireIntervalMin: 1.5,
    fireIntervalMax: 2.8,
    demonSpeedX: 100,
    guidedBombs: false,
    description: 'Wave 2: Gouden Demonen (10 ptn). Verhoogde snelheid en hevigere bommenwerpers.'
  },
  // Wave 3: Azure/Cyan demons, faster, 15 pts, slight angle fire
  {
    waveNumber: 3,
    demonColor: '#06b6d4', // Cyan
    groundColor: '#155e75',
    demonType: 'bird',
    canSplit: false,
    canDive: true,
    basePoints: 15,
    splitPoints: 30,
    divePoints: 60,
    demonCount: 3,
    fireIntervalMin: 1.3,
    fireIntervalMax: 2.5,
    demonSpeedX: 115,
    guidedBombs: false,
    description: 'Wave 3: Cyaan Duik-Demonen (15 ptn / 60 ptn duik). Let op plotse duikvluchten!'
  },
  // Wave 4: Emerald Green bird demons, faster diving, 15 pts
  {
    waveNumber: 4,
    demonColor: '#10b981', // Emerald
    groundColor: '#064e3b',
    demonType: 'bird',
    canSplit: false,
    canDive: true,
    basePoints: 15,
    splitPoints: 30,
    divePoints: 60,
    demonCount: 3,
    fireIntervalMin: 1.2,
    fireIntervalMax: 2.2,
    demonSpeedX: 130,
    guidedBombs: false,
    description: 'Wave 4: Smaragdgroene Spook-Demonen (15 ptn). Vliegensvlugge formaties.'
  },
  // Wave 5: Violet demons that SPLIT into two smaller dive-creatures! (20 pts, split 40 pts, dive 80 pts)
  {
    waveNumber: 5,
    demonColor: '#a855f7', // Violet Purple
    groundColor: '#581c87',
    demonType: 'insect',
    canSplit: true,
    canDive: true,
    basePoints: 20,
    splitPoints: 40,
    divePoints: 80,
    demonCount: 3,
    fireIntervalMin: 1.0,
    fireIntervalMax: 2.0,
    demonSpeedX: 145,
    guidedBombs: true,
    description: 'Wave 5: DE SPLITSERS! (20 ptn). Geraakte demonen splitsen in 2 dodelijke wezens!'
  },
  // Wave 6: Amber/Orange splitting demons, faster split diving, 20 pts
  {
    waveNumber: 6,
    demonColor: '#f97316', // Orange Flame
    groundColor: '#7c2d12',
    demonType: 'insect',
    canSplit: true,
    canDive: true,
    basePoints: 20,
    splitPoints: 40,
    divePoints: 80,
    demonCount: 3,
    fireIntervalMin: 0.9,
    fireIntervalMax: 1.8,
    demonSpeedX: 160,
    guidedBombs: true,
    description: 'Wave 6: Vuur Splits-Demonen (20/40/80 ptn). Dubbele kamikaze duikvluchten.'
  },
  // Wave 7+: Deep Neon Magenta elite demons with guided heat-seeking lasers (25+ pts)
  {
    waveNumber: 7,
    demonColor: '#f43f5e', // Rose Neon
    groundColor: '#881337',
    demonType: 'insect',
    canSplit: true,
    canDive: true,
    basePoints: 25,
    splitPoints: 50,
    divePoints: 100,
    demonCount: 3,
    fireIntervalMin: 0.8,
    fireIntervalMax: 1.5,
    demonSpeedX: 175,
    guidedBombs: true,
    description: 'Wave 7+: Krydos Opper-Legioen. Geleide plasmastralen en constante splitsing!'
  }
];

export function getWaveConfig(wave: number): WaveConfig {
  if (wave <= DEMON_WAVE_CONFIGS.length) {
    return DEMON_WAVE_CONFIGS[wave - 1];
  }

  // Endless progression past wave 7
  const base = DEMON_WAVE_CONFIGS[DEMON_WAVE_CONFIGS.length - 1];
  const loop = wave - DEMON_WAVE_CONFIGS.length;
  const colors = ['#f43f5e', '#38bdf8', '#fbbf24', '#34d399', '#c084fc'];
  const groundColors = ['#881337', '#0369a1', '#92400e', '#065f46', '#6b21a8'];
  const colorIndex = (wave - 1) % colors.length;

  return {
    waveNumber: wave,
    demonColor: colors[colorIndex],
    groundColor: groundColors[colorIndex],
    demonType: 'insect',
    canSplit: true,
    canDive: true,
    basePoints: Math.min(35, 25 + loop * 5),
    splitPoints: Math.min(70, 50 + loop * 10),
    divePoints: Math.min(140, 100 + loop * 20),
    demonCount: 3,
    fireIntervalMin: Math.max(0.5, 0.8 - loop * 0.05),
    fireIntervalMax: Math.max(1.1, 1.5 - loop * 0.08),
    demonSpeedX: Math.min(220, 175 + loop * 10),
    guidedBombs: true,
    description: `Wave ${wave}: Meesterklasse Demon Legioen! Maximale vijandelijke agressie.`
  };
}
