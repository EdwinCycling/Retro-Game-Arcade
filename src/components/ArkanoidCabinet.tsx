import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Volume2, VolumeX, RotateCcw, Info, Sparkles, Zap, Shield, Trophy } from 'lucide-react';
import { ArkanoidEngine, ArkanoidGameState } from '../game/arkanoidEngine';
import { ArkanoidHistoryModal } from './ArkanoidHistoryModal';
import { gamepadManager } from '../utils/gamepadManager';

interface ArkanoidCabinetProps {
  onBackToLobby: () => void;
  lang?: 'nl' | 'en';
}

export const ArkanoidCabinet: React.FC<ArkanoidCabinetProps> = ({
  onBackToLobby,
  lang = 'nl'
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<ArkanoidEngine | null>(null);

  const [gameState, setGameState] = useState<ArkanoidGameState>({
    score: 0,
    highScore: 20000,
    lives: 3,
    round: 1,
    gameOver: false,
    gameWon: false,
    paused: false,
    activePowerUp: 'none'
  });

  const [isMuted, setIsMuted] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  // Initialize Engine
  useEffect(() => {
    if (!canvasRef.current) return;

    const engine = new ArkanoidEngine(canvasRef.current, (state) => {
      setGameState(state);
    });
    engineRef.current = engine;
    engine.start();

    return () => {
      engine.destroy();
      engineRef.current = null;
    };
  }, []);

  // Sync mute state
  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.setAudioMuted(isMuted);
    }
  }, [isMuted]);

  // Gamepad Polling Loop for active cabinet with fine-tuned analog precision
  useEffect(() => {
    let animId: number;
    const pollCabinetGamepad = () => {
      const snapshot = gamepadManager.getSnapshot();
      if (snapshot.connected && engineRef.current) {
        // Smooth analog steering with deadzone & curve
        const stickX = snapshot.leftStick.x;
        const dpadL = snapshot.buttons.has('DpadLeft');
        const dpadR = snapshot.buttons.has('DpadRight');

        if (Math.abs(stickX) > 0.15) {
          // Analog stick gives fine-grained variable speed (gentle push = slow, full tilt = max 3.6px)
          const speed = Math.sign(stickX) * Math.min(3.6, Math.pow(Math.abs(stickX), 1.3) * 3.6);
          engineRef.current.movePaddleAnalog(speed);
        } else if (dpadL) {
          engineRef.current.movePaddleAnalog(-3.2);
        } else if (dpadR) {
          engineRef.current.movePaddleAnalog(3.2);
        }

        // Action A, X, or RT to fire laser or launch ball
        if (snapshot.buttons.has('A') || snapshot.buttons.has('X') || snapshot.rt > 0.5) {
          engineRef.current.fireLaserOrReleaseBall();
        }
      }
      animId = requestAnimationFrame(pollCabinetGamepad);
    };

    animId = requestAnimationFrame(pollCabinetGamepad);
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <div className="relative min-h-screen w-full bg-neutral-950 text-white flex flex-col items-center justify-center p-2 sm:p-4 select-none">
      
      {/* Background Ambient Glow */}
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_40%,rgba(6,182,212,0.12),transparent_70%)]" />

      {/* Retro Arcade Cabinet Container */}
      <div className="relative z-10 w-full max-w-md bg-neutral-900 border-4 border-neutral-800 rounded-3xl shadow-[0_0_50px_rgba(6,182,212,0.35)] overflow-hidden flex flex-col">
        
        {/* Top Marquee Header */}
        <div className="relative bg-gradient-to-r from-cyan-950 via-slate-900 to-blue-950 border-b-2 border-cyan-500/40 px-4 py-3 flex items-center justify-between shadow-lg">
          <button
            type="button"
            onClick={onBackToLobby}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-800/80 hover:bg-neutral-700 text-neutral-300 hover:text-white text-xs font-mono font-bold transition-all cursor-pointer border border-neutral-700 active:scale-95"
          >
            <ArrowLeft className="w-4 h-4 text-cyan-400" />
            <span className="hidden sm:inline">{lang === 'nl' ? 'Lobby (ESC)' : 'Lobby (ESC)'}</span>
          </button>

          {/* Marquee Title */}
          <div className="text-center">
            <h1 className="text-lg sm:text-xl font-black font-mono tracking-widest bg-gradient-to-r from-cyan-400 via-white to-blue-400 bg-clip-text text-transparent drop-shadow-[0_0_12px_rgba(6,182,212,0.8)]">
              ARKANOID
            </h1>
            <span className="text-[10px] font-mono text-cyan-400 block tracking-wider">
              TAITO 1986 • BREAKOUT 1976
            </span>
          </div>

          {/* Top Control Buttons */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setIsMuted(!isMuted)}
              className="p-2 rounded-xl bg-neutral-800/80 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-all cursor-pointer border border-neutral-700 active:scale-95"
              title={isMuted ? 'Geluid Aanzetten' : 'Geluid Dempen'}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
            </button>
            <button
              type="button"
              onClick={() => setShowHistory(true)}
              className="p-2 rounded-xl bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-300 hover:text-white transition-all cursor-pointer active:scale-95"
              title="Historisch Dossier"
            >
              <Info className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Live HUD Bar */}
        <div className="bg-black/90 px-4 py-2 border-b border-neutral-800 flex items-center justify-between text-xs font-mono font-bold">
          <div className="flex items-center gap-2">
            <span className="text-neutral-400">SCORE:</span>
            <span className="text-yellow-400 text-sm">{gameState.score.toString().padStart(6, '0')}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-neutral-400">HIGH:</span>
            <span className="text-cyan-400 text-sm">{gameState.highScore.toString().padStart(6, '0')}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-neutral-400">ROUND:</span>
            <span className="text-emerald-400 text-sm">{gameState.round}</span>
          </div>
        </div>

        {/* CRT Arcade Display Screen */}
        <div className="relative bg-black flex items-center justify-center p-2 sm:p-3 overflow-hidden">
          {/* CRT Curved Frame & Scanlines Overlay */}
          <div className="relative rounded-2xl overflow-hidden border-2 border-neutral-800 shadow-[inset_0_0_20px_rgba(0,0,0,0.8)]">
            <canvas
              ref={canvasRef}
              width={320}
              height={480}
              className="w-full h-auto max-h-[65vh] object-contain cursor-crosshair block"
            />
            {/* Scanline line overlay */}
            <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px] opacity-30" />
          </div>
        </div>

        {/* Active Power-up Badge Banner */}
        {gameState.activePowerUp !== 'none' && (
          <div className="bg-neutral-950 px-4 py-1.5 border-t border-neutral-800 flex items-center justify-center gap-2 text-xs font-mono font-bold text-cyan-300 animate-pulse">
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            <span>
              {gameState.activePowerUp === 'laser' && (lang === 'nl' ? 'LASER KANON ACTIEF (SPATIE/TIK)' : 'LASER CANNONS ACTIVE')}
              {gameState.activePowerUp === 'expand' && (lang === 'nl' ? 'VAUS VERGROOT (+50% BREEDTE)' : 'VAUS EXPANDED')}
              {gameState.activePowerUp === 'catch' && (lang === 'nl' ? 'STICKY CATCH ACTIEF' : 'CATCH ACTIVE')}
            </span>
          </div>
        )}

        {/* Bottom Arcade Control Deck */}
        <div className="bg-neutral-950 border-t-2 border-neutral-800 p-3 sm:p-4 flex flex-col gap-3">
          
          {/* Quick Action / Launch Button */}
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => engineRef.current?.resetRound(gameState.round)}
              className="px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 text-neutral-300 text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
            >
              <RotateCcw className="w-3.5 h-3.5 text-yellow-400" />
              <span>{lang === 'nl' ? 'Herstart Level' : 'Reset Level'}</span>
            </button>

            <button
              type="button"
              onClick={() => engineRef.current?.fireLaserOrReleaseBall()}
              className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-red-500 hover:from-red-500 hover:to-rose-500 text-white font-black font-mono text-xs flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(239,68,68,0.5)] transition-all cursor-pointer active:scale-95"
            >
              <Zap className="w-4 h-4 text-yellow-300 animate-bounce" />
              <span>{gameState.activePowerUp === 'laser' ? (lang === 'nl' ? 'SCHIET LASER' : 'FIRE LASERS') : (lang === 'nl' ? 'LANCEER BAL (SPATIE / A)' : 'LAUNCH BALL')}</span>
            </button>
          </div>

          {/* Steer & Controls Guide */}
          <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400 bg-neutral-900/60 p-2 rounded-xl border border-neutral-800/80">
            <span>🕹️ <strong>Muis/Touch</strong>: Slepen</span>
            <span>⌨️ <strong>A/D of Pijltjes</strong>: Sturen</span>
            <span>🎮 <strong>Xbox Stick &amp; Knop A</strong></span>
          </div>
        </div>

      </div>

      {/* History Dossier Modal */}
      <ArkanoidHistoryModal
        isOpen={showHistory}
        onClose={() => setShowHistory(false)}
        onPlayGame={() => {
          setShowHistory(false);
          engineRef.current?.resetGame();
        }}
        lang={lang}
      />
    </div>
  );
};
