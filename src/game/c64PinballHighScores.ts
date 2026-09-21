/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface C64PinballScore {
  score: number;
  initials: string;
  ballsUsed: number;
  date: string;
}

const STORAGE_KEY = 'c64_3d_pinball_high_scores';

const DEFAULT_SCORES: C64PinballScore[] = [
  { score: 185000, initials: 'SW.', ballsUsed: 5, date: '1989-10-14' },
  { score: 142300, initials: 'MAS', ballsUsed: 5, date: '1989-11-02' },
  { score: 98400,  initials: 'C64', ballsUsed: 5, date: '1990-01-18' },
  { score: 65100,  initials: 'SID', ballsUsed: 5, date: '1990-03-24' },
  { score: 42000,  initials: 'VIC', ballsUsed: 5, date: '1990-05-12' },
];

export function getC64PinballScores(): C64PinballScore[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return DEFAULT_SCORES;
    const parsed = JSON.parse(data);
    if (Array.isArray(parsed) && parsed.length > 0) {
      // Filter out any corrupted or astronomical numbers (> 50,000,000)
      const valid = parsed.filter(
        (item) =>
          typeof item.score === 'number' &&
          isFinite(item.score) &&
          item.score > 0 &&
          item.score <= 50000000 &&
          typeof item.initials === 'string'
      );
      if (valid.length > 0) {
        return valid.sort((a, b) => b.score - a.score);
      }
    }
    return DEFAULT_SCORES;
  } catch {
    return DEFAULT_SCORES;
  }
}

export function saveC64PinballScore(score: number, initials: string, ballsUsed: number = 5): C64PinballScore[] {
  try {
    // Sanity limit score
    const safeScore = Math.max(0, Math.min(50000000, Math.floor(score)));
    const scores = getC64PinballScores();
    const newEntry: C64PinballScore = {
      score: safeScore,
      initials: (initials || 'C64').toUpperCase().trim().slice(0, 3) || 'C64',
      ballsUsed: Math.max(1, Math.min(5, ballsUsed)),
      date: new Date().toISOString().split('T')[0]
    };
    scores.push(newEntry);
    scores.sort((a, b) => b.score - a.score);
    const top10 = scores.slice(0, 10);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(top10));
    return top10;
  } catch {
    return DEFAULT_SCORES;
  }
}
