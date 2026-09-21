/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  ChessPiece,
  PieceColor,
  PieceType,
  BoardState,
  ChessMove,
  BattleAnimation,
  AIDifficulty
} from './battleChessTypes';

// Initial Standard Chess Board
// Row 0 = Rank 8 (Black), Row 7 = Rank 1 (White)
export function createInitialBoard(): BoardState {
  const board: BoardState = Array(8).fill(null).map(() => Array(8).fill(null));

  // Black major pieces
  const backRowBlack: PieceType[] = ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'];
  for (let col = 0; col < 8; col++) {
    board[0][col] = { type: backRowBlack[col], color: 'b', hasMoved: false };
    board[1][col] = { type: 'pawn', color: 'b', hasMoved: false };
  }

  // White major pieces
  const backRowWhite: PieceType[] = ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'];
  for (let col = 0; col < 8; col++) {
    board[6][col] = { type: 'pawn', color: 'w', hasMoved: false };
    board[7][col] = { type: backRowWhite[col], color: 'w', hasMoved: false };
  }

  return board;
}

export function cloneBoard(board: BoardState): BoardState {
  return board.map(row => row.map(cell => (cell ? { ...cell } : null)));
}

export function toSquareName(row: number, col: number): string {
  const file = String.fromCharCode('a'.charCodeAt(0) + col);
  const rank = (8 - row).toString();
  return `${file}${rank}`;
}

export function fromSquareName(square: string): { row: number; col: number } {
  const col = square.charCodeAt(0) - 'a'.charCodeAt(0);
  const row = 8 - parseInt(square[1], 10);
  return { row, col };
}

export function isInsideBoard(row: number, col: number): boolean {
  return row >= 0 && row < 8 && col >= 0 && col < 8;
}

/**
 * Check if a square is attacked by pieces of `attackerColor`
 */
export function isSquareAttacked(
  targetRow: number,
  targetCol: number,
  attackerColor: PieceColor,
  board: BoardState
): boolean {
  const pawnDir = attackerColor === 'w' ? -1 : 1;

  // 1. Pawn attacks
  const pawnRow = targetRow - pawnDir;
  for (const pCol of [targetCol - 1, targetCol + 1]) {
    if (isInsideBoard(pawnRow, pCol)) {
      const piece = board[pawnRow][pCol];
      if (piece && piece.color === attackerColor && piece.type === 'pawn') {
        return true;
      }
    }
  }

  // 2. Knight attacks
  const knightDeltas = [
    [-2, -1], [-2, 1], [-1, -2], [-1, 2],
    [1, -2], [1, 2], [2, -1], [2, 1]
  ];
  for (const [dr, dc] of knightDeltas) {
    const r = targetRow + dr;
    const c = targetCol + dc;
    if (isInsideBoard(r, c)) {
      const piece = board[r][c];
      if (piece && piece.color === attackerColor && piece.type === 'knight') {
        return true;
      }
    }
  }

  // 3. King attacks (adjacent 1 square)
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue;
      const r = targetRow + dr;
      const c = targetCol + dc;
      if (isInsideBoard(r, c)) {
        const piece = board[r][c];
        if (piece && piece.color === attackerColor && piece.type === 'king') {
          return true;
        }
      }
    }
  }

  // 4. Straight line attacks (Rook or Queen)
  const straightDirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
  for (const [dr, dc] of straightDirs) {
    let r = targetRow + dr;
    let c = targetCol + dc;
    while (isInsideBoard(r, c)) {
      const piece = board[r][c];
      if (piece) {
        if (piece.color === attackerColor && (piece.type === 'rook' || piece.type === 'queen')) {
          return true;
        }
        break; // blocked by any piece
      }
      r += dr;
      c += dc;
    }
  }

  // 5. Diagonal attacks (Bishop or Queen)
  const diagDirs = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
  for (const [dr, dc] of diagDirs) {
    let r = targetRow + dr;
    let c = targetCol + dc;
    while (isInsideBoard(r, c)) {
      const piece = board[r][c];
      if (piece) {
        if (piece.color === attackerColor && (piece.type === 'bishop' || piece.type === 'queen')) {
          return true;
        }
        break; // blocked by any piece
      }
      r += dr;
      c += dc;
    }
  }

  return false;
}

