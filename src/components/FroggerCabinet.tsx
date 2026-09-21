/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Frogger Arcade Cabinet Component (Atari 2600 / Arcade 1982)
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
  HelpCircle,
  BookOpen,
  ArrowUp,
  ArrowDown,
  ArrowRight,
  Layers,
} from 'lucide-react';
import { CANVAS_HEIGHT, CANVAS_WIDTH, FroggerEngine } from '../game/froggerEngine';
import { FroggerRenderer } from '../game/froggerRenderer';
import { froggerAudio } from '../game/froggerAudio';
import { getFroggerHighScores, saveFroggerHighScore } from '../game/froggerHighScores';
import { FroggerHistoryModal } from './FroggerHistoryModal';
import { haptics } from '../utils/haptics';
import { GameControlsModal, useGameControls } from './GameControlsModal';

interface FroggerCabinetProps {
  onBackToLobby: () => void;
}

export const FroggerCabinet: React.FC<FroggerCabinetProps> = ({ onBackToLobby }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<FroggerEngine | null>(null);
  const rendererRef = useRef<FroggerRenderer | null>(null);

  // Synced state
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [lives, setLives] = useState(3);
  const [timeRemaining, setTimeRemaining] = useState(30);
  const [gameState, setGameState] = useState<string>('TITLE');
  const [isMuted, setIsMuted] = useState(false);
  const [enableCRT, setEnableCRT] = useState(true);
  const [isAtariMode, setIsAtariMode] = useState(false);
  const [showTouchControls, setShowTouchControls] = useState(() => {
    return (
      typeof window !== 'undefined' &&
      ('ontouchstart' in window || navigator.maxTouchPoints > 0 || window.innerWidth < 1024)
    );
  });
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const { showControls, setShowControls } = useGameControls('frogger');
  const [showHighScoresModal, setShowHighScoresModal] = useState(false);
  const [highScores, setHighScores] = useState(getFroggerHighScores());
  const [initials, setInitials] = useState('');
  const [hasSubmittedScore, setHasSubmittedScore] = useState(false);

  // Touch swipe gesture refs
  const touchStartPos = useRef<{ x: number; y: number } | null>(null);

  // Initialize Engine and Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    const engine = new FroggerEngine();
    const renderer = new FroggerRenderer(ctx);
    renderer.enableCRT = enableCRT;

    engineRef.current = engine;
    rendererRef.current = renderer;

    const scores = getFroggerHighScores();
    setHighScores(scores);
    if (scores.length > 0) {
      engine.highScore = scores[0].score;
    }

    const unsubscribe = engine.subscribe(() => {
      setScore(engine.score);
      setLevel(engine.level);
      setLives(engine.lives);
      setTimeRemaining(Math.ceil(engine.timeRemaining));
      setGameState(engine.gameState);
    });

    let animationFrameId: number;
    let lastTime = performance.now();

    const loop = (currentTime: number) => {
      const dt = Math.min(0.05, (currentTime - lastTime) / 1000);
      lastTime = currentTime;

      engine.update(dt);
      renderer.render(engine);

      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animationFrameId);
      unsubscribe();
    };
  }, []);

  // Keyboard Event Handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const engine = engineRef.current;
      if (!engine) return;

      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space', ' '].includes(e.key)) {
        e.preventDefault();
      }

      if (engine.gameState === 'TITLE' || engine.gameState === 'GAME_OVER') {
        if (e.key === ' ' || e.key === 'Enter') {
          engine.startGame();
          setHasSubmittedScore(false);
          haptics.medium();
          return;
        }
      }

      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W' || e.key === '8') {
        engine.handleInput('UP');
        haptics.light();
      } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S' || e.key === '2') {
        engine.handleInput('DOWN');
        haptics.light();
      } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A' || e.key === '4') {
        engine.handleInput('LEFT');
        haptics.light();
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D' || e.key === '6') {
        engine.handleInput('RIGHT');
        haptics.light();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Audio Toggle
  const toggleMute = () => {
    const muted = froggerAudio.toggleMute();
    setIsMuted(muted);
    haptics.light();
  };

  // CRT Toggle
  const toggleCRT = () => {
    setEnableCRT(prev => {
      const next = !prev;
      if (rendererRef.current) {
        rendererRef.current.enableCRT = next;
      }
      haptics.light();
      return next;
    });
  };

  // Atari 2600 Mode Toggle
  const toggleAtariMode = () => {
    setIsAtariMode(prev => {
      const next = !prev;
      if (engineRef.current) {
        engineRef.current.isAtariMode = next;
      }
      haptics.light();
      return next;
    });
  };

  // Restart Game
  const handleRestart = () => {
    if (engineRef.current) {
      engineRef.current.startGame();
      setHasSubmittedScore(false);
      haptics.medium();
    }
  };

  // Touch Handlers for Canvas Swiping / Tapping
  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    const touch = e.touches[0];
    touchStartPos.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!touchStartPos.current) return;
    const touch = e.changedTouches[0];
    const dx = touch.clientX - touchStartPos.current.x;
    const dy = touch.clientY - touchStartPos.current.y;
    const dist = Math.hypot(dx, dy);

    const engine = engineRef.current;
    if (!engine) return;

    if (engine.gameState === 'TITLE' || engine.gameState === 'GAME_OVER') {
      engine.startGame();
      setHasSubmittedScore(false);
      haptics.medium();
      touchStartPos.current = null;
      return;
    }

    if (dist < 15) {
      // Tap default = Hop forward (UP)
      engine.handleInput('UP');
      haptics.light();
    } else {
      // Swipe gesture
      if (Math.abs(dx) > Math.abs(dy)) {
        engine.handleInput(dx > 0 ? 'RIGHT' : 'LEFT');
      } else {
        engine.handleInput(dy > 0 ? 'DOWN' : 'UP');
      }
      haptics.light();
    }
    touchStartPos.current = null;
  };

  // Virtual Button Click
  const handleVirtualHop = (direction: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT') => {
    const engine = engineRef.current;
    if (!engine) return;
    if (engine.gameState === 'TITLE' || engine.gameState === 'GAME_OVER') {
      engine.startGame();
      setHasSubmittedScore(false);
      haptics.medium();
      return;
    }
    engine.handleInput(direction);
    haptics.light();
  };

  // High Score Submit
  const handleSubmitHighScore = (e: React.FormEvent) => {
    e.preventDefault();
    if (!initials || initials.trim().length === 0) return;
    const cleanInitials = initials.trim().toUpperCase().slice(0, 3);
    const updated = saveFroggerHighScore({
      initials: cleanInitials,
      score,
      level,
      date: new Date().toISOString().split('T')[0],
    });
    setHighScores(updated);
    setHasSubmittedScore(true);
    haptics.medium();
  };

  return (
    <div className="relative min-h-screen bg-neutral-950 text-neutral-100 flex flex-col items-center justify-between p-2 sm:p-4 select-none font-sans overflow-x-hidden">
      
      {/* Top Arcade Navigation Bar */}
      <header className="w-full max-w-2xl flex items-center justify-between py-2 border-b border-neutral-800">
        <button
          onClick={onBackToLobby}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-neutral-900 border border-neutral-700/80 hover:bg-neutral-800 text-neutral-300 hover:text-white transition active:scale-95 text-xs sm:text-sm font-mono cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Arcade Lobby</span>
        </button>

        <div className="flex items-center gap-2">
          <div className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono font-bold text-xs flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>ATARI 2600 & ARCADE</span>
          </div>

          <button
            onClick={() => setShowHistoryModal(true)}
            className="p-1.5 rounded-xl bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 text-neutral-400 hover:text-white transition cursor-pointer"
            title="Spelgeschiedenis & Atari Dossier"
          >
            <BookOpen className="w-4 h-4 text-emerald-400" />
          </button>
        </div>
      </header>

      {/* Main Cabinet Frame */}
      <main className="w-full max-w-2xl flex flex-col items-center my-auto py-2">
        {/* Level Selection Bar */}
        <div className="w-full max-w-[448px] flex items-center justify-between gap-1 overflow-x-auto py-1 px-2.5 mb-2 bg-neutral-900/80 border border-neutral-800 rounded-xl">
          <div className="flex items-center gap-1 text-[11px] font-mono text-neutral-400 mr-1 shrink-0">
            <Layers className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-bold text-neutral-200">LEVELS:</span>
          </div>
          <div className="flex items-center gap-1 overflow-x-auto">
            {[
              { lvl: 1, label: 'L1 Vijver', desc: 'Klassieke rustige snelweg & rivier' },
              { lvl: 2, label: 'L2 Racers', desc: 'Snelle raceauto\'s & bonusvliegjes (+200)' },
              { lvl: 3, label: 'L3 Krokodil', desc: 'Krokodillen in de baaien & op boomstammen' },
              { lvl: 4, label: 'L4 Slangen', desc: 'Snelle stroming & verhoogde verkeersdrukte' },
              { lvl: 5, label: 'L5 Spitsuur', desc: 'Maximale snelheid & ultieme arcade uitdaging' },
            ].map(({ lvl, label, desc }) => (
              <button
                key={lvl}
                type="button"
                onClick={() => {
                  engineRef.current?.setLevel(lvl);
                  haptics.light();
                }}
                className={`px-2 py-1 rounded-lg text-xs font-mono font-bold transition cursor-pointer shrink-0 border ${
                  level === lvl
                    ? 'bg-emerald-500 text-black border-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.5)] font-black'
                    : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border-neutral-700'
                }`}
                title={desc}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Glowing Marquee Banner */}
        <div className="w-full max-w-[448px] mb-2 p-2 rounded-2xl bg-gradient-to-r from-emerald-950 via-neutral-900 to-emerald-950 border border-emerald-600/40 shadow-[0_0_25px_rgba(16,185,129,0.2)] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-emerald-500 flex items-center justify-center font-black text-black font-mono text-sm shadow-md shadow-emerald-500/50">
              🐸
            </div>
            <div>
              <h1 className="text-sm sm:text-base font-black font-mono tracking-wider text-emerald-300">
                FROGGER
              </h1>
              <p className="text-[10px] font-mono text-neutral-400">Parker Brothers / Konami 1982</p>
            </div>
          </div>

          {/* Quick HUD inside marquee */}
          <div className="flex items-center gap-3 text-xs font-mono">
            <div className="text-right">
              <span className="text-[10px] text-neutral-400 block">SCORE</span>
              <span className="text-emerald-400 font-bold">{score}</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-neutral-400 block">LEV</span>
              <span className="text-cyan-400 font-bold">{level}</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-neutral-400 block">TIJD</span>
              <span className={`font-bold ${timeRemaining <= 5 ? 'text-rose-400 animate-ping' : 'text-yellow-400'}`}>
                {timeRemaining}s
              </span>
            </div>
          </div>
        </div>

        {/* Canvas Monitor Bezel */}
        <div className="relative p-2 sm:p-3.5 rounded-3xl bg-neutral-900 border-2 sm:border-4 border-neutral-800 shadow-[0_10px_40px_rgba(0,0,0,0.9)] flex flex-col items-center">
          <canvas
            ref={canvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onClick={() => {
              const engine = engineRef.current;
              if (engine && (engine.gameState === 'TITLE' || engine.gameState === 'GAME_OVER')) {
                engine.startGame();
                setHasSubmittedScore(false);
                haptics.medium();
              }
            }}
            className="w-full max-w-[448px] h-auto rounded-xl bg-black shadow-inner cursor-pointer select-none touch-none aspect-[448/512]"
          />

          {/* Quick Toolbar below screen */}
          <div className="w-full flex flex-wrap items-center justify-between gap-1.5 mt-2.5 pt-2 border-t border-neutral-800 text-xs font-mono text-neutral-400">
            <div className="flex items-center gap-1.5">
              <button
                onClick={toggleAtariMode}
                className={`px-2 py-1 rounded-lg flex items-center gap-1 transition cursor-pointer ${
                  isAtariMode
                    ? 'bg-amber-950 text-amber-300 border border-amber-600 font-bold'
                    : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300'
                }`}
                title="Wissel tussen Atari 2600 VCS rastermodus en 1982 Speelhalmodus"
              >
                <Layers className="w-3.5 h-3.5 text-amber-400" />
                <span>{isAtariMode ? 'Atari 2600' : 'Arcade 1982'}</span>
              </button>

              <button
                onClick={toggleCRT}
                className={`px-2 py-1 rounded-lg flex items-center gap-1 transition cursor-pointer ${
                  enableCRT
                    ? 'bg-cyan-950 text-cyan-300 border border-cyan-700 font-bold'
                    : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-400'
                }`}
                title="CRT Beeldbuis Scanlines filter"
              >
                <Tv className="w-3.5 h-3.5 text-cyan-400" />
                <span>CRT</span>
              </button>

              <button
                onClick={toggleMute}
                className="p-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition cursor-pointer"
                title="Geluid Aan/Uit"
              >
                {isMuted ? <VolumeX className="w-3.5 h-3.5 text-neutral-500" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-400" />}
              </button>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setShowHighScoresModal(true)}
                className="px-2 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 flex items-center gap-1 transition cursor-pointer"
              >
                <Trophy className="w-3.5 h-3.5 text-yellow-400" />
                <span>Scores</span>
              </button>

              <button
                onClick={() => setShowTouchControls(prev => !prev)}
                className={`px-2 py-1 rounded-lg flex items-center gap-1 transition cursor-pointer ${
                  showTouchControls
                    ? 'bg-neutral-700 text-white font-bold'
                    : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-400'
                }`}
                title="Touch knoppen tonen/verbergen"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>D-Pad</span>
              </button>

              <button
                onClick={handleRestart}
                className="p-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition cursor-pointer"
                title="Herstarten"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* On-Screen Touch D-Pad for mobile and tablet play */}
        {showTouchControls && (
          <div className="w-full max-w-[448px] mt-4 flex flex-col items-center justify-center p-3 rounded-2xl bg-neutral-900/90 border border-neutral-800 select-none">
            <div className="flex flex-col items-center gap-2">
              <button
                onClick={() => handleVirtualHop('UP')}
                className="w-16 h-12 rounded-xl bg-neutral-800 active:bg-emerald-600 border border-neutral-700 text-neutral-200 active:text-white flex items-center justify-center transition active:scale-95 shadow-md cursor-pointer"
              >
                <ArrowUp className="w-6 h-6 text-emerald-400" />
              </button>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleVirtualHop('LEFT')}
                  className="w-16 h-12 rounded-xl bg-neutral-800 active:bg-emerald-600 border border-neutral-700 text-neutral-200 active:text-white flex items-center justify-center transition active:scale-95 shadow-md cursor-pointer"
                >
                  <ArrowLeft className="w-6 h-6 text-emerald-400" />
                </button>
                <div className="w-12 h-12 rounded-full bg-neutral-950 border border-neutral-800 flex items-center justify-center text-xs font-mono text-emerald-500 font-bold">
                  HOP
                </div>
                <button
                  onClick={() => handleVirtualHop('RIGHT')}
                  className="w-16 h-12 rounded-xl bg-neutral-800 active:bg-emerald-600 border border-neutral-700 text-neutral-200 active:text-white flex items-center justify-center transition active:scale-95 shadow-md cursor-pointer"
                >
                  <ArrowRight className="w-6 h-6 text-emerald-400" />
                </button>
              </div>
              <button
                onClick={() => handleVirtualHop('DOWN')}
                className="w-16 h-12 rounded-xl bg-neutral-800 active:bg-emerald-600 border border-neutral-700 text-neutral-200 active:text-white flex items-center justify-center transition active:scale-95 shadow-md cursor-pointer"
              >
                <ArrowDown className="w-6 h-6 text-emerald-400" />
              </button>
            </div>
          </div>
        )}
      </main>

      {/* High Scores Modal */}
      {showHighScoresModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md bg-neutral-900 border-2 border-emerald-500 rounded-3xl p-6 shadow-2xl font-mono text-neutral-200">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800 mb-4">
              <h3 className="text-lg font-bold text-emerald-400 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-400" />
                <span>HALL OF FAME • FROGGER</span>
              </h3>
              <button
                onClick={() => setShowHighScoresModal(false)}
                className="text-neutral-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 mb-6">
              {highScores.map((entry, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-5 text-neutral-500 font-bold">#{idx + 1}</span>
                    <span className="text-emerald-300 font-bold text-sm tracking-wider">{entry.initials}</span>
                    <span className="text-neutral-500 text-[10px]">LEV {entry.level}</span>
                  </div>
                  <span className="font-bold text-yellow-400 text-sm">{entry.score.toLocaleString()}</span>
                </div>
              ))}
            </div>

            {/* If game over and eligible, allow score entry */}
            {gameState === 'GAME_OVER' && !hasSubmittedScore && (
              <form onSubmit={handleSubmitHighScore} className="p-3 rounded-2xl bg-neutral-950 border border-emerald-700/60 mb-4 space-y-2">
                <div className="text-xs text-emerald-300 font-bold">Nieuwe score invoeren! ({score} pts)</div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    maxLength={3}
                    value={initials}
                    onChange={(e) => setInitials(e.target.value.toUpperCase())}
                    placeholder="3 INITIALEN"
                    className="flex-1 px-3 py-1.5 rounded-xl bg-neutral-900 border border-neutral-700 text-center font-bold text-white tracking-widest uppercase focus:outline-none focus:border-emerald-400"
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-xl bg-emerald-500 text-black font-bold text-xs hover:bg-emerald-400 transition cursor-pointer"
                  >
                    Opslaan
                  </button>
                </div>
              </form>
            )}

            <button
              onClick={() => setShowHighScoresModal(false)}
              className="w-full py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-bold transition cursor-pointer"
            >
              Sluiten
            </button>
          </div>
        </div>
      )}

      {/* History Dossier Modal */}
      <FroggerHistoryModal
        isOpen={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
        onPlay={() => {
          setShowHistoryModal(false);
          handleRestart();
        }}
      />
    </div>
  );
};
