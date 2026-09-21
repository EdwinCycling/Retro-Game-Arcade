import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import type { WolfensteinEngine } from '../game/wolfensteinEngine';

interface WolfensteinAutomapModalProps {
  engine: WolfensteinEngine | null;
  onClose: () => void;
}

export const WolfensteinAutomapModal: React.FC<WolfensteinAutomapModalProps> = ({
  engine,
  onClose,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    let animId: number;

    const renderMap = () => {
      const canvas = canvasRef.current;
      if (!canvas || !engine) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const data = engine.getAutomapInfo();
      const { mapSize, map, visited, posX, posZ, angle, doors, guards, pushWalls } = data;

      const size = canvas.width;
      const cellSize = size / mapSize;

      // Clear dark CRT background
      ctx.fillStyle = '#061009';
      ctx.fillRect(0, 0, size, size);

      // Subtle grid
      ctx.strokeStyle = '#0f2917';
      ctx.lineWidth = 1;
      for (let i = 0; i <= mapSize; i++) {
        ctx.beginPath();
        ctx.moveTo(i * cellSize, 0);
        ctx.lineTo(i * cellSize, size);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, i * cellSize);
        ctx.lineTo(size, i * cellSize);
        ctx.stroke();
      }

      // Draw Cells
      for (let z = 0; z < mapSize; z++) {
        for (let x = 0; x < mapSize; x++) {
          const isVisited = visited[z] && visited[z][x];
          const cell = map[z][x];
          const px = x * cellSize;
          const pz = z * cellSize;

          if (!isVisited) {
            // Fog of war
            ctx.fillStyle = '#020704';
            ctx.fillRect(px, pz, cellSize, cellSize);
            // tiny dot
            ctx.fillStyle = '#0a1a0f';
            ctx.fillRect(px + cellSize / 2 - 1, pz + cellSize / 2 - 1, 2, 2);
            continue;
          }

          // Visited floor
          if (cell === 0) {
            ctx.fillStyle = '#0b2615';
            ctx.fillRect(px + 1, pz + 1, cellSize - 2, cellSize - 2);
          } else if (cell === 6) {
            // Elevator
            ctx.fillStyle = '#f59e0b';
            ctx.fillRect(px + 1, pz + 1, cellSize - 2, cellSize - 2);
            ctx.fillStyle = '#000000';
            ctx.font = 'bold 9px monospace';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('LIFT', px + cellSize / 2, pz + cellSize / 2);
          } else if (cell === 7) {
            // Door
            const door = doors.find((d) => d.x === x && d.z === z);
            const isOpen = door && door.openAmount > 0.6;
            ctx.fillStyle = isOpen ? '#0284c7' : '#0369a1';
            ctx.fillRect(px + 2, pz + 2, cellSize - 4, cellSize - 4);
            ctx.strokeStyle = '#38bdf8';
            ctx.strokeRect(px + 2, pz + 2, cellSize - 4, cellSize - 4);
          } else if (cell === 8) {
            // Push-wall
            ctx.fillStyle = '#854d0e';
            ctx.fillRect(px + 1, pz + 1, cellSize - 2, cellSize - 2);
            ctx.fillStyle = '#fef08a';
            ctx.font = 'bold 8px monospace';
            ctx.textAlign = 'center';
            ctx.fillText('?', px + cellSize / 2, pz + cellSize / 2);
          } else {
            // Walls (1, 2, 3, 4, 5)
            if (cell === 2) ctx.fillStyle = '#1e3a8a'; // Blue wall
            else if (cell === 3) ctx.fillStyle = '#78350f'; // Wood wall
            else if (cell === 4) ctx.fillStyle = '#991b1b'; // Eagle red
            else ctx.fillStyle = '#374151'; // Grey stone

            ctx.fillRect(px + 0.5, pz + 0.5, cellSize - 1, cellSize - 1);
            ctx.strokeStyle = '#4b5563';
            ctx.strokeRect(px + 0.5, pz + 0.5, cellSize - 1, cellSize - 1);
          }
        }
      }

      // Draw push wall active animation if any
      pushWalls.forEach((pw) => {
        if (visited[pw.z] && visited[pw.z][pw.x]) {
          const px = pw.x * cellSize;
          const pz = pw.z * cellSize;
          ctx.strokeStyle = '#eab308';
          ctx.lineWidth = 1.5;
          ctx.strokeRect(px + 1, pz + 1, cellSize - 2, cellSize - 2);
        }
      });

      // Draw Guards (only if in visited cell)
      guards.forEach((g) => {
        const gx = Math.floor(g.x);
        const gz = Math.floor(g.z);
        if (visited[gz] && visited[gz][gx] && !g.dead) {
          if (g.type === 'boss') {
            ctx.fillStyle = '#eab308';
            ctx.beginPath();
            ctx.arc(g.x * cellSize, g.z * cellSize, cellSize * 0.55, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#dc2626';
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.fillStyle = '#000';
            ctx.font = 'bold 7px monospace';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('BOSS', g.x * cellSize, g.z * cellSize);
          } else if (g.type === 'ss') {
            ctx.fillStyle = '#38bdf8';
            ctx.beginPath();
            ctx.arc(g.x * cellSize, g.z * cellSize, cellSize * 0.38, 0, Math.PI * 2);
            ctx.fill();
          } else if (g.type === 'dog') {
            ctx.fillStyle = '#d97706';
            ctx.beginPath();
            ctx.arc(g.x * cellSize, g.z * cellSize, cellSize * 0.28, 0, Math.PI * 2);
            ctx.fill();
          } else {
            ctx.fillStyle = '#ef4444';
            ctx.beginPath();
            ctx.arc(g.x * cellSize, g.z * cellSize, cellSize * 0.35, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      });

      // Draw Player
      const plX = posX * cellSize;
      const plZ = posZ * cellSize;

      // Sight cone
      ctx.fillStyle = 'rgba(234, 179, 8, 0.18)';
      ctx.beginPath();
      ctx.moveTo(plX, plZ);
      const leftRayX = plX + Math.cos(angle - 0.4) * (cellSize * 3.5);
      const leftRayZ = plZ + Math.sin(angle - 0.4) * (cellSize * 3.5);
      const rightRayX = plX + Math.cos(angle + 0.4) * (cellSize * 3.5);
      const rightRayZ = plZ + Math.sin(angle + 0.4) * (cellSize * 3.5);
      ctx.lineTo(leftRayX, leftRayZ);
      ctx.lineTo(rightRayX, rightRayZ);
      ctx.closePath();
      ctx.fill();

      // Player Arrow
      ctx.save();
      ctx.translate(plX, plZ);
      ctx.rotate(-angle);
      ctx.fillStyle = '#22c55e';
      ctx.beginPath();
      ctx.moveTo(0, -cellSize * 0.45);
      ctx.lineTo(-cellSize * 0.3, cellSize * 0.35);
      ctx.lineTo(cellSize * 0.3, cellSize * 0.35);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      animId = requestAnimationFrame(renderMap);
    };

    renderMap();
    return () => {
      cancelAnimationFrame(animId);
    };
  }, [engine]);

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-3 animate-in fade-in select-none font-mono">
      <div className="relative bg-[#0b160e] border-2 border-emerald-500/80 rounded-2xl shadow-[0_0_50px_rgba(16,185,129,0.3)] w-full max-w-lg overflow-hidden flex flex-col p-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-emerald-900 pb-3 mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">🗺️</span>
            <div>
              <h3 className="text-sm font-black text-emerald-400 tracking-wider">
                TACTISCHE RADAR KAART • VERDIEPING {engine?.currentFloor || 1}
              </h3>
              <p className="text-[10px] text-emerald-600">
                Castle Hollehammer • Actieve Sensor Radar
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg bg-emerald-950 hover:bg-emerald-900 text-emerald-400 border border-emerald-700 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Map Canvas */}
        <div className="flex justify-center items-center my-1">
          <canvas
            ref={canvasRef}
            width={380}
            height={380}
            className="rounded-xl border-2 border-emerald-700/60 shadow-inner bg-black aspect-square w-full max-w-[360px]"
          />
        </div>

        {/* Legend */}
        <div className="mt-3 pt-2 border-t border-emerald-950 grid grid-cols-4 gap-2 text-[10px] text-emerald-300">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full" />
            <span>Speler</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-red-500 rounded-full" />
            <span>Wacht</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-sky-400 rounded-full" />
            <span>SS / Hond</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-yellow-500 rounded-full" />
            <span>Lift / Boss</span>
          </div>
        </div>
      </div>
    </div>
  );
};
