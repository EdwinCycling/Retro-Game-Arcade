export type KlaverjasSuit = 'clubs' | 'diamonds' | 'hearts' | 'spades';
export type KlaverjasRank = '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A';

export type KlaverjasSystem = 'amsterdams' | 'rotterdams';

export type PlayerId = 0 | 1 | 2 | 3; // 0: Zuid (Jij), 1: West (Ingrid), 2: Noord (Henk - je maat), 3: Oost (Jan)

export interface KlaverjasCard {
  id: string;
  suit: KlaverjasSuit;
  rank: KlaverjasRank;
  faceUp: boolean;
}

export interface TrickPlay {
  playerId: PlayerId;
  card: KlaverjasCard;
}

export type RoundPhase = 
  | 'bidding'       // Choosing trump or passing
  | 'playing'       // Playing the 8 tricks
  | 'trick_review'  // Pausing briefly to show trick winner & roem
  | 'round_over'    // Showing round scores, nat or pit
  | 'game_over';    // Match / Boompje completed

export interface RoundScoreRecord {
  roundNumber: number;
  trumpSuit: KlaverjasSuit;
  makerTeam: 'wij' | 'zij'; // 0/2 is 'wij', 1/3 is 'zij'
  pointsWij: number;
  pointsZij: number;
  roemWij: number;
  roemZij: number;
  totalWij: number;
  totalZij: number;
  isNat: boolean;
  isPit: boolean;
}

export interface KlaverjasGameState {
  system: KlaverjasSystem;
  roundNumber: number;
  maxRounds: number; // e.g. 4 or 8 rounds per boompje
  phase: RoundPhase;
  trumpSuit: KlaverjasSuit | null;
  makerTeam: 'wij' | 'zij' | null;
  makerPlayerId: PlayerId | null;
  dealerId: PlayerId;
  turn: PlayerId;
  hands: [KlaverjasCard[], KlaverjasCard[], KlaverjasCard[], KlaverjasCard[]];
  currentTrick: TrickPlay[];
  leadSuit: KlaverjasSuit | null;
  trickWinnerId: PlayerId | null;
  tricksWon: [TrickPlay[][], TrickPlay[][], TrickPlay[][], TrickPlay[][]];
  roundRoem: { wij: number; zij: number };
  roundPoints: { wij: number; zij: number };
  cumulativeScore: { wij: number; zij: number };
  history: RoundScoreRecord[];
  lastTrickRoem: number;
  lastTrickWinnerId: PlayerId | null;
}
