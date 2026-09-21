/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type PongDifficulty = 'novice' | 'amateur' | 'pro' | 'master';
export type PongColorMode = 'bw' | 'amber' | 'green' | 'neon';

export interface DifficultyConfig {
  nameNl: string;
  nameEn: string;
  aiSpeed: number;        // Pixels per frame max
  aiReaction: number;     // Lerp / reaction delay (0.01 = sluggish, 0.25 = robotic)
  aiErrorMargin: number;  // Offset variation in pixels
  baseBallSpeed: number;  // Starting ball speed
  maxBallSpeed: number;   // Maximum capped ball speed
  acceleration: number;   // Acceleration per hit
  descriptionNl: string;
  descriptionEn: string;
}

export const DIFFICULTY_PRESETS: Record<PongDifficulty, DifficultyConfig> = {
  novice: {
    nameNl: 'Beginner (Recreant)',
    nameEn: 'Novice (Casual)',
    aiSpeed: 4.8,
    aiReaction: 0.055,
    aiErrorMargin: 24,
    baseBallSpeed: 5.5,
    maxBallSpeed: 10,
    acceleration: 1.03,
    descriptionNl: 'Lage balsnelheid en rustige computer paddle. Ideaal om te leren sturen.',
    descriptionEn: 'Gentle ball speed and relaxed AI paddle. Great for beginners.',
  },
  amateur: {
    nameNl: 'Amateur (Clubspeler)',
    nameEn: 'Amateur (Club Player)',
    aiSpeed: 6.5,
    aiReaction: 0.09,
    aiErrorMargin: 14,
    baseBallSpeed: 6.8,
    maxBallSpeed: 12.5,
    acceleration: 1.045,
    descriptionNl: 'Standaard speelhalkracht met scherpe hoeken en vloeiende computerreacties.',
    descriptionEn: 'Classic arcade balance with sharp angles and steady AI tracking.',
  },
  pro: {
    nameNl: 'Pro (Arcade Veteraan)',
    nameEn: 'Pro (Arcade Veteran)',
    aiSpeed: 8.5,
    aiReaction: 0.14,
    aiErrorMargin: 6,
    baseBallSpeed: 8.2,
    maxBallSpeed: 15.0,
    acceleration: 1.06,
    descriptionNl: 'Snelle bal met hoge acceleratie bij rallies. De computer mist bijna niets.',
    descriptionEn: 'High-speed ball with fast rally acceleration. AI rarely makes a mistake.',
  },
  master: {
    nameNl: 'Atari Meester (1972 Champion)',
    nameEn: 'Atari Master (1972 Champion)',
    aiSpeed: 11.0,
    aiReaction: 0.22,
    aiErrorMargin: 0,
    baseBallSpeed: 9.8,
    maxBallSpeed: 18.0,
    acceleration: 1.075,
    descriptionNl: 'Genadeloze AI met predictieve timing en supersnelle rallysnelheid.',
    descriptionEn: 'Merciless AI with predictive tracking and extreme rally speeds.',
  },
};

export interface Paddle {
  x: number;
  y: number;
  width: number;
  height: number;
  vy: number;
}

export interface Ball {
  x: number;
  y: number;
  size: number;
  vx: number;
  vy: number;
  speed: number;
  trail: Array<{ x: number; y: number; alpha: number }>;
}

export interface PongState {
  playerScore: number;
  aiScore: number;
  winningScore: number;
  difficulty: PongDifficulty;
  isTwoPlayer: boolean;
  rallyCount: number;
  maxRallyThisGame: number;
  isGameOver: boolean;
  winner: 'player' | 'ai' | 'player2' | null;
  isPaused: boolean;
  isServing: boolean;
  servingTo: 'player' | 'ai';
  serveCountdown: number; // in frames
}

export class PongEngine {
  public width = 800;
  public height = 500;

  public playerPaddle: Paddle;
  public aiPaddle: Paddle;
  public ball: Ball;
  public state: PongState;

  private onPaddleHitCallback?: (rally: number) => void;
  private onWallHitCallback?: () => void;
  private onScoreCallback?: (isPlayer: boolean) => void;
  private onGameOverCallback?: (winner: 'player' | 'ai' | 'player2') => void;

