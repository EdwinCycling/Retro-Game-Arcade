/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Game Boy High Scores Management (Super Mario Land & Tetris DMG)
 */

export interface MarioLandScore {
  id: string;
  initials: string;
  score: number;
  world: string;
  coins: number;
  date: string;
}

export interface TetrisScore {
  id: string;
  initials: string;
  score: number;
  lines: number;
  level: number;
  mode: 'A-TYPE' | 'B-TYPE';
  date: string;
}

const DEFAULT_MARIO_SCORES: MarioLandScore[] = [
  { id: '1', initials: 'YOK', score: 148500, world: '4-3', coins: 99, date: '1989-04-21' },
  { id: '2', initials: 'OKA', score: 96200, world: '3-2', coins: 74, date: '1989-05-10' },
  { id: '3', initials: 'MIY', score: 68400, world: '2-3', coins: 52, date: '1989-06-01' },
  { id: '4', initials: 'TAN', score: 42100, world: '1-3', coins: 38, date: '1989-07-15' },
  { id: '5', initials: 'GBY', score: 25000, world: '1-1', coins: 21, date: '1989-08-20' },
];

const DEFAULT_TETRIS_SCORES: TetrisScore[] = [
  { id: '1', initials: 'PAJ', score: 298400, lines: 184, level: 12, mode: 'A-TYPE', date: '1989-06-14' },
  { id: '2', initials: 'ROJ', score: 194500, lines: 142, level: 9, mode: 'A-TYPE', date: '1989-07-02' },
  { id: '3', initials: 'YAM', score: 120800, lines: 98, level: 7, mode: 'A-TYPE', date: '1989-08-11' },
  { id: '4', initials: 'NIN', score: 85200, lines: 75, level: 5, mode: 'A-TYPE', date: '1989-09-01' },
  { id: '5', initials: 'DMG', score: 45000, lines: 40, level: 3, mode: 'A-TYPE', date: '1989-10-15' },
];

export function getMarioLandScores(): MarioLandScore[] {
  try {
    const saved = localStorage.getItem('arcade_marioland_highscores');
    if (saved) {
      return JSON.parse(saved);
    }
  } catch {
    // fallback
  }
  return DEFAULT_MARIO_SCORES;
}

export function saveMarioLandScore(entry: Omit<MarioLandScore, 'id' | 'date'>): MarioLandScore[] {
  const current = getMarioLandScores();
  const newEntry: MarioLandScore = {
    ...entry,
    id: Date.now().toString(),
    date: new Date().toISOString().split('T')[0]
  };
  const updated = [...current, newEntry].sort((a, b) => b.score - a.score).slice(0, 10);
  try {
    localStorage.setItem('arcade_marioland_highscores', JSON.stringify(updated));
  } catch {
    // ignore storage error
  }
  return updated;
}

export function getTetrisScores(): TetrisScore[] {
  try {
    const saved = localStorage.getItem('arcade_tetris_dmg_highscores');
    if (saved) {
      return JSON.parse(saved);
    }
  } catch {
    // fallback
  }
  return DEFAULT_TETRIS_SCORES;
}

export function saveTetrisScore(entry: Omit<TetrisScore, 'id' | 'date'>): TetrisScore[] {
  const current = getTetrisScores();
  const newEntry: TetrisScore = {
    ...entry,
    id: Date.now().toString(),
    date: new Date().toISOString().split('T')[0]
  };
  const updated = [...current, newEntry].sort((a, b) => b.score - a.score).slice(0, 10);
  try {
    localStorage.setItem('arcade_tetris_dmg_highscores', JSON.stringify(updated));
  } catch {
    // ignore storage error
  }
  return updated;
}
