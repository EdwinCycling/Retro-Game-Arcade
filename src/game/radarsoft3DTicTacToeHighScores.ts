/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface RadarsoftScoreEntry {
  id: string;
  initials: string;
  score: number; // Wins or points
  mode: 'pvp' | 'ai_novice' | 'ai_veteran' | 'ai_master';
  wins: number;
  streak: number;
  date: string;
  note?: string;
}

const STORAGE_KEY = 'radarsoft_3d_ttt_highscores_v1';

const DEFAULT_SCORES: RadarsoftScoreEntry[] = [
  {
    id: 'score-1',
    initials: 'DRJ',
    score: 1984,
    mode: 'ai_master',
    wins: 42,
    streak: 18,
    date: '1984-06-15',
    note: 'Dr. John (John Vanderaart) - Radarsoft Utrecht'
  },
  {
    id: 'score-2',
    initials: 'CKR',
    score: 1720,
    mode: 'ai_master',
    wins: 36,
    streak: 14,
    date: '1984-07-22',
    note: 'Cees Kramer - Radarsoft Co-Founder'
  },
  {
    id: 'score-3',
    initials: 'RAD',
    score: 1450,
    mode: 'ai_veteran',
    wins: 28,
    streak: 10,
    date: '1984-09-01',
    note: 'Radarsoft Studio Testbench'
  },
  {
    id: 'score-4',
    initials: 'C64',
    score: 1120,
    mode: 'ai_novice',
    wins: 20,
    streak: 8,
    date: '1984-11-12',
    note: 'Commodore 64 European Championship'
  },
  {
    id: 'score-5',
    initials: 'SID',
    score: 850,
    mode: 'ai_novice',
    wins: 15,
    streak: 6,
    date: '1985-01-05',
    note: 'MOS Technology SID 6581'
  }
];

export function getRadarsoftHighScores(): RadarsoftScoreEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SCORES;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return DEFAULT_SCORES;
  } catch {
    return DEFAULT_SCORES;
  }
}

export function saveRadarsoftHighScore(entry: Omit<RadarsoftScoreEntry, 'id'>): RadarsoftScoreEntry[] {
  try {
    const current = getRadarsoftHighScores();
    const newEntry: RadarsoftScoreEntry = {
      ...entry,
      id: `score-${Date.now()}`
    };
    const updated = [...current, newEntry].sort((a, b) => b.score - a.score).slice(0, 10);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return DEFAULT_SCORES;
  }
}
