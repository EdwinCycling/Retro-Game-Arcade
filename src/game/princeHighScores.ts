/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Prince of Persia (1989/1990) - High Scores & Dungeon Records
 */

export interface PrinceScore {
  id: string;
  initials: string;
  minutesRemaining: number;
  secondsRemaining: number;
  level: number;
  guardsDefeated: number;
  potionsFound: number;
  date: string;
}

const STORAGE_KEY = 'arcade_vault_prince_scores';

const DEFAULT_SCORES: PrinceScore[] = [
  { id: '1', initials: 'JDM', minutesRemaining: 54, secondsRemaining: 22, level: 3, guardsDefeated: 12, potionsFound: 4, date: '1989-10-03' },
  { id: '2', initials: 'DVM', minutesRemaining: 48, secondsRemaining: 15, level: 2, guardsDefeated: 8, potionsFound: 3, date: '1990-04-12' },
  { id: '3', initials: 'JAF', minutesRemaining: 42, secondsRemaining: 50, level: 2, guardsDefeated: 6, potionsFound: 2, date: '1990-08-25' },
  { id: '4', initials: 'SUL', minutesRemaining: 35, secondsRemaining: 10, level: 1, guardsDefeated: 4, potionsFound: 2, date: '1991-01-14' },
  { id: '5', initials: 'PRN', minutesRemaining: 29, secondsRemaining: 45, level: 1, guardsDefeated: 2, potionsFound: 1, date: '1991-05-19' },
];

export function getPrinceScores(): PrinceScore[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SCORES;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_SCORES;
  } catch {
    return DEFAULT_SCORES;
  }
}

export function addPrinceScore(newScore: Omit<PrinceScore, 'id'>): PrinceScore[] {
  const current = getPrinceScores();
  const entry: PrinceScore = {
    ...newScore,
    id: Date.now().toString()
  };

  // Sort by Level DESC, then Minutes Remaining DESC
  const updated = [...current, entry]
    .sort((a, b) => {
      if (b.level !== a.level) return b.level - a.level;
      if (b.minutesRemaining !== a.minutesRemaining) return b.minutesRemaining - a.minutesRemaining;
      return b.secondsRemaining - a.secondsRemaining;
    })
    .slice(0, 10);

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {}

  return updated;
}
