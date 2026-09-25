/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type PlayerPiece = 'X' | 'O';
export type CellState = PlayerPiece | null;
export type AIDifficulty = 'novice' | 'veteran' | 'master';
export type GameMode = 'pvp' | 'ai';

export interface WinningLine {
  id: number;
  indices: [number, number, number, number];
  type: 'axial_x' | 'axial_y' | 'axial_z' | 'diag_xy' | 'diag_xz' | 'diag_yz' | 'space_diag';
  descriptionNl: string;
  descriptionEn: string;
}

export interface MoveRecord {
  index: number;
  player: PlayerPiece;
  layer: number; // 0..3 (Layer 1..4)
  row: number;   // 0..3 (Row A..D)
  col: number;   // 0..3 (Col 1..4)
  notation: string;
}

export interface GameState {
  board: CellState[];
  currentPlayer: PlayerPiece;
  winner: PlayerPiece | 'draw' | null;
  winningLine: WinningLine | null;
  winningIndices: number[] | null;
  moveHistory: MoveRecord[];
  isThinking: boolean;
  threats: number[]; // indices of immediate winning threats for either player
}

// Generate all 76 winning lines for a 4x4x4 cube
function generateWinningLines(): WinningLine[] {
  const lines: WinningLine[] = [];
  let id = 0;

  const toIdx = (x: number, y: number, z: number) => z * 16 + y * 4 + x;

  // 1. Axial lines along X (fixed y, z) -> 16 lines
  for (let z = 0; z < 4; z++) {
    for (let y = 0; y < 4; y++) {
      lines.push({
        id: id++,
        indices: [toIdx(0, y, z), toIdx(1, y, z), toIdx(2, y, z), toIdx(3, y, z)],
        type: 'axial_x',
        descriptionNl: `Laag ${z + 1}, Rij ${String.fromCharCode(65 + y)} (Horizontaal)`,
        descriptionEn: `Layer ${z + 1}, Row ${String.fromCharCode(65 + y)} (Horizontal)`
      });
    }
  }

  // 2. Axial lines along Y (fixed x, z) -> 16 lines
  for (let z = 0; z < 4; z++) {
    for (let x = 0; x < 4; x++) {
      lines.push({
        id: id++,
        indices: [toIdx(x, 0, z), toIdx(x, 1, z), toIdx(x, 2, z), toIdx(x, 3, z)],
        type: 'axial_y',
        descriptionNl: `Laag ${z + 1}, Kolom ${x + 1} (Diepte)`,
        descriptionEn: `Layer ${z + 1}, Column ${x + 1} (Depth)`
      });
    }
  }

  // 3. Axial lines along Z (fixed x, y) -> 16 vertical pillars
  for (let y = 0; y < 4; y++) {
    for (let x = 0; x < 4; x++) {
      lines.push({
        id: id++,
        indices: [toIdx(x, y, 0), toIdx(x, y, 1), toIdx(x, y, 2), toIdx(x, y, 3)],
        type: 'axial_z',
        descriptionNl: `Verticale Pilaar (${String.fromCharCode(65 + y)}${x + 1})`,
        descriptionEn: `Vertical Pillar (${String.fromCharCode(65 + y)}${x + 1})`
      });
    }
  }

  // 4. Planar diagonals in XY planes (fixed z) -> 8 lines
  for (let z = 0; z < 4; z++) {
    lines.push({
      id: id++,
      indices: [toIdx(0, 0, z), toIdx(1, 1, z), toIdx(2, 2, z), toIdx(3, 3, z)],
      type: 'diag_xy',
      descriptionNl: `Laag ${z + 1}, Diagonaal (Links-Boven naar Rechts-Onder)`,
      descriptionEn: `Layer ${z + 1}, Diagonal (Top-Left to Bottom-Right)`
    });
    lines.push({
      id: id++,
      indices: [toIdx(0, 3, z), toIdx(1, 2, z), toIdx(2, 1, z), toIdx(3, 0, z)],
      type: 'diag_xy',
      descriptionNl: `Laag ${z + 1}, Diagonaal (Rechts-Boven naar Links-Onder)`,
      descriptionEn: `Layer ${z + 1}, Diagonal (Top-Right to Bottom-Left)`
    });
  }

  // 5. Planar diagonals in XZ planes (fixed y) -> 8 lines
  for (let y = 0; y < 4; y++) {
    lines.push({
      id: id++,
      indices: [toIdx(0, y, 0), toIdx(1, y, 1), toIdx(2, y, 2), toIdx(3, y, 3)],
      type: 'diag_xz',
      descriptionNl: `Verticale Schijf Rij ${String.fromCharCode(65 + y)}, Schuine Stijging (X-Z)`,
      descriptionEn: `Vertical Slice Row ${String.fromCharCode(65 + y)}, Diagonal Rise (X-Z)`
    });
    lines.push({
      id: id++,
      indices: [toIdx(0, y, 3), toIdx(1, y, 2), toIdx(2, y, 1), toIdx(3, y, 0)],
      type: 'diag_xz',
      descriptionNl: `Verticale Schijf Rij ${String.fromCharCode(65 + y)}, Schuine Daling (X-Z)`,
      descriptionEn: `Vertical Slice Row ${String.fromCharCode(65 + y)}, Diagonal Descent (X-Z)`
    });
  }

  // 6. Planar diagonals in YZ planes (fixed x) -> 8 lines
  for (let x = 0; x < 4; x++) {
    lines.push({
      id: id++,
      indices: [toIdx(x, 0, 0), toIdx(x, 1, 1), toIdx(x, 2, 2), toIdx(x, 3, 3)],
      type: 'diag_yz',
      descriptionNl: `Verticale Schijf Kolom ${x + 1}, Schuine Stijging (Y-Z)`,
      descriptionEn: `Vertical Slice Col ${x + 1}, Diagonal Rise (Y-Z)`
    });
    lines.push({
      id: id++,
      indices: [toIdx(x, 0, 3), toIdx(x, 1, 2), toIdx(x, 2, 1), toIdx(x, 3, 0)],
      type: 'diag_yz',
      descriptionNl: `Verticale Schijf Kolom ${x + 1}, Schuine Daling (Y-Z)`,
      descriptionEn: `Vertical Slice Col ${x + 1}, Diagonal Descent (Y-Z)`
    });
  }

  // 7. Space Diagonals (3D diagonals connecting opposite cube corners) -> 4 lines
  lines.push({
    id: id++,
    indices: [toIdx(0, 0, 0), toIdx(1, 1, 1), toIdx(2, 2, 2), toIdx(3, 3, 3)],
    type: 'space_diag',
    descriptionNl: `3D Hoofddiagonaal (L1-A1 naar L4-D4)`,
    descriptionEn: `3D Main Space Diagonal (L1-A1 to L4-D4)`
  });
  lines.push({
    id: id++,
    indices: [toIdx(3, 0, 0), toIdx(2, 1, 1), toIdx(1, 2, 2), toIdx(0, 3, 3)],
    type: 'space_diag',
    descriptionNl: `3D Hoofddiagonaal (L1-A4 naar L4-D1)`,
    descriptionEn: `3D Main Space Diagonal (L1-A4 to L4-D1)`
  });
  lines.push({
    id: id++,
    indices: [toIdx(0, 3, 0), toIdx(1, 2, 1), toIdx(2, 1, 2), toIdx(3, 0, 3)],
    type: 'space_diag',
    descriptionNl: `3D Hoofddiagonaal (L1-D1 naar L4-A4)`,
    descriptionEn: `3D Main Space Diagonal (L1-D1 to L4-A4)`
  });
  lines.push({
    id: id++,
    indices: [toIdx(3, 3, 0), toIdx(2, 2, 1), toIdx(1, 1, 2), toIdx(0, 0, 3)],
    type: 'space_diag',
    descriptionNl: `3D Hoofddiagonaal (L1-D4 naar L4-A1)`,
    descriptionEn: `3D Main Space Diagonal (L1-D4 to L4-A1)`
  });

  return lines;
}

