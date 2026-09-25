/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SudokuDifficulty } from './sudokuEngine';

export interface SudokuScoreEntry {
  id: string;
  initials: string;
  score: number;
  timeSeconds: number;
  difficulty: SudokuDifficulty;
  mistakes: number;
  hintsUsed: number;
  corrections: number;
  date: string;
}

const STORAGE_KEY = 'arcade_vault_sudoku_leaderboard_v1';

export const DEFAULT_SUDOKU_SCORES: SudokuScoreEntry[] = [
  { id: '1', initials: 'MAKI', score: 9850, timeSeconds: 194, difficulty: 'expert', mistakes: 0, hintsUsed: 0, corrections: 2, date: '1984-04-15' },
  { id: '2', initials: 'GARN', score: 8900, timeSeconds: 245, difficulty: 'hard', mistakes: 1, hintsUsed: 0, corrections: 3, date: '1979-05-10' },
  { id: '3', initials: 'EULR', score: 8120, timeSeconds: 280, difficulty: 'hard', mistakes: 0, hintsUsed: 1, corrections: 4, date: '1984-06-20' },
  { id: '4', initials: 'NIKL', score: 7400, timeSeconds: 210, difficulty: 'medium', mistakes: 1, hintsUsed: 0, corrections: 2, date: '1985-01-12' },
  { id: '5', initials: 'EDW', score: 6950, timeSeconds: 175, difficulty: 'easy', mistakes: 0, hintsUsed: 0, corrections: 1, date: '2026-09-24' },
  { id: '6', initials: 'LOG', score: 6200, timeSeconds: 340, difficulty: 'medium', mistakes: 2, hintsUsed: 1, corrections: 5, date: '1986-03-08' },
  { id: '7', initials: 'GRID', score: 5800, timeSeconds: 310, difficulty: 'easy', mistakes: 1, hintsUsed: 0, corrections: 3, date: '1988-11-22' },
  { id: '8', initials: 'ZEN', score: 5100, timeSeconds: 420, difficulty: 'easy', mistakes: 2, hintsUsed: 2, corrections: 6, date: '1990-07-19' }
];

export function getSudokuHighScores(): SudokuScoreEntry[] {
  if (typeof window === 'undefined') return DEFAULT_SUDOKU_SCORES;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_SUDOKU_SCORES));
      return DEFAULT_SUDOKU_SCORES;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return DEFAULT_SUDOKU_SCORES;
  } catch {
    return DEFAULT_SUDOKU_SCORES;
  }
}

export function saveSudokuScore(entry: Omit<SudokuScoreEntry, 'id' | 'date'>): { entry: SudokuScoreEntry; rank: number } {
  const current = getSudokuHighScores();
  const cleanedInitials = (entry.initials || 'AAA')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, 4) || 'YOU';

  const newEntry: SudokuScoreEntry = {
    ...entry,
    initials: cleanedInitials,
    id: `sudoku-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    date: new Date().toISOString().split('T')[0]
  };

  const updated = [...current, newEntry];
  // Sort descending by calculated score
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

export function resetSudokuHighScores(): SudokuScoreEntry[] {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_SUDOKU_SCORES));
  } catch {
    // ignore
  }
  return DEFAULT_SUDOKU_SCORES;
}
