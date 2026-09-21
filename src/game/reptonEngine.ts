import { Direction, MonsterEntity, Position, ReptonGameState, TileType } from './reptonTypes';
import { REPTON_LEVELS } from './reptonLevels';
import { reptonAudio } from './reptonAudio';

export class ReptonEngine {
  private state: ReptonGameState;
  private gravityTimer: number = 0;
  private monsterTimer: number = 0;
  private secondTimer: number = 0;
  private animTimer: number = 0;
  private onGameOverCb?: (score: number) => void;
  private onLevelWinCb?: (levelIndex: number, score: number) => void;

  constructor(
    levelIndex: number = 0,
    initialLives: number = 3,
    initialScore: number = 0
  ) {
    this.state = this.initLevel(levelIndex, initialLives, initialScore);
  }

  public getState(): ReptonGameState {
    return this.state;
  }

  public setCallbacks(
    onGameOver?: (score: number) => void,
    onLevelWin?: (levelIndex: number, score: number) => void
  ) {
    this.onGameOverCb = onGameOver;
    this.onLevelWinCb = onLevelWin;
  }

  public resetCurrentLevel(): void {
    const lives = this.state.lives;
    const score = this.state.score;
    const levelIndex = this.state.levelIndex;
    this.state = this.initLevel(levelIndex, lives, score);
  }

  public loadLevel(levelIndex: number): void {
    const lives = this.state.lives;
    const score = this.state.score;
    const clampedIndex = Math.max(0, Math.min(levelIndex, REPTON_LEVELS.length - 1));
    this.state = this.initLevel(clampedIndex, lives, score);
  }

  private initLevel(levelIndex: number, lives: number, score: number): ReptonGameState {
    const level = REPTON_LEVELS[levelIndex] || REPTON_LEVELS[0];
    const grid: TileType[][] = [];
    let reptonPos: Position = { x: 1, y: 1 };
    let diamondsCount = 0;
    let safesCount = 0;
    const monsters: MonsterEntity[] = [];
    let monsterIdCounter = 1;

    for (let y = 0; y < level.height; y++) {
      const row: TileType[] = [];
      const line = level.map[y] || '';
      for (let x = 0; x < level.width; x++) {
        const char = line[x] || '#';
        switch (char) {
          case 'R':
            reptonPos = { x, y };
            row.push('empty');
            break;
          case '.':
            row.push('earth');
            break;
          case 'O':
            row.push('boulder');
            break;
          case '*':
            row.push('diamond');
            diamondsCount++;
            break;
          case 'E':
            row.push('egg');
            break;
          case 'M':
            row.push('empty');
            monsters.push({
              id: monsterIdCounter++,
              x,
              y,
              direction: 'right',
              animFrame: 0,
              moveTimer: 0
            });
            break;
          case 'K':
            row.push('key');
            break;
          case 'S':
            row.push('safe');
            safesCount++;
            break;
          case 'T':
            row.push('transporter');
            break;
          case ' ':
            row.push('empty');
            break;
          case '#':
          default:
            row.push('wall');
            break;
        }
      }
      grid.push(row);
    }

    return {
      levelIndex,
      grid,
      width: level.width,
      height: level.height,
      reptonPos: { ...reptonPos },
      reptonVisualPos: { x: reptonPos.x, y: reptonPos.y },
      reptonDir: 'right',
      reptonMoving: false,
      reptonAnimFrame: 0,
      score,
      lives,
      diamondsRemaining: diamondsCount,
      totalDiamonds: diamondsCount,
      timeLeft: level.timeLimit,
      hasKey: false,
      safesCount,
      monsters,
      fallingBoulders: new Map(),
      isGameOver: false,
      isLevelComplete: false,
      isPaused: false
    };
  }

