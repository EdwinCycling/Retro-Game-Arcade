import React from 'react';
import { Difficulty } from '../types';
import { DIFFICULTY_TUNING } from '../game/levels';
import { Zap, Gauge, Clock, ShieldCheck } from 'lucide-react';

interface DifficultyModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentDifficulty: Difficulty;
  currentLevel: number;
  onSelectDifficulty: (difficulty: Difficulty, level: number) => void;
}

export const DifficultyModal: React.FC<DifficultyModalProps> = ({
  isOpen,
  onClose,
  currentDifficulty,
  currentLevel,
  onSelectDifficulty
}) => {
  const [selectedDiff, setSelectedDiff] = React.useState<Difficulty>(currentDifficulty);
  const [selectedLvl, setSelectedLvl] = React.useState<number>(currentLevel);

  if (!isOpen) return null;

  const handleApply = () => {
    onSelectDifficulty(selectedDiff, selectedLvl);
    onClose();
  };

  const tuning = DIFFICULTY_TUNING[selectedDiff];

  const levels = [
    { num: 1, name: 'Level 1 (Kers / Cherry)', pts: '100 pt' },
    { num: 2, name: 'Level 2 (Aardbei / Strawberry)', pts: '300 pt' },
    { num: 3, name: 'Level 3-4 (Perzik / Peach)', pts: '500 pt' },
    { num: 5, name: 'Level 5-6 (Appel / Apple)', pts: '700 pt' },
    { num: 7, name: 'Level 7-8 (Meloen / Melon)', pts: '1000 pt' },
    { num: 9, name: 'Level 9-10 (Galaxian Schip)', pts: '2000 pt' },
    { num: 11, name: 'Level 11-12 (Klok / Bell)', pts: '3000 pt' },
    { num: 13, name: 'Level 13+ (Sleutel / Key)', pts: '5000 pt' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-xs p-4 select-none">
      <div className="bg-black border-2 border-yellow-400 rounded-2xl max-w-lg w-full p-6 text-white shadow-[0_0_50px_rgba(234,179,8,0.25)] space-y-5 animate-in fade-in zoom-in-95 duration-200">
        <div className="text-center space-y-1 border-b border-gray-900 pb-3">
          <span className="text-pink-500 text-[10px] font-bold tracking-widest uppercase block">
            GAME SETTINGS & SNELHEIDSTUNING
          </span>
          <h2 className="text-yellow-300 font-bold tracking-wider font-['Press_Start_2P'] text-[13px] sm:text-[14px]">
            MOEILIJKHEID & LEVEL
          </h2>
          <p className="text-neutral-400 text-xs">
            Pas het speltempo, spokengedrag en startniveau aan.
          </p>
        </div>

        {/* Difficulty Selection */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-pink-500 uppercase tracking-widest block">
            Moeilijkheidsgraad
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'casual' as Difficulty, label: 'EASY', desc: 'Rustigere spoken (-25%)' },
              { id: 'classic' as Difficulty, label: 'CLASSIC', desc: '100% Origineel 1980' },
              { id: 'turbo' as Difficulty, label: 'EXPERT', desc: 'Turbo snelheid (+15%)' },
            ].map((d) => (
              <button
                key={d.id}
                type="button"
                onClick={() => setSelectedDiff(d.id)}
                className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                  selectedDiff === d.id
                    ? d.id === 'casual'
                      ? 'border-blue-500 bg-blue-950/80 text-blue-300 shadow-[0_0_15px_rgba(37,99,235,0.4)]'
                      : d.id === 'classic'
                      ? 'border-yellow-400 bg-yellow-400 text-black shadow-[0_0_15px_rgba(250,204,21,0.4)] font-bold'
                      : 'border-red-500 bg-red-950/80 text-red-300 shadow-[0_0_15px_rgba(239,68,68,0.4)]'
                    : 'border-neutral-900 bg-neutral-950 hover:bg-neutral-900 text-neutral-400'
                }`}
              >
                <span className="font-bold text-xs">{d.label}</span>
                <span className={`text-[10px] mt-1 ${selectedDiff === d.id && d.id === 'classic' ? 'text-neutral-900' : 'text-neutral-400'}`}>
                  {d.desc}
                </span>
              </button>
            ))}
          </div>

          {/* Detailed Speed Tuning Specs Card */}
          <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-xl space-y-2 mt-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-white flex items-center gap-1.5">
                <Gauge className="w-3.5 h-3.5 text-yellow-400" />
                {tuning.name}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded font-semibold bg-neutral-900 text-cyan-300 border border-neutral-800">
                {tuning.badge}
              </span>
            </div>
            
            <p className="text-[11px] text-neutral-400 leading-relaxed">
              {tuning.description}
            </p>

            <div className="grid grid-cols-3 gap-2 pt-1 border-t border-neutral-900 text-[10px]">
              <div>
                <span className="text-neutral-500 block">Snelheid Spoken:</span>
                <span className={`font-bold ${selectedDiff === 'casual' ? 'text-blue-400' : selectedDiff === 'turbo' ? 'text-red-400' : 'text-yellow-400'}`}>
                  {tuning.ghostSpeedPct}
                </span>
              </div>
              <div>
                <span className="text-neutral-500 block">Pac-Man Wendbaarheid:</span>
                <span className="text-emerald-400 font-bold">
                  {tuning.pacmanSpeedPct}
                </span>
              </div>
              <div>
                <span className="text-neutral-500 block">Blauwe Spookduur:</span>
                <span className="text-cyan-400 font-bold">
                  {tuning.frightenedTime}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Level Select */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-blue-400 uppercase tracking-widest block">
            Start Level (Vrucht & Bonus)
          </label>
          <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-1">
            {levels.map((lvl) => (
              <button
                key={lvl.num}
                type="button"
                onClick={() => setSelectedLvl(lvl.num)}
                className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                  selectedLvl === lvl.num
                    ? 'border-cyan-400 bg-cyan-950/70 text-cyan-300 font-bold shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                    : 'border-neutral-900 bg-neutral-950 hover:bg-neutral-900 text-neutral-400'
                }`}
              >
                <div className="text-[11px] truncate">{lvl.name}</div>
                <div className="text-[9px] text-neutral-500">{lvl.pts}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-900">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-medium text-neutral-400 hover:text-white hover:bg-neutral-900 transition-colors"
          >
            Annuleren
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="px-5 py-2.5 rounded-lg text-xs font-black uppercase tracking-wider bg-yellow-400 text-black hover:bg-yellow-300 shadow-[0_0_20px_rgba(250,204,21,0.5)] transition-transform active:scale-95 cursor-pointer"
          >
            Toepassen & Herstart
          </button>
        </div>
      </div>
    </div>
  );
};

