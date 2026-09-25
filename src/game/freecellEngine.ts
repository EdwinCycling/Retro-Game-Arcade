import { Card, Suit, CardRank, FreeCellState, MoveDestination } from './freecellTypes';

export const SUITS: Suit[] = ['clubs', 'diamonds', 'hearts', 'spades'];

export const SUIT_SYMBOLS: Record<Suit, string> = {
  clubs: '♣',
  diamonds: '♦',
  hearts: '♥',
  spades: '♠'
};

export const RANK_NAMES: Record<CardRank, string> = {
  2: '2', 3: '3', 4: '4', 5: '5', 6: '6', 7: '7', 8: '8', 9: '9', 10: '10',
  11: 'J', 12: 'Q', 13: 'K', 14: 'A'
};

export function getCardColor(suit: Suit): 'red' | 'black' {
  return suit === 'hearts' || suit === 'diamonds' ? 'red' : 'black';
}

/**
 * Authentic Microsoft Windows 3.1 / 95 FreeCell PRNG Deck Generator
 * Produces exact historic card layouts for game numbers 1 to 32,000!
 */
export function generateClassicFreeCellDeck(gameNumber: number): Card[] {
  // Standard deck ordering in MS FreeCell source code:
  // Cards 0..51: 13 Clubs, 13 Diamonds, 13 Hearts, 13 Spades
  // Ranks: Ace (0), 2..10, Jack (10), Queen (11), King (12)
  const deckCards: Card[] = [];
  const suitOrder: Suit[] = ['clubs', 'diamonds', 'hearts', 'spades'];

  for (let s = 0; s < 4; s++) {
    for (let r = 0; r < 13; r++) {
      const rank = (r === 0 ? 14 : r + 1) as CardRank; // Ace is 14
      deckCards.push({
        id: `${suitOrder[s]}_${rank}`,
        suit: suitOrder[s],
        rank,
        faceUp: true
      });
    }
  }

  // Linear Congruential Generator matching MS-C CRT rand()
  let seed = gameNumber;
  const msRand = (): number => {
    seed = (Math.imul(seed, 214013) + 2531011) & 0x7FFFFFFF;
    return (seed >> 16) & 0x7FFF;
  };

  const deck = [...deckCards];
  let wLeft = 52;
  const shuffledDeck: Card[] = new Array(52);

  for (let i = 0; i < 52; i++) {
    const j = msRand() % wLeft;
    shuffledDeck[i] = deck[j];
    deck[j] = deck[wLeft - 1];
    wLeft--;
  }

  return shuffledDeck;
}

export class FreeCellEngine {
  public state: FreeCellState;

  constructor(gameNumber: number = Math.floor(Math.random() * 32000) + 1) {
    this.state = this.initGame(gameNumber);
  }

  public initGame(gameNumber: number): FreeCellState {
    const deck = generateClassicFreeCellDeck(gameNumber);

    // Deal into 8 cascades (columns)
    // Cascades 0..3 get 7 cards, Cascades 4..7 get 6 cards
    const cascades: Card[][] = Array.from({ length: 8 }, () => []);
    for (let i = 0; i < 52; i++) {
      cascades[i % 8].push(deck[i]);
    }

    this.state = {
      gameNumber,
      freeCells: [null, null, null, null],
      foundations: {
        clubs: [],
        diamonds: [],
        hearts: [],
        spades: []
      },
      cascades,
      movesCount: 0,
      isWon: false,
      history: []
    };

    return this.state;
  }

  public saveHistory() {
    this.state.history.push({
      freeCells: this.state.freeCells.map(c => (c ? { ...c } : null)),
      foundations: {
        clubs: [...this.state.foundations.clubs],
        diamonds: [...this.state.foundations.diamonds],
        hearts: [...this.state.foundations.hearts],
        spades: [...this.state.foundations.spades]
      },
      cascades: this.state.cascades.map(col => col.map(c => ({ ...c }))),
      movesCount: this.state.movesCount
    });
  }

  public undo(): boolean {
    if (this.state.history.length === 0) return false;
    const last = this.state.history.pop()!;
    this.state.freeCells = last.freeCells;
    this.state.foundations = last.foundations;
    this.state.cascades = last.cascades;
    this.state.movesCount = last.movesCount;
    this.state.isWon = false;
    return true;
  }

  /**
   * Maximum cards that can be moved at once based on open FreeCells and empty Cascades
   * Formula: (1 + emptyFreeCells) * (2 ^ emptyCascades)
   * (adjusted if target is an empty cascade)
   */
  public getMaxMovableCards(targetIsEmptyCascade: boolean = false): number {
    const emptyFreeCells = this.state.freeCells.filter(c => c === null).length;
    let emptyCascades = this.state.cascades.filter(c => c.length === 0).length;
    
    if (targetIsEmptyCascade && emptyCascades > 0) {
      emptyCascades--; // The target empty cascade cannot be counted for intermediate steps
    }

    return (1 + emptyFreeCells) * Math.pow(2, emptyCascades);
  }

