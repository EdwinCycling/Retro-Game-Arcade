/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Volume2, VolumeX, RotateCcw, Gamepad2 } from 'lucide-react';
import { GalagaEngine } from '../game/galagaEngine';
import { gamepadManager } from '../utils/gamepadManager';

interface GalagaCabinetProps {
  onBackToLobby: () => void;
}

export const GalagaCabinet: React.FC<GalagaCabinetProps> = ({ onBackToLobby }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<GalagaEngine | null>(null);
  const [isMuted, setIsMuted] = useState(false);

  // Initialize Game Engine
  useEffect(() => {
    if (!canvasRef.current) return;
    const engine = new GalagaEngine(canvasRef.current);
    engineRef.current = engine;
    engine.start();

    return () => {
      engine.destroy();
      engineRef.current = null;
    };
  }, []);

  // Sync Audio Mute
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
          const speed = Math.sign(stickX) * Math.min(3.6, Math.pow(Math.abs(stickX), 1.3) * 3.6);
          engineRef.current.movePlayerAnalog(speed);
        } else if (dpadL) {
          engineRef.current.movePlayerAnalog(-3.2);
        } else if (dpadR) {
          engineRef.current.movePlayerAnalog(3.2);
        }

        // Action A, X, or RT to fire laser
        if (snapshot.buttons.has('A') || snapshot.buttons.has('X') || snapshot.rt > 0.5) {
          engineRef.current.firePlayerLaser();
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
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_40%,rgba(239,68,68,0.12),transparent_70%)]" />

      {/* Top Header Controls */}
      <header className="relative z-10 w-full max-w-4xl flex items-center justify-between px-3 py-2 mb-2 bg-slate-900/80 backdrop-blur border border-red-500/30 rounded-xl shadow-lg">
        <button
          onClick={onBackToLobby}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-950/60 hover:bg-red-900/80 text-red-300 hover:text-white border border-red-500/40 text-xs sm:text-sm font-bold transition-all shadow-sm active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Lobby</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-sm sm:text-base font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-amber-300 to-blue-400">
            NAMCO GALAGA • 1981
          </span>
          <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-bold uppercase bg-red-500/20 text-red-300 border border-red-500/40 rounded">
            DUAL FIGHTER
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => engineRef.current?.restartGame()}
            title="Herstarten"
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-600 transition-all active:scale-95"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsMuted(!isMuted)}
            title={isMuted ? 'Geluid Aanzetten' : 'Geluid Dempen'}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-600 transition-all active:scale-95"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>
        </div>
      </header>

      {/* Main Arcade Cabinet Structure */}
      <div className="relative z-10 w-full max-w-[440px] flex flex-col items-center bg-gradient-to-b from-neutral-900 via-slate-900 to-neutral-950 border-4 border-red-600/60 rounded-3xl p-3 sm:p-4 shadow-[0_0_50px_rgba(239,68,68,0.35)]">
        
        {/* Marquee Header */}
        <div className="w-full py-2 px-4 mb-3 rounded-xl bg-gradient-to-r from-red-950 via-slate-900 to-blue-950 border-2 border-red-500/50 flex items-center justify-between shadow-inner">
          <div className="flex items-center gap-2">
            <span className="text-xl">🚀</span>
            <div>
              <h1 className="text-lg font-black tracking-wider text-red-400 drop-shadow-[0_0_10px_rgba(239,68,68,0.8)]">
                GALAGA
              </h1>
              <p className="text-[10px] text-amber-300/80 font-mono tracking-tighter">
                NAMCO 1981 • TRACTOR BEAM
              </p>
            </div>
          </div>
          <div className="text-right font-mono">
            <div className="text-[9px] text-slate-400 uppercase">COIN-OP</div>
            <div className="text-xs font-bold text-amber-400 animate-pulse">FREE PLAY</div>
          </div>
        </div>

        {/* CRT Bezel & Screen Wrapper */}
        <div className="relative w-full aspect-[3/4] max-h-[560px] bg-black rounded-2xl overflow-hidden border-4 border-slate-800 shadow-[inset_0_0_30px_rgba(0,0,0,0.9)] flex items-center justify-center">
          
          <canvas
            ref={canvasRef}
            width={288}
            height={384}
            className="w-full h-full object-contain cursor-crosshair"
            style={{ imageRendering: 'pixelated' }}
          />

          {/* CRT Scanlines Overlay */}
          <div 
            className="absolute inset-0 pointer-events-none opacity-25"
            style={{
              backgroundImage: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.5) 0px, rgba(0,0,0,0.5) 1px, transparent 1px, transparent 2px)'
            }}
          />

          {/* CRT Curved Screen Glass Reflection */}
          <div className="absolute inset-0 pointer-events-none rounded-2xl bg-gradient-to-tr from-transparent via-white/[0.03] to-white/[0.08]" />
        </div>

        {/* Virtual Controller Touch & Quick Guide */}
        <div className="w-full mt-3 flex flex-col gap-2">
          
          {/* Mobile Touch Action Buttons */}
          <div className="grid grid-cols-3 gap-2 w-full sm:hidden">
            <button
              onTouchStart={() => engineRef.current?.movePlayerLeft()}
              className="py-3 bg-slate-800/80 active:bg-red-600 rounded-xl border border-slate-600 text-center font-bold text-sm"
            >
              ◀ LINKS
            </button>
            <button
              onTouchStart={() => engineRef.current?.firePlayerLaser()}
              className="py-3 bg-red-600 active:bg-red-500 rounded-xl border border-red-400 text-center font-black text-sm shadow-md"
            >
              🔥 VUUR
            </button>
            <button
              onTouchStart={() => engineRef.current?.movePlayerRight()}
              className="py-3 bg-slate-800/80 active:bg-red-600 rounded-xl border border-slate-600 text-center font-bold text-sm"
            >
              RECHTS ▶
            </button>
          </div>

          {/* Info Footer & Gamepad telemetry */}
          <div className="flex items-center justify-between px-3 py-2 bg-slate-950/80 rounded-xl border border-slate-800 text-[11px] text-slate-400">
            <div className="flex items-center gap-2">
              <Gamepad2 className="w-4 h-4 text-red-400" />
              <span>Stick / Pijltjes: Vliegen • Spatie / A: Schieten</span>
            </div>
            <div className="text-amber-400 font-mono text-[10px]">
              Tractor Beam = Dual Fighter!
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
