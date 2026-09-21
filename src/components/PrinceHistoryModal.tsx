/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Historical Dossier Modal for Prince of Persia (1989/1990)
 */

import React from 'react';
import { X, Trophy, BookOpen, Clock, Shield, Sparkles, Sword } from 'lucide-react';

interface PrinceHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: 'nl' | 'en';
}

export const PrinceHistoryModal: React.FC<PrinceHistoryModalProps> = ({ isOpen, onClose, lang }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative w-full max-w-2xl bg-neutral-950 border border-amber-500/40 rounded-2xl shadow-[0_0_50px_rgba(245,158,11,0.25)] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-neutral-800 bg-gradient-to-r from-amber-950/40 via-neutral-900 to-amber-950/20">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400">
              <Sword className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-mono font-black text-white tracking-wide flex items-center gap-2">
                PRINCE OF PERSIA
                <span className="text-xs px-2 py-0.5 rounded bg-amber-500 text-black font-bold">1989/1990</span>
              </h2>
              <p className="text-xs text-neutral-400 font-mono">
                {lang === 'nl' 
                  ? 'Jordan Mechner • Brøderbund Software • MS-DOS / Amiga'
                  : 'Jordan Mechner • Brøderbund Software • MS-DOS / Amiga'}
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
              <Sparkles className="w-5 h-5 text-amber-400 shrink-0" />
              <div>
                <div className="text-[10px] text-neutral-500 uppercase">{lang === 'nl' ? 'Technologie' : 'Technology'}</div>
                <div className="font-bold text-white text-xs">Rotoscoping VHS</div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-neutral-900/90 border border-neutral-800 flex items-center gap-3">
              <Clock className="w-5 h-5 text-amber-400 shrink-0" />
              <div>
                <div className="text-[10px] text-neutral-500 uppercase">{lang === 'nl' ? 'Tijdlimiet' : 'Time Limit'}</div>
                <div className="font-bold text-white text-xs">60 Min Realtime</div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-neutral-900/90 border border-neutral-800 flex items-center gap-3">
              <Shield className="w-5 h-5 text-amber-400 shrink-0" />
              <div>
                <div className="text-[10px] text-neutral-500 uppercase">{lang === 'nl' ? 'Erfenis' : 'Legacy'}</div>
                <div className="font-bold text-white text-xs">Tomb Raider & AC</div>
              </div>
            </div>
          </div>

          {/* Story & History */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-amber-300 flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              {lang === 'nl' ? 'De Geboorte van een Legende (1989 - 1990)' : 'The Birth of a Legend (1989 - 1990)'}
            </h3>
            <p className="text-neutral-400">
              {lang === 'nl'
                ? 'Terwijl tiran en boze vizier Jaffar de troon opeist in het oude Perzië, sluit hij de dochter van de sultan op in de hoogste toren. Ze krijgt precies 60 minuten om met hem te trouwen of te sterven. De speler, een dappere jonge reiziger, wordt in de diepste kerkers gegooid en moet rennen, springen en duelleren om haar te redden.'
                : 'While evil grand vizier Jaffar seizes the Persian throne, he locks the Sultan’s daughter in the highest tower with an ultimatum: marry him within 60 minutes or perish. You, an unnamed adventurer, are thrown into the dungeon depths and must run, leap, and fight your way to freedom.'}
            </p>
          </div>

          {/* Rotoscoping Tech */}
          <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/30 space-y-2">
            <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
              {lang === 'nl' ? 'De Rotoscoping Revolutie' : 'The Rotoscoping Revolution'}
            </h4>
            <p className="text-neutral-300 text-xs">
              {lang === 'nl'
                ? 'Bedenker Jordan Mechner filmde zijn 15-jarige broer David in witte kleding terwijl deze rende en sprong op een parkeerplaats. Mechner traceerde elk afzonderlijk VHS-videobeeld handmatig frame-voor-frame om te digitaliseren naar pixel art. Het resultaat was een ongeëvenaard vloeiende gewichts- en momentum-simulatie die tot op de dag van vandaag bewonderd wordt.'
                : 'Creator Jordan Mechner filmed his 15-year-old brother David in white clothes running, leaping, and climbing in a parking lot. Mechner painstakingly traced each VHS video frame by hand onto tracing paper to transfer into pixel art. The result was a breathtaking simulation of human weight and momentum that changed video game animation forever.'}
            </p>
          </div>

          {/* Controls Guide */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              {lang === 'nl' ? 'Besturing & Tips' : 'Controls & Dungeon Secrets'}
            </h4>
            <ul className="list-disc list-inside space-y-1 text-neutral-400 text-xs">
              <li><strong className="text-amber-300">Pijltjes / WASD:</strong> {lang === 'nl' ? 'Rennen, bukken en springen.' : 'Run, crouch and jump.'}</li>
              <li><strong className="text-amber-300">Shift / Z (Tiptoe / Hang):</strong> {lang === 'nl' ? 'Behoedzaam stappen (voorkomt dat spikes je spietsen!) en richels vastgrijpen.' : 'Careful step (avoids spikes!) and grab ledges.'}</li>
              <li><strong className="text-amber-300">Spatiebalk / Enter / X:</strong> {lang === 'nl' ? 'Zwaard trekken en aanvallen.' : 'Draw sword and strike.'}</li>
              <li><strong className="text-amber-300">Pijl Omhoog (in duel):</strong> {lang === 'nl' ? 'Pareren van zwaardaanvallen.' : 'Parry incoming sword strikes.'}</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-800 bg-neutral-900 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-mono font-bold text-xs transition-colors cursor-pointer"
          >
            {lang === 'nl' ? 'Sluiten & Spelen' : 'Close & Play'}
          </button>
        </div>
      </div>
    </div>
  );
};
