/**
 * High scores & statistics storage for 3D Temple Run
 */

export interface TempleRunScore {
  id: string;
  initials: string;
  score: number;
  distance: number; // in meters
  coins: number;
  character: string;
  levelTheme: string;
  date: string;
}

const STORAGE_KEY = 'temple_run_3d_high_scores';
const STATS_KEY = 'temple_run_3d_lifetime_stats';

export interface TempleRunLifetimeStats {
  totalCoins: number;
  totalDistance: number;
  totalRuns: number;
  unlockedCharacters: string[];
  powerupLevels: {
    magnet: number;
    boost: number;
    shield: number;
    multiplier: number;
  };
}

const DEFAULT_SCORES: TempleRunScore[] = [
  { id: '1', initials: 'GUY', score: 1254000, distance: 4820, coins: 1840, character: 'Guy Dangerous', levelTheme: 'Jungle Tempel', date: '2011-08-04' },
  { id: '2', initials: 'FOX', score: 984500, distance: 3950, coins: 1420, character: 'Scarlett Fox', levelTheme: 'Rotswand Kloof', date: '2011-08-05' },
  { id: '3', initials: 'BNZ', score: 765200, distance: 3100, coins: 1110, character: 'Barry Bones', levelTheme: 'Vulkaan Ruïnes', date: '2011-08-06' },
  { id: '4', initials: 'KRM', score: 542000, distance: 2450, coins: 890, character: 'Karma Lee', levelTheme: 'Jungle Tempel', date: '2011-08-07' },
  { id: '5', initials: 'EDW', score: 412000, distance: 1980, coins: 650, character: 'Guy Dangerous', levelTheme: 'Jungle Tempel', date: '2011-08-08' },
];

export function getTempleRunScores(): TempleRunScore[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SCORES;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_SCORES;
  } catch {
    return DEFAULT_SCORES;
  }
}

export function saveTempleRunScore(score: Omit<TempleRunScore, 'id'>): TempleRunScore[] {
  const current = getTempleRunScores();
  const newEntry: TempleRunScore = {
    ...score,
    id: Date.now().toString()
  };
  const updated = [...current, newEntry].sort((a, b) => b.score - a.score).slice(0, 10);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {}

  // Update lifetime stats
  updateLifetimeStats(score.coins, score.distance);

  return updated;
}

export function getLifetimeStats(): TempleRunLifetimeStats {
  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (!raw) {
      return {
        totalCoins: 2500,
        totalDistance: 12500,
        totalRuns: 8,
        unlockedCharacters: ['Guy Dangerous', 'Scarlett Fox'],
        powerupLevels: { magnet: 1, boost: 1, shield: 1, multiplier: 1 }
      };
    }
    return JSON.parse(raw);
  } catch {
    return {
      totalCoins: 2500,
      totalDistance: 12500,
      totalRuns: 8,
      unlockedCharacters: ['Guy Dangerous', 'Scarlett Fox'],
      powerupLevels: { magnet: 1, boost: 1, shield: 1, multiplier: 1 }
    };
  }
}

export function updateLifetimeStats(addedCoins: number, addedDistance: number) {
  const stats = getLifetimeStats();
  stats.totalCoins += addedCoins;
  stats.totalDistance += addedDistance;
  stats.totalRuns += 1;
  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  } catch {}
}
