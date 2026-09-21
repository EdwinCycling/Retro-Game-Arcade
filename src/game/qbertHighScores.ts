/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Q*bert High Scores Manager (BBC Micro / Acorn / Arcade)
 */

import { HighScoreEntry } from './qbertTypes';

const STORAGE_KEY = 'arcade_vault_qbert_high_scores';

const DEFAULT_SCORES: HighScoreEntry[] = [
  { score: 24850, initials: 'QBT', date: '1983-04-12', levelReached: 5 },
  { score: 18200, initials: 'COI', date: '1983-04-20', levelReached: 4 },
  { score: 14500, initials: 'SUP', date: '1983-05-01', levelReached: 3 },
  { score: 9800,  initials: 'BBC', date: '1983-05-18', levelReached: 2 },
  { score: 5200,  initials: 'ACN', date: '1983-06-02', levelReached: 1 },
];

export function getQbertScores(): HighScoreEntry[] {
  if (typeof window === 'undefined') return DEFAULT_SCORES;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_SCORES));
      return DEFAULT_SCORES;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_SCORES;
  } catch {
    return DEFAULT_SCORES;
  }
}

export function saveQbertScore(score: number, initials: string, levelReached: number): HighScoreEntry[] {
  const current = getQbertScores();
  const cleanInitials = (initials || 'QBT').trim().slice(0, 3).toUpperCase();
  const today = new Date().toISOString().split('T')[0];

  const updated = [...current, { score, initials: cleanInitials, date: today, levelReached }]
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // ignore
  }

  return updated;
}
