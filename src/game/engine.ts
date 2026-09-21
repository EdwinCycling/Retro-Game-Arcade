/**
 * Authentic Pac-Man Game Engine
 */

import {
  Difficulty,
  Direction,
  FruitBonus,
  FruitType,
  GameState,
  GhostEntity,
  GhostMode,
  LevelConfig,
  PacmanEntity,
  ScorePopup,
  TileCoord
} from '../types';
import { retroAudio } from './audio';
import { haptics } from '../utils/haptics';
import { MAZE_DEFINITIONS, MazeDefinition } from './pacmanMazes';
import {
  BASE_PIXELS_PER_FRAME,
  BLINKY_START_POS,
  CANVAS_WIDTH,
  CLYDE_START_POS,
  FRUIT_POS,
  GHOST_DOOR_TILE,
  GHOST_REVIVE_TARGET,
  INKY_START_POS,
  MAZE_COLS,
  MAZE_ROWS,
  MAZE_Y_OFFSET,
  ORIGINAL_MAZE_MAP,
  PACMAN_START_POS,
  PACMAN_START_TILE,
  PINKY_START_POS,
  SCATTER_CORNERS,
  TILE_SIZE
} from './constants';
import {
  calculateGhostTarget,
  decideGhostDirection,
  getOppositeDirection,
  isTilePassableForGhost
} from './ghostAi';
import { getLevelConfig } from './levels';

export interface GameEngineEvents {
  onScoreChange?: (score: number) => void;
  onHighScoreChange?: (highScore: number) => void;
  onLivesChange?: (lives: number) => void;
  onLevelChange?: (level: number) => void;
  onGameStateChange?: (state: GameState) => void;
}

export class PacmanGameEngine {
  public maze: string[] = [];
  public pacman: PacmanEntity;
  public ghosts: GhostEntity[] = [];
  public fruit: FruitBonus;
  public scorePopups: ScorePopup[] = [];

  public score: number = 0;
  public highScore: number = 10000;
  public lives: number = 3;
  public level: number = 1;
  public levelConfig: LevelConfig;
  public difficulty: Difficulty = 'classic';
  public gameState: GameState = 'READY';

  public activeMaze: MazeDefinition = MAZE_DEFINITIONS[0];
  public mazeId: string = 'classic';
  public dotsRemaining: number = 244;
  public dotsEatenThisLevel: number = 0;
  public fruitHistory: FruitType[] = ['CHERRY'];

  private ghostsEatenCount: number = 0; // In current energizer streak (200, 400, 800, 1600)
  private extraLifeAwarded: boolean = false;

  // Wave mode timing
  private waveIndex: number = 0;
  private waveTimer: number = 0;
  private currentGlobalMode: 'SCATTER' | 'CHASE' = 'SCATTER';
  private frightenedTimer: number = 0;

  // Ghost house timers & counters
  private dotEatingIdleTimer: number = 0;

  // Animation & pause counters
  public tick: number = 0;
  private pauseTimer: number = 0;
  private levelClearTimer: number = 0;
  private energizerFlash: boolean = true;

  private events: GameEngineEvents;

  constructor(events: GameEngineEvents = {}) {
    this.events = events;
    this.levelConfig = getLevelConfig(this.level, this.difficulty);
    
    // Load high score from local storage
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('pacman_high_score');
      if (saved) {
        this.highScore = parseInt(saved, 10) || 10000;
      }
    }

