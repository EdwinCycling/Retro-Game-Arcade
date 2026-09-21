/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Manic Miner Historical Dossier & Technical Exhibition (Sinclair ZX Spectrum 1983)
 */

import React from 'react';
import { X, Trophy, Sparkles, Cpu, Award, BookOpen, Layers, Play } from 'lucide-react';
import { Language } from '../i18n/lobbyTranslations';

interface ManicMinerHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlay?: () => void;
  lang?: Language;
}

export const ManicMinerHistoryModal: React.FC<ManicMinerHistoryModalProps> = ({
  isOpen,
  onClose,
  onPlay,
  lang = 'nl',
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl max-h-[92vh] bg-neutral-900 border-2 border-yellow-500/70 rounded-3xl shadow-[0_0_50px_rgba(234,179,8,0.35)] overflow-hidden flex flex-col text-neutral-200">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-950/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-yellow-500/20 border border-yellow-500/50 flex items-center justify-center text-xl">
              ⛏️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-mono text-lg font-black text-white tracking-wide">
                  MANIC MINER (1983)
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-yellow-950 text-yellow-300 border border-yellow-700">
                  SINCLAIR ZX SPECTRUM 48K
                </span>
              </div>
              <p className="text-xs font-mono text-neutral-400">
                Matthew Smith • Bug-Byte &amp; Software Projects • De Oer-Platformer
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs sm:text-sm font-sans leading-relaxed">
          
          {/* Quick Specs Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
            <div className="p-3 rounded-2xl bg-neutral-950/70 border border-neutral-800">
              <span className="text-[10px] text-neutral-500 uppercase block">Ontwerper</span>
              <span className="text-yellow-400 font-bold text-xs">Matthew Smith (17 jr)</span>
            </div>
            <div className="p-3 rounded-2xl bg-neutral-950/70 border border-neutral-800">
              <span className="text-[10px] text-neutral-500 uppercase block">Uitgever</span>
              <span className="text-cyan-400 font-bold text-xs">Bug-Byte / Software Projects</span>
            </div>
            <div className="p-3 rounded-2xl bg-neutral-950/70 border border-neutral-800">
              <span className="text-[10px] text-neutral-500 uppercase block">Systeem</span>
              <span className="text-emerald-400 font-bold text-xs">Sinclair ZX Spectrum 48K</span>
            </div>
            <div className="p-3 rounded-2xl bg-neutral-950/70 border border-neutral-800">
              <span className="text-[10px] text-neutral-500 uppercase block">Geluid</span>
              <span className="text-magenta-400 font-bold text-xs">1-bit CPU Beeper Synth</span>
            </div>
          </div>

          {/* Section 1: Het Meesterwerk van Matthew Smith */}
          <div className="space-y-2">
            <h4 className="text-base font-bold text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-yellow-400" />
              <span>{lang === 'nl' ? 'De Geboorte van een Britse Mythe' : 'The Birth of a British Gaming Myth'}</span>
            </h4>
            <p className="text-neutral-300">
              {lang === 'nl' ? (
                <>
                  In 1983 programmeerde de pas 17-jarige <strong>Matthew Smith</strong> in slechts acht weken op zijn ZX Spectrum een game die de geschiedenis van platformers voorgoed zou veranderen: <em>Manic Miner</em>. Geïnspireerd door <em>Miner 2049er</em>, creëerde hij met <strong>Miner Willy</strong> het allereerste echte videogame-icoon van Groot-Brittannië.
                </>
              ) : (
                <>
                  In 1983, the 17-year-old <strong>Matthew Smith</strong> programmed <em>Manic Miner</em> in just eight weeks on his ZX Spectrum, changing the history of platform games forever. Inspired by <em>Miner 2049er</em>, he crafted <strong>Miner Willy</strong>, Britain&apos;s first homegrown video game icon.
                </>
              )}
            </p>
          </div>

          {/* Section 2: Technische Triomfen op de Spectrum */}
          <div className="p-4 rounded-2xl bg-neutral-950/60 border border-neutral-800 space-y-3">
            <h4 className="text-sm font-bold text-yellow-300 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-yellow-400" />
              <span>{lang === 'nl' ? 'Technische Doorbraken: In-Game Muziek & 8-Kleur Pixel Art' : 'Technical Feats: In-Game Beeper Music & Attribute Art'}</span>
            </h4>
            <div className="grid sm:grid-cols-2 gap-3 text-xs text-neutral-400">
              <div className="p-3 rounded-xl bg-neutral-900/90 border border-neutral-800">
                <span className="text-white font-bold block mb-1">🎵 In the Hall of the Mountain King</span>
                De ZX Spectrum had geen aparte geluidschip, slechts een 1-bit beeper verbonden met de Z80 processor. Matthew Smith vond een manier uit om CPU-cycli tussen de sprite-updates te interleaven, waardoor continue in-game achtergrondmuziek mogelijk werd!
              </div>
              <div className="p-3 rounded-xl bg-neutral-900/90 border border-neutral-800">
                <span className="text-white font-bold block mb-1">🚽 Surrealistische Britse Humor</span>
                In tegenstelling tot traditionele arcade-monsters zat Manic Miner vol krankzinnige gevaren: wandelende wc-brillen (Eugene), reusachtige rinkelende telefoons, struisvogels en de iconische 16-ton Monty Python voet.
              </div>
            </div>
          </div>

          {/* Section 3: De 20 Iconische Grotten */}
          <div className="space-y-2">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>{lang === 'nl' ? 'De 20 Legendarische Caverns' : 'The 20 Legendary Caverns'}</span>
            </h4>
            <p className="text-neutral-300 text-xs">
              Van <em>Central Cavern</em>, <em>The Cold Room</em>, <em>Eugene&apos;s Lair</em>, <em>Miner Willy meets the Kong Beast</em> tot <em>The Final Barrier</em>. Elke grot vereist uiterste precisie, perfecte timing op lopende banden en het vermijden van dodelijke vallen.
            </p>
          </div>

          {/* Legendary Cheat Code Quote */}
          <div className="p-3 rounded-xl bg-yellow-950/40 border border-yellow-500/30 text-[11px] font-mono text-yellow-200 flex items-center gap-2">
            <span>💡</span>
            <span>
              <strong>De beroemdste cheat-code ooit:</strong> Typte je op het titelscherm <code>6031769</code> (Matthew Smith&apos;s rijbewijsnummer), dan werd de Cavern Warp ontgrendeld!
            </span>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-neutral-800 bg-neutral-950/90">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-bold text-neutral-300 cursor-pointer"
          >
            {lang === 'nl' ? 'Sluiten' : 'Close'}
          </button>

          {onPlay && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onPlay();
              }}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-500 hover:from-yellow-300 hover:to-amber-400 text-black text-xs font-black tracking-wider flex items-center gap-2 shadow-[0_0_20px_rgba(234,179,8,0.5)] cursor-pointer active:scale-95"
            >
              <Play className="w-4 h-4 fill-black" />
              <span>{lang === 'nl' ? 'SPEEL MANIC MINER' : 'PLAY MANIC MINER'}</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
