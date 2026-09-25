import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ArrowLeft,
  RotateCcw,
  Volume2,
  VolumeX,
  Trophy,
  HelpCircle,
  Sparkles,
  Award,
  Flame,
  DollarSign,
  Play,
  PlusCircle,
  CheckCircle,
  ShieldCheck,
  Undo2
} from 'lucide-react';
import {
  BlackjackCard,
  CardSuit,
  HandStatus,
  PlayerHand
} from '../game/blackjackTypes';
import {
  BlackjackEngine,
  SUIT_SYMBOLS,
  CHIP_VALUES
} from '../game/blackjackEngine';
import { blackjackAudio } from '../game/blackjackAudio';
import {
  getBlackjackHighScores,
  saveBlackjackHighScore,
  BlackjackHighScoreEntry
} from '../game/blackjackHighScores';
import { BlackjackHistoryModal } from './BlackjackHistoryModal';
import { haptics } from '../utils/haptics';

interface BlackjackCabinetProps {
  onBackToLobby: () => void;
}

export const BlackjackCabinet: React.FC<BlackjackCabinetProps> = ({ onBackToLobby }) => {
  const [engine] = useState(() => new BlackjackEngine(1000));
  const [, setTick] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showHighScoresModal, setShowHighScoresModal] = useState(false);
  const [showReloadDialog, setShowReloadDialog] = useState(false);
  const [highScores, setHighScores] = useState<BlackjackHighScoreEntry[]>([]);
  const [newRecordInitials, setNewRecordInitials] = useState('');
  const [showSaveScoreModal, setShowSaveScoreModal] = useState(false);

  const forceUpdate = useCallback(() => {
    setTick(t => t + 1);
  }, []);

  useEffect(() => {
    setHighScores(getBlackjackHighScores());
  }, []);

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    blackjackAudio.enabled = next;
  };

  // Chip bet placement
  const handleAddChip = (chipValue: number) => {
    if (engine.phase !== 'betting') return;
    if (engine.addChipToBet(chipValue)) {
      haptics.selection();
      blackjackAudio.playChip();
      forceUpdate();
    }
  };

  const handleClearBet = () => {
    if (engine.phase !== 'betting') return;
    engine.clearBet();
    haptics.light();
    forceUpdate();
  };

  const handleDoubleBet = () => {
    if (engine.phase !== 'betting') return;
    const current = engine.currentBet;
    if (engine.bankroll >= current * 2) {
      engine.setBet(current * 2);
      haptics.selection();
      blackjackAudio.playChip();
      forceUpdate();
    }
  };

  // Initial Deal
  const handleDeal = () => {
    if (engine.phase !== 'betting') return;
    if (engine.currentBet <= 0) return;
    if (engine.bankroll < engine.currentBet) {
      setShowReloadDialog(true);
      return;
    }

    haptics.success();
    blackjackAudio.playCardDeal();

    const { playerBJ } = engine.dealInitialCards();
    forceUpdate();

    if (playerBJ) {
      setTimeout(() => {
        blackjackAudio.playBlackjack();
        forceUpdate();
      }, 400);
    }
  };

  // Player Actions
  const handleHit = () => {
    if (engine.phase !== 'player_turn') return;
    try {
      haptics.light();
      blackjackAudio.playCardFlip();
      const res = engine.hit();
      forceUpdate();

      if (res.isBust) {
        setTimeout(() => {
          blackjackAudio.playBust();
          forceUpdate();
        }, 200);
      }
    } catch {
      // ignore
    }
  };

  const handleStand = () => {
    if (engine.phase !== 'player_turn') return;
    haptics.selection();
    blackjackAudio.playCardFlip();
    engine.stand();
    forceUpdate();

    if (engine.phase === 'round_over') {
      triggerRoundEndAudio();
    }
  };

  const handleDoubleDown = () => {
    if (!engine.canDouble()) return;
    haptics.success();
    blackjackAudio.playChip();
    setTimeout(() => {
      blackjackAudio.playCardFlip();
    }, 150);

    const res = engine.doubleDown();
    forceUpdate();

    if (res.isBust) {
      setTimeout(() => {
        blackjackAudio.playBust();
        forceUpdate();
      }, 300);
    } else if (engine.phase === 'round_over') {
      setTimeout(() => {
        triggerRoundEndAudio();
      }, 300);
    }
  };

  const handleSplit = () => {
    if (!engine.canSplit()) return;
    haptics.selection();
    blackjackAudio.playChip();
    engine.split();
    forceUpdate();
  };

  const handleInsurance = (accept: boolean) => {
    if (engine.phase !== 'insurance_offer') return;
    haptics.selection();
    if (accept) blackjackAudio.playChip();
    engine.takeInsurance(accept);
    forceUpdate();

    if (engine.phase === 'round_over') {
      triggerRoundEndAudio();
    }
  };

  const triggerRoundEndAudio = () => {
    if (engine.messageType === 'blackjack') {
      blackjackAudio.playBlackjack();
    } else if (engine.messageType === 'win') {
      blackjackAudio.playWin();
    } else if (engine.messageType === 'push') {
      blackjackAudio.playPush();
    } else if (engine.messageType === 'lose') {
      blackjackAudio.playBust();
    }
  };

  const handleNewRound = () => {
    haptics.light();
    engine.resetForBetting();
    forceUpdate();

    // Check if high score reached
    if (engine.bankroll >= 2000) {
      setShowSaveScoreModal(true);
    }
  };

  const handleReloadBankroll = () => {
    engine.reloadBankroll(1000);
    setShowReloadDialog(false);
    haptics.success();
    blackjackAudio.playChip();
    forceUpdate();
  };

  const handleSaveScore = (e: React.FormEvent) => {
    e.preventDefault();
    const initials = (newRecordInitials || 'YOU').slice(0, 3).toUpperCase();
    saveBlackjackHighScore({
      name: initials === 'YOU' ? 'Speler' : `High Roller ${initials}`,
      initials,
      bankroll: engine.bankroll,
      handsPlayed: engine.stats.handsPlayed,
      blackjacks: engine.stats.blackjacks
    });
    setHighScores(getBlackjackHighScores());
    setShowSaveScoreModal(false);
    setShowHighScoresModal(true);
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showHistoryModal || showHighScoresModal || showSaveScoreModal || showReloadDialog) return;

      if (engine.phase === 'betting') {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          handleDeal();
        } else if (e.key === 'c' || e.key === 'C') {
          handleClearBet();
        } else if (e.key === 'd' || e.key === 'D') {
          handleDoubleBet();
        } else if (['1', '2', '3', '4', '5'].includes(e.key)) {
          const idx = parseInt(e.key, 10) - 1;
          if (CHIP_VALUES[idx]) handleAddChip(CHIP_VALUES[idx]);
        }
      } else if (engine.phase === 'player_turn') {
        if (e.key === 'h' || e.key === 'H' || e.key === ' ') {
          e.preventDefault();
          handleHit();
        } else if (e.key === 's' || e.key === 'S' || e.key === 'Enter') {
          e.preventDefault();
          handleStand();
        } else if (e.key === 'd' || e.key === 'D') {
          if (engine.canDouble()) handleDoubleDown();
        } else if (e.key === 'p' || e.key === 'P') {
          if (engine.canSplit()) handleSplit();
        }
      } else if (engine.phase === 'round_over') {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          handleNewRound();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [engine, showHistoryModal, showHighScoresModal, showSaveScoreModal, showReloadDialog]);

  // Render individual playing card
  const renderCard = (card: BlackjackCard, index: number, isDealerHole = false) => {
    if (!card.isFaceUp || isDealerHole) {
      // Face Down Card Back
      return (
        <div
          key={card.id || `card-${index}`}
          className="relative w-16 h-24 sm:w-20 sm:h-28 rounded-xl bg-gradient-to-br from-red-800 via-rose-900 to-red-950 border-2 border-amber-300/80 shadow-2xl flex items-center justify-center select-none transform hover:-translate-y-1 transition-transform"
          style={{ marginLeft: index > 0 ? '-1.5rem' : '0' }}
        >
          <div className="w-12 h-20 sm:w-16 sm:h-24 rounded-lg border border-amber-400/40 bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:6px_6px] opacity-75 flex items-center justify-center">
            <span className="text-amber-300 font-serif font-black text-lg">♠</span>
          </div>
        </div>
      );
    }

    const isRed = card.suit === 'hearts' || card.suit === 'diamonds';
    const suitSymbol = SUIT_SYMBOLS[card.suit];

    return (
      <div
        key={card.id || `card-${index}`}
        className="relative w-16 h-24 sm:w-20 sm:h-28 rounded-xl bg-white border-2 border-slate-300 shadow-2xl p-1.5 flex flex-col justify-between select-none transform hover:-translate-y-1 transition-transform"
        style={{ marginLeft: index > 0 ? '-1.5rem' : '0' }}
      >
        {/* Top left rank & suit */}
        <div className={`flex flex-col items-center leading-none ${isRed ? 'text-red-600' : 'text-slate-900'}`}>
          <span className="font-mono font-black text-xs sm:text-sm">{card.rank}</span>
          <span className="text-xs">{suitSymbol}</span>
        </div>

        {/* Center suit emblem */}
        <div className={`self-center text-xl sm:text-2xl ${isRed ? 'text-red-600' : 'text-slate-900'} opacity-90`}>
          {suitSymbol}
        </div>

        {/* Bottom right inverted rank & suit */}
        <div className={`flex flex-col items-center leading-none rotate-180 ${isRed ? 'text-red-600' : 'text-slate-900'}`}>
          <span className="font-mono font-black text-xs sm:text-sm">{card.rank}</span>
          <span className="text-xs">{suitSymbol}</span>
        </div>
      </div>
    );
  };

  const dealerEval = engine.evaluateHand(engine.dealerHand.cards);
  const dealerVisibleScore = engine.dealerHand.revealedHoleCard
    ? dealerEval.total
    : engine.dealerHand.cards[0]?.isFaceUp
    ? engine.dealerHand.cards[0].value
    : 0;

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-between text-white select-none">
      {/* Top Retro Casino Header & Navigation */}
      <header className="w-full bg-slate-900/90 border-b border-amber-500/40 px-3 sm:px-6 py-2.5 flex items-center justify-between z-20 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToLobby}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-mono font-bold transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Lobby</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="text-amber-400 font-serif font-black text-lg">♠</span>
            <h1 className="font-mono font-black text-sm sm:text-base tracking-wider text-amber-300">
              BLACKJACK • 21
            </h1>
          </div>
        </div>

        {/* Bankroll & Round Stats Header */}
        <div className="flex items-center gap-3 sm:gap-6 font-mono text-xs">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-950/80 border border-emerald-500/50 text-emerald-300">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <span>Bankroll: </span>
            <strong className="text-white text-sm">€{engine.bankroll}</strong>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-300">
            <span>Inzet: </span>
            <strong className="text-amber-400">€{engine.currentBet}</strong>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowHighScoresModal(true)}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 transition-colors"
              title="Hall of Fame"
            >
              <Trophy className="w-4 h-4" />
            </button>

            <button
              onClick={() => setShowHistoryModal(true)}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-slate-700 transition-colors"
              title="Spelregels & Strategie"
            >
              <HelpCircle className="w-4 h-4" />
            </button>

            <button
              onClick={toggleSound}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
              title={soundEnabled ? 'Geluid Dempen' : 'Geluid Aanzetten'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Luxury Casino Felt Table */}
      <main className="relative flex-1 w-full max-w-5xl px-3 py-4 flex flex-col justify-between items-center">
        {/* Felt Curved Table Frame */}
        <div className="relative w-full flex-1 rounded-[40px] bg-gradient-to-b from-emerald-900 via-emerald-800 to-emerald-950 border-8 border-amber-900/90 shadow-[inset_0_0_80px_rgba(0,0,0,0.8),0_20px_50px_rgba(0,0,0,0.9)] p-4 sm:p-6 flex flex-col justify-between overflow-hidden">
          {/* Authentic Gold Inscription Arch */}
          <div className="absolute top-4 left-0 right-0 text-center pointer-events-none opacity-40 px-4">
            <p className="font-serif font-bold text-[10px] sm:text-xs text-amber-300 tracking-[0.2em] uppercase">
              ★ BLACKJACK PAYS 3 TO 2 ★ DEALER MUST STAND ON 17 AND DRAW TO 16 ★ INSURANCE PAYS 2 TO 1 ★
            </p>
            <div className="w-48 sm:w-80 h-[1px] bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto mt-1" />
          </div>

          {/* 1. DEALER AREA */}
          <div className="flex flex-col items-center mt-6 sm:mt-8 space-y-2 z-10">
            <div className="flex items-center gap-2 font-mono text-xs text-amber-200">
              <span className="font-bold tracking-wider">BANK (DEALER)</span>
              {engine.dealerHand.cards.length > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-black/60 border border-amber-500/40 text-amber-300 font-bold">
                  {engine.dealerHand.revealedHoleCard ? dealerEval.total : dealerVisibleScore}
                  {engine.dealerHand.revealedHoleCard && dealerEval.isBlackjack && ' (BLACKJACK!)'}
                  {engine.dealerHand.revealedHoleCard && dealerEval.isBust && ' (KAPOT!)'}
                </span>
              )}
            </div>

            {/* Dealer Cards Stack */}
            <div className="flex items-center justify-center min-h-[6.5rem]">
              {engine.dealerHand.cards.map((card, idx) =>
                renderCard(card, idx, idx === 1 && !engine.dealerHand.revealedHoleCard)
              )}
              {engine.dealerHand.cards.length === 0 && (
                <div className="w-16 h-24 sm:w-20 sm:h-28 rounded-xl border-2 border-dashed border-emerald-600/40 flex items-center justify-center text-emerald-600/60 font-mono text-[10px]">
                  BANK
                </div>
              )}
            </div>
          </div>

          {/* 2. TABLE STATUS & ANNOUNCEMENT BANNER */}
          <div className="flex flex-col items-center my-3 z-10">
            {engine.message && (
              <div
                className={`px-4 sm:px-6 py-2 rounded-2xl border text-xs sm:text-sm font-mono font-bold tracking-wide shadow-xl text-center max-w-lg animate-in fade-in zoom-in-95 duration-200 ${
                  engine.messageType === 'blackjack'
                    ? 'bg-amber-950/90 text-amber-300 border-amber-400 shadow-amber-500/20'
                    : engine.messageType === 'win'
                    ? 'bg-emerald-950/90 text-emerald-300 border-emerald-400 shadow-emerald-500/20'
                    : engine.messageType === 'lose'
                    ? 'bg-red-950/90 text-red-300 border-red-500 shadow-red-500/20'
                    : engine.messageType === 'push'
                    ? 'bg-cyan-950/90 text-cyan-300 border-cyan-400 shadow-cyan-500/20'
                    : 'bg-black/75 text-slate-200 border-emerald-700/50'
                }`}
              >
                {engine.message}
              </div>
            )}
          </div>

          {/* 3. PLAYER HANDS AREA */}
          <div className="flex items-center justify-center gap-6 sm:gap-12 z-10 mb-2">
            {engine.playerHands.map((hand, hIdx) => {
              const hEval = engine.evaluateHand(hand.cards);
              const isActive = engine.phase === 'player_turn' && engine.activeHandIndex === hIdx;

              return (
                <div
                  key={hand.id}
                  className={`flex flex-col items-center p-3 rounded-2xl transition-all ${
                    isActive
                      ? 'bg-emerald-950/60 border-2 border-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.3)]'
                      : 'border border-transparent'
                  }`}
                >
                  {/* Hand Header */}
                  <div className="flex items-center gap-2 font-mono text-xs text-amber-200 mb-1.5">
                    <span className="font-bold">
                      {engine.playerHands.length > 1 ? `HAND ${hIdx + 1}` : 'JOUW HAND'}
                    </span>
                    {hand.cards.length > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-black/60 border border-emerald-500/40 text-emerald-300 font-bold">
                        {hEval.displayTotal}
                      </span>
                    )}
                  </div>

                  {/* Cards Row */}
                  <div className="flex items-center justify-center min-h-[6.5rem]">
                    {hand.cards.map((card, cIdx) => renderCard(card, cIdx))}
                    {hand.cards.length === 0 && (
                      <div className="w-16 h-24 sm:w-20 sm:h-28 rounded-xl border-2 border-dashed border-emerald-600/40 flex items-center justify-center text-emerald-600/60 font-mono text-[10px]">
                        SPELER
                      </div>
                    )}
                  </div>

                  {/* Bet & Hand Result Badge */}
                  <div className="mt-2 flex flex-col items-center gap-1 font-mono text-xs">
                    <div className="px-2.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold">
                      Inzet: €{hand.bet}
                      {hand.doubled && ' (2×)'}
                    </div>

                    {hand.resultMessage && (
                      <span
                        className={`text-[11px] font-bold ${
                          hand.status === 'won' || hand.status === 'blackjack'
                            ? 'text-emerald-300'
                            : hand.status === 'lost'
                            ? 'text-red-400'
                            : 'text-cyan-300'
                        }`}
                      >
                        {hand.resultMessage}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 4. BOTTOM ACTION & CHIP CONTROLS */}
        <div className="w-full mt-3 bg-slate-900/90 border border-slate-800 rounded-3xl p-3 sm:p-4 flex flex-col gap-3 shadow-2xl backdrop-blur-md">
          {/* Phase A: BETTING CONTROLS */}
          {engine.phase === 'betting' && (
            <div className="flex flex-wrap items-center justify-between gap-3">
              {/* Chips Rack */}
              <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto pb-1">
                <span className="text-xs font-mono text-slate-400 uppercase font-bold mr-1">Fiches:</span>
                {CHIP_VALUES.map(val => {
                  const colors: Record<number, string> = {
                    5: 'bg-red-600 border-red-400 text-white',
                    25: 'bg-emerald-600 border-emerald-400 text-white',
                    100: 'bg-slate-950 border-slate-600 text-white',
                    500: 'bg-purple-700 border-purple-400 text-white',
                    1000: 'bg-amber-600 border-amber-300 text-black font-black'
                  };

                  return (
                    <button
                      key={val}
                      onClick={() => handleAddChip(val)}
                      disabled={engine.bankroll < engine.currentBet + val}
                      className={`relative w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 shadow-lg flex items-center justify-center font-mono font-bold text-xs cursor-pointer hover:scale-110 active:scale-95 transition-all disabled:opacity-30 disabled:pointer-events-none ${colors[val]}`}
                    >
                      €{val}
                    </button>
                  );
                })}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleClearBet}
                  disabled={engine.currentBet === 0}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono font-bold transition-all disabled:opacity-40 cursor-pointer"
                >
                  Wis (C)
                </button>

                <button
                  onClick={handleDoubleBet}
                  disabled={engine.bankroll < engine.currentBet * 2 || engine.currentBet === 0}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 text-xs font-mono font-bold transition-all disabled:opacity-40 cursor-pointer"
                >
                  2× Inzet
                </button>

                <button
                  onClick={handleDeal}
                  disabled={engine.currentBet === 0}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black text-xs sm:text-sm font-mono font-black flex items-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.4)] cursor-pointer active:scale-95 transition-all disabled:opacity-40 disabled:pointer-events-none"
                >
                  <Play className="w-4 h-4 fill-black" />
                  <span>DELEN (Spatie)</span>
                </button>
              </div>
            </div>
          )}

          {/* Phase B: INSURANCE OFFER */}
          {engine.phase === 'insurance_offer' && (
            <div className="flex flex-wrap items-center justify-between gap-3 bg-amber-950/40 p-3 rounded-2xl border border-amber-500/40">
              <div className="text-xs font-mono text-amber-200">
                <span>Bank toont een Aas! Verzekering kost </span>
                <strong className="text-amber-400">€{Math.floor(engine.currentBet / 2)}</strong>
                <span> (betaalt 2:1 bij Bank-Blackjack).</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleInsurance(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono font-bold cursor-pointer"
                >
                  Weigeren
                </button>
                <button
                  onClick={() => handleInsurance(true)}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-mono font-bold cursor-pointer"
                >
                  Verzekering Nemen
                </button>
              </div>
            </div>
          )}

          {/* Phase C: PLAYER TURN DECISIONS */}
          {engine.phase === 'player_turn' && (
            <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-3">
              <div className="text-xs font-mono text-slate-400 hidden sm:block">
                <span>Sneltoetsen: </span>
                <kbd className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700 text-white">H</kbd> Kaart •{' '}
                <kbd className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700 text-white">S</kbd> Passen •{' '}
                <kbd className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700 text-white">D</kbd> Verdubbelen
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                {engine.canSplit() && (
                  <button
                    onClick={handleSplit}
                    className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-600 text-white text-xs font-mono font-bold transition-all shadow-md cursor-pointer"
                  >
                    ✂️ Splitsen (P)
                  </button>
                )}

                {engine.canDouble() && (
                  <button
                    onClick={handleDoubleDown}
                    className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-black text-xs font-mono font-bold transition-all shadow-md cursor-pointer"
                  >
                    ⚡ Verdubbel (D)
                  </button>
                )}

                <button
                  onClick={handleHit}
                  className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-mono font-bold transition-all shadow-md cursor-pointer active:scale-95"
                >
                  🟢 Kaart (H)
                </button>

                <button
                  onClick={handleStand}
                  className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-mono font-bold transition-all shadow-md cursor-pointer active:scale-95"
                >
                  🛑 Passen (S)
                </button>
              </div>
            </div>
          )}

          {/* Phase D: ROUND OVER */}
          {engine.phase === 'round_over' && (
            <div className="flex items-center justify-between gap-3">
              <div className="text-xs font-mono text-slate-300">
                <span>Ronde afgelopen. Druk op Spatie voor de volgende ronde.</span>
              </div>

              <div className="flex items-center gap-2">
                {engine.bankroll === 0 && (
                  <button
                    onClick={() => setShowReloadDialog(true)}
                    className="px-4 py-2 rounded-xl bg-red-700 hover:bg-red-600 text-white text-xs font-mono font-bold cursor-pointer"
                  >
                    Herlaad Bankroll
                  </button>
                )}

                <button
                  onClick={handleNewRound}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black text-xs sm:text-sm font-mono font-black shadow-[0_0_20px_rgba(245,158,11,0.4)] cursor-pointer active:scale-95 transition-all"
                >
                  NIEUWE RONDE (Spatie)
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Hall of Fame Modal */}
      {showHighScoresModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-amber-500/60 p-5 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-mono font-bold text-amber-300 text-sm flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-400" />
                <span>BLACKJACK HALL OF FAME</span>
              </h3>
              <button
                onClick={() => setShowHighScoresModal(false)}
                className="text-slate-400 hover:text-white"
              >
                Sluiten
              </button>
            </div>

            <div className="space-y-2">
              <table className="w-full text-left font-mono text-xs">
                <thead>
                  <tr className="text-slate-500 border-b border-slate-800 pb-1">
                    <th className="py-1">#</th>
                    <th>Speler</th>
                    <th>Bankroll</th>
                    <th>BJ's</th>
                  </tr>
                </thead>
                <tbody>
                  {highScores.map((entry, idx) => (
                    <tr key={idx} className="border-b border-slate-800/40">
                      <td className="py-1.5 text-amber-400 font-bold">{idx + 1}</td>
                      <td className="font-bold text-white">{entry.name}</td>
                      <td className="text-emerald-400 font-bold">€{entry.bankroll}</td>
                      <td className="text-amber-300">+{entry.blackjacks}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <button
              onClick={() => setShowHighScoresModal(false)}
              className="w-full py-2 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-lg text-xs font-mono"
            >
              Terug naar Tafel
            </button>
          </div>
        </div>
      )}

      {/* Save High Score Modal */}
      {showSaveScoreModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-emerald-500/60 p-5 space-y-4 text-center">
            <Sparkles className="w-8 h-8 text-amber-400 mx-auto" />
            <h3 className="font-mono font-bold text-white text-base">Top High Roller Record!</h3>
            <p className="text-xs text-slate-300">
              Je hebt een indrukwekkende bankroll van <strong className="text-emerald-400">€{engine.bankroll}</strong> opgebouwd!
            </p>

            <form onSubmit={handleSaveScore} className="space-y-3">
              <input
                type="text"
                maxLength={3}
                placeholder="INITIALEN (3 LETT)"
                value={newRecordInitials}
                onChange={e => setNewRecordInitials(e.target.value.toUpperCase())}
                className="w-full text-center px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-amber-400 font-mono font-black text-xl tracking-widest focus:outline-none focus:border-amber-400 uppercase"
                autoFocus
              />

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-black font-mono font-bold text-xs"
              >
                Opslaan in Hall of Fame
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Reload Bankroll Dialog */}
      {showReloadDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-amber-500/60 p-5 space-y-3 text-center">
            <DollarSign className="w-8 h-8 text-amber-400 mx-auto" />
            <h3 className="font-mono font-bold text-white text-base">Bankroll Leeg</h3>
            <p className="text-xs text-slate-300">
              Geen fiches meer? Herlaad je casino-rekening gratis met €1.000 om verder te spelen!
            </p>
            <button
              onClick={handleReloadBankroll}
              className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-mono font-bold text-xs"
            >
              Ontvang €1.000 Speelgeld
            </button>
          </div>
        </div>
      )}

      {/* Detailed Rules & Strategy Dossier */}
      <BlackjackHistoryModal
        isOpen={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
        lang="nl"
      />
    </div>
  );
};
