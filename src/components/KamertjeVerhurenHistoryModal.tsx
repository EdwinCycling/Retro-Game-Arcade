/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Kamertje Verhuren (Dots and Boxes / La Pipopipette 1895) History & Tactics Dossier
 * Celebrating Édouard Lucas, Combinatorial Game Theory & Dutch Graph Paper School Nostalgia
 */

import React, { useState } from 'react';
import { 
  X, 
  BookOpen, 
  Play, 
  Sparkles, 
  Crown, 
  Lightbulb, 
  HelpCircle, 
  Target, 
  Layers, 
  GraduationCap 
} from 'lucide-react';
import { Language } from '../i18n/lobbyTranslations';

interface KamertjeVerhurenHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlayGame?: () => void;
  lang: Language;
}

type TabType = 'rules' | 'tactics' | 'math' | 'history';

export const KamertjeVerhurenHistoryModal: React.FC<KamertjeVerhurenHistoryModalProps> = ({
  isOpen,
  onClose,
  onPlayGame,
  lang
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('rules');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in font-sans">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-slate-900 border-2 border-amber-500/60 rounded-2xl shadow-2xl text-slate-100 overflow-hidden">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 text-slate-400 hover:text-white bg-slate-800/90 hover:bg-slate-700 rounded-xl transition-colors cursor-pointer border border-slate-700"
          aria-label="Sluiten"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="px-6 pt-6 pb-4 border-b border-amber-500/30 bg-gradient-to-r from-slate-950 via-slate-900 to-amber-950/40">
          <div className="flex items-center gap-4">
            <div className="p-3.5 bg-amber-950 border border-amber-500/60 rounded-2xl text-3xl shadow-[0_0_20px_rgba(245,158,11,0.3)]">
              📐
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/40 font-semibold">
                  ÉDOUARD LUCAS • 1895
                </span>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  RUITJESPAPIER NOSTALGIE
                </span>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  WISKUNDIGE SPELTHEORIE
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-wide text-white mt-1">
                KAMERTJE VERHUREN (DOTS &amp; BOXES)
              </h2>
              <p className="text-xs text-amber-400 font-mono">
                {lang === 'nl'
                  ? 'Van Wiskundeschrift tot Combinatorische Speltheorie • De Dubbele-Weggeefzet & Kettingreacties'
                  : 'From Graph Paper to Combinatorial Game Theory • The Double-Cross & Chain Reactions'}
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 mt-5 border-t border-slate-800/80 pt-3 overflow-x-auto scrollbar-none">
            <button
              onClick={() => setActiveTab('rules')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'rules'
                  ? 'bg-amber-500 text-slate-950 shadow-[0_0_12px_rgba(245,158,11,0.4)]'
                  : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>{lang === 'nl' ? '1. Spelregels & Doel' : '1. Rules & Objective'}</span>
            </button>

            <button
              onClick={() => setActiveTab('tactics')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'tactics'
                  ? 'bg-amber-500 text-slate-950 shadow-[0_0_12px_rgba(245,158,11,0.4)]'
                  : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
            >
              <Lightbulb className="w-4 h-4" />
              <span>{lang === 'nl' ? '2. De Dubbele-Weggeefzet' : '2. The Double-Cross'}</span>
            </button>

            <button
              onClick={() => setActiveTab('math')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'math'
                  ? 'bg-amber-500 text-slate-950 shadow-[0_0_12px_rgba(245,158,11,0.4)]'
                  : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>{lang === 'nl' ? '3. Wiskunde & Conway' : '3. Math & Game Theory'}</span>
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'history'
                  ? 'bg-amber-500 text-slate-950 shadow-[0_0_12px_rgba(245,158,11,0.4)]'
                  : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
            >
              <Crown className="w-4 h-4" />
              <span>{lang === 'nl' ? '4. Ruitjespapier Nostalgie' : '4. School Memories'}</span>
            </button>
          </div>
        </div>

        {/* Tab Content Container */}
        <div className="flex-grow overflow-y-auto p-6 space-y-6 text-sm text-slate-300 leading-relaxed scrollbar-thin scrollbar-thumb-slate-700">
          
          {/* TAB 1: SPELREGELS */}
          {activeTab === 'rules' && (
            <div className="space-y-5 animate-fade-in">
              <div className="bg-slate-950 border border-amber-500/30 rounded-2xl p-4.5 space-y-3">
                <h3 className="text-base font-bold text-amber-300 flex items-center gap-2">
                  <Target className="w-5 h-5 text-amber-400" />
                  <span>Het Eenvoudige maar Geniale Spelmechanisme</span>
                </h3>
                <p>
                  <strong>Kamertje Verhuren</strong> (ook wel <em>Stippenspel</em>, <em>Kameren</em> of internationaal <em>Dots and Boxes</em> genoemd) begint op een leeg rooster van stippen op ruitjespapier.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 text-xs font-mono">
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                    <span className="text-cyan-400 font-bold block">1. Een Lijntje Trekken</span>
                    <span>Spelers trekken om de beurt met hun balpen 1 horizontaal of verticaal lijntje tussen twee aangrenzende stippen.</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                    <span className="text-amber-400 font-bold block">2. Het 4e Lijntje Voltooien</span>
                    <span>Wie het 4e lijntje van een vierkantje tekent, &quot;verhuurt&quot; dat kamertje, schrijft zijn initiaal erin, scoort +1 punt én <strong>moet direct nog een beurt doen</strong>!</span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-blue-950/40 border border-blue-500/30 text-xs space-y-2">
                <span className="text-blue-300 font-bold text-sm block">⚡ Kettingreacties (Combos)</span>
                <p>
                  Omdat je na elk voltooid kamertje direct nog een zet mag doen, kan één enkel open kamertje leiden tot een gigantische kettingreactie waarin je in één beurt 5, 10 of zelfs 20 kamers achter elkaar binnenharkt!
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: TACTIEKEN & DE DUBBELE WEGGEEFZET */}
          {activeTab === 'tactics' && (
            <div className="space-y-5 animate-fade-in">
              <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/40 space-y-2">
                <h3 className="text-base font-bold text-amber-300 flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-amber-400" />
                  <span>De Beroemde &quot;Dubbele-Weggeefzet&quot; (Control Sacrifice)</span>
                </h3>
                <p className="text-xs text-slate-200">
                  De allergrootste wiskundige meesterzet in Kamertje Verhuren. Beginnende spelers pakken hebberig alle kamers in een ketting en moeten daarna noodgedwongen de volgende lange ketting openen voor de tegenstander. Grootmeesters doen iets heel anders!
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <span className="text-rose-400 font-bold block text-sm">❌ De Beginnersfout: Alles Opeten</span>
                  <p>
                    Stel: je mag een ketting van 6 kamers leeg-eten. Je pakt alle 6 de kamers. Vervolgens is het nog steeds jouw beurt, maar er zijn géén veilige lijntjes meer over. Je móét een nieuwe ketting van 12 kamers openbreken voor je tegenstander!
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <span className="text-emerald-400 font-bold block text-sm">✓ De Meesterzet: 2 Kamers Weggeven</span>
                  <p>
                    In plaats van alle 6 kamers te pakken, pak je er 4. Bij de laatste 2 kamers trek je de tussenlijn (de &quot;Double-Cross&quot;). Je geeft die 2 kamers cadeau aan de tegenstander, waardoor zíj aan de beurt komen en gedwongen zijn de volgende enorme ketting voor jóú te openen!
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: WISKUNDE & CONWAY */}
          {activeTab === 'math' && (
            <div className="space-y-4 text-xs animate-fade-in">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <h4 className="text-sm font-bold text-amber-300 flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-amber-400" />
                  <span>John Horton Conway &amp; &quot;Winning Ways&quot; (Nimstring)</span>
                </h4>
                <p>
                  In de jaren &apos;70 en &apos;80 analyseerden de wereldberoemde wiskundigen <strong>John Horton Conway</strong> en <strong>Elwyn Berlekamp</strong> Kamertje Verhuren in hun monumentale boek <em>Winning Ways for your Mathematical Plays</em>.
                </p>
                <p>
                  Zij bewezen dat het eindspel van Kamertje Verhuren een vorm van combinatorische speltheorie is (genaamd <em>Nimstring</em>). Door het aantal lange kettingen en lussen op het bord te tellen (even vs oneven) kan een ervaren wiskundige exact berekenen wie er gaat winnen vóórdat de kettingreacties beginnen!
                </p>
              </div>
            </div>
          )}

          {/* TAB 4: NOSTALGIE */}
          {activeTab === 'history' && (
            <div className="space-y-4 text-xs animate-fade-in">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <h4 className="text-sm font-bold text-cyan-300 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-cyan-400" />
                  <span>Ruitjespapier &amp; Balpennen in de Schoolbanken</span>
                </h4>
                <p>
                  In Nederland heeft vrijwel iedereen Kamertje Verhuren gespeeld. Tijdens saaie lessen wiskunde of aardrijkskunde, op regenachtige woensdagmiddagen of tijdens de pauze: een velletje 5mm ruitjespapier uit je schrift scheuren, een raster stippen tekenen en om de beurt met een blauwe of rode Bic-balpen lijntjes trekken!
                </p>
                <p>
                  Het spel werd oorspronkelijk in <strong>1895</strong> bedacht door de Franse wiskundige <strong>Édouard Lucas</strong> (bekend van de Lucas-rij en de Torens van Hanoi) onder de naam <em>La Pipopipette</em>.
                </p>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/90 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs font-mono text-slate-400">
            Édouard Lucas (1895) • La Pipopipette / Dots and Boxes
          </div>
          <div className="flex items-center gap-2.5">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs transition-colors cursor-pointer border border-slate-700"
            >
              {lang === 'nl' ? 'Sluiten' : 'Close'}
            </button>
            {onPlayGame && (
              <button
                onClick={() => {
                  onClose();
                  onPlayGame();
                }}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-mono font-bold text-xs shadow-[0_0_15px_#f59e0b] transition-colors cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{lang === 'nl' ? '✏️ SPEEL KAMERTJE VERHUREN' : '✏️ PLAY NOW'}</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
