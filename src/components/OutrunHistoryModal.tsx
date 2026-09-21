/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Sega OutRun (1986) - Historical Dossier & Technical Breakdown Modal
 */

import React from 'react';
import { Award, Zap, Radio, Play, Flame, Gauge, Disc3, ShieldCheck } from 'lucide-react';

interface OutrunHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlay: () => void;
}

export const OutrunHistoryModal: React.FC<OutrunHistoryModalProps> = ({
  isOpen,
  onClose,
  onPlay,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in select-none">
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-neutral-900 border-2 border-red-500/70 rounded-3xl p-5 sm:p-7 shadow-[0_0_60px_rgba(239,68,68,0.4)] text-neutral-200 overflow-y-auto font-sans flex flex-col justify-between">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-red-500/20 border border-red-500/40 flex items-center justify-center text-xl shadow-inner">
              🌴
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black font-mono text-red-400 tracking-wider">
                SEGA OUTRUN (1986)
              </h2>
              <p className="text-xs text-neutral-400 font-mono">
                Yu Suzuki • Sega Enterprises • Deluxe Hydraulic Moving Cabinet
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
          <div className="p-3.5 rounded-2xl bg-red-950/30 border border-red-600/40 flex items-start gap-3 text-xs">
            <Award className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-red-300 block mb-0.5">
                De Kroonprins van de Arcade Racegames (1986)
              </span>
              OutRun was geen gewone racer, maar een wervelende "driving game": een zomers road-trip avontuur langs palmbomen, azuurblauwe kusten en heuvelachtige bergpassen in een iconische rode Ferrari Testarossa cabriolet met een blonde bijrijdster!
            </div>
          </div>

          {/* Section 1: Yu Suzuki's Inspiratie */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-400" />
              De Europese Roadtrip van Yu Suzuki
            </h3>
            <p>
              Om de ultieme rijervaring te vangen, huurde Sega-bedenker <strong>Yu Suzuki</strong> een BMW 520 en reed hij twee weken lang duizenden kilometers door Europa (van Frankfurt door de Zwitserse Alpen, langs Monaco en Rome). Met een videocamera op de motorkap legde hij alle bochten, heuvels, bruggen en landschappen vast die de basis vormden voor OutRun&apos;s adembenemende parcoursen.
            </p>
          </div>

          {/* Section 2: Hardware Revolutie */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-cyan-400" />
              Sega Super Scaler &amp; Dual 68000 Hardware
            </h3>
            <p>
              OutRun draaide op Sega&apos;s revolutionaire <em>Super Scaler</em> bord met twee gekoppelde 16-bit <strong>Motorola 68000</strong> processors op 12.5 MHz. Dit stelde de arcadekast in staat om tot wel 128 grote sprites tegelijkertijd vloeiend op te schalen en te laten krimpen op 60 beelden per seconde — een wiskundige pseudo-3D doorbraak die heuvels, dips en bochten levensecht maakte lang voordat echte 3D-polygonen gemeengoed werden.
            </p>
          </div>

          {/* Section 3: De Legendarische Autoradio */}
          <div className="p-3.5 rounded-2xl bg-amber-950/30 border border-amber-600/40 space-y-2">
            <h3 className="text-sm font-bold text-amber-300 flex items-center gap-2">
              <Radio className="w-4 h-4 text-amber-400" />
              De In-Car FM Radio van Hiroshi Kawaguchi
            </h3>
            <p className="text-xs text-neutral-300">
              OutRun introduceerde de baanbrekende mogelijkheid om vóór de start via de autoradio je eigen soundtrack te kiezen op de Yamaha YM2151 FM-synthesizer:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-xs text-neutral-300">
              <li><strong className="text-white">Magical Sound Shower:</strong> Zomerse Latin-salsa en opzwepende percussie.</li>
              <li><strong className="text-white">Passing Breeze:</strong> Ontspannende jazz-funk met zwoele koperblazers voor de kustrit.</li>
              <li><strong className="text-white">Splash Wave:</strong> Energieke, pompende 16-bit synthwave.</li>
            </ul>
          </div>

          {/* Section 4: De Hydraulische Deluxe Bewegingskast */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Gauge className="w-4 h-4 text-green-400" />
              De Deluxe Taikan Hydraulische Arcadekast
            </h3>
            <p>
              In speelhallen stond de gigantische rode cabine-uitvoering waarin de speler letterlijk zat. Krachtige servomotoren kantelden en schudden de hele zitkuip mee in de bochten en gaven felle force-feedback schokken op het stuur wanneer je van het asfalt raakte of een slip maakte!
            </p>
          </div>
        </div>

        {/* Footer actions */}
        <div className="pt-4 border-t border-neutral-800 flex items-center justify-between">
          <span className="text-xs text-neutral-500 font-mono">
            SEGA SYSTEM 16 • 1986 ARCADE
          </span>
          <button
            type="button"
            onClick={() => {
              onClose();
              onPlay();
            }}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-red-600 to-amber-500 hover:from-red-500 hover:to-amber-400 text-white font-black rounded-2xl shadow-[0_0_20px_rgba(239,68,68,0.5)] transition text-xs tracking-wider cursor-pointer"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>START RACING</span>
          </button>
        </div>
      </div>
    </div>
  );
};
