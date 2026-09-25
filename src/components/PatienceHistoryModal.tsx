/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Sparkles, BookOpen, Award, CheckCircle, Brain, Play, HelpCircle, Layers, Flame, ArrowRight } from 'lucide-react';
import { Language } from '../i18n/lobbyTranslations';

interface PatienceHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlayGame?: () => void;
  lang: Language;
}

export const PatienceHistoryModal: React.FC<PatienceHistoryModalProps> = ({
  isOpen,
  onClose,
  onPlayGame,
  lang,
}) => {
  const [activeTab, setActiveTab] = useState<'rules' | 'history' | 'strategy'>('rules');

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
                1990 • WES CHERRY & SUSAN KARE • MICROSOFT WINDOWS 3.0 / 95
              </span>
              <span className="text-slate-400 text-xs font-mono">
                {lang === 'nl' ? 'KLASSIEK SOLITAIRE' : 'CLASSIC SOLITAIRE'}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-black text-emerald-300 mt-0.5">
              PATIENCE (KLONDIKE SOLITAIRE)
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              Complete Uitleg, Spelregels, Geschiedenis & Winst-Strategieën
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
            <span>{lang === 'nl' ? '📖 Geschiedenis & Oorsprong' : '📖 History & Origins'}</span>
          </button>
        </div>

        {/* TAB 1: RULES & HOW IT WORKS */}
        {activeTab === 'rules' && (
          <div className="space-y-5 text-sm leading-relaxed text-slate-300">
            {lang === 'nl' ? (
              <>
                <div className="bg-emerald-950/40 p-4 rounded-2xl border border-emerald-500/30">
                  <h3 className="font-bold text-emerald-300 text-base mb-1 flex items-center gap-2 font-mono">
                    <Award className="w-4 h-4" /> Het Doel van het Spel
                  </h3>
                  <p className="text-xs text-slate-200">
                    Sorteer alle <strong>52 speelkaarten</strong> op de <strong>4 basisstapels</strong> rechtsboven. Elke basisstapel begint met een <strong>Aas (A)</strong> en loopt op in dezelfde kleur en symbool tot en met de <strong>Koning (K)</strong> (A ➔ 2 ➔ 3 ➔ 4 ➔ ... ➔ Boer ➔ Vrouw ➔ Koning).
                  </p>
                </div>

                <div className="space-y-4">
                  <h4 className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">
                    De Opbouw van het Speelbord:
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800">
                      <div className="font-bold text-amber-300 font-mono mb-1 flex items-center gap-1.5">
                        <Layers className="w-4 h-4" /> 1. De 7 Kolommen (Het Tableau)
                      </div>
                      <p className="text-slate-300">
                        Hier bouw je reeksen in <strong>aflopende volgorde</strong> en <strong>afwisselende kleuren</strong>:
                      </p>
                      <ul className="list-disc pl-4 mt-1.5 space-y-1 text-slate-400">
                        <li>Rood (♥/♦) moet altijd op Zwart (♠/♣), en Zwart op Rood.</li>
                        <li>Bijvoorbeeld: een rode 9 ♥ mag op een zwarte 10 ♠.</li>
                        <li>Een <strong>lege kolom</strong> mag alleen worden gevuld met een <strong>Koning (K)</strong>!</li>
                      </ul>
                    </div>

                    <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800">
                      <div className="font-bold text-cyan-300 font-mono mb-1 flex items-center gap-1.5">
                        <Award className="w-4 h-4" /> 2. De 4 Basisstapels (Foundations)
                      </div>
                      <p className="text-slate-300">
                        Rechtsboven liggen de 4 doelvakken:
                      </p>
                      <ul className="list-disc pl-4 mt-1.5 space-y-1 text-slate-400">
                        <li>Start met een <strong>Aas</strong> van een symbool.</li>
                        <li>Bouw op in <strong>dezelfde kleur/symbool</strong> van laag naar hoog.</li>
                        <li><strong>Dubbelklik</strong> of klik op een open kaart om hem direct naar de juiste basisstapel te sturen!</li>
                      </ul>
                    </div>
                  </div>

                  <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 text-xs">
                    <div className="font-bold text-emerald-300 font-mono mb-1 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4" /> 3. De Trekstapel (Stock & Aflegstapel)
                    </div>
                    <p className="text-slate-300">
                      Als je vastzit op de kolommen, klik je linksboven op de dichte trekstapel:
                    </p>
                    <ul className="list-disc pl-4 mt-1.5 space-y-1 text-slate-400">
                      <li><strong>1 Kaart (Ontspannen):</strong> Draait 1 kaart open. Zeer eenvoudig en bijna altijd op te lossen.</li>
                      <li><strong>2 Kaarten (Huisregel):</strong> De bekende keukentafel-variant! Biedt een fijne balans tussen uitdaging en plezier.</li>
                      <li><strong>3 Kaarten (Vegas / Klassiek Win95):</strong> De officiële toernooistandard. Alleen de bovenste van de 3 kaarten is direct speelbaar.</li>
                    </ul>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="bg-emerald-950/40 p-4 rounded-2xl border border-emerald-500/30">
                  <h3 className="font-bold text-emerald-300 text-base mb-1 flex items-center gap-2 font-mono">
                    <Award className="w-4 h-4" /> Object of the Game
                  </h3>
                  <p className="text-xs text-slate-200">
                    Sort all <strong>52 playing cards</strong> into the <strong>4 foundation piles</strong> in the upper right. Each foundation starts with an <strong>Ace (A)</strong> and ascends in matching suit up to the <strong>King (K)</strong> (Ace ➔ 2 ➔ 3 ➔ ... ➔ Jack ➔ Queen ➔ King).
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800">
                      <div className="font-bold text-amber-300 font-mono mb-1">
                        1. The 7 Tableau Columns
                      </div>
                      <p className="text-slate-300">
                        Build columns descending in rank with <strong>alternating colors</strong> (red on black, black on red). Empty columns can only be filled by a <strong>King (K)</strong>.
                      </p>
                    </div>

                    <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800">
                      <div className="font-bold text-cyan-300 font-mono mb-1">
                        2. The 4 Foundations
                      </div>
                      <p className="text-slate-300">
                        Build each suit from Ace up to King. Double-click or click cards to send them quickly to foundations.
                      </p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* TAB 2: STRATEGY & TIPS */}
        {activeTab === 'strategy' && (
          <div className="space-y-4 text-xs leading-relaxed text-slate-300">
            {lang === 'nl' ? (
              <>
                <div className="bg-slate-950/80 p-4 rounded-2xl border border-emerald-500/30 space-y-3">
                  <h3 className="font-bold text-emerald-300 text-sm font-mono flex items-center gap-2">
                    <Brain className="w-4 h-4 text-emerald-400" /> 5 Gouden Regels om Vaker te Winnen:
                  </h3>
                  <div className="space-y-2.5 text-slate-300">
                    <div className="flex items-start gap-2">
                      <span className="font-mono font-bold text-amber-300 bg-amber-500/20 px-1.5 py-0.5 rounded">1</span>
                      <div>
                        <strong>Draai altijd eerst dichte kaarten in de kolommen open:</strong> Heb je de keuze tussen een kaart van de trekstapel of een dichte kaart op tafel? Kies altijd voor de dichte kaart op tafel!
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="font-mono font-bold text-amber-300 bg-amber-500/20 px-1.5 py-0.5 rounded">2</span>
                      <div>
                        <strong>Maak kolommen met veel dichte kaarten het eerst leeg:</strong> De kolommen aan de rechterkant (5, 6 en 7) hebben de meeste verborgen kaarten. Geef deze prioriteit.
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="font-mono font-bold text-amber-300 bg-amber-500/20 px-1.5 py-0.5 rounded">3</span>
                      <div>
                        <strong>Maak pas een kolom leeg als je een Koning hebt:</strong> Een lege plek is nutteloos als je geen Koning hebt om erin te leggen.
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="font-mono font-bold text-amber-300 bg-amber-500/20 px-1.5 py-0.5 rounded">4</span>
                      <div>
                        <strong>Kies de juiste Koning:</strong> Heb je een rode en zwarte Koning klaarstaan? Kijk welke Vrouw (Q) en Boer (J) je al in het spel hebt liggen voor je kiest.
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="font-mono font-bold text-amber-300 bg-amber-500/20 px-1.5 py-0.5 rounded">5</span>
                      <div>
                        <strong>Gebruik de Hint-knop (💡) en Ongedaan maken (↺):</strong> Zit je muurvast? Druk op <strong>Hint</strong> om slimme zetten te zien, of neem stappen terug om een andere afslag te proberen.
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="bg-slate-950/80 p-4 rounded-2xl border border-emerald-500/30 space-y-3">
                  <h3 className="font-bold text-emerald-300 text-sm font-mono flex items-center gap-2">
                    <Brain className="w-4 h-4 text-emerald-400" /> 5 Winning Strategies:
                  </h3>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>Always prioritize revealing face-down cards in the tableau before drawing from the stock.</li>
                    <li>Clear columns with the deepest face-down card stacks first (columns 6 and 7).</li>
                    <li>Do not empty a column unless you already hold a King to place in the empty spot.</li>
                    <li>Think ahead before choosing which colored King to place.</li>
                    <li>Use Undo and Hints without penalty to test branches.</li>
                  </ul>
                </div>
              </>
            )}
          </div>
        )}

        {/* TAB 3: HISTORY & ORIGINS */}
        {activeTab === 'history' && (
          <div className="space-y-5 text-sm leading-relaxed text-slate-300 font-serif">
            {lang === 'nl' ? (
              <>
                <div>
                  <h3 className="text-base font-bold font-sans text-emerald-400 flex items-center gap-2 mb-2">
                    <BookOpen className="w-4 h-4" /> De Geheime Geschiedenis van Windows Solitaire (1990)
                  </h3>
                  <p>
                    In de zomer van 1989 schreef <strong>Wes Cherry</strong>, een jonge stagiair bij Microsoft, in zijn vrije tijd een virtuele versie van het aloude kaartspel <em>Klondike Solitaire</em> (in Nederland en Vlaanderen beter bekend als <strong>Patience</strong>). Microsoft-graficus <strong>Susan Kare</strong> (bekend van de originele Macintosh-iconen) ontwierp de iconische 16-kleuren pixel-kaartensets en achterkanten zoals het strand met de palmboom, het spookkasteel en de hand met azen.
                  </p>
                </div>

                <div className="bg-slate-950/70 p-4 rounded-xl border border-emerald-900/50 space-y-2">
                  <h4 className="text-xs font-mono font-bold text-emerald-300 uppercase tracking-wider">
                    Het Geheime Doel: De Wereld Leren 'Slepen & Neerzetten'
                  </h4>
                  <p className="text-xs text-slate-300">
                    Microsoft besloot Patience standaard mee te leveren met <strong>Windows 3.0</strong> op 22 mei 1990. Het officiële doel was computerontspanning, maar het strategische hoofddoel was miljoenen kantoormedewerkers en thuisgebruikers vloeiend te leren omgaan met de computermuis: <em>klikken, dubbelklikken en drag-and-drop</em>!
                  </p>
                </div>
              </>
            ) : (
              <>
                <div>
                  <h3 className="text-base font-bold font-sans text-emerald-400 flex items-center gap-2 mb-2">
                    <BookOpen className="w-4 h-4" /> The Secret Origins of Windows Solitaire (1990)
                  </h3>
                  <p>
                    In the summer of 1989, Microsoft intern <strong>Wes Cherry</strong> wrote a digital implementation of <em>Klondike Solitaire</em> (traditionally called <strong>Patience</strong> in Europe) during slow work hours. Legendary pixel artist <strong>Susan Kare</strong> designed the iconic 16-color playing card faces and customizable card backs, including the sunny palm tree beach and spooky castle.
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
              {lang === 'nl' ? 'SPEEL PATIENCE' : 'PLAY SOLITAIRE'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
