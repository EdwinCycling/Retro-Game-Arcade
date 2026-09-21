/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  ArrowLeft,
  RotateCcw,
  Volume2,
  VolumeX,
  Tv,
  Trophy,
  Info,
  Smartphone,
  Play,
  Sparkles,
  Compass,
  Zap,
  Shield,
  Crosshair,
  Key
} from 'lucide-react';
import { ExileEngine } from '../game/exileEngine';
import { ExileRenderer } from '../game/exileRenderer';
import { exileAudio } from '../game/exileAudio';
import { getExileHighScores, saveExileHighScore, isExileHighScore } from '../game/exileHighScores';
import { ExileHistoryModal } from './ExileHistoryModal';
import { GameControlsModal, useGameControls } from './GameControlsModal';
import { haptics } from '../utils/haptics';

interface ExileCabinetProps {
  onBackToLobby: () => void;
}

export const ExileCabinet: React.FC<ExileCabinetProps> = ({
  onBackToLobby
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<ExileEngine | null>(null);
  const rendererRef = useRef<ExileRenderer | null>(null);
  const animFrameIdRef = useRef<number | null>(null);

  // UI state
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isVictory, setIsVictory] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [crtEnabled, setCrtEnabled] = useState(true);
  const [isDossierOpen, setIsDossierOpen] = useState(false);
  const [isHighScoreModalOpen, setIsHighScoreModalOpen] = useState(false);
  const [playerInitials, setPlayerInitials] = useState('FINN');

  const { showControls, setShowControls } = useGameControls('exile');

  // Initialize engine and canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const engine = new ExileEngine();
    const renderer = new ExileRenderer(canvas);
    engineRef.current = engine;
    rendererRef.current = renderer;

    engine.setCallbacks((finalScore, victory) => {
      if (victory) {
        setIsVictory(true);
      } else {
        setIsGameOver(true);
      }
      setScore(finalScore);
      if (isExileHighScore(finalScore)) {
        setIsHighScoreModalOpen(true);
      }
    });

    const updateCanvasSize = () => {
      if (!canvas) return;
      const rect = canvas.parentElement?.getBoundingClientRect();
      const parentWidth = rect ? rect.width : 640;
      canvas.width = Math.min(640, parentWidth);
      canvas.height = 400;
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);

    // Main Game Render Loop
    const loop = () => {
      if (engineRef.current && rendererRef.current) {
        engineRef.current.update();
        rendererRef.current.render(engineRef.current);

        // Update HUD sync
        const mike = engineRef.current.state.mike;
        setScore(mike.score);
        setLives(mike.lives);
      }
      animFrameIdRef.current = requestAnimationFrame(loop);
    };

    animFrameIdRef.current = requestAnimationFrame(loop);

    // Keyboard event listeners
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent scrolling for game controls
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
        e.preventDefault();
      }
      engineRef.current?.handleKeyDown(e.code);
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      engineRef.current?.handleKeyUp(e.code);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('resize', updateCanvasSize);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
      exileAudio.stopThrust();
    };
  }, []);

  const handleRestart = useCallback(() => {
    engineRef.current?.resetGame();
    setIsGameOver(false);
    setIsVictory(false);
    setScore(0);
    setLives(3);
    haptics.light();
  }, []);

  const handleToggleMute = useCallback(() => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    exileAudio.setMuted(nextMuted);
    haptics.light();
  }, [isMuted]);

  const handleToggleCRT = useCallback(() => {
    const nextCRT = !crtEnabled;
    setCrtEnabled(nextCRT);
    rendererRef.current?.setCrtEnabled(nextCRT);
    haptics.light();
  }, [crtEnabled]);

  const handleSaveScore = useCallback(() => {
    if (score > 0) {
      saveExileHighScore(playerInitials, score, isVictory);
    }
    setIsHighScoreModalOpen(false);
  }, [score, playerInitials, isVictory]);

  // Touch handlers for mobile
  const handleTouchAction = (action: 'thrust' | 'left' | 'right' | 'fire' | 'grab' | 'teleport' | 'map', pressed: boolean) => {
    if (!engineRef.current) return;
    haptics.light();

    if (action === 'thrust') {
      if (pressed) engineRef.current.handleKeyDown('ArrowUp');
      else engineRef.current.handleKeyUp('ArrowUp');
    } else if (action === 'left') {
      if (pressed) engineRef.current.handleKeyDown('ArrowLeft');
      else engineRef.current.handleKeyUp('ArrowLeft');
    } else if (action === 'right') {
      if (pressed) engineRef.current.handleKeyDown('ArrowRight');
      else engineRef.current.handleKeyUp('ArrowRight');
    } else if (action === 'fire') {
      if (pressed) engineRef.current.handleKeyDown('KeyF');
      else engineRef.current.handleKeyUp('KeyF');
    } else if (action === 'grab') {
      if (pressed) engineRef.current.handleKeyDown('KeyG');
    } else if (action === 'teleport') {
      if (pressed) engineRef.current.handleKeyDown('KeyT');
    } else if (action === 'map') {
      if (pressed) engineRef.current.handleKeyDown('KeyM');
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center justify-center p-2 sm:p-4 select-none">
      
      {/* Top Navigation & Status Bar */}
      <div className="w-full flex items-center justify-between mb-3 px-2">
        <button
          type="button"
          onClick={() => {
            exileAudio.stopThrust();
            onBackToLobby();
          }}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white font-mono text-xs transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Arcade Lobby</span>
        </button>

        <div className="flex items-center gap-2">
          {/* Dossier / History Modal */}
          <button
            type="button"
            onClick={() => setIsDossierOpen(true)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-yellow-950/40 border border-yellow-500/30 text-yellow-400 hover:bg-yellow-900/50 font-mono text-xs transition cursor-pointer"
          >
            <Info className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Exile Dossier</span>
          </button>

          {/* Controls Modal */}
          <button
            type="button"
            onClick={() => setShowControls(true)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-mono text-xs transition cursor-pointer"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Besturing</span>
          </button>

          {/* CRT Scanlines Toggle */}
          <button
            type="button"
            onClick={handleToggleCRT}
            className={`p-1.5 rounded-xl border transition cursor-pointer ${
              crtEnabled
                ? 'bg-cyan-950/50 border-cyan-500/50 text-cyan-400'
                : 'bg-neutral-800 border-neutral-700 text-neutral-400'
            }`}
            title="CRT Monitor Filter"
          >
            <Tv className="w-4 h-4" />
          </button>

          {/* Audio Mute/Unmute */}
          <button
            type="button"
            onClick={handleToggleMute}
            className={`p-1.5 rounded-xl border transition cursor-pointer ${
              isMuted
                ? 'bg-red-950/40 border-red-500/40 text-red-400'
                : 'bg-neutral-800 border-neutral-700 text-neutral-300'
            }`}
            title="Geluid Aan/Uit"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Restart */}
          <button
            type="button"
            onClick={handleRestart}
            className="p-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-mono text-xs transition cursor-pointer"
            title="Herstart Missie"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* BBC Micro Monitor & Bezel */}
      <div className="relative w-full max-w-[660px] bg-neutral-900 border-4 border-neutral-800 rounded-3xl p-3 sm:p-4 shadow-[0_0_50px_rgba(234,179,8,0.2)] flex flex-col items-center">
        
        {/* BBC Micro Header Badge */}
        <div className="w-full flex items-center justify-between pb-2 mb-2 border-b border-neutral-800 px-2 font-mono text-xs">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-red-600 font-black text-[10px] text-white tracking-widest">
              BBC MICRO
            </span>
            <span className="text-yellow-400 font-bold">MODE 5 • 6502 PHYSICS ENGINE</span>
          </div>
          <div className="text-neutral-400 text-[11px]">
            SUPERIOR SOFTWARE (1988)
          </div>
        </div>

        {/* Screen Bezel & Canvas */}
        <div className="relative w-full aspect-[16/10] bg-black rounded-2xl overflow-hidden border-2 border-neutral-700 shadow-inner flex items-center justify-center">
          <canvas
            ref={canvasRef}
            className="w-full h-full object-contain"
          />
        </div>

        {/* Action Buttons Bar below monitor */}
        <div className="w-full mt-3 flex items-center justify-between px-2 text-xs font-mono text-neutral-400">
          <div className="flex items-center gap-2">
            <span className="text-cyan-400 font-bold">W / ↑:</span> Stuwing
            <span className="text-yellow-400 font-bold">F / Ctrl:</span> Vuur
            <span className="text-green-400 font-bold">G:</span> Pak / Gooi
            <span className="text-magenta-400 font-bold">T:</span> Teleport
          </div>
          <div className="flex items-center gap-1.5 text-neutral-300">
            <Trophy className="w-3.5 h-3.5 text-yellow-400" />
            <span>Score: <strong className="text-white">{score}</strong></span>
          </div>
        </div>

      </div>

      {/* On-Screen Mobile Touch Controls (Visible on touch devices / small screens) */}
      <div className="w-full max-w-[660px] mt-4 flex items-center justify-between px-3 md:hidden">
        {/* Left Joystick / D-Pad */}
        <div className="flex flex-col items-center gap-2">
          <button
            type="button"
            onPointerDown={() => handleTouchAction('thrust', true)}
            onPointerUp={() => handleTouchAction('thrust', false)}
            className="w-14 h-14 rounded-2xl bg-neutral-800 active:bg-yellow-600 border border-neutral-600 flex items-center justify-center font-bold text-lg text-yellow-400 shadow-lg"
          >
            ▲
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onPointerDown={() => handleTouchAction('left', true)}
              onPointerUp={() => handleTouchAction('left', false)}
              className="w-14 h-14 rounded-2xl bg-neutral-800 active:bg-yellow-600 border border-neutral-600 flex items-center justify-center font-bold text-lg text-yellow-400 shadow-lg"
            >
              ◀
            </button>
            <button
              type="button"
              onPointerDown={() => handleTouchAction('right', true)}
              onPointerUp={() => handleTouchAction('right', false)}
              className="w-14 h-14 rounded-2xl bg-neutral-800 active:bg-yellow-600 border border-neutral-600 flex items-center justify-center font-bold text-lg text-yellow-400 shadow-lg"
            >
              ▶
            </button>
          </div>
        </div>

        {/* Right Action Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onPointerDown={() => handleTouchAction('fire', true)}
            onPointerUp={() => handleTouchAction('fire', false)}
            className="w-14 h-14 rounded-2xl bg-red-700 active:bg-red-500 border border-red-400 font-mono font-bold text-xs text-white shadow-lg flex items-center justify-center"
          >
            FIRE
          </button>

          <button
            type="button"
            onPointerDown={() => handleTouchAction('thrust', true)}
            onPointerUp={() => handleTouchAction('thrust', false)}
            className="w-14 h-14 rounded-2xl bg-yellow-600 active:bg-yellow-400 border border-yellow-300 font-mono font-bold text-xs text-black shadow-lg flex items-center justify-center"
          >
            JET
          </button>

          <button
            type="button"
            onPointerDown={() => handleTouchAction('grab', true)}
            className="w-14 h-14 rounded-2xl bg-green-700 active:bg-green-500 border border-green-400 font-mono font-bold text-xs text-white shadow-lg flex items-center justify-center"
          >
            GRAB
          </button>

          <button
            type="button"
            onPointerDown={() => handleTouchAction('teleport', true)}
            className="w-14 h-14 rounded-2xl bg-cyan-700 active:bg-cyan-500 border border-cyan-400 font-mono font-bold text-xs text-white shadow-lg flex items-center justify-center"
          >
            WARP
          </button>
        </div>
      </div>

      {/* History Dossier Modal */}
      <ExileHistoryModal
        isOpen={isDossierOpen}
        onClose={() => setIsDossierOpen(false)}
        onPlay={() => {
          setIsDossierOpen(false);
          handleRestart();
        }}
      />

      {/* Controls Modal */}
      <GameControlsModal
        gameId="exile"
        isOpen={showControls}
        onClose={() => setShowControls(false)}
      />

      {/* High Score Registration Modal */}
      {isHighScoreModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm bg-neutral-900 border-2 border-yellow-500 rounded-3xl p-6 shadow-2xl text-center font-mono">
            <h3 className="text-lg font-bold text-yellow-400 mb-2">
              🏆 NIEUWE HIGH SCORE!
            </h3>
            <p className="text-xs text-neutral-300 mb-4">
              Je hebt <strong className="text-white">{score}</strong> punten behaald op Planeet Phoebus!
            </p>

            <div className="my-4">
              <label className="text-xs text-neutral-400 block mb-1">VOER JE INITIALEN IN:</label>
              <input
                type="text"
                maxLength={4}
                value={playerInitials}
                onChange={(e) => setPlayerInitials(e.target.value.toUpperCase())}
                className="w-32 text-center text-2xl font-bold bg-neutral-800 border-2 border-yellow-500 rounded-xl py-1 text-yellow-400 tracking-widest uppercase focus:outline-none"
              />
            </div>

            <button
              type="button"
              onClick={handleSaveScore}
              className="w-full py-2.5 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-black font-bold text-sm transition cursor-pointer shadow-lg"
            >
              OPSLAAN IN LEADERBOARD
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
