export type PegColor = 'red' | 'blue' | 'yellow' | 'green' | 'orange' | 'purple' | 'white' | 'black';

export type GameMode = 'classic' | 'super' | 'mini';

export interface ColorDef {
  id: PegColor;
  name: { nl: string; en: string };
  hex: string;
  gradient: string;
  glow: string;
  border: string;
  highlight: string;
  keyNumber: string;
}

export const PEG_COLORS: Record<PegColor, ColorDef> = {
  red: {
    id: 'red',
    name: { nl: 'Rood', en: 'Red' },
    hex: '#ef4444',
    gradient: 'from-red-400 via-red-500 to-red-700',
    glow: 'rgba(239, 68, 68, 0.6)',
    border: 'border-red-600',
    highlight: 'bg-red-300',
    keyNumber: '1',
  },
  blue: {
    id: 'blue',
    name: { nl: 'Blauw', en: 'Blue' },
    hex: '#3b82f6',
    gradient: 'from-blue-400 via-blue-500 to-blue-700',
    glow: 'rgba(59, 130, 246, 0.6)',
    border: 'border-blue-600',
    highlight: 'bg-blue-300',
    keyNumber: '2',
  },
  yellow: {
    id: 'yellow',
    name: { nl: 'Geel', en: 'Yellow' },
    hex: '#eab308',
    gradient: 'from-amber-300 via-yellow-400 to-amber-600',
    glow: 'rgba(234, 179, 8, 0.6)',
    border: 'border-yellow-600',
    highlight: 'bg-yellow-200',
    keyNumber: '3',
  },
  green: {
    id: 'green',
    name: { nl: 'Groen', en: 'Green' },
    hex: '#22c55e',
    gradient: 'from-emerald-400 via-green-500 to-green-700',
    glow: 'rgba(34, 197, 94, 0.6)',
    border: 'border-green-600',
    highlight: 'bg-green-300',
    keyNumber: '4',
  },
  orange: {
    id: 'orange',
    name: { nl: 'Oranje', en: 'Orange' },
    hex: '#f97316',
    gradient: 'from-orange-400 via-orange-500 to-orange-700',
    glow: 'rgba(249, 115, 22, 0.6)',
    border: 'border-orange-600',
    highlight: 'bg-orange-300',
    keyNumber: '5',
  },
  purple: {
    id: 'purple',
    name: { nl: 'Paars', en: 'Purple' },
    hex: '#a855f7',
    gradient: 'from-purple-400 via-purple-500 to-purple-700',
    glow: 'rgba(168, 85, 247, 0.6)',
    border: 'border-purple-600',
    highlight: 'bg-purple-300',
    keyNumber: '6',
  },
  white: {
    id: 'white',
    name: { nl: 'Wit', en: 'White' },
    hex: '#f8fafc',
    gradient: 'from-slate-100 via-slate-200 to-slate-400',
    glow: 'rgba(248, 250, 252, 0.6)',
    border: 'border-slate-300',
    highlight: 'bg-white',
    keyNumber: '7',
  },
  black: {
    id: 'black',
    name: { nl: 'Zwart', en: 'Black' },
    hex: '#1e293b',
    gradient: 'from-slate-700 via-slate-800 to-slate-950',
    glow: 'rgba(30, 41, 59, 0.6)',
    border: 'border-slate-950',
    highlight: 'bg-slate-600',
    keyNumber: '8',
  },
};

export interface ModeConfig {
  id: GameMode;
  name: { nl: string; en: string };
  codeLength: number;
  availableColors: PegColor[];
  maxTurns: number;
  description: { nl: string; en: string };
  difficultyMultiplier: number;
}

export const GAME_MODES: Record<GameMode, ModeConfig> = {
  classic: {
    id: 'classic',
    name: { nl: 'Klassiek (4 Pionnen)', en: 'Classic (4 Pegs)' },
    codeLength: 4,
    availableColors: ['red', 'blue', 'yellow', 'green', 'orange', 'purple'],
    maxTurns: 10,
    description: {
      nl: 'Het klassieke formaat uit 1971: 4 posities, 6 levendige kleuren en 10 beurten.',
      en: 'The classic 1971 edition: 4 peg slots, 6 vibrant colors, and 10 attempts.',
    },
    difficultyMultiplier: 1.0,
  },
  super: {
    id: 'super',
    name: { nl: 'Super Mastermind (5 Pionnen)', en: 'Super Mastermind (5 Pegs)' },
    codeLength: 5,
    availableColors: ['red', 'blue', 'yellow', 'green', 'orange', 'purple', 'white', 'black'],
    maxTurns: 12,
    description: {
      nl: 'De ultieme Deluxe uitdaging: 5 posities, 8 kleuren inclusief zwart/wit en 12 beurten.',
      en: 'The ultimate Deluxe challenge: 5 peg slots, 8 colors including black/white, and 12 attempts.',
    },
    difficultyMultiplier: 1.8,
  },
  mini: {
    id: 'mini',
    name: { nl: 'Snelle Ronde (4 Pionnen / 8 Beurten)', en: 'Quick Round (4 Pegs / 8 Turns)' },
    codeLength: 4,
    availableColors: ['red', 'blue', 'yellow', 'green', 'orange', 'purple'],
    maxTurns: 8,
    description: {
      nl: 'Extra hoge tijdsdruk en minder beurten voor de doorgewinterde codekraker!',
      en: 'High-stakes speed run with fewer attempts for seasoned codebreakers!',
    },
    difficultyMultiplier: 1.4,
  },
};

export interface RowFeedback {
  black: number; // Correct color & correct position
  white: number; // Correct color, wrong position
}

export interface GuessRow {
  pegs: (PegColor | null)[];
  feedback: RowFeedback | null;
  timestamp?: number;
}

export type MastermindGameState = 'PLAYING' | 'WON' | 'LOST';

export interface MastermindStats {
  gamesPlayed: number;
  gamesWon: number;
  currentStreak: number;
  maxStreak: number;
  totalTurnsUsed: number;
  fastestWinSeconds: number | null;
}
