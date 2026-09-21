export interface DoomHighScore {
  id: string;
  name: string;
  score: number;
  level: string;
  killsPercent: number;
  secretsPercent: number;
  timeSeconds: number;
  date: string;
}

const STORAGE_KEY = 'arcade_doom_high_scores_v1';

const DEFAULT_SCORES: DoomHighScore[] = [
  {
    id: '1',
    name: 'FLY',
    score: 14500,
    level: 'E1M1: HANGAR',
    killsPercent: 100,
    secretsPercent: 100,
    timeSeconds: 28,
    date: '1993-12-10'
  },
  {
    id: '2',
    name: 'JCR',
    score: 11200,
    level: 'E1M1: HANGAR',
    killsPercent: 100,
    secretsPercent: 50,
    timeSeconds: 34,
    date: '1993-12-10'
  },
  {
    id: '3',
    name: 'ROM',
    score: 9800,
    level: 'E1M1: HANGAR',
    killsPercent: 85,
    secretsPercent: 50,
    timeSeconds: 42,
    date: '1993-12-11'
  },
  {
    id: '4',
    name: 'BPR',
    score: 7600,
    level: 'E1M1: HANGAR',
    killsPercent: 75,
    secretsPercent: 0,
    timeSeconds: 55,
    date: '1993-12-12'
  },
  {
    id: '5',
    name: 'UAC',
    score: 5400,
    level: 'E1M1: HANGAR',
    killsPercent: 60,
    secretsPercent: 0,
    timeSeconds: 70,
    date: '1993-12-15'
  }
];

export function getDoomScores(): DoomHighScore[] {
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

export const getDoomHighScores = getDoomScores;

export function saveDoomScore(newEntry: Omit<DoomHighScore, 'id' | 'date'>): DoomHighScore[] {
  const current = getDoomScores();
  const entry: DoomHighScore = {
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
    console.error('Failed to save Doom score:', e);
  }

  return updated;
}
