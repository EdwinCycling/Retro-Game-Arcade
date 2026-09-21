import React, { useEffect, useRef, useState } from 'react';
import { retroAudio } from '../game/audio';
import { CANVAS_HEIGHT, CANVAS_WIDTH } from '../game/constants';
import { PacmanGameEngine } from '../game/engine';
import { PacmanRenderer } from '../game/renderer';
import { Difficulty, Direction, GameState } from '../types';
import { ArcadeControls } from './ArcadeControls';
import { DifficultyModal } from './DifficultyModal';
import { GhostAiInspector } from './GhostAiInspector';
import { HighScoreEntryModal } from './HighScoreEntryModal';
import { LeaderboardModal } from './LeaderboardModal';
import { getHighScores, isScoreEligibleForLeaderboard, saveHighScoreEntry } from '../game/highScores';
import { Trophy, Gamepad2, ArrowLeft, HelpCircle } from 'lucide-react';
import { haptics } from '../utils/haptics';
import { tiltController, TiltState } from '../utils/tiltController';
import { GameControlsModal, useGameControls } from './GameControlsModal';

import { MAZE_DEFINITIONS } from '../game/pacmanMazes';

export interface PacmanCabinetProps {
  onBackToLobby?: () => void;
}

export const PacmanCabinet: React.FC<PacmanCabinetProps> = ({ onBackToLobby }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<PacmanGameEngine | null>(null);
  const rendererRef = useRef<PacmanRenderer | null>(null);

  const [score, setScore] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(() => {
    const scores = getHighScores();
    return scores.length > 0 ? scores[0].score : 10000;
  });
  const [lives, setLives] = useState<number>(3);
  const [level, setLevel] = useState<number>(1);
  const [gameState, setGameState] = useState<GameState>('READY');
  const [selectedMazeId, setSelectedMazeId] = useState<string>('classic');
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isCrtEnabled, setIsCrtEnabled] = useState<boolean>(true);
  const [showDebug, setShowDebug] = useState<boolean>(false);
  const [showDebugLines, setShowDebugLines] = useState<boolean>(false);
  const [isDifficultyOpen, setIsDifficultyOpen] = useState<boolean>(false);
  const [difficulty, setDifficulty] = useState<Difficulty>('classic');

  // Haptics & iPhone Tilt Gyroscope states
  const [isHapticsEnabled, setIsHapticsEnabled] = useState<boolean>(() => haptics.isEnabled());
  const [tiltState, setTiltState] = useState<TiltState>(() => tiltController.getState());

  useEffect(() => {
    const unsub = tiltController.subscribe((state) => {
      setTiltState(state);
    });
    return () => {
      unsub();
      tiltController.stop();
    };
  }, []);

  // Leaderboard & Initials Entry states
  const [isHighScoreEntryOpen, setIsHighScoreEntryOpen] = useState<boolean>(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState<boolean>(false);
  const [newHighScoreRank, setNewHighScoreRank] = useState<number>(1);
  const [justSavedEntryId, setJustSavedEntryId] = useState<string | undefined>(undefined);
  const [gameOverScore, setGameOverScore] = useState<number>(0);
  const [gameOverLevel, setGameOverLevel] = useState<number>(1);
  const [hasPromptedInitialsForGame, setHasPromptedInitialsForGame] = useState<boolean>(false);
  const { showControls, setShowControls } = useGameControls('pacman');

  // Ghosts state for inspector UI
  const [ghostsInfo, setGhostsInfo] = useState<any[]>([]);
  const [dotsRemaining, setDotsRemaining] = useState<number>(244);
  const [dotsEaten, setDotsEaten] = useState<number>(0);
  const [globalMode, setGlobalMode] = useState<'SCATTER' | 'CHASE'>('SCATTER');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Enable crisp pixelated rendering
    ctx.imageSmoothingEnabled = false;

    const engine = new PacmanGameEngine({
      onScoreChange: (s) => setScore(s),
      onHighScoreChange: (hs) => setHighScore(hs),
      onLivesChange: (l) => setLives(l),
      onLevelChange: (lvl) => setLevel(lvl),
      onGameStateChange: (st) => setGameState(st)
    });

    const renderer = new PacmanRenderer(ctx);

    engineRef.current = engine;
    rendererRef.current = renderer;

    setHighScore(engine.highScore);

    let animationId: number;
    let uiUpdateCounter = 0;

    const renderLoop = () => {
      engine.update();

      // Rendering sequence
      renderer.clear();

      // Draw maze and dots
      renderer.drawMaze(
        engine.maze,
        (engine as any).energizerFlash,
        engine.gameState === 'LEVEL_CLEAR' && (engine.tick % 10 < 5),
        {
          wallColor: engine.activeMaze?.wallColor,
          dotColor: engine.activeMaze?.dotColor,
          energizerColor: engine.activeMaze?.energizerColor
        }
      );

      // Draw fruit bonus
      renderer.drawFruit(engine.fruit);

      // Draw Pac-Man
      renderer.drawPacman(engine.pacman);

      // Draw Ghosts
      for (const ghost of engine.ghosts) {
        renderer.drawGhost(ghost, engine.tick);
      }

      // Draw floating score popups
      renderer.drawScorePopups(engine.scorePopups);

      // Draw HUD
      renderer.drawHUD(
        engine.score,
        engine.highScore,
        engine.lives,
        engine.fruitHistory,
        engine.gameState,
        engine.level
      );

      // Optional debug overlay lines
      if (showDebugLines) {
        renderer.drawDebugOverlay(engine.ghosts, engine.pacman);
      }

      // Periodic React UI state update (every 10 frames to keep 60fps smooth)
      uiUpdateCounter++;
      if (uiUpdateCounter % 10 === 0) {
        setGhostsInfo([...engine.ghosts]);
        setDotsRemaining(engine.dotsRemaining);
        setDotsEaten(engine.dotsEatenThisLevel);
        setGlobalMode((engine as any).currentGlobalMode);
      }

      animationId = requestAnimationFrame(renderLoop);
    };

    animationId = requestAnimationFrame(renderLoop);

    // Global keyboard listener
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent page scrolling on arrow keys & space
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }

      let dir: Direction | null = null;
      switch (e.key) {
        case 'ArrowUp':
        case 'KeyW':
        case 'w':
        case 'W':
          dir = 'UP';
          break;
        case 'ArrowDown':
        case 'KeyS':
        case 's':
        case 'S':
          dir = 'DOWN';
          break;
        case 'ArrowLeft':
        case 'KeyA':
        case 'a':
        case 'A':
          dir = 'LEFT';
          break;
        case 'ArrowRight':
        case 'KeyD':
        case 'd':
        case 'D':
          dir = 'RIGHT';
          break;
        case 'p':
        case 'P':
        case ' ':
          togglePause();
          break;
        case 'm':
        case 'M':
          toggleMute();
          break;
        case 'r':
        case 'R':
          restartGame();
          break;
        default:
          break;
      }

      if (dir && engineRef.current) {
        engineRef.current.handleDirectionInput(dir);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('keydown', handleKeyDown);
      retroAudio.stopSiren();
    };
  }, [showDebugLines]);

  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);

  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length === 1) {
      touchStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
        time: Date.now()
      };
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!touchStartRef.current || e.touches.length !== 1) return;
    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    const dx = currentX - touchStartRef.current.x;
    const dy = currentY - touchStartRef.current.y;
    const distance = Math.hypot(dx, dy);

    // Minimum swipe threshold (22px)
    if (distance >= 22) {
      let dir: Direction;
      if (Math.abs(dx) > Math.abs(dy)) {
        dir = dx > 0 ? 'RIGHT' : 'LEFT';
      } else {
        dir = dy > 0 ? 'DOWN' : 'UP';
      }
      handleDirection(dir);

      // Reset origin to current point to allow continuous fluid direction change while dragging
      touchStartRef.current = {
        x: currentX,
        y: currentY,
        time: Date.now()
      };
    }
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!touchStartRef.current) return;
    const endX = e.changedTouches[0].clientX;
    const endY = e.changedTouches[0].clientY;
    const dx = endX - touchStartRef.current.x;
    const dy = endY - touchStartRef.current.y;
    const distance = Math.hypot(dx, dy);
    const duration = Date.now() - touchStartRef.current.time;

    if (distance >= 16) {
      let dir: Direction;
      if (Math.abs(dx) > Math.abs(dy)) {
        dir = dx > 0 ? 'RIGHT' : 'LEFT';
      } else {
        dir = dy > 0 ? 'DOWN' : 'UP';
      }
      handleDirection(dir);
    } else if (duration < 300 && distance < 10) {
      // Quick tap without swipe
      if (gameState === 'READY' || gameState === 'PAUSED') {
        togglePause();
      } else if (gameState === 'GAME_OVER') {
        restartGame();
      }
    }
    touchStartRef.current = null;
  };

  const handleDirection = (dir: Direction) => {
    if (engineRef.current) {
      engineRef.current.handleDirectionInput(dir);
      haptics.light();
    }
  };

  const handleToggleHaptics = () => {
    const next = haptics.toggle();
    setIsHapticsEnabled(next);
  };

  const handleToggleTilt = async () => {
    if (tiltState.active) {
      tiltController.stop();
    } else {
      const success = await tiltController.start((dir) => {
        handleDirection(dir);
      });
      if (!success) {
        alert('Kantelbesturing (iPhone Gyroscoop) vereist bewegingssensor-toestemming in Safari (Instellingen > Safari > Beweging & Richtingstoegang).');
      }
    }
  };

  const handleCalibrateTilt = () => {
    tiltController.calibrate();
  };

  const togglePause = () => {
    if (!engineRef.current) return;
    const current = engineRef.current.gameState;
    if (current === 'PLAYING') {
      engineRef.current.setGameState('PAUSED');
    } else if (current === 'PAUSED') {
      engineRef.current.setGameState('PLAYING');
    }
  };

  const toggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    retroAudio.setMuted(next);
  };

  const restartGame = (diff: Difficulty = difficulty, startLvl: number = level) => {
    if (engineRef.current) {
      engineRef.current.restartGame(diff, startLvl);
    }
  };

  // Monitor GAME_OVER to trigger arcade initials input if eligible
  useEffect(() => {
    if (gameState === 'GAME_OVER' && !hasPromptedInitialsForGame) {
      setHasPromptedInitialsForGame(true);
      const currentScore = engineRef.current ? engineRef.current.score : score;
      const currentLvl = engineRef.current ? engineRef.current.level : level;
      setGameOverScore(currentScore);
      setGameOverLevel(currentLvl);

      const eligibility = isScoreEligibleForLeaderboard(currentScore);
      if (eligibility.eligible) {
        setNewHighScoreRank(eligibility.rank);
        const timer = setTimeout(() => {
          setIsHighScoreEntryOpen(true);
        }, 1100);
        return () => clearTimeout(timer);
      }
    } else if (gameState === 'PLAYING' || gameState === 'READY') {
      setHasPromptedInitialsForGame(false);
    }
  }, [gameState, hasPromptedInitialsForGame, score, level]);

  const handleSaveInitials = (enteredInitials: string) => {
    const updated = saveHighScoreEntry({
      initials: enteredInitials,
      score: gameOverScore,
      level: gameOverLevel,
      difficulty
    });
    const savedItem = updated.find(
      (e) => e.score === gameOverScore && e.initials === enteredInitials.toUpperCase().padEnd(3, 'A').slice(0, 3)
    );
    setJustSavedEntryId(savedItem?.id);
    if (updated.length > 0) {
      setHighScore(updated[0].score);
    }
    setIsHighScoreEntryOpen(false);
    setIsLeaderboardOpen(true);
  };

  const handleSelectDifficulty = (newDiff: Difficulty, newLvl: number) => {
    setDifficulty(newDiff);
    setLevel(newLvl);
    restartGame(newDiff, newLvl);
  };

  const getFruitEmoji = (fruitType?: string) => {
    switch (fruitType) {
      case 'CHERRY': return '🍒';
      case 'STRAWBERRY': return '🍓';
      case 'PEACH': return '🍑';
      case 'APPLE': return '🍎';
      case 'MELON': return '🍈';
      case 'GALAXIAN': return '👾';
      case 'BELL': return '🔔';
      case 'KEY': return '🗝️';
      case 'PRETZEL': return '🥨';
      case 'PEAR': return '🍐';
      case 'BANANA': return '🍌';
      default: return '🍒';
    }
  };

  const handleSelectMaze = (mazeId: string) => {
    setSelectedMazeId(mazeId);
    if (engineRef.current) {
      engineRef.current.setMaze(mazeId);
    }
  };

  const currentFruit = engineRef.current?.fruit?.type || 'CHERRY';

  return (
    <div className="flex flex-col min-h-screen w-full bg-black text-white font-mono overflow-x-hidden select-none items-center">
      {/* Vibrant Palette Top Header Bar */}
      <header className="w-full max-w-[1400px] flex flex-wrap gap-2 justify-between items-center px-3 sm:px-10 py-3 sm:py-5 border-b border-gray-900/80">
        {/* Left Section: Back to Hub + High Score */}
        <div className="flex items-center gap-3 sm:gap-6">
          {onBackToLobby && (
            <button
              type="button"
              onClick={onBackToLobby}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-yellow-400 hover:text-yellow-300 text-xs font-bold border border-neutral-800 transition-all active:scale-95 cursor-pointer shadow"
              title="Terug naar Arcade Lobby / Game Keuze"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <Gamepad2 className="w-3.5 h-3.5 text-yellow-400" />
              <span className="hidden sm:inline">ARCADE LOBBY</span>
              <span className="sm:hidden">HUB</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setShowControls(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-yellow-400 hover:text-yellow-300 text-xs font-bold border border-neutral-800 transition-all active:scale-95 cursor-pointer shadow"
            title="Besturing & Xbox Controller"
          >
            <HelpCircle className="w-3.5 h-3.5 text-yellow-400" />
            <span className="hidden sm:inline">BESTURING</span>
          </button>

          {/* High Score Column (Clickable to open Leaderboard) */}
          <button
            type="button"
            onClick={() => setIsLeaderboardOpen(true)}
            className="flex flex-col text-left group cursor-pointer transition-transform active:scale-95"
            title="Bekijk Arcade Leaderboard & Topscores"
          >
            <span className="text-pink-500 text-[10px] sm:text-xs md:text-sm font-bold tracking-widest flex items-center gap-1.5 group-hover:text-pink-400 transition-colors">
              <Trophy className="w-3 h-3 text-yellow-400 group-hover:animate-bounce" />
              <span>HIGH SCORE</span>
            </span>
            <span className="text-white text-base sm:text-2xl font-bold tracking-tighter group-hover:text-yellow-300 transition-colors">
              {highScore.toLocaleString()}
            </span>
          </button>
        </div>

        {/* Maze Selector Strip */}
        <div className="flex items-center bg-neutral-950 p-1 rounded-xl border border-neutral-800 gap-1 overflow-x-auto max-w-full">
          <span className="text-[10px] text-neutral-400 font-bold px-1.5 hidden md:inline">DOOLHOF:</span>
          {MAZE_DEFINITIONS.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => handleSelectMaze(m.id)}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg cursor-pointer transition-all whitespace-nowrap ${
                selectedMazeId === m.id
                  ? 'bg-yellow-400 text-black shadow-[0_0_10px_rgba(250,204,21,0.6)] font-black'
                  : 'bg-neutral-900 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800'
              }`}
              title={m.subtitle}
            >
              {m.id === 'classic' ? '🟡 1980' : m.id === 'ms_maze1' ? '🎀 Maze 1' : m.id === 'ms_maze2' ? '🥨 Maze 2' : m.id === 'ms_maze3' ? '🍐 Maze 3' : '🍌 Maze 4'}
            </button>
          ))}
        </div>

        {/* Current Score Column */}
        <div className="flex flex-col items-center">
          <span className="text-white text-xs sm:text-sm md:text-base font-bold tracking-widest">
            SCORE
          </span>
          <span className="text-white text-xl sm:text-2xl md:text-3xl font-bold tracking-tighter">
            {score.toLocaleString()}
          </span>
        </div>

        {/* Level / Stage Badge Column */}
        <div className="flex flex-col items-center">
          <span className="text-cyan-400 text-xs sm:text-sm md:text-base font-bold tracking-widest">
            LEVEL
          </span>
          <div className="flex items-center gap-1.5">
            <span className="text-yellow-400 text-xl sm:text-2xl md:text-3xl font-black tracking-tighter drop-shadow-[0_0_8px_rgba(250,204,21,0.6)]">
              {level.toString().padStart(2, '0')}
            </span>
            <span className="text-xs sm:text-sm text-neutral-400" title={`Bonus Fruit: ${currentFruit}`}>
              {getFruitEmoji(currentFruit)}
            </span>
          </div>
        </div>

        {/* Player 1 & Status Column */}
        <div className="flex flex-col items-end">
          <span className="text-pink-500 text-xs sm:text-sm md:text-base font-bold tracking-widest">
            PLAYER 1
          </span>
          <span
            className={`text-sm sm:text-lg md:text-xl font-bold ${
              gameState === 'GAME_OVER'
                ? 'text-red-500 font-black italic'
                : gameState === 'READY'
                ? 'text-yellow-400 animate-pulse'
                : gameState === 'PAUSED'
                ? 'text-cyan-400'
                : 'text-emerald-400'
            }`}
          >
            {gameState === 'READY'
              ? 'READY?'
              : gameState === 'PAUSED'
              ? 'PAUSED'
              : gameState === 'GAME_OVER'
              ? 'GAME OVER'
              : 'PLAYING'}
          </span>
        </div>
      </header>

      {/* Main Play Area */}
      <main className="flex-grow flex flex-col xl:flex-row items-center xl:items-start justify-center w-full max-w-[1400px] mx-auto p-2 sm:p-4 gap-4 sm:gap-8 relative">
        
        {/* LEFT PANEL: Action Controls & Virtual D-Pad */}
        <div className="w-full xl:w-[350px] flex-shrink-0 flex flex-col gap-4 order-2 xl:order-1">
          <ArcadeControls
            onDirection={handleDirection}
            gameState={gameState}
            isMuted={isMuted}
            onToggleMute={toggleMute}
            onTogglePause={togglePause}
            onRestart={() => restartGame(difficulty, level)}
            onOpenDifficulty={() => setIsDifficultyOpen(true)}
            onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
            isCrtEnabled={isCrtEnabled}
            onToggleCrt={() => setIsCrtEnabled(!isCrtEnabled)}
            showDebug={showDebug}
            onToggleDebug={() => setShowDebug(!showDebug)}
            isHapticsEnabled={isHapticsEnabled}
            onToggleHaptics={handleToggleHaptics}
            isTiltActive={tiltState.active}
            onToggleTilt={handleToggleTilt}
            onCalibrateTilt={handleCalibrateTilt}
            tiltDirection={tiltState.currentDirection}
            tiltBeta={tiltState.beta}
            tiltGamma={tiltState.gamma}
          />
        </div>

        {/* CENTER PANEL: Canvas Screen Container with Vibrant Blue Neon Framing */}
        <div className="relative flex-shrink-0 order-1 xl:order-2">
          <canvas
            ref={canvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            style={{ touchAction: 'none' }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            className="block w-full max-w-[448px] xl:max-w-none xl:w-[448px] h-auto aspect-[448/576] border-4 border-blue-600 rounded-sm shadow-[0_0_40px_rgba(37,99,235,0.3)] bg-black cursor-pointer mx-auto"
            onClick={() => {
              if (gameState === 'READY' || gameState === 'PAUSED') {
                togglePause();
              } else if (gameState === 'GAME_OVER') {
                restartGame();
              }
            }}
          />

          {/* Optional CRT scanline & curved bloom filter */}
          {isCrtEnabled && (
            <div className="absolute inset-0 crt-overlay crt-bloom pointer-events-none rounded-sm" />
          )}

          {/* Vibrant Ready / Start Overlay Banner */}
          {gameState === 'READY' && (
            <div
              className="absolute inset-0 flex items-center justify-center bg-black/40 pointer-events-none"
              aria-live="polite"
            >
              <div className="text-center px-6 py-4 border-2 border-yellow-400 bg-black/85 rounded shadow-[0_0_30px_rgba(234,179,8,0.3)]">
                <h2 className="text-2xl sm:text-3xl text-yellow-400 mb-1 font-black italic tracking-wider animate-pulse">
                  READY!
                </h2>
                <p className="text-white text-xs uppercase tracking-widest">
                  Druk op de pijltjestoetsen om te starten
                </p>
              </div>
            </div>
          )}

          {/* Vibrant Game Over Overlay */}
          {gameState === 'GAME_OVER' && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/75 z-20">
              <div className="text-center p-6 sm:p-8 border-2 border-yellow-400 bg-black/95 rounded-2xl shadow-[0_0_50px_rgba(239,68,68,0.5)] max-w-xs sm:max-w-sm w-full mx-4 space-y-4 animate-in fade-in zoom-in-95">
                <h2 className="text-3xl sm:text-4xl text-yellow-400 font-black italic tracking-wider">
                  GAME OVER
                </h2>
                <div className="text-xs text-neutral-300 space-y-1 bg-neutral-950 p-2.5 rounded-lg border border-neutral-900">
                  <div>Eindscore: <span className="text-white font-bold text-sm">{score.toLocaleString()}</span></div>
                  <div>Bereikt: <span className="text-cyan-400 font-bold">Level {level} ({difficulty.toUpperCase()})</span></div>
                </div>
                <div className="flex flex-col gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => restartGame()}
                    className="w-full py-2.5 px-4 rounded-lg bg-yellow-400 hover:bg-yellow-300 text-black text-xs font-black uppercase tracking-wider shadow-[0_0_15px_rgba(250,204,21,0.5)] transition-transform active:scale-95 cursor-pointer"
                  >
                    Opnieuw Spelen (R)
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsLeaderboardOpen(true)}
                    className="w-full py-2 px-4 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-yellow-300 border border-neutral-800 text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Trophy className="w-3.5 h-3.5 text-yellow-400" />
                    <span>Arcade Topscores</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT PANEL: Ghost AI Inspector Panel */}
        <div className="w-full xl:w-[350px] flex-shrink-0 flex flex-col gap-4 order-3 xl:order-3">
          {showDebug ? (
            <GhostAiInspector
              ghosts={ghostsInfo.length > 0 ? ghostsInfo : (engineRef.current?.ghosts || [])}
              globalMode={globalMode}
              dotsRemaining={dotsRemaining}
              dotsEaten={dotsEaten}
              frightenedActive={ghostsInfo.some(g => g.mode === 'FRIGHTENED')}
              showDebugLines={showDebugLines}
              onToggleDebugLines={() => setShowDebugLines(!showDebugLines)}
            />
          ) : (
            <div className="hidden xl:flex flex-col items-center justify-center p-8 bg-neutral-900/30 border border-neutral-800 rounded-xl h-[400px] text-center text-neutral-500">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-eye mb-4 opacity-30"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/></svg>
              <p className="text-sm font-semibold tracking-widest uppercase mb-2 text-neutral-400">Inspector Hidden</p>
              <p className="text-xs">Klik op het oog-icoontje in de bediening om de Ghost AI te onthullen.</p>
            </div>
          )}
        </div>
      </main>

      {/* Vibrant Palette Bottom Status Bar */}
      <footer className="w-full max-w-[1400px] flex justify-between items-center px-4 sm:px-12 py-4 sm:py-6 border-t border-gray-900 bg-black mt-auto">
        {/* Lives: Iconic Pac-Man Polygon Wedges */}
        <div className="flex items-center space-x-2 sm:space-x-3" id="livesContainer">
          {Array.from({ length: Math.max(0, lives - 1) }).map((_, i) => (
            <div
              key={i}
              className="w-6 h-6 sm:w-8 sm:h-8 bg-yellow-400 hover:scale-110 transition-transform shadow-sm"
              style={{
                clipPath: 'polygon(100% 0, 100% 40%, 50% 50%, 100% 60%, 100% 100%, 0 100%, 0 0)'
              }}
              title={`Extra Leven ${i + 1}`}
            />
          ))}
          {lives <= 1 && (
            <span className="text-red-500 text-[10px] sm:text-xs font-bold tracking-wider animate-pulse">
              LAATSTE LEVEN!
            </span>
          )}
        </div>

        {/* Difficulty Selector Pills */}
        <div className="flex flex-col items-center">
          <div className="text-blue-400 text-[10px] sm:text-xs mb-1 uppercase tracking-widest font-semibold">
            Difficulty
          </div>
          <div className="flex space-x-1.5 sm:space-x-2">
            <button
              type="button"
              onClick={() => handleSelectDifficulty('casual', level)}
              className={`px-2 sm:px-2.5 py-1 text-[10px] rounded font-bold uppercase transition-all ${
                difficulty === 'casual'
                  ? 'bg-blue-600 text-white border border-blue-400 shadow-[0_0_12px_rgba(37,99,235,0.6)]'
                  : 'bg-blue-950 text-blue-300 border border-blue-800 opacity-60 hover:opacity-100'
              }`}
            >
              EASY
            </button>
            <button
              type="button"
              onClick={() => handleSelectDifficulty('classic', level)}
              className={`px-2 sm:px-2.5 py-1 text-[10px] rounded font-bold uppercase transition-all ${
                difficulty === 'classic'
                  ? 'bg-yellow-400 text-black shadow-[0_0_12px_rgba(250,204,21,0.6)]'
                  : 'bg-neutral-800 text-neutral-400 border border-neutral-700 opacity-60 hover:opacity-100'
              }`}
            >
              CLASSIC
            </button>
            <button
              type="button"
              onClick={() => handleSelectDifficulty('turbo', level)}
              className={`px-2 sm:px-2.5 py-1 text-[10px] rounded font-bold uppercase transition-all ${
                difficulty === 'turbo'
                  ? 'bg-red-600 text-white border border-red-400 shadow-[0_0_12px_rgba(239,68,68,0.6)]'
                  : 'bg-red-950 text-red-300 border border-red-800 opacity-60 hover:opacity-100'
              }`}
            >
              EXPERT
            </button>
          </div>
        </div>

        {/* Fruit & Level Indicator */}
        <div className="flex space-x-2 items-center" id="fruitContainer">
          <div
            className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center text-xl sm:text-2xl filter drop-shadow"
            title={`Huidige Vrucht: ${currentFruit}`}
          >
            {getFruitEmoji(currentFruit)}
          </div>
          <div className="text-white text-base sm:text-xl font-bold tracking-tight">
            LVL {level}
          </div>
        </div>
      </footer>

      {/* Difficulty & Level Modal */}
      <DifficultyModal
        isOpen={isDifficultyOpen}
        onClose={() => setIsDifficultyOpen(false)}
        currentDifficulty={difficulty}
        currentLevel={level}
        onSelectDifficulty={handleSelectDifficulty}
      />

      {/* High Score Initials Entry Modal */}
      <HighScoreEntryModal
        isOpen={isHighScoreEntryOpen}
        score={gameOverScore}
        level={gameOverLevel}
        difficulty={difficulty}
        rank={newHighScoreRank}
        onSave={handleSaveInitials}
        onCancel={() => setIsHighScoreEntryOpen(false)}
      />

      {/* Arcade Leaderboard Modal */}
      <LeaderboardModal
        isOpen={isLeaderboardOpen}
        onClose={() => setIsLeaderboardOpen(false)}
        onPlayAgain={() => {
          setIsLeaderboardOpen(false);
          restartGame(difficulty, 1);
        }}
        highlightId={justSavedEntryId}
      />

      {/* Game Controls & Xbox Modal */}
      <GameControlsModal
        isOpen={showControls}
        onClose={() => setShowControls(false)}
        gameId="pacman"
      />
    </div>
  );
};
