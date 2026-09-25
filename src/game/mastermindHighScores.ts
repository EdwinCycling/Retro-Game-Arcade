import { GameMode, MastermindStats } from './mastermindTypes';

export interface MastermindHighScoreEntry {
  name: string;
  initials: string;
  score: number;
  mode: GameMode;
  turnsUsed: number;
  timeSeconds: number;
  date: string;
}

const STORAGE_KEY = 'retro_mastermind_high_scores';
const STATS_KEY = 'retro_mastermind_stats';

export const DEFAULT_MASTERMIND_SCORES: MastermindHighScoreEntry[] = [
  {
    name: 'Mordecai Meirowitz',
    initials: 'MMW',
    score: 18450,
    mode: 'classic',
    turnsUsed: 3,
    timeSeconds: 42,
    date: '1971-04-12',
  },
  {
    name: 'Invicta Grandmaster',
    initials: 'INV',
    score: 16800,
    mode: 'super',
    turnsUsed: 4,
    timeSeconds: 58,
    date: '1972-09-18',
  },
  {
    name: 'Jumbo Codebreaker',
    initials: 'JMB',
    score: 14500,
    mode: 'classic',
    turnsUsed: 4,
    timeSeconds: 65,
    date: '1973-03-24',
  },
  {
    name: 'Donald Knuth (5-Guess)',
    initials: 'DEK',
    score: 13200,
    mode: 'classic',
    turnsUsed: 5,
    timeSeconds: 84,
    date: '1977-11-15',
  },
  {
    name: 'Alan Turing Mind',
    initials: 'TUR',
    score: 11950,
    mode: 'super',
    turnsUsed: 6,
    timeSeconds: 110,
    date: '1980-06-01',
  },
];

export function getMastermindHighScores(): MastermindHighScoreEntry[] {
  if (typeof window === 'undefined') return DEFAULT_MASTERMIND_SCORES;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_MASTERMIND_SCORES;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
  } catch {
    // Ignore storage parse error
  }
  return DEFAULT_MASTERMIND_SCORES;
}

export function saveMastermindHighScore(entry: Omit<MastermindHighScoreEntry, 'date'> & { date?: string }): MastermindHighScoreEntry[] {
  const current = getMastermindHighScores();
  const dateStr = entry.date || new Date().toISOString().split('T')[0];
  const newEntry: MastermindHighScoreEntry = {
    ...entry,
    date: dateStr,
    initials: (entry.initials || 'DOC').toUpperCase().slice(0, 3),
  };

  const updated = [...current, newEntry]
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // Ignore storage quota error
  }
  return updated;
}

export function getMastermindStats(): MastermindStats {
  const defaultStats: MastermindStats = {
    gamesPlayed: 0,
    gamesWon: 0,
    currentStreak: 0,
    maxStreak: 0,
    totalTurnsUsed: 0,
    fastestWinSeconds: null,
  };

  if (typeof window === 'undefined') return defaultStats;
  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (!raw) return defaultStats;
    return { ...defaultStats, ...JSON.parse(raw) };
  } catch {
    return defaultStats;
  }
}

export function updateMastermindStats(won: boolean, turnsUsed?: number, durationSeconds?: number): MastermindStats {
  const stats = getMastermindStats();
  stats.gamesPlayed += 1;

  if (won) {
    stats.gamesWon += 1;
    stats.currentStreak += 1;
    if (stats.currentStreak > stats.maxStreak) {
      stats.maxStreak = stats.currentStreak;
    }
    if (turnsUsed !== undefined) {
      stats.totalTurnsUsed += turnsUsed;
    }
    if (durationSeconds !== undefined) {
      if (stats.fastestWinSeconds === null || durationSeconds < stats.fastestWinSeconds) {
        stats.fastestWinSeconds = durationSeconds;
      }
    }
  } else {
    stats.currentStreak = 0;
  }

  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  } catch {
    // Ignore
  }
  return stats;
}

/**
 * Calculates score based on mode, turns remaining, elapsed seconds, and duplicate settings
 */
export function calculateMastermindScore(
  mode: GameMode,
  maxTurns: number,
  turnsUsed: number,
  timeSeconds: number,
  allowDuplicates: boolean,
  hintsUsed: number
): number {
  const baseScore = 5000;
  const turnsRemaining = Math.max(0, maxTurns - turnsUsed);
  const turnBonus = turnsRemaining * 1250;
  const speedBonus = Math.max(0, 300 - timeSeconds) * 20;
  const modeMultiplier = mode === 'super' ? 1.8 : mode === 'mini' ? 1.3 : 1.0;
  const duplicateMultiplier = allowDuplicates ? 1.25 : 1.0;
  const hintPenalty = hintsUsed * 1000;

  const rawScore = (baseScore + turnBonus + speedBonus) * modeMultiplier * duplicateMultiplier - hintPenalty;
  return Math.max(100, Math.round(rawScore));
}
