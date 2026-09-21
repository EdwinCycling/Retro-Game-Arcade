/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState, useMemo } from 'react';
import { X, Gamepad2, Keyboard, Lightbulb, CheckCircle2, AlertCircle, Info, Sparkles } from 'lucide-react';
import { GAME_CONTROLS, GameControlInfo } from '../data/gameControls';
import { gamepadManager, ControllerState } from '../utils/gamepadManager';
import { XboxControllerGraphic, XboxButtonMapping } from './XboxControllerGraphic';

export interface GameControl {
  action: string;
  keyboard: string;
  xbox: string;
}

export interface GameControlsModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameId: string;
}

/**
 * Custom hook to activate Gamepad / Xbox controller polling for the active game
 * and track connection state.
 */
export function useGameControls(gameId: string) {
  const [showControls, setShowControls] = useState(false);
  const [controllerState, setControllerState] = useState<ControllerState>({
    connected: false,
    id: '',
    buttons: [],
    axes: []
  });

  useEffect(() => {
    // Start controller polling for this game
    gamepadManager.start(gameId);

    // Subscribe to state updates
    const unsub = gamepadManager.subscribe((state) => {
      setControllerState(state);
    });

    return () => {
      unsub();
      gamepadManager.stop();
    };
  }, [gameId]);

  return {
    showControls,
    setShowControls,
    isGamepadConnected: controllerState.connected,
    gamepadName: controllerState.id,
    controllerState
  };
}

/**
 * Renders an authentic retro keycap for keyboard keys
 */
const KeyCap: React.FC<{ text: string }> = ({ text }) => {
  return (
    <span className="inline-flex items-center justify-center px-2 py-0.5 min-w-[24px] text-xs font-mono font-bold text-cyan-200 bg-neutral-900 border border-cyan-500/40 rounded shadow-[0_2px_0_rgba(6,182,212,0.4)]">
      {text}
    </span>
  );
};

/**
 * Renders an authentic Xbox badge (colored A, B, X, Y, Triggers, Bumpers, D-Pad)
 */
