import React, { useState } from 'react';
import { X, Award, Cpu, BookOpen, Sparkles, Terminal, Compass, Tv, Gamepad2, Layers } from 'lucide-react';
import { Language } from '../i18n/lobbyTranslations';

interface NightDriverHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang?: Language;
}

export const NightDriverHistoryModal: React.FC<NightDriverHistoryModalProps> = ({
  isOpen,
  onClose,
  lang = 'nl'
}) => {
  const [activeTab, setActiveTab] = useState<'history' | 'tech' | 'tips'>('history');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-stone-900 border-2 border-stone-600 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-stone-100">
        
        {/* Apple II Bezel Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-stone-800 border-b border-stone-700">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🏎️</span>
            <div>
              <h2 className="text-xl font-bold tracking-wide text-amber-300 font-mono">
                APPLE ][ • NIGHT DRIVER (1980 / 1983)
              </h2>
              <p className="text-xs text-stone-400">
                {lang === 'nl' 
                  ? 'Geprogrammeerd door Bill Budge • California Pacific & Softape'
                  : 'Programmed by Bill Budge • California Pacific & Softape'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-white hover:bg-stone-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-stone-700 bg-stone-900/90 text-sm">
          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 px-6 py-3 font-semibold border-b-2 transition-all ${
              activeTab === 'history'
                ? 'border-amber-400 text-amber-300 bg-stone-800/60'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            {lang === 'nl' ? 'Historie & Verhaal' : 'History & Origins'}
          </button>
          <button
            onClick={() => setActiveTab('tech')}
            className={`flex items-center gap-2 px-6 py-3 font-semibold border-b-2 transition-all ${
              activeTab === 'tech'
                ? 'border-amber-400 text-amber-300 bg-stone-800/60'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Cpu className="w-4 h-4" />
            {lang === 'nl' ? 'Apple II Architectuur' : 'Apple II Tech'}
          </button>
          <button
            onClick={() => setActiveTab('tips')}
            className={`flex items-center gap-2 px-6 py-3 font-semibold border-b-2 transition-all ${
              activeTab === 'tips'
                ? 'border-amber-400 text-amber-300 bg-stone-800/60'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Award className="w-4 h-4" />
            {lang === 'nl' ? 'Rijtips & Besturing' : 'Driving Guide'}
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto space-y-5 text-stone-300 text-sm leading-relaxed">
          {activeTab === 'history' && (
            <>
              <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-500/30 text-amber-200">
                <h3 className="font-bold text-amber-300 mb-1 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  {lang === 'nl' ? 'De "Night Rider" Verwarring van 1983' : 'The 1983 "Knight Rider" Confusion'}
                </h3>
                <p>
                  {lang === 'nl'
                    ? 'Toen de legendarische televisieserie "Knight Rider" (met David Hasselhoff en de pratende auto K.I.T.T.) in 1982/1983 wereldwijd een gigantische hype werd, noemden vrijwel alle Nederlandse en Europese jongeren op schoolpleinen het spel op de Apple II steevast "Night Rider"! De zwarte nacht, de koplampen en de sportieve motorkap leken zó treffend op Michael Knight\'s nachtelijke achtervolgingen dat de naam onlosmakelijk met het spel verbonden raakte.'
                    : 'When the hit TV show "Knight Rider" (starring David Hasselhoff and K.I.T.T.) became a worldwide sensation around 1982/1983, computer kids across Europe universally dubbed this Apple II game "Night Rider"! The pitch-black night, glowing headlights, and muscle-car hood silhouette made it feel like a real episode of Michael Knight chasing criminals through the dark.'}
                </p>
              </div>

              <div>
                <h4 className="font-bold text-stone-100 mb-2">
                  {lang === 'nl' ? 'Bill Budge: De Tovenaar van de Apple II' : 'Bill Budge: The Apple II Wizard'}
                </h4>
                <p>
                  {lang === 'nl'
                    ? 'De Apple II versie van Night Driver werd geschreven door niemand minder dan Bill Budge, een van de meest gevierde programmeurs van Silicon Valley. Geïnspireerd door Atari\'s arcadespel uit 1976 wist Budge in 1980 met behulp van slimme assembly-trucs een soepele 60 FPS first-person 3D-illusie te toveren uit de 1 MHz 6502 microprocessor van de Apple II.'
                    : 'The Apple II edition of Night Driver was coded by legendary Silicon Valley software engineer Bill Budge. Inspired by Atari\'s 1976 coin-op, Budge utilized lightning-fast 6502 assembly routines to create a buttery-smooth 60 FPS first-person 3D driving illusion on an Apple II microcomputer running at just 1 MHz.'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-lg bg-stone-800/80 border border-stone-700">
                  <div className="text-amber-400 font-bold text-xs uppercase mb-1">
                    {lang === 'nl' ? 'Oorspronkelijke Arcade' : 'Original Coin-Op'}
                  </div>
                  <div className="text-white font-mono text-sm">Atari (1976)</div>
                  <div className="text-xs text-stone-400">Ted Michon & Dave Shepperd</div>
                </div>
                <div className="p-3 rounded-lg bg-stone-800/80 border border-stone-700">
                  <div className="text-amber-400 font-bold text-xs uppercase mb-1">
                    {lang === 'nl' ? 'Apple II Uitgave' : 'Apple II Release'}
                  </div>
                  <div className="text-white font-mono text-sm">Bill Budge (1980 / 1983)</div>
                  <div className="text-xs text-stone-400">California Pacific / Softape</div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'tech' && (
            <>
              <div>
                <h4 className="font-bold text-stone-100 mb-2 flex items-center gap-2">
                  <Tv className="w-4 h-4 text-emerald-400" />
                  {lang === 'nl' ? 'P31 Groen Fosfor vs. Hi-Res Color CRT' : 'P31 Green Phosphor vs. Hi-Res Color CRT'}
                </h4>
                <p>
                  {lang === 'nl'
                    ? 'Veel Apple II bezitters hadden destijds een officiële Apple Monitor II met een groen-fosfor (P31) beeldbuis, bekend om zijn rustgevende groene gloed en zachte nagloei. Anderen sloten de computer aan op een kleurentelevisie met Steve Wozniak\'s befaamde color-burst artefactkleuren (groen, paars, oranje en blauw). In deze cabinet kun je met één klik schakelen tussen beide authentieke monitorstanden!'
                    : 'Many Apple II owners utilized the official Apple Monitor II with P31 green phosphor CRT, famous for its soothing emerald persistence. Others hooked their Apple II up to an NTSC color television to enjoy Steve Wozniak\'s ingenious artifact color generation (green, violet, orange, and blue). This cabinet features a toggle switch allowing you to seamlessly swap between both display styles!'}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-stone-800/90 border border-stone-700 font-mono text-xs space-y-2">
                <div className="text-amber-400 font-bold uppercase mb-2">
                  {lang === 'nl' ? 'Hardware Specificaties' : 'Hardware Specifications'}
                </div>
                <div className="flex justify-between border-b border-stone-700 pb-1">
                  <span className="text-stone-400">CPU</span>
                  <span className="text-white">MOS Technology 6502 @ 1.023 MHz</span>
                </div>
                <div className="flex justify-between border-b border-stone-700 pb-1">
                  <span className="text-stone-400">Graphics Mode</span>
                  <span className="text-white">Hi-Res Graphics (280 × 192, 6 Colors)</span>
                </div>
                <div className="flex justify-between border-b border-stone-700 pb-1">
                  <span className="text-stone-400">Audio Hardware</span>
                  <span className="text-white">Apple II 1-Bit Speaker Toggle ($C030)</span>
                </div>
                <div className="flex justify-between border-b border-stone-700 pb-1">
                  <span className="text-stone-400">Input Devices</span>
                  <span className="text-white">Apple Hand Controllers (Game Paddles) & Keyboard</span>
                </div>
              </div>
            </>
          )}

          {activeTab === 'tips' && (
            <>
              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-stone-800/80 border border-stone-700">
                  <div className="font-bold text-amber-300 mb-1">
                    {lang === 'nl' ? '1. Schakel Tijdig Op en Terug (1 t/m 4)' : '1. Shift Smoothly (Gears 1 to 4)'}
                  </div>
                  <p className="text-xs text-stone-300">
                    {lang === 'nl'
                      ? 'In de 1e versnelling trek je snel op tot ~45 MPH. Schakel direct door naar 2 (tot 85 MPH) en 3 (tot 135 MPH). Schakel alleen naar de 4e versnelling (190+ MPH) op lange rechte stukken!'
                      : 'Gear 1 launches you quickly up to ~45 MPH. Shift rapidly into Gear 2 (up to 85 MPH) and Gear 3 (up to 135 MPH). Only hit Gear 4 (190+ MPH) on long straights!'}
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-stone-800/80 border border-stone-700">
                  <div className="font-bold text-amber-300 mb-1">
                    {lang === 'nl' ? '2. Blijf Binnen de Witte Reflectorpalen' : '2. Keep Between the White Pylons'}
                  </div>
                  <p className="text-xs text-stone-300">
                    {lang === 'nl'
                      ? 'Als je buiten de paaltjes raakt, crash je direct met 4 seconden straftijd. Kijk naar de curve van de horizon om van tevoren in te sturen.'
                      : 'Clipping the pylons causes an immediate crash with a 4-second penalty. Keep your eyes on the horizon curve to anticipate turns early.'}
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-stone-800/80 border border-stone-700">
                  <div className="font-bold text-amber-300 mb-1">
                    {lang === 'nl' ? '3. Pas op voor Tegenliggers!' : '3. Watch Out for Oncoming Traffic!'}
                  </div>
                  <p className="text-xs text-stone-300">
                    {lang === 'nl'
                      ? 'In het donker zie je opeens gele of rode koplampen op je af razen. Wijk tijdig uit naar de andere weghelft om 50 bonuspunten te verdienen.'
                      : 'Oncoming cars appear suddenly as glowing yellow and red headlights. Dodge into the open lane to earn 50 bonus points.'}
                  </p>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3 bg-stone-800 border-t border-stone-700 text-xs text-stone-400">
          <span>Retro Arcade Vault • Apple II Heritage</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-lg transition-colors"
          >
            {lang === 'nl' ? 'Sluit Dossier' : 'Close Dossier'}
          </button>
        </div>

      </div>
    </div>
  );
};
