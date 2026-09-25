export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';
export type CardColor = 'red' | 'black';

export type CardRank = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13;

export interface Card {
  id: string;
  suit: Suit;
  rank: CardRank;
  faceUp: boolean;
}

export type DrawMode = 1 | 2 | 3;
export type ScoringMode = 'standard' | 'vegas';

export type CardBackTheme = 'beach' | 'castle' | 'hand' | 'robot' | 'retro_blue' | 'emerald_classic';

export type TableTheme = 'win95' | 'green_felt' | 'midnight_blue' | 'vintage_wood';

export interface GameMove {
  from: {
    type: 'waste' | 'tableau' | 'foundation';
    tableauIndex?: number;
    foundationIndex?: number;
  };
  to: {
    type: 'tableau' | 'foundation';
    tableauIndex?: number;
    foundationIndex?: number;
  };
  cards: Card[];
  turnedCardFlipped?: {
    tableauIndex: number;
    cardId: string;
  };
  scoreDelta: number;
}

export interface PatienceStats {
  gamesPlayed: number;
  gamesWon: number;
  currentStreak: number;
  bestStreak: number;
  bestTimeSeconds: number;
  bestScore: number;
  totalMoves: number;
}

export interface PatienceHighScoreEntry {
  name: string;
  initials: string;
  score: number;
  drawMode: DrawMode;
  scoringMode: ScoringMode;
  moves: number;
  timeSeconds: number;
  date: string;
}
