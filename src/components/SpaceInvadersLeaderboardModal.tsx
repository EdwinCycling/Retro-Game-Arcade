import React, { useState } from 'react';
import { Trophy, X, Medal, ShieldAlert } from 'lucide-react';
import { SpaceInvaderScoreEntry } from '../game/spaceInvadersTypes';
import { getSpaceHighScores, saveSpaceHighScoreEntry } from '../game/spaceInvadersHighScores';

interface SpaceInvadersLeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  pendingScore?: { score: number; wave: number } | null;
  onScoreSaved?: () => void;
}

export const SpaceInvadersLeaderboardModal: React.FC<SpaceInvadersLeaderboardModalProps> = ({
  isOpen,
  onClose,
  pendingScore,
  onScoreSaved
}) => {
  const [scores, setScores] = useState<SpaceInvaderScoreEntry[]>(() => getSpaceHighScores());
  const [initials, setInitials] = useState('');
  const [saved, setSaved] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pendingScore || saved) return;
    const cleaned = (initials || 'AAA').slice(0, 3).toUpperCase();
    const updated = saveSpaceHighScoreEntry({
      initials: cleaned,
      score: pendingScore.score,
      wave: pendingScore.wave
    });
    setScores(updated);
    setSaved(true);
    if (onScoreSaved) {
      onScoreSaved();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in select-none">
      <div className="relative w-full max-w-md bg-neutral-950 border-2 border-emerald-500/80 rounded-2xl shadow-[0_0_40px_rgba(16,185,129,0.3)] flex flex-col overflow-hidden text-neutral-200">
        
        {/* Header */}
        <div className="p-4 border-b border-neutral-800 bg-neutral-900/90 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Trophy className="w-5 h-5 text-emerald-400" />
            <h3 className="font-mono font-black text-emerald-400 tracking-wider text-base">
              SPACE INVADERS HALL OF FAME
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Pending Score Submission Form */}
        {pendingScore && !saved && (
          <form onSubmit={handleSave} className="p-4 bg-emerald-950/40 border-b border-emerald-500/40 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-300">NIEUWE TOPSCORE!</span>
              <span className="text-sm font-mono font-black text-yellow-300">{pendingScore.score} PTS (WAVE {pendingScore.wave})</span>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                maxLength={3}
                value={initials}
                onChange={(e) => setInitials(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                placeholder="INITIALEN (3)"
                className="flex-1 px-3 py-2 bg-neutral-900 border border-emerald-500/60 rounded-xl font-mono text-center text-base tracking-widest font-black text-white focus:outline-none focus:border-emerald-400"
                autoFocus
              />
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.5)] transition-all cursor-pointer"
              >
                OPSLAAN
              </button>
            </div>
          </form>
        )}

        {/* High Scores List */}
        <div className="p-4 overflow-y-auto max-h-72 divide-y divide-neutral-800/60 font-mono text-xs">
          <div className="grid grid-cols-12 pb-2 text-[10px] text-neutral-500 uppercase font-bold tracking-wider">
            <span className="col-span-2 text-center">RANG</span>
            <span className="col-span-3 text-center">NAAM</span>
            <span className="col-span-4 text-right">SCORE</span>
            <span className="col-span-3 text-right">WAVE</span>
          </div>

          {scores.map((entry, idx) => {
            const isTop3 = idx < 3;
            return (
              <div
                key={entry.id}
                className={`grid grid-cols-12 py-2 items-center ${
                  idx === 0
                    ? 'text-yellow-400 font-bold bg-yellow-500/10 rounded-lg px-1'
                    : idx === 1
                    ? 'text-neutral-200 px-1'
                    : idx === 2
                    ? 'text-amber-500 px-1'
                    : 'text-neutral-400 px-1'
                }`}
              >
                <div className="col-span-2 text-center flex items-center justify-center gap-1 font-bold">
                  {isTop3 ? (
                    <Medal className={`w-3.5 h-3.5 ${idx === 0 ? 'text-yellow-400' : idx === 1 ? 'text-neutral-300' : 'text-amber-500'}`} />
                  ) : (
                    <span>{idx + 1}</span>
                  )}
                </div>
                <div className="col-span-3 text-center font-black tracking-wider">
                  {entry.initials}
                </div>
                <div className="col-span-4 text-right font-black text-emerald-400">
                  {entry.score.toLocaleString()}
                </div>
                <div className="col-span-3 text-right text-neutral-400">
                  WAVE {entry.wave}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-neutral-800 bg-neutral-900/60 text-center">
          <button
            onClick={onClose}
            className="w-full py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            SLUITEN
          </button>
        </div>

      </div>
    </div>
  );
};
