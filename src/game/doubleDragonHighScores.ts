/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Double Dragon (1987) - High Scores Management
 */

export interface DoubleDragonScore {
  id: string;
  initials: string;
  score: number;
  stage: number;
  thugsKO: number;
  date: string;
}

const STORAGE_KEY = 'arcade_vault_double_dragon_scores';

const DEFAULT_SCORES: DoubleDragonScore[] = [
  { id: '1', initials: 'BLY', score: 48500, stage: 3, thugsKO: 42, date: '1987-07-15' },
  { id: '2', initials: 'JMY', score: 39200, stage: 2, thugsKO: 35, date: '1987-08-20' },
  { id: '3', initials: 'ABO', score: 28400, stage: 2, thugsKO: 24, date: '1987-10-05' },
  { id: '4', initials: 'WLM', score: 19800, stage: 1, thugsKO: 18, date: '1988-01-12' },
  { id: '5', initials: 'MRN', score: 12500, stage: 1, thugsKO: 10, date: '1988-04-30' }
];

export function getDoubleDragonScores(): DoubleDragonScore[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SCORES;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_SCORES;
  } catch {
    return DEFAULT_SCORES;
  }
}

export function saveDoubleDragonScore(entry: Omit<DoubleDragonScore, 'id'>): DoubleDragonScore[] {
  const current = getDoubleDragonScores();
  const newEntry: DoubleDragonScore = {
    ...entry,
    id: Date.now().toString()
  };

  const updated = [...current, newEntry]
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // Ignore quota errors
  }

  return updated;
}
