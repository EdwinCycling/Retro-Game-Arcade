/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type StrategoSide = 'red' | 'blue';
export type StrategoRank = 'F' | 'B' | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
export type AIDifficulty = 'novice' | 'tactician' | 'grandmaster';

export interface StrategoPiece {
  id: string;
  side: StrategoSide;
  rank: StrategoRank;
  isRevealed: boolean;
  hasMoved: boolean;
}

export interface StrategoSquare {
  x: number;
  y: number;
  isLake: boolean;
  piece: StrategoPiece | null;
}

export interface CombatResult {
  attacker: StrategoPiece;
  defender: StrategoPiece;
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  outcome: 'attacker_wins' | 'defender_wins' | 'mutual_destruction' | 'flag_captured' | 'bomb_defused' | 'spy_assassination';
  winnerSide: StrategoSide | null; // null if mutual
}

export interface StrategoMove {
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  piece: StrategoPiece;
  combatResult?: CombatResult;
}

// 10x10 Board Coordinate Helpers
export const BOARD_SIZE = 10;

export function isLakeSquare(x: number, y: number): boolean {
  return (
    (y === 4 || y === 5) &&
    ((x === 2 || x === 3) || (x === 6 || x === 7))
  );
}

export const RANK_NAMES: Record<StrategoRank, { nl: string; en: string; icon: string; count: number }> = {
  'F': { nl: 'Vlag', en: 'Flag', icon: '🚩', count: 1 },
  'B': { nl: 'Bom', en: 'Bomb', icon: '💣', count: 6 },
  10: { nl: 'Maarschalk', en: 'Marshal', icon: '⭐', count: 1 },
  9: { nl: 'Generaal', en: 'General', icon: '🎖️', count: 1 },
  8: { nl: 'Kolonel', en: 'Colonel', icon: '🦅', count: 2 },
  7: { nl: 'Majoor', en: 'Major', icon: '⚜️', count: 3 },
  6: { nl: 'Kapitein', en: 'Captain', icon: '⚔️', count: 4 },
  5: { nl: 'Luitenant', en: 'Lieutenant', icon: '🛡️', count: 4 },
  4: { nl: 'Sergeant', en: 'Sergeant', icon: '🪖', count: 4 },
  3: { nl: 'Mineur', en: 'Miner', icon: '⛏️', count: 5 },
  2: { nl: 'Verkenner', en: 'Scout', icon: '🐎', count: 8 },
  1: { nl: 'Spion', en: 'Spy', icon: '🗡️', count: 1 }
};

// Preset Army Formations (40 pieces placed across 4 rows = rows 0..3 for Blue, rows 6..9 for Red)
export type FormationPreset = 'balanced' | 'corner_fortress' | 'bluff' | 'miner_blitz' | 'random';

export const PRESET_FORMATIONS: Record<FormationPreset, { nameNl: string; nameEn: string; ranks: StrategoRank[] }> = {
  balanced: {
    nameNl: 'Klassiek & Gebalanceerd',
    nameEn: 'Classic & Balanced',
    ranks: [
      // Row 4 (Frontline closest to lakes)
      2, 2, 6, 7, 2, 2, 7, 6, 2, 2,
      // Row 3 (Mid-front)
      4, 3, 5, 8, 4, 3, 8, 5, 4, 3,
      // Row 2 (Heavy core & Miners)
      9, 10, 5, 6, 1, 6, 5, 3, 4, 7,
      // Row 1 (Back defense & Flag)
      'B', 'B', 'B', 'B', 'B', 'B', 3, 2, 2, 'F'
    ]
  },
  corner_fortress: {
    nameNl: 'Fortress Hoekverdediging',
    nameEn: 'Corner Fortress',
    ranks: [
      // Row 4 (Front)
      2, 7, 2, 6, 2, 7, 6, 2, 5, 2,
      // Row 3
      3, 8, 4, 3, 5, 4, 8, 3, 4, 2,
      // Row 2
      10, 9, 6, 1, 5, 7, 4, 6, 'B', 'B',
      // Row 1 (Back row: Flag enclosed by bombs in corner)
      5, 3, 2, 3, 2, 'B', 'B', 'B', 'B', 'F'
    ]
  },
  bluff: {
    nameNl: 'Bluf & Valse Vlag',
    nameEn: 'Bluff & Decoy',
    ranks: [
      // Row 4
      2, 2, 8, 2, 7, 6, 2, 8, 2, 2,
      // Row 3
      4, 6, 5, 9, 10, 5, 6, 4, 3, 3,
      // Row 2 (Flag on row 2 protected by heavy pieces, fake corner bomb trap)
      7, 3, 1, 'F', 5, 4, 3, 7, 'B', 'B',
      // Row 1
      'B', 'B', 'B', 'B', 5, 4, 3, 2, 6, 2
    ]
  },
  miner_blitz: {
    nameNl: 'Mineuren Storm (Aanval)',
    nameEn: 'Miner Blitz (Aggressive)',
    ranks: [
      // Row 4 (Heavy Miner presence in front)
      3, 3, 2, 7, 8, 8, 7, 2, 3, 3,
      // Row 3
      2, 10, 6, 5, 9, 6, 5, 2, 4, 3,
      // Row 2
      4, 1, 5, 4, 7, 6, 5, 4, 2, 2,
      // Row 1
      'B', 'B', 'B', 2, 6, 2, 'B', 'B', 'B', 'F'
    ]
  },
  random: {
    nameNl: 'Dynamisch Willekeurig',
    nameEn: 'Dynamic Random',
    ranks: [] // Filled dynamically
  }
};

