/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Nokia Snake (1997 / Nokia 6110 & 3310) - Retro Phone Cabinet & Interactive Simulation
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { 
  ArrowLeft, 
  Volume2, 
  VolumeX, 
  Trophy, 
  BookOpen, 
  RotateCcw, 
  Play, 
  Pause,
  Music,
  Smartphone,
  Sparkles,
  SlidersHorizontal
} from 'lucide-react';
import { NokiaSnakeEngine } from '../game/nokiaSnakeEngine';
import { NokiaSnakeRenderer } from '../game/nokiaSnakeRenderer';
import { nokiaSnakeAudio } from '../game/nokiaSnakeAudio';
import { getNokiaSnakeScores, NokiaSnakeScore } from '../game/nokiaSnakeHighScores';
import { NokiaSnakeHistoryModal } from './NokiaSnakeHistoryModal';
import { haptics } from '../utils/haptics';

interface NokiaSnakeCabinetProps {
  onBackToLobby: () => void;
  lang?: 'nl' | 'en';
}

export const NokiaSnakeCabinet: React.FC<NokiaSnakeCabinetProps> = ({ onBackToLobby, lang = 'nl' }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<NokiaSnakeEngine | null>(null);
  const rendererRef = useRef<NokiaSnakeRenderer | null>(null);

  const [gameState, setGameState] = useState<'MENU' | 'PLAYING' | 'PAUSED' | 'GAME_OVER'>('MENU');
  const [score, setScore] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(384);
  const [speedLevel, setSpeedLevel] = useState<number>(1);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [phoneColor, setPhoneColor] = useState<'classic_blue' | 'cyber_silver' | 'matrix_green'>('classic_blue');
  const [isDossierOpen, setIsDossierOpen] = useState<boolean>(false);
  const [isScoresOpen, setIsScoresOpen] = useState<boolean>(false);
  const [highScoresList, setHighScoresList] = useState<NokiaSnakeScore[]>([]);
  const [showSettings, setShowSettings] = useState<boolean>(false);

  // Initialize engine and renderer
  useEffect(() => {
    const engine = new NokiaSnakeEngine();
    const renderer = new NokiaSnakeRenderer();
    engineRef.current = engine;
    rendererRef.current = renderer;

    setHighScore(engine.highScore);
    setSpeedLevel(engine.speedLevel);
    setHighScoresList(getNokiaSnakeScores());

    let animId: number;

    const gameLoop = (time: number) => {
      engine.update(time);

      setGameState(engine.state);
      setScore(engine.score);
      setHighScore(engine.highScore);
      setSpeedLevel(engine.speedLevel);

      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          renderer.render(ctx, engine);
        }
      }

      animId = requestAnimationFrame(gameLoop);
    };

    animId = requestAnimationFrame(gameLoop);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, []);

  // Keyboard navigation & controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const engine = engineRef.current;
      if (!engine) return;

      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
        case '2':
          e.preventDefault();
          haptics.light();
          engine.navUp();
          break;

        case 'ArrowDown':
        case 's':
        case 'S':
        case '8':
          e.preventDefault();
          haptics.light();
          engine.navDown();
          break;

        case 'ArrowLeft':
        case 'a':
        case 'A':
        case '4':
          e.preventDefault();
          haptics.light();
          engine.navLeft();
          break;

        case 'ArrowRight':
        case 'd':
        case 'D':
        case '6':
          e.preventDefault();
          haptics.light();
          engine.navRight();
          break;

        case 'Enter':
        case ' ':
          e.preventDefault();
          haptics.medium();
          engine.pressNaviKey();
          break;

        case 'Backspace':
        case 'Escape':
        case 'c':
        case 'C':
          e.preventDefault();
          haptics.light();
          engine.pressClearKey();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleToggleMute = useCallback(() => {
    haptics.light();
    const muted = nokiaSnakeAudio.toggleMute();
    setIsMuted(muted);
  }, []);

  const handlePlayRingtone = useCallback(() => {
    haptics.success();
    nokiaSnakeAudio.playNokiaTune();
  }, []);

  const handleOpenScores = useCallback(() => {
    haptics.light();
    setHighScoresList(getNokiaSnakeScores());
    setIsScoresOpen(true);
  }, []);

  // Phone color theme definitions
  const colorThemes = {
    classic_blue: {
      body: 'from-slate-800 via-blue-950 to-slate-900 border-blue-900/60 shadow-[0_0_60px_rgba(30,58,138,0.35)]',
      trim: 'border-slate-700 bg-slate-800/80',
      keypad: 'bg-neutral-800 hover:bg-neutral-700 active:bg-blue-600 text-neutral-200 active:text-white',
      navi: 'bg-gradient-to-b from-blue-600 to-blue-800 text-white shadow-lg'
    },
    cyber_silver: {
      body: 'from-neutral-700 via-neutral-800 to-neutral-900 border-neutral-600/60 shadow-[0_0_60px_rgba(255,255,255,0.15)]',
      trim: 'border-neutral-600 bg-neutral-700/80',
      keypad: 'bg-neutral-800 hover:bg-neutral-700 active:bg-neutral-500 text-neutral-200 active:text-white',
      navi: 'bg-gradient-to-b from-neutral-400 to-neutral-600 text-black shadow-lg'
    },
    matrix_green: {
      body: 'from-emerald-950 via-neutral-950 to-emerald-950 border-emerald-900/60 shadow-[0_0_60px_rgba(16,185,129,0.25)]',
      trim: 'border-emerald-900 bg-emerald-950/80',
      keypad: 'bg-neutral-900 hover:bg-neutral-800 active:bg-emerald-600 text-emerald-200 active:text-black',
      navi: 'bg-gradient-to-b from-emerald-600 to-emerald-800 text-black shadow-lg'
    }
  };

  const currentTheme = colorThemes[phoneColor];

  return (
    <div className="min-h-screen w-full bg-black text-white flex flex-col items-center justify-between p-2 sm:p-4 font-mono select-none overflow-x-hidden">
      {/* Top Header Navigation Bar */}
      <header className="w-full max-w-4xl flex items-center justify-between py-2 px-3 sm:px-4 rounded-2xl bg-neutral-950 border border-neutral-800 shadow-xl mb-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBackToLobby}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 text-neutral-300 hover:text-white text-xs transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{lang === 'nl' ? 'Speelhal' : 'Lobby'}</span>
          </button>

          <div className="hidden sm:flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-xs sm:text-sm font-black text-white tracking-wider flex items-center gap-2">
                NOKIA SNAKE
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500 text-black font-bold">1997</span>
              </h1>
              <p className="text-[10px] text-neutral-400">Nokia 6110 / 3310 • Taneli Armanto • Espoo</p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setShowSettings(!showSettings)}
            className={`p-2 rounded-xl border text-xs transition-colors cursor-pointer ${
              showSettings ? 'bg-emerald-500 text-black border-emerald-400' : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
            }`}
            title="Instellingen & Snelheid"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handlePlayRingtone}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 text-neutral-300 hover:text-emerald-400 text-xs transition-colors cursor-pointer"
            title="Speel Nokia Tune"
          >
            <Music className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden md:inline text-[11px]">Nokia Tune</span>
          </button>

          <button
            type="button"
            onClick={handleOpenScores}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 text-neutral-300 hover:text-white text-xs transition-colors cursor-pointer"
          >
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden md:inline text-[11px]">{lang === 'nl' ? 'Topscores' : 'High Scores'}</span>
          </button>

          <button
            type="button"
            onClick={() => setIsDossierOpen(true)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 text-neutral-300 hover:text-white text-xs transition-colors cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden md:inline text-[11px]">{lang === 'nl' ? 'Dossier 1997' : 'History'}</span>
          </button>

          <button
            type="button"
            onClick={handleToggleMute}
            className={`p-2 rounded-xl border text-xs transition-colors cursor-pointer ${
              isMuted ? 'bg-red-500/20 border-red-500/40 text-red-400' : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
            }`}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Settings Drawer */}
      {showSettings && (
        <div className="w-full max-w-4xl p-3 sm:p-4 rounded-2xl bg-neutral-950 border border-emerald-500/30 shadow-2xl mb-3 flex flex-wrap gap-4 items-center justify-between text-xs">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-neutral-400">Snelheid (1-9):</span>
              <div className="flex flex-wrap gap-1">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => {
                      if (engineRef.current) engineRef.current.speedLevel = lvl;
                      setSpeedLevel(lvl);
                      haptics.light();
                    }}
                    className={`px-2 py-0.5 rounded text-[11px] font-bold cursor-pointer transition-all ${
                      speedLevel === lvl 
                        ? 'bg-emerald-500 text-black font-black shadow-[0_0_8px_rgba(16,185,129,0.7)]' 
                        : 'bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300'
                    }`}
                    title={lvl === 1 ? 'Level 1: Rustig & Kalm' : `Level ${lvl}`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
              {speedLevel === 1 && (
                <span className="text-[10px] text-emerald-400 font-mono font-bold ml-1">
                  (Rustig)
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-neutral-400">Behuizing Kleur:</span>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => setPhoneColor('classic_blue')}
                  className={`px-2 py-0.5 rounded text-[10px] ${phoneColor === 'classic_blue' ? 'bg-blue-600 text-white font-bold' : 'bg-neutral-900 text-neutral-400'}`}
                >
                  Nokia Blauw
                </button>
                <button
                  type="button"
                  onClick={() => setPhoneColor('cyber_silver')}
                  className={`px-2 py-0.5 rounded text-[10px] ${phoneColor === 'cyber_silver' ? 'bg-neutral-400 text-black font-bold' : 'bg-neutral-900 text-neutral-400'}`}
                >
                  3310 Zilver
                </button>
                <button
                  type="button"
                  onClick={() => setPhoneColor('matrix_green')}
                  className={`px-2 py-0.5 rounded text-[10px] ${phoneColor === 'matrix_green' ? 'bg-emerald-500 text-black font-bold' : 'bg-neutral-900 text-neutral-400'}`}
                >
                  Matrix Groen
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-neutral-400">Doolhof:</span>
              <button
                type="button"
                onClick={() => {
                  const mazes: ('classic' | 'box' | 'tunnel' | 'rails')[] = ['classic', 'box', 'tunnel', 'rails'];
                  if (engineRef.current) {
                    const next = mazes[(mazes.indexOf(engineRef.current.selectedMaze) + 1) % mazes.length];
                    engineRef.current.selectedMaze = next;
                    engineRef.current.buildMaze(next);
                  }
                  haptics.light();
                }}
                className="px-2.5 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-emerald-400 font-bold uppercase text-[10px]"
              >
                {engineRef.current?.selectedMaze || 'Classic'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Authentic Nokia Phone Device Frame */}
      <main className="w-full max-w-md flex-1 flex flex-col items-center justify-center my-auto">
        <div className={`relative w-[310px] sm:w-[350px] p-5 sm:p-6 rounded-[52px] bg-gradient-to-b ${currentTheme.body} border-4 transition-all duration-300 flex flex-col items-center select-none`}>
          {/* Earpiece / Speaker Slit */}
          <div className="w-14 h-2 rounded-full bg-neutral-950 border border-neutral-700/60 shadow-inner mb-3 flex items-center justify-center gap-1">
            <div className="w-1.5 h-1 rounded-full bg-neutral-800" />
            <div className="w-1.5 h-1 rounded-full bg-neutral-800" />
            <div className="w-1.5 h-1 rounded-full bg-neutral-800" />
          </div>

          {/* Authentic Silver Screen Bezel with NOKIA typography */}
          <div className="w-full rounded-3xl bg-gradient-to-b from-neutral-800 to-neutral-900 border-2 border-neutral-600/80 p-3 shadow-inner flex flex-col items-center">
            <div className="text-neutral-400 tracking-[0.25em] text-[11px] font-black uppercase mb-1.5 font-sans drop-shadow-sm">
              NOKIA
            </div>

            {/* Protective Curved Glass Lens with Glare Reflection */}
            <div className="relative rounded-2xl p-2.5 bg-[#1a2e15] border-2 border-[#152410] shadow-[inset_0_3px_10px_rgba(0,0,0,0.8)] overflow-hidden">
              {/* Subtle screen reflection gradient */}
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none rounded-2xl" />

              {/* 84x48 Pixel Canvas Display */}
              <canvas
                ref={canvasRef}
                width={84}
                height={48}
                className="w-[240px] sm:w-[270px] h-[137px] sm:h-[154px] rounded-lg [image-rendering:pixelated] block shadow-md cursor-pointer"
                onClick={() => {
                  engineRef.current?.pressNaviKey();
                }}
              />
            </div>
          </div>

          {/* Functional Nokia Phone Control Buttons (Navi, C, Arrows) */}
          <div className="w-full mt-4 flex flex-col items-center gap-2">
            {/* Softkeys Row: C key (left), Navi key (middle), Up/Down rocker (right) */}
            <div className="w-full grid grid-cols-4 gap-2 items-center px-1">
              {/* 'C' Clear / Back Button */}
              <button
                type="button"
                onClick={() => engineRef.current?.pressClearKey()}
                className="h-10 rounded-2xl bg-neutral-800 hover:bg-neutral-700 active:bg-neutral-600 border border-neutral-700 text-neutral-200 flex items-center justify-center font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer"
                title="C / Annuleer / Pauze"
              >
                C
              </button>

              {/* Large Central Navi Key */}
              <button
                type="button"
                onClick={() => engineRef.current?.pressNaviKey()}
                className={`col-span-2 h-11 rounded-3xl ${currentTheme.navi} border border-blue-400/50 flex items-center justify-center font-black text-xs tracking-wider shadow-lg transition-all active:scale-95 cursor-pointer`}
              >
                {gameState === 'PLAYING' ? 'PAUZE' : gameState === 'MENU' ? 'START' : 'OK'}
              </button>

              {/* Up & Down rocker button */}
              <div className="h-10 flex flex-col rounded-2xl bg-neutral-800 border border-neutral-700 overflow-hidden shadow-md">
                <button
                  type="button"
                  onClick={() => engineRef.current?.navUp()}
                  className="flex-1 hover:bg-neutral-700 active:bg-neutral-600 flex items-center justify-center text-[10px] text-neutral-300 active:text-white"
                >
                  ▲
                </button>
                <div className="h-[1px] bg-neutral-700" />
                <button
                  type="button"
                  onClick={() => engineRef.current?.navDown()}
                  className="flex-1 hover:bg-neutral-700 active:bg-neutral-600 flex items-center justify-center text-[10px] text-neutral-300 active:text-white"
                >
                  ▼
                </button>
              </div>
            </div>

            {/* Classic 12-Key Numeric Keypad with 2-4-6-8 directional arrows */}
            <div className="w-full grid grid-cols-3 gap-2 px-1 mt-1">
              {/* Row 1: 1, 2 (UP), 3 */}
              <button
                type="button"
                onClick={() => engineRef.current?.navLeft()}
                className={`h-9 sm:h-10 rounded-xl ${currentTheme.keypad} flex flex-col items-center justify-center border border-neutral-700/60 shadow-sm active:scale-95 transition-all cursor-pointer`}
              >
                <span className="text-xs font-bold leading-none">1</span>
                <span className="text-[8px] text-neutral-400 leading-none">o_o</span>
              </button>

              <button
                type="button"
                onClick={() => engineRef.current?.navUp()}
                className={`h-9 sm:h-10 rounded-xl ${currentTheme.keypad} ring-1 ring-emerald-500/50 flex flex-col items-center justify-center border border-neutral-700/60 shadow-sm active:scale-95 transition-all cursor-pointer`}
              >
                <span className="text-xs font-bold leading-none text-emerald-400">2 ▲</span>
                <span className="text-[8px] text-neutral-400 leading-none">abc</span>
              </button>

              <button
                type="button"
                onClick={() => engineRef.current?.navRight()}
                className={`h-9 sm:h-10 rounded-xl ${currentTheme.keypad} flex flex-col items-center justify-center border border-neutral-700/60 shadow-sm active:scale-95 transition-all cursor-pointer`}
              >
                <span className="text-xs font-bold leading-none">3</span>
                <span className="text-[8px] text-neutral-400 leading-none">def</span>
              </button>

              {/* Row 2: 4 (LEFT), 5 (OK), 6 (RIGHT) */}
              <button
                type="button"
                onClick={() => engineRef.current?.navLeft()}
                className={`h-9 sm:h-10 rounded-xl ${currentTheme.keypad} ring-1 ring-emerald-500/50 flex flex-col items-center justify-center border border-neutral-700/60 shadow-sm active:scale-95 transition-all cursor-pointer`}
              >
                <span className="text-xs font-bold leading-none text-emerald-400">4 ◀</span>
                <span className="text-[8px] text-neutral-400 leading-none">ghi</span>
              </button>

              <button
                type="button"
                onClick={() => engineRef.current?.pressNaviKey()}
                className={`h-9 sm:h-10 rounded-xl ${currentTheme.keypad} flex flex-col items-center justify-center border border-neutral-700/60 shadow-sm active:scale-95 transition-all cursor-pointer`}
              >
                <span className="text-xs font-bold leading-none">5</span>
                <span className="text-[8px] text-neutral-400 leading-none">jkl</span>
              </button>

              <button
                type="button"
                onClick={() => engineRef.current?.navRight()}
                className={`h-9 sm:h-10 rounded-xl ${currentTheme.keypad} ring-1 ring-emerald-500/50 flex flex-col items-center justify-center border border-neutral-700/60 shadow-sm active:scale-95 transition-all cursor-pointer`}
              >
                <span className="text-xs font-bold leading-none text-emerald-400">6 ▶</span>
                <span className="text-[8px] text-neutral-400 leading-none">mno</span>
              </button>

              {/* Row 3: 7, 8 (DOWN), 9 */}
              <button
                type="button"
                onClick={() => engineRef.current?.navLeft()}
                className={`h-9 sm:h-10 rounded-xl ${currentTheme.keypad} flex flex-col items-center justify-center border border-neutral-700/60 shadow-sm active:scale-95 transition-all cursor-pointer`}
              >
                <span className="text-xs font-bold leading-none">7</span>
                <span className="text-[8px] text-neutral-400 leading-none">pqrs</span>
              </button>

              <button
                type="button"
                onClick={() => engineRef.current?.navDown()}
                className={`h-9 sm:h-10 rounded-xl ${currentTheme.keypad} ring-1 ring-emerald-500/50 flex flex-col items-center justify-center border border-neutral-700/60 shadow-sm active:scale-95 transition-all cursor-pointer`}
              >
                <span className="text-xs font-bold leading-none text-emerald-400">8 ▼</span>
                <span className="text-[8px] text-neutral-400 leading-none">tuv</span>
              </button>

              <button
                type="button"
                onClick={() => engineRef.current?.navRight()}
                className={`h-9 sm:h-10 rounded-xl ${currentTheme.keypad} flex flex-col items-center justify-center border border-neutral-700/60 shadow-sm active:scale-95 transition-all cursor-pointer`}
              >
                <span className="text-xs font-bold leading-none">9</span>
                <span className="text-[8px] text-neutral-400 leading-none">wxyz</span>
              </button>

              {/* Row 4: *, 0, # */}
              <button
                type="button"
                onClick={() => handlePlayRingtone()}
                className={`h-9 sm:h-10 rounded-xl ${currentTheme.keypad} flex flex-col items-center justify-center border border-neutral-700/60 shadow-sm active:scale-95 transition-all cursor-pointer`}
                title="Ringtone"
              >
                <span className="text-xs font-bold leading-none text-amber-400">*</span>
                <span className="text-[8px] text-neutral-400 leading-none">♫</span>
              </button>

              <button
                type="button"
                onClick={() => engineRef.current?.pressNaviKey()}
                className={`h-9 sm:h-10 rounded-xl ${currentTheme.keypad} flex flex-col items-center justify-center border border-neutral-700/60 shadow-sm active:scale-95 transition-all cursor-pointer`}
              >
                <span className="text-xs font-bold leading-none">0</span>
                <span className="text-[8px] text-neutral-400 leading-none">_</span>
              </button>

              <button
                type="button"
                onClick={() => engineRef.current?.pressClearKey()}
                className={`h-9 sm:h-10 rounded-xl ${currentTheme.keypad} flex flex-col items-center justify-center border border-neutral-700/60 shadow-sm active:scale-95 transition-all cursor-pointer`}
              >
                <span className="text-xs font-bold leading-none">#</span>
                <span className="text-[8px] text-neutral-400 leading-none">⇪</span>
              </button>
            </div>

            {/* Keyboard Guide Tip */}
            <div className="mt-2 text-[10px] text-neutral-400 text-center">
              Besturing: <strong className="text-emerald-400">2, 4, 6, 8</strong> of <strong className="text-emerald-400">Pijltjes / WASD</strong> • <strong className="text-emerald-400">Spatie / Enter</strong> = OK
            </div>
          </div>
        </div>
      </main>

      {/* Historical Dossier Modal */}
      <NokiaSnakeHistoryModal
        isOpen={isDossierOpen}
        onClose={() => setIsDossierOpen(false)}
        lang={lang}
      />

      {/* High Scores Modal */}
      {isScoresOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-neutral-950 border border-emerald-500/40 rounded-2xl shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2 text-emerald-400">
                <Trophy className="w-5 h-5" />
                <h3 className="font-bold text-sm text-white">NOKIA TOP SCORES</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsScoresOpen(false)}
                className="text-neutral-400 hover:text-white text-xs"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto font-mono">
              {highScoresList.map((sc, idx) => (
                <div key={sc.id} className="flex items-center justify-between p-2 rounded-lg bg-neutral-900 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-500 font-bold">{idx + 1}.</span>
                    <span className="font-bold text-white">{sc.initials}</span>
                    <span className="text-[10px] text-neutral-500">SPD {sc.speed} • {sc.maze}</span>
                  </div>
                  <span className="text-emerald-400 font-bold">{sc.score} PTS</span>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setIsScoresOpen(false)}
              className="w-full py-2 rounded-xl bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 text-white text-xs font-bold"
            >
              Sluiten
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
