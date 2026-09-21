/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Space Quest I: The Sarien Encounter (1986, Sierra On-Line)
 * Historical Dossier Modal
 */

import React from 'react';
import { X, Rocket, Sparkles, BookOpen, Award, Terminal } from 'lucide-react';

interface SpaceQuestHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: 'nl' | 'en';
}

export const SpaceQuestHistoryModal: React.FC<SpaceQuestHistoryModalProps> = ({
  isOpen,
  onClose,
  lang
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto bg-neutral-900 border-2 border-cyan-500/40 rounded-3xl p-6 shadow-[0_0_50px_rgba(6,182,212,0.3)] text-neutral-200 font-sans">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-2xl bg-cyan-500/20 border border-cyan-400 text-cyan-300">
            <Rocket className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black font-mono text-cyan-300 tracking-wide">
              SPACE QUEST: CHAPTER I
            </h2>
            <div className="text-xs text-neutral-400 font-mono">
              The Sarien Encounter (1986, Sierra On-Line / Two Guys from Andromeda)
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="space-y-4 text-xs sm:text-sm text-neutral-300 leading-relaxed">
          <div className="bg-cyan-950/40 border border-cyan-800/60 rounded-2xl p-4">
            <h3 className="text-sm font-bold text-cyan-300 flex items-center gap-1.5 mb-1.5 font-mono">
              <Sparkles className="w-4 h-4 text-yellow-400" />
              {lang === 'nl' ? 'De Oorsprong: The Two Guys from Andromeda' : 'Origins: The Two Guys from Andromeda'}
            </h3>
            <p>
              {lang === 'nl'
                ? 'Na het monumentale succes van King’s Quest (1984) wilden Sierra-ontwikkelaars Mark Crowe en Scott Murphy een sci-fi parodie maken. Ze noemden zichzelf "The Two Guys from Andromeda" en creëerden Roger Wilco: geen nobele ridder, maar een luie conciërge die per ongeluk het universum redt met een bezem in de hand.'
                : 'Following the breakthrough of King’s Quest (1984), Sierra creators Mark Crowe and Scott Murphy pitched a tongue-in-cheek sci-fi comedy. Dubbing themselves "The Two Guys from Andromeda", they introduced Roger Wilco: not a dashing hero, but a bumbling janitor who saves the galaxy with a push-broom.'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-neutral-800/80 border border-neutral-700 rounded-2xl p-3.5">
              <h4 className="font-bold text-amber-400 text-xs uppercase tracking-wider font-mono flex items-center gap-1.5 mb-1">
                <Terminal className="w-3.5 h-3.5" />
                {lang === 'nl' ? 'Sierra AGI Engine' : 'Sierra AGI Engine'}
              </h4>
              <p className="text-xs text-neutral-400">
                {lang === 'nl'
                  ? 'Space Quest I draaide op de legendarische Adventure Game Interpreter (AGI), die 160x200 gerenderde pixels met 16-kleuren EGA/PCjr combineerde met een realtime commando-interpreter.'
                  : 'Space Quest I ran on the iconic Adventure Game Interpreter (AGI), blending 16-color EGA/PCjr graphics with real-time text parsing.'}
              </p>
            </div>

            <div className="bg-neutral-800/80 border border-neutral-700 rounded-2xl p-3.5">
              <h4 className="font-bold text-emerald-400 text-xs uppercase tracking-wider font-mono flex items-center gap-1.5 mb-1">
                <Award className="w-3.5 h-3.5" />
                {lang === 'nl' ? 'Culturele Erfenis' : 'Cultural Legacy'}
              </h4>
              <p className="text-xs text-neutral-400">
                {lang === 'nl'
                  ? 'Met meer dan 100.000 verkochte exemplaren in het eerste jaar lanceerde Space Quest een 6-delige franchise vol hilarische sterfgevallen, slapstick-humor en parodieën op Star Wars en Star Trek.'
                  : 'Selling over 100,000 copies in its debut year, Space Quest launched a 6-game franchise renowned for its hilarious deaths, slapstick wit, and satirical parodies of sci-fi classics.'}
              </p>
            </div>
          </div>

          <div className="bg-neutral-800/60 border border-neutral-700/80 rounded-2xl p-4">
            <h4 className="font-bold text-cyan-400 text-xs uppercase tracking-wider font-mono mb-1.5">
              {lang === 'nl' ? 'Belangrijke Tips voor Roger Wilco:' : 'Essential Tips for Roger Wilco:'}
            </h4>
            <ul className="list-disc list-inside space-y-1 text-xs text-neutral-300">
              <li>
                {lang === 'nl'
                  ? 'Vergeet je bezem niet in de bezemkast!'
                  : 'Never leave your janitor broom behind!'}
              </li>
              <li>
                {lang === 'nl'
                  ? 'Doorzoek arme Jerry in de gang voor zijn magnetische pas.'
                  : 'Search fallen crewman Jerry in the hallway to acquire his keycard.'}
              </li>
              <li>
                {lang === 'nl'
                  ? 'Haal de Sterrengenerator cassette op in het Data Archief voordat je de capsule lanceert!'
                  : 'Eject the Star Generator data crystal in the Data Archive before launching the escape pod!'}
              </li>
              <li>
                {lang === 'nl'
                  ? 'Gebruik de gebogen spiegelscherf om de dodelijke hittelaser van de Orat te weerkaatsen!'
                  : 'Use the reflective glass shard to deflect the deadly heat blast of the Orat!'}
              </li>
            </ul>
          </div>
        </div>

        {/* Footer close action */}
        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-neutral-950 font-bold font-mono text-xs cursor-pointer transition"
          >
            {lang === 'nl' ? 'SLUIT DOSSIER' : 'CLOSE DOSSIER'}
          </button>
        </div>
      </div>
    </div>
  );
};
