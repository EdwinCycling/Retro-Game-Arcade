/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GameStats } from './battleChessTypes';

const STATS_KEY = 'retro_arcade_battle_chess_stats';

const DEFAULT_STATS: GameStats = {
  whiteWins: 0,
  blackWins: 0,
  draws: 0,
  totalBattles: 0,
  fastestCheckmateMoves: 0,
  totalPiecesSlain: 0,
};

export function getBattleChessStats(): GameStats {
  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (!raw) return DEFAULT_STATS;
    return { ...DEFAULT_STATS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_STATS;
  }
}

export function saveBattleChessStats(stats: Partial<GameStats>): GameStats {
  try {
    const current = getBattleChessStats();
    const updated: GameStats = {
      ...current,
      ...stats,
    };
    localStorage.setItem(STATS_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return DEFAULT_STATS;
  }
}

export function recordBattleChessWin(winner: 'w' | 'b' | 'draw', moveCount: number, capturesInGame: number) {
  const current = getBattleChessStats();
  const fastest = winner !== 'draw' && (current.fastestCheckmateMoves === 0 || moveCount < current.fastestCheckmateMoves)
    ? moveCount
    : current.fastestCheckmateMoves;

  saveBattleChessStats({
    whiteWins: current.whiteWins + (winner === 'w' ? 1 : 0),
    blackWins: current.blackWins + (winner === 'b' ? 1 : 0),
    draws: current.draws + (winner === 'draw' ? 1 : 0),
    totalBattles: current.totalBattles + 1,
    fastestCheckmateMoves: fastest,
    totalPiecesSlain: current.totalPiecesSlain + capturesInGame
  });
}
