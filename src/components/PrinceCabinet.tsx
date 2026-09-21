/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Prince of Persia (1989/1990) - Arcade Cabinet & Interactive Game Experience
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { 
  ArrowLeft, Volume2, VolumeX, RotateCcw, Shield, Sparkles, 
  Sliders, Trophy, BookOpen, Zap, Info, Play, Pause, Swords, ChevronUp, ChevronDown, ChevronLeft, ChevronRight 
} from 'lucide-react';
import { PrinceEngine } from '../game/princeEngine';
import { PrinceRenderer } from '../game/princeRenderer';
import { princeAudio } from '../game/princeAudio';
import { getPrinceScores, addPrinceScore, PrinceScore } from '../game/princeHighScores';
import { PrinceHistoryModal } from './PrinceHistoryModal';
import { haptics } from '../utils/haptics';

interface PrinceCabinetProps {
  onBackToLobby: () => void;
  lang?: 'nl' | 'en';
}

export const PrinceCabinet: React.FC<PrinceCabinetProps> = ({ onBackToLobby, lang = 'nl' }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<PrinceEngine | null>(null);
  const rendererRef = useRef<PrinceRenderer | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const [isMuted, setIsMuted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isDossierOpen, setIsDossierOpen] = useState(false);
  const [isHighScoresOpen, setIsHighScoresOpen] = useState(false);
  const [highScores, setHighScores] = useState<PrinceScore[]>([]);

  // Trainer & Settings
  const [settings, setSettings] = useState<{
    infiniteTime: boolean;
    invincible: boolean;
    startWithSword: boolean;
    crtFilter: boolean;
    scanlines: boolean;
    outfitSkin: 'rose_ribbon' | 'classic' | 'royal_blue';
  }>({
    infiniteTime: false,
    invincible: false,
    startWithSword: false,
    crtFilter: true,
    scanlines: true,
    outfitSkin: 'rose_ribbon',
  });
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [isDeadState, setIsDeadState] = useState(false);
  const [deathReasonState, setDeathReasonState] = useState('');

  // Key tracking
  const keysRef = useRef<Record<string, boolean>>({});

  // Initialize engine & renderer
  useEffect(() => {
    const engine = new PrinceEngine();
    engine.settings = { ...settings };
    engineRef.current = engine;
    setHighScores(getPrinceScores());

    if (canvasRef.current) {
      rendererRef.current = new PrinceRenderer(canvasRef.current);
    }

    // Keyboard handlers
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent browser scroll on arrow keys
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
        e.preventDefault();
      }
      keysRef.current[e.code] = true;
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current[e.code] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // Animation loop
    const loop = () => {
      if (engineRef.current && rendererRef.current && !isPaused) {
        engineRef.current.update(keysRef.current);
        rendererRef.current.render(engineRef.current);

        if (engineRef.current.isDead !== isDeadState) {
          setIsDeadState(engineRef.current.isDead);
          if (engineRef.current.isDead) {
            setDeathReasonState(engineRef.current.deathReason || (lang === 'nl' ? 'DE PRINS IS GESNEUVELD' : 'THE PRINCE IS SLAIN'));
          }
        }
      }
      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPaused, isDeadState, lang]);

  // Sync settings with engine
  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.settings = { ...settings };
    }
  }, [settings]);

  const handleRespawn = useCallback(() => {
    haptics.medium();
    if (engineRef.current) {
      engineRef.current.respawn();
      setIsDeadState(false);
    }
  }, []);

  const handleResetGame = useCallback(() => {
    haptics.medium();
    if (engineRef.current) {
      engineRef.current.initLevel(1);
      setIsDeadState(false);
    }
  }, []);

  const handleToggleMute = useCallback(() => {
    haptics.light();
    const muted = princeAudio.toggleMute();
    setIsMuted(muted);
  }, []);

  // Touch virtual controls
  const handleTouchDown = (key: string) => {
    haptics.light();
    keysRef.current[key] = true;
  };

  const handleTouchUp = (key: string) => {
    keysRef.current[key] = false;
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-between p-2 sm:p-4 font-mono select-none overflow-x-hidden">
      {/* Top Header Bar */}
      <header className="w-full max-w-5xl flex items-center justify-between py-2 px-3 sm:px-4 rounded-2xl bg-neutral-950 border border-neutral-800 shadow-xl mb-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBackToLobby}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 text-neutral-300 hover:text-white text-xs transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{lang === 'nl' ? 'Speelhal' : 'Lobby'}</span>
          </button>

          <div className="hidden sm:flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
              <Swords className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-xs sm:text-sm font-black text-white tracking-wider flex items-center gap-2">
                PRINCE OF PERSIA
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500 text-black font-bold">1989/1990</span>
              </h1>
              <p className="text-[10px] text-neutral-400">MS-DOS VGA • Jordan Mechner • Brøderbund</p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setShowSettingsMenu(!showSettingsMenu)}
            className={`p-2 rounded-xl border text-xs transition-colors cursor-pointer ${
              showSettingsMenu ? 'bg-amber-500 text-black border-amber-400' : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
            }`}
            title="Trainer & Settings"
          >
            <Sliders className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => setIsHighScoresOpen(true)}
            className="p-2 rounded-xl bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 text-neutral-400 hover:text-white text-xs transition-colors cursor-pointer"
            title="High Scores"
          >
            <Trophy className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => setIsDossierOpen(true)}
            className="p-2 rounded-xl bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 text-neutral-400 hover:text-white text-xs transition-colors cursor-pointer"
            title="Dossier"
          >
            <BookOpen className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleToggleMute}
            className="p-2 rounded-xl bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 text-neutral-400 hover:text-white text-xs transition-colors cursor-pointer"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>

          <button
            type="button"
            onClick={handleResetGame}
            className="p-2 rounded-xl bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 text-neutral-400 hover:text-white text-xs transition-colors cursor-pointer"
            title="Reset Game"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Trainer & Settings Drawer */}
      {showSettingsMenu && (
        <div className="w-full max-w-5xl p-3 sm:p-4 rounded-2xl bg-neutral-950 border border-amber-500/30 shadow-2xl mb-3 flex flex-wrap gap-4 items-center justify-between text-xs">
          <div className="flex flex-wrap items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.infiniteTime}
                onChange={(e) => setSettings({ ...settings, infiniteTime: e.target.checked })}
                className="rounded border-neutral-700 text-amber-500 focus:ring-0"
              />
              <span className="text-neutral-300">{lang === 'nl' ? 'Oneindige Tijd' : 'Infinite Time'}</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.invincible}
                onChange={(e) => setSettings({ ...settings, invincible: e.target.checked })}
                className="rounded border-neutral-700 text-amber-500 focus:ring-0"
              />
              <span className="text-neutral-300">{lang === 'nl' ? 'Onkwetsbaar (God Mode)' : 'Invincible'}</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.startWithSword}
                onChange={(e) => setSettings({ ...settings, startWithSword: e.target.checked })}
                className="rounded border-neutral-700 text-amber-500 focus:ring-0"
              />
              <span className="text-neutral-300">{lang === 'nl' ? 'Start met Zwaard' : 'Start with Sword'}</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.scanlines}
                onChange={(e) => setSettings({ ...settings, scanlines: e.target.checked })}
                className="rounded border-neutral-700 text-amber-500 focus:ring-0"
              />
              <span className="text-neutral-300">CRT Scanlines</span>
            </label>
          </div>

          {/* Outfit Skin Selector */}
          <div className="flex items-center gap-2 w-full pt-2 border-t border-neutral-800/80">
            <span className="text-rose-400 font-bold text-[11px] whitespace-nowrap">
              {lang === 'nl' ? 'Prins Outfit & Stijl:' : 'Prince Outfit & Style:'}
            </span>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => setSettings({ ...settings, outfitSkin: 'rose_ribbon' })}
                className={`px-2.5 py-1 rounded text-[10px] font-bold transition-all ${
                  settings.outfitSkin === 'rose_ribbon'
                    ? 'bg-rose-600 text-white shadow-[0_0_10px_rgba(244,63,94,0.6)]'
                    : 'bg-neutral-900 border border-neutral-700 text-neutral-300 hover:text-white'
                }`}
              >
                🌸 {lang === 'nl' ? 'Roze Zijden Lint (Zoals Plaatje)' : 'Rose Silk Ribbon'}
              </button>
              <button
                type="button"
                onClick={() => setSettings({ ...settings, outfitSkin: 'royal_blue' })}
                className={`px-2.5 py-1 rounded text-[10px] font-bold transition-all ${
                  settings.outfitSkin === 'royal_blue'
                    ? 'bg-blue-600 text-white shadow-[0_0_10px_rgba(37,99,235,0.6)]'
                    : 'bg-neutral-900 border border-neutral-700 text-neutral-300 hover:text-white'
                }`}
              >
                👑 {lang === 'nl' ? 'Koninklijk Blauw Vest' : 'Royal Blue Vest'}
              </button>
              <button
                type="button"
                onClick={() => setSettings({ ...settings, outfitSkin: 'classic' })}
                className={`px-2.5 py-1 rounded text-[10px] font-bold transition-all ${
                  settings.outfitSkin === 'classic'
                    ? 'bg-red-600 text-white shadow-[0_0_10px_rgba(220,38,38,0.6)]'
                    : 'bg-neutral-900 border border-neutral-700 text-neutral-300 hover:text-white'
                }`}
              >
                🗡️ {lang === 'nl' ? 'Klassiek Rood & Wit' : 'Classic Crimson'}
              </button>
            </div>
          </div>

          {/* Level Warp Buttons */}
          <div className="flex items-center gap-2 w-full pt-2 border-t border-neutral-800/80">
            <span className="text-amber-400 font-bold text-[11px] whitespace-nowrap">
              {lang === 'nl' ? 'Kies Level / Kerker:' : 'Select Level:'}
            </span>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => engineRef.current?.initLevel(1)}
                className="px-2 py-1 rounded bg-neutral-900 border border-neutral-700 hover:border-amber-500 text-[10px] text-neutral-300 hover:text-white"
              >
                1. {lang === 'nl' ? 'Kerkercel' : 'Dungeon'}
              </button>
              <button
                type="button"
                onClick={() => engineRef.current?.initLevel(2)}
                className="px-2 py-1 rounded bg-neutral-900 border border-neutral-700 hover:border-amber-500 text-[10px] text-neutral-300 hover:text-white"
              >
                2. {lang === 'nl' ? 'Paleiskluis' : 'Vault'}
              </button>
              <button
                type="button"
                onClick={() => engineRef.current?.initLevel(3)}
                className="px-2 py-1 rounded bg-amber-950/60 border border-amber-500/80 hover:bg-amber-800 text-[10px] text-amber-200 font-bold"
              >
                3. 💀 {lang === 'nl' ? 'Het Skelet (Level 3)' : 'The Skeleton (Level 3)'}
              </button>
              <button
                type="button"
                onClick={() => engineRef.current?.initLevel(4)}
                className="px-2 py-1 rounded bg-indigo-950/60 border border-indigo-500/80 hover:bg-indigo-800 text-[10px] text-indigo-200 font-bold"
              >
                4. 🪞 {lang === 'nl' ? 'Spiegel & Schaduwprins (Level 4)' : 'Mirror & Shadow (Level 4)'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Arcade Bezel & Screen Frame */}
      <main className="w-full max-w-4xl flex-1 flex flex-col items-center justify-center relative">
        <div className="relative p-2 sm:p-4 rounded-3xl bg-gradient-to-b from-neutral-900 via-neutral-950 to-neutral-900 border-4 border-amber-950/80 shadow-[0_0_60px_rgba(245,158,11,0.2)] flex flex-col items-center">
          {/* Authentic Marquee Trim */}
          <div className="w-full flex items-center justify-between px-3 py-1 mb-2 bg-gradient-to-r from-amber-900/60 via-amber-600/40 to-amber-900/60 rounded-lg border border-amber-500/30">
            <span className="text-[9px] font-black text-amber-300 tracking-widest uppercase">
              {lang === 'nl' ? 'DE KERKERS VAN JAFFAR' : 'THE DUNGEONS OF JAFFAR'}
            </span>
            <span className="text-[9px] font-mono text-amber-200">
              60 FPS • ROTOR-SCAN
            </span>
          </div>

          {/* Game Canvas (Native 320x200 aspect ratio) */}
          <div className="relative overflow-hidden rounded-xl border-2 border-neutral-800 shadow-inner bg-black w-full max-w-[640px] aspect-[16/10]">
            <canvas
              ref={canvasRef}
              width={640}
              height={400}
              className="w-full h-full block object-contain image-rendering-pixelated cursor-crosshair"
            />

            {/* Death / Game Over Respawn Overlay */}
            {isDeadState && (
              <div 
                onClick={handleRespawn}
                className="absolute inset-0 bg-black/85 backdrop-blur-xs flex flex-col items-center justify-center p-4 text-center z-30 cursor-pointer animate-in fade-in duration-200"
              >
                <div className="w-12 h-12 rounded-full bg-red-950/80 border-2 border-red-500 flex items-center justify-center text-2xl mb-2 animate-bounce">
                  💀
                </div>
                <h2 className="text-lg sm:text-xl font-black text-red-500 tracking-wider mb-1 font-mono">
                  {lang === 'nl' ? 'JE BENT GESNEUVELD!' : 'THE PRINCE IS SLAIN!'}
                </h2>
                <p className="text-xs text-amber-300 font-mono mb-4 px-3 py-1 bg-neutral-900/90 rounded border border-amber-500/30">
                  {deathReasonState}
                </p>
                
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRespawn();
                  }}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 via-amber-600 to-red-600 hover:brightness-110 text-white font-mono font-black text-xs sm:text-sm tracking-wider shadow-[0_0_20px_rgba(239,68,68,0.6)] flex items-center gap-2 cursor-pointer active:scale-95 transition-transform"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>{lang === 'nl' ? 'HERSTART / PROBEER OPNIEUW' : 'RESPAWN / TRY AGAIN'}</span>
                </button>
                <span className="text-[10px] text-neutral-400 mt-2 font-mono">
                  {lang === 'nl' ? 'Druk op SPATIE of klik op het scherm' : 'Press SPACE or tap anywhere to respawn'}
                </span>
              </div>
            )}
          </div>

          {/* Bottom Bezel Coin-Op Emblem */}
          <div className="w-full flex items-center justify-between px-4 py-1.5 mt-2 text-[10px] text-neutral-500 border-t border-neutral-800/80">
            <span>JORDAN MECHNER • BRØDERBUND SOFTWARE</span>
            <span className="text-amber-500/80 font-bold">1989 - 1990 MS-DOS</span>
          </div>
        </div>

        {/* Virtual Touch Controller (Mobile & Tablet) */}
        <div className="w-full max-w-xl grid grid-cols-2 gap-4 mt-4 sm:hidden">
          {/* Directional Pad */}
          <div className="grid grid-cols-3 gap-1.5 p-2 rounded-2xl bg-neutral-950 border border-neutral-800">
            <div />
            <button
              type="button"
              onTouchStart={() => handleTouchDown('ArrowUp')}
              onTouchEnd={() => handleTouchUp('ArrowUp')}
              onMouseDown={() => handleTouchDown('ArrowUp')}
              onMouseUp={() => handleTouchUp('ArrowUp')}
              className="p-3 rounded-xl bg-neutral-900 active:bg-amber-500 active:text-black text-white flex items-center justify-center font-bold"
            >
              <ChevronUp className="w-5 h-5" />
            </button>
            <div />

            <button
              type="button"
              onTouchStart={() => handleTouchDown('ArrowLeft')}
              onTouchEnd={() => handleTouchUp('ArrowLeft')}
              onMouseDown={() => handleTouchDown('ArrowLeft')}
              onMouseUp={() => handleTouchUp('ArrowLeft')}
              className="p-3 rounded-xl bg-neutral-900 active:bg-amber-500 active:text-black text-white flex items-center justify-center font-bold"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="p-2 rounded-xl bg-neutral-950 flex items-center justify-center text-[10px] text-neutral-600">PAD</div>
            <button
              type="button"
              onTouchStart={() => handleTouchDown('ArrowRight')}
              onTouchEnd={() => handleTouchUp('ArrowRight')}
              onMouseDown={() => handleTouchDown('ArrowRight')}
              onMouseUp={() => handleTouchUp('ArrowRight')}
              className="p-3 rounded-xl bg-neutral-900 active:bg-amber-500 active:text-black text-white flex items-center justify-center font-bold"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            <div />
            <button
              type="button"
              onTouchStart={() => handleTouchDown('ArrowDown')}
              onTouchEnd={() => handleTouchUp('ArrowDown')}
              onMouseDown={() => handleTouchDown('ArrowDown')}
              onMouseUp={() => handleTouchUp('ArrowDown')}
              className="p-3 rounded-xl bg-neutral-900 active:bg-amber-500 active:text-black text-white flex items-center justify-center font-bold"
            >
              <ChevronDown className="w-5 h-5" />
            </button>
            <div />
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2 p-2 rounded-2xl bg-neutral-950 border border-neutral-800">
            <button
              type="button"
              onTouchStart={() => handleTouchDown('ShiftLeft')}
              onTouchEnd={() => handleTouchUp('ShiftLeft')}
              onMouseDown={() => handleTouchDown('ShiftLeft')}
              onMouseUp={() => handleTouchUp('ShiftLeft')}
              className="p-2.5 rounded-xl bg-neutral-900 active:bg-emerald-500 active:text-black text-white flex flex-col items-center justify-center text-xs font-bold"
            >
              <span>TIPTOE</span>
              <span className="text-[9px] text-neutral-500">HANG</span>
            </button>

            <button
              type="button"
              onTouchStart={() => handleTouchDown('ArrowUp')}
              onTouchEnd={() => handleTouchUp('ArrowUp')}
              onMouseDown={() => handleTouchDown('ArrowUp')}
              onMouseUp={() => handleTouchUp('ArrowUp')}
              className="p-2.5 rounded-xl bg-neutral-900 active:bg-blue-500 active:text-black text-white flex flex-col items-center justify-center text-xs font-bold"
            >
              <span>JUMP</span>
              <span className="text-[9px] text-neutral-500">CLIMB</span>
            </button>

            <button
              type="button"
              onTouchStart={() => handleTouchDown('Space')}
              onTouchEnd={() => handleTouchUp('Space')}
              onMouseDown={() => handleTouchDown('Space')}
              onMouseUp={() => handleTouchUp('Space')}
              className="col-span-2 p-3 rounded-xl bg-amber-600 active:bg-amber-400 text-black flex items-center justify-center text-xs font-black gap-1.5"
            >
              <Swords className="w-4 h-4" />
              <span>STRIKE / DRAW SWORD</span>
            </button>
          </div>
        </div>

        {/* Desktop Keyboard Quick Guide */}
        <div className="hidden sm:flex items-center justify-center gap-6 mt-3 text-[11px] text-neutral-400">
          <div><strong className="text-amber-400">← →:</strong> {lang === 'nl' ? 'Rennen' : 'Run'}</div>
          <div><strong className="text-amber-400">Shift:</strong> {lang === 'nl' ? 'Behoedzaam (Spikes!) / Hang' : 'Tiptoe / Hang'}</div>
          <div><strong className="text-amber-400">↑:</strong> {lang === 'nl' ? 'Spring / Klim' : 'Jump / Climb'}</div>
          <div><strong className="text-amber-400">Spatie / X:</strong> {lang === 'nl' ? 'Zwaard / Aanval' : 'Sword / Strike'}</div>
          <div><strong className="text-amber-400">↓:</strong> {lang === 'nl' ? 'Bukken' : 'Crouch'}</div>
        </div>
      </main>

      {/* Modals */}
      <PrinceHistoryModal
        isOpen={isDossierOpen}
        onClose={() => setIsDossierOpen(false)}
        lang={lang}
      />

      {/* High Scores Modal */}
      {isHighScoresOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-neutral-950 border border-amber-500/40 rounded-2xl shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2 text-amber-400">
                <Trophy className="w-5 h-5" />
                <h3 className="font-bold text-sm text-white">HALL OF RECORD TIMES</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsHighScoresOpen(false)}
                className="text-neutral-400 hover:text-white text-xs"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {highScores.map((score, idx) => (
                <div key={score.id} className="flex items-center justify-between p-2 rounded-lg bg-neutral-900 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-amber-500 font-bold">{idx + 1}.</span>
                    <span className="font-bold text-white">{score.initials}</span>
                    <span className="text-[10px] text-neutral-500">LVL {score.level}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-emerald-400">{score.minutesRemaining}:{score.secondsRemaining.toString().padStart(2, '0')}</span>
                    <span className="text-[10px] text-neutral-500 block">{score.guardsDefeated} GUARDS</span>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setIsHighScoresOpen(false)}
              className="w-full py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs"
            >
              {lang === 'nl' ? 'Sluiten' : 'Close'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
