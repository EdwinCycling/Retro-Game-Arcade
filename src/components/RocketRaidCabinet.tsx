/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Rocket Raid Arcade Cabinet (BBC Micro / Acorn Electron 1982 - Acornsoft)
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
  Zap,
  Bomb as BombIcon,
  Palette,
  Crosshair,
} from 'lucide-react';
import { RocketRaidEngine, NATIVE_HEIGHT, NATIVE_WIDTH } from '../game/rocketRaidEngine';
import { RocketRaidRenderer } from '../game/rocketRaidRenderer';
import { rocketRaidAudio } from '../game/rocketRaidAudio';
import { getRocketRaidScores, saveRocketRaidScore } from '../game/rocketRaidHighScores';
import { DisplayPalette, HighScoreEntry } from '../game/rocketRaidTypes';
import { RocketRaidHistoryModal } from './RocketRaidHistoryModal';
import { GameControlsModal, useGameControls } from './GameControlsModal';
import { haptics } from '../utils/haptics';

interface RocketRaidCabinetProps {
  onBackToLobby: () => void;
}

export const RocketRaidCabinet: React.FC<RocketRaidCabinetProps> = ({ onBackToLobby }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<RocketRaidEngine | null>(null);
  const rendererRef = useRef<RocketRaidRenderer | null>(null);

  // States
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [sectionIndex, setSectionIndex] = useState(1);
  const [loopNumber, setLoopNumber] = useState(1);
  const [fuel, setFuel] = useState(100);
  const [gameState, setGameState] = useState<string>('TITLE');
  const [isMuted, setIsMuted] = useState(false);
  const [enableCRT, setEnableCRT] = useState(true);
  const [palette, setPalette] = useState<DisplayPalette>('grey'); // Default: user played Acorn Grijs!
  const [showTouchControls, setShowTouchControls] = useState(() => {
    return (
      typeof window !== 'undefined' &&
      ('ontouchstart' in window || navigator.maxTouchPoints > 0 || window.innerWidth < 1024)
    );
  });
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const { showControls, setShowControls } = useGameControls('rocket_raid');
  const [showHighScoresModal, setShowHighScoresModal] = useState(false);
  const [highScores, setHighScores] = useState<HighScoreEntry[]>(getRocketRaidScores());
  const [initials, setInitials] = useState('');
  const [hasSubmittedScore, setHasSubmittedScore] = useState(false);
  const [shieldTimer, setShieldTimer] = useState<number>(0);

  // Initial engine setup
  useEffect(() => {
    const engine = new RocketRaidEngine();
    engineRef.current = engine;

    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.imageSmoothingEnabled = false;
        const renderer = new RocketRaidRenderer(ctx);
        renderer.setPalette(palette);
        renderer.enableCRT = enableCRT;
        rendererRef.current = renderer;
      }
    }

    // Keyboard handlers
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent scrolling
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(e.code)) {
        e.preventDefault();
      }

      if (e.code === 'Space' || e.code === 'Enter' || e.code === 'KeyZ') {
        engine.fireLaser();
        engine.setKeyDown(e.code);
      } else if (e.code === 'KeyB' || e.code === 'Tab' || e.code === 'ShiftLeft' || e.code === 'ShiftRight' || e.code === 'KeyX') {
        engine.dropBomb();
      } else {
        engine.setKeyDown(e.code);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      engine.setKeyUp(e.code);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // Animation loop
    let lastTime = performance.now();
    let animId: number;

    const gameLoop = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      engine.update(dt);

      if (rendererRef.current) {
        rendererRef.current.render(engine);
      }

      // Sync state
      setScore(engine.score);
      setLives(engine.lives);
      setSectionIndex(engine.currentSectionIndex);
      setLoopNumber(engine.loopNumber);
      setFuel(Math.round(engine.player.fuel));
      setGameState(engine.gameState);
      setShieldTimer(engine.invulnerabilityTimer);

      animId = requestAnimationFrame(gameLoop);
    };

    animId = requestAnimationFrame(gameLoop);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      cancelAnimationFrame(animId);
    };
  }, []);

  // Update renderer palette
  useEffect(() => {
    if (rendererRef.current) {
      rendererRef.current.setPalette(palette);
    }
  }, [palette]);

  // Update CRT
  useEffect(() => {
    if (rendererRef.current) {
      rendererRef.current.enableCRT = enableCRT;
    }
  }, [enableCRT]);

  // Audio mute
  const toggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    rocketRaidAudio.setMuted(next);
    haptics.selection();
  };

  const handleStartOrRestart = () => {
    haptics.medium();
    engineRef.current?.resetGame();
    setHasSubmittedScore(false);
  };

  const handleCyclePalette = () => {
    haptics.selection();
    setPalette((prev) => {
      if (prev === 'grey') return 'color';
      if (prev === 'color') return 'green';
      return 'grey';
    });
  };

  const handleSubmitScore = (e: React.FormEvent) => {
    e.preventDefault();
    if (!initials.trim() || hasSubmittedScore) return;
    const updated = saveRocketRaidScore(score, initials, sectionIndex);
    setHighScores(updated);
    setHasSubmittedScore(true);
    setShowHighScoresModal(false);
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-neutral-200 flex flex-col items-center justify-between p-2 sm:p-4 select-none font-sans">
      {/* Top Navigation Bar */}
      <header className="w-full max-w-4xl flex items-center justify-between bg-neutral-900/90 border border-neutral-800 px-3 py-2 sm:px-4 sm:py-2.5 rounded-2xl shadow-lg backdrop-blur-md z-10">
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => {
              haptics.selection();
              onBackToLobby();
            }}
            className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-mono font-bold flex items-center gap-1.5 transition cursor-pointer active:scale-95"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Lobby</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-pink-500 animate-pulse" />
            <h1 className="font-mono font-black text-sm sm:text-base text-pink-400 tracking-wider">
              ROCKET RAID (1982)
            </h1>
            <span className="hidden md:inline text-[11px] font-mono text-neutral-400">
              Acornsoft • BBC Micro / Electron
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Palette Selector Button (Acorn Grijs / Mode 2 Color / Green Screen) */}
          <button
            type="button"
            onClick={handleCyclePalette}
            className={`px-2.5 py-1.5 rounded-xl border text-[11px] font-mono font-bold flex items-center gap-1.5 transition cursor-pointer active:scale-95 ${
              palette === 'grey'
                ? 'bg-neutral-800 border-neutral-500 text-white shadow-[0_0_12px_rgba(255,255,255,0.3)]'
                : palette === 'color'
                ? 'bg-pink-950/60 border-pink-500 text-pink-300 shadow-[0_0_12px_rgba(236,72,153,0.3)]'
                : 'bg-emerald-950/60 border-emerald-500 text-emerald-300'
            }`}
            title="Wissel beeldschermmodus (Acorn Grijs Monochroom / Acorn Kleur / Groen Scherm)"
          >
            <Palette className="w-3.5 h-3.5" />
            <span className="capitalize">
              {palette === 'grey' ? '📺 Acorn Grijs' : palette === 'color' ? '🎨 Acorn Kleur' : '🟢 Acorn Groen'}
            </span>
          </button>

          {/* CRT toggle */}
          <button
            type="button"
            onClick={() => {
              haptics.selection();
              setEnableCRT(!enableCRT);
            }}
            className={`p-1.5 sm:px-2 sm:py-1.5 rounded-xl border text-xs font-mono font-bold flex items-center gap-1 transition cursor-pointer ${
              enableCRT
                ? 'bg-cyan-950/60 border-cyan-500 text-cyan-300'
                : 'bg-neutral-800 border-neutral-700 text-neutral-400'
            }`}
            title="CRT Scanlines filter"
          >
            <Tv className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">CRT</span>
          </button>

          {/* Audio toggle */}
          <button
            type="button"
            onClick={toggleMute}
            className="p-1.5 sm:px-2 sm:py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-neutral-300 text-xs font-mono transition cursor-pointer"
            title={isMuted ? 'Geluid dempen opheffen' : 'Geluid dempen'}
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5 text-red-400" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-400" />}
          </button>

          {/* Restart */}
          <button
            type="button"
            onClick={handleStartOrRestart}
            className="p-1.5 sm:px-2 sm:py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-neutral-300 text-xs font-mono transition cursor-pointer"
            title="Herstart spel"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Dossier */}
          <button
            type="button"
            onClick={() => {
              haptics.selection();
              setShowHistoryModal(true);
            }}
            className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-pink-950/40 hover:bg-pink-900/60 border border-pink-700/60 text-pink-300 text-xs font-mono font-bold flex items-center gap-1 transition cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Dossier</span>
          </button>

          {/* High Scores */}
          <button
            type="button"
            onClick={() => {
              haptics.selection();
              setShowHighScoresModal(true);
            }}
            className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-amber-950/40 hover:bg-amber-900/60 border border-amber-700/60 text-amber-300 text-xs font-mono font-bold flex items-center gap-1 transition cursor-pointer"
          >
            <Trophy className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Scores</span>
          </button>
        </div>
      </header>

      {/* Main Game Screen / Cabinet Display */}
      <main className="w-full max-w-4xl flex-1 flex flex-col items-center justify-center my-2 sm:my-3">
        {/* Acorn Micro Cabinet Bezel */}
        <div className="relative p-2 sm:p-4 rounded-3xl bg-gradient-to-b from-neutral-800 via-neutral-900 to-neutral-950 border-4 border-neutral-700 shadow-[0_0_50px_rgba(0,0,0,0.9)] flex flex-col items-center w-full">
          {/* Authentic BBC Micro Red stripe brand accent */}
          <div className="w-full flex items-center justify-between pb-2 px-2 border-b border-neutral-800 text-[11px] font-mono text-neutral-400">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-red-600 rounded-sm inline-block shadow-[0_0_8px_rgba(220,38,38,0.8)]" />
              <span className="font-black text-neutral-200">British Broadcasting Corporation Microcomputer System</span>
            </div>
            <span className="text-neutral-500 hidden sm:inline">Acornsoft Rocket Raid • Mode 2</span>
          </div>

          {/* Canvas Wrapper with exact 320:240 4:3 Aspect Ratio */}
          <div className="relative mt-2 w-full aspect-[4/3] max-h-[64vh] rounded-xl overflow-hidden bg-black border-2 border-neutral-800 shadow-inner flex items-center justify-center">
            <canvas
              ref={canvasRef}
              width={NATIVE_WIDTH}
              height={NATIVE_HEIGHT}
              onClick={() => {
                if (gameState === 'TITLE' || gameState === 'GAMEOVER') {
                  handleStartOrRestart();
                }
              }}
              className="w-full h-full object-contain cursor-crosshair"
            />
          </div>

          {/* Quick HUD status strip under screen */}
          <div className="w-full flex flex-wrap items-center justify-between gap-2 mt-2.5 px-3 py-1.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs font-mono">
            <div className="flex items-center gap-3">
              <span className="text-neutral-400">SCORE: <strong className="text-white">{score.toLocaleString()}</strong></span>
              <span className="text-neutral-400">LEVEN: <strong className="text-pink-400">{lives}</strong></span>
              <span className="text-neutral-400">FASE: <strong className="text-cyan-400">{sectionIndex}/5</strong></span>
              {shieldTimer > 0 && (
                <span className="bg-cyan-950/80 border border-cyan-500/70 text-cyan-300 text-[11px] font-bold px-2 py-0.5 rounded shadow-[0_0_8px_rgba(6,182,212,0.4)] animate-pulse">
                  🛡️ SCHILD {shieldTimer.toFixed(1)}s
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-neutral-400 text-[11px]">BRANDSTOF:</span>
              <div className="w-20 sm:w-28 h-2.5 rounded bg-neutral-800 overflow-hidden border border-neutral-700">
                <div
                  className={`h-full transition-all ${
                    fuel > 30 ? 'bg-emerald-500' : 'bg-red-500 animate-pulse'
                  }`}
                  style={{ width: `${Math.max(0, Math.min(100, fuel))}%` }}
                />
              </div>
              <span className="text-[11px] font-bold text-neutral-300">{fuel}%</span>
            </div>
          </div>
        </div>
      </main>

      {/* Mobile & Touch Controls (Virtual D-Pad & Action Buttons) */}
      {showTouchControls && (
        <section className="w-full max-w-4xl grid grid-cols-2 gap-4 mt-1 mb-2 px-2">
          {/* Virtual D-pad for flight */}
          <div className="flex items-center justify-center">
            <div className="grid grid-cols-3 gap-1 w-36 h-36">
              <div />
              <button
                type="button"
                onPointerDown={() => engineRef.current?.setKeyDown('ArrowUp')}
                onPointerUp={() => engineRef.current?.setKeyUp('ArrowUp')}
                className="rounded-xl bg-neutral-800 active:bg-neutral-700 border border-neutral-700 flex items-center justify-center text-lg font-bold text-neutral-200 active:scale-95"
              >
                ▲
              </button>
              <div />

              <button
                type="button"
                onPointerDown={() => engineRef.current?.setKeyDown('ArrowLeft')}
                onPointerUp={() => engineRef.current?.setKeyUp('ArrowLeft')}
                className="rounded-xl bg-neutral-800 active:bg-neutral-700 border border-neutral-700 flex items-center justify-center text-lg font-bold text-neutral-200 active:scale-95"
              >
                ◀
              </button>
              <div className="rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-[10px] text-neutral-500 font-mono">
                ROER
              </div>
              <button
                type="button"
                onPointerDown={() => engineRef.current?.setKeyDown('ArrowRight')}
                onPointerUp={() => engineRef.current?.setKeyUp('ArrowRight')}
                className="rounded-xl bg-neutral-800 active:bg-neutral-700 border border-neutral-700 flex items-center justify-center text-lg font-bold text-neutral-200 active:scale-95"
              >
                ▶
              </button>

              <div />
              <button
                type="button"
                onPointerDown={() => engineRef.current?.setKeyDown('ArrowDown')}
                onPointerUp={() => engineRef.current?.setKeyUp('ArrowDown')}
                className="rounded-xl bg-neutral-800 active:bg-neutral-700 border border-neutral-700 flex items-center justify-center text-lg font-bold text-neutral-200 active:scale-95"
              >
                ▼
              </button>
              <div />
            </div>
          </div>

          {/* Action buttons (Laser & Bomb) */}
          <div className="flex items-center justify-center gap-3">
            <button
              type="button"
              onPointerDown={() => {
                haptics.medium();
                engineRef.current?.dropBomb();
              }}
              className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl bg-amber-600/90 active:bg-amber-500 border-2 border-amber-400 text-black font-mono font-black flex flex-col items-center justify-center gap-1 shadow-[0_0_20px_rgba(245,158,11,0.4)] active:scale-95 cursor-pointer"
            >
              <BombIcon className="w-5 h-5 fill-black" />
              <span className="text-[10px] uppercase tracking-wider">BOM</span>
            </button>

            <button
              type="button"
              onPointerDown={() => {
                haptics.light();
                engineRef.current?.fireLaser();
              }}
              className="w-20 h-20 sm:w-22 sm:h-22 rounded-2xl bg-pink-600/90 active:bg-pink-500 border-2 border-pink-400 text-white font-mono font-black flex flex-col items-center justify-center gap-1 shadow-[0_0_25px_rgba(236,72,153,0.5)] active:scale-95 cursor-pointer"
            >
              <Zap className="w-6 h-6 fill-white" />
              <span className="text-xs uppercase tracking-wider">LASER</span>
            </button>
          </div>
        </section>
      )}

      {/* Desktop Keyboard Helper bar */}
      <footer className="w-full max-w-4xl flex items-center justify-between text-[11px] font-mono text-neutral-500 px-3 py-1.5 bg-neutral-950/60 rounded-xl border border-neutral-900">
        <div className="flex items-center gap-3">
          <span>Pijltjes / WASD: Vliegen</span>
          <span>•</span>
          <span>Spatie / Enter: Laser</span>
          <span>•</span>
          <span>B / Tab / Shift: Bom afwerpen</span>
        </div>
        <button
          type="button"
          onClick={() => setShowTouchControls(!showTouchControls)}
          className="text-neutral-400 hover:text-white flex items-center gap-1 cursor-pointer"
        >
          <Smartphone className="w-3 h-3" />
          <span>{showTouchControls ? 'Verberg Touch' : 'Toon Touch'}</span>
        </button>
      </footer>

      {/* High Scores Modal */}
      {showHighScoresModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-neutral-900 border-2 border-amber-500/80 rounded-3xl p-6 shadow-[0_0_40px_rgba(245,158,11,0.35)] text-neutral-200 font-mono">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-400" />
                <h3 className="font-black text-amber-400 text-base">ROCKET RAID TOP SCORES</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowHighScoresModal(false)}
                className="w-7 h-7 rounded-lg bg-neutral-800 text-neutral-400 hover:text-white flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            {/* Score submission form if game over and score > 0 */}
            {gameState === 'GAMEOVER' && score > 0 && !hasSubmittedScore && (
              <form onSubmit={handleSubmitScore} className="my-4 p-3 rounded-xl bg-amber-950/30 border border-amber-500/50 space-y-2">
                <p className="text-xs text-amber-300 font-bold">Nieuwe Record Score: {score.toLocaleString()}!</p>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    maxLength={3}
                    value={initials}
                    onChange={(e) => setInitials(e.target.value.toUpperCase())}
                    placeholder="AAA"
                    className="w-20 px-3 py-1.5 rounded-lg bg-black border border-amber-500 text-center font-black text-amber-400 text-lg uppercase tracking-widest focus:outline-none"
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="flex-1 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-black text-xs uppercase cursor-pointer"
                  >
                    Opslaan
                  </button>
                </div>
              </form>
            )}

            {/* Scores list */}
            <div className="space-y-2 my-4">
              {highScores.map((entry, idx) => (
                <div
                  key={idx}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs ${
                    idx === 0 ? 'bg-amber-950/50 border border-amber-600/50 text-amber-300 font-bold' : 'bg-neutral-800/60 text-neutral-300'
                  }`}
                >
                  <span className="w-6 text-neutral-500">{idx + 1}.</span>
                  <span className="font-bold tracking-wider">{entry.initials}</span>
                  <span className="text-neutral-400 text-[10px]">FASE {entry.sectionReached}/5</span>
                  <span className="font-mono font-bold text-white">{entry.score.toLocaleString()}</span>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setShowHighScoresModal(false)}
              className="w-full py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-bold cursor-pointer transition"
            >
              Sluiten
            </button>
          </div>
        </div>
      )}

      {/* History Dossier Modal */}
      <RocketRaidHistoryModal
        isOpen={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
        onPlay={() => {
          setShowHistoryModal(false);
          handleStartOrRestart();
        }}
      />

      {/* Game Controls Guide Modal */}
      <GameControlsModal
        isOpen={showControls}
        onClose={() => setShowControls(false)}
        gameId="rocket_raid"
      />
    </div>
  );
};
