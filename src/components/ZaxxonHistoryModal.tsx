/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Sega Zaxxon (1982) Historical Dossier & Technical Archive Modal
 */

import React from 'react';
import { X, Trophy, Rocket, Shield, BookOpen, Layers, Cpu, Award, Zap } from 'lucide-react';
import { Language } from '../i18n/lobbyTranslations';

interface ZaxxonHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlay?: () => void;
  lang?: Language;
}

export const ZaxxonHistoryModal: React.FC<ZaxxonHistoryModalProps> = ({
  isOpen,
  onClose,
  onPlay,
  lang = 'nl'
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl bg-gradient-to-b from-neutral-900 via-neutral-950 to-black border-2 border-blue-500/80 shadow-[0_0_50px_rgba(37,99,235,0.4)] text-white font-sans p-6 sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-neutral-800/80 hover:bg-neutral-700 text-neutral-300 hover:text-white border border-neutral-700 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Title */}
        <div className="flex items-center gap-4 border-b border-neutral-800 pb-6">
          <div className="w-16 h-16 rounded-2xl bg-blue-600/30 border-2 border-blue-400 flex items-center justify-center text-4xl shadow-[0_0_20px_rgba(37,99,235,0.5)] shrink-0">
            🚀
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-blue-500 text-white tracking-wide">
                SEGA • 1982
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-neutral-800 text-cyan-300 border border-neutral-700">
                {lang === 'nl' ? 'ISOMETRISCHE 3D MIJLPAAL' : 'ISOMETRIC 3D MILESTONE'}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-white mt-1">
              ZAXXON (1982)
            </h2>
            <p className="text-sm text-neutral-400 font-mono">
              {lang === 'nl' 
                ? 'Ontworpen door Sega & Ikegami Tsushinki • De allereerste isometrische arcade shooter ter wereld'
                : 'Designed by Sega & Ikegami Tsushinki • The world\'s first isometric arcade shooter'}
            </p>
          </div>
        </div>

        {/* Content Body */}
        <div className="space-y-6 mt-6">
          {/* Section 1: The Revolutionary Perspective */}
          <div className="bg-neutral-900/60 rounded-2xl p-5 border border-neutral-800 space-y-3">
            <h3 className="text-lg font-black font-mono text-cyan-400 flex items-center gap-2">
              <Layers className="w-5 h-5" />
              <span>{lang === 'nl' ? '1. De Axonometrische 3D Revolutie' : '1. The Axonometric 3D Revolution'}</span>
            </h3>
            <p className="text-sm text-neutral-300 leading-relaxed">
              {lang === 'nl' ? (
                <>
                  In 1982 waren alle arcadegames plat: <em>Space Invaders</em> en <em>Galaxian</em> waren 2D top-down, terwijl <em>Defender</em> en <em>Scramble</em> zijwaarts scrollden. <strong>Sega</strong> sloeg in als een bom met <strong>Zaxxon</strong>, vernoemd naar <strong>AXONometrische projectie</strong> (schuin isometrisch 3D-perspectief onder een hoek van 30°). Spelers zagen voor het eerst diepte, reliëf, torens en zwevende asteroïdevestingen in een overtuigende driedimensionale ruimte!
                </>
              ) : (
                <>
                  In 1982, virtually all arcade video games were 2D: <em>Space Invaders</em> and <em>Galaxian</em> were top-down, while <em>Defender</em> and <em>Scramble</em> scrolled horizontally. <strong>Sega</strong> shocked the gaming industry with <strong>Zaxxon</strong>, named after <strong>AXONometric projection</strong> (isometric 3D perspective angled at 30°). Players experienced depth, elevation, towering battlements, and floating asteroid citadels in true three-dimensional space!
                </>
              )}
            </p>
          </div>

          {/* Section 2: Height & Shadow Physics */}
          <div className="bg-neutral-900/60 rounded-2xl p-5 border border-neutral-800 space-y-3">
            <h3 className="text-lg font-black font-mono text-amber-400 flex items-center gap-2">
              <Shield className="w-5 h-5" />
              <span>{lang === 'nl' ? '2. De Schaduwfysica & Hoogtebepaling' : '2. Shadow Physics & Altitude Control'}</span>
            </h3>
            <p className="text-sm text-neutral-300 leading-relaxed">
              {lang === 'nl' ? (
                <>
                  Het geniale aan Zaxxon was de besturing over de hoogteas (de Z-as). Je kon niet alleen links en rechts sturen, maar ook stijgen en dalen over 4 hoogteniveaus. Om te bepalen hoe hoog je vloog, moest je kijken naar de <strong>schaduw van je eigen schip</strong> op de vloer! Stond de schaduw direct onder je romp? Dan scheerde je over de grond en kon je brandstoftanks raken. Vloog je hoog? Dan kon je over muren vliegen of door smalle sleuven in stroombarrières manoeuvreren.
                </>
              ) : (
                <>
                  The brilliant innovation of Zaxxon was altitude control along the Z-axis. Players navigated laterally while climbing and diving across 4 altitude levels. To judge your vertical position, you had to watch your <strong>ship's ground shadow</strong> projected on the fortress floor! When your ship touched its shadow, you were skimming the surface, allowing you to hit ground fuel tanks. At higher altitudes, you could clear walls or thread through narrow slots in force fields.
                </>
              )}
            </p>
          </div>

          {/* Section 3: Gameplay Elements Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-neutral-900/40 rounded-2xl p-4 border border-blue-500/30 space-y-2">
              <div className="flex items-center gap-2 text-yellow-400 font-mono font-bold text-sm">
                <span>⛽</span>
                <span>{lang === 'nl' ? 'Brandstof (FUEL Tanks)' : 'Fuel Management'}</span>
              </div>
              <p className="text-xs text-neutral-400 leading-relaxed">
                {lang === 'nl'
                  ? 'Je schip verbruikt onophoudelijk kerosine. Schiet gele FUEL-tanks aan flarden om +25% brandstof te herstellen en een crash te voorkomen!'
                  : 'Your fighter continuously drains fuel. Blast yellow FUEL tanks to restore +25% fuel capacity and prevent an engine flame-out!'}
              </p>
            </div>

            <div className="bg-neutral-900/40 rounded-2xl p-4 border border-red-500/30 space-y-2">
              <div className="flex items-center gap-2 text-rose-400 font-mono font-bold text-sm">
                <span>🤖</span>
                <span>{lang === 'nl' ? 'De Zaxxon Robot Boss' : 'The Zaxxon Robot Boss'}</span>
              </div>
              <p className="text-xs text-neutral-400 leading-relaxed">
                {lang === 'nl'
                  ? 'Aan het einde van de tweede vesting verschijnt de reusachtige Zaxxon Robot! Hij lanceert een dodelijke hittezoekende raket die je 6 keer moet raken om te vernietigen.'
                  : 'At the end of the second fortress waits the giant Zaxxon Robot! It fires a deadly homing missile from its chest that you must shoot 6 times to destroy.'}
              </p>
            </div>

            <div className="bg-neutral-900/40 rounded-2xl p-4 border border-purple-500/30 space-y-2">
              <div className="flex items-center gap-2 text-purple-400 font-mono font-bold text-sm">
                <span>🌌</span>
                <span>{lang === 'nl' ? 'Deep Space Dogfight' : 'Deep Space Dogfight'}</span>
              </div>
              <p className="text-xs text-neutral-400 leading-relaxed">
                {lang === 'nl'
                  ? 'Tussen de vestingen door vlieg je door een open sterrenveld waar vijandelijke onderscheppers in formaties op je af duiken!'
                  : 'Between the two fortress stages, you plunge through an open deep space starfield where enemy interceptors swoop in tactical formations!'}
              </p>
            </div>

            <div className="bg-neutral-900/40 rounded-2xl p-4 border border-emerald-500/30 space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 font-mono font-bold text-sm">
                <span>⚡</span>
                <span>{lang === 'nl' ? 'Elektrische Krachtvelden' : 'Electronic Force Fields'}</span>
              </div>
              <p className="text-xs text-neutral-400 leading-relaxed">
                {lang === 'nl'
                  ? 'Knipperende energiebarrières tussen hoogspanningsmasten. Vlieg erdoorheen op het moment dat ze doven of zoek de veilige hoogte-opening!'
                  : 'Flashing energy barriers between pylons. Thread through them when they flicker off or align your altitude with the designated opening!'}
              </p>
            </div>
          </div>

          {/* Section 4: Hardware Specs */}
          <div className="bg-neutral-900/60 rounded-2xl p-5 border border-neutral-800 space-y-3">
            <h3 className="text-md font-black font-mono text-neutral-200 flex items-center gap-2">
              <Cpu className="w-5 h-5 text-blue-400" />
              <span>{lang === 'nl' ? 'Technische Specificaties (Sega Zaxxon Hardware)' : 'Technical Specifications (Sega Zaxxon Hardware)'}</span>
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
              <div className="bg-black/60 p-2.5 rounded-xl border border-neutral-800">
                <span className="text-neutral-500 block">CPU</span>
                <span className="text-white font-bold">Zilog Z80 @ 3.072 MHz</span>
              </div>
              <div className="bg-black/60 p-2.5 rounded-xl border border-neutral-800">
                <span className="text-neutral-500 block">AUDIO</span>
                <span className="text-white font-bold">Discrete + SN76489 PSG</span>
              </div>
              <div className="bg-black/60 p-2.5 rounded-xl border border-neutral-800">
                <span className="text-neutral-500 block">RESOLUTIE</span>
                <span className="text-white font-bold">256 × 224 (Raster CRT)</span>
              </div>
              <div className="bg-black/60 p-2.5 rounded-xl border border-neutral-800">
                <span className="text-neutral-500 block">KLEUREN</span>
                <span className="text-white font-bold">256 Palette Kleuren</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-8 flex items-center justify-between border-t border-neutral-800 pt-5">
          <div className="text-xs text-neutral-500 font-mono">
            Retro Arcade Vault • Sega (1982)
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-bold transition cursor-pointer"
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
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white text-xs font-black tracking-wider shadow-[0_0_20px_rgba(37,99,235,0.6)] transition cursor-pointer"
              >
                {lang === 'nl' ? 'SPEEL ZAXXON DIRECT' : 'PLAY ZAXXON NOW'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
