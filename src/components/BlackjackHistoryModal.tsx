/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, BookOpen, Brain, Play, HelpCircle, Layers, Award, ShieldAlert, Sparkles, CheckCircle, Flame, DollarSign } from 'lucide-react';
import { Language } from '../i18n/lobbyTranslations';

interface BlackjackHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlayGame?: () => void;
  lang?: Language;
}

export const BlackjackHistoryModal: React.FC<BlackjackHistoryModalProps> = ({
  isOpen,
  onClose,
  onPlayGame,
  lang = 'nl'
}) => {
  const [activeTab, setActiveTab] = useState<'rules' | 'strategy' | 'history'>('rules');

  if (!isOpen) return null;

  const isNl = lang === 'nl';

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-4xl rounded-3xl bg-slate-950 border-2 border-emerald-500/80 shadow-[0_0_50px_rgba(16,185,129,0.3)] overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="relative p-5 sm:p-6 bg-gradient-to-r from-emerald-950/90 via-slate-900 to-slate-950 border-b border-emerald-800/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600/25 border border-emerald-400 flex items-center justify-center text-emerald-300 shadow-inner text-2xl font-black">
              21
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-mono text-lg sm:text-xl font-black text-white tracking-wide">
                  {isNl ? 'Blackjack / 21 Dossier' : 'Blackjack / 21 Dossier'}
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-700">
                  VEGAS STRIP & CASINO CLASSIC
                </span>
              </div>
              <p className="text-xs font-mono text-slate-400 mt-0.5">
                {isNl
                  ? 'Spelregels, wiskundige basisstrategie, kaarten splitsen, verdubbelen & historie'
                  : 'Rules, mathematical basic strategy, splitting, doubling & casino history'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 flex items-center justify-center transition-colors cursor-pointer active:scale-95"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-900/60 px-4 pt-2 gap-2 text-xs font-mono font-bold overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('rules')}
            className={`px-4 py-2.5 rounded-t-xl border-t border-x transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'rules'
                ? 'bg-slate-950 border-emerald-500 text-emerald-300 shadow-sm'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <HelpCircle className="w-4 h-4 text-emerald-400" />
            <span>{isNl ? '🎯 Spelregels & Hoe het werkt' : '🎯 Rules & How to Play'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('strategy')}
            className={`px-4 py-2.5 rounded-t-xl border-t border-x transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'strategy'
                ? 'bg-slate-950 border-amber-500 text-amber-300 shadow-sm'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Brain className="w-4 h-4 text-amber-400" />
            <span>{isNl ? '💡 Wiskundige Basisstrategie' : '💡 Basic Strategy & Math'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2.5 rounded-t-xl border-t border-x transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'history'
                ? 'bg-slate-950 border-cyan-500 text-cyan-300 shadow-sm'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-4 h-4 text-cyan-400" />
            <span>{isNl ? '📖 Geschiedenis & Oorsprong' : '📖 Origins & History'}</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 text-slate-300 text-xs sm:text-sm font-sans leading-relaxed">
          {/* TAB 1: RULES & HOW TO PLAY */}
          {activeTab === 'rules' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* Mission Box */}
              <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-700/60 space-y-2">
                <div className="font-mono font-bold text-emerald-300 text-sm flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span>{isNl ? 'Het Doel van Blackjack' : 'The Objective of Blackjack'}</span>
                </div>
                <p className="text-slate-200 leading-relaxed">
                  {isNl
                    ? 'Het doel van Blackjack is heel eenvoudig: versla de bank (de dealer) door een handwaarde te krijgen die dichter bij de 21 punten ligt dan die van de bank, zónder de 21 te overschrijden. Kom je boven de 21 punten, dan ben je direct Kapot (Bust) en verlies je je inzet.'
                    : 'The objective of Blackjack is simple: beat the dealer by achieving a hand total closer to 21 than the dealer, without going over 21. If your total exceeds 21, you Bust and forfeit your wager.'}
                </p>
              </div>

              {/* Card Values */}
              <div className="space-y-3">
                <h4 className="font-mono text-sm font-bold text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-emerald-400" />
                  <span>{isNl ? '1. De Waarde van de Kaarten' : '1. Card Values'}</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                    <span className="text-emerald-400 font-bold">2 t/m 10</span>
                    <p className="text-slate-300 font-sans">
                      {isNl ? 'Hun nominale cijferwaarde (een 7 is 7 punten).' : 'Face value (a 7 is worth 7 points).'}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                    <span className="text-amber-400 font-bold">Boer, Vrouw, Heer (J, Q, K)</span>
                    <p className="text-slate-300 font-sans">
                      {isNl ? 'Tellen allemaal voor precies 10 punten.' : 'All picture cards count as 10 points.'}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                    <span className="text-cyan-400 font-bold">Aas (A) - Flexibel!</span>
                    <p className="text-slate-300 font-sans">
                      {isNl
                        ? 'Telt als 1 óf 11 punten. Het spel kiest automatisch de beste waarde voor jou!'
                        : 'Counts as 1 or 11 points, whichever benefits the hand most.'}
                    </p>
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800/80 text-xs">
                  <strong className="text-amber-300 font-mono">Wat is een "Soft Hand"? </strong>
                  <span>
                    {isNl
                      ? 'Een hand met een Aas die als 11 kan tellen zonder kapot te gaan (zoals A + 7 = Soft 18). Je kunt hier veilig een extra kaart vragen: als je een 10 krijgt, telt de Aas gewoon als 1 en heb je 18!'
                      : 'A hand where an Ace can count as 11 without busting (e.g. A + 7 = Soft 18). You can hit without fear of busting.'}
                  </span>
                </div>
              </div>

              {/* Player Decisions */}
              <div className="space-y-3">
                <h4 className="font-mono text-sm font-bold text-white flex items-center gap-2">
                  <Flame className="w-4 h-4 text-emerald-400" />
                  <span>{isNl ? '2. Jouw Keuzes Tijdens de Ronde' : '2. Player Actions'}</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                    <strong className="text-emerald-400 font-mono flex items-center gap-1.5">
                      <span>🟢 Kaart Vragen (Hit)</span>
                    </strong>
                    <p className="text-xs text-slate-300">
                      {isNl
                        ? 'Vraag een extra kaart van de stapel om je totaal te verhogen. Je mag blijven hitten tot je tevreden bent of kapot gaat.'
                        : 'Draw another card to increase your total. Continue until satisfied or you bust.'}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                    <strong className="text-red-400 font-mono flex items-center gap-1.5">
                      <span>🛑 Passen (Stand)</span>
                    </strong>
                    <p className="text-xs text-slate-300">
                      {isNl
                        ? 'Je neemt geen kaarten meer. Je huidige puntentotaal blijft staan en de beurt gaat naar de bank.'
                        : 'Take no more cards. Lock in your current score and end your turn.'}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                    <strong className="text-amber-400 font-mono flex items-center gap-1.5">
                      <span>⚡ Verdubbelen (Double Down)</span>
                    </strong>
                    <p className="text-xs text-slate-300">
                      {isNl
                        ? 'Verdubbel je inzet bij je eerste twee kaarten! Je krijgt precies 1 extra kaart en past daarna automatisch. Ideaal bij een starttotaal van 10 of 11.'
                        : 'Double your original wager. You receive exactly one more card and automatically stand.'}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                    <strong className="text-purple-400 font-mono flex items-center gap-1.5">
                      <span>✂️ Splitsen (Split)</span>
                    </strong>
                    <p className="text-xs text-slate-300">
                      {isNl
                        ? 'Heb je twee kaarten van gelijke waarde (zoals 8-8 of K-10)? Splits ze in twee afzonderlijke handen met elk een gelijke inzet!'
                        : 'If dealt a pair of equal value, split into two separate hands with an equal matching bet.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Payouts & Dealer Rules */}
              <div className="space-y-3">
                <h4 className="font-mono text-sm font-bold text-white flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                  <span>{isNl ? '3. Uitbetalingen & Regels voor de Bank' : '3. Payouts & Dealer Rules'}</span>
                </h4>
                <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2 text-xs">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                    <span className="text-emerald-400 font-bold font-mono">Blackjack (Natuurlijke 21)</span>
                    <span className="text-white font-bold font-mono bg-emerald-950 px-2 py-0.5 rounded border border-emerald-700">Betaalt 3:2 (+150%)</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                    <span className="text-slate-200 font-mono">Reguliere Winst</span>
                    <span className="text-slate-300 font-mono">Betaalt 1:1 (+100%)</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                    <span className="text-cyan-300 font-mono">Gelijkspel (Push)</span>
                    <span className="text-slate-300 font-mono">Inzet terug (0%)</span>
                  </div>
                  <p className="text-slate-400 pt-1 font-mono text-[11px]">
                    {isNl
                      ? '🏛️ Regels voor de Bank: De bank heeft geen vrije keuze. De bank MOET kaarten trekken tot ten minste 17 punten, en MOET passen op 17 of hoger.'
                      : '🏛️ Dealer Rules: The dealer has no free will. The dealer MUST draw until reaching at least 17, and MUST stand on 17 or higher.'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: BASIC STRATEGY */}
          {activeTab === 'strategy' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-800/60 space-y-2">
                <div className="font-mono font-bold text-amber-300 text-sm flex items-center gap-2">
                  <Brain className="w-4 h-4 text-amber-400" />
                  <span>{isNl ? 'Wat is de Basisstrategie?' : 'What is Basic Strategy?'}</span>
                </div>
                <p className="text-slate-200 text-xs leading-relaxed">
                  {isNl
                    ? 'Blackjack is geen puur kansspel. Met computermodellen is berekend welke beslissing wiskundig de hoogste winstkans biedt bij elke mogelijke combinatie van jouw kaarten tegenover de open kaart van de bank. Volg je deze tabel, dan verlaag je het casino-voordeel naar minder dan 0,5%!'
                    : 'Blackjack is a game of mathematical probabilities. Computer simulations have proven the optimal action for every possible hand combination against the dealer upcard, reducing house edge below 0.5%.'}
                </p>
              </div>

              {/* Core Strategy Rules */}
              <div className="space-y-3">
                <h4 className="font-mono text-sm font-bold text-white flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-400" />
                  <span>{isNl ? 'De 5 Gouden Regels van de Wiskunde' : 'The 5 Golden Rules of Blackjack'}</span>
                </h4>
                <div className="space-y-2.5 text-xs">
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-start gap-2.5">
                    <span className="font-mono font-black text-amber-400 text-sm">1.</span>
                    <div>
                      <strong className="text-white font-mono">{isNl ? 'Splits ALTIJD Azen en Achten (A-A & 8-8)' : 'ALWAYS Split Aces and Eights'}</strong>
                      <p className="text-slate-300 mt-0.5">
                        {isNl
                          ? 'Twee Azen samen is een zwakke 12; gesplitst heb je twee kansen op 21. Twee Achten is een rampzalige 16; gesplitst begin je met twee sterke handen van 8.'
                          : 'Two Aces together equal a weak 12; split, they form two starting 11s. Two 8s make 16 (the worst total); split, you start with two 8s.'}
                      </p>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-start gap-2.5">
                    <span className="font-mono font-black text-amber-400 text-sm">2.</span>
                    <div>
                      <strong className="text-white font-mono">{isNl ? 'Splits NOOIT Tienen (10-10, J-J, Q-Q, K-K)' : 'NEVER Split Tens'}</strong>
                      <p className="text-slate-300 mt-0.5">
                        {isNl
                          ? 'Een 20 is een fantastische hand die in meer dan 88% van de rondes wint. Gooi die zekere winst nooit weg door te splitsen!'
                          : 'A 20 is a dominant hand that wins over 88% of the time. Never break up a winning 20.'}
                      </p>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-start gap-2.5">
                    <span className="font-mono font-black text-amber-400 text-sm">3.</span>
                    <div>
                      <strong className="text-white font-mono">{isNl ? 'Verdubbel met 11 en 10 tegen lage bankkaarten' : 'Double on 11 and 10 against weak upcards'}</strong>
                      <p className="text-slate-300 mt-0.5">
                        {isNl
                          ? 'Heb je 11? Verdubbel altijd (behalve tegen een Aas van de bank). Heb je 10? Verdubbel tegen een 2 t/m 9 van de bank.'
                          : 'Double 11 against any dealer card 2-10. Double 10 against dealer 2-9.'}
                      </p>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-start gap-2.5">
                    <span className="font-mono font-black text-amber-400 text-sm">4.</span>
                    <div>
                      <strong className="text-white font-mono">{isNl ? 'Pas op 12 t/m 16 als de bank een 4, 5 of 6 toont' : 'Stand on 12-16 when dealer shows 4, 5, or 6'}</strong>
                      <p className="text-slate-300 mt-0.5">
                        {isNl
                          ? 'Een 4, 5 of 6 is een "breekkaart" voor de bank: de bank gaat in meer dan 42% van de gevallen kapot. Vraag zelf geen kaart en laat de bank kapotgaan!'
                          : '4, 5, and 6 are dealer bust cards (~42% bust rate). Do not risk busting your own hand.'}
                      </p>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-start gap-2.5">
                    <span className="font-mono font-black text-amber-400 text-sm">5.</span>
                    <div>
                      <strong className="text-white font-mono">{isNl ? 'Neem NOOIT Verzekering (Insurance)' : 'NEVER take Insurance'}</strong>
                      <p className="text-slate-300 mt-0.5">
                        {isNl
                          ? 'Verzekering lijkt aantrekkelijk als de bank een Aas heeft, maar wiskundig heeft de bank slechts ~30% kans op een 10-kaart. Het huisvoordeel op verzekering is meer dan 7,4%!'
                          : 'Insurance carries a massive ~7.4% house edge. Statistically, it is a sucker bet over time.'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ORIGINS & HISTORY */}
          {activeTab === 'history' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="p-4 rounded-2xl bg-cyan-950/30 border border-cyan-800/60 space-y-2">
                <div className="font-mono font-bold text-cyan-300 text-sm flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-cyan-400" />
                  <span>{isNl ? 'Van Cervantes tot Las Vegas' : 'From Cervantes to Las Vegas'}</span>
                </div>
                <p className="text-slate-200 text-xs leading-relaxed">
                  {isNl
                    ? 'Blackjack is een van de oudste gedocumenteerde kaartspellen ter wereld. Al in 1601 schreef de Spaanse auteur Miguel de Cervantes (de schrijver van Don Quichot) over twee kaartvalsspelers in Sevilla die bedreven waren in "Veintiuna" (Eenentwintigen).'
                    : 'Blackjack is one of the oldest documented card games in history. In 1601, Spanish author Miguel de Cervantes (author of Don Quixote) described swindlers in Seville skilled at "Veintiuna" (Twenty-One).'}
                </p>
              </div>

              {/* Timeline Items */}
              <div className="space-y-4">
                <div className="border-l-2 border-cyan-500/40 pl-4 space-y-1">
                  <span className="text-cyan-400 font-mono font-bold text-xs">ca. 1700 • Frans Vingt-Un</span>
                  <p className="text-xs text-slate-300">
                    {isNl
                      ? 'In de salons van koning Lodewijk XV werd Vingt-et-Un razend populair. De basisregels rondom 21 punten en het trekken van kaarten werden hier voor het eerst vastgelegd.'
                      : 'Popular in the royal French courts of Louis XV as Vingt-et-Un, establishing core 21 rules.'}
                  </p>
                </div>

                <div className="border-l-2 border-emerald-500/40 pl-4 space-y-1">
                  <span className="text-emerald-400 font-mono font-bold text-xs">1931 • Waar komt de naam "Blackjack" vandaan?</span>
                  <p className="text-xs text-slate-300">
                    {isNl
                      ? 'Toen de staat Nevada gokken legaliseerde in 1931, moesten casino\'s spelers verleiden. Ze boden een speciale 10:1 bonus uitbetaling als je een Schoppenaas én een zwarte Boer (Black Jack: Schoppenboer of Klaverenboer) trof! De bonus verdween later, maar de naam Blackjack bleef voorgoed hangen.'
                      : 'When Nevada legalized gambling in 1931, casinos introduced a 10:1 bonus payout for hands with an Ace of Spades and a black Jack (Spades or Clubs). The bonus was removed, but the name Blackjack endured.'}
                  </p>
                </div>

                <div className="border-l-2 border-amber-500/40 pl-4 space-y-1">
                  <span className="text-amber-400 font-mono font-bold text-xs">1962 • Edward O. Thorp & "Beat the Dealer"</span>
                  <p className="text-xs text-slate-300">
                    {isNl
                      ? 'Wiskundeprofessor Edward O. Thorp gebruikte een IBM 704 mainframe computer op MIT om miljoenen handen te simuleren. Hij publiceerde het boek "Beat the Dealer", waarin hij bewees dat Blackjack te verslaan is door de wiskundige basisstrategie en het tellen van kaarten. Het boek werd een instant New York Times bestseller!'
                      : 'MIT math professor Edward O. Thorp used an IBM 704 mainframe to simulate millions of deals, publishing "Beat the Dealer" and proving that card counting can beat casino odds.'}
                  </p>
                </div>

                <div className="border-l-2 border-purple-500/40 pl-4 space-y-1">
                  <span className="text-purple-400 font-mono font-bold text-xs">Jaren \'80 & \'90 • Het Legendarische MIT Blackjack Team</span>
                  <p className="text-xs text-slate-300">
                    {isNl
                      ? 'Een groep studenten van MIT en Harvard perfectioneerde team-kaarttellen en reisde met geheime signalen af naar Vegas, waar ze miljoenen dollars wonnen. Hun avonturen inspireerden het beroemde boek "Bringing Down the House" en de Hollywood-film "21".'
                      : 'Students from MIT formed covert teams utilizing secret signals and spotters to win millions across Vegas casinos, inspiring the book "Bringing Down the House" and movie "21".'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 bg-slate-900/90 border-t border-slate-800 flex items-center justify-between">
          <div className="text-[11px] font-mono text-slate-400">
            {isNl ? 'Vegas Strip Rules • Stand on 17 • Blackjack Pays 3:2' : 'Vegas Strip Rules • Stand on 17 • Blackjack Pays 3:2'}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono font-bold transition-all cursor-pointer"
            >
              {isNl ? 'Sluiten' : 'Close'}
            </button>

            {onPlayGame && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onPlayGame();
                }}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black text-xs font-mono font-black flex items-center gap-1.5 transition-all shadow-[0_0_15px_rgba(16,185,129,0.4)] cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-black" />
                <span>{isNl ? 'Speel Blackjack' : 'Play Blackjack'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
