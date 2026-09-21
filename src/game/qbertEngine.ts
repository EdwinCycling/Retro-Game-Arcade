/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Q*bert Game Engine (Arcade / BBC Micro / Acorn)
 */

import {
  Direction,
  CubeData,
  FlyingDisk,
  Ball,
  CoilyEnemy,
  QbertPlayer,
  GameState,
} from './qbertTypes';
import { qbertAudio } from './qbertAudio';
import { getQbertScores, saveQbertScore } from './qbertHighScores';

export const NATIVE_WIDTH = 320;
export const NATIVE_HEIGHT = 240;

export const PYRAMID_ORIGIN_X = 160;
export const PYRAMID_ORIGIN_Y = 54;
export const CUBE_WIDTH = 32;
export const CUBE_HEIGHT_STEP = 23;

export function getCubeCenter(row: number, col: number): { x: number; y: number } {
  const x = PYRAMID_ORIGIN_X + (col - row / 2) * CUBE_WIDTH;
  const y = PYRAMID_ORIGIN_Y + row * CUBE_HEIGHT_STEP;
  return { x, y };
}

export class QbertEngine {
  public cubes: CubeData[] = [];
  public disks: FlyingDisk[] = [];
  public balls: Ball[] = [];
  public coily: CoilyEnemy | null = null;
  public player: QbertPlayer;

  public score: number = 0;
  public highScore: number = 24850;
  public lives: number = 3;
  public round: number = 1;
  public level: number = 1;
  public gameState: GameState = 'TITLE';

  public freezeTimer: number = 0;
  public deathTimer: number = 0;
  public levelClearTimer: number = 0;
  public ballSpawnTimer: number = 0;
  public coilySpawnTimer: number = 0;
  public bonusLifeGiven: boolean = false;

  constructor() {
    const scores = getQbertScores();
    if (scores.length > 0) {
      this.highScore = scores[0].score;
    }

    this.player = {
      row: 0,
      col: 0,
      visualX: PYRAMID_ORIGIN_X,
      visualY: PYRAMID_ORIGIN_Y - 14,
      isJumping: false,
      jumpProgress: 0,
      jumpFromX: PYRAMID_ORIGIN_X,
      jumpFromY: PYRAMID_ORIGIN_Y - 14,
      jumpToX: PYRAMID_ORIGIN_X,
      jumpToY: PYRAMID_ORIGIN_Y - 14,
      facing: 'DR',
      isAlive: true,
      isSwearing: false,
      swearTimer: 0,
      swearText: '@!#?@!',
      isRidingDisk: false,
      isFalling: false,
    };

    this.initLevel(1, 1);
  }

  public initLevel(level: number, round: number) {
    this.level = level;
    this.round = round;
    this.balls = [];
    this.coily = null;
    this.freezeTimer = 0;
    this.ballSpawnTimer = 0;
    this.coilySpawnTimer = 0;

    // Build 28 cubes (rows 0 to 6)
    this.cubes = [];
    const targetState = round === 2 ? 2 : 1;
    for (let r = 0; r <= 6; r++) {
      for (let c = 0; c <= r; c++) {
        this.cubes.push({
          row: r,
          col: c,
          state: 0,
          targetState,
          flashTimer: 0,
        });
      }
    }

    // Spawn 2 Flying Disks (left and right edges)
    this.disks = [
      {
        id: 1,
        side: 'left',
        row: 4,
        col: 0,
        x: getCubeCenter(4, 0).x - 26,
        y: getCubeCenter(4, 0).y - 4,
        active: true,
        isAscending: false,
        ascendProgress: 0,
      },
      {
        id: 2,
        side: 'right',
        row: 5,
        col: 5,
        x: getCubeCenter(5, 5).x + 26,
        y: getCubeCenter(5, 5).y - 4,
        active: true,
        isAscending: false,
        ascendProgress: 0,
      },
    ];

    this.resetPlayerToTop();
  }

  public resetPlayerToTop() {
    const topPos = getCubeCenter(0, 0);
    this.player.row = 0;
    this.player.col = 0;
    this.player.visualX = topPos.x;
    this.player.visualY = topPos.y - 14;
    this.player.isJumping = false;
    this.player.jumpProgress = 0;
    this.player.isAlive = true;
    this.player.isSwearing = false;
    this.player.swearTimer = 0;
    this.player.isRidingDisk = false;
    this.player.diskId = undefined;
    this.player.isFalling = false;
  }

