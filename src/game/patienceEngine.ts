import { Card, Suit, CardRank, DrawMode, ScoringMode, GameMove } from './patienceTypes';

export const SUITS: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];
export const SUIT_SYMBOLS: Record<Suit, string> = {
  hearts: '♥',
  diamonds: '♦',
  clubs: '♣',
  spades: '♠'
};

export const RANK_NAMES: Record<CardRank, string> = {
  1: 'A',
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
  13: 'K'
};

export function getCardColor(suit: Suit): 'red' | 'black' {
  return suit === 'hearts' || suit === 'diamonds' ? 'red' : 'black';
}

export function createDeck(): Card[] {
  const deck: Card[] = [];
  for (const suit of SUITS) {
    for (let rank = 1; rank <= 13; rank++) {
      deck.push({
        id: `${suit}_${rank}`,
        suit,
        rank: rank as CardRank,
        faceUp: false
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

export interface PatienceGameState {
  stock: Card[];
  waste: Card[];
  foundations: Card[][]; // 4 foundation piles
  tableau: Card[][]; // 7 tableau columns
  score: number;
  moves: number;
  timeSeconds: number;
  drawMode: DrawMode;
  scoringMode: ScoringMode;
  history: GameMove[];
  isWon: boolean;
  stockPassCount: number;
}

export class PatienceEngine {
  public state: PatienceGameState;

  constructor(drawMode: DrawMode = 1, scoringMode: ScoringMode = 'standard') {
    this.state = this.initGame(drawMode, scoringMode);
  }

  public initGame(drawMode: DrawMode = 1, scoringMode: ScoringMode = 'standard'): PatienceGameState {
    const deck = shuffleDeck(createDeck());
    const tableau: Card[][] = [[], [], [], [], [], [], []];
    let cardIdx = 0;

    // Deal to tableau (1 in col 0, 2 in col 1, ..., 7 in col 6)
    for (let col = 0; col < 7; col++) {
      for (let row = 0; row <= col; row++) {
        const card = deck[cardIdx++];
        card.faceUp = row === col; // only top card is face up
        tableau[col].push(card);
      }
    }

    // Remaining 24 cards go to stock (all face down)
    const stock = deck.slice(cardIdx).map(c => ({ ...c, faceUp: false }));

    return {
      stock,
      waste: [],
      foundations: [[], [], [], []],
      tableau,
      score: scoringMode === 'vegas' ? -52 : 0,
      moves: 0,
      timeSeconds: 0,
      drawMode,
      scoringMode,
      history: [],
      isWon: false,
      stockPassCount: 0
    };
  }

  /**
   * Draw card(s) from stock into waste
   */
  public drawFromStock(): boolean {
    if (this.state.isWon) return false;

    if (this.state.stock.length === 0) {
      // Recycle waste into stock
      if (this.state.waste.length === 0) return false;

      this.state.stock = [...this.state.waste].reverse().map(c => ({ ...c, faceUp: false }));
      this.state.waste = [];
      this.state.stockPassCount++;

      // Penalty for recycling stock in standard scoring
      if (this.state.scoringMode === 'standard') {
        if (this.state.drawMode === 1) {
          this.state.score = Math.max(0, this.state.score - 100);
        } else if (this.state.stockPassCount > 3) {
          this.state.score = Math.max(0, this.state.score - 20);
        }
      }
      this.state.moves++;
      return true;
    }

    const count = Math.min(this.state.drawMode, this.state.stock.length);
    const drawn: Card[] = [];
    for (let i = 0; i < count; i++) {
      const card = this.state.stock.pop();
      if (card) {
        card.faceUp = true;
        drawn.push(card);
      }
    }

    this.state.waste.push(...drawn);
    this.state.moves++;
    return true;
  }

  /**
   * Check if a single card can be placed on a foundation pile
   */
  public canMoveToFoundation(card: Card, foundationIdx: number): boolean {
    const pile = this.state.foundations[foundationIdx];
    if (pile.length === 0) {
      return card.rank === 1; // Ace only on empty foundation
    }
    const topCard = pile[pile.length - 1];
    return topCard.suit === card.suit && card.rank === (topCard.rank + 1);
  }

  /**
   * Find available foundation index for a card if any
   */
  public findValidFoundation(card: Card): number {
    for (let i = 0; i < 4; i++) {
      if (this.canMoveToFoundation(card, i)) {
        return i;
      }
    }
    return -1;
  }

  /**
   * Check if a card (or stack) can be placed on a tableau column
   */
  public canMoveToTableau(card: Card, tableauIdx: number): boolean {
    const column = this.state.tableau[tableauIdx];
    if (column.length === 0) {
      return card.rank === 13; // King only on empty column
    }
    const topCard = column[column.length - 1];
    if (!topCard.faceUp) return false;
    const isOppositeColor = getCardColor(card.suit) !== getCardColor(topCard.suit);
    const isOneRankLower = card.rank === (topCard.rank - 1);
    return isOppositeColor && isOneRankLower;
  }

  /**
   * Move from Waste to Foundation
   */
  public moveWasteToFoundation(foundationIdx: number): boolean {
    if (this.state.waste.length === 0) return false;
    const card = this.state.waste[this.state.waste.length - 1];

    if (!this.canMoveToFoundation(card, foundationIdx)) return false;

    this.state.waste.pop();
    this.state.foundations[foundationIdx].push(card);

    let scoreDelta = 0;
    if (this.state.scoringMode === 'standard') {
      scoreDelta = 10;
      this.state.score += scoreDelta;
    } else {
      scoreDelta = 5;
      this.state.score += scoreDelta;
    }

    this.state.history.push({
      from: { type: 'waste' },
      to: { type: 'foundation', foundationIndex: foundationIdx },
      cards: [card],
      scoreDelta
    });

    this.state.moves++;
    this.checkWin();
    return true;
  }

  /**
   * Move from Waste to Tableau
   */
  public moveWasteToTableau(tableauIdx: number): boolean {
    if (this.state.waste.length === 0) return false;
    const card = this.state.waste[this.state.waste.length - 1];

    if (!this.canMoveToTableau(card, tableauIdx)) return false;

    this.state.waste.pop();
    this.state.tableau[tableauIdx].push(card);

    let scoreDelta = 0;
    if (this.state.scoringMode === 'standard') {
      scoreDelta = 5;
      this.state.score += scoreDelta;
    }

    this.state.history.push({
      from: { type: 'waste' },
      to: { type: 'tableau', tableauIndex: tableauIdx },
      cards: [card],
      scoreDelta
    });

    this.state.moves++;
    return true;
  }

  /**
   * Move card from Tableau to Foundation
   */
  public moveTableauToFoundation(tableauIdx: number, foundationIdx: number): boolean {
    const column = this.state.tableau[tableauIdx];
    if (column.length === 0) return false;

    const card = column[column.length - 1];
    if (!card.faceUp) return false;

    if (!this.canMoveToFoundation(card, foundationIdx)) return false;

    column.pop();
    this.state.foundations[foundationIdx].push(card);

    let turnedCardFlipped: { tableauIndex: number; cardId: string } | undefined;
    let scoreDelta = 0;

    if (this.state.scoringMode === 'standard') {
      scoreDelta += 10;
    } else {
      scoreDelta += 5;
    }

    // Auto-reveal new top card of column
    if (column.length > 0 && !column[column.length - 1].faceUp) {
      column[column.length - 1].faceUp = true;
      turnedCardFlipped = {
        tableauIndex: tableauIdx,
        cardId: column[column.length - 1].id
      };
      if (this.state.scoringMode === 'standard') {
        scoreDelta += 5;
      }
    }

    this.state.score += scoreDelta;

    this.state.history.push({
      from: { type: 'tableau', tableauIndex: tableauIdx },
      to: { type: 'foundation', foundationIndex: foundationIdx },
      cards: [card],
      turnedCardFlipped,
      scoreDelta
    });

    this.state.moves++;
    this.checkWin();
    return true;
  }

  /**
   * Move stack of cards from Tableau to another Tableau column
   */
  public moveTableauToTableau(fromCol: number, toCol: number, cardIdxInCol: number): boolean {
    if (fromCol === toCol) return false;
    const sourceCol = this.state.tableau[fromCol];
    if (cardIdxInCol < 0 || cardIdxInCol >= sourceCol.length) return false;

    const movingCard = sourceCol[cardIdxInCol];
    if (!movingCard.faceUp) return false;

    if (!this.canMoveToTableau(movingCard, toCol)) return false;

    const movingCards = sourceCol.splice(cardIdxInCol);
    this.state.tableau[toCol].push(...movingCards);

    let turnedCardFlipped: { tableauIndex: number; cardId: string } | undefined;
    let scoreDelta = 0;

    if (sourceCol.length > 0 && !sourceCol[sourceCol.length - 1].faceUp) {
      sourceCol[sourceCol.length - 1].faceUp = true;
      turnedCardFlipped = {
        tableauIndex: fromCol,
        cardId: sourceCol[sourceCol.length - 1].id
      };
      if (this.state.scoringMode === 'standard') {
        scoreDelta += 5;
        this.state.score += 5;
      }
    }

    this.state.history.push({
      from: { type: 'tableau', tableauIndex: fromCol },
      to: { type: 'tableau', tableauIndex: toCol },
      cards: movingCards,
      turnedCardFlipped,
      scoreDelta
    });

    this.state.moves++;
    return true;
  }

  /**
   * Move card from Foundation back to Tableau (standard solitaire allows this with penalty)
   */
  public moveFoundationToTableau(foundationIdx: number, tableauIdx: number): boolean {
    const pile = this.state.foundations[foundationIdx];
    if (pile.length === 0) return false;

    const card = pile[pile.length - 1];
    if (!this.canMoveToTableau(card, tableauIdx)) return false;

    pile.pop();
    this.state.tableau[tableauIdx].push(card);

    let scoreDelta = 0;
    if (this.state.scoringMode === 'standard') {
      scoreDelta = -15;
      this.state.score = Math.max(0, this.state.score - 15);
    }

    this.state.history.push({
      from: { type: 'foundation', foundationIndex: foundationIdx },
      to: { type: 'tableau', tableauIndex: tableauIdx },
      cards: [card],
      scoreDelta
    });

    this.state.moves++;
    return true;
  }

  /**
   * Undo the last move
   */
  public undo(): boolean {
    if (this.state.history.length === 0 || this.state.isWon) return false;
    const lastMove = this.state.history.pop();
    if (!lastMove) return false;

    // Reverse flipped card if applicable
    if (lastMove.turnedCardFlipped) {
      const col = this.state.tableau[lastMove.turnedCardFlipped.tableauIndex];
      if (col && col.length > 0) {
        const top = col[col.length - 1];
        if (top.id === lastMove.turnedCardFlipped.cardId) {
          top.faceUp = false;
        }
      }
    }

    // Revert target cards back to source
    if (lastMove.to.type === 'foundation' && lastMove.to.foundationIndex !== undefined) {
      const fPile = this.state.foundations[lastMove.to.foundationIndex];
      const card = fPile.pop();
      if (card) {
        if (lastMove.from.type === 'waste') {
          this.state.waste.push(card);
        } else if (lastMove.from.type === 'tableau' && lastMove.from.tableauIndex !== undefined) {
          this.state.tableau[lastMove.from.tableauIndex].push(card);
        }
      }
    } else if (lastMove.to.type === 'tableau' && lastMove.to.tableauIndex !== undefined) {
      const tCol = this.state.tableau[lastMove.to.tableauIndex];
      const count = lastMove.cards.length;
      const returnedCards = tCol.splice(tCol.length - count, count);

      if (lastMove.from.type === 'waste') {
        this.state.waste.push(...returnedCards);
      } else if (lastMove.from.type === 'tableau' && lastMove.from.tableauIndex !== undefined) {
        this.state.tableau[lastMove.from.tableauIndex].push(...returnedCards);
      } else if (lastMove.from.type === 'foundation' && lastMove.from.foundationIndex !== undefined) {
        this.state.foundations[lastMove.from.foundationIndex].push(...returnedCards);
      }
    }

    // Revert score
    this.state.score = Math.max(0, this.state.score - lastMove.scoreDelta);
    return true;
  }

  /**
   * Check if game is won
   */
  public checkWin(): boolean {
    const totalFoundations = this.state.foundations.reduce((acc, pile) => acc + pile.length, 0);
    if (totalFoundations === 52) {
      this.state.isWon = true;
      // Bonus for winning based on time in standard mode
      if (this.state.scoringMode === 'standard' && this.state.timeSeconds > 0) {
        const timeBonus = Math.max(0, Math.floor(700000 / Math.max(this.state.timeSeconds, 10)));
        this.state.score += timeBonus;
      }
      return true;
    }
    return false;
  }

  /**
   * Check if all cards in the tableau are face up and stock/waste are empty (or all accessible),
   * meaning auto-complete is guaranteed to win!
   */
  public canAutoComplete(): boolean {
    if (this.state.isWon) return false;
    if (this.state.stock.length > 0 || this.state.waste.length > 0) return false;

    for (const column of this.state.tableau) {
      for (const card of column) {
        if (!card.faceUp) return false;
      }
    }
    return true;
  }

  /**
   * Perform one step of auto-complete move
   */
  public performAutoCompleteStep(): boolean {
    if (this.state.isWon) return false;

    // Check tableau cards from top to bottom
    for (let col = 0; col < 7; col++) {
      const column = this.state.tableau[col];
      if (column.length === 0) continue;
      const topCard = column[column.length - 1];
      const fIdx = this.findValidFoundation(topCard);
      if (fIdx !== -1) {
        return this.moveTableauToFoundation(col, fIdx);
      }
    }
    return false;
  }

  /**
   * Generate next suggested hint move
   */
  public getHint(): { type: 'waste' | 'tableau'; fromIdx?: number; toType: 'foundation' | 'tableau'; toIdx: number; card: Card } | null {
    // 1. Check if waste card can go to foundation
    if (this.state.waste.length > 0) {
      const card = this.state.waste[this.state.waste.length - 1];
      const fIdx = this.findValidFoundation(card);
      if (fIdx !== -1) {
        return { type: 'waste', toType: 'foundation', toIdx: fIdx, card };
      }
    }

    // 2. Check if any tableau top card can go to foundation
    for (let col = 0; col < 7; col++) {
      const column = this.state.tableau[col];
      if (column.length === 0) continue;
      const topCard = column[column.length - 1];
      if (topCard.faceUp) {
        const fIdx = this.findValidFoundation(topCard);
        if (fIdx !== -1) {
          return { type: 'tableau', fromIdx: col, toType: 'foundation', toIdx: fIdx, card: topCard };
        }
      }
    }

    // 3. Check if tableau stack can move to another tableau column to reveal face-down card
    for (let col = 0; col < 7; col++) {
      const column = this.state.tableau[col];
      if (column.length === 0) continue;
      const firstFaceUpIdx = column.findIndex(c => c.faceUp);
      if (firstFaceUpIdx !== -1 && firstFaceUpIdx > 0) {
        const movingCard = column[firstFaceUpIdx];
        for (let targetCol = 0; targetCol < 7; targetCol++) {
          if (targetCol === col) continue;
          if (this.canMoveToTableau(movingCard, targetCol)) {
            return { type: 'tableau', fromIdx: col, toType: 'tableau', toIdx: targetCol, card: movingCard };
          }
        }
      }
    }

    // 4. Check if waste card can go to tableau
    if (this.state.waste.length > 0) {
      const card = this.state.waste[this.state.waste.length - 1];
      for (let col = 0; col < 7; col++) {
        if (this.canMoveToTableau(card, col)) {
          return { type: 'waste', toType: 'tableau', toIdx: col, card };
        }
      }
    }

    // 5. Any other tableau move
    for (let col = 0; col < 7; col++) {
      const column = this.state.tableau[col];
      if (column.length === 0) continue;
      const firstFaceUpIdx = column.findIndex(c => c.faceUp);
      if (firstFaceUpIdx !== -1) {
        const movingCard = column[firstFaceUpIdx];
        for (let targetCol = 0; targetCol < 7; targetCol++) {
          if (targetCol === col) continue;
          if (this.canMoveToTableau(movingCard, targetCol)) {
            // Don't move a King to an empty column if it's already the base of this column
            if (movingCard.rank === 13 && firstFaceUpIdx === 0 && this.state.tableau[targetCol].length === 0) {
              continue;
            }
            return { type: 'tableau', fromIdx: col, toType: 'tableau', toIdx: targetCol, card: movingCard };
          }
        }
      }
    }

    return null;
  }
}
