/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ShipDefinition {
  id: string;
  nameNl: string;
  nameEn: string;
  size: number;
  icon: string;
}

export const FLEET_DEFINITIONS: ShipDefinition[] = [
  { id: 'carrier', nameNl: 'Vliegdekschip', nameEn: 'Aircraft Carrier', size: 5, icon: '🚢' },
  { id: 'battleship', nameNl: 'Slagschip', nameEn: 'Battleship', size: 4, icon: '🛳️' },
  { id: 'cruiser', nameNl: 'Kruiser', nameEn: 'Cruiser', size: 3, icon: '⛵' },
  { id: 'submarine', nameNl: 'Duikboot', nameEn: 'Submarine', size: 3, icon: '🪸' },
  { id: 'destroyer', nameNl: 'Torpedobootjager', nameEn: 'Destroyer', size: 2, icon: '🚤' }
];

export interface CellState {
  r: number;
  c: number;
  hasShip: boolean;
  shipId: string | null;
  isHit: boolean;
  isMiss: boolean;
}

export interface PlacedShip {
  id: string;
  nameNl: string;
  size: number;
  icon: string;
  cells: { r: number; c: number }[];
  hits: number;
  isSunk: boolean;
}

export interface ShotRecord {
  r: number;
  c: number;
  isHit: boolean;
  isSunk: boolean;
  sunkShipName?: string;
  shooter: 'player' | 'ai';
  timestamp: string;
}

export class ClassicBattleshipEngine {
  public gridSize: number = 10;
  public playerGrid: CellState[][] = [];
  public aiGrid: CellState[][] = [];

  public playerShips: PlacedShip[] = [];
  public aiShips: PlacedShip[] = [];

  public phase: 'placement' | 'playing' | 'game_over' = 'placement';
  public winner: 'player' | 'ai' | null = null;
  public turn: 'player' | 'ai' = 'player';

  public shotHistory: ShotRecord[] = [];
  public lastShotResult: { text: string; type: 'hit' | 'miss' | 'sunk' | 'info' } | null = null;

  // AI Memory for Target Mode
  private aiTargetQueue: { r: number; c: number }[] = [];
  private aiHitsInCurrentTarget: { r: number; c: number }[] = [];

  private audioCtx: AudioContext | null = null;

  constructor() {
    this.initGame();
  }

  public initGame() {
    this.phase = 'placement';
    this.winner = null;
    this.turn = 'player';
    this.shotHistory = [];
    this.lastShotResult = { text: 'Teken je vloot op het ruitjespapier of kies "Automatisch Tekenen".', type: 'info' };
    this.aiTargetQueue = [];
    this.aiHitsInCurrentTarget = [];

    this.playerGrid = this.createEmptyGrid();
    this.aiGrid = this.createEmptyGrid();

    this.playerShips = [];
    this.aiShips = [];

    // Automatically place AI fleet secretly
    this.autoPlaceFleet(this.aiGrid, this.aiShips);
  }

  private createEmptyGrid(): CellState[][] {
    const grid: CellState[][] = [];
    for (let r = 0; r < this.gridSize; r++) {
      const row: CellState[] = [];
      for (let c = 0; c < this.gridSize; c++) {
        row.push({
          r,
          c,
          hasShip: false,
          shipId: null,
          isHit: false,
          isMiss: false
        });
      }
      grid.push(row);
    }
    return grid;
  }

  // Auto-place fleet randomly on a grid
  public autoPlaceFleet(grid: CellState[][], shipsArray: PlacedShip[]) {
    // Clear grid ship states first
    for (let r = 0; r < this.gridSize; r++) {
      for (let c = 0; c < this.gridSize; c++) {
        grid[r][c].hasShip = false;
        grid[r][c].shipId = null;
      }
    }
    shipsArray.length = 0;

    for (const def of FLEET_DEFINITIONS) {
      let placed = false;
      let attempts = 0;

      while (!placed && attempts < 500) {
        attempts++;
        const isHorizontal = Math.random() < 0.5;
        const maxR = isHorizontal ? this.gridSize : this.gridSize - def.size;
        const maxC = isHorizontal ? this.gridSize - def.size : this.gridSize;

        const startR = Math.floor(Math.random() * maxR);
        const startC = Math.floor(Math.random() * maxC);

        // Check if placement valid (no overlap + optional 1-cell buffer)
        let valid = true;
        const proposedCells: { r: number; c: number }[] = [];

        for (let i = 0; i < def.size; i++) {
          const r = isHorizontal ? startR : startR + i;
          const c = isHorizontal ? startC + i : startC;

          if (grid[r][c].hasShip) {
            valid = false;
            break;
          }
          proposedCells.push({ r, c });
        }

        if (valid) {
          // Place ship
          for (const cell of proposedCells) {
            grid[cell.r][cell.c].hasShip = true;
            grid[cell.r][cell.c].shipId = def.id;
          }

          shipsArray.push({
            id: def.id,
            nameNl: def.nameNl,
            size: def.size,
            icon: def.icon,
            cells: proposedCells,
            hits: 0,
            isSunk: false
          });

          placed = true;
        }
      }
    }
  }

