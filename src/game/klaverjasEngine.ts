import {
  KlaverjasCard,
  KlaverjasSuit,
  KlaverjasRank,
  KlaverjasSystem,
  PlayerId,
  TrickPlay,
  KlaverjasGameState,
  RoundScoreRecord
} from './klaverjasTypes';

export const KLAVERJAS_SUITS: KlaverjasSuit[] = ['clubs', 'diamonds', 'hearts', 'spades'];

export const KLAVERJAS_SUIT_SYMBOLS: Record<KlaverjasSuit, string> = {
  clubs: '♣',
  diamonds: '♦',
  hearts: '♥',
  spades: '♠'
};

export const KLAVERJAS_SUIT_NAMES: Record<KlaverjasSuit, { nl: string; en: string }> = {
  clubs: { nl: 'Klaveren ♣', en: 'Clubs ♣' },
  diamonds: { nl: 'Ruiten ♦', en: 'Diamonds ♦' },
  hearts: { nl: 'Harten ♥', en: 'Hearts ♥' },
  spades: { nl: 'Schoppen ♠', en: 'Spades ♠' }
};

export const KLAVERJAS_RANKS: KlaverjasRank[] = ['7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

export function getKlaverjasCardColor(suit: KlaverjasSuit): 'red' | 'black' {
  return suit === 'hearts' || suit === 'diamonds' ? 'red' : 'black';
}

// Points and strength rankings
export function getCardPoints(rank: KlaverjasRank, isTrump: boolean): number {
  if (isTrump) {
    switch (rank) {
      case 'J': return 20; // Jas / Boer
      case '9': return 14; // Nel
      case 'A': return 11;
      case '10': return 10;
      case 'K': return 4;
      case 'Q': return 3;
      case '8': return 0;
      case '7': return 0;
    }
  } else {
    switch (rank) {
      case 'A': return 11;
      case '10': return 10;
      case 'K': return 4;
      case 'Q': return 3;
      case 'J': return 2;
      case '9': return 0;
      case '8': return 0;
      case '7': return 0;
    }
  }
}

// Trick power hierarchy (higher number wins trick)
export function getCardTrickPower(rank: KlaverjasRank, isTrump: boolean): number {
  if (isTrump) {
    switch (rank) {
      case 'J': return 8; // Highest trump
      case '9': return 7; // Nel
      case 'A': return 6;
      case '10': return 5;
      case 'K': return 4;
      case 'Q': return 3;
      case '8': return 2;
      case '7': return 1;
    }
  } else {
    switch (rank) {
      case 'A': return 8; // Highest non-trump
      case '10': return 7;
      case 'K': return 6;
      case 'Q': return 5;
      case 'J': return 4;
      case '9': return 3;
      case '8': return 2;
      case '7': return 1;
    }
  }
}

// Natural order used for calculating Roem (sequences)
export function getNaturalRankOrder(rank: KlaverjasRank): number {
  switch (rank) {
    case '7': return 1;
    case '8': return 2;
    case '9': return 3;
    case '10': return 4;
    case 'J': return 5;
    case 'Q': return 6;
    case 'K': return 7;
    case 'A': return 8;
  }
}

export function sortHand(hand: KlaverjasCard[], trumpSuit: KlaverjasSuit | null): KlaverjasCard[] {
  const suitOrder: Record<KlaverjasSuit, number> = {
    clubs: 0,
    diamonds: 1,
    spades: 2,
    hearts: 3
  };

  return [...hand].sort((a, b) => {
    if (a.suit !== b.suit) {
      return suitOrder[a.suit] - suitOrder[b.suit];
    }
    const isTrump = trumpSuit !== null && a.suit === trumpSuit;
    return getCardTrickPower(b.rank, isTrump) - getCardTrickPower(a.rank, isTrump);
  });
}

export function createDeck(): KlaverjasCard[] {
  const deck: KlaverjasCard[] = [];
  for (const suit of KLAVERJAS_SUITS) {
    for (const rank of KLAVERJAS_RANKS) {
      deck.push({
        id: `klaver_${suit}_${rank}`,
        suit,
        rank,
        faceUp: true
      });
    }
  }
  return deck;
}

export function shuffleDeck(deck: KlaverjasCard[]): KlaverjasCard[] {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export class KlaverjasEngine {
  public state: KlaverjasGameState;

  constructor(system: KlaverjasSystem = 'amsterdams', maxRounds: number = 4) {
    this.state = this.initMatch(system, maxRounds);
  }

  public initMatch(system: KlaverjasSystem = this.state?.system || 'amsterdams', maxRounds: number = 4): KlaverjasGameState {
    this.state = {
      system,
      roundNumber: 1,
      maxRounds,
      phase: 'bidding',
      trumpSuit: null,
      makerTeam: null,
      makerPlayerId: null,
      dealerId: 3, // East deals first, South starts bidding
      turn: 0,
      hands: [[], [], [], []],
      currentTrick: [],
      leadSuit: null,
      trickWinnerId: null,
      tricksWon: [[], [], [], []],
      roundRoem: { wij: 0, zij: 0 },
      roundPoints: { wij: 0, zij: 0 },
      cumulativeScore: { wij: 0, zij: 0 },
      history: [],
      lastTrickRoem: 0,
      lastTrickWinnerId: null
    };

    this.startRound(1);
    return this.state;
  }

  public startRound(roundNum: number) {
    const deck = shuffleDeck(createDeck());
    const hands: [KlaverjasCard[], KlaverjasCard[], KlaverjasCard[], KlaverjasCard[]] = [
      deck.slice(0, 8),
      deck.slice(8, 16),
      deck.slice(16, 24),
      deck.slice(24, 32)
    ];

    // Next dealer
    const dealerId = ((roundNum - 1) % 4) as PlayerId;
    const firstBidder = ((dealerId + 1) % 4) as PlayerId;

    this.state.roundNumber = roundNum;
    this.state.dealerId = dealerId;
    this.state.turn = firstBidder;
    this.state.phase = 'bidding';
    this.state.trumpSuit = null;
    this.state.makerTeam = null;
    this.state.makerPlayerId = null;
    this.state.hands = [
      sortHand(hands[0], null),
      sortHand(hands[1], null),
      sortHand(hands[2], null),
      sortHand(hands[3], null)
    ];
    this.state.currentTrick = [];
    this.state.leadSuit = null;
    this.state.trickWinnerId = null;
    this.state.tricksWon = [[], [], [], []];
    this.state.roundRoem = { wij: 0, zij: 0 };
    this.state.roundPoints = { wij: 0, zij: 0 };
    this.state.lastTrickRoem = 0;
    this.state.lastTrickWinnerId = null;
  }

  /**
   * Set Trump suit and start playing tricks
   */
  public chooseTrump(playerId: PlayerId, suit: KlaverjasSuit) {
    this.state.trumpSuit = suit;
    this.state.makerPlayerId = playerId;
    this.state.makerTeam = (playerId === 0 || playerId === 2) ? 'wij' : 'zij';
    this.state.phase = 'playing';
    
    // Sort hands with trump at the forefront
    for (let p = 0; p < 4; p++) {
      this.state.hands[p] = sortHand(this.state.hands[p], suit);
    }

    // Lead player is the player next to the dealer
    this.state.turn = ((this.state.dealerId + 1) % 4) as PlayerId;
    this.state.currentTrick = [];
    this.state.leadSuit = null;
  }

  /**
   * Pass bidding turn to next player
   */
  public passBidding(playerId: PlayerId) {
    if (this.state.phase !== 'bidding') return;

    const nextPlayer = ((playerId + 1) % 4) as PlayerId;
    const startPlayer = ((this.state.dealerId + 1) % 4) as PlayerId;

    // If it comes back all the way to dealer who passes, forced play (Utrechts) by dealer
    if (nextPlayer === startPlayer) {
      // Force dealer or pick strongest suit
      const best = this.getBestTrumpSuitForPlayer(this.state.dealerId);
      this.chooseTrump(this.state.dealerId, best);
    } else {
      this.state.turn = nextPlayer;
    }
  }

  /**
   * Determines which card is currently winning the trick.
   */
  public getWinningPlay(trick: TrickPlay[] = this.state.currentTrick): TrickPlay | null {
    if (trick.length === 0) return null;
    const trump = this.state.trumpSuit!;
    const lead = trick[0].card.suit;

    let bestPlay = trick[0];

    for (let i = 1; i < trick.length; i++) {
      const current = trick[i];
      const bestCard = bestPlay.card;
      const curCard = current.card;

      const isCurrentTrump = curCard.suit === trump;
      const isBestTrump = bestCard.suit === trump;

      if (isCurrentTrump && !isBestTrump) {
        bestPlay = current;
      } else if (isCurrentTrump && isBestTrump) {
        if (getCardTrickPower(curCard.rank, true) > getCardTrickPower(bestCard.rank, true)) {
          bestPlay = current;
        }
      } else if (!isCurrentTrump && !isBestTrump) {
        if (curCard.suit === lead) {
          if (getCardTrickPower(curCard.rank, false) > getCardTrickPower(bestCard.rank, false)) {
            bestPlay = current;
          }
        }
      }
    }

    return bestPlay;
  }

  /**
   * Validates if a card is legally playable according to Amsterdams or Rotterdams rules.
   */
  public isCardPlayable(playerId: PlayerId, card: KlaverjasCard): { valid: boolean; reason?: string } {
    if (this.state.phase !== 'playing') {
      return { valid: false, reason: 'Niet in de speelfase.' };
    }
    if (this.state.turn !== playerId) {
      return { valid: false, reason: 'Niet aan de beurt.' };
    }

    const hand = this.state.hands[playerId];
    const trick = this.state.currentTrick;
    const trump = this.state.trumpSuit!;

    // 1. Leader can play ANY card from their hand
    if (trick.length === 0) {
      return { valid: true };
    }

    const leadSuit = trick[0].card.suit;
    const hasLeadSuit = hand.some(c => c.suit === leadSuit);
    const hasTrump = hand.some(c => c.suit === trump);

    // 2. MUST follow lead suit if possible
    if (hasLeadSuit) {
      if (card.suit === leadSuit) {
        // If lead suit is trump, must overtrump if possible
        if (leadSuit === trump) {
          const highestTrumpRank = Math.max(
            ...trick.filter(tp => tp.card.suit === trump).map(tp => getCardTrickPower(tp.card.rank, true))
          );
          const hasHigherTrump = hand.some(c => c.suit === trump && getCardTrickPower(c.rank, true) > highestTrumpRank);
          if (hasHigherTrump && getCardTrickPower(card.rank, true) <= highestTrumpRank) {
            return { valid: false, reason: 'In troef moet je altijd verplicht overtroeven als je kunt!' };
          }
        }
        return { valid: true };
      }
      return { valid: false, reason: `Je moet bekennen met ${KLAVERJAS_SUIT_NAMES[leadSuit].nl}!` };
    }

    // 3. Player does NOT have the lead suit:
    const winningPlay = this.getWinningPlay(trick)!;
    const matePlayerId = ((playerId + 2) % 4) as PlayerId;
    const isMateWinning = winningPlay.playerId === matePlayerId;

    // AMSTERDAMS vs ROTTERDAMS RULE DIFFERENCE:
    if (isMateWinning) {
      if (this.state.system === 'amsterdams') {
        // In Amsterdams: Your mate has the trick! You are NOT forced to trump.
        // You can discard any card or choose to trump.
        return { valid: true };
      } else {
        // In Rotterdams: You MUST trump (introeven op je maat) if you hold trumps!
        if (hasTrump) {
          if (card.suit !== trump) {
            return { valid: false, reason: 'Rotterdams Systeem: Je bent verplicht in te troeven op je maat zolang je troef hebt!' };
          }
          // If already trumped, must overtrump if possible
          const trumpsInTrick = trick.filter(tp => tp.card.suit === trump);
          if (trumpsInTrick.length > 0) {
            const highestTrumpRank = Math.max(...trumpsInTrick.map(tp => getCardTrickPower(tp.card.rank, true)));
            const hasHigher = hand.some(c => c.suit === trump && getCardTrickPower(c.rank, true) > highestTrumpRank);
            if (hasHigher && getCardTrickPower(card.rank, true) <= highestTrumpRank) {
              return { valid: false, reason: 'Je moet overtroeven als je een hogere troef hebt!' };
            }
          }
          return { valid: true };
        }
        // No trumps: can discard anything
        return { valid: true };
      }
    }

    // Opponent has the trick:
    const trumpsInTrick = trick.filter(tp => tp.card.suit === trump);
    const hasBeenTrumped = trumpsInTrick.length > 0;

    if (!hasBeenTrumped) {
      // Opponent leads with non-trump: MUST trump if you have trumps!
      if (hasTrump) {
        if (card.suit !== trump) {
          return { valid: false, reason: 'De tegenstander heeft de slag: Je móét introeven met troef!' };
        }
        return { valid: true };
      }
      // No trumps: can discard any non-trump
      return { valid: true };
    } else {
      // Opponent has trumped: MUST overtrump if you hold a higher trump!
      const highestTrumpRank = Math.max(...trumpsInTrick.map(tp => getCardTrickPower(tp.card.rank, true)));
      const higherTrumps = hand.filter(c => c.suit === trump && getCardTrickPower(c.rank, true) > highestTrumpRank);

      if (higherTrumps.length > 0) {
        // Holds higher trump: MUST overtrump
        if (card.suit === trump && getCardTrickPower(card.rank, true) > highestTrumpRank) {
          return { valid: true };
        }
        return { valid: false, reason: 'Je moet verplicht overtroeven met een hogere troef!' };
      } else {
        // Cannot overtrump: Underrumping (ondertroeven) is FORBIDDEN as long as you have non-trump cards!
        const hasNonTrump = hand.some(c => c.suit !== trump);
        if (card.suit === trump) {
          if (hasNonTrump) {
            return { valid: false, reason: 'Ondertroeven is verboden zolang je een andere kaart kunt bijleggen!' };
          }
          // Only trumps left: forced to undertrump
          return { valid: true };
        }
        // Non-trump discard is valid
        return { valid: true };
      }
    }
  }

  /**
   * Plays a card into the current trick.
   */
  public playCard(playerId: PlayerId, card: KlaverjasCard): boolean {
    const check = this.isCardPlayable(playerId, card);
    if (!check.valid) return false;

    // Remove from hand
    this.state.hands[playerId] = this.state.hands[playerId].filter(c => c.id !== card.id);

    if (this.state.currentTrick.length === 0) {
      this.state.leadSuit = card.suit;
    }

    this.state.currentTrick.push({ playerId, card });

    // Trick finished? (4 cards)
    if (this.state.currentTrick.length === 4) {
      this.state.phase = 'trick_review';
      this.evaluateTrick();
    } else {
      this.state.turn = ((playerId + 1) % 4) as PlayerId;
    }

    return true;
  }

  /**
   * Calculates Roem in a completed 4-card trick.
   */
  public calculateRoemInTrick(trick: TrickPlay[]): number {
    const cards = trick.map(tp => tp.card);
    let roem = 0;

    // 1. Check Four of a Kind (4 gelijken)
    const ranks = cards.map(c => c.rank);
    if (ranks.every(r => r === 'J')) {
      roem += 200; // 4 Boeren = 200 roem!
    } else if (ranks.every(r => r === 'A' || r === '10' || r === 'K' || r === 'Q')) {
      roem += 100; // 4 Azen/10en/Heren/Vrouwen = 100 roem
    }

    // 2. Check Sequences in same suit (3-kaart = 20, 4-kaart = 50)
    const suitGroups: Record<KlaverjasSuit, number[]> = {
      clubs: [],
      diamonds: [],
      hearts: [],
      spades: []
    };

    cards.forEach(c => {
      suitGroups[c.suit].push(getNaturalRankOrder(c.rank));
    });

    for (const suit of KLAVERJAS_SUITS) {
      const orders = suitGroups[suit].sort((a, b) => a - b);
      if (orders.length === 4) {
        if (orders[1] === orders[0] + 1 && orders[2] === orders[1] + 1 && orders[3] === orders[2] + 1) {
          roem += 50; // 4-kaart
        } else if (
          (orders[1] === orders[0] + 1 && orders[2] === orders[1] + 1) ||
          (orders[2] === orders[1] + 1 && orders[3] === orders[2] + 1)
        ) {
          roem += 20; // 3-kaart
        }
      } else if (orders.length === 3) {
        if (orders[1] === orders[0] + 1 && orders[2] === orders[1] + 1) {
          roem += 20; // 3-kaart
        }
      }
    }

    // 3. Check Stuk (Heer en Vrouw van troef in dezelfde slag)
    const trump = this.state.trumpSuit!;
    const hasTrumpKing = cards.some(c => c.suit === trump && c.rank === 'K');
    const hasTrumpQueen = cards.some(c => c.suit === trump && c.rank === 'Q');
    if (hasTrumpKing && hasTrumpQueen) {
      roem += 20; // Stuk
    }

    return roem;
  }

  /**
   * Evaluates who wins the trick and calculates trick points & roem.
   */
  private evaluateTrick() {
    const trick = this.state.currentTrick;
    const winner = this.getWinningPlay(trick)!;
    const winnerId = winner.playerId;
    const winnerTeam: 'wij' | 'zij' = (winnerId === 0 || winnerId === 2) ? 'wij' : 'zij';

    this.state.trickWinnerId = winnerId;
    this.state.lastTrickWinnerId = winnerId;
    this.state.tricksWon[winnerId].push([...trick]);

    // Calculate card points in this trick
    const trump = this.state.trumpSuit!;
    let points = 0;
    for (const tp of trick) {
      points += getCardPoints(tp.card.rank, tp.card.suit === trump);
    }

    // Last trick bonus ("de tien van de laatste slag")
    const isLastTrick = this.state.hands[0].length === 0;
    if (isLastTrick) {
      points += 10;
    }

    // Roem
    const roem = this.calculateRoemInTrick(trick);
    this.state.lastTrickRoem = roem;

    this.state.roundPoints[winnerTeam] += points;
    this.state.roundRoem[winnerTeam] += roem;
  }

  /**
   * Complete trick review and advance to next trick or end round.
   */
  public completeTrickReview() {
    if (this.state.phase !== 'trick_review' || this.state.trickWinnerId === null) return;

    const winnerId = this.state.trickWinnerId;
    this.state.currentTrick = [];
    this.state.leadSuit = null;
    this.state.turn = winnerId;

    // Check if 8 tricks completed (hand empty)
    if (this.state.hands[0].length === 0) {
      this.finishRound();
    } else {
      this.state.phase = 'playing';
    }
  }

  /**
   * Concludes round, checks for Nat and Pit, updates cumulative match score.
   */
  private finishRound() {
    const makerTeam = this.state.makerTeam!;
    const defenderTeam = makerTeam === 'wij' ? 'zij' : 'wij';

    const makerScore = this.state.roundPoints[makerTeam] + this.state.roundRoem[makerTeam];
    const defenderScore = this.state.roundPoints[defenderTeam] + this.state.roundRoem[defenderTeam];

    // NAT: If maker team does not achieve strictly more points than defender team
    const isNat = makerScore <= defenderScore;

    // PIT: If one team won all 8 tricks
    const tricksWij = this.state.tricksWon[0].length + this.state.tricksWon[2].length;
    const isPitWij = tricksWij === 8;
    const isPitZij = tricksWij === 0;
    const isPit = isPitWij || isPitZij;

    let finalWij = 0;
    let finalZij = 0;

    if (isNat) {
      // Defending team gets all 162 points + ALL roem! Maker gets 0.
      const totalAllPoints = 162 + this.state.roundRoem.wij + this.state.roundRoem.zij;
      if (makerTeam === 'wij') {
        finalWij = 0;
        finalZij = totalAllPoints;
      } else {
        finalWij = totalAllPoints;
        finalZij = 0;
      }
    } else {
      // Normal resolution
      finalWij = this.state.roundPoints.wij + this.state.roundRoem.wij;
      finalZij = this.state.roundPoints.zij + this.state.roundRoem.zij;

      if (isPitWij) finalWij += 100;
      if (isPitZij) finalZij += 100;
    }

    this.state.cumulativeScore.wij += finalWij;
    this.state.cumulativeScore.zij += finalZij;

    const record: RoundScoreRecord = {
      roundNumber: this.state.roundNumber,
      trumpSuit: this.state.trumpSuit!,
      makerTeam,
      pointsWij: this.state.roundPoints.wij,
      pointsZij: this.state.roundPoints.zij,
      roemWij: this.state.roundRoem.wij,
      roemZij: this.state.roundRoem.zij,
      totalWij: finalWij,
      totalZij: finalZij,
      isNat,
      isPit
    };
    this.state.history.push(record);

    if (this.state.roundNumber >= this.state.maxRounds) {
      this.state.phase = 'game_over';
    } else {
      this.state.phase = 'round_over';
    }
  }

  // AI Decision Helpers
  public getBestTrumpSuitForPlayer(playerId: PlayerId): KlaverjasSuit {
    const hand = this.state.hands[playerId];
    let bestSuit = KLAVERJAS_SUITS[0];
    let bestScore = -1;

    for (const suit of KLAVERJAS_SUITS) {
      let score = 0;
      const count = hand.filter(c => c.suit === suit).length;
      score += count * 15;

      const hasJack = hand.some(c => c.suit === suit && c.rank === 'J');
      if (hasJack) score += 40; // Boer / Jas

      const hasNine = hand.some(c => c.suit === suit && c.rank === '9');
      if (hasNine) score += 25; // Nel

      const hasAce = hand.some(c => c.suit === suit && c.rank === 'A');
      if (hasAce) score += 18;

      if (score > bestScore) {
        bestScore = score;
        bestSuit = suit;
      }
    }

    return bestSuit;
  }

  public shouldAiBid(playerId: PlayerId): { bid: boolean; suit: KlaverjasSuit } {
    const bestSuit = this.getBestTrumpSuitForPlayer(playerId);
    const hand = this.state.hands[playerId];
    const trumpCount = hand.filter(c => c.suit === bestSuit).length;
    const hasJack = hand.some(c => c.suit === bestSuit && c.rank === 'J');
    const hasNel = hand.some(c => c.suit === bestSuit && c.rank === '9');

    // Bot bids if 4+ trumps or (3 trumps with Boer or Nel)
    if (trumpCount >= 4 || (trumpCount >= 3 && (hasJack || hasNel))) {
      return { bid: true, suit: bestSuit };
    }
    return { bid: false, suit: bestSuit };
  }

  public chooseAiCardToPlay(playerId: PlayerId): KlaverjasCard | null {
    const hand = this.state.hands[playerId];
    const playableCards = hand.filter(c => this.isCardPlayable(playerId, c).valid);
    if (playableCards.length === 0) return null;
    if (playableCards.length === 1) return playableCards[0];

    const trick = this.state.currentTrick;
    const trump = this.state.trumpSuit!;

    if (trick.length === 0) {
      // Leading trick:
      // Prefer leading with strong non-trump Aces (vrije azen)
      const aces = playableCards.filter(c => c.rank === 'A' && c.suit !== trump);
      if (aces.length > 0) return aces[0];

      // If holding top trump Boer, lead with it to draw out opponent trumps
      const trumpJack = playableCards.find(c => c.suit === trump && c.rank === 'J');
      if (trumpJack) return trumpJack;

      // Safe low card
      const lowCards = playableCards.filter(c => c.suit !== trump && (c.rank === '7' || c.rank === '8' || c.rank === '9'));
      if (lowCards.length > 0) return lowCards[0];

      return playableCards[0];
    } else {
      const winning = this.getWinningPlay(trick)!;
      const isMateWinning = winning.playerId === ((playerId + 2) % 4);

      if (isMateWinning) {
        // Mate is winning! Slough highest points (Aces or 10s) or keep safe
        const pointsCards = playableCards.filter(c => c.rank === 'A' || c.rank === '10').sort((a, b) => getCardPoints(b.rank, b.suit === trump) - getCardPoints(a.rank, a.suit === trump));
        if (pointsCards.length > 0 && pointsCards[0].suit !== trick[0].card.suit) {
          return pointsCards[0]; // Grease the trick!
        }
        // Play lowest card
        return playableCards.sort((a, b) => getCardPoints(a.rank, a.suit === trump) - getCardPoints(b.rank, b.suit === trump))[0];
      } else {
        // Opponent is winning! Try to take trick with lowest winning card
        const winningCards = playableCards.filter(c => {
          const testTrick = [...trick, { playerId, card: c }];
          return this.getWinningPlay(testTrick)?.playerId === playerId;
        });

        if (winningCards.length > 0) {
          return winningCards.sort((a, b) => getCardPoints(a.rank, a.suit === trump) - getCardPoints(b.rank, b.suit === trump))[0];
        }

        // Cannot win: play lowest card to minimize loss
        return playableCards.sort((a, b) => getCardPoints(a.rank, a.suit === trump) - getCardPoints(b.rank, b.suit === trump))[0];
      }
    }
  }
}
