/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * FRAK! Arcade Cabinet Component (BBC Micro 1984 - Nick Pelling / Aardvark Software)
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
  Disc,
  ArrowUpDown,
} from 'lucide-react';
import { CANVAS_HEIGHT, CANVAS_WIDTH } from '../game/frakLevels';
import { FrakEngine } from '../game/frakEngine';
import { FrakRenderer } from '../game/frakRenderer';
import { frakAudio } from '../game/frakAudio';
import { getFrakHighScores, saveFrakHighScore } from '../game/frakHighScores';
import { FrakHistoryModal } from './FrakHistoryModal';
import { GameControlsModal, useGameControls } from './GameControlsModal';
import { haptics } from '../utils/haptics';

interface FrakCabinetProps {
  onBackToLobby: () => void;
}

export const FrakCabinet: React.FC<FrakCabinetProps> = ({ onBackToLobby }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<FrakEngine | null>(null);
  const rendererRef = useRef<FrakRenderer | null>(null);

  // Synced state
  const [score, setScore] = useState(0);
  const [levelIndex, setLevelIndex] = useState(0);
  const [lives, setLives] = useState(5);
  const [timeRemaining, setTimeRemaining] = useState(120);
  const [keysCollected, setKeysCollected] = useState(0);
  const [gameState, setGameState] = useState<string>('TITLE');
  const [isUpsideDown, setIsUpsideDown] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [enableCRT, setEnableCRT] = useState(true);
  const [showTouchControls, setShowTouchControls] = useState(() => {
    return (
      typeof window !== 'undefined' &&
      ('ontouchstart' in window || navigator.maxTouchPoints > 0 || window.innerWidth < 1024)
    );
  });
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const { showControls, setShowControls } = useGameControls('frak');
  const [showHighScoresModal, setShowHighScoresModal] = useState(false);
  const [highScores, setHighScores] = useState(getFrakHighScores());
  const [initials, setInitials] = useState('');
  const [hasSubmittedScore, setHasSubmittedScore] = useState(false);

  // Initialize Engine and Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    const engine = new FrakEngine();
    const renderer = new FrakRenderer(ctx);
    renderer.enableCRT = enableCRT;

    engineRef.current = engine;
    rendererRef.current = renderer;

    const scores = getFrakHighScores();
    setHighScores(scores);
    if (scores.length > 0) {
      engine.highScore = scores[0].score;
    }

    const unsubscribe = engine.subscribe(() => {
      setScore(engine.score);
      setLevelIndex(engine.currentLevelIndex);
      setLives(engine.lives);
      setTimeRemaining(engine.timeRemaining);
      setKeysCollected(engine.keys.filter((k) => k.collected).length);
      setGameState(engine.state);
      setIsUpsideDown(engine.isUpsideDown);
    });

    let animationFrameId: number;

    const loop = () => {
      engine.update();
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
    const muted = frakAudio.toggleMute();
    setIsMuted(muted);
    haptics.light();
  };

  // CRT Toggle
  const toggleCRT = () => {
    const newVal = !enableCRT;
    setEnableCRT(newVal);
    if (rendererRef.current) {
      rendererRef.current.enableCRT = newVal;
    }
    haptics.light();
  };

  // Upside Down Mode Toggle (Frak's legendary feature!)
  const toggleUpsideDown = () => {
    if (engineRef.current) {
      engineRef.current.toggleUpsideDown();
      haptics.selection();
    }
  };

  // Restart / New Game
  const handleRestart = () => {
    if (engineRef.current) {
      engineRef.current.startNewGame();
      setHasSubmittedScore(false);
      haptics.powerPellet();
    }
  };

  // High Score Submission
  const handleSubmitScore = (e: React.FormEvent) => {
    e.preventDefault();
    if (!initials.trim() || hasSubmittedScore) return;

    const updated = saveFrakHighScore(initials, score, levelIndex + 1);
    setHighScores(updated);
    setHasSubmittedScore(true);
    haptics.key();
  };

  return (
    <div className="relative w-full min-h-screen bg-black text-white flex flex-col items-center justify-between p-2 sm:p-4 select-none font-sans overflow-x-hidden">
      {/* Top Header Marquee */}
      <header className="w-full max-w-4xl flex items-center justify-between py-2 px-3 sm:px-5 bg-neutral-900/90 border border-neutral-800 rounded-2xl backdrop-blur shadow-2xl mb-2 sm:mb-4">
        <div className="flex items-center gap-2 sm:gap-4">
          <button
            type="button"
            onClick={onBackToLobby}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs sm:text-sm font-mono border border-neutral-700 transition cursor-pointer active:scale-95"
          >
            <ArrowLeft className="w-4 h-4 text-cyan-400" />
            <span className="hidden sm:inline">Lobby</span>
          </button>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-lg font-black font-mono tracking-tight text-white flex items-center gap-1.5">
                <span className="text-rose-500">FRAK!</span>
                <span className="text-yellow-400 text-xs px-2 py-0.5 rounded bg-yellow-950/60 border border-yellow-800">
                  BBC MICRO
                </span>
              </h1>
              {isUpsideDown && (
                <span className="px-1.5 py-0.5 text-[10px] font-black bg-rose-600 text-white rounded animate-pulse">
                  UPSIDE-DOWN
                </span>
              )}
            </div>
            <p className="text-[11px] text-neutral-400 font-mono hidden sm:block">
              Aardvark Software 1984 • Nick Pelling
            </p>
          </div>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={toggleUpsideDown}
            className={`p-2 rounded-xl text-xs font-mono transition flex items-center gap-1 cursor-pointer active:scale-95 ${
              isUpsideDown
                ? 'bg-rose-950 text-rose-300 border border-rose-600'
                : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-neutral-700'
            }`}
            title="Kop-op-de-kop Modus (Authentieke 1984 Challenge)"
          >
            <ArrowUpDown className="w-4 h-4 text-rose-400" />
            <span className="hidden md:inline">180° Flip</span>
          </button>

          <button
            type="button"
            onClick={() => setShowControls(true)}
            className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-yellow-400 text-xs font-mono border border-neutral-700 hover:border-yellow-400 transition cursor-pointer active:scale-95"
            title="Besturing & Xbox Controller"
          >
            <Disc className="w-4 h-4 text-yellow-400" />
          </button>

          <button
            type="button"
            onClick={() => setShowHistoryModal(true)}
            className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-mono border border-neutral-700 transition cursor-pointer active:scale-95"
            title="Historisch Dossier & Trivia"
          >
            <BookOpen className="w-4 h-4 text-yellow-400" />
          </button>

          <button
            type="button"
            onClick={() => setShowHighScoresModal(true)}
            className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-mono border border-neutral-700 transition cursor-pointer active:scale-95"
            title="High Scores"
          >
            <Trophy className="w-4 h-4 text-amber-400" />
          </button>

          <button
            type="button"
            onClick={toggleCRT}
            className={`p-2 rounded-xl text-xs font-mono border transition cursor-pointer active:scale-95 ${
              enableCRT
                ? 'bg-cyan-950 text-cyan-300 border-cyan-700'
                : 'bg-neutral-800 text-neutral-400 border-neutral-700'
            }`}
            title="CRT Scanlines Filter"
          >
            <Tv className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={toggleMute}
            className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-mono border border-neutral-700 transition cursor-pointer active:scale-95"
            title="Geluid Aan/Uit"
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4 text-rose-400" />
            ) : (
              <Volume2 className="w-4 h-4 text-emerald-400" />
            )}
          </button>

          <button
            type="button"
            onClick={handleRestart}
            className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-mono border border-neutral-700 transition cursor-pointer active:scale-95"
            title="Herstarten"
          >
            <RotateCcw className="w-4 h-4 text-cyan-400" />
          </button>
        </div>
      </header>

      {/* Main Arcade Cabinet Housing */}
      <div className="relative w-full max-w-4xl flex flex-col items-center">
        <div className="relative w-full aspect-[512/400] max-h-[72vh] bg-black rounded-3xl border-4 border-neutral-800 shadow-[0_0_60px_rgba(239,68,68,0.2)] overflow-hidden flex items-center justify-center">
          <canvas
            ref={canvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            className="w-full h-full object-contain cursor-crosshair"
          />

          {/* Interactive Start Overlay on Title Screen */}
          {gameState === 'TITLE' && (
            <div className="absolute inset-0 flex flex-col items-center justify-end pb-8 pointer-events-auto bg-black/40 backdrop-blur-[2px]">
              <button
                type="button"
                onClick={handleRestart}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-rose-600 via-yellow-500 to-amber-500 hover:from-rose-500 hover:to-amber-400 text-black font-black font-mono text-sm tracking-wider shadow-[0_0_30px_rgba(239,68,68,0.6)] transform transition active:scale-95 cursor-pointer flex items-center gap-2 border-2 border-yellow-300"
              >
                <Disc className="w-5 h-5 text-black animate-spin" />
                <span>START SPEL (SPATIE)</span>
              </button>
            </div>
          )}

          {/* Game Over Score Submission Modal */}
          {gameState === 'GAME_OVER' && (
            <div className="absolute inset-0 bg-black/85 backdrop-blur flex flex-col items-center justify-center p-6 text-center z-20">
              <h2 className="text-3xl sm:text-4xl font-black font-mono text-rose-500 mb-1 tracking-tight">
                GAME OVER!
              </h2>
              <p className="text-xs sm:text-sm text-neutral-300 font-mono mb-4">
                Trogg riep luidkeels: <strong>"FRAK!"</strong>
              </p>

              <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 max-w-sm w-full mb-4 shadow-xl">
                <div className="text-xs text-neutral-400 font-mono mb-1">BEHAALDE SCORE</div>
                <div className="text-2xl sm:text-3xl font-black font-mono text-yellow-400">
                  {score.toLocaleString()}
                </div>
                <div className="text-[11px] text-cyan-400 font-mono mt-1">
                  Bereikte Zone: {levelIndex + 1}
                </div>

                {!hasSubmittedScore ? (
                  <form onSubmit={handleSubmitScore} className="mt-4 flex gap-2">
                    <input
                      type="text"
                      maxLength={3}
                      value={initials}
                      onChange={(e) => setInitials(e.target.value.toUpperCase())}
                      placeholder="AAA"
                      className="w-24 px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-700 text-center text-lg font-black font-mono tracking-widest text-yellow-300 focus:outline-none focus:border-yellow-500"
                    />
                    <button
                      type="submit"
                      disabled={!initials.trim()}
                      className="flex-1 py-2 px-4 rounded-xl bg-yellow-500 hover:bg-yellow-400 disabled:opacity-50 text-black font-bold font-mono text-xs cursor-pointer active:scale-95 transition"
                    >
                      OPSLAAN
                    </button>
                  </form>
                ) : (
                  <div className="mt-3 text-xs font-mono text-emerald-400 font-bold">
                    Score opgeslagen in Hall of Fame!
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowHighScoresModal(true)}
                  className="px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-mono border border-neutral-700 transition active:scale-95"
                >
                  Bekijk Hall of Fame
                </button>
                <button
                  type="button"
                  onClick={handleRestart}
                  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black font-mono text-xs tracking-wider shadow-[0_0_20px_rgba(239,68,68,0.5)] transition active:scale-95"
                >
                  OPNIEUW SPELEN
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Live Cabinet Status Bar */}
        <div className="w-full mt-2 sm:mt-3 px-4 py-2 bg-neutral-900/80 border border-neutral-800/80 rounded-2xl flex flex-wrap items-center justify-between text-xs font-mono gap-2 shadow-lg">
          <div className="flex items-center gap-2">
            <span className="text-neutral-400 text-[11px]">ZONE KEUZE:</span>
            {[
              { idx: 0, name: '1: F-R-A-K' },
              { idx: 1, name: '2: Vlotten' },
              { idx: 2, name: '3: Lift Abyss' },
            ].map((z) => (
              <button
                key={z.idx}
                type="button"
                onClick={() => {
                  engineRef.current?.selectZone(z.idx);
                  haptics.selection();
                }}
                className={`px-2 py-0.5 rounded-lg text-[11px] font-mono transition cursor-pointer active:scale-95 ${
                  levelIndex === z.idx
                    ? 'bg-cyan-500 text-black font-bold shadow-[0_0_10px_rgba(6,182,212,0.6)]'
                    : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700 hover:text-white border border-neutral-700'
                }`}
              >
                {z.name}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <span className="text-neutral-400">
              Sleutels: <strong className="text-yellow-400">{keysCollected}/3</strong>
            </span>
            <span className="text-neutral-500">•</span>
            <span className="text-neutral-400">
              Tijd: <strong className={timeRemaining < 20 ? 'text-rose-400 animate-pulse' : 'text-cyan-300'}>{timeRemaining}s</strong>
            </span>
            <span className="text-neutral-500">•</span>
            <span className="text-neutral-400">
              Levens: <strong className="text-rose-400">{'🪓'.repeat(Math.max(0, lives))}</strong>
            </span>
          </div>

          <button
            type="button"
            onClick={() => setShowTouchControls(!showTouchControls)}
            className="flex items-center gap-1 text-[11px] text-neutral-400 hover:text-cyan-300 cursor-pointer transition ml-auto"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>{showTouchControls ? 'Verberg Knoppen' : 'Toon Touch Knoppen'}</span>
          </button>
        </div>

        {/* Touch Controls for Mobile & Tablet */}
        {showTouchControls && (
          <div className="w-full mt-3 p-3 bg-neutral-950/90 border border-neutral-800 rounded-2xl flex items-center justify-between gap-4 max-w-xl shadow-2xl">
            {/* Direction D-Pad */}
            <div className="grid grid-cols-3 gap-1.5 w-36 h-36">
              <div />
              <button
                type="button"
                onPointerDown={() => engineRef.current?.handleKeyDown('ArrowUp')}
                onPointerUp={() => engineRef.current?.handleKeyUp('ArrowUp')}
                className="w-11 h-11 rounded-xl bg-neutral-800 active:bg-cyan-600 flex items-center justify-center text-cyan-300 border border-neutral-700 active:scale-90 select-none cursor-pointer"
                title="Klim Omhoog"
              >
                <ArrowUp className="w-5 h-5" />
              </button>
              <div />

              <button
                type="button"
                onPointerDown={() => engineRef.current?.handleKeyDown('ArrowLeft')}
                onPointerUp={() => engineRef.current?.handleKeyUp('ArrowLeft')}
                className="w-11 h-11 rounded-xl bg-neutral-800 active:bg-cyan-600 flex items-center justify-center text-cyan-300 border border-neutral-700 active:scale-90 select-none cursor-pointer"
                title="Links"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onPointerDown={() => engineRef.current?.handleKeyDown('ArrowDown')}
                onPointerUp={() => engineRef.current?.handleKeyUp('ArrowDown')}
                className="w-11 h-11 rounded-xl bg-neutral-800 active:bg-cyan-600 flex items-center justify-center text-cyan-300 border border-neutral-700 active:scale-90 select-none cursor-pointer"
                title="Klim Omlaag"
              >
                <ArrowDown className="w-5 h-5" />
              </button>
              <button
                type="button"
                onPointerDown={() => engineRef.current?.handleKeyDown('ArrowRight')}
                onPointerUp={() => engineRef.current?.handleKeyUp('ArrowRight')}
                className="w-11 h-11 rounded-xl bg-neutral-800 active:bg-cyan-600 flex items-center justify-center text-cyan-300 border border-neutral-700 active:scale-90 select-none cursor-pointer"
                title="Rechts"
              >
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>

            {/* Action Buttons: Jump & Yo-Yo */}
            <div className="flex items-center gap-3">
              {/* Jump Button */}
              <button
                type="button"
                onPointerDown={() => {
                  engineRef.current?.handleKeyDown('j');
                  haptics.light();
                }}
                onPointerUp={() => engineRef.current?.handleKeyUp('j')}
                className="w-16 h-16 rounded-2xl bg-cyan-600 active:bg-cyan-500 text-black font-black font-mono text-xs flex flex-col items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.5)] border-2 border-cyan-300 active:scale-95 cursor-pointer"
              >
                <ArrowUp className="w-5 h-5" />
                <span>SPRONG</span>
              </button>

              {/* Yo-Yo Fire Button */}
              <button
                type="button"
                onPointerDown={() => {
                  engineRef.current?.handleKeyDown(' ');
                  haptics.powerPellet();
                }}
                onPointerUp={() => engineRef.current?.handleKeyUp(' ')}
                className="w-18 h-18 rounded-2xl bg-gradient-to-br from-rose-600 to-red-500 active:from-rose-500 active:to-red-400 text-white font-black font-mono text-xs flex flex-col items-center justify-center shadow-[0_0_20px_rgba(239,68,68,0.6)] border-2 border-rose-300 active:scale-95 cursor-pointer"
              >
                <Disc className="w-6 h-6 animate-spin" />
                <span>YO-YO</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* High Scores Modal */}
      {showHighScoresModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-400" />
                <h3 className="text-lg font-black font-mono text-white">FRAK! HALL OF FAME</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowHighScoresModal(false)}
                className="text-neutral-400 hover:text-white font-mono text-sm px-2 py-1 rounded bg-neutral-800"
              >
                Sluiten
              </button>
            </div>

            <div className="space-y-2 font-mono">
              {highScores.map((entry, idx) => (
                <div
                  key={`${entry.initials}-${idx}`}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-950 border border-neutral-800/80 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-5 font-bold ${idx === 0 ? 'text-amber-400' : 'text-neutral-500'}`}>
                      #{idx + 1}
                    </span>
                    <span className="font-black text-yellow-300 tracking-wider">
                      {entry.initials}
                    </span>
                    <span className="text-[10px] text-neutral-500">Zone {entry.level}</span>
                  </div>
                  <span className="font-bold text-cyan-300">{entry.score.toLocaleString()} PTS</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Historical Dossier Modal */}
      <FrakHistoryModal
        isOpen={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
        onPlay={handleRestart}
      />

      {/* Game Controls & Xbox Controller Modal */}
      <GameControlsModal
        isOpen={showControls}
        onClose={() => setShowControls(false)}
        gameId="frak"
      />
    </div>
  );
};
