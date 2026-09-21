/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Interactive Visual Xbox Controller Graphic with Game-Specific Callouts
 */

import React from 'react';

export interface XboxButtonMapping {
  button: 'A' | 'B' | 'X' | 'Y' | 'LB' | 'RB' | 'LT' | 'RT' | 'LS' | 'RS' | 'DPAD' | 'VIEW' | 'MENU';
  label: string;
  action: string;
}

interface XboxControllerGraphicProps {
  mappings?: XboxButtonMapping[];
  pressedButtons?: Set<string>;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const XboxControllerGraphic: React.FC<XboxControllerGraphicProps> = ({
  mappings = [],
  pressedButtons = new Set(),
  size = 'md',
  className = ''
}) => {
  // Map actions by button key
  const actionMap = new Map<string, string>();
  mappings.forEach((m) => actionMap.set(m.button, m.action));

  // Scale based on size prop
  const maxWidthClass = size === 'sm' ? 'max-w-md' : size === 'lg' ? 'max-w-3xl' : 'max-w-2xl';

  return (
    <div className={`w-full flex flex-col items-center select-none ${className}`}>
      {/* SVG Controller Graphic */}
      <div className={`relative w-full ${maxWidthClass} aspect-[16/9] flex items-center justify-center`}>
        <svg
          viewBox="0 0 800 480"
          className="w-full h-full drop-shadow-[0_12px_30px_rgba(0,0,0,0.85)]"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Body Gradient */}
            <linearGradient id="controllerBody" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#2c2e35" />
              <stop offset="40%" stopColor="#1e2025" />
              <stop offset="100%" stopColor="#141518" />
            </linearGradient>

            {/* Grip Texture */}
            <linearGradient id="gripGradientLeft" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#151619" />
              <stop offset="100%" stopColor="#0c0d0f" />
            </linearGradient>

            {/* Button Gradients */}
            <radialGradient id="aBtn" cx="40%" cy="40%" r="60%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#047857" />
            </radialGradient>
            <radialGradient id="bBtn" cx="40%" cy="40%" r="60%">
              <stop offset="0%" stopColor="#ef4444" />
              <stop offset="100%" stopColor="#b91c1c" />
            </radialGradient>
            <radialGradient id="xBtn" cx="40%" cy="40%" r="60%">
              <stop offset="0%" stopColor="#0ea5e9" />
              <stop offset="100%" stopColor="#0369a1" />
            </radialGradient>
            <radialGradient id="yBtn" cx="40%" cy="40%" r="60%">
              <stop offset="0%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#b45309" />
            </radialGradient>

            {/* Xbox Guide Glow */}
            <filter id="guideGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Trigger Bumpers (Back) */}
          {/* Left Trigger (LT) */}
          <path
            d="M 230 40 C 230 20, 275 12, 310 20 L 305 60 L 235 60 Z"
            fill={pressedButtons.has('LT') ? '#38bdf8' : '#22252c'}
            stroke="#3b4252"
            strokeWidth="3"
            className="transition-colors duration-150"
          />
          {/* Right Trigger (RT) */}
          <path
            d="M 570 40 C 570 20, 525 12, 490 20 L 495 60 L 565 60 Z"
            fill={pressedButtons.has('RT') ? '#38bdf8' : '#22252c'}
            stroke="#3b4252"
            strokeWidth="3"
            className="transition-colors duration-150"
          />

          {/* Left Bumper (LB) */}
          <path
            d="M 220 62 C 220 50, 315 50, 335 68 L 330 92 L 215 88 Z"
            fill={pressedButtons.has('LB') ? '#a855f7' : '#2f3440'}
            stroke="#475166"
            strokeWidth="2.5"
            className="transition-colors duration-150"
          />
          {/* Right Bumper (RB) */}
          <path
            d="M 580 62 C 580 50, 485 50, 465 68 L 470 92 L 585 88 Z"
            fill={pressedButtons.has('RB') ? '#a855f7' : '#2f3440'}
            stroke="#475166"
            strokeWidth="2.5"
            className="transition-colors duration-150"
          />

          {/* Main Ergonomic Controller Chassis */}
          <path
            d="M 260 80
               C 330 65, 470 65, 540 80
               C 610 95, 685 140, 715 220
               C 745 300, 730 410, 680 435
               C 640 455, 580 395, 545 325
               C 505 270, 470 260, 400 260
               C 330 260, 295 270, 255 325
               C 220 395, 160 455, 120 435
               C 70 410, 55 300, 85 220
               C 115 140, 190 95, 260 80 Z"
            fill="url(#controllerBody)"
            stroke="#3a3f4d"
            strokeWidth="3.5"
          />

          {/* Left / Right Grips Shading */}
          <path
            d="M 85 220 C 115 140, 180 100, 230 95 C 190 180, 170 300, 120 435 C 70 410, 55 300, 85 220 Z"
            fill="url(#gripGradientLeft)"
            opacity="0.6"
          />
          <path
            d="M 715 220 C 685 140, 620 100, 570 95 C 610 180, 630 300, 680 435 C 730 410, 745 300, 715 220 Z"
            fill="url(#gripGradientLeft)"
            opacity="0.6"
          />

          {/* Center Xbox Guide Button (Nexus) */}
          <circle
            cx="400"
            cy="145"
            r="30"
            fill="#181a1f"
            stroke="#10b981"
            strokeWidth="3"
            filter="url(#guideGlow)"
          />
          {/* Glowing Xbox Emblem 'X' */}
          <path
            d="M 386 135 C 392 142, 396 148, 400 155 C 404 148, 408 142, 414 135
               C 422 136, 420 148, 413 155 C 418 160, 422 165, 418 172
               C 410 167, 405 161, 400 157 C 395 161, 390 167, 382 172
               C 378 165, 382 160, 387 155 C 380 148, 378 136, 386 135 Z"
            fill="#10b981"
          />

          {/* View Button (Left of Guide - Overlapping Boxes) */}
          <g transform="translate(340, 150)">
            <circle cx="0" cy="0" r="13" fill="#22252c" stroke="#4b5563" strokeWidth="2" />
            <rect x="-7" y="-5" width="8" height="7" fill="none" stroke="#9ca3af" strokeWidth="1.5" />
            <rect x="-3" y="-2" width="8" height="7" fill="none" stroke="#9ca3af" strokeWidth="1.5" />
          </g>

          {/* Menu Button (Right of Guide - Hamburger) */}
          <g transform="translate(460, 150)">
            <circle cx="0" cy="0" r="13" fill="#22252c" stroke="#4b5563" strokeWidth="2" />
            <line x1="-5" y1="-4" x2="5" y2="-4" stroke="#9ca3af" strokeWidth="2" />
            <line x1="-5" y1="0" x2="5" y2="0" stroke="#9ca3af" strokeWidth="2" />
            <line x1="-5" y1="4" x2="5" y2="4" stroke="#9ca3af" strokeWidth="2" />
          </g>

          {/* Share Button (Center bottom) */}
          <circle cx="400" cy="195" r="7" fill="#22252c" stroke="#4b5563" strokeWidth="1.5" />
          <path d="M 397 197 L 400 192 L 403 197" fill="none" stroke="#9ca3af" strokeWidth="1.5" />

          {/* Left Analog Thumbstick (LS) */}
          <g transform="translate(240, 175)">
            <circle cx="0" cy="0" r="44" fill="#181a1f" stroke="#333842" strokeWidth="3" />
            <circle cx="0" cy="0" r="32" fill="#282c35" stroke="#444b58" strokeWidth="2" />
            {/* Stick Cap with grip ribs */}
            <circle
              cx="0"
              cy="0"
              r="22"
              fill={pressedButtons.has('LS') ? '#38bdf8' : '#1e2025'}
              stroke="#555f72"
              strokeWidth="2.5"
            />
            <circle cx="0" cy="-14" r="2.5" fill="#667085" />
            <circle cx="0" cy="14" r="2.5" fill="#667085" />
            <circle cx="-14" cy="0" r="2.5" fill="#667085" />
            <circle cx="14" cy="0" r="2.5" fill="#667085" />
          </g>

          {/* D-PAD (Directional Pad - Hybrid Faceted Style) */}
          <g transform="translate(315, 275)">
            <circle cx="0" cy="0" r="42" fill="#15171b" stroke="#2a2e37" strokeWidth="2" />
            {/* Plus Shape */}
            <path
              d="M -13 -36 L 13 -36 L 13 -13 L 36 -13 L 36 13 L 13 13 L 13 36 L -13 36 L -13 13 L -36 13 L -36 -13 L -13 -13 Z"
              fill={pressedButtons.has('DPAD') ? '#eab308' : '#22252d'}
              stroke="#404654"
              strokeWidth="2"
            />
            {/* Arrows */}
            <path d="M 0 -28 L -5 -20 L 5 -20 Z" fill="#9ca3af" />
            <path d="M 0 28 L -5 20 L 5 20 Z" fill="#9ca3af" />
            <path d="M -28 0 L -20 -5 L -20 5 Z" fill="#9ca3af" />
            <path d="M 28 0 L 20 -5 L 20 5 Z" fill="#9ca3af" />
          </g>

          {/* Right Analog Thumbstick (RS) */}
          <g transform="translate(485, 275)">
            <circle cx="0" cy="0" r="44" fill="#181a1f" stroke="#333842" strokeWidth="3" />
            <circle cx="0" cy="0" r="32" fill="#282c35" stroke="#444b58" strokeWidth="2" />
            <circle
              cx="0"
              cy="0"
              r="22"
              fill={pressedButtons.has('RS') ? '#38bdf8' : '#1e2025'}
              stroke="#555f72"
              strokeWidth="2.5"
            />
            <circle cx="0" cy="-14" r="2.5" fill="#667085" />
            <circle cx="0" cy="14" r="2.5" fill="#667085" />
            <circle cx="-14" cy="0" r="2.5" fill="#667085" />
            <circle cx="14" cy="0" r="2.5" fill="#667085" />
          </g>

          {/* Action Buttons: (A, B, X, Y) in Diamond Layout */}
          <g transform="translate(565, 175)">
            {/* (Y) Button - Amber (Top) */}
            <circle
              cx="0"
              cy="-34"
              r="17"
              fill="url(#yBtn)"
              stroke={pressedButtons.has('Y') ? '#ffffff' : '#451a03'}
              strokeWidth={pressedButtons.has('Y') ? '3' : '1.5'}
              className="transition-all"
            />
            <text x="0" y="-28" fill="#ffffff" fontSize="16" fontWeight="bold" fontFamily="sans-serif" textAnchor="middle">
              Y
            </text>

            {/* (X) Button - Blue (Left) */}
            <circle
              cx="-34"
              cy="0"
              r="17"
              fill="url(#xBtn)"
              stroke={pressedButtons.has('X') ? '#ffffff' : '#0c4a6e'}
              strokeWidth={pressedButtons.has('X') ? '3' : '1.5'}
              className="transition-all"
            />
            <text x="-34" y="6" fill="#ffffff" fontSize="16" fontWeight="bold" fontFamily="sans-serif" textAnchor="middle">
              X
            </text>

            {/* (B) Button - Red (Right) */}
            <circle
              cx="34"
              cy="0"
              r="17"
              fill="url(#bBtn)"
              stroke={pressedButtons.has('B') ? '#ffffff' : '#7f1d1d'}
              strokeWidth={pressedButtons.has('B') ? '3' : '1.5'}
              className="transition-all"
            />
            <text x="34" y="6" fill="#ffffff" fontSize="16" fontWeight="bold" fontFamily="sans-serif" textAnchor="middle">
              B
            </text>

            {/* (A) Button - Green (Bottom) */}
            <circle
              cx="0"
              cy="34"
              r="17"
              fill="url(#aBtn)"
              stroke={pressedButtons.has('A') ? '#ffffff' : '#064e3b'}
              strokeWidth={pressedButtons.has('A') ? '3' : '1.5'}
              className="transition-all"
            />
            <text x="0" y="40" fill="#ffffff" fontSize="16" fontWeight="bold" fontFamily="sans-serif" textAnchor="middle">
              A
            </text>
          </g>
        </svg>
      </div>

      {/* Interactive Legend Grid showing EXACT mappings for this specific game */}
      {mappings.length > 0 && (
        <div className="w-full mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-2.5 font-mono text-xs">
          {mappings.map((m, idx) => {
            let colorBadge = "border-neutral-700 bg-neutral-900 text-neutral-300";
            if (m.button === 'A') colorBadge = "border-emerald-500/50 bg-emerald-950/80 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.2)]";
            else if (m.button === 'B') colorBadge = "border-rose-500/50 bg-rose-950/80 text-rose-300 shadow-[0_0_10px_rgba(244,63,94,0.2)]";
            else if (m.button === 'X') colorBadge = "border-sky-500/50 bg-sky-950/80 text-sky-300 shadow-[0_0_10px_rgba(14,165,233,0.2)]";
            else if (m.button === 'Y') colorBadge = "border-amber-500/50 bg-amber-950/80 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.2)]";
            else if (m.button === 'RT' || m.button === 'LT') colorBadge = "border-cyan-500/50 bg-cyan-950/80 text-cyan-300";
            else if (m.button === 'RB' || m.button === 'LB') colorBadge = "border-purple-500/50 bg-purple-950/80 text-purple-300";
            else if (m.button === 'DPAD' || m.button === 'LS') colorBadge = "border-yellow-500/50 bg-yellow-950/80 text-yellow-300";

            return (
              <div
                key={idx}
                className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-900/90 border border-neutral-800 hover:border-neutral-700 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded-md font-black text-[11px] border ${colorBadge}`}>
                    {m.label}
                  </span>
                </div>
                <span className="text-white font-medium text-right text-xs">
                  {m.action}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
