/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X, Trophy, Cpu, History, Award, BookOpen, Swords, Sparkles, Volume2, Shield } from 'lucide-react';
import { Language } from '../i18n/lobbyTranslations';
import { getBattleChessStats } from '../game/battleChessHighScores';

interface BattleChessHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang?: Language;
}

export const BattleChessHistoryModal: React.FC<BattleChessHistoryModalProps> = ({
  isOpen,
  onClose,
  lang = 'nl',
}) => {
  if (!isOpen) return null;

  const stats = getBattleChessStats();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col rounded-2xl bg-neutral-950 border-2 border-emerald-600/80 shadow-[0_0_50px_rgba(16,185,129,0.25)] text-white overflow-hidden">
        {/* Header Marquee */}
        <div className="relative px-6 py-4 border-b border-neutral-800 flex items-center justify-between bg-gradient-to-r from-emerald-950 via-neutral-900 to-black">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 text-black font-mono font-black text-xl flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.5)]">
              ♟️
            </div>
            <div>
              <h2 className="font-mono font-black text-lg sm:text-xl tracking-wider text-white flex items-center gap-2">
                <span>BATTLE CHESS (1988)</span>
                <span className="text-xs px-2 py-0.5 rounded bg-emerald-950 border border-emerald-700 text-emerald-300 font-bold">
                  INTERPLAY
                </span>
              </h2>
              <p className="text-xs text-neutral-400 font-mono">
                {lang === 'nl'
                  ? 'De Legendarische Geanimeerde Schaakoorlog • Brian Fargo & Todd Camasta'
                  : 'The Legendary Animated Chess Battle • Brian Fargo & Todd Camasta'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors cursor-pointer"
            aria-label="Sluiten"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scroll Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-sm text-neutral-300 font-sans leading-relaxed">
          {/* Hero Story */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/40 via-neutral-900 to-neutral-950 border border-emerald-700/40">
            <div className="flex items-center gap-2 text-emerald-400 font-mono font-bold text-xs uppercase tracking-wider mb-2">
              <Swords className="w-4 h-4" />
              <span>{lang === 'nl' ? 'De Revolutie: Schaakstukken die tot Leven Komen' : 'The Revolution: Chess Pieces Come to Life'}</span>
            </div>
            <p className="text-neutral-200 text-sm">
              {lang === 'nl'
                ? 'In 1988 bracht Brian Fargo (oprichter van Interplay Productions) een ware aardverschuiving teweeg in de computerspelwereld met Battle Chess. Tot dan toe waren schaakprogramma’s droge, mathematische tabellen. Fargo en lead animator Todd Camasta besloten dat elk schaakstuk een eigen persoonlijkheid, humor en vechtstijl moest krijgen. Geïnspireerd door de beroemde Black Knight scène uit Monty Python’s Holy Grail werd elke slag een theatrale veldslag!'
                : 'In 1988, Brian Fargo (founder of Interplay Productions) revolutionized video gaming with Battle Chess. Until then, computer chess programs were dry mathematical grids. Fargo and lead artist Todd Camasta decided every piece needed personality, humor, and theatrical combat animations inspired by Monty Python’s Holy Grail Black Knight duel.'}
            </p>
          </div>

          {/* 3 Pillars / Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-1.5">
              <div className="flex items-center gap-1.5 text-emerald-400 font-mono font-bold text-xs">
                <Shield className="w-4 h-4" />
                <span>{lang === 'nl' ? 'De Stenen Golem' : 'The Stone Golem'}</span>
              </div>
              <p className="text-xs text-neutral-400 leading-normal">
                {lang === 'nl'
                  ? 'De Toren (Rook) verbaasde de wereld: het massieve kasteeltorentje transformeert plotseling in een gigantische stenen golem die vijanden vermorzelt en opvreet.'
                  : 'The Rook astonished audiences worldwide: the stone parapet sprouts arms and legs, transforming into a boulder monster that crushes enemy pieces.'}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-1.5">
              <div className="flex items-center gap-1.5 text-cyan-400 font-mono font-bold text-xs">
                <Sparkles className="w-4 h-4" />
                <span>{lang === 'nl' ? 'Tovenares Koningin' : 'Sorceress Queen'}</span>
              </div>
              <p className="text-xs text-neutral-400 leading-normal">
                {lang === 'nl'
                  ? 'De Koningin bevecht haar rivalen niet met het zwaard, maar met magische boogschichten en blauwe blikseminslagen die de vijand doen desintegreren.'
                  : 'The Queen wields arcane sorcery, disintegrating kings and pawns alike in crackling blue lightning storms.'}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-neutral-900 border border-neutral-800 space-y-1.5">
              <div className="flex items-center gap-1.5 text-yellow-400 font-mono font-bold text-xs">
                <Trophy className="w-4 h-4" />
                <span>{lang === 'nl' ? '250.000+ Verkocht' : '250,000+ Copies'}</span>
              </div>
              <p className="text-xs text-neutral-400 leading-normal">
                {lang === 'nl'
                  ? 'Ondanks het spectaculaire spektakel bevatte Battle Chess een volwaardige schaak-engine met openingenboek en sterke minimax zoekboom.'
                  : 'Beyond the hilarious spectacle, Battle Chess featured a genuine tournament chess algorithm, opening book, and tactical minimax search.'}
              </p>
            </div>
          </div>

          {/* Vault Stats */}
          <div className="p-4 rounded-xl bg-neutral-900/90 border border-neutral-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-white font-mono font-bold text-xs uppercase tracking-wider">
                <Award className="w-4 h-4 text-emerald-400" />
                <span>{lang === 'nl' ? 'Jouw Battle Chess Statistieken' : 'Your Battle Chess Record'}</span>
              </div>
              <span className="text-[10px] font-mono text-neutral-500">LOKAAL OPGESLAGEN</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 font-mono text-center">
              <div className="p-2.5 rounded-lg bg-black/60 border border-neutral-800">
                <div className="text-xs text-neutral-400">{lang === 'nl' ? 'Wit Gewonnen' : 'White Wins'}</div>
                <div className="text-lg font-black text-white">{stats.whiteWins}</div>
              </div>
              <div className="p-2.5 rounded-lg bg-black/60 border border-neutral-800">
                <div className="text-xs text-neutral-400">{lang === 'nl' ? 'Zwart Gewonnen' : 'Black Wins'}</div>
                <div className="text-lg font-black text-emerald-400">{stats.blackWins}</div>
              </div>
              <div className="p-2.5 rounded-lg bg-black/60 border border-neutral-800">
                <div className="text-xs text-neutral-400">{lang === 'nl' ? 'Stukken Gesneuveld' : 'Pieces Slain'}</div>
                <div className="text-lg font-black text-yellow-400">{stats.totalPiecesSlain}</div>
              </div>
            </div>
          </div>

          {/* Technical Specs Table */}
          <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-2">
            <div className="flex items-center gap-2 text-white font-mono font-bold text-xs uppercase tracking-wider mb-2">
              <Cpu className="w-4 h-4 text-emerald-400" />
              <span>{lang === 'nl' ? 'Historische Systeemspecificaties' : 'Historical System Specs'}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
              <div className="flex justify-between py-1 border-b border-neutral-800">
                <span className="text-neutral-500">Uitgever:</span>
                <span className="text-neutral-200">Interplay Productions (1988)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-neutral-800">
                <span className="text-neutral-500">Ontwerpers:</span>
                <span className="text-neutral-200">Brian Fargo &amp; Bruce Webster</span>
              </div>
              <div className="flex justify-between py-1 border-b border-neutral-800">
                <span className="text-neutral-500">Hoofdanimator:</span>
                <span className="text-neutral-200">Todd Camasta</span>
              </div>
              <div className="flex justify-between py-1 border-b border-neutral-800">
                <span className="text-neutral-500">Platformen:</span>
                <span className="text-neutral-200">Amiga 1000, MS-DOS EGA, C64, Atari ST</span>
              </div>
              <div className="flex justify-between py-1 border-b border-neutral-800">
                <span className="text-neutral-500">Audio Synth:</span>
                <span className="text-neutral-200">AdLib, Sound Blaster &amp; Paula 4-Voice</span>
              </div>
              <div className="flex justify-between py-1 border-b border-neutral-800">
                <span className="text-neutral-500">Formaat:</span>
                <span className="text-neutral-200">2x 3.5" Floppy Disks / 720KB</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-neutral-800 bg-neutral-900/90 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-black font-mono font-bold text-xs transition-colors cursor-pointer"
          >
            {lang === 'nl' ? 'Terug naar Speelhal' : 'Back to Arcade'}
          </button>
        </div>
      </div>
    </div>
  );
};
