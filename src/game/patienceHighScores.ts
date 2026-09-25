import { PatienceHighScoreEntry, PatienceStats, DrawMode, ScoringMode } from './patienceTypes';
export type { PatienceHighScoreEntry, PatienceStats };

const STORAGE_KEY = 'retro_patience_high_scores';
const STATS_KEY = 'retro_patience_stats';

export const DEFAULT_PATIENCE_SCORES: PatienceHighScoreEntry[] = [
  {
    name: 'Wes Cherry (Win90 Dev)',
    initials: 'WES',
    score: 7280,
    drawMode: 1,
    scoringMode: 'standard',
    moves: 92,
    timeSeconds: 98,
    date: '1990-05-22'
  },
  {
    name: 'Susan Kare (Pixel Deck)',
    initials: 'KRE',
    score: 6840,
    drawMode: 1,
    scoringMode: 'standard',
    moves: 104,
    timeSeconds: 115,
    date: '1990-05-22'
  },
  {
    name: 'Bill Gates (Win3.0)',
    initials: 'GTS',
    score: 5920,
    drawMode: 3,
    scoringMode: 'standard',
    moves: 128,
    timeSeconds: 145,
    date: '1990-08-14'
  },
  {
    name: 'Solitaire Mastermind',
    initials: 'SOL',
    score: 5400,
    drawMode: 3,
    scoringMode: 'standard',
    moves: 136,
    timeSeconds: 172,
    date: '1995-08-24'
  },
  {
    name: 'Klondike Champion',
    initials: 'KLN',
    score: 4890,
    drawMode: 1,
    scoringMode: 'standard',
    moves: 142,
    timeSeconds: 190,
    date: '1998-06-25'
  }
];

export const DEFAULT_PATIENCE_STATS: PatienceStats = {
  gamesPlayed: 14,
  gamesWon: 11,
  currentStreak: 3,
  bestStreak: 6,
  bestTimeSeconds: 98,
  bestScore: 7280,
  totalMoves: 1240
};

export function getPatienceHighScores(): PatienceHighScoreEntry[] {
  if (typeof window === 'undefined') return DEFAULT_PATIENCE_SCORES;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PATIENCE_SCORES;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
  } catch {
    // fallback
  }
  return DEFAULT_PATIENCE_SCORES;
}

export function savePatienceHighScore(entry: PatienceHighScoreEntry): PatienceHighScoreEntry[] {
  if (typeof window === 'undefined') return DEFAULT_PATIENCE_SCORES;
  try {
    const current = getPatienceHighScores();
    const updated = [...current, entry]
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return DEFAULT_PATIENCE_SCORES;
  }
}

export function getPatienceStats(): PatienceStats {
  if (typeof window === 'undefined') return DEFAULT_PATIENCE_STATS;
  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (!raw) return DEFAULT_PATIENCE_STATS;
    return { ...DEFAULT_PATIENCE_STATS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_PATIENCE_STATS;
  }
}

export function updatePatienceStats(won: boolean, score: number, timeSeconds: number, moves: number): PatienceStats {
  if (typeof window === 'undefined') return DEFAULT_PATIENCE_STATS;
  try {
    const current = getPatienceStats();
    const played = current.gamesPlayed + 1;
    const wonCount = won ? current.gamesWon + 1 : current.gamesWon;
    const currentStreak = won ? current.currentStreak + 1 : 0;
    const bestStreak = Math.max(current.bestStreak, currentStreak);
    const bestTime = won && timeSeconds > 0
      ? (current.bestTimeSeconds === 0 ? timeSeconds : Math.min(current.bestTimeSeconds, timeSeconds))
      : current.bestTimeSeconds;
    const bestScore = Math.max(current.bestScore, score);
    const totalMoves = current.totalMoves + moves;

    const newStats: PatienceStats = {
      gamesPlayed: played,
      gamesWon: wonCount,
      currentStreak,
      bestStreak,
      bestTimeSeconds: bestTime,
      bestScore,
      totalMoves
    };

    localStorage.setItem(STATS_KEY, JSON.stringify(newStats));
    return newStats;
  } catch {
    return DEFAULT_PATIENCE_STATS;
  }
}
