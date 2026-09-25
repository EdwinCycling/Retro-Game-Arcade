/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface HangmanScoreEntry {
  id: string;
  initials: string;
  score: number;
  word: string;
  difficulty: string;
  date: string;
  language: string;
  note?: string;
}

const STORAGE_KEY = 'arcade_vault_hangman_scores_v1';

export function getHangmanHighScores(): HangmanScoreEntry[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      return [
        { id: '1', initials: 'WRD', score: 3250, word: 'COMPUTERWETENSCHAP', difficulty: 'EXTREME', date: '1894-05-12', language: 'nl', note: 'Galgje Kampioen' },
        { id: '2', initials: 'INK', score: 2850, word: 'COMPUTERSCIENCE', difficulty: 'EXTREME', date: '1974-08-20', language: 'en', note: 'Ballpoint Master' },
        { id: '3', initials: 'PEN', score: 2100, word: 'ASTRONAUT', difficulty: 'HARD', date: '1982-10-15', language: 'nl', note: 'Klaslokaal Win' },
        { id: '4', initials: 'ABC', score: 1450, word: 'KASTEEL', difficulty: 'MEDIUM', date: '1995-02-14', language: 'nl', note: 'A-Z Woordmeester' }
      ];
    }
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export function saveHangmanHighScore(entry: Omit<HangmanScoreEntry, 'id'>): HangmanScoreEntry[] {
  const current = getHangmanHighScores();
  const newEntry: HangmanScoreEntry = {
    ...entry,
    id: Date.now().toString()
  };
  const updated = [...current, newEntry].sort((a, b) => b.score - a.score).slice(0, 10);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // LocalStorage fallback
  }
  return updated;
}