  public autoPlacePlayerFleet() {
    this.autoPlaceFleet(this.playerGrid, this.playerShips);
  }

  public startBattle(): boolean {
    if (this.playerShips.length < FLEET_DEFINITIONS.length) {
      this.lastShotResult = { text: '⚠️ Plaats eerst alle 5 je schepen op het ruitjespapier!', type: 'info' };
      return false;
    }

    this.phase = 'playing';
    this.turn = 'player';
    this.lastShotResult = { text: '⚔️ De zeeslag is begonnen! Klik op een coördinaat op de kaart van de tegenstander om een torpedo af te vuren.', type: 'info' };
    return true;
  }

  // Player shoots at AI grid coordinate (r, c)
  public playerFire(r: number, c: number): boolean {
    if (this.phase !== 'playing' || this.turn !== 'player') return false;

    const cell = this.aiGrid[r][c];
    if (cell.isHit || cell.isMiss) {
      this.lastShotResult = { text: `⚠️ Coördinaat ${this.formatCoord(r, c)} is al beschoten!`, type: 'info' };
      return false;
    }

    const colLetter = String.fromCharCode(65 + c);
    const coordStr = `${colLetter}${r + 1}`;

    if (cell.hasShip) {
      cell.isHit = true;
      this.playExplosionSound();

      // Find hit ship
      const ship = this.aiShips.find(s => s.id === cell.shipId);
      if (ship) {
        ship.hits++;
        if (ship.hits >= ship.size) {
          ship.isSunk = true;
          this.lastShotResult = {
            text: `💥 RAAK & GEZONKEN! Je hebt het vijandelijke ${ship.nameNl} (${ship.icon}) op ${coordStr} laten zinken!`,
            type: 'sunk'
          };
        } else {
          this.lastShotResult = {
            text: `💥 RAAK op ${coordStr}! Een vijandelijk schip is getroffen!`,
            type: 'hit'
          };
        }
      }

      this.shotHistory.unshift({
        r,
        c,
        isHit: true,
        isSunk: ship ? ship.isSunk : false,
        sunkShipName: ship?.nameNl,
        shooter: 'player',
        timestamp: coordStr
      });

      // Check player victory
      if (this.aiShips.every(s => s.isSunk)) {
        this.phase = 'game_over';
        this.winner = 'player';
        this.playVictoryFanfare();
        this.lastShotResult = { text: '🏆 OVERWINNING! Je hebt de gehele vijandelijke vloot tot zinken gebracht!', type: 'sunk' };
        return true;
      }
    } else {
      cell.isMiss = true;
      this.playSplashSound();
      this.lastShotResult = { text: `🌊 PLONS op ${coordStr}! Mis in het open water...`, type: 'miss' };

      this.shotHistory.unshift({
        r,
        c,
        isHit: false,
        isSunk: false,
        shooter: 'player',
        timestamp: coordStr
      });
    }

    // Pass turn to AI
    this.turn = 'ai';
    setTimeout(() => {
      this.aiTurn();
    }, 700);

    return true;
  }

