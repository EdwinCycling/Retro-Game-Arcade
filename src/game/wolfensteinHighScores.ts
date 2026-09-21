// Wolfenstein 3D High Scores and Stats

export interface WolfScore {
  id: string;
  initials: string;
  name: string;
  score: number;
  floor: number;
  kills: number;
  secrets: number;
  date: string;
}

const STORAGE_KEY = 'wolfenstein_3d_high_scores';

const DEFAULT_SCORES: WolfScore[] = [
  { id: '1', initials: 'BJB', name: 'B.J. Blazkowicz', score: 64200, floor: 3, kills: 48, secrets: 4, date: '1992-05-05' },
  { id: '2', initials: 'JDC', name: 'John Carmack', score: 51800, floor: 2, kills: 36, secrets: 3, date: '1992-05-05' },
  { id: '3', initials: 'JDR', name: 'John Romero', score: 43500, floor: 2, kills: 30, secrets: 2, date: '1992-05-06' },
  { id: '4', initials: 'TMH', name: 'Tom Hall', score: 32400, floor: 1, kills: 22, secrets: 2, date: '1992-05-07' },
  { id: '5', initials: 'ADC', name: 'Adrian Carmack', score: 21900, floor: 1, kills: 16, secrets: 1, date: '1992-05-08' },
];

export function getWolfScores(): WolfScore[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SCORES;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_SCORES;
  } catch {
    return DEFAULT_SCORES;
  }
}

export function saveWolfScore(newEntry: Omit<WolfScore, 'id'>): WolfScore[] {
  try {
    const scores = getWolfScores();
    const item: WolfScore = {
      ...newEntry,
      id: Date.now().toString(),
    };
    scores.push(item);
    scores.sort((a, b) => b.score - a.score);
    const top = scores.slice(0, 10);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(top));
    return top;
  } catch {
    return DEFAULT_SCORES;
  }
}
