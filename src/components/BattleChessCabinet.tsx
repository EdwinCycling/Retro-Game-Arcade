/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ChessPiece,
  PieceColor,
  PieceType,
  BoardState,
  ChessMove,
  BattleAnimation,
  AIDifficulty
} from '../game/battleChessTypes';
import {
  createInitialBoard,
  getLegalMovesForPiece,
  getAllLegalMoves,
  applyMoveSimulated,
  isInCheck,
  getComputerMove,
  generateBattleAnimation,
  toSquareName
} from '../game/battleChessEngine';
import { battleChessAudio } from '../game/battleChessAudio';
import { recordBattleChessWin } from '../game/battleChessHighScores';
import { BattleChessHistoryModal } from './BattleChessHistoryModal';
import { GameControlsModal, useGameControls } from './GameControlsModal';
import {
  Swords,
  RotateCcw,
  Volume2,
  VolumeX,
  Sparkles,
  Info,
  ChevronLeft,
  Tv,
  Flag,
  Users,
  Bot,
  HelpCircle,
  Play
} from 'lucide-react';
import { Language } from '../i18n/lobbyTranslations';

interface BattleChessCabinetProps {
  onBackToLobby: () => void;
  lang?: Language;
}

const PIECE_SYMBOLS: Record<PieceType, { w: string; b: string }> = {
  pawn: { w: '♙', b: '♟' },
  knight: { w: '♘', b: '♞' },
  bishop: { w: '♗', b: '♝' },
  rook: { w: '♖', b: '♜' },
  queen: { w: '♕', b: '♛' },
  king: { w: '♔', b: '♚' },
};

const PIECE_NAMES: Record<PieceType, { nl: string; en: string }> = {
  pawn: { nl: 'Pion', en: 'Pawn' },
  knight: { nl: 'Paard', en: 'Knight' },
  bishop: { nl: 'Loper', en: 'Bishop' },
  rook: { nl: 'Toren', en: 'Rook' },
  queen: { nl: 'Koningin', en: 'Queen' },
  king: { nl: 'Koning', en: 'King' },
};

