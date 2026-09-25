import {
  BlackjackCard,
  CardSuit,
  CardRank,
  PlayerHand,
  DealerHand,
  GamePhase,
  HandEvaluation,
  BlackjackStats
} from './blackjackTypes';

export const CARD_SUITS: CardSuit[] = ['spades', 'hearts', 'diamonds', 'clubs'];
export const CARD_RANKS: CardRank[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

export const SUIT_SYMBOLS: Record<CardSuit, string> = {
  spades: '♠',
  hearts: '♥',
  diamonds: '♦',
  clubs: '♣'
};

export const CHIP_VALUES = [5, 25, 100, 500, 1000] as const;

export class BlackjackEngine {
  public shoe: BlackjackCard[] = [];
  public playerHands: PlayerHand[] = [];
  public activeHandIndex: number = 0;
  public dealerHand: DealerHand = { cards: [], status: 'betting', revealedHoleCard: false };
  public bankroll: number = 1000;
  public currentBet: number = 25;
  public insuranceBet: number = 0;
  public phase: GamePhase = 'betting';
  public message: string = '';
  public messageType: 'normal' | 'win' | 'lose' | 'blackjack' | 'push' = 'normal';
  public stats: BlackjackStats;

  private readonly NUM_DECKS = 6;
  private readonly SHUFFLE_THRESHOLD = 52; // Reshuffle when fewer than 52 cards remain

  constructor(initialBankroll = 1000) {
    this.bankroll = initialBankroll;
    this.stats = this.loadStats();
    this.initShoe();
    this.resetForBetting();
  }

  private loadStats(): BlackjackStats {
    try {
      const saved = localStorage.getItem('arcade_blackjack_stats_v1');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return {
      handsPlayed: 0,
      handsWon: 0,
      handsLost: 0,
      handsPushed: 0,
      blackjacks: 0,
      biggestBankroll: this.bankroll,
      totalWonAmount: 0
    };
  }

  public saveStats(): void {
    try {
      if (this.bankroll > this.stats.biggestBankroll) {
        this.stats.biggestBankroll = this.bankroll;
      }
      localStorage.setItem('arcade_blackjack_stats_v1', JSON.stringify(this.stats));
    } catch {
      // ignore
    }
  }

  public reloadBankroll(amount = 1000): void {
    this.bankroll += amount;
    this.resetForBetting();
  }

  public initShoe(): void {
    const cards: BlackjackCard[] = [];
    for (let d = 0; d < this.NUM_DECKS; d++) {
      for (const suit of CARD_SUITS) {
        for (const rank of CARD_RANKS) {
          let value = parseInt(rank, 10);
          if (rank === 'A') value = 11;
          else if (['K', 'Q', 'J', '10'].includes(rank)) value = 10;

          cards.push({
            id: `deck-${d}-${suit}-${rank}-${Math.random().toString(36).substring(2, 7)}`,
            suit,
            rank,
            value,
            isFaceUp: true
          });
        }
      }
    }
    // Fisher-Yates shuffle
    for (let i = cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [cards[i], cards[j]] = [cards[j], cards[i]];
    }
    this.shoe = cards;
  }

  private drawCard(faceUp = true): BlackjackCard {
    if (this.shoe.length < this.SHUFFLE_THRESHOLD) {
      this.initShoe();
    }
    const card = this.shoe.pop()!;
    card.isFaceUp = faceUp;
    return card;
  }

  public resetForBetting(): void {
    this.phase = 'betting';
    this.insuranceBet = 0;
    this.activeHandIndex = 0;
    this.dealerHand = { cards: [], status: 'betting', revealedHoleCard: false };
    this.playerHands = [{
      id: 'hand-0',
      cards: [],
      bet: Math.min(this.currentBet, this.bankroll),
      status: 'betting'
    }];
    this.message = 'Plaats je inzet en klik op DELEN';
    this.messageType = 'normal';
  }

  public setBet(amount: number): boolean {
    if (this.phase !== 'betting') return false;
    if (amount <= 0 || amount > this.bankroll) return false;
    this.currentBet = amount;
    this.playerHands[0].bet = amount;
    return true;
  }

  public addChipToBet(chipValue: number): boolean {
    if (this.phase !== 'betting') return false;
    const newBet = this.currentBet + chipValue;
    if (newBet > this.bankroll) return false;
    this.currentBet = newBet;
    this.playerHands[0].bet = newBet;
    return true;
  }

  public clearBet(): void {
    if (this.phase !== 'betting') return;
    this.currentBet = 0;
    this.playerHands[0].bet = 0;
  }

  public evaluateHand(cards: BlackjackCard[]): HandEvaluation {
    const visibleCards = cards.filter(c => c.isFaceUp);
    let total = 0;
    let aces = 0;

    for (const card of visibleCards) {
      if (card.rank === 'A') {
        aces++;
        total += 11;
      } else {
        total += card.value;
      }
    }

    let isSoft = false;
    while (total > 21 && aces > 0) {
      total -= 10;
      aces--;
    }

    if (aces > 0 && total <= 21) {
      isSoft = true;
    }

    const isBust = total > 21;
    const isBlackjack = visibleCards.length === 2 && total === 21;

    let displayTotal = total.toString();
    if (isSoft && total < 21) {
      displayTotal = `${total - 10}/${total}`;
    }

    return {
      total,
      isSoft,
      isBust,
      isBlackjack,
      displayTotal
    };
  }

  public dealInitialCards(): { playerBJ: boolean; dealerAce: boolean } {
    if (this.currentBet <= 0 || this.currentBet > this.bankroll) return { playerBJ: false, dealerAce: false };

    // Deduct bet from bankroll
    this.bankroll -= this.currentBet;
    this.phase = 'dealing';

    // Deal Player Card 1 (Face Up)
    const pCard1 = this.drawCard(true);
    // Deal Dealer Card 1 (Face Up)
    const dCard1 = this.drawCard(true);
    // Deal Player Card 2 (Face Up)
    const pCard2 = this.drawCard(true);
    // Deal Dealer Hole Card (Face Down)
    const dCard2 = this.drawCard(false);

    this.playerHands = [{
      id: 'hand-0',
      cards: [pCard1, pCard2],
      bet: this.currentBet,
      status: 'playing'
    }];

    this.dealerHand = {
      cards: [dCard1, dCard2],
      status: 'playing',
      revealedHoleCard: false
    };

    const playerEval = this.evaluateHand(this.playerHands[0].cards);
    const dealerVisibleCard = dCard1;

    // Check for player Blackjack
    if (playerEval.isBlackjack) {
      this.playerHands[0].status = 'blackjack';
    }

    // Check if Dealer shows Ace -> Offer insurance
    if (dealerVisibleCard.rank === 'A' && !playerEval.isBlackjack && this.bankroll >= Math.floor(this.currentBet / 2)) {
      this.phase = 'insurance_offer';
      this.message = 'De bank toont een Aas! Wil je verzekering afsluiten? (Betaalt 2:1)';
      return { playerBJ: playerEval.isBlackjack, dealerAce: true };
    }

    // If no insurance, proceed to player turn or finish if BJ
    if (playerEval.isBlackjack) {
      this.resolveDealerAndFinish();
      return { playerBJ: true, dealerAce: false };
    }

    this.phase = 'player_turn';
    this.message = 'Jouw beurt: Kaart vragen (Hit), Passen (Stand), of Verdubbelen?';
    return { playerBJ: false, dealerAce: false };
  }

  public takeInsurance(accept: boolean): void {
    if (this.phase !== 'insurance_offer') return;

    if (accept) {
      const insCost = Math.floor(this.currentBet / 2);
      this.bankroll -= insCost;
      this.insuranceBet = insCost;
      this.message = `Verzekering afgesloten voor €${insCost}.`;
    } else {
      this.message = 'Verzekering geweigerd.';
    }

    // Check if dealer actually has Blackjack
    const dealerCards = this.dealerHand.cards.map(c => ({ ...c, isFaceUp: true }));
    const dealerEval = this.evaluateHand(dealerCards);

    if (dealerEval.isBlackjack) {
      // Dealer has BJ!
      this.resolveDealerAndFinish();
    } else {
      // Dealer does not have BJ, insurance is lost, play continues
      this.phase = 'player_turn';
      this.message = (accept ? 'Bank heeft geen Blackjack (verzekering verloren). ' : '') + 'Jouw beurt!';
    }
  }

  public hit(): { card: BlackjackCard; isBust: boolean; is21: boolean } {
    if (this.phase !== 'player_turn') throw new Error('Not player turn');
    const hand = this.playerHands[this.activeHandIndex];
    if (hand.status !== 'playing') throw new Error('Hand not playing');

    const newCard = this.drawCard(true);
    hand.cards.push(newCard);

    const evaluation = this.evaluateHand(hand.cards);
    if (evaluation.isBust) {
      hand.status = 'busted';
      hand.resultMessage = 'Kapot! (Bust)';
      this.advanceToNextHand();
      return { card: newCard, isBust: true, is21: false };
    } else if (evaluation.total === 21) {
      hand.status = 'stood';
      this.advanceToNextHand();
      return { card: newCard, isBust: false, is21: true };
    }

    return { card: newCard, isBust: false, is21: false };
  }

  public stand(): void {
    if (this.phase !== 'player_turn') return;
    const hand = this.playerHands[this.activeHandIndex];
    hand.status = 'stood';
    this.advanceToNextHand();
  }

  public canDouble(): boolean {
    if (this.phase !== 'player_turn') return false;
    const hand = this.playerHands[this.activeHandIndex];
    return hand.cards.length === 2 && this.bankroll >= hand.bet && hand.status === 'playing';
  }

  public doubleDown(): { card: BlackjackCard; isBust: boolean } {
    if (!this.canDouble()) throw new Error('Cannot double down');
    const hand = this.playerHands[this.activeHandIndex];

    this.bankroll -= hand.bet;
    hand.bet *= 2;
    hand.doubled = true;

    const card = this.drawCard(true);
    hand.cards.push(card);

    const evaluation = this.evaluateHand(hand.cards);
    if (evaluation.isBust) {
      hand.status = 'busted';
      hand.resultMessage = 'Kapot! (Bust)';
    } else {
      hand.status = 'stood';
    }

    this.advanceToNextHand();
    return { card, isBust: evaluation.isBust };
  }

  public canSplit(): boolean {
    if (this.phase !== 'player_turn') return false;
    if (this.playerHands.length >= 2) return false; // Max 1 split (2 hands)
    const hand = this.playerHands[this.activeHandIndex];
    if (hand.cards.length !== 2) return false;
    if (this.bankroll < hand.bet) return false;

    // Check if card ranks or values match
    const c1 = hand.cards[0];
    const c2 = hand.cards[1];
    return c1.rank === c2.rank || c1.value === c2.value;
  }

  public split(): void {
    if (!this.canSplit()) return;
    const currentHand = this.playerHands[0];
    this.bankroll -= currentHand.bet;

    const card2 = currentHand.cards.pop()!;
    const newHand: PlayerHand = {
      id: 'hand-1',
      cards: [card2],
      bet: currentHand.bet,
      status: 'playing'
    };

    // Deal 1 new card to hand 0
    currentHand.cards.push(this.drawCard(true));
    // Deal 1 new card to hand 1
    newHand.cards.push(this.drawCard(true));

    this.playerHands.push(newHand);
    this.activeHandIndex = 0;
    this.message = 'Gesplitst! Speel nu je eerste hand.';
  }

  private advanceToNextHand(): void {
    if (this.activeHandIndex < this.playerHands.length - 1) {
      this.activeHandIndex++;
      this.message = 'Speel nu je tweede hand.';
    } else {
      // All player hands resolved -> dealer turn
      this.resolveDealerAndFinish();
    }
  }

  public resolveDealerAndFinish(): void {
    this.phase = 'dealer_turn';

    // Reveal Dealer Hole Card
    for (const card of this.dealerHand.cards) {
      card.isFaceUp = true;
    }
    this.dealerHand.revealedHoleCard = true;

    // Check if all player hands are busted
    const allBusted = this.playerHands.every(h => h.status === 'busted');

    // Dealer draws while total < 17 (standard rule: stand on all 17s)
    if (!allBusted) {
      while (true) {
        const dEval = this.evaluateHand(this.dealerHand.cards);
        if (dEval.total < 17) {
          this.dealerHand.cards.push(this.drawCard(true));
        } else {
          break;
        }
      }
    }

    const dealerEval = this.evaluateHand(this.dealerHand.cards);
    if (dealerEval.isBust) {
      this.dealerHand.status = 'busted';
    } else if (dealerEval.isBlackjack) {
      this.dealerHand.status = 'blackjack';
    } else {
      this.dealerHand.status = 'stood';
    }

    // Payout and compare hands
    this.phase = 'round_over';
    this.settleRound(dealerEval);
  }

  private settleRound(dealerEval: HandEvaluation): void {
    let totalWon = 0;
    let roundHasWin = false;
    let roundHasBJ = false;

    // Check insurance payout
    if (dealerEval.isBlackjack && this.insuranceBet > 0) {
      const insPayout = this.insuranceBet * 3; // 2:1 plus original bet back
      this.bankroll += insPayout;
      totalWon += insPayout;
    }

    for (const hand of this.playerHands) {
      const pEval = this.evaluateHand(hand.cards);

      if (hand.status === 'busted') {
        hand.status = 'lost';
        hand.resultMessage = 'Verloren (Kapot)';
        this.stats.handsLost++;
      } else if (pEval.isBlackjack) {
        if (dealerEval.isBlackjack) {
          // Push
          hand.status = 'push';
          hand.resultMessage = 'Gelijkspel (Blackjack Push)';
          this.bankroll += hand.bet;
          this.stats.handsPushed++;
        } else {
          // Natural 3:2 payout
          hand.status = 'blackjack';
          hand.resultMessage = 'BLACKJACK! Betaalt 3:2';
          const bjPayout = Math.floor(hand.bet * 2.5);
          this.bankroll += bjPayout;
          totalWon += bjPayout;
          this.stats.blackjacks++;
          this.stats.handsWon++;
          roundHasBJ = true;
          roundHasWin = true;
        }
      } else if (dealerEval.isBlackjack) {
        // Dealer has BJ, player does not
        hand.status = 'lost';
        hand.resultMessage = 'Verloren (Bank heeft Blackjack)';
        this.stats.handsLost++;
      } else if (dealerEval.isBust) {
        // Dealer busted, player wins 1:1
        hand.status = 'won';
        hand.resultMessage = 'Gewonnen! Bank is kapot.';
        const winPayout = hand.bet * 2;
        this.bankroll += winPayout;
        totalWon += winPayout;
        this.stats.handsWon++;
        roundHasWin = true;
      } else if (pEval.total > dealerEval.total) {
        // Player higher score
        hand.status = 'won';
        hand.resultMessage = `Gewonnen! (${pEval.total} vs ${dealerEval.total})`;
        const winPayout = hand.bet * 2;
        this.bankroll += winPayout;
        totalWon += winPayout;
        this.stats.handsWon++;
        roundHasWin = true;
      } else if (pEval.total < dealerEval.total) {
        // Dealer higher score
        hand.status = 'lost';
        hand.resultMessage = `Verloren (${pEval.total} vs ${dealerEval.total})`;
        this.stats.handsLost++;
      } else {
        // Equal scores -> Push
        hand.status = 'push';
        hand.resultMessage = `Gelijkspel (${pEval.total} = ${dealerEval.total})`;
        this.bankroll += hand.bet;
        this.stats.handsPushed++;
      }
    }

    this.stats.handsPlayed += this.playerHands.length;
    this.stats.totalWonAmount += totalWon;
    this.saveStats();

    if (roundHasBJ) {
      this.message = '🎉 BLACKJACK! Prachtige overwinning!';
      this.messageType = 'blackjack';
    } else if (roundHasWin) {
      this.message = 'Gewonnen! De fiches worden uitbetaald.';
      this.messageType = 'win';
    } else if (this.playerHands.some(h => h.status === 'push')) {
      this.message = 'Gelijkspel (Push). Je inzet blijft behouden.';
      this.messageType = 'push';
    } else {
      this.message = 'Helaas, de bank wint deze ronde.';
      this.messageType = 'lose';
    }
  }
}
