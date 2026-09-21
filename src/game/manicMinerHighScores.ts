/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * High score storage for Manic Miner (1983)
 */

export interface ManicMinerHighScore {
  initials: string;
  score: number;
  cavern: string;
  date: string;
}

const STORAGE_KEY = 'arcade_manic_miner_high_scores_v1';

const DEFAULT_SCORES: ManicMinerHighScore[] = [
  { initials: 'MSM', score: 18450, cavern: 'Final Barrier', date: '1983-06-15' },
  { initials: 'BUG', score: 14200, cavern: 'Solar Power', date: '1983-07-20' },
  { initials: 'ZXS', score: 11800, cavern: 'The Bank', date: '1983-08-01' },
  { initials: 'SPE', score: 9500, cavern: 'Amoebatrons', date: '1983-09-12' },
  { initials: 'WIL', score: 7200, cavern: "Eugene's Lair", date: '1983-10-04' },
  { initials: 'CLV', score: 4850, cavern: 'Cold Room', date: '1983-11-22' },
];

export function getManicMinerScores(): ManicMinerHighScore[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SCORES;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_SCORES;
  } catch {
    return DEFAULT_SCORES;
  }
}

export function saveManicMinerScore(score: number, initials: string, cavern: string) {
  try {
    const scores = getManicMinerScores();
    const cleanInitials = (initials || 'WIL').toUpperCase().slice(0, 3);
    const newEntry: ManicMinerHighScore = {
      initials: cleanInitials,
      score,
      cavern,
      date: new Date().toISOString().slice(0, 10),
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
