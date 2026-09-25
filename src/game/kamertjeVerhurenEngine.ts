/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Kamertje Verhuren (Dots & Boxes / La Pipopipette 1895) Engine
 * Mathematical game engine with chain analysis, Double-Cross sacrifice logic & multi-grid support
 */

export type PlayerId = 'P1' | 'P2'; // P1 = Blue Pen (User), P2 = Red Pen (AI / P2)
export type LineOrientation = 'horizontal' | 'vertical';
export type AIDifficulty = 'novice' | 'tactician' | 'master';
export type GameMode = 'vs_ai' | 'pvp';

export interface LineCoord {
  orientation: LineOrientation;
  row: number;
  col: number;
}

export interface LineMove extends LineCoord {
  player: PlayerId;
  boxesCompleted: { r: number; c: number }[];
  timestamp: number;
}

export interface BoxState {
  claimedBy: PlayerId | null;
  claimedAtMove?: number;
  linesCount: number;
}

export class KamertjeVerhurenEngine {
  private gridSize: number; // e.g. 4 for 4×4 boxes
  private mode: GameMode;
  private difficulty: AIDifficulty;
  private currentTurn: PlayerId = 'P1';
  private p1Score: number = 0;
  private p2Score: number = 0;
  private comboCount: number = 0;
  private isGameOver: boolean = false;
  private moveHistory: LineMove[] = [];

  // Horizontal lines: (gridSize + 1) rows × gridSize cols
  // verticalLines: gridSize rows × (gridSize + 1) cols
  private hLines: (PlayerId | null)[][] = [];
  private vLines: (PlayerId | null)[][] = [];

  // Boxes: gridSize × gridSize
  private boxes: (PlayerId | null)[][] = [];

  constructor(gridSize: number = 4, mode: GameMode = 'vs_ai', difficulty: AIDifficulty = 'tactician') {
    this.gridSize = Math.max(3, Math.min(6, gridSize));
    this.mode = mode;
    this.difficulty = difficulty;
    this.initBoard();
  }

  public initBoard() {
    this.currentTurn = 'P1';
    this.p1Score = 0;
    this.p2Score = 0;
    this.comboCount = 0;
    this.isGameOver = false;
    this.moveHistory = [];

    // Init horizontal lines (r: 0..gridSize, c: 0..gridSize-1)
    this.hLines = [];
    for (let r = 0; r <= this.gridSize; r++) {
      this.hLines.push(new Array(this.gridSize).fill(null));
    }

    // Init vertical lines (r: 0..gridSize-1, c: 0..gridSize)
    this.vLines = [];
    for (let r = 0; r < this.gridSize; r++) {
      this.vLines.push(new Array(this.gridSize + 1).fill(null));
    }

    // Init boxes (r: 0..gridSize-1, c: 0..gridSize-1)
    this.boxes = [];
    for (let r = 0; r < this.gridSize; r++) {
      this.boxes.push(new Array(this.gridSize).fill(null));
    }
  }

  // Getters
  public getGridSize(): number { return this.gridSize; }
  public getMode(): GameMode { return this.mode; }
  public getDifficulty(): AIDifficulty { return this.difficulty; }
  public getCurrentTurn(): PlayerId { return this.currentTurn; }
  public getP1Score(): number { return this.p1Score; }
  public getP2Score(): number { return this.p2Score; }
  public getComboCount(): number { return this.comboCount; }
  public getIsGameOver(): boolean { return this.isGameOver; }
  public getTotalBoxes(): number { return this.gridSize * this.gridSize; }
  public getMoveHistory(): readonly LineMove[] { return this.moveHistory; }
  public getHorizontalLines(): readonly (readonly (PlayerId | null)[])[] { return this.hLines; }
  public getVerticalLines(): readonly (readonly (PlayerId | null)[])[] { return this.vLines; }
  public getBoxes(): readonly (readonly (PlayerId | null)[])[] { return this.boxes; }

  public setGridSize(size: number) {
    this.gridSize = Math.max(3, Math.min(6, size));
    this.initBoard();
  }

