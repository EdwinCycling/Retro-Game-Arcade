/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Night Driver (Bill Budge / Apple II, 1980 / 1983)
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
  Gauge, 
  Sliders, 
  Award, 
  Disc,
  Play,
  Pause,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import { NightDriverEngine, MonitorMode, TrackDifficulty } from '../game/nightDriverEngine';
import { NightDriverRenderer } from '../game/nightDriverRenderer';
import { nightDriverAudio } from '../game/nightDriverAudio';
import { NightDriverHistoryModal } from './NightDriverHistoryModal';
import { gamepadManager } from '../utils/gamepadManager';
import { haptics } from '../utils/haptics';

interface NightDriverCabinetProps {
  onBackToLobby: () => void;
}

export const NightDriverCabinet: React.FC<NightDriverCabinetProps> = ({ onBackToLobby }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<NightDriverEngine | null>(null);
  const rendererRef = useRef<NightDriverRenderer | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // UI state
  const [speed, setSpeed] = useState(0);
  const [gear, setGear] = useState(1);
  const [rpm, setRpm] = useState(1000);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(90);
  const [distance, setDistance] = useState(0);
  const [crashes, setCrashes] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isCrashed, setIsCrashed] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [monitorMode, setMonitorMode] = useState<MonitorMode>('green');
  const [track, setTrack] = useState<TrackDifficulty>('novice');
  const [isAutomatic, setIsAutomatic] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [diskDriveBusy, setDiskDriveBusy] = useState(true);
  const [lang] = useState<'nl' | 'en'>(() => {
    try {
      return (localStorage.getItem('arcade_vault_lang_v2') as 'nl' | 'en') || 'nl';
    } catch {
      return 'nl';
    }
  });

  // Initialize Game Engine & Loop
  useEffect(() => {
    if (!canvasRef.current) return;

    const engine = new NightDriverEngine(track);
    engine.setMonitorMode(monitorMode);
    engine.setAutomatic(isAutomatic);
    engineRef.current = engine;

    const renderer = new NightDriverRenderer(canvasRef.current);
    rendererRef.current = renderer;

    setHighScore(engine.highScore);
    nightDriverAudio.startEngine();

    // Disk II activity light simulation on boot
    const diskTimeout = setTimeout(() => {
      setDiskDriveBusy(false);
    }, 1800);

    let lastTime = performance.now();

    const gameLoop = (currentTime: number) => {
      const dt = Math.min(0.1, (currentTime - lastTime) / 1000);
      lastTime = currentTime;

      if (engineRef.current && rendererRef.current) {
        engineRef.current.update(dt);
        rendererRef.current.render(engineRef.current);

        // Update UI states throttled
        setSpeed(Math.round(engineRef.current.speed));
        setGear(engineRef.current.gear);
        setRpm(Math.round(engineRef.current.rpm));
        setScore(engineRef.current.score);
        setTimeLeft(Math.ceil(engineRef.current.timeLeft));
        setDistance(parseFloat(engineRef.current.distanceTraveled.toFixed(1)));
        setCrashes(engineRef.current.crashes);
        setIsGameOver(engineRef.current.isGameOver);
        setIsCrashed(engineRef.current.isCrashed);
        setHighScore(engineRef.current.highScore);
      }

      animationFrameRef.current = requestAnimationFrame(gameLoop);
    };

    animationFrameRef.current = requestAnimationFrame(gameLoop);

    return () => {
      clearTimeout(diskTimeout);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      nightDriverAudio.stopEngine();
    };
  }, []);

  // Sync monitor mode changes
  const handleToggleMonitor = () => {
    const nextMode: MonitorMode = monitorMode === 'green' ? 'color' : 'green';
    setMonitorMode(nextMode);
    if (engineRef.current) {
      engineRef.current.setMonitorMode(nextMode);
    }
  };

  // Sync track difficulty
  const handleChangeTrack = (t: TrackDifficulty) => {
    setTrack(t);
    if (engineRef.current) {
      engineRef.current.setDifficulty(t);
      setHighScore(engineRef.current.highScore);
    }
  };

  // Sync automatic transmission
  const handleToggleTransmission = () => {
    const nextAuto = !isAutomatic;
    setIsAutomatic(nextAuto);
    if (engineRef.current) {
      engineRef.current.setAutomatic(nextAuto);
    }
  };

  // Audio mute toggle
  const handleToggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    nightDriverAudio.setMuted(nextMuted);
  };

  // Game reset
  const handleResetGame = () => {
    if (engineRef.current) {
      engineRef.current.resetGame();
      setIsGameOver(false);
      setIsCrashed(false);
      setDiskDriveBusy(true);
      setTimeout(() => setDiskDriveBusy(false), 800);
    }
  };

  // Keyboard Event Handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!engineRef.current) return;
      const eng = engineRef.current;

      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W' || e.key === ' ') {
        eng.inputGas = true;
      }
      if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        eng.inputBrake = true;
      }
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        eng.inputLeft = true;
      }
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        eng.inputRight = true;
      }

      // Gears 1 to 4
      if (e.key === '1') eng.setGear(1);
      if (e.key === '2') eng.setGear(2);
      if (e.key === '3') eng.setGear(3);
      if (e.key === '4') eng.setGear(4);

      if (e.key === 'Shift') {
        eng.shiftUp();
      }
      if (e.key === 'Control') {
        eng.shiftDown();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (!engineRef.current) return;
      const eng = engineRef.current;

      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W' || e.key === ' ') {
        eng.inputGas = false;
      }
      if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        eng.inputBrake = false;
      }
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        eng.inputLeft = false;
      }
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        eng.inputRight = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Gamepad listener subscription
  useEffect(() => {
    return gamepadManager.subscribe((state) => {
      if (!engineRef.current) return;
      const eng = engineRef.current;

      // Analog stick or D-pad steering
      if (state.axes[0] && Math.abs(state.axes[0]) > 0.15) {
        eng.analogSteer = state.axes[0];
      } else if (state.buttons[14]) { // D-pad Left
        eng.analogSteer = -1.0;
      } else if (state.buttons[15]) { // D-pad Right
        eng.analogSteer = 1.0;
      } else {
        eng.analogSteer = 0;
      }

      // Gas: RT / R2 (button 7) or Button A (button 0)
      eng.inputGas = !!(state.buttons[0] || state.buttons[7]);

      // Brake: LT / L2 (button 6) or Button B (button 1)
      eng.inputBrake = !!(state.buttons[1] || state.buttons[6]);

      // Shifting: X (button 2) to shift down, Y (button 3) to shift up
      if (state.buttons[2]) eng.shiftDown();
      if (state.buttons[3]) eng.shiftUp();
    });
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-stone-950 p-2 sm:p-4 text-stone-100 select-none">
      
      {/* Top Navigation & Title Bar */}
      <header className="w-full max-w-4xl flex items-center justify-between mb-3 px-2">
        <button
          onClick={onBackToLobby}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white border border-stone-600 transition-colors text-sm font-semibold shadow-md"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Arcade Lobby</span>
        </button>

        <div className="flex items-center gap-2 text-center">
          <span className="text-xl">🏎️</span>
          <div>
            <h1 className="text-lg sm:text-xl font-bold tracking-wider text-amber-300 font-mono">
              APPLE ][ • NIGHT DRIVER
            </h1>
            <p className="text-[11px] text-stone-400 font-mono">
              Bill Budge (1980 / 1983) • Hi-Res 3D Road Engine
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsHistoryOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600/80 hover:bg-amber-500 text-stone-950 font-bold text-xs shadow-md transition-colors"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Dossier</span>
          </button>
          <button
            onClick={handleToggleMute}
            className="p-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white border border-stone-600 transition-colors"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Main Vintage Apple II Cabinet Shell */}
      <div className="w-full max-w-4xl bg-stone-200 border-4 border-stone-400 rounded-3xl p-3 sm:p-6 shadow-2xl relative text-stone-800 flex flex-col items-center">
        
        {/* Apple II Texture Header & Monitor Brand Bezel */}
        <div className="w-full flex items-center justify-between mb-3 px-3">
          {/* Apple Rainbow Logo Badge */}
          <div className="flex items-center gap-2 bg-stone-300/80 px-3 py-1 rounded-md border border-stone-400 shadow-inner">
            <div className="flex flex-col gap-0.5">
              <span className="w-3 h-1 bg-green-500 rounded-xs"></span>
              <span className="w-3 h-1 bg-yellow-400 rounded-xs"></span>
              <span className="w-3 h-1 bg-orange-500 rounded-xs"></span>
              <span className="w-3 h-1 bg-red-500 rounded-xs"></span>
              <span className="w-3 h-1 bg-purple-600 rounded-xs"></span>
              <span className="w-3 h-1 bg-blue-500 rounded-xs"></span>
            </div>
            <span className="font-bold tracking-tight text-xs text-stone-700 font-mono">
              apple ][e
            </span>
          </div>

          {/* CRT Monitor Controls Bar */}
          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={handleToggleMonitor}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md border font-mono font-bold transition-all shadow-sm ${
                monitorMode === 'green'
                  ? 'bg-emerald-950 text-emerald-400 border-emerald-600 ring-1 ring-emerald-500'
                  : 'bg-stone-800 text-amber-300 border-amber-600 ring-1 ring-amber-500'
              }`}
            >
              <Tv className="w-3.5 h-3.5" />
              <span>{monitorMode === 'green' ? '🟢 Monitor II (P31)' : '🌈 Hi-Res Color'}</span>
            </button>

            {/* Track Selector */}
            <div className="hidden sm:flex items-center gap-1 bg-stone-300 p-1 rounded-md border border-stone-400 font-mono text-[11px]">
              {(['novice', 'pro', 'expert'] as TrackDifficulty[]).map((t) => (
                <button
                  key={t}
                  onClick={() => handleChangeTrack(t)}
                  className={`px-2 py-0.5 rounded font-bold uppercase transition-colors ${
                    track === t ? 'bg-stone-800 text-amber-400 shadow-xs' : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            {/* Disk II Activity Indicator */}
            <div className="flex items-center gap-1.5 bg-stone-800 text-stone-200 px-2.5 py-1 rounded border border-stone-700 font-mono text-[10px]">
              <Disc className={`w-3 h-3 ${diskDriveBusy ? 'animate-spin text-amber-400' : 'text-stone-500'}`} />
              <span>DISK ][</span>
              <span className={`w-2 h-2 rounded-full ${diskDriveBusy ? 'bg-red-500 animate-pulse shadow-red-500/50 shadow-sm' : 'bg-red-950'}`}></span>
            </div>
          </div>
        </div>

        {/* CRT Bezel Frame */}
        <div className="relative w-full max-w-2xl bg-black rounded-2xl p-2 sm:p-3 border-8 border-stone-800 shadow-2xl">
          
          {/* Glass Reflection effect */}
          <div className="absolute inset-2 pointer-events-none rounded-xl bg-gradient-to-tr from-transparent via-white/5 to-white/10 z-10" />

          {/* Canvas Viewport */}
          <canvas
            ref={canvasRef}
            width={560}
            height={384}
            className="w-full h-auto rounded-lg shadow-inner block aspect-[280/192] bg-black"
          />

          {/* Crash Overlay Indicator */}
          {isCrashed && (
            <div className="absolute inset-0 flex items-center justify-center bg-red-950/40 backdrop-blur-xs rounded-xl z-20 animate-pulse pointer-events-none">
              <div className="bg-red-900/90 border-2 border-red-500 px-6 py-2 rounded-xl text-center shadow-xl">
                <span className="text-xl sm:text-2xl font-black text-white font-mono tracking-widest">
                  💥 CRASH! 💥
                </span>
                <p className="text-xs text-red-200 font-mono mt-0.5">
                  {lang === 'nl' ? '-3 SECONDEN STRAFTIJD' : '-3 SECONDS TIME PENALTY'}
                </p>
              </div>
            </div>
          )}

          {/* Game Over Screen Overlay */}
          {isGameOver && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/85 backdrop-blur-sm rounded-xl z-30 p-4 text-center">
              <h2 className="text-2xl sm:text-3xl font-black text-amber-400 font-mono tracking-wider mb-2">
                {lang === 'nl' ? 'RACE VOLBRACHT!' : 'RACE COMPLETE!'}
              </h2>
              <div className="bg-stone-900/90 border border-stone-700 p-4 rounded-xl max-w-xs w-full mb-4 space-y-2 font-mono text-sm">
                <div className="flex justify-between text-stone-300">
                  <span>{lang === 'nl' ? 'Eindscore:' : 'Final Score:'}</span>
                  <span className="font-bold text-white text-base">{score}</span>
                </div>
                <div className="flex justify-between text-stone-300">
                  <span>{lang === 'nl' ? 'Afgelegd:' : 'Distance:'}</span>
                  <span className="font-bold text-amber-300">{distance} {lang === 'nl' ? 'Mijl' : 'Miles'}</span>
                </div>
                <div className="flex justify-between text-stone-300">
                  <span>Crashes:</span>
                  <span className="font-bold text-red-400">{crashes}</span>
                </div>
                <div className="flex justify-between text-stone-300 border-t border-stone-700 pt-1">
                  <span>{lang === 'nl' ? 'Baanrecord:' : 'Track Record:'}</span>
                  <span className="font-bold text-emerald-400">{highScore}</span>
                </div>
              </div>
              <button
                onClick={handleResetGame}
                className="flex items-center gap-2 px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-xl text-sm shadow-lg transition-transform active:scale-95 font-mono"
              >
                <RotateCcw className="w-4 h-4" />
                <span>{lang === 'nl' ? 'OPNIEUW STARTEN' : 'PLAY AGAIN'}</span>
              </button>
            </div>
          )}
        </div>

        {/* Dashboard Instruments & Telemetry (High Resolution HTML HUD) */}
        <div className="w-full max-w-2xl mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2 text-stone-900 font-mono">
          
          {/* Speedometer */}
          <div className="bg-stone-300/90 border border-stone-400 rounded-xl p-2.5 flex flex-col items-center justify-center shadow-inner">
            <span className="text-[10px] uppercase font-bold text-stone-500 tracking-wider">
              Snelheid
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl sm:text-3xl font-black tracking-tight text-stone-900">
                {speed}
              </span>
              <span className="text-xs font-bold text-stone-600">MPH</span>
            </div>
          </div>

          {/* Gear & RPM */}
          <div className="bg-stone-300/90 border border-stone-400 rounded-xl p-2.5 flex flex-col items-center justify-center shadow-inner">
            <div className="flex items-center justify-between w-full px-1 text-[10px] uppercase font-bold text-stone-500">
              <span>Versnelling</span>
              <button 
                onClick={handleToggleTransmission}
                className="text-[9px] px-1 bg-stone-400/80 rounded hover:bg-stone-500 text-stone-800 transition-colors"
              >
                {isAutomatic ? 'AUT' : 'MAN'}
              </button>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black tracking-tight text-amber-600">
                {isAutomatic ? 'D' : gear}
              </span>
              <span className="text-xs text-stone-600 font-semibold">{rpm} RPM</span>
            </div>
          </div>

          {/* Time Remaining */}
          <div className="bg-stone-300/90 border border-stone-400 rounded-xl p-2.5 flex flex-col items-center justify-center shadow-inner">
            <span className="text-[10px] uppercase font-bold text-stone-500 tracking-wider">
              Tijd
            </span>
            <div className="flex items-baseline gap-1">
              <span className={`text-2xl sm:text-3xl font-black tracking-tight ${timeLeft < 15 ? 'text-red-600 animate-pulse' : 'text-stone-900'}`}>
                {timeLeft}
              </span>
              <span className="text-xs font-bold text-stone-600">SEC</span>
            </div>
          </div>

          {/* Score & Distance */}
          <div className="bg-stone-300/90 border border-stone-400 rounded-xl p-2.5 flex flex-col items-center justify-center shadow-inner">
            <span className="text-[10px] uppercase font-bold text-stone-500 tracking-wider">
              Score
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-xl sm:text-2xl font-black tracking-tight text-emerald-700">
                {score}
              </span>
              <span className="text-[10px] text-stone-500 font-semibold">({distance}m)</span>
            </div>
          </div>
        </div>

        {/* Touch / Virtual Controls for Mobile & Quick Desktop Play */}
        <div className="w-full max-w-2xl mt-4 p-3 bg-stone-300/60 border border-stone-400 rounded-2xl flex flex-wrap items-center justify-between gap-3">
          
          {/* Steering Buttons */}
          <div className="flex items-center gap-2">
            <button
              onMouseDown={() => { if (engineRef.current) engineRef.current.inputLeft = true; }}
              onMouseUp={() => { if (engineRef.current) engineRef.current.inputLeft = false; }}
              onTouchStart={() => { if (engineRef.current) { engineRef.current.inputLeft = true; haptics.light(); } }}
              onTouchEnd={() => { if (engineRef.current) engineRef.current.inputLeft = false; }}
              className="w-14 h-12 bg-stone-800 active:bg-amber-600 text-white rounded-xl font-bold flex items-center justify-center shadow-md active:translate-y-0.5 transition-all text-sm font-mono"
            >
              ◀ LINKS
            </button>
            <button
              onMouseDown={() => { if (engineRef.current) engineRef.current.inputRight = true; }}
              onMouseUp={() => { if (engineRef.current) engineRef.current.inputRight = false; }}
              onTouchStart={() => { if (engineRef.current) { engineRef.current.inputRight = true; haptics.light(); } }}
              onTouchEnd={() => { if (engineRef.current) engineRef.current.inputRight = false; }}
              className="w-14 h-12 bg-stone-800 active:bg-amber-600 text-white rounded-xl font-bold flex items-center justify-center shadow-md active:translate-y-0.5 transition-all text-sm font-mono"
            >
              RECHTS ▶
            </button>
          </div>

          {/* Shifter Buttons (1 to 4) */}
          <div className="flex items-center gap-1 bg-stone-400/60 p-1.5 rounded-xl border border-stone-400">
            <span className="text-[10px] font-bold text-stone-700 px-1 font-mono">VERSNELLING:</span>
            {[1, 2, 3, 4].map((g) => (
              <button
                key={g}
                onClick={() => {
                  if (engineRef.current) {
                    engineRef.current.setGear(g);
                    haptics.light();
                  }
                }}
                className={`w-8 h-8 rounded-lg font-bold font-mono text-xs transition-all shadow-xs ${
                  gear === g
                    ? 'bg-amber-500 text-stone-950 font-black shadow-md scale-105'
                    : 'bg-stone-700 text-stone-200 hover:bg-stone-600'
                }`}
              >
                {g}
              </button>
            ))}
          </div>

          {/* Gas & Brake Pedals */}
          <div className="flex items-center gap-2">
            <button
              onMouseDown={() => { if (engineRef.current) engineRef.current.inputBrake = true; }}
              onMouseUp={() => { if (engineRef.current) engineRef.current.inputBrake = false; }}
              onTouchStart={() => { if (engineRef.current) { engineRef.current.inputBrake = true; haptics.light(); } }}
              onTouchEnd={() => { if (engineRef.current) engineRef.current.inputBrake = false; }}
              className="w-14 h-12 bg-red-700 active:bg-red-600 text-white rounded-xl font-bold flex items-center justify-center shadow-md active:translate-y-0.5 transition-all text-xs font-mono"
            >
              REM
            </button>
            <button
              onMouseDown={() => { if (engineRef.current) engineRef.current.inputGas = true; }}
              onMouseUp={() => { if (engineRef.current) engineRef.current.inputGas = false; }}
              onTouchStart={() => { if (engineRef.current) { engineRef.current.inputGas = true; haptics.light(); } }}
              onTouchEnd={() => { if (engineRef.current) engineRef.current.inputGas = false; }}
              className="w-16 h-12 bg-emerald-600 active:bg-emerald-500 text-white rounded-xl font-black flex items-center justify-center shadow-md active:translate-y-0.5 transition-all text-xs font-mono"
            >
              GAS ▲
            </button>
          </div>
        </div>

        {/* Apple II Keyboard Guide Footer */}
        <div className="w-full max-w-2xl mt-3 flex items-center justify-between text-[11px] text-stone-600 font-mono px-2">
          <span>{lang === 'nl' ? 'Besturing: ◀ ▶ of A/D (Sturen) • ▲ of W (Gas) • ▼ of S (Rem) • 1-4 of Shift (Schakelen)' : 'Controls: ◀ ▶ or A/D (Steer) • ▲ or W (Gas) • ▼ or S (Brake) • 1-4 or Shift (Gears)'}</span>
          <button
            onClick={handleResetGame}
            className="flex items-center gap-1 hover:text-stone-900 font-bold underline"
          >
            <RotateCcw className="w-3 h-3" />
            <span>{lang === 'nl' ? 'Herstart' : 'Restart'}</span>
          </button>
        </div>

      </div>

      {/* History Dossier Modal */}
      <NightDriverHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        lang={lang}
      />
    </div>
  );
};
