import { SpiderDifficulty } from './spiderTypes';

export interface SpiderHighScoreEntry {
  name: string;
  initials: string;
  difficulty: SpiderDifficulty;
  score: number;
  moves: number;
  timeSeconds: number;
  date: string;
}

export interface SpiderStats {
  gamesPlayed: number;
  gamesWon: number;
  bestScore1Suit: number;
  bestScore2Suits: number;
  bestScore4Suits: number;
  bestTimeSeconds: number;
}

const STORAGE_KEY = 'retro_spider_high_scores';
const STATS_KEY = 'retro_spider_stats';

export const DEFAULT_SPIDER_SCORES: SpiderHighScoreEntry[] = [
  {
    name: 'John Blackwood (Win98)',
    initials: 'JAB',
    difficulty: 1,
    score: 1140,
    moves: 112,
    timeSeconds: 240,
    date: '1998-06-25'
  },
  {
    name: 'Windows ME Champion',
    initials: 'WME',
    difficulty: 2,
    score: 1080,
    moves: 145,
    timeSeconds: 360,
    date: '2000-09-14'
  },
  {
    name: 'XP Grandmaster',
    initials: 'EXP',
    difficulty: 4,
    score: 990,
    moves: 198,
    timeSeconds: 520,
    date: '2001-10-25'
  }
];

export function getSpiderHighScores(): SpiderHighScoreEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SPIDER_SCORES;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_SPIDER_SCORES;
  } catch {
    return DEFAULT_SPIDER_SCORES;
  }
}

export function saveSpiderHighScore(entry: SpiderHighScoreEntry): SpiderHighScoreEntry[] {
  try {
    const current = getSpiderHighScores();
    const updated = [...current, entry].sort((a, b) => b.score - a.score).slice(0, 10);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return [entry];
  }
}

export function getSpiderStats(): SpiderStats {
  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (!raw) {
      return {
        gamesPlayed: 0,
        gamesWon: 0,
        bestScore1Suit: 0,
        bestScore2Suits: 0,
        bestScore4Suits: 0,
        bestTimeSeconds: 9999
      };
    }
    return JSON.parse(raw);
  } catch {
    return {
      gamesPlayed: 0,
      gamesWon: 0,
      bestScore1Suit: 0,
      bestScore2Suits: 0,
      bestScore4Suits: 0,
      bestTimeSeconds: 9999
    };
  }
}

export function updateSpiderStats(won: boolean, difficulty: SpiderDifficulty, score: number, timeSeconds: number): SpiderStats {
  const stats = getSpiderStats();
  stats.gamesPlayed++;
  if (won) {
    stats.gamesWon++;
    if (difficulty === 1 && score > stats.bestScore1Suit) stats.bestScore1Suit = score;
    if (difficulty === 2 && score > stats.bestScore2Suits) stats.bestScore2Suits = score;
    if (difficulty === 4 && score > stats.bestScore4Suits) stats.bestScore4Suits = score;
    if (timeSeconds < stats.bestTimeSeconds) stats.bestTimeSeconds = timeSeconds;
  }

  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  } catch {}
  return stats;
}
