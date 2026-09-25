import React from 'react';
import { Card, CardBackTheme } from '../game/patienceTypes';
import { SUIT_SYMBOLS, RANK_NAMES, getCardColor } from '../game/patienceEngine';

interface PatienceCardProps {
  card: Card;
  isDragging?: boolean;
  isSelected?: boolean;
  isHinted?: boolean;
  cardBackTheme?: CardBackTheme;
  onClick?: (e: React.MouseEvent) => void;
  onDoubleClick?: (e: React.MouseEvent) => void;
  onDragStart?: (e: React.DragEvent) => void;
  className?: string;
}

export const PatienceCard: React.FC<PatienceCardProps> = ({
  card,
  isDragging = false,
  isSelected = false,
  isHinted = false,
  cardBackTheme = 'beach',
  onClick,
  onDoubleClick,
  onDragStart,
  className = ''
}) => {
  const isRed = getCardColor(card.suit) === 'red';
  const rankStr = RANK_NAMES[card.rank];
  const suitStr = SUIT_SYMBOLS[card.suit];

  if (!card.faceUp) {
    return (
      <div
        onClick={onClick}
        className={`w-12 h-16 sm:w-16 sm:h-24 md:w-20 md:h-28 rounded-md border-2 border-slate-700 shadow-md relative select-none overflow-hidden transition-all duration-150 flex items-center justify-center ${className} ${
          isSelected ? 'ring-4 ring-yellow-400 scale-105 z-30' : ''
        } ${isHinted ? 'ring-4 ring-emerald-400 animate-pulse' : ''}`}
      >
        {/* Render Iconic Card Backs */}
        {cardBackTheme === 'beach' && (
          <div className="w-full h-full bg-sky-300 relative flex flex-col justify-between p-1">
            {/* Sun */}
            <div className="absolute top-1.5 right-1.5 w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-amber-400 border border-amber-600"></div>
            {/* Ocean */}
            <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-blue-500 border-t border-blue-400 flex flex-col justify-end">
              <div className="h-1 bg-white/40 w-full mb-1"></div>
            </div>
            {/* Palm Tree */}
            <div className="absolute bottom-1 left-2 z-10 flex flex-col items-center">
              <span className="text-xs sm:text-base select-none leading-none">🌴</span>
            </div>
            {/* Border frame */}
            <div className="w-full h-full border border-sky-800/40 rounded-sm pointer-events-none z-20"></div>
          </div>
        )}

        {cardBackTheme === 'castle' && (
          <div className="w-full h-full bg-slate-900 relative flex items-center justify-center p-1">
            <div className="absolute top-1 left-2 w-3 h-3 rounded-full bg-yellow-100 shadow-sm shadow-yellow-200"></div>
            <div className="text-center z-10">
              <span className="text-xs sm:text-base">🏰</span>
              <div className="text-[7px] sm:text-[9px] text-purple-300 font-mono mt-[-2px]">🦇</div>
            </div>
            <div className="w-full h-full border border-purple-500/30 rounded-sm pointer-events-none"></div>
          </div>
        )}

        {cardBackTheme === 'hand' && (
          <div className="w-full h-full bg-emerald-800 relative flex items-center justify-center p-1">
            <div className="text-center z-10">
              <span className="text-xs sm:text-base">🎴</span>
              <div className="text-[6px] sm:text-[8px] font-bold text-amber-200">WIN 95</div>
            </div>
            <div className="w-full h-full border border-emerald-400/40 rounded-sm pointer-events-none"></div>
          </div>
        )}

        {cardBackTheme === 'robot' && (
          <div className="w-full h-full bg-stone-800 relative flex items-center justify-center p-1">
            <div className="text-center z-10">
              <span className="text-xs sm:text-base">🤖</span>
              <div className="text-[6px] sm:text-[8px] font-mono text-cyan-400">1990</div>
            </div>
            <div className="w-full h-full border border-stone-600 rounded-sm pointer-events-none"></div>
          </div>
        )}

        {cardBackTheme === 'retro_blue' && (
          <div className="w-full h-full bg-blue-800 p-1 flex items-center justify-center">
            <div className="w-full h-full bg-blue-900 border-2 border-dashed border-blue-400 rounded-sm flex items-center justify-center">
              <div className="w-4 h-4 sm:w-6 sm:h-6 rotate-45 border border-blue-300 bg-blue-700"></div>
            </div>
          </div>
        )}

        {cardBackTheme === 'emerald_classic' && (
          <div className="w-full h-full bg-emerald-900 p-1 flex items-center justify-center">
            <div className="w-full h-full border-2 border-amber-400/80 rounded-sm flex items-center justify-center bg-gradient-to-br from-emerald-800 to-emerald-950">
              <span className="text-amber-300 text-xs sm:text-sm">♠</span>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Face-Up Card
  return (
    <div
      draggable
      onDragStart={onDragStart}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      className={`w-12 h-16 sm:w-16 sm:h-24 md:w-20 md:h-28 bg-white rounded-md border-2 border-slate-300 shadow-md relative select-none flex flex-col justify-between p-1 sm:p-1.5 cursor-grab active:cursor-grabbing transition-all duration-100 ${
        isRed ? 'text-red-600' : 'text-slate-900'
      } ${isDragging ? 'opacity-40 scale-95' : 'opacity-100'} ${
        isSelected ? 'ring-4 ring-yellow-400 scale-105 z-30 shadow-xl' : 'hover:border-slate-400'
      } ${isHinted ? 'ring-4 ring-emerald-400 animate-pulse shadow-emerald-500/50 shadow-lg' : ''} ${className}`}
    >
      {/* Top Left Rank & Suit */}
      <div className="flex flex-col items-center leading-none self-start">
        <span className="font-mono font-black text-xs sm:text-base md:text-lg tracking-tighter">
          {rankStr}
        </span>
        <span className="text-[10px] sm:text-xs md:text-sm leading-none mt-[-1px]">
          {suitStr}
        </span>
      </div>

      {/* Center Large Graphic */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {card.rank >= 11 ? (
          <div className="flex flex-col items-center opacity-90">
            <span className="text-sm sm:text-xl md:text-2xl font-bold font-serif">
              {card.rank === 11 ? '♝' : card.rank === 12 ? '♛' : '♚'}
            </span>
            <span className="text-[9px] sm:text-xs md:text-sm font-black mt-[-4px]">
              {suitStr}
            </span>
          </div>
        ) : (
          <span className="text-base sm:text-2xl md:text-3xl opacity-85">
            {suitStr}
          </span>
        )}
      </div>

      {/* Bottom Right Inverted Rank & Suit */}
      <div className="flex flex-col items-center leading-none self-end rotate-180">
        <span className="font-mono font-black text-xs sm:text-base md:text-lg tracking-tighter">
          {rankStr}
        </span>
        <span className="text-[10px] sm:text-xs md:text-sm leading-none mt-[-1px]">
          {suitStr}
        </span>
      </div>
    </div>
  );
};
