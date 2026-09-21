/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Rocket Raid History & BBC Micro / Acorn Dossier Modal
 */

import React from 'react';
import { Award, Zap, ShieldAlert, Play, Sparkles, Rocket, Tv, Radio } from 'lucide-react';

interface RocketRaidHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlay: () => void;
}

export const RocketRaidHistoryModal: React.FC<RocketRaidHistoryModalProps> = ({
  isOpen,
  onClose,
  onPlay,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in select-none">
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-neutral-900 border-2 border-pink-500/70 rounded-3xl p-5 sm:p-7 shadow-[0_0_60px_rgba(236,72,153,0.35)] text-neutral-200 overflow-y-auto font-sans flex flex-col justify-between">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-pink-500/20 border border-pink-500/40 flex items-center justify-center text-xl shadow-inner">
              🚀
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black font-mono text-pink-400 tracking-wider">
                ROCKET RAID (1982)
              </h2>
              <p className="text-xs text-neutral-400 font-mono">
                Acornsoft • Jonathan Griffiths • BBC Micro Model B &amp; Acorn Electron
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white flex items-center justify-center transition cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Content Body */}
        <div className="my-5 space-y-5 text-xs sm:text-sm text-neutral-300 leading-relaxed font-sans">
          
          {/* Milestone Badge */}
          <div className="p-3.5 rounded-2xl bg-pink-950/30 border border-pink-600/40 flex items-start gap-3 text-xs">
            <Award className="w-5 h-5 text-pink-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-pink-300 block mb-0.5">
                De Iconische Side-Scrolling Schietsensatie van Acornsoft
              </span>
              Uitgebracht in 1982 door Acornsoft en geschreven door Jonathan Griffiths. Rocket Raid bracht de razendsnelle arcade-actie van Konami&apos;s <em>Scramble</em> rechtstreeks naar de huiskamers op de BBC Microcomputer en Acorn Electron.
            </div>
          </div>

          {/* Acorn Grijs & Monitor Experience */}
          <div className="p-3.5 rounded-2xl bg-neutral-800/60 border border-neutral-700/60 flex items-start gap-3 text-xs">
            <Tv className="w-5 h-5 text-neutral-300 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-neutral-200 block mb-0.5">
                De Legendarische &apos;Acorn Grijs&apos; Monitor Ervaring
              </span>
              In de jaren &apos;80 sloten veel scholieren en gamers hun BBC Micro of Acorn Electron aan op een monochrome grijze of zwart-wit monitor (of portable B&amp;W TV). Deze monochrome weergave gaf het spel een haarscherp militair radar-gevoel met contrasterende grijstinten. In deze gameversie kun je met één klik schakelen tussen de originele <strong>BBC Acorn Grijs Monochroom</strong> modus en de <strong>Mode 2 Kleurenmodus</strong>!
            </div>
          </div>

          {/* 5 Sections breakdown */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 font-mono font-bold text-pink-400 text-xs uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              <span>De 5 Aaneengesloten Fasen (4 Terrein Zones + Eindbasis)</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
              <div className="p-2.5 rounded-xl bg-neutral-800/80 border border-neutral-700">
                <span className="text-pink-400 font-bold block">1. LUNAR OUTPOST</span>
                Heuvels, ondergrondse raket-silo&apos;s die omhoog schieten, brandstoftanks en radarposten.
              </div>
              <div className="p-2.5 rounded-xl bg-neutral-800/80 border border-neutral-700">
                <span className="text-cyan-400 font-bold block">2. CAVERN &amp; DANCING MINES</span>
                Lage grot met plafond en vloer, gevuld met dansende buitenaardse mijnen en vliegende schotels.
              </div>
              <div className="p-2.5 rounded-xl bg-neutral-800/80 border border-neutral-700">
                <span className="text-emerald-400 font-bold block">3. METEOR CANYON</span>
                Vlijmscherpe bergpieken waar vurige meteoren met hoge snelheid doorheen suizen.
              </div>
              <div className="p-2.5 rounded-xl bg-neutral-800/80 border border-neutral-700">
                <span className="text-blue-400 font-bold block">4. SKYSCRAPER CITY</span>
                Torenhoge wolkenkrabbers die millimeternauwkeurige vlieghoogte en bommenworp vereisen.
              </div>
              <div className="p-2.5 rounded-xl bg-neutral-800/80 border border-neutral-700 sm:col-span-2">
                <span className="text-amber-400 font-bold block">5. YELLOW COMMAND MAZE &amp; CORE</span>
                Het beruchte, claustrofobische doolhof dat leidt naar de pulserende vijandelijke reactor!
              </div>
            </div>
          </div>

          {/* Dubbele Bewapening & Brandstof */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 font-mono font-bold text-amber-400 text-xs uppercase tracking-wider">
              <Rocket className="w-4 h-4" />
              <span>Dubbele Bewapening &amp; Brandstofbeheer</span>
            </div>
            <p className="text-xs text-neutral-300">
              Je ruimteschip beschikt over twee gescheiden wapensystemen: een <strong>voorwaarts laserkanon</strong> (Spatie / Enter) voor vliegende doelen en meteoren, en <strong>afwerpbare bommen</strong> met een realistische parabolische valbaan (B / Tab / Shift) om gronddoelen, silo&apos;s en brandstoftanks te vernietigen.
            </p>
            <p className="text-xs text-neutral-400">
              Houd de <strong>FUEL-meter</strong> in de gaten: vliegen verbruikt continu brandstof. Vernietig <span className="text-sky-400 font-bold font-mono">FUEL</span> depots voor extra punten en een volle tank!
            </p>
          </div>

          {/* Technische Specificaties */}
          <div className="p-3 rounded-2xl bg-neutral-950 border border-neutral-800 font-mono text-[11px] grid grid-cols-2 gap-2 text-neutral-400">
            <div><span className="text-neutral-500">Ontwikkelaar:</span> Jonathan Griffiths</div>
            <div><span className="text-neutral-500">Uitgever:</span> Acornsoft Limited (1982)</div>
            <div><span className="text-neutral-500">Platform:</span> BBC Micro (Model B) &amp; Electron</div>
            <div><span className="text-neutral-500">Grafische Modus:</span> Mode 2 (160x256 / 320x240)</div>
            <div><span className="text-neutral-500">Geluidssynthese:</span> TI SN76489 / 6502 Synthesizer</div>
            <div><span className="text-neutral-500">Drager:</span> Compact Cassette &amp; 5.25&quot; DFS Floppy</div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-neutral-800 gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-mono font-bold cursor-pointer transition"
          >
            Sluiten
          </button>
          
          <button
            type="button"
            onClick={() => {
              onClose();
              onPlay();
            }}
            className="px-6 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-400 hover:to-rose-500 text-white font-mono font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-[0_0_20px_rgba(236,72,153,0.5)] cursor-pointer transition active:scale-95"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Start Rocket Raid</span>
          </button>
        </div>

      </div>
    </div>
  );
};
