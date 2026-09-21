/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Q*bert Arcade Cabinet Component (Acorn BBC Micro 1983 / Gottlieb 1982)
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  ArrowLeft,
  Volume2,
  VolumeX,
  RotateCcw,
  Trophy,
  Tv,
  Palette,
  BookOpen,
  Smartphone,
  Play,
  ArrowUpLeft,
  ArrowUpRight,
  ArrowDownLeft,
  ArrowDownRight,
} from 'lucide-react';
import { QbertEngine, NATIVE_WIDTH, NATIVE_HEIGHT } from '../game/qbertEngine';
import { QbertRenderer } from '../game/qbertRenderer';
import { qbertAudio } from '../game/qbertAudio';
import { getQbertScores, saveQbertScore } from '../game/qbertHighScores';
import { DisplayPalette, Direction, HighScoreEntry } from '../game/qbertTypes';
import { QbertHistoryModal } from './QbertHistoryModal';
import { haptics } from '../utils/haptics';

interface QbertCabinetProps {
  onBackToLobby: () => void;
}

export const QbertCabinet: React.FC<QbertCabinetProps> = ({ onBackToLobby }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<QbertEngine | null>(null);
  const rendererRef = useRef<QbertRenderer | null>(null);

  // States
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(24850);
  const [lives, setLives] = useState(3);
  const [level, setLevel] = useState(1);
  const [round, setRound] = useState(1);
  const [gameState, setGameState] = useState<string>('TITLE');
  const [isMuted, setIsMuted] = useState(false);
  const [enableCRT, setEnableCRT] = useState(true);
  const [palette, setPalette] = useState<DisplayPalette>('authentic');
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showHighScoresModal, setShowHighScoresModal] = useState(false);
  const [highScores, setHighScores] = useState<HighScoreEntry[]>(getQbertScores());
  const [initials, setInitials] = useState('');
  const [hasSubmittedScore, setHasSubmittedScore] = useState(false);

  // Touch Swipe tracking
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  // Initialize engine & renderer
  useEffect(() => {
    const engine = new QbertEngine();
    engineRef.current = engine;

    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.imageSmoothingEnabled = false;
        const renderer = new QbertRenderer(ctx);
        renderer.setPalette(palette);
        renderer.enableCRT = enableCRT;
        rendererRef.current = renderer;
      }
    }

    // Keyboard handlers
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Numpad7', 'Numpad9', 'Numpad1', 'Numpad3'].includes(e.code)) {
        e.preventDefault();
      }

      if (e.code === 'Space' || e.code === 'Enter') {
        if (engine.gameState === 'TITLE' || engine.gameState === 'GAMEOVER') {
          engine.startNewGame();
          setHasSubmittedScore(false);
        }
        return;
      }

      // Diagonal Mappings
      // 1. Numpad / Digits
      if (e.code === 'Numpad7' || e.key === '7') {
        engine.movePlayer('UL');
      } else if (e.code === 'Numpad9' || e.key === '9') {
        engine.movePlayer('UR');
      } else if (e.code === 'Numpad1' || e.key === '1') {
        engine.movePlayer('DL');
      } else if (e.code === 'Numpad3' || e.key === '3') {
        engine.movePlayer('DR');
      }
      // 2. QWEASD / AZER keys
      else if (e.code === 'KeyQ' || e.code === 'KeyU') {
        engine.movePlayer('UL');
      } else if (e.code === 'KeyW' || e.code === 'KeyE' || e.code === 'KeyO') {
        engine.movePlayer('UR');
      } else if (e.code === 'KeyA' || e.code === 'KeyZ' || e.code === 'KeyJ') {
        engine.movePlayer('DL');
      } else if (e.code === 'KeyS' || e.code === 'KeyD' || e.code === 'KeyX' || e.code === 'KeyK') {
        engine.movePlayer('DR');
      }
      // 3. Standard Arrow keys (Up = UL, Right = UR, Left = DL, Down = DR)
      else if (e.code === 'ArrowUp') {
        engine.movePlayer('UL');
      } else if (e.code === 'ArrowRight') {
        engine.movePlayer('UR');
      } else if (e.code === 'ArrowLeft') {
        engine.movePlayer('DL');
      } else if (e.code === 'ArrowDown') {
        engine.movePlayer('DR');
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    // Animation Loop
    let lastTime = performance.now();
    let animId: number;

    const gameLoop = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      engine.update(dt);

      if (rendererRef.current) {
        rendererRef.current.render(engine);
      }

      // Sync React state
      setScore(engine.score);
      setHighScore(engine.highScore);
      setLives(engine.lives);
      setLevel(engine.level);
      setRound(engine.round);
      setGameState(engine.gameState);

      animId = requestAnimationFrame(gameLoop);
    };

    animId = requestAnimationFrame(gameLoop);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      cancelAnimationFrame(animId);
    };
  }, []);

  // Update renderer palette / CRT toggles
  useEffect(() => {
    if (rendererRef.current) {
      rendererRef.current.setPalette(palette);
      rendererRef.current.enableCRT = enableCRT;
    }
  }, [palette, enableCRT]);

  // Audio mute
  const toggleMute = useCallback(() => {
    const next = !isMuted;
    setIsMuted(next);
    qbertAudio.setMuted(next);
    haptics.selection();
  }, [isMuted]);

  // Start game handler
  const handleStartGame = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.startNewGame();
      setHasSubmittedScore(false);
      haptics.heavy();
    }
  }, []);

  // Move player handler for button and touch
  const handleMove = useCallback((dir: Direction) => {
    if (engineRef.current) {
      if (engineRef.current.gameState === 'TITLE' || engineRef.current.gameState === 'GAMEOVER') {
        engineRef.current.startNewGame();
        setHasSubmittedScore(false);
      } else {
        engineRef.current.movePlayer(dir);
        haptics.light();
      }
    }
  }, []);

  // Touch swipe support on canvas
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length > 0) {
      touchStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      };
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current || e.changedTouches.length === 0) return;
    const endX = e.changedTouches[0].clientX;
    const endY = e.changedTouches[0].clientY;
    const dx = endX - touchStartRef.current.x;
    const dy = endY - touchStartRef.current.y;
    touchStartRef.current = null;

    if (Math.hypot(dx, dy) < 18) {
      // Tap: if on title, start game
      if (engineRef.current && (engineRef.current.gameState === 'TITLE' || engineRef.current.gameState === 'GAMEOVER')) {
        handleStartGame();
      }
      return;
    }

    // Determine diagonal quadrant
    if (dx < 0 && dy < 0) {
      handleMove('UL');
    } else if (dx >= 0 && dy < 0) {
      handleMove('UR');
    } else if (dx < 0 && dy >= 0) {
      handleMove('DL');
    } else {
      handleMove('DR');
    }
  };

  // High score submit
  const handleSubmitScore = (e: React.FormEvent) => {
    e.preventDefault();
    if (!initials.trim() || hasSubmittedScore) return;
    const updated = saveQbertScore(score, initials, level);
    setHighScores(updated);
    setHasSubmittedScore(true);
    haptics.success();
  };

  return (
    <div id="qbert-cabinet" className="relative w-full min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-2 sm:p-4 select-none">
      {/* Top Header & Navigation */}
      <header className="w-full max-w-4xl flex items-center justify-between py-2 px-3 mb-2 rounded-2xl bg-neutral-900/80 border border-orange-500/30 backdrop-blur-md shadow-[0_0_20px_rgba(249,115,22,0.15)]">
        <button
          id="btn-qbert-back"
          onClick={() => {
            haptics.selection();
            onBackToLobby();
          }}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-mono transition-colors border border-neutral-700 active:scale-95"
          title="Terug naar Arcade Lobby"
        >
          <ArrowLeft className="w-4 h-4 text-orange-400" />
          <span className="hidden sm:inline">LOBBY</span>
        </button>

        {/* Title Marquee */}
        <div className="flex items-center gap-2">
          <span className="text-xl">🟠</span>
          <h1 className="text-sm sm:text-base font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-yellow-300 to-orange-500 font-mono drop-shadow-[0_0_8px_rgba(249,115,22,0.6)]">
            Q*BERT
          </h1>
          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-300 border border-orange-500/40">
            BBC ACORN 1983
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Palette Switcher */}
          <button
            id="btn-qbert-palette"
            onClick={() => {
              const palettes: DisplayPalette[] = ['authentic', 'bbc_micro', 'green', 'amber'];
              const idx = (palettes.indexOf(palette) + 1) % palettes.length;
              setPalette(palettes[idx]);
              haptics.selection();
            }}
            className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-orange-400 border border-neutral-700 active:scale-95"
            title={`Thema: ${palette.toUpperCase()}`}
          >
            <Palette className="w-4 h-4" />
          </button>

          {/* CRT Scanlines Toggle */}
          <button
            id="btn-qbert-crt"
            onClick={() => {
              setEnableCRT(!enableCRT);
              haptics.selection();
            }}
            className={`p-2 rounded-xl border transition-colors active:scale-95 ${
              enableCRT
                ? 'bg-orange-500/20 text-orange-400 border-orange-500/50'
                : 'bg-neutral-800 text-neutral-500 border-neutral-700'
            }`}
            title="CRT Scanlines filter"
          >
            <Tv className="w-4 h-4" />
          </button>

          {/* High Scores */}
          <button
            id="btn-qbert-scores"
            onClick={() => {
              setShowHighScoresModal(true);
              haptics.selection();
            }}
            className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-yellow-400 border border-neutral-700 active:scale-95"
            title="High Scores"
          >
            <Trophy className="w-4 h-4" />
          </button>

          {/* History Modal */}
          <button
            id="btn-qbert-history"
            onClick={() => {
              setShowHistoryModal(true);
              haptics.selection();
            }}
            className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-blue-400 border border-neutral-700 active:scale-95"
            title="Spelgeschiedenis & BBC Micro Info"
          >
            <BookOpen className="w-4 h-4" />
          </button>

          {/* Audio Mute */}
          <button
            id="btn-qbert-audio"
            onClick={toggleMute}
            className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 active:scale-95"
            title={isMuted ? 'Geluid Aanzetten' : 'Geluid Dempen'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-green-400" />}
          </button>
        </div>
      </header>

      {/* Main Arcade Bezel & Screen Wrapper */}
      <div className="w-full max-w-4xl flex flex-col items-center">
        <div className="relative w-full max-w-[640px] aspect-[4/3] bg-black rounded-3xl p-2.5 sm:p-4 border-4 border-neutral-800 shadow-[0_0_50px_rgba(249,115,22,0.2)] flex flex-col items-center justify-center overflow-hidden">
          {/* Authentic CRT glass reflection effect */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.03] to-transparent pointer-events-none rounded-2xl z-10" />

          {/* Canvas Screen */}
          <canvas
            ref={canvasRef}
            width={NATIVE_WIDTH}
            height={NATIVE_HEIGHT}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            className="w-full h-full object-contain rounded-xl image-render-pixelated cursor-pointer"
          />

          {/* Overlay Start Button on Title or Game Over */}
          {(gameState === 'TITLE' || gameState === 'GAMEOVER') && (
            <button
              onClick={handleStartGame}
              className="absolute z-20 px-6 py-2.5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-mono font-bold text-sm tracking-wider shadow-[0_0_20px_rgba(249,115,22,0.8)] border border-orange-300 active:scale-95 hover:brightness-110 flex items-center gap-2 animate-bounce"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>{gameState === 'GAMEOVER' ? 'OPNIEUW SPELEN' : 'START SPEL (SPACE)'}</span>
            </button>
          )}
        </div>

        {/* Quick HUD Strip */}
        <div className="w-full max-w-[640px] flex items-center justify-between mt-2 px-4 py-1.5 rounded-xl bg-neutral-900 border border-neutral-800 text-xs font-mono">
          <div className="flex items-center gap-4">
            <span className="text-neutral-400">SCORE: <strong className="text-white">{score.toLocaleString()}</strong></span>
            <span className="text-neutral-400">LEVEN: <strong className="text-orange-400">{lives}</strong></span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-neutral-400">LEVEL: <strong className="text-yellow-400">{level}</strong></span>
            <span className="text-neutral-400">RONDE: <strong className="text-cyan-400">{round}</strong></span>
          </div>
        </div>

        {/* Diagonal Controls Panel (Item 2 of User Request) */}
        <div className="w-full max-w-[640px] mt-3 p-3 rounded-2xl bg-neutral-900/90 border border-orange-500/20 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
          <div className="flex flex-col text-center sm:text-left">
            <span className="text-xs font-bold text-orange-400 font-mono tracking-wider flex items-center gap-1 justify-center sm:justify-start">
              <Smartphone className="w-3.5 h-3.5" /> DIAGONALE BESTURING
            </span>
            <span className="text-[11px] text-neutral-400 font-mono mt-0.5">
              Toetsen: <strong>7 9 1 3</strong> of <strong>Q W A S</strong> • Swipe op scherm
            </span>
          </div>

          {/* Diamond-shaped Diagonal Directional Pad */}
          <div className="grid grid-cols-2 gap-2 p-1.5 rounded-2xl bg-neutral-950 border border-neutral-800">
            {/* UP-LEFT */}
            <button
              id="btn-qbert-ul"
              onClick={() => handleMove('UL')}
              className="w-16 h-12 sm:w-20 sm:h-12 rounded-xl bg-neutral-800 hover:bg-orange-600 active:bg-orange-700 text-white font-mono font-bold flex items-center justify-center gap-1 border border-neutral-700 hover:border-orange-400 shadow-md active:scale-95 transition-all group"
              title="Spring Schuinte Linksboven (7 / Q)"
            >
              <ArrowUpLeft className="w-4 h-4 text-orange-400 group-hover:text-white" />
              <span className="text-xs">UL</span>
            </button>

            {/* UP-RIGHT */}
            <button
              id="btn-qbert-ur"
              onClick={() => handleMove('UR')}
              className="w-16 h-12 sm:w-20 sm:h-12 rounded-xl bg-neutral-800 hover:bg-orange-600 active:bg-orange-700 text-white font-mono font-bold flex items-center justify-center gap-1 border border-neutral-700 hover:border-orange-400 shadow-md active:scale-95 transition-all group"
              title="Spring Schuinte Rechtsboven (9 / W)"
            >
              <span className="text-xs">UR</span>
              <ArrowUpRight className="w-4 h-4 text-orange-400 group-hover:text-white" />
            </button>

            {/* DOWN-LEFT */}
            <button
              id="btn-qbert-dl"
              onClick={() => handleMove('DL')}
              className="w-16 h-12 sm:w-20 sm:h-12 rounded-xl bg-neutral-800 hover:bg-orange-600 active:bg-orange-700 text-white font-mono font-bold flex items-center justify-center gap-1 border border-neutral-700 hover:border-orange-400 shadow-md active:scale-95 transition-all group"
              title="Spring Schuinte Linksonder (1 / A)"
            >
              <ArrowDownLeft className="w-4 h-4 text-orange-400 group-hover:text-white" />
              <span className="text-xs">DL</span>
            </button>

            {/* DOWN-RIGHT */}
            <button
              id="btn-qbert-dr"
              onClick={() => handleMove('DR')}
              className="w-16 h-12 sm:w-20 sm:h-12 rounded-xl bg-neutral-800 hover:bg-orange-600 active:bg-orange-700 text-white font-mono font-bold flex items-center justify-center gap-1 border border-neutral-700 hover:border-orange-400 shadow-md active:scale-95 transition-all group"
              title="Spring Schuinte Rechtsonder (3 / S)"
            >
              <span className="text-xs">DR</span>
              <ArrowDownRight className="w-4 h-4 text-orange-400 group-hover:text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* High Scores Modal */}
      {showHighScoresModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-neutral-900 border border-orange-500/40 rounded-3xl p-6 shadow-[0_0_30px_rgba(249,115,22,0.3)] font-mono">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
              <div className="flex items-center gap-2 text-orange-400">
                <Trophy className="w-5 h-5" />
                <h3 className="font-bold text-base tracking-wider">HALL OF FAME</h3>
              </div>
              <button
                onClick={() => setShowHighScoresModal(false)}
                className="px-3 py-1 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs text-neutral-300"
              >
                SLUITEN
              </button>
            </div>

            {/* Submit High Score if Game Over and not yet submitted */}
            {gameState === 'GAMEOVER' && !hasSubmittedScore && score > 0 && (
              <form onSubmit={handleSubmitScore} className="my-4 p-4 rounded-2xl bg-orange-950/30 border border-orange-500/30">
                <p className="text-xs text-orange-300 font-bold mb-2">NIEUWE SCORE: {score} PUNTEN!</p>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    maxLength={3}
                    value={initials}
                    onChange={(e) => setInitials(e.target.value.toUpperCase())}
                    placeholder="INIT"
                    className="w-24 px-3 py-1.5 rounded-xl bg-neutral-900 border border-neutral-700 text-center font-bold text-white uppercase focus:border-orange-400 outline-none"
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="flex-1 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs"
                  >
                    OPSLAAN
                  </button>
                </div>
              </form>
            )}

            <div className="mt-4 space-y-2 max-h-60 overflow-y-auto">
              {highScores.map((entry, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-neutral-500 font-bold">#{i + 1}</span>
                    <span className="font-bold text-yellow-400">{entry.initials}</span>
                    <span className="text-[10px] text-neutral-400">LVL {entry.levelReached}</span>
                  </div>
                  <span className="font-bold text-white">{entry.score.toLocaleString()} PTS</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* History Modal */}
      {showHistoryModal && (
        <QbertHistoryModal
          isOpen={showHistoryModal}
          onClose={() => setShowHistoryModal(false)}
        />
      )}
    </div>
  );
};
