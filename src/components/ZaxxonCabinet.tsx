/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Sega Zaxxon (1982) Arcade Cabinet Component
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { ArrowLeft, Volume2, VolumeX, RotateCcw, Pause, Play, Trophy, Sliders, BookOpen, Compass, Shield, Zap, Sparkles } from 'lucide-react';
import { ZaxxonEngine, ZaxxonSettings } from '../game/zaxxonEngine';
import { ZaxxonRenderer } from '../game/zaxxonRenderer';
import { zaxxonAudio } from '../game/zaxxonAudio';
import { getZaxxonScores, addZaxxonScore, isZaxxonHighScore, ZaxxonScore } from '../game/zaxxonHighScores';
import { ZaxxonHistoryModal } from './ZaxxonHistoryModal';
import { ZaxxonLandingPage } from './ZaxxonLandingPage';
import { haptics } from '../utils/haptics';

interface ZaxxonCabinetProps {
  onBackToLobby: () => void;
  initialShowLanding?: boolean;
}

export const ZaxxonCabinet: React.FC<ZaxxonCabinetProps> = ({ onBackToLobby, initialShowLanding = false }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<ZaxxonEngine | null>(null);
  const rendererRef = useRef<ZaxxonRenderer | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const [showLandingPage, setShowLandingPage] = useState(initialShowLanding);
  const [isMuted, setIsMuted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isDossierOpen, setIsDossierOpen] = useState(false);
  const [isHighScoresOpen, setIsHighScoresOpen] = useState(false);
  const [highScores, setHighScores] = useState<ZaxxonScore[]>([]);

  // High score entry modal
  const [showInitialsModal, setShowInitialsModal] = useState(false);
  const [initials, setInitials] = useState('ZAX');
  const [pendingScore, setPendingScore] = useState(0);
  const [pendingRound, setPendingRound] = useState(1);

  // Settings & Trainer
  const [settings, setSettings] = useState<ZaxxonSettings>({
    invertFlightStick: false,
    scanlines: true,
    infiniteFuel: false,
    godMode: false,
  });
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);

  // Initialize engine and renderer
  useEffect(() => {
    const engine = new ZaxxonEngine(800, 600);
    const topScores = getZaxxonScores();
    setHighScores(topScores);
    engine.highScore = topScores.length > 0 ? topScores[0].score : 88400;
    engine.resetGame();
    engineRef.current = engine;

    if (canvasRef.current) {
      rendererRef.current = new ZaxxonRenderer(canvasRef.current);
    }

    // Main Game Loop (~60 FPS)
    const loop = () => {
      if (engineRef.current && rendererRef.current) {
        engineRef.current.settings = settings;
        engineRef.current.update();
        rendererRef.current.render(engineRef.current);

        // Check high score qualification on game over
        if (engineRef.current.isGameOver && !showInitialsModal && engineRef.current.score > 0) {
          if (isZaxxonHighScore(engineRef.current.score)) {
            setPendingScore(engineRef.current.score);
            setPendingRound(engineRef.current.round);
            setShowInitialsModal(true);
            haptics.success();
          }
        }
      }
      animationFrameRef.current = requestAnimationFrame(loop);
    };

    animationFrameRef.current = requestAnimationFrame(loop);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      zaxxonAudio.stopEngine();
      zaxxonAudio.stopLowFuelSiren();
    };
  }, []);

  // Sync settings with engine
  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.settings = settings;
    }
  }, [settings]);

  // Keyboard Event Handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent default page scroll on arrow keys / space
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
        e.preventDefault();
      }

      if (e.code === 'KeyP') {
        togglePause();
        return;
      }
      if (e.code === 'KeyM') {
        toggleMute();
        return;
      }

      if (engineRef.current) {
        engineRef.current.keys[e.code] = true;
        if (e.code === 'Space' || e.code === 'KeyK') {
          engineRef.current.fireBullet();
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (engineRef.current) {
        engineRef.current.keys[e.code] = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const toggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    zaxxonAudio.setMuted(next);
    haptics.selection();
  };

  const togglePause = () => {
    if (!engineRef.current) return;
    const next = !isPaused;
    setIsPaused(next);
    engineRef.current.isPaused = next;
    haptics.selection();
  };

  const restartGame = () => {
    if (!engineRef.current) return;
    engineRef.current.resetGame();
    setIsPaused(false);
    setShowInitialsModal(false);
    haptics.selection();
  };

  const handleSaveInitials = () => {
    const updated = addZaxxonScore(pendingScore, pendingRound, initials);
    setHighScores(updated);
    if (engineRef.current) {
      engineRef.current.highScore = updated[0].score;
    }
    setShowInitialsModal(false);
    setIsHighScoresOpen(true);
    haptics.success();
  };

  // Virtual control button helpers for mobile/touch
  const setTouchKey = (code: string, isPressed: boolean) => {
    if (engineRef.current) {
      engineRef.current.keys[code] = isPressed;
      if (isPressed && (code === 'Space' || code === 'KeyK')) {
        engineRef.current.fireBullet();
      }
    }
  };

  if (showLandingPage) {
    return (
      <ZaxxonLandingPage
        onPlay={() => {
          setShowLandingPage(false);
          restartGame();
        }}
        onBackToLobby={onBackToLobby}
      />
    );
  }

  return (
    <div className="relative flex flex-col items-center justify-between min-h-screen w-full bg-neutral-950 text-white font-mono select-none overflow-x-hidden p-2 sm:p-4">
      {/* Top Header Marquee & Control Bar */}
      <header className="w-full max-w-5xl flex flex-wrap items-center justify-between gap-3 p-3 sm:p-4 rounded-2xl bg-neutral-900/90 border-2 border-blue-500/80 shadow-[0_0_30px_rgba(37,99,235,0.35)] backdrop-blur-md z-20">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              zaxxonAudio.stopEngine();
              zaxxonAudio.stopLowFuelSiren();
              onBackToLobby();
            }}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 hover:text-white border border-neutral-700 transition cursor-pointer active:scale-95 text-xs font-bold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Lobby</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-blue-500 animate-pulse shadow-[0_0_10px_#3b82f6]" />
            <h1 className="text-base sm:text-xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-white">
              ZAXXON (1982)
            </h1>
            <span className="hidden md:inline px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-600 text-white">
              SEGA
            </span>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleMute}
            className="p-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white border border-neutral-700 transition cursor-pointer"
            title={isMuted ? 'Geluid Aanzetten' : 'Geluid Dempen'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
          </button>

          <button
            type="button"
            onClick={togglePause}
            className="p-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white border border-neutral-700 transition cursor-pointer"
            title={isPaused ? 'Hervatten' : 'Pauzeren'}
          >
            {isPaused ? <Play className="w-4 h-4 text-green-400" /> : <Pause className="w-4 h-4 text-yellow-400" />}
          </button>

          <button
            type="button"
            onClick={restartGame}
            className="p-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white border border-neutral-700 transition cursor-pointer"
            title="Spel Herstarten"
          >
            <RotateCcw className="w-4 h-4 text-blue-400" />
          </button>

          <button
            type="button"
            onClick={() => setShowSettingsMenu(!showSettingsMenu)}
            className={`p-2.5 rounded-xl border transition cursor-pointer ${
              showSettingsMenu
                ? 'bg-blue-600 text-white border-blue-400'
                : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white border-neutral-700'
            }`}
            title="Trainer & Instellingen"
          >
            <Sliders className="w-4 h-4 text-cyan-400" />
          </button>

          <button
            type="button"
            onClick={() => setIsHighScoresOpen(true)}
            className="p-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white border border-neutral-700 transition cursor-pointer"
            title="High Scores"
          >
            <Trophy className="w-4 h-4 text-yellow-400" />
          </button>

          <button
            type="button"
            onClick={() => setIsDossierOpen(true)}
            className="p-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white border border-neutral-700 transition cursor-pointer"
            title="Dossier & Geschiedenis"
          >
            <BookOpen className="w-4 h-4 text-amber-400" />
          </button>

          <button
            type="button"
            onClick={() => setShowLandingPage(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 hover:text-white border border-blue-500/50 transition cursor-pointer text-xs font-bold"
            title="Open Zaxxon Landing Page & Flight Academy"
          >
            <span>🚀</span>
            <span className="hidden sm:inline">Landing Page</span>
          </button>
        </div>
      </header>

      {/* Settings / Trainer Drawer */}
      {showSettingsMenu && (
        <div className="w-full max-w-5xl my-2 p-4 rounded-2xl bg-neutral-900 border border-blue-500/50 shadow-xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs z-20">
          <label className="flex items-center justify-between p-2 rounded-xl bg-black/50 border border-neutral-800 cursor-pointer">
            <span className="text-neutral-300 flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-blue-400" />
              <span>Invert Flight Stick</span>
            </span>
            <input
              type="checkbox"
              checked={settings.invertFlightStick}
              onChange={(e) => setSettings({ ...settings, invertFlightStick: e.target.checked })}
              className="accent-blue-500 w-4 h-4"
            />
          </label>

          <label className="flex items-center justify-between p-2 rounded-xl bg-black/50 border border-neutral-800 cursor-pointer">
            <span className="text-neutral-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>CRT Scanlines</span>
            </span>
            <input
              type="checkbox"
              checked={settings.scanlines}
              onChange={(e) => setSettings({ ...settings, scanlines: e.target.checked })}
              className="accent-blue-500 w-4 h-4"
            />
          </label>

          <label className="flex items-center justify-between p-2 rounded-xl bg-black/50 border border-neutral-800 cursor-pointer">
            <span className="text-neutral-300 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-yellow-400" />
              <span>Onbeperkte Brandstof</span>
            </span>
            <input
              type="checkbox"
              checked={settings.infiniteFuel}
              onChange={(e) => setSettings({ ...settings, infiniteFuel: e.target.checked })}
              className="accent-blue-500 w-4 h-4"
            />
          </label>

          <label className="flex items-center justify-between p-2 rounded-xl bg-black/50 border border-neutral-800 cursor-pointer">
            <span className="text-neutral-300 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-green-400" />
              <span>God Mode (Onkwetsbaar)</span>
            </span>
            <input
              type="checkbox"
              checked={settings.godMode}
              onChange={(e) => setSettings({ ...settings, godMode: e.target.checked })}
              className="accent-blue-500 w-4 h-4"
            />
          </label>
        </div>
      )}

      {/* Main Arcade Bezel & Game Screen Container */}
      <main className="relative flex-1 flex items-center justify-center w-full my-2">
        <div className="relative rounded-3xl p-3 sm:p-5 bg-gradient-to-b from-neutral-800 via-neutral-900 to-black border-4 border-neutral-700/80 shadow-[0_0_60px_rgba(37,99,235,0.3)] max-w-4xl w-full flex flex-col items-center">
          {/* Authentic Top Bezel Badge */}
          <div className="w-full flex justify-between items-center px-4 pb-2 text-[10px] text-neutral-400 tracking-widest border-b border-neutral-800">
            <span className="text-blue-400 font-bold">SEGA ENTERPRISES, INC. 1982</span>
            <span>AXONOMETRIC 3D RADAR SYSTEM</span>
            <span className="text-amber-400 font-bold">INSERT COIN [1 COIN 1 PLAY]</span>
          </div>

          {/* CRT Screen Display */}
          <div className="relative w-full aspect-[4/3] max-w-[800px] rounded-2xl overflow-hidden bg-black border-2 border-neutral-800 shadow-inner my-2">
            <canvas
              ref={canvasRef}
              width={800}
              height={600}
              className="w-full h-full object-contain block"
            />

            {/* CRT Glass Curvature Glare Effect */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 pointer-events-none rounded-2xl" />
          </div>

          {/* Control Guide Bar below screen */}
          <div className="w-full flex flex-wrap justify-between items-center pt-2 px-3 text-[11px] text-neutral-400 border-t border-neutral-800">
            <div className="flex items-center gap-2">
              <span className="px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-200 border border-neutral-700">← → / A D</span>
              <span>Sturen</span>
              <span className="px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-200 border border-neutral-700">↑ ↓ / W S</span>
              <span>Stijgen / Dalen (Hoogte)</span>
            </div>
            <div className="flex items-center gap-2 mt-1 sm:mt-0">
              <span className="px-2 py-0.5 rounded bg-blue-600/80 text-white font-bold border border-blue-400">SPATIE</span>
              <span>Twin Lasers Vuren</span>
              <span className="px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-200 border border-neutral-700">P</span>
              <span>Pauze</span>
            </div>
          </div>
        </div>
      </main>

      {/* On-Screen Mobile Touch Controls (shown on smaller screens) */}
      <footer className="w-full max-w-4xl grid grid-cols-2 gap-3 p-2 sm:hidden z-20">
        {/* Directional D-Pad for Lateral & Altitude */}
        <div className="grid grid-cols-3 grid-rows-3 gap-1.5 p-2 bg-neutral-900/80 rounded-2xl border border-neutral-800">
          <div />
          <button
            type="button"
            onTouchStart={() => setTouchKey('ArrowUp', true)}
            onTouchEnd={() => setTouchKey('ArrowUp', false)}
            onMouseDown={() => setTouchKey('ArrowUp', true)}
            onMouseUp={() => setTouchKey('ArrowUp', false)}
            className="p-3 bg-neutral-800 active:bg-blue-600 rounded-xl flex items-center justify-center text-white text-xs font-bold"
          >
            ↑
          </button>
          <div />
          <button
            type="button"
            onTouchStart={() => setTouchKey('ArrowLeft', true)}
            onTouchEnd={() => setTouchKey('ArrowLeft', false)}
            onMouseDown={() => setTouchKey('ArrowLeft', true)}
            onMouseUp={() => setTouchKey('ArrowLeft', false)}
            className="p-3 bg-neutral-800 active:bg-blue-600 rounded-xl flex items-center justify-center text-white text-xs font-bold"
          >
            ←
          </button>
          <button
            type="button"
            onTouchStart={() => setTouchKey('ArrowDown', true)}
            onTouchEnd={() => setTouchKey('ArrowDown', false)}
            onMouseDown={() => setTouchKey('ArrowDown', true)}
            onMouseUp={() => setTouchKey('ArrowDown', false)}
            className="p-3 bg-neutral-800 active:bg-blue-600 rounded-xl flex items-center justify-center text-white text-xs font-bold"
          >
            ↓
          </button>
          <button
            type="button"
            onTouchStart={() => setTouchKey('ArrowRight', true)}
            onTouchEnd={() => setTouchKey('ArrowRight', false)}
            onMouseDown={() => setTouchKey('ArrowRight', true)}
            onMouseUp={() => setTouchKey('ArrowRight', false)}
            className="p-3 bg-neutral-800 active:bg-blue-600 rounded-xl flex items-center justify-center text-white text-xs font-bold"
          >
            →
          </button>
        </div>

        {/* Action Fire Button */}
        <div className="flex items-center justify-center p-2 bg-neutral-900/80 rounded-2xl border border-neutral-800">
          <button
            type="button"
            onTouchStart={() => setTouchKey('Space', true)}
            onTouchEnd={() => setTouchKey('Space', false)}
            onMouseDown={() => setTouchKey('Space', true)}
            onMouseUp={() => setTouchKey('Space', false)}
            className="w-full h-full min-h-[90px] rounded-2xl bg-gradient-to-r from-red-600 to-rose-500 active:from-red-500 active:to-rose-400 text-white font-black text-base shadow-[0_0_20px_rgba(239,68,68,0.5)] flex items-center justify-center cursor-pointer active:scale-95"
          >
            FIRE 💥
          </button>
        </div>
      </footer>

      {/* High Score Entry Modal */}
      {showInitialsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-md p-6 rounded-3xl bg-neutral-900 border-2 border-yellow-500/80 shadow-[0_0_50px_rgba(234,179,8,0.4)] text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-yellow-500/20 border border-yellow-400 flex items-center justify-center text-3xl">
              🏆
            </div>
            <h3 className="text-xl font-black text-yellow-400">
              NIEUWE HIGH SCORE!
            </h3>
            <p className="text-sm text-neutral-300">
              Score: <span className="font-bold text-white text-lg">{pendingScore}</span> (Round {pendingRound})
            </p>
            <div className="space-y-2">
              <label className="text-xs text-neutral-400 block">
                Voer je 3 initialen in:
              </label>
              <input
                type="text"
                maxLength={3}
                value={initials}
                onChange={(e) => setInitials(e.target.value.toUpperCase())}
                className="w-32 text-center text-2xl font-black font-mono tracking-widest px-3 py-2 bg-black rounded-xl border-2 border-yellow-400 text-yellow-400 focus:outline-none"
                autoFocus
              />
            </div>
            <div className="flex gap-2 justify-center pt-2">
              <button
                type="button"
                onClick={handleSaveInitials}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-black font-black text-sm shadow-lg cursor-pointer transition active:scale-95"
              >
                OPSLAAN
              </button>
            </div>
          </div>
        </div>
      )}

      {/* High Scores Leaderboard Modal */}
      {isHighScoresOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-lg p-6 rounded-3xl bg-neutral-900 border-2 border-blue-500/80 shadow-[0_0_50px_rgba(37,99,235,0.4)] space-y-4">
            <div className="flex justify-between items-center border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-400" />
                <h3 className="text-lg font-black text-white">
                  ZAXXON HIGH SCORES
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsHighScoresOpen(false)}
                className="text-neutral-400 hover:text-white text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="divide-y divide-neutral-800/80 font-mono text-xs max-h-80 overflow-y-auto">
              {highScores.map((s, idx) => (
                <div key={idx} className="flex justify-between items-center py-2.5 px-1">
                  <div className="flex items-center gap-3">
                    <span className={`w-6 font-bold ${idx === 0 ? 'text-yellow-400 font-black' : 'text-neutral-500'}`}>
                      {idx + 1}.
                    </span>
                    <span className="font-black text-cyan-300 text-sm">{s.initials}</span>
                    <span className="text-neutral-500 text-[10px]">Rnd {s.stage}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-neutral-400 text-[10px]">{s.date}</span>
                    <span className="font-black text-white text-sm">{s.score}</span>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setIsHighScoresOpen(false)}
              className="w-full py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs transition cursor-pointer"
            >
              Sluiten
            </button>
          </div>
        </div>
      )}

      {/* Historical Dossier Modal */}
      <ZaxxonHistoryModal
        isOpen={isDossierOpen}
        onClose={() => setIsDossierOpen(false)}
        onPlay={() => {
          setIsDossierOpen(false);
          restartGame();
        }}
      />
    </div>
  );
};
