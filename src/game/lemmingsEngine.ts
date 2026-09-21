/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Lemmings (1991 DMA Design / Psygnosis) - Core Game Engine
 */

import {
  Lemming,
  LemmingAction,
  LemmingSkill,
  LemmingsLevel,
  GameStats,
  Particle,
  FloatingText,
  SkillInventory
} from './lemmingsTypes';
import { LEMMINGS_LEVELS } from './lemmingsLevels';
import { LemmingsTerrain } from './lemmingsTerrain';
import { lemmingsAudio } from './lemmingsAudio';

export class LemmingsEngine {
  public terrain: LemmingsTerrain;
  public currentLevel: LemmingsLevel;
  public lemmings: Lemming[] = [];
  public particles: Particle[] = [];
  public floatingTexts: FloatingText[] = [];

  // Game Stats
  public stats: GameStats;

  // Timers & counters
  private nextLemmingId: number = 1;
  private spawnTicker: number = 0;
  private gameTicks: number = 0;
  private trapdoorOpenAnim: number = 0; // 0 to 100
  public trapdoorOpened: boolean = false;

  // Selected cursor & lemming hover
  public hoveredLemmingId: number | null = null;
  public cursorWorldX: number = 0;
  public cursorWorldY: number = 0;

  constructor(levelIndex: number = 0) {
    this.currentLevel = LEMMINGS_LEVELS[levelIndex] || LEMMINGS_LEVELS[0];
    this.terrain = new LemmingsTerrain(this.currentLevel.width, this.currentLevel.height);
    this.stats = this.createInitialStats(this.currentLevel);
    this.initLevel(this.currentLevel);
  }

  private createInitialStats(level: LemmingsLevel): GameStats {
    return {
      level,
      state: 'INTRO',
      lemmingsOut: 0,
      lemmingsIn: 0,
      lemmingsAlive: 0,
      lemmingsDead: 0,
      timeRemaining: level.timeLimit,
      releaseRate: level.releaseRate,
      minReleaseRate: level.releaseRate,
      activeSkill: 'digger',
      skills: { ...level.skills },
      fastForward: false,
      speedMultiplier: 1,
      nukeActive: false,
      score: 0,
      viewportX: Math.max(0, level.spawnX - 250),
      viewportY: 0
    };
  }

  public loadLevel(levelIndex: number) {
    this.currentLevel = LEMMINGS_LEVELS[levelIndex] || LEMMINGS_LEVELS[0];
    this.initLevel(this.currentLevel);
  }

  public initLevel(level: LemmingsLevel) {
    this.currentLevel = level;
    this.terrain.initLevel(level);
    this.lemmings = [];
    this.particles = [];
    this.floatingTexts = [];
    this.nextLemmingId = 1;
    this.spawnTicker = 0;
    this.gameTicks = 0;
    this.trapdoorOpenAnim = 0;
    this.trapdoorOpened = false;

    this.stats = this.createInitialStats(level);
    this.stats.state = 'PLAYING';

    lemmingsAudio.playLetsGo();
  }

  public setReleaseRate(rate: number) {
    this.stats.releaseRate = Math.max(this.stats.minReleaseRate, Math.min(99, rate));
  }

  public setActiveSkill(skill: LemmingSkill | null) {
    this.stats.activeSkill = skill;
    lemmingsAudio.playSelectSkill();
  }

  public togglePause() {
    if (this.stats.state === 'PLAYING') {
      this.stats.state = 'PAUSED';
      lemmingsAudio.stopMusic();
    } else if (this.stats.state === 'PAUSED') {
      this.stats.state = 'PLAYING';
      lemmingsAudio.startMusic();
    }
  }

  public toggleFastForward() {
    this.stats.fastForward = !this.stats.fastForward;
    this.stats.speedMultiplier = this.stats.fastForward ? 3 : 1;
  }

  // Trigger Armageddon / Nuke on all active lemmings!
  public triggerNuke() {
    if (this.stats.nukeActive) return;
    this.stats.nukeActive = true;
    lemmingsAudio.playNukeSiren();

    let delay = 0;
    for (const lem of this.lemmings) {
      if (lem.action !== 'dead' && lem.action !== 'exiter' && lem.action !== 'splatter') {
        setTimeout(() => {
          if (lem.action !== 'dead' && lem.action !== 'exiter') {
            this.assignSkill(lem.id, 'bomber', true);
          }
        }, delay);
        delay += 180;
      }
    }
  }

