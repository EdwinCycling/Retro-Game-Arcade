import React, { useState, useEffect } from 'react';
import {
  X,
  Code,
  Layers,
  Gamepad2,
  Volume2,
  Tv,
  CheckCircle2,
  GitBranch,
  Terminal,
  Cpu,
  Sparkles,
  Scale,
  ShieldCheck,
  Mail,
  Cookie,
  Database
} from 'lucide-react';
import { Language, GAMES_METADATA } from '../i18n/lobbyTranslations';

interface ProjectInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang?: Language;
  initialTab?: 'overview' | 'tech' | 'games' | 'github' | 'legal';
}

export const ProjectInfoModal: React.FC<ProjectInfoModalProps> = ({
  isOpen,
  onClose,
  lang = 'en',
  initialTab = 'overview',
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'tech' | 'games' | 'github' | 'legal'>(initialTab);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  const isEn = lang === 'en';

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-3xl rounded-3xl bg-neutral-950 border-2 border-cyan-500/80 shadow-[0_0_50px_rgba(6,182,212,0.3)] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="relative p-5 sm:p-6 bg-gradient-to-r from-cyan-950/80 via-neutral-900 to-neutral-950 border-b border-cyan-800/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-cyan-600/25 border border-cyan-400 flex items-center justify-center text-cyan-300 shadow-inner">
              <Code className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-mono text-lg sm:text-xl font-black text-white tracking-wide">
                  {isEn ? 'Arcade Vault Project Dossier' : 'Arcade Vault Project Dossier'}
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-700">
                  GITHUB DOCS
                </span>
              </div>
              <p className="text-xs font-mono text-neutral-400 mt-0.5">
                {isEn
                  ? `${GAMES_METADATA.length} historic games, custom engines & Web Audio synthesizers`
                  : `${GAMES_METADATA.length} historische games, eigen engines & Web Audio synthesizers`}
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
        <div className="flex border-b border-neutral-800 bg-neutral-900/60 px-4 pt-2 gap-2 text-xs font-mono font-bold overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`px-3 sm:px-4 py-2.5 rounded-t-xl border-t border-x transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-neutral-950 border-cyan-500 text-cyan-300 shadow-sm'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>{isEn ? 'Overview' : 'Overzicht'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('tech')}
            className={`px-3 sm:px-4 py-2.5 rounded-t-xl border-t border-x transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'tech'
                ? 'bg-neutral-950 border-purple-500 text-purple-300 shadow-sm'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Cpu className="w-3.5 h-3.5 text-purple-400" />
            <span>{isEn ? 'Tech & Architecture' : 'Technologie & Architectuur'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('games')}
            className={`px-3 sm:px-4 py-2.5 rounded-t-xl border-t border-x transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'games'
                ? 'bg-neutral-950 border-amber-500 text-amber-300 shadow-sm'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Gamepad2 className="w-3.5 h-3.5 text-amber-400" />
            <span>{`${GAMES_METADATA.length} Games (1972-2011)`}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('github')}
            className={`px-3 sm:px-4 py-2.5 rounded-t-xl border-t border-x transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'github'
                ? 'bg-neutral-950 border-emerald-500 text-emerald-300 shadow-sm'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <GitBranch className="w-3.5 h-3.5 text-emerald-400" />
            <span>{isEn ? 'GitHub & Commands' : 'GitHub & Commando\'s'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('legal')}
            className={`px-3 sm:px-4 py-2.5 rounded-t-xl border-t border-x transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'legal'
                ? 'bg-neutral-950 border-rose-500 text-rose-300 shadow-sm'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Scale className="w-3.5 h-3.5 text-rose-400" />
            <span>{isEn ? 'Legal & IP Notice' : 'Juridische Kennisgeving'}</span>
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-neutral-300 text-xs sm:text-sm font-sans leading-relaxed">
          {activeTab === 'overview' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="p-4 rounded-2xl bg-cyan-950/35 border border-cyan-800/60 space-y-2">
                <div className="font-mono font-bold text-cyan-300 text-sm flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <span>{isEn ? 'Zero External ROMs • 100% Native TypeScript' : 'Geen Externe ROMs • 100% Schone TypeScript'}</span>
                </div>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  {isEn
                    ? 'Unlike typical emulator setups, every single arcade machine, computer classic, and 3D environment in this vault was clean-room engineered from scratch in modern TypeScript, Canvas 2D, Three.js WebGL, and the Web Audio API.'
                    : 'In tegenstelling tot traditionele emulators is elke arcadekast, microcomputer-klassieker en 3D-wereld in deze kluis vanaf de grond opgebouwd in pure TypeScript, Canvas 2D, Three.js WebGL en de Web Audio API.'}
                </p>
              </div>

              {/* 4 Stat Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-center">
                <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800">
                  <div className="text-xl font-black text-yellow-400">{GAMES_METADATA.length}</div>
                  <div className="text-[10px] text-neutral-400 uppercase mt-0.5">{isEn ? 'Playable Games' : 'Speelbare Games'}</div>
                </div>
                <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800">
                  <div className="text-xl font-black text-cyan-400">3</div>
                  <div className="text-[10px] text-neutral-400 uppercase mt-0.5">{isEn ? 'Museum Views' : 'Museum Weergaven'}</div>
                </div>
                <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800">
                  <div className="text-xl font-black text-purple-400">4</div>
                  <div className="text-[10px] text-neutral-400 uppercase mt-0.5">{isEn ? 'Control Modes' : 'Besturingsopties'}</div>
                </div>
                <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800">
                  <div className="text-xl font-black text-emerald-400">0 MB</div>
                  <div className="text-[10px] text-neutral-400 uppercase mt-0.5">{isEn ? 'ROM Files Needed' : 'Geen ROMs Nodig'}</div>
                </div>
              </div>

              {/* Key Features List */}
              <div className="space-y-2 text-xs">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white">{isEn ? '3D Arcade Floor View: ' : '3D Speelhalvloer Weergave: '}</strong>
                    <span className="text-neutral-300">{isEn ? 'Interactive first-person 3D exploration with dynamic arcade lighting and physical cabinet marquees.' : 'Interactieve 3D speelhal waarin je rondloopt en kasten direct activeert.'}</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white">{isEn ? 'Procedural Sound Synthesis: ' : 'Procedurele Geluidssynthese: '}</strong>
                    <span className="text-neutral-300">{isEn ? 'C64 SID 6581, BBC Micro SN76489, AY-3-8910 and OutRun FM radio tracks rendered in real-time.' : 'C64 SID 6581, BBC Micro SN76489, AY-3-8910 en OutRun FM radio live gesynthetiseerd.'}</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white">{isEn ? 'Universal Input: ' : 'Universele Besturing: '}</strong>
                    <span className="text-neutral-300">{isEn ? 'Keyboard, Xbox/PS4 gamepads on PC, mobile gyroscope tilt steering, and touch swipe gestures.' : 'Toetsenbord, Xbox/PS gamepads op PC, mobiel kantelen (gyro) en aanraakvegen.'}</span>
                  </div>
                </div>
              </div>

              {/* AI & Game Maturity Status Callout */}
              <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 space-y-2.5 text-xs">
                <div className="font-mono font-bold text-amber-300 text-xs flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>{isEn ? '100% AI-Engineered & Game Maturity Tiers' : '100% AI-Ontwikkeld & Game Volwassenheidsniveaus'}</span>
                </div>
                <p className="text-neutral-300 leading-relaxed">
                  {isEn
                    ? `All ${GAMES_METADATA.length} games, physics engines, and audio synthesizers were created from scratch with AI coding models. As a result, implementation depth naturally varies across titles:`
                    : `Alle ${GAMES_METADATA.length} games, fysica-engines en audiosynthesizers zijn vanaf nul opgebouwd in samenwerking met AI-modellen. Daardoor verschilt de diepgang en het detailniveau per spel:`}
                </p>
                <div className="grid sm:grid-cols-2 gap-2 text-[11px] font-sans">
                  <div className="p-2.5 rounded-lg bg-black/60 border border-emerald-900/50 space-y-1">
                    <span className="font-bold text-emerald-400 font-mono">🟢 {isEn ? 'Deep & Multi-Level' : 'Volledig & Meerdere Niveaus'}</span>
                    <p className="text-neutral-400">
                      {isEn
                        ? 'Pac-Man, OutRun, Space Invaders, Asteroids, Exile, Repton & Tetris feature rich multi-stage mechanics, authentic physics, and full high-score tracking.'
                        : 'Pac-Man, OutRun, Space Invaders, Asteroids, Exile, Repton & Tetris bevatten diepgaande multi-level gameplay, authentieke fysica en topscores.'}
                    </p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-black/60 border border-amber-900/50 space-y-1">
                    <span className="font-bold text-amber-400 font-mono">🟡 {isEn ? 'Basic & Stylized Tributes' : 'Basis & Gestileerde Eerbetonen'}</span>
                    <p className="text-neutral-400">
                      {isEn
                        ? 'Some titles (like the 3D FPS tributes and early prototypes) focus on core mechanics and arcade loops, without the full visual fidelity or megabyte campaign scale of the commercial originals.'
                        : 'Sommige titels (zoals de 3D FPS eerbetonen) zijn meer basis prototypes die de speelstijl vangen, maar grafisch nog niet het niveau of de schaal van het origineel bereiken.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Hardware & Controller Banner */}
              <div className="p-3.5 rounded-xl bg-cyan-950/30 border border-cyan-800/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                <div className="space-y-0.5">
                  <div className="font-mono font-bold text-cyan-300 flex items-center gap-1.5">
                    <Gamepad2 className="w-4 h-4 text-cyan-400" />
                    <span>{isEn ? 'Xbox on PC & Full Mobile Optimization' : 'Xbox Controller op PC & Volledig Mobiel'}</span>
                  </div>
                  <p className="text-neutral-300 text-[11px]">
                    {isEn
                      ? 'Plug & play Xbox/PS controller support on PC with live telemetry, plus phone gyroscope tilt steering, virtual touch D-pads & haptics on mobile.'
                      : 'Plug & play Xbox/PS controller ondersteuning op PC met live weergave, plus gyroscopisch sturen via kantelen, virtuele D-pads en trillingen op mobiel.'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'tech' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="grid sm:grid-cols-2 gap-3 text-xs font-mono">
                <div className="p-3.5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-1">
                  <div className="font-bold text-cyan-400 flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-cyan-400" />
                    <span>Frontend Core</span>
                  </div>
                  <p className="text-neutral-400 text-[11px]">
                    React 19, TypeScript 5.8, Vite 6, Tailwind CSS v4, Lucide Icons & Motion layout transitions.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-1">
                  <div className="font-bold text-purple-400 flex items-center gap-1.5">
                    <Tv className="w-4 h-4 text-purple-400" />
                    <span>3D & Canvas Rendering</span>
                  </div>
                  <p className="text-neutral-400 text-[11px]">
                    Three.js WebGL for FPS engines and Floor View; Canvas 2D sub-stepped physics for 2D classics.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-1">
                  <div className="font-bold text-amber-400 flex items-center gap-1.5">
                    <Volume2 className="w-4 h-4 text-amber-400" />
                    <span>Chiptune Synthesizers</span>
                  </div>
                  <p className="text-neutral-400 text-[11px]">
                    Web Audio API Oscillators, BiquadFilter ADSR envelopes, FM modulation, and procedural noise buffers.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-1">
                  <div className="font-bold text-emerald-400 flex items-center gap-1.5">
                    <Gamepad2 className="w-4 h-4 text-emerald-400" />
                    <span>Hardware Integration</span>
                  </div>
                  <p className="text-neutral-400 text-[11px]">
                    HTML5 Gamepad API subscriber loop, DeviceOrientation motion event tilt, and touch haptics.
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-neutral-900/60 border border-neutral-800 text-[11px] font-mono text-neutral-400">
                <span className="text-white font-bold">{isEn ? 'Docs Available: ' : 'Documentatie Beschikbaar: '}</span>
                <span>/README.md, /docs/ARCHITECTURE.md, /docs/CONTROLS.md, /docs/GAMES_CATALOG.md, /CONTRIBUTING.md</span>
              </div>
            </div>
          )}

          {activeTab === 'games' && (
            <div className="space-y-3 animate-in fade-in duration-150">
              <div className="flex items-center justify-between font-mono text-xs text-neutral-400">
                <span>{isEn ? `${GAMES_METADATA.length} Playable Historic Recreations` : `${GAMES_METADATA.length} Speelbare Historische Recreaties`}</span>
                <span className="text-amber-400 font-bold">1972 — 2011</span>
              </div>

              <div className="max-h-72 overflow-y-auto space-y-1.5 pr-1 font-mono text-xs">
                {GAMES_METADATA.map((game, idx) => (
                  <div
                    key={game.id}
                    className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 flex items-center justify-between text-[11px] transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-neutral-500 font-bold w-5">{idx + 1}.</span>
                      <span className="font-bold text-white">{game.title}</span>
                      <span className="text-[10px] text-neutral-400">({game.year})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-300 text-[10px]">
                        {game.system}
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 text-[10px] border border-cyan-800">
                        {game.genre}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'github' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-800/60 space-y-2">
                <div className="font-mono font-bold text-emerald-300 text-sm flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-emerald-400" />
                  <span>{isEn ? 'Ready to Sync with GitHub' : 'Klaar voor synchronisatie met GitHub'}</span>
                </div>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  {isEn
                    ? 'All comprehensive documentation files (README.md, CONTRIBUTING.md, and docs/) are generated and structured according to standard open-source GitHub standards.'
                    : 'Alle uitgebreide documentatiebestanden (README.md, CONTRIBUTING.md en docs/) zijn aangemaakt en gestructureerd volgens open-source GitHub standaarden.'}
                </p>
              </div>

              <div className="space-y-2 font-mono text-xs">
                <div className="text-neutral-400 text-[11px] font-bold uppercase">{isEn ? 'Local Development Commands:' : 'Lokale Ontwikkelcommando\'s:'}</div>
                <div className="p-3 rounded-xl bg-black border border-neutral-800 space-y-1 text-emerald-400 select-all">
                  <div>npm install</div>
                  <div>npm run dev      <span className="text-neutral-500"># Start local Vite server on port 3000</span></div>
                  <div>npm run build    <span className="text-neutral-500"># Production compile to dist/</span></div>
                  <div>npm run lint     <span className="text-neutral-500"># Full TypeScript strict validation</span></div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'legal' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="p-4 rounded-2xl bg-rose-950/30 border border-rose-800/60 space-y-2">
                <div className="font-mono font-bold text-rose-300 text-sm flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-rose-400" />
                  <span>{isEn ? 'Legal & Intellectual Property Notice' : 'Juridische Kennisgeving & Intellectueel Eigendom'}</span>
                </div>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  {isEn
                    ? 'Retro Game Arcade is an independent, non-commercial educational and historical project created as a tribute to the evolution of video games and computer-game engineering.'
                    : 'Retro Game Arcade is een onafhankelijk, niet-commercieel educatief en historisch project, gecreëerd als eerbetoon aan de evolutie van videogames en computer game engineering.'}
                </p>
              </div>

              {/* Exact user legal text paragraphs */}
              <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 space-y-3 text-xs text-neutral-300 leading-relaxed font-sans">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <p>
                    {isEn
                      ? 'The software implementations in this project have been independently created for this project. No original commercial game ROMs or executable binaries are distributed.'
                      : 'De software-implementaties in dit project zijn onafhankelijk voor dit project gecreëerd. Er worden geen originele commerciële game-ROMs of uitvoerbare binaire bestanden gedistribueerd.'}
                  </p>
                </div>

                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <p>
                    {isEn
                      ? 'Names of historical video games, companies, systems, characters and other trademarks may be referenced for identification, historical commentary and educational context. These names and trademarks remain the property of their respective rights holders.'
                      : 'Namen van historische videogames, bedrijven, systemen, personages en andere handelsmerken kunnen worden genoemd ter identificatie, historisch commentaar en educatieve context. Deze namen en handelsmerken blijven eigendom van hun respectieve rechthebbenden.'}
                  </p>
                </div>

                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <p>
                    {isEn
                      ? 'This project is not affiliated with, sponsored by, approved by, or endorsed by Nintendo, Atari, Namco, Sega, Taito, id Software, Valve, Konami, Sierra, Electronic Arts, or any other referenced rights holder.'
                      : 'Dit project is niet gelieerd aan, gesponsord door, goedgekeurd door of ondersteund door Nintendo, Atari, Namco, Sega, Taito, id Software, Valve, Konami, Sierra, Electronic Arts, of enige andere genoemde rechthebbende.'}
                  </p>
                </div>

                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <p>
                    {isEn
                      ? 'The project is provided free of charge and is not monetised. Its purpose is to document, demonstrate and celebrate significant developments in video-game design and engineering.'
                      : 'Het project wordt kosteloos aangeboden en wordt niet gemonetiseerd. Het doel is het documenteren, demonstreren en vieren van belangrijke ontwikkelingen in videogameontwerp en -engineering.'}
                  </p>
                </div>

                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <p>
                    {isEn
                      ? 'Copyrights, trademarks and other intellectual-property rights relating to the original commercial games remain with their respective owners.'
                      : 'Auteursrechten, handelsmerken en andere intellectuele eigendomsrechten met betrekking tot de originele commerciële spellen blijven bij hun respectievelijke eigenaren.'}
                  </p>
                </div>
              </div>

              {/* Takedown & Contact Point */}
              <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 space-y-2 text-xs">
                <div className="font-bold text-white flex items-center gap-2">
                  <Mail className="w-4 h-4 text-cyan-400" />
                  <span>{isEn ? 'Rights Holder Contact & Review' : 'Contactpunt voor Rechthebbenden'}</span>
                </div>
                <p className="text-neutral-300">
                  {isEn
                    ? 'If you are a rights holder and believe that material in this project infringes your rights, please contact the project maintainer so that the relevant material can be reviewed and, where appropriate, modified or removed:'
                    : 'Als u een rechthebbende bent en meent dat materiaal in dit project inbreuk maakt op uw rechten, neem dan contact op met de projectbeheerder zodat het betreffende materiaal kan worden beoordeeld en, waar nodig, gewijzigd of verwijderd:'}
                </p>
                <div className="p-2.5 rounded-lg bg-black border border-neutral-800 font-mono text-cyan-300 font-bold flex items-center justify-between">
                  <span>edwin@editsolutions.nl</span>
                  <span className="text-[10px] text-neutral-400 font-normal">Notice & Takedown Point</span>
                </div>
              </div>

              {/* Cookie & Local Storage Transparency Policy */}
              <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 space-y-3 text-xs">
                <div className="font-bold text-white flex items-center gap-2">
                  <Cookie className="w-4 h-4 text-amber-400" />
                  <span>{isEn ? 'Cookie & Local Storage Policy (GDPR / ePrivacy)' : 'Cookie- & Lokale Opslagbeleid (AVG / ePrivacy)'}</span>
                </div>
                
                <p className="text-neutral-300 leading-relaxed">
                  {isEn
                    ? 'This website does NOT use tracking cookies, advertising beacons, or third-party profiling trackers. Under the EU ePrivacy Directive and GDPR, we only use purely functional, on-device local browser storage (localStorage) for core application utility:'
                    : 'Deze website gebruikt GEEN tracking cookies, advertentietrackers of externe profielen. Conform de Europese ePrivacy Richtlijn en de AVG gebruiken we uitsluitend strikt noodzakelijke, functionele lokale browseropslag (localStorage) voor de basiswerking van de app:'}
                </p>

                <div className="p-3 rounded-lg bg-black/60 border border-neutral-800 space-y-1.5 font-mono text-[11px] text-neutral-300">
                  <div className="flex items-center justify-between">
                    <span className="text-cyan-300">arcade_vault_lang_v2</span>
                    <span className="text-neutral-400">{isEn ? 'Selected language (EN / NL)' : 'Gekozen taal (EN / NL)'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-cyan-300">arcade_cookie_consent_v1</span>
                    <span className="text-neutral-400">{isEn ? 'Consent acknowledgement' : 'Bevestiging kennisgeving'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-cyan-300">pacman_haptics_enabled</span>
                    <span className="text-neutral-400">{isEn ? 'Mobile vibration preference' : 'Mobiele trillingsvoorkeur'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-cyan-300">*__high_scores / saves</span>
                    <span className="text-neutral-400">{isEn ? 'High scores & adventure saves (100% on device)' : 'Lokale scores & savegames (100% op eigen toestel)'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-[11px] text-emerald-400 font-mono">
                  <Database className="w-3.5 h-3.5" />
                  <span>{isEn ? 'Zero bytes of private user data are transmitted to external servers.' : 'Er worden nul bytes aan persoonsgegevens naar externe servers verzonden.'}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-neutral-900/80 border-t border-neutral-800 flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-1.5 text-neutral-400">
            <CheckCircle2 className="w-4 h-4 text-cyan-400" />
            <span>{isEn ? 'Documentation Complete & Ready' : 'Documentatie Compleet & Gereed'}</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold transition-all cursor-pointer active:scale-95 shadow-md"
          >
            {isEn ? 'Close Dossier' : 'Sluit Dossier'}
          </button>
        </div>
      </div>
    </div>
  );
};
