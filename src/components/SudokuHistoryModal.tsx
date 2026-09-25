/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X, BookOpen, Sparkles, Brain, Award, Calendar, Lightbulb, Gamepad2 } from 'lucide-react';
import { Language } from '../i18n/lobbyTranslations';

interface SudokuHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
}

export const SudokuHistoryModal: React.FC<SudokuHistoryModalProps> = ({ isOpen, onClose, lang }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-stone-900 border-2 border-amber-600/50 rounded-3xl p-6 sm:p-8 text-stone-100 shadow-[0_0_50px_rgba(217,119,6,0.3)]">
        
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
            🔢
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-mono font-bold">
                1979 • 1984 • 2005
              </span>
              <span className="text-stone-400 text-xs font-mono">
                {lang === 'nl' ? 'DENKSPORT & LOGICA' : 'MIND & LOGIC'}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-black text-amber-300 mt-0.5">
              SUDOKU (数独)
            </h2>
            <p className="text-xs text-stone-400 font-mono">
              Howard Garns (Dell) • Maki Kaji (Nikoli) • Dr. Kawashima (Nintendo DS)
            </p>
          </div>
        </div>

        {/* Content Tabs / Sections */}
        <div className="space-y-6 text-sm leading-relaxed text-stone-300 font-serif">
          
          {/* Section 1: The Origin Story */}
          <div className="bg-stone-950/60 p-4 rounded-2xl border border-amber-900/30 space-y-2">
            <h3 className="text-base font-bold text-amber-200 flex items-center gap-2 font-mono">
              <Sparkles className="w-4 h-4 text-amber-400" />
              {lang === 'nl' ? '1. De Geboorte: Number Place (1979)' : '1. The Birth: Number Place (1979)'}
            </h3>
            <p>
              {lang === 'nl' ? (
                <>
                  Hoewel velen denken dat Sudoku een eeuwenoud Oosters spel is, werd de moderne logische cijferpuzzel in <strong>1979</strong> bedacht door de 74-jarige Amerikaanse architect <strong>Howard Garns</strong> uit Indianapolis. Hij publiceerde het onder de naam <em>"Number Place"</em> in het Amerikaanse puzzelmagazine <em>Dell Pencil Puzzles & Word Games</em>.
                </>
              ) : (
                <>
                  While commonly thought to be an ancient Asian puzzle, modern number-place logic was actually invented in <strong>1979</strong> by 74-year-old American architect <strong>Howard Garns</strong> in Indianapolis. He published it anonymously as <em>"Number Place"</em> in <em>Dell Pencil Puzzles & Word Games</em>.
                </>
              )}
            </p>
          </div>

          {/* Section 2: Japan & The Name 'Sudoku' */}
          <div className="bg-stone-950/60 p-4 rounded-2xl border border-amber-900/30 space-y-2">
            <h3 className="text-base font-bold text-amber-200 flex items-center gap-2 font-mono">
              <BookOpen className="w-4 h-4 text-amber-400" />
              {lang === 'nl' ? '2. De Naam "Sūdoku" & Uitgeverij Nikoli (1984)' : '2. The Name "Sūdoku" & Nikoli (1984)'}
            </h3>
            <p>
              {lang === 'nl' ? (
                <>
                  In april <strong>1984</strong> ontdekte <strong>Maki Kaji</strong>, oprichter van de Japanse puzzeluitgeverij <em>Nikoli</em>, de puzzel. Hij verfijnde de regels (zoals symmetrische aanwijzingen) en gaf het de naam <strong>Sūdoku</strong> — een samentrekking van <em>Sūji wa dokushin ni kagiru</em> (wat letterlijk betekent: <em>"de getallen moeten alleenstaand/ongehuwd blijven"</em>).
                </>
              ) : (
                <>
                  In April <strong>1984</strong>, <strong>Maki Kaji</strong>, founder of Japanese puzzle publisher <em>Nikoli</em>, discovered the concept. He refined the formatting with symmetrical clues and coined the name <strong>Sūdoku</strong> — a contraction of <em>Sūji wa dokushin ni kagiru</em> (<em>"the numbers must remain single / unmarried"</em>).
                </>
              )}
            </p>
          </div>

          {/* Section 3: The Handheld & Console Explosion */}
          <div className="bg-stone-950/60 p-4 rounded-2xl border border-amber-900/30 space-y-2">
            <h3 className="text-base font-bold text-amber-200 flex items-center gap-2 font-mono">
              <Gamepad2 className="w-4 h-4 text-amber-400" />
              {lang === 'nl' ? '3. De Revolutie op Consoles & Handhelds (2004–2006)' : '3. The Handheld & Console Phenomenon (2004–2006)'}
            </h3>
            <p>
              {lang === 'nl' ? (
                <>
                  Nadat de gepensioneerde rechter Wayne Gould in 2004 Sudoku in de Britse krant <em>The Times</em> introduceerde, explodeerde het spel wereldwijd. Fabrikanten zoals <strong>Radica en Hasbro</strong> brachten miljoenen verlichte <strong>elektronische LCD-handhelds</strong> op de markt.
                  <br /><br />
                  In <strong>2005</strong> bereikte de rage zijn absolute hoogtepunt op de <strong>Nintendo DS</strong> met <em>Dr. Kawashima's Brain Age: Train Your Brain in Minutes a Day!</em>, waarin spelers met de stylus op het touchscreen cijfers schreven. Alleen al van Brain Age werden meer dan <strong>19 miljoen exemplaren</strong> verkocht!
                </>
              ) : (
                <>
                  Following New Zealand judge Wayne Gould’s introduction of Sudoku to <em>The Times</em> of London in 2004, the puzzle swept the globe. Toy makers like <strong>Radica and Hasbro</strong> manufactured millions of dedicated <strong>illuminated LCD handheld units</strong>.
                  <br /><br />
                  In <strong>2005</strong>, Nintendo brought the phenomenon to the <strong>Nintendo DS</strong> in <em>Dr. Kawashima's Brain Age: Train Your Brain in Minutes a Day!</em>, enabling players to write numbers directly onto the dual touchscreens with a stylus. Brain Age sold over <strong>19 million copies worldwide</strong>!
                </>
              )}
            </p>
          </div>

          {/* Section 4: Mathematical Facts & Techniques */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="bg-amber-950/40 border border-amber-700/40 p-3.5 rounded-xl font-mono text-xs space-y-1">
              <div className="flex items-center gap-1.5 text-amber-400 font-bold uppercase text-[11px]">
                <Brain className="w-3.5 h-3.5" />
                {lang === 'nl' ? 'Wiskundige Feiten' : 'Mathematical Facts'}
              </div>
              <p className="text-stone-300 font-serif text-xs">
                Er zijn precies <strong>6.670.903.752.021.072.936.960</strong> mogelijke geldige 9×9 Sudoku-borden. Een uniek oplosbare Sudoku vereist minimaal 17 aanwijzingen.
              </p>
            </div>

            <div className="bg-amber-950/40 border border-amber-700/40 p-3.5 rounded-xl font-mono text-xs space-y-1">
              <div className="flex items-center gap-1.5 text-amber-400 font-bold uppercase text-[11px]">
                <Lightbulb className="w-3.5 h-3.5" />
                {lang === 'nl' ? 'Oplostechnieken' : 'Solving Techniques'}
              </div>
              <p className="text-stone-300 font-serif text-xs">
                Maak gebruik van <em>Naked Singles</em> (enige mogelijke getal in een cel), <em>Hidden Pairs</em>, <em>Cross-Hatching</em> en potloodnotities om uitsluitingen te vinden!
              </p>
            </div>
          </div>

        </div>

        {/* Footer Action */}
        <div className="mt-6 pt-4 border-t border-amber-900/40 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-black font-mono text-xs tracking-wider uppercase transition-all shadow-md active:scale-95 cursor-pointer"
          >
            {lang === 'nl' ? 'Sluit Dossier' : 'Close Dossier'}
          </button>
        </div>

      </div>
    </div>
  );
};
