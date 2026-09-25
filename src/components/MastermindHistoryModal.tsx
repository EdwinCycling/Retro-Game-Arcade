/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X, Sparkles, BookOpen, Award, CheckCircle, Brain, Play } from 'lucide-react';
import { Language } from '../i18n/lobbyTranslations';

interface MastermindHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlayGame?: () => void;
  lang: Language;
}

export const MastermindHistoryModal: React.FC<MastermindHistoryModalProps> = ({
  isOpen,
  onClose,
  onPlayGame,
  lang,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-stone-900 border-2 border-amber-600/50 rounded-3xl p-6 sm:p-8 text-stone-100 shadow-[0_0_50px_rgba(245,158,11,0.3)]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white transition-all cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6 border-b border-amber-900/50 pb-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-600/20 border border-amber-500/40 flex items-center justify-center text-2xl shadow-inner">
            🧠
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-mono font-bold">
                1970/1971 • MORDECAI MEIROWITZ • INVICTA PLASTICS / JUMBO
              </span>
              <span className="text-stone-400 text-xs font-mono">
                {lang === 'nl' ? 'LOGISCHE CODEBREKER' : 'LOGIC CODEBREAKER'}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-black text-amber-300 mt-0.5">
              MASTERMIND
            </h2>
            <p className="text-xs text-stone-400 font-mono">
              Mordecai Meirowitz (1970) • Super Mastermind (1975) • Jumbo & Invicta Games
            </p>
          </div>
        </div>

        {/* Content Body */}
        <div className="space-y-6 text-sm leading-relaxed text-stone-300 font-serif">
          {/* Section 1: The Origin */}
          <div className="bg-stone-950/60 p-4 rounded-2xl border border-amber-900/30 space-y-2">
            <h3 className="text-base font-bold text-amber-200 flex items-center gap-2 font-mono">
              <Sparkles className="w-4 h-4 text-amber-400" />
              {lang === 'nl' ? 'Het Ontstaan van een Wereldwijd Fenomeen' : 'The Genesis of a Global Phenomenon'}
            </h3>
            <p>
              {lang === 'nl'
                ? 'Mastermind werd in 1970 bedacht door de Israëlische postmeester en telecommunicatie-expert Mordecai Meirowitz. Het spel was gebaseerd op het traditionele potlood-en-papier spel "Bulls and Cows", maar Meirowitz transformeerde het naar een revolutionair plastic bordspel met kleurrijke pionnen en een verborgen schildkapje. Nadat het spel op de Internationale Speelgoedbeurs van Neurenberg in eerste instantie werd afgewezen, ontdekte het Britse plasticbedrijf Invicta Plastics het potentieel. In Nederland werd het uitgebracht door Jumbo en groeide het uit tot een van de bestverkochte denkspellen aller tijden met meer dan 55 miljoen verkochte exemplaren in 80 landen!'
                : 'Mastermind was invented in 1970 by Israeli postmaster Mordecai Meirowitz. Rooted in the century-old paper-and-pencil game "Bulls and Cows", Meirowitz reimagined the concept into an iconic plastic tabletop board with colorful pegs and a secret sliding shield. After initial rejection at the Nuremberg Toy Fair, UK-based Invicta Plastics purchased the rights. In the Netherlands, Jumbo distributed the game, propelling Mastermind into an international sensation with over 55 million units sold across 80 countries!'}
            </p>
          </div>

          {/* Section 2: Mathematical Breakthrough by Donald Knuth */}
          <div className="bg-stone-950/60 p-4 rounded-2xl border border-amber-900/30 space-y-2">
            <h3 className="text-base font-bold text-amber-200 flex items-center gap-2 font-mono">
              <Brain className="w-4 h-4 text-amber-400" />
              {lang === 'nl' ? 'Donald Knuth & Het Vijf-Beurten Bewijs (1977)' : 'Donald Knuth & The Five-Guess Algorithm (1977)'}
            </h3>
            <p>
              {lang === 'nl'
                ? 'In 1977 publiceerde informatica-legende Donald Knuth een baanbrekend wiskundig artikel waarin hij bewees dat de codekraker ELKE geheime code van 4 pionnen en 6 kleuren binnen maximaal 5 beurten kan oplossen met behulp van een minimax-algoritme. Zijn beroemde openingszet was steevast [Rood, Rood, Blauw, Blauw] (of twee paren van gelijke kleuren), waarmee hij het aantal overgebleven mogelijkheden in de zoekruimte maximaal verkleinde.'
                : 'In 1977, computer science icon Donald Knuth published a landmark paper proving mathematically that the codebreaker can crack ANY 4-peg 6-color secret combination in at most 5 guesses using a minimax decision algorithm. His renowned first move was [Color A, Color A, Color B, Color B], systematically minimizing the worst-case remaining search space.'}
            </p>
          </div>

          {/* Section 3: Super Mastermind & Variations */}
          <div className="bg-stone-950/60 p-4 rounded-2xl border border-amber-900/30 space-y-2">
            <h3 className="text-base font-bold text-amber-200 flex items-center gap-2 font-mono">
              <Award className="w-4 h-4 text-amber-400" />
              {lang === 'nl' ? 'Super Mastermind Deluxe (5 Pionnen & 8 Kleuren)' : 'Super Mastermind Deluxe (5 Pegs & 8 Colors)'}
            </h3>
            <p>
              {lang === 'nl'
                ? 'In 1975 introduceerde Invicta "Super Mastermind", waarbij het raster werd uitgebreid naar 5 posities en 8 kleuren (inclusief zwart en wit als speelpionnen). Hierdoor steeg het aantal mogelijke geheime codes van 1.296 (in de 4-pions versie) naar maar liefst 32.768 unieke combinaties! In deze digitale Arcade Vault editie kun je met één klik schakelen tussen de klassieke 4-pions en de deluxe 5-pions Super Mastermind modus.'
                : 'In 1975, Invicta introduced "Super Mastermind", expanding the grid to 5 peg slots and 8 colors (adding black and white pegs). This surged the solution search space from 1,296 combinations (classic 4-peg) to an astronomical 32,768 permutations! In our Arcade Vault edition, you can seamlessly toggle between the classic 4-peg and 5-peg Super Mastermind rules.'}
            </p>
          </div>

          {/* Section 4: Specifications */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs text-stone-300">
            <div className="bg-stone-950/80 p-3 rounded-xl border border-amber-900/40">
              <div className="text-[10px] text-amber-400 font-bold uppercase">{lang === 'nl' ? 'JAARTAL' : 'YEAR'}</div>
              <div className="text-sm font-bold text-white mt-1">1970 / 1971</div>
            </div>
            <div className="bg-stone-950/80 p-3 rounded-xl border border-amber-900/40">
              <div className="text-[10px] text-amber-400 font-bold uppercase">{lang === 'nl' ? 'ONTWERPER' : 'DESIGNER'}</div>
              <div className="text-sm font-bold text-white mt-1">M. Meirowitz</div>
            </div>
            <div className="bg-stone-950/80 p-3 rounded-xl border border-amber-900/40">
              <div className="text-[10px] text-amber-400 font-bold uppercase">{lang === 'nl' ? 'COMBINATIES' : 'PERMUTATIONS'}</div>
              <div className="text-sm font-bold text-white mt-1">1,296 / 32,768</div>
            </div>
            <div className="bg-stone-950/80 p-3 rounded-xl border border-amber-900/40">
              <div className="text-[10px] text-amber-400 font-bold uppercase">{lang === 'nl' ? 'MEDIUM' : 'MEDIA'}</div>
              <div className="text-sm font-bold text-white mt-1">Tabletop Board</div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-6 pt-4 border-t border-amber-900/50 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 font-mono text-xs cursor-pointer"
          >
            {lang === 'nl' ? 'Sluiten' : 'Close'}
          </button>
          {onPlayGame && (
            <button
              onClick={onPlayGame}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-mono font-bold text-xs shadow-lg shadow-amber-500/20 transition cursor-pointer"
            >
              <Play className="w-4 h-4 fill-black" />
              <span>{lang === 'nl' ? 'NU SPELEN' : 'PLAY NOW'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
