/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Lemmings (1991 DMA Design / Psygnosis / C64) - Historical Dossier Modal
 */

import React, { useState } from 'react';
import { X, Trophy, Cpu, History, Sparkles, BookOpen, Layers, ShieldCheck, HeartHandshake } from 'lucide-react';

interface LemmingsHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlay?: () => void;
}

export const LemmingsHistoryModal: React.FC<LemmingsHistoryModalProps> = ({
  isOpen,
  onClose,
  onPlay
}) => {
  const [activeTab, setActiveTab] = useState<'origin' | 'c64' | 'skills' | 'legacy'>('origin');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-neutral-900 border-2 border-emerald-500/80 rounded-2xl shadow-[0_0_50px_rgba(16,185,129,0.4)] flex flex-col overflow-hidden text-neutral-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-neutral-800 bg-gradient-to-r from-emerald-950/80 via-neutral-900 to-cyan-950/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/30 border border-emerald-500/60 flex items-center justify-center text-2xl shadow-[0_0_15px_rgba(16,185,129,0.5)]">
              🐹
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black font-mono tracking-wider text-white flex items-center gap-2">
                <span>LEMMINGS</span>
                <span className="text-xs px-2 py-0.5 rounded bg-emerald-900/80 text-emerald-300 border border-emerald-700">
                  1991 / 1993 C64
                </span>
              </h2>
              <p className="text-xs font-mono text-emerald-400">
                DMA Design (David Jones & Mike Dailly) • Psygnosis
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-neutral-800 bg-neutral-950/60 p-1.5 gap-1.5 text-xs font-mono overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('origin')}
            className={`px-3 py-2 rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'origin'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800'
            }`}
          >
            <History className="w-4 h-4" />
            <span>1991 Ontstaan</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('c64')}
            className={`px-3 py-2 rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'c64'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800'
            }`}
          >
            <Cpu className="w-4 h-4" />
            <span>C64 & Amiga Tech</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('skills')}
            className={`px-3 py-2 rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'skills'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>8 Vaardigheden</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('legacy')}
            className={`px-3 py-2 rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'legacy'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800'
            }`}
          >
            <Trophy className="w-4 h-4" />
            <span>GTA & DMA Legacy</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto max-h-[60vh] space-y-4 font-sans text-sm leading-relaxed">
          {activeTab === 'origin' && (
            <div className="space-y-4 animate-fade-in">
              <div className="p-4 rounded-xl bg-neutral-950/80 border border-emerald-900/60">
                <h3 className="text-base font-bold text-emerald-300 font-mono mb-2 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  De toevallige animatie die de wereld veranderde
                </h3>
                <p className="text-neutral-300">
                  In augustus 1989 werkte **Mike Dailly** bij **DMA Design** (Dundee, Schotland) aan animaties voor het schietspel <em>Walker</em>. Om te bewijzen dat een 16x16 pixel personage vloeiend kon lopen en sterven, tekende hij kleine 8-pixel figuurtjes die in een rij over het scherm renden en in een verbrandingsoven sprongen.
                </p>
                <p className="text-neutral-300 mt-2">
                  Collega **Russell Kay** riep direct: <em>"There's a game in that!"</em> en noemde de wezentjes **Lemmings**. DMA Design oprichter **David Jones** en Gary Timmons ontwierpen direct de vernietigbare levels en de 8 iconische vaardigheden.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-800">
                  <span className="text-emerald-400 font-bold block mb-1">📅 Eerste Uitgave</span>
                  <p className="text-neutral-300">14 Februari 1991 (Valentijnsdag) op de Commodore Amiga & Atari ST door Psygnosis.</p>
                </div>
                <div className="p-3 rounded-lg bg-neutral-950 border border-neutral-800">
                  <span className="text-emerald-400 font-bold block mb-1">💿 Verkoopsucces</span>
                  <p className="text-neutral-300">Meer dan 15 miljoen exemplaren verkocht over tientallen platforms, van C64 tot PC en SNES.</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'c64' && (
            <div className="space-y-4 animate-fade-in">
              <div className="p-4 rounded-xl bg-neutral-950/80 border border-cyan-900/60">
                <h3 className="text-base font-bold text-cyan-300 font-mono mb-2 flex items-center gap-2">
                  <Cpu className="w-4 h-4" />
                  De Legendarische Commodore 64 Port (1993)
                </h3>
                <p className="text-neutral-300">
                  Het omzetten van een 16-bit Amiga game met 100 onafhankelijke lemmings, pixel-gebaseerde destructible bitmasks en chiptune audio naar de 8-bit **Commodore 64 (MOS 6510 CPU op 1 MHz, 64KB RAM)** werd lang voor onmogelijk gehouden.
                </p>
                <p className="text-neutral-300 mt-2">
                  Programmeur **John Twiddy** slaagde erin door een innovatieve software-sprite multiplexer te schrijven die direct in het VIC-II bitmap geheugen tekende. Hierdoor konden tientallen lemmings tegelijk over het scherm wemelen met een fantastische SID-soundtrack!
                </p>
              </div>

              <div className="p-4 rounded-xl bg-neutral-950 border border-neutral-800 space-y-2">
                <h4 className="font-bold text-white text-xs font-mono">Chiptune & Voice Synthese:</h4>
                <ul className="list-disc list-inside text-xs text-neutral-300 space-y-1">
                  <li>**Let's Go! & Oh No!**: De iconische stem-samples werden gecomponeerd door Brian Johnston en Tim Wright.</li>
                  <li>**Klassieke Melodieën**: Omdat copyright-vrije nummers nodig waren, arrangeerde DMA Design hits zoals *Offenbach’s Can-Can*, *London Bridge*, en *Drunken Sailor*.</li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'skills' && (
            <div className="space-y-3 animate-fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                <div className="p-2.5 rounded bg-neutral-950 border border-neutral-800">
                  <span className="text-green-400 font-bold">🧗 CLIMBER</span>
                  <p className="text-neutral-400 text-[11px] mt-0.5">Klimt tegen loodrechte muren omhoog en klautert op richels.</p>
                </div>
                <div className="p-2.5 rounded bg-neutral-950 border border-neutral-800">
                  <span className="text-cyan-400 font-bold">🪂 FLOATER</span>
                  <p className="text-neutral-400 text-[11px] mt-0.5">Opent een paraplu bij hoge vallen om zacht en veilig te landen.</p>
                </div>
                <div className="p-2.5 rounded bg-neutral-950 border border-neutral-800">
                  <span className="text-red-400 font-bold">💣 BOMBER ("Oh No!")</span>
                  <p className="text-neutral-400 text-[11px] mt-0.5">Telt 5 seconden af en ontploft in een cirkelvormige krater.</p>
                </div>
                <div className="p-2.5 rounded bg-neutral-950 border border-neutral-800">
                  <span className="text-rose-400 font-bold">🛑 BLOCKER</span>
                  <p className="text-neutral-400 text-[11px] mt-0.5">Staat stil met armen wijd en laat andere lemmings omkeren.</p>
                </div>
                <div className="p-2.5 rounded bg-neutral-950 border border-neutral-800">
                  <span className="text-amber-400 font-bold">🧱 BUILDER</span>
                  <p className="text-neutral-400 text-[11px] mt-0.5">Bouwt een diagonale trap van 12 treden omhoog over gaten.</p>
                </div>
                <div className="p-2.5 rounded bg-neutral-950 border border-neutral-800">
                  <span className="text-purple-400 font-bold">⛏️ BASHER</span>
                  <p className="text-neutral-400 text-[11px] mt-0.5">Graaft horizontaal een tunnel door zachte aarde en muren.</p>
                </div>
                <div className="p-2.5 rounded bg-neutral-950 border border-neutral-800">
                  <span className="text-blue-400 font-bold">⛏️ MINER</span>
                  <p className="text-neutral-400 text-[11px] mt-0.5">Hakt schuin naar beneden onder een hoek van 45 graden.</p>
                </div>
                <div className="p-2.5 rounded bg-neutral-950 border border-neutral-800">
                  <span className="text-pink-400 font-bold">🔨 DIGGER</span>
                  <p className="text-neutral-400 text-[11px] mt-0.5">Graaft een loodrechte schacht recht omlaag door de grond.</p>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-red-950/40 border border-red-800/60 text-xs text-neutral-300">
                <span className="text-red-400 font-bold block mb-1">☢️ DE ARMAGEDDON / NUKE KNOP:</span>
                Wanneer een level onoplosbaar wordt, laat een dubbelklik op de Nuke-knop alle overgebleven lemmings tegelijk aftellen en ontploffen in een spectaculair vuurwerk!
              </div>
            </div>
          )}

          {activeTab === 'legacy' && (
            <div className="space-y-4 animate-fade-in">
              <div className="p-4 rounded-xl bg-neutral-950/80 border border-amber-900/60">
                <h3 className="text-base font-bold text-amber-300 font-mono mb-2 flex items-center gap-2">
                  <Trophy className="w-4 h-4" />
                  Van Lemmings naar Grand Theft Auto (GTA)
                </h3>
                <p className="text-neutral-300">
                  Het gigantische succes van *Lemmings* stelde studio **DMA Design** in staat om uit te breiden en te experimenteren met nieuwe genres. In 1997 bracht hetzelfde team onder leiding van David Jones een revolutionaire top-down actiegame uit: **Grand Theft Auto (GTA)**.
                </p>
                <p className="text-neutral-300 mt-2">
                  DMA Design werd later omgedoopt tot **Rockstar North**, de makers van *GTA V* en *Red Dead Redemption*. De kleine groene lemmings vormden letterlijk het fundament van een van de grootste gamefranchises ter wereld!
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-800 bg-neutral-950 flex items-center justify-between">
          <span className="text-xs font-mono text-neutral-500">
            Retro Arcade Vault • Psygnosis & DMA Archive
          </span>
          <div className="flex gap-2">
            {onPlay && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onPlay();
                }}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-black font-bold font-mono text-xs shadow-lg transition-all cursor-pointer"
              >
                SPEEL LEMMINGS
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-mono text-xs transition-all cursor-pointer"
            >
              Sluiten
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
