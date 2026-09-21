/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ExileHighScore {
  id: string;
  name: string;
  score: number;
  escaped: boolean;
  date: string;
}

const STORAGE_KEY = 'retro_arcade_exile_high_scores_v1';

const DEFAULT_SCORES: ExileHighScore[] = [
  { id: '1', name: 'FINN', score: 18500, escaped: true, date: '1988-10-14' },
  { id: '2', name: 'P.IRVIN', score: 14200, escaped: true, date: '1988-11-02' },
  { id: '3', name: 'J.SMITH', score: 12100, escaped: true, date: '1988-11-18' },
  { id: '4', name: 'ACORN', score: 9800, escaped: false, date: '1988-12-05' },
  { id: '5', name: 'PHOEBUS', score: 7400, escaped: false, date: '1989-01-12' },
  { id: '6', name: 'PERSEUS', score: 5200, escaped: false, date: '1989-02-20' },
  { id: '7', name: 'CORONA', score: 3500, escaped: false, date: '1989-03-01' },
];

export function getExileHighScores(): ExileHighScore[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SCORES;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.sort((a, b) => b.score - a.score);
    }
    return DEFAULT_SCORES;
  } catch {
    return DEFAULT_SCORES;
  }
}

export function saveExileHighScore(name: string, score: number, escaped = false): void {
  try {
    const scores = getExileHighScores();
    const newEntry: ExileHighScore = {
      id: Date.now().toString(),
      name: name.slice(0, 8).toUpperCase() || 'FINN',
      score,
      escaped,
      date: new Date().toISOString().split('T')[0]
    };
    const updated = [...scores, newEntry]
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // Ignore storage issues
  }
}

export function isExileHighScore(score: number): boolean {
  const scores = getExileHighScores();
  if (scores.length < 10) return score > 0;
  return score > scores[scores.length - 1].score;
}
