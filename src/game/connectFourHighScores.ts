/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ConnectFourScoreEntry {
  id: string;
  initials: string;
  score: number;
  moves: number;
  aiDifficulty: string;
  date: string;
  note?: string;
}

const STORAGE_KEY = 'arcade_vault_connect_four_scores';

const DEFAULT_SCORES: ConnectFourScoreEntry[] = [
  { id: '1', initials: 'YOU', score: 2800, moves: 12, aiDifficulty: 'grandmaster', date: '1974-04-12', note: 'Klassieke Vier op een Rij Zege' },
  { id: '2', initials: 'MB', score: 2400, moves: 14, aiDifficulty: 'tactician', date: '1974-05-01', note: 'Milton Bradley Meesterzet' },
  { id: '3', initials: 'C64', score: 1900, moves: 18, aiDifficulty: 'tactician', date: '1982-11-20', note: 'Diagonale Vaste Valstrik' },
  { id: '4', initials: 'RED', score: 1500, moves: 22, aiDifficulty: 'novice', date: '1985-06-15', note: 'Verticale Snelle Vieuw' }
];

export function getConnectFourHighScores(): ConnectFourScoreEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SCORES;
    return JSON.parse(raw);
  } catch {
    return DEFAULT_SCORES;
  }
}

export function saveConnectFourHighScore(entry: Omit<ConnectFourScoreEntry, 'id'>): ConnectFourScoreEntry[] {
  const current = getConnectFourHighScores();
  const newEntry: ConnectFourScoreEntry = {
    ...entry,
    id: `cf-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`
  };

  const updated = [...current, newEntry].sort((a, b) => b.score - a.score).slice(0, 10);

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // LocalStorage fallback
  }

  return updated;
}
