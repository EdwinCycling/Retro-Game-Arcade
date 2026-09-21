/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Game Boy Advance SP (AGS-001 / AGS-101) Foldable Clamshell Interactive Console
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  GbaCartridgeId,
  GbaShellColor,
  GbaScreenMode,
  GBA_CARTRIDGES,
  GBA_SHELL_COLORS
} from '../game/gbaTypes';
import { GbaPokemonEngine } from '../game/gbaPokemonEngine';
import { GbaMarioEngine } from '../game/gbaMarioEngine';
import { GbaZeldaEngine } from '../game/gbaZeldaEngine';
import { gbaAudio } from '../game/gbaAudio';
import {
  getPokemonScores,
  getMarioAdvanceScores,
  getZeldaScores,
  GbaScoreEntry
} from '../game/gbaHighScores';
import { GbaHistoryModal } from './GbaHistoryModal';
import {
  Volume2,
  VolumeX,
  Sparkles,
  Sun,
  Maximize2,
  BookOpen,
  ArrowLeft,
  Trophy,
  Disc,
  RotateCcw
} from 'lucide-react';

interface GbaSpCabinetProps {
  initialGame?: GbaCartridgeId;
  onExit?: () => void;
  onBackToLobby?: () => void;
  lang?: 'nl' | 'en';
}

