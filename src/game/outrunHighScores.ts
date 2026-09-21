/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Sega OutRun (1986) - High Score Local Persistence
 */

import { OutrunHighScore } from './outrunTypes';

const STORAGE_KEY = 'arcade_outrun_high_scores';

const DEFAULT_SCORES: OutrunHighScore[] = [
  { initials: 'YU.', score: 18450200, stageReached: 5, date: '1986-09-20' },
  { initials: 'KAW', score: 14200800, stageReached: 4, date: '1986-09-20' },
  { initials: 'SEG', score: 11980000, stageReached: 3, date: '1986-09-20' },
  { initials: 'FER', score: 9450000, stageReached: 2, date: '1986-09-20' },
  { initials: 'RUN', score: 7120000, stageReached: 2, date: '1986-09-20' },
  { initials: 'ACE', score: 5890000, stageReached: 1, date: '1986-09-20' },
];

export function getOutrunScores(): OutrunHighScore[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SCORES;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
  } catch {
    // Fallback
  }
  return DEFAULT_SCORES;
}

export function saveOutrunScore(score: number, initials: string, stageReached: number): OutrunHighScore[] {
  const current = getOutrunScores();
  const cleanInitials = (initials || 'ACE').trim().toUpperCase().slice(0, 3).padEnd(3, '.');
  const newEntry: OutrunHighScore = {
    initials: cleanInitials,
    score: Math.max(0, Math.floor(score)),
    stageReached,
    date: new Date().toISOString().split('T')[0],
  };

  const updated = [...current, newEntry]
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // Ignore storage quota
  }

  return updated;
}
