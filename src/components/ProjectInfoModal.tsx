import React, { useState } from 'react';
import {
  Info,
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
  Sparkles
} from 'lucide-react';
import { Language, GAMES_METADATA } from '../i18n/lobbyTranslations';

interface ProjectInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang?: Language;
}

export const ProjectInfoModal: React.FC<ProjectInfoModalProps> = ({
  isOpen,
  onClose,
  lang = 'en',
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'tech' | 'games' | 'github'>('overview');

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
                  ? '35 historic games, custom engines & Web Audio synthesizers'
                  : '35 historische games, eigen engines & Web Audio synthesizers'}
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
            <span>{isEn ? '35 Games (1972-2011)' : '35 Games (1972-2011)'}</span>
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
                  <div className="text-xl font-black text-yellow-400">35</div>
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
                    <span className="text-neutral-300">{isEn ? 'Keyboard, Xbox/PS4 gamepads, mobile gyroscope tilt steering, and touch swipe gestures.' : 'Toetsenbord, Xbox/PS gamepads, mobiel kantelen (gyro) en aanraakvegen.'}</span>
                  </div>
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
                <span>{isEn ? '35 Playable Historic Recreations' : '35 Speelbare Historische Recreaties'}</span>
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