export const WINNING_LINES = generateWinningLines();

// Pre-build index-to-lines mapping for fast evaluation
const LINES_FOR_CELL: WinningLine[][] = Array.from({ length: 64 }, () => []);
WINNING_LINES.forEach(line => {
  line.indices.forEach(idx => {
    LINES_FOR_CELL[idx].push(line);
  });
});

// Strategic weights: corner and inner-cube cells (7 lines) = weight 7, others (4 lines) = weight 4
export const CELL_STRATEGIC_WEIGHTS = LINES_FOR_CELL.map(lines => lines.length);

export function indexToCoord(idx: number): { x: number; y: number; z: number } {
  return {
    z: Math.floor(idx / 16),
    y: Math.floor((idx % 16) / 4),
    x: idx % 4
  };
}

export function coordToIndex(x: number, y: number, z: number): number {
  return z * 16 + y * 4 + x;
}

export function getNotation(idx: number): string {
  const { x, y, z } = indexToCoord(idx);
  return `L${z + 1}-${String.fromCharCode(65 + y)}${x + 1}`;
}

export class Radarsoft3DEngine {
  private board: CellState[] = Array(64).fill(null);
  private currentPlayer: PlayerPiece = 'X';
  private winner: PlayerPiece | 'draw' | null = null;
  private winningLine: WinningLine | null = null;
  private moveHistory: MoveRecord[] = [];
  private mode: GameMode = 'ai';
  private aiPlayer: PlayerPiece = 'O';
  private aiDifficulty: AIDifficulty = 'veteran';
  private isThinking: boolean = false;

