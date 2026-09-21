/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Super Mario Bros. (1985 NES) - High Scores & Local Storage
 */

export interface SuperMarioScore {
  id: string;
  initials: string;
  score: number;
  world: string;
  coins: number;
  date: string;
}

const STORAGE_KEY = 'super_mario_1985_high_scores';

const DEFAULT_SCORES: SuperMarioScore[] = [
  { id: '1', initials: 'SHI', score: 85200, world: '1-4', coins: 48, date: '1985-09-13' },
  { id: '2', initials: 'KOJ', score: 64900, world: '1-3', coins: 35, date: '1985-09-15' },
  { id: '3', initials: 'TEZ', score: 48100, world: '1-2', coins: 28, date: '1985-09-20' },
  { id: '4', initials: 'MAR', score: 32500, world: '1-1', coins: 19, date: '1985-10-01' },
  { id: '5', initials: 'LUI', score: 18400, world: '1-1', coins: 11, date: '1985-10-18' },
];

export function getSuperMarioScores(): SuperMarioScore[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_SCORES));
      return DEFAULT_SCORES;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_SCORES;
  } catch {
    return DEFAULT_SCORES;
  }
}

export function saveSuperMarioScore(initials: string, score: number, world: string, coins: number): SuperMarioScore[] {
  const current = getSuperMarioScores();
  const newEntry: SuperMarioScore = {
    id: Date.now().toString(),
    initials: initials.toUpperCase().slice(0, 3) || 'MAR',
    score,
    world,
    coins,
    date: new Date().toISOString().split('T')[0],
  };

  const updated = [...current, newEntry]
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // Ignore localStorage errors
  }

  return updated;
}