export function findKing(color: PieceColor, board: BoardState): { row: number; col: number } | null {
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (piece && piece.color === color && piece.type === 'king') {
        return { row: r, col: c };
      }
    }
  }
  return null;
}

export function isInCheck(color: PieceColor, board: BoardState): boolean {
  const kingPos = findKing(color, board);
  if (!kingPos) return false;
  const enemyColor: PieceColor = color === 'w' ? 'b' : 'w';
  return isSquareAttacked(kingPos.row, kingPos.col, enemyColor, board);
}

/**
 * Generate candidate pseudo-legal moves for a specific piece at (row, col)
 */
export function getPseudoLegalMovesForPiece(
  row: number,
  col: number,
  board: BoardState,
  lastMove?: ChessMove | null
): ChessMove[] {
  const piece = board[row][col];
  if (!piece) return [];

  const moves: ChessMove[] = [];
  const color = piece.color;
  const enemyColor: PieceColor = color === 'w' ? 'b' : 'w';

  // --- PAWN ---
  if (piece.type === 'pawn') {
    const dir = color === 'w' ? -1 : 1;
    const startRow = color === 'w' ? 6 : 1;
    const promoRow = color === 'w' ? 0 : 7;

    // Single step forward
    const f1Row = row + dir;
    if (isInsideBoard(f1Row, col) && !board[f1Row][col]) {
      const isPromo = f1Row === promoRow;
      if (isPromo) {
        for (const promo of ['queen', 'rook', 'bishop', 'knight'] as PieceType[]) {
          moves.push({
            from: { row, col },
            to: { row: f1Row, col },
            piece,
            promotion: promo,
            san: `${toSquareName(f1Row, col)}=${promo[0].toUpperCase()}`
          });
        }
      } else {
        moves.push({
          from: { row, col },
          to: { row: f1Row, col },
          piece,
          san: toSquareName(f1Row, col)
        });
      }

      // Double step forward from initial rank
      const f2Row = row + dir * 2;
      if (row === startRow && !board[f2Row][col]) {
        moves.push({
          from: { row, col },
          to: { row: f2Row, col },
          piece,
          san: toSquareName(f2Row, col)
        });
      }
    }

    // Diagonal captures
    for (const cOffset of [-1, 1]) {
      const capCol = col + cOffset;
      if (isInsideBoard(f1Row, capCol)) {
        const target = board[f1Row][capCol];
        if (target && target.color === enemyColor) {
          const isPromo = f1Row === promoRow;
          const fromFile = String.fromCharCode('a'.charCodeAt(0) + col);
          if (isPromo) {
            for (const promo of ['queen', 'rook', 'bishop', 'knight'] as PieceType[]) {
              moves.push({
                from: { row, col },
                to: { row: f1Row, col: capCol },
                piece,
                captured: target,
                promotion: promo,
                san: `${fromFile}x${toSquareName(f1Row, capCol)}=${promo[0].toUpperCase()}`
              });
            }
          } else {
            moves.push({
              from: { row, col },
              to: { row: f1Row, col: capCol },
              piece,
              captured: target,
              san: `${fromFile}x${toSquareName(f1Row, capCol)}`
            });
          }
        }

        // En Passant
        if (
          !target &&
          lastMove &&
          lastMove.piece.type === 'pawn' &&
          lastMove.piece.color === enemyColor &&
          Math.abs(lastMove.from.row - lastMove.to.row) === 2 &&
          lastMove.to.row === row &&
          lastMove.to.col === capCol
        ) {
          const epVictim = board[row][capCol];
          const fromFile = String.fromCharCode('a'.charCodeAt(0) + col);
          moves.push({
            from: { row, col },
            to: { row: f1Row, col: capCol },
            piece,
            captured: epVictim,
            isEnPassant: true,
            san: `${fromFile}x${toSquareName(f1Row, capCol)} e.p.`
          });
        }
      }
    }
  }

  // --- KNIGHT ---
  if (piece.type === 'knight') {
    const jumps = [
      [-2, -1], [-2, 1], [-1, -2], [-1, 2],
      [1, -2], [1, 2], [2, -1], [2, 1]
    ];
    for (const [dr, dc] of jumps) {
      const r = row + dr;
      const c = col + dc;
      if (isInsideBoard(r, c)) {
        const dest = board[r][c];
        if (!dest) {
          moves.push({
            from: { row, col },
            to: { row: r, col: c },
            piece,
            san: `N${toSquareName(r, c)}`
          });
        } else if (dest.color === enemyColor) {
          moves.push({
            from: { row, col },
            to: { row: r, col: c },
            piece,
            captured: dest,
            san: `Nx${toSquareName(r, c)}`
          });
        }
      }
    }
  }

  // --- BISHOP / ROOK / QUEEN ---
  const isBishop = piece.type === 'bishop' || piece.type === 'queen';
  const isRook = piece.type === 'rook' || piece.type === 'queen';

  if (isBishop) {
    const diagDirs = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
    for (const [dr, dc] of diagDirs) {
      let r = row + dr;
      let c = col + dc;
      while (isInsideBoard(r, c)) {
        const dest = board[r][c];
        const pChar = piece.type === 'queen' ? 'Q' : 'B';
        if (!dest) {
          moves.push({
            from: { row, col },
            to: { row: r, col: c },
            piece,
            san: `${pChar}${toSquareName(r, c)}`
          });
        } else {
          if (dest.color === enemyColor) {
            moves.push({
              from: { row, col },
              to: { row: r, col: c },
              piece,
              captured: dest,
              san: `${pChar}x${toSquareName(r, c)}`
            });
          }
          break; // blocked
        }
        r += dr;
        c += dc;
      }
    }
  }

  if (isRook) {
    const straightDirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    for (const [dr, dc] of straightDirs) {
      let r = row + dr;
      let c = col + dc;
      while (isInsideBoard(r, c)) {
        const dest = board[r][c];
        const pChar = piece.type === 'queen' ? 'Q' : 'R';
        if (!dest) {
          moves.push({
            from: { row, col },
            to: { row: r, col: c },
            piece,
            san: `${pChar}${toSquareName(r, c)}`
          });
        } else {
          if (dest.color === enemyColor) {
            moves.push({
              from: { row, col },
              to: { row: r, col: c },
              piece,
              captured: dest,
              san: `${pChar}x${toSquareName(r, c)}`
            });
          }
          break; // blocked
        }
        r += dr;
        c += dc;
      }
    }
  }

  // --- KING ---
  if (piece.type === 'king') {
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (dr === 0 && dc === 0) continue;
        const r = row + dr;
        const c = col + dc;
        if (isInsideBoard(r, c)) {
          const dest = board[r][c];
          if (!dest) {
            moves.push({
              from: { row, col },
              to: { row: r, col: c },
              piece,
              san: `K${toSquareName(r, c)}`
            });
          } else if (dest.color === enemyColor) {
            moves.push({
              from: { row, col },
              to: { row: r, col: c },
              piece,
              captured: dest,
              san: `Kx${toSquareName(r, c)}`
            });
          }
        }
      }
    }

    // Castling
    if (!piece.hasMoved && !isInCheck(color, board)) {
      const kRow = color === 'w' ? 7 : 0;
      if (row === kRow && col === 4) {
        // Kingside castling (to col 6)
        const rookKingside = board[kRow][7];
        if (
          rookKingside &&
          rookKingside.type === 'rook' &&
          rookKingside.color === color &&
          !rookKingside.hasMoved &&
          !board[kRow][5] &&
          !board[kRow][6] &&
          !isSquareAttacked(kRow, 5, enemyColor, board) &&
          !isSquareAttacked(kRow, 6, enemyColor, board)
        ) {
          moves.push({
            from: { row, col },
            to: { row: kRow, col: 6 },
            piece,
            isCastling: 'kingside',
            san: 'O-O'
          });
        }

        // Queenside castling (to col 2)
        const rookQueenside = board[kRow][0];
        if (
          rookQueenside &&
          rookQueenside.type === 'rook' &&
          rookQueenside.color === color &&
          !rookQueenside.hasMoved &&
          !board[kRow][1] &&
          !board[kRow][2] &&
          !board[kRow][3] &&
          !isSquareAttacked(kRow, 3, enemyColor, board) &&
          !isSquareAttacked(kRow, 2, enemyColor, board)
        ) {
          moves.push({
            from: { row, col },
            to: { row: kRow, col: 2 },
            piece,
            isCastling: 'queenside',
            san: 'O-O-O'
          });
        }
      }
    }
  }

  return moves;
}

