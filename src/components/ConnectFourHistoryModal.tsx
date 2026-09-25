/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { HelpCircle, Crown, Sparkles, BookOpen, Layers } from 'lucide-react';

interface ConnectFourHistoryModalProps {
  isOpen?: boolean;
  onClose: () => void;
  onPlayGame?: () => void;
  lang?: 'nl' | 'en';
}

export const ConnectFourHistoryModal: React.FC<ConnectFourHistoryModalProps> = ({ 
  isOpen = true, 
  onClose, 
  onPlayGame,
  lang = 'nl'
}) => {
  const [activeTab, setActiveTab] = useState<'rules' | 'tactics' | 'history'>('rules');

  if (isOpen === false) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border-2 border-amber-500/60 rounded-2xl max-w-3xl w-full max-h-[88vh] flex flex-col shadow-2xl font-sans text-xs">
        
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center gap-2 font-bold text-amber-300 text-sm">
            <HelpCircle className="w-5 h-5 text-amber-400" />
            <span>Vier op een Rij Masterclass (Milton Bradley 1974)</span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer border border-slate-700 font-bold"
          >
            ✕
          </button>
        </div>

        {/* Modal Tabs */}
        <div className="flex items-center gap-2 px-4 py-2 bg-slate-950 border-b border-slate-800">
          <button
            onClick={() => setActiveTab('rules')}
            className={`px-3 py-1.5 rounded-lg font-mono font-bold text-xs transition-colors cursor-pointer ${
              activeTab === 'rules' ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            📜 Spelregels &amp; Besturing
          </button>
          <button
            onClick={() => setActiveTab('tactics')}
            className={`px-3 py-1.5 rounded-lg font-mono font-bold text-xs transition-colors cursor-pointer ${
              activeTab === 'tactics' ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            🧠 Wiskunde &amp; Tactieken
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-3 py-1.5 rounded-lg font-mono font-bold text-xs transition-colors cursor-pointer ${
              activeTab === 'history' ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            ✨ Historie (Milton Bradley)
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-slate-300 leading-relaxed scrollbar-thin scrollbar-thumb-slate-700">
          {activeTab === 'rules' && (
            <div className="space-y-4 font-mono text-xs">
              <section className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2">
                <h4 className="font-bold text-amber-400 text-sm">🎯 Het Speeldoel</h4>
                <p>
                  Probeer als eerste <strong>4 fiches van jouw kleur op een ononderbroken rij</strong> te krijgen (horizontaal, verticaal of diagonaal) in het verticale blauwe kunststof raster.
                </p>
                <p className="text-[11px] text-slate-400">
                  • **Rood** (Jij) begint altijd eerste.<br />
                  • Fiches vallen door de zwaartekracht naar het onderste vrije vakje van de gekozen kolom.<br />
                  • Met de gele schuifbalk onderaan leeg je het raster in één keer met een klapperend geluid!
                </p>
              </section>

              <section className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2">
                <h4 className="font-bold text-cyan-400 text-sm">🎮 Besturing</h4>
                <p>
                  • **Muis / Touch**: Tik op of boven een kolom om je fiche te laten vallen.<br />
                  • **Toetsenbord**: Pijltjes links/rechts om kolom te kiezen, **Pijltje omlaag / Spatie / Enter** om te laten vallen.<br />
                  • **Gamepad**: D-pad of linker thumbstick om kolom te navigeren, **A-knop** om te laten vallen.
                </p>
              </section>
            </div>
          )}

          {activeTab === 'tactics' && (
            <div className="space-y-3 font-sans text-xs">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="font-bold text-amber-400 text-sm block">1. Domineer de Middelste Kolom (Kolom 4)</span>
                <p className="text-slate-300">
                  In Vier op een Rij kan een fiche in de middelste kolom deel uitmaken van maar liefst **13 verschillende winnende combinaties**! Beheers dus altijd het centrum.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="font-bold text-amber-400 text-sm block">2. Bouw een Dubbele Bedreiging (The Double Trap)</span>
                <p className="text-slate-300">
                  Zorg dat je twee open dreigingen van 3 fiches tegelijk creëert op verschillende plekken. De tegenstander kan maar 1 vakje per beurt blokkeren, waardoor winst gegarandeerd is!
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="font-bold text-amber-400 text-sm block">3. Pas op voor de Pariteitsregel (Even vs Oneven)</span>
                <p className="text-slate-300">
                  Als speler 1 (Rood) heb je voordeel bij winnende dreigingen op **oneven rijen** (rij 1, 3, 5). Speler 2 (Geel) heeft voordeel bij dreigingen op **even rijen**.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-3 font-sans text-xs">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="font-bold text-amber-400 text-sm block">🇺🇸 Howard Wexler &amp; Ned Strongin (1974)</span>
                <p className="text-slate-300">
                  Het iconische verticale spel werd bedacht door de speelgoedontwerpers Howard Wexler en Ned Strongin. Uitgever **Milton Bradley (MB)** bracht het in februari 1974 uit onder de naam *Connect Four* en in Nederland als *Vier op een Rij*.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="font-bold text-cyan-400 text-sm block">🧮 Wiskundig Opgelost Spel (First-Player Win)</span>
                <p className="text-slate-300">
                  In 1988 bewees de computerwetenschapper Victor Allis met behulp van AI dat Vier op een Rij een **opgelost spel** is: als speler 1 (Rood) perfect speelt en begint in de middelste kolom, wint Rood altijd in uiterlijk 41 beurten!
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
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-mono font-black text-xs cursor-pointer shadow-[0_0_15px_rgba(250,204,21,0.4)] transition-all flex items-center gap-2"
            >
              <span>🟡 {lang === 'nl' ? 'SPEEL VIER OP EEN RIJ' : 'PLAY CONNECT FOUR'}</span>
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
