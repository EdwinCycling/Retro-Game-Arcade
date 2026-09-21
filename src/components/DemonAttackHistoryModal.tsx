import React from 'react';
import { X, Trophy, Flame, Zap, Shield, Sparkles, BookOpen } from 'lucide-react';

interface DemonAttackHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlay: () => void;
}

export const DemonAttackHistoryModal: React.FC<DemonAttackHistoryModalProps> = ({
  isOpen,
  onClose,
  onPlay
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-neutral-900 border-2 border-rose-500/80 rounded-3xl p-6 sm:p-8 shadow-[0_0_50px_rgba(244,63,94,0.3)] overflow-y-auto text-neutral-200 font-sans">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-700 transition active:scale-95 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Badge & Title */}
        <div className="space-y-2 mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-mono font-bold">
            <Flame className="w-3.5 h-3.5 text-rose-400" />
            <span>ARCADE DOSSIER • IMAGIC 1982</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black font-mono text-white tracking-tight flex items-center gap-3">
            <span>DEMON ATTACK</span>
            <span className="text-rose-500 text-lg sm:text-xl font-normal">by Rob Fulop</span>
          </h2>
          <p className="text-neutral-400 text-xs sm:text-sm font-mono">
            Platform: Atari 2600 / Intellivision • Uitgever: Imagic • Jaar: 1982
          </p>
        </div>

        {/* Story & Background */}
        <div className="space-y-5 text-xs sm:text-sm leading-relaxed text-neutral-300">
          <section className="p-4 rounded-2xl bg-neutral-950/80 border border-rose-950/60 space-y-2">
            <h3 className="font-bold text-rose-400 font-mono text-sm flex items-center gap-1.5">
              <BookOpen className="w-4 h-4" />
              <span>HET VERHAAL: DE INVASIE VAN KRYDOS</span>
            </h3>
            <p>
              Op de bevroren ijzige maan Krydos doemt vanuit de diepe kosmos een angstaanjagend legioen buitenaardse demonen op. Jij bemant het laatste mobiele Laserkanon op het maanoppervlak. Golven van kosmische demonen vliegen van links en rechts over en laten een dodelijk spervuur van plasmabommen los!
            </p>
          </section>

          {/* Core Mechanics & Waves */}
          <section className="space-y-3">
            <h3 className="font-bold text-white font-mono text-sm flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-yellow-400" />
              <span>DE LEVELPROGRESSIE & UNIEKE MECHANIEKEN</span>
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-neutral-950/60 border border-neutral-800 space-y-1">
                <span className="text-rose-400 font-mono font-bold text-xs block">
                  1. Formaties & In-vluchten
                </span>
                <p className="text-neutral-400 text-xs">
                  Vijanden vliegen in vloeiende bochten van links en rechts binnen en blijven bovenin het scherm vleugelslaand heen en weer oscilleren.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-neutral-950/60 border border-neutral-800 space-y-1">
                <span className="text-purple-400 font-mono font-bold text-xs block">
                  2. De Splitsers (Wave 5+)
                </span>
                <p className="text-neutral-400 text-xs">
                  Vanaf Wave 5 splitsen geraakte demonen direct in <strong>twee kleinere, vliegensvlugge mini-demonen</strong> die tegelijk naar links en rechts duiken!
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-neutral-950/60 border border-neutral-800 space-y-1">
                <span className="text-cyan-400 font-mono font-bold text-xs block">
                  3. Kamikaze Duikvluchten
                </span>
                <p className="text-neutral-400 text-xs">
                  Vanaf Wave 3 maken demonen plotselinge duikvluchten op je kanon af. Een duikende demon neerschieten levert driedubbele punten op (tot 80-140 ptn)!
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-neutral-950/60 border border-neutral-800 space-y-1">
                <span className="text-emerald-400 font-mono font-bold text-xs block">
                  4. Extra Bunkers (Levens)
                </span>
                <p className="text-neutral-400 text-xs">
                  Elke voltooide wave beloont je met een extra reserve-bunker (laserkanon), tot een maximum van 6 actieve bunkers.
                </p>
              </div>
            </div>
          </section>

          {/* Historical Fact */}
          <section className="p-4 rounded-2xl bg-gradient-to-r from-rose-950/30 to-purple-950/30 border border-rose-500/30 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-white text-xs font-mono mb-1">
                Wist je dat?
              </h4>
              <p className="text-xs text-neutral-300">
                Demon Attack was een gigantische kaskraker in 1982 en won de <em>Arkie Award</em> voor Beste Videogame van het Jaar. Het werd geprogrammeerd door Rob Fulop nadat hij vertrok bij Atari om met ex-collega's Imagic op te richten.
              </p>
            </div>
          </section>
        </div>

        {/* Footer Actions */}
        <div className="mt-6 pt-4 border-t border-neutral-800 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-mono text-xs font-bold transition active:scale-95 cursor-pointer"
          >
            SLUITEN
          </button>
          <button
            onClick={() => {
              onClose();
              onPlay();
            }}
            className="px-6 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-400 text-black font-mono text-xs font-black tracking-wider shadow-[0_0_20px_rgba(244,63,94,0.6)] transition active:scale-95 cursor-pointer flex items-center gap-2"
          >
            <Zap className="w-4 h-4 fill-black" />
            <span>SPEEL DEMON ATTACK</span>
          </button>
        </div>
      </div>
    </div>
  );
};
