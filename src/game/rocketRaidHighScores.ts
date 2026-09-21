/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Rocket Raid (Acornsoft 1982) High Scores Manager
 */

import { HighScoreEntry } from './rocketRaidTypes';

const STORAGE_KEY = 'arcade_vault_rocket_raid_high_scores';

const DEFAULT_SCORES: HighScoreEntry[] = [
  { score: 18450, initials: 'JON', date: '1982-10-14', sectionReached: 5 },
  { score: 14200, initials: 'ACN', date: '1982-10-15', sectionReached: 4 },
  { score: 11950, initials: 'BBC', date: '1982-10-20', sectionReached: 3 },
  { score: 8600,  initials: 'ELN', date: '1982-11-01', sectionReached: 2 },
  { score: 5400,  initials: 'BEE', date: '1982-11-12', sectionReached: 1 },
];

export function getRocketRaidScores(): HighScoreEntry[] {
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

export function saveRocketRaidScore(score: number, initials: string, sectionReached: number): HighScoreEntry[] {
  const current = getRocketRaidScores();
  const cleanInitials = (initials || 'RAID').trim().slice(0, 3).toUpperCase();
  const today = new Date().toISOString().split('T')[0];

  const updated = [...current, { score, initials: cleanInitials, date: today, sectionReached }]
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // ignore
  }

  return updated;
}
