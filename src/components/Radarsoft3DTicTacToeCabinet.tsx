/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  ArrowLeft, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  HelpCircle, 
  Trophy, 
  Sparkles, 
  Lightbulb, 
  Tv, 
  Bot, 
  Users, 
  Layers, 
  Box, 
  SplitSquareVertical,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { 
  Radarsoft3DEngine, 
  CellState, 
  PlayerPiece, 
  GameMode, 
  AIDifficulty, 
  WinningLine,
  MoveRecord,
  WINNING_LINES,
  CELL_STRATEGIC_WEIGHTS
} from '../game/radarsoft3DTicTacToeEngine';
import { radarsoftAudio } from '../game/radarsoft3DTicTacToeAudio';
import { getRadarsoftHighScores, saveRadarsoftHighScore, RadarsoftScoreEntry } from '../game/radarsoft3DTicTacToeHighScores';
import { Radarsoft3DCubeView } from './Radarsoft3DCubeView';
import { RadarsoftLayerBoards } from './RadarsoftLayerBoards';
import { haptics } from '../utils/haptics';

interface Radarsoft3DTicTacToeCabinetProps {
  onBackToLobby: () => void;
}

export const Radarsoft3DTicTacToeCabinet: React.FC<Radarsoft3DTicTacToeCabinetProps> = ({ onBackToLobby }) => {
  // Game engine ref
  const engineRef = useRef<Radarsoft3DEngine | null>(null);

  // Reactive UI state
  const [board, setBoard] = useState<readonly CellState[]>(Array(64).fill(null));
  const [currentPlayer, setCurrentPlayer] = useState<PlayerPiece>('X');
  const [winner, setWinner] = useState<PlayerPiece | 'draw' | null>(null);
  const [winningLine, setWinningLine] = useState<WinningLine | null>(null);
  const [moveHistory, setMoveHistory] = useState<readonly MoveRecord[]>([]);
  const [isThinking, setIsThinking] = useState<boolean>(false);
  const [threats, setThreats] = useState<number[]>([]);

  // Settings & View Options
  const [gameMode, setGameMode] = useState<GameMode>('ai');
  const [difficulty, setDifficulty] = useState<AIDifficulty>('veteran');
  const [humanPiece, setHumanPiece] = useState<PlayerPiece>('X');
  const [viewMode, setViewMode] = useState<'split' | 'cube' | 'layers'>('split');
  const [scanlines, setScanlines] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Interaction
  const [hoveredCell, setHoveredCell] = useState<number | null>(null);
  const [hintMessage, setHintMessage] = useState<{ text: string; index: number } | null>(null);
  const [showRulesModal, setShowRulesModal] = useState<boolean>(false);
  const [showScoresModal, setShowScoresModal] = useState<boolean>(false);
  const [highScores, setHighScores] = useState<RadarsoftScoreEntry[]>([]);

  // Consecutive wins streak
  const [streak, setStreak] = useState<number>(0);

  // Initialize engine
  useEffect(() => {
    const aiPiece = humanPiece === 'X' ? 'O' : 'X';
    const engine = new Radarsoft3DEngine(gameMode, difficulty, aiPiece);
    engineRef.current = engine;
    setBoard([...engine.getBoard()]);
    setCurrentPlayer(engine.getCurrentPlayer());
    setHighScores(getRadarsoftHighScores());
    setIsMuted(radarsoftAudio.getMuted());
  }, [gameMode, difficulty, humanPiece]);

  // Synchronize state periodically or on move
  const syncEngineState = () => {
    if (!engineRef.current) return;
    const engine = engineRef.current;
    setBoard([...engine.getBoard()]);
    setCurrentPlayer(engine.getCurrentPlayer());
    setWinner(engine.getWinner());
    setWinningLine(engine.getWinningLine());
    setMoveHistory([...engine.getMoveHistory()]);
    setIsThinking(engine.isAIThinking());
    setThreats(engine.getThreats());
  };

  // Poll thinking state while AI computes
  useEffect(() => {
    let timer: number;
    if (isThinking) {
      timer = window.setInterval(() => {
        syncEngineState();
      }, 50);
    }
    return () => clearInterval(timer);
  }, [isThinking]);

  // Handle Win/Loss sound effects & streak update
  useEffect(() => {
    if (!winner) return;

    if (winner === 'draw') {
      radarsoftAudio.playDraw();
      haptics.warning();
    } else if (gameMode === 'ai') {
      if (winner === humanPiece) {
        radarsoftAudio.playVictoryFanfare();
        haptics.success();
        const newStreak = streak + 1;
        setStreak(newStreak);

        // Save High Score
        const bonus = difficulty === 'master' ? 300 : difficulty === 'veteran' ? 150 : 50;
        const score = 1000 + newStreak * 200 + bonus;
        const updated = saveRadarsoftHighScore({
          initials: 'YOU',
          score,
          mode: `ai_${difficulty}` as any,
          wins: newStreak,
          streak: newStreak,
          date: new Date().toISOString().split('T')[0],
          note: `Versloeg C64 ${difficulty.toUpperCase()} met 4-op-een-rij`
        });
        setHighScores(updated);
      } else {
        radarsoftAudio.playDefeat();
        haptics.error();
        setStreak(0);
      }
    } else {
      radarsoftAudio.playVictoryFanfare();
      haptics.success();
    }
  }, [winner]);

  // Execute a cell selection (player move)
  const handleSelectCell = (idx: number) => {
    if (!engineRef.current) return;
    const engine = engineRef.current;
    if (!engine.canMakeMove(idx)) return;

    const movePlayer = engine.getCurrentPlayer();
    const success = engine.makeMove(idx);
    if (success) {
      radarsoftAudio.playPlacePiece(movePlayer);
      haptics.light();
      setHintMessage(null);
      syncEngineState();

      // Check if new threats appeared
      const newThreats = engine.getThreats();
      if (newThreats.length > 0 && !engine.getWinner()) {
        radarsoftAudio.playThreatAlert();
      }
    }
  };

  // Reset Game
  const handleReset = () => {
    if (!engineRef.current) return;
    radarsoftAudio.playReset();
    haptics.selection();
    engineRef.current.reset();
    setHintMessage(null);
    syncEngineState();
  };

  // Undo Move
  const handleUndo = () => {
    if (!engineRef.current) return;
    radarsoftAudio.playLayerSwitch();
    haptics.selection();
    engineRef.current.undoMove();
    setHintMessage(null);
    syncEngineState();
  };

  // Request Hint
  const handleHint = () => {
    if (!engineRef.current) return;
    radarsoftAudio.playAIBlip();
    haptics.selection();
    const hint = engineRef.current.getHint();
    if (hint) {
      setHintMessage({ text: hint.reasonNl, index: hint.index });
      setHoveredCell(hint.index);
    }
  };

  // Toggle Mute
  const handleToggleMute = () => {
    const muted = radarsoftAudio.toggleMute();
    setIsMuted(muted);
    haptics.selection();
  };

  const winningIndices = useMemo(() => {
    return winningLine ? [...winningLine.indices] : null;
  }, [winningLine]);

  return (
    <div className="relative w-full min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-start select-none font-sans overflow-x-hidden">
      {/* C64 CRT Scanlines & Phosphor Glow Overlay */}
      {scanlines && (
        <div className="fixed inset-0 pointer-events-none z-40 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px]" />
      )}

      {/* Top Header Bar */}
      <header className="w-full bg-slate-900/90 border-b border-cyan-500/30 backdrop-blur-md px-4 py-2.5 flex items-center justify-between sticky top-0 z-30 shadow-md">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToLobby}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-cyan-500 text-xs font-mono font-semibold transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-cyan-400" />
            <span>Lobby</span>
          </button>

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-sm tracking-wide text-cyan-300">
                RADARSOFT 3D TIC TAC TOE
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-700/50">
                1984 C64
              </span>
            </div>
            <span className="text-[11px] font-mono text-slate-400">
              Cees Kramer & John Vanderaart • 4×4×4 Qubic • 76 Winlijnen
            </span>
          </div>
        </div>

        {/* Right Toolbar Controls */}
        <div className="flex items-center gap-2">
          {/* Audio toggle */}
          <button
            onClick={handleToggleMute}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 hover:border-cyan-400 transition-colors"
            title={isMuted ? 'Geluid Aan' : 'Geluid Uit'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
          </button>

          {/* CRT Scanline Toggle */}
          <button
            onClick={() => setScanlines(prev => !prev)}
            className={`p-1.5 rounded-lg border transition-colors ${
              scanlines 
                ? 'bg-cyan-950/60 border-cyan-400/60 text-cyan-300' 
                : 'bg-slate-800 border-slate-700 text-slate-400'
            }`}
            title="CRT Monitor Scanlines Wisselen"
          >
            <Tv className="w-4 h-4" />
          </button>

          {/* Leaderboard */}
          <button
            onClick={() => setShowScoresModal(true)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 hover:border-amber-400 text-xs font-mono transition-colors"
            title="Records & Statistieken"
          >
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Records</span>
          </button>

          {/* Rules / Help */}
          <button
            onClick={() => setShowRulesModal(true)}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 hover:border-cyan-400 transition-colors"
            title="Spelregels & 76 Winlijnen"
          >
            <HelpCircle className="w-4 h-4 text-cyan-400" />
          </button>
        </div>
      </header>

      {/* Main Play Area */}
      <div className="w-full max-w-7xl px-3 sm:px-6 py-4 flex flex-col gap-4 flex-grow">
        {/* Game Status & Mode Controls Strip */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 sm:p-4 shadow-xl flex flex-wrap items-center justify-between gap-3">
          {/* Player Turn & Status */}
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-mono font-bold text-xl border shadow-inner ${
              currentPlayer === 'X'
                ? 'bg-cyan-950/80 border-cyan-400 text-cyan-300 shadow-[0_0_12px_rgba(56,189,248,0.3)]'
                : 'bg-amber-950/80 border-amber-400 text-amber-300 shadow-[0_0_12px_rgba(251,191,36,0.3)]'
            }`}>
              {currentPlayer === 'X' ? '✕' : '◯'}
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-sm text-slate-200">
                  {winner 
                    ? winner === 'draw' 
                      ? 'GELIJKSPEL!' 
                      : `WINNAAR: SPELER ${winner}!` 
                    : isThinking 
                    ? 'C64 COMPUTER DENKT NA...' 
                    : `BEURT AAN SPELER ${currentPlayer}`}
                </span>
                {streak > 0 && (
                  <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-full bg-amber-950 text-amber-400 border border-amber-600/40">
                    🔥 {streak} Win Streak
                  </span>
                )}
              </div>

              <div className="text-xs font-mono text-slate-400 flex items-center gap-2">
                <span>Zetten: {moveHistory.length}/64</span>
                {threats.length > 0 && !winner && (
                  <span className="text-rose-400 font-semibold flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3 text-rose-400 animate-pulse" />
                    {threats.length} Directe Win-Dreiging(en)!
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Configuration Options: Mode, Difficulty, Pieces */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Mode: AI vs PvP */}
            <div className="flex rounded-lg bg-slate-800 p-0.5 border border-slate-700">
              <button
                onClick={() => setGameMode('ai')}
                className={`flex items-center gap-1 px-2.5 py-1 text-xs font-mono rounded ${
                  gameMode === 'ai' ? 'bg-cyan-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Bot className="w-3.5 h-3.5" />
                <span>vs C64 AI</span>
              </button>
              <button
                onClick={() => setGameMode('pvp')}
                className={`flex items-center gap-1 px-2.5 py-1 text-xs font-mono rounded ${
                  gameMode === 'pvp' ? 'bg-cyan-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>2 Spelers</span>
              </button>
            </div>

            {/* AI Difficulty Selector */}
            {gameMode === 'ai' && (
              <div className="flex rounded-lg bg-slate-800 p-0.5 border border-slate-700">
                <button
                  onClick={() => setDifficulty('novice')}
                  className={`px-2 py-1 text-xs font-mono rounded ${
                    difficulty === 'novice' ? 'bg-emerald-700 text-white font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                  title="Basis C64 Heuristiek"
                >
                  Novice
                </button>
                <button
                  onClick={() => setDifficulty('veteran')}
                  className={`px-2 py-1 text-xs font-mono rounded ${
                    difficulty === 'veteran' ? 'bg-amber-700 text-white font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                  title="Dr. John Heuristiek (Vorken & Blokkades)"
                >
                  Dr. John
                </button>
                <button
                  onClick={() => setDifficulty('master')}
                  className={`px-2 py-1 text-xs font-mono rounded ${
                    difficulty === 'master' ? 'bg-purple-700 text-white font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                  title="Grootmeester (Volledige 76-Lijnen Analyse)"
                >
                  Master
                </button>
              </div>
            )}

            {/* View Mode */}
            <div className="flex rounded-lg bg-slate-800 p-0.5 border border-slate-700">
              <button
                onClick={() => setViewMode('split')}
                className={`p-1.5 rounded ${viewMode === 'split' ? 'bg-slate-700 text-cyan-300' : 'text-slate-400 hover:text-white'}`}
                title="Dubbel Zicht (3D + 4 Lagen)"
              >
                <SplitSquareVertical className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('cube')}
                className={`p-1.5 rounded ${viewMode === 'cube' ? 'bg-slate-700 text-cyan-300' : 'text-slate-400 hover:text-white'}`}
                title="Alleen 3D Kubus"
              >
                <Box className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('layers')}
                className={`p-1.5 rounded ${viewMode === 'layers' ? 'bg-slate-700 text-cyan-300' : 'text-slate-400 hover:text-white'}`}
                title="Alleen 4 Lagen (2D Roosters)"
              >
                <Layers className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Strategic Hint Banner */}
        {hintMessage && (
          <div className="bg-cyan-950/80 border border-cyan-500/50 rounded-xl p-3 flex items-center justify-between text-xs font-mono text-cyan-200 shadow-lg animate-fade-in">
            <div className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-yellow-400 animate-bounce" />
              <span>{hintMessage.text}</span>
            </div>
            <button
              onClick={() => setHintMessage(null)}
              className="text-cyan-400 hover:text-cyan-200 px-2 py-1 text-xs"
            >
              ✕ Sluiten
            </button>
          </div>
        )}

        {/* Winner Announcement Banner */}
        {winner && (
          <div className="bg-gradient-to-r from-cyan-900/90 via-slate-900 to-amber-900/90 border-2 border-cyan-400/80 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xl animate-fade-in">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-slate-900 border border-cyan-400 flex items-center justify-center text-2xl font-mono font-bold text-cyan-300 shadow-[0_0_15px_#38bdf8]">
                {winner === 'draw' ? '⚖️' : winner === 'X' ? '✕' : '◯'}
              </div>
              <div className="flex flex-col">
                <span className="font-mono font-extrabold text-lg sm:text-xl text-white">
                  {winner === 'draw'
                    ? 'Spel Beëindigd in Gelijkspel (64 cellen gevuld)'
                    : gameMode === 'ai' && winner === humanPiece
                    ? '🎉 Gefeliciteerd! Jij Hebt Gewonnen!'
                    : gameMode === 'ai'
                    ? '💻 C64 Computer Heeft Gewonnen!'
                    : `🎉 Speler ${winner} Heeft Gewonnen!`}
                </span>
                {winningLine && (
                  <span className="text-xs font-mono text-cyan-300">
                    Winnende Lijn: {winningLine.descriptionNl}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleReset}
                className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono font-bold text-sm shadow-[0_0_12px_#38bdf8] transition-colors"
              >
                Opnieuw Spelen
              </button>
            </div>
          </div>
        )}

        {/* Game Boards Display (3D and/or 4-Layer 2D) */}
        <div className={`grid gap-4 flex-grow ${
          viewMode === 'split' 
            ? 'grid-cols-1 lg:grid-cols-12 min-h-[580px]' 
            : 'grid-cols-1 min-h-[550px]'
        }`}>
          {/* 3D Rotating Cube View */}
          {(viewMode === 'split' || viewMode === 'cube') && (
            <div className={`relative bg-slate-950 border border-cyan-500/30 rounded-2xl p-2 sm:p-3 shadow-2xl flex flex-col min-h-[440px] ${
              viewMode === 'split' ? 'lg:col-span-7 h-[460px] lg:h-[580px]' : 'h-[640px]'
            }`}>
              <div className="absolute top-3 left-4 z-10 font-mono text-xs font-semibold text-cyan-300/80 flex items-center gap-1.5">
                <Box className="w-3.5 h-3.5 text-cyan-400" />
                <span>3D Kubus (Sleep om vrij te draaien)</span>
              </div>
              <div className="w-full h-full flex-grow pt-7 flex flex-col min-h-[380px]">
                <Radarsoft3DCubeView
                  board={board}
                  hoveredCell={hoveredCell}
                  onHoverCell={setHoveredCell}
                  onSelectCell={handleSelectCell}
                  winningIndices={winningIndices}
                  winningLine={winningLine}
                  threats={threats}
                  canMakeMove={idx => engineRef.current?.canMakeMove(idx) ?? false}
                />
              </div>
            </div>
          )}

          {/* 4 Layers Grid View */}
          {(viewMode === 'split' || viewMode === 'layers') && (
            <div className={`bg-slate-950 border border-slate-800 rounded-2xl p-3 sm:p-4 shadow-2xl flex flex-col justify-between gap-3 ${
              viewMode === 'split' ? 'lg:col-span-5' : 'w-full'
            }`}>
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2 font-mono text-xs font-semibold text-slate-300">
                  <Layers className="w-4 h-4 text-cyan-400" />
                  <span>4 Verticale Lagen (Klik op een cel om te zetten)</span>
                </div>
                <span className="text-[11px] font-mono text-slate-400">
                  64 Posities
                </span>
              </div>

              {/* 4 Layer Grids */}
              <div className="w-full flex-grow flex items-center justify-center">
                <RadarsoftLayerBoards
                  board={board}
                  hoveredCell={hoveredCell}
                  onHoverCell={setHoveredCell}
                  onSelectCell={handleSelectCell}
                  winningIndices={winningIndices}
                  winningLine={winningLine}
                  threats={threats}
                  canMakeMove={idx => engineRef.current?.canMakeMove(idx) ?? false}
                />
              </div>

              {/* Quick Strategy Legend */}
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800 text-[11px] font-mono text-slate-400">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                  <span>Speler X (Blauw)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  <span>Speler O (Amber)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                  <span>Directe Dreiging</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Interactive Action Bar */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 flex flex-wrap items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-cyan-400 font-mono text-xs transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
              <span>Nieuw Spel</span>
            </button>

            <button
              onClick={handleUndo}
              disabled={moveHistory.length === 0 || isThinking}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 text-slate-200 border border-slate-700 font-mono text-xs transition-colors"
            >
              <span>↩ Zet Terug</span>
            </button>

            <button
              onClick={handleHint}
              disabled={winner !== null || isThinking}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-950/60 hover:bg-amber-900/60 text-amber-300 border border-amber-600/40 font-mono text-xs transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Tip / Hint</span>
            </button>
          </div>

          {/* Move Log preview */}
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400 overflow-x-auto max-w-full">
            <span>Laatste Zetten:</span>
            {moveHistory.slice(-5).map((m, i) => (
              <span 
                key={i} 
                className={`px-1.5 py-0.5 rounded font-mono text-[11px] border ${
                  m.player === 'X' 
                    ? 'bg-cyan-950/80 text-cyan-300 border-cyan-700/50' 
                    : 'bg-amber-950/80 text-amber-300 border-amber-700/50'
                }`}
              >
                {m.player}: {m.notation}
              </span>
            ))}
            {moveHistory.length === 0 && <span className="italic text-slate-500">Nog geen zetten gedaan</span>}
          </div>
        </div>
      </div>

      {/* Rules & Strategy Modal */}
      {showRulesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border-2 border-cyan-500/60 rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2 font-mono font-bold text-cyan-300">
                <HelpCircle className="w-5 h-5 text-cyan-400" />
                <span>Spelregels & De 76 Winlijnen van 3D Tic Tac Toe</span>
              </div>
              <button
                onClick={() => setShowRulesModal(false)}
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center font-mono"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 font-mono text-xs text-slate-300 leading-relaxed">
              <section>
                <h4 className="font-bold text-sm text-cyan-400 mb-1">Doel van het Spel</h4>
                <p>
                  In 3D Tic Tac Toe (ook wel bekend als <em>Qubic</em>) speel je in een 3D-kubus van 4×4×4 posities (in totaal 64 vakjes over 4 verticale niveaus). De speler die als eerste <strong>4 eigen stukken op één rechte lijn</strong> plaatst wint direct!
                </p>
              </section>

              <section className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 space-y-2">
                <h4 className="font-bold text-sm text-amber-400">Wiskundige Anatomie: 76 Winlijnen</h4>
                <ul className="list-disc list-inside space-y-1 text-slate-300">
                  <li><strong>48 Axiale Lijnen:</strong> 16 horizontaal over rijen (X), 16 in diepte over kolommen (Y) en 16 verticale kolommen/pilaren die alle 4 lagen verbinden (Z).</li>
                  <li><strong>24 Vlakke Diagonalen:</strong> 8 diagonalen binnen de 4 platte lagen (XY), 8 schuine diagonalen van voor naar achter (XZ), en 8 schuine diagonalen van links naar rechts (YZ).</li>
                  <li><strong>4 Ruimtelijke 3D Hoofddiagonalen:</strong> Lopen dwars door het hart van de kubus van een uiterste hoek naar de tegenovergestelde tegenhoek (bijv. L1-A1 naar L4-D4).</li>
                </ul>
              </section>

              <section>
                <h4 className="font-bold text-sm text-cyan-400 mb-1">Strategische Tips van Radarsoft</h4>
                <p>
                  Niet alle posities zijn gelijkwaardig!
                </p>
                <ul className="list-disc list-inside space-y-1 mt-1 text-slate-300">
                  <li><strong>Hoekpunten (8 stuks) & Binnenste Kern (8 stuks):</strong> Hebben elk maar liefst <strong>7 winlijnen</strong> die erdoorheen lopen! Dit zijn de krachtigste strategische ankerpunten in het spel.</li>
                  <li><strong>Rand- en Vlakcentra (48 stuks):</strong> Hebben elk 4 winlijnen.</li>
                  <li><strong>Vorken Creëren:</strong> Probeer tegelijk twee afzonderlijke 3-op-een-rij dreigingen te forceren. De tegenstander kan er immers slechts één per beurt blokkeren!</li>
                </ul>
              </section>
            </div>

            <div className="p-4 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setShowRulesModal(false)}
                className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-mono font-bold text-xs"
              >
                Begrepen, Terug naar het Spel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Leaderboard Modal */}
      {showScoresModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border-2 border-amber-500/60 rounded-2xl max-w-lg w-full flex flex-col shadow-2xl">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2 font-mono font-bold text-amber-300">
                <Trophy className="w-5 h-5 text-amber-400" />
                <span>Radarsoft Toprecords (1984 - Heden)</span>
              </div>
              <button
                onClick={() => setShowScoresModal(false)}
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center font-mono"
              >
                ✕
              </button>
            </div>

            <div className="p-4 space-y-2 max-h-[60vh] overflow-y-auto font-mono text-xs">
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
                      <span className="text-[10px] text-slate-400">{entry.note || entry.mode}</span>
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
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-xs"
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
