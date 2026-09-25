export type BridgeSuit = 'clubs' | 'diamonds' | 'hearts' | 'spades';
export type BridgeStrain = 'clubs' | 'diamonds' | 'hearts' | 'spades' | 'nt';
export type BridgeRank = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A';

export interface BridgeCard {
  id: string;
  suit: BridgeSuit;
  rank: BridgeRank;
  value: number; // 2-14 (A=14)
  hcp: number;   // A=4, K=3, Q=2, J=1
}

export type Seat = 'N' | 'E' | 'S' | 'W';

export type BidType = 'bid' | 'pass' | 'double' | 'redouble';

export interface BridgeBid {
  type: BidType;
  level?: number;        // 1 to 7
  strain?: BridgeStrain; // clubs, diamonds, hearts, spades, nt
  seat: Seat;
  bidIndex: number;
}

export interface BridgeContract {
  level: number;         // 1 to 7
  strain: BridgeStrain;
  doubled: boolean;
  redoubled: boolean;
  declarer: Seat;        // Who plays the hand
  dummy: Seat;           // Partner of declarer
  defenderLeft: Seat;    // Leads trick 1
  defenderRight: Seat;
  tricksNeeded: number;  // level + 6
}

export type Vulnerability = 'none' | 'ns' | 'ew' | 'all';

export type BridgePhase = 
  | 'dealing'
  | 'bidding'
  | 'opening_lead'
  | 'playing'
  | 'trick_won'
  | 'hand_over';

export interface TrickCard {
  card: BridgeCard;
  seat: Seat;
}

export interface BridgeTrick {
  trickNumber: number;
  leadSeat: Seat;
  cards: TrickCard[];
  winnerSeat?: Seat;
}

export interface BridgeScoreResult {
  tricksWonNS: number;
  tricksWonEW: number;
  contract: BridgeContract;
  made: boolean;
  overtricks: number;
  undertricks: number;
  pointsNS: number;
  pointsEW: number;
  summaryText: string;
}

export interface BridgeHandStats {
  hcp: number;
  shape: {
    spades: number;
    hearts: number;
    diamonds: number;
    clubs: number;
  };
}