export const GbaSpCabinet: React.FC<GbaSpCabinetProps> = ({
  initialGame = 'pokemon_emerald',
  onExit,
  onBackToLobby,
  lang = 'nl'
}) => {
  const handleExit = onExit || onBackToLobby || (() => {});
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const pokemonEngineRef = useRef<GbaPokemonEngine | null>(null);
  const marioEngineRef = useRef<GbaMarioEngine | null>(null);
  const zeldaEngineRef = useRef<GbaZeldaEngine | null>(null);

  // Shell & Screen Settings
  const [selectedGame, setSelectedGame] = useState<GbaCartridgeId>(initialGame);
  const [shellColor, setShellColor] = useState<GbaShellColor>('cobalt_blue');
  const [screenMode, setScreenMode] = useState<GbaScreenMode>('ags101_bright');
  const [isBacklitOn, setIsBacklitOn] = useState<boolean>(true);
  const [hingeAngle, setHingeAngle] = useState<'open' | 'half' | 'closed'>('open');
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(0.7);

  // Modals & Overlays
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [isHighScoreOpen, setIsHighScoreOpen] = useState<boolean>(false);
  const [scores, setScores] = useState<GbaScoreEntry[]>([]);
  const [isCartridgeMenuOpen, setIsCartridgeMenuOpen] = useState<boolean>(false);
  const [booting, setBooting] = useState<boolean>(false);

  // Active key state for UI visual feedback
  const [activeKeys, setActiveKeys] = useState<{ [key: string]: boolean }>({});

  const activeShell = GBA_SHELL_COLORS[shellColor];
  const activeCartridge = GBA_CARTRIDGES[selectedGame];

  // Load scores whenever game changes
  useEffect(() => {
    if (selectedGame === 'pokemon_emerald') setScores(getPokemonScores());
    else if (selectedGame === 'mario_advance') setScores(getMarioAdvanceScores());
    else if (selectedGame === 'zelda_minish') setScores(getZeldaScores());
  }, [selectedGame]);

  // Handle Mute & Volume
  useEffect(() => {
    gbaAudio.setMuted(isMuted);
    gbaAudio.setVolume(volume);
  }, [isMuted, volume]);

  // Initialize selected engine on canvas
  const initGameEngine = useCallback((gameId: GbaCartridgeId) => {
    if (!canvasRef.current) return;

    // Clean up previous engines
    pokemonEngineRef.current?.destroy();
    marioEngineRef.current?.destroy();
    zeldaEngineRef.current?.destroy();
    pokemonEngineRef.current = null;
    marioEngineRef.current = null;
    zeldaEngineRef.current = null;

    setBooting(true);
    gbaAudio.playGbaBootChime();

    setTimeout(() => {
      setBooting(false);
      if (!canvasRef.current) return;

      if (gameId === 'pokemon_emerald') {
        const engine = new GbaPokemonEngine(canvasRef.current);
        engine.init();
        pokemonEngineRef.current = engine;
      } else if (gameId === 'mario_advance' || gameId === 'metroid_fusion' || gameId === 'mario_kart_gba') {
        const engine = new GbaMarioEngine(canvasRef.current);
        engine.init();
        marioEngineRef.current = engine;
      } else if (gameId === 'zelda_minish') {
        const engine = new GbaZeldaEngine(canvasRef.current);
        engine.init();
        zeldaEngineRef.current = engine;
      }
    }, 1200);
  }, []);

  useEffect(() => {
    initGameEngine(selectedGame);
    return () => {
      pokemonEngineRef.current?.destroy();
      marioEngineRef.current?.destroy();
      zeldaEngineRef.current?.destroy();
    };
  }, [selectedGame, initGameEngine]);

  // Dispatch inputs to active engine
  const sendInput = useCallback((input: { [key: string]: boolean }) => {
    pokemonEngineRef.current?.setInput(input);
    marioEngineRef.current?.setInput(input);
    zeldaEngineRef.current?.setInput(input);
  }, []);

  // Keyboard Event Handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      const code = e.code;
      const updated: { [key: string]: boolean } = {};

      if (code === 'ArrowUp' || k === 'w') updated.up = true;
      if (code === 'ArrowDown' || k === 's') updated.down = true;
      if (code === 'ArrowLeft' || k === 'a') updated.left = true;
      if (code === 'ArrowRight' || k === 'd') updated.right = true;
      if (k === 'z' || k === 'k' || code === 'Space') updated.a = true;
      if (k === 'x' || k === 'j') updated.b = true;
      if (code === 'Enter') updated.start = true;
      if (code === 'ShiftLeft' || code === 'ShiftRight') updated.select = true;
      if (k === 'q') updated.l = true;
      if (k === 'e') updated.r = true;

      if (Object.keys(updated).length > 0) {
        setActiveKeys(prev => ({ ...prev, ...updated }));
        sendInput(updated);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      const code = e.code;
      const updated: { [key: string]: boolean } = {};

      if (code === 'ArrowUp' || k === 'w') updated.up = false;
      if (code === 'ArrowDown' || k === 's') updated.down = false;
      if (code === 'ArrowLeft' || k === 'a') updated.left = false;
      if (code === 'ArrowRight' || k === 'd') updated.right = false;
      if (k === 'z' || k === 'k' || code === 'Space') updated.a = false;
      if (k === 'x' || k === 'j') updated.b = false;
      if (code === 'Enter') updated.start = false;
      if (code === 'ShiftLeft' || code === 'ShiftRight') updated.select = false;
      if (k === 'q') updated.l = false;
      if (k === 'e') updated.r = false;

      if (Object.keys(updated).length > 0) {
        setActiveKeys(prev => ({ ...prev, ...updated }));
        sendInput(updated);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [sendInput]);

  // Hinge toggle
  const toggleHinge = () => {
    gbaAudio.playHingeClick();
    if (hingeAngle === 'open') setHingeAngle('half');
    else if (hingeAngle === 'half') setHingeAngle('closed');
    else setHingeAngle('open');
  };

  // Switch Cartridge
  const switchCartridge = (id: GbaCartridgeId) => {
    if (id === selectedGame) return;
    gbaAudio.playHingeClick();
    setSelectedGame(id);
    setIsCartridgeMenuOpen(false);
  };

  return (
    <div className="relative min-h-screen w-full bg-slate-950 text-white flex flex-col items-center justify-between p-2 sm:p-4 select-none overflow-x-hidden">
      {/* Top Header Bar */}
      <header className="w-full max-w-5xl flex items-center justify-between bg-slate-900/90 border border-slate-800/80 backdrop-blur-md px-3.5 py-2 rounded-2xl shadow-xl z-20 mb-2">
        <div className="flex items-center space-x-3">
          <button
            onClick={handleExit}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl border border-slate-700/80 text-xs font-bold transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-sky-400" />
            <span>{lang === 'nl' ? 'Terug naar Lobby' : 'Back to Lobby'}</span>
          </button>

          <div className="h-4 w-px bg-slate-800 hidden sm:block" />

          <div className="flex items-center space-x-2">
            <span className="text-xl">📱</span>
            <div>
              <h1 className="text-xs sm:text-sm font-black tracking-wide text-white flex items-center space-x-1.5">
                <span>GAME BOY ADVANCE SP</span>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-400 border border-blue-400/30 font-mono">
                  32-BIT
                </span>
              </h1>
              <p className="text-[10px] text-slate-400 truncate max-w-[200px] sm:max-w-xs">
                {activeCartridge.title}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Toolbar Buttons */}
        <div className="flex items-center space-x-1.5">
          {/* Cartridge Changer */}
          <button
            onClick={() => setIsCartridgeMenuOpen(!isCartridgeMenuOpen)}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/50 text-emerald-300 rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer"
          >
            <Disc className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span>{lang === 'nl' ? 'Cartridges (5)' : 'Cartridges (5)'}</span>
          </button>

          {/* Hinge Fold Button */}
          <button
            onClick={toggleHinge}
            className="p-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-sky-400 rounded-xl transition-all cursor-pointer"
            title={hingeAngle === 'open' ? (lang === 'nl' ? 'Dichtklappen' : 'Fold') : (lang === 'nl' ? 'Openklappen' : 'Unfold')}
          >
            <Sparkles className="w-4 h-4" />
          </button>

          {/* History Modal */}
          <button
            onClick={() => setIsHistoryOpen(true)}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 rounded-xl transition-colors cursor-pointer"
            title="Dossier & Hardware Specs"
          >
            <BookOpen className="w-4 h-4" />
          </button>

          {/* High Scores */}
          <button
            onClick={() => setIsHighScoreOpen(!isHighScoreOpen)}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-yellow-400 border border-slate-700 rounded-xl transition-colors cursor-pointer"
            title="High Scores"
          >
            <Trophy className="w-4 h-4" />
          </button>

          {/* Sound Toggle */}
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-xl transition-colors cursor-pointer"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>
        </div>
      </header>

      {/* Cartridge Selection Drawer */}
      {isCartridgeMenuOpen && (
        <div className="w-full max-w-5xl bg-slate-900/95 border-2 border-emerald-500/50 rounded-2xl p-4 mb-2 shadow-2xl backdrop-blur-md z-30 animate-fadeIn">
          <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
            <div className="flex items-center space-x-2">
              <Disc className="w-5 h-5 text-emerald-400" />
              <h3 className="text-sm font-bold text-white">
                {lang === 'nl' ? 'GBA SP Cartridge Collectie (5 Klassiekers)' : 'GBA SP Cartridge Collection (5 Classics)'}
              </h3>
            </div>
            <button
              onClick={() => setIsCartridgeMenuOpen(false)}
              className="text-xs text-slate-400 hover:text-white cursor-pointer"
            >
              ✕ Sluiten
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {Object.values(GBA_CARTRIDGES).map(cart => {
              const isCurrent = cart.id === selectedGame;
              return (
                <button
                  key={cart.id}
                  onClick={() => switchCartridge(cart.id)}
                  className={`flex flex-col text-left p-3 rounded-xl border transition-all cursor-pointer ${
                    isCurrent
                      ? 'bg-emerald-950/80 border-emerald-400 shadow-lg ring-2 ring-emerald-500/30'
                      : 'bg-slate-800/60 hover:bg-slate-800 border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl">{cart.icon}</span>
                    <span
                      className="px-1.5 py-0.5 rounded text-[9px] font-bold text-white uppercase"
                      style={{ backgroundColor: cart.labelColor }}
                    >
                      {cart.year}
                    </span>
                  </div>
                  <div className="font-bold text-xs text-white truncate">{cart.title}</div>
                  <div className="text-[10px] text-slate-400 truncate">{cart.developer}</div>
                  <div className="mt-2 text-[9px] text-slate-300 line-clamp-2">
                    {lang === 'nl' ? cart.summary.nl : cart.summary.en}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Main GBA SP Physical Device Console */}
      <main className="relative flex-1 flex flex-col items-center justify-center w-full max-w-4xl perspective-[1200px] my-auto py-2">
        {/* Physical GBA SP Unit */}
        <div
          className="relative flex flex-col items-center rounded-3xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] border-4 transition-all duration-500 ease-out"
          style={{
            backgroundColor: activeShell.hex,
            borderColor: activeShell.border,
            width: 'min(92vw, 420px)'
          }}
        >
          {/* Top Shoulder Buttons (L and R) */}
          <div className="w-full flex items-center justify-between px-6 pt-2">
            <button
              onMouseDown={() => { sendInput({ l: true }); setActiveKeys(p => ({ ...p, l: true })); }}
              onMouseUp={() => { sendInput({ l: false }); setActiveKeys(p => ({ ...p, l: false })); }}
              onTouchStart={() => { sendInput({ l: true }); setActiveKeys(p => ({ ...p, l: true })); }}
              onTouchEnd={() => { sendInput({ l: false }); setActiveKeys(p => ({ ...p, l: false })); }}
              className={`px-4 py-1.5 rounded-t-xl text-[10px] font-black border-t-2 border-x-2 transition-all ${
                activeKeys.l
                  ? 'bg-slate-400 text-slate-900 border-slate-300 translate-y-0.5'
                  : 'bg-slate-300 hover:bg-slate-200 text-slate-800 border-slate-400 shadow-md'
              }`}
            >
              [L]
            </button>

            {/* Nintendo Logo on Top Outer Hinge */}
            <div className="flex items-center space-x-1.5 px-3 py-1 bg-black/20 rounded-full border border-white/10">
              <span className="text-[10px] font-black tracking-widest text-white/90">Nintendo</span>
              <span className="text-[9px] font-bold text-sky-300">GBA SP</span>
            </div>

            <button
              onMouseDown={() => { sendInput({ r: true }); setActiveKeys(p => ({ ...p, r: true })); }}
              onMouseUp={() => { sendInput({ r: false }); setActiveKeys(p => ({ ...p, r: false })); }}
              onTouchStart={() => { sendInput({ r: true }); setActiveKeys(p => ({ ...p, r: true })); }}
              onTouchEnd={() => { sendInput({ r: false }); setActiveKeys(p => ({ ...p, r: false })); }}
              className={`px-4 py-1.5 rounded-t-xl text-[10px] font-black border-t-2 border-x-2 transition-all ${
                activeKeys.r
                  ? 'bg-slate-400 text-slate-900 border-slate-300 translate-y-0.5'
                  : 'bg-slate-300 hover:bg-slate-200 text-slate-800 border-slate-400 shadow-md'
              }`}
            >
              [R]
            </button>
          </div>

          {/* UPPER CLAMSHELL SCREEN HOUSING (Foldable Hinge with 3D Transform) */}
          <div
            className="w-[94%] bg-slate-900/90 rounded-2xl p-3 border-2 border-black/40 shadow-inner flex flex-col items-center transition-all duration-500 origin-bottom"
            style={{
              transform:
                hingeAngle === 'open'
                  ? 'rotateX(0deg) scale(1)'
                  : hingeAngle === 'half'
                  ? 'rotateX(55deg) scale(0.95)'
                  : 'rotateX(90deg) scale(0.85) translateY(40px)',
              opacity: hingeAngle === 'closed' ? 0.2 : 1
            }}
          >
            {/* Upper Bezel Top Bar */}
            <div className="w-full flex items-center justify-between px-2 mb-1">
              {/* Power / Charge LED */}
              <div className="flex items-center space-x-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse" />
                <span className="text-[8px] font-bold text-slate-400">POWER</span>
              </div>

              {/* Game Boy Advance SP Screen Header */}
              <span className="text-[9px] font-black tracking-widest text-slate-300 uppercase">
                GAME BOY ADVANCE <span className="text-sky-400">SP</span>
              </span>

              {/* AGS-101 Brightness status */}
              <button
                onClick={() => setIsBacklitOn(!isBacklitOn)}
                className={`flex items-center space-x-1 px-1.5 py-0.5 rounded text-[8px] font-bold transition-all ${
                  isBacklitOn ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40' : 'bg-slate-800 text-slate-500'
                }`}
                title="Schakel Backlight (AGS-101)"
              >
                <Sun className="w-3 h-3" />
                <span>{isBacklitOn ? 'AGS-101' : 'AGS-001'}</span>
              </button>
            </div>

            {/* Screen Inner Frame & Display */}
            <div className="relative w-full aspect-[240/160] max-h-[220px] bg-black rounded-xl overflow-hidden border-4 border-slate-950 shadow-2xl flex items-center justify-center">
              {/* Booting Animation Overlay */}
              {booting && (
                <div className="absolute inset-0 bg-white flex flex-col items-center justify-center z-10 animate-fadeIn">
                  <div className="text-xl font-black tracking-widest text-blue-900">
                    Nintendo<span className="text-red-600">®</span>
                  </div>
                  <div className="text-[10px] font-bold tracking-widest text-slate-600 mt-2">
                    GAME BOY ADVANCE
                  </div>
                </div>
              )}

              {/* The Native 240x160 GBA Canvas */}
              <canvas
                ref={canvasRef}
                className="w-full h-full object-contain image-rendering-pixelated"
                style={{
                  filter: !isBacklitOn ? 'brightness(0.7) contrast(1.1)' : 'brightness(1.05) contrast(1.02)'
                }}
              />

              {/* Scanline Overlay */}
              {screenMode === 'crt_scanline' && (
                <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px]" />
              )}
              {/* Pixel Grid Overlay */}
              {screenMode === 'pixel_grid' && (
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(#000_1px,transparent_1px)] bg-[size:3px_3px] opacity-25" />
              )}
            </div>
          </div>

          {/* HINGE CYLINDER BAR */}
          <div className="w-[96%] h-6 bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 rounded-full my-2 border border-black/50 shadow-md flex items-center justify-between px-6">
            <div className="w-3 h-3 rounded-full bg-slate-950 border border-slate-600" />
            <span className="text-[8px] font-bold tracking-wider text-slate-400">CLAMSHELL HINGE</span>
            <div className="w-3 h-3 rounded-full bg-slate-950 border border-slate-600" />
          </div>

          {/* LOWER CONTROLLER HOUSING */}
          <div className="w-[94%] bg-slate-900/80 rounded-2xl p-4 border-2 border-black/40 shadow-inner flex flex-col justify-between mb-3">
            {/* Center Controls: D-Pad, Brightness Button, A & B */}
            <div className="flex items-center justify-between">
              {/* Cross D-Pad */}
              <div className="relative w-28 h-28 flex items-center justify-center">
                {/* D-Pad Base Circle */}
                <div className="absolute w-24 h-24 rounded-full bg-black/30 border border-white/5" />

                {/* UP */}
                <button
                  onMouseDown={() => { sendInput({ up: true }); setActiveKeys(p => ({ ...p, up: true })); }}
                  onMouseUp={() => { sendInput({ up: false }); setActiveKeys(p => ({ ...p, up: false })); }}
                  onTouchStart={() => { sendInput({ up: true }); setActiveKeys(p => ({ ...p, up: true })); }}
                  onTouchEnd={() => { sendInput({ up: false }); setActiveKeys(p => ({ ...p, up: false })); }}
                  className={`absolute top-0 w-8 h-10 rounded-t-lg bg-slate-800 border-t border-x border-slate-600 transition-all ${
                    activeKeys.up ? 'bg-slate-600 translate-y-0.5' : 'hover:bg-slate-700 shadow-md'
                  }`}
                >
                  <span className="text-[10px] text-slate-400">▲</span>
                </button>

                {/* DOWN */}
                <button
                  onMouseDown={() => { sendInput({ down: true }); setActiveKeys(p => ({ ...p, down: true })); }}
                  onMouseUp={() => { sendInput({ down: false }); setActiveKeys(p => ({ ...p, down: false })); }}
                  onTouchStart={() => { sendInput({ down: true }); setActiveKeys(p => ({ ...p, down: true })); }}
                  onTouchEnd={() => { sendInput({ down: false }); setActiveKeys(p => ({ ...p, down: false })); }}
                  className={`absolute bottom-0 w-8 h-10 rounded-b-lg bg-slate-800 border-b border-x border-slate-600 transition-all ${
                    activeKeys.down ? 'bg-slate-600 -translate-y-0.5' : 'hover:bg-slate-700 shadow-md'
                  }`}
                >
                  <span className="text-[10px] text-slate-400">▼</span>
                </button>

                {/* LEFT */}
                <button
                  onMouseDown={() => { sendInput({ left: true }); setActiveKeys(p => ({ ...p, left: true })); }}
                  onMouseUp={() => { sendInput({ left: false }); setActiveKeys(p => ({ ...p, left: false })); }}
                  onTouchStart={() => { sendInput({ left: true }); setActiveKeys(p => ({ ...p, left: true })); }}
                  onTouchEnd={() => { sendInput({ left: false }); setActiveKeys(p => ({ ...p, left: false })); }}
                  className={`absolute left-0 w-10 h-8 rounded-l-lg bg-slate-800 border-l border-y border-slate-600 transition-all ${
                    activeKeys.left ? 'bg-slate-600 translate-x-0.5' : 'hover:bg-slate-700 shadow-md'
                  }`}
                >
                  <span className="text-[10px] text-slate-400">◀</span>
                </button>

                {/* RIGHT */}
                <button
                  onMouseDown={() => { sendInput({ right: true }); setActiveKeys(p => ({ ...p, right: true })); }}
                  onMouseUp={() => { sendInput({ right: false }); setActiveKeys(p => ({ ...p, right: false })); }}
                  onTouchStart={() => { sendInput({ right: true }); setActiveKeys(p => ({ ...p, right: true })); }}
                  onTouchEnd={() => { sendInput({ right: false }); setActiveKeys(p => ({ ...p, right: false })); }}
                  className={`absolute right-0 w-10 h-8 rounded-r-lg bg-slate-800 border-r border-y border-slate-600 transition-all ${
                    activeKeys.right ? 'bg-slate-600 -translate-x-0.5' : 'hover:bg-slate-700 shadow-md'
                  }`}
                >
                  <span className="text-[10px] text-slate-400">▶</span>
                </button>

                {/* Center Pivot */}
                <div className="absolute w-8 h-8 bg-slate-850 rounded-sm" />
              </div>

              {/* Middle: Light Button & Speaker Grille */}
              <div className="flex flex-col items-center space-y-3">
                {/* Center Sun/Light Button */}
                <button
                  onClick={() => setIsBacklitOn(!isBacklitOn)}
                  className={`w-6 h-6 rounded-full flex items-center justify-center border transition-all ${
                    isBacklitOn
                      ? 'bg-amber-500 border-amber-300 text-slate-900 shadow-[0_0_8px_#f59e0b]'
                      : 'bg-slate-800 border-slate-600 text-slate-400'
                  }`}
                  title="Schermverlichting / Brightness"
                >
                  <Sun className="w-3.5 h-3.5" />
                </button>

                {/* Speaker Grille holes */}
                <div className="grid grid-cols-4 gap-1 p-1 bg-black/30 rounded-lg">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <div key={i} className="w-1.5 h-1.5 rounded-full bg-black/80" />
                  ))}
                </div>
              </div>

              {/* Action Buttons: B and A (Diagonal placement) */}
              <div className="flex items-center space-x-3 -rotate-12">
                {/* Button B */}
                <button
                  onMouseDown={() => { sendInput({ b: true }); setActiveKeys(p => ({ ...p, b: true })); }}
                  onMouseUp={() => { sendInput({ b: false }); setActiveKeys(p => ({ ...p, b: false })); }}
                  onTouchStart={() => { sendInput({ b: true }); setActiveKeys(p => ({ ...p, b: true })); }}
                  onTouchEnd={() => { sendInput({ b: false }); setActiveKeys(p => ({ ...p, b: false })); }}
                  className={`w-11 h-11 rounded-full flex flex-col items-center justify-center font-black border-2 transition-all ${
                    activeKeys.b
                      ? 'bg-slate-500 border-slate-300 text-white scale-95 shadow-inner'
                      : 'bg-slate-700 hover:bg-slate-600 border-slate-500 text-slate-200 shadow-lg'
                  }`}
                >
                  <span className="text-xs">B</span>
                </button>

                {/* Button A */}
                <button
                  onMouseDown={() => { sendInput({ a: true }); setActiveKeys(p => ({ ...p, a: true })); }}
                  onMouseUp={() => { sendInput({ a: false }); setActiveKeys(p => ({ ...p, a: false })); }}
                  onTouchStart={() => { sendInput({ a: true }); setActiveKeys(p => ({ ...p, a: true })); }}
                  onTouchEnd={() => { sendInput({ a: false }); setActiveKeys(p => ({ ...p, a: false })); }}
                  className={`w-11 h-11 rounded-full flex flex-col items-center justify-center font-black border-2 transition-all ${
                    activeKeys.a
                      ? 'bg-slate-500 border-slate-300 text-white scale-95 shadow-inner'
                      : 'bg-slate-700 hover:bg-slate-600 border-slate-500 text-slate-200 shadow-lg'
                  }`}
                >
                  <span className="text-xs">A</span>
                </button>
              </div>
            </div>

            {/* Bottom Row: Select & Start Buttons */}
            <div className="flex items-center justify-center space-x-8 mt-3 pt-2 border-t border-white/5">
              <button
                onMouseDown={() => { sendInput({ select: true }); setActiveKeys(p => ({ ...p, select: true })); }}
                onMouseUp={() => { sendInput({ select: false }); setActiveKeys(p => ({ ...p, select: false })); }}
                onTouchStart={() => { sendInput({ select: true }); setActiveKeys(p => ({ ...p, select: true })); }}
                onTouchEnd={() => { sendInput({ select: false }); setActiveKeys(p => ({ ...p, select: false })); }}
                className={`px-3 py-1 rounded-full text-[9px] font-bold border transition-all ${
                  activeKeys.select
                    ? 'bg-slate-600 border-slate-400 text-white'
                    : 'bg-slate-800 hover:bg-slate-700 border-slate-600 text-slate-400'
                }`}
              >
                SELECT
              </button>

              <button
                onMouseDown={() => { sendInput({ start: true }); setActiveKeys(p => ({ ...p, start: true })); }}
                onMouseUp={() => { sendInput({ start: false }); setActiveKeys(p => ({ ...p, start: false })); }}
                onTouchStart={() => { sendInput({ start: true }); setActiveKeys(p => ({ ...p, start: true })); }}
                onTouchEnd={() => { sendInput({ start: false }); setActiveKeys(p => ({ ...p, start: false })); }}
                className={`px-3 py-1 rounded-full text-[9px] font-bold border transition-all ${
                  activeKeys.start
                    ? 'bg-slate-600 border-slate-400 text-white'
                    : 'bg-slate-800 hover:bg-slate-700 border-slate-600 text-slate-400'
                }`}
              >
                START
              </button>
            </div>
          </div>

          {/* Bottom Physical Cartridge Edge Slot */}
          <div className="w-full flex items-center justify-between px-6 pb-2">
            <div className="flex items-center space-x-2">
              <span className="text-[8px] font-bold text-slate-400">SHELL COLOR:</span>
              <div className="flex items-center space-x-1">
                {(Object.keys(GBA_SHELL_COLORS) as GbaShellColor[]).map(sc => (
                  <button
                    key={sc}
                    onClick={() => { gbaAudio.playHingeClick(); setShellColor(sc); }}
                    className={`w-3.5 h-3.5 rounded-full border ${
                      shellColor === sc ? 'ring-2 ring-white scale-110' : 'opacity-70 hover:opacity-100'
                    }`}
                    style={{ backgroundColor: GBA_SHELL_COLORS[sc].hex, borderColor: GBA_SHELL_COLORS[sc].border }}
                    title={GBA_SHELL_COLORS[sc].name}
                  />
                ))}
              </div>
            </div>

            <div className="text-[9px] font-mono text-slate-300">
              {activeCartridge.code}
            </div>
          </div>
        </div>
      </main>

      {/* High Scores Modal */}
      {isHighScoreOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-slate-900 border-2 border-yellow-500/50 rounded-2xl p-5 text-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
              <div className="flex items-center space-x-2">
                <Trophy className="w-5 h-5 text-yellow-400" />
                <h3 className="font-bold text-sm text-yellow-400 uppercase">
                  {activeCartridge.title} - Hall of Fame
                </h3>
              </div>
              <button
                onClick={() => setIsHighScoreOpen(false)}
                className="text-xs text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2">
              {scores.map((sc, i) => (
                <div
                  key={sc.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-slate-800/60 border border-slate-700/60 text-xs"
                >
                  <div className="flex items-center space-x-3">
                    <span className="font-mono font-bold text-amber-400">#{i + 1}</span>
                    <span className="font-mono font-black text-white">{sc.name}</span>
                    <span className="text-[10px] text-slate-400 truncate max-w-[140px]">{sc.subInfo}</span>
                  </div>
                  <span className="font-mono font-black text-emerald-400">{sc.score}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Historical Dossier Modal */}
      <GbaHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        onPlayGame={switchCartridge}
        lang={lang}
      />

      {/* Bottom Keyboard Controls Reference */}
      <footer className="w-full max-w-3xl flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[11px] text-slate-400 bg-slate-900/60 border border-slate-800/60 py-1.5 px-4 rounded-xl backdrop-blur-sm mt-2">
        <span><strong>D-Pad:</strong> Arrow Keys / WASD</span>
        <span><strong>A:</strong> Z / Space</span>
        <span><strong>B:</strong> X / J</span>
        <span><strong>L / R:</strong> Q / E</span>
        <span><strong>START:</strong> Enter</span>
        <span><strong>SELECT:</strong> Shift</span>
      </footer>
    </div>
  );
};
