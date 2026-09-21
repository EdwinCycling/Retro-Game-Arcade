/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Chuckie Egg History & BBC Micro Dossier Modal
 */

import React from 'react';
import { BookOpen, Trophy, Sparkles, Play, Award, Zap, ShieldAlert } from 'lucide-react';

interface ChuckieEggHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlay: () => void;
}

export const ChuckieEggHistoryModal: React.FC<ChuckieEggHistoryModalProps> = ({
  isOpen,
  onClose,
  onPlay,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-in fade-in select-none">
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-neutral-900 border-2 border-yellow-500/70 rounded-3xl p-5 sm:p-7 shadow-[0_0_50px_rgba(234,179,8,0.3)] text-neutral-200 overflow-y-auto font-sans flex flex-col justify-between">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-yellow-500/20 border border-yellow-500/40 flex items-center justify-center text-xl shadow-inner">
              🥚
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black font-mono text-yellow-400 tracking-wider">
                CHUCKIE EGG (1983)
              </h2>
              <p className="text-xs text-neutral-400 font-mono">
                A&F Software • Nigel Alderton • BBC Micro Model B
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white flex items-center justify-center transition cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Content Body */}
        <div className="my-5 space-y-5 text-xs sm:text-sm text-neutral-300 leading-relaxed font-sans">
          
          {/* Milestone Badge */}
          <div className="p-3.5 rounded-2xl bg-yellow-950/30 border border-yellow-600/40 flex items-start gap-3 text-xs">
            <Award className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-yellow-300 block mb-0.5">
                De Kroonprins van de Britse Platformers
              </span>
              <span>
                Ontworpen door de pas 16-jarige tiener Nigel Alderton in 1983. Chuckie Egg werd een fenomenaal kassucces op de BBC Micro en ZX Spectrum met meer dan 1 miljoen verkochte exemplaren.
              </span>
            </div>
          </div>

          {/* Story & Heritage */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-yellow-400 font-mono flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-yellow-500" />
              <span>HET VERHAAL VAN HEN-HOUSE HARRY</span>
            </h3>
            <p className="text-neutral-400">
              Als boer <strong>Hen-House Harry</strong> betreed je een reeks enorme kippenschuren vol duizelingwekkende stellingen, hangende ladders en mechanische graanliften. In elke schuur liggen precies <span className="text-yellow-400 font-bold">12 glanzende gouden eieren</span> verspreid.
            </p>
            <p className="text-neutral-400">
              Terwijl je over de stalen balken rent en springt, patrouilleren vraatzuchtige eenden over de vloeren. En bovenin de nok hangt een zware ijzeren kooi met de beruchte <span className="text-rose-400 font-bold">Reuzeneend</span>...
            </p>
          </div>

          {/* Gameplay Mechanics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs">
            <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 space-y-1">
              <div className="text-yellow-400 font-bold flex items-center gap-1.5">
                <span>🥚 12 Gouden Eieren</span>
              </div>
              <p className="text-neutral-400 text-[11px]">
                Verzamel alle 12 eieren om de schuur direct leeg te ruimen (+100 punten per ei + bonusreserve).
              </p>
            </div>

            <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 space-y-1">
              <div className="text-amber-400 font-bold flex items-center gap-1.5">
                <span>🌾 Graankorrels</span>
              </div>
              <p className="text-neutral-400 text-[11px]">
                Geeft 50 punten en verlengt de bonusteller met 150 punten, waardoor de reuzeneend langer opgesloten blijft!
              </p>
            </div>

            <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 space-y-1">
              <div className="text-cyan-400 font-bold flex items-center gap-1.5">
                <span>🛗 Bewegende Liften</span>
              </div>
              <p className="text-neutral-400 text-[11px]">
                Spring op de verticale industriële liften om hogere platforms en ontoegankelijke catwalks te bereiken.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 space-y-1">
              <div className="text-rose-400 font-bold flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                <span>De Reuzeneend Alarm!</span>
              </div>
              <p className="text-neutral-400 text-[11px]">
                Als de bonusteller 0 bereikt, verbrijzelt de kooi en vliegt de reuzeneend recht op Harry af!
              </p>
            </div>
          </div>

          {/* Controls Summary */}
          <div className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800 text-xs font-mono space-y-1">
            <div className="text-emerald-400 font-bold flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5" />
              <span>BEDIENING IN DE VAULT</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-neutral-300 pt-1">
              <div>
                <span className="text-neutral-500">Lopen:</span> Pijltjes Links/Rechts of A / D
              </div>
              <div>
                <span className="text-neutral-500">Klimmen:</span> Pijltjes Boven/Beneden of W / S
              </div>
              <div>
                <span className="text-neutral-500">Springen:</span> Spatiebalk of J / Z
              </div>
              <div>
                <span className="text-neutral-500">Mobiel:</span> Virtuele D-Pad & JUMP knop
              </div>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="pt-3 border-t border-neutral-800 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-mono text-xs font-bold transition cursor-pointer"
          >
            Sluiten
          </button>

          <button
            onClick={onPlay}
            className="flex-1 sm:flex-initial px-6 py-2.5 rounded-xl bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-black font-mono font-black text-xs tracking-wider shadow-lg shadow-yellow-950/50 flex items-center justify-center gap-2 transition cursor-pointer active:scale-95"
          >
            <Play className="w-4 h-4 fill-black" />
            <span>START CHUCKIE EGG</span>
          </button>
        </div>
      </div>
    </div>
  );
};
