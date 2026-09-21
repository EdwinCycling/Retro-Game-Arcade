/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X, Trophy, Cpu, History, Award, BookOpen, Tv, Sparkles, Volume2 } from 'lucide-react';
import { Language } from '../i18n/lobbyTranslations';

interface PongHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang?: Language;
}

export const PongHistoryModal: React.FC<PongHistoryModalProps> = ({
  isOpen,
  onClose,
  lang = 'nl',
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col rounded-2xl bg-neutral-950 border-2 border-neutral-800 shadow-[0_0_50px_rgba(255,255,255,0.15)] text-white overflow-hidden">
        {/* Header Marquee */}
        <div className="relative px-6 py-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-900/90">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white text-black font-mono font-black text-xl flex items-center justify-center shadow-[0_0_15px_rgba(255,255,255,0.5)]">
              🏓
            </div>
            <div>
              <h2 className="font-mono font-black text-lg sm:text-xl tracking-wider text-white flex items-center gap-2">
                <span>PONG (1972)</span>
                <span className="text-xs px-2 py-0.5 rounded bg-neutral-800 border border-neutral-700 text-neutral-300">
                  ATARI
                </span>
              </h2>
              <p className="text-xs text-neutral-400 font-mono">
                {lang === 'nl'
                  ? 'De Oerknal van de Video Game Industrie • Nolan Bushnell & Allan Alcorn'
                  : 'The Big Bang of the Video Game Industry • Nolan Bushnell & Allan Alcorn'}
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
          {/* Hero Story: Andy Capp's Tavern */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-neutral-900 via-neutral-900/80 to-neutral-950 border border-neutral-800">
            <div className="flex items-center gap-2 text-white font-mono font-bold text-xs uppercase tracking-wider mb-2">
              <Sparkles className="w-4 h-4 text-yellow-400" />
              <span>{lang === 'nl' ? 'De Legende van Andy Capp’s Tavern' : 'The Legend of Andy Capp’s Tavern'}</span>
            </div>
            <p className="text-neutral-300 text-xs sm:text-sm">
              {lang === 'nl' ? (
                <>
                  In september 1972 installeerde Atari hun allereerste prototype PONG-automaat in een lokale kroeg in Sunnyvale, Californië: <strong>Andy Capp’s Tavern</strong>. 
                  Twee weken later belde de bareigenaar boos op dat de kast stuk was. Toen ingenieur Allan Alcorn de achterkant openmaakte, bleek er technisch niets mis te zijn: 
                  het melkpak dat diende als muntbakje zat <em>zó stampvol kwartjes</em> (quarters) dat de muntsleuf klem zat door het geld! PONG was een onmiddellijke sensatie.
                </>
              ) : (
                <>
                  In September 1972, Atari placed their very first PONG prototype in a local Sunnyvale, California pub: <strong>Andy Capp’s Tavern</strong>. 
                  Two weeks later, the bar owner called complaining the machine had broken down. When engineer Allan Alcorn opened the cabinet, there was no electrical failure: 
                  the improvised milk-carton coin tray was <em>so overflowing with 25-cent quarters</em> that the coin slot jammed! PONG was an overnight phenomenon.
                </>
              )}
            </p>
          </div>

          {/* Technical Marvel: No CPU or Memory */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-2">
              <div className="flex items-center gap-2 font-mono font-bold text-xs text-cyan-400 uppercase">
                <Cpu className="w-4 h-4" />
                <span>{lang === 'nl' ? 'Geen CPU, Geen RAM' : 'No CPU, No RAM'}</span>
              </div>
              <p className="text-xs text-neutral-400">
                {lang === 'nl'
                  ? 'PONG bevatte geen microprocessor of softwarecode! Allan Alcorn bouwde het hele spel met 66 discrete TTL-logische chips (Transistor-Transistor Logic). De bal, batjes en scores werden puur door elektronische synchronisatiesignalen getekend op een omgebouwde zwart-wit Hitachi televisie.'
                  : 'PONG had no microprocessor or software program! Allan Alcorn wired the entire game using 66 discrete TTL logic chips. The ball, paddles, and score counters were generated entirely via electronic timing circuits directly scanning onto a modified black-and-white Hitachi TV.'}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-2">
              <div className="flex items-center gap-2 font-mono font-bold text-xs text-amber-400 uppercase">
                <Volume2 className="w-4 h-4" />
                <span>{lang === 'nl' ? 'Het Legendarische Geluid' : 'The Legendary Audio'}</span>
              </div>
              <p className="text-xs text-neutral-400">
                {lang === 'nl'
                  ? 'Toen Nolan Bushnell vroeg om publieksgejuich bij een punt, had Alcorn geen ruimte meer op de printplaat. Hij tapte simpelweg verschillende frequenties af van de interne synctimer: 459Hz voor het batje, 226Hz voor de muur en 113Hz voor het puntverlies. Het iconische "plop-plop" geluid was geboren.'
                  : 'When Nolan Bushnell requested cheering crowds on scoring, Alcorn had zero circuit board space left. He cleverly tapped existing clock divide frequencies from the sync generator: 459Hz for paddles, 226Hz for walls, and 113Hz for misses. The unforgettable "plop-plop" sound was born.'}
              </p>
            </div>
          </div>

          {/* Key Facts Timeline */}
          <div className="space-y-3">
            <h3 className="font-mono font-bold text-xs uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
              <History className="w-4 h-4 text-emerald-400" />
              <span>{lang === 'nl' ? 'Historische Mijlpalen' : 'Historical Milestones'}</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
              <div className="p-3 rounded-lg bg-neutral-900 border border-neutral-800">
                <div className="text-emerald-400 font-bold">1972</div>
                <div className="text-neutral-400 mt-1">{lang === 'nl' ? 'Atari opgericht door Nolan Bushnell & Ted Dabney' : 'Atari founded by Nolan Bushnell & Ted Dabney'}</div>
              </div>
              <div className="p-3 rounded-lg bg-neutral-900 border border-neutral-800">
                <div className="text-cyan-400 font-bold">8.000+</div>
                <div className="text-neutral-400 mt-1">{lang === 'nl' ? 'Arcadekasten verkocht in het eerste jaar' : 'Arcade cabinets sold in the first year alone'}</div>
              </div>
              <div className="p-3 rounded-lg bg-neutral-900 border border-neutral-800">
                <div className="text-yellow-400 font-bold">1975</div>
                <div className="text-neutral-400 mt-1">{lang === 'nl' ? 'Home PONG console via Sears (150.000 stuks)' : 'Home PONG console launched with Sears (150k units)'}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-800 bg-neutral-900/80 flex items-center justify-between">
          <span className="text-xs font-mono text-neutral-400">
            {lang === 'nl' ? 'Authentieke 1972 Recreatie' : 'Authentic 1972 Recreation'}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-white text-black font-mono font-bold text-xs hover:bg-neutral-200 transition-all cursor-pointer"
          >
            {lang === 'nl' ? 'Sluiten & Spelen' : 'Close & Play'}
          </button>
        </div>
      </div>
    </div>
  );
};