  public startNewGame() {
    this.score = 0;
    this.lives = 3;
    this.bonusLifeGiven = false;
    this.initLevel(1, 1);
    this.gameState = 'PLAYING';
    qbertAudio.playHop();
  }

  public getCube(row: number, col: number): CubeData | undefined {
    return this.cubes.find((c) => c.row === row && c.col === col);
  }

  public areAllCubesTarget(): boolean {
    return this.cubes.every((c) => c.state === c.targetState);
  }

  // Handle user jump command
  public movePlayer(direction: Direction) {
    if (this.gameState !== 'PLAYING') return;
    if (this.player.isJumping || !this.player.isAlive || this.player.isRidingDisk || this.player.isFalling) {
      return;
    }

    this.player.facing = direction;

    let nextRow = this.player.row;
    let nextCol = this.player.col;

    switch (direction) {
      case 'UL':
        nextRow -= 1;
        nextCol -= 1;
        break;
      case 'UR':
        nextRow -= 1;
        break;
      case 'DL':
        nextRow += 1;
        break;
      case 'DR':
        nextRow += 1;
        nextCol += 1;
        break;
    }

    const currentPos = getCubeCenter(this.player.row, this.player.col);
    this.player.jumpFromX = currentPos.x;
    this.player.jumpFromY = currentPos.y - 14;

    // Check if next coordinate is valid cube on the pyramid
    if (nextRow >= 0 && nextRow <= 6 && nextCol >= 0 && nextCol <= nextRow) {
      const targetPos = getCubeCenter(nextRow, nextCol);
      this.player.row = nextRow;
      this.player.col = nextCol;
      this.player.jumpToX = targetPos.x;
      this.player.jumpToY = targetPos.y - 14;
      this.player.isJumping = true;
      this.player.jumpProgress = 0;

      qbertAudio.playHop();
    } else {
      // Jump is off the edge! Check if jumping into a flying disk!
      const matchingDisk = this.disks.find(
        (d) =>
          d.active &&
          !d.isAscending &&
          ((d.side === 'left' && this.player.row === d.row && this.player.col === 0 && (direction === 'UL' || direction === 'DL')) ||
           (d.side === 'right' && this.player.row === d.row && this.player.col === d.col && (direction === 'UR' || direction === 'DR')))
      );

      if (matchingDisk) {
        // Board the disk!
        matchingDisk.isAscending = true;
        matchingDisk.ascendProgress = 0;
        this.player.isRidingDisk = true;
        this.player.diskId = matchingDisk.id;
        this.player.jumpToX = matchingDisk.x;
        this.player.jumpToY = matchingDisk.y - 14;
        this.player.isJumping = true;
        this.player.jumpProgress = 0;

        qbertAudio.playHop();
        qbertAudio.playDiskAscend();

        // If Coily is close, Coily follows into the abyss!
        if (this.coily && this.coily.active && this.coily.isHatched && !this.coily.isFalling) {
          const coilyDist = Math.hypot(this.coily.row - this.player.row, this.coily.col - this.player.col);
          if (coilyDist <= 2.2) {
            this.coily.isFalling = true;
            this.coily.jumpFromX = this.coily.visualX;
            this.coily.jumpFromY = this.coily.visualY;
            this.coily.jumpToX = matchingDisk.x;
            this.coily.jumpToY = NATIVE_HEIGHT + 60;
            this.coily.jumpProgress = 0;
            this.score += 500;
            this.checkHighScore();
          }
        }
      } else {
        // Fall off pyramid cliff!
        const fallOffset = {
          UL: { x: -28, y: -20 },
          UR: { x: 28, y: -20 },
          DL: { x: -28, y: 35 },
          DR: { x: 28, y: 35 },
        }[direction];

        this.player.isFalling = true;
        this.player.jumpToX = currentPos.x + fallOffset.x;
        this.player.jumpToY = currentPos.y - 14 + fallOffset.y;
        this.player.isJumping = true;
        this.player.jumpProgress = 0;

        qbertAudio.playFallOff();
      }
    }
  }