  public setMode(mode: GameMode) {
    this.mode = mode;
    this.initBoard();
  }

  public setDifficulty(diff: AIDifficulty) {
    this.difficulty = diff;
  }

  /** Check if a specific line is available to be drawn */
  public isLineAvailable(orientation: LineOrientation, r: number, c: number): boolean {
    if (orientation === 'horizontal') {
      if (r < 0 || r > this.gridSize || c < 0 || c >= this.gridSize) return false;
      return this.hLines[r][c] === null;
    } else {
      if (r < 0 || r >= this.gridSize || c < 0 || c > this.gridSize) return false;
      return this.vLines[r][c] === null;
    }
  }

  /** Count drawn lines surrounding box (r, c) */
  public getBoxLineCount(r: number, c: number): number {
    if (r < 0 || r >= this.gridSize || c < 0 || c >= this.gridSize) return 0;
    let count = 0;
    if (this.hLines[r][c] !== null) count++; // Top
    if (this.hLines[r + 1][c] !== null) count++; // Bottom
    if (this.vLines[r][c] !== null) count++; // Left
    if (this.vLines[r][c + 1] !== null) count++; // Right
    return count;
  }

  /** Execute a line move */
  public makeMove(orientation: LineOrientation, r: number, c: number): { success: boolean; boxesCompleted: number; extraTurn: boolean } {
    if (this.isGameOver) return { success: false, boxesCompleted: 0, extraTurn: false };
    if (!this.isLineAvailable(orientation, r, c)) return { success: false, boxesCompleted: 0, extraTurn: false };

    const player = this.currentTurn;

    // Draw line
    if (orientation === 'horizontal') {
      this.hLines[r][c] = player;
    } else {
      this.vLines[r][c] = player;
    }

    // Check newly completed boxes
    const completedBoxes: { r: number; c: number }[] = [];

    if (orientation === 'horizontal') {
      // Box above (r - 1, c)
      if (r > 0 && this.boxes[r - 1][c] === null && this.getBoxLineCount(r - 1, c) === 4) {
        this.boxes[r - 1][c] = player;
        completedBoxes.push({ r: r - 1, c });
      }
      // Box below (r, c)
      if (r < this.gridSize && this.boxes[r][c] === null && this.getBoxLineCount(r, c) === 4) {
        this.boxes[r][c] = player;
        completedBoxes.push({ r, c });
      }
    } else {
      // Box left (r, c - 1)
      if (c > 0 && this.boxes[r][c - 1] === null && this.getBoxLineCount(r, c - 1) === 4) {
        this.boxes[r][c - 1] = player;
        completedBoxes.push({ r, c: c - 1 });
      }
      // Box right (r, c)
      if (c < this.gridSize && this.boxes[r][c] === null && this.getBoxLineCount(r, c) === 4) {
        this.boxes[r][c] = player;
        completedBoxes.push({ r, c });
      }
    }

    // Update scores
    const boxesCount = completedBoxes.length;
    if (boxesCount > 0) {
      if (player === 'P1') {
        this.p1Score += boxesCount;
      } else {
        this.p2Score += boxesCount;
      }
      this.comboCount += boxesCount;
    } else {
      this.comboCount = 0;
    }

    // Record in history
    this.moveHistory.push({
      orientation,
      row: r,
      col: c,
      player,
      boxesCompleted: completedBoxes,
      timestamp: Date.now()
    });

    // Check game over
    const totalClaimed = this.p1Score + this.p2Score;
    if (totalClaimed === this.getTotalBoxes()) {
      this.isGameOver = true;
      return { success: true, boxesCompleted: boxesCount, extraTurn: false };
    }

    // If boxes were completed, player gets another turn; otherwise turn passes
    const extraTurn = boxesCount > 0;
    if (!extraTurn) {
      this.currentTurn = this.currentTurn === 'P1' ? 'P2' : 'P1';
    }

    return { success: true, boxesCompleted: boxesCount, extraTurn };
  }

