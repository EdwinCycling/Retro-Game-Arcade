/**
 * Half-Life (1998) - High Scores & Game Statistics Storage
 */

export interface HalfLifeHighScore {
  id: string;
  name: string;
  score: number;
  timeSeconds: number;
  kills: number;
  accuracy: number;
  date: string;
}

const STORAGE_KEY = 'retro_arcade_halflife_scores';

const DEFAULT_SCORES: HalfLifeHighScore[] = [
  { id: '1', name: 'G.FREEMAN', score: 18500, timeSeconds: 145, kills: 42, accuracy: 88, date: '1998-11-19' },
  { id: '2', name: 'B.CALHOUN', score: 14200, timeSeconds: 180, kills: 34, accuracy: 82, date: '1998-11-20' },
  { id: '3', name: 'A.COHENT', score: 11800, timeSeconds: 210, kills: 28, accuracy: 76, date: '1998-11-21' },
  { id: '4', name: 'I.KLEINER', score: 9500, timeSeconds: 260, kills: 19, accuracy: 70, date: '1998-11-22' },
  { id: '5', name: 'E.VANCE', score: 8200, timeSeconds: 310, kills: 16, accuracy: 65, date: '1998-11-23' },
];

export function getHalfLifeScores(): HalfLifeHighScore[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SCORES;
    return JSON.parse(raw);
  } catch {
    return DEFAULT_SCORES;
  }
}

export function saveHalfLifeScore(newScore: Omit<HalfLifeHighScore, 'id' | 'date'>): HalfLifeHighScore[] {
  const current = getHalfLifeScores();
  const entry: HalfLifeHighScore = {
    ...newScore,
    id: Math.random().toString(36).substring(2, 9),
    date: new Date().toISOString().split('T')[0]
  };

  const updated = [...current, entry]
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // Ignore storage quota errors
  }

  return updated;
}
