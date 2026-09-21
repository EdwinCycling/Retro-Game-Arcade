/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Mario Bros. (1983 Nintendo Arcade) - Dedicated Arcade Cabinet Component
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { 
  MarioEngine, 
  CharacterType, 
  VIRTUAL_WIDTH, 
  VIRTUAL_HEIGHT, 
  INITIAL_PLATFORMS, 
  POW_BLOCK_RECT 
} from '../game/marioEngine';
import { marioAudio } from '../game/marioAudio';
import { getMarioHighScores, saveMarioHighScore, MarioHighScore } from '../game/marioHighScores';
import { MarioHistoryModal } from './MarioHistoryModal';
import { 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Tv, 
  ArrowLeft, 
  BookOpen, 
  Trophy, 
  Sparkles, 
  Flame, 
  Zap, 
  Play, 
  Users,
  HelpCircle 
} from 'lucide-react';
import { haptics } from '../utils/haptics';
import { GameControlsModal, useGameControls } from './GameControlsModal';

interface MarioCabinetProps {
  onBackToLobby: () => void;
}

export const MarioCabinet: React.FC<MarioCabinetProps> = ({ onBackToLobby }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<MarioEngine | null>(null);

  const [selectedCharacter, setSelectedCharacter] = useState<CharacterType>('MARIO');
  const [isCrtEnabled, setIsCrtEnabled] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isDossierOpen, setIsDossierOpen] = useState(false);
  const [score, setScore] = useState(0);
  const [phase, setPhase] = useState(1);
  const [lives, setLives] = useState(3);
  const [gameOver, setGameOver] = useState(false);
  const { showControls, setShowControls } = useGameControls('mario');
  const [highScores, setHighScores] = useState<MarioHighScore[]>([]);
  const [initialsInput, setInitialsInput] = useState('MAR');
  const [scoreSaved, setScoreSaved] = useState(false);

  // Key tracking
  const keysRef = useRef({
    left: false,
    right: false,
    jump: false,
    pow: false,
  });

  // Initialize engine & high scores
  useEffect(() => {
    setHighScores(getMarioHighScores());
    const engine = new MarioEngine(selectedCharacter);
    engineRef.current = engine;
    marioAudio.playIntroTheme();

    return () => {
      engineRef.current = null;
    };
  }, [selectedCharacter]);

  // Handle keyboard inputs
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowLeft', 'KeyA'].includes(e.code)) {
        keysRef.current.left = true;
      }
      if (['ArrowRight', 'KeyD'].includes(e.code)) {
        keysRef.current.right = true;
      }
      if (['Space', 'KeyW', 'ArrowUp', 'KeyZ', 'KeyK'].includes(e.code)) {
        keysRef.current.jump = true;
      }
      if (['KeyP', 'Digit1'].includes(e.code)) {
        keysRef.current.pow = true;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (['ArrowLeft', 'KeyA'].includes(e.code)) {
        keysRef.current.left = false;
      }
      if (['ArrowRight', 'KeyD'].includes(e.code)) {
        keysRef.current.right = false;
      }
      if (['Space', 'KeyW', 'ArrowUp', 'KeyZ', 'KeyK'].includes(e.code)) {
        keysRef.current.jump = false;
      }
      if (['KeyP', 'Digit1'].includes(e.code)) {
        keysRef.current.pow = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Main 60 FPS Game Loop
  useEffect(() => {
    let animId: number;

    const render = () => {
      const engine = engineRef.current;
      const canvas = canvasRef.current;
      if (!engine || !canvas) {
        animId = requestAnimationFrame(render);
        return;
      }

      // Update engine physics
      engine.update(keysRef.current);

      // Sync state to React
      setScore(engine.state.score);
      setPhase(engine.state.phase);
      setLives(engine.state.lives);
      setGameOver(engine.state.gameOver);

      // Draw canvas
      const ctx = canvas.getContext('2d');
      if (ctx) {
        drawGame(ctx, engine);
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, []);

  // Canvas Drawing Routine
  const drawGame = (ctx: CanvasRenderingContext2D, engine: MarioEngine) => {
    ctx.save();

    // Screen Shake effect
    if (engine.state.screenShake > 0) {
      const shakeAmt = (engine.state.screenShake % 2 === 0 ? 1 : -1) * (engine.state.screenShake * 0.4);
      ctx.translate(0, shakeAmt);
    }

    // 1. Black Sewer Background
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, VIRTUAL_WIDTH, VIRTUAL_HEIGHT);

    // 2. Draw Platforms & Bump Ripples
    for (const plat of INITIAL_PLATFORMS) {
      ctx.fillStyle = '#0055aa'; // Arcade Mario blue brick
      ctx.fillRect(plat.x, plat.y, plat.width, 8);

      // Platform top highlight line
      ctx.fillStyle = '#00aaff';
      ctx.fillRect(plat.x, plat.y, plat.width, 1.5);

      // Brick pattern joints
      ctx.fillStyle = '#002255';
      for (let bx = plat.x; bx < plat.x + plat.width; bx += 16) {
        ctx.fillRect(bx, plat.y + 1.5, 1, 6.5);
      }

      // Check active bump ripples on this platform
      const ripple = engine.state.bumpRipples.find(r => r.platformId === plat.id);
      if (ripple) {
        const offset = Math.sin((ripple.duration / ripple.maxDuration) * Math.PI) * 5;
        ctx.fillStyle = '#ffaa00';
        ctx.beginPath();
        ctx.arc(ripple.x, plat.y - offset, 8, 0, Math.PI, true);
        ctx.fill();
      }
    }

    // 3. Draw Green Sewer Pipes
    // Top Left & Top Right Pipes
    drawSewerPipe(ctx, 0, 32, 28, 24, 'right');
    drawSewerPipe(ctx, VIRTUAL_WIDTH - 28, 32, 28, 24, 'left');

    // Bottom Left & Bottom Right Drain Pipes
    drawSewerPipe(ctx, 0, 192, 24, 16, 'right');
    drawSewerPipe(ctx, VIRTUAL_WIDTH - 24, 192, 24, 16, 'left');

    // 4. Draw POW Block
    if (engine.state.powUsesLeft > 0) {
      const powH = engine.state.powUsesLeft === 3 ? 16 : engine.state.powUsesLeft === 2 ? 11 : 6;
      const powY = POW_BLOCK_RECT.y + (16 - powH);

      // POW Block outer square
      ctx.fillStyle = '#0033cc';
      ctx.fillRect(POW_BLOCK_RECT.x, powY, POW_BLOCK_RECT.width, powH);

      // White outline
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.strokeRect(POW_BLOCK_RECT.x + 0.5, powY + 0.5, POW_BLOCK_RECT.width - 1, powH - 1);

      // "POW" text
      if (powH >= 11) {
        ctx.fillStyle = '#ff0000';
        ctx.font = 'bold 8px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('POW', POW_BLOCK_RECT.x + 8, powY + (powH === 16 ? 11 : 8));
      }
    }

    // 5. Draw Gold Coins
    engine.state.coins.forEach(c => {
      if (c.collected) return;
      ctx.fillStyle = '#ffcc00';
      ctx.beginPath();
      ctx.arc(c.x + 6, c.y + 6, 5, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(c.x + 5, c.y + 3, 2, 6);
    });

    // 6. Draw Enemies
    engine.state.enemies.forEach(e => {
      drawEnemy(ctx, e);
    });

    // 7. Draw Fireballs
    engine.state.fireballs.forEach(f => {
      ctx.fillStyle = f.color === 'red' ? '#ff3300' : '#00ff66';
      ctx.beginPath();
      ctx.arc(f.x, f.y, 5, 0, Math.PI * 2);
      ctx.fill();

      // Fire spark trails
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(f.x - 2, f.y - 2, 4, 4);
    });

    // 8. Draw Mario / Luigi
    drawMario(ctx, engine.state.mario, engine.state.character);

    // 9. Score Popups
    engine.state.scorePopups.forEach(p => {
      ctx.fillStyle = '#ffff00';
      ctx.font = 'bold 8px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(p.text, p.x, p.y);
    });

    // 10. Phase Intro Announcement
    if (engine.state.phaseIntroTimer > 0) {
      ctx.fillStyle = 'rgba(0,0,0,0.65)';
      ctx.fillRect(0, 85, VIRTUAL_WIDTH, 44);

      ctx.fillStyle = '#ffff00';
      ctx.font = 'bold 12px monospace';
      ctx.textAlign = 'center';
      if (engine.state.isBonusPhase) {
        ctx.fillText('★ COIN BONUS PHASE ★', VIRTUAL_WIDTH / 2, 104);
        ctx.font = '9px monospace';
        ctx.fillStyle = '#ffffff';
        ctx.fillText('COLLECT ALL 10 COINS FOR 3000 PTS!', VIRTUAL_WIDTH / 2, 118);
      } else {
        ctx.fillText(`PHASE ${engine.state.phase.toString().padStart(2, '0')}`, VIRTUAL_WIDTH / 2, 104);
        ctx.font = '9px monospace';
        ctx.fillStyle = '#00ffcc';
        ctx.fillText('PEST CONTROL READY!', VIRTUAL_WIDTH / 2, 118);
      }
    }

    // 11. Top HUD (Score, High Score, Phase, Lives)
    ctx.fillStyle = '#ff0000';
    ctx.font = 'bold 8px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`${engine.state.character} 1P`, 16, 12);
    ctx.fillStyle = '#ffffff';
    ctx.fillText(engine.state.score.toString().padStart(6, '0'), 16, 22);

    ctx.fillStyle = '#ffff00';
    ctx.textAlign = 'center';
    ctx.fillText('TOP SCORE', VIRTUAL_WIDTH / 2, 12);
    const topScoreVal = highScores.length > 0 ? highScores[0].score : 48900;
    ctx.fillStyle = '#ffffff';
    ctx.fillText(Math.max(topScoreVal, engine.state.score).toString().padStart(6, '0'), VIRTUAL_WIDTH / 2, 22);

    ctx.fillStyle = '#00ffcc';
    ctx.textAlign = 'right';
    ctx.fillText(engine.state.isBonusPhase ? 'BONUS' : `PHASE ${engine.state.phase.toString().padStart(2, '0')}`, VIRTUAL_WIDTH - 16, 12);

    // Lives icons at top right
    for (let l = 0; l < engine.state.lives; l++) {
      ctx.fillStyle = engine.state.character === 'MARIO' ? '#0066ff' : '#00aa00';
      ctx.fillRect(VIRTUAL_WIDTH - 24 - (l * 10), 16, 6, 6);
      ctx.fillStyle = '#ff0000';
      ctx.fillRect(VIRTUAL_WIDTH - 24 - (l * 10), 14, 6, 2);
    }

    // Bonus Timer Bar if bonus phase
    if (engine.state.isBonusPhase) {
      const remainingPct = Math.max(0, engine.state.bonusTimer / (20 * 60));
      ctx.fillStyle = '#333333';
      ctx.fillRect(50, 24, VIRTUAL_WIDTH - 100, 4);
      ctx.fillStyle = remainingPct > 0.3 ? '#00ff00' : '#ff0000';
      ctx.fillRect(50, 24, (VIRTUAL_WIDTH - 100) * remainingPct, 4);
    }

    ctx.restore();
  };

  // Helper to draw sewer pipe
  const drawSewerPipe = (
    ctx: CanvasRenderingContext2D, 
    x: number, 
    y: number, 
    w: number, 
    h: number, 
    openingSide: 'left' | 'right'
  ) => {
    // Pipe Body
    ctx.fillStyle = '#009900';
    ctx.fillRect(x, y, w, h);

    // Highlight
    ctx.fillStyle = '#55ff55';
    ctx.fillRect(x, y + 2, w, 2);

    // Shading
    ctx.fillStyle = '#004400';
    ctx.fillRect(x, y + h - 3, w, 3);

    // Flange / Rim
    ctx.fillStyle = '#00aa00';
    const rimX = openingSide === 'left' ? x : x + w - 6;
    ctx.fillRect(rimX, y - 2, 6, h + 4);

    // Rim Highlight
    ctx.fillStyle = '#88ff88';
    ctx.fillRect(rimX, y - 2, 2, h + 4);

    // Opening dark hole
    ctx.fillStyle = '#000000';
    ctx.fillRect(rimX + (openingSide === 'left' ? 0 : 4), y, 2, h);
  };

  // Helper to draw enemies
  const drawEnemy = (ctx: CanvasRenderingContext2D, e: MarioEngine['state']['enemies'][0]) => {
    ctx.save();
    ctx.translate(e.x + 8, e.y + 8);

    if (e.isKicked) {
      ctx.rotate(e.kickVy * 0.4);
    } else if (e.facing === -1) {
      ctx.scale(-1, 1);
    }

    if (e.flipped) {
      // Flipped on back: shell/body upside down, kicking legs
      ctx.rotate(Math.PI);
    }

    if (e.type === 'shellcreeper') {
      // Green Turtle (or Red if enraged)
      const shellColor = e.isEnraged ? '#ff2200' : '#00aa00';
      const ridgeColor = e.isEnraged ? '#ffaa00' : '#ffff00';

      // Shell dome
      ctx.fillStyle = shellColor;
      ctx.beginPath();
      ctx.arc(0, -2, 7, 0, Math.PI, true);
      ctx.fill();

      // Shell ridge
      ctx.fillStyle = ridgeColor;
      ctx.fillRect(-7, -2, 14, 2);

      // Head & Eye
      ctx.fillStyle = '#ffccaa';
      ctx.beginPath();
      ctx.arc(6, -2, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#000000';
      ctx.fillRect(7, -3, 1.5, 1.5);

      // Walking feet
      ctx.fillStyle = '#ffccaa';
      const legOffset = Math.sin(e.animFrame * Math.PI) * 2;
      ctx.fillRect(-5, 0 + legOffset, 3, 4);
      ctx.fillRect(2, 0 - legOffset, 3, 4);
    } else if (e.type === 'sidestepper') {
      // Crab: Bright red if enraged, maroon/orange if normal
      const crabColor = e.isEnraged ? '#ff0000' : '#cc4400';

      // Body
      ctx.fillStyle = crabColor;
      ctx.fillRect(-6, -4, 12, 6);

      // Raised snapping claws
      ctx.fillStyle = crabColor;
      ctx.fillRect(-7, -8, 3, 5);
      ctx.fillRect(4, -8, 3, 5);

      // Crab eyes
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-4, -6, 2.5, 2.5);
      ctx.fillRect(1.5, -6, 2.5, 2.5);
      ctx.fillStyle = '#000000';
      ctx.fillRect(-3, -5, 1, 1);
      ctx.fillRect(2.5, -5, 1, 1);

      // Skittering legs
      ctx.fillStyle = '#ff9900';
      ctx.fillRect(-5, 2, 2, 4);
      ctx.fillRect(-1, 2, 2, 4);
      ctx.fillRect(3, 2, 2, 4);
    } else if (e.type === 'fighter_fly') {
      // Fighter Fly
      ctx.fillStyle = e.isEnraged ? '#ff0055' : '#8800ff';
      ctx.fillRect(-5, -4, 10, 6);

      // White flapping wings
      ctx.fillStyle = '#ffffff';
      const wingY = Math.sin(e.animFrame * Math.PI * 2) * 3;
      ctx.fillRect(-7, -8 + wingY, 4, 4);
      ctx.fillRect(3, -8 + wingY, 4, 4);

      // Large compound red eyes
      ctx.fillStyle = '#ff0000';
      ctx.fillRect(3, -4, 3, 3);

      // Legs
      ctx.fillStyle = '#ffff00';
      ctx.fillRect(-3, 2, 2, 4);
      ctx.fillRect(1, 2, 2, 4);
    } else {
      // Slipice (Ice monster)
      ctx.fillStyle = '#00e5ff';
      ctx.beginPath();
      ctx.moveTo(0, -8);
      ctx.lineTo(6, 6);
      ctx.lineTo(-6, 6);
      ctx.closePath();
      ctx.fill();

      // White sheen
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-1, -4, 2, 4);
    }

    ctx.restore();
  };

  // Helper to draw Mario / Luigi with authentic 1983 arcade palette
  const drawMario = (
    ctx: CanvasRenderingContext2D, 
    m: MarioEngine['state']['mario'], 
    charType: CharacterType
  ) => {
    // Invulnerability blinking
    if (m.invulnerableTimer > 0 && Math.floor(m.invulnerableTimer / 4) % 2 === 0) {
      return;
    }

    ctx.save();
    ctx.translate(m.x + 8, m.y + 8);

    if (m.isDead) {
      // Spinning death animation
      ctx.rotate(m.deathTimer * 0.2);
    } else if (m.facing === -1) {
      ctx.scale(-1, 1);
    }

    // 1983 Arcade Colors:
    // Mario: Blue cap & overalls, red shirt!
    // Luigi: Green cap & overalls, white/brown shirt!
    const capColor = charType === 'MARIO' ? '#0055ff' : '#00aa00';
    const overallsColor = charType === 'MARIO' ? '#0055ff' : '#00aa00';
    const shirtColor = charType === 'MARIO' ? '#ee0000' : '#ffffff';
    const skinColor = '#ffccaa';

    if (m.isSkidding) {
      // SKIDDING FRAME: Mario turns to face camera, hands thrown back, heels dug in!
      // Cap
      ctx.fillStyle = capColor;
      ctx.fillRect(-5, -8, 10, 4);

      // Face
      ctx.fillStyle = skinColor;
      ctx.fillRect(-4, -4, 8, 4);

      // Mustache & Nose
      ctx.fillStyle = '#663300';
      ctx.fillRect(-3, -2, 6, 2);

      // Overalls / Shirt
      ctx.fillStyle = overallsColor;
      ctx.fillRect(-5, 0, 10, 6);
      ctx.fillStyle = shirtColor;
      ctx.fillRect(-6, 0, 2, 4);
      ctx.fillRect(4, 0, 2, 4);

      // Braced shoes
      ctx.fillStyle = '#663300';
      ctx.fillRect(-7, 6, 4, 2);
      ctx.fillRect(3, 6, 4, 2);

      // Skid friction sparks
      ctx.fillStyle = '#ffff00';
      ctx.fillRect(-8, 7, 2, 1);
      ctx.fillRect(6, 7, 2, 1);
    } else if (!m.onGround) {
      // JUMPING FRAME: One arm raised, legs split
      // Cap
      ctx.fillStyle = capColor;
      ctx.fillRect(-4, -8, 9, 3);
      ctx.fillRect(1, -7, 4, 2);

      // Face
      ctx.fillStyle = skinColor;
      ctx.fillRect(-2, -5, 6, 4);
      ctx.fillStyle = '#663300';
      ctx.fillRect(1, -3, 4, 2); // Mustache

      // Shirt & Arm
      ctx.fillStyle = shirtColor;
      ctx.fillRect(-4, -1, 7, 4);
      ctx.fillRect(1, -4, 3, 3); // Raised fist

      // Overalls
      ctx.fillStyle = overallsColor;
      ctx.fillRect(-3, 1, 6, 4);

      // Legs spread
      ctx.fillStyle = '#663300';
      ctx.fillRect(-6, 4, 4, 3);
      ctx.fillRect(2, 5, 4, 3);
    } else {
      // WALKING / RUNNING FRAMES
      const walkFrame = Math.floor(m.animFrame) % 3;

      // Cap
      ctx.fillStyle = capColor;
      ctx.fillRect(-4, -8, 8, 3);
      ctx.fillRect(1, -7, 4, 2); // Cap visor

      // Face
      ctx.fillStyle = skinColor;
      ctx.fillRect(-2, -5, 6, 4);
      ctx.fillStyle = '#000000';
      ctx.fillRect(2, -4, 1.5, 1.5); // Eye
      ctx.fillStyle = '#663300';
      ctx.fillRect(0, -2, 5, 2); // Mustache

      // Shirt
      ctx.fillStyle = shirtColor;
      ctx.fillRect(-4, -1, 7, 4);

      // Overalls
      ctx.fillStyle = overallsColor;
      ctx.fillRect(-3, 1, 6, 4);

      // Shoes
      ctx.fillStyle = '#663300';
      if (walkFrame === 0) {
        ctx.fillRect(-4, 5, 3, 3);
        ctx.fillRect(1, 5, 3, 3);
      } else if (walkFrame === 1) {
        ctx.fillRect(-5, 4, 4, 3);
        ctx.fillRect(1, 5, 3, 3);
      } else {
        ctx.fillRect(-3, 5, 3, 3);
        ctx.fillRect(2, 4, 4, 3);
      }
    }

    ctx.restore();
  };

  const handleRestart = () => {
    haptics.selection();
    setGameOver(false);
    setScoreSaved(false);
    if (engineRef.current) {
      engineRef.current.reset(selectedCharacter);
    }
  };

  const handleToggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    marioAudio.setMuted(next);
    haptics.light();
  };

  const handleToggleCharacter = () => {
    const nextChar = selectedCharacter === 'MARIO' ? 'LUIGI' : 'MARIO';
    setSelectedCharacter(nextChar);
    haptics.selection();
    if (engineRef.current) {
      engineRef.current.reset(nextChar);
    }
  };

  const handleSaveScore = (e: React.FormEvent) => {
    e.preventDefault();
    if (scoreSaved) return;

    const trimmed = (initialsInput || 'MAR').toUpperCase().slice(0, 3);
    const updated = saveMarioHighScore({
      initials: trimmed,
      score,
      phase,
      character: selectedCharacter,
      date: new Date().toISOString().split('T')[0]
    });
    setHighScores(updated);
    setScoreSaved(true);
    haptics.success();
  };

  return (
    <div className="w-full flex flex-col items-center justify-center p-2 sm:p-4 min-h-screen bg-neutral-950 text-white select-none">
      {/* Top Arcade Navigation & Controls Bar */}
      <div className="w-full max-w-2xl flex items-center justify-between gap-2 mb-3 px-2">
        <button
          type="button"
          onClick={onBackToLobby}
          className="px-3 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-800 text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-red-400" />
          <span>Speelhal Lobby</span>
        </button>

        <div className="flex items-center gap-2">
          {/* Character Switcher */}
          <button
            type="button"
            onClick={handleToggleCharacter}
            className={`px-2.5 py-1.5 rounded-xl border text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              selectedCharacter === 'MARIO'
                ? 'bg-red-950/80 border-red-500 text-red-300 shadow-[0_0_12px_rgba(239,68,68,0.4)]'
                : 'bg-emerald-950/80 border-emerald-500 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.4)]'
            }`}
            title="Wissel tussen Mario en Luigi"
          >
            <Users className="w-3.5 h-3.5" />
            <span>{selectedCharacter === 'MARIO' ? 'MARIO (1P)' : 'LUIGI (2P)'}</span>
          </button>

          {/* CRT scanlines toggle */}
          <button
            type="button"
            onClick={() => { setIsCrtEnabled(!isCrtEnabled); haptics.light(); }}
            className={`px-2.5 py-1.5 rounded-xl border text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              isCrtEnabled 
                ? 'bg-cyan-950/80 border-cyan-500 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.4)]' 
                : 'bg-neutral-900 border-neutral-800 text-neutral-400'
            }`}
            title="CRT Filter Aan/Uit"
          >
            <Tv className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">CRT</span>
          </button>

          {/* Audio toggle */}
          <button
            type="button"
            onClick={handleToggleMute}
            className={`px-2.5 py-1.5 rounded-xl border text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              !isMuted 
                ? 'bg-amber-950/80 border-amber-500 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.4)]' 
                : 'bg-neutral-900 border-neutral-800 text-neutral-400'
            }`}
            title="Geluid Aan/Uit"
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-amber-400" />}
          </button>

          {/* Controls button */}
          <button
            type="button"
            onClick={() => { setShowControls(true); haptics.light(); }}
            className="px-3 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-yellow-400 border border-neutral-700 text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            title="Besturing & Xbox Controller"
          >
            <HelpCircle className="w-3.5 h-3.5 text-yellow-400" />
            <span className="hidden sm:inline">Besturing</span>
          </button>

          {/* Dossier button */}
          <button
            type="button"
            onClick={() => { setIsDossierOpen(true); haptics.light(); }}
            className="px-3 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-200 border border-neutral-700 text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5 text-red-400" />
            <span className="hidden sm:inline">Dossier</span>
          </button>
        </div>
      </div>

      {/* The Upright Arcade Cabinet Wrapper */}
      <div className="relative w-full max-w-xl rounded-3xl bg-neutral-950 border-4 border-red-600/80 shadow-[0_0_60px_rgba(239,68,68,0.35)] overflow-hidden flex flex-col items-center">
        
        {/* 1. ILLUMINATED RETRO MARQUEE */}
        <div className="w-full bg-gradient-to-r from-red-600 via-blue-600 to-red-600 border-b-2 border-black p-3 text-center relative overflow-hidden shadow-inner flex items-center justify-between px-6">
          <div className="absolute inset-0 bg-white/10 mix-blend-overlay animate-pulse" />
          <div className="flex items-center gap-2">
            <span className="text-xl">🍄</span>
            <div className="text-left">
              <h2 className="font-mono font-black text-lg sm:text-xl tracking-wider text-yellow-300 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] leading-none">
                MARIO BROS.
              </h2>
              <span className="text-[9px] font-mono font-bold text-white tracking-widest block mt-0.5">
                NINTENDO COIN-OP 1983
              </span>
            </div>
          </div>

          <div className="text-right font-mono">
            <span className="px-2 py-0.5 rounded bg-black/40 text-yellow-300 text-[10px] font-black border border-yellow-400/40 block">
              25¢ / 1 GULDEN
            </span>
            <span className="text-[9px] text-white/80 block mt-0.5">
              1 OR 2 PLAYERS
            </span>
          </div>
        </div>

        {/* 2. CRT MONITOR BEZEL & CANVAS SCREEN */}
        <div className="p-3 sm:p-5 bg-neutral-900 w-full flex flex-col items-center">
          <div className="relative rounded-2xl overflow-hidden border-4 border-neutral-800 bg-black shadow-2xl flex items-center justify-center">
            
            {/* Scanlines & Bezel reflection */}
            {isCrtEnabled && (
              <>
                <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.5)_50%)] bg-[length:100%_4px] pointer-events-none z-10 opacity-40" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.06)_0%,rgba(0,0,0,0.5)_100%)] pointer-events-none z-10" />
              </>
            )}

            {/* Crisp 256x224 Canvas */}
            <canvas
              ref={canvasRef}
              width={VIRTUAL_WIDTH}
              height={VIRTUAL_HEIGHT}
              className="w-[320px] h-[280px] sm:w-[480px] sm:h-[420px] max-w-full aspect-[4/3] bg-black block"
              style={{ imageRendering: 'pixelated' }}
            />

            {/* Game Over Screen Overlay */}
            {gameOver && (
              <div className="absolute inset-0 z-20 bg-black/85 flex flex-col items-center justify-center p-4 text-center space-y-3 font-mono animate-fade-in">
                <div className="text-2xl font-black text-red-500 animate-pulse tracking-wider">
                  GAME OVER
                </div>
                <div className="text-sm text-yellow-400 font-bold">
                  FINAL SCORE: {score.toLocaleString()} PTS (PHASE {phase})
                </div>

                {!scoreSaved ? (
                  <form onSubmit={handleSaveScore} className="flex flex-col items-center gap-2 pt-2">
                    <span className="text-xs text-neutral-300">VOER JE INITIALEN IN:</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        maxLength={3}
                        value={initialsInput}
                        onChange={(e) => setInitialsInput(e.target.value.toUpperCase())}
                        className="w-20 px-2 py-1 bg-neutral-900 border border-yellow-500 text-yellow-300 font-black text-center text-lg rounded tracking-widest focus:outline-none"
                      />
                      <button
                        type="submit"
                        className="px-3 py-1 bg-yellow-500 hover:bg-yellow-400 text-black font-black text-xs rounded transition-colors cursor-pointer"
                      >
                        OPSLAAN
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="text-xs text-emerald-400 font-bold">
                    ✓ SCORE OPGESLAGEN IN HET SPEELHAL ARCHIEF!
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleRestart}
                  className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs tracking-wider shadow-[0_0_15px_rgba(239,68,68,0.7)] transition-all transform active:scale-95 cursor-pointer mt-3"
                >
                  OPNIEUW SPELEN (RESTART)
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 3. PHYSICAL RETRO CONTROL PANEL */}
        <div className="w-full bg-neutral-900 border-t-2 border-neutral-800 p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Instructions for desktop */}
          <div className="hidden sm:flex flex-col gap-1 text-[11px] font-mono text-neutral-400">
            <div className="flex items-center gap-2">
              <span className="px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-200 border border-neutral-700">← / →</span>
              <span>of A/D: Lopen &amp; Skid Draai</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-200 border border-neutral-700">SPATIE</span>
              <span>of W / Z: Spring &amp; Beuk Onderkant</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-200 border border-neutral-700">P</span>
              <span>of 1: POW Aardschok</span>
            </div>
          </div>

          {/* On-Screen Mobile Touch Controller */}
          <div className="flex sm:hidden w-full items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onTouchStart={(e) => { e.preventDefault(); keysRef.current.left = true; }}
                onTouchEnd={() => { keysRef.current.left = false; }}
                onMouseDown={() => { keysRef.current.left = true; }}
                onMouseUp={() => { keysRef.current.left = false; }}
                className="w-13 h-13 rounded-2xl bg-neutral-800 active:bg-neutral-700 text-white text-xl font-bold flex items-center justify-center border border-neutral-700 shadow-md active:scale-95 select-none"
              >
                ◀
              </button>
              <button
                type="button"
                onTouchStart={(e) => { e.preventDefault(); keysRef.current.right = true; }}
                onTouchEnd={() => { keysRef.current.right = false; }}
                onMouseDown={() => { keysRef.current.right = true; }}
                onMouseUp={() => { keysRef.current.right = false; }}
                className="w-13 h-13 rounded-2xl bg-neutral-800 active:bg-neutral-700 text-white text-xl font-bold flex items-center justify-center border border-neutral-700 shadow-md active:scale-95 select-none"
              >
                ▶
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onTouchStart={(e) => { e.preventDefault(); keysRef.current.pow = true; }}
                onTouchEnd={() => { keysRef.current.pow = false; }}
                onMouseDown={() => { keysRef.current.pow = true; }}
                onMouseUp={() => { keysRef.current.pow = false; }}
                className="w-13 h-13 rounded-2xl bg-blue-700 active:bg-blue-600 text-white text-xs font-black flex items-center justify-center border border-blue-500 shadow-md active:scale-95 select-none"
              >
                POW
              </button>
              <button
                type="button"
                onTouchStart={(e) => { e.preventDefault(); keysRef.current.jump = true; }}
                onTouchEnd={() => { keysRef.current.jump = false; }}
                onMouseDown={() => { keysRef.current.jump = true; }}
                onMouseUp={() => { keysRef.current.jump = false; }}
                className="w-16 h-13 rounded-2xl bg-red-600 active:bg-red-500 text-white text-sm font-black flex items-center justify-center border border-red-400 shadow-md active:scale-95 select-none"
              >
                JUMP
              </button>
            </div>
          </div>

          {/* Arcade Cabinet Coin Door representation */}
          <div className="hidden sm:flex items-center gap-3 bg-neutral-950 p-2 rounded-xl border border-neutral-800">
            <div className="flex flex-col items-center">
              <span className="text-[8px] font-mono text-neutral-500 font-bold uppercase">MUNTINWORP</span>
              <div className="w-8 h-10 rounded border border-yellow-600/60 bg-neutral-900 flex flex-col items-center justify-center shadow-inner">
                <div className="w-1 h-4 bg-yellow-500/80 rounded-sm mb-1" />
                <span className="text-[7px] font-mono text-yellow-400 font-bold">25¢</span>
              </div>
            </div>
            <button
              type="button"
              onClick={handleRestart}
              className="px-3 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-mono font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-neutral-700"
            >
              <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
              <span>Reset</span>
            </button>
          </div>
        </div>
      </div>

      {/* Historical Dossier Modal */}
      <MarioHistoryModal
        isOpen={isDossierOpen}
        onClose={() => setIsDossierOpen(false)}
        lang="nl"
      />

      {/* Game Controls & Xbox Modal */}
      <GameControlsModal
        isOpen={showControls}
        onClose={() => setShowControls(false)}
        gameId="mario"
      />
    </div>
  );
};
