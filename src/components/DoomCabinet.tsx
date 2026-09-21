import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Volume2,
  VolumeX,
  ArrowLeft,
  RotateCcw,
  Trophy,
  Sparkles,
  Crosshair,
  Shield,
  BookOpen,
  Play,
  Key,
  Flame,
  Zap,
  Info,
  Mouse,
  HelpCircle,
  DoorClosed,
  Compass,
  Map as MapIcon,
  X
} from 'lucide-react';
import { DoomEngine, DoomStats, DoomWeaponType } from '../game/doomEngine';
import { doomAudio } from '../game/doomAudio';
import { getDoomScores, saveDoomScore, DoomHighScore } from '../game/doomHighScores';
import { drawDoomguyFace } from '../game/doomTextures';
import { DoomLandingPage } from './DoomLandingPage';
import { DoomAutomap } from './DoomAutomap';
import { haptics } from '../utils/haptics';

interface DoomCabinetProps {
  onBackToLobby: () => void;
  initialLevelId?: string;
}

// Component to render authentic Doomguy face onto HTML5 Canvas
const DoomguyFaceCanvas: React.FC<{
  health: number;
  faceDirection: 'center' | 'left' | 'right';
  godMode: boolean;
  isGrinning: boolean;
}> = ({ health, faceDirection, godMode, isGrinning }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.imageSmoothingEnabled = false;
    drawDoomguyFace(ctx, canvas.width, canvas.height, health, faceDirection, godMode, isGrinning);
  }, [health, faceDirection, godMode, isGrinning]);

  return (
    <canvas
      ref={canvasRef}
      width={48}
      height={48}
      className="w-full h-full object-contain"
    />
  );
};

