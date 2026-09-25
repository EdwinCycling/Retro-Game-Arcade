/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Radarsoft 3D Tic Tac Toe (1984) Historical Dossier
 * Celebrating Cees Kramer, John Vanderaart ("Dr. John") & Radarsoft Utrecht's Inaugural C64 Game
 */

import React from 'react';
import { X, Award, Cpu, BookOpen, Sparkles, Play, Layers, Compass, Brain } from 'lucide-react';
import { Language } from '../i18n/lobbyTranslations';

interface Radarsoft3DTicTacToeHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlayGame?: () => void;
  lang: Language;
}

export const Radarsoft3DTicTacToeHistoryModal: React.FC<Radarsoft3DTicTacToeHistoryModalProps> = ({
  isOpen,
  onClose,
  onPlayGame,
  lang
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-slate-900 border-2 border-cyan-500/60 rounded-2xl shadow-2xl text-slate-100 p-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
          aria-label="Sluiten"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-4 mb-6 border-b border-cyan-500/30 pb-5">
          <div className="p-3.5 bg-cyan-950 border border-cyan-500/50 rounded-2xl text-3xl shadow-[0_0_15px_rgba(56,189,248,0.25)]">
            🎲
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold">
                COMMODORE 64 • 1984
              </span>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/40">
                RADARSOFT DEBUT
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-wide text-white mt-1">
              3D TIC TAC TOE (1984)
            </h2>
            <p className="text-xs text-cyan-400 font-mono">
              {lang === 'nl'
                ? 'Door Cees Kramer & John Vanderaart ("Dr. John") • Radarsoft B.V. (Utrecht)'
                : 'By Cees Kramer & John Vanderaart ("Dr. John") • Radarsoft B.V. (Utrecht, Netherlands)'}
            </p>
          </div>
        </div>

        {/* Content Sections */}
        <div className="space-y-6 text-sm leading-relaxed text-slate-300">
          {/* Historical Essay */}
          <div>
            <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-cyan-400" />
              <span>
                {lang === 'nl' 
                  ? 'Het Verhaal Achter Radarsoft’s Eerste Officiële Meesterwerk'
                  : 'The Origin of Radarsoft’s Inaugural Commercial Title'}
              </span>
            </h3>
            {lang === 'nl' ? (
              <div className="space-y-3">
                <p>
                  In het voorjaar van <strong>1984</strong> besloten wiskundestudent <strong>Cees Kramer</strong> en de in de Nederlandse computerwereld al legendarische hacker/schrijver <strong>John Vanderaart</strong> (in de C64-scene beroemd en berucht als <em>"Dr. John"</em>) de handen ineen te slaan. In Utrecht richtten zij <strong>Radarsoft B.V.</strong> op.
                </p>
                <p>
                  Voordat het duo heel Nederland veroverde met culturele monumenten zoals <em>Eindeloos</em>, <em>Topografie Nederland</em>, <em>Topografie Europa</em> en <em>De Tempel van Karma</em>, debuteerde de studio met een diepgaande wiskundige denksport: <strong>3D Tic Tac Toe</strong> voor de Commodore 64!
                </p>
                <p>
                  In tegenstelling tot het klassieke 3×3 boter-kaas-en-eieren (dat met correct spel altijd op een gelijkspel uitdraait), bracht Radarsoft de dimensionale variant <strong>4×4×4 Qubic</strong> naar de huiskamer. Met 64 posities verdeeld over 4 transparante niveaus en maar liefst <strong>76 winlijnen</strong> vereiste het spel enorm ruimtelijk inzicht en geavanceerde patroonherkenning.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <p>
                  In early <strong>1984</strong>, mathematics student <strong>Cees Kramer</strong> and pioneering Dutch microcomputer author <strong>John Vanderaart</strong> (widely renowned across the European C64 scene as <em>"Dr. John"</em>) joined forces in Utrecht to establish <strong>Radarsoft B.V.</strong>
                </p>
                <p>
                  Before the Utrecht studio went on to dominate schools and living rooms across the Netherlands with cultural landmarks like <em>Eindeloos (Endless)</em>, <em>Topografie Nederland</em>, <em>Topografie Europa</em>, and <em>The Temple of Karma</em>, Radarsoft launched its very first commercial title: <strong>3D Tic Tac Toe</strong> for the Commodore 64!
                </p>
                <p>
                  Unlike standard 3×3 tic-tac-toe (which is trivial and always draws with optimal play), Radarsoft implemented the <strong>4×4×4 Qubic</strong> format. Featuring 64 playable coordinates across 4 stacked levels and <strong>76 simultaneous winning lines</strong>, the game demanded intense spatial visualization and forward planning.
                </p>
              </div>
            )}
          </div>

          {/* Mathematical Anatomy: 76 Lines */}
          <div className="bg-slate-950/80 border border-cyan-500/30 rounded-xl p-4 space-y-2">
            <h4 className="text-sm font-bold text-cyan-300 flex items-center gap-2">
              <Brain className="w-4 h-4 text-cyan-400" />
              <span>
                {lang === 'nl'
                  ? 'Wiskundige Diepgang: De 76 Winlijnen van Qubic'
                  : 'Mathematical Architecture: The 76 Winning Lines of Qubic'}
              </span>
            </h4>
            <p className="text-xs text-slate-300">
              {lang === 'nl'
                ? 'In 1980 bewees wiskundige Oren Patashnik na 1.500 uur aan mainframe-berekeningen dat de eerste speler een geforceerde winst kan behalen in 4×4×4 Qubic. De complexiteit schuilt in de 76 mogelijke 4-op-een-rij combinaties:'
                : 'In 1980, mathematician Oren Patashnik proved after 1,500 hours of mainframe computing that the first player has a theoretical forced win in 4×4×4 Qubic. The astonishing depth emerges from 76 winning vectors:'}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-2 font-mono text-xs">
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-cyan-400 font-bold block text-sm">48 Axiaal</span>
                <span className="text-slate-400 text-[11px]">16 Horizontaal (X), 16 Diepte (Y), 16 Verticale Pilaren (Z)</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-amber-400 font-bold block text-sm">24 Vlak-Diagonaal</span>
                <span className="text-slate-400 text-[11px]">8 per vlakrichting (XY-lagen, XZ-schijven, YZ-schijven)</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-purple-400 font-bold block text-sm">4 3D Ruimtelijk</span>
                <span className="text-slate-400 text-[11px]">Lopen dwars door het hart van hoek naar tegenhoek</span>
              </div>
            </div>
          </div>

          {/* Strategic Insight */}
          <div>
            <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" />
              <span>
                {lang === 'nl' ? 'Strategieën & Vorktechniek' : 'Strategy & The Fork Technique'}
              </span>
            </h3>
            {lang === 'nl' ? (
              <p className="text-xs text-slate-300">
                Slechts 16 van de 64 posities nemen deel aan <strong>7 winlijnen</strong>: de 8 uiterste hoekpunten van de kubus én de 8 posities in de binnenste kern (de 2×2×2 subkubus). De overige 48 posities hebben slechts 4 winlijnen. De sleutel tot winst is het leggen van een <em>vork</em>: een zet waarmee je twee verschillende 3-op-een-rij lijnen tegelijkertijd opent, waardoor de tegenstander slechts één lijn kan blokkeren!
              </p>
            ) : (
              <p className="text-xs text-slate-300">
                Only 16 of the 64 cells participate in <strong>7 winning lines</strong>: the 8 exterior corners of the cube and the 8 inner-core cells (the inner 2×2×2 block). The other 48 cells only participate in 4 lines. The key to mastery is crafting a <em>fork</em>: placing a bead that creates two separate 3-in-a-row threats simultaneously, leaving your opponent unable to block both!
              </p>
            )}
          </div>

          {/* Hardware Specifications */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4">
            <h4 className="text-xs uppercase tracking-wider text-slate-400 font-mono mb-3 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-cyan-400" />
              <span>{lang === 'nl' ? 'Hardware & Technische Specificaties' : 'Hardware & Technical Specifications'}</span>
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
              <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-500 block text-[10px]">SYSTEEM</span>
                <span className="text-cyan-300 font-bold">Commodore 64</span>
              </div>
              <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-500 block text-[10px]">CPU</span>
                <span className="text-cyan-300 font-bold">MOS 6510 (0.985 MHz)</span>
              </div>
              <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-500 block text-[10px]">GELUIDSCHIP</span>
                <span className="text-amber-400 font-bold">MOS 6581 SID</span>
              </div>
              <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-500 block text-[10px]">MEDIA</span>
                <span className="text-purple-300 font-bold">C64 Cassette / Floppy</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
          <div className="text-xs font-mono text-slate-400">
            {lang === 'nl' ? '1984 Radarsoft B.V. • Utrecht, Nederland' : '1984 Radarsoft B.V. • Utrecht, Netherlands'}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs transition-colors"
            >
              {lang === 'nl' ? 'Sluiten' : 'Close'}
            </button>
            {onPlayGame && (
              <button
                onClick={() => {
                  onClose();
                  onPlayGame();
                }}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono font-bold text-xs shadow-[0_0_15px_#38bdf8] transition-colors"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{lang === 'nl' ? 'SPEEL NU' : 'PLAY NOW'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
