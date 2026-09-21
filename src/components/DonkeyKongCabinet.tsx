/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Donkey Kong (1981 Nintendo Arcade) - Dedicated Arcade Cabinet Component
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { DonkeyKongEngine, StageType, VIRTUAL_WIDTH, VIRTUAL_HEIGHT } from '../game/donkeyKongEngine';
import { donkeyKongRenderer } from '../game/donkeyKongRenderer';
import { donkeyKongAudio } from '../game/donkeyKongAudio';
import { getDonkeyKongHighScores, saveDonkeyKongHighScore, DonkeyKongHighScore } from '../game/donkeyKongHighScores';
import { DonkeyKongHistoryModal } from './DonkeyKongHistoryModal';
import { DonkeyKongLandingPage } from './DonkeyKongLandingPage';
import { GameControlsModal, useGameControls } from './GameControlsModal';
import {
  RotateCcw,
  Volume2,
  VolumeX,
  Tv,
  ArrowLeft,
  BookOpen,
  Trophy,
  HelpCircle,
  Crown,
  Play,
  Flame,
  Zap,
  Sparkles
} from 'lucide-react';
import { haptics } from '../utils/haptics';

interface DonkeyKongCabinetProps {
  onBackToLobby: () => void;
}

export const DonkeyKongCabinet: React.FC<DonkeyKongCabinetProps> = ({ onBackToLobby }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<DonkeyKongEngine | null>(null);

  const [isCrtEnabled, setIsCrtEnabled] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isDossierOpen, setIsDossierOpen] = useState(false);
  const { showControls, setShowControls } = useGameControls('donkey_kong');

  const [score, setScore] = useState(0);
  const [stage, setStage] = useState<StageType>('25m');
  const [levelCycle, setLevelCycle] = useState(1);
  const [lives, setLives] = useState(3);
  const [gameOver, setGameOver] = useState(false);
  const [highScores, setHighScores] = useState<DonkeyKongHighScore[]>([]);
  const [initialsInput, setInitialsInput] = useState('MAR');
  const [scoreSaved, setScoreSaved] = useState(false);
  const [viewMode, setViewMode] = useState<'arcade' | 'landing'>('landing');

  // Key tracking
  const keysRef = useRef({
    left: false,
    right: false,
    up: false,
    down: false,
    jump: false,
    hammer: false
  });

  const handleSelectStageNumber = useCallback((stageNum: number = 1) => {
    const stageMap: Record<number, StageType> = { 1: '25m', 2: '50m', 3: '75m', 4: '100m' };
    const stg = stageMap[stageNum] || '25m';
    setStage(stg);
    if (engineRef.current) {
      engineRef.current.loadStage(stg);
      setScore(engineRef.current.score);
      setLives(engineRef.current.lives);
      setGameOver(false);
    }
  }, []);

  // Initialize engine & high scores
  useEffect(() => {
    setHighScores(getDonkeyKongHighScores());
    const engine = new DonkeyKongEngine();
    engineRef.current = engine;

    engine.onGameOver = (finalScore) => {
      setGameOver(true);
      setScore(finalScore);
      setScoreSaved(false);
      haptics.heavy();
    };

    return () => {
      donkeyKongAudio.stopHammerMusic();
      engineRef.current = null;
    };
  }, []);

  // Keyboard handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowLeft', 'KeyA'].includes(e.code)) {
        keysRef.current.left = true;
      }
      if (['ArrowRight', 'KeyD'].includes(e.code)) {
        keysRef.current.right = true;
      }
      if (['ArrowUp', 'KeyW'].includes(e.code)) {
        keysRef.current.up = true;
      }
      if (['ArrowDown', 'KeyS'].includes(e.code)) {
        keysRef.current.down = true;
      }
      if (['Space', 'KeyK', 'KeyZ', 'ControlLeft', 'ControlRight'].includes(e.code)) {
        keysRef.current.jump = true;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (['ArrowLeft', 'KeyA'].includes(e.code)) {
        keysRef.current.left = false;
      }
      if (['ArrowRight', 'KeyD'].includes(e.code)) {
        keysRef.current.right = false;
      }
      if (['ArrowUp', 'KeyW'].includes(e.code)) {
        keysRef.current.up = false;
      }
      if (['ArrowDown', 'KeyS'].includes(e.code)) {
        keysRef.current.down = false;
      }
      if (['Space', 'KeyK', 'KeyZ', 'ControlLeft', 'ControlRight'].includes(e.code)) {
        keysRef.current.jump = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Animation & Render Loop
  useEffect(() => {
    let animId: number;

    const loop = () => {
      const engine = engineRef.current;
      const canvas = canvasRef.current;

      if (engine && canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          engine.update(keysRef.current);
          donkeyKongRenderer.render(ctx, engine, isCrtEnabled);

          // Sync state for UI
          setScore(engine.score);
          setStage(engine.stage);
          setLevelCycle(engine.levelCycle);
          setLives(engine.lives);
        }
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [isCrtEnabled]);

  // Handle restarting game
  const handleRestart = useCallback(() => {
    if (engineRef.current) {
      engineRef.current = new DonkeyKongEngine();
      engineRef.current.onGameOver = (finalScore) => {
        setGameOver(true);
        setScore(finalScore);
        setScoreSaved(false);
      };
      setGameOver(false);
      setScore(0);
      setScoreSaved(false);
    }
  }, []);

  // Jump to specific stage
  const handleSelectStage = (selectedStage: StageType) => {
    if (engineRef.current) {
      engineRef.current.initStage(selectedStage);
      setGameOver(false);
      setStage(selectedStage);
    }
  };

  const handleSaveScore = (e: React.FormEvent) => {
    e.preventDefault();
    if (scoreSaved || !initialsInput.trim()) return;

    const cleanInitials = initialsInput.trim().toUpperCase().slice(0, 3);
    const updated = saveDonkeyKongHighScore({
      initials: cleanInitials,
      score,
      level: levelCycle,
      stage
    });

    setHighScores(updated);
    setScoreSaved(true);
  };

  const toggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    donkeyKongAudio.setMuted(next);
  };

  if (viewMode === 'landing') {
    return (
      <DonkeyKongLandingPage
        onPlay={(stageNum) => {
          if (stageNum) handleSelectStageNumber(stageNum);
          setViewMode('arcade');
        }}
        onBackToLobby={onBackToLobby}
      />
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full bg-neutral-950 p-2 sm:p-4 text-white select-none">
      {/* Top Bar with Navigation & Actions */}
      <div className="flex items-center justify-between w-full max-w-4xl mb-3 px-2">
        <button
          onClick={onBackToLobby}
          className="flex items-center space-x-2 px-3 py-1.5 bg-neutral-900 border border-neutral-800 hover:border-red-500 rounded-lg text-xs font-mono font-bold text-neutral-300 hover:text-white transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-red-500" />
          <span>ARCADE LOBBY</span>
        </button>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setViewMode('landing')}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-amber-950/40 border border-amber-500/40 hover:border-amber-400 rounded-lg text-xs font-mono font-bold text-amber-300 hover:text-amber-200 transition cursor-pointer"
            title="Open Landing Page & Expositie"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>EXPOSITIE</span>
          </button>
          <button
            onClick={() => setIsDossierOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-red-950/40 border border-red-500/40 hover:border-red-400 rounded-lg text-xs font-mono font-bold text-red-300 hover:text-red-200 transition"
          >
            <BookOpen className="w-4 h-4 text-red-400" />
            <span>DOSSIER</span>
          </button>
          <button
            onClick={() => setShowControls(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-blue-950/40 border border-blue-500/40 hover:border-blue-400 rounded-lg text-xs font-mono font-bold text-blue-300 hover:text-blue-200 transition"
          >
            <HelpCircle className="w-4 h-4 text-blue-400" />
            <span>BESTURING</span>
          </button>
          <button
            onClick={toggleMute}
            className="p-1.5 bg-neutral-900 border border-neutral-800 hover:border-neutral-700 rounded-lg text-neutral-400 hover:text-white transition"
            title={isMuted ? 'Geluid Aanzetten' : 'Geluid Dempen'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>
          <button
            onClick={() => setIsCrtEnabled(!isCrtEnabled)}
            className={`p-1.5 bg-neutral-900 border rounded-lg transition ${
              isCrtEnabled ? 'border-cyan-500 text-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.3)]' : 'border-neutral-800 text-neutral-500'
            }`}
            title="CRT Monitor Filter Toggle"
          >
            <Tv className="w-4 h-4" />
          </button>
          <button
            onClick={handleRestart}
            className="p-1.5 bg-neutral-900 border border-neutral-800 hover:border-amber-500 rounded-lg text-neutral-400 hover:text-amber-400 transition"
            title="Herstart Game"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Arcade Cabinet Housing */}
      <div className="relative flex flex-col items-center bg-gradient-to-b from-sky-950 via-neutral-900 to-neutral-950 p-4 sm:p-6 rounded-2xl border-4 border-sky-600 shadow-[0_0_50px_rgba(2,132,199,0.4)] w-full max-w-3xl">
        {/* Cabinet Marquee Header */}
        <div className="relative w-full max-w-xl h-16 sm:h-20 bg-gradient-to-r from-red-600 via-amber-500 to-red-600 rounded-t-xl border-2 border-amber-300 p-2 flex items-center justify-between shadow-[0_0_20px_rgba(245,158,11,0.5)] overflow-hidden mb-3">
          <div className="flex items-center space-x-2 z-10">
            <span className="text-2xl sm:text-3xl">🦍</span>
            <div>
              <h1 className="text-xl sm:text-2xl font-black italic tracking-tighter text-amber-200 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] font-sans">
                DONKEY KONG
              </h1>
              <p className="text-[9px] sm:text-[10px] font-mono font-bold text-red-950 bg-amber-300/80 px-1 rounded inline-block">
                © 1981 NINTENDO CO., LTD.
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-1.5 z-10">
            <span className="text-xl">👩</span>
            <span className="text-xl">🔨</span>
          </div>
          {/* Marquee Backlight Sheen */}
          <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/20 to-transparent pointer-events-none" />
        </div>

        {/* Level Quick-Selector Chips */}
        <div className="flex items-center space-x-2 mb-3 bg-neutral-950/80 p-1.5 rounded-lg border border-neutral-800">
          <span className="text-[10px] font-mono text-neutral-400 font-bold px-2">KIES LEVEL:</span>
          {(['25m', '50m', '75m', '100m'] as StageType[]).map((stg) => (
            <button
              key={stg}
              onClick={() => handleSelectStage(stg)}
              className={`px-2.5 py-1 text-xs font-mono font-bold rounded transition ${
                stage === stg
                  ? 'bg-red-600 text-white shadow-[0_0_10px_rgba(239,68,68,0.5)]'
                  : 'bg-neutral-900 text-neutral-400 hover:text-white hover:bg-neutral-800'
              }`}
            >
              {stg.toUpperCase()}
            </button>
          ))}
        </div>

        {/* CRT Bezel & Display Screen */}
        <div className="relative bg-neutral-950 p-3 sm:p-4 rounded-xl border-4 border-neutral-800 shadow-[inset_0_0_20px_rgba(0,0,0,0.9)] flex items-center justify-center">
          <canvas
            ref={canvasRef}
            width={VIRTUAL_WIDTH}
            height={VIRTUAL_HEIGHT}
            className="w-[280px] h-[320px] sm:w-[336px] sm:h-[384px] md:w-[392px] md:h-[448px] bg-black rounded shadow-[0_0_15px_rgba(0,0,0,0.8)] image-rendering-pixelated"
            style={{ imageRendering: 'pixelated' }}
          />

          {/* Game Over Form Overlay */}
          {gameOver && (
            <div className="absolute inset-0 z-20 bg-black/85 flex flex-col items-center justify-center p-4 text-center rounded-xl animate-fadeIn">
              <h2 className="text-xl font-bold font-mono text-red-500 mb-2">GAME OVER</h2>
              <p className="text-xs font-mono text-neutral-300 mb-1">EINDSCORE: <span className="text-amber-400 font-bold">{score}</span></p>
              <p className="text-xs font-mono text-neutral-400 mb-4">BEREIKTE STAGE: <span className="text-sky-400 font-bold">{stage} (L={levelCycle})</span></p>

              {!scoreSaved ? (
                <form onSubmit={handleSaveScore} className="flex flex-col items-center space-y-3 w-full max-w-xs">
                  <label className="text-xs font-mono text-amber-300">VOER JE INITIALEN IN (3 LETTERS):</label>
                  <input
                    type="text"
                    maxLength={3}
                    value={initialsInput}
                    onChange={(e) => setInitialsInput(e.target.value.toUpperCase())}
                    className="w-24 text-center text-xl font-mono font-bold bg-neutral-900 border-2 border-amber-500 rounded px-2 py-1 text-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-400 uppercase"
                  />
                  <button
                    type="submit"
                    className="w-full py-2 bg-amber-600 hover:bg-amber-500 text-neutral-950 font-bold font-mono text-xs rounded transition shadow-[0_0_10px_rgba(245,158,11,0.4)]"
                  >
                    OPSLAAN IN HALL OF FAME
                  </button>
                </form>
              ) : (
                <div className="text-xs font-mono text-emerald-400 mb-3">
                  ✓ Score opgeslagen in Hall of Fame!
                </div>
              )}

              <button
                onClick={handleRestart}
                className="mt-3 flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-mono text-xs font-bold rounded transition shadow-[0_0_10px_rgba(239,68,68,0.4)]"
              >
                <Play className="w-4 h-4" />
                <span>SPEEL OPNIEUW</span>
              </button>
            </div>
          )}
        </div>

        {/* Mobile / On-Screen Touch Controls */}
        <div className="flex md:hidden items-center justify-between w-full max-w-md mt-4 px-4">
          {/* Virtual D-pad */}
          <div className="grid grid-cols-3 gap-1 w-32 h-32">
            <div />
            <button
              onTouchStart={() => { keysRef.current.up = true; haptics.light(); }}
              onTouchEnd={() => { keysRef.current.up = false; }}
              onMouseDown={() => { keysRef.current.up = true; }}
              onMouseUp={() => { keysRef.current.up = false; }}
              className="bg-neutral-800 border border-neutral-700 active:bg-red-600 rounded flex items-center justify-center text-xs font-bold text-neutral-300"
            >
              ▲
            </button>
            <div />
            <button
              onTouchStart={() => { keysRef.current.left = true; haptics.light(); }}
              onTouchEnd={() => { keysRef.current.left = false; }}
              onMouseDown={() => { keysRef.current.left = true; }}
              onMouseUp={() => { keysRef.current.left = false; }}
              className="bg-neutral-800 border border-neutral-700 active:bg-red-600 rounded flex items-center justify-center text-xs font-bold text-neutral-300"
            >
              ◀
            </button>
            <div className="bg-neutral-900 rounded" />
            <button
              onTouchStart={() => { keysRef.current.right = true; haptics.light(); }}
              onTouchEnd={() => { keysRef.current.right = false; }}
              onMouseDown={() => { keysRef.current.right = true; }}
              onMouseUp={() => { keysRef.current.right = false; }}
              className="bg-neutral-800 border border-neutral-700 active:bg-red-600 rounded flex items-center justify-center text-xs font-bold text-neutral-300"
            >
              ▶
            </button>
            <div />
            <button
              onTouchStart={() => { keysRef.current.down = true; haptics.light(); }}
              onTouchEnd={() => { keysRef.current.down = false; }}
              onMouseDown={() => { keysRef.current.down = true; }}
              onMouseUp={() => { keysRef.current.down = false; }}
              className="bg-neutral-800 border border-neutral-700 active:bg-red-600 rounded flex items-center justify-center text-xs font-bold text-neutral-300"
            >
              ▼
            </button>
            <div />
          </div>

          {/* Action Jump Button */}
          <div className="flex flex-col items-center space-y-2">
            <button
              onTouchStart={() => { keysRef.current.jump = true; haptics.medium(); }}
              onTouchEnd={() => { keysRef.current.jump = false; }}
              onMouseDown={() => { keysRef.current.jump = true; }}
              onMouseUp={() => { keysRef.current.jump = false; }}
              className="w-20 h-20 bg-red-600 active:bg-red-400 border-4 border-red-400 rounded-full shadow-[0_0_15px_rgba(239,68,68,0.6)] flex items-center justify-center text-white font-mono font-black text-sm"
            >
              JUMP
            </button>
            <span className="text-[10px] font-mono text-neutral-400 font-bold">SPRINGEN / HAMER</span>
          </div>
        </div>

        {/* High Scores Leaderboard Preview */}
        <div className="w-full max-w-xl mt-4 bg-neutral-950/80 border border-neutral-800 rounded-xl p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-mono font-bold text-amber-400">DONKEY KONG HALL OF FAME</span>
            </div>
            <span className="text-[10px] font-mono text-neutral-500">TOP SCORES</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
            {highScores.slice(0, 6).map((hs, idx) => (
              <div key={hs.id} className="flex items-center justify-between bg-neutral-900/60 px-2 py-1 rounded border border-neutral-800/60">
                <div className="flex items-center space-x-2">
                  <span className="text-neutral-500">{idx + 1}.</span>
                  <span className="font-bold text-red-400">{hs.initials}</span>
                  <span className="text-[10px] text-sky-400">[{hs.stage}]</span>
                </div>
                <span className="text-amber-300 font-bold">{hs.score.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* History Dossier Modal */}
      <DonkeyKongHistoryModal
        isOpen={isDossierOpen}
        onClose={() => setIsDossierOpen(false)}
      />

      {/* Game Controls Modal */}
      <GameControlsModal
        isOpen={showControls}
        onClose={() => setShowControls(false)}
        gameId="donkey_kong"
      />
    </div>
  );
};
