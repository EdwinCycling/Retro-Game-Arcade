import {
  Card,
  Suit,
  CardRank,
  PlayerId,
  PassDirection,
  HeartsGameState,
  PlayerState,
  TrickCard,
  RoundScoreRecord
} from './heartsTypes';

export const SUITS: Suit[] = ['clubs', 'diamonds', 'spades', 'hearts'];

export const SUIT_SYMBOLS: Record<Suit, string> = {
  clubs: '♣',
  diamonds: '♦',
  spades: '♠',
  hearts: '♥'
};

export const RANK_NAMES: Record<CardRank, string> = {
  2: '2',
  3: '3',
  4: '4',
  5: '5',
  6: '6',
  7: '7',
  8: '8',
  9: '9',
  10: '10',
  11: 'J',
  12: 'Q',
  13: 'K',
  14: 'A'
};

export function getCardColor(suit: Suit): 'red' | 'black' {
  return suit === 'hearts' || suit === 'diamonds' ? 'red' : 'black';
}

export function sortHand(hand: Card[]): Card[] {
  const suitOrder: Record<Suit, number> = {
    clubs: 0,
    diamonds: 1,
    spades: 2,
    hearts: 3
  };

  return [...hand].sort((a, b) => {
    if (suitOrder[a.suit] !== suitOrder[b.suit]) {
      return suitOrder[a.suit] - suitOrder[b.suit];
    }
    return a.rank - b.rank;
  });
}

export function createDeck(): Card[] {
  const deck: Card[] = [];
  for (const suit of SUITS) {
    for (let r = 2; r <= 14; r++) {
      deck.push({
        id: `${suit}_${r}`,
        suit,
        rank: r as CardRank
      });
    }
  }
  return deck;
}

