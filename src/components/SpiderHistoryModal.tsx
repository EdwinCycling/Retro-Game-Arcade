/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, BookOpen, Brain, Play, HelpCircle, Layers, Award, ShieldAlert, Sparkles, CheckCircle } from 'lucide-react';
import { Language } from '../i18n/lobbyTranslations';

interface SpiderHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlayGame?: () => void;
  lang: Language;
}

export const SpiderHistoryModal: React.FC<SpiderHistoryModalProps> = ({
  isOpen,
  onClose,
  onPlayGame,
  lang,
}) => {
  const [activeTab, setActiveTab] = useState<'rules' | 'strategy' | 'history'>('rules');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-slate-900 border-2 border-indigo-600/50 rounded-3xl p-6 sm:p-8 text-slate-100 shadow-[0_0_50px_rgba(99,102,241,0.3)] font-sans">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5 border-b border-indigo-900/50 pb-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-2xl shadow-inner">
            🕷️
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-mono font-bold">
                1998 • MICROSOFT WINDOWS 98 PLUS!, ME &amp; XP
              </span>
              <span className="text-slate-400 text-xs font-mono">
                {lang === 'nl' ? 'SOLITAIRE MET 104 KAARTEN' : '104-CARD SOLITAIRE'}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-black text-indigo-300 mt-0.5">
              SPIDER SOLITAIRE
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              Complete Uitleg, Regels (1, 2 of 4 Kleuren) &amp; Winst-Strategieën
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 mb-6 border-b border-indigo-800/40 pb-2">
          <button
            onClick={() => setActiveTab('rules')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-mono text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'rules'
                ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20'
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
                ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20'
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
                ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>{lang === 'nl' ? '📖 Geschiedenis (Win98 / XP)' : '📖 History (Win98 / XP)'}</span>
          </button>
        </div>

        {/* TAB 1: RULES */}
        {activeTab === 'rules' && (
          <div className="space-y-5 text-sm leading-relaxed text-slate-300">
            {lang === 'nl' ? (
              <>
                <div className="bg-indigo-950/40 p-4 rounded-2xl border border-indigo-500/30">
                  <h3 className="font-bold text-indigo-300 text-base mb-1 flex items-center gap-2 font-mono">
                    <Award className="w-4 h-4" /> Het Doel van Spider Solitaire
                  </h3>
                  <p className="text-xs text-slate-200">
                    Het spel wordt gespeeld met <strong>104 kaarten</strong> (twee volledige kaartspellen). Het doel is om <strong>8 complete reeksen van Koning tot en met Aas van dezelfde kleur</strong> (K ➔ Q ➔ J ➔ 10 ➔ ... ➔ 2 ➔ A) op het speelbord te vormen. Zodra zo'n 13-delige reeks compleet is, verdwijnt hij automatisch naar de doelvakken!
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800">
                    <div className="font-bold text-amber-300 font-mono mb-1 flex items-center gap-1.5">
                      <Layers className="w-4 h-4" /> 1. De 3 Moeilijkheidsgraden
                    </div>
                    <ul className="list-disc pl-4 space-y-1.5 text-slate-300">
                      <li><strong>1 Kleur (Alleen Schoppen ♠):</strong> Ideaal voor beginners! Alle kaarten hebben hetzelfde symbool. Zeer ontspannend en bijna altijd op te lossen.</li>
                      <li><strong>2 Kleuren (Schoppen ♠ &amp; Harten ♥):</strong> Goede balans tussen uitdaging en tactiek.</li>
                      <li><strong>4 Kleuren (♠, ♥, ♦, ♣):</strong> De ultieme breinbreker voor echte meesters!</li>
                    </ul>
                  </div>

                  <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800">
                    <div className="font-bold text-cyan-300 font-mono mb-1 flex items-center gap-1.5">
                      <CheckCircle className="w-4 h-4" /> 2. Kaarten Verplaatsen
                    </div>
                    <ul className="list-disc pl-4 space-y-1 text-slate-300">
                      <li>Een kaart mag op elke kaart gelegd worden die <strong>precies 1 waarde hoger</strong> is (bijv. een 7 op een 8), ongeacht de kleur.</li>
                      <li><strong>Stapels verplaatsen:</strong> Een reeks kaarten kan alleen <em>samen</em> verplaatst worden als alle kaarten in de reeks van <strong>dezelfde kleur/symbool</strong> zijn én aflopend aansluiten!</li>
                      <li><strong>Lege kolommen:</strong> Een lege kolom mag gevuld worden met elke willekeurige kaart of geldige reeks.</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 text-xs space-y-1.5">
                  <div className="font-bold text-red-400 font-mono flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4" /> 3. De Trekstapel (5 Deelrondes van 10 Kaarten)
                  </div>
                  <p className="text-slate-300">
                    Rechtsonder ligt de trekstapel met 50 reservekaarten. Als je geen zetten meer kunt doen, klik je op de trekstapel om <strong>op elke kolom 1 nieuwe kaart</strong> neer te leggen (10 kaarten tegelijk).
                  </p>
                  <p className="text-amber-300 font-bold">
                    ⚠️ Belangrijke spelregel: In Spider Solitaire mag er GEEN enkele lege kolom zijn op het moment dat je deelt! Vul eerst eventuele lege gaten op.
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="bg-indigo-950/40 p-4 rounded-2xl border border-indigo-500/30">
                  <h3 className="font-bold text-indigo-300 text-base mb-1 flex items-center gap-2 font-mono">
                    <Award className="w-4 h-4" /> Object of Spider Solitaire
                  </h3>
                  <p className="text-xs text-slate-200">
                    Played with <strong>104 cards</strong> across 10 columns. Build 8 complete sequences from King down to Ace of the <strong>same suit</strong> to clear them from the board.
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
                <div className="bg-slate-950/80 p-4 rounded-2xl border border-indigo-500/30 space-y-3">
                  <h3 className="font-bold text-indigo-300 text-sm font-mono flex items-center gap-2">
                    <Brain className="w-4 h-4 text-indigo-400" /> 5 Gouden Regels voor Spider Solitaire:
                  </h3>
                  <div className="space-y-2 text-slate-300">
                    <div className="flex items-start gap-2">
                      <span className="font-mono font-bold text-amber-300 bg-amber-500/20 px-1.5 py-0.5 rounded">1</span>
                      <div><strong>Houd dezelfde kleur bij elkaar:</strong> Hoewel je een 5♥ op een 6♠ mág leggen, kun je die twee daarna nooit meer samen verplaatsen. Bouw altijd bij voorkeur reeksen van dezelfde kleur!</div>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="font-mono font-bold text-amber-300 bg-amber-500/20 px-1.5 py-0.5 rounded">2</span>
                      <div><strong>Creëer en bewaak lege kolommen:</strong> Een lege kolom is de sleutel tot succes in Spider. Je kunt hem tijdelijk gebruiken als wisselspoor om kaarten te sorteren.</div>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="font-mono font-bold text-amber-300 bg-amber-500/20 px-1.5 py-0.5 rounded">3</span>
                      <div><strong>Draai dichte kaarten open vóórdat je deelt:</strong> Haal alles uit het bord voordat je nieuwe kaarten uitdeelt. Elke nieuwe ronde van 10 kaarten bedekt je harde werk!</div>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="font-mono font-bold text-amber-300 bg-amber-500/20 px-1.5 py-0.5 rounded">4</span>
                      <div><strong>Begin met een Koning in een lege kolom:</strong> Heb je een lege kolom en een dichte reeks met een Koning bovenaan? Verplaats de Koning om de verborgen kaarten eronder te onthullen.</div>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="font-mono font-bold text-amber-300 bg-amber-500/20 px-1.5 py-0.5 rounded">5</span>
                      <div><strong>Gebruik Herstel (↺) slim:</strong> Twijfel je tussen twee zetten? Probeer er eentje, en als blijkt dat het doodloopt, neem je je zetten gewoon kosteloos terug!</div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="bg-slate-950/80 p-4 rounded-2xl border border-indigo-500/30 space-y-3">
                  <h3 className="font-bold text-indigo-300 text-sm font-mono flex items-center gap-2">
                    <Brain className="w-4 h-4 text-indigo-400" /> Spider Tactics:
                  </h3>
                  <p>Prioritize same-suit builds, uncover hidden cards before dealing from the stock, and cherish empty columns as temporary parking slots.</p>
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
                  <h3 className="text-base font-bold font-sans text-indigo-400 flex items-center gap-2 mb-2">
                    <BookOpen className="w-4 h-4" /> De Opmars van Spider Solitaire (1998 – 2001)
                  </h3>
                  <p>
                    Spider Solitaire verscheen voor het eerst in 1998 als onderdeel van het <em>Microsoft Plus! 98</em> uitbreidingspakket voor Windows 98. Het werd ontworpen door software-ontwikkelaar <strong>John A. Blackwood</strong>.
                  </p>
                  <p className="mt-2">
                    Toen Microsoft het spel in 2000 standaard meeleverde met <strong>Windows Millennium Edition (ME)</strong> en in 2001 met <strong>Windows XP</strong>, explodeerde de populariteit. Miljoenen kantoormedewerkers en studenten brachten ontelbare uren door met het sorteren van de 10 kolommen. Uit interne Microsoft-telemetrie bleek zelfs dat Spider Solitaire in het Windows XP-tijdperk vaker gespeeld werd dan het originele Patience (Klondike)!
                  </p>
                </div>

                <div className="bg-slate-950/70 p-4 rounded-xl border border-indigo-900/50 space-y-2">
                  <h4 className="text-xs font-mono font-bold text-indigo-300 uppercase tracking-wider">
                    Waarom heet het eigenlijk 'Spider'?
                  </h4>
                  <p className="text-xs text-slate-300">
                    De naam "Spider" verwijst naar de <strong>8 voltooide reeksen</strong> die je moet bouwen om te winnen — precies gelijk aan de <strong>8 poten van een spin</strong>!
                  </p>
                </div>
              </>
            ) : (
              <>
                <div>
                  <h3 className="text-base font-bold font-sans text-indigo-400 flex items-center gap-2 mb-2">
                    <BookOpen className="w-4 h-4" /> The History of Spider Solitaire
                  </h3>
                  <p>
                    Introduced in Microsoft Plus! 98 and later bundled into Windows ME and XP, Spider Solitaire was named after the 8 completed foundation piles, mimicking the 8 legs of a spider.
                  </p>
                </div>
              </>
            )}
          </div>
        )}

        {/* Footer Actions */}
        <div className="mt-6 pt-4 border-t border-indigo-900/50 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs transition-all cursor-pointer"
          >
            {lang === 'nl' ? 'Sluiten' : 'Close'}
          </button>
          {onPlayGame && (
            <button
              onClick={onPlayGame}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black font-mono text-xs shadow-lg shadow-indigo-500/20 transition-all cursor-pointer hover:scale-105 active:scale-95"
            >
              <Play className="w-4 h-4 fill-current" />
              {lang === 'nl' ? 'SPEEL SPIDER SOLITAIRE' : 'PLAY SPIDER SOLITAIRE'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
