/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { GameMetadata, Language } from '../i18n/lobbyTranslations';
import { Play, Sparkles, Trophy, Info, Eye } from 'lucide-react';
import { arcadeHallAudio } from '../utils/arcadeHallAudio';
import { haptics } from '../utils/haptics';

interface ArcadeFloorViewProps {
  games: GameMetadata[];
  lang: Language;
  onLaunchGame: (gameId: GameMetadata['id']) => void;
  onOpenDossier: (gameId: GameMetadata['id']) => void;
  highScores: Record<string, { score: number | string; initials: string }>;
}

export const ArcadeFloorView: React.FC<ArcadeFloorViewProps> = ({
  games,
  lang,
  onLaunchGame,
  onOpenDossier,
  highScores
}) => {
  const [selectedCabinet, setSelectedCabinet] = useState<GameMetadata['id']>(games[0]?.id || 'pacman');

  const selectedGame = games.find(g => g.id === selectedCabinet) || games[0];
  const scoreInfo = selectedGame ? highScores[selectedGame.id] : null;

  const handleSelect = (gameId: GameMetadata['id']) => {
    haptics.selection();
    arcadeHallAudio.playSwitch();
    setSelectedCabinet(gameId);
  };

  const handlePlay = (gameId: GameMetadata['id']) => {
    haptics.success();
    arcadeHallAudio.playCoinDrop();
    onLaunchGame(gameId);
  };

  return (
    <div className="relative w-full rounded-3xl overflow-hidden border-2 border-neutral-800/90 bg-neutral-950 shadow-2xl p-4 sm:p-8">
      {/* Ceiling Neon Lamps & Atmospheric Lighting */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-cyan-500/10 via-purple-500/5 to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-neutral-950/80 to-black pointer-events-none" />

      {/* Perspective Retro Neon Grid Floor */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-64 opacity-25 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(6, 182, 212, 0.4) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(168, 85, 247, 0.4) 1px, transparent 1px)
          `,
          backgroundSize: '40px 30px',
          transform: 'perspective(300px) rotateX(45deg)',
          transformOrigin: 'bottom center'
        }}
      />

      {/* Header Info Bar in Floor View */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-neutral-800/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
            <h3 className="text-xl sm:text-2xl font-black font-mono tracking-tight text-white flex items-center gap-2">
              <span>{lang === 'nl' ? 'SPEELHAL KASTENVLOER' : 'ARCADE CABINET FLOOR'}</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-700">
                {games.length} UPRIGHTS
              </span>
            </h3>
          </div>
          <p className="text-xs text-neutral-400 font-mono mt-1">
            {lang === 'nl'
              ? 'Wandel langs de kasten en klik op een machine om direct te spelen!'
              : 'Stroll past the cabinets and select any machine to play directly!'}
          </p>
        </div>

        {/* Selected Cabinet Quick Action Bar */}
        {selectedGame && (
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => onOpenDossier(selectedGame.id)}
              className="px-3.5 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-200 text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Info className="w-3.5 h-3.5 text-cyan-400" />
              <span>{lang === 'nl' ? 'Dossier' : 'Dossier'}</span>
            </button>
            <button
              type="button"
              onClick={() => handlePlay(selectedGame.id)}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-black text-xs font-black font-mono tracking-wider shadow-[0_0_20px_rgba(250,204,21,0.5)] transition-all transform active:scale-95 flex items-center gap-2 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-black" />
              <span>{lang === 'nl' ? `SPEEL ${selectedGame.title}` : `PLAY ${selectedGame.title}`}</span>
            </button>
          </div>
        )}
      </div>



      {/* Interactive Arcade Floor Layout: Scrolling Row of Upright Cabinets */}
      <div className="relative z-10 pt-6">
        <div className="flex items-end gap-4 sm:gap-6 overflow-x-auto pb-6 pt-4 scrollbar-thin scrollbar-thumb-neutral-700 scrollbar-track-neutral-900 px-2">
          {games.map((game) => {
            const isSelected = game.id === selectedCabinet;
            const top = highScores[game.id];

            return (
              <div
                key={game.id}
                onClick={() => handleSelect(game.id)}
                className={`group relative flex-shrink-0 cursor-pointer transition-all duration-300 flex flex-col items-center ${
                  isSelected ? 'scale-105 -translate-y-2' : 'hover:-translate-y-1 opacity-80 hover:opacity-100'
                }`}
                style={{ width: '190px' }}
              >
                {/* Year Pill Floating above Marquee */}
                <div className="mb-2 flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-neutral-900/90 border border-neutral-700 text-[10px] font-mono font-black shadow-md">
                  <span>{game.yearIcon}</span>
                  <span className="text-white">{game.yearDisplay}</span>
                  <span className="text-neutral-400 font-normal">| {game.systemName[lang].split(' ')[0]}</span>
                </div>

                {/* The Upright Arcade Cabinet Shell */}
                <div 
                  className={`w-full rounded-t-2xl rounded-b-lg border-2 overflow-hidden transition-all duration-300 shadow-2xl flex flex-col justify-between bg-neutral-900 ${
                    isSelected ? 'shadow-[0_0_35px_rgba(255,255,255,0.25)] ring-2' : 'hover:border-neutral-500'
                  }`}
                  style={{
                    borderColor: isSelected ? game.cabinetTheme.primaryColor : '#334155',
                    boxShadow: isSelected ? `0 0 30px ${game.cabinetTheme.glowBorder}` : undefined
                  }}
                >
                  {/* 1. ILLUMINATED TOP MARQUEE */}
                  <div 
                    className="p-3 text-center border-b border-black relative overflow-hidden flex flex-col items-center justify-center min-h-[56px]"
                    style={{
                      backgroundColor: game.cabinetTheme.primaryColor,
                      color: '#000000'
                    }}
                  >
                    <div className="absolute inset-0 bg-white/15 mix-blend-overlay animate-pulse" />
                    <span className="text-[13px] font-black font-mono tracking-wider drop-shadow-sm leading-tight uppercase line-clamp-1">
                      {game.title}
                    </span>
                    <span className="text-[9px] font-mono font-bold opacity-80">
                      {game.coinPrice}
                    </span>
                  </div>

                  {/* 2. CRT SCREEN WITH CURVED BEZEL & SCANLINES */}
                  <div className="p-2.5 bg-black">
                    <div className="relative h-28 rounded-lg overflow-hidden border border-neutral-800 bg-neutral-950 p-2 flex flex-col justify-between">
                      {/* Scanline CRT overlay */}
                      <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.5)_50%)] bg-[length:100%_4px] pointer-events-none opacity-40" />
                      
                      {/* Top HUD inside CRT */}
                      <div className="flex justify-between items-center text-[9px] font-mono text-neutral-400">
                        <span className="text-yellow-400 font-bold">{top?.initials || '1UP'}</span>
                        <span className="text-white font-bold">{top?.score?.toLocaleString() || '0000'}</span>
                      </div>

                      {/* Center Graphic */}
                      <div className="flex-1 flex flex-col items-center justify-center my-1">
                        <span className="text-3xl filter drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]">
                          {game.yearIcon}
                        </span>
                        <span className="text-[10px] font-mono font-bold text-center mt-1" style={{ color: game.cabinetTheme.neonColor }}>
                          {game.genreName[lang]}
                        </span>
                      </div>

                      {/* Bottom CRT ticker */}
                      <div className="text-[8px] font-mono text-center text-neutral-500 truncate">
                        {game.creator}
                      </div>
                    </div>
                  </div>

                  {/* 3. CONTROL PANEL (CP) WITH JOYSTICK & BUTTONS */}
                  <div className="bg-neutral-950 border-t border-b border-neutral-800 p-2 flex items-center justify-between px-3">
                    {/* Joystick representation */}
                    <div className="flex items-center gap-1">
                      <div className="w-4 h-4 rounded-full bg-red-600 border border-red-400 shadow-[0_0_6px_rgba(239,68,68,0.8)]" />
                      <div className="w-1.5 h-3 bg-neutral-400 rounded-sm" />
                    </div>
                    {/* Arcade Buttons representation */}
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-blue-500 border border-blue-300" />
                      <div className="w-2.5 h-2.5 rounded-full bg-yellow-400 border border-yellow-200" />
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 border border-emerald-300" />
                    </div>
                  </div>

                  {/* 4. CABINET BASE WITH DIRECT ACTION */}
                  <div className="p-2.5 bg-neutral-900 flex flex-col items-center">
                    {/* Action Button on Cabinet Base */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePlay(game.id);
                      }}
                      className="w-full py-2 rounded-lg text-black text-[10px] font-black font-mono tracking-wider transition-all transform active:scale-95 flex items-center justify-center gap-1 cursor-pointer shadow-md"
                      style={{
                        backgroundColor: game.cabinetTheme.primaryColor
                      }}
                    >
                      <Play className="w-3 h-3 fill-black" />
                      <span>{lang === 'nl' ? 'START' : 'PLAY'}</span>
                    </button>
                  </div>
                </div>

                {/* Cabinet Ground Shadow & Neon Reflection */}
                <div 
                  className="w-3/4 h-3 rounded-full blur-md mt-1 transition-all"
                  style={{
                    backgroundColor: isSelected ? game.cabinetTheme.primaryColor : 'transparent',
                    opacity: isSelected ? 0.6 : 0
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Cabinet Deep Inspector Drawer */}
      {selectedGame && (
        <div className="relative z-10 mt-4 p-5 rounded-2xl bg-neutral-900/95 border border-neutral-800 backdrop-blur-sm grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Col 1: Title & Highlights */}
          <div className="space-y-2 lg:col-span-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-2xl">{selectedGame.yearIcon}</span>
              <h4 className="text-xl sm:text-2xl font-black font-mono text-white">
                {selectedGame.title}
              </h4>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-neutral-800 text-cyan-300 border border-neutral-700">
                {selectedGame.yearDisplay} • {selectedGame.systemName[lang]}
              </span>
              <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-neutral-800 text-yellow-400 border border-neutral-700">
                {selectedGame.genreName[lang]}
              </span>
            </div>

            <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
              {selectedGame.summary[lang]}
            </p>

            <div className="flex flex-wrap gap-2 pt-2">
              {selectedGame.highlights[lang].map((hl, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 rounded-lg bg-neutral-800 text-neutral-200 text-xs font-mono border border-neutral-700 flex items-center gap-1.5"
                >
                  <Sparkles className="w-3 h-3 text-yellow-400" />
                  <span>{hl}</span>
                </span>
              ))}
            </div>
          </div>

          {/* Col 2: Specs & Launch Button */}
          <div className="flex flex-col justify-between p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-3">
            <div className="space-y-1.5 text-[11px] font-mono">
              <div className="flex justify-between border-b border-neutral-850 pb-1">
                <span className="text-neutral-400">Maker:</span>
                <span className="text-white font-bold">{selectedGame.creator}</span>
              </div>
              <div className="flex justify-between border-b border-neutral-850 pb-1">
                <span className="text-neutral-400">Display:</span>
                <span className="text-cyan-300 font-bold">{selectedGame.specs.resolution}</span>
              </div>
              <div className="flex justify-between border-b border-neutral-850 pb-1">
                <span className="text-neutral-400">Framerate:</span>
                <span className="text-emerald-400 font-bold">{selectedGame.specs.fps}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Audio:</span>
                <span className="text-yellow-300 font-bold">{selectedGame.specs.soundChip}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => onOpenDossier(selectedGame.id)}
                className="flex-1 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-mono font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5 text-cyan-400" />
                <span>{lang === 'nl' ? 'Dossier' : 'Dossier'}</span>
              </button>
              <button
                type="button"
                onClick={() => handlePlay(selectedGame.id)}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-black text-xs font-black font-mono tracking-wider shadow-[0_0_15px_rgba(250,204,21,0.4)] transition-all transform active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-black" />
                <span>{lang === 'nl' ? 'SPEEL' : 'PLAY'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
