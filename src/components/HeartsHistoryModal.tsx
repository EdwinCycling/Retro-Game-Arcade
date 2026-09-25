/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, BookOpen, Brain, Play, ShieldAlert, Award, HelpCircle, Layers, Flame, ArrowRight, Zap } from 'lucide-react';
import { Language } from '../i18n/lobbyTranslations';

interface HeartsHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlayGame?: () => void;
  lang: Language;
}

export const HeartsHistoryModal: React.FC<HeartsHistoryModalProps> = ({
  isOpen,
  onClose,
  onPlayGame,
  lang,
}) => {
  const [activeTab, setActiveTab] = useState<'rules' | 'strategy' | 'history'>('rules');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-slate-900 border-2 border-red-600/50 rounded-3xl p-6 sm:p-8 text-slate-100 shadow-[0_0_50px_rgba(239,68,68,0.3)] font-sans">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5 border-b border-red-900/50 pb-4">
          <div className="w-12 h-12 rounded-2xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-2xl shadow-inner">
            ❤️
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/30 text-[10px] font-mono font-bold">
                1992 • THE MICROSOFT HEARTS NETWORK • WINDOWS 3.11 & 95
              </span>
              <span className="text-slate-400 text-xs font-mono">
                {lang === 'nl' ? 'SLAG-KAARTSPEL' : 'TRICK-TAKING CARD GAME'}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-black text-red-400 mt-0.5">
              HARTENJAGEN (HEARTS)
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              Complete Uitleg, Regels, Michele/Ben/Paul & De Maan Schieten
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 mb-6 border-b border-red-800/40 pb-2">
          <button
            onClick={() => setActiveTab('rules')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-mono text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'rules'
                ? 'bg-red-500 text-white shadow-lg shadow-red-500/20'
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
                ? 'bg-red-500 text-white shadow-lg shadow-red-500/20'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>{lang === 'nl' ? '🌕 De Maan Schieten & Tips' : '🌕 Shoot the Moon & Tips'}</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-mono text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'history'
                ? 'bg-red-500 text-white shadow-lg shadow-red-500/20'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>{lang === 'nl' ? '📖 Geschiedenis (Win95)' : '📖 History (Win95)'}</span>
          </button>
        </div>

        {/* TAB 1: RULES & HOW IT WORKS */}
        {activeTab === 'rules' && (
          <div className="space-y-5 text-sm leading-relaxed text-slate-300">
            {lang === 'nl' ? (
              <>
                <div className="bg-red-950/40 p-4 rounded-2xl border border-red-500/30">
                  <h3 className="font-bold text-red-300 text-base mb-1 flex items-center gap-2 font-mono">
                    <Award className="w-4 h-4" /> Het Doel van Hartenjagen
                  </h3>
                  <p className="text-xs text-slate-200">
                    Het doel is om <strong>zo min mogelijk strafpunten</strong> te halen! Het spel eindigt zodra een speler <strong>100 punten</strong> bereikt. De speler met de <strong>laagste score</strong> wint het spel.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800">
                      <div className="font-bold text-amber-300 font-mono mb-1 flex items-center gap-1.5">
                        <Layers className="w-4 h-4" /> 1. Strafpunten Tellen
                      </div>
                      <ul className="list-disc pl-4 space-y-1.5 text-slate-300">
                        <li><strong>Elke Harten (♥):</strong> 1 strafpunt (er zijn 13 Harten = 13 punten).</li>
                        <li><strong>De Schoppenvrouw (♠Q):</strong> Maar liefst <strong>13 strafpunten</strong>!</li>
                        <li><em>Alle andere kaarten (Klaveren, Ruiten en overige Schoppen):</em> <strong>0 punten</strong>.</li>
                      </ul>
                    </div>

                    <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800">
                      <div className="font-bold text-cyan-300 font-mono mb-1 flex items-center gap-1.5">
                        <ArrowRight className="w-4 h-4" /> 2. Doorgifte-Fase (3 Kaarten)
                      </div>
                      <p className="text-slate-300">
                        Aan het begin van elke ronde kies je <strong>3 kaarten</strong> uit je hand om door te geven:
                      </p>
                      <ul className="list-disc pl-4 mt-1 space-y-1 text-slate-400">
                        <li><em>Ronde 1:</em> Naar <strong>Links</strong> (Michele)</li>
                        <li><em>Ronde 2:</em> Naar <strong>Rechts</strong> (Paul)</li>
                        <li><em>Ronde 3:</em> <strong>Oversteken</strong> (Ben)</li>
                        <li><em>Ronde 4:</em> <strong>Geen doorgifte</strong> (vasthouden)</li>
                      </ul>
                    </div>
                  </div>

                  <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 text-xs space-y-2">
                    <div className="font-bold text-red-400 font-mono flex items-center gap-1.5">
                      <ShieldAlert className="w-4 h-4" /> 3. Hoe Verloopt een Slag?
                    </div>
                    <ul className="list-disc pl-4 space-y-1.5 text-slate-300">
                      <li><strong>De Eerste Slag:</strong> De speler met <strong>Klaveren 2 (♣2)</strong> móét altijd de eerste slag openen.</li>
                      <li><strong>Geen Punten in Slag 1:</strong> In de allereerste slag mag niemand een Harten of de Schoppenvrouw spelen.</li>
                      <li><strong>Kleur Bekennen:</strong> Je bent verplicht de gevraagde kleur bij te spelen als je die hebt. Heb je de kleur niet? Dan mag je <em>elke willekeurige kaart</em> afleggen (ideaal om strafpunten bij een ander te dumpen!).</li>
                      <li><strong>Wie wint de slag?</strong> De hoogste kaart van de uitgekomen kleur wint de 4 kaarten en mag de volgende slag beginnen.</li>
                      <li><strong>Harten Breken:</strong> Je mag pas een slag beginnen met een Harten zodra iemand in een eerdere slag een Harten heeft bijgespeeld (harten 'gebroken').</li>
                    </ul>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="bg-red-950/40 p-4 rounded-2xl border border-red-500/30">
                  <h3 className="font-bold text-red-300 text-base mb-1 flex items-center gap-2 font-mono">
                    <Award className="w-4 h-4" /> Object of Hearts
                  </h3>
                  <p className="text-xs text-slate-200">
                    The objective is to finish the game with the <strong>lowest score</strong>. When any player reaches 100 points, the game ends and the player with the lowest score wins!
                  </p>
                </div>
              </>
            )}
          </div>
        )}

        {/* TAB 2: SHOOT THE MOON & TIPS */}
        {activeTab === 'strategy' && (
          <div className="space-y-4 text-xs leading-relaxed text-slate-300">
            {lang === 'nl' ? (
              <>
                <div className="bg-gradient-to-r from-red-950 via-purple-950 to-slate-950 p-4 rounded-2xl border border-red-500/40 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🚀🌕</span>
                    <h3 className="font-bold text-amber-300 text-sm font-mono">
                      De Meesterzet: 'De Maan Schieten' (Shoot the Moon)
                    </h3>
                  </div>
                  <p className="text-slate-300">
                    Normaal gesproken wil je geen enkele strafkaart pakken. Maar als je erin slaagt om <strong>áren álle 13 Harten én de Schoppenvrouw</strong> in één ronde te verzamelen (alle 26 punten):
                  </p>
                  <div className="p-3 bg-black/60 rounded-xl border border-amber-500/30 font-mono text-amber-200">
                    ✨ <strong>Jij krijgt 0 strafpunten</strong> en <strong>Michele, Ben en Paul krijgen ELK +26 strafpunten!</strong>
                  </div>
                </div>

                <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 space-y-2.5">
                  <h3 className="font-bold text-cyan-300 text-xs font-mono flex items-center gap-1.5">
                    <Brain className="w-4 h-4 text-cyan-400" /> Strategische Tips voor Beginners & Gevorderden:
                  </h3>
                  <ul className="list-disc pl-4 space-y-1.5 text-slate-300">
                    <li><strong>Geef gevaarlijke hoge Schoppen door:</strong> Als je de Schoppen Aas (♠A) of Koning (♠K) hebt zonder veel kleine schoppen om je te beschermen, geef ze dan door tijdens de doorgiftefase!</li>
                    <li><strong>Raak een kleur snel kwijt (Void):</strong> Probeer één kleur (bijv. Ruiten of Klaveren) zo snel mogelijk helemaal leeg te spelen. Zodra iemand die kleur uitkomt, kun jij strafkaarten dumpen!</li>
                    <li><strong>Pas op voor de Schoppenvrouw:</strong> Speel geen hoge Schoppen tenzij je zeker weet dat de Vrouw al gevallen is.</li>
                    <li><strong>Blokkeer een Maanschot:</strong> Merk je dat één tegenspeler alle slagen met Harten aan het binnenharken is? Offer dan bewust een hoge kaart op om één Harten te pakken en hun Maanschot te dwarsbomen!</li>
                  </ul>
                </div>
              </>
            ) : (
              <>
                <div className="bg-slate-950/80 p-4 rounded-2xl border border-red-500/30 space-y-3">
                  <h3 className="font-bold text-red-300 text-sm font-mono flex items-center gap-2">
                    <Zap className="w-4 h-4 text-red-400" /> Shoot the Moon & Tactics
                  </h3>
                  <p>
                    Capturing all 13 Hearts and the Queen of Spades yields 0 points to you and 26 penalty points to all 3 rivals.
                  </p>
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
                  <h3 className="text-base font-bold font-sans text-red-400 flex items-center gap-2 mb-2">
                    <BookOpen className="w-4 h-4" /> De Oorsprong van The Microsoft Hearts Network (1992)
                  </h3>
                  <p>
                    In het najaar van 1992 lanceerde Microsoft <strong>Windows for Workgroups 3.11</strong>. Om bedrijven te overtuigen van de kracht van lokale netwerken (LAN) en <em>Network DDE (Dynamic Data Exchange)</em>, bouwde ontwikkelaar Richard Rimac <em>The Microsoft Hearts Network</em>. 
                  </p>
                  <p className="mt-2">
                    Als er geen collega's op kantoor beschikbaar waren om via het netwerk te spelen, sprongen de drie legendarische computergestuurde bots bij: <strong>Michele, Ben en Paul</strong> (vernoemd naar echte medewerkers op de Microsoft-campus!).
                  </p>
                </div>

                <div className="bg-slate-950/70 p-4 rounded-xl border border-red-900/50 space-y-2">
                  <h4 className="text-xs font-mono font-bold text-red-300 uppercase tracking-wider">
                    Waarom Hartenjagen zo verslavend werd
                  </h4>
                  <p className="text-xs text-slate-300">
                    Waar Patience vooral een ontspannende individuele puzzel was, bracht Hartenjagen intense psychologische spanning: tegenspelers pesten met de Schoppenvrouw en de bloedstollende jacht op <em>De Maan Schieten</em>.
                  </p>
                </div>
              </>
            ) : (
              <>
                <div>
                  <h3 className="text-base font-bold font-sans text-red-400 flex items-center gap-2 mb-2">
                    <BookOpen className="w-4 h-4" /> The Secret Purpose of The Microsoft Hearts Network (1992)
                  </h3>
                  <p>
                    Released in autumn 1992 with <strong>Windows for Workgroups 3.11</strong> and later bundled with Windows 95, <em>The Microsoft Hearts Network</em> was engineered to showcase peer-to-peer office networking.
                  </p>
                </div>
              </>
            )}
          </div>
        )}

        {/* Footer Actions */}
        <div className="mt-6 pt-4 border-t border-red-900/50 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs transition-all cursor-pointer"
          >
            {lang === 'nl' ? 'Sluiten' : 'Close'}
          </button>
          {onPlayGame && (
            <button
              onClick={onPlayGame}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-black font-mono text-xs shadow-lg shadow-red-500/20 transition-all cursor-pointer hover:scale-105 active:scale-95"
            >
              <Play className="w-4 h-4 fill-current" />
              {lang === 'nl' ? 'SPEEL HARTENJAGEN' : 'PLAY HEARTS'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
