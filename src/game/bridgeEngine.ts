import {
  BridgeCard,
  BridgeSuit,
  BridgeStrain,
  BridgeRank,
  Seat,
  BridgeBid,
  BridgeContract,
  Vulnerability,
  BridgePhase,
  TrickCard,
  BridgeTrick,
  BridgeScoreResult,
  BridgeHandStats
} from './bridgeTypes';

export const BRIDGE_SUITS: BridgeSuit[] = ['clubs', 'diamonds', 'hearts', 'spades'];
export const BRIDGE_STRAINS: BridgeStrain[] = ['clubs', 'diamonds', 'hearts', 'spades', 'nt'];
export const BRIDGE_RANKS: BridgeRank[] = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

export const STRAIN_SYMBOLS: Record<BridgeStrain, string> = {
  clubs: '♣',
  diamonds: '♦',
  hearts: '♥',
  spades: '♠',
  nt: 'SA'
};

export const STRAIN_NAMES_NL: Record<BridgeStrain, string> = {
  clubs: 'Klaveren',
  diamonds: 'Ruiten',
  hearts: 'Harten',
  spades: 'Schoppen',
  nt: 'Sans Atout'
};

export const STRAIN_NAMES_EN: Record<BridgeStrain, string> = {
  clubs: 'Clubs',
  diamonds: 'Diamonds',
  hearts: 'Hearts',
  spades: 'Spades',
  nt: 'No Trump'
};

export const SEAT_NAMES_NL: Record<Seat, string> = {
  N: 'Noord (Maat)',
  E: 'Oost (Tegenstander)',
  S: 'Zuid (Jij)',
  W: 'West (Tegenstander)'
};

export const SEAT_NAMES_EN: Record<Seat, string> = {
  N: 'North (Partner)',
  E: 'East (Opponent)',
  S: 'South (You)',
  W: 'West (Opponent)'
};

export const NEXT_SEAT: Record<Seat, Seat> = {
  N: 'E',
  E: 'S',
  S: 'W',
  W: 'N'
};

export const PARTNER_SEAT: Record<Seat, Seat> = {
  N: 'S',
  S: 'N',
  E: 'W',
  W: 'E'
};

export class BridgeEngine {
  public hands: Record<Seat, BridgeCard[]> = { N: [], E: [], S: [], W: [] };
  public phase: BridgePhase = 'bidding';
  public dealer: Seat = 'N';
  public turnSeat: Seat = 'N';
  public vulnerability: Vulnerability = 'none';

  // Auction
  public auction: BridgeBid[] = [];
  public currentHighestBid: BridgeBid | null = null;
  public doubled: boolean = false;
  public redoubled: boolean = false;
  public passCount: number = 0;
  public contract: BridgeContract | null = null;

  // Play
  public tricks: BridgeTrick[] = [];
  public currentTrick: BridgeTrick | null = null;
  public tricksWonNS: number = 0;
  public tricksWonEW: number = 0;
  public scoreResult: BridgeScoreResult | null = null;
  public dummyRevealed: boolean = false;
  public statusMessage: string = '';

  constructor(dealer: Seat = 'N', vulnerability: Vulnerability = 'none') {
    this.dealer = dealer;
    this.vulnerability = vulnerability;
    this.startNewHand();
  }

  public startNewHand(): void {
    this.hands = this.dealHands();
    this.phase = 'bidding';
    this.turnSeat = this.dealer;
    this.auction = [];
    this.currentHighestBid = null;
    this.doubled = false;
    this.redoubled = false;
    this.passCount = 0;
    this.contract = null;
    this.tricks = [];
    this.currentTrick = null;
    this.tricksWonNS = 0;
    this.tricksWonEW = 0;
    this.scoreResult = null;
    this.dummyRevealed = false;
    this.statusMessage = `De kaarten zijn geschud en gedeeld. ${SEAT_NAMES_NL[this.turnSeat]} begint met bieden.`;

    // If starting turn is AI, let AI make opening bid
    if (this.turnSeat !== 'S') {
      setTimeout(() => this.processAiTurns(), 400);
    }
  }

