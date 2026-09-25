/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Trophy, 
  HelpCircle, 
  Sparkles, 
  Globe, 
  Users, 
  Lightbulb, 
  Flame, 
  CheckCircle2, 
  XCircle,
  Plus
} from 'lucide-react';
import { 
  HangmanEngine, 
  HangmanLanguage, 
  HangmanDifficulty, 
  HangmanCategory, 
  HangmanMode 
} from '../game/hangmanEngine';
import { 
  getHangmanHighScores, 
  saveHangmanHighScore, 
  HangmanScoreEntry 
} from '../game/hangmanHighScores';
import { HangmanHistoryModal } from './HangmanHistoryModal';
import { haptics } from '../utils/haptics';

interface HangmanCabinetProps {
  onBackToLobby: () => void;
}

const QWERTY_ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['Z', 'X', 'C', 'V', 'B', 'N', 'M']
];

export const HangmanCabinet: React.FC<HangmanCabinetProps> = ({ onBackToLobby }) => {
  const [engine] = useState(() => new HangmanEngine('nl', 'medium'));
  const [, setTick] = useState(0);

  const [isMuted, setIsMuted] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showScoresModal, setShowScoresModal] = useState(false);
  const [highScores, setHighScores] = useState<HangmanScoreEntry[]>([]);

  // Custom word modal for 2-player pass-and-play
  const [showCustomWordModal, setShowCustomWordModal] = useState(false);
  const [customWordInput, setCustomWordInput] = useState('');
  const [customCategoryInput, setCustomCategoryInput] = useState('');
  const [customHintInput, setCustomHintInput] = useState('');

  const rerender = () => setTick(t => t + 1);

  // Initialize
  useEffect(() => {
    setHighScores(getHangmanHighScores());
  }, []);

  // Physical Keyboard listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showHistoryModal || showScoresModal || showCustomWordModal) return;
      const key = e.key.toUpperCase();
      if (/^[A-Z]$/.test(key)) {
        handleGuess(key);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showHistoryModal, showScoresModal, showCustomWordModal]);

  // Save High Score on Win
  useEffect(() => {
    if (engine.phase === 'won' && engine.gameMode === 'solitaire') {
      const updated = saveHangmanHighScore({
        initials: 'YOU',
        score: engine.score,
        word: engine.targetWord,
        difficulty: engine.difficulty.toUpperCase(),
        date: new Date().toISOString().split('T')[0],
        language: engine.language,
        note: `Streak: ${engine.winStreak}x • ${engine.wordCategory}`
      });
      setHighScores(updated);
    }
  }, [engine.phase]);

  const handleGuess = (letter: string) => {
    if (engine.phase !== 'playing') return;
    const res = engine.guessLetter(letter, !isMuted);
    if (!res.isAlreadyGuessed) {
      if (res.isCorrect) haptics.light();
      else haptics.medium();
    }
    rerender();
  };

  const handleReset = () => {
    engine.initGame();
    if (!isMuted) engine.playPaperTear();
    haptics.selection();
    rerender();
  };

  const handleLanguageChange = (lang: HangmanLanguage) => {
    engine.language = lang;
    engine.initGame();
    haptics.selection();
    rerender();
  };

  const handleDifficultyChange = (diff: HangmanDifficulty) => {
    engine.difficulty = diff;
    engine.initGame();
    haptics.selection();
    rerender();
  };

  const handleCategoryChange = (cat: HangmanCategory) => {
    engine.category = cat;
    engine.initGame();
    haptics.selection();
    rerender();
  };

  const handleRevealHint = () => {
    engine.revealHint();
    if (!isMuted) engine.playPenScratch();
    haptics.selection();
    rerender();
  };

  const handleStartCustomWord = () => {
    if (!customWordInput.trim()) return;
    engine.initGame(customWordInput, customCategoryInput, customHintInput);
    setShowCustomWordModal(false);
    setCustomWordInput('');
    setCustomCategoryInput('');
    setCustomHintInput('');
    rerender();
  };

  const wrongCount = engine.wrongGuesses.length;

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-start p-2 sm:p-4 select-none bg-slate-950 text-slate-100 overflow-x-hidden font-sans">
      
      {/* Top Header */}
      <header className="w-full max-w-5xl bg-slate-900/90 border border-sky-600/30 backdrop-blur-md px-4 py-2.5 flex items-center justify-between sticky top-0 z-30 shadow-md rounded-2xl mb-3">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToLobby}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-sky-500 text-xs font-mono font-semibold transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-sky-400" />
            <span>Lobby</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="text-xl">✍️</span>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-sm tracking-wide text-sky-300">
                  GALGJE OP RUITJESPAPIER (1894)
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-700/50">
                  WISKUNDESCHRIFT
                </span>
              </div>
              <span className="text-[11px] font-mono text-slate-400 hidden sm:block">
                Klassiek Klaslokaal Papier &amp; Pen Woordpuzzelspel
              </span>
            </div>
          </div>
        </div>

        {/* Top Right Controls */}
        <div className="flex items-center gap-2">
          {/* Language Switcher */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-mono">
            <button
              onClick={() => handleLanguageChange('nl')}
              className={`px-2 py-1 rounded-lg transition-all cursor-pointer font-bold ${
                engine.language === 'nl' ? 'bg-sky-500 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              🇳🇱 NL
            </button>
            <button
              onClick={() => handleLanguageChange('en')}
              className={`px-2 py-1 rounded-lg transition-all cursor-pointer font-bold ${
                engine.language === 'en' ? 'bg-sky-500 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              🇬🇧 EN
            </button>
          </div>

          <button
            onClick={() => setShowScoresModal(true)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 hover:border-amber-400 text-xs font-mono transition-colors cursor-pointer"
          >
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Records</span>
          </button>

          <button
            onClick={() => setShowHistoryModal(true)}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 hover:border-sky-400 transition-colors cursor-pointer"
            title="Dossier &amp; Spelregels"
          >
            <HelpCircle className="w-4 h-4 text-sky-400" />
          </button>

          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 hover:border-sky-400 transition-colors cursor-pointer"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-sky-400" />}
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="w-full max-w-4xl flex flex-col items-center gap-4 my-2">
        
        {/* Game Mode, Difficulty & Category Options */}
        <div className="w-full bg-slate-900/90 border border-slate-800 rounded-2xl p-3 flex flex-wrap items-center justify-between gap-3 shadow-xl backdrop-blur-md">
          
          {/* Difficulty Tiers */}
          <div className="flex items-center gap-1.5 font-mono text-xs">
            <span className="text-slate-400 text-[11px] hidden sm:inline">Niveau:</span>
            {(['easy', 'medium', 'hard', 'extreme'] as HangmanDifficulty[]).map(diff => (
              <button
                key={diff}
                onClick={() => handleDifficultyChange(diff)}
                className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  engine.difficulty === diff
                    ? 'bg-sky-500 text-slate-950 shadow border border-sky-300'
                    : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700'
                }`}
              >
                {diff === 'easy' ? '3-5 Let' : diff === 'medium' ? '6-8 Let' : diff === 'hard' ? '9-12 Let' : '13+ Let (Extreem)'}
              </button>
            ))}
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-1.5 font-mono text-xs">
            <span className="text-slate-400 text-[11px] hidden sm:inline">Categorie:</span>
            {(['all', 'retro', 'science', 'geography', 'nature'] as HangmanCategory[]).map(cat => (
              <button
                key={cat}
                onClick={() => handleCategoryChange(cat)}
                className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  engine.category === cat
                    ? 'bg-blue-600 text-white border border-blue-400'
                    : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700'
                }`}
              >
                {cat === 'all' ? 'Alle' : cat === 'retro' ? 'Retro' : cat === 'science' ? 'Wetenschap' : cat === 'geography' ? 'Aardrijkskunde' : 'Natuur'}
              </button>
            ))}
          </div>

          {/* 2-Player Custom Word Button */}
          <button
            onClick={() => setShowCustomWordModal(true)}
            className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-purple-900/80 hover:bg-purple-800 text-purple-200 border border-purple-600 text-xs font-mono font-bold transition-colors cursor-pointer"
          >
            <Users className="w-3.5 h-3.5 text-purple-300" />
            <span>{engine.language === 'nl' ? '2-Speler Eigen Woord' : '2-Player Custom Word'}</span>
          </button>
        </div>

        {/* AUTHENTIC MATH GRID NOTEPAD (Collegeblok Ruitjespapier) */}
        <div 
          className="relative w-full max-w-3xl rounded-3xl p-5 sm:p-8 border-4 border-slate-300 shadow-[0_20px_50px_rgba(0,0,0,0.8)] flex flex-col items-center select-none overflow-hidden"
          style={{
            backgroundColor: '#f8fafc',
            backgroundImage: `
              linear-gradient(to right, rgba(56, 189, 248, 0.22) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(56, 189, 248, 0.22) 1px, transparent 1px)
            `,
            backgroundSize: '24px 24px'
          }}
        >
          {/* Red Margin Line on Math Paper */}
          <div className="absolute top-0 bottom-0 left-8 sm:left-12 w-0.5 bg-rose-400/60 pointer-events-none" />

          {/* Paper Top Rings / Perforations */}
          <div className="w-full flex justify-between px-6 -mt-3 mb-4 opacity-70">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="w-3 h-3 rounded-full bg-slate-800/80 border border-slate-400 shadow-inner" />
            ))}
          </div>

          {/* Notepad Header Bar */}
          <div className="w-full flex flex-wrap items-center justify-between gap-2 pb-3 mb-4 border-b-2 border-slate-300 font-mono text-slate-800 text-xs pl-8 sm:pl-12">
            <div className="flex items-center gap-2">
              <span className="font-bold text-blue-900">
                🏷️ {engine.language === 'nl' ? 'Categorie:' : 'Category:'} <span className="bg-blue-100 text-blue-900 px-2 py-0.5 rounded font-black border border-blue-300">{engine.wordCategory}</span>
              </span>
              <span className="text-slate-500 font-bold">| {engine.targetWord.length} {engine.language === 'nl' ? 'letters' : 'letters'}</span>
            </div>

            <div className="flex items-center gap-3">
              <span className="font-bold text-emerald-800 flex items-center gap-1">
                <Flame className="w-4 h-4 text-emerald-600" />
                <span>Streak: {engine.winStreak}x</span>
              </span>
              <span className="font-black text-blue-950 text-sm">{engine.score} PTS</span>
            </div>
          </div>

          {/* Middle Main Workspace: Gallows Drawing + Blanks */}
          <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6 items-center pl-8 sm:pl-12 my-2">
            
            {/* Left: Ballpoint Gallows Drawing on Grid */}
            <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white/70 border border-blue-200/80 shadow-sm relative min-h-[220px]">
              
              {/* Ballpoint SVG Hangman Figure */}
              <svg className="w-48 h-48 stroke-current" viewBox="0 0 200 200" fill="none">
                {/* 1. Base Beam */}
                {wrongCount >= 1 && (
                  <line x1="20" y1="180" x2="140" y2="180" stroke="#1e3a8a" strokeWidth="4" strokeLinecap="round" className="animate-draw" />
                )}
                {/* 2. Vertical Pole */}
                {wrongCount >= 2 && (
                  <line x1="50" y1="180" x2="50" y2="20" stroke="#1e3a8a" strokeWidth="4" strokeLinecap="round" />
                )}
                {/* 3. Top Horizontal Beam */}
                {wrongCount >= 3 && (
                  <>
                    <line x1="48" y1="20" x2="130" y2="20" stroke="#1e3a8a" strokeWidth="4" strokeLinecap="round" />
                    <line x1="50" y1="45" x2="75" y2="20" stroke="#1e3a8a" strokeWidth="3" />
                  </>
                )}
                {/* 4. Rope / Noose */}
                {wrongCount >= 4 && (
                  <line x1="120" y1="20" x2="120" y2="48" stroke="#b91c1c" strokeWidth="3" strokeDasharray="3,3" />
                )}
                {/* 5. Head */}
                {wrongCount >= 5 && (
                  <circle cx="120" cy="62" r="14" stroke="#b91c1c" strokeWidth="3.5" fill="#fef2f2" />
                )}
                {/* 6. Torso */}
                {wrongCount >= 6 && (
                  <line x1="120" y1="76" x2="120" y2="120" stroke="#b91c1c" strokeWidth="3.5" strokeLinecap="round" />
                )}
                {/* 7. Left Arm */}
                {wrongCount >= 7 && (
                  <line x1="120" y1="88" x2="95" y2="105" stroke="#b91c1c" strokeWidth="3" strokeLinecap="round" />
                )}
                {/* 8. Right Arm */}
                {wrongCount >= 8 && (
                  <line x1="120" y1="88" x2="145" y2="105" stroke="#b91c1c" strokeWidth="3" strokeLinecap="round" />
                )}
                {/* 9. Left Leg */}
                {wrongCount >= 9 && (
                  <line x1="120" y1="120" x2="98" y2="155" stroke="#b91c1c" strokeWidth="3.5" strokeLinecap="round" />
                )}
                {/* 10. Right Leg (Full Hangman) */}
                {wrongCount >= 10 && (
                  <line x1="120" y1="120" x2="142" y2="155" stroke="#b91c1c" strokeWidth="3.5" strokeLinecap="round" />
                )}
              </svg>

              <span className="text-[11px] font-mono text-slate-600 font-bold mt-1">
                Fouten: <span className="text-rose-600 font-black">{wrongCount} / {engine.maxWrongGuesses}</span>
              </span>
            </div>

            {/* Right: Word Blanks & Category Hints */}
            <div className="flex flex-col items-center justify-center gap-4">
              
              {/* Category Hint Trigger */}
              <div className="flex flex-col items-center gap-1 w-full">
                {engine.isHintRevealed ? (
                  <div className="p-2.5 rounded-xl bg-amber-100 border border-amber-300 text-amber-900 font-mono text-xs text-center w-full shadow-sm animate-fade-in">
                    <span className="font-bold block text-amber-950">💡 Hint:</span>
                    <span>{engine.wordHint}</span>
                  </div>
                ) : (
                  <button
                    onClick={handleRevealHint}
                    disabled={engine.phase !== 'playing'}
                    className="px-3.5 py-1.5 rounded-xl bg-amber-200 hover:bg-amber-300 text-amber-950 border border-amber-400 font-mono font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm cursor-pointer disabled:opacity-50"
                  >
                    <Lightbulb className="w-4 h-4 text-amber-600" />
                    <span>{engine.language === 'nl' ? 'Toon Categorie Hint (-100 PTS)' : 'Show Category Hint'}</span>
                  </button>
                )}
              </div>

              {/* Letter Blanks Container - ALWAYS 1 SINGLE LINE */}
              <div className="w-full flex flex-nowrap items-center justify-center gap-1 sm:gap-1.5 my-2 overflow-x-auto py-2 px-1 max-w-full">
                {engine.getMaskedWord().map((item, idx) => {
                  const len = engine.targetWord.length;
                  const sizeClasses = len <= 5
                    ? 'w-8 h-10 sm:w-11 sm:h-13 text-xl sm:text-2xl border-b-4'
                    : len <= 8
                    ? 'w-7 h-9 sm:w-9 sm:h-11 text-lg sm:text-xl border-b-4'
                    : len <= 12
                    ? 'w-5 sm:w-7 h-8 sm:h-9 text-sm sm:text-base border-b-2'
                    : 'w-4 sm:w-5.5 h-7 sm:h-8 text-xs sm:text-sm border-b-2';

                  return (
                    <div
                      key={idx}
                      className={`
                        shrink-0 ${sizeClasses} flex items-center justify-center font-mono font-black rounded-t transition-all
                        ${item.revealed ? 'border-blue-900 text-blue-950 bg-blue-50/60' : 'border-slate-400 bg-white/40'}
                        ${engine.phase === 'lost' && !item.revealed ? 'border-rose-500 text-rose-700 bg-rose-50 animate-pulse' : ''}
                      `}
                    >
                      {item.revealed ? item.char : (engine.phase === 'lost' ? item.char : '')}
                    </div>
                  );
                })}
              </div>

              {/* Status Banner */}
              {engine.phase !== 'playing' && (
                <div className={`p-3 rounded-2xl border text-center font-mono text-xs w-full shadow-md animate-fade-in ${
                  engine.phase === 'won'
                    ? 'bg-emerald-100 border-emerald-400 text-emerald-950'
                    : 'bg-rose-100 border-rose-400 text-rose-950'
                }`}>
                  <span className="font-black text-sm block">
                    {engine.phase === 'won' ? '🎉 GEFELICITEERD! Het woord is geraden!' : '❌ HELAAS! De galg is compleet.'}
                  </span>
                  <span className="text-[11px] opacity-90 block mt-0.5">
                    Het woord was: <strong className="font-black underline">{engine.targetWord}</strong>
                  </span>
                  <button
                    onClick={handleReset}
                    className="mt-2 px-4 py-1.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 font-mono font-bold text-xs transition-colors cursor-pointer"
                  >
                    Volgend Woord ➔
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Virtual QWERTY Keyboard */}
          <div className="w-full flex flex-col items-center gap-1.5 mt-4 pt-3 border-t-2 border-slate-300 pl-8 sm:pl-12 font-mono">
            <span className="text-[11px] text-slate-500 font-bold mb-0.5">
              {engine.language === 'nl' ? 'Klik op een letter of typ op je toetsenbord:' : 'Click a letter or type on your keyboard:'}
            </span>

            {QWERTY_ROWS.map((row, rIdx) => (
              <div key={rIdx} className="flex justify-center gap-1 sm:gap-1.5 w-full">
                {row.map(letter => {
                  const isGuessed = engine.guessedLetters.has(letter);
                  const isCorrect = isGuessed && engine.targetWord.includes(letter);
                  const isWrong = isGuessed && !engine.targetWord.includes(letter);

                  return (
                    <button
                      key={letter}
                      disabled={isGuessed || engine.phase !== 'playing'}
                      onClick={() => handleGuess(letter)}
                      className={`
                        w-7 h-8 sm:w-9 sm:h-10 rounded-lg font-black text-xs sm:text-sm flex items-center justify-center transition-all cursor-pointer shadow-sm
                        ${!isGuessed ? 'bg-white hover:bg-blue-100 text-slate-900 border border-slate-300 active:scale-95' : ''}
                        ${isCorrect ? 'bg-emerald-600 text-white border border-emerald-400 font-black shadow' : ''}
                        ${isWrong ? 'bg-rose-600 text-white border border-rose-400 opacity-60 line-through' : ''}
                      `}
                    >
                      {letter}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Reset Action Footer */}
          <div className="w-full flex justify-between items-center mt-4 pt-3 border-t border-slate-300 pl-8 sm:pl-12 font-mono text-xs text-slate-600">
            <button
              onClick={handleReset}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold transition-colors cursor-pointer border border-slate-300"
            >
              <RotateCcw className="w-3.5 h-3.5 text-blue-700" />
              <span>{engine.language === 'nl' ? 'Nieuw Woord' : 'New Word'}</span>
            </button>

            <span className="text-[10px] opacity-75">
              *Balpen inkt simulatie op geruit papier (1894)
            </span>
          </div>
        </div>
      </main>

      {/* 2-Player Custom Word Input Modal */}
      {showCustomWordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in font-mono text-xs">
          <div className="bg-slate-900 border-2 border-purple-500/60 rounded-2xl max-w-md w-full p-4 flex flex-col gap-3 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="font-bold text-purple-300 text-sm flex items-center gap-2">
                <Users className="w-4 h-4 text-purple-400" />
                <span>2-Speler Paspas &amp; Speel</span>
              </span>
              <button
                onClick={() => setShowCustomWordModal(false)}
                className="w-7 h-7 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-slate-300 text-[11px]">
              Speler 1: Voer in het geheim een woord in voor Speler 2 om te raden!
            </p>

            <div className="space-y-2">
              <div>
                <label className="text-slate-400 block mb-1">Geheim Woord (min. 3 letters):</label>
                <input
                  type="password"
                  value={customWordInput}
                  onChange={(e) => setCustomWordInput(e.target.value.toUpperCase())}
                  placeholder="bijv. VULKAAN"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2 text-white font-bold tracking-widest focus:border-purple-400 outline-none"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Categorie (optioneel):</label>
                <input
                  type="text"
                  value={customCategoryInput}
                  onChange={(e) => setCustomCategoryInput(e.target.value)}
                  placeholder="bijv. Vakantie"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2 text-white focus:border-purple-400 outline-none"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Hint (optioneel):</label>
                <input
                  type="text"
                  value={customHintInput}
                  onChange={(e) => setCustomHintInput(e.target.value)}
                  placeholder="bijv. Hete berg"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2 text-white focus:border-purple-400 outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setShowCustomWordModal(false)}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer font-bold"
              >
                Annuleren
              </button>
              <button
                onClick={handleStartCustomWord}
                disabled={customWordInput.trim().length < 3}
                className="px-4 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white cursor-pointer font-bold disabled:opacity-50"
              >
                Start Spel ➔
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rules & History Dossier Modal */}
      {showHistoryModal && (
        <HangmanHistoryModal
          onClose={() => setShowHistoryModal(false)}
          lang={engine.language}
        />
      )}

      {/* Leaderboard Modal */}
      {showScoresModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in font-mono text-xs">
          <div className="bg-slate-900 border-2 border-sky-500/60 rounded-2xl max-w-lg w-full flex flex-col shadow-2xl">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-sky-300 text-sm">
                <Trophy className="w-5 h-5 text-amber-400" />
                <span>Galgje op Ruitjespapier Records</span>
              </div>
              <button
                onClick={() => setShowScoresModal(false)}
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-4 space-y-2 max-h-[60vh] overflow-y-auto">
              {highScores.map((entry, idx) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800"
                >
                  <div className="flex items-center gap-2.5">
                    <span className={`w-6 h-6 rounded flex items-center justify-center font-bold text-xs ${
                      idx === 0 ? 'bg-amber-500 text-slate-950' : idx === 1 ? 'bg-slate-300 text-slate-950' : idx === 2 ? 'bg-amber-700 text-white' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {idx + 1}
                    </span>
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-200">{entry.initials} ({entry.word})</span>
                      <span className="text-[10px] text-slate-400">{entry.note || entry.difficulty}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-sky-400 font-bold">{entry.score} PTS</span>
                    <span className="text-[10px] text-slate-500">{entry.date}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setShowScoresModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer font-bold"
              >
                Sluiten
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
