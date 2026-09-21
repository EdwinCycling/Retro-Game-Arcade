import React, { useEffect, useState } from 'react';
import { retroAudio } from '../game/audio';
import { Difficulty } from '../types';
import { ChevronUp, ChevronDown, Check, Trophy } from 'lucide-react';

interface HighScoreEntryModalProps {
  isOpen: boolean;
  score: number;
  level: number;
  difficulty: Difficulty;
  rank: number;
  onSave: (initials: string) => void;
  onCancel: () => void;
}

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_'.split('');

export const HighScoreEntryModal: React.FC<HighScoreEntryModalProps> = ({
  isOpen,
  score,
  level,
  difficulty,
  rank,
  onSave,
  onCancel
}) => {
  const [initials, setInitials] = useState<string[]>(['A', 'A', 'A']);
  const [activeSlot, setActiveSlot] = useState<number>(0);

  useEffect(() => {
    if (isOpen) {
      setInitials(['A', 'A', 'A']);
      setActiveSlot(0);
      retroAudio.playHighScoreFanfare();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent default scrolling for arrows and space
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }

      if (e.key === 'ArrowUp') {
        cycleLetter(activeSlot, 1);
      } else if (e.key === 'ArrowDown') {
        cycleLetter(activeSlot, -1);
      } else if (e.key === 'ArrowLeft') {
        setActiveSlot((prev) => Math.max(0, prev - 1));
        retroAudio.playKeyBlip();
      } else if (e.key === 'ArrowRight') {
        setActiveSlot((prev) => Math.min(2, prev + 1));
        retroAudio.playKeyBlip();
      } else if (e.key === 'Backspace') {
        setInitials((prev) => {
          const next = [...prev];
          next[activeSlot] = 'A';
          return next;
        });
        setActiveSlot((prev) => Math.max(0, prev - 1));
        retroAudio.playKeyBlip();
      } else if (e.key === 'Enter') {
        handleConfirm();
      } else if (/^[a-zA-Z0-9]$/.test(e.key)) {
        const char = e.key.toUpperCase();
        setInitials((prev) => {
          const next = [...prev];
          next[activeSlot] = char;
          return next;
        });
        retroAudio.playKeyBlip();
        if (activeSlot < 2) {
          setActiveSlot((prev) => prev + 1);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, activeSlot, initials]);

  if (!isOpen) return null;

  const cycleLetter = (slotIndex: number, delta: number) => {
    setInitials((prev) => {
      const next = [...prev];
      const curChar = next[slotIndex];
      const curIdx = CHARS.indexOf(curChar);
      const nextIdx = (curIdx + delta + CHARS.length) % CHARS.length;
      next[slotIndex] = CHARS[nextIdx];
      return next;
    });
    retroAudio.playKeyBlip();
  };

  const handleConfirm = () => {
    const finalStr = initials.join('');
    onSave(finalStr || 'AAA');
  };

  const getRankSuffix = (r: number) => {
    if (r === 1) return '1ST';
    if (r === 2) return '2ND';
    if (r === 3) return '3RD';
    return `${r}TH`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-xs p-4 select-none">
      <div className="bg-black border-2 border-yellow-400 rounded-2xl max-w-md w-full p-6 text-white shadow-[0_0_50px_rgba(250,204,21,0.3)] space-y-6 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header Marquee */}
        <div className="text-center space-y-2 border-b border-gray-900 pb-4">
          <div className="flex items-center justify-center gap-2 text-yellow-400">
            <Trophy className="w-5 h-5 animate-bounce" />
            <span className="text-pink-500 text-xs font-bold tracking-widest uppercase">
              HALL OF FAME QUALIFIER
            </span>
            <Trophy className="w-5 h-5 animate-bounce" />
          </div>
          <h2 className="text-yellow-400 font-bold tracking-widest font-['Press_Start_2P'] text-sm sm:text-base leading-relaxed">
            GEWELDIGE SCORE!
          </h2>
          <p className="text-xs text-neutral-300">
            Je hebt de top 10 arcade ranglijst bereikt!
          </p>
        </div>

        {/* Score & Rank Stats Card */}
        <div className="flex items-center justify-around bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-center">
          <div>
            <span className="text-[10px] text-neutral-400 block uppercase tracking-wider font-semibold">
              RANG
            </span>
            <span className="text-lg font-bold text-yellow-400 font-['Press_Start_2P']">
              {getRankSuffix(rank)}
            </span>
          </div>
          <div className="h-8 w-px bg-neutral-800" />
          <div>
            <span className="text-[10px] text-neutral-400 block uppercase tracking-wider font-semibold">
              SCORE
            </span>
            <span className="text-lg font-bold text-white font-mono">
              {score.toLocaleString()}
            </span>
          </div>
          <div className="h-8 w-px bg-neutral-800" />
          <div>
            <span className="text-[10px] text-neutral-400 block uppercase tracking-wider font-semibold">
              MODUS / LVL
            </span>
            <span className="text-xs font-bold text-cyan-400 block uppercase">
              {difficulty} • LVL {level}
            </span>
          </div>
        </div>

        {/* Initials Input Wheel */}
        <div className="space-y-3 text-center">
          <label className="text-xs font-bold text-pink-500 uppercase tracking-widest block">
            VOER JE INITIALEN IN (3 LETTERS)
          </label>
          <p className="text-[11px] text-neutral-400">
            Gebruik je toetsenbord of de pijltjes om je letters te kiezen:
          </p>

          <div className="flex items-center justify-center gap-4 py-2">
            {[0, 1, 2].map((slot) => {
              const isSelected = activeSlot === slot;
              return (
                <div key={slot} className="flex flex-col items-center gap-1.5">
                  {/* Up button */}
                  <button
                    type="button"
                    onClick={() => {
                      setActiveSlot(slot);
                      cycleLetter(slot, 1);
                    }}
                    className="p-1 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-yellow-400 active:scale-90 transition-transform border border-neutral-800"
                    aria-label={`Volgende letter slot ${slot + 1}`}
                  >
                    <ChevronUp className="w-5 h-5" />
                  </button>

                  {/* Character box */}
                  <button
                    type="button"
                    onClick={() => {
                      setActiveSlot(slot);
                      retroAudio.playKeyBlip();
                    }}
                    className={`w-14 h-18 sm:w-16 sm:h-20 flex items-center justify-center rounded-xl text-3xl font-bold font-['Press_Start_2P'] transition-all border-2 ${
                      isSelected
                        ? 'border-yellow-400 bg-yellow-400/20 text-yellow-300 shadow-[0_0_20px_rgba(250,204,21,0.5)] scale-105 animate-pulse'
                        : 'border-neutral-800 bg-neutral-950 text-neutral-200 hover:border-neutral-700'
                    }`}
                  >
                    {initials[slot]}
                  </button>

                  {/* Down button */}
                  <button
                    type="button"
                    onClick={() => {
                      setActiveSlot(slot);
                      cycleLetter(slot, -1);
                    }}
                    className="p-1 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-yellow-400 active:scale-90 transition-transform border border-neutral-800"
                    aria-label={`Vorige letter slot ${slot + 1}`}
                  >
                    <ChevronDown className="w-5 h-5" />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Quick slot position indicators */}
          <div className="flex justify-center gap-6 text-[10px] text-neutral-500 font-mono font-bold">
            <span className={activeSlot === 0 ? 'text-yellow-400' : ''}>[ 1 ]</span>
            <span className={activeSlot === 1 ? 'text-yellow-400' : ''}>[ 2 ]</span>
            <span className={activeSlot === 2 ? 'text-yellow-400' : ''}>[ 3 ]</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between gap-3 pt-3 border-t border-gray-900">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 rounded-lg text-xs font-medium text-neutral-400 hover:text-white hover:bg-neutral-900 transition-colors"
          >
            Overslaan
          </button>
          
          <button
            type="button"
            onClick={handleConfirm}
            className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-xs font-black uppercase tracking-wider bg-yellow-400 text-black hover:bg-yellow-300 shadow-[0_0_20px_rgba(250,204,21,0.5)] transition-transform active:scale-95 cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>BEVESTIG & OPSLAAN</span>
          </button>
        </div>
      </div>
    </div>
  );
};