  constructor(mode: GameMode = 'ai', aiDifficulty: AIDifficulty = 'veteran', aiPlayer: PlayerPiece = 'O') {
    this.mode = mode;
    this.aiDifficulty = aiDifficulty;
    this.aiPlayer = aiPlayer;
    this.reset();
  }

  public reset() {
    this.board = Array(64).fill(null);
    this.currentPlayer = 'X';
    this.winner = null;
    this.winningLine = null;
    this.moveHistory = [];
    this.isThinking = false;

    // If AI goes first
    if (this.mode === 'ai' && this.currentPlayer === this.aiPlayer) {
      this.triggerAIMove();
    }
  }

  public setConfig(mode: GameMode, difficulty: AIDifficulty, aiPlayer: PlayerPiece) {
    this.mode = mode;
    this.aiDifficulty = difficulty;
    this.aiPlayer = aiPlayer;
    this.reset();
  }

  public getBoard(): readonly CellState[] {
    return this.board;
  }

  public getCurrentPlayer(): PlayerPiece {
    return this.currentPlayer;
  }

  public getWinner(): PlayerPiece | 'draw' | null {
    return this.winner;
  }

  public getWinningLine(): WinningLine | null {
    return this.winningLine;
  }

  public getMoveHistory(): readonly MoveRecord[] {
    return this.moveHistory;
  }

  public isAIThinking(): boolean {
    return this.isThinking;
  }

  public getAIPlayer(): PlayerPiece {
    return this.aiPlayer;
  }

  public getThreats(): number[] {
    // Return all cells that would immediately complete 4-in-a-row for either player
    const threats = new Set<number>();
    for (const line of WINNING_LINES) {
      let xCount = 0;
      let oCount = 0;
      let emptyIdx = -1;

      for (const idx of line.indices) {
        const val = this.board[idx];
        if (val === 'X') xCount++;
        else if (val === 'O') oCount++;
        else emptyIdx = idx;
      }

      if ((xCount === 3 && oCount === 0) || (oCount === 3 && xCount === 0)) {
        if (emptyIdx !== -1) {
          threats.add(emptyIdx);
        }
      }
    }
    return Array.from(threats);
  }

  public canMakeMove(idx: number): boolean {
    if (idx < 0 || idx >= 64) return false;
    if (this.board[idx] !== null) return false;
    if (this.winner !== null) return false;
    if (this.isThinking) return false;
    if (this.mode === 'ai' && this.currentPlayer === this.aiPlayer) return false;
    return true;
  }

  public makeMove(idx: number): boolean {
    if (idx < 0 || idx >= 64 || this.board[idx] !== null || this.winner !== null) {
      return false;
    }

    const { x, y, z } = indexToCoord(idx);
    this.board[idx] = this.currentPlayer;
    this.moveHistory.push({
      index: idx,
      player: this.currentPlayer,
      layer: z,
      row: y,
      col: x,
      notation: getNotation(idx)
    });

    // Check win condition
    const win = this.checkWin();
    if (win) {
      this.winner = this.currentPlayer;
      this.winningLine = win;
      return true;
    }

    // Check draw (all 64 cells filled)
    if (this.moveHistory.length === 64) {
      this.winner = 'draw';
      return true;
    }

    // Switch turn
    this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';

    // If next is AI
    if (this.mode === 'ai' && this.currentPlayer === this.aiPlayer && this.winner === null) {
      this.triggerAIMove();
    }

    return true;
  }

