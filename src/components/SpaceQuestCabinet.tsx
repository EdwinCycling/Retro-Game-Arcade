/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Space Quest I: The Sarien Encounter (1986, Sierra On-Line)
 * Interactive Cabinet & Command Terminal Component
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  Volume2,
  VolumeX,
  Tv,
  RotateCcw,
  Trophy,
  Smartphone,
  BookOpen,
  ArrowUp,
  ArrowDown,
  ArrowLeft as ArrowLeftIcon,
  ArrowRight,
  Disc,
  Save,
  FolderOpen,
  Send,
  Languages,
  Rocket,
  Sparkles,
  HelpCircle
} from 'lucide-react';
import { SpaceQuestEngine } from '../game/spaceQuestEngine';
import { spaceQuestRenderer } from '../game/spaceQuestRenderer';
import { SQ_INVENTORY_REGISTRY } from '../game/spaceQuestRooms';
import { getSpaceQuestHighScores, saveSpaceQuestHighScore, listSQSavedGames } from '../game/spaceQuestHighScores';
import { SpaceQuestHistoryModal } from './SpaceQuestHistoryModal';
import { GameControlsModal, useGameControls } from './GameControlsModal';

interface SpaceQuestCabinetProps {
  onBackToLobby: () => void;
}

export const SpaceQuestCabinet: React.FC<SpaceQuestCabinetProps> = ({ onBackToLobby }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const engineRef = useRef<SpaceQuestEngine | null>(null);

  // Reactive state
  const [score, setScore] = useState(0);
  const [currentRoom, setCurrentRoom] = useState('JANITOR_CLOSET');
  const [inventory, setInventory] = useState<string[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [enableCRT, setEnableCRT] = useState(true);
  const [colorMode, setColorMode] = useState<'EGA' | 'CGA' | 'AMBER' | 'GREEN'>('EGA');
  const [lang, setLang] = useState<'nl' | 'en'>('en');
  const [currentInput, setCurrentInput] = useState('');
  const [messageLog, setMessageLog] = useState<{ text: string; isPlayer?: boolean; isSystem?: boolean }[]>([]);
  const [isVictorious, setIsVictorious] = useState(false);

  // Modals & Trays
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const { showControls, setShowControls } = useGameControls('space_quest');
  const [showHighScoresModal, setShowHighScoresModal] = useState(false);
  const [showSaveLoadModal, setShowSaveLoadModal] = useState(false);
  const [saveSlotMode, setSaveSlotMode] = useState<'save' | 'load'>('save');
  const [savedSlots, setSavedSlots] = useState(listSQSavedGames());
  const [highScores, setHighScores] = useState(getHighScoresList());
  const [initials, setInitials] = useState('');
  const [hasSubmittedScore, setHasSubmittedScore] = useState(false);
  const [showTouchControls, setShowTouchControls] = useState(() => {
    return (
      typeof window !== 'undefined' &&
      ('ontouchstart' in window || navigator.maxTouchPoints > 0 || window.innerWidth < 1024)
    );
  });

  function getHighScoresList() {
    return getSpaceQuestHighScores();
  }

  // Initialize Engine
  useEffect(() => {
    const engine = new SpaceQuestEngine();
    engine.setLang(lang);
    engineRef.current = engine;

    const syncState = () => {
      setScore(engine.score);
      setCurrentRoom(engine.currentRoom);
      setInventory([...engine.inventory]);
      setSoundEnabled(engine.soundEnabled);
      setMessageLog([...engine.messageLog]);
      setIsVictorious(engine.roger.isVictorious);
    };

    const unsubscribe = engine.subscribe(syncState);
    syncState();

    let animId: number;
    const renderLoop = () => {
      const canvas = canvasRef.current;
      if (canvas && engineRef.current) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          spaceQuestRenderer.setColorMode(colorMode);
          spaceQuestRenderer.render(
            ctx,
            canvas.width,
            canvas.height,
            engineRef.current.currentRoom,
            engineRef.current.roger,
            engineRef.current.score,
            engineRef.current.soundEnabled,
            engineRef.current.lang,
            engineRef.current.currentInput,
            engineRef.current.messageLog
          );
        }
      }
      animId = requestAnimationFrame(renderLoop);
    };

    animId = requestAnimationFrame(renderLoop);

    return () => {
      cancelAnimationFrame(animId);
      unsubscribe();
    };
  }, [colorMode, lang]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const engine = engineRef.current;
      if (!engine) return;

      if (showHighScoresModal || showSaveLoadModal) return;

      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        if (document.activeElement !== inputRef.current) {
          e.preventDefault();
          engine.moveRoger('NORTH');
        }
      } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        if (document.activeElement !== inputRef.current) {
          e.preventDefault();
          engine.moveRoger('SOUTH');
        }
      } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        if (document.activeElement !== inputRef.current) {
          e.preventDefault();
          engine.moveRoger('WEST');
        }
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        if (document.activeElement !== inputRef.current) {
          e.preventDefault();
          engine.moveRoger('EAST');
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const engine = engineRef.current;
      if (!engine) return;
      if (
        ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 's', 'a', 'd', 'W', 'S', 'A', 'D'].includes(
          e.key
        )
      ) {
        if (document.activeElement !== inputRef.current) {
          engine.stopRoger();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [showHighScoresModal, showSaveLoadModal]);

  const handleCommandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!engineRef.current || !currentInput.trim()) return;
    engineRef.current.submitCommand(currentInput);
    setCurrentInput('');
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const executeChipCommand = (cmd: string) => {
    if (!engineRef.current) return;
    engineRef.current.submitCommand(cmd);
  };

  const handleRestart = () => {
    if (engineRef.current) {
      engineRef.current.resetGame();
      setHasSubmittedScore(false);
      setInitials('');
    }
  };

  const handleToggleLang = () => {
    const next = lang === 'nl' ? 'en' : 'nl';
    setLang(next);
    if (engineRef.current) {
      engineRef.current.setLang(next);
    }
  };

  const cycleColorMode = () => {
    if (colorMode === 'EGA') setColorMode('CGA');
    else if (colorMode === 'CGA') setColorMode('AMBER');
    else if (colorMode === 'AMBER') setColorMode('GREEN');
    else setColorMode('EGA');
  };

  const handleSaveSlot = (slotId: number) => {
    if (engineRef.current) {
      engineRef.current.saveGame(slotId);
      setSavedSlots(listSQSavedGames());
      setShowSaveLoadModal(false);
    }
  };

  const handleLoadSlot = (slotId: number) => {
    if (engineRef.current) {
      engineRef.current.loadGame(slotId);
      setSavedSlots(listSQSavedGames());
      setShowSaveLoadModal(false);
    }
  };

  const handleSubmitScore = (e: React.FormEvent) => {
    e.preventDefault();
    if (!initials.trim()) return;
    const updated = saveSpaceQuestHighScore(initials, score);
    setHighScores(updated);
    setHasSubmittedScore(true);
  };

  // Contextual command chips
  const getContextChips = () => {
    if (lang === 'nl') {
      switch (currentRoom) {
        case 'JANITOR_CLOSET':
          return ['pak bezem', 'kijk rond', 'ga oost', 'help'];
        case 'STARBOARD_HALL':
          return ['doorzoek jerry', 'pak sleutelkaart', 'ga noord', 'ga oost'];
        case 'DATA_ARCHIVE':
          return ['pak cassette', 'kijk computer', 'ga zuid'];
        case 'ESCAPE_POD_BAY':
          return ['pak overlevingspakket', 'stap in capsule', 'lanceer'];
        case 'KERONA_CRASH':
          return ['pak glas', 'pak water', 'kijk wrak', 'ga oost'];
        case 'KERONA_CANYON':
          return ['kijk kloof', 'ga noord', 'ga oost'];
        case 'ORAT_CAVERN':
          return ['gebruik glas', 'pak pistool', 'ga noord'];
        case 'UNDERGROUND_LAB':
          return ['praat met hologram', 'pak widget', 'ga zuid'];
        case 'SKIMMER_LANDING':
          return ['stap in skimmer', 'bestuur skimmer', 'kijk woestijn'];
        default:
          return ['kijk rond', 'buidel', 'help'];
      }
    } else {
      switch (currentRoom) {
        case 'JANITOR_CLOSET':
          return ['take broom', 'look around', 'go east', 'help'];
        case 'STARBOARD_HALL':
          return ['search jerry', 'take keycard', 'go north', 'go east'];
        case 'DATA_ARCHIVE':
          return ['take cartridge', 'look computer', 'go south'];
        case 'ESCAPE_POD_BAY':
          return ['take survival kit', 'enter pod', 'launch'];
        case 'KERONA_CRASH':
          return ['take glass', 'take water', 'look wreck', 'go east'];
        case 'KERONA_CANYON':
          return ['look canyon', 'go north', 'go east'];
        case 'ORAT_CAVERN':
          return ['use glass', 'take pistol', 'go north'];
        case 'UNDERGROUND_LAB':
          return ['talk hologram', 'take gadget', 'go south'];
        case 'SKIMMER_LANDING':
          return ['enter skimmer', 'drive skimmer', 'look desert'];
        default:
          return ['look around', 'inventory', 'help'];
      }
    }
  };

  return (
    <div className="relative w-full min-h-screen bg-neutral-950 text-neutral-100 flex flex-col items-center justify-between p-2 sm:p-4 select-none">
      {/* Top Sci-Fi Terminal Header Bar */}
      <header className="w-full max-w-5xl flex items-center justify-between px-3 py-2 bg-neutral-900/90 border border-neutral-800 rounded-2xl shadow-lg mb-2">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBackToLobby}
            className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition cursor-pointer flex items-center gap-1.5 text-xs font-mono"
            title="Terug naar Arcade Lobby"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Lobby</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="text-xl">🚀</span>
            <div>
              <h1 className="text-xs sm:text-sm font-black font-mono text-cyan-400 tracking-wider">
                SPACE QUEST: CHAPTER I
              </h1>
              <span className="text-[10px] text-neutral-400 font-mono">
                The Sarien Encounter (1986, Sierra AGI)
              </span>
            </div>
          </div>
        </div>

        {/* Toolbar controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Color Mode Switcher */}
          <button
            type="button"
            onClick={cycleColorMode}
            className="px-2.5 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-mono border border-neutral-700 transition cursor-pointer flex items-center gap-1 text-cyan-300"
            title="Kleurmodus wisselen (EGA 16 / CGA 4 / Amber / Groen)"
          >
            <Tv className="w-3.5 h-3.5" />
            <span className="font-bold">{colorMode}</span>
          </button>

          {/* Language Switch */}
          <button
            type="button"
            onClick={handleToggleLang}
            className="px-2.5 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-mono border border-neutral-700 transition cursor-pointer flex items-center gap-1"
            title="Taal / Language"
          >
            <Languages className="w-3.5 h-3.5 text-amber-400" />
            <span>{lang.toUpperCase()}</span>
          </button>

          {/* Floppy Save/Load */}
          <button
            type="button"
            onClick={() => {
              setSaveSlotMode('save');
              setShowSaveLoadModal(true);
            }}
            className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-mono border border-neutral-700 transition cursor-pointer"
            title="Diskette Opslaan / Laden"
          >
            <Disc className="w-4 h-4 text-cyan-400" />
          </button>

          {/* Besturing & Xbox Controller */}
          <button
            type="button"
            onClick={() => setShowControls(true)}
            className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-yellow-400 text-xs font-mono border border-neutral-700 transition cursor-pointer"
            title="Besturing & Xbox Controller"
          >
            <HelpCircle className="w-4 h-4 text-yellow-400" />
          </button>

          {/* History Modal */}
          <button
            type="button"
            onClick={() => setShowHistoryModal(true)}
            className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-mono border border-neutral-700 transition cursor-pointer"
            title="Historisch Dossier (1986)"
          >
            <BookOpen className="w-4 h-4 text-amber-400" />
          </button>

          {/* Hall of Fame */}
          <button
            type="button"
            onClick={() => setShowHighScoresModal(true)}
            className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-mono border border-neutral-700 transition cursor-pointer"
            title="Hall of Fame"
          >
            <Trophy className="w-4 h-4 text-yellow-400" />
          </button>

          {/* CRT Scanline */}
          <button
            type="button"
            onClick={() => setEnableCRT(!enableCRT)}
            className={`p-2 rounded-xl text-xs font-mono border transition cursor-pointer ${
              enableCRT ? 'bg-cyan-950 text-cyan-300 border-cyan-700' : 'bg-neutral-800 text-neutral-400 border-neutral-700'
            }`}
            title="CRT Scanlines Filter"
          >
            <Tv className="w-4 h-4" />
          </button>

          {/* Sound */}
          <button
            type="button"
            onClick={() => {
              if (engineRef.current) {
                const s = engineRef.current.toggleSound();
                setSoundEnabled(s);
              }
            }}
            className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-mono border border-neutral-700 transition cursor-pointer"
            title="Geluid Aan/Uit"
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-rose-400" />
            )}
          </button>

          {/* Restart */}
          <button
            type="button"
            onClick={handleRestart}
            className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-mono border border-neutral-700 transition cursor-pointer"
            title="Herstarten"
          >
            <RotateCcw className="w-4 h-4 text-cyan-400" />
          </button>
        </div>
      </header>

      {/* Main CRT Canvas Frame */}
      <div className="relative w-full max-w-4xl flex flex-col items-center">
        <div className="relative w-full aspect-[320/200] max-h-[68vh] bg-black rounded-3xl border-4 border-neutral-800 shadow-[0_0_60px_rgba(6,182,212,0.25)] overflow-hidden flex items-center justify-center">
          <canvas
            ref={canvasRef}
            width={640}
            height={400}
            className="w-full h-full object-contain cursor-default"
          />

          {enableCRT && (
            <div
              className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)] opacity-80"
              style={{
                backgroundImage:
                  'repeating-linear-gradient(0deg, rgba(0,0,0,0.18) 0px, rgba(0,0,0,0.18) 1px, transparent 1px, transparent 2px)'
              }}
            />
          )}

          {/* Victory Overlay Screen */}
          {isVictorious && (
            <div className="absolute inset-0 bg-black/90 backdrop-blur flex flex-col items-center justify-center p-6 text-center z-30 animate-fade-in">
              <div className="w-16 h-16 rounded-full bg-cyan-500/20 border-2 border-cyan-400 flex items-center justify-center text-4xl mb-3 shadow-[0_0_30px_rgba(6,182,212,0.6)]">
                🛸
              </div>
              <h2 className="text-2xl sm:text-4xl font-black font-mono text-cyan-300 mb-2 tracking-wide">
                GALAXY SAVED, ROGER WILCO!
              </h2>
              <p className="text-xs sm:text-sm text-neutral-300 max-w-md font-sans mb-4">
                {lang === 'nl'
                  ? 'Gefeliciteerd! Je hebt de vernietiging van de Arcada overleefd, de geheime blauwdrukken gered en het monster Orat verpletterd! Op naar Ulence Flats!'
                  : 'Congratulations! You survived the destruction of the Arcada, secured the Star Generator plans, and vanquished the Orat! Off to Ulence Flats!'}
              </p>
              <div className="bg-neutral-900 border border-cyan-500/40 rounded-2xl p-4 max-w-sm w-full mb-4 shadow-xl">
                <div className="text-xs text-cyan-400 font-mono mb-1">EINDSCORE</div>
                <div className="text-3xl font-black font-mono text-yellow-400">
                  {score} / 185
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowHighScoresModal(true)}
                  className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-black font-bold font-mono text-xs transition cursor-pointer"
                >
                  Hall of Fame
                </button>
                <button
                  type="button"
                  onClick={handleRestart}
                  className="px-5 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold font-mono border border-neutral-700 transition cursor-pointer"
                >
                  Opnieuw Spelen
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Text Parser Input */}
        <form
          onSubmit={handleCommandSubmit}
          className="w-full mt-2 flex items-center gap-2 bg-neutral-900/90 border border-neutral-700 rounded-2xl p-2 shadow-md"
        >
          <div className="text-cyan-400 font-mono font-bold pl-2 text-sm sm:text-base">
            &gt;
          </div>
          <input
            ref={inputRef}
            type="text"
            value={currentInput}
            onChange={(e) => {
              setCurrentInput(e.target.value);
              if (engineRef.current) engineRef.current.currentInput = e.target.value;
            }}
            placeholder={
              lang === 'nl'
                ? 'Typ commando (bijv. "pak bezem", "doorzoek jerry", "stap in capsule", "help")...'
                : 'Type command (e.g. "take broom", "search jerry", "enter pod", "help")...'
            }
            className="flex-1 bg-transparent border-none outline-none font-mono text-xs sm:text-sm text-cyan-200 placeholder:text-neutral-500"
          />
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-neutral-950 font-bold font-mono text-xs cursor-pointer active:scale-95 transition flex items-center gap-1.5 shadow"
          >
            <span>ENTER</span>
            <Send className="w-3 h-3" />
          </button>
        </form>

        {/* Virtual Parser Ribbon & Contextual Suggestions */}
        <div className="w-full mt-2 flex flex-wrap items-center gap-1.5 p-2 bg-neutral-900/70 border border-neutral-800 rounded-2xl">
          <span className="text-[11px] font-mono text-cyan-400 font-bold uppercase tracking-wider mr-1">
            ⚡ Quick:
          </span>
          {getContextChips().map((chip, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => executeChipCommand(chip)}
              className="px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-cyan-950/80 hover:text-cyan-300 text-neutral-300 text-[11px] font-mono border border-neutral-700 transition cursor-pointer active:scale-95 shadow-sm"
            >
              {chip}
            </button>
          ))}
        </div>
      </div>

      {/* Bottom Inventory & Mobile Touch D-Pad */}
      <footer className="w-full max-w-5xl mt-3 flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-neutral-900/80 border border-neutral-800 rounded-2xl">
        {/* Roger's Janitor Pocket Inventory */}
        <div className="flex-1 w-full flex items-center gap-2 overflow-x-auto py-1">
          <span className="text-xs font-mono text-neutral-400 font-bold flex items-center gap-1">
            <span>🎒</span>
            <span className="hidden md:inline">ZAKKEN:</span>
          </span>
          {inventory.length === 0 ? (
            <span className="text-xs font-mono text-neutral-500 italic">
              {lang === 'nl' ? '(Lege zakken met wat stof)' : '(Pockets empty)'}
            </span>
          ) : (
            inventory.map((itemId) => {
              const item = SQ_INVENTORY_REGISTRY[itemId as keyof typeof SQ_INVENTORY_REGISTRY];
              return (
                <div
                  key={itemId}
                  className="px-2.5 py-1 rounded-xl bg-neutral-800 border border-neutral-700 flex items-center gap-1.5 text-xs font-mono text-neutral-200 shrink-0"
                  title={lang === 'nl' ? item?.descriptionNl : item?.description}
                >
                  <span>{item?.icon || '📦'}</span>
                  <span>{lang === 'nl' ? item?.nameNl : item?.name}</span>
                </div>
              );
            })
          )}
        </div>

        {/* Mobile D-Pad */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowTouchControls(!showTouchControls)}
            className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-400 text-xs font-mono border border-neutral-700 transition cursor-pointer"
            title="D-Pad Aan/Uit"
          >
            <Smartphone className="w-4 h-4 text-cyan-400" />
          </button>

          {showTouchControls && (
            <div className="grid grid-cols-3 gap-1 w-28 h-24">
              <div />
              <button
                type="button"
                onMouseDown={() => engineRef.current?.moveRoger('NORTH')}
                onMouseUp={() => engineRef.current?.stopRoger()}
                onTouchStart={() => engineRef.current?.moveRoger('NORTH')}
                onTouchEnd={() => engineRef.current?.stopRoger()}
                className="bg-neutral-800 border border-neutral-700 rounded-lg flex items-center justify-center text-neutral-200 active:bg-cyan-600 transition"
              >
                <ArrowUp className="w-4 h-4" />
              </button>
              <div />
              <button
                type="button"
                onMouseDown={() => engineRef.current?.moveRoger('WEST')}
                onMouseUp={() => engineRef.current?.stopRoger()}
                onTouchStart={() => engineRef.current?.moveRoger('WEST')}
                onTouchEnd={() => engineRef.current?.stopRoger()}
                className="bg-neutral-800 border border-neutral-700 rounded-lg flex items-center justify-center text-neutral-200 active:bg-cyan-600 transition"
              >
                <ArrowLeftIcon className="w-4 h-4" />
              </button>
              <div className="flex items-center justify-center text-[10px] font-mono text-neutral-600">
                MOVE
              </div>
              <button
                type="button"
                onMouseDown={() => engineRef.current?.moveRoger('EAST')}
                onMouseUp={() => engineRef.current?.stopRoger()}
                onTouchStart={() => engineRef.current?.moveRoger('EAST')}
                onTouchEnd={() => engineRef.current?.stopRoger()}
                className="bg-neutral-800 border border-neutral-700 rounded-lg flex items-center justify-center text-neutral-200 active:bg-cyan-600 transition"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
              <div />
              <button
                type="button"
                onMouseDown={() => engineRef.current?.moveRoger('SOUTH')}
                onMouseUp={() => engineRef.current?.stopRoger()}
                onTouchStart={() => engineRef.current?.moveRoger('SOUTH')}
                onTouchEnd={() => engineRef.current?.stopRoger()}
                className="bg-neutral-800 border border-neutral-700 rounded-lg flex items-center justify-center text-neutral-200 active:bg-cyan-600 transition"
              >
                <ArrowDown className="w-4 h-4" />
              </button>
              <div />
            </div>
          )}
        </div>
      </footer>

      {/* History Modal */}
      <SpaceQuestHistoryModal
        isOpen={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
        lang={lang}
      />

      {/* Game Controls & Xbox Modal */}
      <GameControlsModal
        isOpen={showControls}
        onClose={() => setShowControls(false)}
        gameId="space_quest"
      />

      {/* High Scores Modal */}
      {showHighScoresModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-neutral-900 border-2 border-yellow-500/40 rounded-3xl p-6 shadow-2xl font-mono text-neutral-100">
            <h3 className="text-xl font-black text-yellow-400 flex items-center gap-2 mb-4">
              <Trophy className="w-6 h-6 text-yellow-400" />
              <span>SPACE QUEST HALL OF FAME</span>
            </h3>

            {!hasSubmittedScore && (
              <form onSubmit={handleSubmitScore} className="mb-4 bg-neutral-800 p-3 rounded-xl border border-neutral-700">
                <div className="text-xs text-neutral-300 mb-2">
                  Je huidige score is <strong className="text-yellow-400">{score}</strong>. Vul je initialen in (max 3 letters):
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    maxLength={3}
                    value={initials}
                    onChange={(e) => setInitials(e.target.value.toUpperCase())}
                    placeholder="ROG"
                    className="flex-1 bg-neutral-900 border border-neutral-600 rounded-lg px-3 py-1.5 text-center font-bold text-yellow-300 uppercase tracking-widest outline-none"
                  />
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-yellow-600 hover:bg-yellow-500 text-black font-bold rounded-lg cursor-pointer"
                  >
                    Opslaan
                  </button>
                </div>
              </form>
            )}

            <div className="space-y-2 mb-4 max-h-60 overflow-y-auto">
              {highScores.map((hs, idx) => (
                <div
                  key={hs.id}
                  className="flex items-center justify-between px-3 py-2 rounded-xl bg-neutral-800/80 border border-neutral-700/60 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-neutral-400 w-5">{idx + 1}.</span>
                    <span className="font-bold text-yellow-300 tracking-wider">{hs.initials}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-neutral-400 text-[10px]">{hs.date}</span>
                    <span className="font-bold text-emerald-400">{hs.score} PTS</span>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setShowHighScoresModal(false)}
              className="w-full py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-xl font-bold text-xs cursor-pointer"
            >
              Sluiten
            </button>
          </div>
        </div>
      )}

      {/* Save / Load Virtual Floppy Disk Modal */}
      {showSaveLoadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-neutral-900 border-2 border-cyan-500/40 rounded-3xl p-6 shadow-2xl font-mono text-neutral-100">
            <h3 className="text-lg font-black text-cyan-400 flex items-center gap-2 mb-4">
              <Disc className="w-5 h-5 text-cyan-400" />
              <span>3.5" DISKETTE OPSLAG SLOTS</span>
            </h3>

            <div className="flex gap-2 mb-4">
              <button
                type="button"
                onClick={() => setSaveSlotMode('save')}
                className={`flex-1 py-1.5 rounded-xl font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1.5 ${
                  saveSlotMode === 'save'
                    ? 'bg-cyan-600 text-black'
                    : 'bg-neutral-800 text-neutral-400 hover:text-white'
                }`}
              >
                <Save className="w-3.5 h-3.5" />
                <span>Opslaan (Save)</span>
              </button>
              <button
                type="button"
                onClick={() => setSaveSlotMode('load')}
                className={`flex-1 py-1.5 rounded-xl font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1.5 ${
                  saveSlotMode === 'load'
                    ? 'bg-cyan-600 text-black'
                    : 'bg-neutral-800 text-neutral-400 hover:text-white'
                }`}
              >
                <FolderOpen className="w-3.5 h-3.5" />
                <span>Laden (Restore)</span>
              </button>
            </div>

            <div className="space-y-3 mb-4">
              {[1, 2, 3].map((slot) => {
                const data = savedSlots[slot];
                return (
                  <div
                    key={slot}
                    className="flex items-center justify-between p-3 rounded-2xl bg-neutral-800/90 border border-neutral-700"
                  >
                    <div>
                      <div className="text-xs font-bold text-neutral-200">
                        Disk Track Slot #{slot}
                      </div>
                      <div className="text-[10px] text-neutral-400">
                        {data ? `${data.timestamp} • Score: ${data.score}` : '(Leeg slot)'}
                      </div>
                    </div>
                    {saveSlotMode === 'save' ? (
                      <button
                        type="button"
                        onClick={() => handleSaveSlot(slot)}
                        className="px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-black font-bold text-xs cursor-pointer"
                      >
                        Overschrijven
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleLoadSlot(slot)}
                        disabled={!data}
                        className={`px-3 py-1.5 rounded-xl font-bold text-xs ${
                          data
                            ? 'bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer'
                            : 'bg-neutral-700 text-neutral-500 cursor-not-allowed'
                        }`}
                      >
                        Laden
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => setShowSaveLoadModal(false)}
              className="w-full py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-xl font-bold text-xs cursor-pointer"
            >
              Annuleren
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
