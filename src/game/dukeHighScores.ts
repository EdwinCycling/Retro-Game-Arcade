export interface DukeHighScore {
  id: string;
  name: string;
  score: number;
  level: string;
  killsPercent: number;
  secretsPercent: number;
  timeSeconds: number;
  date: string;
}

const STORAGE_KEY = 'arcade_duke_high_scores_v1';

const DEFAULT_SCORES: DukeHighScore[] = [
  {
    id: '1',
    name: 'DUK',
    score: 19960,
    level: 'E1L1: HOLLYWOOD HOLOCAUST',
    killsPercent: 100,
    secretsPercent: 100,
    timeSeconds: 32,
    date: '1996-01-29'
  },
  {
    id: '2',
    name: '3DR',
    score: 15400,
    level: 'E1L1: HOLLYWOOD HOLOCAUST',
    killsPercent: 100,
    secretsPercent: 75,
    timeSeconds: 45,
    date: '1996-01-30'
  },
  {
    id: '3',
    name: 'KNS',
    score: 12800,
    level: 'E1L1: HOLLYWOOD HOLOCAUST',
    killsPercent: 88,
    secretsPercent: 50,
    timeSeconds: 52,
    date: '1996-02-01'
  },
  {
    id: '4',
    name: 'LAD',
    score: 9500,
    level: 'E1L1: HOLLYWOOD HOLOCAUST',
    killsPercent: 70,
    secretsPercent: 25,
    timeSeconds: 65,
    date: '1996-02-10'
  },
  {
    id: '5',
    name: 'PIG',
    score: 6200,
    level: 'E1L1: HOLLYWOOD HOLOCAUST',
    killsPercent: 50,
    secretsPercent: 0,
    timeSeconds: 80,
    date: '1996-02-15'
  }
];

export function getDukeScores(): DukeHighScore[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_SCORES));
      return DEFAULT_SCORES;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_SCORES;
  }
}

export const getDukeHighScores = getDukeScores;

export function saveDukeScore(newEntry: Omit<DukeHighScore, 'id' | 'date'>): DukeHighScore[] {
  const current = getDukeScores();
  const entry: DukeHighScore = {
    ...newEntry,
    id: Date.now().toString(),
    date: new Date().toISOString().split('T')[0]
  };

  const updated = [...current, entry]
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save Duke score:', e);
  }

  return updated;
}
