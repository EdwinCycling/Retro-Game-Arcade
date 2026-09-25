/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type ConnectFourPlayer = 'red' | 'yellow';
export type AIDifficulty = 'novice' | 'tactician' | 'grandmaster';
export type GameMode = 'vs_ai' | 'pvp';

export const ROWS = 6;
export const COLS = 7;

export interface WinResult {
  isWin: boolean;
  winner: ConnectFourPlayer | null;
  winningCells: { r: number; c: number }[];
}

export class ConnectFourEngine {
  public grid: (ConnectFourPlayer | null)[][] = [];
  public currentTurn: ConnectFourPlayer = 'red'; // Red goes first (Player)
  public phase: 'playing' | 'game_over' = 'playing';
  public winner: ConnectFourPlayer | 'draw' | null = null;
  public winResult: WinResult | null = null;
  public aiDifficulty: AIDifficulty = 'tactician';
  public gameMode: GameMode = 'vs_ai';
  public isThinking: boolean = false;
  public moveHistory: { col: number; r: number; player: ConnectFourPlayer }[] = [];

  private audioCtx: AudioContext | null = null;

  constructor(difficulty: AIDifficulty = 'tactician', mode: GameMode = 'vs_ai') {
    this.aiDifficulty = difficulty;
    this.gameMode = mode;
    this.initGame();
  }

  public initGame() {
    this.grid = [];
    for (let r = 0; r < ROWS; r++) {
      const row: (ConnectFourPlayer | null)[] = [];
      for (let c = 0; c < COLS; c++) {
        row.push(null);
      }
      this.grid.push(row);
    }

    this.currentTurn = 'red';
    this.phase = 'playing';
    this.winner = null;
    this.winResult = null;
    this.isThinking = false;
    this.moveHistory = [];
  }

  // Get lowest available row in column 'c', or -1 if full
  public getAvailableRow(c: number, grid: (ConnectFourPlayer | null)[][] = this.grid): number {
    if (c < 0 || c >= COLS) return -1;
    for (let r = ROWS - 1; r >= 0; r--) {
      if (grid[r][c] === null) return r;
    }
    return -1;
  }

  // Drop token into column
  public dropToken(c: number, playAudio: boolean = true): { r: number; c: number } | null {
    if (this.phase !== 'playing') return null;

    const r = this.getAvailableRow(c);
    if (r === -1) return null; // Column is full

    this.grid[r][c] = this.currentTurn;
    const playerWhoMoved = this.currentTurn;
    this.moveHistory.push({ col: c, r, player: playerWhoMoved });

    if (playAudio) {
      this.playTokenDropSound();
    }

    // Check for win
    const win = this.checkWin(this.grid, playerWhoMoved);
    if (win.isWin) {
      this.phase = 'game_over';
      this.winner = playerWhoMoved;
      this.winResult = win;
      if (playerWhoMoved === 'red') {
        this.playVictoryFanfare();
      } else {
        this.playDefeatTone();
      }
      return { r, c };
    }

    // Check for draw
    if (this.isBoardFull()) {
      this.phase = 'game_over';
      this.winner = 'draw';
      return { r, c };
    }

    // Switch turn
    this.currentTurn = this.currentTurn === 'red' ? 'yellow' : 'red';

    return { r, c };
  }

  public isBoardFull(grid: (ConnectFourPlayer | null)[][] = this.grid): boolean {
    return grid[0].every(cell => cell !== null);
  }

