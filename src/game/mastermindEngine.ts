import { PegColor, GameMode, GAME_MODES, RowFeedback, GuessRow, MastermindGameState } from './mastermindTypes';

export class MastermindEngine {
  public mode: GameMode = 'classic';
  public allowDuplicates: boolean = true;
  public secretCode: PegColor[] = [];
  public rows: GuessRow[] = [];
  public currentRowIndex: number = 0;
  public state: MastermindGameState = 'PLAYING';
  public startTime: number = Date.now();
  public endTime: number | null = null;
  public hintsUsed: number = 0;

  constructor(mode: GameMode = 'classic', allowDuplicates: boolean = true) {
    this.mode = mode;
    this.allowDuplicates = allowDuplicates;
    this.startNewGame();
  }

  public get config() {
    return GAME_MODES[this.mode];
  }

  public startNewGame() {
    this.state = 'PLAYING';
    this.startTime = Date.now();
    this.endTime = null;
    this.hintsUsed = 0;
    this.currentRowIndex = 0;

    // Generate secret code
    const colors = [...this.config.availableColors];
    const codeLen = this.config.codeLength;
    this.secretCode = [];

    if (this.allowDuplicates) {
      for (let i = 0; i < codeLen; i++) {
        const randIdx = Math.floor(Math.random() * colors.length);
        this.secretCode.push(colors[randIdx]);
      }
    } else {
      // Shuffle and pick unique colors
      const shuffled = [...colors].sort(() => Math.random() - 0.5);
      this.secretCode = shuffled.slice(0, codeLen);
    }

    // Initialize blank rows
    this.rows = [];
    for (let i = 0; i < this.config.maxTurns; i++) {
      this.rows.push({
        pegs: new Array(codeLen).fill(null),
        feedback: null,
      });
    }
  }

  public getCurrentRow(): GuessRow {
    return this.rows[this.currentRowIndex];
  }

  public setPeg(pegIndex: number, color: PegColor) {
    if (this.state !== 'PLAYING') return;
    const row = this.getCurrentRow();
    if (!row) return;
    if (pegIndex >= 0 && pegIndex < this.config.codeLength) {
      row.pegs[pegIndex] = color;
    }
  }

  public clearPeg(pegIndex: number) {
    if (this.state !== 'PLAYING') return;
    const row = this.getCurrentRow();
    if (!row) return;
    if (pegIndex >= 0 && pegIndex < this.config.codeLength) {
      row.pegs[pegIndex] = null;
    }
  }

  public clearCurrentRow() {
    if (this.state !== 'PLAYING') return;
    const row = this.getCurrentRow();
    if (!row) return;
    row.pegs = new Array(this.config.codeLength).fill(null);
  }

  public isCurrentRowComplete(): boolean {
    const row = this.getCurrentRow();
    if (!row) return false;
    return row.pegs.every((p) => p !== null);
  }

  /**
   * Evaluates a guess against a secret code
   */
  public static evaluateGuess(guess: PegColor[], secret: PegColor[]): RowFeedback {
    let black = 0;
    let white = 0;

    const secretCopy: (PegColor | null)[] = [...secret];
    const guessCopy: (PegColor | null)[] = [...guess];

    // First pass: exact matches (black pins)
    for (let i = 0; i < guess.length; i++) {
      if (guessCopy[i] === secretCopy[i]) {
        black++;
        secretCopy[i] = null;
        guessCopy[i] = null;
      }
    }

    // Second pass: color matches on wrong positions (white pins)
    for (let i = 0; i < guess.length; i++) {
      if (guessCopy[i] !== null) {
        const foundIdx = secretCopy.findIndex((c) => c === guessCopy[i]);
        if (foundIdx !== -1) {
          white++;
          secretCopy[foundIdx] = null;
        }
      }
    }

    return { black, white };
  }

  /**
   * Submit current row guess
   */
  public submitCurrentGuess(): { feedback: RowFeedback; state: MastermindGameState } | null {
    if (this.state !== 'PLAYING') return null;
    if (!this.isCurrentRowComplete()) return null;

    const row = this.getCurrentRow();
    const guess = row.pegs as PegColor[];
    const feedback = MastermindEngine.evaluateGuess(guess, this.secretCode);

    row.feedback = feedback;
    row.timestamp = Date.now();

    if (feedback.black === this.config.codeLength) {
      this.state = 'WON';
      this.endTime = Date.now();
    } else if (this.currentRowIndex >= this.config.maxTurns - 1) {
      this.state = 'LOST';
      this.endTime = Date.now();
    } else {
      this.currentRowIndex += 1;
    }

    return { feedback, state: this.state };
  }

  /**
   * Smart deductive hint: reveals 1 exact peg position or a color present in the secret
   */
  public getHint(): { type: 'position' | 'color'; index?: number; color: PegColor; text: string } | null {
    if (this.state !== 'PLAYING') return null;
    this.hintsUsed += 1;

    // Check which positions are not yet guessed correctly in recent turns
    const row = this.getCurrentRow();
    const unfilledIndices: number[] = [];
    for (let i = 0; i < this.config.codeLength; i++) {
      if (row.pegs[i] !== this.secretCode[i]) {
        unfilledIndices.push(i);
      }
    }

    if (unfilledIndices.length > 0) {
      const targetIdx = unfilledIndices[Math.floor(Math.random() * unfilledIndices.length)];
      const correctColor = this.secretCode[targetIdx];
      row.pegs[targetIdx] = correctColor;
      return {
        type: 'position',
        index: targetIdx,
        color: correctColor,
        text: `Pion op positie ${targetIdx + 1} is ${correctColor.toUpperCase()}!`,
      };
    }

    const randColor = this.secretCode[Math.floor(Math.random() * this.secretCode.length)];
    return {
      type: 'color',
      color: randColor,
      text: `De kleur ${randColor.toUpperCase()} zit gegarandeerd in de code!`,
    };
  }

  public getElapsedTimeSeconds(): number {
    const end = this.endTime || Date.now();
    return Math.max(0, Math.floor((end - this.startTime) / 1000));
  }
}
