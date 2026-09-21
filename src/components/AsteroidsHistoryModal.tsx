/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Atari Asteroids (1979) Historical Archive & Technical Exhibition Modal
 */

import React, { useState } from 'react';
import { X, Play, BookOpen, Cpu, Sparkles, Trophy, Award, Disc, Terminal, Shield, Zap } from 'lucide-react';
import { Language } from '../i18n/lobbyTranslations';

interface AsteroidsHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlay: () => void;
  lang: Language;
}

export const AsteroidsHistoryModal: React.FC<AsteroidsHistoryModalProps> = ({
  isOpen,
  onClose,
  onPlay,
  lang,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'hardware' | 'strategy' | 'legacy'>('overview');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md animate-fade-in font-mono">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-neutral-950 border-2 border-neutral-700 rounded-3xl shadow-[0_0_50px_rgba(255,255,255,0.15)] flex flex-col overflow-hidden text-neutral-200">
        {/* Header Marquee */}
        <div className="p-6 bg-gradient-to-r from-neutral-900 via-neutral-800 to-neutral-900 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-neutral-800 border border-neutral-600 flex items-center justify-center text-2xl shadow-inner">
              🪨
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-wider">
                  ASTEROIDS
                </h2>
                <span className="px-2 py-0.5 rounded text-xs font-bold bg-white text-black">
                  1979
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                Lyle Rains &amp; Ed Logg • Atari Inc. • QuadraScan Digital Vector Generator (DVG)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white border border-neutral-700 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-neutral-800 bg-neutral-900/50 px-6 gap-2 pt-2 text-xs">
          {[
            { id: 'overview', label: lang === 'nl' ? 'Overzicht' : 'Overview', icon: BookOpen },
            { id: 'hardware', label: lang === 'nl' ? 'Vector Hardware' : 'Vector Hardware', icon: Cpu },
            { id: 'strategy', label: lang === 'nl' ? 'Piloten Handleiding' : 'Pilot Strategy', icon: Shield },
            { id: 'legacy', label: lang === 'nl' ? 'Historische Impact' : 'Legacy & Trivia', icon: Trophy },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'border-white text-white bg-neutral-800/60 rounded-t-lg'
                    : 'border-transparent text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm leading-relaxed">
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-fade-in">
              <div className="p-4 rounded-2xl bg-neutral-900/80 border border-neutral-800 flex flex-col sm:flex-row gap-4 items-center">
                <div className="text-4xl sm:text-5xl">🚀</div>
                <div>
                  <h3 className="font-bold text-white text-base">
                    {lang === 'nl' ? 'De Grootste Muntvreter in de Geschiedenis van Atari' : 'The Greatest Coin-Drop Machine in Atari History'}
                  </h3>
                  <p className="text-neutral-300 text-xs mt-1">
                    {lang === 'nl'
                      ? 'In november 1979 veroverde Asteroids speelhallen over de hele wereld. Spelers stonden urenlang in de rij en exploitanten moesten grotere muntenbakken in de kasten installeren omdat ze overstroomden met kwartjes!'
                      : 'In November 1979, Asteroids took arcades by storm worldwide. Operators had to install larger coin boxes inside cabinets because quarters were overflowing within hours!'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800">
                  <h4 className="font-bold text-white mb-2 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    {lang === 'nl' ? 'Wiskundige Schoonheid' : 'Mathematical Elegance'}
                  </h4>
                  <p className="text-xs text-neutral-400">
                    {lang === 'nl'
                      ? 'Pure Newtoniaanse traagheid: stuwkracht accelereert je ruimteschip in een wrijvingsloze ruimte. Geen remmen; om te vertragen moet je 180° omkeren en tegensturen.'
                      : 'Pure Newtonian physics: thrust accelerates your ship in frictionless vacuum. There are no brakes; you must flip 180° and counter-thrust to slow down.'}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800">
                  <h4 className="font-bold text-white mb-2 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-yellow-400" />
                    {lang === 'nl' ? 'De Versnellende Hartslag' : 'The Accelerating Heartbeat'}
                  </h4>
                  <p className="text-xs text-neutral-400">
                    {lang === 'nl'
                      ? 'Geïnspireerd door John Williams’ filmmuziek voor "Jaws" (1975). Het ritmische bas-dreunen versnelt naarmate er minder rotsen overblijven, wat zorgde voor ongekende psychologische spanning.'
                      : 'Inspired by John Williams’ famous "Jaws" score. The alternating low bass thumps accelerate relentlessly as fewer asteroids remain on screen.'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'hardware' && (
            <div className="space-y-4 animate-fade-in">
              <div className="p-4 rounded-2xl bg-neutral-900/80 border border-neutral-800 space-y-3">
                <h3 className="font-bold text-white text-base flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-white" />
                  {lang === 'nl' ? 'Atari QuadraScan DVG (Digital Vector Generator)' : 'Atari QuadraScan DVG (Digital Vector Generator)'}
                </h3>
                <p className="text-xs text-neutral-300">
                  {lang === 'nl'
                    ? 'In tegenstelling tot conventionele raster-schermen (zoals tv’s) die beeld lijn voor lijn scannen, gebruikt Asteroids een XY Vector Display. De elektronenstraal tekent lichtgevende lijnen rechtstreeks op het fosfor, wat zorgt voor ongeëvenaarde scherpte en een magische fosfor-gloed.'
                    : 'Unlike raster CRT monitors that draw scanlines horizontally, Asteroids uses an XY Vector Display. The electron gun draws sharp illuminated lines directly onto phosphor, creating infinite resolution sharpness and distinct vector glow.'}
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs">
                  <div className="bg-neutral-950 p-2.5 rounded-lg border border-neutral-800">
                    <span className="text-neutral-500 block text-[10px]">CPU</span>
                    <span className="font-bold text-white">MOS 6502 @ 1.5 MHz</span>
                  </div>
                  <div className="bg-neutral-950 p-2.5 rounded-lg border border-neutral-800">
                    <span className="text-neutral-500 block text-[10px]">DISPLAY</span>
                    <span className="font-bold text-white">19" QuadraScan XY</span>
                  </div>
                  <div className="bg-neutral-950 p-2.5 rounded-lg border border-neutral-800">
                    <span className="text-neutral-500 block text-[10px]">SOUND</span>
                    <span className="font-bold text-white">Discrete Analog + Quad OP-Amps</span>
                  </div>
                  <div className="bg-neutral-950 p-2.5 rounded-lg border border-neutral-800">
                    <span className="text-neutral-500 block text-[10px]">ROM/RAM</span>
                    <span className="font-bold text-white">8 KB ROM / 1 KB RAM</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'strategy' && (
            <div className="space-y-4 animate-fade-in">
              <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 space-y-2">
                <h4 className="font-bold text-white">🎯 {lang === 'nl' ? 'Vliegende Schotels (UFO’s)' : 'Flying Saucers (UFOs)'}</h4>
                <ul className="list-disc pl-5 text-xs text-neutral-300 space-y-1.5">
                  <li>
                    <strong className="text-neutral-100">{lang === 'nl' ? 'Grote Schotel (200 Pts):' : 'Large Saucer (200 Pts):'}</strong> {lang === 'nl' ? 'Schiet ongericht en willekeurig in de ruimte.' : 'Shoots haphazardly in random directions.'}
                  </li>
                  <li>
                    <strong className="text-red-400">{lang === 'nl' ? 'Kleine Schotel (1000 Pts):' : 'Small Saucer (1000 Pts):'}</strong> {lang === 'nl' ? 'Extreem gevaarlijke sluipschutter die rechtstreeks anticipeert op je vluchtrichting!' : 'Extremely lethal sniper that calculates player lead trajectories!'}
                  </li>
                  <li>
                    <strong className="text-cyan-400">{lang === 'nl' ? 'Hyperspace Noodsprong:' : 'Hyperspace Emergency Warp:'}</strong> {lang === 'nl' ? 'Teleporteert je onmiddellijk naar een willekeurige locatie, maar heeft 1 op 6 kans op catastrofale zelfvernietiging.' : 'Instantly teleports you elsewhere on screen with a 1-in-6 chance of instant catastrophic hull explosion.'}
                  </li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'legacy' && (
            <div className="space-y-4 animate-fade-in">
              <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 space-y-2">
                <h4 className="font-bold text-white flex items-center gap-2">
                  <Award className="w-4 h-4 text-yellow-400" />
                  {lang === 'nl' ? 'Wereldrecord en Popcultuur' : 'World Records & Pop Culture'}
                </h4>
                <p className="text-xs text-neutral-300">
                  {lang === 'nl'
                    ? 'Asteroids was de eerste arcadekast ter wereld waarin spelers een highscore met 3 initialen konden invoeren. In 1982 zette de 15-jarige Scott Safran een legendarisch wereldrecord neer van 41.336.440 punten na een speelsessie van 60 uur!'
                    : 'Asteroids was the first arcade game to let players enter 3-letter initials for high scores. In 1982, 15-year-old Scott Safran set the all-time world record of 41,336,440 points after a grueling 60-hour marathon session!'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-6 bg-neutral-900 border-t border-neutral-800 flex justify-between items-center">
          <div className="text-xs text-neutral-500">
            {lang === 'nl' ? 'Atari Inc. • Sunnyvale, California' : 'Atari Inc. • Sunnyvale, California'}
          </div>
          <button
            type="button"
            onClick={() => {
              onClose();
              onPlay();
            }}
            className="px-6 py-3 rounded-xl bg-white hover:bg-neutral-200 text-black font-black text-xs tracking-wider shadow-[0_0_20px_rgba(255,255,255,0.4)] transition-all transform active:scale-95 flex items-center gap-2 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-black" />
            <span>{lang === 'nl' ? 'SPEEL ASTEROIDS!' : 'PLAY ASTEROIDS!'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
