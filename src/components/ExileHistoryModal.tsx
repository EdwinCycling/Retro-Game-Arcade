/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Exile (1988) History & BBC Micro Dossier Modal
 */

import React from 'react';
import { Award, Zap, Compass, Play, Sparkles, Shield, Cpu } from 'lucide-react';

interface ExileHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlay: () => void;
}

export const ExileHistoryModal: React.FC<ExileHistoryModalProps> = ({
  isOpen,
  onClose,
  onPlay,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in select-none">
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-neutral-900 border-2 border-yellow-500/70 rounded-3xl p-5 sm:p-7 shadow-[0_0_60px_rgba(234,179,8,0.35)] text-neutral-200 overflow-y-auto font-sans flex flex-col justify-between">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-yellow-500/20 border border-yellow-500/40 flex items-center justify-center text-xl shadow-inner">
              👨‍🚀
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black font-mono text-yellow-400 tracking-wider">
                EXILE (1988)
              </h2>
              <p className="text-xs text-neutral-400 font-mono">
                Superior Software / Acornsoft • Peter Irvin &amp; Jeremy Smith • BBC Micro Model B &amp; Master 128
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
          <div className="p-3.5 rounded-2xl bg-yellow-950/30 border border-yellow-600/40 flex items-start gap-3 text-xs">
            <Award className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-yellow-300 block mb-0.5">
                De Kroon op 8-Bit Programmeren: De Eerste Echte Physics Sandbox
              </span>
              Uitgebracht in 1988 door Superior Software en geschreven in 6502 assembly door Peter Irvin en Jeremy Smith. Exile wordt wereldwijd door computerhistorici erkend als een ongeëvenaard meesterwerk en een directe voorloper van moderne physics-games en het <em>Metroidvania</em>-genre.
            </div>
          </div>

          {/* Waarom was Exile zo revolutionair? */}
          <div>
            <h3 className="text-sm font-bold text-cyan-400 mb-1 flex items-center gap-1.5 font-mono">
              <Cpu className="w-4 h-4 text-cyan-400" />
              Volledige Newtoniaanse Natuurkunde in 32 Kilobyte RAM
            </h3>
            <p className="text-neutral-400 mb-2">
              Terwijl tijdgenoten nog werkten met statische platformersprongen, bevatte Exile een volledige natuurkundige simulatie:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-neutral-300">
              <li>
                <strong className="text-white">Traagheid, Massa &amp; Wrijving:</strong> Mike Finn vliegt met een jetpack met realistische stuwing en versnelling. Zware rotsen stuiteren, rollen van hellingen af en kunnen vijanden verpletteren.
              </li>
              <li>
                <strong className="text-white">Drijfvermogen &amp; Vloeistoffysica:</strong> In ondergrondse waterbassins drijven objecten op basis van dichtheid, terwijl Mike moet zwemmen en zuurstof verbruikt.
              </li>
              <li>
                <strong className="text-white">Windstromingen &amp; Ventilatieschachten:</strong> Hoge-druk windschachten blazen Mike, kogels en voorwerpen omhoog of opzij.
              </li>
            </ul>
          </div>

          {/* Het Verhaal & De Planeet Phoebus */}
          <div className="p-3.5 rounded-2xl bg-neutral-800/60 border border-neutral-700/60">
            <h3 className="text-sm font-bold text-yellow-400 mb-1 flex items-center gap-1.5 font-mono">
              <Compass className="w-4 h-4 text-yellow-400" />
              Missie: Planeet Phoebus &amp; De Gekke Geleerde Triax
            </h3>
            <p className="text-neutral-300">
              Je bent <strong>Commander Mike Finn</strong> van het verkenningsschip <em>Perseus</em>. Na een noodsignaal van het onderzoeksschip <em>Pericles</em> crash je op de vijandige planeet Phoebus. De doorgedraaide wetenschapper <strong>Triax</strong> heeft een ondergronds fort gebouwd met cybernetische wezens, automatische geschuttorens en vliegende bewakingsdrones.
            </p>
          </div>

          {/* Gameplay & Teleporter Gadget */}
          <div>
            <h3 className="text-sm font-bold text-green-400 mb-1 flex items-center gap-1.5 font-mono">
              <Zap className="w-4 h-4 text-green-400" />
              Innovatieve Uitrusting &amp; Het Teleport Baken
            </h3>
            <p className="text-neutral-400">
              In plaats van lineaire levels navigeer je door een enorm continu doolhof. Je beschikt over een verplaatsbaar <strong>Teleport Baken</strong>: zet het baken neer op een veilige plek en druk op <kbd className="px-1.5 py-0.5 rounded bg-neutral-800 border border-neutral-600 font-mono text-yellow-400">T</kbd> om te dematerialiseren en ogenblikkelijk terug te keren!
            </p>
          </div>

          {/* Vliegende Magpie Vogels */}
          <div className="p-3 rounded-2xl bg-cyan-950/20 border border-cyan-800/40 text-xs text-neutral-400">
            <strong className="text-cyan-300">Pas op voor de Magpie Vogels:</strong> Buitenaardse vogels in de bovenste grotten cirkelen rond en kunnen plotseling naar beneden duiken om jouw sleutels of rotsblokken uit je handen te grissen!
          </div>

        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-mono text-xs transition cursor-pointer"
          >
            Sluiten
          </button>
          <button
            type="button"
            onClick={() => {
              onClose();
              onPlay();
            }}
            className="px-5 py-2 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-black font-mono font-bold text-xs flex items-center gap-2 shadow-lg shadow-yellow-500/25 transition cursor-pointer"
          >
            <Play className="w-4 h-4 fill-black" />
            SPEEL EXILE
          </button>
        </div>

      </div>
    </div>
  );
};
