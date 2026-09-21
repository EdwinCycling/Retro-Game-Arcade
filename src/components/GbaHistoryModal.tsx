/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Game Boy Advance SP (2003) Historical Dossier & Archive Modal
 */

import React from 'react';
import { X, Sparkles, BookOpen, Cpu, BatteryCharging, Palette, Award, Play } from 'lucide-react';

interface GbaHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlayGame: (gameId: 'pokemon_emerald' | 'mario_advance' | 'zelda_minish') => void;
  lang?: 'nl' | 'en';
}

export const GbaHistoryModal: React.FC<GbaHistoryModalProps> = ({
  isOpen,
  onClose,
  onPlayGame,
  lang = 'nl'
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-4xl bg-slate-900 border-2 border-sky-500/50 rounded-2xl shadow-2xl overflow-hidden text-slate-100 my-auto">
        {/* Header with GBA SP Banner */}
        <div className="relative bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-950 p-6 border-b border-sky-500/30">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-xl bg-blue-600/30 border border-blue-400/50 flex items-center justify-center text-2xl shadow-lg">
                📱
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 text-[10px] font-bold tracking-widest uppercase bg-sky-500/20 text-sky-400 border border-sky-400/40 rounded">
                    Nintendo Handheld Era (2003)
                  </span>
                  <span className="px-2 py-0.5 text-[10px] font-bold tracking-widest uppercase bg-amber-500/20 text-amber-400 border border-amber-400/40 rounded">
                    AGS-001 & AGS-101
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-wide mt-1">
                  GAME BOY ADVANCE SP
                </h2>
                <p className="text-xs sm:text-sm text-sky-300">
                  {lang === 'nl' 
                    ? 'De Inklapbare 32-bit Revolutie met Frontlight, Backlight & Li-Ion Accu' 
                    : 'The Clamshell 32-bit Revolution with Frontlight, Backlight & Li-Ion Battery'}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800/80 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60">
              <div className="flex items-center space-x-2 text-sky-400 text-xs font-bold mb-1">
                <Cpu className="w-4 h-4" />
                <span>CPU ARCHITECTUUR</span>
              </div>
              <div className="text-sm font-black text-white">32-bit ARM7TDMI</div>
              <div className="text-[11px] text-slate-400">16.78 MHz + Z80 Coprocessor</div>
            </div>

            <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60">
              <div className="flex items-center space-x-2 text-amber-400 text-xs font-bold mb-1">
                <Palette className="w-4 h-4" />
                <span>SCHERM & RESOLUTIE</span>
              </div>
              <div className="text-sm font-black text-white">240 × 160 TFT LCD</div>
              <div className="text-[11px] text-slate-400">32.768 Kleuren (Front-/Backlit)</div>
            </div>

            <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60">
              <div className="flex items-center space-x-2 text-emerald-400 text-xs font-bold mb-1">
                <BatteryCharging className="w-4 h-4" />
                <span>VOEDING</span>
              </div>
              <div className="text-sm font-black text-white">Oplaadbare Li-Ion</div>
              <div className="text-[11px] text-slate-400">10-18 Uur Speeltijd</div>
            </div>

            <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60">
              <div className="flex items-center space-x-2 text-purple-400 text-xs font-bold mb-1">
                <Award className="w-4 h-4" />
                <span>VERKOOPCIJFERS</span>
              </div>
              <div className="text-sm font-black text-white">43.5+ Miljoen SP</div>
              <div className="text-[11px] text-slate-400">81.5M Totale GBA Familie</div>
            </div>
          </div>

          {/* Chapters */}
          <div className="space-y-4 text-sm text-slate-300 leading-relaxed">
            <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/40">
              <h3 className="text-base font-bold text-sky-400 flex items-center space-x-2 mb-2">
                <BookOpen className="w-4 h-4" />
                <span>
                  {lang === 'nl' 
                    ? '1. Het Ontstaan: De Oplossing voor het Donkere GBA Scherm' 
                    : '1. The Genesis: Solving the Dark GBA Screen'}
                </span>
              </h3>
              <p>
                {lang === 'nl' ? (
                  <>
                    Toen Nintendo in 2001 de originele <strong>Game Boy Advance (AGB-001)</strong> uitbracht, was het een technisch wonder met 32-bit graphics vergelijkbaar met de SNES. Echter, het scherm had geen ingebouwde verlichting waardoor spelers afhankelijk waren van direct zonlicht of externe opzetlampjes (zoals de beroemde WormLight).
                    <br /><br />
                    Onder leiding van Nintendo-ontwerper <strong>Kenichiro Ashida</strong> en president <strong>Satoru Iwata</strong> werd in februari 2003 de <strong>Game Boy Advance SP (Special Project)</strong> gelanceerd. Het inklapbare clamshell-ontwerp beschermde het scherm in je jaszak en bracht eindelijk een geïntegreerd verlicht scherm (Frontlight) en een oplaadbare lithium-ion accu.
                  </>
                ) : (
                  <>
                    When Nintendo launched the original <strong>Game Boy Advance (AGB-001)</strong> in 2001, it was a 32-bit technical marvel. However, the lack of built-in screen lighting forced players to seek direct sunlight or clip-on WormLights.
                    <br /><br />
                    In February 2003, under designer <strong>Kenichiro Ashida</strong> and president <strong>Satoru Iwata</strong>, Nintendo unveiled the <strong>Game Boy Advance SP (Special Project)</strong>. The clamshell design protected the display and delivered an integrated frontlit (and later backlit) screen plus a rechargeable Li-ion battery.
                  </>
                )}
              </p>
            </div>

            <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/40">
              <h3 className="text-base font-bold text-amber-400 flex items-center space-x-2 mb-2">
                <Sparkles className="w-4 h-4" />
                <span>
                  {lang === 'nl' 
                    ? '2. AGS-001 vs. AGS-101 (De Heilige Graal onder Handhelds)' 
                    : '2. AGS-001 vs. AGS-101 (The Holy Grail of Handhelds)'}
                </span>
              </h3>
              <p>
                {lang === 'nl' ? (
                  <>
                    In september 2005 bracht Nintendo de herziene <strong>AGS-101</strong> variant uit met een echt <em>Backlit</em> TFT LCD-scherm (vaak herkenbaar aan de Pearl Blue, Pearl Pink en Graphite behuizingen). Dit scherm bood een ongelooflijk diep contrast en verzadigde 32-bit kleuren, waardoor het vandaag de dag een van de meest gewilde retro consoles ter wereld is.
                  </>
                ) : (
                  <>
                    In September 2005, Nintendo released the revised <strong>AGS-101</strong> model featuring a genuine <em>Backlit</em> TFT LCD screen. With deep contrast and rich 32-bit color saturation, it remains one of the most coveted retro handhelds today.
                  </>
                )}
              </p>
            </div>
          </div>

          {/* Cartridge Quick Launchers */}
          <div className="border-t border-slate-700/60 pt-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              {lang === 'nl' ? 'Direct Spelen in de GBA SP Console:' : 'Play Immediately on the GBA SP Console:'}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                onClick={() => { onClose(); onPlayGame('pokemon_emerald'); }}
                className="flex items-center space-x-3 p-3 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-500/40 text-left transition-all group"
              >
                <span className="text-2xl group-hover:scale-110 transition-transform">⚡</span>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-emerald-300 text-sm truncate">Pokémon Emerald</div>
                  <div className="text-[11px] text-emerald-400/80 truncate">Game Freak (2004)</div>
                </div>
                <Play className="w-4 h-4 text-emerald-400 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => { onClose(); onPlayGame('mario_advance'); }}
                className="flex items-center space-x-3 p-3 rounded-xl bg-red-950/60 hover:bg-red-900/80 border border-red-500/40 text-left transition-all group"
              >
                <span className="text-2xl group-hover:scale-110 transition-transform">🍄</span>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-red-300 text-sm truncate">Super Mario Advance 4</div>
                  <div className="text-[11px] text-red-400/80 truncate">Nintendo R&D2 (2003)</div>
                </div>
                <Play className="w-4 h-4 text-red-400 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => { onClose(); onPlayGame('zelda_minish'); }}
                className="flex items-center space-x-3 p-3 rounded-xl bg-amber-950/60 hover:bg-amber-900/80 border border-amber-500/40 text-left transition-all group"
              >
                <span className="text-2xl group-hover:scale-110 transition-transform">🗡️</span>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-amber-300 text-sm truncate">The Minish Cap</div>
                  <div className="text-[11px] text-amber-400/80 truncate">Capcom / Flagship (2004)</div>
                </div>
                <Play className="w-4 h-4 text-amber-400 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
