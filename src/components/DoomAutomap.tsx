import React, { useEffect, useRef } from 'react';
import { DoomEngine } from '../game/doomEngine';

interface DoomAutomapProps {
  engine: DoomEngine;
  onClose: () => void;
}

export const DoomAutomap: React.FC<DoomAutomapProps> = ({ engine, onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let animId: number;

    const render = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const width = canvas.width;
      const height = canvas.height;

      // Deep CRT phosphor black background
      ctx.fillStyle = '#060a06';
      ctx.fillRect(0, 0, width, height);

      // Faint green grid lines (CAD / Vector radar screen)
      ctx.strokeStyle = 'rgba(22, 101, 52, 0.25)';
      ctx.lineWidth = 1;
      const gridSpacing = 24;
      ctx.beginPath();
      for (let x = 0; x < width; x += gridSpacing) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
      }
      for (let y = 0; y < height; y += gridSpacing) {
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
      }
      ctx.stroke();

      const map = engine.currentMap;
      if (!map) return;

      const gridW = map.gridWidth;
      const gridH = map.gridHeight;
      const cellSize = Math.min((width - 80) / gridW, (height - 80) / gridH);
      const offsetX = (width - gridW * cellSize) / 2;
      const offsetY = (height - gridH * cellSize) / 2;

      // Draw map geometry & sectors
      for (let z = 0; z < gridH; z++) {
        for (let x = 0; x < gridW; x++) {
          const cell = map.layout[z]?.[x] ?? 0;
          const px = offsetX + x * cellSize;
          const py = offsetY + z * cellSize;

          if (cell === 8) {
            // Nukage radioactive acid pool
            ctx.fillStyle = 'rgba(34, 197, 94, 0.15)';
            ctx.fillRect(px, py, cellSize, cellSize);
            ctx.strokeStyle = 'rgba(74, 222, 128, 0.4)';
            ctx.lineWidth = 1;
            ctx.strokeRect(px, py, cellSize, cellSize);
          } else if (cell === 1 || cell === 2) {
            // Solid Walls (Vector outline in classic Doom reddish-brown / amber)
            ctx.strokeStyle = '#b45309';
            ctx.lineWidth = 2;
            ctx.strokeRect(px, py, cellSize, cellSize);
          } else if (cell === 4) {
            // Computer Terminal Walls (Teal/Cyan highlight)
            ctx.fillStyle = 'rgba(6, 182, 212, 0.2)';
            ctx.fillRect(px, py, cellSize, cellSize);
            ctx.strokeStyle = '#06b6d4';
            ctx.lineWidth = 2;
            ctx.strokeRect(px, py, cellSize, cellSize);
          } else if (cell === 3) {
            // Standard Sliding Blast Door (Yellow vector line)
            ctx.fillStyle = 'rgba(234, 179, 8, 0.2)';
            ctx.fillRect(px, py, cellSize, cellSize);
            ctx.strokeStyle = '#eab308';
            ctx.lineWidth = 2.5;
            ctx.strokeRect(px, py, cellSize, cellSize);
          } else if (cell === 5) {
            // Level Exit Door (Bright red / pulsating amber)
            ctx.fillStyle = 'rgba(239, 68, 68, 0.3)';
            ctx.fillRect(px, py, cellSize, cellSize);
            ctx.strokeStyle = '#ef4444';
            ctx.lineWidth = 2.5;
            ctx.strokeRect(px, py, cellSize, cellSize);
          } else if (cell === 6) {
            // Keycard Door (Electric Blue)
            ctx.fillStyle = 'rgba(59, 130, 246, 0.3)';
            ctx.fillRect(px, py, cellSize, cellSize);
            ctx.strokeStyle = '#3b82f6';
            ctx.lineWidth = 2.5;
            ctx.strokeRect(px, py, cellSize, cellSize);
          } else if (cell === 9) {
            // Secret Chamber Wall (Purple / Violet)
            ctx.fillStyle = 'rgba(168, 85, 247, 0.2)';
            ctx.fillRect(px, py, cellSize, cellSize);
            ctx.strokeStyle = '#a855f7';
            ctx.lineWidth = 2;
            ctx.strokeRect(px, py, cellSize, cellSize);
          }
        }
      }

      // Draw Items / Pickups (Gold / Yellow diamonds)
      const items = engine.getItems();
      for (const item of items) {
        if (item.collected) continue;
        const ix = offsetX + item.x * cellSize;
        const iy = offsetY + item.z * cellSize;

        ctx.fillStyle = item.type === 'blue_key' ? '#38bdf8' : item.type === 'barrel' ? '#22c55e' : '#facc15';
        ctx.beginPath();
        ctx.arc(ix, iy, 3, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw Monsters (Red blinking dots on radar)
      const monsters = engine.getMonsters();
      for (const m of monsters) {
        if (m.state === 'dead') continue;
        const mx = offsetX + m.x * cellSize;
        const my = offsetY + m.z * cellSize;

        ctx.fillStyle = m.alert ? '#ef4444' : '#f87171';
        ctx.beginPath();
        ctx.arc(mx, my, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#450a0a';
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Draw Secrets markers if any
      if (map.secrets) {
        for (const s of map.secrets) {
          const sx = offsetX + (s.x + 0.5) * cellSize;
          const sy = offsetY + (s.z + 0.5) * cellSize;
          ctx.strokeStyle = s.found ? '#22c55e' : '#c084fc';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(sx, sy, 5, 0, Math.PI * 2);
          ctx.stroke();
        }
      }

      // Draw Player Arrow (Iconic white/lime green directional triangle)
      const playerX = offsetX + engine.posX * cellSize;
      const playerZ = offsetY + engine.posZ * cellSize;
      // In Three.js: rotAngle is player view. 0 is looking -Z.
      // Direction in 2D map: dx = -sin(rotAngle), dz = -cos(rotAngle)
      const dirX = -Math.sin(engine.rotAngle);
      const dirZ = -Math.cos(engine.rotAngle);

      // Player Arrowhead
      ctx.save();
      ctx.translate(playerX, playerZ);
      ctx.rotate(Math.atan2(dirZ, dirX));

      // Glow effect for player
      ctx.shadowColor = '#22c55e';
      ctx.shadowBlur = 8;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(10, 0);
      ctx.lineTo(-7, -6);
      ctx.lineTo(-3, 0);
      ctx.lineTo(-7, 6);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.restore();

      // Draw CRT scanlines on Automap canvas
      ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
      for (let y = 0; y < height; y += 3) {
        ctx.fillRect(0, y, width, 1);
      }

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [engine]);

  return (
    <div
      id="doom-automap-modal"
      className="absolute inset-0 z-30 bg-black/95 flex flex-col items-center justify-between p-3 select-none"
    >
      {/* Automap Header */}
      <div className="w-full flex items-center justify-between border-b border-green-800/80 pb-2 px-2">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_#22c55e]" />
          <div>
            <span className="font-mono text-xs sm:text-sm font-black text-green-400 tracking-wider">
              {engine.stats.levelName} - UAC TACTICAL COMPUTER AUTOMAP
            </span>
            <span className="hidden sm:inline-block ml-3 font-mono text-xs text-green-600">
              [TAB] TO EXIT MAP
            </span>
          </div>
        </div>

        <button
          id="doom-automap-close-btn"
          onClick={onClose}
          className="px-3 py-1 bg-green-950/80 hover:bg-green-900 border border-green-600/80 text-green-300 rounded font-mono text-xs font-bold transition cursor-pointer"
        >
          SLUITEN (TAB)
        </button>
      </div>

      {/* Vector Canvas */}
      <div className="relative flex-1 w-full flex items-center justify-center overflow-hidden my-2 border border-green-900/60 rounded bg-[#040904]">
        <canvas
          ref={canvasRef}
          width={800}
          height={500}
          className="w-full h-full object-contain"
        />

        {/* Legend Overlay at bottom left */}
        <div className="absolute bottom-2 left-2 p-2 bg-black/85 border border-green-900/80 rounded font-mono text-[10px] text-green-400 space-y-0.5 backdrop-blur-sm hidden sm:block">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2.5 h-2.5 bg-white border border-green-500" />
            <span>Speler (Positie &amp; Richting)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block w-2.5 h-2.5 border border-amber-600" />
            <span>Muren (STARGR / BRICK)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block w-2.5 h-2.5 bg-yellow-500" />
            <span>Deur / Schuifluik</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block w-2.5 h-2.5 bg-red-600 rounded-full" />
            <span>Vijand / Monster</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block w-2.5 h-2.5 bg-cyan-400" />
            <span>Computer Terminals</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-block w-2.5 h-2.5 bg-emerald-500/50" />
            <span>Giftig Nukage Zuur</span>
          </div>
        </div>

        {/* Live Coordinate readout at bottom right */}
        <div className="absolute bottom-2 right-2 p-2 bg-black/85 border border-green-900/80 rounded font-mono text-[10px] text-green-400 space-y-0.5 backdrop-blur-sm text-right">
          <div>X: {engine.posX.toFixed(1)} | Z: {engine.posZ.toFixed(1)}</div>
          <div>VIJANDEN: {engine.stats.kills} / {engine.stats.totalMonsters}</div>
          <div>GEHEIMEN: {engine.stats.secrets} / {engine.stats.totalSecrets}</div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="w-full flex items-center justify-between font-mono text-[11px] text-green-500/80 px-2">
        <span>TIP: Druk op TAB of klik op Sluiten om direct terug te keren naar het 3D gezichtsveld.</span>
        <span>UAC SATELLITE LINK ACTIVE</span>
      </div>
    </div>
  );
};