/**
 * Apply move to a cloned board state without modifying original
 */
export function applyMoveSimulated(board: BoardState, move: ChessMove): BoardState {
  const nextBoard = cloneBoard(board);
  const p = { ...move.piece, hasMoved: true };

  // En passant removal
  if (move.isEnPassant) {
    nextBoard[move.from.row][move.to.col] = null;
  }

  // Castling rook move
  if (move.isCastling === 'kingside') {
    const kRow = move.from.row;
    const rook = nextBoard[kRow][7];
    if (rook) {
      nextBoard[kRow][5] = { ...rook, hasMoved: true };
      nextBoard[kRow][7] = null;
    }
  } else if (move.isCastling === 'queenside') {
    const kRow = move.from.row;
    const rook = nextBoard[kRow][0];
    if (rook) {
      nextBoard[kRow][3] = { ...rook, hasMoved: true };
      nextBoard[kRow][0] = null;
    }
  }

  // Promotion or standard piece placement
  if (move.promotion) {
    nextBoard[move.to.row][move.to.col] = {
      type: move.promotion,
      color: p.color,
      hasMoved: true
    };
  } else {
    nextBoard[move.to.row][move.to.col] = p;
  }

  nextBoard[move.from.row][move.from.col] = null;
  return nextBoard;
}

