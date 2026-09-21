/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Sega OutRun (1986) - Arcade Cabinet Component
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Volume2,
  VolumeX,
  Radio,
  ArrowLeft,
  RotateCcw,
  BookOpen,
  Trophy,
  Gauge,
  Disc3,
  ChevronLeft,
  ChevronRight,
  Gamepad2
} from 'lucide-react';
import { OutrunEngine } from '../game/outrunEngine';
import { OutrunRenderer } from '../game/outrunRenderer';
import { outrunAudio } from '../game/outrunAudio';
import { getOutrunScores, saveOutrunScore } from '../game/outrunHighScores';
import { OutrunTrack, Gear } from '../game/outrunTypes';
import { haptics } from '../utils/haptics';
import { gamepadManager } from '../utils/gamepadManager';
import { GameControlsModal } from './GameControlsModal';

interface OutrunCabinetProps {
  onBackToLobby: () => void;
  onOpenDossier?: () => void;
}

export const OutrunCabinet: React.FC<OutrunCabinetProps> = ({
  onBackToLobby,
  onOpenDossier
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<OutrunEngine | null>(null);
  const rendererRef = useRef<OutrunRenderer | null>(null);
  const animIdRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(performance.now());
  const activeKeysRef = useRef<Set<string>>(new Set());
  const gearBtnPressedRef = useRef<boolean>(false);
  const radioBtnPressedRef = useRef<boolean>(false);

  // React UI state
  const [score, setScore] = useState(0);
  const [speed, setSpeed] = useState(0);
  const [gear, setGear] = useState<Gear>('LOW');
  const [timeRemaining, setTimeRemaining] = useState(75);
  const [stage, setStage] = useState(1);
  const [stageName, setStageName] = useState('COCONUT BEACH');
  const [gameState, setGameState] = useState<'TITLE' | 'RACING' | 'STAGE_CLEAR' | 'GAMEOVER'>('TITLE');
  const [currentTrack, setCurrentTrack] = useState<OutrunTrack>('magical_sound_shower');
  const [isMuted, setIsMuted] = useState(false);
  const [steerAngle, setSteerAngle] = useState(0);
  const [highScores, setHighScores] = useState(() => getOutrunScores());
  const [showScoresModal, setShowScoresModal] = useState(false);
  const [showControlsModal, setShowControlsModal] = useState(false);
  const [initialsInput, setInitialsInput] = useState('');
  const [hasSavedScore, setHasSavedScore] = useState(false);

  // Initialize engine, renderer and controller polling
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set fixed virtual arcade resolution
    canvas.width = 640;
    canvas.height = 440;

    const engine = new OutrunEngine();
    const renderer = new OutrunRenderer(canvas);

    engineRef.current = engine;
    rendererRef.current = renderer;

    const loop = (now: number) => {
      const dt = Math.min(0.06, (now - lastTimeRef.current) / 1000);
      lastTimeRef.current = now;

      // Poll Xbox / PC Gamepad input directly
      const gp = gamepadManager.getSnapshot();
      if (gp.connected) {
        // Accelerate: RT (Right Trigger) or A button
        if (gp.rt > 0.1 || gp.buttons.has('A') || gp.buttons.has('RT')) {
          engine.isAccelerating = true;
          if (engine.gameState === 'TITLE' || engine.gameState === 'GAMEOVER' || engine.gameState === 'STAGE_CLEAR') {
            engine.startNewGame();
            setHasSavedScore(false);
          }
        } else if (!activeKeysRef.current.has('ArrowUp') && !activeKeysRef.current.has('w')) {
          engine.isAccelerating = false;
        }

        // Brake: LT (Left Trigger) or X button
        if (gp.lt > 0.1 || gp.buttons.has('X') || gp.buttons.has('LT')) {
          engine.isBraking = true;
        } else if (!activeKeysRef.current.has('ArrowDown') && !activeKeysRef.current.has('s')) {
          engine.isBraking = false;
        }

        // Steer: Left Stick X or D-Pad Left/Right
        if (Math.abs(gp.leftStick.x) > 0.15) {
          engine.steerDirection = Math.max(-1, Math.min(1, gp.leftStick.x * 1.35));
        } else if (gp.buttons.has('DpadLeft')) {
          engine.steerDirection = -1;
        } else if (gp.buttons.has('DpadRight')) {
          engine.steerDirection = 1;
        } else if (!activeKeysRef.current.has('ArrowLeft') && !activeKeysRef.current.has('a') && !activeKeysRef.current.has('ArrowRight') && !activeKeysRef.current.has('d')) {
          engine.steerDirection = 0;
        }

        // Gear toggle: Y button or Bumpers (debounced)
        if (gp.buttons.has('Y') || gp.buttons.has('LB') || gp.buttons.has('RB')) {
          if (!gearBtnPressedRef.current) {
            gearBtnPressedRef.current = true;
            engine.toggleGear();
            haptics.selection();
          }
        } else {
          gearBtnPressedRef.current = false;
        }

        // Radio toggle: B button or View (debounced)
        if (gp.buttons.has('B') || gp.buttons.has('View')) {
          if (!radioBtnPressedRef.current) {
            radioBtnPressedRef.current = true;
            handleCycleRadio();
          }
        } else {
          radioBtnPressedRef.current = false;
        }
      }

      engine.update(dt);
      renderer.render(engine);

      // Sync React state
      setScore(engine.score);
      setSpeed(Math.floor(engine.player.speed));
      setGear(engine.player.gear);
      setTimeRemaining(Math.ceil(engine.timeRemaining));
      setStage(engine.stage);
      setStageName(engine.stageName);
      setGameState(engine.gameState);
      setSteerAngle(engine.player.steerAngle * 45); // Degrees for wheel

      animIdRef.current = requestAnimationFrame(loop);
    };

    animIdRef.current = requestAnimationFrame(loop);

    return () => {
      if (animIdRef.current) cancelAnimationFrame(animIdRef.current);
      outrunAudio.stopMusic();
      outrunAudio.stopEngine();
    };
  }, []);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const engine = engineRef.current;
      if (!engine) return;

      const key = e.key.toLowerCase();
      activeKeysRef.current.add(key);
      activeKeysRef.current.add(e.key);

      if (e.key === 'ArrowUp' || key === 'w') {
        engine.isAccelerating = true;
        if (engine.gameState === 'TITLE' || engine.gameState === 'GAMEOVER' || engine.gameState === 'STAGE_CLEAR') {
          engine.startNewGame();
          setHasSavedScore(false);
        }
      } else if (e.key === 'ArrowDown' || key === 's') {
        engine.isBraking = true;
      } else if (e.key === 'ArrowLeft' || key === 'a') {
        engine.steerDirection = -1;
      } else if (e.key === 'ArrowRight' || key === 'd') {
        engine.steerDirection = 1;
      } else if (e.key === ' ' || key === 'g') {
        e.preventDefault();
        engine.toggleGear();
        haptics.selection();
      } else if (key === 'r') {
        handleCycleRadio();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const engine = engineRef.current;
      if (!engine) return;

      const key = e.key.toLowerCase();
      activeKeysRef.current.delete(key);
      activeKeysRef.current.delete(e.key);

      if (e.key === 'ArrowUp' || key === 'w') {
        engine.isAccelerating = false;
      } else if (e.key === 'ArrowDown' || key === 's') {
        engine.isBraking = false;
      } else if (e.key === 'ArrowLeft' || key === 'a') {
        if (engine.steerDirection === -1) engine.steerDirection = 0;
      } else if (e.key === 'ArrowRight' || key === 'd') {
        if (engine.steerDirection === 1) engine.steerDirection = 0;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Radio channel switcher
  const handleSelectTrack = (track: OutrunTrack) => {
    setCurrentTrack(track);
    outrunAudio.setTrack(track);
    haptics.light();
  };

  const handleCycleRadio = () => {
    const tracks: OutrunTrack[] = ['magical_sound_shower', 'passing_breeze', 'splash_wave', 'off'];
    const nextIdx = (tracks.indexOf(currentTrack) + 1) % tracks.length;
    handleSelectTrack(tracks[nextIdx]);
  };

  // Start game action
  const handleStartGame = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.startNewGame();
      setHasSavedScore(false);
      haptics.heavy();
    }
  }, []);

  // Toggle Mute
  const handleToggleMute = useCallback(() => {
    const next = !isMuted;
    setIsMuted(next);
    outrunAudio.setMuted(next);
    haptics.selection();
  }, [isMuted]);

  // Submit high score
  const handleSaveScore = (e: React.FormEvent) => {
    e.preventDefault();
    if (!initialsInput || hasSavedScore) return;
    const updated = saveOutrunScore(score, initialsInput, stage);
    setHighScores(updated);
    setHasSavedScore(true);
    haptics.success();
  };

  return (
    <div className="relative flex flex-col items-center justify-start min-h-screen bg-neutral-950 text-white select-none px-2 py-3 overflow-x-hidden">
      {/* Top Arcade Navigation Bar */}
      <div className="w-full max-w-4xl flex items-center justify-between gap-2 px-3 py-2 bg-neutral-900/90 border border-red-800/60 rounded-xl shadow-lg mb-2">
        <button
          onClick={onBackToLobby}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 hover:text-white rounded-lg border border-neutral-700 transition text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>ARCADE LOBBY</span>
        </button>

        {/* Marquee Badge */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-gradient-to-r from-red-600 via-amber-500 to-red-600 px-3 py-1 rounded-md text-white font-black text-xs sm:text-sm tracking-widest shadow-[0_0_12px_rgba(239,68,68,0.5)]">
            <span>🏁 SEGA OutRun 1986</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {onOpenDossier && (
            <button
              onClick={onOpenDossier}
              className="p-1.5 bg-neutral-800 hover:bg-amber-600/30 text-amber-300 rounded-lg border border-amber-500/40 transition text-xs flex items-center gap-1"
              title="Dossier & History"
            >
              <BookOpen className="w-4 h-4" />
              <span className="hidden sm:inline">HISTORY</span>
            </button>
          )}

          <button
            onClick={() => setShowControlsModal(true)}
            className="p-1.5 bg-emerald-950/70 hover:bg-emerald-900/90 text-emerald-400 rounded-lg border border-emerald-500/50 transition text-xs flex items-center gap-1 shadow-[0_0_10px_rgba(16,185,129,0.3)]"
            title="Xbox Controller Diagram & Besturing"
          >
            <Gamepad2 className="w-4 h-4" />
            <span className="hidden sm:inline font-bold">CONTROLLER</span>
          </button>

          <button
            onClick={() => setShowScoresModal(true)}
            className="p-1.5 bg-neutral-800 hover:bg-yellow-600/30 text-yellow-400 rounded-lg border border-yellow-500/40 transition text-xs flex items-center gap-1"
            title="High Scores"
          >
            <Trophy className="w-4 h-4" />
            <span className="hidden sm:inline">RANKS</span>
          </button>

          <button
            onClick={handleToggleMute}
            className={`p-1.5 rounded-lg border transition ${
              isMuted
                ? 'bg-red-950/60 border-red-500/60 text-red-400'
                : 'bg-neutral-800 hover:bg-neutral-700 border-neutral-700 text-neutral-200'
            }`}
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Arcade Cabinet Frame */}
      <div className="relative w-full max-w-4xl bg-gradient-to-b from-neutral-900 via-neutral-950 to-neutral-900 border-2 border-red-700/80 rounded-2xl p-2 sm:p-4 shadow-[0_0_40px_rgba(220,38,38,0.35)] flex flex-col items-center">
        {/* Arcade Marquee Header */}
        <div className="w-full flex items-center justify-between px-3 py-1.5 bg-gradient-to-r from-red-950 via-red-700 to-red-950 rounded-lg border border-red-500/80 mb-2 shadow-inner">
          <div className="flex items-center gap-2">
            <span className="text-xl">🌴</span>
            <span className="font-extrabold text-sm sm:text-base tracking-wider text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
              SEGA OutRun DELUXE
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs font-mono">
            <span className="text-yellow-300 font-bold">1 CREDIT = FREE PLAY</span>
            <span className="text-neutral-300">STAGE {stage}: {stageName}</span>
          </div>
        </div>

        {/* CRT Screen Frame */}
        <div className="relative w-full aspect-[640/440] max-w-[640px] bg-black rounded-xl overflow-hidden border-4 border-neutral-800 shadow-[inset_0_0_24px_rgba(0,0,0,0.9)] flex items-center justify-center">
          <canvas
            ref={canvasRef}
            className="w-full h-full object-contain cursor-pointer"
            onClick={() => {
              if (gameState === 'TITLE' || gameState === 'GAMEOVER') {
                handleStartGame();
              }
            }}
          />
        </div>

        {/* In-Car FM Radio Station Selector */}
        <div className="w-full max-w-[640px] mt-2 bg-neutral-900/95 border border-amber-600/50 rounded-xl p-2 sm:p-3 shadow-md flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-bold text-amber-300 tracking-wider">SEGA FM RADIO:</span>
          </div>

          <div className="flex items-center gap-1 sm:gap-2 flex-wrap justify-center">
            <button
              onClick={() => handleSelectTrack('magical_sound_shower')}
              className={`px-2.5 py-1 text-xs rounded-lg font-bold border transition ${
                currentTrack === 'magical_sound_shower'
                  ? 'bg-red-600 border-yellow-400 text-white shadow-[0_0_8px_rgba(239,68,68,0.7)]'
                  : 'bg-neutral-800 hover:bg-neutral-700 border-neutral-700 text-neutral-300'
              }`}
            >
              🌴 MAGICAL SOUND
            </button>

            <button
              onClick={() => handleSelectTrack('passing_breeze')}
              className={`px-2.5 py-1 text-xs rounded-lg font-bold border transition ${
                currentTrack === 'passing_breeze'
                  ? 'bg-cyan-600 border-yellow-400 text-white shadow-[0_0_8px_rgba(6,182,212,0.7)]'
                  : 'bg-neutral-800 hover:bg-neutral-700 border-neutral-700 text-neutral-300'
              }`}
            >
              🌊 PASSING BREEZE
            </button>

            <button
              onClick={() => handleSelectTrack('splash_wave')}
              className={`px-2.5 py-1 text-xs rounded-lg font-bold border transition ${
                currentTrack === 'splash_wave'
                  ? 'bg-amber-600 border-yellow-400 text-white shadow-[0_0_8px_rgba(245,158,11,0.7)]'
                  : 'bg-neutral-800 hover:bg-neutral-700 border-neutral-700 text-neutral-300'
              }`}
            >
              ⚡ SPLASH WAVE
            </button>

            <button
              onClick={() => handleSelectTrack('off')}
              className={`px-2 py-1 text-xs rounded-lg border transition ${
                currentTrack === 'off'
                  ? 'bg-neutral-700 border-neutral-500 text-neutral-300'
                  : 'bg-neutral-800/80 hover:bg-neutral-700 border-neutral-700 text-neutral-400'
              }`}
            >
              RADIO OFF
            </button>
          </div>
        </div>

        {/* Dashboard Controls: Steering Wheel, Gear Shift Lever, Pedals & Touch D-pad */}
        <div className="w-full max-w-[640px] mt-2 bg-gradient-to-b from-neutral-900 to-neutral-950 border border-neutral-800 rounded-xl p-3 flex items-center justify-between gap-3">
          {/* Steer Left Button */}
          <button
            onPointerDown={() => {
              if (engineRef.current) engineRef.current.steerDirection = -1;
              haptics.light();
            }}
            onPointerUp={() => {
              if (engineRef.current && engineRef.current.steerDirection === -1) engineRef.current.steerDirection = 0;
            }}
            onPointerLeave={() => {
              if (engineRef.current && engineRef.current.steerDirection === -1) engineRef.current.steerDirection = 0;
            }}
            className="flex-1 max-w-[90px] h-16 bg-neutral-800 hover:bg-neutral-700 active:bg-red-700 border-2 border-neutral-600 active:border-red-400 rounded-xl flex flex-col items-center justify-center transition shadow-md touch-none"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
            <span className="text-[10px] font-mono font-bold text-neutral-300">LEFT [A]</span>
          </button>

          {/* Interactive Ferrari Steering Wheel (Visual tilt feedback) */}
          <div className="relative flex flex-col items-center justify-center">
            <div
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-4 border-neutral-700 bg-neutral-900 shadow-[0_4px_12px_rgba(0,0,0,0.8)] flex items-center justify-center transition-transform duration-75"
              style={{ transform: `rotate(${steerAngle}deg)` }}
            >
              {/* Wheel Spokes */}
              <div className="absolute w-full h-2 bg-neutral-700"></div>
              <div className="absolute w-2 h-1/2 bottom-0 bg-neutral-700"></div>
              {/* Ferrari Center Horn Badge */}
              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-yellow-400 border border-black flex items-center justify-center shadow-inner">
                <span className="text-[10px]">🐎</span>
              </div>
            </div>
            <span className="text-[9px] font-mono text-neutral-400 mt-1">STEERING</span>
          </div>

          {/* Steer Right Button */}
          <button
            onPointerDown={() => {
              if (engineRef.current) engineRef.current.steerDirection = 1;
              haptics.light();
            }}
            onPointerUp={() => {
              if (engineRef.current && engineRef.current.steerDirection === 1) engineRef.current.steerDirection = 0;
            }}
            onPointerLeave={() => {
              if (engineRef.current && engineRef.current.steerDirection === 1) engineRef.current.steerDirection = 0;
            }}
            className="flex-1 max-w-[90px] h-16 bg-neutral-800 hover:bg-neutral-700 active:bg-red-700 border-2 border-neutral-600 active:border-red-400 rounded-xl flex flex-col items-center justify-center transition shadow-md touch-none"
          >
            <ChevronRight className="w-6 h-6 text-white" />
            <span className="text-[10px] font-mono font-bold text-neutral-300">RIGHT [D]</span>
          </button>

          {/* Gear Shifter Toggle Lever */}
          <button
            onClick={() => {
              if (engineRef.current) {
                engineRef.current.toggleGear();
                haptics.selection();
              }
            }}
            className="flex flex-col items-center justify-center px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 border-2 border-amber-500/70 rounded-xl shadow-md transition"
          >
            <div className="text-[10px] font-mono text-amber-400 font-bold mb-0.5">GEAR SHIFT</div>
            <div className="flex items-center gap-1 bg-black/60 px-2 py-1 rounded-md border border-neutral-700">
              <span className={`text-xs font-black px-1.5 py-0.5 rounded ${gear === 'LOW' ? 'bg-amber-500 text-black' : 'text-neutral-500'}`}>LOW</span>
              <span className="text-neutral-600">/</span>
              <span className={`text-xs font-black px-1.5 py-0.5 rounded ${gear === 'HIGH' ? 'bg-green-500 text-black' : 'text-neutral-500'}`}>HIGH</span>
            </div>
            <span className="text-[8px] text-neutral-400 font-mono mt-0.5">[SPACE]</span>
          </button>

          {/* Pedals: Brake & Gas */}
          <div className="flex items-center gap-2">
            {/* Brake Pedal */}
            <button
              onPointerDown={() => {
                if (engineRef.current) engineRef.current.isBraking = true;
                haptics.light();
              }}
              onPointerUp={() => {
                if (engineRef.current) engineRef.current.isBraking = false;
              }}
              onPointerLeave={() => {
                if (engineRef.current) engineRef.current.isBraking = false;
              }}
              className="w-14 sm:w-16 h-16 bg-red-950 hover:bg-red-900 active:bg-red-800 border-2 border-red-600 active:border-red-400 rounded-xl flex flex-col items-center justify-center transition shadow-md touch-none"
            >
              <span className="text-xs font-black text-red-300">BRAKE</span>
              <span className="text-[9px] font-mono text-red-400/80">[S]</span>
            </button>

            {/* Gas / Accel Pedal */}
            <button
              onPointerDown={() => {
                if (engineRef.current) {
                  engineRef.current.isAccelerating = true;
                  if (engineRef.current.gameState === 'TITLE' || engineRef.current.gameState === 'GAMEOVER') {
                    engineRef.current.startNewGame();
                    setHasSavedScore(false);
                  }
                }
                haptics.medium();
              }}
              onPointerUp={() => {
                if (engineRef.current) engineRef.current.isAccelerating = false;
              }}
              onPointerLeave={() => {
                if (engineRef.current) engineRef.current.isAccelerating = false;
              }}
              className="w-16 sm:w-20 h-16 bg-green-950 hover:bg-green-900 active:bg-green-700 border-2 border-green-500 active:border-green-300 rounded-xl flex flex-col items-center justify-center transition shadow-[0_0_12px_rgba(34,197,94,0.3)] touch-none"
            >
              <span className="text-sm font-black text-green-300">GAS</span>
              <span className="text-[9px] font-mono text-green-400/80">[W / ↑]</span>
            </button>
          </div>
        </div>

        {/* Game Over Score Input Prompt */}
        {gameState === 'GAMEOVER' && !hasSavedScore && (
          <form
            onSubmit={handleSaveScore}
            className="w-full max-w-[640px] mt-2 p-3 bg-neutral-900/90 border border-yellow-500/60 rounded-xl flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-400" />
              <span className="text-xs font-bold text-yellow-300">ENTER YOUR INITIALS:</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                maxLength={3}
                value={initialsInput}
                onChange={(e) => setInitialsInput(e.target.value.toUpperCase())}
                placeholder="YU."
                className="w-20 px-2 py-1 bg-black border border-neutral-600 rounded text-center text-sm font-mono font-bold text-yellow-400 uppercase tracking-widest focus:outline-none focus:border-yellow-400"
              />
              <button
                type="submit"
                disabled={!initialsInput}
                className="px-3 py-1 bg-yellow-500 hover:bg-yellow-400 disabled:opacity-50 text-black font-bold text-xs rounded transition"
              >
                SAVE
              </button>
            </div>
          </form>
        )}
      </div>

      {/* High Scores Modal */}
      {showScoresModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-neutral-900 border-2 border-yellow-500/70 rounded-2xl p-5 shadow-2xl flex flex-col items-center">
            <div className="flex items-center gap-2 mb-3">
              <Trophy className="w-6 h-6 text-yellow-400" />
              <h2 className="text-lg font-black text-yellow-400 tracking-wider">SEGA OUTRUN HALL OF FAME</h2>
            </div>

            <div className="w-full divide-y divide-neutral-800 mb-4 font-mono text-xs">
              <div className="flex justify-between py-1.5 font-bold text-neutral-400">
                <span>RANK</span>
                <span>NAME</span>
                <span>STAGE</span>
                <span>SCORE</span>
              </div>
              {highScores.map((entry, idx) => (
                <div key={idx} className="flex justify-between py-1.5 items-center">
                  <span className="text-neutral-500 w-8">{idx + 1}.</span>
                  <span className="text-yellow-300 font-bold w-16">{entry.initials}</span>
                  <span className="text-neutral-300 w-16">STAGE {entry.stageReached}</span>
                  <span className="text-white font-bold">{entry.score.toLocaleString()}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowScoresModal(false)}
              className="px-5 py-2 bg-neutral-800 hover:bg-neutral-700 text-white font-bold rounded-xl border border-neutral-600 transition text-xs"
            >
              CLOSE
            </button>
          </div>
        </div>
      )}

      {/* Xbox Controller Diagram & Controls Modal */}
      <GameControlsModal
        isOpen={showControlsModal}
        onClose={() => setShowControlsModal(false)}
        lang="nl"
        currentGameId="outrun"
      />
    </div>
  );
};
