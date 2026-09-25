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
  HelpCircle, 
  Trophy, 
  Sparkles, 
  Tv, 
  Swords, 
  ShieldAlert, 
  Flag, 
  Bomb, 
  Crown,
  Play,
  Shuffle,
  Eye,
  Layers
} from 'lucide-react';
import { 
  StrategoEngine, 
  StrategoSquare, 
  StrategoPiece, 
  RANK_NAMES, 
  PRESET_FORMATIONS, 
  FormationPreset,
  AIDifficulty,
  CombatResult,
  StrategoMove
} from '../game/strategoEngine';
import { strategoAudio } from '../game/strategoAudio';
import { getStrategoHighScores, saveStrategoHighScore, StrategoScoreEntry } from '../game/strategoHighScores';
import { StrategoBoardView } from './StrategoBoardView';
import { haptics } from '../utils/haptics';

interface StrategoCabinetProps {
  onBackToLobby: () => void;
}

export const StrategoCabinet: React.FC<StrategoCabinetProps> = ({ onBackToLobby }) => {
  const engineRef = useRef<StrategoEngine | null>(null);

  // Board & State
  const [grid, setGrid] = useState<readonly (readonly StrategoSquare[])[]>([]);
  const [phase, setPhase] = useState<'setup' | 'playing' | 'game_over'>('setup');
  const [currentTurn, setCurrentTurn] = useState<'red' | 'blue'>('red');
  const [winner, setWinner] = useState<'red' | 'blue' | 'draw' | null>(null);
  const [winReason, setWinReason] = useState<string>('');
  const [capturedRed, setCapturedRed] = useState<readonly StrategoPiece[]>([]);
  const [capturedBlue, setCapturedBlue] = useState<readonly StrategoPiece[]>([]);
  const [lastCombat, setLastCombat] = useState<CombatResult | null>(null);
  const [moveHistory, setMoveHistory] = useState<readonly StrategoMove[]>([]);
  const [isThinking, setIsThinking] = useState<boolean>(false);

  // Selection
  const [selectedPos, setSelectedPos] = useState<{ x: number; y: number } | null>(null);
  const [validMoves, setValidMoves] = useState<{ x: number; y: number; isAttack: boolean }[]>([]);
  const [statusHint, setStatusHint] = useState<string>(
    '💡 Opstellingsfase: Selecteer een rode pion om te verplaatsen/wisselen, of klik op ⚔️ START DE STRIJD om te spelen!'
  );

  // Settings
  const [aiDifficulty, setAiDifficulty] = useState<AIDifficulty>('tactician');
  const [activeFormation, setActiveFormation] = useState<FormationPreset>('balanced');
  const [scanlines, setScanlines] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Modals
  const [showRulesModal, setShowRulesModal] = useState<boolean>(false);
  const [rulesModalTab, setRulesModalTab] = useState<'rules' | 'tactics' | 'trivia'>('rules');
  const [showScoresModal, setShowScoresModal] = useState<boolean>(false);
  const [highScores, setHighScores] = useState<StrategoScoreEntry[]>([]);

  // Initialize engine
  useEffect(() => {
    const engine = new StrategoEngine(aiDifficulty);
    engineRef.current = engine;
    setGrid(engine.getGrid().map(row => [...row]));
    setPhase(engine.getPhase());
    setCurrentTurn(engine.getCurrentTurn());
    setHighScores(getStrategoHighScores());
    setIsMuted(strategoAudio.getMuted());
  }, [aiDifficulty]);

  // Sync state
  const syncState = () => {
    if (!engineRef.current) return;
    const eng = engineRef.current;
    setGrid(eng.getGrid().map(row => [...row]));
    setPhase(eng.getPhase());
    setCurrentTurn(eng.getCurrentTurn());
    setWinner(eng.getWinner());
    setWinReason(eng.getWinReason());
    setCapturedRed([...eng.getCapturedRed()]);
    setCapturedBlue([...eng.getCapturedBlue()]);
    setLastCombat(eng.getLastCombat());
    setMoveHistory([...eng.getMoveHistory()]);
    setIsThinking(eng.isAIThinking());

    if (eng.getPhase() === 'playing' && eng.getCurrentTurn() === 'red' && !eng.isAIThinking()) {
      setStatusHint('👉 Jouw beurt! Kies een rode pion om te verplaatsen.');
    } else if (eng.isAIThinking()) {
      setStatusHint('💻 C64 AI is aan het nadenken...');
    }
  };

  // Poll thinking
  useEffect(() => {
    let timer: number;
    if (isThinking) {
      timer = window.setInterval(() => {
        syncState();
      }, 50);
    }
    return () => clearInterval(timer);
  }, [isThinking]);

  // Sound effects on combat or game over
  useEffect(() => {
    if (lastCombat) {
      if (lastCombat.outcome === 'bomb_defused') {
        strategoAudio.playBombDefuse();
      } else if (lastCombat.outcome === 'defender_wins' && lastCombat.defender.rank === 'B') {
        strategoAudio.playBombExplosion();
      } else if (lastCombat.outcome === 'spy_assassination') {
        strategoAudio.playSpyAssassination();
      } else if (lastCombat.outcome === 'flag_captured') {
        strategoAudio.playVictoryFanfare();
      } else {
        strategoAudio.playBattleClash();
      }
    }
  }, [lastCombat]);

  // Game over high score saving
  useEffect(() => {
    if (phase === 'game_over') {
      if (winner === 'red') {
        strategoAudio.playVictoryFanfare();
        haptics.success();

        // Calculate score
        const turns = moveHistory.length;
        const diffBonus = aiDifficulty === 'grandmaster' ? 1000 : aiDifficulty === 'tactician' ? 500 : 200;
        const score = 2000 + diffBonus + Math.max(0, 1000 - turns * 15);

        const updated = saveStrategoHighScore({
          initials: 'YOU',
          score,
          turns,
          victories: 1,
          aiDifficulty,
          flagCaptured: lastCombat?.outcome === 'flag_captured',
          date: new Date().toISOString().split('T')[0],
          note: `Stratego Zege tegen ${aiDifficulty.toUpperCase()} in ${turns} beurten`
        });
        setHighScores(updated);
      } else if (winner === 'blue') {
        strategoAudio.playDefeatTone();
        haptics.error();
      }
    }
  }, [phase, winner]);

  // Square Click handler (Setup or Playing)
  const handleSquareClick = (x: number, y: number) => {
    if (!engineRef.current || isThinking || phase === 'game_over') return;
    const eng = engineRef.current;

    if (phase === 'setup') {
      // If user clicks outside Red's territory (y < 6), automatically start battle!
      if (y < 6) {
        if (selectedPos) {
          eng.startBattle();
          strategoAudio.playBattleClash();
          haptics.success();
          setPhase('playing');
          
          // Now in playing phase, check if move to (x, y) is valid
          const moves = eng.getValidMoves(selectedPos.x, selectedPos.y);
          const isMoveValid = moves.some(m => m.x === x && m.y === y);
          if (isMoveValid) {
            const success = eng.makeMove(selectedPos.x, selectedPos.y, x, y);
            if (success) {
              strategoAudio.playPlacePiece();
              haptics.light();
              setSelectedPos(null);
              setValidMoves([]);
              setStatusHint('⚔️ Strijd gestart! Je hebt je eerste zet gedaan.');
              syncState();
              return;
            }
          }
          // If move wasn't valid, just start battle and show valid moves for selected piece
          setValidMoves(moves);
          setStatusHint('⚔️ Strijd gestart! Kies een groen gemarkeerd vakje om naartoe te bewegen.');
          syncState();
          return;
        } else {
          // No piece selected yet, prompt user
          setStatusHint('💡 Selecteer eerst een van je rode pionnen (onderaan) om een zet te doen op het veld.');
          return;
        }
      }

      // Inside Red's territory (y >= 6)
      if (!selectedPos) {
        if (grid[y][x].piece && grid[y][x].piece?.side === 'red') {
          setSelectedPos({ x, y });
          // Highlight all other squares in Red's territory as swap targets
          const swapTargets: { x: number; y: number; isAttack: boolean }[] = [];
          for (let ry = 6; ry <= 9; ry++) {
            for (let rx = 0; rx < 10; rx++) {
              if (rx !== x || ry !== y) {
                swapTargets.push({ x: rx, y: ry, isAttack: false });
              }
            }
          }
          setValidMoves(swapTargets);
          strategoAudio.playSelect();
          haptics.selection();
          setStatusHint('🔄 Klik op een ander vakje in jouw gebied om te wisselen, of klik op het slagveld (boven) om te spelen!');
        }
      } else {
        // Deselect or Swap pieces
        if (selectedPos.x === x && selectedPos.y === y) {
          setSelectedPos(null);
          setValidMoves([]);
          setStatusHint('💡 Selecteer een rode pion om op te stellen of te bewegen.');
          return;
        }

        eng.swapSetupPieces(selectedPos.x, selectedPos.y, x, y);
        strategoAudio.playPlacePiece();
        haptics.light();
        setSelectedPos(null);
        setValidMoves([]);
        setStatusHint('✅ Pionnen omgewisseld! Klik op ⚔️ START DE STRIJD om te beginnen, of beweeg direct op het veld.');
        syncState();
      }
      return;
    }

    // In Playing Phase
    if (!selectedPos) {
      const piece = grid[y][x].piece;
      if (piece && piece.side === currentTurn) {
        setSelectedPos({ x, y });
        const moves = eng.getValidMoves(x, y);
        setValidMoves(moves);
        strategoAudio.playSelect();
        haptics.selection();

        if (piece.rank === 'F' || piece.rank === 'B') {
          setStatusHint(
            piece.rank === 'F'
              ? '🚩 De Vlag staat stil en kan niet verplaatst worden!'
              : '💣 Bommen staan vast en kunnen niet verplaatst worden!'
          );
        } else if (moves.length === 0) {
          setStatusHint('⚠️ Dit stuk is ingesloten en heeft geen vrije zetten.');
        } else {
          setStatusHint('🟢 Klik op een groen gemarkeerd vakje om te verplaatsen of ⚔️ om aan te vallen.');
        }
      } else if (piece && piece.side !== currentTurn) {
        setStatusHint('🛡️ Dat is een vijandelijke pion. Selecteer eerst een van je eigen rode pionnen.');
      } else {
        setStatusHint('💡 Selecteer een van je rode pionnen om een zet te doen.');
      }
    } else {
      // If clicked on own piece: change selection
      const piece = grid[y][x].piece;
      if (piece && piece.side === currentTurn) {
        setSelectedPos({ x, y });
        const moves = eng.getValidMoves(x, y);
        setValidMoves(moves);
        strategoAudio.playSelect();
        haptics.selection();

        if (piece.rank === 'F' || piece.rank === 'B') {
          setStatusHint(
            piece.rank === 'F'
              ? '🚩 De Vlag staat stil en kan niet verplaatst worden!'
              : '💣 Bommen staan vast en kunnen niet verplaatst worden!'
          );
        } else if (moves.length === 0) {
          setStatusHint('⚠️ Dit stuk is ingesloten en heeft geen vrije zetten.');
        } else {
          setStatusHint('🟢 Klik op een groen gemarkeerd vakje om te verplaatsen of ⚔️ om aan te vallen.');
        }
        return;
      }

      // Try making move
      const isMoveValid = validMoves.some(m => m.x === x && m.y === y);
      if (isMoveValid) {
        const success = eng.makeMove(selectedPos.x, selectedPos.y, x, y);
        if (success) {
          strategoAudio.playPlacePiece();
          haptics.light();
          setSelectedPos(null);
          setValidMoves([]);
          setStatusHint('⏳ Zet uitgevoerd! De computer is aan de beurt...');
          syncState();
        }
      } else {
        setSelectedPos(null);
        setValidMoves([]);
        setStatusHint('💡 Zet geannuleerd. Kies een rode pion om een nieuwe zet te doen.');
      }
    }
  };

  const handleStartBattle = () => {
    if (!engineRef.current) return;
    engineRef.current.startBattle();
    strategoAudio.playBattleClash();
    haptics.success();
    setSelectedPos(null);
    setValidMoves([]);
    syncState();
  };

  const handleApplyPreset = (preset: FormationPreset) => {
    if (!engineRef.current || phase !== 'setup') return;
    setActiveFormation(preset);
    engineRef.current.applyFormation('red', preset);
    engineRef.current.applyFormation('blue', 'corner_fortress');
    strategoAudio.playPlacePiece();
    haptics.selection();
    setSelectedPos(null);
    syncState();
  };

  const handleReset = () => {
    if (!engineRef.current) return;
    engineRef.current.initBoard();
    engineRef.current.applyFormation('red', activeFormation);
    engineRef.current.applyFormation('blue', 'corner_fortress');
    setSelectedPos(null);
    setValidMoves([]);
    syncState();
  };

  return (
    <div className="relative w-full min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-start select-none font-sans overflow-x-hidden">
      {/* Scanline Overlay */}
      {scanlines && (
        <div className="fixed inset-0 pointer-events-none z-40 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px]" />
      )}

      {/* Top Header */}
      <header className="w-full bg-slate-900/90 border-b border-amber-600/30 backdrop-blur-md px-4 py-2.5 flex items-center justify-between sticky top-0 z-30 shadow-md">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToLobby}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-amber-500 text-xs font-mono font-semibold transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-amber-400" />
            <span>Lobby</span>
          </button>

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-sm tracking-wide text-amber-300">
                STRATEGO (1947/1958)
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-700/50">
                JUMBO KLASSIEKER
              </span>
            </div>
            <span className="text-[11px] font-mono text-slate-400">
              Jacques Johan Mogendorff • 40 Pionnen • Bluf &amp; Vlaggenjacht
            </span>
          </div>
        </div>

        {/* Header Right Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const muted = strategoAudio.toggleMute();
              setIsMuted(muted);
            }}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 hover:border-amber-400 transition-colors cursor-pointer"
            title={isMuted ? 'Geluid Aan' : 'Geluid Uit'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-amber-400" />}
          </button>

          <button
            onClick={() => setScanlines(prev => !prev)}
            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
              scanlines ? 'bg-amber-950/60 border-amber-400/60 text-amber-300' : 'bg-slate-800 border-slate-700 text-slate-400'
            }`}
            title="CRT Scanlines"
          >
            <Tv className="w-4 h-4" />
          </button>

          <button
            onClick={() => setShowScoresModal(true)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 hover:border-amber-400 text-xs font-mono transition-colors cursor-pointer"
          >
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Records</span>
          </button>

          <button
            onClick={() => setShowRulesModal(true)}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 hover:border-amber-400 transition-colors cursor-pointer"
            title="Spelregels & Rangen"
          >
            <HelpCircle className="w-4 h-4 text-amber-400" />
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="w-full max-w-7xl px-3 sm:px-6 py-4 flex flex-col gap-4 flex-grow">
        {/* Setup Phase Control Strip */}
        {phase === 'setup' && (
          <div className="bg-amber-950/40 border border-amber-600/40 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl backdrop-blur-md">
            <div className="flex flex-col gap-1 text-center md:text-left">
              <div className="flex items-center gap-2 font-mono font-bold text-amber-300 text-sm">
                <Layers className="w-4 h-4 text-amber-400" />
                <span>OPSTELLINGSFASE: KIES EEN STRATEGIE OF WISSEL PIONNEN</span>
              </div>
              <p className="text-xs font-mono text-slate-300">
                Klik op 2 eigen rode pionnen om ze om te wisselen, of kies een beproefde tactische opstelling hieronder.
              </p>
            </div>

            {/* Presets */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => handleApplyPreset('balanced')}
                className={`px-3 py-1.5 rounded-xl font-mono text-xs border transition-colors cursor-pointer ${
                  activeFormation === 'balanced' ? 'bg-amber-500 text-slate-950 font-bold border-amber-300' : 'bg-slate-800 text-slate-300 border-slate-700'
                }`}
              >
                Gebalanceerd
              </button>
              <button
                onClick={() => handleApplyPreset('corner_fortress')}
                className={`px-3 py-1.5 rounded-xl font-mono text-xs border transition-colors cursor-pointer ${
                  activeFormation === 'corner_fortress' ? 'bg-amber-500 text-slate-950 font-bold border-amber-300' : 'bg-slate-800 text-slate-300 border-slate-700'
                }`}
              >
                Fortress
              </button>
              <button
                onClick={() => handleApplyPreset('bluff')}
                className={`px-3 py-1.5 rounded-xl font-mono text-xs border transition-colors cursor-pointer ${
                  activeFormation === 'bluff' ? 'bg-amber-500 text-slate-950 font-bold border-amber-300' : 'bg-slate-800 text-slate-300 border-slate-700'
                }`}
              >
                Bluf
              </button>
              <button
                onClick={() => handleApplyPreset('miner_blitz')}
                className={`px-3 py-1.5 rounded-xl font-mono text-xs border transition-colors cursor-pointer ${
                  activeFormation === 'miner_blitz' ? 'bg-amber-500 text-slate-950 font-bold border-amber-300' : 'bg-slate-800 text-slate-300 border-slate-700'
                }`}
              >
                Mineuren Blitz
              </button>

              <button
                onClick={handleStartBattle}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-mono font-black text-sm shadow-[0_0_15px_rgba(239,68,68,0.5)] transition-transform active:scale-95 cursor-pointer ml-2"
              >
                ⚔️ START DE STRIJD!
              </button>
            </div>
          </div>
        )}

        {/* Combat Incident Banner */}
        {lastCombat && phase === 'playing' && (
          <div className="bg-gradient-to-r from-red-950/90 via-slate-900 to-blue-950/90 border-2 border-amber-500/60 rounded-2xl p-3.5 flex items-center justify-between shadow-2xl animate-fade-in font-mono text-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-900 border border-amber-400 flex items-center justify-center text-xl">
                ⚔️
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-amber-300 text-sm">
                  STRIJDREPORTAGE:
                </span>
                <span className="text-slate-200">
                  {lastCombat.attacker.side === 'red' ? 'Jouw' : 'Vijandelijke'}{' '}
                  <strong>{RANK_NAMES[lastCombat.attacker.rank].nl} ({lastCombat.attacker.rank})</strong>{' '}
                  viel{' '}
                  <strong>{RANK_NAMES[lastCombat.defender.rank].nl} ({lastCombat.defender.rank})</strong> aan!
                </span>
                <span className="text-cyan-300 font-semibold mt-0.5">
                  {lastCombat.outcome === 'bomb_defused' && '⛏️ Mineur heeft de bom succesvol ontmanteld!'}
                  {lastCombat.outcome === 'spy_assassination' && '🗡️ Spion heeft de Maarschalk uitgeschakeld!'}
                  {lastCombat.outcome === 'attacker_wins' && '🎉 Aanvaller verslaat de verdediger!'}
                  {lastCombat.outcome === 'defender_wins' && '🛡️ Verdediger houdt stand, aanvaller sneuvelt!'}
                  {lastCombat.outcome === 'mutual_destruction' && '💥 Gelijke rang: beide pionnen sneuvelen!'}
                  {lastCombat.outcome === 'flag_captured' && '🚩 DE VLAG IS VEROVERD!'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Game Over Announcement */}
        {phase === 'game_over' && (
          <div className="bg-gradient-to-r from-red-900/90 via-slate-900 to-amber-900/90 border-2 border-yellow-400 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xl animate-fade-in font-mono">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-slate-900 border-2 border-yellow-400 flex items-center justify-center text-3xl shadow-[0_0_20px_#facc15]">
                {winner === 'red' ? '🏆' : '💀'}
              </div>
              <div className="flex flex-col">
                <span className="text-xl sm:text-2xl font-black text-white">
                  {winner === 'red' ? '🎉 ZEGEVIERING! JIJ WINT!' : '💻 DE COMPUTER HEEFT GEWONNEN!'}
                </span>
                <span className="text-sm text-yellow-300 font-semibold mt-1">
                  {winReason}
                </span>
              </div>
            </div>

            <button
              onClick={handleReset}
              className="px-6 py-2.5 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-black text-sm shadow-[0_0_15px_#facc15] transition-transform active:scale-95 cursor-pointer"
            >
              Opnieuw Spelen
            </button>
          </div>
        )}

        {/* Main Board & Side Panels Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left: Tactical Board (8 Cols) */}
          <div className="lg:col-span-8 flex flex-col items-center gap-3">
            <StrategoBoardView
              grid={grid}
              selectedPos={selectedPos}
              validMoves={validMoves}
              onSquareClick={handleSquareClick}
              lastCombat={lastCombat}
              phase={phase}
              currentTurn={currentTurn}
            />

            {/* Status Hint Banner */}
            <div className="w-full max-w-[660px] px-4 py-2.5 rounded-xl bg-slate-900/90 border border-amber-500/50 font-mono text-xs text-amber-300 flex items-center justify-between shadow-lg backdrop-blur-md">
              <span className="font-semibold">{statusHint}</span>
              {selectedPos && (
                <button
                  onClick={() => {
                    setSelectedPos(null);
                    setValidMoves([]);
                    setStatusHint('💡 Selectie geannuleerd. Kies een rode pion om een zet te doen.');
                  }}
                  className="ml-2 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-[10px] cursor-pointer font-bold"
                >
                  Annuleren
                </button>
              )}
            </div>
          </div>

          {/* Right: Ranks Cheat Sheet, Army Graveyard & Turn Status (4 Cols) */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            {/* Status Panel */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl font-mono">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
                <span className="text-xs text-slate-400">BEURT</span>
                <span className={`text-sm font-bold flex items-center gap-1.5 ${
                  currentTurn === 'red' ? 'text-red-400' : 'text-blue-400'
                }`}>
                  <span className={`w-2.5 h-2.5 rounded-full ${currentTurn === 'red' ? 'bg-red-500' : 'bg-blue-500'} animate-pulse`} />
                  {currentTurn === 'red' ? 'Jouw Beurt (Rood)' : 'Computer Denkt (Blauw)'}
                </span>
              </div>

              {/* Casualties / Captured Pieces */}
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Jouw Verliezen:</span>
                  <span className="font-bold text-red-400">{capturedRed.length} / 40</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Vijand Gesneuveld:</span>
                  <span className="font-bold text-blue-400">{capturedBlue.length} / 40</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Zetten Gespeeld:</span>
                  <span className="font-bold text-amber-300">{moveHistory.length}</span>
                </div>
              </div>
            </div>

            {/* Rank Hierarchy Quick Reference */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl font-mono text-xs space-y-2">
              <h4 className="font-bold text-amber-400 border-b border-slate-800 pb-2 flex items-center gap-1.5">
                <Crown className="w-4 h-4 text-yellow-400" />
                <span>Rangen &amp; Krachten (10 t/m 1)</span>
              </h4>

              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300 pt-1">
                <div>⭐ 10 Maarschalk (1×)</div>
                <div>🎖️ 9 Generaal (1×)</div>
                <div>🦅 8 Kolonel (2×)</div>
                <div>⚜️ 7 Majoor (3×)</div>
                <div>⚔️ 6 Kapitein (4×)</div>
                <div>🛡️ 5 Luitenant (4×)</div>
                <div>🪖 4 Sergeant (4×)</div>
                <div className="text-yellow-300">⛏️ 3 Mineur (Ontmantelt Bom)</div>
                <div className="text-cyan-300">🐎 2 Verkenner (Meerdere velden)</div>
                <div className="text-rose-400">🗡️ 1 Spion (Doodt Maarschalk)</div>
                <div className="text-orange-400">💣 Bom (Onbeweeglijk)</div>
                <div className="text-red-400 font-bold">🚩 Vlag (Doel van het spel)</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Rules, Tactics & Trivia Modal */}
      {showRulesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="bg-slate-900 border-2 border-amber-500/60 rounded-2xl max-w-3xl w-full max-h-[88vh] flex flex-col shadow-2xl font-sans text-xs">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
              <div className="flex items-center gap-2 font-bold text-amber-300 text-sm">
                <HelpCircle className="w-5 h-5 text-amber-400" />
                <span>Stratego Masterclass (Jumbo 1958)</span>
              </div>
              <button
                onClick={() => setShowRulesModal(false)}
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer border border-slate-700"
              >
                ✕
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="flex items-center gap-2 px-4 py-2 bg-slate-950 border-b border-slate-800">
              <button
                onClick={() => setRulesModalTab('rules')}
                className={`px-3 py-1.5 rounded-lg font-mono font-bold text-xs transition-colors cursor-pointer ${
                  rulesModalTab === 'rules' ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-300 hover:text-white'
                }`}
              >
                📜 Spelregels &amp; Rangen
              </button>
              <button
                onClick={() => setRulesModalTab('tactics')}
                className={`px-3 py-1.5 rounded-lg font-mono font-bold text-xs transition-colors cursor-pointer ${
                  rulesModalTab === 'tactics' ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-300 hover:text-white'
                }`}
              >
                🧠 Tactieken &amp; Bluf
              </button>
              <button
                onClick={() => setRulesModalTab('trivia')}
                className={`px-3 py-1.5 rounded-lg font-mono font-bold text-xs transition-colors cursor-pointer ${
                  rulesModalTab === 'trivia' ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-300 hover:text-white'
                }`}
              >
                ✨ Historie &amp; Feitjes
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 text-slate-300 leading-relaxed scrollbar-thin scrollbar-thumb-slate-700">
              {rulesModalTab === 'rules' && (
                <div className="space-y-4 font-mono text-xs">
                  <section className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2">
                    <h4 className="font-bold text-amber-400 text-sm">🎯 Doel &amp; Basisregels</h4>
                    <p>
                      Verover de vijandelijke <strong>Vlag (🚩)</strong> of schakel alle beweegbare pionnen van de vijand uit.
                    </p>
                    <p className="text-[11px] text-slate-400">
                      • Om de beurt verplaats je 1 pion 1 vak horizontaal of verticaal.<br />
                      • Het 10×10 bord heeft 2 onbegaanbare meren in het midden (C5-D6 en G5-H6).<br />
                      • Bij gelijke rang (bijv. Kapitein tegen Kapitein) sneuvelen <strong>beide pionnen</strong>!
                    </p>
                  </section>

                  <section className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2">
                    <h4 className="font-bold text-cyan-400 text-sm">⚔️ De Rangen &amp; Speciale Krachten</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                      <div className="p-2 rounded bg-slate-900 border border-slate-800">
                        <span className="font-bold text-yellow-400 block">⭐ 10 Maarschalk (1×)</span>
                        <span>Hoogste rang. Wint van 1 t/m 9. Verliest ALLEEN van Spion (bij aanval) of Bom.</span>
                      </div>
                      <div className="p-2 rounded bg-slate-900 border border-slate-800">
                        <span className="font-bold text-amber-400 block">🎖️ 9 Generaal (1×)</span>
                        <span>Wint van 1 t/m 8. Cruciaal om de vijandelijke Maarschalk op te sporen.</span>
                      </div>
                      <div className="p-2 rounded bg-slate-900 border border-slate-800">
                        <span className="font-bold text-yellow-300 block">⛏️ 3 Mineur (5×)</span>
                        <span><strong>SPECIALE KRACHT:</strong> Ontmantelt een Bom (💣) en haalt hem weg!</span>
                      </div>
                      <div className="p-2 rounded bg-slate-900 border border-slate-800">
                        <span className="font-bold text-cyan-400 block">🐎 2 Verkenner (8×)</span>
                        <span><strong>SPECIALE KRACHT:</strong> Mag meerdere open velden rechtuit sprinten.</span>
                      </div>
                      <div className="p-2 rounded bg-slate-900 border border-slate-800">
                        <span className="font-bold text-rose-400 block">🗡️ 1 Spion (1×)</span>
                        <span><strong>SPECIALE KRACHT:</strong> Verslaat de Maarschalk (10) als de Spion zélf aanvalt!</span>
                      </div>
                      <div className="p-2 rounded bg-slate-900 border border-slate-800">
                        <span className="font-bold text-orange-400 block">💣 Bommen (6×) &amp; 🚩 Vlag (1×)</span>
                        <span>Kunnen nooit bewegen. Aanvallen op een bom ontploft, tenzij door een Mineur.</span>
                      </div>
                    </div>
                  </section>
                </div>
              )}

              {rulesModalTab === 'tactics' && (
                <div className="space-y-3 font-sans text-xs">
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                    <span className="font-bold text-amber-400 text-sm block">1. De Spion-Generaal Valstrik</span>
                    <p className="text-slate-300">
                      Laat je Spion (1) altijd meelopen in de rug van je Generaal (9). Zodra de vijandelijke Maarschalk (10) jouw Generaal aanvalt, slaat je Spion direct genadeloos toe!
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                    <span className="font-bold text-amber-400 text-sm block">2. Spaar Altijd Minstens 2 Mineurs</span>
                    <p className="text-slate-300">
                      Verlies je Mineurs (3) niet aan het front! Als de vijandelijke vlag achter 3 bommen in de hoek ligt, kun je zonder Mineurs niet meer winnen.
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                    <span className="font-bold text-amber-400 text-sm block">3. De Valse Maarschalk Bluf</span>
                    <p className="text-slate-300">
                      Loop agressief met een Majoor (7) of Kapitein (6) naar voren. De tegenstander denkt vaak dat het jouw Maarschalk is en trekt zijn defensie angstig terug!
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                    <span className="font-bold text-amber-400 text-sm block">4. De Sonar Verkenner</span>
                    <p className="text-slate-300">
                      Sprint met een Verkenner (2) vlak voor een onbekende vijandelijke toren. Als de vijand in zijn beurt weigert te bewegen, is het vrijwel zeker een Bom of de Vlag.
                    </p>
                  </div>
                </div>
              )}

              {rulesModalTab === 'trivia' && (
                <div className="space-y-3 font-sans text-xs">
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                    <span className="font-bold text-amber-400 text-sm block">🇳🇱 Jacques Mogendorff &amp; Jumbo (1958)</span>
                    <p className="text-slate-300">
                      Bedenker Jacques Johan Mogendorff bedacht het spel in 1947. In 1958 kocht het Amsterdamse familiebedrijf Hausemann &amp; Hötte (Jumbo) de rechten voor 10.000 gulden.
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                    <span className="font-bold text-cyan-400 text-sm block">🔢 $10^{23}$ Mogelijke Beginopstellingen</span>
                    <p className="text-slate-300">
                      Er zijn meer dan 100 triljard verschillende beginopstellingen mogelijk per leger. Geen twee partijen Stratego zijn ooit hetzelfde!
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                    <span className="font-bold text-yellow-400 text-sm block">🏆 Mind Sports Olympiad</span>
                    <p className="text-slate-300">
                      Sinds 1997 worden op de Mind Sports Olympiad in Londen officiële Wereldkampioenschappen Stratego gehouden, waar Nederlandse spelers tot de absolute wereldtop behoren.
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-800 bg-slate-950 flex justify-end">
              <button
                onClick={() => setShowRulesModal(false)}
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-mono font-bold cursor-pointer transition-colors shadow-[0_0_10px_rgba(245,158,11,0.3)]"
              >
                Begrepen, Terug naar de Slag
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Leaderboard Modal */}
      {showScoresModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border-2 border-amber-500/60 rounded-2xl max-w-lg w-full flex flex-col shadow-2xl font-mono text-xs">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-amber-300 text-sm">
                <Trophy className="w-5 h-5 text-amber-400" />
                <span>Stratego Erelijst &amp; Veldslagen</span>
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