  /**
   * Checks if a card can be placed onto a target foundation pile
   */
  public canMoveToFoundation(card: Card, suit: Suit): boolean {
    if (card.suit !== suit) return false;
    const pile = this.state.foundations[suit];

    if (pile.length === 0) {
      return card.rank === 14; // Must start with Ace (14)
    }

    const topCard = pile[pile.length - 1];
    const topRank = topCard.rank === 14 ? 1 : topCard.rank;
    const currentRank = card.rank === 14 ? 1 : card.rank;

    return currentRank === topRank + 1;
  }

  /**
   * Checks if a card can be placed onto a cascade column
   */
  public canMoveToCascade(card: Card, targetCascadeIndex: number): boolean {
    const targetCol = this.state.cascades[targetCascadeIndex];

    if (targetCol.length === 0) {
      return true; // Any card can be placed in an empty column
    }

    const topCard = targetCol[targetCol.length - 1];
    
    // Must be opposite color
    if (getCardColor(card.suit) === getCardColor(topCard.suit)) {
      return false;
    }

    // Must be exactly one rank lower
    const cardRankVal = card.rank === 14 ? 1 : card.rank;
    const topRankVal = topCard.rank === 14 ? 1 : topCard.rank;

    return cardRankVal === topRankVal - 1;
  }

  /**
   * Move card from a location to FreeCell
   */
  public moveToFreeCell(from: { type: 'cascade'; index: number } | { type: 'freecell'; index: number }, freeCellIndex: number): boolean {
    if (this.state.freeCells[freeCellIndex] !== null) return false;

    let card: Card | null = null;

    if (from.type === 'cascade') {
      const col = this.state.cascades[from.index];
      if (col.length === 0) return false;
      card = col[col.length - 1];
    } else {
      card = this.state.freeCells[from.index];
    }

    if (!card) return false;

    this.saveHistory();

    // Execute move
    if (from.type === 'cascade') {
      this.state.cascades[from.index].pop();
    } else {
      this.state.freeCells[from.index] = null;
    }

    this.state.freeCells[freeCellIndex] = card;
    this.state.movesCount++;
    this.checkWin();
    return true;
  }

  /**
   * Move card from location to Foundation
   */
  public moveToFoundation(from: { type: 'cascade'; index: number } | { type: 'freecell'; index: number }, suit: Suit): boolean {
    let card: Card | null = null;

    if (from.type === 'cascade') {
      const col = this.state.cascades[from.index];
      if (col.length === 0) return false;
      card = col[col.length - 1];
    } else {
      card = this.state.freeCells[from.index];
    }

    if (!card || !this.canMoveToFoundation(card, suit)) return false;

    this.saveHistory();

    if (from.type === 'cascade') {
      this.state.cascades[from.index].pop();
    } else {
      this.state.freeCells[from.index] = null;
    }

    this.state.foundations[suit].push(card);
    this.state.movesCount++;
    this.checkWin();
    return true;
  }

  /**
   * Move stack of cards to Cascade column
   */
  public moveStackToCascade(fromCascadeIndex: number, cardIndexInCascade: number, targetCascadeIndex: number): boolean {
    if (fromCascadeIndex === targetCascadeIndex) return false;

    const sourceCol = this.state.cascades[fromCascadeIndex];
    if (cardIndexInCascade < 0 || cardIndexInCascade >= sourceCol.length) return false;

    const stackToMove = sourceCol.slice(cardIndexInCascade);
    
    // Verify stack is a valid descending alternating sequence
    for (let i = 0; i < stackToMove.length - 1; i++) {
      const c1 = stackToMove[i];
      const c2 = stackToMove[i + 1];
      if (getCardColor(c1.suit) === getCardColor(c2.suit)) return false;
      const r1 = c1.rank === 14 ? 1 : c1.rank;
      const r2 = c2.rank === 14 ? 1 : c2.rank;
      if (r1 !== r2 + 1) return false;
    }

    const leadCard = stackToMove[0];
    const targetIsEmpty = this.state.cascades[targetCascadeIndex].length === 0;

    if (!this.canMoveToCascade(leadCard, targetCascadeIndex)) return false;

    // Check capacity limit
    const maxMovable = this.getMaxMovableCards(targetIsEmpty);
    if (stackToMove.length > maxMovable) return false;

    this.saveHistory();

    // Execute move
    this.state.cascades[fromCascadeIndex] = sourceCol.slice(0, cardIndexInCascade);
    this.state.cascades[targetCascadeIndex].push(...stackToMove);
    this.state.movesCount++;
    this.checkWin();
    return true;
  }