  // Assign skill to lemming under cursor
  public assignSkill(lemmingId: number, skill: LemmingSkill, isFree: boolean = false): boolean {
    const lem = this.lemmings.find((l) => l.id === lemmingId);
    if (!lem || lem.action === 'dead' || lem.action === 'exiter' || lem.action === 'splatter') {
      return false;
    }

    if (!isFree && (this.stats.skills[skill] <= 0)) {
      return false;
    }

    let applied = false;

    switch (skill) {
      case 'climber':
        if (!lem.isClimber) {
          lem.isClimber = true;
          lem.isPermanentClimber = true;
          applied = true;
          this.addFloatingText(lem.x, lem.y - 10, 'CLIMBER', '#22c55e');
        }
        break;

      case 'floater':
        if (!lem.isFloater) {
          lem.isFloater = true;
          lem.isPermanentFloater = true;
          applied = true;
          this.addFloatingText(lem.x, lem.y - 10, 'FLOATER', '#06b6d4');
        }
        break;

      case 'bomber':
        if (lem.bombCountdown === null) {
          lem.bombCountdown = 5;
          lem.bombTimer = 0;
          applied = true;
          lemmingsAudio.playOhNo();
          this.addFloatingText(lem.x, lem.y - 12, '5', '#ef4444');
        }
        break;

      case 'blocker':
        if (lem.action === 'walker') {
          lem.action = 'blocker';
          lem.vx = 0;
          lem.vy = 0;
          applied = true;
          this.addFloatingText(lem.x, lem.y - 10, 'STOP', '#f43f5e');
        }
        break;

      case 'builder':
        if (lem.action === 'walker') {
          lem.action = 'builder';
          lem.builderBricks = 0;
          lem.builderDelay = 0;
          applied = true;
          this.addFloatingText(lem.x, lem.y - 10, 'BUILD', '#f59e0b');
        }
        break;

      case 'basher':
        if (lem.action === 'walker') {
          // Check if there is solid terrain in front
          if (this.terrain.isSolid(lem.x + lem.direction * 4, lem.y - 4)) {
            lem.action = 'basher';
            lem.bashDelay = 0;
            applied = true;
            this.addFloatingText(lem.x, lem.y - 10, 'BASH', '#a855f7');
          }
        }
        break;

      case 'miner':
        if (lem.action === 'walker') {
          lem.action = 'miner';
          lem.mineDelay = 0;
          applied = true;
          this.addFloatingText(lem.x, lem.y - 10, 'MINE', '#3b82f6');
        }
        break;

      case 'digger':
        if (lem.action === 'walker') {
          if (this.terrain.isSolid(lem.x, lem.y + 2)) {
            lem.action = 'digger';
            lem.digDelay = 0;
            applied = true;
            this.addFloatingText(lem.x, lem.y - 10, 'DIG', '#ec4899');
          }
        }
        break;
    }

    if (applied && !isFree) {
      this.stats.skills[skill]--;
      lemmingsAudio.playSelectSkill();
    }

    return applied;
  }

  // Update loop
  public update(dt: number = 1 / 60) {
    if (this.stats.state !== 'PLAYING') return;

    const iterations = this.stats.speedMultiplier;
    for (let i = 0; i < iterations; i++) {
      this.tick();
    }
  }

