/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { PlayerId, LineOrientation, LineCoord } from '../game/kamertjeVerhurenEngine';

interface KamertjeVerhurenBoardViewProps {
  gridSize: number;
  horizontalLines: readonly (readonly (PlayerId | null)[])[];
  verticalLines: readonly (readonly (PlayerId | null)[])[];
  boxes: readonly (readonly (PlayerId | null)[])[];
  currentTurn: PlayerId;
  onLineClick: (orientation: LineOrientation, r: number, c: number) => void;
  hoveredLine: LineCoord | null;
  onHoverLine: (line: LineCoord | null) => void;
  isThinking: boolean;
  p1Initials?: string;
  p2Initials?: string;
}

export const KamertjeVerhurenBoardView: React.FC<KamertjeVerhurenBoardViewProps> = ({
  gridSize,
  horizontalLines,
  verticalLines,
  boxes,
  currentTurn,
  onLineClick,
  hoveredLine,
  onHoverLine,
  isThinking,
  p1Initials = 'J',
  p2Initials = 'AI'
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Measure and render
  const renderBoard = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const cssWidth = Math.max(300, rect.width || 540);
    const cssHeight = Math.max(300, rect.height || 540);
    const dpr = window.devicePixelRatio || 1;

    const targetW = Math.floor(cssWidth * dpr);
    const targetH = Math.floor(cssHeight * dpr);

    if (canvas.width !== targetW || canvas.height !== targetH) {
      canvas.width = targetW;
      canvas.height = targetH;
    }

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Background: Cream / Off-White Graph Paper (Collegeblok / Ruitjesschrift)
    ctx.fillStyle = '#fdfbf7';
    ctx.fillRect(0, 0, cssWidth, cssHeight);

    // Calculate game board layout first so graph paper grid aligns perfectly with game dots
    const marginX = 64;
    const marginY = 48;
    const availableW = cssWidth - marginX * 2;
    const availableH = cssHeight - marginY * 2;
    const boxSize = Math.min(availableW, availableH) / gridSize;
    const startX = (cssWidth - boxSize * gridSize) / 2;
    const startY = (cssHeight - boxSize * gridSize) / 2;

    // Subdivide each game box into clean graph paper squares (e.g. 3 or 4 ruitjes per box)
    const subdivisions = Math.max(2, Math.round(boxSize / 24));
    const gridStep = boxSize / subdivisions;

    // Subtle graph paper grid lines (light cyan/grey blue) aligned to startX & startY
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    for (let x = startX % gridStep; x <= cssWidth; x += gridStep) {
      ctx.moveTo(Math.round(x) + 0.5, 0);
      ctx.lineTo(Math.round(x) + 0.5, cssHeight);
    }
    for (let y = startY % gridStep; y <= cssHeight; y += gridStep) {
      ctx.moveTo(0, Math.round(y) + 0.5);
      ctx.lineTo(cssWidth, Math.round(y) + 0.5);
    }
    ctx.stroke();

    // Red left margin line (School notebook style)
    ctx.strokeStyle = '#f87171';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(36, 0);
    ctx.lineTo(36, cssHeight);
    ctx.stroke();

    // Draw claimed box fills with soft watercolor/ballpoint hatching & handwritten initial
    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        const owner = boxes[r]?.[c];
        if (owner) {
          const bx = startX + c * boxSize;
          const by = startY + r * boxSize;

          ctx.save();
          // Soft ink background wash
          ctx.fillStyle = owner === 'P1' ? 'rgba(37, 99, 235, 0.12)' : 'rgba(220, 38, 38, 0.12)';
          ctx.fillRect(bx + 4, by + 4, boxSize - 8, boxSize - 8);

          // Subtle diagonal pen hatching
          ctx.strokeStyle = owner === 'P1' ? 'rgba(37, 99, 235, 0.22)' : 'rgba(220, 38, 38, 0.22)';
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          const hatchStep = 10;
          for (let d = -boxSize; d < boxSize * 2; d += hatchStep) {
            ctx.moveTo(bx + 6 + d, by + 6);
            ctx.lineTo(bx + 6 + d + boxSize - 12, by + 6 + boxSize - 12);
          }
          ctx.rect(bx + 4, by + 4, boxSize - 8, boxSize - 8);
          ctx.clip();
          ctx.stroke();
          ctx.restore();

          // Handwritten initial in center
          ctx.save();
          const letter = owner === 'P1' ? p1Initials : p2Initials;
          ctx.fillStyle = owner === 'P1' ? '#1d4ed8' : '#b91c1c';
          ctx.font = `bold ${Math.floor(boxSize * 0.46)}px 'Caveat', 'Comic Sans MS', cursive, sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(letter, bx + boxSize / 2, by + boxSize / 2 + 2);
          ctx.restore();
        }
      }
    }

    // Helper: draw an authentic hand-drawn ballpoint line
    const drawPenLine = (x1: number, y1: number, x2: number, y2: number, color: string, isGhost: boolean = false) => {
      ctx.save();
      ctx.strokeStyle = color;
      ctx.lineWidth = isGhost ? 2.5 : 4;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      if (isGhost) {
        ctx.setLineDash([4, 4]);
      }

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
      ctx.restore();
    };

    // Draw horizontal lines
    for (let r = 0; r <= gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        const owner = horizontalLines[r]?.[c];
        const isHover = hoveredLine?.orientation === 'horizontal' && hoveredLine.row === r && hoveredLine.col === c;
        const x1 = startX + c * boxSize;
        const y1 = startY + r * boxSize;
        const x2 = startX + (c + 1) * boxSize;
        const y2 = y1;

        if (owner) {
          const color = owner === 'P1' ? '#1e40af' : '#dc2626'; // Deep blue or bright red ballpoint
          drawPenLine(x1, y1, x2, y2, color);
        } else if (isHover && !isThinking) {
          const ghostColor = currentTurn === 'P1' ? 'rgba(30, 64, 175, 0.45)' : 'rgba(220, 38, 38, 0.45)';
          drawPenLine(x1, y1, x2, y2, ghostColor, true);
        }
      }
    }

    // Draw vertical lines
    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c <= gridSize; c++) {
        const owner = verticalLines[r]?.[c];
        const isHover = hoveredLine?.orientation === 'vertical' && hoveredLine.row === r && hoveredLine.col === c;
        const x1 = startX + c * boxSize;
        const y1 = startY + r * boxSize;
        const x2 = x1;
        const y2 = startY + (r + 1) * boxSize;

        if (owner) {
          const color = owner === 'P1' ? '#1e40af' : '#dc2626';
          drawPenLine(x1, y1, x2, y2, color);
        } else if (isHover && !isThinking) {
          const ghostColor = currentTurn === 'P1' ? 'rgba(30, 64, 175, 0.45)' : 'rgba(220, 38, 38, 0.45)';
          drawPenLine(x1, y1, x2, y2, ghostColor, true);
        }
      }
    }

    // Draw grid dots (Graph paper pencil points)
    for (let r = 0; r <= gridSize; r++) {
      for (let c = 0; c <= gridSize; c++) {
        const dx = startX + c * boxSize;
        const dy = startY + r * boxSize;

        ctx.save();
        // Dot shadow
        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        ctx.arc(dx, dy, 4.5, 0, Math.PI * 2);
        ctx.fill();

        // Shiny inner highlight
        ctx.fillStyle = '#64748b';
        ctx.beginPath();
        ctx.arc(dx - 1, dy - 1, 1.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }
  }, [gridSize, horizontalLines, verticalLines, boxes, currentTurn, hoveredLine, isThinking, p1Initials, p2Initials]);

  useEffect(() => {
    renderBoard();
  }, [renderBoard]);

  // Handle pointer hover and clicks with generous hit test radius
  const getLineFromPointer = (e: React.PointerEvent<HTMLCanvasElement>): LineCoord | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;

    const cssWidth = rect.width || 540;
    const cssHeight = rect.height || 540;
    const marginX = 64;
    const marginY = 48;
    const availableW = cssWidth - marginX * 2;
    const availableH = cssHeight - marginY * 2;
    const boxSize = Math.min(availableW, availableH) / gridSize;
    const startX = (cssWidth - boxSize * gridSize) / 2;
    const startY = (cssHeight - boxSize * gridSize) / 2;

    const HIT_THRESHOLD = Math.max(16, boxSize * 0.32);

    let closestLine: LineCoord | null = null;
    let minDistance = Infinity;

    // Test horizontal lines
    for (let r = 0; r <= gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        if (horizontalLines[r]?.[c] !== null) continue; // already taken
        const x1 = startX + c * boxSize;
        const y1 = startY + r * boxSize;
        const x2 = startX + (c + 1) * boxSize;
        const y2 = y1;

        // Distance from point to horizontal segment
        if (px >= x1 - 8 && px <= x2 + 8) {
          const dist = Math.abs(py - y1);
          if (dist < HIT_THRESHOLD && dist < minDistance) {
            minDistance = dist;
            closestLine = { orientation: 'horizontal', row: r, col: c };
          }
        }
      }
    }

    // Test vertical lines
    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c <= gridSize; c++) {
        if (verticalLines[r]?.[c] !== null) continue; // already taken
        const x1 = startX + c * boxSize;
        const y1 = startY + r * boxSize;
        const x2 = x1;
        const y2 = startY + (r + 1) * boxSize;

        // Distance from point to vertical segment
        if (py >= y1 - 8 && py <= y2 + 8) {
          const dist = Math.abs(px - x1);
          if (dist < HIT_THRESHOLD && dist < minDistance) {
            minDistance = dist;
            closestLine = { orientation: 'vertical', row: r, col: c };
          }
        }
      }
    }

    return closestLine;
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (isThinking) return;
    const target = getLineFromPointer(e);
    if (
      target?.orientation !== hoveredLine?.orientation ||
      target?.row !== hoveredLine?.row ||
      target?.col !== hoveredLine?.col
    ) {
      onHoverLine(target);
    }
  };

  const handleClick = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (isThinking) return;
    const target = getLineFromPointer(e);
    if (target) {
      onLineClick(target.orientation, target.row, target.col);
    }
  };

  return (
    <div className="relative w-full flex items-center justify-center p-2 select-none" ref={containerRef}>
      <canvas
        ref={canvasRef}
        className={`w-full max-w-[560px] aspect-square rounded-2xl shadow-2xl border-4 border-amber-900/40 touch-none transition-all ${
          isThinking ? 'cursor-wait' : 'cursor-pointer'
        }`}
        onPointerMove={handlePointerMove}
        onPointerLeave={() => onHoverLine(null)}
        onPointerDown={handleClick}
      />

      {/* Floating status badge while AI draws */}
      {isThinking && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-3.5 py-1.5 rounded-full bg-slate-900/90 text-white border border-red-500/50 text-xs font-mono shadow-xl backdrop-blur-md flex items-center gap-2 pointer-events-none animate-pulse">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
          <span>Computer zet een rode balpenlijn...</span>
        </div>
      )}
    </div>
  );
};
