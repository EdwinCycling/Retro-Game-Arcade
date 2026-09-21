/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Chuckie Egg Arcade Cabinet Component (BBC Micro / A&F Software 1983)
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
  ArrowUp,
  ArrowDown,
  ArrowRight,
  Zap,
} from 'lucide-react';
import { CANVAS_HEIGHT, CANVAS_WIDTH } from '../game/chuckieEggLevels';
import { ChuckieEggEngine } from '../game/chuckieEggEngine';
import { ChuckieEggRenderer } from '../game/chuckieEggRenderer';
import { chuckieEggAudio } from '../game/chuckieEggAudio';
import { getChuckieEggHighScores, saveChuckieEggHighScore } from '../game/chuckieEggHighScores';
import { ChuckieEggHistoryModal } from './ChuckieEggHistoryModal';
import { GameControlsModal, useGameControls } from './GameControlsModal';
import { haptics } from '../utils/haptics';

interface ChuckieEggCabinetProps {
  onBackToLobby: () => void;
}

export const ChuckieEggCabinet: React.FC<ChuckieEggCabinetProps> = ({ onBackToLobby }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<ChuckieEggEngine | null>(null);
  const rendererRef = useRef<ChuckieEggRenderer | null>(null);

  // Synced state
  const [score, setScore] = useState(0);
  const [levelIndex, setLevelIndex] = useState(0);
  const [lives, setLives] = useState(5);
  const [bonusTimer, setBonusTimer] = useState(1000);
  const [eggsRemaining, setEggsRemaining] = useState(12);
  const [gameState, setGameState] = useState<string>('TITLE');
  const [isMuted, setIsMuted] = useState(false);
  const [enableCRT, setEnableCRT] = useState(true);
  const [showTouchControls, setShowTouchControls] = useState(() => {
    return (
      typeof window !== 'undefined' &&
      ('ontouchstart' in window || navigator.maxTouchPoints > 0 || window.innerWidth < 1024)
    );
  });
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const { showControls, setShowControls } = useGameControls('chuckie_egg');
  const [showHighScoresModal, setShowHighScoresModal] = useState(false);
  const [highScores, setHighScores] = useState(getChuckieEggHighScores());
  const [initials, setInitials] = useState('');
  const [hasSubmittedScore, setHasSubmittedScore] = useState(false);

  // Initialize Engine and Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    const engine = new ChuckieEggEngine();
    const renderer = new ChuckieEggRenderer(ctx);
    renderer.enableCRT = enableCRT;

    engineRef.current = engine;
    rendererRef.current = renderer;

    const scores = getChuckieEggHighScores();
    setHighScores(scores);
    if (scores.length > 0) {
      engine.highScore = scores[0].score;
    }

    const unsubscribe = engine.subscribe(() => {
      setScore(engine.score);
      setLevelIndex(engine.levelIndex);
      setLives(engine.lives);
      setBonusTimer(Math.floor(engine.bonusTimer));
      setEggsRemaining(engine.eggsRemaining);
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

      engine.handleKeyDown(e.key);
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const engine = engineRef.current;
      if (!engine) return;
      engine.handleKeyUp(e.key);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Audio Toggle
  const toggleMute = () => {
    const muted = chuckieEggAudio.toggleMute();
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

  // Restart Game
  const handleRestart = () => {
    if (engineRef.current) {
      engineRef.current.startGame();
      setHasSubmittedScore(false);
      haptics.medium();
    }
  };

  // Touch handlers for virtual controls
  const handleTouchDirectionDown = (dir: 'left' | 'right' | 'up' | 'down') => {
    const engine = engineRef.current;
    if (!engine) return;
    if (engine.gameState === 'TITLE' || engine.gameState === 'GAME_OVER') {
      engine.startGame();
      setHasSubmittedScore(false);
      haptics.medium();
      return;
    }
    if (dir === 'left') engine.handleKeyDown('ArrowLeft');
    if (dir === 'right') engine.handleKeyDown('ArrowRight');
    if (dir === 'up') engine.handleKeyDown('ArrowUp');
    if (dir === 'down') engine.handleKeyDown('ArrowDown');
    haptics.light();
  };

  const handleTouchDirectionUp = (dir: 'left' | 'right' | 'up' | 'down') => {
    const engine = engineRef.current;
    if (!engine) return;
    if (dir === 'left') engine.handleKeyUp('ArrowLeft');
    if (dir === 'right') engine.handleKeyUp('ArrowRight');
    if (dir === 'up') engine.handleKeyUp('ArrowUp');
    if (dir === 'down') engine.handleKeyUp('ArrowDown');
  };

  const handleVirtualJump = () => {
    const engine = engineRef.current;
    if (!engine) return;
    if (engine.gameState === 'TITLE' || engine.gameState === 'GAME_OVER') {
      engine.startGame();
      setHasSubmittedScore(false);
      haptics.medium();
      return;
    }
    engine.triggerJump();
    haptics.medium();
  };

  // High Score Submit
  const handleSubmitHighScore = (e: React.FormEvent) => {
    e.preventDefault();
    if (!initials || initials.trim().length === 0) return;
    const cleanInitials = initials.trim().toUpperCase().slice(0, 3);
    const updated = saveChuckieEggHighScore({
      initials: cleanInitials,
      score,
      level: levelIndex + 1,
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
          <div className="px-2.5 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 font-mono font-bold text-xs flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse"></span>
            <span>BBC MICRO • 1983</span>
          </div>

          <button
            onClick={() => setShowControls(true)}
            className="p-1.5 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-yellow-400 text-yellow-400 transition cursor-pointer flex items-center gap-1 text-xs font-mono"
            title="Besturing & Xbox Controller"
          >
            <Zap className="w-4 h-4 text-yellow-400" />
            <span className="hidden sm:inline">Besturing</span>
          </button>

          <button
            onClick={() => setShowHistoryModal(true)}
            className="p-1.5 rounded-xl bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 text-neutral-400 hover:text-white transition cursor-pointer"
            title="Spelgeschiedenis & BBC Dossier"
          >
            <BookOpen className="w-4 h-4 text-yellow-400" />
          </button>
        </div>
      </header>

      {/* Main Cabinet Frame */}
      <main className="w-full max-w-2xl flex flex-col items-center my-auto py-2">
        {/* Glowing Marquee Banner */}
        <div className="w-full max-w-[512px] mb-2 p-2 rounded-2xl bg-gradient-to-r from-yellow-950 via-neutral-900 to-yellow-950 border border-yellow-600/40 shadow-[0_0_25px_rgba(234,179,8,0.2)] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-yellow-500 flex items-center justify-center font-black text-black font-mono text-sm shadow-md shadow-yellow-500/50">
              🥚
            </div>
            <div>
              <h1 className="text-sm sm:text-base font-black font-mono tracking-wider text-yellow-300">
                CHUCKIE EGG
              </h1>
              <p className="text-[10px] font-mono text-neutral-400">A&F Software / Nigel Alderton</p>
            </div>
          </div>

          {/* Quick HUD inside marquee */}
          <div className="flex items-center gap-3 text-xs font-mono">
            <div className="text-right">
              <span className="text-[10px] text-neutral-400 block">SCORE</span>
              <span className="text-yellow-400 font-bold">{score.toLocaleString()}</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-neutral-400 block">SCHUUR</span>
              <span className="text-cyan-400 font-bold">{levelIndex + 1} / 8</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-neutral-400 block">BONUS</span>
              <span className={`font-bold ${bonusTimer <= 200 ? 'text-rose-400 animate-ping' : 'text-emerald-400'}`}>
                {bonusTimer}
              </span>
            </div>
          </div>
        </div>

        {/* 8-Barn Fast Level Selector */}
        <div className="w-full max-w-[512px] mb-2 flex items-center justify-between gap-1 px-2 py-1.5 rounded-xl bg-neutral-900/90 border border-neutral-800 text-[11px] font-mono">
          <span className="text-neutral-400 font-bold hidden sm:inline">SCHUUR:</span>
          <div className="flex items-center gap-1 overflow-x-auto">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((barnNum) => {
              const isActive = levelIndex === barnNum - 1;
              return (
                <button
                  key={barnNum}
                  onClick={() => {
                    if (engineRef.current) {
                      engineRef.current.loadLevel(barnNum - 1);
                      engineRef.current.gameState = 'PLAYING';
                    }
                  }}
                  className={`px-2 py-0.5 rounded-md font-bold transition cursor-pointer ${
                    isActive
                      ? 'bg-yellow-400 text-black shadow-md shadow-yellow-400/30'
                      : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700 hover:text-white'
                  }`}
                  title={`Spring naar Schuur ${barnNum}`}
                >
                  #{barnNum}
                </button>
              );
            })}
          </div>
        </div>

        {/* Canvas Monitor Bezel */}
        <div className="relative p-2 sm:p-3.5 rounded-3xl bg-neutral-900 border-2 sm:border-4 border-neutral-800 shadow-[0_10px_40px_rgba(0,0,0,0.9)] flex flex-col items-center">
          <canvas
            ref={canvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            onClick={() => {
              const engine = engineRef.current;
              if (engine && (engine.gameState === 'TITLE' || engine.gameState === 'GAME_OVER')) {
                engine.startGame();
                setHasSubmittedScore(false);
                haptics.medium();
              }
            }}
            className="w-full max-w-[512px] h-auto rounded-xl bg-black shadow-inner cursor-pointer select-none touch-none aspect-[512/400]"
          />

          {/* Quick Toolbar below screen */}
          <div className="w-full flex flex-wrap items-center justify-between gap-1.5 mt-2.5 pt-2 border-t border-neutral-800 text-xs font-mono text-neutral-400">
            <div className="flex items-center gap-1.5">
              <button
                onClick={toggleCRT}
                className={`px-2 py-1 rounded-lg flex items-center gap-1 transition cursor-pointer ${
                  enableCRT
                    ? 'bg-yellow-950 text-yellow-300 border border-yellow-700 font-bold'
                    : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-400'
                }`}
                title="CRT Beeldbuis Scanlines filter"
              >
                <Tv className="w-3.5 h-3.5 text-yellow-400" />
                <span>CRT</span>
              </button>

              <button
                onClick={toggleMute}
                className="p-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition cursor-pointer"
                title="Geluid Aan/Uit"
              >
                {isMuted ? <VolumeX className="w-3.5 h-3.5 text-neutral-500" /> : <Volume2 className="w-3.5 h-3.5 text-yellow-400" />}
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
                <span>Knoppen</span>
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

        {/* Responsive Touch Controls (D-Pad + Big Jump Button) */}
        {showTouchControls && (
          <div className="w-full max-w-[512px] mt-4 flex items-center justify-between p-3 rounded-2xl bg-neutral-900/90 border border-neutral-800 select-none">
            {/* Directional Pad */}
            <div className="flex flex-col items-center gap-1.5">
              <button
                onTouchStart={() => handleTouchDirectionDown('up')}
                onTouchEnd={() => handleTouchDirectionUp('up')}
                onMouseDown={() => handleTouchDirectionDown('up')}
                onMouseUp={() => handleTouchDirectionUp('up')}
                className="w-14 h-11 rounded-xl bg-neutral-800 active:bg-yellow-600 border border-neutral-700 text-neutral-200 active:text-black flex items-center justify-center transition active:scale-95 shadow-md cursor-pointer"
              >
                <ArrowUp className="w-5 h-5 text-yellow-400" />
              </button>
              <div className="flex items-center gap-2">
                <button
                  onTouchStart={() => handleTouchDirectionDown('left')}
                  onTouchEnd={() => handleTouchDirectionUp('left')}
                  onMouseDown={() => handleTouchDirectionDown('left')}
                  onMouseUp={() => handleTouchDirectionUp('left')}
                  className="w-14 h-11 rounded-xl bg-neutral-800 active:bg-yellow-600 border border-neutral-700 text-neutral-200 active:text-black flex items-center justify-center transition active:scale-95 shadow-md cursor-pointer"
                >
                  <ArrowLeft className="w-5 h-5 text-yellow-400" />
                </button>
                <div className="w-9 h-9 rounded-full bg-neutral-950 border border-neutral-800 flex items-center justify-center text-[10px] font-mono text-yellow-500 font-bold">
                  🥚
                </div>
                <button
                  onTouchStart={() => handleTouchDirectionDown('right')}
                  onTouchEnd={() => handleTouchDirectionUp('right')}
                  onMouseDown={() => handleTouchDirectionDown('right')}
                  onMouseUp={() => handleTouchDirectionUp('right')}
                  className="w-14 h-11 rounded-xl bg-neutral-800 active:bg-yellow-600 border border-neutral-700 text-neutral-200 active:text-black flex items-center justify-center transition active:scale-95 shadow-md cursor-pointer"
                >
                  <ArrowRight className="w-5 h-5 text-yellow-400" />
                </button>
              </div>
              <button
                onTouchStart={() => handleTouchDirectionDown('down')}
                onTouchEnd={() => handleTouchDirectionUp('down')}
                onMouseDown={() => handleTouchDirectionDown('down')}
                onMouseUp={() => handleTouchDirectionUp('down')}
                className="w-14 h-11 rounded-xl bg-neutral-800 active:bg-yellow-600 border border-neutral-700 text-neutral-200 active:text-black flex items-center justify-center transition active:scale-95 shadow-md cursor-pointer"
              >
                <ArrowDown className="w-5 h-5 text-yellow-400" />
              </button>
            </div>

            {/* Jump Action Button */}
            <div className="flex flex-col items-center gap-2 pr-4">
              <button
                onClick={handleVirtualJump}
                className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-yellow-600 to-amber-400 active:from-yellow-400 active:to-yellow-300 text-black font-mono font-black text-sm flex flex-col items-center justify-center gap-1 shadow-lg shadow-yellow-950/50 border-2 border-yellow-300 transition active:scale-95 cursor-pointer"
              >
                <Zap className="w-7 h-7 fill-black" />
                <span>SPRING</span>
              </button>
              <span className="text-[10px] font-mono text-neutral-400">Of SPATIE</span>
            </div>
          </div>
        )}
      </main>

      {/* High Scores Modal */}
      {showHighScoresModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md bg-neutral-900 border-2 border-yellow-500 rounded-3xl p-6 shadow-2xl font-mono text-neutral-200">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800 mb-4">
              <h3 className="text-lg font-bold text-yellow-400 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-400" />
                <span>HALL OF FAME • CHUCKIE EGG</span>
              </h3>
              <button
                onClick={() => setShowHighScoresModal(false)}
                className="text-neutral-400 hover:text-white text-sm cursor-pointer"
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
                    <span className="text-yellow-300 font-bold text-sm tracking-wider">{entry.initials}</span>
                    <span className="text-neutral-500 text-[10px]">SCHUUR {entry.level}</span>
                  </div>
                  <span className="font-bold text-yellow-400 text-sm">{entry.score.toLocaleString()}</span>
                </div>
              ))}
            </div>

            {/* If game over and eligible, allow score entry */}
            {gameState === 'GAME_OVER' && !hasSubmittedScore && (
              <form onSubmit={handleSubmitHighScore} className="p-3 rounded-2xl bg-neutral-950 border border-yellow-700/60 mb-4 space-y-2">
                <div className="text-xs text-yellow-300 font-bold">Nieuwe score invoeren! ({score.toLocaleString()} pts)</div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    maxLength={3}
                    value={initials}
                    onChange={(e) => setInitials(e.target.value.toUpperCase())}
                    placeholder="3 INITIALEN"
                    className="flex-1 px-3 py-1.5 rounded-xl bg-neutral-900 border border-neutral-700 text-center font-bold text-white tracking-widest uppercase focus:outline-none focus:border-yellow-400"
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-xl bg-yellow-500 text-black font-bold text-xs hover:bg-yellow-400 transition cursor-pointer"
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
      <ChuckieEggHistoryModal
        isOpen={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
        onPlay={() => {
          setShowHistoryModal(false);
          handleRestart();
        }}
      />

      {/* Game Controls & Xbox Controller Modal */}
      <GameControlsModal
        isOpen={showControls}
        onClose={() => setShowControls(false)}
        gameId="chuckie_egg"
      />
    </div>
  );
};
