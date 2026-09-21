/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * FRAK! (1984 BBC Micro) Comprehensive Deep-Dive Dossier & Technical Manual
 */

import React, { useState } from 'react';
import { Award, Zap, ShieldAlert, Play, Sparkles, BookOpen, Skull, Target, Compass } from 'lucide-react';

interface FrakHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlay: () => void;
}

export const FrakHistoryModal: React.FC<FrakHistoryModalProps> = ({
  isOpen,
  onClose,
  onPlay,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'physics' | 'maze' | 'enemies' | 'yoyo'>('overview');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in select-none">
      <div className="relative w-full max-w-3xl max-h-[92vh] bg-neutral-900 border-2 border-rose-500/80 rounded-3xl p-5 sm:p-7 shadow-[0_0_60px_rgba(244,63,94,0.35)] text-neutral-200 overflow-hidden font-sans flex flex-col justify-between">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-rose-500 to-yellow-500 text-black flex items-center justify-center text-2xl shadow-inner font-black">
              🪓
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black font-mono text-rose-400 tracking-wider">
                  FRAK! (1984)
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-950 text-rose-300 border border-rose-800">
                  BBC MICRO MODE 1
                </span>
              </div>
              <p className="text-xs text-neutral-400 font-mono mt-0.5">
                Aardvark Software • Nick Pelling (Orlando M. Pilchard) • 6502 Machine Code
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white flex items-center justify-center transition cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Tab Navigation Navigation Strip */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-3 border-b border-neutral-800 shrink-0 scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 shrink-0 transition cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-rose-600 text-white shadow-[0_0_12px_rgba(244,63,94,0.5)]'
                : 'bg-neutral-800 text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Overzicht</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('physics')}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 shrink-0 transition cursor-pointer ${
              activeTab === 'physics'
                ? 'bg-rose-600 text-white shadow-[0_0_12px_rgba(244,63,94,0.5)]'
                : 'bg-neutral-800 text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Sprong- &amp; Valfysica</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('maze')}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 shrink-0 transition cursor-pointer ${
              activeTab === 'maze'
                ? 'bg-rose-600 text-white shadow-[0_0_12px_rgba(244,63,94,0.5)]'
                : 'bg-neutral-800 text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>F-R-A-K Letterdoolhof</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('enemies')}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 shrink-0 transition cursor-pointer ${
              activeTab === 'enemies'
                ? 'bg-rose-600 text-white shadow-[0_0_12px_rgba(244,63,94,0.5)]'
                : 'bg-neutral-800 text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Skull className="w-3.5 h-3.5" />
            <span>Vijanden: Scrubbly &amp; Poglet</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('yoyo')}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 shrink-0 transition cursor-pointer ${
              activeTab === 'yoyo'
                ? 'bg-rose-600 text-white shadow-[0_0_12px_rgba(244,63,94,0.5)]'
                : 'bg-neutral-800 text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Target className="w-3.5 h-3.5" />
            <span>Yo-Yo Rotatielogica</span>
          </button>
        </div>

        {/* Tab Content Body (Scrollable) */}
        <div className="my-4 space-y-4 text-xs sm:text-sm text-neutral-300 leading-relaxed font-sans overflow-y-auto pr-1 flex-1">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-600/40 flex items-start gap-3">
                <Award className="w-6 h-6 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-rose-200 text-sm mb-1">
                    De Beruchtste &amp; Geestigste Cult-Platformer van de BBC Micro
                  </h4>
                  <p className="text-xs text-neutral-300 leading-relaxed">
                    Uitgebracht in 1984 door <strong>Aardvark Software</strong> en geschreven door <strong>Nick Pelling</strong> (onder het pseudoniem <em>Orlando M. Pilchard</em>). FRAK! werd onmiddellijk legendarisch in het Verenigd Koninkrijk vanwege zijn onverbiddelijke valfysica, surrealistische wezens en de luidruchtige wanhoopskreet van holbewoner Trogg wanneer hij te pletter viel.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800">
                  <span className="text-yellow-400 font-mono font-bold text-xs flex items-center gap-1.5 mb-1">
                    <Sparkles className="w-3.5 h-3.5" /> Waarom heet het "FRAK!"?
                  </span>
                  <p className="text-[11px] text-neutral-400">
                    Het woord <em>"Frak!"</em> stamt uit de klassieke 1978 sci-fi televisieserie <em>Battlestar Galactica</em>, waar het diende als beleefde censuurvloek voor het vierletterige Engelse f-woord. Elke keer dat Trogg zijn nek breekt of geraakt wordt, schalt zijn hese kreet over de BBC luidspreker en verschijnt een gigantische strip-ballon: <strong>"FRAK!"</strong>.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800">
                  <span className="text-cyan-400 font-mono font-bold text-xs flex items-center gap-1.5 mb-1">
                    <Zap className="w-3.5 h-3.5" /> 180° Upside-Down Flip Modus
                  </span>
                  <p className="text-[11px] text-neutral-400">
                    Wanneer spelers alle zones voltooiden, activeerde de BBC Micro loop 2: <strong>het hele scherm stond 180° op zijn kop</strong>! Spelers moesten dan omgekeerd rennen en springen. In onze emulator kun je dit op ieder gewenst moment nabootsen via de <em>180° FLIP</em> knop.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: JUMP & FALL PHYSICS */}
          {activeTab === 'physics' && (
            <div className="space-y-3">
              <div className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-2">
                <h4 className="text-sm font-bold text-rose-400 font-mono flex items-center gap-2">
                  <Zap className="w-4 h-4 text-rose-400" />
                  De Beruchte Dodelijke Valhoogte (Fatal Fall Threshold)
                </h4>
                <p className="text-xs text-neutral-300">
                  In tegenstelling tot Mario of Chuckie Egg kende FRAK! een genadeloos realistische zwaartekrachtlimiet. Holbewoner Trogg heeft breekbare botten:
                </p>
                <div className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 font-mono text-xs space-y-1">
                  <div className="text-cyan-300 font-bold">• Sprongkracht: vy = -6.4 px/frame (parabolische boog)</div>
                  <div className="text-amber-300 font-bold">• Zwaartekracht versnelling: +0.28 px/frame² tot terminale snelheid 7.0 px/frame</div>
                  <div className="text-rose-400 font-black">• Dodelijke Valhoogte: &gt; 105 pixels (~2 verdiepingen) = FATAL!</div>
                </div>
                <p className="text-xs text-neutral-400">
                  Zakt Trogg meer dan 105 pixels verticaal zonder dat hij een ladder, touw of ketting grijpt, dan breekt hij bij de landing onverbiddelijk zijn nek. Zijn lichaam tuimelt neer, het spel stopt direct en de audio-synthesizer blaast de beroemde dalende "FRAK!"-klaagzang.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-2">
                <h4 className="text-sm font-bold text-cyan-400 font-mono">
                  Diagonale Glij-fysica bij Platformranden (Edge Slide)
                </h4>
                <p className="text-xs text-neutral-400">
                  Wanneer Trogg van een platform afloopt, valt hij in FRAK! <em>niet</em> verticaal recht omlaag. De 6502 machinecode berekent een voorwaartse glij-impuls (`t.slideDir = t.facingLeft ? -1 : 1; t.x += t.slideDir * 1.2`). Hierdoor glijdt Trogg schuin voorwaarts van de richel af, wat vaak leidt tot ongewenste valpartijen als de speler niet stopt vóór de rand!
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: F-R-A-K LETTER MAZE */}
          {activeTab === 'maze' && (
            <div className="space-y-3">
              <div className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-2">
                <h4 className="text-sm font-bold text-yellow-400 font-mono flex items-center gap-2">
                  <Compass className="w-4 h-4 text-yellow-400" />
                  De Typografische Architectuur van Zone 1
                </h4>
                <p className="text-xs text-neutral-300">
                  De platforms, richels, ladders en touwen in Level 1 vormen over de gehele breedte van het scherm letterlijk het vierletterwoord <strong>F - R - A - K</strong>:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                  <div className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800">
                    <span className="text-rose-400 font-bold block mb-1">LETTER 'F' (x: 30 - 120)</span>
                    <span className="text-neutral-400 text-[11px] block">
                      3 horizontale balken (F-TOP, F-MID, F-BOT). Trogg begint hier onderaan. Een verticaal klimtouw en ladders verbinden de verdiepingen. Bevat 1 gouden sleutel op de bovenste balk.
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800">
                    <span className="text-amber-400 font-bold block mb-1">LETTER 'R' (x: 145 - 240)</span>
                    <span className="text-neutral-400 text-[11px] block">
                      Heeft een gesloten bovenste lus (R-TOP &amp; R-MID) met een ketting en een diagonaal pootje (R-LEG). Binnenin de lus van de 'R' ligt de 2e gouden sleutel bewaakt door Scrubbly!
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800">
                    <span className="text-emerald-400 font-bold block mb-1">LETTER 'A' (x: 260 - 360)</span>
                    <span className="text-neutral-400 text-[11px] block">
                      Pyramidevorm met linker- en rechterschouders, een apex op 80px hoogte en een centrale dwarsbalk (A-BAR). Heeft 2 verticale touwen. Bevat een gloeilamp voor extra tijd.
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800">
                    <span className="text-cyan-400 font-bold block mb-1">LETTER 'K' (x: 385 - 490)</span>
                    <span className="text-neutral-400 text-[11px] block">
                      Bestaat uit een verticale ruggengraat (spines), een diagonale onderarm (K-ARM) en de bovenste uitgangstak (EXIT-LEDGE) waar de afgesloten kasteeldeur staat!
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-xs">
                <span className="font-bold text-amber-300 font-mono block mb-1">
                  🔑 Doel: Alle 3 Sleutels Verzamelen
                </span>
                <span className="text-neutral-400">
                  De uitgangsdeur op de bovenste tak van de letter 'K' blijft hermetisch gesloten totdat Trogg alle 3 de gouden sleutels heeft opgepakt. Elke sleutel levert +500 punten op.
                </span>
              </div>
            </div>
          )}

          {/* TAB 4: ENEMIES (SCRUBBLY, POGLET, HOOTER) */}
          {activeTab === 'enemies' && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Scrubbly */}
                <div className="p-3.5 rounded-2xl bg-neutral-950 border border-rose-500/40 space-y-1.5">
                  <div className="w-8 h-8 rounded-lg bg-rose-950 text-rose-300 border border-rose-700 flex items-center justify-center font-bold text-base">
                    🪥
                  </div>
                  <h5 className="font-mono font-bold text-white text-xs">SCRUBBLY</h5>
                  <span className="text-[10px] font-mono text-rose-400 font-bold block">De Levende Schrobborstel</span>
                  <p className="text-[11px] text-neutral-400 leading-relaxed">
                    Een bezemachtige borstel met vlijmscherpe borstelharen. Patrouilleert horizontaal op richels (zoals de R-loop). Zodra hij de rand van zijn patrouillezone bereikt, keert hij automatisch om (`patrolMinX` / `patrolMaxX`). Een aanraking met zijn borstelharen is fataal!
                  </p>
                  <span className="text-[10px] font-mono text-amber-300 font-bold block pt-1">Beloning: +200 PTS</span>
                </div>

                {/* Poglet */}
                <div className="p-3.5 rounded-2xl bg-neutral-950 border border-pink-500/40 space-y-1.5">
                  <div className="w-8 h-8 rounded-lg bg-pink-950 text-pink-300 border border-pink-700 flex items-center justify-center font-bold text-base">
                    🐷
                  </div>
                  <h5 className="font-mono font-bold text-white text-xs">POGLET</h5>
                  <span className="text-[10px] font-mono text-pink-400 font-bold block">Het Knorrende Varkentje</span>
                  <p className="text-[11px] text-neutral-400 leading-relaxed">
                    Een klein, snel viervoetig varkenswezentje dat over de dwarsbalken (o.a. van de 'A' en de 'K') rent. Beweegt met een snelle waggelende loopcyclus. Vereist snelle reflexen met de Yo-Yo door zijn lagere hitbox.
                  </p>
                  <span className="text-[10px] font-mono text-amber-300 font-bold block pt-1">Beloning: +200 PTS</span>
                </div>

                {/* Hooter */}
                <div className="p-3.5 rounded-2xl bg-neutral-950 border border-cyan-500/40 space-y-1.5">
                  <div className="w-8 h-8 rounded-lg bg-cyan-950 text-cyan-300 border border-cyan-700 flex items-center justify-center font-bold text-base">
                    🗿
                  </div>
                  <h5 className="font-mono font-bold text-white text-xs">HOOTER</h5>
                  <span className="text-[10px] font-mono text-cyan-400 font-bold block">Het Reuzeneus Standbeeld</span>
                  <p className="text-[11px] text-neutral-400 leading-relaxed">
                    Een wandelend stenen standbeeld met een gigantische haakneus. Beweegt statig en zwaar. Door zijn grote omvang raakt hij Trogg gemakkelijk op afstand, tenzij de Yo-Yo op maximale afstand wordt gegooid.
                  </p>
                  <span className="text-[10px] font-mono text-amber-300 font-bold block pt-1">Beloning: +200 PTS</span>
                </div>
              </div>

              {/* Aanvullende gevaren */}
              <div className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-1">
                <span className="font-mono font-bold text-amber-400 text-xs flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5" /> Zwevende Ballonnen &amp; Neerstortende Dolken
                </span>
                <p className="text-[11px] text-neutral-400 leading-relaxed">
                  Naast grondmonsters stijgen er periodiek <strong>ballonnen</strong> op uit de afgrond met een zachte horizontale sinusgolf-waggel (+150 pts), en suizen er scherpe <strong>dolken</strong> diagonaal uit het plafond naar beneden (+300 pts). Beide kunnen in de vlucht worden neergeschoten met de Yo-Yo!
                </p>
              </div>
            </div>
          )}

          {/* TAB 5: YO-YO ROTATION & MECHANICS */}
          {activeTab === 'yoyo' && (
            <div className="space-y-3">
              <div className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-2">
                <h4 className="text-sm font-bold text-yellow-400 font-mono flex items-center gap-2">
                  <Target className="w-4 h-4 text-yellow-400" />
                  De Wiskunde &amp; Rotatielogica van Troggs Yo-Yo
                </h4>
                <p className="text-xs text-neutral-300">
                  Trogg vecht niet met stenen of knotsen, maar met een elastische <strong>Yo-Yo</strong>. Dit wapen heeft een unieke fysische levenscyclus in de engine:
                </p>

                <div className="space-y-2 font-mono text-xs">
                  <div className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800">
                    <span className="text-cyan-300 font-bold block mb-0.5">1. Lanceringsvector (Forward Launch)</span>
                    <span className="text-neutral-400 text-[11px]">
                      Vertrekt horizontaal vanaf Troggs handhoogte (`y - 14`, offset ±12 px afhankelijk van looprichting) met een constante projectielsnelheid van `vx = ±6.2 px/frame`.
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800">
                    <span className="text-amber-300 font-bold block mb-0.5">2. Centrifugale Rotatiespin (Spin Angle)</span>
                    <span className="text-neutral-400 text-[11px]">
                      Elk frame roteert de Yo-Yo schijf met `spinAngle += 0.45 radialen` (~25.7 graden per frame). In de canvas renderer tekent dit de dynamische centrifugale spaken en glans van de spintollen.
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-neutral-900 border border-neutral-800">
                    <span className="text-rose-400 font-bold block mb-0.5">3. Elastische Vector-String &amp; Terugkeer (Homing Return)</span>
                    <span className="text-neutral-400 text-[11px]">
                      Zodra de Yo-Yo zijn maximale bereik bereikt (`maxDist = 135 px`), een schermrand raakt of een vijand vernietigt, schakelt hij naar `returning = true`. Er wordt een dynamische richtingsvector berekend naar Troggs <em>actuele</em> handpositie (`dx = targetX - y.x, dy = targetY - y.y`). Met een versnelde terugkeersnelheid van `7.5 px/frame` schiet de Yo-Yo terug, zelfs als Trogg rent of springt!
                    </span>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-rose-950/40 border border-rose-800/60 text-[11px] text-rose-300 font-mono">
                  ⚠️ <strong>De Duisternis-Regel:</strong> Als de klok op 000 seconden staat gaat het licht uit (Duisternis-modus). In het donker kan de Yo-Yo grondmonsters (Scrubblies, Poglets, Hooters) nog wel raken op gehoor, maar zwevende ballonnen en dolken niet meer!
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Action Footer */}
        <div className="flex items-center justify-between gap-3 pt-3 border-t border-neutral-800 shrink-0">
          <span className="text-xs text-neutral-400 font-mono hidden sm:inline">
            Aardvark Software 1984 • Nick Pelling
          </span>
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-mono text-xs cursor-pointer transition"
            >
              Sluiten
            </button>
            <button
              type="button"
              onClick={() => {
                onClose();
                onPlay();
              }}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-yellow-500 hover:from-rose-500 hover:to-yellow-400 text-black font-black font-mono text-xs flex items-center gap-1.5 shadow-[0_0_20px_rgba(239,68,68,0.4)] cursor-pointer transition active:scale-95"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>SPEEL FRAK! NU</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
