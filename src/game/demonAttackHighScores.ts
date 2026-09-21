import { DemonHighScore } from './demonAttackTypes';

const DEMON_STORAGE_KEY = 'arcade_demon_attack_high_scores_v1';

const DEFAULT_DEMON_SCORES: DemonHighScore[] = [
  { initials: 'IMG', score: 3250, wave: 8, date: '1982-08-15' },
  { initials: 'ROB', score: 2180, wave: 6, date: '1982-08-18' },
  { initials: 'FUL', score: 1420, wave: 5, date: '1982-09-02' },
  { initials: 'ATA', score: 980, wave: 4, date: '1982-09-10' },
  { initials: 'KRY', score: 450, wave: 2, date: '1982-10-01' },
];

export function getDemonHighScores(): DemonHighScore[] {
  if (typeof window === 'undefined') return DEFAULT_DEMON_SCORES;
  try {
    const raw = localStorage.getItem(DEMON_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(DEMON_STORAGE_KEY, JSON.stringify(DEFAULT_DEMON_SCORES));
      return DEFAULT_DEMON_SCORES;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return DEFAULT_DEMON_SCORES;
  } catch (err) {
    console.error('Failed to load Demon Attack high scores:', err);
    return DEFAULT_DEMON_SCORES;
  }
}

export function saveDemonHighScore(newEntry: DemonHighScore): DemonHighScore[] {
  if (typeof window === 'undefined') return [];
  try {
    const scores = getDemonHighScores();
    scores.push(newEntry);
    scores.sort((a, b) => b.score - a.score);
    const topScores = scores.slice(0, 10);
    localStorage.setItem(DEMON_STORAGE_KEY, JSON.stringify(topScores));
    return topScores;
  } catch (err) {
    console.error('Failed to save Demon Attack high score:', err);
    return [];
  }
}

export function isDemonHighScore(score: number): boolean {
  if (score <= 0) return false;
  const scores = getDemonHighScores();
  if (scores.length < 10) return true;
  return score > scores[scores.length - 1].score;
}
