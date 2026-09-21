/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Super Mario Bros. (1985 NES) - Multi-World Arcade Cabinet Component
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Volume2,
  VolumeX,
  RotateCcw,
  BookOpen,
  ArrowLeft,
  Pause,
  Play,
  Tv,
  HelpCircle,
  Flame,
  Star,
  Sparkles,
  ChevronRight,
  Layers,
  ArrowDown as ArrowDownIcon,
  ArrowLeft as ArrowLeftIcon,
  ArrowRight as ArrowRightIcon,
} from 'lucide-react';
import { SuperMarioEngine, SuperMarioStats } from '../game/superMarioEngine';
import { superMarioAudio } from '../game/superMarioAudio';
import { SUPER_MARIO_LEVELS } from '../game/superMarioLevels';
import { saveSuperMarioScore, getSuperMarioScores, SuperMarioScore } from '../game/superMarioHighScores';
import { SuperMarioHistoryModal } from './SuperMarioHistoryModal';
import { haptics } from '../utils/haptics';
import { GameControlsModal, useGameControls } from './GameControlsModal';

interface SuperMarioCabinetProps {
  onBackToLobby: () => void;
}

export const SuperMarioCabinet: React.FC<SuperMarioCabinetProps> = ({ onBackToLobby }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<SuperMarioEngine | null>(null);

  const [stats, setStats] = useState<SuperMarioStats>({
    score: 0,
    coins: 0,
    world: '1-1',
    time: 400,
    lives: 3,
    isSuper: false,
    isFire: false,
    isStar: false,
    gameOver: false,
    stageComplete: false,
    gameWon: false,
    rescuedNpc: 'none',
  });

  const [isMuted, setIsMuted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [crtEffect, setCrtEffect] = useState(true);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const { showControls, setShowControls } = useGameControls('super_mario');
  const [highScores, setHighScores] = useState<SuperMarioScore[]>([]);
  const [initialsInput, setInitialsInput] = useState('');
  const [hasSubmittedScore, setHasSubmittedScore] = useState(false);

  // Initialize High Scores
  useEffect(() => {
    setHighScores(getSuperMarioScores());
  }, []);

  // Initialize Game Engine
  const initEngine = useCallback(() => {
    if (!canvasRef.current) return;
    if (engineRef.current) {
      engineRef.current.destroy();
    }

    const engine = new SuperMarioEngine(canvasRef.current, (newStats) => {
      setStats({ ...newStats });
    });
    engineRef.current = engine;
    setHasSubmittedScore(false);
  }, []);

  useEffect(() => {
    initEngine();
    return () => {
      if (engineRef.current) {
        engineRef.current.destroy();
      }
    };
  }, [initEngine]);

  // Keyboard Event Listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const eng = engineRef.current;
      if (!eng) return;

      if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
        e.preventDefault();
        eng.handleAction('left', true);
      } else if (e.code === 'ArrowRight' || e.code === 'KeyD') {
        e.preventDefault();
        eng.handleAction('right', true);
      } else if (e.code === 'ArrowDown' || e.code === 'KeyS') {
        e.preventDefault();
        eng.handleAction('down', true);
      } else if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW' || e.code === 'KeyZ') {
        e.preventDefault();
        eng.handleAction('jump', true);
      } else if (e.code === 'ShiftLeft' || e.code === 'ShiftRight' || e.code === 'KeyX' || e.code === 'KeyC') {
        eng.handleAction('dash', true);
        eng.handleAction('fire', true);
      } else if (e.code === 'KeyP' || e.code === 'Escape') {
        e.preventDefault();
        setIsPaused((prev) => {
          const next = !prev;
          eng.setPaused(next);
          return next;
        });
      } else if (e.code === 'KeyR') {
        e.preventDefault();
        eng.restartGame();
      } else if (e.code === 'KeyM') {
        e.preventDefault();
        setIsMuted((prev) => {
          const next = !prev;
          superMarioAudio.setMuted(next);
          return next;
        });
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const eng = engineRef.current;
      if (!eng) return;

      if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
        eng.handleAction('left', false);
      } else if (e.code === 'ArrowRight' || e.code === 'KeyD') {
        eng.handleAction('right', false);
      } else if (e.code === 'ArrowDown' || e.code === 'KeyS') {
        eng.handleAction('down', false);
      } else if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW' || e.code === 'KeyZ') {
        eng.handleAction('jump', false);
      } else if (e.code === 'ShiftLeft' || e.code === 'ShiftRight' || e.code === 'KeyX' || e.code === 'KeyC') {
        eng.handleAction('dash', false);
        eng.handleAction('fire', false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const handleToggleSound = () => {
    const next = !isMuted;
    setIsMuted(next);
    superMarioAudio.setMuted(next);
  };

  const handleRestart = () => {
    haptics.light();
    engineRef.current?.restartGame();
    setIsPaused(false);
    setHasSubmittedScore(false);
  };

  const handleNextLevel = () => {
    haptics.success();
    engineRef.current?.nextLevel();
    setHasSubmittedScore(false);
  };

  const handleSelectWorld = (worldKey: string) => {
    haptics.light();
    engineRef.current?.selectWorld(worldKey);
    setHasSubmittedScore(false);
    setIsPaused(false);
  };

  const handleTogglePause = () => {
    haptics.light();
    setIsPaused((prev) => {
      const next = !prev;
      engineRef.current?.setPaused(next);
      return next;
    });
  };

  const handleSubmitScore = (e: React.FormEvent) => {
    e.preventDefault();
    if (!initialsInput.trim()) return;
    const updated = saveSuperMarioScore(
      initialsInput.trim(),
      stats.score,
      stats.world,
      stats.coins
    );
    setHighScores(updated);
    setHasSubmittedScore(true);
    haptics.success();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full bg-[#0a0a0f] text-white p-2 sm:p-6 font-sans">
      {/* Cabinet Header Bar */}
      <header className="w-full max-w-4xl flex items-center justify-between py-2 px-3 mb-2 bg-neutral-900/90 border border-red-500/40 rounded-2xl shadow-lg backdrop-blur">
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={onBackToLobby}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold transition cursor-pointer border border-neutral-700"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Arcade Lobby</span>
          </button>
          <div className="flex items-center gap-2">
            <span className="text-xl">🍄</span>
            <div>
              <h1 className="text-sm sm:text-base font-black tracking-wider text-red-400 font-mono">
                SUPER MARIO BROS.
              </h1>
              <p className="text-[10px] text-neutral-400 font-mono hidden sm:block">
                8 Worlds • 1-1 t/m 2-4 • Bowser Castle & Peach Rescue
              </p>
            </div>
          </div>
        </div>

        {/* Quick Toolbar */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={() => setCrtEffect(!crtEffect)}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer flex items-center gap-1 ${
              crtEffect
                ? 'bg-amber-950/80 text-amber-300 border-amber-500/60 shadow-[0_0_10px_rgba(245,158,11,0.3)]'
                : 'bg-neutral-800 text-neutral-400 border-neutral-700'
            }`}
            title="Toggle CRT Scanline Effect"
          >
            <Tv className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">CRT</span>
          </button>

          <button
            type="button"
            onClick={handleToggleSound}
            className={`p-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
              isMuted
                ? 'bg-red-950/60 text-red-400 border-red-800'
                : 'bg-neutral-800 text-emerald-400 border-neutral-700'
            }`}
            title={isMuted ? 'Geluid Aanzetten' : 'Geluid Dempen'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onClick={handleTogglePause}
            className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-neutral-700 transition cursor-pointer"
            title={isPaused ? 'Hervatten' : 'Pauzeren'}
          >
            {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onClick={handleRestart}
            className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-neutral-700 transition cursor-pointer"
            title="Herstart Level"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => setShowControls(true)}
            className="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-neutral-800 hover:bg-neutral-700 text-yellow-400 border border-neutral-700 flex items-center gap-1 transition cursor-pointer"
            title="Besturing & Xbox Controller"
          >
            <HelpCircle className="w-3.5 h-3.5 text-yellow-400" />
            <span className="hidden sm:inline">Besturing</span>
          </button>

          <button
            type="button"
            onClick={() => setIsHistoryOpen(true)}
            className="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-neutral-800 hover:bg-neutral-700 text-yellow-300 border border-neutral-700 flex items-center gap-1 transition cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Dossier</span>
          </button>
        </div>
      </header>

      {/* World Selection Bar */}
      <div className="w-full max-w-4xl flex items-center justify-between gap-1 overflow-x-auto py-1 px-3 mb-2 bg-neutral-900/70 border border-neutral-800 rounded-xl">
        <div className="flex items-center gap-1 text-[11px] font-mono text-neutral-400 mr-2 shrink-0">
          <Layers className="w-3.5 h-3.5 text-yellow-400" />
          <span className="font-bold text-neutral-200">WERELDEN:</span>
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
          {SUPER_MARIO_LEVELS.map((lvl) => {
            const isCurrent = stats.world === lvl.world;
            return (
              <button
                key={lvl.world}
                type="button"
                onClick={() => handleSelectWorld(lvl.world)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition cursor-pointer shrink-0 border ${
                  isCurrent
                    ? 'bg-red-600 text-white border-red-400 shadow-[0_0_8px_rgba(239,68,68,0.5)]'
                    : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border-neutral-700'
                }`}
              >
                {lvl.world}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Arcade Cabinet Housing */}
      <div className="relative w-full max-w-4xl bg-neutral-900 border-4 border-red-700 rounded-3xl p-3 sm:p-5 shadow-[0_0_60px_rgba(220,38,38,0.25)] flex flex-col items-center">
        {/* Top Marquee */}
        <div className="w-full bg-gradient-to-r from-red-800 via-yellow-600 to-red-800 py-1.5 px-4 rounded-xl border-2 border-yellow-400/80 mb-3 flex items-center justify-between shadow-inner">
          <div className="flex items-center gap-2">
            <span className="text-yellow-300 font-mono font-black text-xs sm:text-sm tracking-widest uppercase">
              ★ SUPER MARIO BROS. • WORLD {stats.world} ★
            </span>
          </div>
          <div className="flex items-center gap-3 font-mono text-xs text-white">
            <span>
              LIVES: <b className="text-yellow-300">{stats.lives}</b>
            </span>
            <span className="flex items-center gap-1">
              STATUS:{' '}
              {stats.isFire ? (
                <span className="text-orange-300 font-bold flex items-center gap-0.5">
                  <Flame className="w-3.5 h-3.5 text-orange-400" /> FIRE
                </span>
              ) : stats.isStar ? (
                <span className="text-yellow-300 font-bold flex items-center gap-0.5">
                  <Star className="w-3.5 h-3.5 text-yellow-400" /> STAR
                </span>
              ) : stats.isSuper ? (
                <span className="text-emerald-300 font-bold">SUPER</span>
              ) : (
                <span className="text-red-300 font-bold">SMALL</span>
              )}
            </span>
          </div>
        </div>

        {/* Screen Frame with CRT Option */}
        <div className="relative w-full aspect-[4/3] max-w-[680px] bg-black rounded-2xl overflow-hidden border-4 border-neutral-800 shadow-2xl flex items-center justify-center">
          <canvas
            ref={canvasRef}
            className="w-full h-full object-contain [image-rendering:pixelated]"
          />

          {/* CRT Scanline Filter Overlay */}
          {crtEffect && (
            <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.3)_50%)] bg-[length:100%_4px] opacity-40 mix-blend-overlay" />
          )}

          {/* Vignette shadow */}
          <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_80px_rgba(0,0,0,0.6)]" />

          {/* Game Over Overlay */}
          {stats.gameOver && (
            <div className="absolute inset-0 bg-black/85 flex flex-col items-center justify-center p-4 z-20 animate-fade-in font-mono">
              <h2 className="text-3xl font-black text-red-500 tracking-widest mb-2 drop-shadow-[0_0_15px_rgba(239,68,68,0.8)]">
                GAME OVER
              </h2>
              <p className="text-sm text-neutral-300 mb-4">
                Eindscore: <span className="text-yellow-400 font-bold">{stats.score}</span> • Wereld:{' '}
                <span className="text-yellow-400 font-bold">{stats.world}</span> • Munten:{' '}
                <span className="text-yellow-400 font-bold">{stats.coins}</span>
              </p>

              {!hasSubmittedScore ? (
                <form onSubmit={handleSubmitScore} className="flex flex-col items-center gap-3">
                  <p className="text-xs text-neutral-400">Vul je 3 initialen in voor de Hall of Fame:</p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      maxLength={3}
                      value={initialsInput}
                      onChange={(e) => setInitialsInput(e.target.value.toUpperCase())}
                      placeholder="AAA"
                      className="w-24 text-center px-3 py-1.5 bg-neutral-800 border-2 border-yellow-500 rounded-lg text-lg font-black tracking-widest text-yellow-300 outline-none uppercase"
                      autoFocus
                    />
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-yellow-500 hover:bg-yellow-400 text-black font-black text-sm rounded-lg transition cursor-pointer"
                    >
                      OPSLAAN
                    </button>
                  </div>
                </form>
              ) : (
                <p className="text-xs text-emerald-400 font-bold mb-3">✓ Score geregistreerd!</p>
              )}

              <button
                type="button"
                onClick={handleRestart}
                className="mt-4 px-6 py-2.5 bg-red-600 hover:bg-red-500 text-white font-black text-sm rounded-xl transition cursor-pointer shadow-[0_0_20px_rgba(239,68,68,0.5)]"
              >
                SPEEL OPNIEUW
              </button>
            </div>
          )}

          {/* Stage Complete / Princess Rescued Overlay */}
          {stats.stageComplete && (
            <div className="absolute inset-0 bg-black/85 flex flex-col items-center justify-center p-4 z-20 animate-fade-in font-mono text-center">
              {stats.gameWon ? (
                <>
                  <span className="text-5xl mb-2 animate-bounce">👑💖</span>
                  <h2 className="text-2xl sm:text-3xl font-black text-yellow-300 tracking-widest mb-1 drop-shadow-[0_0_15px_rgba(234,179,8,0.8)]">
                    PRINSES PEACH GERED!
                  </h2>
                  <p className="text-xs sm:text-sm text-pink-300 mb-2">
                    PEACH: &quot;Thank you Mario! Your quest is over. We present you a new quest!&quot;
                  </p>
                  <p className="text-sm text-neutral-200 mb-4">
                    Totaalscore: <b className="text-yellow-400">{stats.score}</b> • Munten:{' '}
                    <b className="text-yellow-300">{stats.coins}</b>
                  </p>
                </>
              ) : (
                <>
                  <span className="text-4xl mb-2">🏰</span>
                  <h2 className="text-2xl sm:text-3xl font-black text-yellow-400 tracking-widest mb-1 drop-shadow-[0_0_15px_rgba(234,179,8,0.8)]">
                    WERELD {stats.world} VOLTOOID!
                  </h2>
                  {stats.rescuedNpc === 'toad' ? (
                    <p className="text-xs sm:text-sm text-sky-300 mb-2">
                      TOAD: &quot;Thank you Mario! But our Princess is in another castle!&quot;
                    </p>
                  ) : (
                    <p className="text-xs sm:text-sm text-emerald-300 mb-2">
                      Je hebt het kasteel bereikt en de vlag gehesen!
                    </p>
                  )}
                  <p className="text-sm text-neutral-200 mb-4">
                    Score: <b className="text-yellow-400">{stats.score}</b> • Tijd over:{' '}
                    <b className="text-sky-400">{stats.time}s</b>
                  </p>
                </>
              )}

              {!hasSubmittedScore ? (
                <form onSubmit={handleSubmitScore} className="flex flex-col items-center gap-2 mb-3">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      maxLength={3}
                      value={initialsInput}
                      onChange={(e) => setInitialsInput(e.target.value.toUpperCase())}
                      placeholder="AAA"
                      className="w-24 text-center px-3 py-1.5 bg-neutral-800 border-2 border-yellow-500 rounded-lg text-lg font-black tracking-widest text-yellow-300 outline-none uppercase"
                      autoFocus
                    />
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-yellow-500 hover:bg-yellow-400 text-black font-black text-sm rounded-lg transition cursor-pointer"
                    >
                      OPSLAAN
                    </button>
                  </div>
                </form>
              ) : (
                <p className="text-xs text-emerald-400 font-bold mb-3">✓ Score geregistreerd!</p>
              )}

              <div className="flex items-center gap-3">
                {!stats.gameWon && (
                  <button
                    type="button"
                    onClick={handleNextLevel}
                    className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 text-white font-black text-sm rounded-xl transition cursor-pointer flex items-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.5)]"
                  >
                    <span>VOLGENDE WERELD</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleRestart}
                  className="px-5 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-bold text-sm rounded-xl transition cursor-pointer border border-neutral-700"
                >
                  HERSTARTEN
                </button>
              </div>
            </div>
          )}

          {/* Pause Overlay */}
          {isPaused && (
            <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center p-4 z-20 font-mono">
              <h3 className="text-2xl font-black text-yellow-400 tracking-widest mb-2">GEPAUZEERD</h3>
              <p className="text-xs text-neutral-300 mb-4">Druk op P of klik op de knop om verder te gaan</p>
              <button
                type="button"
                onClick={handleTogglePause}
                className="px-5 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-bold text-xs rounded-xl transition cursor-pointer"
              >
                HERVATTEN
              </button>
            </div>
          )}
        </div>

        {/* Mobile On-Screen Controls */}
        <div className="w-full max-w-[680px] mt-4 grid grid-cols-2 gap-4 select-none touch-none sm:hidden">
          {/* Left D-Pad with Down/Crouch */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onTouchStart={() => engineRef.current?.handleAction('left', true)}
              onTouchEnd={() => engineRef.current?.handleAction('left', false)}
              onMouseDown={() => engineRef.current?.handleAction('left', true)}
              onMouseUp={() => engineRef.current?.handleAction('left', false)}
              className="w-12 h-12 rounded-xl bg-neutral-800 active:bg-neutral-700 border border-neutral-700 flex items-center justify-center text-xl shadow cursor-pointer"
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </button>
            <button
              type="button"
              onTouchStart={() => engineRef.current?.handleAction('down', true)}
              onTouchEnd={() => engineRef.current?.handleAction('down', false)}
              onMouseDown={() => engineRef.current?.handleAction('down', true)}
              onMouseUp={() => engineRef.current?.handleAction('down', false)}
              className="w-12 h-12 rounded-xl bg-neutral-800 active:bg-neutral-700 border border-neutral-700 flex items-center justify-center text-xl shadow cursor-pointer"
            >
              <ArrowDownIcon className="w-5 h-5" />
            </button>
            <button
              type="button"
              onTouchStart={() => engineRef.current?.handleAction('right', true)}
              onTouchEnd={() => engineRef.current?.handleAction('right', false)}
              onMouseDown={() => engineRef.current?.handleAction('right', true)}
              onMouseUp={() => engineRef.current?.handleAction('right', false)}
              className="w-12 h-12 rounded-xl bg-neutral-800 active:bg-neutral-700 border border-neutral-700 flex items-center justify-center text-xl shadow cursor-pointer"
            >
              <ArrowRightIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Right Action Buttons: B (Dash/Fire), A (Jump) */}
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onTouchStart={() => {
                engineRef.current?.handleAction('dash', true);
                engineRef.current?.handleAction('fire', true);
              }}
              onTouchEnd={() => {
                engineRef.current?.handleAction('dash', false);
                engineRef.current?.handleAction('fire', false);
              }}
              onMouseDown={() => {
                engineRef.current?.handleAction('dash', true);
                engineRef.current?.handleAction('fire', true);
              }}
              onMouseUp={() => {
                engineRef.current?.handleAction('dash', false);
                engineRef.current?.handleAction('fire', false);
              }}
              className="w-12 h-12 rounded-full bg-red-800 active:bg-red-700 border-2 border-red-500 font-black text-xs text-white flex items-center justify-center shadow cursor-pointer"
            >
              B/VUUR
            </button>
            <button
              type="button"
              onTouchStart={() => engineRef.current?.handleAction('jump', true)}
              onTouchEnd={() => engineRef.current?.handleAction('jump', false)}
              onMouseDown={() => engineRef.current?.handleAction('jump', true)}
              onMouseUp={() => engineRef.current?.handleAction('jump', false)}
              className="w-12 h-12 rounded-full bg-yellow-500 active:bg-yellow-400 border-2 border-yellow-300 font-black text-sm text-black flex items-center justify-center shadow cursor-pointer"
            >
              A/SPRONG
            </button>
          </div>
        </div>

        {/* Keyboard Instructions Footer */}
        <div className="w-full max-w-[680px] mt-3 pt-3 border-t border-neutral-800/80 flex flex-wrap items-center justify-between text-[11px] text-neutral-400 font-mono gap-2">
          <div className="flex items-center gap-3">
            <span>
              <kbd className="px-1.5 py-0.5 bg-neutral-800 rounded border border-neutral-700 text-neutral-200">
                ← / → / ↓
              </kbd>{' '}
              Lopen & Bukken/Buizen
            </span>
            <span>
              <kbd className="px-1.5 py-0.5 bg-neutral-800 rounded border border-neutral-700 text-neutral-200">
                SPATIE / W
              </kbd>{' '}
              Springen / Zwemmen
            </span>
            <span>
              <kbd className="px-1.5 py-0.5 bg-neutral-800 rounded border border-neutral-700 text-neutral-200">
                SHIFT / X
              </kbd>{' '}
              Sprint & Vuurbal
            </span>
          </div>
          <div className="flex items-center gap-2 text-yellow-500/90">
            <span>P: Pauze</span>
            <span>•</span>
            <span>R: Herstart</span>
            <span>•</span>
            <span>M: Geluid</span>
          </div>
        </div>
      </div>

      {/* History Modal */}
      <SuperMarioHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        lang="nl"
        onPlay={handleRestart}
      />

      {/* Game Controls & Xbox Modal */}
      <GameControlsModal
        isOpen={showControls}
        onClose={() => setShowControls(false)}
        gameId="super_mario"
      />
    </div>
  );
};