  private dealHands(): Record<Seat, BridgeCard[]> {
    const deck: BridgeCard[] = [];
    for (const suit of BRIDGE_SUITS) {
      for (const rank of BRIDGE_RANKS) {
        let value = parseInt(rank, 10);
        if (rank === 'A') value = 14;
        else if (rank === 'K') value = 13;
        else if (rank === 'Q') value = 12;
        else if (rank === 'J') value = 11;
        else if (rank === '10') value = 10;

        let hcp = 0;
        if (rank === 'A') hcp = 4;
        else if (rank === 'K') hcp = 3;
        else if (rank === 'Q') hcp = 2;
        else if (rank === 'J') hcp = 1;

        deck.push({
          id: `${suit}-${rank}-${Math.random().toString(36).substring(2, 6)}`,
          suit,
          rank,
          value,
          hcp
        });
      }
    }

    // Shuffle
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }

    const nCards = deck.slice(0, 13);
    const eCards = deck.slice(13, 26);
    const sCards = deck.slice(26, 39);
    const wCards = deck.slice(39, 52);

    return {
      N: this.sortHand(nCards),
      E: this.sortHand(eCards),
      S: this.sortHand(sCards),
      W: this.sortHand(wCards)
    };
  }

  public sortHand(cards: BridgeCard[]): BridgeCard[] {
    const suitOrder: Record<BridgeSuit, number> = {
      spades: 0,
      hearts: 1,
      diamonds: 2,
      clubs: 3
    };

    return [...cards].sort((a, b) => {
      if (suitOrder[a.suit] !== suitOrder[b.suit]) {
        return suitOrder[a.suit] - suitOrder[b.suit];
      }
      return b.value - a.value;
    });
  }

  public calculateStats(cards: BridgeCard[]): BridgeHandStats {
    let hcp = 0;
    const shape = { spades: 0, hearts: 0, diamonds: 0, clubs: 0 };

    for (const card of cards) {
      hcp += card.hcp;
      shape[card.suit]++;
    }

    return { hcp, shape };
  }

  // --- AUCTION / BIDDING LOGIC ---

  public canMakeBid(level: number, strain: BridgeStrain): boolean {
    if (this.phase !== 'bidding') return false;
    if (level < 1 || level > 7) return false;

    if (!this.currentHighestBid || !this.currentHighestBid.level || !this.currentHighestBid.strain) {
      return true;
    }

    const currentLevel = this.currentHighestBid.level;
    const currentStrain = this.currentHighestBid.strain;

    if (level > currentLevel) return true;
    if (level < currentLevel) return false;

    const strainRank: Record<BridgeStrain, number> = {
      clubs: 1,
      diamonds: 2,
      hearts: 3,
      spades: 4,
      nt: 5
    };

    return strainRank[strain] > strainRank[currentStrain];
  }

  public canDouble(): boolean {
    if (this.phase !== 'bidding' || !this.currentHighestBid) return false;
    if (this.doubled || this.redoubled) return false;

    // Can only double if opponents made the highest bid
    const bidder = this.currentHighestBid.seat;
    const isOpponent = (this.turnSeat === 'S' || this.turnSeat === 'N')
      ? (bidder === 'E' || bidder === 'W')
      : (bidder === 'S' || bidder === 'N');

    return isOpponent;
  }

  public canRedouble(): boolean {
    if (this.phase !== 'bidding' || !this.currentHighestBid) return false;
    if (!this.doubled || this.redoubled) return false;

    // Can only redouble if our partnership's bid was doubled
    const bidder = this.currentHighestBid.seat;
    const isOurSide = (this.turnSeat === 'S' || this.turnSeat === 'N')
      ? (bidder === 'S' || bidder === 'N')
      : (bidder === 'E' || bidder === 'W');

    return isOurSide;
  }

  public makeBid(bid: Omit<BridgeBid, 'seat' | 'bidIndex'>): boolean {
    if (this.phase !== 'bidding') return false;

    const fullBid: BridgeBid = {
      ...bid,
      seat: this.turnSeat,
      bidIndex: this.auction.length
    };

    if (bid.type === 'bid') {
      if (!bid.level || !bid.strain || !this.canMakeBid(bid.level, bid.strain)) {
        return false;
      }
      this.currentHighestBid = fullBid;
      this.doubled = false;
      this.redoubled = false;
      this.passCount = 0;
    } else if (bid.type === 'pass') {
      this.passCount++;
    } else if (bid.type === 'double') {
      if (!this.canDouble()) return false;
      this.doubled = true;
      this.passCount = 0;
    } else if (bid.type === 'redouble') {
      if (!this.canRedouble()) return false;
      this.redoubled = true;
      this.passCount = 0;
    }

    this.auction.push(fullBid);

    // Check end of auction
    // Auction ends when:
    // 1. 3 consecutive passes after at least one real bid
    // 2. 4 passes initially (passed out deal)
    if (this.currentHighestBid && this.passCount === 3) {
      this.finalizeContract();
      return true;
    } else if (!this.currentHighestBid && this.passCount === 4) {
      this.phase = 'hand_over';
      this.statusMessage = 'Iedereen heeft gepast! Het spel is rondgepast (passed out).';
      return true;
    }

    // Advance turn
    this.turnSeat = NEXT_SEAT[this.turnSeat];
    this.statusMessage = `${SEAT_NAMES_NL[this.turnSeat]} is aan de beurt om te bieden.`;

    if (this.turnSeat !== 'S') {
      setTimeout(() => this.processAiTurns(), 600);
    }

    return true;
  }

  private finalizeContract(): void {
    if (!this.currentHighestBid || !this.currentHighestBid.level || !this.currentHighestBid.strain) return;

    const winningBid = this.currentHighestBid;
    const finalStrain = winningBid.strain;
    const finalLevel = winningBid.level;
    const winningSide = (winningBid.seat === 'S' || winningBid.seat === 'N') ? ['S', 'N'] : ['E', 'W'];

    // Find Declarer: first player on winning side who bid the final strain
    let declarer: Seat = winningBid.seat;
    for (const b of this.auction) {
      if (b.type === 'bid' && b.strain === finalStrain && winningSide.includes(b.seat)) {
        declarer = b.seat;
        break;
      }
    }

    const dummy = PARTNER_SEAT[declarer];
    const defenderLeft = NEXT_SEAT[declarer];
    const defenderRight = NEXT_SEAT[dummy];

    this.contract = {
      level: finalLevel,
      strain: finalStrain,
      doubled: this.doubled,
      redoubled: this.redoubled,
      declarer,
      dummy,
      defenderLeft,
      defenderRight,
      tricksNeeded: finalLevel + 6
    };

    this.phase = 'opening_lead';
    this.turnSeat = defenderLeft;
    this.currentTrick = {
      trickNumber: 1,
      leadSeat: defenderLeft,
      cards: []
    };

    const strainName = STRAIN_NAMES_NL[finalStrain];
    const doubleText = this.redoubled ? ' Geredoubleerd' : this.doubled ? ' Gedoubleerd' : '';
    this.statusMessage = `Contract: ${finalLevel}${STRAIN_SYMBOLS[finalStrain]} (${strainName})${doubleText} door ${SEAT_NAMES_NL[declarer]}. ${SEAT_NAMES_NL[defenderLeft]} doet de openingsuitkomst.`;

    if (this.turnSeat !== 'S') {
      setTimeout(() => this.processAiTurns(), 800);
    }
  }

  // AI Bidding Decision Engine
  public getAiBid(seat: Seat): Omit<BridgeBid, 'seat' | 'bidIndex'> {
    const cards = this.hands[seat];
    const stats = this.calculateStats(cards);
    const partner = PARTNER_SEAT[seat];
    const partnerBids = this.auction.filter(b => b.seat === partner && b.type === 'bid');
    const partnerLastBid = partnerBids[partnerBids.length - 1];

    // If opening bid (no one bid yet)
    if (!this.currentHighestBid) {
      if (stats.hcp >= 20 && stats.hcp <= 21 && this.isBalanced(stats)) {
        if (this.canMakeBid(2, 'nt')) return { type: 'bid', level: 2, strain: 'nt' };
      }
      if (stats.hcp >= 15 && stats.hcp <= 17 && this.isBalanced(stats)) {
        if (this.canMakeBid(1, 'nt')) return { type: 'bid', level: 1, strain: 'nt' };
      }
      if (stats.hcp >= 12) {
        // Open 5-card major
        if (stats.shape.spades >= 5 && this.canMakeBid(1, 'spades')) {
          return { type: 'bid', level: 1, strain: 'spades' };
        }
        if (stats.shape.hearts >= 5 && this.canMakeBid(1, 'hearts')) {
          return { type: 'bid', level: 1, strain: 'hearts' };
        }
        // Minors
        if (stats.shape.diamonds >= 4 && this.canMakeBid(1, 'diamonds')) {
          return { type: 'bid', level: 1, strain: 'diamonds' };
        }
        if (this.canMakeBid(1, 'clubs')) {
          return { type: 'bid', level: 1, strain: 'clubs' };
        }
      }
      return { type: 'pass' };
    }

    // Response to partner's opening
    if (partnerLastBid && partnerLastBid.strain) {
      const pStrain = partnerLastBid.strain;
      const pLevel = partnerLastBid.level || 1;

      // Over partner's 1NT
      if (pStrain === 'nt' && pLevel === 1) {
        if (stats.hcp >= 10 && this.canMakeBid(3, 'nt')) return { type: 'bid', level: 3, strain: 'nt' };
        if (stats.hcp >= 8 && this.canMakeBid(2, 'nt')) return { type: 'bid', level: 2, strain: 'nt' };
        if (stats.shape.spades >= 5 && this.canMakeBid(2, 'spades')) return { type: 'bid', level: 2, strain: 'spades' };
        if (stats.shape.hearts >= 5 && this.canMakeBid(2, 'hearts')) return { type: 'bid', level: 2, strain: 'hearts' };
        return { type: 'pass' };
      }

      // Over partner's 1-major
      if (pStrain === 'spades' || pStrain === 'hearts') {
        const fit = stats.shape[pStrain];
        if (fit >= 3) {
          if (stats.hcp >= 13 && this.canMakeBid(4, pStrain)) return { type: 'bid', level: 4, strain: pStrain };
          if (stats.hcp >= 10 && this.canMakeBid(3, pStrain)) return { type: 'bid', level: 3, strain: pStrain };
          if (stats.hcp >= 6 && this.canMakeBid(2, pStrain)) return { type: 'bid', level: 2, strain: pStrain };
        }
      }

      // Raise minor or bid NT with stoppers
      if (pStrain === 'clubs' || pStrain === 'diamonds') {
        if (stats.hcp >= 13 && this.isBalanced(stats) && this.canMakeBid(3, 'nt')) return { type: 'bid', level: 3, strain: 'nt' };
        if (stats.shape.spades >= 4 && this.canMakeBid(1, 'spades')) return { type: 'bid', level: 1, strain: 'spades' };
        if (stats.shape.hearts >= 4 && this.canMakeBid(1, 'hearts')) return { type: 'bid', level: 1, strain: 'hearts' };
        if (stats.hcp >= 6 && this.canMakeBid(1, 'nt')) return { type: 'bid', level: 1, strain: 'nt' };
      }
    }

    // Competitive overcalls
    if (stats.hcp >= 11) {
      if (stats.shape.spades >= 5 && this.canMakeBid(1, 'spades')) return { type: 'bid', level: 1, strain: 'spades' };
      if (stats.shape.hearts >= 5 && this.canMakeBid(1, 'hearts')) return { type: 'bid', level: 1, strain: 'hearts' };
    }

    return { type: 'pass' };
  }

  private isBalanced(stats: BridgeHandStats): boolean {
    const counts = Object.values(stats.shape);
    const minCount = Math.min(...counts);
    const maxCount = Math.max(...counts);
    return minCount >= 2 && maxCount <= 5;
  }

  // --- PLAY OF THE HAND LOGIC ---

  public isLegalCard(seat: Seat, card: BridgeCard): boolean {
    if (this.phase !== 'opening_lead' && this.phase !== 'playing') return false;
    if (!this.currentTrick) return false;

    const hand = this.hands[seat];
    if (!hand.some(c => c.id === card.id)) return false;

    // First card of trick: any card is legal
    if (this.currentTrick.cards.length === 0) {
      return true;
    }

    // Must follow suit if possible
    const leadSuit = this.currentTrick.cards[0].card.suit;
    const hasLeadSuit = hand.some(c => c.suit === leadSuit);

    if (hasLeadSuit) {
      return card.suit === leadSuit;
    }

    // If void in lead suit, any card is legal (trump or discard)
    return true;
  }

  public getPlayableCards(seat: Seat): BridgeCard[] {
    const hand = this.hands[seat];
    return hand.filter(c => this.isLegalCard(seat, c));
  }

  public playCard(seat: Seat, card: BridgeCard): boolean {
    if (!this.isLegalCard(seat, card)) return false;
    if (!this.currentTrick) return false;

    // Remove card from hand
    this.hands[seat] = this.hands[seat].filter(c => c.id !== card.id);

    // Add to current trick
    this.currentTrick.cards.push({ card, seat });

    // If this was the opening lead, reveal Dummy!
    if (this.phase === 'opening_lead') {
      this.dummyRevealed = true;
      this.phase = 'playing';
    }

    // If trick is complete (4 cards)
    if (this.currentTrick.cards.length === 4) {
      const winnerSeat = this.evaluateTrickWinner(this.currentTrick);
      this.currentTrick.winnerSeat = winnerSeat;
      this.tricks.push(this.currentTrick);

      if (winnerSeat === 'N' || winnerSeat === 'S') {
        this.tricksWonNS++;
      } else {
        this.tricksWonEW++;
      }

      const trickNum = this.tricks.length;
      this.statusMessage = `Slag ${trickNum} gewonnen door ${SEAT_NAMES_NL[winnerSeat]}.`;

      // Check if all 13 tricks played
      if (this.tricks.length === 13) {
        this.phase = 'hand_over';
        this.calculateFinalScore();
        return true;
      }

      // Next trick
      this.turnSeat = winnerSeat;
      this.currentTrick = {
        trickNumber: trickNum + 1,
        leadSeat: winnerSeat,
        cards: []
      };

      if (!this.isHumanTurn()) {
        setTimeout(() => this.processAiTurns(), 900);
      }
      return true;
    }

    // Advance turn to next seat in trick
    this.turnSeat = NEXT_SEAT[seat];
    this.statusMessage = `${SEAT_NAMES_NL[this.turnSeat]} moet bijspelen.`;

    if (!this.isHumanTurn()) {
      setTimeout(() => this.processAiTurns(), 700);
    }

    return true;
  }

  public isHumanTurn(): boolean {
    if (this.phase === 'hand_over') return false;
    if (this.phase === 'bidding') {
      return this.turnSeat === 'S';
    }

    // In playing phase: South is human.
    // If South is Declarer, South ALSO controls North (Dummy)!
    if (this.contract && this.contract.declarer === 'S' && this.turnSeat === 'N') {
      return true;
    }

    return this.turnSeat === 'S';
  }

  private evaluateTrickWinner(trick: BridgeTrick): Seat {
    const leadSuit = trick.cards[0].card.suit;
    const trumpSuit = this.contract?.strain !== 'nt' ? this.contract?.strain : null;

    let bestSeat = trick.cards[0].seat;
    let bestValue = trick.cards[0].card.value;
    let bestIsTrump = trumpSuit ? trick.cards[0].card.suit === trumpSuit : false;

    for (let i = 1; i < trick.cards.length; i++) {
      const tc = trick.cards[i];
      const isTrump = trumpSuit ? tc.card.suit === trumpSuit : false;

      if (isTrump && !bestIsTrump) {
        bestSeat = tc.seat;
        bestValue = tc.card.value;
        bestIsTrump = true;
      } else if (isTrump && bestIsTrump) {
        if (tc.card.value > bestValue) {
          bestSeat = tc.seat;
          bestValue = tc.card.value;
        }
      } else if (!isTrump && !bestIsTrump && tc.card.suit === leadSuit) {
        if (tc.card.value > bestValue) {
          bestSeat = tc.seat;
          bestValue = tc.card.value;
        }
      }
    }

    return bestSeat;
  }

  // AI Card Play Engine
  public getAiCard(seat: Seat): BridgeCard {
    const playable = this.getPlayableCards(seat);
    if (playable.length === 1) return playable[0];

    // Leading a trick
    if (!this.currentTrick || this.currentTrick.cards.length === 0) {
      // Prefer leading top of sequence (e.g. K from KQ, Q from QJ) or 4th highest of best suit
      const aces = playable.filter(c => c.rank === 'A');
      if (aces.length > 0 && Math.random() > 0.4) return aces[0];

      // Otherwise lead a low card
      const nonHonors = playable.filter(c => c.hcp === 0);
      if (nonHonors.length > 0) {
        return nonHonors[Math.floor(Math.random() * nonHonors.length)];
      }
      return playable[playable.length - 1];
    }

    // Following suit: try to win cheaply or play lowest
    const leadSuit = this.currentTrick.cards[0].card.suit;
    const sameSuit = playable.filter(c => c.suit === leadSuit);

    if (sameSuit.length > 0) {
      // Check highest currently in trick
      const highestInTrick = Math.max(...this.currentTrick.cards.filter(tc => tc.card.suit === leadSuit).map(tc => tc.card.value));
      const winningCards = sameSuit.filter(c => c.value > highestInTrick);

      if (winningCards.length > 0) {
        // Play lowest winning card (second hand low, third hand high)
        return winningCards[winningCards.length - 1];
      }
      // Cannot win, play lowest card
      return sameSuit[sameSuit.length - 1];
    }

    // Trumping or discarding
    const trumpSuit = this.contract?.strain !== 'nt' ? this.contract?.strain : null;
    const trumps = trumpSuit ? playable.filter(c => c.suit === trumpSuit) : [];

    // Partner currently winning?
    const partner = PARTNER_SEAT[seat];
    const currentWinner = this.evaluateTrickWinner(this.currentTrick);
    if (currentWinner === partner) {
      // Discard lowest non-trump card
      const discards = playable.filter(c => c.suit !== trumpSuit);
      if (discards.length > 0) return discards[discards.length - 1];
      return playable[playable.length - 1];
    }

    // Opponent winning: trump if possible!
    if (trumps.length > 0) {
      return trumps[trumps.length - 1]; // Low trump
    }

    // Discard lowest card
    return playable[playable.length - 1];
  }

  public processAiTurns(): void {
    if (this.phase === 'bidding') {
      if (this.turnSeat !== 'S') {
        const bid = this.getAiBid(this.turnSeat);
        this.makeBid(bid);
      }
    } else if (this.phase === 'opening_lead' || this.phase === 'playing') {
      if (!this.isHumanTurn()) {
        const card = this.getAiCard(this.turnSeat);
        this.playCard(this.turnSeat, card);
      }
    }
  }

  // --- OFFICIAL DUPLICATE & RUBBER BRIDGE SCORING ---

  private calculateFinalScore(): void {
    if (!this.contract) return;

    const declarerSide = (this.contract.declarer === 'N' || this.contract.declarer === 'S') ? 'NS' : 'EW';
    const tricksWon = declarerSide === 'NS' ? this.tricksWonNS : this.tricksWonEW;
    const tricksNeeded = this.contract.tricksNeeded;
    const made = tricksWon >= tricksNeeded;
    const diff = tricksWon - tricksNeeded;

    const isVul = (declarerSide === 'NS')
      ? (this.vulnerability === 'ns' || this.vulnerability === 'all')
      : (this.vulnerability === 'ew' || this.vulnerability === 'all');

    let pointsNS = 0;
    let pointsEW = 0;
    let summaryText = '';

    const strain = this.contract.strain;
    const level = this.contract.level;
    const mult = this.contract.redoubled ? 4 : this.contract.doubled ? 2 : 1;

    if (made) {
      const overtricks = diff;
      let trickScore = 0;

      if (strain === 'clubs' || strain === 'diamonds') {
        trickScore = level * 20 * mult;
      } else if (strain === 'hearts' || strain === 'spades') {
        trickScore = level * 30 * mult;
      } else {
        // NT
        trickScore = (40 + (level - 1) * 30) * mult;
      }

      // Game bonus vs Partscore bonus
      const isGame = trickScore >= 100;
      let bonus = isGame ? (isVul ? 500 : 300) : 50;

      // Slam bonuses
      if (level === 6) bonus += isVul ? 750 : 500;       // Small Slam
      if (level === 7) bonus += isVul ? 1500 : 1000;    // Grand Slam

      // Overtrick score
      let overtrickScore = 0;
      if (overtricks > 0) {
        if (!this.contract.doubled && !this.contract.redoubled) {
          const perTrick = (strain === 'clubs' || strain === 'diamonds') ? 20 : 30;
          overtrickScore = overtricks * perTrick;
        } else if (this.contract.doubled) {
          overtrickScore = overtricks * (isVul ? 200 : 100);
        } else if (this.contract.redoubled) {
          overtrickScore = overtricks * (isVul ? 400 : 200);
        }
      }

      const totalContractPoints = trickScore + bonus + overtrickScore;

      if (declarerSide === 'NS') {
        pointsNS = totalContractPoints;
      } else {
        pointsEW = totalContractPoints;
      }

      summaryText = `Contract ${level}${STRAIN_SYMBOLS[strain]} GEMAAKT met ${overtricks} overslag(en)! Totaal: +${totalContractPoints} pt voor ${declarerSide}.`;
    } else {
      // Down (Undertricks)
      const undertricks = Math.abs(diff);
      let penalty = 0;

      if (!this.contract.doubled && !this.contract.redoubled) {
        penalty = undertricks * (isVul ? 100 : 50);
      } else if (this.contract.doubled) {
        if (!isVul) {
          penalty = 100; // 1st down
          if (undertricks > 1) penalty += 200; // 2nd
          if (undertricks > 2) penalty += 200; // 3rd
          if (undertricks > 3) penalty += (undertricks - 3) * 300;
        } else {
          penalty = 200; // 1st down
          if (undertricks > 1) penalty += (undertricks - 1) * 300;
        }
      } else if (this.contract.redoubled) {
        penalty = undertricks * 2 * (isVul ? 400 : 200);
      }

      if (declarerSide === 'NS') {
        pointsEW = penalty;
      } else {
        pointsNS = penalty;
      }

      summaryText = `Contract ${level}${STRAIN_SYMBOLS[strain]} ${undertricks} DOWN gegaan. Verdedigers (${declarerSide === 'NS' ? 'EW' : 'NS'}) scoren +${penalty} pt.`;
    }

    this.scoreResult = {
      tricksWonNS: this.tricksWonNS,
      tricksWonEW: this.tricksWonEW,
      contract: this.contract,
      made,
      overtricks: made ? diff : 0,
      undertricks: made ? 0 : Math.abs(diff),
      pointsNS,
      pointsEW,
      summaryText
    };
  }
}
