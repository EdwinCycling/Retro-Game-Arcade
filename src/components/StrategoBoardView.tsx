/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  StrategoSquare, 
  StrategoPiece, 
  RANK_NAMES, 
  CombatResult 
} from '../game/strategoEngine';

interface StrategoBoardViewProps {
  grid: readonly (readonly StrategoSquare[])[];
  selectedPos: { x: number; y: number } | null;
  validMoves: { x: number; y: number; isAttack: boolean }[];
  onSquareClick: (x: number, y: number) => void;
  lastCombat: CombatResult | null;
  phase: 'setup' | 'playing' | 'game_over';
  currentTurn: 'red' | 'blue';
}

export const StrategoBoardView: React.FC<StrategoBoardViewProps> = ({
  grid,
  selectedPos,
  validMoves,
  onSquareClick,
  lastCombat,
  phase,
  currentTurn
}) => {
  const colLabels = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
  const rowLabels = ['10', '9', '8', '7', '6', '5', '4', '3', '2', '1'];

  const getMoveAt = (x: number, y: number) => {
    return validMoves.find(m => m.x === x && m.y === y);
  };

  const renderPiece = (piece: StrategoPiece | null, isSelected: boolean) => {
    if (!piece) return null;

    const isRed = piece.side === 'red';
    // Blue pieces are hidden unless revealed or in game over
    const showRank = isRed || piece.isRevealed || phase === 'game_over';
    const rankInfo = RANK_NAMES[piece.rank];

    return (
      <div 
        className={`
          relative w-full h-full rounded-md flex flex-col items-center justify-center
          transition-all duration-150 select-none shadow-md pointer-events-none
          ${isRed 
            ? 'bg-gradient-to-br from-red-600 via-rose-700 to-red-950 border-2 border-amber-400/80 text-white' 
            : 'bg-gradient-to-br from-blue-600 via-indigo-700 to-blue-950 border-2 border-cyan-400/80 text-white'
          }
          ${isSelected ? 'ring-4 ring-yellow-400 scale-105 z-20 shadow-[0_0_15px_#facc15]' : ''}
          ${piece.isRevealed && !isRed ? 'ring-2 ring-cyan-300' : ''}
        `}
      >
        {/* Subtle wooden tower top bevel */}
        <div className="absolute top-0.5 left-1 right-1 h-1 bg-white/20 rounded-t-sm" />

        {showRank ? (
          <div className="flex flex-col items-center justify-center p-0.5 text-center leading-none">
            <span className="text-base sm:text-xl drop-shadow">{rankInfo.icon}</span>
            <div className="flex items-center gap-0.5 mt-0.5">
              <span className="font-mono font-black text-[11px] sm:text-xs text-yellow-300 drop-shadow-md">
                {piece.rank}
              </span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center">
            <span className="text-sm sm:text-lg text-cyan-200 font-bold opacity-80">🛡️</span>
            <span className="font-mono text-[10px] text-cyan-300 font-bold">?</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="relative flex flex-col items-center justify-center p-2 sm:p-4 bg-amber-950/80 border-4 border-amber-800/90 rounded-2xl shadow-2xl backdrop-blur-md w-full max-w-[660px]">
      {/* Board Header Col Labels */}
      <div className="grid grid-cols-10 w-full pb-1 font-mono text-[11px] font-bold text-amber-300/80 text-center">
        {colLabels.map(col => (
          <span key={col}>{col}</span>
        ))}
      </div>

      {/* 10x10 Board Grid */}
      <div className="relative grid grid-cols-10 grid-rows-10 gap-1 w-full aspect-square bg-emerald-950/90 p-1.5 rounded-xl border-2 border-amber-700/60 shadow-inner">
        {grid.map((row, y) =>
          row.map((square, x) => {
            const isSelected = selectedPos?.x === x && selectedPos?.y === y;
            const move = getMoveAt(x, y);
            const isCombatTarget = lastCombat?.toX === x && lastCombat?.toY === y;

            if (square.isLake) {
              return (
                <div
                  key={`${x}-${y}`}
                  className="relative rounded-md bg-gradient-to-br from-cyan-900 via-sky-800 to-blue-950 border border-cyan-500/40 flex items-center justify-center overflow-hidden shadow-inner select-none"
                  title="Water / Meer (Niet begaanbaar)"
                >
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyan-400/20 via-transparent to-transparent animate-pulse" />
                  <span className="text-xs opacity-60">🌊</span>
                </div>
              );
            }

            return (
              <button
                key={`${x}-${y}`}
                type="button"
                onClick={() => onSquareClick(x, y)}
                className={`
                  relative aspect-square rounded-md p-0.5 flex items-center justify-center cursor-pointer transition-all touch-manipulation active:scale-95
                  ${(x + y) % 2 === 0 ? 'bg-emerald-900/60 hover:bg-emerald-800/60' : 'bg-emerald-950/70 hover:bg-emerald-800/70'}
                  ${isSelected ? 'bg-amber-900/80 ring-2 ring-yellow-400 z-20' : ''}
                  ${move?.isAttack ? 'ring-2 ring-rose-500 bg-rose-950/80 animate-pulse z-10' : ''}
                  ${move && !move.isAttack ? 'ring-2 ring-emerald-400 bg-emerald-800/70 z-10' : ''}
                  ${isCombatTarget ? 'ring-4 ring-orange-400 animate-ping z-30' : ''}
                `}
                title={`Vak ${colLabels[x]}${rowLabels[y]}`}
              >
                {/* Board square piece */}
                {renderPiece(square.piece, isSelected)}

                {/* Move target indicator dot (empty square) */}
                {move && !move.isAttack && !square.piece && (
                  <div className="absolute w-3.5 h-3.5 rounded-full bg-emerald-400 shadow-[0_0_10px_#34d399] animate-pulse z-20" />
                )}

                {/* Swap indicator dot (setup phase on friendly square) */}
                {move && !move.isAttack && square.piece && !isSelected && (
                  <div className="absolute inset-0 rounded-md border-2 border-emerald-400 bg-emerald-500/20 flex items-center justify-center z-20 pointer-events-none">
                    <span className="text-[10px] text-emerald-300 font-bold">🔄</span>
                  </div>
                )}

                {/* Attack target indicator crosshair */}
                {move?.isAttack && (
                  <div className="absolute inset-0 rounded-md border-2 border-rose-500 bg-rose-900/40 flex items-center justify-center pointer-events-none z-20">
                    <span className="text-rose-300 text-xs font-black drop-shadow">⚔️</span>
                  </div>
                )}
              </button>
            );
          })
        )}
      </div>

      {/* Row Labels Bottom / Legend */}
      <div className="flex items-center justify-between w-full pt-2 text-[11px] font-mono text-amber-300/80">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
          <span>Rood (Jij / Onderaan)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
          <span>Blauw (C64 AI / Bovenaan)</span>
        </div>
      </div>
    </div>
  );
};
