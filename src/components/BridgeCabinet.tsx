import React, { useState, useEffect, useCallback } from 'react';
import {
  ArrowLeft,
  RotateCcw,
  Volume2,
  VolumeX,
  Trophy,
  HelpCircle,
  Sparkles,
  Award,
  Crown,
  Play,
  Layers,
  ShieldAlert,
  ChevronRight,
  Eye,
  CheckCircle2
} from 'lucide-react';
import {
  BridgeCard,
  BridgeSuit,
  BridgeStrain,
  Seat,
  BridgeBid,
  BridgeContract,
  Vulnerability,
  BridgePhase
} from '../game/bridgeTypes';
import {
  BridgeEngine,
  BRIDGE_SUITS,
  BRIDGE_STRAINS,
  STRAIN_SYMBOLS,
  STRAIN_NAMES_NL,
  SEAT_NAMES_NL,
  NEXT_SEAT
} from '../game/bridgeEngine';
import { bridgeAudio } from '../game/bridgeAudio';
import {
  getBridgeHighScores,
  saveBridgeHighScore,
  BridgeHighScoreEntry
} from '../game/bridgeHighScores';
import { BridgeHistoryModal } from './BridgeHistoryModal';
import { haptics } from '../utils/haptics';

interface BridgeCabinetProps {
  onBackToLobby: () => void;
}

