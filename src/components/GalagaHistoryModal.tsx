/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X, Play, Cpu, Sparkles, Trophy, Gamepad2, ShieldAlert } from 'lucide-react';
import { Language } from '../i18n/lobbyTranslations';

interface GalagaHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlayGame: () => void;
  lang: Language;
}

export const GalagaHistoryModal: React.FC<GalagaHistoryModalProps> = ({
  isOpen,
  onClose,
  onPlayGame,
  lang,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-slate-900 border-2 border-red-500/50 rounded-2xl shadow-[0_0_50px_rgba(239,68,68,0.4)] text-white p-5 sm:p-8">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-800 hover:bg-red-900/80 text-slate-400 hover:text-white border border-slate-700 transition-all active:scale-95"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-start gap-4 mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-600 to-blue-700 flex items-center justify-center text-3xl shadow-lg border border-red-400/40">
            🚀
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 text-xs font-bold bg-red-500/20 text-red-400 border border-red-500/30 rounded">
                NAMCO 1981
              </span>
              <span className="px-2 py-0.5 text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded">
                ARCADE COIN-OP
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-amber-300 to-blue-400 mt-1">
              GALAGA
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 font-medium">
              {lang === 'nl'
                ? 'Shigeru Yokoyama & Nobuyuki Ohnogi • De Koning van de Vaste Ruimte-Shooters'
                : 'Shigeru Yokoyama & Nobuyuki Ohnogi • The Pinnacle of Fixed Space Shooters'}
            </p>
          </div>
        </div>

        {/* Content Tabs / Body */}
        <div className="space-y-6 text-xs sm:text-sm leading-relaxed text-slate-300">
          
          {/* Historical Impact */}
          <div className="bg-slate-950/60 p-4 rounded-xl border border-red-500/20">
            <h3 className="text-base font-bold text-red-400 flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              {lang === 'nl' ? 'Historische Achtergrond & Revolutie' : 'Historical Background & Revolution'}
            </h3>
            <p>
              {lang === 'nl'
                ? 'In september 1981 bracht Namco "Galaga" uit als het directe vervolg op hun baanbrekende hit Galaxian (1979). Waar eerdere shooters zoals Space Invaders statische rijen aliens gebruikten, introduceerde Galaga sierlijke, vloeiende duikvluchten, dynamische vliegroutes in formaties en een adembenemend snelle gameplay op 60 FPS.'
                : 'In September 1981, Namco unleashed "Galaga" as the sequel to their landmark 1979 hit Galaxian. While earlier shooters like Space Invaders relied on rigid marching formations, Galaga pioneered graceful looping dive-bombs, swooping multi-stage entry patterns, and blazing-fast 60 FPS arcade action.'}
            </p>
          </div>

          {/* The Tractor Beam & Dual Fighter */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-950/60 p-4 rounded-xl border border-blue-500/20">
              <h3 className="text-sm font-bold text-blue-400 flex items-center gap-2 mb-2">
                <ShieldAlert className="w-4 h-4 text-blue-400" />
                {lang === 'nl' ? 'De Tractor Beam & Dual Fighter' : 'The Tractor Beam & Dual Fighter'}
              </h3>
              <p>
                {lang === 'nl'
                  ? 'Een van de meest geniale mechanics in de videogamegeschiedenis: de Boss Galaga kan met zijn blauwe tractor beam je schip ontvoeren. Als je in je volgende leven de ontvoerende Boss Galaga neerschiet terwijl deze in duikvlucht is, bevrijd je jouw schip en koppel je aan tot een oppermachtige DUAL FIGHTER met dubbele vuurkracht!'
                  : 'One of the most celebrated risk-reward mechanics in gaming: Boss Galagas can cast a pulsating blue tractor beam to capture your ship. If you destroy that diving Boss Galaga with your subsequent life, your captive ship links side-by-side to form the formidable DUAL FIGHTER with twin plasma cannons!'}
              </p>
            </div>

            <div className="bg-slate-950/60 p-4 rounded-xl border border-amber-500/20">
              <h3 className="text-sm font-bold text-amber-400 flex items-center gap-2 mb-2">
                <Trophy className="w-4 h-4 text-amber-400" />
                {lang === 'nl' ? 'Challenging Stages & Perfect Bonus' : 'Challenging Stages & Perfect Bonus'}
              </h3>
              <p>
                {lang === 'nl'
                  ? 'Elke drie levels (Stage 3, 7, 11, etc.) start een "Challenging Stage". 40 aliens vliegen in 5 acrobatische formaties over het scherm zonder kogels af te vuren. Schiet je alle 40 aliens neer? Dan word je beloond met een "PERFECT 10.000 PTS" bonus!'
                  : 'Every three stages (Stages 3, 7, 11, etc.), players enter a "Challenging Stage". 40 enemies swoop across the screen in 5 acrobatic flight patterns without shooting. Destroying all 40 awards the prestigious "PERFECT 10,000 PTS" bonus!'}
              </p>
            </div>
          </div>

          {/* Hardware Specs */}
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2 mb-3">
              <Cpu className="w-4 h-4 text-red-400" />
              {lang === 'nl' ? 'Arcade Hardware Specificaties' : 'Arcade Hardware Specifications'}
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                <div className="text-[10px] text-slate-400 uppercase">{lang === 'nl' ? 'Processor' : 'CPU'}</div>
                <div className="font-bold text-red-400 text-xs mt-0.5">3× Zilog Z80 (3.125 MHz)</div>
              </div>
              <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                <div className="text-[10px] text-slate-400 uppercase">{lang === 'nl' ? 'Resolutie' : 'Resolution'}</div>
                <div className="font-bold text-amber-300 text-xs mt-0.5">224×288 Vertical CRT</div>
              </div>
              <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                <div className="text-[10px] text-slate-400 uppercase">{lang === 'nl' ? 'Audio Chip' : 'Sound'}</div>
                <div className="font-bold text-blue-400 text-xs mt-0.5">Namco 3-Ch Custom WSG</div>
              </div>
              <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                <div className="text-[10px] text-slate-400 uppercase">{lang === 'nl' ? 'Beeldfrequentie' : 'Frame Rate'}</div>
                <div className="font-bold text-emerald-400 text-xs mt-0.5">60.60 FPS Arcade Loop</div>
              </div>
            </div>
          </div>

          {/* Controls Overview */}
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2 mb-2">
              <Gamepad2 className="w-4 h-4 text-red-400" />
              {lang === 'nl' ? 'Besturing & Controller Schema' : 'Controls & Controller Mappings'}
            </h3>
            <ul className="list-disc list-inside space-y-1 text-slate-400 text-[11px] sm:text-xs">
              <li><strong className="text-white">Toetsenbord:</strong> Pijltje Links / Rechts of A / D om te sturen, Spatiebalk om te schieten.</li>
              <li><strong className="text-white">Muis / Touchscreen:</strong> Sleep je vinger of muis over het scherm om te vliegen, tik om lasers af te vuren.</li>
              <li><strong className="text-white">Xbox / PlayStation Controller:</strong> Linker Analoge Stick of D-Pad om te bewegen, Knop A / RT / X om te schieten.</li>
            </ul>
          </div>

        </div>

        {/* Action Buttons */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs sm:text-sm transition-all active:scale-95"
          >
            {lang === 'nl' ? 'Sluiten' : 'Close'}
          </button>
          <button
            onClick={onPlayGame}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-red-600 to-blue-600 hover:from-red-500 hover:to-blue-500 text-white font-black text-xs sm:text-sm shadow-lg shadow-red-600/30 transition-all active:scale-95"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>{lang === 'nl' ? 'Speel Galaga Nu' : 'Play Galaga Now'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
