/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Nokia Snake (1997 / Nokia 6110 / 3310) - Game Engine
 */

import { nokiaSnakeAudio } from './nokiaSnakeAudio';
import { saveNokiaSnakeScore } from './nokiaSnakeHighScores';

export type SnakeDirection = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
export type SnakeState = 'MENU' | 'PLAYING' | 'PAUSED' | 'GAME_OVER';
export type MazeType = 'classic' | 'box' | 'tunnel' | 'rails';

export interface SnakePoint {
  x: number;
  y: number;
}

export class NokiaSnakeEngine {
  // 84x48 authentic LCD virtual pixel buffer
  public readonly lcdWidth = 84;
  public readonly lcdHeight = 48;

  // Playfield dimensions (in grid cells)
  // Top 8 pixels for status bar (signal, battery, score)
  // Board: x from 2 to 81 (80px wide), y from 10 to 45 (36px high)
  // With 2x2 pixel blocks:
  public readonly gridCols = 38; // 38 * 2 = 76px
  public readonly gridRows = 17; // 17 * 2 = 34px
  public readonly originX = 4;
  public readonly originY = 11;
  public readonly cellSize = 2;

  public state: SnakeState = 'MENU';
  public menuIndex: number = 0; // 0: New Game, 1: Level, 2: Mazes, 3: High Scores
  public speedLevel: number = 1; // 1 to 9 (Defaults to calm, accessible Level 1)
  public selectedMaze: MazeType = 'classic';

  public snake: SnakePoint[] = [];
  public dir: SnakeDirection = 'RIGHT';
  public nextDir: SnakeDirection = 'RIGHT';
  public food: SnakePoint = { x: 15, y: 8 };
  public bonusFood: SnakePoint | null = null;
  public bonusTimer: number = 0;

  public score: number = 0;
  public highScore: number = 384;
  public walls: SnakePoint[] = [];

  private tickTimer: number = 0;
  private animTick: number = 0;
  private lastStepTimestamp: number = 0;

  // Signal & Battery strength bars (0-4)
  public signalBars: number = 4;
  public batteryBars: number = 4;

  constructor() {
    this.initGame();
  }

  public initGame() {
    this.snake = [
      { x: 10, y: 8 },
      { x: 9, y: 8 },
      { x: 8, y: 8 },
      { x: 7, y: 8 }
    ];
    this.dir = 'RIGHT';
    this.nextDir = 'RIGHT';
    this.score = 0;
    this.bonusFood = null;
    this.bonusTimer = 0;
    this.buildMaze(this.selectedMaze);
    this.spawnFood();
  }

  public startGame() {
    this.initGame();
    this.state = 'PLAYING';
    this.lastStepTimestamp = typeof performance !== 'undefined' ? performance.now() : Date.now();
    nokiaSnakeAudio.playKeyClick();
  }

  public togglePause() {
    if (this.state === 'PLAYING') {
      this.state = 'PAUSED';
      nokiaSnakeAudio.playKeyClick();
    } else if (this.state === 'PAUSED') {
      this.state = 'PLAYING';
      this.lastStepTimestamp = typeof performance !== 'undefined' ? performance.now() : Date.now();
      nokiaSnakeAudio.playKeyClick();
    }
  }

  public setDirection(newDir: SnakeDirection) {
    if (this.state !== 'PLAYING') return;

    // Disallow 180-degree immediate reversal
    if (newDir === 'UP' && this.dir === 'DOWN') return;
    if (newDir === 'DOWN' && this.dir === 'UP') return;
    if (newDir === 'LEFT' && this.dir === 'RIGHT') return;
    if (newDir === 'RIGHT' && this.dir === 'LEFT') return;

    if (this.nextDir !== newDir) {
      this.nextDir = newDir;
      nokiaSnakeAudio.playTurn();
    }
  }

