/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Tetris High Scores Persistence (LocalStorage & Arcade Defaults)
 */

import { TetrisHighScore } from './tetrisTypes';

const STORAGE_KEY = 'arcade_tetris_highscores';

const DEFAULT_SCORES: TetrisHighScore[] = [
  { initials: 'ALP', score: 125000, lines: 112, level: 12, date: '1984-06-06' }, // Alexey Leonidovich Pajitnov
  { initials: 'VAD', score: 98400, lines: 94, level: 10, date: '1985-02-14' },  // Vadim Gerasimov
  { initials: 'HNK', score: 84200, lines: 82, level: 9, date: '1988-11-20' },   // Henk Rogers
  { initials: 'ELG', score: 65000, lines: 68, level: 7, date: '1989-04-12' },   // Elektronorgtechnica (ELORG)
  { initials: 'GBY', score: 48500, lines: 52, level: 6, date: '1989-07-31' },   // Game Boy Master
];

export function getTetrisHighScores(): TetrisHighScore[] {
  if (typeof window === 'undefined') return DEFAULT_SCORES;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_SCORES));
      return DEFAULT_SCORES;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
  } catch {
    // fallback
  }
  return DEFAULT_SCORES;
}

export function saveTetrisHighScore(newScore: Omit<TetrisHighScore, 'date'>): TetrisHighScore[] {
  const current = getTetrisHighScores();
  const entry: TetrisHighScore = {
    ...newScore,
    date: new Date().toISOString().split('T')[0],
  };

  const updated = [...current, entry]
    .sort((a, b) => b.score - a.score)
    .slice(0, 8);

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // storage quota or private mode
    }
  }

  return updated;
}
