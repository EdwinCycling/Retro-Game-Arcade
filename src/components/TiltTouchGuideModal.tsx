import React, { useState } from 'react';
import {
  Smartphone,
  Compass,
  X,
  RotateCw,
  Hand,
  Vibrate,
  Zap,
  CheckCircle2,
  Info,
  Sliders,
  Play
} from 'lucide-react';
import { Language } from '../i18n/lobbyTranslations';

interface TiltTouchGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang?: Language;
}

export const TiltTouchGuideModal: React.FC<TiltTouchGuideModalProps> = ({
  isOpen,
  onClose,
  lang = 'en',
}) => {
  const [activeTab, setActiveTab] = useState<'tilt' | 'touch' | 'games'>('tilt');

  if (!isOpen) return null;

  const isEn = lang === 'en';

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-2xl rounded-3xl bg-neutral-950 border-2 border-purple-500/80 shadow-[0_0_50px_rgba(168,85,247,0.35)] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="relative p-5 sm:p-6 bg-gradient-to-r from-purple-950/80 via-neutral-900 to-neutral-950 border-b border-purple-800/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-600/30 border border-purple-400 flex items-center justify-center text-purple-300 shadow-inner">
              <Smartphone className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-mono text-lg sm:text-xl font-black text-white tracking-wide">
                  {isEn ? 'Tilt & Touch Controls Guide' : 'Kantel- & Aanraakbediening Handleiding'}
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-900/90 text-purple-200 border border-purple-600">
                  MOBILE / TABLET
                </span>
              </div>
              <p className="text-xs font-mono text-neutral-400 mt-0.5">
                {isEn
                  ? 'Motion gyroscope sensor & touch gesture instructions'
                  : 'Gyroscoop bewegingssensor & aanraakbediening uitgelegd'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-neutral-900/90 hover:bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-800 flex items-center justify-center transition-colors cursor-pointer active:scale-95"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-neutral-800 bg-neutral-900/60 px-4 pt-2 gap-2 text-xs font-mono font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('tilt')}
            className={`px-4 py-2.5 rounded-t-xl border-t border-x transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'tilt'
                ? 'bg-neutral-950 border-purple-500 text-purple-300 shadow-sm'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Compass className="w-3.5 h-3.5 text-purple-400" />
            <span>{isEn ? '1. Gyro Tilt (Motion)' : '1. Gyro Kantelen (Beweging)'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('touch')}
            className={`px-4 py-2.5 rounded-t-xl border-t border-x transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'touch'
                ? 'bg-neutral-950 border-cyan-500 text-cyan-300 shadow-sm'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Hand className="w-3.5 h-3.5 text-cyan-400" />
            <span>{isEn ? '2. Touch & Swipes' : '2. Touch & Veegbewegingen'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('games')}
            className={`px-4 py-2.5 rounded-t-xl border-t border-x transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'games'
                ? 'bg-neutral-950 border-amber-500 text-amber-300 shadow-sm'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>{isEn ? '3. Supported Games' : '3. Ondersteunde Games'}</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-neutral-300 text-xs sm:text-sm font-sans leading-relaxed">
          {activeTab === 'tilt' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="p-4 rounded-2xl bg-purple-950/40 border border-purple-800/60 space-y-2">
                <div className="flex items-center gap-2 font-mono font-bold text-purple-300 text-sm">
                  <Compass className="w-4 h-4 text-purple-400" />
                  <span>{isEn ? 'What does the Tilt button do?' : 'Wat doet de knop Kantelen (Tilt)?'}</span>
                </div>
                <p className="text-neutral-300 text-xs leading-relaxed">
                  {isEn
                    ? 'The Tilt feature activates your smartphone’s physical gyroscope and accelerometer motion sensors. By physically tilting your device left, right, forwards, or backwards, you directly steer your character or spaceship in real-time!'
                    : 'De Tilt-knop activeert de ingebouwde gyroscoop en bewegingssensor van je smartphone. Door je telefoon fysiek naar voren, achteren, links of rechts te kantelen, bestuur je je personage of ruimteschip direct in real-time!'}
                </p>
              </div>

              {/* Step by step */}
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-1.5">
                  <div className="font-mono font-bold text-white text-xs flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-purple-600/30 text-purple-300 flex items-center justify-center text-[11px]">1</span>
                    <span>{isEn ? 'Activate in Game' : 'Inschakelen in het spel'}</span>
                  </div>
                  <p className="text-[11px] text-neutral-400">
                    {isEn
                      ? 'In games like Pac-Man or Space Invaders, tap the "Kantelen / Tilt" button in the control panel to turn gyro on.'
                      : 'Tik in spellen zoals Pac-Man of Space Invaders op de knop "Kantelen AAN/UIT" om de gyroscoop te activeren.'}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-1.5">
                  <div className="font-mono font-bold text-white text-xs flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-purple-600/30 text-purple-300 flex items-center justify-center text-[11px]">2</span>
                    <span>{isEn ? 'Zero-Point Calibration' : 'Nulpunt Kalibreren'}</span>
                  </div>
                  <p className="text-[11px] text-neutral-400">
                    {isEn
                      ? 'Tap "Calibrate" while holding your phone at your natural viewing angle to set the resting neutral position.'
                      : 'Tik op "Kalibreer" terwijl je je telefoon in je natuurlijke kijkpositie houdt om het neutrale nulpunt vast te leggen.'}
                  </p>
                </div>
              </div>

              {/* iOS Note */}
              <div className="p-3.5 rounded-xl bg-blue-950/40 border border-blue-800/60 flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                <div className="space-y-1 text-xs">
                  <div className="font-mono font-bold text-blue-300">
                    {isEn ? 'iOS Safari Permission Note' : 'Toestemming voor iPhone / Safari'}
                  </div>
                  <p className="text-neutral-300 text-[11px] leading-relaxed">
                    {isEn
                      ? 'Apple Safari requires permission to access device orientation. When you tap Tilt, tap "Allow" on the popup. If disabled, enable Safari Motion & Orientation in your iPhone Settings.'
                      : 'Apple Safari vraagt toestemming voor toegang tot de bewegingssensor. Klik bij de eerste keer op "Toestaan". Staat dit uit? Schakel het in via iPhone Instellingen > Safari > Beweging & Richtingstoegang.'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'touch' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="p-4 rounded-2xl bg-cyan-950/40 border border-cyan-800/60 space-y-2">
                <div className="flex items-center gap-2 font-mono font-bold text-cyan-300 text-sm">
                  <Hand className="w-4 h-4 text-cyan-400" />
                  <span>{isEn ? 'Touchscreen Controls & Swipes' : 'Aanraakbediening & Veeggebaren'}</span>
                </div>
                <p className="text-neutral-300 text-xs leading-relaxed">
                  {isEn
                    ? 'Play seamlessly on smartphones and tablets without needing a keyboard. The arcade automatically detects touch screens and equips each cabinet with responsive gestures and virtual controls.'
                    : 'Speel moeiteloos op smartphones en tablets zonder toetsenbord. De speelhal detecteert touchscreens automatisch en rust elke kast uit met snelle veeggebaren en virtuele knoppen.'}
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-neutral-900 border border-neutral-800 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-cyan-600/20 text-cyan-400 flex items-center justify-center font-bold text-base shrink-0">
                    👆
                  </div>
                  <div>
                    <div className="font-mono font-bold text-white text-xs">
                      {isEn ? 'Direct Canvas Swipes' : 'Direct vegen over het spelscherm'}
                    </div>
                    <p className="text-[11px] text-neutral-400 mt-0.5">
                      {isEn
                        ? 'Swipe your finger across the game canvas in any direction to steer Pac-Man, jump in Frogger, turn in Temple Run, or hop diagonally in Q*bert.'
                        : 'Veeg met je vinger over het speelscherm in een willekeurige richting om Pac-Man te sturen, te springen in Frogger, af te slaan in Temple Run of diagonaal te hoppen in Q*bert.'}
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-neutral-900 border border-neutral-800 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-600/20 text-purple-400 flex items-center justify-center font-bold text-base shrink-0">
                    🕹️
                  </div>
                  <div>
                    <div className="font-mono font-bold text-white text-xs">
                      {isEn ? 'Ergonomic Virtual D-Pads & Action Triggers' : 'Ergonomische D-Pads & Actieknoppen'}
                    </div>
                    <p className="text-[11px] text-neutral-400 mt-0.5">
                      {isEn
                        ? 'Thumb-friendly on-screen buttons for shooting, jumping, jetpack thrusting (Exile), grabbing objects, and coin-op service buttons.'
                        : 'Duimvriendelijke schermknoppen voor schieten, springen, straalaandrijving (Exile), spullen optillen en munten inwerpen.'}
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-neutral-900 border border-neutral-800 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-600/20 text-emerald-400 flex items-center justify-center font-bold text-base shrink-0">
                    <Vibrate className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <div className="font-mono font-bold text-white text-xs">
                      {isEn ? 'Haptic Vibration Feedback' : 'Haptische Trillingen (Haptics)'}
                    </div>
                    <p className="text-[11px] text-neutral-400 mt-0.5">
                      {isEn
                        ? 'On supported phones, turns, laser blasts, dot eating, and pinball nudges trigger crisp tactile haptic vibrations.'
                        : 'Op ondersteunde telefoons voel je bij afslaan, laser-schoten, stippen eten en flipperkast-stoten een subtiele fysieke trilling.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'games' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <p className="text-xs text-neutral-400 font-mono">
                {isEn
                  ? 'Key retro classics featuring dedicated mobile and gyro integrations:'
                  : 'Belangrijkste retro klassiekers met ingebouwde mobiele- en kantelbesturing:'}
              </p>

              <div className="grid sm:grid-cols-2 gap-2.5 text-xs font-mono">
                <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 space-y-1">
                  <div className="font-bold text-yellow-400 flex items-center justify-between">
                    <span>🟡 Pac-Man (1980)</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">TILT + SWIPE</span>
                  </div>
                  <p className="text-[11px] text-neutral-400">
                    {isEn ? '4-way gyro tilt, swipe gestures, and virtual arcade D-Pad.' : '4-richtingen gyroscoop, veeggebaren en virtuele arcade D-Pad.'}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 space-y-1">
                  <div className="font-bold text-emerald-400 flex items-center justify-between">
                    <span>👾 Space Invaders (1978)</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">GYRO TILT</span>
                  </div>
                  <p className="text-[11px] text-neutral-400">
                    {isEn ? 'Tilt left/right to steer cannon with live angle indicator.' : 'Kantel links/rechts met live graden-hoekmeter en nulpunt-kalibratie.'}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 space-y-1">
                  <div className="font-bold text-cyan-400 flex items-center justify-between">
                    <span>🚀 Exile (1988)</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">TOUCH JETPACK</span>
                  </div>
                  <p className="text-[11px] text-neutral-400">
                    {isEn ? 'Thrust, fire, grab/throw boulder, and teleport buttons.' : 'Virtuele stuwraket, blaster, rotsblokken pakken/gooien & teleport.'}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 space-y-1">
                  <div className="font-bold text-amber-400 flex items-center justify-between">
                    <span>🏃 Temple Run 3D (2011)</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">TILT SLIDER</span>
                  </div>
                  <p className="text-[11px] text-neutral-400">
                    {isEn ? 'Swipe turns/jumps/slides, plus touch tilt slider to grab coins.' : 'Veeg om af te slaan/springen/glijden, plus kantel-slider voor munten.'}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 space-y-1">
                  <div className="font-bold text-pink-400 flex items-center justify-between">
                    <span>🪲 Demon Attack (1982)</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">GYRO STEER</span>
                  </div>
                  <p className="text-[11px] text-neutral-400">
                    {isEn ? 'Continuous smooth device tilt steering with rapid fire.' : 'Vloeiende gyroscoop-besturing van je basis met snelvuur-knoppen.'}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 space-y-1">
                  <div className="font-bold text-blue-400 flex items-center justify-between">
                    <span>💎 Repton (1985)</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">TILT DIG</span>
                  </div>
                  <p className="text-[11px] text-neutral-400">
                    {isEn ? 'Tilt phone in 4 directions to dig tunnels and push rocks.' : 'Kantel je telefoon om aarde weg te graven en rotsen te duwen.'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-neutral-900/80 border-t border-neutral-800 flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-1.5 text-neutral-400">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{isEn ? 'Plug & Play on iOS & Android' : 'Direct speelbaar op iOS & Android'}</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold transition-all cursor-pointer active:scale-95 shadow-md"
          >
            {isEn ? 'Got It, Let’s Play!' : 'Begrepen, Laten we Spelen!'}
          </button>
        </div>
      </div>
    </div>
  );
};
