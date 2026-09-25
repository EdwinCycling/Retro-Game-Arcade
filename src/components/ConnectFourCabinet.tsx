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
  Trophy, 
  HelpCircle, 
  Sparkles, 
  Bot, 
  Users, 
  ChevronDown,
  Unlock,
  Award
} from 'lucide-react';
import { 
  ConnectFourEngine, 
  ConnectFourPlayer, 
  AIDifficulty, 
  GameMode, 
  ROWS, 
  COLS 
} from '../game/connectFourEngine';
import { 
  getConnectFourHighScores, 
  saveConnectFourHighScore, 
  ConnectFourScoreEntry 
} from '../game/connectFourHighScores';
import { ConnectFourHistoryModal } from './ConnectFourHistoryModal';
import { haptics } from '../utils/haptics';
import { gamepadManager } from '../utils/gamepadManager';

interface ConnectFourCabinetProps {
  onBackToLobby: () => void;
}

export const ConnectFourCabinet: React.FC<ConnectFourCabinetProps> = ({ onBackToLobby }) => {
  const [engine] = useState(() => new ConnectFourEngine('tactician', 'vs_ai'));
  const [, setTick] = useState(0);

  const [hoveredCol, setHoveredCol] = useState<number | null>(3);
  const [isMuted, setIsMuted] = useState(false);
  const [aiDifficulty, setAiDifficulty] = useState<AIDifficulty>('tactician');
  const [gameMode, setGameMode] = useState<GameMode>('vs_ai');
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showScoresModal, setShowScoresModal] = useState(false);
  const [highScores, setHighScores] = useState<ConnectFourScoreEntry[]>([]);

  // Physical token drop animation state
  const [fallingDisc, setFallingDisc] = useState<{
    col: number;
    targetRow: number;
    currentRow: number; // -1 = top slot, 0..5 = grid holes
    player: ConnectFourPlayer;
  } | null>(null);

  // Bottom slider lever release animation state
  const [isLeverReleased, setIsLeverReleased] = useState(false);
  const [isClearingGrid, setIsClearingGrid] = useState(false);

  const rerender = () => setTick(t => t + 1);

  // Initialize
  useEffect(() => {
    setHighScores(getConnectFourHighScores());
  }, []);

  // Handle high score saving on player victory
  useEffect(() => {
    if (engine.phase === 'game_over' && engine.winner === 'red' && engine.gameMode === 'vs_ai') {
      const turns = engine.moveHistory.length;
      const score = Math.max(500, 3000 - turns * 50);
      const updated = saveConnectFourHighScore({
        initials: 'YOU',
        score,
        moves: turns,
        aiDifficulty: engine.aiDifficulty,
        date: new Date().toISOString().split('T')[0],
        note: `Zege tegen ${engine.aiDifficulty.toUpperCase()} in ${turns} beurten`
      });
      setHighScores(updated);
    }
  }, [engine.phase, engine.winner]);

  // Execute smooth row-by-row physical drop animation
  const animateDrop = (c: number, onComplete?: () => void) => {
    if (engine.phase !== 'playing' || fallingDisc !== null) return;
    const targetRow = engine.getAvailableRow(c);
    if (targetRow === -1) return;

    const player = engine.currentTurn;
    let curr = -1;

    setFallingDisc({ col: c, targetRow, currentRow: -1, player });

    const stepInterval = setInterval(() => {
      curr++;
      if (curr <= targetRow) {
        setFallingDisc({ col: c, targetRow, currentRow: curr, player });
        if (!isMuted) {
          engine.playSlideFrictionSound();
        }
      }

      if (curr === targetRow) {
        clearInterval(stepInterval);
        setTimeout(() => {
          engine.dropToken(c, !isMuted);
          setFallingDisc(null);
          haptics.light();
          rerender();

          if (onComplete) {
            onComplete();
          }

          // Trigger AI response if vs_ai and AI's turn
          if (engine.gameMode === 'vs_ai' && engine.currentTurn === 'yellow' && engine.phase === 'playing') {
            triggerAITurn();
          }
        }, 50);
      }
    }, 85); // 85ms per row step for measured physical slide ("niet te snel, je schuift ze er echt in")
  };

  const triggerAITurn = () => {
    engine.isThinking = true;
    rerender();

    const delay = engine.aiDifficulty === 'novice' ? 400 : engine.aiDifficulty === 'tactician' ? 600 : 800;

    setTimeout(() => {
      if (engine.phase !== 'playing' || engine.currentTurn !== 'yellow') {
        engine.isThinking = false;
        rerender();
        return;
      }

      const bestCol = engine.calculateBestAIMove();
      engine.isThinking = false;
      animateDrop(bestCol);
    }, delay);
  };

  const handleDrop = (c: number) => {
    if (engine.phase !== 'playing' || engine.isThinking || fallingDisc !== null) return;
    animateDrop(c);
  };

  const handleReset = () => {
    if (fallingDisc !== null) return;

    setIsLeverReleased(true);
    setIsClearingGrid(true);
    if (!isMuted) {
      engine.playSliderReleaseSound();
    }
    haptics.selection();

    setTimeout(() => {
      engine.initGame();
      setIsClearingGrid(false);
      rerender();

      setTimeout(() => {
        setIsLeverReleased(false);
      }, 300);
    }, 550);
  };

  const handleChangeDifficulty = (diff: AIDifficulty) => {
    setAiDifficulty(diff);
    engine.aiDifficulty = diff;
    engine.initGame();
    rerender();
  };

  const handleChangeMode = (mode: GameMode) => {
    setGameMode(mode);
    engine.gameMode = mode;
    engine.initGame();
    rerender();
  };

  const isWinningCell = (r: number, c: number) => {
    if (!engine.winResult) return false;
    return engine.winResult.winningCells.some(cell => cell.r === r && cell.c === c);
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-start p-2 sm:p-4 select-none bg-slate-950 text-slate-100 overflow-x-hidden font-sans">
      
      {/* Top Header */}
      <header className="w-full max-w-5xl bg-slate-900/90 border border-amber-600/30 backdrop-blur-md px-4 py-2.5 flex items-center justify-between sticky top-0 z-30 shadow-md rounded-2xl mb-3">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToLobby}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-amber-500 text-xs font-mono font-semibold transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-amber-400" />
            <span>Lobby</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="text-xl">🟡</span>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-sm tracking-wide text-amber-300">
                  VIER OP EEN RIJ (1974)
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-700/50">
                  MILTON BRADLEY
                </span>
              </div>
              <span className="text-[11px] font-mono text-slate-400 hidden sm:block">
                Klassiek Kunststof Speelraam • Howard Wexler &amp; Ned Strongin
              </span>
            </div>
          </div>
        </div>

        {/* Top Right Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowScoresModal(true)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 hover:border-amber-400 text-xs font-mono transition-colors cursor-pointer"
          >
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Records</span>
          </button>

          <button
            onClick={() => setShowHistoryModal(true)}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 hover:border-amber-400 transition-colors cursor-pointer"
            title="Spelregels &amp; Historie Dossier"
          >
            <HelpCircle className="w-4 h-4 text-amber-400" />
          </button>

          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 hover:border-amber-400 transition-colors cursor-pointer"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-amber-400" />}
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="w-full max-w-4xl flex flex-col items-center gap-4 my-2">
        
        {/* Game Mode & Difficulty Controls Strip */}
        <div className="w-full bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xl backdrop-blur-md">
          {/* Mode Switcher */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 font-mono text-xs">
            <button
              onClick={() => handleChangeMode('vs_ai')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer font-bold ${
                gameMode === 'vs_ai' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Bot className="w-3.5 h-3.5" />
              <span>vs C64 AI</span>
            </button>
            <button
              onClick={() => handleChangeMode('pvp')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer font-bold ${
                gameMode === 'pvp' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>2 Spelers (Pas &amp; Speel)</span>
            </button>
          </div>

          {/* AI Difficulty (if vs_ai) */}
          {gameMode === 'vs_ai' && (
            <div className="flex items-center gap-1.5 font-mono text-xs">
              <span className="text-slate-400 text-[11px] hidden sm:inline">Niveau:</span>
              {(['novice', 'tactician', 'grandmaster'] as AIDifficulty[]).map(diff => (
                <button
                  key={diff}
                  onClick={() => handleChangeDifficulty(diff)}
                  className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    aiDifficulty === diff
                      ? 'bg-blue-600 text-white shadow border border-blue-400'
                      : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700'
                  }`}
                >
                  {diff === 'novice' ? 'Beginner' : diff === 'tactician' ? 'Tactisch' : 'Grootmeester'}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Status Announcement Banner */}
        <div className="w-full bg-slate-900/90 border border-amber-500/40 rounded-2xl p-3 flex items-center justify-between shadow-lg font-mono text-xs text-amber-300">
          <div className="flex items-center gap-2">
            <span className={`w-3 h-3 rounded-full animate-pulse ${
              engine.currentTurn === 'red' ? 'bg-red-500 shadow-[0_0_10px_#ef4444]' : 'bg-yellow-400 shadow-[0_0_10px_#facc15]'
            }`} />
            <span className="font-bold">
              {engine.phase === 'game_over' ? (
                engine.winner === 'draw' ? (
                  '🤝 GELIJKSPEL! Het Speelraam is helemaal vol gelopen.'
                ) : engine.winner === 'red' ? (
                  '🎉 GEFELICITEERD! Rood heeft 4 op een rij gemaakt!'
                ) : (
                  '💻 C64 AI WINT! Geel heeft 4 op een rij.'
                )
              ) : engine.isThinking ? (
                '💻 C64 AI denkt na over zijn beurt...'
              ) : engine.currentTurn === 'red' ? (
                '🔴 Jouw beurt (Rood)! Kies een kolom om te laten vallen.'
              ) : (
                gameMode === 'pvp' ? '🟡 Speler 2 aan de beurt (Geel)!' : '🟡 C64 AI is aan de beurt...'
              )}
            </span>
          </div>

          <button
            onClick={handleReset}
            className="flex items-center gap-1 px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-[11px] font-bold">Opnieuw</span>
          </button>
        </div>

        {/* ICONIC PHYSICAL PLASTIC FRAME */}
        <div className="relative w-full max-w-[580px] bg-gradient-to-b from-blue-600 via-blue-700 to-blue-900 border-4 border-blue-800 rounded-3xl p-4 sm:p-6 shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_30px_rgba(37,99,235,0.3)] flex flex-col items-center">
          
          {/* Top Column Drop Indicators & Preview Token */}
          <div className="grid grid-cols-7 gap-1.5 sm:gap-2.5 w-full mb-3">
            {Array.from({ length: COLS }).map((_, c) => {
              const isHovered = hoveredCol === c;
              const isFull = engine.getAvailableRow(c) === -1;

              return (
                <div key={`col-header-${c}`} className="flex flex-col items-center justify-end h-8">
                  {isHovered && engine.phase === 'playing' && !engine.isThinking && !isFull && (
                    <div className="flex flex-col items-center animate-bounce">
                      <div className={`w-5 h-5 rounded-full border-2 shadow-md ${
                        engine.currentTurn === 'red'
                          ? 'bg-gradient-to-br from-red-500 via-rose-600 to-red-900 border-amber-300'
                          : 'bg-gradient-to-br from-yellow-400 via-amber-500 to-yellow-800 border-yellow-200'
                      }`} />
                      <ChevronDown className="w-4 h-4 text-amber-300 -mt-1" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* 7 Columns x 6 Rows Plastic Grid Container */}
          <div className="relative grid grid-cols-7 gap-1.5 sm:gap-2.5 w-full bg-blue-800/90 p-3 sm:p-4 rounded-2xl border-2 border-blue-500/60 shadow-inner overflow-hidden">
            
            {Array.from({ length: COLS }).map((_, c) => {
              const isFull = engine.getAvailableRow(c) === -1;

              return (
                <button
                  key={`col-btn-${c}`}
                  type="button"
                  disabled={engine.phase !== 'playing' || engine.isThinking || isFull || fallingDisc !== null}
                  onClick={() => handleDrop(c)}
                  onMouseEnter={() => setHoveredCol(c)}
                  className={`
                    flex flex-col gap-1.5 sm:gap-2.5 rounded-xl transition-colors cursor-pointer p-1 relative
                    ${hoveredCol === c && engine.phase === 'playing' && !engine.isThinking && !isFull ? 'bg-blue-600/50' : 'bg-transparent'}
                  `}
                >
                  {Array.from({ length: ROWS }).map((_, r) => {
                    const isFallingHere = fallingDisc && fallingDisc.col === c && fallingDisc.currentRow === r;
                    const token = isFallingHere ? fallingDisc.player : engine.grid[r][c];
                    const isWinning = isWinningCell(r, c);

                    return (
                      <div
                        key={`cell-${r}-${c}`}
                        className={`
                          relative aspect-square w-full rounded-full flex items-center justify-center transition-all duration-200 shadow-inner overflow-hidden
                          ${isClearingGrid && token !== null ? 'translate-y-24 opacity-0 transition-transform duration-500 ease-in' : ''}
                          ${token === null ? 'bg-slate-950 border border-blue-900/60' : ''}
                          ${token === 'red' ? 'bg-gradient-to-br from-red-500 via-rose-600 to-red-900 border-2 border-amber-300/80 shadow-[inset_0_2px_4px_rgba(255,255,255,0.4)]' : ''}
                          ${token === 'yellow' ? 'bg-gradient-to-br from-yellow-400 via-amber-500 to-yellow-800 border-2 border-yellow-200/80 shadow-[inset_0_2px_4px_rgba(255,255,255,0.4)]' : ''}
                          ${isFallingHere ? 'scale-105 shadow-[0_0_15px_rgba(255,255,255,0.6)] animate-pulse' : ''}
                          ${isWinning ? 'ring-4 ring-yellow-300 animate-pulse scale-105 z-10 shadow-[0_0_20px_#facc15]' : ''}
                        `}
                      >
                        {/* Ridged plastic inner ring pattern on tokens */}
                        {token !== null && (
                          <div className="w-1/2 h-1/2 rounded-full border border-white/20 pointer-events-none" />
                        )}
                      </div>
                    );
                  })}
                </button>
              );
            })}
          </div>

          {/* BOTTOM RELEASE SLIDER / LEVER (Het Gele Schuifmechanisme) */}
          <div className="w-full mt-4 flex flex-col items-center gap-2">
            <button
              onClick={handleReset}
              disabled={fallingDisc !== null}
              className={`
                w-full max-w-sm py-2 px-4 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-mono font-black text-xs border-2 border-yellow-200 shadow-lg transition-transform active:scale-95 cursor-pointer flex items-center justify-center gap-2
                ${isLeverReleased ? 'translate-x-6 bg-yellow-300 shadow-[0_0_25px_#facc15] border-amber-300' : ''}
              `}
              title="Trek aan de gele schuifbalk onderaan om alle fiches te laten vallen"
            >
              <Unlock className={`w-4 h-4 transition-transform ${isLeverReleased ? 'rotate-45 text-slate-900' : ''}`} />
              <span>{isLeverReleased ? '🔓 LEVER ONTGRENDELD • FICHES VALLEN LEEG!' : '🔓 ONDERSCHUIF TIJDENS DIT SPEL LEEGMAKEN (LEVER RELEASE)'}</span>
            </button>
            <span className="text-[10px] font-mono text-blue-200 opacity-80">
              *Trek aan de gele schuif om de plastic fiches er onderuit te laten vallen
            </span>
          </div>
        </div>
      </main>

      {/* Rules & History Dossier Modal */}
      {showHistoryModal && (
        <ConnectFourHistoryModal onClose={() => setShowHistoryModal(false)} />
      )}

      {/* Leaderboard Modal */}
      {showScoresModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border-2 border-amber-500/60 rounded-2xl max-w-lg w-full flex flex-col shadow-2xl font-mono text-xs">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-amber-300 text-sm">
                <Trophy className="w-5 h-5 text-amber-400" />
                <span>Vier op een Rij Records &amp; Erelijst</span>
              </div>
              <button
                onClick={() => setShowScoresModal(false)}
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-4 space-y-2 max-h-[60vh] overflow-y-auto">
              {highScores.map((entry, idx) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800"
                >
                  <div className="flex items-center gap-2.5">
                    <span className={`w-6 h-6 rounded flex items-center justify-center font-bold text-xs ${
                      idx === 0 ? 'bg-amber-500 text-slate-950' : idx === 1 ? 'bg-slate-300 text-slate-950' : idx === 2 ? 'bg-amber-700 text-white' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {idx + 1}
                    </span>
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-200">{entry.initials}</span>
                      <span className="text-[10px] text-slate-400">{entry.note || entry.aiDifficulty}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-amber-400 font-bold">{entry.score} PTS</span>
                    <span className="text-[10px] text-slate-500">{entry.date}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setShowScoresModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer font-bold"
              >
                Sluiten
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
