/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Q*bert History & BBC Micro / Acorn Dossier Modal
 */

import React from 'react';
import { Award, Zap, Play, Sparkles, Tv, Gamepad2, Shield } from 'lucide-react';

interface QbertHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlay?: () => void;
}

export const QbertHistoryModal: React.FC<QbertHistoryModalProps> = ({
  isOpen,
  onClose,
  onPlay,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in select-none">
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-neutral-900 border-2 border-orange-500/70 rounded-3xl p-5 sm:p-7 shadow-[0_0_60px_rgba(249,115,22,0.35)] text-neutral-200 overflow-y-auto font-sans flex flex-col justify-between">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-xl shadow-inner">
              🟠
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black font-mono text-orange-400 tracking-wider">
                Q*BERT (1982 / 1983)
              </h2>
              <p className="text-xs text-neutral-400 font-mono">
                Gottlieb / Superior Software • BBC Micro &amp; Acorn Electron
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
          <div className="p-3.5 rounded-2xl bg-orange-950/30 border border-orange-600/40 flex items-start gap-3 text-xs">
            <Award className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-orange-300 block mb-0.5">
                De Pionier van de Isometrische Puzzel-Arcade
              </span>
              <p className="text-neutral-400">
                Oorspronkelijk ontworpen in 1982 door Warren Davis en Jeff Lee voor Gottlieb, en in 1983 voor de BBC Micro en Acorn geporteerd door het legendarische Britse <strong>Superior Software</strong>.
              </p>
            </div>
          </div>

          {/* Section: The Game & Mechanics */}
          <div>
            <h3 className="text-orange-400 font-bold font-mono text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-orange-400" />
              Het Doel van het Spel
            </h3>
            <p className="mb-2">
              Spring met Q*bert over een piramide van 28 gestapelde 3D-kubussen. Door op de bovenkant van een kubus te landen verandert deze van kleur. Zodra alle 28 kubussen de doelkleur (goudgeel) hebben bereikt, is de ronde voltooid!
            </p>
            <p>
              In latere levels moet je twee keer op een kubus springen, of keert de kleur terug naar het begin als je er per ongeluk nogmaals op stapt!
            </p>
          </div>

          {/* Section: Enemies & Disks */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-2xl bg-neutral-950 border border-neutral-800">
              <span className="font-bold text-purple-400 block mb-1">🐍 Coily de Slang</span>
              <p className="text-neutral-400">
                Begint als een paars stuiterend ei. Zodra hij de onderste rij bereikt, barst het ei open en jaagt hij Q*bert intelligent achterna via het kortste pad over de kubussen!
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-neutral-950 border border-neutral-800">
              <span className="font-bold text-sky-400 block mb-1">🛸 De Vliegende Liftschijven</span>
              <p className="text-neutral-400">
                Zit Coily je op de hielen? Spring vanaf de rand op een zwevende schijf! Q*bert vliegt veilig terug naar de top van de piramide, terwijl Coily in de afgrond stort (+500 punten)!
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-neutral-950 border border-neutral-800">
              <span className="font-bold text-emerald-400 block mb-1">🟢 Groene Tijd-Bal</span>
              <p className="text-neutral-400">
                Tik de groene bal aan voor +100 punten en bevries alle vijanden tijdelijk voor 3,5 seconden zodat je vrij kunt rondspringen.
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-neutral-950 border border-neutral-800">
              <span className="font-bold text-rose-400 block mb-1">🤬 Het @!#?@! Vloekballonnetje</span>
              <p className="text-neutral-400">
                Als Q*bert van de piramide valt of geraakt wordt, verschijnt het beroemde stripballonnetje met willekeurige leestekens, begeleid door de authentieke sputterende spraaksynthesizer.
              </p>
            </div>
          </div>

          {/* Controls & BBC Micro Tips */}
          <div className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800">
            <h4 className="text-yellow-400 font-bold font-mono text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Gamepad2 className="w-4 h-4 text-yellow-400" />
              Diagonale Besturing op PC en Mobiel
            </h4>
            <ul className="list-disc list-inside space-y-1 text-neutral-400 text-xs font-mono">
              <li><strong>Numpad:</strong> 7 (Linksboven), 9 (Rechtsboven), 1 (Linksonder), 3 (Rechtsonder).</li>
              <li><strong>Letters:</strong> Q of W (Boven), A of S (Onder).</li>
              <li><strong>Pijltjestoetsen:</strong> Up (UL), Right (UR), Left (DL), Down (DR).</li>
              <li><strong>Touch &amp; Mobiel:</strong> Gebruik de 4 diagonale knoppen onder het scherm of swipe direct over de canvas.</li>
            </ul>
          </div>
        </div>

        {/* Footer actions */}
        <div className="pt-4 border-t border-neutral-800 flex items-center justify-between">
          <span className="text-[11px] font-mono text-neutral-500">
            Acornsoft &amp; Superior Software Arcade Archief
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-mono text-neutral-300 transition cursor-pointer"
            >
              SLUITEN
            </button>
            {onPlay && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onPlay();
                }}
                className="px-5 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-mono font-bold text-xs flex items-center gap-1.5 shadow-[0_0_15px_rgba(249,115,22,0.4)] transition cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                SPEEL NU
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
