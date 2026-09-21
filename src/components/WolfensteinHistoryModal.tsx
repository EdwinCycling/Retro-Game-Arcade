/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Wolfenstein 3D (1992 id Software) - Historical Dossier & Technical Specs Modal
 */

import React from 'react';
import { X, Trophy, Cpu, History, Award, BookOpen, Sparkles, Volume2, Shield } from 'lucide-react';
import { Language } from '../i18n/lobbyTranslations';
import { getWolfScores } from '../game/wolfensteinHighScores';

interface WolfensteinHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang?: Language;
}

export const WolfensteinHistoryModal: React.FC<WolfensteinHistoryModalProps> = ({
  isOpen,
  onClose,
  lang = 'nl',
}) => {
  if (!isOpen) return null;

  const scores = getWolfScores();
  const top = scores[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col rounded-2xl bg-neutral-950 border-2 border-blue-600/80 shadow-[0_0_50px_rgba(59,130,246,0.3)] text-white overflow-hidden">
        {/* Header Marquee */}
        <div className="relative px-6 py-4 border-b border-neutral-800 flex items-center justify-between bg-gradient-to-r from-blue-950 via-neutral-900 to-black">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-mono font-black text-xl flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.6)]">
              🏰
            </div>
            <div>
              <h2 className="font-mono font-black text-lg sm:text-xl tracking-wider text-white flex items-center gap-2">
                <span>WOLFENSTEIN 3D (1992)</span>
                <span className="text-xs px-2 py-0.5 rounded bg-blue-950 border border-blue-700 text-blue-300 font-bold">
                  ID SOFTWARE
                </span>
              </h2>
              <p className="text-xs text-neutral-400 font-mono">
                {lang === 'nl'
                  ? 'De Aartsvader van de 3D FPS • John Carmack, John Romero & Tom Hall'
                  : 'The Grandfather of 3D FPS • John Carmack, John Romero & Tom Hall'}
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

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-sm text-neutral-300 font-mono leading-relaxed">
          {/* Highlight Banner */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-blue-950/60 to-neutral-900 border border-blue-800/60 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Award className="w-6 h-6 text-yellow-400 shrink-0" />
              <div>
                <div className="text-xs font-bold text-neutral-400">ARCADE HIGHSCORE RECORD</div>
                <div className="text-lg font-black text-yellow-400 font-mono">
                  {top ? `${top.score.toLocaleString()} PTS (${top.initials} - ${top.name})` : '64,200 PTS (BJB)'}
                </div>
              </div>
            </div>
            <div className="text-right hidden sm:block">
              <span className="text-xs text-blue-400 font-bold">5 MEI 1992</span>
              <div className="text-[11px] text-neutral-400">MS-DOS SHAREWARE HIT</div>
            </div>
          </div>

          {/* Section 1: History */}
          <div className="space-y-2">
            <h3 className="text-base font-bold text-blue-400 flex items-center gap-2 border-b border-neutral-800 pb-1">
              <History className="w-4 h-4 text-blue-400" />
              <span>{lang === 'nl' ? 'De Historische Doorbraak van 3D' : 'The Historic 3D Breakthrough'}</span>
            </h3>
            <p>
              {lang === 'nl'
                ? 'Op 5 mei 1992 bracht id Software Wolfenstein 3D uit via Apogee Software als shareware. Het spel introduceerde de wereld aan razendsnelle first-person actie en zette de gouden standaard voor het FPS-genre. Spelers kropen in de huid van geallieerd geheim agent William "B.J." Blazkowicz die moest ontsnappen uit de meedogenloze burcht Hollehammer.'
                : 'On May 5, 1992, id Software released Wolfenstein 3D via Apogee Software as shareware. The game introduced the world to lightning-fast first-person combat and established the FPS genre. Players took the role of Allied secret agent William "B.J." Blazkowicz escaping Castle Hollehammer.'}
            </p>
          </div>

          {/* Section 2: Carmack's Engine */}
          <div className="space-y-2">
            <h3 className="text-base font-bold text-yellow-400 flex items-center gap-2 border-b border-neutral-800 pb-1">
              <Cpu className="w-4 h-4 text-yellow-400" />
              <span>{lang === 'nl' ? 'Het Wiskundige Wonder van John Carmack' : 'John Carmack’s Mathematical Feat'}</span>
            </h3>
            <p>
              {lang === 'nl'
                ? 'In 1992 hadden gewone IBM PC\'s (286 en 386 processors) absoluut niet genoeg rekenkracht om echte 3D-polygonen in realtime te berekenen. John Carmack vond de ingenieuze "Raycasting"-methode uit: door per verticale schermkolom een straal uit te zenden naar een 2D-raster, berekende de computer bliksemsnel de hoogte van muren en werd 60 beelden per seconde mogelijk!'
                : 'In 1992, typical IBM PCs lacked the power for real-time 3D polygons. John Carmack invented the raycasting algorithm: by casting rays across a 2D grid per screen column, the PC computed wall heights at 60 FPS smoothly.'}
            </p>
          </div>

          {/* Section 3: Technical Specs Box */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-neutral-900/90 border border-neutral-800 space-y-1">
              <span className="text-neutral-400 font-bold">OORSPRONKELIJK PLATFORM:</span>
              <div className="text-white font-bold">IBM PC DOS / 286, 386, 486</div>
            </div>
            <div className="p-3.5 rounded-xl bg-neutral-900/90 border border-neutral-800 space-y-1">
              <span className="text-neutral-400 font-bold">3D RENDER ENGINE:</span>
              <div className="text-cyan-400 font-bold">Three.js WebGL Hardware 3D</div>
            </div>
            <div className="p-3.5 rounded-xl bg-neutral-900/90 border border-neutral-800 space-y-1">
              <span className="text-neutral-400 font-bold">AUDIO ENGINE:</span>
              <div className="text-yellow-400 font-bold">AdLib / SoundBlaster Synth</div>
            </div>
            <div className="p-3.5 rounded-xl bg-neutral-900/90 border border-neutral-800 space-y-1">
              <span className="text-neutral-400 font-bold">LEAD DESIGNERS:</span>
              <div className="text-emerald-400 font-bold">J. Carmack, J. Romero, T. Hall</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-neutral-800 bg-neutral-900 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-colors cursor-pointer"
          >
            {lang === 'nl' ? 'Sluiten' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