  public buildMaze(type: MazeType) {
    this.walls = [];
    if (type === 'classic') {
      // Open field, no internal walls
      return;
    }

    if (type === 'box') {
      // 4 corner blocks
      for (let i = 5; i < 12; i++) {
        this.walls.push({ x: i, y: 4 });
        this.walls.push({ x: this.gridCols - 1 - i, y: 4 });
        this.walls.push({ x: i, y: this.gridRows - 5 });
        this.walls.push({ x: this.gridCols - 1 - i, y: this.gridRows - 5 });
      }
    } else if (type === 'tunnel') {
      // Central horizontal dividers
      for (let x = 8; x < this.gridCols - 8; x++) {
        this.walls.push({ x, y: 5 });
        this.walls.push({ x, y: 11 });
      }
    } else if (type === 'rails') {
      // Vertical pillars
      for (let y = 3; y < this.gridRows - 3; y++) {
        this.walls.push({ x: 12, y });
        this.walls.push({ x: 25, y });
      }
    }
  }

  public spawnFood() {
    let valid = false;
    let attempts = 0;
    while (!valid && attempts < 200) {
      attempts++;
      const fx = Math.floor(Math.random() * this.gridCols);
      const fy = Math.floor(Math.random() * this.gridRows);

      const inSnake = this.snake.some(s => s.x === fx && s.y === fy);
      const inWall = this.walls.some(w => w.x === fx && w.y === fy);

      if (!inSnake && !inWall) {
        this.food = { x: fx, y: fy };
        valid = true;
      }
    }
  }

  public spawnBonusFood() {
    let valid = false;
    let attempts = 0;
    while (!valid && attempts < 100) {
      attempts++;
      const fx = Math.floor(Math.random() * this.gridCols);
      const fy = Math.floor(Math.random() * this.gridRows);

      const inSnake = this.snake.some(s => s.x === fx && s.y === fy);
      const inWall = this.walls.some(w => w.x === fx && w.y === fy);
      const inFood = this.food.x === fx && this.food.y === fy;

      if (!inSnake && !inWall && !inFood) {
        this.bonusFood = { x: fx, y: fy };
        this.bonusTimer = 120; // Blinks and expires in 120 ticks
        valid = true;
      }
    }
  }

  public update(timestamp: number = typeof performance !== 'undefined' ? performance.now() : Date.now()): void {
    this.animTick++;

    if (this.state !== 'PLAYING') {
      this.lastStepTimestamp = timestamp;
      return;
    }

    // Movement speed interval in milliseconds based on speed level (1 to 9)
    // Calibrated for authentic Nokia 6110 pacing:
    // Level 1: 420ms (~2.4 moves/sec) - very calm, beginner-friendly & authentic
    // Level 2: 350ms (~2.8 moves/sec)
    // Level 3: 290ms (~3.4 moves/sec)
    // Level 4: 230ms (~4.3 moves/sec)
    // Level 5: 180ms (~5.5 moves/sec)
    // Level 6: 140ms (~7.1 moves/sec)
    // Level 7: 105ms (~9.5 moves/sec)
    // Level 8: 75ms (~13.3 moves/sec)
    // Level 9: 55ms (~18.2 moves/sec)
    const speedIntervalsMs = [420, 350, 290, 230, 180, 140, 105, 75, 55];
    const targetIntervalMs = speedIntervalsMs[Math.min(8, Math.max(0, this.speedLevel - 1))];

    if (timestamp - this.lastStepTimestamp < targetIntervalMs) {
      return;
    }
    this.lastStepTimestamp = timestamp;

    this.dir = this.nextDir;

    // Calculate new head position
    const head = this.snake[0];
    let newHeadX = head.x;
    let newHeadY = head.y;

    switch (this.dir) {
      case 'UP': newHeadY--; break;
      case 'DOWN': newHeadY++; break;
      case 'LEFT': newHeadX--; break;
      case 'RIGHT': newHeadX++; break;
    }

    // Wall collision check (Border walls)
    if (newHeadX < 0 || newHeadX >= this.gridCols || newHeadY < 0 || newHeadY >= this.gridRows) {
      this.gameOver();
      return;
    }

    // Obstacle walls check
    if (this.walls.some(w => w.x === newHeadX && w.y === newHeadY)) {
      this.gameOver();
      return;
    }

    // Self collision check
    if (this.snake.some(s => s.x === newHeadX && s.y === newHeadY)) {
      this.gameOver();
      return;
    }

    const newHead: SnakePoint = { x: newHeadX, y: newHeadY };
    this.snake.unshift(newHead);

    // Food collision
    if (newHeadX === this.food.x && newHeadY === this.food.y) {
      this.score += this.speedLevel * 5;
      if (this.score > this.highScore) {
        this.highScore = this.score;
      }
      nokiaSnakeAudio.playDotEat();
      this.spawnFood();

      // 20% chance to spawn bonus food if none active
      if (!this.bonusFood && Math.random() < 0.25) {
        this.spawnBonusFood();
      }
    } else if (this.bonusFood && newHeadX === this.bonusFood.x && newHeadY === this.bonusFood.y) {
      // Ate bonus insect / egg
      this.score += this.speedLevel * 25;
      if (this.score > this.highScore) {
        this.highScore = this.score;
      }
      nokiaSnakeAudio.playDotEat();
      this.bonusFood = null;
    } else {
      // Regular step without eating: remove tail
      this.snake.pop();
    }

    // Bonus food timer countdown
    if (this.bonusFood) {
      this.bonusTimer--;
      if (this.bonusTimer <= 0) {
        this.bonusFood = null;
      }
    }
  }