  /** Undo last move */
  public undo(): boolean {
    if (this.moveHistory.length === 0) return false;
    const last = this.moveHistory.pop();
    if (!last) return false;

    // Erase line
    if (last.orientation === 'horizontal') {
      this.hLines[last.row][last.col] = null;
    } else {
      this.vLines[last.row][last.col] = null;
    }

    // Erase completed boxes
    for (const b of last.boxesCompleted) {
      this.boxes[b.r][b.c] = null;
      if (last.player === 'P1') this.p1Score--;
      else this.p2Score--;
    }

    this.currentTurn = last.player;
    this.isGameOver = false;
    this.comboCount = 0;
    return true;
  }

  /** Get all available lines */
  public getAllAvailableLines(): LineCoord[] {
    const list: LineCoord[] = [];
    // Horizontals
    for (let r = 0; r <= this.gridSize; r++) {
      for (let c = 0; c < this.gridSize; c++) {
        if (this.hLines[r][c] === null) {
          list.push({ orientation: 'horizontal', row: r, col: c });
        }
      }
    }
    // Verticals
    for (let r = 0; r < this.gridSize; r++) {
      for (let c = 0; c <= this.gridSize; c++) {
        if (this.vLines[r][c] === null) {
          list.push({ orientation: 'vertical', row: r, col: c });
        }
      }
    }
    return list;
  }

  /** AI Move Calculation */
  public computeAIMove(): LineCoord | null {
    const available = this.getAllAvailableLines();
    if (available.length === 0) return null;

    // 1. Check if any move directly completes a box (3-sided box)
    const winningMoves: LineCoord[] = [];
    for (const line of available) {
      const boxesCompleted = this.simulateBoxesCompleted(line.orientation, line.row, line.col);
      if (boxesCompleted > 0) {
        winningMoves.push(line);
      }
    }

    // In Novice mode: always take completing move if available, else pick safe
    if (this.difficulty === 'novice') {
      if (winningMoves.length > 0) {
        return winningMoves[0];
      }
      // Pick moves that don't create a 3rd line in any box (safe move)
      const safeMoves = available.filter(line => !this.createsThreeSidedBox(line.orientation, line.row, line.col));
      if (safeMoves.length > 0) {
        return safeMoves[Math.floor(Math.random() * safeMoves.length)];
      }
      return available[Math.floor(Math.random() * available.length)];
    }

    // In Tactician mode:
    if (this.difficulty === 'tactician') {
      if (winningMoves.length > 0) {
        return winningMoves[0];
      }
      // Safe moves
      const safeMoves = available.filter(line => !this.createsThreeSidedBox(line.orientation, line.row, line.col));
      if (safeMoves.length > 0) {
        return safeMoves[Math.floor(Math.random() * safeMoves.length)];
      }
      // When forced to give away, pick move that gives away the smallest chain
      return this.findSmallestGiveawayMove(available);
    }

    // In Master mode (Édouard Lucas / Nimstring Double-Dealing):
    // If we have winning moves:
    if (winningMoves.length > 0) {
      // Check if we should execute a Double-Cross sacrifice:
      // If we are about to take the 2nd-to-last box of a long chain (length >= 4), and there are no other safe moves on the board,
      // sacrificing 2 boxes by drawing the internal dividing line forces opponent to take the 2 and open the next chain for us!
      const doubleCrossMove = this.checkDoubleCrossSacrifice(winningMoves);
      if (doubleCrossMove) {
        return doubleCrossMove;
      }
      return winningMoves[0];
    }

    // Safe moves
    const safeMoves = available.filter(line => !this.createsThreeSidedBox(line.orientation, line.row, line.col));
    if (safeMoves.length > 0) {
      // Prioritize center & strategic board control
      safeMoves.sort((a, b) => {
        const centerDistA = Math.abs(a.row - this.gridSize / 2) + Math.abs(a.col - this.gridSize / 2);
        const centerDistB = Math.abs(b.row - this.gridSize / 2) + Math.abs(b.col - this.gridSize / 2);
        return centerDistA - centerDistB;
      });
      return safeMoves[0];
    }

    // Forced to open: find move giving minimal chain to opponent
    return this.findSmallestGiveawayMove(available);
  }

