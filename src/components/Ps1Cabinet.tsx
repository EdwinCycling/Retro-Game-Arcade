/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Sony PlayStation 1 (PS1 / 1994) Arcade Cabinet Showcase Component
 * Features classic matte gray console body, CD lid open/spin animation,
 * DualShock controller overlay, authentic PS1 boot sequence, and 3D games!
 */

import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Disc, Volume2, VolumeX, Sparkles, BookOpen, Trophy } from 'lucide-react';
import { PS1_DISCS, Ps1DiscId } from '../game/ps1Types';
import { ps1Audio } from '../game/ps1Audio';
import { Ps1CrashEngine } from '../game/ps1CrashEngine';
import { Ps1RidgeRacerEngine } from '../game/ps1RidgeRacerEngine';
import { getPs1HighScores, savePs1HighScore } from '../game/ps1HighScores';
import { Ps1HistoryModal } from './Ps1HistoryModal';
import { gamepadManager } from '../utils/gamepadManager';

interface Ps1CabinetProps {
  initialDisc?: Ps1DiscId;
  onExit?: () => void;
  onBackToLobby?: () => void;
  lang?: 'nl' | 'en';
}

export const Ps1Cabinet: React.FC<Ps1CabinetProps> = ({
  initialDisc = 'crash_bandicoot',
  onExit,
  onBackToLobby,
  lang = 'nl'
}) => {
  const handleExit = onExit || onBackToLobby || (() => {});
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Engine Instances
  const crashEngineRef = useRef<Ps1CrashEngine | null>(null);
  const ridgeEngineRef = useRef<Ps1RidgeRacerEngine | null>(null);

  // States
  const [selectedDisc, setSelectedDisc] = useState<Ps1DiscId>(initialDisc);
  const [isBooting, setIsBooting] = useState<boolean>(true);
  const [bootStep, setBootStep] = useState<number>(1); // 1=Sony SCE Logo, 2=PlayStation Logo, 3=Game Started
  const [isLidOpen, setIsLidOpen] = useState<boolean>(false);
  const [isDiscMenuOpen, setIsDiscMenuOpen] = useState<boolean>(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [isHighScoreOpen, setIsHighScoreOpen] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Live HUD Stats
  const [score, setScore] = useState<number>(0);
  const [wumpas, setWumpas] = useState<number>(0);
  const [lives, setLives] = useState<number>(3);
  const [crates, setCrates] = useState<number>(0);
  const [totalCrates, setTotalCrates] = useState<number>(0);
  const [levelName, setLevelName] = useState<string>('1. N. Sanity Beach');

  const activeDisc = PS1_DISCS[selectedDisc];

  // 1. Audio Mute Toggle
  useEffect(() => {
    ps1Audio.setMuted(isMuted);
  }, [isMuted]);

  // 2. Sony PS1 Boot Sequence Trigger
  useEffect(() => {
    triggerBootSequence();
  }, [selectedDisc]);

  const triggerBootSequence = () => {
    setIsBooting(true);
    setBootStep(1);
    ps1Audio.playPs1BootChime();

    // Step 1 -> Step 2 (SCE Logo to PlayStation Logo)
    const timer1 = setTimeout(() => {
      setBootStep(2);
    }, 2200);

    // Step 2 -> Step 3 (Launch Game)
    const timer2 = setTimeout(() => {
      setIsBooting(false);
      setBootStep(3);
    }, 4200);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  };

  // 3. Initialize Game Engine when boot finishes
  useEffect(() => {
    if (isBooting || !canvasRef.current) return;

    // Cleanup previous engines
    if (crashEngineRef.current) {
      crashEngineRef.current.destroy();
      crashEngineRef.current = null;
    }
    if (ridgeEngineRef.current) {
      ridgeEngineRef.current.destroy();
      ridgeEngineRef.current = null;
    }

    if (selectedDisc === 'crash_bandicoot') {
      const engine = new Ps1CrashEngine(canvasRef.current);
      engine.init();
      crashEngineRef.current = engine;
    } else if (selectedDisc === 'ridge_racer') {
      const engine = new Ps1RidgeRacerEngine(canvasRef.current);
      engine.init();
      ridgeEngineRef.current = engine;
    }

    // Gamepad Polling Loop
    gamepadManager.start('ps1');

    const interval = setInterval(() => {
      const snapshot = gamepadManager.getSnapshot();

      if (crashEngineRef.current) {
        setScore(crashEngineRef.current.score);
        setWumpas(crashEngineRef.current.wumpaCount);
        setLives(crashEngineRef.current.lives);
        setCrates(crashEngineRef.current.cratesBroken);
        setTotalCrates(crashEngineRef.current.totalCrates);
        setLevelName(crashEngineRef.current.currentLevelName);

        // Read Direction from D-Pad or Left Stick
        let moveX = snapshot.leftStick.x;
        if (snapshot.buttons.has('DpadLeft')) moveX = -1;
        else if (snapshot.buttons.has('DpadRight')) moveX = 1;

        let moveY = snapshot.leftStick.y;
        if (snapshot.buttons.has('DpadUp')) moveY = -1;
        else if (snapshot.buttons.has('DpadDown')) moveY = 1;

        const jump = snapshot.buttons.has('A') || snapshot.buttons.has('Y') || snapshot.rt > 0.3;
        const spin = snapshot.buttons.has('B') || snapshot.buttons.has('X') || snapshot.buttons.has('LB') || snapshot.buttons.has('RB') || snapshot.lt > 0.3;

        // Feed Xbox Controller input to Crash
        crashEngineRef.current.updateInputsFromGamepad(
          moveX,
          moveY,
          jump,
          spin
        );
      } else if (ridgeEngineRef.current) {
        setScore(Math.floor(ridgeEngineRef.current.carSpeed));

        let steerX = snapshot.leftStick.x;
        if (snapshot.buttons.has('DpadLeft')) steerX = -1;
        else if (snapshot.buttons.has('DpadRight')) steerX = 1;

        const accel = snapshot.buttons.has('A') || snapshot.buttons.has('DpadUp') || snapshot.rt > 0.2 || snapshot.leftStick.y < -0.3;
        const brake = snapshot.buttons.has('B') || snapshot.buttons.has('X') || snapshot.buttons.has('DpadDown') || snapshot.lt > 0.2 || snapshot.leftStick.y > 0.3;

        ridgeEngineRef.current.updateInputsFromGamepad(
          steerX,
          accel,
          brake
        );
      }
    }, 30);

    return () => {
      gamepadManager.stop();
      clearInterval(interval);
      if (crashEngineRef.current) crashEngineRef.current.destroy();
      if (ridgeEngineRef.current) ridgeEngineRef.current.destroy();
    };
  }, [isBooting, selectedDisc]);

  const switchDisc = (id: Ps1DiscId) => {
    setSelectedDisc(id);
    setIsDiscMenuOpen(false);
  };

  return (
    <div className="relative min-h-screen w-full bg-slate-950 text-white flex flex-col items-center justify-between p-2 sm:p-4 select-none overflow-x-hidden font-sans">
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
            <span className="text-xl">🎮</span>
            <div>
              <h1 className="text-xs sm:text-sm font-black tracking-wide text-white flex items-center space-x-1.5">
                <span>SONY PLAYSTATION 1</span>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-400/30 font-mono">
                  32-BIT CD-ROM
                </span>
              </h1>
              <p className="text-[10px] text-slate-400 truncate max-w-[200px] sm:max-w-xs">
                {activeDisc.title}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Toolbar Buttons */}
        <div className="flex items-center space-x-1.5">
          {/* Disc Changer */}
          <button
            onClick={() => setIsDiscMenuOpen(!isDiscMenuOpen)}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-500/50 text-indigo-300 rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer"
          >
            <Disc className="w-4 h-4 text-indigo-400 animate-spin" style={{ animationDuration: '6s' }} />
            <span>{lang === 'nl' ? 'Game Discs' : 'Game Discs'}</span>
          </button>

          {/* CD Lid Toggle */}
          <button
            onClick={() => setIsLidOpen(!isLidOpen)}
            className="p-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-xl transition-all cursor-pointer"
            title={lang === 'nl' ? 'CD Klep Openen / Sluiten' : 'Open / Close CD Lid'}
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
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

      {/* Disc Selection Drawer */}
      {isDiscMenuOpen && (
        <div className="w-full max-w-5xl bg-slate-900/95 border-2 border-indigo-500/50 rounded-2xl p-4 mb-2 shadow-2xl backdrop-blur-md z-30 animate-fadeIn">
          <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
            <div className="flex items-center space-x-2">
              <Disc className="w-5 h-5 text-indigo-400" />
              <h3 className="text-sm font-bold text-white">
                {lang === 'nl' ? 'PS1 CD-ROM Disc Collectie' : 'PS1 CD-ROM Disc Collection'}
              </h3>
            </div>
            <button
              onClick={() => setIsDiscMenuOpen(false)}
              className="text-xs text-slate-400 hover:text-white cursor-pointer"
            >
              ✕ Sluiten
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {Object.values(PS1_DISCS).map(disc => {
              const isCurrent = disc.id === selectedDisc;
              return (
                <button
                  key={disc.id}
                  onClick={() => switchDisc(disc.id)}
                  className={`flex flex-col text-left p-3 rounded-xl border transition-all cursor-pointer ${
                    isCurrent
                      ? 'bg-indigo-950/80 border-indigo-400 shadow-lg ring-2 ring-indigo-500/30'
                      : 'bg-slate-800/60 hover:bg-slate-800 border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xl">{disc.discArtworkIcon}</span>
                    <span className="text-[10px] font-mono text-indigo-400 font-bold">{disc.year}</span>
                  </div>
                  <h4 className="text-xs font-black text-white">{disc.title}</h4>
                  <p className="text-[10px] text-slate-400 line-clamp-2 mt-1">
                    {disc.summary[lang]}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Console Showcase Container */}
      <div className="w-full max-w-4xl bg-slate-900 border-4 border-slate-800 rounded-3xl p-4 sm:p-6 shadow-2xl flex flex-col items-center relative my-auto">
        {/* Memory Card Slot & Power Buttons Row */}
        <div className="w-full flex items-center justify-between bg-slate-950/80 border border-slate-800 px-4 py-2 rounded-2xl mb-4">
          <div className="flex items-center space-x-3">
            {/* Memory Card 1 */}
            <div className="flex items-center space-x-1.5 px-2.5 py-1 bg-slate-800 border border-slate-700 rounded-lg text-[10px] font-mono text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>MEM CARD 1: 1MB (15 BLOCKS)</span>
            </div>
          </div>

          {/* Console Power LED */}
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-bold text-slate-400">POWER</span>
            <span className="w-3 h-3 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
          </div>
        </div>

        {/* 3D CRT Game Display Monitor */}
        <div className="relative w-full aspect-[4/3] max-w-2xl bg-black rounded-2xl overflow-hidden border-4 border-slate-800 shadow-inner flex items-center justify-center">
          {/* Sony PS1 Boot Sequence Overlay */}
          {isBooting ? (
            <div className="absolute inset-0 bg-black flex flex-col items-center justify-center p-6 text-center z-20 animate-fadeIn">
              {bootStep === 1 && (
                <div className="flex flex-col items-center space-y-4 animate-scaleUp">
                  <div className="text-4xl font-extrabold tracking-widest text-slate-200">
                    SONY
                  </div>
                  <div className="text-xs text-slate-400 tracking-wider">
                    COMPUTER ENTERTAINMENT
                  </div>
                </div>
              )}
              {bootStep === 2 && (
                <div className="flex flex-col items-center space-y-4 animate-fadeIn">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-red-500 via-yellow-400 to-indigo-600 flex items-center justify-center text-3xl font-black text-white shadow-xl">
                    PS
                  </div>
                  <div className="text-lg font-black tracking-wider text-slate-100">
                    PlayStation
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    LICENSED BY SONY COMPUTER ENTERTAINMENT INC.
                  </div>
                </div>
              )}
            </div>
          ) : null}

          {/* Canvas for 3D Game Engine */}
          <canvas
            ref={canvasRef}
            width={640}
            height={480}
            className="w-full h-full object-contain bg-slate-950"
          />

          {/* CRT Scanline Overlay Effect */}
          <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px] opacity-40" />

          {/* Crash Bandicoot Live HUD Overlay */}
          {!isBooting && selectedDisc === 'crash_bandicoot' && (
            <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none z-10 text-xs font-black drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
              <div className="flex items-center space-x-3 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-xl border border-slate-700/80">
                <div className="flex items-center space-x-1 text-orange-400">
                  <span>🥭</span>
                  <span>{wumpas} / 100</span>
                </div>
                <div className="flex items-center space-x-1 text-sky-400">
                  <span>🦊</span>
                  <span>x{lives}</span>
                </div>
                <div className="flex items-center space-x-1 text-amber-400">
                  <span>📦</span>
                  <span>{crates} / {totalCrates}</span>
                </div>
              </div>

              <div className="bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-xl border border-slate-700/80 text-emerald-400 font-mono">
                {levelName}
              </div>
            </div>
          )}
        </div>

        {/* DualShock Controller Visuals & Keyboard Help */}
        <div className="w-full max-w-2xl mt-4 bg-slate-950 border border-slate-800 rounded-2xl p-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 bg-slate-800 rounded font-mono text-slate-200">WASD / Pijltjes</span>
            <span>= Bewegen</span>
          </div>

          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 bg-sky-900/60 text-sky-300 border border-sky-500/40 rounded font-mono">Spatie / X</span>
            <span>= Springen</span>
            <span className="px-2 py-0.5 bg-amber-900/60 text-amber-300 border border-amber-500/40 rounded font-mono">Z / J</span>
            <span>= Spin Attack</span>
          </div>

          <div className="flex items-center space-x-1 text-indigo-400 font-bold">
            <span>🎮 Xbox Controller Compatible</span>
          </div>
        </div>
      </div>

      {/* History Modal */}
      <Ps1HistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        lang={lang}
      />

      {/* High Scores Modal */}
      {isHighScoreOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-yellow-500/50 rounded-3xl max-w-md w-full p-6 text-white shadow-2xl">
            <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-2">
              <div className="flex items-center space-x-2">
                <Trophy className="w-5 h-5 text-yellow-400" />
                <h3 className="font-bold">PS1 Memory Card High Scores</h3>
              </div>
              <button onClick={() => setIsHighScoreOpen(false)}>✕</button>
            </div>

            <div className="space-y-2">
              {getPs1HighScores().map((hs, i) => (
                <div key={i} className="flex items-center justify-between p-2 bg-slate-800/60 rounded-xl text-xs">
                  <div>
                    <div className="font-bold text-slate-200">{hs.gameTitle}</div>
                    <div className="text-[10px] text-slate-400">{hs.wumpasOrLap}</div>
                  </div>
                  <div className="font-mono text-yellow-400 font-bold">{hs.score} PTS</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
