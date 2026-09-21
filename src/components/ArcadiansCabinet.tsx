/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Arcadians Arcade Cabinet Component (Acornsoft / Nick Pelling 1982 - BBC Micro Model B)
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  Volume2,
  VolumeX,
  Tv,
  RotateCcw,
  Trophy,
  Smartphone,
  BookOpen,
  ArrowLeft as LeftIcon,
  ArrowRight as RightIcon,
  Zap,
  Gauge,
  Layers,
} from 'lucide-react';
import { CANVAS_HEIGHT, CANVAS_WIDTH, ARCADIANS_WAVES } from '../game/arcadiansWaves';
import { ArcadiansEngine } from '../game/arcadiansEngine';
import { ArcadiansRenderer } from '../game/arcadiansRenderer';
import { arcadiansAudio } from '../game/arcadiansAudio';
import { getArcadiansHighScores, saveArcadiansHighScore } from '../game/arcadiansHighScores';
import { ArcadiansHistoryModal } from './ArcadiansHistoryModal';
import { GameControlsModal, useGameControls } from './GameControlsModal';
import { haptics } from '../utils/haptics';

interface ArcadiansCabinetProps {
  onBackToLobby: () => void;
}

export const ArcadiansCabinet: React.FC<ArcadiansCabinetProps> = ({ onBackToLobby }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<ArcadiansEngine | null>(null);
  const rendererRef = useRef<ArcadiansRenderer | null>(null);

  // Synced state
  const [score, setScore] = useState(0);
  const [waveNumber, setWaveNumber] = useState(1);
  const [lives, setLives] = useState(3);
  const [gameState, setGameState] = useState<string>('TITLE');
  const [isMuted, setIsMuted] = useState(false);
  const [enableCRT, setEnableCRT] = useState(true);
  const [speedSetting, setSpeedSetting] = useState<'normal' | 'turbo' | 'hyper'>('normal');
  const [showTouchControls, setShowTouchControls] = useState(() => {
    return (
      typeof window !== 'undefined' &&
      ('ontouchstart' in window || navigator.maxTouchPoints > 0 || window.innerWidth < 1024)
    );
  });
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const { showControls, setShowControls } = useGameControls('arcadians');
  const [showHighScoresModal, setShowHighScoresModal] = useState(false);
  const [highScores, setHighScores] = useState(getArcadiansHighScores());
  const [initials, setInitials] = useState('');
  const [hasSubmittedScore, setHasSubmittedScore] = useState(false);

  // Initialize engine and render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    const engine = new ArcadiansEngine(waveNumber, highScores[0]?.score || 32450);
    const renderer = new ArcadiansRenderer(ctx);

    engineRef.current = engine;
    rendererRef.current = renderer;

    let animationFrameId: number;
    let lastTime = performance.now();

    const loop = (currentTime: number) => {
      const delta = (currentTime - lastTime) / 1000;
      lastTime = currentTime;

      // Fixed 60fps baseline scale
      const dtScale = Math.min(2.0, delta * 60);

      engine.update(dtScale);
      renderer.render(engine, enableCRT);

      // Synchronize states
      setScore(engine.score);
      setWaveNumber(engine.waveNumber);
      setLives(engine.lives);
      setGameState(engine.gameState);

      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [enableCRT]);

  // Update speed multiplier when setting changes
  useEffect(() => {
    if (engineRef.current) {
      if (speedSetting === 'turbo') engineRef.current.speedMultiplier = 1.25;
      else if (speedSetting === 'hyper') engineRef.current.speedMultiplier = 1.5;
      else engineRef.current.speedMultiplier = 1.0;
    }
  }, [speedSetting]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const engine = engineRef.current;
      if (!engine) return;

      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        engine.keys.left = true;
      }
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        engine.keys.right = true;
      }
      if (e.key === ' ' || e.key === 'Enter' || e.key === 'ArrowUp') {
        e.preventDefault();
        engine.keys.fire = true;
        if (engine.gameState === 'TITLE' || engine.gameState === 'GAME_OVER') {
          engine.startGame(waveNumber);
        }
      }
      if (e.key === 'p' || e.key === 'P') {
        if (engine.gameState === 'PLAYING') engine.gameState = 'PAUSED';
        else if (engine.gameState === 'PAUSED') engine.gameState = 'PLAYING';
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const engine = engineRef.current;
      if (!engine) return;

      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        engine.keys.left = false;
      }
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        engine.keys.right = false;
      }
      if (e.key === ' ' || e.key === 'Enter' || e.key === 'ArrowUp') {
        engine.keys.fire = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [waveNumber]);

  const handleToggleMute = () => {
    const nextMuted = arcadiansAudio.toggleMute();
    setIsMuted(nextMuted);
    haptics.light();
  };

  const handleStartOrRestart = () => {
    haptics.medium();
    if (engineRef.current) {
      engineRef.current.startGame(waveNumber);
      setHasSubmittedScore(false);
    }
  };

  const handleSelectWave = (targetWave: number) => {
    haptics.light();
    setWaveNumber(targetWave);
    if (engineRef.current) {
      engineRef.current.jumpToWave(targetWave);
    }
  };

  const handleCycleSpeed = () => {
    haptics.light();
    setSpeedSetting((prev) => {
      if (prev === 'normal') return 'turbo';
      if (prev === 'turbo') return 'hyper';
      return 'normal';
    });
  };

  const handleSubmitScore = (e: React.FormEvent) => {
    e.preventDefault();
    if (!initials.trim() || hasSubmittedScore) return;
    const updated = saveArcadiansHighScore(score, waveNumber, initials);
    setHighScores(updated);
    setHasSubmittedScore(true);
    haptics.success();
  };

  return (
    <div className="relative min-h-screen bg-neutral-950 text-neutral-100 flex flex-col items-center justify-between p-2 sm:p-4 select-none font-sans overflow-x-hidden">
      
      {/* Top Header Bar */}
      <header className="w-full max-w-4xl flex items-center justify-between gap-2 py-2 px-3 rounded-2xl bg-neutral-900/90 border border-cyan-500/30 backdrop-blur-sm z-20 shadow-[0_0_20px_rgba(6,182,212,0.15)]">
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => {
              haptics.light();
              onBackToLobby();
            }}
            className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition cursor-pointer flex items-center gap-1.5 text-xs font-mono"
            title="Terug naar Arcade Lobby"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Lobby</span>
          </button>

          <div className="flex items-center gap-1.5">
            <span className="text-xl">🚀</span>
            <div>
              <h1 className="text-sm sm:text-base font-black font-mono tracking-wider text-cyan-400 leading-tight">
                ARCADIANS
              </h1>
              <p className="text-[10px] text-neutral-400 font-mono hidden sm:block">
                Acornsoft • BBC Micro Model B (1982)
              </p>
            </div>
          </div>
        </div>

        {/* Action controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Speed Toggle */}
          <button
            type="button"
            onClick={handleCycleSpeed}
            className={`px-2.5 py-1.5 rounded-xl border text-xs font-mono font-bold flex items-center gap-1 cursor-pointer transition ${
              speedSetting === 'hyper'
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/60 shadow-[0_0_10px_rgba(244,63,94,0.4)]'
                : speedSetting === 'turbo'
                ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/60 shadow-[0_0_10px_rgba(234,179,8,0.4)]'
                : 'bg-neutral-800 text-cyan-300 border-cyan-500/30'
            }`}
            title="Wissel Speelsnelheid (BBC 60FPS / Turbo / Hyper)"
          >
            <Gauge className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">
              {speedSetting === 'hyper' ? 'HYPER 1.5x' : speedSetting === 'turbo' ? 'TURBO 1.25x' : 'BBC 60FPS'}
            </span>
          </button>

          {/* Level / Wave Selector Stepper */}
          <div className="flex items-center gap-1 bg-neutral-800 px-2 py-1 rounded-xl border border-neutral-700 text-xs font-mono">
            <Layers className="w-3.5 h-3.5 text-yellow-400" />
            <span className="text-neutral-400 text-[11px] hidden sm:inline">WAVE:</span>
            <select
              value={waveNumber}
              onChange={(e) => handleSelectWave(Number(e.target.value))}
              className="bg-transparent text-yellow-300 font-bold font-mono text-xs focus:outline-none cursor-pointer"
            >
              {ARCADIANS_WAVES.map((w) => (
                <option key={w.waveNumber} value={w.waveNumber} className="bg-neutral-900 text-white">
                  Wave {w.waveNumber} ({w.title.split(':')[1]?.trim() || w.title})
                </option>
              ))}
            </select>
          </div>

          {/* CRT Filter */}
          <button
            type="button"
            onClick={() => {
              setEnableCRT(!enableCRT);
              haptics.light();
            }}
            className={`p-2 rounded-xl border transition cursor-pointer ${
              enableCRT
                ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/50'
                : 'bg-neutral-800 text-neutral-400 border-neutral-700'
            }`}
            title="CRT Scanlines aan/uit"
          >
            <Tv className="w-4 h-4" />
          </button>

          {/* Audio */}
          <button
            type="button"
            onClick={handleToggleMute}
            className={`p-2 rounded-xl border transition cursor-pointer ${
              !isMuted
                ? 'bg-neutral-800 text-neutral-200 border-neutral-700'
                : 'bg-rose-950 text-rose-400 border-rose-800'
            }`}
            title="Geluid dempen"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Dossier */}
          <button
            type="button"
            onClick={() => setShowHistoryModal(true)}
            className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-cyan-400 border border-neutral-700 transition cursor-pointer"
            title="Bekijk Dossier"
          >
            <BookOpen className="w-4 h-4" />
          </button>

          {/* High Scores */}
          <button
            type="button"
            onClick={() => setShowHighScoresModal(true)}
            className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-yellow-400 border border-neutral-700 transition cursor-pointer"
            title="Topscores"
          >
            <Trophy className="w-4 h-4" />
          </button>

          {/* Controls & Xbox Controller Modal */}
          <button
            type="button"
            onClick={() => setShowControls(true)}
            className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-yellow-400 border border-neutral-700 hover:border-yellow-400 transition cursor-pointer"
            title="Besturing & Xbox Controller"
          >
            <Zap className="w-4 h-4 text-yellow-400" />
          </button>
        </div>
      </header>

      {/* Main Arcade Bezel & Screen */}
      <main className="relative flex flex-col items-center justify-center my-auto p-2 sm:p-4">
        <div className="relative rounded-3xl p-3 sm:p-4 bg-neutral-900 border-4 border-cyan-500/40 shadow-[0_0_60px_rgba(6,182,212,0.25)] flex flex-col items-center">
          
          {/* Top Marquee */}
          <div className="w-full flex items-center justify-between pb-2 mb-2 border-b border-neutral-800 text-[11px] font-mono">
            <span className="text-cyan-400 font-bold flex items-center gap-1">
              <span>SCORE:</span>
              <span className="text-white text-xs">{score.toString().padStart(6, '0')}</span>
            </span>
            <span className="text-yellow-400 font-bold flex items-center gap-1">
              <span>WAVE:</span>
              <span className="text-white text-xs">{waveNumber}</span>
            </span>
            <span className="text-rose-400 font-bold flex items-center gap-1">
              <span>LEVEN:</span>
              <span>{'🚀 '.repeat(Math.max(0, lives))}</span>
            </span>
          </div>

          {/* The Canvas */}
          <div className="relative overflow-hidden rounded-2xl border-2 border-cyan-500/60 bg-black shadow-inner">
            <canvas
              ref={canvasRef}
              width={CANVAS_WIDTH}
              height={CANVAS_HEIGHT}
              onClick={() => {
                if (gameState === 'TITLE' || gameState === 'GAME_OVER') {
                  handleStartOrRestart();
                }
              }}
              className="w-auto h-auto max-w-[94vw] max-h-[62vh] sm:max-h-[68vh] aspect-[560/680] object-contain block cursor-pointer"
            />
          </div>

          {/* Quick Cabinet Action Buttons */}
          <div className="w-full flex items-center justify-between pt-3 mt-2 border-t border-neutral-800">
            <div className="text-[11px] font-mono text-neutral-400 flex items-center gap-2">
              <span className="hidden sm:inline">BESTURING:</span>
              <span className="px-1.5 py-0.5 rounded bg-neutral-800 text-cyan-300 font-bold border border-neutral-700">
                ← / → of A / D
              </span>
              <span className="px-1.5 py-0.5 rounded bg-neutral-800 text-yellow-300 font-bold border border-neutral-700">
                SPATIE (VUUR)
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleStartOrRestart}
                className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-yellow-400 hover:from-cyan-400 hover:to-yellow-300 text-black font-black font-mono text-xs tracking-wider shadow-[0_0_15px_rgba(6,182,212,0.4)] cursor-pointer active:scale-95 transition"
              >
                {gameState === 'PLAYING' ? 'HERSTART' : 'START SPEL'}
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* On-Screen Mobile Controls */}
      {showTouchControls && (
        <div className="w-full max-w-lg flex items-center justify-between px-4 py-2 mt-2 gap-4 z-20">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onPointerDown={() => {
                haptics.light();
                if (engineRef.current) engineRef.current.keys.left = true;
              }}
              onPointerUp={() => {
                if (engineRef.current) engineRef.current.keys.left = false;
              }}
              onPointerLeave={() => {
                if (engineRef.current) engineRef.current.keys.left = false;
              }}
              className="w-16 h-16 rounded-2xl bg-neutral-800 active:bg-cyan-600 border border-cyan-500/40 text-cyan-300 active:text-white flex items-center justify-center text-2xl shadow-lg active:scale-90 transition select-none"
            >
              <LeftIcon className="w-8 h-8" />
            </button>

            <button
              type="button"
              onPointerDown={() => {
                haptics.light();
                if (engineRef.current) engineRef.current.keys.right = true;
              }}
              onPointerUp={() => {
                if (engineRef.current) engineRef.current.keys.right = false;
              }}
              onPointerLeave={() => {
                if (engineRef.current) engineRef.current.keys.right = false;
              }}
              className="w-16 h-16 rounded-2xl bg-neutral-800 active:bg-cyan-600 border border-cyan-500/40 text-cyan-300 active:text-white flex items-center justify-center text-2xl shadow-lg active:scale-90 transition select-none"
            >
              <RightIcon className="w-8 h-8" />
            </button>
          </div>

          <button
            type="button"
            onPointerDown={() => {
              haptics.medium();
              if (engineRef.current) {
                engineRef.current.keys.fire = true;
                if (engineRef.current.gameState === 'TITLE' || engineRef.current.gameState === 'GAME_OVER') {
                  handleStartOrRestart();
                }
              }
            }}
            onPointerUp={() => {
              if (engineRef.current) engineRef.current.keys.fire = false;
            }}
            onPointerLeave={() => {
              if (engineRef.current) engineRef.current.keys.fire = false;
            }}
            className="flex-1 h-16 rounded-2xl bg-gradient-to-r from-cyan-600 to-yellow-500 active:from-cyan-400 active:to-yellow-300 text-black font-black font-mono text-sm tracking-wider shadow-[0_0_20px_rgba(6,182,212,0.4)] flex items-center justify-center gap-2 active:scale-95 transition select-none"
          >
            <Zap className="w-5 h-5 fill-current" />
            <span>VUUR (LASER)</span>
          </button>
        </div>
      )}

      {/* High Scores Modal */}
      {showHighScoresModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in select-none">
          <div className="w-full max-w-md bg-neutral-900 border-2 border-yellow-500/60 rounded-3xl p-6 shadow-[0_0_40px_rgba(234,179,8,0.3)]">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <div className="flex items-center gap-2 text-yellow-400 font-mono font-bold">
                <Trophy className="w-5 h-5" />
                <h3 className="text-base tracking-wider">ARCADIANS TOPSCORES</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowHighScoresModal(false)}
                className="w-7 h-7 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="my-4 space-y-2 font-mono text-xs">
              {highScores.map((hs, i) => (
                <div
                  key={i}
                  className={`flex items-center justify-between p-2.5 rounded-xl border ${
                    i === 0
                      ? 'bg-yellow-950/40 border-yellow-500/50 text-yellow-300'
                      : 'bg-neutral-950 border-neutral-800 text-neutral-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-5 text-neutral-500 font-bold">{i + 1}.</span>
                    <span className="font-black tracking-widest">{hs.initials}</span>
                    <span className="text-[10px] text-neutral-500">Wave {hs.wave}</span>
                  </div>
                  <span className="font-bold text-white">{hs.score.toLocaleString()}</span>
                </div>
              ))}
            </div>

            {gameState === 'GAME_OVER' && !hasSubmittedScore && (
              <form onSubmit={handleSubmitScore} className="mt-4 pt-3 border-t border-neutral-800 flex gap-2">
                <input
                  type="text"
                  maxLength={3}
                  value={initials}
                  onChange={(e) => setInitials(e.target.value.toUpperCase())}
                  placeholder="INITIALEN"
                  className="flex-1 bg-neutral-950 border border-cyan-500/50 rounded-xl px-3 py-2 text-xs font-mono uppercase text-center text-white focus:outline-none focus:border-cyan-400"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-black font-mono text-xs rounded-xl cursor-pointer"
                >
                  OPSLAAN
                </button>
              </form>
            )}

            <div className="flex justify-end pt-3">
              <button
                type="button"
                onClick={() => setShowHighScoresModal(false)}
                className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-mono text-xs cursor-pointer"
              >
                Sluiten
              </button>
            </div>
          </div>
        </div>
      )}

      {/* History Dossier Modal */}
      <ArcadiansHistoryModal
        isOpen={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
        onPlay={handleStartOrRestart}
      />

      {/* Game Controls & Xbox Controller Modal */}
      <GameControlsModal
        isOpen={showControls}
        onClose={() => setShowControls(false)}
        gameId="arcadians"
      />
    </div>
  );
};
