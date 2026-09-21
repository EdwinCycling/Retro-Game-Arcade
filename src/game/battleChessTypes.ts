/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type PieceType = 'pawn' | 'knight' | 'bishop' | 'rook' | 'queen' | 'king';
export type PieceColor = 'w' | 'b';

export interface ChessPiece {
  type: PieceType;
  color: PieceColor;
  hasMoved?: boolean;
}

export type Square = string; // e.g. 'e4', 'a1', 'h8'
export type BoardState = (ChessPiece | null)[][]; // 8 rows x 8 cols (0 = rank 8, 7 = rank 1)

export interface ChessMove {
  from: { row: number; col: number };
  to: { row: number; col: number };
  piece: ChessPiece;
  captured?: ChessPiece | null;
  isEnPassant?: boolean;
  isCastling?: 'kingside' | 'queenside';
  promotion?: PieceType;
  san?: string; // Standard Algebraic Notation like "e4", "Nf3", "Qxd7#", "O-O"
}

export type AIDifficulty = 'novice' | 'knight' | 'grandmaster' | 'two_player';

export interface BattleAnimation {
  attacker: ChessPiece;
  defender: ChessPiece;
  fromSquare: string;
  toSquare: string;
  step: number; // 0 to maxSteps
  durationMs: number;
  narrative: { nl: string; en: string };
  actionType: 'slash' | 'crush' | 'zap' | 'duel' | 'staff' | 'stomp';
}

export interface GameStats {
  whiteWins: number;
  blackWins: number;
  draws: number;
  totalBattles: number;
  fastestCheckmateMoves: number;
  totalPiecesSlain: number;
}