  // Handle player directional movement command
  public moveRepton(dir: Direction): boolean {
    if (this.state.isGameOver || this.state.isLevelComplete || this.state.isPaused) {
      return false;
    }
    if (dir === 'none') return false;

    this.state.reptonDir = dir;
    let dx = 0;
    let dy = 0;
    if (dir === 'left') dx = -1;
    if (dir === 'right') dx = 1;
    if (dir === 'up') dy = -1;
    if (dir === 'down') dy = 1;

    const current = this.state.reptonPos;
    const targetX = current.x + dx;
    const targetY = current.y + dy;

    // Out of bounds check
    if (targetX < 0 || targetX >= this.state.width || targetY < 0 || targetY >= this.state.height) {
      return false;
    }

    const targetTile = this.state.grid[targetY][targetX];

    // 1. Digging Earth
    if (targetTile === 'earth') {
      this.state.grid[targetY][targetX] = 'empty';
      this.state.reptonPos = { x: targetX, y: targetY };
      this.state.reptonMoving = true;
      this.state.reptonAnimFrame = (this.state.reptonAnimFrame + 1) % 4;
      this.state.score += 1;
      reptonAudio.playDig();
      this.checkMonsterCollision();
      return true;
    }

    // 2. Empty Space
    if (targetTile === 'empty') {
      this.state.reptonPos = { x: targetX, y: targetY };
      this.state.reptonMoving = true;
      this.state.reptonAnimFrame = (this.state.reptonAnimFrame + 1) % 4;
      this.checkMonsterCollision();
      return true;
    }

    // 3. Collecting Diamond
    if (targetTile === 'diamond') {
      this.state.grid[targetY][targetX] = 'empty';
      this.state.reptonPos = { x: targetX, y: targetY };
      this.state.reptonMoving = true;
      this.state.reptonAnimFrame = (this.state.reptonAnimFrame + 1) % 4;
      this.state.score += 5;
      this.state.diamondsRemaining = Math.max(0, this.state.diamondsRemaining - 1);
      reptonAudio.playDiamond();
      this.checkLevelCompletion();
      this.checkMonsterCollision();
      return true;
    }

    // 4. Collecting Key -> unlocks all Safes!
    if (targetTile === 'key') {
      this.state.grid[targetY][targetX] = 'empty';
      this.state.reptonPos = { x: targetX, y: targetY };
      this.state.reptonMoving = true;
      this.state.hasKey = true;
      this.state.score += 50;
      reptonAudio.playKey();

      // Transform all safes into diamonds!
      let unlocked = 0;
      for (let y = 0; y < this.state.height; y++) {
        for (let x = 0; x < this.state.width; x++) {
          if (this.state.grid[y][x] === 'safe') {
            this.state.grid[y][x] = 'diamond';
            this.state.diamondsRemaining++;
            unlocked++;
          }
        }
      }
      this.state.safesCount = 0;
      return true;
    }

    // 5. Pushing Boulder (Horizontal ONLY)
    if (targetTile === 'boulder' && (dir === 'left' || dir === 'right')) {
      const pushX = targetX + dx;
      const pushY = targetY;
      if (
        pushX >= 0 &&
        pushX < this.state.width &&
        this.state.grid[pushY][pushX] === 'empty'
      ) {
        // Shift boulder
        this.state.grid[pushY][pushX] = 'boulder';
        this.state.grid[targetY][targetX] = 'empty';
        this.state.reptonPos = { x: targetX, y: targetY };
        this.state.reptonMoving = true;
        this.state.reptonAnimFrame = (this.state.reptonAnimFrame + 1) % 4;
        reptonAudio.playRoll();
        return true;
      }
    }

    // 6. Stepping into Transporter
    if (targetTile === 'transporter') {
      // Find other transporter
      const allTransporters: Position[] = [];
      for (let y = 0; y < this.state.height; y++) {
        for (let x = 0; x < this.state.width; x++) {
          if (this.state.grid[y][x] === 'transporter' && (x !== targetX || y !== targetY)) {
            allTransporters.push({ x, y });
          }
        }
      }

      if (allTransporters.length > 0) {
        const dest = allTransporters[0];
        // Find adjacent empty tile next to dest transporter
        const candidates = [
          { x: dest.x + 1, y: dest.y },
          { x: dest.x - 1, y: dest.y },
          { x: dest.x, y: dest.y + 1 },
          { x: dest.x, y: dest.y - 1 }
        ].filter(p => p.x >= 0 && p.x < this.state.width && p.y >= 0 && p.y < this.state.height);

        const emptyCandidate = candidates.find(c => this.state.grid[c.y][c.x] === 'empty');
        if (emptyCandidate) {
          this.state.reptonPos = { ...emptyCandidate };
          reptonAudio.playTeleport();
          return true;
        }
      }
    }

    // Walls, eggs, safes without keys, or vertically blocked boulders cannot be walked through
    return false;
  }

