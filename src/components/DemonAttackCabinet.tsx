import React, { useEffect, useRef, useState } from 'react';
import { 
  ArrowLeft, 
  Volume2, 
  VolumeX, 
  Tv, 
  RotateCcw, 
  Trophy, 
  Smartphone, 
  Flame, 
  Info,
  Sparkles,
  Shield,
  Zap,
  HelpCircle
} from 'lucide-react';
import { CANVAS_HEIGHT, CANVAS_WIDTH, DemonAttackEngine } from '../game/demonAttackEngine';
import { DemonAttackRenderer } from '../game/demonAttackRenderer';
import { demonAudio } from '../game/demonAttackAudio';
import { getDemonHighScores } from '../game/demonAttackHighScores';
import { haptics } from '../utils/haptics';
import { GameControlsModal, useGameControls } from './GameControlsModal';

interface DemonAttackCabinetProps {
  onBackToLobby: () => void;
}

export const DemonAttackCabinet: React.FC<DemonAttackCabinetProps> = ({ onBackToLobby }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<DemonAttackEngine | null>(null);
  const rendererRef = useRef<DemonAttackRenderer | null>(null);

  // UI state synced with engine
  const [score, setScore] = useState(0);
  const [wave, setWave] = useState(1);
  const [lives, setLives] = useState(3);
  const [gameState, setGameState] = useState<string>('READY');
  const [isMuted, setIsMuted] = useState(false);
  const { showControls, setShowControls } = useGameControls('demon_attack');
  const [enableCRT, setEnableCRT] = useState(true);
  const [hapticEnabled, setHapticEnabled] = useState(true);
  const [isTiltEnabled, setIsTiltEnabled] = useState(false);
  const [tiltPermissionNeeded, setTiltPermissionNeeded] = useState(false);
  const [waveDesc, setWaveDesc] = useState('');

  // High Score state
  const [highScore, setHighScore] = useState(0);
  const [showGameOverModal, setShowGameOverModal] = useState(false);
  const [initials, setInitials] = useState('');
  const [isHighScorer, setIsHighScorer] = useState(false);
  const [hasSubmittedScore, setHasSubmittedScore] = useState(false);

  // Virtual Controls state for Touch
  const [touchLeft, setTouchLeft] = useState(false);
  const [touchRight, setTouchRight] = useState(false);
  const [touchFire, setTouchFire] = useState(false);

  // Init High Score
  useEffect(() => {
    const scores = getDemonHighScores();
    if (scores.length > 0) {
      setHighScore(scores[0].score);
    }
  }, []);

  // Initialize Engine & Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    const engine = new DemonAttackEngine();
    const renderer = new DemonAttackRenderer(ctx);
    renderer.enableCRT = enableCRT;

    engineRef.current = engine;
    rendererRef.current = renderer;

    setWaveDesc(engine.waveConfig.description);

    // Sync React state
    const unsubscribe = engine.subscribe(() => {
      setScore(engine.score);
      setWave(engine.wave);
      setLives(engine.lives);
      setGameState(engine.gameState);
      setWaveDesc(engine.waveConfig.description);

      if (engine.gameState === 'GAME_OVER') {
        setShowGameOverModal(true);
        setIsHighScorer(engine.checkIsHighScore());
      }
    });

    let animationFrameId: number;
    let lastTime = performance.now();

    const loop = (currentTime: number) => {
      const dt = Math.min(0.05, (currentTime - lastTime) / 1000);
      lastTime = currentTime;

      engine.update(dt);
      renderer.render(engine);

      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animationFrameId);
      unsubscribe();
    };
  }, []);

  // Keyboard Event Listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const engine = engineRef.current;
      if (!engine) return;

      if (['ArrowLeft', 'ArrowRight', 'Space', ' '].includes(e.key)) {
        e.preventDefault();
      }

      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        engine.setInput(true, touchRight, touchFire);
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        engine.setInput(touchLeft, true, touchFire);
      } else if (e.key === ' ' || e.key === 'Space') {
        engine.setInput(touchLeft, touchRight, true);
        if (hapticEnabled) haptics.light();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const engine = engineRef.current;
      if (!engine) return;

      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        engine.setInput(false, touchRight, touchFire);
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        engine.setInput(touchLeft, false, touchFire);
      } else if (e.key === ' ' || e.key === 'Space') {
        engine.setInput(touchLeft, touchRight, false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [touchLeft, touchRight, touchFire, hapticEnabled]);

  // Touch Virtual Controls sync
  useEffect(() => {
    const engine = engineRef.current;
    if (engine) {
      engine.setInput(touchLeft, touchRight, touchFire);
    }
  }, [touchLeft, touchRight, touchFire]);

  // Toggle Audio Mute
  const handleToggleMute = () => {
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    demonAudio.setMuted(nextMute);
  };

  // Toggle CRT effect
  const handleToggleCRT = () => {
    const nextCRT = !enableCRT;
    setEnableCRT(nextCRT);
    if (rendererRef.current) {
      rendererRef.current.enableCRT = nextCRT;
    }
  };

  // Gyroscope / iPhone DeviceOrientation Steering
  const handleToggleTilt = async () => {
    if (isTiltEnabled) {
      setIsTiltEnabled(false);
      return;
    }

    if (
      typeof DeviceOrientationEvent !== 'undefined' &&
      typeof (DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> }).requestPermission === 'function'
    ) {
      try {
        const perm = await (DeviceOrientationEvent as unknown as { requestPermission: () => Promise<string> }).requestPermission();
        if (perm === 'granted') {
          setIsTiltEnabled(true);
          setTiltPermissionNeeded(false);
        }
      } catch (err) {
        console.warn('Tilt permission denied:', err);
      }
    } else {
      setIsTiltEnabled(true);
    }
  };

  useEffect(() => {
    if (!isTiltEnabled) return;

    const handleOrientation = (e: DeviceOrientationEvent) => {
      const gamma = e.gamma; // [-90, 90]
      if (gamma === null || gamma === undefined) return;
      const engine = engineRef.current;
      if (!engine) return;

      // Clamp between -25 and +25 degrees
      const clamped = Math.max(-25, Math.min(25, gamma));
      const ratio = (clamped + 25) / 50;
      engine.setHorizontalPositionRatio(ratio);
    };

    window.addEventListener('deviceorientation', handleOrientation);
    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, [isTiltEnabled]);

  // Restart / Play Again
  const handleRestart = () => {
    setShowGameOverModal(false);
    setHasSubmittedScore(false);
    setInitials('');
    if (engineRef.current) {
      engineRef.current.resetGame();
      engineRef.current.startGame();
    }
  };

  const handleSubmitScore = (e: React.FormEvent) => {
    e.preventDefault();
    if (!initials.trim() || hasSubmittedScore || !engineRef.current) return;
    engineRef.current.submitHighScore(initials);
    setHasSubmittedScore(true);
    const updated = getDemonHighScores();
    if (updated.length > 0) {
      setHighScore(updated[0].score);
    }
  };

  return (
    <div className="relative w-full min-h-screen bg-black flex flex-col items-center justify-between p-2 sm:p-4 selection:bg-rose-500 selection:text-white select-none">
      
      {/* Top Header Marquee */}
      <header className="w-full max-w-lg flex items-center justify-between py-2 border-b border-rose-950/80 mb-2">
        <button
          onClick={onBackToLobby}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-xs font-mono text-neutral-300 hover:text-white hover:border-neutral-700 transition active:scale-95 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>ARCADE HUB</span>
        </button>

        <div className="text-center">
          <h1 className="text-sm sm:text-base font-black font-mono tracking-wider text-rose-400 drop-shadow-[0_0_8px_rgba(244,63,94,0.6)]">
            DEMON ATTACK
          </h1>
          <span className="text-[10px] text-neutral-400 font-mono">IMAGIC • 1982</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowControls(true)}
            className="p-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-yellow-400 hover:text-yellow-300 transition"
            title="Besturing & Xbox Controller"
          >
            <HelpCircle className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleToggleMute}
            className="p-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white transition"
            title={isMuted ? 'Geluid Aanzetten' : 'Dempen'}
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5 text-red-400" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-400" />}
          </button>
          <button
            onClick={handleToggleCRT}
            className={`p-1.5 rounded-lg border text-xs font-mono transition ${
              enableCRT ? 'bg-rose-950/70 border-rose-600 text-rose-300' : 'bg-neutral-900 border-neutral-800 text-neutral-400'
            }`}
            title="CRT Scanlines"
          >
            <Tv className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Main Score & Wave Status Bar */}
      <div className="w-full max-w-lg grid grid-cols-3 items-center text-center px-4 py-2 bg-neutral-950 border border-rose-900/40 rounded-2xl mb-2 font-mono">
        <div>
          <span className="text-[10px] text-neutral-400 block">SCORE</span>
          <span className="text-base sm:text-lg font-black text-rose-400 drop-shadow-[0_0_6px_rgba(244,63,94,0.5)]">
            {score.toLocaleString()}
          </span>
        </div>

        <div className="flex flex-col items-center">
          <span className="text-[10px] text-yellow-400 block font-bold">WAVE / LEVEL</span>
          <div className="flex items-center gap-1">
            <Flame className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
            <span className="text-base sm:text-lg font-black text-white">
              {wave.toString().padStart(2, '0')}
            </span>
          </div>
        </div>

        <div>
          <span className="text-[10px] text-neutral-400 block">HIGH SCORE</span>
          <span className="text-base sm:text-lg font-black text-yellow-300">
            {Math.max(score, highScore).toLocaleString()}
          </span>
        </div>
      </div>

      {/* Wave description banner */}
      {waveDesc && (
        <div className="w-full max-w-lg text-center px-3 py-1 mb-2 rounded-xl bg-rose-950/40 border border-rose-500/20 text-[11px] font-mono text-rose-200 truncate">
          {waveDesc}
        </div>
      )}

      {/* Central Arcade Screen Container */}
      <div className="relative w-full max-w-lg aspect-[480/600] max-h-[70vh] flex items-center justify-center bg-black border-4 border-neutral-900 rounded-2xl shadow-[0_0_40px_rgba(244,63,94,0.25)] overflow-hidden">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="w-full h-full object-contain"
        />

        {/* Start Game Overlay */}
        {gameState === 'READY' && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex flex-col items-center justify-center p-6 text-center z-10 font-mono">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500 flex items-center justify-center text-rose-400 mb-3 shadow-[0_0_20px_rgba(244,63,94,0.6)]">
              <Flame className="w-6 h-6" />
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white mb-1">
              KRYDOS ONDER AANVAL!
            </h2>
            <p className="text-xs text-neutral-300 mb-4 max-w-xs leading-relaxed">
              Vliegende demonen vallen binnen van links en rechts! Vanaf Wave 5 splitsen ze in twee snelle duikwezens.
            </p>
            <button
              onClick={() => engineRef.current?.startGame()}
              className="px-6 py-3 rounded-xl bg-rose-500 hover:bg-rose-400 text-black font-black text-xs sm:text-sm tracking-wider shadow-[0_0_20px_rgba(244,63,94,0.8)] transition active:scale-95 cursor-pointer flex items-center gap-2"
            >
              <Zap className="w-4 h-4 fill-black" />
              <span>START DEMON ATTACK</span>
            </button>
            <span className="text-[10px] text-neutral-400 mt-3">
              Of druk op de SPATIEBALK
            </span>
          </div>
        )}

        {/* Game Over Modal Overlay */}
        {showGameOverModal && (
          <div className="absolute inset-0 bg-black/85 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center z-20 font-mono animate-in fade-in duration-200">
            <h2 className="text-2xl font-black text-rose-500 tracking-wider mb-1 drop-shadow-[0_0_12px_rgba(244,63,94,0.8)]">
              GAME OVER
            </h2>
            <p className="text-xs text-neutral-400 mb-3">Alle Bunkers Vernietigd!</p>

            <div className="w-full max-w-xs p-3 bg-neutral-900/90 border border-neutral-800 rounded-xl mb-4 space-y-1.5 text-xs">
              <div className="flex justify-between text-neutral-300">
                <span>EINDSCORE:</span>
                <span className="font-bold text-rose-400">{score.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-neutral-300">
                <span>BEREIKT LEVEL:</span>
                <span className="font-bold text-yellow-400">WAVE {wave}</span>
              </div>
            </div>

            {/* High score input form */}
            {isHighScorer && !hasSubmittedScore && (
              <form onSubmit={handleSubmitScore} className="w-full max-w-xs mb-4">
                <p className="text-yellow-400 text-xs font-bold mb-2 flex items-center justify-center gap-1.5">
                  <Trophy className="w-3.5 h-3.5" />
                  <span>NIEUWE HIGHSCORE!</span>
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    maxLength={3}
                    value={initials}
                    onChange={(e) => setInitials(e.target.value.toUpperCase())}
                    placeholder="AAA"
                    className="w-full bg-neutral-950 border border-yellow-500/50 rounded-lg px-3 py-1.5 text-center text-yellow-300 text-sm font-bold uppercase tracking-widest focus:outline-none focus:border-yellow-400"
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-yellow-500 hover:bg-yellow-400 text-black font-bold text-xs rounded-lg transition active:scale-95 cursor-pointer"
                  >
                    OPSLAAN
                  </button>
                </div>
              </form>
            )}

            {hasSubmittedScore && (
              <p className="text-emerald-400 text-xs font-bold mb-3">✓ Score Opgeslagen!</p>
            )}

            <div className="flex items-center gap-3">
              <button
                onClick={handleRestart}
                className="px-5 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-400 text-black font-bold text-xs tracking-wider transition active:scale-95 cursor-pointer flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>SPEEL OPNIEUW</span>
              </button>
              <button
                onClick={onBackToLobby}
                className="px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs transition active:scale-95 cursor-pointer"
              >
                LOBBY
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Controls Bar: iPhone Tilt, Haptics & Virtual Touch Buttons */}
      <footer className="w-full max-w-lg mt-2 flex flex-col gap-2">
        {/* Quick Toolbar */}
        <div className="w-full flex items-center justify-between text-xs px-3 py-1.5 bg-neutral-950/90 border border-neutral-800 rounded-xl font-mono">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setHapticEnabled(!hapticEnabled)}
              className={`px-2 py-0.5 rounded text-[10px] border transition ${
                hapticEnabled ? 'bg-rose-950/60 border-rose-600 text-rose-300' : 'bg-neutral-900 border-neutral-800 text-neutral-400'
              }`}
            >
              Haptics {hapticEnabled ? 'AAN' : 'UIT'}
            </button>
          </div>

          <button
            onClick={handleToggleTilt}
            className={`flex items-center gap-1 px-2.5 py-0.5 rounded-lg border text-[10px] font-bold transition active:scale-95 cursor-pointer ${
              isTiltEnabled
                ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.4)]'
                : 'bg-neutral-900 border-neutral-700 text-neutral-300 hover:border-neutral-500'
            }`}
          >
            <Smartphone className="w-3 h-3 text-rose-400" />
            <span>{isTiltEnabled ? 'TILT ACTIEF' : 'IPHONE TILT'}</span>
          </button>
        </div>

        {/* Touch / Mobile On-Screen Buttons */}
        <div className="w-full grid grid-cols-3 gap-2 h-14">
          <button
            onTouchStart={() => { setTouchLeft(true); if (hapticEnabled) haptics.light(); }}
            onTouchEnd={() => setTouchLeft(false)}
            onMouseDown={() => { setTouchLeft(true); if (hapticEnabled) haptics.light(); }}
            onMouseUp={() => setTouchLeft(false)}
            className="flex items-center justify-center rounded-xl bg-neutral-900 active:bg-rose-900/60 border border-neutral-800 active:border-rose-500 text-neutral-300 font-mono font-bold text-lg transition select-none cursor-pointer"
          >
            ◀ LINKS
          </button>

          <button
            onTouchStart={() => { setTouchFire(true); if (hapticEnabled) haptics.laserShoot(); }}
            onTouchEnd={() => setTouchFire(false)}
            onMouseDown={() => { setTouchFire(true); if (hapticEnabled) haptics.laserShoot(); }}
            onMouseUp={() => setTouchFire(false)}
            className="flex items-center justify-center rounded-xl bg-rose-600 active:bg-rose-500 text-black font-mono font-black text-sm tracking-wider shadow-[0_0_15px_rgba(244,63,94,0.6)] transition active:scale-95 select-none cursor-pointer"
          >
            ⚡ VUUR
          </button>

          <button
            onTouchStart={() => { setTouchRight(true); if (hapticEnabled) haptics.light(); }}
            onTouchEnd={() => setTouchRight(false)}
            onMouseDown={() => { setTouchRight(true); if (hapticEnabled) haptics.light(); }}
            onMouseUp={() => setTouchRight(false)}
            className="flex items-center justify-center rounded-xl bg-neutral-900 active:bg-rose-900/60 border border-neutral-800 active:border-rose-500 text-neutral-300 font-mono font-bold text-lg transition select-none cursor-pointer"
          >
            RECHTS ▶
          </button>
        </div>
      </footer>

      {/* Game Controls & Xbox Modal */}
      <GameControlsModal
        isOpen={showControls}
        onClose={() => setShowControls(false)}
        gameId="demon_attack"
      />
    </div>
  );
};