  public update(dt: number) {
    if (this.gameState === 'PLAYER_HIT') {
      this.deathTimer -= dt;
      if (this.deathTimer <= 0) {
        if (this.lives > 0) {
          this.resetPlayerToTop();
          this.balls = [];
          this.coily = null;
          this.gameState = 'PLAYING';
        } else {
          this.gameState = 'GAMEOVER';
          qbertAudio.playGameOver();
          saveQbertScore(this.score, 'QBT', this.level);
        }
      }
      return;
    }

    if (this.gameState === 'LEVEL_CLEAR') {
      this.levelClearTimer -= dt;
      // Rainbow flashing cubes animation
      this.cubes.forEach((c) => {
        c.flashTimer = (c.flashTimer + dt * 10) % 3;
      });

      if (this.levelClearTimer <= 0) {
        // Next round / level
        let nextRound = this.round + 1;
        let nextLevel = this.level;
        if (nextRound > 3) {
          nextRound = 1;
          nextLevel += 1;
        }
        this.initLevel(nextLevel, nextRound);
        this.gameState = 'PLAYING';
      }
      return;
    }

    if (this.gameState !== 'PLAYING') return;

    // Freeze timer countdown
    if (this.freezeTimer > 0) {
      this.freezeTimer = Math.max(0, this.freezeTimer - dt);
    }

    // Update Player Jump Animation
    if (this.player.isJumping) {
      this.player.jumpProgress += dt * 4.5; // ~0.22s hop
      if (this.player.jumpProgress >= 1) {
        this.player.jumpProgress = 1;
        this.player.isJumping = false;
        this.player.visualX = this.player.jumpToX;
        this.player.visualY = this.player.jumpToY;

        if (this.player.isFalling) {
          // Finish falling off the screen
          this.triggerPlayerDeath('FALLEN OFF CLIFF');
        } else if (this.player.isRidingDisk) {
          // Stay on disk while it ascends
        } else {
          // Landed successfully on cube! Change cube color
          const cube = this.getCube(this.player.row, this.player.col);
          if (cube) {
            let changed = false;
            if (this.round === 1) {
              if (cube.state === 0) {
                cube.state = 1;
                changed = true;
              }
            } else if (this.round === 2) {
              if (cube.state < 2) {
                cube.state += 1;
                changed = true;
              }
            } else if (this.round >= 3) {
              if (cube.state === 0) {
                cube.state = 1;
                changed = true;
              } else if (cube.state === 1) {
                // Reversible in round 3+!
                cube.state = 0;
              }
            }

            if (changed) {
              this.score += 25;
              this.checkHighScore();
              qbertAudio.playColorChange();

              // Check if all cubes are completed!
              if (this.areAllCubesTarget()) {
                this.score += 1000 + this.disks.filter((d) => d.active).length * 250;
                this.checkHighScore();
                this.gameState = 'LEVEL_CLEAR';
                this.levelClearTimer = 2.4;
                qbertAudio.playLevelClear();
                return;
              }
            }
          }
        }
      } else {
        const p = this.player.jumpProgress;
        this.player.visualX = this.player.jumpFromX + (this.player.jumpToX - this.player.jumpFromX) * p;
        const arc = Math.sin(p * Math.PI) * (this.player.isFalling ? -8 : 16);
        this.player.visualY = this.player.jumpFromY + (this.player.jumpToY - this.player.jumpFromY) * p - arc;
      }
    }

    // Update Riding Flying Disk Ascension
    if (this.player.isRidingDisk && this.player.diskId) {
      const disk = this.disks.find((d) => d.id === this.player.diskId);
      if (disk && disk.isAscending) {
        disk.ascendProgress += dt * 0.85;
        const topTarget = getCubeCenter(0, 0);
        disk.x += (topTarget.x - disk.x) * (dt * 2.5);
        disk.y -= dt * 45;
        this.player.visualX = disk.x;
        this.player.visualY = disk.y - 14;

        if (disk.ascendProgress >= 1 || disk.y <= topTarget.y - 14) {
          disk.active = false;
          disk.isAscending = false;
          this.player.isRidingDisk = false;
          this.player.diskId = undefined;
          this.resetPlayerToTop();
          qbertAudio.playHop();
        }
      }
    }

    // Swearing timer
    if (this.player.isSwearing) {
      this.player.swearTimer -= dt;
      if (this.player.swearTimer <= 0) {
        this.player.isSwearing = false;
      }
    }

    // Skip enemy logic if enemies are frozen by green ball!
    if (this.freezeTimer <= 0) {
      this.updateEnemies(dt);
    }

    // Check collisions with player
    this.checkCollisions();
  }

