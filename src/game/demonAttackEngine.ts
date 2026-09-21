/**
 * Demon Attack Game Engine (1982, Imagic / Rob Fulop)
 * Manages player laser cannon, winged flapping demons, flight patterns,
 * splitting into two smaller demons, diving kamikaze attacks, guided bombs,
 * particles, wave completion, scoring, and bunkers/lives.
 */

import {
  Demon,
  DemonBomb,
  ExplosionParticle,
  FloatingText,
  GameState,
  LaserMissile,
  PlayerCannon,
  WaveConfig
} from './demonAttackTypes';
import { getWaveConfig } from './demonAttackWaves';
import { demonAudio } from './demonAttackAudio';
import { isDemonHighScore, saveDemonHighScore } from './demonAttackHighScores';

export const CANVAS_WIDTH = 480;
export const CANVAS_HEIGHT = 600;

export class DemonAttackEngine {
  public gameState: GameState = 'READY';
  public score: number = 0;
  public wave: number = 1;
  public lives: number = 3; // 'bunkers' / laser cannons
  public waveConfig: WaveConfig;

  public player: PlayerCannon;
  public missiles: LaserMissile[] = [];
  public demons: Demon[] = [];
  public bombs: DemonBomb[] = [];
  public particles: ExplosionParticle[] = [];
  public floatingTexts: FloatingText[] = [];

  // Progression & tracking
  public demonsDefeatedThisWave: number = 0;
  public totalDemonsInWave: number = 12; // Must defeat 12 total demons/splits to clear wave
  public waveTransitionTimer: number = 0;
  public playerDeathTimer: number = 0;
  public spawnTimer: number = 0;
  public stars: { x: number; y: number; speed: number; size: number; alpha: number }[] = [];

  // Input state
  private moveLeft: boolean = false;
  private moveRight: boolean = false;
  private isFiring: boolean = false;
  private fireCooldown: number = 0;
  private maxMissiles: number = 2; // Fast crisp laser fire

  // Listeners for UI state synchronisation
  private onStateChangeCallbacks: (() => void)[] = [];

  constructor() {
    this.waveConfig = getWaveConfig(1);
    this.player = {
      x: CANVAS_WIDTH / 2 - 16,
      y: CANVAS_HEIGHT - 48,
      width: 32,
      height: 20,
      speed: 260,
      isAlive: true,
      respawnTimer: 0
    };

    this.initStars();
    this.resetGame();
  }

  private initStars() {
    this.stars = [];
    for (let i = 0; i < 55; i++) {
      this.stars.push({
        x: Math.random() * CANVAS_WIDTH,
        y: Math.random() * CANVAS_HEIGHT,
        speed: 15 + Math.random() * 45,
        size: Math.random() > 0.8 ? 2 : 1,
        alpha: 0.3 + Math.random() * 0.7
      });
    }
  }

  public subscribe(cb: () => void): () => void {
    this.onStateChangeCallbacks.push(cb);
    return () => {
      this.onStateChangeCallbacks = this.onStateChangeCallbacks.filter((c) => c !== cb);
    };
  }

  private notify() {
    for (const cb of this.onStateChangeCallbacks) {
      cb();
    }
  }

  public resetGame() {
    this.score = 0;
    this.wave = 1;
    this.lives = 3;
    this.waveConfig = getWaveConfig(1);
    this.demonsDefeatedThisWave = 0;
    this.totalDemonsInWave = 12;
    this.missiles = [];
    this.bombs = [];
    this.particles = [];
    this.floatingTexts = [];
    this.demons = [];
    this.gameState = 'READY';

    this.player.x = CANVAS_WIDTH / 2 - 16;
    this.player.isAlive = true;
    this.player.respawnTimer = 0;

    this.spawnInitialDemons();
    this.notify();
  }

  public startGame() {
    if (this.gameState === 'READY') {
      this.gameState = 'PLAYING';
      this.notify();
    }
  }

  public setInput(left: boolean, right: boolean, fire: boolean) {
    this.moveLeft = left;
    this.moveRight = right;
    this.isFiring = fire;

    if (fire && this.gameState === 'READY') {
      this.startGame();
    }
  }