  public undoMove(): boolean {
    if (this.moveHistory.length === 0 || this.isThinking) return false;

    // In AI mode, undo both the AI move and player's move so player can re-try
    if (this.mode === 'ai') {
      if (this.moveHistory.length >= 2) {
        const last1 = this.moveHistory.pop()!;
        this.board[last1.index] = null;
        const last2 = this.moveHistory.pop()!;
        this.board[last2.index] = null;
      } else {
        const last = this.moveHistory.pop()!;
        this.board[last.index] = null;
      }
      this.currentPlayer = this.aiPlayer === 'O' ? 'X' : 'O';
    } else {
      const last = this.moveHistory.pop()!;
      this.board[last.index] = null;
      this.currentPlayer = last.player;
    }

    this.winner = null;
    this.winningLine = null;
    return true;
  }

  private checkWin(): WinningLine | null {
    for (const line of WINNING_LINES) {
      const [a, b, c, d] = line.indices;
      const val = this.board[a];
      if (val !== null && val === this.board[b] && val === this.board[c] && val === this.board[d]) {
        return line;
      }
    }
    return null;
  }

  // Hint calculation for human player
  public getHint(): { index: number; reasonNl: string; reasonEn: string } | null {
    if (this.winner !== null) return null;
    const bestIdx = this.calculateBestMove(this.currentPlayer, 'master');
    if (bestIdx === -1) return null;

    // Reason
    const winningMove = this.findWinningMove(this.currentPlayer);
    if (winningMove === bestIdx) {
      return {
        index: bestIdx,
        reasonNl: `Plaats op ${getNotation(bestIdx)} om direct 4-op-een-rij te maken en te winnen!`,
        reasonEn: `Place on ${getNotation(bestIdx)} to immediately complete 4-in-a-row and win!`
      };
    }

    const opponent = this.currentPlayer === 'X' ? 'O' : 'X';
    const blockMove = this.findWinningMove(opponent);
    if (blockMove === bestIdx) {
      return {
        index: bestIdx,
        reasonNl: `Blokkeer ${getNotation(bestIdx)} direct! De tegenstander dreigt hier te winnen.`,
        reasonEn: `Block ${getNotation(bestIdx)} immediately! Opponent threatens to win here.`
      };
    }

    return {
      index: bestIdx,
      reasonNl: `Strategisch kruispunt op ${getNotation(bestIdx)} met ${CELL_STRATEGIC_WEIGHTS[bestIdx]} winlijnen en vorkpotentie.`,
      reasonEn: `Strategic crossroads at ${getNotation(bestIdx)} with ${CELL_STRATEGIC_WEIGHTS[bestIdx]} win lines and fork potential.`
    };
  }

  private triggerAIMove() {
    this.isThinking = true;
    // Delay simulates C64 SID computation and allows smooth UI rendering
    const delay = this.aiDifficulty === 'novice' ? 350 : this.aiDifficulty === 'veteran' ? 500 : 700;

    setTimeout(() => {
      if (this.winner !== null) {
        this.isThinking = false;
        return;
      }

      const bestIdx = this.calculateBestMove(this.aiPlayer, this.aiDifficulty);
      if (bestIdx !== -1) {
        const { x, y, z } = indexToCoord(bestIdx);
        this.board[bestIdx] = this.aiPlayer;
        this.moveHistory.push({
          index: bestIdx,
          player: this.aiPlayer,
          layer: z,
          row: y,
          col: x,
          notation: getNotation(bestIdx)
        });

        const win = this.checkWin();
        if (win) {
          this.winner = this.aiPlayer;
          this.winningLine = win;
        } else if (this.moveHistory.length === 64) {
          this.winner = 'draw';
        } else {
          this.currentPlayer = this.aiPlayer === 'X' ? 'O' : 'X';
        }
      }
      this.isThinking = false;
    }, delay);
  }

