/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Lode Runner (Apple II, 1983 - Doug Smith / Brøderbund)
 * Full Interactive Apple IIe Retro Cabinet Component
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { 
  ArrowLeft, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  BookOpen, 
  Tv, 
  Award, 
  Play, 
  Pause,
  Disc,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  Pickaxe
} from 'lucide-react';
import { LodeRunnerEngine } from '../game/lodeRunnerEngine';
import { LodeRunnerRenderer, LodeRunnerMonitorMode } from '../game/lodeRunnerRenderer';
import { lodeRunnerAudio } from '../game/lodeRunnerAudio';
import { LodeRunnerHistoryModal } from './LodeRunnerHistoryModal';
import { haptics } from '../utils/haptics';

interface LodeRunnerCabinetProps {
  onBackToLobby: () => void;
}

export const LodeRunnerCabinet: React.FC<LodeRunnerCabinetProps> = ({ onBackToLobby }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<LodeRunnerEngine | null>(null);
  const rendererRef = useRef<LodeRunnerRenderer | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // UI state
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [lives, setLives] = useState(5);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [goldLeft, setGoldLeft] = useState(0);
  const [escapeLadderOpen, setEscapeLadderOpen] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [monitorMode, setMonitorMode] = useState<LodeRunnerMonitorMode>('green');
  const [diskDriveBusy, setDiskDriveBusy] = useState(true);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Key tracking
  const keysRef = useRef<{
    left: boolean;
    right: boolean;
    up: boolean;
    down: boolean;
    digL: boolean;
    digR: boolean;
  }>({
    left: false,
    right: false,
    up: false,
    down: false,
    digL: false,
    digR: false
  });

  const [lang] = useState<'nl' | 'en'>(() => {
    try {
      return (localStorage.getItem('arcade_vault_lang_v2') as 'nl' | 'en') || 'nl';
    } catch {
      return 'nl';
    }
  });

  // Initialize Engine and Game Loop
  useEffect(() => {
    if (!canvasRef.current) return;

    const engine = new LodeRunnerEngine(0);
    engineRef.current = engine;

    const renderer = new LodeRunnerRenderer(canvasRef.current);
    renderer.setMonitorMode(monitorMode);
    rendererRef.current = renderer;

    setHighScore(engine.highScore);
    setScore(engine.score);
    setLives(engine.lives);
    setCurrentLevel(engine.currentLevelIndex + 1);
    setGoldLeft(engine.goldCount);

    // Apple Disk II drive light simulation
    const diskTimeout = setTimeout(() => {
      setDiskDriveBusy(false);
    }, 1500);

    let lastTime = performance.now();

    const gameLoop = (currentTime: number) => {
      const dt = Math.min(0.1, (currentTime - lastTime) / 1000);
      lastTime = currentTime;

      const input = {
        left: keysRef.current.left,
        right: keysRef.current.right,
        up: keysRef.current.up,
        down: keysRef.current.down,
        digL: keysRef.current.digL,
        digR: keysRef.current.digR
      };

      if (engineRef.current && rendererRef.current) {
        engineRef.current.update(dt, input);
        rendererRef.current.render(engineRef.current);

        // Sync state to UI throttled
        setScore(engineRef.current.score);
        setHighScore(engineRef.current.highScore);
        setLives(engineRef.current.lives);
        setCurrentLevel(engineRef.current.currentLevelIndex + 1);
        setGoldLeft(engineRef.current.goldCount);
        setEscapeLadderOpen(engineRef.current.escapeLadderRevealed);
        setIsGameOver(engineRef.current.isGameOver);
      }

      animationFrameRef.current = requestAnimationFrame(gameLoop);
    };

    animationFrameRef.current = requestAnimationFrame(gameLoop);

    return () => {
      clearTimeout(diskTimeout);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Update Monitor Mode on Renderer
  useEffect(() => {
    if (rendererRef.current) {
      rendererRef.current.setMonitorMode(monitorMode);
    }
  }, [monitorMode]);

  // Keyboard Event Handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent browser scroll with arrows and space
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }

      const k = e.key.toLowerCase();

      if (k === 'arrowleft' || k === 'a') keysRef.current.left = true;
      if (k === 'arrowright' || k === 'd') keysRef.current.right = true;
      if (k === 'arrowup' || k === 'w') keysRef.current.up = true;
      if (k === 'arrowdown' || k === 's') keysRef.current.down = true;

      // Dig Left: Z, U, J
      if (k === 'z' || k === 'u' || k === 'j') keysRef.current.digL = true;
      // Dig Right: C, X, K
      if (k === 'c' || k === 'x' || k === 'k') keysRef.current.digR = true;

      // Pause: P or Space
      if (k === 'p' || k === ' ') {
        togglePause();
      }

      // Restart Level: R
      if (k === 'r') {
        handleRestartLevel();
      }

      // Mute: M
      if (k === 'm') {
        toggleMute();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (k === 'arrowleft' || k === 'a') keysRef.current.left = false;
      if (k === 'arrowright' || k === 'd') keysRef.current.right = false;
      if (k === 'arrowup' || k === 'w') keysRef.current.up = false;
      if (k === 'arrowdown' || k === 's') keysRef.current.down = false;
      if (k === 'z' || k === 'u' || k === 'j') keysRef.current.digL = false;
      if (k === 'c' || k === 'x' || k === 'k') keysRef.current.digR = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const togglePause = useCallback(() => {
    if (!engineRef.current) return;
    const next = !engineRef.current.isPaused;
    engineRef.current.isPaused = next;
    setIsPaused(next);
  }, []);

  const toggleMute = useCallback(() => {
    const next = !isMuted;
    lodeRunnerAudio.setMuted(next);
    setIsMuted(next);
  }, [isMuted]);

  const handleRestartLevel = useCallback(() => {
    if (!engineRef.current) return;
    setDiskDriveBusy(true);
    engineRef.current.restartLevel();
    setTimeout(() => setDiskDriveBusy(false), 800);
  }, []);

  const handleNextLevel = useCallback(() => {
    if (!engineRef.current) return;
    setDiskDriveBusy(true);
    engineRef.current.nextLevel();
    setTimeout(() => setDiskDriveBusy(false), 900);
  }, []);

  const handlePrevLevel = useCallback(() => {
    if (!engineRef.current) return;
    const prev = Math.max(0, engineRef.current.currentLevelIndex - 1);
    setDiskDriveBusy(true);
    engineRef.current.setLevel(prev);
    setTimeout(() => setDiskDriveBusy(false), 900);
  }, []);

  const handleSelectLevel = useCallback((lvlIndex: number) => {
    if (!engineRef.current) return;
    setDiskDriveBusy(true);
    engineRef.current.setLevel(lvlIndex);
    setTimeout(() => setDiskDriveBusy(false), 900);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-neutral-100 flex flex-col items-center justify-between p-2 sm:p-4 select-none">
      
      {/* 1. TOP RETRO TERMINAL HEADER */}
      <header className="w-full max-w-5xl flex flex-wrap items-center justify-between gap-3 bg-neutral-900/90 border border-neutral-800 rounded-2xl p-3 shadow-xl backdrop-blur">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBackToLobby}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white font-mono text-xs transition-colors cursor-pointer border border-neutral-700 shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">{lang === 'nl' ? 'Terug naar Speelhal' : 'Back to Arcade'}</span>
          </button>

          {/* Apple ][ Rainbow Badge */}
          <div className="flex items-center gap-2 bg-neutral-950 px-3 py-1.5 rounded-xl border border-neutral-800">
            <div className="flex flex-col h-4 w-1.5 rounded-full overflow-hidden">
              <span className="bg-green-500 h-1/6" />
              <span className="bg-yellow-400 h-1/6" />
              <span className="bg-orange-500 h-1/6" />
              <span className="bg-red-500 h-1/6" />
              <span className="bg-purple-600 h-1/6" />
              <span className="bg-blue-500 h-1/6" />
            </div>
            <span className="font-bold text-xs tracking-wider text-emerald-400 font-mono">
              APPLE IIe • 1983
            </span>
          </div>
        </div>

        {/* Title & Creator */}
        <div className="text-center hidden md:block">
          <h1 className="text-xl font-black font-mono tracking-tight text-white flex items-center justify-center gap-2">
            <span>🏃 LODE RUNNER</span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-normal">
              Brøderbund
            </span>
          </h1>
          <p className="text-[11px] text-neutral-400 font-mono">
            Doug Smith • 280×192 Hi-Res 6502 Machine Code
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Dossier button */}
          <button
            type="button"
            onClick={() => setIsHistoryOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-emerald-400 font-mono text-xs font-bold border border-neutral-700 transition-colors cursor-pointer"
          >
            <BookOpen className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">Dossier</span>
          </button>

          {/* Sound Toggle */}
          <button
            type="button"
            onClick={toggleMute}
            className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white border border-neutral-700 transition-colors cursor-pointer"
            title={isMuted ? 'Geluid Aanzetten' : 'Geluid Dempen'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>

          {/* Restart Level */}
          <button
            type="button"
            onClick={handleRestartLevel}
            className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white border border-neutral-700 transition-colors cursor-pointer"
            title="Herstart Level (R)"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* 2. MAIN APPLE MONITOR /// & HARDWARE CASING */}
      <main className="w-full max-w-5xl my-2 sm:my-4 flex flex-col items-center">
        
        {/* Apple Monitor Beige/Charcoal Chassis */}
        <div className="w-full rounded-3xl bg-[#e6e2d3] border-4 border-[#b8b39e] p-3 sm:p-6 shadow-2xl relative">
          
          {/* Top Chassis Label */}
          <div className="flex items-center justify-between pb-3 px-2 border-b border-[#c8c3af]">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-black text-[#5c5545] tracking-widest uppercase">
                MONITOR /// 12" CRT
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#d6d0bf] text-[#4a4436] font-bold">
                P31 HIGH-PERSISTENCE PHOSPHOR
              </span>
            </div>

            {/* Phosphor Mode Selector */}
            <div className="flex items-center gap-1.5">
              <Tv className="w-3.5 h-3.5 text-[#5c5545]" />
              <button
                type="button"
                onClick={() => setMonitorMode('green')}
                className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold transition-all cursor-pointer ${
                  monitorMode === 'green'
                    ? 'bg-emerald-600 text-white shadow'
                    : 'bg-[#d6d0bf] text-[#5c5545] hover:bg-[#c8c3af]'
                }`}
              >
                P31 Green
              </button>
              <button
                type="button"
                onClick={() => setMonitorMode('amber')}
                className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold transition-all cursor-pointer ${
                  monitorMode === 'amber'
                    ? 'bg-amber-600 text-white shadow'
                    : 'bg-[#d6d0bf] text-[#5c5545] hover:bg-[#c8c3af]'
                }`}
              >
                Amber
              </button>
              <button
                type="button"
                onClick={() => setMonitorMode('color')}
                className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold transition-all cursor-pointer ${
                  monitorMode === 'color'
                    ? 'bg-blue-600 text-white shadow'
                    : 'bg-[#d6d0bf] text-[#5c5545] hover:bg-[#c8c3af]'
                }`}
              >
                Apple Color
              </button>
            </div>
          </div>

          {/* Curved Black CRT Screen Bezel */}
          <div className="mt-3 relative rounded-2xl bg-black p-2 sm:p-4 border-4 border-neutral-900 shadow-inner flex flex-col items-center overflow-hidden">
            
            {/* The CRT Canvas (Native 280x192 Display) */}
            <canvas
              ref={canvasRef}
              width={560}
              height={384}
              className="w-full max-w-[840px] aspect-[280/192] rounded-lg shadow-2xl cursor-crosshair bg-black"
            />

            {/* In-game Pause Overlay */}
            {isPaused && (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/75 backdrop-blur-sm">
                <div className="p-6 rounded-2xl bg-neutral-900 border-2 border-emerald-500/80 text-center space-y-3 shadow-2xl">
                  <h3 className="text-2xl font-black font-mono text-emerald-400 tracking-wider">
                    PAUZE / PAUSED
                  </h3>
                  <p className="text-xs text-neutral-300 font-mono">
                    Druk op SPATIE of P om door te gaan
                  </p>
                  <button
                    type="button"
                    onClick={togglePause}
                    className="px-6 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-mono font-black text-xs cursor-pointer shadow-lg inline-flex items-center gap-2"
                  >
                    <Play className="w-4 h-4 fill-black" />
                    <span>VERDER SPELEN</span>
                  </button>
                </div>
              </div>
            )}

            {/* Game Over Overlay */}
            {isGameOver && (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/85 backdrop-blur-sm">
                <div className="p-8 rounded-3xl bg-neutral-900 border-2 border-red-500 text-center space-y-4 shadow-2xl max-w-md">
                  <div className="text-4xl animate-bounce">💀</div>
                  <h3 className="text-3xl font-black font-mono text-red-500 tracking-wider">
                    GAME OVER
                  </h3>
                  <div className="space-y-1 font-mono text-xs">
                    <p className="text-neutral-400">EINDSCORE: <span className="text-emerald-400 font-bold text-sm">{score}</span></p>
                    <p className="text-neutral-400">RECORD: <span className="text-amber-400 font-bold text-sm">{highScore}</span></p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      engineRef.current?.restartGame();
                      setIsGameOver(false);
                    }}
                    className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-mono font-black text-xs cursor-pointer shadow-lg inline-flex items-center gap-2"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>NIEUW SPEL STARTEN</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Monitor Bezel Bar: Apple Disk II drive light & Level Selector */}
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3 px-2 pt-2 border-t border-[#c8c3af]">
            
            {/* Apple Disk II Drive Activity Light */}
            <div className="flex items-center gap-3 bg-[#383329] px-3 py-1.5 rounded-lg border border-[#2b271f] text-neutral-300">
              <Disc className="w-4 h-4 text-[#a39c89]" />
              <div className="flex items-center gap-1.5 font-mono text-[11px]">
                <span className="text-[#d6d0bf] font-bold">DISK II DRIVE 1:</span>
                <span className={`w-2.5 h-2.5 rounded-full transition-all ${
                  diskDriveBusy ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.9)] animate-pulse' : 'bg-red-950 border border-red-800'
                }`} />
                <span className="text-[10px] text-[#a39c89]">5.25" DOS 3.3</span>
              </div>
            </div>

            {/* Level Selector (Levels 1 to 5) */}
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-[#5c5545]">LEVEL:</span>
              <button
                type="button"
                onClick={handlePrevLevel}
                className="p-1 rounded bg-[#d6d0bf] hover:bg-[#c8c3af] text-[#4a4436] cursor-pointer"
                title="Vorig Level"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              
              <div className="flex items-center gap-1">
                {[0, 1, 2, 3, 4].map((idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectLevel(idx)}
                    className={`w-7 h-7 rounded font-mono text-xs font-bold transition-all cursor-pointer ${
                      currentLevel === idx + 1
                        ? 'bg-emerald-600 text-white shadow'
                        : 'bg-[#d6d0bf] text-[#4a4436] hover:bg-[#c8c3af]'
                    }`}
                  >
                    {idx + 1}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={handleNextLevel}
                className="p-1 rounded bg-[#d6d0bf] hover:bg-[#c8c3af] text-[#4a4436] cursor-pointer"
                title="Volgend Level"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Gold / Escape status */}
            <div className="font-mono text-xs text-[#5c5545] font-bold flex items-center gap-2">
              <span>GOUD: <span className="text-emerald-700 font-black">{goldLeft}</span></span>
              {escapeLadderOpen && (
                <span className="px-2 py-0.5 rounded bg-amber-500 text-black text-[10px] font-black animate-pulse">
                  ESCAPE OPEN!
                </span>
              )}
            </div>
          </div>
        </div>

        {/* 3. VIRTUAL TOUCH CONTROLS (Mobile / Tablet Responsive) */}
        <div className="w-full mt-4 p-4 rounded-2xl bg-neutral-900/80 border border-neutral-800 flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Virtual 4-Way D-Pad for Movement */}
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-mono text-neutral-400 mb-1">LOOP &amp; KLIM</span>
            <div className="grid grid-cols-3 gap-1.5 w-36 h-36">
              <div />
              <button
                type="button"
                onTouchStart={() => { keysRef.current.up = true; haptics.selection(); }}
                onTouchEnd={() => { keysRef.current.up = false; }}
                onMouseDown={() => { keysRef.current.up = true; }}
                onMouseUp={() => { keysRef.current.up = false; }}
                className="rounded-xl bg-neutral-800 active:bg-emerald-500 active:text-black text-neutral-300 font-bold flex items-center justify-center text-lg shadow cursor-pointer border border-neutral-700 select-none"
              >
                ▲
              </button>
              <div />

              <button
                type="button"
                onTouchStart={() => { keysRef.current.left = true; haptics.selection(); }}
                onTouchEnd={() => { keysRef.current.left = false; }}
                onMouseDown={() => { keysRef.current.left = true; }}
                onMouseUp={() => { keysRef.current.left = false; }}
                className="rounded-xl bg-neutral-800 active:bg-emerald-500 active:text-black text-neutral-300 font-bold flex items-center justify-center text-lg shadow cursor-pointer border border-neutral-700 select-none"
              >
                ◀
              </button>

              <div className="rounded-xl bg-neutral-950 border border-neutral-800 flex items-center justify-center text-[10px] font-mono text-neutral-500">
                RUN
              </div>

              <button
                type="button"
                onTouchStart={() => { keysRef.current.right = true; haptics.selection(); }}
                onTouchEnd={() => { keysRef.current.right = false; }}
                onMouseDown={() => { keysRef.current.right = true; }}
                onMouseUp={() => { keysRef.current.right = false; }}
                className="rounded-xl bg-neutral-800 active:bg-emerald-500 active:text-black text-neutral-300 font-bold flex items-center justify-center text-lg shadow cursor-pointer border border-neutral-700 select-none"
              >
                ▶
              </button>

              <div />
              <button
                type="button"
                onTouchStart={() => { keysRef.current.down = true; haptics.selection(); }}
                onTouchEnd={() => { keysRef.current.down = false; }}
                onMouseDown={() => { keysRef.current.down = true; }}
                onMouseUp={() => { keysRef.current.down = false; }}
                className="rounded-xl bg-neutral-800 active:bg-emerald-500 active:text-black text-neutral-300 font-bold flex items-center justify-center text-lg shadow cursor-pointer border border-neutral-700 select-none"
              >
                ▼
              </button>
              <div />
            </div>
          </div>

          {/* Keyboard & Gamepad Instructions center */}
          <div className="text-center font-mono text-xs text-neutral-400 space-y-1.5 hidden md:block">
            <p className="text-emerald-400 font-bold">KEYBOARD &amp; GAMEPAD COMMANDS</p>
            <p>Pijltjestoetsen of WASD = Lopen, Klimmen &amp; Aan Ropes Hangelen</p>
            <p className="text-neutral-300">
              <span className="px-1.5 py-0.5 rounded bg-neutral-800 border border-neutral-700 text-amber-300 font-bold mr-1">Z</span> 
              Graaf Links &bull; 
              <span className="px-1.5 py-0.5 rounded bg-neutral-800 border border-neutral-700 text-amber-300 font-bold mx-1">C</span> 
              Graaf Rechts
            </p>
            <p className="text-[11px] text-neutral-500">
              Gamepad: D-Pad / Stick om te lopen &bull; X / L1 = Graaf Links &bull; B / R1 = Graaf Rechts
            </p>
          </div>

          {/* Virtual Digging Action Buttons */}
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-mono text-neutral-400 mb-1">GRAAF LASER</span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onTouchStart={() => { keysRef.current.digL = true; haptics.powerPellet(); }}
                onTouchEnd={() => { keysRef.current.digL = false; }}
                onMouseDown={() => { keysRef.current.digL = true; }}
                onMouseUp={() => { keysRef.current.digL = false; }}
                className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 active:scale-95 text-black font-mono font-black text-xs flex flex-col items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.4)] cursor-pointer select-none"
              >
                <Pickaxe className="w-5 h-5 mb-1" />
                <span>GRAAF L</span>
                <span className="text-[9px] opacity-75">(Z / U)</span>
              </button>

              <button
                type="button"
                onTouchStart={() => { keysRef.current.digR = true; haptics.powerPellet(); }}
                onTouchEnd={() => { keysRef.current.digR = false; }}
                onMouseDown={() => { keysRef.current.digR = true; }}
                onMouseUp={() => { keysRef.current.digR = false; }}
                className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 active:scale-95 text-black font-mono font-black text-xs flex flex-col items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.4)] cursor-pointer select-none"
              >
                <Pickaxe className="w-5 h-5 mb-1" />
                <span>GRAAF R</span>
                <span className="text-[9px] opacity-75">(C / X)</span>
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* 4. FOOTER NOTE */}
      <footer className="text-center font-mono text-[11px] text-neutral-500 mt-2">
        Lode Runner &copy; 1983 Doug Smith / Brøderbund &bull; Apple II Hi-Res Clean-Room TypeScript Reimplementation
      </footer>

      {/* 5. HISTORICAL DOSSIER MODAL */}
      <LodeRunnerHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        onPlay={() => {
          setIsHistoryOpen(false);
          engineRef.current?.restartGame();
        }}
      />
    </div>
  );
};
