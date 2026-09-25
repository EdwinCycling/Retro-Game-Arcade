import { SpiderCard, SpiderSuit, CardRank, SpiderDifficulty, SpiderGameState } from './spiderTypes';

export const SPIDER_SUIT_SYMBOLS: Record<SpiderSuit, string> = {
  spades: '♠',
  hearts: '♥',
  diamonds: '♦',
  clubs: '♣'
};

export const SPIDER_RANK_NAMES: Record<CardRank, string> = {
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

export function getSpiderCardColor(suit: SpiderSuit): 'red' | 'black' {
  return suit === 'hearts' || suit === 'diamonds' ? 'red' : 'black';
}

export function generateSpiderDeck(difficulty: SpiderDifficulty): SpiderCard[] {
  const cards: SpiderCard[] = [];
  let cardIdCounter = 0;

  let suits: SpiderSuit[] = [];
  if (difficulty === 1) {
    // 8 sets of 13 Spades
    suits = Array(8).fill('spades');
  } else if (difficulty === 2) {
    // 4 sets of Spades, 4 sets of Hearts
    suits = [...Array(4).fill('spades'), ...Array(4).fill('hearts')];
  } else {
    // 2 sets of each of 4 suits
    suits = ['spades', 'hearts', 'diamonds', 'clubs', 'spades', 'hearts', 'diamonds', 'clubs'];
  }

  for (const suit of suits) {
    for (let r = 1; r <= 13; r++) {
      cards.push({
        id: `spider_${suit}_${r}_${cardIdCounter++}`,
        suit,
        rank: r as CardRank,
        faceUp: false
      });
    }
  }

  // Fisher-Yates shuffle
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }

  return cards;
}

export class SpiderEngine {
  public state: SpiderGameState;

  constructor(difficulty: SpiderDifficulty = 1) {
    this.state = this.initGame(difficulty);
  }

  public initGame(difficulty: SpiderDifficulty = this.state?.difficulty || 1): SpiderGameState {
    const deck = generateSpiderDeck(difficulty);

    // Deal 54 cards into 10 columns:
    // Columns 0..3 get 6 cards (5 face down, 1 face up)
    // Columns 4..9 get 5 cards (4 face down, 1 face up)
    const columns: SpiderCard[][] = Array.from({ length: 10 }, () => []);
    let deckIdx = 0;

    for (let col = 0; col < 10; col++) {
      const count = col < 4 ? 6 : 5;
      for (let i = 0; i < count; i++) {
        const card = deck[deckIdx++];
        if (i === count - 1) {
          card.faceUp = true;
        }
        columns[col].push(card);
      }
    }

    // Remaining 50 cards into 5 deals of 10
    const stock: SpiderCard[][] = [];
    for (let deal = 0; deal < 5; deal++) {
      const dealCards: SpiderCard[] = [];
      for (let i = 0; i < 10; i++) {
        const card = deck[deckIdx++];
        card.faceUp = true;
        dealCards.push(card);
      }
      stock.push(dealCards);
    }

    this.state = {
      difficulty,
      columns,
      stock,
      completedSuits: 0,
      movesCount: 0,
      score: 500,
      isWon: false,
      history: []
    };

    return this.state;
  }

  public saveHistory() {
    this.state.history.push({
      columns: this.state.columns.map(col => col.map(c => ({ ...c }))),
      stock: this.state.stock.map(deal => deal.map(c => ({ ...c }))),
      completedSuits: this.state.completedSuits,
      movesCount: this.state.movesCount,
      score: this.state.score
    });
  }

  public undo(): boolean {
    if (this.state.history.length === 0) return false;
    const last = this.state.history.pop()!;
    this.state.columns = last.columns;
    this.state.stock = last.stock;
    this.state.completedSuits = last.completedSuits;
    this.state.movesCount = last.movesCount;
    this.state.score = last.score;
    this.state.isWon = false;
    return true;
  }

