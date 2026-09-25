export type SpiderSuit = 'spades' | 'hearts' | 'diamonds' | 'clubs';
export type CardRank = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13; // 1: A, 11: J, 12: Q, 13: K

export type SpiderDifficulty = 1 | 2 | 4; // 1: 1 Suit (Spades), 2: 2 Suits (Spades & Hearts), 4: 4 Suits

export interface SpiderCard {
  id: string;
  suit: SpiderSuit;
  rank: CardRank;
  faceUp: boolean;
}

export interface SpiderGameState {
  difficulty: SpiderDifficulty;
  columns: SpiderCard[][]; // 10 tableau columns
  stock: SpiderCard[][]; // 5 deals of 10 cards each (50 cards total)
  completedSuits: number; // 0 to 8 completed K->A sequences
  movesCount: number;
  score: number;
  isWon: boolean;
  history: {
    columns: SpiderCard[][];
    stock: SpiderCard[][];
    completedSuits: number;
    movesCount: number;
    score: number;
  }[];
}