export const DoomCabinet: React.FC<DoomCabinetProps> = ({ onBackToLobby, initialLevelId = 'e1m1' }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<DoomEngine | null>(null);

  const [isMuted, setIsMuted] = useState(false);
  const [crtEffect, setCrtEffect] = useState(true);
  const [showLandingPage, setShowLandingPage] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showAutomap, setShowAutomap] = useState(false);
  const [showStartTip, setShowStartTip] = useState(true);
  const [selectedLevel, setSelectedLevel] = useState(initialLevelId);

  // High Scores & Name entry
  const [highScores, setHighScores] = useState<DoomHighScore[]>([]);
  const [playerName, setPlayerName] = useState('FLY');
  const [scoreSaved, setScoreSaved] = useState(false);

  // Engine Stats
  const [stats, setStats] = useState<DoomStats>({
    levelId: 'e1m1',
    levelName: 'E1M1: HANGAR',
    parTime: 30,
    elapsedTime: 0,
    health: 100,
    armor: 0,
    score: 0,
    weapon: 'pistol',
    weaponsOwned: {
      fist: true,
      pistol: true,
      shotgun: false,
      chaingun: false,
      rocket: false,
      plasma: false,
      bfg: false
    },
    ammo: {
      bullets: 50,
      shells: 0,
      rockets: 0,
      cells: 0
    },
    keys: {
      blue: false,
      yellow: false,
      red: false
    },
    kills: 0,
    totalMonsters: 0,
    secrets: 0,
    totalSecrets: 0,
    items: 0,
    totalItems: 0,
    godMode: false,
    isDead: false,
    victory: false,
    faceDirection: 'center',
    isGrinning: false
  });

  // Weapon recoil / muzzle flash animation state
  const [weaponAnim, setWeaponAnim] = useState<'idle' | 'firing' | 'pumping'>('idle');

  // Initialize Doom Engine
  const initGame = useCallback((levelId: string = 'e1m1') => {
    if (!containerRef.current) return;
    if (engineRef.current) {
      engineRef.current.destroy();
    }

    setScoreSaved(false);
    const engine = new DoomEngine(containerRef.current, (newStats) => {
      setStats({ ...newStats });
    });
    if (levelId !== 'e1m1') {
      engine.loadLevel(levelId);
    }
    engineRef.current = engine;
  }, []);

  useEffect(() => {
    setHighScores(getDoomScores());
    if (!showLandingPage) {
      initGame(selectedLevel);
    }

    return () => {
      if (engineRef.current) {
        engineRef.current.destroy();
      }
    };
  }, [initGame, showLandingPage, selectedLevel]);

  // Window resize handler
  useEffect(() => {
    const handleResize = () => {
      if (engineRef.current && containerRef.current) {
        engineRef.current.resize(containerRef.current.clientWidth, containerRef.current.clientHeight);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSound = () => {
    const next = !isMuted;
    setIsMuted(next);
    doomAudio.setMuted(next);
  };

  // Mouse / Touch Drag or Pointer Lock to Rotate 360°
  const isDraggingRef = useRef(false);
  const pointerStartRef = useRef({ x: 0, y: 0, time: 0 });
  const [isPointerLocked, setIsPointerLocked] = useState(false);

  const togglePointerLock = () => {
    if (!containerRef.current) return;
    if (document.pointerLockElement === containerRef.current) {
      document.exitPointerLock?.();
      setIsPointerLocked(false);
    } else {
      containerRef.current.requestPointerLock?.();
      setIsPointerLocked(true);
    }
  };

  useEffect(() => {
    const handleLockChange = () => {
      setIsPointerLocked(document.pointerLockElement === containerRef.current);
    };
    document.addEventListener('pointerlockchange', handleLockChange);
    return () => document.removeEventListener('pointerlockchange', handleLockChange);
  }, []);

  useEffect(() => {
    if (!isPointerLocked) return;
    const handleMouseMove = (e: MouseEvent) => {
      if (engineRef.current) {
        engineRef.current.rotateBy(-e.movementX * 0.0035);
      }
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isPointerLocked]);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (isPointerLocked) {
      triggerFire();
      return;
    }
    isDraggingRef.current = true;
    pointerStartRef.current = { x: e.clientX, y: e.clientY, time: Date.now() };
    try {
      (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    } catch {
      // Ignore if pointer capture fails
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!engineRef.current || isPointerLocked) return;
    if (!isDraggingRef.current) return;
    const deltaX = e.clientX - pointerStartRef.current.x;
    if (Math.abs(deltaX) > 1) {
      engineRef.current.rotateBy(-deltaX * 0.0055);
      pointerStartRef.current.x = e.clientX;
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isPointerLocked) return;
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    try {
      (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
    } catch {
      // Ignore
    }
    const elapsed = Date.now() - pointerStartRef.current.time;
    const dist = Math.hypot(e.clientX - pointerStartRef.current.x, e.clientY - pointerStartRef.current.y);
    // If it was a quick click without dragging (< 10px), fire weapon!
    if (elapsed < 300 && dist < 10) {
      triggerFire();
    }
  };

  // Keyboard Event Handlers (WASD, Arrows, Space, Shift, 1-7, Cheats)
  useEffect(() => {
    let cheatBuffer = '';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (showLandingPage) return;
      if (!engineRef.current) return;

      // Track typed characters for cheats (IDDQD / IDKFA)
      if (e.key.length === 1) {
        cheatBuffer = (cheatBuffer + e.key.toLowerCase()).slice(-5);
        if (cheatBuffer.endsWith('iddqd')) {
          engineRef.current.toggleGodMode();
          cheatBuffer = '';
        } else if (cheatBuffer.endsWith('idkfa')) {
          engineRef.current.cheatAllWeaponsAndKeys();
          cheatBuffer = '';
        }
      }

      // Toggle Automap with Tab or M
      if (e.code === 'Tab' || e.code === 'KeyM') {
        e.preventDefault();
        setShowAutomap((prev) => !prev);
        return;
      }
      if (e.code === 'Escape' && showAutomap) {
        setShowAutomap(false);
        return;
      }

      // Toggle Help Modal with H or ?
      if (e.code === 'KeyH' || e.key === '?') {
        setShowHelpModal((prev) => !prev);
        return;
      }
      if (e.code === 'Escape' && showHelpModal) {
        setShowHelpModal(false);
        return;
      }

      // Movement & 360° Turning
      if (e.code === 'KeyW' || e.code === 'ArrowUp') {
        engineRef.current.moveForward = true;
      } else if (e.code === 'KeyS' || e.code === 'ArrowDown') {
        engineRef.current.moveBackward = true;
      } else if (e.code === 'KeyA') {
        engineRef.current.strafeLeft = true;
      } else if (e.code === 'KeyD') {
        engineRef.current.strafeRight = true;
      } else if (e.code === 'KeyQ' || e.code === 'ArrowLeft') {
        engineRef.current.turnLeft = true;
      } else if (e.code === 'KeyE') {
        // E opens doors AND turns right
        engineRef.current.interactWithWorld();
        engineRef.current.turnRight = true;
      } else if (e.code === 'ArrowRight') {
        engineRef.current.turnRight = true;
      } else if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
        engineRef.current.isRunning = true;
      } else if (e.code === 'Space' || e.code === 'KeyF' || e.code === 'Enter') {
        // Open door / interact switch
        engineRef.current.interactWithWorld();
      } else if (e.code === 'ControlLeft' || e.code === 'ControlRight') {
        // Fire weapon
        triggerFire();
      } else if (e.code === 'Digit1') {
        engineRef.current.setWeapon('fist');
      } else if (e.code === 'Digit2') {
        engineRef.current.setWeapon('pistol');
      } else if (e.code === 'Digit3') {
        engineRef.current.setWeapon('shotgun');
      } else if (e.code === 'Digit4') {
        engineRef.current.setWeapon('chaingun');
      } else if (e.code === 'Digit5') {
        engineRef.current.setWeapon('rocket');
      } else if (e.code === 'Digit6') {
        engineRef.current.setWeapon('plasma');
      } else if (e.code === 'Digit7') {
        engineRef.current.setWeapon('bfg');
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (!engineRef.current) return;
      if (e.code === 'KeyW' || e.code === 'ArrowUp') {
        engineRef.current.moveForward = false;
      } else if (e.code === 'KeyS' || e.code === 'ArrowDown') {
        engineRef.current.moveBackward = false;
      } else if (e.code === 'KeyA') {
        engineRef.current.strafeLeft = false;
      } else if (e.code === 'KeyD') {
        engineRef.current.strafeRight = false;
      } else if (e.code === 'KeyQ' || e.code === 'ArrowLeft') {
        engineRef.current.turnLeft = false;
      } else if (e.code === 'KeyE' || e.code === 'ArrowRight') {
        engineRef.current.turnRight = false;
      } else if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
        engineRef.current.isRunning = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [showLandingPage]);

  // Trigger weapon firing with visual recoil
  const triggerFire = () => {
    if (!engineRef.current || stats.isDead || stats.victory) return;
    haptics.medium();
    engineRef.current.fireWeapon();
    setWeaponAnim('firing');

    if (stats.weapon === 'shotgun') {
      setTimeout(() => setWeaponAnim('pumping'), 200);
      setTimeout(() => setWeaponAnim('idle'), 700);
    } else {
      setTimeout(() => setWeaponAnim('idle'), 150);
    }
  };

  // Submit high score
  const handleSaveScore = () => {
    if (scoreSaved) return;
    const killsPct = stats.totalMonsters > 0 ? Math.round((stats.kills / stats.totalMonsters) * 100) : 100;
    const secretsPct = stats.totalSecrets > 0 ? Math.round((stats.secrets / stats.totalSecrets) * 100) : 100;

    const updated = saveDoomScore({
      name: playerName.toUpperCase().slice(0, 3) || 'FLY',
      score: stats.score + Math.max(0, Math.round(stats.parTime - stats.elapsedTime)) * 100,
      level: stats.levelName,
      killsPercent: killsPct,
      secretsPercent: secretsPct,
      timeSeconds: Math.round(stats.elapsedTime)
    });
    setHighScores(updated);
    setScoreSaved(true);
  };

  // Next level progression
  const handleNextLevel = () => {
    const nextMap = stats.levelId === 'e1m1' ? 'e1m2' : stats.levelId === 'e1m2' ? 'e1m3' : 'e1m1';
    setSelectedLevel(nextMap);
    initGame(nextMap);
  };

  // Render authentic Doomguy face sprite on canvas based on health & condition
  const renderDoomGuyFace = () => {
    return (
      <div className="w-12 h-12 bg-neutral-950 rounded border-2 border-neutral-700 shadow-inner overflow-hidden flex items-center justify-center">
        <DoomguyFaceCanvas
          health={stats.health}
          faceDirection={stats.faceDirection}
          godMode={stats.godMode}
          isGrinning={stats.isGrinning}
        />
      </div>
    );
  };

  // If user toggles the landing page / exhibition view
  if (showLandingPage) {
    return (
      <DoomLandingPage
        onPlay={(lvlId) => {
          if (lvlId) setSelectedLevel(lvlId);
          setShowLandingPage(false);
        }}
        onBackToLobby={onBackToLobby}
      />
    );
  }

  const activeAmmoCount =
    stats.weapon === 'pistol' || stats.weapon === 'chaingun'
      ? stats.ammo.bullets
      : stats.weapon === 'shotgun'
      ? stats.ammo.shells
      : stats.weapon === 'rocket'
      ? stats.ammo.rockets
      : stats.weapon === 'plasma' || stats.weapon === 'bfg'
      ? stats.ammo.cells
      : '---';

  return (
    <div className="w-full min-h-screen bg-black text-white flex flex-col justify-between font-mono select-none overflow-x-hidden">
      {/* Top Arcade Header */}
      <div className="w-full bg-neutral-950 border-b border-red-900/60 px-4 py-2.5 flex items-center justify-between z-20">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToLobby}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-xs font-bold text-neutral-300 hover:text-white transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-red-500" />
            <span className="hidden sm:inline">LOBBY</span>
          </button>

          <button
            onClick={() => setShowLandingPage(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-950/80 hover:bg-red-900 border border-red-600 text-xs font-bold text-red-300 shadow-[0_0_12px_rgba(239,68,68,0.4)] transition cursor-pointer"
          >
            <BookOpen className="w-4 h-4 text-red-400" />
            <span className="hidden sm:inline">EXPOSITIE & INFO</span>
            <span className="sm:hidden">INFO</span>
          </button>

          {/* Snelgids / Hoe werkt het? Knop */}
          <button
            onClick={() => setShowHelpModal(true)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-xs font-bold text-amber-300 transition cursor-pointer"
            title="Uitleg: Hoe werkt de startkamer en besturing? (Druk H)"
          >
            <HelpCircle className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">HOE WERKT HET?</span>
            <span className="sm:hidden">HULP</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          {/* Level indicator */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded bg-neutral-900 border border-neutral-800 text-xs text-amber-400 font-bold">
            <Flame className="w-3.5 h-3.5 text-red-500" />
            <span>{stats.levelName}</span>
          </div>

          {/* Cheats Quick Toggles */}
          <button
            onClick={() => engineRef.current?.toggleGodMode()}
            className={`px-2.5 py-1 rounded text-xs font-black border transition cursor-pointer ${
              stats.godMode
                ? 'bg-amber-500 text-black border-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.6)]'
                : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white'
            }`}
            title="God Mode on/off"
          >
            IDDQD
          </button>

          <button
            onClick={() => engineRef.current?.cheatAllWeaponsAndKeys()}
            className="px-2.5 py-1 rounded text-xs font-black bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-amber-400 cursor-pointer"
            title="All Weapons & Ammo"
          >
            IDKFA
          </button>

          {/* Automap (TAB) Toggle */}
          <button
            id="doom-automap-toggle-btn"
            onClick={() => setShowAutomap((prev) => !prev)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-bold border transition cursor-pointer ${
              showAutomap
                ? 'bg-green-600 text-white border-green-400 shadow-[0_0_12px_rgba(34,197,94,0.7)]'
                : 'bg-neutral-900 border-neutral-800 text-green-400 hover:text-white'
            }`}
            title="Automap Plattegrond tonen (Druk op TAB)"
          >
            <MapIcon className="w-3.5 h-3.5" />
            <span>Map (TAB)</span>
          </button>

          {/* Mouse Look / Pointer Lock Toggle */}
          <button
            onClick={togglePointerLock}
            className={`hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-bold border transition cursor-pointer ${
              isPointerLocked
                ? 'bg-red-600 text-white border-red-400 shadow-[0_0_12px_rgba(239,68,68,0.7)] animate-pulse'
                : 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:text-white'
            }`}
            title="Vrij rondkijken met muis (Druk ESC om los te laten)"
          >
            <Mouse className="w-3.5 h-3.5" />
            <span>{isPointerLocked ? 'Muis Actief (ESC)' : 'Muis Richting'}</span>
          </button>

          <button
            onClick={toggleSound}
            className="p-1.5 rounded bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white cursor-pointer"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-red-400" />}
          </button>
        </div>
      </div>

      {/* Main 3D Viewport with First-Person Weapon & CRT Scanlines */}
      <div className="relative flex-1 w-full flex items-center justify-center bg-black overflow-hidden min-h-[380px] sm:min-h-[460px]">
        {/* Three.js Render Target with Mouse/Touch Drag 360° rotation */}
        <div
          ref={containerRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          className="w-full h-full absolute inset-0 cursor-crosshair touch-none select-none"
          title="Klik om te schieten, sleep horizontaal om 360° rond te draaien"
        />

        {/* First Person Weapon Overlay Sprite (Center bottom) */}
        <div className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center">
          {/* Muzzle Flash Glow */}
          {weaponAnim === 'firing' && (
            <div className="w-24 h-24 sm:w-32 sm:h-32 -mb-10 bg-gradient-to-t from-yellow-300 via-amber-400 to-transparent rounded-full blur-md animate-ping opacity-90" />
          )}

          {/* Weapon Sprite */}
          {stats.weapon === 'fist' && (
            <div className={`w-40 h-36 sm:w-56 sm:h-44 flex items-end justify-center transition-transform ${weaponAnim === 'firing' ? '-translate-y-6 scale-110' : ''}`}>
              <svg viewBox="0 0 100 80" className="w-full h-full drop-shadow-[0_15px_15px_rgba(0,0,0,0.8)]">
                {/* Arm / Forearm */}
                <path d="M15 80 L35 45 L65 45 L85 80 Z" fill="#8d5b4c" stroke="#261714" strokeWidth="2" />
                <path d="M25 80 L38 52 L62 52 L75 80 Z" fill="#b07d62" />
                {/* Brass knuckles / Clenched fist */}
                <rect x="30" y="28" width="40" height="26" rx="8" fill="#d4a373" stroke="#261714" strokeWidth="2" />
                {/* Knuckles definition */}
                <circle cx="37" cy="38" r="5" fill="#e7c8a4" stroke="#543d2b" strokeWidth="1.5" />
                <circle cx="46" cy="36" r="5.5" fill="#e7c8a4" stroke="#543d2b" strokeWidth="1.5" />
                <circle cx="55" cy="36" r="5.5" fill="#e7c8a4" stroke="#543d2b" strokeWidth="1.5" />
                <circle cx="63" cy="38" r="5" fill="#e7c8a4" stroke="#543d2b" strokeWidth="1.5" />
                {/* Thumb clenched */}
                <path d="M30 42 C24 45, 24 55, 34 56 L45 54 Z" fill="#bc8a5f" stroke="#261714" strokeWidth="1.5" />
              </svg>
            </div>
          )}

          {stats.weapon === 'pistol' && (
            <div className={`w-36 h-48 sm:w-48 sm:h-64 flex items-end justify-center transition-transform ${weaponAnim === 'firing' ? '-translate-y-4 rotate-[-2deg]' : ''}`}>
              <svg viewBox="0 0 120 140" className="w-full h-full drop-shadow-[0_15px_20px_rgba(0,0,0,0.85)]">
                {/* Player Gloved Hands holding grip */}
                <path d="M30 140 L45 85 L75 85 L90 140 Z" fill="#8d5b4c" stroke="#1c1917" strokeWidth="2" />
                <path d="M38 100 C34 110, 36 125, 48 128 L72 128 C84 125, 86 110, 82 100 Z" fill="#4a5568" stroke="#1a202c" strokeWidth="2" />
                {/* Pistol Slide / Barrel */}
                <rect x="48" y="22" width="24" height="65" rx="3" fill="#2d3748" stroke="#111827" strokeWidth="2" />
                <rect x="52" y="26" width="16" height="58" fill="#4a5568" />
                {/* Top slide highlight & serrations */}
                <rect x="54" y="22" width="12" height="4" fill="#a0aec0" />
                <line x1="50" y1="40" x2="70" y2="40" stroke="#1a202c" strokeWidth="1.5" />
                <line x1="50" y1="44" x2="70" y2="44" stroke="#1a202c" strokeWidth="1.5" />
                <line x1="50" y1="48" x2="70" y2="48" stroke="#1a202c" strokeWidth="1.5" />
                {/* Front Sight Post */}
                <rect x="58" y="16" width="4" height="7" fill="#1a202c" />
                <rect x="59" y="17" width="2" height="3" fill="#cbd5e1" />
                {/* Muzzle Opening */}
                <ellipse cx="60" cy="22" rx="4" ry="2" fill="#000000" />
              </svg>
            </div>
          )}

          {stats.weapon === 'shotgun' && (
            <div className={`w-44 h-56 sm:w-60 sm:h-72 flex items-end justify-center transition-transform ${weaponAnim === 'firing' ? '-translate-y-6 rotate-[1deg] scale-105' : weaponAnim === 'pumping' ? 'translate-y-4 -rotate-1' : ''}`}>
              <svg viewBox="0 0 140 160" className="w-full h-full drop-shadow-[0_20px_25px_rgba(0,0,0,0.9)]">
                {/* Marine gloved hands */}
                {/* Left hand under fore-end pump */}
                <ellipse cx="70" cy="115" rx="20" ry="14" fill="#5c4033" stroke="#261714" strokeWidth="2" />
                <rect x="56" y="106" width="28" height="18" rx="4" fill="#8d5b4c" />
                {/* Right hand on trigger grip */}
                <path d="M50 160 L60 135 L80 135 L90 160 Z" fill="#2d3748" />

                {/* Double Steel Barrels */}
                <rect x="54" y="24" width="14" height="78" fill="#334155" stroke="#0f172a" strokeWidth="2" />
                <rect x="72" y="24" width="14" height="78" fill="#334155" stroke="#0f172a" strokeWidth="2" />
                {/* Barrel highlights */}
                <rect x="57" y="26" width="4" height="74" fill="#64748b" />
                <rect x="75" y="26" width="4" height="74" fill="#64748b" />
                {/* Double Muzzle Holes */}
                <ellipse cx="61" cy="24" rx="5" ry="3.5" fill="#000000" stroke="#475569" strokeWidth="1" />
                <ellipse cx="79" cy="24" rx="5" ry="3.5" fill="#000000" stroke="#475569" strokeWidth="1" />
                {/* Bead sight */}
                <circle cx="70" cy="22" r="2.5" fill="#f59e0b" stroke="#000" strokeWidth="0.5" />

                {/* Rib between barrels */}
                <rect x="67" y="25" width="6" height="76" fill="#1e293b" />

                {/* Grooved Wooden Pump / Foregrip */}
                <rect x="50" y="86" width="40" height="28" rx="4" fill="#78350f" stroke="#451a03" strokeWidth="2" />
                <line x1="50" y1="92" x2="90" y2="92" stroke="#451a03" strokeWidth="2" />
                <line x1="50" y1="98" x2="90" y2="98" stroke="#451a03" strokeWidth="2" />
                <line x1="50" y1="104" x2="90" y2="104" stroke="#451a03" strokeWidth="2" />
              </svg>
            </div>
          )}

          {stats.weapon === 'chaingun' && (
            <div className={`w-48 h-52 sm:w-64 sm:h-68 flex items-end justify-center transition-transform ${weaponAnim === 'firing' ? 'rotate-2 scale-105' : ''}`}>
              <svg viewBox="0 0 160 150" className="w-full h-full drop-shadow-[0_20px_25px_rgba(0,0,0,0.9)]">
                {/* Marine gloved hands on double grips */}
                <path d="M20 150 L40 105 L60 105 L50 150 Z" fill="#64748b" stroke="#0f172a" strokeWidth="2" />
                <path d="M140 150 L120 105 L100 105 L110 150 Z" fill="#64748b" stroke="#0f172a" strokeWidth="2" />

                {/* Heavy Gun Body Housing */}
                <rect x="45" y="70" width="70" height="55" rx="6" fill="#334155" stroke="#0f172a" strokeWidth="3" />
                <rect x="52" y="76" width="56" height="40" fill="#1e293b" />

                {/* Rotating Gatling Cluster (Circular Face) */}
                <circle cx="80" cy="58" r="30" fill="#1e293b" stroke="#475569" strokeWidth="3" />
                {/* 6 Steel Barrels */}
                <circle cx="80" cy="38" r="6" fill="#000000" stroke="#94a3b8" strokeWidth="2" />
                <circle cx="97" cy="48" r="6" fill="#000000" stroke="#94a3b8" strokeWidth="2" />
                <circle cx="97" cy="68" r="6" fill="#000000" stroke="#94a3b8" strokeWidth="2" />
                <circle cx="80" cy="78" r="6" fill="#000000" stroke="#94a3b8" strokeWidth="2" />
                <circle cx="63" cy="68" r="6" fill="#000000" stroke="#94a3b8" strokeWidth="2" />
                <circle cx="63" cy="48" r="6" fill="#000000" stroke="#94a3b8" strokeWidth="2" />
                {/* Center Rotor Axle */}
                <circle cx="80" cy="58" r="5" fill="#f59e0b" />
              </svg>
            </div>
          )}

          {stats.weapon === 'rocket' && (
            <div className={`w-52 h-56 sm:w-72 sm:h-72 flex items-end justify-center transition-transform ${weaponAnim === 'firing' ? '-translate-y-8 scale-105' : ''}`}>
              <svg viewBox="0 0 180 160" className="w-full h-full drop-shadow-[0_20px_25px_rgba(0,0,0,0.9)]">
                {/* Military Green Shoulder Launcher Tube */}
                <rect x="55" y="30" width="70" height="110" rx="8" fill="#166534" stroke="#052e16" strokeWidth="3" />
                <rect x="62" y="38" width="56" height="94" fill="#14532d" />
                {/* Large Launch Bore Opening */}
                <ellipse cx="90" cy="32" rx="30" ry="14" fill="#000000" stroke="#22c55e" strokeWidth="2" />
                {/* Loaded Rocket Warhead Tip */}
                <ellipse cx="90" cy="32" rx="16" ry="8" fill="#eab308" />
                <circle cx="90" cy="32" r="6" fill="#dc2626" />
                {/* Warning Hazard Stripes */}
                <rect x="58" y="70" width="64" height="12" fill="#000000" />
                <line x1="65" y1="70" x2="75" y2="82" stroke="#eab308" strokeWidth="3" />
                <line x1="80" y1="70" x2="90" y2="82" stroke="#eab308" strokeWidth="3" />
                <line x1="95" y1="70" x2="105" y2="82" stroke="#eab308" strokeWidth="3" />
                <line x1="110" y1="70" x2="120" y2="82" stroke="#eab308" strokeWidth="3" />
              </svg>
            </div>
          )}

          {stats.weapon === 'plasma' && (
            <div className={`w-48 h-56 sm:w-64 sm:h-72 flex items-end justify-center transition-transform ${weaponAnim === 'firing' ? 'scale-110 -translate-y-2' : ''}`}>
              <svg viewBox="0 0 160 160" className="w-full h-full drop-shadow-[0_20px_25px_rgba(0,0,0,0.9)]">
                {/* High-tech blue coil casing */}
                <rect x="45" y="40" width="70" height="100" rx="6" fill="#0369a1" stroke="#082f49" strokeWidth="3" />
                {/* Plasma Core Chamber */}
                <rect x="55" y="55" width="50" height="50" rx="4" fill="#082f49" />
                <circle cx="80" cy="80" r="18" fill="#38bdf8" className="animate-pulse" />
                <circle cx="80" cy="80" r="10" fill="#e0f2fe" />
                {/* Emitter Prongs */}
                <rect x="52" y="24" width="8" height="20" fill="#64748b" stroke="#000" strokeWidth="1" />
                <rect x="100" y="24" width="8" height="20" fill="#64748b" stroke="#000" strokeWidth="1" />
                <ellipse cx="80" cy="38" rx="22" ry="6" fill="#0284c7" />
              </svg>
            </div>
          )}

          {stats.weapon === 'bfg' && (
            <div className={`w-56 h-60 sm:w-80 sm:h-80 flex items-end justify-center transition-transform ${weaponAnim === 'firing' ? '-translate-y-6 scale-110' : ''}`}>
              <svg viewBox="0 0 200 180" className="w-full h-full drop-shadow-[0_25px_35px_rgba(0,0,0,0.95)]">
                {/* Massive Heavy Bio-Force Housing */}
                <polygon points="30,180 60,60 140,60 170,180" fill="#064e3b" stroke="#022c22" strokeWidth="4" />
                {/* Gigantic Emerald Plasma Accelerator Bore */}
                <ellipse cx="100" cy="62" rx="42" ry="22" fill="#022c22" stroke="#10b981" strokeWidth="3" />
                <ellipse cx="100" cy="62" rx="30" ry="15" fill="#10b981" className="animate-pulse" />
                <ellipse cx="100" cy="62" rx="16" ry="8" fill="#a7f3d0" />
                {/* UAC BFG-9000 Stencil Tag */}
                <rect x="75" y="110" width="50" height="16" fill="#022c22" rx="2" />
                <text x="100" y="122" fill="#34d399" fontSize="9" fontWeight="900" textAnchor="middle" fontFamily="monospace">BFG 9000</text>
              </svg>
            </div>
          )}
        </div>

        {/* Crosshair */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center z-10 opacity-70">
          <div className="w-4 h-4 border border-red-500/80 rounded-full flex items-center justify-center">
            <div className="w-1 h-1 bg-red-400 rounded-full" />
          </div>
        </div>

        {/* CRT Scanline Shader Overlay */}
        {crtEffect && (
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.35)_50%)] bg-[length:100%_4px] z-10 opacity-75" />
        )}

        {/* Dynamic Door Proximity Alert / Action Prompt */}
        {stats.nearDoor && !stats.isDead && (
          <div className="absolute top-12 left-1/2 -translate-x-1/2 z-20 pointer-events-none animate-bounce">
            <div className="px-4 py-2 rounded-xl bg-black/85 border border-cyan-500/80 shadow-[0_0_20px_rgba(6,182,212,0.6)] flex items-center gap-2.5 backdrop-blur-md">
              <DoorClosed className="w-5 h-5 text-cyan-400" />
              <div className="font-mono text-xs">
                {stats.nearDoor.type === 'exit' ? (
                  <span className="text-emerald-400 font-black">
                    EXIT DEUR: Druk op <span className="bg-emerald-950 px-1.5 py-0.5 rounded border border-emerald-600 text-white">SPATIE</span> of <span className="bg-emerald-950 px-1.5 py-0.5 rounded border border-emerald-600 text-white">E</span> om level te voltooien!
                  </span>
                ) : stats.nearDoor.locked ? (
                  <span className="text-red-400 font-black">
                    VERGRENDELDE DEUR: {stats.nearDoor.type.toUpperCase()} KEYCARD VEREIST!
                  </span>
                ) : (
                  <span className="text-cyan-300 font-bold">
                    SCHUIFDEUR: Druk op <span className="bg-cyan-950 px-1.5 py-0.5 rounded border border-cyan-600 text-white">SPATIE</span> / <span className="bg-cyan-950 px-1.5 py-0.5 rounded border border-cyan-600 text-white">E</span> of loop ertegenaan!
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Start Chamber Onboarding Banner (Auto disappears on movement or dismiss) */}
        {showStartTip && stats.elapsedTime < 25 && !stats.isDead && (
          <div className="absolute top-3 left-3 right-3 sm:left-auto sm:right-3 sm:max-w-md z-20 bg-neutral-950/90 border border-red-500/60 rounded-xl p-3.5 shadow-2xl backdrop-blur-md">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2 text-red-400 font-mono font-bold text-xs">
                <Compass className="w-4 h-4 text-amber-400" />
                <span>STARTKAMER GIDS (E1M1)</span>
              </div>
              <button
                onClick={() => setShowStartTip(false)}
                className="text-neutral-400 hover:text-white p-0.5 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="mt-1.5 text-xs text-neutral-300 leading-relaxed font-sans">
              Je bevindt je in de observatie-startkamer van <strong className="text-white">E1M1: Hangar</strong>.
            </p>
            <div className="mt-2 space-y-1 text-[11px] font-mono text-neutral-300 bg-neutral-900/90 p-2 rounded-lg border border-neutral-800">
              <div>• <span className="text-amber-300 font-bold">W / ▲</span> : Loop naar voren de gang in</div>
              <div>• <span className="text-cyan-300 font-bold">Spatie / E / F</span> : Open schuifdeuren (of loop ertegenaan)</div>
              <div>• <span className="text-red-400 font-bold">◀ ▶ / Q E / Muis</span> : 360° rondkijken</div>
              <div>• <span className="text-yellow-400 font-bold">Ctrl / Klik</span> : Schiet met je pistool</div>
            </div>
          </div>
        )}

        {/* Help & Walkthrough Modal */}
        {showHelpModal && (
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md z-40 flex items-center justify-center p-4">
            <div className="bg-neutral-900 border border-red-600 rounded-2xl max-w-xl w-full p-5 sm:p-6 shadow-[0_0_35px_rgba(239,68,68,0.5)] max-h-[90vh] overflow-y-auto space-y-4">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-red-950 border border-red-700 text-red-400">
                    <HelpCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-mono font-black text-white">HOE WERKT HET SPEL &amp; DE KAMER?</h3>
                    <p className="text-xs text-neutral-400">Handleiding voor nieuwkomers &amp; veteranen</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowHelpModal(false)}
                  className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Stap voor stap wat je moet doen */}
              <div className="space-y-3 font-mono text-xs">
                <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 space-y-1">
                  <div className="text-amber-400 font-bold flex items-center gap-1.5">
                    <span>1. VERLAAT DE STARTKAMER</span>
                  </div>
                  <p className="text-neutral-300 font-sans leading-relaxed text-xs">
                    Je begint in een afgesloten UAC-observatiekamer. Draai je om of kijk vooruit, loop rechtdoor met <strong className="text-white">W</strong>. Je komt bij een zware stalen schuifdeur. Druk op <strong className="text-cyan-300">SPATIE</strong> of <strong className="text-cyan-300">E</strong>, of loop gewoon tegen de deur aan om hem open te schuiven!
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 space-y-1">
                  <div className="text-emerald-400 font-bold flex items-center gap-1.5">
                    <span>2. VERZAMEL AMMO &amp; WAPENS</span>
                  </div>
                  <p className="text-neutral-300 font-sans leading-relaxed text-xs">
                    Op de vloer liggen kogels, health packs en in de zuurkamer vind je een <strong className="text-yellow-400">Shotgun</strong> en pantser. Loop simpelweg over items heen om ze automatisch op te rapen.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 space-y-1">
                  <div className="text-red-400 font-bold flex items-center gap-1.5">
                    <span>3. VECHT TEGEN DE MONSTERS</span>
                  </div>
                  <p className="text-neutral-300 font-sans leading-relaxed text-xs">
                    Zombie-soldaten en vuurballen-schietende Imps patrouilleren in de gangen. Richt je vizier op hen en druk op <strong className="text-yellow-400">CTRL</strong> of <strong className="text-yellow-400">KLIK</strong> met je muis om te schieten! Wissel van wapen met de cijfertoetsen <strong className="text-white">1 t/m 7</strong>.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-cyan-950 border border-neutral-800 space-y-1">
                  <div className="text-cyan-400 font-bold flex items-center gap-1.5">
                    <span>4. VIND DE EXIT DEUR</span>
                  </div>
                  <p className="text-neutral-300 font-sans leading-relaxed text-xs">
                    Volg de gangen tot je bij de UAC Exit-deur komt. Druk op <strong className="text-cyan-300">SPATIE</strong> of <strong className="text-cyan-300">E</strong> om het level te voltooien en naar het volgende level te gaan!
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-green-950/40 border border-green-800 space-y-1">
                  <div className="text-green-400 font-bold flex items-center gap-1.5">
                    <span>5. AUTOMAP PLATTEGROND (TAB)</span>
                  </div>
                  <p className="text-neutral-300 font-sans leading-relaxed text-xs">
                    Druk op <strong className="text-green-300">TAB</strong> om de retro groene vectorkaart te openen om kamers, monsters, deuren en geheime doorgangen live te inspecteren!
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-red-950/40 border border-red-800 text-[11px] text-neutral-300 flex items-center justify-between">
                  <span>Zit je vast of heb je oneindige ammo/leven nodig?</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        engineRef.current?.toggleGodMode();
                        engineRef.current?.cheatAllWeaponsAndKeys();
                        setShowHelpModal(false);
                      }}
                      className="px-2.5 py-1 rounded bg-amber-500 hover:bg-amber-400 text-black font-black text-[11px] cursor-pointer"
                    >
                      ACTIVEREN (IDDQD + IDKFA)
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setShowHelpModal(false)}
                  className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-mono font-bold text-xs cursor-pointer"
                >
                  SLUITEN &amp; VERDER SPELEN (ESC)
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Retro Green Vector Automap Overlay (TAB key) */}
        {showAutomap && engineRef.current && (
          <DoomAutomap
            engine={engineRef.current}
            onClose={() => setShowAutomap(false)}
          />
        )}

        {/* Blood Screen Flash on Damage */}
        {stats.health < 25 && !stats.isDead && (
          <div className="pointer-events-none absolute inset-0 bg-red-900/30 animate-pulse z-10" />
        )}

        {/* Death / Game Over Screen Overlay */}
        {stats.isDead && (
          <div className="absolute inset-0 bg-red-950/80 backdrop-blur-sm z-30 flex flex-col items-center justify-center p-6 text-center">
            <div className="text-4xl sm:text-6xl font-black text-red-500 drop-shadow-[0_0_20px_rgba(239,68,68,0.9)]">
              JE BENT GESNEUVELD!
            </div>
            <p className="mt-3 text-sm sm:text-base text-neutral-300 max-w-md">
              De demonen van Phobos hebben je overmeesterd. Herlaad je wapens en vecht opnieuw voor de aarde!
            </p>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => initGame(stats.levelId)}
                className="px-6 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-sm flex items-center gap-2 shadow-[0_0_25px_rgba(239,68,68,0.7)] cursor-pointer active:scale-95"
              >
                <RotateCcw className="w-4 h-4" />
                <span>HERSTART LEVEL</span>
              </button>
              <button
                onClick={() => setShowLandingPage(true)}
                className="px-5 py-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-300 font-bold text-sm cursor-pointer"
              >
                LEES STRATEGIE
              </button>
            </div>
          </div>
        )}

        {/* Victory / Floor Completed Intermission Screen */}
        {stats.victory && (
          <div className="absolute inset-0 bg-black/95 z-30 flex flex-col items-center justify-center p-6 text-center">
            <div className="text-xs font-mono font-bold text-red-500 tracking-widest uppercase mb-1">
              EPISODE 1: KNEE-DEEP IN THE DEAD
            </div>
            <div className="text-3xl sm:text-5xl font-black text-amber-400 drop-shadow-[0_0_25px_rgba(245,158,11,0.8)]">
              {stats.levelName} VOLTOOID!
            </div>

            {/* Authentic Intermission Stats */}
            <div className="mt-6 w-full max-w-sm space-y-3 bg-neutral-900/90 border-2 border-neutral-700 p-5 rounded-2xl text-left font-mono">
              <div className="flex justify-between items-center text-sm">
                <span className="text-neutral-400">KILLS:</span>
                <span className="text-red-400 font-black text-base">
                  {stats.totalMonsters > 0 ? Math.round((stats.kills / stats.totalMonsters) * 100) : 100}%
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-neutral-400">ITEMS:</span>
                <span className="text-amber-400 font-black text-base">
                  {stats.totalItems > 0 ? Math.round((stats.items / stats.totalItems) * 100) : 100}%
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-neutral-400">SECRETS:</span>
                <span className="text-emerald-400 font-black text-base">
                  {stats.totalSecrets > 0 ? Math.round((stats.secrets / stats.totalSecrets) * 100) : 100}%
                </span>
              </div>
              <div className="border-t border-neutral-800 pt-2 flex justify-between items-center text-xs">
                <span className="text-neutral-500">TIJD / PAR:</span>
                <span className="text-white font-bold">
                  {Math.floor(stats.elapsedTime)}s / {stats.parTime}s
                </span>
              </div>
            </div>

            {/* High Score Save */}
            {!scoreSaved ? (
              <div className="mt-4 flex items-center gap-2">
                <input
                  type="text"
                  maxLength={3}
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value.toUpperCase())}
                  className="w-20 bg-neutral-900 border border-neutral-700 text-center font-black text-amber-400 px-2 py-1.5 rounded uppercase"
                  placeholder="FLY"
                />
                <button
                  onClick={handleSaveScore}
                  className="px-4 py-1.5 rounded bg-amber-500 hover:bg-amber-400 text-black font-black text-xs cursor-pointer active:scale-95"
                >
                  OPSLAAN IN HALL OF FAME
                </button>
              </div>
            ) : (
              <div className="mt-4 text-xs font-bold text-emerald-400">✓ SCORE OPGESLAGEN!</div>
            )}

            <div className="mt-6 flex gap-3">
              <button
                onClick={handleNextLevel}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-red-600 via-amber-600 to-red-600 text-white font-black text-sm flex items-center gap-2 shadow-[0_0_25px_rgba(239,68,68,0.7)] cursor-pointer active:scale-95"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>VOLGEND LEVEL</span>
              </button>
              <button
                onClick={() => initGame(stats.levelId)}
                className="px-4 py-3 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-300 font-bold text-xs cursor-pointer"
              >
                SPEEL OPNIEUW
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Touch & Quick Controls for Mobile / Tablet */}
      <div className="sm:hidden bg-neutral-950 px-3 py-2 border-t border-neutral-800 flex items-center justify-between z-20">
        <div className="flex gap-1.5">
          <button
            onPointerDown={() => {
              if (engineRef.current) engineRef.current.turnLeft = true;
            }}
            onPointerUp={() => {
              if (engineRef.current) engineRef.current.turnLeft = false;
            }}
            className="w-10 h-10 rounded bg-neutral-900 border border-neutral-800 flex items-center justify-center text-sm font-bold active:bg-neutral-800"
          >
            ◀
          </button>
          <button
            onPointerDown={() => {
              if (engineRef.current) engineRef.current.moveForward = true;
            }}
            onPointerUp={() => {
              if (engineRef.current) engineRef.current.moveForward = false;
            }}
            className="w-10 h-10 rounded bg-neutral-900 border border-neutral-800 flex items-center justify-center text-sm font-bold active:bg-neutral-800"
          >
            ▲
          </button>
          <button
            onPointerDown={() => {
              if (engineRef.current) engineRef.current.turnRight = true;
            }}
            onPointerUp={() => {
              if (engineRef.current) engineRef.current.turnRight = false;
            }}
            className="w-10 h-10 rounded bg-neutral-900 border border-neutral-800 flex items-center justify-center text-sm font-bold active:bg-neutral-800"
          >
            ▶
          </button>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => engineRef.current?.interactWithWorld()}
            className="px-3 h-10 rounded bg-neutral-800 border border-neutral-700 text-xs font-bold active:bg-neutral-700"
          >
            OPEN
          </button>
          <button
            onClick={triggerFire}
            className="px-5 h-10 rounded bg-red-600 text-white font-black text-xs active:scale-95 shadow-[0_0_15px_rgba(239,68,68,0.6)]"
          >
            VUUR
          </button>
        </div>
      </div>

      {/* The Legendary DOOM STATUS BAR (STBAR) */}
      <div className="w-full bg-gradient-to-r from-neutral-900 via-neutral-950 to-neutral-900 border-t-2 border-neutral-700 px-2 sm:px-4 py-2 flex items-center justify-between z-20 overflow-x-auto">
        <div className="flex items-center gap-2 sm:gap-6 min-w-max mx-auto">
          {/* AMMO Count */}
          <div className="text-center px-2 py-1 bg-neutral-950 rounded border border-neutral-800 min-w-[55px] sm:min-w-[70px]">
            <div className="text-[9px] font-bold text-neutral-400 uppercase">AMMO</div>
            <div className="text-lg sm:text-2xl font-black text-amber-400 tracking-wider">{activeAmmoCount}</div>
          </div>

          {/* HEALTH % */}
          <div className="text-center px-2 py-1 bg-neutral-950 rounded border border-neutral-800 min-w-[55px] sm:min-w-[70px]">
            <div className="text-[9px] font-bold text-neutral-400 uppercase">HEALTH</div>
            <div
              className={`text-lg sm:text-2xl font-black tracking-wider ${
                stats.health > 50 ? 'text-amber-400' : stats.health > 20 ? 'text-orange-500' : 'text-red-500 animate-pulse'
              }`}
            >
              {stats.health}%
            </div>
          </div>

          {/* ARMS (Weapon slot indicators 2 3 4 5 6 7) */}
          <div className="hidden md:flex flex-col items-center bg-neutral-950 px-2 py-1 rounded border border-neutral-800">
            <div className="text-[8px] font-bold text-neutral-400 uppercase mb-0.5">ARMS</div>
            <div className="grid grid-cols-3 gap-x-2 gap-y-0.5 text-xs font-black">
              {[2, 3, 4, 5, 6, 7].map((num) => {
                const weaponMap: Record<number, DoomWeaponType> = {
                  2: 'pistol',
                  3: 'shotgun',
                  4: 'chaingun',
                  5: 'rocket',
                  6: 'plasma',
                  7: 'bfg'
                };
                const w = weaponMap[num];
                const owned = stats.weaponsOwned[w];
                const active = stats.weapon === w;
                return (
                  <button
                    key={num}
                    onClick={() => engineRef.current?.setWeapon(w)}
                    className={`px-1 rounded cursor-pointer ${
                      active
                        ? 'text-red-400 font-black underline'
                        : owned
                        ? 'text-amber-400 hover:text-white'
                        : 'text-neutral-700'
                    }`}
                  >
                    {num}
                  </button>
                );
              })}
            </div>
          </div>

          {/* DOOMGUY INTERACTIVE ANIMATED FACE (STFST) */}
          <div className="flex flex-col items-center">{renderDoomGuyFace()}</div>

          {/* ARMOR % */}
          <div className="text-center px-2 py-1 bg-neutral-950 rounded border border-neutral-800 min-w-[55px] sm:min-w-[70px]">
            <div className="text-[9px] font-bold text-neutral-400 uppercase">ARMOR</div>
            <div className="text-lg sm:text-2xl font-black text-amber-400 tracking-wider">{stats.armor}%</div>
          </div>

          {/* KEYCARDS (Blue, Yellow, Red) */}
          <div className="flex flex-col items-center bg-neutral-950 px-2 py-1 rounded border border-neutral-800">
            <div className="text-[8px] font-bold text-neutral-400 uppercase mb-0.5">KEYS</div>
            <div className="flex gap-1.5 items-center">
              <div
                className={`w-3 h-4 rounded-sm border ${
                  stats.keys.blue
                    ? 'bg-blue-500 border-blue-300 shadow-[0_0_8px_rgba(59,130,246,0.8)]'
                    : 'bg-neutral-900 border-neutral-800'
                }`}
                title="Blue Keycard"
              />
              <div
                className={`w-3 h-4 rounded-sm border ${
                  stats.keys.yellow
                    ? 'bg-amber-400 border-amber-200 shadow-[0_0_8px_rgba(245,158,11,0.8)]'
                    : 'bg-neutral-900 border-neutral-800'
                }`}
                title="Yellow Keycard"
              />
              <div
                className={`w-3 h-4 rounded-sm border ${
                  stats.keys.red
                    ? 'bg-red-600 border-red-400 shadow-[0_0_8px_rgba(239,68,68,0.8)]'
                    : 'bg-neutral-900 border-neutral-800'
                }`}
                title="Red Keycard"
              />
            </div>
          </div>

          {/* AMMO MATRIX (Bullets, Shells, Rockets, Cells) */}
          <div className="hidden lg:flex flex-col bg-neutral-950 px-2 py-1 rounded border border-neutral-800 text-[10px] leading-tight">
            <div className="flex justify-between gap-3 text-neutral-400">
              <span>BULL:</span>
              <span className="font-bold text-amber-400">{stats.ammo.bullets}/200</span>
            </div>
            <div className="flex justify-between gap-3 text-neutral-400">
              <span>SHEL:</span>
              <span className="font-bold text-amber-400">{stats.ammo.shells}/50</span>
            </div>
            <div className="flex justify-between gap-3 text-neutral-400">
              <span>RCKT:</span>
              <span className="font-bold text-amber-400">{stats.ammo.rockets}/50</span>
            </div>
            <div className="flex justify-between gap-3 text-neutral-400">
              <span>CELL:</span>
              <span className="font-bold text-amber-400">{stats.ammo.cells}/300</span>
            </div>
          </div>
        </div>

        {/* CONTROLS GUIDE: 360° DRAAIEN & BESTURING */}
        <div className="bg-neutral-950/95 border-t border-neutral-800/80 px-3 py-2 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-neutral-400">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <span className="text-red-400 font-black flex items-center gap-1.5">
              <span>🔄 360° Draaien:</span>
              <span className="text-white bg-neutral-800 px-1.5 py-0.5 rounded border border-neutral-700">◀ ▶ Pijltjes</span>
              <span className="text-neutral-500">of</span>
              <span className="text-white bg-neutral-800 px-1.5 py-0.5 rounded border border-neutral-700">Q / E</span>
              <span className="text-neutral-500">of</span>
              <span className="text-white bg-neutral-800 px-1.5 py-0.5 rounded border border-neutral-700">Sleep Muis/Vinger</span>
            </span>
            <span className="text-neutral-600 hidden sm:inline">•</span>
            <span className="flex items-center gap-1 text-neutral-300">
              <span>Lopen:</span>
              <span className="text-white bg-neutral-800 px-1.5 py-0.5 rounded border border-neutral-700">W / S</span>
              <span className="text-neutral-500">of</span>
              <span className="text-white bg-neutral-800 px-1.5 py-0.5 rounded border border-neutral-700">▲ / ▼</span>
            </span>
            <span className="flex items-center gap-1 text-neutral-300">
              <span>Strafe:</span>
              <span className="text-white bg-neutral-800 px-1.5 py-0.5 rounded border border-neutral-700">A / D</span>
            </span>
            <span className="flex items-center gap-1 text-neutral-300">
              <span>Schieten:</span>
              <span className="text-yellow-400 bg-neutral-800 px-1.5 py-0.5 rounded border border-neutral-700">Ctrl / Klik</span>
            </span>
            <span className="flex items-center gap-1 text-neutral-300">
              <span>Deuren:</span>
              <span className="text-cyan-300 bg-neutral-800 px-1.5 py-0.5 rounded border border-neutral-700">Spatie / F</span>
            </span>
            <span className="text-neutral-600 hidden sm:inline">•</span>
            <span className="flex items-center gap-1 text-green-400 font-bold">
              <span>Kaart:</span>
              <span className="text-white bg-neutral-800 px-1.5 py-0.5 rounded border border-green-700">TAB</span>
            </span>
          </div>

          <div className="text-[10px] text-neutral-500 flex items-center gap-2">
            <span>Cheats:</span>
            <span className="text-amber-400 font-bold bg-neutral-900 px-1 py-0.5 rounded border border-neutral-800">IDDQD</span>
            <span className="text-amber-400 font-bold bg-neutral-900 px-1 py-0.5 rounded border border-neutral-800">IDKFA</span>
          </div>
        </div>
      </div>
    </div>
  );
};
