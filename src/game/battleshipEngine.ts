/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type BattleshipDifficulty = 'easy' | 'medium' | 'hard';

export type BattleshipCellState = 'unknown' | 'water' | 'ship';

// Visual segment type for authentic naval rendering on grid
export type BattleshipSegmentType = 
  | 'none'
  | 'submarine' // 1-cell solitary submarine circle/diamond
  | 'cap-north' // top end of vertical ship
  | 'cap-south' // bottom end of vertical ship
  | 'cap-west'  // left end of horizontal ship
  | 'cap-east'  // right end of horizontal ship
  | 'middle-horiz' // middle segment of horizontal ship
  | 'middle-vert'; // middle segment of vertical ship

export interface BattleshipCell {
  row: number;
  col: number;
  userState: BattleshipCellState; // 'unknown' (empty), 'water' (waves/x), 'ship' (solid hull)
  solutionIsShip: boolean;        // Whether cell is occupied by a ship in the true solution
  isGiven: boolean;               // Clue cell revealed at the start of the puzzle
  givenSegment?: BattleshipSegmentType; // Hinted visual type if given
  isError?: boolean;              // Invalid according to row/col count or touching rules
}

export interface BattleshipFleetConfig {
  battleship: number; // 4 cells (Slagschip)
  cruiser: number;    // 3 cells (Kruiser)
  destroyer: number;  // 2 cells (Torpedobootjager)
  submarine: number;  // 1 cell  (Onderzeeër)
}

export interface BattleshipPlacedShip {
  id: string;
  size: number;
  cells: { row: number; col: number }[];
  isSunk: boolean; // All cells correctly marked as ship by user
}

export interface BattleshipMoveHistory {
  row: number;
  col: number;
  prevState: BattleshipCellState;
  nextState: BattleshipCellState;
}

export class BattleshipEngine {
  public gridSize: number = 8; // 8x8 or 10x10. We use 8x8 for crisp mobile/desktop play
  public grid: BattleshipCell[][] = [];
  public rowCounts: number[] = []; // Number of ship cells per row
  public colCounts: number[] = []; // Number of ship cells per column
  public ships: BattleshipPlacedShip[] = [];
  
  public difficulty: BattleshipDifficulty = 'easy';
  public isCompleted: boolean = false;
  public mistakes: number = 0;
  public hintsRemaining: number = 3;
  public hintsUsed: number = 0;
  public corrections: number = 0;
  public timerSeconds: number = 0;
  public isTimerRunning: boolean = true;
  public isTimerVisible: boolean = true;
  public isZenMode: boolean = true;
  public lastHintMessage: string = '';

  private history: BattleshipMoveHistory[] = [];
  private audioCtx: AudioContext | null = null;

  constructor(difficulty: BattleshipDifficulty = 'easy') {
    this.difficulty = difficulty;
    this.newGame(difficulty);
  }

