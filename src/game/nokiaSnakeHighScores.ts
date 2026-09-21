/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Nokia Snake (1997) - High Scores Management
 */

export interface NokiaSnakeScore {
  id: string;
  initials: string;
  score: number;
  speed: number;
  maze: string;
  date: string;
}

const STORAGE_KEY = 'arcade_vault_nokia_snake_scores';

const DEFAULT_SCORES: NokiaSnakeScore[] = [
  { id: '1', initials: 'NOK', score: 384, speed: 7, maze: 'Classic', date: '1997-12-15' },
  { id: '2', initials: 'ARM', score: 290, speed: 5, maze: 'Classic', date: '1998-03-22' },
  { id: '3', initials: 'FIN', score: 210, speed: 4, maze: 'Labyrinth', date: '1999-07-18' },
  { id: '4', initials: 'ESPO', score: 165, speed: 3, maze: 'Classic', date: '2000-11-05' },
  { id: '5', initials: '3310', score: 120, speed: 2, maze: 'Classic', date: '2001-02-14' }
];

export function getNokiaSnakeScores(): NokiaSnakeScore[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SCORES;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_SCORES;
  } catch {
    return DEFAULT_SCORES;
  }
}

export function saveNokiaSnakeScore(entry: Omit<NokiaSnakeScore, 'id'>): NokiaSnakeScore[] {
  const current = getNokiaSnakeScores();
  const newEntry: NokiaSnakeScore = {
    ...entry,
    id: Date.now().toString()
  };

  const updated = [...current, newEntry]
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // Ignore localStorage quota errors
  }

  return updated;
}