  private tick() {
    this.gameTicks++;

    // 1. Trapdoor animation & Spawning
    if (this.trapdoorOpenAnim < 100) {
      this.trapdoorOpenAnim += 2;
      if (this.trapdoorOpenAnim >= 100) {
        this.trapdoorOpened = true;
      }
    }

    if (this.trapdoorOpened && this.stats.lemmingsOut < this.currentLevel.lemmingCount) {
      this.spawnTicker++;
      // Spawn interval based on release rate (1 to 99)
      const spawnInterval = Math.max(12, Math.floor(110 - this.stats.releaseRate));
      if (this.spawnTicker >= spawnInterval) {
        this.spawnTicker = 0;
        this.spawnLemming();
      }
    }

    // 2. Update all active Lemmings
    let activeAliveCount = 0;

    for (const lem of this.lemmings) {
      if (lem.action === 'dead') continue;

      if (lem.action !== 'exiter' && lem.action !== 'splatter') {
        activeAliveCount++;
      }

      this.updateLemming(lem);
    }

    this.stats.lemmingsAlive = activeAliveCount;

    // 3. Update Particles & Floating Text
    this.updateParticles();
    this.updateFloatingTexts();

    // 4. Timer update (every 60 ticks = 1 second)
    if (this.gameTicks % 60 === 0 && this.stats.timeRemaining > 0) {
      this.stats.timeRemaining--;
      if (this.stats.timeRemaining <= 0) {
        this.evaluateOutcome();
      }
    }

    // 5. Check if level is finished
    if (
      this.stats.lemmingsOut >= this.currentLevel.lemmingCount &&
      this.stats.lemmingsAlive === 0
    ) {
      this.evaluateOutcome();
    }
  }

  private spawnLemming() {
    const lem: Lemming = {
      id: this.nextLemmingId++,
      x: this.currentLevel.spawnX,
      y: this.currentLevel.spawnY,
      vx: 0,
      vy: 0.5,
      direction: 1,
      action: 'faller',
      isClimber: false,
      isFloater: false,
      isPermanentClimber: false,
      isPermanentFloater: false,
      fallDistance: 0,
      bombCountdown: null,
      bombTimer: 0,
      builderBricks: 0,
      builderDelay: 0,
      digDelay: 0,
      bashDelay: 0,
      mineDelay: 0,
      climbProgress: 0,
      frame: 0,
      animTimer: 0,
      selected: false,
      splatTimer: 0,
      exitTimer: 0
    };

    this.lemmings.push(lem);
    this.stats.lemmingsOut++;
  }

  private updateLemming(lem: Lemming) {
    lem.animTimer++;
    if (lem.animTimer >= 5) {
      lem.animTimer = 0;
      lem.frame = (lem.frame + 1) % 8;
    }

    // Handle Bomber countdown
    if (lem.bombCountdown !== null && lem.action !== 'splatter' && lem.action !== 'exiter') {
      lem.bombTimer++;
      if (lem.bombTimer >= 60) {
        lem.bombTimer = 0;
        lem.bombCountdown--;
        if (lem.bombCountdown > 0) {
          this.addFloatingText(lem.x, lem.y - 12, `${lem.bombCountdown}`, '#ef4444');
        } else if (lem.bombCountdown === 0) {
          this.addFloatingText(lem.x, lem.y - 14, 'OH NO!', '#facc15');
          lemmingsAudio.playOhNo();
        } else {
          // Detonate!
          this.explodeLemming(lem);
          return;
        }
      }
    }

    // Check bottom death / hazard
    const hazardY = this.currentLevel.hazardY || this.currentLevel.height - 8;
    if (lem.y >= hazardY) {
      this.killLemming(lem, 'drowner');
      return;
    }

    // State Machine
    switch (lem.action) {
      case 'faller':
        this.updateFaller(lem);
        break;

      case 'floater':
        this.updateFloater(lem);
        break;

      case 'walker':
        this.updateWalker(lem);
        break;

      case 'climber':
        this.updateClimber(lem);
        break;

      case 'blocker':
        this.updateBlocker(lem);
        break;

      case 'builder':
        this.updateBuilder(lem);
        break;

      case 'basher':
        this.updateBasher(lem);
        break;

      case 'miner':
        this.updateMiner(lem);
        break;

      case 'digger':
        this.updateDigger(lem);
        break;

      case 'splatter':
        lem.splatTimer++;
        if (lem.splatTimer >= 40) {
          lem.action = 'dead';
          this.stats.lemmingsDead++;
        }
        break;

      case 'exiter':
        lem.exitTimer++;
        if (lem.exitTimer >= 30) {
          lem.action = 'dead';
          this.stats.lemmingsIn++;
          this.stats.score += 150;
        }
        break;
    }

    // Check Exit Portal Proximity
    if (lem.action === 'walker' || lem.action === 'faller' || lem.action === 'builder') {
      const dx = Math.abs(lem.x - this.currentLevel.exitX);
      const dy = Math.abs(lem.y - this.currentLevel.exitY);
      if (dx < 10 && dy < 14) {
        lem.action = 'exiter';
        lem.exitTimer = 0;
        lemmingsAudio.playYippee();
        this.addFloatingText(lem.x, lem.y - 15, 'YIPPEE!', '#facc15');
      }
    }
  }

