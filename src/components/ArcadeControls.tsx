import React from 'react';
import {
  Volume2,
  VolumeX,
  RotateCcw,
  Pause,
  Play,
  Sliders,
  Tv,
  Eye,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Trophy,
  Smartphone,
  Vibrate,
  VibrateOff,
  Compass,
  RotateCw
} from 'lucide-react';
import { Direction, GameState } from '../types';

interface ArcadeControlsProps {
  onDirection: (dir: Direction) => void;
  gameState: GameState;
  isMuted: boolean;
  onToggleMute: () => void;
  onTogglePause: () => void;
  onRestart: () => void;
  onOpenDifficulty: () => void;
  onOpenLeaderboard: () => void;
  isCrtEnabled: boolean;
  onToggleCrt: () => void;
  showDebug: boolean;
  onToggleDebug: () => void;
  isHapticsEnabled?: boolean;
  onToggleHaptics?: () => void;
  isTiltActive?: boolean;
  onToggleTilt?: () => void;
  onCalibrateTilt?: () => void;
  tiltDirection?: Direction | null;
  tiltBeta?: number;
  tiltGamma?: number;
}

export const ArcadeControls: React.FC<ArcadeControlsProps> = ({
  onDirection,
  gameState,
  isMuted,
  onToggleMute,
  onTogglePause,
  onRestart,
  onOpenDifficulty,
  onOpenLeaderboard,
  isCrtEnabled,
  onToggleCrt,
  showDebug,
  onToggleDebug,
  isHapticsEnabled = true,
  onToggleHaptics,
  isTiltActive = false,
  onToggleTilt,
  onCalibrateTilt,
  tiltDirection = null,
  tiltBeta = 42,
  tiltGamma = 0
}) => {
  return (
    <div className="flex flex-col items-center gap-3.5 w-full max-w-md mx-auto select-none">
      {/* Top Action Toolbar */}
      <div className="flex flex-wrap items-center justify-center gap-2 p-2 bg-neutral-950/90 border border-gray-900 rounded-xl w-full shadow-lg">
        {/* Play/Pause */}
        <button
          onClick={onTogglePause}
          title={gameState === 'PAUSED' ? 'Hervatten' : 'Pauzeren'}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-200 text-xs font-semibold border border-neutral-800 transition-colors active:scale-95 cursor-pointer"
        >
          {gameState === 'PAUSED' ? (
            <>
              <Play className="w-3.5 h-3.5 text-emerald-400" />
              <span>Verder</span>
            </>
          ) : (
            <>
              <Pause className="w-3.5 h-3.5 text-yellow-400" />
              <span>Pauze</span>
            </>
          )}
        </button>

        {/* Topscores / Hall of Fame */}
        <button
          onClick={onOpenLeaderboard}
          title="Bekijk Arcade Leaderboard & Topscores"
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-yellow-300 text-xs font-semibold border border-yellow-500/40 transition-colors active:scale-95 cursor-pointer"
        >
          <Trophy className="w-3.5 h-3.5 text-yellow-400" />
          <span>Topscores</span>
        </button>

        {/* Restart */}
        <button
          onClick={onRestart}
          title="Herstart spel"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-200 text-xs font-semibold border border-neutral-800 transition-colors active:scale-95 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5 text-pink-500" />
          <span>Herstart</span>
        </button>

        {/* Audio Mute */}
        <button
          onClick={onToggleMute}
          title={isMuted ? 'Geluid AAN' : 'Geluid DEMPEN'}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors active:scale-95 cursor-pointer ${
            isMuted
              ? 'bg-red-950/70 border-red-800 text-red-300'
              : 'bg-neutral-900 hover:bg-neutral-800 text-neutral-200 border-neutral-800'
          }`}
        >
          {isMuted ? (
            <>
              <VolumeX className="w-3.5 h-3.5 text-red-400" />
              <span>Gedempt</span>
            </>
          ) : (
            <>
              <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Geluid</span>
            </>
          )}
        </button>

        {/* Haptics (Trillen) Toggle */}
        {onToggleHaptics && (
          <button
            onClick={onToggleHaptics}
            title={isHapticsEnabled ? 'Trillen (Haptics) Uitschakelen' : 'Trillen (Haptics) Inschakelen'}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-colors active:scale-95 cursor-pointer ${
              isHapticsEnabled
                ? 'bg-emerald-950/70 border-emerald-600 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.25)]'
                : 'bg-neutral-900 hover:bg-neutral-800 text-neutral-400 border-neutral-800'
            }`}
          >
            {isHapticsEnabled ? (
              <>
                <Vibrate className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                <span>Trillen AAN</span>
              </>
            ) : (
              <>
                <VibrateOff className="w-3.5 h-3.5 text-neutral-500" />
                <span>Trillen UIT</span>
              </>
            )}
          </button>
        )}

        {/* iPhone Kantelen (Tilt) Toggle */}
        {onToggleTilt && (
          <button
            onClick={onToggleTilt}
            title={isTiltActive ? 'Kantelbesturing uitschakelen' : 'Beweeg Pac-Man door je telefoon te kantelen!'}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-colors active:scale-95 cursor-pointer ${
              isTiltActive
                ? 'bg-purple-950/90 border-purple-500 text-purple-200 shadow-[0_0_12px_rgba(168,85,247,0.4)] ring-1 ring-purple-400'
                : 'bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border-neutral-800'
            }`}
          >
            <Smartphone className={`w-3.5 h-3.5 ${isTiltActive ? 'text-purple-400 animate-bounce' : 'text-purple-300'}`} />
            <span>Kantelen {isTiltActive ? 'AAN' : 'UIT'}</span>
          </button>
        )}

        {/* CRT Scanline Filter Toggle */}
        <button
          onClick={onToggleCrt}
          title="CRT Monitor Filter Aan/Uit"
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-colors active:scale-95 cursor-pointer ${
            isCrtEnabled
              ? 'bg-blue-950/80 border-blue-600 text-blue-300 shadow-[0_0_10px_rgba(37,99,235,0.4)]'
              : 'bg-neutral-900 hover:bg-neutral-800 text-neutral-400 border-neutral-800'
          }`}
        >
          <Tv className="w-3.5 h-3.5" />
          <span>CRT {isCrtEnabled ? 'AAN' : 'UIT'}</span>
        </button>

        {/* Difficulty / Level Select */}
        <button
          onClick={onOpenDifficulty}
          title="Moeilijkheid & Level kiezer"
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-yellow-300 text-xs font-semibold border border-yellow-500/40 transition-colors active:scale-95 cursor-pointer"
        >
          <Sliders className="w-3.5 h-3.5 text-yellow-400" />
          <span>Level</span>
        </button>

        {/* AI Inspector Toggle */}
        <button
          onClick={onToggleDebug}
          title="Bekijk Spook AI logica"
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-colors active:scale-95 cursor-pointer ${
            showDebug
              ? 'bg-pink-950/80 border-pink-500 text-pink-300 shadow-[0_0_10px_rgba(236,72,153,0.4)]'
              : 'bg-neutral-900 hover:bg-neutral-800 text-neutral-400 border-neutral-800'
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Spook AI</span>
        </button>
      </div>

      {/* Tilt Gyro Active Feedback & Calibration Card */}
      {isTiltActive && (
        <div className="w-full p-2.5 bg-purple-950/50 border border-purple-800/90 rounded-xl flex items-center justify-between text-xs animate-in fade-in shadow-[0_0_15px_rgba(168,85,247,0.15)]">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-purple-400 animate-spin" />
            <div>
              <div className="font-bold text-purple-200">iPhone Kantelbesturing Actief</div>
              <div className="text-[10px] text-purple-300/80">
                Kantel naar voren/achteren & links/rechts
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {tiltDirection && (
              <span className="px-2 py-0.5 rounded bg-purple-900 text-yellow-300 font-black text-[10px] border border-purple-600">
                {tiltDirection}
              </span>
            )}
            {onCalibrateTilt && (
              <button
                type="button"
                onClick={onCalibrateTilt}
                title="Kalibreer nulpunt op hoe je je telefoon nu vasthoudt"
                className="px-2 py-1 bg-purple-900/80 hover:bg-purple-800 text-purple-200 rounded text-[10px] font-bold border border-purple-700 transition-colors flex items-center gap-1 cursor-pointer active:scale-95"
              >
                <RotateCw className="w-3 h-3" />
                <span>Kalibreer</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Touch / Clickable D-Pad for Mobile or Tablet */}
      <div className="flex flex-col items-center select-none pt-1">
        <div className="text-[10px] text-pink-500/90 mb-2 font-mono tracking-wider font-semibold text-center">
          MOBIEL: VEEG OVER HET SCHERM, KANTEL OF GEBRUIK D-PAD
        </div>

        <div className="grid grid-cols-3 gap-1.5 w-44 h-44 p-2 bg-neutral-950 border-2 border-blue-600/40 rounded-2xl shadow-[0_0_20px_rgba(37,99,235,0.15)]">
          {/* Row 1 */}
          <div />
          <button
            onClick={() => onDirection('UP')}
            className={`flex items-center justify-center rounded-xl border shadow transition-all active:scale-95 cursor-pointer ${
              tiltDirection === 'UP'
                ? 'bg-yellow-400 text-black border-yellow-300 shadow-[0_0_15px_rgba(250,204,21,0.6)]'
                : 'bg-neutral-900 hover:bg-neutral-800 active:bg-yellow-400 active:text-black text-white border-neutral-800'
            }`}
            aria-label="Omhoog"
          >
            <ArrowUp className="w-6 h-6" />
          </button>
          <div />

          {/* Row 2 */}
          <button
            onClick={() => onDirection('LEFT')}
            className={`flex items-center justify-center rounded-xl border shadow transition-all active:scale-95 cursor-pointer ${
              tiltDirection === 'LEFT'
                ? 'bg-yellow-400 text-black border-yellow-300 shadow-[0_0_15px_rgba(250,204,21,0.6)]'
                : 'bg-neutral-900 hover:bg-neutral-800 active:bg-yellow-400 active:text-black text-white border-neutral-800'
            }`}
            aria-label="Links"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex items-center justify-center bg-neutral-950 rounded-lg text-[9px] font-bold text-yellow-400/80 border border-neutral-900">
            PAC
          </div>
          <button
            onClick={() => onDirection('RIGHT')}
            className={`flex items-center justify-center rounded-xl border shadow transition-all active:scale-95 cursor-pointer ${
              tiltDirection === 'RIGHT'
                ? 'bg-yellow-400 text-black border-yellow-300 shadow-[0_0_15px_rgba(250,204,21,0.6)]'
                : 'bg-neutral-900 hover:bg-neutral-800 active:bg-yellow-400 active:text-black text-white border-neutral-800'
            }`}
            aria-label="Rechts"
          >
            <ArrowRight className="w-6 h-6" />
          </button>

          {/* Row 3 */}
          <div />
          <button
            onClick={() => onDirection('DOWN')}
            className={`flex items-center justify-center rounded-xl border shadow transition-all active:scale-95 cursor-pointer ${
              tiltDirection === 'DOWN'
                ? 'bg-yellow-400 text-black border-yellow-300 shadow-[0_0_15px_rgba(250,204,21,0.6)]'
                : 'bg-neutral-900 hover:bg-neutral-800 active:bg-yellow-400 active:text-black text-white border-neutral-800'
            }`}
            aria-label="Omlaag"
          >
            <ArrowDown className="w-6 h-6" />
          </button>
          <div />
        </div>
      </div>
    </div>
  );
};
