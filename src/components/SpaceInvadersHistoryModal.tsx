import React, { useState } from 'react';
import { X, Sparkles, Trophy, Cpu, Palette, Info, HelpCircle, ShieldAlert, Rocket, Disc } from 'lucide-react';

interface SpaceInvadersHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlayGame: () => void;
}

export const SpaceInvadersHistoryModal: React.FC<SpaceInvadersHistoryModalProps> = ({
  isOpen,
  onClose,
  onPlayGame
}) => {
  const [activeTab, setActiveTab] = useState<'origin' | 'aliens' | 'hardware' | 'trivia'>('origin');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in select-none">
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-neutral-950 border-2 border-emerald-500/80 rounded-2xl shadow-[0_0_40px_rgba(16,185,129,0.25)] flex flex-col overflow-hidden text-neutral-200 font-sans">
        
        {/* Header with Arcade Marquee Accent */}
        <div className="p-4 sm:p-5 border-b border-neutral-800 bg-neutral-900/90 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 text-black flex items-center justify-center font-black text-xl shadow-[0_0_15px_rgba(16,185,129,0.6)]">
              👾
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black font-mono text-emerald-400 tracking-wider">
                  SPACE INVADERS (1978)
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  ARCADE DOSSIER
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                Taito • Bedenker & Ingenieur: Tomohiro Nishikado
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition-colors cursor-pointer"
            aria-label="Sluiten"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-neutral-800 bg-neutral-950 text-xs font-semibold overflow-x-auto">
          <button
            onClick={() => setActiveTab('origin')}
            className={`flex items-center gap-1.5 px-4 py-3 border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'origin'
                ? 'border-emerald-400 text-emerald-400 bg-neutral-900/60'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Info className="w-3.5 h-3.5" />
            <span>Oorsprong & Verhaal</span>
          </button>
          <button
            onClick={() => setActiveTab('aliens')}
            className={`flex items-center gap-1.5 px-4 py-3 border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'aliens'
                ? 'border-cyan-400 text-cyan-400 bg-neutral-900/60'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>De Buitenaardse Vloot</span>
          </button>
          <button
            onClick={() => setActiveTab('hardware')}
            className={`flex items-center gap-1.5 px-4 py-3 border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'hardware'
                ? 'border-yellow-400 text-yellow-400 bg-neutral-900/60'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            <span>Hardware & Kleurenstrips</span>
          </button>
          <button
            onClick={() => setActiveTab('trivia')}
            className={`flex items-center gap-1.5 px-4 py-3 border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'trivia'
                ? 'border-purple-400 text-purple-400 bg-neutral-900/60'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>Muntengebrek & Trivia</span>
          </button>
        </div>

        {/* Scrollable Body Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-sm leading-relaxed">
          {activeTab === 'origin' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 flex gap-3.5 items-start">
                <div className="text-3xl">👾</div>
                <div>
                  <h4 className="font-bold text-emerald-300 text-base mb-1">
                    De Geboorte van de Video Game Industrie
                  </h4>
                  <p className="text-neutral-300 text-xs leading-normal">
                    In 1977 werkte de legendarische Taito-ontwikkelaar <strong>Tomohiro Nishikado</strong> in zijn eentje aan een revolutionair spel. Omdat er destijds nog geen microcomputers bestonden die krachtig genoeg waren voor bewegende bitmaps, bouwde hij zowel het spel, de code als de volledige hardware-printplaat met de hand!
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-neutral-900/80 border border-neutral-800">
                  <h5 className="font-bold text-white text-xs uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <Rocket className="w-3.5 h-3.5 text-red-400" />
                    Waarom Aliens in Plaats van Mensen?
                  </h5>
                  <p className="text-neutral-400 text-xs">
                    Nishikado wilde oorspronkelijk tanks en soldaten laten vechten, maar vond het neerschieten van menselijke soldaten moreel ongemakkelijk. Geïnspireerd door <em>War of the Worlds</em> en de release van <em>Star Wars (1977)</em> verving hij ze door mechanische buitenaardse wezens geïnspireerd op inktvissen en krabben!
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-neutral-900/80 border border-neutral-800">
                  <h5 className="font-bold text-white text-xs uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
                    De Per ongeluk Uitgevonden Moeilijkheidsgraad
                  </h5>
                  <p className="text-neutral-400 text-xs">
                    De Intel 8080 CPU had grote moeite om alle 55 aliens tegelijk te renderen. Hierdoor bewoog de vloot traag. Maar naarmate de speler aliens neerschoot, had de processor minder te doen en bewoog de vloot automatisch sneller! Nishikado liet dit bewust zitten: de allereerste organische moeilijkheidscurve ooit was geboren!
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'aliens' && (
            <div className="space-y-3">
              <p className="text-xs text-neutral-400">
                De vloot bestaat uit 5 rijen van 11 aliens (55 aliens in totaal), elk met een eigen vorm en puntenwaarde:
              </p>

              {/* Squid */}
              <div className="p-3 rounded-xl bg-red-950/30 border border-red-800/60 flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center text-white text-lg font-bold shadow-[0_0_10px_rgba(239,68,68,0.5)] shrink-0 font-mono">
                  🐙
                </div>
                <div className="text-xs space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-red-300 text-sm">SQUID (Bovenste Rij)</span>
                    <span className="px-1.5 py-0.2 rounded bg-red-900/50 text-red-200 text-[10px] border border-red-700 font-bold">30 PUNTEN</span>
                  </div>
                  <p className="text-neutral-300">
                    Het kleinste doelwit van slechts 8x8 pixels. Zit helemaal bovenin en is het moeilijkst te raken tussen de dalende bommen door.
                  </p>
                </div>
              </div>

              {/* Crab */}
              <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-800/60 flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-cyan-600 flex items-center justify-center text-black text-lg font-bold shadow-[0_0_10px_rgba(6,182,212,0.5)] shrink-0 font-mono">
                  🦀
                </div>
                <div className="text-xs space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-cyan-300 text-sm">CRAB (Rij 2 & 3)</span>
                    <span className="px-1.5 py-0.2 rounded bg-cyan-900/50 text-cyan-200 text-[10px] border border-cyan-700 font-bold">20 PUNTEN</span>
                  </div>
                  <p className="text-neutral-300">
                    Het meest iconische silhouet met knippende scharen. Vormt de kern van de dalende buitenaardse formatie.
                  </p>
                </div>
              </div>

              {/* Octopus */}
              <div className="p-3 rounded-xl bg-yellow-950/30 border border-yellow-800/60 flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-yellow-500 flex items-center justify-center text-black text-lg font-bold shadow-[0_0_10px_rgba(234,179,8,0.5)] shrink-0 font-mono">
                  👾
                </div>
                <div className="text-xs space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-yellow-300 text-sm">LARGE OCTOPUS (Rij 4 & 5)</span>
                    <span className="px-1.5 py-0.2 rounded bg-yellow-900/50 text-yellow-200 text-[10px] border border-yellow-700 font-bold">10 PUNTEN</span>
                  </div>
                  <p className="text-neutral-300">
                    De breedste aliens die het dichtst bij je verdedigingsbunkers lopen. Als zij de grondlijn bereiken, is de invasie een feit en verlies je direct het spel!
                  </p>
                </div>
              </div>

              {/* Mystery UFO */}
              <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-800/60 flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center text-white text-lg font-bold shadow-[0_0_10px_rgba(168,85,247,0.5)] shrink-0 font-mono">
                  🛸
                </div>
                <div className="text-xs space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-purple-300 text-sm">MYSTERY FLYING SAUCER (UFO)</span>
                    <span className="px-1.5 py-0.2 rounded bg-purple-900/50 text-purple-200 text-[10px] border border-purple-700 font-bold">50, 100, 150 of 300 PTS</span>
                  </div>
                  <p className="text-neutral-300">
                    Vliegt periodiek gillend over de bovenrand van het scherm. Gaf spelers die de schoten telden gegarandeerd 300 punten via de befaamde &quot;Furukawa-methode&quot;!
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'hardware' && (
            <div className="space-y-4">
              <p className="text-xs text-neutral-400">
                Omdat videogeheugen in 1978 onbetaalbaar was voor kleur, bedacht Taito een geniale analoge truc:
              </p>

              <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 space-y-3">
                <h4 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <Palette className="w-4 h-4 text-emerald-400" />
                  De Cellofaan Kleurenstrips
                </h4>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  De originele Space Invaders arcadekast had een <strong>zwart-wit CRT-scherm</strong>. Om het spel toch in kleur te laten lijken, plakte Taito horizontale stroken gekleurd transparant cellofaantape rechtstreeks op de glasbuis:
                </p>
                <div className="grid grid-cols-3 gap-2 text-center text-[11px] font-mono">
                  <div className="p-2 rounded bg-red-900/60 border border-red-700 text-red-200">
                    Bovenste strook: ROOD (UFO & score)
                  </div>
                  <div className="p-2 rounded bg-cyan-900/60 border border-cyan-700 text-cyan-200">
                    Middenstrook: WIT/CYAAN (Aliens)
                  </div>
                  <div className="p-2 rounded bg-emerald-900/60 border border-emerald-700 text-emerald-200">
                    Onderstrook: GROEN (Bunkers & Kanon)
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 space-y-2">
                <h4 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <Disc className="w-4 h-4 text-yellow-400" />
                  De Versnellende Hartslag Soundtrack
                </h4>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  De dalende 4-tonige basnoten bootsen een menselijke hartslag na. Hoe minder aliens er overblijven, hoe sneller het tempo wordt — wat bij miljoenen spelers leidde tot klamme handen en verhoogde adrenaline in de speelhal.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'trivia' && (
            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-800/60">
                <div className="flex items-center gap-2 mb-1">
                  <Trophy className="w-4 h-4 text-purple-400" />
                  <h4 className="font-bold text-purple-300 text-sm">
                    Het 100-Yen Muntengebrek in Japan
                  </h4>
                </div>
                <p className="text-neutral-300 text-xs leading-normal">
                  In 1978 werd Space Invaders zo bizar populair in Japan dat er overal speciale &quot;Invader Houses&quot; (hallen met uitsluitend Space Invaders kasten) openden. De Bank van Japan moest naar verluidt extra 100-yen munten slaan omdat honderden miljoenen munten vastzaten in de geldlades van arcadekasten!
                </p>
              </div>

              <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-800/60">
                <div className="flex items-center gap-2 mb-1">
                  <ShieldAlert className="w-4 h-4 text-emerald-400" />
                  <h4 className="font-bold text-emerald-300 text-sm">
                    De Eerste Vernietigbare Dekking
                  </h4>
                </div>
                <p className="text-neutral-300 text-xs leading-normal">
                  De 4 groene bunkers waren de allereerste vorm van destructible cover in gaming: elke kogel vreet een hapje uit het schild, waardoor spelers hun eigen schietopeningen konden &quot;carven&quot; om doorheen te vuren.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer with Play CTA */}
        <div className="p-4 border-t border-neutral-800 bg-neutral-900/95 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-neutral-400 font-mono text-center sm:text-left">
            Besturing: Toetsenbord, Touch Swipe, D-Pad & iPhone Gyroscoop
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold transition-colors cursor-pointer"
            >
              Sluiten
            </button>
            <button
              type="button"
              onClick={() => {
                onClose();
                onPlayGame();
              }}
              className="flex-1 sm:flex-none px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-black tracking-wide shadow-[0_0_20px_rgba(16,185,129,0.5)] transition-all transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-black" />
              <span>START SPACE INVADERS</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
