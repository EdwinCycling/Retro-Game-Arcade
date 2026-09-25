import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  RotateCcw,
  Volume2,
  VolumeX,
  Trophy,
  HelpCircle,
  Sparkles,
  Lightbulb,
  Undo2,
  Layers,
  Award,
  Play
} from 'lucide-react';
import { SpiderCard, SpiderDifficulty, SpiderGameState } from '../game/spiderTypes';
import {
  SpiderEngine,
  SPIDER_SUIT_SYMBOLS,
  SPIDER_RANK_NAMES,
  getSpiderCardColor
} from '../game/spiderEngine';
import { spiderAudio } from '../game/spiderAudio';
import {
  getSpiderHighScores,
  saveSpiderHighScore,
  getSpiderStats,
  updateSpiderStats,
  SpiderHighScoreEntry
} from '../game/spiderHighScores';
import { SpiderHistoryModal } from './SpiderHistoryModal';
import { haptics } from '../utils/haptics';

interface SpiderCabinetProps {
  onBackToLobby: () => void;
}

export const SpiderCabinet: React.FC<SpiderCabinetProps> = ({ onBackToLobby }) => {
  const [engine] = useState(() => new SpiderEngine(1));
  const [gameState, setGameState] = useState<SpiderGameState>(() => ({ ...engine.state }));
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Selection state
  const [selectedCol, setSelectedCol] = useState<number | null>(null);
  const [selectedCardIdx, setSelectedCardIdx] = useState<number | null>(null);

  // Timer
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // Modals & messages
  const [hintMessage, setHintMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showHighScoresModal, setShowHighScoresModal] = useState(false);
  const [showWinModal, setShowWinModal] = useState(false);
  const [playerName, setPlayerName] = useState('');
  const [playerInitials, setPlayerInitials] = useState('YOU');
  const [highScores, setHighScores] = useState<SpiderHighScoreEntry[]>([]);
  const [stats, setStats] = useState(() => getSpiderStats());

  useEffect(() => {
    setHighScores(getSpiderHighScores());
  }, []);

  useEffect(() => {
    spiderAudio.enabled = soundEnabled;
  }, [soundEnabled]);

  // Timer
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
      spiderAudio.playWinFanfare();
      haptics.success();
      const updatedStats = updateSpiderStats(true, gameState.difficulty, gameState.score, timerSeconds);
      setStats(updatedStats);
    }
  }, [gameState.isWon, gameState.difficulty, gameState.score, timerSeconds]);

  // Start new game
  const handleStartNewGame = (diff: SpiderDifficulty = gameState.difficulty) => {
    setSelectedCol(null);
    setSelectedCardIdx(null);
    setHintMessage(null);
    setErrorMessage(null);
    setTimerSeconds(0);
    setIsTimerRunning(true);
    setShowWinModal(false);
    engine.initGame(diff);
    spiderAudio.playDeal10();
    haptics.buttonPress();
    setGameState({ ...engine.state });
  };

  // Undo move
  const handleUndo = () => {
    const success = engine.undo();
    if (success) {
      setSelectedCol(null);
      setSelectedCardIdx(null);
      spiderAudio.playCardPick();
      haptics.buttonPress();
      setGameState({ ...engine.state });
    }
  };

  // Deal from stock
  const handleDealStock = () => {
    setHintMessage(null);
    setErrorMessage(null);
    if (!isTimerRunning) setIsTimerRunning(true);

    const prevCompleted = engine.state.completedSuits;
    const res = engine.dealFromStock();

    if (!res.success) {
      setErrorMessage(res.reason || 'Kan niet delen.');
      spiderAudio.playError();
      haptics.heavy();
      return;
    }

    spiderAudio.playDeal10();
    haptics.softClick();

    if (engine.state.completedSuits > prevCompleted) {
      spiderAudio.playRunCompleted();
      haptics.success();
    }

    setSelectedCol(null);
    setSelectedCardIdx(null);
    setGameState({ ...engine.state });
  };

  // Hint
  const handleHint = () => {
    setErrorMessage(null);
    const hint = engine.getHint();
    if (hint) {
      setHintMessage(hint.message);
      if (hint.fromCol !== undefined && hint.cardIdx !== undefined) {
        setSelectedCol(hint.fromCol);
        setSelectedCardIdx(hint.cardIdx);
      }
      haptics.softClick();
    }
  };

  // Handle card click
  const handleCardClick = (colIdx: number, cardIdx: number) => {
    setHintMessage(null);
    setErrorMessage(null);
    if (!isTimerRunning) setIsTimerRunning(true);

    const col = gameState.columns[colIdx];
    const card = col[cardIdx];

    // If clicking an empty column or trying to move selected cards
    if (selectedCol !== null && selectedCardIdx !== null) {
      // Clicked same column / same card: unselect
      if (selectedCol === colIdx && selectedCardIdx === cardIdx) {
        setSelectedCol(null);
        setSelectedCardIdx(null);
        haptics.softClick();
        return;
      }

      // Trying to move sequence to this target column
      const prevCompleted = engine.state.completedSuits;
      const success = engine.moveSequence(selectedCol, selectedCardIdx, colIdx);

      if (success) {
        spiderAudio.playCardDrop();
        haptics.softClick();

        if (engine.state.completedSuits > prevCompleted) {
          spiderAudio.playRunCompleted();
          haptics.success();
        }

        setSelectedCol(null);
        setSelectedCardIdx(null);
        setGameState({ ...engine.state });
        return;
      }

      // If invalid move, see if this new card can be selected instead
      if (card && card.faceUp && engine.canPickUpSequence(colIdx, cardIdx)) {
        setSelectedCol(colIdx);
        setSelectedCardIdx(cardIdx);
        spiderAudio.playCardPick();
        haptics.softClick();
        return;
      }

      spiderAudio.playError();
      haptics.heavy();
      setSelectedCol(null);
      setSelectedCardIdx(null);
    } else {
      // No selection: select this card/sequence if faceUp and movable
      if (card && card.faceUp && engine.canPickUpSequence(colIdx, cardIdx)) {
        setSelectedCol(colIdx);
        setSelectedCardIdx(cardIdx);
        spiderAudio.playCardPick();
        haptics.softClick();
      }
    }
  };

  // Empty column click
  const handleEmptyColumnClick = (colIdx: number) => {
    setHintMessage(null);
    setErrorMessage(null);
    if (selectedCol !== null && selectedCardIdx !== null) {
      const prevCompleted = engine.state.completedSuits;
      const success = engine.moveSequence(selectedCol, selectedCardIdx, colIdx);

      if (success) {
        spiderAudio.playCardDrop();
        haptics.softClick();

        if (engine.state.completedSuits > prevCompleted) {
          spiderAudio.playRunCompleted();
          haptics.success();
        }

        setSelectedCol(null);
        setSelectedCardIdx(null);
        setGameState({ ...engine.state });
      } else {
        spiderAudio.playError();
        haptics.heavy();
        setSelectedCol(null);
        setSelectedCardIdx(null);
      }
    }
  };

  // Save High Score
  const handleSaveScore = (e: React.FormEvent) => {
    e.preventDefault();
    const entry: SpiderHighScoreEntry = {
      name: playerName.trim() || 'Spider Meester',
      initials: (playerInitials.trim() || 'YOU').toUpperCase().slice(0, 3),
      difficulty: gameState.difficulty,
      score: gameState.score,
      moves: gameState.movesCount,
      timeSeconds: timerSeconds,
      date: new Date().toISOString().split('T')[0]
    };
    const updated = saveSpiderHighScore(entry);
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
    <div className="min-h-screen bg-[#073620] text-white flex flex-col justify-between p-2 sm:p-4 select-none relative overflow-hidden font-sans">
      
      {/* Header Window Bar */}
      <header className="w-full max-w-7xl flex flex-col lg:flex-row items-center justify-between gap-2 border-b border-indigo-500/40 pb-2 mb-2 z-20">
        
        {/* Left: Back & Title */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              haptics.buttonPress();
              onBackToLobby();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900/80 hover:bg-slate-800 border border-indigo-400/40 rounded-md text-xs sm:text-sm font-bold shadow transition-all hover:scale-105 active:scale-95"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Lobby</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="text-xl sm:text-2xl">🕷️</span>
            <div>
              <h1 className="font-mono font-black text-base sm:text-xl tracking-wider text-white flex items-center gap-2">
                SPIDER SOLITAIRE <span className="text-[10px] sm:text-xs px-1.5 py-0.5 rounded bg-indigo-700 text-indigo-100 font-bold">WIN 98 &amp; XP</span>
              </h1>
              <div className="text-[10px] sm:text-xs text-indigo-200/90">
                104 Kaarten • 10 Kolommen • 8 Complete Reeksen (K ➔ A)
              </div>
            </div>
          </div>
        </div>

        {/* Center: Difficulty Switcher & Live Stats */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 bg-black/40 border border-indigo-500/30 px-3 py-1.5 rounded-lg text-xs font-mono">
          {/* Difficulty selector */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded border border-indigo-500/30">
            <button
              onClick={() => handleStartNewGame(1)}
              className={`px-2 py-0.5 rounded text-[11px] font-bold transition-all ${
                gameState.difficulty === 1 ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              1 Kleur ♠
            </button>
            <button
              onClick={() => handleStartNewGame(2)}
              className={`px-2 py-0.5 rounded text-[11px] font-bold transition-all ${
                gameState.difficulty === 2 ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              2 Kleuren ♠♥
            </button>
            <button
              onClick={() => handleStartNewGame(4)}
              className={`px-2 py-0.5 rounded text-[11px] font-bold transition-all ${
                gameState.difficulty === 4 ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              4 Kleuren ♠♥♦♣
            </button>
          </div>

          <div className="w-[1px] h-5 bg-indigo-500/30 hidden sm:block"></div>

          {/* Stats */}
          <div className="flex items-center gap-3">
            <div className="flex flex-col items-center">
              <span className="text-[9px] text-indigo-300/70 uppercase">Score</span>
              <span className="font-bold text-amber-300">{gameState.score}</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-[9px] text-indigo-300/70 uppercase">Zetten</span>
              <span className="font-bold text-cyan-300">{gameState.movesCount}</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-[9px] text-indigo-300/70 uppercase">Tijd</span>
              <span className="font-bold text-emerald-300">{formatTime(timerSeconds)}</span>
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Undo */}
          <button
            onClick={handleUndo}
            disabled={gameState.history.length === 0}
            title="Herstel laatste zet"
            className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-900/80 hover:bg-slate-800 disabled:opacity-40 border border-indigo-400/40 rounded-md text-xs font-bold font-mono transition-all active:scale-95"
          >
            <Undo2 className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Herstel</span>
          </button>

          {/* Hint */}
          <button
            onClick={handleHint}
            title="Bekijk een slimme zet"
            className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-900/80 hover:bg-slate-800 border border-indigo-400/40 rounded-md text-xs font-bold font-mono transition-all active:scale-95"
          >
            <Lightbulb className="w-3.5 h-3.5 text-yellow-300" />
            <span className="hidden sm:inline">Hint</span>
          </button>

          {/* New Game */}
          <button
            onClick={() => handleStartNewGame()}
            title="Nieuw spel"
            className="flex items-center gap-1 px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs rounded-md border border-indigo-300 shadow transition-all active:scale-95"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Nieuw</span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 bg-slate-900/80 hover:bg-slate-800 border border-indigo-400/40 rounded-md transition-all active:scale-95"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-red-400" />}
          </button>

          {/* High Scores */}
          <button
            onClick={() => setShowHighScoresModal(true)}
            className="p-2 bg-slate-900/80 hover:bg-slate-800 border border-indigo-400/40 rounded-md transition-all active:scale-95"
          >
            <Trophy className="w-4 h-4 text-yellow-400" />
          </button>

          {/* History / Rules */}
          <button
            onClick={() => setShowHistoryModal(true)}
            className="p-2 bg-slate-900/80 hover:bg-slate-800 border border-indigo-400/40 rounded-md transition-all active:scale-95"
          >
            <HelpCircle className="w-4 h-4 text-cyan-300" />
          </button>
        </div>
      </header>

      {/* Notification Banners */}
      {hintMessage && (
        <div className="w-full max-w-4xl mx-auto bg-amber-500/20 border border-amber-400/60 rounded-lg p-2 text-center text-xs font-mono font-bold text-amber-200 animate-fade-in z-20 mb-1">
          💡 {hintMessage}
        </div>
      )}
      {errorMessage && (
        <div className="w-full max-w-4xl mx-auto bg-red-500/20 border border-red-400/60 rounded-lg p-2 text-center text-xs font-mono font-bold text-red-200 animate-fade-in z-20 mb-1">
          ⚠️ {errorMessage}
        </div>
      )}

      {/* Main Playing Arena */}
      <main className="w-full max-w-7xl flex-1 flex flex-col justify-start items-center relative my-1 gap-2">
        
        {/* Top Tray: Completed Suits (Left) & Stock Deals (Right) */}
        <div className="w-full flex items-center justify-between px-2 sm:px-4">
          
          {/* Completed Suits Foundations (8 slots) */}
          <div className="flex items-center gap-1 sm:gap-2 bg-black/40 px-3 py-1.5 rounded-xl border border-indigo-500/30">
            <span className="text-[10px] font-mono font-bold text-indigo-300 uppercase tracking-tighter hidden md:inline">
              VOLTOOID ({gameState.completedSuits}/8):
            </span>
            <div className="flex items-center gap-1">
              {Array.from({ length: 8 }).map((_, idx) => (
                <div
                  key={idx}
                  className={`w-7 h-10 sm:w-9 sm:h-12 rounded border flex items-center justify-center font-bold text-xs ${
                    idx < gameState.completedSuits
                      ? 'bg-amber-400 text-black border-amber-300 shadow-md animate-scale-up'
                      : 'border-dashed border-indigo-400/30 text-indigo-500/30 bg-black/20'
                  }`}
                >
                  {idx < gameState.completedSuits ? '👑' : '♠'}
                </div>
              ))}
            </div>
          </div>

          {/* Stock Pile (5 Deals Remaining) */}
          <div className="flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-xl border border-indigo-500/30">
            <div className="text-right">
              <span className="text-[10px] font-mono font-bold text-cyan-300 uppercase block">
                TREKSTAPEL
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                {gameState.stock.length} van 5 deelrondes
              </span>
            </div>

            <button
              onClick={handleDealStock}
              disabled={gameState.stock.length === 0}
              className={`w-10 h-14 sm:w-12 sm:h-16 rounded-md border-2 relative flex items-center justify-center font-mono font-black text-xs shadow-lg transition-all ${
                gameState.stock.length > 0
                  ? 'bg-indigo-900 hover:bg-indigo-800 border-indigo-300 hover:scale-105 active:scale-95 cursor-pointer text-white ring-2 ring-indigo-500/40'
                  : 'bg-slate-900 border-slate-700 opacity-40 cursor-not-allowed text-slate-500'
              }`}
            >
              {gameState.stock.length > 0 ? (
                <div className="flex flex-col items-center">
                  <span className="text-xs">🎴</span>
                  <span className="text-[10px]">{gameState.stock.length}</span>
                </div>
              ) : (
                '0'
              )}
            </button>
          </div>
        </div>

        {/* 10 TABLEAU COLUMNS */}
        <div className="w-full grid grid-cols-10 gap-1 sm:gap-2 px-1 sm:px-2 min-h-[420px]">
          {gameState.columns.map((col, colIdx) => (
            <div
              key={colIdx}
              onClick={() => col.length === 0 && handleEmptyColumnClick(colIdx)}
              className={`flex flex-col items-center relative min-h-[300px] rounded-lg p-0.5 border border-dashed transition-colors ${
                col.length === 0 ? 'border-indigo-400/40 bg-black/20 hover:border-amber-400 cursor-pointer' : 'border-transparent'
              }`}
            >
              {col.length === 0 && (
                <span className="text-[9px] font-mono font-bold text-indigo-400/40 mt-2">
                  K{colIdx + 1}
                </span>
              )}

              {col.map((card, cardIdx) => {
                const isSelected = selectedCol === colIdx && selectedCardIdx !== null && cardIdx >= selectedCardIdx;
                const isRed = getSpiderCardColor(card.suit) === 'red';

                return (
                  <div
                    key={card.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCardClick(colIdx, cardIdx);
                    }}
                    style={{
                      marginTop: cardIdx === 0 ? '0px' : card.faceUp ? '-46px' : '-54px',
                      zIndex: cardIdx + 1
                    }}
                    className={`w-full max-w-[85px] h-14 sm:h-20 md:h-24 rounded-md border-2 shadow-sm relative select-none flex flex-col justify-between p-0.5 sm:p-1 cursor-pointer transition-all ${
                      !card.faceUp
                        ? 'bg-indigo-900 border-indigo-950 shadow-inner'
                        : isRed
                        ? 'bg-white text-red-600 border-slate-300'
                        : 'bg-white text-slate-950 border-slate-300'
                    } ${
                      isSelected
                        ? '-translate-y-2 ring-4 ring-amber-400 border-amber-500 shadow-amber-500/40 shadow-xl z-40'
                        : card.faceUp
                        ? 'hover:-translate-y-1'
                        : ''
                    }`}
                  >
                    {card.faceUp ? (
                      <>
                        <div className="flex flex-col items-center leading-none self-start">
                          <span className="font-mono font-black text-[11px] sm:text-sm md:text-base">
                            {SPIDER_RANK_NAMES[card.rank]}
                          </span>
                          <span className="text-[9px] sm:text-xs mt-[-1px]">
                            {SPIDER_SUIT_SYMBOLS[card.suit]}
                          </span>
                        </div>

                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <span className="text-xs sm:text-xl opacity-75">
                            {SPIDER_SUIT_SYMBOLS[card.suit]}
                          </span>
                        </div>

                        <div className="flex flex-col items-center leading-none self-end rotate-180">
                          <span className="font-mono font-black text-[11px] sm:text-sm md:text-base">
                            {SPIDER_RANK_NAMES[card.rank]}
                          </span>
                          <span className="text-[9px] sm:text-xs mt-[-1px]">
                            {SPIDER_SUIT_SYMBOLS[card.suit]}
                          </span>
                        </div>
                      </>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center opacity-30 text-white font-mono text-[9px]">
                        🕷️
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </main>

      {/* Footer Instructions */}
      <footer className="w-full max-w-7xl flex items-center justify-between border-t border-indigo-500/30 pt-2 text-[10px] sm:text-xs text-indigo-200/80 font-mono z-20">
        <div>
          <span>🎯 Doel: Bouw 8 reeksen van Koning (K) tot Aas (A) van dezelfde kleur • Deel pas als alle kolommen bezet zijn!</span>
        </div>
        <div>
          <span>Windows Spider Solitaire v1.0 • 100% TypeScript</span>
        </div>
      </footer>

      {/* Win Modal */}
      {showWinModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-indigo-400 rounded-xl max-w-md w-full p-6 text-white text-center shadow-2xl animate-fade-in font-mono">
            <span className="text-5xl mb-2 block">🕷️👑✨</span>
            <h2 className="font-black text-2xl text-indigo-400 mb-1">
              GEFELICITEERD! SPIDER OPGELOST!
            </h2>
            <p className="text-xs text-slate-300 mb-4">
              Moeilijkheid: <strong>{gameState.difficulty} Kleur(en)</strong> • Score: <strong>{gameState.score}</strong> • Zetten: <strong>{gameState.movesCount}</strong> • Tijd: <strong>{formatTime(timerSeconds)}</strong>
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
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded text-white text-sm focus:border-indigo-400 outline-none"
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
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded text-white text-sm focus:border-indigo-400 outline-none uppercase"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2 bg-indigo-500 hover:bg-indigo-400 text-white font-black text-sm rounded shadow transition-all active:scale-95"
              >
                Opslaan in Spider Hall of Fame
              </button>
            </form>

            <button
              type="button"
              onClick={() => handleStartNewGame(gameState.difficulty)}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded"
            >
              Speel Nieuw Potje Spider ▶
            </button>
          </div>
        </div>
      )}

      {/* High Scores Modal */}
      {showHighScoresModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-indigo-500/60 rounded-xl max-w-lg w-full p-6 text-white shadow-2xl font-mono">
            <div className="flex items-center justify-between border-b border-slate-700 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Trophy className="w-6 h-6 text-yellow-400" />
                <h3 className="font-black text-lg text-indigo-300">SPIDER SOLITAIRE HALL OF FAME</h3>
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
                <span className="text-slate-400 text-[9px]">TOP 1 KLEUR</span>
                <p className="font-bold text-indigo-400">{stats.bestScore1Suit} pt</p>
              </div>
              <div>
                <span className="text-slate-400 text-[9px]">TOP 4 KLEUREN</span>
                <p className="font-bold text-purple-400">{stats.bestScore4Suits} pt</p>
              </div>
            </div>

            <div className="overflow-y-auto max-h-64 mb-4">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="py-1">#</th>
                    <th>NAAM</th>
                    <th>KLEUREN</th>
                    <th>SCORE</th>
                    <th>ZETTEN</th>
                    <th>DATUM</th>
                  </tr>
                </thead>
                <tbody>
                  {highScores.map((entry, idx) => (
                    <tr key={idx} className="border-b border-slate-800/40 hover:bg-slate-800/40">
                      <td className="py-1.5 text-amber-400 font-bold">{idx + 1}</td>
                      <td className="font-bold text-white">{entry.name}</td>
                      <td className="text-indigo-300">{entry.difficulty}K</td>
                      <td className="text-emerald-400 font-bold">{entry.score} pt</td>
                      <td className="text-slate-300">{entry.moves}</td>
                      <td className="text-slate-500">{entry.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <button
              onClick={() => setShowHighScoresModal(false)}
              className="w-full py-2 bg-indigo-500 hover:bg-indigo-400 text-white font-bold rounded-md"
            >
              Sluiten
            </button>
          </div>
        </div>
      )}

      {/* Historical Dossier & Rules */}
      <SpiderHistoryModal
        isOpen={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
        onPlayGame={() => {
          setShowHistoryModal(false);
          handleStartNewGame();
        }}
        lang="nl"
      />
    </div>
  );
};
