/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Lemmings (1991 DMA Design / Psygnosis / C64) - Arcade Cabinet Component
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  ArrowLeft,
  Volume2,
  VolumeX,
  Music,
  Tv,
  RotateCcw,
  Trophy,
  BookOpen,
  FastForward,
  Pause,
  Play,
  Flame,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Shield,
  Zap,
  Radio,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { LemmingSkill, LemmingsScore } from '../game/lemmingsTypes';
import { LemmingsEngine } from '../game/lemmingsEngine';
import { LemmingsRenderer } from '../game/lemmingsRenderer';
import { LEMMINGS_LEVELS } from '../game/lemmingsLevels';
import { lemmingsAudio } from '../game/lemmingsAudio';
import { getLemmingsScores, saveLemmingsScore } from '../game/lemmingsHighScores';
import { LemmingsHistoryModal } from './LemmingsHistoryModal';
import { GameControlsModal, useGameControls } from './GameControlsModal';
import { haptics } from '../utils/haptics';

interface LemmingsCabinetProps {
  onBackToLobby: () => void;
}

export const LemmingsCabinet: React.FC<LemmingsCabinetProps> = ({ onBackToLobby }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<LemmingsEngine | null>(null);
  const rendererRef = useRef<LemmingsRenderer | null>(null);
  const animFrameIdRef = useRef<number | null>(null);

  // Synchronized state
  const [levelIndex, setLevelIndex] = useState(0);
  const [gameState, setGameState] = useState<'PLAYING' | 'PAUSED' | 'WON' | 'LOST' | 'INTRO'>('PLAYING');
  const [score, setScore] = useState(0);
  const [lemmingsOut, setLemmingsOut] = useState(0);
  const [lemmingsIn, setLemmingsIn] = useState(0);
  const [lemmingsAlive, setLemmingsAlive] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(300);
  const [releaseRate, setReleaseRate] = useState(50);
  const [activeSkill, setActiveSkill] = useState<LemmingSkill | null>('digger');
  const [skillsInventory, setSkillsInventory] = useState(LEMMINGS_LEVELS[0].skills);
  const [isFastForward, setIsFastForward] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isMusicOn, setIsMusicOn] = useState(true);
  const [enableCRT, setEnableCRT] = useState(true);

  // Modals & Overlays
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showLevelSelector, setShowLevelSelector] = useState(false);
  const [showHighScoresModal, setShowHighScoresModal] = useState(false);
  const [highScores, setHighScores] = useState<LemmingsScore[]>(getLemmingsScores());
  const [initials, setInitials] = useState('');
  const [hasSubmittedScore, setHasSubmittedScore] = useState(false);
  const { showControls, setShowControls } = useGameControls('lemmings');

  // Mouse / Touch Dragging on Viewport
  const isDraggingRef = useRef(false);
  const dragStartXRef = useRef(0);
  const dragStartVpXRef = useRef(0);

  // Initialize Game Engine & Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    const engine = new LemmingsEngine(levelIndex);
    const renderer = new LemmingsRenderer(ctx);
    renderer.enableCRT = enableCRT;

    engineRef.current = engine;
    rendererRef.current = renderer;

    setSkillsInventory({ ...engine.currentLevel.skills });
    setReleaseRate(engine.currentLevel.releaseRate);
    setTimeRemaining(engine.currentLevel.timeLimit);
    setGameState(engine.stats.state);

    if (isMusicOn && !isMuted) {
      lemmingsAudio.startMusic();
    }

    let lastTime = performance.now();

    const loop = (currentTime: number) => {
      const dt = (currentTime - lastTime) / 1000;
      lastTime = currentTime;

      if (engineRef.current && rendererRef.current) {
        engineRef.current.update(Math.min(dt, 0.1));
        rendererRef.current.render(engineRef.current, canvas.width, canvas.height);

        // Sync UI state every 10 frames
        if (Math.random() < 0.2) {
          const stats = engineRef.current.stats;
          setGameState(stats.state);
          setScore(stats.score);
          setLemmingsOut(stats.lemmingsOut);
          setLemmingsIn(stats.lemmingsIn);
          setLemmingsAlive(stats.lemmingsAlive);
          setTimeRemaining(stats.timeRemaining);
          setSkillsInventory({ ...stats.skills });
          setIsFastForward(stats.fastForward);
        }
      }

      animFrameIdRef.current = requestAnimationFrame(loop);
    };

    animFrameIdRef.current = requestAnimationFrame(loop);

    return () => {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
      lemmingsAudio.stopMusic();
    };
  }, [levelIndex]);

  // Sync CRT toggle
  useEffect(() => {
    if (rendererRef.current) {
      rendererRef.current.enableCRT = enableCRT;
    }
  }, [enableCRT]);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showHistoryModal || showLevelSelector || showHighScoresModal) return;

      const engine = engineRef.current;
      if (!engine) return;

      switch (e.key) {
        case '1':
          selectSkill('climber');
          break;
        case '2':
          selectSkill('floater');
          break;
        case '3':
          selectSkill('bomber');
          break;
        case '4':
          selectSkill('blocker');
          break;
        case '5':
          selectSkill('builder');
          break;
        case '6':
          selectSkill('basher');
          break;
        case '7':
          selectSkill('miner');
          break;
        case '8':
          selectSkill('digger');
          break;
        case 'p':
        case 'P':
        case ' ':
          e.preventDefault();
          togglePause();
          break;
        case 'f':
        case 'F':
          toggleFastForward();
          break;
        case 'n':
        case 'N':
          triggerNuke();
          break;
        case 'ArrowLeft':
          engine.stats.viewportX = Math.max(0, engine.stats.viewportX - 40);
          break;
        case 'ArrowRight':
          engine.stats.viewportX = Math.min(engine.currentLevel.width - 800, engine.stats.viewportX + 40);
          break;
        case '-':
        case '_':
          adjustReleaseRate(-5);
          break;
        case '=':
        case '+':
          adjustReleaseRate(5);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showHistoryModal, showLevelSelector, showHighScoresModal]);

  // Action handlers
  const selectSkill = (skill: LemmingSkill) => {
    setActiveSkill(skill);
    if (engineRef.current) {
      engineRef.current.setActiveSkill(skill);
    }
    haptics.selection();
  };

  const adjustReleaseRate = (delta: number) => {
    if (engineRef.current) {
      const newRate = Math.max(
        engineRef.current.currentLevel.releaseRate,
        Math.min(99, engineRef.current.stats.releaseRate + delta)
      );
      engineRef.current.setReleaseRate(newRate);
      setReleaseRate(newRate);
      haptics.selection();
    }
  };

  const togglePause = () => {
    if (engineRef.current) {
      engineRef.current.togglePause();
      setGameState(engineRef.current.stats.state);
      haptics.selection();
    }
  };

  const toggleFastForward = () => {
    if (engineRef.current) {
      engineRef.current.toggleFastForward();
      setIsFastForward(engineRef.current.stats.fastForward);
      haptics.selection();
    }
  };

  const triggerNuke = () => {
    if (engineRef.current) {
      engineRef.current.triggerNuke();
      haptics.heavy();
    }
  };

  const restartLevel = () => {
    if (engineRef.current) {
      engineRef.current.initLevel(engineRef.current.currentLevel);
      setGameState('PLAYING');
      setHasSubmittedScore(false);
      haptics.selection();
      if (isMusicOn && !isMuted) {
        lemmingsAudio.startMusic();
      }
    }
  };

  const switchLevel = (idx: number) => {
    setLevelIndex(idx);
    setShowLevelSelector(false);
    setHasSubmittedScore(false);
    haptics.success();
  };

  // Mouse & Touch interactions on Canvas
  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    const engine = engineRef.current;
    if (!canvas || !engine) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const mouseCanvasX = (e.clientX - rect.left) * scaleX;
    const mouseCanvasY = (e.clientY - rect.top) * scaleY;

    // Viewport panning drag
    if (isDraggingRef.current) {
      const deltaX = (e.clientX - dragStartXRef.current) * scaleX;
      engine.stats.viewportX = Math.max(
        0,
        Math.min(engine.currentLevel.width - canvas.width, dragStartVpXRef.current - deltaX)
      );
      return;
    }

    // World coordinates
    const worldX = mouseCanvasX + engine.stats.viewportX;
    const worldY = mouseCanvasY;

    engine.cursorWorldX = worldX;
    engine.cursorWorldY = worldY;

    const targetLemming = engine.findLemmingAt(worldX, worldY);
    engine.hoveredLemmingId = targetLemming ? targetLemming.id : null;
  };

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    const engine = engineRef.current;
    if (!canvas || !engine) return;

    // Check right-click or middle-click for panning
    if (e.button === 2 || e.button === 1 || e.shiftKey) {
      isDraggingRef.current = true;
      dragStartXRef.current = e.clientX;
      dragStartVpXRef.current = engine.stats.viewportX;
      return;
    }

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const mouseCanvasX = (e.clientX - rect.left) * scaleX;
    const mouseCanvasY = (e.clientY - rect.top) * scaleY;

    // Check if clicked inside top-right minimap
    const miniW = 120;
    const miniH = 34;
    const miniX = canvas.width - miniW - 12;
    const miniY = 10;
    if (
      mouseCanvasX >= miniX &&
      mouseCanvasX <= miniX + miniW &&
      mouseCanvasY >= miniY &&
      mouseCanvasY <= miniY + miniH
    ) {
      const relX = (mouseCanvasX - miniX) / miniW;
      const targetWorldX = relX * engine.currentLevel.width;
      engine.stats.viewportX = Math.max(
        0,
        Math.min(engine.currentLevel.width - canvas.width, targetWorldX - canvas.width / 2)
      );
      haptics.selection();
      return;
    }

    const worldX = mouseCanvasX + engine.stats.viewportX;
    const worldY = mouseCanvasY;

    const target = engine.findLemmingAt(worldX, worldY);
    if (target && activeSkill) {
      const success = engine.assignSkill(target.id, activeSkill);
      if (success) {
        haptics.success();
      }
    }
  };

  const handleCanvasMouseUp = () => {
    isDraggingRef.current = false;
  };

  const handleSaveScore = (e: React.FormEvent) => {
    e.preventDefault();
    if (!initials.trim() || hasSubmittedScore) return;

    const currentLevel = LEMMINGS_LEVELS[levelIndex];
    const updated = saveLemmingsScore(
      initials,
      score,
      currentLevel.title,
      lemmingsIn,
      currentLevel.lemmingCount
    );

    setHighScores(updated);
    setHasSubmittedScore(true);
    haptics.success();
  };

  const currentLevel = LEMMINGS_LEVELS[levelIndex];
  const savedPercent = currentLevel.lemmingCount > 0 ? Math.round((lemmingsIn / currentLevel.lemmingCount) * 100) : 0;
  const targetPercent = currentLevel.toSave;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-950 p-2 sm:p-4 text-white select-none">
      
      {/* Cabinet Outer Frame */}
      <div className="relative w-full max-w-5xl bg-neutral-900 border-4 border-emerald-600/80 rounded-3xl shadow-[0_0_50px_rgba(16,185,129,0.3)] flex flex-col overflow-hidden">
        
        {/* 1. TOP MARQUEE (Psygnosis / DMA Design styling) */}
        <div className="relative bg-gradient-to-r from-emerald-950 via-neutral-900 to-cyan-950 p-3 sm:p-4 border-b-2 border-emerald-600/50 flex flex-wrap items-center justify-between gap-2 shadow-inner">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBackToLobby}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white text-xs font-mono font-bold transition-all cursor-pointer border border-neutral-700"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>LOBBY</span>
            </button>

            <div className="flex items-center gap-2">
              <span className="text-2xl filter drop-shadow-[0_0_8px_rgba(34,197,94,0.8)]">
                🐹
              </span>
              <div>
                <h1 className="text-base sm:text-xl font-black font-mono tracking-widest text-emerald-400 flex items-center gap-2">
                  <span>LEMMINGS</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-900/80 text-emerald-300 border border-emerald-700 font-bold">
                    C64 / AMIGA 1991
                  </span>
                </h1>
                <p className="text-[10px] font-mono text-cyan-300">
                  DMA Design • Psygnosis • 8-Bit Destructible Physics
                </p>
              </div>
            </div>
          </div>

          {/* Quick Header Tools */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowLevelSelector(true)}
              className="px-2.5 py-1.5 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-700 text-emerald-300 text-xs font-mono font-bold flex items-center gap-1 transition-all cursor-pointer"
            >
              <span>LEVEL {levelIndex + 1}:</span>
              <span className="text-white max-w-[120px] truncate">{currentLevel.title}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                const next = !isMuted;
                setIsMuted(next);
                lemmingsAudio.setMuted(next);
              }}
              className="p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-all cursor-pointer"
              title="Geluid Aan/Uit"
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            </button>

            <button
              type="button"
              onClick={() => {
                const next = !isMusicOn;
                setIsMusicOn(next);
                lemmingsAudio.setMusicEnabled(next);
              }}
              className="p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-all cursor-pointer"
              title="Chiptune Muziek Aan/Uit"
            >
              <Music className={`w-4 h-4 ${isMusicOn ? 'text-cyan-400' : 'text-neutral-500'}`} />
            </button>

            <button
              type="button"
              onClick={() => setEnableCRT(!enableCRT)}
              className="p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-all cursor-pointer"
              title="CRT Scanlines Filter"
            >
              <Tv className={`w-4 h-4 ${enableCRT ? 'text-amber-400' : 'text-neutral-500'}`} />
            </button>

            <button
              type="button"
              onClick={() => setShowHistoryModal(true)}
              className="p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-all cursor-pointer"
              title="Historisch Dossier"
            >
              <BookOpen className="w-4 h-4 text-purple-400" />
            </button>

            <button
              type="button"
              onClick={() => setShowHighScoresModal(true)}
              className="p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-all cursor-pointer"
              title="Top Records"
            >
              <Trophy className="w-4 h-4 text-yellow-400" />
            </button>
          </div>
        </div>

        {/* 2. STATS TICKER HUD */}
        <div className="bg-black border-b border-neutral-800 px-4 py-2 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-4">
            <span className="text-neutral-400">
              OUT: <strong className="text-cyan-400">{lemmingsOut}/{currentLevel.lemmingCount}</strong>
            </span>
            <span className="text-neutral-400">
              IN: <strong className="text-emerald-400">{lemmingsIn}</strong>
            </span>
            <span className="text-neutral-400">
              SAVED: <strong className={savedPercent >= targetPercent ? 'text-emerald-400' : 'text-amber-400'}>{savedPercent}%</strong> (REQ: {targetPercent}%)
            </span>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-neutral-400">
              TIME: <strong className="text-yellow-400">{Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}</strong>
            </span>
            <span className="text-neutral-400">
              SCORE: <strong className="text-white">{score.toLocaleString()}</strong>
            </span>
            <span className="text-neutral-400">
              RATE: <strong className="text-pink-400">{releaseRate}</strong>
            </span>
          </div>
        </div>

        {/* 3. MAIN GAMEPLAY CANVAS (with curved CRT shadow & horizontal pan) */}
        <div className="relative bg-black flex items-center justify-center overflow-hidden p-1 sm:p-3">
          <canvas
            ref={canvasRef}
            width={800}
            height={320}
            onMouseMove={handleCanvasMouseMove}
            onMouseDown={handleCanvasMouseDown}
            onMouseUp={handleCanvasMouseUp}
            onContextMenu={(e) => e.preventDefault()}
            className="w-full h-auto max-h-[58vh] object-contain rounded-xl border-2 border-neutral-800 shadow-[inset_0_0_20px_rgba(0,0,0,0.8)] cursor-crosshair"
          />

          {/* Viewport Pan Controls Arrows (Floating Overlays) */}
          <button
            type="button"
            onClick={() => {
              if (engineRef.current) {
                engineRef.current.stats.viewportX = Math.max(0, engineRef.current.stats.viewportX - 80);
              }
            }}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 hover:bg-black/90 border border-emerald-500/40 text-emerald-300 hover:scale-110 transition-all cursor-pointer backdrop-blur-sm shadow-lg"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            type="button"
            onClick={() => {
              if (engineRef.current) {
                engineRef.current.stats.viewportX = Math.min(
                  engineRef.current.currentLevel.width - 800,
                  engineRef.current.stats.viewportX + 80
                );
              }
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 hover:bg-black/90 border border-emerald-500/40 text-emerald-300 hover:scale-110 transition-all cursor-pointer backdrop-blur-sm shadow-lg"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Outcome Overlay (Win / Lose) */}
          {gameState === 'WON' && (
            <div className="absolute inset-0 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-fade-in">
              <span className="text-5xl mb-2 animate-bounce">🎉</span>
              <h2 className="text-2xl sm:text-3xl font-black font-mono text-emerald-400 mb-1">
                LEVEL COMPLETED!
              </h2>
              <p className="text-sm font-mono text-neutral-300 mb-4">
                You saved <strong className="text-emerald-400">{lemmingsIn}</strong> of <strong className="text-white">{currentLevel.lemmingCount}</strong> lemmings ({savedPercent}% vs {targetPercent}% required).
              </p>

              {/* High Score Submit Form */}
              {!hasSubmittedScore ? (
                <form onSubmit={handleSaveScore} className="mb-4 flex items-center gap-2">
                  <input
                    type="text"
                    maxLength={3}
                    placeholder="INITIALS"
                    value={initials}
                    onChange={(e) => setInitials(e.target.value.toUpperCase())}
                    className="px-3 py-2 rounded-lg bg-neutral-900 border border-emerald-500 text-center font-mono font-bold text-white text-sm uppercase w-28 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-black font-mono font-bold text-xs transition-all cursor-pointer"
                  >
                    SAVE SCORE
                  </button>
                </form>
              ) : (
                <div className="text-xs font-mono text-emerald-400 mb-4 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> Score saved to records!
                </div>
              )}

              <div className="flex gap-3">
                {levelIndex < LEMMINGS_LEVELS.length - 1 ? (
                  <button
                    type="button"
                    onClick={() => switchLevel(levelIndex + 1)}
                    className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-mono font-black text-sm shadow-lg hover:scale-105 transition-all cursor-pointer"
                  >
                    NEXT LEVEL →
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => switchLevel(0)}
                    className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-mono font-black text-sm shadow-lg hover:scale-105 transition-all cursor-pointer"
                  >
                    PLAY FROM START
                  </button>
                )}
                <button
                  type="button"
                  onClick={restartLevel}
                  className="px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-mono text-sm transition-all cursor-pointer"
                >
                  REPLAY LEVEL
                </button>
              </div>
            </div>
          )}

          {gameState === 'LOST' && (
            <div className="absolute inset-0 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-fade-in">
              <span className="text-5xl mb-2">💥</span>
              <h2 className="text-2xl sm:text-3xl font-black font-mono text-red-500 mb-1">
                OH NO! LEVEL FAILED
              </h2>
              <p className="text-sm font-mono text-neutral-300 mb-4">
                You saved <strong className="text-red-400">{savedPercent}%</strong>, but needed <strong className="text-yellow-400">{targetPercent}%</strong>.
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={restartLevel}
                  className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-mono font-black text-sm shadow-lg hover:scale-105 transition-all cursor-pointer"
                >
                  TRY AGAIN
                </button>
                <button
                  type="button"
                  onClick={() => setShowLevelSelector(true)}
                  className="px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-mono text-sm transition-all cursor-pointer"
                >
                  CHOOSE LEVEL
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 4. ICONIC BOTTOM CONTROL PANEL & SKILL SELECTOR BAR */}
        <div className="bg-neutral-950 p-3 sm:p-4 border-t-2 border-neutral-800 flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            
            {/* Release Rate Controls */}
            <div className="flex items-center gap-1 bg-neutral-900 border border-neutral-800 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => adjustReleaseRate(-5)}
                className="w-8 h-8 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white font-mono font-bold text-sm flex items-center justify-center cursor-pointer transition-all active:scale-95"
                title="Release Rate Verlagen (-)"
              >
                -
              </button>
              <div className="px-2 text-center min-w-[50px]">
                <span className="text-[9px] font-mono text-neutral-500 block leading-tight">RATE</span>
                <span className="text-xs font-mono font-bold text-pink-400">{releaseRate}</span>
              </div>
              <button
                type="button"
                onClick={() => adjustReleaseRate(5)}
                className="w-8 h-8 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white font-mono font-bold text-sm flex items-center justify-center cursor-pointer transition-all active:scale-95"
                title="Release Rate Verhogen (+)"
              >
                +
              </button>
            </div>

            {/* 8 Classic Skill Buttons */}
            <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto pb-1">
              {(
                [
                  { id: 'climber', label: 'CLIMBER', icon: '🧗', count: skillsInventory.climber, color: 'border-green-500 text-green-400', key: '1' },
                  { id: 'floater', label: 'FLOATER', icon: '🪂', count: skillsInventory.floater, color: 'border-cyan-500 text-cyan-400', key: '2' },
                  { id: 'bomber', label: 'BOMBER', icon: '💣', count: skillsInventory.bomber, color: 'border-red-500 text-red-400', key: '3' },
                  { id: 'blocker', label: 'BLOCKER', icon: '🛑', count: skillsInventory.blocker, color: 'border-rose-500 text-rose-400', key: '4' },
                  { id: 'builder', label: 'BUILDER', icon: '🧱', count: skillsInventory.builder, color: 'border-amber-500 text-amber-400', key: '5' },
                  { id: 'basher', label: 'BASHER', icon: '⛏️', count: skillsInventory.basher, color: 'border-purple-500 text-purple-400', key: '6' },
                  { id: 'miner', label: 'MINER', icon: '⛏️', count: skillsInventory.miner, color: 'border-blue-500 text-blue-400', key: '7' },
                  { id: 'digger', label: 'DIGGER', icon: '🔨', count: skillsInventory.digger, color: 'border-pink-500 text-pink-400', key: '8' },
                ] as const
              ).map((skill) => {
                const isSelected = activeSkill === skill.id;
                return (
                  <button
                    key={skill.id}
                    type="button"
                    onClick={() => selectSkill(skill.id)}
                    className={`relative flex flex-col items-center justify-center p-1.5 sm:p-2 rounded-xl border-2 transition-all cursor-pointer min-w-[50px] sm:min-w-[60px] ${
                      isSelected
                        ? 'bg-neutral-800 border-white shadow-[0_0_15px_rgba(255,255,255,0.4)] scale-105'
                        : 'bg-neutral-900/90 border-neutral-800 hover:border-neutral-700 opacity-90'
                    }`}
                  >
                    <span className="text-base sm:text-lg">{skill.icon}</span>
                    <span className="text-[8px] sm:text-[9px] font-mono font-bold text-neutral-300 mt-0.5 line-clamp-1">
                      {skill.label}
                    </span>
                    <span
                      className={`text-[10px] sm:text-xs font-mono font-black mt-0.5 ${
                        skill.count > 0 ? 'text-white' : 'text-neutral-600'
                      }`}
                    >
                      {skill.count}
                    </span>
                    <span className="absolute top-0.5 right-1 text-[8px] font-mono text-neutral-500">
                      {skill.key}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Flow Controls: Pause, Fast-Forward, Nuke, Restart */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={togglePause}
                className={`p-2 sm:p-2.5 rounded-xl border transition-all cursor-pointer ${
                  gameState === 'PAUSED'
                    ? 'bg-yellow-500 text-black border-yellow-300 shadow-[0_0_10px_rgba(234,179,8,0.5)]'
                    : 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:text-white hover:bg-neutral-800'
                }`}
                title="Pauze (P / Space)"
              >
                {gameState === 'PAUSED' ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
              </button>

              <button
                type="button"
                onClick={toggleFastForward}
                className={`p-2 sm:p-2.5 rounded-xl border transition-all cursor-pointer ${
                  isFastForward
                    ? 'bg-cyan-500 text-black border-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.5)]'
                    : 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:text-white hover:bg-neutral-800'
                }`}
                title="Fast Forward (F)"
              >
                <FastForward className="w-5 h-5" />
              </button>

              <button
                type="button"
                onClick={triggerNuke}
                className="p-2 sm:p-2.5 rounded-xl bg-red-950/80 hover:bg-red-900 border border-red-700 text-red-400 hover:text-red-200 transition-all cursor-pointer active:scale-95 shadow-[0_0_10px_rgba(239,68,68,0.3)]"
                title="Armageddon Nuke (N) - Laat alle Lemmings ontploffen!"
              >
                <span className="text-lg">☢️</span>
              </button>

              <button
                type="button"
                onClick={restartLevel}
                className="p-2 sm:p-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 hover:text-white transition-all cursor-pointer"
                title="Level Herstarten"
              >
                <RotateCcw className="w-5 h-5" />
              </button>
            </div>

          </div>

          {/* Quick instructions strip */}
          <div className="flex items-center justify-between text-[10px] font-mono text-neutral-500 px-1">
            <span>🖱️ Klik op een lemming om gekozen vaardigheid toe te passen • Sleep met rechtermuisknop om rond te kijken</span>
            <span>Sneltoetsen: 1-8 Vaardigheden | F Snel | P Pauze | N Nuke</span>
          </div>
        </div>

      </div>

      {/* MODALS */}
      {/* 1. Level Selector Modal */}
      {showLevelSelector && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-2xl bg-neutral-900 border-2 border-emerald-500 rounded-2xl shadow-2xl p-4 sm:p-6 text-white">
            <h3 className="text-lg sm:text-xl font-black font-mono text-emerald-400 mb-4 flex items-center justify-between">
              <span>KIES EEN LEMMINGS LEVEL</span>
              <button
                type="button"
                onClick={() => setShowLevelSelector(false)}
                className="text-neutral-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto">
              {LEMMINGS_LEVELS.map((lvl, i) => {
                const isCurrent = i === levelIndex;
                return (
                  <button
                    key={lvl.id}
                    type="button"
                    onClick={() => switchLevel(i)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      isCurrent
                        ? 'bg-emerald-950/80 border-emerald-400 shadow-md ring-2 ring-emerald-500/50'
                        : 'bg-neutral-950 border-neutral-800 hover:border-neutral-700 hover:bg-neutral-800'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-neutral-800 text-emerald-300">
                          LEVEL {i + 1} • {lvl.category.toUpperCase()}
                        </span>
                        <span className="text-[10px] font-mono text-neutral-400">
                          {lvl.lemmingCount} lemmings
                        </span>
                      </div>
                      <h4 className="font-bold text-sm font-mono text-white mb-1">
                        {lvl.title}
                      </h4>
                      <p className="text-xs text-neutral-400 line-clamp-2">
                        {lvl.subtitle}
                      </p>
                    </div>

                    <div className="mt-2 pt-2 border-t border-neutral-800/80 flex items-center justify-between text-[10px] font-mono text-neutral-500">
                      <span>Red: {lvl.toSave}%</span>
                      <span>Tijd: {Math.floor(lvl.timeLimit / 60)}m</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 2. History Dossier Modal */}
      <LemmingsHistoryModal
        isOpen={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
        onPlay={() => setShowHistoryModal(false)}
      />

      {/* 3. High Scores Modal */}
      {showHighScoresModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-lg bg-neutral-900 border-2 border-yellow-500 rounded-2xl shadow-2xl p-5 text-white">
            <h3 className="text-xl font-black font-mono text-yellow-400 mb-4 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Trophy className="w-5 h-5" /> LEMMINGS RECORDS
              </span>
              <button
                type="button"
                onClick={() => setShowHighScoresModal(false)}
                className="text-neutral-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </h3>

            <div className="space-y-2 max-h-[50vh] overflow-y-auto">
              {highScores.map((s, idx) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-neutral-950 border border-neutral-800 text-xs font-mono"
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-5 font-bold ${idx === 0 ? 'text-yellow-400' : 'text-neutral-500'}`}>
                      #{idx + 1}
                    </span>
                    <span className="font-black text-white px-2 py-0.5 rounded bg-neutral-800">
                      {s.initials}
                    </span>
                    <span className="text-neutral-300 truncate max-w-[150px]">
                      {s.levelTitle}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-emerald-400">{s.savedPercent}% saved</span>
                    <span className="font-bold text-yellow-300">{s.score.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 4. Game Controls Guide Modal */}
      <GameControlsModal
        isOpen={showControls}
        onClose={() => setShowControls(false)}
        game="lemmings"
      />
    </div>
  );
};
