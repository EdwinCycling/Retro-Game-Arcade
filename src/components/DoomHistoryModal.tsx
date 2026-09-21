/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * DOOM (1993 id Software) - Historical Dossier & Technical Specs Modal
 */

import React from 'react';
import { X, Trophy, Cpu, History, Award, BookOpen, Sparkles, Volume2, Flame, Play, Key } from 'lucide-react';
import { Language } from '../i18n/lobbyTranslations';
import { getDoomScores } from '../game/doomHighScores';
import { doomAudio } from '../game/doomAudio';

interface DoomHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlay: () => void;
  lang?: Language;
}

export const DoomHistoryModal: React.FC<DoomHistoryModalProps> = ({
  isOpen,
  onClose,
  onPlay,
  lang = 'nl',
}) => {
  if (!isOpen) return null;

  const scores = getDoomScores();
  const top = scores[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col rounded-2xl bg-neutral-950 border-2 border-red-600/80 shadow-[0_0_50px_rgba(220,38,38,0.4)] text-white overflow-hidden">
        {/* Header Marquee */}
        <div className="relative px-6 py-4 border-b border-neutral-800 flex items-center justify-between bg-gradient-to-r from-red-950 via-neutral-900 to-black">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 to-amber-700 text-white font-mono font-black text-xl flex items-center justify-center shadow-[0_0_15px_rgba(220,38,38,0.6)]">
              💀
            </div>
            <div>
              <h2 className="font-mono font-black text-lg sm:text-xl tracking-wider text-white flex items-center gap-2">
                <span>DOOM (1993)</span>
                <span className="text-xs px-2 py-0.5 rounded bg-red-950 border border-red-700 text-red-300 font-bold">
                  id SOFTWARE
                </span>
              </h2>
              <p className="text-xs text-neutral-400 font-mono">
                {lang === 'nl'
                  ? 'Knee-Deep in the Dead • John Carmack, John Romero & Adrian Carmack'
                  : 'Knee-Deep in the Dead • John Carmack, John Romero & Adrian Carmack'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors cursor-pointer"
            aria-label="Sluiten"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scroll Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-sm text-neutral-300 leading-relaxed font-sans">
          {/* Top Marine Record */}
          {top && (
            <div className="p-4 rounded-xl bg-red-950/40 border border-red-800/60 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Trophy className="w-6 h-6 text-amber-400" />
                <div>
                  <div className="text-xs font-mono text-neutral-400">HIGHEST UAC RECORD</div>
                  <div className="font-mono font-bold text-amber-300 text-base">
                    {top.name} — {top.score.toLocaleString()} PUNTEN ({top.level})
                  </div>
                </div>
              </div>
              <div className="text-right text-xs font-mono text-red-400">
                <div>KILLS: {top.killsPercent}%</div>
                <div className="text-neutral-400">TIJD: {top.timeSeconds}s</div>
              </div>
            </div>
          )}

          {/* Description */}
          <div>
            <h3 className="font-mono font-bold text-base text-red-400 flex items-center gap-2 mb-2">
              <History className="w-4 h-4 text-red-500" />
              <span>HET ONSTAAN VAN EEN REVOLUTIE</span>
            </h3>
            <p className="text-xs sm:text-sm text-neutral-300 mb-2">
              Op 10 december 1993 bracht id Software DOOM uit als shareware. Binnen enkele uren raakten
              universiteitsnetwerken overbelast door tienduizenden downloads. DOOM introduceerde niet alleen
              revolutionaire 3D Binary Space Partitioning graphics met variabele plafondhoogtes en sfeervolle
              schaduwen, maar creëerde ook de moderne term <em>Deathmatch</em> en inspireerde een hele generatie
              gameontwikkelaars.
            </p>
            <p className="text-xs sm:text-sm text-neutral-300">
              In onze arcadekast speel je de originele ervaring van Episode 1 met Three.js WebGL graphics,
              authentieke gepompte shotgun-mechanica, geanimeerd Doomguy-gezicht en de onsterfelijke metal soundtrack
              "At Doom's Gate".
            </p>
          </div>

          {/* Technical Specs */}
          <div>
            <h3 className="font-mono font-bold text-base text-amber-400 flex items-center gap-2 mb-3">
              <Cpu className="w-4 h-4 text-amber-500" />
              <span>TECHNISCHE SPECIFICATIES (1993)</span>
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
              <div className="p-3 rounded-lg bg-neutral-900 border border-neutral-800">
                <div className="text-neutral-500 text-[10px]">RESOLUTIE</div>
                <div className="text-white font-bold mt-1">320 x 200 VGA Mode 13h</div>
              </div>
              <div className="p-3 rounded-lg bg-neutral-900 border border-neutral-800">
                <div className="text-neutral-500 text-[10px]">FRAMERATE</div>
                <div className="text-white font-bold mt-1">35 FPS Hardware Tick</div>
              </div>
              <div className="p-3 rounded-lg bg-neutral-900 border border-neutral-800">
                <div className="text-neutral-500 text-[10px]">GELUIDSCHIP</div>
                <div className="text-white font-bold mt-1">General MIDI / SB16</div>
              </div>
              <div className="p-3 rounded-lg bg-neutral-900 border border-neutral-800">
                <div className="text-neutral-500 text-[10px]">GEHEUGEN</div>
                <div className="text-white font-bold mt-1">4 MB RAM (DOS 5.0)</div>
              </div>
            </div>
          </div>

          {/* Cheats reminder */}
          <div className="p-3.5 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-between">
            <div className="flex items-center gap-2 font-mono text-xs text-neutral-300">
              <Key className="w-4 h-4 text-amber-400" />
              <span>DOS CHEATCODES BESCHIKBAAR: <strong className="text-red-400">IDDQD</strong> (God Mode) & <strong className="text-amber-400">IDKFA</strong> (Wapens & Sleutels)</span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-neutral-800 bg-neutral-950 flex items-center justify-between">
          <button
            onClick={() => doomAudio.playShotgun()}
            className="px-3.5 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer"
          >
            <Volume2 className="w-4 h-4 text-red-400" />
            <span>SHOTGUN TEST</span>
          </button>

          <button
            onClick={() => {
              onClose();
              onPlay();
            }}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-red-600 via-amber-600 to-red-600 hover:brightness-125 text-white font-mono font-black text-sm flex items-center gap-2 shadow-[0_0_20px_rgba(220,38,38,0.6)] cursor-pointer active:scale-95"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>START DOOM SPEELKAST</span>
          </button>
        </div>
      </div>
    </div>
  );
};
