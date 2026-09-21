/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * High scores manager for FRAK! (BBC Micro 1984)
 */

import { FrakHighScore } from './frakTypes';

const STORAGE_KEY = 'retro_arcade_frak_high_scores';

const DEFAULT_SCORES: FrakHighScore[] = [
  { initials: 'N.P', score: 24850, level: 3, date: '1984-06-12' }, // Nick Pelling (Developer)
  { initials: 'TRG', score: 18400, level: 3, date: '1984-08-01' }, // Trogg the Caveman
  { initials: 'ARD', score: 14200, level: 2, date: '1984-09-15' }, // Aardvark Software
  { initials: 'EDW', score: 11500, level: 2, date: '2025-01-20' },
  { initials: 'BBC', score: 8600, level: 1, date: '1984-11-30' },
];

export function getFrakHighScores(): FrakHighScore[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return DEFAULT_SCORES;
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_SCORES;
  } catch {
    return DEFAULT_SCORES;
  }
}

export function saveFrakHighScore(initials: string, score: number, level: number): FrakHighScore[] {
  try {
    const current = getFrakHighScores();
    const cleanInitials = (initials.trim().toUpperCase().slice(0, 3) || 'AAA');
    const newEntry: FrakHighScore = {
      initials: cleanInitials,
      score,
      level,
      date: new Date().toISOString().split('T')[0],
    };

    const updated = [...current, newEntry]
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return DEFAULT_SCORES;
  }
}
