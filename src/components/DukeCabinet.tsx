import React, { useEffect, useRef, useState, useCallback } from 'react';
import { 
  Volume2, 
  VolumeX, 
  RotateCcw, 
  HelpCircle, 
  Gamepad2, 
  Sparkles, 
  Shield, 
  Zap, 
  Crosshair, 
  Tv, 
  Flame, 
  Key, 
  Radio, 
  Footprints,
  Bomb,
  ChevronLeft,
  ChevronUp,
  ChevronDown,
  ChevronRight,
  DoorClosed,
  Play,
  RotateCw,
  RotateCcw as RotateCounterClockwise
} from 'lucide-react';
import { DukeEngine, DukeStats, DukeWeapon } from '../game/dukeEngine';
import { dukeAudio } from '../game/dukeAudio';

interface DukeCabinetProps {
  onBackToLobby: () => void;
}

export const DukeCabinet: React.FC<DukeCabinetProps> = ({ onBackToLobby }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<DukeEngine | null>(null);

  const [stats, setStats] = useState<DukeStats | null>(null);
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(false);
  const [showHelpModal, setShowHelpModal] = useState<boolean>(false);
  const [selectedEpisode, setSelectedEpisode] = useState<'e1l1' | 'e1l2' | 'e1l3' | 'blood_e1m1'>('e1l1');
  const [audioUnlocked, setAudioUnlocked] = useState<boolean>(false);

  // Drag-to-Look Pointer tracking
  const isDraggingRef = useRef(false);
  const lastPointerXRef = useRef(0);

  const unlockAudio = useCallback(() => {
    if (!audioUnlocked) {
      dukeAudio.startMusic();
      setAudioUnlocked(true);
    }
  }, [audioUnlocked]);

  // Initialize Engine
  useEffect(() => {
    if (!containerRef.current) return;

    const engine = new DukeEngine(containerRef.current, selectedEpisode, (newStats) => {
      setStats({ ...newStats });
    });
    engineRef.current = engine;

    dukeAudio.startMusic();

    const handleKeyDown = (e: KeyboardEvent) => {
      unlockAudio();
      if (!engineRef.current) return;

      const code = e.code;
      if (code === 'KeyW' || code === 'ArrowUp') engineRef.current.moveForward = true;
      if (code === 'KeyS' || code === 'ArrowDown') engineRef.current.moveBackward = true;
      if (code === 'KeyA') engineRef.current.strafeLeft = true;
      if (code === 'KeyD') engineRef.current.strafeRight = true;
      if (code === 'ArrowLeft') engineRef.current.turnLeft = true;
      if (code === 'ArrowRight') engineRef.current.turnRight = true;

      // Interaction (Space or E)
      if (code === 'Space' || code === 'KeyE') {
        engineRef.current.interact();
      }

      // Mighty Foot Kick (C)
      if (code === 'KeyC') {
        engineRef.current.kick();
      }

      // Detonate Pipebombs (KeyX or Enter)
      if (code === 'KeyX' || code === 'Enter') {
        engineRef.current.detonatePipebombs();
      }

      // Fire weapon (Ctrl or Left Click)
      if (code === 'ControlLeft' || code === 'ControlRight') {
        engineRef.current.fireWeapon();
      }

      // Weapon Slots (1-6)
      if (code === 'Digit1') engineRef.current.currentWeapon = 'foot';
      if (code === 'Digit2') engineRef.current.currentWeapon = 'pistol';
      if (code === 'Digit3') engineRef.current.currentWeapon = 'shotgun';
      if (code === 'Digit4') engineRef.current.currentWeapon = 'chaingun';
      if (code === 'Digit5') engineRef.current.currentWeapon = 'rpg';
      if (code === 'Digit6') engineRef.current.currentWeapon = 'pipebomb';

      // Cheats
      if (code === 'KeyG') engineRef.current.toggleGodMode();
      if (code === 'KeyK') engineRef.current.cheatAllWeapons();
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (!engineRef.current) return;
      const code = e.code;
      if (code === 'KeyW' || code === 'ArrowUp') engineRef.current.moveForward = false;
      if (code === 'KeyS' || code === 'ArrowDown') engineRef.current.moveBackward = false;
      if (code === 'KeyA') engineRef.current.strafeLeft = false;
      if (code === 'KeyD') engineRef.current.strafeRight = false;
      if (code === 'ArrowLeft') engineRef.current.turnLeft = false;
      if (code === 'ArrowRight') engineRef.current.turnRight = false;
    };

    const handleMouseDown = (e: MouseEvent) => {
      unlockAudio();
      if (!engineRef.current) return;
      if (e.button === 0) {
        engineRef.current.fireWeapon();
      } else if (e.button === 2) {
        engineRef.current.currentWeapon = 'pipebomb';
        engineRef.current.fireWeapon();
      }
    };

    const handleContextMenu = (e: MouseEvent) => e.preventDefault();

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    const container = containerRef.current;
    container.addEventListener('mousedown', handleMouseDown);
    container.addEventListener('contextmenu', handleContextMenu);

    // Dynamic High-Res Viewport Resize Observer
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.width > 0 && entry.contentRect.height > 0) {
          engineRef.current?.resize(entry.contentRect.width, entry.contentRect.height);
        }
      }
    });
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      container.removeEventListener('mousedown', handleMouseDown);
      container.removeEventListener('contextmenu', handleContextMenu);
      engine.destroy();
    };
  }, [selectedEpisode, unlockAudio]);

  const handleLevelChange = (newLevel: 'e1l1' | 'e1l2' | 'e1l3' | 'blood_e1m1') => {
    setSelectedEpisode(newLevel);
    if (engineRef.current) {
      engineRef.current.loadLevel(newLevel);
    }
  };

  const handleRestart = () => {
    if (engineRef.current) {
      engineRef.current.restart();
    }
  };

  const handleNextLevel = () => {
    const order: ('e1l1' | 'e1l2' | 'e1l3' | 'blood_e1m1')[] = ['e1l1', 'e1l2', 'e1l3', 'blood_e1m1'];
    const curIdx = order.indexOf(selectedEpisode);
    const nextLevel = order[(curIdx + 1) % order.length];
    handleLevelChange(nextLevel);
  };

  const toggleMute = () => {
    unlockAudio();
    const nextMute = !isAudioMuted;
    setIsAudioMuted(nextMute);
    dukeAudio.setMuted(nextMute);
  };

  const handleWeaponSelect = (w: DukeWeapon) => {
    unlockAudio();
    if (engineRef.current) {
      engineRef.current.currentWeapon = w;
    }
  };

  // Touch / Pointer controls on 3D Viewport (Swipe to look around, tap to shoot)
  const handlePointerDown = (e: React.PointerEvent) => {
    unlockAudio();
    isDraggingRef.current = true;
    lastPointerXRef.current = e.clientX;
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current || !engineRef.current) return;
    const deltaX = e.clientX - lastPointerXRef.current;
    lastPointerXRef.current = e.clientX;
    // Rotate player camera angle smoothly
    engineRef.current.rotate(deltaX * 0.008);
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
  };

  const handleMobileFire = () => {
    unlockAudio();
    if (engineRef.current) {
      engineRef.current.fireWeapon();
    }
    if (navigator.vibrate) {
      navigator.vibrate(15);
    }
  };

  const handleMobileKick = () => {
    unlockAudio();
    if (engineRef.current) {
      engineRef.current.kick();
    }
    if (navigator.vibrate) {
      navigator.vibrate(25);
    }
  };

  const handleMobileInteract = () => {
    unlockAudio();
    if (engineRef.current) {
      engineRef.current.interact();
    }
  };

  const handleMobileDetonate = () => {
    unlockAudio();
    if (engineRef.current) {
      if (engineRef.current.currentWeapon !== 'pipebomb') {
        engineRef.current.currentWeapon = 'pipebomb';
        engineRef.current.fireWeapon();
      } else {
        engineRef.current.detonatePipebombs();
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-screen w-full bg-neutral-950 text-white select-none p-1.5 sm:p-4 font-sans pb-10">
      {/* Top Header & Navigation Bar */}
      <div className="w-full max-w-5xl flex flex-wrap items-center justify-between gap-2 mb-2 bg-neutral-900/90 border border-red-900/60 rounded-2xl p-2.5 sm:px-4 sm:py-2.5 shadow-2xl backdrop-blur-md">
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={onBackToLobby}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-red-950/80 hover:bg-red-800 text-red-300 hover:text-white border border-red-700/50 text-xs font-bold transition-all active:scale-95 cursor-pointer"
          >
            <ChevronLeft size={16} />
            <span className="hidden xs:inline">LOBBY</span>
          </button>
          <div>
            <h1 className="text-xs sm:text-base font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-amber-400 to-yellow-500 leading-tight">
              DUKE NUKEM 3D
            </h1>
            <p className="text-[9px] sm:text-[10px] text-neutral-400 font-mono hidden sm:block">
              Build Engine 3D • 60 FPS WebGL • Mobile &amp; iOS Ready
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Multi-Level Selector */}
          <select
            value={selectedEpisode}
            onChange={(e) => handleLevelChange(e.target.value as any)}
            className="px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-[11px] sm:text-xs font-mono text-amber-400 font-bold focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer max-w-[140px] sm:max-w-none"
          >
            <option value="e1l1">🎬 Hollywood (E1L1)</option>
            <option value="e1l2">💋 Red Light (E1L2)</option>
            <option value="e1l3">☣️ Toxic Dump (E1L3)</option>
            <option value="blood_e1m1">🩸 Blood (E1M1)</option>
          </select>

          {/* Audio toggle */}
          <button
            onClick={toggleMute}
            className="p-1.5 sm:p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-neutral-300 active:scale-95 cursor-pointer"
            title="Mute / Unmute"
          >
            {isAudioMuted ? <VolumeX size={16} /> : <Volume2 size={16} className="text-amber-400" />}
          </button>

          {/* Help button */}
          <button
            onClick={() => setShowHelpModal(true)}
            className="p-1.5 sm:p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-amber-400 active:scale-95 cursor-pointer"
            title="Speluitleg & Besturing"
          >
            <HelpCircle size={16} />
          </button>
        </div>
      </div>

      {/* Main 3D Viewport Cabinet Canvas */}
      <div className="relative w-full max-w-5xl aspect-[4/3] sm:aspect-[16/10] max-h-[60vh] sm:max-h-[580px] bg-black rounded-2xl overflow-hidden border-2 border-red-950 shadow-[0_0_40px_rgba(220,38,38,0.25)] flex flex-col touch-none select-none">
        {/* Three.js Container with Touch & Drag support */}
        <div 
          ref={containerRef} 
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className="relative w-full flex-1 cursor-crosshair touch-none" 
        />

        {/* Crosshair & Hit Overlay */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div className="w-4 h-4 border border-yellow-400/80 rounded-full flex items-center justify-center">
            <div className="w-1 h-1 bg-red-500 rounded-full" />
          </div>
        </div>

        {/* Drag to Look Hint overlay on top left of canvas */}
        <div className="absolute top-2 left-2 pointer-events-none px-2 py-0.5 rounded bg-black/60 border border-neutral-800 text-[10px] font-mono text-neutral-400 backdrop-blur-xs">
          📱 Sleep over beeld om rond te kijken
        </div>

        {/* High-Res First-Person Weapon Graphic Overlay */}
        <div className="absolute bottom-16 right-1/2 translate-x-1/2 pointer-events-none transition-transform duration-75">
          {stats?.currentWeapon === 'foot' && (
            <div className="text-center font-mono font-black text-amber-500 text-xl sm:text-2xl tracking-widest animate-bounce">
              👢 MIGHTY FOOT
            </div>
          )}
          {stats?.currentWeapon === 'pistol' && (
            <div className="w-40 sm:w-48 h-28 sm:h-32 bg-gradient-to-t from-neutral-900 to-transparent rounded-t-3xl border-t-2 border-neutral-700 flex flex-col items-center justify-center text-xs font-mono text-amber-400">
              <span className="text-2xl sm:text-3xl font-black">🔫 GLOCK 19</span>
              <span className="text-[9px] sm:text-[10px] text-neutral-400">LASER SIGHT ON</span>
            </div>
          )}
          {stats?.currentWeapon === 'shotgun' && (
            <div className="w-52 sm:w-64 h-32 sm:h-36 bg-gradient-to-t from-neutral-900 to-transparent rounded-t-3xl border-t-2 border-amber-800 flex flex-col items-center justify-center text-xs font-mono text-amber-400">
              <span className="text-2xl sm:text-3xl font-black">💥 PUMP SHOTGUN</span>
              <span className="text-[9px] sm:text-[10px] text-neutral-400">12 GAUGE BUCKSHOT</span>
            </div>
          )}
          {stats?.currentWeapon === 'chaingun' && (
            <div className="w-56 sm:w-72 h-32 sm:h-36 bg-gradient-to-t from-neutral-900 to-transparent rounded-t-3xl border-t-2 border-cyan-800 flex flex-col items-center justify-center text-xs font-mono text-cyan-400">
              <span className="text-2xl sm:text-3xl font-black">⚡ RIPPER CHAINGUN</span>
              <span className="text-[9px] sm:text-[10px] text-neutral-400">TRIPLE ROTARY BARRELS</span>
            </div>
          )}
          {stats?.currentWeapon === 'rpg' && (
            <div className="w-60 sm:w-80 h-36 sm:h-40 bg-gradient-to-t from-neutral-900 to-transparent rounded-t-3xl border-t-2 border-red-800 flex flex-col items-center justify-center text-xs font-mono text-red-400">
              <span className="text-2xl sm:text-3xl font-black">🚀 RPG LAUNCHER</span>
              <span className="text-[9px] sm:text-[10px] text-neutral-400">HIGH EXPLOSIVE ROCKETS</span>
            </div>
          )}
          {stats?.currentWeapon === 'pipebomb' && (
            <div className="w-52 sm:w-64 h-32 sm:h-36 bg-gradient-to-t from-neutral-900 to-transparent rounded-t-3xl border-t-2 border-yellow-800 flex flex-col items-center justify-center text-xs font-mono text-yellow-400">
              <span className="text-2xl sm:text-3xl font-black">💣 PIPEBOMB</span>
              <span className="text-[9px] sm:text-[10px] text-neutral-400">GOOI &amp; ONTSTEEK</span>
            </div>
          )}
        </div>

        {/* Authentic Duke 3D / Blood Style High-Res HUD Status Bar */}
        <div className="h-14 sm:h-16 bg-gradient-to-r from-neutral-950 via-neutral-900 to-neutral-950 border-t-2 border-amber-600/70 px-2 sm:px-4 py-1.5 flex items-center justify-between text-xs font-mono z-10">
          {/* Health & Armor */}
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="flex flex-col items-center px-2 sm:px-3 py-0.5 sm:py-1 bg-red-950/80 border border-red-600 rounded-lg">
              <span className="text-[8px] sm:text-[9px] text-red-400 font-bold">HEALTH</span>
              <span className="text-base sm:text-lg font-black text-red-500">{stats?.health ?? 100}%</span>
            </div>
            <div className="flex flex-col items-center px-2 sm:px-3 py-0.5 sm:py-1 bg-blue-950/80 border border-blue-600 rounded-lg">
              <span className="text-[8px] sm:text-[9px] text-blue-400 font-bold">ARMOR</span>
              <span className="text-base sm:text-lg font-black text-blue-400">{stats?.armor ?? 25}%</span>
            </div>
          </div>

          {/* Desktop Weapon Selector Bar */}
          <div className="hidden md:flex items-center gap-1.5 bg-neutral-950/90 border border-neutral-800 p-1 rounded-xl">
            {(['foot', 'pistol', 'shotgun', 'chaingun', 'rpg', 'pipebomb'] as DukeWeapon[]).map((w, i) => (
              <button
                key={w}
                onClick={() => handleWeaponSelect(w)}
                className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase transition-all cursor-pointer ${
                  stats?.currentWeapon === w
                    ? 'bg-amber-500 text-black shadow-lg scale-105'
                    : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'
                }`}
              >
                {i + 1}. {w}
              </button>
            ))}
          </div>

          {/* Ammo Counter & Keycards */}
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-1">
              <div className={`w-2.5 h-4 sm:w-3 sm:h-5 rounded-xs border ${stats?.keys.red ? 'bg-red-500 border-red-300 shadow-[0_0_8px_rgba(239,68,68,0.8)]' : 'bg-neutral-800 border-neutral-700'}`} title="Red Key" />
              <div className={`w-2.5 h-4 sm:w-3 sm:h-5 rounded-xs border ${stats?.keys.blue ? 'bg-blue-500 border-blue-300 shadow-[0_0_8px_rgba(59,130,246,0.8)]' : 'bg-neutral-800 border-neutral-700'}`} title="Blue Key" />
              <div className={`w-2.5 h-4 sm:w-3 sm:h-5 rounded-xs border ${stats?.keys.yellow ? 'bg-yellow-500 border-yellow-300 shadow-[0_0_8px_rgba(234,179,8,0.8)]' : 'bg-neutral-800 border-neutral-700'}`} title="Yellow Key" />
            </div>

            <div className="flex flex-col items-center px-2 sm:px-3 py-0.5 sm:py-1 bg-amber-950/80 border border-amber-600 rounded-lg">
              <span className="text-[8px] sm:text-[9px] text-amber-400 font-bold">AMMO</span>
              <span className="text-base sm:text-lg font-black text-amber-400">
                {stats?.currentWeapon === 'foot' ? '∞' : (stats?.ammo[stats.currentWeapon as keyof typeof stats.ammo] ?? 0)}
              </span>
            </div>
          </div>
        </div>

        {/* Level Complete / Victory Overlay */}
        {stats?.isLevelComplete && (
          <div className="absolute inset-0 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center p-4 text-center z-30 animate-fade-in">
            <h2 className="text-2xl sm:text-4xl font-black text-amber-400 mb-2">★ LEVEL COMPLETED ★</h2>
            <p className="text-base sm:text-lg text-red-500 font-bold mb-3 font-mono">"DAMN, I'M GOOD!"</p>
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 max-w-md w-full font-mono text-xs sm:text-sm space-y-1.5 mb-4">
              <div className="flex justify-between"><span>TIJD:</span><span className="text-amber-400">{stats.elapsedTime}s (PAR: {stats.parTime}s)</span></div>
              <div className="flex justify-between"><span>KILLS:</span><span className="text-red-400">{stats.kills} / {stats.totalMonsters}</span></div>
              <div className="flex justify-between"><span>ITEMS:</span><span className="text-blue-400">{stats.itemsFound} / {stats.totalItems}</span></div>
              <div className="flex justify-between"><span>SCORE:</span><span className="text-yellow-400 font-bold">{stats.score} PTS</span></div>
            </div>
            <button
              onClick={handleNextLevel}
              className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-black text-xs sm:text-sm rounded-xl shadow-xl transition-all cursor-pointer active:scale-95"
            >
              VOLGEND LEVEL SPELEN
            </button>
          </div>
        )}

        {/* Game Over Screen */}
        {stats?.isDead && (
          <div className="absolute inset-0 bg-red-950/90 backdrop-blur-md flex flex-col items-center justify-center p-4 text-center z-30 animate-fade-in">
            <h2 className="text-3xl sm:text-4xl font-black text-red-500 mb-2">YOU DIED</h2>
            <p className="text-xs sm:text-sm text-neutral-300 font-mono mb-4">De buitenaardse troepen hebben de stad overgenomen...</p>
            <button
              onClick={handleRestart}
              className="px-6 py-2.5 bg-red-600 hover:bg-red-500 text-white font-black text-xs sm:text-sm rounded-xl shadow-xl transition-all cursor-pointer active:scale-95"
            >
              HERSTARTEN (RESTART)
            </button>
          </div>
        )}
      </div>

      {/* MOBILE QUICK WEAPONS SELECTION BAR */}
      <div className="w-full max-w-5xl mt-2 flex items-center justify-between gap-1 overflow-x-auto pb-1">
        {(['foot', 'pistol', 'shotgun', 'chaingun', 'rpg', 'pipebomb'] as DukeWeapon[]).map((w) => {
          const names: Record<DukeWeapon, string> = {
            foot: '👢 Trap',
            pistol: '🔫 Glock',
            shotgun: '💥 Shotgun',
            chaingun: '⚡ Ripper',
            rpg: '🚀 RPG',
            pipebomb: '💣 Bom'
          };
          const isActive = stats?.currentWeapon === w;
          return (
            <button
              key={w}
              onClick={() => handleWeaponSelect(w)}
              className={`flex-1 min-w-[50px] py-1.5 px-1 rounded-lg text-[10px] font-mono font-bold uppercase transition-all text-center border cursor-pointer active:scale-95 ${
                isActive
                  ? 'bg-amber-500 text-black border-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.6)] font-black'
                  : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:bg-neutral-800'
              }`}
            >
              {names[w]}
            </button>
          );
        })}
      </div>

      {/* ON-SCREEN MOBILE VIRTUAL GAMEPAD (TOUCH CONTROLLER) */}
      <div className="w-full max-w-5xl mt-2 bg-neutral-900/80 border border-neutral-800 rounded-2xl p-3 flex items-center justify-between gap-2 shadow-xl backdrop-blur-md">
        {/* Left: Directional D-Pad */}
        <div className="flex flex-col items-center">
          <div className="text-[9px] font-mono text-neutral-400 mb-1 font-bold">BEWEGEN</div>
          <div className="grid grid-cols-3 gap-1.5 w-32 h-32 sm:w-36 sm:h-36">
            {/* Row 1: Empty, Forward, Empty */}
            <div />
            <button
              onPointerDown={() => { unlockAudio(); if (engineRef.current) engineRef.current.moveForward = true; }}
              onPointerUp={() => { if (engineRef.current) engineRef.current.moveForward = false; }}
              onPointerLeave={() => { if (engineRef.current) engineRef.current.moveForward = false; }}
              className="rounded-xl bg-neutral-800 active:bg-amber-500 active:text-black border border-neutral-700 flex items-center justify-center text-neutral-200 font-black shadow-md transition-colors select-none touch-none cursor-pointer"
            >
              <ChevronUp size={24} />
            </button>
            <div />

            {/* Row 2: Strafe Left, Back, Strafe Right */}
            <button
              onPointerDown={() => { unlockAudio(); if (engineRef.current) engineRef.current.strafeLeft = true; }}
              onPointerUp={() => { if (engineRef.current) engineRef.current.strafeLeft = false; }}
              onPointerLeave={() => { if (engineRef.current) engineRef.current.strafeLeft = false; }}
              className="rounded-xl bg-neutral-800 active:bg-amber-500 active:text-black border border-neutral-700 flex items-center justify-center text-neutral-200 font-black shadow-md transition-colors select-none touch-none cursor-pointer"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              onPointerDown={() => { unlockAudio(); if (engineRef.current) engineRef.current.moveBackward = true; }}
              onPointerUp={() => { if (engineRef.current) engineRef.current.moveBackward = false; }}
              onPointerLeave={() => { if (engineRef.current) engineRef.current.moveBackward = false; }}
              className="rounded-xl bg-neutral-800 active:bg-amber-500 active:text-black border border-neutral-700 flex items-center justify-center text-neutral-200 font-black shadow-md transition-colors select-none touch-none cursor-pointer"
            >
              <ChevronDown size={24} />
            </button>
            <button
              onPointerDown={() => { unlockAudio(); if (engineRef.current) engineRef.current.strafeRight = true; }}
              onPointerUp={() => { if (engineRef.current) engineRef.current.strafeRight = false; }}
              onPointerLeave={() => { if (engineRef.current) engineRef.current.strafeRight = false; }}
              className="rounded-xl bg-neutral-800 active:bg-amber-500 active:text-black border border-neutral-700 flex items-center justify-center text-neutral-200 font-black shadow-md transition-colors select-none touch-none cursor-pointer"
            >
              <ChevronRight size={24} />
            </button>
          </div>
        </div>

        {/* Center: Turn Left & Turn Right quick buttons */}
        <div className="flex flex-col items-center justify-center gap-1.5 px-1">
          <div className="text-[9px] font-mono text-neutral-400 font-bold">DRAAIEN</div>
          <div className="flex gap-1.5">
            <button
              onPointerDown={() => { unlockAudio(); if (engineRef.current) engineRef.current.turnLeft = true; }}
              onPointerUp={() => { if (engineRef.current) engineRef.current.turnLeft = false; }}
              onPointerLeave={() => { if (engineRef.current) engineRef.current.turnLeft = false; }}
              className="w-10 h-10 rounded-xl bg-neutral-800 active:bg-cyan-500 active:text-black border border-neutral-700 flex items-center justify-center text-cyan-400 font-bold shadow-md cursor-pointer select-none touch-none"
              title="Draai Links"
            >
              <RotateCounterClockwise size={18} />
            </button>
            <button
              onPointerDown={() => { unlockAudio(); if (engineRef.current) engineRef.current.turnRight = true; }}
              onPointerUp={() => { if (engineRef.current) engineRef.current.turnRight = false; }}
              onPointerLeave={() => { if (engineRef.current) engineRef.current.turnRight = false; }}
              className="w-10 h-10 rounded-xl bg-neutral-800 active:bg-cyan-500 active:text-black border border-neutral-700 flex items-center justify-center text-cyan-400 font-bold shadow-md cursor-pointer select-none touch-none"
              title="Draai Rechts"
            >
              <RotateCw size={18} />
            </button>
          </div>

          <button
            onClick={handleMobileInteract}
            className="w-full mt-1 py-1.5 px-2 rounded-xl bg-cyan-950/80 hover:bg-cyan-900 active:bg-cyan-500 active:text-black border border-cyan-600 text-cyan-300 font-mono text-[10px] font-black flex items-center justify-center gap-1 shadow-md cursor-pointer select-none"
          >
            <DoorClosed size={14} /> OPEN / ACTIE
          </button>
        </div>

        {/* Right: Action Buttons (Fire, Kick, Detonate) */}
        <div className="flex flex-col items-center">
          <div className="text-[9px] font-mono text-neutral-400 mb-1 font-bold">ACTIES</div>
          <div className="grid grid-cols-2 gap-2">
            {/* Primary Fire Button */}
            <button
              onClick={handleMobileFire}
              className="col-span-2 h-14 rounded-2xl bg-gradient-to-r from-red-600 to-amber-600 active:from-red-500 active:to-amber-400 text-white font-black text-sm tracking-wider flex items-center justify-center gap-1.5 shadow-[0_0_20px_rgba(239,68,68,0.6)] border border-red-400 active:scale-95 transition-all select-none cursor-pointer"
            >
              <Crosshair size={18} /> VUUR
            </button>

            {/* Mighty Foot Kick */}
            <button
              onClick={handleMobileKick}
              className="h-12 rounded-xl bg-amber-950/80 hover:bg-amber-900 active:bg-amber-500 active:text-black border border-amber-600 text-amber-300 font-black text-[11px] font-mono flex flex-col items-center justify-center shadow-md cursor-pointer active:scale-95 select-none"
            >
              <span>👢 TRAP</span>
            </button>

            {/* Pipebomb Detonate */}
            <button
              onClick={handleMobileDetonate}
              className="h-12 rounded-xl bg-yellow-950/80 hover:bg-yellow-900 active:bg-yellow-500 active:text-black border border-yellow-600 text-yellow-300 font-black text-[11px] font-mono flex flex-col items-center justify-center shadow-md cursor-pointer active:scale-95 select-none"
            >
              <span>💣 BOM</span>
            </button>
          </div>
        </div>
      </div>

      {/* Footer Controls Overview */}
      <div className="w-full max-w-5xl mt-2 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] sm:text-[11px] font-mono text-neutral-400 bg-neutral-900/60 p-2.5 rounded-xl border border-neutral-800">
        <div><strong className="text-white">D-Pad / WASD:</strong> Lopen &amp; Draaien</div>
        <div><strong className="text-amber-400">VUUR / Klik:</strong> Schieten / Actie</div>
        <div><strong className="text-red-400">TRAP / C:</strong> Mighty Foot Kick</div>
        <div><strong className="text-yellow-400">BOM / X:</strong> Pipebomb Detonatie</div>
      </div>

      {/* Help Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-700 rounded-2xl max-w-lg w-full p-5 sm:p-6 text-sm font-sans space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base sm:text-lg font-black text-amber-400 flex items-center gap-2">
              <Gamepad2 size={20} /> DUKE NUKEM 3D HANDLEIDING
            </h3>
            <div className="text-neutral-300 space-y-2 text-xs leading-relaxed font-mono">
              <p>• <strong>Mobiele Besturing:</strong> Gebruik het virtuele D-Pad links om te lopen, sleep met je vinger over het 3D scherm om rond te kijken, en druk op <strong>VUUR</strong> om te schieten.</p>
              <p>• <strong>Interactiviteit:</strong> Loop naar deuren en druk op <strong>OPEN / ACTIE</strong> (of loop ertegenaan). Drankautomaten herstellen health ("Ahhh, much better!").</p>
              <p>• <strong>Wapens:</strong> Tik op de snelle wapenbalk onder het scherm om direct te wisselen tussen de Mighty Foot, Glock, Shotgun, Chaingun, RPG en Pipebombs.</p>
              <p>• <strong>Pipebombs:</strong> Druk op <strong>BOM</strong> om een explosief te werpen, en druk nogmaals op <strong>BOM</strong> om deze op afstand te laten ontploffen!</p>
            </div>
            <button
              onClick={() => setShowHelpModal(false)}
              className="w-full py-2.5 bg-amber-500 text-black font-bold rounded-xl cursor-pointer active:scale-95"
            >
              SLUITEN &amp; TERUG NAAR HET SPEL
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
