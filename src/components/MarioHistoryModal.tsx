/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Mario Bros. (1983 Nintendo Arcade) - Historical Dossier & Technical Specs Modal
 */

import React from 'react';
import { X, Trophy, Cpu, History, Award, BookOpen, Sparkles, Volume2, Shield } from 'lucide-react';
import { Language } from '../i18n/lobbyTranslations';
import { getMarioHighScores } from '../game/marioHighScores';

interface MarioHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang?: Language;
}

export const MarioHistoryModal: React.FC<MarioHistoryModalProps> = ({
  isOpen,
  onClose,
  lang = 'nl',
}) => {
  if (!isOpen) return null;

  const scores = getMarioHighScores();
  const top = scores[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col rounded-2xl bg-neutral-950 border-2 border-red-600/80 shadow-[0_0_50px_rgba(239,68,68,0.3)] text-white overflow-hidden">
        {/* Header Marquee */}
        <div className="relative px-6 py-4 border-b border-neutral-800 flex items-center justify-between bg-gradient-to-r from-red-950 via-neutral-900 to-black">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-blue-600 text-white font-mono font-black text-xl flex items-center justify-center shadow-[0_0_15px_rgba(239,68,68,0.6)]">
              🍄
            </div>
            <div>
              <h2 className="font-mono font-black text-lg sm:text-xl tracking-wider text-white flex items-center gap-2">
                <span>MARIO BROS. (1983)</span>
                <span className="text-xs px-2 py-0.5 rounded bg-red-950 border border-red-700 text-red-300 font-bold">
                  NINTENDO ARCADE
                </span>
              </h2>
              <p className="text-xs text-neutral-400 font-mono">
                {lang === 'nl'
                  ? 'De Geboorte van de Loodgieter & Luigi • Shigeru Miyamoto & Gunpei Yokoi'
                  : 'The Birth of the Plumber & Luigi • Shigeru Miyamoto & Gunpei Yokoi'}
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
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-sm text-neutral-300 font-sans leading-relaxed">
          {/* Hero Story */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-red-950/40 via-neutral-900 to-neutral-950 border border-red-700/40">
            <div className="flex items-center gap-2 text-red-400 font-mono font-bold text-xs uppercase tracking-wider mb-2">
              <History className="w-4 h-4" />
              <span>{lang === 'nl' ? 'Historische Mijlpaal: Van Jumpman naar Loodgieter' : 'Historical Milestone: From Jumpman to Plumber'}</span>
            </div>
            <p className="text-neutral-200 text-sm">
              {lang === 'nl'
                ? 'Na het monumentale succes van Donkey Kong (1981) besloten Shigeru Miyamoto en Nintendo-legende Gunpei Yokoi om Mario een eigen universum te geven. Omdat het spel zich afspeelt in een ondergronds labyrint vol gigantische groene afvoerpijpen, werd besloten dat Mario geen timmerman meer was, maar een Italiaans-Amerikaanse loodgieter in New York. Om coöperatief samenspel met 2 spelers mogelijk te maken, werd Mario’s tweelingbroer Luigi geïntroduceerd als tweede speler!'
                : 'Following the monumental breakthrough of Donkey Kong (1981), Shigeru Miyamoto and Nintendo hardware legend Gunpei Yokoi set out to give Mario his own standalone title. Set inside a subterranean labyrinth of green drainage pipes, Mario was recast from a carpenter into a New York plumber. To facilitate simultaneous two-player teamwork, Mario’s twin brother Luigi was born!'}
            </p>
          </div>

          {/* 3 Pillars / Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-neutral-900/90 border border-neutral-800 space-y-1.5">
              <div className="flex items-center gap-2 text-yellow-400 font-mono font-bold text-xs">
                <span>🥊</span>
                <span>{lang === 'nl' ? 'Vloerbeuken & Flippen' : 'Floor Bump Mechanics'}</span>
              </div>
              <p className="text-xs text-neutral-400">
                {lang === 'nl'
                  ? 'Je kunt vijanden niet rechtstreeks bespringen! Je moet van onderen tegen het platform beuken om ze op hun rug te gooien, waarna je ze wegsopt.'
                  : 'Enemies cannot be stomped directly! You must head-butt the floorboards beneath them to flip them helpless, then kick them off.'}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-neutral-900/90 border border-neutral-800 space-y-1.5">
              <div className="flex items-center gap-2 text-cyan-400 font-mono font-bold text-xs">
                <span>💥</span>
                <span>{lang === 'nl' ? 'Het Legendarische POW-Blok' : 'The Iconic POW Block'}</span>
              </div>
              <p className="text-xs text-neutral-400">
                {lang === 'nl'
                  ? 'Een centrale seismische aardschok die alle vijanden op de vloer in één dreun vloert. Drie keer te gebruiken voor het blok bezwijkt.'
                  : 'A central seismic detonator that shakes the entire sewer and flips all grounded foes. Provides exactly three impacts before crumbling.'}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-neutral-900/90 border border-neutral-800 space-y-1.5">
              <div className="flex items-center gap-2 text-red-400 font-mono font-bold text-xs">
                <span>🐢</span>
                <span>{lang === 'nl' ? 'Oer-Vijanden' : 'Original Bestiary'}</span>
              </div>
              <p className="text-xs text-neutral-400">
                {lang === 'nl'
                  ? 'Shellcreepers (voorlopers van Koopa Troopa), Sidesteppers (boze rode krabben die 2 stoten vereisen) en springende Fighter Flies.'
                  : 'Shellcreepers (ancestors of Koopa Troopa), Sidesteppers (angry crabs requiring 2 hits) and parabolic hopping Fighter Flies.'}
              </p>
            </div>
          </div>

          {/* Technical Hardware Specs */}
          <div className="p-4 rounded-xl bg-neutral-900/70 border border-neutral-800 space-y-3">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-neutral-300">
              <Cpu className="w-4 h-4 text-red-400" />
              <span>{lang === 'nl' ? 'Nintendo Coin-Op Arcade Hardware (1983)' : 'Nintendo Coin-Op Arcade Hardware (1983)'}</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
              <div className="p-2.5 rounded-lg bg-neutral-950 border border-neutral-800">
                <span className="text-neutral-500 block text-[10px] uppercase">CPU</span>
                <span className="font-bold text-white">Zilog Z80 @ 4.0 MHz</span>
              </div>
              <div className="p-2.5 rounded-lg bg-neutral-950 border border-neutral-800">
                <span className="text-neutral-500 block text-[10px] uppercase">Resolutie</span>
                <span className="font-bold text-cyan-400">256 x 224 @ 60 FPS</span>
              </div>
              <div className="p-2.5 rounded-lg bg-neutral-950 border border-neutral-800">
                <span className="text-neutral-500 block text-[10px] uppercase">Geluid</span>
                <span className="font-bold text-amber-400">Discrete PSG &amp; DAC</span>
              </div>
              <div className="p-2.5 rounded-lg bg-neutral-950 border border-neutral-800">
                <span className="text-neutral-500 block text-[10px] uppercase">Kast Model</span>
                <span className="font-bold text-red-400">Nintendo Upright</span>
              </div>
            </div>
          </div>

          {/* Current Top Record */}
          <div className="p-4 rounded-xl bg-neutral-900 border border-yellow-500/40 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Trophy className="w-6 h-6 text-yellow-400" />
              <div>
                <span className="text-xs font-mono text-neutral-400 uppercase tracking-wide">
                  {lang === 'nl' ? 'Huidig Speelhal Record' : 'Current Arcade Record'}
                </span>
                <div className="text-lg font-mono font-black text-yellow-400">
                  {top ? `${top.score.toLocaleString()} PTS (${top.initials} • Phase ${top.phase})` : '48,900 PTS (MAR)'}
                </div>
              </div>
            </div>
            <span className="text-xs font-mono px-2.5 py-1 rounded bg-yellow-500/10 text-yellow-300 border border-yellow-500/30">
              FREE PLAY
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-neutral-800 bg-neutral-900/80 flex items-center justify-between">
          <span className="text-xs font-mono text-neutral-400">
            Nintendo Arcade 1983 • Emulated in 60 FPS HTML5 Canvas
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-mono font-bold text-xs transition-colors cursor-pointer shadow-md"
          >
            {lang === 'nl' ? 'Sluiten & Spelen' : 'Close & Play'}
          </button>
        </div>
      </div>
    </div>
  );
};
