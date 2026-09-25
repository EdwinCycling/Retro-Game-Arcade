import React, { useState } from 'react';
import { X, Sparkles, Trophy, Cpu, Palette, Info, HelpCircle, Layers, Zap } from 'lucide-react';

interface ArkanoidHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlayGame: () => void;
  lang?: 'nl' | 'en';
}

export const ArkanoidHistoryModal: React.FC<ArkanoidHistoryModalProps> = ({
  isOpen,
  onClose,
  onPlayGame,
  lang = 'nl'
}) => {
  const [activeTab, setActiveTab] = useState<'origin' | 'powerups' | 'hardware' | 'trivia'>('origin');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in select-none">
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-neutral-950 border-2 border-cyan-500/80 rounded-2xl shadow-[0_0_40px_rgba(6,182,212,0.25)] flex flex-col overflow-hidden text-neutral-200 font-sans">
        
        {/* Header with Arcade Marquee Accent */}
        <div className="p-4 sm:p-5 border-b border-neutral-800 bg-neutral-900/90 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 text-black flex items-center justify-center font-black text-xl shadow-[0_0_15px_rgba(6,182,212,0.6)]">
              🧱
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black font-mono text-cyan-400 tracking-wider">
                  ARKANOID (1986 / 1976)
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                  {lang === 'nl' ? 'ARCADE HISTORIE' : 'ARCADE DOSSIER'}
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                Taito (1986) • Akira Fujita & Yasumasa Sasabe | Atari Breakout (1976) • Steve Wozniak & Steve Jobs
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
                ? 'border-cyan-400 text-cyan-400 bg-neutral-900/60'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Info className="w-4 h-4" />
            <span>{lang === 'nl' ? 'Ontstaan & Steve Jobs' : 'Origin & Apple Roots'}</span>
          </button>
          <button
            onClick={() => setActiveTab('powerups')}
            className={`flex items-center gap-1.5 px-4 py-3 border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'powerups'
                ? 'border-cyan-400 text-cyan-400 bg-neutral-900/60'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>{lang === 'nl' ? 'Power-Ups & Vaus' : 'Power-Ups & Lore'}</span>
          </button>
          <button
            onClick={() => setActiveTab('hardware')}
            className={`flex items-center gap-1.5 px-4 py-3 border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'hardware'
                ? 'border-cyan-400 text-cyan-400 bg-neutral-900/60'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Cpu className="w-4 h-4" />
            <span>{lang === 'nl' ? 'Spinner & Techniek' : 'Spinner & Tech'}</span>
          </button>
          <button
            onClick={() => setActiveTab('trivia')}
            className={`flex items-center gap-1.5 px-4 py-3 border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'trivia'
                ? 'border-cyan-400 text-cyan-400 bg-neutral-900/60'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Trophy className="w-4 h-4" />
            <span>{lang === 'nl' ? 'Geheimen & Trivia' : 'Secrets & Trivia'}</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs sm:text-sm leading-relaxed max-h-[60vh]">
          
          {activeTab === 'origin' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-neutral-900/80 border border-cyan-500/20">
                <h3 className="text-sm font-bold text-cyan-300 mb-1 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" />
                  {lang === 'nl' ? '1976: De Legendarische Atari Opdracht aan Steve Wozniak' : '1976: The Legendary Atari Job of Steve Wozniak & Steve Jobs'}
                </h3>
                <p className="text-neutral-300">
                  {lang === 'nl'
                    ? 'In 1976 vroeg Nolan Bushnell (oprichter van Atari) aan Steve Jobs om een éénpersoonsversie van Pong te bouwen: Breakout. Jobs riep de hulp in van zijn ingenieuze vriend Steve Wozniak. Wozniak werkte vier dagen en nachten achter elkaar en slaagde erin om de volledige hardwarelogica in slechts 44 TTL-chips te ontwerpen. Het geld dat ze hiermee verdienden, vormde het startkapitaal voor de oprichting van Apple Computer!'
                    : 'In 1976, Atari founder Nolan Bushnell tasked Steve Jobs with creating a single-player version of Pong: Breakout. Jobs recruited his brilliant friend Steve Wozniak. Wozniak worked four sleepless days and nights, designing the entire arcade logic board in just 44 TTL chips. The bonus payment they received served as initial seed money to found Apple Computer!'}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-neutral-900/80 border border-neutral-800">
                <h3 className="text-sm font-bold text-white mb-1">
                  {lang === 'nl' ? '1986: De Taito Wedergeboorte – Arkanoid' : '1986: Taito’s Rebirth of the Genre – Arkanoid'}
                </h3>
                <p className="text-neutral-300">
                  {lang === 'nl'
                    ? 'Tien jaar later blies het Japanse Taito het concept nieuw leven in. Ze voegden een sci-fi verhaallijn toe, vallende power-up capsules (L, E, C, S, D, B, P), geometrische vijanden en het iconische Vaus ruimteschip. Het werd een gigantische wereldwijde arcadehit die het genre voor altijd definieerde.'
                    : 'Ten years later, Japanese studio Taito revitalized the concept. They introduced a sci-fi storyline, falling power-up pills (L, E, C, S, D, B, P), flying geometric aliens, and the iconic Vaus spacecraft. It became a global arcade phenomenon that permanently defined the brick breaker genre.'}
                </p>
              </div>
            </div>
          )}

          {activeTab === 'powerups' && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-cyan-300">
                {lang === 'nl' ? 'De 7 Iconische Power-Up Capsules' : 'The 7 Iconic Power-Up Capsules'}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="p-2.5 rounded-lg bg-red-950/40 border border-red-500/30 flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded bg-red-500 text-white font-black flex items-center justify-center shrink-0">L</span>
                  <div>
                    <strong className="text-red-300 block text-xs">Laser Cannon</strong>
                    <span className="text-[11px] text-neutral-300">{lang === 'nl' ? 'Schiet lasers omhoog om direct stenen te verpulveren!' : 'Fires twin lasers to blast bricks directly!'}</span>
                  </div>
                </div>
                <div className="p-2.5 rounded-lg bg-blue-950/40 border border-blue-500/30 flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded bg-blue-500 text-white font-black flex items-center justify-center shrink-0">E</span>
                  <div>
                    <strong className="text-blue-300 block text-xs">Expand Vaus</strong>
                    <span className="text-[11px] text-neutral-300">{lang === 'nl' ? 'Vergroot de Vaus-peddel met 50% extra breedte.' : 'Expands the Vaus paddle width by 50%.'}</span>
                  </div>
                </div>
                <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-500/30 flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded bg-emerald-500 text-white font-black flex items-center justify-center shrink-0">C</span>
                  <div>
                    <strong className="text-emerald-300 block text-xs">Catch / Sticky</strong>
                    <span className="text-[11px] text-neutral-300">{lang === 'nl' ? 'Bal plakt vast aan peddel; lanceer op jouw timing!' : 'Ball sticks to paddle; launch on your timing!'}</span>
                  </div>
                </div>
                <div className="p-2.5 rounded-lg bg-cyan-950/40 border border-cyan-500/30 flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded bg-cyan-500 text-white font-black flex items-center justify-center shrink-0">D</span>
                  <div>
                    <strong className="text-cyan-300 block text-xs">Disruption (Multi-Ball)</strong>
                    <span className="text-[11px] text-neutral-300">{lang === 'nl' ? 'Splitst de energiebal in 3 gelijktijdige ballen!' : 'Splits energy ball into 3 simultaneous balls!'}</span>
                  </div>
                </div>
                <div className="p-2.5 rounded-lg bg-pink-950/40 border border-pink-500/30 flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded bg-pink-500 text-white font-black flex items-center justify-center shrink-0">B</span>
                  <div>
                    <strong className="text-pink-300 block text-xs">Break / Warp</strong>
                    <span className="text-[11px] text-neutral-300">{lang === 'nl' ? 'Opent een warp-portaal naar het volgende level (+10.000 ptn)!' : 'Opens a warp portal to next stage (+10,000 pts)!'}</span>
                  </div>
                </div>
                <div className="p-2.5 rounded-lg bg-purple-950/40 border border-purple-500/30 flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded bg-purple-500 text-white font-black flex items-center justify-center shrink-0">P</span>
                  <div>
                    <strong className="text-purple-300 block text-xs">Player Life</strong>
                    <span className="text-[11px] text-neutral-300">{lang === 'nl' ? 'Geeft een extra reserve Vaus schip.' : 'Awards an extra reserve Vaus ship.'}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'hardware' && (
            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-neutral-900/80 border border-neutral-800">
                <h3 className="text-sm font-bold text-cyan-300 mb-1">
                  {lang === 'nl' ? 'De Analoge Dial / Rotary Spinner Knop' : 'The Rotary Dial / Spinner Controller'}
                </h3>
                <p className="text-neutral-300">
                  {lang === 'nl'
                    ? 'In de arcadekast bestuurde je de Vaus niet met een joystick, maar met een zware metalen draaiknop (rotary encoder / spinner). Hierdoor kon je de peddel met sublieme precisie over het scherm laten vliegen of juist millimeters bijsturen. In onze webversie kun je soepel slepen met je muis/touchscreen, de pijltjestoetsen gebruiken of de analoge stick van je Xbox controller bewegen!'
                    : 'In the arcade cabinet, players steered Vaus not with a joystick, but with a weighty optical rotary spinner dial. This allowed effortless pixel-perfect precision and lightning-fast edge-to-edge snaps. In our web edition, you can smoothly drag via mouse/touch, use keyboard arrows, or tilt the Xbox analog stick!'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                <div className="p-2.5 rounded-lg bg-neutral-900 border border-neutral-800">
                  <span className="text-neutral-400 block text-[10px]">CPU ARCHITECTUUR</span>
                  <span className="text-white font-bold">Motorola 6809 @ 1.5 MHz + 68705 MCU</span>
                </div>
                <div className="p-2.5 rounded-lg bg-neutral-900 border border-neutral-800">
                  <span className="text-neutral-400 block text-[10px]">GELUIDSCHIP</span>
                  <span className="text-white font-bold">General Instrument AY-3-8910 PSG</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'trivia' && (
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-neutral-900/70 border border-neutral-800">
                <strong className="text-yellow-400 block mb-1">🗿 Eindbaas DOH</strong>
                <p className="text-neutral-300 text-xs">
                  {lang === 'nl'
                    ? 'In level 33 kom je oog in oog te staan met de beruchte eindbaas DOH (een gigantisch zwevend Moai paaseiland-hoofd) die miniatuurvijanden uitspuugt. Het was een van de allereerste eindbaasgevechten in een arcadespel ooit!'
                    : 'In round 33, players confront the notorious final boss DOH (a colossal floating Easter Island Moai head) spewing geometric minions. It was one of the earliest final boss encounters in arcade history!'}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-neutral-900/70 border border-neutral-800">
                <strong className="text-cyan-400 block mb-1">🚀 Het Vaus Achtergrondverhaal</strong>
                <p className="text-neutral-300 text-xs">
                  {lang === 'nl'
                    ? 'Het moederschip "Arkanoid" werd aangevallen in de ruimte. Slechts één klein ruimteschip wist te ontsnappen: de "Vaus". Gevangen in een vreemde ruimtedimensie van stenen en barrières, moet de Vaus zich een weg naar buiten vechten.'
                    : 'The mothership "Arkanoid" was ambushed in deep space. Only one small vessel escaped: the "Vaus". Trapped inside an alien spacetime warp of cosmic barriers, Vaus must smash its way to freedom.'}
                </p>
              </div>
            </div>
          )}

        </div>

        {/* Footer with Play Action */}
        <div className="p-4 border-t border-neutral-800 bg-neutral-900/90 flex items-center justify-between">
          <span className="text-xs text-neutral-400 font-mono hidden sm:inline">
            Taito Arcade Classic • 1986
          </span>
          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-neutral-700 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold transition-all cursor-pointer"
            >
              {lang === 'nl' ? 'Sluiten' : 'Close'}
            </button>
            <button
              type="button"
              onClick={() => {
                onClose();
                onPlayGame();
              }}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-black font-mono text-xs flex items-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.5)] transition-all cursor-pointer"
            >
              <span>{lang === 'nl' ? 'MUNT INWERPEN & START' : 'INSERT COIN & PLAY'}</span>
              <Sparkles className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
