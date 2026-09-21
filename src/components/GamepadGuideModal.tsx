import React, { useEffect, useState, useMemo } from 'react';
import { Gamepad2, X, CheckCircle2, AlertCircle, Sparkles, ChevronRight, Zap } from 'lucide-react';
import { gamepadManager } from '../utils/gamepadManager';
import { Language } from '../i18n/lobbyTranslations';
import { XboxControllerGraphic, XboxButtonMapping } from './XboxControllerGraphic';

interface GamepadGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang?: Language;
}

export const GamepadGuideModal: React.FC<GamepadGuideModalProps> = ({
  isOpen,
  onClose,
  lang = 'nl',
}) => {
  const [connected, setConnected] = useState(false);
  const [controllerId, setControllerId] = useState('');
  const [buttons, setButtons] = useState<boolean[]>([]);
  const [axes, setAxes] = useState<number[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'outrun' | 'fps' | 'arcade'>('outrun');

  useEffect(() => {
    return gamepadManager.subscribe((state) => {
      setConnected(state.connected);
      setControllerId(state.id);
      setButtons(state.buttons);
      setAxes(state.axes);
    });
  }, []);

  const pressedButtons = useMemo(() => {
    const set = new Set<string>();
    if (!connected || !buttons) return set;
    if (buttons[0]) set.add('A');
    if (buttons[1]) set.add('B');
    if (buttons[2]) set.add('X');
    if (buttons[3]) set.add('Y');
    if (buttons[4]) set.add('LB');
    if (buttons[5]) set.add('RB');
    if (buttons[6]) set.add('LT');
    if (buttons[7]) set.add('RT');
    if (buttons[8]) set.add('VIEW');
    if (buttons[9]) set.add('MENU');
    if (buttons[10]) set.add('LS');
    if (buttons[11]) set.add('RS');
    if (buttons[12] || buttons[13] || buttons[14] || buttons[15]) set.add('DPAD');

    if (axes) {
      if (Math.abs(axes[0] || 0) > 0.3 || Math.abs(axes[1] || 0) > 0.3) set.add('LS');
      if (Math.abs(axes[2] || 0) > 0.3 || Math.abs(axes[3] || 0) > 0.3) set.add('RS');
    }
    return set;
  }, [connected, buttons, axes]);

  const activeMappings: XboxButtonMapping[] = useMemo(() => {
    if (activeTab === 'outrun') {
      return [
        { button: 'RT', label: 'RT (Rechter Trigger)', action: 'Gas Geven (Tot 293 km/u)' },
        { button: 'LT', label: 'LT (Linker Trigger)', action: 'Remmen' },
        { button: 'LS', label: 'Linker Stick', action: 'Sturen (Vloeiend analoog)' },
        { button: 'DPAD', label: 'D-Pad Richting', action: 'Sturen Links / Rechts' },
        { button: 'Y', label: '(Y) Knop / RB', action: 'Schakelen Low / High' },
        { button: 'A', label: '(A) Groene Knop', action: 'Gas Geven (Alternatief)' },
        { button: 'X', label: '(X) Blauwe Knop', action: 'Remmen (Alternatief)' },
        { button: 'B', label: '(B) Rode Knop', action: 'Radio Zender Wisselen' },
        { button: 'MENU', label: 'Start / Menu', action: 'Spel Pauzeren / Start' }
      ];
    } else if (activeTab === 'fps') {
      return [
        { button: 'LS', label: 'Linker Stick', action: 'Bewegen (Voorwaarts / Strafen)' },
        { button: 'RS', label: 'Rechter Stick', action: 'Rondkijken (Aim & Look)' },
        { button: 'RT', label: 'RT (Rechter Trigger)', action: 'Schieten (Primary Fire)' },
        { button: 'LT', label: 'LT (Linker Trigger)', action: 'Secundair Vuur / Zoom' },
        { button: 'A', label: '(A) Groene Knop', action: 'Springen' },
        { button: 'X', label: '(X) Blauwe Knop', action: 'Herladen / Activeren' },
        { button: 'Y', label: '(Y) Gele Knop', action: 'Zaklamp / Wapen Wisselen' },
        { button: 'RB', label: 'RB / LB Bumpers', action: 'Volgend / Vorig Wapen' },
        { button: 'MENU', label: 'Start / Menu', action: 'Pauze / Menu' }
      ];
    } else if (activeTab === 'arcade') {
      return [
        { button: 'LS', label: 'Linker Stick', action: 'Bewegen / Rennen / Graven' },
        { button: 'DPAD', label: 'D-Pad', action: 'Klassieke 4-Richting Besturing' },
        { button: 'A', label: '(A) Groene Knop', action: 'Primaire Actie (Springen / Schieten)' },
        { button: 'B', label: '(B) Rode Knop', action: 'Secundaire Actie / Bom' },
        { button: 'X', label: '(X) Blauwe Knop', action: 'Speciale Kracht / Nudge' },
        { button: 'MENU', label: 'Start / Menu', action: 'Insert Coin / Start' }
      ];
    }
    // Overview
    return [
      { button: 'LS', label: 'Linker Stick / D-Pad', action: 'Beweging & Sturen in alle spellen' },
      { button: 'A', label: '(A) Groene Knop', action: 'Bevestigen, Springen, Gas geven' },
      { button: 'B', label: '(B) Rode Knop', action: 'Annuleren, Terug, Radio wisselen' },
      { button: 'RT', label: 'RT Trigger', action: 'Accelereren / Schieten' },
      { button: 'LT', label: 'LT Trigger', action: 'Remmen / Secundair' },
      { button: 'MENU', label: 'Start / Menu', action: 'Pauze & Hervatten' }
    ];
  }, [activeTab]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-3xl max-h-[92vh] overflow-y-auto rounded-3xl bg-gradient-to-b from-neutral-900 via-neutral-900/98 to-neutral-950 border-2 border-emerald-500/60 shadow-[0_0_50px_rgba(16,185,129,0.35)] p-5 sm:p-7 text-white font-mono"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-950/80 border border-emerald-500/60 flex items-center justify-center text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
              <Gamepad2 className="w-7 h-7 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                  {lang === 'nl' ? 'Xbox Controller Ondersteuning' : 'Xbox Controller Support'}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-400 text-black">
                  PLUG &amp; PLAY
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-0.5">
                {lang === 'nl' 
                  ? 'Ondersteunt alle officiële Xbox One, Series X/S & PC Gamepads via USB en Bluetooth'
                  : 'Supports all official Xbox One, Series X/S & PC Gamepads'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-neutral-800/80 hover:bg-neutral-700 text-neutral-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Controller Status Bar */}
        <div className="mt-4 p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            {connected ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
            )}
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-2">
                <span>{lang === 'nl' ? 'Status:' : 'Status:'}</span>
                <span className={connected ? 'text-emerald-400' : 'text-amber-400'}>
                  {connected 
                    ? (lang === 'nl' ? 'Xbox Controller Verbonden & Gereed!' : 'Controller Connected & Ready!') 
                    : (lang === 'nl' ? 'Geen controller gedetecteerd (druk op een knop om te wekken)' : 'No controller detected (press any button)')}
                </span>
              </div>
              <p className="text-[11px] text-neutral-400 truncate max-w-md">
                {connected ? controllerId : (lang === 'nl' ? 'Sluit je Xbox controller aan via USB of Bluetooth en druk op een knop om direct te spelen op de PC.' : 'Connect your Xbox controller via USB or Bluetooth and press any button to wake.')}
              </p>
            </div>
          </div>
          {connected && (
            <span className="px-2.5 py-1 rounded-lg bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-[10px] font-bold shrink-0">
              ACTIEF
            </span>
          )}
        </div>

        {/* Tabs for Category Mapping */}
        <div className="flex items-center gap-1.5 mt-4 p-1 rounded-xl bg-neutral-950 border border-neutral-800 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('outrun')}
            className={`flex-1 py-2 rounded-lg text-center font-bold transition-all cursor-pointer ${
              activeTab === 'outrun' ? 'bg-red-500 text-white shadow-md' : 'text-neutral-400 hover:text-white'
            }`}
          >
            🏎️ OutRun (1986)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('fps')}
            className={`flex-1 py-2 rounded-lg text-center font-bold transition-all cursor-pointer ${
              activeTab === 'fps' ? 'bg-orange-500 text-black shadow-md' : 'text-neutral-400 hover:text-white'
            }`}
          >
            💥 Half-Life &amp; Doom
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('arcade')}
            className={`flex-1 py-2 rounded-lg text-center font-bold transition-all cursor-pointer ${
              activeTab === 'arcade' ? 'bg-cyan-500 text-black shadow-md' : 'text-neutral-400 hover:text-white'
            }`}
          >
            👾 Retro Arcade
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`flex-1 py-2 rounded-lg text-center font-bold transition-all cursor-pointer ${
              activeTab === 'overview' ? 'bg-emerald-500 text-black shadow-md' : 'text-neutral-400 hover:text-white'
            }`}
          >
            📋 {lang === 'nl' ? 'Algemeen' : 'Overview'}
          </button>
        </div>

        {/* Graphical Controller Representation */}
        <div className="mt-4 p-4 rounded-2xl bg-neutral-950 border border-neutral-800 flex flex-col items-center">
          <XboxControllerGraphic
            mappings={activeMappings}
            pressedButtons={pressedButtons}
            size="md"
          />
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-neutral-800 flex items-center justify-between text-xs text-neutral-400">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>{lang === 'nl' ? 'Druk op een willekeurige controller knop om hem direct live te testen!' : 'Press any controller button to test live!'}</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-black tracking-wider transition-all cursor-pointer active:scale-95 shadow-[0_0_15px_rgba(16,185,129,0.4)]"
          >
            {lang === 'nl' ? 'BEGREPEN, SLUITEN' : 'GOT IT, CLOSE'}
          </button>
        </div>
      </div>
    </div>
  );
};