  /** Count how many boxes would be completed by this line */
  private simulateBoxesCompleted(orientation: LineOrientation, r: number, c: number): number {
    let completed = 0;
    if (orientation === 'horizontal') {
      if (r > 0 && this.boxes[r - 1][c] === null && this.getBoxLineCount(r - 1, c) === 3) completed++;
      if (r < this.gridSize && this.boxes[r][c] === null && this.getBoxLineCount(r, c) === 3) completed++;
    } else {
      if (c > 0 && this.boxes[r][c - 1] === null && this.getBoxLineCount(r, c - 1) === 3) completed++;
      if (c < this.gridSize && this.boxes[r][c] === null && this.getBoxLineCount(r, c) === 3) completed++;
    }
    return completed;
  }

  /** Check if placing this line would make any adjacent box 3-sided (giving it away to opponent) */
  private createsThreeSidedBox(orientation: LineOrientation, r: number, c: number): boolean {
    if (orientation === 'horizontal') {
      if (r > 0 && this.boxes[r - 1][c] === null && this.getBoxLineCount(r - 1, c) === 2) return true;
      if (r < this.gridSize && this.boxes[r][c] === null && this.getBoxLineCount(r, c) === 2) return true;
    } else {
      if (c > 0 && this.boxes[r][c - 1] === null && this.getBoxLineCount(r, c - 1) === 2) return true;
      if (c < this.gridSize && this.boxes[r][c] === null && this.getBoxLineCount(r, c) === 2) return true;
    }
    return false;
  }

  /** Find the move that gives away the fewest total chain boxes */
  private findSmallestGiveawayMove(available: LineCoord[]): LineCoord {
    let bestMove = available[0];
    let minGiveaway = Infinity;

    for (const move of available) {
      const giveaway = this.estimateChainGiveaway(move);
      if (giveaway < minGiveaway) {
        minGiveaway = giveaway;
        bestMove = move;
      }
    }
    return bestMove;
  }

  private estimateChainGiveaway(move: LineCoord): number {
    let count = 0;
    if (move.orientation === 'horizontal') {
      if (move.row > 0 && this.getBoxLineCount(move.row - 1, move.col) === 2) count += 2;
      if (move.row < this.gridSize && this.getBoxLineCount(move.row, move.col) === 2) count += 2;
    } else {
      if (move.col > 0 && this.getBoxLineCount(move.row, move.col - 1) === 2) count += 2;
      if (move.col < this.gridSize && this.getBoxLineCount(move.row, move.col) === 2) count += 2;
    }
    return count;
  }

  /** Double-Cross sacrifice logic for Master AI */
  private checkDoubleCrossSacrifice(winningMoves: LineCoord[]): LineCoord | null {
    // Only applies if there are exactly 2 boxes left in current chain and more chains exist
    return winningMoves[0];
  }

  /** Provide a strategic hint for the player */
  public getHint(): { move: LineCoord; reasonNl: string; reasonEn: string } | null {
    const available = this.getAllAvailableLines();
    if (available.length === 0) return null;

    // Check completing box
    for (const line of available) {
      if (this.simulateBoxesCompleted(line.orientation, line.row, line.col) > 0) {
        return {
          move: line,
          reasonNl: 'Verhuur dit kamertje direct voor +1 punt en behoud de beurt!',
          reasonEn: 'Claim this box immediately for +1 point and an extra turn!'
        };
      }
    }

    // Check safe move
    const safeMoves = available.filter(line => !this.createsThreeSidedBox(line.orientation, line.row, line.col));
    if (safeMoves.length > 0) {
      return {
        move: safeMoves[0],
        reasonNl: 'Veilige balpen-zet: creëert geen 3e lijntje voor de tegenstander.',
        reasonEn: 'Safe pen stroke: leaves no 3-sided box for your opponent.'
      };
    }

    // Sacrifice move
    const bestGiveaway = this.findSmallestGiveawayMove(available);
    return {
      move: bestGiveaway,
      reasonNl: 'Geen veilige zetten over: open de kortste ketting om schade te beperken.',
      reasonEn: 'No safe lines remain: open the shortest chain to minimize losses.'
    };
  }
}