  // Find a move that immediately completes 4-in-a-row for player
  private findWinningMove(player: PlayerPiece): number {
    for (const line of WINNING_LINES) {
      let count = 0;
      let emptyIdx = -1;
      for (const idx of line.indices) {
        if (this.board[idx] === player) count++;
        else if (this.board[idx] === null) emptyIdx = idx;
        else {
          count = -10;
          break;
        }
      }
      if (count === 3 && emptyIdx !== -1) {
        return emptyIdx;
      }
    }
    return -1;
  }

  // Find moves that create a fork (at least two 3-in-a-rows with open ends)
  private findForkMove(player: PlayerPiece): number {
    const candidateScores: Record<number, number> = {};

    for (let i = 0; i < 64; i++) {
      if (this.board[i] !== null) continue;

      // Simulate placing piece at i
      this.board[i] = player;
      let winningThreats = 0;

      for (const line of LINES_FOR_CELL[i]) {
        let count = 0;
        let empty = 0;
        for (const idx of line.indices) {
          if (this.board[idx] === player) count++;
          else if (this.board[idx] === null) empty++;
        }
        if (count === 3 && empty === 1) {
          winningThreats++;
        }
      }

      this.board[i] = null; // Revert

      if (winningThreats >= 2) {
        candidateScores[i] = winningThreats;
      }
    }

    const forkIndices = Object.keys(candidateScores).map(Number);
    if (forkIndices.length > 0) {
      // Pick best fork by strategic weight
      return forkIndices.sort((a, b) => CELL_STRATEGIC_WEIGHTS[b] - CELL_STRATEGIC_WEIGHTS[a])[0];
    }
    return -1;
  }

  private calculateBestMove(player: PlayerPiece, difficulty: AIDifficulty): number {
    const opponent = player === 'X' ? 'O' : 'X';
    const emptyCells: number[] = [];
    for (let i = 0; i < 64; i++) {
      if (this.board[i] === null) emptyCells.push(i);
    }
    if (emptyCells.length === 0) return -1;

    // 1. Can we win right now? ALWAYS take winning move
    const myWin = this.findWinningMove(player);
    if (myWin !== -1) return myWin;

    // 2. Can opponent win right now? Block immediately
    const oppWin = this.findWinningMove(opponent);
    if (oppWin !== -1) return oppWin;

    // Novice level: occasionally makes sub-optimal moves or chooses random weighted position
    if (difficulty === 'novice' && Math.random() < 0.35) {
      // Pick a random available cell weighted somewhat by line count
      emptyCells.sort(() => Math.random() - 0.5);
      return emptyCells[0];
    }

    // 3. Can we create a fork (two winning lines at once)?
    const myFork = this.findForkMove(player);
    if (myFork !== -1) return myFork;

    // 4. Can opponent create a fork? Block opponent's fork!
    const oppFork = this.findForkMove(opponent);
    if (oppFork !== -1 && difficulty !== 'novice') return oppFork;

    // 5. Positional Heuristic Evaluation of all available cells
    // Score each cell based on how many unblocked friendly lines it advances,
    // and how many enemy lines it blocks.
    let bestScore = -Infinity;
    let bestMoves: number[] = [];

    for (const cell of emptyCells) {
      let score = CELL_STRATEGIC_WEIGHTS[cell] * 2;

      for (const line of LINES_FOR_CELL[cell]) {
        let myCount = 0;
        let oppCount = 0;

        for (const idx of line.indices) {
          if (idx === cell) continue;
          if (this.board[idx] === player) myCount++;
          else if (this.board[idx] === opponent) oppCount++;
        }

        if (myCount > 0 && oppCount === 0) {
          // Pure friendly line
          if (myCount === 2) score += 50; // Creates 3 in a row!
          else if (myCount === 1) score += 15; // Creates 2 in a row
          else score += 5;
        } else if (oppCount > 0 && myCount === 0) {
          // Blocking enemy line
          if (oppCount === 2) score += 35; // Block 2-in-a-row from becoming 3
          else if (oppCount === 1) score += 10;
          else score += 3;
        }
      }

      // Add a tiny random jitter so games are varied
      score += Math.random() * 2;

      if (score > bestScore) {
        bestScore = score;
        bestMoves = [cell];
      } else if (Math.abs(score - bestScore) < 0.01) {
        bestMoves.push(cell);
      }
    }

    return bestMoves[Math.floor(Math.random() * bestMoves.length)];
  }
}
