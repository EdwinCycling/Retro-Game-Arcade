import React from 'react';
import { X, Key, Shield, Zap, Sparkles, BookOpen, Trophy, Play } from 'lucide-react';
import { REPTON_LEVELS } from '../game/reptonLevels';

interface ReptonHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlay: (levelIndex?: number) => void;
}

export const ReptonHistoryModal: React.FC<ReptonHistoryModalProps> = ({
  isOpen,
  onClose,
  onPlay
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-neutral-900 border-2 border-emerald-500/80 rounded-3xl p-6 sm:p-8 shadow-[0_0_50px_rgba(16,185,129,0.3)] overflow-y-auto text-neutral-200 font-sans">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-700 transition active:scale-95 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Badge & Title */}
        <div className="space-y-2 mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-bold">
            <span>🦎 BBC MICRO ARCHIEF • SUPERIOR SOFTWARE 1985</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black font-mono text-white tracking-tight flex items-center gap-3">
            <span>REPTON</span>
            <span className="text-emerald-400 text-lg sm:text-xl font-normal">by Tim Tyler</span>
          </h2>
          <p className="text-neutral-400 text-xs sm:text-sm font-mono">
            Platform: BBC Micro Model B / Acorn Electron • Uitgever: Superior Software • Jaar: 1985
          </p>
        </div>

        {/* Story & Background */}
        <div className="space-y-5 text-xs sm:text-sm leading-relaxed text-neutral-300">
          <section className="p-4 rounded-2xl bg-neutral-950/80 border border-emerald-950/60 space-y-2">
            <h3 className="font-bold text-emerald-400 font-mono text-sm flex items-center gap-1.5">
              <BookOpen className="w-4 h-4" />
              <span>HET VERHAAL: DE LEGENDE VAN HET GROENE REPTIEL</span>
            </h3>
            <p>
              In 1985 programmeerde de toen 15-jarige <strong>Tim Tyler</strong> op zijn BBC Micro een spel dat geschiedenis zou schrijven: <em>Repton</em>. Superior Software bracht het uit op cassettebandje en diskette, en het groeide uit tot hét vlaggenschip en bestverkochte spel ooit op Britse Acorn computers.
            </p>
            <p>
              Jij bestuurt Repton door ondergrondse tunnels en kamers. Jouw missie: verzamel alle fonkelende diamanten en versla de monsters voordat de zandloper leegloopt!
            </p>
          </section>

          {/* Core Mechanics & Spelregels */}
          <section className="space-y-3">
            <h3 className="font-bold text-white font-mono text-sm flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-yellow-400" />
              <span>SPELREGELS & MECHANIEKEN</span>
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-neutral-950/60 border border-neutral-800 space-y-1">
                <span className="text-emerald-400 font-mono font-bold text-xs block">
                  1. Aarde Graven & Rotsen Duwen
                </span>
                <p className="text-neutral-400 text-xs">
                  Loop door bruine aarde om het weg te graven. Rotsen kun je <strong>horizontaal</strong> vooruit duwen als er een open ruimte achter is.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-neutral-950/60 border border-neutral-800 space-y-1">
                <span className="text-yellow-400 font-mono font-bold text-xs block">
                  2. Zwaartekracht & Rollende Rotsen
                </span>
                <p className="text-neutral-400 text-xs">
                  Als er aarde onder een rots verdwijnt, valt hij! Rotsen rollen ook opzij van andere rotsen als de flank vrij is. Pas op: laat ze niet op je hoofd vallen!
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-neutral-950/60 border border-neutral-800 space-y-1">
                <span className="text-purple-400 font-mono font-bold text-xs block">
                  3. Eieren & Monsters Verpletteren
                </span>
                <p className="text-neutral-400 text-xs">
                  Laat een rots op een ei vallen om het te breken. Monsters jagen op je, maar als je een rots op een monster laat vallen, verandert hij in een diamant!
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-neutral-950/60 border border-neutral-800 space-y-1">
                <span className="text-cyan-400 font-mono font-bold text-xs block">
                  4. Sleutels & Kluizen
                </span>
                <p className="text-neutral-400 text-xs">
                  Pak de gouden sleutel om alle gesloten kluizen in het level gelijktijdig te ontgrendelen tot glinsterende diamanten.
                </p>
              </div>
            </div>
          </section>

          {/* The 12 Original Passwords */}
          <section className="p-4 rounded-2xl bg-neutral-950/80 border border-neutral-800 space-y-3">
            <h3 className="font-bold text-yellow-400 font-mono text-sm flex items-center gap-1.5">
              <Key className="w-4 h-4" />
              <span>DE ORIGINELE 12 WACHTWOORDEN (LEVEL A T/M L)</span>
            </h3>
            <p className="text-neutral-400 text-xs">
              Net als op de originele BBC Micro kun je elk level direct ontgrendelen met zijn geheime reptielen- of monster-wachtwoord:
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-mono">
              {REPTON_LEVELS.map((lvl, idx) => (
                <button
                  key={lvl.id}
                  onClick={() => {
                    onClose();
                    onPlay(idx);
                  }}
                  className="p-2 rounded-lg bg-neutral-900 border border-neutral-700/80 hover:border-emerald-400 text-left hover:bg-neutral-800 transition flex flex-col group cursor-pointer"
                >
                  <div className="flex items-center justify-between text-emerald-400 font-bold">
                    <span>Level {lvl.letter}</span>
                    <Play className="w-3 h-3 opacity-0 group-hover:opacity-100 transition" />
                  </div>
                  <span className="text-white text-[11px] font-bold mt-0.5">"{lvl.password}"</span>
                  <span className="text-neutral-400 text-[10px] truncate">{lvl.name}</span>
                </button>
              ))}
            </div>
          </section>

          {/* Historical Fact */}
          <section className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/30 to-teal-950/30 border border-emerald-500/30 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-white text-xs font-mono mb-1">
                Wist je dat?
              </h4>
              <p className="text-xs text-neutral-300">
                Het succes van Repton leidde tot een hele reeks vervolgen op de BBC Micro, waaronder <em>Repton 2</em>, <em>Repton 3</em>, <em>Around the World in 40 Reptons</em> en <em>The Life of Repton</em>.
              </p>
            </div>
          </section>
        </div>

        {/* Footer Actions */}
        <div className="mt-6 pt-4 border-t border-neutral-800 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-mono text-xs font-bold transition active:scale-95 cursor-pointer"
          >
            SLUITEN
          </button>
          <button
            onClick={() => {
              onClose();
              onPlay(0);
            }}
            className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-mono text-xs font-black tracking-wider shadow-[0_0_20px_rgba(16,185,129,0.6)] transition active:scale-95 cursor-pointer flex items-center gap-2"
          >
            <Play className="w-4 h-4 fill-black" />
            <span>SPEEL LEVEL A DIRECT</span>
          </button>
        </div>
      </div>
    </div>
  );
};
