/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Undo2, 
  Lightbulb, 
  Clock, 
  Eye, 
  EyeOff, 
  ShieldAlert, 
  Trophy, 
  Sparkles, 
  Anchor, 
  Waves, 
  BookOpen, 
  Eraser, 
  CheckCircle2 
} from 'lucide-react';
import { BattleshipEngine, BattleshipDifficulty, BattleshipCellState } from '../game/battleshipEngine';
import { saveBattleshipScore } from '../game/battleshipHighScores';
import { BattleshipLeaderboardModal } from './BattleshipLeaderboardModal';
import { ClassicBattleshipView } from './ClassicBattleshipView';
import { gamepadManager } from '../utils/gamepadManager';

interface BattleshipCabinetProps {
  onBackToLobby: () => void;
  onOpenHistory?: () => void;
}

export const BattleshipCabinet: React.FC<BattleshipCabinetProps> = ({ onBackToLobby, onOpenHistory }) => {
  // Game Mode: 'classic_graph_paper' (Sink the Boat on Graph Paper) or 'solitaire_bimaru' (Bimaru Logic Puzzle)
  const [gameMode, setGameMode] = useState<'classic_graph_paper' | 'solitaire_bimaru'>('classic_graph_paper');

  const [engine] = useState<BattleshipEngine>(() => new BattleshipEngine('easy'));
  const [, setTick] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [selectedDifficulty, setSelectedDifficulty] = useState<BattleshipDifficulty>('easy');
  const [isTimerVisible, setIsTimerVisible] = useState(true);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const [highlightScoreId, setHighlightScoreId] = useState<string | undefined>(undefined);

  // Selected tool mode for quick clicking: 'cycle' (click rotates empty->water->ship), 'water', or 'ship'
  const [brushMode, setBrushMode] = useState<'cycle' | 'water' | 'ship'>('cycle');

  // Victory score saving
  const [playerInitials, setPlayerInitials] = useState('ADM');
  const [hasSavedScore, setHasSavedScore] = useState(false);
  const [savedRank, setSavedRank] = useState<number | null>(null);

  // Grid cursor navigation for keyboard/gamepad
  const [cursorPos, setCursorPos] = useState({ r: 0, c: 0 });

  const rerender = () => setTick(t => t + 1);

  // 1-second interval for stopwatch
  useEffect(() => {
    const timer = setInterval(() => {
      engine.updateTimer();
      rerender();
    }, 1000);
    return () => clearInterval(timer);
  }, [engine]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing initials in input
      if (document.activeElement?.tagName === 'INPUT') return;

      const size = engine.gridSize;

      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          e.preventDefault();
          setCursorPos(p => ({ ...p, r: Math.max(0, p.r - 1) }));
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          e.preventDefault();
          setCursorPos(p => ({ ...p, r: Math.min(size - 1, p.r + 1) }));
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          e.preventDefault();
          setCursorPos(p => ({ ...p, c: Math.max(0, p.c - 1) }));
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          e.preventDefault();
          setCursorPos(p => ({ ...p, c: Math.min(size - 1, p.c + 1) }));
          break;
        case ' ':
        case 'Enter':
          e.preventDefault();
          engine.cycleCellState(cursorPos.r, cursorPos.c);
          rerender();
          break;
        case '1':
        case 'z':
        case 'Z':
          // Set to water
          e.preventDefault();
          engine.setCellState(cursorPos.r, cursorPos.c, 'water');
          rerender();
          break;
        case '2':
        case 'x':
        case 'X':
          // Set to ship
          e.preventDefault();
          engine.setCellState(cursorPos.r, cursorPos.c, 'ship');
          rerender();
          break;
        case 'Backspace':
        case 'Delete':
        case '0':
          // Clear
          e.preventDefault();
          engine.setCellState(cursorPos.r, cursorPos.c, 'unknown');
          rerender();
          break;
        case 'u':
        case 'U':
          e.preventDefault();
          engine.undo();
          rerender();
          break;
        case 'h':
        case 'H':
          e.preventDefault();
          engine.requestHint();
          rerender();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [engine, cursorPos]);

  // Gamepad polling loop for console/controller navigation
  const lastDpadTimeRef = useRef(0);
  const lastButtonActionRef = useRef<Record<string, number>>({});
  useEffect(() => {
    let animId: number;
    const pollGamepad = () => {
      const snapshot = gamepadManager.getSnapshot();
      if (snapshot.connected && !engine.isCompleted) {
        const now = Date.now();
        const size = engine.gridSize;

        // D-pad / Thumbstick navigation
        if (now - lastDpadTimeRef.current > 180) {
          let r = cursorPos.r;
          let c = cursorPos.c;
          let moved = false;

          if (snapshot.buttons.has('DpadUp') || snapshot.leftStick.y < -0.5) {
            r = Math.max(0, r - 1);
            moved = true;
          } else if (snapshot.buttons.has('DpadDown') || snapshot.leftStick.y > 0.5) {
            r = Math.min(size - 1, r + 1);
            moved = true;
          } else if (snapshot.buttons.has('DpadLeft') || snapshot.leftStick.x < -0.5) {
            c = Math.max(0, c - 1);
            moved = true;
          } else if (snapshot.buttons.has('DpadRight') || snapshot.leftStick.x > 0.5) {
            c = Math.min(size - 1, c + 1);
            moved = true;
          }

          if (moved) {
            setCursorPos({ r, c });
            lastDpadTimeRef.current = now;
            rerender();
          }
        }

        // Action buttons with debouncing (300ms)
        const canTrigger = (btn: string) => {
          const last = lastButtonActionRef.current[btn] || 0;
          if (now - last > 300) {
            lastButtonActionRef.current[btn] = now;
            return true;
          }
          return false;
        };

        // A (South): Cycle cell state
        if (snapshot.buttons.has('A') && canTrigger('A')) {
          engine.cycleCellState(cursorPos.r, cursorPos.c);
          rerender();
        }

        // B (East): Clear cell state
        if (snapshot.buttons.has('B') && canTrigger('B')) {
          engine.setCellState(cursorPos.r, cursorPos.c, 'unknown');
          rerender();
        }

        // X (West): Direct water
        if (snapshot.buttons.has('X') && canTrigger('X')) {
          engine.setCellState(cursorPos.r, cursorPos.c, 'water');
          rerender();
        }

        // Y (North): Direct ship
        if (snapshot.buttons.has('Y') && canTrigger('Y')) {
          engine.setCellState(cursorPos.r, cursorPos.c, 'ship');
          rerender();
        }

        // LB: Undo
        if (snapshot.buttons.has('LB') && canTrigger('LB')) {
          engine.undo();
          rerender();
        }

        // RB: Hint
        if (snapshot.buttons.has('RB') && canTrigger('RB')) {
          engine.requestHint();
          rerender();
        }
      }
      animId = requestAnimationFrame(pollGamepad);
    };

    animId = requestAnimationFrame(pollGamepad);
    return () => cancelAnimationFrame(animId);
  }, [engine, cursorPos]);

  const handleCellClick = (r: number, c: number) => {
    setCursorPos({ r, c });
    if (brushMode === 'cycle') {
      engine.cycleCellState(r, c);
    } else {
      const cell = engine.grid[r][c];
      if (cell.userState === brushMode) {
        engine.setCellState(r, c, 'unknown');
      } else {
        engine.setCellState(r, c, brushMode);
      }
    }
    rerender();
  };

  const handleNewGame = (diff: BattleshipDifficulty) => {
    setSelectedDifficulty(diff);
    engine.newGame(diff);
    setHasSavedScore(false);
    setSavedRank(null);
    setCursorPos({ r: 0, c: 0 });
    rerender();
  };

  const handleSaveScore = () => {
    if (hasSavedScore) return;
    const scoreData = engine.calculateScore();
    const result = saveBattleshipScore({
      initials: playerInitials || 'ADM',
      score: scoreData.finalScore,
      timeSeconds: engine.timerSeconds,
      difficulty: selectedDifficulty,
      mistakes: engine.mistakes,
      hintsUsed: engine.hintsUsed,
      corrections: engine.corrections
    });
    setHasSavedScore(true);
    setSavedRank(result.rank);
    setHighlightScoreId(result.entry.id);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const size = engine.gridSize;

  if (gameMode === 'classic_graph_paper') {
    return (
      <div className="relative min-h-screen w-full flex flex-col items-center justify-start p-2 sm:p-4 select-none bg-[#09111e] overflow-x-hidden font-sans">
        {/* Top Header Navigation */}
        <header className="relative z-10 w-full max-w-6xl flex items-center justify-between px-3 py-2 bg-slate-900/90 border border-cyan-800/50 rounded-2xl shadow-lg backdrop-blur-md mb-2">
          <div className="flex items-center gap-2">
            <button
              onClick={onBackToLobby}
              className="p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-700/40 transition-all active:scale-95 flex items-center gap-1.5 text-xs font-mono cursor-pointer shadow-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline font-bold">Arcade Lobby</span>
            </button>

            <div className="flex items-center gap-2">
              <span className="text-xl">🚢</span>
              <div className="flex flex-col">
                <h1 className="text-xs sm:text-sm font-black tracking-wide text-white font-serif flex items-center gap-1.5">
                  <span>ZEESLAG (SINK THE BOAT)</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-950 text-amber-300 border border-amber-800">
                    RUITJESPAPIER
                  </span>
                </h1>
                <p className="text-[9px] sm:text-[10px] text-slate-400 font-mono hidden sm:block">
                  Papier & Potlood Vlootgevecht op Collegeblok Ruitjespapier
                </p>
              </div>
            </div>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 font-mono text-xs">
              <button
                onClick={() => setGameMode('classic_graph_paper')}
                className="px-2.5 py-1 rounded-lg bg-amber-500 text-slate-950 font-bold transition-all cursor-pointer shadow"
              >
                ✏️ Klassiek Ruitjespapier
              </button>
              <button
                onClick={() => setGameMode('solitaire_bimaru')}
                className="px-2.5 py-1 rounded-lg text-slate-400 hover:text-white transition-all cursor-pointer"
              >
                🧩 Solitaire Bimaru
              </button>
            </div>

            {onOpenHistory && (
              <button
                onClick={onOpenHistory}
                title="Historisch Dossier"
                className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all active:scale-95 flex items-center gap-1.5 text-xs font-mono cursor-pointer shadow-sm"
              >
                <BookOpen className="w-4 h-4 text-cyan-400" />
                <span className="hidden sm:inline">Dossier</span>
              </button>
            )}
          </div>
        </header>

        {/* Main Classic Battleship View */}
        <ClassicBattleshipView
          onBackToLobby={onBackToLobby}
          onSwitchToBimaru={() => setGameMode('solitaire_bimaru')}
        />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-between p-2 sm:p-4 select-none bg-[#09111e] overflow-x-hidden font-sans">
      
      {/* Nautical Naval Chart Backdrop */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: `
            radial-gradient(circle at 50% 50%, rgba(6,182,212,0.15) 0%, transparent 70%),
            linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)
          `,
          backgroundSize: '100% 100%, 30px 30px, 30px 30px'
        }}
      />

      {/* Top Navigation Bar */}
      <header className="relative z-10 w-full max-w-4xl flex items-center justify-between px-3 py-2 bg-slate-900/90 border border-cyan-800/50 rounded-2xl shadow-lg backdrop-blur-md">
        <div className="flex items-center gap-2">
          <button
            onClick={onBackToLobby}
            className="p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-700/40 transition-all active:scale-95 flex items-center gap-1.5 text-xs font-mono cursor-pointer shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline font-bold">Arcade Lobby</span>
          </button>

          <div className="flex items-center gap-1.5">
            <span className="text-xl">🚢</span>
            <div>
              <h1 className="text-xs sm:text-sm font-black tracking-wide text-white font-serif flex items-center gap-1.5">
                <span>ZEESLAG SOLITAIRE</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
                  BIMARU
                </span>
              </h1>
              <p className="text-[9px] sm:text-[10px] text-slate-400 font-mono hidden sm:block">
                Bimaru & Batalha Naval • Logische Vlootdeductie
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Mode Switcher */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 font-mono text-xs">
            <button
              onClick={() => setGameMode('classic_graph_paper')}
              className="px-2.5 py-1 rounded-lg text-slate-400 hover:text-white transition-all cursor-pointer"
            >
              ✏️ Ruitjespapier
            </button>
            <button
              onClick={() => setGameMode('solitaire_bimaru')}
              className="px-2.5 py-1 rounded-lg bg-cyan-600 text-slate-950 font-bold transition-all cursor-pointer shadow"
            >
              🧩 Solitaire Bimaru
            </button>
          </div>

          <button
            onClick={() => setIsLeaderboardOpen(true)}
            title="Zeeslag Erelijst & Top Scores"
            className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-cyan-950/70 hover:bg-cyan-900/90 text-cyan-200 border border-cyan-600/40 transition-all active:scale-95 flex items-center gap-1.5 text-xs font-mono cursor-pointer shadow-sm"
          >
            <Trophy className="w-4 h-4 text-yellow-400" />
            <span className="hidden sm:inline font-bold">Top Scores</span>
          </button>

          {onOpenHistory && (
            <button
              onClick={onOpenHistory}
              title="Historisch Dossier (1982)"
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all active:scale-95 flex items-center gap-1.5 text-xs font-mono cursor-pointer shadow-sm"
            >
              <BookOpen className="w-4 h-4 text-cyan-400" />
              <span className="hidden sm:inline">Dossier</span>
            </button>
          )}

          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-1.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white transition-all active:scale-95 border border-slate-700 cursor-pointer"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Main Newspaper / Naval Desk View */}
      <main className="relative z-10 w-full max-w-4xl flex flex-col items-center my-2 sm:my-3">
        
        {/* Vintage Naval Map Board Frame */}
        <div className="w-full max-w-xl bg-[#0f1d30] border-4 border-cyan-900/80 rounded-3xl p-3 sm:p-5 shadow-[0_15px_50px_rgba(0,0,0,0.8),0_0_40px_rgba(6,182,212,0.15)] flex flex-col items-center relative">
          
          {/* Masthead Banner */}
          <div className="w-full flex items-center justify-between border-b-2 border-cyan-800/60 pb-2 mb-3">
            <div className="flex items-center gap-1.5">
              <Anchor className="w-4 h-4 text-cyan-400" />
              <span className="font-bold tracking-widest text-cyan-200 text-xs sm:text-sm uppercase font-serif">
                ADMIRALITEIT LOGBOEK • BIMARU
              </span>
            </div>

            {/* Optional Timer & Points Badge */}
            <div className="flex items-center gap-2 font-mono text-xs font-bold text-cyan-300">
              <button
                type="button"
                onClick={() => setIsTimerVisible(!isTimerVisible)}
                title={isTimerVisible ? 'Verberg Timer' : 'Toon Timer'}
                className="flex items-center gap-1 hover:text-cyan-100 px-1.5 py-0.5 rounded transition-colors cursor-pointer bg-slate-900/80 border border-cyan-800/40"
              >
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                <span>{isTimerVisible ? formatTime(engine.timerSeconds) : '••:••'}</span>
                {isTimerVisible ? (
                  <Eye className="w-3 h-3 text-slate-400" />
                ) : (
                  <EyeOff className="w-3 h-3 text-slate-400" />
                )}
              </button>

              <div 
                title="Lopende Score (snelheid, hints en correcties beïnvloeden dit)"
                className="hidden sm:flex items-center gap-1 text-[10px] bg-cyan-950/70 border border-cyan-600/50 px-2 py-0.5 rounded text-cyan-300 font-bold"
              >
                <span>PTS:</span>
                <span>{engine.calculateScore().finalScore.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Difficulty Selection Pills */}
          <div className="flex items-center justify-center gap-1.5 sm:gap-2 mb-3 w-full">
            {(['easy', 'medium', 'hard'] as BattleshipDifficulty[]).map((diff) => (
              <button
                key={diff}
                onClick={() => handleNewGame(diff)}
                className={`px-3 py-1 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                  selectedDifficulty === diff
                    ? 'bg-cyan-600 text-slate-950 shadow-md scale-105'
                    : 'bg-slate-900/90 text-slate-400 hover:text-white border border-slate-700/60'
                }`}
              >
                {diff === 'easy' ? 'Makkelijk (8×8)' : diff === 'medium' ? 'Gemiddeld (8×8)' : 'Expert (10×10)'}
              </button>
            ))}
          </div>

          {/* Interactive Naval Grid with Row & Column Clues */}
          <div className="relative flex flex-col items-center bg-[#071322] p-2 sm:p-3 rounded-2xl border-2 border-cyan-800/60 shadow-inner">
            
            {/* Top Column Clue Numbers */}
            <div className="flex items-center pl-7 sm:pl-9 mb-1">
              {engine.colCounts.map((count, c) => {
                const currentShipsInCol = engine.grid.reduce((acc, row) => acc + (row[c]?.userState === 'ship' ? 1 : 0), 0);
                const isSatisfied = currentShipsInCol === count;
                const isOver = currentShipsInCol > count;

                return (
                  <button
                    key={`col-count-${c}`}
                    onClick={() => {
                      engine.autoFillWaterForCol(c);
                      rerender();
                    }}
                    title={`Kolom ${c + 1}: ${count} scheepsdelen nodig (klik om overige met water te vullen)`}
                    className={`w-7 sm:w-10 text-center font-mono font-black text-xs sm:text-sm py-0.5 rounded transition-all cursor-pointer ${
                      isOver 
                        ? 'text-red-400 bg-red-950/60 border border-red-700' 
                        : isSatisfied 
                        ? 'text-emerald-400 bg-emerald-950/40' 
                        : 'text-cyan-300 hover:bg-cyan-950/40'
                    }`}
                  >
                    {count}
                  </button>
                );
              })}
            </div>

            {/* Grid Rows */}
            <div className="flex flex-col gap-1">
              {engine.grid.map((row, r) => {
                const currentShipsInRow = row.filter(c => c.userState === 'ship').length;
                const requiredInRow = engine.rowCounts[r];
                const isRowSatisfied = currentShipsInRow === requiredInRow;
                const isRowOver = currentShipsInRow > requiredInRow;

                return (
                  <div key={`row-${r}`} className="flex items-center gap-1">
                    {/* Left Row Clue Number */}
                    <button
                      onClick={() => {
                        engine.autoFillWaterForRow(r);
                        rerender();
                      }}
                      title={`Rij ${r + 1}: ${requiredInRow} scheepsdelen nodig (klik om overige met water te vullen)`}
                      className={`w-6 sm:w-8 text-right pr-1 font-mono font-black text-xs sm:text-sm py-1 rounded transition-all cursor-pointer ${
                        isRowOver 
                          ? 'text-red-400 bg-red-950/60 border border-red-700' 
                          : isRowSatisfied 
                          ? 'text-emerald-400 bg-emerald-950/40' 
                          : 'text-cyan-300 hover:bg-cyan-950/40'
                      }`}
                    >
                      {requiredInRow}
                    </button>

                    {/* Cells */}
                    <div className="flex items-center gap-1">
                      {row.map((cell, c) => {
                        const isCursor = cursorPos.r === r && cursorPos.c === c;
                        const isWater = cell.userState === 'water';
                        const isShip = cell.userState === 'ship';
                        const isError = cell.isError;

                        return (
                          <div
                            key={`cell-${r}-${c}`}
                            onClick={() => handleCellClick(r, c)}
                            className={`w-7 h-7 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center transition-all cursor-pointer select-none text-base sm:text-xl font-bold relative ${
                              cell.isGiven
                                ? 'bg-slate-800/80 cursor-default'
                                : 'bg-[#0b1c31] hover:bg-[#122842]'
                            } ${
                              isError
                                ? 'ring-2 ring-red-500 bg-red-950/40'
                                : isCursor
                                ? 'ring-2 ring-cyan-400 ring-offset-1 ring-offset-slate-900'
                                : 'border border-cyan-900/50'
                            }`}
                          >
                            {/* Water state */}
                            {isWater && (
                              <div className="flex items-center justify-center text-cyan-400/80 scale-75 sm:scale-100">
                                <Waves className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400/70" />
                              </div>
                            )}

                            {/* Ship state */}
                            {isShip && (
                              <div className="w-5 h-5 sm:w-7 sm:h-7 rounded-md bg-gradient-to-br from-amber-400 via-amber-500 to-yellow-600 shadow-[0_2px_8px_rgba(245,158,11,0.5)] border border-amber-300 flex items-center justify-center text-[10px] text-slate-950 font-black">
                                ⚓
                              </div>
                            )}

                            {/* Starting clue indicator dot */}
                            {cell.isGiven && (
                              <div className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-cyan-400" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Victory Congratulation Overlay with Real-time Scoring & Receipt */}
            {engine.isCompleted && (() => {
              const scoreBreakdown = engine.calculateScore();
              return (
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-4 bg-slate-950/95 backdrop-blur-md rounded-2xl text-center text-white animate-fadeIn overflow-y-auto">
                  <div className="w-12 h-12 rounded-full bg-cyan-500/20 border-2 border-cyan-400 flex items-center justify-center text-2xl mb-2 shadow-[0_0_25px_rgba(6,182,212,0.5)]">
                    🏆
                  </div>
                  
                  <h2 className="text-xl sm:text-2xl font-serif font-black text-cyan-300">
                    VLOOT VOLLEDIG ONTDEKT!
                  </h2>
                  <p className="text-[11px] sm:text-xs text-slate-300 mt-0.5 font-serif">
                    Gefeliciteerd Admiraal! Alle vijandelijke schepen zijn gelokaliseerd.
                  </p>

                  {/* Grand Score Display */}
                  <div className="my-2 px-4 py-1.5 rounded-2xl bg-cyan-950/70 border border-cyan-500/40 shadow-inner">
                    <div className="text-[9px] uppercase font-mono tracking-widest text-cyan-400 font-bold">
                      EINDSCORE
                    </div>
                    <div className="text-2xl sm:text-3xl font-black font-mono text-white tracking-wider">
                      {scoreBreakdown.finalScore.toLocaleString()} <span className="text-xs text-cyan-400">PTS</span>
                    </div>
                  </div>

                  {/* Detailed Score Breakdown Receipt */}
                  <div className="w-full max-w-xs bg-slate-900/90 rounded-xl p-2 border border-slate-800 text-[11px] font-mono space-y-0.5 text-left mb-2.5">
                    <div className="flex justify-between text-slate-300">
                      <span>Basis ({selectedDifficulty.toUpperCase()}):</span>
                      <span className="text-cyan-300">+{scoreBreakdown.baseScore}</span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Snelheidsbonus ({formatTime(engine.timerSeconds)}):</span>
                      <span className={scoreBreakdown.timeBonus > 0 ? 'text-emerald-400' : 'text-slate-500'}>
                        +{scoreBreakdown.timeBonus}
                      </span>
                    </div>
                    {scoreBreakdown.hintPenalty > 0 && (
                      <div className="flex justify-between text-yellow-400">
                        <span>Hints ({engine.hintsUsed}× -800):</span>
                        <span>-{scoreBreakdown.hintPenalty}</span>
                      </div>
                    )}
                    {scoreBreakdown.mistakePenalty > 0 && (
                      <div className="flex justify-between text-red-400">
                        <span>Fouten ({engine.mistakes}× -400):</span>
                        <span>-{scoreBreakdown.mistakePenalty}</span>
                      </div>
                    )}
                    {scoreBreakdown.correctionPenalty > 0 && (
                      <div className="flex justify-between text-blue-400">
                        <span>Correcties ({engine.corrections}× -100):</span>
                        <span>-{scoreBreakdown.correctionPenalty}</span>
                      </div>
                    )}
                  </div>

                  {/* High Score Initials Submission */}
                  {!hasSavedScore ? (
                    <div className="flex items-center gap-2 mb-2.5">
                      <input
                        type="text"
                        maxLength={4}
                        value={playerInitials}
                        onChange={(e) => setPlayerInitials(e.target.value.toUpperCase())}
                        placeholder="INIT"
                        className="w-20 px-2 py-1.5 rounded-xl bg-slate-950 border border-cyan-500/60 text-center font-mono font-black text-cyan-300 text-sm tracking-widest focus:outline-none focus:border-cyan-400"
                      />
                      <button
                        onClick={handleSaveScore}
                        className="px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs transition-all shadow-md active:scale-95 cursor-pointer font-mono"
                      >
                        Score Opslaan
                      </button>
                    </div>
                  ) : (
                    <div className="mb-2 text-xs font-mono text-emerald-400 font-bold flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                      <span>Opgeslagen! {savedRank ? `Plaats #${savedRank} in de top` : ''}</span>
                    </div>
                  )}

                  {/* Action buttons */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsLeaderboardOpen(true)}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 font-bold text-xs transition-all border border-cyan-700/40 cursor-pointer flex items-center gap-1.5 font-mono"
                    >
                      <Trophy className="w-3.5 h-3.5 text-yellow-400" />
                      <span>Erelijst</span>
                    </button>
                    <button
                      onClick={() => handleNewGame(selectedDifficulty)}
                      className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs shadow-lg shadow-cyan-500/30 transition-all active:scale-95 cursor-pointer font-serif"
                    >
                      Volgende Zeeslag
                    </button>
                  </div>
                </div>
              );
            })()}

          </div>

          {/* Fleet Status Bar */}
          <div className="w-full mt-3 p-2.5 rounded-xl bg-[#071322] border border-cyan-900/60 flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-slate-300">
            <span className="font-bold text-cyan-300">Vlootstatus:</span>
            <div className="flex items-center gap-3">
              {/* Slagschip 4 */}
              <div className="flex items-center gap-1">
                <span className="text-[10px] text-slate-400">4:</span>
                <span className={engine.ships.find(s => s.size === 4)?.isSunk ? 'text-emerald-400 line-through' : 'text-amber-400'}>
                  1× [■■■■]
                </span>
              </div>
              {/* Kruiser 3 */}
              <div className="flex items-center gap-1">
                <span className="text-[10px] text-slate-400">3:</span>
                <span className="text-amber-400">
                  {engine.ships.filter(s => s.size === 3 && s.isSunk).length}/{engine.ships.filter(s => s.size === 3).length} [■■■]
                </span>
              </div>
              {/* Destroyer 2 */}
              <div className="flex items-center gap-1">
                <span className="text-[10px] text-slate-400">2:</span>
                <span className="text-amber-400">
                  {engine.ships.filter(s => s.size === 2 && s.isSunk).length}/{engine.ships.filter(s => s.size === 2).length} [■■]
                </span>
              </div>
              {/* Submarine 1 */}
              <div className="flex items-center gap-1">
                <span className="text-[10px] text-slate-400">1:</span>
                <span className="text-amber-400">
                  {engine.ships.filter(s => s.size === 1 && s.isSunk).length}/{engine.ships.filter(s => s.size === 1).length} [■]
                </span>
              </div>
            </div>
          </div>

          {/* Quick Brush Mode Selector & Toolstrip */}
          <div className="w-full mt-3 flex items-center justify-between gap-2 pt-2 border-t border-cyan-900/40">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-mono text-slate-400 hidden sm:inline">Penseel:</span>
              <button
                onClick={() => setBrushMode('cycle')}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                  brushMode === 'cycle'
                    ? 'bg-cyan-600 text-slate-950 font-black'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                🔄 Wisselen
              </button>
              <button
                onClick={() => setBrushMode('water')}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  brushMode === 'water'
                    ? 'bg-cyan-600 text-slate-950 font-black'
                    : 'bg-slate-800 text-cyan-300 hover:bg-slate-700'
                }`}
              >
                <Waves className="w-3.5 h-3.5" />
                <span>Water (Z)</span>
              </button>
              <button
                onClick={() => setBrushMode('ship')}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  brushMode === 'ship'
                    ? 'bg-amber-500 text-slate-950 font-black'
                    : 'bg-slate-800 text-amber-300 hover:bg-slate-700'
                }`}
              >
                <Anchor className="w-3.5 h-3.5" />
                <span>Schip (X)</span>
              </button>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => {
                  engine.undo();
                  rerender();
                }}
                title="Stap Ongedaan Maken (U / Ctrl+Z)"
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
              >
                <Undo2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  engine.requestHint();
                  rerender();
                }}
                title={`Hint Aanvragen (${engine.hintsRemaining} resterend, -800 pnt)`}
                className="px-2.5 py-1 rounded-lg bg-yellow-600/30 hover:bg-yellow-600/50 text-yellow-300 border border-yellow-500/40 text-xs font-mono font-bold flex items-center gap-1 cursor-pointer"
              >
                <Lightbulb className="w-3.5 h-3.5" />
                <span>Hint ({engine.hintsRemaining})</span>
              </button>
            </div>
          </div>

          {/* Hint Message Display */}
          {engine.lastHintMessage && (
            <div className="w-full mt-2 p-1.5 rounded-lg bg-cyan-950/60 border border-cyan-800/40 text-[11px] font-mono text-cyan-300 text-center animate-fadeIn">
              {engine.lastHintMessage}
            </div>
          )}

        </div>
      </main>

      {/* Footer Instructions */}
      <footer className="relative z-10 w-full max-w-4xl text-center text-[10px] text-slate-500 font-mono py-1">
        Retro Arcade Vault • Zeeslag Solitaire Clean-Room Reimplementation in TypeScript
      </footer>

      {/* Leaderboard Modal */}
      <BattleshipLeaderboardModal
        isOpen={isLeaderboardOpen}
        onClose={() => setIsLeaderboardOpen(false)}
        onPlayAgain={() => handleNewGame(selectedDifficulty)}
        highlightId={highlightScoreId}
      />

    </div>
  );
};
