/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Historical Dossier Modal for Nokia Snake (1997 / Nokia 6110 & 3310)
 */

import React from 'react';
import { X, Trophy, BookOpen, Smartphone, Sparkles, Cpu, Award } from 'lucide-react';

interface NokiaSnakeHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: 'nl' | 'en';
}

export const NokiaSnakeHistoryModal: React.FC<NokiaSnakeHistoryModalProps> = ({ isOpen, onClose, lang }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative w-full max-w-2xl bg-neutral-950 border border-emerald-500/40 rounded-2xl shadow-[0_0_50px_rgba(16,185,129,0.25)] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-neutral-800 bg-gradient-to-r from-emerald-950/50 via-neutral-900 to-emerald-950/20">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-mono font-black text-white tracking-wide flex items-center gap-2">
                NOKIA SNAKE
                <span className="text-xs px-2 py-0.5 rounded bg-emerald-500 text-black font-bold">1997</span>
              </h2>
              <p className="text-xs text-neutral-400 font-mono">
                Taneli Armanto • Nokia 6110 / 3210 / 3310 • Espoo, Finland
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-neutral-300 font-mono text-xs sm:text-sm leading-relaxed">
          {/* Highlight Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-neutral-900/90 border border-neutral-800 flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <div className="text-[10px] text-neutral-500 uppercase">{lang === 'nl' ? 'Display' : 'Display'}</div>
                <div className="font-bold text-white text-xs">84 × 48 Monochroom</div>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-neutral-900/90 border border-neutral-800 flex items-center gap-3">
              <Award className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <div className="text-[10px] text-neutral-500 uppercase">{lang === 'nl' ? 'Spelers' : 'Players'}</div>
                <div className="font-bold text-white text-xs">400+ Miljoen Toestellen</div>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-neutral-900/90 border border-neutral-800 flex items-center gap-3">
              <Cpu className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <div className="text-[10px] text-neutral-500 uppercase">{lang === 'nl' ? 'Hardware' : 'Hardware'}</div>
                <div className="font-bold text-white text-xs">Piezo Buzzer Mono</div>
              </div>
            </div>
          </div>

          {/* Detailed History Sections */}
          <div className="space-y-4">
            <div>
              <h3 className="text-white font-bold text-sm mb-1 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-emerald-400" />
                {lang === 'nl' ? 'De Geboorte van Mobiel Gamen (1997)' : 'The Birth of Mobile Gaming (1997)'}
              </h3>
              <p>
                {lang === 'nl'
                  ? 'In 1997 kreeg de Finse ingenieur Taneli Armanto bij Nokia in Espoo de opdracht om een eenvoudig spel te ontwerpen voor de Nokia 6110. Het spel moest draaien op een extreem gelimiteerde microprocessor en een groen-grijs monochroom LCD-schermpje van amper 84 bij 48 pixels. Armanto koos voor het klassieke concept van de slang die groeit bij elk gegeten blokje.'
                  : 'In 1997, Finnish Nokia engineer Taneli Armanto in Espoo was tasked with creating a lightweight game for the upcoming Nokia 6110 business phone. Working within extreme memory constraints and an 84x48 monochrome LCD, he crafted Snake—the game that ignited the mobile gaming industry.'}
              </p>
            </div>

            <div>
              <h3 className="text-white font-bold text-sm mb-1 flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-emerald-400" />
                {lang === 'nl' ? 'De Legendarische Nokia 3310 & Numerieke Toetsen' : 'The Legendary Nokia 3310 & Keypad'}
              </h3>
              <p>
                {lang === 'nl'
                  ? 'Met de introductie van de onverwoestbare Nokia 3210 (1999) en Nokia 3310 (2000) werd Snake een cultureel wereldfenomeen. Iedereen speelde het onder de schoolbanken, in de bus en in vergaderingen. De bediening met de cijfertoetsen (2 voor omhoog, 8 voor omlaag, 4 voor links en 6 voor rechts) zit in het spiergeheugen van een hele generatie gebrand.'
                  : 'With the arrival of the indestructible Nokia 3210 (1999) and 3310 (2000), Snake became an unprecedented cultural obsession. The tactile numeric keypad controls (2 = Up, 8 = Down, 4 = Left, 6 = Right) became second nature to hundreds of millions of players.'}
              </p>
            </div>

            <div>
              <h3 className="text-white font-bold text-sm mb-1 flex items-center gap-2">
                <Trophy className="w-4 h-4 text-emerald-400" />
                {lang === 'nl' ? 'Technische Feiten & Geluid' : 'Technical Facts & Audio'}
              </h3>
              <p>
                {lang === 'nl'
                  ? 'Het spel bevatte geen muziek, maar uitsluitend rauwe, charmante 8-bit piezo piepjes wanneer een stip werd gegeten en een neerwaartse toon bij een botsing tegen de wand. Zelfs de beroemde Nokia ringtone (Grande Valse van Francisco Tárrega) werd door miljoenen gebruikers direct herkend.'
                  : 'The game featured pure monophonic square-wave piezo beeps for food collection and a signature buzzing crash frequency. Coupled with the iconic Nokia tune (Francisco Tárrega’s Grande Valse), it established the sound of late 90s mobile technology.'}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-800 bg-neutral-900/60 flex items-center justify-between text-xs text-neutral-400">
          <span>{lang === 'nl' ? 'Originele release: December 1997' : 'Original release: December 1997'}</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-black font-bold font-mono transition-colors"
          >
            {lang === 'nl' ? 'Sluiten & Spelen' : 'Close & Play'}
          </button>
        </div>
      </div>
    </div>
  );
};
