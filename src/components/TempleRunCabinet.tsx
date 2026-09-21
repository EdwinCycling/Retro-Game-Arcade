import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Volume2,
  VolumeX,
  ArrowLeft,
  RotateCcw,
  Trophy,
  Sparkles,
  HelpCircle,
  Shield,
  Layers,
  Zap,
  Flame,
  Compass,
  Smartphone,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Tv
} from 'lucide-react';
import { TempleRunEngine, TempleRunStats, TempleLevelTheme, TempleCharacter } from '../game/templeRunEngine';
import { templeRunAudio } from '../game/templeRunAudio';
import { getTempleRunScores, saveTempleRunScore, TempleRunScore } from '../game/templeRunHighScores';
import { TempleRunHistoryModal } from './TempleRunHistoryModal';
import { GameControlsModal, useGameControls } from './GameControlsModal';
import { haptics } from '../utils/haptics';

import idolImg from '../assets/images/temple_cursed_idol_1789233131676.jpg';
import monkeyImg from '../assets/images/demon_monkey_beast_1789233146340.jpg';
import coinImg from '../assets/images/ancient_aztec_coin_1789233162968.jpg';

interface TempleRunCabinetProps {
  onBackToLobby: () => void;
}

export const TempleRunCabinet: React.FC<TempleRunCabinetProps> = ({ onBackToLobby }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<TempleRunEngine | null>(null);

  const [isMuted, setIsMuted] = useState(false);
  const [crtEffect, setCrtEffect] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const { showControls: showControlsHelp, setShowControls: setShowControlsHelp } = useGameControls('temple_run');

  const [levelTheme, setLevelTheme] = useState<TempleLevelTheme>('jungle');
  const [character, setCharacter] = useState<TempleCharacter>('Guy Dangerous');

  const [stats, setStats] = useState<TempleRunStats>({
    score: 0,
    distance: 0,
    coins: 0,
    multiplier: 1,
    levelTheme: 'jungle',
    character: 'Guy Dangerous',
    gameOver: false,
    deathReason: '',
    activePowerup: 'none',
    powerupTimer: 0,
    monkeyProximity: 0,
    hasResurrectionIdol: false,
    stumbleCount: 0,
    turnWarning: null,
    coinMeterProgress: 0
  });

  const [highScores, setHighScores] = useState<TempleRunScore[]>([]);
  const [playerName, setPlayerName] = useState('GUY');
  const [scoreSaved, setScoreSaved] = useState(false);
  const [tiltSlider, setTiltSlider] = useState(0);

  // Initialize 3D Engine
  const initGame = useCallback((theme: TempleLevelTheme = levelTheme, char: TempleCharacter = character) => {
    if (!containerRef.current) return;
    if (engineRef.current) {
      engineRef.current.destroy();
    }

    setScoreSaved(false);
    const engine = new TempleRunEngine(containerRef.current, theme, char, (newStats) => {
      setStats({ ...newStats });
    });
    engineRef.current = engine;
  }, [levelTheme, character]);

  useEffect(() => {
    setHighScores(getTempleRunScores());
    initGame(levelTheme, character);

    return () => {
      if (engineRef.current) {
        engineRef.current.destroy();
      }
    };
  }, [initGame, levelTheme, character]);

  const toggleSound = () => {
    const next = !isMuted;
    setIsMuted(next);
    templeRunAudio.setMuted(next);
    haptics.selection();
  };

  // Keyboard Event Handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!engineRef.current) return;

      if (e.code === 'KeyA' || e.code === 'ArrowLeft') {
        engineRef.current.swipeLeft();
        haptics.light();
      } else if (e.code === 'KeyD' || e.code === 'ArrowRight') {
        engineRef.current.swipeRight();
        haptics.light();
      } else if (e.code === 'KeyW' || e.code === 'ArrowUp' || e.code === 'Space') {
        engineRef.current.jump();
        haptics.medium();
      } else if (e.code === 'KeyS' || e.code === 'ArrowDown') {
        engineRef.current.slide();
        haptics.medium();
      } else if (e.code === 'KeyR' && stats.gameOver) {
        handleRestart();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [stats.gameOver]);

  // Touch & Swipe Event Handlers on 3D Canvas
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length > 0) {
      touchStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY
      };
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current || !engineRef.current || e.changedTouches.length === 0) return;
    const startX = touchStartRef.current.x;
    const startY = touchStartRef.current.y;
    const endX = e.changedTouches[0].clientX;
    const endY = e.changedTouches[0].clientY;

    const dx = endX - startX;
    const dy = endY - startY;
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);

    if (Math.max(absDx, absDy) > 25) {
      if (absDx > absDy) {
        if (dx > 0) {
          engineRef.current.swipeRight();
        } else {
          engineRef.current.swipeLeft();
        }
      } else {
        if (dy > 0) {
          engineRef.current.swipeDown();
        } else {
          engineRef.current.swipeUp();
        }
      }
      haptics.medium();
    }
    touchStartRef.current = null;
  };

  const handleRestart = () => {
    setScoreSaved(false);
    engineRef.current?.restart();
    haptics.success();
  };

  const handleSaveScore = () => {
    if (scoreSaved) return;
    const updated = saveTempleRunScore({
      initials: playerName.toUpperCase().slice(0, 3) || 'GUY',
      score: stats.score,
      distance: stats.distance,
      coins: stats.coins,
      character,
      levelTheme: levelTheme === 'jungle' ? 'Jungle Tempel' : levelTheme === 'cliff' ? 'Rotswand Kloof' : 'Vulkaan Ruïnes',
      date: new Date().toISOString().split('T')[0]
    });
    setHighScores(updated);
    setScoreSaved(true);
    haptics.success();
  };

  const topHighScore = highScores.length > 0 ? highScores[0].score : 1254000;

  return (
    <div className="relative flex flex-col items-center justify-between min-h-screen w-full bg-neutral-950 text-white font-sans overflow-x-hidden selection:bg-amber-500 selection:text-black">
      
      {/* Top Header & Navigation Bar */}
      <header className="w-full max-w-5xl px-4 py-2 flex items-center justify-between z-20 border-b border-amber-900/40 bg-neutral-950/80 backdrop-blur">
        <button
          type="button"
          onClick={onBackToLobby}
          className="flex items-center gap-1.5 text-xs font-mono font-bold text-amber-400 hover:text-amber-300 transition cursor-pointer px-3 py-1.5 rounded-xl bg-amber-950/40 border border-amber-800/60 hover:bg-amber-900/60 shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>SPEELHAL LOBBY</span>
        </button>

        <div className="flex items-center gap-2">
          {/* Audio Toggle */}
          <button
            type="button"
            onClick={toggleSound}
            className={`p-2 rounded-xl border text-xs font-mono font-bold flex items-center gap-1.5 transition cursor-pointer ${
              isMuted
                ? 'bg-neutral-900 border-neutral-800 text-neutral-400'
                : 'bg-amber-950/80 border-amber-500 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.4)]'
            }`}
            title={isMuted ? 'Geluid Aanzetten' : 'Geluid Dempen'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-amber-400 animate-pulse" />}
          </button>

          {/* CRT Filter Toggle */}
          <button
            type="button"
            onClick={() => setCrtEffect(!crtEffect)}
            className={`p-2 rounded-xl border text-xs font-mono font-bold flex items-center gap-1.5 transition cursor-pointer ${
              crtEffect
                ? 'bg-amber-950/80 border-amber-500 text-amber-300'
                : 'bg-neutral-900 border-neutral-800 text-neutral-400'
            }`}
            title="CRT Schermfilter"
          >
            <Tv className="w-4 h-4" />
          </button>

          {/* Controls Tutorial */}
          <button
            type="button"
            onClick={() => setShowControlsHelp(true)}
            className="p-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-amber-400 font-mono text-xs font-bold transition cursor-pointer"
            title="Besturing &amp; Tips"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          {/* History Dossier */}
          <button
            type="button"
            onClick={() => setIsHistoryOpen(true)}
            className="p-2 rounded-xl bg-amber-900/60 hover:bg-amber-800/80 border border-amber-500/60 text-amber-300 font-mono text-xs font-bold transition cursor-pointer shadow-md"
            title="Historisch Dossier"
          >
            <Trophy className="w-4 h-4 text-yellow-400" />
          </button>
        </div>
      </header>

      {/* Main Cabinet Frame */}
      <main className="w-full max-w-4xl flex flex-col items-center my-auto py-2 px-3">
        
        {/* Level Theme & Character Selection Strips */}
        <div className="w-full max-w-[540px] flex flex-col gap-1.5 mb-2">
          
          {/* Level Theme Strip */}
          <div className="w-full flex items-center justify-between gap-1 overflow-x-auto py-1 px-2.5 bg-neutral-900/90 border border-amber-900/50 rounded-xl">
            <div className="flex items-center gap-1 text-[11px] font-mono text-amber-400 mr-1 shrink-0">
              <Compass className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-bold">WERELD:</span>
            </div>
            <div className="flex items-center gap-1">
              {[
                { id: 'jungle', label: '🌴 Jungle Tempel', desc: 'Klassieke tempelchasm & groen bladerdak' },
                { id: 'cliff', label: '🌊 Rotswand Kloof', desc: 'Hangbruggen over kolkende watervallen' },
                { id: 'volcano', label: '🌋 Vulkaan Ruïnes', desc: 'Gloeiende lavastromen & magma vallen' },
              ].map(({ id, label, desc }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => {
                    setLevelTheme(id as TempleLevelTheme);
                    engineRef.current?.setLevelTheme(id as TempleLevelTheme);
                    haptics.light();
                  }}
                  className={`px-2 py-1 rounded-lg text-xs font-mono font-bold transition cursor-pointer shrink-0 border ${
                    levelTheme === id
                      ? 'bg-amber-500 text-black border-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.6)] font-black'
                      : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border-neutral-700'
                  }`}
                  title={desc}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Character Selector Strip */}
          <div className="w-full flex items-center justify-between gap-1 overflow-x-auto py-1 px-2.5 bg-neutral-900/90 border border-amber-900/50 rounded-xl">
            <div className="flex items-center gap-1 text-[11px] font-mono text-amber-400 mr-1 shrink-0">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-bold">HELD:</span>
            </div>
            <div className="flex items-center gap-1">
              {[
                { id: 'Guy Dangerous', label: '🤠 Guy' },
                { id: 'Scarlett Fox', label: '🦊 Scarlett' },
                { id: 'Barry Bones', label: '👮 Barry' },
                { id: 'Karma Lee', label: '🥷 Karma' },
              ].map(({ id, label }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => {
                    setCharacter(id as TempleCharacter);
                    engineRef.current?.setCharacter(id as TempleCharacter);
                    haptics.light();
                  }}
                  className={`px-2 py-1 rounded-lg text-xs font-mono font-bold transition cursor-pointer shrink-0 border ${
                    character === id
                      ? 'bg-amber-500 text-black border-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.6)] font-black'
                      : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border-neutral-700'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Aztec Gold Marquee Banner */}
        <div className="w-full max-w-[540px] mb-2 p-2.5 rounded-2xl bg-gradient-to-r from-amber-950 via-neutral-900 to-amber-950 border border-amber-500/60 shadow-[0_0_30px_rgba(245,158,11,0.3)] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-yellow-400 to-amber-600 flex items-center justify-center text-black font-black text-lg shadow-md">
              🏃
            </div>
            <div>
              <h2 className="text-sm font-black font-mono tracking-wider text-amber-300">
                TEMPLE RUN 3D
              </h2>
              <p className="text-[10px] text-amber-400/80 font-mono">
                {levelTheme === 'jungle' ? '🌴 JUNGLE TEMPEL' : levelTheme === 'cliff' ? '🌊 ROTSWAND KLOOF' : '🌋 VULKAAN RUÏNES'} • {character.toUpperCase()}
              </p>
            </div>
          </div>

          <div className="text-right font-mono">
            <div className="text-[10px] text-neutral-400">HIGH SCORE</div>
            <div className="text-sm font-black text-yellow-400">
              {topHighScore.toLocaleString()}
            </div>
          </div>
        </div>

        {/* 3D Game Canvas Box with Live HUD */}
        <div className="relative w-full max-w-[540px] aspect-[4/5] sm:aspect-[3/4] bg-black rounded-2xl overflow-hidden border-2 border-amber-500/60 shadow-[0_0_40px_rgba(245,158,11,0.25)] flex flex-col justify-between">
          
          {/* Live In-Game HUD Overlay */}
          <div className="relative z-10 w-full p-3 flex items-start justify-between bg-gradient-to-b from-black/85 via-black/45 to-transparent pointer-events-none">
            
            {/* Left: Score, Distance & Aztec Jade Coin Meter */}
            <div className="font-mono">
              <div className="text-[10px] text-neutral-400">SCORE</div>
              <div className="text-lg sm:text-xl font-black text-white tracking-wider">
                {stats.score.toLocaleString()}
              </div>
              <div className="text-xs font-bold text-amber-400 flex items-center gap-1">
                <span>{stats.distance} m</span>
              </div>
              
              {/* Aztec Jade Multiplier Meter (Fills every 100 coins) */}
              <div className="mt-1 flex items-center gap-1.5">
                <div className="w-24 h-3 bg-neutral-950/90 border border-emerald-500/70 rounded-full overflow-hidden p-0.5 shadow-inner">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-600 via-emerald-400 to-teal-300 rounded-full transition-all duration-150"
                    style={{ width: `${stats.coinMeterProgress || 0}%` }}
                  />
                </div>
                <span className="px-1.5 py-0.2 rounded bg-amber-500 text-black text-[10px] font-black font-mono shadow">
                  {stats.multiplier}X
                </span>
              </div>
            </div>

            {/* Center: Golden Cursed Idol Status */}
            <div className="flex flex-col items-center">
              <div className="relative group">
                <img
                  src={idolImg}
                  alt="Cursed Idol"
                  className="w-10 h-10 rounded-full border-2 border-yellow-400/80 shadow-[0_0_15px_rgba(234,179,8,0.7)] object-cover animate-pulse"
                />
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-1.5 py-0.2 bg-black/90 border border-amber-400/80 rounded-full text-[8px] font-mono text-yellow-300 font-bold whitespace-nowrap">
                  {stats.hasResurrectionIdol ? 'HERRIJZING' : 'IDOL'}
                </div>
              </div>
            </div>

            {/* Right: Aztec Gold Coins & Active Powerup */}
            <div className="text-right font-mono">
              <div className="flex items-center justify-end gap-1.5 text-base sm:text-lg font-black text-yellow-400">
                <img
                  src={coinImg}
                  alt="Aztec Coin"
                  className="w-6 h-6 rounded-full shadow-[0_0_8px_rgba(234,179,8,0.8)] object-cover border border-yellow-300/40"
                />
                <span>{stats.coins}</span>
              </div>
              {stats.activePowerup !== 'none' && (
                <div className="mt-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-cyan-950/90 border border-cyan-500 text-cyan-300 text-[10px] font-bold shadow-md animate-pulse">
                  <Zap className="w-3 h-3 text-cyan-400" />
                  <span>{stats.activePowerup.toUpperCase()} ({stats.powerupTimer}s)</span>
                </div>
              )}
            </div>
          </div>

          {/* High-Visibility Turn & Split Alert Warning Banner */}
          {stats.turnWarning && (
            <div
              className={`absolute top-16 left-1/2 -translate-x-1/2 z-20 px-4 py-2 rounded-2xl border-2 font-mono font-black text-xs sm:text-sm tracking-wider flex items-center gap-2.5 shadow-[0_0_30px_rgba(250,204,21,0.9)] animate-pulse pointer-events-none whitespace-nowrap ${
                stats.turnWarning.direction === 'split'
                  ? 'bg-emerald-950/95 border-emerald-400 text-emerald-300'
                  : 'bg-amber-950/95 border-yellow-400 text-yellow-300'
              }`}
            >
              {stats.turnWarning.direction === 'split' ? (
                <>
                  <ChevronLeft className="w-5 h-5 text-emerald-400 animate-bounce" />
                  <span className="text-yellow-300">SPLITSING! KIES LINKS OF RECHTS</span>
                  <span className="text-emerald-400 text-[11px]">({stats.turnWarning.distance}m)</span>
                  <ChevronRight className="w-5 h-5 text-emerald-400 animate-bounce" />
                </>
              ) : stats.turnWarning.direction === 'left' ? (
                <>
                  <ChevronLeft className="w-5 h-5 text-yellow-300 animate-bounce" />
                  <span>DRAAI LINKS ({stats.turnWarning.distance}m)</span>
                </>
              ) : (
                <>
                  <span>DRAAI RECHTS ({stats.turnWarning.distance}m)</span>
                  <ChevronRight className="w-5 h-5 text-yellow-300 animate-bounce" />
                </>
              )}
            </div>
          )}

          {/* Demonic Monkey Chase Terror Proximity & Vignette */}
          {stats.monkeyProximity > 0.2 && (
            <>
              {/* Red bloodlust pulsating edge vignette */}
              <div
                className="pointer-events-none absolute inset-0 z-10 transition-opacity duration-200"
                style={{
                  boxShadow: `inset 0 0 ${Math.round(stats.monkeyProximity * 70)}px rgba(220, 38, 38, ${Math.min(0.85, stats.monkeyProximity * 0.9)})`
                }}
              />

              {/* Demon Monkey Danger Alert Banner */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 px-3 py-1.5 rounded-2xl bg-red-950/90 border border-red-500 text-red-200 text-xs font-mono font-bold flex items-center gap-2 shadow-[0_0_25px_rgba(239,68,68,0.8)] animate-bounce pointer-events-none">
                <img
                  src={monkeyImg}
                  alt="Demon Monkey"
                  className="w-8 h-8 rounded-full border border-red-500 object-cover shadow-md"
                />
                <div className="flex flex-col text-left">
                  <span className="font-black text-red-400">DEMONISCHE APEN VLAK ACHTER JE!</span>
                  <span className="text-[10px] text-neutral-300">Blijf rennen, struikel niet!</span>
                </div>
              </div>
            </>
          )}

          {/* Three.js Container Mount */}
          <div
            ref={containerRef}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing"
          />

          {/* CRT Scanline Filter Overlay */}
          {crtEffect && (
            <div className="pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.35)_50%)] bg-[length:100%_4px]" />
          )}

          {/* Game Over Modal */}
          {stats.gameOver && (
            <div className="absolute inset-0 z-30 flex flex-col items-center justify-center p-6 bg-black/85 backdrop-blur-md animate-fadeIn">
              <div className="w-full max-w-sm p-6 rounded-2xl bg-gradient-to-b from-neutral-900 to-neutral-950 border border-amber-500/60 shadow-[0_0_40px_rgba(245,158,11,0.4)] text-center space-y-4">
                <div className="flex justify-center">
                  <img
                    src={stats.deathReason.includes('Apen') ? monkeyImg : idolImg}
                    alt="Outcome"
                    className="w-16 h-16 rounded-full border-2 border-amber-500/80 object-cover shadow-[0_0_20px_rgba(245,158,11,0.6)]"
                  />
                </div>
                <h3 className="text-xl font-black font-mono text-red-500 tracking-wider">
                  TEMPEL RUN VOORBIJ
                </h3>
                <p className="text-xs text-neutral-300 font-mono">
                  {stats.deathReason}
                </p>

                <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 space-y-1.5 font-mono text-xs">
                  <div className="flex justify-between text-neutral-400">
                    <span>Afstand:</span>
                    <span className="font-bold text-white">{stats.distance} meter</span>
                  </div>
                  <div className="flex justify-between text-neutral-400">
                    <span>Munten:</span>
                    <span className="font-bold text-yellow-400">🪙 {stats.coins}</span>
                  </div>
                  <div className="flex justify-between text-neutral-400 border-t border-neutral-800 pt-1">
                    <span>Eindscore:</span>
                    <span className="font-black text-amber-400 text-sm">{stats.score.toLocaleString()}</span>
                  </div>
                </div>

                {/* Score Save Input */}
                {!scoreSaved ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      maxLength={3}
                      value={playerName}
                      onChange={(e) => setPlayerName(e.target.value.toUpperCase())}
                      placeholder="GUY"
                      className="w-20 px-3 py-2 rounded-xl bg-neutral-800 border border-amber-500/50 text-center font-mono font-black text-sm text-yellow-400 focus:outline-none focus:border-amber-400"
                    />
                    <button
                      type="button"
                      onClick={handleSaveScore}
                      className="flex-1 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-black font-bold font-mono text-xs transition cursor-pointer shadow-md"
                    >
                      OPSLAAN
                    </button>
                  </div>
                ) : (
                  <div className="text-xs font-mono text-emerald-400 font-bold">
                    ✓ Score Opgeslagen in High Scores!
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleRestart}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-black font-black font-mono text-xs tracking-wider transition cursor-pointer shadow-lg flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>OPNIEUW RENNEN</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* On-Screen Mobile / Tablet Touch Controls & Tilt Slider */}
        <div className="w-full max-w-[540px] mt-3 p-3 bg-neutral-900/90 border border-amber-900/40 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
          
          {/* D-Pad Buttons (Left, Jump, Slide, Right) */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                engineRef.current?.swipeLeft();
                haptics.light();
              }}
              className="p-3.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 active:bg-amber-600 border border-neutral-700 text-amber-300 transition cursor-pointer shadow-md"
              title="Links / Bocht Links"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="flex flex-col gap-1.5">
              <button
                type="button"
                onClick={() => {
                  engineRef.current?.jump();
                  haptics.medium();
                }}
                className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 active:bg-emerald-600 border border-neutral-700 text-emerald-300 font-mono font-bold text-xs transition cursor-pointer shadow-md flex items-center justify-center gap-1"
                title="Springen"
              >
                <ChevronUp className="w-4 h-4" />
                <span>SPRING</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  engineRef.current?.slide();
                  haptics.medium();
                }}
                className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 active:bg-blue-600 border border-neutral-700 text-blue-300 font-mono font-bold text-xs transition cursor-pointer shadow-md flex items-center justify-center gap-1"
                title="Glijden"
              >
                <ChevronDown className="w-4 h-4" />
                <span>GLIJD</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                engineRef.current?.swipeRight();
                haptics.light();
              }}
              className="p-3.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 active:bg-amber-600 border border-neutral-700 text-amber-300 transition cursor-pointer shadow-md"
              title="Rechts / Bocht Rechts"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Tilt Slider for Side Lean / Coin Collection */}
          <div className="flex-1 w-full sm:w-auto flex flex-col gap-1">
            <div className="flex justify-between text-[10px] font-mono text-neutral-400">
              <span>← KANTEL LINKS</span>
              <span className="text-amber-400 font-bold">BALANS / TILT</span>
              <span>KANTEL RECHTS →</span>
            </div>
            <input
              type="range"
              min="-1"
              max="1"
              step="0.05"
              value={tiltSlider}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                setTiltSlider(val);
                engineRef.current?.setTilt(val);
              }}
              onMouseUp={() => {
                setTiltSlider(0);
                engineRef.current?.setTilt(0);
              }}
              onTouchEnd={() => {
                setTiltSlider(0);
                engineRef.current?.setTilt(0);
              }}
              className="w-full accent-amber-500 cursor-pointer"
            />
          </div>

        </div>

      </main>

      {/* History Modal */}
      <TempleRunHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
      />

      {/* Controls Tutorial Modal */}
      <GameControlsModal
        isOpen={showControlsHelp}
        onClose={() => setShowControlsHelp(false)}
        gameId="temple_run"
      />

    </div>
  );
};
