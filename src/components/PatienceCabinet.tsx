import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  RotateCcw,
  Volume2,
  VolumeX,
  Trophy,
  HelpCircle,
  Undo2,
  Lightbulb,
  Sparkles,
  ArrowLeft,
  Settings,
  Layers,
  Palette,
  Play,
  CheckCircle2,
  Gamepad2,
  Eye,
  RefreshCw,
  Award
} from 'lucide-react';
import { Card, DrawMode, ScoringMode, CardBackTheme, TableTheme, CardRank } from '../game/patienceTypes';
import { PatienceEngine, SUITS, SUIT_SYMBOLS, RANK_NAMES, getCardColor } from '../game/patienceEngine';
import { PatienceCard } from './PatienceCard';
import { patienceAudio } from '../game/patienceAudio';
import { PatienceWin95Cascade } from '../game/patienceWin95Cascade';
import {
  getPatienceHighScores,
  savePatienceHighScore,
  getPatienceStats,
  updatePatienceStats,
  PatienceHighScoreEntry
} from '../game/patienceHighScores';
import { PatienceHistoryModal } from './PatienceHistoryModal';
import { haptics } from '../utils/haptics';

interface PatienceCabinetProps {
  onBackToLobby: () => void;
}

interface DragPayload {
  source: 'waste' | 'tableau' | 'foundation';
  tableauIndex?: number;
  cardIndex?: number;
  foundationIndex?: number;
  cards: Card[];
}

