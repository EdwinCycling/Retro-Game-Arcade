/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Duke Nukem 3D (1996 3D Realms) - Historical Dossier & Technical Specs Modal
 */

import React from 'react';
import { X, Trophy, Cpu, History, Award, BookOpen, Sparkles, Volume2, Flame, Play, Key } from 'lucide-react';
import { Language } from '../i18n/lobbyTranslations';
import { getDukeScores } from '../game/dukeHighScores';
import { dukeAudio } from '../game/dukeAudio';

interface DukeHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlay: () => void;
  lang?: Language;
}

export const DukeHistoryModal: React.FC<DukeHistoryModalProps> = ({
  isOpen,
  onClose,
  onPlay,
  lang = 'nl',
}) => {
  if (!isOpen) return null;

  const scores = getDukeScores();
  const top = scores[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col rounded-2xl bg-neutral-950 border-2 border-amber-500/80 shadow-[0_0_50px_rgba(245,158,11,0.4)] text-white overflow-hidden">
        {/* Header Marquee */}
        <div className="relative px-6 py-4 border-b border-neutral-800 flex items-center justify-between bg-gradient-to-r from-amber-950 via-neutral-900 to-black">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-600 text-black font-mono font-black text-xl flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.6)]">
              ☢️
            </div>
            <div>
              <h2 className="font-mono font-black text-lg sm:text-xl tracking-wider text-white flex items-center gap-2">
                <span>DUKE NUKEM 3D (1996)</span>
                <span className="text-xs px-2 py-0.5 rounded bg-amber-950 border border-amber-700 text-amber-300 font-bold">
                  3D REALMS
                </span>
              </h2>
              <p className="text-xs text-neutral-400 font-mono">
                {lang === 'nl'
                  ? 'L.A. Meltdown • Ken Silverman Build Engine • Jon St. John'
                  : 'L.A. Meltdown • Ken Silverman Build Engine • Jon St. John'}
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

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm">
          {/* Top Score Banner */}
          {top && (
            <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-500/40 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Trophy className="w-6 h-6 text-amber-400 shrink-0 animate-pulse" />
                <div>
                  <div className="text-xs text-amber-300/80 font-mono uppercase">
                    {lang === 'nl' ? 'Lokaal Halrecord' : 'Arcade Hall High Score'}
                  </div>
                  <div className="font-mono font-black text-lg text-white">
                    {top.name} — {top.score.toLocaleString()} PTS ({top.killsPercent}% Kills, {top.timeSeconds}s)
                  </div>
                </div>
              </div>
              <span className="text-xs font-mono text-neutral-400">{top.date}</span>
            </div>
          )}

          {/* Historical Lore */}
          <div className="space-y-2">
            <h3 className="text-base font-bold text-amber-400 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-amber-400" />
              <span>{lang === 'nl' ? 'De Build Engine & Interactieve Wereld' : 'The Build Engine & Interactive World'}</span>
            </h3>
            <p className="text-neutral-300 leading-relaxed font-sans">
              {lang === 'nl'
                ? 'Uitgebracht in januari 1996 door 3D Realms, zette Duke Nukem 3D een ongekende standaard voor interactieve werelden. Ontwikkeld door Ken Silverman op zijn baanbrekende Build engine, bevatte het spel kamers boven kamers via portal-trucs, spiegels, krimpstralen (Shrink Ray), jetpacks, en over-the-top Hollywood quotes ingesproken door Jon St. John: "Hail to the king, baby!".'
                : 'Released in January 1996 by 3D Realms, Duke Nukem 3D set an unprecedented standard for interactive 3D game worlds. Developed by Ken Silverman on the revolutionary Build engine, it featured breakable glass, operable toilets, light switches, jetpacks, pipebombs, and the iconic voice of Jon St. John delivering legendary action one-liners.'}
            </p>
          </div>

          {/* Tech Specs Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
            <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800">
              <div className="text-neutral-500 text-[10px] uppercase">Engine</div>
              <div className="text-amber-400 font-bold mt-1">Ken Silverman Build</div>
            </div>
            <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800">
              <div className="text-neutral-500 text-[10px] uppercase">Resolutie</div>
              <div className="text-white font-bold mt-1">640×480 High-Res</div>
            </div>
            <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800">
              <div className="text-neutral-500 text-[10px] uppercase">Audio</div>
              <div className="text-emerald-400 font-bold mt-1">Sound Blaster AWE32</div>
            </div>
            <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800">
              <div className="text-neutral-500 text-[10px] uppercase">Release</div>
              <div className="text-yellow-400 font-bold mt-1">29 Jan 1996</div>
            </div>
          </div>

          {/* Weapons & Power-ups */}
          <div className="space-y-2">
            <h4 className="text-xs font-mono font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-orange-400" />
              <span>{lang === 'nl' ? 'Arsenaal & Iconische Wapens' : 'Arsenal & Iconic Weapons'}</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
              <div className="p-2.5 rounded-lg bg-neutral-900/80 border border-neutral-800 text-neutral-300">
                <span className="text-yellow-400 font-bold">👢 Mighty Boot &amp; Shotgun:</span> Nabijgevecht en heavy spread shotgun voor varkenspolitie (Pig Cops).
              </div>
              <div className="p-2.5 rounded-lg bg-neutral-900/80 border border-neutral-800 text-neutral-300">
                <span className="text-amber-400 font-bold">💣 Pipebomb &amp; RPG:</span> Afstandsbommen met detonator en raketwerper voor grote hordes aliens.
              </div>
              <div className="p-2.5 rounded-lg bg-neutral-900/80 border border-neutral-800 text-neutral-300">
                <span className="text-cyan-400 font-bold">🔬 Shrinker &amp; Devastator:</span> Krimp vijanden tot insectformaat en verpletter ze met je laars!
              </div>
              <div className="p-2.5 rounded-lg bg-neutral-900/80 border border-neutral-800 text-neutral-300">
                <span className="text-emerald-400 font-bold">🎒 Jetpack &amp; Steroids:</span> Vlieg verticaal door L.A. skyscrapers en ren met supersnelheid.
              </div>
            </div>
          </div>

          {/* Cheats / Pro Tips */}
          <div className="p-3.5 rounded-xl bg-neutral-900/90 border border-neutral-800 text-xs font-mono space-y-1">
            <div className="text-amber-400 font-bold flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5" />
              <span>{lang === 'nl' ? 'Klassieke DOS Cheats (Probeer tijdens het spelen):' : 'Classic DOS Cheats:'}</span>
            </div>
            <div className="text-neutral-300 flex flex-wrap gap-4 text-[11px] pt-1">
              <span><strong className="text-yellow-400">DNCORNHOLIO</strong>: God Mode</span>
              <span><strong className="text-cyan-400">DNKROZ</strong>: God Mode</span>
              <span><strong className="text-emerald-400">DNSTUFF</strong>: All Weapons &amp; Keys</span>
              <span><strong className="text-purple-400">DNITEMS</strong>: All Inventory Items</span>
              <span><strong className="text-red-400">DNCLIP</strong>: Walk Through Walls</span>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-4 border-t border-neutral-800 bg-black flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              dukeAudio.playDukeQuote('hail');
            }}
            className="px-3.5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-amber-300 text-xs font-mono font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <Volume2 className="w-4 h-4" />
            <span>&quot;Hail to the King!&quot;</span>
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 text-xs font-mono font-bold border border-neutral-700 cursor-pointer"
            >
              {lang === 'nl' ? 'Sluiten' : 'Close'}
            </button>
            <button
              type="button"
              onClick={() => {
                onClose();
                onPlay();
              }}
              className="px-6 py-2 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-yellow-400 text-black text-xs font-mono font-black tracking-wider shadow-[0_0_20px_rgba(245,158,11,0.6)] cursor-pointer flex items-center gap-2 active:scale-95 transition-all"
            >
              <Play className="w-4 h-4 fill-black" />
              <span>{lang === 'nl' ? 'SPEEL DUKE NUKEM 3D' : 'PLAY DUKE NUKEM 3D'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
