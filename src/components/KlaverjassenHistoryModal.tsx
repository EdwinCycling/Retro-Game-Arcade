/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, BookOpen, Brain, Play, HelpCircle, Layers, Award, ShieldAlert, Sparkles, CheckCircle, Scale, Flame } from 'lucide-react';
import { Language } from '../i18n/lobbyTranslations';

interface KlaverjassenHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlayGame?: () => void;
  lang: Language;
}

export const KlaverjassenHistoryModal: React.FC<KlaverjassenHistoryModalProps> = ({
  isOpen,
  onClose,
  onPlayGame,
  lang,
}) => {
  const [activeTab, setActiveTab] = useState<'rules' | 'strategy' | 'history'>('rules');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-slate-900 border-2 border-amber-600/50 rounded-3xl p-6 sm:p-8 text-slate-100 shadow-[0_0_50px_rgba(245,158,11,0.3)] font-sans">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5 border-b border-amber-900/50 pb-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-600/20 border border-amber-500/40 flex items-center justify-center text-2xl shadow-inner">
            ♣️
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-mono font-bold">
                NEDERLANDSE KAARTTRADITIE • 4 SPELERS IN 2 TEAMS
              </span>
              <span className="text-slate-400 text-xs font-mono">
                {lang === 'nl' ? 'AMSTERDAMS & ROTTERDAMS' : 'AMSTERDAMS & ROTTERDAMS'}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-black text-amber-300 mt-0.5">
              KLAVERJASSEN
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              Complete Uitleg: Amsterdams vs Rotterdams, Kaartwaarden, Roem, Nat &amp; Pit
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 mb-6 border-b border-amber-800/40 pb-2">
          <button
            onClick={() => setActiveTab('rules')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-mono text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'rules'
                ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>{lang === 'nl' ? '🎯 Spelregels & Amsterdams vs Rotterdams' : '🎯 Rules & Variations'}</span>
          </button>

          <button
            onClick={() => setActiveTab('strategy')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-mono text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'strategy'
                ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Brain className="w-4 h-4" />
            <span>{lang === 'nl' ? '💡 Tips & Winst-Strategie' : '💡 Tips & Strategy'}</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-mono text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'history'
                ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>{lang === 'nl' ? '📖 Geschiedenis & Café-Traditie' : '📖 History & Culture'}</span>
          </button>
        </div>

        {/* TAB 1: RULES & AMSTERDAMS VS ROTTERDAMS */}
        {activeTab === 'rules' && (
          <div className="space-y-5 text-sm leading-relaxed text-slate-300">
            {lang === 'nl' ? (
              <>
                {/* Het Cruciale Verschil: Amsterdams vs Rotterdams */}
                <div className="bg-gradient-to-r from-amber-950/60 via-slate-950 to-amber-950/60 p-4 rounded-2xl border-2 border-amber-500/60 shadow-lg">
                  <h3 className="font-bold text-amber-300 text-base mb-2 flex items-center gap-2 font-mono">
                    <Scale className="w-5 h-5 text-amber-400" /> Het Cruciale Verschil: Amsterdams vs. Rotterdams
                  </h3>
                  <p className="text-xs text-slate-200 mb-3">
                    Het verschil tussen beide systemen ontstaat op het moment dat een speler de <strong>gevraagde kleur niet heeft</strong> én de eigen <strong>maat de slag al heeft</strong>:
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="bg-black/60 p-3.5 rounded-xl border border-blue-500/40">
                      <div className="font-bold text-blue-400 font-mono text-sm mb-1 flex items-center gap-1.5">
                        ❌ Amsterdams Systeem
                      </div>
                      <p className="text-slate-300">
                        <strong>Niet verplicht introeven op je maat!</strong>
                      </p>
                      <ul className="list-disc pl-4 mt-1.5 space-y-1 text-slate-300">
                        <li>Ligt de hoogste kaart bij je <strong>maat</strong>? Dan hoef je géén troef te spelen! Je mag een willekeurige andere kaart bijleggen ("troef sparen").</li>
                        <li>Ligt de hoogste kaart bij de <strong>tegenstander</strong>? Dan ben je wél verplicht in te troeven (en overtroeven).</li>
                      </ul>
                    </div>

                    <div className="bg-black/60 p-3.5 rounded-xl border border-emerald-500/40">
                      <div className="font-bold text-emerald-400 font-mono text-sm mb-1 flex items-center gap-1.5">
                        ⚡ Rotterdams Systeem
                      </div>
                      <p className="text-slate-300">
                        <strong>Altijd verplicht introeven ("op je maat")!</strong>
                      </p>
                      <ul className="list-disc pl-4 mt-1.5 space-y-1 text-slate-300">
                        <li>Als je de gevraagde kleur niet hebt, ben je <strong>ALTIJD verplicht in te troeven</strong> als je troef hebt, <em>zelfs als je eigen maat de slag al heeft</em>!</li>
                        <li>Pas als je helemáál geen troeven meer in handen hebt, mag je een andere kleur afleggen.</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Kaartwaarden Tabel */}
                <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-2">
                  <h4 className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Award className="w-4 h-4" /> Kaartwaarden &amp; Volgorde (162 Punten Totaal)
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="bg-slate-900/90 p-3 rounded-lg border border-amber-500/30">
                      <div className="font-bold text-amber-300 font-mono mb-1">IN DE TROEFKLEUR:</div>
                      <div className="grid grid-cols-4 gap-1 text-[11px] font-mono">
                        <div><strong>Boer (Jas):</strong> 20 pt</div>
                        <div><strong>9 (Nel):</strong> 14 pt</div>
                        <div><strong>Aas:</strong> 11 pt</div>
                        <div><strong>Tien (10):</strong> 10 pt</div>
                        <div><strong>Heer:</strong> 4 pt</div>
                        <div><strong>Vrouw:</strong> 3 pt</div>
                        <div><strong>8 &amp; 7:</strong> 0 pt</div>
                      </div>
                    </div>

                    <div className="bg-slate-900/90 p-3 rounded-lg border border-slate-700">
                      <div className="font-bold text-slate-300 font-mono mb-1">IN NIET-TROEFKLEUREN:</div>
                      <div className="grid grid-cols-4 gap-1 text-[11px] font-mono">
                        <div><strong>Aas:</strong> 11 pt</div>
                        <div><strong>Tien (10):</strong> 10 pt</div>
                        <div><strong>Heer:</strong> 4 pt</div>
                        <div><strong>Vrouw:</strong> 3 pt</div>
                        <div><strong>Boer:</strong> 2 pt</div>
                        <div><strong>9, 8, 7:</strong> 0 pt</div>
                      </div>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-400 italic">
                    * De winnaar van de 8e (laatste) slag krijgt bovendien <strong>10 bonuspunten</strong> ("de tien van de laatste slag"). Totaal te verdelen kaartpunten: exact <strong>162 punten</strong>!
                  </p>
                </div>

                {/* Roem, Nat en Pit */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800">
                    <div className="font-bold text-cyan-300 font-mono mb-1 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4" /> Roem (Bonuspunten in een Slag)
                    </div>
                    <ul className="list-disc pl-4 space-y-1 text-slate-300">
                      <li><strong>Driekaart (3 opeenvolgend):</strong> 20 punten (bijv. 7-8-9 of V-H-A).</li>
                      <li><strong>Vierkaart (4 opeenvolgend):</strong> 50 punten.</li>
                      <li><strong>Stuk (Heer + Vrouw van troef):</strong> 20 punten.</li>
                      <li><strong>4 Gelijken:</strong> 4 Boeren = 200 pt! 4 Azen/Tienen/Heren/Vrouwen = 100 pt.</li>
                    </ul>
                  </div>

                  <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800">
                    <div className="font-bold text-red-400 font-mono mb-1 flex items-center gap-1.5">
                      <Flame className="w-4 h-4" /> Nat Gaan &amp; Pit (Mars)
                    </div>
                    <ul className="list-disc pl-4 space-y-1 text-slate-300">
                      <li><strong>Gehaald:</strong> De partij die troef koos (de halers) moet méér dan de helft van de punten halen (minimaal 82 punten).</li>
                      <li><strong>Nat:</strong> Haalt de speelpartij niet meer dan de helft? Dan krijgen de tegenstanders <strong>álle 162 punten + alle roem</strong>! De speelpartij krijgt 0 punten.</li>
                      <li><strong>Pit (Mars):</strong> Wint één team alle 8 slagen? Dan krijgen ze <strong>100 bonuspunten</strong> extra!</li>
                    </ul>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="bg-amber-950/40 p-4 rounded-2xl border border-amber-500/30">
                  <h3 className="font-bold text-amber-300 text-base mb-1 flex items-center gap-2 font-mono">
                    <Award className="w-4 h-4" /> Klaverjassen Rules &amp; Amsterdams vs Rotterdams
                  </h3>
                  <p className="text-xs text-slate-200">
                    Klaverjassen is the premier Dutch 4-player trick-taking game played in fixed partnerships (Wij vs Zij).
                    In <strong>Amsterdams</strong>, you do not have to trump if your partner currently holds the trick.
                    In <strong>Rotterdams</strong>, you are always required to trump, even on your partner's winning trick!
                  </p>
                </div>
              </>
            )}
          </div>
        )}

        {/* TAB 2: STRATEGY */}
        {activeTab === 'strategy' && (
          <div className="space-y-4 text-xs leading-relaxed text-slate-300">
            {lang === 'nl' ? (
              <>
                <div className="bg-slate-950/80 p-4 rounded-2xl border border-amber-500/30 space-y-3">
                  <h3 className="font-bold text-amber-300 text-sm font-mono flex items-center gap-2">
                    <Brain className="w-4 h-4 text-amber-400" /> 5 Gouden Regels voor de Klaverjasmeester:
                  </h3>
                  <div className="space-y-2 text-slate-300">
                    <div className="flex items-start gap-2">
                      <span className="font-mono font-bold text-amber-300 bg-amber-500/20 px-1.5 py-0.5 rounded">1</span>
                      <div><strong>Trek eerst de troeven van de tegenstanders eruit:</strong> Als jouw team gaat spelen, kom dan vroeg uit met troef (zeker met de Boer/Jas) zodat de tegenstanders later je hoge niet-troef Azen niet kunnen aftroeven!</div>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="font-mono font-bold text-amber-300 bg-amber-500/20 px-1.5 py-0.5 rounded">2</span>
                      <div><strong>Vet slagen van je maat in:</strong> Heeft je maat de slag al binnen met een Aas of hoge troef? Gooi er dan direct punten (Tien of Aas) of roem bij!</div>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="font-mono font-bold text-amber-300 bg-amber-500/20 px-1.5 py-0.5 rounded">3</span>
                      <div><strong>Bieden met beleid:</strong> Speel pas als je minimaal 3 sterke troeven hebt (inclusief de Boer of Nel), of 4 troeven met een paar sterke bijkaarten. Onbezonnen spelen leidt direct tot een dure 'Nat'!</div>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="font-mono font-bold text-amber-300 bg-amber-500/20 px-1.5 py-0.5 rounded">4</span>
                      <div><strong>Let op de Tien:</strong> Een Tien is maar liefst 10 punten waard (bijna net zoveel als een Aas!). Pas op dat je Tien niet gevangen wordt door de Aas van de tegenstander.</div>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="font-mono font-bold text-amber-300 bg-amber-500/20 px-1.5 py-0.5 rounded">5</span>
                      <div><strong>Pas je speelstijl aan op het systeem:</strong> Speel je Rotterdams? Wees je ervan bewust dat je maat verplicht moet aftroeven, dus kom geen dure kaarten uit als je maat geen kleur heeft!</div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="bg-slate-950/80 p-4 rounded-2xl border border-amber-500/30 space-y-3">
                  <h3 className="font-bold text-amber-300 text-sm font-mono flex items-center gap-2">
                    <Brain className="w-4 h-4 text-amber-400" /> Klaverjassen Tactics:
                  </h3>
                  <p>Pull trumps early if your partnership makes the contract, feed your partner high cards when they hold the trick, and never bid without the Jack or Nine of trumps.</p>
                </div>
              </>
            )}
          </div>
        )}

        {/* TAB 3: HISTORY */}
        {activeTab === 'history' && (
          <div className="space-y-5 text-sm leading-relaxed text-slate-300 font-serif">
            {lang === 'nl' ? (
              <>
                <div>
                  <h3 className="text-base font-bold font-sans text-amber-400 flex items-center gap-2 mb-2">
                    <BookOpen className="w-4 h-4" /> De Eeuwenoude Traditie van het Klaverjassen
                  </h3>
                  <p>
                    Klaverjassen is zonder twijfel het meest gespeelde traditionele kaartspel in Nederland. Het spel stamt vermoedelijk af van het 17e-eeuwse spel <em>Belli</em> en is nauw verwant aan het Franse <em>Belote</em> en het Zwitserse <em>Jass</em>.
                  </p>
                  <p className="mt-2">
                    De naam "Klaverjassen" is een samentrekking van het kaartensymbool <strong>Klaveren</strong> en de term <strong>Jas</strong> (de koosnaam voor de oppermachtige troefboer).
                  </p>
                </div>

                <div className="bg-slate-950/70 p-4 rounded-xl border border-amber-900/50 space-y-2">
                  <h4 className="text-xs font-mono font-bold text-amber-300 uppercase tracking-wider">
                    Waarom Amsterdam vs. Rotterdam?
                  </h4>
                  <p className="text-xs text-slate-300">
                    De twee Nederlandse metropolen ontwikkelden ieder hun eigen dorps- en cafévariant. Waar Amsterdamse spelers de voorkeur gaven aan tactische vrijheid ("je hoeft je maat niet kapot te troeven"), hielden Rotterdamse havenarbeiders van onvoorwaardelijke striktheid ("altijd troeven als je kunt, geen genade!"). Tot op de dag van vandaag wordt bij elk potje eerst de vraag gesteld: <em>"Spelen we Amsterdams of Rotterdams?"</em>
                  </p>
                </div>
              </>
            ) : (
              <>
                <div>
                  <h3 className="text-base font-bold font-sans text-amber-400 flex items-center gap-2 mb-2">
                    <BookOpen className="w-4 h-4" /> Dutch Card Tradition
                  </h3>
                  <p>
                    Klaverjassen has been played in Dutch cafés since the 17th century. The divide between Amsterdam and Rotterdam rules reflects centuries of regional cultural pride.
                  </p>
                </div>
              </>
            )}
          </div>
        )}

        {/* Footer Actions */}
        <div className="mt-6 pt-4 border-t border-amber-900/50 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs transition-all cursor-pointer"
          >
            {lang === 'nl' ? 'Sluiten' : 'Close'}
          </button>
          {onPlayGame && (
            <button
              onClick={onPlayGame}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-slate-950 font-black font-mono text-xs shadow-lg shadow-amber-500/20 transition-all cursor-pointer hover:scale-105 active:scale-95"
            >
              <Play className="w-4 h-4 fill-current" />
              {lang === 'nl' ? 'SPEEL KLAVERJASSEN' : 'PLAY KLAVERJASSEN'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
