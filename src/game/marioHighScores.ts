/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Mario Bros. (1983 Nintendo Arcade) - High Scores & Stats Storage
 */

export interface MarioHighScore {
  initials: string;
  score: number;
  phase: number;
  character: 'MARIO' | 'LUIGI';
  date: string;
}

const STORAGE_KEY = 'arcade_mario_high_scores_v1';

const DEFAULT_HIGH_SCORES: MarioHighScore[] = [
  { initials: 'MAR', score: 48900, phase: 8, character: 'MARIO', date: '1983-07-14' },
  { initials: 'LUI', score: 36400, phase: 6, character: 'LUIGI', date: '1983-07-15' },
  { initials: 'SHI', score: 28500, phase: 5, character: 'MARIO', date: '1983-07-18' },
  { initials: 'GUN', score: 19800, phase: 4, character: 'LUIGI', date: '1983-07-22' },
  { initials: 'EDW', score: 12400, phase: 3, character: 'MARIO', date: '1983-08-01' }
];

export function getMarioHighScores(): MarioHighScore[] {
  if (typeof window === 'undefined') return DEFAULT_HIGH_SCORES;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_HIGH_SCORES));
      return DEFAULT_HIGH_SCORES;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return DEFAULT_HIGH_SCORES;
  } catch {
    return DEFAULT_HIGH_SCORES;
  }
}

export function saveMarioHighScore(newEntry: MarioHighScore): MarioHighScore[] {
  if (typeof window === 'undefined') return [];
  try {
    const scores = getMarioHighScores();
    const updated = [...scores, newEntry]
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return [];
  }
}
