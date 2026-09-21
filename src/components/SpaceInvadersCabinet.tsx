import React, { useEffect, useRef, useState, useCallback } from 'react';
import { SpaceInvadersEngine } from '../game/spaceInvadersEngine';
import { SpaceInvadersRenderer } from '../game/spaceInvadersRenderer';
import { spaceAudio } from '../game/spaceInvadersAudio';
import { SpaceInvadersHistoryModal } from './SpaceInvadersHistoryModal';
import { SpaceInvadersLeaderboardModal } from './SpaceInvadersLeaderboardModal';
import { getSpaceHighScores, isSpaceScoreEligible } from '../game/spaceInvadersHighScores';
import { tiltController, TiltState } from '../utils/tiltController';
import { haptics } from '../utils/haptics';
import {
  ArrowLeft,
  Volume2,
  VolumeX,
  Tv,
  Smartphone,
  Vibrate,
  Trophy,
  RotateCcw,
  Pause,
  Play,
  HelpCircle,
  Crosshair,
  Gamepad2,
  Layers
} from 'lucide-react';
import { GameControlsModal, useGameControls } from './GameControlsModal';

export interface SpaceInvadersCabinetProps {
  onBackToLobby?: () => void;
}

export const SpaceInvadersCabinet: React.FC<SpaceInvadersCabinetProps> = ({ onBackToLobby }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<SpaceInvadersEngine | null>(null);
  const rendererRef = useRef<SpaceInvadersRenderer | null>(null);
  const animationFrameId = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(performance.now());

  // Game state
  const [score, setScore] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(() => {
    const scores = getSpaceHighScores();
    return scores.length > 0 ? scores[0].score : 3200;
  });
  const [wave, setWave] = useState<number>(1);
  const [lives, setLives] = useState<number>(3);
  const [gameState, setGameState] = useState<string>('READY');
  const [gameOverReason, setGameOverReason] = useState<'LIVES_DEPLETED' | 'INVASION_BREACH' | null>(null);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isCrtEnabled, setIsCrtEnabled] = useState<boolean>(true);

  // Modals
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const { showControls, setShowControls } = useGameControls('space_invaders');
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState<boolean>(false);
  const [pendingScore, setPendingScore] = useState<{ score: number; wave: number } | null>(null);

  // Tilt & Haptics
  const [isHapticsEnabled, setIsHapticsEnabled] = useState<boolean>(() => haptics.isEnabled());
  const [tiltState, setTiltState] = useState<TiltState>(() => tiltController.getState());

  // Listen to tilt controller changes
  useEffect(() => {
    const unsub = tiltController.subscribe((state) => {
      setTiltState(state);
      if (state.active && engineRef.current) {
        if (state.currentDirection === 'LEFT') {
          engineRef.current.setMoveLeft(true);
          engineRef.current.setMoveRight(false);
        } else if (state.currentDirection === 'RIGHT') {
          engineRef.current.setMoveRight(true);
          engineRef.current.setMoveLeft(false);
        } else {
          engineRef.current.setMoveLeft(false);
          engineRef.current.setMoveRight(false);
        }
      }
    });

    return () => {
      unsub();
      tiltController.stop();
    };
  }, []);

  // Initialize Canvas & Engine
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.imageSmoothingEnabled = false;

    const engine = new SpaceInvadersEngine(highScore);
    const renderer = new SpaceInvadersRenderer(ctx, SpaceInvadersEngine.CANVAS_WIDTH, SpaceInvadersEngine.CANVAS_HEIGHT);

    engineRef.current = engine;
    rendererRef.current = renderer;

    engine.onStateChange((st) => {
      setGameState(st);
    });

    engine.onGameOver((finalScore, finalWave, reason) => {
      setGameOverReason(reason);
      const eligibility = isSpaceScoreEligible(finalScore);
      if (eligibility.eligible) {
        setPendingScore({ score: finalScore, wave: finalWave });
        setIsLeaderboardOpen(true);
      }
    });

    // Game loop
    const loop = (currentTime: number) => {
      const dt = (currentTime - lastTimeRef.current) / 1000;
      lastTimeRef.current = currentTime;

      engine.update(dt);
      renderer.render(engine);

      // Sync React state
      setScore(engine.getScore());
      setWave(engine.getWave());
      setLives(engine.getPlayer().lives);

      animationFrameId.current = requestAnimationFrame(loop);
    };

    lastTimeRef.current = performance.now();
    animationFrameId.current = requestAnimationFrame(loop);

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      spaceAudio.stopUfoSound();
    };
  }, []);

  // Sync CRT toggle with renderer
  useEffect(() => {
    if (rendererRef.current) {
      rendererRef.current.setCrtEnabled(isCrtEnabled);
    }
  }, [isCrtEnabled]);

  // Keyboard Event Handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const engine = engineRef.current;
      if (!engine) return;

      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        engine.setMoveLeft(true);
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        engine.setMoveRight(true);
      } else if (e.key === ' ' || e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        e.preventDefault();
        engine.fireLaser();
      } else if (e.key === 'p' || e.key === 'P') {
        engine.togglePause();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const engine = engineRef.current;
      if (!engine) return;

      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        engine.setMoveLeft(false);
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        engine.setMoveRight(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Direct touch/pointer dragging on canvas
  const handleCanvasTouch = useCallback((e: React.TouchEvent<HTMLCanvasElement> | React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    const engine = engineRef.current;
    if (!canvas || !engine) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const scaleX = SpaceInvadersEngine.CANVAS_WIDTH / rect.width;
    const canvasX = (clientX - rect.left) * scaleX;

    // Center player cannon on finger touch position
    engine.setCannonX(canvasX - engine.getPlayer().width / 2);
  }, []);

  const handleRestart = () => {
    setGameOverReason(null);
    if (engineRef.current) {
      engineRef.current.initGame();
      haptics.light();
    }
  };

  const handleToggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    spaceAudio.setMuted(nextMuted);
  };

  const handleToggleHaptics = () => {
    const next = haptics.toggle();
    setIsHapticsEnabled(next);
  };

  const handleToggleTilt = async () => {
    if (tiltState.active) {
      tiltController.stop();
    } else {
      const granted = await tiltController.start((dir) => {
        if (engineRef.current) {
          engineRef.current.handleDirectionInput(dir);
        }
      });
      if (!granted && tiltController.isSupported()) {
        alert('Activeer bewegings- en oriëntatiesensoren in de browserinstellingen van je iPhone om de gyroscoop te gebruiken.');
      }
    }
  };

  const handleCalibrateTilt = () => {
    tiltController.calibrate();
    haptics.light();
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-screen bg-neutral-950 text-neutral-100 p-2 sm:p-4 select-none">
      
      {/* Cabinet Bezel Container */}
      <div className="w-full max-w-lg bg-neutral-900 border-4 border-neutral-800 rounded-3xl shadow-[0_0_60px_rgba(16,185,129,0.2)] p-3 sm:p-5 flex flex-col items-center">
        
        {/* Top Marquee Header */}
        <div className="w-full flex items-center justify-between gap-2 pb-3 mb-2 border-b border-neutral-800">
          <button
            onClick={onBackToLobby}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-bold transition-all cursor-pointer"
            title="Terug naar Arcade Lobby"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">LOBBY</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="text-xl">👾</span>
            <div className="text-center">
              <h1 className="font-mono font-black text-sm sm:text-base tracking-widest text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]">
                SPACE INVADERS
              </h1>
              <span className="text-[10px] font-mono text-neutral-400">1978 TAITO ARCADE</span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowControls(true)}
              className="p-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-yellow-400 transition-colors cursor-pointer"
              title="Besturing & Xbox Controller"
            >
              <Gamepad2 className="w-4 h-4 text-yellow-400" />
            </button>
            <button
              onClick={() => setIsHistoryOpen(true)}
              className="p-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors cursor-pointer"
              title="Arcade Geschiedenis & Trivia"
            >
              <HelpCircle className="w-4 h-4 text-emerald-400" />
            </button>
            <button
              onClick={() => setIsLeaderboardOpen(true)}
              className="p-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors cursor-pointer"
              title="High Scores Leaderboard"
            >
              <Trophy className="w-4 h-4 text-yellow-400" />
            </button>
          </div>
        </div>

        {/* Wave Selection Bar */}
        <div className="w-full flex items-center justify-between gap-1 overflow-x-auto py-1 px-2.5 mb-2 bg-neutral-950/90 border border-neutral-800 rounded-xl">
          <div className="flex items-center gap-1 text-[11px] font-mono text-neutral-400 mr-1 shrink-0">
            <Layers className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-bold text-neutral-200">GOLVEN:</span>
          </div>
          <div className="flex items-center gap-1 overflow-x-auto">
            {[
              { w: 1, label: 'W1 Classic', desc: 'Klassieke 1978 vloot (55 invaders)' },
              { w: 2, label: 'W2 Zigzag', desc: 'Snellere vloot & zigzag alien bommen' },
              { w: 3, label: 'W3 UFO Blitz', desc: 'Frequente Mystery UFO\'s & zware aanvallen' },
              { w: 4, label: 'W4 Hyper', desc: 'Hyper-speed formatie & snelle dalingshoek' },
              { w: 5, label: 'W5 Armada', desc: 'Maximale vuursnelheid & vloot dicht bij de bunkers' },
            ].map(({ w, label, desc }) => (
              <button
                key={w}
                type="button"
                onClick={() => {
                  engineRef.current?.setWave(w);
                  setWave(w);
                  haptics.light();
                }}
                className={`px-2 py-1 rounded-lg text-xs font-mono font-bold transition cursor-pointer shrink-0 border ${
                  wave === w
                    ? 'bg-emerald-500 text-black border-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.5)] font-black'
                    : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border-neutral-700'
                }`}
                title={desc}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Quick Toolbar (Sound, CRT, Haptics, Tilt + LEVEL BADGE) */}
        <div className="w-full flex items-center justify-between text-xs px-2.5 py-1.5 mb-2 bg-neutral-950/80 border border-neutral-800 rounded-xl">
          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleMute}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${isMuted ? 'text-red-400 bg-red-950/40' : 'text-emerald-400 bg-emerald-950/40'}`}
              title={isMuted ? 'Dempen opheffen' : 'Geluid dempen'}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setIsCrtEnabled(!isCrtEnabled)}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${isCrtEnabled ? 'text-cyan-400 bg-cyan-950/40' : 'text-neutral-500 bg-neutral-800'}`}
              title="CRT Scanlines & Glow Filter"
            >
              <Tv className="w-4 h-4" />
            </button>
            <button
              onClick={handleToggleHaptics}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${isHapticsEnabled ? 'text-purple-400 bg-purple-950/40' : 'text-neutral-500 bg-neutral-800'}`}
              title="Trillingen / Haptics"
            >
              <Vibrate className="w-4 h-4" />
            </button>
          </div>

          {/* Prominent LEVEL / WAVE Badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-emerald-950/60 border border-emerald-500/40 font-mono">
            <span className="text-[10px] text-emerald-400/80 font-bold">LEVEL</span>
            <span className="text-sm font-black text-emerald-300 drop-shadow-[0_0_6px_rgba(16,185,129,0.8)]">
              {wave.toString().padStart(2, '0')}
            </span>
          </div>

          {/* iPhone Tilt Steering Button */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleToggleTilt}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                tiltState.active
                  ? 'bg-emerald-500 text-black shadow-[0_0_12px_rgba(16,185,129,0.6)]'
                  : 'bg-neutral-800 text-neutral-400 hover:text-white'
              }`}
              title="Bedien met iPhone gyroscoop kanteling"
            >
              <Smartphone className={`w-3.5 h-3.5 ${tiltState.active ? 'animate-pulse' : ''}`} />
              <span>{tiltState.active ? 'GYRO AAN' : 'GYRO TILT'}</span>
            </button>
            {tiltState.active && (
              <button
                onClick={handleCalibrateTilt}
                className="p-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-[10px] cursor-pointer"
                title="Kalibreer neutrale hoek"
              >
                KALIBREER
              </button>
            )}
          </div>
        </div>

        {/* Live Tilt Angle Bar Indicator (When Gyro Active) */}
        {tiltState.active && (
          <div className="w-full bg-neutral-950 border border-emerald-500/30 rounded-lg p-2 mb-2 flex items-center justify-between text-[11px] font-mono">
            <div className="flex items-center gap-2">
              <Crosshair className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-neutral-400">TILT STATUS:</span>
              <span className={`font-bold ${tiltState.currentDirection ? 'text-emerald-400' : 'text-neutral-500'}`}>
                {tiltState.currentDirection || 'NEUTRAAL'}
              </span>
            </div>
            <div className="flex items-center gap-2 text-neutral-400">
              <span>HOEK: {tiltState.gamma}°</span>
              <div className="w-16 h-2 bg-neutral-800 rounded-full overflow-hidden relative">
                <div
                  className="absolute top-0 bottom-0 bg-emerald-400 transition-all duration-75"
                  style={{
                    left: `${Math.max(0, Math.min(100, 50 + (tiltState.gamma / 40) * 50))}%`,
                    width: '6px',
                    transform: 'translateX(-50%)'
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* CRT Arcade Monitor Frame */}
        <div className="relative w-full aspect-[448/520] max-h-[68vh] rounded-2xl overflow-hidden border-4 border-neutral-950 shadow-inner bg-black flex items-center justify-center">
          <canvas
            ref={canvasRef}
            width={SpaceInvadersEngine.CANVAS_WIDTH}
            height={SpaceInvadersEngine.CANVAS_HEIGHT}
            onTouchStart={(e) => {
              handleCanvasTouch(e);
              engineRef.current?.fireLaser();
            }}
            onTouchMove={handleCanvasTouch}
            onClick={() => engineRef.current?.fireLaser()}
            className="w-full h-full object-contain cursor-crosshair touch-none"
          />

          {/* Pause overlay button if paused */}
          {gameState === 'PAUSED' && (
            <button
              onClick={() => engineRef.current?.togglePause()}
              className="absolute px-6 py-3 rounded-2xl bg-yellow-500/90 hover:bg-yellow-400 text-black font-black font-mono tracking-widest text-sm shadow-[0_0_30px_rgba(234,179,8,0.7)] transition-transform active:scale-95 cursor-pointer"
            >
              VERDER SPELEN
            </button>
          )}

          {/* Game Over restart overlay */}
          {gameState === 'GAME_OVER' && (
            <div className="absolute inset-0 bg-black/85 backdrop-blur-sm flex flex-col items-center justify-center p-4 text-center animate-in fade-in">
              <div className="w-12 h-12 rounded-2xl bg-red-950/80 border border-red-500/50 flex items-center justify-center text-2xl mb-2 shadow-[0_0_20px_rgba(239,68,68,0.4)]">
                {gameOverReason === 'INVASION_BREACH' ? '👾' : '💥'}
              </div>
              <h2 className="text-red-500 font-mono font-black text-2xl sm:text-3xl mb-1 drop-shadow-[0_0_15px_rgba(239,68,68,0.8)]">
                GAME OVER
              </h2>

              {/* Specific Reason Explained */}
              <div className="mb-3 px-4 py-2 rounded-xl bg-neutral-900/90 border border-neutral-800 text-xs font-mono max-w-xs">
                {gameOverReason === 'INVASION_BREACH' ? (
                  <div className="space-y-1">
                    <p className="text-red-400 font-bold">ALIENS BEREIKTEN DE AARDE!</p>
                    <p className="text-neutral-400 text-[11px]">De aliens passeerden de onderste verdedigingsgrens. In Space Invaders betekent dit onmiddellijk verlies.</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <p className="text-red-400 font-bold">ALLE KANONNEN VERNIETIGD</p>
                    <p className="text-neutral-400 text-[11px]">Je bent 3 keer geraakt door buitenaardse bommen (3/3 levens verloren).</p>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-4 text-white font-mono text-xs sm:text-sm font-bold mb-4">
                <p>LEVEL: <span className="text-yellow-400 font-black">{wave}</span></p>
                <span className="text-neutral-600">|</span>
                <p>EINDSCORE: <span className="text-emerald-400 font-black">{score.toLocaleString()}</span></p>
              </div>

              <button
                onClick={handleRestart}
                className="px-6 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-black font-mono tracking-widest text-sm shadow-[0_0_25px_rgba(16,185,129,0.7)] transition-transform active:scale-95 flex items-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4 text-black" />
                <span>OPNIEUW SPELEN</span>
              </button>
            </div>
          )}
        </div>

        {/* Arcade Physical Controls Section */}
        <div className="w-full mt-3 pt-3 border-t border-neutral-800 flex items-center justify-between gap-3">
          
          {/* Left / Right Steering Buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onPointerDown={() => engineRef.current?.setMoveLeft(true)}
              onPointerUp={() => engineRef.current?.setMoveLeft(false)}
              onPointerLeave={() => engineRef.current?.setMoveLeft(false)}
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-neutral-800 active:bg-neutral-700 border-2 border-neutral-700 active:border-emerald-500 flex items-center justify-center text-xl font-mono font-black text-neutral-200 shadow-md active:scale-95 transition-all select-none cursor-pointer"
            >
              ◀
            </button>
            <button
              type="button"
              onPointerDown={() => engineRef.current?.setMoveRight(true)}
              onPointerUp={() => engineRef.current?.setMoveRight(false)}
              onPointerLeave={() => engineRef.current?.setMoveRight(false)}
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-neutral-800 active:bg-neutral-700 border-2 border-neutral-700 active:border-emerald-500 flex items-center justify-center text-xl font-mono font-black text-neutral-200 shadow-md active:scale-95 transition-all select-none cursor-pointer"
            >
              ▶
            </button>
          </div>

          {/* Pause & Restart Utility Buttons */}
          <div className="flex flex-col gap-1.5">
            <button
              type="button"
              onClick={() => engineRef.current?.togglePause()}
              className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-[11px] font-mono font-bold flex items-center gap-1 cursor-pointer"
            >
              {gameState === 'PAUSED' ? <Play className="w-3.5 h-3.5 text-emerald-400" /> : <Pause className="w-3.5 h-3.5" />}
              <span>{gameState === 'PAUSED' ? 'VERDER' : 'PAUZE'}</span>
            </button>
            <button
              type="button"
              onClick={handleRestart}
              className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-[11px] font-mono font-bold flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-yellow-400" />
              <span>RESET</span>
            </button>
          </div>

          {/* Big Glowing Arcade FIRE Button */}
          <button
            type="button"
            onPointerDown={() => engineRef.current?.fireLaser()}
            className="w-18 h-18 sm:w-20 sm:h-20 rounded-full bg-red-600 hover:bg-red-500 active:bg-red-700 border-4 border-red-400 shadow-[0_0_25px_rgba(239,68,68,0.7)] flex flex-col items-center justify-center text-white font-mono font-black text-xs sm:text-sm tracking-wider active:scale-90 transition-all select-none cursor-pointer"
          >
            <span>FIRE</span>
            <span className="text-[9px] opacity-80 font-normal">VUUR</span>
          </button>
        </div>

        {/* Instructions Hint Footer */}
        <div className="w-full mt-2 text-center text-[10px] text-neutral-500 font-mono">
          Toetsen: [A / D] of [Pijltjes] Bewegen • [Spatie / W] Schieten • [P] Pauze • Gyro Kanteling
        </div>

      </div>

      {/* History & Dossier Modal */}
      <SpaceInvadersHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        onPlayGame={() => {
          setIsHistoryOpen(false);
          if (gameState === 'READY' || gameState === 'GAME_OVER') {
            handleRestart();
          }
        }}
      />

      {/* Leaderboard Modal */}
      <SpaceInvadersLeaderboardModal
        isOpen={isLeaderboardOpen}
        onClose={() => {
          setIsLeaderboardOpen(false);
          setPendingScore(null);
        }}
        pendingScore={pendingScore}
        onScoreSaved={() => {
          const updated = getSpaceHighScores();
          if (updated.length > 0) {
            setHighScore(updated[0].score);
          }
        }}
      />

      {/* Game Controls & Xbox Modal */}
      <GameControlsModal
        isOpen={showControls}
        onClose={() => setShowControls(false)}
        gameId="space_invaders"
      />
    </div>
  );
};
