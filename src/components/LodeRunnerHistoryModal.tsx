/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Lode Runner History Modal (Doug Smith / Brøderbund 1983)
 * Bilingual Historical Dossier (Dutch & English)
 */

import React, { useState } from 'react';
import { X, Play, BookOpen, Cpu, Sparkles, Award, History, Layers } from 'lucide-react';
import { Language } from '../i18n/lobbyTranslations';
import { arcadeHallAudio } from '../utils/arcadeHallAudio';

interface LodeRunnerHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlay: () => void;
}

export const LodeRunnerHistoryModal: React.FC<LodeRunnerHistoryModalProps> = ({
  isOpen,
  onClose,
  onPlay
}) => {
  const [lang, setLang] = useState<Language>(() => {
    try {
      return (localStorage.getItem('arcade_vault_lang_v2') as Language) || 'nl';
    } catch {
      return 'nl';
    }
  });

  const [activeTab, setActiveTab] = useState<'overview' | 'tech' | 'legacy'>('overview');

  if (!isOpen) return null;

  const handlePlayNow = () => {
    arcadeHallAudio.playCoin();
    onPlay();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-3xl bg-neutral-950 border-2 border-emerald-500/60 shadow-[0_0_50px_rgba(16,185,129,0.3)] text-neutral-200 p-5 sm:p-8 space-y-6">
        
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-950 border border-emerald-500/50 flex items-center justify-center text-xl shadow-lg">
              🏃
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  APPLE II CLASSIC • 1983
                </span>
                <span className="text-xs font-mono text-neutral-400">
                  Doug Smith • Brøderbund Software
                </span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-white flex items-center gap-2">
                <span>LODE RUNNER</span>
                <span className="text-xs px-2 py-0.5 rounded bg-neutral-900 border border-neutral-700 text-neutral-300 font-normal">
                  6502 Hi-Res 280×192
                </span>
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Language toggle */}
            <div className="flex rounded-lg bg-neutral-900 border border-neutral-800 p-0.5 text-xs font-mono">
              <button
                type="button"
                onClick={() => setLang('nl')}
                className={`px-2 py-1 rounded cursor-pointer ${lang === 'nl' ? 'bg-emerald-500 text-black font-bold' : 'text-neutral-400 hover:text-white'}`}
              >
                NL
              </button>
              <button
                type="button"
                onClick={() => setLang('en')}
                className={`px-2 py-1 rounded cursor-pointer ${lang === 'en' ? 'bg-emerald-500 text-black font-bold' : 'text-neutral-400 hover:text-white'}`}
              >
                EN
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 border-b border-neutral-800 pb-2">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-emerald-500 text-black shadow-md'
                : 'bg-neutral-900 text-neutral-400 hover:text-white'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>{lang === 'nl' ? 'Historie & Ontstaan' : 'History & Genesis'}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('tech')}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'tech'
                ? 'bg-emerald-500 text-black shadow-md'
                : 'bg-neutral-900 text-neutral-400 hover:text-white'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>{lang === 'nl' ? 'Apple II Architectuur' : 'Apple II Architecture'}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('legacy')}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'legacy'
                ? 'bg-emerald-500 text-black shadow-md'
                : 'bg-neutral-900 text-neutral-400 hover:text-white'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>{lang === 'nl' ? 'Invloed & Level Editor' : 'Legacy & Level Editor'}</span>
          </button>
        </div>

        {/* Tab 1: Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-4 text-xs sm:text-sm text-neutral-300 leading-relaxed font-mono">
            <p>
              {lang === 'nl'
                ? 'In 1983 schreef de Amerikaanse computerpionier Doug Smith geschiedenis met Lode Runner voor de Apple II. Terwijl hij natuurkunde studeerde aan de University of Washington, bouwde hij op een geleende Apple II+ computer in 6502 machinetaal een ongekend dynamisch puzzel-platformspel waarin de speler goudkisten verzamelt en met een gravende laserstralen gaten in bakstenen vloeren maakt.'
                : 'In 1983, American computer pioneer Doug Smith made video game history with Lode Runner for the Apple II. While studying physics at the University of Washington, he coded an astonishingly fluid puzzle-platformer in 6502 assembly on a borrowed Apple II+ computer, financed by a $10,000 loan from his brother. The player had to collect gold chests while using a digging beam to carve tactical holes in brick floors.'}
            </p>
            <p>
              {lang === 'nl'
                ? 'De legendarische uitgever Brøderbund Software (opgericht door de gebroeders Doug en Gary Carlston in Eugene, Oregon) bracht het spel uit op een enkele 5.25" floppy disk. Het spel werd een gigantische wereldwijde megahit en zette de norm voor strategische platformspellen, met latere ports naar de Commodore 64, NES, MSX en speelhalkasten.'
                : 'Legendary publisher Brøderbund Software (founded by brothers Doug and Gary Carlston in Eugene, Oregon) published the title on a single 5.25" floppy disk. The game became an international runaway hit, setting the gold standard for strategic platform action and inspiring conversions across Commodore 64, NES, MSX, and dedicated arcade cabinets.'}
            </p>

            <div className="p-4 rounded-2xl bg-neutral-900/80 border border-neutral-800 space-y-2">
              <h5 className="font-bold text-white flex items-center gap-2">
                <span>🏰</span>
                <span>{lang === 'nl' ? 'De Bungeling Trilogie' : 'The Bungeling Trilogy'}</span>
              </h5>
              <p className="text-xs text-neutral-400">
                {lang === 'nl'
                  ? 'Lode Runner speelt zich af in hetzelfde universum als twee andere monumentale klassiekers: Choplifter (Dan Gorlin) en Raid on Bungeling Bay (het debuut van SimCity-bedenker Will Wright). De monniken die je achtervolgen zijn Bungeling-wachten die de geroofde schatten bewaken!'
                  : 'Lode Runner canonically takes place in the same universe as two other monumental classics: Choplifter (Dan Gorlin) and Raid on Bungeling Bay (the breakthrough debut of SimCity creator Will Wright). The monks chasing you are Bungeling Empire guards guarding their plundered vaults!'}
              </p>
            </div>
          </div>
        )}

        {/* Tab 2: Technical Architecture */}
        {activeTab === 'tech' && (
          <div className="space-y-4 text-xs sm:text-sm text-neutral-300 leading-relaxed font-mono">
            <p>
              {lang === 'nl'
                ? 'Technisch was Lode Runner een hoogstandje op de Apple IIe (1.023 MHz MOS 6502 processor, 48 KB RAM):'
                : 'Technically, Lode Runner was a tour-de-force on the Apple IIe (1.023 MHz MOS 6502 CPU, 48 KB RAM):'}
            </p>
            <ul className="space-y-2.5 list-disc pl-5">
              <li>
                <strong>{lang === 'nl' ? 'Apple II Hi-Res Graphics (280×192)' : 'Apple II Hi-Res Graphics (280×192)'}:</strong>{' '}
                {lang === 'nl'
                  ? 'Het speelveld is opgebouwd uit een fijnmazig raster van 28 kolommen bij 16 rijen (elk blok is 10×12 pixels). De kenmerkende Apple II kleuren (Groen, Violet, Oranje, Blauw, Wit en Zwart) kwamen voort uit NTSC color artifacting.'
                  : 'The playfield is constructed from a precise grid of 28 columns by 16 rows (each tile is 10×12 pixels). The signature Apple II colors (Green, Violet, Orange, Blue, White, Black) emerged directly from NTSC color-burst artifacting.'}
              </li>
              <li>
                <strong>{lang === 'nl' ? '1-Bit Apple II Speaker Synthese' : '1-Bit Apple II Speaker Audio'}:</strong>{' '}
                {lang === 'nl'
                  ? 'De Apple II had geen geluidschip, maar alleen een 1-bits luidspreker die via geheugenadres $C030 werd in- en uitgeschakeld. Doug Smith schreef speciale timing-loops voor voetstappen, het pulserende graafgeluid en de bekende overwinningsmelodie.'
                  : 'The Apple II lacked a dedicated sound chip; it featured only a 1-bit speaker toggled via soft-switch address $C030. Doug Smith wrote tightly timed CPU loops to synthesize footsteps, laser digging pulses, and the iconic level-clear jingle.'}
              </li>
              <li>
                <strong>{lang === 'nl' ? 'Monnik-AI & Vallen Graven' : 'Monk Pathfinding & Trap Physics'}:</strong>{' '}
                {lang === 'nl'
                  ? 'Wanneer een monnik in een gegraven kuil valt, zit hij 4 seconden gevangen en laat hij eventuele buit vallen. De speler kan veilig over het hoofd van een gevangen monnik lopen! Sluit het gat terwijl de monnik erin zit, dan wordt hij verpletterd en spawnt hij opnieuw bovenaan.'
                  : 'When an enemy monk falls into a dug hole, he is trapped for ~4 seconds and drops any gold chest. The runner can safely walk across the trapped monk’s head! If the hole closes while occupied, the monk is crushed and respawns at the top of the level.'}
              </li>
            </ul>
          </div>
        )}

        {/* Tab 3: Legacy */}
        {activeTab === 'legacy' && (
          <div className="space-y-4 text-xs sm:text-sm text-neutral-300 leading-relaxed font-mono">
            <p>
              {lang === 'nl'
                ? 'Lode Runner wordt wereldwijd erkend als een van de meest invloedrijke titels uit de vroege computergeschiedenis:'
                : 'Lode Runner is globally recognized as one of the most influential titles in early computer history:'}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800">
                <div className="text-emerald-400 font-bold text-sm mb-1">
                  🛠️ {lang === 'nl' ? 'Eerste Ingebouwde Level Editor' : 'First Built-In Level Editor'}
                </div>
                <p className="text-neutral-400 text-xs">
                  {lang === 'nl'
                    ? 'Doug Smith leverde op de originele floppy disk een volwaardige level-editor mee. Spelers konden zelf levels ontwerpen, opslaan en ruilen — decennia voor games als Super Mario Maker of LittleBigPlanet!'
                    : 'Doug Smith included a full, user-accessible level editor on the original retail floppy disk. Players could build, save, and trade custom levels — decades before titles like Super Mario Maker or LittleBigPlanet!'}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800">
                <div className="text-emerald-400 font-bold text-sm mb-1">
                  🕹️ {lang === 'nl' ? '150 Originele Uitdagingen' : '150 Original Puzzles'}
                </div>
                <p className="text-neutral-400 text-xs">
                  {lang === 'nl'
                    ? 'Met 150 zorgvuldig geconstrueerde levels vereiste het spel diepgaand logisch inzicht: gaten graven in een strikte volgorde om niet zelf opgesloten te raken.'
                    : 'Packing 150 meticulously engineered levels, the game demanded genuine spatial reasoning: timing holes in sequence so as not to trap oneself in stone shafts.'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-neutral-800">
          <div className="text-xs font-mono text-neutral-400">
            {lang === 'nl'
              ? 'Besturing: Pijltjestoetsen/WASD • Z / U = Graaf Links • C / X = Graaf Rechts'
              : 'Controls: Arrow Keys/WASD • Z / U = Dig Left • C / X = Dig Right'}
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 text-xs font-mono font-bold border border-neutral-800 transition-colors cursor-pointer w-full sm:w-auto text-center"
            >
              {lang === 'nl' ? 'Sluiten' : 'Close'}
            </button>
            <button
              type="button"
              onClick={handlePlayNow}
              className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-mono font-black shadow-[0_0_25px_rgba(16,185,129,0.5)] transition-all transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer w-full sm:w-auto"
            >
              <Play className="w-4 h-4 fill-black" />
              <span>{lang === 'nl' ? 'SPEEL LODE RUNNER NU!' : 'PLAY LODE RUNNER NOW!'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