  // Tactical C64 Radar AI logic
  private aiTurn() {
    if (this.phase !== 'playing' || this.turn !== 'ai') return;

    let targetR = -1;
    let targetC = -1;

    // 1. Process target queue if available
    while (this.aiTargetQueue.length > 0) {
      const candidate = this.aiTargetQueue.shift()!;
      const cell = this.playerGrid[candidate.r][candidate.c];
      if (!cell.isHit && !cell.isMiss) {
        targetR = candidate.r;
        targetC = candidate.c;
        break;
      }
    }

    // 2. If no queued targets, select parity search tile (checkerboard mode)
    if (targetR === -1) {
      const openCells: { r: number; c: number }[] = [];
      for (let r = 0; r < this.gridSize; r++) {
        for (let c = 0; c < this.gridSize; c++) {
          const cell = this.playerGrid[r][c];
          if (!cell.isHit && !cell.isMiss) {
            // Parity: sum of r + c is even for efficiency
            if ((r + c) % 2 === 0) {
              openCells.push({ r, c });
            }
          }
        }
      }

      // Fallback if no parity tiles left
      if (openCells.length === 0) {
        for (let r = 0; r < this.gridSize; r++) {
          for (let c = 0; c < this.gridSize; c++) {
            const cell = this.playerGrid[r][c];
            if (!cell.isHit && !cell.isMiss) {
              openCells.push({ r, c });
            }
          }
        }
      }

      if (openCells.length > 0) {
        const choice = openCells[Math.floor(Math.random() * openCells.length)];
        targetR = choice.r;
        targetC = choice.c;
      }
    }

    if (targetR === -1) return;

    const targetCell = this.playerGrid[targetR][targetC];
    const coordStr = `${String.fromCharCode(65 + targetC)}${targetR + 1}`;

    if (targetCell.hasShip) {
      targetCell.isHit = true;
      this.playExplosionSound();

      const ship = this.playerShips.find(s => s.id === targetCell.shipId);
      if (ship) {
        ship.hits++;
        this.aiHitsInCurrentTarget.push({ r: targetR, c: targetC });

        if (ship.hits >= ship.size) {
          ship.isSunk = true;
          this.aiTargetQueue = []; // Clear queue since ship is sunk
          this.aiHitsInCurrentTarget = [];
          this.lastShotResult = {
            text: `⚠️ WAARSCHUWING: De C64 AI heeft jouw ${ship.nameNl} (${ship.icon}) op ${coordStr} laten zinken!`,
            type: 'sunk'
          };
        } else {
          // Add adjacent orthogonal squares to AI target queue
          const neighbors = [
            { r: targetR - 1, c: targetC },
            { r: targetR + 1, c: targetC },
            { r: targetR, c: targetC - 1 },
            { r: targetR, c: targetC + 1 }
          ];

          for (const n of neighbors) {
            if (n.r >= 0 && n.r < this.gridSize && n.c >= 0 && n.c < this.gridSize) {
              const cCell = this.playerGrid[n.r][n.c];
              if (!cCell.isHit && !cCell.isMiss) {
                this.aiTargetQueue.push(n);
              }
            }
          }

          this.lastShotResult = {
            text: `💥 DE COMPUTER HEEFT RAAK GESCHOTEN op ${coordStr}! Jouw vloot leidt schade.`,
            type: 'hit'
          };
        }
      }

      this.shotHistory.unshift({
        r: targetR,
        c: targetC,
        isHit: true,
        isSunk: ship ? ship.isSunk : false,
        sunkShipName: ship?.nameNl,
        shooter: 'ai',
        timestamp: coordStr
      });

      // Check AI victory
      if (this.playerShips.every(s => s.isSunk)) {
        this.phase = 'game_over';
        this.winner = 'ai';
        this.playDefeatTone();
        this.lastShotResult = { text: '💀 DE COMPUTER HEEFT GEWONNEN! Je gehele vloot is gezonken.', type: 'sunk' };
        return;
      }
    } else {
      targetCell.isMiss = true;
      this.playSplashSound();
      this.lastShotResult = {
        text: `🛡️ GOED NIEUWS: Schot van de computer op ${coordStr} belandde in het water! Jouw beurt.`,
        type: 'miss'
      };

      this.shotHistory.unshift({
        r: targetR,
        c: targetC,
        isHit: false,
        isSunk: false,
        shooter: 'ai',
        timestamp: coordStr
      });
    }

    this.turn = 'player';
  }

  public formatCoord(r: number, c: number): string {
    return `${String.fromCharCode(65 + c)}${r + 1}`;
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

  public playSplashSound() {
    try {
      this.initAudio();
      if (!this.audioCtx) return;
      const t = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(300, t);
      osc.frequency.exponentialRampToValueAtTime(80, t + 0.25);

      gain.gain.setValueAtTime(0.15, t);
      gain.gain.linearRampToValueAtTime(0.01, t + 0.25);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start(t);
      osc.stop(t + 0.25);
    } catch {
      // Audio error fallback
    }
  }

  public playExplosionSound() {
    try {
      this.initAudio();
      if (!this.audioCtx) return;
      const t = this.audioCtx.currentTime;

      // Noise buffer for explosion rumble
      const bufferSize = this.audioCtx.sampleRate * 0.35;
      const buffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = this.audioCtx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.audioCtx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, t);
      filter.frequency.exponentialRampToValueAtTime(100, t + 0.35);

      const gain = this.audioCtx.createGain();
      gain.gain.setValueAtTime(0.3, t);
      gain.gain.linearRampToValueAtTime(0.01, t + 0.35);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.audioCtx.destination);

      noise.start(t);
      noise.stop(t + 0.35);
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

        gain.gain.setValueAtTime(0.15, t + idx * 0.12);
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
      osc.frequency.setValueAtTime(300, t);
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
