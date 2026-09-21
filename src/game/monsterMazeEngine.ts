/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Sinclair ZX81 (1981) 3D Monster Maze Core Game Engine
 */

import { monsterMazeAudio } from './monsterMazeAudio';

export type GameState = 'TITLE' | 'PLAYING' | 'CAUGHT' | 'ESCAPED';

export type Direction = 0 | 1 | 2 | 3; // 0: North, 1: East, 2: South, 3: West

export const DIR_VECTORS: { dx: number; dy: number; name: string }[] = [
  { dx: 0, dy: -1, name: 'NORTH' },
  { dx: 1, dy: 0, name: 'EAST' },
  { dx: 0, dy: 1, name: 'SOUTH' },
  { dx: -1, dy: 0, name: 'WEST' },
];

export const MAZE_SIZE = 16;

export class MonsterMazeEngine {
  public state: GameState = 'TITLE';
  public maze: number[][] = []; // 0 = empty, 1 = wall, 2 = exit
  public playerX = 1;
  public playerY = 1;
  public playerDir: Direction = 1; // Facing East

  public rexX = 14;
  public rexY = 14;
  public rexDir: Direction = 0;
  public rexState: 'WAITING' | 'HUNTING' | 'CHASING' = 'WAITING';
  public rexSeenPlayer = false;
  public rexAnimFrame = 0;

  public exitX = 14;
  public exitY = 1;

  public score = 0;
  public steps = 0;
  public timeElapsed = 0;
  public statusMessage = 'Rex lies in wait.';
  public subMessage = 'Sinclair ZX81 16K (1981)';

  // Timers & Cooldowns
  private rexMoveTimer = 0;
  private rexWaitTimer = 8; // Waits 8s at start
  private rexAnimTimer = 0;
  private stepCooldown = 0;

  // Cheats / Trainer
  public cheatRadar = false;
  public cheatFreezeRex = false;
  public cheatSuperSpeed = false;
  public cheatExitGuide = false;

  private listeners: (() => void)[] = [];

  constructor() {
    this.initMaze();
  }

