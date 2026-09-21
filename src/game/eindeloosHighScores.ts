/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * EINDELOOS - High Scores & Progress Persistence
 */

export interface EindeloosScore {
  score: number;
  initials: string;
  date: string;
  exploredPercent: number;
  heartDestroyed: boolean;
}

const STORAGE_KEY = 'eindeloos_high_scores_c64';

const DEFAULT_SCORES: EindeloosScore[] = [
  { score: 18500, initials: 'JVA', date: '1985-04-12', exploredPercent: 42, heartDestroyed: true },
  { score: 12400, initials: 'CKR', date: '1985-05-01', exploredPercent: 31, heartDestroyed: false },
  { score: 8600, initials: 'RAD', date: '1985-06-18', exploredPercent: 22, heartDestroyed: false },
  { score: 5400, initials: 'C64', date: '1985-08-20', exploredPercent: 15, heartDestroyed: false },
  { score: 2500, initials: 'PIL', date: '1985-09-02', exploredPercent: 8, heartDestroyed: false },
];

export function getEindeloosHighScores(): EindeloosScore[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_SCORES));
      return DEFAULT_SCORES;
    }
    return JSON.parse(data);
  } catch {
    return DEFAULT_SCORES;
  }
}

export function saveEindeloosScore(newScore: EindeloosScore): EindeloosScore[] {
  try {
    const scores = getEindeloosHighScores();
    scores.push(newScore);
    scores.sort((a, b) => b.score - a.score);
    const top5 = scores.slice(0, 5);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(top5));
    return top5;
  } catch {
    return DEFAULT_SCORES;
  }
}
