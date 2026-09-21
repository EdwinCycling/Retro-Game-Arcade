/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * PlayStation 1 Memory Card High Scores & Game Records
 */

export interface Ps1HighScore {
  discId: string;
  gameTitle: string;
  score: number;
  wumpasOrLap: string;
  date: string;
}

const STORAGE_KEY = 'retro_arcade_ps1_high_scores';

export function getPs1HighScores(): Ps1HighScore[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [
        { discId: 'crash_bandicoot', gameTitle: 'Crash Bandicoot', score: 14200, wumpasOrLap: '78 Wumpas (Level 2)', date: '1996-09-09' },
        { discId: 'ridge_racer', gameTitle: 'Ridge Racer', score: 230, wumpasOrLap: 'Best Lap 1:12.42', date: '1994-12-03' },
        { discId: 'tekken_3', gameTitle: 'Tekken 3', score: 9800, wumpasOrLap: '10 Match Streak', date: '1998-03-26' }
      ];
    }
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function savePs1HighScore(entry: Ps1HighScore) {
  try {
    const current = getPs1HighScores();
    current.push(entry);
    current.sort((a, b) => b.score - a.score);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(current.slice(0, 10)));
  } catch (err) {
    console.warn('Failed to save PS1 High Score:', err);
  }
}
