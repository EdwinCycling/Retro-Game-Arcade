export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';
export type CardRank = 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14; // 11: J, 12: Q, 13: K, 14: A

export interface Card {
  id: string;
  suit: Suit;
  rank: CardRank;
}

export type PlayerId = 0 | 1 | 2 | 3; // 0: South (Human), 1: West (Michele), 2: North (Ben), 3: East (Paul)

export type PassDirection = 'left' | 'right' | 'across' | 'none';

export type RoundPhase = 
  | 'dealing'
  | 'passing'
  | 'playing'
  | 'trick_review'
  | 'round_over'
  | 'game_over';

export interface TrickCard {
  playerId: PlayerId;
  card: Card;
}

export interface PlayerState {
  id: PlayerId;
  name: string;
  avatar: string;
  hand: Card[];
  passedCards: Card[];
  receivedCards: Card[];
  tricksWon: TrickCard[][];
  roundScore: number;
  totalScore: number;
  isHuman: boolean;
}

export interface RoundScoreRecord {
  roundNumber: number;
  scores: [number, number, number, number];
  cumulativeScores: [number, number, number, number];
  moonShooter?: PlayerId;
}

export interface HeartsGameState {
  roundNumber: number;
  phase: RoundPhase;
  passDirection: PassDirection;
  players: [PlayerState, PlayerState, PlayerState, PlayerState];
  currentTrick: TrickCard[];
  turn: PlayerId;
  leadSuit?: Suit;
  heartsBroken: boolean;
  scoreLimit: number; // usually 100
  history: RoundScoreRecord[];
  winnerId?: PlayerId;
  trickWinnerId?: PlayerId;
  lastTrick?: TrickCard[];
  isMoonShotThisRound: boolean;
  moonShooterId?: PlayerId;
}