export const BridgeCabinet: React.FC<BridgeCabinetProps> = ({ onBackToLobby }) => {
  const [engine] = useState(() => new BridgeEngine('N', 'none'));
  const [, setTick] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showHighScoresModal, setShowHighScoresModal] = useState(false);
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [highScores, setHighScores] = useState<BridgeHighScoreEntry[]>([]);
  const [initialsInput, setInitialsInput] = useState('');
  const [selectedBidLevel, setSelectedBidLevel] = useState<number>(1);
  const [showHcpHelper, setShowHcpHelper] = useState(true);

  const forceUpdate = useCallback(() => {
    setTick(t => t + 1);
  }, []);

  useEffect(() => {
    setHighScores(getBridgeHighScores());
  }, []);

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    bridgeAudio.enabled = next;
  };

  const handleNewDeal = () => {
    haptics.selection();
    bridgeAudio.playBiddingClick();
    engine.startNewHand();
    setShowScoreModal(false);
    forceUpdate();
  };

  // Bid actions
  const handleMakeBid = (level: number, strain: BridgeStrain) => {
    if (engine.phase !== 'bidding' || !engine.isHumanTurn()) return;
    if (!engine.canMakeBid(level, strain)) return;

    haptics.selection();
    bridgeAudio.playBiddingClick();
    engine.makeBid({ type: 'bid', level, strain });
    forceUpdate();

    checkAuctionEnd();
  };

  const handlePass = () => {
    if (engine.phase !== 'bidding' || !engine.isHumanTurn()) return;
    haptics.light();
    bridgeAudio.playBiddingClick();
    engine.makeBid({ type: 'pass' });
    forceUpdate();

    checkAuctionEnd();
  };

  const handleDouble = () => {
    if (engine.phase !== 'bidding' || !engine.isHumanTurn()) return;
    if (!engine.canDouble()) return;
    haptics.selection();
    bridgeAudio.playBiddingClick();
    engine.makeBid({ type: 'double' });
    forceUpdate();

    checkAuctionEnd();
  };

  const handleRedouble = () => {
    if (engine.phase !== 'bidding' || !engine.isHumanTurn()) return;
    if (!engine.canRedouble()) return;
    haptics.success();
    bridgeAudio.playBiddingClick();
    engine.makeBid({ type: 'redouble' });
    forceUpdate();

    checkAuctionEnd();
  };

  const checkAuctionEnd = () => {
    if (engine.phase === 'opening_lead' || engine.phase === 'playing') {
      setTimeout(() => {
        forceUpdate();
      }, 500);
    }
  };

  // Card play action
  const handlePlayCard = (seat: Seat, card: BridgeCard) => {
    if (engine.phase !== 'opening_lead' && engine.phase !== 'playing') return;

    // Check if human can play this card
    if (!engine.isHumanTurn()) return;
    if (engine.turnSeat !== seat) return;

    if (!engine.isLegalCard(seat, card)) return;

    haptics.selection();
    bridgeAudio.playCardSnap();

    const ok = engine.playCard(seat, card);
    forceUpdate();

    if (ok) {
      if (engine.currentTrick && engine.currentTrick.cards.length === 0) {
        // Trick just completed
        setTimeout(() => {
          bridgeAudio.playTrickWon();
          forceUpdate();
        }, 300);
      }

      if (engine.phase === 'hand_over') {
        setTimeout(() => {
          if (engine.scoreResult?.made) {
            if (engine.scoreResult.contract.level >= 6) {
              bridgeAudio.playSlam();
            } else {
              bridgeAudio.playContractMade();
            }
          } else {
            bridgeAudio.playDown();
          }
          setShowScoreModal(true);
          forceUpdate();
        }, 800);
      }
    }
  };

  const handleSaveScore = (e: React.FormEvent) => {
    e.preventDefault();
    if (!engine.scoreResult) return;

    const inits = (initialsInput || 'YOU').slice(0, 3).toUpperCase();
    const contractStr = `${engine.scoreResult.contract.level}${STRAIN_SYMBOLS[engine.scoreResult.contract.strain]}`;
    const scoreVal = engine.scoreResult.pointsNS;

    saveBridgeHighScore({
      name: inits === 'YOU' ? 'Bridge Speler' : `Meester ${inits}`,
      initials: inits,
      contract: contractStr,
      resultScore: scoreVal,
      totalMasterpoints: Math.max(10, Math.floor(scoreVal / 10))
    });

    setHighScores(getBridgeHighScores());
    setShowScoreModal(false);
    setShowHighScoresModal(true);
  };

  const southStats = engine.calculateStats(engine.hands.S);
  const northStats = engine.calculateStats(engine.hands.N);

  // Card rendering helper
  const renderCard = (card: BridgeCard, onClick?: () => void, isPlayable: boolean = false) => {
    const isRed = card.suit === 'hearts' || card.suit === 'diamonds';
    const symbol = STRAIN_SYMBOLS[card.suit];

    return (
      <button
        key={card.id}
        onClick={onClick}
        disabled={!isPlayable}
        className={`relative w-11 h-16 sm:w-14 sm:h-20 rounded-lg sm:rounded-xl bg-white border border-slate-300 shadow-md p-1 flex flex-col justify-between select-none cursor-pointer transition-all ${
          isPlayable
            ? 'hover:-translate-y-2 hover:shadow-xl hover:border-amber-400 active:scale-95'
            : 'opacity-85'
        }`}
      >
        <div className={`flex items-center justify-between text-[10px] sm:text-xs font-black font-mono leading-none ${isRed ? 'text-red-600' : 'text-slate-900'}`}>
          <span>{card.rank}</span>
          <span>{symbol}</span>
        </div>

        <div className={`self-center text-sm sm:text-lg ${isRed ? 'text-red-600' : 'text-slate-900'}`}>
          {symbol}
        </div>

        <div className={`flex items-center justify-between text-[10px] sm:text-xs font-black font-mono leading-none rotate-180 ${isRed ? 'text-red-600' : 'text-slate-900'}`}>
          <span>{card.rank}</span>
          <span>{symbol}</span>
        </div>
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-between text-white select-none">
      {/* Top Club Header & Controls */}
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
              CONTRACT BRIDGE
            </h1>
          </div>
        </div>

        {/* Status Indicators */}
        <div className="flex items-center gap-2 sm:gap-4 font-mono text-xs">
          {engine.contract && (
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-950/80 border border-amber-500/50 text-amber-300">
              <Crown className="w-3.5 h-3.5 text-amber-400" />
              <span>Contract: </span>
              <strong className="text-white text-sm">
                {engine.contract.level}{STRAIN_SYMBOLS[engine.contract.strain]}
              </strong>
              <span className="text-slate-400 text-[10px]">
                ({engine.contract.declarer})
              </span>
            </div>
          )}

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-950/70 border border-emerald-600/40 text-emerald-300">
            <span>Slagen: </span>
            <strong className="text-white">Wij {engine.tricksWonNS}</strong>
            <span className="text-slate-500">-</span>
            <span className="text-slate-300">Zij {engine.tricksWonEW}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setShowHcpHelper(!showHcpHelper)}
              className={`p-1.5 rounded-lg border transition-colors ${
                showHcpHelper ? 'bg-amber-950 text-amber-300 border-amber-600' : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
              title="Honneurpunten Hulp"
            >
              <Eye className="w-4 h-4" />
            </button>

            <button
              onClick={() => setShowHighScoresModal(true)}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 transition-colors"
              title="Meesterstand & Records"
            >
              <Trophy className="w-4 h-4" />
            </button>

            <button
              onClick={() => setShowHistoryModal(true)}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-slate-700 transition-colors"
              title="Bridge Regels & Eerbetoon"
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

            <button
              onClick={handleNewDeal}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-mono text-xs flex items-center gap-1"
              title="Nieuw Spel Schudden"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Nieuw Spel</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Bridge Room & Felt Table */}
      <main className="relative flex-1 w-full max-w-5xl px-2 sm:px-4 py-3 flex flex-col justify-between items-center">
        {/* The Authentic Green Felt Table */}
        <div className="relative w-full flex-1 rounded-[36px] bg-gradient-to-b from-emerald-900 via-emerald-850 to-emerald-950 border-8 border-amber-950/90 shadow-[inset_0_0_80px_rgba(0,0,0,0.85),0_20px_50px_rgba(0,0,0,0.9)] p-3 sm:p-5 flex flex-col justify-between overflow-hidden">
          {/* Subtle Brass Corner Accents */}
          <div className="absolute top-2 left-3 text-[10px] font-mono text-amber-400/40 uppercase tracking-widest pointer-events-none">
            NBB • STANDARD 5-CARD MAJOR
          </div>
          <div className="absolute top-2 right-3 text-[10px] font-mono text-amber-400/40 uppercase tracking-widest pointer-events-none">
            GEVER: {engine.dealer} • {engine.vulnerability.toUpperCase()}
          </div>

          {/* 1. NORTH (PARTNER HENK / DUMMY) */}
          <div className="flex flex-col items-center z-10">
            <div className="flex items-center gap-2 font-mono text-xs text-amber-200 mb-1">
              <span className="font-bold">NOORD (MAAT)</span>
              {engine.contract?.dummy === 'N' && (
                <span className="px-2 py-0.5 rounded bg-amber-400 text-black font-black text-[10px]">
                  DE DUMMY
                </span>
              )}
              {showHcpHelper && (
                <span className="text-[10px] text-emerald-300">
                  ({northStats.hcp} HCP)
                </span>
              )}
            </div>

            {/* North Cards */}
            {engine.dummyRevealed && engine.contract?.dummy === 'N' ? (
              // Revealed Dummy Layout: neatly grouped by suit
              <div className="flex flex-wrap items-center justify-center gap-1 max-w-xl">
                {engine.hands.N.map(card => {
                  const isPlayable = engine.phase === 'playing' && engine.turnSeat === 'N' && engine.isHumanTurn() && engine.isLegalCard('N', card);
                  return renderCard(card, () => handlePlayCard('N', card), isPlayable);
                })}
              </div>
            ) : (
              // Face-down card backs count
              <div className="flex items-center justify-center gap-1">
                {Array.from({ length: engine.hands.N.length }).map((_, idx) => (
                  <div
                    key={idx}
                    className="w-5 sm:w-6 h-8 sm:h-10 rounded bg-gradient-to-br from-red-800 to-red-950 border border-amber-400/60 shadow-sm"
                    style={{ marginLeft: idx > 0 ? '-0.75rem' : '0' }}
                  />
                ))}
                <span className="ml-2 font-mono text-xs text-slate-300">
                  {engine.hands.N.length} kaarten
                </span>
              </div>
            )}
          </div>

          {/* 2. MIDDLE ARENA: EITHER BIDDING BOX OR TRICK ARENA */}
          <div className="relative flex items-center justify-between my-2 z-10 w-full px-2 sm:px-8">
            {/* WEST (OPPONENT JAN) */}
            <div className="flex flex-col items-center">
              <span className="font-mono text-[11px] text-amber-200 font-bold mb-1">WEST</span>
              <div className="flex items-center">
                <div className="w-8 h-12 rounded bg-gradient-to-br from-red-800 to-red-950 border border-amber-400/60 shadow-sm flex items-center justify-center text-amber-300 text-xs font-mono">
                  {engine.hands.W.length}
                </div>
              </div>
            </div>

            {/* CENTER ARENA */}
            <div className="flex-1 flex flex-col items-center justify-center mx-4">
              {/* Status Message */}
              <div className="mb-2 px-3 py-1 rounded-xl bg-black/60 border border-emerald-700/60 text-emerald-200 font-mono text-xs text-center max-w-md shadow-md">
                {engine.statusMessage}
              </div>

              {/* A. Bidding Box Auction Display */}
              {engine.phase === 'bidding' && (
                <div className="w-full max-w-md bg-slate-900/90 border border-amber-500/50 rounded-2xl p-3 shadow-xl flex flex-col gap-2">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                    <span className="font-mono font-bold text-amber-300 text-xs">BIEDVERLOOP (AUCTION)</span>
                    <span className="text-[11px] font-mono text-slate-400">
                      Beurt: <strong className="text-white">{engine.turnSeat}</strong>
                    </span>
                  </div>

                  {/* Auction Table: W - N - E - S */}
                  <div className="grid grid-cols-4 gap-1 text-center font-mono text-xs py-1 border-b border-slate-800">
                    <span className="text-slate-400 font-bold">West</span>
                    <span className="text-slate-400 font-bold">Noord</span>
                    <span className="text-slate-400 font-bold">Oost</span>
                    <span className="text-amber-400 font-bold">Zuid (Jij)</span>
                  </div>

                  <div className="max-h-24 overflow-y-auto space-y-1">
                    {/* Render auction rounds */}
                    {Array.from({ length: Math.ceil((engine.auction.length + (['W', 'N', 'E', 'S'].indexOf(engine.dealer))) / 4) }).map((_, rIdx) => {
                      const seats: Seat[] = ['W', 'N', 'E', 'S'];
                      return (
                        <div key={rIdx} className="grid grid-cols-4 gap-1 text-center font-mono text-xs">
                          {seats.map(st => {
                            const bid = engine.auction.find((b, idx) => {
                              const dealerOffset = seats.indexOf(engine.dealer);
                              const roundOfBid = Math.floor((idx + dealerOffset) / 4);
                              return roundOfBid === rIdx && b.seat === st;
                            });

                            if (!bid) return <span key={st} className="text-slate-600">-</span>;

                            if (bid.type === 'pass') {
                              return <span key={st} className="text-emerald-400 font-bold">Pas</span>;
                            }
                            if (bid.type === 'double') {
                              return <span key={st} className="text-red-400 font-black">X</span>;
                            }
                            if (bid.type === 'redouble') {
                              return <span key={st} className="text-blue-400 font-black">XX</span>;
                            }
                            return (
                              <span key={st} className="text-amber-300 font-bold">
                                {bid.level}{STRAIN_SYMBOLS[bid.strain!]}
                              </span>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>

                  {/* Human Bidding Box Panel */}
                  {engine.isHumanTurn() && (
                    <div className="pt-2 border-t border-slate-800 space-y-2 animate-in fade-in duration-150">
                      {/* Level selector 1-7 */}
                      <div className="flex items-center justify-between gap-1">
                        {[1, 2, 3, 4, 5, 6, 7].map(lvl => (
                          <button
                            key={lvl}
                            onClick={() => setSelectedBidLevel(lvl)}
                            className={`flex-1 py-1 rounded text-xs font-mono font-bold transition-all cursor-pointer ${
                              selectedBidLevel === lvl
                                ? 'bg-amber-500 text-black shadow-md'
                                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                            }`}
                          >
                            {lvl}
                          </button>
                        ))}
                      </div>

                      {/* Suit / Strain selection */}
                      <div className="grid grid-cols-5 gap-1.5">
                        {BRIDGE_STRAINS.map(st => {
                          const canBid = engine.canMakeBid(selectedBidLevel, st);
                          const isRed = st === 'hearts' || st === 'diamonds';

                          return (
                            <button
                              key={st}
                              onClick={() => handleMakeBid(selectedBidLevel, st)}
                              disabled={!canBid}
                              className={`py-1.5 rounded-lg border font-mono font-bold text-xs flex items-center justify-center gap-1 transition-all cursor-pointer disabled:opacity-30 disabled:pointer-events-none ${
                                canBid
                                  ? 'bg-slate-800 hover:bg-slate-700 border-slate-600 text-white'
                                  : 'bg-slate-900 border-slate-800 text-slate-600'
                              }`}
                            >
                              <span>{selectedBidLevel}</span>
                              <span className={isRed ? 'text-red-500' : 'text-slate-200'}>
                                {STRAIN_SYMBOLS[st]}
                              </span>
                            </button>
                          );
                        })}
                      </div>

                      {/* Special calls: Pass, Double, Redouble */}
                      <div className="flex items-center gap-2 pt-1">
                        <button
                          onClick={handlePass}
                          className="flex-1 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-mono font-bold text-xs shadow-md transition-all cursor-pointer"
                        >
                          PAS (Pass)
                        </button>

                        <button
                          onClick={handleDouble}
                          disabled={!engine.canDouble()}
                          className="px-3 py-2 rounded-xl bg-red-700 hover:bg-red-600 text-white font-mono font-bold text-xs shadow-md transition-all cursor-pointer disabled:opacity-30 disabled:pointer-events-none"
                        >
                          DOUBLET (X)
                        </button>

                        <button
                          onClick={handleRedouble}
                          disabled={!engine.canRedouble()}
                          className="px-3 py-2 rounded-xl bg-blue-700 hover:bg-blue-600 text-white font-mono font-bold text-xs shadow-md transition-all cursor-pointer disabled:opacity-30 disabled:pointer-events-none"
                        >
                          REDOUBLET (XX)
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* B. Trick Arena (During Play) */}
              {(engine.phase === 'opening_lead' || engine.phase === 'playing' || engine.phase === 'hand_over') && (
                <div className="relative w-56 h-48 sm:w-64 sm:h-52 rounded-2xl bg-emerald-950/60 border border-emerald-600/40 p-2 flex items-center justify-center shadow-inner">
                  {/* Compass Indicators */}
                  <span className="absolute top-1 text-[10px] font-mono text-emerald-400/60 font-bold">N</span>
                  <span className="absolute bottom-1 text-[10px] font-mono text-emerald-400/60 font-bold">S</span>
                  <span className="absolute left-2 text-[10px] font-mono text-emerald-400/60 font-bold">W</span>
                  <span className="absolute right-2 text-[10px] font-mono text-emerald-400/60 font-bold">E</span>

                  {/* Cards played in current trick */}
                  {engine.currentTrick?.cards.map(tc => {
                    const positions: Record<Seat, string> = {
                      N: 'top-4 self-center',
                      S: 'bottom-4 self-center',
                      W: 'left-6',
                      E: 'right-6'
                    };

                    return (
                      <div
                        key={tc.card.id}
                        className={`absolute ${positions[tc.seat]} transform transition-all animate-in zoom-in-75 duration-150`}
                      >
                        {renderCard(tc.card)}
                        <span className="block text-center text-[9px] font-mono text-amber-300 mt-0.5">
                          {tc.seat}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* EAST (OPPONENT INGRID) */}
            <div className="flex flex-col items-center">
              <span className="font-mono text-[11px] text-amber-200 font-bold mb-1">OOST</span>
              <div className="flex items-center">
                <div className="w-8 h-12 rounded bg-gradient-to-br from-red-800 to-red-950 border border-amber-400/60 shadow-sm flex items-center justify-center text-amber-300 text-xs font-mono">
                  {engine.hands.E.length}
                </div>
              </div>
            </div>
          </div>

          {/* 3. SOUTH (YOU) */}
          <div className="flex flex-col items-center z-10">
            <div className="flex items-center gap-2 font-mono text-xs text-amber-200 mb-1.5">
              <span className="font-bold">ZUID (JIJ)</span>
              {engine.contract?.declarer === 'S' && (
                <span className="px-2 py-0.5 rounded bg-amber-400 text-black font-black text-[10px]">
                  LEIDER
                </span>
              )}
              {showHcpHelper && (
                <span className="text-[10px] text-emerald-300">
                  ({southStats.hcp} HCP • {southStats.shape.spades}♠ {southStats.shape.hearts}♥ {southStats.shape.diamonds}♦ {southStats.shape.clubs}♣)
                </span>
              )}
            </div>

            {/* South Hand Cards */}
            <div className="flex flex-wrap items-center justify-center gap-1 sm:gap-1.5 max-w-3xl">
              {engine.hands.S.map(card => {
                const isPlayable = (engine.phase === 'opening_lead' || engine.phase === 'playing') && engine.turnSeat === 'S' && engine.isLegalCard('S', card);
                return renderCard(card, () => handlePlayCard('S', card), isPlayable);
              })}
            </div>
          </div>
        </div>
      </main>

      {/* End of Hand / Score Modal */}
      {showScoreModal && engine.scoreResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-amber-500/70 p-5 space-y-4 text-center animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-full bg-amber-500/20 border border-amber-400 flex items-center justify-center mx-auto text-amber-400">
              <Award className="w-6 h-6" />
            </div>

            <div>
              <h3 className="font-mono font-bold text-white text-base">
                {engine.scoreResult.made ? '🎉 Contract Gemaakt!' : '⚠️ Contract Down!'}
              </h3>
              <p className="text-xs font-mono text-slate-300 mt-1">
                {engine.scoreResult.summaryText}
              </p>
            </div>

            {/* Scorecard Table */}
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs font-mono space-y-1.5">
              <div className="flex justify-between text-slate-400 border-b border-slate-800 pb-1">
                <span>Contract:</span>
                <strong className="text-white">
                  {engine.scoreResult.contract.level}{STRAIN_SYMBOLS[engine.scoreResult.contract.strain]}
                </strong>
              </div>
              <div className="flex justify-between text-slate-400 border-b border-slate-800 pb-1">
                <span>Behaalde Slagen:</span>
                <span className="text-emerald-400 font-bold">Wij {engine.scoreResult.tricksWonNS}</span>
              </div>
              <div className="flex justify-between text-slate-400 border-b border-slate-800 pb-1">
                <span>Punten Wij (NS):</span>
                <strong className="text-amber-300 text-sm">+{engine.scoreResult.pointsNS} pt</strong>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Punten Zij (EW):</span>
                <span className="text-slate-300">+{engine.scoreResult.pointsEW} pt</span>
              </div>
            </div>

            {/* Save High Score Form */}
            {engine.scoreResult.pointsNS > 0 && (
              <form onSubmit={handleSaveScore} className="space-y-2">
                <input
                  type="text"
                  maxLength={3}
                  placeholder="INITIALEN (3 LETT)"
                  value={initialsInput}
                  onChange={e => setInitialsInput(e.target.value.toUpperCase())}
                  className="w-full text-center px-4 py-2 rounded-xl bg-slate-950 border border-slate-700 text-amber-400 font-mono font-black text-lg uppercase tracking-widest focus:outline-none focus:border-amber-400"
                  autoFocus
                />
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-mono font-bold text-xs"
                >
                  Opslaan in Meesterstand
                </button>
              </form>
            )}

            <button
              onClick={handleNewDeal}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono font-bold text-xs"
            >
              Volgend Spel Delen
            </button>
          </div>
        </div>
      )}

      {/* Hall of Fame Modal */}
      {showHighScoresModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-amber-500/60 p-5 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-mono font-bold text-amber-300 text-sm flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-400" />
                <span>BRIDGE MEESTERSTAND (HALL OF FAME)</span>
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
                    <th>Bridger</th>
                    <th>Contract</th>
                    <th>Score</th>
                  </tr>
                </thead>
                <tbody>
                  {highScores.map((entry, idx) => (
                    <tr key={idx} className="border-b border-slate-800/40">
                      <td className="py-1.5 text-amber-400 font-bold">{idx + 1}</td>
                      <td className="font-bold text-white">{entry.name}</td>
                      <td className="text-cyan-300">{entry.contract}</td>
                      <td className="text-emerald-400 font-bold">+{entry.resultScore}</td>
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

      {/* Detailed Rules & Tribute Modal */}
      <BridgeHistoryModal
        isOpen={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
        lang="nl"
      />
    </div>
  );
};
