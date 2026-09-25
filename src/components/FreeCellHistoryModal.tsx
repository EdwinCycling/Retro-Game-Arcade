/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, BookOpen, Brain, Play, ShieldAlert, Award, HelpCircle, Layers, Flame, ArrowRight, Zap, Hash } from 'lucide-react';
import { Language } from '../i18n/lobbyTranslations';

interface FreeCellHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlayGame?: () => void;
  lang: Language;
}

export const FreeCellHistoryModal: React.FC<FreeCellHistoryModalProps> = ({
  isOpen,
  onClose,
  onPlayGame,
  lang,
}) => {
  const [activeTab, setActiveTab] = useState<'rules' | 'strategy' | 'history'>('rules');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-slate-900 border-2 border-emerald-600/50 rounded-3xl p-6 sm:p-8 text-slate-100 shadow-[0_0_50px_rgba(16,185,129,0.3)] font-sans">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5 border-b border-emerald-900/50 pb-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center text-2xl shadow-inner">
            🃏
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono font-bold">
                1991 • PAUL ALAN SCHULTZ • WINDOWS 3.1 & 95 ENTERTAINMENT PACK
              </span>
              <span className="text-slate-400 text-xs font-mono">
                {lang === 'nl' ? 'LOGISCH SOLITAIRE' : 'LOGIC SOLITAIRE'}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-black text-emerald-300 mt-0.5">
              FREECELL
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              Complete Uitleg, Regels, Spelnummers #1 t/m #32.000 & Winst-Strategieën
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 mb-6 border-b border-emerald-800/40 pb-2">
          <button
            onClick={() => setActiveTab('rules')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-mono text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'rules'
                ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>{lang === 'nl' ? '🎯 Spelregels & Hoe het werkt' : '🎯 How to Play & Rules'}</span>
          </button>

          <button
            onClick={() => setActiveTab('strategy')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-mono text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'strategy'
                ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Brain className="w-4 h-4" />
            <span>{lang === 'nl' ? '💡 Tips & Winst-Strategie' : '💡 Tips & Strategy'}</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-mono text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'history'
                ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>{lang === 'nl' ? '📖 Geschiedenis & Spel #11982' : '📖 History & Game #11982'}</span>
          </button>
        </div>

        {/* TAB 1: RULES */}
        {activeTab === 'rules' && (
          <div className="space-y-5 text-sm leading-relaxed text-slate-300">
            {lang === 'nl' ? (
              <>
                <div className="bg-emerald-950/40 p-4 rounded-2xl border border-emerald-500/30">
                  <h3 className="font-bold text-emerald-300 text-base mb-1 flex items-center gap-2 font-mono">
                    <Award className="w-4 h-4" /> Het Doel van FreeCell
                  </h3>
                  <p className="text-xs text-slate-200">
                    Bijna <strong>elk FreeCell spel is 100% wiskundig op te lossen</strong>! Sorteer alle 52 openliggende kaarten naar de 4 basisstapels van <strong>Aas t/m Koning</strong> per symbool (♣, ♦, ♥, ♠).
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800">
                    <div className="font-bold text-amber-300 font-mono mb-1 flex items-center gap-1.5">
                      <Layers className="w-4 h-4" /> 1. Vrije Vakken (Free Cells)
                    </div>
                    <p className="text-slate-300">
                      Linksboven heb je <strong>4 tijdelijke parkeervakken</strong>. Elk vak kan exact <strong>1 kaart</strong> vasthouden. Hoe meer vakken leeg zijn, hoe groter de stapels kaarten die je in één keer kunt verplaatsen!
                    </p>
                  </div>

                  <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800">
                    <div className="font-bold text-cyan-300 font-mono mb-1 flex items-center gap-1.5">
                      <ArrowRight className="w-4 h-4" /> 2. De 8 Kolommen (Cascades)
                    </div>
                    <p className="text-slate-300">
                      Bouw kaarten afwisselend in <strong>aflopende volgorde en tegengestelde kleur</strong> (bijv. rode 8 op zwarte 9). Lege kolommen mogen door elke willekeurige kaart worden gevuld.
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="bg-emerald-950/40 p-4 rounded-2xl border border-emerald-500/30">
                  <h3 className="font-bold text-emerald-300 text-base mb-1 flex items-center gap-2 font-mono">
                    <Award className="w-4 h-4" /> Object of FreeCell
                  </h3>
                  <p className="text-xs text-slate-200">
                    Nearly <strong>100% of FreeCell deals are solvable</strong>! Move all 52 cards to the 4 foundation piles from Ace up to King by suit.
                  </p>
                </div>
              </>
            )}
          </div>
        )}

        {/* TAB 2: STRATEGY */}
        {activeTab === 'strategy' && (
          <div className="space-y-4 text-xs leading-relaxed text-slate-300">
            {lang === 'nl' ? (
              <>
                <div className="bg-slate-950/80 p-4 rounded-2xl border border-emerald-500/30 space-y-3">
                  <h3 className="font-bold text-emerald-300 text-sm font-mono flex items-center gap-2">
                    <Brain className="w-4 h-4 text-emerald-400" /> 5 Gouden Regels voor 100% Winst:
                  </h3>
                  <div className="space-y-2 text-slate-300">
                    <div className="flex items-start gap-2">
                      <span className="font-mono font-bold text-amber-300 bg-amber-500/20 px-1.5 py-0.5 rounded">1</span>
                      <div><strong>Houd de Vrije Vakken zo lang mogelijk leeg:</strong> Gebruik ze alleen voor noodopslag. Zodra alle 4 vakken vol zijn, zit je bewegingsvrijheid vast.</div>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="font-mono font-bold text-amber-300 bg-amber-500/20 px-1.5 py-0.5 rounded">2</span>
                      <div><strong>Bevrijd Azen en 2'en zo snel mogelijk:</strong> Hoe sneller de lage kaarten naar de basisstapels kunnen, hoe meer ruimte je krijgt.</div>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="font-mono font-bold text-amber-300 bg-amber-500/20 px-1.5 py-0.5 rounded">3</span>
                      <div><strong>Probeer minstens één kolom leeg te maken:</strong> Een lege kolom is veel waardevoller dan een vrij vak, omdat je er hele reeksen in kunt opbouwen.</div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="bg-slate-950/80 p-4 rounded-2xl border border-emerald-500/30 space-y-3">
                  <h3 className="font-bold text-emerald-300 text-sm font-mono flex items-center gap-2">
                    <Brain className="w-4 h-4 text-emerald-400" /> Winning Tactics:
                  </h3>
                  <p>Keep free cells empty as long as possible and prioritize freeing Aces early.</p>
                </div>
              </>
            )}
          </div>
        )}

        {/* TAB 3: HISTORY */}
        {activeTab === 'history' && (
          <div className="space-y-5 text-sm leading-relaxed text-slate-300 font-serif">
            {lang === 'nl' ? (
              <>
                <div>
                  <h3 className="text-base font-bold font-sans text-emerald-400 flex items-center gap-2 mb-2">
                    <BookOpen className="w-4 h-4" /> De Legende van Spel #11982
                  </h3>
                  <p>
                    In 1991 schreef <strong>Paul Alan Schultz</strong> de Windows 3.11/95 versie van FreeCell. De software genereerde met een pseudo-willekeurige formule 32.000 unieke spellen.
                  </p>
                  <p className="mt-2">
                    Eind jaren '90 startten duizenden wiskundigen en gamers het internetproject <em>The Internet FreeCell Project</em> om alle 32.000 spellen op te lossen. Ze ontdekten dat er van de 32.000 spellen exact <strong>één enkel spel onoplosbaar is: Spel #11982</strong>!
                  </p>
                </div>
              </>
            ) : (
              <>
                <div>
                  <h3 className="text-base font-bold font-sans text-emerald-400 flex items-center gap-2 mb-2">
                    <BookOpen className="w-4 h-4" /> The Legend of Game #11982
                  </h3>
                  <p>
                    Out of Microsoft's original 32,000 generated deals, crowdsourced testing proved that exactly <strong>one deal is mathematically unsolvable: Deal #11982</strong>!
                  </p>
                </div>
              </>
            )}
          </div>
        )}

        {/* Footer Actions */}
        <div className="mt-6 pt-4 border-t border-emerald-900/50 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs transition-all cursor-pointer"
          >
            {lang === 'nl' ? 'Sluiten' : 'Close'}
          </button>
          {onPlayGame && (
            <button
              onClick={onPlayGame}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black font-mono text-xs shadow-lg shadow-emerald-500/20 transition-all cursor-pointer hover:scale-105 active:scale-95"
            >
              <Play className="w-4 h-4 fill-current" />
              {lang === 'nl' ? 'SPEEL FREECELL' : 'PLAY FREECELL'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
