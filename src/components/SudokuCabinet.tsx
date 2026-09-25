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
  Edit3, 
  Eraser, 
  Undo2, 
  Lightbulb, 
  Clock, 
  Eye,
  EyeOff,
  ShieldAlert, 
  Trophy, 
  Sparkles,
  Gamepad2,
  BookOpen
} from 'lucide-react';
import { SudokuEngine, SudokuDifficulty } from '../game/sudokuEngine';
import { saveSudokuScore } from '../game/sudokuHighScores';
import { SudokuLeaderboardModal } from './SudokuLeaderboardModal';
import { gamepadManager } from '../utils/gamepadManager';

interface SudokuCabinetProps {
  onBackToLobby: () => void;
  onOpenHistory?: () => void;
}

export const SudokuCabinet: React.FC<SudokuCabinetProps> = ({ onBackToLobby, onOpenHistory }) => {
  const [engine] = useState(() => new SudokuEngine('easy', true));
  const [, setTick] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [selectedDifficulty, setSelectedDifficulty] = useState<SudokuDifficulty>('easy');
  const [isZenMode, setIsZenMode] = useState(true);
  const [isTimerVisible, setIsTimerVisible] = useState(true);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const [highlightScoreId, setHighlightScoreId] = useState<string | undefined>(undefined);

  // Victory high-score entry state
  const [playerInitials, setPlayerInitials] = useState('YOU');
  const [hasSavedScore, setHasSavedScore] = useState(false);
  const [savedRank, setSavedRank] = useState<number | null>(null);

  // Force re-render helper
  const rerender = () => setTick(t => t + 1);

  // Synchronize audio mute state
  useEffect(() => {
    engine.setAudioMuted(isMuted);
  }, [isMuted, engine]);

  // Main 1-second timer tick
  useEffect(() => {
    const timer = setInterval(() => {
      if (engine.isTimerRunning && !engine.isCompleted) {
        engine.timerSeconds++;
        rerender();
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [engine]);

  // Keyboard navigation & number entry
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (engine.isCompleted) return;

      // Number keys 1-9
      if (e.key >= '1' && e.key <= '9') {
        const num = parseInt(e.key, 10);
        engine.setNumber(num);
        rerender();
        e.preventDefault();
        return;
      }

      // Erase / Backspace / Delete
      if (e.key === 'Backspace' || e.key === 'Delete' || e.key === '0') {
        engine.clearCell();
        rerender();
        e.preventDefault();
        return;
      }

      // Arrow keys navigation
      let r = engine.selectedRow ?? 0;
      let c = engine.selectedCol ?? 0;
      if (e.key === 'ArrowUp' || e.key === 'KeyW') {
        r = Math.max(0, r - 1);
        engine.selectCell(r, c);
        rerender();
        e.preventDefault();
      } else if (e.key === 'ArrowDown' || e.key === 'KeyS') {
        r = Math.min(8, r + 1);
        engine.selectCell(r, c);
        rerender();
        e.preventDefault();
      } else if (e.key === 'ArrowLeft' || e.key === 'KeyA') {
        c = Math.max(0, c - 1);
        engine.selectCell(r, c);
        rerender();
        e.preventDefault();
      } else if (e.key === 'ArrowRight' || e.key === 'KeyD') {
        c = Math.min(8, c + 1);
        engine.selectCell(r, c);
        rerender();
        e.preventDefault();
      }

      // Hotkeys: N for notes, H for hint, Z for undo
      if (e.key === 'n' || e.key === 'N') {
        engine.toggleNoteMode();
        rerender();
        e.preventDefault();
      } else if (e.key === 'h' || e.key === 'H') {
        engine.getHint();
        rerender();
        e.preventDefault();
      } else if ((e.ctrlKey || e.metaKey) && (e.key === 'z' || e.key === 'Z')) {
        engine.undo();
        rerender();
        e.preventDefault();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [engine]);

  // Gamepad polling loop for console/controller navigation
  const lastDpadTimeRef = useRef(0);
  useEffect(() => {
    let animId: number;
    const pollGamepad = () => {
      const snapshot = gamepadManager.getSnapshot();
      if (snapshot.connected && !engine.isCompleted) {
        const now = Date.now();
        if (now - lastDpadTimeRef.current > 180) {
          let r = engine.selectedRow ?? 0;
          let c = engine.selectedCol ?? 0;
          let moved = false;

          if (snapshot.buttons.has('DpadUp') || snapshot.leftStick.y < -0.5) {
            r = Math.max(0, r - 1);
            moved = true;
          } else if (snapshot.buttons.has('DpadDown') || snapshot.leftStick.y > 0.5) {
            r = Math.min(8, r + 1);
            moved = true;
          } else if (snapshot.buttons.has('DpadLeft') || snapshot.leftStick.x < -0.5) {
            c = Math.max(0, c - 1);
            moved = true;
          } else if (snapshot.buttons.has('DpadRight') || snapshot.leftStick.x > 0.5) {
            c = Math.min(8, c + 1);
            moved = true;
          }

          if (moved) {
            engine.selectCell(r, c);
            lastDpadTimeRef.current = now;
            rerender();
          }
        }

        // Action buttons: X = Toggle Notes, Y = Hint, B = Erase
        if (snapshot.buttons.has('X')) {
          engine.toggleNoteMode();
          rerender();
        } else if (snapshot.buttons.has('Y')) {
          engine.getHint();
          rerender();
        } else if (snapshot.buttons.has('B')) {
          engine.clearCell();
          rerender();
        }
      }
      animId = requestAnimationFrame(pollGamepad);
    };

    animId = requestAnimationFrame(pollGamepad);
    return () => cancelAnimationFrame(animId);
  }, [engine]);

  // Handlers
  const handleNewGame = (diff: SudokuDifficulty = selectedDifficulty) => {
    setSelectedDifficulty(diff);
    engine.isZenMode = isZenMode;
    engine.newGame(diff);
    setHasSavedScore(false);
    setSavedRank(null);
    rerender();
  };

  const handleSaveScore = () => {
    if (hasSavedScore) return;
    const scoreData = engine.calculateScore();
    const result = saveSudokuScore({
      initials: playerInitials || 'YOU',
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

  const handleCellClick = (r: number, c: number) => {
    engine.selectCell(r, c);
    rerender();
  };

  const handleNumberInput = (num: number) => {
    engine.setNumber(num);
    rerender();
  };

  const handleErase = () => {
    engine.clearCell();
    rerender();
  };

  const handleUndo = () => {
    engine.undo();
    rerender();
  };

  const handleHint = () => {
    engine.getHint();
    rerender();
  };

  const handleToggleNotes = () => {
    engine.toggleNoteMode();
    rerender();
  };

  const handleToggleZenMode = () => {
    const nextMode = !isZenMode;
    setIsZenMode(nextMode);
    engine.isZenMode = nextMode;
    rerender();
  };

  // Format seconds into MM:SS
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Count remaining numbers on board
  const numberCounts = engine.getNumberCounts();
  const selectedCell = (engine.selectedRow !== null && engine.selectedCol !== null) 
    ? engine.grid[engine.selectedRow][engine.selectedCol] 
    : null;
  const selectedValue = selectedCell?.value ?? 0;

  return (
    <div className="relative min-h-screen w-full bg-stone-950 text-stone-100 flex flex-col items-center justify-between p-2 sm:p-4 select-none">
      
      {/* Background: Cozy warm mahogany desk atmosphere */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-40 bg-[radial-gradient(circle_at_50%_30%,rgba(217,119,6,0.15),transparent_75%)]"
      />

      {/* Top Header Navigation */}
      <header className="relative z-10 w-full max-w-4xl flex items-center justify-between px-3 py-2 mb-2 bg-stone-900/90 backdrop-blur border border-amber-900/40 rounded-2xl shadow-xl">
        <button
          onClick={onBackToLobby}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-950/60 hover:bg-amber-900/80 text-amber-200 border border-amber-700/40 text-xs sm:text-sm font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Speelhal</span>
        </button>

        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber-700/30 border border-amber-500/40 flex items-center justify-center text-sm shadow-inner">
            🔢
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-black tracking-wider text-amber-300 font-serif">
              SUDOKU
            </h1>
            <p className="text-[10px] text-stone-400 font-mono hidden sm:block">
              Howard Garns (1979) • Nikoli (1984)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={() => setIsLeaderboardOpen(true)}
            title="Sudoku Scorebord & Erelijst"
            className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-amber-950/70 hover:bg-amber-900/90 text-amber-200 border border-amber-600/40 transition-all active:scale-95 flex items-center gap-1.5 text-xs font-mono cursor-pointer shadow-sm"
          >
            <Trophy className="w-4 h-4 text-yellow-400" />
            <span className="hidden sm:inline font-bold">Top Scores</span>
          </button>

          {onOpenHistory && (
            <button
              onClick={onOpenHistory}
              title="Historisch Dossier & Oorsprong"
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white border border-stone-700 transition-all active:scale-95 flex items-center gap-1 text-xs font-mono cursor-pointer"
            >
              <BookOpen className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">Geschiedenis</span>
            </button>
          )}

          <button
            onClick={() => handleNewGame(selectedDifficulty)}
            title="Nieuwe Puzzel Genereren"
            className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white border border-stone-700 transition-all active:scale-95 flex items-center gap-1 text-xs font-mono cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="hidden sm:inline">Nieuw</span>
          </button>

          <button
            onClick={() => setIsMuted(!isMuted)}
            title={isMuted ? 'Geluid Aanzetten' : 'Geluid Dempen'}
            className="p-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white border border-stone-700 transition-all active:scale-95 cursor-pointer"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>
        </div>
      </header>

      {/* Main Newspaper / Wooden Table Layout */}
      <div className="relative z-10 w-full max-w-4xl flex flex-col lg:flex-row items-center justify-center gap-4 sm:gap-6 my-auto">
        
        {/* The Classic Newsprint Paper Board */}
        <div className="relative flex flex-col items-center bg-[#faf6ee] text-stone-900 border-8 border-[#3b2416] rounded-3xl p-3 sm:p-5 shadow-[0_20px_50px_rgba(0,0,0,0.8),inset_0_0_15px_rgba(180,83,9,0.15)] max-w-[480px] w-full">
          
          {/* Newspaper Masthead Header */}
          <div className="w-full flex items-center justify-between pb-2 mb-2 border-b-2 border-stone-900/40 text-[11px] sm:text-xs font-serif">
            <div className="flex items-center gap-2">
              <span className="font-bold tracking-widest text-stone-800 uppercase">THE DAILY SUDOKU</span>
              <span className="text-[10px] text-stone-600 font-mono">No. 1984</span>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 font-mono font-bold text-stone-700">
              {/* Optional Timer toggle */}
              <button
                type="button"
                onClick={() => setIsTimerVisible(!isTimerVisible)}
                title={isTimerVisible ? 'Verberg Timer' : 'Toon Timer'}
                className="flex items-center gap-1 hover:text-amber-800 px-1.5 py-0.5 rounded transition-colors cursor-pointer"
              >
                <Clock className="w-3.5 h-3.5 text-amber-700" />
                <span>{isTimerVisible ? formatTime(engine.timerSeconds) : '••:••'}</span>
                {isTimerVisible ? (
                  <Eye className="w-3 h-3 text-stone-400" />
                ) : (
                  <EyeOff className="w-3 h-3 text-stone-400" />
                )}
              </button>

              {/* Real-time score indicator */}
              <div 
                title="Lopende Score (snelheid, hints en correcties beïnvloeden dit)"
                className="hidden sm:flex items-center gap-1 text-[10px] bg-amber-100/70 border border-amber-300/60 px-1.5 py-0.5 rounded text-amber-900 font-bold"
              >
                <span>PTS:</span>
                <span>{engine.calculateScore().finalScore.toLocaleString()}</span>
              </div>

              {!isZenMode && (
                <div className="flex items-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5 text-red-600" />
                  <span className={engine.mistakes >= engine.maxMistakes ? 'text-red-600 font-black' : ''}>
                    {engine.mistakes}/{engine.maxMistakes}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* 9x9 Sudoku Grid with Heavy 3x3 Box Dividers */}
          <div className="relative w-full aspect-square bg-[#fbf8f0] border-4 border-stone-900 rounded-xl overflow-hidden shadow-md grid grid-cols-9">
            {engine.grid.map((row, r) => 
              row.map((cell, c) => {
                const isSelected = engine.selectedRow === r && engine.selectedCol === c;
                const isSameRowColBox = 
                  engine.selectedRow === r || 
                  engine.selectedCol === c || 
                  (engine.selectedRow !== null && engine.selectedCol !== null && 
                   Math.floor(engine.selectedRow / 3) === Math.floor(r / 3) && 
                   Math.floor(engine.selectedCol / 3) === Math.floor(c / 3));
                const isMatchingNumber = selectedValue > 0 && cell.value === selectedValue;

                // Thicker borders on 3x3 box edges
                const borderRight = (c === 2 || c === 5) ? 'border-r-3 border-stone-900' : (c < 8 ? 'border-r border-stone-300' : '');
                const borderBottom = (r === 2 || r === 5) ? 'border-b-3 border-stone-900' : (r < 8 ? 'border-b border-stone-300' : '');

                // Background coloring
                let bgStyle = 'bg-transparent';
                if (cell.isError) {
                  bgStyle = 'bg-red-200/90 text-red-900 font-black animate-shake';
                } else if (isSelected) {
                  bgStyle = 'bg-amber-300/90 ring-3 ring-amber-600 ring-inset z-10';
                } else if (isMatchingNumber) {
                  bgStyle = 'bg-amber-200/80 font-bold';
                } else if (isSameRowColBox) {
                  bgStyle = 'bg-amber-50/90';
                }

                return (
                  <button
                    key={`${r}-${c}`}
                    type="button"
                    onClick={() => handleCellClick(r, c)}
                    className={`relative flex items-center justify-center transition-colors cursor-pointer select-none ${borderRight} ${borderBottom} ${bgStyle}`}
                  >
                    {/* Value rendered or 3x3 Notes grid */}
                    {cell.value !== 0 ? (
                      <span className={`text-base sm:text-xl md:text-2xl font-serif ${
                        cell.isGiven 
                          ? 'font-bold text-stone-950' 
                          : 'font-semibold text-blue-800'
                      }`}>
                        {cell.value}
                      </span>
                    ) : cell.notes.size > 0 ? (
                      // 3x3 miniature pencil candidate notes
                      <div className="grid grid-cols-3 w-full h-full p-0.5 pointer-events-none">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                          <div 
                            key={n} 
                            className={`flex items-center justify-center text-[7px] sm:text-[9px] font-mono leading-none ${
                              cell.notes.has(n) ? 'text-stone-700 font-bold' : 'text-transparent'
                            }`}
                          >
                            {cell.notes.has(n) ? n : ''}
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </button>
                );
              })
            )}

            {/* Victory Congratulation Overlay with Real-time Scoring & Receipt */}
            {engine.isCompleted && (() => {
              const scoreBreakdown = engine.calculateScore();
              return (
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-4 sm:p-6 bg-stone-900/95 backdrop-blur-md rounded-xl text-center text-white animate-fadeIn overflow-y-auto">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center text-2xl sm:text-3xl mb-2 shadow-[0_0_25px_rgba(245,158,11,0.5)]">
                    🏆
                  </div>
                  
                  <h2 className="text-xl sm:text-2xl font-serif font-black text-amber-300">
                    PUZZEL OPGELOST!
                  </h2>
                  <p className="text-[11px] sm:text-xs text-stone-300 mt-0.5 font-serif">
                    Gefeliciteerd! Je hebt het 9×9 raster voltooid.
                  </p>

                  {/* Grand Score Display */}
                  <div className="my-2.5 px-4 py-2 rounded-2xl bg-amber-950/60 border border-amber-500/40 shadow-inner">
                    <div className="text-[10px] uppercase font-mono tracking-widest text-amber-400 font-bold">
                      EINDSCORE
                    </div>
                    <div className="text-2xl sm:text-3xl font-black font-mono text-white tracking-wider">
                      {scoreBreakdown.finalScore.toLocaleString()} <span className="text-xs text-amber-400">PTS</span>
                    </div>
                  </div>

                  {/* Detailed Score Breakdown Receipt */}
                  <div className="w-full max-w-xs bg-stone-950/80 rounded-xl p-2.5 border border-stone-800 text-[11px] font-mono space-y-1 text-left mb-3">
                    <div className="flex justify-between text-stone-300">
                      <span>Basis ({selectedDifficulty.toUpperCase()}):</span>
                      <span className="text-amber-300">+{scoreBreakdown.baseScore}</span>
                    </div>
                    <div className="flex justify-between text-stone-300">
                      <span>Snelheidsbonus ({formatTime(engine.timerSeconds)}):</span>
                      <span className={scoreBreakdown.timeBonus > 0 ? 'text-emerald-400' : 'text-stone-500'}>
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
                    <div className="flex items-center gap-2 mb-3">
                      <input
                        type="text"
                        maxLength={4}
                        value={playerInitials}
                        onChange={(e) => setPlayerInitials(e.target.value.toUpperCase())}
                        placeholder="INIT"
                        className="w-20 px-2 py-1.5 rounded-xl bg-stone-950 border border-amber-500/60 text-center font-mono font-black text-amber-300 text-sm tracking-widest focus:outline-none focus:border-amber-400"
                      />
                      <button
                        onClick={handleSaveScore}
                        className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xs transition-all shadow-md active:scale-95 cursor-pointer font-mono"
                      >
                        Score Opslaan
                      </button>
                    </div>
                  ) : (
                    <div className="mb-3 text-xs font-mono text-emerald-400 font-bold flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                      <span>Opgeslagen! {savedRank ? `Plaats #${savedRank} in de top` : ''}</span>
                    </div>
                  )}

                  {/* Action buttons */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsLeaderboardOpen(true)}
                      className="px-3 sm:px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-amber-300 font-bold text-xs transition-all border border-amber-700/40 cursor-pointer flex items-center gap-1.5 font-mono"
                    >
                      <Trophy className="w-3.5 h-3.5 text-yellow-400" />
                      <span>Erelijst</span>
                    </button>
                    <button
                      onClick={() => handleNewGame(selectedDifficulty)}
                      className="px-4 sm:px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-stone-950 font-black text-xs shadow-lg shadow-amber-500/30 transition-all active:scale-95 cursor-pointer font-serif"
                    >
                      Volgende Puzzel
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Hint explanation notification strip */}
          {engine.lastHintMessage && (
            <div className="w-full mt-2 px-3 py-1.5 rounded-lg bg-amber-100/90 border border-amber-300 text-amber-900 text-xs font-mono flex items-center justify-between">
              <span>{engine.lastHintMessage}</span>
              <button 
                onClick={() => { engine.lastHintMessage = ''; rerender(); }}
                className="text-stone-500 hover:text-stone-800 text-[10px] font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>
          )}
        </div>

        {/* Tactical Control Desk & Side Panel */}
        <div className="flex flex-col gap-3 w-full max-w-[360px]">
          
          {/* Difficulty Tabs */}
          <div className="bg-stone-900/80 border border-amber-900/30 rounded-2xl p-2 shadow-lg">
            <div className="text-[10px] font-mono uppercase tracking-wider text-stone-400 px-1 mb-1.5 flex items-center justify-between">
              <span>Moeilijkheidsgraad</span>
              <button
                onClick={handleToggleZenMode}
                className={`text-[9px] px-2 py-0.5 rounded font-bold transition-all cursor-pointer ${
                  isZenMode ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40' : 'bg-red-950 text-red-300 border border-red-500/40'
                }`}
              >
                {isZenMode ? '🍃 Zen (Vrij)' : '⚡ 3 Levens'}
              </button>
            </div>
            <div className="grid grid-cols-4 gap-1">
              {(['easy', 'medium', 'hard', 'expert'] as SudokuDifficulty[]).map((diff) => {
                const labels = { easy: 'Makkelijk', medium: 'Gemiddeld', hard: 'Moeilijk', expert: 'Expert' };
                const isActive = selectedDifficulty === diff;
                return (
                  <button
                    key={diff}
                    onClick={() => handleNewGame(diff)}
                    className={`py-1.5 text-xs font-serif font-bold rounded-xl transition-all cursor-pointer ${
                      isActive 
                        ? 'bg-amber-600 text-stone-950 shadow-md scale-102' 
                        : 'bg-stone-800 text-stone-300 hover:bg-stone-700 hover:text-white'
                    }`}
                  >
                    {labels[diff]}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action Tools (Notes, Erase, Undo, Hint) */}
          <div className="grid grid-cols-4 gap-2">
            <button
              onClick={handleToggleNotes}
              className={`flex flex-col items-center justify-center p-2 rounded-2xl border transition-all cursor-pointer active:scale-95 ${
                engine.isNoteMode
                  ? 'bg-amber-500 text-stone-950 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.5)]'
                  : 'bg-stone-900/90 text-stone-300 hover:text-white border-stone-800 hover:border-amber-700/50'
              }`}
            >
              <Edit3 className="w-5 h-5 mb-0.5" />
              <span className="text-[10px] font-bold font-mono">Notities</span>
              <span className={`text-[8px] font-bold uppercase ${engine.isNoteMode ? 'text-stone-950' : 'text-stone-500'}`}>
                {engine.isNoteMode ? 'Aan' : 'Uit'}
              </span>
            </button>

            <button
              onClick={handleErase}
              className="flex flex-col items-center justify-center p-2 rounded-2xl bg-stone-900/90 hover:bg-stone-800 text-stone-300 hover:text-white border border-stone-800 hover:border-amber-700/50 transition-all cursor-pointer active:scale-95"
            >
              <Eraser className="w-5 h-5 mb-0.5 text-amber-400" />
              <span className="text-[10px] font-bold font-mono">Gum</span>
              <span className="text-[8px] text-stone-500 uppercase">Wissen</span>
            </button>

            <button
              onClick={handleUndo}
              className="flex flex-col items-center justify-center p-2 rounded-2xl bg-stone-900/90 hover:bg-stone-800 text-stone-300 hover:text-white border border-stone-800 hover:border-amber-700/50 transition-all cursor-pointer active:scale-95"
            >
              <Undo2 className="w-5 h-5 mb-0.5 text-blue-400" />
              <span className="text-[10px] font-bold font-mono">Herstel</span>
              <span className="text-[8px] text-stone-500 uppercase">Ctrl+Z</span>
            </button>

            <button
              onClick={handleHint}
              disabled={engine.hintsRemaining <= 0}
              className="flex flex-col items-center justify-center p-2 rounded-2xl bg-stone-900/90 hover:bg-stone-800 disabled:opacity-40 text-stone-300 hover:text-white border border-stone-800 hover:border-amber-700/50 transition-all cursor-pointer active:scale-95"
            >
              <Lightbulb className="w-5 h-5 mb-0.5 text-yellow-400" />
              <span className="text-[10px] font-bold font-mono">Hint</span>
              <span className="text-[8px] text-amber-400 uppercase">{engine.hintsRemaining} over</span>
            </button>
          </div>

          {/* Tactile Digit Pad 1 to 9 */}
          <div className="bg-stone-900/90 border border-amber-900/30 rounded-2xl p-3 shadow-xl">
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => {
                const count = numberCounts[num] || 0;
                const isAllPlaced = count >= 9;
                return (
                  <button
                    key={num}
                    type="button"
                    onClick={() => handleNumberInput(num)}
                    disabled={isAllPlaced}
                    className={`relative py-3 rounded-xl border flex flex-col items-center justify-center transition-all cursor-pointer active:scale-95 ${
                      isAllPlaced 
                        ? 'opacity-30 bg-stone-950 border-stone-800 cursor-not-allowed'
                        : 'bg-stone-800/90 hover:bg-amber-600/20 text-stone-100 hover:text-amber-200 border-stone-700 hover:border-amber-500/50 shadow-sm'
                    }`}
                  >
                    <span className="text-xl sm:text-2xl font-serif font-black">{num}</span>
                    <span className="text-[9px] font-mono text-stone-400">
                      {isAllPlaced ? '✓ Compleet' : `${9 - count} rest`}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Guide & Controls Telemetry */}
          <div className="px-3 py-2 bg-stone-900/60 rounded-xl border border-stone-800 text-[11px] text-stone-400 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Gamepad2 className="w-4 h-4 text-amber-400" />
              <span>D-Pad / Pijltjes • 1-9 Invoeren</span>
            </div>
            <div className="font-mono text-[10px] text-amber-400">
              [N] Notities • [H] Hint
            </div>
          </div>

        </div>

      </div>

      {/* Subtle Footer */}
      <footer className="relative z-10 w-full max-w-4xl text-center text-[10px] text-stone-500 font-mono py-1">
        Retro Arcade Vault • Sudoku Clean-Room Reimplementation in TypeScript
      </footer>

      {/* Sudoku Leaderboard Modal */}
      <SudokuLeaderboardModal
        isOpen={isLeaderboardOpen}
        onClose={() => setIsLeaderboardOpen(false)}
        onPlayAgain={() => handleNewGame(selectedDifficulty)}
        highlightId={highlightScoreId}
      />

    </div>
  );
};
