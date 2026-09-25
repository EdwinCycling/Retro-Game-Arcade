/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Spy Fox in "Dry Cereal" (1997 Humongous Entertainment / SCUMM)
 * Authentic PC CD-ROM Adventure Cabinet with 100% Crystal-Clear UI & Character Voice Acting
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  ArrowLeft,
  RotateCcw,
  Volume2,
  VolumeX,
  Languages,
  BookOpen,
  Award,
  Mic,
  MicOff,
  Sparkles,
  Clock,
  Radio,
  MapPin,
  Target,
  X,
  MessageSquare,
  HelpCircle,
  Lightbulb,
  Zap
} from 'lucide-react';
import { SpyFoxEngine, SF_VIRTUAL_WIDTH, SF_VIRTUAL_HEIGHT, VerbType, InventoryItem } from '../game/spyFoxEngine';
import { SpyFoxRenderer } from '../game/spyFoxRenderer';
import { spyFoxAudio } from '../game/spyFoxAudio';
import { spyFoxSpeech, SpeakerId } from '../game/spyFoxSpeech';

interface SpyFoxCabinetProps {
  onBackToLobby: () => void;
}

export const SpyFoxCabinet: React.FC<SpyFoxCabinetProps> = ({ onBackToLobby }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<SpyFoxEngine | null>(null);
  const rendererRef = useRef<SpyFoxRenderer | null>(null);
  const requestRef = useRef<number | null>(null);

  // UI State
  const [lang, setLang] = useState<'nl' | 'en'>('nl');
  const [isMuted, setIsMuted] = useState(false);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentSpeaker, setCurrentSpeaker] = useState<SpeakerId>('fox');
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [score, setScore] = useState(100);

  // Synced Reactive Engine State for High-Res Crisp UI
  const [dialogState, setDialogState] = useState<{
    speaker: SpeakerId;
    speakerName: string;
    text: string;
  } | null>(null);

  const [selectedVerb, setSelectedVerb] = useState<VerbType>('LOOK_AT');
  const [activeItem, setActiveItem] = useState<string | null>(null);
  const [inventoryList, setInventoryList] = useState<InventoryItem[]>([]);
  const [hoveredHotspotName, setHoveredHotspotName] = useState<string | null>(null);
  const [currentRoomName, setCurrentRoomName] = useState<string>('harbor');
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Speech change callback listener
  useEffect(() => {
    spyFoxSpeech.onSpeakingChange((speaking, speaker) => {
      setIsSpeaking(speaking);
      if (speaker) setCurrentSpeaker(speaker);
    });
  }, []);

  // Initialize Engine
  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const engine = new SpyFoxEngine();
    engine.currentLang = lang;
    const renderer = new SpyFoxRenderer(ctx);
    engineRef.current = engine;
    rendererRef.current = renderer;

    const loop = () => {
      engine.currentLang = lang;
      engine.update();
      renderer.render(engine, lang);

      // Synchronize high-res UI state
      setScore(engine.score);
      setSelectedVerb(engine.selectedVerb);
      setActiveItem(engine.activeInventoryItem);
      setInventoryList([...engine.inventory]);
      setCurrentRoomName(engine.currentRoom);
      setHoveredHotspotName(engine.hoveredHotspot ? engine.hoveredHotspot.name[lang] : null);

      if (engine.dialog) {
        setDialogState({
          speaker: engine.dialog.speaker,
          speakerName: engine.dialog.speakerName,
          text: engine.dialog.text[lang]
        });
      } else {
        setDialogState(null);
      }

      requestRef.current = requestAnimationFrame(loop);
    };

    requestRef.current = requestAnimationFrame(loop);

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      spyFoxAudio.stopSpyTheme();
      spyFoxSpeech.stop();
    };
  }, [lang]);

  // Audio mute sync
  const toggleMute = useCallback(() => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    spyFoxAudio.setMuted(nextMuted);
  }, [isMuted]);

  // Voice toggle
  const toggleVoice = useCallback(() => {
    const nextVoice = !isVoiceEnabled;
    setIsVoiceEnabled(nextVoice);
    spyFoxSpeech.setEnabled(nextVoice);
  }, [isVoiceEnabled]);

  // Canvas Mouse Coordinates Helper
  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = SF_VIRTUAL_WIDTH / rect.width;
    const scaleY = SF_VIRTUAL_HEIGHT / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!engineRef.current) return;
    const { x, y } = getCanvasCoords(e);
    engineRef.current.handleCanvasClick(x, y);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!engineRef.current) return;
    const { x, y } = getCanvasCoords(e);
    setMousePos({ x, y });
    engineRef.current.handleMouseMove(x, y);
  };

  const handleSelectVerb = (verb: VerbType) => {
    if (!engineRef.current) return;
    engineRef.current.selectVerb(verb);
  };

  const handleSelectInventoryItem = (itemId: string) => {
    if (!engineRef.current) return;
    engineRef.current.selectInventoryItem(itemId);
  };

  const handleOpenSpyWatch = () => {
    if (!engineRef.current) return;
    engineRef.current.openSpyWatch();
  };

  const handleCloseSpyWatch = () => {
    if (!engineRef.current) return;
    engineRef.current.closeSpyWatch();
  };

  const handleAskPenny = (type: 'mission' | 'hint') => {
    if (!engineRef.current) return;
    const engine = engineRef.current;
    if (type === 'mission') {
      engine.say(
        'penny',
        'Monkey Penny',
        {
          nl: 'Fox, William the Kid heeft alle koeien ontvoerd en bouwt een Melkzuurraket! Dring de vesting binnen en ontmantel de raket.',
          en: 'Fox, William the Kid kidnapped all dairy cows and built a Lactose Missile! Infiltrate the fortress and disarm the weapon.'
        },
        lang
      );
    } else {
      if (!engine.warehouseDoorUnlocked) {
        engine.say(
          'penny',
          'Monkey Penny',
          {
            nl: 'Het cijferslot van het fort is beveiligd. Misschien kun je fijn meelpoeder uit de cantina-keuken gebruiken om vette vingerafdrukken te onthullen!',
            en: 'The fortress keypad is locked. Perhaps fine flour powder from the cantina kitchen could reveal greasy fingerprints!'
          },
          lang
        );
      } else if (!engine.laserTripwireDisabled) {
        engine.say(
          'penny',
          'Monkey Penny',
          {
            nl: 'Er blokkeert een dodelijke infrarood laserstraal de bunker gang. Vraag Professor Quack naar de Laser-Tandenstoker!',
            en: 'A lethal infrared laser tripwire blocks the bunker hallway. Ask Professor Quack about the Laser Toothpick!'
          },
          lang
        );
      } else {
        engine.say(
          'penny',
          'Monkey Penny',
          {
            nl: 'Je bent in de lanceersilo! Gebruik je gadgets om de raket te ontmantelen en bevrijd Meneer Udderly uit de kooi!',
            en: 'You are inside the silo! Use your gadgets to disarm the missile and liberate Mr. Udderly from the cage!'
          },
          lang
        );
      }
    }
  };

  const handleAskQuack = (type: 'laser' | 'gadgets') => {
    if (!engineRef.current) return;
    const engine = engineRef.current;
    if (type === 'laser') {
      engine.say(
        'quack',
        'Professor Quack',
        {
          nl: 'Kwak! Mijn Laser-Tandenstoker zendt een geconcentreerde plasmastraal uit. Richt hem op de laserelementen of cijfersloten om ze onschadelijk te maken!',
          en: 'Quack! My Laser Toothpick emits a concentrated plasma beam. Aim it directly at laser emitters or control boxes to neutralize them!'
        },
        lang
      );
    } else {
      engine.say(
        'quack',
        'Professor Quack',
        {
          nl: 'Kwak! Vergeet niet dat je spionagemunt ook in jukeboxen past, en dat poeder vingerafdrukken zichtbaar maakt! Succes, Fox!',
          en: 'Quack! Remember your spy coin fits inside jukeboxes, and forensic dust reveals fingerprints! Good luck, Fox!'
        },
        lang
      );
    }
  };

  const handleReset = () => {
    if (!engineRef.current) return;
    engineRef.current.resetGame();
  };

  const handleDismissDialog = () => {
    if (!engineRef.current) return;
    engineRef.current.dialog = null;
    spyFoxSpeech.stop();
  };

  // Construct readable SCUMM Sentence line
  const getSentenceLine = () => {
    const verbLabels: Record<VerbType, { nl: string; en: string }> = {
      LOOK_AT: { nl: 'Kijk naar', en: 'Look at' },
      PICK_UP: { nl: 'Pak op', en: 'Pick up' },
      TALK_TO: { nl: 'Praat met', en: 'Talk to' },
      USE: { nl: 'Gebruik', en: 'Use' }
    };

    let sentence = verbLabels[selectedVerb][lang];

    if (activeItem) {
      const itemObj = inventoryList.find(i => i.id === activeItem);
      if (itemObj) {
        sentence += ` ${itemObj.name[lang]}`;
        if (hoveredHotspotName) {
          sentence += lang === 'nl' ? ' op ' : ' on ';
        }
      }
    }

    if (hoveredHotspotName) {
      sentence += ` ${hoveredHotspotName}`;
    }

    return sentence;
  };

  // Character portraits for crisp dialog banner
  const getSpeakerPortrait = (speaker: SpeakerId) => {
    switch (speaker) {
      case 'fox':
        return { emoji: '🦊', color: 'bg-orange-500/20 text-orange-400 border-orange-500/40', title: 'SPY CORP AGENT' };
      case 'penny':
        return { emoji: '🐒', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40', title: 'MOBIELE CONTROLE' };
      case 'quack':
        return { emoji: '🦆', color: 'bg-amber-500/20 text-amber-400 border-amber-500/40', title: 'GADGET LAB' };
      case 'william':
        return { emoji: '🐐', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40', title: 'SUPER-SCHURK' };
      case 'henchman':
        return { emoji: '🕶️', color: 'bg-slate-500/20 text-slate-300 border-slate-500/40', title: 'HANDLANGER' };
      case 'cow':
        return { emoji: '🐄', color: 'bg-rose-500/20 text-rose-300 border-rose-500/40', title: 'KAMPIOENSRUND' };
    }
  };

  // Room details for crystal-clear navigation header
  const getRoomInfo = () => {
    switch (currentRoomName) {
      case 'harbor':
        return {
          title: lang === 'nl' ? 'Haven van Acidophilus' : 'Port of Acidophilus',
          objective: lang === 'nl' ? 'Onderzoek de cantina of open het fort-cijferslot' : 'Explore cantina or crack fortress keypad'
        };
      case 'cantina':
        return {
          title: lang === 'nl' ? 'Griekse Cantina "Ta Vaporia"' : 'Greek Cantina "Ta Vaporia"',
          objective: lang === 'nl' ? 'Onderzoek de jukebox, de keuken en de louche geit' : 'Inspect jukebox, kitchen, and shady henchman'
        };
      case 'cantina_kitchen':
        return {
          title: lang === 'nl' ? 'Cantina Keuken' : 'Cantina Kitchen',
          objective: lang === 'nl' ? 'Pak de zak meelpoeder voor het cijferslot' : 'Take flour powder for fingerprint dusting'
        };
      case 'fortress':
        return {
          title: lang === 'nl' ? 'Geheime Kaasbunker' : 'Secret Cheese Bunker',
          objective: lang === 'nl' ? 'Schakel de infrarood laser-tripwire uit' : 'Disable infrared laser tripwire'
        };
      case 'missile_silo':
        return {
          title: lang === 'nl' ? 'Ondergrondse Melkzuurraket-Silo' : 'Underground Lactose Silo',
          objective: lang === 'nl' ? 'Ontmantel de raket & bevrijd Meneer Udderly!' : 'Disarm the missile & rescue Mr. Udderly!'
        };
      case 'command':
        return {
          title: lang === 'nl' ? 'SPY Watch Communicator' : 'SPY Watch Communicator',
          objective: lang === 'nl' ? 'Satellietverbinding met Penny & Quack' : 'Direct link to Penny & Quack'
        };
      case 'victory':
        return {
          title: lang === 'nl' ? 'Missie Volbracht' : 'Mission Accomplished',
          objective: lang === 'nl' ? 'William the Kid is gearresteerd!' : 'William the Kid is arrested!'
        };
      default:
        return { title: 'Spy Fox Missie', objective: '' };
    }
  };

  const roomInfo = getRoomInfo();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-slate-100 p-2 sm:p-4 font-sans select-none">
      {/* Top Header Bar */}
      <div className="w-full max-w-4xl flex items-center justify-between bg-slate-900/95 border border-slate-800 rounded-t-xl px-4 py-3 shadow-lg">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToLobby}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold transition border border-slate-700 shadow-sm cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{lang === 'nl' ? 'Speelhal Lobby' : 'Arcade Lobby'}</span>
          </button>

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-base sm:text-lg font-bold text-sky-400 tracking-wide flex items-center gap-1.5">
                <span>SPY FOX in "Dry Cereal"</span>
              </span>
              <span className="bg-sky-500/20 text-sky-300 text-[10px] px-2 py-0.5 rounded font-mono border border-sky-500/30 uppercase">
                SCUMM • 1997
              </span>
            </div>
            <span className="text-xs text-slate-400 hidden sm:inline">
              {lang === 'nl'
                ? 'Operatie Melkzuur • Humongous Entertainment • Ron Gilbert'
                : 'Operation Dry Cereal • Humongous Entertainment • Ron Gilbert'}
            </span>
          </div>
        </div>

        {/* Right Action Controls */}
        <div className="flex items-center gap-2">
          {/* SPY Agent Score Badge */}
          <div className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 rounded-lg text-amber-400 font-mono text-xs shadow-sm">
            <Award className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-bold">SPY {score} PTS</span>
          </div>

          {/* Voice Speech Toggle */}
          <button
            onClick={toggleVoice}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition cursor-pointer ${
              isVoiceEnabled
                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
            title={
              lang === 'nl'
                ? isVoiceEnabled
                  ? 'Stemmen Aan (Jan Nonhof Modus): Klik om uit te schakelen'
                  : 'Stemmen Uit: Klik om in te schakelen'
                : isVoiceEnabled
                ? 'Voice Enabled: Click to mute speech'
                : 'Voice Disabled: Click to enable speech'
            }
          >
            {isVoiceEnabled ? (
              <>
                <Mic className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                <span className="hidden sm:inline">{lang === 'nl' ? 'Stemmen: AAN' : 'Voice: ON'}</span>
              </>
            ) : (
              <>
                <MicOff className="w-3.5 h-3.5 text-slate-400" />
                <span className="hidden sm:inline">{lang === 'nl' ? 'Stemmen: UIT' : 'Voice: OFF'}</span>
              </>
            )}
          </button>

          {/* Language Toggle */}
          <button
            onClick={() => setLang(l => (l === 'nl' ? 'en' : 'nl'))}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-semibold text-slate-300 border border-slate-700 cursor-pointer"
            title={lang === 'nl' ? 'Switch to English' : 'Schakel naar Nederlands'}
          >
            <Languages className="w-3.5 h-3.5 text-sky-400" />
            <span>{lang.toUpperCase()}</span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={toggleMute}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 border border-slate-700 cursor-pointer"
            title={isMuted ? 'Geluid Aanzetten' : 'Geluid Dempen'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>

          {/* Reset Game */}
          <button
            onClick={handleReset}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 border border-slate-700 cursor-pointer"
            title={lang === 'nl' ? 'Herstart Missie' : 'Restart Mission'}
          >
            <RotateCcw className="w-4 h-4 text-amber-400" />
          </button>

          {/* History Dossier Modal */}
          <button
            onClick={() => setShowHistoryModal(true)}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-sky-950 hover:bg-sky-900 border border-sky-500/40 rounded-lg text-xs font-semibold text-sky-300 cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span className="hidden md:inline">{lang === 'nl' ? 'Dossier' : 'Dossier'}</span>
          </button>
        </div>
      </div>

      {/* Main Adventure Frame with CRT Glass and Overlay */}
      <div className="relative w-full max-w-4xl bg-slate-900 border-x border-b border-slate-800 p-2 sm:p-4 rounded-b-xl shadow-2xl flex flex-col items-center">
        {/* Crystal-Clear Location & Objective Breadcrumb Bar */}
        <div className="w-full mb-2 bg-slate-950/80 border border-slate-800 rounded-lg px-3 py-1.5 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-sky-400 shrink-0" />
            <span className="font-bold text-slate-200">{roomInfo.title}</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-400 text-[11px] truncate max-w-md hidden sm:flex">
            <Target className="w-3 h-3 text-amber-400 shrink-0" />
            <span>{roomInfo.objective}</span>
          </div>
        </div>

        {/* CRT Display Container */}
        <div className="relative w-full aspect-[16/10] max-h-[560px] bg-black rounded-lg overflow-hidden border-4 border-slate-800 shadow-[inset_0_0_20px_rgba(0,0,0,0.8)]">
          <canvas
            ref={canvasRef}
            width={SF_VIRTUAL_WIDTH}
            height={SF_VIRTUAL_HEIGHT}
            onClick={handleCanvasClick}
            onMouseMove={handleMouseMove}
            className="w-full h-full object-contain cursor-crosshair"
            style={{ imageRendering: 'pixelated' }}
          />

          {/* High-Resolution Crystal-Clear Dialogue Overlay */}
          {dialogState && (
            <div
              onClick={handleDismissDialog}
              className="absolute top-2 sm:top-4 left-2 sm:left-4 right-2 sm:right-4 bg-slate-950/95 border-2 border-sky-400 rounded-xl p-3 sm:p-4 shadow-[0_8px_30px_rgba(0,0,0,0.9)] backdrop-blur-sm z-30 transition-all cursor-pointer animate-in fade-in slide-in-from-top-2"
            >
              <div className="flex items-start gap-3">
                {/* Character Speaker Portrait with Talking Waves */}
                {(() => {
                  const portrait = getSpeakerPortrait(dialogState.speaker);
                  return (
                    <div className="relative shrink-0">
                      <div className={`w-11 h-11 sm:w-13 sm:h-13 rounded-xl flex items-center justify-center text-2xl border-2 ${portrait.color} shadow-inner`}>
                        {portrait.emoji}
                      </div>
                      {isSpeaking && (
                        <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-slate-950 rounded-full p-0.5 animate-bounce">
                          <Radio className="w-3 h-3 text-slate-950" />
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* Speaker Text - Crystal Clear, High Contrast, Large Font */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-amber-400 font-bold text-sm sm:text-base tracking-wide font-mono">
                        {dialogState.speakerName}
                      </span>
                      {isSpeaking && (
                        <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-mono bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-500/30">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                          <span>{lang === 'nl' ? 'SPREEKT' : 'SPEAKING'}</span>
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">
                      {lang === 'nl' ? 'Klik om over te slaan' : 'Click to skip'}
                    </span>
                  </div>
                  <p className="text-slate-100 text-sm sm:text-base md:text-lg leading-snug font-medium drop-shadow-sm">
                    "{dialogState.text}"
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* DEDICATED HIGH-RES SPY WATCH SCREEN (Command Room) */}
          {currentRoomName === 'command' && (
            <div className="absolute inset-0 bg-slate-950/95 p-4 sm:p-6 flex flex-col justify-between z-20 overflow-y-auto animate-in fade-in">
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-emerald-500/30">
                <div className="flex items-center gap-2.5">
                  <div className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
                  <span className="text-emerald-400 font-mono font-bold text-sm sm:text-base tracking-wider uppercase">
                    SPY WATCH v4.2 • SAT-LINK ACTIEF
                  </span>
                </div>
                <button
                  onClick={handleCloseSpyWatch}
                  className="flex items-center gap-1.5 px-3 py-1 bg-red-950/80 hover:bg-red-900 border border-red-500/50 text-red-200 rounded-lg text-xs font-bold transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                  <span>{lang === 'nl' ? 'Sluit Horloge' : 'Close Watch'}</span>
                </button>
              </div>

              {/* Central Video Comms Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-auto py-2">
                {/* Monkey Penny Card */}
                <div className="bg-emerald-950/40 border-2 border-emerald-500/40 rounded-xl p-4 flex flex-col items-center text-center shadow-lg backdrop-blur-sm">
                  <div className="w-16 h-16 rounded-2xl bg-amber-900/40 border border-amber-500/40 flex items-center justify-center text-3xl mb-2 shadow-inner">
                    🐒
                  </div>
                  <h4 className="text-emerald-300 font-bold text-base font-mono">MONKEY PENNY</h4>
                  <p className="text-xs text-emerald-400/80 mb-3 font-mono">
                    {lang === 'nl' ? 'Mobiele Communicatie & Missieleiding' : 'Mobile Comms & HQ Support'}
                  </p>
                  <div className="w-full space-y-2">
                    <button
                      onClick={() => handleAskPenny('mission')}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-emerald-900/70 hover:bg-emerald-800 text-emerald-100 rounded-lg text-xs font-bold border border-emerald-500/40 transition cursor-pointer"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{lang === 'nl' ? 'Wat is mijn missie?' : 'What is my mission?'}</span>
                    </button>
                    <button
                      onClick={() => handleAskPenny('hint')}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-slate-200 rounded-lg text-xs font-bold border border-slate-700 transition cursor-pointer"
                    >
                      <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                      <span>{lang === 'nl' ? 'Geef me een tactische hint' : 'Give me a tactical hint'}</span>
                    </button>
                  </div>
                </div>

                {/* Professor Quack Card */}
                <div className="bg-emerald-950/40 border-2 border-emerald-500/40 rounded-xl p-4 flex flex-col items-center text-center shadow-lg backdrop-blur-sm">
                  <div className="w-16 h-16 rounded-2xl bg-sky-900/40 border border-sky-500/40 flex items-center justify-center text-3xl mb-2 shadow-inner">
                    🦆
                  </div>
                  <h4 className="text-emerald-300 font-bold text-base font-mono">PROFESSOR QUACK</h4>
                  <p className="text-xs text-emerald-400/80 mb-3 font-mono">
                    {lang === 'nl' ? 'Hoofd Gadget Lab & Uitvindingen' : 'Chief Gadget Engineer'}
                  </p>
                  <div className="w-full space-y-2">
                    <button
                      onClick={() => handleAskQuack('laser')}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-emerald-900/70 hover:bg-emerald-800 text-emerald-100 rounded-lg text-xs font-bold border border-emerald-500/40 transition cursor-pointer"
                    >
                      <Zap className="w-3.5 h-3.5 text-yellow-400" />
                      <span>{lang === 'nl' ? 'Hoe werkt de Laser-Tandenstoker?' : 'Laser Toothpick manual'}</span>
                    </button>
                    <button
                      onClick={() => handleAskQuack('gadgets')}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-slate-200 rounded-lg text-xs font-bold border border-slate-700 transition cursor-pointer"
                    >
                      <HelpCircle className="w-3.5 h-3.5 text-sky-400" />
                      <span>{lang === 'nl' ? 'Algemene gadget tips' : 'General gadget advice'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Bottom Return Button */}
              <div className="pt-2 text-center">
                <button
                  onClick={handleCloseSpyWatch}
                  className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-xl border border-emerald-300 shadow-lg transition cursor-pointer"
                >
                  {lang === 'nl' ? 'Terug naar de Missie' : 'Return to Mission'}
                </button>
              </div>
            </div>
          )}

          {/* DEDICATED HIGH-RES VICTORY SCREEN */}
          {currentRoomName === 'victory' && (
            <div className="absolute inset-0 bg-slate-950/95 p-6 flex flex-col items-center justify-center text-center z-20 animate-in zoom-in-95">
              <div className="w-20 h-20 rounded-full bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center text-4xl mb-3 shadow-[0_0_30px_rgba(251,191,36,0.3)] animate-bounce">
                🏆
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-amber-400 tracking-wide font-mono uppercase mb-2">
                {lang === 'nl' ? 'MISSIE VOLBRACHT!' : 'MISSION ACCOMPLISHED!'}
              </h2>
              <p className="text-base sm:text-lg text-slate-100 font-semibold max-w-lg mb-2">
                {lang === 'nl'
                  ? 'William the Kid is gearresteerd en de melk van de wereld is gered!'
                  : 'William the Kid is captured and the world\'s milk supply is saved!'}
              </p>
              <p className="text-xs sm:text-sm text-slate-400 max-w-md mb-4">
                {lang === 'nl'
                  ? 'Meneer Udderly en alle kampioenskoeien zijn bevrijd. SPY Corp dankt je voor je meesterlijke spionagediensten.'
                  : 'Mr. Udderly and the dairy cows are safe. SPY Corp honors your masterclass detective skills.'}
              </p>

              <div className="bg-slate-900 border border-amber-500/40 px-5 py-2.5 rounded-xl font-mono text-amber-400 text-base font-bold mb-5 shadow-inner">
                {lang === 'nl' ? `EINDSTAND: ${score} SPY PUNTEN • MEESTER SPION` : `FINAL SCORE: ${score} SPY PTS • MASTER SPY`}
              </div>

              <button
                onClick={handleReset}
                className="flex items-center gap-2 px-6 py-3 bg-sky-600 hover:bg-sky-500 text-white font-bold text-sm sm:text-base rounded-xl border border-sky-300 shadow-lg transition cursor-pointer"
              >
                <RotateCcw className="w-5 h-5" />
                <span>{lang === 'nl' ? 'Speel de Missie Opnieuw' : 'Play Mission Again'}</span>
              </button>
            </div>
          )}

          {/* Floating Hotspot Hover Tooltip in Playable Rooms */}
          {hoveredHotspotName && currentRoomName !== 'command' && currentRoomName !== 'victory' && !dialogState && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-slate-950/90 border border-sky-400/80 px-3 py-1 rounded-full text-xs font-mono text-sky-300 shadow-lg backdrop-blur-sm pointer-events-none z-10 animate-in fade-in">
              <span className="text-amber-400 font-bold mr-1.5">👉</span>
              <span className="font-semibold">{hoveredHotspotName}</span>
            </div>
          )}

          {/* Subtle CRT Overlay lines */}
          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_65%,rgba(0,0,0,0.4)_100%)]" />
        </div>

        {/* Crystal-Clear SCUMM Action Bar (Verb Grid + Sentence Line + Inventory) */}
        {currentRoomName !== 'command' && currentRoomName !== 'victory' && (
          <div className="w-full mt-3 bg-slate-950/90 border border-slate-800 rounded-xl p-3 shadow-xl">
            {/* Sentence Line with active command readout */}
            <div className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap">
                <span className="text-slate-400 text-xs font-mono uppercase tracking-wider">
                  {lang === 'nl' ? 'Actie:' : 'Action:'}
                </span>
                <span className="text-sky-400 font-mono font-bold text-sm sm:text-base">
                  {getSentenceLine()}
                </span>
              </div>
              <div className="text-[11px] text-slate-500 font-mono hidden sm:inline">
                SCUMM IV / SPUTM
              </div>
            </div>

            {/* Bottom Row: Verbs & Inventory Items */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
              {/* 4 SCUMM Verbs */}
              <div className="md:col-span-4 grid grid-cols-2 gap-1.5">
                <button
                  onClick={() => handleSelectVerb('LOOK_AT')}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-bold font-mono transition border cursor-pointer ${
                    selectedVerb === 'LOOK_AT' && !activeItem
                      ? 'bg-sky-600 text-white border-sky-400 shadow-md'
                      : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-700'
                  }`}
                >
                  {lang === 'nl' ? '👁️ KIJK NAAR' : '👁️ LOOK AT'}
                </button>
                <button
                  onClick={() => handleSelectVerb('PICK_UP')}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-bold font-mono transition border cursor-pointer ${
                    selectedVerb === 'PICK_UP' && !activeItem
                      ? 'bg-sky-600 text-white border-sky-400 shadow-md'
                      : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-700'
                  }`}
                >
                  {lang === 'nl' ? '✋ PAK OP' : '✋ PICK UP'}
                </button>
                <button
                  onClick={() => handleSelectVerb('TALK_TO')}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-bold font-mono transition border cursor-pointer ${
                    selectedVerb === 'TALK_TO' && !activeItem
                      ? 'bg-sky-600 text-white border-sky-400 shadow-md'
                      : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-700'
                  }`}
                >
                  {lang === 'nl' ? '💬 PRAAT MET' : '💬 TALK TO'}
                </button>
                <button
                  onClick={() => handleSelectVerb('USE')}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-bold font-mono transition border cursor-pointer ${
                    selectedVerb === 'USE' && !activeItem
                      ? 'bg-sky-600 text-white border-sky-400 shadow-md'
                      : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-700'
                  }`}
                >
                  {lang === 'nl' ? '⚙️ GEBRUIK' : '⚙️ USE'}
                </button>
              </div>

              {/* Inventory Slots (SPY Gadgets) */}
              <div className="md:col-span-6 flex flex-wrap items-center gap-2">
                <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block w-full sm:w-auto">
                  {lang === 'nl' ? 'SPY GADGETS:' : 'SPY GADGETS:'}
                </span>
                {inventoryList.map(item => {
                  const isSelected = activeItem === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSelectInventoryItem(item.id)}
                      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition cursor-pointer ${
                        isSelected
                          ? 'bg-amber-600 text-white border-amber-300 shadow-md ring-2 ring-amber-400/50'
                          : 'bg-slate-900 hover:bg-slate-800 text-slate-200 border-slate-700'
                      }`}
                      title={item.description[lang]}
                    >
                      <span className="text-base">{item.icon}</span>
                      <span className="font-semibold">{item.name[lang]}</span>
                    </button>
                  );
                })}
              </div>

              {/* Direct SPY Watch Button */}
              <div className="md:col-span-2 flex justify-end">
                <button
                  onClick={handleOpenSpyWatch}
                  className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-900/80 hover:bg-emerald-800 text-emerald-200 border border-emerald-500/50 rounded-lg text-xs font-bold transition shadow-sm cursor-pointer"
                >
                  <Clock className="w-3.5 h-3.5 text-emerald-400" />
                  <span>SPY WATCH</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Quick Instructions / Gameplay Keys */}
        <div className="w-full mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-slate-400">
          <div className="bg-slate-800/60 border border-slate-700/60 rounded-lg p-2.5 flex items-center gap-2">
            <span className="text-xl">🖱️</span>
            <div>
              <span className="font-semibold text-slate-200 block">
                {lang === 'nl' ? 'Point-and-Click Besturing' : 'Point-and-Click Controls'}
              </span>
              <span>{lang === 'nl' ? 'Klik om te lopen en hotspots te onderzoeken' : 'Click to walk and interact with hotspots'}</span>
            </div>
          </div>

          <div className="bg-slate-800/60 border border-slate-700/60 rounded-lg p-2.5 flex items-center gap-2">
            <span className="text-xl">🎙️</span>
            <div>
              <span className="font-semibold text-slate-200 block">
                {lang === 'nl' ? 'Echte Stemmen (Jan Nonhof Modus)' : 'Real Voices (Voice Synthesis)'}
              </span>
              <span>{lang === 'nl' ? 'Acteerstemmen voor Fox, Penny & Quack' : 'Spoken character voices for Fox, Penny & Quack'}</span>
            </div>
          </div>

          <div className="bg-slate-800/60 border border-slate-700/60 rounded-lg p-2.5 flex items-center gap-2">
            <span className="text-xl">⚡</span>
            <div>
              <span className="font-semibold text-slate-200 block">
                {lang === 'nl' ? 'Laser & Meelpoeder Puzzels' : 'Laser & Flour Puzzles'}
              </span>
              <span>{lang === 'nl' ? 'Vind meelpoeder in de keuken voor de code' : 'Find flour in the kitchen to reveal code'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Historical Dossier Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-sky-500/40 rounded-2xl max-w-2xl w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🦊</span>
                <div>
                  <h3 className="text-lg font-bold text-sky-400">
                    Spy Fox in "Dry Cereal" (1997)
                  </h3>
                  <p className="text-xs text-slate-400">
                    Humongous Entertainment • Ron Gilbert • SCUMM / SPUTM
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="text-slate-400 hover:text-white text-lg font-bold px-2 py-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed">
              <p>
                {lang === 'nl'
                  ? 'Spy Fox in "Dry Cereal" (in Nederland uitgebracht als Operatie Melkzuur) is een van de meest geliefde point-and-click avonturen aller tijden. Het spel werd ontworpen door Ron Gilbert, de legendarische bedenker van Monkey Island en Maniac Mansion, en oprichter van Humongous Entertainment.'
                  : 'Spy Fox in "Dry Cereal" is one of the most beloved point-and-click adventure games ever created. Designed by Ron Gilbert, legendary creator of The Secret of Monkey Island and Maniac Mansion, it brought satiric secret agent parodies to family-friendly gaming.'}
              </p>

              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-2">
                <h4 className="font-bold text-amber-400 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" />
                  {lang === 'nl' ? 'Nederlandse Stemmencast (Nostalgie)' : 'Legendary Voice Acting'}
                </h4>
                <p>
                  {lang === 'nl'
                    ? 'In de iconische Nederlandse vertaling werd Spy Fox ingesproken door Jan Nonhof (bekend van o.a. Octo Tentakel in SpongeBob). William the Kid werd vertolkt door Fred Meijer, Monkey Penny door Beatrijs Sluijter, en Professor Quack door Stan Limburg. Deze recreatie brengt de stemmen opnieuw tot leven via browser voice synthesis!'
                    : 'The game featured top-tier voice actors delivering deadpan James Bond parodies. Spy Fox was voiced by Howard Morris and Mike Madeoy, matching witty British secret agent swagger with hilarious gadgetry.'}
                </p>
              </div>

              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-2">
                <h4 className="font-bold text-sky-400 flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  {lang === 'nl' ? 'SCUMM & SPUTM Engine Innovatie' : 'SCUMM & SPUTM Innovation'}
                </h4>
                <p>
                  {lang === 'nl'
                    ? 'Spy Fox draaide op een gemoderniseerde versie van de SCUMM engine (SPUTM). Het revolutionaire element was dat het spel bij elke nieuwe speelsessie de puzzelpaden willekeurig samenstelde, zodat spelers andere routes naar William the Kid moesten ontdekken.'
                    : 'Spy Fox utilized an upgraded branch of the SCUMM scripting engine named SPUTM. Its defining innovation was branching puzzle paths randomized on each playthrough, ensuring replayability and unpredictable solutions.'}
                </p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setShowHistoryModal(false)}
                className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold rounded-lg cursor-pointer"
              >
                {lang === 'nl' ? 'Sluit Dossier' : 'Close Dossier'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