const XboxBadge: React.FC<{ text: string }> = ({ text }) => {
  let badgeStyle = "bg-neutral-800 text-yellow-300 border-neutral-700";

  if (text.includes('(A)')) {
    badgeStyle = "bg-emerald-950/80 text-emerald-300 border-emerald-500/60 shadow-[0_0_8px_rgba(16,185,129,0.3)]";
  } else if (text.includes('(B)')) {
    badgeStyle = "bg-rose-950/80 text-rose-300 border-rose-500/60 shadow-[0_0_8px_rgba(244,63,94,0.3)]";
  } else if (text.includes('(X)')) {
    badgeStyle = "bg-sky-950/80 text-sky-300 border-sky-500/60 shadow-[0_0_8px_rgba(14,165,233,0.3)]";
  } else if (text.includes('(Y)')) {
    badgeStyle = "bg-amber-950/80 text-amber-300 border-amber-500/60 shadow-[0_0_8px_rgba(245,158,11,0.3)]";
  } else if (text.includes('LT') || text.includes('RT') || text.includes('Trigger')) {
    badgeStyle = "bg-indigo-950/80 text-indigo-300 border-indigo-500/60";
  } else if (text.includes('LB') || text.includes('RB') || text.includes('Bumper')) {
    badgeStyle = "bg-purple-950/80 text-purple-300 border-purple-500/60";
  } else if (text.includes('D-Pad') || text.includes('Stick')) {
    badgeStyle = "bg-neutral-800 text-yellow-400 border-yellow-500/40";
  }

  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-xs font-mono font-bold rounded border ${badgeStyle}`}>
      {text}
    </span>
  );
};

export const GameControlsModal: React.FC<GameControlsModalProps> = ({ isOpen, onClose, gameId }) => {
  const [activeTab, setActiveTab] = useState<'controller' | 'keyboard'>('controller');
  const [controllerState, setControllerState] = useState<ControllerState>({
    connected: false,
    id: '',
    buttons: [],
    axes: []
  });

  useEffect(() => {
    const unsub = gamepadManager.subscribe((state) => {
      setControllerState(state);
    });
    return () => unsub();
  }, []);

  const data: GameControlInfo = GAME_CONTROLS[gameId] || {
    title: "Arcade Spel",
    system: "Arcade",
    year: "1980",
    summary: "Arcade Vault klassieker.",
    instructions: ["Gebruik het toetsenbord of de aangesloten controller om te spelen."],
    controls: [
      { action: "Bewegen", keyboard: "Pijltjestoetsen / WASD", xbox: "D-Pad / Linker Stick" },
      { action: "Actie / Start", keyboard: "Spatiebalk / Enter", xbox: "(A) Knop" }
    ],
    tips: []
  };

  // Convert controls into structured XboxButtonMapping
  const xboxMappings: XboxButtonMapping[] = useMemo(() => {
    const result: XboxButtonMapping[] = [];
    const addedButtons = new Set<string>();

    data.controls.forEach((c) => {
      const x = c.xbox;
      if (x.includes('RT') && !addedButtons.has('RT')) {
        result.push({ button: 'RT', label: 'RT (Right Trigger)', action: c.action });
        addedButtons.add('RT');
      }
      if (x.includes('LT') && !addedButtons.has('LT')) {
        result.push({ button: 'LT', label: 'LT (Left Trigger)', action: c.action });
        addedButtons.add('LT');
      }
      if (x.includes('RB') && !addedButtons.has('RB')) {
        result.push({ button: 'RB', label: 'RB (Right Bumper)', action: c.action });
        addedButtons.add('RB');
      }
      if (x.includes('LB') && !addedButtons.has('LB')) {
        result.push({ button: 'LB', label: 'LB (Left Bumper)', action: c.action });
        addedButtons.add('LB');
      }
      if (x.includes('(A)') && !addedButtons.has('A')) {
        result.push({ button: 'A', label: '(A) Groene Knop', action: c.action });
        addedButtons.add('A');
      }
      if (x.includes('(B)') && !addedButtons.has('B')) {
        result.push({ button: 'B', label: '(B) Rode Knop', action: c.action });
        addedButtons.add('B');
      }
      if (x.includes('(X)') && !addedButtons.has('X')) {
        result.push({ button: 'X', label: '(X) Blauwe Knop', action: c.action });
        addedButtons.add('X');
      }
      if (x.includes('(Y)') && !addedButtons.has('Y')) {
        result.push({ button: 'Y', label: '(Y) Gele Knop', action: c.action });
        addedButtons.add('Y');
      }
      if ((x.includes('Stick') || x.includes('D-Pad')) && !addedButtons.has('LS')) {
        result.push({ button: 'LS', label: 'Linker Stick / D-Pad', action: c.action });
        result.push({ button: 'DPAD', label: 'D-Pad Richting', action: c.action });
        addedButtons.add('LS');
        addedButtons.add('DPAD');
      }
      if (x.includes('Rechter Stick') && !addedButtons.has('RS')) {
        result.push({ button: 'RS', label: 'Rechter Stick', action: c.action });
        addedButtons.add('RS');
      }
      if ((x.includes('Start') || x.includes('Menu')) && !addedButtons.has('MENU')) {
        result.push({ button: 'MENU', label: 'Menu / Start Knop', action: c.action });
        addedButtons.add('MENU');
      }
      if ((x.includes('View') || x.includes('Back')) && !addedButtons.has('VIEW')) {
        result.push({ button: 'VIEW', label: 'View / Back Knop', action: c.action });
        addedButtons.add('VIEW');
      }
    });

    return result;
  }, [data]);

  // Set of currently pressed buttons
  const pressedButtons = useMemo(() => {
    const set = new Set<string>();
    if (!controllerState.connected || !controllerState.buttons) return set;
    const b = controllerState.buttons;
    if (b[0]) set.add('A');
    if (b[1]) set.add('B');
    if (b[2]) set.add('X');
    if (b[3]) set.add('Y');
    if (b[4]) set.add('LB');
    if (b[5]) set.add('RB');
    if (b[6]) set.add('LT');
    if (b[7]) set.add('RT');
    if (b[8]) set.add('VIEW');
    if (b[9]) set.add('MENU');
    if (b[10]) set.add('LS');
    if (b[11]) set.add('RS');
    if (b[12] || b[13] || b[14] || b[15]) set.add('DPAD');

    // Axes
    if (controllerState.axes) {
      if (Math.abs(controllerState.axes[0] || 0) > 0.3 || Math.abs(controllerState.axes[1] || 0) > 0.3) {
        set.add('LS');
      }
      if (Math.abs(controllerState.axes[2] || 0) > 0.3 || Math.abs(controllerState.axes[3] || 0) > 0.3) {
        set.add('RS');
      }
    }
    return set;
  }, [controllerState]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="relative bg-neutral-925 border-2 border-neutral-750 rounded-2xl w-full max-w-3xl max-h-[92vh] overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.9)] flex flex-col">
        {/* Header Marquee */}
        <div className="p-4 sm:p-5 border-b border-neutral-800 flex items-center justify-between bg-neutral-950">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-500 to-amber-600 flex items-center justify-center text-black shadow-[0_0_15px_rgba(234,179,8,0.4)]">
              <Gamepad2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black font-mono text-white tracking-wider uppercase">
                  {data.title}
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-neutral-800 text-cyan-300 border border-neutral-700">
                  {data.year} • {data.system}
                </span>
              </div>
              <p className="text-xs text-neutral-400 font-mono">
                Visuele Xbox controller layout &amp; spelinstructies
              </p>
            </div>
          </div>

          <button 
            type="button"
            onClick={onClose} 
            className="p-2 hover:bg-neutral-800 text-neutral-400 hover:text-white rounded-xl transition-colors cursor-pointer border border-transparent hover:border-neutral-700"
            title="Sluiten"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Controller Status Bar */}
        <div className="px-4 sm:px-6 py-2.5 bg-neutral-900/90 border-b border-neutral-800 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
          <div className="flex items-center gap-2">
            {controllerState.connected ? (
              <>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                <span className="text-emerald-300 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Xbox Controller Verbonden:
                </span>
                <span className="text-white truncate max-w-[200px] sm:max-w-xs">
                  {controllerState.id || "Standaard Controller"}
                </span>
              </>
            ) : (
              <>
                <span className="w-2.5 h-2.5 rounded-full bg-neutral-600" />
                <span className="text-neutral-400 flex items-center gap-1">
                  <Info className="w-3.5 h-3.5 text-neutral-400" />
                  Sluit je Xbox controller aan via USB of Bluetooth (druk op een knop om te activeren)
                </span>
              </>
            )}
          </div>
          <span className="text-[11px] text-emerald-400 font-semibold hidden sm:inline">
            Druk op knoppen om ze live te zien oplichten!
          </span>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-2 px-4 sm:px-6 pt-3 bg-neutral-950 border-b border-neutral-850">
          <button
            type="button"
            onClick={() => setActiveTab('controller')}
            className={`px-4 py-2 text-xs font-mono font-bold rounded-t-xl transition-all cursor-pointer flex items-center gap-2 border-t border-x ${
              activeTab === 'controller'
                ? 'bg-neutral-900 text-yellow-400 border-neutral-750 shadow-sm'
                : 'bg-transparent text-neutral-400 border-transparent hover:text-white'
            }`}
          >
            <Gamepad2 className="w-4 h-4 text-emerald-400" />
            <span>Xbox Controller Diagram</span>
            <span className="px-1.5 py-0.2 rounded text-[9px] bg-emerald-950 text-emerald-300 border border-emerald-500/40">
              GRAFISCH
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('keyboard')}
            className={`px-4 py-2 text-xs font-mono font-bold rounded-t-xl transition-all cursor-pointer flex items-center gap-2 border-t border-x ${
              activeTab === 'keyboard'
                ? 'bg-neutral-900 text-yellow-400 border-neutral-750 shadow-sm'
                : 'bg-transparent text-neutral-400 border-transparent hover:text-white'
            }`}
          >
            <Keyboard className="w-4 h-4 text-cyan-400" />
            <span>Toetsenbord &amp; Spelregels</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="overflow-y-auto p-4 sm:p-6 space-y-6">
          {activeTab === 'controller' ? (
            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-neutral-900/60 border border-neutral-800 text-xs text-neutral-300 flex items-center justify-between">
                <span>
                  Hieronder zie je de exacte Xbox controller knoppenindeling voor <strong className="text-white">{data.title}</strong>:
                </span>
                <span className="text-[10px] text-yellow-400 font-bold uppercase">
                  Xbox Series X|S / Xbox One / PC
                </span>
              </div>

              {/* High-Fidelity SVG Graphic with Interactive Lighting & Callouts */}
              <XboxControllerGraphic
                mappings={xboxMappings}
                pressedButtons={pressedButtons}
                size="md"
              />
            </div>
          ) : (
            <>
              {/* Summary */}
              {data.summary && (
                <div className="p-3.5 rounded-xl bg-neutral-900/70 border border-neutral-800 text-xs sm:text-sm text-neutral-300 leading-relaxed font-sans">
                  {data.summary}
                </div>
              )}

              {/* Controls Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                {/* Keyboard Column */}
                <div className="space-y-3 p-4 rounded-xl bg-neutral-900/50 border border-neutral-800">
                  <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
                    <div className="flex items-center gap-2 text-cyan-400 font-bold font-mono text-sm">
                      <Keyboard className="w-4 h-4" />
                      <span>Toetsenbord (PC)</span>
                    </div>
                    <span className="text-[10px] font-mono text-neutral-500 uppercase">Standaard</span>
                  </div>

                  <div className="space-y-2">
                    {data.controls.map((c, i) => (
                      <div key={i} className="flex items-center justify-between text-xs font-mono bg-neutral-950/80 px-3 py-2 rounded-lg border border-neutral-850 hover:border-neutral-750 transition-colors">
                        <span className="text-neutral-300 font-medium">{c.action}</span>
                        <KeyCap text={c.keyboard} />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Xbox Controller Column */}
                <div className="space-y-3 p-4 rounded-xl bg-neutral-900/50 border border-neutral-800">
                  <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
                    <div className="flex items-center gap-2 text-yellow-400 font-bold font-mono text-sm">
                      <Gamepad2 className="w-4 h-4" />
                      <span>Xbox Controller (Knoppen)</span>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold">Actief</span>
                  </div>

                  <div className="space-y-2">
                    {data.controls.map((c, i) => (
                      <div key={i} className="flex items-center justify-between text-xs font-mono bg-neutral-950/80 px-3 py-2 rounded-lg border border-neutral-850 hover:border-neutral-750 transition-colors">
                        <span className="text-neutral-300 font-medium">{c.action}</span>
                        <XboxBadge text={c.xbox} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Gameplay Instructions */}
              <div className="space-y-2.5 p-4 rounded-xl bg-neutral-900/60 border border-neutral-800">
                <h3 className="text-xs font-mono font-bold text-yellow-400 uppercase tracking-wider flex items-center gap-1.5">
                  <span>📖</span>
                  <span>Spelinstructies &amp; Doel</span>
                </h3>
                <ul className="space-y-1.5 text-xs sm:text-sm text-neutral-300 font-sans leading-relaxed">
                  {data.instructions.map((instr, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-yellow-400 font-bold mt-0.5">•</span>
                      <span>{instr}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Tips Section */}
              {data.tips && data.tips.length > 0 && (
                <div className="space-y-2 p-4 rounded-xl bg-amber-950/20 border border-amber-500/30 text-amber-200/90 text-xs sm:text-sm">
                  <div className="flex items-center gap-1.5 font-bold font-mono text-amber-400">
                    <Lightbulb className="w-4 h-4" />
                    <span>Tips van de Meesters</span>
                  </div>
                  <ul className="space-y-1 pl-4 list-disc list-outside text-neutral-300 font-sans">
                    {data.tips.map((tip, i) => (
                      <li key={i}>{tip}</li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 bg-neutral-950 border-t border-neutral-800 flex items-center justify-between text-xs font-mono text-neutral-400">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
            <span>Klik op elk moment op Controller in het menu om deze layout te openen</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-black font-bold font-mono transition-all cursor-pointer shadow-[0_0_12px_rgba(250,204,21,0.4)]"
          >
            Sluiten &amp; Spelen
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * On-screen Side / Bottom HUD for larger desktop screens (resolutie toelaat)
 */
export const GameControlsDesktopHUD: React.FC<{ gameId: string; onOpenModal: () => void }> = ({ gameId, onOpenModal }) => {
  const data = GAME_CONTROLS[gameId];
  if (!data) return null;

  return (
    <div className="hidden xl:flex flex-col w-64 bg-neutral-900/80 border border-neutral-800 rounded-2xl p-4 space-y-3.5 shrink-0 shadow-xl backdrop-blur-sm self-start">
      <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
        <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-white uppercase">
          <Gamepad2 className="w-3.5 h-3.5 text-yellow-400" />
          <span>Besturing</span>
        </div>
        <button
          type="button"
          onClick={onOpenModal}
          className="text-[10px] font-mono text-cyan-400 hover:underline cursor-pointer"
        >
          Volledig »
        </button>
      </div>

      <div className="space-y-1.5">
        {data.controls.slice(0, 4).map((c, i) => (
          <div key={i} className="text-[11px] font-mono flex flex-col bg-neutral-950/80 px-2 py-1.5 rounded border border-neutral-850">
            <span className="text-neutral-400 text-[10px]">{c.action}:</span>
            <div className="flex items-center justify-between mt-0.5">
              <span className="text-cyan-300 font-bold truncate">{c.keyboard}</span>
              <span className="text-yellow-400 text-[10px] truncate">{c.xbox}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="pt-1 border-t border-neutral-800/80 text-[11px] text-neutral-400 font-sans leading-snug">
        <p className="line-clamp-3">{data.instructions[0]}</p>
      </div>
    </div>
  );
};