/**
 * Returns strictly legal moves for a piece (filters out any move that results in check)
 */
export function getLegalMovesForPiece(
  row: number,
  col: number,
  board: BoardState,
  lastMove?: ChessMove | null
): ChessMove[] {
  const piece = board[row][col];
  if (!piece) return [];

  const pseudo = getPseudoLegalMovesForPiece(row, col, board, lastMove);
  return pseudo.filter(m => {
    const sim = applyMoveSimulated(board, m);
    return !isInCheck(piece.color, sim);
  });
}

/**
 * Returns all legal moves for a given color
 */
export function getAllLegalMoves(
  color: PieceColor,
  board: BoardState,
  lastMove?: ChessMove | null
): ChessMove[] {
  const allMoves: ChessMove[] = [];
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (piece && piece.color === color) {
        const moves = getLegalMovesForPiece(r, c, board, lastMove);
        allMoves.push(...moves);
      }
    }
  }
  return allMoves;
}

/**
 * Generates dramatic Interplay-style narrative and action type for a capture
 */
export function generateBattleAnimation(attacker: ChessPiece, defender: ChessPiece, from: string, to: string): BattleAnimation {
  const aType = attacker.type;
  const dType = defender.type;
  const aColName = attacker.color === 'w' ? 'Witte' : 'Zwarte';
  const dColName = defender.color === 'w' ? 'Witte' : 'Zwarte';
  const aColEn = attacker.color === 'w' ? 'White' : 'Black';
  const dColEn = defender.color === 'w' ? 'White' : 'Black';

  // 1. ROOK: Stone Golem awakens and smashes/stomps!
  if (aType === 'rook') {
    return {
      attacker,
      defender,
      fromSquare: from,
      toSquare: to,
      step: 0,
      durationMs: 2200,
      actionType: 'crush',
      narrative: {
        nl: `De stenen toren ontwaakt als een reusachtige golem en verplettert de ${dColName} ${defender.type} tot stof!`,
        en: `The stone tower transforms into a lumbering rock golem, pulverizing the ${dColEn} ${defender.type} into dust!`
      }
    };
  }

  // 2. QUEEN: Arcane Sorceress casting lightning/teleport/zap!
  if (aType === 'queen') {
    return {
      attacker,
      defender,
      fromSquare: from,
      toSquare: to,
      step: 0,
      durationMs: 2200,
      actionType: 'zap',
      narrative: {
        nl: `De ${aColName} Koningin heft haar toverstaf en desintegreert de ${dColName} ${defender.type} met blauwe bliksem!`,
        en: `The ${aColEn} Queen unleashes an arcane storm, vaporizing the ${dColEn} ${defender.type} in electric sorcery!`
      }
    };
  }

  // 3. KNIGHT: Clashing broadswords / heavy lance charge!
  if (aType === 'knight') {
    if (dType === 'knight') {
      return {
        attacker,
        defender,
        fromSquare: from,
        toSquare: to,
        step: 0,
        durationMs: 2400,
        actionType: 'duel',
        narrative: {
          nl: `Een legendarisch zwaardgevecht! De ${aColName} Ridder pareert een dodelijke steek en hakt zijn rivaal neer.`,
          en: `An epic broadsword duel! The ${aColEn} Knight parries a thrust and cleanly cuts down his rival.`
        }
      };
    }
    return {
      attacker,
      defender,
      fromSquare: from,
      toSquare: to,
      step: 0,
      durationMs: 2000,
      actionType: 'slash',
      narrative: {
        nl: `De ${aColName} Ridder trekt zijn slagzwaard en maakt korte metten met de ${dColName} ${defender.type}!`,
        en: `The ${aColEn} Knight draws his broadsword and cleaves through the ${dColEn} ${defender.type}!`
      }
    };
  }

  // 4. BISHOP: Martial-arts staff / holy prayer bonk
  if (aType === 'bishop') {
    return {
      attacker,
      defender,
      fromSquare: from,
      toSquare: to,
      step: 0,
      durationMs: 2000,
      actionType: 'staff',
      narrative: {
        nl: `De ${aColName} Bisschop zwaait zijn heilige staf en slaat de ${dColName} ${defender.type} met goddelijke kracht neer!`,
        en: `The ${aColEn} Bishop twirls his sacred staff, delivering a divine kung-fu strike to the ${dColEn} ${defender.type}!`
      }
    };
  }

  // 5. KING: Royal rapier duel or scepter blast
  if (aType === 'king') {
    return {
      attacker,
      defender,
      fromSquare: from,
      toSquare: to,
      step: 0,
      durationMs: 2100,
      actionType: 'slash',
      narrative: {
        nl: `Koning Edward trekt persoonlijk zijn koninklijke degen en executeert de ${dColName} ${defender.type}!`,
        en: `The King draws his royal rapier and personally executes the ${dColEn} ${defender.type}!`
      }
    };
  }

  // 6. PAWN: Spear duel
  return {
    attacker,
    defender,
    fromSquare: from,
    toSquare: to,
    step: 0,
    durationMs: 1800,
    actionType: 'duel',
    narrative: {
      nl: `De dappere ${aColName} Voetsoldaat doorboort de ${dColName} ${defender.type} met zijn hellebaard!`,
      en: `The brave ${aColEn} Footman impales the ${dColEn} ${defender.type} with his battle halberd!`
    }
  };
}

