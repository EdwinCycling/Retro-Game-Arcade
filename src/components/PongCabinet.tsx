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
  BookOpen, 
  Trophy, 
  Zap, 
  Users, 
  User, 
  Monitor, 
  Sparkles, 
  Tv,
  Flame,
  HelpCircle
} from 'lucide-react';
import { 
  PongEngine, 
  PongDifficulty, 
  PongColorMode, 
  DIFFICULTY_PRESETS 
} from '../game/pongEngine';
import { pongAudio } from '../game/pongAudio';
import { getPongStats, savePongStats, PongRecord } from '../game/pongHighScores';
import { PongHistoryModal } from './PongHistoryModal';
import { Language } from '../i18n/lobbyTranslations';
import { GameControlsModal, useGameControls } from './GameControlsModal';

interface PongCabinetProps {
  onBackToLobby: () => void;
  lang?: Language;
}

const COLOR_PALETTES: Record<PongColorMode, {
  name: string;
  bg: string;
  fg: string;
  accent: string;
  glow: string;
  canvasBg: string;
}> = {
  bw: {
    name: '1972 Monochroom',
    bg: '#000000',
    fg: '#ffffff',
    accent: '#cccccc',
    glow: 'rgba(255, 255, 255, 0.4)',
    canvasBg: '#050505',
  },
  amber: {
    name: 'Amber Fosfor',
    bg: '#120800',
    fg: '#ffb000',
    accent: '#ff8000',
    glow: 'rgba(255, 176, 0, 0.45)',
    canvasBg: '#0a0400',
  },
  green: {
    name: 'Groen Fosfor',
    bg: '#001405',
    fg: '#33ff33',
    accent: '#11aa11',
    glow: 'rgba(51, 255, 51, 0.45)',
    canvasBg: '#000a02',
  },
  neon: {
    name: 'Cyber Neon 80s',
    bg: '#050512',
    fg: '#00f0ff',
    accent: '#ff0077',
    glow: 'rgba(0, 240, 255, 0.55)',
    canvasBg: '#03030a',
  },
};

