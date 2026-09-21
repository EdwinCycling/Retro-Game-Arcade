/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Sega Zaxxon (1982) Interactive Landing Page & Flight Academy
 */

import React, { useState } from 'react';
import {
  ArrowLeft,
  Play,
  Volume2,
  VolumeX,
  Compass,
  Trophy,
  Shield,
  Zap,
  BookOpen,
  Layers,
  Sparkles,
  Award,
  Radio,
  Gamepad2,
  Rocket
} from 'lucide-react';
import { zaxxonAudio } from '../game/zaxxonAudio';
import { getZaxxonScores, ZaxxonScore } from '../game/zaxxonHighScores';
import { ZaxxonHistoryModal } from './ZaxxonHistoryModal';

interface ZaxxonLandingPageProps {
  onPlay: () => void;
  onBackToLobby: () => void;
}

export const ZaxxonLandingPage: React.FC<ZaxxonLandingPageProps> = ({ onPlay, onBackToLobby }) => {
  const [activeTab, setActiveTab] = useState<'controls' | 'targets' | 'stages' | 'tactics' | 'history' | 'leaderboard'>('controls');
  const [isMuted, setIsMuted] = useState(false);
  const [isDossierOpen, setIsDossierOpen] = useState(false);
  const highScores: ZaxxonScore[] = getZaxxonScores();

  const toggleSound = () => {
    const next = !isMuted;
    setIsMuted(next);
    zaxxonAudio.setMuted(next);
  };

  const playPreviewSound = (type: 'laser' | 'fuel' | 'siren' | 'explosion' | 'missile') => {
    if (isMuted) return;
    switch (type) {
      case 'laser':
        zaxxonAudio.playLaser();
        break;
      case 'fuel':
        zaxxonAudio.playFuelChime();
        break;
      case 'siren':
        zaxxonAudio.startLowFuelSiren();
        setTimeout(() => zaxxonAudio.stopLowFuelSiren(), 1500);
        break;
      case 'explosion':
        zaxxonAudio.playExplosion(true);
        break;
      case 'missile':
        zaxxonAudio.playMissileLaunch();
        break;
    }
  };

  const TARGETS = [
    {
      id: 1,
      name: 'GELE BRANDSTOFTANKS (FUEL)',
      points: '200 PUNTEN + 25% FUEL',
      threat: 'Levensbelangrijk',
      desc: 'De absolute levensader van je missie. Je Z-21 straaljager verbruikt continu brandstof. Schiet deze gele tanks op de vestingvloer aan gort om direct 25% brandstof aan te vullen. Vlieg laag (schaduw op één lijn) om ze te raken!',
      soundType: 'fuel' as const,
      icon: '⛽',
      color: 'border-yellow-500/50 bg-yellow-500/10 text-yellow-400'
    },
    {
      id: 2,
      name: 'ROTERENDE RADARTORENS',
      points: '1.000 PUNTEN',
      threat: 'Strategisch doelwit',
      desc: 'Hoogwaardige spionagetorens met draaiende schotelantennes. Ze staan op verhoogde masten en leveren de hoogste puntenbonus op de vloer op. Verpulver ze voor maximale arcade scores!',
      soundType: 'explosion' as const,
      icon: '📡',
      color: 'border-cyan-500/50 bg-cyan-500/10 text-cyan-400'
    },
    {
      id: 3,
      name: 'GUN TURRETS (LUCHTAFWEERGESCHUT)',
      points: '500 PUNTEN',
      threat: 'Gevaarlijk',
      desc: 'Draaiende geschutskoepels die dodelijke flak-patronen omhoog in het luchtruim afvuren. Ze mikken direct op de hoogte waarop jouw straaljager vliegt. Schakel ze snel uit!',
      soundType: 'laser' as const,
      icon: '🛡️',
      color: 'border-rose-500/50 bg-rose-500/10 text-rose-400'
    },
    {
      id: 4,
      name: 'SURFACE-TO-AIR MISSILE SILOS',
      points: '150 PUNTEN',
      threat: 'Aanvallend',
      desc: 'Ondergrondse lanceersilo’s in de stenen vloer. Zodra je nadert, stijgt er plotseling een rode raket verticaal omhoog de lucht in! Je kunt de raket in volle vlucht uit de lucht schieten met je twin lasers.',
      soundType: 'missile' as const,
      icon: '🚀',
      color: 'border-orange-500/50 bg-orange-500/10 text-orange-400'
    }
  ];

  return (
    <div className="min-h-screen w-full bg-neutral-950 text-white font-mono selection:bg-blue-500 selection:text-black">
      {/* Header Bar */}
      <header className="border-b border-neutral-800 bg-neutral-900/60 backdrop-blur-md sticky top-0 z-30 px-4 sm:px-8 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <button
            type="button"
            onClick={onBackToLobby}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white border border-neutral-700 transition cursor-pointer text-xs font-bold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Terug naar Arcade Lobby</span>
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={toggleSound}
              className="p-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white border border-neutral-700 transition cursor-pointer"
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
            </button>

            <button
              type="button"
              onClick={() => setIsDossierOpen(true)}
              className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-amber-300 border border-neutral-700 transition cursor-pointer text-xs font-bold"
            >
              <BookOpen className="w-4 h-4 text-amber-400" />
              <span>Historisch Dossier</span>
            </button>

            <button
              type="button"
              onClick={onPlay}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-black text-xs tracking-wider shadow-[0_0_20px_rgba(37,99,235,0.6)] cursor-pointer transition active:scale-95"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>SPEEL ZAXXON</span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Showcase Section */}
      <section className="relative overflow-hidden border-b border-neutral-800 bg-gradient-to-b from-blue-950/40 via-neutral-950 to-neutral-950 py-12 sm:py-16 px-4 sm:px-8">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Hero Pitch */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="px-3 py-1 rounded-full text-xs font-black bg-blue-600 text-white tracking-widest uppercase">
                SEGA • 1982
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-neutral-800 text-cyan-400 border border-neutral-700">
                WERELDPRIMEUR: 1E ISOMETRISCHE 3D GAME
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                SCHADUWFYSICA & HOOGTEBESTURING
              </span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-black font-mono tracking-tight text-white leading-tight">
              ZAXXON
            </h1>

            <p className="text-base sm:text-lg text-neutral-300 font-sans leading-relaxed max-w-2xl">
              Stap in de cockpit van de <strong>Z-21 Fighter</strong> en vlieg door de zwaar verdedigde asteroïdevesting van de Zaxxon Robot! Beheers het revolutionaire <strong>axonometrische 3D-perspectief</strong>, navigeer over de X- en Z-as met behulp van je <strong>vloerschaduw</strong>, ontwijk stroombarrières en vernietig de reusachtige eindbaas.
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <button
                type="button"
                onClick={onPlay}
                className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-500 hover:from-blue-500 hover:to-cyan-400 text-white font-black text-sm tracking-widest uppercase shadow-[0_0_35px_rgba(37,99,235,0.7)] cursor-pointer transition active:scale-95"
              >
                <Play className="w-5 h-5 fill-white" />
                <span>START MISSALTIJD (1 COIN)</span>
              </button>

              <button
                type="button"
                onClick={() => setIsDossierOpen(true)}
                className="flex items-center gap-2 px-6 py-4 rounded-2xl bg-neutral-900 hover:bg-neutral-800 text-neutral-200 border border-neutral-700 font-bold text-sm cursor-pointer transition"
              >
                <BookOpen className="w-4 h-4 text-amber-400" />
                <span>Bekijk 1982 Sega Dossier</span>
              </button>
            </div>
          </div>

          {/* Right Hero Visual Card */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="w-full max-w-md p-6 rounded-3xl bg-gradient-to-b from-neutral-900 to-neutral-950 border-2 border-blue-500/60 shadow-[0_0_40px_rgba(37,99,235,0.3)] space-y-4">
              <div className="flex justify-between items-center border-b border-neutral-800 pb-3 text-xs">
                <span className="text-cyan-400 font-bold">RADAR MISSIE LOGBOEK</span>
                <span className="text-neutral-400">SEGA CORP.</span>
              </div>

              <div className="relative aspect-video rounded-2xl overflow-hidden bg-black border border-blue-900/60 flex items-center justify-center p-4">
                <div className="text-center space-y-2">
                  <div className="text-5xl animate-bounce">🚀</div>
                  <div className="text-xs text-cyan-300 font-bold tracking-widest">
                    AXONOMETRIC FLIGHT ACTIVE
                  </div>
                  <div className="text-[10px] text-neutral-400">
                    4-Tier Altimeter • Real-Time Floor Shadow Projection
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-black/50 p-3 rounded-xl border border-neutral-800">
                  <span className="text-neutral-500 block text-[10px]">HIGHEST SCORE</span>
                  <span className="text-yellow-400 font-black text-sm">
                    {highScores.length > 0 ? highScores[0].score : '88400'}
                  </span>
                </div>
                <div className="bg-black/50 p-3 rounded-xl border border-neutral-800">
                  <span className="text-neutral-500 block text-[10px]">HUIDIGE PILOOT</span>
                  <span className="text-cyan-400 font-black text-sm">
                    {highScores.length > 0 ? highScores[0].initials : 'SEG'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Tabs Navigation */}
      <nav className="border-b border-neutral-800 bg-neutral-900/80 sticky top-[65px] z-20 px-4 sm:px-8">
        <div className="max-w-6xl mx-auto flex items-center gap-2 overflow-x-auto py-3 no-scrollbar text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('controls')}
            className={`px-4 py-2 rounded-xl transition cursor-pointer whitespace-nowrap ${
              activeTab === 'controls'
                ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.5)]'
                : 'bg-neutral-800 text-neutral-400 hover:text-white'
            }`}
          >
            🕹️ Besturing & Instrumenten
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('targets')}
            className={`px-4 py-2 rounded-xl transition cursor-pointer whitespace-nowrap ${
              activeTab === 'targets'
                ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.5)]'
                : 'bg-neutral-800 text-neutral-400 hover:text-white'
            }`}
          >
            🎯 Vestingdoelen & Punten
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('stages')}
            className={`px-4 py-2 rounded-xl transition cursor-pointer whitespace-nowrap ${
              activeTab === 'stages'
                ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.5)]'
                : 'bg-neutral-800 text-neutral-400 hover:text-white'
            }`}
          >
            🌌 De 3 Gevechtszones
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('tactics')}
            className={`px-4 py-2 rounded-xl transition cursor-pointer whitespace-nowrap ${
              activeTab === 'tactics'
                ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.5)]'
                : 'bg-neutral-800 text-neutral-400 hover:text-white'
            }`}
          >
            🧭 Piloten Tactiek & Vliegles
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 rounded-xl transition cursor-pointer whitespace-nowrap ${
              activeTab === 'history'
                ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.5)]'
                : 'bg-neutral-800 text-neutral-400 hover:text-white'
            }`}
          >
            📜 Sega 1982 Geschiedenis
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('leaderboard')}
            className={`px-4 py-2 rounded-xl transition cursor-pointer whitespace-nowrap ${
              activeTab === 'leaderboard'
                ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.5)]'
                : 'bg-neutral-800 text-neutral-400 hover:text-white'
            }`}
          >
            🏆 Top Aces Hall of Fame
          </button>
        </div>
      </nav>

      {/* Main Tab Contents */}
      <main className="max-w-6xl mx-auto px-4 sm:px-8 py-10">
        {/* TAB 1: CONTROLS */}
        {activeTab === 'controls' && (
          <div className="space-y-8 animate-in fade-in">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Control 1: Lateral */}
              <div className="p-6 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-3">
                <div className="text-cyan-400 text-xl font-bold flex items-center gap-2">
                  <span>↔️</span>
                  <span>Zijwaarts Sturen (X-As)</span>
                </div>
                <div className="flex gap-2">
                  <kbd className="px-2 py-1 bg-black rounded border border-neutral-700 text-xs">←</kbd>
                  <kbd className="px-2 py-1 bg-black rounded border border-neutral-700 text-xs">→</kbd>
                  <span className="text-neutral-500">of</span>
                  <kbd className="px-2 py-1 bg-black rounded border border-neutral-700 text-xs">A</kbd>
                  <kbd className="px-2 py-1 bg-black rounded border border-neutral-700 text-xs">D</kbd>
                </div>
                <p className="text-xs text-neutral-300 leading-relaxed font-sans">
                  Beweeg je Z-21 Fighter schuin over de landingsbaan corridor. Het schip kantelt realistisch mee in de bochten (banking roll).
                </p>
              </div>

              {/* Control 2: Altitude */}
              <div className="p-6 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-3">
                <div className="text-amber-400 text-xl font-bold flex items-center gap-2">
                  <span>↕️</span>
                  <span>Stijgen & Dalen (Z-As)</span>
                </div>
                <div className="flex gap-2">
                  <kbd className="px-2 py-1 bg-black rounded border border-neutral-700 text-xs">↑</kbd>
                  <kbd className="px-2 py-1 bg-black rounded border border-neutral-700 text-xs">↓</kbd>
                  <span className="text-neutral-500">of</span>
                  <kbd className="px-2 py-1 bg-black rounded border border-neutral-700 text-xs">W</kbd>
                  <kbd className="px-2 py-1 bg-black rounded border border-neutral-700 text-xs">S</kbd>
                </div>
                <p className="text-xs text-neutral-300 leading-relaxed font-sans">
                  Klim om over hoge muren te vliegen, of duik omlaag naar de vloer om brandstoftanks en luchtafweergeschut te vernietigen.
                </p>
              </div>

              {/* Control 3: Twin Lasers */}
              <div className="p-6 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-3">
                <div className="text-rose-400 text-xl font-bold flex items-center gap-2">
                  <span>💥</span>
                  <span>Twin Lasers Vuren</span>
                </div>
                <div className="flex gap-2">
                  <kbd className="px-3 py-1 bg-blue-600 rounded border border-blue-400 text-white text-xs font-black">SPATIE</kbd>
                  <span className="text-neutral-500">of</span>
                  <kbd className="px-2 py-1 bg-black rounded border border-neutral-700 text-xs">K</kbd>
                </div>
                <p className="text-xs text-neutral-300 leading-relaxed font-sans">
                  Vuurt dubbele laserbundels recht vooruit langs de axonometrische vlieglijn. Kogels vliegen op exact dezelfde vlieghoogte als jouw schip!
                </p>
              </div>
            </div>

            {/* Flight Instruments Guide */}
            <div className="p-6 rounded-3xl bg-neutral-900/40 border border-blue-500/40 space-y-4">
              <h3 className="text-lg font-black text-cyan-300 flex items-center gap-2">
                <Compass className="w-5 h-5" />
                <span>De Twee Cruciale Vluchtinstrumenten</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 font-sans text-xs text-neutral-300">
                <div className="space-y-2 bg-black/40 p-4 rounded-2xl border border-neutral-800">
                  <div className="font-bold text-amber-400 font-mono text-sm">
                    1. De Vloerschaduw (Altitude Shadow)
                  </div>
                  <p>
                    Omdat het beeld schuin is, lijkt een hoog vliegend schip optisch op dezelfde plek te staan als een laag vliegend schip. <strong>Kijk altijd naar de zwarte schaduw op de vloer!</strong> De schaduw verraadt je exacte grondcoördinaten. Raken je lasers de schaduw van een brandstoftank? Dan raak je hem!
                  </p>
                </div>

                <div className="space-y-2 bg-black/40 p-4 rounded-2xl border border-neutral-800">
                  <div className="font-bold text-cyan-400 font-mono text-sm">
                    2. De Hoogtemeter (Left Altimeter Bar)
                  </div>
                  <p>
                    Aan de linkerkant van het scherm bevindt zich de authentieke Sega hoogtemeter met de aanduidingen <strong>'H' (High)</strong> en <strong>'L' (Low)</strong>. De gele cursor geeft je exacte hoogte aan, verdeeld in 4 vliegniveaus voor het passeren van muur-openingen.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: TARGETS */}
        {activeTab === 'targets' && (
          <div className="space-y-6 animate-in fade-in">
            <p className="text-sm text-neutral-400 font-sans">
              Vernietig vijandelijke installaties op de asteroïdebasis om punten te scoren en je brandstoftank gevuld te houden.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {TARGETS.map((target) => (
                <div key={target.id} className={`p-6 rounded-2xl border ${target.color} space-y-4`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{target.icon}</span>
                      <div>
                        <h4 className="text-base font-black font-mono text-white">{target.name}</h4>
                        <span className="text-xs font-bold text-amber-300 font-mono">{target.points}</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => playPreviewSound(target.soundType)}
                      className="px-2.5 py-1.5 rounded-lg bg-black/60 hover:bg-black text-[11px] font-bold text-neutral-300 border border-neutral-700 transition cursor-pointer flex items-center gap-1.5"
                    >
                      <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Geluid</span>
                    </button>
                  </div>
                  <p className="text-xs text-neutral-300 leading-relaxed font-sans">
                    {target.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: STAGES */}
        {activeTab === 'stages' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="space-y-4">
              {/* Zone 1 */}
              <div className="p-6 rounded-2xl bg-neutral-900/60 border border-blue-500/40 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-blue-600 text-white">ZONE 1</span>
                  <h4 className="text-base font-black text-white">DE EERSTE ASTEROÏDEVESTING</h4>
                </div>
                <p className="text-xs text-neutral-300 font-sans leading-relaxed">
                  Je vliegt door een zwaar bepantserde vesting met stenen muren, flak geschut en pulserende elektronische krachtvelden. Vernietig brandstoftanks om je voorraad op peil te houden en vind de smalle doorgangen in de muren.
                </p>
              </div>

              {/* Zone 2 */}
              <div className="p-6 rounded-2xl bg-neutral-900/60 border border-purple-500/40 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-purple-600 text-white">ZONE 2</span>
                  <h4 className="text-base font-black text-white">DEEP SPACE DOGFIGHT</h4>
                </div>
                <p className="text-xs text-neutral-300 font-sans leading-relaxed">
                  Zodra je de eerste vesting verlaat, schiet je het open heelal in! Een diepe sterrenhemel vormt het strijdtoneel voor een intense luchtstrijd tegen vijandelijke onderscheppers die in formaties op je af duiken.
                </p>
              </div>

              {/* Zone 3 */}
              <div className="p-6 rounded-2xl bg-neutral-900/60 border border-rose-500/40 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-rose-600 text-white">ZONE 3</span>
                  <h4 className="text-base font-black text-white">HET HOOFDKWARTIER & DE ZAXXON ROBOT</h4>
                </div>
                <p className="text-xs text-neutral-300 font-sans leading-relaxed">
                  De tweede vesting is nog gevaarlijker. Aan het einde wacht de beruchte <strong>Zaxxon Robot</strong>! Hij vuurt een doelzoekende kruisraket af die jou achtervolgt. Schiet de raket 6 keer om hem op te blazen en vernietig de robot voor 10.000 bonuspunten!
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: TACTICS */}
        {activeTab === 'tactics' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="p-6 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-4">
              <h3 className="text-base font-black text-amber-400 font-mono">
                5 GOUDEN TIPS VOOR ASPIRANT-PILOTEN
              </h3>
              <ol className="space-y-3 font-sans text-xs text-neutral-300 list-decimal list-inside leading-relaxed">
                <li>
                  <strong>Houd je schaduw in de gaten:</strong> Probeer niet op het oog te mikken met je romp. Lijn de schaduw van je schip uit met het doelwit op de vloer. Zodra je zakt tot de grond, zijn je lasers gegarandeerd raak!
                </li>
                <li>
                  <strong>Brandstof is kostbaarder dan punten:</strong> Vlieg nooit zomaar langs een gele FUEL-tank. Als je brandstof leeg raakt, stopt de motor en crash je onverbiddelijk.
                </li>
                <li>
                  <strong>Timing bij krachtvelden:</strong> De elektronische barrières tussen de masten knipperen in een vast ritme. Onthoud het ritme en vlieg erdoorheen precies op het moment dat de stroom wegvalt!
                </li>
                <li>
                  <strong>Vlieg op gemiddelde hoogte:</strong> Vlieg niet constant op maximale hoogte of op de vloer. Door op hoogte 1.5 te vliegen, kun je razendsnel zowel stijgen voor een hoge muur als duiken voor een brandstoftank.
                </li>
                <li>
                  <strong>Onderschep de Homing Missile:</strong> Als de Zaxxon Robot zijn raket afvuurt, blijf dan rustig en blijf op één hoogte terwijl je met continue bursts vuurt.
                </li>
              </ol>
            </div>
          </div>
        )}

        {/* TAB 5: HISTORY */}
        {activeTab === 'history' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="p-6 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-4 font-sans text-sm text-neutral-300 leading-relaxed">
              <h3 className="text-lg font-black font-mono text-cyan-400">
                DE REVOLUTIE VAN 1982
              </h3>
              <p>
                In 1982 werd Zaxxon ontwikkeld door <strong>Ikegami Tsushinki</strong> en uitgebracht door <strong>Sega</strong>. Het was de allereerste commerciële arcadegame die gebruikmaakte van axonometrische (isometrische) projectie.
              </p>
              <p>
                Tot die tijd waren alle arcadespellen strikt tweedimensionaal (denk aan <em>Space Invaders</em> en <em>Asteroids</em>). Sega adverteerde Zaxxon zelfs op de Amerikaanse televisie met indrukwekkende live-action commercials waarin de 3D-illusie werd geprezen als de toekomst van videogames.
              </p>
              <button
                type="button"
                onClick={() => setIsDossierOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-mono text-xs font-bold transition cursor-pointer"
              >
                Lees het volledige technische dossier →
              </button>
            </div>
          </div>
        )}

        {/* TAB 6: LEADERBOARD */}
        {activeTab === 'leaderboard' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="p-6 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-4">
              <div className="flex justify-between items-center border-b border-neutral-800 pb-3">
                <h3 className="text-base font-black text-yellow-400 font-mono flex items-center gap-2">
                  <Trophy className="w-5 h-5" />
                  <span>ZAXXON ALL-TIME HALL OF FAME</span>
                </h3>
                <span className="text-xs text-neutral-400 font-mono">SEGA ARCADE RECORD</span>
              </div>

              <div className="divide-y divide-neutral-800/80 font-mono text-xs">
                {highScores.map((score, idx) => (
                  <div key={idx} className="flex justify-between items-center py-2.5">
                    <div className="flex items-center gap-4">
                      <span className={`w-6 font-bold ${idx === 0 ? 'text-yellow-400 font-black text-sm' : 'text-neutral-500'}`}>
                        {idx + 1}.
                      </span>
                      <span className="font-black text-cyan-300 text-sm">{score.initials}</span>
                      <span className="text-neutral-500 text-[10px]">Round {score.stage}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-neutral-500 text-[11px]">{score.date}</span>
                      <span className="font-black text-white text-sm">{score.score.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Historical Dossier Modal */}
      <ZaxxonHistoryModal
        isOpen={isDossierOpen}
        onClose={() => setIsDossierOpen(false)}
        onPlay={onPlay}
      />
    </div>
  );
};
