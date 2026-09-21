/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Donkey Kong (1981 Nintendo Arcade) - High Scores & Hall of Fame
 */

export interface DonkeyKongHighScore {
  id: string;
  initials: string;
  score: number;
  level: number;
  stage: string; // e.g. "25m", "50m", "75m", "100m"
  date: string;
}

const STORAGE_KEY = 'arcade_vault_donkey_kong_scores';

const DEFAULT_SCORES: DonkeyKongHighScore[] = [
  { id: '1', initials: 'DKK', score: 87400, level: 4, stage: '100m', date: '1981-07-09' },
  { id: '2', initials: 'MAR', score: 62800, level: 3, stage: '75m', date: '1981-08-14' },
  { id: '3', initials: 'JMP', score: 48900, level: 2, stage: '50m', date: '1981-10-02' },
  { id: '4', initials: 'PLN', score: 34500, level: 2, stage: '25m', date: '1982-01-20' },
  { id: '5', initials: 'SHI', score: 21200, level: 1, stage: '100m', date: '1982-04-11' },
];

export function getDonkeyKongHighScores(): DonkeyKongHighScore[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SCORES;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_SCORES;
  } catch {
    return DEFAULT_SCORES;
  }
}

export const getDonkeyKongScores = getDonkeyKongHighScores;

export function saveDonkeyKongHighScore(newScore: Omit<DonkeyKongHighScore, 'id' | 'date'>): DonkeyKongHighScore[] {
  const current = getDonkeyKongHighScores();
  const entry: DonkeyKongHighScore = {
    ...newScore,
    id: Date.now().toString(),
    date: new Date().toISOString().split('T')[0]
  };

  const updated = [...current, entry]
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {}

  return updated;
}
