import React, { useState } from 'react';
import { X, Sparkles, Trophy, Cpu, Palette, Info, HelpCircle, Flame, ShieldAlert, Compass } from 'lucide-react';

interface PacmanHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlayGame: () => void;
}

export const PacmanHistoryModal: React.FC<PacmanHistoryModalProps> = ({
  isOpen,
  onClose,
  onPlayGame
}) => {
  const [activeTab, setActiveTab] = useState<'origin' | 'ghosts' | 'trivia' | 'colors'>('origin');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in select-none">
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-neutral-950 border-2 border-yellow-400/80 rounded-2xl shadow-[0_0_40px_rgba(250,204,21,0.25)] flex flex-col overflow-hidden text-neutral-200 font-sans">
        
        {/* Header with Arcade Marquee Accent */}
        <div className="p-4 sm:p-5 border-b border-neutral-800 bg-neutral-900/90 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-yellow-400 text-black flex items-center justify-center font-black text-xl shadow-[0_0_15px_rgba(250,204,21,0.6)]">
              ᗧ
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black font-mono text-yellow-400 tracking-wider">
                  PAC-MAN (1980)
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-yellow-400/20 text-yellow-300 border border-yellow-500/40">
                  ARCADE DOSSIER
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                Namco • Bedenker: Toru Iwatani • Wereldwijd fenomeen
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
                ? 'border-yellow-400 text-yellow-400 bg-neutral-900/60'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Info className="w-3.5 h-3.5" />
            <span>Oorsprong & Verhaal</span>
          </button>
          <button
            onClick={() => setActiveTab('ghosts')}
            className={`flex items-center gap-1.5 px-4 py-3 border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'ghosts'
                ? 'border-pink-400 text-pink-400 bg-neutral-900/60'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>De 4 Spoken & AI</span>
          </button>
          <button
            onClick={() => setActiveTab('colors')}
            className={`flex items-center gap-1.5 px-4 py-3 border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'colors'
                ? 'border-cyan-400 text-cyan-400 bg-neutral-900/60'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            <span>Kleuren & Symbolen</span>
          </button>
          <button
            onClick={() => setActiveTab('trivia')}
            className={`flex items-center gap-1.5 px-4 py-3 border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'trivia'
                ? 'border-emerald-400 text-emerald-400 bg-neutral-900/60'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>Kill Screen & Trivia</span>
          </button>
        </div>

        {/* Scrollable Body Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-sm leading-relaxed">
          {activeTab === 'origin' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-yellow-950/20 border border-yellow-500/30 flex gap-3.5 items-start">
                <div className="text-3xl">🍕</div>
                <div>
                  <h4 className="font-bold text-yellow-300 text-base mb-1">
                    De Pizza die Spelgeschiedenis Schreef
                  </h4>
                  <p className="text-neutral-300 text-xs leading-normal">
                    In 1979 bestelde de jonge Japanse Namco-ontwerper <strong>Toru Iwatani</strong> een hele pizza voor de lunch. Toen hij de allereerste punt eruit tilde, zag hij in het overgebleven silhouet opeens een gulzig mondje dat happend door gangen rende. Dat visuele moment vormde de geboorte van Pac-Man.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-neutral-900/80 border border-neutral-800">
                  <h5 className="font-bold text-white text-xs uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 text-pink-400" />
                    Geen Oorlog, Maar Eten
                  </h5>
                  <p className="text-neutral-400 text-xs">
                    De speelhallen van 1979 werden gedomineerd door gewelddadige space shooters zoals <em>Space Invaders</em> en <em>Asteroids</em>. Iwatani wilde een vrolijk, geweldloos spel ontwerpen dat ook vrouwen, koppels en families naar de arcades zou trekken.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-neutral-900/80 border border-neutral-800">
                  <h5 className="font-bold text-white text-xs uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <HelpCircle className="w-3.5 h-3.5 text-yellow-400" />
                    Puck Man naar Pac-Man
                  </h5>
                  <p className="text-neutral-400 text-xs">
                    Het spel heette in Japan oorspronkelijk <strong>Puck Man</strong> (van het Japanse woord <em>paku-paku</em>: het geluid van gulzig happen). Voor de Amerikaanse release in 1980 werd het hernoemd naar <strong>Pac-Man</strong>, uit angst dat vandalen de letter &apos;P&apos; op de kasten zouden verkrabben tot een &apos;F&apos;!
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-neutral-200">Wereldwijd Verkooprecord:</span>
                  <span className="text-neutral-400 ml-1">Meer dan 400.000 fysieke kasten verkocht en $3.5+ miljard opgehaald in kwartjes in de jaren 80.</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'ghosts' && (
            <div className="space-y-3">
              <p className="text-xs text-neutral-400">
                Elk spook heeft een baanbrekend eigen algoritme geschreven in 1980. Ze jagen niet zomaar willekeurig op je:
              </p>

              {/* Blinky */}
              <div className="p-3 rounded-xl bg-red-950/30 border border-red-800/60 flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center text-white text-lg font-bold shadow-[0_0_10px_rgba(239,68,68,0.5)] shrink-0">
                  🔴
                </div>
                <div className="text-xs space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-red-300 text-sm">BLINKY</span>
                    <span className="text-neutral-400 font-mono text-[10px]">Akabei / Shadow</span>
                    <span className="px-1.5 py-0.2 rounded bg-red-900/50 text-red-200 text-[9px] border border-red-700">Oikake (Achtervolger)</span>
                  </div>
                  <p className="text-neutral-300">
                    Richt zijn target-tegel altijd rechtstreeks op Pac-Man&apos;s huidige positie. Zodra er minder dan 20 stippen overblijven, activeert hij <strong>&quot;Cruise Elroy&quot;</strong> en sprint hij sneller dan Pac-Man zelf!
                  </p>
                </div>
              </div>

              {/* Pinky */}
              <div className="p-3 rounded-xl bg-pink-950/30 border border-pink-800/60 flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-pink-500 flex items-center justify-center text-white text-lg font-bold shadow-[0_0_10px_rgba(236,72,153,0.5)] shrink-0">
                  🌸
                </div>
                <div className="text-xs space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-pink-300 text-sm">PINKY</span>
                    <span className="text-neutral-400 font-mono text-[10px]">Speedy</span>
                    <span className="px-1.5 py-0.2 rounded bg-pink-900/50 text-pink-200 text-[9px] border border-pink-700">Machibuse (Hinderlaag)</span>
                  </div>
                  <p className="text-neutral-300">
                    Richt zich continu op <strong>4 tegels vóór Pac-Man</strong> in zijn kijkrichting. Pinky probeert je de pas af te snijden en sluit je in een hoekje op terwijl Blinky achter je aan rent.
                  </p>
                </div>
              </div>

              {/* Inky */}
              <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-800/60 flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-cyan-500 flex items-center justify-center text-black text-lg font-bold shadow-[0_0_10px_rgba(6,182,212,0.5)] shrink-0">
                  🔷
                </div>
                <div className="text-xs space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-cyan-300 text-sm">INKY</span>
                    <span className="text-neutral-400 font-mono text-[10px]">Aosuke / Bashful</span>
                    <span className="px-1.5 py-0.2 rounded bg-cyan-900/50 text-cyan-200 text-[9px] border border-cyan-700">Kimagure (Wispelturig)</span>
                  </div>
                  <p className="text-neutral-300">
                    Het meest complexe spook! Berekent een vector tussen Blinky en 2 tegels vóór Pac-Man, en verdubbelt die afstand. Kan daardoor razend onvoorspelbaar manoeuvreren.
                  </p>
                </div>
              </div>

              {/* Clyde */}
              <div className="p-3 rounded-xl bg-orange-950/30 border border-orange-800/60 flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center text-white text-lg font-bold shadow-[0_0_10px_rgba(249,115,22,0.5)] shrink-0">
                  🟠
                </div>
                <div className="text-xs space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-orange-300 text-sm">CLYDE</span>
                    <span className="text-neutral-400 font-mono text-[10px]">Guzuta / Pokey</span>
                    <span className="px-1.5 py-0.2 rounded bg-orange-900/50 text-orange-200 text-[9px] border border-orange-700">Otoboke (Fakend Onnozel)</span>
                  </div>
                  <p className="text-neutral-300">
                    Jaagt direct op Pac-Man zolang hij meer dan 8 tegels weg is. Komt hij binnen 8 tegels? Dan draait hij opeens laf om en vlucht hij naar zijn rusthoek links-onderin!
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'colors' && (
            <div className="space-y-4">
              <p className="text-xs text-neutral-400">
                Het kleurenpalet van Pac-Man was in 1980 revolutionair. Elke kleur werd zorgvuldig gekozen voor direct visueel contrast op CRT beeldbuizen:
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 flex flex-col items-center text-center">
                  <div className="w-10 h-10 rounded-full bg-[#FFE600] mb-2 shadow-[0_0_15px_rgba(255,230,0,0.5)] flex items-center justify-center text-black font-black text-xs">
                    ᗧ
                  </div>
                  <span className="font-bold text-white text-xs">Pac-Man Geel</span>
                  <span className="text-[10px] text-neutral-400 font-mono">#FFE600</span>
                  <span className="text-[10px] text-neutral-400 mt-1">Stralend optimisme en honger</span>
                </div>

                <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 flex flex-col items-center text-center">
                  <div className="w-10 h-10 rounded-xl bg-[#2121DE] mb-2 shadow-[0_0_15px_rgba(33,33,222,0.5)] flex items-center justify-center text-white text-xs font-mono font-bold">
                    MAZE
                  </div>
                  <span className="font-bold text-white text-xs">Arcade Neon Blauw</span>
                  <span className="text-[10px] text-neutral-400 font-mono">#2121DE</span>
                  <span className="text-[10px] text-neutral-400 mt-1">Doolhofmuren met dubbele randen</span>
                </div>

                <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 flex flex-col items-center text-center">
                  <div className="w-10 h-10 rounded-full bg-[#DEDEFF] mb-2 shadow-[0_0_15px_rgba(222,222,255,0.4)] flex items-center justify-center text-black text-xs font-black">
                    •
                  </div>
                  <span className="font-bold text-white text-xs">Energizer Wit</span>
                  <span className="text-[10px] text-neutral-400 font-mono">#DEDEFF</span>
                  <span className="text-[10px] text-neutral-400 mt-1">240 stippen + 4 krachtpillen</span>
                </div>

                <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 flex flex-col items-center text-center">
                  <div className="w-10 h-10 rounded-xl bg-[#0000BB] mb-2 shadow-[0_0_15px_rgba(0,0,187,0.5)] flex items-center justify-center text-white text-xs font-bold">
                    😱
                  </div>
                  <span className="font-bold text-white text-xs">Frightened Blauw</span>
                  <span className="text-[10px] text-neutral-400 font-mono">#0000BB</span>
                  <span className="text-[10px] text-neutral-400 mt-1">Spoken worden kwetsbaar (200-1600 pts)</span>
                </div>

                <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 flex flex-col items-center text-center">
                  <div className="w-10 h-10 rounded-xl bg-[#FF0000] mb-2 shadow-[0_0_15px_rgba(255,0,0,0.5)] flex items-center justify-center text-white text-sm font-bold">
                    🍒
                  </div>
                  <span className="font-bold text-white text-xs">Kersen Rood</span>
                  <span className="text-[10px] text-neutral-400 font-mono">#FF0000</span>
                  <span className="text-[10px] text-neutral-400 mt-1">Bonusfruit Level 1 (100 punten)</span>
                </div>

                <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 flex flex-col items-center text-center">
                  <div className="w-10 h-10 rounded-xl bg-[#00FFDE] mb-2 shadow-[0_0_15px_rgba(0,255,222,0.4)] flex items-center justify-center text-black text-sm font-bold">
                    🗝️
                  </div>
                  <span className="font-bold text-white text-xs">Sleutel Cyaan</span>
                  <span className="text-[10px] text-neutral-400 font-mono">#00FFDE</span>
                  <span className="text-[10px] text-neutral-400 mt-1">Hoogste bonusfruit (5.000 pts)</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'trivia' && (
            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-800/60">
                <div className="flex items-center gap-2 mb-1">
                  <Flame className="w-4 h-4 text-purple-400" />
                  <h4 className="font-bold text-purple-300 text-sm">
                    De Legendarische Level 256 &quot;Kill Screen&quot;
                  </h4>
                </div>
                <p className="text-neutral-300 text-xs leading-normal">
                  De originele 8-bit Z80 microprocessor sloeg het levelnummer op in een enkel 8-bit register (0 tot 255). Bij het bereiken van level 256 treedt een integer overflow op: het subroutine probeert 256 vruchten te tekenen onderin het scherm, waardoor het videogeheugen crasht en de rechterhelft verandert in een onleesbare stroom willekeurige pixels en cijfers!
                </p>
              </div>

              <div className="p-4 rounded-xl bg-yellow-950/30 border border-yellow-800/60">
                <div className="flex items-center gap-2 mb-1">
                  <Trophy className="w-4 h-4 text-yellow-400" />
                  <h4 className="font-bold text-yellow-300 text-sm">
                    De Perfecte Score: 3.333.360 Punten
                  </h4>
                </div>
                <p className="text-neutral-300 text-xs leading-normal">
                  Op 3 juli 1999 schreef de Amerikaan <strong>Billy Mitchell</strong> geschiedenis door in 6 uur tijd de allereerste geverifieerde &quot;Perfect Game&quot; te spelen: 255 levels lang élke stip, élke krachtpil, élk spook (alle 4 bij elke energizer) en élk bonusfruit opeten zonder een enkel leven te verliezen!
                </p>
              </div>

              <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800">
                <div className="flex items-center gap-2 mb-1">
                  <Compass className="w-4 h-4 text-blue-400" />
                  <h4 className="font-bold text-neutral-200 text-sm">
                    De Veilige Rustplek
                  </h4>
                </div>
                <p className="text-neutral-400 text-xs leading-normal">
                  Direct rechtsboven de T-splitsing boven het spookhok bevindt zich een legendarische &apos;blind spot&apos;. Als Pac-Man daar naar boven gericht stilstaat wanneer geen enkel spook hem al achtervolgt, kunnen spoken hem nooit bereiken en rennen ze oneindig rondjes om hem heen!
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer with Play CTA */}
        <div className="p-4 border-t border-neutral-800 bg-neutral-900/95 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-neutral-400 font-mono text-center sm:text-left">
            Besturing: Toetsenbord, Touch Swipe of iPhone Gyroscoop (Kantelen)
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
              className="flex-1 sm:flex-none px-5 py-2 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-black text-xs font-black tracking-wide shadow-[0_0_20px_rgba(250,204,21,0.5)] transition-all transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-black" />
              <span>START PAC-MAN</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
