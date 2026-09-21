/**
 * Half-Life (1998 Valve Software) - Historical Dossier & Technical Specs Modal
 */

import React from 'react';
import { X, Trophy, Cpu, History, Award, BookOpen, Sparkles, Volume2, Play } from 'lucide-react';
import { Language } from '../i18n/lobbyTranslations';
import { getHalfLifeScores } from '../game/halfLifeHighScores';
import { halfLifeAudio } from '../game/halfLifeAudio';

interface HalfLifeHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlay: () => void;
  lang?: Language;
}

export const HalfLifeHistoryModal: React.FC<HalfLifeHistoryModalProps> = ({
  isOpen,
  onClose,
  onPlay,
  lang = 'nl',
}) => {
  if (!isOpen) return null;

  const scores = getHalfLifeScores();
  const top = scores[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col rounded-2xl bg-neutral-950 border-2 border-orange-500/80 shadow-[0_0_50px_rgba(234,88,12,0.4)] text-white overflow-hidden">
        {/* Header Marquee */}
        <div className="relative px-6 py-4 border-b border-neutral-800 flex items-center justify-between bg-gradient-to-r from-orange-950 via-neutral-900 to-black">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-600 text-white font-mono font-black text-2xl flex items-center justify-center shadow-[0_0_15px_rgba(234,88,12,0.8)] border border-amber-300/40">
              λ
            </div>
            <div>
              <h2 className="font-mono font-black text-lg sm:text-xl tracking-wider text-white flex items-center gap-2">
                <span>HALF-LIFE (1998)</span>
                <span className="text-xs px-2 py-0.5 rounded bg-orange-950 border border-orange-700 text-orange-300 font-bold">
                  VALVE SOFTWARE
                </span>
              </h2>
              <p className="text-xs text-neutral-400 font-mono">
                {lang === 'nl'
                  ? 'Gabe Newell, Marc Laidlaw & Kelly Bailey • GoldSrc Engine'
                  : 'Gabe Newell, Marc Laidlaw & Kelly Bailey • GoldSrc Engine'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors cursor-pointer"
            aria-label="Sluiten"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-sm text-neutral-300">
          {/* Quick Specs Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800">
              <div className="flex items-center gap-1.5 text-xs text-neutral-400 mb-1">
                <Cpu className="w-3.5 h-3.5 text-orange-400" />
                <span>RESOLUTIE</span>
              </div>
              <p className="font-mono font-bold text-white text-xs sm:text-sm">1920x1280 (High-Res 3D)</p>
            </div>
            <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800">
              <div className="flex items-center gap-1.5 text-xs text-neutral-400 mb-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>FRAMERATE</span>
              </div>
              <p className="font-mono font-bold text-white text-xs sm:text-sm">60 FPS Hardware 3D</p>
            </div>
            <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800">
              <div className="flex items-center gap-1.5 text-xs text-neutral-400 mb-1">
                <Volume2 className="w-3.5 h-3.5 text-orange-400" />
                <span>SOUND ENGINE</span>
              </div>
              <p className="font-mono font-bold text-white text-xs sm:text-sm">HEV Suit & DSP Synth</p>
            </div>
            <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800">
              <div className="flex items-center gap-1.5 text-xs text-neutral-400 mb-1">
                <Trophy className="w-3.5 h-3.5 text-yellow-400" />
                <span>TOP SCORE</span>
              </div>
              <p className="font-mono font-bold text-white text-xs sm:text-sm">
                {top ? `${top.score.toLocaleString()} (${top.name})` : '18,500'}
              </p>
            </div>
          </div>

          {/* Historical Narrative */}
          <div className="space-y-3">
            <h3 className="font-mono font-bold text-white text-base flex items-center gap-2">
              <History className="w-4 h-4 text-orange-400" />
              <span>De Revolutie van Narratieve 3D First-Person Shooters</span>
            </h3>
            <p className="leading-relaxed">
              Uitgebracht op 19 november 1998 door Valve Software onder leiding van Gabe Newell. Half-Life was
              de allereerste first-person shooter die brak met traditionele tussenfilmpjes (cutscenes) en de speler
              100% van de tijd in de ogen van hoofdpersoon Dr. Gordon Freeman liet kijken.
            </p>
            <p className="leading-relaxed">
              De GoldSrc-engine (een zwaar gemodificeerde Quake-engine) introduceerde dynamische skeletanimaties,
              geavanceerde vijandige tactieken (HECU soldaten die dekking zoeken en granaten teruggooien) en
              ongeëvenaarde omgevingspuzzels. Het won meer dan 50 Game of the Year awards en legde het fundament
              voor Counter-Strike en Team Fortress.
            </p>
          </div>

          {/* Highlights */}
          <div className="space-y-3">
            <h3 className="font-mono font-bold text-white text-base flex items-center gap-2">
              <Award className="w-4 h-4 text-orange-400" />
              <span>Hoogtepunten van deze 1920x1280 PC Editie</span>
            </h3>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <li className="p-2.5 rounded-lg bg-neutral-900/60 border border-neutral-800 flex items-start gap-2">
                <span className="text-orange-400 font-bold">✔</span>
                <span>Volledige 1920x1280 WebGL 3D hardware acceleratie met Pointer Lock</span>
              </li>
              <li className="p-2.5 rounded-lg bg-neutral-900/60 border border-neutral-800 flex items-start gap-2">
                <span className="text-orange-400 font-bold">✔</span>
                <span>Iconische rode koevoet met metalen slagfysica & houten kisten slopen</span>
              </li>
              <li className="p-2.5 rounded-lg bg-neutral-900/60 border border-neutral-800 flex items-start gap-2">
                <span className="text-orange-400 font-bold">✔</span>
                <span>Werkende First Aid Health Stations en HEV Suit Chargers aan de muur</span>
              </li>
              <li className="p-2.5 rounded-lg bg-neutral-900/60 border border-neutral-800 flex items-start gap-2">
                <span className="text-orange-400 font-bold">✔</span>
                <span>Headcrabs, gemuteerde zombies & Vortigaunts met bio-elektrische bliksem</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer actions */}
        <div className="px-6 py-4 border-t border-neutral-800 bg-neutral-900/80 flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              halfLifeAudio.playCrowbarMetalHit();
            }}
            className="px-3.5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-orange-400 text-xs font-mono transition-colors flex items-center gap-2"
          >
            <Volume2 className="w-4 h-4" />
            <span>Test Koevoet Klank</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onClose();
              onPlay();
            }}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-orange-600 via-amber-600 to-orange-500 hover:from-orange-500 hover:to-amber-500 text-white font-mono font-bold text-sm transition-all shadow-[0_0_20px_rgba(234,88,12,0.6)] flex items-center gap-2"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>START HALF-LIFE (1920x1280)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
