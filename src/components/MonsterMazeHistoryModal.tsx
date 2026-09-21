/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 3D Monster Maze (Sinclair ZX81 1981) Historical Dossier & Technical Exhibition
 */

import React from 'react';
import { X, Trophy, Sparkles, Cpu, Award, BookOpen, Eye, Play } from 'lucide-react';
import { Language } from '../i18n/lobbyTranslations';

interface MonsterMazeHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlay?: () => void;
  lang?: Language;
}

export const MonsterMazeHistoryModal: React.FC<MonsterMazeHistoryModalProps> = ({
  isOpen,
  onClose,
  onPlay,
  lang = 'nl',
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl max-h-[92vh] bg-neutral-900 border-2 border-emerald-500/70 rounded-3xl shadow-[0_0_50px_rgba(16,185,129,0.35)] overflow-hidden flex flex-col text-neutral-200">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-950/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center text-xl">
              🦖
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-mono text-lg font-black text-white tracking-wide">
                  3D MONSTER MAZE (1981)
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-700">
                  SINCLAIR ZX81 16K
                </span>
              </div>
              <p className="text-xs font-mono text-neutral-400">
                Malcolm Evans • J.K. Greye / New Generation Software • De Oer-Survival Horror
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

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs sm:text-sm font-sans leading-relaxed">
          
          {/* Quick Specs Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
            <div className="p-3 rounded-2xl bg-neutral-950/70 border border-neutral-800">
              <span className="text-[10px] text-neutral-500 uppercase block">Ontwerper</span>
              <span className="text-emerald-400 font-bold text-xs">Malcolm Evans</span>
            </div>
            <div className="p-3 rounded-2xl bg-neutral-950/70 border border-neutral-800">
              <span className="text-[10px] text-neutral-500 uppercase block">Uitgever</span>
              <span className="text-cyan-400 font-bold text-xs">J.K. Greye Software</span>
            </div>
            <div className="p-3 rounded-2xl bg-neutral-950/70 border border-neutral-800">
              <span className="text-[10px] text-neutral-500 uppercase block">Hardware</span>
              <span className="text-yellow-400 font-bold text-xs">Sinclair ZX81 + 16K RAM</span>
            </div>
            <div className="p-3 rounded-2xl bg-neutral-950/70 border border-neutral-800">
              <span className="text-[10px] text-neutral-500 uppercase block">Genre</span>
              <span className="text-red-400 font-bold text-xs">1st Person Survival Horror</span>
            </div>
          </div>

          {/* Section 1: Het Verhaal van Malcolm Evans */}
          <div className="space-y-2">
            <h4 className="text-base font-bold text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-400" />
              <span>{lang === 'nl' ? 'De Geboorte van 3D Survival Horror in 1981' : 'The Birth of 3D Survival Horror in 1981'}</span>
            </h4>
            <p className="text-neutral-300">
              {lang === 'nl' ? (
                <>
                  In het voorjaar van 1981 kreeg de 37-jarige ingenieur <strong>Malcolm Evans</strong> voor zijn verjaardag een <strong>Sinclair ZX81</strong> van zijn vrouw Linda. Hij wilde begrijpen hoe microprocessoren werkten en schreef in Z80 machinetaal een 3D wireframe doolhof. Toen hij een bewegende Tyrannosaurus Rex toevoegde die de speler opjoeg, was het allereerste <strong>3D first-person survival horror game</strong> in de geschiedenis een feit — ruim 11 jaar vóór <em>Alone in the Dark</em> en <em>Wolfenstein 3D</em>!
                </>
              ) : (
                <>
                  In spring 1981, 37-year-old aerospace engineer <strong>Malcolm Evans</strong> received a <strong>Sinclair ZX81</strong> from his wife Linda. To learn Z80 machine code, he created a 3D raycasting maze. When he added a roaming Tyrannosaurus Rex hunting the player, he inadvertently created the world&apos;s first <strong>3D first-person survival horror game</strong> — over a decade before <em>Wolfenstein 3D</em> and <em>Resident Evil</em>!
                </>
              )}
            </p>
          </div>

          {/* Section 2: Technische Triomf op 16 Kilobyte */}
          <div className="p-4 rounded-2xl bg-neutral-950/60 border border-neutral-800 space-y-3">
            <h4 className="text-sm font-bold text-emerald-300 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-emerald-400" />
              <span>{lang === 'nl' ? 'Technisch Meesterwerk: Raycasting met Tekstblokken' : 'Technical Feat: Text-Based 3D Raycasting'}</span>
            </h4>
            <div className="grid sm:grid-cols-2 gap-3 text-xs text-neutral-400">
              <div className="p-3 rounded-xl bg-neutral-900/90 border border-neutral-800">
                <span className="text-white font-bold block mb-1">📐 Geen Grafische Kaart, Puur Tekst</span>
                De ZX81 had geen pixelgeheugen, slechts 64×48 semigrafische karakters. Evans berekende wiskundig de dieptelijnen van de gangen en renderde Rex met geanimeerde tekensets op 6 beelden per seconde.
              </div>
              <div className="p-3 rounded-xl bg-neutral-900/90 border border-neutral-800">
                <span className="text-white font-bold block mb-1">😱 Psychologische Spanning Zonder Audio</span>
                Zonder geluidschip creëerde Evans pure doodsangst via de iconische tekstupdates: <em>&ldquo;Rex lies in wait&rdquo;</em>, <em>&ldquo;Footsteps approaching&rdquo;</em>, en het angstaanjagende <em>&ldquo;REX HAS SEEN YOU! RUN!!&rdquo;</em>.
              </div>
            </div>
          </div>

          {/* Section 3: De Beroemde RAM Pack Wobble */}
          <div className="space-y-2">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Eye className="w-4 h-4 text-cyan-400" />
              <span>{lang === 'nl' ? 'Het Mysterie van de 16K RAM Pack' : 'The Legendary 16K RAM Pack Wobble'}</span>
            </h4>
            <p className="text-neutral-300 text-xs">
              De standaard ZX81 had slechts 1 Kilobyte geheugen. Om <em>3D Monster Maze</em> te kunnen draaien was de beruchte <strong>16K RAM Pack</strong> vereist die achterin de computer werd geprikt. Raakte je het bureau iets te hard aan, dan bewoog de module (&ldquo;RAM pack wobble&rdquo;) en crashte de hele computer direct naar een wit scherm!
            </p>
          </div>

          {/* Quote */}
          <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-[11px] font-mono text-emerald-200 flex items-center gap-2">
            <span>🦖</span>
            <span>
              <strong>Tip voor overleving:</strong> Blijf niet stilstaan als Rex je ziet! Draai snel om met <code>[0]</code> of <code>[5]</code>/<code>[8]</code> en duik een zijgang in om zijn zichtlijn te breken.
            </span>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-neutral-800 bg-neutral-950/90">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-bold text-neutral-300 cursor-pointer"
          >
            {lang === 'nl' ? 'Sluiten' : 'Close'}
          </button>

          {onPlay && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onPlay();
              }}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-400 via-teal-500 to-emerald-500 hover:from-emerald-300 text-black text-xs font-black tracking-wider flex items-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.5)] cursor-pointer active:scale-95"
            >
              <Play className="w-4 h-4 fill-black" />
              <span>{lang === 'nl' ? 'SPEEL 3D MONSTER MAZE' : 'PLAY 3D MONSTER MAZE'}</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