  // --- Lemming Actions ---

  private updateFaller(lem: Lemming) {
    lem.vy = Math.min(3.5, lem.vy + 0.25);
    lem.y += lem.vy;
    lem.fallDistance += lem.vy;

    // Check if Floater can deploy umbrella
    if (lem.isFloater && lem.fallDistance > 16) {
      lem.action = 'floater';
      lem.vy = 0.8;
      lemmingsAudio.playPop();
      return;
    }

    // Check Ground Collision
    if (this.terrain.isSolid(lem.x, lem.y)) {
      // Find exact surface
      while (this.terrain.isSolid(lem.x, lem.y) && lem.y > 0) {
        lem.y -= 1;
      }
      lem.y += 1;

      // Check splat fall distance threshold (> 64px)
      if (lem.fallDistance > 65 && !lem.isFloater) {
        lem.action = 'splatter';
        lem.splatTimer = 0;
        lemmingsAudio.playSplat();
        this.spawnSplatParticles(lem.x, lem.y);
      } else {
        lem.action = 'walker';
        lem.fallDistance = 0;
        lem.vy = 0;
      }
    }
  }

  private updateFloater(lem: Lemming) {
    lem.vy = 0.8; // Gentle floating descent
    lem.y += lem.vy;

    if (this.terrain.isSolid(lem.x, lem.y)) {
      while (this.terrain.isSolid(lem.x, lem.y) && lem.y > 0) {
        lem.y -= 1;
      }
      lem.y += 1;
      lem.action = 'walker';
      lem.fallDistance = 0;
      lem.vy = 0;
    }
  }

  private updateWalker(lem: Lemming) {
    // Check if ground beneath opened up (fall into pit/tunnel)
    if (!this.terrain.isSolid(lem.x, lem.y + 1) && !this.terrain.isSolid(lem.x, lem.y + 2)) {
      lem.action = 'faller';
      lem.vy = 0.5;
      lem.fallDistance = 0;
      return;
    }

    // Step climbing up slopes (up to 3 pixels high)
    const targetX = lem.x + lem.direction * 0.7;
    let groundY = lem.y;

    // Search up to 4px up or 4px down for walking contour
    let foundWalkable = false;
    for (let dy = -3; dy <= 3; dy++) {
      const testY = groundY + dy;
      if (this.terrain.isSolid(targetX, testY) && !this.terrain.isSolid(targetX, testY - 1)) {
        lem.x = targetX;
        lem.y = testY - 1;
        foundWalkable = true;
        break;
      }
    }

    if (foundWalkable) {
      // Check collision with any Blockers
      if (this.checkBlockerCollision(lem)) {
        lem.direction = (lem.direction === 1 ? -1 : 1);
      }
      return;
    }

    // If wall in front is taller than 3px
    if (this.terrain.isSolid(targetX, groundY - 2)) {
      if (lem.isClimber) {
        lem.action = 'climber';
        lem.climbProgress = 0;
      } else {
        lem.direction = (lem.direction === 1 ? -1 : 1);
      }
    } else {
      lem.x = targetX;
    }

    // Check collision with Blockers
    if (this.checkBlockerCollision(lem)) {
      lem.direction = (lem.direction === 1 ? -1 : 1);
    }
  }

  private updateClimber(lem: Lemming) {
    lem.y -= 0.6; // Climb upwards

    // Check if hitting ceiling above
    if (this.terrain.isSolid(lem.x, lem.y - 8)) {
      // Hits ceiling -> falls
      lem.action = 'faller';
      lem.direction = (lem.direction === 1 ? -1 : 1);
      lem.vy = 0.5;
      lem.fallDistance = 0;
      return;
    }

    // Check if reached top of the wall (ledge clamber)
    const wallAhead = this.terrain.isSolid(lem.x + lem.direction * 3, lem.y - 2);
    if (!wallAhead) {
      // Vault onto ledge
      lem.x += lem.direction * 4;
      lem.action = 'walker';
      lem.vy = 0;
    }
  }

