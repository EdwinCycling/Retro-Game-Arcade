/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  ClassicBattleshipEngine, 
  FLEET_DEFINITIONS, 
  PlacedShip 
} from '../game/classicBattleshipEngine';
import { 
  RotateCcw, 
  Play, 
  Shuffle, 
  Volume2, 
  VolumeX, 
  Trophy, 
  Target, 
  ShieldAlert, 
  Crosshair,
  Anchor,
  HelpCircle,
  BookOpen
} from 'lucide-react';
import { haptics } from '../utils/haptics';

interface ClassicBattleshipViewProps {
  onBackToLobby: () => void;
  onSwitchToBimaru: () => void;
}

export const ClassicBattleshipView: React.FC<ClassicBattleshipViewProps> = ({
  onBackToLobby,
  onSwitchToBimaru
}) => {
  const [engine] = useState(() => new ClassicBattleshipEngine());
  const [, setTick] = useState(0);

  const rerender = () => setTick(t => t + 1);

  // Initialize player fleet automatically on start
  useEffect(() => {
    engine.autoPlacePlayerFleet();
    rerender();
  }, [engine]);

  const handleRandomizePlayerFleet = () => {
    if (engine.phase !== 'placement') return;
    engine.autoPlacePlayerFleet();
    engine.lastShotResult = { text: '🎲 Nieuwe vloot op het ruitjespapier getekend!', type: 'info' };
    haptics.selection();
    rerender();
  };

  const handleStartBattle = () => {
    if (engine.startBattle()) {
      haptics.success();
      rerender();
    }
  };

  const handleFire = (r: number, c: number) => {
    if (engine.phase !== 'playing' || engine.turn !== 'player') return;
    const success = engine.playerFire(r, c);
    if (success) {
      haptics.light();
      rerender();
    }
  };

  const handleReset = () => {
    engine.initGame();
    engine.autoPlacePlayerFleet();
    rerender();
  };

  const colLabels = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
  const rowLabels = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col gap-4 font-sans select-none my-2">
      
      {/* Top Banner Control Bar */}
      <div className="bg-amber-950/40 border border-amber-600/40 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-900/80 border border-amber-500/60 flex items-center justify-center text-xl shadow-inner">
            ✏️
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h2 className="font-mono font-bold text-amber-300 text-sm tracking-wide">
                ZEESLAG OP RUITJESPAPIER (SINK THE BOAT)
              </h2>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-700/50">
                KLASSIEK PAPIER & POTLOOD
              </span>
            </div>
            <p className="text-xs font-mono text-slate-300">
              Teken je geheime vloot op het ruitjespapier en vuur torpedo-coördinaten af op het vijandelijke raster!
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {engine.phase === 'placement' && (
            <>
              <button
                onClick={handleRandomizePlayerFleet}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 text-xs font-mono font-bold transition-all cursor-pointer active:scale-95"
              >
                <Shuffle className="w-3.5 h-3.5 text-amber-400" />
                <span>🎲 Vloot Schudden</span>
              </button>

              <button
                onClick={handleStartBattle}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-mono font-black text-xs shadow-[0_0_15px_rgba(239,68,68,0.5)] transition-transform active:scale-95 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>⚔️ START DE ZEESLAG!</span>
              </button>
            </>
          )}

          {engine.phase === 'game_over' && (
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-slate-950 font-mono font-black text-xs shadow-[0_0_15px_#facc15] transition-transform active:scale-95 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Nieuwe Zeeslag Tekenen</span>
            </button>
          )}

          <button
            onClick={onSwitchToBimaru}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-950/80 hover:bg-cyan-900 text-cyan-200 border border-cyan-700/60 text-xs font-mono transition-all cursor-pointer"
            title="Schakel naar Zeeslag Solitaire Bimaru (Logica Puzzel)"
          >
            <span>🧩 Solitaire Bimaru Mode</span>
          </button>
        </div>
      </div>

      {/* Status Alert Banner */}
      {engine.lastShotResult && (
        <div className={`p-3 rounded-2xl border flex items-center gap-3 font-mono text-xs shadow-lg transition-all animate-fade-in ${
          engine.lastShotResult.type === 'hit' 
            ? 'bg-rose-950/80 border-rose-500/80 text-rose-200'
            : engine.lastShotResult.type === 'sunk'
            ? 'bg-amber-950/90 border-amber-400 text-amber-200'
            : engine.lastShotResult.type === 'miss'
            ? 'bg-sky-950/80 border-sky-500/80 text-sky-200'
            : 'bg-slate-900/90 border-amber-500/40 text-amber-300'
        }`}>
          <span className="text-xl">
            {engine.lastShotResult.type === 'hit' ? '💥' : engine.lastShotResult.type === 'sunk' ? '⚓' : engine.lastShotResult.type === 'miss' ? '🌊' : '✏️'}
          </span>
          <span className="font-semibold">{engine.lastShotResult.text}</span>
        </div>
      )}

      {/* Main Graph Paper Desks Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        
        {/* LEFT: Player Grid on Graph Paper */}
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center justify-between w-full max-w-[480px] px-1 font-mono text-xs">
            <span className="font-bold text-amber-300 flex items-center gap-1.5">
              <span>📋 MIJN RUITJESSCHRIFT (JOUW VLOOT)</span>
            </span>
            <span className="text-slate-400 text-[11px]">
              Gezonken: {engine.playerShips.filter(s => s.isSunk).length} / 5
            </span>
          </div>

          {/* Graph Paper Sheet Container */}
          <div className="relative w-full max-w-[480px] bg-[#f8f6e8] border-2 border-amber-900/40 rounded-2xl p-4 shadow-[0_10px_30px_rgba(0,0,0,0.5)] overflow-hidden font-mono text-slate-800">
            
            {/* Grid background lines */}
            <div 
              className="absolute inset-0 pointer-events-none opacity-25"
              style={{
                backgroundImage: `
                  linear-gradient(to right, #2563eb 1px, transparent 1px),
                  linear-gradient(to bottom, #2563eb 1px, transparent 1px)
                `,
                backgroundSize: '10% 10%'
              }}
            />

            {/* Red Margin Line */}
            <div className="absolute top-0 bottom-0 left-8 w-[2px] bg-red-400/60 pointer-events-none" />

            {/* Column Headers */}
            <div className="grid grid-cols-10 pl-6 w-full pb-1 text-center text-xs font-bold text-blue-900">
              {colLabels.map(col => (
                <span key={`p-col-${col}`}>{col}</span>
              ))}
            </div>

            {/* 10x10 Grid Rows */}
            <div className="flex flex-col gap-0.5 w-full">
              {engine.playerGrid.map((row, r) => (
                <div key={`p-row-${r}`} className="flex items-center w-full">
                  {/* Row Label */}
                  <span className="w-6 text-right pr-1 text-[11px] font-bold text-blue-900">
                    {r + 1}
                  </span>

                  {/* Row Cells */}
                  <div className="grid grid-cols-10 gap-0.5 w-full aspect-[10/1]">
                    {row.map((cell, c) => {
                      const ship = cell.shipId ? engine.playerShips.find(s => s.id === cell.shipId) : null;

                      return (
                        <div
                          key={`p-cell-${r}-${c}`}
                          className={`
                            relative aspect-square border border-blue-400/30 rounded flex items-center justify-center text-sm font-bold transition-all select-none
                            ${cell.hasShip ? 'bg-blue-200/80 border-blue-600/60' : 'bg-transparent'}
                            ${cell.isHit ? 'bg-red-200/90' : ''}
                            ${cell.isMiss ? 'bg-cyan-100/60' : ''}
                          `}
                        >
                          {/* Ship Icon */}
                          {cell.hasShip && !cell.isHit && (
                            <span className="text-xs">{ship?.icon || '🚢'}</span>
                          )}

                          {/* Hit Mark (Red ballpoint cross) */}
                          {cell.isHit && (
                            <span className="text-rose-600 font-black text-sm drop-shadow">💥</span>
                          )}

                          {/* Miss Mark (Blue water splash dot) */}
                          {cell.isMiss && (
                            <span className="text-blue-600 font-bold text-xs">🌊</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT: AI Radar Grid on Graph Paper */}
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center justify-between w-full max-w-[480px] px-1 font-mono text-xs">
            <span className="font-bold text-cyan-300 flex items-center gap-1.5">
              <span>🎯 SLAGVELD COÖRDINATEN (VIJANDELIJKE KAART)</span>
            </span>
            <span className="text-slate-400 text-[11px]">
              Vijand Gezonken: {engine.aiShips.filter(s => s.isSunk).length} / 5
            </span>
          </div>

          {/* Graph Paper Sheet Container */}
          <div className="relative w-full max-w-[480px] bg-[#f8f6e8] border-2 border-cyan-900/40 rounded-2xl p-4 shadow-[0_10px_30px_rgba(0,0,0,0.5)] overflow-hidden font-mono text-slate-800">
            
            {/* Grid background lines */}
            <div 
              className="absolute inset-0 pointer-events-none opacity-25"
              style={{
                backgroundImage: `
                  linear-gradient(to right, #2563eb 1px, transparent 1px),
                  linear-gradient(to bottom, #2563eb 1px, transparent 1px)
                `,
                backgroundSize: '10% 10%'
              }}
            />

            {/* Red Margin Line */}
            <div className="absolute top-0 bottom-0 left-8 w-[2px] bg-red-400/60 pointer-events-none" />

            {/* Column Headers */}
            <div className="grid grid-cols-10 pl-6 w-full pb-1 text-center text-xs font-bold text-blue-900">
              {colLabels.map(col => (
                <span key={`ai-col-${col}`}>{col}</span>
              ))}
            </div>

            {/* 10x10 Grid Rows */}
            <div className="flex flex-col gap-0.5 w-full">
              {engine.aiGrid.map((row, r) => (
                <div key={`ai-row-${r}`} className="flex items-center w-full">
                  {/* Row Label */}
                  <span className="w-6 text-right pr-1 text-[11px] font-bold text-blue-900">
                    {r + 1}
                  </span>

                  {/* Row Cells */}
                  <div className="grid grid-cols-10 gap-0.5 w-full aspect-[10/1]">
                    {row.map((cell, c) => {
                      const isAlreadyShot = cell.isHit || cell.isMiss;
                      const isSunkShip = cell.hasShip && cell.isHit && engine.aiShips.find(s => s.id === cell.shipId)?.isSunk;

                      return (
                        <button
                          key={`ai-cell-${r}-${c}`}
                          type="button"
                          disabled={engine.phase !== 'playing' || engine.turn !== 'player' || isAlreadyShot}
                          onClick={() => handleFire(r, c)}
                          className={`
                            relative aspect-square border border-blue-400/30 rounded flex items-center justify-center text-sm font-bold transition-all select-none
                            ${!isAlreadyShot && engine.phase === 'playing' ? 'hover:bg-amber-200/80 cursor-pointer hover:border-amber-500 active:scale-95' : ''}
                            ${cell.isHit ? 'bg-red-200/90' : ''}
                            ${cell.isMiss ? 'bg-cyan-100/60' : ''}
                          `}
                          title={`Vuur op coördinaat ${colLabels[c]}${r + 1}`}
                        >
                          {/* Hit Mark (Red ballpoint cross) */}
                          {cell.isHit && (
                            <span className="text-rose-600 font-black text-sm drop-shadow">💥</span>
                          )}

                          {/* Miss Mark (Blue water splash dot) */}
                          {cell.isMiss && (
                            <span className="text-blue-600 font-bold text-xs">🌊</span>
                          )}

                          {/* Sunk Ship Badge */}
                          {isSunkShip && (
                            <span className="absolute text-[10px] bottom-0.5 right-0.5">⚓</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Fleet Overview Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 font-mono text-xs shadow-xl space-y-2">
        <h4 className="font-bold text-amber-400 border-b border-slate-800 pb-2 flex items-center justify-between">
          <span>🚢 VLOOT STATUS OVERZICHT</span>
          <span className="text-[11px] text-slate-400">5 Schepen (Totaal 17 Segmenten)</span>
        </h4>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-1">
          {FLEET_DEFINITIONS.map(def => {
            const pShip = engine.playerShips.find(s => s.id === def.id);
            const aiShip = engine.aiShips.find(s => s.id === def.id);

            return (
              <div key={def.id} className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex flex-col gap-1">
                <div className="flex items-center gap-1.5 font-bold text-slate-200 text-xs">
                  <span>{def.icon}</span>
                  <span>{def.nameNl}</span>
                </div>
                <div className="text-[10px] text-slate-400">
                  Lengte: {def.size} vakjes
                </div>
                <div className="flex flex-col gap-0.5 mt-1 text-[10px]">
                  <span className={pShip?.isSunk ? 'text-red-400 font-bold' : 'text-emerald-400'}>
                    Jouw: {pShip?.isSunk ? '💥 GEZONKEN' : '🟢 INTEL' }
                  </span>
                  <span className={aiShip?.isSunk ? 'text-emerald-400 font-bold' : 'text-slate-400'}>
                    Vijand: {aiShip?.isSunk ? '💥 GEZONKEN' : '❓ ONBEKEND'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