  public subscribe(fn: () => void) {
    this.listeners.push(fn);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== fn);
    };
  }

  private notify() {
    this.listeners.forEach((fn) => fn());
  }

  public startGame() {
    this.initMaze();
    this.state = 'PLAYING';
    this.score = 0;
    this.steps = 0;
    this.timeElapsed = 0;
    this.rexState = 'WAITING';
    this.rexWaitTimer = 6;
    this.rexSeenPlayer = false;
    this.statusMessage = 'Rex lies in wait.';
    this.subMessage = 'Find the exit before Rex finds you!';
    monsterMazeAudio.updateTension(12, false);
    this.notify();
  }

  public initMaze() {
    // Generate 16x16 grid
    this.maze = Array.from({ length: MAZE_SIZE }, () =>
      Array.from({ length: MAZE_SIZE }, () => 1)
    );

    // Recursive Backtracking / Depth First Maze Generation
    const carve = (cx: number, cy: number) => {
      this.maze[cy][cx] = 0;

      const directions = [
        [0, -2],
        [2, 0],
        [0, 2],
        [-2, 0],
      ].sort(() => Math.random() - 0.5);

      for (const [dx, dy] of directions) {
        const nx = cx + dx;
        const ny = cy + dy;

        if (nx > 0 && nx < MAZE_SIZE - 1 && ny > 0 && ny < MAZE_SIZE - 1 && this.maze[ny][nx] === 1) {
          this.maze[cy + dy / 2][cx + dx / 2] = 0;
          carve(nx, ny);
        }
      }
    };

    carve(1, 1);

    // Add extra connections to create loops and evasion routes
    for (let y = 2; y < MAZE_SIZE - 2; y += 2) {
      for (let x = 2; x < MAZE_SIZE - 2; x += 2) {
        if (Math.random() < 0.35) {
          this.maze[y][x] = 0;
        }
      }
    }

    // Player start
    this.playerX = 1;
    this.playerY = 1;
    this.playerDir = 1;

    // Exit position (far corner)
    this.exitX = MAZE_SIZE - 2;
    this.exitY = 1;
    this.maze[this.exitY][this.exitX] = 2; // 2 = exit tile

    // Rex start (far away)
    this.rexX = MAZE_SIZE - 2;
    this.rexY = MAZE_SIZE - 2;
    this.maze[this.rexY][this.rexX] = 0;
    this.rexDir = 0;
  }

  public update(dt: number) {
    if (this.state !== 'PLAYING') return;

    this.timeElapsed += dt;
    this.rexAnimTimer += dt;
    if (this.rexAnimTimer > 0.25) {
      this.rexAnimTimer = 0;
      this.rexAnimFrame = (this.rexAnimFrame + 1) % 4;
    }

    if (this.stepCooldown > 0) {
      this.stepCooldown -= dt;
    }

    // Rex Logic
    if (!this.cheatFreezeRex) {
      if (this.rexState === 'WAITING') {
        this.rexWaitTimer -= dt;
        if (this.rexWaitTimer <= 0) {
          this.rexState = 'HUNTING';
          this.statusMessage = 'Footsteps approaching.';
        }
      } else {
        const moveInterval = this.rexSeenPlayer ? 0.45 : 0.75;
        this.rexMoveTimer += dt;

        if (this.rexMoveTimer >= moveInterval) {
          this.rexMoveTimer = 0;
          this.updateRexAI();
        }
      }
    }

    // Check line of sight
    this.checkLineOfSight();

    // Calculate distance
    const dist = Math.abs(this.playerX - this.rexX) + Math.abs(this.playerY - this.rexY);

    // Audio tension & messages
    monsterMazeAudio.updateTension(dist, this.rexSeenPlayer);

    if (this.rexX === this.playerX && this.rexY === this.playerY) {
      this.state = 'CAUGHT';
      this.statusMessage = 'Rex has caught you! (GAME OVER)';
      this.subMessage = `Survived ${this.steps} steps in ${Math.floor(this.timeElapsed)}s`;
      monsterMazeAudio.playCaught();
      this.notify();
      return;
    }

    if (this.playerX === this.exitX && this.playerY === this.exitY) {
      this.state = 'ESCAPED';
      this.score += 1000 + Math.max(0, 500 - this.steps * 5);
      this.statusMessage = 'YOU HAVE ESCAPED THE MAZE!';
      this.subMessage = `Victory! Total Score: ${this.score} pts`;
      monsterMazeAudio.playEscape();
      this.notify();
      return;
    }

    // Update status message
    if (this.rexSeenPlayer) {
      this.statusMessage = 'REX HAS SEEN YOU! RUN!!';
    } else if (dist <= 3) {
      this.statusMessage = 'Rex is hunting for you.';
    } else if (dist <= 6 && this.rexState === 'HUNTING') {
      this.statusMessage = 'Footsteps approaching.';
    } else if (this.rexState === 'WAITING') {
      this.statusMessage = 'Rex lies in wait.';
    } else {
      this.statusMessage = 'Rex is wandering the maze.';
    }
  }

  private checkLineOfSight() {
    // Check if player and Rex share X or Y axis and have direct open corridor between them
    let hasLOS = false;

    if (this.playerX === this.rexX) {
      const minY = Math.min(this.playerY, this.rexY);
      const maxY = Math.max(this.playerY, this.rexY);
      let blocked = false;
      for (let y = minY + 1; y < maxY; y++) {
        if (this.maze[y][this.playerX] === 1) {
          blocked = true;
          break;
        }
      }
      if (!blocked && maxY - minY <= 6) {
        hasLOS = true;
      }
    } else if (this.playerY === this.rexY) {
      const minX = Math.min(this.playerX, this.rexX);
      const maxX = Math.max(this.playerX, this.rexX);
      let blocked = false;
      for (let x = minX + 1; x < maxX; x++) {
        if (this.maze[this.playerY][x] === 1) {
          blocked = true;
          break;
        }
      }
      if (!blocked && maxX - minX <= 6) {
        hasLOS = true;
      }
    }

    if (hasLOS) {
      if (!this.rexSeenPlayer) {
        monsterMazeAudio.playRexRoar();
      }
      this.rexSeenPlayer = true;
      this.rexState = 'CHASING';
    } else if (Math.abs(this.playerX - this.rexX) + Math.abs(this.playerY - this.rexY) > 8) {
      this.rexSeenPlayer = false;
      this.rexState = 'HUNTING';
    }
  }

  private updateRexAI() {
    const dist = Math.abs(this.playerX - this.rexX) + Math.abs(this.playerY - this.rexY);
    monsterMazeAudio.playRexStep(dist);

    // BFS Pathfinding towards player if chasing, otherwise smart wander
    if (this.rexSeenPlayer || this.rexState === 'CHASING') {
      const nextStep = this.findPath(this.rexX, this.rexY, this.playerX, this.playerY);
      if (nextStep) {
        // Set Rex direction
        if (nextStep.x > this.rexX) this.rexDir = 1;
        else if (nextStep.x < this.rexX) this.rexDir = 3;
        else if (nextStep.y > this.rexY) this.rexDir = 2;
        else if (nextStep.y < this.rexY) this.rexDir = 0;

        this.rexX = nextStep.x;
        this.rexY = nextStep.y;
        return;
      }
    }

    // Wandering logic: continue in current direction if open, else pick random available turn
    const forwardVec = DIR_VECTORS[this.rexDir];
    const fx = this.rexX + forwardVec.dx;
    const fy = this.rexY + forwardVec.dy;

    const possibleMoves: { x: number; y: number; dir: Direction }[] = [];
    DIR_VECTORS.forEach((vec, d) => {
      const nx = this.rexX + vec.dx;
      const ny = this.rexY + vec.dy;
      if (nx >= 0 && nx < MAZE_SIZE && ny >= 0 && ny < MAZE_SIZE && this.maze[ny][nx] !== 1) {
        // Don't immediately reverse unless dead end
        if ((d + 2) % 4 !== this.rexDir || possibleMoves.length === 0) {
          possibleMoves.push({ x: nx, y: ny, dir: d as Direction });
        }
      }
    });

    if (possibleMoves.length > 0) {
      // 70% chance to keep going straight if valid
      const straight = possibleMoves.find((m) => m.dir === this.rexDir);
      if (straight && Math.random() < 0.7) {
        this.rexX = straight.x;
        this.rexY = straight.y;
      } else {
        const choice = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
        this.rexX = choice.x;
        this.rexY = choice.y;
        this.rexDir = choice.dir;
      }
    }
  }

  private findPath(startX: number, startY: number, targetX: number, targetY: number): { x: number; y: number } | null {
    const queue: { x: number; y: number; path: { x: number; y: number }[] }[] = [
      { x: startX, y: startY, path: [] },
    ];
    const visited = new Set<string>();
    visited.add(`${startX},${startY}`);

    while (queue.length > 0) {
      const curr = queue.shift()!;
      if (curr.x === targetX && curr.y === targetY) {
        return curr.path.length > 0 ? curr.path[0] : null;
      }

      for (const vec of DIR_VECTORS) {
        const nx = curr.x + vec.dx;
        const ny = curr.y + vec.dy;
        const key = `${nx},${ny}`;

        if (
          nx >= 0 &&
          nx < MAZE_SIZE &&
          ny >= 0 &&
          ny < MAZE_SIZE &&
          this.maze[ny][nx] !== 1 &&
          !visited.has(key)
        ) {
          visited.add(key);
          queue.push({
            x: nx,
            y: ny,
            path: [...curr.path, { x: nx, y: ny }],
          });
        }
      }
    }

    return null;
  }

  // User Actions
  public turnLeft() {
    if (this.state !== 'PLAYING') return;
    this.playerDir = ((this.playerDir + 3) % 4) as Direction;
    monsterMazeAudio.playTurn();
    this.notify();
  }

  public turnRight() {
    if (this.state !== 'PLAYING') return;
    this.playerDir = ((this.playerDir + 1) % 4) as Direction;
    monsterMazeAudio.playTurn();
    this.notify();
  }

  public lookBehind() {
    if (this.state !== 'PLAYING') return;
    this.playerDir = ((this.playerDir + 2) % 4) as Direction;
    monsterMazeAudio.playTurn();
    this.notify();
  }

  public stepForward() {
    if (this.state !== 'PLAYING') return;
    if (this.stepCooldown > 0 && !this.cheatSuperSpeed) return;

    const vec = DIR_VECTORS[this.playerDir];
    const nx = this.playerX + vec.dx;
    const ny = this.playerY + vec.dy;

    if (nx >= 0 && nx < MAZE_SIZE && ny >= 0 && ny < MAZE_SIZE && this.maze[ny][nx] !== 1) {
      this.playerX = nx;
      this.playerY = ny;
      this.steps++;
      this.score += 10;
      this.stepCooldown = 0.12;
      monsterMazeAudio.playStep();
      this.notify();
    }
  }

  public stepBackward() {
    if (this.state !== 'PLAYING') return;
    if (this.stepCooldown > 0 && !this.cheatSuperSpeed) return;

    const backDir = (this.playerDir + 2) % 4;
    const vec = DIR_VECTORS[backDir];
    const nx = this.playerX + vec.dx;
    const ny = this.playerY + vec.dy;

    if (nx >= 0 && nx < MAZE_SIZE && ny >= 0 && ny < MAZE_SIZE && this.maze[ny][nx] !== 1) {
      this.playerX = nx;
      this.playerY = ny;
      this.steps++;
      this.score += 5;
      this.stepCooldown = 0.15;
      monsterMazeAudio.playStep();
      this.notify();
    }
  }
}
