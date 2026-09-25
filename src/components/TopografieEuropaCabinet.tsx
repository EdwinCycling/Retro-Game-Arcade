/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Topografie Europa (Cees Kramer & Roel Kramer • Radarsoft, 1984)
 * Authentic Commodore 64 Cabinet, Scrolling CRT Monitor & Multi-Input Controls
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  RotateCcw,
  Volume2,
  VolumeX,
  BookOpen,
  MapPin,
  Flame,
  Tv,
  Eye,
  Maximize2
} from 'lucide-react';
import { TopografieEuropaEngine, GameMode, DifficultyMode } from '../game/topografieEuropaEngine';
import { TopografieEuropaRenderer } from '../game/topografieEuropaRenderer';
import { topografieEuropaAudio } from '../game/topografieEuropaAudio';
import { TopografieEuropaHistoryModal } from './TopografieEuropaHistoryModal';

interface TopografieEuropaCabinetProps {
  onBackToLobby: () => void;
  lang?: 'nl' | 'en';
}

export const TopografieEuropaCabinet: React.FC<TopografieEuropaCabinetProps> = ({
  onBackToLobby,
  lang = 'nl'
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<TopografieEuropaEngine | null>(null);
  const rendererRef = useRef<TopografieEuropaRenderer | null>(null);
  const animFrameId = useRef<number | null>(null);

  // UI state
  const [currentMode, setCurrentMode] = useState<GameMode>('capitals');
  const [difficulty, setDifficulty] = useState<DifficultyMode>('hard');
  const [isMuted, setIsMuted] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showCrtFilter, setShowCrtFilter] = useState(true);
  const [driveLedActive, setDriveLedActive] = useState(false);
  const [isOverviewMap, setIsOverviewMap] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(850);
  const [fuel, setFuel] = useState(100);
  const [flightStatus, setFlightStatus] = useState<'landed' | 'airborne' | 'transition'>('landed');

  // Initialize engine and renderer
  useEffect(() => {
    const engine = new TopografieEuropaEngine(currentMode, difficulty);
    engineRef.current = engine;

    if (canvasRef.current) {
      rendererRef.current = new TopografieEuropaRenderer(canvasRef.current);
    }

    // Simulate 1541 Floppy Drive read rattle
    setDriveLedActive(true);
    const driveTimer = setTimeout(() => setDriveLedActive(false), 900);

    let lastTime = performance.now();

    const loop = (time: number) => {
      const dt = Math.min(0.05, (time - lastTime) / 1000);
      lastTime = time;

      // Poll Gamepad
      pollGamepad(engine);

      // Update game loop
      engine.update(dt);

      // Render frame
      if (rendererRef.current) {
        rendererRef.current.render(engine, lang);
      }

      // Sync state for React HUD
      setScore(engine.score);
      setHighScore(engine.highScore);
      setFuel(Math.round(engine.fuel));
      setIsOverviewMap(engine.isOverviewMap);
      setFlightStatus(
        engine.flightState === 'airborne'
          ? 'airborne'
          : engine.flightState === 'landed'
          ? 'landed'
          : 'transition'
      );

      animFrameId.current = requestAnimationFrame(loop);
    };

    animFrameId.current = requestAnimationFrame(loop);

    return () => {
      clearTimeout(driveTimer);
      if (animFrameId.current) {
        cancelAnimationFrame(animFrameId.current);
      }
      topografieEuropaAudio.stopEngine();
    };
  }, [currentMode, difficulty, lang]);

  // Keyboard Event Listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const engine = engineRef.current;
      if (!engine) return;

      switch (e.code) {
        case 'ArrowUp':
        case 'KeyW':
          engine.inputUp = true;
          e.preventDefault();
          break;
        case 'ArrowDown':
        case 'KeyS':
          engine.inputDown = true;
          e.preventDefault();
          break;
        case 'ArrowLeft':
        case 'KeyA':
          engine.inputLeft = true;
          e.preventDefault();
          break;
        case 'ArrowRight':
        case 'KeyD':
          engine.inputRight = true;
          e.preventDefault();
          break;
        case 'Space':
          engine.toggleTakeoffLand();
          e.preventDefault();
          break;
        case 'KeyH':
          engine.toggleShowCityDots();
          e.preventDefault();
          break;
        case 'KeyB':
          const nextDiff = difficulty === 'hard' ? 'easy' : 'hard';
          setDifficulty(nextDiff);
          engine.setDifficulty(nextDiff);
          e.preventDefault();
          break;
        case 'KeyO':
        case 'Tab':
          engine.toggleOverviewMap();
          setIsOverviewMap(engine.isOverviewMap);
          e.preventDefault();
          break;
        case 'KeyR':
          engine.resetGame();
          e.preventDefault();
          break;
        case 'KeyM':
          const muted = topografieEuropaAudio.toggleMute();
          setIsMuted(muted);
          e.preventDefault();
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const engine = engineRef.current;
      if (!engine) return;

      switch (e.code) {
        case 'ArrowUp':
        case 'KeyW':
          engine.inputUp = false;
          break;
        case 'ArrowDown':
        case 'KeyS':
          engine.inputDown = false;
          break;
        case 'ArrowLeft':
        case 'KeyA':
          engine.inputLeft = false;
          break;
        case 'ArrowRight':
        case 'KeyD':
          engine.inputRight = false;
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [difficulty]);

  // Gamepad Controller Polling
  const pollGamepad = (engine: TopografieEuropaEngine) => {
    const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
    const gp = gamepads[0];
    if (!gp) return;

    // Analog stick & D-pad
    const deadzone = 0.2;
    let ax = gp.axes[0] || 0;
    let ay = gp.axes[1] || 0;

    if (Math.abs(ax) < deadzone) ax = 0;
    if (Math.abs(ay) < deadzone) ay = 0;

    // D-Pad buttons
    if (gp.buttons[14]?.pressed) ax = -1; // Left
    if (gp.buttons[15]?.pressed) ax = 1;  // Right
    if (gp.buttons[12]?.pressed) ay = -1; // Up
    if (gp.buttons[13]?.pressed) ay = 1;  // Down

    engine.analogX = ax;
    engine.analogY = ay;

    // Button A (0) for Takeoff / Land
    if (gp.buttons[0]?.pressed) {
      if (!engine.inputLandToggle) {
        engine.toggleTakeoffLand();
        engine.inputLandToggle = true;
      }
    } else {
      engine.inputLandToggle = false;
    }

    // Button Y or X for Hint
    if (gp.buttons[2]?.pressed || gp.buttons[3]?.pressed) {
      if (!engine.hintButtonPressed) {
        engine.toggleShowCityDots();
        engine.hintButtonPressed = true;
      }
    } else {
      engine.hintButtonPressed = false;
    }
  };

  const handleModeChange = (mode: GameMode) => {
    setCurrentMode(mode);
    setDriveLedActive(true);
    setTimeout(() => setDriveLedActive(false), 600);
  };

  const handleToggleSound = () => {
    const muted = topografieEuropaAudio.toggleMute();
    setIsMuted(muted);
  };

  const handleRestart = () => {
    if (engineRef.current) {
      engineRef.current.resetGame();
      setDriveLedActive(true);
      setTimeout(() => setDriveLedActive(false), 500);
    }
  };

  const handleTakeoffLandClick = () => {
    if (engineRef.current) {
      engineRef.current.toggleTakeoffLand();
    }
  };

  const handleHintClick = () => {
    if (engineRef.current) {
      engineRef.current.toggleShowCityDots();
    }
  };

  const handleToggleOverview = () => {
    if (engineRef.current) {
      engineRef.current.toggleOverviewMap();
      setIsOverviewMap(engineRef.current.isOverviewMap);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-blue-600 selection:text-white">
      {/* Top Navigation Bar */}
      <header className="border-b border-slate-800/80 bg-slate-900/90 backdrop-blur-md px-4 py-3 sticky top-0 z-30 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToLobby}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700/60 transition-colors shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{lang === 'nl' ? 'Arcade Lobby' : 'Arcade Lobby'}</span>
          </button>

          <div className="h-4 w-px bg-slate-700/60 hidden sm:block" />

          <div className="flex items-center gap-2">
            <span className="text-xl">🚁</span>
            <div>
              <h1 className="text-sm font-bold tracking-wider text-white flex items-center gap-2">
                TOPOGRAFIE EUROPA
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  C64 • 1984
                </span>
              </h1>
              <p className="text-[11px] text-blue-400 font-mono hidden sm:block">
                Cees Kramer & Roel Kramer • Radarsoft (Scrollende Kaart)
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Overview Toggle */}
          <button
            onClick={handleToggleOverview}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-colors ${
              isOverviewMap
                ? 'bg-amber-600/30 text-amber-300 border-amber-500/60'
                : 'bg-slate-800 text-slate-300 hover:text-white border-slate-700'
            }`}
            title="Wissel Kaartweergave (Scrollend vs Overzicht)"
          >
            {isOverviewMap ? <Maximize2 className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">
              {isOverviewMap
                ? lang === 'nl' ? 'Scrollende Kaart' : 'Scrolling Map'
                : lang === 'nl' ? 'Overzichtskaart' : 'Overview Map'}
            </span>
          </button>

          {/* Audio Toggle */}
          <button
            onClick={handleToggleSound}
            className={`p-2 rounded-lg border transition-colors ${
              isMuted
                ? 'bg-rose-950/60 text-rose-300 border-rose-800/60'
                : 'bg-slate-800 text-slate-300 hover:text-white border-slate-700'
            }`}
            title={isMuted ? 'Geluid Aanzetten' : 'Geluid Dempen'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* CRT Filter Toggle */}
          <button
            onClick={() => setShowCrtFilter(!showCrtFilter)}
            className={`p-2 rounded-lg border transition-colors ${
              showCrtFilter
                ? 'bg-blue-950/60 text-blue-300 border-blue-800/60'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
            title="CRT Scanlines Wisselen"
          >
            <Tv className="w-4 h-4" />
          </button>

          {/* Restart */}
          <button
            onClick={handleRestart}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
            title="Herstart Missie"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* History Dossier */}
          <button
            onClick={() => setShowHistory(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 text-xs font-semibold border border-blue-500/40 transition-colors"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{lang === 'nl' ? 'Dossier 1984' : 'Dossier'}</span>
          </button>
        </div>
      </header>

      {/* Main Game Screen & Cabinet Monitor Frame */}
      <main className="flex-1 flex flex-col items-center justify-center p-2 sm:p-4 max-w-5xl mx-auto w-full">
        {/* Game Mode Selector Tabs & Difficulty Selector */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 mb-3 w-full max-w-3xl">
          {/* Game Modes */}
          <div className="flex flex-wrap items-center justify-center gap-1.5">
            {[
              { id: 'capitals' as GameMode, label: lang === 'nl' ? '🏛️ Hoofdsteden' : '🏛️ Capitals' },
              { id: 'countries' as GameMode, label: lang === 'nl' ? '🌍 Landen Zoeken' : '🌍 Countries' },
              { id: 'cities' as GameMode, label: lang === 'nl' ? '⚓ Grote Steden & Havens' : '⚓ Major Ports' },
              { id: 'geo' as GameMode, label: lang === 'nl' ? '🏔️ Rivieren & Natuur' : '🏔️ Geography' },
              { id: 'free' as GameMode, label: lang === 'nl' ? '🗺️ Vrije Vlucht' : '🗺️ Free Flight' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleModeChange(tab.id)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all shadow-sm ${
                  currentMode === tab.id
                    ? 'bg-blue-600 text-white shadow-blue-500/30 border border-blue-400'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Difficulty Toggle (Moeilijk default vs Makkelijk) */}
          <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-lg border border-slate-800 shadow-sm">
            <span className="text-[10px] text-slate-400 font-mono px-1 hidden md:inline">
              {lang === 'nl' ? 'MODUS:' : 'DIFFICULTY:'}
            </span>
            <button
              onClick={() => {
                setDifficulty('hard');
                if (engineRef.current) engineRef.current.setDifficulty('hard');
              }}
              className={`px-2.5 py-1 rounded text-xs font-semibold font-mono transition-all ${
                difficulty === 'hard'
                  ? 'bg-amber-600 text-white border border-amber-400 shadow-sm shadow-amber-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title={
                lang === 'nl'
                  ? 'Moeilijk (Klassiek 1984): Geen cheat-stip op de radar/kaart. Zoek steden zelf op de blinde kaart!'
                  : 'Hard (Classic 1984): No beacon dot on radar or map. Find cities using geographic knowledge!'
              }
            >
              {lang === 'nl' ? '🎯 Moeilijk (Geen Baken)' : '🎯 Hard (No Beacon)'}
            </button>
            <button
              onClick={() => {
                setDifficulty('easy');
                if (engineRef.current) engineRef.current.setDifficulty('easy');
              }}
              className={`px-2.5 py-1 rounded text-xs font-semibold font-mono transition-all ${
                difficulty === 'easy'
                  ? 'bg-emerald-600 text-white border border-emerald-400 shadow-sm shadow-emerald-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title={
                lang === 'nl'
                  ? 'Makkelijk: Met knipperend rood navigatiebaken op de radar en overzichtskaart.'
                  : 'Easy: With pulsing red radar beacon dot on minimap and overview.'
              }
            >
              {lang === 'nl' ? '💡 Makkelijk (Met Baken)' : '💡 Easy (With Beacon)'}
            </button>
          </div>
        </div>

        {/* C64 Monitor Bezel Chassis */}
        <div className="relative w-full max-w-3xl bg-stone-900/90 rounded-2xl p-4 sm:p-6 shadow-2xl border-4 border-stone-800 ring-1 ring-white/10 flex flex-col items-center">
          {/* Top Monitor Bezel Decals */}
          <div className="w-full flex items-center justify-between mb-2 px-2 text-stone-400 text-xs font-mono">
            <div className="flex items-center gap-2">
              <span className="font-extrabold tracking-widest text-slate-300">COMMODORE 1702</span>
              <span className="text-[10px] px-1 bg-stone-800 rounded text-stone-400 border border-stone-700">
                COLOR MONITOR
              </span>
            </div>

            {/* 1541 Floppy Activity LED */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-stone-500">1541 DRIVE:</span>
              <div
                className={`w-2.5 h-2.5 rounded-full border transition-all ${
                  driveLedActive
                    ? 'bg-red-500 border-red-400 shadow-md shadow-red-500 animate-pulse'
                    : 'bg-emerald-600 border-emerald-500'
                }`}
              />
            </div>
          </div>

          {/* CRT Screen Outer Housing */}
          <div
            className={`relative w-full aspect-[4/3] max-h-[560px] bg-black rounded-xl overflow-hidden shadow-inner border-2 border-stone-700 ${
              showCrtFilter ? 'shadow-blue-500/10' : ''
            }`}
          >
            {/* Canvas Rendering 640x400 (scaled from 320x200 C64 display) */}
            <canvas
              ref={canvasRef}
              width={640}
              height={400}
              onClick={() => {
                const engine = engineRef.current;
                if (engine && engine.isGameOver) {
                  engine.resetGame();
                }
              }}
              className="w-full h-full object-contain block image-rendering-pixelated cursor-crosshair"
            />

            {/* CRT Phosphor Scanline Overlay */}
            {showCrtFilter && (
              <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,_transparent_60%,_rgba(0,0,0,0.5)_100%)] mix-blend-multiply" />
            )}
          </div>

          {/* Monitor Badge & Rainbow Logo */}
          <div className="w-full flex items-center justify-between mt-3 px-2">
            <div className="flex items-center gap-1.5">
              <div className="flex h-2 w-8 rounded overflow-hidden">
                <span className="w-2 bg-red-600" />
                <span className="w-2 bg-amber-500" />
                <span className="w-2 bg-green-600" />
                <span className="w-2 bg-blue-600" />
              </div>
              <span className="text-[11px] font-mono tracking-widest font-bold text-stone-300">
                RADARSOFT • 64K
              </span>
            </div>

            <div className="text-[11px] font-mono text-stone-400 flex items-center gap-3">
              <span>SCORE: <strong className="text-amber-400">{score}</strong></span>
              <span>RECORD: <strong className="text-emerald-400">{highScore}</strong></span>
            </div>
          </div>
        </div>

        {/* Bottom Interactive Touch & Quick Controls for Desktop & Mobile */}
        <div className="mt-4 w-full max-w-3xl grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Quick Action: Stijgen / Dalen */}
          <button
            onClick={handleTakeoffLandClick}
            className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm shadow-lg transition-all border ${
              flightStatus === 'landed'
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-400 shadow-emerald-600/30'
                : 'bg-amber-600 hover:bg-amber-500 text-white border-amber-400 shadow-amber-600/30 animate-pulse'
            }`}
          >
            <span>🚁</span>
            <span>
              {flightStatus === 'landed'
                ? lang === 'nl'
                  ? 'OPSTIJGEN (Spatiebalk)'
                  : 'TAKE OFF (Spacebar)'
                : lang === 'nl'
                ? 'LANDEN OP STAD (Spatie)'
                : 'TOUCHDOWN / LAND (Space)'}
            </span>
          </button>

          {/* Quick Action: Toon Steden / Hint */}
          <button
            onClick={handleHintClick}
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold text-sm bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-cyan-500/40 shadow-lg shadow-cyan-500/10 transition-colors"
          >
            <MapPin className="w-4 h-4 text-cyan-400" />
            <span>{lang === 'nl' ? 'TOON STEDEN (Toets H)' : 'SHOW CITIES (Key H)'}</span>
          </button>

          {/* Telemetry Indicator Card */}
          <div className="flex items-center justify-between px-4 py-2 bg-slate-900/90 rounded-xl border border-slate-800 text-xs font-mono">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-400" />
              <span>KEROSINE:</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-24 h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-700">
                <div
                  className={`h-full transition-all ${
                    fuel > 40 ? 'bg-emerald-500' : fuel > 20 ? 'bg-amber-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${fuel}%` }}
                />
              </div>
              <span className="w-8 text-right font-bold">{fuel}%</span>
            </div>
          </div>
        </div>

        {/* Keyboard and Gamepad Instructions Box */}
        <div className="mt-3 w-full max-w-3xl text-center text-xs text-slate-400 font-mono space-y-1">
          <p>
            🎮 <strong>{lang === 'nl' ? 'Besturing:' : 'Controls:'}</strong>{' '}
            {lang === 'nl'
              ? 'Pijltjestoetsen / WASD = Helikopter Vliegen • Spatiebalk = Opstijgen / Landen • H = Toon Steden • B = Wissel Moeilijkheid • O / Tab = Wissel Overzicht • R = Herstart'
              : 'Arrow Keys / WASD = Fly Chopper • Spacebar = Take Off / Land • H = Show Cities • B = Toggle Difficulty • O / Tab = Toggle Overview • R = Restart'}
          </p>
          <p className="text-[11px] text-slate-500">
            {lang === 'nl'
              ? '💡 Tip: In Moeilijk (Standaard) zoek je steden zelf op de kaart zonder baken (zoals in 1984). In Makkelijk wijst een rood baken de locatie.'
              : '💡 Tip: In Hard mode (Default), find locations using geography without a beacon (as in 1984). In Easy mode, a red beacon guides you.'}
          </p>
        </div>
      </main>

      {/* History Modal */}
      <TopografieEuropaHistoryModal
        isOpen={showHistory}
        onClose={() => setShowHistory(false)}
        lang={lang}
      />
    </div>
  );
};
