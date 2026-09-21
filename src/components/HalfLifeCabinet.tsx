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
  Zap,
  Info,
  Mouse,
  HelpCircle,
  Maximize,
  Radio,
  Tv
} from 'lucide-react';
import { HalfLifeEngine, HalfLifeStats, HalfLifeWeapon } from '../game/halfLifeEngine';
import { halfLifeAudio } from '../game/halfLifeAudio';
import { getHalfLifeScores, saveHalfLifeScore, HalfLifeHighScore } from '../game/halfLifeHighScores';
import { HalfLifeLandingPage } from './HalfLifeLandingPage';

interface HalfLifeCabinetProps {
  onBackToLobby: () => void;
}

export const HalfLifeCabinet: React.FC<HalfLifeCabinetProps> = ({ onBackToLobby }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<HalfLifeEngine | null>(null);

  const [isMuted, setIsMuted] = useState(false);
  const [showLandingPage, setShowLandingPage] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showPointerLockTip, setShowPointerLockTip] = useState(true);

  // High Scores & Name entry
  const [highScores, setHighScores] = useState<HalfLifeHighScore[]>([]);
  const [playerName, setPlayerName] = useState('FREEMAN');
  const [scoreSaved, setScoreSaved] = useState(false);

  // Engine Stats
  const [stats, setStats] = useState<HalfLifeStats>({
    health: 100,
    armor: 45,
    score: 0,
    kills: 0,
    activeWeapon: 'crowbar',
    ammo: {
      bullets: 50,
      shells: 16,
      grenades: 2
    },
    magazine: {
      bullets: 17,
      shells: 8,
      mp5: 50
    },
    flashlightOn: true,
    isGameOver: false,
    victory: false,
    alertText: 'HEV MARK IV SUIT: ONLINE. SECTOR C HAZARD LEVEL HIGH.'
  });

  // Initialize Game Engine
  const initGame = useCallback(() => {
    if (!containerRef.current) return;
    if (engineRef.current) {
      engineRef.current.destroy();
    }

    setScoreSaved(false);
    const engine = new HalfLifeEngine(containerRef.current, (newStats) => {
      setStats({ ...newStats });
    });
    engineRef.current = engine;
  }, []);

  useEffect(() => {
    setHighScores(getHalfLifeScores());
    if (!showLandingPage) {
      initGame();
    }

    return () => {
      if (engineRef.current) {
        engineRef.current.destroy();
      }
    };
  }, [initGame, showLandingPage]);

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
    halfLifeAudio.setMuted(next);
  };

  const handleSaveScore = () => {
    if (scoreSaved) return;
    const updated = saveHalfLifeScore({
      name: playerName.toUpperCase().trim() || 'G.FREEMAN',
      score: stats.score,
      timeSeconds: 95,
      kills: stats.kills,
      accuracy: 85
    });
    setHighScores(updated);
    setScoreSaved(true);
  };

  // If user opened the full Landing Page
  if (showLandingPage) {
    return (
      <div className="w-full min-h-screen bg-black flex items-center justify-center p-4">
        <HalfLifeLandingPage
          onPlay={() => setShowLandingPage(false)}
          onBackToLobby={onBackToLobby}
        />
      </div>
    );
  }

  return (
    <div className="relative w-full max-w-7xl mx-auto min-h-screen flex flex-col items-center justify-center p-2 sm:p-4 select-none">
      {/* Top Controls Header */}
      <div className="w-full flex items-center justify-between px-4 py-2.5 bg-neutral-900/90 border border-orange-600/40 rounded-t-xl text-neutral-200 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToLobby}
            className="flex items-center gap-1.5 px-3 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors text-xs font-mono border border-neutral-700"
          >
            <ArrowLeft className="w-4 h-4 text-orange-400" />
            Lobby
          </button>

          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded bg-orange-600 flex items-center justify-center font-bold text-white text-xs">
              λ
            </span>
            <span className="font-mono font-bold tracking-wider text-orange-400 text-sm hidden sm:inline">
              HALF-LIFE (1998) • 1920x1280 FULL HD
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowLandingPage(true)}
            className="flex items-center gap-1.5 px-3 py-1 rounded bg-orange-950/80 hover:bg-orange-900 border border-orange-600/50 text-orange-300 text-xs font-mono transition-colors"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Landing Page / Dossier</span>
          </button>

          <button
            onClick={() => setShowHelpModal(true)}
            className="p-1.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors"
            title="Hulp & Besturing"
          >
            <HelpCircle className="w-4 h-4 text-orange-400" />
          </button>

          <button
            onClick={toggleSound}
            className="p-1.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors"
            title={isMuted ? 'Geluid Aan' : 'Geluid Uit'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-green-400" />}
          </button>

          <button
            onClick={initGame}
            className="p-1.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors"
            title="Herstart Level"
          >
            <RotateCcw className="w-4 h-4 text-amber-400" />
          </button>
        </div>
      </div>

      {/* Main 3D Viewport with 1920x1280 Aspect Ratio Framing */}
      <div className="relative w-full aspect-[16/10] max-h-[80vh] bg-black border-x border-orange-600/40 overflow-hidden group">
        {/* Three.js Canvas Container */}
        <div ref={containerRef} className="w-full h-full cursor-crosshair" />

        {/* Dynamic Crosshair in Center */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div className="relative w-8 h-8 flex items-center justify-center">
            {/* 4 Bracket Corners (Authentic Half-Life HUD) */}
            <div className="absolute top-0 left-0 w-2.5 h-2.5 border-t-2 border-l-2 border-orange-400 opacity-80" />
            <div className="absolute top-0 right-0 w-2.5 h-2.5 border-t-2 border-r-2 border-orange-400 opacity-80" />
            <div className="absolute bottom-0 left-0 w-2.5 h-2.5 border-b-2 border-l-2 border-orange-400 opacity-80" />
            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b-2 border-r-2 border-orange-400 opacity-80" />
            <div className="w-1 h-1 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,1)]" />
          </div>
        </div>

        {/* First-Time Pointer Lock Instruction Banner */}
        {showPointerLockTip && (
          <div
            onClick={() => setShowPointerLockTip(false)}
            className="absolute top-4 left-1/2 -translate-x-1/2 bg-neutral-950/90 border border-orange-500/60 px-5 py-2.5 rounded-xl shadow-[0_0_20px_rgba(234,88,12,0.4)] flex items-center gap-3 backdrop-blur-md cursor-pointer animate-bounce z-20"
          >
            <Mouse className="w-5 h-5 text-orange-400" />
            <span className="text-xs font-mono text-neutral-200">
              <strong className="text-orange-400">Klik op het scherm</strong> om de muis vast te zetten (Pointer Lock) voor 360° PC aiming!
            </span>
          </div>
        )}

        {/* HEV Suit Voice Alert Subtitle Banner */}
        {stats.alertText && (
          <div className="absolute top-4 right-4 max-w-sm bg-neutral-950/80 border border-orange-600/40 px-3.5 py-1.5 rounded-lg text-xs font-mono text-orange-300 backdrop-blur-md">
            <span className="text-orange-500 font-bold">HEV // </span>
            {stats.alertText}
          </div>
        )}

        {/* Victory Screen Overlay */}
        {stats.victory && (
          <div className="absolute inset-0 bg-neutral-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6 z-30 animate-fade-in">
            <div className="w-16 h-16 rounded-2xl bg-orange-600 flex items-center justify-center text-white text-3xl font-black mb-4 shadow-[0_0_30px_rgba(234,88,12,0.8)]">
              λ
            </div>
            <h2 className="text-3xl font-black font-mono text-white tracking-wider mb-2">
              SECTOR C OMRUIMING VOLTOOID
            </h2>
            <p className="text-orange-400 text-sm font-mono mb-6">
              ALLE XEN-DREIGINGEN UITGESCHAKELD • BLACK MESA GEDEOSMETEERD
            </p>

            <div className="bg-neutral-900 p-6 rounded-xl border border-neutral-800 max-w-md w-full mb-6 font-mono text-sm space-y-2">
              <div className="flex justify-between text-neutral-300">
                <span>Eindscore:</span>
                <span className="text-amber-400 font-bold">{stats.score.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-neutral-300">
                <span>Vijanden Geneutraliseerd:</span>
                <span className="text-red-400 font-bold">{stats.kills}</span>
              </div>
              <div className="flex justify-between text-neutral-300">
                <span>Resterende Gezondheid:</span>
                <span className="text-green-400 font-bold">{stats.health}%</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="text"
                maxLength={10}
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="UW NAAM"
                disabled={scoreSaved}
                className="bg-neutral-800 border border-neutral-700 text-white font-mono px-4 py-2 rounded-lg text-sm w-36 text-center uppercase"
              />
              <button
                onClick={handleSaveScore}
                disabled={scoreSaved}
                className="px-5 py-2 rounded-lg bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white font-mono text-sm font-bold transition-all"
              >
                {scoreSaved ? 'Opgeslagen!' : 'Score Opslaan'}
              </button>
              <button
                onClick={initGame}
                className="px-5 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white font-mono text-sm transition-all"
              >
                Opnieuw Spelen
              </button>
            </div>
          </div>
        )}

        {/* Game Over Screen Overlay */}
        {stats.isGameOver && (
          <div className="absolute inset-0 bg-red-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6 z-30 animate-fade-in">
            <h2 className="text-4xl font-black font-mono text-red-500 tracking-wider mb-2">
              ONDERZOEKER GESNEUVELD
            </h2>
            <p className="text-neutral-300 text-sm font-mono mb-6">
              LEVENSTEKENS GESTOPT • ONDERWERPING DOOR XEN PARASIETEN
            </p>

            <div className="bg-neutral-900/90 p-6 rounded-xl border border-neutral-800 max-w-sm w-full mb-6 font-mono text-sm space-y-2">
              <div className="flex justify-between text-neutral-300">
                <span>Behaalde Score:</span>
                <span className="text-amber-400 font-bold">{stats.score}</span>
              </div>
              <div className="flex justify-between text-neutral-300">
                <span>Kills:</span>
                <span className="text-red-400 font-bold">{stats.kills}</span>
              </div>
            </div>

            <button
              onClick={initGame}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white font-mono font-bold tracking-wider text-sm transition-all shadow-[0_0_25px_rgba(234,88,12,0.8)]"
            >
              HERLAAST SUIT BIJ LAATSTE CHECKPOINT
            </button>
          </div>
        )}
      </div>

      {/* Authentic Half-Life Orange HUD Status Bar */}
      <div className="w-full bg-neutral-950 border border-orange-600/40 rounded-b-xl px-6 py-4 flex flex-wrap items-center justify-between gap-6 shadow-[0_10px_30px_rgba(0,0,0,0.8)]">
        {/* Left: Health & HEV Suit Power */}
        <div className="flex items-center gap-8 font-mono">
          {/* Health */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-orange-950/80 border border-orange-500/60 flex items-center justify-center text-orange-400 text-xl font-bold">
              +
            </div>
            <div>
              <div className="text-[10px] tracking-widest text-orange-500/80 font-bold">GEZONDHEID</div>
              <div className="text-3xl font-black tracking-tight text-orange-400 drop-shadow-[0_0_8px_rgba(249,115,22,0.6)]">
                {stats.health}
              </div>
            </div>
          </div>

          {/* HEV Suit Armor */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-orange-950/80 border border-orange-500/60 flex items-center justify-center text-orange-400">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] tracking-widest text-orange-500/80 font-bold">SUIT PANTSER</div>
              <div className="text-3xl font-black tracking-tight text-orange-400 drop-shadow-[0_0_8px_rgba(249,115,22,0.6)]">
                {stats.armor}
              </div>
            </div>
          </div>
        </div>

        {/* Center: Weapon Selector Ribbon */}
        <div className="flex items-center gap-2 bg-neutral-900/80 p-1.5 rounded-xl border border-neutral-800">
          {(['crowbar', 'glock', 'shotgun', 'mp5'] as HalfLifeWeapon[]).map((w, idx) => {
            const isActive = stats.activeWeapon === w;
            const icons: Record<HalfLifeWeapon, string> = {
              crowbar: '🔴 [1] Koevoet',
              glock: '🔫 [2] Glock',
              shotgun: '💥 [3] Shotgun',
              mp5: '⚡ [4] MP5'
            };

            return (
              <button
                key={w}
                onClick={() => engineRef.current?.switchWeapon(w)}
                className={`px-3 py-1.5 rounded-lg font-mono text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-orange-600 text-white shadow-[0_0_12px_rgba(234,88,12,0.6)]'
                    : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800'
                }`}
              >
                {icons[w]}
              </button>
            );
          })}
        </div>

        {/* Right: Ammo Counter */}
        <div className="flex items-center gap-6 font-mono">
          {stats.activeWeapon !== 'crowbar' && (
            <div className="text-right">
              <div className="text-[10px] tracking-widest text-orange-500/80 font-bold">MUNITIE</div>
              <div className="text-3xl font-black text-orange-400 drop-shadow-[0_0_8px_rgba(249,115,22,0.6)]">
                {stats.activeWeapon === 'glock' && `${stats.magazine.bullets} / ${stats.ammo.bullets}`}
                {stats.activeWeapon === 'shotgun' && `${stats.magazine.shells} / ${stats.ammo.shells}`}
                {stats.activeWeapon === 'mp5' && `${stats.magazine.mp5} / ${stats.ammo.bullets}`}
              </div>
            </div>
          )}

          {stats.activeWeapon === 'mp5' && (
            <div className="text-right border-l border-neutral-800 pl-4">
              <div className="text-[10px] tracking-widest text-amber-500 font-bold">GRANATEN</div>
              <div className="text-2xl font-black text-amber-400">
                {stats.ammo.grenades}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Help Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-neutral-900 border border-orange-600/40 rounded-2xl max-w-lg w-full p-6 space-y-4 font-mono">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h3 className="text-lg font-bold text-orange-400 flex items-center gap-2">
                <HelpCircle className="w-5 h-5" />
                Half-Life PC Besturingsgids
              </h3>
              <button
                onClick={() => setShowHelpModal(false)}
                className="text-neutral-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 text-xs text-neutral-300">
              <div className="flex justify-between py-1 border-b border-neutral-800">
                <span>Richten & Kijken</span>
                <span className="text-orange-400 font-bold">Muis (Pointer Lock)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-neutral-800">
                <span>Bewegen</span>
                <span className="text-orange-400 font-bold">W / A / S / D</span>
              </div>
              <div className="flex justify-between py-1 border-b border-neutral-800">
                <span>Primair Vuren / Slaan</span>
                <span className="text-orange-400 font-bold">Linkermuisknop</span>
              </div>
              <div className="flex justify-between py-1 border-b border-neutral-800">
                <span>Secundair Vuren (Shotgun Blast / Granaat)</span>
                <span className="text-orange-400 font-bold">Rechtermuisknop</span>
              </div>
              <div className="flex justify-between py-1 border-b border-neutral-800">
                <span>Springen</span>
                <span className="text-orange-400 font-bold">Spatiebalk</span>
              </div>
              <div className="flex justify-between py-1 border-b border-neutral-800">
                <span>Sprinten</span>
                <span className="text-orange-400 font-bold">Linker Shift</span>
              </div>
              <div className="flex justify-between py-1 border-b border-neutral-800">
                <span>Bukken (Crouch)</span>
                <span className="text-orange-400 font-bold">Linker Ctrl</span>
              </div>
              <div className="flex justify-between py-1 border-b border-neutral-800">
                <span>Herladen</span>
                <span className="text-orange-400 font-bold">R</span>
              </div>
              <div className="flex justify-between py-1 border-b border-neutral-800">
                <span>Interactie (Health & HEV Chargers)</span>
                <span className="text-orange-400 font-bold">E</span>
              </div>
              <div className="flex justify-between py-1">
                <span>Wapens Kiezen</span>
                <span className="text-orange-400 font-bold">1 (Koevoet), 2 (Glock), 3 (Shotgun), 4 (MP5)</span>
              </div>
            </div>

            <button
              onClick={() => setShowHelpModal(false)}
              className="w-full py-2.5 rounded-lg bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs"
            >
              Sluiten & Verder Spelen
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
