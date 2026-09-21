/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { GameMetadata, Language } from '../i18n/lobbyTranslations';
import { Play, BookOpen, Clock, Cpu, Award } from 'lucide-react';
import { arcadeHallAudio } from '../utils/arcadeHallAudio';
import { haptics } from '../utils/haptics';

interface ArcadeTimelineViewProps {
  games: GameMetadata[];
  lang: Language;
  onLaunchGame: (gameId: GameMetadata['id']) => void;
  onOpenDossier: (gameId: GameMetadata['id']) => void;
  highScores: Record<string, { score: number | string; initials: string }>;
}

export const ArcadeTimelineView: React.FC<ArcadeTimelineViewProps> = ({
  games,
  lang,
  onLaunchGame,
  onOpenDossier,
  highScores
}) => {
  // Sort games chronologically by release year
  const sortedGames = [...games].sort((a, b) => a.year - b.year);

  // Group by year
  const years = Array.from(new Set(sortedGames.map(g => g.year))).sort((a, b) => a - b);

  const handlePlay = (gameId: GameMetadata['id']) => {
    haptics.success();
    arcadeHallAudio.playCoinDrop();
    onLaunchGame(gameId);
  };

  const getYearMilestoneTitle = (year: number) => {
    switch (year) {
      case 1972:
        return lang === 'nl'
          ? '1972: De Oerknal van de Arcade Industrie (PONG & Nolan Bushnell)'
          : '1972: The Genesis of the Arcade Industry (PONG & Nolan Bushnell)';
      case 1978:
        return lang === 'nl' 
          ? '1978: De Geboorte van de Arcade Revolutie (Space Invaders & Tomohiro Nishikado)'
          : '1978: Dawn of the Arcade Revolution (Space Invaders & Tomohiro Nishikado)';
      case 1979:
        return lang === 'nl'
          ? '1979: Vector Graphics Triomf & QuadraScan Ruimte-Oorlog (Asteroids & Lyle Rains)'
          : '1979: Vector Graphics Triumph & QuadraScan Space Battles (Asteroids & Lyle Rains)';
      case 1980:
        return lang === 'nl'
          ? '1980: Het Popcultuur Fenomeen & AI Personages (Pac-Man & Toru Iwatani)'
          : '1980: Pop Culture Explosion & AI Characters (Pac-Man & Toru Iwatani)';
      case 1981:
        return lang === 'nl'
          ? '1981: Eerste 3D Labyrint op Sinclair ZX81 (3D Monster Maze & Malcolm Evans)'
          : '1981: First 3D Survival Maze on Sinclair ZX81 (3D Monster Maze & Malcolm Evans)';
      case 1982:
        return lang === 'nl'
          ? '1982: Eerste Isometrische 3D Wereld (Zaxxon & Sega) & Gouden Arcade Tijdperk'
          : '1982: First Isometric 3D World (Zaxxon & Sega) & Golden Arcade Zenith';
      case 1983:
        return lang === 'nl'
          ? '1983: De Britse Microcomputer Boom & Platform Acrobatiek'
          : '1983: The British Micro Boom & Platform Mastery';
      case 1984:
        return lang === 'nl'
          ? '1984: Het Tetris Meesterwerk & Experimentele Mechanics'
          : '1984: The Tetris Masterpiece & Experimental Mechanics';
      case 1985:
        return lang === 'nl'
          ? '1985: Echte 3D-Fysica, Uitgestrekte Werelden & Vluchtsims'
          : '1985: True 3D Physics, Expansive Worlds & Flight Sims';
      case 1986:
        return lang === 'nl'
          ? '1986: De Gouden Eeuw van Sierra Sci-Fi Avonturen & EGA Graphics'
          : '1986: The Golden Era of Sierra Sci-Fi Adventures & EGA Graphics';
      case 1987:
        return lang === 'nl'
          ? '1987: De Geboorte van de Beat ’em Up & Co-op Vechter (Double Dragon & Technos)'
          : '1987: Dawn of the Beat ’em Up & Co-op Brawler (Double Dragon & Technos)';
      case 1988:
        return lang === 'nl'
          ? '1988: Newtoniaanse Physics Sandbox (Exile & Peter Irvin) & Geanimeerde Schaak Oorlog (Battle Chess)'
          : '1988: Newtonian Physics Sandbox (Exile & Peter Irvin) & Animated Chess Battles (Battle Chess)';
      case 1989:
        return lang === 'nl'
          ? '1989: Nintendo Game Boy DMG-01 Handheld Revolutie (Super Mario Land, Tetris) & C64 3D Pinball'
          : '1989: Nintendo Game Boy DMG-01 Handheld Revolution (Super Mario Land, Tetris) & C64 3D Pinball';
      case 1990:
        return lang === 'nl'
          ? '1990: Rotoscoped Cinematic Platformer (Prince of Persia) & Game Boy Virus Puzzel (Dr. Mario)'
          : '1990: Rotoscoped Cinematic Platformer (Prince of Persia) & Game Boy Virus Puzzle (Dr. Mario)';
      case 1991:
        return lang === 'nl'
          ? '1991: Realtime Puzzelrevolutie (Lemmings) & Handheld Sci-Fi Metroidvania (Metroid II)'
          : '1991: Real-Time Puzzle Revolution (Lemmings) & Handheld Sci-Fi Metroidvania (Metroid II)';
      case 1992:
        return lang === 'nl'
          ? '1992: Raycasting 3D FPS (Wolfenstein 3D) & Game Boy Meesterwerken (Kirby’s Dream Land & Mario Land 2)'
          : '1992: Raycasting 3D FPS (Wolfenstein 3D) & Game Boy Masterpieces (Kirby’s Dream Land & Mario Land 2)';
      case 1993:
        return lang === 'nl'
          ? '1993: 3D First-Person Shooter Revolutie (DOOM) & Koholint Island Avontuur (Zelda: Link’s Awakening)'
          : '1993: 3D First-Person Shooter Revolution (DOOM) & Koholint Island Adventure (Zelda: Link’s Awakening)';
      case 1994:
        return lang === 'nl'
          ? '1994: Sony PlayStation 1 3D CD-ROM Revolutie (PS1 Console, Crash Bandicoot & Ridge Racer) & Donkey Kong ’94'
          : '1994: Sony PlayStation 1 3D CD-ROM Revolution (PS1 Console, Crash Bandicoot & Ridge Racer) & Donkey Kong ’94';
      case 1996:
        return lang === 'nl'
          ? '1996: 3D Build Engine (Duke Nukem 3D) & Mondiale Game Boy RPG Sensatie (Pokémon Red & Blue)'
          : '1996: 3D Build Engine (Duke Nukem 3D) & Global Game Boy RPG Sensation (Pokémon Red & Blue)';
      case 1997:
        return lang === 'nl'
          ? '1997: De Mobiele Gaming Revolutie op Nokia LCD (Snake & Taneli Armanto)'
          : '1997: The Mobile Gaming Revolution on Nokia LCD (Snake & Taneli Armanto)';
      case 1998:
        return lang === 'nl'
          ? '1998: Verhalende 3D PC Revolutie (Half-Life) & Onsterfelijke Game Boy Actie (Wario Land II)'
          : '1998: Story-Driven 3D PC Revolution (Half-Life) & Immortal Game Boy Action (Wario Land II)';
      case 2003:
        return lang === 'nl'
          ? '2003: Game Boy Advance SP 32-Bit Inklapbare Handheld Revolutie (GBA SP, Pokémon Emerald, Mario & Zelda)'
          : '2003: Game Boy Advance SP 32-Bit Clamshell Handheld Revolution (GBA SP, Pokémon Emerald, Mario & Zelda)';
      case 2011:
        return lang === 'nl'
          ? '2011: De Mobiele 3D Endless Runner Sensatie (Temple Run 3D)'
          : '2011: The Mobile 3D Endless Runner Sensation (Temple Run 3D)';
      default:
        return `${year}`;
    }
  };

  return (
    <div className="relative w-full rounded-3xl bg-neutral-950 border-2 border-neutral-800/90 shadow-2xl p-4 sm:p-8 space-y-10">
      {/* Background Subtle Grid & Neon Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:32px_32px] opacity-10 pointer-events-none rounded-3xl" />

      {/* Header */}
      <div className="relative z-10 space-y-2 border-b border-neutral-800 pb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-950/80 border border-blue-500/40 text-blue-300 text-xs font-mono font-bold">
          <Clock className="w-3.5 h-3.5 text-blue-400" />
          <span>1972 – 2011 RETRO &amp; 3D CHRONOLOGIE</span>
        </div>
        <h3 className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-white">
          {lang === 'nl'
            ? 'Chronologische Tijdlijn van de Speelhal & Consoles'
            : 'Chronological Arcade & Console Timeline'}
        </h3>
        <p className="text-xs sm:text-sm text-neutral-400 font-mono max-w-3xl leading-relaxed">
          {lang === 'nl'
            ? 'Reis door 4 decennia aan gamegeschiedenis (1972–2011). Zie hoe de industrie evolueerde van monochrome arcade-circuits en 8-bit microcomputers naar iconische Game Boy handhelds, 32-bit PlayStation 1 CD-ROM 3D-werelden en mobiele klassiekers.'
            : 'Journey through 4 decades of gaming history (1972–2011). Watch gaming evolve from monochrome arcade circuits and 8-bit microcomputers to iconic Game Boy handhelds, 32-bit PlayStation 1 3D CD-ROM worlds, and mobile classics.'}
        </p>
      </div>

      {/* Timeline Steps by Year */}
      <div className="relative z-10 space-y-12">
        {years.map((year) => {
          const yearGames = sortedGames.filter(g => g.year === year);

          return (
            <div key={year} className="relative pl-6 sm:pl-10 border-l-2 border-cyan-500/40 space-y-6">
              {/* Year Marker Badge */}
              <div className="absolute -left-4 sm:-left-5 top-0 flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-cyan-950 border-2 border-cyan-400 text-cyan-300 font-black font-mono text-xs sm:text-sm shadow-[0_0_15px_rgba(6,182,212,0.6)]">
                {year % 100}
              </div>

              {/* Year Heading Banner */}
              <div className="pt-0.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3 py-0.5 rounded-full text-xs font-black font-mono bg-cyan-500 text-black shadow-md">
                    {year}
                  </span>
                  <h4 className="text-base sm:text-lg font-bold font-mono text-white">
                    {getYearMilestoneTitle(year)}
                  </h4>
                </div>
              </div>

              {/* Games released in this year */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {yearGames.map((game) => {
                  const scoreInfo = highScores[game.id];

                  return (
                    <div
                      key={game.id}
                      className="group relative rounded-2xl bg-neutral-900/90 border border-neutral-800 hover:border-cyan-500/80 p-5 transition-all duration-300 shadow-lg hover:shadow-[0_0_25px_rgba(6,182,212,0.25)] flex flex-col justify-between space-y-4"
                    >
                      <div className="space-y-3">
                        {/* Title & Icons */}
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xl">{game.yearIcon}</span>
                              <h5 className="text-lg font-black font-mono text-white group-hover:text-cyan-400 transition-colors">
                                {game.title}
                              </h5>
                            </div>
                            <span className="text-[11px] font-mono text-neutral-400">
                              {game.creator}
                            </span>
                          </div>

                          <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-neutral-800 text-yellow-400 border border-neutral-700">
                            {game.systemName[lang]}
                          </span>
                        </div>

                        {/* Summary */}
                        <p className="text-xs text-neutral-300 leading-relaxed line-clamp-3">
                          {game.summary[lang]}
                        </p>

                        {/* Specs badges */}
                        <div className="flex flex-wrap gap-1.5 text-[10px] font-mono">
                          <span className="px-2 py-0.5 rounded bg-neutral-950 text-neutral-400 border border-neutral-800 flex items-center gap-1">
                            <Cpu className="w-3 h-3 text-cyan-400" />
                            <span>{game.specs.fps}</span>
                          </span>
                          {scoreInfo && (
                            <span className="px-2 py-0.5 rounded bg-neutral-950 text-yellow-300 border border-neutral-800 flex items-center gap-1">
                              <Award className="w-3 h-3 text-yellow-400" />
                              <span>{scoreInfo.score.toLocaleString()}</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="pt-2 border-t border-neutral-800/80 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => onOpenDossier(game.id)}
                          className="px-3 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-mono font-bold border border-neutral-700 transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
                          <span>{lang === 'nl' ? 'Dossier' : 'Dossier'}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handlePlay(game.id)}
                          className="flex-1 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-yellow-400 hover:from-cyan-400 hover:to-yellow-300 text-black text-xs font-black font-mono tracking-wider shadow-md transition-all transform active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Play className="w-3.5 h-3.5 fill-black" />
                          <span>{lang === 'nl' ? 'SPEEL' : 'PLAY'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
