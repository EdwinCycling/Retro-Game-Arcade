/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * King's Quest I (1984, IBM PC / PCjr / Sierra On-Line)
 * Historical Dossier & Technical Retrospective Modal
 */

import React, { useState } from 'react';
import { X, Crown, Cpu, History, Sparkles, BookOpen, Key, Disc } from 'lucide-react';

interface KingsQuestHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlay?: () => void;
}

export const KingsQuestHistoryModal: React.FC<KingsQuestHistoryModalProps> = ({
  isOpen,
  onClose,
  onPlay
}) => {
  const [activeTab, setActiveTab] = useState<'history' | 'ibmpc' | 'agi' | 'riddles'>('history');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-neutral-900 border-2 border-amber-500/80 rounded-2xl shadow-[0_0_50px_rgba(245,158,11,0.35)] flex flex-col overflow-hidden text-neutral-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-neutral-800 bg-gradient-to-r from-blue-950/80 via-neutral-900 to-amber-950/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/60 flex items-center justify-center text-2xl shadow-[0_0_15px_rgba(245,158,11,0.5)]">
              👑
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black font-serif tracking-wider text-amber-200 flex items-center gap-2">
                <span>KING’S QUEST I</span>
                <span className="text-xs px-2 py-0.5 rounded bg-amber-900/80 text-amber-300 border border-amber-700 font-mono">
                  1984
                </span>
              </h2>
              <p className="text-xs font-mono text-cyan-400">
                Quest for the Crown • Roberta & Ken Williams • IBM PC / PCjr
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-neutral-800 bg-neutral-950/60 px-4 gap-2 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`py-3 px-3 sm:px-4 text-xs sm:text-sm font-semibold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'history'
                ? 'border-amber-500 text-amber-400 bg-amber-500/10'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Geschiedenis (1984)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('ibmpc')}
            className={`py-3 px-3 sm:px-4 text-xs sm:text-sm font-semibold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'ibmpc'
                ? 'border-cyan-500 text-cyan-400 bg-cyan-500/10'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Cpu className="w-4 h-4" />
            <span>IBM PC & PCjr Deal</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('agi')}
            className={`py-3 px-3 sm:px-4 text-xs sm:text-sm font-semibold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'agi'
                ? 'border-green-500 text-green-400 bg-green-500/10'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Disc className="w-4 h-4" />
            <span>AGI Engine Revolutie</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('riddles')}
            className={`py-3 px-3 sm:px-4 text-xs sm:text-sm font-semibold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'riddles'
                ? 'border-purple-500 text-purple-400 bg-purple-500/10'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Key className="w-4 h-4" />
            <span>Het Beroemde Kabouter-Raadsel</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 text-xs sm:text-sm text-neutral-300 leading-relaxed font-sans">
          {activeTab === 'history' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-500/30">
                <h3 className="font-bold text-amber-300 text-base mb-1 flex items-center gap-2">
                  <Crown className="w-4 h-4 text-amber-400" />
                  De Geboorte van de Grafische Adventure Game
                </h3>
                <p>
                  In 1983 benaderde computerreus <strong>IBM</strong> het echtpaar Ken en Roberta Williams van <strong>Sierra On-Line</strong>. IBM stond op het punt hun gloednieuwe homecomputer te lanceren: de <strong>IBM PCjr</strong>. IBM wilde een adembenemende "killer app" die bewees wat homecomputers in huis hadden: 16 gelijktijdige kleuren en een geavanceerde 3-stemmige geluidschip.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                <div className="p-3.5 rounded-xl bg-neutral-800/80 border border-neutral-700">
                  <h4 className="font-bold text-neutral-100 mb-1">Roberta Williams' Visie</h4>
                  <p className="text-neutral-300">
                    Roberta wilde afstappen van statische tekst-adventures. Ze creëerde een levende sprookjeswereld waarin Sir Graham vrij in pseudo-3D kon rondwandelen, vóór en achter bomen langs, terwijl de speler natuurlijke commando’s intypte via het toetsenbord.
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-neutral-800/80 border border-neutral-700">
                  <h4 className="font-bold text-neutral-100 mb-1">De 3 Verloren Schatten</h4>
                  <p className="text-neutral-300">
                    Koning Edward van Daventry ligt op sterven en heeft geen erfgenaam. De ridder Graham moet drie legendarische relikwieën terughalen: de Magische Spiegel van de Rode Draak, het Magische Schild van de Wolkenreus, en de Magische Schatkist van de Kobolden.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'ibmpc' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-cyan-950/30 border border-cyan-500/30">
                <h3 className="font-bold text-cyan-300 text-base mb-1 flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-cyan-400" />
                  Miljoenendeal met IBM & 128KB Geheugengrens
                </h3>
                <p>
                  IBM investeerde destijds $850.000 in Sierra om de game te ontwikkelen—een ongekend bedrag voor 1983. Ken Williams leidde een team van zes programmeurs die 18 maanden non-stop werkten om een engine te bouwen die op een systeem met slechts <strong>128 KB RAM</strong> en één enkele 360 KB 5.25-inch diskette paste!
                </p>
              </div>

              <div className="p-4 rounded-xl bg-neutral-800/80 border border-neutral-700 space-y-2">
                <h4 className="font-bold text-neutral-100">Specificaties van het Origineel:</h4>
                <ul className="list-disc pl-5 space-y-1 text-neutral-300 font-mono text-xs">
                  <li><strong>Resolutie:</strong> 320 × 200 pixels, 16 kleuren (PCjr / Tandy / EGA).</li>
                  <li><strong>Geluidschip:</strong> Texas Instruments SN76489 (3 stemmen + 1 ruiskanaal) of 1-bits PC-speaker.</li>
                  <li><strong>Vector-geheugentechniek:</strong> Achtergronden werden opgeslagen als wiskundige lijnen en verfvullingen om disketteruimte te besparen!</li>
                  <li><strong>Geheugen:</strong> Minimaal 128 KB PC-DOS geheugen.</li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'agi' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-green-950/30 border border-green-500/30">
                <h3 className="font-bold text-green-300 text-base mb-1 flex items-center gap-2">
                  <Disc className="w-4 h-4 text-green-400" />
                  De AGI Engine (Adventure Game Interpreter)
                </h3>
                <p>
                  Om King's Quest mogelijk te maken, ontwierp Ken Williams de legendarische <strong>AGI</strong> (Adventure Game Interpreter). Deze engine splitste spelcode van de hardware-aansturing. Hierdoor kon Sierra in de jaren daarna talloze klassiekers bouwen op hetzelfde fundament, waaronder <em>Space Quest</em>, <em>Police Quest</em> en <em>Leisure Suit Larry</em>!
                </p>
              </div>

              <div className="p-4 rounded-xl bg-neutral-800/80 border border-neutral-700">
                <h4 className="font-bold text-white mb-2">Diepte & Prioriteitsschermen</h4>
                <p className="text-neutral-300">
                  In AGI tekende de engine een onzichtbaar "priority screen" van 16 kleuren achter de schermen. Hierdoor wist de computer pixel-precies of Graham vóór een kasteelmuur liep of achter een eeuwenoude eik verdween.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'riddles' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-500/30">
                <h3 className="font-bold text-purple-300 text-base mb-1 flex items-center gap-2">
                  <Key className="w-4 h-4 text-purple-400" />
                  Het Beroemde Kabouter-Raadsel: Rumpelstiltskin Omgekeerd
                </h3>
                <p>
                  Eén van de meest legendarische en beruchte puzzels in de geschiedenis van computerspellen! Bij het spinnewiel ontmoet Graham een kabouter die belooft magische bonen te geven als je zijn naam raadt.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-neutral-800/80 border border-neutral-700 space-y-2">
                <p className="text-neutral-200">
                  In een briefje in het spel staat de hint: <em>"Sometimes you must look at things backwards: If A is Z, B is Y..."</em>
                </p>
                <p className="text-neutral-300">
                  Als je de naam <strong>RUMPELSTILTSKIN</strong> letter voor letter omzet met het omgekeerde alfabet (A=Z, B=Y, C=X...), krijg je:
                </p>
                <div className="text-center py-2 px-4 rounded-lg bg-neutral-900 border border-amber-500/50 font-mono text-amber-300 font-bold text-sm tracking-widest">
                  I - F - N - K - O - V - H - G - R - O - G - H
                </div>
                <p className="text-xs text-neutral-400">
                  Typ in onze browser-versie gerust <code>IFNKOVHGROGH</code> bij de kabouter om direct de magische bonen te ontvangen!
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-800 bg-neutral-950 flex items-center justify-between">
          <div className="text-xs text-neutral-400 font-mono">
            Sierra On-Line Inc. • 1984 Daventry Saga
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs sm:text-sm font-semibold transition-all cursor-pointer"
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
                className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs sm:text-sm font-bold shadow-[0_0_20px_rgba(245,158,11,0.5)] transition-all flex items-center gap-2 cursor-pointer"
              >
                <Crown className="w-4 h-4" />
                <span>Speel King's Quest</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