export const BattleChessCabinet: React.FC<BattleChessCabinetProps> = ({
  onBackToLobby,
  lang = 'nl',
}) => {
  // Game State
  const [board, setBoard] = useState<BoardState>(() => createInitialBoard());
  const [currentTurn, setCurrentTurn] = useState<PieceColor>('w');
  const [selectedPos, setSelectedPos] = useState<{ row: number; col: number } | null>(null);
  const [legalMoves, setLegalMoves] = useState<ChessMove[]>([]);
  const [moveHistory, setMoveHistory] = useState<ChessMove[]>([]);
  const [lastMove, setLastMove] = useState<ChessMove | null>(null);
  
  // Settings & Options
  const [difficulty, setDifficulty] = useState<AIDifficulty>('knight');
  const [playerColor, setPlayerColor] = useState<PieceColor>('w');
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [crtEnabled, setCrtEnabled] = useState<boolean>(true);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState<boolean>(false);
  const { showControls, setShowControls } = useGameControls('battle_chess');

  // Status & Battle Animations
  const [activeBattle, setActiveBattle] = useState<BattleAnimation | null>(null);
  const [gameResult, setGameResult] = useState<'checkmate_white' | 'checkmate_black' | 'stalemate' | null>(null);
  const [isThinking, setIsThinking] = useState<boolean>(false);
  const [hintMove, setHintMove] = useState<ChessMove | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>(
    lang === 'nl' ? 'Welkom bij Battle Chess (1988). Wit is aan zet!' : 'Welcome to Battle Chess (1988). White to move!'
  );

  // Captured pieces storage
  const [capturedByWhite, setCapturedByWhite] = useState<ChessPiece[]>([]);
  const [capturedByBlack, setCapturedByBlack] = useState<ChessPiece[]>([]);

  // Check state
  const whiteInCheck = isInCheck('w', board);
  const blackInCheck = isInCheck('b', board);

  // Sound mute sync
  useEffect(() => {
    battleChessAudio.setMuted(isMuted);
  }, [isMuted]);

  // Handle game over detection
  const checkGameOver = useCallback((nextBoard: BoardState, nextTurn: PieceColor, historyLen: number, totalCaptures: number) => {
    const legalNext = getAllLegalMoves(nextTurn, nextBoard, lastMove);
    if (legalNext.length === 0) {
      if (isInCheck(nextTurn, nextBoard)) {
        // Checkmate!
        battleChessAudio.playVictoryFanfare();
        if (nextTurn === 'b') {
          setGameResult('checkmate_white');
          setStatusMessage(lang === 'nl' ? 'SCHAAKMAT! Wit heeft de veldslag gewonnen!' : 'CHECKMATE! White triumphs!');
          recordBattleChessWin('w', historyLen, totalCaptures);
        } else {
          setGameResult('checkmate_black');
          setStatusMessage(lang === 'nl' ? 'SCHAAKMAT! Zwart heeft de veldslag gewonnen!' : 'CHECKMATE! Black triumphs!');
          recordBattleChessWin('b', historyLen, totalCaptures);
        }
      } else {
        // Stalemate
        setGameResult('stalemate');
        setStatusMessage(lang === 'nl' ? 'PAT! De veldslag eindigt in remise!' : 'STALEMATE! The battle ends in a draw!');
        recordBattleChessWin('draw', historyLen, totalCaptures);
      }
      return true;
    }
    return false;
  }, [lang, lastMove]);

  // Execute a chess move
  const executeMove = useCallback((move: ChessMove) => {
    setHintMove(null);
    setSelectedPos(null);
    setLegalMoves([]);

    const hasCapture = !!move.captured;
    const attacker = move.piece;
    const defender = move.captured;

    // If capture, trigger Battle Chess Animation!
    if (hasCapture && defender) {
      const battle = generateBattleAnimation(
        attacker,
        defender,
        toSquareName(move.from.row, move.from.col),
        toSquareName(move.to.row, move.to.col)
      );
      setActiveBattle(battle);

      // Play audio effect according to battle action
      if (battle.actionType === 'crush') battleChessAudio.playStoneCrush();
      else if (battle.actionType === 'zap') battleChessAudio.playMagicZap();
      else if (battle.actionType === 'staff') battleChessAudio.playStaffBonk();
      else battleChessAudio.playSwordClash();

      // Apply board update after animation
      setTimeout(() => {
        const nextBoard = applyMoveSimulated(board, move);
        setBoard(nextBoard);
        setLastMove(move);
        const nextHistory = [...moveHistory, move];
        setMoveHistory(nextHistory);

        if (attacker.color === 'w') {
          setCapturedByWhite(prev => [...prev, defender]);
        } else {
          setCapturedByBlack(prev => [...prev, defender]);
        }

        setActiveBattle(null);
        const nextTurn: PieceColor = attacker.color === 'w' ? 'b' : 'w';
        setCurrentTurn(nextTurn);

        const totalCaptures = capturedByWhite.length + capturedByBlack.length + 1;
        const isOver = checkGameOver(nextBoard, nextTurn, nextHistory.length, totalCaptures);
        if (!isOver) {
          if (isInCheck(nextTurn, nextBoard)) {
            battleChessAudio.playCheck();
            setStatusMessage(
              nextTurn === 'w'
                ? (lang === 'nl' ? 'SCHAAK! Koning Edward staat onder aanval!' : 'CHECK! White King in peril!')
                : (lang === 'nl' ? 'SCHAAK! Zwarte Koning staat onder vuur!' : 'CHECK! Black King under siege!')
            );
          } else {
            setStatusMessage(
              nextTurn === 'w'
                ? (lang === 'nl' ? 'Wit is aan de beurt.' : 'White to move.')
                : (lang === 'nl' ? 'Zwart is aan de beurt.' : 'Black to move.')
            );
          }
        }
      }, battle.durationMs);
    } else {
      // Regular Move without capture
      battleChessAudio.playMove();
      const nextBoard = applyMoveSimulated(board, move);
      setBoard(nextBoard);
      setLastMove(move);
      const nextHistory = [...moveHistory, move];
      setMoveHistory(nextHistory);

      const nextTurn: PieceColor = attacker.color === 'w' ? 'b' : 'w';
      setCurrentTurn(nextTurn);

      const totalCaptures = capturedByWhite.length + capturedByBlack.length;
      const isOver = checkGameOver(nextBoard, nextTurn, nextHistory.length, totalCaptures);
      if (!isOver) {
        if (isInCheck(nextTurn, nextBoard)) {
          battleChessAudio.playCheck();
          setStatusMessage(
            nextTurn === 'w'
              ? (lang === 'nl' ? 'SCHAAK! Koning Edward staat onder aanval!' : 'CHECK! White King in peril!')
              : (lang === 'nl' ? 'SCHAAK! Zwarte Koning staat onder vuur!' : 'CHECK! Black King under siege!')
          );
        } else {
          setStatusMessage(
            nextTurn === 'w'
              ? (lang === 'nl' ? 'Wit is aan de beurt.' : 'White to move.')
              : (lang === 'nl' ? 'Zwart is aan de beurt.' : 'Black to move.')
          );
        }
      }
    }
  }, [board, moveHistory, capturedByWhite, capturedByBlack, checkGameOver, lang]);

  // AI Turn triggering
  useEffect(() => {
    if (gameResult || activeBattle) return;
    if (difficulty === 'two_player') return;

    const isAiTurn = currentTurn !== playerColor;
    if (isAiTurn) {
      setIsThinking(true);
      const thinkTimer = setTimeout(() => {
        const aiMove = getComputerMove(board, difficulty, currentTurn, lastMove);
        setIsThinking(false);
        if (aiMove) {
          executeMove(aiMove);
        }
      }, 500 + (difficulty === 'grandmaster' ? 400 : 200));

      return () => clearTimeout(thinkTimer);
    }
  }, [currentTurn, difficulty, playerColor, board, gameResult, activeBattle, lastMove, executeMove]);

  // User click on square
  const handleSquareClick = (r: number, c: number) => {
    if (gameResult || activeBattle || isThinking) return;
    if (difficulty !== 'two_player' && currentTurn !== playerColor) return;

    const clickedPiece = board[r][c];

    // If square is one of current legal moves, execute it!
    const targetMove = legalMoves.find(m => m.to.row === r && m.to.col === c);
    if (targetMove) {
      executeMove(targetMove);
      return;
    }

    // Select piece if it's the current player's piece
    if (clickedPiece && clickedPiece.color === currentTurn) {
      battleChessAudio.playClick();
      setSelectedPos({ row: r, col: c });
      const moves = getLegalMovesForPiece(r, c, board, lastMove);
      setLegalMoves(moves);
    } else {
      setSelectedPos(null);
      setLegalMoves([]);
    }
  };

  // Reset / New Game
  const handleNewGame = () => {
    battleChessAudio.playClick();
    setBoard(createInitialBoard());
    setCurrentTurn('w');
    setSelectedPos(null);
    setLegalMoves([]);
    setMoveHistory([]);
    setLastMove(null);
    setActiveBattle(null);
    setGameResult(null);
    setIsThinking(false);
    setHintMove(null);
    setCapturedByWhite([]);
    setCapturedByBlack([]);
    setStatusMessage(lang === 'nl' ? 'Nieuw spel gestart! Wit mag openen.' : 'New game started! White begins.');
  };

  // Ask for Hint / Wizard Advice
  const handleAskWizardHint = () => {
    battleChessAudio.playClick();
    const best = getComputerMove(board, 'grandmaster', currentTurn, lastMove);
    if (best) {
      setHintMove(best);
      setStatusMessage(
        lang === 'nl'
          ? `De Tovenaar adviseert: Verplaats ${best.piece.type} van ${toSquareName(best.from.row, best.from.col)} naar ${toSquareName(best.to.row, best.to.col)}!`
          : `Merlin the Wizard advises: Move ${best.piece.type} from ${toSquareName(best.from.row, best.from.col)} to ${toSquareName(best.to.row, best.to.col)}!`
      );
    }
  };

  // Undo Last Move
  const handleUndo = () => {
    if (moveHistory.length === 0 || activeBattle) return;
    battleChessAudio.playClick();

    // In vs AI mode, undo 2 moves (both AI and Player)
    const undoCount = difficulty !== 'two_player' && moveHistory.length >= 2 ? 2 : 1;
    const newHistory = moveHistory.slice(0, -undoCount);

    let replayBoard = createInitialBoard();
    for (const m of newHistory) {
      replayBoard = applyMoveSimulated(replayBoard, m);
    }

    // Reconstruct captured
    const capW: ChessPiece[] = [];
    const capB: ChessPiece[] = [];
    for (const m of newHistory) {
      if (m.captured) {
        if (m.piece.color === 'w') capW.push(m.captured);
        else capB.push(m.captured);
      }
    }

    setBoard(replayBoard);
    setMoveHistory(newHistory);
    setLastMove(newHistory.length > 0 ? newHistory[newHistory.length - 1] : null);
    setCapturedByWhite(capW);
    setCapturedByBlack(capB);
    setCurrentTurn(newHistory.length % 2 === 0 ? 'w' : 'b');
    setGameResult(null);
    setSelectedPos(null);
    setLegalMoves([]);
    setHintMove(null);
    setStatusMessage(lang === 'nl' ? 'Zet teruggedraaid.' : 'Move undone.');
  };

  return (
    <div className="relative min-h-screen bg-neutral-950 text-neutral-100 flex flex-col items-center justify-between p-2 sm:p-4 md:p-6 select-none font-sans overflow-x-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />

      {/* 1. TOP CABINET MARQUEE */}
      <header className="relative z-10 w-full max-w-6xl rounded-2xl bg-neutral-900/90 border-2 border-emerald-600/80 shadow-[0_0_30px_rgba(16,185,129,0.3)] p-3 sm:p-4 mb-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBackToLobby}
            className="px-3 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 font-mono text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
          >
            <ChevronLeft className="w-4 h-4 text-emerald-400" />
            <span>{lang === 'nl' ? 'Speelhal' : 'Lobby'}</span>
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 text-black font-mono font-black text-2xl flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.5)]">
              ♟️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-mono font-black text-lg sm:text-2xl text-white tracking-wider flex items-center gap-2">
                  <span>BATTLE CHESS</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-emerald-950 border border-emerald-700 text-emerald-300 font-bold hidden sm:inline-block">
                    1988 INTERPLAY
                  </span>
                </h1>
              </div>
              <p className="text-[11px] font-mono text-emerald-400/90">
                {lang === 'nl' ? 'Geanimeerde EGA Schaak Oorlog • Brian Fargo' : 'Animated EGA Chess Battles • Brian Fargo'}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Tools & Toggles */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setCrtEnabled(prev => !prev)}
            className={`p-2 rounded-xl border font-mono text-xs font-bold transition-all cursor-pointer ${
              crtEnabled
                ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.4)]'
                : 'bg-neutral-800 border-neutral-700 text-neutral-400'
            }`}
            title="CRT Monitor Filter"
          >
            <Tv className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => setIsMuted(prev => !prev)}
            className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-neutral-200 transition-all cursor-pointer"
            title={isMuted ? 'Geluid Aanzetten' : 'Geluid Dempen'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>

          <button
            type="button"
            onClick={() => setShowControls(true)}
            className="px-3 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-yellow-400 font-mono text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            title="Besturing & Xbox Controller"
          >
            <HelpCircle className="w-4 h-4 text-yellow-400" />
            <span className="hidden sm:inline">Besturing</span>
          </button>

          <button
            type="button"
            onClick={() => setIsHistoryModalOpen(true)}
            className="px-3 py-2 rounded-xl bg-emerald-950/70 hover:bg-emerald-900 border border-emerald-600/70 text-emerald-300 font-mono text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Info className="w-4 h-4 text-emerald-400" />
            <span>Dossier</span>
          </button>
        </div>
      </header>

      {/* 2. MAIN BATTLE & BOARD WORKSPACE */}
      <main className="relative z-10 w-full max-w-6xl flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        
        {/* LEFT / CENTER: CHESSBOARD + BATTLE STAGE (Col 8) */}
        <div className="lg:col-span-8 flex flex-col items-center space-y-3">
          
          {/* Status Bar / Turn Announcer */}
          <div className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 font-mono text-xs shadow-inner">
            <div className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${currentTurn === 'w' ? 'bg-amber-300 shadow-[0_0_8px_#fde047]' : 'bg-emerald-500 shadow-[0_0_8px_#10b981]'}`} />
              <span className="font-bold text-white uppercase">
                {currentTurn === 'w' ? (lang === 'nl' ? 'Wit aan zet' : 'White to Move') : (lang === 'nl' ? 'Zwart aan zet' : 'Black to Move')}
              </span>
              {isThinking && (
                <span className="px-2 py-0.5 rounded bg-amber-950/90 text-amber-300 text-[10px] font-bold animate-pulse border border-amber-800">
                  {lang === 'nl' ? 'AI BEREKENT ZET...' : 'AI THINKING...'}
                </span>
              )}
            </div>

            <div className="text-[11px] text-neutral-400 truncate max-w-[240px] sm:max-w-xs text-right font-mono">
              {statusMessage}
            </div>
          </div>

          {/* CHESS BOARD WRAPPER WITH RETRO CRT EFFECT */}
          <div className="relative p-3 sm:p-4 rounded-3xl bg-gradient-to-b from-neutral-800 via-neutral-900 to-black border-4 border-neutral-700 shadow-[0_0_40px_rgba(0,0,0,0.8)] overflow-hidden">
            
            {/* Optional CRT Scanlines */}
            {crtEnabled && (
              <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.35)_50%)] bg-[length:100%_4px] pointer-events-none z-30" />
            )}

            {/* BATTLE CHESS COMBAT ARENA OVERLAY (Plays during captures!) */}
            {activeBattle && (
              <div className="absolute inset-0 z-40 bg-black/90 backdrop-blur-sm flex flex-col items-center justify-center p-4 text-center animate-fade-in">
                <div className="w-full max-w-md p-5 rounded-2xl bg-gradient-to-b from-emerald-950/90 via-neutral-900 to-black border-2 border-emerald-500 shadow-[0_0_35px_rgba(16,185,129,0.6)] space-y-4">
                  <div className="flex items-center justify-between border-b border-emerald-800/60 pb-2 text-emerald-400 font-mono text-xs font-bold tracking-widest uppercase">
                    <span className="flex items-center gap-1.5">
                      <Swords className="w-4 h-4 text-emerald-400 animate-bounce" />
                      <span>BATTLE STAGE</span>
                    </span>
                    <span className="text-yellow-400 font-black">{activeBattle.toSquare.toUpperCase()}</span>
                  </div>

                  {/* Dramatic Combatants Graphic */}
                  <div className="flex items-center justify-around py-3">
                    <div className="flex flex-col items-center space-y-1">
                      <div className="text-5xl filter drop-shadow-[0_0_12px_rgba(255,255,255,0.6)] animate-pulse">
                        {PIECE_SYMBOLS[activeBattle.attacker.type][activeBattle.attacker.color]}
                      </div>
                      <span className="font-mono text-xs font-bold text-white">
                        {activeBattle.attacker.color === 'w' ? 'White' : 'Black'} {PIECE_NAMES[activeBattle.attacker.type][lang]}
                      </span>
                    </div>

                    <div className="text-2xl font-mono font-black text-red-500 animate-ping">
                      VS
                    </div>

                    <div className="flex flex-col items-center space-y-1 opacity-70">
                      <div className="text-5xl filter drop-shadow-[0_0_12px_rgba(239,68,68,0.5)]">
                        {PIECE_SYMBOLS[activeBattle.defender.type][activeBattle.defender.color]}
                      </div>
                      <span className="font-mono text-xs font-bold text-neutral-400 line-through">
                        {activeBattle.defender.color === 'w' ? 'White' : 'Black'} {PIECE_NAMES[activeBattle.defender.type][lang]}
                      </span>
                    </div>
                  </div>

                  {/* Battle Narrative */}
                  <div className="p-3 rounded-xl bg-black/70 border border-emerald-800 text-xs font-mono text-emerald-200 leading-relaxed">
                    {activeBattle.narrative[lang]}
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveBattle(null)}
                    className="px-4 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-mono text-[11px] font-bold cursor-pointer transition-colors"
                  >
                    {lang === 'nl' ? 'Gevecht Overslaan ⏭️' : 'Skip Animation ⏭️'}
                  </button>
                </div>
              </div>
            )}

            {/* 8x8 CHESSBOARD GRID */}
            <div className="relative bg-[#1A1A1A] p-2 rounded-xl border border-neutral-700">
              
              {/* File Coordinates (a-h) Top */}
              <div className="grid grid-cols-8 text-center text-[10px] font-mono text-neutral-400 font-bold pb-1">
                {['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'].map((f, i) => {
                  const label = isFlipped ? ['h', 'g', 'f', 'e', 'd', 'c', 'b', 'a'][i] : f;
                  return <div key={f}>{label}</div>;
                })}
              </div>

              <div className="grid grid-cols-8 grid-rows-8 gap-0 border-2 border-neutral-900 rounded shadow-2xl overflow-hidden w-[290px] h-[290px] sm:w-[380px] sm:h-[380px] md:w-[440px] md:h-[440px]">
                {Array(8).fill(0).map((_, visualRow) => {
                  return Array(8).fill(0).map((_, visualCol) => {
                    const row = isFlipped ? 7 - visualRow : visualRow;
                    const col = isFlipped ? 7 - visualCol : visualCol;
                    const squareName = toSquareName(row, col);

                    const piece = board[row][col];
                    const isDark = (row + col) % 2 === 1;

                    // Highlights
                    const isSelected = selectedPos?.row === row && selectedPos?.col === col;
                    const isLegalDest = legalMoves.some(m => m.to.row === row && m.to.col === col);
                    const isCaptureTarget = isLegalDest && !!piece;
                    const isLastMoveFrom = lastMove?.from.row === row && lastMove?.from.col === col;
                    const isLastMoveTo = lastMove?.to.row === row && lastMove?.to.col === col;
                    const isHint = (hintMove?.from.row === row && hintMove?.from.col === col) ||
                                   (hintMove?.to.row === row && hintMove?.to.col === col);
                    const isKingInCheckSquare = piece?.type === 'king' && 
                      ((piece.color === 'w' && whiteInCheck) || (piece.color === 'b' && blackInCheck));

                    // Retro EGA Marble / Slate Colors
                    const baseSquareColor = isDark 
                      ? 'bg-[#1E3A2F]' // Dark EGA Forest Green
                      : 'bg-[#D6CEAA]'; // Warm Parchment Ivory

                    return (
                      <button
                        key={`${row}-${col}`}
                        type="button"
                        onClick={() => handleSquareClick(row, col)}
                        className={`relative flex items-center justify-center transition-all cursor-pointer ${baseSquareColor} ${
                          isSelected ? 'ring-4 ring-yellow-400 z-10 brightness-110' : ''
                        } ${
                          isLastMoveTo || isLastMoveFrom ? 'bg-opacity-80 after:absolute after:inset-0 after:bg-yellow-500/25' : ''
                        } ${
                          isHint ? 'ring-2 ring-cyan-400 animate-pulse' : ''
                        } ${
                          isKingInCheckSquare ? 'ring-4 ring-red-600 bg-red-900/60 animate-bounce' : ''
                        }`}
                      >
                        {/* Legal Move Indicator */}
                        {isLegalDest && !isCaptureTarget && (
                          <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-emerald-500/70 shadow-[0_0_8px_rgba(16,185,129,0.8)] z-10 pointer-events-none" />
                        )}

                        {/* Capture Target Ring */}
                        {isCaptureTarget && (
                          <div className="absolute inset-1 rounded border-2 border-red-500/90 shadow-[0_0_12px_rgba(239,68,68,0.8)] z-10 pointer-events-none animate-pulse" />
                        )}

                        {/* Chess Piece Symbol */}
                        {piece && (
                          <span
                            className={`text-2xl sm:text-3xl md:text-4xl font-black select-none transition-transform active:scale-90 ${
                              piece.color === 'w'
                                ? 'text-[#FAF5E4] filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]'
                                : 'text-[#121212] filter drop-shadow-[0_2px_3px_rgba(255,255,255,0.4)]'
                            }`}
                          >
                            {PIECE_SYMBOLS[piece.type][piece.color]}
                          </span>
                        )}

                        {/* Rank coordinate on right edge */}
                        {visualCol === 7 && (
                          <span className="absolute bottom-0.5 right-1 text-[8px] font-mono font-bold opacity-40 text-neutral-800 pointer-events-none">
                            {8 - row}
                          </span>
                        )}
                      </button>
                    );
                  });
                })}
              </div>

              {/* File Coordinates (a-h) Bottom */}
              <div className="grid grid-cols-8 text-center text-[10px] font-mono text-neutral-400 font-bold pt-1">
                {['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'].map((f, i) => {
                  const label = isFlipped ? ['h', 'g', 'f', 'e', 'd', 'c', 'b', 'a'][i] : f;
                  return <div key={f}>{label}</div>;
                })}
              </div>
            </div>

          </div>

          {/* Captured Pieces Cemetery Bar */}
          <div className="w-full flex items-center justify-between gap-2 p-3 rounded-2xl bg-neutral-900 border border-neutral-800 text-xs font-mono">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-neutral-500 font-bold mr-1">WIT BUIT:</span>
              {capturedByWhite.length === 0 ? (
                <span className="text-neutral-600">-</span>
              ) : (
                capturedByWhite.map((p, idx) => (
                  <span key={idx} className="text-neutral-400 text-sm">{PIECE_SYMBOLS[p.type]['b']}</span>
                ))
              )}
            </div>

            <div className="flex items-center gap-1.5 flex-wrap justify-end">
              <span className="text-neutral-500 font-bold mr-1">ZWART BUIT:</span>
              {capturedByBlack.length === 0 ? (
                <span className="text-neutral-600">-</span>
              ) : (
                capturedByBlack.map((p, idx) => (
                  <span key={idx} className="text-white text-sm">{PIECE_SYMBOLS[p.type]['w']}</span>
                ))
              )}
            </div>
          </div>

        </div>

        {/* RIGHT: CONTROL PANEL, VINTAGE MOVE LOG & AI DECK (Col 4) */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Game Mode & Difficulty Selector */}
          <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-3">
            <div className="flex items-center justify-between text-xs font-mono text-white font-bold uppercase tracking-wider">
              <span className="flex items-center gap-1.5">
                <Bot className="w-4 h-4 text-emerald-400" />
                <span>{lang === 'nl' ? 'Tegenstander & Niveau' : 'Opponent & Level'}</span>
              </span>
              <span className="text-[10px] text-emerald-400 font-bold">1988 AI</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'novice', name: lang === 'nl' ? 'Schildknaap' : 'Novice', sub: 'Beginner' },
                { id: 'knight', name: lang === 'nl' ? 'Ridder' : 'Knight', sub: 'Tactisch' },
                { id: 'grandmaster', name: lang === 'nl' ? 'Tovenaar' : 'Grandmaster', sub: 'Meester' },
                { id: 'two_player', name: lang === 'nl' ? '2 Spelers' : '2 Players', sub: 'Hotseat' },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    battleChessAudio.playClick();
                    setDifficulty(item.id as AIDifficulty);
                  }}
                  className={`p-2 rounded-xl text-left font-mono transition-all cursor-pointer border ${
                    difficulty === item.id
                      ? 'bg-emerald-950 border-emerald-500 text-white shadow-[0_0_12px_rgba(16,185,129,0.4)] font-bold'
                      : 'bg-black/60 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  <div className="text-xs">{item.name}</div>
                  <div className="text-[10px] text-neutral-500">{item.sub}</div>
                </button>
              ))}
            </div>

            {/* Color Choice in vs AI */}
            {difficulty !== 'two_player' && (
              <div className="flex items-center justify-between pt-1 border-t border-neutral-800 text-xs font-mono">
                <span className="text-neutral-400">{lang === 'nl' ? 'Jouw Kleur:' : 'Your Color:'}</span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      battleChessAudio.playClick();
                      setPlayerColor('w');
                      setIsFlipped(false);
                    }}
                    className={`px-2.5 py-1 rounded text-xs font-bold transition-colors cursor-pointer ${
                      playerColor === 'w' ? 'bg-white text-black font-black' : 'bg-neutral-800 text-neutral-400'
                    }`}
                  >
                    WIT ♙
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      battleChessAudio.playClick();
                      setPlayerColor('b');
                      setIsFlipped(true);
                    }}
                    className={`px-2.5 py-1 rounded text-xs font-bold transition-colors cursor-pointer ${
                      playerColor === 'b' ? 'bg-emerald-500 text-black font-black' : 'bg-neutral-800 text-neutral-400'
                    }`}
                  >
                    ZWART ♟
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Tactical Action Buttons */}
          <div className="grid grid-cols-2 gap-2 font-mono text-xs font-bold">
            <button
              type="button"
              onClick={handleNewGame}
              className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-black shadow-[0_0_15px_rgba(16,185,129,0.5)] transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{lang === 'nl' ? 'Nieuw Spel' : 'New Game'}</span>
            </button>

            <button
              type="button"
              onClick={handleUndo}
              disabled={moveHistory.length === 0}
              className="py-2.5 px-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 disabled:opacity-40 disabled:cursor-not-allowed text-neutral-200 border border-neutral-700 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>{lang === 'nl' ? 'Zet Terug' : 'Undo Move'}</span>
            </button>

            <button
              type="button"
              onClick={handleAskWizardHint}
              disabled={!!gameResult}
              className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-teal-900 to-emerald-950 hover:from-teal-800 hover:to-emerald-900 border border-teal-500/50 text-teal-200 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40"
            >
              <Sparkles className="w-3.5 h-3.5 text-teal-400" />
              <span>{lang === 'nl' ? 'Tovenaar Tip' : 'Merlin Hint'}</span>
            </button>

            <button
              type="button"
              onClick={() => setIsFlipped(prev => !prev)}
              className="py-2.5 px-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{lang === 'nl' ? 'Draai Bord' : 'Flip Board'}</span>
            </button>
          </div>

          {/* VINTAGE DOS TERMINAL MOVE LOG */}
          <div className="p-4 rounded-2xl bg-black border border-emerald-900/60 shadow-[0_0_20px_rgba(0,0,0,0.8)] font-mono space-y-2">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-2 text-xs">
              <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                <span>TERMINAL://MOVE_LOG.EGA</span>
              </span>
              <span className="text-[10px] text-neutral-500">
                {moveHistory.length} {lang === 'nl' ? 'ZETTEN' : 'MOVES'}
              </span>
            </div>

            <div className="h-44 overflow-y-auto space-y-1 text-xs text-emerald-300 pr-1 scrollbar-thin">
              {moveHistory.length === 0 ? (
                <div className="text-neutral-600 text-[11px] py-4 text-center">
                  {lang === 'nl' ? '&gt; Wachten op eerste openingszet...' : '&gt; Awaiting opening move...'}
                </div>
              ) : (
                Array(Math.ceil(moveHistory.length / 2)).fill(0).map((_, turnIdx) => {
                  const whiteMove = moveHistory[turnIdx * 2];
                  const blackMove = moveHistory[turnIdx * 2 + 1];
                  return (
                    <div key={turnIdx} className="flex justify-between py-0.5 border-b border-neutral-900">
                      <span className="text-neutral-500 w-8">{turnIdx + 1}.</span>
                      <span className="text-neutral-100 flex-1 font-bold">
                        {whiteMove?.san || ''}
                      </span>
                      <span className="text-emerald-400 flex-1 font-bold">
                        {blackMove?.san || ''}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>

      </main>

      {/* 3. HISTORY MODAL */}
      <BattleChessHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        lang={lang}
      />

      {/* Game Controls & Xbox Modal */}
      <GameControlsModal
        isOpen={showControls}
        onClose={() => setShowControls(false)}
        gameId="battle_chess"
      />
    </div>
  );
};
