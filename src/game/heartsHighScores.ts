export interface HeartsHighScoreEntry {
  name: string;
  initials: string;
  score: number;
  roundsPlayed: number;
  moonShots: number;
  date: string;
}

export interface HeartsStats {
  gamesPlayed: number;
  gamesWon: number;
  moonShotsTotal: number;
  bestGameScore: number;
  totalPointsAccumulated: number;
}

const STORAGE_KEY = 'retro_hearts_high_scores';
const STATS_KEY = 'retro_hearts_stats';

export const DEFAULT_HEARTS_SCORES: HeartsHighScoreEntry[] = [
  {
    name: 'Paul (Microsoft)',
    initials: 'POL',
    score: 18,
    roundsPlayed: 6,
    moonShots: 1,
    date: '1992-10-27'
  },
  {
    name: 'Michele (Win95 Bot)',
    initials: 'MCH',
    score: 34,
    roundsPlayed: 7,
    moonShots: 0,
    date: '1995-08-24'
  },
  {
    name: 'Ben (Network Bot)',
    initials: 'BEN',
    score: 42,
    roundsPlayed: 8,
    moonShots: 0,
    date: '1993-04-12'
  }
];

export function getHeartsHighScores(): HeartsHighScoreEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_HEARTS_SCORES;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_HEARTS_SCORES;
  } catch {
    return DEFAULT_HEARTS_SCORES;
  }
}

export function saveHeartsHighScore(entry: HeartsHighScoreEntry): HeartsHighScoreEntry[] {
  try {
    const current = getHeartsHighScores();
    const updated = [...current, entry].sort((a, b) => a.score - b.score).slice(0, 10);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return [entry];
  }
}

export function getHeartsStats(): HeartsStats {
  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (!raw) {
      return {
        gamesPlayed: 0,
        gamesWon: 0,
        moonShotsTotal: 0,
        bestGameScore: 999,
        totalPointsAccumulated: 0
      };
    }
    return JSON.parse(raw);
  } catch {
    return {
      gamesPlayed: 0,
      gamesWon: 0,
      moonShotsTotal: 0,
      bestGameScore: 999,
      totalPointsAccumulated: 0
    };
  }
}

export function updateHeartsStats(won: boolean, score: number, moonShots: number): HeartsStats {
  const stats = getHeartsStats();
  stats.gamesPlayed++;
  if (won) stats.gamesWon++;
  stats.moonShotsTotal += moonShots;
  stats.totalPointsAccumulated += score;
  if (stats.bestGameScore === 999 || score < stats.bestGameScore) {
    stats.bestGameScore = score;
  }

  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  } catch {}
  return stats;
}
