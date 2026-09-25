/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, BookOpen, Brain, Play, HelpCircle, Layers, Award, Sparkles, Heart, Crown, ShieldAlert } from 'lucide-react';
import { Language } from '../i18n/lobbyTranslations';

interface BridgeHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlayGame?: () => void;
  lang?: Language;
}

export const BridgeHistoryModal: React.FC<BridgeHistoryModalProps> = ({
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
      <div className="relative w-full max-w-4xl rounded-3xl bg-slate-950 border-2 border-amber-500/80 shadow-[0_0_50px_rgba(245,158,11,0.3)] overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="relative p-5 sm:p-6 bg-gradient-to-r from-emerald-950 via-slate-900 to-amber-950/90 border-b border-amber-800/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-600/25 border border-amber-400 flex items-center justify-center text-amber-300 shadow-inner text-2xl font-serif font-black">
              ♠
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-mono text-lg sm:text-xl font-black text-white tracking-wide">
                  {isNl ? 'Contract Bridge Dossier & Meestergids' : 'Contract Bridge Dossier & Master Guide'}
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-950 text-amber-300 border border-amber-700">
                  DE KONING DER DENKSPORTEN
                </span>
              </div>
              <p className="text-xs font-mono text-slate-400 mt-0.5">
                {isNl
                  ? 'Honneurpunten, 5-kaart hoog, de biedbox, de Dummy (Blinde), de Snit & historisch eerbetoon'
                  : 'High Card Points, 5-card majors, bidding box, dummy play, finesses & historic tribute'}
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
                ? 'bg-slate-950 border-amber-500 text-amber-300 shadow-sm'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <HelpCircle className="w-4 h-4 text-amber-400" />
            <span>{isNl ? '🎯 Spelregels & Hoe het werkt' : '🎯 Rules & Mechanics'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('strategy')}
            className={`px-4 py-2.5 rounded-t-xl border-t border-x transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'strategy'
                ? 'bg-slate-950 border-emerald-500 text-emerald-300 shadow-sm'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Brain className="w-4 h-4 text-emerald-400" />
            <span>{isNl ? '💡 Biedbox & Speeltactieken' : '💡 Bidding & Tactics'}</span>
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
            <span>{isNl ? '📖 Historie & Eerbetoon' : '📖 History & Tribute'}</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 text-slate-300 text-xs sm:text-sm font-sans leading-relaxed">
          {/* TAB 1: RULES & BASICS */}
          {activeTab === 'rules' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* Mission Box */}
              <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-700/60 space-y-2">
                <div className="font-mono font-bold text-amber-300 text-sm flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>{isNl ? 'De Essentie van Contract Bridge' : 'The Essence of Contract Bridge'}</span>
                </div>
                <p className="text-slate-200 leading-relaxed">
                  {isNl
                    ? 'Bridge is een edel partnerschapsspel voor 4 spelers: Noord en Zuid spelen samen ("Wij") tegen Oost en West ("Zij"). Er wordt gespeeld met een standaard spel van 52 kaarten; elke speler krijgt 13 kaarten. Een spel bestaat uit twee fasen: eerst de Biedfase (het bepalen van het contract en de troefkleur) en daarna de Speelfase (het maken van de benodigde slagen).'
                    : 'Bridge is an intellectual partnership game for 4 players: North-South ("Us") against East-West ("Them"). Using a standard 52-card deck, each player receives 13 cards. A deal consists of two distinct phases: the Auction (bidding to name contract and strain) followed by the Play of the Hand.'}
                </p>
              </div>

              {/* 1. High Card Points */}
              <div className="space-y-3">
                <h4 className="font-mono text-sm font-bold text-white flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-400" />
                  <span>{isNl ? '1. Honneurpunten Tellen (HCP / Milton Work)' : '1. Counting High Card Points (HCP)'}</span>
                </h4>
                <p className="text-xs text-slate-300">
                  {isNl
                    ? 'Voordat je een bod doet, tel je de punten van je plaatjes en azen (Honneurpunten). In het hele spel zitten precies 40 honneurpunten:'
                    : 'Before making any bid, players evaluate their hand using the universal 4-3-2-1 High Card Points (HCP) scale (total 40 HCP in deck):'}
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center">
                    <span className="text-amber-400 font-black text-base">Aas (A)</span>
                    <div className="text-white font-bold text-lg mt-0.5">4 Punten</div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center">
                    <span className="text-amber-400 font-black text-base">Heer (K)</span>
                    <div className="text-white font-bold text-lg mt-0.5">3 Punten</div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center">
                    <span className="text-amber-400 font-black text-base">Vrouw (Q)</span>
                    <div className="text-white font-bold text-lg mt-0.5">2 Punten</div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center">
                    <span className="text-amber-400 font-black text-base">Boer (J)</span>
                    <div className="text-white font-bold text-lg mt-0.5">1 Punt</div>
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300">
                  <strong className="text-amber-300 font-mono">Gouden Richtlijn: </strong>
                  {isNl
                    ? 'Heb je 12 of meer honneurpunten? Dan ben je sterk genoeg om te openen! Hebben jij en je partner samen circa 25 punten? Dan kunnen jullie bijna altijd een Manche (Game) maken!'
                    : 'With 12+ HCP, your hand is strong enough to open the bidding. Together with partner, ~25 combined HCP usually produces a Game contract!'}
                </div>
              </div>

              {/* 2. The Contract & Tricks Target */}
              <div className="space-y-3">
                <h4 className="font-mono text-sm font-bold text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-amber-400" />
                  <span>{isNl ? '2. Wat Betekent een Biedbod / Contract?' : '2. Contract & Trick Targets'}</span>
                </h4>
                <p className="text-xs text-slate-300">
                  {isNl
                    ? 'In Bridge telt het eerste "boekje" van 6 slagen standaard niet mee. Elk niveau van een bod betekent: 6 slagen + het geboden niveau:'
                    : 'In Bridge, the first 6 tricks are the "book". The level bid represents how many tricks beyond 6 must be taken:'}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                    <span className="text-cyan-400 font-bold">1-Niveau (bijv. 1♠ of 1SA)</span>
                    <p className="text-slate-300 font-sans text-xs">6 + 1 = <strong>7 slagen</strong> vereist.</p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                    <span className="text-emerald-400 font-bold">4-Niveau (Manche: 4♥ of 4♠)</span>
                    <p className="text-slate-300 font-sans text-xs">6 + 4 = <strong>10 slagen</strong> vereist.</p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                    <span className="text-amber-400 font-bold">6-Niveau (Klein Slem)</span>
                    <p className="text-slate-300 font-sans text-xs">6 + 6 = <strong>12 slagen</strong> vereist!</p>
                  </div>
                </div>
              </div>

              {/* 3. The 4 Roles & The Dummy */}
              <div className="space-y-3">
                <h4 className="font-mono text-sm font-bold text-white flex items-center gap-2">
                  <Crown className="w-4 h-4 text-amber-400" />
                  <span>{isNl ? '3. De Rollen: De Leider & De Dummy (De Blinde)' : '3. Declarer & The Dummy'}</span>
                </h4>
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2 text-xs text-slate-300">
                  <p>
                    <strong className="text-amber-400 font-mono">De Leider (Declarer): </strong>
                    {isNl
                      ? 'De speler van het winnende paar die als eerste de troefkleur (of Sans Atout) van het uiteindelijke contract noemde. De leider speelt de hand.'
                      : 'The player of the declaring side who first mentioned the strain of the final contract.'}
                  </p>
                  <p>
                    <strong className="text-emerald-400 font-mono">De Dummy (De Blinde): </strong>
                    {isNl
                      ? 'De partner van de leider! Zodra de linkertegenstander de openingskaart heeft uitgespeeld, legt de Dummy alle 13 kaarten open op tafel, gerangschikt per kleur. De leider bestuurt en kiest vanaf dat moment zowel de eigen kaarten als die van de Dummy!'
                      : 'The partner of the declarer. As soon as the opening lead is played, the dummy displays all 13 cards face-up in columns. Declarer plays both their own hand and the dummy cards.'}
                  </p>
                  <p>
                    <strong className="text-cyan-400 font-mono">De Verdedigers: </strong>
                    {isNl
                      ? 'De twee tegenspelers proberen samen te voorkomen dat de leider het contract haalt door slagen weg te snoepen (Downslagen).'
                      : 'The two opponents attempting to defeat the contract with defensive trick-taking.'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: BIDDING & STRATEGY */}
          {activeTab === 'strategy' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-700/60 space-y-2">
                <div className="font-mono font-bold text-emerald-300 text-sm flex items-center gap-2">
                  <Brain className="w-4 h-4 text-emerald-400" />
                  <span>{isNl ? 'De Geheimen van het Biedsysteem' : 'The Secrets of Bidding Systems'}</span>
                </div>
                <p className="text-slate-200 text-xs leading-relaxed">
                  {isNl
                    ? 'Bieden is in Bridge een gecodeerde dialoog met je partner. Zonder met elkaar te praten, vertellen de biedingen precies hoeveel punten je hebt en hoe je kaarten verdeeld zijn over de vier kleuren.'
                    : 'Bidding is an encoded dialogue with your partner. Through bidding calls, partners convey high card strength and suit lengths without verbal communication.'}
                </p>
              </div>

              {/* Bidding Guidelines */}
              <div className="space-y-3">
                <h4 className="font-mono text-sm font-bold text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-emerald-400" />
                  <span>{isNl ? 'Biedregels van de Meesters' : 'Master Bidding Rules'}</span>
                </h4>
                <div className="space-y-2.5 text-xs">
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <strong className="text-amber-400 font-mono">1. De 5-Kaart Hoog Opening (1♠ of 1♥)</strong>
                    <p className="text-slate-300 mt-1">
                      {isNl
                        ? 'Open met 1 Schoppen of 1 Harten als je 12-21 punten hebt én minimaal 5 kaarten in die kleur. Een 8-kaart fit samen in een hoge kleur is de heilige graal in Bridge!'
                        : 'Open 1♠ or 1♥ with 12-21 HCP and at least a 5-card length in that major suit.'}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <strong className="text-cyan-400 font-mono">2. De 1SA Opening (15-17 Punten Gelijkmatig)</strong>
                    <p className="text-slate-300 mt-1">
                      {isNl
                        ? 'Sans Atout betekent spelen ZONDER troefkleur (de hoogste kaart in de gevraagde kleur wint altijd). Een 1SA opening toont exact 15 t/m 17 honneurpunten en een gelijkmatige hand (geen singletons of renonces).'
                        : '1NT shows exactly 15-17 HCP with a balanced distribution (no singletons or voids).'}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <strong className="text-emerald-400 font-mono">3. De Manchecontracten (Game Bonus!)</strong>
                    <p className="text-slate-300 mt-1">
                      {isNl
                        ? 'De grote punten in Bridge zitten in de Manche: 3SA (9 slagen), 4♥ / 4♠ (10 slagen) of 5♣ / 5♦ (11 slagen). Haal je een Manche, dan krijg je een gigantische bonus van 300 of 500 punten!'
                        : 'Game contracts (3NT, 4♥, 4♠, 5♣, 5♦) award massive 300 (non-vul) or 500 (vul) point bonuses!'}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <strong className="text-purple-400 font-mono">4. De Speeltactiek: De Snit (Finesse)</strong>
                    <p className="text-slate-300 mt-1">
                      {isNl
                        ? 'Heb je in de ene hand het Aas en de Vrouw, maar ontbreekt de Heer? Speel een lage kaart naar de Vrouw toe! Als de tegenstander links van je de Heer heeft, wint jouw Vrouw de slag zonder dat het Aas verloren gaat. Een succesvolle snit levert direct een gratis extra slag op.'
                        : 'If you hold Ace and Queen missing the King, lead low toward the Queen (the finesse). If the King sits favorably, your Queen wins a bonus trick!'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: HISTORY & TRIBUTE */}
          {activeTab === 'history' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="p-4 rounded-2xl bg-cyan-950/30 border border-cyan-800/60 space-y-2">
                <div className="font-mono font-bold text-cyan-300 text-sm flex items-center gap-2">
                  <Heart className="w-4 h-4 text-rose-400 fill-rose-400" />
                  <span>{isNl ? 'Eerbetoon aan Vaders & Grootmeesters' : 'Tribute to Fathers & Grandmasters'}</span>
                </div>
                <p className="text-slate-200 text-xs leading-relaxed">
                  {isNl
                    ? 'Voor wie een vader had die uitmuntend kon bridgen: Bridge is veel meer dan zomaar een kaartspel. Het vereist een messcherp geheugen voor afgespeelde kaarten, diep respect voor je partner, kalmte onder druk en een ongeëvenaard strategisch inzicht. Aan de bridgetafel kwamen vriendschap, wiskunde en de spanning van een perfect afgespeelde slem samen.'
                    : 'To everyone whose father was a master at Bridge: Bridge is far more than cards. It embodies deep memory, tactical psychology, partnership trust, and intellectual brilliance.'}
                </p>
              </div>

              {/* Historical Timeline */}
              <div className="space-y-4">
                <div className="border-l-2 border-amber-500/50 pl-4 space-y-1">
                  <span className="text-amber-400 font-mono font-bold text-xs">1 november 1925 • Harold Vanderbilt op het SS Finland</span>
                  <p className="text-xs text-slate-300">
                    {isNl
                      ? 'De Amerikaanse miljonair en zeiler Harold Stirling Vanderbilt bedacht tijdens een cruise door het Panamakanaal de moderne puntentelling, de kwetsbaarheid en de manchebonussen. Dit was de officiële geboorte van Contract Bridge!'
                      : 'Billionaire yachtsman Harold S. Vanderbilt invented Contract Bridge scoring and vulnerability aboard the steamship SS Finland traversing the Panama Canal.'}
                  </p>
                </div>

                <div className="border-l-2 border-emerald-500/50 pl-4 space-y-1">
                  <span className="text-emerald-400 font-mono font-bold text-xs">1930 • Oprichting Nederlandse Bridge Bond (NBB)</span>
                  <p className="text-xs text-slate-300">
                    {isNl
                      ? 'Nederland omarmde Bridge al vroeg. De NBB groeide uit tot de op één na grootste bridgebond ter wereld, met meer dan 100.000 leden. Nederland leverde meermalen wereldkampioenen af bij de illustere Bermuda Bowl!'
                      : 'The Dutch Bridge League (NBB) was founded in 1930 and grew into one of the largest worldwide, winning multiple Bermuda Bowl World Championships.'}
                  </p>
                </div>

                <div className="border-l-2 border-cyan-500/50 pl-4 space-y-1">
                  <span className="text-cyan-400 font-mono font-bold text-xs">1931 • De Slag van de Eeuw (Ely Culbertson)</span>
                  <p className="text-xs text-slate-300">
                    {isNl
                      ? 'Ely Culbertson daagde Sidney Lenz uit voor een epische marathonmatch van 150 spellen in New York. De kranten stonden er dagelijks vol van en Bridge werd een wereldwijde sensatie.'
                      : 'The Bridge Battle of the Century between Culbertson and Lenz in NYC captured global headlines across 150 deals.'}
                  </p>
                </div>

                <div className="border-l-2 border-purple-500/50 pl-4 space-y-1">
                  <span className="text-purple-400 font-mono font-bold text-xs">1944 • Charles Goren & Het Punten tellen</span>
                  <p className="text-xs text-slate-300">
                    {isNl
                      ? 'Charles Goren populariseerde het 4-3-2-1 honneurpuntensysteem, waardoor miljoenen mensen thuis en op bridgeclubs snel en trefzeker konden leren bieden.'
                      : 'Charles Goren standardized the 4-3-2-1 HCP scale, bringing bridge to millions of club and living room players.'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 bg-slate-900/90 border-t border-slate-800 flex items-center justify-between">
          <div className="text-[11px] font-mono text-slate-400">
            {isNl ? 'Contract Bridge • 5-Kaart Hoog • Biedbox • Dummy Afspelen' : 'Contract Bridge • 5-Card Major • Bidding Box • Dummy Play'}
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
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black text-xs font-mono font-black flex items-center gap-1.5 transition-all shadow-[0_0_15px_rgba(245,158,11,0.4)] cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-black" />
                <span>{isNl ? 'Neem Plaats aan Tafel' : 'Take a Seat at Table'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
