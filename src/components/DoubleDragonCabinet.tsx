/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Double Dragon (1987 / Technos Japan) - Arcade Coin-Op Cabinet Simulation
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { 
  ArrowLeft, 
  Volume2, 
  VolumeX, 
  Trophy, 
  BookOpen, 
  RotateCcw, 
  Play, 
  Pause,
  Swords,
  Sparkles,
  SlidersHorizontal,
  Flame,
  ShieldAlert
} from 'lucide-react';
import { DoubleDragonEngine } from '../game/doubleDragonEngine';
import { DoubleDragonRenderer } from '../game/doubleDragonRenderer';
import { doubleDragonAudio } from '../game/doubleDragonAudio';
import { getDoubleDragonScores, DoubleDragonScore } from '../game/doubleDragonHighScores';
import { DoubleDragonHistoryModal } from './DoubleDragonHistoryModal';
import { haptics } from '../utils/haptics';

interface DoubleDragonCabinetProps {
  onBackToLobby: () => void;
  lang?: 'nl' | 'en';
}

export const DoubleDragonCabinet: React.FC<DoubleDragonCabinetProps> = ({ onBackToLobby, lang = 'nl' }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<DoubleDragonEngine | null>(null);
  const rendererRef = useRef<DoubleDragonRenderer | null>(null);
  const keysRef = useRef<Record<string, boolean>>({});

  const [score, setScore] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(48500);
  const [lives, setLives] = useState<number>(3);
  const [hp, setHp] = useState<number>(6);
  const [stage, setStage] = useState<number>(1);
  const [timeLeft, setTimeLeft] = useState<number>(100);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [scanlines, setScanlines] = useState<boolean>(true);
  const [showTrainer, setShowTrainer] = useState<boolean>(false);
  const [isDossierOpen, setIsDossierOpen] = useState<boolean>(false);
  const [isScoresOpen, setIsScoresOpen] = useState<boolean>(false);
  const [highScoresList, setHighScoresList] = useState<DoubleDragonScore[]>([]);

  // Trainer cheats
  const [godMode, setGodMode] = useState<boolean>(false);
  const [oneHitKO, setOneHitKO] = useState<boolean>(false);

  // Initialize engine and loop
  useEffect(() => {
    const engine = new DoubleDragonEngine();
    const renderer = new DoubleDragonRenderer();
    engineRef.current = engine;
    rendererRef.current = renderer;

    setHighScore(engine.highScore);
    setHighScoresList(getDoubleDragonScores());

    let animId: number;

    const gameLoop = () => {
      const keys = keysRef.current;
      if (engine) {
        // Continuous directional movement
        let dx = 0;
        let dy = 0;
        if (keys['ArrowLeft'] || keys['a'] || keys['A']) dx -= 1;
        if (keys['ArrowRight'] || keys['d'] || keys['D']) dx += 1;
        if (keys['ArrowUp'] || keys['w'] || keys['W']) dy -= 1;
        if (keys['ArrowDown'] || keys['s'] || keys['S']) dy += 1;

        if (dx !== 0 || dy !== 0) {
          engine.movePlayer(dx, dy);
        }

        engine.update();

        setScore(engine.score);
        setHighScore(engine.highScore);
        setLives(engine.lives);
        setHp(engine.player.hp);
        setStage(engine.stage);
        setTimeLeft(engine.timeLeft);

        const canvas = canvasRef.current;
        if (canvas) {
          const ctx = canvas.getContext('2d');
          if (ctx) {
            renderer.render(ctx, engine);
          }
        }
      }

      animId = requestAnimationFrame(gameLoop);
    };

    animId = requestAnimationFrame(gameLoop);

    return () => {
      cancelAnimationFrame(animId);
      doubleDragonAudio.stopBGM();
    };
  }, []);

  // Keyboard Event Handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const engine = engineRef.current;
      if (!engine) return;

      keysRef.current[e.key] = true;

      // Single action triggers
      switch (e.key) {
        case 'z':
        case 'Z':
        case 'j':
        case 'J':
          haptics.light();
          engine.playerPunch();
          break;

        case 'x':
        case 'X':
        case 'k':
        case 'K':
          haptics.light();
          engine.playerKick();
          break;

        case 'c':
        case 'C':
        case ' ':
          haptics.medium();
          if (engine.player.z > 0) {
            engine.playerJumpKick();
          } else {
            engine.playerJump();
          }
          break;

        case 'e':
        case 'E':
        case 'l':
        case 'L':
          // Rear Elbow Smash!
          haptics.heavy();
          engine.playerElbow();
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current[e.key] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const handleToggleMute = useCallback(() => {
    haptics.light();
    const muted = doubleDragonAudio.toggleMute();
    setIsMuted(muted);
  }, []);

  const handleInsertCoin = useCallback(() => {
    haptics.success();
    doubleDragonAudio.playCoin();
    if (engineRef.current) {
      engineRef.current.lives += 2;
      setLives(engineRef.current.lives);
    }
  }, []);

  const handleResetGame = useCallback(() => {
    haptics.medium();
    if (engineRef.current) {
      engineRef.current.initGame();
    }
  }, []);

  return (
    <div className="min-h-screen w-full bg-black text-white flex flex-col items-center justify-between p-2 sm:p-4 font-mono select-none overflow-x-hidden">
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
            <div className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400">
              <Swords className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-xs sm:text-sm font-black text-white tracking-wider flex items-center gap-2">
                DOUBLE DRAGON
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-600 text-white font-bold">1987</span>
              </h1>
              <p className="text-[10px] text-neutral-400">Technos Japan • Yoshihisa Kishimoto • Arcade Coin-Op</p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleInsertCoin}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-95 text-black font-black text-xs transition-all shadow-md cursor-pointer"
            title="Insert Coin"
          >
            <span>💰 INSERT COIN</span>
          </button>

          <button
            type="button"
            onClick={() => setShowTrainer(!showTrainer)}
            className={`p-2 rounded-xl border text-xs transition-colors cursor-pointer ${
              showTrainer ? 'bg-blue-600 text-white border-blue-400' : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
            }`}
            title="Trainer & Settings"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => {
              setHighScoresList(getDoubleDragonScores());
              setIsScoresOpen(true);
            }}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 text-neutral-300 hover:text-white text-xs transition-colors cursor-pointer"
          >
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden md:inline text-[11px]">{lang === 'nl' ? 'Topscores' : 'High Scores'}</span>
          </button>

          <button
            type="button"
            onClick={() => setIsDossierOpen(true)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 text-neutral-300 hover:text-white text-xs transition-colors cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden md:inline text-[11px]">{lang === 'nl' ? 'Dossier 1987' : 'Dossier'}</span>
          </button>

          <button
            type="button"
            onClick={handleToggleMute}
            className={`p-2 rounded-xl border text-xs transition-colors cursor-pointer ${
              isMuted ? 'bg-red-500/20 border-red-500/40 text-red-400' : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
            }`}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Trainer & Settings Drawer */}
      {showTrainer && (
        <div className="w-full max-w-5xl p-3 sm:p-4 rounded-2xl bg-neutral-950 border border-blue-500/30 shadow-2xl mb-3 flex flex-wrap gap-4 items-center justify-between text-xs">
          <div className="flex flex-wrap items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={godMode}
                onChange={(e) => {
                  setGodMode(e.target.checked);
                  if (engineRef.current) engineRef.current.godMode = e.target.checked;
                }}
                className="rounded border-neutral-700 text-blue-500 focus:ring-0"
              />
              <span className="text-neutral-300">{lang === 'nl' ? 'Onkwetsbaar (God Mode)' : 'Invincible (God Mode)'}</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={oneHitKO}
                onChange={(e) => {
                  setOneHitKO(e.target.checked);
                  if (engineRef.current) engineRef.current.oneHitKO = e.target.checked;
                }}
                className="rounded border-neutral-700 text-red-500 focus:ring-0"
              />
              <span className="text-neutral-300">{lang === 'nl' ? 'One-Hit KO Stoten' : 'One-Hit KO Punches'}</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={scanlines}
                onChange={(e) => setScanlines(e.target.checked)}
                className="rounded border-neutral-700 text-blue-500 focus:ring-0"
              />
              <span className="text-neutral-300">CRT Scanlines</span>
            </label>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-neutral-400">{lang === 'nl' ? 'Kies Missie:' : 'Mission:'}</span>
            <div className="flex gap-1">
              {[1, 2, 3].map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => {
                    if (engineRef.current) {
                      engineRef.current.stage = lvl;
                      engineRef.current.spawnWave();
                    }
                    haptics.light();
                  }}
                  className="px-2 py-0.5 rounded bg-neutral-900 border border-neutral-700 hover:border-blue-400 text-neutral-200 text-xs"
                >
                  Stage {lvl}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Arcade Bezel & Screen Frame */}
      <main className="w-full max-w-4xl flex-1 flex flex-col items-center justify-center relative">
        <div className="relative p-2 sm:p-4 rounded-3xl bg-gradient-to-b from-neutral-900 via-neutral-950 to-neutral-900 border-4 border-blue-950/80 shadow-[0_0_60px_rgba(37,99,235,0.25)] flex flex-col items-center">
          {/* Authentic Arcade Marquee */}
          <div className="w-full flex items-center justify-between px-4 py-1.5 mb-2 bg-gradient-to-r from-blue-900 via-red-900 to-blue-900 rounded-lg border border-red-500/40 shadow-inner">
            <div className="flex items-center gap-1.5 text-yellow-400 text-xs font-black tracking-widest uppercase drop-shadow">
              <span>★ TECHNOS JAPAN ★</span>
            </div>
            <div className="text-white text-xs font-black tracking-widest uppercase">
              DOUBLE DRAGON
            </div>
            <div className="text-yellow-400 text-[10px] font-bold">
              1987 COIN-OP
            </div>
          </div>

          {/* CRT Monitor Frame */}
          <div className="relative rounded-2xl bg-black p-2 border-4 border-neutral-800 shadow-[inset_0_0_20px_rgba(0,0,0,0.9)] overflow-hidden">
            {/* Screen Canvas (320x224) */}
            <canvas
              ref={canvasRef}
              width={320}
              height={224}
              className="w-[320px] sm:w-[600px] md:w-[680px] h-[224px] sm:h-[420px] md:h-[476px] block rounded [image-rendering:pixelated]"
            />

            {/* Optional CRT Scanlines Effect */}
            {scanlines && (
              <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.4)_50%)] bg-[length:100%_4px] opacity-70" />
            )}
          </div>

          {/* Virtual Arcade Controls (Mobile & Desktop Touch) */}
          <div className="w-full mt-3 grid grid-cols-5 gap-2 sm:gap-3 max-w-lg">
            {/* Movement Buttons */}
            <button
              type="button"
              onMouseDown={() => (keysRef.current['ArrowLeft'] = true)}
              onMouseUp={() => (keysRef.current['ArrowLeft'] = false)}
              onTouchStart={() => (keysRef.current['ArrowLeft'] = true)}
              onTouchEnd={() => (keysRef.current['ArrowLeft'] = false)}
              className="p-3 rounded-xl bg-neutral-900 active:bg-blue-600 border border-neutral-800 flex items-center justify-center text-xs font-bold"
            >
              ◀
            </button>

            <button
              type="button"
              onMouseDown={() => (keysRef.current['ArrowRight'] = true)}
              onMouseUp={() => (keysRef.current['ArrowRight'] = false)}
              onTouchStart={() => (keysRef.current['ArrowRight'] = true)}
              onTouchEnd={() => (keysRef.current['ArrowRight'] = false)}
              className="p-3 rounded-xl bg-neutral-900 active:bg-blue-600 border border-neutral-800 flex items-center justify-center text-xs font-bold"
            >
              ▶
            </button>

            {/* Action 1: Punch (Z / J) */}
            <button
              type="button"
              onClick={() => engineRef.current?.playerPunch()}
              className="p-3 rounded-xl bg-blue-600 active:bg-blue-400 text-white flex flex-col items-center justify-center text-xs font-black shadow-lg"
            >
              <span>STAMP</span>
              <span className="text-[8px] text-blue-200">PUNCH (Z)</span>
            </button>

            {/* Action 2: Kick (X / K) */}
            <button
              type="button"
              onClick={() => engineRef.current?.playerKick()}
              className="p-3 rounded-xl bg-red-600 active:bg-red-400 text-white flex flex-col items-center justify-center text-xs font-black shadow-lg"
            >
              <span>TRAP</span>
              <span className="text-[8px] text-red-200">KICK (X)</span>
            </button>

            {/* Action 3: Jump (C / Space) */}
            <button
              type="button"
              onClick={() => {
                if (engineRef.current?.player.z && engineRef.current.player.z > 0) {
                  engineRef.current?.playerJumpKick();
                } else {
                  engineRef.current?.playerJump();
                }
              }}
              className="p-3 rounded-xl bg-yellow-500 active:bg-yellow-400 text-black flex flex-col items-center justify-center text-xs font-black shadow-lg"
            >
              <span>SPRONG</span>
              <span className="text-[8px] text-yellow-900">JUMP (C)</span>
            </button>

            {/* Dedicated Legendary Rear Elbow Smash button across width */}
            <button
              type="button"
              onClick={() => engineRef.current?.playerElbow()}
              className="col-span-5 p-2.5 rounded-xl bg-gradient-to-r from-amber-600 via-red-600 to-amber-600 active:brightness-125 text-white flex items-center justify-center gap-2 text-xs font-black shadow-md border border-amber-400/60"
            >
              <Flame className="w-4 h-4 text-yellow-300" />
              <span>BERUCHTE ELLEBOOGSTOOT / REAR ELBOW SMASH (TOETS E)</span>
            </button>
          </div>

          {/* Desktop Keyboard Controls Help */}
          <div className="hidden sm:flex items-center justify-center gap-4 mt-2 text-[11px] text-neutral-400">
            <div><strong className="text-blue-400">Pijltjes / WASD:</strong> Bewegen &amp; Diepte</div>
            <div><strong className="text-blue-400">Z / J:</strong> Stoten / Vat Oppakken</div>
            <div><strong className="text-red-400">X / K:</strong> Trappen</div>
            <div><strong className="text-yellow-400">C / Spatie:</strong> Springen / Vliegende Trap</div>
            <div><strong className="text-amber-400">E / L:</strong> Elleboogstoot</div>
          </div>
        </div>
      </main>

      {/* History Dossier Modal */}
      <DoubleDragonHistoryModal
        isOpen={isDossierOpen}
        onClose={() => setIsDossierOpen(false)}
        lang={lang}
      />

      {/* High Scores Modal */}
      {isScoresOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-neutral-950 border border-blue-500/40 rounded-2xl shadow-2xl p-5 space-y-4 font-mono">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2 text-blue-400">
                <Trophy className="w-5 h-5" />
                <h3 className="font-bold text-sm text-white">DOUBLE DRAGON HALL OF FAME</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsScoresOpen(false)}
                className="text-neutral-400 hover:text-white text-xs"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {highScoresList.map((sc, idx) => (
                <div key={sc.id} className="flex items-center justify-between p-2 rounded-lg bg-neutral-900 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-blue-500 font-bold">{idx + 1}.</span>
                    <span className="font-bold text-white">{sc.initials}</span>
                    <span className="text-[10px] text-neutral-500">STAGE {sc.stage} • {sc.thugsKO} KO's</span>
                  </div>
                  <span className="text-blue-400 font-bold">{sc.score} PTS</span>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setIsScoresOpen(false)}
              className="w-full py-2 rounded-xl bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 text-white text-xs font-bold"
            >
              Sluiten
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