  private updateBlocker(lem: Lemming) {
    // Blocker stands firm unless the ground underneath is destroyed
    if (!this.terrain.isSolid(lem.x, lem.y + 1) && !this.terrain.isSolid(lem.x, lem.y + 3)) {
      lem.action = 'faller';
      lem.vy = 0.5;
      lem.fallDistance = 0;
    }
  }

  private updateBuilder(lem: Lemming) {
    lem.builderDelay++;
    if (lem.builderDelay >= 16) {
      lem.builderDelay = 0;

      // Place brick step
      const brickX = lem.x + lem.direction * 2;
      const brickY = lem.y;

      // Check if hitting a solid wall/ceiling ahead
      if (this.terrain.isSolid(brickX + lem.direction * 2, brickY - 4)) {
        // Shrug and turn around
        lem.action = 'walker';
        lem.direction = (lem.direction === 1 ? -1 : 1);
        return;
      }

      this.terrain.placeBuilderBrick(brickX, brickY, lem.direction);
      lem.builderBricks++;

      // Warning chink sound on steps 10, 11, 12!
      const isWarning = lem.builderBricks >= 10;
      lemmingsAudio.playChink(isWarning);

      // Step lemming onto the new brick
      lem.x = brickX + lem.direction * 2;
      lem.y = brickY - 2;

      // Max 12 bricks per builder
      if (lem.builderBricks >= 12) {
        lem.action = 'walker';
      }
    }
  }

  private updateBasher(lem: Lemming) {
    lem.bashDelay++;
    if (lem.bashDelay >= 8) {
      lem.bashDelay = 0;

      // Carve tunnel in direction
      const success = this.terrain.carveBasher(lem.x, lem.y, lem.direction);
      if (!success) {
        // Hit indestructible steel!
        this.spawnSparks(lem.x + lem.direction * 4, lem.y - 6);
        lem.action = 'walker';
        lem.direction = (lem.direction === 1 ? -1 : 1);
        return;
      }

      lemmingsAudio.playTink();
      this.spawnDigDust(lem.x + lem.direction * 3, lem.y - 4);
      lem.x += lem.direction * 2;

      // Check if open air reached in front (finished digging through)
      const isStillSolidAhead = this.terrain.isSolid(lem.x + lem.direction * 4, lem.y - 6);
      if (!isStillSolidAhead) {
        lem.action = 'walker';
      }
    }
  }

  private updateMiner(lem: Lemming) {
    lem.mineDelay++;
    if (lem.mineDelay >= 10) {
      lem.mineDelay = 0;

      const success = this.terrain.carveMiner(lem.x, lem.y, lem.direction);
      if (!success) {
        this.spawnSparks(lem.x + lem.direction * 4, lem.y + 2);
        lem.action = 'walker';
        lem.direction = (lem.direction === 1 ? -1 : 1);
        return;
      }

      lemmingsAudio.playTink();
      this.spawnDigDust(lem.x + lem.direction * 3, lem.y);
      lem.x += lem.direction * 2;
      lem.y += 2;

      // Check if open air below reached
      if (!this.terrain.isSolid(lem.x, lem.y + 2)) {
        lem.action = 'faller';
      }
    }
  }

  private updateDigger(lem: Lemming) {
    lem.digDelay++;
    if (lem.digDelay >= 8) {
      lem.digDelay = 0;

      const success = this.terrain.carveDigger(lem.x, lem.y);
      if (!success) {
        // Hit indestructible steel beneath!
        this.spawnSparks(lem.x, lem.y + 3);
        lem.action = 'walker';
        return;
      }

      lemmingsAudio.playTink();
      this.spawnDigDust(lem.x, lem.y + 2);
      lem.y += 2;

      // Check if open air underneath is reached
      if (!this.terrain.isSolid(lem.x, lem.y + 2)) {
        lem.action = 'faller';
      }
    }
  }

