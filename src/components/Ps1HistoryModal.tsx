/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Sony PlayStation 1 (1994) Hardware Dossier & History Modal
 */

import React from 'react';
import { X, Cpu, Disc, Volume2, Award, Zap, Play } from 'lucide-react';

interface Ps1HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlayGame?: (gameId: 'crash_bandicoot' | 'ridge_racer') => void;
  lang?: 'nl' | 'en';
}

export const Ps1HistoryModal: React.FC<Ps1HistoryModalProps> = ({
  isOpen,
  onClose,
  onPlayGame,
  lang = 'nl'
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn select-none">
      <div className="bg-slate-900 border-2 border-indigo-500/50 rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 text-slate-100 shadow-2xl relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-full transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Title */}
        <div className="flex items-center space-x-3 mb-6 border-b border-slate-800 pb-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-2xl shadow-lg">
            🎮
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white flex items-center space-x-2">
              <span>SONY PLAYSTATION (PS1)</span>
              <span className="text-xs px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-400/30 font-mono">
                1994 • 32-BIT CD-ROM
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              {lang === 'nl' 
                ? 'Hardware Dossier & De Revolutie van 3D CD-ROM Gaming'
                : 'Hardware Dossier & The 3D CD-ROM Gaming Revolution'}
            </p>
          </div>
        </div>

        {/* History Overview */}
        <div className="space-y-6 text-sm text-slate-300">
          <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-4">
            <h3 className="text-base font-bold text-indigo-400 flex items-center space-x-2 mb-2">
              <Award className="w-5 h-5" />
              <span>{lang === 'nl' ? 'Het Verhaal & Ken Kutaragi' : 'The Origin & Ken Kutaragi'}</span>
            </h3>
            <p className="leading-relaxed">
              {lang === 'nl'
                ? 'Geïntroduceerd in Japan op 3 december 1994 door Sony Computer Entertainment onder leiding van Ken Kutaragi ("de Vader van de PlayStation"). Oorspronkelijk begonnen als een uitbreiding voor de Super Nintendo CD-ROM (SNES-CD), transformeerde de PS1 tot een zelfstandige console die de hele spelindustrie herdefinieerde met meeslepende 3D-polygonen en meeslepende CD-kwaliteit muziek.'
                : 'Launched in Japan on December 3, 1994 by Sony Computer Entertainment under Ken Kutaragi ("the Father of PlayStation"). Originally conceived as a CD-ROM add-on for the Super Nintendo, the PS1 transformed into a standalone console that redefined video games with 3D polygon graphics and CD-quality audio.'}
            </p>
          </div>

          {/* Technical Specs Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* CPU */}
            <div className="bg-slate-800/40 border border-slate-700/60 rounded-2xl p-4">
              <div className="flex items-center space-x-2 text-indigo-400 font-bold mb-1">
                <Cpu className="w-4 h-4" />
                <span>32-Bit RISC CPU</span>
              </div>
              <p className="text-xs text-slate-400">
                LSI R3000A klokfrequentie op 33.8688 MHz met hardware matige Geometry Transformation Engine (GTE) voor 360.000 polygonen/sec.
              </p>
            </div>

            {/* CD-ROM Drive */}
            <div className="bg-slate-800/40 border border-slate-700/60 rounded-2xl p-4">
              <div className="flex items-center space-x-2 text-indigo-400 font-bold mb-1">
                <Disc className="w-4 h-4" />
                <span>2x Speed CD-ROM (660 MB)</span>
              </div>
              <p className="text-xs text-slate-400">
                Echte cd-discs vervingen dure cartridges en maakten FMV video-tussenscenes en audio CD-kwaliteit soundtracks mogelijk.
              </p>
            </div>

            {/* Audio SPU */}
            <div className="bg-slate-800/40 border border-slate-700/60 rounded-2xl p-4">
              <div className="flex items-center space-x-2 text-indigo-400 font-bold mb-1">
                <Volume2 className="w-4 h-4" />
                <span>24-Channel Sound SPU</span>
              </div>
              <p className="text-xs text-slate-400">
                44.1 kHz CD sampling frequentie met hardware reverb, ADPCM compressie en 512 KB dedicated geluidsgeheugen.
              </p>
            </div>

            {/* Memory Card */}
            <div className="bg-slate-800/40 border border-slate-700/60 rounded-2xl p-4">
              <div className="flex items-center space-x-2 text-indigo-400 font-bold mb-1">
                <Zap className="w-4 h-4" />
                <span>1MB Memory Card (15 Blocks)</span>
              </div>
              <p className="text-xs text-slate-400">
                De iconische opslagkaartjes voor het opslaan van spelvoortgang, high scores en spelersprofielen.
              </p>
            </div>
          </div>

          {/* PS1 Game Discs Quick Launchers */}
          <div className="border-t border-slate-700/60 pt-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center justify-between">
              <span>{lang === 'nl' ? 'Speel Direct op de PS1 Console:' : 'Play Immediately on PS1 Console:'}</span>
              <span className="text-[10px] text-indigo-400 font-mono">BLACK DISC CD-ROM</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={() => {
                  onClose();
                  if (onPlayGame) onPlayGame('crash_bandicoot');
                }}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-orange-950/60 hover:bg-orange-900/80 border border-orange-500/40 text-left transition-all group cursor-pointer"
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <span className="text-2xl group-hover:scale-110 transition-transform shrink-0">🦊</span>
                  <div className="min-w-0">
                    <div className="font-bold text-orange-300 text-sm truncate">Crash Bandicoot (3D)</div>
                    <div className="text-[11px] text-orange-400/80 truncate">Naughty Dog (1996)</div>
                  </div>
                </div>
                <div className="px-3 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shrink-0">
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>{lang === 'nl' ? 'Speel Direct' : 'Play Direct'}</span>
                </div>
              </button>

              <button
                onClick={() => {
                  onClose();
                  if (onPlayGame) onPlayGame('ridge_racer');
                }}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-red-950/60 hover:bg-red-900/80 border border-red-500/40 text-left transition-all group cursor-pointer"
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <span className="text-2xl group-hover:scale-110 transition-transform shrink-0">🏎️</span>
                  <div className="min-w-0">
                    <div className="font-bold text-red-300 text-sm truncate">Ridge Racer (3D)</div>
                    <div className="text-[11px] text-red-400/80 truncate">Namco (1994)</div>
                  </div>
                </div>
                <div className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shrink-0">
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>{lang === 'nl' ? 'Speel Direct' : 'Play Direct'}</span>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs shadow-lg transition-all cursor-pointer"
          >
            {lang === 'nl' ? 'Sluit Dossier' : 'Close Dossier'}
          </button>
        </div>
      </div>
    </div>
  );
};
