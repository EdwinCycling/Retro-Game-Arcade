/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Frogger (Atari 2600 / Arcade) High Scores
 */

export interface FroggerHighScore {
  initials: string;
  score: number;
  level: number;
  date: string;
}

const FROGGER_STORAGE_KEY = 'arcade_frogger_high_scores_v1';

const DEFAULT_FROGGER_SCORES: FroggerHighScore[] = [
  { initials: 'EDW', score: 4850, level: 5, date: '1982-10-12' },
  { initials: 'PAR', score: 3620, level: 4, date: '1982-10-14' },
  { initials: 'KON', score: 2940, level: 3, date: '1982-10-20' },
  { initials: 'ATA', score: 1850, level: 2, date: '1982-11-01' },
  { initials: 'FRO', score: 980, level: 1, date: '1982-11-05' },
];

export function getFroggerHighScores(): FroggerHighScore[] {
  if (typeof window === 'undefined') return DEFAULT_FROGGER_SCORES;
  try {
    const raw = localStorage.getItem(FROGGER_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(FROGGER_STORAGE_KEY, JSON.stringify(DEFAULT_FROGGER_SCORES));
      return DEFAULT_FROGGER_SCORES;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return DEFAULT_FROGGER_SCORES;
  } catch (err) {
    console.error('Failed to load Frogger high scores:', err);
    return DEFAULT_FROGGER_SCORES;
  }
}

export function saveFroggerHighScore(newEntry: FroggerHighScore): FroggerHighScore[] {
  if (typeof window === 'undefined') return [];
  try {
    const scores = getFroggerHighScores();
    scores.push(newEntry);
    scores.sort((a, b) => b.score - a.score);
    const topScores = scores.slice(0, 10);
    localStorage.setItem(FROGGER_STORAGE_KEY, JSON.stringify(topScores));
    return topScores;
  } catch (err) {
    console.error('Failed to save Frogger high score:', err);
    return [];
  }
}

export function isFroggerHighScore(score: number): boolean {
  if (score <= 0) return false;
  const scores = getFroggerHighScores();
  if (scores.length < 10) return true;
  return score > scores[scores.length - 1].score;
}
