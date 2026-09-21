import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  ArrowLeft,
  RotateCcw,
  Volume2,
  VolumeX,
  Tv,
  Key,
  Trophy,
  Info,
  Smartphone,
  ChevronRight,
  ChevronLeft,
  Play,
  Sparkles,
  HelpCircle,
  Compass
} from 'lucide-react';
import { ReptonEngine } from '../game/reptonEngine';
import { ReptonRenderer } from '../game/reptonRenderer';
import { REPTON_LEVELS, getLevelByPassword } from '../game/reptonLevels';
import { reptonAudio } from '../game/reptonAudio';
import { getReptonHighScores, saveReptonHighScore, isReptonHighScore } from '../game/reptonHighScores';
import { ReptonHistoryModal } from './ReptonHistoryModal';
import { GameControlsModal, useGameControls } from './GameControlsModal';
import { haptics } from '../utils/haptics';
import { Direction } from '../game/reptonTypes';

interface ReptonCabinetProps {
  onBackToLobby: () => void;
  initialLevelIndex?: number;
}

export const ReptonCabinet: React.FC<ReptonCabinetProps> = ({
  onBackToLobby,
  initialLevelIndex = 0
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<ReptonEngine | null>(null);
  const rendererRef = useRef<ReptonRenderer | null>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(performance.now());

  // Game UI State
  const [levelIndex, setLevelIndex] = useState(initialLevelIndex);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [diamondsLeft, setDiamondsLeft] = useState(0);
  const [timeLeft, setTimeLeft] = useState(180);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isLevelComplete, setIsLevelComplete] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isMapView, setIsMapView] = useState(false);

  // Settings
  const [isMuted, setIsMuted] = useState(false);
  const [crtEnabled, setCrtEnabled] = useState(true);
  const [isTiltEnabled, setIsTiltEnabled] = useState(false);
  const [tiltPermissionNeeded, setTiltPermissionNeeded] = useState(false);

  // Modals
  const { showControls, setShowControls } = useGameControls('repton');
  const [isDossierOpen, setIsDossierOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [isHighScoreModalOpen, setIsHighScoreModalOpen] = useState(false);
  const [playerInitials, setPlayerInitials] = useState('REP');

  const currentLevel = REPTON_LEVELS[levelIndex] || REPTON_LEVELS[0];

  // Initialize engine and canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const engine = new ReptonEngine(levelIndex, 3, score);
    const renderer = new ReptonRenderer(canvas);
    engineRef.current = engine;
    rendererRef.current = renderer;

    engine.setCallbacks(
      // On Game Over
      (finalScore) => {
        setIsGameOver(true);
        if (isReptonHighScore(finalScore)) {
          setIsHighScoreModalOpen(true);
        }
      },
      // On Level Win
      (completedLevelIdx, newScore) => {
        setIsLevelComplete(true);
        setScore(newScore);
      }
    );

    const updateCanvasSize = () => {
      if (!canvas) return;
      const rect = canvas.parentElement?.getBoundingClientRect();
      const parentWidth = rect ? rect.width : 680;
      const targetWidth = Math.min(840, Math.max(340, parentWidth));
      // Aspect ratio approx 4:3 (BBC Micro standard)
      const targetHeight = Math.floor(targetWidth * 0.72);
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      renderer.resize(targetWidth, targetHeight);
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);

    // Main animation loop
    const loop = (time: number) => {
      const dt = Math.min(64, time - lastTimeRef.current);
      lastTimeRef.current = time;

      if (engineRef.current && rendererRef.current) {
        engineRef.current.update(dt);
        const st = engineRef.current.getState();
        rendererRef.current.render(st, crtEnabled);

        // Sync React UI values periodically
        setScore(st.score);
        setLives(st.lives);
        setDiamondsLeft(st.diamondsRemaining);
        setTimeLeft(st.timeLeft);
        setIsGameOver(st.isGameOver);
        setIsLevelComplete(st.isLevelComplete);
        setIsPaused(st.isPaused);
      }

      animFrameIdRef.current = requestAnimationFrame(loop);
    };

    lastTimeRef.current = performance.now();
    animFrameIdRef.current = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener('resize', updateCanvasSize);
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, [levelIndex, crtEnabled]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const engine = engineRef.current;
      if (!engine) return;

      let handled = false;
      let dir: Direction = 'none';

      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          dir = 'up';
          handled = true;
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          dir = 'down';
          handled = true;
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          dir = 'left';
          handled = true;
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          dir = 'right';
          handled = true;
          break;
        case 'r':
        case 'R':
          handleRestartLevel();
          handled = true;
          break;
        case 'p':
        case 'P':
          engine.togglePause();
          handled = true;
          break;
        case 'm':
        case 'M':
          if (rendererRef.current) {
            rendererRef.current.toggleViewMode();
            setIsMapView(rendererRef.current.viewMode === 'map');
          }
          handled = true;
          break;
        case 'Enter':
          if (engine.getState().isGameOver) {
            engine.resetCurrentLevel();
            handled = true;
          } else if (engine.getState().isLevelComplete) {
            handleNextLevel();
            handled = true;
          }
          break;
      }

      if (handled) {
        e.preventDefault();
      }

      if (dir !== 'none') {
        engine.moveRepton(dir);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Directional move handler (for buttons & touch)
  const handleMove = useCallback((dir: Direction) => {
    if (engineRef.current) {
      haptics.light();
      engineRef.current.moveRepton(dir);
    }
  }, []);

  // Level operations
  const handleRestartLevel = () => {
    haptics.medium();
    if (engineRef.current) {
      engineRef.current.resetCurrentLevel();
      setIsGameOver(false);
      setIsLevelComplete(false);
    }
  };

  const handleNextLevel = () => {
    haptics.invaderKilled();
    const nextIdx = Math.min(REPTON_LEVELS.length - 1, levelIndex + 1);
    setLevelIndex(nextIdx);
    setIsLevelComplete(false);
    if (engineRef.current) {
      engineRef.current.loadLevel(nextIdx);
    }
  };

  const handlePrevLevel = () => {
    haptics.light();
    const prevIdx = Math.max(0, levelIndex - 1);
    setLevelIndex(prevIdx);
    setIsLevelComplete(false);
    if (engineRef.current) {
      engineRef.current.loadLevel(prevIdx);
    }
  };

  const handleJumpToLevel = (idx: number) => {
    haptics.light();
    setLevelIndex(idx);
    setIsLevelComplete(false);
    if (engineRef.current) {
      engineRef.current.loadLevel(idx);
    }
  };

  // Password submission
  const handlePasswordSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const found = getLevelByPassword(passwordInput);
    if (found) {
      const idx = REPTON_LEVELS.findIndex(l => l.id === found.id);
      if (idx !== -1) {
        haptics.invaderKilled();
        setLevelIndex(idx);
        setPasswordError(null);
        setIsPasswordModalOpen(false);
        setPasswordInput('');
        if (engineRef.current) {
          engineRef.current.loadLevel(idx);
        }
      }
    } else {
      haptics.heavy();
      setPasswordError(`Onbekend wachtwoord "${passwordInput.toUpperCase()}". Probeer bijv. CHAMELEON of GECKO!`);
    }
  };

  // iPhone Gyroscope Tilt Handler
  useEffect(() => {
    if (!isTiltEnabled) return;

    let lastTiltMove = 0;
    const handleOrientation = (e: DeviceOrientationEvent) => {
      const now = performance.now();
      if (now - lastTiltMove < 190) return; // Debounce tilt moves

      const gamma = e.gamma; // Left-Right tilt [-90 to 90]
      const beta = e.beta;   // Front-Back tilt [-180 to 180]

      if (gamma === null || beta === null) return;

      const tiltThreshold = 14;
      if (gamma > tiltThreshold) {
        handleMove('right');
        lastTiltMove = now;
      } else if (gamma < -tiltThreshold) {
        handleMove('left');
        lastTiltMove = now;
      } else if (beta > 35 + tiltThreshold) {
        handleMove('down');
        lastTiltMove = now;
      } else if (beta < 35 - tiltThreshold) {
        handleMove('up');
        lastTiltMove = now;
      }
    };

    window.addEventListener('deviceorientation', handleOrientation);
    return () => window.removeEventListener('deviceorientation', handleOrientation);
  }, [isTiltEnabled, handleMove]);

  // Request iPhone Gyro Permission (iOS 13+)
  const toggleTilt = async () => {
    if (isTiltEnabled) {
      setIsTiltEnabled(false);
      return;
    }

    if (
      typeof window !== 'undefined' &&
      typeof (DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> }).requestPermission === 'function'
    ) {
      try {
        const perm = await (DeviceOrientationEvent as unknown as { requestPermission: () => Promise<string> }).requestPermission();
        if (perm === 'granted') {
          setIsTiltEnabled(true);
        } else {
          setTiltPermissionNeeded(true);
        }
      } catch {
        setTiltPermissionNeeded(true);
      }
    } else {
      // Android or standard browser
      setIsTiltEnabled(true);
    }
  };

  // High score submission
  const handleSaveScore = () => {
    const cleanInitials = (playerInitials || 'REP').substring(0, 3).toUpperCase();
    saveReptonHighScore({
      initials: cleanInitials,
      score,
      levelLetter: currentLevel.letter,
      diamonds: currentLevel.map.join('').split('*').length - 1,
      date: new Date().toISOString().split('T')[0]
    });
    setIsHighScoreModalOpen(false);
  };

  return (
    <div className="flex flex-col min-h-screen w-full bg-neutral-950 text-white font-sans selection:bg-emerald-500 selection:text-black">
      {/* Top Retro BBC Micro Bezel Marquee */}
      <header className="w-full border-b border-neutral-800 bg-black/80 backdrop-blur sticky top-0 z-30 px-3 sm:px-6 py-2.5 flex items-center justify-between shadow-xl">
        <div className="flex items-center gap-2.5">
          <button
            onClick={onBackToLobby}
            className="px-3 py-1.5 rounded-xl bg-neutral-900 border border-neutral-700 hover:bg-neutral-800 text-neutral-300 hover:text-white text-xs font-mono font-bold flex items-center gap-1.5 transition cursor-pointer active:scale-95"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">LOBBY</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="text-xl">🦎</span>
            <div>
              <h1 className="text-sm sm:text-base font-black font-mono text-emerald-400 tracking-tight flex items-center gap-1.5">
                <span>REPTON</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-600/30 text-red-400 border border-red-500/40 hidden sm:inline">
                  BBC MICRO 1985
                </span>
              </h1>
              <p className="text-[10px] font-mono text-neutral-400 hidden md:block">
                Superior Software • Level {currentLevel.letter}: {currentLevel.name}
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls Header Right */}
        <div className="flex items-center gap-2">
          {/* Level Switcher */}
          <div className="flex items-center bg-neutral-900 border border-neutral-700 rounded-xl px-1 py-0.5 text-xs font-mono">
            <button
              onClick={handlePrevLevel}
              disabled={levelIndex === 0}
              className="p-1 text-neutral-400 hover:text-white disabled:opacity-30 cursor-pointer"
              title="Vorig Level"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-1.5 font-bold text-emerald-400">
              Lvl {currentLevel.letter}
            </span>
            <button
              onClick={handleNextLevel}
              disabled={levelIndex === REPTON_LEVELS.length - 1}
              className="p-1 text-neutral-400 hover:text-white disabled:opacity-30 cursor-pointer"
              title="Volgend Level"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Password Button */}
          <button
            onClick={() => setIsPasswordModalOpen(true)}
            className="px-2.5 py-1.5 rounded-xl bg-neutral-900 border border-neutral-700 hover:border-yellow-400 text-yellow-300 text-xs font-mono font-bold flex items-center gap-1 transition cursor-pointer"
            title="Wachtwoord Invoeren"
          >
            <Key className="w-3.5 h-3.5 text-yellow-400" />
            <span className="hidden sm:inline">CODE</span>
          </button>

          {/* Map / Zoom Toggle Button */}
          <button
            onClick={() => {
              if (rendererRef.current) {
                rendererRef.current.toggleViewMode();
                setIsMapView(rendererRef.current.viewMode === 'map');
              }
            }}
            className={`px-2.5 py-1.5 rounded-xl border text-xs font-mono font-bold flex items-center gap-1 transition cursor-pointer ${
              isMapView
                ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                : 'bg-neutral-900 border-neutral-700 text-neutral-300 hover:text-white'
            }`}
            title="Wissel Camera / Volledige Kaart (M)"
          >
            <Compass className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">{isMapView ? 'ZOOM' : 'KAART'}</span>
          </button>

          {/* Restart Level */}
          <button
            onClick={handleRestartLevel}
            className="p-1.5 rounded-xl bg-neutral-900 border border-neutral-700 hover:border-rose-400 text-neutral-300 hover:text-rose-400 transition cursor-pointer active:scale-95"
            title="Herstart Level (R)"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Tilt Toggle */}
          <button
            onClick={toggleTilt}
            className={`p-1.5 rounded-xl border transition cursor-pointer ${
              isTiltEnabled
                ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                : 'bg-neutral-900 border-neutral-700 text-neutral-400 hover:text-white'
            }`}
            title="iPhone Gyroscoop Kantelen"
          >
            <Smartphone className="w-4 h-4" />
          </button>

          {/* Sound Toggle */}
          <button
            onClick={() => {
              const muted = reptonAudio.toggleMute();
              setIsMuted(muted);
            }}
            className="p-1.5 rounded-xl bg-neutral-900 border border-neutral-700 text-neutral-300 hover:text-white transition cursor-pointer"
            title={isMuted ? 'Geluid Aanzetten' : 'Geluid Dempen'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* CRT Toggle */}
          <button
            onClick={() => setCrtEnabled(!crtEnabled)}
            className={`p-1.5 rounded-xl border transition cursor-pointer ${
              crtEnabled
                ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                : 'bg-neutral-900 border-neutral-700 text-neutral-400'
            }`}
            title="CRT Scanlines"
          >
            <Tv className="w-4 h-4" />
          </button>

          {/* Controls & Xbox Modal Button */}
          <button
            onClick={() => setShowControls(true)}
            className="p-1.5 rounded-xl bg-neutral-900 border border-neutral-700 hover:border-yellow-400 text-yellow-400 transition cursor-pointer"
            title="Besturing & Xbox Controller"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          {/* Dossier Info */}
          <button
            onClick={() => setIsDossierOpen(true)}
            className="p-1.5 rounded-xl bg-neutral-900 border border-neutral-700 hover:border-emerald-400 text-emerald-400 transition cursor-pointer"
            title="BBC Micro Dossier"
          >
            <Info className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Play Area */}
      <main className="flex-1 flex flex-col items-center justify-center p-2 sm:p-4 max-w-5xl mx-auto w-full">
        {/* BBC Micro Monitor Framing */}
        <div className="relative w-full rounded-2xl bg-neutral-950 p-2 sm:p-4 border-4 border-neutral-800 shadow-[0_0_50px_rgba(0,0,0,0.9)] flex flex-col items-center">
          
          {/* Top Bezel Branding */}
          <div className="w-full flex items-center justify-between px-3 py-1 mb-2 text-[10px] font-mono text-neutral-500 border-b border-neutral-800">
            <span className="text-red-500 font-bold tracking-wider">
              ACORN COMPUTERS • BBC MICRO MODEL B
            </span>
            <span>SUPERIOR SOFTWARE 1985</span>
          </div>

          {/* Canvas */}
          <div className="relative w-full flex items-center justify-center overflow-hidden rounded-lg bg-black border border-neutral-800">
            <canvas
              ref={canvasRef}
              className="w-full h-auto max-w-full block select-none"
              style={{ imageRendering: 'pixelated' }}
            />
          </div>

          {/* Next Level Banner when Won */}
          {isLevelComplete && (
            <div className="mt-3 w-full p-3 rounded-xl bg-emerald-950/80 border border-emerald-500 flex items-center justify-between animate-in fade-in">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-400" />
                <span className="font-mono text-sm font-bold text-white">
                  GEFELICITEERD! Level {currentLevel.letter} opgelost! Wachtwoord: <strong className="text-yellow-400 font-black">{currentLevel.password}</strong>
                </span>
              </div>
              <button
                onClick={handleNextLevel}
                className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-mono font-black text-xs tracking-wider flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
              >
                <span>VOLGEND LEVEL</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Game Over Banner */}
          {isGameOver && (
            <div className="mt-3 w-full p-3 rounded-xl bg-red-950/80 border border-red-500 flex items-center justify-between animate-in fade-in">
              <span className="font-mono text-sm font-bold text-red-300">
                💀 GAME OVER! Repton heeft geen levens meer.
              </span>
              <button
                onClick={handleRestartLevel}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white font-mono font-black text-xs tracking-wider flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>SPEEL OPNIEUW</span>
              </button>
            </div>
          )}
        </div>

        {/* Mobile / Tablet Touch Controls */}
        <div className="w-full mt-4 flex flex-col sm:flex-row items-center justify-between gap-4 bg-neutral-900/90 border border-neutral-800 p-4 rounded-2xl">
          {/* Quick instructions & level details */}
          <div className="text-xs font-mono text-neutral-300 space-y-1">
            <div className="flex items-center gap-2 text-emerald-400 font-bold">
              <span>LEVEL {currentLevel.letter}:</span>
              <span className="text-white">{currentLevel.name}</span>
            </div>
            <p className="text-[11px] text-neutral-400">
              {currentLevel.description}
            </p>
          </div>

          {/* Virtual D-Pad for Mobile */}
          <div className="flex items-center gap-6">
            <div className="grid grid-cols-3 gap-1.5 w-36 h-36">
              <div />
              <button
                onClick={() => handleMove('up')}
                className="rounded-xl bg-neutral-800 active:bg-emerald-500 active:text-black border border-neutral-700 text-white font-bold flex items-center justify-center text-sm shadow transition cursor-pointer select-none"
              >
                ▲
              </button>
              <div />

              <button
                onClick={() => handleMove('left')}
                className="rounded-xl bg-neutral-800 active:bg-emerald-500 active:text-black border border-neutral-700 text-white font-bold flex items-center justify-center text-sm shadow transition cursor-pointer select-none"
              >
                ◀
              </button>
              <div className="rounded-xl bg-neutral-950 border border-neutral-800 flex items-center justify-center text-[10px] font-mono text-neutral-500">
                D-PAD
              </div>
              <button
                onClick={() => handleMove('right')}
                className="rounded-xl bg-neutral-800 active:bg-emerald-500 active:text-black border border-neutral-700 text-white font-bold flex items-center justify-center text-sm shadow transition cursor-pointer select-none"
              >
                ▶
              </button>

              <div />
              <button
                onClick={() => handleMove('down')}
                className="rounded-xl bg-neutral-800 active:bg-emerald-500 active:text-black border border-neutral-700 text-white font-bold flex items-center justify-center text-sm shadow transition cursor-pointer select-none"
              >
                ▼
              </button>
              <div />
            </div>

            {/* Quick Action Reset */}
            <button
              onClick={handleRestartLevel}
              className="flex flex-col items-center justify-center gap-1 w-16 h-16 rounded-2xl bg-neutral-800 active:bg-neutral-700 border border-neutral-700 text-neutral-300 hover:text-white text-[10px] font-mono font-bold transition active:scale-95 cursor-pointer"
            >
              <RotateCcw className="w-5 h-5 text-yellow-400" />
              <span>RESET</span>
            </button>
          </div>
        </div>
      </main>

      {/* Enter Password Modal */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-neutral-900 border-2 border-yellow-500/80 rounded-2xl p-6 shadow-2xl font-mono text-neutral-200">
            <h3 className="text-lg font-bold text-yellow-400 flex items-center gap-2 mb-2">
              <Key className="w-5 h-5" />
              <span>VOER LEVEL WACHTWOORD IN</span>
            </h3>
            <p className="text-xs text-neutral-400 mb-4">
              Typ het geheime BBC Micro wachtwoord in (bijv. <em>CHAMELEON</em>, <em>TERRAPIN</em>, <em>GECKO</em>, <em>PYTHON</em>, <em>OCTOPUS</em>):
            </p>

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <input
                type="text"
                autoFocus
                value={passwordInput}
                onChange={(e) => {
                  setPasswordInput(e.target.value.toUpperCase());
                  setPasswordError(null);
                }}
                placeholder="BIJV. CHAMELEON"
                className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-950 border border-neutral-700 focus:border-yellow-400 text-white font-bold text-sm tracking-wider uppercase outline-none"
              />

              {passwordError && (
                <div className="text-xs text-red-400 bg-red-950/60 p-2.5 rounded-lg border border-red-900">
                  {passwordError}
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsPasswordModalOpen(false);
                    setPasswordError(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-bold transition cursor-pointer"
                >
                  ANNULEREN
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-black text-xs font-black tracking-wider transition cursor-pointer"
                >
                  ONTGRENDEL LEVEL
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* High Score Modal */}
      {isHighScoreModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm bg-neutral-900 border-2 border-emerald-500 rounded-2xl p-6 shadow-2xl font-mono text-center space-y-4">
            <Trophy className="w-10 h-10 text-yellow-400 mx-auto" />
            <h3 className="text-xl font-black text-emerald-400">
              NIEUWE HIGH SCORE!
            </h3>
            <p className="text-xs text-neutral-300">
              Jij behaalde <strong>{score.toLocaleString()}</strong> punten in Repton!
            </p>

            <div className="space-y-1">
              <label className="text-[11px] text-neutral-400 block">
                VOER JE 3-LETTER INITIALEN IN:
              </label>
              <input
                type="text"
                maxLength={3}
                value={playerInitials}
                onChange={(e) => setPlayerInitials(e.target.value.toUpperCase())}
                className="text-center w-28 mx-auto px-2 py-2 rounded-xl bg-neutral-950 border border-emerald-500 text-xl font-black tracking-widest text-emerald-400 outline-none uppercase"
              />
            </div>

            <button
              onClick={handleSaveScore}
              className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs tracking-wider transition cursor-pointer"
            >
              OPSLAAN IN HIGHSCORES
            </button>
          </div>
        </div>
      )}

      {/* BBC Micro Dossier Modal */}
      <ReptonHistoryModal
        isOpen={isDossierOpen}
        onClose={() => setIsDossierOpen(false)}
        onPlay={(idx) => {
          if (typeof idx === 'number') {
            handleJumpToLevel(idx);
          }
        }}
      />

      {/* Game Controls & Xbox Modal */}
      <GameControlsModal
        isOpen={showControls}
        onClose={() => setShowControls(false)}
        gameId="repton"
      />
    </div>
  );
};
