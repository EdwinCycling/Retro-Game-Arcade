import { KlaverjasSystem } from './klaverjasTypes';

export interface KlaverjasHighScoreEntry {
  name: string;
  initials: string;
  system: KlaverjasSystem;
  scoreWij: number;
  scoreZij: number;
  roemTotal: number;
  date: string;
}

export interface KlaverjasStats {
  matchesPlayed: number;
  matchesWon: number;
  pitsMade: number;
  timesNat: number;
  bestScoreBoompje: number;
}

const STORAGE_KEY = 'retro_klaverjas_high_scores';
const STATS_KEY = 'retro_klaverjas_stats';

export const DEFAULT_KLAVERJAS_SCORES: KlaverjasHighScoreEntry[] = [
  {
    name: 'Klaverjas Café De Jordaan',
    initials: 'AMS',
    system: 'amsterdams',
    scoreWij: 782,
    scoreZij: 498,
    roemTotal: 180,
    date: '1985-11-20'
  },
  {
    name: 'Havenbar Rotterdam',
    initials: 'RTM',
    system: 'rotterdams',
    scoreWij: 814,
    scoreZij: 520,
    roemTotal: 220,
    date: '1988-03-14'
  },
  {
    name: 'Ome Henk & Tante Corrie',
    initials: 'HNK',
    system: 'amsterdams',
    scoreWij: 742,
    scoreZij: 610,
    roemTotal: 140,
    date: '1992-09-02'
  }
];

export function getKlaverjasHighScores(): KlaverjasHighScoreEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_KLAVERJAS_SCORES;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_KLAVERJAS_SCORES;
  } catch {
    return DEFAULT_KLAVERJAS_SCORES;
  }
}

export function saveKlaverjasHighScore(entry: KlaverjasHighScoreEntry): KlaverjasHighScoreEntry[] {
  try {
    const current = getKlaverjasHighScores();
    const updated = [...current, entry].sort((a, b) => b.scoreWij - a.scoreWij).slice(0, 10);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return [entry];
  }
}

export function getKlaverjasStats(): KlaverjasStats {
  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (!raw) {
      return {
        matchesPlayed: 0,
        matchesWon: 0,
        pitsMade: 0,
        timesNat: 0,
        bestScoreBoompje: 0
      };
    }
    return JSON.parse(raw);
  } catch {
    return {
      matchesPlayed: 0,
      matchesWon: 0,
      pitsMade: 0,
      timesNat: 0,
      bestScoreBoompje: 0
    };
  }
}

export function updateKlaverjasStats(won: boolean, scoreWij: number, pits: number, nats: number): KlaverjasStats {
  const stats = getKlaverjasStats();
  stats.matchesPlayed++;
  if (won) stats.matchesWon++;
  stats.pitsMade += pits;
  stats.timesNat += nats;
  if (scoreWij > stats.bestScoreBoompje) stats.bestScoreBoompje = scoreWij;

  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  } catch {}
  return stats;
}
