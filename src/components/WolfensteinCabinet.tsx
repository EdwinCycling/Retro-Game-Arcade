import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Volume2, VolumeX, ArrowLeft, RotateCcw, Trophy, Sparkles, Crosshair, HelpCircle, Shield, Award, Layers } from 'lucide-react';
import { WolfensteinEngine, EngineStats } from '../game/wolfensteinEngine';
import { wolfensteinAudio } from '../game/wolfensteinAudio';
import { getWolfScores, saveWolfScore, WolfScore } from '../game/wolfensteinHighScores';
import { WolfensteinHistoryModal } from './WolfensteinHistoryModal';
import { WolfensteinAutomapModal } from './WolfensteinAutomapModal';
import { GameControlsModal, useGameControls } from './GameControlsModal';

interface WolfensteinCabinetProps {
  onBackToLobby: () => void;
}

export const WolfensteinCabinet: React.FC<WolfensteinCabinetProps> = ({ onBackToLobby }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<WolfensteinEngine | null>(null);

  const [isMuted, setIsMuted] = useState(false);
  const [crtEffect, setCrtEffect] = useState(true);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const { showControls: showControlsHelp, setShowControls: setShowControlsHelp } = useGameControls('wolfenstein');
  const [stats, setStats] = useState<EngineStats>({
    floor: 1,
    floorTitle: 'VERDIEPING 1: KERKER ONTSNAPPING',
    score: 0,
    lives: 3,
    health: 100,
    ammo: 24,
    weapon: 'pistol',
    hasMachinegun: false,
    kills: 0,
    totalGuards: 8,
    secrets: 0,
    totalSecrets: 1,
    treasures: 0,
    totalTreasures: 6,
    gameOver: false,
    victory: false,
  });

  const [highScores, setHighScores] = useState<WolfScore[]>([]);
  const [playerName, setPlayerName] = useState('BJB');
  const [scoreSaved, setScoreSaved] = useState(false);

  // Weapon Animation State in First-Person View
  const [weaponFrame, setWeaponFrame] = useState<'idle' | 'fire1' | 'fire2'>('idle');
  const [showAutomap, setShowAutomap] = useState(false);

  // Initialize Engine
  const initGame = useCallback((targetFloor: number = 1) => {
    if (!containerRef.current) return;
    if (engineRef.current) {
      engineRef.current.destroy();
    }

    setScoreSaved(false);
    const engine = new WolfensteinEngine(containerRef.current, (newStats) => {
      setStats({ ...newStats });
    });
    if (targetFloor > 1) {
      engine.loadFloor(targetFloor);
    }
    engineRef.current = engine;
  }, []);

  useEffect(() => {
    setHighScores(getWolfScores());
    initGame(1);

    return () => {
      if (engineRef.current) {
        engineRef.current.destroy();
      }
    };
  }, [initGame]);

  const toggleSound = () => {
    const next = !isMuted;
    setIsMuted(next);
    wolfensteinAudio.setMuted(next);
  };

  // Keyboard Event Handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!engineRef.current) return;

      if (e.code === 'KeyW' || e.code === 'ArrowUp') {
        engineRef.current.moveForward = true;
      } else if (e.code === 'KeyS' || e.code === 'ArrowDown') {
        engineRef.current.moveBackward = true;
      } else if (e.code === 'KeyA') {
        engineRef.current.strafeLeft = true;
      } else if (e.code === 'KeyD') {
        engineRef.current.strafeRight = true;
      } else if (e.code === 'ArrowLeft' || e.code === 'KeyQ') {
        engineRef.current.turnLeft = true;
      } else if (e.code === 'ArrowRight') {
        engineRef.current.turnRight = true;
      } else if (e.code === 'KeyE' || e.code === 'KeyF' || e.code === 'KeyO' || e.code === 'Enter') {
        e.preventDefault();
        engineRef.current.triggerInteract();
      } else if (e.code === 'Space') {
        e.preventDefault();
        const opened = engineRef.current.triggerInteract();
        if (!opened) {
          fireWeapon();
        }
      } else if (e.code === 'ControlLeft' || e.code === 'ControlRight') {
        e.preventDefault();
        fireWeapon();
      } else if (e.code === 'Digit1') {
        engineRef.current.switchWeapon('knife');
      } else if (e.code === 'Digit2') {
        engineRef.current.switchWeapon('pistol');
      } else if (e.code === 'Digit3') {
        engineRef.current.switchWeapon('machinegun');
      } else if (e.code === 'KeyM' || e.code === 'Tab') {
        e.preventDefault();
        setShowAutomap((prev) => !prev);
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
      } else if (e.code === 'ArrowLeft' || e.code === 'KeyQ') {
        engineRef.current.turnLeft = false;
      } else if (e.code === 'ArrowRight') {
        engineRef.current.turnRight = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const fireWeapon = () => {
    if (!engineRef.current) return;
    if (engineRef.current.weapon !== 'knife' && engineRef.current.ammo <= 0) {
      engineRef.current.triggerShoot();
      return;
    }

    setWeaponFrame('fire1');
    engineRef.current.triggerShoot();
    setTimeout(() => {
      setWeaponFrame('fire2');
      setTimeout(() => {
        setWeaponFrame('idle');
      }, 100);
    }, 70);
  };

  const handleSaveScore = (e: React.FormEvent) => {
    e.preventDefault();
    if (scoreSaved) return;
    const updated = saveWolfScore({
      initials: playerName.slice(0, 3).toUpperCase(),
      name: playerName.trim() || 'B.J. Blazkowicz',
      score: stats.score,
      floor: stats.floor,
      kills: stats.kills,
      secrets: stats.secrets,
      date: new Date().toISOString().split('T')[0],
    });
    setHighScores(updated);
    setScoreSaved(true);
  };

  // B.J. Blazkowicz Animated Face State
  const getBJFace = () => {
    if (stats.gameOver) return '💀';
    if (stats.victory) return '😎';
    if (stats.health > 75) return '😤';
    if (stats.health > 50) return '😠';
    if (stats.health > 25) return '🤕';
    return '🩸';
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-neutral-100 flex flex-col items-center justify-between p-2 sm:p-4 select-none font-mono">
      {/* Top Header Controls */}
      <header className="w-full max-w-5xl flex items-center justify-between gap-2 px-3 py-2 bg-neutral-900/90 rounded-2xl border border-neutral-700/80 shadow-lg">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBackToLobby}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold border border-neutral-600 transition-all cursor-pointer active:scale-95"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Arcade Lobby</span>
          </button>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-gradient-to-r from-blue-600 via-indigo-500 to-red-600 text-white shadow-[0_0_12px_rgba(59,130,246,0.6)]">
              🏰 WOLFENSTEIN 3D (1992)
            </span>
            <span className="hidden md:inline text-xs text-neutral-400">
              Verdieping {stats.floor}/3 • id Software
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick Floor Selector Buttons */}
          <div className="flex items-center bg-neutral-950 p-1 rounded-xl border border-neutral-800 gap-1">
            <span className="text-[10px] text-neutral-400 font-bold px-1.5 hidden sm:inline">FLOOR:</span>
            {[1, 2, 3].map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => {
                  if (engineRef.current) {
                    engineRef.current.loadFloor(f);
                  }
                }}
                className={`px-2 py-0.5 text-xs font-bold rounded-lg cursor-pointer transition-all ${
                  stats.floor === f
                    ? 'bg-red-600 text-white shadow-[0_0_8px_rgba(239,68,68,0.7)]'
                    : 'bg-neutral-800 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-700'
                }`}
                title={f === 1 ? 'Kerker' : f === 2 ? 'Blauw Bastion (SS & Honden)' : 'Boss Hans Grosse'}
              >
                {f === 3 ? '👑 3' : f}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setShowAutomap(!showAutomap)}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-colors cursor-pointer flex items-center gap-1.5 ${
              showAutomap
                ? 'bg-emerald-950/90 text-emerald-300 border-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]'
                : 'bg-neutral-800 text-neutral-300 border-neutral-700 hover:bg-neutral-700'
            }`}
          >
            <span>🗺️</span>
            <span className="hidden sm:inline">Kaart (M)</span>
          </button>
          <button
            type="button"
            onClick={() => setCrtEffect(!crtEffect)}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
              crtEffect
                ? 'bg-cyan-950/80 text-cyan-300 border-cyan-600 shadow-[0_0_8px_rgba(6,182,212,0.4)]'
                : 'bg-neutral-800 text-neutral-400 border-neutral-700'
            }`}
          >
            CRT {crtEffect ? 'ON' : 'OFF'}
          </button>
          <button
            type="button"
            onClick={toggleSound}
            className="p-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-neutral-700 cursor-pointer"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>
          <button
            type="button"
            onClick={() => setShowControlsHelp(!showControlsHelp)}
            className="p-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-neutral-700 cursor-pointer"
          >
            <HelpCircle className="w-4 h-4 text-yellow-400" />
          </button>
          <button
            type="button"
            onClick={() => setIsHistoryOpen(true)}
            className="px-2.5 py-1.5 rounded-xl bg-blue-950/80 hover:bg-blue-900/90 text-blue-300 text-xs font-bold border border-blue-700 cursor-pointer flex items-center gap-1 shadow-[0_0_10px_rgba(59,130,246,0.3)]"
          >
            <span>Dossier</span>
          </button>
        </div>
      </header>

      {/* Main 3D Viewport Cabinet Frame */}
      <main className="relative w-full max-w-5xl my-2 flex-1 flex flex-col items-center justify-center">
        <div className="relative w-full aspect-[4/3] max-h-[640px] bg-black rounded-2xl overflow-hidden border-4 border-neutral-800 shadow-[0_0_50px_rgba(0,0,0,0.9)] flex flex-col">
          {/* Three.js Canvas Container */}
          <div
            ref={containerRef}
            onClick={() => {
              if (stats.canInteract) {
                engineRef.current?.triggerInteract();
              } else {
                fireWeapon();
              }
            }}
            className="relative w-full flex-1 overflow-hidden cursor-crosshair"
          />

          {/* Epic Boss Health Bar (Floor 3) */}
          {stats.floor === 3 && stats.bossHp !== undefined && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 w-80 max-w-[90%] bg-neutral-950/90 border-2 border-red-600 rounded-xl p-2 shadow-[0_0_20px_rgba(220,38,38,0.7)] flex flex-col items-center">
              <div className="flex items-center justify-between w-full text-[11px] font-black text-red-400 mb-1">
                <span className="flex items-center gap-1">
                  <span>🎖️</span>
                  <span>BEVELHEBBER HANS GROSSE</span>
                </span>
                <span className="text-yellow-400">
                  {stats.bossHp > 0 ? `${stats.bossHp} HP` : 'VERSLAGEN!'}
                </span>
              </div>
              <div className="w-full h-3 bg-neutral-900 rounded-full overflow-hidden border border-neutral-700">
                <div
                  className="h-full bg-gradient-to-r from-red-600 via-orange-500 to-yellow-400 transition-all duration-150"
                  style={{
                    width: `${Math.max(0, ((stats.bossHp || 0) / (stats.bossMaxHp || 450)) * 100)}%`,
                  }}
                />
              </div>
            </div>
          )}

          {/* Floor Announcement Banner */}
          {stats.floorAnnouncement && (
            <div className="absolute top-16 left-1/2 -translate-x-1/2 z-20 pointer-events-none text-center bg-black/85 border-2 border-yellow-400/80 rounded-2xl px-6 py-3 shadow-[0_0_30px_rgba(234,179,8,0.6)] animate-in fade-in zoom-in duration-300">
              <div className="text-yellow-400 font-black text-sm sm:text-base tracking-wider whitespace-pre-line">
                {stats.floorAnnouncement}
              </div>
            </div>
          )}

          {/* Prompt banner when facing a door or secret wall */}
          {stats.canInteract && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 translate-y-12 z-20 flex flex-col items-center">
              <button
                type="button"
                onClick={() => engineRef.current?.triggerInteract()}
                className="px-4 py-2.5 rounded-xl bg-neutral-950/95 border-2 border-yellow-400 text-yellow-300 font-mono font-black text-xs sm:text-sm tracking-wider shadow-[0_0_30px_rgba(234,179,8,0.85)] animate-bounce cursor-pointer hover:bg-yellow-400 hover:text-black transition-all flex items-center gap-2 select-none"
              >
                <span className="text-lg">🚪</span>
                <span>[ SPATIE ] of [ E ] : {stats.interactPrompt || 'ACTIE'}</span>
              </button>
            </div>
          )}

          {/* First-Person Weapon Sprite Overlay */}
          <div className="absolute bottom-16 left-1/2 -translate-x-1/2 pointer-events-none select-none z-10 flex flex-col items-center">
            {stats.weapon === 'pistol' && (
              <div className="relative flex flex-col items-center">
                {weaponFrame !== 'idle' && (
                  <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-16 h-16 bg-gradient-to-t from-yellow-300 via-orange-500 to-transparent rounded-full blur-[2px] animate-pulse flex items-center justify-center">
                    <span className="text-white text-3xl font-black">💥</span>
                  </div>
                )}
                {/* Pistol Sprite Silhouette */}
                <div
                  className={`transition-transform duration-75 ${
                    weaponFrame === 'fire1'
                      ? '-translate-y-4 scale-110'
                      : weaponFrame === 'fire2'
                      ? '-translate-y-2'
                      : ''
                  }`}
                >
                  <div className="w-24 h-28 bg-gradient-to-t from-neutral-900 via-neutral-700 to-neutral-500 rounded-t-lg border-2 border-black shadow-2xl relative flex items-center justify-center">
                    <div className="w-4 h-16 bg-neutral-400 border-x border-black absolute top-0" />
                    <span className="text-[10px] text-yellow-300 font-bold tracking-widest uppercase mt-8">
                      LUGER
                    </span>
                  </div>
                </div>
              </div>
            )}

            {stats.weapon === 'machinegun' && (
              <div className="relative flex flex-col items-center">
                {weaponFrame !== 'idle' && (
                  <div className="absolute -top-14 left-1/2 -translate-x-1/2 w-20 h-20 bg-gradient-to-t from-yellow-200 via-red-500 to-transparent rounded-full blur-[2px] flex items-center justify-center">
                    <span className="text-white text-4xl font-black">🔥</span>
                  </div>
                )}
                <div
                  className={`transition-transform duration-75 ${
                    weaponFrame !== 'idle' ? '-translate-y-3 scale-105' : ''
                  }`}
                >
                  <div className="w-32 h-28 bg-gradient-to-t from-neutral-900 via-neutral-800 to-blue-900 rounded-t-xl border-2 border-black shadow-2xl relative flex items-center justify-center">
                    <div className="w-8 h-20 bg-neutral-300 border-x-2 border-black absolute top-0" />
                    <span className="text-[10px] text-cyan-300 font-bold tracking-widest uppercase mt-8">
                      MP-40
                    </span>
                  </div>
                </div>
              </div>
            )}

            {stats.weapon === 'knife' && (
              <div
                className={`transition-transform duration-100 ${
                  weaponFrame !== 'idle' ? '-translate-y-6 rotate-12' : ''
                }`}
              >
                <div className="w-10 h-32 bg-gradient-to-t from-amber-900 via-neutral-300 to-white rounded-t-full border border-black shadow-xl" />
              </div>
            )}
          </div>

          {/* Damage Hurt Flash Effect */}
          {stats.health < 100 && (
            <div
              className={`absolute inset-0 pointer-events-none transition-opacity duration-150 ${
                stats.health < 30 ? 'bg-red-600/30' : 'bg-transparent'
              }`}
            />
          )}

          {/* CRT Scanline Filter */}
          {crtEffect && (
            <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.35)_50%)] bg-[length:100%_4px] opacity-70 z-20" />
          )}

          {/* Crosshair Center */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
            <Crosshair className="w-6 h-6 text-white/35" />
          </div>

          {/* Controls Help Overlay Modal */}
          {showControlsHelp && (
            <div className="absolute inset-0 bg-black/85 z-30 flex items-center justify-center p-4">
              <div className="bg-neutral-900 border-2 border-yellow-500 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-[0_0_30px_rgba(234,179,8,0.4)]">
                <h3 className="text-xl font-black text-yellow-400 flex items-center gap-2">
                  <span>🕹️</span>
                  <span>BESTURING WOLFENSTEIN 3D</span>
                </h3>
                <div className="space-y-2 text-xs text-neutral-300 font-mono leading-relaxed">
                  <div className="flex justify-between border-b border-neutral-800 pb-1">
                    <span className="text-cyan-400 font-bold">W / S of Pijltjes:</span>
                    <span>Vooruit & Achteruit lopen</span>
                  </div>
                  <div className="flex justify-between border-b border-neutral-800 pb-1">
                    <span className="text-cyan-400 font-bold">A / D:</span>
                    <span>Zijwaarts bewegen (Strafe)</span>
                  </div>
                  <div className="flex justify-between border-b border-neutral-800 pb-1">
                    <span className="text-cyan-400 font-bold">Pijltjes L/R of Q:</span>
                    <span>3D Rondkijken & Draaien</span>
                  </div>
                  <div className="flex justify-between border-b border-neutral-800 pb-1">
                    <span className="text-emerald-400 font-bold">SPATIE of E / F / ENTER:</span>
                    <span className="font-bold text-yellow-300">🚪 Deur openen & Geheimen</span>
                  </div>
                  <div className="flex justify-between border-b border-neutral-800 pb-1">
                    <span className="text-yellow-400 font-bold">CTRL of Muisklik:</span>
                    <span>Wapen afvuren</span>
                  </div>
                  <div className="flex justify-between border-b border-neutral-800 pb-1">
                    <span className="text-indigo-400 font-bold">Toets 1 / 2 / 3:</span>
                    <span>Mes / Pistool / Machinegeweer</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowControlsHelp(false)}
                  className="w-full py-2.5 bg-yellow-500 hover:bg-yellow-400 text-black font-black text-xs rounded-xl transition-all cursor-pointer"
                >
                  BEGREPEN, GA VERDER
                </button>
              </div>
            </div>
          )}

          {/* Game Over Screen */}
          {stats.gameOver && (
            <div className="absolute inset-0 bg-red-950/90 z-30 flex flex-col items-center justify-center p-6 text-center space-y-4">
              <span className="text-5xl animate-bounce">💀</span>
              <h2 className="text-3xl sm:text-4xl font-black text-red-500 tracking-wider">
                GESTUURD NAAR HET DODENRIJK!
              </h2>
              <p className="text-xs sm:text-sm text-neutral-300 max-w-sm">
                Je bent gesneuveld op verdieping {stats.floor}. Je score: {stats.score.toLocaleString()} punten.
              </p>

              {!scoreSaved ? (
                <form onSubmit={handleSaveScore} className="flex gap-2">
                  <input
                    type="text"
                    maxLength={3}
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value.toUpperCase())}
                    className="px-3 py-2 bg-neutral-900 border border-red-500 rounded-xl text-center text-lg font-black text-yellow-400 w-24 uppercase"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-black rounded-xl cursor-pointer transition-all"
                  >
                    SCORE OPSLAAN
                  </button>
                </form>
              ) : (
                <span className="text-xs text-emerald-400 font-bold">✓ Score geregistreerd!</span>
              )}

              <button
                type="button"
                onClick={() => initGame(stats.floor)}
                className="px-6 py-3 bg-yellow-500 hover:bg-yellow-400 text-black font-black text-xs rounded-xl shadow-lg cursor-pointer transition-all active:scale-95 flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>OPNIEUW PROBEREN</span>
              </button>
            </div>
          )}

          {/* Victory Screen */}
          {stats.victory && (
            <div className="absolute inset-0 bg-blue-950/95 z-30 flex flex-col items-center justify-center p-6 text-center space-y-4">
              <span className="text-5xl animate-bounce">🏆</span>
              <h2 className="text-3xl sm:text-4xl font-black text-yellow-400 tracking-wider">
                CASTLE HOLLEHAMMER ONTSNAPT!
              </h2>
              <p className="text-xs text-blue-200">
                Hans Grosse is verslagen en alle 3 verdiepingen zijn overwonnen!
              </p>
              <div className="grid grid-cols-3 gap-3 max-w-sm w-full py-2 font-mono text-xs">
                <div className="p-2 rounded bg-neutral-900/80 border border-neutral-700">
                  <div className="text-neutral-400">VIJANDEN</div>
                  <div className="text-yellow-400 font-black text-base">
                    {Math.round((stats.kills / Math.max(1, stats.totalGuards)) * 100)}%
                  </div>
                </div>
                <div className="p-2 rounded bg-neutral-900/80 border border-neutral-700">
                  <div className="text-neutral-400">GEHEIMEN</div>
                  <div className="text-cyan-400 font-black text-base">
                    {stats.secrets}/{stats.totalSecrets}
                  </div>
                </div>
                <div className="p-2 rounded bg-neutral-900/80 border border-neutral-700">
                  <div className="text-neutral-400">SCHATTEN</div>
                  <div className="text-emerald-400 font-black text-base">
                    {stats.treasures}/{stats.totalTreasures}
                  </div>
                </div>
              </div>

              {!scoreSaved ? (
                <form onSubmit={handleSaveScore} className="flex gap-2">
                  <input
                    type="text"
                    maxLength={3}
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value.toUpperCase())}
                    className="px-3 py-2 bg-neutral-900 border border-yellow-500 rounded-xl text-center text-lg font-black text-yellow-400 w-24 uppercase"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-black text-xs font-black rounded-xl cursor-pointer transition-all"
                  >
                    OPSLAAN
                  </button>
                </form>
              ) : (
                <span className="text-xs text-emerald-400 font-bold">✓ Score geregistreerd!</span>
              )}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => initGame(1)}
                  className="px-6 py-3 bg-yellow-500 hover:bg-yellow-400 text-black font-black text-xs rounded-xl shadow-lg cursor-pointer transition-all active:scale-95"
                >
                  HERSTARTEN (V1)
                </button>
                <button
                  type="button"
                  onClick={onBackToLobby}
                  className="px-6 py-3 bg-neutral-800 hover:bg-neutral-700 text-white font-black text-xs rounded-xl cursor-pointer transition-all"
                >
                  TERUG NAAR HAL
                </button>
              </div>
            </div>
          )}

          {/* Authentic Wolfenstein 3D Bottom DOS HUD */}
          <div className="h-16 bg-[#0000a8] border-t-4 border-[#000054] grid grid-cols-7 items-center px-2 sm:px-4 text-center select-none z-10">
            {/* 1. Floor */}
            <div className="border-r-2 border-[#000054] px-1">
              <div className="text-[9px] text-[#a8a8a8] font-black uppercase">FLOOR</div>
              <div className="text-sm sm:text-base font-black text-yellow-300 font-mono">
                {stats.floor}/3
              </div>
            </div>

            {/* 2. Score */}
            <div className="border-r-2 border-[#000054] px-1 col-span-2">
              <div className="text-[9px] text-[#a8a8a8] font-black uppercase">SCORE</div>
              <div className="text-sm sm:text-base font-black text-yellow-300 font-mono">
                {stats.score.toString().padStart(6, '0')}
              </div>
            </div>

            {/* 3. Lives */}
            <div className="border-r-2 border-[#000054] px-1">
              <div className="text-[9px] text-[#a8a8a8] font-black uppercase">LIVES</div>
              <div className="text-sm sm:text-base font-black text-yellow-300 font-mono">
                {stats.lives}
              </div>
            </div>

            {/* 4. B.J. Face */}
            <div className="border-r-2 border-[#000054] px-1 flex flex-col items-center justify-center">
              <div className="w-9 h-9 bg-neutral-900 rounded border border-neutral-700 flex items-center justify-center text-xl shadow-inner">
                {getBJFace()}
              </div>
            </div>

            {/* 5. Health */}
            <div className="border-r-2 border-[#000054] px-1">
              <div className="text-[9px] text-[#a8a8a8] font-black uppercase">HEALTH</div>
              <div
                className={`text-sm sm:text-base font-black font-mono ${
                  stats.health < 25 ? 'text-red-500 animate-pulse' : 'text-yellow-300'
                }`}
              >
                {stats.health}%
              </div>
            </div>

            {/* 6. Ammo */}
            <div className="px-1">
              <div className="text-[9px] text-[#a8a8a8] font-black uppercase">AMMO</div>
              <div className="text-sm sm:text-base font-black text-yellow-300 font-mono">
                {stats.weapon === 'knife' ? '∞' : stats.ammo}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Touch Controls Bar */}
        <div className="w-full mt-3 flex flex-wrap items-center justify-between gap-2 md:hidden">
          {/* Movement buttons */}
          <div className="grid grid-cols-3 gap-1">
            <div />
            <button
              type="button"
              onPointerDown={() => {
                if (engineRef.current) engineRef.current.moveForward = true;
              }}
              onPointerUp={() => {
                if (engineRef.current) engineRef.current.moveForward = false;
              }}
              className="w-12 h-10 bg-neutral-800 border border-neutral-600 rounded-lg flex items-center justify-center text-white font-black active:bg-neutral-700"
            >
              ▲
            </button>
            <div />
            <button
              type="button"
              onPointerDown={() => {
                if (engineRef.current) engineRef.current.turnLeft = true;
              }}
              onPointerUp={() => {
                if (engineRef.current) engineRef.current.turnLeft = false;
              }}
              className="w-12 h-10 bg-neutral-800 border border-neutral-600 rounded-lg flex items-center justify-center text-white font-black active:bg-neutral-700"
            >
              ◀
            </button>
            <button
              type="button"
              onPointerDown={() => {
                if (engineRef.current) engineRef.current.moveBackward = true;
              }}
              onPointerUp={() => {
                if (engineRef.current) engineRef.current.moveBackward = false;
              }}
              className="w-12 h-10 bg-neutral-800 border border-neutral-600 rounded-lg flex items-center justify-center text-white font-black active:bg-neutral-700"
            >
              ▼
            </button>
            <button
              type="button"
              onPointerDown={() => {
                if (engineRef.current) engineRef.current.turnRight = true;
              }}
              onPointerUp={() => {
                if (engineRef.current) engineRef.current.turnRight = false;
              }}
              className="w-12 h-10 bg-neutral-800 border border-neutral-600 rounded-lg flex items-center justify-center text-white font-black active:bg-neutral-700"
            >
              ▶
            </button>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                if (engineRef.current) engineRef.current.triggerInteract();
              }}
              className={`px-4 py-3 ${
                stats.canInteract
                  ? 'bg-yellow-400 text-black font-black animate-pulse shadow-[0_0_20px_rgba(250,204,21,0.9)] scale-105'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white font-black'
              } text-xs rounded-xl shadow active:scale-95 transition-all flex items-center gap-1.5`}
            >
              <span>🚪</span>
              <span>{stats.canInteract ? stats.interactPrompt || 'OPEN' : 'OPEN'}</span>
            </button>
            <button
              type="button"
              onClick={fireWeapon}
              className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white font-black text-sm rounded-xl shadow-[0_0_15px_rgba(220,38,38,0.6)] active:scale-95 flex items-center gap-1"
            >
              <span>VUUR</span>
            </button>
          </div>
        </div>
      </main>

      {/* Bottom Leaderboard Quick Strip */}
      <footer className="w-full max-w-5xl bg-neutral-900/80 rounded-xl p-3 border border-neutral-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-yellow-400 font-bold">
          <Trophy className="w-4 h-4" />
          <span>WOLFENSTEIN 3D TOP SCORES:</span>
        </div>
        <div className="flex flex-wrap items-center gap-4 text-neutral-300 font-mono">
          {highScores.slice(0, 3).map((s, idx) => (
            <span key={s.id} className="flex items-center gap-1">
              <span className="text-neutral-500">#{idx + 1}</span>
              <span className="font-bold text-white">{s.initials}</span>
              <span className="text-yellow-400">{s.score.toLocaleString()}</span>
            </span>
          ))}
        </div>
      </footer>

      {/* Tactical Automap Radar Modal */}
      {showAutomap && (
        <WolfensteinAutomapModal
          engine={engineRef.current}
          onClose={() => setShowAutomap(false)}
        />
      )}

      {/* History & Technical Dossier Modal */}
      <WolfensteinHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
      />

      {/* Game Controls & Xbox Modal */}
      <GameControlsModal
        isOpen={showControlsHelp}
        onClose={() => setShowControlsHelp(false)}
        gameId="wolfenstein"
      />
    </div>
  );
};
