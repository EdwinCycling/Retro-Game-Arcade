/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Donkey Kong (1981) - Dedicated Landing Page & Exhibition Showcase
 * Complete interactive hub with stage explorer, audio jukebox, mechanics & direct play.
 */

import React, { useState } from 'react';
import { 
  Play, Sparkles, Trophy, Volume2, Info, ArrowLeft, 
  Gamepad2, History, Award, CheckCircle2, ChevronRight, Layers, Flame, Hammer, Heart
} from 'lucide-react';
import { donkeyKongAudio } from '../game/donkeyKongAudio';
import { getDonkeyKongScores } from '../game/donkeyKongHighScores';
import { haptics } from '../utils/haptics';

interface DonkeyKongLandingPageProps {
  onPlay: (stage?: number) => void;
  onBackToLobby: () => void;
  lang?: 'nl' | 'en';
}

export const DonkeyKongLandingPage: React.FC<DonkeyKongLandingPageProps> = ({
  onPlay,
  onBackToLobby,
  lang = 'nl',
}) => {
  const [selectedStage, setSelectedStage] = useState<1 | 2 | 3 | 4>(1);
  const [activeTab, setActiveTab] = useState<'stages' | 'characters' | 'history' | 'soundboard' | 'scores'>('stages');
  const highScores = getDonkeyKongScores();

  const playSound = (soundType: 'jump' | 'walk' | 'barrel' | 'hammer' | 'win' | 'intro') => {
    haptics.light();
    switch (soundType) {
      case 'jump': donkeyKongAudio.playJump(); break;
      case 'walk': donkeyKongAudio.playWalk(); break;
      case 'barrel': donkeyKongAudio.playBarrelRoll(); break;
      case 'hammer': donkeyKongAudio.playHammerHit(); break;
      case 'win': donkeyKongAudio.playLevelClear(); break;
      case 'intro': donkeyKongAudio.playStageIntro(); break;
    }
  };

  const handleStartGame = (stage: number = 1) => {
    haptics.success();
    donkeyKongAudio.playCoinDrop();
    onPlay(stage);
  };

  const stageData = {
    1: {
      title: '25m — GIRDERS & BARRELS',
      subTitle: lang === 'nl' ? 'Schuine Steigers & Rollende Vaten' : 'Slanted Girders & Rolling Barrels',
      color: '#ef4444',
      bgGradient: 'from-red-950/60 via-neutral-900 to-black',
      description: lang === 'nl'
        ? 'Het meest iconische eerste level in de gamegeschiedenis. Beklim 6 schuine steigers terwijl Donkey Kong rollende houten vaten werpt die van ladders omlaag vallen. Grijp de hamer om vaten voor 300, 500 of 800 punten te verpulveren!'
        : 'The most iconic opening level in gaming history. Climb 6 slanted girders while Donkey Kong hurls rolling barrels down ladders. Snag the hammer to crush barrels for 300, 500, or 800 bonus points!',
      hazards: [
        lang === 'nl' ? 'Rollende en vallende houten vaten' : 'Rolling & falling wooden barrels',
        lang === 'nl' ? 'Mobiele vuurballen uit het olievat' : 'Mobile fireballs spawned from oil drum',
        lang === 'nl' ? 'Gebroken ladders waar Mario niet op kan klimmen' : 'Broken ladder rungs Mario cannot climb'
      ],
      bonusItems: [
        lang === 'nl' ? 'Pauline\'s Parasol (+300 pts)' : 'Pauline\'s Parasol (+300 pts)',
        lang === 'nl' ? 'Sloophamer Power-Up' : 'Sledgehammer Power-Up'
      ]
    },
    2: {
      title: '50m — CONVEYOR BELTS',
      subTitle: lang === 'nl' ? 'Lopende Banden & Cementpannen' : 'Conveyor Belts & Cement Pies',
      color: '#3b82f6',
      bgGradient: 'from-blue-950/60 via-neutral-900 to-black',
      description: lang === 'nl'
        ? 'Drie dynamische lopende banden transporteren hete cementpannen. De draairichting van de banden keert periodiek om. Gebruik uitschuifbare ladders en time je sprongen om Mario naar de bovenste ladder te loodsen.'
        : 'Three active conveyor belts transport deadly boiling cement pies. Conveyor directions reverse dynamically. Master retractable ladders and precise timing to guide Mario to the top.',
      hazards: [
        lang === 'nl' ? 'Hete cementpannen op de transportbanden' : 'Boiling cement pies on the belts',
        lang === 'nl' ? 'Dynamisch omkerende looprichting' : 'Reversing conveyor belt direction',
        lang === 'nl' ? 'Rondzwervende vurige vijanden' : 'Roaming fireball enemies'
      ],
      bonusItems: [
        lang === 'nl' ? 'Pauline\'s Handtas (+500 pts)' : 'Pauline\'s Handbag (+500 pts)',
        lang === 'nl' ? 'Hamer voor cement-vernietiging' : 'Hammer for smashing cement pies'
      ]
    },
    3: {
      title: '75m — ELEVATORS & SPRINGS',
      subTitle: lang === 'nl' ? 'Liften & Stuiterende Veren' : 'Elevators & Bouncing Springs',
      color: '#eab308',
      bgGradient: 'from-yellow-950/60 via-neutral-900 to-black',
      description: lang === 'nl'
        ? 'Twee liftschachten bewegen synchroon omhoog en omlaag. Spring over zwevende platformen terwijl Donkey Kong vanaf de top stuiterende metalen veren langs de rechterkant naar beneden slingert!'
        : 'Two vertical elevator shafts ascend and descend synchronously. Leap across suspended platforms while Donkey Kong hurls bouncing steel springs down the right side of the screen!',
      hazards: [
        lang === 'nl' ? 'Stuiterende metalen veren van DK' : 'Bouncing steel springs hurled by DK',
        lang === 'nl' ? 'Hoogtevrees bij val tussen liften' : 'Lethal drop between elevator shafts',
        lang === 'nl' ? 'Agressieve zwevende vuurballen' : 'Aggressive hovering fireballs'
      ],
      bonusItems: [
        lang === 'nl' ? 'Pauline\'s Hoed (+800 pts)' : 'Pauline\'s Sunhat (+800 pts)',
        lang === 'nl' ? 'Paraplu (+300 pts)' : 'Parasol (+300 pts)'
      ]
    },
    4: {
      title: '100m — RIVET COLLAPSE',
      subTitle: lang === 'nl' ? 'Klinknagels & De Val van Donkey Kong' : 'Rivet Removal & Donkey Kong Falls',
      color: '#10b981',
      bgGradient: 'from-emerald-950/60 via-neutral-900 to-black',
      description: lang === 'nl'
        ? 'De grote finale! Loop over of spring over alle 8 gele klinknagels (rivets) om ze los te maken. Zodra de laatste klinknagel breekt, stort de steigerconstructie in, valt Donkey Kong op zijn hoofd en worden Mario en Pauline herenigd!'
        : 'The grand finale! Run or jump over all 8 yellow rivets to pull them out. When the final rivet is removed, the entire girder structure collapses, Donkey Kong plummets on his head, and Mario is reunited with Pauline!',
      hazards: [
        lang === 'nl' ? 'Meerdere achtervolgende vuurballen' : 'Multiple pursuing fireballs',
        lang === 'nl' ? 'Gaten in de vloer na verwijderen klinknagels' : 'Gaps in the floor once rivets are removed'
      ],
      bonusItems: [
        lang === 'nl' ? '2x Sloophamers voor verdediging' : '2x Sledgehammers for defense',
        lang === 'nl' ? 'Pauline\'s Verloren Tas & Hoed' : 'Pauline\'s Lost Bag & Sunhat'
      ]
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center p-3 sm:p-6 font-mono select-none">
      {/* Top Bar */}
      <div className="w-full max-w-6xl flex items-center justify-between pb-4 border-b border-neutral-800">
        <button
          type="button"
          onClick={onBackToLobby}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-300 hover:text-white text-xs transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{lang === 'nl' ? 'Terug naar Speelhal' : 'Back to Arcade'}</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-full bg-red-950 text-red-400 border border-red-800 text-[10px] font-black">
            NINTENDO CO., LTD. 1981
          </span>
          <span className="px-2.5 py-1 rounded-full bg-sky-950 text-sky-400 border border-sky-800 text-[10px] font-black">
            RADAR SCOPE TKG4
          </span>
        </div>
      </div>

      {/* Hero Marquee Section */}
      <div className="w-full max-w-6xl my-6 rounded-3xl overflow-hidden border-4 border-sky-500/80 shadow-[0_0_50px_rgba(56,189,248,0.3)] bg-gradient-to-b from-sky-950 via-neutral-950 to-neutral-950 p-6 sm:p-10 relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/10 rounded-full filter blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7">
            <div className="flex items-center gap-2 text-yellow-400 font-black text-xs tracking-widest uppercase mb-2">
              <Sparkles className="w-4 h-4" />
              <span>{lang === 'nl' ? 'DE GEBOORTE VAN HET PLATFORM-GENRE' : 'THE BIRTH OF PLATFORMING'}</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white uppercase drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)] leading-none">
              DONKEY <span className="text-red-500">KONG</span>
            </h1>

            <p className="text-sm sm:text-base text-neutral-300 mt-4 leading-relaxed font-sans">
              {lang === 'nl'
                ? 'Het baanbrekende meesterwerk van Shigeru Miyamoto en Gunpei Yokoi uit 1981. Bevat alle 4 originele arcade levels: de schuine steigers van 25m, de lopende banden van 50m, de liften van 75m en de iconische val van 100m!'
                : 'The groundbreaking 1981 masterpiece created by Shigeru Miyamoto and Gunpei Yokoi. Featuring all 4 original arcade stages: the 25m girders, 50m conveyor belts, 75m elevators, and the iconic 100m rivet collapse!'}
            </p>

            <div className="flex flex-wrap items-center gap-3 mt-6">
              <button
                type="button"
                onClick={() => handleStartGame(1)}
                className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-red-600 via-rose-500 to-amber-500 hover:from-red-500 hover:to-amber-400 text-white font-black text-sm tracking-wider shadow-[0_0_30px_rgba(239,68,68,0.7)] flex items-center gap-2.5 transform active:scale-95 transition-all cursor-pointer"
              >
                <Play className="w-5 h-5 fill-white" />
                <span>{lang === 'nl' ? 'START ARCADE SPEL (25M)' : 'PLAY ARCADE (25M)'}</span>
              </button>

              <button
                type="button"
                onClick={() => handleStartGame(selectedStage)}
                className="px-5 py-3.5 rounded-2xl bg-neutral-900 hover:bg-neutral-800 border border-sky-500/60 text-sky-300 hover:text-white font-bold text-xs flex items-center gap-2 transition-all cursor-pointer"
              >
                <Layers className="w-4 h-4 text-sky-400" />
                <span>{lang === 'nl' ? `Start Level ${selectedStage * 25}m` : `Warp to ${selectedStage * 25}m`}</span>
              </button>
            </div>
          </div>

          {/* Right Visual Badge Card */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center p-6 rounded-2xl bg-neutral-900/90 border-2 border-sky-400/40 shadow-2xl text-center">
            <span className="text-6xl sm:text-7xl mb-2 filter drop-shadow-[0_0_20px_rgba(239,68,68,0.8)] animate-bounce">
              🦍
            </span>
            <span className="text-xs font-black text-sky-400 uppercase tracking-widest">
              HOW HIGH CAN YOU GET?
            </span>
            <div className="grid grid-cols-4 gap-2 w-full mt-4">
              {([1, 2, 3, 4] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => {
                    setSelectedStage(s);
                    playSound('jump');
                  }}
                  className={`py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    selectedStage === s
                      ? 'bg-sky-500 text-black shadow-[0_0_15px_rgba(56,189,248,0.8)] scale-105'
                      : 'bg-neutral-950 border border-neutral-700 text-neutral-300 hover:text-white'
                  }`}
                >
                  {s * 25}M
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="w-full max-w-6xl flex flex-wrap gap-2 pb-4 border-b border-neutral-800">
        {[
          { id: 'stages', label: lang === 'nl' ? '4 Arcade Niveaus' : '4 Stages', icon: Layers },
          { id: 'characters', label: lang === 'nl' ? 'Personages & Items' : 'Characters & Items', icon: Gamepad2 },
          { id: 'soundboard', label: lang === 'nl' ? 'Arcade Jukebox' : 'Soundboard', icon: Volume2 },
          { id: 'history', label: lang === 'nl' ? 'Historie & Trivia' : 'History & Trivia', icon: History },
          { id: 'scores', label: lang === 'nl' ? 'Hall of Fame' : 'High Scores', icon: Trophy },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                haptics.selection();
                setActiveTab(tab.id as any);
              }}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold font-mono flex items-center gap-2 transition-all cursor-pointer ${
                isActive
                  ? 'bg-sky-500 text-black shadow-[0_0_20px_rgba(56,189,248,0.6)] scale-102'
                  : 'bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: 4 Stages Showcase */}
      {activeTab === 'stages' && (
        <div className="w-full max-w-6xl my-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 flex flex-col gap-3">
            {([1, 2, 3, 4] as const).map((lvl) => {
              const info = stageData[lvl];
              const isSelected = selectedStage === lvl;
              return (
                <div
                  key={lvl}
                  onClick={() => {
                    setSelectedStage(lvl);
                    playSound('jump');
                  }}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-neutral-900 border-sky-400 shadow-[0_0_25px_rgba(56,189,248,0.4)] scale-102'
                      : 'bg-neutral-950 border-neutral-800 hover:border-neutral-700 opacity-80'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-sky-400">{lvl * 25} METERS</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-neutral-800 text-neutral-300 font-bold">
                      STAGE {lvl}
                    </span>
                  </div>
                  <h4 className="text-sm font-black text-white mt-1">{info.subTitle}</h4>
                </div>
              );
            })}
          </div>

          <div className="lg:col-span-8 p-6 rounded-3xl bg-neutral-900/90 border border-neutral-800 shadow-2xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-neutral-800 pb-3 mb-4">
                <div>
                  <span className="text-xs font-black text-sky-400 uppercase tracking-wider">
                    {stageData[selectedStage].title}
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black text-white mt-0.5">
                    {stageData[selectedStage].subTitle}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => handleStartGame(selectedStage)}
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>{lang === 'nl' ? 'Speel Dit Level' : 'Play Level'}</span>
                </button>
              </div>

              <p className="text-sm text-neutral-300 leading-relaxed font-sans mb-6">
                {stageData[selectedStage].description}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-neutral-950 border border-red-900/40">
                  <h5 className="text-xs font-black text-red-400 flex items-center gap-2 mb-2">
                    <Flame className="w-4 h-4" />
                    <span>{lang === 'nl' ? 'Gevaren & Hindernissen' : 'Hazards'}</span>
                  </h5>
                  <ul className="text-xs text-neutral-400 space-y-1.5 font-sans">
                    {stageData[selectedStage].hazards.map((h, i) => (
                      <li key={i} className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-2xl bg-neutral-950 border border-yellow-900/40">
                  <h5 className="text-xs font-black text-yellow-400 flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4" />
                    <span>{lang === 'nl' ? 'Bonus Items & Power-ups' : 'Bonuses'}</span>
                  </h5>
                  <ul className="text-xs text-neutral-400 space-y-1.5 font-sans">
                    {stageData[selectedStage].bonusItems.map((b, i) => (
                      <li key={i} className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Characters & Items */}
      {activeTab === 'characters' && (
        <div className="w-full max-w-6xl my-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              name: 'JUMPMAN / MARIO',
              icon: '👨🏻‍🔧',
              role: lang === 'nl' ? 'Timmerman & Held' : 'Carpenter & Hero',
              desc: lang === 'nl'
                ? 'Mario\'s allereerste optreden in de geschiedenis! Als dappere timmerman trotseert hij de steigers om Pauline te redden.'
                : 'Mario\'s very first historical appearance! As a courageous carpenter, he braves the construction site to save Pauline.'
            },
            {
              name: 'DONKEY KONG',
              icon: '🦍',
              role: lang === 'nl' ? 'Ontsnapte Reuzen-Aap' : 'Escaped Giant Ape',
              desc: lang === 'nl'
                ? 'De koppige gorilla die vaten, cement en veren werpt en op zijn borst trommelt wanneer Mario een trede nadert.'
                : 'The stubborn ape who hurls barrels, cement pies, and springs, pounding his chest as Mario ascends.'
            },
            {
              name: 'LADY PAULINE',
              icon: '💃🏼',
              role: lang === 'nl' ? 'Jongedame in Nood' : 'Damsel in Distress',
              desc: lang === 'nl'
                ? 'Bovenop de steigers roept ze onophoudelijk "HELP!". Wanneer Mario haar bereikt verschijnt een kloppend hartje!'
                : 'Trapped at the top, she cries "HELP!". Rescuing her triggers the romantic beating heart celebration!'
            },
            {
              name: 'DE SLOOPHAMER',
              icon: '🔨',
              role: lang === 'nl' ? 'Vernietigende Power-Up' : 'Smashing Power-Up',
              desc: lang === 'nl'
                ? 'Grijp de hamer om 10 seconden lang onkwetsbaar te zijn en alle vaten, vuurballen en cementpannen tot gruis te slaan.'
                : 'Grabbing the hammer grants 10 seconds of invincibility to smash barrels, fireballs, and cement pies for massive bonus points.'
            },
            {
              name: 'VUURBALLEN (OIL SPARKS)',
              icon: '🔥',
              role: lang === 'nl' ? 'Dodelijke Entiteiten' : 'Lethal Hazards',
              desc: lang === 'nl'
                ? 'Ontstaan uit het olievat onderin 25m en dwalen onvoorspelbaar over ladders en platforms.'
                : 'Born from the oil drum at 25m, they roam unpredictably across platforms and climb ladders to intercept Mario.'
            },
            {
              name: 'PAULINE\'S SPULLEN',
              icon: '🎀',
              role: lang === 'nl' ? 'Verloren Schatten' : 'Bonus Collectibles',
              desc: lang === 'nl'
                ? 'De parasol (300 pts), handtas (500 pts) en hoed (800 pts) leveren cruciale punten op voor een nieuw record.'
                : 'The parasol (300 pts), handbag (500 pts), and sunhat (800 pts) provide vital points for your high score.'
            }
          ].map((c, idx) => (
            <div key={idx} className="p-6 rounded-2xl bg-neutral-900/90 border border-neutral-800 shadow-xl flex flex-col justify-between">
              <div>
                <span className="text-4xl mb-3 block">{c.icon}</span>
                <span className="text-[10px] font-mono font-bold text-sky-400 uppercase tracking-widest">{c.role}</span>
                <h4 className="text-base font-black text-white mt-1">{c.name}</h4>
                <p className="text-xs text-neutral-400 mt-2 leading-relaxed font-sans">{c.desc}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: Soundboard */}
      {activeTab === 'soundboard' && (
        <div className="w-full max-w-6xl my-6 p-6 rounded-3xl bg-neutral-900/90 border border-neutral-800 shadow-2xl">
          <h3 className="text-lg font-black text-white mb-2 flex items-center gap-2">
            <Volume2 className="w-5 h-5 text-yellow-400" />
            <span>{lang === 'nl' ? 'AUTHENTIEKE DISCRETE SOUND SYNTHESIZER' : 'DISCRETE ARCADE SOUNDBOARD'}</span>
          </h3>
          <p className="text-xs text-neutral-400 mb-6 font-sans">
            {lang === 'nl'
              ? 'Luister naar de getrouw gereproduceerde retro geluidseffecten van de originele Nintendo arcade kast!'
              : 'Sample the accurately generated retro sound effects from the original Nintendo arcade cabinet!'}
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[
              { id: 'jump', title: 'Mario Jump Sound', desc: 'Rising sweep chirp', icon: '🦘' },
              { id: 'walk', title: 'Footsteps', desc: 'Girder footstep cadence', icon: '👟' },
              { id: 'barrel', title: 'Barrel Roll', desc: 'Rhythmic rolling rumble', icon: '🛢️' },
              { id: 'hammer', title: 'Hammer Impact', desc: 'Smash impact klap', icon: '🔨' },
              { id: 'intro', title: 'Stage Intro Jingle', desc: 'How high can you get', icon: '🎺' },
              { id: 'win', title: 'Level Clear Fanfare', desc: 'Heart reunion melody', icon: '🏆' },
            ].map((snd) => (
              <button
                key={snd.id}
                type="button"
                onClick={() => playSound(snd.id as any)}
                className="p-4 rounded-2xl bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 hover:border-yellow-400/60 text-left transition-all group cursor-pointer"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">{snd.icon}</span>
                  <Volume2 className="w-4 h-4 text-neutral-500 group-hover:text-yellow-400" />
                </div>
                <h4 className="text-xs font-black text-white">{snd.title}</h4>
                <p className="text-[10px] text-neutral-400 font-sans mt-0.5">{snd.desc}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: History & Trivia */}
      {activeTab === 'history' && (
        <div className="w-full max-w-6xl my-6 p-6 rounded-3xl bg-neutral-900/90 border border-neutral-800 shadow-2xl space-y-6">
          <div>
            <h3 className="text-xl font-black text-white flex items-center gap-2">
              <History className="w-5 h-5 text-sky-400" />
              <span>{lang === 'nl' ? 'Het Ontstaan van Donkey Kong' : 'The Origins of Donkey Kong'}</span>
            </h3>
            <p className="text-xs sm:text-sm text-neutral-300 font-sans leading-relaxed mt-2">
              {lang === 'nl'
                ? 'In 1980 stond Nintendo of America op de rand van de afgrond door duizenden onverkochte "Radar Scope" arcadekasten. Hiroshi Yamauchi vroeg de jonge industriële vormgever Shigeru Miyamoto om een nieuw spel te ontwerpen dat de printplaten van Radar Scope kon hergebruiken. Onder leiding van de legendarische Gunpei Yokoi bedacht Miyamoto een verhalend springspel rond een timmerman, een aap en een jonkvrouw. Het spel werd een wereldwijd fenomeen en legde het fundament voor het wereldwijde succes van Nintendo.'
                : 'In 1980, Nintendo of America was in crisis with thousands of unsold "Radar Scope" arcade cabinets. President Hiroshi Yamauchi tasked a young staff artist, Shigeru Miyamoto, with converting the hardware into a hit. Guided by chief engineer Gunpei Yokoi, Miyamoto created a narrative platformer featuring a carpenter, a gorilla, and a lady. The game became a historic triumph, transforming Nintendo into an entertainment giant.'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-neutral-800">
            <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800">
              <h4 className="text-xs font-black text-sky-400 mb-1">RADAR SCOPE CONVERSION</h4>
              <p className="text-xs text-neutral-400 font-sans">
                {lang === 'nl'
                  ? 'Alle 2.000 overtollige Radar Scope kasten in de VS werden in een magazijn in Washington omgebouwd met nieuwe Donkey Kong ROMs en marquees.'
                  : 'All 2,000 unsold Radar Scope units in the US were retrofitted in a Tukwila, Washington warehouse with Donkey Kong ROMs.'}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800">
              <h4 className="text-xs font-black text-sky-400 mb-1">DE UNIVERSAL STUDIOS RECHTSZAAK</h4>
              <p className="text-xs text-neutral-400 font-sans">
                {lang === 'nl'
                  ? 'Universal Studios klaagde Nintendo aan wegens King Kong inbreuk. Advocaat John Kirby bewees dat Universal King Kong eerder zelf tot publiek domein had verklaard. Als dank noemde Miyamoto de roze held "Kirby"!'
                  : 'Universal Studios sued claiming King Kong trademark infringement. Attorney John Kirby won the case for Nintendo, earning a boat named "Donkey Kong" and inspiring the character Kirby!'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Hall of Fame */}
      {activeTab === 'scores' && (
        <div className="w-full max-w-6xl my-6 p-6 rounded-3xl bg-neutral-900/90 border border-neutral-800 shadow-2xl">
          <div className="flex items-center justify-between pb-4 border-b border-neutral-800 mb-4">
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-400" />
              <span>DONKEY KONG HALL OF FAME</span>
            </h3>
            <span className="text-xs text-neutral-400 font-mono">TOP 5 ARCADE SCORES</span>
          </div>

          <div className="space-y-2">
            {highScores.map((sc, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800 font-mono"
              >
                <div className="flex items-center gap-3">
                  <span className={`w-6 text-center font-black ${
                    idx === 0 ? 'text-yellow-400 text-base' : idx === 1 ? 'text-neutral-300' : idx === 2 ? 'text-amber-600' : 'text-neutral-500'
                  }`}>
                    {idx + 1}.
                  </span>
                  <span className="text-sm font-black text-white tracking-widest">{sc.initials}</span>
                  <span className="text-xs text-neutral-500 font-sans">({sc.stage})</span>
                </div>
                <span className="text-sm font-black text-yellow-400 tracking-wider">{sc.score.toLocaleString()} PTS</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
