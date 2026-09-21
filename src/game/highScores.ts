/**
 * Retro Arcade High Scores Store & Leaderboard Utilities
 */
import { Difficulty, HighScoreEntry } from '../types';

export const DEFAULT_HIGH_SCORES: HighScoreEntry[] = [
  { id: '1', initials: 'NAM', score: 10000, level: 5, difficulty: 'classic', date: '1980-05-22' },
  { id: '2', initials: 'PAC', score: 8500, level: 4, difficulty: 'classic', date: '1980-06-12' },
  { id: '3', initials: 'EDW', score: 7200, level: 3, difficulty: 'turbo', date: '2026-09-01' },
  { id: '4', initials: 'MID', score: 5800, level: 3, difficulty: 'classic', date: '1980-07-04' },
  { id: '5', initials: 'WAY', score: 4900, level: 2, difficulty: 'casual', date: '1980-08-15' },
  { id: '6', initials: 'TOR', score: 4100, level: 2, difficulty: 'classic', date: '1980-09-20' },
  { id: '7', initials: 'IWK', score: 3500, level: 2, difficulty: 'classic', date: '1980-10-10' },
  { id: '8', initials: 'GHO', score: 2800, level: 1, difficulty: 'casual', date: '1980-11-05' },
  { id: '9', initials: 'DOT', score: 2100, level: 1, difficulty: 'classic', date: '1980-12-01' },
  { id: '10', initials: 'RET', score: 1500, level: 1, difficulty: 'casual', date: '1981-01-15' }
];

const STORAGE_KEY = 'pacman_arcade_leaderboard_v1';

export function getHighScores(): HighScoreEntry[] {
  if (typeof window === 'undefined') return DEFAULT_HIGH_SCORES;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_HIGH_SCORES));
      return DEFAULT_HIGH_SCORES;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.slice(0, 10);
    }
    return DEFAULT_HIGH_SCORES;
  } catch {
    return DEFAULT_HIGH_SCORES;
  }
}

export function isScoreEligibleForLeaderboard(score: number): { eligible: boolean; rank: number } {
  if (score <= 0) return { eligible: false, rank: -1 };
  const current = getHighScores();
  if (current.length < 10) return { eligible: true, rank: current.length + 1 };
  const lowest = current[current.length - 1].score;
  if (score > lowest) {
    const rank = current.findIndex(entry => score > entry.score);
    return { eligible: true, rank: rank >= 0 ? rank + 1 : current.length };
  }
  return { eligible: false, rank: -1 };
}

export function saveHighScoreEntry(entry: {
  initials: string;
  score: number;
  level: number;
  difficulty: Difficulty;
}): HighScoreEntry[] {
  const current = getHighScores();
  const cleanedInitials = (entry.initials || 'AAA')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .padEnd(3, 'A')
    .slice(0, 3);

  const newEntry: HighScoreEntry = {
    id: Date.now().toString(),
    initials: cleanedInitials,
    score: entry.score,
    level: entry.level,
    difficulty: entry.difficulty,
    date: new Date().toISOString().slice(0, 10)
  };

  const updated = [...current, newEntry]
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      if (updated.length > 0) {
        localStorage.setItem('pacman_high_score', updated[0].score.toString());
      }
    } catch (e) {
      console.error('Failed to save high scores', e);
    }
  }

  return updated;
}

export function resetHighScoresToDefaults(): HighScoreEntry[] {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_HIGH_SCORES));
      localStorage.setItem('pacman_high_score', DEFAULT_HIGH_SCORES[0].score.toString());
    } catch {}
  }
  return DEFAULT_HIGH_SCORES;
}
