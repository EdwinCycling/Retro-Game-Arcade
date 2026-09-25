/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { CellState, WinningLine, coordToIndex } from '../game/radarsoft3DTicTacToeEngine';

interface RadarsoftLayerBoardsProps {
  board: readonly CellState[];
  hoveredCell: number | null;
  onHoverCell: (idx: number | null) => void;
  onSelectCell: (idx: number) => void;
  winningIndices: number[] | null;
  winningLine: WinningLine | null;
  threats: number[];
  canMakeMove: (idx: number) => boolean;
}

export const RadarsoftLayerBoards: React.FC<RadarsoftLayerBoardsProps> = ({
  board,
  hoveredCell,
  onHoverCell,
  onSelectCell,
  winningIndices,
  winningLine: _winningLine,
  threats,
  canMakeMove
}) => {
  const rowLabels = ['A', 'B', 'C', 'D'];
  const colLabels = ['1', '2', '3', '4'];
  const layerTitles = [
    { z: 0, titleNl: 'Laag 1 (Bodem)', titleEn: 'Layer 1 (Bottom)' },
    { z: 1, titleNl: 'Laag 2 (Midden-Onder)', titleEn: 'Layer 2 (Mid-Low)' },
    { z: 2, titleNl: 'Laag 3 (Midden-Boven)', titleEn: 'Layer 3 (Mid-High)' },
    { z: 3, titleNl: 'Laag 4 (Top)', titleEn: 'Layer 4 (Top)' }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 w-full">
      {layerTitles.map(({ z, titleNl }) => (
        <div
          key={z}
          className="flex flex-col bg-slate-900/90 border border-slate-700/80 rounded-xl p-2.5 shadow-md"
        >
          {/* Layer Header */}
          <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-slate-700/60 font-mono text-xs">
            <span className="font-bold text-cyan-400">{titleNl}</span>
            <span className="text-slate-400">Z = {z + 1}</span>
          </div>

          {/* 4x4 Grid with Column Labels */}
          <div className="flex flex-col">
            <div className="grid grid-cols-5 text-[10px] font-mono text-slate-400 text-center pb-1">
              <span />
              {colLabels.map(c => (
                <span key={c}>{c}</span>
              ))}
            </div>

            {rowLabels.map((rowLabel, y) => (
              <div key={rowLabel} className="grid grid-cols-5 items-center gap-1 my-0.5">
                <span className="text-[10px] font-mono text-slate-400 text-center">{rowLabel}</span>
                {colLabels.map((_, x) => {
                  const idx = coordToIndex(x, y, z);
                  const val = board[idx];
                  const isHovered = hoveredCell === idx;
                  const isWinning = winningIndices?.includes(idx);
                  const isThreat = threats.includes(idx);
                  const isClickable = canMakeMove(idx);

                  return (
                    <button
                      key={x}
                      type="button"
                      disabled={!isClickable && val === null}
                      onClick={() => onSelectCell(idx)}
                      onMouseEnter={() => onHoverCell(idx)}
                      onMouseLeave={() => onHoverCell(null)}
                      title={`L${z + 1}-${rowLabel}${x + 1} (${val || 'leeg'})`}
                      className={`
                        relative aspect-square flex items-center justify-center rounded font-mono font-bold text-sm
                        transition-all duration-150 select-none
                        ${val === 'X' 
                          ? isWinning 
                            ? 'bg-cyan-500 text-slate-950 ring-2 ring-white shadow-[0_0_12px_#38bdf8] animate-pulse' 
                            : 'bg-cyan-950/80 text-cyan-300 border border-cyan-500/50 shadow-[0_0_6px_rgba(56,189,248,0.2)]'
                          : val === 'O'
                          ? isWinning
                            ? 'bg-amber-400 text-slate-950 ring-2 ring-white shadow-[0_0_12px_#fbbf24] animate-pulse'
                            : 'bg-amber-950/80 text-amber-300 border border-amber-500/50 shadow-[0_0_6px_rgba(251,191,36,0.2)]'
                          : isHovered
                          ? 'bg-cyan-900/50 border border-cyan-400 ring-1 ring-cyan-400/50'
                          : isThreat
                          ? 'bg-rose-950/40 border border-rose-500/60 ring-1 ring-rose-500/30'
                          : 'bg-slate-800/60 hover:bg-slate-700/60 border border-slate-700/40'
                        }
                      `}
                    >
                      {val === 'X' && <span>✕</span>}
                      {val === 'O' && <span>◯</span>}
                      {val === null && isThreat && (
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                      )}
                      {val === null && !isThreat && isHovered && (
                        <span className="text-[9px] text-cyan-400/60 font-mono">+</span>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
