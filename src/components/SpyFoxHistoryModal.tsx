/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Spy Fox in "Dry Cereal" (1997, Humongous Entertainment / Ron Gilbert)
 * Historical Dossier & Technical Retrospective Modal
 */

import React, { useState } from 'react';
import { X, Shield, Cpu, History, Sparkles, BookOpen, Key, Disc, Play } from 'lucide-react';

interface SpyFoxHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlay?: () => void;
}

export const SpyFoxHistoryModal: React.FC<SpyFoxHistoryModalProps> = ({
  isOpen,
  onClose,
  onPlay
}) => {
  const [activeTab, setActiveTab] = useState<'history' | 'scumm' | 'gadgets' | 'nl_cast'>('history');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-slate-950 border-2 border-sky-500/80 rounded-2xl shadow-[0_0_50px_rgba(56,189,248,0.35)] flex flex-col overflow-hidden text-neutral-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-sky-900/60 bg-gradient-to-r from-sky-950/90 via-slate-900 to-indigo-950/90">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/20 border border-sky-500/60 flex items-center justify-center text-2xl shadow-[0_0_15px_rgba(56,189,248,0.5)]">
              🦊
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black font-sans tracking-wide text-sky-200 flex items-center gap-2">
                <span>SPY FOX IN "DRY CEREAL"</span>
                <span className="text-xs px-2 py-0.5 rounded bg-sky-900/80 text-sky-300 border border-sky-600 font-mono">
                  1997
                </span>
              </h2>
              <p className="text-xs font-mono text-cyan-400">
                Operatie Melkzuur • Humongous Entertainment • Ron Gilbert
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-sky-900/40 bg-slate-950/80 px-4 gap-2 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`py-3 px-3 text-xs sm:text-sm font-semibold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'history'
                ? 'border-sky-400 text-sky-300 bg-sky-950/30'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Historisch Dossier</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('scumm')}
            className={`py-3 px-3 text-xs sm:text-sm font-semibold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'scumm'
                ? 'border-sky-400 text-sky-300 bg-sky-950/30'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Cpu className="w-4 h-4" />
            <span>SCUMM Engine Tech</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('gadgets')}
            className={`py-3 px-3 text-xs sm:text-sm font-semibold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'gadgets'
                ? 'border-sky-400 text-sky-300 bg-sky-950/30'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Spionage Gadgets (SPY Corp)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('nl_cast')}
            className={`py-3 px-3 text-xs sm:text-sm font-semibold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'nl_cast'
                ? 'border-sky-400 text-sky-300 bg-sky-950/30'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>NL Nasynchronisatie & Trivia</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 text-sm leading-relaxed">
          {activeTab === 'history' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-sky-950/40 border border-sky-800/60">
                <h3 className="font-bold text-sky-300 text-base mb-1">
                  De Geheime Agent in Witte Smoking (1997)
                </h3>
                <p className="text-slate-300 text-xs sm:text-sm">
                  Na zijn vertrek bij LucasArts richtte legendarisch game designer <strong>Ron Gilbert</strong> (de architect achter <em>The Secret of Monkey Island</em> en <em>Maniac Mansion</em>) samen met Shelley Day in 1992 <strong>Humongous Entertainment</strong> op. Na wereldsuccessen met Putt-Putt en Freddi Fish wilde Gilbert een meer volwassen, satirische spionagetitel maken die zowel kinderen als volwassenen betoverde: <strong>Spy Fox</strong>.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="text-sky-400 font-bold mb-1 flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    <span>De Melkcrisis op Acidophilus</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Het kwaadaardige meesterbrein <strong>William the Kid</strong> (een geit met een megalomane hekel aan koeienmelk) heeft alle melkvoorraden van de wereld gekaapt. Hij wil de wereldbevolking dwingen om zijn walgelijke geitenmelk te drinken. Aan Spy Fox de taak om met geheime agent gadgets de melkwapens te saboteren!
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="text-sky-400 font-bold mb-1 flex items-center gap-2">
                    <Disc className="w-4 h-4" />
                    <span>Niet-Lineaire Puzzelpaden</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Humongous Entertainment pionierde met dynamische puzzelbomen: bij elke nieuwe speelsessie koos de game willekeurige routes, sleutels en personagedialogen. Hierdoor was geen enkele walkthrough hetzelfde en bleef de herspeelwaarde fenomenaal hoog.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'scumm' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-900 border border-sky-800/50">
                <h3 className="font-bold text-sky-300 text-base mb-1">
                  Het SCUMM & SPUTM Framework
                </h3>
                <p className="text-xs sm:text-sm text-slate-300">
                  Spy Fox draaide op een geavanceerde variant van de legendarische <strong>SCUMM</strong>-engine (<em>Script Creation Utility for Maniac Mansion</em>), intern vaak <strong>SPUTM</strong> genoemd. Hiermee combineerde Humongous handgetekende animaties, meervoudige verhaallijnen en een gestroomlijnde point-and-click interface.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="font-bold text-sky-400 block mb-1">VGA 256 Kleuren</span>
                  <p className="text-slate-400">Gedetailleerde 320×200 resolutie met rijke tekenfilmstijl animatiecellen en handgeschilderde Griekse achtergronden.</p>
                </div>
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="font-bold text-sky-400 block mb-1">Interactive Audio</span>
                  <p className="text-slate-400">Funky jazz-composities in James Bond-stijl die dynamisch meebewegen met de actie en gevaarlijke situaties.</p>
                </div>
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="font-bold text-sky-400 block mb-1">Smart Cursor</span>
                  <p className="text-slate-400">De iconische vergrootglas-cursor licht automatisch op bij interactieve hotspots en personages in de scène.</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'gadgets' && (
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-start gap-3">
                <div className="text-2xl">⌚</div>
                <div>
                  <h4 className="font-bold text-sky-300 text-sm">SPY Watch (Polshorloge Communicator)</h4>
                  <p className="text-xs text-slate-400">Directe videoverbinding met Monkey Penny in het SPY Corp hoofdkwartier voor strategische inlichtingen en missie-updates.</p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-start gap-3">
                <div className="text-2xl">🔦</div>
                <div>
                  <h4 className="font-bold text-sky-300 text-sm">Laser-Tandenstoker (Laser Toothpick)</h4>
                  <p className="text-xs text-slate-400">Een discreet zakinstrument van professor Quack waarmee Spy Fox door dikke stalen kluizen, tralies en sloten kan snijden.</p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-start gap-3">
                <div className="text-2xl">🪙</div>
                <div>
                  <h4 className="font-bold text-sky-300 text-sm">Spionagemunten (SPY Coins)</h4>
                  <p className="text-xs text-slate-400">Speciale valuta om spionage-automaat gadgets aan te schaffen en geheime informanten in de Cantina om te kopen.</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'nl_cast' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-sky-950/40 border border-sky-800/60">
                <h3 className="font-bold text-sky-300 text-base mb-1">
                  Legendarische Nederlandse Stemmencast
                </h3>
                <p className="text-slate-300 text-xs sm:text-sm">
                  In Nederland werd Spy Fox uitgebracht door <strong>TransTrans</strong> met een fenomenale cast van top-stemacteurs. <strong>Jan Nonhof</strong> sprak de stem in van Spy Fox met een onvergetelijke, droge gentleman-stem. Fred Meijer sprak schurk William the Kid in, en Beatrijs Sluijter vertolkte Monkey Penny.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-400 space-y-2">
                <div className="flex justify-between border-b border-slate-800 pb-1">
                  <span className="font-bold text-slate-200">Spy Fox:</span>
                  <span className="text-sky-300 font-mono">Jan Nonhof</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-1">
                  <span className="font-bold text-slate-200">William the Kid:</span>
                  <span className="text-sky-300 font-mono">Fred Meijer</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-1">
                  <span className="font-bold text-slate-200">Monkey Penny:</span>
                  <span className="text-sky-300 font-mono">Beatrijs Sluijter</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-bold text-slate-200">Professor Quack:</span>
                  <span className="text-sky-300 font-mono">Stan Limburg</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-sky-900/60 bg-slate-950 flex items-center justify-between">
          <div className="text-xs text-slate-500 font-mono">
            VGA 320×200 • SCUMM Engine Re-creation
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
            >
              Sluiten
            </button>
            {onPlay && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onPlay();
                }}
                className="px-5 py-2 text-xs font-bold rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 flex items-center gap-2 shadow-[0_0_20px_rgba(56,189,248,0.5)] cursor-pointer transition-all"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Speel Spy Fox Nu</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
