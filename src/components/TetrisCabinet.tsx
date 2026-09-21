/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Tetris Arcade Cabinet Component (1984 Alexey Pajitnov / 1989 Arcade)
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  Volume2,
  VolumeX,
  Music,
  Tv,
  RotateCcw,
  Trophy,
  BookOpen,
  ArrowUp,
  ArrowDown,
  ArrowRight,
  Zap,
  Pause,
  Play,
} from 'lucide-react';
import { CANVAS_HEIGHT, CANVAS_WIDTH, TetrisHighScore } from '../game/tetrisTypes';
import { TetrisEngine } from '../game/tetrisEngine';
import { TetrisRenderer } from '../game/tetrisRenderer';
import { tetrisAudio } from '../game/tetrisAudio';
import { getTetrisHighScores, saveTetrisHighScore } from '../game/tetrisHighScores';
import { TetrisHistoryModal } from './TetrisHistoryModal';
import { GameControlsModal, useGameControls } from './GameControlsModal';
import { haptics } from '../utils/haptics';

interface TetrisCabinetProps {
  onBackToLobby: () => void;
}

export const TetrisCabinet: React.FC<TetrisCabinetProps> = ({ onBackToLobby }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<TetrisEngine | null>(null);
  const rendererRef = useRef<TetrisRenderer | null>(null);

  // Synchronized state
  const [score, setScore] = useState(0);
  const [lines, setLines] = useState(0);
  const [level, setLevel] = useState(1);
  const [gameState, setGameState] = useState<string>('TITLE');
  const [isMuted, setIsMuted] = useState(false);
  const [isMusicOn, setIsMusicOn] = useState(true);
  const [enableCRT, setEnableCRT] = useState(true);
  const [showTouchControls, setShowTouchControls] = useState(() => {
    return (
      typeof window !== 'undefined' &&
      ('ontouchstart' in window || navigator.maxTouchPoints > 0 || window.innerWidth < 1024)
    );
  });
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const { showControls, setShowControls } = useGameControls('tetris');
  const [showHighScoresModal, setShowHighScoresModal] = useState(false);
  const [highScores, setHighScores] = useState<TetrisHighScore[]>(getTetrisHighScores());
  const [initials, setInitials] = useState('');
  const [hasSubmittedScore, setHasSubmittedScore] = useState(false);

  // Initialize Engine and Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    const engine = new TetrisEngine();
    const renderer = new TetrisRenderer(ctx);
    renderer.enableCRT = enableCRT;

    engineRef.current = engine;
    rendererRef.current = renderer;

    const scores = getTetrisHighScores();
    setHighScores(scores);
    if (scores.length > 0) {
      engine.highScore = scores[0].score;
    }

    const unsubscribe = engine.subscribe(() => {
      setScore(engine.score);
      setLines(engine.lines);
      setLevel(engine.level);
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
      tetrisAudio.stopMusic();
    };
  }, []);

  // Sync CRT effect
  useEffect(() => {
    if (rendererRef.current) {
      rendererRef.current.enableCRT = enableCRT;
    }
  }, [enableCRT]);

  // Keyboard Event Handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const engine = engineRef.current;
      if (!engine) return;

      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space', ' '].includes(e.key)) {
        e.preventDefault();
      }

      if (engine.gameState === 'TITLE') {
        if (e.key === ' ' || e.key === 'Enter') {
          engine.startNewGame();
          setHasSubmittedScore(false);
          haptics.medium();
        }
        return;
      }

      if (engine.gameState === 'GAME_OVER') {
        if (e.key === ' ' || e.key === 'Enter') {
          engine.startNewGame();
          setHasSubmittedScore(false);
          haptics.medium();
        }
        return;
      }

      if (e.key === 'p' || e.key === 'P' || e.key === 'Escape') {
        engine.togglePause();
        return;
      }

      if (engine.gameState !== 'PLAYING') return;

      switch (e.key) {
        case 'ArrowLeft':
        case 'a':
        case 'A':
          engine.move(-1);
          haptics.light();
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          engine.move(1);
          haptics.light();
          break;
        case 'ArrowUp':
        case 'w':
        case 'W':
        case 'x':
        case 'X':
          engine.rotate(1); // Clockwise
          haptics.light();
          break;
        case 'z':
        case 'Z':
          engine.rotate(-1); // Counter-Clockwise
          haptics.light();
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          engine.softDrop();
          haptics.light();
          break;
        case ' ':
        case 'Spacebar':
          engine.hardDrop();
          haptics.heavy();
          break;
        case 'c':
        case 'C':
        case 'Shift':
          engine.hold();
          haptics.medium();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleToggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    tetrisAudio.setMuted(nextMuted);
    haptics.light();
  };

  const handleToggleMusic = () => {
    const nextMusic = !isMusicOn;
    setIsMusicOn(nextMusic);
    tetrisAudio.setMusicEnabled(nextMusic);
    haptics.light();
  };

  const handleRestart = () => {
    if (engineRef.current) {
      engineRef.current.startNewGame();
      setHasSubmittedScore(false);
      haptics.medium();
    }
  };

  const handleSubmitHighScore = (e: React.FormEvent) => {
    e.preventDefault();
    if (!initials.trim()) return;

    const updated = saveTetrisHighScore({
      initials: initials.trim().slice(0, 3).toUpperCase(),
      score,
      lines,
      level,
    });
    setHighScores(updated);
    setHasSubmittedScore(true);
    haptics.success();
  };

  const topRecord = highScores.length > 0 ? highScores[0] : null;

  return (
    <div className="flex flex-col items-center justify-start min-h-screen w-full bg-neutral-950 p-2 sm:p-4 select-none">
      {/* Cabinet Frame */}
      <div className="relative w-full max-w-2xl bg-neutral-900 border-4 border-red-600/80 rounded-3xl p-3 sm:p-5 shadow-[0_0_60px_rgba(239,68,68,0.3)] flex flex-col items-center gap-3 sm:gap-4">
        
        {/* Marquee Header */}
        <div className="w-full flex items-center justify-between bg-gradient-to-r from-red-950 via-neutral-900 to-amber-950 px-4 py-2.5 rounded-2xl border-2 border-red-500/50 shadow-inner">
          <button
            type="button"
            onClick={onBackToLobby}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-mono font-bold transition cursor-pointer active:scale-95"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>LOBBY</span>
          </button>

          <div className="text-center">
            <h1 className="text-base sm:text-xl font-black font-mono tracking-widest text-red-500 flex items-center gap-2 justify-center drop-shadow-[0_0_10px_rgba(239,68,68,0.8)]">
              <span>ТЕТРИС</span>
              <span className="text-yellow-400">•</span>
              <span>TETRIS</span>
            </h1>
            <span className="text-[10px] font-mono text-neutral-400 tracking-wider">
              1984 • ELEKTRONIKA 60 & ARCADE
            </span>
          </div>

          <div className="flex items-center gap-1 text-xs font-mono text-yellow-400">
            <Trophy className="w-3.5 h-3.5" />
            <span className="font-bold">{topRecord ? topRecord.score.toLocaleString() : '125,000'}</span>
          </div>
        </div>

        {/* Toolbar Controls */}
        <div className="w-full flex items-center justify-between gap-2 px-1 text-xs font-mono">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleToggleMute}
              className={`p-2 rounded-xl border transition cursor-pointer ${
                isMuted
                  ? 'bg-neutral-800 text-neutral-500 border-neutral-700'
                  : 'bg-red-950/60 text-red-300 border-red-800 hover:bg-red-900/60'
              }`}
              title={isMuted ? 'Geluid Inschakelen' : 'Dempen'}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            <button
              type="button"
              onClick={handleToggleMusic}
              className={`p-2 rounded-xl border transition cursor-pointer ${
                !isMusicOn || isMuted
                  ? 'bg-neutral-800 text-neutral-500 border-neutral-700'
                  : 'bg-amber-950/60 text-amber-300 border-amber-800 hover:bg-amber-900/60'
              }`}
              title="Korobeiniki Muziek In/Uitschakelen"
            >
              <Music className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => setEnableCRT(!enableCRT)}
              className={`p-2 rounded-xl border transition cursor-pointer ${
                enableCRT
                  ? 'bg-cyan-950/60 text-cyan-300 border-cyan-800'
                  : 'bg-neutral-800 text-neutral-500 border-neutral-700'
              }`}
              title="CRT Scanlines In/Uitschakelen"
            >
              <Tv className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={handleRestart}
              className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-neutral-700 transition cursor-pointer"
              title="Herstart Game"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setShowHighScoresModal(true)}
              className="px-2.5 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-yellow-400 border border-neutral-700 flex items-center gap-1.5 transition cursor-pointer"
            >
              <Trophy className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">SCORES</span>
            </button>

            <button
              type="button"
              onClick={() => setShowControls(true)}
              className="px-2.5 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-yellow-400 border border-neutral-700 hover:border-yellow-400 flex items-center gap-1.5 transition cursor-pointer"
              title="Besturing & Xbox Controller"
            >
              <Zap className="w-3.5 h-3.5 text-yellow-400" />
              <span className="hidden sm:inline">BESTURING</span>
            </button>

            <button
              type="button"
              onClick={() => setShowHistoryModal(true)}
              className="px-2.5 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-neutral-700 flex items-center gap-1.5 transition cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5 text-red-400" />
              <span className="hidden sm:inline">DOSSIER</span>
            </button>
          </div>
        </div>

        {/* Canvas Display Screen */}
        <div className="relative rounded-2xl overflow-hidden border-2 border-neutral-800 shadow-[0_0_30px_rgba(0,0,0,0.9)] bg-black flex items-center justify-center">
          <canvas
            ref={canvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            className="w-full max-w-[480px] h-auto max-h-[75vh] aspect-[480/640] object-contain block"
          />

          {/* Start Prompt Overlay on Canvas for Touch */}
          {gameState === 'TITLE' && (
            <div className="absolute inset-0 flex items-center justify-center p-4">
              <button
                type="button"
                onClick={() => {
                  engineRef.current?.startNewGame();
                  setHasSubmittedScore(false);
                  haptics.medium();
                }}
                className="px-6 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-mono font-bold text-sm shadow-[0_0_25px_rgba(239,68,68,0.7)] animate-pulse cursor-pointer"
              >
                ▶ START TETRIS
              </button>
            </div>
          )}
        </div>

        {/* Mobile / Touch D-Pad & Action Buttons */}
        {showTouchControls && (
          <div className="w-full max-w-[480px] p-3 rounded-2xl bg-neutral-950 border border-neutral-800 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              {/* Movement Controls (Left, Soft Drop, Right) */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    engineRef.current?.move(-1);
                    haptics.light();
                  }}
                  className="w-12 h-12 rounded-xl bg-neutral-800 active:bg-neutral-700 border border-neutral-700 flex items-center justify-center text-white font-bold cursor-pointer"
                >
                  <ArrowLeft className="w-6 h-6" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    engineRef.current?.softDrop();
                    haptics.light();
                  }}
                  className="w-12 h-12 rounded-xl bg-neutral-800 active:bg-neutral-700 border border-neutral-700 flex items-center justify-center text-white font-bold cursor-pointer"
                >
                  <ArrowDown className="w-6 h-6" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    engineRef.current?.move(1);
                    haptics.light();
                  }}
                  className="w-12 h-12 rounded-xl bg-neutral-800 active:bg-neutral-700 border border-neutral-700 flex items-center justify-center text-white font-bold cursor-pointer"
                >
                  <ArrowRight className="w-6 h-6" />
                </button>
              </div>

              {/* Hold & Pause buttons */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    engineRef.current?.hold();
                    haptics.medium();
                  }}
                  className="px-3 h-12 rounded-xl bg-neutral-800 active:bg-neutral-700 border border-neutral-700 text-xs font-mono font-bold text-amber-300 flex items-center justify-center cursor-pointer"
                >
                  HOLD
                </button>
                <button
                  type="button"
                  onClick={() => {
                    engineRef.current?.togglePause();
                    haptics.light();
                  }}
                  className="w-12 h-12 rounded-xl bg-neutral-800 active:bg-neutral-700 border border-neutral-700 flex items-center justify-center text-neutral-400 cursor-pointer"
                >
                  <Pause className="w-5 h-5" />
                </button>
              </div>

              {/* Rotate & Hard Drop Controls */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    engineRef.current?.rotate(1);
                    haptics.light();
                  }}
                  className="w-12 h-12 rounded-xl bg-blue-600 active:bg-blue-500 border border-blue-400 flex items-center justify-center text-white font-bold cursor-pointer"
                  title="Draai"
                >
                  <ArrowUp className="w-6 h-6" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    engineRef.current?.hardDrop();
                    haptics.heavy();
                  }}
                  className="w-12 h-12 rounded-xl bg-red-600 active:bg-red-500 border border-red-400 flex items-center justify-center text-white font-bold cursor-pointer"
                  title="Hard Drop"
                >
                  <Zap className="w-6 h-6" />
                </button>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* High Scores Modal */}
      {showHighScoresModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-neutral-900 border-2 border-yellow-500/80 rounded-2xl p-5 space-y-4 shadow-[0_0_40px_rgba(234,179,8,0.3)]">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h3 className="text-lg font-black font-mono text-yellow-400 flex items-center gap-2">
                <Trophy className="w-5 h-5" />
                <span>HALL OF FAME • TOP SCORES</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowHighScoresModal(false)}
                className="text-neutral-400 hover:text-white font-mono text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 font-mono text-xs">
              {highScores.map((entry, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-950 border border-neutral-800"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-yellow-400 w-5">#{idx + 1}</span>
                    <span className="font-black text-white text-sm tracking-wider">{entry.initials}</span>
                    <span className="text-neutral-500 text-[11px]">LVL {entry.level}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-neutral-400 text-[11px]">{entry.lines} lines</span>
                    <span className="font-bold text-yellow-300 text-sm">{entry.score.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Score Submission Form if just played */}
            {gameState === 'GAME_OVER' && !hasSubmittedScore && (
              <form onSubmit={handleSubmitHighScore} className="pt-2 border-t border-neutral-800 space-y-3">
                <p className="text-xs font-mono text-neutral-300">
                  Jouw score: <strong className="text-yellow-400">{score.toLocaleString()}</strong> ({lines} lines). Vul je initialen in:
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    maxLength={3}
                    value={initials}
                    onChange={(e) => setInitials(e.target.value.toUpperCase())}
                    placeholder="AAA"
                    className="w-24 px-3 py-2 bg-neutral-950 border border-yellow-500 rounded-xl font-mono text-center text-lg font-black text-yellow-300 uppercase tracking-widest focus:outline-none"
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="flex-1 py-2 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-black font-mono font-bold text-xs cursor-pointer"
                  >
                    OPSLAAN
                  </button>
                </div>
              </form>
            )}

            <button
              type="button"
              onClick={() => setShowHighScoresModal(false)}
              className="w-full py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-mono font-bold text-xs cursor-pointer"
            >
              SLUITEN
            </button>
          </div>
        </div>
      )}

      {/* History Modal */}
      <TetrisHistoryModal
        isOpen={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
      />

      {/* Game Controls & Xbox Controller Modal */}
      <GameControlsModal
        isOpen={showControls}
        onClose={() => setShowControls(false)}
        gameId="tetris"
      />
    </div>
  );
};