export function createPiecePool(side: StrategoSide): StrategoPiece[] {
  const pieces: StrategoPiece[] = [];
  let idCounter = 0;

  Object.entries(RANK_NAMES).forEach(([rankKey, meta]) => {
    const rank = (rankKey === 'F' || rankKey === 'B' ? rankKey : Number(rankKey)) as StrategoRank;
    for (let i = 0; i < meta.count; i++) {
      pieces.push({
        id: `${side}-${rank}-${idCounter++}`,
        side,
        rank,
        isRevealed: false,
        hasMoved: false
      });
    }
  });

  return pieces;
}

export function generateFormation(preset: FormationPreset, side: StrategoSide): StrategoPiece[] {
  const pool = createPiecePool(side);
  if (preset === 'random') {
    // Shuffle randomly ensuring flag and bombs are in back 3 rows
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    return pool;
  }

  const ranks = PRESET_FORMATIONS[preset].ranks;
  const result: StrategoPiece[] = [];
  const remaining = [...pool];

  ranks.forEach(targetRank => {
    const idx = remaining.findIndex(p => p.rank === targetRank);
    if (idx !== -1) {
      result.push(remaining.splice(idx, 1)[0]);
    } else if (remaining.length > 0) {
      result.push(remaining.pop()!);
    }
  });

  return result.concat(remaining);
}

export class StrategoEngine {
  private grid: StrategoSquare[][] = [];
  private phase: 'setup' | 'playing' | 'game_over' = 'setup';
  private currentTurn: StrategoSide = 'red'; // Red starts
  private winner: StrategoSide | 'draw' | null = null;
  private winReason: string = '';
  private moveHistory: StrategoMove[] = [];
  private capturedRed: StrategoPiece[] = [];
  private capturedBlue: StrategoPiece[] = [];
  private lastCombat: CombatResult | null = null;
  private aiDifficulty: AIDifficulty = 'tactician';
  private isThinking: boolean = false;

  constructor(difficulty: AIDifficulty = 'tactician') {
    this.aiDifficulty = difficulty;
    this.initBoard();
  }

  public initBoard() {
    this.grid = [];
    for (let y = 0; y < BOARD_SIZE; y++) {
      const row: StrategoSquare[] = [];
      for (let x = 0; x < BOARD_SIZE; x++) {
        row.push({
          x,
          y,
          isLake: isLakeSquare(x, y),
          piece: null
        });
      }
      this.grid.push(row);
    }

    this.phase = 'setup';
    this.currentTurn = 'red';
    this.winner = null;
    this.winReason = '';
    this.moveHistory = [];
    this.capturedRed = [];
    this.capturedBlue = [];
    this.lastCombat = null;
    this.isThinking = false;

    // Apply default formations for Red (bottom: y=6..9) and Blue (top: y=0..3)
    this.applyFormation('red', 'balanced');
    this.applyFormation('blue', 'corner_fortress');
  }

  public applyFormation(side: StrategoSide, preset: FormationPreset) {
    const pieces = generateFormation(preset, side);
    let pIdx = 0;

    if (side === 'blue') {
      // Rows 0..3 for Blue
      for (let y = 0; y <= 3; y++) {
        for (let x = 0; x < BOARD_SIZE; x++) {
          if (pIdx < pieces.length) {
            this.grid[y][x].piece = pieces[pIdx++];
          }
        }
      }
    } else {
      // Rows 6..9 for Red (invert row order so index 0 of preset is frontline y=6)
      for (let y = 6; y <= 9; y++) {
        for (let x = 0; x < BOARD_SIZE; x++) {
          if (pIdx < pieces.length) {
            this.grid[y][x].piece = pieces[pIdx++];
          }
        }
      }
    }
  }

