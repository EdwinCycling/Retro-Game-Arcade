/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { HelpCircle, Sparkles, BookOpen, Layers } from 'lucide-react';

interface HangmanHistoryModalProps {
  isOpen?: boolean;
  onClose: () => void;
  onPlayGame?: () => void;
  lang?: 'nl' | 'en';
}

export const HangmanHistoryModal: React.FC<HangmanHistoryModalProps> = ({ 
  isOpen = true, 
  onClose, 
  onPlayGame,
  lang = 'nl'
}) => {
  const [activeTab, setActiveTab] = useState<'rules' | 'vocabulary' | 'history'>('rules');

  if (isOpen === false) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in font-sans">
      <div className="bg-slate-900 border-2 border-sky-500/60 rounded-2xl max-w-3xl w-full max-h-[88vh] flex flex-col shadow-2xl text-xs">
        
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center gap-2 font-bold text-sky-300 text-sm">
            <HelpCircle className="w-5 h-5 text-sky-400" />
            <span>{lang === 'nl' ? 'Galgje op Ruitjespapier Dossier (1894)' : 'Hangman on Grid Paper Dossier (1894)'}</span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer border border-slate-700 font-bold"
          >
            ✕
          </button>
        </div>

        {/* Modal Tabs */}
        <div className="flex items-center gap-2 px-4 py-2 bg-slate-950 border-b border-slate-800 font-mono">
          <button
            onClick={() => setActiveTab('rules')}
            className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-colors cursor-pointer ${
              activeTab === 'rules' ? 'bg-sky-500 text-slate-950' : 'bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            📜 {lang === 'nl' ? 'Spelregels & Besturing' : 'Rules & Controls'}
          </button>
          <button
            onClick={() => setActiveTab('vocabulary')}
            className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-colors cursor-pointer ${
              activeTab === 'vocabulary' ? 'bg-sky-500 text-slate-950' : 'bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            🧠 {lang === 'nl' ? 'Woordenschat & Niveaus' : 'Vocabulary & Difficulty'}
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-colors cursor-pointer ${
              activeTab === 'history' ? 'bg-sky-500 text-slate-950' : 'bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            ✨ {lang === 'nl' ? 'Historie (1894 Klaslokaal)' : 'History (1894 Classroom)'}
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 overflow-y-auto space-y-4 max-h-[60vh] text-slate-200">
          {activeTab === 'rules' && (
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="font-bold text-sky-400 text-sm block">1. Woord Raaden op Ruitjespapier</span>
                <p className="text-slate-300">
                  Kies letters op het virtuele balpen-toetsenbord of gebruik je fysieke toetsenbord. Goede letters verschijnen direct in blauwe balpeninkt op de lege lijntjes.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="font-bold text-rose-400 text-sm block">2. De 10 Stappen van de Galg</span>
                <p className="text-slate-300">
                  Bij elke foute letter wordt er met rode balpen een onderdeel van de galg en het poppetje getekend (1. Grondbalk, 2. Paal, 3. Bovenbalk, 4. Touw, 5. Hoofd, 6. Lichaam, 7-8. Armpjes, 9-10. Beentjes). Na 10 foute pogingen is het spel afgelopen.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="font-bold text-amber-400 text-sm block">3. 2-Speler Paspas & Speel Modus</span>
                <p className="text-slate-300">
                  Voer in de 2-speler modus in het geheim een eigen woord, categorie en hint in voor speler 2. Ideaal om klasgenoten of vrienden uit te dagen op hetzelfde scherm!
                </p>
              </div>
            </div>
          )}

          {activeTab === 'vocabulary' && (
            <div className="space-y-3 font-mono">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="font-bold text-emerald-400 text-sm block">🟢 Beginneling (3 - 5 Letters)</span>
                <p className="text-slate-300 font-sans">
                  Korte dagelijkse woorden zoals *KAST*, *SCHIP*, *BOOM*, *ZON*, *PONG*. Snel en toegankelijk voor snelle rondes.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="font-bold text-sky-400 text-sm block">🔵 Gemiddeld (6 - 8 Letters)</span>
                <p className="text-slate-300 font-sans">
                  Uitdagende woorden zoals *KASTEEL*, *GITAAR*, *TETRIS*, *VULKAAN*, *KOMPAS*.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="font-bold text-amber-400 text-sm block">🟠 Moeilijk (9 - 12 Letters)</span>
                <p className="text-slate-300 font-sans">
                  Lange en tactische woorden zoals *LABYRINT*, *HELIKOPTER*, *STRATEGIE*, *CHIPTUNE*, *COMMODORE*.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="font-bold text-purple-400 text-sm block">🟣 Expert / Extreem (13+ Letters)</span>
                <p className="text-slate-300 font-sans">
                  Complexe meerlettergrepige woorden zoals *COMPUTERWETENSCHAP*, *QUANTUMMECHANICA*, *ASTROFYSICA*, *RUITJESPAPIER*.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="font-bold text-sky-400 text-sm block">📖 Oorsprong in Alice Bertha Gomme (1894)</span>
                <p className="text-slate-300">
                  De oudst bekende geschreven vermelding van Galgje (*Traditional Games*) stamt uit 1894 door folklore-onderzoekster Alice Bertha Gomme. Het spel werd al in de 19e eeuw op basisscholen gespeeld op leisteenbordjes en ruitjespapier.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="font-bold text-amber-400 text-sm block">🏫 Het Klaslokaal Wiskundeschrift</span>
                <p className="text-slate-300">
                  Galgje op geruit wiskundepapier is al generaties lang een van de populairste papier-en-pen spellen in de klas tijdens de pauze of onder de wiskundeles.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
          {onPlayGame ? (
            <button
              onClick={onPlayGame}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-sky-400 to-blue-500 hover:from-sky-300 hover:to-blue-400 text-slate-950 font-mono font-black text-xs cursor-pointer shadow-[0_0_15px_rgba(56,189,248,0.4)] transition-all flex items-center gap-2"
            >
              <span>✍️ {lang === 'nl' ? 'SPEEL GALGJE OP RUITJESPAPIER' : 'PLAY HANGMAN ON GRID PAPER'}</span>
            </button>
          ) : <div />}
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono font-bold cursor-pointer transition-colors border border-slate-700"
          >
            {lang === 'nl' ? 'Sluiten' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