    this.pacman = this.createPacman();
    this.fruit = this.createFruit();
    this.initLevel(1, false);
  }

  private createPacman(): PacmanEntity {
    return {
      x: PACMAN_START_POS.x,
      y: PACMAN_START_POS.y,
      tileX: PACMAN_START_TILE.x,
      tileY: PACMAN_START_TILE.y,
      dir: 'LEFT',
      nextDir: 'LEFT',
      speed: 0,
      mouthAngle: 0.25 * Math.PI,
      mouthDir: 1,
      deathProgress: 0,
      isDead: false
    };
  }

  private createGhosts(): GhostEntity[] {
    return [
      {
        name: 'blinky',
        displayName: 'Blinky',
        characterName: 'Shadow',
        color: '#ff0000',
        scatterColor: '#ff0000',
        x: BLINKY_START_POS.x,
        y: BLINKY_START_POS.y,
        tileX: 13,
        tileY: 11,
        dir: 'LEFT',
        targetTile: SCATTER_CORNERS.blinky,
        mode: 'SCATTER',
        speed: 0,
        inHouse: false,
        houseExitDotLimit: 0,
        animationFrame: 0,
        frightenedFlash: false,
        reverseNextTile: false,
        scatterCorner: SCATTER_CORNERS.blinky
      },
      {
        name: 'pinky',
        displayName: 'Pinky',
        characterName: 'Speedy',
        color: '#ffb8ff',
        scatterColor: '#ffb8ff',
        x: PINKY_START_POS.x,
        y: PINKY_START_POS.y,
        tileX: 13,
        tileY: 14,
        dir: 'UP',
        targetTile: SCATTER_CORNERS.pinky,
        mode: 'IN_HOUSE',
        speed: 0,
        inHouse: true,
        houseExitDotLimit: 0,
        animationFrame: 0,
        frightenedFlash: false,
        reverseNextTile: false,
        scatterCorner: SCATTER_CORNERS.pinky
      },
      {
        name: 'inky',
        displayName: 'Inky',
        characterName: 'Bashful',
        color: '#00ffff',
        scatterColor: '#00ffff',
        x: INKY_START_POS.x,
        y: INKY_START_POS.y,
        tileX: 11,
        tileY: 14,
        dir: 'UP',
        targetTile: SCATTER_CORNERS.inky,
        mode: 'IN_HOUSE',
        speed: 0,
        inHouse: true,
        houseExitDotLimit: this.level === 1 ? 30 : 0,
        animationFrame: 0,
        frightenedFlash: false,
        reverseNextTile: false,
        scatterCorner: SCATTER_CORNERS.inky
      },
      {
        name: 'clyde',
        displayName: 'Clyde',
        characterName: 'Pokey',
        color: '#ffb851',
        scatterColor: '#ffb851',
        x: CLYDE_START_POS.x,
        y: CLYDE_START_POS.y,
        tileX: 15,
        tileY: 14,
        dir: 'UP',
        targetTile: SCATTER_CORNERS.clyde,
        mode: 'IN_HOUSE',
        speed: 0,
        inHouse: true,
        houseExitDotLimit: this.level === 1 ? 60 : (this.level === 2 ? 50 : 0),
        animationFrame: 0,
        frightenedFlash: false,
        reverseNextTile: false,
        scatterCorner: SCATTER_CORNERS.clyde
      }
    ];
  }

  private createFruit(): FruitBonus {
    return {
      type: this.levelConfig.fruit,
      points: this.levelConfig.fruitPoints,
      active: false,
      x: FRUIT_POS.x,
      y: FRUIT_POS.y,
      timer: 0,
      eatenDisplayTimer: 0
    };
  }

  /**
   * Count total dots and energizers in given maze grid
   */
  private countDotsInGrid(grid: string[]): number {
    let count = 0;
    for (const row of grid) {
      for (let c = 0; c < row.length; c++) {
        if (row[c] === '.' || row[c] === 'o') count++;
      }
    }
    return count;
  }

  public setMaze(mazeId: string) {
    const found = MAZE_DEFINITIONS.find((m) => m.id === mazeId);
    if (found) {
      this.activeMaze = found;
      this.mazeId = found.id;
      this.initLevel(this.level, false);
    }
  }

  /**
   * Initialize a new level or restart current level
   */
  public initLevel(lvl: number = 1, playSound: boolean = true) {
    this.level = lvl;
    this.levelConfig = getLevelConfig(this.level, this.difficulty);

    // If classic mode is selected, automatically cycle Ms. Pacman mazes based on round if player picked ms_maze
    if (this.mazeId.startsWith('ms_')) {
      if (lvl <= 2) this.activeMaze = MAZE_DEFINITIONS[1];
      else if (lvl <= 5) this.activeMaze = MAZE_DEFINITIONS[2];
      else if (lvl <= 9) this.activeMaze = MAZE_DEFINITIONS[3];
      else this.activeMaze = MAZE_DEFINITIONS[4];
    }

    this.maze = [...this.activeMaze.grid];
    this.dotsRemaining = this.countDotsInGrid(this.maze);
    this.dotsEatenThisLevel = 0;
    this.fruit = this.createFruit();
    if (this.activeMaze.fruitType) {
      this.fruit.type = this.activeMaze.fruitType;
      this.fruit.points = this.activeMaze.fruitPoints;
    }
    this.fruitHistory.push(this.fruit.type);

    this.resetPositions();
    this.setGameState('READY');

    if (playSound) {
      retroAudio.playIntroTheme(() => {
        if (this.gameState === 'READY') {
          this.setGameState('PLAYING');
        }
      });
    } else {
      setTimeout(() => {
        if (this.gameState === 'READY') {
          this.setGameState('PLAYING');
        }
      }, 2200);
    }

    this.events.onLevelChange?.(this.level);
    this.events.onHighScoreChange?.(this.highScore);
    this.events.onScoreChange?.(this.score);
    this.events.onLivesChange?.(this.lives);
  }

  /**
   * Reset entity positions (after death or level start)
   */
  public resetPositions() {
    this.pacman = this.createPacman();
    this.ghosts = this.createGhosts();
    this.ghostsEatenCount = 0;
    this.frightenedTimer = 0;
    this.waveIndex = 0;
    this.waveTimer = 0;
    this.currentGlobalMode = 'SCATTER';
    this.dotEatingIdleTimer = 0;
    this.pauseTimer = 0;
  }

  public setDifficulty(diff: Difficulty) {
    this.difficulty = diff;
    this.levelConfig = getLevelConfig(this.level, this.difficulty);
  }

  public setGameState(state: GameState) {
    this.gameState = state;
    this.events.onGameStateChange?.(state);

    if (state !== 'PLAYING') {
      retroAudio.stopSiren();
    }
  }

  /**
   * Player input handling
   */
  public handleDirectionInput(dir: Direction) {
    if (this.gameState === 'READY') {
      // Allow early buffer
      this.pacman.nextDir = dir;
      return;
    }

    if (this.gameState !== 'PLAYING') return;

    this.pacman.nextDir = dir;

    // Instant reverse if pressing opposite direction
    if (dir === getOppositeDirection(this.pacman.dir)) {
      this.pacman.dir = dir;
    }
  }

  /**
   * Main game loop tick called at 60 FPS
   */
  public update() {
    this.tick++;

    // Energizer blinking (pulse every 12 frames)
    if (this.tick % 12 === 0) {
      this.energizerFlash = !this.energizerFlash;
    }

    // Floating score popups countdown
    for (let i = this.scorePopups.length - 1; i >= 0; i--) {
      this.scorePopups[i].timer--;
      if (this.scorePopups[i].timer <= 0) {
        this.scorePopups.splice(i, 1);
      }
    }

    // Fruit bonus timer
    if (this.fruit.active) {
      this.fruit.timer--;
      if (this.fruit.timer <= 0) {
        this.fruit.active = false;
      }
    }

    // Handle momentary pause states (e.g. eating ghost pause)
    if (this.pauseTimer > 0) {
      this.pauseTimer--;
      return;
    }

    // Handle Pac-Man dying animation
    if (this.gameState === 'PACMAN_DYING') {
      this.pacman.deathProgress += 0.018;
      if (this.pacman.deathProgress >= 1) {
        this.lives--;
        this.events.onLivesChange?.(this.lives);

        if (this.lives <= 0) {
          this.setGameState('GAME_OVER');
        } else {
          this.resetPositions();
          this.setGameState('READY');
          setTimeout(() => {
            if (this.gameState === 'READY') {
              this.setGameState('PLAYING');
            }
          }, 2000);
        }
      }
      return;
    }

    // Handle Level Clear flashing
    if (this.gameState === 'LEVEL_CLEAR') {
      this.levelClearTimer--;
      if (this.levelClearTimer <= 0) {
        this.initLevel(this.level + 1, false);
      }
      return;
    }

    if (this.gameState !== 'PLAYING') {
      return;
    }

    // Update Scatter / Chase mode waves
    this.updateGlobalWaves();

    // Update Siren Sound based on status
    this.updateSoundEngine();

    // Update Pac-Man
    this.updatePacman();

    // Update Ghosts
    this.updateGhosts();

    // Check collisions
    this.checkCollisions();
  }

  /**
   * Sound engine coordinator
   */
  private updateSoundEngine() {
    const hasFrightened = this.ghosts.some(g => g.mode === 'FRIGHTENED');
    const hasEyes = this.ghosts.some(g => g.mode === 'EATEN');

    if (hasEyes) {
      retroAudio.updateSiren('eyes');
    } else if (hasFrightened) {
      retroAudio.updateSiren('frightened');
    } else {
      retroAudio.updateSiren('normal', this.dotsRemaining);
    }
  }

  /**
   * Authentic Scatter / Chase Wave timer controller
   */
  private updateGlobalWaves() {
    // If frightened is active, pause wave timer
    if (this.frightenedTimer > 0) {
      this.frightenedTimer--;
      if (this.frightenedTimer === 0) {
        // Revert frightened ghosts back to current global mode
        for (const ghost of this.ghosts) {
          if (ghost.mode === 'FRIGHTENED') {
            ghost.mode = this.currentGlobalMode;
          }
        }
        this.ghostsEatenCount = 0;
      }
      return;
    }

    const waves = this.levelConfig.scatterChaseWaves;
    if (this.waveIndex < waves.length) {
      const currentWave = waves[this.waveIndex];
      this.waveTimer++;

      if (this.currentGlobalMode === 'SCATTER') {
        if (this.waveTimer >= currentWave.scatter * 60) {
          this.currentGlobalMode = 'CHASE';
          this.waveTimer = 0;
          this.reverseGhostsDirection();
        }
      } else {
        if (this.waveTimer >= currentWave.chase * 60) {
          this.waveIndex++;
          this.currentGlobalMode = 'SCATTER';
          this.waveTimer = 0;
          this.reverseGhostsDirection();
        }
      }
    }
  }

  /**
   * Ghosts reverse direction on Scatter <-> Chase transition
   */
  private reverseGhostsDirection() {
    for (const ghost of this.ghosts) {
      if (ghost.mode === 'CHASE' || ghost.mode === 'SCATTER') {
        ghost.mode = this.currentGlobalMode;
        ghost.dir = getOppositeDirection(ghost.dir);
      }
    }
  }

  /**
   * Update Pac-Man movement, cornering, and dot eating
   */
  private updatePacman() {
    const p = this.pacman;

    // Determine current speed based on status
    let speedMult = this.levelConfig.pacmanSpeedNormal;
    if (this.frightenedTimer > 0) {
      speedMult = this.levelConfig.pacmanSpeedFrightened;
    }
    const speed = BASE_PIXELS_PER_FRAME * speedMult;
    p.speed = speed;

    // Cornering / Pre-turn buffering:
    // Check if player wants to change direction and if that turn is legal
    if (p.nextDir !== p.dir && p.nextDir !== 'NONE') {
      const canTurn = this.canPacmanTurn(p.nextDir);
      if (canTurn) {
        p.dir = p.nextDir;
        // Align perpendicular axis exactly to tile center for crisp arcade cornering!
        const tileCenter = this.getTileCenter(p.tileX, p.tileY);
        if (p.dir === 'LEFT' || p.dir === 'RIGHT') {
          p.y = tileCenter.y;
        } else {
          p.x = tileCenter.x;
        }
      }
    }

    // Move in current direction if passable
    if (this.canPacmanMove(p.dir)) {
      if (p.dir === 'LEFT') p.x -= speed;
      else if (p.dir === 'RIGHT') p.x += speed;
      else if (p.dir === 'UP') p.y -= speed;
      else if (p.dir === 'DOWN') p.y += speed;

      // Animate mouth
      p.mouthAngle += p.mouthDir * 0.05;
      if (p.mouthAngle >= 0.35 * Math.PI) {
        p.mouthAngle = 0.35 * Math.PI;
        p.mouthDir = -1;
      } else if (p.mouthAngle <= 0.02) {
        p.mouthAngle = 0.02;
        p.mouthDir = 1;
      }
    } else {
      // Stopped against a wall - snap to tile center
      const center = this.getTileCenter(p.tileX, p.tileY);
      if (p.dir === 'LEFT' || p.dir === 'RIGHT') p.x = center.x;
      if (p.dir === 'UP' || p.dir === 'DOWN') p.y = center.y;
    }

    // Tunnel wrap-around
    if (p.x < -8) p.x = CANVAS_WIDTH + 8;
    if (p.x > CANVAS_WIDTH + 8) p.x = -8;

    // Update tile coordinates
    p.tileX = Math.floor(p.x / TILE_SIZE);
    p.tileY = Math.floor((p.y - MAZE_Y_OFFSET) / TILE_SIZE);

    // Check eating dots / energizers
    this.checkEatPellets();
  }

  /**
   * Check if a turn in targetDir is possible from current position
   */
  private canPacmanTurn(targetDir: Direction): boolean {
    const p = this.pacman;
    const tileCenter = this.getTileCenter(p.tileX, p.tileY);
    const distToCenter = Math.hypot(p.x - tileCenter.x, p.y - tileCenter.y);

    // Tolerant turning window (within 5 pixels of tile center)
    if (distToCenter > 5) return false;

    let checkTileX = p.tileX;
    let checkTileY = p.tileY;
    if (targetDir === 'UP') checkTileY -= 1;
    if (targetDir === 'DOWN') checkTileY += 1;
    if (targetDir === 'LEFT') checkTileX -= 1;
    if (targetDir === 'RIGHT') checkTileX += 1;

    // Tunnel is passable
    if (this.activeMaze.tunnelRows.includes(checkTileY) && (checkTileX < 0 || checkTileX >= 28)) return true;

    if (checkTileX < 0 || checkTileX >= MAZE_COLS || checkTileY < 0 || checkTileY >= MAZE_ROWS) {
      return false;
    }

    const tileChar = this.maze[checkTileY][checkTileX];
    return tileChar !== 'W' && tileChar !== '-' && tileChar !== 'G';
  }

  private canPacmanMove(dir: Direction): boolean {
    const p = this.pacman;
    let nextTileX = p.tileX;
    let nextTileY = p.tileY;

    if (dir === 'LEFT') nextTileX -= 1;
    if (dir === 'RIGHT') nextTileX += 1;
    if (dir === 'UP') nextTileY -= 1;
    if (dir === 'DOWN') nextTileY += 1;

    // Tunnel wrap
    if (this.activeMaze.tunnelRows.includes(p.tileY) && (dir === 'LEFT' || dir === 'RIGHT')) {
      return true;
    }

    if (nextTileX < 0 || nextTileX >= MAZE_COLS || nextTileY < 0 || nextTileY >= MAZE_ROWS) {
      return false;
    }

    const tileChar = this.maze[nextTileY][nextTileX];
    if (tileChar === 'W' || tileChar === '-' || tileChar === 'G') {
      const center = this.getTileCenter(p.tileX, p.tileY);
      if (dir === 'LEFT' && p.x <= center.x) return false;
      if (dir === 'RIGHT' && p.x >= center.x) return false;
      if (dir === 'UP' && p.y <= center.y) return false;
      if (dir === 'DOWN' && p.y >= center.y) return false;
    }

    return true;
  }

  private getTileCenter(tileX: number, tileY: number): TileCoord {
    return {
      x: tileX * TILE_SIZE + TILE_SIZE / 2,
      y: tileY * TILE_SIZE + TILE_SIZE / 2 + MAZE_Y_OFFSET
    };
  }

  /**
   * Eating dots and energizers
   */
  private checkEatPellets() {
    const p = this.pacman;
    if (p.tileX < 0 || p.tileX >= MAZE_COLS || p.tileY < 0 || p.tileY >= MAZE_ROWS) {
      return;
    }

    const row = this.maze[p.tileY];
    const char = row[p.tileX];

    if (char === '.' || char === 'o') {
      // Clear pellet
      const rowChars = row.split('');
      rowChars[p.tileX] = ' ';
      this.maze[p.tileY] = rowChars.join('');

      this.dotsRemaining--;
      this.dotsEatenThisLevel++;
      this.dotEatingIdleTimer = 0;

      if (char === '.') {
        // Normal dot (10 pts)
        this.addScore(10);
        retroAudio.playWaka();
      } else {
        // Energizer (50 pts)
        this.addScore(50);
        retroAudio.playWaka();
        haptics.powerPellet();
        this.triggerEnergizer();
      }

      // Check Fruit spawns at 70 and 170 dots eaten
      if (this.dotsEatenThisLevel === 70 || this.dotsEatenThisLevel === 170) {
        this.spawnFruit();
      }

      // Check level clear
      if (this.dotsRemaining <= 0) {
        this.triggerLevelClear();
      }
    }

    // Check Fruit eating
    if (this.fruit.active) {
      const distToFruit = Math.hypot(p.x - this.fruit.x, p.y - this.fruit.y);
      if (distToFruit < 10) {
        this.fruit.active = false;
        this.addScore(this.fruit.points);
        retroAudio.playEatFruit();
        haptics.eatFruit();
        this.addScorePopup(this.fruit.points.toString(), this.fruit.x, this.fruit.y, '#ffb8ff');
      }
    }
  }

  private triggerEnergizer() {
    const duration = this.levelConfig.frightenedDurationSeconds;
    if (duration <= 0) return; // Higher levels have 0 frightened duration!

    this.frightenedTimer = duration * 60;
    this.ghostsEatenCount = 0;

    for (const ghost of this.ghosts) {
      if (ghost.mode !== 'EATEN' && ghost.mode !== 'IN_HOUSE') {
        ghost.mode = 'FRIGHTENED';
        ghost.dir = getOppositeDirection(ghost.dir);
      }
    }
  }

  private spawnFruit() {
    this.fruit.type = this.levelConfig.fruit;
    this.fruit.points = this.levelConfig.fruitPoints;
    this.fruit.active = true;
    this.fruit.timer = 600; // 10 seconds active
  }

  private triggerLevelClear() {
    this.setGameState('LEVEL_CLEAR');
    this.levelClearTimer = 180; // 3 seconds celebration flash
    retroAudio.stopSiren();
    haptics.levelClear();
  }

  /**
   * Update Ghost AI, movement, intersection turns, house exit
   */
  private updateGhosts() {
    this.dotEatingIdleTimer++;
    const blinky = this.ghosts[0];

    for (const ghost of this.ghosts) {
      // House exit management
      if (ghost.mode === 'IN_HOUSE') {
        this.updateGhostInHouse(ghost);
        continue;
      }

      // Determine ghost speed
      let speedMult = this.levelConfig.ghostSpeedNormal;

      // Tunnel slowdown (tiles 0..5 and 22..27 in row 14)
      if (ghost.tileY === 14 && (ghost.tileX <= 5 || ghost.tileX >= 22)) {
        speedMult = this.levelConfig.ghostSpeedTunnel;
      } else if (ghost.mode === 'FRIGHTENED') {
        speedMult = this.levelConfig.ghostSpeedFrightened;
      } else if (ghost.mode === 'EATEN') {
        speedMult = 1.9; // Eyes travel fast
      } else if (ghost.name === 'blinky') {
        // Cruise Elroy speed boosts!
        if (this.dotsRemaining <= this.levelConfig.elroy2Dots) {
          speedMult = this.levelConfig.elroy2Speed;
        } else if (this.dotsRemaining <= this.levelConfig.elroy1Dots) {
          speedMult = this.levelConfig.elroy1Speed;
        }
      }

      const speed = BASE_PIXELS_PER_FRAME * speedMult;
      ghost.speed = speed;

      // Calculate Target Tile according to authentic personality
      ghost.targetTile = calculateGhostTarget(ghost, this.pacman, blinky);

      // Flash state when frightened is running out
      if (ghost.mode === 'FRIGHTENED') {
        ghost.frightenedFlash = this.frightenedTimer <= 150; // Last 2.5 seconds
      } else {
        ghost.frightenedFlash = false;
      }

      // Tunnel wrap-around
      if (ghost.x < -8) {
        ghost.x = CANVAS_WIDTH + 8;
        ghost.tileX = 27;
      } else if (ghost.x > CANVAS_WIDTH + 8) {
        ghost.x = -8;
        ghost.tileX = 0;
      }

      // Current tile center
      const curTileX = Math.floor(ghost.x / TILE_SIZE);
      const curTileY = Math.floor((ghost.y - MAZE_Y_OFFSET) / TILE_SIZE);
      ghost.tileX = curTileX;
      ghost.tileY = curTileY;

      const curCenterX = curTileX * TILE_SIZE + 8;
      const curCenterY = curTileY * TILE_SIZE + 8 + MAZE_Y_OFFSET;

      // Align perpendicular axis to corridor center
      if (ghost.dir === 'LEFT' || ghost.dir === 'RIGHT') {
        ghost.y = curCenterY;
      } else if (ghost.dir === 'UP' || ghost.dir === 'DOWN') {
        ghost.x = curCenterX;
      }

      // Target tile center in the current direction of movement
      let targetCenterX = curCenterX;
      let targetCenterY = curCenterY;

      if (ghost.dir === 'LEFT') {
        targetCenterX = ghost.x > curCenterX ? curCenterX : curCenterX - TILE_SIZE;
      } else if (ghost.dir === 'RIGHT') {
        targetCenterX = ghost.x < curCenterX ? curCenterX : curCenterX + TILE_SIZE;
      } else if (ghost.dir === 'UP') {
        targetCenterY = ghost.y > curCenterY ? curCenterY : curCenterY - TILE_SIZE;
      } else if (ghost.dir === 'DOWN') {
        targetCenterY = ghost.y < curCenterY ? curCenterY : curCenterY + TILE_SIZE;
      }

      // Wall penetration prevention: check if tile directly ahead in current direction is blocked
      let aheadTileX = curTileX;
      let aheadTileY = curTileY;
      if (ghost.dir === 'LEFT') aheadTileX--;
      else if (ghost.dir === 'RIGHT') aheadTileX++;
      else if (ghost.dir === 'UP') aheadTileY--;
      else if (ghost.dir === 'DOWN') aheadTileY++;

      const isAheadPassable = isTilePassableForGhost(
        aheadTileX,
        aheadTileY,
        this.maze,
        ghost.mode,
        ghost.mode === 'EATEN'
      );

      // If blocked by a wall ahead and at/past current tile center, must turn immediately!
      const atOrPastCenter =
        (ghost.dir === 'LEFT' && ghost.x <= curCenterX) ||
        (ghost.dir === 'RIGHT' && ghost.x >= curCenterX) ||
        (ghost.dir === 'UP' && ghost.y <= curCenterY) ||
        (ghost.dir === 'DOWN' && ghost.y >= curCenterY);

      if (!isAheadPassable && atOrPastCenter) {
        ghost.x = curCenterX;
        ghost.y = curCenterY;
        ghost.dir = decideGhostDirection(
          ghost,
          ghost.targetTile,
          this.maze,
          ghost.mode === 'FRIGHTENED'
        );
        continue;
      }

      const dist = Math.hypot(ghost.x - targetCenterX, ghost.y - targetCenterY);

      if (dist <= speed) {
        // Ghost reaches the tile center!
        ghost.x = targetCenterX;
        ghost.y = targetCenterY;
        ghost.tileX = Math.floor(ghost.x / TILE_SIZE);
        ghost.tileY = Math.floor((ghost.y - MAZE_Y_OFFSET) / TILE_SIZE);

        // Check if eyes returned to ghost house
        if (
          ghost.mode === 'EATEN' &&
          (ghost.tileX === 13 || ghost.tileX === 14) &&
          (ghost.tileY === 11 || ghost.tileY === 12 || ghost.tileY === 13)
        ) {
          ghost.mode = 'IN_HOUSE';
          ghost.inHouse = true;
          ghost.x = PINKY_START_POS.x;
          ghost.y = PINKY_START_POS.y;
          ghost.tileX = 13;
          ghost.tileY = 14;
          continue;
        }

        // Decide next direction at intersection
        const nextDir = decideGhostDirection(
          ghost,
          ghost.targetTile,
          this.maze,
          ghost.mode === 'FRIGHTENED'
        );
        ghost.dir = nextDir;

        // Move remaining distance in new direction
        const remaining = speed - dist;
        if (remaining > 0) {
          if (ghost.dir === 'LEFT') ghost.x -= remaining;
          else if (ghost.dir === 'RIGHT') ghost.x += remaining;
          else if (ghost.dir === 'UP') ghost.y -= remaining;
          else if (ghost.dir === 'DOWN') ghost.y += remaining;
        }
      } else {
        // Move towards target in current direction
        if (ghost.dir === 'LEFT') ghost.x -= speed;
        else if (ghost.dir === 'RIGHT') ghost.x += speed;
        else if (ghost.dir === 'UP') ghost.y -= speed;
        else if (ghost.dir === 'DOWN') ghost.y += speed;
      }

      // Update tile coordinates
      ghost.tileX = Math.floor(ghost.x / TILE_SIZE);
      ghost.tileY = Math.floor((ghost.y - MAZE_Y_OFFSET) / TILE_SIZE);
    }
  }

  /**
   * Handle ghosts waiting or moving inside the ghost house
   */
  private updateGhostInHouse(ghost: GhostEntity) {
    // Check if ghost should exit
    let shouldExit = false;

    if (ghost.name === 'pinky') {
      shouldExit = true; // Exits immediately at start
    } else if (this.dotsEatenThisLevel >= ghost.houseExitDotLimit) {
      shouldExit = true;
    } else if (this.dotEatingIdleTimer > 240) {
      // Force exit if player hasn't eaten dots for 4 seconds
      shouldExit = true;
    }

    const doorX = BLINKY_START_POS.x; // 216
    const exitY = BLINKY_START_POS.y; // 232

    if (shouldExit) {
      // Step 1: Center horizontally below the house door
      if (Math.abs(ghost.x - doorX) > 0.8) {
        ghost.dir = ghost.x < doorX ? 'RIGHT' : 'LEFT';
        ghost.x += ghost.x < doorX ? 0.9 : -0.9;
        if (Math.abs(ghost.x - doorX) <= 0.8) {
          ghost.x = doorX;
        }
      } else if (ghost.y > exitY) {
        // Step 2: Rise vertically through door into the corridor
        ghost.x = doorX;
        ghost.dir = 'UP';
        ghost.y -= 1.0;
        if (ghost.y <= exitY) {
          ghost.y = exitY;
          // Step 3: Fully exited! Joins maze chase/scatter
          ghost.mode = this.currentGlobalMode;
          ghost.inHouse = false;
          ghost.dir = 'LEFT';
          ghost.tileX = 13;
          ghost.tileY = 11;
        }
      }
    } else {
      // Bob up and down in place inside pen
      const homeY = PINKY_START_POS.y;
      const minY = homeY - 4;
      const maxY = homeY + 4;
      if (ghost.dir === 'UP') {
        ghost.y -= 0.5;
        if (ghost.y <= minY) ghost.dir = 'DOWN';
      } else {
        ghost.y += 0.5;
        if (ghost.y >= maxY) ghost.dir = 'UP';
      }
    }

    ghost.tileX = Math.floor(ghost.x / TILE_SIZE);
    ghost.tileY = Math.floor((ghost.y - MAZE_Y_OFFSET) / TILE_SIZE);
  }

  /**
   * Collision detection between Pac-Man and Ghosts
   */
  private checkCollisions() {
    const p = this.pacman;

    for (const ghost of this.ghosts) {
      if (ghost.mode === 'IN_HOUSE') continue;

      const dist = Math.hypot(p.x - ghost.x, p.y - ghost.y);

      if (dist < 10) {
        if (ghost.mode === 'FRIGHTENED') {
          // Eat ghost!
          this.ghostsEatenCount++;
          const points = Math.min(1600, 200 * Math.pow(2, this.ghostsEatenCount - 1));
          this.addScore(points);
          this.addScorePopup(points.toString(), ghost.x, ghost.y, '#00ffff');

          ghost.mode = 'EATEN';
          retroAudio.playEatGhost();
          haptics.eatGhost();
          this.pauseTimer = 35; // Brief arcade dramatic freeze
          return;
        } else if (ghost.mode === 'CHASE' || ghost.mode === 'SCATTER') {
          // Pac-Man dies!
          this.setGameState('PACMAN_DYING');
          p.isDead = true;
          p.deathProgress = 0;
          retroAudio.playDeath();
          haptics.death();
          return;
        }
      }
    }
  }

  private addScore(points: number) {
    this.score += points;
    this.events.onScoreChange?.(this.score);

    // Extra life at 10,000 points!
    if (!this.extraLifeAwarded && this.score >= 10000) {
      this.extraLifeAwarded = true;
      this.lives++;
      this.events.onLivesChange?.(this.lives);
      retroAudio.playExtraLife();
      this.addScorePopup('1UP!', this.pacman.x, this.pacman.y - 10, '#ffff00');
    }

    if (this.score > this.highScore) {
      this.highScore = this.score;
      this.events.onHighScoreChange?.(this.highScore);
      if (typeof window !== 'undefined') {
        localStorage.setItem('pacman_high_score', this.highScore.toString());
      }
    }
  }

  private addScorePopup(text: string, x: number, y: number, color: string) {
    this.scorePopups.push({
      id: Math.random().toString(),
      text,
      x,
      y,
      color,
      timer: 50
    });
  }

  public restartGame(difficulty: Difficulty = this.difficulty, startingLevel: number = 1) {
    this.difficulty = difficulty;
    this.score = 0;
    this.lives = 3;
    this.extraLifeAwarded = false;
    this.fruitHistory = ['CHERRY'];
    this.initLevel(startingLevel, true);
  }
}