  /**
   * Checks if a card sequence starting at cardIdx in fromCol can be picked up.
   * In Spider Solitaire, a sequence can only be moved if all cards are face up,
   * in strictly descending order (rank = next.rank + 1), AND all of the exact SAME suit.
   */
  public canPickUpSequence(colIdx: number, cardIdx: number): boolean {
    const col = this.state.columns[colIdx];
    if (cardIdx < 0 || cardIdx >= col.length) return false;
    if (!col[cardIdx].faceUp) return false;

    for (let i = cardIdx; i < col.length - 1; i++) {
      const cur = col[i];
      const next = col[i + 1];
      if (!next.faceUp) return false;
      if (cur.suit !== next.suit) return false;
      if (cur.rank !== next.rank + 1) return false;
    }

    return true;
  }

  /**
   * Checks if a card/stack can be moved to targetCol.
   * Can move if targetCol is empty, OR if top card of targetCol has rank = leadCard.rank + 1
   * (suit matching on target is not strictly required to place, though same suit is advantageous).
   */
  public canMoveToColumn(leadCard: SpiderCard, targetColIdx: number): boolean {
    const targetCol = this.state.columns[targetColIdx];
    if (targetCol.length === 0) return true;

    const topCard = targetCol[targetCol.length - 1];
    return topCard.rank === leadCard.rank + 1;
  }

  /**
   * Move a valid sequence from fromCol starting at cardIdx to targetCol.
   */
  public moveSequence(fromColIdx: number, cardIdx: number, targetColIdx: number): boolean {
    if (fromColIdx === targetColIdx) return false;
    if (!this.canPickUpSequence(fromColIdx, cardIdx)) return false;

    const sourceCol = this.state.columns[fromColIdx];
    const movingCards = sourceCol.slice(cardIdx);
    const leadCard = movingCards[0];

    if (!this.canMoveToColumn(leadCard, targetColIdx)) return false;

    this.saveHistory();

    // Execute move
    this.state.columns[fromColIdx] = sourceCol.slice(0, cardIdx);
    this.state.columns[targetColIdx].push(...movingCards);

    // If top of source column is face-down, flip it face-up!
    const newSource = this.state.columns[fromColIdx];
    if (newSource.length > 0 && !newSource[newSource.length - 1].faceUp) {
      newSource[newSource.length - 1].faceUp = true;
    }

    this.state.movesCount++;
    this.state.score = Math.max(0, this.state.score - 1);

    // Check if target column has a completed K->A sequence
    this.checkAndRemoveCompletedRuns(targetColIdx);

    return true;
  }

  /**
   * Deals 1 card to each column from the stock.
   * In classic Windows Spider, no column can be empty when dealing!
   */
  public dealFromStock(): { success: boolean; reason?: string } {
    if (this.state.stock.length === 0) {
      return { success: false, reason: 'De trekstapel is leeg!' };
    }

    // Check if any column is empty
    const hasEmptyColumn = this.state.columns.some(col => col.length === 0);
    if (hasEmptyColumn) {
      return { success: false, reason: 'In Spider Solitaire mag geen enkele kolom leeg zijn wanneer je deelt! Vul eerst alle lege kolommen.' };
    }

    this.saveHistory();

    const deal = this.state.stock.pop()!;
    for (let i = 0; i < 10; i++) {
      this.state.columns[i].push(deal[i]);
      // Check if this card completed a run
      this.checkAndRemoveCompletedRuns(i);
    }

    this.state.movesCount++;
    return { success: true };
  }

  /**
   * Check if a column ends with a full 13-card completed sequence of the same suit:
   * King (13), Queen (12), ..., 2, Ace (1).
   */
  public checkAndRemoveCompletedRuns(colIdx: number): boolean {
    const col = this.state.columns[colIdx];
    if (col.length < 13) return false;

    // Check last 13 cards
    const tail = col.slice(col.length - 13);
    const targetSuit = tail[0].suit;

    if (tail[0].rank !== 13 || !tail[0].faceUp) return false;

    for (let i = 0; i < 13; i++) {
      const card = tail[i];
      if (!card.faceUp || card.suit !== targetSuit || card.rank !== (13 - i)) {
        return false;
      }
    }

    // Sequence verified! Remove the 13 cards
    this.state.columns[colIdx] = col.slice(0, col.length - 13);
    this.state.completedSuits++;
    this.state.score += 100;

    // Reveal new top card if needed
    const updatedCol = this.state.columns[colIdx];
    if (updatedCol.length > 0 && !updatedCol[updatedCol.length - 1].faceUp) {
      updatedCol[updatedCol.length - 1].faceUp = true;
    }

    if (this.state.completedSuits === 8) {
      this.state.isWon = true;
    }

    return true;
  }