  /**
   * Auto-move safe cards to foundations
   * A card is safe to move to foundation if both opposite suit cards of lower rank are already in foundation
   */
  public autoMoveSafeCards(): boolean {
    let movedAny = false;

    let progress = true;
    while (progress) {
      progress = false;

      // Check FreeCells
      for (let i = 0; i < 4; i++) {
        const card = this.state.freeCells[i];
        if (card && this.isSafeForFoundation(card) && this.canMoveToFoundation(card, card.suit)) {
          this.moveToFoundation({ type: 'freecell', index: i }, card.suit);
          progress = true;
          movedAny = true;
          break;
        }
      }

      if (progress) continue;

      // Check Cascades
      for (let c = 0; c < 8; c++) {
        const col = this.state.cascades[c];
        if (col.length > 0) {
          const card = col[col.length - 1];
          if (this.isSafeForFoundation(card) && this.canMoveToFoundation(card, card.suit)) {
            this.moveToFoundation({ type: 'cascade', index: c }, card.suit);
            progress = true;
            movedAny = true;
            break;
          }
        }
      }
    }

    return movedAny;
  }

  public isSafeForFoundation(card: Card): boolean {
    const cardRankVal = card.rank === 14 ? 1 : card.rank;
    if (cardRankVal <= 2) return true; // Aces and 2s are always safe!

    // Get ranks of opposite color foundations
    const oppositeSuits: Suit[] = getCardColor(card.suit) === 'red' ? ['clubs', 'spades'] : ['diamonds', 'hearts'];
    
    for (const suit of oppositeSuits) {
      const pile = this.state.foundations[suit];
      const topRank = pile.length === 0 ? 0 : (pile[pile.length - 1].rank === 14 ? 1 : pile[pile.length - 1].rank);
      if (topRank < cardRankVal - 1) {
        return false;
      }
    }

    return true;
  }

  public checkWin() {
    let totalInFoundations = 0;
    for (const suit of SUITS) {
      totalInFoundations += this.state.foundations[suit].length;
    }

    if (totalInFoundations === 52) {
      this.state.isWon = true;
    }
  }

  /**
   * Finds a valid move hint for the player
   */
  public getHint(): { message: string; from?: any; to?: any } | null {
    // 1. Check if any card can go to Foundation
    for (let c = 0; c < 8; c++) {
      const col = this.state.cascades[c];
      if (col.length > 0) {
        const card = col[col.length - 1];
        if (this.canMoveToFoundation(card, card.suit)) {
          return { message: `Verplaats ${RANK_NAMES[card.rank]} ${SUIT_SYMBOLS[card.suit]} van Kolom ${c + 1} naar de Basisstapel!` };
        }
      }
    }

    for (let i = 0; i < 4; i++) {
      const card = this.state.freeCells[i];
      if (card && this.canMoveToFoundation(card, card.suit)) {
        return { message: `Verplaats ${RANK_NAMES[card.rank]} ${SUIT_SYMBOLS[card.suit]} van Vrij Vak ${i + 1} naar de Basisstapel!` };
      }
    }

    // 2. Check cascade to cascade moves
    for (let fromC = 0; fromC < 8; fromC++) {
      const sourceCol = this.state.cascades[fromC];
      if (sourceCol.length === 0) continue;

      for (let cardIdx = 0; cardIdx < sourceCol.length; cardIdx++) {
        const card = sourceCol[cardIdx];
        
        for (let toC = 0; toC < 8; toC++) {
          if (fromC === toC) continue;
          if (this.canMoveToCascade(card, toC)) {
            const maxMov = this.getMaxMovableCards(this.state.cascades[toC].length === 0);
            if (sourceCol.length - cardIdx <= maxMov) {
              return { message: `Verplaats ${RANK_NAMES[card.rank]} ${SUIT_SYMBOLS[card.suit]} naar Kolom ${toC + 1}` };
            }
          }
        }
      }
    }

    // 3. Move to free cell
    const emptyFCIndex = this.state.freeCells.findIndex(c => c === null);
    if (emptyFCIndex !== -1) {
      for (let c = 0; c < 8; c++) {
        const col = this.state.cascades[c];
        if (col.length > 0) {
          const card = col[col.length - 1];
          return { message: `Parkeer ${RANK_NAMES[card.rank]} ${SUIT_SYMBOLS[card.suit]} tijdelijk in Vrij Vak ${emptyFCIndex + 1}` };
        }
      }
    }

    return { message: 'Geen voor de hand liggende zetten meer. Gebruik Ongedaan Maken (↺)!' };
  }
}
