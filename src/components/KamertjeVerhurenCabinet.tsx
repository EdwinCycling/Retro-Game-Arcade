/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Kamertje Verhuren (Dots & Boxes 1895) Cabinet
 * Authentic Graph Paper & Ballpoint Pen Aesthetic
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  HelpCircle, 
  Trophy, 
  Lightbulb, 
  Bot, 
  Users, 
  Sparkles, 
  PenTool, 
  Layers, 
  Award,
  Undo2,
  Share2
} from 'lucide-react';
import { 
  KamertjeVerhurenEngine, 
  PlayerId, 
  LineOrientation, 
  LineCoord, 
  AIDifficulty, 
  GameMode 
} from '../game/kamertjeVerhurenEngine';
import { kamertjeAudio } from '../game/kamertjeVerhurenAudio';
import { 
  getKamertjeHighScores, 
  saveKamertjeHighScore, 
  KamertjeScoreEntry 
} from '../game/kamertjeVerhurenHighScores';
import { KamertjeVerhurenBoardView } from './KamertjeVerhurenBoardView';
import { KamertjeVerhurenHistoryModal } from './KamertjeVerhurenHistoryModal';
import { haptics } from '../utils/haptics';

interface KamertjeVerhurenCabinetProps {
  onBackToLobby: () => void;
}