  public swapSetupPieces(x1: number, y1: number, x2: number, y2: number): boolean {
    if (this.phase !== 'setup') return false;
    // Both squares must belong to Red's territory (y in 6..9)
    if (y1 < 6 || y1 > 9 || y2 < 6 || y2 > 9) return false;

    const temp = this.grid[y1][x1].piece;
    this.grid[y1][x1].piece = this.grid[y2][x2].piece;
    this.grid[y2][x2].piece = temp;
    return true;
  }

  public startBattle() {
    this.phase = 'playing';
    this.currentTurn = 'red';
    this.lastCombat = null;
  }

  public getGrid(): readonly (readonly StrategoSquare[])[] {
    return this.grid;
  }

  public getPhase(): 'setup' | 'playing' | 'game_over' {
    return this.phase;
  }

  public getCurrentTurn(): StrategoSide {
    return this.currentTurn;
  }

  public getWinner(): StrategoSide | 'draw' | null {
    return this.winner;
  }

  public getWinReason(): string {
    return this.winReason;
  }

  public getMoveHistory(): readonly StrategoMove[] {
    return this.moveHistory;
  }

  public getCapturedRed(): readonly StrategoPiece[] {
    return this.capturedRed;
  }

  public getCapturedBlue(): readonly StrategoPiece[] {
    return this.capturedBlue;
  }

  public getLastCombat(): CombatResult | null {
    return this.lastCombat;
  }

  public isAIThinking(): boolean {
    return this.isThinking;
  }

  public setAIDifficulty(diff: AIDifficulty) {
    this.aiDifficulty = diff;
  }

  // Check valid moves for a piece at (x, y)
  public getValidMoves(x: number, y: number): { x: number; y: number; isAttack: boolean }[] {
    if (this.phase !== 'playing') return [];
    const sq = this.grid[y][x];
    const piece = sq.piece;
    if (!piece || piece.side !== this.currentTurn) return [];

    // Flag ('F') and Bomb ('B') cannot move
    if (piece.rank === 'F' || piece.rank === 'B') return [];

    const moves: { x: number; y: number; isAttack: boolean }[] = [];
    const directions = [
      { dx: 0, dy: -1 }, // North
      { dx: 0, dy: 1 },  // South
      { dx: -1, dy: 0 }, // West
      { dx: 1, dy: 0 }   // East
    ];

    // Scout (Rank 2) can move any number of open squares in a straight line
    const maxDist = piece.rank === 2 ? BOARD_SIZE : 1;

    for (const { dx, dy } of directions) {
      for (let dist = 1; dist <= maxDist; dist++) {
        const nx = x + dx * dist;
        const ny = y + dy * dist;

        if (nx < 0 || nx >= BOARD_SIZE || ny < 0 || ny >= BOARD_SIZE) break;

        const targetSq = this.grid[ny][nx];
        if (targetSq.isLake) break; // Cannot enter or cross lakes

        if (targetSq.piece === null) {
          moves.push({ x: nx, y: ny, isAttack: false });
        } else {
          // If square has piece: can attack if opponent piece
          if (targetSq.piece.side !== piece.side) {
            moves.push({ x: nx, y: ny, isAttack: true });
          }
          break; // Blocked by piece
        }
      }
    }

    return moves;
  }

