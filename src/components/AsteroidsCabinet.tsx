/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Atari Asteroids (1979) Arcade Cabinet & Interactive Game View
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { ArrowLeft, Volume2, VolumeX, RotateCcw, Shield, Sparkles, Sliders, Trophy, BookOpen, Zap, Info } from 'lucide-react';
import { AsteroidsEngine, AsteroidsGameSettings } from '../game/asteroidsEngine';
import { AsteroidsRenderer } from '../game/asteroidsRenderer';
import { asteroidsAudio } from '../game/asteroidsAudio';
import { getAsteroidsScores, addAsteroidsScore, isAsteroidsHighScore, AsteroidsScore } from '../game/asteroidsHighScores';
import { AsteroidsHistoryModal } from './AsteroidsHistoryModal';
import { haptics } from '../utils/haptics';

interface AsteroidsCabinetProps {
  onBackToLobby: () => void;
}

export const AsteroidsCabinet: React.FC<AsteroidsCabinetProps> = ({ onBackToLobby }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<AsteroidsEngine | null>(null);
  const rendererRef = useRef<AsteroidsRenderer | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const [isMuted, setIsMuted] = useState(false);
  const [isDossierOpen, setIsDossierOpen] = useState(false);
  const [isHighScoresOpen, setIsHighScoresOpen] = useState(false);
  const [highScores, setHighScores] = useState<AsteroidsScore[]>([]);

  // High score entry modal
  const [showInitialsModal, setShowInitialsModal] = useState(false);
  const [initials, setInitials] = useState('AAA');
  const [pendingScore, setPendingScore] = useState(0);
  const [pendingWave, setPendingWave] = useState(1);

  // Settings & Trainer
  const [settings, setSettings] = useState<AsteroidsGameSettings>({
    phosphorColor: 'white',
    beamGlowIntensity: 1.2,
    vectorTrails: true,
    shieldsActive: false,
    safeHyperspace: false,
    autoAim: false,
    slowMotion: false,
  });

  const [showSettingsMenu, setShowSettingsMenu] = useState(false);

  // Initialize engine
  useEffect(() => {
    const engine = new AsteroidsEngine(800, 600);
    const topScores = getAsteroidsScores();
    setHighScores(topScores);
    engine.highScore = topScores.length > 0 ? topScores[0].score : 99990;
    engine.initNewGame();
    engineRef.current = engine;

    if (canvasRef.current) {
      rendererRef.current = new AsteroidsRenderer(canvasRef.current);
    }

    // Main Game Loop
    let lastTime = performance.now();
    const loop = (currentTime: number) => {
      if (engineRef.current && rendererRef.current) {
        engineRef.current.settings = settings;
        engineRef.current.update();
        rendererRef.current.render(engineRef.current);

        // Check game over high score
        if (engineRef.current.isGameOver && !showInitialsModal && engineRef.current.score > 0) {
          if (isAsteroidsHighScore(engineRef.current.score)) {
            setPendingScore(engineRef.current.score);
            setPendingWave(engineRef.current.wave);
            setShowInitialsModal(true);
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
      asteroidsAudio.stopHeartbeat();
      asteroidsAudio.stopThrust();
      asteroidsAudio.stopSaucerSound();
    };
  }, []);

  // Synchronize settings
  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.settings = settings;
    }
  }, [settings]);

  // Handle Keyboard Input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showInitialsModal) return;
      const engine = engineRef.current;
      if (!engine) return;

      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        engine.keys.left = true;
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        engine.keys.right = true;
      } else if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        engine.keys.thrust = true;
      } else if (e.key === ' ' || e.key === 'Control' || e.key === 'Enter') {
        e.preventDefault();
        if (engine.isGameOver) {
          engine.initNewGame();
        } else {
          engine.fireBullet();
        }
      } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S' || e.key === 'h' || e.key === 'H' || e.key === 'Shift') {
        e.preventDefault();
        engine.triggerHyperspace();
      } else if (e.key === 'p' || e.key === 'P') {
        engine.isPaused = !engine.isPaused;
      } else if (e.key === '1') {
        engine.initNewGame();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const engine = engineRef.current;
      if (!engine) return;

      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        engine.keys.left = false;
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        engine.keys.right = false;
      } else if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        engine.keys.thrust = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [showInitialsModal]);

  const toggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    asteroidsAudio.setMuted(next);
  };

  const restartGame = () => {
    if (engineRef.current) {
      engineRef.current.initNewGame();
      haptics.powerPellet();
    }
  };

  const submitHighScore = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = addAsteroidsScore(pendingScore, pendingWave, initials);
    setHighScores(updated);
    setShowInitialsModal(false);
    if (engineRef.current) {
      engineRef.current.highScore = updated[0].score;
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col items-center select-none font-mono p-2 sm:p-4 md:p-6">
      {/* Top Bar */}
      <div className="w-full max-w-5xl flex items-center justify-between py-2 border-b border-neutral-800 mb-4 text-xs">
        <button
          onClick={onBackToLobby}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-700 transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>SPEELHAL LOBBY</span>
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsDossierOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-700 transition-all cursor-pointer"
          >
            <BookOpen className="w-4 h-4 text-cyan-400" />
            <span>DOSSIER</span>
          </button>
          <button
            onClick={() => setIsHighScoresOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-700 transition-all cursor-pointer"
          >
            <Trophy className="w-4 h-4 text-yellow-400" />
            <span>SCORES</span>
          </button>
          <button
            onClick={() => setShowSettingsMenu(!showSettingsMenu)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-700 transition-all cursor-pointer"
          >
            <Sliders className="w-4 h-4 text-emerald-400" />
            <span>DIP SWITCHES</span>
          </button>
          <button
            onClick={toggleMute}
            className="p-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-700 transition-all cursor-pointer"
            title={isMuted ? 'Geluid Aanzetten' : 'Geluid Dempen'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>
        </div>
      </div>

      {/* Arcade Cabinet Container */}
      <div className="relative w-full max-w-4xl bg-black rounded-3xl border-4 border-neutral-800 shadow-[0_0_60px_rgba(255,255,255,0.08)] overflow-hidden flex flex-col items-center">
        {/* Cabinet Marquee */}
        <div className="w-full bg-gradient-to-r from-neutral-950 via-neutral-900 to-neutral-950 px-6 py-3 border-b-2 border-neutral-800 flex items-center justify-between text-neutral-300 shadow-inner">
          <div className="flex items-center gap-3">
            <span className="text-xl">🪨</span>
            <div>
              <span className="font-black tracking-widest text-white text-base">ASTEROIDS</span>
              <span className="text-[10px] text-neutral-500 block">ATARI QUADRASCAN DVG • 1979</span>
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="px-2 py-0.5 rounded bg-neutral-800 border border-neutral-700 text-neutral-300">
              1 COIN 1 PLAY
            </span>
            <span className="text-emerald-400 animate-pulse font-bold">● FREE PLAY</span>
          </div>
        </div>

        {/* Vector Phosphor Screen Frame */}
        <div className="relative p-2 sm:p-4 bg-neutral-950 w-full flex justify-center">
          <div className="relative rounded-2xl overflow-hidden border-2 border-neutral-800 shadow-[inset_0_0_30px_rgba(0,0,0,0.9)] bg-black">
            <canvas
              ref={canvasRef}
              width={800}
              height={600}
              className="w-full max-w-[800px] aspect-[4/3] block"
            />
          </div>
        </div>

        {/* Control Panel (Authentic 5-Button Atari Asteroids Layout) */}
        <div className="w-full bg-neutral-900 border-t-2 border-neutral-800 p-4 sm:p-6 flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Directional Turn Controls (Mobile / Clickable) */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onPointerDown={() => { if (engineRef.current) engineRef.current.keys.left = true; }}
                onPointerUp={() => { if (engineRef.current) engineRef.current.keys.left = false; }}
                onPointerLeave={() => { if (engineRef.current) engineRef.current.keys.left = false; }}
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-neutral-800 border-2 border-neutral-600 active:border-white active:bg-neutral-700 text-white font-bold flex flex-col items-center justify-center text-xs shadow-lg active:scale-95 transition-all cursor-pointer select-none"
              >
                <span>◄</span>
                <span className="text-[9px] text-neutral-400">ROTATE L</span>
              </button>
              <button
                type="button"
                onPointerDown={() => { if (engineRef.current) engineRef.current.keys.right = true; }}
                onPointerUp={() => { if (engineRef.current) engineRef.current.keys.right = false; }}
                onPointerLeave={() => { if (engineRef.current) engineRef.current.keys.right = false; }}
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-neutral-800 border-2 border-neutral-600 active:border-white active:bg-neutral-700 text-white font-bold flex flex-col items-center justify-center text-xs shadow-lg active:scale-95 transition-all cursor-pointer select-none"
              >
                <span>►</span>
                <span className="text-[9px] text-neutral-400">ROTATE R</span>
              </button>
            </div>

            {/* Thrust & Hyperspace */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onPointerDown={() => { if (engineRef.current) engineRef.current.keys.thrust = true; }}
                onPointerUp={() => { if (engineRef.current) engineRef.current.keys.thrust = false; }}
                onPointerLeave={() => { if (engineRef.current) engineRef.current.keys.thrust = false; }}
                className="px-4 py-3 sm:px-5 sm:py-4 rounded-2xl bg-neutral-800 border-2 border-neutral-600 active:border-orange-400 active:bg-orange-950 text-white font-bold flex flex-col items-center justify-center text-xs shadow-lg active:scale-95 transition-all cursor-pointer select-none"
              >
                <span className="text-orange-400">▲ THRUST</span>
                <span className="text-[9px] text-neutral-400">STUWKRACHT</span>
              </button>
              <button
                type="button"
                onClick={() => { if (engineRef.current) engineRef.current.triggerHyperspace(); }}
                className="px-4 py-3 sm:px-5 sm:py-4 rounded-2xl bg-neutral-800 border-2 border-neutral-600 active:border-cyan-400 active:bg-cyan-950 text-white font-bold flex flex-col items-center justify-center text-xs shadow-lg active:scale-95 transition-all cursor-pointer select-none"
              >
                <span className="text-cyan-400">🌀 HYPERSPACE</span>
                <span className="text-[9px] text-neutral-400">TELEPORT</span>
              </button>
            </div>

            {/* Fire Button (Big Red Arcade Pushbutton) */}
            <button
              type="button"
              onClick={() => {
                if (engineRef.current) {
                  if (engineRef.current.isGameOver) {
                    engineRef.current.initNewGame();
                  } else {
                    engineRef.current.fireBullet();
                  }
                }
              }}
              className="px-6 py-4 rounded-2xl bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-black text-sm tracking-wider shadow-[0_0_20px_rgba(239,68,68,0.5)] active:scale-95 transition-all cursor-pointer flex items-center gap-2"
            >
              <span>🔥 FIRE (SPATIE)</span>
            </button>
          </div>

          {/* Keyboard Helper Bar */}
          <div className="flex flex-wrap items-center justify-between text-[11px] text-neutral-400 border-t border-neutral-800 pt-3">
            <span>TOETSENBORD: [◄ / ► of A/D] ROTEREN • [▲ of W] STUWKRACHT • [SPATIE] SCHIETEN • [▼ of H/SHIFT] HYPERSPACE • [P] PAUZE</span>
            <button
              onClick={restartGame}
              className="flex items-center gap-1 text-neutral-300 hover:text-white cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>HERSTART GAME [1]</span>
            </button>
          </div>
        </div>
      </div>

      {/* Dip Switches & Settings Drawer */}
      {showSettingsMenu && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in font-mono">
          <div className="w-full max-w-lg bg-neutral-900 border-2 border-neutral-700 rounded-3xl p-6 space-y-5 text-xs text-neutral-200 shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sliders className="w-5 h-5 text-emerald-400" />
                <span>ATARI DVG &amp; TRAINER DIP SWITCHES</span>
              </h3>
              <button onClick={() => setShowSettingsMenu(false)} className="text-neutral-400 hover:text-white">✕</button>
            </div>

            {/* Phosphor Color Selection */}
            <div className="space-y-2">
              <label className="text-neutral-400 block font-bold">CRT PHOSPHOR WEERGAVE</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'white', label: 'B&W Vector', desc: 'Origineel 1979' },
                  { id: 'green', label: 'P1 Green', desc: 'Groene Fosfor' },
                  { id: 'amber', label: 'Amber', desc: 'Warme Fosfor' },
                  { id: 'cyan', label: 'Cyan Beam', desc: 'QuadraScan' },
                ].map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setSettings(prev => ({ ...prev, phosphorColor: p.id as typeof settings.phosphorColor }))}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                      settings.phosphorColor === p.id
                        ? 'bg-neutral-800 border-white text-white font-bold'
                        : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                    }`}
                  >
                    <div className="text-xs">{p.label}</div>
                    <div className="text-[10px] text-neutral-500">{p.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Trainer Toggles */}
            <div className="space-y-2.5 border-t border-neutral-800 pt-3">
              <label className="text-neutral-400 block font-bold">TRAINER OPTIES</label>
              <div className="space-y-2">
                <label className="flex items-center justify-between p-2 rounded-lg bg-neutral-950 border border-neutral-800 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-cyan-400" />
                    <span>Krachtveld Schild (Onkwetsbaarheid)</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.shieldsActive}
                    onChange={(e) => setSettings(prev => ({ ...prev, shieldsActive: e.target.checked }))}
                    className="cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-2 rounded-lg bg-neutral-950 border border-neutral-800 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-yellow-400" />
                    <span>Veilige Hyperspace (Geen zelfvernietiging)</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.safeHyperspace}
                    onChange={(e) => setSettings(prev => ({ ...prev, safeHyperspace: e.target.checked }))}
                    className="cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-2 rounded-lg bg-neutral-950 border border-neutral-800 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    <span>Auto-Aim Richtassistentie</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.autoAim}
                    onChange={(e) => setSettings(prev => ({ ...prev, autoAim: e.target.checked }))}
                    className="cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-2 rounded-lg bg-neutral-950 border border-neutral-800 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-400">⏱️</span>
                    <span>Slow Motion Matrix Mode (50% snelheid)</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.slowMotion}
                    onChange={(e) => setSettings(prev => ({ ...prev, slowMotion: e.target.checked }))}
                    className="cursor-pointer"
                  />
                </label>
              </div>
            </div>

            <button
              onClick={() => setShowSettingsMenu(false)}
              className="w-full py-2.5 rounded-xl bg-white text-black font-bold cursor-pointer"
            >
              SLUITEN &amp; VERDER SPELEN
            </button>
          </div>
        </div>
      )}

      {/* High Scores Modal */}
      {isHighScoresOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in font-mono">
          <div className="w-full max-w-md bg-neutral-950 border-2 border-neutral-700 rounded-3xl p-6 space-y-4 text-xs text-neutral-200">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-400" />
                <span>TOP PILOTEN HIGH SCORES</span>
              </h3>
              <button onClick={() => setIsHighScoresOpen(false)} className="text-neutral-400 hover:text-white">✕</button>
            </div>

            <div className="space-y-1.5">
              {highScores.map((entry, idx) => (
                <div key={idx} className="flex justify-between items-center p-2 rounded bg-neutral-900 border border-neutral-800 font-mono">
                  <div className="flex items-center gap-2">
                    <span className="text-neutral-500 w-5 text-right">{idx + 1}.</span>
                    <span className="font-bold text-white tracking-widest">{entry.initials}</span>
                    <span className="text-[10px] text-neutral-500">WAVE {entry.wave}</span>
                  </div>
                  <span className="font-bold text-yellow-400">{entry.score} PTS</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => setIsHighScoresOpen(false)}
              className="w-full py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-bold cursor-pointer"
            >
              SLUITEN
            </button>
          </div>
        </div>
      )}

      {/* Initial Entry High Score Modal */}
      {showInitialsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in font-mono">
          <form onSubmit={submitHighScore} className="w-full max-w-sm bg-neutral-950 border-2 border-yellow-500 rounded-3xl p-6 space-y-4 text-center">
            <div className="text-3xl">🏆</div>
            <h3 className="text-lg font-black text-yellow-400">NIEUWE HIGH SCORE!</h3>
            <p className="text-xs text-neutral-300">
              Gefeliciteerd piloot! Je hebt een score van <strong className="text-white">{pendingScore}</strong> behaald in Wave {pendingWave}!
            </p>

            <div className="space-y-1">
              <label className="text-[10px] text-neutral-400 uppercase tracking-wider block">Voer je 3 Initialen in:</label>
              <input
                type="text"
                maxLength={3}
                value={initials}
                onChange={(e) => setInitials(e.target.value.toUpperCase())}
                autoFocus
                className="w-32 mx-auto text-center font-black text-2xl tracking-widest bg-neutral-900 border-2 border-yellow-400 rounded-xl py-2 text-yellow-300 uppercase focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-black font-black text-xs tracking-wider cursor-pointer shadow-[0_0_15px_rgba(250,204,21,0.5)]"
            >
              OPSLAAN IN HIGH SCORE BOARD
            </button>
          </form>
        </div>
      )}

      {/* Asteroids History Modal */}
      <AsteroidsHistoryModal
        isOpen={isDossierOpen}
        onClose={() => setIsDossierOpen(false)}
        onPlay={() => {
          setIsDossierOpen(false);
          restartGame();
        }}
        lang="nl"
      />
    </div>
  );
};