  private gameOver() {
    this.state = 'GAME_OVER';
    nokiaSnakeAudio.playCrash();
    saveNokiaSnakeScore({
      initials: 'NOK',
      score: this.score,
      speed: this.speedLevel,
      maze: this.selectedMaze,
      date: new Date().toISOString().split('T')[0]
    });
  }

  // Keypad navigation helpers
  public navUp() {
    nokiaSnakeAudio.playKeyClick();
    if (this.state === 'PLAYING') {
      this.setDirection('UP');
    } else if (this.state === 'MENU') {
      this.menuIndex = (this.menuIndex - 1 + 4) % 4;
    }
  }

  public navDown() {
    nokiaSnakeAudio.playKeyClick();
    if (this.state === 'PLAYING') {
      this.setDirection('DOWN');
    } else if (this.state === 'MENU') {
      this.menuIndex = (this.menuIndex + 1) % 4;
    }
  }

  public navLeft() {
    nokiaSnakeAudio.playKeyClick();
    if (this.state === 'PLAYING') {
      this.setDirection('LEFT');
    } else if (this.state === 'MENU' && this.menuIndex === 1) {
      // Cycle speed down
      this.speedLevel = Math.max(1, this.speedLevel - 1);
    } else if (this.state === 'MENU' && this.menuIndex === 2) {
      // Cycle maze
      const mazes: MazeType[] = ['classic', 'box', 'tunnel', 'rails'];
      const idx = mazes.indexOf(this.selectedMaze);
      this.selectedMaze = mazes[(idx - 1 + mazes.length) % mazes.length];
    }
  }

  public navRight() {
    nokiaSnakeAudio.playKeyClick();
    if (this.state === 'PLAYING') {
      this.setDirection('RIGHT');
    } else if (this.state === 'MENU' && this.menuIndex === 1) {
      // Cycle speed up
      this.speedLevel = Math.min(9, this.speedLevel + 1);
    } else if (this.state === 'MENU' && this.menuIndex === 2) {
      const mazes: MazeType[] = ['classic', 'box', 'tunnel', 'rails'];
      const idx = mazes.indexOf(this.selectedMaze);
      this.selectedMaze = mazes[(idx + 1) % mazes.length];
    }
  }

  public pressNaviKey() {
    nokiaSnakeAudio.playKeyClick();
    if (this.state === 'MENU') {
      if (this.menuIndex === 0) {
        this.startGame();
      } else if (this.menuIndex === 1) {
        this.speedLevel = (this.speedLevel % 9) + 1;
      } else if (this.menuIndex === 2) {
        const mazes: MazeType[] = ['classic', 'box', 'tunnel', 'rails'];
        const idx = mazes.indexOf(this.selectedMaze);
        this.selectedMaze = mazes[(idx + 1) % mazes.length];
      } else {
        this.startGame();
      }
    } else if (this.state === 'GAME_OVER') {
      this.state = 'MENU';
    } else if (this.state === 'PAUSED') {
      this.state = 'PLAYING';
    }
  }

  public pressClearKey() {
    nokiaSnakeAudio.playKeyClick();
    if (this.state === 'PLAYING') {
      this.state = 'PAUSED';
    } else if (this.state === 'PAUSED' || this.state === 'GAME_OVER') {
      this.state = 'MENU';
    }
  }

  public getAnimTick(): number {
    return this.animTick;
  }
}
