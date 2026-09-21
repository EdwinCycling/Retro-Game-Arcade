/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * High scores persistence for 3D Monster Maze (Sinclair ZX81 1981)
 */

export interface MonsterMazeScore {
  score: number;
  initials: string;
  escaped: boolean;
  steps: number;
  date: string;
}

const STORAGE_KEY = 'retro_arcade_monster_maze_scores_v1';

const DEFAULT_SCORES: MonsterMazeScore[] = [
  { score: 3200, initials: 'EVN', escaped: true, steps: 48, date: '1981-12-01' }, // Malcolm Evans
  { score: 2650, initials: 'JKG', escaped: true, steps: 62, date: '1982-01-15' }, // JK Greye
  { score: 1980, initials: 'REX', escaped: false, steps: 85, date: '1982-03-20' }, // T-Rex
  { score: 1420, initials: 'ZX1', escaped: false, steps: 39, date: '1982-05-10' },
  { score: 950, initials: 'RAM', escaped: false, steps: 24, date: '1982-08-04' },
];

export function getMonsterMazeScores(): MonsterMazeScore[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SCORES;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
  } catch {
    // Fallback to default
  }
  return DEFAULT_SCORES;
}

export function saveMonsterMazeScore(score: number, initials: string, escaped: boolean, steps: number): MonsterMazeScore[] {
  const current = getMonsterMazeScores();
  const entry: MonsterMazeScore = {
    score,
    initials: initials.toUpperCase().slice(0, 3) || 'AAA',
    escaped,
    steps,
    date: new Date().toISOString().split('T')[0],
  };

  const updated = [...current, entry]
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {}

  return updated;
}
