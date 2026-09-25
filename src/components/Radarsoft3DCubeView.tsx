/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { CellState, WinningLine, indexToCoord } from '../game/radarsoft3DTicTacToeEngine';

interface Radarsoft3DCubeViewProps {
  board: readonly CellState[];
  hoveredCell: number | null;
  onHoverCell: (idx: number | null) => void;
  onSelectCell: (idx: number) => void;
  winningIndices: number[] | null;
  winningLine: WinningLine | null;
  threats: number[];
  canMakeMove: (idx: number) => boolean;
}

export const Radarsoft3DCubeView: React.FC<Radarsoft3DCubeViewProps> = ({
  board,
  hoveredCell,
  onHoverCell,
  onSelectCell,
  winningIndices,
  winningLine: _winningLine,
  threats,
  canMakeMove
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Rotation angles (in radians)
  const [rotX, setRotX] = useState<number>(0.42); // Pitch
  const [rotY, setRotY] = useState<number>(0.65); // Yaw
  const [isAutoRotate, setIsAutoRotate] = useState<boolean>(false);
  const [zoom, setZoom] = useState<number>(1.0);

  const isDraggingRef = useRef<boolean>(false);
  const lastMousePosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Projected screen positions of all 64 nodes in CSS pixels for click / hover raycasting
  const projectedNodesRef = useRef<{ x: number; y: number; zDepth: number; index: number; r: number }[]>([]);

  // 3D parameters: spread distance between grid points in 3D world units
  const CUBE_SPREAD = 68;

  // Render function that safely measures container, sets DPI, and renders smoothly
  const renderCube = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Get display size in CSS pixels
    const rect = canvas.getBoundingClientRect();
    const cssWidth = Math.max(300, rect.width || (container ? container.clientWidth : 500) || 500);
    const cssHeight = Math.max(300, rect.height || (container ? container.clientHeight : 440) || 440);

    const dpr = window.devicePixelRatio || 1;
    const targetPixelWidth = Math.floor(cssWidth * dpr);
    const targetPixelHeight = Math.floor(cssHeight * dpr);

    if (canvas.width !== targetPixelWidth || canvas.height !== targetPixelHeight) {
      canvas.width = targetPixelWidth;
      canvas.height = targetPixelHeight;
    }

    // Reset and apply DPR scale so all draw commands operate in CSS pixels
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const cx = cssWidth / 2;
    const cy = cssHeight / 2;

    // Clear background with CRT phosphor dark tint
    ctx.fillStyle = '#080c1e';
    ctx.fillRect(0, 0, cssWidth, cssHeight);

    // Subtle C64 background grid pattern
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.08)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = 0; x < cssWidth; x += 32) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, cssHeight);
    }
    for (let y = 0; y < cssHeight; y += 32) {
      ctx.moveTo(0, y);
      ctx.lineTo(cssWidth, y);
    }
    ctx.stroke();

    // 3D coordinate transformation
    // Model center is at (0, 0, 0) -> coordinates span from -1.5 to +1.5 * CUBE_SPREAD
    const cosY = Math.cos(rotY);
    const sinY = Math.sin(rotY);
    const cosX = Math.cos(rotX);
    const sinX = Math.sin(rotX);

    const project = (wx: number, wy: number, wz: number) => {
      // 1. Rotate around Y (Yaw)
      const x1 = wx * cosY - wz * sinY;
      const z1 = wx * sinY + wz * cosY;

      // 2. Rotate around X (Pitch)
      const y2 = wy * cosX - z1 * sinX;
      const z2 = wy * sinX + z1 * cosX;

      // 3. Perspective projection
      const cameraDistance = 450 / zoom;
      const perspective = cameraDistance / (cameraDistance + z2);

      const sx = cx + x1 * perspective;
      const sy = cy + y2 * perspective;

      return { sx, sy, zDepth: z2, scale: perspective };
    };

    // Calculate 3D position of each cell index
    const nodes: { idx: number; sx: number; sy: number; zDepth: number; scale: number; x: number; y: number; z: number }[] = [];

    for (let idx = 0; idx < 64; idx++) {
      const { x, y, z } = indexToCoord(idx);
      // Center coordinates around (0,0,0)
      const wx = (x - 1.5) * CUBE_SPREAD;
      const wy = (1.5 - z) * CUBE_SPREAD; // Z layer is vertical height
      const wz = (y - 1.5) * CUBE_SPREAD; // Y row is depth

      const proj = project(wx, wy, wz);
      nodes.push({
        idx,
        sx: proj.sx,
        sy: proj.sy,
        zDepth: proj.zDepth,
        scale: proj.scale,
        x,
        y,
        z
      });
    }

    // Sort nodes back-to-front (painter's algorithm)
    nodes.sort((a, b) => b.zDepth - a.zDepth);

    // Save for click/hover hit testing in CSS pixels
    projectedNodesRef.current = nodes.map(n => ({
      x: n.sx,
      y: n.sy,
      zDepth: n.zDepth,
      index: n.idx,
      r: Math.max(16, 20 * n.scale)
    }));

    // Draw translucent layer planes and layer labels
    for (let z = 0; z < 4; z++) {
      const pTL = project(-1.5 * CUBE_SPREAD - 10, (1.5 - z) * CUBE_SPREAD, -1.5 * CUBE_SPREAD - 10);
      const pTR = project(1.5 * CUBE_SPREAD + 10, (1.5 - z) * CUBE_SPREAD, -1.5 * CUBE_SPREAD - 10);
      const pBR = project(1.5 * CUBE_SPREAD + 10, (1.5 - z) * CUBE_SPREAD, 1.5 * CUBE_SPREAD + 10);
      const pBL = project(-1.5 * CUBE_SPREAD - 10, (1.5 - z) * CUBE_SPREAD, 1.5 * CUBE_SPREAD + 10);

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(pTL.sx, pTL.sy);
      ctx.lineTo(pTR.sx, pTR.sy);
      ctx.lineTo(pBR.sx, pBR.sy);
      ctx.lineTo(pBL.sx, pBL.sy);
      ctx.closePath();
      ctx.fillStyle = z === 3 ? 'rgba(56, 189, 248, 0.06)' : 'rgba(30, 58, 138, 0.04)';
      ctx.fill();

      // Border outline for layer plane
      ctx.strokeStyle = z === 3 
        ? 'rgba(56, 189, 248, 0.45)' 
        : z === 0 
        ? 'rgba(147, 197, 253, 0.35)' 
        : 'rgba(96, 165, 250, 0.3)';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // Layer badge indicator in 3D
      const pLabel = project(-1.5 * CUBE_SPREAD - 22, (1.5 - z) * CUBE_SPREAD, -1.5 * CUBE_SPREAD - 22);
      ctx.font = 'bold 11px monospace';
      ctx.fillStyle = '#38bdf8';
      ctx.fillText(`L${z + 1}`, pLabel.sx, pLabel.sy);
      ctx.restore();
    }

    // Draw horizontal plane grid wires for each layer (z = 0..3)
    ctx.lineWidth = 1.4;
    for (let z = 0; z < 4; z++) {
      ctx.strokeStyle = z === 3 
        ? 'rgba(56, 189, 248, 0.4)' 
        : z === 0 
        ? 'rgba(96, 165, 250, 0.3)' 
        : 'rgba(59, 130, 246, 0.35)';
      
      // Lines along X
      for (let y = 0; y < 4; y++) {
        const pStart = project(-1.5 * CUBE_SPREAD, (1.5 - z) * CUBE_SPREAD, (y - 1.5) * CUBE_SPREAD);
        const pEnd = project(1.5 * CUBE_SPREAD, (1.5 - z) * CUBE_SPREAD, (y - 1.5) * CUBE_SPREAD);
        ctx.beginPath();
        ctx.moveTo(pStart.sx, pStart.sy);
        ctx.lineTo(pEnd.sx, pEnd.sy);
        ctx.stroke();
      }

      // Lines along Y (depth)
      for (let x = 0; x < 4; x++) {
        const pStart = project((x - 1.5) * CUBE_SPREAD, (1.5 - z) * CUBE_SPREAD, -1.5 * CUBE_SPREAD);
        const pEnd = project((x - 1.5) * CUBE_SPREAD, (1.5 - z) * CUBE_SPREAD, 1.5 * CUBE_SPREAD);
        ctx.beginPath();
        ctx.moveTo(pStart.sx, pStart.sy);
        ctx.lineTo(pEnd.sx, pEnd.sy);
        ctx.stroke();
      }
    }

    // Draw vertical pillars (Z lines) connecting the 4 layers
    ctx.strokeStyle = 'rgba(147, 197, 253, 0.25)';
    ctx.setLineDash([4, 4]);
    for (let y = 0; y < 4; y++) {
      for (let x = 0; x < 4; x++) {
        const pBottom = project((x - 1.5) * CUBE_SPREAD, (1.5 - 0) * CUBE_SPREAD, (y - 1.5) * CUBE_SPREAD);
        const pTop = project((x - 1.5) * CUBE_SPREAD, (1.5 - 3) * CUBE_SPREAD, (y - 1.5) * CUBE_SPREAD);
        ctx.beginPath();
        ctx.moveTo(pBottom.sx, pBottom.sy);
        ctx.lineTo(pTop.sx, pTop.sy);
        ctx.stroke();
      }
    }
    ctx.setLineDash([]); // Reset line dash

    // Draw winning line laser beam if present
    if (winningIndices && winningIndices.length === 4) {
      ctx.save();
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 5;
      ctx.shadowColor = '#00e5ff';
      ctx.shadowBlur = 20;

      const p0 = nodes.find(n => n.idx === winningIndices[0]) || nodes[0];
      const p1 = nodes.find(n => n.idx === winningIndices[1]) || nodes[1];
      const p2 = nodes.find(n => n.idx === winningIndices[2]) || nodes[2];
      const p3 = nodes.find(n => n.idx === winningIndices[3]) || nodes[3];

      ctx.beginPath();
      ctx.moveTo(p0.sx, p0.sy);
      ctx.lineTo(p1.sx, p1.sy);
      ctx.lineTo(p2.sx, p2.sy);
      ctx.lineTo(p3.sx, p3.sy);
      ctx.stroke();

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();
    }

    // Draw nodes back to front
    const now = Date.now();
    const pulse = Math.sin(now * 0.005) * 0.3 + 0.7;

    for (const node of nodes) {
      const val = board[node.idx];
      const isHovered = hoveredCell === node.idx;
      const isWinning = winningIndices?.includes(node.idx);
      const isThreat = threats.includes(node.idx);
      const radius = Math.max(9, 14 * node.scale);

      ctx.save();

      // Empty cell
      if (val === null) {
        if (isHovered && canMakeMove(node.idx)) {
          // Hover target
          ctx.beginPath();
          ctx.arc(node.sx, node.sy, radius * 1.35, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(56, 189, 248, 0.35)';
          ctx.fill();
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 2;
          ctx.stroke();

          // Plus marker
          ctx.strokeStyle = '#ffffff';
          ctx.beginPath();
          ctx.moveTo(node.sx - radius * 0.5, node.sy);
          ctx.lineTo(node.sx + radius * 0.5, node.sy);
          ctx.moveTo(node.sx, node.sy - radius * 0.5);
          ctx.lineTo(node.sx, node.sy + radius * 0.5);
          ctx.stroke();
        } else if (isThreat) {
          // Threat cell pulse
          ctx.beginPath();
          ctx.arc(node.sx, node.sy, radius * (0.8 + 0.35 * pulse), 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(239, 68, 68, 0.3)';
          ctx.fill();
          ctx.strokeStyle = '#ef4444';
          ctx.lineWidth = 1.8;
          ctx.stroke();
        } else {
          // Normal empty node bead - clearly visible glowing sphere
          const nodeR = Math.max(5, radius * 0.7);
          ctx.beginPath();
          ctx.arc(node.sx, node.sy, nodeR, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(56, 189, 248, 0.45)';
          ctx.fill();
          ctx.strokeStyle = 'rgba(186, 230, 253, 0.85)';
          ctx.lineWidth = 1.2;
          ctx.stroke();

          // Bright center dot
          ctx.beginPath();
          ctx.arc(node.sx, node.sy, Math.max(2, nodeR * 0.35), 0, Math.PI * 2);
          ctx.fillStyle = '#ffffff';
          ctx.fill();
        }
      } else if (val === 'X') {
        // Player X - Electric Cyan Cross / Sphere
        const r = radius * (isWinning ? 1.3 : 1.05);

        if (isWinning) {
          ctx.shadowColor = '#38bdf8';
          ctx.shadowBlur = 18 * pulse;
        }

        const grad = ctx.createRadialGradient(
          node.sx - r * 0.3,
          node.sy - r * 0.3,
          r * 0.1,
          node.sx,
          node.sy,
          r
        );
        grad.addColorStop(0, '#e0f2fe');
        grad.addColorStop(0.45, '#0284c7');
        grad.addColorStop(1, '#03416d');

        ctx.beginPath();
        ctx.arc(node.sx, node.sy, r, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
        ctx.strokeStyle = isWinning ? '#ffffff' : '#38bdf8';
        ctx.lineWidth = isWinning ? 2.5 : 1.5;
        ctx.stroke();

        // Cross marker
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = Math.max(1.8, 2.5 * node.scale);
        const crossSize = r * 0.5;
        ctx.beginPath();
        ctx.moveTo(node.sx - crossSize, node.sy - crossSize);
        ctx.lineTo(node.sx + crossSize, node.sy + crossSize);
        ctx.moveTo(node.sx + crossSize, node.sy - crossSize);
        ctx.lineTo(node.sx - crossSize, node.sy + crossSize);
        ctx.stroke();
      } else if (val === 'O') {
        // Player O - Neon Amber Torus / Sphere
        const r = radius * (isWinning ? 1.3 : 1.05);

        if (isWinning) {
          ctx.shadowColor = '#fbbf24';
          ctx.shadowBlur = 18 * pulse;
        }

        const grad = ctx.createRadialGradient(
          node.sx - r * 0.3,
          node.sy - r * 0.3,
          r * 0.1,
          node.sx,
          node.sy,
          r
        );
        grad.addColorStop(0, '#fef9c3');
        grad.addColorStop(0.45, '#f59e0b');
        grad.addColorStop(1, '#78350f');

        ctx.beginPath();
        ctx.arc(node.sx, node.sy, r, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
        ctx.strokeStyle = isWinning ? '#ffffff' : '#fbbf24';
        ctx.lineWidth = isWinning ? 2.5 : 1.5;
        ctx.stroke();

        // Circle ring inside
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = Math.max(1.8, 2.2 * node.scale);
        ctx.beginPath();
        ctx.arc(node.sx, node.sy, r * 0.48, 0, Math.PI * 2);
        ctx.stroke();
      }

      ctx.restore();
    }

    // Draw active coordinates badge in top-left
    if (hoveredCell !== null) {
      const { x, y, z } = indexToCoord(hoveredCell);
      ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1;
      const tagText = `LAAG ${z + 1} • RIJ ${String.fromCharCode(65 + y)} • KOLOM ${x + 1} (${board[hoveredCell] || 'VRIJ'})`;
      ctx.font = 'bold 12px monospace';
      const textWidth = ctx.measureText(tagText).width;
      ctx.fillRect(14, 14, textWidth + 24, 28);
      ctx.strokeRect(14, 14, textWidth + 24, 28);
      ctx.fillStyle = '#38bdf8';
      ctx.fillText(tagText, 26, 32);
    }
  }, [board, hoveredCell, winningIndices, threats, canMakeMove, rotX, rotY, zoom]);

  // Animation loop for continuous rendering and auto-rotation
  useEffect(() => {
    let animId: number;
    const animate = () => {
      if (isAutoRotate) {
        setRotY(prev => (prev + 0.008) % (Math.PI * 2));
      }
      renderCube();
      animId = requestAnimationFrame(animate);
    };
    animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, [isAutoRotate, renderCube]);

  // Handle Resize
  useEffect(() => {
    const handleResize = () => {
      renderCube();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [renderCube]);

  // Pointer event handlers for orbiting and clicking in CSS coordinate space
  const handlePointerDown = (e: React.PointerEvent) => {
    isDraggingRef.current = true;
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (isDraggingRef.current) {
      const dx = e.clientX - lastMousePosRef.current.x;
      const dy = e.clientY - lastMousePosRef.current.y;
      lastMousePosRef.current = { x: e.clientX, y: e.clientY };

      setRotY(prev => (prev + dx * 0.008) % (Math.PI * 2));
      setRotX(prev => Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, prev + dy * 0.008)));
      return;
    }

    // Raycast hover in CSS pixels
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    let closestIdx: number | null = null;
    let minD = Infinity;

    for (const node of projectedNodesRef.current) {
      const dx = mouseX - node.x;
      const dy = mouseY - node.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist <= node.r * 1.3 && dist < minD) {
        minD = dist;
        closestIdx = node.index;
      }
    }

    if (closestIdx !== hoveredCell) {
      onHoverCell(closestIdx);
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}

    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Check click hit
    for (const node of projectedNodesRef.current) {
      const dx = mouseX - node.x;
      const dy = mouseY - node.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist <= node.r * 1.35) {
        if (canMakeMove(node.index)) {
          onSelectCell(node.index);
        }
        break;
      }
    }
  };

  return (
    <div className="relative w-full h-full min-h-[380px] flex flex-col items-center select-none" ref={containerRef}>
      <canvas
        ref={canvasRef}
        className="w-full h-full min-h-[380px] cursor-grab active:cursor-grabbing touch-none rounded-xl"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={() => onHoverCell(null)}
      />

      {/* 3D Camera Controls Floating Bar */}
      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-2 pointer-events-none">
        <div className="flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-md border border-cyan-500/30 rounded-lg p-1.5 pointer-events-auto shadow-lg">
          <button
            type="button"
            onClick={() => { setRotX(0.42); setRotY(0.65); setIsAutoRotate(false); }}
            className="px-2.5 py-1 text-xs font-mono font-medium rounded bg-slate-800 hover:bg-cyan-900/50 text-cyan-300 border border-slate-700 hover:border-cyan-500/50 transition-colors cursor-pointer"
            title="Isometrisch 3D zicht"
          >
            3D Iso
          </button>
          <button
            type="button"
            onClick={() => { setRotX(1.45); setRotY(0); setIsAutoRotate(false); }}
            className="px-2.5 py-1 text-xs font-mono font-medium rounded bg-slate-800 hover:bg-cyan-900/50 text-cyan-300 border border-slate-700 hover:border-cyan-500/50 transition-colors cursor-pointer"
            title="Bovenaanzicht"
          >
            Boven
          </button>
          <button
            type="button"
            onClick={() => { setRotX(0.05); setRotY(0); setIsAutoRotate(false); }}
            className="px-2.5 py-1 text-xs font-mono font-medium rounded bg-slate-800 hover:bg-cyan-900/50 text-cyan-300 border border-slate-700 hover:border-cyan-500/50 transition-colors cursor-pointer"
            title="Vooraanzicht"
          >
            Voor
          </button>
          <button
            type="button"
            onClick={() => setIsAutoRotate(prev => !prev)}
            className={`px-2.5 py-1 text-xs font-mono font-medium rounded border transition-colors cursor-pointer ${
              isAutoRotate 
                ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_8px_rgba(56,189,248,0.4)]'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
            }`}
          >
            {isAutoRotate ? '⏹ Stop' : '▶ Draai 3D'}
          </button>
        </div>

        <div className="flex items-center gap-1 bg-slate-900/90 backdrop-blur-md border border-slate-700 rounded-lg p-1.5 pointer-events-auto">
          <button
            type="button"
            onClick={() => setZoom(prev => Math.min(1.8, prev + 0.15))}
            className="w-7 h-7 flex items-center justify-center font-mono text-sm bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded border border-slate-700 cursor-pointer"
            title="Inzoomen"
          >
            +
          </button>
          <button
            type="button"
            onClick={() => setZoom(1.0)}
            className="px-2 h-7 flex items-center justify-center font-mono text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 cursor-pointer"
            title="Reset Zoom"
          >
            100%
          </button>
          <button
            type="button"
            onClick={() => setZoom(prev => Math.max(0.65, prev - 0.15))}
            className="w-7 h-7 flex items-center justify-center font-mono text-sm bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded border border-slate-700 cursor-pointer"
            title="Uitzoomen"
          >
            -
          </button>
        </div>
      </div>
    </div>
  );
};
