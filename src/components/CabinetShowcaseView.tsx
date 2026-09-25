/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * CabinetShowcaseView - Rich Interactive 56-Game Cabinet Showcase with Alphabetical and Chronological Sorting
 */

import React, { useState, useMemo } from 'react';
import { 
  Play, 
  BookOpen, 
  ArrowUp, 
  ArrowDown, 
  Calendar, 
  Sparkles, 
  SlidersHorizontal,
  RotateCcw,
  Gamepad2,
  Tv
} from 'lucide-react';
import { GameMetadata, Language } from '../i18n/lobbyTranslations';
import { arcadeHallAudio } from '../utils/arcadeHallAudio';

export type CabinetSortMode = 'default' | 'alpha_asc' | 'alpha_desc' | 'year_asc' | 'year_desc';

interface CabinetShowcaseViewProps {
  games: GameMetadata[];
  lang: Language;
  onLaunchGame: (gameId: GameMetadata['id']) => void;
  onOpenDossier: (gameId: GameMetadata['id']) => void;
  highScores: Record<string, { score: number | string; initials: string; date?: string }>;
  onResetFilters?: () => void;
  highlightedGameId?: string | null;
}

export const CabinetShowcaseView: React.FC<CabinetShowcaseViewProps> = ({
  games,
  lang,
  onLaunchGame,
  onOpenDossier,
  highScores,
  onResetFilters,
  highlightedGameId
}) => {
  const [sortMode, setSortMode] = useState<CabinetSortMode>('default');

  // Sort games based on selected sort mode
  const sortedGames = useMemo(() => {
    const list = [...games];
    switch (sortMode) {
      case 'alpha_asc':
        return list.sort((a, b) => a.title.localeCompare(b.title));
      case 'alpha_desc':
        return list.sort((a, b) => b.title.localeCompare(a.title));
      case 'year_asc':
        return list.sort((a, b) => a.year - b.year || a.title.localeCompare(b.title));
      case 'year_desc':
        return list.sort((a, b) => b.year - a.year || a.title.localeCompare(b.title));
      case 'default':
      default:
        return list;
    }
  }, [games, sortMode]);

  const handleSortChange = (newMode: CabinetSortMode) => {
    arcadeHallAudio.playSwitch();
    setSortMode(newMode);
  };

  const handlePlay = (gameId: GameMetadata['id']) => {
    arcadeHallAudio.playCoin();
    onLaunchGame(gameId);
  };

  const handleDossier = (gameId: GameMetadata['id']) => {
    arcadeHallAudio.playSwitch();
    onOpenDossier(gameId);
  };

  return (
    <section className="space-y-6">
      {/* Header with Title, Cabinet Counter & Alphabetical/Year Sorting Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-neutral-900/70 p-4 rounded-2xl border border-neutral-800 backdrop-blur">
        <div className="flex items-center gap-3">
          <span className="w-3 h-3 rounded-full bg-cyan-400 animate-ping" />
          <div>
            <h3 className="text-lg sm:text-xl font-black font-mono tracking-wider text-white flex items-center gap-2">
              <span>{sortedGames.length}</span>
              <span>{lang === 'nl' ? 'ARCADE KASTEN BESCHIKBAAR' : 'ARCADE CABINETS AVAILABLE'}</span>
            </h3>
            <p className="text-xs text-neutral-400 font-mono">
              {lang === 'nl'
                ? 'Alle kasten direct speelbaar in native 60 FPS Canvas 2D & Three.js'
                : 'All cabinets instantly playable in native 60 FPS Canvas 2D & Three.js'}
            </p>
          </div>
        </div>

        {/* Sorting Controls */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <div className="flex items-center gap-1 text-xs font-mono text-neutral-400 mr-1">
            <SlidersHorizontal className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden md:inline">{lang === 'nl' ? 'Sorteer:' : 'Sort:'}</span>
          </div>

          {/* Standaard / Curated */}
          <button
            type="button"
            onClick={() => handleSortChange('default')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
              sortMode === 'default'
                ? 'bg-cyan-500 text-black shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                : 'bg-neutral-950 text-neutral-400 hover:text-white border border-neutral-800'
            }`}
            title={lang === 'nl' ? 'Standaard speelhal volgorde' : 'Default arcade order'}
          >
            {lang === 'nl' ? 'Standaard' : 'Default'}
          </button>

          {/* A → Z (Alphabetisch Oplopend) */}
          <button
            type="button"
            onClick={() => handleSortChange('alpha_asc')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1 transition-all cursor-pointer ${
              sortMode === 'alpha_asc'
                ? 'bg-amber-500 text-black shadow-[0_0_12px_rgba(245,158,11,0.4)]'
                : 'bg-neutral-950 text-neutral-400 hover:text-white border border-neutral-800'
            }`}
            title={lang === 'nl' ? 'Sorteer alfabetisch op naam van A naar Z' : 'Sort alphabetically from A to Z'}
          >
            <span>A → Z</span>
            <ArrowUp className="w-3 h-3" />
          </button>

          {/* Z → A (Alphabetisch Aflopend) */}
          <button
            type="button"
            onClick={() => handleSortChange('alpha_desc')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1 transition-all cursor-pointer ${
              sortMode === 'alpha_desc'
                ? 'bg-amber-500 text-black shadow-[0_0_12px_rgba(245,158,11,0.4)]'
                : 'bg-neutral-950 text-neutral-400 hover:text-white border border-neutral-800'
            }`}
            title={lang === 'nl' ? 'Sorteer alfabetisch op naam van Z naar A' : 'Sort alphabetically from Z to A'}
          >
            <span>Z → A</span>
            <ArrowDown className="w-3 h-3" />
          </button>

          {/* Jaar ↑ (Chronologisch) */}
          <button
            type="button"
            onClick={() => handleSortChange('year_asc')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1 transition-all cursor-pointer ${
              sortMode === 'year_asc'
                ? 'bg-purple-500 text-white shadow-[0_0_12px_rgba(168,85,247,0.4)]'
                : 'bg-neutral-950 text-neutral-400 hover:text-white border border-neutral-800'
            }`}
            title={lang === 'nl' ? 'Sorteer op jaartal van oud naar nieuw (1972-2011)' : 'Sort by year oldest to newest'}
          >
            <Calendar className="w-3 h-3" />
            <span>{lang === 'nl' ? 'Jaar ↑' : 'Year ↑'}</span>
          </button>

          {/* Jaar ↓ (Nieuw naar oud) */}
          <button
            type="button"
            onClick={() => handleSortChange('year_desc')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1 transition-all cursor-pointer ${
              sortMode === 'year_desc'
                ? 'bg-purple-500 text-white shadow-[0_0_12px_rgba(168,85,247,0.4)]'
                : 'bg-neutral-950 text-neutral-400 hover:text-white border border-neutral-800'
            }`}
            title={lang === 'nl' ? 'Sorteer op jaartal van nieuw naar oud' : 'Sort by year newest to oldest'}
          >
            <Calendar className="w-3 h-3" />
            <span>{lang === 'nl' ? 'Jaar ↓' : 'Year ↓'}</span>
          </button>
        </div>
      </div>

      {/* Empty State if filter returns 0 */}
      {sortedGames.length === 0 ? (
        <div className="rounded-3xl bg-neutral-900/80 border border-neutral-800 p-10 text-center space-y-4">
          <div className="text-4xl">🔍</div>
          <h4 className="text-xl font-bold font-mono text-white">
            {lang === 'nl' ? 'Geen arcade kasten gevonden' : 'No arcade cabinets found'}
          </h4>
          <p className="text-sm text-neutral-400 font-mono max-w-md mx-auto">
            {lang === 'nl'
              ? 'Er zijn geen kasten die voldoen aan de geselecteerde filters. Reset de filters om alle 56 kasten te bekijken.'
              : 'No cabinets match the selected filters. Reset filters to view all 56 cabinets.'}
          </p>
          {onResetFilters && (
            <button
              type="button"
              onClick={onResetFilters}
              className="px-4 py-2 rounded-xl bg-cyan-500 text-black font-mono font-bold text-xs cursor-pointer shadow-md inline-flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{lang === 'nl' ? 'Filters Herstellen' : 'Reset Filters'}</span>
            </button>
          )}
        </div>
      ) : (
        /* Full Grid of All 56 Interactive Cabinet Cards */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sortedGames.map((game, index) => {
            const top = highScores[game.id];
            const theme = game.cabinetTheme;
            const isHighlighted = highlightedGameId === game.id;

            return (
              <div
                key={game.id}
                id={`cabinet-card-${game.id}`}
                className={`group relative rounded-3xl bg-neutral-900/90 border-2 overflow-hidden transition-all duration-300 flex flex-col justify-between ${
                  isHighlighted 
                    ? 'scale-[1.02] border-amber-400 ring-4 ring-amber-400/30 shadow-[0_0_40px_rgba(245,158,11,0.5)] z-10' 
                    : 'hover:shadow-2xl'
                }`}
                style={{
                  borderColor: isHighlighted ? '#f59e0b' : `${theme.primaryColor}80`,
                  boxShadow: isHighlighted ? '0 0 40px rgba(245,158,11,0.5)' : `0 0 25px ${theme.glowBorder}`
                }}
              >
                {/* Subtle Radial Dot Pattern */}
                <div
                  className="absolute inset-0 opacity-10 pointer-events-none"
                  style={{
                    backgroundImage: `radial-gradient(${theme.primaryColor} 1px, transparent 1px)`,
                    backgroundSize: '24px 24px'
                  }}
                />

                <div className="relative z-10 p-6 sm:p-7 space-y-5">
                  {/* Top Header Tags */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className="px-2.5 py-0.5 rounded-full text-[11px] font-black text-black shadow-md"
                        style={{ backgroundColor: theme.primaryColor }}
                      >
                        {game.yearIcon} #{index + 1}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-neutral-800 text-neutral-300 border border-neutral-700">
                        {game.creator} • {game.yearDisplay}
                      </span>
                    </div>
                    {top && (
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-mono text-amber-400 font-bold">
                          RECORD: {top.score.toLocaleString()} ({top.initials})
                        </span>
                        {top.date && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-mono text-neutral-400 bg-neutral-900/90 px-1.5 py-0.5 rounded border border-neutral-800">
                            <Calendar className="w-2.5 h-2.5 text-neutral-500" />
                            <span>{top.date}</span>
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Title & Metadata */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-2xl sm:text-3xl font-black font-mono text-white tracking-tight flex items-center gap-2 flex-wrap">
                          <span>{game.title}</span>
                          <span className="text-xs px-2 py-0.5 rounded bg-neutral-800 text-cyan-300 border border-neutral-700 font-mono">
                            {game.systemName[lang]}
                          </span>
                        </h4>
                        <p className="text-xs text-neutral-400 font-mono mt-1">
                          {game.subtitle[lang]}
                        </p>
                      </div>
                    </div>

                    {/* Retro Arcade Screen Simulation Preview */}
                    <div
                      className="relative h-44 rounded-2xl overflow-hidden border bg-neutral-950 p-2 font-mono flex flex-col justify-between group-hover:border-opacity-100 transition-colors select-none"
                      style={{ borderColor: `${theme.primaryColor}60` }}
                    >
                      {/* Marquee Top HUD */}
                      <div className="flex justify-between items-center bg-neutral-900/90 rounded px-2.5 py-1 text-[11px] border border-neutral-800">
                        <span className="font-bold" style={{ color: theme.neonColor }}>
                          SCORE: {top ? top.score.toLocaleString() : '00000'}
                        </span>
                        <span className="text-amber-400 font-bold flex items-center gap-1">
                          <span>{game.yearIcon}</span>
                          <span>{game.genreName[lang].toUpperCase()}</span>
                        </span>
                        <span className="text-red-400 font-bold">{game.coinPrice}</span>
                      </div>

                      {/* Screen Center Visual Simulation */}
                      <div className="relative flex-1 flex flex-col items-center justify-center overflow-hidden py-1">
                        <div className="text-4xl animate-bounce mb-1">{game.yearIcon}</div>
                        <div
                          className="font-black text-sm tracking-wider uppercase drop-shadow-md"
                          style={{ color: theme.neonColor }}
                        >
                          {game.title}
                        </div>
                        <div className="text-[10px] text-neutral-400 font-mono mt-1 flex items-center gap-2">
                          <span className="px-1.5 py-0.2 rounded bg-neutral-900 border border-neutral-800 text-neutral-300">
                            {game.specs.fps}
                          </span>
                          <span className="px-1.5 py-0.2 rounded bg-neutral-900 border border-neutral-800 text-neutral-300">
                            {game.specs.resolution}
                          </span>
                        </div>
                      </div>

                      {/* CRT Scanlines Effect */}
                      <div
                        className="absolute inset-0 pointer-events-none opacity-20"
                        style={{
                          backgroundImage: 'repeating-linear-gradient(0deg, #000, #000 1px, transparent 1px, transparent 2px)'
                        }}
                      />

                      {/* Screen Bottom Status */}
                      <div className="bg-neutral-900/90 rounded px-2 py-1 flex justify-between items-center text-[10px] text-neutral-400 border border-neutral-800">
                        <span className="text-cyan-400 font-bold">{game.specs.soundChip}</span>
                        <span className="text-amber-400 font-bold">{game.specs.media}</span>
                      </div>
                    </div>

                    {/* Summary Description */}
                    <p className="text-neutral-300 text-xs sm:text-sm leading-relaxed line-clamp-3">
                      {game.summary[lang]}
                    </p>
                  </div>

                  {/* Feature Highlights Chips */}
                  <div className="flex flex-wrap gap-1.5 text-[11px] font-mono">
                    {game.highlights[lang]?.slice(0, 3).map((hl, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-lg bg-neutral-800/90 text-neutral-300 border border-neutral-700/80 line-clamp-1"
                      >
                        ✓ {hl}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Bottom Action Buttons: Dossier & Speel Nu */}
                <div className="p-6 pt-0 flex gap-2.5">
                  <button
                    type="button"
                    onClick={() => handleDossier(game.id)}
                    className="px-4 py-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold border border-neutral-700 transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                    title={lang === 'nl' ? `Bekijk historisch dossier van ${game.title}` : `View historical dossier of ${game.title}`}
                  >
                    <BookOpen className="w-4 h-4 text-cyan-400" />
                    <span>Dossier</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handlePlay(game.id)}
                    className="flex-1 py-3 rounded-xl font-black text-xs tracking-wider transition-all transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer shadow-lg"
                    style={{
                      backgroundColor: theme.primaryColor,
                      color: '#000000',
                      boxShadow: `0 0 20px ${theme.glowBorder}`
                    }}
                  >
                    <Play className="w-4 h-4 fill-black" />
                    <span>
                      {lang === 'nl' ? `START ${game.title}!` : `PLAY ${game.title}!`}
                    </span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};
