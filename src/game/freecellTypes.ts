export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';
export type CardRank = 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14; // 11: J, 12: Q, 13: K, 14: A

export interface Card {
  id: string;
  suit: Suit;
  rank: CardRank;
  faceUp: boolean;
}

export interface FreeCellState {
  gameNumber: number;
  freeCells: (Card | null)[]; // 4 cells
  foundations: Record<Suit, Card[]>; // 4 suits
  cascades: Card[][]; // 8 columns
  movesCount: number;
  isWon: boolean;
  history: {
    freeCells: (Card | null)[];
    foundations: Record<Suit, Card[]>;
    cascades: Card[][];
    movesCount: number;
  }[];
}

export type MoveDestination = 
  | { type: 'freecell'; index: number }
  | { type: 'foundation'; suit: Suit }
  | { type: 'cascade'; index: number };
