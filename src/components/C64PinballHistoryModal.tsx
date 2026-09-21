/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 3D PINBALL POWER - Historic Dossier & Technical Manual
 */

import React from 'react';
import { X, Sparkles, Cpu, Award, BookOpen, Disc, Play } from 'lucide-react';
import { getC64PinballScores } from '../game/c64PinballHighScores';
import { Language } from '../i18n/lobbyTranslations';

interface C64PinballHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlay?: () => void;
  lang?: Language;
}

export const C64PinballHistoryModal: React.FC<C64PinballHistoryModalProps> = ({
  isOpen,
  onClose,
  onPlay,
  lang = 'nl'
}) => {
  if (!isOpen) return null;

  const scores = getC64PinballScores();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-neutral-900 border-2 border-blue-500 rounded-2xl shadow-[0_0_40px_rgba(59,130,246,0.35)] p-6 text-neutral-200 font-mono">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-white rounded-lg bg-neutral-800 hover:bg-neutral-700 transition cursor-pointer"
          aria-label="Sluiten"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6 border-b border-blue-900 pb-4">
          <div className="p-3 bg-blue-950/80 border border-blue-500 rounded-xl text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.4)]">
            <Disc className="w-8 h-8 text-yellow-400" />
          </div>
          <div>
            <div className="text-xs uppercase tracking-widest text-cyan-400 font-bold">
              Virgin Mastertronic · 1989 · Commodore 64
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-wider">
              3D PINBALL POWER
            </h2>
            <p className="text-xs text-neutral-400">
              Ontwikkeld door Stephen Walters · Pseudo-3D Flipperkast Sensatie
            </p>
          </div>
        </div>

        {/* Content sections */}
        <div className="space-y-6 text-sm text-neutral-300 leading-relaxed">
          {/* Historical Overview */}
          <div className="bg-neutral-950/80 border border-neutral-800 rounded-xl p-4">
            <h3 className="text-cyan-300 font-bold text-base flex items-center gap-2 mb-2">
              <BookOpen className="w-4 h-4 text-yellow-400" />
              <span>{lang === 'nl' ? 'De Historische Betekenis' : 'Historical Background'}</span>
            </h3>
            <p>
              {lang === 'nl'
                ? 'In 1989 bracht Virgin Mastertronic onder het befaamde budgetlabel "3D Pinball Power" uit voor de Commodore 64. Waar eerdere flipperkastspellen zoals David’s Midnight Magic en Pinball Construction Set werkten met een plat 2D-bovenaanzicht, wist programmeur Stephen Walters met slimme wiskunde een overtuigend schuin 3D-perspectief te creëren op de bescheiden 0.985 MHz 6510-processor van de C64.'
                : 'In 1989, Virgin Mastertronic released "3D Pinball Power" on the Commodore 64. Unlike earlier 2D top-down simulators like David’s Midnight Magic, developer Stephen Walters used optimized assembly mathematics to render a smooth pseudo-3D angled perspective on the C64’s 0.985 MHz 6510 CPU.'}
            </p>
          </div>

          {/* Technical Feats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-neutral-950/80 border border-neutral-800 rounded-xl p-4">
              <h4 className="text-yellow-400 font-bold flex items-center gap-2 mb-2 text-xs uppercase tracking-wider">
                <Cpu className="w-4 h-4 text-cyan-400" />
                <span>VIC-II &amp; SID 6581 Audio</span>
              </h4>
              <p className="text-xs text-neutral-400">
                {lang === 'nl'
                  ? 'De SID-chip zorgde voor realistische mechanische flipperklakken, resonant klinkende pop-bumpers en triomfantelijke arpeggio-fanfares bij het behalen van bonussen en multipliers.'
                  : 'The MOS 6581 SID chip delivered authentic solenoid clacks, resonant pop bumper thumps, and signature British chiptune fanfare upon completing drop target banks.'}
              </p>
            </div>

            <div className="bg-neutral-950/80 border border-neutral-800 rounded-xl p-4">
              <h4 className="text-yellow-400 font-bold flex items-center gap-2 mb-2 text-xs uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-yellow-400" />
                <span>Fysica &amp; Mechanismen</span>
              </h4>
              <p className="text-xs text-neutral-400">
                {lang === 'nl'
                  ? 'Het spel bevatte alle klassieke speelelementen: 3 Pop Bumpers, een Black Hole sinkhole, Tombstone Drop Targets voor 2X-5X multipliers, en een dynamische Nudge/Tilt-beveiliging.'
                  : 'The table featured all premier mechanics: 3 active Pop Bumpers, a Black Hole sinkhole, a 3-bank of Tombstone Drop Targets for 2X-5X multiplier progression, and cabinet tilt detection.'}
              </p>
            </div>
          </div>

          {/* Table Hall of Fame */}
          <div className="bg-neutral-950/80 border border-neutral-800 rounded-xl p-4">
            <h4 className="text-cyan-300 font-bold flex items-center gap-2 mb-3 text-xs uppercase tracking-wider">
              <Award className="w-4 h-4 text-yellow-400" />
              <span>C64 Pinball Hall of Fame (Top Records)</span>
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {scores.slice(0, 6).map((sc, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 rounded bg-neutral-900 border border-neutral-800 text-xs">
                  <span className="text-yellow-400 font-bold">{idx + 1}. {sc.initials}</span>
                  <span className="text-white font-mono">{sc.score.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Game controls summary */}
          <div className="p-3 rounded-xl bg-blue-950/40 border border-blue-800/80 text-xs text-blue-200">
            <strong>{lang === 'nl' ? 'Besturing:' : 'Controls:'}</strong> {lang === 'nl' ? 'Linker Flipper: Shift / Z / Pijltje Links. Rechter Flipper: Shift / M / Pijltje Rechts. Lanceer veer: Spatiebalk / Pijltje omlaag. Kast schudden (Nudge): N-toets.' : 'Left Flipper: Shift / Z / Left Arrow. Right Flipper: Shift / M / Right Arrow. Plunger: Space / Down Arrow. Nudge: N key.'}
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="mt-6 pt-4 border-t border-neutral-800 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-bold transition cursor-pointer"
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
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-black text-xs font-black tracking-wider shadow-[0_0_20px_rgba(6,182,212,0.5)] transition flex items-center gap-2 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-black" />
              <span>{lang === 'nl' ? 'SPEEL 3D PINBALL' : 'PLAY 3D PINBALL'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