  constructor(difficulty: PongDifficulty = 'amateur', winningScore: number = 11, isTwoPlayer: boolean = false) {
    const paddleH = 75;
    const paddleW = 14;

    this.playerPaddle = {
      x: 30,
      y: (this.height - paddleH) / 2,
      width: paddleW,
      height: paddleH,
      vy: 0,
    };

    this.aiPaddle = {
      x: this.width - 30 - paddleW,
      y: (this.height - paddleH) / 2,
      width: paddleW,
      height: paddleH,
      vy: 0,
    };

    this.ball = {
      x: this.width / 2 - 7,
      y: this.height / 2 - 7,
      size: 14,
      vx: 0,
      vy: 0,
      speed: DIFFICULTY_PRESETS[difficulty].baseBallSpeed,
      trail: [],
    };

    this.state = {
      playerScore: 0,
      aiScore: 0,
      winningScore,
      difficulty,
      isTwoPlayer,
      rallyCount: 0,
      maxRallyThisGame: 0,
      isGameOver: false,
      winner: null,
      isPaused: false,
      isServing: true,
      servingTo: 'player',
      serveCountdown: 60,
    };

    this.resetBall(true);
  }

  public setCallbacks(callbacks: {
    onPaddleHit?: (rally: number) => void;
    onWallHit?: () => void;
    onScore?: (isPlayer: boolean) => void;
    onGameOver?: (winner: 'player' | 'ai' | 'player2') => void;
  }) {
    this.onPaddleHitCallback = callbacks.onPaddleHit;
    this.onWallHitCallback = callbacks.onWallHit;
    this.onScoreCallback = callbacks.onScore;
    this.onGameOverCallback = callbacks.onGameOver;
  }

  public setDifficulty(diff: PongDifficulty) {
    this.state.difficulty = diff;
    if (this.state.isServing) {
      this.ball.speed = DIFFICULTY_PRESETS[diff].baseBallSpeed;
    }
  }

  public setTwoPlayer(twoPlayer: boolean) {
    this.state.isTwoPlayer = twoPlayer;
  }

  public setWinningScore(score: number) {
    this.state.winningScore = score;
  }

  public resetGame() {
    this.state.playerScore = 0;
    this.state.aiScore = 0;
    this.state.rallyCount = 0;
    this.state.maxRallyThisGame = 0;
    this.state.isGameOver = false;
    this.state.winner = null;
    this.state.isPaused = false;
    this.playerPaddle.y = (this.height - this.playerPaddle.height) / 2;
    this.aiPaddle.y = (this.height - this.aiPaddle.height) / 2;
    this.resetBall(true);
  }

  public resetBall(toPlayer: boolean = true) {
    this.state.isServing = true;
    this.state.servingTo = toPlayer ? 'player' : 'ai';
    this.state.serveCountdown = 50;
    this.state.rallyCount = 0;

    this.ball.x = this.width / 2 - this.ball.size / 2;
    this.ball.y = this.height / 2 - this.ball.size / 2;
    this.ball.speed = DIFFICULTY_PRESETS[this.state.difficulty].baseBallSpeed;
    this.ball.trail = [];

    // Launch angle: gentle horizontal angle between -30 and +30 degrees
    const angle = (Math.random() * 0.7 - 0.35);
    const dir = toPlayer ? -1 : 1;
    this.ball.vx = Math.cos(angle) * this.ball.speed * dir;
    this.ball.vy = Math.sin(angle) * this.ball.speed;
  }

  public movePlayerPaddle(targetY: number) {
    // Keep paddle within bounds
    const clampedY = Math.max(10, Math.min(this.height - this.playerPaddle.height - 10, targetY));
    this.playerPaddle.y = clampedY;
  }

  public movePlayerByDelta(deltaY: number) {
    this.movePlayerPaddle(this.playerPaddle.y + deltaY);
  }

  public movePlayer2ByDelta(deltaY: number) {
    const clampedY = Math.max(10, Math.min(this.height - this.aiPaddle.height - 10, this.aiPaddle.y + deltaY));
    this.aiPaddle.y = clampedY;
  }