  private updateEnemies(dt: number) {
    // 1. Spawning Balls (Red hazard, Green freeze ball)
    this.ballSpawnTimer += dt;
    const ballInterval = Math.max(2.0, 3.8 - this.level * 0.3);
    if (this.ballSpawnTimer >= ballInterval && this.balls.length < 3) {
      this.ballSpawnTimer = 0;
      const isGreen = Math.random() < 0.28;
      const startCol = Math.random() < 0.5 ? 0 : 1;
      const pos = getCubeCenter(1, startCol);
      this.balls.push({
        id: Math.random(),
        type: isGreen ? 'green' : 'red',
        row: 1,
        col: startCol,
        visualX: pos.x,
        visualY: pos.y - 12,
        isJumping: false,
        jumpProgress: 0,
        jumpFromX: pos.x,
        jumpFromY: pos.y - 12,
        jumpToX: pos.x,
        jumpToY: pos.y - 12,
        jumpTimer: 0.6,
      });
    }

    // Update Balls Movement
    for (let i = this.balls.length - 1; i >= 0; i--) {
      const ball = this.balls[i];
      if (ball.isJumping) {
        ball.jumpProgress += dt * 4.2;
        if (ball.jumpProgress >= 1) {
          ball.jumpProgress = 1;
          ball.isJumping = false;
          ball.visualX = ball.jumpToX;
          ball.visualY = ball.jumpToY;

          // If ball fell off bottom row 6
          if (ball.row > 6) {
            this.balls.splice(i, 1);
            continue;
          }
        } else {
          const p = ball.jumpProgress;
          ball.visualX = ball.jumpFromX + (ball.jumpToX - ball.jumpFromX) * p;
          ball.visualY = ball.jumpFromY + (ball.jumpToY - ball.jumpFromY) * p - Math.sin(p * Math.PI) * 14;
        }
      } else {
        ball.jumpTimer -= dt;
        if (ball.jumpTimer <= 0) {
          ball.jumpTimer = 0.85;
          // Hop Down-Left or Down-Right
          const goRight = Math.random() < 0.5;
          const nextRow = ball.row + 1;
          const nextCol = goRight ? ball.col + 1 : ball.col;

          const currentPos = getCubeCenter(ball.row, ball.col);
          ball.jumpFromX = currentPos.x;
          ball.jumpFromY = currentPos.y - 12;

          if (nextRow <= 6) {
            const nextPos = getCubeCenter(nextRow, nextCol);
            ball.row = nextRow;
            ball.col = nextCol;
            ball.jumpToX = nextPos.x;
            ball.jumpToY = nextPos.y - 12;
          } else {
            // Falls off the bottom of pyramid into space
            ball.row = nextRow;
            ball.jumpToX = currentPos.x + (goRight ? 16 : -16);
            ball.jumpToY = currentPos.y + 40;
          }

          ball.isJumping = true;
          ball.jumpProgress = 0;
        }
      }
    }

    // 2. Coily Enemy (Egg -> Snake)
    if (!this.coily) {
      this.coilySpawnTimer += dt;
      if (this.coilySpawnTimer > 4.5) {
        this.coilySpawnTimer = 0;
        const startCol = Math.random() < 0.5 ? 0 : 1;
        const pos = getCubeCenter(1, startCol);
        this.coily = {
          row: 1,
          col: startCol,
          visualX: pos.x,
          visualY: pos.y - 12,
          isHatched: false,
          isJumping: false,
          jumpProgress: 0,
          jumpFromX: pos.x,
          jumpFromY: pos.y - 12,
          jumpToX: pos.x,
          jumpToY: pos.y - 12,
          facing: 'DR',
          active: true,
          jumpTimer: 0.8,
          isFalling: false,
        };
      }
    } else {
      const c = this.coily;

      if (c.isFalling) {
        // Coily was lured to jump off cliff!
        c.visualY += dt * 160;
        if (c.visualY > NATIVE_HEIGHT + 40) {
          this.coily = null;
          this.coilySpawnTimer = 0;
        }
      } else if (c.isJumping) {
        c.jumpProgress += dt * 3.8;
        if (c.jumpProgress >= 1) {
          c.jumpProgress = 1;
          c.isJumping = false;
          c.visualX = c.jumpToX;
          c.visualY = c.jumpToY;

          // Check if egg reached bottom row and hatches!
          if (!c.isHatched && c.row >= 6) {
            c.isHatched = true;
            qbertAudio.playCoilyHatch();
          }
        } else {
          const p = c.jumpProgress;
          c.visualX = c.jumpFromX + (c.jumpToX - c.jumpFromX) * p;
          c.visualY = c.jumpFromY + (c.jumpToY - c.jumpFromY) * p - Math.sin(p * Math.PI) * 16;
        }
      } else {
        c.jumpTimer -= dt;
        const hopDelay = c.isHatched ? Math.max(0.6, 0.95 - this.level * 0.05) : 0.85;
        if (c.jumpTimer <= 0) {
          c.jumpTimer = hopDelay;

          const currentPos = getCubeCenter(c.row, c.col);
          c.jumpFromX = currentPos.x;
          c.jumpFromY = currentPos.y - (c.isHatched ? 18 : 12);

          if (!c.isHatched) {
            // As an egg, bounces downward
            const goRight = Math.random() < 0.5;
            const nextRow = c.row + 1;
            const nextCol = goRight ? c.col + 1 : c.col;

            if (nextRow <= 6) {
              const nextPos = getCubeCenter(nextRow, nextCol);
              c.row = nextRow;
              c.col = nextCol;
              c.jumpToX = nextPos.x;
              c.jumpToY = nextPos.y - 12;
              c.isJumping = true;
              c.jumpProgress = 0;
              qbertAudio.playCoilyHop();
            }
          } else {
            // As a snake, intelligent pathfinding towards Q*bert!
            const possibleMoves: { dir: Direction; dr: number; dc: number }[] = [
              { dir: 'UL', dr: -1, dc: -1 },
              { dir: 'UR', dr: -1, dc: 0 },
              { dir: 'DL', dr: 1, dc: 0 },
              { dir: 'DR', dr: 1, dc: 1 },
            ];

            // Filter moves that stay within pyramid bounds
            const validMoves = possibleMoves.filter((m) => {
              const nr = c.row + m.dr;
              const nc = c.col + m.dc;
              return nr >= 0 && nr <= 6 && nc >= 0 && nc <= nr;
            });

            if (validMoves.length > 0) {
              // Pick move that minimizes distance to player
              let bestMove = validMoves[0];
              let minDist = Infinity;

              validMoves.forEach((m) => {
                const nr = c.row + m.dr;
                const nc = c.col + m.dc;
                const dist = Math.hypot(nr - this.player.row, nc - this.player.col);
                if (dist < minDist) {
                  minDist = dist;
                  bestMove = m;
                }
              });

              c.facing = bestMove.dir;
              c.row += bestMove.dr;
              c.col += bestMove.dc;
              const nextPos = getCubeCenter(c.row, c.col);
              c.jumpToX = nextPos.x;
              c.jumpToY = nextPos.y - 18;
              c.isJumping = true;
              c.jumpProgress = 0;
              qbertAudio.playCoilyHop();
            }
          }
        }
      }
    }
  }

