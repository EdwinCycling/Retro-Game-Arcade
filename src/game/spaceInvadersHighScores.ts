/**
 * Space Invaders Local High Score Store
 */
import { SpaceInvaderScoreEntry } from './spaceInvadersTypes';

export const DEFAULT_SPACE_HIGH_SCORES: SpaceInvaderScoreEntry[] = [
  { id: '1', initials: 'TAI', score: 3200, wave: 4, date: '1978-06-01' },
  { id: '2', initials: 'NIS', score: 2840, wave: 3, date: '1978-06-15' },
  { id: '3', initials: 'EDW', score: 2450, wave: 3, date: '2026-09-01' },
  { id: '4', initials: 'UFO', score: 1980, wave: 2, date: '1978-07-20' },
  { id: '5', initials: 'CRB', score: 1650, wave: 2, date: '1978-08-10' },
  { id: '6', initials: 'SQD', score: 1320, wave: 2, date: '1978-09-05' },
  { id: '7', initials: 'LAS', score: 990, wave: 1, date: '1978-10-12' },
  { id: '8', initials: 'BNK', score: 750, wave: 1, date: '1978-11-04' },
  { id: '9', initials: 'DEF', score: 560, wave: 1, date: '1978-12-25' },
  { id: '10', initials: 'NEW', score: 340, wave: 1, date: '1979-01-01' }
];

const STORAGE_KEY = 'space_invaders_leaderboard_v1';

export function getSpaceHighScores(): SpaceInvaderScoreEntry[] {
  if (typeof window === 'undefined') return DEFAULT_SPACE_HIGH_SCORES;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_SPACE_HIGH_SCORES));
      return DEFAULT_SPACE_HIGH_SCORES;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.slice(0, 10);
    }
    return DEFAULT_SPACE_HIGH_SCORES;
  } catch {
    return DEFAULT_SPACE_HIGH_SCORES;
  }
}

export function isSpaceScoreEligible(score: number): { eligible: boolean; rank: number } {
  if (score <= 0) return { eligible: false, rank: -1 };
  const current = getSpaceHighScores();
  if (current.length < 10) return { eligible: true, rank: current.length + 1 };
  const lowest = current[current.length - 1].score;
  if (score > lowest) {
    const rank = current.findIndex(entry => score > entry.score);
    return { eligible: true, rank: rank >= 0 ? rank + 1 : current.length };
  }
  return { eligible: false, rank: -1 };
}

export function saveSpaceHighScoreEntry(entry: {
  initials: string;
  score: number;
  wave: number;
}): SpaceInvaderScoreEntry[] {
  const current = getSpaceHighScores();
  const cleanedInitials = (entry.initials || 'AAA')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, 3)
    .padEnd(3, 'A');

  const newEntry: SpaceInvaderScoreEntry = {
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    initials: cleanedInitials,
    score: entry.score,
    wave: entry.wave,
    date: new Date().toISOString().split('T')[0]
  };

  const updated = [...current, newEntry]
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {}

  return updated;
}