export const PongCabinet: React.FC<PongCabinetProps> = ({
  onBackToLobby,
  lang = 'nl',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<PongEngine | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const [difficulty, setDifficulty] = useState<PongDifficulty>('amateur');
  const [colorMode, setColorMode] = useState<PongColorMode>('bw');
  const [scanlines, setScanlines] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isTwoPlayer, setIsTwoPlayer] = useState<boolean>(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const { showControls, setShowControls } = useGameControls('pong');
  const [stats, setStats] = useState<PongRecord>(getPongStats);

  // Live HUD states
  const [playerScore, setPlayerScore] = useState<number>(0);
  const [aiScore, setAiScore] = useState<number>(0);
  const [currentRally, setCurrentRally] = useState<number>(0);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [winner, setWinner] = useState<'player' | 'ai' | 'player2' | null>(null);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  // Keys active state
  const keysRef = useRef<{
    w: boolean;
    s: boolean;
    up: boolean;
    down: boolean;
  }>({ w: false, s: false, up: false, down: false });

  // Initialize engine
  useEffect(() => {
    const engine = new PongEngine(difficulty, 11, isTwoPlayer);

    engine.setCallbacks({
      onPaddleHit: (rally) => {
        pongAudio.playPaddleHit(rally);
        setCurrentRally(rally);
      },
      onWallHit: () => {
        pongAudio.playWallHit();
      },
      onScore: (isPlayer) => {
        pongAudio.playScore(isPlayer);
        setPlayerScore(engine.state.playerScore);
        setAiScore(engine.state.aiScore);
        setCurrentRally(0);
      },
      onGameOver: (win) => {
        setIsGameOver(true);
        setWinner(win);
        if (win === 'player') {
          pongAudio.playVictory();
          setStats(savePongStats({
            playerWins: stats.playerWins + 1,
            longestRally: engine.state.maxRallyThisGame,
            highestDifficultyWon: DIFFICULTY_PRESETS[difficulty].nameEn,
          }));
        } else {
          setStats(savePongStats({
            aiWins: stats.aiWins + 1,
            longestRally: engine.state.maxRallyThisGame,
          }));
        }
      },
    });

    engineRef.current = engine;

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [difficulty, isTwoPlayer]);

  // Handle key listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === ' ' && engineRef.current?.state.isGameOver) {
        e.preventDefault();
        restartMatch();
        return;
      }
      if (e.key === 'p' || e.key === 'P') {
        togglePause();
        return;
      }
      if (e.key === 'w' || e.key === 'W') keysRef.current.w = true;
      if (e.key === 's' || e.key === 'S') keysRef.current.s = true;
      if (e.key === 'ArrowUp') keysRef.current.up = true;
      if (e.key === 'ArrowDown') keysRef.current.down = true;
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'w' || e.key === 'W') keysRef.current.w = false;
      if (e.key === 's' || e.key === 'S') keysRef.current.s = false;
      if (e.key === 'ArrowUp') keysRef.current.up = false;
      if (e.key === 'ArrowDown') keysRef.current.down = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Main game render and update loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      const engine = engineRef.current;
      if (engine && !engine.state.isPaused) {
        // Keyboard inputs
        const pSpeed = 7.5;
        if (keysRef.current.w || (!isTwoPlayer && keysRef.current.up)) {
          engine.movePlayerByDelta(-pSpeed);
        }
        if (keysRef.current.s || (!isTwoPlayer && keysRef.current.down)) {
          engine.movePlayerByDelta(pSpeed);
        }
        if (isTwoPlayer) {
          if (keysRef.current.up) engine.movePlayer2ByDelta(-pSpeed);
          if (keysRef.current.down) engine.movePlayer2ByDelta(pSpeed);
        }

        engine.update();
      }

      // Draw canvas
      const palette = COLOR_PALETTES[colorMode];
      ctx.fillStyle = palette.canvasBg;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (engine) {
        // Center Dashed Net Line
        ctx.strokeStyle = palette.accent;
        ctx.lineWidth = 4;
        ctx.setLineDash([12, 12]);
        ctx.beginPath();
        ctx.moveTo(canvas.width / 2, 0);
        ctx.lineTo(canvas.width / 2, canvas.height);
        ctx.stroke();
        ctx.setLineDash([]);

        // Outer Top & Bottom Boundary Lines
        ctx.fillStyle = palette.accent;
        ctx.fillRect(0, 0, canvas.width, 8);
        ctx.fillRect(0, canvas.height - 8, canvas.width, 8);

        // Retro Large Score Counters (Authentic 1972 7-segment digital font style)
        ctx.fillStyle = palette.fg;
        ctx.font = 'bold 64px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';

        // Player 1 Score (Left)
        ctx.fillText(String(engine.state.playerScore), canvas.width / 4, 30);
        // Player 2 / AI Score (Right)
        ctx.fillText(String(engine.state.aiScore), (canvas.width / 4) * 3, 30);

        // Player Labels
        ctx.font = 'bold 12px monospace';
        ctx.fillStyle = palette.accent;
        ctx.fillText(isTwoPlayer ? 'SPELER 1 (W / S)' : 'SPELER 1', canvas.width / 4, 105);
        ctx.fillText(
          isTwoPlayer ? 'SPELER 2 (PIJLTJES)' : `COMPUTER (${DIFFICULTY_PRESETS[difficulty].nameNl.toUpperCase()})`,
          (canvas.width / 4) * 3,
          105
        );

        // Draw Player Paddle
        ctx.shadowColor = palette.glow;
        ctx.shadowBlur = 10;
        ctx.fillStyle = palette.fg;
        ctx.fillRect(
          engine.playerPaddle.x,
          engine.playerPaddle.y,
          engine.playerPaddle.width,
          engine.playerPaddle.height
        );

        // Draw Player 2 / AI Paddle
        ctx.fillRect(
          engine.aiPaddle.x,
          engine.aiPaddle.y,
          engine.aiPaddle.width,
          engine.aiPaddle.height
        );

        // Draw Ball Trail
        engine.ball.trail.forEach((t) => {
          ctx.fillStyle = palette.fg;
          ctx.globalAlpha = t.alpha * 0.4;
          ctx.fillRect(t.x, t.y, engine.ball.size, engine.ball.size);
        });
        ctx.globalAlpha = 1.0;

        // Draw Ball
        ctx.shadowBlur = 14;
        ctx.fillStyle = palette.fg;
        ctx.fillRect(engine.ball.x, engine.ball.y, engine.ball.size, engine.ball.size);
        ctx.shadowBlur = 0;

        // Serving indicator
        if (engine.state.isServing && !engine.state.isGameOver) {
          ctx.font = 'bold 14px monospace';
          ctx.fillStyle = palette.fg;
          ctx.textAlign = 'center';
          const toWhom = engine.state.servingTo === 'player' ? 'SPELER 1' : isTwoPlayer ? 'SPELER 2' : 'COMPUTER';
          ctx.fillText(`OPSLAG VOOR ${toWhom}...`, canvas.width / 2, canvas.height - 35);
        }

        // Game Over Banner
        if (engine.state.isGameOver) {
          ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          ctx.fillStyle = palette.fg;
          ctx.font = 'bold 36px monospace';
          ctx.textAlign = 'center';
          ctx.fillText(
            engine.state.winner === 'player'
              ? 'GEWONNEN! ★ VICTORY!'
              : isTwoPlayer
              ? 'SPELER 2 WINT!'
              : 'COMPUTER HEEFT GEWONNEN!',
            canvas.width / 2,
            canvas.height / 2 - 30
          );

          ctx.font = 'bold 16px monospace';
          ctx.fillStyle = palette.accent;
          ctx.fillText('DRUK OP SPATIE OF DE HERSTART KNOP OM OPNIEUW TE SPELEN', canvas.width / 2, canvas.height / 2 + 25);
          ctx.fillText(`Langste Rally deze match: ${engine.state.maxRallyThisGame} slagen`, canvas.width / 2, canvas.height / 2 + 55);
        }
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [colorMode, difficulty, isTwoPlayer]);

  // Pointer / Mouse control over canvas
  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    const engine = engineRef.current;
    if (!canvas || !engine) return;

    const rect = canvas.getBoundingClientRect();
    const scaleY = canvas.height / rect.height;
    const clientY = e.clientY - rect.top;
    const targetY = clientY * scaleY - engine.playerPaddle.height / 2;

    engine.movePlayerPaddle(targetY);
  };

  const restartMatch = () => {
    pongAudio.playClick();
    engineRef.current?.resetGame();
    setPlayerScore(0);
    setAiScore(0);
    setCurrentRally(0);
    setIsGameOver(false);
    setWinner(null);
  };

  const togglePause = () => {
    pongAudio.playClick();
    if (engineRef.current) {
      engineRef.current.state.isPaused = !engineRef.current.state.isPaused;
      setIsPaused(engineRef.current.state.isPaused);
    }
  };

  const toggleAudio = () => {
    const next = !isMuted;
    setIsMuted(next);
    pongAudio.setMuted(next);
  };

  const cycleColorMode = () => {
    pongAudio.playClick();
    const modes: PongColorMode[] = ['bw', 'amber', 'green', 'neon'];
    const nextIdx = (modes.indexOf(colorMode) + 1) % modes.length;
    setColorMode(modes[nextIdx]);
  };

  const handleDifficultyChange = (diff: PongDifficulty) => {
    pongAudio.playClick();
    setDifficulty(diff);
    engineRef.current?.setDifficulty(diff);
  };

  const toggleTwoPlayer = () => {
    pongAudio.playClick();
    const next = !isTwoPlayer;
    setIsTwoPlayer(next);
    engineRef.current?.setTwoPlayer(next);
    restartMatch();
  };

  return (
    <div className="min-h-screen w-full bg-neutral-950 text-white flex flex-col font-sans select-none pb-12">
      {/* Top Arcade Navigation Bar */}
      <header className="sticky top-0 z-30 w-full bg-black/90 border-b border-neutral-800 backdrop-blur px-3 sm:px-6 py-2.5 flex items-center justify-between shadow-xl">
        <div className="flex items-center gap-2 sm:gap-4">
          <button
            type="button"
            onClick={onBackToLobby}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-mono font-bold transition-all active:scale-95 cursor-pointer border border-neutral-700"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Speelhal Lobby</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="text-xl">🏓</span>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-mono font-black text-sm sm:text-base tracking-wider text-white">
                  PONG
                </h1>
                <span className="px-1.5 py-0.5 rounded bg-white text-black font-mono font-black text-[10px]">
                  1972 ATARI
                </span>
              </div>
              <p className="text-[10px] text-neutral-400 font-mono hidden md:block">
                Nolan Bushnell &amp; Allan Alcorn • Discrete TTL Architecture
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* CRT Palette Toggle */}
          <button
            type="button"
            onClick={cycleColorMode}
            className="px-2.5 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs font-mono font-bold border border-neutral-700 flex items-center gap-1.5 transition-all cursor-pointer"
            title="Kleurmodus wisselen"
          >
            <Tv className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">{COLOR_PALETTES[colorMode].name}</span>
          </button>

          {/* Scanlines Toggle */}
          <button
            type="button"
            onClick={() => setScanlines(!scanlines)}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold border transition-all cursor-pointer ${
              scanlines
                ? 'bg-cyan-950 text-cyan-300 border-cyan-700'
                : 'bg-neutral-800 text-neutral-400 border-neutral-700'
            }`}
            title="CRT Scanlines aan/uit"
          >
            <Monitor className="w-3.5 h-3.5" />
          </button>

          {/* Audio Toggle */}
          <button
            type="button"
            onClick={toggleAudio}
            className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-neutral-700 transition-all cursor-pointer"
            title={isMuted ? 'Geluid aanzetten' : 'Geluid dempen'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>

          {/* Controls Modal */}
          <button
            type="button"
            onClick={() => setShowControls(true)}
            className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-yellow-400 border border-neutral-700 text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            title="Besturing & Xbox Controller"
          >
            <HelpCircle className="w-4 h-4 text-yellow-400" />
            <span className="hidden sm:inline">Besturing</span>
          </button>

          {/* Dossier Modal */}
          <button
            type="button"
            onClick={() => setIsHistoryOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 hover:bg-amber-500/30 text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <BookOpen className="w-4 h-4" />
            <span className="hidden sm:inline">Dossier</span>
          </button>
        </div>
      </header>

      {/* Main Cabinet Body */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-3 sm:p-6 flex flex-col items-center gap-4">
        {/* Difficulty & Mode Selector Toolbar */}
        <div className="w-full bg-neutral-900/90 border border-neutral-800 rounded-2xl p-3 sm:p-4 flex flex-wrap items-center justify-between gap-3 shadow-lg">
          {/* Difficulty Tiers */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <span className="text-xs font-mono font-bold text-neutral-400 uppercase mr-1 flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-orange-400" />
              <span>Moeilijkheid:</span>
            </span>
            {(['novice', 'amateur', 'pro', 'master'] as PongDifficulty[]).map((d) => {
              const active = difficulty === d && !isTwoPlayer;
              return (
                <button
                  key={d}
                  type="button"
                  onClick={() => {
                    if (isTwoPlayer) setIsTwoPlayer(false);
                    handleDifficultyChange(d);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                    active
                      ? 'bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.4)] scale-105'
                      : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700 border border-neutral-700'
                  }`}
                >
                  {DIFFICULTY_PRESETS[d].nameNl}
                </button>
              );
            })}
          </div>

          {/* 1P vs 2P Switch & Restart */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleTwoPlayer}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer border ${
                isTwoPlayer
                  ? 'bg-purple-600 text-white border-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.5)]'
                  : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700 border-neutral-700'
              }`}
            >
              {isTwoPlayer ? <Users className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
              <span>{isTwoPlayer ? '2 Spelers (Lokaal)' : '1 Speler vs Computer'}</span>
            </button>

            <button
              type="button"
              onClick={restartMatch}
              className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 text-xs font-mono font-bold flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Herstart</span>
            </button>
          </div>
        </div>

        {/* Live Active Difficulty Insight */}
        {!isTwoPlayer && (
          <div className="w-full text-xs font-mono text-neutral-400 bg-neutral-900/50 border border-neutral-800/80 rounded-xl px-4 py-2 flex items-center justify-between">
            <span>
              ℹ️ {DIFFICULTY_PRESETS[difficulty].descriptionNl}
            </span>
            <span className="text-yellow-400 font-bold hidden sm:inline">
              Eerste naar 11 punten wint!
            </span>
          </div>
        )}

        {/* Authentic CRT Cabinet Bezel & Canvas Display */}
        <div className="relative w-full aspect-[8/5] max-h-[580px] bg-black rounded-3xl p-3 sm:p-5 border-4 border-neutral-800 shadow-[0_0_60px_rgba(0,0,0,0.9)] flex items-center justify-center overflow-hidden">
          {/* CRT Glass Reflection and Bezel curve */}
          <div className="absolute inset-0 bg-gradient-to-tr from-white/5 via-transparent to-transparent pointer-events-none rounded-3xl z-20" />

          {/* CRT Scanlines Overlay */}
          {scanlines && (
            <div 
              className="absolute inset-0 pointer-events-none z-10 opacity-20"
              style={{
                backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 0, 0, 0.8) 3px, rgba(0, 0, 0, 0.8) 4px)',
                backgroundSize: '100% 4px'
              }}
            />
          )}

          {/* Main Game Canvas */}
          <canvas
            ref={canvasRef}
            width={800}
            height={500}
            onPointerMove={handlePointerMove}
            className="w-full h-full object-contain rounded-xl cursor-ns-resize touch-none"
          />

          {/* Live Rally Counter Overlay */}
          <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 px-3 py-1 rounded-full bg-black/60 backdrop-blur border border-white/20 text-white font-mono text-xs shadow-lg">
            <Zap className={`w-3.5 h-3.5 ${currentRally > 5 ? 'text-yellow-400 animate-bounce' : 'text-neutral-400'}`} />
            <span>Rally: <strong>{currentRally}</strong> slagen</span>
          </div>
        </div>

        {/* Mobile On-Screen Controls */}
        <div className="w-full sm:hidden flex items-center justify-between gap-4 px-2">
          <div className="flex-1 flex gap-2">
            <button
              type="button"
              onPointerDown={() => { keysRef.current.w = true; }}
              onPointerUp={() => { keysRef.current.w = false; }}
              className="flex-1 py-4 rounded-xl bg-neutral-800 active:bg-white active:text-black font-mono font-bold text-lg border border-neutral-700 text-center"
            >
              ▲ OMHOOG
            </button>
            <button
              type="button"
              onPointerDown={() => { keysRef.current.s = true; }}
              onPointerUp={() => { keysRef.current.s = false; }}
              className="flex-1 py-4 rounded-xl bg-neutral-800 active:bg-white active:text-black font-mono font-bold text-lg border border-neutral-700 text-center"
            >
              ▼ OMLAAG
            </button>
          </div>
        </div>

        {/* Stats & Controls Guide Footer */}
        <div className="w-full grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
          {/* Controls helper */}
          <div className="p-3.5 rounded-xl bg-neutral-900/70 border border-neutral-800 space-y-1">
            <div className="text-neutral-400 font-bold uppercase">Besturing:</div>
            <div className="text-neutral-300">
              • Muis / Touch: Beweeg over het scherm
            </div>
            <div className="text-neutral-300">
              • Toetsenbord: <kbd className="px-1 bg-neutral-800 rounded">W</kbd> / <kbd className="px-1 bg-neutral-800 rounded">S</kbd> of pijltjes
            </div>
          </div>

          {/* Rally stats */}
          <div className="p-3.5 rounded-xl bg-neutral-900/70 border border-neutral-800 flex items-center justify-between">
            <div>
              <div className="text-neutral-400 font-bold uppercase">Langste Rally Ooit:</div>
              <div className="text-xl font-bold text-yellow-400 mt-1">
                {stats.longestRally} slagen
              </div>
            </div>
            <Trophy className="w-8 h-8 text-yellow-500/50" />
          </div>

          {/* Win/Loss record */}
          <div className="p-3.5 rounded-xl bg-neutral-900/70 border border-neutral-800 space-y-1">
            <div className="text-neutral-400 font-bold uppercase">Jouw Balans:</div>
            <div className="flex items-center gap-3 text-neutral-300 mt-1">
              <span className="text-emerald-400 font-bold">{stats.playerWins} Gewonnen</span>
              <span className="text-neutral-500">|</span>
              <span className="text-rose-400 font-bold">{stats.aiWins} Verloren</span>
            </div>
          </div>
        </div>
      </main>

      {/* Historical Dossier Modal */}
      <PongHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        lang={lang}
      />

      {/* Game Controls & Xbox Modal */}
      <GameControlsModal
        isOpen={showControls}
        onClose={() => setShowControls(false)}
        gameId="pong"
      />
    </div>
  );
};
