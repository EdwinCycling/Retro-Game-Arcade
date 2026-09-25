export interface FreeCellHighScoreEntry {
  name: string;
  initials: string;
  gameNumber: number;
  moves: number;
  timeSeconds: number;
  date: string;
}

export interface FreeCellStats {
  gamesPlayed: number;
  gamesWon: number;
  currentStreak: number;
  bestStreak: number;
  bestTimeSeconds: number;
  fewestMoves: number;
}

const STORAGE_KEY = 'retro_freecell_high_scores';
const STATS_KEY = 'retro_freecell_stats';

export const DEFAULT_FREECELL_SCORES: FreeCellHighScoreEntry[] = [
  {
    name: 'Jim Henson (Win3.1)',
    initials: 'JIM',
    gameNumber: 617,
    moves: 82,
    timeSeconds: 145,
    date: '1991-08-15'
  },
  {
    name: 'Paul Allen (MSFT)',
    initials: 'POL',
    gameNumber: 11982,
    moves: 99,
    timeSeconds: 210,
    date: '1995-08-24'
  },
  {
    name: 'Susan Kare',
    initials: 'SKR',
    gameNumber: 32000,
    moves: 88,
    timeSeconds: 160,
    date: '1992-04-10'
  }
];

export function getFreeCellHighScores(): FreeCellHighScoreEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_FREECELL_SCORES;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_FREECELL_SCORES;
  } catch {
    return DEFAULT_FREECELL_SCORES;
  }
}

export function saveFreeCellHighScore(entry: FreeCellHighScoreEntry): FreeCellHighScoreEntry[] {
  try {
    const current = getFreeCellHighScores();
    const updated = [...current, entry].sort((a, b) => a.timeSeconds - b.timeSeconds).slice(0, 10);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return [entry];
  }
}

export function getFreeCellStats(): FreeCellStats {
  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (!raw) {
      return {
        gamesPlayed: 0,
        gamesWon: 0,
        currentStreak: 0,
        bestStreak: 0,
        bestTimeSeconds: 9999,
        fewestMoves: 9999
      };
    }
    return JSON.parse(raw);
  } catch {
    return {
      gamesPlayed: 0,
      gamesWon: 0,
      currentStreak: 0,
      bestStreak: 0,
      bestTimeSeconds: 9999,
      fewestMoves: 9999
    };
  }
}

export function updateFreeCellStats(won: boolean, timeSeconds: number, moves: number): FreeCellStats {
  const stats = getFreeCellStats();
  stats.gamesPlayed++;
  if (won) {
    stats.gamesWon++;
    stats.currentStreak++;
    if (stats.currentStreak > stats.bestStreak) stats.bestStreak = stats.currentStreak;
    if (timeSeconds < stats.bestTimeSeconds) stats.bestTimeSeconds = timeSeconds;
    if (moves < stats.fewestMoves) stats.fewestMoves = moves;
  } else {
    stats.currentStreak = 0;
  }

  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  } catch {}
  return stats;
}
