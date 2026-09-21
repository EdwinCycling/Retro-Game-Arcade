/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Arcadians History & BBC Micro Dossier Modal
 */

import React from 'react';
import { Award, Zap, ShieldAlert, Play, Sparkles, Rocket } from 'lucide-react';

interface ArcadiansHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlay: () => void;
}

export const ArcadiansHistoryModal: React.FC<ArcadiansHistoryModalProps> = ({
  isOpen,
  onClose,
  onPlay,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in select-none">
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-neutral-900 border-2 border-cyan-500/70 rounded-3xl p-5 sm:p-7 shadow-[0_0_60px_rgba(6,182,212,0.35)] text-neutral-200 overflow-y-auto font-sans flex flex-col justify-between">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-xl shadow-inner">
              🚀
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black font-mono text-cyan-400 tracking-wider">
                ARCADIANS (1982)
              </h2>
              <p className="text-xs text-neutral-400 font-mono">
                Acornsoft • Nick Pelling (Orlando M. Pilchard) • BBC Micro Model B &amp; Electron
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white flex items-center justify-center transition cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Content Body */}
        <div className="my-5 space-y-5 text-xs sm:text-sm text-neutral-300 leading-relaxed font-sans">
          
          {/* Milestone Badge */}
          <div className="p-3.5 rounded-2xl bg-cyan-950/30 border border-cyan-600/40 flex items-start gap-3 text-xs">
            <Award className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-cyan-300 block mb-0.5">
                De Kroonprins van de BBC Micro Space Shooters
              </span>
              Geprogrammeerd in 1982 door Nick Pelling en uitgebracht door Acornsoft. Arcadians bewees definitief dat de BBC Micro met zijn 2 MHz 6502A processor een volwaardige 60 FPS speelhal-ervaring naar de Britse huiskamers en scholen kon brengen.
            </div>
          </div>

          {/* Snelheid & 60 FPS Graphics */}
          <div>
            <h3 className="text-sm font-bold text-yellow-400 mb-1 flex items-center gap-1.5 font-mono">
              <Zap className="w-4 h-4 text-yellow-400" />
              Waarom was Arcadians Beroemd om zijn Snelheid &amp; Graphics?
            </h3>
            <p className="text-neutral-400">
              Terwijl veel homecomputers in 1982 worstelden met schokkerige animaties, draaide Arcadians in pure 6502 machinecode op de volledige beeldsnelheid (50/60Hz). Het maakte gebruik van <strong>Mode 2</strong> (de tweekleuren-pixelmodus met 8 selecteerbare BBC-kleuren), waardoor de vloeiende duikvluchten, multi-colored vallende sterren en snelle laserprojectielen fenomenaal soepel bewogen.
            </p>
          </div>

          {/* Formatie & Vijanden */}
          <div>
            <h3 className="text-sm font-bold text-rose-400 mb-1 flex items-center gap-1.5 font-mono">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              De 46-Aliens Formatie &amp; Scoring
            </h3>
            <p className="text-neutral-400">
              Elke wave begint met een ademende en horizontaal wiegende formatie van precies 46 ruimteschepen:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-neutral-300 font-mono text-xs">
              <li><strong className="text-yellow-400">2 Flagships (Galboss):</strong> 60 pts in formatie, 150 pts duikend, en <strong>800 BONUS PTS</strong> als je hem samen met 2 escorts uit de lucht schiet!</li>
              <li><strong className="text-rose-400">6 Red Hornets:</strong> 50 pts in formatie, 100 pts duikend. Vliegen vaak als escorts mee.</li>
              <li><strong className="text-purple-400">8 Purple Emissaries:</strong> 40 pts in formatie, 80 pts duikend.</li>
              <li><strong className="text-emerald-400">30 Green Drones:</strong> 30 pts in formatie, 60 pts duikend.</li>
            </ul>
          </div>

          {/* Alle Levels & Bezier Swoops */}
          <div>
            <h3 className="text-sm font-bold text-emerald-400 mb-1 flex items-center gap-1.5 font-mono">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              Alle Wave Tiers &amp; Spelregels
            </h3>
            <p className="text-neutral-400">
              In onze cabinet zijn <strong>alle wave-niveaus in 1 keer ingebouwd</strong>! Van de eerste patrouillegolven tot razendsnelle <em>Hyper Drive Assaults</em> en de legendarische Wave 20 <em>Emperor Command</em>. Je kunt op elk moment met de <strong>Wave Selector</strong> direct naar elk gewenst level springen of jezelf meten in de klassieke progressie.
            </p>
          </div>

          {/* Snelheidsmodus Opties */}
          <div className="p-3 bg-neutral-950/80 border border-neutral-800 rounded-2xl flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Rocket className="w-4 h-4 text-cyan-400" />
              <span className="text-neutral-300 font-mono">
                Kies in de kast tussen <strong>Authentiek BBC (60 FPS)</strong>, <strong>Turbo</strong> of <strong>Hyperspeed</strong>!
              </span>
            </div>
          </div>
        </div>

        {/* Action Footer */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-mono text-xs cursor-pointer transition"
          >
            Sluiten
          </button>
          <button
            type="button"
            onClick={() => {
              onClose();
              onPlay();
            }}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-yellow-400 hover:from-cyan-400 hover:to-yellow-300 text-black font-black font-mono text-xs flex items-center gap-1.5 shadow-[0_0_20px_rgba(6,182,212,0.45)] cursor-pointer transition"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>START ARCADIANS!</span>
          </button>
        </div>

      </div>
    </div>
  );
};