  // Execute move from (fromX, fromY) to (toX, toY)
  public makeMove(fromX: number, fromY: number, toX: number, toY: number): boolean {
    if (this.phase !== 'playing' || this.isThinking) return false;

    const sourceSq = this.grid[fromY][fromX];
    const targetSq = this.grid[toY][toX];
    const piece = sourceSq.piece;

    if (!piece || piece.side !== this.currentTurn) return false;

    const validMoves = this.getValidMoves(fromX, fromY);
    const isValid = validMoves.some(m => m.x === toX && m.y === toY);
    if (!isValid) return false;

    const dist = Math.abs(toX - fromX) + Math.abs(toY - fromY);
    // If scout moved 2+ squares, reveal it to opponent!
    if (piece.rank === 2 && dist >= 2) {
      piece.isRevealed = true;
    }
    piece.hasMoved = true;

    // Movement without attack
    if (targetSq.piece === null) {
      targetSq.piece = piece;
      sourceSq.piece = null;
      this.lastCombat = null;

      this.moveHistory.push({
        fromX,
        fromY,
        toX,
        toY,
        piece
      });
    } else {
      // Attack & Combat Resolution!
      const defender = targetSq.piece;
      const combat = this.resolveCombat(piece, defender, fromX, fromY, toX, toY);
      this.lastCombat = combat;

      // Both pieces are now revealed
      piece.isRevealed = true;
      defender.isRevealed = true;

      if (combat.outcome === 'attacker_wins' || combat.outcome === 'bomb_defused' || combat.outcome === 'spy_assassination') {
        // Attacker captures target square
        if (defender.side === 'red') this.capturedRed.push(defender);
        else this.capturedBlue.push(defender);

        targetSq.piece = piece;
        sourceSq.piece = null;
      } else if (combat.outcome === 'defender_wins') {
        // Attacker is eliminated
        if (piece.side === 'red') this.capturedRed.push(piece);
        else this.capturedBlue.push(piece);

        sourceSq.piece = null;
      } else if (combat.outcome === 'mutual_destruction') {
        // Both eliminated
        this.capturedRed.push(piece.side === 'red' ? piece : defender);
        this.capturedBlue.push(piece.side === 'blue' ? piece : defender);

        sourceSq.piece = null;
        targetSq.piece = null;
      } else if (combat.outcome === 'flag_captured') {
        // Flag captured!
        if (defender.side === 'red') this.capturedRed.push(defender);
        else this.capturedBlue.push(defender);

        targetSq.piece = piece;
        sourceSq.piece = null;
        this.phase = 'game_over';
        this.winner = piece.side;
        this.winReason = `${piece.side === 'red' ? 'Rood' : 'Blauw'} heeft de vijandelijke vlag veroverd!`;
        return true;
      }

      this.moveHistory.push({
        fromX,
        fromY,
        toX,
        toY,
        piece,
        combatResult: combat
      });
    }

    // Check if opponent has any legal moves left
    const nextTurn: StrategoSide = this.currentTurn === 'red' ? 'blue' : 'red';
    if (!this.hasLegalMoves(nextTurn)) {
      this.phase = 'game_over';
      this.winner = this.currentTurn;
      this.winReason = `${nextTurn === 'red' ? 'Rood' : 'Blauw'} heeft geen geldige zetten meer over!`;
      return true;
    }

    // Switch Turn
    this.currentTurn = nextTurn;

    // Trigger AI move if Blue's turn
    if (this.currentTurn === 'blue' && this.phase === 'playing') {
      this.triggerAIMove();
    }

    return true;
  }

  private resolveCombat(
    attacker: StrategoPiece,
    defender: StrategoPiece,
    fromX: number,
    fromY: number,
    toX: number,
    toY: number
  ): CombatResult {
    // 1. Flag Capture -> Win
    if (defender.rank === 'F') {
      return {
        attacker,
        defender,
        fromX,
        fromY,
        toX,
        toY,
        outcome: 'flag_captured',
        winnerSide: attacker.side
      };
    }

    // 2. Bomb Defense
    if (defender.rank === 'B') {
      if (attacker.rank === 3) {
        // Miner defuses bomb!
        return {
          attacker,
          defender,
          fromX,
          fromY,
          toX,
          toY,
          outcome: 'bomb_defused',
          winnerSide: attacker.side
        };
      } else {
        // Any other piece blows up against bomb
        return {
          attacker,
          defender,
          fromX,
          fromY,
          toX,
          toY,
          outcome: 'defender_wins',
          winnerSide: defender.side
        };
      }
    }

    // 3. Spy vs Marshal
    if (attacker.rank === 1 && defender.rank === 10) {
      return {
        attacker,
        defender,
        fromX,
        fromY,
        toX,
        toY,
        outcome: 'spy_assassination',
        winnerSide: attacker.side
      };
    }

    // 4. Equal ranks -> Mutual destruction
    if (attacker.rank === defender.rank) {
      return {
        attacker,
        defender,
        fromX,
        fromY,
        toX,
        toY,
        outcome: 'mutual_destruction',
        winnerSide: null
      };
    }

    // 5. Numerical rank comparison (Higher number wins)
    const aRank = typeof attacker.rank === 'number' ? attacker.rank : 0;
    const dRank = typeof defender.rank === 'number' ? defender.rank : 0;

    if (aRank > dRank) {
      return {
        attacker,
        defender,
        fromX,
        fromY,
        toX,
        toY,
        outcome: 'attacker_wins',
        winnerSide: attacker.side
      };
    } else {
      return {
        attacker,
        defender,
        fromX,
        fromY,
        toX,
        toY,
        outcome: 'defender_wins',
        winnerSide: defender.side
      };
    }
  }

