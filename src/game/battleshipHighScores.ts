/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BattleshipDifficulty } from './battleshipEngine';

export interface BattleshipScoreEntry {
  id: string;
  initials: string;
  score: number;
  timeSeconds: number;
  difficulty: BattleshipDifficulty;
  mistakes: number;
  hintsUsed: number;
  corrections: number;
  date: string;
}

const STORAGE_KEY = 'arcade_vault_battleship_leaderboard_v1';

export const DEFAULT_BATTLESHIP_SCORES: BattleshipScoreEntry[] = [
  { id: '1', initials: 'ADMR', score: 11450, timeSeconds: 155, difficulty: 'hard', mistakes: 0, hintsUsed: 0, corrections: 2, date: '1982-04-12' },
  { id: '2', initials: 'NIMO', score: 9800, timeSeconds: 210, difficulty: 'hard', mistakes: 1, hintsUsed: 0, corrections: 4, date: '1983-09-05' },
  { id: '3', initials: 'VLOT', score: 8750, timeSeconds: 175, difficulty: 'medium', mistakes: 0, hintsUsed: 1, corrections: 3, date: '1984-01-18' },
  { id: '4', initials: 'NAVY', score: 8100, timeSeconds: 220, difficulty: 'medium', mistakes: 1, hintsUsed: 0, corrections: 2, date: '1985-06-25' },
  { id: '5', initials: 'EDW', score: 7600, timeSeconds: 140, difficulty: 'easy', mistakes: 0, hintsUsed: 0, corrections: 1, date: '2026-09-24' },
  { id: '6', initials: 'BIMR', score: 6900, timeSeconds: 195, difficulty: 'easy', mistakes: 1, hintsUsed: 0, corrections: 3, date: '1988-11-04' },
  { id: '7', initials: 'ZEE', score: 5800, timeSeconds: 310, difficulty: 'easy', mistakes: 2, hintsUsed: 1, corrections: 5, date: '1990-03-15' }
];

export function getBattleshipHighScores(): BattleshipScoreEntry[] {
  if (typeof window === 'undefined') return DEFAULT_BATTLESHIP_SCORES;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_BATTLESHIP_SCORES));
      return DEFAULT_BATTLESHIP_SCORES;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return DEFAULT_BATTLESHIP_SCORES;
  } catch {
    return DEFAULT_BATTLESHIP_SCORES;
  }
}

export function saveBattleshipScore(entry: Omit<BattleshipScoreEntry, 'id' | 'date'>): { entry: BattleshipScoreEntry; rank: number } {
  const current = getBattleshipHighScores();
  const cleanedInitials = (entry.initials || 'AAA')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, 4) || 'YOU';

  const newEntry: BattleshipScoreEntry = {
    ...entry,
    initials: cleanedInitials,
    id: `battleship-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    date: new Date().toISOString().split('T')[0]
  };

  const updated = [...current, newEntry];
  updated.sort((a, b) => b.score - a.score);
  const trimmed = updated.slice(0, 15);

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch {
    // ignore
  }

  const rank = trimmed.findIndex(s => s.id === newEntry.id) + 1;
  return { entry: newEntry, rank };
}

export function resetBattleshipHighScores(): BattleshipScoreEntry[] {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_BATTLESHIP_SCORES));
  } catch {
    // ignore
  }
  return DEFAULT_BATTLESHIP_SCORES;
}
