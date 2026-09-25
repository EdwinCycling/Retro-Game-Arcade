export type CardSuit = 'spades' | 'hearts' | 'diamonds' | 'clubs';
export type CardRank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';

export interface BlackjackCard {
  id: string;
  suit: CardSuit;
  rank: CardRank;
  value: number; // 1 to 10
  isFaceUp: boolean;
}

export type HandStatus = 'betting' | 'playing' | 'busted' | 'stood' | 'blackjack' | 'won' | 'lost' | 'push';

export interface PlayerHand {
  id: string;
  cards: BlackjackCard[];
  bet: number;
  status: HandStatus;
  resultMessage?: string;
  doubled?: boolean;
}

export interface DealerHand {
  cards: BlackjackCard[];
  status: HandStatus;
  revealedHoleCard: boolean;
}

export type GamePhase = 
  | 'betting'          // Place chips on the table
  | 'dealing'          // Cards are being dealt
  | 'insurance_offer'  // Dealer shows Ace, player can buy insurance
  | 'player_turn'      // Player makes decisions (hit, stand, double, split)
  | 'dealer_turn'      // Dealer draws until >= 17
  | 'round_over';      // Show results, pay bets

export interface HandEvaluation {
  total: number;
  isSoft: boolean;
  isBust: boolean;
  isBlackjack: boolean;
  displayTotal: string;
}

export interface BlackjackStats {
  handsPlayed: number;
  handsWon: number;
  handsLost: number;
  handsPushed: number;
  blackjacks: number;
  biggestBankroll: number;
  totalWonAmount: number;
}