  private checkCollisions() {
    if (this.gameState !== 'PLAYING' || !this.player.isAlive || this.player.isRidingDisk || this.player.isFalling) {
      return;
    }

    const pX = this.player.visualX;
    const pY = this.player.visualY;

    // 1. Collisions with Balls
    for (let i = this.balls.length - 1; i >= 0; i--) {
      const b = this.balls[i];
      const dist = Math.hypot(pX - b.visualX, pY - b.visualY);
      if (dist < 14) {
        if (b.type === 'green') {
          // Freeze green ball collected!
          this.score += 100;
          this.checkHighScore();
          this.freezeTimer = 3.5;
          qbertAudio.playFreeze();
          this.balls.splice(i, 1);
        } else {
          // Red ball hit
          this.triggerPlayerDeath('HIT BY RED HAZARD');
          return;
        }
      }
    }

    // 2. Collision with Coily Snake / Egg
    if (this.coily && this.coily.active && !this.coily.isFalling && this.freezeTimer <= 0) {
      const dist = Math.hypot(pX - this.coily.visualX, pY - this.coily.visualY);
      if (dist < 14) {
        this.triggerPlayerDeath('SNAKE BITE');
      }
    }
  }

  private triggerPlayerDeath(reason: string) {
    if (!this.player.isAlive) return;
    this.player.isAlive = false;
    this.lives -= 1;
    this.gameState = 'PLAYER_HIT';
    this.deathTimer = 2.0;

    // Swearing bubble with random retro curse chars
    const curses = ['@!#?@!', '&$#%*!', '#*@!!', '!#&$?'];
    this.player.swearText = curses[Math.floor(Math.random() * curses.length)];
    this.player.isSwearing = true;
    this.player.swearTimer = 2.0;

    qbertAudio.playSwear();
  }

  private checkHighScore() {
    if (this.score > this.highScore) {
      this.highScore = this.score;
    }
    // Bonus life at 8,000 pts
    if (!this.bonusLifeGiven && this.score >= 8000) {
      this.bonusLifeGiven = true;
      this.lives += 1;
      qbertAudio.playLevelClear();
    }
  }
}