  // --- Audio Synthesis via Web Audio API ---
  private initAudio() {
    if (!this.audioCtx && typeof window !== 'undefined') {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtxClass) {
        this.audioCtx = new AudioCtxClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => {});
    }
  }

  public playPencilSound() {
    try {
      this.initAudio();
      if (!this.audioCtx) return;
      const t = this.audioCtx.currentTime;
      const bufferSize = this.audioCtx.sampleRate * 0.05;
      const buffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
      }
      const noise = this.audioCtx.createBufferSource();
      noise.buffer = buffer;
      const filter = this.audioCtx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(3200, t);
      filter.Q.setValueAtTime(4, t);
      const gain = this.audioCtx.createGain();
      gain.gain.setValueAtTime(0.08, t);
      gain.gain.linearRampToValueAtTime(0.001, t + 0.05);
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.audioCtx.destination);
      noise.start(t);
    } catch {
      // Audio fallback
    }
  }

  public playWaterSplashSound() {
    try {
      this.initAudio();
      if (!this.audioCtx) return;
      const t = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(420, t);
      osc.frequency.exponentialRampToValueAtTime(140, t + 0.12);
      gain.gain.setValueAtTime(0.09, t);
      gain.gain.linearRampToValueAtTime(0.001, t + 0.12);
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start(t);
      osc.stop(t + 0.12);
    } catch {
      // Audio fallback
    }
  }

  public playShipPlacedSound() {
    try {
      this.initAudio();
      if (!this.audioCtx) return;
      const t = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(220, t);
      osc.frequency.setValueAtTime(330, t + 0.04);
      gain.gain.setValueAtTime(0.12, t);
      gain.gain.linearRampToValueAtTime(0.001, t + 0.1);
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start(t);
      osc.stop(t + 0.1);
    } catch {
      // Audio fallback
    }
  }

  public playShipSunkFanfare() {
    try {
      this.initAudio();
      if (!this.audioCtx) return;
      const notes = [261.63, 329.63, 392.00, 523.25];
      notes.forEach((freq, idx) => {
        if (!this.audioCtx) return;
        const t = this.audioCtx.currentTime + idx * 0.08;
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(freq, t);
        gain.gain.setValueAtTime(0.07, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
        osc.connect(gain);
        gain.connect(this.audioCtx.destination);
        osc.start(t);
        osc.stop(t + 0.2);
      });
    } catch {
      // Audio fallback
    }
  }

  public playVictoryFanfare() {
    try {
      this.initAudio();
      if (!this.audioCtx) return;
      const notes = [392, 523.25, 659.25, 783.99, 1046.50];
      notes.forEach((freq, idx) => {
        if (!this.audioCtx) return;
        const t = this.audioCtx.currentTime + idx * 0.1;
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, t);
        gain.gain.setValueAtTime(0.15, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
        osc.connect(gain);
        gain.connect(this.audioCtx.destination);
        osc.start(t);
        osc.stop(t + 0.35);
      });
    } catch {
      // Audio fallback
    }
  }

  // --- Fleet Definition ---
  // Standard Solitaire fleet:
  // 1 Battleship (4), 2 Cruisers (3), 3 Destroyers (2), 4 Submarines (1) -> 10 ships total on 10x10.
  // For 8x8 (compact fast play): 1x4, 2x3, 2x2, 3x1 (8 ships total, 17 ship segments).
  public getFleetConfig(): number[] {
    if (this.gridSize === 8) {
      return [4, 3, 3, 2, 2, 1, 1, 1]; // 8 ships
    }
    return [4, 3, 3, 2, 2, 2, 1, 1, 1, 1]; // 10 ships for 10x10
  }

  // --- Board Generator ---
  public newGame(difficulty: BattleshipDifficulty = this.difficulty) {
    this.difficulty = difficulty;
    this.gridSize = difficulty === 'hard' ? 10 : 8;
    this.isCompleted = false;
    this.mistakes = 0;
    this.hintsRemaining = 3;
    this.hintsUsed = 0;
    this.corrections = 0;
    this.timerSeconds = 0;
    this.isTimerRunning = true;
    this.history = [];
    this.lastHintMessage = '';

    // Generate valid random fleet placement where NO TWO SHIPS TOUCH (even diagonally)
    this.generateValidBoard();

    // Reveal starting clues based on difficulty
    this.revealStartingClues(difficulty);

    // Initial check
    this.updateFleetStatus();
    this.validateErrors();
  }

  private generateValidBoard() {
    let success = false;
    let attempts = 0;
    const maxAttempts = 200;

    while (!success && attempts < maxAttempts) {
      attempts++;
      success = this.tryGenerateBoard();
    }

    if (!success) {
      // Fallback deterministic layout for safety
      this.generateFallbackBoard();
    }

    // Calculate row & col counts from true solution
    this.rowCounts = Array(this.gridSize).fill(0);
    this.colCounts = Array(this.gridSize).fill(0);
    for (let r = 0; r < this.gridSize; r++) {
      for (let c = 0; c < this.gridSize; c++) {
        if (this.grid[r][c].solutionIsShip) {
          this.rowCounts[r]++;
          this.colCounts[c]++;
        }
      }
    }
  }

  private tryGenerateBoard(): boolean {
    // Reset grid
    this.grid = [];
    for (let r = 0; r < this.gridSize; r++) {
      const row: BattleshipCell[] = [];
      for (let c = 0; c < this.gridSize; c++) {
        row.push({
          row: r,
          col: c,
          userState: 'unknown',
          solutionIsShip: false,
          isGiven: false
        });
      }
      this.grid.push(row);
    }
    this.ships = [];

    const fleet = this.getFleetConfig().sort((a, b) => b - a); // place largest first

    for (let i = 0; i < fleet.length; i++) {
      const size = fleet[i];
      let placed = false;
      let placeTries = 0;

      while (!placed && placeTries < 150) {
        placeTries++;
        const isHorizontal = Math.random() > 0.5;
        const maxR = isHorizontal ? this.gridSize - 1 : this.gridSize - size;
        const maxC = isHorizontal ? this.gridSize - size : this.gridSize - 1;

        if (maxR < 0 || maxC < 0) continue;

        const startR = Math.floor(Math.random() * (maxR + 1));
        const startC = Math.floor(Math.random() * (maxC + 1));

        // Check if placement is valid (cells + all 8 adjacent neighbors must be empty)
        if (this.canPlaceShip(startR, startC, size, isHorizontal)) {
          const shipCells: { row: number; col: number }[] = [];
          for (let s = 0; s < size; s++) {
            const r = isHorizontal ? startR : startR + s;
            const c = isHorizontal ? startC + s : startC;
            this.grid[r][c].solutionIsShip = true;
            shipCells.push({ row: r, col: c });
          }
          this.ships.push({
            id: `ship-${i}-${size}`,
            size,
            cells: shipCells,
            isSunk: false
          });
          placed = true;
        }
      }

      if (!placed) {
        return false; // Retry entire board
      }
    }

    return true;
  }

  private canPlaceShip(startR: number, startC: number, size: number, isHorizontal: boolean): boolean {
    for (let s = 0; s < size; s++) {
      const r = isHorizontal ? startR : startR + s;
      const c = isHorizontal ? startC + s : startC;

      // Check the cell itself and all 8 surrounding neighbors (no touching permitted)
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          const nr = r + dr;
          const nc = c + dc;
          if (nr >= 0 && nr < this.gridSize && nc >= 0 && nc < this.gridSize) {
            if (this.grid[nr][nc].solutionIsShip) {
              return false;
            }
          }
        }
      }
    }
    return true;
  }

  private generateFallbackBoard() {
    this.grid = [];
    for (let r = 0; r < this.gridSize; r++) {
      const row: BattleshipCell[] = [];
      for (let c = 0; c < this.gridSize; c++) {
        row.push({
          row: r,
          col: c,
          userState: 'unknown',
          solutionIsShip: false,
          isGiven: false
        });
      }
      this.grid.push(row);
    }
    this.ships = [
      { id: 'fb-4', size: 4, cells: [{ row: 0, col: 0 }, { row: 0, col: 1 }, { row: 0, col: 2 }, { row: 0, col: 3 }], isSunk: false },
      { id: 'fb-3a', size: 3, cells: [{ row: 2, col: 1 }, { row: 3, col: 1 }, { row: 4, col: 1 }], isSunk: false },
      { id: 'fb-3b', size: 3, cells: [{ row: 2, col: 5 }, { row: 2, col: 6 }, { row: 2, col: 7 }], isSunk: false },
      { id: 'fb-2a', size: 2, cells: [{ row: 6, col: 0 }, { row: 6, col: 1 }], isSunk: false },
      { id: 'fb-2b', size: 2, cells: [{ row: 6, col: 4 }, { row: 7, col: 4 }], isSunk: false },
      { id: 'fb-1a', size: 1, cells: [{ row: 0, col: 6 }], isSunk: false },
      { id: 'fb-1b', size: 1, cells: [{ row: 4, col: 6 }], isSunk: false },
      { id: 'fb-1c', size: 1, cells: [{ row: 6, col: 7 }], isSunk: false }
    ];

    this.ships.forEach(s => {
      s.cells.forEach(c => {
        this.grid[c.row][c.col].solutionIsShip = true;
      });
    });
  }

  // --- Starting Clues ---
  private revealStartingClues(difficulty: BattleshipDifficulty) {
    // Number of revealed cells (water or ship segments)
    const clueCount = difficulty === 'easy' ? 6 : difficulty === 'medium' ? 4 : 2;

    const allPositions: { r: number; c: number }[] = [];
    for (let r = 0; r < this.gridSize; r++) {
      for (let c = 0; c < this.gridSize; c++) {
        allPositions.push({ r, c });
      }
    }
    // Shuffle
    allPositions.sort(() => Math.random() - 0.5);

    let cluesPlaced = 0;
    // Try to reveal at least 1 or 2 ship parts and some water
    let shipCluesPlaced = 0;

    for (const pos of allPositions) {
      if (cluesPlaced >= clueCount) break;
      const cell = this.grid[pos.r][pos.c];

      if (cell.solutionIsShip && shipCluesPlaced < Math.ceil(clueCount / 2)) {
        cell.isGiven = true;
        cell.userState = 'ship';
        cell.givenSegment = this.getShipSegmentType(pos.r, pos.c);
        shipCluesPlaced++;
        cluesPlaced++;
      } else if (!cell.solutionIsShip && (cluesPlaced - shipCluesPlaced) < Math.floor(clueCount / 2) + 1) {
        cell.isGiven = true;
        cell.userState = 'water';
        cluesPlaced++;
      }
    }

    // Also auto-mark any 0-rows and 0-cols as water initially for convenience
    for (let r = 0; r < this.gridSize; r++) {
      if (this.rowCounts[r] === 0) {
        for (let c = 0; c < this.gridSize; c++) {
          this.grid[r][c].isGiven = true;
          this.grid[r][c].userState = 'water';
        }
      }
    }
    for (let c = 0; c < this.gridSize; c++) {
      if (this.colCounts[c] === 0) {
        for (let r = 0; r < this.gridSize; r++) {
          this.grid[r][c].isGiven = true;
          this.grid[r][c].userState = 'water';
        }
      }
    }
  }

  // Determine segment shape for a ship cell in the solution
  public getShipSegmentType(r: number, c: number): BattleshipSegmentType {
    const hasNorth = r > 0 && this.grid[r - 1][c].solutionIsShip;
    const hasSouth = r < this.gridSize - 1 && this.grid[r + 1][c].solutionIsShip;
    const hasWest = c > 0 && this.grid[r][c - 1].solutionIsShip;
    const hasEast = c < this.gridSize - 1 && this.grid[r][c + 1].solutionIsShip;

    if (!hasNorth && !hasSouth && !hasWest && !hasEast) {
      return 'submarine';
    }
    if (hasNorth && hasSouth) return 'middle-vert';
    if (hasWest && hasEast) return 'middle-horiz';
    if (hasSouth && !hasNorth) return 'cap-north';
    if (hasNorth && !hasSouth) return 'cap-south';
    if (hasEast && !hasWest) return 'cap-west';
    if (hasWest && !hasEast) return 'cap-east';

    return 'middle-horiz';
  }

  // --- Interaction & Cycling State ---
  // Cell cycles: 'unknown' -> 'water' (waves/X) -> 'ship' (hull) -> 'unknown'
  public cycleCellState(row: number, col: number, targetState?: BattleshipCellState) {
    if (this.isCompleted) return;
    const cell = this.grid[row][col];
    if (cell.isGiven) return;

    const prevState = cell.userState;
    let nextState: BattleshipCellState;

    if (targetState !== undefined) {
      nextState = targetState;
    } else {
      if (prevState === 'unknown') nextState = 'water';
      else if (prevState === 'water') nextState = 'ship';
      else nextState = 'unknown';
    }

    if (prevState === nextState) return;

    // Track corrections (clearing or changing an already filled cell)
    if (prevState !== 'unknown' && nextState !== prevState) {
      this.corrections++;
    }

    // Record history for Undo
    this.history.push({
      row,
      col,
      prevState,
      nextState
    });

    cell.userState = nextState;

    // Play feedback sound
    if (nextState === 'water') this.playWaterSplashSound();
    else if (nextState === 'ship') this.playShipPlacedSound();
    else this.playPencilSound();

    // Check if move was an obvious mistake (e.g. placed ship where solution is water)
    if (nextState === 'ship' && !cell.solutionIsShip) {
      this.mistakes++;
    }

    this.updateFleetStatus();
    this.validateErrors();
    this.checkCompletion();
  }

  // Fast direct actions
  public setCellState(row: number, col: number, state: BattleshipCellState) {
    this.cycleCellState(row, col, state);
  }

  public undo(): boolean {
    if (this.history.length === 0 || this.isCompleted) return false;
    const lastMove = this.history.pop()!;
    const cell = this.grid[lastMove.row][lastMove.col];
    cell.userState = lastMove.prevState;
    this.playPencilSound();
    this.updateFleetStatus();
    this.validateErrors();
    return true;
  }

  // Auto-fill entire row or col with water if all required ship parts are placed
  public autoFillWaterForRow(row: number) {
    if (this.isCompleted) return;
    const currentShipsInRow = this.grid[row].filter(c => c.userState === 'ship').length;
    if (currentShipsInRow === this.rowCounts[row]) {
      for (let c = 0; c < this.gridSize; c++) {
        const cell = this.grid[row][c];
        if (cell.userState === 'unknown' && !cell.isGiven) {
          this.cycleCellState(row, c, 'water');
        }
      }
    }
  }

  public autoFillWaterForCol(col: number) {
    if (this.isCompleted) return;
    let currentShipsInCol = 0;
    for (let r = 0; r < this.gridSize; r++) {
      if (this.grid[r][col].userState === 'ship') currentShipsInCol++;
    }
    if (currentShipsInCol === this.colCounts[col]) {
      for (let r = 0; r < this.gridSize; r++) {
        const cell = this.grid[r][col];
        if (cell.userState === 'unknown' && !cell.isGiven) {
          this.cycleCellState(r, col, 'water');
        }
      }
    }
  }

  // --- Smart Hint ---
  public requestHint(): boolean {
    if (this.hintsRemaining <= 0 || this.isCompleted) return false;

    // 1. Look for a row/col where all ship parts are found -> fill rest with water
    for (let r = 0; r < this.gridSize; r++) {
      const currentShips = this.grid[r].filter(c => c.userState === 'ship').length;
      if (currentShips === this.rowCounts[r]) {
        for (let c = 0; c < this.gridSize; c++) {
          const cell = this.grid[r][c];
          if (cell.userState === 'unknown') {
            cell.userState = 'water';
            this.hintsRemaining--;
            this.hintsUsed++;
            this.lastHintMessage = `💡 Rij ${r + 1} heeft alle ${this.rowCounts[r]} scheepsdelen: overige vakjes gemarkeerd als water!`;
            this.playWaterSplashSound();
            this.validateErrors();
            this.checkCompletion();
            return true;
          }
        }
      }
    }

    // 2. Look for an unknown cell where solution is a ship part
    for (let r = 0; r < this.gridSize; r++) {
      for (let c = 0; c < this.gridSize; c++) {
        const cell = this.grid[r][c];
        if (cell.userState !== 'ship' && cell.solutionIsShip) {
          cell.userState = 'ship';
          this.hintsRemaining--;
          this.hintsUsed++;
          this.lastHintMessage = `💡 Schip gevonden op rij ${r + 1}, kolom ${c + 1}!`;
          this.playShipPlacedSound();
          this.updateFleetStatus();
          this.validateErrors();
          this.checkCompletion();
          return true;
        }
      }
    }

    return false;
  }

  // --- Validation & Status ---
  public validateErrors() {
    // Reset errors
    for (let r = 0; r < this.gridSize; r++) {
      for (let c = 0; c < this.gridSize; c++) {
        this.grid[r][c].isError = false;
      }
    }

    // Check diagonal touching (no two ship cells may touch diagonally)
    for (let r = 0; r < this.gridSize; r++) {
      for (let c = 0; c < this.gridSize; c++) {
        if (this.grid[r][c].userState === 'ship') {
          // Check diagonal neighbors
          const diagonals = [
            [-1, -1], [-1, 1], [1, -1], [1, 1]
          ];
          for (const [dr, dc] of diagonals) {
            const nr = r + dr;
            const nc = c + dc;
            if (nr >= 0 && nr < this.gridSize && nc >= 0 && nc < this.gridSize) {
              if (this.grid[nr][nc].userState === 'ship') {
                this.grid[r][c].isError = true;
                this.grid[nr][nc].isError = true;
              }
            }
          }
        }
      }
    }

    // Check row counts
    for (let r = 0; r < this.gridSize; r++) {
      const shipCount = this.grid[r].filter(c => c.userState === 'ship').length;
      if (shipCount > this.rowCounts[r]) {
        this.grid[r].forEach(c => {
          if (c.userState === 'ship') c.isError = true;
        });
      }
    }

    // Check col counts
    for (let c = 0; c < this.gridSize; c++) {
      let shipCount = 0;
      for (let r = 0; r < this.gridSize; r++) {
        if (this.grid[r][c].userState === 'ship') shipCount++;
      }
      if (shipCount > this.colCounts[c]) {
        for (let r = 0; r < this.gridSize; r++) {
          if (this.grid[r][c].userState === 'ship') this.grid[r][c].isError = true;
        }
      }
    }
  }

  public updateFleetStatus() {
    let newlySunk = false;

    for (const ship of this.ships) {
      const allFound = ship.cells.every(c => this.grid[c.row][c.col].userState === 'ship');
      if (allFound && !ship.isSunk) {
        ship.isSunk = true;
        newlySunk = true;
      } else if (!allFound && ship.isSunk) {
        ship.isSunk = false;
      }
    }

    if (newlySunk) {
      this.playShipSunkFanfare();
    }
  }

  private checkCompletion() {
    // Must have no errors
    const hasAnyError = this.grid.some(row => row.some(c => c.isError));
    if (hasAnyError) return;

    // All ships must be sunk
    const allShipsSunk = this.ships.every(s => s.isSunk);
    if (!allShipsSunk) return;

    // Row and column counts must match exactly
    for (let r = 0; r < this.gridSize; r++) {
      const count = this.grid[r].filter(c => c.userState === 'ship').length;
      if (count !== this.rowCounts[r]) return;
    }
    for (let c = 0; c < this.gridSize; c++) {
      let count = 0;
      for (let r = 0; r < this.gridSize; r++) {
        if (this.grid[r][c].userState === 'ship') count++;
      }
      if (count !== this.colCounts[c]) return;
    }

    // Victory!
    this.isCompleted = true;
    this.isTimerRunning = false;
    this.playVictoryFanfare();
  }

  // --- Score Calculation ---
  /**
   * Base score:
   * Easy (8x8): 6,000 pts
   * Medium (8x8 with fewer clues): 8,500 pts
   * Hard (10x10): 12,000 pts
   * 
   * Speed Bonus: Max 3,000 pts (decays with seconds)
   * Deductions:
   * - Each Hint: -800 pts
   * - Each Mistake: -400 pts
   * - Each Correction: -100 pts
   * Minimum score floor: 300 pts
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
      easy: 6000,
      medium: 8500,
      hard: 12000
    };
    const baseScore = baseMap[this.difficulty];

    const timeDecay = Math.floor(this.timerSeconds * 3.5);
    const timeBonus = Math.max(0, 3000 - timeDecay);

    const mistakePenalty = this.mistakes * 400;
    const hintPenalty = this.hintsUsed * 800;
    const correctionPenalty = this.corrections * 100;

    const rawScore = baseScore + timeBonus - mistakePenalty - hintPenalty - correctionPenalty;
    const finalScore = Math.max(300, rawScore);

    return {
      baseScore,
      timeBonus,
      mistakePenalty,
      hintPenalty,
      correctionPenalty,
      finalScore
    };
  }

  public updateTimer() {
    if (this.isTimerRunning && !this.isCompleted) {
      this.timerSeconds++;
    }
  }
}
