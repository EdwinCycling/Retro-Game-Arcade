/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * ArcadeSearchBar - Interactive Real-Time Title & Year Search Bar with Dropdown
 */

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Search, X, Play, Sparkles, Gamepad2, Calendar, CornerDownLeft, ArrowDown, ArrowUp } from 'lucide-react';
import { GameMetadata, GAMES_METADATA, Language } from '../i18n/lobbyTranslations';
import { arcadeHallAudio } from '../utils/arcadeHallAudio';

interface ArcadeSearchBarProps {
  lang: Language;
  onSelectGame: (gameId: GameMetadata['id']) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  className?: string;
  placeholder?: string;
  autoFocus?: boolean;
  isHeroVariant?: boolean;
}

export const ArcadeSearchBar: React.FC<ArcadeSearchBarProps> = ({
  lang,
  onSelectGame,
  searchQuery,
  onSearchChange,
  className = '',
  placeholder,
  autoFocus = false,
  isHeroVariant = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const listRef = useRef<HTMLUListElement | null>(null);

  // Default placeholder
  const defaultPlaceholder =
    placeholder ||
    (lang === 'nl'
      ? 'Zoek op titel, jaartal of platform (bijv. Topografie, 1984, Pac-Man)...'
      : 'Search by title, year, or platform (e.g. Topografie, 1984, Pac-Man)...');

  // Filter and rank matching games in real-time
  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];

    return GAMES_METADATA.filter((game) => {
      const title = game.title.toLowerCase();
      const yearStr = game.year.toString();
      const yearDisplay = game.yearDisplay.toLowerCase();
      const system = (game.systemName[lang] || '').toLowerCase();
      const genre = (game.genreName[lang] || '').toLowerCase();
      const subtitle = (game.subtitle[lang] || '').toLowerCase();
      const creator = (game.creator || '').toLowerCase();

      return (
        title.includes(q) ||
        yearStr.includes(q) ||
        yearDisplay.includes(q) ||
        system.includes(q) ||
        genre.includes(q) ||
        subtitle.includes(q) ||
        creator.includes(q)
      );
    }).sort((a, b) => {
      const qLower = q.toLowerCase();
      const aTitle = a.title.toLowerCase();
      const bTitle = b.title.toLowerCase();

      // Exact title match gets top priority
      if (aTitle === qLower) return -1;
      if (bTitle === qLower) return 1;

      // Title starts with query gets second priority
      const aStarts = aTitle.startsWith(qLower);
      const bStarts = bTitle.startsWith(qLower);
      if (aStarts && !bStarts) return -1;
      if (!aStarts && bStarts) return 1;

      // Title contains query gets third priority
      const aHasTitle = aTitle.includes(qLower);
      const bHasTitle = bTitle.includes(qLower);
      if (aHasTitle && !bHasTitle) return -1;
      if (!aHasTitle && bHasTitle) return 1;

      // Year match gets fourth priority
      const aYear = a.year.toString().includes(qLower);
      const bYear = b.year.toString().includes(qLower);
      if (aYear && !bYear) return -1;
      if (!aYear && bYear) return 1;

      // Otherwise sort by release year
      return a.year - b.year;
    });
  }, [searchQuery, lang]);

  // Reset selected index when query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [searchQuery]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Global keyboard shortcut ('/' or 'Ctrl+K' / 'Cmd+K' to focus)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in another input/textarea
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
        return;
      }

      if (e.key === '/' || ((e.ctrlKey || e.metaKey) && e.key === 'k')) {
        e.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
        setIsOpen(true);
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  // Keyboard navigation inside dropdown
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
      setIsOpen(true);
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (searchResults.length > 0) {
        setSelectedIndex((prev) => (prev + 1) % searchResults.length);
        arcadeHallAudio.playHover();
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (searchResults.length > 0) {
        setSelectedIndex((prev) => (prev - 1 + searchResults.length) % searchResults.length);
        arcadeHallAudio.playHover();
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (searchResults.length > 0 && searchResults[selectedIndex]) {
        handleLaunchGame(searchResults[selectedIndex].id);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  const handleLaunchGame = (gameId: GameMetadata['id']) => {
    arcadeHallAudio.playCoin();
    setIsOpen(false);
    onSelectGame(gameId);
  };

  const handleClear = () => {
    onSearchChange('');
    setIsOpen(false);
    inputRef.current?.focus();
  };

  // Helper to highlight matching text in title
  const highlightMatch = (text: string, query: string) => {
    if (!query.trim()) return text;
    const q = query.trim();
    const regex = new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);

    return parts.map((part, index) =>
      part.toLowerCase() === q.toLowerCase() ? (
        <span
          key={index}
          className="text-cyan-300 font-black underline decoration-cyan-400/60 bg-cyan-950/60 px-0.5 rounded"
        >
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  // Sample quick suggestion chips
  const suggestions = [
    { title: 'Topografie Europa', query: 'Topografie' },
    { title: 'Pac-Man (1980)', query: 'Pacman' },
    { title: 'DOOM (1993)', query: 'Doom' },
    { title: 'Super Mario', query: 'Mario' },
    { title: '1984 Klassiekers', query: '1984' }
  ];

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Search Input Bar */}
      <div
        className={`relative flex items-center transition-all ${
          isHeroVariant
            ? 'rounded-2xl bg-neutral-950/90 border border-neutral-700/80 shadow-[0_0_25px_rgba(6,182,212,0.15)] focus-within:border-cyan-500 focus-within:shadow-[0_0_30px_rgba(6,182,212,0.35)]'
            : 'rounded-xl bg-neutral-950 border border-neutral-800 focus-within:border-cyan-500 focus-within:shadow-[0_0_20px_rgba(6,182,212,0.25)]'
        }`}
      >
        <Search
          className={`shrink-0 pointer-events-none transition-colors ${
            isHeroVariant
              ? 'w-5 h-5 ml-4 text-cyan-400'
              : 'w-3.5 h-3.5 ml-3 text-neutral-400 group-focus-within:text-cyan-400'
          }`}
        />

        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => {
            onSearchChange(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={() => {
            if (searchQuery.trim().length > 0) setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          placeholder={defaultPlaceholder}
          autoFocus={autoFocus}
          className={`w-full bg-transparent font-mono text-white placeholder:text-neutral-500 focus:outline-none transition-colors ${
            isHeroVariant ? 'py-3.5 pl-3 pr-24 text-sm sm:text-base font-semibold' : 'py-2 pl-2.5 pr-14 text-xs'
          }`}
        />

        {/* Clear Button or Keyboard Shortcut Badge */}
        <div className="absolute right-2.5 flex items-center gap-1.5">
          {searchQuery ? (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 rounded-md text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
              title={lang === 'nl' ? 'Wis zoekopdracht' : 'Clear search'}
            >
              <X className={isHeroVariant ? 'w-4 h-4' : 'w-3 h-3'} />
            </button>
          ) : (
            <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-neutral-900 border border-neutral-700/80 text-[10px] font-mono text-neutral-400 select-none shadow-sm">
              <span className="text-[11px]">/</span>
            </kbd>
          )}
        </div>
      </div>

      {/* Interactive Dropdown Results Overlay */}
      {isOpen && searchQuery.trim().length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 z-50 rounded-2xl bg-neutral-950/95 border-2 border-neutral-800 shadow-[0_20px_50px_rgba(0,0,0,0.85),0_0_20px_rgba(6,182,212,0.15)] backdrop-blur-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Header Bar inside Dropdown */}
          <div className="px-4 py-2.5 bg-neutral-900/90 border-b border-neutral-800/80 flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-2 text-neutral-300">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>
                <strong className="text-cyan-400">{searchResults.length}</strong>{' '}
                {searchResults.length === 1
                  ? lang === 'nl' ? 'spel gevonden' : 'game found'
                  : lang === 'nl' ? 'spellen gevonden' : 'games found'}
              </span>
            </div>
            <span className="text-[11px] text-neutral-500 hidden sm:inline">
              {lang === 'nl' ? 'Zoeken op titel & jaartal' : 'Searching by title & year'}
            </span>
          </div>

          {/* Results List */}
          {searchResults.length > 0 ? (
            <ul ref={listRef} className="max-h-[380px] overflow-y-auto divide-y divide-neutral-900/90 p-1.5">
              {searchResults.map((game, idx) => {
                const isSelected = idx === selectedIndex;
                return (
                  <li
                    key={game.id}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    onClick={() => handleLaunchGame(game.id)}
                    className={`group px-3 py-2.5 rounded-xl cursor-pointer transition-all flex items-center justify-between gap-3 ${
                      isSelected
                        ? 'bg-neutral-900 border border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                        : 'hover:bg-neutral-900/60 border border-transparent'
                    }`}
                  >
                    {/* Left: Icon, Title, Year & Specs */}
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Game Icon / Emoji Badge */}
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 border shadow-md transition-transform group-hover:scale-105"
                        style={{
                          backgroundColor: `${game.cabinetTheme.primaryColor}18`,
                          borderColor: `${game.cabinetTheme.primaryColor}55`
                        }}
                      >
                        <span>{game.yearIcon}</span>
                      </div>

                      {/* Title & Metadata Details */}
                      <div className="min-w-0 flex flex-col">
                        <div className="flex items-center gap-2 flex-wrap">
                          {/* Title */}
                          <span className="text-sm font-black text-white font-mono tracking-wide truncate group-hover:text-cyan-300 transition-colors">
                            {highlightMatch(game.title, searchQuery)}
                          </span>

                          {/* Year Badge (prominent) */}
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/40 text-amber-300 text-[11px] font-mono font-bold shadow-sm">
                            <Calendar className="w-2.5 h-2.5 text-amber-400" />
                            {highlightMatch(game.yearDisplay, searchQuery)}
                          </span>

                          {/* System Badge */}
                          <span className="px-1.5 py-0.5 rounded-md bg-neutral-800 text-neutral-300 text-[10px] font-mono border border-neutral-700/80">
                            {game.systemName[lang]}
                          </span>

                          {/* Genre Badge */}
                          <span className="hidden md:inline px-1.5 py-0.5 rounded-md bg-blue-950/60 text-blue-300 text-[10px] font-mono border border-blue-500/30">
                            {game.genreName[lang]}
                          </span>
                        </div>

                        {/* Subtitle / Creator */}
                        <p className="text-xs text-neutral-400 font-sans truncate mt-0.5">
                          {game.subtitle[lang]} • <span className="text-neutral-500">{game.creator}</span>
                        </p>
                      </div>
                    </div>

                    {/* Right: Quick Launch Button */}
                    <div className="shrink-0 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLaunchGame(game.id);
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-black shadow-md shadow-cyan-500/30 scale-105'
                            : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border border-neutral-700'
                        }`}
                      >
                        <Play className="w-3 h-3 fill-current" />
                        <span className="hidden sm:inline">
                          {lang === 'nl' ? 'Speel' : 'Play'}
                        </span>
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            /* Empty State */
            <div className="p-6 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-center mx-auto text-neutral-500">
                <Gamepad2 className="w-6 h-6 text-neutral-500" />
              </div>
              <div>
                <p className="text-sm font-mono text-white font-bold">
                  {lang === 'nl' ? 'Geen spellen gevonden voor' : 'No games found for'}{' '}
                  <span className="text-cyan-400">"{searchQuery}"</span>
                </p>
                <p className="text-xs text-neutral-400 mt-1">
                  {lang === 'nl'
                    ? 'Probeer een ander trefwoord, spelnaam of jaartal:'
                    : 'Try another keyword, game title, or year:'}
                </p>
              </div>

              {/* Suggestion Chips */}
              <div className="flex flex-wrap items-center justify-center gap-1.5 pt-2">
                {suggestions.map((sug, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      onSearchChange(sug.query);
                      inputRef.current?.focus();
                    }}
                    className="px-2.5 py-1 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-neutral-700 text-xs font-mono text-cyan-300 transition-colors cursor-pointer"
                  >
                    {sug.title}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Footer Bar with Keyboard Shortcuts */}
          <div className="px-4 py-2 bg-neutral-950 border-t border-neutral-900 flex items-center justify-between text-[11px] font-mono text-neutral-500">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <kbd className="px-1 py-0.2 rounded bg-neutral-900 border border-neutral-800 text-[10px] text-neutral-400">
                  ↑
                </kbd>
                <kbd className="px-1 py-0.2 rounded bg-neutral-900 border border-neutral-800 text-[10px] text-neutral-400">
                  ↓
                </kbd>{' '}
                {lang === 'nl' ? 'Bladeren' : 'Navigate'}
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.2 rounded bg-neutral-900 border border-neutral-800 text-[10px] text-neutral-400">
                  ↵ Enter
                </kbd>{' '}
                {lang === 'nl' ? 'Spelen' : 'Launch'}
              </span>
            </div>
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.2 rounded bg-neutral-900 border border-neutral-800 text-[10px] text-neutral-400">
                ESC
              </kbd>{' '}
              {lang === 'nl' ? 'Sluiten' : 'Close'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
