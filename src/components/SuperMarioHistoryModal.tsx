import React from 'react';
import { X, Trophy, Sparkles, BookOpen, Cpu, Music, Play } from 'lucide-react';
import { Language } from '../i18n/lobbyTranslations';
import { getSuperMarioScores } from '../game/superMarioHighScores';

interface SuperMarioHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang?: Language;
  onPlay?: () => void;
}

export const SuperMarioHistoryModal: React.FC<SuperMarioHistoryModalProps> = ({
  isOpen,
  onClose,
  lang = 'nl',
  onPlay,
}) => {
  if (!isOpen) return null;

  const isNl = lang === 'nl';
  const scores = getSuperMarioScores();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm animate-fade-in font-sans">
      <div className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto bg-neutral-900 border-2 border-red-500/80 rounded-2xl shadow-[0_0_50px_rgba(239,68,68,0.35)] text-white p-5 sm:p-7">
        {/* Header Marquee */}
        <div className="flex items-start justify-between border-b border-red-500/40 pb-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-600 to-yellow-500 flex items-center justify-center text-2xl shadow-lg border border-red-400">
              🍄
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black font-mono text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-yellow-300 to-sky-400 tracking-wider">
                SUPER MARIO BROS. (1985)
              </h2>
              <p className="text-xs text-red-300 font-mono">
                {isNl
                  ? 'Nintendo Famicom / NES • Shigeru Miyamoto & Takashi Tezuka'
                  : 'Nintendo Famicom / NES • Shigeru Miyamoto & Takashi Tezuka'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white rounded-lg bg-neutral-800 hover:bg-neutral-700 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Narrative & History */}
        <div className="space-y-4 text-sm text-neutral-300 leading-relaxed font-sans">
          <div className="bg-red-950/40 p-3.5 rounded-xl border border-red-800/60 flex items-start gap-3">
            <BookOpen className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-red-300 font-bold font-mono text-xs uppercase tracking-wider mb-1">
                {isNl ? 'De Redder van de Game-Industrie' : 'The Savior of the Video Game Industry'}
              </h4>
              <p className="text-xs sm:text-sm text-neutral-200">
                {isNl
                  ? 'Uitgebracht op 13 september 1985 in Japan voor de Famicom (en later in Noord-Amerika en Europa voor de NES). Na de beruchte Noord-Amerikaanse videogamecrisis van 1983 bewees Super Mario Bros. dat interactief entertainment met ongekende creativiteit, precisie en charme een wereldwijd miljardenpubliek kon betoveren. Het spel verkocht meer dan 40 miljoen exemplaren.'
                  : 'Released on September 13, 1985 in Japan for the Famicom (and later in the West on the NES). Following the 1983 video game crash, Super Mario Bros. revived the home console industry. Shigeru Miyamoto and Takashi Tezuka proved that games could be expansive, joyful, and artistically rich, selling over 40 million cartridges worldwide.'}
              </p>
            </div>
          </div>

          <div className="bg-neutral-800/60 p-3.5 rounded-xl border border-neutral-700/80 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-yellow-300 font-bold font-mono text-xs uppercase tracking-wider mb-1">
                {isNl ? 'Meesterlijk Levelontwerp: Wereld 1-1' : 'Masterclass Game Design: World 1-1'}
              </h4>
              <p className="text-xs sm:text-sm text-neutral-200">
                {isNl
                  ? 'Wereld 1-1 geldt op alle game design universiteiten als het absolute schoolvoorbeeld van onzichtbare tutorials: binnen 30 seconden leert de speler door visuele nieuwsgierigheid rennen, springen, blokken stoten, de eerste Goomba ontwijken, en een Super Mushroom grijpen om twee keer zo groot te worden zonder één woord tekst!'
                  : 'World 1-1 is studied globally as the ultimate invisible tutorial. Without a single line of instructional text, players naturally discover how to jump, avoid the first Goomba, hit question mark blocks, and seize a Super Mushroom to grow into Super Mario.'}
              </p>
            </div>
          </div>

          <div className="bg-neutral-800/60 p-3.5 rounded-xl border border-neutral-700/80 flex items-start gap-3">
            <Music className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sky-300 font-bold font-mono text-xs uppercase tracking-wider mb-1">
                {isNl ? 'Koji Kondo’s Onvergetelijke Chiptune' : 'Koji Kondo’s Legendary Chiptune Soundtrack'}
              </h4>
              <p className="text-xs sm:text-sm text-neutral-200">
                {isNl
                  ? 'Componist Koji Kondo schreef met de beperkingen van de Ricoh 2A03 (slechts 2 blokgolven, 1 driehoeksgolf en 1 ruiskanaal) het beroemdste muzikale thema in de geschiedenis van games. Het overworld-thema is de eerste gamecompositie die is opgenomen in de Amerikaanse Library of Congress National Recording Registry.'
                  : 'Composer Koji Kondo pushed the Ricoh 2A03 hardware (2 square waves, 1 triangle bass, 1 noise channel) to its limits, crafting the Overworld theme—widely cited as the most recognized piece of music in video game history, inducted into the US National Recording Registry.'}
              </p>
            </div>
          </div>

          {/* Technical Specs Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
            <div className="p-2.5 rounded-lg bg-neutral-950 border border-neutral-800 text-center">
              <span className="text-[10px] text-neutral-400 font-mono block">CPU</span>
              <span className="text-xs font-bold text-red-400">Ricoh 2A03 (1.79 MHz)</span>
            </div>
            <div className="p-2.5 rounded-lg bg-neutral-950 border border-neutral-800 text-center">
              <span className="text-[10px] text-neutral-400 font-mono block">RESOLUTIE</span>
              <span className="text-xs font-bold text-yellow-400">256 x 240 (60 FPS)</span>
            </div>
            <div className="p-2.5 rounded-lg bg-neutral-950 border border-neutral-800 text-center">
              <span className="text-[10px] text-neutral-400 font-mono block">CARTRIDGE</span>
              <span className="text-xs font-bold text-sky-400">32 KB PRG + 8 KB CHR</span>
            </div>
            <div className="p-2.5 rounded-lg bg-neutral-950 border border-neutral-800 text-center">
              <span className="text-[10px] text-neutral-400 font-mono block">DIRECTIE</span>
              <span className="text-xs font-bold text-emerald-400">Miyamoto & Tezuka</span>
            </div>
          </div>

          {/* High Scores Table */}
          <div className="mt-4 p-3 rounded-xl bg-neutral-950/80 border border-neutral-800">
            <div className="flex items-center gap-2 mb-2 font-mono text-xs text-yellow-400 font-bold">
              <Trophy className="w-4 h-4 text-yellow-500" />
              <span>{isNl ? 'LOKALE RECORDHOUDERS (TOP SCORES)' : 'LOCAL HALL OF FAME'}</span>
            </div>
            <div className="grid grid-cols-4 gap-2 text-xs font-mono text-neutral-400 border-b border-neutral-800 pb-1 mb-1.5">
              <span>INIT</span>
              <span>SCORE</span>
              <span>WERELD</span>
              <span>MUNTEN</span>
            </div>
            {scores.slice(0, 5).map((s, idx) => (
              <div key={s.id} className="grid grid-cols-4 gap-2 text-xs font-mono py-0.5 text-neutral-200">
                <span className="font-bold text-yellow-300">{idx + 1}. {s.initials}</span>
                <span>{s.score.toLocaleString()}</span>
                <span className="text-red-300">{s.world}</span>
                <span className="text-yellow-400">🪙 {s.coins}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-6 pt-4 border-t border-neutral-800 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition cursor-pointer"
          >
            {isNl ? 'Sluiten' : 'Close'}
          </button>
          {onPlay && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onPlay();
              }}
              className="px-5 py-2 rounded-xl text-xs font-black bg-gradient-to-r from-red-600 to-yellow-500 hover:from-red-500 hover:to-yellow-400 text-black flex items-center gap-1.5 shadow-[0_0_15px_rgba(239,68,68,0.5)] transition cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>{isNl ? 'START SUPER MARIO BROS.' : 'PLAY SUPER MARIO BROS.'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
