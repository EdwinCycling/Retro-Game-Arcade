/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Sinclair ZX Spectrum 48K Arcade Cabinet Component for Manic Miner (1983)
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  Volume2,
  VolumeX,
  Tv,
  RotateCcw,
  Trophy,
  BookOpen,
  ArrowRight,
  Zap,
  Music,
  Sparkles,
  Layers,
} from 'lucide-react';
import { ZX_WIDTH, ZX_HEIGHT, MANIC_MINER_CAVERNS } from '../game/manicMinerLevels';
import { ManicMinerEngine } from '../game/manicMinerEngine';
import { ManicMinerRenderer } from '../game/manicMinerRenderer';
import { manicMinerAudio } from '../game/manicMinerAudio';
import { getManicMinerScores, saveManicMinerScore, ManicMinerHighScore } from '../game/manicMinerHighScores';
import { ManicMinerHistoryModal } from './ManicMinerHistoryModal';
import { GameControlsModal, useGameControls } from './GameControlsModal';
import { haptics } from '../utils/haptics';

interface ManicMinerCabinetProps {
  onBackToLobby: () => void;
}

export const ManicMinerCabinet: React.FC<ManicMinerCabinetProps> = ({ onBackToLobby }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<ManicMinerEngine | null>(null);
  const rendererRef = useRef<ManicMinerRenderer | null>(null);

  // Synced state
  const [score, setScore] = useState(0);
  const [cavernIndex, setCavernIndex] = useState(0);
  const [cavernName, setCavernName] = useState('Central Cavern');
  const [lives, setLives] = useState(3);
  const [air, setAir] = useState(36);
  const [keysRemaining, setKeysRemaining] = useState(4);
  const [gameState, setGameState] = useState<string>('TITLE');
  const [isMuted, setIsMuted] = useState(false);
  const [musicMode, setMusicMode] = useState<'music' | 'effects'>('music');
  const [enableCRT, setEnableCRT] = useState(true);
  const [showTouchControls, setShowTouchControls] = useState(() => {
    return (
      typeof window !== 'undefined' &&
      ('ontouchstart' in window || navigator.maxTouchPoints > 0 || window.innerWidth < 1024)
    );
  });

  // Cheats / Trainer
  const [showTrainer, setShowTrainer] = useState(false);
  const [cheatLives, setCheatLives] = useState(false);
  const [cheatAir, setCheatAir] = useState(false);
  const [cheatMoonJump, setCheatMoonJump] = useState(false);

  // Modals
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const { showControls, setShowControls } = useGameControls('manic_miner');
  const [showHighScoresModal, setShowHighScoresModal] = useState(false);
  const [highScores, setHighScores] = useState<ManicMinerHighScore[]>(getManicMinerScores());
  const [initials, setInitials] = useState('');
  const [hasSubmittedScore, setHasSubmittedScore] = useState(false);

  // Initialize Engine and Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    const engine = new ManicMinerEngine();
    const renderer = new ManicMinerRenderer(ctx);
    renderer.enableCRT = enableCRT;

    engineRef.current = engine;
    rendererRef.current = renderer;

    const scores = getManicMinerScores();
    setHighScores(scores);
    if (scores.length > 0) {
      engine.highScore = scores[0].score;
    }

    const unsubscribe = engine.subscribe(() => {
      setScore(engine.score);
      setCavernIndex(engine.currentCavernIndex);
      setCavernName(engine.cavern.name);
      setLives(engine.lives);
      setAir(Math.floor(engine.air));
      setKeysRemaining(engine.keysRemaining);
      setGameState(engine.state);
      setMusicMode(engine.musicMode);
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

    // Keyboard handlers
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      const key = e.key.toLowerCase();

      // Controls: O (left), P (right), Space / ArrowUp (jump)
      if (key === 'o' || key === 'arrowleft' || key === 'a') {
        engine.inputLeft = true;
      }
      if (key === 'p' || key === 'arrowright' || key === 'd') {
        engine.inputRight = true;
      }
      if (key === ' ' || key === 'arrowup' || key === 'w' || key === 'enter') {
        if (engine.state === 'TITLE') {
          engine.startGame();
        } else {
          engine.inputJump = true;
        }
      }
      if (key === 'm') {
        engine.toggleMusic();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key === 'o' || key === 'arrowleft' || key === 'a') {
        engine.inputLeft = false;
      }
      if (key === 'p' || key === 'arrowright' || key === 'd') {
        engine.inputRight = false;
      }
      if (key === ' ' || key === 'arrowup' || key === 'w' || key === 'enter') {
        engine.inputJump = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      cancelAnimationFrame(animationFrameId);
      unsubscribe();
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      manicMinerAudio.stopMusic();
    };
  }, []);

  // Sync CRT
  useEffect(() => {
    if (rendererRef.current) {
      rendererRef.current.enableCRT = enableCRT;
    }
  }, [enableCRT]);

  // Audio mute toggle
  const toggleMute = () => {
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    manicMinerAudio.setMuted(nextMute);
  };

  // High score submission
  const handleScoreSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!initials.trim() || hasSubmittedScore) return;
    const updated = saveManicMinerScore(score, initials, cavernName);
    setHighScores(updated);
    setHasSubmittedScore(true);
    haptics.success();
  };

  const handleStartGame = () => {
    haptics.medium();
    if (engineRef.current) {
      engineRef.current.startGame();
    }
  };

  const handleWarpCavern = (index: number) => {
    haptics.light();
    if (engineRef.current) {
      engineRef.current.warpToCavern(index);
    }
  };

  const toggleTrainerLife = () => {
    const next = !cheatLives;
    setCheatLives(next);
    if (engineRef.current) engineRef.current.cheatInfiniteLives = next;
    haptics.light();
  };

  const toggleTrainerAir = () => {
    const next = !cheatAir;
    setCheatAir(next);
    if (engineRef.current) engineRef.current.cheatInfiniteAir = next;
    haptics.light();
  };

  const toggleTrainerMoonJump = () => {
    const next = !cheatMoonJump;
    setCheatMoonJump(next);
    if (engineRef.current) engineRef.current.cheatMoonJump = next;
    haptics.light();
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex flex-col items-center justify-between p-2 sm:p-4 select-none font-sans">
      
      {/* Top Header Bar */}
      <header className="w-full max-w-5xl flex items-center justify-between gap-2 py-2 px-3 rounded-2xl bg-neutral-900/90 border border-neutral-800 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onBackToLobby}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-bold text-neutral-300 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Lobby</span>
          </button>
          
          <div className="h-4 w-px bg-neutral-700" />
          
          <div className="flex items-center gap-2">
            <span className="text-base">⛏️</span>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-mono text-xs sm:text-sm font-black text-yellow-400">
                  MANIC MINER
                </span>
                <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-yellow-950 text-yellow-300 border border-yellow-700">
                  SINCLAIR 48K
                </span>
              </div>
              <span className="text-[10px] text-neutral-400 font-mono hidden sm:inline">
                Matthew Smith • Bug-Byte 1983
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setShowTrainer(!showTrainer)}
            className={`p-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-1 cursor-pointer ${
              showTrainer
                ? 'bg-yellow-500 text-black shadow-[0_0_12px_rgba(234,179,8,0.5)]'
                : 'bg-neutral-800 text-yellow-300 hover:bg-neutral-700'
            }`}
            title="ZX Poke Trainer (Cheats)"
          >
            <Sparkles className="w-4 h-4" />
            <span className="hidden md:inline">POKE 6031769</span>
          </button>

          <button
            type="button"
            onClick={() => engineRef.current?.toggleMusic()}
            className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs transition-colors cursor-pointer"
            title="Toggle In-Game Beeper Music"
          >
            <Music className={`w-4 h-4 ${musicMode === 'music' ? 'text-yellow-400' : 'text-neutral-500'}`} />
          </button>

          <button
            type="button"
            onClick={toggleMute}
            className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs transition-colors cursor-pointer"
            title="Mute/Unmute"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>

          <button
            type="button"
            onClick={() => setEnableCRT(!enableCRT)}
            className={`p-2 rounded-xl text-xs transition-colors cursor-pointer ${
              enableCRT ? 'bg-cyan-950 text-cyan-400 border border-cyan-700' : 'bg-neutral-800 text-neutral-400'
            }`}
            title="Toggle CRT Scanlines"
          >
            <Tv className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => setShowHighScoresModal(true)}
            className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-yellow-400 text-xs transition-colors cursor-pointer"
            title="High Scores"
          >
            <Trophy className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => setShowHistoryModal(true)}
            className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-yellow-400 text-xs transition-colors cursor-pointer"
            title="Historical Dossier"
          >
            <BookOpen className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Trainer / Cheat Code Drawer (Poke 6031769) */}
      {showTrainer && (
        <div className="w-full max-w-5xl my-2 p-3 rounded-2xl bg-yellow-950/40 border border-yellow-500/40 font-mono text-xs flex flex-wrap items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-2">
            <span className="text-yellow-400 font-black">⚡ MATTHEW SMITH TRAINER:</span>
            <span className="text-neutral-400">Originele ZX Spectrum Pokes</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={toggleTrainerLife}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold border cursor-pointer transition-all ${
                cheatLives ? 'bg-yellow-400 text-black border-yellow-300' : 'bg-neutral-900 text-neutral-400 border-neutral-700'
              }`}
            >
              ❤️ Oneindig Levens
            </button>
            <button
              type="button"
              onClick={toggleTrainerAir}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold border cursor-pointer transition-all ${
                cheatAir ? 'bg-cyan-400 text-black border-cyan-300' : 'bg-neutral-900 text-neutral-400 border-neutral-700'
              }`}
            >
              💨 Oneindig Zuurstof
            </button>
            <button
              type="button"
              onClick={toggleTrainerMoonJump}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold border cursor-pointer transition-all ${
                cheatMoonJump ? 'bg-magenta-400 text-black border-magenta-300' : 'bg-neutral-900 text-neutral-400 border-neutral-700'
              }`}
            >
              🪂 Moon Jump &amp; Geen Valschade
            </button>
          </div>
        </div>
      )}

      {/* Main ZX Spectrum Cabinet Casing */}
      <main className="relative flex-1 flex flex-col items-center justify-center my-2 w-full max-w-4xl">
        
        {/* Spectrum Rubber Keyboard Outer Frame */}
        <div className="relative p-3 sm:p-5 rounded-3xl bg-[#121216] border-4 border-neutral-700 shadow-[0_0_40px_rgba(0,0,0,0.8),inset_0_2px_4px_rgba(255,255,255,0.1)] flex flex-col items-center">
          
          {/* Top Spectrum Rainbow Stripe Logo */}
          <div className="w-full flex items-center justify-between px-2 pb-2 border-b border-neutral-800">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-black tracking-widest text-neutral-300">
                sinclair
              </span>
              <span className="text-xs font-mono font-bold text-neutral-400">
                ZX Spectrum 48K
              </span>
            </div>
            {/* 4-Color Spectrum Rainbow */}
            <div className="flex h-2.5 w-16 rounded overflow-hidden shadow">
              <div className="flex-1 bg-red-600" />
              <div className="flex-1 bg-yellow-400" />
              <div className="flex-1 bg-green-500" />
              <div className="flex-1 bg-cyan-400" />
            </div>
          </div>

          {/* CRT Screen Bezel */}
          <div className="relative mt-3 rounded-2xl bg-black p-2 sm:p-3 border-2 border-neutral-800 shadow-[inset_0_0_20px_rgba(0,0,0,0.9)] overflow-hidden">
            <canvas
              ref={canvasRef}
              width={ZX_WIDTH}
              height={ZX_HEIGHT}
              className="w-[280px] h-[210px] xs:w-[320px] xs:h-[240px] sm:w-[512px] sm:h-[384px] md:w-[640px] md:h-[480px] rounded-lg image-rendering-pixelated bg-black shadow-2xl block"
              style={{ imageRendering: 'pixelated' }}
            />
          </div>

          {/* Bottom Cabinet Quick Status */}
          <div className="w-full mt-3 flex items-center justify-between text-[11px] font-mono text-neutral-400 px-2">
            <div>
              <span className="text-yellow-400 font-bold">{cavernName}</span> (Grot {cavernIndex + 1}/20)
            </div>
            <div className="flex gap-4">
              <span>SLEUTELS: <strong className="text-yellow-300">{keysRemaining}</strong></span>
              <span>ZUURSTOF: <strong className={air > 10 ? 'text-emerald-400' : 'text-red-400'}>{air}s</strong></span>
              <span>SCORE: <strong className="text-white">{score}</strong></span>
            </div>
          </div>
        </div>

        {/* Cavern Quick Warp selector */}
        <div className="w-full max-w-2xl mt-3 flex items-center justify-center gap-1.5 overflow-x-auto pb-1">
          <span className="text-[10px] font-mono text-neutral-500 mr-1 flex items-center gap-1">
            <Layers className="w-3 h-3" /> Warp:
          </span>
          {MANIC_MINER_CAVERNS.map((c, i) => (
            <button
              key={c.id}
              type="button"
              onClick={() => handleWarpCavern(i)}
              className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition-colors cursor-pointer whitespace-nowrap ${
                cavernIndex === i
                  ? 'bg-yellow-400 text-black shadow-[0_0_8px_rgba(234,179,8,0.6)]'
                  : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-400'
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </main>

      {/* Touch / Gamepad Controls (Mobile & Tablet) */}
      <div className="w-full max-w-3xl flex items-center justify-between gap-4 px-3 py-2">
        {/* Directional Pad */}
        <div className="flex gap-2">
          <button
            type="button"
            onPointerDown={() => {
              if (engineRef.current) engineRef.current.inputLeft = true;
              haptics.light();
            }}
            onPointerUp={() => {
              if (engineRef.current) engineRef.current.inputLeft = false;
            }}
            onPointerLeave={() => {
              if (engineRef.current) engineRef.current.inputLeft = false;
            }}
            className="w-16 h-14 rounded-2xl bg-neutral-800 active:bg-yellow-500 border border-neutral-700 flex flex-col items-center justify-center text-xs font-mono font-bold active:text-black shadow-lg cursor-pointer touch-none"
          >
            <span>◀ [O]</span>
            <span className="text-[9px] text-neutral-400">LINKS</span>
          </button>

          <button
            type="button"
            onPointerDown={() => {
              if (engineRef.current) engineRef.current.inputRight = true;
              haptics.light();
            }}
            onPointerUp={() => {
              if (engineRef.current) engineRef.current.inputRight = false;
            }}
            onPointerLeave={() => {
              if (engineRef.current) engineRef.current.inputRight = false;
            }}
            className="w-16 h-14 rounded-2xl bg-neutral-800 active:bg-yellow-500 border border-neutral-700 flex flex-col items-center justify-center text-xs font-mono font-bold active:text-black shadow-lg cursor-pointer touch-none"
          >
            <span>[P] ▶</span>
            <span className="text-[9px] text-neutral-400">RECHTS</span>
          </button>
        </div>

        {/* Start / Jump Action */}
        <div className="flex gap-2">
          {gameState === 'TITLE' ? (
            <button
              type="button"
              onClick={handleStartGame}
              className="px-8 h-14 rounded-2xl bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 text-black font-mono font-black text-sm tracking-wider shadow-[0_0_20px_rgba(234,179,8,0.5)] active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Zap className="w-5 h-5 fill-black" />
              <span>START SPEL</span>
            </button>
          ) : (
            <button
              type="button"
              onPointerDown={() => {
                if (engineRef.current) engineRef.current.inputJump = true;
                haptics.light();
              }}
              onPointerUp={() => {
                if (engineRef.current) engineRef.current.inputJump = false;
              }}
              onPointerLeave={() => {
                if (engineRef.current) engineRef.current.inputJump = false;
              }}
              className="px-8 h-14 rounded-2xl bg-gradient-to-r from-yellow-400 to-amber-500 active:from-yellow-300 text-black font-mono font-black text-sm tracking-wider shadow-[0_0_20px_rgba(234,179,8,0.5)] active:scale-95 transition-all flex flex-col items-center justify-center cursor-pointer touch-none"
            >
              <span>SPRING [SPATIE]</span>
              <span className="text-[10px] text-yellow-950 font-bold">VASTE PARABOOL</span>
            </button>
          )}
        </div>
      </div>

      {/* High Scores Modal */}
      {showHighScoresModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-md bg-neutral-900 border-2 border-yellow-500/80 rounded-3xl p-6 text-neutral-200 shadow-[0_0_40px_rgba(234,179,8,0.4)]">
            <div className="flex items-center justify-between mb-4 border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-400" />
                <h3 className="font-mono text-base font-bold text-white">
                  MANIC MINER HALL OF FAME
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowHighScoresModal(false)}
                className="text-neutral-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Score List */}
            <div className="space-y-2 mb-6 font-mono text-xs">
              {highScores.map((entry, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 rounded-xl bg-neutral-950/60 border border-neutral-800"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-neutral-500 w-4">#{idx + 1}</span>
                    <span className="text-yellow-400 font-bold">{entry.initials}</span>
                    <span className="text-neutral-400 text-[10px]">({entry.cavern})</span>
                  </div>
                  <span className="text-white font-bold">{entry.score.toLocaleString()}</span>
                </div>
              ))}
            </div>

            {/* Submit current score */}
            {score > 0 && !hasSubmittedScore && (
              <form onSubmit={handleScoreSubmit} className="space-y-3 pt-3 border-t border-neutral-800">
                <p className="text-xs font-mono text-yellow-300">
                  Jouw Score: <strong>{score}</strong> in {cavernName}
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    maxLength={3}
                    value={initials}
                    onChange={(e) => setInitials(e.target.value.toUpperCase())}
                    placeholder="INITIALEN"
                    className="w-24 px-3 py-2 rounded-xl bg-neutral-950 border border-yellow-500/50 text-white font-mono font-bold text-center text-sm focus:outline-none focus:border-yellow-400"
                  />
                  <button
                    type="submit"
                    className="flex-1 py-2 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-black font-mono font-bold text-xs shadow cursor-pointer"
                  >
                    Score Opslaan
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* History Dossier Modal */}
      <ManicMinerHistoryModal
        isOpen={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
        onPlay={handleStartGame}
      />
    </div>
  );
};
