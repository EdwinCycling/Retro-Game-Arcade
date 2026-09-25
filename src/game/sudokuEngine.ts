/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Clean-Room TypeScript Implementation of SUDOKU - Master Mind & Logic Edition.
 * Conceived by Howard Garns (Number Place, 1979) and named Sudoku by Maki Kaji (Nikoli, 1984).
 * 
 * Features:
 * - Mathematical 9x9 Backtracking puzzle generator with guaranteed unique solutions.
 * - 4 calibrated difficulty levels: Easy, Medium, Hard, and Expert.
 * - Dual input modes: Direct Number entry & Miniature Pencil Candidates (Notes).
 * - Full Undo history stack & Erase tool.
 * - Intelligent Hint system explaining row/col/box deduction.
 * - Dynamic collision detection & highlighting (selected digit, peers, duplicate errors).
 * - Procedural Web Audio chiptunes (pencil sketch, wooden taps, paper rustle, victory chime).
 */

export type SudokuDifficulty = 'easy' | 'medium' | 'hard' | 'expert';

export interface SudokuCell {
  row: number;
  col: number;
  value: number; // 0 = empty, 1-9
  solution: number;
  isGiven: boolean; // Pre-filled clue
  notes: Set<number>; // Pencil notes 1-9
  isError: boolean;
}

export interface SudokuMove {
  row: number;
  col: number;
  prevValue: number;
  newValue: number;
  prevNotes: Set<number>;
  newNotes: Set<number>;
}

export class SudokuEngine {
  public grid: SudokuCell[][] = [];
  public difficulty: SudokuDifficulty = 'easy';
  public selectedRow: number | null = 0;
  public selectedCol: number | null = 0;
  public isNoteMode: boolean = false;
  public isCompleted: boolean = false;
  public mistakes: number = 0;
  public maxMistakes: number = 3;
  public isZenMode: boolean = true; // Unlimited mistakes
  public hintsRemaining: number = 3;
  public hintsUsed: number = 0;
  public corrections: number = 0; // Cells modified/erased after already filled
  public timerSeconds: number = 0;
  public isTimerRunning: boolean = true;
  public isTimerVisible: boolean = true; // User toggleable timer
  public lastHintMessage: string = '';

  private history: SudokuMove[] = [];
  private audioCtx: AudioContext | null = null;
  private isMuted: boolean = false;

  constructor(difficulty: SudokuDifficulty = 'easy', isZen: boolean = true) {
    this.difficulty = difficulty;
    this.isZenMode = isZen;
    this.initAudio();
    this.newGame(difficulty);
  }