  public setHorizontalPositionRatio(ratio: number) {
    // For touch & iPhone gyro tilt steering
    const targetX = ratio * (CANVAS_WIDTH - this.player.width);
    this.player.x = Math.max(8, Math.min(CANVAS_WIDTH - this.player.width - 8, targetX));
  }

  /**
   * Spawns 3 demons in staggered rows (top, middle, bottom tier)
   */
  private spawnInitialDemons() {
    this.demons = [];
    const rows = [
      { y: 80, speed: this.waveConfig.demonSpeedX },
      { y: 140, speed: -this.waveConfig.demonSpeedX },
      { y: 200, speed: this.waveConfig.demonSpeedX * 1.1 }
    ];

    rows.forEach((row, index) => {
      const fromLeft = index % 2 === 0;
      const startX = fromLeft ? -40 - index * 60 : CANVAS_WIDTH + 40 + index * 60;
      const vx = fromLeft ? Math.abs(row.speed) : -Math.abs(row.speed);

      this.demons.push({
        id: `demon-${Date.now()}-${index}-${Math.random()}`,
        type: this.waveConfig.demonType,
        x: startX,
        y: row.y,
        width: 44,
        height: 30,
        vx: vx,
        vy: 0,
        baseY: row.y,
        color: this.waveConfig.demonColor,
        wingFrame: index % 2,
        wingTimer: Math.random() * 0.2,
        points: this.waveConfig.basePoints,
        canSplit: this.waveConfig.canSplit,
        health: 1,
        fireCooldown: 1.2 + Math.random() * 2.0
      });
    });
  }

  private spawnReplacementDemon() {
    if (this.demonsDefeatedThisWave >= this.totalDemonsInWave) {
      return; // No more spawns needed for this wave
    }

    // Only allow max 3 large demons or corresponding count on screen
    const mainDemons = this.demons.filter((d) => !d.isSplitChild).length;
    if (mainDemons >= 3) return;

    const rowHeights = [80, 140, 200];
    const targetY = rowHeights[Math.floor(Math.random() * rowHeights.length)];
    const fromLeft = Math.random() > 0.5;
    const startX = fromLeft ? -50 : CANVAS_WIDTH + 50;
    const vx = fromLeft ? this.waveConfig.demonSpeedX : -this.waveConfig.demonSpeedX;

    this.demons.push({
      id: `demon-spawn-${Date.now()}-${Math.random()}`,
      type: this.waveConfig.demonType,
      x: startX,
      y: targetY,
      width: 44,
      height: 30,
      vx: vx,
      vy: 0,
      baseY: targetY,
      color: this.waveConfig.demonColor,
      wingFrame: 0,
      wingTimer: 0,
      points: this.waveConfig.basePoints,
      canSplit: this.waveConfig.canSplit,
      health: 1,
      fireCooldown: 1.0 + Math.random() * 2.0
    });
  }

  public update(dt: number) {
    // Update starfield background
    for (const star of this.stars) {
      star.y += star.speed * dt;
      if (star.y > CANVAS_HEIGHT) {
        star.y = 0;
        star.x = Math.random() * CANVAS_WIDTH;
      }
    }

    // Update floating score texts
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.y += ft.vy * dt;
      ft.alpha -= dt * 1.2;
      if (ft.alpha <= 0) {
        this.floatingTexts.splice(i, 1);
      }
    }