  /**
   * Generates a smart hint for the player.
   */
  public getHint(): { message: string; fromCol?: number; toCol?: number; cardIdx?: number } | null {
    // 1. Same-suit move that exposes a face-down card
    for (let from = 0; from < 10; from++) {
      const col = this.state.columns[from];
      if (col.length === 0) continue;

      for (let idx = 0; idx < col.length; idx++) {
        if (!this.canPickUpSequence(from, idx)) continue;
        const lead = col[idx];

        for (let to = 0; to < 10; to++) {
          if (from === to) continue;
          const targetCol = this.state.columns[to];
          if (targetCol.length === 0) continue; // save empty column preference

          const topTarget = targetCol[targetCol.length - 1];
          if (topTarget.rank === lead.rank + 1 && topTarget.suit === lead.suit) {
            // Same-suit move!
            return {
              message: `Verplaats ${SPIDER_RANK_NAMES[lead.rank]}${SPIDER_SUIT_SYMBOLS[lead.suit]} van Kolom ${from + 1} naar ${SPIDER_RANK_NAMES[topTarget.rank]}${SPIDER_SUIT_SYMBOLS[topTarget.suit]} in Kolom ${to + 1} (Gelijke kleur!)`,
              fromCol: from,
              toCol: to,
              cardIdx: idx
            };
          }
        }
      }
    }

    // 2. Any move that uncovers a face-down card
    for (let from = 0; from < 10; from++) {
      const col = this.state.columns[from];
      if (col.length === 0) continue;

      for (let idx = 0; idx < col.length; idx++) {
        if (!this.canPickUpSequence(from, idx)) continue;
        const lead = col[idx];
        const uncoversCard = idx > 0 && !col[idx - 1].faceUp;

        if (uncoversCard) {
          for (let to = 0; to < 10; to++) {
            if (from === to) continue;
            if (this.canMoveToColumn(lead, to)) {
              return {
                message: `Draai een dichte kaart open door ${SPIDER_RANK_NAMES[lead.rank]}${SPIDER_SUIT_SYMBOLS[lead.suit]} te verplaatsen naar Kolom ${to + 1}!`,
                fromCol: from,
                toCol: to,
                cardIdx: idx
              };
            }
          }
        }
      }
    }

    // 3. Any valid move to build descending sequence
    for (let from = 0; from < 10; from++) {
      const col = this.state.columns[from];
      if (col.length === 0) continue;

      for (let idx = 0; idx < col.length; idx++) {
        if (!this.canPickUpSequence(from, idx)) continue;
        const lead = col[idx];

        for (let to = 0; to < 10; to++) {
          if (from === to) continue;
          const targetCol = this.state.columns[to];
          if (targetCol.length > 0 && this.canMoveToColumn(lead, to)) {
            return {
              message: `Leg ${SPIDER_RANK_NAMES[lead.rank]}${SPIDER_SUIT_SYMBOLS[lead.suit]} op ${SPIDER_RANK_NAMES[targetCol[targetCol.length - 1].rank]} in Kolom ${to + 1}`,
              fromCol: from,
              toCol: to,
              cardIdx: idx
            };
          }
        }
      }
    }

    // 4. Move King or sequence to empty column
    const emptyColIdx = this.state.columns.findIndex(c => c.length === 0);
    if (emptyColIdx !== -1) {
      for (let from = 0; from < 10; from++) {
        const col = this.state.columns[from];
        if (col.length > 0 && col[0].rank === 13 && col.length > 1) {
          return {
            message: `Verplaats de Koning in Kolom ${from + 1} naar de lege Kolom ${emptyColIdx + 1} om ruimte te maken!`,
            fromCol: from,
            toCol: emptyColIdx,
            cardIdx: 0
          };
        }
      }
    }

    if (this.state.stock.length > 0) {
      return { message: 'Geen duidelijke zetten op het bord. Deel een nieuwe rij van 10 kaarten vanaf de trekstapel rechtsonder!' };
    }

    return { message: 'Geen zetten meer mogelijk. Gebruik Herstel (↺) om een andere route te kiezen!' };
  }
}
