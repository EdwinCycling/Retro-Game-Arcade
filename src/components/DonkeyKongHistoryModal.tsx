/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Donkey Kong (1981 Nintendo Arcade) - Interactive History Dossier
 */

import React, { useState } from 'react';
import { X, Trophy, History, Sparkles, BookOpen, Crown } from 'lucide-react';

interface DonkeyKongHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang?: 'nl' | 'en';
}

export const DonkeyKongHistoryModal: React.FC<DonkeyKongHistoryModalProps> = ({
  isOpen,
  onClose,
  lang = 'nl'
}) => {
  const [activeTab, setActiveTab] = useState<'origin' | 'levels' | 'trivia' | 'records'>('origin');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-neutral-900 border-2 border-red-500 rounded-xl shadow-[0_0_30px_rgba(239,68,68,0.3)] overflow-hidden text-neutral-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-red-950 via-neutral-900 to-blue-950 border-b border-red-500/30">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-red-600/30 border border-red-500 flex items-center justify-center text-red-400">
              <Crown className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-wider text-red-400 font-mono">
                DONKEY KONG (1981)
              </h2>
              <p className="text-xs text-neutral-400">Nintendo Arcade Archives & Miyamoto's Meesterwerk</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-neutral-800 bg-neutral-950/60 px-4">
          <button
            onClick={() => setActiveTab('origin')}
            className={`flex items-center space-x-2 px-4 py-3 text-xs font-mono font-bold border-b-2 transition ${
              activeTab === 'origin'
                ? 'border-red-500 text-red-400 bg-red-950/20'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <History className="w-4 h-4" />
            <span>OORSPRONG</span>
          </button>
          <button
            onClick={() => setActiveTab('levels')}
            className={`flex items-center space-x-2 px-4 py-3 text-xs font-mono font-bold border-b-2 transition ${
              activeTab === 'levels'
                ? 'border-red-500 text-red-400 bg-red-950/20'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>4 LEVELS</span>
          </button>
          <button
            onClick={() => setActiveTab('trivia')}
            className={`flex items-center space-x-2 px-4 py-3 text-xs font-mono font-bold border-b-2 transition ${
              activeTab === 'trivia'
                ? 'border-red-500 text-red-400 bg-red-950/20'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>WEETJES</span>
          </button>
          <button
            onClick={() => setActiveTab('records')}
            className={`flex items-center space-x-2 px-4 py-3 text-xs font-mono font-bold border-b-2 transition ${
              activeTab === 'records'
                ? 'border-red-500 text-red-400 bg-red-950/20'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Trophy className="w-4 h-4" />
            <span>KING OF KONG</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto space-y-4 text-sm leading-relaxed text-neutral-300">
          {activeTab === 'origin' && (
            <div className="space-y-3">
              <h3 className="text-base font-bold text-red-400 font-mono">De Redder van Nintendo of America</h3>
              <p>
                In 1980 stond Nintendo of America op de rand van faillissement. Ze hadden 2.000 onverkochte <em>Radar Scope</em> arcadekasten in een magazijn in Seattle staan. Hiroshi Yamauchi vroeg een jonge industriële vormgever genaamd <strong>Shigeru Miyamoto</strong> om onder leiding van hardwarelegende <strong>Gunpei Yokoi</strong> een conversiegame te bedenken.
              </p>
              <p>
                Miyamoto liet zich inspireren door <em>Popeye</em>, <em>Beauty and the Beast</em> en <em>King Kong</em>. Omdat Nintendo de Popeye-licentie toen nog niet kreeg, creëerde hij originele personages: de timmerman <strong>Jumpman</strong> (later <em>Mario</em>), zijn vriendinnetje <strong>Lady</strong> (later <em>Pauline</em>) en de ontsnapte reuzenaap <strong>Donkey Kong</strong>.
              </p>
              <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-lg text-xs font-mono text-amber-400">
                ★ <strong>Wist je dat:</strong> De naam "Donkey Kong" werd bedacht door Miyamoto met een Japans-Engels woordenboek. "Donkey" stond voor koppig/stom, en "Kong" voor aap!
              </div>
            </div>
          )}

          {activeTab === 'levels' && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-red-400 font-mono">De 4 Legendarische Arcade Niveaus</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3 bg-neutral-950 border border-red-500/30 rounded-lg">
                  <span className="text-xs font-bold text-red-400 font-mono">LEVEL 1: 25M (GIRDERS)</span>
                  <p className="text-xs text-neutral-400 mt-1">
                    Schuine steigers met rollende vaten. Spring over vaten voor 100 punten of pak de hamer (500 pt) om ze te verpulveren!
                  </p>
                </div>
                <div className="p-3 bg-neutral-950 border border-blue-500/30 rounded-lg">
                  <span className="text-xs font-bold text-blue-400 font-mono">LEVEL 2: 50M (CONVEYORS)</span>
                  <p className="text-xs text-neutral-400 mt-1">
                    De cementfabriek met lopende banden, telescopische ladders en hete cementpannen die in de oven vallen.
                  </p>
                </div>
                <div className="p-3 bg-neutral-950 border border-yellow-500/30 rounded-lg">
                  <span className="text-xs font-bold text-yellow-400 font-mono">LEVEL 3: 75M (ELEVATORS)</span>
                  <p className="text-xs text-neutral-400 mt-1">
                    Twee verticale liften (omhoog en omlaag), vuurballen en stuiterende veren die Donkey Kong naar beneden gooit.
                  </p>
                </div>
                <div className="p-3 bg-neutral-950 border border-emerald-500/30 rounded-lg">
                  <span className="text-xs font-bold text-emerald-400 font-mono">LEVEL 4: 100M (RIVETS)</span>
                  <p className="text-xs text-neutral-400 mt-1">
                    Trek de 8 gele klinknagels los om de stellingkast onder Donkey Kong te laten instorten en Pauline voorgoed te redden!
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'trivia' && (
            <div className="space-y-3">
              <h3 className="text-base font-bold text-red-400 font-mono">Historische Trivia</h3>
              <ul className="list-disc list-inside space-y-2 text-xs">
                <li>
                  <strong>De geboorte van het platform-genre:</strong> Donkey Kong was het allereerste videospel waarin de speler kon springen over obstakels en gaten.
                </li>
                <li>
                  <strong>Mario's uiterlijk:</strong> De snor, pet en tuinbroek werden getekend door Miyamoto zodat het personage met slechts 16x16 pixels direct herkenbare armen, benen en gezichtsuitdrukkingen had op een zwarte achtergrond.
                </li>
                <li>
                  <strong>Universal Studios rechtszaak:</strong> Universal klaagde Nintendo aan wegens inbreuk op King Kong. Advocaat John Kirby bewees dat King Kong publiek domein was. Uit dank vernoemde Nintendo later het roze bolletje <em>Kirby</em> naar hem!
                </li>
              </ul>
            </div>
          )}

          {activeTab === 'records' && (
            <div className="space-y-3">
              <h3 className="text-base font-bold text-red-400 font-mono">De Legendarische Kill Screen & Records</h3>
              <p>
                In level 22 treedt de beruchte <strong>Kill Screen</strong> op: door een 8-bit timeroverflow telt de bonusklok af in slechts enkele seconden, waardoor het onmogelijk is om het level uit te spelen.
              </p>
              <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-lg text-xs space-y-2 font-mono">
                <div className="flex justify-between border-b border-neutral-800 pb-1">
                  <span className="text-neutral-400">Billy Mitchell (2007)</span>
                  <span className="text-amber-400">1.050.200 pts</span>
                </div>
                <div className="flex justify-between border-b border-neutral-800 pb-1">
                  <span className="text-neutral-400">Steve Wiebe (King of Kong)</span>
                  <span className="text-amber-400">1.064.500 pts</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Robbie Lakeman (Huidig Wereldrecord)</span>
                  <span className="text-emerald-400">1.272.800 pts</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-neutral-950 border-t border-neutral-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-mono font-bold bg-red-600 hover:bg-red-500 text-white rounded transition shadow-[0_0_10px_rgba(239,68,68,0.4)]"
          >
            TERUG NAAR DE ARCADE
          </button>
        </div>
      </div>
    </div>
  );
};