  public hasLegalMoves(side: StrategoSide): boolean {
    for (let y = 0; y < BOARD_SIZE; y++) {
      for (let x = 0; x < BOARD_SIZE; x++) {
        const p = this.grid[y][x].piece;
        if (p && p.side === side && p.rank !== 'F' && p.rank !== 'B') {
          // Check if any adjacent step is possible
          const moves = this.getValidMoves(x, y);
          if (moves.length > 0) return true;
        }
      }
    }
    return false;
  }

  // AI Logic (Fog-of-War Compliant: AI only evaluates known pieces & heuristics)
  private triggerAIMove() {
    this.isThinking = true;
    const delay = this.aiDifficulty === 'novice' ? 400 : this.aiDifficulty === 'tactician' ? 600 : 800;

    setTimeout(() => {
      if (this.phase !== 'playing' || this.currentTurn !== 'blue') {
        this.isThinking = false;
        return;
      }

      const allMoves: { fromX: number; fromY: number; toX: number; toY: number; score: number }[] = [];

      for (let y = 0; y < BOARD_SIZE; y++) {
        for (let x = 0; x < BOARD_SIZE; x++) {
          const p = this.grid[y][x].piece;
          if (p && p.side === 'blue' && p.rank !== 'F' && p.rank !== 'B') {
            const valid = this.getValidMoves(x, y);
            for (const m of valid) {
              const score = this.evaluateAIMove(x, y, m.x, m.y, p, m.isAttack);
              allMoves.push({ fromX: x, fromY: y, toX: m.x, toY: m.y, score });
            }
          }
        }
      }

      if (allMoves.length === 0) {
        this.phase = 'game_over';
        this.winner = 'red';
        this.winReason = 'Blauw heeft geen geldige zetten meer over!';
        this.isThinking = false;
        return;
      }

      // Sort moves by score descending
      allMoves.sort((a, b) => b.score - a.score);

      let selectedMove = allMoves[0];
      if (this.aiDifficulty === 'novice' && allMoves.length > 1) {
        // Pick among top 3 moves with randomness
        const topPool = allMoves.slice(0, Math.min(3, allMoves.length));
        selectedMove = topPool[Math.floor(Math.random() * topPool.length)];
      }

      this.makeMove(selectedMove.fromX, selectedMove.fromY, selectedMove.toX, selectedMove.toY);
      this.isThinking = false;
    }, delay);
  }

  private evaluateAIMove(
    fromX: number,
    fromY: number,
    toX: number,
    toY: number,
    piece: StrategoPiece,
    isAttack: boolean
  ): number {
    let score = 0;
    const pRank = typeof piece.rank === 'number' ? piece.rank : 0;

    // Movement forward bonus (Blue moves South towards y=9)
    score += (toY - fromY) * 3;

    if (isAttack) {
      const targetPiece = this.grid[toY][toX].piece;
      if (!targetPiece) return score;

      if (targetPiece.isRevealed) {
        // Known enemy piece!
        if (targetPiece.rank === 'F') {
          score += 10000; // Flag capture is top priority
        } else if (targetPiece.rank === 'B') {
          if (piece.rank === 3) score += 800; // Miner defusing known bomb
          else score -= 5000; // Do not walk into known bomb
        } else if (piece.rank === 1 && targetPiece.rank === 10) {
          score += 5000; // Spy taking Marshal!
        } else {
          const tRank = typeof targetPiece.rank === 'number' ? targetPiece.rank : 0;
          if (pRank > tRank) {
            score += 100 + tRank * 20; // Defeating known enemy piece
          } else if (pRank === tRank) {
            score += (pRank <= 5 ? 30 : -20); // Trade low pieces, preserve high
          } else {
            score -= 100 + pRank * 30; // Do not attack higher known piece
          }
        }
      } else {
        // Unknown enemy piece (Fog of War)
        if (piece.rank === 2) {
          // Scouts are ideal for probing unknown pieces
          score += 60;
        } else if (piece.rank === 3 && toY >= 7) {
          // Miners attacking unmoving backline pieces might be bombs or flag
          score += 70;
        } else if (piece.rank === 10 || piece.rank === 9) {
          // High rank pieces attack carefully (beware of Spy or Bombs)
          score += 40;
        } else {
          score += 25;
        }
      }
    }

    // Add slight random jitter
    score += Math.random() * 5;
    return score;
  }
}