export const KamertjeVerhurenCabinet: React.FC<KamertjeVerhurenCabinetProps> = ({ onBackToLobby }) => {
  const engineRef = useRef<KamertjeVerhurenEngine | null>(null);

  // Board state
  const [gridSize, setGridSize] = useState<number>(4);
  const [gameMode, setGameMode] = useState<GameMode>('vs_ai');
  const [difficulty, setDifficulty] = useState<AIDifficulty>('tactician');
  const [currentTurn, setCurrentTurn] = useState<PlayerId>('P1');
  const [p1Score, setP1Score] = useState<number>(0);
  const [p2Score, setP2Score] = useState<number>(0);
  const [comboCount, setComboCount] = useState<number>(0);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [isThinking, setIsThinking] = useState<boolean>(false);
  const [aiTurnCount, setAiTurnCount] = useState<number>(0);
  const [hoveredLine, setHoveredLine] = useState<LineCoord | null>(null);
  const [hintMessage, setHintMessage] = useState<string | null>(null);
  const [turnMessage, setTurnMessage] = useState<string>('Jij begint! Teken het eerste lijntje.');

  // Lines & Boxes
  const [hLines, setHLines] = useState<readonly (readonly (PlayerId | null)[])[]>([]);
  const [vLines, setVLines] = useState<readonly (readonly (PlayerId | null)[])[]>([]);
  const [boxes, setBoxes] = useState<readonly (readonly (PlayerId | null)[])[]>([]);

  // Settings & Modals
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [showHistoryModal, setShowHistoryModal] = useState<boolean>(false);
  const [showScoresModal, setShowScoresModal] = useState<boolean>(false);
  const [highScores, setHighScores] = useState<KamertjeScoreEntry[]>([]);
  const [initialsInput, setInitialsInput] = useState<string>('EDW');
  const [hasSavedScore, setHasSavedScore] = useState<boolean>(false);

  // Initialize engine
  useEffect(() => {
    const engine = new KamertjeVerhurenEngine(gridSize, gameMode, difficulty);
    engineRef.current = engine;
    syncState();
    setHighScores(getKamertjeHighScores());
    setIsMuted(kamertjeAudio.getMuted());
    setTurnMessage('Nieuw blad! Blauwe pen begint.');
  }, [gridSize, gameMode, difficulty]);

  // Sync state from engine
  const syncState = () => {
    if (!engineRef.current) return;
    const eng = engineRef.current;
    setCurrentTurn(eng.getCurrentTurn());
    setP1Score(eng.getP1Score());
    setP2Score(eng.getP2Score());
    setComboCount(eng.getComboCount());
    setIsGameOver(eng.getIsGameOver());
    setHLines([...eng.getHorizontalLines()]);
    setVLines([...eng.getVerticalLines()]);
    setBoxes([...eng.getBoxes()]);
  };

  // Trigger AI Turn with authentic drawing cadence & loop if AI scores a room
  useEffect(() => {
    if (isGameOver || gameMode !== 'vs_ai' || currentTurn !== 'P2' || !engineRef.current) {
      setIsThinking(false);
      return;
    }

    setIsThinking(true);
    const thinkDelay = 450 + Math.random() * 250; // 450-700ms realistic pen stroke timing

    const timer = setTimeout(() => {
      if (!engineRef.current || engineRef.current.getIsGameOver() || engineRef.current.getCurrentTurn() !== 'P2') {
        setIsThinking(false);
        return;
      }

      const aiMove = engineRef.current.computeAIMove();
      if (aiMove) {
        kamertjeAudio.playPenDraw();
        const result = engineRef.current.makeMove(aiMove.orientation, aiMove.row, aiMove.col);
        
        if (result.boxesCompleted > 0) {
          kamertjeAudio.playBoxClaimed(engineRef.current.getComboCount());
          if (engineRef.current.getComboCount() >= 3) {
            kamertjeAudio.playChainStreak(engineRef.current.getComboCount());
          }
          setTurnMessage(`⚡ AI verovert een kamer en tekent direct door! (${engineRef.current.getComboCount()} in rij)`);
        } else {
          setTurnMessage('Jouw beurt! Teken een lijntje met de blauwe pen.');
        }

        syncState();

        if (engineRef.current.getIsGameOver()) {
          kamertjeAudio.playVictory();
          setHasSavedScore(false);
          setIsThinking(false);
        } else if (result.extraTurn) {
          // AI gets another turn! Increment turn counter to trigger next AI move in useEffect
          setAiTurnCount(prev => prev + 1);
        } else {
          setIsThinking(false);
        }
      } else {
        setIsThinking(false);
      }
    }, thinkDelay);

    return () => clearTimeout(timer);
  }, [currentTurn, gameMode, isGameOver, aiTurnCount]);

  // Player click on line
  const handleLineClick = (orientation: LineOrientation, r: number, c: number) => {
    if (isThinking || isGameOver || !engineRef.current) return;
    if (gameMode === 'vs_ai' && currentTurn !== 'P1') return;

    if (!engineRef.current.isLineAvailable(orientation, r, c)) return;

    kamertjeAudio.playPenDraw();
    haptics.light();
    setHintMessage(null);

    const result = engineRef.current.makeMove(orientation, r, c);
    
    if (result.boxesCompleted > 0) {
      kamertjeAudio.playBoxClaimed(engineRef.current.getComboCount());
      haptics.success();
      if (engineRef.current.getComboCount() >= 3) {
        kamertjeAudio.playChainStreak(engineRef.current.getComboCount());
      }
      setTurnMessage(`🎉 KAMER VERHUURD! Bonusbeurt: je mag direct nóg een lijntje zetten! (${engineRef.current.getComboCount()}x ketting)`);
    } else {
      if (gameMode === 'vs_ai') {
        setTurnMessage('AI is aan de beurt en denkt na over een lijntje...');
      } else {
        setTurnMessage(engineRef.current.getCurrentTurn() === 'P1' ? 'Speler 1 (Blauw) is aan de beurt.' : 'Speler 2 (Rood) is aan de beurt.');
      }
    }

    syncState();

    if (engineRef.current.getIsGameOver()) {
      kamertjeAudio.playVictory();
      setHasSavedScore(false);
    }
  };

  // Reset / New Sheet
  const handleReset = () => {
    if (!engineRef.current) return;
    kamertjeAudio.playPageTurn();
    haptics.selection();
    engineRef.current.initBoard();
    setHintMessage(null);
    setHasSavedScore(false);
    syncState();
  };

  // Undo Move
  const handleUndo = () => {
    if (!engineRef.current || isThinking) return;
    kamertjeAudio.playPenDraw();
    haptics.selection();
    // If vs AI, undo twice to get back to player's turn
    if (gameMode === 'vs_ai') {
      engineRef.current.undo();
      if (engineRef.current.getCurrentTurn() === 'P2') {
        engineRef.current.undo();
      }
    } else {
      engineRef.current.undo();
    }
    setHintMessage(null);
    syncState();
  };

  // Request Hint
  const handleHint = () => {
    if (!engineRef.current || isThinking) return;
    kamertjeAudio.playPenDraw();
    haptics.selection();
    const hint = engineRef.current.getHint();
    if (hint) {
      setHintMessage(hint.reasonNl);
      setHoveredLine(hint.move);
    }
  };

  // Save High Score
  const handleSaveScore = (e: React.FormEvent) => {
    e.preventDefault();
    if (!initialsInput.trim() || hasSavedScore) return;

    const total = gridSize * gridSize;
    const pct = Math.round((p1Score / total) * 100);
    const updated = saveKamertjeHighScore({
      initials: initialsInput.toUpperCase().slice(0, 3),
      score: p1Score,
      totalBoxes: total,
      percentage: pct,
      gridSize: `${gridSize}×${gridSize}`,
      difficulty,
      date: new Date().toISOString().split('T')[0],
      note: p1Score > p2Score ? 'Gewonnen!' : 'Gelijkspel / Eervol'
    });

    setHighScores(updated);
    setHasSavedScore(true);
    haptics.success();
  };

  const totalBoxes = gridSize * gridSize;
  const p1Pct = Math.round((p1Score / totalBoxes) * 100) || 0;
  const p2Pct = Math.round((p2Score / totalBoxes) * 100) || 0;

  return (
    <div className="relative w-full min-h-screen bg-amber-950/20 text-slate-900 flex flex-col items-center justify-start select-none font-sans overflow-x-hidden">
      
      {/* Top Header Bar */}
      <header className="w-full bg-slate-900/95 border-b border-amber-600/40 backdrop-blur-md px-4 py-2.5 flex items-center justify-between sticky top-0 z-30 shadow-md text-slate-100">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToLobby}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-amber-400 text-xs font-mono font-semibold transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-amber-400" />
            <span>Lobby</span>
          </button>

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-sm tracking-wide text-amber-300">
                KAMERTJE VERHUREN
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-700/50">
                RUITJESPAPIER • 1895
              </span>
            </div>
            <span className="text-[11px] font-mono text-slate-400">
              Édouard Lucas (La Pipopipette) • Balpen &amp; Kettingreacties
            </span>
          </div>
        </div>

        {/* Toolbar Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const muted = kamertjeAudio.toggleMute();
              setIsMuted(muted);
            }}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 hover:border-amber-400 transition-colors cursor-pointer"
            title={isMuted ? 'Geluid Aan' : 'Geluid Uit'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-amber-400" />}
          </button>

          <button
            onClick={() => setShowScoresModal(true)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 hover:border-amber-400 text-xs font-mono transition-colors cursor-pointer"
          >
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Records</span>
          </button>

          <button
            onClick={() => setShowHistoryModal(true)}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 hover:border-amber-400 transition-colors cursor-pointer"
            title="Spelregels & Wiskundige Geheimen"
          >
            <HelpCircle className="w-4 h-4 text-amber-400" />
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="w-full max-w-5xl flex-grow flex flex-col items-center justify-start p-3 sm:p-5 gap-4">
        
        {/* Score & Turn Banner (Styled like a school notebook tally margin) */}
        <div className="w-full grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white/95 backdrop-blur-md border-2 border-amber-900/30 rounded-2xl p-4 shadow-xl">
          
          {/* Player 1 (Blue Pen) */}
          <div className={`relative flex items-center gap-3 p-3.5 rounded-xl border-2 transition-all ${
            currentTurn === 'P1' && !isGameOver 
              ? 'bg-blue-50/90 border-blue-600 shadow-[0_0_20px_rgba(37,99,235,0.3)] scale-[1.02] ring-2 ring-blue-400/40' 
              : 'bg-slate-50 border-slate-200 opacity-60'
          }`}>
            {currentTurn === 'P1' && !isGameOver && (
              <span className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-mono font-black tracking-wider uppercase shadow animate-pulse flex items-center gap-1">
                <PenTool className="w-3 h-3" />
                Aan Zet
              </span>
            )}
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-extrabold text-xl shadow-md transition-colors ${
              currentTurn === 'P1' && !isGameOver ? 'bg-blue-600 text-white ring-2 ring-blue-300' : 'bg-slate-400 text-white'
            }`}>
              J
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-mono font-bold text-blue-900 flex items-center gap-1">
                BLAUWE PEN (JIJ)
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-blue-700">{p1Score}</span>
                <span className="text-xs text-slate-500 font-mono">/ {totalBoxes} ({p1Pct}%)</span>
              </div>
            </div>
          </div>

          {/* Turn / Combo Center Status */}
          <div className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all text-center ${
            currentTurn === 'P1' && !isGameOver
              ? 'bg-blue-50/80 border-blue-300 shadow-sm'
              : currentTurn === 'P2' && !isGameOver
              ? 'bg-red-50/80 border-red-300 shadow-sm'
              : 'bg-amber-50/60 border-amber-200'
          }`}>
            {isGameOver ? (
              <div className="flex flex-col items-center">
                <span className="text-xs font-mono font-bold text-amber-900">RUITJESBLAD VOLTOOID</span>
                <span className="text-sm font-extrabold text-amber-700">
                  {p1Score > p2Score ? '🎉 JIJ WINT DE MEESTE KAMERS!' : p1Score < p2Score ? '🤖 COMPUTER WINT DIT BLAD!' : '🤝 GELIJKSPEL!'}
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-1">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full animate-ping ${currentTurn === 'P1' ? 'bg-blue-600' : 'bg-red-600'}`} />
                  <span className={`text-xs font-mono font-black tracking-wide ${
                    currentTurn === 'P1' ? 'text-blue-900' : 'text-red-900'
                  }`}>
                    {currentTurn === 'P1' 
                      ? '✏️ JOUW BEURT (Blauwe Pen)' 
                      : (gameMode === 'vs_ai' ? '🤖 COMPUTER IS AAN ZET (Rode Pen)' : '✏️ SPELER 2 IS AAN ZET (Rode Pen)')
                    }
                  </span>
                </div>
                
                <span className="text-[11px] font-mono text-slate-600">
                  {turnMessage}
                </span>

                {comboCount > 1 && (
                  <span className="text-xs font-black text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md border border-amber-300 animate-bounce">
                    🔥 {comboCount}x KETTINGREACTIE!
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Player 2 (Red Pen) */}
          <div className={`relative flex items-center gap-3 p-3.5 rounded-xl border-2 transition-all ${
            currentTurn === 'P2' && !isGameOver 
              ? 'bg-red-50/90 border-red-600 shadow-[0_0_20px_rgba(220,38,38,0.3)] scale-[1.02] ring-2 ring-red-400/40' 
              : 'bg-slate-50 border-slate-200 opacity-60'
          }`}>
            {currentTurn === 'P2' && !isGameOver && (
              <span className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-mono font-black tracking-wider uppercase shadow animate-pulse flex items-center gap-1">
                <PenTool className="w-3 h-3" />
                Aan Zet
              </span>
            )}
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-extrabold text-xl shadow-md transition-colors ${
              currentTurn === 'P2' && !isGameOver ? 'bg-red-600 text-white ring-2 ring-red-300' : 'bg-slate-400 text-white'
            }`}>
              {gameMode === 'vs_ai' ? 'AI' : 'P2'}
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-mono font-bold text-red-900 flex items-center gap-1">
                {gameMode === 'vs_ai' ? 'RODE PEN (AI)' : 'RODE PEN (SPELER 2)'}
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-red-700">{p2Score}</span>
                <span className="text-xs text-slate-500 font-mono">/ {totalBoxes} ({p2Pct}%)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Options & Settings Toolbar */}
        <div className="w-full flex flex-wrap items-center justify-between gap-2.5 bg-white/80 backdrop-blur-md p-3 rounded-2xl border border-amber-900/20 shadow-md">
          
          {/* Grid Size */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
            <span className="text-xs font-mono text-slate-500 px-1.5 font-bold">Formaat:</span>
            {[3, 4, 5, 6].map(size => (
              <button
                key={size}
                onClick={() => setGridSize(size)}
                className={`px-2.5 py-1 text-xs font-mono rounded-lg transition-colors cursor-pointer font-bold ${
                  gridSize === size 
                    ? 'bg-amber-600 text-white shadow-sm' 
                    : 'text-slate-600 hover:bg-slate-200'
                }`}
              >
                {size}×{size}
              </button>
            ))}
          </div>

          {/* Mode */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setGameMode('vs_ai')}
              className={`flex items-center gap-1 px-2.5 py-1 text-xs font-mono rounded-lg transition-colors cursor-pointer font-bold ${
                gameMode === 'vs_ai' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Bot className="w-3.5 h-3.5" />
              <span>vs AI</span>
            </button>
            <button
              onClick={() => setGameMode('pvp')}
              className={`flex items-center gap-1 px-2.5 py-1 text-xs font-mono rounded-lg transition-colors cursor-pointer font-bold ${
                gameMode === 'pvp' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>2 Spelers</span>
            </button>
          </div>

          {/* Difficulty (If vs AI) */}
          {gameMode === 'vs_ai' && (
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                onClick={() => setDifficulty('novice')}
                className={`px-2 py-1 text-xs font-mono rounded-lg font-bold transition-colors cursor-pointer ${
                  difficulty === 'novice' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:bg-slate-200'
                }`}
                title="Basischool niveau"
              >
                Klasgenoot
              </button>
              <button
                onClick={() => setDifficulty('tactician')}
                className={`px-2 py-1 text-xs font-mono rounded-lg font-bold transition-colors cursor-pointer ${
                  difficulty === 'tactician' ? 'bg-amber-600 text-white' : 'text-slate-600 hover:bg-slate-200'
                }`}
                title="Wiskundeleraar (Berekend)"
              >
                Docent
              </button>
              <button
                onClick={() => setDifficulty('master')}
                className={`px-2 py-1 text-xs font-mono rounded-lg font-bold transition-colors cursor-pointer ${
                  difficulty === 'master' ? 'bg-purple-600 text-white' : 'text-slate-600 hover:bg-slate-200'
                }`}
                title="Édouard Lucas (Dubbele-Weggeefzet Meester)"
              >
                Lucas 1895
              </button>
            </div>
          )}
        </div>

        {/* Hint Banner */}
        {hintMessage && (
          <div className="w-full bg-blue-50 border border-blue-300 rounded-xl p-3 flex items-center justify-between text-xs font-mono text-blue-900 shadow-sm animate-fade-in">
            <div className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-amber-500 animate-bounce" />
              <span>{hintMessage}</span>
            </div>
            <button
              onClick={() => setHintMessage(null)}
              className="text-blue-700 hover:text-blue-900 font-bold px-2 py-1"
            >
              ✕ Sluiten
            </button>
          </div>
        )}

        {/* Interactive Graph Paper Board */}
        <KamertjeVerhurenBoardView
          gridSize={gridSize}
          horizontalLines={hLines}
          verticalLines={vLines}
          boxes={boxes}
          currentTurn={currentTurn}
          onLineClick={handleLineClick}
          hoveredLine={hoveredLine}
          onHoverLine={setHoveredLine}
          isThinking={isThinking}
          p1Initials="J"
          p2Initials={gameMode === 'vs_ai' ? 'AI' : 'P2'}
        />

        {/* Bottom Actions Bar */}
        <div className="w-full flex flex-wrap items-center justify-between gap-3 bg-white/90 backdrop-blur-md p-3.5 rounded-2xl border border-amber-900/20 shadow-md">
          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-mono text-xs font-bold transition-colors shadow-sm cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Nieuw Blad</span>
            </button>

            <button
              onClick={handleUndo}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-mono text-xs font-semibold transition-colors cursor-pointer"
              title="Zet Terug"
            >
              <Undo2 className="w-3.5 h-3.5" />
              <span>Zet Terug</span>
            </button>

            <button
              onClick={handleHint}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-100 hover:bg-blue-200 text-blue-900 font-mono text-xs font-semibold transition-colors cursor-pointer"
              title="Wiskundige Tip"
            >
              <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
              <span>Tip</span>
            </button>
          </div>

          <div className="text-xs font-mono text-slate-500">
            {totalBoxes - (p1Score + p2Score)} kamertje(s) vrij van {totalBoxes}
          </div>
        </div>

        {/* Game Over Modal */}
        {isGameOver && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in font-sans">
            <div className="bg-white border-4 border-amber-600 rounded-3xl max-w-md w-full p-6 text-center shadow-2xl space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-amber-100 border-2 border-amber-400 text-3xl flex items-center justify-center mx-auto shadow-inner">
                {p1Score > p2Score ? '🏆' : p1Score < p2Score ? '🤖' : '🤝'}
              </div>
              
              <div>
                <h3 className="text-2xl font-black text-slate-900">
                  {p1Score > p2Score ? 'GEFELICITEERD, GEWONNEN!' : p1Score < p2Score ? 'COMPUTER WINT DIT BLAD' : 'GELIJKSPEL!'}
                </h3>
                <p className="text-xs font-mono text-slate-500 mt-1">
                  Eindstand: {p1Score} kamers voor Blauw vs {p2Score} kamers voor Rood ({p1Pct}% winst).
                </p>
              </div>

              {/* Save High Score Form */}
              {!hasSavedScore ? (
                <form onSubmit={handleSaveScore} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <label className="text-xs font-mono font-bold text-slate-700 block">
                    Vereeuwig je 3 initialen in het schoolrecord:
                  </label>
                  <div className="flex items-center justify-center gap-2">
                    <input
                      type="text"
                      maxLength={3}
                      value={initialsInput}
                      onChange={e => setInitialsInput(e.target.value.toUpperCase())}
                      className="w-24 text-center font-mono font-black text-xl px-3 py-1.5 border-2 border-amber-500 rounded-xl bg-white text-slate-900 tracking-widest focus:outline-none"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-mono text-xs font-bold transition-colors cursor-pointer shadow-md"
                    >
                      Opslaan
                    </button>
                  </div>
                </form>
              ) : (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-mono font-bold">
                  ✓ Score succesvol opgeslagen in het recordboek!
                </div>
              )}

              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={handleReset}
                  className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-mono text-xs font-bold transition-colors shadow-lg cursor-pointer"
                >
                  Opnieuw Spelen
                </button>
                <button
                  onClick={onBackToLobby}
                  className="px-4 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-mono text-xs font-semibold transition-colors cursor-pointer"
                >
                  Naar Lobby
                </button>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* History & Masterclass Modal */}
      <KamertjeVerhurenHistoryModal
        isOpen={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
        onPlayGame={() => {
          setShowHistoryModal(false);
          handleReset();
        }}
        lang="nl"
      />

      {/* High Scores Modal */}
      {showScoresModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in font-mono text-xs">
          <div className="bg-slate-900 border-2 border-amber-500/60 rounded-2xl max-w-lg w-full flex flex-col shadow-2xl text-slate-100">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-amber-300 text-sm">
                <Trophy className="w-5 h-5 text-amber-400" />
                <span>Kamertje Verhuren • Erelijst</span>
              </div>
              <button
                onClick={() => setShowScoresModal(false)}
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer"
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
                      <span className="font-bold text-slate-200">{entry.initials} ({entry.gridSize})</span>
                      <span className="text-[10px] text-slate-400">{entry.note || entry.difficulty}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-amber-400 font-bold">{entry.percentage}% ({entry.score}/{entry.totalBoxes})</span>
                    <span className="text-[10px] text-slate-500">{entry.date}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setShowScoresModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer"
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
