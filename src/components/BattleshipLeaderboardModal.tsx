/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Trophy, RotateCcw, X, Award, Sparkles, Anchor } from 'lucide-react';
import { BattleshipScoreEntry, getBattleshipHighScores, resetBattleshipHighScores } from '../game/battleshipHighScores';

interface BattleshipLeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlayAgain?: () => void;
  highlightId?: string;
}

export const BattleshipLeaderboardModal: React.FC<BattleshipLeaderboardModalProps> = ({
  isOpen,
  onClose,
  onPlayAgain,
  highlightId
}) => {
  const [scores, setScores] = useState<BattleshipScoreEntry[]>(() => getBattleshipHighScores());
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setScores(getBattleshipHighScores());
      setShowConfirmReset(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleReset = () => {
    const defaults = resetBattleshipHighScores();
    setScores(defaults);
    setShowConfirmReset(false);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const getRankBadge = (index: number) => {
    if (index === 0) {
      return (
        <span className="flex items-center gap-1 text-yellow-400 font-bold">
          <Trophy className="w-3.5 h-3.5 text-yellow-400" />
          <span>1ST</span>
        </span>
      );
    }
    if (index === 1) {
      return (
        <span className="flex items-center gap-1 text-stone-300 font-bold">
          <Award className="w-3.5 h-3.5 text-stone-300" />
          <span>2ND</span>
        </span>
      );
    }
    if (index === 2) {
      return (
        <span className="flex items-center gap-1 text-amber-600 font-bold">
          <Award className="w-3.5 h-3.5 text-amber-600" />
          <span>3RD</span>
        </span>
      );
    }
    return <span className="text-stone-500 font-bold font-mono">{index + 1}TH</span>;
  };

  const getDiffBadge = (diff: string) => {
    switch (diff) {
      case 'hard':
        return <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-red-950 text-red-300 border border-red-800">10×10 HARD</span>;
      case 'medium':
        return <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-amber-950 text-amber-300 border border-amber-800">8×8 MEDIUM</span>;
      default:
        return <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-cyan-950 text-cyan-300 border border-cyan-800">8×8 EASY</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-xs p-4 select-none animate-in fade-in duration-150">
      <div className="bg-[#0f172a] border-2 border-cyan-600/70 rounded-3xl max-w-lg w-full p-5 sm:p-6 text-stone-100 shadow-[0_0_50px_rgba(6,182,212,0.35)] space-y-4">
        
        {/* Header */}
        <div className="flex items-start justify-between border-b border-cyan-900/40 pb-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Anchor className="w-4 h-4 text-cyan-400" />
              <span className="text-cyan-400 text-[10px] font-mono font-bold tracking-widest uppercase">
                ADMIRALITEIT ERELIJST • VLOOTLOGBOEK
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2 font-serif">
              <span>ZEESLAG SOLITAIRE RECORDS</span>
              <span className="text-xs font-mono font-normal text-stone-400">
                (Lokaal Opgeslagen)
              </span>
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-800 text-stone-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scoring Rules Legend banner */}
        <div className="p-2.5 rounded-xl bg-slate-900/90 border border-cyan-900/40 text-[10px] sm:text-[11px] font-mono text-stone-400 grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
          <div className="flex flex-col items-center">
            <span className="text-cyan-300 font-bold">⏱️ Snelheid</span>
            <span>+3.000 max bonus</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-yellow-400 font-bold">💡 Hints</span>
            <span>-800 pnt per hint</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-red-400 font-bold">⚠️ Fouten</span>
            <span>-400 pnt per fout</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-blue-400 font-bold">✏️ Correcties</span>
            <span>-100 pnt overschrijven</span>
          </div>
        </div>

        {/* Scores Table */}
        <div className="rounded-2xl border border-slate-800 bg-slate-950/70 overflow-hidden max-h-72 overflow-y-auto">
          <table className="w-full text-xs font-mono">
            <thead className="bg-slate-900 text-[10px] text-stone-400 uppercase tracking-wider sticky top-0 border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3 text-left">Rang</th>
                <th className="py-2.5 px-2 text-left">Admiraal</th>
                <th className="py-2.5 px-2 text-right">Score</th>
                <th className="py-2.5 px-2 text-center">Tijd</th>
                <th className="py-2.5 px-2 text-center">Raster</th>
                <th className="py-2.5 px-3 text-center">F/H/C</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900/80">
              {scores.map((entry, idx) => {
                const isHighlighted = highlightId && entry.id === highlightId;
                return (
                  <tr
                    key={entry.id}
                    className={`transition-colors ${
                      isHighlighted 
                        ? 'bg-cyan-950/60 text-cyan-200 font-bold border-l-4 border-cyan-500' 
                        : idx === 0 
                        ? 'bg-slate-900/40 text-yellow-300 font-bold' 
                        : 'text-stone-300 hover:bg-slate-900/30'
                    }`}
                  >
                    <td className="py-2 px-3 whitespace-nowrap">
                      {getRankBadge(idx)}
                    </td>
                    <td className="py-2 px-2 font-bold tracking-wider text-white">
                      {entry.initials}
                    </td>
                    <td className="py-2 px-2 text-right font-black text-cyan-400">
                      {entry.score.toLocaleString()}
                    </td>
                    <td className="py-2 px-2 text-center text-stone-400">
                      {formatTime(entry.timeSeconds)}
                    </td>
                    <td className="py-2 px-2 text-center">
                      {getDiffBadge(entry.difficulty)}
                    </td>
                    <td className="py-2 px-3 text-center text-[10px] text-stone-400">
                      <span className="text-red-400">{entry.mistakes}</span>/
                      <span className="text-yellow-400">{entry.hintsUsed}</span>/
                      <span className="text-blue-400">{entry.corrections}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-1">
          {showConfirmReset ? (
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-red-400 font-mono">Zeker weten?</span>
              <button
                onClick={handleReset}
                className="px-2.5 py-1 text-xs font-bold rounded-lg bg-red-600 hover:bg-red-500 text-white cursor-pointer"
              >
                Ja, reset
              </button>
              <button
                onClick={() => setShowConfirmReset(false)}
                className="px-2.5 py-1 text-xs font-bold rounded-lg bg-slate-800 text-stone-300 hover:bg-slate-700 cursor-pointer"
              >
                Annuleer
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowConfirmReset(true)}
              className="flex items-center gap-1.5 text-xs text-stone-500 hover:text-stone-300 font-mono transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset naar Fabrieksstand</span>
            </button>
          )}

          <div className="flex items-center gap-2">
            {onPlayAgain && (
              <button
                onClick={() => {
                  onClose();
                  onPlayAgain();
                }}
                className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-black text-xs transition-all shadow-md active:scale-95 cursor-pointer font-serif"
              >
                Nieuwe Zeeslag
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-all cursor-pointer"
            >
              Sluiten
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