// --- RETRO CHESS AI (Minimax & Positional Evaluation) ---

const PIECE_VALUES: Record<PieceType, number> = {
  pawn: 100,
  knight: 320,
  bishop: 330,
  rook: 500,
  queen: 900,
  king: 20000
};

// Bonus for piece positioning (center control, advancing pawns)
const PAWN_PST_WHITE = [
  [ 0,  0,  0,  0,  0,  0,  0,  0],
  [50, 50, 50, 50, 50, 50, 50, 50],
  [10, 10, 20, 30, 30, 20, 10, 10],
  [ 5,  5, 10, 25, 25, 10,  5,  5],
  [ 0,  0,  0, 20, 20,  0,  0,  0],
  [ 5, -5,-10,  0,  0,-10, -5,  5],
  [ 5, 10, 10,-20,-20, 10, 10,  5],
  [ 0,  0,  0,  0,  0,  0,  0,  0]
];

const KNIGHT_PST = [
  [-50,-40,-30,-30,-30,-30,-40,-50],
  [-40,-20,  0,  0,  0,  0,-20,-40],
  [-30,  0, 10, 15, 15, 10,  0,-30],
  [-30,  5, 15, 20, 20, 15,  5,-30],
  [-30,  0, 15, 20, 20, 15,  0,-30],
  [-30,  5, 10, 15, 15, 10,  5,-30],
  [-40,-20,  0,  5,  5,  0,-20,-40],
  [-50,-40,-30,-30,-30,-30,-40,-50]
];

