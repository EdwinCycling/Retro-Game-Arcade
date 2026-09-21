/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Arcadians - High Scores Manager
 */

import { ArcadiansHighScore } from './arcadiansTypes';

const STORAGE_KEY = 'arcadians_high_scores_v1';

const DEFAULT_SCORES: ArcadiansHighScore[] = [
  { initials: 'N.P', score: 32450, wave: 9, date: '1982-10-12' }, // Nick Pelling (Orlando M. Pilchard)
  { initials: 'ACN', score: 25180, wave: 7, date: '1982-10-18' }, // Acornsoft
  { initials: 'BBC', score: 18920, wave: 5, date: '1982-11-04' }, // BBC Micro Model B
  { initials: 'ELC', score: 14300, wave: 4, date: '1983-02-15' }, // Acorn Electron
  { initials: 'BUG', score: 9850, wave: 3, date: '1983-05-20' },  // Bug-Byte
];

export function getArcadiansHighScores(): ArcadiansHighScore[] {
  if (typeof window === 'undefined') return DEFAULT_SCORES;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_SCORES));
      return DEFAULT_SCORES;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_SCORES;
  } catch {
    return DEFAULT_SCORES;
  }
}

export function saveArcadiansHighScore(score: number, wave: number, initials: string): ArcadiansHighScore[] {
  const current = getArcadiansHighScores();
  const cleanInitials = (initials || 'AAA').slice(0, 3).toUpperCase();
  const newEntry: ArcadiansHighScore = {
    initials: cleanInitials,
    score,
    wave,
    date: new Date().toISOString().split('T')[0],
  };

  const updated = [...current, newEntry]
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {}

  return updated;
}
