/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X, Anchor, Sparkles, BookOpen, Compass, ShieldAlert, Award } from 'lucide-react';
import { Language } from '../i18n/lobbyTranslations';

interface BattleshipHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
}

export const BattleshipHistoryModal: React.FC<BattleshipHistoryModalProps> = ({ isOpen, onClose, lang }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-slate-900 border-2 border-cyan-600/50 rounded-3xl p-6 sm:p-8 text-stone-100 shadow-[0_0_50px_rgba(6,182,212,0.3)]">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-stone-300 hover:text-white transition-all cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6 border-b border-cyan-900/50 pb-4">
          <div className="w-12 h-12 rounded-2xl bg-cyan-600/20 border border-cyan-500/40 flex items-center justify-center text-2xl shadow-inner">
            🚢
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[10px] font-mono font-bold">
                1982 • JAIME PONIACHIK • ARGENTINIË
              </span>
              <span className="text-slate-400 text-xs font-mono">
                {lang === 'nl' ? 'LOGISCHE DENKSPORT' : 'LOGIC BRAIN SPORT'}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-black text-cyan-300 mt-0.5">
              ZEESLAG SOLITAIRE (BATALHA NAVAL / BIMARU)
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              Jaime Poniachik (Juegos Magazine, 1982) • WPC World Puzzle Championship
            </p>
          </div>
        </div>

        {/* Content Body */}
        <div className="space-y-6 text-sm leading-relaxed text-stone-300 font-serif">
          
          {/* Section 1: The Origin */}
          <div className="bg-slate-950/60 p-4 rounded-2xl border border-cyan-900/30 space-y-2">
            <h3 className="text-base font-bold text-cyan-200 flex items-center gap-2 font-mono">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              {lang === 'nl' ? '1. Oorsprong: Uitgevonden in Buenos Aires (1982)' : '1. Origin: Born in Buenos Aires (1982)'}
            </h3>
            <p>
              {lang === 'nl' ? (
                <>
                  Terwijl het traditionele Zeeslag al sinds de Eerste Wereldoorlog door twee spelers met potlood en papier werd gespeeld, werd de <strong>solitaire logica-variant</strong> in <strong>1982</strong> uitgevonden door de Argentijnse puzzelmeester <strong>Jaime Poniachik</strong>. Het verscheen voor het eerst in het legendarische Argentijnse tijdschrift <em>Juegos & Co.</em> onder de naam <em>"Batalla Naval"</em>.
                </>
              ) : (
                <>
                  While traditional two-player Battleship dates back to pencil-and-paper games of WWI, the <strong>solitaire logic puzzle version</strong> was invented in <strong>1982</strong> by Argentine puzzle pioneer <strong>Jaime Poniachik</strong>. It made its worldwide debut in the Argentine magazine <em>Juegos & Co.</em> under the title <em>"Batalla Naval"</em>.
                </>
              )}
            </p>
          </div>

          {/* Section 2: Global Recognition */}
          <div className="bg-slate-950/60 p-4 rounded-2xl border border-cyan-900/30 space-y-2">
            <h3 className="text-base font-bold text-cyan-200 flex items-center gap-2 font-mono">
              <Compass className="w-4 h-4 text-cyan-400" />
              {lang === 'nl' ? '2. Doorbraak bij de World Puzzle Championship (1992)' : '2. World Puzzle Championship Fame (1992)'}
            </h3>
            <p>
              {lang === 'nl' ? (
                <>
                  In 1992 werd het spel geïntroduceerd op het allereerste <strong>World Puzzle Championship in New York</strong>. Puzzelliefhebbers wereldwijd werden direct gegrepen door de elegante wiskundige regels. In Duitstalige landen en Zwitserland werd de puzzel mateloos populair onder de naam <em>Bimaru</em>, en in Nederland en België als een vaste favoriet in de Denksport puzzelboeken.
                </>
              ) : (
                <>
                  In 1992, the puzzle was featured at the inaugural <strong>World Puzzle Championship in New York</strong>. Solvers worldwide fell in love with its elegant mathematical purity. Across German-speaking nations and Switzerland, it became a massive national hit known as <em>Bimaru</em>, while in the Netherlands and UK it remains a staple of newspaper puzzle magazines.
                </>
              )}
            </p>
          </div>

          {/* Section 3: The Golden Rules */}
          <div className="bg-slate-950/60 p-4 rounded-2xl border border-cyan-900/30 space-y-3">
            <h3 className="text-base font-bold text-cyan-200 flex items-center gap-2 font-mono">
              <ShieldAlert className="w-4 h-4 text-cyan-400" />
              {lang === 'nl' ? '3. De Drie Gouden Spelregels' : '3. The Three Golden Rules'}
            </h3>
            <ul className="list-disc list-inside space-y-1.5 text-xs text-stone-300 font-mono">
              <li>
                <strong>{lang === 'nl' ? 'Rij- en Kolomtelling:' : 'Row & Column Counts:'}</strong> {lang === 'nl' ? 'De getallen aan de rand vertellen exact hoeveel scheepsonderdelen er in die rij of kolom moeten liggen.' : 'Numbers along the grid indicate exactly how many ship hull cells must exist in that row or column.'}
              </li>
              <li>
                <strong>{lang === 'nl' ? 'Geen Enkele Aanraking:' : 'No Touching (Even Diagonally):'}</strong> {lang === 'nl' ? 'Schepen mogen elkaar NOOIT horizontaal, verticaal of diagonaal raken. Er moet altijd minstens één vakje water tussen zitten!' : 'Ships may NEVER touch each other, not even diagonally! Every ship is surrounded by water.'}
              </li>
              <li>
                <strong>{lang === 'nl' ? 'Vaste Vlootgrootte:' : 'Fixed Fleet Composition:'}</strong> {lang === 'nl' ? 'De vloot bestaat uit vaste schepen (1 Slagschip van 4 lang, 2 Kruisers van 3, 2 Destroyers van 2 en 3 Onderzeeërs van 1).' : 'The fleet consists of a fixed set of vessels (1 Battleship of 4 cells, 2 Cruisers of 3, 2 Destroyers of 2, and 3 Submarines of 1).'}
              </li>
            </ul>
          </div>

          {/* Section 4: Solitaire Strategy */}
          <div className="bg-slate-950/60 p-4 rounded-2xl border border-cyan-900/30 space-y-2">
            <h3 className="text-base font-bold text-cyan-200 flex items-center gap-2 font-mono">
              <Award className="w-4 h-4 text-cyan-400" />
              {lang === 'nl' ? '4. Deductiestrategie voor Hoge Scores' : '4. Deduction Strategy for High Scores'}
            </h3>
            <p>
              {lang === 'nl' ? (
                <>
                  Begin altijd met rijen of kolommen met een <strong>0</strong>: vul deze meteen met water! Zodra je een schip ontdekt, markeer je direct alle diagonale hoeken als water, want schepen mogen elkaar nooit diagonaal raken. Dit bespaart fouten en levert de maximale scorebonus op!
                </>
              ) : (
                <>
                  Always start with rows or columns containing a <strong>0</strong>: mark the entire line as water immediately! Whenever a ship segment is found, promptly paint all diagonal corners with water since ships cannot touch diagonally. This prevents mistakes and maximizes your speed bonus!
                </>
              )}
            </p>
          </div>

        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-cyan-900/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs transition-all cursor-pointer font-mono"
          >
            {lang === 'nl' ? 'Sluiten & Naar Speelbord' : 'Close & Go to Grid'}
          </button>
        </div>

      </div>
    </div>
  );
};
