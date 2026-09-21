/**
 * Impossible Mission (1984, Epyx / Dennis Caswell) - Commodore 64 Cabinet
 * Highest Tier (1-on-1 Faithful Recreation)
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  ArrowLeft,
  Volume2,
  VolumeX,
  RotateCcw,
  Sparkles,
  Tv,
  Gamepad2,
  Smartphone,
  CheckCircle2,
  Cpu,
  Trophy,
  Info,
  Layers,
  ChevronRight,
  RefreshCw,
  Zap,
  Clock
} from 'lucide-react';
import { ImpossibleMissionEngine } from '../game/impossibleMissionEngine';
import { impossibleMissionAudio } from '../game/impossibleMissionAudio';
import { getImpossibleMissionScores, ImpossibleMissionRecord } from '../game/impossibleMissionHighScores';
import { Language } from '../i18n/lobbyTranslations';
import { haptics } from '../utils/haptics';

interface ImpossibleMissionCabinetProps {
  onBackToLobby: () => void;
  lang?: Language;
}

export const ImpossibleMissionCabinet: React.FC<ImpossibleMissionCabinetProps> = ({
  onBackToLobby,
  lang = 'en'
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<ImpossibleMissionEngine>(new ImpossibleMissionEngine());
  const requestRef = useRef<number | null>(null);

  const [isMuted, setIsMuted] = useState(false);
  const [crtEffect, setCrtEffect] = useState(true);
  const [tiltEnabled, setTiltEnabled] = useState(false);
  const [tiltCalibrated, setTiltCalibrated] = useState(0);
  const [scores, setScores] = useState<ImpossibleMissionRecord[]>([]);
  const [showHighScores, setShowHighScores] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  // Input states
  const keysRef = useRef({
    left: false,
    right: false,
    up: false,
    down: false,
    jump: false,
    search: false,
    computer: false
  });

  const isEn = lang === 'en';

  useEffect(() => {
    setScores(getImpossibleMissionScores());
    engineRef.current.resetGame();
  }, []);

  // Format countdown clock: HH:MM:SS
  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Device orientation / gyroscope tilt handler
  useEffect(() => {
    if (!tiltEnabled) return;
    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (e.gamma !== null) {
        const tilt = e.gamma - tiltCalibrated;
        if (tilt < -10) {
          keysRef.current.left = true;
          keysRef.current.right = false;
        } else if (tilt > 10) {
          keysRef.current.right = true;
          keysRef.current.left = false;
        } else {
          keysRef.current.left = false;
          keysRef.current.right = false;
        }
      }
    };
    window.addEventListener('deviceorientation', handleOrientation);
    return () => window.removeEventListener('deviceorientation', handleOrientation);
  }, [tiltEnabled, tiltCalibrated]);

  // Keyboard handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
        e.preventDefault();
      }

      if (e.code === 'ArrowLeft' || e.code === 'KeyA') keysRef.current.left = true;
      if (e.code === 'ArrowRight' || e.code === 'KeyD') keysRef.current.right = true;
      if (e.code === 'ArrowUp' || e.code === 'KeyW') {
        keysRef.current.up = true;
        keysRef.current.search = true;
      }
      if (e.code === 'ArrowDown' || e.code === 'KeyS') keysRef.current.down = true;
      if (e.code === 'Space') keysRef.current.jump = true;
      if (e.code === 'KeyC' || e.code === 'Tab') {
        e.preventDefault();
        keysRef.current.computer = true;
      }
      if (e.code === 'KeyM') {
        const muted = impossibleMissionAudio.toggleMute();
        setIsMuted(muted);
      }
      if (e.code === 'KeyR') {
        engineRef.current.resetGame();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') keysRef.current.left = false;
      if (e.code === 'ArrowRight' || e.code === 'KeyD') keysRef.current.right = false;
      if (e.code === 'ArrowUp' || e.code === 'KeyW') {
        keysRef.current.up = false;
        keysRef.current.search = false;
      }
      if (e.code === 'ArrowDown' || e.code === 'KeyS') keysRef.current.down = false;
      if (e.code === 'Space') keysRef.current.jump = false;
      if (e.code === 'KeyC' || e.code === 'Tab') keysRef.current.computer = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Poll Gamepad (Xbox/PS)
  const pollGamepad = useCallback(() => {
    const gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
    const gp = gamepads[0] || gamepads[1];
    if (gp) {
      // D-Pad or Left Stick
      const axisX = gp.axes[0] || 0;
      const axisY = gp.axes[1] || 0;
      const dpadLeft = gp.buttons[14]?.pressed || false;
      const dpadRight = gp.buttons[15]?.pressed || false;
      const dpadUp = gp.buttons[12]?.pressed || false;
      const dpadDown = gp.buttons[13]?.pressed || false;

      keysRef.current.left = axisX < -0.3 || dpadLeft;
      keysRef.current.right = axisX > 0.3 || dpadRight;
      keysRef.current.up = axisY < -0.3 || dpadUp;
      keysRef.current.down = axisY > 0.3 || dpadDown;

      // Button A (jump/somersault)
      keysRef.current.jump = gp.buttons[0]?.pressed || false;
      // Button B (search)
      keysRef.current.search = gp.buttons[1]?.pressed || false;
      // Button Y or X (computer)
      if (gp.buttons[2]?.pressed || gp.buttons[3]?.pressed) {
        if (!keysRef.current.computer) {
          engineRef.current.toggleComputer();
        }
        keysRef.current.computer = true;
      } else {
        keysRef.current.computer = false;
      }
    }
  }, []);

  // Main Render Loop
  useEffect(() => {
    let lastTime = performance.now();

    const loop = (time: number) => {
      const dt = time - lastTime;
      lastTime = time;

      pollGamepad();
      engineRef.current.update(keysRef.current, dt);

      // Render onto canvas
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          renderGame(ctx, engineRef.current);
        }
      }

      requestRef.current = requestAnimationFrame(loop);
    };

    requestRef.current = requestAnimationFrame(loop);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [pollGamepad]);

  // Canvas Drawing Routine
  const renderGame = (ctx: CanvasRenderingContext2D, eng: ImpossibleMissionEngine) => {
    const W = 640;
    const H = 360;

    // Background - C64 Dark Grey / Black
    ctx.fillStyle = eng.penaltyFlash > 0 ? '#880000' : '#181820';
    ctx.fillRect(0, 0, W, H);

    if (eng.screen === 'shaft') {
      renderShaft(ctx, eng, W, H);
    } else if (eng.screen === 'room') {
      renderRoom(ctx, eng, W, H);
    } else if (eng.screen === 'elvin_lair') {
      renderElvinLair(ctx, eng, W, H);
    } else if (eng.screen === 'game_over') {
      renderGameOver(ctx, eng, W, H);
    } else if (eng.screen === 'victory') {
      renderVictory(ctx, eng, W, H);
    }

    // Top HUD Bar
    renderHUD(ctx, eng, W);

    // Notification Bar
    if (eng.notificationTimer > 0) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
      ctx.fillRect(40, H - 34, W - 80, 26);
      ctx.strokeStyle = '#d8e55b';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(40, H - 34, W - 80, 26);

      ctx.fillStyle = '#eeee77';
      ctx.font = 'bold 12px "Courier New", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(eng.notificationText, W / 2, H - 17);
    }
  };

  // Render Central Elevator Shaft
  const renderShaft = (ctx: CanvasRenderingContext2D, eng: ImpossibleMissionEngine, W: number, H: number) => {
    // Shaft walls (Left & Right concrete columns with steel rivets)
    ctx.fillStyle = '#40444f';
    ctx.fillRect(0, 0, 180, H);
    ctx.fillRect(460, 0, 180, H);

    // Cable rails in center shaft
    ctx.strokeStyle = '#22252a';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(270, 0);
    ctx.lineTo(270, H);
    ctx.moveTo(370, 0);
    ctx.lineTo(370, H);
    ctx.stroke();

    // Central cable
    ctx.strokeStyle = '#d8e55b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(320, 0);
    ctx.lineTo(320, H);
    ctx.stroke();

    // Corridor Doorways on the right (Floors 0 to 8)
    for (let f = 0; f <= 8; f++) {
      const doorY = eng.getFloorY(f);
      const isSelected = eng.currentShaftFloor === f;

      // Door recess
      ctx.fillStyle = isSelected ? '#102a45' : '#15171c';
      ctx.fillRect(460, doorY - 20, 70, 50);
      ctx.strokeStyle = isSelected ? '#4b75d6' : '#555';
      ctx.lineWidth = 2;
      ctx.strokeRect(460, doorY - 20, 70, 50);

      // Floor Label
      ctx.fillStyle = isSelected ? '#aaffee' : '#888';
      ctx.font = 'bold 10px monospace';
      ctx.textAlign = 'left';
      ctx.fillText(f === 0 ? 'LAIR' : `SEC ${f}`, 470, doorY + 8);

      // Hazard stripes on floor thresholds
      ctx.fillStyle = '#eab308';
      ctx.fillRect(430, doorY + 28, 30, 4);
    }

    // Elevator Car (Hydraulic carriage at elevatorY)
    const ey = eng.elevatorY;
    ctx.fillStyle = '#2c313d';
    ctx.fillRect(250, ey - 24, 140, 54);
    ctx.strokeStyle = '#4b75d6';
    ctx.lineWidth = 2;
    ctx.strokeRect(250, ey - 24, 140, 54);

    // Hazard stripes under elevator platform
    for (let i = 0; i < 7; i++) {
      ctx.fillStyle = i % 2 === 0 ? '#eab308' : '#000000';
      ctx.fillRect(250 + i * 20, ey + 30, 20, 5);
    }

    // Agent 4125 standing in elevator
    renderAgent(ctx, eng.agent);

    // Elevator call indicators
    ctx.fillStyle = '#ffffff';
    ctx.font = '10px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('▲ UP  /  ▼ DOWN  /  ► ENTER SECTOR', 320, H - 42);
  };

  // Render Subterranean Security Room
  const renderRoom = (ctx: CanvasRenderingContext2D, eng: ImpossibleMissionEngine, W: number, H: number) => {
    const room = eng.currentRoom;

    // Room wall styling
    ctx.fillStyle = '#12141a';
    ctx.fillRect(0, 0, W, H);

    // Platforms
    for (const p of room.platforms) {
      ctx.fillStyle = p.isLift ? '#3b82f6' : room.colorTheme;
      ctx.fillRect(p.x, p.y, p.width, p.height);

      // Top highlighted edge
      ctx.fillStyle = p.isLift ? '#93c5fd' : '#ffffff';
      ctx.fillRect(p.x, p.y, p.width, 2);

      // Platform grid/bracket details
      if (p.isLift) {
        ctx.fillStyle = '#1e3a8a';
        ctx.fillRect(p.x + 4, p.y + 4, p.width - 8, p.height - 6);
      }
    }

    // Exit Doorway on the left
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(room.exit.x, room.exit.y, room.exit.width, room.exit.height);
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.strokeRect(room.exit.x, room.exit.y, room.exit.width, room.exit.height);
    ctx.fillStyle = '#38bdf8';
    ctx.font = '9px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('SHAFT', room.exit.x + 15, room.exit.y + 32);

    // Furniture
    for (const f of room.furniture) {
      renderFurniture(ctx, f);
    }

    // Robots
    for (const r of room.robots) {
      renderRobot(ctx, r);
    }

    // Floating Orb
    if (room.orb && room.orb.active) {
      renderOrb(ctx, room.orb);
    }

    // Agent 4125
    renderAgent(ctx, eng.agent);

    // Search Progress Bar above agent
    if (eng.agent.state === 'searching') {
      const pct = eng.agent.searchTimer / 90;
      ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
      ctx.fillRect(eng.agent.x - 10, eng.agent.y - 14, 34, 8);
      ctx.fillStyle = '#10b981';
      ctx.fillRect(eng.agent.x - 9, eng.agent.y - 13, 32 * pct, 6);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.strokeRect(eng.agent.x - 10, eng.agent.y - 14, 34, 8);
    }
  };

  // Render Agent 4125 (Iconic gymnastic secret agent sprite)
  const renderAgent = (ctx: CanvasRenderingContext2D, a: ImpossibleMissionEngine['agent']) => {
    ctx.save();
    ctx.translate(a.x + a.width / 2, a.y + a.height / 2);

    // Somersault rotation if jumping!
    if (a.state === 'jumping') {
      ctx.rotate((a.flipAngle * Math.PI) / 180);
    }

    if (a.direction === -1) {
      ctx.scale(-1, 1);
    }

    const w = a.width;
    const h = a.height;

    if (a.state === 'electrocuted') {
      // Flashing skeleton / lightning outline
      ctx.fillStyle = Math.random() < 0.5 ? '#ffffff' : '#00ffff';
      ctx.fillRect(-w / 2, -h / 2, w, h);
      ctx.restore();
      return;
    }

    // Head (Tan / Skin tone)
    ctx.fillStyle = '#ffccaa';
    ctx.fillRect(-3, -h / 2, 7, 7);

    // Hair (Black)
    ctx.fillStyle = '#111111';
    ctx.fillRect(-3, -h / 2, 7, 2);

    // Torso (Black tactical suit)
    ctx.fillStyle = '#111111';
    ctx.fillRect(-4, -h / 2 + 7, 9, 14);

    // Arms
    ctx.fillStyle = '#ffccaa';
    if (a.state === 'searching') {
      // Hands extended forward typing
      ctx.fillRect(4, -h / 2 + 8, 6, 3);
    } else if (a.state === 'running') {
      const armSwing = Math.sin(a.animTimer * 0.4) * 4;
      ctx.fillRect(-2 + armSwing, -h / 2 + 9, 3, 7);
    } else {
      ctx.fillRect(-2, -h / 2 + 9, 3, 7);
    }

    // Legs / Running animation
    ctx.fillStyle = '#222222';
    if (a.state === 'running') {
      const legStride = (a.frame % 4);
      if (legStride === 0) {
        ctx.fillRect(-4, -h / 2 + 21, 3, 17);
        ctx.fillRect(2, -h / 2 + 21, 3, 15);
      } else if (legStride === 1) {
        ctx.fillRect(-2, -h / 2 + 21, 5, 16);
      } else if (legStride === 2) {
        ctx.fillRect(2, -h / 2 + 21, 3, 17);
        ctx.fillRect(-4, -h / 2 + 21, 3, 15);
      } else {
        ctx.fillRect(-3, -h / 2 + 21, 7, 14);
      }
    } else if (a.state === 'jumping') {
      // Tucked somersault legs
      ctx.fillRect(-5, -h / 2 + 19, 10, 10);
    } else {
      // Standing
      ctx.fillRect(-4, -h / 2 + 21, 3, 17);
      ctx.fillRect(2, -h / 2 + 21, 3, 17);
    }

    ctx.restore();
  };

  // Render Furniture (Computer, Desk, Terminal, Safe, etc.)
  const renderFurniture = (ctx: CanvasRenderingContext2D, f: ImpossibleMissionEngine['currentRoom']['furniture'][0]) => {
    ctx.save();
    const searchedColor = f.searched ? '#666666' : '#ffffff';

    if (f.type === 'computer') {
      // Large Mainframe rack with blinking tape reels
      ctx.fillStyle = '#1e222d';
      ctx.fillRect(f.x, f.y, f.width, f.height);
      ctx.strokeStyle = searchedColor;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(f.x, f.y, f.width, f.height);

      // Tape reels
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(f.x + 12, f.y + 14, 6, 0, Math.PI * 2);
      ctx.arc(f.x + 30, f.y + 14, 6, 0, Math.PI * 2);
      ctx.fill();

      // Flashing lights
      for (let r = 0; r < 3; r++) {
        ctx.fillStyle = (Math.random() < 0.3) ? '#10b981' : '#ef4444';
        ctx.fillRect(f.x + 6 + r * 10, f.y + 30, 4, 3);
      }
    } else if (f.type === 'terminal') {
      // Desktop computer with green phosphor monitor
      ctx.fillStyle = '#475569';
      ctx.fillRect(f.x, f.y + 16, f.width, f.height - 16);
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(f.x + 4, f.y, f.width - 8, 16);
      ctx.fillStyle = '#22c55e'; // Phosphor green
      ctx.fillRect(f.x + 6, f.y + 2, f.width - 12, 12);
    } else if (f.type === 'safe') {
      // Steel wall safe
      ctx.fillStyle = '#334155';
      ctx.fillRect(f.x, f.y, f.width, f.height);
      ctx.strokeStyle = searchedColor;
      ctx.strokeRect(f.x, f.y, f.width, f.height);
      // Combination dial
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.arc(f.x + f.width / 2, f.y + f.height / 2, 6, 0, Math.PI * 2);
      ctx.fill();
    } else if (f.type === 'filing_cabinet') {
      // 3-drawer cabinet
      ctx.fillStyle = '#64748b';
      ctx.fillRect(f.x, f.y, f.width, f.height);
      ctx.strokeStyle = '#1e293b';
      ctx.strokeRect(f.x, f.y, f.width, f.height);
      for (let d = 0; d < 3; d++) {
        ctx.fillStyle = '#334155';
        ctx.fillRect(f.x + 2, f.y + 2 + d * 13, f.width - 4, 11);
        ctx.fillStyle = '#e2e8f0';
        ctx.fillRect(f.x + f.width / 2 - 4, f.y + 6 + d * 13, 8, 2);
      }
    } else {
      // Generic console or desk
      ctx.fillStyle = '#475569';
      ctx.fillRect(f.x, f.y, f.width, f.height);
      ctx.strokeStyle = searchedColor;
      ctx.strokeRect(f.x, f.y, f.width, f.height);
    }

    // Unsearched hint sparkle
    if (!f.searched) {
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.arc(f.x + f.width - 4, f.y + 4, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  };

  // Render Robot
  const renderRobot = (ctx: CanvasRenderingContext2D, r: ImpossibleMissionEngine['currentRoom']['robots'][0]) => {
    ctx.save();
    const isSnoozed = r.snoozedTimer > 0;

    // Chassis body (Metallic grey cylinder with dome)
    ctx.fillStyle = isSnoozed ? '#64748b' : '#94a3b8';
    ctx.fillRect(r.x, r.y + 4, r.width, r.height - 4);

    // Domed head
    ctx.beginPath();
    ctx.arc(r.x + r.width / 2, r.y + 4, r.width / 2, Math.PI, 0);
    ctx.fill();

    // Central optical sensor (Red/Yellow eye)
    ctx.fillStyle = isSnoozed ? '#334155' : (r.laserFiring ? '#ef4444' : '#eab308');
    ctx.fillRect(r.x + (r.direction === 1 ? r.width - 8 : 2), r.y + 4, 6, 4);

    // Tread tracks at bottom
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(r.x - 2, r.y + r.height - 3, r.width + 4, 4);

    // Laser Beam rendering if firing
    if (r.laserFiring && r.laserBeam) {
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 3;
      ctx.shadowColor = '#f87171';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.moveTo(r.laserBeam.x1, r.laserBeam.y1);
      ctx.lineTo(r.laserBeam.x2, r.laserBeam.y2);
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    // Snooze ZZZ indicator
    if (isSnoozed) {
      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 9px monospace';
      ctx.fillText('ZZZ', r.x + 4, r.y - 4);
    }

    ctx.restore();
  };

  // Render Floating Black Orb
  const renderOrb = (ctx: CanvasRenderingContext2D, orb: ImpossibleMissionEngine['currentRoom']['orb']) => {
    if (!orb) return;
    ctx.save();
    ctx.fillStyle = '#050508';
    ctx.beginPath();
    ctx.arc(orb.x, orb.y, orb.radius, 0, Math.PI * 2);
    ctx.fill();

    // Shimmering purple / electric corona
    ctx.strokeStyle = '#c084fc';
    ctx.lineWidth = 2;
    ctx.shadowColor = '#a855f7';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(orb.x, orb.y, orb.radius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Crackling sparks
    for (let i = 0; i < 3; i++) {
      ctx.fillStyle = '#ffffff';
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * orb.radius;
      ctx.fillRect(orb.x + Math.cos(angle) * dist, orb.y + Math.sin(angle) * dist, 1.5, 1.5);
    }
    ctx.restore();
  };

  // Render Professor Elvin Atombender's Lair
  const renderElvinLair = (ctx: CanvasRenderingContext2D, eng: ImpossibleMissionEngine, W: number, H: number) => {
    ctx.fillStyle = '#100510';
    ctx.fillRect(0, 0, W, H);

    // High-tech missile silo backdrop
    ctx.fillStyle = '#1f1325';
    ctx.fillRect(60, 40, W - 120, 260);

    // Massive nuclear missile in silo tube
    ctx.fillStyle = '#475569';
    ctx.fillRect(440, 20, 80, 280);
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(440, 20, 80, 40); // Warhead nosecone

    // Missile countdown status
    ctx.fillStyle = '#ef4444';
    ctx.font = 'bold 16px "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('WARNING: NUCLEAR LAUNCH SEQUENCE ACTIVE', W / 2, 70);

    // Defusal Console at right
    ctx.fillStyle = '#10b981';
    ctx.fillRect(520, 240, 50, 60);
    ctx.strokeStyle = '#ffffff';
    ctx.strokeRect(520, 240, 50, 60);
    ctx.fillStyle = '#ffffff';
    ctx.font = '9px monospace';
    ctx.fillText('DISARM', 545, 275);

    // Floor
    ctx.fillStyle = '#3b0764';
    ctx.fillRect(0, 300, W, 20);

    // Agent
    renderAgent(ctx, eng.agent);
  };

  // Render Game Over Screen
  const renderGameOver = (ctx: CanvasRenderingContext2D, eng: ImpossibleMissionEngine, W: number, H: number) => {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
    ctx.fillRect(0, 0, W, H);

    ctx.fillStyle = '#ef4444';
    ctx.font = 'bold 24px "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('MISSION FAILED', W / 2, 130);

    ctx.fillStyle = '#ffffff';
    ctx.font = '14px monospace';
    ctx.fillText(eng.notificationText, W / 2, 170);

    ctx.fillStyle = '#eeee77';
    ctx.font = '12px monospace';
    ctx.fillText('PRESS R OR CLICK RESTART TO TRY AGAIN', W / 2, 220);
  };

  // Render Victory Screen
  const renderVictory = (ctx: CanvasRenderingContext2D, eng: ImpossibleMissionEngine, W: number, H: number) => {
    ctx.fillStyle = 'rgba(5, 20, 15, 0.95)';
    ctx.fillRect(0, 0, W, H);

    ctx.fillStyle = '#10b981';
    ctx.font = 'bold 26px "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('MISSION ACCOMPLISHED!', W / 2, 110);

    ctx.fillStyle = '#ffffff';
    ctx.font = '14px monospace';
    ctx.fillText('ATOMBENDER LAUNCH ABORTED - WORLD SAVED', W / 2, 150);

    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 16px "Courier New", monospace';
    ctx.fillText(`TIME REMAINING: ${formatTime(eng.remainingSeconds)}`, W / 2, 190);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '12px monospace';
    ctx.fillText('PRESS R TO INFILTRATE AGAIN', W / 2, 240);
  };

  // Render Top HUD Bar
  const renderHUD = (ctx: CanvasRenderingContext2D, eng: ImpossibleMissionEngine, W: number) => {
    ctx.fillStyle = '#0a0d14';
    ctx.fillRect(0, 0, W, 28);
    ctx.strokeStyle = '#222938';
    ctx.lineWidth = 1;
    ctx.strokeRect(0, 0, W, 28);

    // Countdown Clock
    ctx.fillStyle = eng.remainingSeconds < 3600 ? '#ef4444' : '#22c55e';
    ctx.font = 'bold 14px "Courier New", monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`⏱ CLOCK ${formatTime(eng.remainingSeconds)}`, 14, 19);

    // Solved Cards & Puzzle Pieces
    const foundPieces = eng.puzzlePieces.filter(p => p.found).length;
    const solvedCards = eng.punchCards.filter(c => c.solved).length;
    ctx.fillStyle = '#e2e8f0';
    ctx.font = '11px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`PUZZLES: ${foundPieces}/36  |  CARDS: ${solvedCards}/9`, W / 2, 19);

    // Passcodes
    ctx.textAlign = 'right';
    ctx.fillStyle = '#38bdf8';
    ctx.fillText(`SNOOZE: ${eng.computer.snoozePasscodes}  LIFT: ${eng.computer.liftResetPasscodes}`, W - 14, 19);
  };

  const eng = engineRef.current;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-2 sm:p-6 select-none">
      {/* Top Header Bar */}
      <div className="w-full max-w-4xl flex items-center justify-between mb-3 px-2">
        <button
          onClick={onBackToLobby}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-neutral-900 border border-neutral-700 hover:bg-neutral-800 text-xs font-mono text-neutral-300 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{isEn ? 'Arcade Lobby' : 'Speelhal Lobby'}</span>
        </button>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-950/60 border border-blue-800/80 text-blue-300 text-xs font-mono font-bold">
            <Cpu className="w-3.5 h-3.5 text-blue-400" />
            <span>COMMODORE 64 • 1984</span>
          </div>

          <button
            onClick={() => {
              const m = impossibleMissionAudio.toggleMute();
              setIsMuted(m);
            }}
            className="p-2 rounded-lg bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 text-neutral-300 transition-colors"
            title="Mute / Unmute"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>

          <button
            onClick={() => setCrtEffect(!crtEffect)}
            className={`p-2 rounded-lg border text-xs font-mono transition-colors ${
              crtEffect ? 'bg-cyan-950 border-cyan-800 text-cyan-300' : 'bg-neutral-900 border-neutral-800 text-neutral-400'
            }`}
            title="CRT Scanlines"
          >
            <Tv className="w-4 h-4" />
          </button>

          <button
            onClick={() => setShowHelp(!showHelp)}
            className="p-2 rounded-lg bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 text-neutral-300"
            title="Controls & Intel"
          >
            <Info className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main CRT Cabinet Frame */}
      <div className="relative w-full max-w-4xl bg-neutral-900 border-4 border-neutral-800 rounded-3xl p-3 sm:p-5 shadow-2xl overflow-hidden">
        {/* CRT Scanline Overlay */}
        {crtEffect && (
          <div className="absolute inset-0 pointer-events-none z-10 opacity-20 bg-[radial-gradient(ellipse_at_center,_transparent_60%,_black_100%)] bg-repeat"
            style={{
              backgroundImage: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.5) 50%)',
              backgroundSize: '100% 4px'
            }}
          />
        )}

        {/* Screen Canvas */}
        <canvas
          ref={canvasRef}
          width={640}
          height={360}
          className="w-full aspect-[16/9] rounded-xl bg-black shadow-inner block border border-neutral-800"
        />

        {/* Pocket Computer Modal / Overlay */}
        {eng.computer.isOpen && (
          <div className="absolute inset-4 z-20 rounded-2xl bg-neutral-950/95 border-2 border-emerald-500/80 p-4 sm:p-6 flex flex-col font-mono text-xs text-emerald-400 shadow-2xl backdrop-blur-sm">
            <div className="flex items-center justify-between border-b border-emerald-800/60 pb-3 mb-4">
              <div className="flex items-center gap-2 font-bold text-sm text-emerald-300">
                <Cpu className="w-4 h-4 text-emerald-400" />
                <span>AGENT 4125 • POCKET COMPUTER V2.4</span>
              </div>
              <button
                onClick={() => eng.toggleComputer()}
                className="px-3 py-1 bg-emerald-950 border border-emerald-700 text-emerald-300 rounded hover:bg-emerald-900 font-bold"
              >
                CLOSE [SPACE]
              </button>
            </div>

            {/* Quick Action Buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
              <button
                onClick={() => eng.useSnoozePasscode()}
                disabled={eng.computer.snoozePasscodes <= 0}
                className={`p-2.5 rounded-lg border text-left flex flex-col justify-between ${
                  eng.computer.snoozePasscodes > 0
                    ? 'bg-emerald-950/60 border-emerald-600 hover:bg-emerald-900 text-emerald-200'
                    : 'bg-neutral-900 border-neutral-800 text-neutral-600 cursor-not-allowed'
                }`}
              >
                <div className="font-bold flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>SNOOZE ROBOTS</span>
                </div>
                <span className="text-[10px] text-neutral-400">Remaining: {eng.computer.snoozePasscodes}</span>
              </button>

              <button
                onClick={() => eng.useLiftResetPasscode()}
                disabled={eng.computer.liftResetPasscodes <= 0}
                className={`p-2.5 rounded-lg border text-left flex flex-col justify-between ${
                  eng.computer.liftResetPasscodes > 0
                    ? 'bg-emerald-950/60 border-emerald-600 hover:bg-emerald-900 text-emerald-200'
                    : 'bg-neutral-900 border-neutral-800 text-neutral-600 cursor-not-allowed'
                }`}
              >
                <div className="font-bold flex items-center gap-1.5">
                  <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
                  <span>RESET LIFTS</span>
                </div>
                <span className="text-[10px] text-neutral-400">Remaining: {eng.computer.liftResetPasscodes}</span>
              </button>

              <button
                onClick={() => impossibleMissionAudio.playElvinWelcome()}
                className="p-2.5 rounded-lg bg-neutral-900 border border-emerald-900/60 hover:bg-neutral-800 text-left flex flex-col justify-between"
              >
                <div className="font-bold text-amber-300">VOICE LOG #1</div>
                <span className="text-[10px] text-neutral-400">"Stay a while..."</span>
              </button>

              <button
                onClick={() => impossibleMissionAudio.playDestroyHim()}
                className="p-2.5 rounded-lg bg-neutral-900 border border-emerald-900/60 hover:bg-neutral-800 text-left flex flex-col justify-between"
              >
                <div className="font-bold text-red-300">VOICE LOG #2</div>
                <span className="text-[10px] text-neutral-400">"Destroy him..."</span>
              </button>
            </div>

            {/* Punch Cards & Collected Pieces */}
            <div className="flex-1 overflow-y-auto pr-1">
              <div className="text-neutral-300 font-bold mb-2">
                COLLECTED PUNCH CARDS ({eng.punchCards.filter(c => c.solved).length}/9 SOLVED)
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-9 gap-2">
                {eng.punchCards.map((card) => (
                  <div
                    key={card.id}
                    className={`p-2 rounded-lg border text-center ${
                      card.solved
                        ? 'bg-emerald-900/40 border-emerald-500 text-emerald-300'
                        : 'bg-black/60 border-neutral-800 text-neutral-500'
                    }`}
                  >
                    <div className="font-bold text-xs mb-1">CARD {card.id + 1}</div>
                    <div className="text-[10px]">
                      {card.solved ? '🟢 READY' : '🔒 INCOMPLETE'}
                    </div>
                  </div>
                ))}
              </div>

              {/* Found Pieces Gallery */}
              <div className="text-neutral-300 font-bold mt-4 mb-2">
                PUZZLE INVENTORY (CLICK PIECE TO ROTATE 90° OR FLIP)
              </div>
              <div className="grid grid-cols-4 sm:grid-cols-9 gap-2">
                {eng.puzzlePieces.filter(p => p.found).map((piece) => (
                  <div
                    key={piece.id}
                    onClick={() => eng.rotatePiece(piece.id)}
                    className="p-2 rounded bg-neutral-900 border border-emerald-700/60 hover:border-emerald-400 cursor-pointer flex flex-col items-center justify-center gap-1"
                    title="Click to Rotate"
                  >
                    <div className="font-mono text-[10px] text-emerald-300">#{piece.id + 1}</div>
                    <div
                      className="w-6 h-6 border border-emerald-500 flex items-center justify-center text-[10px] font-bold"
                      style={{
                        transform: `rotate(${piece.rotation}deg) scaleX(${piece.flipped ? -1 : 1})`,
                        backgroundColor: '#064e3b'
                      }}
                    >
                      🧩
                    </div>
                    <div className="text-[9px] text-neutral-400">{piece.rotation}°</div>
                  </div>
                ))}
                {eng.puzzlePieces.filter(p => p.found).length === 0 && (
                  <div className="col-span-4 sm:col-span-9 text-neutral-500 italic py-4 text-center">
                    No puzzle pieces found yet. Search computer mainframes, desks, and safes across security sectors!
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Arcade Dashboard & Controls Bar */}
      <div className="w-full max-w-4xl mt-4 flex flex-wrap items-center justify-between gap-3 bg-neutral-950 p-3 rounded-2xl border border-neutral-800">
        {/* Interactive Action Triggers */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              keysRef.current.jump = true;
              setTimeout(() => { keysRef.current.jump = false; }, 120);
            }}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-mono font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-lg shadow-blue-600/20"
          >
            <span>SOMERSAULT JUMP [SPACE]</span>
          </button>

          <button
            onClick={() => {
              keysRef.current.search = true;
              setTimeout(() => { keysRef.current.search = false; }, 120);
            }}
            className="px-3.5 py-2 bg-neutral-800 hover:bg-neutral-700 active:scale-95 text-neutral-200 font-mono font-bold rounded-xl text-xs flex items-center gap-1.5"
          >
            <span>SEARCH [▲ / W]</span>
          </button>

          <button
            onClick={() => eng.toggleComputer()}
            className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-600 active:scale-95 text-white font-mono font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-700/20"
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>POCKET COMPUTER [C]</span>
          </button>
        </div>

        {/* Mobile Tilt & Hardware */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setTiltEnabled(!tiltEnabled);
              haptics.selection();
            }}
            className={`px-3 py-1.5 rounded-xl border text-xs font-mono flex items-center gap-1.5 transition-colors ${
              tiltEnabled ? 'bg-amber-950 border-amber-800 text-amber-300' : 'bg-neutral-900 border-neutral-800 text-neutral-400'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>{tiltEnabled ? 'Tilt: ON' : 'Tilt: OFF'}</span>
          </button>

          <button
            onClick={() => engineRef.current.resetGame()}
            className="p-2 rounded-xl bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 text-neutral-400 hover:text-white"
            title="Reset Mission"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Info / Controls Modal */}
      {showHelp && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-neutral-900 border-2 border-neutral-700 rounded-3xl p-6 max-w-lg w-full space-y-4 font-sans text-xs">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="font-mono font-bold text-sm text-cyan-400 flex items-center gap-2">
                <Info className="w-4 h-4 text-cyan-400" />
                <span>{isEn ? 'Impossible Mission - Field Manual' : 'Impossible Mission - Handleiding'}</span>
              </div>
              <button
                onClick={() => setShowHelp(false)}
                className="px-2.5 py-1 bg-neutral-800 hover:bg-neutral-700 text-white rounded font-mono"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-neutral-300 leading-relaxed">
              <p>
                {isEn
                  ? 'Infiltrate the subterranean fortress of Professor Elvin Atombender! You have 6 hours on the mission clock before his nuclear missile launches.'
                  : 'Infiltreer het ondergrondse bolwerk van professor Elvin Atombender! Je hebt 6 uur op de klok voordat zijn nucleaire raket wordt gelanceerd.'}
              </p>

              <div className="p-3 rounded-xl bg-black/60 border border-neutral-800 space-y-1.5 font-mono text-[11px]">
                <div className="text-amber-300 font-bold">🎮 BESTURING / CONTROLS:</div>
                <div>• <strong>← / → / A / D</strong>: {isEn ? 'Run left and right' : 'Links en rechts rennen'}</div>
                <div>• <strong>SPACE</strong>: {isEn ? 'Gymnastic 360° Somersault Jump' : 'Gymnastieke salto / vliegende sprong'}</div>
                <div>• <strong>↑ / W</strong>: {isEn ? 'Search furniture / ride elevator up' : 'Meubels doorzoeken / lift omhoog'}</div>
                <div>• <strong>↓ / S</strong>: {isEn ? 'Crouch / ride elevator down' : 'Bukken / lift omlaag'}</div>
                <div>• <strong>C / TAB</strong>: {isEn ? 'Open Agent Pocket Computer' : 'Zakcomputer openen'}</div>
                <div>• <strong>XBOX / GAMEPAD</strong>: {isEn ? 'Plug & Play on PC (A=Jump, B=Search, Y=Computer)' : 'Plug & Play (A=Springen, B=Zoeken, Y=Computer)'}</div>
              </div>

              <div className="p-3 rounded-xl bg-red-950/30 border border-red-800/40 text-red-300 text-[11px]">
                ⚠️ <strong>{isEn ? 'DEATH PENALTY:' : 'STRAF BIJ OVERLIJDEN:'}</strong>{' '}
                {isEn
                  ? 'Falling down shafts or touching lasers costs a 10-minute penalty on the mission clock!'
                  : 'In een schacht vallen of door lasers worden geraakt kost direct 10 kostbare minuten op de klok!'}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
