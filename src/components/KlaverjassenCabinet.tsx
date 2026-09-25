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
  Scale,
  Award,
  Flame,
  ShieldAlert,
  Play
} from 'lucide-react';
import {
  KlaverjasCard,
  KlaverjasSuit,
  KlaverjasSystem,
  PlayerId,
  KlaverjasGameState
} from '../game/klaverjasTypes';
import {
  KlaverjasEngine,
  KLAVERJAS_SUITS,
  KLAVERJAS_SUIT_SYMBOLS,
  KLAVERJAS_SUIT_NAMES,
  getKlaverjasCardColor
} from '../game/klaverjasEngine';
import { klaverjasAudio } from '../game/klaverjasAudio';
import {
  getKlaverjasHighScores,
  saveKlaverjasHighScore,
  getKlaverjasStats,
  updateKlaverjasStats,
  KlaverjasHighScoreEntry
} from '../game/klaverjasHighScores';
import { KlaverjassenHistoryModal } from './KlaverjassenHistoryModal';
import { haptics } from '../utils/haptics';

interface KlaverjassenCabinetProps {
  onBackToLobby: () => void;
}

export const KlaverjassenCabinet: React.FC<KlaverjassenCabinetProps> = ({ onBackToLobby }) => {
  const [engine] = useState(() => new KlaverjasEngine('amsterdams', 4));
  const [gameState, setGameState] = useState<KlaverjasGameState>(() => ({ ...engine.state }));
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Player names
  const playerNames = ['Jij (Zuid)', 'Ingrid (West)', 'Henk (Noord - Maat)', 'Jan (Oost)'];

  // Modals
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showScoreSheet, setShowScoreSheet] = useState(false);
  const [showHighScoresModal, setShowHighScoresModal] = useState(false);
  const [showGameOverModal, setShowGameOverModal] = useState(false);
  const [playerName, setPlayerName] = useState('');
  const [playerInitials, setPlayerInitials] = useState('YOU');
  const [highScores, setHighScores] = useState<KlaverjasHighScoreEntry[]>([]);
  const [stats, setStats] = useState(() => getKlaverjasStats());

  // AI Turn delay timer
  const aiTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setHighScores(getKlaverjasHighScores());
  }, []);

  useEffect(() => {
    klaverjasAudio.enabled = soundEnabled;
  }, [soundEnabled]);

  // Handle AI bidding and card playing
  const runAiTurn = useCallback(() => {
    const turn = gameState.turn;
    if (turn === 0) return; // Human turn

    if (gameState.phase === 'bidding') {
      aiTimerRef.current = setTimeout(() => {
        const decision = engine.shouldAiBid(turn);
        if (decision.bid) {
          engine.chooseTrump(turn, decision.suit);
          klaverjasAudio.playTrumpSelected();
          haptics.buttonPress();
        } else {
          engine.passBidding(turn);
          haptics.softClick();
        }
        setGameState({ ...engine.state });
      }, 700);
    } else if (gameState.phase === 'playing') {
      aiTimerRef.current = setTimeout(() => {
        const card = engine.chooseAiCardToPlay(turn);
        if (card) {
          engine.playCard(turn, card);
          klaverjasAudio.playCardSlap();
          haptics.softClick();
          setGameState({ ...engine.state });
        }
      }, 650);
    }
  }, [engine, gameState.phase, gameState.turn]);

  useEffect(() => {
    if (gameState.phase === 'bidding' && gameState.turn !== 0) {
      runAiTurn();
    } else if (gameState.phase === 'playing' && gameState.turn !== 0) {
      runAiTurn();
    } else if (gameState.phase === 'trick_review') {
      // Auto-advance trick review after 1.5 seconds
      const timer = setTimeout(() => {
        if (engine.state.lastTrickRoem > 0) {
          klaverjasAudio.playRoem();
          haptics.success();
        }

        engine.completeTrickReview();
        setGameState({ ...engine.state });
      }, 1500);

      return () => clearTimeout(timer);
    } else if (gameState.phase === 'game_over') {
      setShowGameOverModal(true);
      const isWinner = gameState.cumulativeScore.wij > gameState.cumulativeScore.zij;
      if (isWinner) {
        klaverjasAudio.playPit();
        haptics.success();
      }
      const updated = updateKlaverjasStats(
        isWinner,
        gameState.cumulativeScore.wij,
        gameState.history.filter(h => h.isPit && h.makerTeam === 'wij').length,
        gameState.history.filter(h => h.isNat && h.makerTeam === 'wij').length
      );
      setStats(updated);
    }

    return () => {
      if (aiTimerRef.current) clearTimeout(aiTimerRef.current);
    };
  }, [gameState.phase, gameState.turn, engine, runAiTurn, gameState.cumulativeScore]);

  // System switch
  const handleToggleSystem = (newSys: KlaverjasSystem) => {
    engine.state.system = newSys;
    haptics.selection();
    setGameState({ ...engine.state });
  };

  // Human actions in bidding
  const handleHumanChooseTrump = (suit: KlaverjasSuit) => {
    if (gameState.phase !== 'bidding' || gameState.turn !== 0) return;
    engine.chooseTrump(0, suit);
    klaverjasAudio.playTrumpSelected();
    haptics.buttonPress();
    setGameState({ ...engine.state });
  };

  const handleHumanPass = () => {
    if (gameState.phase !== 'bidding' || gameState.turn !== 0) return;
    engine.passBidding(0);
    haptics.softClick();
    setGameState({ ...engine.state });
  };

  // Human card click
  const handleHumanCardClick = (card: KlaverjasCard) => {
    if (gameState.phase !== 'playing' || gameState.turn !== 0) return;

    const check = engine.isCardPlayable(0, card);
    if (check.valid) {
      engine.playCard(0, card);
      klaverjasAudio.playCardSlap();
      haptics.softClick();
      setGameState({ ...engine.state });
    } else {
      haptics.heavy();
    }
  };

  // Next round or new match
  const handleStartNextRound = () => {
    engine.startRound(gameState.roundNumber + 1);
    klaverjasAudio.playTrumpSelected();
    haptics.buttonPress();
    setGameState({ ...engine.state });
  };

  const handleNewMatch = (sys: KlaverjasSystem = gameState.system) => {
    setShowGameOverModal(false);
    setShowScoreSheet(false);
    engine.initMatch(sys, 4);
    klaverjasAudio.playTrumpSelected();
    haptics.buttonPress();
    setGameState({ ...engine.state });
  };

  // Save High Score
  const handleSaveScore = (e: React.FormEvent) => {
    e.preventDefault();
    const entry: KlaverjasHighScoreEntry = {
      name: playerName.trim() || 'Klaverjasser',
      initials: (playerInitials.trim() || 'YOU').toUpperCase().slice(0, 3),
      system: gameState.system,
      scoreWij: gameState.cumulativeScore.wij,
      scoreZij: gameState.cumulativeScore.zij,
      roemTotal: gameState.history.reduce((acc, h) => acc + h.roemWij, 0),
      date: new Date().toISOString().split('T')[0]
    };
    const updated = saveKlaverjasHighScore(entry);
    setHighScores(updated);
    setShowGameOverModal(false);
    setShowHighScoresModal(true);
  };

  return (
    <div className="min-h-screen bg-[#1c3829] text-white flex flex-col justify-between p-2 sm:p-4 select-none relative overflow-hidden font-sans">
      
      {/* Header Window Bar */}
      <header className="w-full max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-2 border-b border-amber-500/40 pb-2 mb-2 z-20">
        
        {/* Left: Back & Title */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              haptics.buttonPress();
              onBackToLobby();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900/80 hover:bg-slate-800 border border-amber-400/40 rounded-md text-xs sm:text-sm font-bold shadow transition-all hover:scale-105 active:scale-95"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Lobby</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="text-xl sm:text-2xl">♣️</span>
            <div>
              <h1 className="font-mono font-black text-base sm:text-xl tracking-wider text-white flex items-center gap-2">
                KLAVERJASSEN <span className="text-[10px] sm:text-xs px-1.5 py-0.5 rounded bg-amber-600 text-black font-bold uppercase">{gameState.system}</span>
              </h1>
              <div className="text-[10px] sm:text-xs text-amber-200/90">
                Nederlandse Traditie • Wij (Zuid &amp; Henk) vs Zij (Ingrid &amp; Jan)
              </div>
            </div>
          </div>
        </div>

        {/* Center: System Switcher & Live Boompje Score */}
        <div className="flex items-center gap-3 bg-black/40 border border-amber-500/30 px-3 py-1.5 rounded-lg text-xs font-mono">
          {/* Amsterdams / Rotterdams Toggle */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded border border-amber-500/30">
            <button
              onClick={() => handleToggleSystem('amsterdams')}
              className={`px-2 py-0.5 rounded text-[11px] font-bold transition-all ${
                gameState.system === 'amsterdams' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Amsterdams
            </button>
            <button
              onClick={() => handleToggleSystem('rotterdams')}
              className={`px-2 py-0.5 rounded text-[11px] font-bold transition-all ${
                gameState.system === 'rotterdams' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Rotterdams
            </button>
          </div>

          <div className="w-[1px] h-5 bg-amber-500/30"></div>

          {/* Cumulative Score */}
          <div className="flex items-center gap-3">
            <div className="flex flex-col items-center">
              <span className="text-[9px] text-emerald-300 font-bold uppercase">WIJ</span>
              <span className="font-black text-emerald-400 text-sm">{gameState.cumulativeScore.wij}</span>
            </div>
            <span className="text-slate-400 font-black">-</span>
            <div className="flex flex-col items-center">
              <span className="text-[9px] text-red-300 font-bold uppercase">ZIJ</span>
              <span className="font-black text-red-400 text-sm">{gameState.cumulativeScore.zij}</span>
            </div>
          </div>

          <div className="w-[1px] h-5 bg-amber-500/30"></div>

          <div className="flex flex-col items-center">
            <span className="text-[9px] text-amber-300/70 uppercase">Spel</span>
            <span className="font-bold text-amber-300">#{gameState.roundNumber} / {gameState.maxRounds}</span>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Scoreboard */}
          <button
            onClick={() => setShowScoreSheet(true)}
            title="Scorebord & Rondestanden"
            className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-900/80 hover:bg-slate-800 border border-amber-400/40 rounded-md text-xs font-bold font-mono transition-all active:scale-95"
          >
            <Table className="w-4 h-4 text-amber-300" />
            <span className="hidden sm:inline">Scorebord</span>
          </button>

          {/* New Game */}
          <button
            onClick={() => handleNewMatch()}
            title="Nieuw Boompje"
            className="flex items-center gap-1 px-2.5 py-1.5 bg-amber-600 hover:bg-amber-500 text-slate-950 font-black text-xs rounded-md border border-amber-300 shadow transition-all active:scale-95"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Nieuw</span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 bg-slate-900/80 hover:bg-slate-800 border border-amber-400/40 rounded-md transition-all active:scale-95"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-red-400" />}
          </button>

          {/* High Scores */}
          <button
            onClick={() => setShowHighScoresModal(true)}
            className="p-2 bg-slate-900/80 hover:bg-slate-800 border border-amber-400/40 rounded-md transition-all active:scale-95"
          >
            <Trophy className="w-4 h-4 text-yellow-400" />
          </button>

          {/* History / Rules */}
          <button
            onClick={() => setShowHistoryModal(true)}
            className="p-2 bg-slate-900/80 hover:bg-slate-800 border border-amber-400/40 rounded-md transition-all active:scale-95"
          >
            <HelpCircle className="w-4 h-4 text-cyan-300" />
          </button>
        </div>
      </header>

      {/* Main Playing Felt Table */}
      <main className="w-full max-w-5xl flex-1 flex flex-col justify-between items-center relative my-1 select-none">
        
        {/* NORTH: Henk (Je Maat) */}
        <div className="flex flex-col items-center z-10">
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full border transition-all ${
            gameState.turn === 2 && gameState.phase === 'playing'
              ? 'bg-amber-500/30 border-amber-400 scale-105 shadow-lg shadow-amber-500/20 ring-2 ring-amber-400'
              : 'bg-black/50 border-amber-500/40'
          }`}>
            <span className="text-base">🧔</span>
            <span className="font-mono font-bold text-xs text-emerald-300">{playerNames[2]}</span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/60 text-emerald-300">
              Team Wij
            </span>
          </div>
          {/* North Cards */}
          <div className="flex -space-x-4 sm:-space-x-6 mt-1">
            {gameState.hands[2].map((_, i) => (
              <div
                key={i}
                className="w-6 h-9 sm:w-8 sm:h-12 bg-amber-900 border border-white/60 rounded shadow-sm"
              />
            ))}
          </div>
        </div>

        {/* MIDDLE ROW: West, Center Trick Arena, East */}
        <div className="w-full flex items-center justify-between px-2 sm:px-8 my-auto">
          
          {/* WEST: Ingrid */}
          <div className="flex flex-col items-center">
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full border transition-all ${
              gameState.turn === 1 && gameState.phase === 'playing'
                ? 'bg-amber-500/30 border-amber-400 scale-105 shadow-lg shadow-amber-500/20 ring-2 ring-amber-400'
                : 'bg-black/50 border-amber-500/40'
            }`}>
              <span className="text-base">👩</span>
              <span className="font-mono font-bold text-xs text-red-300">{playerNames[1]}</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/60 text-red-300">
                Team Zij
              </span>
            </div>
            {/* Vertical cards */}
            <div className="flex flex-col -space-y-6 sm:-space-y-8 mt-1">
              {gameState.hands[1].map((_, i) => (
                <div
                  key={i}
                  className="w-9 h-6 sm:w-12 sm:h-8 bg-amber-900 border border-white/60 rounded shadow-sm"
                />
              ))}
            </div>
          </div>

          {/* CENTER ARENA: Trick / Bidding Banner */}
          <div className="relative w-56 h-56 sm:w-72 sm:h-72 rounded-2xl bg-black/40 border-2 border-dashed border-amber-500/40 flex items-center justify-center p-4">
            
            {/* Active Trump Badge in Center */}
            {gameState.trumpSuit && gameState.phase === 'playing' && (
              <div className="absolute top-2 right-2 bg-black/70 border border-amber-400/60 px-2.5 py-1 rounded-lg flex items-center gap-1.5 text-xs font-mono font-bold shadow z-10">
                <span className="text-[10px] text-amber-300/80">TROEF:</span>
                <span className={`text-sm ${getKlaverjasCardColor(gameState.trumpSuit) === 'red' ? 'text-red-500' : 'text-white'}`}>
                  {KLAVERJAS_SUIT_SYMBOLS[gameState.trumpSuit]}
                </span>
                <span className="text-[10px] text-slate-300">
                  ({gameState.makerTeam === 'wij' ? 'Gekozen door Wij' : 'Gekozen door Zij'})
                </span>
              </div>
            )}

            {/* BIDDING PHASE UI */}
            {gameState.phase === 'bidding' && (
              <div className="flex flex-col items-center text-center p-3 bg-slate-900/90 border border-amber-400/80 rounded-xl shadow-2xl z-30 max-w-[280px]">
                <span className="text-xs font-mono font-bold text-amber-300 mb-1">
                  Biedfase: Kies Troef of Pas
                </span>
                <span className="text-[11px] font-mono text-slate-300 mb-3">
                  Aan de beurt: <strong className="text-white">{playerNames[gameState.turn]}</strong>
                </span>

                {gameState.turn === 0 ? (
                  <div className="space-y-2 w-full">
                    <span className="text-[10px] font-mono text-emerald-300 block">Kies jouw troefkleur:</span>
                    <div className="grid grid-cols-2 gap-1.5">
                      {KLAVERJAS_SUITS.map(suit => {
                        const isRed = getKlaverjasCardColor(suit) === 'red';
                        return (
                          <button
                            key={suit}
                            onClick={() => handleHumanChooseTrump(suit)}
                            className={`py-1.5 px-2 rounded font-mono font-bold text-xs border border-slate-700 bg-slate-950 hover:bg-slate-800 transition-all flex items-center justify-center gap-1 shadow ${
                              isRed ? 'text-red-400' : 'text-slate-100'
                            }`}
                          >
                            <span>{KLAVERJAS_SUIT_SYMBOLS[suit]}</span>
                            <span>{KLAVERJAS_SUIT_NAMES[suit].nl}</span>
                          </button>
                        );
                      })}
                    </div>
                    <button
                      onClick={handleHumanPass}
                      className="w-full py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded text-slate-300 font-mono text-xs font-bold transition-all"
                    >
                      Passen (Volgende speler)
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 py-3 text-xs font-mono text-amber-200 animate-pulse">
                    <span>{playerNames[gameState.turn]} denkt na...</span>
                  </div>
                )}
              </div>
            )}

            {/* ROEM BANNER in trick review */}
            {gameState.phase === 'trick_review' && gameState.lastTrickRoem > 0 && (
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-amber-500 text-slate-950 px-4 py-2 rounded-xl font-mono font-black text-sm shadow-2xl z-40 animate-bounce flex items-center gap-1.5 border-2 border-white">
                <Sparkles className="w-5 h-5" />
                <span>+{gameState.lastTrickRoem} ROEM!</span>
              </div>
            )}

            {/* ROUND OVER BANNER */}
            {gameState.phase === 'round_over' && (
              <div className="flex flex-col items-center text-center p-4 bg-slate-900 border-2 border-amber-400 rounded-xl shadow-2xl z-30 animate-fade-in font-mono max-w-[300px]">
                {gameState.history[gameState.history.length - 1]?.isNat ? (
                  <div className="mb-2">
                    <span className="text-3xl block">💀</span>
                    <span className="font-black text-red-400 text-sm block">NAT GEGAAN!</span>
                    <p className="text-[10px] text-slate-300">
                      De speelpartij ({gameState.makerTeam?.toUpperCase()}) heeft het contract niet gehaald! Alle punten gaan naar de tegenstanders.
                    </p>
                  </div>
                ) : gameState.history[gameState.history.length - 1]?.isPit ? (
                  <div className="mb-2">
                    <span className="text-3xl block">🏆👑</span>
                    <span className="font-black text-amber-300 text-sm block">PIT! (MARS)</span>
                    <p className="text-[10px] text-slate-300">
                      Alle 8 slagen gewonnen! +100 Bonuspunten toegekend!
                    </p>
                  </div>
                ) : (
                  <div className="mb-2">
                    <span className="text-2xl block">🎉</span>
                    <span className="font-bold text-emerald-300 text-sm block">
                      Spel #{gameState.roundNumber} Voltooid!
                    </span>
                    <div className="text-[11px] text-slate-300 mt-1">
                      Wij: <strong>+{gameState.history[gameState.history.length - 1]?.totalWij}</strong> • Zij: <strong>+{gameState.history[gameState.history.length - 1]?.totalZij}</strong>
                    </div>
                  </div>
                )}
                <button
                  onClick={handleStartNextRound}
                  className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-black font-black text-xs rounded shadow transition-all active:scale-95"
                >
                  Volgend Spel #{gameState.roundNumber + 1} ▶
                </button>
              </div>
            )}

            {/* TRICK CARDS (North, West, South, East) */}
            {gameState.currentTrick.map(tp => {
              const isRed = getKlaverjasCardColor(tp.card.suit) === 'red';
              const isTrump = tp.card.suit === gameState.trumpSuit;

              let posClass = '';
              if (tp.playerId === 2) posClass = 'top-2 left-1/2 -translate-x-1/2';
              if (tp.playerId === 1) posClass = 'left-2 top-1/2 -translate-y-1/2';
              if (tp.playerId === 3) posClass = 'right-2 top-1/2 -translate-y-1/2';
              if (tp.playerId === 0) posClass = 'bottom-2 left-1/2 -translate-x-1/2';

              return (
                <div
                  key={tp.card.id}
                  className={`absolute ${posClass} w-12 h-16 sm:w-16 sm:h-22 bg-white border-2 rounded-md shadow-xl flex flex-col justify-between p-1 select-none transition-all duration-300 animate-scale-up ${
                    isTrump ? 'border-amber-400 ring-2 ring-amber-400/60' : 'border-slate-300'
                  } ${isRed ? 'text-red-600' : 'text-slate-950'}`}
                >
                  <div className="flex flex-col items-center leading-none self-start">
                    <span className="font-mono font-black text-xs sm:text-sm">{tp.card.rank}</span>
                    <span className="text-[10px] sm:text-xs">{KLAVERJAS_SUIT_SYMBOLS[tp.card.suit]}</span>
                  </div>
                  <div className="self-center text-sm sm:text-lg">
                    {KLAVERJAS_SUIT_SYMBOLS[tp.card.suit]}
                  </div>
                  <div className="flex flex-col items-center leading-none self-end rotate-180">
                    <span className="font-mono font-black text-xs sm:text-sm">{tp.card.rank}</span>
                    <span className="text-[10px] sm:text-xs">{KLAVERJAS_SUIT_SYMBOLS[tp.card.suit]}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* EAST: Jan */}
          <div className="flex flex-col items-center">
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full border transition-all ${
              gameState.turn === 3 && gameState.phase === 'playing'
                ? 'bg-amber-500/30 border-amber-400 scale-105 shadow-lg shadow-amber-500/20 ring-2 ring-amber-400'
                : 'bg-black/50 border-amber-500/40'
            }`}>
              <span className="text-base">👨</span>
              <span className="font-mono font-bold text-xs text-red-300">{playerNames[3]}</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/60 text-red-300">
                Team Zij
              </span>
            </div>
            {/* Vertical cards */}
            <div className="flex flex-col -space-y-6 sm:-space-y-8 mt-1">
              {gameState.hands[3].map((_, i) => (
                <div
                  key={i}
                  className="w-9 h-6 sm:w-12 sm:h-8 bg-amber-900 border border-white/60 rounded shadow-sm"
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
              : 'bg-black/50 border-amber-500/40'
          }`}>
            <span className="text-base">👤</span>
            <span className="font-mono font-bold text-xs text-emerald-300">{playerNames[0]}</span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/60 text-emerald-300 font-bold">
              Team Wij
            </span>
          </div>

          {/* Interactive Player Hand */}
          <div className="flex flex-wrap justify-center -space-x-2 sm:-space-x-3 max-w-full overflow-x-auto px-2 pb-2">
            {gameState.hands[0].map(card => {
              const isRed = getKlaverjasCardColor(card.suit) === 'red';
              const isPlayable = gameState.phase === 'playing' && gameState.turn === 0 && engine.isCardPlayable(0, card).valid;
              const isTrump = card.suit === gameState.trumpSuit;

              return (
                <div
                  key={card.id}
                  onClick={() => handleHumanCardClick(card)}
                  className={`w-12 h-18 sm:w-16 sm:h-24 md:w-20 md:h-28 bg-white rounded-md border-2 shadow-lg relative select-none flex flex-col justify-between p-1 sm:p-1.5 cursor-pointer transition-all duration-150 ${
                    isRed ? 'text-red-600' : 'text-slate-950'
                  } ${
                    isTrump ? 'border-amber-400 ring-2 ring-amber-400/50' : 'border-slate-300'
                  } ${
                    gameState.phase === 'playing' && isPlayable
                      ? 'hover:-translate-y-4 hover:border-amber-400 ring-2 ring-emerald-400/50'
                      : gameState.phase === 'playing' && gameState.turn === 0
                      ? 'opacity-40 cursor-not-allowed'
                      : 'hover:-translate-y-1'
                  }`}
                >
                  <div className="flex flex-col items-center leading-none self-start">
                    <span className="font-mono font-black text-xs sm:text-base md:text-lg">
                      {card.rank}
                    </span>
                    <span className="text-[10px] sm:text-xs md:text-sm mt-[-1px]">
                      {KLAVERJAS_SUIT_SYMBOLS[card.suit]}
                    </span>
                  </div>

                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <span className="text-sm sm:text-2xl md:text-3xl opacity-80">
                      {KLAVERJAS_SUIT_SYMBOLS[card.suit]}
                    </span>
                  </div>

                  <div className="flex flex-col items-center leading-none self-end rotate-180">
                    <span className="font-mono font-black text-xs sm:text-base md:text-lg">
                      {card.rank}
                    </span>
                    <span className="text-[10px] sm:text-xs md:text-sm mt-[-1px]">
                      {KLAVERJAS_SUIT_SYMBOLS[card.suit]}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {/* Footer Instructions */}
      <footer className="w-full max-w-6xl flex items-center justify-between border-t border-amber-500/30 pt-2 text-[10px] sm:text-xs text-amber-200/80 font-mono z-20">
        <div>
          <span>🎯 Doel: Behaal met Henk &gt; 81 punten + roem • Systeem: {gameState.system === 'amsterdams' ? 'Amsterdams (maat niet aftroeven)' : 'Rotterdams (altijd introeven op maat)'}</span>
        </div>
        <div>
          <span>Klaverjassen v1.0 • 100% TypeScript</span>
        </div>
      </footer>

      {/* Score Sheet Modal */}
      {showScoreSheet && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-amber-500/60 rounded-xl max-w-lg w-full p-6 text-white shadow-2xl font-mono">
            <div className="flex items-center justify-between border-b border-slate-700 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Table className="w-6 h-6 text-amber-400" />
                <h3 className="font-black text-lg text-amber-300">BOOMPJE STAND</h3>
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
                    <th className="py-2 text-left">Spel</th>
                    <th>Troef</th>
                    <th>Haler</th>
                    <th className="text-emerald-300">WIJ</th>
                    <th className="text-red-300">ZIJ</th>
                  </tr>
                </thead>
                <tbody>
                  {gameState.history.map((rec, i) => (
                    <tr key={i} className="border-b border-slate-800/40">
                      <td className="py-2 text-left font-bold text-slate-400">#{rec.roundNumber}</td>
                      <td>{KLAVERJAS_SUIT_SYMBOLS[rec.trumpSuit]}</td>
                      <td className="uppercase">{rec.makerTeam}</td>
                      <td className="text-emerald-300 font-bold">{rec.totalWij} {rec.roemWij > 0 ? `(${rec.roemWij}r)` : ''}</td>
                      <td className="text-red-300 font-bold">{rec.totalZij} {rec.roemZij > 0 ? `(${rec.roemZij}r)` : ''}</td>
                    </tr>
                  ))}
                  <tr className="bg-slate-950 font-black border-t-2 border-amber-500/60">
                    <td className="py-2 text-left text-amber-300" colSpan={3}>TOTAAL</td>
                    <td className="text-emerald-400 text-sm">{gameState.cumulativeScore.wij}</td>
                    <td className="text-red-400 text-sm">{gameState.cumulativeScore.zij}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <button
              onClick={() => setShowScoreSheet(false)}
              className="w-full py-2 bg-amber-500 hover:bg-amber-400 text-black font-black text-xs rounded"
            >
              Sluiten
            </button>
          </div>
        </div>
      )}

      {/* Game Over Modal */}
      {showGameOverModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-amber-400 rounded-xl max-w-md w-full p-6 text-white text-center shadow-2xl animate-fade-in font-mono">
            <span className="text-5xl mb-2 block">{gameState.cumulativeScore.wij > gameState.cumulativeScore.zij ? '🏆' : '💀'}</span>
            <h2 className="font-black text-2xl text-amber-400 mb-1">
              {gameState.cumulativeScore.wij > gameState.cumulativeScore.zij ? 'GEFELICITEERD! WIJ HEBBEN GEWONNEN!' : 'ZIJ HEBBEN GEWONNEN!'}
            </h2>
            <p className="text-xs text-slate-300 mb-4">
              Eindstand Boompje: Wij {gameState.cumulativeScore.wij} - {gameState.cumulativeScore.zij} Zij
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
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded text-white text-sm focus:border-amber-400 outline-none"
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
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded text-white text-sm focus:border-amber-400 outline-none uppercase"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2 bg-amber-500 hover:bg-amber-400 text-black font-black text-sm rounded shadow transition-all active:scale-95"
              >
                Score Opslaan in Klaverjas Hall of Fame
              </button>
            </form>

            <button
              type="button"
              onClick={() => handleNewMatch()}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded"
            >
              Start Nieuw Boompje Klaverjassen
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
                <h3 className="font-black text-lg text-amber-300">KLAVERJAS HALL OF FAME</h3>
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
                <p className="font-bold text-white">{stats.matchesPlayed}</p>
              </div>
              <div>
                <span className="text-slate-400 text-[9px]">GEWONNEN</span>
                <p className="font-bold text-emerald-400">{stats.matchesWon}</p>
              </div>
              <div>
                <span className="text-slate-400 text-[9px]">PITTEN</span>
                <p className="font-bold text-amber-400">{stats.pitsMade} 🏆</p>
              </div>
              <div>
                <span className="text-slate-400 text-[9px]">TOP SCORE</span>
                <p className="font-bold text-cyan-400">{stats.bestScoreBoompje} pt</p>
              </div>
            </div>

            <div className="overflow-y-auto max-h-64 mb-4">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="py-1">#</th>
                    <th>NAAM</th>
                    <th>SYSTEEM</th>
                    <th>WIJ</th>
                    <th>ZIJ</th>
                    <th>ROEM</th>
                    <th>DATUM</th>
                  </tr>
                </thead>
                <tbody>
                  {highScores.map((entry, idx) => (
                    <tr key={idx} className="border-b border-slate-800/40 hover:bg-slate-800/40">
                      <td className="py-1.5 text-amber-400 font-bold">{idx + 1}</td>
                      <td className="font-bold text-white">{entry.name}</td>
                      <td className="text-amber-300 uppercase">{entry.system}</td>
                      <td className="text-emerald-400 font-bold">{entry.scoreWij}</td>
                      <td className="text-red-400">{entry.scoreZij}</td>
                      <td className="text-cyan-300 font-bold">+{entry.roemTotal}</td>
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

      {/* Historical Dossier & Rules */}
      <KlaverjassenHistoryModal
        isOpen={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
        onPlayGame={() => {
          setShowHistoryModal(false);
          handleNewMatch();
        }}
        lang="nl"
      />
    </div>
  );
};
