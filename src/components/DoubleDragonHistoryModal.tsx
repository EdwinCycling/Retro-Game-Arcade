/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Historical Dossier Modal for Double Dragon (1987 / Technos Japan)
 */

import React from 'react';
import { X, Trophy, BookOpen, Swords, Sparkles, Cpu, Award } from 'lucide-react';

interface DoubleDragonHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: 'nl' | 'en';
}

export const DoubleDragonHistoryModal: React.FC<DoubleDragonHistoryModalProps> = ({ isOpen, onClose, lang }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative w-full max-w-2xl bg-neutral-950 border border-blue-500/40 rounded-2xl shadow-[0_0_50px_rgba(59,130,246,0.25)] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-neutral-800 bg-gradient-to-r from-blue-950/50 via-neutral-900 to-red-950/30">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/20 border border-blue-500/40 text-blue-400">
              <Swords className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-mono font-black text-white tracking-wide flex items-center gap-2">
                DOUBLE DRAGON
                <span className="text-xs px-2 py-0.5 rounded bg-red-600 text-white font-bold">1987</span>
              </h2>
              <p className="text-xs text-neutral-400 font-mono">
                Technos Japan • Yoshihisa Kishimoto • Taito Arcade Coin-Op
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-neutral-300 font-mono text-xs sm:text-sm leading-relaxed">
          {/* Highlight Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-neutral-900/90 border border-neutral-800 flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-blue-400 shrink-0" />
              <div>
                <div className="text-[10px] text-neutral-500 uppercase">{lang === 'nl' ? 'Genre' : 'Genre'}</div>
                <div className="font-bold text-white text-xs">Pionier Beat ’em Up</div>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-neutral-900/90 border border-neutral-800 flex items-center gap-3">
              <Award className="w-5 h-5 text-amber-400 shrink-0" />
              <div>
                <div className="text-[10px] text-neutral-500 uppercase">{lang === 'nl' ? 'Co-op Speelstijl' : 'Co-op Gameplay'}</div>
                <div className="font-bold text-white text-xs">Billy &amp; Jimmy Lee</div>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-neutral-900/90 border border-neutral-800 flex items-center gap-3">
              <Cpu className="w-5 h-5 text-red-400 shrink-0" />
              <div>
                <div className="text-[10px] text-neutral-500 uppercase">{lang === 'nl' ? 'Wapens' : 'Weapons'}</div>
                <div className="font-bold text-white text-xs">Vaten, Zwepen &amp; Knuppels</div>
              </div>
            </div>
          </div>

          {/* History Sections */}
          <div className="space-y-4">
            <div>
              <h3 className="text-white font-bold text-sm mb-1 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-blue-400" />
                {lang === 'nl' ? '1987: De Revolutie van de Straatvechter' : '1987: The Street Brawler Revolution'}
              </h3>
              <p>
                {lang === 'nl'
                  ? 'Double Dragon, ontworpen door Yoshihisa Kishimoto bij Technos Japan en uitgebracht in 1987, definieerde het complete Beat ’em Up genre. Geïnspireerd door Bruce Lee en de post-apocalyptische sfeer van Mad Max, introduceerde het spel dieptebeweging (2.5D belt-scrolling), een breed scala aan vechttechnieken (stoten, trappen, elleboogstoten en worpen) en de mogelijkheid om vijandelijke wapens en vaten op te pakken.'
                  : 'Double Dragon, designed by Yoshihisa Kishimoto at Technos Japan in 1987, established the foundational template for the side-scrolling beat ’em up genre. Drawing inspiration from Bruce Lee and post-apocalyptic cinema, it pioneered depth movement, multi-hit combos, weapons pickup, and two-player cooperative fighting.'}
              </p>
            </div>

            <div>
              <h3 className="text-white font-bold text-sm mb-1 flex items-center gap-2">
                <Swords className="w-4 h-4 text-red-400" />
                {lang === 'nl' ? 'De Beruchte Elleboogstoot (Elbow Smash)' : 'The Infamous Elbow Smash'}
              </h3>
              <p>
                {lang === 'nl'
                  ? 'In speelhallen over de hele wereld ontdekten spelers al snel dat de achterwaartse elleboogstoot ("Rear Elbow Smash") de meest verwoestende aanval in het spel was. Omdat de elleboogstoot vijanden direct neersloeg en een enorme schade toebracht, werd deze techniek een van de beroemdste arcadetactieken uit de jaren 80.'
                  : 'In arcades across the globe, seasoned players quickly uncovered the "Rear Elbow Smash". Delivering instant knockdown and immense damage, mastering the elbow became an iconic rite of passage for 1980s arcade veterans.'}
              </p>
            </div>

            <div>
              <h3 className="text-white font-bold text-sm mb-1 flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-400" />
                {lang === 'nl' ? 'Het Openingsverhaal: De Ontvoering van Marian' : 'The Opening: The Abduction of Marian'}
              </h3>
              <p>
                {lang === 'nl'
                  ? 'Geen enkele arcadegamer vergeet de openingsscène: de garagedeur rolt omhoog in een grimmige steeg in New York, straatbende Black Warriors stormt naar buiten, slaat Marian knock-out en ontvoert haar. Direct daarna stappen de tweelingbroers Billy en Jimmy Lee naar voren voor een epische wraaktocht.'
                  : 'The opening scene is burnt into gaming history: a gritty garage shutter rolls open in a New York back alley, the Black Warriors gang ambushes Marian, and twin martial artists Billy and Jimmy Lee emerge to rescue her in a thrilling cross-city rescue.'}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-800 bg-neutral-900/60 flex items-center justify-between text-xs text-neutral-400">
          <span>{lang === 'nl' ? 'Originele Arcade Release: 1987' : 'Original Arcade Release: 1987'}</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold font-mono transition-colors"
          >
            {lang === 'nl' ? 'Sluiten & Vechten' : 'Close & Fight'}
          </button>
        </div>
      </div>
    </div>
  );
};
