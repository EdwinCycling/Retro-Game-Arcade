import React, { useState } from 'react';
import {
  Skull,
  Crosshair,
  Flame,
  Volume2,
  VolumeX,
  Play,
  ArrowLeft,
  Trophy,
  Shield,
  Zap,
  Info,
  Radio,
  Sparkles,
  BookOpen,
  Eye,
  Key,
  Gamepad2
} from 'lucide-react';
import { doomAudio } from '../game/doomAudio';
import { getDoomScores, DoomHighScore } from '../game/doomHighScores';
import { haptics } from '../utils/haptics';

interface DoomLandingPageProps {
  onPlay: (levelId?: string) => void;
  onBackToLobby: () => void;
}

export const DoomLandingPage: React.FC<DoomLandingPageProps> = ({ onPlay, onBackToLobby }) => {
  const [activeTab, setActiveTab] = useState<'controls' | 'arsenal' | 'bestiary' | 'story' | 'secrets' | 'cheats'>('controls');
  const [selectedWeapon, setSelectedWeapon] = useState<number>(3); // Default Shotgun
  const [selectedMonster, setSelectedMonster] = useState<string>('imp');
  const [isMuted, setIsMuted] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState('e1m1');
  const highScores: DoomHighScore[] = getDoomScores();

  const toggleSound = () => {
    const next = !isMuted;
    setIsMuted(next);
    doomAudio.setMuted(next);
    if (!next) {
      doomAudio.startMusic();
    }
  };

  const WEAPONS = [
    {
      id: 1,
      name: 'FIST / BERSERK',
      slot: 'SLOT 1',
      ammo: 'GEEN',
      damage: '2 - 20 (x10 met Berserk!)',
      rate: 'Medium',
      desc: 'Wanneer munitie op is of wanneer je de zwarte Berserk Pack pakt en demonen met blote handen tot pulp slaat.',
      quote: '"Rip and tear, until it is done!"',
      sound: () => doomAudio.playPunch(),
      icon: '👊'
    },
    {
      id: 2,
      name: 'PISTOL',
      slot: 'SLOT 2',
      ammo: 'Kogels (Bullets)',
      damage: '5 - 15',
      rate: 'Semi-automatisch',
      desc: 'Standaard UAC militair zijwapen. Betrouwbaar op lange afstand om verre Zombiemannen uit te schakelen.',
      quote: 'Standaard uitrusting voor elke Space Marine op Phobos.',
      sound: () => doomAudio.playPistol(),
      icon: '🔫'
    },
    {
      id: 3,
      name: 'PUMP-ACTION SHOTGUN',
      slot: 'SLOT 3',
      ammo: 'Hagelpatronen (Shells)',
      damage: '7 korrels x 5-15 (tot 105 dmg)',
      rate: '0.85s (met herlaadpomp)',
      desc: 'Hét meest iconische wapen uit de videogame-geschiedenis. Verwoestende spreiding op korte afstand met een onvergetelijke mechanische pompklank.',
      quote: '"Gotta love the smell of spent shells in the morning."',
      sound: () => doomAudio.playShotgun(),
      icon: '💥'
    },
    {
      id: 4,
      name: 'CHAINGUN',
      slot: 'SLOT 4',
      ammo: 'Kogels (Bullets)',
      damage: '5 - 15 per kogel',
      rate: 'Extreem snel (525 RPM)',
      desc: 'Roterend drieloops machinegeweer dat vijanden vastzet in een permanente pijnstuiptrekking (pain-lock).',
      quote: 'Verslindt kogelmagazijnen, maar veegt hele zalen Imps in seconden schoon.',
      sound: () => doomAudio.playChaingun(),
      icon: '⚡'
    },
    {
      id: 5,
      name: 'ROCKET LAUNCHER',
      slot: 'SLOT 5',
      ammo: 'Raketten (Rockets)',
      damage: '20-160 direct + 128 splash',
      rate: '1.2 raketten / sec',
      desc: 'Draagt een enorme explosieve lading. Pas op dat je niet te dicht bij een muur schiet voor de terugslag!',
      quote: 'Perfect voor dichte concentraties monsters en Barons of Hell.',
      sound: () => {
        doomAudio.playRocketFire();
        setTimeout(() => doomAudio.playExplosion(), 350);
      },
      icon: '🚀'
    },
    {
      id: 6,
      name: 'PLASMA RIFLE',
      slot: 'SLOT 6',
      ammo: 'Energiecellen (Cells)',
      damage: '5 - 40 per plasma-bol',
      rate: '11 bollen / sec',
      desc: 'Schiet een onophoudelijke stroom van helblauwe oververhitte plasmabollen af. Pure high-tech vernietiging.',
      quote: 'UAC Experimental Military Prototype.',
      sound: () => doomAudio.playPlasma(),
      icon: '🔷'
    },
    {
      id: 7,
      name: 'BFG 9000',
      slot: 'SLOT 7',
      ammo: '40 Energiecellen per schot',
      damage: '100-800 + 40 onzichtbare tracers',
      rate: '1.4s laadtijd',
      desc: 'De "Big F***ing Gun 9000". Na een huilende oplading lanceert het een gigantische groene plasma-orb die hele vertrekken schoonveegt.',
      quote: '"The ultimate problem solver."',
      sound: () => doomAudio.playBFG(),
      icon: '☢️'
    }
  ];

  const BESTIARY = [
    {
      id: 'zombie',
      name: 'FORMER HUMAN (ZOMBIEMAN)',
      hp: 20,
      threat: 'Laag',
      lore: 'Voormalige UAC-collega mariniers die bezeten zijn door demonische krachten. Ze schieten met geweren en laten kogelmagazijnen achter.',
      quote: '"Uhh... groan!"',
      sound: () => doomAudio.playZombiemanAlert()
    },
    {
      id: 'imp',
      name: 'IMP',
      hp: 50,
      threat: 'Medium',
      lore: 'Bruine demonen bedekt met bot-stekels. Ze werpen dodelijke oranje vuurballen over lange afstanden en halen uit met vlijmscherpe klauwen.',
      quote: '"Grrrraaaargh!"',
      sound: () => doomAudio.playImpAlert()
    },
    {
      id: 'demon',
      name: 'DEMON ("PINKY")',
      hp: 120,
      threat: 'Gevaarlijk',
      lore: 'Gespierde, roze cyber-bipeds met een monsterlijke kaak vol vlijmscherpe tanden. Ze stormen recht op je af en happen genadeloos toe.',
      quote: '"Chomp! Chomp!"',
      sound: () => doomAudio.playDemonAttack()
    },
    {
      id: 'baron',
      name: 'BARON OF HELL',
      hp: 1000,
      threat: 'Extreem (E1M8 Eindbaas)',
      lore: 'Torenhoge gehoornde heersers van de hel met geitenpoten die gloeiend groen plasma smijten. De ultieme uitdaging van Knee-Deep in the Dead.',
      quote: '"The bruised brothers of Phobos."',
      sound: () => doomAudio.playMonsterDeath()
    }
  ];

  return (
    <div className="w-full min-h-screen bg-black text-white font-sans selection:bg-red-600 selection:text-white pb-16">
      {/* Top Bar with Navigation */}
      <header className="sticky top-0 z-50 bg-neutral-950/90 backdrop-blur border-b border-red-900/60 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToLobby}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-xs font-mono text-neutral-300 hover:text-white transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-red-500" />
            <span>ARCADE LOBBY</span>
          </button>
          <span className="hidden sm:inline-block text-xs font-mono text-neutral-500">|</span>
          <span className="text-xs font-mono font-bold tracking-widest text-red-400">
            id Software • 10 DECEMBER 1993
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleSound}
            className={`p-2 rounded-lg border text-xs flex items-center gap-1.5 transition cursor-pointer ${
              isMuted
                ? 'bg-neutral-900 border-neutral-800 text-neutral-500'
                : 'bg-red-950/60 border-red-500/50 text-red-300 shadow-[0_0_12px_rgba(239,68,68,0.4)]'
            }`}
            title={isMuted ? 'Geluid Aanzetten' : 'Geluid Dempen'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-red-400" />}
            <span className="hidden md:inline font-mono font-bold">{isMuted ? 'DEMP' : 'AT DOOMS GATE'}</span>
          </button>

          <button
            onClick={() => onPlay(selectedLevel)}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-red-600 via-amber-600 to-red-600 hover:brightness-125 text-white font-mono font-black text-xs sm:text-sm tracking-wider shadow-[0_0_25px_rgba(239,68,68,0.6)] flex items-center gap-2 cursor-pointer active:scale-95 transition-transform"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>START E1M1</span>
          </button>
        </div>
      </header>

      {/* Hero Banner with Authentic DOOM Typography & Phobos Red Mountains */}
      <section className="relative overflow-hidden pt-10 pb-16 px-4 bg-gradient-to-b from-red-950/40 via-black to-black border-b border-red-900/40">
        <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#dc2626_1px,transparent_1px)] [background-size:16px_16px]" />

        <div className="max-w-6xl mx-auto flex flex-col items-center text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-red-950/80 border border-red-500/60 text-red-400 text-xs font-mono font-bold uppercase tracking-widest mb-4 shadow-[0_0_20px_rgba(239,68,68,0.4)]">
            <Flame className="w-3.5 h-3.5 text-red-500 animate-pulse" />
            <span>EPISODE 1: KNEE-DEEP IN THE DEAD</span>
          </div>

          {/* Iconic DOOM Title Graphic */}
          <h1 className="text-6xl sm:text-8xl md:text-9xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-amber-400 via-red-500 to-red-900 drop-shadow-[0_10px_25px_rgba(239,68,68,0.8)] select-none">
            DOOM
          </h1>

          <p className="mt-4 text-base sm:text-xl text-neutral-300 max-w-2xl font-mono leading-relaxed">
            De revolutionaire 3D First-Person Shooter van <strong className="text-amber-400">John Carmack</strong> en{' '}
            <strong className="text-amber-400">John Romero</strong> die de wereld voorgoed veranderde.
          </p>

          {/* Level Selector & Instant Launch Buttons */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            {[
              { id: 'e1m1', label: 'E1M1: HANGAR', desc: 'De legendarische zigzag catwalk' },
              { id: 'e1m2', label: 'E1M2: NUCLEAR PLANT', desc: 'Giftige nissen & doolhoven' },
              { id: 'e1m3', label: 'E1M3: TOXIN REFINERY', desc: 'Radioactieve tanks' },
            ].map((lvl) => (
              <button
                key={lvl.id}
                onClick={() => {
                  haptics.light();
                  setSelectedLevel(lvl.id);
                  onPlay(lvl.id);
                }}
                className={`p-3.5 rounded-xl border text-left transition cursor-pointer active:scale-95 ${
                  selectedLevel === lvl.id
                    ? 'bg-red-950/80 border-red-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.5)]'
                    : 'bg-neutral-900/80 border-neutral-800 text-neutral-400 hover:border-red-900 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2 font-mono font-black text-sm text-red-400">
                  <Play className="w-3.5 h-3.5 fill-red-500" />
                  <span>{lvl.label}</span>
                </div>
                <div className="text-[11px] text-neutral-400 mt-1">{lvl.desc}</div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Main Exhibition Tabs */}
      <section className="max-w-6xl mx-auto px-4 mt-8">
        <div className="flex items-center justify-center gap-2 border-b border-neutral-800 pb-4 flex-wrap">
          {[
            { id: 'controls', label: '360° BESTURING', icon: Gamepad2 },
            { id: 'arsenal', label: 'WAPENARSENAAL', icon: Crosshair },
            { id: 'bestiary', label: 'MONSTERGIDS', icon: Skull },
            { id: 'story', label: 'LORE & GESCHIEDENIS', icon: BookOpen },
            { id: 'secrets', label: 'E1M1 TACTIEK & GEHEIMEN', icon: Key },
            { id: 'cheats', label: 'CHEAT CODES (IDDQD)', icon: Sparkles },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  haptics.light();
                  setActiveTab(tab.id as any);
                }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-mono text-xs font-black transition cursor-pointer ${
                  isActive
                    ? 'bg-red-600 text-white shadow-[0_0_15px_rgba(239,68,68,0.5)]'
                    : 'bg-neutral-900 text-neutral-400 hover:text-white hover:bg-neutral-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab 0: 360° Besturing & Besturing */}
        {activeTab === 'controls' && (
          <div className="mt-8 max-w-4xl mx-auto space-y-6">
            <div className="text-center space-y-2">
              <span className="px-3 py-1 rounded-full text-xs font-mono font-black bg-red-950 text-red-400 border border-red-800 uppercase tracking-widest">
                🧭 FULL 360° ROTATIE EN CAMERABESTURING
              </span>
              <h2 className="text-2xl sm:text-3xl font-mono font-black text-white">
                Hoe kun je 360° draaien in DOOM?
              </h2>
              <p className="text-xs sm:text-sm text-neutral-400 font-sans max-w-2xl mx-auto">
                In DOOM kun je op meerdere manieren soepel 360 graden om je as draaien om vijanden achter je op te sporen en de donkere gangen van Phobos te verkennen:
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono">
              {/* Methode 1: Pijltjestoetsen */}
              <div className="p-5 rounded-2xl bg-neutral-900/90 border border-red-500/40 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-950 border border-red-700 flex items-center justify-center text-xl text-red-400 font-bold">
                    ◀ ▶
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white">1. PIJLTJESTOETSEN LINKS &amp; RECHTS</h3>
                    <span className="text-[11px] text-red-400">Klassieke Arcade &amp; DOS Besturing</span>
                  </div>
                </div>
                <p className="text-xs text-neutral-300 font-sans leading-relaxed">
                  Druk op de <strong className="text-white">Pijl Links (◀)</strong> of <strong className="text-white">Pijl Rechts (▶)</strong> op je toetsenbord om direct 360 graden soepel linksom of rechtsom rond te draaien.
                </p>
                <div className="bg-black/50 p-2.5 rounded-lg border border-neutral-800 text-[11px] text-neutral-400">
                  Tip: Houd de toets ingedrukt om continu rond te blijven tollen en een volledige 360°-scan te maken.
                </div>
              </div>

              {/* Methode 2: Q en E toetsen */}
              <div className="p-5 rounded-2xl bg-neutral-900/90 border border-red-500/40 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-neutral-800 border border-neutral-700 flex items-center justify-center text-base text-yellow-400 font-bold">
                    Q / E
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white">2. TOETSEN Q EN E</h3>
                    <span className="text-[11px] text-yellow-400">WASD Snelle Rotatie</span>
                  </div>
                </div>
                <p className="text-xs text-neutral-300 font-sans leading-relaxed">
                  Als je met de linkerhand op <strong className="text-white">W A S D</strong> speelt, gebruik je <strong className="text-white">Q</strong> om naar links te draaien en <strong className="text-white">E</strong> om naar rechts te draaien.
                </p>
                <div className="bg-black/50 p-2.5 rounded-lg border border-neutral-800 text-[11px] text-neutral-400">
                  W = Vooruit • S = Achteruit • A / D = Strafe (zijwaarts) • Q / E = 360° Draaien.
                </div>
              </div>

              {/* Methode 3: Muis Slepen / Touch Swipe */}
              <div className="p-5 rounded-2xl bg-neutral-900/90 border border-red-500/40 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-neutral-800 border border-neutral-700 flex items-center justify-center text-xl">
                    🖱️
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white">3. SLEEP OVER HET 3D SCHERM</h3>
                    <span className="text-[11px] text-cyan-400">Muis &amp; Touchscreen Swipe</span>
                  </div>
                </div>
                <p className="text-xs text-neutral-300 font-sans leading-relaxed">
                  Klik en sleep met je muis horizontaal over het speelscherm, of veeg met je vinger op een tablet of smartphone. Je camera draait direct vloeiend 360 graden mee in de richting waarin je sleept!
                </p>
                <div className="bg-black/50 p-2.5 rounded-lg border border-neutral-800 text-[11px] text-neutral-400">
                  Een snelle klik vuurt je wapen af, terwijl slepen je camera roteert.
                </div>
              </div>

              {/* Methode 4: Muis Richting (Pointer Lock) */}
              <div className="p-5 rounded-2xl bg-neutral-900/90 border border-red-500/40 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-950 border border-red-700 flex items-center justify-center text-xl text-red-400">
                    🎯
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white">4. KNOP &quot;MUIS RICHTING&quot; (FPS LOOK)</h3>
                    <span className="text-[11px] text-emerald-400">Moderne First-Person Shooter Stijl</span>
                  </div>
                </div>
                <p className="text-xs text-neutral-300 font-sans leading-relaxed">
                  Bovenin de speelkast vind je de knop <strong className="text-white">&quot;Muis Richting&quot;</strong>. Hiermee wordt je cursor vergrendeld in het scherm, zodat je net als in moderne shooters 360° rondkijkt door simpelweg je muis te bewegen!
                </p>
                <div className="bg-black/50 p-2.5 rounded-lg border border-neutral-800 text-[11px] text-neutral-400">
                  Druk op <strong className="text-white">ESC</strong> om je muis weer vrij te geven.
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-red-950/40 border border-red-800/60 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs font-mono text-neutral-300 text-center sm:text-left">
                Klaar om de demonen van de hel tegemoet te treden?
              </div>
              <button
                onClick={() => onPlay(selectedLevel)}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-red-600 via-amber-600 to-red-600 hover:brightness-125 text-white font-mono font-black text-xs tracking-wider shadow-[0_0_20px_rgba(239,68,68,0.6)] flex items-center gap-2 cursor-pointer active:scale-95 transition-transform"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>START DOOM &amp; PROBEER HET UIT</span>
              </button>
            </div>
          </div>
        )}

        {/* Tab 1: Wapenarsenaal */}
        {activeTab === 'arsenal' && (
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Weapon Selector List */}
            <div className="space-y-2">
              <h3 className="text-xs font-mono font-bold text-neutral-400 tracking-widest uppercase mb-2">
                KIES EEN WAPEN:
              </h3>
              {WEAPONS.map((w) => {
                const isSel = selectedWeapon === w.id;
                return (
                  <button
                    key={w.id}
                    onClick={() => {
                      haptics.light();
                      setSelectedWeapon(w.id);
                      w.sound();
                    }}
                    className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition cursor-pointer ${
                      isSel
                        ? 'bg-red-950/80 border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.4)]'
                        : 'bg-neutral-900/60 border-neutral-800 hover:border-neutral-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{w.icon}</span>
                      <div>
                        <div className="font-mono font-bold text-sm text-white">{w.name}</div>
                        <div className="text-[11px] font-mono text-red-400">{w.slot}</div>
                      </div>
                    </div>
                    <Volume2 className="w-4 h-4 text-neutral-500 hover:text-red-400" />
                  </button>
                );
              })}
            </div>

            {/* Weapon Details Card */}
            {(() => {
              const curW = WEAPONS.find((w) => w.id === selectedWeapon) || WEAPONS[2];
              return (
                <div className="lg:col-span-2 p-6 rounded-2xl bg-neutral-900/90 border border-red-500/40 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
                      <div>
                        <span className="text-xs font-mono px-2 py-0.5 rounded bg-red-950 border border-red-700 text-red-300 font-bold">
                          {curW.slot}
                        </span>
                        <h2 className="text-2xl font-black text-white mt-1 font-mono tracking-wide">{curW.name}</h2>
                      </div>
                      <button
                        onClick={() => curW.sound()}
                        className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-mono font-bold text-xs flex items-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(239,68,68,0.5)] active:scale-95"
                      >
                        <Volume2 className="w-4 h-4" />
                        <span>TEST GELUID</span>
                      </button>
                    </div>

                    <p className="mt-4 text-sm text-neutral-300 leading-relaxed font-sans">{curW.desc}</p>
                    <div className="mt-3 text-xs italic text-amber-300/90 font-mono bg-black/40 p-3 rounded-lg border border-amber-500/20">
                      {curW.quote}
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-6">
                      <div className="p-3 rounded-xl bg-neutral-950/80 border border-neutral-800 font-mono">
                        <div className="text-[10px] text-neutral-500 uppercase font-bold">Munitie Type</div>
                        <div className="text-sm font-bold text-amber-400 mt-0.5">{curW.ammo}</div>
                      </div>
                      <div className="p-3 rounded-xl bg-neutral-950/80 border border-neutral-800 font-mono">
                        <div className="text-[10px] text-neutral-500 uppercase font-bold">Schade (DPS)</div>
                        <div className="text-sm font-bold text-red-400 mt-0.5">{curW.damage}</div>
                      </div>
                      <div className="p-3 rounded-xl bg-neutral-950/80 border border-neutral-800 font-mono">
                        <div className="text-[10px] text-neutral-500 uppercase font-bold">Vuursnelheid</div>
                        <div className="text-sm font-bold text-neutral-200 mt-0.5">{curW.rate}</div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-neutral-800 flex items-center justify-between">
                    <span className="text-xs text-neutral-500 font-mono">Druk op toets 1-7 in het spel om te wisselen</span>
                    <button
                      onClick={() => onPlay(selectedLevel)}
                      className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-mono font-bold text-xs flex items-center gap-2 cursor-pointer active:scale-95"
                    >
                      <Play className="w-4 h-4 fill-white" />
                      <span>VUUR DIT WAPEN AF IN E1M1</span>
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* Tab 2: Bestiary */}
        {activeTab === 'bestiary' && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            {BESTIARY.map((m) => (
              <div
                key={m.id}
                className="p-5 rounded-2xl bg-neutral-900/80 border border-red-900/50 hover:border-red-500/70 transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                    <h3 className="font-mono font-black text-lg text-red-400">{m.name}</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono px-2 py-0.5 rounded bg-neutral-800 text-amber-400 font-bold">
                        HP: {m.hp}
                      </span>
                      <button
                        onClick={() => m.sound()}
                        className="p-1.5 rounded-lg bg-red-950 border border-red-700 text-red-300 hover:bg-red-900 cursor-pointer"
                        title="Hoor kreet"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <p className="mt-3 text-xs sm:text-sm text-neutral-300 leading-relaxed">{m.lore}</p>
                  <div className="mt-2 text-xs font-mono text-neutral-400">
                    Dreiging: <span className="text-red-400 font-bold">{m.threat}</span>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-neutral-800/80 text-[11px] italic font-mono text-neutral-500">
                  {m.quote}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 3: Lore & History */}
        {activeTab === 'story' && (
          <div className="mt-8 space-y-6 text-neutral-300 leading-relaxed font-sans max-w-4xl mx-auto">
            <div className="p-6 rounded-2xl bg-neutral-900/90 border border-red-900/50">
              <h3 className="text-xl font-mono font-black text-red-400 mb-2">HET VERHAAL: DE PHOBOS ANOMALIE</h3>
              <p className="text-sm sm:text-base mb-3">
                Je bent een geharde Space Marine die is gedegradeerd naar de stoffige onderzoeksbasis van de{' '}
                <strong className="text-white">Union Aerospace Corporation (UAC)</strong> op Phobos, een van de manen
                van Mars, nadat je weigerde het vuur te openen op ongewapende burgers.
              </p>
              <p className="text-sm sm:text-base">
                De geheime teleportatie-experimenten van de UAC zijn catastrofaal mislukt: de poorten braken rechtstreeks
                door naar de dimensie van de Hel. Al je kameraden zijn vermoord of veranderd in bloeddorstige zombies.
                Jij bent de enige overlevende met een handvol kogels en een onbreekbare wil om te overleven.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-neutral-900/90 border border-neutral-800">
              <h3 className="text-xl font-mono font-black text-amber-400 mb-2">DE TECHNOLOGISCHE REVOLUTIE (1993)</h3>
              <p className="text-sm sm:text-base mb-3">
                Toen DOOM op 10 december 1993 werd geüpload naar universiteitsnetwerken en BBS-servers, legde het
                computernetwerken over de hele wereld plat. John Carmack bedacht de revolutionaire{' '}
                <strong className="text-white">Binary Space Partitioning (BSP)</strong> rendering waardoor vloeren en
                plafonds op verschillende hoogtes konden worden getoond, kamers van vorm konden variëren, en lichtbronnen
                dynamisch konden dimmen in de verte.
              </p>
              <p className="text-sm sm:text-base">
                John Romero bedacht de term <strong className="text-white">"Deathmatch"</strong> en bouwde multiplayer
                LAN-ondersteuning in. DOOM creëerde een nieuw genre dat jarenlang bekend zou staan als "Doom-clones"
                voordat de term First-Person Shooter definitief werd.
              </p>
            </div>
          </div>
        )}

        {/* Tab 4: Secrets */}
        {activeTab === 'secrets' && (
          <div className="mt-8 max-w-4xl mx-auto p-6 rounded-2xl bg-neutral-900/90 border border-neutral-800">
            <h3 className="text-xl font-mono font-black text-amber-400 mb-4 flex items-center gap-2">
              <Key className="w-5 h-5 text-amber-400" />
              <span>E1M1 HANGAR: VERBORGEN GEHEIMEN</span>
            </h3>

            <div className="space-y-4 text-sm text-neutral-300 font-mono">
              <div className="p-4 rounded-xl bg-black/60 border border-neutral-800">
                <div className="text-red-400 font-bold mb-1">1. HET GROENE COMBAT ARMOR IN HET ZUURBAD</div>
                <p className="text-xs text-neutral-400 font-sans leading-relaxed">
                  In de centrale hal met de zig-zag catwalk bevindt zich een verhoogd platform middenin de giftige groene
                  nukage. Als je snel over de rand sprint, bereik je het 100% Green Armor vest. Pas op dat je niet te lang
                  in het zuur blijft staan: het vreet 5% gezondheid per seconde weg!
                </p>
              </div>

              <div className="p-4 rounded-xl bg-black/60 border border-neutral-800">
                <div className="text-red-400 font-bold mb-1">2. DE BLAUWE SLEUTELKAART DOORGANG</div>
                <p className="text-xs text-neutral-400 font-sans leading-relaxed">
                  Aan het einde van de zig-zag catwalk vind je op een richel de Blue Keycard. Hiermee ontgrendel je de
                  beveiligde doorgang naar de lange stijgende gang vol Zombiemannen en Imps die leidt naar de eindkamer.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-black/60 border border-neutral-800">
                <div className="text-red-400 font-bold mb-1">3. DE VERBORGEN BINNENPLAATS (OUTSIDE COURTYARD)</div>
                <p className="text-xs text-neutral-400 font-sans leading-relaxed">
                  Vlak voor de exitkamer bevindt zich een geheime muurschakelaar die een hydraulische lift laat dalen naar
                  de buitengebieden onder de bloedrode hemel van Phobos.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: Cheats */}
        {activeTab === 'cheats' && (
          <div className="mt-8 max-w-3xl mx-auto p-6 rounded-2xl bg-neutral-900/90 border border-red-500/40">
            <h3 className="text-xl font-mono font-black text-red-500 mb-3 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <span>DE LEGENDAARISCHE MS-DOS CHEAT CODES</span>
            </h3>
            <p className="text-xs text-neutral-400 mb-6 font-mono">
              In de speelkast kun je deze codes direct typen op je toetsenbord, of de cheatknoppen in het scherm gebruiken!
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono">
              <div className="p-4 rounded-xl bg-black/60 border border-red-700/50">
                <div className="text-lg font-black text-amber-400">IDDQD</div>
                <div className="text-xs text-red-300 font-bold mt-1">GOD MODE (ONSTERFELIJKHEID)</div>
                <p className="text-[11px] text-neutral-400 mt-2">
                  Geeft Doomguy gouden god-ogen in de statusbalk en maakt je volledig immuun voor vijandelijke kogels,
                  vuurballen en beten.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-black/60 border border-red-700/50">
                <div className="text-lg font-black text-amber-400">IDKFA</div>
                <div className="text-xs text-red-300 font-bold mt-1">VERY HAPPY AMMO & KEYS</div>
                <p className="text-[11px] text-neutral-400 mt-2">
                  Ontgrendelt direct alle 7 wapens (inclusief Shotgun, Chaingun, Rocket Launcher, Plasma en BFG 9000),
                  maximale munitie en alle sleutelkaarten.
                </p>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Hall of Fame High Scores */}
      <section className="max-w-4xl mx-auto px-4 mt-12">
        <div className="p-6 rounded-2xl bg-neutral-900/80 border border-neutral-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-mono font-black text-base text-red-400 flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>TOP MARINES HIGHSCORES</span>
            </h3>
            <span className="text-xs font-mono text-neutral-500">PAR TIME: 0:30</span>
          </div>

          <div className="divide-y divide-neutral-800 font-mono text-xs">
            {highScores.slice(0, 5).map((score, idx) => (
              <div key={score.id || idx} className="py-2.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className={`w-5 font-bold ${idx === 0 ? 'text-amber-400' : 'text-neutral-500'}`}>
                    #{idx + 1}
                  </span>
                  <span className="font-bold text-white tracking-wider">{score.name}</span>
                  <span className="hidden sm:inline text-[11px] text-neutral-400">{score.level}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-[11px] text-red-400">KILLS: {score.killsPercent}%</span>
                  <span className="font-black text-amber-400">{score.score.toLocaleString()} PUNTEN</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
