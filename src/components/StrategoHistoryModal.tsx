/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Stratego (1947/1958) Deep Historical Dossier, Rules Masterclass & Strategy Compendium
 * Celebrating Jacques Johan Mogendorff, Hausemann & Hötte (Jumbo Amsterdam), and Global Mind Sports
 */

import React, { useState } from 'react';
import { 
  X, 
  Award, 
  BookOpen, 
  Play, 
  Shield, 
  Swords, 
  Crown, 
  HelpCircle, 
  Sparkles, 
  Target, 
  Lightbulb, 
  Flame, 
  Compass,
  Layers,
  Info
} from 'lucide-react';
import { Language } from '../i18n/lobbyTranslations';

interface StrategoHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlayGame?: () => void;
  lang: Language;
}

type TabType = 'rules' | 'tactics' | 'trivia' | 'history';

export const StrategoHistoryModal: React.FC<StrategoHistoryModalProps> = ({
  isOpen,
  onClose,
  onPlayGame,
  lang
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('rules');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-slate-900 border-2 border-amber-500/60 rounded-2xl shadow-2xl text-slate-100 overflow-hidden font-sans">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 text-slate-400 hover:text-white bg-slate-800/90 hover:bg-slate-700 rounded-xl transition-colors cursor-pointer border border-slate-700"
          aria-label="Sluiten"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="px-6 pt-6 pb-4 border-b border-amber-500/30 bg-gradient-to-r from-slate-950 via-slate-900 to-amber-950/40">
          <div className="flex items-center gap-4">
            <div className="p-3.5 bg-amber-950 border border-amber-500/60 rounded-2xl text-3xl shadow-[0_0_20px_rgba(245,158,11,0.3)]">
              ⚔️
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold">
                  JUMBO • 1958 / 1947
                </span>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/40">
                  NEDERLANDS BORDSPEL MEESTERWERK
                </span>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/40">
                  MIND SPORTS OLYMPIAD
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-wide text-white mt-1">
                STRATEGO: DE COMPLETE GIDS &amp; MASTERCLASS
              </h2>
              <p className="text-xs text-amber-400 font-mono">
                {lang === 'nl'
                  ? 'Jacques Johan Mogendorff • Hausemann & Hötte • Spelregels, 7 Meester-Tactieken & Historische Feitjes'
                  : 'Jacques Johan Mogendorff • Hausemann & Hötte • Complete Rules, 7 Master Tactics & Historical Trivia'}
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 mt-5 border-t border-slate-800/80 pt-3 overflow-x-auto scrollbar-none">
            <button
              onClick={() => setActiveTab('rules')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'rules'
                  ? 'bg-amber-500 text-slate-950 shadow-[0_0_12px_rgba(245,158,11,0.4)]'
                  : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>{lang === 'nl' ? '1. Hoe Werkt Het Spel?' : '1. How to Play & Rules'}</span>
            </button>

            <button
              onClick={() => setActiveTab('tactics')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'tactics'
                  ? 'bg-amber-500 text-slate-950 shadow-[0_0_12px_rgba(245,158,11,0.4)]'
                  : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
            >
              <Lightbulb className="w-4 h-4" />
              <span>{lang === 'nl' ? '2. Tactieken & Bluf' : '2. Tactics & Bluffing'}</span>
            </button>

            <button
              onClick={() => setActiveTab('trivia')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'trivia'
                  ? 'bg-amber-500 text-slate-950 shadow-[0_0_12px_rgba(245,158,11,0.4)]'
                  : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>{lang === 'nl' ? '3. Fascinerende Feitjes' : '3. Fascinating Trivia'}</span>
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'history'
                  ? 'bg-amber-500 text-slate-950 shadow-[0_0_12px_rgba(245,158,11,0.4)]'
                  : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
            >
              <Crown className="w-4 h-4" />
              <span>{lang === 'nl' ? '4. Historisch Verhaal' : '4. Historical Origins'}</span>
            </button>
          </div>
        </div>

        {/* Tab Content Container */}
        <div className="flex-grow overflow-y-auto p-6 space-y-6 text-sm text-slate-300 leading-relaxed scrollbar-thin scrollbar-thumb-slate-700">
          
          {/* TAB 1: HOE WERKT HET SPEL */}
          {activeTab === 'rules' && (
            <div className="space-y-6 animate-fade-in">
              {/* Doel & Basisregels */}
              <div className="bg-slate-950/80 border border-amber-500/30 rounded-2xl p-4.5 space-y-3">
                <h3 className="text-base font-bold text-amber-300 flex items-center gap-2">
                  <Target className="w-5 h-5 text-amber-400" />
                  <span>{lang === 'nl' ? 'Het Hoofddoel & De Basisregels' : 'The Core Objective & Board Rules'}</span>
                </h3>
                <p>
                  {lang === 'nl' ? (
                    <>
                      Stratego wordt gespeeld op een <strong>10×10 raster (100 velden)</strong> met in het midden twee onbegaanbare <strong>Meren</strong> van elk 2×2 vakken. Elk leger telt exact <strong>40 pionnen</strong> die geheim worden opgesteld met de rug naar de vijand (<em>Fog of War</em>).
                    </>
                  ) : (
                    <>
                      Stratego is played on a <strong>10×10 grid (100 squares)</strong> with two impassable 2×2 <strong>Lakes</strong> in the center. Each army deploys exactly <strong>40 pieces</strong> facing secretly away from the opponent (<em>Fog of War</em>).
                    </>
                  )}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 text-xs font-mono">
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-emerald-400 font-bold block mb-1">🎯 Hoe Win Je?</span>
                    <span>1. Verover de vijandelijke <strong>Vlag (🚩)</strong> met een willekeurige beweegbare pion.</span><br />
                    <span>2. Of schakel alle beweegbare pionnen van de vijand uit zodat hij niet meer kan zetten.</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-cyan-400 font-bold block mb-1">👣 Verplaatsen &amp; Slagveld</span>
                    <span>• Om de beurt verplaats je <strong>1 pion</strong> exact 1 vak horizontaal of verticaal (geen diagonalen).</span><br />
                    <span>• Bommen (💣) en de Vlag (🚩) mogen <strong>nooit</strong> bewegen.</span>
                  </div>
                </div>
              </div>

              {/* Rangen Hiërarchie Tabel */}
              <div>
                <h3 className="text-base font-bold text-white mb-3 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-amber-400" />
                  <span>{lang === 'nl' ? 'De Volledige Rangenlijst & Speciale Krachten (40 Pionnen)' : 'Complete Rank Hierarchy & Special Powers (40 Pieces)'}</span>
                </h3>

                <div className="overflow-x-auto rounded-xl border border-slate-800">
                  <table className="w-full text-left text-xs font-mono border-collapse">
                    <thead>
                      <tr className="bg-slate-950 text-amber-400 border-b border-slate-800">
                        <th className="p-2.5">Rang</th>
                        <th className="p-2.5">Titel / Stuk</th>
                        <th className="p-2.5">Aantal</th>
                        <th className="p-2.5">Kracht / Eigenschappen in Duel</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 bg-slate-900/60">
                      <tr className="hover:bg-amber-500/10 transition-colors">
                        <td className="p-2.5 font-bold text-yellow-400">10</td>
                        <td className="p-2.5 font-bold text-white">⭐ Maarschalk</td>
                        <td className="p-2.5">1×</td>
                        <td className="p-2.5 text-slate-300">Hoogste militaire rang. Wint van rang 1 t/m 9. Verliest ALLEEN van de Spion als die hem aanvalt, of van een Bom.</td>
                      </tr>
                      <tr className="hover:bg-amber-500/10 transition-colors">
                        <td className="p-2.5 font-bold text-amber-400">9</td>
                        <td className="p-2.5 font-bold text-white">🎖️ Generaal</td>
                        <td className="p-2.5">1×</td>
                        <td className="p-2.5 text-slate-300">Tweede bevelhebber. Wint van rang 1 t/m 8. Cruciaal om de vijandelijke Maarschalk op te sporen.</td>
                      </tr>
                      <tr className="hover:bg-amber-500/10 transition-colors">
                        <td className="p-2.5 font-bold text-amber-300">8</td>
                        <td className="p-2.5 font-bold text-white">🦅 Kolonel</td>
                        <td className="p-2.5">2×</td>
                        <td className="p-2.5 text-slate-300">Zware slagkracht. Wint van rang 1 t/m 7.</td>
                      </tr>
                      <tr className="hover:bg-amber-500/10 transition-colors">
                        <td className="p-2.5 font-bold text-slate-300">7</td>
                        <td className="p-2.5 font-bold text-white">⚜️ Majoor</td>
                        <td className="p-2.5">3×</td>
                        <td className="p-2.5 text-slate-300">Ideaal om vijandelijke verdedigingslinies onder druk te zetten.</td>
                      </tr>
                      <tr className="hover:bg-amber-500/10 transition-colors">
                        <td className="p-2.5 font-bold text-slate-400">6</td>
                        <td className="p-2.5 font-bold text-white">⚔️ Kapitein</td>
                        <td className="p-2.5">4×</td>
                        <td className="p-2.5 text-slate-300">Veelzijdige frontlinie-officier.</td>
                      </tr>
                      <tr className="hover:bg-amber-500/10 transition-colors">
                        <td className="p-2.5 font-bold text-slate-400">5</td>
                        <td className="p-2.5 font-bold text-white">🛡️ Luitenant</td>
                        <td className="p-2.5">4×</td>
                        <td className="p-2.5 text-slate-300">Schakelt sergeanten, mineurs en verkenners uit.</td>
                      </tr>
                      <tr className="hover:bg-amber-500/10 transition-colors">
                        <td className="p-2.5 font-bold text-slate-500">4</td>
                        <td className="p-2.5 font-bold text-white">🪖 Sergeant</td>
                        <td className="p-2.5">4×</td>
                        <td className="p-2.5 text-slate-300">Basis infanterie voor het testen van vijandige pionnen.</td>
                      </tr>
                      <tr className="bg-yellow-950/20 hover:bg-yellow-500/10 transition-colors">
                        <td className="p-2.5 font-bold text-yellow-300">3</td>
                        <td className="p-2.5 font-bold text-yellow-300">⛏️ Mineur</td>
                        <td className="p-2.5 font-bold">5×</td>
                        <td className="p-2.5 text-yellow-100">
                          <strong>SPECIALE KRACHT:</strong> De enige pion die een <strong>Bom (💣)</strong> kan ontmantelen en van het bord verwijdert! Onmisbaar in het eindspel.
                        </td>
                      </tr>
                      <tr className="bg-cyan-950/20 hover:bg-cyan-500/10 transition-colors">
                        <td className="p-2.5 font-bold text-cyan-400">2</td>
                        <td className="p-2.5 font-bold text-cyan-300">🐎 Verkenner</td>
                        <td className="p-2.5 font-bold">8×</td>
                        <td className="p-2.5 text-cyan-100">
                          <strong>SPECIALE KRACHT:</strong> Mag in één beurt zover sprinten als hij wil in een rechte lijn over lege velden.
                        </td>
                      </tr>
                      <tr className="bg-rose-950/20 hover:bg-rose-500/10 transition-colors">
                        <td className="p-2.5 font-bold text-rose-400">1</td>
                        <td className="p-2.5 font-bold text-rose-300">🗡️ Spion</td>
                        <td className="p-2.5 font-bold">1×</td>
                        <td className="p-2.5 text-rose-100">
                          <strong>SPECIALE KRACHT:</strong> Zwakste stuk in verdediging, maar als de Spion <em>zélf</em> de <strong>Maarschalk (10)</strong> aanvalt, sneuvelt de Maarschalk direct!
                        </td>
                      </tr>
                      <tr className="bg-orange-950/20">
                        <td className="p-2.5 font-bold text-orange-400">—</td>
                        <td className="p-2.5 font-bold text-orange-300">💣 Bom</td>
                        <td className="p-2.5">6×</td>
                        <td className="p-2.5 text-orange-100">Staat stil. Iedere aanvaller ontploft en verdwijnt, behalve de Mineur (3).</td>
                      </tr>
                      <tr className="bg-red-950/30 font-bold">
                        <td className="p-2.5 text-red-400">—</td>
                        <td className="p-2.5 text-red-300">🚩 Vlag</td>
                        <td className="p-2.5">1×</td>
                        <td className="p-2.5 text-red-100">Staat stil. Verliest van élke aanvaller. Verlies van de vlag betekent direct game over!</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Aanvalsregels & Patstelling */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                  <h4 className="font-bold text-amber-300 flex items-center gap-1.5">
                    <Swords className="w-4 h-4 text-amber-400" />
                    <span>Confrontatie &amp; Gelijke Rang</span>
                  </h4>
                  <p>
                    Als twee pionnen met <strong>dezelfde rang</strong> tegen elkaar strijden (bijv. Kapitein 6 tegen Kapitein 6), worden <strong>beide pionnen</strong> van het bord geslagen en geëlimineerd!
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                  <h4 className="font-bold text-cyan-300 flex items-center gap-1.5">
                    <Compass className="w-4 h-4 text-cyan-400" />
                    <span>De Twee-Vakken Regel (Anti-Patstelling)</span>
                  </h4>
                  <p>
                    Een pion mag niet meer dan 5 beurten achter elkaar tussen dezelfde twee vakken heen en weer pendelen. Dit voorkomt dat spelers een oneindige achtervolging inzetten.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: TACTIEKEN & BLUF */}
          {activeTab === 'tactics' && (
            <div className="space-y-6 animate-fade-in">
              <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/40 via-slate-950 to-slate-900 border border-amber-500/30">
                <h3 className="text-base font-bold text-amber-300 mb-2 flex items-center gap-2">
                  <Crown className="w-5 h-5 text-amber-400" />
                  <span>{lang === 'nl' ? '7 Gouden Grootmeester-Tactieken' : '7 Golden Grandmaster Tactics'}</span>
                </h3>
                <p className="text-xs text-slate-300">
                  {lang === 'nl'
                    ? 'Stratego is 50% informatievergaring, 30% psychologie en bluf, en 20% rekenwerk. Met deze professionele vuistregels domineer je elk slagveld.'
                    : 'Stratego is 50% information gathering, 30% psychology and bluffing, and 20% calculation. Use these tournament rules to control the battlefield.'}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs leading-relaxed">
                {/* Tactiek 1 */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                    <span className="w-6 h-6 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-xs">1</span>
                    <span>De Spion-Generaal Connectie (De Valstrik)</span>
                  </div>
                  <p>
                    Houd je <strong>Spion (1)</strong> altijd binnen 1 of 2 stappen achter je <strong>Generaal (9)</strong>. Wanneer de vijandelijke Maarschalk (10) jouw Generaal trots aanvalt en onthult, staat jouw Spion in de volgende beurt direct klaar om de Maarschalk te spietsen!
                  </p>
                </div>

                {/* Tactiek 2 */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                    <span className="w-6 h-6 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-xs">2</span>
                    <span>Spaar Minstens 2 Mineurs voor het Eindspel</span>
                  </div>
                  <p>
                    Een veelgemaakte beginnersfout is om alle 5 de <strong>Mineurs (3)</strong> vroeg in de strijd te verliezen. Als de vijandige vlag achter 3 bommen in de hoek ligt, is winnen zonder Mineurs wiskundig <strong>onmogelijk</strong>. Houd minstens twee Mineurs veilig in de reserve!
                  </p>
                </div>

                {/* Tactiek 3 */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                    <span className="w-6 h-6 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-xs">3</span>
                    <span>De Bommenburcht vs. De Lokvlag (Bluffen)</span>
                  </div>
                  <p>
                    • <strong>De Hoekburcht:</strong> Vlag in veld A1/J1 omringd door 3 bommen. IJzersterk, maar voorspelbaar voor mineurs.<br />
                    • <strong>De Lokvlag:</strong> Plaats een bommen-driehoek in de linkerhoek met een <em>lege sergeant</em> erin, terwijl je echte vlag onopvallend in het centrum achter een Majoor staat!
                  </p>
                </div>

                {/* Tactiek 4 */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                    <span className="w-6 h-6 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-xs">4</span>
                    <span>Verkenners als Sonar &amp; Drukpunten</span>
                  </div>
                  <p>
                    Sprint met een <strong>Verkenner (2)</strong> over het bord en parkeer hem pal voor een onbekende vijandelijke toren. Als de tegenstander die pion in de volgende beurt <em>niet</em> verplaatst, is het bijna gegarandeerd een <strong>Bom</strong> of de <strong>Vlag</strong>!
                  </p>
                </div>

                {/* Tactiek 5 */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                    <span className="w-6 h-6 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-xs">5</span>
                    <span>De Valse Maarschalk Bluf</span>
                  </div>
                  <p>
                    Beweeg een <strong>Majoor (7)</strong> of <strong>Kapitein (6)</strong> met zelfvertrouwen en agressie naar voren alsof het je Maarschalk is. De tegenstander zal zijn hoge officieren angstig terugtrekken of zijn Spion overhaast in stelling brengen!
                  </p>
                </div>

                {/* Tactiek 6 */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                    <span className="w-6 h-6 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-xs">6</span>
                    <span>Beheers de Drie Meren-Doorgangen (Bottlenecks)</span>
                  </div>
                  <p>
                    De twee meren verdelen het slagveld in <strong>3 smalle corridors</strong> (links 2 velden breed, midden 2 velden, rechts 2 velden). Bezet minstens twee van de drie doorgangen met sergeanten of luitenants om vijandige infiltratie vroegtijdig te blokkeren.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: FASCINERENDE FEITJES */}
          {activeTab === 'trivia' && (
            <div className="space-y-5 animate-fade-in text-xs">
              <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/30">
                <h3 className="text-base font-bold text-amber-300 mb-1 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                  <span>{lang === 'nl' ? 'Wist Je Dat? 8 Historische & Wiskundige Feitjes' : 'Did You Know? 8 Historical & Mathematical Facts'}</span>
                </h3>
                <p className="text-slate-300">
                  Opmerkelijke verhalen en records uit 75 jaar Stratego-geschiedenis.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                  <span className="text-amber-400 font-bold block text-sm">🔢 1. Meer Opstellingen dan Sterren</span>
                  <p className="text-slate-300">
                    Met 40 pionnen per zijde zijn er exact <strong>40! / (6! × 8! × 5! × 4! × 4! × 4! × 3! × 2!) ≈ 1,15 × 10²³</strong> verschillende geldige beginopstellingen mogelijk. Dat zijn er meer dan het aantal zandkorrels op alle stranden van de aarde!
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                  <span className="text-cyan-400 font-bold block text-sm">🇳🇱 2. De 10.000 Gulden Deal van Jumbo</span>
                  <p className="text-slate-300">
                    In 1958 kocht het Amsterdamse familiebedrijf <strong>Hausemann &amp; Hötte (Jumbo)</strong> de exclusieve rechten van bedenker Jacques Mogendorff voor 10.000 Nederlandse gulden. Het bleek de meest winstgevende licentie in de Nederlandse speelgoedhistorie te zijn!
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                  <span className="text-yellow-400 font-bold block text-sm">🔄 3. De Rangen-Oorlog (10 vs 1)</span>
                  <p className="text-slate-300">
                    In Europa gaf Jumbo de Maarschalk nummer <strong>10</strong> (hoogste getal wint). In de Amerikaanse Milton Bradley-versie was het jarenlang omgekeerd: <strong>1</strong> was de Maarschalk! Pas rond het jaar 2000 werd de nummering wereldwijd gelijkgetrokken naar de Europese standaard (10 = Maarschalk).
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                  <span className="text-rose-400 font-bold block text-sm">🏆 4. Nederlandse Wereldkampioenen</span>
                  <p className="text-slate-300">
                    Sinds 1997 wordt op de <em>Mind Sports Olympiad</em> in Londen gestreden om de wereldtitel Stratego. Nederlandse grootmeesters zoals <strong>Erik van den Berg</strong>, <strong>Vincent de Boer</strong> en <strong>Pim Niemeijer</strong> hebben het toernooi decennialang gedomineerd.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                  <span className="text-emerald-400 font-bold block text-sm">🪵 5. Houten Torentjes &amp; Goudfolie</span>
                  <p className="text-slate-300">
                    De allereerste edities uit de jaren '50 werden geleverd met massief houten torentjes in dieprood en kobaltblauw met ingelegde goudopdruk. Pas in de jaren '60 stapte Jumbo over op de herkenbare kunststof torentjes met reliëf.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                  <span className="text-purple-400 font-bold block text-sm">🇫🇷 6. De Franse Stammoeder "L'Attaque"</span>
                  <p className="text-slate-300">
                    Het spelprincipe van verborgen militaire rangen gaat terug naar 1909, toen de Franse onderwijzeres <strong>Hermance Edan</strong> het spel <em>L'Attaque</em> patenteerde in Parijs. Mogendorff verfijnde dit met het 10×10 bord, de centrale meren en de 40-pionnen balans.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: HISTORISCH VERHAAL */}
          {activeTab === 'history' && (
            <div className="space-y-4 text-xs leading-relaxed animate-fade-in">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <h4 className="text-sm font-bold text-amber-300 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-amber-400" />
                  <span>Jacques Johan Mogendorff (1898 – 1961)</span>
                </h4>
                <p>
                  <strong>Jacques Johan Mogendorff</strong> was een Nederlandse schrijver, handelsagent en journalist van Joodse afkomst uit Groenlo. Tijdens de Tweede Wereldoorlog werd hij met zijn gezin gedeporteerd naar Kamp Westerbork en later naar Bergen-Belsen. Zij overleefden wonderwel de oorlog.
                </p>
                <p>
                  Direct na de bevrijding in <strong>1947</strong> registreerde Mogendorff zijn levenswerk: het spel <em>Stratego</em> bij het Bureau voor Industriële Eigendom in Den Haag. Hij liet de eerste prototypes produceren door het Nederlandse houtbewerkingsbedrijf Smeets en Schippers.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <h4 className="text-sm font-bold text-cyan-300 flex items-center gap-2">
                  <Crown className="w-4 h-4 text-cyan-400" />
                  <span>De Triomf van Hausemann &amp; Hötte (Jumbo Amsterdam)</span>
                </h4>
                <p>
                  In 1958 sloot de legendarische speelgoedfabriek <strong>Hausemann &amp; Hötte (Jumbo)</strong> uit Amsterdam een overeenkomst om Stratego grootschalig uit te brengen. Met een iconische rode doos, het gele Jumbo-olifantje en de meesterlijke artwork werd het spel binnen enkele maanden de bestverkochte titel van Nederland.
                </p>
                <p>
                  Vanaf 1961 veroverde Stratego onder licentie van Milton Bradley de Verenigde Staten en Azië. Vandaag de dag is Stratego, naast Schaken en Dammen, een van de weinige bordspellen die wereldwijd als officiële denksport wordt erkend!
                </p>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/90 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs font-mono text-slate-400">
            {lang === 'nl' ? '1947/1958 Jumbo • Amsterdam, Nederland • 40 Pionnen' : '1947/1958 Jumbo • Amsterdam, Netherlands • 40 Pieces'}
          </div>
          <div className="flex items-center gap-2.5">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs transition-colors cursor-pointer border border-slate-700"
            >
              {lang === 'nl' ? 'Sluiten' : 'Close'}
            </button>
            {onPlayGame && (
              <button
                onClick={() => {
                  onClose();
                  onPlayGame();
                }}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-mono font-bold text-xs shadow-[0_0_15px_#f59e0b] transition-colors cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{lang === 'nl' ? '⚔️ SPEEL STRATEGO' : '⚔️ PLAY STRATEGO'}</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