export function evaluateBoard(board: BoardState): number {
  let score = 0;

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = board[r][c];
      if (!p) continue;

      let val = PIECE_VALUES[p.type];

      // Positional heuristic
      if (p.type === 'pawn') {
        val += p.color === 'w' ? PAWN_PST_WHITE[r][c] : PAWN_PST_WHITE[7 - r][c];
      } else if (p.type === 'knight') {
        val += KNIGHT_PST[r][c];
      }

      if (p.color === 'w') {
        score += val;
      } else {
        score -= val;
      }
    }
  }

  return score;
}

/**
 * Minimax with Alpha-Beta Pruning
 */
function minimax(
  board: BoardState,
  depth: number,
  alpha: number,
  beta: number,
  isMaximizing: boolean,
  lastMove?: ChessMove | null
): { score: number; bestMove?: ChessMove } {
  const currentTurn: PieceColor = isMaximizing ? 'w' : 'b';
  const legalMoves = getAllLegalMoves(currentTurn, board, lastMove);

  // Terminal conditions: Depth 0 or Game Over
  if (depth === 0 || legalMoves.length === 0) {
    if (legalMoves.length === 0) {
      if (isInCheck(currentTurn, board)) {
        // Checkmate
        return { score: isMaximizing ? -99999 + (3 - depth) : 99999 - (3 - depth) };
      }
      // Stalemate
      return { score: 0 };
    }
    return { score: evaluateBoard(board) };
  }

  // Prioritize captures for move ordering
  legalMoves.sort((a, b) => {
    const aVal = a.captured ? PIECE_VALUES[a.captured.type] : 0;
    const bVal = b.captured ? PIECE_VALUES[b.captured.type] : 0;
    return bVal - aVal;
  });

  let bestMove: ChessMove = legalMoves[0];

  if (isMaximizing) {
    let maxEval = -Infinity;
    for (const move of legalMoves) {
      const nextBoard = applyMoveSimulated(board, move);
      const evalResult = minimax(nextBoard, depth - 1, alpha, beta, false, move);
      if (evalResult.score > maxEval) {
        maxEval = evalResult.score;
        bestMove = move;
      }
      alpha = Math.max(alpha, evalResult.score);
      if (beta <= alpha) break;
    }
    return { score: maxEval, bestMove };
  } else {
    let minEval = Infinity;
    for (const move of legalMoves) {
      const nextBoard = applyMoveSimulated(board, move);
      const evalResult = minimax(nextBoard, depth - 1, alpha, beta, true, move);
      if (evalResult.score < minEval) {
        minEval = evalResult.score;
        bestMove = move;
      }
      beta = Math.min(beta, evalResult.score);
      if (beta <= alpha) break;
    }
    return { score: minEval, bestMove };
  }
}

/**
 * Calculates computer's move based on difficulty
 */
export function getComputerMove(
  board: BoardState,
  difficulty: AIDifficulty,
  aiColor: PieceColor = 'b',
  lastMove?: ChessMove | null
): ChessMove | null {
  const moves = getAllLegalMoves(aiColor, board, lastMove);
  if (moves.length === 0) return null;

  if (difficulty === 'novice') {
    // Novice: Captures first if available, else random legal move with slight center bias
    const captures = moves.filter(m => !!m.captured);
    if (captures.length > 0 && Math.random() < 0.75) {
      return captures[Math.floor(Math.random() * captures.length)];
    }
    return moves[Math.floor(Math.random() * moves.length)];
  }

  const depth = difficulty === 'knight' ? 2 : 3;
  const isMaximizing = aiColor === 'w';
  const result = minimax(board, depth, -Infinity, Infinity, isMaximizing, lastMove);
  return result.bestMove || moves[0];
}
