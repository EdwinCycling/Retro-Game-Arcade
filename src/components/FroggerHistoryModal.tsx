/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Frogger History & Atari 2600 Dossier Modal
 */

import React from 'react';
import { X, Trophy, Zap, Sparkles, BookOpen, Clock, Heart } from 'lucide-react';

interface FroggerHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlay: () => void;
}

export const FroggerHistoryModal: React.FC<FroggerHistoryModalProps> = ({
  isOpen,
  onClose,
  onPlay,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-neutral-900 border-2 border-emerald-500/80 rounded-3xl p-6 sm:p-8 shadow-[0_0_50px_rgba(34,197,94,0.3)] overflow-y-auto text-neutral-200 font-sans">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-700 transition active:scale-95 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Badge & Title */}
        <div className="space-y-2 mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-bold">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>RETRO DOSSIER • PARKER BROTHERS & KONAMI 1982</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black font-mono text-white tracking-tight flex items-center gap-3">
            <span>FROGGER</span>
            <span className="text-emerald-400 text-lg sm:text-xl font-normal">Atari 2600 Editie</span>
          </h2>
          <p className="text-neutral-400 text-xs sm:text-sm font-mono">
            Origineel: Konami (1981) • Atari VCS Port: Ed English / Parker Brothers (1982)
          </p>
        </div>

        {/* Story & Background */}
        <div className="space-y-5 text-xs sm:text-sm leading-relaxed text-neutral-300">
          <section className="p-4 rounded-2xl bg-neutral-950/80 border border-emerald-950/60 space-y-2">
            <h3 className="font-bold text-emerald-400 font-mono text-sm flex items-center gap-1.5">
              <BookOpen className="w-4 h-4" />
              <span>DE ATARI 2600 LEGENDE (1982)</span>
            </h3>
            <p>
              Frogger werd in 1981 ontwikkeld door Konami en wereldwijd gedistribueerd door Sega in de speelhallen. In 1982 bracht Parker Brothers de officiële port naar de Atari 2600, geprogrammeerd door Ed English.
            </p>
            <p>
              Ondanks de gigantische hardwarebeperkingen van de Atari 2600 (slechts 128 bytes RAM en geen frame buffer) slaagde Ed English erin om alle iconische elementen vloeiend op het scherm te toveren: de 5 leliebladen, duikende schildpadden, voorbijrazende racewagens en de beruchte zware trucks!
            </p>
          </section>

          {/* Gameplay and scoring */}
          <section className="space-y-3">
            <h3 className="font-bold text-white font-mono text-sm flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-yellow-400" />
              <span>SPELDOEL & SCORINGSMECHANISME</span>
            </h3>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs font-mono">
              <li className="p-2.5 rounded-xl bg-neutral-800/80 border border-neutral-700/50 flex flex-col gap-1">
                <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                  <Heart className="w-3.5 h-3.5" /> 5 Kikkers naar Huis
                </span>
                <span>Vul alle 5 leliebladen in de rivieroever om het level te voltooien!</span>
              </li>
              <li className="p-2.5 rounded-xl bg-neutral-800/80 border border-neutral-700/50 flex flex-col gap-1">
                <span className="text-yellow-400 font-bold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> Bonus Vlieg (+200)
                </span>
                <span>Als er een vlieg in een open haven verschijnt, eet hem voor extra punten.</span>
              </li>
              <li className="p-2.5 rounded-xl bg-neutral-800/80 border border-neutral-700/50 flex flex-col gap-1">
                <span className="text-cyan-400 font-bold flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" /> Tijd Bonus (+10/sec)
                </span>
                <span>Elke resterende seconde levert 10 bonuspunten op bij thuiskomst.</span>
              </li>
              <li className="p-2.5 rounded-xl bg-neutral-800/80 border border-neutral-700/50 flex flex-col gap-1">
                <span className="text-rose-400 font-bold flex items-center gap-1.5">
                  <Trophy className="w-3.5 h-3.5" /> Level Voltooid (+1000)
                </span>
                <span>1000 punten bonus en een nog hogere snelheid in de volgende ronde.</span>
              </li>
            </ul>
          </section>

          {/* Tips */}
          <section className="p-4 rounded-2xl bg-neutral-950/80 border border-neutral-800 space-y-2">
            <h3 className="font-bold text-amber-300 font-mono text-sm">💡 STRATEGISCHE RETRO TIPS</h3>
            <p>
              • <strong>Let op duikende schildpadden:</strong> Als de schildpadden blauw knipperen, staan ze op het punt onder water te duiken. Spring snel naar een boomstam!
            </p>
            <p>
              • <strong>Rustpunt op het midden trottoir:</strong> De paarse strook tussen snelweg en rivier is volkomen veilig. Adem even uit en time de rivierobsatckels zorgvuldig!
            </p>
            <p>
              • <strong>Schakel de Atari 2600 modus in:</strong> Gebruik de schakelaar in de werkbalk voor de authentieke Atari VCS rasterstijl.
            </p>
          </section>
        </div>

        {/* Action button */}
        <div className="mt-6 pt-4 border-t border-neutral-800 flex justify-end gap-3">
          <button
            onClick={onPlay}
            className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold font-mono text-sm transition active:scale-95 shadow-lg shadow-emerald-500/25 cursor-pointer"
          >
            NU FROGGER SPELEN ►
          </button>
        </div>
      </div>
    </div>
  );
};
