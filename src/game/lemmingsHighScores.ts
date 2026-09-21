/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Lemmings (1991 DMA Design / Psygnosis) - High Scores & Persistence
 */

import { LemmingsScore } from './lemmingsTypes';

const STORAGE_KEY = 'lemmings_1991_high_scores';

const DEFAULT_SCORES: LemmingsScore[] = [
  { id: '1', initials: 'DMA', score: 9850, levelTitle: 'Just Dig!', savedCount: 20, totalCount: 20, savedPercent: 100, date: '1991-02-14' },
  { id: '2', initials: 'DAV', score: 8740, levelTitle: 'Only Floaters Can Survive This', savedCount: 19, totalCount: 20, savedPercent: 95, date: '1991-02-15' },
  { id: '3', initials: 'MIK', score: 7620, levelTitle: 'Tailor-made for Blockers', savedCount: 27, totalCount: 30, savedPercent: 90, date: '1991-02-20' },
  { id: '4', initials: 'RUS', score: 6510, levelTitle: 'Now Use Miners and Climbers', savedCount: 34, totalCount: 40, savedPercent: 85, date: '1991-03-01' },
  { id: '5', initials: 'PSY', score: 5400, levelTitle: 'We All Fall Down', savedCount: 42, totalCount: 50, savedPercent: 84, date: '1991-03-15' },
  { id: '6', initials: 'C64', score: 4300, levelTitle: 'The Steel Mines of DMA', savedCount: 50, totalCount: 60, savedPercent: 83, date: '1993-10-10' }
];

export function getLemmingsScores(): LemmingsScore[] {
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

export function saveLemmingsScore(
  initials: string,
  score: number,
  levelTitle: string,
  savedCount: number,
  totalCount: number
): LemmingsScore[] {
  const current = getLemmingsScores();
  const savedPercent = totalCount > 0 ? Math.round((savedCount / totalCount) * 100) : 0;
  
  const newEntry: LemmingsScore = {
    id: Date.now().toString(),
    initials: initials.toUpperCase().slice(0, 3) || 'LEM',
    score,
    levelTitle,
    savedCount,
    totalCount,
    savedPercent,
    date: new Date().toISOString().split('T')[0]
  };

  const updated = [...current, newEntry]
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // Ignore storage errors
  }

  return updated;
}