    // Update explosion particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.alpha -= p.decay * dt;
      if (p.alpha <= 0) {
        this.particles.splice(i, 1);
      }
    }

    // Handle Wave Transition
    if (this.gameState === 'WAVE_TRANSITION') {
      this.waveTransitionTimer -= dt;
      if (this.waveTransitionTimer <= 0) {
        this.startNextWave();
      }
      return;
    }

    // Handle Player Hit / Respawn
    if (this.gameState === 'PLAYER_HIT') {
      this.playerDeathTimer -= dt;
      if (this.playerDeathTimer <= 0) {
        if (this.lives > 0) {
          this.player.isAlive = true;
          this.player.x = CANVAS_WIDTH / 2 - 16;
          this.player.respawnTimer = 2.0; // 2 seconds invulnerability blink
          this.gameState = 'PLAYING';
          this.notify();
        } else {
          this.gameState = 'GAME_OVER';
          this.notify();
        }
      }
      return;
    }

    if (this.gameState !== 'PLAYING') {
      return;
    }

    // Respawn invulnerability timer
    if (this.player.respawnTimer > 0) {
      this.player.respawnTimer -= dt;
    }

    // Player Movement
    if (this.moveLeft) {
      this.player.x -= this.player.speed * dt;
    }
    if (this.moveRight) {
      this.player.x += this.player.speed * dt;
    }
    this.player.x = Math.max(8, Math.min(CANVAS_WIDTH - this.player.width - 8, this.player.x));

    // Player Shooting
    this.fireCooldown -= dt;
    if (this.isFiring && this.fireCooldown <= 0 && this.missiles.length < this.maxMissiles) {
      this.fireLaser();
    }

    // Update Player Laser Missiles
    for (let i = this.missiles.length - 1; i >= 0; i--) {
      const m = this.missiles[i];
      m.y += m.vy * dt;
      if (m.y < -10) {
        this.missiles.splice(i, 1);
      }
    }

    // Update Enemy Bombs
    for (let i = this.bombs.length - 1; i >= 0; i--) {
      const b = this.bombs[i];
      b.y += b.vy * dt;

      // Guided missile tracks player x slightly
      if (b.isGuided) {
        const playerCenterX = this.player.x + this.player.width / 2;
        if (b.x < playerCenterX - 4) b.x += 45 * dt;
        else if (b.x > playerCenterX + 4) b.x -= 45 * dt;
      }

      // Check collision with Player
      if (
        this.player.isAlive &&
        this.player.respawnTimer <= 0 &&
        b.x + b.width > this.player.x &&
        b.x < this.player.x + this.player.width &&
        b.y + b.height > this.player.y &&
        b.y < this.player.y + this.player.height
      ) {
        this.bombs.splice(i, 1);
        this.handlePlayerHit();
        continue;
      }

      // Check ground collision
      if (b.y > CANVAS_HEIGHT - 28) {
        this.createGroundSparks(b.x, CANVAS_HEIGHT - 28, b.color);
        this.bombs.splice(i, 1);
      }
    }

    // Update Demons
    this.spawnTimer += dt;
    if (this.spawnTimer > 2.2) {
      this.spawnTimer = 0;
      this.spawnReplacementDemon();
    }

    // Only bottom-most demons fire in classic rules
    for (let i = this.demons.length - 1; i >= 0; i--) {
      const demon = this.demons[i];

      // Wing flapping animation
      demon.wingTimer += dt;
      if (demon.wingTimer > 0.12) {
        demon.wingTimer = 0;
        demon.wingFrame = (demon.wingFrame + 1) % 4;
      }

      // Horizontal flapping wave oscillation
      if (!demon.isDiving) {
        demon.x += demon.vx * dt;
        demon.y = demon.baseY + Math.sin(Date.now() / 300 + i) * 6;

        // Bounce horizontally within screen borders with slight vertical hover
        if (demon.x < 15) {
          demon.x = 15;
          demon.vx = Math.abs(demon.vx);
        } else if (demon.x + demon.width > CANVAS_WIDTH - 15) {
          demon.x = CANVAS_WIDTH - 15 - demon.width;
          demon.vx = -Math.abs(demon.vx);
        }

        // Random trigger for Diving attack (Waves 3+)
        if (this.waveConfig.canDive && Math.random() < 0.0035 + (demon.isSplitChild ? 0.007 : 0)) {
          this.initiateDemonDive(demon);
        }
      } else {
        // Diving behavior: swooping arc towards player
        demon.diveProgress = (demon.diveProgress || 0) + dt * (demon.diveSpeed || 1.8);
        const p = demon.diveProgress;
        if (p < 1) {
          demon.x = (demon.diveOriginX || demon.x) + ((demon.diveTargetX || this.player.x) - (demon.diveOriginX || demon.x)) * p;
          demon.y = (demon.diveOriginY || demon.baseY) + (CANVAS_HEIGHT - 60 - (demon.diveOriginY || demon.baseY)) * Math.sin(p * Math.PI);
        } else {
          // Finished dive, fly back up to top
          demon.isDiving = false;
          demon.y = demon.baseY;
          demon.diveProgress = 0;
        }
      }

      // Demon Bomb Drops
      demon.fireCooldown -= dt;
      if (demon.fireCooldown <= 0) {
        demon.fireCooldown = this.waveConfig.fireIntervalMin + Math.random() * (this.waveConfig.fireIntervalMax - this.waveConfig.fireIntervalMin);
        this.fireDemonBomb(demon);
      }

      // Check collision between Demon and Player (kamikaze dive)
      if (
        this.player.isAlive &&
        this.player.respawnTimer <= 0 &&
        demon.x + demon.width > this.player.x &&
        demon.x < this.player.x + this.player.width &&
        demon.y + demon.height > this.player.y &&
        demon.y < this.player.y + this.player.height
      ) {
        this.destroyDemon(demon, i, false);
        this.handlePlayerHit();
        continue;
      }

      // Check collision with Player Laser Missiles
      for (let mIdx = this.missiles.length - 1; mIdx >= 0; mIdx--) {
        const m = this.missiles[mIdx];
        if (
          m.x + m.width > demon.x &&
          m.x < demon.x + demon.width &&
          m.y + m.height > demon.y &&
          m.y < demon.y + demon.height
        ) {
          // Direct Hit!
          this.missiles.splice(mIdx, 1);
          this.destroyDemon(demon, i, true);
          break;
        }
      }
    }

    // Check if Wave Cleared
    if (this.demonsDefeatedThisWave >= this.totalDemonsInWave && this.demons.length === 0) {
      this.handleWaveClear();
    }
  }

  private fireLaser() {
    this.fireCooldown = 0.22;
    const laserX = this.player.x + this.player.width / 2 - 2;
    const laserY = this.player.y - 6;

    this.missiles.push({
      id: `laser-${Date.now()}-${Math.random()}`,
      x: laserX,
      y: laserY,
      vx: 0,
      vy: -560,
      width: 4,
      height: 14
    });

    demonAudio.playLaser();
  }

  private fireDemonBomb(demon: Demon) {
    // Split demons drop faster bombs
    const bombSpeed = demon.isSplitChild ? 240 : 190;
    this.bombs.push({
      id: `bomb-${Date.now()}-${Math.random()}`,
      x: demon.x + demon.width / 2 - 2,
      y: demon.y + demon.height,
      vx: 0,
      vy: bombSpeed,
      color: demon.color,
      isGuided: this.waveConfig.guidedBombs && Math.random() > 0.45,
      width: 4,
      height: 10
    });

    demonAudio.playDemonBomb();
  }

  private initiateDemonDive(demon: Demon) {
    demon.isDiving = true;
    demon.diveOriginX = demon.x;
    demon.diveOriginY = demon.y;
    demon.diveTargetX = this.player.x + (Math.random() * 40 - 20);
    demon.diveProgress = 0;
    demon.diveSpeed = 1.4 + Math.random() * 0.8;
    demonAudio.playDemonDive();
  }

  /**
   * Destroys a demon. If canSplit is true and not already a child,
   * creates 2 smaller demons flying in from left & right!
   */
  private destroyDemon(demon: Demon, demonIndex: number, awardPoints: boolean) {
    this.demons.splice(demonIndex, 1);

    // Points calculation
    let awarded = demon.points;
    if (demon.isDiving) {
      awarded = this.waveConfig.divePoints;
    } else if (demon.isSplitChild) {
      awarded = this.waveConfig.splitPoints;
    }

    if (awardPoints) {
      this.score += awarded;
      this.floatingTexts.push({
        id: `ft-${Date.now()}-${Math.random()}`,
        text: `+${awarded}`,
        x: demon.x + demon.width / 2,
        y: demon.y,
        alpha: 1.0,
        color: '#facc15',
        vy: -35
      });
    }

    this.createExplosion(demon.x + demon.width / 2, demon.y + demon.height / 2, demon.color);

    // Check for Splitting Mechanism (starting wave 5)
    if (demon.canSplit && !demon.isSplitChild) {
      demonAudio.playDemonSplit();

      // Split into TWO smaller demons! One flies left, one flies right
      const childWidth = 26;
      const childHeight = 18;
      const childBaseY = Math.min(220, demon.y + 15);

      // Left split child
      this.demons.push({
        id: `split-left-${Date.now()}-${Math.random()}`,
        type: 'split_small',
        x: Math.max(15, demon.x - 20),
        y: childBaseY,
        width: childWidth,
        height: childHeight,
        vx: -this.waveConfig.demonSpeedX * 1.25,
        vy: 0,
        baseY: childBaseY,
        color: '#38bdf8', // Electric light cyan for splitters
        wingFrame: 0,
        wingTimer: 0,
        points: this.waveConfig.splitPoints,
        canSplit: false,
        isSplitChild: true,
        splitChildSide: 'left',
        health: 1,
        fireCooldown: 0.8 + Math.random() * 1.5
      });

      // Right split child
      this.demons.push({
        id: `split-right-${Date.now()}-${Math.random()}`,
        type: 'split_small',
        x: Math.min(CANVAS_WIDTH - childWidth - 15, demon.x + 20),
        y: childBaseY,
        width: childWidth,
        height: childHeight,
        vx: this.waveConfig.demonSpeedX * 1.25,
        vy: 0,
        baseY: childBaseY,
        color: '#f472b6', // Neon pink for splitters
        wingFrame: 1,
        wingTimer: 0,
        points: this.waveConfig.splitPoints,
        canSplit: false,
        isSplitChild: true,
        splitChildSide: 'right',
        health: 1,
        fireCooldown: 1.2 + Math.random() * 1.5
      });
    } else {
      demonAudio.playDemonExplode();
      this.demonsDefeatedThisWave++;
    }

    this.notify();
  }

  private handlePlayerHit() {
    this.player.isAlive = false;
    this.lives--;
    this.gameState = 'PLAYER_HIT';
    this.playerDeathTimer = 1.8;

    this.createExplosion(this.player.x + this.player.width / 2, this.player.y + this.player.height / 2, '#38bdf8', 35);
    demonAudio.playPlayerDeath();
    this.notify();
  }

  private handleWaveClear() {
    this.gameState = 'WAVE_TRANSITION';
    this.waveTransitionTimer = 2.4;

    // Bonus bunker (life) for clearing a wave without dying, up to max 6
    if (this.lives < 6) {
      this.lives++;
      this.floatingTexts.push({
        id: `bunker-${Date.now()}`,
        text: 'EXTRA BUNKER +1!',
        x: CANVAS_WIDTH / 2,
        y: CANVAS_HEIGHT / 2 - 20,
        alpha: 1.0,
        color: '#4ade80',
        vy: -20
      });
    }

    demonAudio.playWaveClear();
    this.notify();
  }

  private startNextWave() {
    this.wave++;
    this.waveConfig = getWaveConfig(this.wave);
    this.demonsDefeatedThisWave = 0;
    this.totalDemonsInWave = 12 + Math.min(8, (this.wave - 1) * 2);
    this.missiles = [];
    this.bombs = [];
    this.gameState = 'PLAYING';

    this.spawnInitialDemons();
    this.notify();
  }

  private createExplosion(x: number, y: number, color: string, count: number = 18) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 40 + Math.random() * 130;
      this.particles.push({
        id: `p-${Date.now()}-${Math.random()}`,
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: color,
        radius: 1.5 + Math.random() * 2.5,
        alpha: 1.0,
        decay: 1.2 + Math.random() * 1.5
      });
    }
  }

  private createGroundSparks(x: number, y: number, color: string) {
    for (let i = 0; i < 4; i++) {
      this.particles.push({
        id: `spark-${Date.now()}-${Math.random()}`,
        x: x,
        y: y,
        vx: (Math.random() - 0.5) * 60,
        vy: -Math.random() * 50 - 10,
        color: color,
        radius: 1.5,
        alpha: 0.9,
        decay: 3.0
      });
    }
  }

  public submitHighScore(initials: string) {
    saveDemonHighScore({
      initials: initials.toUpperCase().slice(0, 3),
      score: this.score,
      wave: this.wave,
      date: new Date().toISOString().split('T')[0]
    });
  }

  public checkIsHighScore(): boolean {
    return isDemonHighScore(this.score);
  }
}
