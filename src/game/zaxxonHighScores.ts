/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Sega Zaxxon (1982) High Scores Engine
 */

export interface ZaxxonScore {
  initials: string;
  score: number;
  stage: number;
  date: string;
}

const STORAGE_KEY = 'zaxxon_high_scores_v1';

const DEFAULT_SCORES: ZaxxonScore[] = [
  { initials: 'SEG', score: 88400, stage: 5, date: '1982-04-12' }, // Sega Arcade Master
  { initials: 'ZAX', score: 67200, stage: 4, date: '1982-05-18' }, // Zaxxon Ace Pilot
  { initials: 'IKE', score: 54100, stage: 3, date: '1982-06-22' }, // Ikegami Engineer
  { initials: 'ROB', score: 41900, stage: 3, date: '1982-07-04' }, // Robot Buster
  { initials: 'EDW', score: 32800, stage: 2, date: '1982-08-15' }, // Fleet Commander
  { initials: 'FUE', score: 25400, stage: 2, date: '1982-09-01' }, // Fuel Specialist
  { initials: 'ISO', score: 18600, stage: 2, date: '1982-10-10' }, // Isometric Navigator
  { initials: 'ALT', score: 12200, stage: 1, date: '1982-11-05' }, // Altimeter Scout
  { initials: 'GUN', score: 8500,  stage: 1, date: '1982-11-20' }, // Turret Destroyer
  { initials: 'CAD', score: 4500,  stage: 1, date: '1982-12-01' }  // Cadet Pilot
];

export function getZaxxonScores(): ZaxxonScore[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      saveZaxxonScores(DEFAULT_SCORES);
      return DEFAULT_SCORES;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_SCORES;
  } catch {
    return DEFAULT_SCORES;
  }
}

export function saveZaxxonScores(scores: ZaxxonScore[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(scores));
  } catch {}
}

export function addZaxxonScore(score: number, stage: number, initials: string): ZaxxonScore[] {
  const current = getZaxxonScores();
  const cleanInitials = (initials || 'ZAX').toUpperCase().slice(0, 3).padEnd(3, ' ');
  const newEntry: ZaxxonScore = {
    initials: cleanInitials,
    score,
    stage,
    date: new Date().toISOString().split('T')[0]
  };

  const updated = [...current, newEntry]
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);

  saveZaxxonScores(updated);
  return updated;
}

export function isZaxxonHighScore(score: number): boolean {
  if (score <= 0) return false;
  const scores = getZaxxonScores();
  if (scores.length < 10) return true;
  return score > scores[scores.length - 1].score;
}
