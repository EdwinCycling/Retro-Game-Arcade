import { ReptonScoreEntry } from './reptonTypes';

const STORAGE_KEY = 'retro_arcade_repton_highscores_v1';

const DEFAULT_SCORES: ReptonScoreEntry[] = [
  { initials: 'TIM', score: 12450, levelLetter: 'L', diamonds: 142, date: '1985-11-01' },
  { initials: 'ACN', score: 9800, levelLetter: 'H', diamonds: 98, date: '1985-11-05' },
  { initials: 'SUP', score: 7200, levelLetter: 'F', diamonds: 76, date: '1985-11-12' },
  { initials: 'BBC', score: 5400, levelLetter: 'D', diamonds: 54, date: '1985-11-20' },
  { initials: 'REP', score: 3200, levelLetter: 'B', diamonds: 32, date: '1985-12-01' },
];

export function getReptonHighScores(): ReptonScoreEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SCORES;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
  } catch {
    // Fallback to default
  }
  return DEFAULT_SCORES;
}

export function saveReptonHighScore(entry: ReptonScoreEntry): ReptonScoreEntry[] {
  try {
    const current = getReptonHighScores();
    const updated = [...current, entry]
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return DEFAULT_SCORES;
  }
}

export function isReptonHighScore(score: number): boolean {
  if (score <= 0) return false;
  const current = getReptonHighScores();
  if (current.length < 10) return true;
  return score > current[current.length - 1].score;
}
