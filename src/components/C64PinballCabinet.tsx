/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { ArrowLeft, BookOpen, RotateCcw, Volume2, VolumeX, Sparkles, Tv, HelpCircle, Layers, ShieldAlert } from 'lucide-react';
import { C64PinballEngine, PinballState, PinballTableId, PINBALL_TABLES } from '../game/c64PinballEngine';
import { c64PinballAudio } from '../game/c64PinballAudio';
import { getC64PinballScores, saveC64PinballScore, C64PinballScore } from '../game/c64PinballHighScores';
import { Language } from '../i18n/lobbyTranslations';
import { GameControlsModal, useGameControls } from './GameControlsModal';

interface C64PinballCabinetProps {
  onBackToLobby: () => void;
  onOpenHistory: () => void;
  lang: Language;
}

export const C64PinballCabinet: React.FC<C64PinballCabinetProps> = ({
  onBackToLobby,
  onOpenHistory,
  lang
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<C64PinballEngine | null>(null);

  const [selectedTable, setSelectedTable] = useState<PinballTableId>('c64_power');

  const [gameState, setGameState] = useState<PinballState>({
    tableId: 'c64_power',
    score: 0,
    highScore: 185000,
    ballNumber: 1,
    maxBalls: 5,
    multiplier: 1,
    bonusPool: 1000,
    gameOver: false,
    isTilt: false,
    tiltWarnings: 0,
    message: 'PRESS SPACE TO LAUNCH',
    messageTimer: 180,
    plungerCharge: 0,
    isPlungerCharging: false
  });

  const [isMuted, setIsMuted] = useState(false);
  const [crtFilter, setCrtFilter] = useState(true);
  const [highScores, setHighScores] = useState<C64PinballScore[]>([]);
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [playerInitials, setPlayerInitials] = useState('');
  const [finalScore, setFinalScore] = useState(0);
  const { showControls, setShowControls } = useGameControls('c64_pinball');

  // Initialize high scores
  useEffect(() => {
    setHighScores(getC64PinballScores());
  }, []);

  // Initialize Pinball engine
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const scores = getC64PinballScores();
    const topScore = scores.length > 0 ? scores[0].score : 185000;

    const engine = new C64PinballEngine(canvas, topScore, selectedTable);
    engineRef.current = engine;

    engine.onStateChange = (newState) => {
      setGameState(newState);
    };

    engine.onGameOver = (score) => {
      setFinalScore(score);
      const isTop = scores.length < 5 || score > (scores[scores.length - 1]?.score || 0);
      if (isTop && score > 0) {
        setShowScoreModal(true);
      }
    };

    engine.start();

    // Keyboard handlers
    const handleKeyDown = (e: KeyboardEvent) => {
      // Avoid scrolling on space/arrows
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
        e.preventDefault();
      }

      if (e.code === 'ArrowLeft' || e.code === 'KeyZ' || e.code === 'KeyA' || e.code === 'ShiftLeft') {
        engine.setLeftFlipper(true);
      } else if (e.code === 'ArrowRight' || e.code === 'KeyM' || e.code === 'KeyD' || e.code === 'ShiftRight') {
        engine.setRightFlipper(true);
      } else if (e.code === 'Space' || e.code === 'ArrowDown' || e.code === 'Enter') {
        if (!engine.ball.inPlay) {
          engine.startPlunger();
        } else {
          engine.nudge();
        }
      } else if (e.code === 'KeyN') {
        engine.nudge();
      } else if (e.code === 'KeyR') {
        engine.resetGame();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'ArrowLeft' || e.code === 'KeyZ' || e.code === 'KeyA' || e.code === 'ShiftLeft') {
        engine.setLeftFlipper(false);
      } else if (e.code === 'ArrowRight' || e.code === 'KeyM' || e.code === 'KeyD' || e.code === 'ShiftRight') {
        engine.setRightFlipper(false);
      } else if (e.code === 'Space' || e.code === 'ArrowDown' || e.code === 'Enter') {
        engine.releasePlunger();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      engine.stop();
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const handleSelectTable = (tableId: PinballTableId) => {
    setSelectedTable(tableId);
    engineRef.current?.setTable(tableId);
  };

  const handleToggleMute = useCallback(() => {
    const next = !isMuted;
    setIsMuted(next);
    c64PinballAudio.setMuted(next);
  }, [isMuted]);

  const handleRestart = useCallback(() => {
    engineRef.current?.resetGame();
  }, []);

  const handleSaveInitials = useCallback(() => {
    if (!playerInitials.trim()) return;
    const updated = saveC64PinballScore(finalScore, playerInitials, gameState.ballNumber);
    setHighScores(updated);
    setShowScoreModal(false);
  }, [finalScore, playerInitials, gameState.ballNumber]);

  const currentTheme = PINBALL_TABLES[selectedTable];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-950 text-white font-mono p-2 sm:p-4 select-none">
      {/* Top Header Bar */}
      <header className="w-full max-w-4xl flex items-center justify-between gap-3 mb-2 px-2">
        <button
          type="button"
          onClick={onBackToLobby}
          className="px-3.5 py-2 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-cyan-500 text-neutral-200 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer hover:bg-neutral-800 active:scale-95"
        >
          <ArrowLeft className="w-4 h-4 text-cyan-400" />
          <span>{lang === 'nl' ? 'Terug naar Speelhal' : 'Back to Arcade'}</span>
        </button>

        <div className="text-center">
          <h1 className="text-base sm:text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-yellow-300 flex items-center justify-center gap-1.5">
            <span>{currentTheme.name.toUpperCase()}</span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-blue-950 text-cyan-300 border border-blue-700">
              {currentTheme.year}
            </span>
          </h1>
          <p className="text-[11px] text-neutral-400">
            {currentTheme.subtitle}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleToggleMute}
            className={`p-2 rounded-xl border text-xs transition-all cursor-pointer ${
              isMuted
                ? 'bg-neutral-900 border-neutral-800 text-neutral-500'
                : 'bg-blue-950/80 border-blue-500 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.4)]'
            }`}
            title={isMuted ? 'Geluid Aanzetten' : 'Geluid Dempen'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onClick={() => setCrtFilter(!crtFilter)}
            className={`p-2 rounded-xl border text-xs transition-all cursor-pointer ${
              crtFilter
                ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.4)]'
                : 'bg-neutral-900 border-neutral-800 text-neutral-500'
            }`}
            title="CRT Monitor Filter"
          >
            <Tv className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={onOpenHistory}
            className="px-3 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-yellow-400 text-yellow-400 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <BookOpen className="w-4 h-4" />
            <span className="hidden sm:inline">Dossier</span>
          </button>
          <button
            type="button"
            onClick={() => setShowControls(true)}
            className="p-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-cyan-400 text-cyan-400 transition-all cursor-pointer"
            title="Spelbesturing"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Table Selector Bar */}
      <div className="w-full max-w-xl mb-3 flex items-center justify-center gap-1.5 p-1.5 rounded-2xl bg-neutral-900/90 border border-neutral-800">
        <div className="text-[11px] font-bold text-neutral-400 flex items-center gap-1 px-2">
          <Layers className="w-3.5 h-3.5 text-yellow-400" />
          <span className="hidden sm:inline">{lang === 'nl' ? 'Kies Flipperkast:' : 'Select Table:'}</span>
        </div>
        <div className="flex flex-wrap gap-1 flex-1 justify-center sm:justify-end">
          {(Object.keys(PINBALL_TABLES) as PinballTableId[]).map((tabId) => {
            const table = PINBALL_TABLES[tabId];
            const isSelected = selectedTable === tabId;
            return (
              <button
                key={tabId}
                type="button"
                onClick={() => handleSelectTable(tabId)}
                className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-[0_0_10px_rgba(6,182,212,0.5)] border border-cyan-300'
                    : 'bg-neutral-800/80 hover:bg-neutral-750 text-neutral-400 hover:text-white border border-transparent'
                }`}
              >
                {table.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Cabinet & Monitor Area */}
      <div className="relative w-full max-w-[490px] flex flex-col items-center">
        {/* Vintage Commodore / Arcade CRT Outer Bezel */}
        <div className="relative w-full rounded-3xl bg-gradient-to-b from-[#3a2f2b] via-[#2c221e] to-[#1d1614] border-4 border-[#52443d] p-3 sm:p-4 shadow-[0_0_50px_rgba(59,130,246,0.3)]">
          {/* Rainbow stripe & badge */}
          <div className="flex items-center justify-between px-2 pb-2 mb-2 border-b border-white/10">
            <div className="flex items-center gap-2">
              <span className="text-sm font-black tracking-widest text-cyan-300">C= 3D PINBALL POWER</span>
              <div className="flex h-2.5 w-12 rounded overflow-hidden">
                <span className="w-1/4 bg-red-600" />
                <span className="w-1/4 bg-yellow-500" />
                <span className="w-1/4 bg-green-500" />
                <span className="w-1/4 bg-blue-600" />
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-amber-400">
              <span className="inline-block w-2 h-2 rounded-full bg-red-500 animate-ping" />
              <span>{currentTheme.marqueeBadge}</span>
            </div>
          </div>

          {/* Screen Wrapper with CRT Scanline Effect */}
          <div className="relative rounded-2xl overflow-hidden border-2 border-cyan-500/50 bg-[#0c0824] shadow-inner flex justify-center">
            <canvas
              ref={canvasRef}
              className="w-full h-auto max-h-[72vh] object-contain block"
            />

            {/* Optional CRT Scanline Overlay */}
            {crtFilter && (
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.35)_50%)] [background-size:100%_4px] opacity-75" />
            )}
          </div>
        </div>

        {/* Mobile & Desktop Pinball Controls Bar */}
        <div className="w-full mt-3 grid grid-cols-4 gap-2">
          {/* Left Flipper */}
          <button
            type="button"
            onPointerDown={() => engineRef.current?.setLeftFlipper(true)}
            onPointerUp={() => engineRef.current?.setLeftFlipper(false)}
            onPointerLeave={() => engineRef.current?.setLeftFlipper(false)}
            className="py-3.5 px-2 rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-800 hover:from-blue-500 hover:to-indigo-500 active:scale-95 text-white font-black text-xs sm:text-sm border-2 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-transform flex flex-col items-center justify-center cursor-pointer select-none"
          >
            <span>◀ FLIPPER</span>
            <span className="text-[10px] font-normal text-cyan-200">SHIFT / Z / ◀</span>
          </button>

          {/* Nudge / Tilt button */}
          <button
            type="button"
            onClick={() => engineRef.current?.nudge()}
            className="py-3.5 px-2 rounded-2xl bg-neutral-800 hover:bg-neutral-700 active:scale-95 text-amber-300 font-black text-xs border border-amber-500/60 shadow transition-transform flex flex-col items-center justify-center cursor-pointer select-none"
          >
            <span>NUDGE</span>
            <span className="text-[10px] font-normal text-neutral-400">TOETS [N]</span>
          </button>

          {/* Plunger / Spring Launch */}
          <button
            type="button"
            onPointerDown={() => engineRef.current?.startPlunger()}
            onPointerUp={() => engineRef.current?.releasePlunger()}
            onPointerLeave={() => engineRef.current?.releasePlunger()}
            className="py-3.5 px-2 rounded-2xl bg-gradient-to-br from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-yellow-400 active:scale-95 text-black font-black text-xs border-2 border-yellow-300 shadow-[0_0_15px_rgba(234,179,8,0.5)] transition-transform flex flex-col items-center justify-center cursor-pointer select-none"
          >
            <span>LAUNCH</span>
            <span className="text-[10px] font-bold text-neutral-900">SPATIEBALK</span>
          </button>

          {/* Right Flipper */}
          <button
            type="button"
            onPointerDown={() => engineRef.current?.setRightFlipper(true)}
            onPointerUp={() => engineRef.current?.setRightFlipper(false)}
            onPointerLeave={() => engineRef.current?.setRightFlipper(false)}
            className="py-3.5 px-2 rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-800 hover:from-blue-500 hover:to-indigo-500 active:scale-95 text-white font-black text-xs sm:text-sm border-2 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-transform flex flex-col items-center justify-center cursor-pointer select-none"
          >
            <span>FLIPPER ▶</span>
            <span className="text-[10px] font-normal text-cyan-200">SHIFT / M / ▶</span>
          </button>
        </div>

        {/* Quick Tips & Flipper Cradle Guide */}
        <div className="mt-3 w-full p-3 rounded-xl bg-neutral-900/80 border border-neutral-800 text-[11px] text-neutral-300 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
            <span>
              <strong>Tip:</strong> Houd een flipper <strong>omhoog</strong> om de bal zachtjes op te vangen (cradle/trap) en gericht te vuren!
            </span>
          </div>
          <button
            type="button"
            onClick={handleRestart}
            className="px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-[10px] font-bold flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Herstart Spel [R]</span>
          </button>
        </div>
      </div>

      {/* High Score Initials Entry Modal (Clean & Guarded Against Overflow) */}
      {showScoreModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-2xl bg-neutral-900 border-2 border-yellow-400 p-6 space-y-4 shadow-[0_0_40px_rgba(234,179,8,0.5)] text-center">
            <h3 className="text-xl font-black text-yellow-400">
              NIEUWE TOP SCORE!
            </h3>
            <div className="py-2 px-3 rounded-xl bg-black/60 border border-neutral-800">
              <p className="text-2xl sm:text-3xl font-black text-cyan-300 font-mono tracking-wider break-all">
                {finalScore.toLocaleString()}
              </p>
              <span className="text-[10px] text-neutral-500 uppercase tracking-widest">{currentTheme.name}</span>
            </div>
            <p className="text-xs text-neutral-400">
              Voer je 3 initialen in voor de Hall of Fame:
            </p>

            <input
              type="text"
              maxLength={3}
              value={playerInitials}
              onChange={(e) => setPlayerInitials(e.target.value.toUpperCase())}
              placeholder="C64"
              className="w-24 text-center text-2xl font-black font-mono py-2 rounded bg-black border-2 border-cyan-400 text-yellow-300 focus:outline-none uppercase"
              autoFocus
            />

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={handleSaveInitials}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 text-black font-black text-xs cursor-pointer shadow hover:from-yellow-300 hover:to-amber-400 transition-all active:scale-95"
              >
                OPSLAAN
              </button>
              <button
                type="button"
                onClick={() => setShowScoreModal(false)}
                className="px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-bold cursor-pointer transition-all"
              >
                SLUITEN
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Controls Modal */}
      <GameControlsModal
        isOpen={showControls}
        onClose={() => setShowControls(false)}
        gameId="c64_pinball"
      />
    </div>
  );
};
