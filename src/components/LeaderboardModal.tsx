import React, { useState, useEffect } from 'react';
import { Trophy, RotateCcw, X, Award, Sparkles } from 'lucide-react';
import { getHighScores, resetHighScoresToDefaults } from '../game/highScores';
import { HighScoreEntry } from '../types';

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlayAgain?: () => void;
  highlightId?: string;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  isOpen,
  onClose,
  onPlayAgain,
  highlightId
}) => {
  const [scores, setScores] = useState<HighScoreEntry[]>(() => getHighScores());
  const [showConfirmReset, setShowConfirmReset] = useState<boolean>(false);

  // Refresh scores when opened
  React.useEffect(() => {
    if (isOpen) {
      setScores(getHighScores());
      setShowConfirmReset(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleReset = () => {
    const defaults = resetHighScoresToDefaults();
    setScores(defaults);
    setShowConfirmReset(false);
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
        <span className="flex items-center gap-1 text-slate-300 font-bold">
          <Award className="w-3.5 h-3.5 text-slate-300" />
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
    return <span className="text-neutral-500 font-bold">{index + 1}TH</span>;
  };

  const getDifficultyBadge = (diff: string) => {
    if (diff === 'casual') {
      return (
        <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-blue-950 text-blue-300 border border-blue-800">
          EASY
        </span>
      );
    }
    if (diff === 'turbo') {
      return (
        <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-red-950 text-red-300 border border-red-800">
          EXPERT
        </span>
      );
    }
    return (
      <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-yellow-950 text-yellow-300 border border-yellow-800">
        CLASSIC
      </span>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-xs p-4 select-none">
      <div className="bg-black border-2 border-yellow-400 rounded-2xl max-w-lg w-full p-6 text-white shadow-[0_0_50px_rgba(250,204,21,0.3)] space-y-5 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-start justify-between border-b border-gray-900 pb-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-yellow-400" />
              <span className="text-pink-500 text-[10px] font-bold tracking-widest uppercase">
                ARCADE HALL OF FAME
              </span>
            </div>
            <h2 className="text-yellow-400 font-bold tracking-widest font-['Press_Start_2P'] text-sm sm:text-base">
              TOP SCORES
            </h2>
            <p className="text-neutral-400 text-xs">
              Lokaal bewaarde topscores & prestaties
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-900 transition-colors"
            aria-label="Sluiten"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Leaderboard Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="text-neutral-500 border-b border-neutral-900 pb-2 text-[10px] uppercase tracking-wider">
                <th className="py-2 px-1">RANG</th>
                <th className="py-2 px-2">NAAM</th>
                <th className="py-2 px-2 text-right">SCORE</th>
                <th className="py-2 px-2 text-center">LEVEL</th>
                <th className="py-2 px-2 text-center">MODUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-900">
              {scores.map((entry, index) => {
                const isHighlight = highlightId === entry.id;
                return (
                  <tr
                    key={entry.id || index}
                    className={`transition-colors ${
                      isHighlight
                        ? 'bg-yellow-400/20 text-yellow-300 font-bold'
                        : index % 2 === 0
                        ? 'bg-neutral-950/60'
                        : 'bg-transparent'
                    } hover:bg-neutral-900/60`}
                  >
                    <td className="py-2 px-1 whitespace-nowrap">
                      {getRankBadge(index)}
                    </td>
                    <td className="py-2 px-2 font-bold font-['Press_Start_2P'] text-[11px] tracking-wider text-pink-400">
                      {entry.initials}
                    </td>
                    <td className="py-2 px-2 text-right font-bold text-white tracking-tight">
                      {entry.score.toLocaleString()}
                    </td>
                    <td className="py-2 px-2 text-center text-cyan-300">
                      LVL {entry.level}
                    </td>
                    <td className="py-2 px-2 text-center whitespace-nowrap">
                      {getDifficultyBadge(entry.difficulty)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Reset Confirmation or Trigger */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-900 text-[11px]">
          {showConfirmReset ? (
            <div className="flex items-center gap-2">
              <span className="text-red-400 text-xs">Zeker weten?</span>
              <button
                type="button"
                onClick={handleReset}
                className="px-2.5 py-1 rounded bg-red-900/80 hover:bg-red-800 text-red-200 text-xs font-bold"
              >
                Ja, reset
              </button>
              <button
                type="button"
                onClick={() => setShowConfirmReset(false)}
                className="px-2.5 py-1 rounded bg-neutral-900 text-neutral-400 hover:text-white text-xs"
              >
                Nee
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowConfirmReset(true)}
              className="flex items-center gap-1 text-neutral-500 hover:text-neutral-400 transition-colors text-[11px]"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Standaard scores herstellen</span>
            </button>
          )}

          <div className="flex items-center gap-2">
            {onPlayAgain && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onPlayAgain();
                }}
                className="px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider bg-yellow-400 text-black hover:bg-yellow-300 shadow-[0_0_15px_rgba(250,204,21,0.4)] transition-transform active:scale-95"
              >
                Speel Opnieuw
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-medium text-neutral-400 hover:text-white hover:bg-neutral-900 transition-colors"
            >
              Sluiten
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