  // Update loop called every frame (dt in ms)
  public update(dt: number) {
    if (this.state.isGameOver || this.state.isLevelComplete || this.state.isPaused) {
      return;
    }

    // Smooth visual position interpolation toward target grid pos
    const lerpSpeed = Math.min(1, dt * 0.018);
    this.state.reptonVisualPos.x += (this.state.reptonPos.x - this.state.reptonVisualPos.x) * lerpSpeed;
    this.state.reptonVisualPos.y += (this.state.reptonPos.y - this.state.reptonVisualPos.y) * lerpSpeed;

    // 1. Countdown timer (every 1000ms)
    this.secondTimer += dt;
    if (this.secondTimer >= 1000) {
      this.secondTimer -= 1000;
      this.state.timeLeft = Math.max(0, this.state.timeLeft - 1);
      if (this.state.timeLeft <= 15 && this.state.timeLeft > 0) {
        reptonAudio.playTick();
      }
      if (this.state.timeLeft === 0) {
        this.handlePlayerDeath('time');
        return;
      }
    }

    // 2. Gravity & Boulder simulation (runs every ~140ms for authentic BBC Micro feel)
    this.gravityTimer += dt;
    if (this.gravityTimer >= 130) {
      this.gravityTimer = 0;
      this.simulateGravity();
    }

    // 3. Monster movement & AI (runs every ~260ms)
    this.monsterTimer += dt;
    if (this.monsterTimer >= 260) {
      this.monsterTimer = 0;
      this.simulateMonsters();
    }

    // 4. Check if monster hit Repton
    this.checkMonsterCollision();
  }

  private simulateGravity() {
    const grid = this.state.grid;
    const width = this.state.width;
    const height = this.state.height;
    const reptonPos = this.state.reptonPos;

    // Scan from bottom to top so cascades tumble downwards correctly
    for (let y = height - 2; y >= 0; y--) {
      for (let x = 0; x < width; x++) {
        if (grid[y][x] === 'boulder') {
          const belowTile = grid[y + 1][x];
          const belowPos = { x, y: y + 1 };

          // Case A: Tile directly below is empty -> Fall!
          if (belowTile === 'empty') {
            // Check if Repton is right below
            if (reptonPos.x === belowPos.x && reptonPos.y === belowPos.y) {
              // Repton is crushed!
              this.handlePlayerDeath('crushed');
              return;
            }

            // Check if falling onto a monster
            const monsterHitIndex = this.state.monsters.findIndex(
              m => m.x === belowPos.x && m.y === belowPos.y
            );
            if (monsterHitIndex !== -1) {
              // Squash monster into diamond!
              this.state.monsters.splice(monsterHitIndex, 1);
              grid[y][x] = 'empty';
              grid[y + 1][x] = 'diamond';
              this.state.diamondsRemaining++;
              this.state.score += 25;
              reptonAudio.playMonsterSquash();
              continue;
            }

            // Move boulder down
            grid[y][x] = 'empty';
            grid[y + 1][x] = 'boulder';
            this.state.fallingBoulders.set(`${x},${y + 1}`, { fallSpeed: 1, falling: true });
            continue;
          }

          // Case B: Falling onto an Egg -> Egg Cracks & Spawns Monster!
          if (belowTile === 'egg') {
            grid[y][x] = 'empty';
            grid[y + 1][x] = 'boulder';
            reptonAudio.playEggCrack();
            // Spawn monster adjacent or in empty cell
            this.state.monsters.push({
              id: Date.now() + Math.random(),
              x,
              y: Math.max(0, y - 1),
              direction: 'left',
              animFrame: 0,
              moveTimer: 0
            });
            continue;
          }

          // Case C: Rolling off another Boulder or Diamond (Authentic Repton physics)
          if (belowTile === 'boulder' || belowTile === 'diamond') {
            // Can roll Left? (left must be empty AND left-below must be empty)
            const canRollLeft =
              x > 0 &&
              grid[y][x - 1] === 'empty' &&
              grid[y + 1][x - 1] === 'empty' &&
              !(reptonPos.x === x - 1 && (reptonPos.y === y || reptonPos.y === y + 1));

            // Can roll Right?
            const canRollRight =
              x < width - 1 &&
              grid[y][x + 1] === 'empty' &&
              grid[y + 1][x + 1] === 'empty' &&
              !(reptonPos.x === x + 1 && (reptonPos.y === y || reptonPos.y === y + 1));

            if (canRollLeft) {
              grid[y][x] = 'empty';
              grid[y][x - 1] = 'boulder';
              reptonAudio.playRoll();
            } else if (canRollRight) {
              grid[y][x] = 'empty';
              grid[y][x + 1] = 'boulder';
              reptonAudio.playRoll();
            }
          }
        }
      }
    }
  }