export const PatienceCabinet: React.FC<PatienceCabinetProps> = ({ onBackToLobby }) => {
  const [engine] = useState(() => new PatienceEngine(1, 'standard'));
  const [gameState, setGameState] = useState(() => ({ ...engine.state }));
  const [drawMode, setDrawMode] = useState<DrawMode>(1);
  const [scoringMode, setScoringMode] = useState<ScoringMode>('standard');
  const [cardBack, setCardBack] = useState<CardBackTheme>('beach');
  const [tableTheme, setTableTheme] = useState<TableTheme>('win95');
  const [soundEnabled, setSoundEnabled] = useState(true);
  
  // Modals & UI States
  const [showHistory, setShowHistory] = useState(false);
  const [showHighScores, setShowHighScores] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showWinModal, setShowWinModal] = useState(false);
  const [playerName, setPlayerName] = useState('');
  const [playerInitials, setPlayerInitials] = useState('WIN');
  const [highScores, setHighScores] = useState<PatienceHighScoreEntry[]>([]);
  const [stats, setStats] = useState(() => getPatienceStats());

  // Interaction States
  const [selectedPile, setSelectedPile] = useState<{
    type: 'waste' | 'tableau' | 'foundation';
    tableauIndex?: number;
    cardIndex?: number;
    foundationIndex?: number;
    cards: Card[];
  } | null>(null);
  const [draggedData, setDraggedData] = useState<DragPayload | null>(null);
  const [hintInfo, setHintInfo] = useState<{
    cardId: string;
    targetType: 'tableau' | 'foundation';
    targetIdx: number;
  } | null>(null);
  const [isAutoCompleting, setIsAutoCompleting] = useState(false);

  // References
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const winCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const winCascadeRef = useRef<PatienceWin95Cascade | null>(null);
  const foundationRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Update highscores from storage on mount
  useEffect(() => {
    setHighScores(getPatienceHighScores());
  }, []);

  // Synchronize audio toggle
  useEffect(() => {
    patienceAudio.enabled = soundEnabled;
  }, [soundEnabled]);

  // Game timer loop
  useEffect(() => {
    if (gameState.isWon) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      if (!gameState.isWon) {
        engine.state.timeSeconds++;
        setGameState({ ...engine.state });
      }
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState.isWon, engine]);

  // Handle Win Condition & Canvas Cascade
  useEffect(() => {
    if (gameState.isWon) {
      setShowWinModal(true);
      patienceAudio.playWinFanfare();
      haptics.success();

      const newStats = updatePatienceStats(true, gameState.score, gameState.timeSeconds, gameState.moves);
      setStats(newStats);

      // Mount Win95 Cascade on canvas
      if (winCanvasRef.current) {
        if (!winCascadeRef.current) {
          winCascadeRef.current = new PatienceWin95Cascade(winCanvasRef.current);
        }

        const foundationCoords = foundationRefs.current.map(ref => {
          if (ref) {
            const rect = ref.getBoundingClientRect();
            const canvasRect = winCanvasRef.current?.getBoundingClientRect();
            return {
              x: rect.left - (canvasRect?.left || 0),
              y: rect.top - (canvasRect?.top || 0)
            };
          }
          return { x: 200, y: 50 };
        });

        winCascadeRef.current.start(gameState.foundations, foundationCoords);
      }
    } else {
      if (winCascadeRef.current) {
        winCascadeRef.current.stop();
        winCascadeRef.current.clear();
      }
    }
  }, [gameState.isWon]);

  // Auto-complete routine
  const handleAutoComplete = useCallback(() => {
    if (isAutoCompleting || gameState.isWon) return;
    setIsAutoCompleting(true);

    const stepInterval = setInterval(() => {
      const moved = engine.performAutoCompleteStep();
      if (moved) {
        patienceAudio.playFoundationChime(Math.floor(Math.random() * 13) + 1);
        haptics.softClick();
        setGameState({ ...engine.state });
      } else {
        clearInterval(stepInterval);
        setIsAutoCompleting(false);
        setGameState({ ...engine.state });
      }
    }, 120);
  }, [engine, isAutoCompleting, gameState.isWon]);

  // Start new game
  const handleNewGame = (dMode: DrawMode = drawMode, sMode: ScoringMode = scoringMode) => {
    if (winCascadeRef.current) {
      winCascadeRef.current.stop();
      winCascadeRef.current.clear();
    }
    setShowWinModal(false);
    setSelectedPile(null);
    setHintInfo(null);
    setIsAutoCompleting(false);

    patienceAudio.playCardDeal();
    haptics.buttonPress();

    const nextState = engine.initGame(dMode, sMode);
    setGameState({ ...nextState });
  };

  // Stock draw click
  const handleStockClick = () => {
    if (gameState.isWon) return;
    setSelectedPile(null);
    setHintInfo(null);

    const success = engine.drawFromStock();
    if (success) {
      if (engine.state.waste.length === 0) {
        patienceAudio.playRestock();
      } else {
        patienceAudio.playCardDeal();
      }
      haptics.softClick();
      setGameState({ ...engine.state });
    }
  };

  // Undo move
  const handleUndo = () => {
    if (gameState.isWon) return;
    setSelectedPile(null);
    setHintInfo(null);

    const success = engine.undo();
    if (success) {
      patienceAudio.playUndo();
      haptics.softClick();
      setGameState({ ...engine.state });
    }
  };

  // Request hint
  const handleHint = () => {
    if (gameState.isWon) return;
    const hint = engine.getHint();
    if (hint) {
      patienceAudio.playHint();
      haptics.softClick();
      setHintInfo({
        cardId: hint.card.id,
        targetType: hint.toType,
        targetIdx: hint.toIdx
      });
      setTimeout(() => setHintInfo(null), 2500);
    }
  };

  // Click card to auto-move to foundation or best tableau
  const handleCardClick = (
    type: 'waste' | 'tableau' | 'foundation',
    tableauIdx?: number,
    cardIdx?: number,
    foundationIdx?: number
  ) => {
    if (gameState.isWon) return;
    setHintInfo(null);

    // If something was already selected, try to move it here
    if (selectedPile) {
      let moved = false;
      if (type === 'tableau' && tableauIdx !== undefined) {
        if (selectedPile.type === 'waste') {
          moved = engine.moveWasteToTableau(tableauIdx);
        } else if (selectedPile.type === 'tableau' && selectedPile.tableauIndex !== undefined && selectedPile.cardIndex !== undefined) {
          moved = engine.moveTableauToTableau(selectedPile.tableauIndex, tableauIdx, selectedPile.cardIndex);
        } else if (selectedPile.type === 'foundation' && selectedPile.foundationIndex !== undefined) {
          moved = engine.moveFoundationToTableau(selectedPile.foundationIndex, tableauIdx);
        }
      } else if (type === 'foundation' && foundationIdx !== undefined) {
        if (selectedPile.type === 'waste') {
          moved = engine.moveWasteToFoundation(foundationIdx);
        } else if (selectedPile.type === 'tableau' && selectedPile.tableauIndex !== undefined) {
          moved = engine.moveTableauToFoundation(selectedPile.tableauIndex, foundationIdx);
        }
      }

      if (moved) {
        if (type === 'foundation') {
          patienceAudio.playFoundationChime(selectedPile.cards[0].rank);
        } else {
          patienceAudio.playCardFlip();
        }
        haptics.softClick();
        setSelectedPile(null);
        setGameState({ ...engine.state });
        return;
      }
    }

    // Single click / selection handling
    if (type === 'waste' && gameState.waste.length > 0) {
      const topWaste = gameState.waste[gameState.waste.length - 1];
      // Try fast smart move to foundation first
      const fIdx = engine.findValidFoundation(topWaste);
      if (fIdx !== -1) {
        if (engine.moveWasteToFoundation(fIdx)) {
          patienceAudio.playFoundationChime(topWaste.rank);
          haptics.softClick();
          setSelectedPile(null);
          setGameState({ ...engine.state });
          return;
        }
      }
      setSelectedPile({
        type: 'waste',
        cards: [topWaste]
      });
      patienceAudio.playCardFlip();
      haptics.softClick();
    } else if (type === 'tableau' && tableauIdx !== undefined && cardIdx !== undefined) {
      const column = gameState.tableau[tableauIdx];
      const card = column[cardIdx];
      if (!card.faceUp) return;

      // If top card in column, check if it can move to foundation immediately
      if (cardIdx === column.length - 1) {
        const fIdx = engine.findValidFoundation(card);
        if (fIdx !== -1) {
          if (engine.moveTableauToFoundation(tableauIdx, fIdx)) {
            patienceAudio.playFoundationChime(card.rank);
            haptics.softClick();
            setSelectedPile(null);
            setGameState({ ...engine.state });
            return;
          }
        }
      }

      // Check if stack can move to any valid tableau column
      const movingCards = column.slice(cardIdx);
      setSelectedPile({
        type: 'tableau',
        tableauIndex: tableauIdx,
        cardIndex: cardIdx,
        cards: movingCards
      });
      patienceAudio.playCardFlip();
      haptics.softClick();
    } else if (type === 'foundation' && foundationIdx !== undefined) {
      const pile = gameState.foundations[foundationIdx];
      if (pile.length > 0) {
        setSelectedPile({
          type: 'foundation',
          foundationIndex: foundationIdx,
          cards: [pile[pile.length - 1]]
        });
        patienceAudio.playCardFlip();
        haptics.softClick();
      }
    }
  };

  // Double click to send card directly to foundation
  const handleCardDoubleClick = (type: 'waste' | 'tableau', tableauIdx?: number) => {
    if (gameState.isWon) return;
    let card: Card | undefined;
    if (type === 'waste' && gameState.waste.length > 0) {
      card = gameState.waste[gameState.waste.length - 1];
      const fIdx = engine.findValidFoundation(card);
      if (fIdx !== -1 && engine.moveWasteToFoundation(fIdx)) {
        patienceAudio.playFoundationChime(card.rank);
        haptics.softClick();
        setSelectedPile(null);
        setGameState({ ...engine.state });
      }
    } else if (type === 'tableau' && tableauIdx !== undefined) {
      const col = gameState.tableau[tableauIdx];
      if (col.length > 0) {
        card = col[col.length - 1];
        if (card.faceUp) {
          const fIdx = engine.findValidFoundation(card);
          if (fIdx !== -1 && engine.moveTableauToFoundation(tableauIdx, fIdx)) {
            patienceAudio.playFoundationChime(card.rank);
            haptics.softClick();
            setSelectedPile(null);
            setGameState({ ...engine.state });
          }
        }
      }
    }
  };

  // HTML5 Drag & Drop
  const handleDragStart = (e: React.DragEvent, payload: DragPayload) => {
    setDraggedData(payload);
    e.dataTransfer.setData('text/plain', JSON.stringify({ type: payload.source }));
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDropOnTableau = (e: React.DragEvent, targetTableauIdx: number) => {
    e.preventDefault();
    if (!draggedData) return;

    let moved = false;
    if (draggedData.source === 'waste') {
      moved = engine.moveWasteToTableau(targetTableauIdx);
    } else if (draggedData.source === 'tableau' && draggedData.tableauIndex !== undefined && draggedData.cardIndex !== undefined) {
      moved = engine.moveTableauToTableau(draggedData.tableauIndex, targetTableauIdx, draggedData.cardIndex);
    } else if (draggedData.source === 'foundation' && draggedData.foundationIndex !== undefined) {
      moved = engine.moveFoundationToTableau(draggedData.foundationIndex, targetTableauIdx);
    }

    if (moved) {
      patienceAudio.playCardFlip();
      haptics.softClick();
      setGameState({ ...engine.state });
    }
    setDraggedData(null);
    setSelectedPile(null);
  };

  const handleDropOnFoundation = (e: React.DragEvent, targetFoundationIdx: number) => {
    e.preventDefault();
    if (!draggedData) return;

    let moved = false;
    if (draggedData.source === 'waste') {
      moved = engine.moveWasteToFoundation(targetFoundationIdx);
    } else if (draggedData.source === 'tableau' && draggedData.tableauIndex !== undefined) {
      moved = engine.moveTableauToFoundation(draggedData.tableauIndex, targetFoundationIdx);
    }

    if (moved) {
      patienceAudio.playFoundationChime(draggedData.cards[0].rank);
      haptics.softClick();
      setGameState({ ...engine.state });
    }
    setDraggedData(null);
    setSelectedPile(null);
  };

  // High score submission
  const handleSaveScore = (e: React.FormEvent) => {
    e.preventDefault();
    const entry: PatienceHighScoreEntry = {
      name: playerName.trim() || 'Solitaire Player',
      initials: (playerInitials.trim() || 'WIN').toUpperCase().slice(0, 3),
      score: gameState.score,
      drawMode,
      scoringMode,
      moves: gameState.moves,
      timeSeconds: gameState.timeSeconds,
      date: new Date().toISOString().split('T')[0]
    };
    const updated = savePatienceHighScore(entry);
    setHighScores(updated);
    setShowWinModal(false);
    setShowHighScores(true);
  };

  // Format stopwatch timer
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // Desk background styling
  const getTableThemeClasses = () => {
    switch (tableTheme) {
      case 'win95':
        return 'bg-[#008080] text-white'; // Classic Windows 95 Teal / Green Felt #008080
      case 'green_felt':
        return 'bg-gradient-to-b from-emerald-900 via-emerald-800 to-green-950 text-white';
      case 'midnight_blue':
        return 'bg-gradient-to-b from-slate-950 via-blue-950 to-black text-white';
      case 'vintage_wood':
        return 'bg-gradient-to-b from-amber-950 via-stone-900 to-amber-950 text-amber-100';
    }
  };

  const canAutoWin = engine.canAutoComplete();

  return (
    <div className={`min-h-screen flex flex-col items-center justify-between p-2 sm:p-4 select-none ${getTableThemeClasses()} relative overflow-hidden font-sans`}>
      
      {/* Canvas for Windows 95 Bouncing Card Cascade Animation */}
      <canvas
        ref={winCanvasRef}
        className={`absolute inset-0 w-full h-full pointer-events-none z-40 transition-opacity duration-300 ${
          gameState.isWon ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Retro Windows 95 / Arcade Header */}
      <header className="w-full max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-2 border-b border-white/20 pb-2 mb-2 z-20">
        
        {/* Left: Back & Title */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              haptics.buttonPress();
              onBackToLobby();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900/80 hover:bg-slate-800 border border-white/30 rounded-md text-xs sm:text-sm font-bold shadow transition-all hover:scale-105 active:scale-95"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Lobby</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="text-xl sm:text-2xl">🃏</span>
            <div>
              <h1 className="font-mono font-black text-base sm:text-xl tracking-wider text-white flex items-center gap-2">
                PATIENCE <span className="text-[10px] sm:text-xs px-1.5 py-0.5 rounded bg-amber-500/90 text-black font-bold">SOLITAIRE 1990</span>
              </h1>
              <div className="text-[10px] sm:text-xs text-emerald-200/90">
                Wes Cherry • Susan Kare • Windows 3.0 / 95 Classic
              </div>
            </div>
          </div>
        </div>

        {/* Center: Live Stats Bar */}
        <div className="flex items-center gap-3 sm:gap-4 bg-black/40 border border-white/20 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-mono">
          <div className="flex flex-col items-center">
            <span className="text-[9px] text-white/70 uppercase">Score</span>
            <span className="font-bold text-amber-300">{gameState.score}</span>
          </div>
          <div className="w-[1px] h-6 bg-white/20"></div>
          <div className="flex flex-col items-center">
            <span className="text-[9px] text-white/70 uppercase">Tijd</span>
            <span className="font-bold text-cyan-300">{formatTime(gameState.timeSeconds)}</span>
          </div>
          <div className="w-[1px] h-6 bg-white/20"></div>
          <div className="flex flex-col items-center">
            <span className="text-[9px] text-white/70 uppercase">Beurten</span>
            <span className="font-bold text-emerald-300">{gameState.moves}</span>
          </div>
          <div className="w-[1px] h-6 bg-white/20"></div>
          <div className="flex flex-col items-center">
            <span className="text-[9px] text-white/70 uppercase">Modus</span>
            <span className="font-bold text-purple-300">
              {drawMode === 1 ? '1 Kaart' : drawMode === 2 ? '2 Kaarten (Huisregel)' : '3 Kaarten (Vegas)'}
            </span>
          </div>
        </div>

        {/* Right: Quick Action Buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Undo */}
          <button
            onClick={handleUndo}
            disabled={gameState.history.length === 0 || gameState.isWon}
            title="Ongedaan Maken (Undo)"
            className="p-2 bg-slate-900/70 hover:bg-slate-800 disabled:opacity-40 border border-white/20 rounded-md transition-all active:scale-95"
          >
            <Undo2 className="w-4 h-4 text-amber-300" />
          </button>

          {/* Hint */}
          <button
            onClick={handleHint}
            disabled={gameState.isWon}
            title="Tip / Hint"
            className="p-2 bg-slate-900/70 hover:bg-slate-800 disabled:opacity-40 border border-white/20 rounded-md transition-all active:scale-95"
          >
            <Lightbulb className="w-4 h-4 text-yellow-300" />
          </button>

          {/* Auto Complete */}
          {canAutoWin && (
            <button
              onClick={handleAutoComplete}
              disabled={isAutoCompleting}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-md shadow-lg animate-bounce border border-emerald-300"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Afmaken!</span>
            </button>
          )}

          {/* New Game */}
          <button
            onClick={() => handleNewGame()}
            title="Nieuw Spel"
            className="flex items-center gap-1 px-2.5 py-1.5 bg-amber-600 hover:bg-amber-500 text-slate-950 font-black text-xs rounded-md border border-amber-300 shadow transition-all active:scale-95"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Nieuw Spel</span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 bg-slate-900/70 hover:bg-slate-800 border border-white/20 rounded-md transition-all active:scale-95"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-red-400" />}
          </button>

          {/* High Scores */}
          <button
            onClick={() => setShowHighScores(true)}
            className="p-2 bg-slate-900/70 hover:bg-slate-800 border border-white/20 rounded-md transition-all active:scale-95"
          >
            <Trophy className="w-4 h-4 text-yellow-400" />
          </button>

          {/* Settings */}
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 bg-slate-900/70 hover:bg-slate-800 border border-white/20 rounded-md transition-all active:scale-95"
          >
            <Settings className="w-4 h-4 text-white" />
          </button>

          {/* Rules / History */}
          <button
            onClick={() => setShowHistory(true)}
            className="p-2 bg-slate-900/70 hover:bg-slate-800 border border-white/20 rounded-md transition-all active:scale-95"
          >
            <HelpCircle className="w-4 h-4 text-cyan-300" />
          </button>
        </div>
      </header>

      {/* Settings Bar (collapsible) */}
      {showSettings && (
        <div className="w-full max-w-6xl bg-slate-950/90 border border-white/20 rounded-lg p-3 mb-3 z-30 flex flex-wrap items-center justify-between gap-4 text-xs">
          {/* Draw Mode */}
          <div className="flex items-center gap-2">
            <span className="font-bold text-white/80">Trek Modus:</span>
            <button
              onClick={() => {
                setDrawMode(1);
                handleNewGame(1, scoringMode);
              }}
              className={`px-2.5 py-1 rounded font-bold ${
                drawMode === 1 ? 'bg-amber-500 text-black' : 'bg-slate-800 text-white'
              }`}
            >
              1 Kaart (Ontspannen)
            </button>
            <button
              onClick={() => {
                setDrawMode(2);
                handleNewGame(2, scoringMode);
              }}
              className={`px-2.5 py-1 rounded font-bold ${
                drawMode === 2 ? 'bg-amber-500 text-black' : 'bg-slate-800 text-white'
              }`}
            >
              2 Kaarten (Huisregel)
            </button>
            <button
              onClick={() => {
                setDrawMode(3);
                handleNewGame(3, scoringMode);
              }}
              className={`px-2.5 py-1 rounded font-bold ${
                drawMode === 3 ? 'bg-amber-500 text-black' : 'bg-slate-800 text-white'
              }`}
            >
              3 Kaarten (Klassiek Vegas)
            </button>
          </div>

          {/* Card Back Themes */}
          <div className="flex items-center gap-2">
            <span className="font-bold text-white/80">Kaartrug:</span>
            {(['beach', 'castle', 'hand', 'robot', 'retro_blue', 'emerald_classic'] as CardBackTheme[]).map(theme => (
              <button
                key={theme}
                onClick={() => setCardBack(theme)}
                className={`px-2 py-1 rounded capitalize font-mono text-[11px] ${
                  cardBack === theme ? 'ring-2 ring-amber-400 bg-slate-700' : 'bg-slate-800/80'
                }`}
              >
                {theme === 'beach' ? '🌴 Strand' : theme === 'castle' ? '🏰 Kasteel' : theme === 'hand' ? '🎴 Hand' : theme === 'robot' ? '🤖 Robot' : theme === 'retro_blue' ? '🔷 Blauw' : '♠ Smaragd'}
              </button>
            ))}
          </div>

          {/* Table Backgrounds */}
          <div className="flex items-center gap-2">
            <span className="font-bold text-white/80">Vilt:</span>
            {(['win95', 'green_felt', 'midnight_blue', 'vintage_wood'] as TableTheme[]).map(theme => (
              <button
                key={theme}
                onClick={() => setTableTheme(theme)}
                className={`px-2 py-1 rounded capitalize font-mono text-[11px] ${
                  tableTheme === theme ? 'ring-2 ring-cyan-400 bg-slate-700' : 'bg-slate-800/80'
                }`}
              >
                {theme === 'win95' ? 'Windows 95' : theme === 'green_felt' ? 'Groen Vilt' : theme === 'midnight_blue' ? 'Nachtblauw' : 'Hout'}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Playing Field */}
      <main className="w-full max-w-6xl flex-1 flex flex-col gap-4 sm:gap-6 z-20">
        
        {/* Top Section: Stock + Waste (Left) and 4 Foundations (Right) */}
        <section className="flex items-start justify-between gap-2 sm:gap-4">
          
          {/* Left: Stock and Waste */}
          <div className="flex items-center gap-2 sm:gap-4">
            
            {/* Stock Pile */}
            <div
              onClick={handleStockClick}
              className="w-12 h-16 sm:w-16 sm:h-24 md:w-20 md:h-28 rounded-md border-2 border-dashed border-white/40 flex items-center justify-center cursor-pointer transition-all hover:border-white/80 relative"
            >
              {gameState.stock.length > 0 ? (
                <PatienceCard
                  card={gameState.stock[gameState.stock.length - 1]}
                  cardBackTheme={cardBack}
                />
              ) : (
                <div className="flex flex-col items-center justify-center opacity-60 text-white">
                  <RefreshCw className="w-5 h-5" />
                  <span className="text-[9px] font-mono mt-1">HERSTEL</span>
                </div>
              )}
              {gameState.stock.length > 0 && (
                <div className="absolute -bottom-2 -right-2 bg-black/80 border border-white/30 text-amber-300 text-[10px] font-mono px-1.5 py-0.2 rounded-full">
                  {gameState.stock.length}
                </div>
              )}
            </div>

            {/* Waste Pile (up to 3 cards visible in Draw 3 mode) */}
            <div className="w-12 h-16 sm:w-16 sm:h-24 md:w-20 md:h-28 relative flex items-center">
              {gameState.waste.length === 0 ? (
                <div className="w-full h-full rounded-md border-2 border-dashed border-white/20 flex items-center justify-center">
                  <span className="text-white/20 text-xs font-mono">WASTE</span>
                </div>
              ) : (
                gameState.waste.slice(-3).map((card, idx, arr) => {
                  const isTop = idx === arr.length - 1;
                  const isSelected = selectedPile?.type === 'waste' && isTop;
                  const isHinted = hintInfo?.cardId === card.id;

                  return (
                    <div
                      key={card.id}
                      style={{
                        position: 'absolute',
                        left: `${idx * (arr.length > 1 ? 12 : 0)}px`,
                        zIndex: idx + 10
                      }}
                    >
                      <PatienceCard
                        card={card}
                        cardBackTheme={cardBack}
                        isSelected={isSelected}
                        isHinted={isHinted}
                        onClick={() => isTop && handleCardClick('waste')}
                        onDoubleClick={() => isTop && handleCardDoubleClick('waste')}
                        onDragStart={e => isTop && handleDragStart(e, { source: 'waste', cards: [card] })}
                      />
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right: 4 Foundations (Hearts, Diamonds, Clubs, Spades) */}
          <div className="flex items-center gap-1.5 sm:gap-3">
            {gameState.foundations.map((foundationPile, fIdx) => {
              const topCard = foundationPile.length > 0 ? foundationPile[foundationPile.length - 1] : null;
              const suitWatermark = SUIT_SYMBOLS[SUITS[fIdx]];
              const isRedSuit = getCardColor(SUITS[fIdx]) === 'red';
              const isTargetHinted = hintInfo?.targetType === 'foundation' && hintInfo.targetIdx === fIdx;

              return (
                <div
                  key={fIdx}
                  ref={el => { foundationRefs.current[fIdx] = el; }}
                  onDragOver={handleDragOver}
                  onDrop={e => handleDropOnFoundation(e, fIdx)}
                  onClick={() => handleCardClick('foundation', undefined, undefined, fIdx)}
                  className={`w-12 h-16 sm:w-16 sm:h-24 md:w-20 md:h-28 rounded-md border-2 border-dashed relative flex items-center justify-center transition-all ${
                    isTargetHinted ? 'border-yellow-400 ring-4 ring-yellow-400 animate-pulse' : 'border-white/40 bg-black/20'
                  }`}
                >
                  {topCard ? (
                    <PatienceCard
                      card={topCard}
                      cardBackTheme={cardBack}
                      onClick={() => handleCardClick('foundation', undefined, undefined, fIdx)}
                      onDragStart={e => handleDragStart(e, { source: 'foundation', foundationIndex: fIdx, cards: [topCard] })}
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center opacity-40">
                      <span className={`text-xl sm:text-2xl ${isRedSuit ? 'text-red-400' : 'text-slate-300'}`}>
                        {suitWatermark}
                      </span>
                      <span className="text-[9px] font-mono text-white/60 mt-0.5">A</span>
                    </div>
                  )}

                  {foundationPile.length > 0 && (
                    <div className="absolute -bottom-2 -right-1.5 bg-black/90 border border-white/30 text-white text-[9px] font-mono px-1 py-0.2 rounded-full z-20">
                      {foundationPile.length}/13
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Bottom Section: 7 Tableau Columns */}
        <section className="grid grid-cols-7 gap-1 sm:gap-3 flex-1 min-h-[360px] sm:min-h-[460px]">
          {gameState.tableau.map((column, colIdx) => {
            const isTargetHinted = hintInfo?.targetType === 'tableau' && hintInfo.targetIdx === colIdx;

            return (
              <div
                key={colIdx}
                onDragOver={handleDragOver}
                onDrop={e => handleDropOnTableau(e, colIdx)}
                onClick={() => column.length === 0 && handleCardClick('tableau', colIdx, 0)}
                className={`relative flex flex-col items-center min-h-[320px] rounded-md transition-all ${
                  column.length === 0
                    ? `border-2 border-dashed border-white/30 bg-black/10 flex items-center justify-start pt-2 ${
                        isTargetHinted ? 'ring-4 ring-yellow-400 border-yellow-400 animate-pulse' : ''
                      }`
                    : ''
                }`}
              >
                {column.length === 0 ? (
                  <span className="text-white/30 font-mono text-xs sm:text-sm font-bold mt-2">K</span>
                ) : (
                  column.map((card, cardIdx) => {
                    const isSelected =
                      selectedPile?.type === 'tableau' &&
                      selectedPile.tableauIndex === colIdx &&
                      selectedPile.cardIndex !== undefined &&
                      cardIdx >= selectedPile.cardIndex;
                    const isHinted = hintInfo?.cardId === card.id;

                    // Compute vertical cascading offset (tighter on mobile)
                    const offsetStep = card.faceUp ? 22 : 12;

                    return (
                      <div
                        key={card.id}
                        style={{
                          position: 'absolute',
                          top: `${cardIdx * offsetStep}px`,
                          zIndex: cardIdx + 5
                        }}
                        className="w-full flex justify-center"
                      >
                        <PatienceCard
                          card={card}
                          cardBackTheme={cardBack}
                          isSelected={isSelected}
                          isHinted={isHinted}
                          onClick={() => handleCardClick('tableau', colIdx, cardIdx)}
                          onDoubleClick={() => handleCardDoubleClick('tableau', colIdx)}
                          onDragStart={e => {
                            if (card.faceUp) {
                              handleDragStart(e, {
                                source: 'tableau',
                                tableauIndex: colIdx,
                                cardIndex: cardIdx,
                                cards: column.slice(cardIdx)
                              });
                            }
                          }}
                        />
                      </div>
                    );
                  })
                )}
              </div>
            );
          })}
        </section>
      </main>

      {/* Footer Instruction & Quick Bar */}
      <footer className="w-full max-w-6xl flex items-center justify-between border-t border-white/20 pt-2 text-[10px] sm:text-xs text-white/70 font-mono z-20">
        <div className="flex items-center gap-2">
          <span>🖱️ Klik of sleep kaarten</span>
          <span className="hidden sm:inline">•</span>
          <span className="hidden sm:inline">⚡ Dubbelklik om naar basis te sturen</span>
          <span className="hidden sm:inline">•</span>
          <span className="hidden sm:inline">✨ Automatisch afmaken zodra alle kaarten open liggen</span>
        </div>
        <div>
          <span>Win95 Solitaire v1.0 • 100% TypeScript</span>
        </div>
      </footer>

      {/* High Scores Modal */}
      {showHighScores && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-amber-500/60 rounded-xl max-w-lg w-full p-6 text-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-700 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Trophy className="w-6 h-6 text-yellow-400" />
                <h3 className="font-mono font-black text-lg text-amber-300">PATIENCE HALL OF FAME</h3>
              </div>
              <button
                onClick={() => setShowHighScores(false)}
                className="text-slate-400 hover:text-white font-mono text-xl"
              >
                ✕
              </button>
            </div>

            {/* Career Stats Grid */}
            <div className="grid grid-cols-3 gap-2 bg-slate-950 p-3 rounded-lg border border-slate-800 mb-4 text-center font-mono text-xs">
              <div>
                <span className="text-slate-400 text-[10px]">GESPEELD</span>
                <p className="font-bold text-white text-sm">{stats.gamesPlayed}</p>
              </div>
              <div>
                <span className="text-slate-400 text-[10px]">GEWONNEN</span>
                <p className="font-bold text-emerald-400 text-sm">
                  {stats.gamesWon} ({stats.gamesPlayed > 0 ? Math.round((stats.gamesWon / stats.gamesPlayed) * 100) : 0}%)
                </p>
              </div>
              <div>
                <span className="text-slate-400 text-[10px]">BESTE TIJD</span>
                <p className="font-bold text-cyan-400 text-sm">
                  {stats.bestTimeSeconds > 0 ? formatTime(stats.bestTimeSeconds) : '--:--'}
                </p>
              </div>
            </div>

            {/* Leaderboard Table */}
            <div className="overflow-y-auto max-h-64 mb-4">
              <table className="w-full text-left font-mono text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="py-1">#</th>
                    <th>NAAM</th>
                    <th>INIT</th>
                    <th>SCORE</th>
                    <th>TIJD</th>
                    <th>DATUM</th>
                  </tr>
                </thead>
                <tbody>
                  {highScores.map((entry, idx) => (
                    <tr key={idx} className="border-b border-slate-800/40 hover:bg-slate-800/40">
                      <td className="py-1.5 text-amber-400 font-bold">{idx + 1}</td>
                      <td className="font-bold text-white">{entry.name}</td>
                      <td className="text-cyan-300">{entry.initials}</td>
                      <td className="text-emerald-400 font-bold">{entry.score}</td>
                      <td className="text-slate-300">{formatTime(entry.timeSeconds)}</td>
                      <td className="text-slate-500">{entry.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <button
              onClick={() => setShowHighScores(false)}
              className="w-full py-2 bg-amber-500 hover:bg-amber-400 text-black font-mono font-bold rounded-md"
            >
              Sluiten
            </button>
          </div>
        </div>
      )}

      {/* Win Modal & High Score Prompt */}
      {showWinModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-emerald-500 rounded-xl max-w-md w-full p-6 text-white text-center shadow-2xl animate-fade-in">
            <span className="text-5xl mb-2 block">🎉</span>
            <h2 className="font-mono font-black text-2xl text-emerald-400 mb-1">
              GEFELICITEERD! GEWONNEN!
            </h2>
            <p className="text-xs text-slate-300 mb-4">
              Alle 52 kaarten zijn succesvol op de 4 basisstapels geplaatst!
            </p>

            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 grid grid-cols-3 gap-2 font-mono text-xs mb-4">
              <div>
                <span className="text-slate-400">Eindsom</span>
                <p className="font-black text-emerald-400 text-base">{gameState.score}</p>
              </div>
              <div>
                <span className="text-slate-400">Tijd</span>
                <p className="font-black text-cyan-400 text-base">{formatTime(gameState.timeSeconds)}</p>
              </div>
              <div>
                <span className="text-slate-400">Beurten</span>
                <p className="font-black text-amber-400 text-base">{gameState.moves}</p>
              </div>
            </div>

            <form onSubmit={handleSaveScore} className="flex flex-col gap-3 text-left mb-4">
              <div>
                <label className="text-xs font-mono text-slate-300 block mb-1">Spelersnaam:</label>
                <input
                  type="text"
                  value={playerName}
                  onChange={e => setPlayerName(e.target.value)}
                  placeholder="Bijv. Wes Cherry"
                  maxLength={20}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded text-white font-mono text-sm focus:border-emerald-400 outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-mono text-slate-300 block mb-1">3-Letter Initialen:</label>
                <input
                  type="text"
                  value={playerInitials}
                  onChange={e => setPlayerInitials(e.target.value.toUpperCase())}
                  placeholder="WIN"
                  maxLength={3}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded text-white font-mono text-sm focus:border-emerald-400 outline-none uppercase"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-mono font-black text-sm rounded shadow transition-all active:scale-95"
              >
                Score Opslaan in Hall of Fame
              </button>
            </form>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleNewGame()}
                className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-white font-mono text-xs font-bold rounded"
              >
                Opnieuw Spelen
              </button>
              <button
                type="button"
                onClick={() => setShowWinModal(false)}
                className="px-4 py-2 bg-slate-950 hover:bg-slate-900 border border-slate-700 text-slate-300 font-mono text-xs rounded"
              >
                Blijf Kijken
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Historical Dossier Modal */}
      <PatienceHistoryModal
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
