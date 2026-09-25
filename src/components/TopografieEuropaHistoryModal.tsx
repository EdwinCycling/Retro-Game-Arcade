/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Topografie Europa History Dossier Modal
 * Celebrating Cees Kramer, Roel Kramer, Radarsoft & 1984 Dutch Microcomputing History
 */

import React from 'react';
import { X, Award, Compass, Cpu, BookOpen, Sparkles } from 'lucide-react';

interface TopografieEuropaHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: 'nl' | 'en';
}

export const TopografieEuropaHistoryModal: React.FC<TopografieEuropaHistoryModalProps> = ({
  isOpen,
  onClose,
  lang
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-slate-900 border border-blue-500/40 rounded-xl shadow-2xl shadow-blue-500/20 text-slate-100 p-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 rounded-lg transition-colors"
          aria-label="Sluiten"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6 border-b border-blue-500/30 pb-4">
          <div className="p-3 bg-blue-600/20 border border-blue-500/40 rounded-xl text-2xl">
            🚁
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/40 font-semibold">
                COMMODORE 64 • 1984
              </span>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                RADARSOFT
              </span>
            </div>
            <h2 className="text-2xl font-bold tracking-wide text-white mt-1">
              {lang === 'nl' ? 'Topografie Europa Dossier' : 'Topografie Europa Dossier'}
            </h2>
            <p className="text-xs text-blue-400 font-mono">
              {lang === 'nl'
                ? 'Door Cees Kramer & Roel Kramer • Radarsoft (Utrecht/Driebergen)'
                : 'By Cees Kramer & Roel Kramer • Radarsoft (Netherlands)'}
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-6 text-sm text-slate-300 leading-relaxed font-sans">
          {/* Section 1 */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-4">
            <h3 className="text-base font-semibold text-blue-300 flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-blue-400" />
              {lang === 'nl'
                ? 'De Ultieme Nederlandse C64 Educatieve Klassieker'
                : 'The Definitive Dutch Educational C64 Masterpiece'}
            </h3>
            <p>
              {lang === 'nl'
                ? 'Iedereen die in de jaren \'80 in Nederland opgroeide met een Commodore 64 (of later MSX) herinnert zich Topografie Europa. Ontwikkeld in 1984 door Cees Kramer en uitgegeven door Radarsoft in Driebergen, was dit hét computerspel dat bewees dat educatieve software net zo meeslepend en verslavend kon zijn als een arcade-game.'
                : 'Anyone who grew up in the Netherlands during the 1980s with a Commodore 64 remembers Topografie Europa. Developed in 1984 by Cees Kramer and published by legendary software house Radarsoft, it proved that educational games could be just as thrilling and addictive as commercial arcade titles.'}
            </p>
          </div>

          {/* Section 2 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-amber-300 flex items-center gap-2 mb-1.5">
                <Compass className="w-4 h-4 text-amber-400" />
                {lang === 'nl' ? 'De Blinde Kaart & De Helikopter' : 'The Blind Map & The Chopper'}
              </h4>
              <p className="text-xs text-slate-300">
                {lang === 'nl'
                  ? 'In plaats van saaie meerkeuzevragen bestuurde je een helikopter over een natuurgetrouwe blinde kaart van Europa. Zodra de C64-teleprompter de opdracht gaf ("Vlieg naar Wenen"), moest je op eigen topografisch inzicht naar de juiste plek navigeren en precies op de stad landen.'
                  : 'Instead of dry multiple-choice quizzes, players piloted an animated helicopter across an unlabeled map of Europe. When the mission prompt commanded "Fly to Vienna", you had to fly by true geographical landmark intuition and touch down on the city.'}
              </p>
            </div>

            <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-cyan-300 flex items-center gap-2 mb-1.5">
                <Cpu className="w-4 h-4 text-cyan-400" />
                {lang === 'nl' ? 'SID 6581 Sound & 64KB Geheugen' : 'SID 6581 Audio & 64KB RAM'}
              </h4>
              <p className="text-xs text-slate-300">
                {lang === 'nl'
                  ? 'Cees Kramer wist het uiterste uit de MOS 6581 SID-geluidschip en VIC-II grafische processor te persen: pulserend wiekgeronk met filtered noise, feestelijke arpeggio-overwinningsjingles en accurate vector-polygonen voor Europese kusten en rivieren.'
                  : 'Cees Kramer extracted maximum performance from the MOS 6581 SID sound chip and VIC-II graphics processor: rhythmic rotor blade thuds, celebratory arpeggios, and tight vector polygons tracing European coasts and winding rivers.'}
              </p>
            </div>
          </div>

          {/* Section 3 */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-4">
            <h3 className="text-base font-semibold text-emerald-300 flex items-center gap-2 mb-2">
              <Award className="w-4 h-4 text-emerald-400" />
              {lang === 'nl' ? 'Tv-quizzen en Nationale Roem' : 'Television Game Shows & Cultural Heritage'}
            </h3>
            <p>
              {lang === 'nl'
                ? 'De Topografie-reeks van Radarsoft (Nederland, Europa en Wereld) was zó revolutionair dat het zelfs werd ingezet bij televisiequizzen van omroepen als de NOT en Teleac. Tienduizenden basisscholen en computerclubs gebruikten de software om generaties jongeren spelenderwijs aardrijkskunde bij te brengen.'
                : 'Radarsoft\'s Topografie series was so popular that it was adapted for television broadcasts by Dutch educational networks (NOT / Teleac). Tens of thousands of Dutch schools used the software to teach children geography through hands-on gameplay.'}
            </p>
          </div>

          {/* Specs List */}
          <div className="bg-slate-950/40 border border-blue-500/20 rounded-lg p-3 text-xs font-mono text-slate-400">
            <div className="grid grid-cols-2 gap-2">
              <div><strong className="text-slate-200">Release:</strong> 1984</div>
              <div><strong className="text-slate-200">Platform:</strong> Commodore 64 (PAL)</div>
              <div><strong className="text-slate-200">Auteurs:</strong> Cees & Roel Kramer</div>
              <div><strong className="text-slate-200">Uitgever:</strong> Radarsoft (Driebergen)</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg shadow-lg shadow-blue-500/20 transition-colors"
          >
            {lang === 'nl' ? 'Sluiten' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
