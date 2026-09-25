import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ArrowLeft,
  RotateCcw,
  Volume2,
  VolumeX,
  Trophy,
  HelpCircle,
  Sparkles,
  Lock,
  Unlock,
  CheckCircle2,
  Lightbulb,
  Clock,
  BarChart2,
  ShieldAlert,
  Calendar,
  Gamepad2,
  MousePointer2,
  Keyboard,
  Trash2,
} from 'lucide-react';
import {
  PegColor,
  GameMode,
  GAME_MODES,
  PEG_COLORS,
  ColorDef,
} from '../game/mastermindTypes';
import { MastermindEngine } from '../game/mastermindEngine';
import { mastermindAudio } from '../game/mastermindAudio';
import {
  getMastermindHighScores,
  saveMastermindHighScore,
  getMastermindStats,
  updateMastermindStats,
  calculateMastermindScore,
  MastermindHighScoreEntry,
} from '../game/mastermindHighScores';
import { gamepadManager, ControllerState } from '../utils/gamepadManager';
import { haptics } from '../utils/haptics';

interface MastermindCabinetProps {
  onBackToLobby: () => void;
}

export const MastermindCabinet: React.FC<MastermindCabinetProps> = ({ onBackToLobby }) => {
  const [mode, setMode] = useState<GameMode>('classic');
  const [allowDuplicates, setAllowDuplicates] = useState<boolean>(true);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [lang, setLang] = useState<'nl' | 'en'>('nl');

  // Engine instance
  const engineRef = useRef<MastermindEngine>(new MastermindEngine(mode, allowDuplicates));
  const [, setTick] = useState<number>(0);
  const forceUpdate = useCallback(() => setTick((t) => t + 1), []);

  // Selected peg slot in current row (0 to codeLength - 1)
  const [selectedSlot, setSelectedSlot] = useState<number>(0);
  // Slot currently hovered over during Drag & Drop
  const [dragOverSlot, setDragOverSlot] = useState<number | null>(null);

  // Modals & UI States
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [showHighScores, setShowHighScores] = useState<boolean>(false);
  const [showStats, setShowStats] = useState<boolean>(false);
  const [showWinModal, setShowWinModal] = useState<boolean>(false);
  const [showLoseModal, setShowLoseModal] = useState<boolean>(false);
  const [showControlGuide, setShowControlGuide] = useState<boolean>(false);
  const [playerInitials, setPlayerInitials] = useState<string>('DOC');
  const [hintMessage, setHintMessage] = useState<string | null>(null);
  const [calculatedScore, setCalculatedScore] = useState<number>(0);
  const [timerSeconds, setTimerSeconds] = useState<number>(0);
  const [isGamepadConnected, setIsGamepadConnected] = useState<boolean>(false);

  // High Scores & Stats cache
  const [highScores, setHighScores] = useState<MastermindHighScoreEntry[]>(getMastermindHighScores());
  const [stats, setStats] = useState(getMastermindStats());

  const engine = engineRef.current;
  const config = GAME_MODES[mode];

  // Gamepad Manager setup
  useEffect(() => {
    gamepadManager.start('mastermind');
    const unsubscribe = gamepadManager.subscribe((controllerState: ControllerState) => {
      setIsGamepadConnected(controllerState.connected);
    });
    return () => {
      unsubscribe();
      gamepadManager.stop();
    };
  }, []);

  // Timer loop
  useEffect(() => {
    const interval = setInterval(() => {
      if (engine.state === 'PLAYING') {
        setTimerSeconds(engine.getElapsedTimeSeconds());
      }
    }, 500);
    return () => clearInterval(interval);
  }, [engine]);

  // Sync audio toggle
  useEffect(() => {
    mastermindAudio.enabled = soundEnabled;
  }, [soundEnabled]);

  // Start new game
  const handleStartNewGame = useCallback(
    (newMode: GameMode = mode, newDuplicates: boolean = allowDuplicates) => {
      engineRef.current = new MastermindEngine(newMode, newDuplicates);
      setMode(newMode);
      setAllowDuplicates(newDuplicates);
      setSelectedSlot(0);
      setDragOverSlot(null);
      setShowWinModal(false);
      setShowLoseModal(false);
      setHintMessage(null);
      setTimerSeconds(0);
      forceUpdate();
      haptics.softClick();
    },
    [mode, allowDuplicates, forceUpdate]
  );

  // Direct placement of a color into a specific slot
  const handlePlacePegAt = useCallback(
    (slotIdx: number, color: PegColor) => {
      if (engine.state !== 'PLAYING') return;

      const colorIdx = config.availableColors.indexOf(color);
      mastermindAudio.playPegClick(colorIdx >= 0 ? colorIdx : 0);
      haptics.softClick();

      engine.setPeg(slotIdx, color);

      // Auto advance to next slot or wrap around
      const nextSlot = (slotIdx + 1) % config.codeLength;
      setSelectedSlot(nextSlot);
      forceUpdate();
    },
    [config.availableColors, config.codeLength, engine, forceUpdate]
  );

  // Handle peg placement in current selected slot
  const handleSelectColor = useCallback(
    (color: PegColor, colorIdx: number) => {
      if (engine.state !== 'PLAYING') return;

      mastermindAudio.playPegClick(colorIdx);
      haptics.softClick();

      const row = engine.getCurrentRow();
      if (!row) return;

      let targetIdx = selectedSlot;
      if (targetIdx < 0 || targetIdx >= config.codeLength) {
        const firstEmpty = row.pegs.findIndex((p) => p === null);
        targetIdx = firstEmpty !== -1 ? firstEmpty : 0;
      }

      engine.setPeg(targetIdx, color);

      // Advance to next slot
      const nextSlot = (targetIdx + 1) % config.codeLength;
      setSelectedSlot(nextSlot);
      forceUpdate();
    },
    [config.codeLength, engine, forceUpdate, selectedSlot]
  );

  // Cycle color on current selected slot (useful for Up/Down arrows and Controller)
  const handleCycleSlotColor = useCallback(
    (slotIdx: number, direction: 1 | -1 = 1) => {
      if (engine.state !== 'PLAYING') return;
      const row = engine.getCurrentRow();
      if (!row) return;

      const currentColor = row.pegs[slotIdx];
      const available = config.availableColors;
      let nextIndex = 0;

      if (currentColor) {
        const currentIdx = available.indexOf(currentColor);
        nextIndex = (currentIdx + direction + available.length) % available.length;
      } else {
        nextIndex = direction === 1 ? 0 : available.length - 1;
      }

      const nextColor = available[nextIndex];
      mastermindAudio.playPegClick(nextIndex);
      haptics.softClick();
      engine.setPeg(slotIdx, nextColor);
      forceUpdate();
    },
    [config.availableColors, engine, forceUpdate]
  );

  // Clear specific peg slot
  const handleClearSlot = useCallback(
    (slotIdx: number) => {
      if (engine.state !== 'PLAYING') return;
      mastermindAudio.playRemovePeg();
      haptics.softClick();
      engine.clearPeg(slotIdx);
      setSelectedSlot(slotIdx);
      forceUpdate();
    },
    [engine, forceUpdate]
  );

  // Clear whole row
  const handleClearCurrentRow = useCallback(() => {
    if (engine.state !== 'PLAYING') return;
    mastermindAudio.playRemovePeg();
    haptics.buttonPress();
    engine.clearCurrentRow();
    setSelectedSlot(0);
    forceUpdate();
  }, [engine, forceUpdate]);

  // Submit guess
  const handleSubmitGuess = useCallback(() => {
    if (engine.state !== 'PLAYING') return;
    if (!engine.isCurrentRowComplete()) {
      haptics.wallHit();
      return;
    }

    mastermindAudio.playCheckRow();
    haptics.coinInsert();

    const result = engine.submitCurrentGuess();
    if (!result) return;

    // Play clue sound with delay
    for (let i = 0; i < result.feedback.black; i++) {
      mastermindAudio.playPinFeedback(true, 120 + i * 100);
    }
    for (let j = 0; j < result.feedback.white; j++) {
      mastermindAudio.playPinFeedback(false, 120 + (result.feedback.black + j) * 100);
    }

    if (result.state === 'WON') {
      const elapsed = engine.getElapsedTimeSeconds();
      const turns = engine.currentRowIndex + 1;
      const score = calculateMastermindScore(
        mode,
        config.maxTurns,
        turns,
        elapsed,
        allowDuplicates,
        engine.hintsUsed
      );
      setCalculatedScore(score);

      setTimeout(() => {
        mastermindAudio.playSecretReveal();
        mastermindAudio.playWinFanfare();
        haptics.fruitEaten();
        setShowWinModal(true);
        const newStats = updateMastermindStats(true, turns, elapsed);
        setStats(newStats);
      }, 500);
    } else if (result.state === 'LOST') {
      setTimeout(() => {
        mastermindAudio.playSecretReveal();
        mastermindAudio.playLoseSound();
        haptics.gameOver();
        setShowLoseModal(true);
        const newStats = updateMastermindStats(false);
        setStats(newStats);
      }, 500);
    }

    setSelectedSlot(0);
    setHintMessage(null);
    forceUpdate();
  }, [allowDuplicates, config.maxTurns, engine, forceUpdate, mode]);

  // Hint button
  const handleGetHint = useCallback(() => {
    if (engine.state !== 'PLAYING') return;
    const hint = engine.getHint();
    if (hint) {
      mastermindAudio.playPegClick(3);
      haptics.powerPellet();
      setHintMessage(hint.text);
      forceUpdate();
    }
  }, [engine, forceUpdate]);

  // Save High Score
  const handleSaveScore = () => {
    if (!playerInitials.trim()) return;
    const updated = saveMastermindHighScore({
      name: playerInitials.toUpperCase(),
      initials: playerInitials.toUpperCase(),
      score: calculatedScore,
      mode: mode,
      turnsUsed: engine.currentRowIndex + 1,
      timeSeconds: engine.getElapsedTimeSeconds(),
    });
    setHighScores(updated);
    setShowWinModal(false);
    setShowHighScores(true);
    haptics.softClick();
  };

  // Keyboard and Controller Navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showWinModal || showLoseModal || showHistory || showHighScores || showStats) return;

      const availableColors = config.availableColors;
      const numKey = parseInt(e.key, 10);

      // Number keys 1-8: direct color placement
      if (!isNaN(numKey) && numKey >= 1 && numKey <= availableColors.length) {
        e.preventDefault();
        handleSelectColor(availableColors[numKey - 1], numKey - 1);
        return;
      }

      switch (e.key) {
        case 'ArrowLeft':
        case 'a':
        case 'A':
          e.preventDefault();
          setSelectedSlot((prev) => (prev <= 0 ? config.codeLength - 1 : prev - 1));
          break;

        case 'ArrowRight':
        case 'd':
        case 'D':
          e.preventDefault();
          setSelectedSlot((prev) => (prev >= config.codeLength - 1 ? 0 : prev + 1));
          break;

        case 'ArrowUp':
        case 'w':
        case 'W':
        case 'e':
        case 'E':
          e.preventDefault();
          handleCycleSlotColor(selectedSlot, 1);
          break;

        case 'ArrowDown':
        case 's':
        case 'S':
        case 'q':
        case 'Q':
          e.preventDefault();
          handleCycleSlotColor(selectedSlot, -1);
          break;

        case 'Enter':
          e.preventDefault();
          handleSubmitGuess();
          break;

        case ' ': // Space: cycle or place or submit if complete
          e.preventDefault();
          if (engine.isCurrentRowComplete()) {
            handleSubmitGuess();
          } else {
            handleCycleSlotColor(selectedSlot, 1);
          }
          break;

        case 'Backspace':
        case 'Delete':
          e.preventDefault();
          handleClearSlot(selectedSlot);
          break;

        case 'c':
        case 'C':
          e.preventDefault();
          handleClearCurrentRow();
          break;

        case 'h':
        case 'H':
          e.preventDefault();
          handleGetHint();
          break;

        case 'n':
        case 'N':
        case 'r':
        case 'R':
          e.preventDefault();
          handleStartNewGame();
          break;

        case 'm':
        case 'M':
          e.preventDefault();
          handleStartNewGame(mode === 'classic' ? 'super' : mode === 'super' ? 'mini' : 'classic', allowDuplicates);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    config,
    engine,
    selectedSlot,
    showWinModal,
    showLoseModal,
    showHistory,
    showHighScores,
    showStats,
    handleStartNewGame,
    handleSelectColor,
    handleCycleSlotColor,
    handleClearSlot,
    handleClearCurrentRow,
    handleSubmitGuess,
    handleGetHint,
    mode,
    allowDuplicates,
  ]);

  const isGameOver = engine.state !== 'PLAYING';
  const isComplete = engine.isCurrentRowComplete();

  return (
    <div className="min-h-screen max-h-screen bg-neutral-950 text-slate-100 flex flex-col items-center justify-between p-1.5 sm:p-2.5 select-none font-sans relative overflow-y-auto sm:overflow-hidden">
      {/* Background Vintage Arcade Glow */}
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-950/20 via-neutral-950 to-black z-0" />

      {/* Top Header Bar (Compact & Sleek) */}
      <header className="w-full max-w-2xl flex items-center justify-between z-10 py-1 border-b border-neutral-800/80 mb-1 flex-wrap gap-1.5">
        <div className="flex items-center gap-2">
          <button
            onClick={onBackToLobby}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-neutral-900 border border-neutral-800 hover:border-amber-500/60 text-neutral-300 hover:text-amber-400 font-mono text-xs transition shadow active:scale-95 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{lang === 'nl' ? 'LOBBY' : 'LOBBY'}</span>
          </button>

          <div className="flex items-center gap-1.5">
            <span className="text-base sm:text-lg">🧠</span>
            <div className="flex items-center gap-1.5">
              <h1 className="text-sm sm:text-base font-black tracking-wider text-amber-400 font-mono flex items-center gap-1">
                <span>MASTERMIND</span>
                <span className="text-[9px] px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  1971
                </span>
              </h1>
              {isGamepadConnected && (
                <span className="hidden md:flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-[9px] font-mono animate-pulse">
                  <Gamepad2 className="w-3 h-3" />
                  <span>GAMEPAD</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right Tools: Mode selector, Controls Info, Sounds, Stats, Highscores */}
        <div className="flex items-center gap-1 flex-wrap">
          {/* Mode Switcher */}
          <div className="flex bg-neutral-900 rounded-lg p-0.5 border border-neutral-800">
            {(['classic', 'super', 'mini'] as GameMode[]).map((m) => (
              <button
                key={m}
                onClick={() => handleStartNewGame(m, allowDuplicates)}
                className={`px-1.5 py-0.5 text-[10px] font-mono rounded transition-colors ${
                  mode === m
                    ? 'bg-amber-500 text-black font-bold shadow'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                {m === 'classic' ? '4P / 6K' : m === 'super' ? 'SUPER 5P' : 'SNEL 8T'}
              </button>
            ))}
          </div>

          {/* Quick Controls Guide Trigger */}
          <button
            onClick={() => setShowControlGuide(!showControlGuide)}
            className={`p-1 rounded-lg border text-[10px] font-mono flex items-center gap-1 transition active:scale-95 ${
              showControlGuide
                ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
            }`}
            title="Besturing Uitleg (Muis, Toetsenbord, Controller)"
          >
            <Keyboard className="w-3.5 h-3.5" />
          </button>

          {/* Sound Toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-1 rounded-lg bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-neutral-300 hover:text-white transition active:scale-95"
            title="Geluid aan/uit"
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-emerald-400" /> : <VolumeX className="w-3.5 h-3.5 text-neutral-500" />}
          </button>

          {/* High Scores Modal Trigger */}
          <button
            onClick={() => setShowHighScores(true)}
            className="p-1 rounded-lg bg-neutral-900 border border-neutral-800 hover:border-amber-500/50 text-amber-400 hover:text-amber-300 transition active:scale-95"
            title="High Scores"
          >
            <Trophy className="w-3.5 h-3.5" />
          </button>

          {/* Stats Modal Trigger */}
          <button
            onClick={() => setShowStats(true)}
            className="p-1 rounded-lg bg-neutral-900 border border-neutral-800 hover:border-cyan-500/50 text-cyan-400 hover:text-cyan-300 transition active:scale-95"
            title="Statistieken"
          >
            <BarChart2 className="w-3.5 h-3.5" />
          </button>

          {/* Rules & History Modal */}
          <button
            onClick={() => setShowHistory(true)}
            className="p-1 rounded-lg bg-neutral-900 border border-neutral-800 hover:border-indigo-500/50 text-indigo-400 hover:text-indigo-300 transition active:scale-95"
            title="Spelregels & Geschiedenis"
          >
            <HelpCircle className="w-3.5 h-3.5" />
          </button>

          {/* Language Toggle */}
          <button
            onClick={() => setLang(lang === 'nl' ? 'en' : 'nl')}
            className="px-1.5 py-0.5 rounded-lg bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-[10px] font-mono font-bold text-neutral-300"
          >
            {lang.toUpperCase()}
          </button>
        </div>
      </header>

      {/* Control Guide Quick Banner (Collapsible) */}
      {showControlGuide && (
        <div className="w-full max-w-xl z-20 bg-neutral-900/95 border border-amber-500/40 rounded-xl p-2.5 mb-1 text-[11px] font-mono shadow-xl text-neutral-300 animate-in fade-in">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-1 mb-1.5 font-bold text-amber-400">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>{lang === 'nl' ? 'BEDIENING & PIONNEN PLAATSEN' : 'CONTROLS & PLACING PEGS'}</span>
            </span>
            <button onClick={() => setShowControlGuide(false)} className="text-neutral-500 hover:text-white">✕</button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div className="bg-black/50 p-2 rounded-lg border border-neutral-800">
              <div className="text-amber-300 font-bold flex items-center gap-1 mb-0.5">
                <MousePointer2 className="w-3 h-3" />
                <span>{lang === 'nl' ? 'Muis & Drag-n-Drop' : 'Mouse & Drag-Drop'}</span>
              </div>
              <p className="text-[10px] text-neutral-400 leading-tight">
                {lang === 'nl'
                  ? '• Sleep pionnen direct naar een gat\n• Of klik op een kleur om te vullen'
                  : '• Drag pegs straight into slots\n• Or click color to place next'}
              </p>
            </div>
            <div className="bg-black/50 p-2 rounded-lg border border-neutral-800">
              <div className="text-cyan-300 font-bold flex items-center gap-1 mb-0.5">
                <Keyboard className="w-3 h-3" />
                <span>{lang === 'nl' ? 'Toetsenbord' : 'Keyboard'}</span>
              </div>
              <p className="text-[10px] text-neutral-400 leading-tight">
                {lang === 'nl'
                  ? '• 1-8: Directe kleur\n• Pijltjes: Wissel slot / kleur\n• Enter: Controleer'
                  : '• 1-8: Place color\n• Arrows: Move / cycle\n• Enter: Check'}
              </p>
            </div>
            <div className="bg-black/50 p-2 rounded-lg border border-neutral-800">
              <div className="text-emerald-300 font-bold flex items-center gap-1 mb-0.5">
                <Gamepad2 className="w-3 h-3" />
                <span>{lang === 'nl' ? 'Controller (Xbox/PS)' : 'Gamepad'}</span>
              </div>
              <p className="text-[10px] text-neutral-400 leading-tight">
                {lang === 'nl'
                  ? '• D-Pad Links/Rechts: Slot\n• D-Pad Op/Neer: Kleur\n• A/RT: Plaats • B: Wis'
                  : '• D-Pad Left/Right: Slot\n• D-Pad Up/Down: Cycle\n• A/RT: Submit • B: Del'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Tabletop Board Container (Ultra Compact Vertical Fit) */}
      <main className="w-full max-w-lg z-10 flex flex-col items-center gap-1.5 flex-1 justify-center">
        {/* Top Status Bar & Duplicates Selector */}
        <div className="w-full flex items-center justify-between px-2.5 py-1 rounded-lg bg-neutral-900/90 border border-neutral-800 text-xs font-mono">
          <div className="flex items-center gap-2.5">
            <span className="flex items-center gap-1 text-neutral-300 text-[11px]">
              <Clock className="w-3 h-3 text-amber-400" />
              <span>{Math.floor(timerSeconds / 60)}:{(timerSeconds % 60).toString().padStart(2, '0')}</span>
            </span>
            <span className="text-neutral-500">•</span>
            <span className="text-neutral-300 text-[11px]">
              {lang === 'nl' ? 'Beurt:' : 'Turn:'}{' '}
              <span className="text-amber-400 font-bold">
                {Math.min(engine.currentRowIndex + 1, config.maxTurns)} / {config.maxTurns}
              </span>
            </span>
          </div>

          <button
            onClick={() => handleStartNewGame(mode, !allowDuplicates)}
            className="text-[10px] px-2 py-0.5 rounded border border-neutral-700 hover:border-amber-500 text-neutral-300 hover:text-amber-300 transition flex items-center gap-1 cursor-pointer"
          >
            <span>{lang === 'nl' ? 'Dubbele Kleuren:' : 'Duplicates:'}</span>
            <span className={allowDuplicates ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
              {allowDuplicates ? (lang === 'nl' ? 'JA' : 'YES') : (lang === 'nl' ? 'NEE' : 'NO')}
            </span>
          </button>
        </div>

        {/* Vintage Mastermind Board (Compact Vertical) */}
        <div className="w-full bg-gradient-to-b from-[#24211e] via-[#1c1917] to-[#141210] rounded-xl border-2 sm:border-3 border-[#3c3530] p-1.5 sm:p-2.5 shadow-2xl relative shadow-black/80 flex flex-col items-center">
          {/* Subtle Board Texture Overlay */}
          <div className="absolute inset-0 rounded-lg bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:10px_10px] pointer-events-none" />

          {/* Top Shield Compartment (Secret Code) - Perfectly aligned with guess tracks */}
          <div className="w-full bg-neutral-950/90 rounded-lg border border-neutral-750 py-1 px-1.5 sm:px-2 mb-1 shadow-inner flex items-center justify-between relative overflow-hidden">
            {/* Left: Lock Icon & Label (Exact width matching row number column) */}
            <div className="w-8 sm:w-10 flex items-center gap-1 text-[9px] font-mono tracking-widest text-neutral-400 uppercase">
              {isGameOver ? <Unlock className="w-3.5 h-3.5 text-emerald-400" /> : <Lock className="w-3.5 h-3.5 text-amber-500" />}
            </div>

            {/* Shield Peg Row - Exact same layout, gap, and size as guess peg rows */}
            <div className="flex items-center gap-1.5 sm:gap-2 flex-1 justify-center">
              {engine.secretCode.map((color, idx) => {
                const colorDef = PEG_COLORS[color];
                return (
                  <div key={idx} className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center">
                    <div className="w-full h-full rounded-full bg-black/90 border border-neutral-700/80 shadow-inner flex items-center justify-center relative">
                      {isGameOver ? (
                        <div
                          className={`w-5.5 h-5.5 sm:w-6.5 sm:h-6.5 rounded-full bg-gradient-to-br ${colorDef.gradient} ${colorDef.border} border shadow-lg flex items-center justify-center relative`}
                          style={{ boxShadow: `0 0 8px ${colorDef.glow}` }}
                        >
                          <div className="w-1.5 h-1.5 rounded-full bg-white/40 absolute top-0.5 left-1" />
                        </div>
                      ) : (
                        <div className="w-5.5 h-5.5 sm:w-6.5 sm:h-6.5 rounded-full bg-gradient-to-b from-neutral-800 to-neutral-900 border border-neutral-700 flex items-center justify-center shadow-sm">
                          <span className="text-[10px] text-neutral-400 font-mono font-bold">?</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right: Shield Status Badge (Exact width matching feedback clue box) */}
            <div className="w-12 sm:w-14 flex items-center justify-center">
              <span
                className={`text-[8px] sm:text-[9px] font-mono px-1 py-0.5 rounded border uppercase font-bold tracking-wider ${
                  isGameOver
                    ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300'
                    : 'bg-neutral-900/90 border-neutral-800 text-neutral-400'
                }`}
              >
                {isGameOver ? (lang === 'nl' ? 'OPEN' : 'OPEN') : (lang === 'nl' ? 'CODE' : 'CODE')}
              </span>
            </div>
          </div>

          {/* Board Tracks (Guess Rows) */}
          <div className="w-full flex flex-col-reverse gap-0.5 sm:gap-1 py-0.5">
            {engine.rows.map((row, rowIdx) => {
              const isActive = rowIdx === engine.currentRowIndex && engine.state === 'PLAYING';
              const isPast = rowIdx < engine.currentRowIndex || (rowIdx === engine.currentRowIndex && isGameOver);

              return (
                <div
                  key={rowIdx}
                  className={`w-full flex items-center justify-between px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg transition-all border ${
                    isActive
                      ? 'bg-amber-950/40 border-amber-500/60 shadow-md ring-1 ring-amber-500/40'
                      : isPast
                      ? 'bg-black/40 border-neutral-850'
                      : 'bg-black/20 border-neutral-900/60 opacity-50'
                  }`}
                >
                  {/* Row Number Marker - Exact width w-8 sm:w-10 */}
                  <div className="w-8 sm:w-10 flex items-center justify-start pl-0.5">
                    <span
                      className={`text-[9px] font-mono font-bold ${
                        isActive ? 'text-amber-400' : isPast ? 'text-neutral-400' : 'text-neutral-600'
                      }`}
                    >
                      {rowIdx + 1}
                    </span>
                  </div>

                  {/* Guess Pegs Slots (With Full Drag & Drop Support) */}
                  <div className="flex items-center gap-1.5 sm:gap-2 flex-1 justify-center">
                    {row.pegs.map((peg, slotIdx) => {
                      const colorDef = peg ? PEG_COLORS[peg] : null;
                      const isSlotSelected = isActive && selectedSlot === slotIdx;
                      const isDragOver = isActive && dragOverSlot === slotIdx;

                      return (
                        <div
                          key={slotIdx}
                          onDragOver={(e) => {
                            if (!isActive) return;
                            e.preventDefault();
                            e.dataTransfer.dropEffect = 'copy';
                          }}
                          onDragEnter={(e) => {
                            if (!isActive) return;
                            e.preventDefault();
                            setDragOverSlot(slotIdx);
                          }}
                          onDragLeave={() => {
                            if (dragOverSlot === slotIdx) setDragOverSlot(null);
                          }}
                          onDrop={(e) => {
                            if (!isActive) return;
                            e.preventDefault();
                            setDragOverSlot(null);
                            const droppedColor = e.dataTransfer.getData('text/plain') as PegColor;
                            if (droppedColor && config.availableColors.includes(droppedColor)) {
                              handlePlacePegAt(slotIdx, droppedColor);
                            }
                          }}
                          onClick={() => {
                            if (isActive) {
                              if (peg) {
                                handleClearSlot(slotIdx);
                              } else {
                                setSelectedSlot(slotIdx);
                              }
                            }
                          }}
                          className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all ${
                            isActive ? 'cursor-pointer hover:scale-105 active:scale-95' : 'cursor-default'
                          } ${
                            isSlotSelected
                              ? 'ring-2 ring-amber-400 ring-offset-1 ring-offset-neutral-950 scale-105'
                              : ''
                          } ${
                            isDragOver
                              ? 'ring-2 ring-cyan-400 bg-cyan-950/60 scale-110 animate-pulse'
                              : ''
                          }`}
                        >
                          <div className="w-full h-full rounded-full bg-black/90 border border-neutral-700/80 shadow-inner flex items-center justify-center relative">
                            {colorDef ? (
                              <div
                                draggable={isActive}
                                onDragStart={(e) => {
                                  if (!isActive) return;
                                  e.dataTransfer.setData('text/plain', peg);
                                  e.dataTransfer.effectAllowed = 'move';
                                }}
                                className={`w-5.5 h-5.5 sm:w-6.5 sm:h-6.5 rounded-full bg-gradient-to-br ${colorDef.gradient} ${colorDef.border} border shadow-md relative`}
                                style={{ boxShadow: `0 0 6px ${colorDef.glow}` }}
                              >
                                <div className="w-1.5 h-1.5 rounded-full bg-white/50 absolute top-0.5 left-0.5" />
                              </div>
                            ) : (
                              <div className="w-2 h-2 rounded-full bg-neutral-800 border border-neutral-700/50 shadow-inner" />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Feedback Clue Pins Tray (Green = Correct Position & Color / Orange = Correct Color Only) */}
                  <div className="w-12 sm:w-14 bg-neutral-950/80 rounded border border-neutral-800 py-0.5 px-1 flex items-center justify-center">
                    {row.feedback ? (
                      <div className="flex items-center gap-0.5 sm:gap-1 flex-wrap justify-center">
                        {/* Green Pins (Exact Position & Color) */}
                        {Array.from({ length: row.feedback.black }).map((_, i) => (
                          <div
                            key={`g-${i}`}
                            className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-gradient-to-br from-emerald-400 via-emerald-500 to-emerald-700 border border-emerald-300 shadow flex items-center justify-center ring-1 ring-emerald-950"
                            style={{ boxShadow: '0 0 5px rgba(16, 185, 129, 0.7)' }}
                            title={lang === 'nl' ? 'Groen: Juiste kleur & Juiste positie' : 'Green: Correct color & Right position'}
                          >
                            <div className="w-0.5 h-0.5 rounded-full bg-emerald-100" />
                          </div>
                        ))}
                        {/* Orange Pins (Color in Code, Wrong Position) */}
                        {Array.from({ length: row.feedback.white }).map((_, i) => (
                          <div
                            key={`o-${i}`}
                            className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-gradient-to-br from-amber-400 via-orange-500 to-orange-600 border border-amber-300 shadow flex items-center justify-center ring-1 ring-orange-950"
                            style={{ boxShadow: '0 0 5px rgba(249, 115, 22, 0.7)' }}
                            title={lang === 'nl' ? 'Oranje: Juiste kleur, Verkeerde positie' : 'Orange: Correct color, Wrong position'}
                          >
                            <div className="w-0.5 h-0.5 rounded-full bg-amber-100" />
                          </div>
                        ))}
                        {/* Empty Holes */}
                        {Array.from({
                          length: config.codeLength - (row.feedback.black + row.feedback.white),
                        }).map((_, i) => (
                          <div
                            key={`e-${i}`}
                            className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-neutral-900 border border-neutral-800"
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="flex items-center gap-0.5 sm:gap-1 flex-wrap justify-center opacity-30">
                        {Array.from({ length: config.codeLength }).map((_, i) => (
                          <div
                            key={i}
                            className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-neutral-900 border border-neutral-800"
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Hint Message Banner */}
          {hintMessage && (
            <div className="w-full mt-1 px-2.5 py-1 rounded-lg bg-indigo-950/80 border border-indigo-500/50 text-indigo-200 text-[11px] font-mono flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Lightbulb className="w-3 h-3 text-yellow-300 animate-pulse" />
                <span>{hintMessage}</span>
              </span>
              <button
                onClick={() => setHintMessage(null)}
                className="text-neutral-400 hover:text-white text-xs ml-2 cursor-pointer"
              >
                ✕
              </button>
            </div>
          )}

          {/* Action Button Controls for Current Row (Compact) */}
          <div className="w-full flex items-center justify-between gap-1.5 mt-1.5 pt-1.5 border-t border-neutral-800">
            <button
              onClick={handleClearCurrentRow}
              disabled={isGameOver}
              className="px-2.5 py-1 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-300 text-[11px] font-mono transition active:scale-95 disabled:opacity-40 flex items-center gap-1 cursor-pointer"
              title="Rij wissen (Toets: C of Controller X)"
            >
              <Trash2 className="w-3 h-3" />
              <span>{lang === 'nl' ? 'Wis Rij' : 'Clear'}</span>
            </button>

            <button
              onClick={handleGetHint}
              disabled={isGameOver}
              className="px-2.5 py-1 rounded-lg bg-indigo-950/60 hover:bg-indigo-900/80 border border-indigo-600/50 text-indigo-300 text-[11px] font-mono transition active:scale-95 disabled:opacity-40 flex items-center gap-1 cursor-pointer"
              title="Deductie hint (Toets: H of Controller Y)"
            >
              <Lightbulb className="w-3 h-3 text-yellow-400" />
              <span>{lang === 'nl' ? 'Hint (-1000pt)' : 'Hint'}</span>
            </button>

            <button
              onClick={handleSubmitGuess}
              disabled={isGameOver || !isComplete}
              className={`px-3.5 py-1 rounded-lg font-mono text-[11px] font-bold transition flex items-center gap-1.5 shadow active:scale-95 ${
                isComplete && !isGameOver
                  ? 'bg-amber-500 hover:bg-amber-400 text-black shadow-amber-500/20 cursor-pointer animate-pulse'
                  : 'bg-neutral-800 text-neutral-500 cursor-not-allowed border border-neutral-700'
              }`}
              title="Controleer code (Toets: Enter of Controller RT/A)"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{lang === 'nl' ? 'CONTROLEER' : 'CHECK'}</span>
            </button>
          </div>
        </div>

        {/* Peg Selector Palette Tray (Draggable & Clickable) */}
        <div className="w-full bg-neutral-900/95 rounded-xl border border-neutral-800 py-1.5 px-2.5 shadow-xl flex flex-col items-center">
          <div className="w-full flex items-center justify-between mb-1 px-1">
            <span className="text-[9px] font-mono uppercase text-neutral-400 flex items-center gap-1">
              <MousePointer2 className="w-2.5 h-2.5 text-amber-400" />
              <span>{lang === 'nl' ? 'Kies of sleep een pion:' : 'Pick or drag a peg:'}</span>
            </span>
            <span className="text-[9px] font-mono text-neutral-500 hidden sm:inline">
              {lang === 'nl' ? 'Toetsen: 1 t/m ' + config.availableColors.length : 'Keys: 1 to ' + config.availableColors.length}
            </span>
          </div>

          <div className="flex items-center justify-center gap-1.5 sm:gap-2.5 flex-wrap">
            {config.availableColors.map((colorKey, idx) => {
              const def = PEG_COLORS[colorKey];
              return (
                <div
                  key={colorKey}
                  draggable={!isGameOver}
                  onDragStart={(e) => {
                    if (isGameOver) return;
                    e.dataTransfer.setData('text/plain', colorKey);
                    e.dataTransfer.effectAllowed = 'copy';
                  }}
                  onClick={() => handleSelectColor(colorKey, idx)}
                  className="group flex flex-col items-center gap-0.5 cursor-grab active:cursor-grabbing hover:scale-110 active:scale-95 transition disabled:opacity-40"
                  title={`${def.name[lang]} (Toets ${def.keyNumber}) - Klik of sleep naar het bord`}
                >
                  <div
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br ${def.gradient} ${def.border} border shadow-lg flex items-center justify-center relative group-hover:ring-2 group-hover:ring-amber-400/80`}
                    style={{ boxShadow: `0 0 8px ${def.glow}` }}
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-white/50 absolute top-1 left-1" />
                    <span className="text-[9px] font-mono font-black text-black/70 group-hover:text-black">
                      {def.keyNumber}
                    </span>
                  </div>
                  <span className="text-[8px] font-mono text-neutral-400 group-hover:text-neutral-200 leading-none">
                    {def.name[lang]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Restart */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleStartNewGame(mode, allowDuplicates)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-neutral-900 border border-neutral-800 hover:border-amber-500 text-neutral-300 hover:text-amber-400 text-[10px] font-mono transition active:scale-95 cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>{lang === 'nl' ? 'Nieuw Spel (N)' : 'New Game (N)'}</span>
          </button>
        </div>
      </main>

      {/* Footer (Minimal) */}
      <footer className="w-full max-w-2xl text-center py-0.5 text-[9px] font-mono text-neutral-500 border-t border-neutral-900">
        Mastermind (1970/1971) • Mordecai Meirowitz / Jumbo • Drag-and-Drop & Controller Ready
      </footer>

      {/* WIN MODAL */}
      {showWinModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-3 animate-in fade-in">
          <div className="w-full max-w-md bg-neutral-900 border-2 border-amber-500/70 rounded-2xl p-4 sm:p-5 shadow-2xl flex flex-col items-center animate-in zoom-in-95">
            <div className="w-10 h-10 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 mb-2">
              <Trophy className="w-5 h-5" />
            </div>

            <h2 className="text-lg sm:text-xl font-mono font-black text-amber-400 uppercase tracking-wider">
              {lang === 'nl' ? 'CODE GEKRAAKT!' : 'CODE BROKEN!'}
            </h2>
            <p className="text-xs text-neutral-300 font-mono text-center mt-1">
              {lang === 'nl'
                ? `Geweldig gespeeld! Je hebt de geheime code ontcijferd in ${engine.currentRowIndex + 1} beurten.`
                : `Masterfully deduced! You cracked the secret code in ${engine.currentRowIndex + 1} turns.`}
            </p>

            {/* Score Breakdown Box */}
            <div className="w-full bg-neutral-950 rounded-xl border border-neutral-800 p-2.5 my-3 space-y-1 text-xs font-mono">
              <div className="flex justify-between text-neutral-400">
                <span>{lang === 'nl' ? 'Basis Score:' : 'Base Score:'}</span>
                <span className="text-white">5,000 PTS</span>
              </div>
              <div className="flex justify-between text-neutral-400">
                <span>{lang === 'nl' ? 'Beurtenbonus:' : 'Turn Bonus:'}</span>
                <span className="text-emerald-400">
                  +{(config.maxTurns - (engine.currentRowIndex + 1)) * 1250} PTS
                </span>
              </div>
              <div className="flex justify-between text-neutral-400">
                <span>{lang === 'nl' ? 'Tijd / Snelheid:' : 'Time / Speed:'}</span>
                <span className="text-cyan-400">
                  +{Math.max(0, 300 - engine.getElapsedTimeSeconds()) * 20} PTS ({engine.getElapsedTimeSeconds()}s)
                </span>
              </div>
              {engine.hintsUsed > 0 && (
                <div className="flex justify-between text-rose-400">
                  <span>{lang === 'nl' ? 'Hint Straf:' : 'Hint Penalty:'}</span>
                  <span>-{engine.hintsUsed * 1000} PTS</span>
                </div>
              )}
              <div className="border-t border-neutral-800 pt-1 flex justify-between font-bold text-sm">
                <span className="text-amber-400">{lang === 'nl' ? 'TOTALE SCORE:' : 'TOTAL SCORE:'}</span>
                <span className="text-amber-400">{calculatedScore.toLocaleString()} PTS</span>
              </div>
            </div>

            {/* Initials Input for High Score */}
            <div className="w-full flex flex-col gap-1.5 mb-3">
              <label className="text-[10px] font-mono text-neutral-400">
                {lang === 'nl' ? 'Voer je initialen in voor de Hall of Fame:' : 'Enter your initials for the Hall of Fame:'}
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  maxLength={3}
                  value={playerInitials}
                  onChange={(e) => setPlayerInitials(e.target.value.toUpperCase())}
                  className="flex-1 bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-1.5 text-center text-base font-mono font-bold tracking-widest text-amber-400 uppercase focus:outline-none focus:border-amber-500"
                  placeholder="DOC"
                />
                <button
                  onClick={handleSaveScore}
                  className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-mono font-bold text-xs transition cursor-pointer"
                >
                  {lang === 'nl' ? 'OPSLAAN' : 'SAVE'}
                </button>
              </div>
            </div>

            <button
              onClick={() => handleStartNewGame(mode, allowDuplicates)}
              className="w-full py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-neutral-200 font-mono text-xs font-bold transition active:scale-95 cursor-pointer"
            >
              {lang === 'nl' ? 'NOG EEN KEER SPELEN' : 'PLAY AGAIN'}
            </button>
          </div>
        </div>
      )}

      {/* LOSE MODAL */}
      {showLoseModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-3 animate-in fade-in">
          <div className="w-full max-w-md bg-neutral-900 border-2 border-rose-500/70 rounded-2xl p-4 sm:p-5 shadow-2xl flex flex-col items-center animate-in zoom-in-95">
            <div className="w-10 h-10 rounded-full bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 mb-2">
              <ShieldAlert className="w-5 h-5" />
            </div>

            <h2 className="text-lg sm:text-xl font-mono font-black text-rose-400 uppercase tracking-wider">
              {lang === 'nl' ? 'BEURTEN OPGEBRUIKT!' : 'OUT OF TURNS!'}
            </h2>
            <p className="text-xs text-neutral-300 font-mono text-center mt-1">
              {lang === 'nl'
                ? 'Helaas! De codemaker heeft gewonnen. De geheime code is nu bovenaan onthuld.'
                : 'Alas! The codemaker prevailed. The secret code has been revealed above.'}
            </p>

            {/* Secret Code Quick Display */}
            <div className="w-full bg-neutral-950 rounded-xl border border-neutral-800 p-2.5 my-3 flex items-center justify-center gap-2">
              {engine.secretCode.map((c, i) => {
                const def = PEG_COLORS[c];
                return (
                  <div
                    key={i}
                    className={`w-6 h-6 rounded-full bg-gradient-to-br ${def.gradient} ${def.border} border shadow-md`}
                    title={def.name[lang]}
                  />
                );
              })}
            </div>

            <div className="w-full flex items-center gap-2">
              <button
                onClick={() => setShowLoseModal(false)}
                className="flex-1 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-mono text-xs cursor-pointer"
              >
                {lang === 'nl' ? 'Bord Bekijken' : 'Inspect Board'}
              </button>
              <button
                onClick={() => handleStartNewGame(mode, allowDuplicates)}
                className="flex-1 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-mono text-xs font-bold cursor-pointer"
              >
                {lang === 'nl' ? 'Opnieuw Proberen' : 'Try Again'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HIGH SCORES MODAL */}
      {showHighScores && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-3">
          <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl p-4 sm:p-5 shadow-2xl flex flex-col">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-2 mb-3">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-400" />
                <h3 className="font-mono font-bold text-amber-400 text-sm">
                  {lang === 'nl' ? 'MASTERMIND HALL OF FAME' : 'MASTERMIND HALL OF FAME'}
                </h3>
              </div>
              <button
                onClick={() => setShowHighScores(false)}
                className="text-neutral-400 hover:text-white font-mono text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
              {highScores.map((entry, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 rounded-lg bg-neutral-950 border border-neutral-850 text-xs font-mono"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-4 font-bold text-neutral-500">#{idx + 1}</span>
                    <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30 text-[10px]">
                      {entry.initials}
                    </span>
                    <div className="flex flex-col">
                      <span className="text-neutral-200 font-medium text-[11px]">{entry.name}</span>
                      <span className="text-[9px] text-neutral-500 flex items-center gap-1">
                        <span>{entry.turnsUsed} beurten</span> • <span>{entry.timeSeconds}s</span>
                        {entry.date && (
                          <>
                            • <Calendar className="w-2.5 h-2.5 text-neutral-600" />
                            <span>{entry.date}</span>
                          </>
                        )}
                      </span>
                    </div>
                  </div>
                  <span className="font-bold text-amber-400 text-xs sm:text-sm">
                    {entry.score.toLocaleString()} PTS
                  </span>
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowHighScores(false)}
              className="mt-3 w-full py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-mono text-xs font-bold cursor-pointer"
            >
              {lang === 'nl' ? 'SLUITEN' : 'CLOSE'}
            </button>
          </div>
        </div>
      )}

      {/* STATS MODAL */}
      {showStats && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-3">
          <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl p-4 sm:p-5 shadow-2xl flex flex-col">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-2 mb-3">
              <div className="flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-cyan-400" />
                <h3 className="font-mono font-bold text-cyan-400 text-sm">
                  {lang === 'nl' ? 'CARRIÈRE STATISTIEKEN' : 'CAREER STATISTICS'}
                </h3>
              </div>
              <button
                onClick={() => setShowStats(false)}
                className="text-neutral-400 hover:text-white font-mono text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs font-mono mb-3">
              <div className="bg-neutral-950 p-2.5 rounded-xl border border-neutral-800 flex flex-col">
                <span className="text-neutral-500 text-[10px]">{lang === 'nl' ? 'GESPEELD' : 'PLAYED'}</span>
                <span className="text-base font-bold text-white mt-0.5">{stats.gamesPlayed}</span>
              </div>
              <div className="bg-neutral-950 p-2.5 rounded-xl border border-neutral-800 flex flex-col">
                <span className="text-neutral-500 text-[10px]">{lang === 'nl' ? 'GEWONNEN' : 'WON'}</span>
                <span className="text-base font-bold text-emerald-400 mt-0.5">
                  {stats.gamesWon} (
                  {stats.gamesPlayed > 0 ? Math.round((stats.gamesWon / stats.gamesPlayed) * 100) : 0}%)
                </span>
              </div>
              <div className="bg-neutral-950 p-2.5 rounded-xl border border-neutral-800 flex flex-col">
                <span className="text-neutral-500 text-[10px]">{lang === 'nl' ? 'HUIDIGE STREAK' : 'CURRENT STREAK'}</span>
                <span className="text-base font-bold text-amber-400 mt-0.5">{stats.currentStreak} 🔥</span>
              </div>
              <div className="bg-neutral-950 p-2.5 rounded-xl border border-neutral-800 flex flex-col">
                <span className="text-neutral-500 text-[10px]">{lang === 'nl' ? 'MAX STREAK' : 'MAX STREAK'}</span>
                <span className="text-base font-bold text-cyan-400 mt-0.5">{stats.maxStreak}</span>
              </div>
              <div className="bg-neutral-950 p-2.5 rounded-xl border border-neutral-800 flex flex-col col-span-2">
                <span className="text-neutral-500 text-[10px]">{lang === 'nl' ? 'GEMIDDELD AANTAL BEURTEN' : 'AVG TURNS PER WIN'}</span>
                <span className="text-base font-bold text-purple-300 mt-0.5">
                  {stats.gamesWon > 0 ? (stats.totalTurnsUsed / stats.gamesWon).toFixed(1) : '—'} beurten
                </span>
              </div>
            </div>

            <button
              onClick={() => setShowStats(false)}
              className="w-full py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-mono text-xs font-bold cursor-pointer"
            >
              {lang === 'nl' ? 'SLUITEN' : 'CLOSE'}
            </button>
          </div>
        </div>
      )}

      {/* RULES & HISTORY MODAL */}
      {showHistory && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-3">
          <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl p-4 sm:p-5 shadow-2xl flex flex-col max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-2 mb-3">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-indigo-400" />
                <h3 className="font-mono font-bold text-indigo-400 text-sm">
                  {lang === 'nl' ? 'SPELREGELS & GESCHIEDENIS' : 'RULES & HISTORIC DOSSIER'}
                </h3>
              </div>
              <button
                onClick={() => setShowHistory(false)}
                className="text-neutral-400 hover:text-white font-mono text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2.5 text-xs font-mono text-neutral-300 leading-relaxed">
              <div className="bg-neutral-950 p-2.5 rounded-xl border border-neutral-800">
                <h4 className="font-bold text-amber-400 mb-1 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  <span>{lang === 'nl' ? 'Hoe werkt Mastermind?' : 'How does Mastermind work?'}</span>
                </h4>
                <p className="text-[11px]">
                  {lang === 'nl'
                    ? 'De computer kiest een code van 4 (of 5) gekleurde pionnen achter de schildkap. Jouw doel als codekraker is om deze combinatie binnen het maximale aantal beurten te ontmaskeren.'
                    : 'The computer secretly chooses a sequence of 4 (or 5) colored pegs behind the shield. Your goal as the codebreaker is to deduce the exact sequence within the turn limit.'}
                </p>
              </div>

              <div className="bg-neutral-950 p-2.5 rounded-xl border border-neutral-800 space-y-1.5">
                <h4 className="font-bold text-cyan-400">{lang === 'nl' ? 'Aanwijzingen (Pinnetjes):' : 'Feedback Clues:'}</h4>
                <div className="flex items-center gap-2 text-[11px]">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 border border-emerald-300 shadow-[0_0_6px_rgba(16,185,129,0.8)]" />
                  <span>
                    <strong className="text-emerald-300">{lang === 'nl' ? 'Groen pinnetje:' : 'Green pin:'}</strong>{' '}
                    {lang === 'nl'
                      ? 'Juiste kleur én op de juiste positie.'
                      : 'Correct color & in the right position.'}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[11px]">
                  <div className="w-2.5 h-2.5 rounded-full bg-orange-500 border border-orange-300 shadow-[0_0_6px_rgba(249,115,22,0.8)]" />
                  <span>
                    <strong className="text-orange-300">{lang === 'nl' ? 'Oranje pinnetje:' : 'Orange pin:'}</strong>{' '}
                    {lang === 'nl'
                      ? 'Juiste kleur, maar op de verkeerde positie.'
                      : 'Correct color, but in the wrong position.'}
                  </span>
                </div>
              </div>

              <div className="bg-neutral-950 p-2.5 rounded-xl border border-neutral-800">
                <h4 className="font-bold text-purple-400 mb-1">{lang === 'nl' ? 'Geschiedenis & Knuth Algoritme:' : 'History & Knuth:'}</h4>
                <p className="text-[11px]">
                  {lang === 'nl'
                    ? 'Mastermind werd in 1970 bedacht door Mordecai Meirowitz en door Jumbo immens populair gemaakt in Nederland. In 1977 bewees Donald Knuth dat elke 4-pions code binnen 5 beurten kan worden opgelost met minimax-deductie!'
                    : 'Invented in 1970 by Mordecai Meirowitz and distributed worldwide by Jumbo and Invicta. Donald Knuth proved mathematically in 1977 that 4-peg codes can be cracked in 5 turns or fewer!'}
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowHistory(false)}
              className="mt-3 w-full py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-mono text-xs font-bold cursor-pointer"
            >
              {lang === 'nl' ? 'BEGREPEN' : 'GOT IT'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
