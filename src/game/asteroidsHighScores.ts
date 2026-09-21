/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Atari Asteroids (1979) High Scores Engine
 */

export interface AsteroidsScore {
  initials: string;
  score: number;
  wave: number;
  date: string;
}

const STORAGE_KEY = 'asteroids_high_scores_v1';

const DEFAULT_SCORES: AsteroidsScore[] = [
  { initials: 'EDL', score: 99990, wave: 28, date: '1979-11-20' }, // Ed Logg (Co-creator)
  { initials: 'LRE', score: 78450, wave: 22, date: '1979-11-25' }, // Lyle Rains (Co-creator)
  { initials: 'VEC', score: 64200, wave: 18, date: '1980-01-14' }, // Vector Master
  { initials: 'ATX', score: 48900, wave: 14, date: '1980-02-01' }, // Atari Ace
  { initials: 'SAU', score: 36500, wave: 11, date: '1980-03-12' }, // Saucer Hunter
  { initials: 'HYP', score: 25400, wave: 8,  date: '1980-04-18' }, // Hyperspace Pilot
  { initials: 'ROC', score: 18900, wave: 6,  date: '1980-05-09' }, // Rock Crusher
  { initials: 'QDR', score: 12400, wave: 4,  date: '1980-06-22' }, // QuadraScan
  { initials: 'NEW', score: 8500,  wave: 3,  date: '1980-07-04' }, // Cadet
  { initials: 'PLY', score: 4200,  wave: 2,  date: '1980-08-15' }  // Rookie
];

export function getAsteroidsScores(): AsteroidsScore[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      saveAsteroidsScores(DEFAULT_SCORES);
      return DEFAULT_SCORES;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_SCORES;
  } catch {
    return DEFAULT_SCORES;
  }
}

export function saveAsteroidsScores(scores: AsteroidsScore[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(scores));
  } catch {}
}

export function addAsteroidsScore(score: number, wave: number, initials: string): AsteroidsScore[] {
  const current = getAsteroidsScores();
  const cleanInitials = (initials || 'AAA').toUpperCase().slice(0, 3).padEnd(3, ' ');
  const newEntry: AsteroidsScore = {
    initials: cleanInitials,
    score,
    wave,
    date: new Date().toISOString().split('T')[0]
  };

  const updated = [...current, newEntry]
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);

  saveAsteroidsScores(updated);
  return updated;
}

export function isAsteroidsHighScore(score: number): boolean {
  if (score <= 0) return false;
  const current = getAsteroidsScores();
  if (current.length < 10) return true;
  return score > current[current.length - 1].score;
}