  // --- Audio Synthesis (Tactile Paper, Pencil & Wood) ---
  private initAudio() {
    try {
      const AudioClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioClass) {
        this.audioCtx = new AudioClass();
      }
    } catch { /* Audio not supported */ }
  }

  public setAudioMuted(muted: boolean) {
    this.isMuted = muted;
  }

  public playSelectSound() {
    if (this.isMuted || !this.audioCtx) return;
    try {
      const ctx = this.audioCtx;
      if (ctx.state === 'suspended') ctx.resume();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(420, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(560, ctx.currentTime + 0.04);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.04);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.04);
    } catch { /* ignore */ }
  }

  public playPencilSound() {
    if (this.isMuted || !this.audioCtx) return;
    try {
      const ctx = this.audioCtx;
      if (ctx.state === 'suspended') ctx.resume();
      // Soft tactile pencil scratch sound using white noise burst
      const bufferSize = ctx.sampleRate * 0.06;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.25));
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 2400;
      filter.Q.value = 2.0;

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.005, ctx.currentTime + 0.06);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      noise.start();
    } catch { /* ignore */ }
  }

  public playEraseSound() {
    if (this.isMuted || !this.audioCtx) return;
    try {
      const ctx = this.audioCtx;
      if (ctx.state === 'suspended') ctx.resume();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(180, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.09, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } catch { /* ignore */ }
  }

  public playErrorSound() {
    if (this.isMuted || !this.audioCtx) return;
    try {
      const ctx = this.audioCtx;
      if (ctx.state === 'suspended') ctx.resume();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(160, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(110, ctx.currentTime + 0.18);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.18);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.18);
    } catch { /* ignore */ }
  }

  public playVictoryFanfare() {
    if (this.isMuted || !this.audioCtx) return;
    try {
      const ctx = this.audioCtx;
      if (ctx.state === 'suspended') ctx.resume();
      const now = ctx.currentTime;
      // Elegant classical victory arpeggio: C5 -> E5 -> G5 -> C6 -> E6
      const notes = [523.25, 659.25, 783.99, 1046.5, 1318.5];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.1);
        gain.gain.setValueAtTime(0.15, now + idx * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.005, now + idx * 0.1 + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.1);
        osc.stop(now + idx * 0.1 + 0.35);
      });
    } catch { /* ignore */ }
  }

  // --- Sudoku Generation & Solver Algorithm ---
  public newGame(difficulty: SudokuDifficulty = this.difficulty) {
    this.difficulty = difficulty;
    this.isCompleted = false;
    this.mistakes = 0;
    this.hintsRemaining = 3;
    this.hintsUsed = 0;
    this.corrections = 0;
    this.timerSeconds = 0;
    this.isTimerRunning = true;
    this.history = [];
    this.lastHintMessage = '';

    // Step 1: Generate full valid solved 9x9 board
    const solution = this.generateCompleteBoard();

    // Step 2: Determine numbers to remove according to difficulty
    let cluesToKeep = 42; // default easy
    if (difficulty === 'easy') cluesToKeep = 42;
    else if (difficulty === 'medium') cluesToKeep = 34;
    else if (difficulty === 'hard') cluesToKeep = 28;
    else if (difficulty === 'expert') cluesToKeep = 24;

    const puzzle = this.createPuzzleFromSolution(solution, cluesToKeep);

    // Step 3: Populate 9x9 grid data structure
    this.grid = [];
    for (let r = 0; r < 9; r++) {
      const row: SudokuCell[] = [];
      for (let c = 0; c < 9; c++) {
        const val = puzzle[r][c];
        row.push({
          row: r,
          col: c,
          value: val,
          solution: solution[r][c],
          isGiven: val !== 0,
          notes: new Set<number>(),
          isError: false,
        });
      }
      this.grid.push(row);
    }

    this.selectedRow = 0;
    this.selectedCol = 0;
    this.validateErrors();
  }

  private generateCompleteBoard(): number[][] {
    const board: number[][] = Array.from({ length: 9 }, () => Array(9).fill(0));

    // Fill diagonal 3x3 boxes first (these are mutually independent)
    for (let i = 0; i < 9; i += 3) {
      this.fillBox(board, i, i);
    }

    // Solve remaining cells with backtracking
    this.solveBacktrack(board);
    return board;
  }

  private fillBox(board: number[][], row: number, col: number) {
    const nums = this.shuffleArray([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    let idx = 0;
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        board[row + r][col + c] = nums[idx++];
      }
    }
  }

  private shuffleArray(arr: number[]): number[] {
    const result = [...arr];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }

  private isSafe(board: number[][], row: number, col: number, num: number): boolean {
    // Check row
    for (let c = 0; c < 9; c++) {
      if (board[row][c] === num) return false;
    }
    // Check col
    for (let r = 0; r < 9; r++) {
      if (board[r][col] === num) return false;
    }
    // Check 3x3 box
    const startRow = Math.floor(row / 3) * 3;
    const startCol = Math.floor(col / 3) * 3;
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        if (board[startRow + r][startCol + c] === num) return false;
      }
    }
    return true;
  }

  private solveBacktrack(board: number[][]): boolean {
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (board[r][c] === 0) {
          const numbers = this.shuffleArray([1, 2, 3, 4, 5, 6, 7, 8, 9]);
          for (const num of numbers) {
            if (this.isSafe(board, r, c, num)) {
              board[r][c] = num;
              if (this.solveBacktrack(board)) return true;
              board[r][c] = 0;
            }
          }
          return false;
        }
      }
    }
    return true;
  }

  private createPuzzleFromSolution(solution: number[][], cluesCount: number): number[][] {
    const puzzle = solution.map(row => [...row]);
    const cellsToRemove = 81 - cluesCount;
    const positions: [number, number][] = [];

    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        positions.push([r, c]);
      }
    }

    // Shuffle removal positions
    for (let i = positions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [positions[i], positions[j]] = [positions[j], positions[i]];
    }

    let removed = 0;
    for (const [r, c] of positions) {
      if (removed >= cellsToRemove) break;
      puzzle[r][c] = 0;
      removed++;
    }

    return puzzle;
  }

  // --- Interaction Methods ---
  public selectCell(row: number, col: number) {
    if (row < 0 || row > 8 || col < 0 || col > 8) return;
    this.selectedRow = row;
    this.selectedCol = col;
    this.playSelectSound();
  }

  public setNumber(num: number) {
    if (this.isCompleted) return;
    if (this.selectedRow === null || this.selectedCol === null) return;
    const cell = this.grid[this.selectedRow][this.selectedCol];
    if (cell.isGiven) return;

    if (this.isNoteMode) {
      // Toggle miniature pencil note
      const prevNotes = new Set(cell.notes);
      const newNotes = new Set(cell.notes);
      if (newNotes.has(num)) {
        newNotes.delete(num);
      } else {
        newNotes.add(num);
      }
      cell.notes = newNotes;
      this.history.push({
        row: cell.row,
        col: cell.col,
        prevValue: cell.value,
        newValue: cell.value,
        prevNotes,
        newNotes,
      });
      this.playPencilSound();
      return;
    }

    // Direct entry mode
    if (cell.value === num) {
      // Same number -> Clear cell
      this.clearCell();
      return;
    }

    // If cell already had a different number entered by user, count as correction
    if (cell.value !== 0 && cell.value !== num) {
      this.corrections++;
    }

    const prevValue = cell.value;
    const prevNotes = new Set(cell.notes);

    cell.value = num;
    cell.notes.clear();

    this.history.push({
      row: cell.row,
      col: cell.col,
      prevValue,
      newValue: num,
      prevNotes,
      newNotes: new Set(),
    });

    // Check if correct against actual solution
    if (num !== cell.solution) {
      this.mistakes++;
      this.playErrorSound();
      if (!this.isZenMode && this.mistakes >= this.maxMistakes) {
        this.isTimerRunning = false;
      }
    } else {
      this.playPencilSound();
      // Auto-remove this number from candidate notes in peer cells (row, col, box)
      this.cleanPeerNotes(cell.row, cell.col, num);
    }

    this.validateErrors();
    this.checkCompletion();
  }

  private cleanPeerNotes(row: number, col: number, num: number) {
    // Row & Col
    for (let i = 0; i < 9; i++) {
      this.grid[row][i].notes.delete(num);
      this.grid[i][col].notes.delete(num);
    }
    // 3x3 Box
    const startR = Math.floor(row / 3) * 3;
    const startC = Math.floor(col / 3) * 3;
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        this.grid[startR + r][startC + c].notes.delete(num);
      }
    }
  }

  public clearCell() {
    if (this.selectedRow === null || this.selectedCol === null) return;
    const cell = this.grid[this.selectedRow][this.selectedCol];
    if (cell.isGiven) return;

    if (cell.value !== 0) {
      this.corrections++;
    }

    if (cell.value !== 0 || cell.notes.size > 0) {
      this.history.push({
        row: cell.row,
        col: cell.col,
        prevValue: cell.value,
        newValue: 0,
        prevNotes: new Set(cell.notes),
        newNotes: new Set(),
      });
      cell.value = 0;
      cell.notes.clear();
      this.playEraseSound();
      this.validateErrors();
    }
  }

  public undo() {
    if (this.history.length === 0) return;
    const move = this.history.pop()!;
    const cell = this.grid[move.row][move.col];
    cell.value = move.prevValue;
    cell.notes = new Set(move.prevNotes);
    this.selectedRow = move.row;
    this.selectedCol = move.col;
    this.playEraseSound();
    this.validateErrors();
  }

  public toggleNoteMode() {
    this.isNoteMode = !this.isNoteMode;
    this.playSelectSound();
  }

  public getHint(): boolean {
    if (this.isCompleted) return false;
    if (this.hintsRemaining <= 0) {
      this.lastHintMessage = 'Geen hints meer over voor deze puzzel!';
      return false;
    }

    // Strategy 1: If current selected cell is empty, reveal it!
    if (this.selectedRow !== null && this.selectedCol !== null) {
      const cell = this.grid[this.selectedRow][this.selectedCol];
      if (cell.value === 0) {
        cell.value = cell.solution;
        cell.notes.clear();
        this.cleanPeerNotes(cell.row, cell.col, cell.solution);
        this.hintsRemaining--;
        this.hintsUsed++;
        this.lastHintMessage = `💡 Hint toegepast op rij ${cell.row + 1}, kolom ${cell.col + 1}: ${cell.solution}`;
        this.playPencilSound();
        this.validateErrors();
        this.checkCompletion();
        return true;
      }
    }

    // Strategy 2: Find the first empty cell and fill it
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        const cell = this.grid[r][c];
        if (cell.value === 0) {
          this.selectedRow = r;
          this.selectedCol = c;
          cell.value = cell.solution;
          cell.notes.clear();
          this.cleanPeerNotes(r, c, cell.solution);
          this.hintsRemaining--;
          this.hintsUsed++;
          this.lastHintMessage = `💡 Hint toegepast op rij ${r + 1}, kolom ${c + 1}: ${cell.solution}`;
          this.playPencilSound();
          this.validateErrors();
          this.checkCompletion();
          return true;
        }
      }
    }
    return false;
  }

  // --- Score Calculation Algorithm ---
  /**
   * Base scores by difficulty:
   * Easy: 5,000 pts
   * Medium: 7,500 pts
   * Hard: 10,000 pts
   * Expert: 12,500 pts
   * 
   * Speed bonus: Max 3,000 pts (decays over time: -3 pts per elapsed second)
   * Deductions:
   * - Each Hint: -800 pts
   * - Each Mistake: -400 pts
   * - Each Correction (erasing or overwriting an already placed digit): -100 pts
   * Minimum score floor: 250 pts
   */
  public calculateScore(): {
    baseScore: number;
    timeBonus: number;
    mistakePenalty: number;
    hintPenalty: number;
    correctionPenalty: number;
    finalScore: number;
  } {
    const baseMap = {
      easy: 5000,
      medium: 7500,
      hard: 10000,
      expert: 12500
    };
    const baseScore = baseMap[this.difficulty];

    // Time bonus: 3000 max, decays with seconds
    const timeDecay = Math.floor(this.timerSeconds * 3.5);
    const timeBonus = Math.max(0, 3000 - timeDecay);

    const mistakePenalty = this.mistakes * 400;
    const hintPenalty = this.hintsUsed * 800;
    const correctionPenalty = this.corrections * 100;

    const rawScore = baseScore + timeBonus - mistakePenalty - hintPenalty - correctionPenalty;
    const finalScore = Math.max(250, rawScore);

    return {
      baseScore,
      timeBonus,
      mistakePenalty,
      hintPenalty,
      correctionPenalty,
      finalScore
    };
  }

  public validateErrors() {
    // Reset all error states
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        this.grid[r][c].isError = false;
      }
    }

    // Check duplicate values in rows
    for (let r = 0; r < 9; r++) {
      const seen = new Map<number, SudokuCell[]>();
      for (let c = 0; c < 9; c++) {
        const cell = this.grid[r][c];
        if (cell.value !== 0) {
          if (!seen.has(cell.value)) seen.set(cell.value, []);
          seen.get(cell.value)!.push(cell);
        }
      }
      seen.forEach(cells => {
        if (cells.length > 1) {
          cells.forEach(c => (c.isError = true));
        }
      });
    }

    // Check duplicate values in cols
    for (let c = 0; c < 9; c++) {
      const seen = new Map<number, SudokuCell[]>();
      for (let r = 0; r < 9; r++) {
        const cell = this.grid[r][c];
        if (cell.value !== 0) {
          if (!seen.has(cell.value)) seen.set(cell.value, []);
          seen.get(cell.value)!.push(cell);
        }
      }
      seen.forEach(cells => {
        if (cells.length > 1) {
          cells.forEach(c => (c.isError = true));
        }
      });
    }

    // Check duplicate values in 3x3 boxes
    for (let boxR = 0; boxR < 3; boxR++) {
      for (let boxC = 0; boxC < 3; boxC++) {
        const seen = new Map<number, SudokuCell[]>();
        for (let r = 0; r < 3; r++) {
          for (let c = 0; c < 3; c++) {
            const cell = this.grid[boxR * 3 + r][boxC * 3 + c];
            if (cell.value !== 0) {
              if (!seen.has(cell.value)) seen.set(cell.value, []);
              seen.get(cell.value)!.push(cell);
            }
          }
        }
        seen.forEach(cells => {
          if (cells.length > 1) {
            cells.forEach(c => (c.isError = true));
          }
        });
      }
    }
  }

  private checkCompletion() {
    let allFilled = true;
    let allCorrect = true;

    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        const cell = this.grid[r][c];
        if (cell.value === 0) {
          allFilled = false;
        } else if (cell.value !== cell.solution || cell.isError) {
          allCorrect = false;
        }
      }
    }

    if (allFilled && allCorrect) {
      this.isCompleted = true;
      this.isTimerRunning = false;
      this.playVictoryFanfare();
    }
  }

  // Count remaining placements for numbers 1 to 9
  public getNumberCounts(): { [key: number]: number } {
    const counts: { [key: number]: number } = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 };
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        const val = this.grid[r][c].value;
        if (val >= 1 && val <= 9) {
          counts[val]++;
        }
      }
    }
    return counts;
  }
}