export function shuffleDeck(deck: Card[]): Card[] {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function getPassDirection(roundNumber: number): PassDirection {
  const mod = (roundNumber - 1) % 4;
  switch (mod) {
    case 0: return 'left';
    case 1: return 'right';
    case 2: return 'across';
    case 3: return 'none';
    default: return 'none';
  }
}

export function getTargetPlayerForPass(fromPlayer: PlayerId, direction: PassDirection): PlayerId {
  if (direction === 'none') return fromPlayer;
  if (direction === 'left') {
    return ((fromPlayer + 1) % 4) as PlayerId;
  }
  if (direction === 'right') {
    return ((fromPlayer + 3) % 4) as PlayerId;
  }
  if (direction === 'across') {
    return ((fromPlayer + 2) % 4) as PlayerId;
  }
  return fromPlayer;
}

export class HeartsEngine {
  public state: HeartsGameState;

  constructor(scoreLimit: number = 100, playerNames: [string, string, string, string] = ['Jij (Zuid)', 'Michele (West)', 'Ben (Noord)', 'Paul (Oost)']) {
    this.state = this.initGame(scoreLimit, playerNames);
  }

  public initGame(
    scoreLimit: number = 100,
    playerNames: [string, string, string, string] = ['Jij (Zuid)', 'Michele (West)', 'Ben (Noord)', 'Paul (Oost)']
  ): HeartsGameState {
    const players: [PlayerState, PlayerState, PlayerState, PlayerState] = [
      {
        id: 0,
        name: playerNames[0],
        avatar: '👤',
        hand: [],
        passedCards: [],
        receivedCards: [],
        tricksWon: [],
        roundScore: 0,
        totalScore: 0,
        isHuman: true
      },
      {
        id: 1,
        name: playerNames[1],
        avatar: '👩',
        hand: [],
        passedCards: [],
        receivedCards: [],
        tricksWon: [],
        roundScore: 0,
        totalScore: 0,
        isHuman: false
      },
      {
        id: 2,
        name: playerNames[2],
        avatar: '👨',
        hand: [],
        passedCards: [],
        receivedCards: [],
        tricksWon: [],
        roundScore: 0,
        totalScore: 0,
        isHuman: false
      },
      {
        id: 3,
        name: playerNames[3],
        avatar: '🧔',
        hand: [],
        passedCards: [],
        receivedCards: [],
        tricksWon: [],
        roundScore: 0,
        totalScore: 0,
        isHuman: false
      }
    ];

    this.state = {
      roundNumber: 1,
      phase: 'dealing',
      passDirection: 'left',
      players,
      currentTrick: [],
      turn: 0,
      heartsBroken: false,
      scoreLimit,
      history: [],
      isMoonShotThisRound: false
    };

    this.startRound(1);
    return this.state;
  }

  public startRound(roundNum: number = this.state.roundNumber) {
    const deck = shuffleDeck(createDeck());
    const passDir = getPassDirection(roundNum);

    for (let i = 0; i < 4; i++) {
      const hand = deck.slice(i * 13, (i + 1) * 13);
      this.state.players[i].hand = sortHand(hand);
      this.state.players[i].passedCards = [];
      this.state.players[i].receivedCards = [];
      this.state.players[i].tricksWon = [];
      this.state.players[i].roundScore = 0;
    }

    this.state.roundNumber = roundNum;
    this.state.passDirection = passDir;
    this.state.currentTrick = [];
    this.state.leadSuit = undefined;
    this.state.heartsBroken = false;
    this.state.trickWinnerId = undefined;
    this.state.isMoonShotThisRound = false;
    this.state.moonShooterId = undefined;

    if (passDir === 'none') {
      // No pass round - go straight to finding the 2 of Clubs
      this.finishPassingPhase();
    } else {
      this.state.phase = 'passing';
      // Automatically choose 3 pass cards for the 3 AI bots
      this.selectAiPassCards();
    }
  }

  private selectAiPassCards() {
    for (let p = 1; p < 4; p++) {
      const bot = this.state.players[p];
      bot.passedCards = this.chooseAiPassCards(bot.hand);
    }
  }

  private chooseAiPassCards(hand: Card[]): Card[] {
    const candidates = [...hand];
    const chosen: Card[] = [];

    // Helper: priority scoring for cards to pass away
    const getRiskScore = (c: Card) => {
      let risk = 0;
      if (c.suit === 'spades') {
        if (c.rank === 12) risk += 100; // Queen of Spades
        if (c.rank === 14) risk += 80;  // Ace of Spades
        if (c.rank === 13) risk += 75;  // King of Spades
      } else if (c.suit === 'hearts') {
        risk += c.rank * 4; // High hearts
      } else {
        risk += c.rank * 2; // High off-suit cards
      }
      return risk;
    };

    candidates.sort((a, b) => getRiskScore(b) - getRiskScore(a));
    for (let i = 0; i < 3 && i < candidates.length; i++) {
      chosen.push(candidates[i]);
    }
    return chosen;
  }

  public setHumanPassedCards(cards: Card[]): boolean {
    if (this.state.phase !== 'passing') return false;
    if (cards.length !== 3) return false;

    this.state.players[0].passedCards = [...cards];
    return true;
  }

  public confirmPassing(): boolean {
    if (this.state.phase !== 'passing') return false;
    const human = this.state.players[0];
    if (human.passedCards.length !== 3) return false;

    const dir = this.state.passDirection;
    if (dir === 'none') {
      this.finishPassingPhase();
      return true;
    }

    // Distribute passed cards
    for (let p = 0; p < 4; p++) {
      const fromPlayer = this.state.players[p];
      const targetId = getTargetPlayerForPass(p as PlayerId, dir);
      const toPlayer = this.state.players[targetId];

      // Remove from hand
      const passIds = new Set(fromPlayer.passedCards.map(c => c.id));
      fromPlayer.hand = fromPlayer.hand.filter(c => !passIds.has(c.id));

      // Add to receiver's incoming list
      toPlayer.receivedCards = [...fromPlayer.passedCards];
    }

    // Merge received cards into hands and sort
    for (let p = 0; p < 4; p++) {
      const player = this.state.players[p];
      player.hand = sortHand([...player.hand, ...player.receivedCards]);
    }

    this.finishPassingPhase();
    return true;
  }

  private finishPassingPhase() {
    this.state.phase = 'playing';

    // Player with the 2 of Clubs (clubs_2) starts the first trick
    let startingPlayer: PlayerId = 0;
    for (let p = 0; p < 4; p++) {
      const has2Clubs = this.state.players[p].hand.some(c => c.suit === 'clubs' && c.rank === 2);
      if (has2Clubs) {
        startingPlayer = p as PlayerId;
        break;
      }
    }

    this.state.turn = startingPlayer;
    this.state.currentTrick = [];
    this.state.leadSuit = undefined;
  }

  public isCardPlayable(playerId: PlayerId, card: Card): { valid: boolean; reason?: string } {
    if (this.state.phase !== 'playing') {
      return { valid: false, reason: 'Niet in speelfase.' };
    }
    if (this.state.turn !== playerId) {
      return { valid: false, reason: 'Niet aan de beurt.' };
    }

    const player = this.state.players[playerId];
    const hand = player.hand;
    const isFirstTrick = player.tricksWon.length === 0 && this.state.history.length === 0 && this.state.players.every(p => p.tricksWon.length === 0);
    const isLeading = this.state.currentTrick.length === 0;

    // Rule 1: Very first lead of the round MUST be 2 of Clubs
    if (isFirstTrick && isLeading) {
      if (card.suit === 'clubs' && card.rank === 2) {
        return { valid: true };
      }
      return { valid: false, reason: 'De allereerste slag moet starten met Klaveren 2 (♣2)!' };
    }

    // Rule 2: First trick CANNOT contain points (Hearts or Q♠) unless player has no other cards
    if (isFirstTrick && !isLeading) {
      const isPointCard = card.suit === 'hearts' || (card.suit === 'spades' && card.rank === 12);
      if (isPointCard) {
        const hasSafeCard = hand.some(c => c.suit !== 'hearts' && !(c.suit === 'spades' && c.rank === 12));
        if (hasSafeCard) {
          return { valid: false, reason: 'In de allereerste slag mogen geen strafpunten (Harten of ♠Vrouw) worden gespeeld!' };
        }
      }
    }

    // Rule 3: Must follow suit if possible
    if (!isLeading && this.state.leadSuit) {
      const hasLeadSuit = hand.some(c => c.suit === this.state.leadSuit);
      if (hasLeadSuit) {
        if (card.suit === this.state.leadSuit) {
          return { valid: true };
        }
        return { valid: false, reason: `Je moet bekennen met ${SUIT_SYMBOLS[this.state.leadSuit]} (${this.state.leadSuit})!` };
      }
      // If unable to follow suit, any card is valid (can dump Q♠ or Hearts, which breaks hearts!)
      return { valid: true };
    }

    // Rule 4: Leading a trick - Cannot lead Hearts until hearts are broken (unless hand is only hearts)
    if (isLeading) {
      if (card.suit === 'hearts' && !this.state.heartsBroken) {
        const onlyHasHearts = hand.every(c => c.suit === 'hearts');
        if (!onlyHasHearts) {
          return { valid: false, reason: 'Harten is nog niet gebroken! Je kunt pas Harten uitkomen als er al een Harten is bijgespeeld.' };
        }
      }
      return { valid: true };
    }

    return { valid: true };
  }

  public playCard(playerId: PlayerId, card: Card): boolean {
    const check = this.isCardPlayable(playerId, card);
    if (!check.valid) return false;

    const player = this.state.players[playerId];
    player.hand = player.hand.filter(c => c.id !== card.id);

    if (this.state.currentTrick.length === 0) {
      this.state.leadSuit = card.suit;
    }

    // If a Heart is played, mark Hearts as broken
    if (card.suit === 'hearts' || (card.suit === 'spades' && card.rank === 12)) {
      this.state.heartsBroken = true;
    }

    this.state.currentTrick.push({ playerId, card });

    // Check if trick is complete (4 cards)
    if (this.state.currentTrick.length === 4) {
      this.state.phase = 'trick_review';
      this.evaluateTrick();
    } else {
      // Next player's turn
      this.state.turn = ((playerId + 1) % 4) as PlayerId;
    }

    return true;
  }

  private evaluateTrick() {
    const trick = this.state.currentTrick;
    const lead = this.state.leadSuit!;

    let winningCard = trick[0];
    for (let i = 1; i < trick.length; i++) {
      const tc = trick[i];
      if (tc.card.suit === lead && tc.card.rank > winningCard.card.rank) {
        winningCard = tc;
      }
    }

    const winnerId = winningCard.playerId;
    this.state.trickWinnerId = winnerId;
    this.state.players[winnerId].tricksWon.push([...trick]);
    this.state.lastTrick = [...trick];
  }

  public completeTrickReview() {
    if (this.state.phase !== 'trick_review' || this.state.trickWinnerId === undefined) return;

    const winnerId = this.state.trickWinnerId;
    this.state.currentTrick = [];
    this.state.leadSuit = undefined;
    this.state.turn = winnerId;

    // Check if round is finished (no cards left in hand)
    if (this.state.players[0].hand.length === 0) {
      this.finishRound();
    } else {
      this.state.phase = 'playing';
    }
  }

  private finishRound() {
    const roundScores: [number, number, number, number] = [0, 0, 0, 0];

    for (let p = 0; p < 4; p++) {
      const player = this.state.players[p];
      let pts = 0;
      for (const trick of player.tricksWon) {
        for (const tc of trick) {
          if (tc.card.suit === 'hearts') {
            pts += 1;
          } else if (tc.card.suit === 'spades' && tc.card.rank === 12) {
            pts += 13;
          }
        }
      }
      roundScores[p] = pts;
    }

    // Check for "Shoot the Moon" (26 points taken by one player)
    let moonShooter: PlayerId | undefined = undefined;
    for (let p = 0; p < 4; p++) {
      if (roundScores[p] === 26) {
        moonShooter = p as PlayerId;
        break;
      }
    }

    if (moonShooter !== undefined) {
      this.state.isMoonShotThisRound = true;
      this.state.moonShooterId = moonShooter;
      // Moon shooter gets 0, everyone else gets +26!
      for (let p = 0; p < 4; p++) {
        if (p === moonShooter) {
          roundScores[p] = 0;
        } else {
          roundScores[p] = 26;
        }
      }
    } else {
      this.state.isMoonShotThisRound = false;
      this.state.moonShooterId = undefined;
    }

    // Apply round scores to total scores
    for (let p = 0; p < 4; p++) {
      this.state.players[p].roundScore = roundScores[p];
      this.state.players[p].totalScore += roundScores[p];
    }

    const cumulativeScores: [number, number, number, number] = [
      this.state.players[0].totalScore,
      this.state.players[1].totalScore,
      this.state.players[2].totalScore,
      this.state.players[3].totalScore
    ];

    const record: RoundScoreRecord = {
      roundNumber: this.state.roundNumber,
      scores: roundScores,
      cumulativeScores,
      moonShooter
    };
    this.state.history.push(record);

    // Check game over (anyone >= scoreLimit)
    const isGameOver = this.state.players.some(p => p.totalScore >= this.state.scoreLimit);
    if (isGameOver) {
      this.state.phase = 'game_over';
      // Winner is the player with the lowest score!
      let minScore = Infinity;
      let winner: PlayerId = 0;
      for (let p = 0; p < 4; p++) {
        if (this.state.players[p].totalScore < minScore) {
          minScore = this.state.players[p].totalScore;
          winner = p as PlayerId;
        }
      }
      this.state.winnerId = winner;
    } else {
      this.state.phase = 'round_over';
    }
  }

  // AI Decision Engine for automated turns
  public chooseAiCardToPlay(playerId: PlayerId): Card | null {
    const player = this.state.players[playerId];
    const playableCards = player.hand.filter(c => this.isCardPlayable(playerId, c).valid);
    if (playableCards.length === 0) return null;
    if (playableCards.length === 1) return playableCards[0];

    const trick = this.state.currentTrick;
    const isLeading = trick.length === 0;

    // AI Heuristics
    if (isLeading) {
      // Prefer leading low clubs or diamonds to avoid winning tricks
      const lowClubs = playableCards.filter(c => c.suit === 'clubs').sort((a, b) => a.rank - b.rank);
      if (lowClubs.length > 0 && lowClubs[0].rank <= 8) return lowClubs[0];

      const lowDiamonds = playableCards.filter(c => c.suit === 'diamonds').sort((a, b) => a.rank - b.rank);
      if (lowDiamonds.length > 0 && lowDiamonds[0].rank <= 8) return lowDiamonds[0];

      // Safe low spade (below Queen)
      const lowSpades = playableCards.filter(c => c.suit === 'spades' && c.rank < 12).sort((a, b) => a.rank - b.rank);
      if (lowSpades.length > 0) return lowSpades[0];

      // Default: play lowest available card
      return playableCards.sort((a, b) => a.rank - b.rank)[0];
    } else {
      const lead = this.state.leadSuit!;
      const followingSuit = playableCards.filter(c => c.suit === lead);

      if (followingSuit.length > 0) {
        // Must follow suit
        const highestInTrick = Math.max(...trick.filter(tc => tc.card.suit === lead).map(tc => tc.card.rank));
        const trickHasPoints = trick.some(tc => tc.card.suit === 'hearts' || (tc.card.suit === 'spades' && tc.card.rank === 12));

        // If playing spades and Ace or King is already on the table, dump Queen of Spades if we have it!
        if (lead === 'spades' && (highestInTrick === 14 || highestInTrick === 13)) {
          const queenOfSpades = followingSuit.find(c => c.rank === 12);
          if (queenOfSpades) return queenOfSpades;
        }

        // If trick has points or danger, try to play just under the highest card
        const duckingCards = followingSuit.filter(c => c.rank < highestInTrick).sort((a, b) => b.rank - a.rank);
        if (duckingCards.length > 0) {
          // Play highest card that still ducks
          return duckingCards[0];
        }

        // If forced to take the trick, play lowest winning card
        return followingSuit.sort((a, b) => a.rank - b.rank)[0];
      } else {
        // Can slough anything! DUMP PENALTIES!
        // 1. Dump Queen of Spades (13 pts!)
        const queenOfSpades = playableCards.find(c => c.suit === 'spades' && c.rank === 12);
        if (queenOfSpades) return queenOfSpades;

        // 2. Dump highest Hearts
        const hearts = playableCards.filter(c => c.suit === 'hearts').sort((a, b) => b.rank - a.rank);
        if (hearts.length > 0) return hearts[0];

        // 3. Dump Ace or King of Spades (dangerous cards)
        const highSpades = playableCards.filter(c => c.suit === 'spades' && c.rank > 12).sort((a, b) => b.rank - a.rank);
        if (highSpades.length > 0) return highSpades[0];

        // 4. Dump highest rank card from other suits
        return playableCards.sort((a, b) => b.rank - a.rank)[0];
      }
    }
  }
}
