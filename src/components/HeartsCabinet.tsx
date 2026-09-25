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
  ArrowRight,
  ArrowUp,
  Ban,
  Award,
  Flame,
  Zap,
  Play
} from 'lucide-react';
import {
  Card,
  PlayerId,
  PassDirection,
  HeartsGameState,
  RoundScoreRecord
} from '../game/heartsTypes';
import {
  HeartsEngine,
  SUIT_SYMBOLS,
  RANK_NAMES,
  getCardColor
} from '../game/heartsEngine';
import { heartsAudio } from '../game/heartsAudio';
import {
  getHeartsHighScores,
  saveHeartsHighScore,
  getHeartsStats,
  updateHeartsStats,
  HeartsHighScoreEntry
} from '../game/heartsHighScores';
import { HeartsHistoryModal } from './HeartsHistoryModal';
import { haptics } from '../utils/haptics';

interface HeartsCabinetProps {
  onBackToLobby: () => void;
}

export const HeartsCabinet: React.FC<HeartsCabinetProps> = ({ onBackToLobby }) => {
  const [engine] = useState(() => new HeartsEngine(100));
  const [gameState, setGameState] = useState<HeartsGameState>(() => ({ ...engine.state }));
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Passing UI State
  const [selectedPassCards, setSelectedPassCards] = useState<Card[]>([]);

  // Modals & Popups
  const [showHistory, setShowHistory] = useState(false);
  const [showScoreSheet, setShowScoreSheet] = useState(false);
  const [showHighScores, setShowHighScores] = useState(false);
  const [showGameOverModal, setShowGameOverModal] = useState(false);
  const [playerName, setPlayerName] = useState('');
  const [playerInitials, setPlayerInitials] = useState('YOU');
  const [highScores, setHighScores] = useState<HeartsHighScoreEntry[]>([]);
  const [stats, setStats] = useState(() => getHeartsStats());

  // AI Turn delay timer
  const aiTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setHighScores(getHeartsHighScores());
  }, []);

  useEffect(() => {
    heartsAudio.enabled = soundEnabled;
  }, [soundEnabled]);

  // Handle AI Turns when it's not player 0's turn
  const runAiTurn = useCallback(() => {
    if (gameState.phase !== 'playing') return;
    const turn = gameState.turn;
    if (turn === 0) return; // Human turn

    aiTimerRef.current = setTimeout(() => {
      const card = engine.chooseAiCardToPlay(turn);
      if (card) {
        if (card.suit === 'hearts') {
          if (!engine.state.heartsBroken) {
            heartsAudio.playHeartsBroken();
          }
        } else if (card.suit === 'spades' && card.rank === 12) {
          heartsAudio.playQueenOfSpades();
          haptics.softClick();
        } else {
          heartsAudio.playCardPlay();
        }
        engine.playCard(turn, card);
        setGameState({ ...engine.state });
      }
    }, 650);
  }, [engine, gameState.phase, gameState.turn]);

  useEffect(() => {
    if (gameState.phase === 'playing' && gameState.turn !== 0) {
      runAiTurn();
    } else if (gameState.phase === 'trick_review') {
      // Auto-advance trick review after 1.4s
      const timer = setTimeout(() => {
        const lastTrick = engine.state.currentTrick;
        const hasPoints = lastTrick.some(tc => tc.card.suit === 'hearts' || (tc.card.suit === 'spades' && tc.card.rank === 12));
        heartsAudio.playTrickTaken(hasPoints);
        haptics.softClick();

        engine.completeTrickReview();
        setGameState({ ...engine.state });
      }, 1400);

      return () => clearTimeout(timer);
    } else if (gameState.phase === 'game_over') {
      setShowGameOverModal(true);
      const isWinner = gameState.winnerId === 0;
      if (isWinner) {
        heartsAudio.playWin();
        haptics.success();
      }
      const newStats = updateHeartsStats(
        isWinner,
        gameState.players[0].totalScore,
        gameState.history.filter(h => h.moonShooter === 0).length
      );
      setStats(newStats);
    }

    return () => {
      if (aiTimerRef.current) clearTimeout(aiTimerRef.current);
    };
  }, [gameState.phase, gameState.turn, engine, runAiTurn]);

  // Start new round or new game
  const handleStartNextRound = () => {
    setSelectedPassCards([]);
    engine.startRound(gameState.roundNumber + 1);
    heartsAudio.playCardDeal();
    haptics.buttonPress();
    setGameState({ ...engine.state });
  };

  const handleNewGame = () => {
    setSelectedPassCards([]);
    setShowGameOverModal(false);
    setShowScoreSheet(false);
    const nextState = engine.initGame(100);
    heartsAudio.playCardDeal();
    haptics.buttonPress();
    setGameState({ ...nextState });
  };

  // Card click handling
  const handleCardClick = (card: Card) => {
    if (gameState.phase === 'passing') {
      // Toggle card selection for passing
      const alreadySelected = selectedPassCards.some(c => c.id === card.id);
      if (alreadySelected) {
        setSelectedPassCards(selectedPassCards.filter(c => c.id !== card.id));
        heartsAudio.playCardPlay();
        haptics.softClick();
      } else {
        if (selectedPassCards.length < 3) {
          setSelectedPassCards([...selectedPassCards, card]);
          heartsAudio.playCardPlay();
          haptics.softClick();
        }
      }
      return;
    }

    if (gameState.phase === 'playing' && gameState.turn === 0) {
      const check = engine.isCardPlayable(0, card);
      if (check.valid) {
        if (card.suit === 'hearts' && !engine.state.heartsBroken) {
          heartsAudio.playHeartsBroken();
        } else if (card.suit === 'spades' && card.rank === 12) {
          heartsAudio.playQueenOfSpades();
          haptics.softClick();
        } else {
          heartsAudio.playCardPlay();
        }
        engine.playCard(0, card);
        setGameState({ ...engine.state });
      }
    }
  };

  // Confirm passing 3 cards
  const handleConfirmPass = () => {
    if (selectedPassCards.length !== 3) return;
    engine.setHumanPassedCards(selectedPassCards);
    heartsAudio.playPassWhoosh();
    haptics.buttonPress();
    engine.confirmPassing();
    setSelectedPassCards([]);
    setGameState({ ...engine.state });
  };

  // Save score to Hall of Fame
  const handleSaveScore = (e: React.FormEvent) => {
    e.preventDefault();
    const entry: HeartsHighScoreEntry = {
      name: playerName.trim() || 'Hartenjager',
      initials: (playerInitials.trim() || 'YOU').toUpperCase().slice(0, 3),
      score: gameState.players[0].totalScore,
      roundsPlayed: gameState.roundNumber,
      moonShots: gameState.history.filter(h => h.moonShooter === 0).length,
      date: new Date().toISOString().split('T')[0]
    };
    const updated = saveHeartsHighScore(entry);
    setHighScores(updated);
    setShowGameOverModal(false);
    setShowHighScores(true);
  };

  const getPassDirectionLabel = (dir: PassDirection) => {
    switch (dir) {
      case 'left': return '⬅️ Naar Links (Michele)';
      case 'right': return '➡️ Naar Rechts (Paul)';
      case 'across': return '⬆️ Oversteken (Ben)';
      case 'none': return '❌ Geen Doorgifte';
    }
  };

  return (
    <div className="min-h-screen bg-[#07472d] text-white flex flex-col justify-between p-2 sm:p-4 select-none relative overflow-hidden font-sans">
      
      {/* Header Window Bar */}
      <header className="w-full max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-2 border-b border-emerald-500/40 pb-2 mb-2 z-20">
        
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
            <span className="text-xl sm:text-2xl">❤️</span>
            <div>
              <h1 className="font-mono font-black text-base sm:text-xl tracking-wider text-white flex items-center gap-2">
                HARTENJAGEN <span className="text-[10px] sm:text-xs px-1.5 py-0.5 rounded bg-red-600 text-white font-bold">HEARTS 1992</span>
              </h1>
              <div className="text-[10px] sm:text-xs text-emerald-200/90">
                The Microsoft Hearts Network • Windows 3.1 & 95 Classic
              </div>
            </div>
          </div>
        </div>

        {/* Center: Live Round & Passing Banner */}
        <div className="flex items-center gap-3 bg-black/40 border border-emerald-500/30 px-3 py-1.5 rounded-lg text-xs font-mono">
          <div className="flex flex-col items-center">
            <span className="text-[9px] text-emerald-300/70 uppercase">Ronde</span>
            <span className="font-bold text-amber-300">#{gameState.roundNumber}</span>
          </div>
          <div className="w-[1px] h-6 bg-emerald-500/30"></div>
          <div className="flex flex-col items-center">
            <span className="text-[9px] text-emerald-300/70 uppercase">Doorgifte</span>
            <span className="font-bold text-cyan-300">{getPassDirectionLabel(gameState.passDirection)}</span>
          </div>
          <div className="w-[1px] h-6 bg-emerald-500/30"></div>
          <div className="flex flex-col items-center">
            <span className="text-[9px] text-emerald-300/70 uppercase">Harten</span>
            <span className={`font-bold ${gameState.heartsBroken ? 'text-red-400' : 'text-slate-400'}`}>
              {gameState.heartsBroken ? '💔 Gebroken' : '❤️ Heilig'}
            </span>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Score Sheet */}
          <button
            onClick={() => setShowScoreSheet(true)}
            title="Scorebord & Rondestanden"
            className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-900/80 hover:bg-slate-800 border border-emerald-400/40 rounded-md text-xs font-bold font-mono transition-all active:scale-95"
          >
            <Table className="w-4 h-4 text-cyan-300" />
            <span className="hidden sm:inline">Scorebord</span>
          </button>

          {/* New Game */}
          <button
            onClick={handleNewGame}
            title="Nieuw Spel"
            className="flex items-center gap-1 px-2.5 py-1.5 bg-amber-600 hover:bg-amber-500 text-slate-950 font-black text-xs rounded-md border border-amber-300 shadow transition-all active:scale-95"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Nieuw Spel</span>
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
            onClick={() => setShowHighScores(true)}
            className="p-2 bg-slate-900/80 hover:bg-slate-800 border border-emerald-400/40 rounded-md transition-all active:scale-95"
          >
            <Trophy className="w-4 h-4 text-yellow-400" />
          </button>

          {/* History */}
          <button
            onClick={() => setShowHistory(true)}
            className="p-2 bg-slate-900/80 hover:bg-slate-800 border border-emerald-400/40 rounded-md transition-all active:scale-95"
          >
            <HelpCircle className="w-4 h-4 text-cyan-300" />
          </button>
        </div>
      </header>

      {/* Main Playing Felt Table */}
      <main className="w-full max-w-5xl flex-1 flex flex-col justify-between items-center relative my-1 sm:my-2">
        
        {/* NORTH: Ben */}
        <div className="flex flex-col items-center z-10">
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full border transition-all ${
            gameState.turn === 2 && gameState.phase === 'playing'
              ? 'bg-amber-500/30 border-amber-400 scale-105 shadow-lg shadow-amber-500/20 ring-2 ring-amber-400'
              : 'bg-black/50 border-emerald-500/40'
          }`}>
            <span className="text-base">{gameState.players[2].avatar}</span>
            <span className="font-mono font-bold text-xs">{gameState.players[2].name}</span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/60 text-amber-300">
              {gameState.players[2].totalScore} pt
            </span>
          </div>
          {/* North Hand representation */}
          <div className="flex -space-x-4 sm:-space-x-6 mt-1">
            {gameState.players[2].hand.map((_, i) => (
              <div
                key={i}
                className="w-6 h-9 sm:w-8 sm:h-12 bg-blue-800 border border-white/60 rounded shadow-sm"
              />
            ))}
          </div>
        </div>

        {/* MIDDLE ROW: West, Center Trick Arena, East */}
        <div className="w-full flex items-center justify-between px-2 sm:px-8 my-auto">
          
          {/* WEST: Michele */}
          <div className="flex flex-col items-center">
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full border transition-all ${
              gameState.turn === 1 && gameState.phase === 'playing'
                ? 'bg-amber-500/30 border-amber-400 scale-105 shadow-lg shadow-amber-500/20 ring-2 ring-amber-400'
                : 'bg-black/50 border-emerald-500/40'
            }`}>
              <span className="text-base">{gameState.players[1].avatar}</span>
              <span className="font-mono font-bold text-xs">{gameState.players[1].name}</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/60 text-amber-300">
                {gameState.players[1].totalScore} pt
              </span>
            </div>
            {/* Vertical cards */}
            <div className="flex flex-col -space-y-6 sm:-space-y-8 mt-1">
              {gameState.players[1].hand.map((_, i) => (
                <div
                  key={i}
                  className="w-9 h-6 sm:w-12 sm:h-8 bg-blue-800 border border-white/60 rounded shadow-sm"
                />
              ))}
            </div>
          </div>

          {/* CENTER ARENA: 4 Trick Cards Cross */}
          <div className="relative w-48 h-48 sm:w-64 sm:h-64 rounded-2xl bg-black/30 border-2 border-dashed border-emerald-500/40 flex items-center justify-center p-4">
            
            {/* Status in center if empty */}
            {gameState.currentTrick.length === 0 && gameState.phase === 'playing' && (
              <div className="text-center font-mono text-xs text-emerald-300/80 animate-pulse">
                <span>{gameState.players[gameState.turn].name} komt uit...</span>
              </div>
            )}

            {/* Passing Phase Action Banner in Center */}
            {gameState.phase === 'passing' && (
              <div className="flex flex-col items-center text-center p-3 bg-black/80 border border-amber-400/80 rounded-xl max-w-[240px] shadow-2xl z-30">
                <span className="text-xs font-mono font-bold text-amber-300 mb-1">
                  Kies 3 kaarten om door te geven
                </span>
                <span className="text-[11px] font-mono text-white mb-2">
                  {getPassDirectionLabel(gameState.passDirection)}
                </span>
                <button
                  onClick={handleConfirmPass}
                  disabled={selectedPassCards.length !== 3}
                  className="px-4 py-1.5 bg-gradient-to-r from-amber-500 to-emerald-500 hover:from-amber-400 hover:to-emerald-400 disabled:opacity-30 text-black font-mono font-black text-xs rounded shadow transition-all active:scale-95"
                >
                  Geef Door ({selectedPassCards.length}/3)
                </button>
              </div>
            )}

            {/* Round Over Banner in Center */}
            {gameState.phase === 'round_over' && (
              <div className="flex flex-col items-center text-center p-4 bg-slate-900 border-2 border-emerald-400 rounded-xl shadow-2xl z-30 animate-fade-in">
                {gameState.isMoonShotThisRound ? (
                  <div className="mb-2">
                    <span className="text-3xl block">🚀🌕</span>
                    <span className="font-mono font-black text-amber-300 text-sm">
                      {gameState.players[gameState.moonShooterId!].name} HEEFT DE MAAN GESCHOTEN!
                    </span>
                    <p className="text-[10px] text-cyan-200">
                      Alle andere 3 spelers krijgen +26 strafpunten!
                    </p>
                  </div>
                ) : (
                  <div className="mb-2">
                    <span className="text-2xl block">🏆</span>
                    <span className="font-mono font-bold text-emerald-300 text-sm">
                      Ronde #{gameState.roundNumber} Voltooid!
                    </span>
                  </div>
                )}
                <button
                  onClick={handleStartNextRound}
                  className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-mono font-black text-xs rounded-md shadow transition-all active:scale-95"
                >
                  Volgende Ronde #{gameState.roundNumber + 1} ▶
                </button>
              </div>
            )}

            {/* Render Trick Cards (North, West, South, East positions) */}
            {gameState.currentTrick.map(tc => {
              const isRed = getCardColor(tc.card.suit) === 'red';
              const isQueen = tc.card.suit === 'spades' && tc.card.rank === 12;

              let posClass = '';
              if (tc.playerId === 2) posClass = 'top-2 left-1/2 -translate-x-1/2';
              if (tc.playerId === 1) posClass = 'left-2 top-1/2 -translate-y-1/2';
              if (tc.playerId === 3) posClass = 'right-2 top-1/2 -translate-y-1/2';
              if (tc.playerId === 0) posClass = 'bottom-2 left-1/2 -translate-x-1/2';

              return (
                <div
                  key={tc.card.id}
                  className={`absolute ${posClass} w-12 h-16 sm:w-16 sm:h-22 bg-white border-2 rounded-md shadow-xl flex flex-col justify-between p-1 select-none transition-all duration-300 animate-scale-up ${
                    isQueen ? 'border-purple-600 ring-4 ring-purple-500 animate-pulse' : 'border-slate-300'
                  } ${isRed ? 'text-red-600' : 'text-slate-950'}`}
                >
                  <div className="flex flex-col items-center leading-none self-start">
                    <span className="font-mono font-black text-xs sm:text-sm">{RANK_NAMES[tc.card.rank]}</span>
                    <span className="text-[10px] sm:text-xs">{SUIT_SYMBOLS[tc.card.suit]}</span>
                  </div>
                  <div className="self-center text-sm sm:text-lg">
                    {SUIT_SYMBOLS[tc.card.suit]}
                  </div>
                  <div className="flex flex-col items-center leading-none self-end rotate-180">
                    <span className="font-mono font-black text-xs sm:text-sm">{RANK_NAMES[tc.card.rank]}</span>
                    <span className="text-[10px] sm:text-xs">{SUIT_SYMBOLS[tc.card.suit]}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* EAST: Paul */}
          <div className="flex flex-col items-center">
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full border transition-all ${
              gameState.turn === 3 && gameState.phase === 'playing'
                ? 'bg-amber-500/30 border-amber-400 scale-105 shadow-lg shadow-amber-500/20 ring-2 ring-amber-400'
                : 'bg-black/50 border-emerald-500/40'
            }`}>
              <span className="text-base">{gameState.players[3].avatar}</span>
              <span className="font-mono font-bold text-xs">{gameState.players[3].name}</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/60 text-amber-300">
                {gameState.players[3].totalScore} pt
              </span>
            </div>
            {/* Vertical cards */}
            <div className="flex flex-col -space-y-6 sm:-space-y-8 mt-1">
              {gameState.players[3].hand.map((_, i) => (
                <div
                  key={i}
                  className="w-9 h-6 sm:w-12 sm:h-8 bg-blue-800 border border-white/60 rounded shadow-sm"
                />
              ))}
            </div>
          </div>
        </div>

        {/* SOUTH: Human Player Hand */}
        <div className="flex flex-col items-center z-10 w-full mt-2">
          
          <div className={`flex items-center gap-2 px-3 py-1 mb-2 rounded-full border transition-all ${
            gameState.turn === 0 && gameState.phase === 'playing'
              ? 'bg-amber-500/30 border-amber-400 scale-105 shadow-lg shadow-amber-500/20 ring-2 ring-amber-400'
              : 'bg-black/50 border-emerald-500/40'
          }`}>
            <span className="text-base">{gameState.players[0].avatar}</span>
            <span className="font-mono font-bold text-xs">{gameState.players[0].name}</span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/60 text-amber-300 font-bold">
              {gameState.players[0].totalScore} pt
            </span>
          </div>

          {/* Interactive Player Hand */}
          <div className="flex flex-wrap justify-center -space-x-3 sm:-space-x-4 max-w-full overflow-x-auto px-2 pb-2">
            {gameState.players[0].hand.map(card => {
              const isRed = getCardColor(card.suit) === 'red';
              const isPlayable = gameState.phase === 'playing' && gameState.turn === 0 && engine.isCardPlayable(0, card).valid;
              const isSelectedForPass = selectedPassCards.some(c => c.id === card.id);
              const isQueen = card.suit === 'spades' && card.rank === 12;

              return (
                <div
                  key={card.id}
                  onClick={() => handleCardClick(card)}
                  className={`w-11 h-16 sm:w-16 sm:h-24 md:w-20 md:h-28 bg-white rounded-md border-2 shadow-lg relative select-none flex flex-col justify-between p-1 sm:p-1.5 cursor-pointer transition-all duration-150 ${
                    isRed ? 'text-red-600' : 'text-slate-950'
                  } ${
                    isSelectedForPass
                      ? '-translate-y-6 ring-4 ring-amber-400 border-amber-500 shadow-amber-500/40 shadow-xl z-30'
                      : ''
                  } ${
                    gameState.phase === 'playing' && isPlayable
                      ? 'hover:-translate-y-4 hover:border-amber-400 border-slate-300 ring-2 ring-emerald-400/50'
                      : gameState.phase === 'playing' && gameState.turn === 0
                      ? 'opacity-40 cursor-not-allowed border-slate-400'
                      : 'border-slate-300 hover:-translate-y-2'
                  }`}
                >
                  <div className="flex flex-col items-center leading-none self-start">
                    <span className="font-mono font-black text-xs sm:text-base md:text-lg tracking-tighter">
                      {RANK_NAMES[card.rank]}
                    </span>
                    <span className="text-[10px] sm:text-xs md:text-sm mt-[-1px]">
                      {SUIT_SYMBOLS[card.suit]}
                    </span>
                  </div>

                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <span className={`text-sm sm:text-2xl md:text-3xl opacity-85 ${isQueen ? 'text-purple-700 font-bold' : ''}`}>
                      {SUIT_SYMBOLS[card.suit]}
                    </span>
                  </div>

                  <div className="flex flex-col items-center leading-none self-end rotate-180">
                    <span className="font-mono font-black text-xs sm:text-base md:text-lg tracking-tighter">
                      {RANK_NAMES[card.rank]}
                    </span>
                    <span className="text-[10px] sm:text-xs md:text-sm mt-[-1px]">
                      {SUIT_SYMBOLS[card.suit]}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {/* Footer Instructions */}
      <footer className="w-full max-w-6xl flex items-center justify-between border-t border-emerald-500/30 pt-2 text-[10px] sm:text-xs text-emerald-200/80 font-mono z-20">
        <div>
          <span>🎯 Doel: Vermijd strafpunten (Harten = 1 pt, ♠Vrouw = 13 pt) • Laagste score wint bij 100 pt!</span>
        </div>
        <div>
          <span>Win95 Hearts v1.0 • 100% TypeScript</span>
        </div>
      </footer>

      {/* Score Sheet Modal */}
      {showScoreSheet && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-cyan-500/60 rounded-xl max-w-lg w-full p-6 text-white shadow-2xl font-mono">
            <div className="flex items-center justify-between border-b border-slate-700 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Table className="w-6 h-6 text-cyan-400" />
                <h3 className="font-black text-lg text-cyan-300">SCOREBORD OVERZICHT</h3>
              </div>
              <button
                onClick={() => setShowScoreSheet(false)}
                className="text-slate-400 hover:text-white text-xl"
              >
                ✕
              </button>
            </div>

            <div className="overflow-y-auto max-h-64 mb-4">
              <table className="w-full text-center text-xs">
                <thead>
                  <tr className="border-b border-slate-700 text-slate-400">
                    <th className="py-2 text-left">Ronde</th>
                    <th className="text-emerald-300">{gameState.players[0].name}</th>
                    <th className="text-purple-300">{gameState.players[1].name}</th>
                    <th className="text-blue-300">{gameState.players[2].name}</th>
                    <th className="text-amber-300">{gameState.players[3].name}</th>
                  </tr>
                </thead>
                <tbody>
                  {gameState.history.map((rec, i) => (
                    <tr key={i} className="border-b border-slate-800/40">
                      <td className="py-2 text-left font-bold text-slate-400">#{rec.roundNumber}</td>
                      <td className="text-emerald-300 font-bold">{rec.cumulativeScores[0]} (+{rec.scores[0]})</td>
                      <td className="text-purple-300 font-bold">{rec.cumulativeScores[1]} (+{rec.scores[1]})</td>
                      <td className="text-blue-300 font-bold">{rec.cumulativeScores[2]} (+{rec.scores[2]})</td>
                      <td className="text-amber-300 font-bold">{rec.cumulativeScores[3]} (+{rec.scores[3]})</td>
                    </tr>
                  ))}
                  <tr className="bg-slate-950 font-black border-t-2 border-cyan-500/60">
                    <td className="py-2 text-left text-cyan-300">TOTAAL</td>
                    <td className="text-emerald-400 text-sm">{gameState.players[0].totalScore}</td>
                    <td className="text-purple-400 text-sm">{gameState.players[1].totalScore}</td>
                    <td className="text-blue-400 text-sm">{gameState.players[2].totalScore}</td>
                    <td className="text-amber-400 text-sm">{gameState.players[3].totalScore}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <button
              onClick={() => setShowScoreSheet(false)}
              className="w-full py-2 bg-cyan-500 hover:bg-cyan-400 text-black font-black text-xs rounded"
            >
              Sluiten
            </button>
          </div>
        </div>
      )}

      {/* Game Over Modal */}
      {showGameOverModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-emerald-400 rounded-xl max-w-md w-full p-6 text-white text-center shadow-2xl animate-fade-in font-mono">
            <span className="text-5xl mb-2 block">{gameState.winnerId === 0 ? '🏆' : '💀'}</span>
            <h2 className="font-black text-2xl text-emerald-400 mb-1">
              {gameState.winnerId === 0 ? 'GEFELICITEERD! JIJ WINT!' : `${gameState.players[gameState.winnerId!].name} WINT HET SPEL!`}
            </h2>
            <p className="text-xs text-slate-300 mb-4">
              De scorelimiet van 100 punten is bereikt!
            </p>

            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 grid grid-cols-4 gap-2 text-xs mb-4">
              {gameState.players.map(p => (
                <div key={p.id} className={p.id === gameState.winnerId ? 'text-emerald-400 font-bold' : 'text-slate-400'}>
                  <span className="text-[10px] block">{p.name.split(' ')[0]}</span>
                  <p className="text-base font-black">{p.totalScore} pt</p>
                </div>
              ))}
            </div>

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
                Score Opslaan in Hall of Fame
              </button>
            </form>

            <button
              type="button"
              onClick={handleNewGame}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded"
            >
              Nieuw Potje Hartenjagen
            </button>
          </div>
        </div>
      )}

      {/* High Scores Modal */}
      {showHighScores && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-amber-500/60 rounded-xl max-w-lg w-full p-6 text-white shadow-2xl font-mono">
            <div className="flex items-center justify-between border-b border-slate-700 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Trophy className="w-6 h-6 text-yellow-400" />
                <h3 className="font-black text-lg text-amber-300">HARTENJAGEN HALL OF FAME</h3>
              </div>
              <button
                onClick={() => setShowHighScores(false)}
                className="text-slate-400 hover:text-white text-xl"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2 bg-slate-950 p-3 rounded-lg border border-slate-800 mb-4 text-center text-xs">
              <div>
                <span className="text-slate-400 text-[10px]">GESPEELD</span>
                <p className="font-bold text-white text-sm">{stats.gamesPlayed}</p>
              </div>
              <div>
                <span className="text-slate-400 text-[10px]">GEWONNEN</span>
                <p className="font-bold text-emerald-400 text-sm">{stats.gamesWon}</p>
              </div>
              <div>
                <span className="text-slate-400 text-[10px]">MAAN GESCHOTEN</span>
                <p className="font-bold text-cyan-400 text-sm">{stats.moonShotsTotal} 🌕</p>
              </div>
            </div>

            <div className="overflow-y-auto max-h-64 mb-4">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="py-1">#</th>
                    <th>NAAM</th>
                    <th>INIT</th>
                    <th>SCORE</th>
                    <th>RONDEN</th>
                    <th>DATUM</th>
                  </tr>
                </thead>
                <tbody>
                  {highScores.map((entry, idx) => (
                    <tr key={idx} className="border-b border-slate-800/40 hover:bg-slate-800/40">
                      <td className="py-1.5 text-amber-400 font-bold">{idx + 1}</td>
                      <td className="font-bold text-white">{entry.name}</td>
                      <td className="text-cyan-300">{entry.initials}</td>
                      <td className="text-emerald-400 font-bold">{entry.score} pt</td>
                      <td className="text-slate-300">{entry.roundsPlayed}</td>
                      <td className="text-slate-500">{entry.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <button
              onClick={() => setShowHighScores(false)}
              className="w-full py-2 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-md"
            >
              Sluiten
            </button>
          </div>
        </div>
      )}

      {/* Historical Dossier */}
      <HeartsHistoryModal
        isOpen={showHistory}
        onClose={() => setShowHistory(false)}
        onPlayGame={() => {
          setShowHistory(false);
          handleNewGame();
        }}
        lang="nl"
      />
    </div>
  );
};
