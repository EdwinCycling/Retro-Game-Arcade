/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Tetris (1984 / 1989) Historical Dossier & Technical Archive Modal
 */

import React, { useState } from 'react';
import { X, Trophy, Cpu, History, Sparkles, BookOpen } from 'lucide-react';

interface TetrisHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlay?: () => void;
}

export const TetrisHistoryModal: React.FC<TetrisHistoryModalProps> = ({ isOpen, onClose, onPlay }) => {
  const [activeTab, setActiveTab] = useState<'history' | 'mechanics' | 'coldwar' | 'records'>('history');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-neutral-900 border-2 border-red-500/80 rounded-2xl shadow-[0_0_50px_rgba(239,68,68,0.4)] flex flex-col overflow-hidden text-neutral-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-neutral-800 bg-gradient-to-r from-red-950/80 via-neutral-900 to-amber-950/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-600/30 border border-red-500/60 flex items-center justify-center text-2xl shadow-[0_0_15px_rgba(239,68,68,0.5)]">
              🧱
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black font-mono tracking-wider text-white flex items-center gap-2">
                <span>ТЕТРИС • TETRIS</span>
                <span className="text-xs px-2 py-0.5 rounded bg-red-900/80 text-red-300 border border-red-700">
                  1984
                </span>
              </h2>
              <p className="text-xs font-mono text-amber-400">
                Alexey Pajitnov • Elektronika 60 • Soviet Academy of Sciences
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

        {/* Navigation Tabs */}
        <div className="flex border-b border-neutral-800 bg-neutral-950/60 p-1.5 gap-1.5 text-xs font-mono overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`px-3 py-2 rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'history'
                ? 'bg-red-600 text-white shadow-md'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Oorsprong (1984)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('coldwar')}
            className={`px-3 py-2 rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'coldwar'
                ? 'bg-red-600 text-white shadow-md'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Koude Oorlog Rechten</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('mechanics')}
            className={`px-3 py-2 rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'mechanics'
                ? 'bg-red-600 text-white shadow-md'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Tetromino Wiskunde</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('records')}
            className={`px-3 py-2 rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'records'
                ? 'bg-red-600 text-white shadow-md'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>Impact & Korobeiniki</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 text-xs sm:text-sm leading-relaxed">
          {activeTab === 'history' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-neutral-950/70 border border-neutral-800 space-y-2">
                <h3 className="text-base font-bold text-red-400 font-mono">
                  Geboren achter het IJzeren Gordijn (Moskou, 6 juni 1984)
                </h3>
                <p className="text-neutral-300">
                  Alexey Leonidovich Pajitnov werkte als computerwetenschapper bij het Dorodnitsyn Computing Centre van de Sovjet Academie van Wetenschappen in Moskou. Hij deed onderzoek naar spraakherkenning en kunstmatige intelligentie, maar was gefascineerd door klassieke bordspellen en pentomino-puzzels.
                </p>
                <p className="text-neutral-300">
                  Op een primitieve <strong>Elektronika 60</strong> minicomputer (een Sovjet-kloon van de DEC PDP-11) zonder grafische kaart besloot hij vallende blokken te programmeren. Omdat het scherm enkel groene teksttekens ondersteunde, tekende hij de blokken met haakjes: <code className="bg-neutral-800 px-1 py-0.5 rounded text-green-400">[ ]</code>.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs">
                <div className="p-3.5 rounded-xl bg-neutral-950/50 border border-neutral-800">
                  <span className="text-amber-400 font-bold block mb-1">Naamgeving:</span>
                  Een samentrekking van het Griekse <em>tetra</em> (vier, naar de 4 blokjes per tetromino) en <em>tennis</em>, Alexey&apos;s favoriete sport!
                </div>
                <div className="p-3.5 rounded-xl bg-neutral-950/50 border border-neutral-800">
                  <span className="text-cyan-400 font-bold block mb-1">Vadim Gerasimov (16 jaar):</span>
                  De 16-jarige scholier Vadim zette het spel in Turbo Pascal over naar de IBM PC, met kleuren en automatische topscores. Binnen weken kopieerde heel Moskou floppy disks.
                </div>
              </div>
            </div>
          )}

          {activeTab === 'coldwar' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-neutral-950/70 border border-neutral-800 space-y-2">
                <h3 className="text-base font-bold text-amber-400 font-mono">
                  De bizarre strijd om de Tetris-rechten
                </h3>
                <p className="text-neutral-300">
                  Onder het communistische Sovjetregime was intellectueel eigendom staatseigendom. Alexey kon zelf geen cent verdienen aan zijn uitvinding; de rechten vielen onder <strong>ELORG</strong> (Elektronorgtechnica), het Sovjet-staatsbedrijf voor technologie-export.
                </p>
                <p className="text-neutral-300">
                  De Hongaarse zakenman Robert Stein zag Tetris en verkocht licenties door aan Andromeda en Mirrorsoft (Robert Maxwell) zonder een getekend contract met Moskou! Tegelijkertijd vloog de Nederlandse game-ontwikkelaar <strong>Henk Rogers</strong> (namens Nintendo) persoonlijk naar Moskou met een toeristenvisum.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-800/60">
                <span className="text-red-300 font-bold block mb-1 font-mono">De Nintendo Game Boy Triomf (1989):</span>
                <p className="text-neutral-300">
                  Henk Rogers wist de Sovjet-autoriteiten te overtuigen dat de handheld-rechten nog nooit waren vergeven. Hij sloot ter plekke de historische deal. Tetris werd als bundelgame meegeleverd met de allereerste Nintendo Game Boy, wat resulteerde in meer dan 35 miljoen verkochte exemplaren wereldwijd.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'mechanics' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-neutral-950/70 border border-neutral-800 space-y-2">
                <h3 className="text-base font-bold text-cyan-400 font-mono">
                  De 7 Geometrische Tetrominoes
                </h3>
                <p className="text-neutral-300">
                  Een tetromino is een geometrische vorm bestaande uit vier vierkanten die met hun zijden aan elkaar verbonden zijn. Er bestaan exact 7 vrije tetrominoes:
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center font-mono">
                <div className="p-2.5 rounded-lg bg-neutral-950 border border-cyan-500/40 text-cyan-300">
                  <div className="text-lg">🟦🟦🟦🟦</div>
                  <span className="text-[11px] font-bold">I (Rechte lijn)</span>
                </div>
                <div className="p-2.5 rounded-lg bg-neutral-950 border border-yellow-500/40 text-yellow-300">
                  <div className="text-lg">🟨🟨<br/>🟨🟨</div>
                  <span className="text-[11px] font-bold">O (Vierkant)</span>
                </div>
                <div className="p-2.5 rounded-lg bg-neutral-950 border border-purple-500/40 text-purple-300">
                  <div className="text-lg">🟪<br/>🟪🟪🟪</div>
                  <span className="text-[11px] font-bold">T (T-stuk)</span>
                </div>
                <div className="p-2.5 rounded-lg bg-neutral-950 border border-green-500/40 text-green-300">
                  <div className="text-lg">🟩🟩<br/>🟩🟩</div>
                  <span className="text-[11px] font-bold">S & Z (Zigzag)</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-neutral-950/50 border border-neutral-800 font-mono text-xs text-neutral-300">
                <strong className="text-amber-400">7-Bag Randomizer & SRS Wall Kicks:</strong>
                Onze engine gebruikt de officiële 7-bag randomizer waardoor alle 7 stukken in eerlijke willekeurige cycli verschijnen (nooit oneindige droogtes!), gecombineerd met Super Rotation System wall-kicks voor soepele draaibewegingen tegen randen.
              </div>
            </div>
          )}

          {activeTab === 'records' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-neutral-950/70 border border-neutral-800 space-y-2">
                <h3 className="text-base font-bold text-yellow-400 font-mono">
                  Korobeiniki & Het &quot;Tetris Effect&quot;
                </h3>
                <p className="text-neutral-300">
                  De iconische &quot;Type-A&quot; muziek is het 19e-eeuwse Russische volkslied <em>Korobeiniki</em> (De Marskramers), gebaseerd op een gedicht van Nikolai Nekrasov uit 1861. Het arrangement werd voor het eerst gemaakt door Hirokazu Tanaka voor de Game Boy.
                </p>
                <p className="text-neutral-300">
                  <strong>Het Tetris Effect:</strong> Psychologen ontdekten dat intensief Tetris spelen ertoe leidt dat spelers in het echte leven vormen in hun hoofd gaan rangschikken (dozen in kasten, gebouwen in een skyline, en patronen wanneer ze hun ogen sluiten voor het slapengaan).
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-gradient-to-r from-red-950/50 to-neutral-950 border border-red-800/40 flex items-center justify-between">
                <div>
                  <span className="text-white font-bold font-mono block">Classic Tetris World Championship (CTWC)</span>
                  <span className="text-neutral-400 text-xs">Jaarlijks toernooi gespeeld op originele NES hardware en CRT-televisies.</span>
                </div>
                <Sparkles className="w-6 h-6 text-yellow-400 shrink-0" />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-800 bg-neutral-950 flex items-center justify-between gap-3">
          <span className="text-xs text-neutral-400 font-mono">
            Retro Arcade Collectie • Game 11
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-mono font-bold text-xs border border-neutral-700 cursor-pointer"
            >
              SLUITEN
            </button>
            {onPlay && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onPlay();
                }}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-red-600 via-amber-500 to-yellow-400 hover:from-red-500 hover:to-yellow-300 text-black font-mono font-black text-xs shadow-[0_0_15px_rgba(239,68,68,0.5)] cursor-pointer flex items-center gap-1.5"
              >
                <span>SPEEL TETRIS</span>
                <span>▶</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