  private simulateMonsters() {
    const grid = this.state.grid;
    const reptonPos = this.state.reptonPos;

    for (const monster of this.state.monsters) {
      monster.animFrame = (monster.animFrame + 1) % 2;

      // Available directions
      const dirs: Array<{ dir: 'up' | 'down' | 'left' | 'right'; dx: number; dy: number }> = [
        { dir: 'up', dx: 0, dy: -1 },
        { dir: 'down', dx: 0, dy: 1 },
        { dir: 'left', dx: -1, dy: 0 },
        { dir: 'right', dx: 1, dy: 0 }
      ];

      // Filter valid moves where destination is empty or Repton
      const validMoves = dirs.filter(d => {
        const nx = monster.x + d.dx;
        const ny = monster.y + d.dy;
        if (nx < 0 || nx >= this.state.width || ny < 0 || ny >= this.state.height) return false;
        const tile = grid[ny][nx];
        return tile === 'empty';
      });

      if (validMoves.length > 0) {
        // Prefer moving towards Repton if unobstructed, otherwise continue straight or pick random
        const chaseMove = validMoves.find(m => {
          const nx = monster.x + m.dx;
          const ny = monster.y + m.dy;
          const currentDist = Math.abs(monster.x - reptonPos.x) + Math.abs(monster.y - reptonPos.y);
          const newDist = Math.abs(nx - reptonPos.x) + Math.abs(ny - reptonPos.y);
          return newDist < currentDist;
        });

        const sameDirMove = validMoves.find(m => m.dir === monster.direction);
        const chosen = chaseMove || sameDirMove || validMoves[Math.floor(Math.random() * validMoves.length)];

        monster.x += chosen.dx;
        monster.y += chosen.dy;
        monster.direction = chosen.dir;
      }
    }
  }

  private checkMonsterCollision() {
    const { reptonPos, monsters } = this.state;
    for (const monster of monsters) {
      if (monster.x === reptonPos.x && monster.y === reptonPos.y) {
        this.handlePlayerDeath('monster');
        return;
      }
    }
  }

  private handlePlayerDeath(reason: 'crushed' | 'monster' | 'time' | 'stuck') {
    if (this.state.isGameOver || this.state.isLevelComplete) return;

    this.state.deathReason = reason;
    reptonAudio.playDeath();
    this.state.lives = Math.max(0, this.state.lives - 1);

    if (this.state.lives <= 0) {
      this.state.isGameOver = true;
      if (this.onGameOverCb) {
        this.onGameOverCb(this.state.score);
      }
    } else {
      // Re-init current level with remaining lives & score
      setTimeout(() => {
        this.resetCurrentLevel();
      }, 1000);
    }
  }

  private checkLevelCompletion() {
    if (this.state.diamondsRemaining <= 0) {
      this.state.isLevelComplete = true;
      const timeBonus = this.state.timeLeft * 2;
      this.state.score += timeBonus;
      reptonAudio.playLevelWin();

      if (this.onLevelWinCb) {
        this.onLevelWinCb(this.state.levelIndex, this.state.score);
      }
    }
  }

  public togglePause(): boolean {
    this.state.isPaused = !this.state.isPaused;
    return this.state.isPaused;
  }
}
