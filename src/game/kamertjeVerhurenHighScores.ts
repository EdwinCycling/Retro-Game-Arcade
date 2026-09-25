/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface KamertjeScoreEntry {
  id: string;
  initials: string;
  score: number; // Boxes claimed by player
  totalBoxes: number;
  percentage: number;
  gridSize: string; // e.g. "4×4", "5×5"
  difficulty: 'novice' | 'tactician' | 'master';
  date: string;
  note?: string;
}

const STORAGE_KEY = 'arcade_vault_kamertje_verhuren_scores';

const DEFAULT_SCORES: KamertjeScoreEntry[] = [
  { id: '1', initials: 'LUC', score: 22, totalBoxes: 25, percentage: 88, gridSize: '5×5', difficulty: 'master', date: '1895-03-14', note: 'Édouard Lucas (La Pipopipette)' },
  { id: '2', initials: 'EDW', score: 14, totalBoxes: 16, percentage: 87, gridSize: '4×4', difficulty: 'master', date: '2024-09-12', note: 'Wiskundeschrift Meester' },
  { id: '3', initials: 'CNW', score: 13, totalBoxes: 16, percentage: 81, gridSize: '4×4', difficulty: 'tactician', date: '2024-08-19', note: 'John Conway (Nimstring)' },
  { id: '4', initials: 'JUM', score: 8, totalBoxes: 9, percentage: 89, gridSize: '3×3', difficulty: 'novice', date: '2024-07-04', note: 'Ruitjesblok Snelduel' },
  { id: '5', initials: 'SCH', score: 28, totalBoxes: 36, percentage: 78, gridSize: '6×6', difficulty: 'master', date: '2024-06-28', note: 'Grootmeester Kettingreactie' }
];

export function getKamertjeHighScores(): KamertjeScoreEntry[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_SCORES));
      return DEFAULT_SCORES;
    }
    return JSON.parse(saved);
  } catch {
    return DEFAULT_SCORES;
  }
}

export function saveKamertjeHighScore(entry: Omit<KamertjeScoreEntry, 'id'>): KamertjeScoreEntry[] {
  try {
    const current = getKamertjeHighScores();
    const newEntry: KamertjeScoreEntry = {
      ...entry,
      id: Date.now().toString()
    };

    const updated = [...current, newEntry]
      .sort((a, b) => b.percentage - a.percentage || b.score - a.score)
      .slice(0, 15);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return DEFAULT_SCORES;
  }
}
