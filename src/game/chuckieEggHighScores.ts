/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Chuckie Egg (BBC Micro / A&F Software 1983) High Scores
 */

export interface ChuckieEggHighScore {
  initials: string;
  score: number;
  level: number;
  date: string;
}

const STORAGE_KEY = 'arcade_chuckie_egg_high_scores_v1';

const DEFAULT_SCORES: ChuckieEggHighScore[] = [
  { initials: 'NGA', score: 18450, level: 4, date: '1983-09-12' }, // Nigel Alderton
  { initials: 'HAR', score: 14200, level: 3, date: '1983-09-15' }, // Harry
  { initials: 'BBC', score: 10850, level: 2, date: '1983-10-01' },
  { initials: 'ACN', score: 7600, level: 2, date: '1983-10-18' },
  { initials: 'EGG', score: 4100, level: 1, date: '1983-11-04' },
];

export function getChuckieEggHighScores(): ChuckieEggHighScore[] {
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
    return DEFAULT_SCORES;
  } catch (err) {
    console.error('Failed to load Chuckie Egg high scores:', err);
    return DEFAULT_SCORES;
  }
}

export function saveChuckieEggHighScore(entry: ChuckieEggHighScore): ChuckieEggHighScore[] {
  if (typeof window === 'undefined') return [];
  try {
    const scores = getChuckieEggHighScores();
    scores.push(entry);
    scores.sort((a, b) => b.score - a.score);
    const topScores = scores.slice(0, 10);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(topScores));
    return topScores;
  } catch (err) {
    console.error('Failed to save Chuckie Egg high score:', err);
    return [];
  }
}

export function isChuckieEggHighScore(score: number): boolean {
  if (score <= 0) return false;
  const scores = getChuckieEggHighScores();
  if (scores.length < 10) return true;
  return score > scores[scores.length - 1].score;
}
