/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface PongRecord {
  longestRally: number;
  playerWins: number;
  aiWins: number;
  highestDifficultyWon: string;
}

const STORAGE_KEY = 'arcade_vault_pong_stats';

const DEFAULT_RECORD: PongRecord = {
  longestRally: 14,
  playerWins: 5,
  aiWins: 3,
  highestDifficultyWon: 'Amateur',
};

export function getPongStats(): PongRecord {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return DEFAULT_RECORD;
    return JSON.parse(data);
  } catch {
    return DEFAULT_RECORD;
  }
}

export function savePongStats(stats: Partial<PongRecord>): PongRecord {
  try {
    const current = getPongStats();
    const updated: PongRecord = {
      ...current,
      ...stats,
      longestRally: Math.max(current.longestRally, stats.longestRally || 0),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return DEFAULT_RECORD;
  }
}
