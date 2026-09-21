/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Sinclair ZX81 Membrane Arcade Cabinet Component for 3D Monster Maze (1981)
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
  Sparkles,
  Compass,
  MapPin,
  Flame,
  Zap,
  Play,
  Maximize2,
} from 'lucide-react';
import {
  MonsterMazeEngine,
  DIR_VECTORS,
} from '../game/monsterMazeEngine';
import {
  MonsterMazeRenderer,
  ZX81_SCREEN_WIDTH,
  ZX81_SCREEN_HEIGHT,
  DisplayMode,
} from '../game/monsterMazeRenderer';
import { monsterMazeAudio } from '../game/monsterMazeAudio';
import {
  getMonsterMazeScores,
  saveMonsterMazeScore,
  MonsterMazeScore,
} from '../game/monsterMazeHighScores';
import { MonsterMazeHistoryModal } from './MonsterMazeHistoryModal';
import { haptics } from '../utils/haptics';

interface MonsterMazeCabinetProps {
  onBackToLobby: () => void;
}

export const MonsterMazeCabinet: React.FC<MonsterMazeCabinetProps> = ({ onBackToLobby }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<MonsterMazeEngine | null>(null);
  const rendererRef = useRef<MonsterMazeRenderer | null>(null);

  // Synced state
  const [score, setScore] = useState(0);
  const [steps, setSteps] = useState(0);
  const [playerDir, setPlayerDir] = useState<string>('EAST');
  const [gameState, setGameState] = useState<string>('TITLE');
  const [statusMessage, setStatusMessage] = useState<string>('Rex lies in wait.');
  const [isMuted, setIsMuted] = useState(false);
  const [displayMode, setDisplayMode] = useState<DisplayMode>('bw');
  const [enableScanlines, setEnableScanlines] = useState(true);

  // Trainer / Cheats
  const [showTrainer, setShowTrainer] = useState(false);
  const [cheatRadar, setCheatRadar] = useState(false);
  const [cheatFreeze, setCheatFreeze] = useState(false);
  const [cheatSpeed, setCheatSpeed] = useState(false);

  // Modals
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showHighScoresModal, setShowHighScoresModal] = useState(false);
  const [highScores, setHighScores] = useState<MonsterMazeScore[]>(getMonsterMazeScores());
  const [initials, setInitials] = useState('');
  const [hasSubmittedScore, setHasSubmittedScore] = useState(false);

  // Initialize Engine and Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    const engine = new MonsterMazeEngine();
    const renderer = new MonsterMazeRenderer(ctx);
    renderer.displayMode = displayMode;
    renderer.enableScanlines = enableScanlines;

    engineRef.current = engine;
    rendererRef.current = renderer;

    const scores = getMonsterMazeScores();
    setHighScores(scores);

    const unsubscribe = engine.subscribe(() => {
      setScore(engine.score);
      setSteps(engine.steps);
      setPlayerDir(DIR_VECTORS[engine.playerDir].name);
      setGameState(engine.state);
      setStatusMessage(engine.statusMessage);
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

    // Keyboard handlers (Authentic ZX81 keys: 5,6,7,8,0, and standard WASD/Arrows)
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      const key = e.key.toLowerCase();

      if (engine.state === 'TITLE') {
        if (key === ' ' || key === 'enter' || key === '6') {
          engine.startGame();
          haptics.medium();
        }
        return;
      }

      // Turn Left: 5, ArrowLeft, A, Q
      if (key === '5' || key === 'arrowleft' || key === 'a' || key === 'q') {
        engine.turnLeft();
        haptics.light();
      }
      // Step Forward: 6, ArrowUp, W, E
      else if (key === '6' || key === 'arrowup' || key === 'w' || key === 'e') {
        engine.stepForward();
        haptics.light();
      }
      // Step Backward: 7, ArrowDown, S, D
      else if (key === '7' || key === 'arrowdown' || key === 's' || key === 'd') {
        engine.stepBackward();
        haptics.light();
      }
      // Turn Right: 8, ArrowRight, R, F
      else if (key === '8' || key === 'arrowright' || key === 'r' || key === 'f') {
        engine.turnRight();
        haptics.light();
      }
      // About Turn / Look Behind: 0, B, Space
      else if (key === '0' || key === 'b') {
        engine.lookBehind();
        haptics.light();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      cancelAnimationFrame(animationFrameId);
      unsubscribe();
      window.removeEventListener('keydown', handleKeyDown);
      monsterMazeAudio.stopHeartbeat();
    };
  }, []);

  // Sync display mode
  useEffect(() => {
    if (rendererRef.current) {
      rendererRef.current.displayMode = displayMode;
      rendererRef.current.enableScanlines = enableScanlines;
    }
  }, [displayMode, enableScanlines]);

  const toggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    monsterMazeAudio.setMuted(next);
  };

  const handleStartGame = () => {
    haptics.medium();
    if (engineRef.current) {
      engineRef.current.startGame();
    }
  };

  const cycleDisplayMode = () => {
    const modes: DisplayMode[] = ['bw', 'green', 'amber'];
    const nextIdx = (modes.indexOf(displayMode) + 1) % modes.length;
    setDisplayMode(modes[nextIdx]);
    haptics.light();
  };

  const toggleCheatRadar = () => {
    const next = !cheatRadar;
    setCheatRadar(next);
    if (engineRef.current) engineRef.current.cheatRadar = next;
    haptics.light();
  };

  const toggleCheatFreeze = () => {
    const next = !cheatFreeze;
    setCheatFreeze(next);
    if (engineRef.current) engineRef.current.cheatFreezeRex = next;
    haptics.light();
  };

  const toggleCheatSpeed = () => {
    const next = !cheatSpeed;
    setCheatSpeed(next);
    if (engineRef.current) engineRef.current.cheatSuperSpeed = next;
    haptics.light();
  };

  const handleScoreSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!initials.trim() || hasSubmittedScore) return;
    const isEscaped = gameState === 'ESCAPED';
    const updated = saveMonsterMazeScore(score, initials, isEscaped, steps);
    setHighScores(updated);
    setHasSubmittedScore(true);
    haptics.success();
  };

  return (
    <div className="min-h-screen bg-[#070709] text-white flex flex-col items-center justify-between p-2 sm:p-4 select-none font-sans">
      
      {/* Top Header Bar */}
      <header className="w-full max-w-4xl flex items-center justify-between gap-2 py-2 px-3 rounded-2xl bg-neutral-900/90 border border-neutral-800 backdrop-blur-md">
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
            <span className="text-base">🦖</span>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-mono text-xs sm:text-sm font-black text-emerald-400">
                  3D MONSTER MAZE
                </span>
                <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-700">
                  SINCLAIR ZX81 16K
                </span>
              </div>
              <span className="text-[10px] text-neutral-400 font-mono hidden sm:inline">
                Malcolm Evans • J.K. Greye 1981
              </span>
            </div>
          </div>
        </div>

        {/* Header Action Controls */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setShowTrainer(!showTrainer)}
            className={`p-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-1 cursor-pointer ${
              showTrainer
                ? 'bg-emerald-500 text-black shadow-[0_0_12px_rgba(16,185,129,0.5)]'
                : 'bg-neutral-800 text-emerald-300 hover:bg-neutral-700'
            }`}
            title="ZX81 Trainer & Radar"
          >
            <Sparkles className="w-4 h-4" />
            <span className="hidden md:inline">RADAR &amp; POKES</span>
          </button>

          <button
            type="button"
            onClick={cycleDisplayMode}
            className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs transition-colors cursor-pointer font-mono flex items-center gap-1"
            title="Display Phosphor Palette"
          >
            <span className="w-2.5 h-2.5 rounded-full" style={{
              backgroundColor: displayMode === 'bw' ? '#ffffff' : displayMode === 'green' ? '#33ff33' : '#ffaa00'
            }} />
            <span className="uppercase text-[10px] hidden sm:inline">{displayMode}</span>
          </button>

          <button
            type="button"
            onClick={toggleMute}
            className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs transition-colors cursor-pointer"
            title="Mute/Unmute Tension Audio"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>

          <button
            type="button"
            onClick={() => setEnableScanlines(!enableScanlines)}
            className={`p-2 rounded-xl text-xs transition-colors cursor-pointer ${
              enableScanlines ? 'bg-emerald-950 text-emerald-400 border border-emerald-700' : 'bg-neutral-800 text-neutral-400'
            }`}
            title="CRT Scanlines"
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
            className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-emerald-400 text-xs transition-colors cursor-pointer"
            title="Historical Dossier"
          >
            <BookOpen className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Trainer / Cheats Bar */}
      {showTrainer && (
        <div className="w-full max-w-4xl my-2 p-3 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 font-mono text-xs flex flex-wrap items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-2">
            <span className="text-emerald-400 font-black">⚡ ZX81 POKE TRAINER:</span>
            <span className="text-neutral-400">Malcolm Evans Debug Tools</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={toggleCheatRadar}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold border cursor-pointer transition-all ${
                cheatRadar ? 'bg-emerald-400 text-black border-emerald-300 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-neutral-900 text-neutral-400 border-neutral-700'
              }`}
            >
              🗺️ 3D Radar Kaart
            </button>
            <button
              type="button"
              onClick={toggleCheatFreeze}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold border cursor-pointer transition-all ${
                cheatFreeze ? 'bg-cyan-400 text-black border-cyan-300' : 'bg-neutral-900 text-neutral-400 border-neutral-700'
              }`}
            >
              🧊 Bevries Rex (T-Rex Pause)
            </button>
            <button
              type="button"
              onClick={toggleCheatSpeed}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold border cursor-pointer transition-all ${
                cheatSpeed ? 'bg-yellow-400 text-black border-yellow-300' : 'bg-neutral-900 text-neutral-400 border-neutral-700'
              }`}
            >
              ⚡ Super Sprint (Geen Cooldown)
            </button>
          </div>
        </div>
      )}

      {/* Main ZX81 Wedge Cabinet Casing */}
      <main className="relative flex-1 flex flex-col items-center justify-center my-2 w-full max-w-3xl">
        
        {/* Sinclair ZX81 Matte Black Chassis */}
        <div className="relative p-3 sm:p-5 rounded-3xl bg-[#0f0f13] border-4 border-neutral-800 shadow-[0_0_50px_rgba(0,0,0,0.9),inset_0_2px_4px_rgba(255,255,255,0.08)] flex flex-col items-center w-full">
          
          {/* Top Chassis Branding */}
          <div className="w-full flex items-center justify-between px-3 pb-2 border-b border-neutral-800">
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-black tracking-widest text-red-500">
                sinclair
              </span>
              <span className="text-xs font-mono font-black text-neutral-200">
                ZX81
              </span>
            </div>
            
            <div className="flex items-center gap-2 text-[10px] font-mono text-neutral-400">
              <span className="px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-emerald-400">
                16K RAM PACK ATTACHED
              </span>
            </div>
          </div>

          {/* CRT Screen Frame */}
          <div className="relative mt-3 rounded-2xl bg-black p-2 sm:p-3 border-2 border-neutral-800 shadow-[inset_0_0_24px_rgba(0,0,0,0.95)] overflow-hidden">
            <canvas
              ref={canvasRef}
              width={ZX81_SCREEN_WIDTH}
              height={ZX81_SCREEN_HEIGHT}
              className="w-[280px] h-[210px] xs:w-[320px] xs:h-[240px] sm:w-[512px] sm:h-[384px] md:w-[600px] md:h-[450px] rounded-lg image-rendering-pixelated bg-black shadow-2xl block"
              style={{ imageRendering: 'pixelated' }}
            />
          </div>

          {/* Sinclair ZX81 Membrane Keybar Representation */}
          <div className="w-full mt-3 pt-2 border-t border-neutral-800 flex items-center justify-between text-[11px] font-mono text-neutral-400 px-2">
            <div className="flex items-center gap-2">
              <span className="text-emerald-400 font-bold">STATUS:</span>
              <span className="text-white font-bold">{statusMessage}</span>
            </div>
            <div className="flex gap-3">
              <span>RICHTING: <strong className="text-emerald-300">{playerDir}</strong></span>
              <span>STAPPEN: <strong className="text-white">{steps}</strong></span>
            </div>
          </div>
        </div>
      </main>

      {/* Sinclair ZX81 Authentic Membrane Directional Controls & Gamepad */}
      <div className="w-full max-w-2xl flex flex-col sm:flex-row items-center justify-between gap-3 px-3 py-2 bg-neutral-900/80 rounded-2xl border border-neutral-800">
        
        {/* Membrane Number Controls (Authentic 5, 6, 7, 8, 0 keypad) */}
        <div className="flex items-center gap-1.5 flex-wrap justify-center font-mono">
          <button
            type="button"
            onPointerDown={() => {
              if (engineRef.current) engineRef.current.turnLeft();
              haptics.light();
            }}
            className="w-12 h-12 rounded-xl bg-neutral-800 active:bg-emerald-500 border border-neutral-700 flex flex-col items-center justify-center text-xs font-bold active:text-black shadow cursor-pointer touch-none"
          >
            <span>[5]</span>
            <span className="text-[8px] text-neutral-400">DRAAI ◀</span>
          </button>

          <button
            type="button"
            onPointerDown={() => {
              if (engineRef.current) engineRef.current.stepForward();
              haptics.light();
            }}
            className="w-14 h-12 rounded-xl bg-neutral-800 active:bg-emerald-500 border border-neutral-700 flex flex-col items-center justify-center text-xs font-bold active:text-black shadow cursor-pointer touch-none"
          >
            <span>▲ [6]</span>
            <span className="text-[8px] text-neutral-400">VOORUIT</span>
          </button>

          <button
            type="button"
            onPointerDown={() => {
              if (engineRef.current) engineRef.current.stepBackward();
              haptics.light();
            }}
            className="w-14 h-12 rounded-xl bg-neutral-800 active:bg-emerald-500 border border-neutral-700 flex flex-col items-center justify-center text-xs font-bold active:text-black shadow cursor-pointer touch-none"
          >
            <span>▼ [7]</span>
            <span className="text-[8px] text-neutral-400">ACHTER</span>
          </button>

          <button
            type="button"
            onPointerDown={() => {
              if (engineRef.current) engineRef.current.turnRight();
              haptics.light();
            }}
            className="w-12 h-12 rounded-xl bg-neutral-800 active:bg-emerald-500 border border-neutral-700 flex flex-col items-center justify-center text-xs font-bold active:text-black shadow cursor-pointer touch-none"
          >
            <span>[8]</span>
            <span className="text-[8px] text-neutral-400">▶ DRAAI</span>
          </button>

          <button
            type="button"
            onPointerDown={() => {
              if (engineRef.current) engineRef.current.lookBehind();
              haptics.light();
            }}
            className="w-14 h-12 rounded-xl bg-neutral-800 active:bg-cyan-500 border border-neutral-700 flex flex-col items-center justify-center text-xs font-bold active:text-black shadow cursor-pointer touch-none"
          >
            <span>↺ [0]</span>
            <span className="text-[8px] text-neutral-400">OMKEREN</span>
          </button>
        </div>

        {/* Start / Action Button */}
        <div>
          {gameState === 'TITLE' ? (
            <button
              type="button"
              onClick={handleStartGame}
              className="px-6 h-12 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-300 text-black font-mono font-black text-xs tracking-wider shadow-[0_0_20px_rgba(16,185,129,0.5)] active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-black" />
              <span>START SPEL [SPATIE]</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleStartGame}
              className="px-4 h-12 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-mono text-xs flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Herstart Doolhof</span>
            </button>
          )}
        </div>
      </div>

      {/* High Scores Modal */}
      {showHighScoresModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-md bg-neutral-900 border-2 border-emerald-500/80 rounded-3xl p-6 text-neutral-200 shadow-[0_0_40px_rgba(16,185,129,0.4)]">
            <div className="flex items-center justify-between mb-4 border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-emerald-400" />
                <h3 className="font-mono text-base font-bold text-white">
                  3D MONSTER MAZE ERELIJST
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
                    <span className="text-emerald-400 font-bold">{entry.initials}</span>
                    <span className="text-neutral-400 text-[10px]">
                      ({entry.escaped ? '🏆 ONTSNAPT' : '💀 GEVANGEN'}, {entry.steps} stappen)
                    </span>
                  </div>
                  <span className="text-white font-bold">{entry.score.toLocaleString()}</span>
                </div>
              ))}
            </div>

            {/* Submit current score */}
            {score > 0 && !hasSubmittedScore && (
              <form onSubmit={handleScoreSubmit} className="space-y-3 pt-3 border-t border-neutral-800">
                <p className="text-xs font-mono text-emerald-300">
                  Jouw Score: <strong>{score}</strong> ({steps} stappen)
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    maxLength={3}
                    value={initials}
                    onChange={(e) => setInitials(e.target.value.toUpperCase())}
                    placeholder="INITIALEN"
                    className="w-24 px-3 py-2 rounded-xl bg-neutral-950 border border-emerald-500/50 text-white font-mono font-bold text-center text-sm focus:outline-none focus:border-emerald-400"
                  />
                  <button
                    type="submit"
                    className="flex-1 py-2 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-black font-mono font-bold text-xs shadow cursor-pointer"
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
      <MonsterMazeHistoryModal
        isOpen={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
        onPlay={handleStartGame}
      />
    </div>
  );
};
