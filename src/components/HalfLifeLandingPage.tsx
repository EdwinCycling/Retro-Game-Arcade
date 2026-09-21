import React, { useState } from 'react';
import {
  Crosshair,
  Shield,
  Zap,
  Volume2,
  VolumeX,
  Play,
  ArrowLeft,
  Trophy,
  Sparkles,
  BookOpen,
  Eye,
  Radio,
  Gamepad2,
  Tv,
  HelpCircle,
  Flame,
  Key
} from 'lucide-react';
import { halfLifeAudio } from '../game/halfLifeAudio';
import { getHalfLifeScores, HalfLifeHighScore } from '../game/halfLifeHighScores';

interface HalfLifeLandingPageProps {
  onPlay: () => void;
  onBackToLobby: () => void;
}

export const HalfLifeLandingPage: React.FC<HalfLifeLandingPageProps> = ({ onPlay, onBackToLobby }) => {
  const [activeTab, setActiveTab] = useState<'controls' | 'arsenal' | 'bestiary' | 'story' | 'facilities' | 'records'>('controls');
  const [selectedWeapon, setSelectedWeapon] = useState<number>(1);
  const [isMuted, setIsMuted] = useState(false);
  const highScores: HalfLifeHighScore[] = getHalfLifeScores();

  const toggleSound = () => {
    const next = !isMuted;
    setIsMuted(next);
    halfLifeAudio.setMuted(next);
    if (!next) {
      halfLifeAudio.startMusic();
    }
  };

  const WEAPONS = [
    {
      id: 1,
      name: 'DE ICONISCHE KOEVOET (CROWBAR)',
      slot: 'SLOT 1',
      ammo: 'GEEN (ONBEPERKT)',
      damage: '40 Melee Impact',
      rate: 'Snel (Opeenvolgend zwaaien)',
      desc: 'Hét ultieme symbool van Gordon Freeman en de PC gaming geschiedenis. Onmisbaar voor het stukslaan van houten bevoorradingskisten, ventilatieroosters en het verpulveren van opduikende Headcrabs met een oorverdovende metalen *CLANG*.',
      quote: '"The right man in the wrong place can make all the difference in the world."',
      sound: () => halfLifeAudio.playCrowbarMetalHit(),
      icon: '🔴'
    },
    {
      id: 2,
      name: 'GLOCK 17 (9MM HANDGUN)',
      slot: 'SLOT 2',
      ammo: '9mm Parabellum (17 kogels/magazijn)',
      damage: '22 per kogel',
      rate: 'Semi-automatisch / Dubbel tikken',
      desc: 'Standaard bewapening van het Black Mesa beveiligingspersoneel. Extreem betrouwbaar op middellange en lange afstand met haarscherpe precisie.',
      quote: 'Standaard uitrusting voor Sector C beveiligers zoals Barney Calhoun.',
      sound: () => halfLifeAudio.playGlockShot(),
      icon: '🔫'
    },
    {
      id: 3,
      name: 'SPAS-12 COMBAT SHOTGUN',
      slot: 'SLOT 3',
      ammo: '12-Gauge Hagelpatronen (8 shells)',
      damage: 'Single: 96 | Double: 192!',
      rate: 'Handmatige pompbeweging',
      desc: 'Een verwoestend wapen voor gevechten op korte afstand. Linkermuisknop vuurt één loop af; Rechtermuisknop ontketent een vernietigende dubbelloops blast die zelfs de zwaarste Xen-monsters in één klap uitschakelt.',
      quote: '"Boom. Pump-slide. Klaar voor het volgende monster."',
      sound: () => halfLifeAudio.playShotgunBlast(true),
      icon: '💥'
    },
    {
      id: 4,
      name: 'MP5 / TACTICAL SMG MET GRENADE LAUNCHER',
      slot: 'SLOT 4',
      ammo: '9mm Magazijn (50) + 40mm Granaat',
      damage: 'Automatisch: 18 | Granaat: 150 AOE',
      rate: '800 Schoten per minuut',
      desc: 'Militair aanvalsgeweer buitgemaakt op HECU mariniers. Vuur razendsnel kogelsalvo’s af met de linkermuisknop, of lanceer met de rechtermuisknop een 40mm contactgranaat met de karakteristieke holle *THUMP* klank.',
      quote: 'Verwoestende militaire vuurkracht tegen groepen Headcrabs en zombies.',
      sound: () => {
        halfLifeAudio.playGrenadeLaunch();
        setTimeout(() => halfLifeAudio.playExplosion(), 350);
      },
      icon: '⚡'
    }
  ];

  const BESTIARY = [
    {
      id: 'headcrab',
      name: 'HEADCRAB',
      type: 'Xen Parasiet',
      hp: '25 HP',
      threat: 'Gemiddeld / Verraderlijk',
      desc: 'Kleine, vierpotige buitenaardse wezens die vanuit hoeken en ventilatieroosters krijsend door de lucht springen om zich vast te bijten op het hoofd van hun slachtoffer.',
      tactics: 'Zwaai met de koevoet precies op het moment dat ze springen, of schakel ze op afstand uit met de Glock 17.',
      icon: '👾'
    },
    {
      id: 'zombie',
      name: 'HEADCRAB ZOMBIE',
      type: 'Geïnfecteerde Wetenschapper',
      hp: '70 HP',
      threat: 'Groot in nauwe gangen',
      desc: 'De tragische mutatie van een Black Mesa onderzoeker wiens zenuwstelsel is overgenomen door een Headcrab. Hun borstkas is opengescheurd in een gapende muil en hun handen zijn veranderd in lange, vlijmscherpe klauwen.',
      tactics: 'Blijf op veilige afstand en gebruik de Shotgun of MP5 om hun zware uithalen te vermijden.',
      icon: '🧟'
    },
    {
      id: 'vortigaunt',
      name: 'VORTIGAUNT (ALIEN SLAVE)',
      type: 'Xen Intelligente Humanoid',
      hp: '85 HP',
      threat: 'Extreem Gevaarlijk',
      desc: 'Mystieke aliens met drie armen en een centraal rood oog. Ze wekken enorme hoeveelheden bio-elektriciteit op die als groene bliksemstralen naar Gordon Freeman worden afgevuurd.',
      tactics: 'Zodra je de elektrische zoemtoon hoort opladen, zoek direct dekking achter kisten of muren!',
      icon: '👁️'
    }
  ];

  return (
    <div className="w-full max-w-7xl mx-auto min-h-[92vh] flex flex-col bg-neutral-950 text-neutral-100 rounded-2xl border border-orange-600/40 shadow-[0_0_80px_rgba(234,88,12,0.25)] overflow-hidden">
      {/* Top Bar / Breadcrumb */}
      <div className="bg-neutral-900/90 border-b border-orange-600/30 px-6 py-4 flex flex-wrap items-center justify-between gap-4 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToLobby}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-neutral-800/80 hover:bg-neutral-700 text-neutral-300 hover:text-white border border-neutral-700 transition-all font-mono text-sm"
          >
            <ArrowLeft className="w-4 h-4 text-orange-400" />
            Terug naar Speelhal
          </button>
          <div className="h-5 w-px bg-neutral-750 hidden sm:block" />
          <span className="text-xs font-mono tracking-widest text-orange-400 font-bold bg-orange-950/60 border border-orange-600/50 px-2.5 py-1 rounded">
            VALVE SOFTWARE • 1998
          </span>
          <span className="text-xs font-mono text-neutral-400 hidden md:inline">
            BLACK MESA RESEARCH FACILITY // SECTOR C
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleSound}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-all text-xs font-mono border border-neutral-700"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-green-400" />}
            {isMuted ? 'Muziek Gedempt' : 'Kelly Bailey Audio'}
          </button>

          <button
            onClick={onPlay}
            className="flex items-center gap-2 px-6 py-2 rounded-lg bg-gradient-to-r from-orange-600 via-amber-600 to-orange-500 hover:from-orange-500 hover:to-amber-500 text-white font-bold tracking-wider text-sm transition-all shadow-[0_0_25px_rgba(234,88,12,0.6)] font-mono animate-pulse"
          >
            <Play className="w-4 h-4 fill-white" />
            START GAME (1920x1280 FULL HD)
          </button>
        </div>
      </div>

      {/* Hero Banner with Lambda Logo */}
      <div className="relative bg-gradient-to-b from-neutral-900 via-neutral-950 to-neutral-950 border-b border-orange-600/30 p-8 sm:p-12 overflow-hidden">
        <div className="absolute right-8 top-1/2 -translate-y-1/2 text-[180px] sm:text-[260px] font-mono font-black text-orange-500/10 select-none pointer-events-none">
          λ
        </div>

        <div className="relative z-10 max-w-3xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-orange-600 flex items-center justify-center text-white text-3xl font-black shadow-[0_0_20px_rgba(234,88,12,0.8)] border border-amber-300/60">
              λ
            </div>
            <div>
              <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white font-mono">
                HALF-LIFE <span className="text-orange-500 text-2xl sm:text-4xl">(1998)</span>
              </h1>
              <p className="text-orange-400 text-sm font-mono tracking-wider">
                GOLDSRC ENGINE • FULL HD 1920x1280 • HARDWARE 3D WEBGL
              </p>
            </div>
          </div>

          <p className="text-neutral-300 text-base sm:text-lg leading-relaxed mb-6 font-sans">
            Stap in de schoenen van theoretisch natuurkundige <strong>Dr. Gordon Freeman</strong> in het geheime ondergrondse
            laboratoriumcomplex <strong>Black Mesa</strong>. Na een catastrofaal mislukt experiment met de Anti-Mass Spectrometer scheurt
            de dimensie open en spoelen vijandige aliens uit de grensdimensie Xen het complex binnen. Vecht voor je leven met je trouwe
            koevoet, Glock, Shotgun en het iconische <strong>HEV Mark IV beschermingspak</strong>.
          </p>

          <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-neutral-800/90 border border-neutral-700 text-neutral-300">
              <Tv className="w-4 h-4 text-amber-400" />
              1920x1280 Native PC Resolutie
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-neutral-800/90 border border-neutral-700 text-neutral-300">
              <Crosshair className="w-4 h-4 text-orange-400" />
              True Mouse Look (Pointer Lock)
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-neutral-800/90 border border-neutral-700 text-neutral-300">
              <Shield className="w-4 h-4 text-green-400" />
              HEV Suit Voice & Charger Units
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-neutral-800/90 border border-neutral-700 text-neutral-300">
              <Zap className="w-4 h-4 text-yellow-400" />
              60 FPS WebGL 3D Fysica
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-orange-600/30 bg-neutral-900/60 overflow-x-auto">
        <button
          onClick={() => setActiveTab('controls')}
          className={`flex items-center gap-2 px-6 py-3.5 text-sm font-mono font-bold tracking-wider transition-all whitespace-nowrap border-b-2 ${
            activeTab === 'controls'
              ? 'border-orange-500 text-orange-400 bg-orange-950/30'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Gamepad2 className="w-4 h-4" />
          BESTURING & PC GIDS
        </button>

        <button
          onClick={() => setActiveTab('arsenal')}
          className={`flex items-center gap-2 px-6 py-3.5 text-sm font-mono font-bold tracking-wider transition-all whitespace-nowrap border-b-2 ${
            activeTab === 'arsenal'
              ? 'border-orange-500 text-orange-400 bg-orange-950/30'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Crosshair className="w-4 h-4" />
          ARSENAAL (WAPENS)
        </button>

        <button
          onClick={() => setActiveTab('bestiary')}
          className={`flex items-center gap-2 px-6 py-3.5 text-sm font-mono font-bold tracking-wider transition-all whitespace-nowrap border-b-2 ${
            activeTab === 'bestiary'
              ? 'border-orange-500 text-orange-400 bg-orange-950/30'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Eye className="w-4 h-4" />
          BLACK MESA BESTIARIUM
        </button>

        <button
          onClick={() => setActiveTab('facilities')}
          className={`flex items-center gap-2 px-6 py-3.5 text-sm font-mono font-bold tracking-wider transition-all whitespace-nowrap border-b-2 ${
            activeTab === 'facilities'
              ? 'border-orange-500 text-orange-400 bg-orange-950/30'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Shield className="w-4 h-4" />
          FACILITEITEN & INTERACTIE
        </button>

        <button
          onClick={() => setActiveTab('story')}
          className={`flex items-center gap-2 px-6 py-3.5 text-sm font-mono font-bold tracking-wider transition-all whitespace-nowrap border-b-2 ${
            activeTab === 'story'
              ? 'border-orange-500 text-orange-400 bg-orange-950/30'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          HET DOSSIER & LORE
        </button>

        <button
          onClick={() => setActiveTab('records')}
          className={`flex items-center gap-2 px-6 py-3.5 text-sm font-mono font-bold tracking-wider transition-all whitespace-nowrap border-b-2 ${
            activeTab === 'records'
              ? 'border-orange-500 text-orange-400 bg-orange-950/30'
              : 'border-transparent text-neutral-400 hover:text-neutral-200'
          }`}
        >
          <Trophy className="w-4 h-4" />
          TOPRECORDS
        </button>
      </div>

      {/* Tab Contents */}
      <div className="p-6 sm:p-8 flex-1 overflow-y-auto">
        {/* 1. CONTROLS */}
        {activeTab === 'controls' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <h2 className="text-xl font-bold font-mono text-orange-400 flex items-center gap-2">
                <Gamepad2 className="w-5 h-5 text-orange-500" />
                PC Toetsenbord & Muisbesturing
              </h2>

              <div className="bg-neutral-900/80 rounded-xl p-5 border border-neutral-800 space-y-4">
                <div className="flex items-center justify-between text-sm py-2 border-b border-neutral-800">
                  <span className="text-neutral-400">Rondkijken & Richten</span>
                  <span className="font-mono text-orange-400 font-bold bg-neutral-800 px-2.5 py-1 rounded">Muis (Pointer Lock)</span>
                </div>
                <div className="flex items-center justify-between text-sm py-2 border-b border-neutral-800">
                  <span className="text-neutral-400">Lopen & Strafen</span>
                  <span className="font-mono text-orange-400 font-bold bg-neutral-800 px-2.5 py-1 rounded">W / A / S / D</span>
                </div>
                <div className="flex items-center justify-between text-sm py-2 border-b border-neutral-800">
                  <span className="text-neutral-400">Primair Vuren / Koevoet Slaan</span>
                  <span className="font-mono text-orange-400 font-bold bg-neutral-800 px-2.5 py-1 rounded">Linkermuisknop</span>
                </div>
                <div className="flex items-center justify-between text-sm py-2 border-b border-neutral-800">
                  <span className="text-neutral-400">Secundair Vuren (Shotgun Blast / Granaat)</span>
                  <span className="font-mono text-orange-400 font-bold bg-neutral-800 px-2.5 py-1 rounded">Rechtermuisknop</span>
                </div>
                <div className="flex items-center justify-between text-sm py-2 border-b border-neutral-800">
                  <span className="text-neutral-400">Springen</span>
                  <span className="font-mono text-orange-400 font-bold bg-neutral-800 px-2.5 py-1 rounded">Spatiebalk (Space)</span>
                </div>
                <div className="flex items-center justify-between text-sm py-2 border-b border-neutral-800">
                  <span className="text-neutral-400">HEV Sprint</span>
                  <span className="font-mono text-orange-400 font-bold bg-neutral-800 px-2.5 py-1 rounded">Linker Shift</span>
                </div>
                <div className="flex items-center justify-between text-sm py-2 border-b border-neutral-800">
                  <span className="text-neutral-400">Bukken (Crouch)</span>
                  <span className="font-mono text-orange-400 font-bold bg-neutral-800 px-2.5 py-1 rounded">Linker Ctrl</span>
                </div>
                <div className="flex items-center justify-between text-sm py-2 border-b border-neutral-800">
                  <span className="text-neutral-400">Actie / Opladen / Deuren</span>
                  <span className="font-mono text-orange-400 font-bold bg-neutral-800 px-2.5 py-1 rounded">E Toets</span>
                </div>
                <div className="flex items-center justify-between text-sm py-2 border-b border-neutral-800">
                  <span className="text-neutral-400">Wapen Wisselen</span>
                  <span className="font-mono text-orange-400 font-bold bg-neutral-800 px-2.5 py-1 rounded">Cijfertoetsen 1 - 4</span>
                </div>
                <div className="flex items-center justify-between text-sm py-2">
                  <span className="text-neutral-400">Zaklamp Toggle</span>
                  <span className="font-mono text-orange-400 font-bold bg-neutral-800 px-2.5 py-1 rounded">F Toets</span>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h2 className="text-xl font-bold font-mono text-orange-400 flex items-center gap-2">
                <Tv className="w-5 h-5 text-orange-500" />
                1920x1280 High-Res PC Specificaties
              </h2>

              <div className="bg-neutral-900/80 rounded-xl p-6 border border-neutral-800 space-y-4">
                <p className="text-neutral-300 text-sm leading-relaxed">
                  Deze versie van Half-Life is geoptimaliseerd voor <strong>echte PC-resoluties (1920x1280)</strong> met
                  hardwarematige WebGL acceleratie. In tegenstelling tot de 320x200 software-modus uit 1998 geniet je nu van:
                </p>

                <ul className="space-y-3 text-sm text-neutral-300">
                  <li className="flex items-start gap-2.5">
                    <span className="text-orange-400 font-bold mt-0.5">✔</span>
                    <span><strong>Pointer Lock API:</strong> Klik éénmaal op het scherm om de muis vast te zetten voor 100% vloeiende 360° first-person navigatie.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-orange-400 font-bold mt-0.5">✔</span>
                    <span><strong>Dynamische SpotLighting:</strong> Werkende HEV zaklamp die realtime schaduwen en reflecties werpt op gangen en monsters.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-orange-400 font-bold mt-0.5">✔</span>
                    <span><strong>Interactieve Decals & Kratten:</strong> Houten kisten vallen fysiek in splinters uiteen met authentieke sound feedback.</span>
                  </li>
                </ul>

                <div className="pt-4 border-t border-neutral-800">
                  <button
                    onClick={onPlay}
                    className="w-full py-3 rounded-lg bg-orange-600 hover:bg-orange-500 text-white font-mono font-bold tracking-wider text-sm transition-all shadow-[0_0_20px_rgba(234,88,12,0.5)] flex items-center justify-center gap-2"
                  >
                    <Play className="w-4 h-4 fill-white" />
                    START ONMIDDELLIJK DE GAME
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. ARSENAL */}
        {activeTab === 'arsenal' && (
          <div className="space-y-8">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {WEAPONS.map((w) => (
                <button
                  key={w.id}
                  onClick={() => setSelectedWeapon(w.id)}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    selectedWeapon === w.id
                      ? 'bg-orange-950/50 border-orange-500 shadow-[0_0_15px_rgba(234,88,12,0.4)]'
                      : 'bg-neutral-900/60 border-neutral-800 hover:border-neutral-700'
                  }`}
                >
                  <div className="text-2xl mb-2">{w.icon}</div>
                  <div className="text-xs font-mono text-orange-400 font-bold">{w.slot}</div>
                  <div className="text-sm font-bold text-white truncate">{w.name}</div>
                </button>
              ))}
            </div>

            {(() => {
              const weapon = WEAPONS.find((w) => w.id === selectedWeapon)!;
              return (
                <div className="bg-neutral-900/80 rounded-2xl p-6 sm:p-8 border border-neutral-800">
                  <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                    <div>
                      <span className="text-xs font-mono px-2.5 py-1 rounded bg-orange-950 text-orange-400 border border-orange-600/50">
                        {weapon.slot}
                      </span>
                      <h3 className="text-2xl font-black font-mono text-white mt-2 flex items-center gap-3">
                        <span>{weapon.icon}</span> {weapon.name}
                      </h3>
                      <p className="text-orange-300 text-sm font-mono mt-1">{weapon.quote}</p>
                    </div>

                    <button
                      onClick={weapon.sound}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-orange-400 border border-orange-500/40 text-xs font-mono font-bold transition-all"
                    >
                      <Volume2 className="w-4 h-4" />
                      TEST GELUID
                    </button>
                  </div>

                  <p className="text-neutral-300 text-base leading-relaxed mb-6 font-sans">
                    {weapon.desc}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
                    <div className="p-3.5 rounded-lg bg-neutral-950 border border-neutral-800">
                      <div className="text-neutral-400">MUNITIETYPE</div>
                      <div className="text-white font-bold text-sm mt-1">{weapon.ammo}</div>
                    </div>
                    <div className="p-3.5 rounded-lg bg-neutral-950 border border-neutral-800">
                      <div className="text-neutral-400">SCHADE (DAMAGE)</div>
                      <div className="text-amber-400 font-bold text-sm mt-1">{weapon.damage}</div>
                    </div>
                    <div className="p-3.5 rounded-lg bg-neutral-950 border border-neutral-800">
                      <div className="text-neutral-400">VUURSNELHEID</div>
                      <div className="text-green-400 font-bold text-sm mt-1">{weapon.rate}</div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* 3. BESTIARY */}
        {activeTab === 'bestiary' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {BESTIARY.map((m) => (
              <div key={m.id} className="bg-neutral-900/80 rounded-xl p-6 border border-neutral-800 flex flex-col justify-between">
                <div>
                  <div className="text-3xl mb-3">{m.icon}</div>
                  <h3 className="text-lg font-black font-mono text-white">{m.name}</h3>
                  <div className="text-xs font-mono text-orange-400 mt-0.5">{m.type}</div>

                  <div className="my-4 space-y-1 text-xs font-mono bg-neutral-950 p-3 rounded-lg border border-neutral-850">
                    <div className="flex justify-between">
                      <span className="text-neutral-400">Gezondheid:</span>
                      <span className="text-white font-bold">{m.hp}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-400">Dreiging:</span>
                      <span className="text-red-400 font-bold">{m.threat}</span>
                    </div>
                  </div>

                  <p className="text-neutral-300 text-xs leading-relaxed mb-4">
                    {m.desc}
                  </p>
                </div>

                <div className="pt-3 border-t border-neutral-800 text-xs text-amber-300">
                  <strong>Tactiek:</strong> {m.tactics}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 4. FACILITIES */}
        {activeTab === 'facilities' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-neutral-900/80 rounded-xl p-6 border border-neutral-800 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-950 border border-green-600/50 flex items-center justify-center text-green-400">
                  <Shield className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold font-mono text-white">First Aid Health Station</h3>
                  <div className="text-xs font-mono text-green-400">Muurdispenser voor Genezing</div>
                </div>
              </div>
              <p className="text-neutral-300 text-sm leading-relaxed">
                Aan de muren van Sector C vind je de kenmerkende witte kasten met het groene kruis.
                Loop er naartoe en <strong>druk op E</strong> om Gordon Freeman direct te genezen.
                Geeft tot wel 100% gezondheid met het originele zoemende dispenser-geluid.
              </p>
            </div>

            <div className="bg-neutral-900/80 rounded-xl p-6 border border-neutral-800 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-orange-950 border border-orange-600/50 flex items-center justify-center text-orange-400">
                  <Zap className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold font-mono text-white">HEV Suit Charger Unit</h3>
                  <div className="text-xs font-mono text-orange-400">Muurdispenser voor Pantserkracht</div>
                </div>
              </div>
              <p className="text-neutral-300 text-sm leading-relaxed">
                Het HEV Mark IV pak absorbeert tot wel 75% van inkomende schade, mits de batterij is opgeladen.
                Gebruik deze oranje wandstations via de <strong>E-toets</strong> om de pak-energie tot 100% te herstellen.
                De computerstem van het pak bevestigt direct het laadniveau.
              </p>
            </div>
          </div>
        )}

        {/* 5. STORY & LORE */}
        {activeTab === 'story' && (
          <div className="bg-neutral-900/80 rounded-2xl p-6 sm:p-8 border border-neutral-800 space-y-6 max-w-4xl">
            <h2 className="text-2xl font-black font-mono text-orange-400">
              HET RESONANCE CASCADE INCIDENT • MEI 200X
            </h2>
            <p className="text-neutral-300 text-sm sm:text-base leading-relaxed font-sans">
              Diep verscholen onder de woestijn van New Mexico ligt de <strong>Black Mesa Research Facility</strong>,
              een voormalige lanceerbasis uit de Koude Oorlog die is omgebouwd tot het meest geavanceerde
              wetenschappelijke onderzoekscentrum ter wereld.
            </p>
            <p className="text-neutral-300 text-sm sm:text-base leading-relaxed font-sans">
              Dr. Gordon Freeman arriveert per monorail in Sector C: Anomalous Materials voor een test met een
              buitenaards mineraal van onbekende herkomst in de Anti-Mass Spectrometer. Wanneer de spectrometer op
              105% vermogen wordt gedreven, treedt een onomkeerbare catastrofe op: een <em>Resonance Cascade</em>.
              De barrière tussen aarde en de buitenaardse grensdimensie Xen explodeert, met verwoestende gevolgen...
            </p>
          </div>
        )}

        {/* 6. RECORDS */}
        {activeTab === 'records' && (
          <div className="bg-neutral-900/80 rounded-2xl p-6 sm:p-8 border border-neutral-800 max-w-3xl">
            <h2 className="text-xl font-bold font-mono text-orange-400 mb-4 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-400" />
              Black Mesa Sector C • Toprecords
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-sm">
                <thead>
                  <tr className="border-b border-neutral-800 text-neutral-400 text-xs">
                    <th className="py-2.5">POS</th>
                    <th className="py-2.5">AGENT / SCIENTIST</th>
                    <th className="py-2.5">SCORE</th>
                    <th className="py-2.5">KILLS</th>
                    <th className="py-2.5">TIJD</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-850">
                  {highScores.map((s, idx) => (
                    <tr key={s.id} className="hover:bg-neutral-800/40 transition-colors">
                      <td className="py-3 font-bold text-orange-400">#{idx + 1}</td>
                      <td className="py-3 font-bold text-white">{s.name}</td>
                      <td className="py-3 text-amber-300 font-bold">{s.score.toLocaleString()}</td>
                      <td className="py-3 text-red-400">{s.kills}</td>
                      <td className="py-3 text-neutral-400">{s.timeSeconds}s</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Action Footer */}
      <div className="bg-neutral-900/90 border-t border-orange-600/30 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
        <div className="text-xs font-mono text-neutral-400 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-ping" />
          BLACK MESA SEC-C SYSTEM STATUS: COMPROMISED • HEV PACK READY
        </div>

        <button
          onClick={onPlay}
          className="px-8 py-3 rounded-xl bg-gradient-to-r from-orange-600 via-amber-600 to-orange-500 hover:from-orange-500 hover:to-amber-500 text-white font-mono font-bold tracking-wider text-sm transition-all shadow-[0_0_30px_rgba(234,88,12,0.7)] flex items-center gap-2"
        >
          <Play className="w-5 h-5 fill-white" />
          START HALF-LIFE (1920x1280)
        </button>
      </div>
    </div>
  );
};
