/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * EINDELOOS - Commodore 64 Arcade Cabinet Component
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  ArrowLeft,
  Volume2,
  VolumeX,
  RotateCcw,
  Play,
  Pause,
  Map,
  HelpCircle,
  Tv,
  Crosshair,
  ShieldAlert,
  Smartphone,
  ChevronDown,
  ChevronUp,
  Gauge,
  Shield,
} from 'lucide-react';
import { EindeloosEngine } from '../game/eindeloosEngine';
import { EindeloosRenderer } from '../game/eindeloosRenderer';
import { eindeloosAudio } from '../game/eindeloosAudio';
import { saveEindeloosScore } from '../game/eindeloosHighScores';
import { EindeloosHistoryModal } from './EindeloosHistoryModal';
import { GameControlsModal, useGameControls } from './GameControlsModal';
import { gamepadManager } from '../utils/gamepadManager';
import { haptics } from '../utils/haptics';

interface EindeloosCabinetProps {
  onBackToLobby: () => void;
}

export const EindeloosCabinet: React.FC<EindeloosCabinetProps> = ({ onBackToLobby }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<EindeloosEngine>(new EindeloosEngine());
  const rendererRef = useRef<EindeloosRenderer | null>(null);

  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [crtFilter, setCrtFilter] = useState(true);
  const [isFullscreenMap, setIsFullscreenMap] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const { showControls, setShowControls } = useGameControls('eindeloos');
  const [gameState, setGameState] = useState(engineRef.current.state);
  const [showTouchControls, setShowTouchControls] = useState<boolean>(() => {
    return (
      typeof window !== 'undefined' &&
      ('ontouchstart' in window || navigator.maxTouchPoints > 0 || window.innerWidth < 1024)
    );
  });
  const [showKeyboardGuide, setShowKeyboardGuide] = useState(false);
  const [flightSpeed, setFlightSpeed] = useState<'slow' | 'normal' | 'fast'>('slow');
  const [bumperEnabled, setBumperEnabled] = useState(true);

  const cycleSpeed = useCallback(() => {
    setFlightSpeed(prev => {
      const next = prev === 'slow' ? 'normal' : prev === 'normal' ? 'fast' : 'slow';
      const multiplier = next === 'slow' ? 0.70 : next === 'fast' ? 1.30 : 0.90;
      engineRef.current.speedMultiplier = multiplier;
      engineRef.current.state.message = `VLIEGSNELHEID: ${next === 'slow' ? 'RUSTIG (70%)' : next === 'normal' ? 'NORMAAL (90%)' : 'SNEL (130%)'}`;
      engineRef.current.state.messageTimer = 150;
      haptics.light();
      return next;
    });
  }, []);

  const toggleBumper = useCallback(() => {
    setBumperEnabled(prev => {
      const next = !prev;
      engineRef.current.bumperEnabled = next;
      engineRef.current.state.message = `STOOTKUSSEN: ${next ? 'AAN (VEILIG STUITEREN)' : 'UIT (ORIGINEEL 1985 - DIRECT FATAAL)'}`;
      engineRef.current.state.messageTimer = 180;
      haptics.light();
      return next;
    });
  }, []);

  // Active inputs
  const inputsRef = useRef({
    up: false,
    down: false,
    left: false,
    right: false,
    fire: false,
    action: false,
  });

  // Load 8192x4096 map on mount & initialize gamepad listener
  useEffect(() => {
    const engine = engineRef.current;
    engine.loadMap('/games/eindeloos/map.png').then(() => {
      setIsMapLoaded(true);
    });

    gamepadManager.start('eindeloos');
    return () => {
      gamepadManager.stop();
    };
  }, []);

  // Initialize Canvas & Game Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    rendererRef.current = new EindeloosRenderer(canvas);
    const engine = engineRef.current;

    let animationFrameId: number;

    const loop = () => {
      if (!isPaused) {
        engine.update(inputsRef.current);
        setGameState({ ...engine.state });
      }

      if (rendererRef.current) {
        rendererRef.current.render(engine, isFullscreenMap);
      }

      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animationFrameId);
      eindeloosAudio.stopEngine();
    };
  }, [isPaused, isFullscreenMap]);

  // Handle Keyboard inputs
  useEffect(() => {
    const activeCodes = new Set<string>();
    const activeKeys = new Set<string>();

    const updateDirectionalInputs = () => {
      const hasCode = (...codes: string[]) => codes.some(c => activeCodes.has(c));
      const hasKey = (...keys: string[]) => keys.some(k => activeKeys.has(k));

      // 8 directions mapping:
      // 7 = Up-Left (Numpad7 or Home)
      const isUpLeft = hasCode('Numpad7', 'Home') || hasKey('7', 'Home');
      // 8 = Up (Numpad8, ArrowUp, KeyW)
      const isUp = hasCode('Numpad8', 'ArrowUp', 'KeyW') || hasKey('8', 'ArrowUp', 'w', 'W');
      // 9 = Up-Right (Numpad9 or PageUp)
      const isUpRight = hasCode('Numpad9', 'PageUp') || hasKey('9', 'PageUp');
      // 4 = Left (Numpad4, ArrowLeft, KeyA)
      const isLeft = hasCode('Numpad4', 'ArrowLeft', 'KeyA') || hasKey('4', 'ArrowLeft', 'a', 'A');
      // 6 = Right (Numpad6, ArrowRight, KeyD)
      const isRight = hasCode('Numpad6', 'ArrowRight', 'KeyD') || hasKey('6', 'ArrowRight', 'd', 'D');
      // 1 = Down-Left (Numpad1 or End)
      const isDownLeft = hasCode('Numpad1', 'End') || hasKey('1', 'End');
      // 2 = Down (Numpad2, ArrowDown, KeyS)
      const isDown = hasCode('Numpad2', 'ArrowDown', 'KeyS') || hasKey('2', 'ArrowDown', 's', 'S');
      // 3 = Down-Right (Numpad3 or PageDown)
      const isDownRight = hasCode('Numpad3', 'PageDown') || hasKey('3', 'PageDown');

      inputsRef.current.up = isUpLeft || isUp || isUpRight;
      inputsRef.current.down = isDownLeft || isDown || isDownRight;
      inputsRef.current.left = isUpLeft || isLeft || isDownLeft;
      inputsRef.current.right = isUpRight || isRight || isDownRight;
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if history modal is open
      if (isHistoryOpen) return;

      const engine = engineRef.current;
      activeCodes.add(e.code);
      activeKeys.add(e.key);

      // Check for navigation / numpad keys to prevent window scrolling
      const isNavOrNumpad = [
        'Numpad7', 'Numpad8', 'Numpad9', 'Numpad4', 'Numpad5', 'Numpad6', 'Numpad1', 'Numpad2', 'Numpad3', 'Numpad0',
        'Home', 'End', 'PageUp', 'PageDown', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
        'Space', 'Insert', 'Clear'
      ].includes(e.code) || ['Home', 'End', 'PageUp', 'PageDown', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key);

      if (isNavOrNumpad) {
        e.preventDefault();
      }

      updateDirectionalInputs();

      // Fire & Action keys: Space, KeyZ, Numpad 0, Insert, Numpad 5, Clear, Enter, NumpadEnter
      const isFire = (
        e.code === 'Space' || e.key === ' ' ||
        e.code === 'KeyZ' || e.key === 'z' || e.key === 'Z' ||
        e.code === 'Numpad0' || e.key === '0' ||
        e.code === 'Insert' || e.key === 'Insert' ||
        e.code === 'Numpad5' || e.key === '5' || e.key === 'Clear' ||
        e.code === 'NumpadEnter' || e.code === 'Enter' || e.key === 'Enter'
      );

      if (isFire) {
        if (!e.repeat) {
          if (engine.state.status === 'title') {
            engine.startGame();
            haptics.medium();
          } else if (engine.state.status === 'game_over' || engine.state.status === 'victory') {
            restartGame();
            haptics.medium();
          } else if (engine.state.status === 'playing') {
            // Check if near checkpoint first
            const activated = engine.activateCheckpointUnderHelicopter();
            if (!activated) {
              engine.fireRocket();
            }
          }
        }
        inputsRef.current.fire = true;
        inputsRef.current.action = true;
        e.preventDefault();
      } else if (e.code === 'KeyM' || e.key === 'm' || e.key === 'M' || e.code === 'KeyY' || e.key === 'y' || e.key === 'Y') {
        setIsFullscreenMap(prev => !prev);
        haptics.light();
        e.preventDefault();
      } else if (e.code === 'KeyB' || e.key === 'b' || e.key === 'B') {
        cycleSpeed();
        e.preventDefault();
      } else if (e.code === 'KeyK' || e.key === 'k' || e.key === 'K' || e.code === 'KeyC' || e.key === 'c' || e.key === 'C') {
        toggleBumper();
        e.preventDefault();
      } else if (e.code === 'KeyP' || e.key === 'p' || e.key === 'P') {
        setIsPaused(prev => !prev);
        e.preventDefault();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      activeCodes.delete(e.code);
      activeKeys.delete(e.key);

      updateDirectionalInputs();

      const isFire = (
        e.code === 'Space' || e.key === ' ' ||
        e.code === 'KeyZ' || e.key === 'z' || e.key === 'Z' ||
        e.code === 'Numpad0' || e.key === '0' ||
        e.code === 'Insert' || e.key === 'Insert' ||
        e.code === 'Numpad5' || e.key === '5' || e.key === 'Clear' ||
        e.code === 'NumpadEnter' || e.code === 'Enter' || e.key === 'Enter'
      );

      if (isFire) {
        inputsRef.current.fire = false;
        inputsRef.current.action = false;
      }
    };

    const handleBlur = () => {
      activeCodes.clear();
      activeKeys.clear();
      inputsRef.current.up = false;
      inputsRef.current.down = false;
      inputsRef.current.left = false;
      inputsRef.current.right = false;
      inputsRef.current.fire = false;
      inputsRef.current.action = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
    };
  }, [isHistoryOpen]);

  const toggleMute = () => {
    const muted = eindeloosAudio.toggleMute();
    setIsMuted(muted);
    haptics.light();
  };

  const restartGame = () => {
    eindeloosAudio.stopEngine();
    const multiplier = flightSpeed === 'slow' ? 0.70 : flightSpeed === 'fast' ? 1.30 : 0.90;
    const engine = new EindeloosEngine();
    engine.speedMultiplier = multiplier;
    engine.bumperEnabled = bumperEnabled;
    engineRef.current = engine;
    engine.loadMap('/games/eindeloos/map.png').then(() => {
      engine.startGame();
      setIsFullscreenMap(false);
      setIsPaused(false);
      haptics.medium();
    });
  };

  const handleStartGame = () => {
    if (engineRef.current.state.status === 'title') {
      engineRef.current.startGame();
      haptics.medium();
    }
  };

  // Canvas direct touch steering
  const handleCanvasPointerMove = (clientX: number, clientY: number, target: HTMLElement) => {
    const engine = engineRef.current;
    if (engine.state.status === 'title') {
      engine.startGame();
      haptics.medium();
    }
    if (engine.state.status !== 'playing') return;

    const rect = target.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const dx = clientX - centerX;
    const dy = clientY - centerY;
    const deadzone = 20;

    inputsRef.current.left = dx < -deadzone;
    inputsRef.current.right = dx > deadzone;
    inputsRef.current.up = dy < -deadzone;
    inputsRef.current.down = dy > deadzone;
  };

  const handleCanvasPointerUp = () => {
    inputsRef.current.left = false;
    inputsRef.current.right = false;
    inputsRef.current.up = false;
    inputsRef.current.down = false;
  };

  // Helper for touch D-pad buttons that auto-starts game
  const handleDirectionPress = (dir: { up?: boolean; down?: boolean; left?: boolean; right?: boolean }, active: boolean) => {
    const engine = engineRef.current;
    if (active && engine.state.status === 'title') {
      engine.startGame();
      haptics.medium();
    }
    if (dir.up !== undefined) inputsRef.current.up = active;
    if (dir.down !== undefined) inputsRef.current.down = active;
    if (dir.left !== undefined) inputsRef.current.left = active;
    if (dir.right !== undefined) inputsRef.current.right = active;
  };

  // Check Game Over & save score
  useEffect(() => {
    if (gameState.status === 'game_over' || gameState.status === 'victory') {
      saveEindeloosScore({
        score: gameState.score,
        initials: 'YOU',
        date: new Date().toISOString().split('T')[0],
        exploredPercent: gameState.exploredPercent,
        heartDestroyed: gameState.heart.isDestroyed,
      });
    }
  }, [gameState.status]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full bg-neutral-950 p-2 sm:p-4 text-white select-none">
      {/* Top Navigation Bar */}
      <header className="w-full max-w-5xl flex items-center justify-between py-2 px-3 mb-2 bg-neutral-900/80 border border-neutral-800 rounded-xl backdrop-blur-md">
        <button
          onClick={() => {
            eindeloosAudio.stopEngine();
            haptics.medium();
            onBackToLobby();
          }}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition text-xs sm:text-sm font-mono"
        >
          <ArrowLeft className="w-4 h-4" />
          Arcade Lobby
        </button>

        {/* C64 Logo Badge */}
        <div className="flex items-center gap-2">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-red-500 shadow-sm" />
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-yellow-500 shadow-sm" />
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-green-500 shadow-sm" />
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-cyan-500 shadow-sm" />
          <span className="text-cyan-400 font-bold font-mono text-sm tracking-wider hidden sm:inline">
            RADARSOFT 1985 · COMMODORE 64
          </span>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsHistoryOpen(true)}
            className="p-1.5 sm:px-2.5 sm:py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-cyan-300 text-xs font-mono transition flex items-center gap-1.5"
            title="Spelinfo & Kaart Dossier"
          >
            <HelpCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Dossier</span>
          </button>

          <button
            onClick={() => setShowControls(true)}
            className="p-1.5 sm:px-2.5 sm:py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-yellow-400 text-xs font-mono transition flex items-center gap-1.5 border border-neutral-700"
            title="Besturing & Xbox Controller"
          >
            <HelpCircle className="w-4 h-4 text-yellow-400" />
            <span className="hidden sm:inline">Besturing</span>
          </button>

          <button
            onClick={() => setCrtFilter(prev => !prev)}
            className={`p-1.5 sm:px-2.5 sm:py-1 rounded-lg text-xs font-mono transition flex items-center gap-1.5 ${
              crtFilter
                ? 'bg-cyan-950/80 text-cyan-400 border border-cyan-700/50'
                : 'bg-neutral-800 text-neutral-400'
            }`}
            title="CRT Beeldbuis Scanlines"
          >
            <Tv className="w-4 h-4" />
            <span className="hidden sm:inline">CRT</span>
          </button>

          <button
            onClick={toggleMute}
            className="p-1.5 sm:px-2.5 sm:py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-mono transition"
            title={isMuted ? 'Geluid Aanzetten' : 'Geluid Dempen'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-green-400" />}
          </button>
        </div>
      </header>

      {/* Arcade Cabinet Screen Frame (Commodore 1084S Monitor Style) */}
      <div className="relative w-full max-w-4xl bg-neutral-900 border-4 border-neutral-700 rounded-2xl shadow-2xl p-3 sm:p-5 flex flex-col items-center">
        {/* Monitor Bezel Header */}
        <div className="w-full flex items-center justify-between pb-2 mb-2 border-b border-neutral-800 text-xs font-mono text-neutral-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-neutral-300 font-bold">COMMODORE 1084S MONITOR</span>
          </div>
          <div className="flex items-center gap-4">
            <span>RESOLUTIE: 1024×512 KARAKTERS</span>
            <span>STATUS: {isMapLoaded ? '100% AUTHENTIEKE KAART ACTIEF' : 'LADEN...'}</span>
          </div>
        </div>

        {/* Canvas Screen */}
        <div
          className="relative w-full aspect-[16/10] bg-black rounded-lg overflow-hidden border-2 border-neutral-800 shadow-inner flex items-center justify-center touch-none select-none cursor-crosshair"
          onClick={() => {
            if (engineRef.current.state.status === 'title') {
              handleStartGame();
            }
          }}
          onTouchStart={(e) => {
            if (engineRef.current.state.status === 'title') {
              handleStartGame();
              return;
            }
            const touch = e.touches[0];
            if (touch) handleCanvasPointerMove(touch.clientX, touch.clientY, e.currentTarget);
          }}
          onTouchMove={(e) => {
            const touch = e.touches[0];
            if (touch) handleCanvasPointerMove(touch.clientX, touch.clientY, e.currentTarget);
          }}
          onTouchEnd={handleCanvasPointerUp}
          onTouchCancel={handleCanvasPointerUp}
        >
          <canvas
            ref={canvasRef}
            width={640}
            height={400}
            className={`w-full h-full object-contain ${
              crtFilter ? 'contrast-110 saturate-110' : ''
            }`}
          />

          {/* CRT Scanline Overlay */}
          {crtFilter && (
            <div
              className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.35)_50%)] bg-[length:100%_4px] opacity-75"
              aria-hidden="true"
            />
          )}

          {/* Clean, non-intrusive start pill in title state (screen stays 100% visible) */}
          {gameState.status === 'title' && (
            <div className="absolute bottom-4 sm:bottom-6 inset-x-0 flex justify-center pointer-events-none z-10">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleStartGame();
                }}
                className="pointer-events-auto px-6 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-mono font-bold text-xs sm:text-sm shadow-2xl flex items-center gap-2 border border-emerald-400/80 animate-bounce transition cursor-pointer"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>START MISSIE (OF KLIK OP SCHERM)</span>
              </button>
            </div>
          )}
        </div>

        {/* Quick Toolbar below screen */}
        <div className="w-full flex flex-wrap items-center justify-between gap-2 mt-3 pt-2 border-t border-neutral-800 text-xs font-mono">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <button
              onClick={() => setShowTouchControls(prev => !prev)}
              className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition ${
                showTouchControls
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-700 font-bold'
                  : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-400'
              }`}
              title="Touch Besturing Knoppen tonen/verbergen"
            >
              <Smartphone className="w-4 h-4 text-cyan-400" />
              <span>Touch Controls</span>
            </button>

            {/* Flight speed toggle */}
            <button
              onClick={cycleSpeed}
              className="px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition"
              title="Helikopter vliegsnelheid aanpassen (Rustig / Normaal / Snel)"
            >
              <Gauge className="w-4 h-4 text-amber-400" />
              <span>
                {flightSpeed === 'slow' ? 'Snelheid: Rustig' : flightSpeed === 'fast' ? 'Snelheid: Snel' : 'Snelheid: Normaal'}
              </span>
            </button>

            {/* Bumper / Safety Cushion toggle */}
            <button
              onClick={toggleBumper}
              className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition ${
                bumperEnabled
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-700/60 font-semibold'
                  : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-400'
              }`}
              title="Stootkussen (veilig zacht botsen tegen wanden) aan/uitzetten"
            >
              <Shield className={`w-4 h-4 ${bumperEnabled ? 'text-emerald-400' : 'text-neutral-400'}`} />
              <span>Stootkussen: {bumperEnabled ? 'AAN' : 'UIT'}</span>
            </button>

            <button
              onClick={() => setIsFullscreenMap(prev => !prev)}
              className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition ${
                isFullscreenMap
                  ? 'bg-green-600 text-white font-bold'
                  : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300'
              }`}
            >
              <Map className="w-4 h-4" />
              <span>{isFullscreenMap ? 'Kaart Sluiten' : 'Kaart (M)'}</span>
            </button>

            <button
              onClick={() => setIsPaused(prev => !prev)}
              className="px-2.5 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 flex items-center gap-1.5 transition"
            >
              {isPaused ? <Play className="w-4 h-4 text-green-400" /> : <Pause className="w-4 h-4 text-yellow-400" />}
              <span>{isPaused ? 'Hervat' : 'Pauze'}</span>
            </button>

            <button
              onClick={restartGame}
              className="px-2.5 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 flex items-center gap-1.5 transition"
              title="Spel Herstarten"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Herstart</span>
            </button>
          </div>

          <div className="text-neutral-400 flex items-center gap-2.5 text-[11px] sm:text-xs">
            <span>
              Helikopters:{' '}
              <strong className="text-yellow-400 font-bold">{gameState.lives}</strong>
            </span>
            <span>
              Verkend:{' '}
              <strong className="text-cyan-400 font-bold">{gameState.exploredPercent}%</strong>
            </span>
            <span>
              Score:{' '}
              <strong className="text-white font-bold">{gameState.score}</strong>
            </span>
          </div>
        </div>

        {/* Prominent Mobile / Touch Controls */}
        {showTouchControls && (
          <div className="w-full mt-3 p-3 bg-neutral-950/90 rounded-xl border border-cyan-900/40 shadow-xl touch-none select-none">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              {/* Virtual 8-way D-pad */}
              <div className="flex flex-col items-center">
                <div className="text-[11px] text-cyan-400 font-mono font-bold mb-1.5 flex items-center gap-1.5">
                  <span>8-RICHTINGEN TOUCH D-PAD</span>
                  <span className="text-[9px] text-neutral-400 font-normal">(of veeg direct op scherm)</span>
                </div>
                <div className="grid grid-cols-3 gap-1.5 w-48 h-48">
                  <button
                    onPointerDown={(e) => { e.preventDefault(); handleDirectionPress({ up: true, left: true }, true); }}
                    onPointerUp={(e) => { e.preventDefault(); handleDirectionPress({ up: true, left: true }, false); }}
                    onPointerLeave={() => handleDirectionPress({ up: true, left: true }, false)}
                    onPointerCancel={() => handleDirectionPress({ up: true, left: true }, false)}
                    className="bg-neutral-800 active:bg-cyan-600 active:scale-95 rounded-xl font-bold text-sm flex flex-col items-center justify-center border border-neutral-700 shadow text-neutral-300 touch-none transition-all"
                  >
                    <span>↖</span>
                    <span className="text-[8px] text-neutral-500 font-mono">7</span>
                  </button>
                  <button
                    onPointerDown={(e) => { e.preventDefault(); handleDirectionPress({ up: true }, true); }}
                    onPointerUp={(e) => { e.preventDefault(); handleDirectionPress({ up: true }, false); }}
                    onPointerLeave={() => handleDirectionPress({ up: true }, false)}
                    onPointerCancel={() => handleDirectionPress({ up: true }, false)}
                    className="bg-neutral-800 active:bg-cyan-600 active:scale-95 rounded-xl font-bold text-lg flex flex-col items-center justify-center border border-neutral-700 shadow text-white touch-none transition-all"
                  >
                    <span>▲</span>
                    <span className="text-[8px] text-neutral-500 font-mono">8</span>
                  </button>
                  <button
                    onPointerDown={(e) => { e.preventDefault(); handleDirectionPress({ up: true, right: true }, true); }}
                    onPointerUp={(e) => { e.preventDefault(); handleDirectionPress({ up: true, right: true }, false); }}
                    onPointerLeave={() => handleDirectionPress({ up: true, right: true }, false)}
                    onPointerCancel={() => handleDirectionPress({ up: true, right: true }, false)}
                    className="bg-neutral-800 active:bg-cyan-600 active:scale-95 rounded-xl font-bold text-sm flex flex-col items-center justify-center border border-neutral-700 shadow text-neutral-300 touch-none transition-all"
                  >
                    <span>↗</span>
                    <span className="text-[8px] text-neutral-500 font-mono">9</span>
                  </button>
                  <button
                    onPointerDown={(e) => { e.preventDefault(); handleDirectionPress({ left: true }, true); }}
                    onPointerUp={(e) => { e.preventDefault(); handleDirectionPress({ left: true }, false); }}
                    onPointerLeave={() => handleDirectionPress({ left: true }, false)}
                    onPointerCancel={() => handleDirectionPress({ left: true }, false)}
                    className="bg-neutral-800 active:bg-cyan-600 active:scale-95 rounded-xl font-bold text-lg flex flex-col items-center justify-center border border-neutral-700 shadow text-white touch-none transition-all"
                  >
                    <span>◀</span>
                    <span className="text-[8px] text-neutral-500 font-mono">4</span>
                  </button>
                  <div className="bg-neutral-900 rounded-xl flex flex-col items-center justify-center text-cyan-400 font-mono text-[10px] font-bold border border-neutral-800">
                    <span>C64</span>
                    <span className="text-[8px] text-neutral-500">8-WAY</span>
                  </div>
                  <button
                    onPointerDown={(e) => { e.preventDefault(); handleDirectionPress({ right: true }, true); }}
                    onPointerUp={(e) => { e.preventDefault(); handleDirectionPress({ right: true }, false); }}
                    onPointerLeave={() => handleDirectionPress({ right: true }, false)}
                    onPointerCancel={() => handleDirectionPress({ right: true }, false)}
                    className="bg-neutral-800 active:bg-cyan-600 active:scale-95 rounded-xl font-bold text-lg flex flex-col items-center justify-center border border-neutral-700 shadow text-white touch-none transition-all"
                  >
                    <span>▶</span>
                    <span className="text-[8px] text-neutral-500 font-mono">6</span>
                  </button>
                  <button
                    onPointerDown={(e) => { e.preventDefault(); handleDirectionPress({ down: true, left: true }, true); }}
                    onPointerUp={(e) => { e.preventDefault(); handleDirectionPress({ down: true, left: true }, false); }}
                    onPointerLeave={() => handleDirectionPress({ down: true, left: true }, false)}
                    onPointerCancel={() => handleDirectionPress({ down: true, left: true }, false)}
                    className="bg-neutral-800 active:bg-cyan-600 active:scale-95 rounded-xl font-bold text-sm flex flex-col items-center justify-center border border-neutral-700 shadow text-neutral-300 touch-none transition-all"
                  >
                    <span>↙</span>
                    <span className="text-[8px] text-neutral-500 font-mono">1</span>
                  </button>
                  <button
                    onPointerDown={(e) => { e.preventDefault(); handleDirectionPress({ down: true }, true); }}
                    onPointerUp={(e) => { e.preventDefault(); handleDirectionPress({ down: true }, false); }}
                    onPointerLeave={() => handleDirectionPress({ down: true }, false)}
                    onPointerCancel={() => handleDirectionPress({ down: true }, false)}
                    className="bg-neutral-800 active:bg-cyan-600 active:scale-95 rounded-xl font-bold text-lg flex flex-col items-center justify-center border border-neutral-700 shadow text-white touch-none transition-all"
                  >
                    <span>▼</span>
                    <span className="text-[8px] text-neutral-500 font-mono">2</span>
                  </button>
                  <button
                    onPointerDown={(e) => { e.preventDefault(); handleDirectionPress({ down: true, right: true }, true); }}
                    onPointerUp={(e) => { e.preventDefault(); handleDirectionPress({ down: true, right: true }, false); }}
                    onPointerLeave={() => handleDirectionPress({ down: true, right: true }, false)}
                    onPointerCancel={() => handleDirectionPress({ down: true, right: true }, false)}
                    className="bg-neutral-800 active:bg-cyan-600 active:scale-95 rounded-xl font-bold text-sm flex flex-col items-center justify-center border border-neutral-700 shadow text-neutral-300 touch-none transition-all"
                  >
                    <span>↘</span>
                    <span className="text-[8px] text-neutral-500 font-mono">3</span>
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="w-full sm:w-56 flex flex-col gap-2.5">
                <button
                  onPointerDown={(e) => {
                    e.preventDefault();
                    const engine = engineRef.current;
                    if (engine.state.status === 'playing') {
                      const activated = engine.activateCheckpointUnderHelicopter();
                      if (!activated) engine.fireRocket();
                    } else if (engine.state.status === 'title') {
                      engine.startGame();
                    } else {
                      restartGame();
                    }
                    haptics.heavy();
                  }}
                  className="w-full py-4 bg-gradient-to-r from-red-600 to-orange-600 active:from-red-500 active:to-orange-500 active:scale-95 rounded-xl font-bold font-mono text-base tracking-wider shadow-lg flex items-center justify-center gap-2 touch-none border border-red-400/40 text-white"
                >
                  <Crosshair className="w-6 h-6" />
                  VUUR / ACTIE
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      const engine = engineRef.current;
                      if (engine.state.status === 'playing') {
                        engine.activateCheckpointUnderHelicopter();
                      }
                      haptics.medium();
                    }}
                    className="py-2.5 bg-neutral-800 active:bg-neutral-700 active:scale-95 rounded-lg font-mono text-xs text-amber-300 font-bold flex items-center justify-center gap-1 border border-neutral-700"
                  >
                    <ShieldAlert className="w-4 h-4 text-amber-400" />
                    Checkpoint
                  </button>

                  <button
                    onClick={() => setIsFullscreenMap(prev => !prev)}
                    className="py-2.5 bg-neutral-800 active:bg-neutral-700 active:scale-95 rounded-lg font-mono text-xs text-cyan-300 font-bold flex items-center justify-center gap-1 border border-neutral-700"
                  >
                    <Map className="w-4 h-4 text-cyan-400" />
                    Kaart (M)
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Collapsible PC Keyboard & Numpad Guide */}
        <div className="w-full mt-3 p-2.5 bg-neutral-900/90 rounded-xl border border-neutral-800 text-xs font-mono">
          <button
            onClick={() => setShowKeyboardGuide(prev => !prev)}
            className="w-full flex items-center justify-between text-neutral-300 hover:text-white font-bold text-[11px]"
          >
            <div className="flex items-center gap-2">
              <span className="px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 text-[10px]">
                PC KEYBOARD & NUMPAD
              </span>
              <span>8-richtingen (7 8 9 / 4 6 / 1 2 3) + Pijltoetsen / WASD</span>
            </div>
            {showKeyboardGuide ? <ChevronUp className="w-4 h-4 text-neutral-400" /> : <ChevronDown className="w-4 h-4 text-neutral-400" />}
          </button>

          {showKeyboardGuide && (
            <div className="mt-2 pt-2 border-t border-neutral-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
              {/* 8-direction numpad visual */}
              <div className="flex items-center gap-3">
                <div className="grid grid-cols-3 gap-1 bg-black/70 p-1.5 rounded-lg border border-neutral-700 select-none shrink-0 shadow-inner">
                  <div className="w-7 h-7 bg-neutral-800 text-cyan-300 font-bold text-xs flex flex-col items-center justify-center rounded border border-neutral-700">
                    <span className="leading-none">7</span>
                    <span className="text-[7px] text-neutral-400 leading-none">↖</span>
                  </div>
                  <div className="w-7 h-7 bg-neutral-800 text-cyan-300 font-bold text-xs flex flex-col items-center justify-center rounded border border-neutral-700">
                    <span className="leading-none">8</span>
                    <span className="text-[7px] text-neutral-400 leading-none">↑</span>
                  </div>
                  <div className="w-7 h-7 bg-neutral-800 text-cyan-300 font-bold text-xs flex flex-col items-center justify-center rounded border border-neutral-700">
                    <span className="leading-none">9</span>
                    <span className="text-[7px] text-neutral-400 leading-none">↗</span>
                  </div>
                  <div className="w-7 h-7 bg-neutral-800 text-cyan-300 font-bold text-xs flex flex-col items-center justify-center rounded border border-neutral-700">
                    <span className="leading-none">4</span>
                    <span className="text-[7px] text-neutral-400 leading-none">←</span>
                  </div>
                  <div className="w-7 h-7 bg-neutral-900 text-neutral-500 font-bold text-xs flex items-center justify-center rounded border border-neutral-800">
                    •
                  </div>
                  <div className="w-7 h-7 bg-neutral-800 text-cyan-300 font-bold text-xs flex flex-col items-center justify-center rounded border border-neutral-700">
                    <span className="leading-none">6</span>
                    <span className="text-[7px] text-neutral-400 leading-none">→</span>
                  </div>
                  <div className="w-7 h-7 bg-neutral-800 text-cyan-300 font-bold text-xs flex flex-col items-center justify-center rounded border border-neutral-700">
                    <span className="leading-none">1</span>
                    <span className="text-[7px] text-neutral-400 leading-none">↙</span>
                  </div>
                  <div className="w-7 h-7 bg-neutral-800 text-cyan-300 font-bold text-xs flex flex-col items-center justify-center rounded border border-neutral-700">
                    <span className="leading-none">2</span>
                    <span className="text-[7px] text-neutral-400 leading-none">↓</span>
                  </div>
                  <div className="w-7 h-7 bg-neutral-800 text-cyan-300 font-bold text-xs flex flex-col items-center justify-center rounded border border-neutral-700">
                    <span className="leading-none">3</span>
                    <span className="text-[7px] text-neutral-400 leading-none">↘</span>
                  </div>
                </div>

                <div className="space-y-1 text-[11px] text-neutral-300">
                  <p className="text-neutral-400 text-[10px] leading-tight">
                    Werkt zowel met <strong>NumLock AAN</strong> als <strong>NumLock UIT</strong> (Home, Omhoog, PgUp, Links, Rechts, End, Omlaag, PgDn) + Pijltoetsen of WASD.
                  </p>
                  <div className="text-neutral-300 text-[10px] flex items-center gap-2">
                    <span className="px-1.5 py-0.5 rounded bg-neutral-800 text-white font-mono font-bold border border-neutral-700">
                      Spatiebalk
                    </span>
                    <span>of</span>
                    <span className="px-1.5 py-0.5 rounded bg-neutral-800 text-white font-mono font-bold border border-neutral-700">
                      Numpad 0 / Enter
                    </span>
                    <span>= Raket afvuren / Checkpoint [!] opslaan</span>
                  </div>
                </div>
              </div>

              <div className="hidden lg:flex items-center gap-2 text-[10px] text-neutral-400 border-l border-neutral-800 pl-3 shrink-0">
                <span className="px-1.5 py-0.5 rounded bg-neutral-800 text-cyan-300 font-bold">M</span> Kaart
                <span className="px-1.5 py-0.5 rounded bg-neutral-800 text-yellow-300 font-bold ml-1">P</span> Pauze
              </div>
            </div>
          )}
        </div>
      </div>

      {/* History & Documentation Modal */}
      <EindeloosHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        onPlayNow={() => {
          if (engineRef.current.state.status === 'title') {
            engineRef.current.startGame();
          }
        }}
      />

      {/* Game Controls & Xbox Controller Modal */}
      <GameControlsModal
        isOpen={showControls}
        onClose={() => setShowControls(false)}
        gameId="eindeloos"
      />
    </div>
  );
};