  // Update loop
  public update() {
    if (this.state.isPaused || this.state.isGameOver) return;

    // Handle serving countdown
    if (this.state.isServing) {
      this.state.serveCountdown--;
      if (this.state.serveCountdown <= 0) {
        this.state.isServing = false;
      } else {
        return;
      }
    }

    const cfg = DIFFICULTY_PRESETS[this.state.difficulty];

    // AI logic (when not in 2P mode)
    if (!this.state.isTwoPlayer) {
      const paddleCenter = this.aiPaddle.y + this.aiPaddle.height / 2;
      // When ball is moving towards AI, track closely; otherwise relax to center
      let targetY = this.height / 2;
      if (this.ball.vx > 0) {
        // AI targets the ball with slight difficulty error
        targetY = this.ball.y + this.ball.size / 2;
        if (cfg.aiErrorMargin > 0) {
          // Add sinusoidal sway based on rally
          targetY += Math.sin(Date.now() / 400) * cfg.aiErrorMargin;
        }
      }

      const diff = targetY - paddleCenter;
      const step = Math.sign(diff) * Math.min(Math.abs(diff) * cfg.aiReaction, cfg.aiSpeed);
      this.aiPaddle.y = Math.max(10, Math.min(this.height - this.aiPaddle.height - 10, this.aiPaddle.y + step));
    }

    // Move ball
    this.ball.x += this.ball.vx;
    this.ball.y += this.ball.vy;

    // Update trail
    this.ball.trail.push({ x: this.ball.x, y: this.ball.y, alpha: 0.8 });
    if (this.ball.trail.length > 6) {
      this.ball.trail.shift();
    }
    this.ball.trail.forEach(t => t.alpha *= 0.82);

    // Wall collision (top / bottom)
    if (this.ball.y <= 10) {
      this.ball.y = 10;
      this.ball.vy = -this.ball.vy;
      this.onWallHitCallback?.();
    } else if (this.ball.y + this.ball.size >= this.height - 10) {
      this.ball.y = this.height - 10 - this.ball.size;
      this.ball.vy = -this.ball.vy;
      this.onWallHitCallback?.();
    }

    // Paddle collision: Player 1 (Left)
    if (
      this.ball.vx < 0 &&
      this.ball.x <= this.playerPaddle.x + this.playerPaddle.width &&
      this.ball.x + this.ball.size >= this.playerPaddle.x &&
      this.ball.y + this.ball.size >= this.playerPaddle.y &&
      this.ball.y <= this.playerPaddle.y + this.playerPaddle.height
    ) {
      this.handlePaddleBounce(this.playerPaddle, true);
    }

    // Paddle collision: Player 2 / AI (Right)
    if (
      this.ball.vx > 0 &&
      this.ball.x + this.ball.size >= this.aiPaddle.x &&
      this.ball.x <= this.aiPaddle.x + this.aiPaddle.width &&
      this.ball.y + this.ball.size >= this.aiPaddle.y &&
      this.ball.y <= this.aiPaddle.y + this.aiPaddle.height
    ) {
      this.handlePaddleBounce(this.aiPaddle, false);
    }

    // Scoring: Ball out of left boundary (AI scores)
    if (this.ball.x + this.ball.size < 0) {
      this.state.aiScore++;
      this.onScoreCallback?.(false);
      this.checkGameOver(false);
      if (!this.state.isGameOver) {
        this.resetBall(true);
      }
    }
    // Scoring: Ball out of right boundary (Player scores)
    else if (this.ball.x > this.width) {
      this.state.playerScore++;
      this.onScoreCallback?.(true);
      this.checkGameOver(true);
      if (!this.state.isGameOver) {
        this.resetBall(false);
      }
    }
  }

  private handlePaddleBounce(paddle: Paddle, isLeftPaddle: boolean) {
    const cfg = DIFFICULTY_PRESETS[this.state.difficulty];

    // Rally counter
    this.state.rallyCount++;
    if (this.state.rallyCount > this.state.maxRallyThisGame) {
      this.state.maxRallyThisGame = this.state.rallyCount;
    }

    // Speed acceleration
    this.ball.speed = Math.min(this.ball.speed * cfg.acceleration, cfg.maxBallSpeed);

    // Calculate intercept offset (-1 to 1) for authentic English spin
    const paddleCenter = paddle.y + paddle.height / 2;
    const ballCenter = this.ball.y + this.ball.size / 2;
    const relativeIntersectY = (ballCenter - paddleCenter) / (paddle.height / 2);
    const clampedRelative = Math.max(-1, Math.min(1, relativeIntersectY));

    // Maximum deflection angle: 60 degrees (1.047 rad)
    const bounceAngle = clampedRelative * (Math.PI / 3);

    const dir = isLeftPaddle ? 1 : -1;
    this.ball.vx = Math.cos(bounceAngle) * this.ball.speed * dir;
    this.ball.vy = Math.sin(bounceAngle) * this.ball.speed;

    // Push ball out of paddle to prevent sticking
    if (isLeftPaddle) {
      this.ball.x = paddle.x + paddle.width + 1;
    } else {
      this.ball.x = paddle.x - this.ball.size - 1;
    }

    this.onPaddleHitCallback?.(this.state.rallyCount);
  }

  private checkGameOver(playerJustScored: boolean) {
    if (this.state.playerScore >= this.state.winningScore) {
      this.state.isGameOver = true;
      this.state.winner = 'player';
      this.onGameOverCallback?.('player');
    } else if (this.state.aiScore >= this.state.winningScore) {
      this.state.isGameOver = true;
      this.state.winner = this.state.isTwoPlayer ? 'player2' : 'ai';
      this.onGameOverCallback?.(this.state.winner);
    }
  }
}
