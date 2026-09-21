/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Nintendo Game Boy (DMG-01 / 1989) Historical Dossier & Technical Exhibition
 */

import React from 'react';
import { X, Trophy, Cpu, Sparkles, Gamepad2, Play } from 'lucide-react';
import { Language } from '../i18n/lobbyTranslations';

interface GameBoyHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlayMario?: () => void;
  onPlayTetris?: () => void;
  onLaunchGame?: (gameId: string) => void;
  lang?: Language;
}

export const GameBoyHistoryModal: React.FC<GameBoyHistoryModalProps> = ({
  isOpen,
  onClose,
  onPlayMario,
  onPlayTetris,
  onLaunchGame,
  lang = 'nl'
}) => {
  if (!isOpen) return null;

  const isEn = lang === 'en';

  const gbGamesList = [
    { id: 'mario_land', name: 'Super Mario Land', year: '1989', icon: '🍄', desc: 'Het iconische lanceerspel in Sarasaland.' },
    { id: 'tetris_dmg', name: 'Tetris DMG', year: '1989', icon: '🧩', desc: 'De wereldberoemde puzzelklassieker met Korobeiniki.' },
    { id: 'dr_mario', name: 'Dr. Mario', year: '1990', icon: '💊', desc: 'Schakel virussen uit met vitaminecapsules.' },
    { id: 'metroid_2', name: 'Metroid II: Return of Samus', year: '1991', icon: '👽', desc: 'Jaag op 39 geëvolueerde Metroids op SR388.' },
    { id: 'kirby_dream_land', name: "Kirby's Dream Land", year: '1992', icon: '⭐', desc: 'Het debuut van de zwevende roze held.' },
    { id: 'mario_land_2', name: 'Super Mario Land 2', year: '1992', icon: '👑', desc: '6 Golden Coins & het debuut van Wario.' },
    { id: 'zelda_links_awakening', name: "Zelda: Link's Awakening", year: '1993', icon: '🗡️', desc: 'Het mysterie van Koholint Island & de Windvis.' },
    { id: 'donkey_kong_94', name: "Donkey Kong '94", year: '1994', icon: '🔨', desc: '101 ingenieuze sleutelpuzzels met acrobatiek.' },
    { id: 'pokemon_red', name: 'Pokémon Red & Blue', year: '1996', icon: '⚡', desc: 'Gotta Catch ’Em All in Kanto.' },
    { id: 'wario_land_2', name: 'Wario Land II', year: '1998', icon: '💰', desc: 'De onsterfelijke anti-held met transformaties.' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-neutral-900 border-2 border-neutral-700 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-neutral-800 bg-neutral-950/90">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-neutral-800 border border-neutral-600 flex items-center justify-center text-xl shadow-inner">
              🎮
            </div>
            <div>
              <h3 className="text-xl font-black font-mono text-white tracking-wide flex items-center gap-2">
                <span>NINTENDO GAME BOY (DMG-01)</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-700 font-mono">
                  1989 • 118M+ VERKOCHT
                </span>
              </h3>
              <p className="text-xs text-neutral-400 font-mono">
                {isEn ? 'Hardware Dossier • Gunpei Yokoi • Satoru Okada • Nintendo R&D1' : 'Hardware Dossier • Gunpei Yokoi • Satoru Okada • Nintendo R&D1'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 font-mono text-xs text-neutral-300">
          {/* Hero Banner with Technical Highlights */}
          <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <span className="text-neutral-500 text-[10px] uppercase font-bold tracking-wider">
                {isEn ? 'Chief Visionary' : 'Hoofdontwerper'}
              </span>
              <p className="text-sm font-bold text-emerald-400">Gunpei Yokoi &amp; Satoru Okada</p>
              <p className="text-[11px] text-neutral-400">Nintendo R&amp;D1 Kyōto</p>
            </div>
            <div className="space-y-1">
              <span className="text-neutral-500 text-[10px] uppercase font-bold tracking-wider">
                {isEn ? 'Core Philosophy' : 'Kernfilosofie'}
              </span>
              <p className="text-sm font-bold text-amber-400">Lateral Thinking with Withered Tech</p>
              <p className="text-[11px] text-neutral-400">Kareta Gijutsu no Suihei Shikō</p>
            </div>
            <div className="space-y-1">
              <span className="text-neutral-500 text-[10px] uppercase font-bold tracking-wider">
                {isEn ? 'Battery Stamina' : 'Batterijduur'}
              </span>
              <p className="text-sm font-bold text-cyan-400">30+ Uur op 4× AA Batterijen</p>
              <p className="text-[11px] text-neutral-400">Verpletterde Atari Lynx &amp; Sega Game Gear</p>
            </div>
          </div>

          {/* SML & Tetris Twin Pillars */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-950/40 to-neutral-950 border border-amber-800/40 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm text-amber-300 flex items-center gap-1.5">
                  <span>🍄</span>
                  <span>Super Mario Land (1989)</span>
                </h4>
                <span className="text-[10px] px-2 py-0.5 rounded bg-amber-900/60 text-amber-200 border border-amber-700">
                  18.14M EX.
                </span>
              </div>
              <p className="leading-relaxed text-neutral-300 text-[11px]">
                {isEn
                  ? 'The debut Mario adventure not directed by Miyamoto. Set in Sarasaland against the alien Tatanga, featuring Princess Daisy, bouncy rubber Superball physics, and Hirokazu Tanaka\'s catchy tropical chiptunes.'
                  : 'Het debuutavontuur van Mario dat niet werd geregisseerd door Miyamoto maar door Gunpei Yokoi. Gesitueerd in Sarasaland tegen de buitenaardse Tatanga, met Prinses Daisy, stuiterende Superball-fysica en vrolijke tropische chiptunes van Hirokazu Tanaka.'}
              </p>
              {onPlayMario && (
                <button
                  onClick={() => {
                    onClose();
                    onPlayMario();
                  }}
                  className="w-full py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>{isEn ? 'Launch Super Mario Land' : 'Start Super Mario Land'}</span>
                </button>
              )}
            </div>

            <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-950/40 to-neutral-950 border border-blue-800/40 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm text-blue-300 flex items-center gap-1.5">
                  <span>🧩</span>
                  <span>Tetris DMG Edition (1989)</span>
                </h4>
                <span className="text-[10px] px-2 py-0.5 rounded bg-blue-900/60 text-blue-200 border border-blue-700">
                  35.02M EX.
                </span>
              </div>
              <p className="leading-relaxed text-neutral-300 text-[11px]">
                {isEn
                  ? 'Acquired in Moscow by Henk Rogers. Bundled with the Game Boy, creating a global cultural phenomenon for gamers of all ages, with the legendary Korobeiniki chiptune and rocket launch celebrations.'
                  : 'Door Henk Rogers verworven in Moskou bij Alexey Pajitnov. Gebundeld met de Game Boy werd het een wereldwijd cultuurfenomeen voor jong en oud, met de iconische Korobeiniki-soundtrack en de raketlancering bij winst.'}
              </p>
              {onPlayTetris && (
                <button
                  onClick={() => {
                    onClose();
                    onPlayTetris();
                  }}
                  className="w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>{isEn ? 'Launch Tetris (DMG)' : 'Start Tetris (DMG)'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Game Boy Vault Library (10 Games) */}
          <div className="space-y-3 pt-2">
            <h4 className="font-bold text-sm text-white flex items-center gap-2">
              <Gamepad2 className="w-4 h-4 text-emerald-400" />
              <span>{isEn ? 'Game Boy Vault (All 10 Games in Dossier)' : 'Game Boy Bibliotheek (Alle 10 Spellen in Dossier)'}</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {gbGamesList.map((g) => (
                <div
                  key={g.id}
                  className="p-3 rounded-2xl bg-neutral-950 border border-neutral-800 flex items-center justify-between gap-2 hover:border-emerald-500/50 transition-all"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-2xl shrink-0">{g.icon}</span>
                    <div className="min-w-0">
                      <div className="font-bold text-white text-xs truncate flex items-center gap-1.5">
                        <span>{g.name}</span>
                        <span className="text-[10px] font-mono text-neutral-500">({g.year})</span>
                      </div>
                      <p className="text-[10px] text-neutral-400 truncate">{g.desc}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      onClose();
                      if (onLaunchGame) {
                        onLaunchGame(g.id);
                      } else if (g.id === 'mario_land' && onPlayMario) {
                        onPlayMario();
                      } else if (g.id === 'tetris_dmg' && onPlayTetris) {
                        onPlayTetris();
                      }
                    }}
                    className="shrink-0 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
                  >
                    <Play className="w-3 h-3 fill-white" />
                    <span>{isEn ? 'Play Direct' : 'Speel Direct'}</span>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Technical Specs */}
          <div className="space-y-3">
            <h4 className="font-bold text-sm text-white flex items-center gap-2">
              <Cpu className="w-4 h-4 text-emerald-400" />
              <span>{isEn ? 'Hardware Architecture & Specifications' : 'Hardware Architectuur & Specificaties'}</span>
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
              <div className="p-2.5 rounded-xl bg-neutral-950 border border-neutral-800">
                <span className="text-neutral-500 block text-[10px]">CPU</span>
                <span className="font-bold text-neutral-200">Sharp LR35902 (4.19 MHz)</span>
              </div>
              <div className="p-2.5 rounded-xl bg-neutral-950 border border-neutral-800">
                <span className="text-neutral-500 block text-[10px]">SCHERM</span>
                <span className="font-bold text-neutral-200">160×144 STN LCD (4 tinten)</span>
              </div>
              <div className="p-2.5 rounded-xl bg-neutral-950 border border-neutral-800">
                <span className="text-neutral-500 block text-[10px]">GELUIDSCHIP</span>
                <span className="font-bold text-neutral-200">4-Kanaals DMG APU (Stereo)</span>
              </div>
              <div className="p-2.5 rounded-xl bg-neutral-950 border border-neutral-800">
                <span className="text-neutral-500 block text-[10px]">GEHEUGEN</span>
                <span className="font-bold text-neutral-200">8 KB RAM + 8 KB VRAM</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-800 bg-neutral-950 flex items-center justify-between">
          <div className="text-[11px] text-neutral-500 font-mono">
            {isEn ? 'Press ESC or button to close dossier' : 'Druk ESC of knop om dossier te sluiten'}
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 font-mono font-bold text-white text-xs transition-colors cursor-pointer"
          >
            {isEn ? 'Close Dossier' : 'Sluit Dossier'}
          </button>
        </div>
      </div>
    </div>
  );
};
