/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface StrategoScoreEntry {
  id: string;
  initials: string;
  score: number; // Victory points
  turns: number;
  victories: number;
  aiDifficulty: 'novice' | 'tactician' | 'grandmaster';
  flagCaptured: boolean;
  date: string;
  note?: string;
}

const STORAGE_KEY = 'arcade_vault_stratego_highscores_v1';

const DEFAULT_SCORES: StrategoScoreEntry[] = [
  {
    id: 'score-1',
    initials: 'MOG',
    score: 3450,
    turns: 28,
    victories: 12,
    aiDifficulty: 'grandmaster',
    flagCaptured: true,
    date: '1947-04-20',
    note: 'Jacques Johan Mogendorff (Bedenker Stratego 1947)'
  },
  {
    id: 'score-2',
    initials: 'JMB',
    score: 2980,
    turns: 34,
    victories: 9,
    aiDifficulty: 'grandmaster',
    flagCaptured: true,
    date: '1958-09-15',
    note: 'Hausemann & Hötte (Jumbo Uitgever 1958)'
  },
  {
    id: 'score-3',
    initials: 'NAP',
    score: 2420,
    turns: 42,
    victories: 7,
    aiDifficulty: 'tactician',
    flagCaptured: true,
    date: '1980-05-10',
    note: 'Maarschalk Tactiek (Spion Valkuilen)'
  },
  {
    id: 'score-4',
    initials: 'VLG',
    score: 1850,
    turns: 38,
    victories: 5,
    aiDifficulty: 'tactician',
    flagCaptured: true,
    date: '1995-11-04',
    note: 'Mineur Blitz & Bommenruiming'
  },
  {
    id: 'score-5',
    initials: 'NOV',
    score: 1200,
    turns: 50,
    victories: 3,
    aiDifficulty: 'novice',
    flagCaptured: true,
    date: '2010-06-18',
    note: 'Verkenner Flankaanval'
  }
];

export function getStrategoHighScores(): StrategoScoreEntry[] {
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

export function saveStrategoHighScore(entry: Omit<StrategoScoreEntry, 'id'>): StrategoScoreEntry[] {
  try {
    const current = getStrategoHighScores();
    const newEntry: StrategoScoreEntry = {
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