  // Check 4-in-a-row for player
  public checkWin(grid: (ConnectFourPlayer | null)[][], player: ConnectFourPlayer): WinResult {
    // 1. Horizontal
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c <= COLS - 4; c++) {
        if (
          grid[r][c] === player &&
          grid[r][c + 1] === player &&
          grid[r][c + 2] === player &&
          grid[r][c + 3] === player
        ) {
          return {
            isWin: true,
            winner: player,
            winningCells: [
              { r, c },
              { r, c: c + 1 },
              { r, c: c + 2 },
              { r, c: c + 3 }
            ]
          };
        }
      }
    }

    // 2. Vertical
    for (let r = 0; r <= ROWS - 4; r++) {
      for (let c = 0; c < COLS; c++) {
        if (
          grid[r][c] === player &&
          grid[r + 1][c] === player &&
          grid[r + 2][c] === player &&
          grid[r + 3][c] === player
        ) {
          return {
            isWin: true,
            winner: player,
            winningCells: [
              { r, c },
              { r: r + 1, c },
              { r: r + 2, c },
              { r: r + 3, c }
            ]
          };
        }
      }
    }

    // 3. Diagonal Down-Right (\)
    for (let r = 0; r <= ROWS - 4; r++) {
      for (let c = 0; c <= COLS - 4; c++) {
        if (
          grid[r][c] === player &&
          grid[r + 1][c + 1] === player &&
          grid[r + 2][c + 2] === player &&
          grid[r + 3][c + 3] === player
        ) {
          return {
            isWin: true,
            winner: player,
            winningCells: [
              { r, c },
              { r: r + 1, c: c + 1 },
              { r: r + 2, c: c + 2 },
              { r: r + 3, c: c + 3 }
            ]
          };
        }
      }
    }

    // 4. Diagonal Up-Right (/)
    for (let r = 3; r < ROWS; r++) {
      for (let c = 0; c <= COLS - 4; c++) {
        if (
          grid[r][c] === player &&
          grid[r - 1][c + 1] === player &&
          grid[r - 2][c + 2] === player &&
          grid[r - 3][c + 3] === player
        ) {
          return {
            isWin: true,
            winner: player,
            winningCells: [
              { r, c },
              { r: r - 1, c: c + 1 },
              { r: r - 2, c: c + 2 },
              { r: r - 3, c: c + 3 }
            ]
          };
        }
      }
    }

    return { isWin: false, winner: null, winningCells: [] };
  }

  // --- AI Logic (Minimax with Alpha-Beta Pruning) ---
  public calculateBestAIMove(): number {
    const validCols: number[] = [];
    for (let c = 0; c < COLS; c++) {
      if (this.getAvailableRow(c) !== -1) {
        validCols.push(c);
      }
    }

    if (validCols.length === 0) return 3;

    let bestCol = validCols[0];

    if (this.aiDifficulty === 'novice') {
      const winCol = this.findImmediateWinningCol('yellow');
      const blockCol = this.findImmediateWinningCol('red');

      if (winCol !== null) bestCol = winCol;
      else if (blockCol !== null) bestCol = blockCol;
      else bestCol = validCols[Math.floor(Math.random() * validCols.length)];
    } else {
      const depth = this.aiDifficulty === 'tactician' ? 3 : 5;
      let bestScore = -Infinity;

      const shuffledCols = [...validCols].sort(() => Math.random() - 0.5);

      for (const c of shuffledCols) {
        const r = this.getAvailableRow(c);
        this.grid[r][c] = 'yellow';

        if (this.checkWin(this.grid, 'yellow').isWin) {
          this.grid[r][c] = null;
          bestCol = c;
          break;
        }

        const score = this.minimax(this.grid, depth - 1, -Infinity, Infinity, false);
        this.grid[r][c] = null;

        if (score > bestScore) {
          bestScore = score;
          bestCol = c;
        }
      }
    }

    return bestCol;
  }

  public playSlideFrictionSound() {
    try {
      this.initAudio();
      if (!this.audioCtx) return;
      const t = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(500, t);
      osc.frequency.exponentialRampToValueAtTime(320, t + 0.05);

      gain.gain.setValueAtTime(0.08, t);
      gain.gain.linearRampToValueAtTime(0.001, t + 0.05);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start(t);
      osc.stop(t + 0.05);
    } catch {
      // Audio fallback
    }
  }

  private findImmediateWinningCol(player: ConnectFourPlayer): number | null {
    for (let c = 0; c < COLS; c++) {
      const r = this.getAvailableRow(c);
      if (r !== -1) {
        this.grid[r][c] = player;
        const win = this.checkWin(this.grid, player);
        this.grid[r][c] = null;
        if (win.isWin) return c;
      }
    }
    return null;
  }

  private minimax(
    grid: (ConnectFourPlayer | null)[][],
    depth: number,
    alpha: number,
    beta: number,
    isMaximizing: boolean
  ): number {
    const yellowWin = this.checkWin(grid, 'yellow');
    if (yellowWin.isWin) return 1000000 + depth;

    const redWin = this.checkWin(grid, 'red');
    if (redWin.isWin) return -1000000 - depth;

    if (this.isBoardFull(grid) || depth === 0) {
      return this.evaluateBoard(grid);
    }

    const validCols: number[] = [];
    for (let c = 0; c < COLS; c++) {
      if (this.getAvailableRow(c, grid) !== -1) validCols.push(c);
    }

    if (isMaximizing) {
      let maxEval = -Infinity;
      for (const c of validCols) {
        const r = this.getAvailableRow(c, grid);
        grid[r][c] = 'yellow';
        const evaluation = this.minimax(grid, depth - 1, alpha, beta, false);
        grid[r][c] = null;
        maxEval = Math.max(maxEval, evaluation);
        alpha = Math.max(alpha, evaluation);
        if (beta <= alpha) break;
      }
      return maxEval;
    } else {
      let minEval = Infinity;
      for (const c of validCols) {
        const r = this.getAvailableRow(c, grid);
        grid[r][c] = 'red';
        const evaluation = this.minimax(grid, depth - 1, alpha, beta, true);
        grid[r][c] = null;
        minEval = Math.min(minEval, evaluation);
        beta = Math.min(beta, evaluation);
        if (beta <= alpha) break;
      }
      return minEval;
    }
  }

  private evaluateBoard(grid: (ConnectFourPlayer | null)[][]): number {
    let score = 0;

    // Center column preference bonus
    const centerCol = Math.floor(COLS / 2);
    let centerCount = 0;
    for (let r = 0; r < ROWS; r++) {
      if (grid[r][centerCol] === 'yellow') centerCount++;
    }
    score += centerCount * 6;

    // Evaluate all windows of length 4
    // Horizontal
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c <= COLS - 4; c++) {
        const window = [grid[r][c], grid[r][c + 1], grid[r][c + 2], grid[r][c + 3]];
        score += this.evaluateWindow(window);
      }
    }

    // Vertical
    for (let r = 0; r <= ROWS - 4; r++) {
      for (let c = 0; c < COLS; c++) {
        const window = [grid[r][c], grid[r + 1][c], grid[r + 2][c], grid[r + 3][c]];
        score += this.evaluateWindow(window);
      }
    }

    // Diagonal Down-Right
    for (let r = 0; r <= ROWS - 4; r++) {
      for (let c = 0; c <= COLS - 4; c++) {
        const window = [grid[r][c], grid[r + 1][c + 1], grid[r + 2][c + 2], grid[r + 3][c + 3]];
        score += this.evaluateWindow(window);
      }
    }

    // Diagonal Up-Right
    for (let r = 3; r < ROWS; r++) {
      for (let c = 0; c <= COLS - 4; c++) {
        const window = [grid[r][c], grid[r - 1][c + 1], grid[r - 2][c + 2], grid[r - 3][c + 3]];
        score += this.evaluateWindow(window);
      }
    }

    return score;
  }

  private evaluateWindow(window: (ConnectFourPlayer | null)[]): number {
    let yellowCount = 0;
    let redCount = 0;
    let emptyCount = 0;

    for (const cell of window) {
      if (cell === 'yellow') yellowCount++;
      else if (cell === 'red') redCount++;
      else emptyCount++;
    }

    if (yellowCount === 4) return 1000;
    if (yellowCount === 3 && emptyCount === 1) return 50;
    if (yellowCount === 2 && emptyCount === 2) return 10;

    if (redCount === 4) return -1000;
    if (redCount === 3 && emptyCount === 1) return -80; // Heavy penalty to block opponent

    return 0;
  }

  // --- Sound Effects via Web Audio API ---
  private initAudio() {
    if (!this.audioCtx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) this.audioCtx = new AudioCtx();
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => {});
    }
  }

  public playSlideFrictionSound() {
    try {
      this.initAudio();
      if (!this.audioCtx) return;
      const t = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320 + Math.random() * 80, t);
      osc.frequency.exponentialRampToValueAtTime(180, t + 0.05);

      gain.gain.setValueAtTime(0.08, t);
      gain.gain.exponentialRampToValueAtTime(0.005, t + 0.05);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start(t);
      osc.stop(t + 0.05);
    } catch {
      // Audio fallback
    }
  }

  public playTokenDropSound() {
    try {
      this.initAudio();
      if (!this.audioCtx) return;
      const t = this.audioCtx.currentTime;

      // Hollow plastic clack sound
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, t);
      osc.frequency.exponentialRampToValueAtTime(120, t + 0.08);

      gain.gain.setValueAtTime(0.3, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.08);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start(t);
      osc.stop(t + 0.08);
    } catch {
      // Audio fallback
    }
  }

  public playSliderReleaseSound() {
    try {
      this.initAudio();
      if (!this.audioCtx) return;
      const t = this.audioCtx.currentTime;

      // Rattle sound of all chips falling through bottom slider
      for (let i = 0; i < 8; i++) {
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        const startTime = t + i * 0.04;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(400 + Math.random() * 300, startTime);
        osc.frequency.exponentialRampToValueAtTime(100, startTime + 0.06);

        gain.gain.setValueAtTime(0.15, startTime);
        gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.06);

        osc.connect(gain);
        gain.connect(this.audioCtx.destination);

        osc.start(startTime);
        osc.stop(startTime + 0.06);
      }
    } catch {
      // Audio fallback
    }
  }

  public playVictoryFanfare() {
    try {
      this.initAudio();
      if (!this.audioCtx) return;
      const t = this.audioCtx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = this.audioCtx!.createOscillator();
        const gain = this.audioCtx!.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, t + idx * 0.12);

        gain.gain.setValueAtTime(0.2, t + idx * 0.12);
        gain.gain.linearRampToValueAtTime(0.01, t + idx * 0.12 + 0.3);

        osc.connect(gain);
        gain.connect(this.audioCtx!.destination);

        osc.start(t + idx * 0.12);
        osc.stop(t + idx * 0.12 + 0.3);
      });
    } catch {
      // Audio fallback
    }
  }

  public playDefeatTone() {
    try {
      this.initAudio();
      if (!this.audioCtx) return;
      const t = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(260, t);
      osc.frequency.linearRampToValueAtTime(100, t + 0.5);

      gain.gain.setValueAtTime(0.2, t);
      gain.gain.linearRampToValueAtTime(0.01, t + 0.5);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start(t);
      osc.stop(t + 0.5);
    } catch {
      // Audio fallback
    }
  }
}
