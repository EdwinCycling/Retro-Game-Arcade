import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ArrowLeft,
  RotateCcw,
  Volume2,
  VolumeX,
  Trophy,
  HelpCircle,
  Sparkles,
  Table,
  Lightbulb,
  Undo2,
  Play,
  Award,
  Hash,
  Shuffle
} from 'lucide-react';
import { Card, Suit, FreeCellState } from '../game/freecellTypes';
import {
  FreeCellEngine,
  SUIT_SYMBOLS,
  RANK_NAMES,
  getCardColor
} from '../game/freecellEngine';
import { freeCellAudio } from '../game/freecellAudio';
import {
  getFreeCellHighScores,
  saveFreeCellHighScore,
  getFreeCellStats,
  updateFreeCellStats,
  FreeCellHighScoreEntry
} from '../game/freecellHighScores';
import { FreeCellHistoryModal } from './FreeCellHistoryModal';
import { haptics } from '../utils/haptics';

interface FreeCellCabinetProps {
  onBackToLobby: () => void;
}

export const FreeCellCabinet: React.FC<FreeCellCabinetProps> = ({ onBackToLobby }) => {
  const [engine] = useState(() => new FreeCellEngine(Math.floor(Math.random() * 32000) + 1));
  const [gameState, setGameState] = useState<FreeCellState>(() => ({ ...engine.state }));
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Selection state
  const [selectedSource, setSelectedSource] = useState<{
    type: 'freecell' | 'cascade';
    index: number;
    cardIndex?: number;
  } | null>(null);

  // Game Number Input
  const [inputGameNum, setInputGameNum] = useState<string>('');
  const [showGameNumDialog, setShowGameNumDialog] = useState(false);

  // Timer
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // Modals & Popups
  const [hintMessage, setHintMessage] = useState<string | null>(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showHighScoresModal, setShowHighScoresModal] = useState(false);
  const [showWinModal, setShowWinModal] = useState(false);
  const [playerName, setPlayerName] = useState('');
  const [playerInitials, setPlayerInitials] = useState('YOU');
  const [highScores, setHighScores] = useState<FreeCellHighScoreEntry[]>([]);
  const [stats, setStats] = useState(() => getFreeCellStats());

  useEffect(() => {
    setHighScores(getFreeCellHighScores());
  }, []);

  useEffect(() => {
    freeCellAudio.enabled = soundEnabled;
  }, [soundEnabled]);

  // Timer interval
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTimerRunning && !gameState.isWon) {
      interval = setInterval(() => {
        setTimerSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, gameState.isWon]);

  // Check victory
  useEffect(() => {
    if (gameState.isWon) {
      setIsTimerRunning(false);
      setShowWinModal(true);
      freeCellAudio.playWinFanfare();
      haptics.success();
      const updatedStats = updateFreeCellStats(true, timerSeconds, gameState.movesCount);
      setStats(updatedStats);
    }
  }, [gameState.isWon, timerSeconds, gameState.movesCount]);

  // Start new game with specific number
  const handleStartGameNumber = (num: number) => {
    const validNum = Math.max(1, Math.min(32000, num));
    setSelectedSource(null);
    setHintMessage(null);
    setTimerSeconds(0);
    setIsTimerRunning(true);
    setShowWinModal(false);
    setShowGameNumDialog(false);
    engine.initGame(validNum);
    freeCellAudio.playCardDrop();
    haptics.buttonPress();
    setGameState({ ...engine.state });
  };

  const handleRandomGame = () => {
    handleStartGameNumber(Math.floor(Math.random() * 32000) + 1);
  };

  const handleRestartCurrentGame = () => {
    handleStartGameNumber(gameState.gameNumber);
  };

  // Auto move safe cards
  const handleAutoMove = useCallback(() => {
    const moved = engine.autoMoveSafeCards();
    if (moved) {
      freeCellAudio.playFoundation();
      haptics.softClick();
      setGameState({ ...engine.state });
    }
  }, [engine]);

  // Undo move
  const handleUndo = () => {
    const success = engine.undo();
    if (success) {
      setSelectedSource(null);
      freeCellAudio.playCardPick();
      haptics.buttonPress();
      setGameState({ ...engine.state });
    }
  };

  // Hint
  const handleHint = () => {
    const hint = engine.getHint();
    if (hint) {
      setHintMessage(hint.message);
      haptics.softClick();
    }
  };

  // Card & Slot Selection Logic
  const handleFreeCellClick = (fcIndex: number) => {
    setHintMessage(null);
    if (!isTimerRunning) setIsTimerRunning(true);

    const cellCard = gameState.freeCells[fcIndex];

    if (selectedSource) {
      // Trying to move selected card TO this freecell
      if (cellCard === null) {
        let success = false;
        if (selectedSource.type === 'cascade') {
          success = engine.moveToFreeCell({ type: 'cascade', index: selectedSource.index }, fcIndex);
        } else {
          success = engine.moveToFreeCell({ type: 'freecell', index: selectedSource.index }, fcIndex);
        }

        if (success) {
          freeCellAudio.playCardDrop();
          haptics.softClick();
          setSelectedSource(null);
          setGameState({ ...engine.state });
          handleAutoMove();
          return;
        }
      }
      freeCellAudio.playError();
      haptics.heavy();
      setSelectedSource(null);
    } else {
      // Select card in FreeCell
      if (cellCard) {
        setSelectedSource({ type: 'freecell', index: fcIndex });
        freeCellAudio.playCardPick();
        haptics.softClick();
      }
    }
  };

  const handleFoundationClick = (suit: Suit) => {
    setHintMessage(null);
    if (!isTimerRunning) setIsTimerRunning(true);

    if (selectedSource) {
      let success = false;
      if (selectedSource.type === 'cascade') {
        success = engine.moveToFoundation({ type: 'cascade', index: selectedSource.index }, suit);
      } else {
        success = engine.moveToFoundation({ type: 'freecell', index: selectedSource.index }, suit);
      }

      if (success) {
        freeCellAudio.playFoundation();
        haptics.softClick();
        setSelectedSource(null);
        setGameState({ ...engine.state });
        handleAutoMove();
        return;
      }

      freeCellAudio.playError();
      haptics.heavy();
      setSelectedSource(null);
    }
  };

  const handleCascadeClick = (colIndex: number, cardIndex?: number) => {
    setHintMessage(null);
    if (!isTimerRunning) setIsTimerRunning(true);

    const col = gameState.cascades[colIndex];

    if (selectedSource) {
      // Move selected card/stack TO this column
      let success = false;

      if (selectedSource.type === 'freecell') {
        const fcCard = gameState.freeCells[selectedSource.index];
        if (fcCard && engine.canMoveToCascade(fcCard, colIndex)) {
          // Temporarily move fcCard to an empty cascade logic
          engine.saveHistory();
          gameState.freeCells[selectedSource.index] = null;
          col.push(fcCard);
          engine.state.movesCount++;
          engine.checkWin();
          success = true;
        }
      } else if (selectedSource.type === 'cascade') {
        const sourceColIdx = selectedSource.index;
        const sourceCardIdx = selectedSource.cardIndex ?? (gameState.cascades[sourceColIdx].length - 1);
        success = engine.moveStackToCascade(sourceColIdx, sourceCardIdx, colIndex);
      }

      if (success) {
        freeCellAudio.playCardDrop();
        haptics.softClick();
        setSelectedSource(null);
        setGameState({ ...engine.state });
        handleAutoMove();
        return;
      }

      freeCellAudio.playError();
      haptics.heavy();
      setSelectedSource(null);
    } else {
      // Select source
      if (col.length > 0) {
        const targetIdx = cardIndex !== undefined ? cardIndex : col.length - 1;
        setSelectedSource({ type: 'cascade', index: colIndex, cardIndex: targetIdx });
        freeCellAudio.playCardPick();
        haptics.softClick();
      }
    }
  };

  // Double Click card to attempt auto-move to Foundation or FreeCell
  const handleCardDoubleClick = (card: Card, source: { type: 'cascade' | 'freecell'; index: number }) => {
    setHintMessage(null);
    // 1. Try Foundation
    let success = engine.moveToFoundation(source, card.suit);
    if (success) {
      freeCellAudio.playFoundation();
      haptics.softClick();
      setSelectedSource(null);
      setGameState({ ...engine.state });
      handleAutoMove();
      return;
    }

    // 2. Try FreeCell
    const emptyFC = gameState.freeCells.findIndex(c => c === null);
    if (emptyFC !== -1) {
      success = engine.moveToFreeCell(source, emptyFC);
      if (success) {
        freeCellAudio.playCardDrop();
        haptics.softClick();
        setSelectedSource(null);
        setGameState({ ...engine.state });
        handleAutoMove();
        return;
      }
    }
  };

  // Save High Score
  const handleSaveScore = (e: React.FormEvent) => {
    e.preventDefault();
    const entry: FreeCellHighScoreEntry = {
      name: playerName.trim() || 'FreeCell Meester',
      initials: (playerInitials.trim() || 'YOU').toUpperCase().slice(0, 3),
      gameNumber: gameState.gameNumber,
      moves: gameState.movesCount,
      timeSeconds: timerSeconds,
      date: new Date().toISOString().split('T')[0]
    };
    const updated = saveFreeCellHighScore(entry);
    setHighScores(updated);
    setShowWinModal(false);
    setShowHighScoresModal(true);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="min-h-screen bg-[#006633] text-white flex flex-col justify-between p-2 sm:p-4 select-none relative overflow-hidden font-sans">
      
      {/* Header Window Bar */}
      <header className="w-full max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-2 border-b border-emerald-400/40 pb-2 mb-2 z-20">
        
        {/* Left: Back & Title */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              haptics.buttonPress();
              onBackToLobby();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900/80 hover:bg-slate-800 border border-emerald-400/40 rounded-md text-xs sm:text-sm font-bold shadow transition-all hover:scale-105 active:scale-95"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Lobby</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="text-xl sm:text-2xl">🃏</span>
            <div>
              <h1 className="font-mono font-black text-base sm:text-xl tracking-wider text-white flex items-center gap-2">
                FREECELL <span className="text-[10px] sm:text-xs px-1.5 py-0.5 rounded bg-emerald-700 text-emerald-100 font-bold">WIN 3.11 / 95</span>
              </h1>
              <div className="text-[10px] sm:text-xs text-emerald-200/90">
                Spel #{gameState.gameNumber} {gameState.gameNumber === 11982 ? '⚠️ (Onoplosbare Klassieker!)' : ''}
              </div>
            </div>
          </div>
        </div>

        {/* Center: Live Timer, Moves & Game Selector */}
        <div className="flex items-center gap-3 bg-black/40 border border-emerald-500/30 px-3 py-1.5 rounded-lg text-xs font-mono">
          <div className="flex flex-col items-center">
            <span className="text-[9px] text-emerald-300/70 uppercase">Tijd</span>
            <span className="font-bold text-cyan-300">{formatTime(timerSeconds)}</span>
          </div>
          <div className="w-[1px] h-6 bg-emerald-500/30"></div>
          <div className="flex flex-col items-center">
            <span className="text-[9px] text-emerald-300/70 uppercase">Zetten</span>
            <span className="font-bold text-amber-300">{gameState.movesCount}</span>
          </div>
          <div className="w-[1px] h-6 bg-emerald-500/30"></div>
          <button
            onClick={() => setShowGameNumDialog(true)}
            className="flex items-center gap-1 text-emerald-300 hover:text-white font-bold bg-emerald-950/60 px-2 py-1 rounded border border-emerald-500/40 active:scale-95 transition-all"
          >
            <Hash className="w-3.5 h-3.5 text-amber-400" />
            <span>Kies Spel#</span>
          </button>
        </div>

        {/* Right: Actions (Undo, Auto, Hint, Sound, HighScores, Help) */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Undo */}
          <button
            onClick={handleUndo}
            disabled={gameState.history.length === 0}
            title="Stap Terug"
            className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-900/80 hover:bg-slate-800 disabled:opacity-40 border border-emerald-400/40 rounded-md text-xs font-bold font-mono transition-all active:scale-95"
          >
            <Undo2 className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Herstel</span>
          </button>

          {/* Hint */}
          <button
            onClick={handleHint}
            title="Bekijk een Hint"
            className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-900/80 hover:bg-slate-800 border border-emerald-400/40 rounded-md text-xs font-bold font-mono transition-all active:scale-95"
          >
            <Lightbulb className="w-3.5 h-3.5 text-yellow-300" />
            <span className="hidden sm:inline">Hint</span>
          </button>

          {/* Random Game */}
          <button
            onClick={handleRandomGame}
            title="Willekeurig Spel"
            className="flex items-center gap-1 px-2.5 py-1.5 bg-amber-600 hover:bg-amber-500 text-slate-950 font-black text-xs rounded-md border border-amber-300 shadow transition-all active:scale-95"
          >
            <Shuffle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Willekeurig</span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 bg-slate-900/80 hover:bg-slate-800 border border-emerald-400/40 rounded-md transition-all active:scale-95"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-red-400" />}
          </button>

          {/* High Scores */}
          <button
            onClick={() => setShowHighScoresModal(true)}
            className="p-2 bg-slate-900/80 hover:bg-slate-800 border border-emerald-400/40 rounded-md transition-all active:scale-95"
          >
            <Trophy className="w-4 h-4 text-yellow-400" />
          </button>

          {/* History / Rules */}
          <button
            onClick={() => setShowHistoryModal(true)}
            className="p-2 bg-slate-900/80 hover:bg-slate-800 border border-emerald-400/40 rounded-md transition-all active:scale-95"
          >
            <HelpCircle className="w-4 h-4 text-cyan-300" />
          </button>
        </div>
      </header>

      {/* Hint Message Banner */}
      {hintMessage && (
        <div className="w-full max-w-4xl mx-auto bg-amber-500/20 border border-amber-400/60 rounded-lg p-2 text-center text-xs font-mono font-bold text-amber-200 animate-fade-in z-20 mb-1">
          💡 {hintMessage}
        </div>
      )}

      {/* Main Playing Felt Arena */}
      <main className="w-full max-w-6xl flex-1 flex flex-col justify-start items-center relative my-1 sm:my-2 gap-4">
        
        {/* TOP ROW: 4 Free Cells (Left) & 4 Foundations (Right) */}
        <div className="w-full flex items-center justify-between gap-2 px-2 sm:px-6">
          
          {/* 4 FREE CELLS (LEFT) */}
          <div className="flex items-center gap-1.5 sm:gap-3 bg-black/30 p-2 rounded-xl border border-emerald-500/30">
            <span className="text-[10px] font-mono font-bold text-emerald-300 uppercase tracking-tighter hidden md:inline">
              VRIJE VAKKEN
            </span>
            <div className="flex items-center gap-1 sm:gap-2">
              {gameState.freeCells.map((card, idx) => {
                const isSelected = selectedSource?.type === 'freecell' && selectedSource.index === idx;
                const isRed = card ? getCardColor(card.suit) === 'red' : false;

                return (
                  <div
                    key={idx}
                    onClick={() => handleFreeCellClick(idx)}
                    onDoubleClick={() => card && handleCardDoubleClick(card, { type: 'freecell', index: idx })}
                    className={`w-11 h-16 sm:w-16 sm:h-24 md:w-20 md:h-28 rounded-md border-2 border-dashed border-emerald-400/40 flex items-center justify-center cursor-pointer relative transition-all ${
                      card ? 'bg-white border-solid' : 'bg-emerald-950/40 hover:border-emerald-300'
                    } ${isSelected ? '-translate-y-2 ring-4 ring-amber-400 border-amber-500 shadow-xl z-30' : ''} ${
                      isRed ? 'text-red-600' : 'text-slate-950'
                    }`}
                  >
                    {card ? (
                      <div className="w-full h-full flex flex-col justify-between p-1 select-none">
                        <div className="flex flex-col items-center leading-none self-start">
                          <span className="font-mono font-black text-xs sm:text-base">{RANK_NAMES[card.rank]}</span>
                          <span className="text-[10px] sm:text-xs">{SUIT_SYMBOLS[card.suit]}</span>
                        </div>
                        <div className="self-center text-sm sm:text-2xl">
                          {SUIT_SYMBOLS[card.suit]}
                        </div>
                        <div className="flex flex-col items-center leading-none self-end rotate-180">
                          <span className="font-mono font-black text-xs sm:text-base">{RANK_NAMES[card.rank]}</span>
                          <span className="text-[10px] sm:text-xs">{SUIT_SYMBOLS[card.suit]}</span>
                        </div>
                      </div>
                    ) : (
                      <span className="text-emerald-500/30 font-mono text-xs font-bold">{idx + 1}</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* 4 FOUNDATIONS (RIGHT) */}
          <div className="flex items-center gap-1.5 sm:gap-3 bg-black/30 p-2 rounded-xl border border-emerald-500/30">
            <span className="text-[10px] font-mono font-bold text-cyan-300 uppercase tracking-tighter hidden md:inline">
              BASISSTAPELS
            </span>
            <div className="flex items-center gap-1 sm:gap-2">
              {(['clubs', 'diamonds', 'hearts', 'spades'] as Suit[]).map(suit => {
                const pile = gameState.foundations[suit];
                const topCard = pile.length > 0 ? pile[pile.length - 1] : null;
                const isRed = suit === 'hearts' || suit === 'diamonds';

                return (
                  <div
                    key={suit}
                    onClick={() => handleFoundationClick(suit)}
                    className={`w-11 h-16 sm:w-16 sm:h-24 md:w-20 md:h-28 rounded-md border-2 border-dashed border-emerald-400/40 flex items-center justify-center cursor-pointer relative transition-all ${
                      topCard ? 'bg-white border-solid' : 'bg-emerald-950/40 hover:border-cyan-300'
                    } ${isRed ? 'text-red-600' : 'text-slate-950'}`}
                  >
                    {topCard ? (
                      <div className="w-full h-full flex flex-col justify-between p-1 select-none">
                        <div className="flex flex-col items-center leading-none self-start">
                          <span className="font-mono font-black text-xs sm:text-base">{RANK_NAMES[topCard.rank]}</span>
                          <span className="text-[10px] sm:text-xs">{SUIT_SYMBOLS[topCard.suit]}</span>
                        </div>
                        <div className="self-center text-sm sm:text-2xl">
                          {SUIT_SYMBOLS[topCard.suit]}
                        </div>
                        <div className="flex flex-col items-center leading-none self-end rotate-180">
                          <span className="font-mono font-black text-xs sm:text-base">{RANK_NAMES[topCard.rank]}</span>
                          <span className="text-[10px] sm:text-xs">{SUIT_SYMBOLS[topCard.suit]}</span>
                        </div>
                      </div>
                    ) : (
                      <span className="text-emerald-400/40 text-base sm:text-2xl">
                        {SUIT_SYMBOLS[suit]}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* BOTTOM AREA: 8 CASCADE COLUMNS */}
        <div className="w-full grid grid-cols-8 gap-1 sm:gap-2 sm:px-4 min-h-[380px]">
          {gameState.cascades.map((col, colIdx) => (
            <div
              key={colIdx}
              onClick={() => col.length === 0 && handleCascadeClick(colIdx)}
              className={`flex flex-col items-center relative min-h-[200px] rounded-lg p-0.5 sm:p-1 border border-dashed transition-colors ${
                col.length === 0 ? 'border-emerald-400/30 bg-black/20 hover:border-amber-400 cursor-pointer' : 'border-transparent'
              }`}
            >
              {col.length === 0 && (
                <span className="text-[10px] font-mono font-bold text-emerald-500/40 mt-2">
                  K{colIdx + 1}
                </span>
              )}

              {col.map((card, cardIdx) => {
                const isSelected = selectedSource?.type === 'cascade' &&
                                   selectedSource.index === colIdx &&
                                   (selectedSource.cardIndex === undefined || cardIdx >= selectedSource.cardIndex);

                const isRed = getCardColor(card.suit) === 'red';

                return (
                  <div
                    key={card.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCascadeClick(colIdx, cardIdx);
                    }}
                    onDoubleClick={(e) => {
                      e.stopPropagation();
                      handleCardDoubleClick(card, { type: 'cascade', index: colIdx });
                    }}
                    style={{
                      marginTop: cardIdx === 0 ? '0px' : '-44px',
                      zIndex: cardIdx + 1
                    }}
                    className={`w-11 h-16 sm:w-16 sm:h-24 md:w-20 md:h-28 bg-white rounded-md border-2 shadow-md relative select-none flex flex-col justify-between p-1 cursor-pointer transition-all ${
                      isRed ? 'text-red-600' : 'text-slate-950'
                    } ${
                      isSelected
                        ? '-translate-y-3 ring-4 ring-amber-400 border-amber-500 shadow-amber-500/40 shadow-xl z-40'
                        : 'border-slate-300 hover:-translate-y-1'
                    }`}
                  >
                    <div className="flex flex-col items-center leading-none self-start">
                      <span className="font-mono font-black text-xs sm:text-base">{RANK_NAMES[card.rank]}</span>
                      <span className="text-[10px] sm:text-xs mt-[-1px]">{SUIT_SYMBOLS[card.suit]}</span>
                    </div>

                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <span className="text-sm sm:text-2xl opacity-80">
                        {SUIT_SYMBOLS[card.suit]}
                      </span>
                    </div>

                    <div className="flex flex-col items-center leading-none self-end rotate-180">
                      <span className="font-mono font-black text-xs sm:text-base">{RANK_NAMES[card.rank]}</span>
                      <span className="text-[10px] sm:text-xs mt-[-1px]">{SUIT_SYMBOLS[card.suit]}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </main>

      {/* Footer Instructions */}
      <footer className="w-full max-w-6xl flex items-center justify-between border-t border-emerald-400/30 pt-2 text-[10px] sm:text-xs text-emerald-200/80 font-mono z-20">
        <div>
          <span>🎯 Doel: Bouw 4 basisstapels van Aas ➔ Koning • Gebruik 4 vrije vakken strategisch!</span>
        </div>
        <div>
          <span>Windows FreeCell v1.0 • 100% TypeScript</span>
        </div>
      </footer>

      {/* Game Number Selection Dialog */}
      {showGameNumDialog && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-amber-500 rounded-xl max-w-sm w-full p-5 text-white font-mono shadow-2xl">
            <h3 className="font-black text-base text-amber-300 mb-2 flex items-center gap-2">
              <Hash className="w-5 h-5 text-amber-400" /> KIES FREECELL SPELNUMMER
            </h3>
            <p className="text-xs text-slate-300 mb-4">
              Voer een historisch spelnummer in tussen <strong>1 en 32.000</strong> (probeer bijv. <strong>#11982</strong> voor de onoplosbare uitdaging!):
            </p>
            <input
              type="number"
              value={inputGameNum}
              onChange={e => setInputGameNum(e.target.value)}
              placeholder="Bijv. 11982"
              min={1}
              max={32000}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded text-amber-300 font-bold text-lg mb-4 outline-none focus:border-amber-400"
            />
            <div className="flex gap-2">
              <button
                onClick={() => setShowGameNumDialog(false)}
                className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-bold rounded"
              >
                Annuleren
              </button>
              <button
                onClick={() => {
                  const n = parseInt(inputGameNum, 10);
                  if (!isNaN(n)) handleStartGameNumber(n);
                }}
                className="flex-1 py-2 bg-amber-500 hover:bg-amber-400 text-black font-black text-xs rounded shadow"
              >
                Start Spel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Win Modal */}
      {showWinModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-emerald-400 rounded-xl max-w-md w-full p-6 text-white text-center shadow-2xl animate-fade-in font-mono">
            <span className="text-5xl mb-2 block">🏆✨</span>
            <h2 className="font-black text-2xl text-emerald-400 mb-1">
              GEFELICITEERD! SPEL #{gameState.gameNumber} OPLOST!
            </h2>
            <p className="text-xs text-slate-300 mb-4">
              Tijd: <strong>{formatTime(timerSeconds)}</strong> • Zetten: <strong>{gameState.movesCount}</strong>
            </p>

            <form onSubmit={handleSaveScore} className="flex flex-col gap-3 text-left mb-4">
              <div>
                <label className="text-xs text-slate-300 block mb-1">Spelersnaam:</label>
                <input
                  type="text"
                  value={playerName}
                  onChange={e => setPlayerName(e.target.value)}
                  placeholder="Bijv. Edwin"
                  maxLength={20}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded text-white text-sm focus:border-emerald-400 outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-slate-300 block mb-1">3-Letter Initialen:</label>
                <input
                  type="text"
                  value={playerInitials}
                  onChange={e => setPlayerInitials(e.target.value.toUpperCase())}
                  placeholder="YOU"
                  maxLength={3}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded text-white text-sm focus:border-emerald-400 outline-none uppercase"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-sm rounded shadow transition-all active:scale-95"
              >
                Opslaan in FreeCell Hall of Fame
              </button>
            </form>

            <button
              type="button"
              onClick={handleRandomGame}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded"
            >
              Speel Volgend Willekeurig Spel ▶
            </button>
          </div>
        </div>
      )}

      {/* High Scores Modal */}
      {showHighScoresModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-amber-500/60 rounded-xl max-w-lg w-full p-6 text-white shadow-2xl font-mono">
            <div className="flex items-center justify-between border-b border-slate-700 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Trophy className="w-6 h-6 text-yellow-400" />
                <h3 className="font-black text-lg text-amber-300">FREECELL HALL OF FAME</h3>
              </div>
              <button
                onClick={() => setShowHighScoresModal(false)}
                className="text-slate-400 hover:text-white text-xl"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-4 gap-2 bg-slate-950 p-3 rounded-lg border border-slate-800 mb-4 text-center text-xs">
              <div>
                <span className="text-slate-400 text-[9px]">GESPEELD</span>
                <p className="font-bold text-white">{stats.gamesPlayed}</p>
              </div>
              <div>
                <span className="text-slate-400 text-[9px]">GEWONNEN</span>
                <p className="font-bold text-emerald-400">{stats.gamesWon}</p>
              </div>
              <div>
                <span className="text-slate-400 text-[9px]">STREAK</span>
                <p className="font-bold text-amber-400">{stats.currentStreak} 🔥</p>
              </div>
              <div>
                <span className="text-slate-400 text-[9px]">BESTE TIJD</span>
                <p className="font-bold text-cyan-400">{stats.bestTimeSeconds === 9999 ? '-' : formatTime(stats.bestTimeSeconds)}</p>
              </div>
            </div>

            <div className="overflow-y-auto max-h-64 mb-4">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="py-1">#</th>
                    <th>NAAM</th>
                    <th>SPEL#</th>
                    <th>TIJD</th>
                    <th>ZETTEN</th>
                    <th>DATUM</th>
                  </tr>
                </thead>
                <tbody>
                  {highScores.map((entry, idx) => (
                    <tr key={idx} className="border-b border-slate-800/40 hover:bg-slate-800/40">
                      <td className="py-1.5 text-amber-400 font-bold">{idx + 1}</td>
                      <td className="font-bold text-white">{entry.name}</td>
                      <td className="text-amber-300">#{entry.gameNumber}</td>
                      <td className="text-cyan-300">{formatTime(entry.timeSeconds)}</td>
                      <td className="text-emerald-400 font-bold">{entry.moves}</td>
                      <td className="text-slate-500">{entry.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <button
              onClick={() => setShowHighScoresModal(false)}
              className="w-full py-2 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-md"
            >
              Sluiten
            </button>
          </div>
        </div>
      )}

      {/* Historical Dossier & Help */}
      <FreeCellHistoryModal
        isOpen={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
        onPlayGame={() => {
          setShowHistoryModal(false);
          handleRandomGame();
        }}
        lang="nl"
      />
    </div>
  );
};
