import React from 'react';
import { GhostEntity, GhostMode } from '../types';

interface GhostAiInspectorProps {
  ghosts: GhostEntity[];
  globalMode: 'SCATTER' | 'CHASE';
  dotsRemaining: number;
  dotsEaten: number;
  frightenedActive: boolean;
  showDebugLines: boolean;
  onToggleDebugLines: () => void;
}

export const GhostAiInspector: React.FC<GhostAiInspectorProps> = ({
  ghosts,
  globalMode,
  dotsRemaining,
  dotsEaten,
  frightenedActive,
  showDebugLines,
  onToggleDebugLines
}) => {
  const getModeBadge = (mode: GhostMode) => {
    switch (mode) {
      case 'CHASE':
        return <span className="bg-red-900/60 text-red-300 border border-red-500/50 px-1.5 py-0.5 rounded text-[9px]">CHASE</span>;
      case 'SCATTER':
        return <span className="bg-emerald-900/60 text-emerald-300 border border-emerald-500/50 px-1.5 py-0.5 rounded text-[9px]">SCATTER</span>;
      case 'FRIGHTENED':
        return <span className="bg-blue-900/70 text-blue-300 border border-blue-400 px-1.5 py-0.5 rounded text-[9px] animate-pulse">FRIGHTENED</span>;
      case 'EATEN':
        return <span className="bg-purple-900/60 text-purple-300 border border-purple-400 px-1.5 py-0.5 rounded text-[9px]">RETURNING</span>;
      case 'IN_HOUSE':
        return <span className="bg-neutral-800 text-neutral-400 border border-neutral-700 px-1.5 py-0.5 rounded text-[9px]">HOUSE</span>;
    }
  };

  const getGhostAiDescription = (name: string) => {
    switch (name) {
      case 'blinky':
        return 'Direct target: jaagt altijd rechtstreeks op Pac-Man. Krijgt "Cruise Elroy" snelheidsboost wanneer stippen opraken!';
      case 'pinky':
        return 'Hinderlaag: richt op 4 tegels vóór Pac-Man (bevat originele 1980 UP-overflow bug: 4 omhoog + 4 naar links).';
      case 'inky':
        return 'Dubbele vector: berekent vector van Blinky naar 2 tegels vóór Pac-Man en verdubbelt deze afstand.';
      case 'clyde':
        return 'Wispelturig: jaagt op Pac-Man zolang afstand >= 8 tegels is, maar vlucht paniekerig naar zijn hoek zodra hij dichterbij komt!';
      default:
        return '';
    }
  };

  const getGhostBorder = (name: string) => {
    switch (name) {
      case 'blinky': return 'border-red-500/40 hover:border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.15)]';
      case 'pinky': return 'border-pink-500/40 hover:border-pink-500 shadow-[0_0_15px_rgba(236,72,153,0.15)]';
      case 'inky': return 'border-cyan-500/40 hover:border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.15)]';
      case 'clyde': return 'border-amber-500/40 hover:border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.15)]';
      default: return 'border-neutral-800';
    }
  };

  return (
    <div className="bg-neutral-950 border-2 border-blue-600/30 rounded-xl p-4 text-xs font-mono space-y-3 shadow-xl">
      <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-pink-500 animate-pulse"></span>
          <span className="font-bold text-pink-500 tracking-wider text-[11px]">
            ORIGINEEL SPOOK AI GEDRAG (1980)
          </span>
        </div>
        <button
          onClick={onToggleDebugLines}
          className={`px-2.5 py-1 rounded text-[10px] font-bold transition-all border ${
            showDebugLines
              ? 'bg-yellow-400 text-black border-yellow-300 shadow-[0_0_10px_rgba(250,204,21,0.5)]'
              : 'bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border-neutral-700'
          }`}
        >
          {showDebugLines ? '✓ Target Lijnen AAN' : 'Target Lijnen UIT'}
        </button>
      </div>

      {/* Global Status Bar */}
      <div className="grid grid-cols-3 gap-2 bg-black border border-neutral-900 p-2 rounded-lg text-center text-[10px]">
        <div>
          <span className="text-neutral-500 block text-[9px] uppercase tracking-wider">Globale Golf</span>
          <span className={`font-bold text-xs ${globalMode === 'CHASE' ? 'text-red-400' : 'text-emerald-400'}`}>
            {frightenedActive ? 'FRIGHTENED' : globalMode}
          </span>
        </div>
        <div>
          <span className="text-neutral-500 block text-[9px] uppercase tracking-wider">Stippen Gegeten</span>
          <span className="font-bold text-xs text-yellow-300">{dotsEaten} / 244</span>
        </div>
        <div>
          <span className="text-neutral-500 block text-[9px] uppercase tracking-wider">Resterend</span>
          <span className="font-bold text-xs text-white">{dotsRemaining}</span>
        </div>
      </div>

      {/* Ghost list cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
        {ghosts.map(ghost => (
          <div
            key={ghost.name}
            className={`bg-neutral-950 border rounded-lg p-2.5 space-y-1.5 transition-all ${getGhostBorder(ghost.name)}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-full inline-block shadow-sm"
                  style={{ backgroundColor: ghost.color }}
                ></span>
                <span className="font-bold text-[11px] text-white">
                  {ghost.displayName}
                </span>
                <span className="text-neutral-500 text-[9px]">
                  ({ghost.characterName})
                </span>
              </div>
              {getModeBadge(ghost.mode)}
            </div>
            <p className="text-neutral-300 text-[10px] leading-relaxed">
              {getGhostAiDescription(ghost.name)}
            </p>
            <div className="text-[9px] text-neutral-400 flex justify-between pt-1 border-t border-neutral-900 font-mono">
              <span>Pos: ({Math.round(ghost.tileX)}, {Math.round(ghost.tileY)})</span>
              <span className="text-yellow-400/90 font-bold">{ghost.dir}</span>
              <span>Doel: ({Math.round(ghost.targetTile.x)}, {Math.round(ghost.targetTile.y)})</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
