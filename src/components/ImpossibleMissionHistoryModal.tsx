/**
 * Impossible Mission (1984, Epyx) - Historical Dossier Modal
 */

import React from 'react';
import {
  X,
  Cpu,
  Trophy,
  Sparkles,
  Volume2,
  Calendar,
  Layers,
  Gamepad2,
  CheckCircle2,
  Terminal,
  ShieldCheck
} from 'lucide-react';
import { Language } from '../i18n/lobbyTranslations';

interface ImpossibleMissionHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlay?: () => void;
  lang?: Language;
}

export const ImpossibleMissionHistoryModal: React.FC<ImpossibleMissionHistoryModalProps> = ({
  isOpen,
  onClose,
  onPlay,
  lang = 'en'
}) => {
  if (!isOpen) return null;
  const isEn = lang === 'en';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl bg-neutral-900 border-2 border-blue-600/60 shadow-2xl overflow-hidden font-sans text-xs text-neutral-300">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-neutral-800 bg-neutral-950/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-950/80 border border-blue-700/80 flex items-center justify-center text-blue-400 font-bold font-mono">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-mono font-bold text-sm sm:text-base text-white tracking-wide">
                IMPOSSIBLE MISSION (1984)
              </h2>
              <p className="text-[11px] text-blue-400 font-mono">
                EPYX • DENNIS CASWELL • COMMODORE 64
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 leading-relaxed">
          {/* Historical Summary Banner */}
          <div className="p-3.5 rounded-2xl bg-blue-950/40 border border-blue-800/50 flex items-start gap-3">
            <Trophy className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white">
                {isEn ? 'The Golden Age of 8-Bit Cinematic Gaming:' : 'Het Gouden Tijdperk van 8-Bit Cinematic Gaming:'}
              </strong>
              <p className="text-neutral-300 text-[11px] mt-0.5">
                {isEn
                  ? 'Voted Game of the Year 1984 by multiple international magazines and earning a historic 96% in Zzap!64, Impossible Mission set the benchmark for platforming, stealth, puzzle assembly, and procedural speech synthesis.'
                  : 'Uitgeroepen tot Game van het Jaar 1984 door internationale computerbladen en bekroond met een legendarische 96% in Zzap!64. Impossible Mission zette de standaard voor platformactie, stealth, puzzels en spraaksynthese.'}
              </p>
            </div>
          </div>

          {/* Dennis Caswell & Iconic Gymnastic Sprites */}
          <div className="space-y-2">
            <h3 className="font-mono font-bold text-xs text-blue-400 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-400" />
              <span>{isEn ? 'Dennis Caswell & Fluid Gymnastic Animation' : 'Dennis Caswell & Vloeiende Gymnastiek-animatie'}</span>
            </h3>
            <p>
              {isEn
                ? 'Dennis Caswell hand-animated Agent 4125 frame by frame on graph paper. The iconic 360-degree running somersault was inspired by Olympic gymnasts, giving the character unprecedented physical weight and momentum compared to contemporary stiff platformers.'
                : 'Dennis Caswell animeerde geheim agent 4125 beeldje voor beeldje op ruitjespapier. De beroemde 360-graden vliegende salto was geïnspireerd op Olympische turners, wat de agent een ongekende fysieke souplesse en inertie gaf.'}
            </p>
          </div>

          {/* The Iconic Digitized Speech */}
          <div className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-2">
            <div className="font-mono font-bold text-amber-300 flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-amber-400" />
              <span>{isEn ? 'Digitized Speech: Electronic Speech Systems (ESS)' : 'Gedigitaliseerde Spraak: Electronic Speech Systems'}</span>
            </div>
            <p className="text-neutral-300 text-[11px]">
              {isEn
                ? 'Before Impossible Mission, computers rarely spoke with digitized human inflection. Epyx partnered with Electronic Speech Systems (ESS) to compress human recordings into tiny 4-bit sample bursts fed into the SID 6581 chip:'
                : 'Vóór Impossible Mission spraken computers zelden met een menselijke intonatie. Epyx werkte samen met Electronic Speech Systems (ESS) om menselijke opnames te comprimeren tot compacte 4-bit audiosamples voor de SID 6581-chip:'}
            </p>
            <div className="p-2.5 rounded-lg bg-black/60 border border-neutral-800 font-mono text-xs text-amber-200">
              💬 "Another visitor... Stay a while, stay forever!"
            </div>
            <p className="text-[11px] text-neutral-400">
              {isEn
                ? 'The agonizing falling scream ("Aaaaiiieee!") was voiced in a bathroom hallway by an ESS audio engineer, creating the most famous death sound in video game history.'
                : 'De angstaanjagende valschreeuw ("Aaaaiiieee!") werd in een gang van het kantoor ingesproken door een ESS-geluidstechnicus en groeide uit tot het beroemdste gamegeluid uit de geschiedenis.'}
            </p>
          </div>

          {/* Specs & Hardware */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-[11px]">
            <div className="p-2.5 rounded-xl bg-neutral-950 border border-neutral-800">
              <div className="text-neutral-500">SYSTEM</div>
              <div className="font-bold text-white">Commodore 64</div>
            </div>
            <div className="p-2.5 rounded-xl bg-neutral-950 border border-neutral-800">
              <div className="text-neutral-500">PROCESSOR</div>
              <div className="font-bold text-white">MOS 6510 (1 MHz)</div>
            </div>
            <div className="p-2.5 rounded-xl bg-neutral-950 border border-neutral-800">
              <div className="text-neutral-500">SOUND</div>
              <div className="font-bold text-white">SID 6581 + ESS</div>
            </div>
            <div className="p-2.5 rounded-xl bg-neutral-950 border border-neutral-800">
              <div className="text-neutral-500">PUBLISHER</div>
              <div className="font-bold text-white">Epyx (1984)</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-800 bg-neutral-950 flex items-center justify-between gap-3">
          <div className="text-[11px] text-neutral-500 font-mono">
            {isEn ? 'Press ESC or button to close' : 'Druk ESC of knop om te sluiten'}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 font-mono font-bold text-neutral-300 text-xs transition-colors cursor-pointer"
            >
              {isEn ? 'Close Intel' : 'Sluit Dossier'}
            </button>
            {onPlay && (
              <button
                onClick={() => {
                  onClose();
                  onPlay();
                }}
                className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 font-mono font-bold text-white text-xs transition-all shadow-[0_0_15px_rgba(59,130,246,0.6)] cursor-pointer"
              >
                {isEn ? 'Play Impossible Mission' : 'Start Infiltratie'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