  private checkBlockerCollision(lem: Lemming): boolean {
    for (const other of this.lemmings) {
      if (other.id !== lem.id && other.action === 'blocker') {
        const dx = Math.abs(lem.x - other.x);
        const dy = Math.abs(lem.y - other.y);
        if (dx < 7 && dy < 10) {
          // If walking towards blocker, bounce
          if ((lem.direction === 1 && lem.x < other.x) || (lem.direction === -1 && lem.x > other.x)) {
            return true;
          }
        }
      }
    }
    return false;
  }

  private explodeLemming(lem: Lemming) {
    lem.action = 'dead';
    this.stats.lemmingsDead++;
    lemmingsAudio.playBoom();

    // Carve terrain crater
    this.terrain.carveCircle(lem.x, lem.y - 4, 15);

    // Spawn explosion fireworks
    for (let i = 0; i < 28; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1 + Math.random() * 4;
      const colors = ['#f59e0b', '#ef4444', '#facc15', '#22c55e', '#3b82f6'];
      this.particles.push({
        x: lem.x,
        y: lem.y - 4,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 2 + Math.random() * 3,
        life: 0,
        maxLife: 30 + Math.random() * 20,
        gravity: 0.1
      });
    }
  }

  private killLemming(lem: Lemming, reason: LemmingAction) {
    lem.action = 'dead';
    this.stats.lemmingsDead++;
    if (reason === 'drowner') {
      lemmingsAudio.playSplat();
    }
  }

  private spawnSplatParticles(x: number, y: number) {
    for (let i = 0; i < 14; i++) {
      const angle = Math.random() * Math.PI;
      const speed = 0.5 + Math.random() * 2;
      this.particles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 3,
        vy: -Math.sin(angle) * speed,
        color: Math.random() < 0.5 ? '#22c55e' : '#3b82f6',
        size: 2,
        life: 0,
        maxLife: 25,
        gravity: 0.15
      });
    }
  }

  private spawnDigDust(x: number, y: number) {
    for (let i = 0; i < 3; i++) {
      this.particles.push({
        x: x + (Math.random() - 0.5) * 6,
        y,
        vx: (Math.random() - 0.5) * 1.5,
        vy: -0.5 - Math.random() * 1,
        color: '#78350f',
        size: 2,
        life: 0,
        maxLife: 15,
        gravity: 0.05
      });
    }
  }

  private spawnSparks(x: number, y: number) {
    for (let i = 0; i < 6; i++) {
      this.particles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 4,
        vy: -Math.random() * 3,
        color: '#facc15',
        size: 1.5,
        life: 0,
        maxLife: 15,
        gravity: 0.1
      });
    }
  }

  private addFloatingText(x: number, y: number, text: string, color: string) {
    this.floatingTexts.push({
      id: Date.now() + Math.random(),
      x,
      y,
      text,
      color,
      life: 0,
      maxLife: 45,
      vy: -0.4
    });
  }

  private updateParticles() {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      if (p.gravity) p.vy += p.gravity;
      p.life++;
      if (p.life >= p.maxLife) {
        this.particles.splice(i, 1);
      }
    }
  }

  private updateFloatingTexts() {
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const t = this.floatingTexts[i];
      t.y += t.vy;
      t.life++;
      if (t.life >= t.maxLife) {
        this.floatingTexts.splice(i, 1);
      }
    }
  }

  private evaluateOutcome() {
    const savedPercent = this.stats.lemmingsOut > 0
      ? Math.round((this.stats.lemmingsIn / this.currentLevel.lemmingCount) * 100)
      : 0;

    if (savedPercent >= this.currentLevel.toSave) {
      this.stats.state = 'WON';
      this.stats.score += savedPercent * 50 + this.stats.timeRemaining * 10;
    } else {
      this.stats.state = 'LOST';
    }
    lemmingsAudio.stopMusic();
  }

  // Find closest candidate lemming near cursor coordinates
  public findLemmingAt(worldX: number, worldY: number): Lemming | null {
    let closest: Lemming | null = null;
    let minDist = 18;

    for (const lem of this.lemmings) {
      if (lem.action === 'dead' || lem.action === 'exiter' || lem.action === 'splatter') continue;
      const dist = Math.hypot(lem.x - worldX, (lem.y - 5) - worldY);
      if (dist < minDist) {
        minDist = dist;
        closest = lem;
      }
    }
    return closest;
  }
}
