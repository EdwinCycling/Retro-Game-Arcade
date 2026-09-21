/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * King's Quest I: Quest for the Crown (1984, IBM PC / PCjr / Sierra On-Line)
 * Interactive Cabinet & Command Terminal Component
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
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
  Crown,
  Sparkles,
  HelpCircle
} from 'lucide-react';
import { KingsQuestEngine } from '../game/kingsQuestEngine';
import { kingsQuestRenderer } from '../game/kingsQuestRenderer';
import { INVENTORY_REGISTRY } from '../game/kingsQuestRooms';
import { getKingsQuestHighScores, saveKingsQuestHighScore, listSavedGames } from '../game/kingsQuestHighScores';
import { KingsQuestHistoryModal } from './KingsQuestHistoryModal';
import { GameControlsModal, useGameControls } from './GameControlsModal';

interface KingsQuestCabinetProps {
  onBackToLobby: () => void;
}

export const KingsQuestCabinet: React.FC<KingsQuestCabinetProps> = ({ onBackToLobby }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const engineRef = useRef<KingsQuestEngine | null>(null);

  // Synced reactive state
  const [score, setScore] = useState(0);
  const [currentRoom, setCurrentRoom] = useState('CASTLE_GATES');
  const [inventory, setInventory] = useState<string[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [enableCRT, setEnableCRT] = useState(true);
  const [colorMode, setColorMode] = useState<'PCJR' | 'CGA' | 'AMBER' | 'GREEN'>('PCJR');
  const [lang, setLang] = useState<'nl' | 'en'>('nl');
  const [currentInput, setCurrentInput] = useState('');
  const [messageLog, setMessageLog] = useState<{ text: string; isPlayer?: boolean; isSystem?: boolean }[]>([]);
  const [isVictorious, setIsVictorious] = useState(false);

  // Modals & Trays
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const { showControls, setShowControls } = useGameControls('kings_quest');
  const [showHighScoresModal, setShowHighScoresModal] = useState(false);
  const [showSaveLoadModal, setShowSaveLoadModal] = useState(false);
  const [saveSlotMode, setSaveSlotMode] = useState<'save' | 'load'>('save');
  const [savedSlots, setSavedSlots] = useState(listSavedGames());
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
    return getKingsQuestHighScores();
  }

  // Initialize Engine
  useEffect(() => {
    const engine = new KingsQuestEngine();
    engine.setLang(lang);
    engineRef.current = engine;

    const syncState = () => {
      setScore(engine.score);
      setCurrentRoom(engine.currentRoom);
      setInventory([...engine.inventory]);
      setSoundEnabled(engine.soundEnabled);
      setMessageLog([...engine.messageLog]);
      setIsVictorious(engine.graham.isVictorious);
    };

    const unsubscribe = engine.subscribe(syncState);
    syncState();

    let animId: number;
    const renderLoop = () => {
      const canvas = canvasRef.current;
      if (canvas && engineRef.current) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          kingsQuestRenderer.setColorMode(colorMode);
          kingsQuestRenderer.setHasAllTreasures(engineRef.current.hasAllTreasures());
          kingsQuestRenderer.render(
            ctx,
            canvas.width,
            canvas.height,
            engineRef.current.currentRoom,
            engineRef.current.graham,
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
  }, [colorMode]);

  const cycleColorMode = () => {
    if (colorMode === 'PCJR') setColorMode('CGA');
    else if (colorMode === 'CGA') setColorMode('AMBER');
    else if (colorMode === 'AMBER') setColorMode('GREEN');
    else setColorMode('PCJR');
  };

  // Keyboard navigation & Parser Input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const engine = engineRef.current;
      if (!engine) return;

      // Don't intercept if user is typing initials into modal
      if (showHighScoresModal || showSaveLoadModal) return;

      // Arrow keys / WASD move Graham
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        if (document.activeElement !== inputRef.current) {
          e.preventDefault();
          engine.moveGraham('NORTH');
        }
      } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        if (document.activeElement !== inputRef.current) {
          e.preventDefault();
          engine.moveGraham('SOUTH');
        }
      } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        if (document.activeElement !== inputRef.current) {
          e.preventDefault();
          engine.moveGraham('WEST');
        }
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        if (document.activeElement !== inputRef.current) {
          e.preventDefault();
          engine.moveGraham('EAST');
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const engine = engineRef.current;
      if (!engine) return;
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'a', 's', 'd', 'W', 'A', 'S', 'D'].includes(e.key)) {
        if (document.activeElement !== inputRef.current) {
          engine.stopGraham();
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

  const handleCommandSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const engine = engineRef.current;
    if (!engine || !currentInput.trim()) return;

    engine.submitInput(currentInput);
    setCurrentInput('');
    engine.currentInput = '';
    inputRef.current?.focus();
  };

  const handleQuickCommand = (cmd: string) => {
    const engine = engineRef.current;
    if (!engine) return;
    engine.submitInput(cmd);
  };

  const toggleLanguage = () => {
    const newLang = lang === 'nl' ? 'en' : 'nl';
    setLang(newLang);
    engineRef.current?.setLang(newLang);
  };

  const handleRestart = () => {
    engineRef.current?.resetGame();
    setHasSubmittedScore(false);
  };

  const handleDpadPress = (dir: 'NORTH' | 'SOUTH' | 'EAST' | 'WEST') => {
    engineRef.current?.moveGraham(dir, 12);
    setTimeout(() => {
      engineRef.current?.stopGraham();
    }, 150);
  };

  const handleSaveSlot = (slotIdx: number) => {
    const engine = engineRef.current;
    if (!engine) return;
    const slotName = prompt(
      lang === 'nl' ? 'Geef een naam voor deze opslagplek:' : 'Enter a name for this save slot:',
      `Daventry Slot ${slotIdx + 1}`
    );
    if (slotName) {
      engine.saveToSlot(slotIdx, slotName);
      setSavedSlots(listSavedGames());
      setShowSaveLoadModal(false);
    }
  };

  const handleLoadSlot = (slotIdx: number) => {
    const engine = engineRef.current;
    if (!engine) return;
    engine.loadFromSlot(slotIdx);
    setShowSaveLoadModal(false);
  };

  const handleSubmitScore = (e: React.FormEvent) => {
    e.preventDefault();
    if (!initials.trim()) return;
    const updated = saveKingsQuestHighScore(initials, score);
    setHighScores(updated);
    setHasSubmittedScore(true);
  };

  return (
    <div className="relative min-h-screen bg-neutral-950 text-neutral-100 flex flex-col items-center justify-between p-2 sm:p-4 select-none overflow-x-hidden font-sans">
      {/* Top Retro IBM PC / Sierra Navigation Bar */}
      <header className="w-full max-w-5xl flex items-center justify-between py-2 sm:py-3 px-3 sm:px-5 bg-neutral-900/90 border border-neutral-800 rounded-2xl backdrop-blur mb-2 shadow-lg">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBackToLobby}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs sm:text-sm font-semibold transition border border-neutral-700 cursor-pointer active:scale-95"
            title="Terug naar Arcade Lobby"
          >
            <ArrowLeft className="w-4 h-4 text-cyan-400" />
            <span className="hidden sm:inline">Arcade Lobby</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="text-xl">👑</span>
            <div className="hidden sm:block">
              <h1 className="text-sm font-black font-serif text-amber-300 tracking-wide flex items-center gap-2">
                <span>KING’S QUEST I</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">
                  IBM PC / PCjr 1984
                </span>
              </h1>
            </div>
          </div>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Language switcher */}
          <button
            type="button"
            onClick={toggleLanguage}
            className="px-2.5 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-mono border border-neutral-700 transition cursor-pointer flex items-center gap-1.5"
            title="Verander taal / Change language"
          >
            <Languages className="w-3.5 h-3.5 text-amber-400" />
            <span className="uppercase font-bold">{lang}</span>
          </button>

          {/* Save / Restore Floppy Disk */}
          <button
            type="button"
            onClick={() => {
              setSaveSlotMode('save');
              setSavedSlots(listSavedGames());
              setShowSaveLoadModal(true);
            }}
            className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-mono border border-neutral-700 transition cursor-pointer active:scale-95"
            title="Spel Opslaan / Laden (Diskette)"
          >
            <Disc className="w-4 h-4 text-blue-400" />
          </button>

          {/* Besturing & Xbox Controller */}
          <button
            type="button"
            onClick={() => setShowControls(true)}
            className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-yellow-400 text-xs font-mono border border-neutral-700 transition cursor-pointer active:scale-95"
            title="Besturing & Xbox Controller"
          >
            <HelpCircle className="w-4 h-4 text-yellow-400" />
          </button>

          {/* Historical Dossier */}
          <button
            type="button"
            onClick={() => setShowHistoryModal(true)}
            className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-mono border border-neutral-700 transition cursor-pointer active:scale-95"
            title="Historisch Dossier (1984)"
          >
            <BookOpen className="w-4 h-4 text-amber-400" />
          </button>

          {/* Hall of Fame High Scores */}
          <button
            type="button"
            onClick={() => setShowHighScoresModal(true)}
            className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-mono border border-neutral-700 transition cursor-pointer active:scale-95"
            title="Hall of Fame"
          >
            <Trophy className="w-4 h-4 text-yellow-400" />
          </button>

          {/* CRT Color Mode Switcher */}
          <button
            type="button"
            onClick={cycleColorMode}
            className="px-2.5 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-mono border border-neutral-700 transition cursor-pointer flex items-center gap-1 text-amber-300 active:scale-95"
            title="Kleurmodus wisselen (PCjr 16 / CGA 4 / Amber / Groen)"
          >
            <Tv className="w-3.5 h-3.5" />
            <span className="font-bold">{colorMode}</span>
          </button>

          {/* CRT Scanline toggle */}
          <button
            type="button"
            onClick={() => setEnableCRT(!enableCRT)}
            className={`p-2 rounded-xl text-xs font-mono border transition cursor-pointer active:scale-95 ${
              enableCRT
                ? 'bg-cyan-950 text-cyan-300 border-cyan-700'
                : 'bg-neutral-800 text-neutral-400 border-neutral-700'
            }`}
            title="CRT Scanlines Filter"
          >
            <Tv className="w-4 h-4" />
          </button>

          {/* Sound toggle */}
          <button
            type="button"
            onClick={() => {
              if (engineRef.current) {
                const s = engineRef.current.toggleSound();
                setSoundEnabled(s);
              }
            }}
            className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-mono border border-neutral-700 transition cursor-pointer active:scale-95"
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
            className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-mono border border-neutral-700 transition cursor-pointer active:scale-95"
            title="Herstarten"
          >
            <RotateCcw className="w-4 h-4 text-cyan-400" />
          </button>
        </div>
      </header>

      {/* Main IBM Color Display 5153 Housing */}
      <div className="relative w-full max-w-4xl flex flex-col items-center">
        <div className="relative w-full aspect-[320/200] max-h-[68vh] bg-black rounded-3xl border-4 border-neutral-800 shadow-[0_0_60px_rgba(59,130,246,0.25)] overflow-hidden flex items-center justify-center">
          <canvas
            ref={canvasRef}
            width={640}
            height={400}
            className="w-full h-full object-contain cursor-default"
          />

          {/* Optional CRT Scanline Overlay */}
          {enableCRT && (
            <div
              className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)] opacity-80"
              style={{
                backgroundImage: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.18) 0px, rgba(0,0,0,0.18) 1px, transparent 1px, transparent 2px)'
              }}
            />
          )}

          {/* Victory Overlay Screen */}
          {isVictorious && (
            <div className="absolute inset-0 bg-black/90 backdrop-blur flex flex-col items-center justify-center p-6 text-center z-30 animate-fade-in">
              <div className="w-16 h-16 rounded-full bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center text-4xl mb-3 shadow-[0_0_30px_rgba(245,158,11,0.6)]">
                👑
              </div>
              <h2 className="text-2xl sm:text-4xl font-black font-serif text-amber-300 mb-2 tracking-wide">
                HAIL KING GRAHAM OF DAVENTRY!
              </h2>
              <p className="text-xs sm:text-sm text-neutral-300 max-w-md font-sans mb-4">
                {lang === 'nl'
                  ? 'Gefeliciteerd! Met de Magische Spiegel, het Magische Schild en de Schatkist heb je het koninkrijk Daventry gered van verval en ben je gekroond tot de nieuwe vorst!'
                  : 'Congratulations! With the Magic Mirror, Shield, and Chest, you have rescued the realm of Daventry and ascended to the royal throne!'}
              </p>
              <div className="bg-neutral-900 border border-amber-500/40 rounded-2xl p-4 max-w-sm w-full mb-4 shadow-xl">
                <div className="text-xs text-amber-400 font-mono mb-1">EINDSCORE</div>
                <div className="text-3xl font-black font-mono text-yellow-400">
                  {score} / 158
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowHighScoresModal(true)}
                  className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition cursor-pointer"
                >
                  Hall of Fame
                </button>
                <button
                  type="button"
                  onClick={handleRestart}
                  className="px-5 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold border border-neutral-700 transition cursor-pointer"
                >
                  Opnieuw Spelen
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Vintage Text Parser Command Input Strip */}
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
                ? 'Typ commando (bijv. "kijk rond", "pak wortel", "klim in boom", "help")...'
                : 'Type command (e.g. "look around", "take carrot", "climb tree", "help")...'
            }
            className="flex-1 bg-transparent border-none outline-none font-mono text-xs sm:text-sm text-amber-200 placeholder:text-neutral-500"
          />
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-neutral-950 font-bold font-mono text-xs cursor-pointer active:scale-95 transition flex items-center gap-1.5 shadow"
          >
            <span>ENTER</span>
            <Send className="w-3 h-3" />
          </button>
        </form>

        {/* Quick Action Suggestion Pills */}
        <div className="w-full flex items-center gap-1.5 overflow-x-auto py-2 text-[11px] font-mono scrollbar-none">
          <span className="text-neutral-400 px-1 whitespace-nowrap">Snelle commando’s:</span>
          {[
            { label: lang === 'nl' ? 'Kijk rond' : 'Look', cmd: 'look' },
            { label: lang === 'nl' ? 'Inventaris' : 'Inventory', cmd: 'inventory' },
            { label: lang === 'nl' ? 'Pak wortel' : 'Take carrot', cmd: 'take carrot' },
            { label: lang === 'nl' ? 'Klavertje vier' : 'Take clover', cmd: 'take clover' },
            { label: lang === 'nl' ? 'Walnoot openen' : 'Crack walnut', cmd: 'open walnut' },
            { label: lang === 'nl' ? 'Klim in boom' : 'Climb tree', cmd: 'climb tree' },
            { label: lang === 'nl' ? 'Voer bok' : 'Feed goat', cmd: 'give carrot' },
            { label: lang === 'nl' ? 'Kabouter: IFNKOVHGROGH' : 'Gnome: IFNKOVHGROGH', cmd: 'ifnkovhgrogh' },
            { label: lang === 'nl' ? 'Plant bonen' : 'Plant beans', cmd: 'plant beans' },
            { label: lang === 'nl' ? 'Duw heks' : 'Push witch', cmd: 'push witch' },
            { label: lang === 'nl' ? 'Speel viool' : 'Play fiddle', cmd: 'play fiddle' },
            { label: lang === 'nl' ? 'Draak blussen' : 'Throw water', cmd: 'throw water' },
            { label: lang === 'nl' ? 'Schiet reus' : 'Shoot giant', cmd: 'shoot giant' },
            { label: lang === 'nl' ? 'Hulp / Help' : 'Help', cmd: 'help' }
          ].map((pill, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleQuickCommand(pill.cmd)}
              className="px-2.5 py-1 rounded-lg bg-neutral-800/80 hover:bg-neutral-700 text-neutral-300 border border-neutral-700/80 whitespace-nowrap cursor-pointer active:scale-95 transition"
            >
              {pill.label}
            </button>
          ))}
        </div>

        {/* Sir Graham's Backpack & Relics Tray */}
        <div className="w-full mt-2 p-3 rounded-2xl bg-neutral-900/80 border border-neutral-800 flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs text-neutral-400 font-mono">
            <div className="flex items-center gap-2">
              <span className="font-bold text-amber-300">RUGZAK VAN SIR GRAHAM</span>
              <span>({inventory.length} voorwerpen)</span>
            </div>
            <div className="text-neutral-400">
              Score: <strong className="text-yellow-400">{score}</strong> / 158
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {inventory.length === 0 ? (
              <span className="text-xs text-neutral-500 italic py-1">
                {lang === 'nl'
                  ? 'Je draagt momenteel nog geen voorwerpen bij je. Zoek in Daventry naar wortels, eieren, walnoten en schatten!'
                  : 'Your inventory is currently empty. Explore Daventry to collect treasures!'}
              </span>
            ) : (
              inventory.map((itemId) => {
                const itemDef = INVENTORY_REGISTRY[itemId as keyof typeof INVENTORY_REGISTRY];
                const isRelic = itemId.startsWith('MAGIC_');
                return (
                  <div
                    key={itemId}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-mono transition ${
                      isRelic
                        ? 'bg-amber-950/60 border-amber-500/80 text-amber-200 shadow-[0_0_10px_rgba(245,158,11,0.3)]'
                        : 'bg-neutral-800/80 border-neutral-700 text-neutral-200'
                    }`}
                    title={itemDef ? (lang === 'nl' ? itemDef.descriptionNl : itemDef.description) : itemId}
                  >
                    <span>{itemDef?.icon || '📦'}</span>
                    <span>{itemDef ? (lang === 'nl' ? itemDef.nameNl : itemDef.name) : itemId}</span>
                    {isRelic && <Sparkles className="w-3 h-3 text-amber-400 ml-0.5" />}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Virtual Touch D-Pad for Mobile Users */}
        {showTouchControls && (
          <div className="w-full mt-3 flex items-center justify-center gap-6 p-3 rounded-2xl bg-neutral-900/60 border border-neutral-800">
            <div className="relative w-36 h-36 grid grid-cols-3 grid-rows-3 gap-1">
              <div />
              <button
                type="button"
                onClick={() => handleDpadPress('NORTH')}
                className="rounded-xl bg-neutral-800 active:bg-amber-600 text-white flex items-center justify-center shadow cursor-pointer"
              >
                <ArrowUp className="w-5 h-5" />
              </button>
              <div />

              <button
                type="button"
                onClick={() => handleDpadPress('WEST')}
                className="rounded-xl bg-neutral-800 active:bg-amber-600 text-white flex items-center justify-center shadow cursor-pointer"
              >
                <ArrowLeftIcon className="w-5 h-5" />
              </button>
              <div className="rounded-xl bg-neutral-950 flex items-center justify-center text-[10px] font-mono text-neutral-600">
                PAD
              </div>
              <button
                type="button"
                onClick={() => handleDpadPress('EAST')}
                className="rounded-xl bg-neutral-800 active:bg-amber-600 text-white flex items-center justify-center shadow cursor-pointer"
              >
                <ArrowRight className="w-5 h-5" />
              </button>

              <div />
              <button
                type="button"
                onClick={() => handleDpadPress('SOUTH')}
                className="rounded-xl bg-neutral-800 active:bg-amber-600 text-white flex items-center justify-center shadow cursor-pointer"
              >
                <ArrowDown className="w-5 h-5" />
              </button>
              <div />
            </div>

            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => handleQuickCommand('look')}
                className="px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-mono font-bold text-neutral-200 border border-neutral-700"
              >
                KIJK
              </button>
              <button
                type="button"
                onClick={() => handleQuickCommand('inventory')}
                className="px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-mono font-bold text-neutral-200 border border-neutral-700"
              >
                SPULLEN
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Save & Load Diskette Modal */}
      {showSaveLoadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-neutral-900 border-2 border-blue-500/70 rounded-2xl p-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800 mb-4">
              <h3 className="font-bold text-white flex items-center gap-2">
                <Disc className="w-5 h-5 text-blue-400" />
                <span>IBM 5.25" Diskette Station (Drive A:)</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowSaveLoadModal(false)}
                className="text-neutral-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-neutral-300 font-mono mb-4">
              {lang === 'nl'
                ? 'Kies een opslagslot om de staat van Sir Graham op te slaan of terug te laden:'
                : 'Choose a slot to save or restore your Daventry quest:'}
            </p>

            <div className="space-y-2">
              {savedSlots.map((slot, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center justify-between"
                >
                  <div>
                    <div className="font-bold font-mono text-xs text-blue-300">
                      Slot {idx + 1}: {slot ? slot.name : '(Leeg / Empty)'}
                    </div>
                    {slot && (
                      <div className="text-[11px] text-neutral-400 font-mono">
                        Score: {slot.score} • {slot.date}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleSaveSlot(idx)}
                      className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs font-bold text-amber-300 border border-neutral-700 cursor-pointer"
                    >
                      Opslaan
                    </button>
                    {slot && (
                      <button
                        type="button"
                        onClick={() => handleLoadSlot(idx)}
                        className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white cursor-pointer"
                      >
                        Laden
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-3 border-t border-neutral-800 flex justify-end">
              <button
                type="button"
                onClick={() => setShowSaveLoadModal(false)}
                className="px-4 py-2 rounded-xl bg-neutral-800 text-xs font-bold text-neutral-300"
              >
                Sluiten
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hall of Fame High Scores Modal */}
      {showHighScoresModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-neutral-900 border-2 border-yellow-500/70 rounded-2xl p-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800 mb-4">
              <h3 className="font-bold text-yellow-400 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-400" />
                <span>Champions of Daventry (Hall of Fame)</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowHighScoresModal(false)}
                className="text-neutral-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-1.5 max-h-60 overflow-y-auto mb-4 font-mono text-xs">
              {highScores.map((entry, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 rounded-lg bg-neutral-950 border border-neutral-800"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-neutral-500 w-4">{idx + 1}.</span>
                    <span className="font-bold text-yellow-300">{entry.initials}</span>
                    <span className="text-neutral-400 text-[10px]">({entry.rankTitle})</span>
                  </div>
                  <div className="font-bold text-white">
                    {entry.score} pts
                  </div>
                </div>
              ))}
            </div>

            {/* Score submission form */}
            {!hasSubmittedScore && score > 0 && (
              <form onSubmit={handleSubmitScore} className="mt-4 pt-3 border-t border-neutral-800 flex gap-2">
                <input
                  type="text"
                  maxLength={3}
                  value={initials}
                  onChange={(e) => setInitials(e.target.value.toUpperCase())}
                  placeholder="GRH"
                  className="w-20 px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-700 text-center font-black font-mono text-yellow-300 focus:outline-none focus:border-yellow-500 text-sm"
                />
                <button
                  type="submit"
                  disabled={!initials.trim()}
                  className="flex-1 py-2 px-3 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-black font-bold font-mono text-xs cursor-pointer disabled:opacity-40"
                >
                  Sla mijn score op ({score} pts)
                </button>
              </form>
            )}

            <div className="mt-4 pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setShowHighScoresModal(false)}
                className="px-4 py-2 rounded-xl bg-neutral-800 text-xs font-bold text-neutral-300"
              >
                Sluiten
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Historical Dossier Modal */}
      <KingsQuestHistoryModal
        isOpen={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
      />

      {/* Game Controls & Xbox Modal */}
      <GameControlsModal
        isOpen={showControls}
        onClose={() => setShowControls(false)}
        gameId="kings_quest"
      />
    </div>
  );
};
