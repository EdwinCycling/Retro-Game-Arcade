/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Sega OutRun (1986) - Core Engine & Pseudo-3D Road Physics
 */

import {
  RoadSegment,
  OutrunPlayer,
  TrafficCar,
  SceneryObject,
  StageId,
  STAGE_CONFIGS,
  SEGMENT_LENGTH,
  RUMBLE_LENGTH,
  MAX_SPEED_LOW,
  MAX_SPEED_HIGH,
  Gear
} from './outrunTypes';
import { outrunAudio } from './outrunAudio';

export class OutrunEngine {
  public segments: RoadSegment[] = [];
  public player: OutrunPlayer;
  public trackLength: number = 0;
  public totalSegments: number = 0;
  public timeRemaining: number = 75; // seconds
  public score: number = 0;
  public stage: number = 1;
  public currentStageId: StageId = 'coconut_beach';
  public stageName: string = 'COCONUT BEACH';
  public gameState: 'TITLE' | 'RACING' | 'STAGE_CLEAR' | 'GAMEOVER' = 'TITLE';
  public traffic: TrafficCar[] = [];
  public nextTrafficId: number = 1;
  public isNearMissAlert: boolean = false;
  public nearMissTimer: number = 0;
  public forkChosen: 'NONE' | 'LEFT' | 'RIGHT' = 'NONE';
  public checkpointPassedStage1: boolean = false;
  public checkpointPassedStage2: boolean = false;
  public startCountdown: number = 0; // 3, 2, 1, GO!
  public lapTime: number = 0; // seconds
  public stageLapTime: number = 0;

  // Input states
  public isAccelerating: boolean = false;
  public isBraking: boolean = false;
  public steerDirection: number = 0; // -1 (full left) to +1 (full right)

  constructor() {
    this.player = {
      x: 0,
      z: 0,
      speed: 0,
      maxSpeedLow: MAX_SPEED_LOW,
      maxSpeedHigh: MAX_SPEED_HIGH,
      accel: 1.35,
      braking: 3.2,
      gear: 'LOW',
      steerAngle: 0,
      isDrifting: false,
      isCrashed: false,
      crashTimer: 0,
      bounceOffset: 0,
    };

    this.buildFullTrack();
  }

  /**
   * Builds the entire multi-stage OutRun world including:
   * - Stage 1: Coconut Beach (Tropical paradise, palm trees, ocean, Start line gantry & crowd)
   * - Fork 1: At Checkpoint 1 -> Left: Gateway (Roman Aqueducts) | Right: Desert (Canyons & Cacti)
   * - Stage 2A: Gateway (Lush European hills & Aqueduct Arches)
   * - Stage 2B: Desert (Red sand & Saguaro Cacti)
   * - Fork 2: At Checkpoint 2 -> Left: Alps (Snow Mountains & Windmills) | Right: Vineyard
   * - Stage 3: Alps (Dutch stone windmills, yellow wildflowers & snow peaks)
   * - Finish Line: Goal celebration gantry & crowd!
   */
  public buildFullTrack() {
    this.segments = [];
    let currentCurve = 0;
    let currentY = 0;

    const addRoadSection = (
      numSegments: number,
      targetCurve: number,
      targetHeight: number,
      stageId: StageId,
      options?: {
        sceneryType?: SceneryObject['sprite'];
        sceneryFrequency?: number;
        scenerySides?: 'both' | 'left' | 'right';
        isFork?: boolean;
        forkProgressStart?: number;
        forkProgressEnd?: number;
        isCheckpoint?: boolean;
        isFinish?: boolean;
        checkpointLabel?: string;
        forkLeftLabel?: string;
        forkRightLabel?: string;
      }
    ) => {
      const sectionStartY = currentY;
      const sectionStartCurve = currentCurve;
      const cfg = STAGE_CONFIGS[stageId] || STAGE_CONFIGS.coconut_beach;

      for (let i = 0; i < numSegments; i++) {
        const segIdx = this.segments.length;
        const progress1 = i / numSegments;
        const progress2 = (i + 1) / numSegments;
        const ease1 = 0.5 - Math.cos(progress1 * Math.PI) / 2;
        const ease2 = 0.5 - Math.cos(progress2 * Math.PI) / 2;

        const curve = sectionStartCurve + (targetCurve - sectionStartCurve) * ease1;
        const y1 = sectionStartY + (targetHeight - sectionStartY) * ease1;
        const y2 = sectionStartY + (targetHeight - sectionStartY) * ease2;

        currentCurve = curve;
        currentY = y2;

        const isAlt = Math.floor(segIdx / RUMBLE_LENGTH) % 2 === 0;

        const segment: RoadSegment = {
          index: segIdx,
          stageId,
          p1: {
            world: { x: 0, y: y1, z: segIdx * SEGMENT_LENGTH },
            screen: { x: 0, y: 0, w: 0, scale: 0 }
          },
          p2: {
            world: { x: 0, y: y2, z: (segIdx + 1) * SEGMENT_LENGTH },
            screen: { x: 0, y: 0, w: 0, scale: 0 }
          },
          curve: curve,
          elevation: (y1 + y2) / 2,
          color: {
            road: isAlt ? cfg.roadColorDark : cfg.roadColorLight,
            grass: isAlt ? cfg.groundColorDark : cfg.groundColorLight,
            rumble: isAlt ? cfg.rumbleColorLight : cfg.rumbleColorDark,
            lane: isAlt ? '#ffffff' : 'transparent',
          },
          sprites: [],
          cars: [],
          isFork: options?.isFork,
          forkProgress: options?.isFork
            ? (options.forkProgressStart || 0) + progress1 * ((options.forkProgressEnd || 1) - (options.forkProgressStart || 0))
            : undefined,
          isCheckpoint: options?.isCheckpoint && i === Math.floor(numSegments / 2),
          isFinish: options?.isFinish && i === Math.floor(numSegments / 2),
          checkpointLabel: options?.checkpointLabel,
          forkLeftLabel: options?.forkLeftLabel,
          forkRightLabel: options?.forkRightLabel
        };

        // Scenery placement
        const freq = options?.sceneryFrequency || 4;
        if (options?.sceneryType && i % freq === 0) {
          const side = options.scenerySides === 'left' ? -1.65 : options.scenerySides === 'right' ? 1.65 : ((segIdx % 2 === 0) ? -1.65 : 1.65);
          segment.sprites.push({
            z: segment.p1.world.z,
            offset: side,
            sprite: options.sceneryType
          });
        }

        this.segments.push(segment);
      }
    };

    // ==========================================
    // STAGE 1: COCONUT BEACH (0 to 1200 segments)
    // ==========================================
    // Start grid with gantry, spectators, flag girl, camera crew
    addRoadSection(40, 0, 0, 'coconut_beach', { sceneryType: 'palm_tree', sceneryFrequency: 3 });

    // Place Start Line Scene elements
    if (this.segments[4]) {
      this.segments[4].sprites.push({ z: 4 * SEGMENT_LENGTH, offset: 0, sprite: 'start_banner' });
      this.segments[4].sprites.push({ z: 4 * SEGMENT_LENGTH, offset: -1.3, sprite: 'flag_girl' });
      this.segments[4].sprites.push({ z: 4 * SEGMENT_LENGTH, offset: 1.35, sprite: 'cameraman' });
      this.segments[4].sprites.push({ z: 4 * SEGMENT_LENGTH, offset: -2.2, sprite: 'spectator_crowd' });
      this.segments[4].sprites.push({ z: 4 * SEGMENT_LENGTH, offset: 2.2, sprite: 'spectator_crowd' });
    }
    if (this.segments[8]) {
      this.segments[8].sprites.push({ z: 8 * SEGMENT_LENGTH, offset: -2.1, sprite: 'spectator_crowd' });
      this.segments[8].sprites.push({ z: 8 * SEGMENT_LENGTH, offset: 2.1, sprite: 'spectator_crowd' });
    }

    // Rolling hills along the beach
    addRoadSection(120, 1.6, 500, 'coconut_beach', { sceneryType: 'palm_tree' });
    if (this.segments[100]) this.segments[100].sprites.push({ z: 100 * SEGMENT_LENGTH, offset: -1.8, sprite: 'billboard_sega' });

    // Ocean view sweeping left turn
    addRoadSection(150, -2.4, -300, 'coconut_beach', { sceneryType: 'palm_tree' });
    if (this.segments[220]) this.segments[220].sprites.push({ z: 220 * SEGMENT_LENGTH, offset: 1.8, sprite: 'billboard_outrun' });

    // Fast sunny straight
    addRoadSection(140, 0, 700, 'coconut_beach', { sceneryType: 'palm_tree' });

    // Downhill right curve
    addRoadSection(160, 2.3, -1100, 'coconut_beach', { sceneryType: 'palm_tree' });
    if (this.segments[500]) this.segments[500].sprites.push({ z: 500 * SEGMENT_LENGTH, offset: -1.9, sprite: 'billboard_sega' });

    // Ocean boulevard straight
    addRoadSection(180, 0, 0, 'coconut_beach', { sceneryType: 'palm_tree' });

    // S-curves through the palm grove
    addRoadSection(110, -2.5, 350, 'coconut_beach', { sceneryType: 'palm_tree' });
    addRoadSection(110, 2.4, -200, 'coconut_beach', { sceneryType: 'palm_tree' });

    // Approach to Checkpoint 1 & Fork in the Road
    addRoadSection(100, 0, 0, 'coconut_beach', { sceneryType: 'palm_tree' });

    // FORK 1 ZONE (Segments 1110 to 1200): Road widens, route gantry appears!
    addRoadSection(90, 0, 0, 'coconut_beach', {
      isFork: true,
      forkProgressStart: 0,
      forkProgressEnd: 1,
      isCheckpoint: true,
      checkpointLabel: 'CHECKPOINT 1',
      forkLeftLabel: 'GATEWAY',
      forkRightLabel: 'DESERT'
    });

    const fork1Index = 1110;
    if (this.segments[fork1Index]) {
      this.segments[fork1Index].sprites.push({ z: fork1Index * SEGMENT_LENGTH, offset: 0, sprite: 'fork_gantry' });
    }
    const check1Index = 1180;
    if (this.segments[check1Index]) {
      this.segments[check1Index].sprites.push({ z: check1Index * SEGMENT_LENGTH, offset: 0, sprite: 'checkpoint_arch' });
    }

    // =======================================================
    // STAGE 2: GATEWAY (Stone Aqueducts) (1200 to 2400)
    // =======================================================
    addRoadSection(120, -1.5, 300, 'gateway', { sceneryType: 'aqueduct_pillar', sceneryFrequency: 4 });
    if (this.segments[1260]) this.segments[1260].sprites.push({ z: 1260 * SEGMENT_LENGTH, offset: 0, sprite: 'aqueduct_arch' });

    addRoadSection(160, 2.2, 700, 'gateway', { sceneryType: 'aqueduct_pillar', sceneryFrequency: 3 });
    if (this.segments[1400]) this.segments[1400].sprites.push({ z: 1400 * SEGMENT_LENGTH, offset: 0, sprite: 'aqueduct_arch' });
    if (this.segments[1450]) this.segments[1450].sprites.push({ z: 1450 * SEGMENT_LENGTH, offset: -1.8, sprite: 'billboard_sega' });

    addRoadSection(180, -2.8, -800, 'gateway', { sceneryType: 'aqueduct_pillar', sceneryFrequency: 4 });
    if (this.segments[1600]) this.segments[1600].sprites.push({ z: 1600 * SEGMENT_LENGTH, offset: 0, sprite: 'aqueduct_arch' });

    addRoadSection(160, 1.8, 500, 'gateway', { sceneryType: 'aqueduct_pillar', sceneryFrequency: 3 });
    if (this.segments[1800]) this.segments[1800].sprites.push({ z: 1800 * SEGMENT_LENGTH, offset: 0, sprite: 'aqueduct_arch' });

    addRoadSection(180, -1.9, -400, 'gateway', { sceneryType: 'aqueduct_pillar', sceneryFrequency: 4 });

    // Straight leading to Checkpoint 2
    addRoadSection(160, 0, 0, 'gateway', { sceneryType: 'aqueduct_pillar', sceneryFrequency: 5 });

    // FORK 2 ZONE (Segments 2160 to 2260): Left -> Alps | Right -> Vineyard
    addRoadSection(100, 0, 0, 'gateway', {
      isFork: true,
      forkProgressStart: 0,
      forkProgressEnd: 1,
      isCheckpoint: true,
      checkpointLabel: 'CHECKPOINT 2',
      forkLeftLabel: 'ALPS',
      forkRightLabel: 'VINEYARD'
    });

    const fork2Index = 2170;
    if (this.segments[fork2Index]) {
      this.segments[fork2Index].sprites.push({ z: fork2Index * SEGMENT_LENGTH, offset: 0, sprite: 'fork_gantry' });
    }
    const check2Index = 2240;
    if (this.segments[check2Index]) {
      this.segments[check2Index].sprites.push({ z: check2Index * SEGMENT_LENGTH, offset: 0, sprite: 'checkpoint_arch' });
    }

    // ===========================================================
    // STAGE 3: ALPS (Snow Mountains & Windmills) (2260 to 3500)
    // ===========================================================
    addRoadSection(120, 2.0, 600, 'alps', { sceneryType: 'windmill', sceneryFrequency: 6 });
    if (this.segments[2300]) this.segments[2300].sprites.push({ z: 2300 * SEGMENT_LENGTH, offset: -1.7, sprite: 'flower_patch' });

    addRoadSection(150, -2.5, 900, 'alps', { sceneryType: 'flower_patch', sceneryFrequency: 3 });
    if (this.segments[2450]) this.segments[2450].sprites.push({ z: 2450 * SEGMENT_LENGTH, offset: 1.8, sprite: 'windmill' });

    addRoadSection(180, 2.8, -1200, 'alps', { sceneryType: 'windmill', sceneryFrequency: 5 });
    if (this.segments[2600]) this.segments[2600].sprites.push({ z: 2600 * SEGMENT_LENGTH, offset: -1.8, sprite: 'billboard_sega' });

    addRoadSection(170, -2.2, 500, 'alps', { sceneryType: 'flower_patch', sceneryFrequency: 4 });

    addRoadSection(160, 0, 0, 'alps', { sceneryType: 'windmill', sceneryFrequency: 6 });

    // Final stretch and Finish Line Gantry!
    addRoadSection(120, 0, 0, 'alps', {
      isFinish: true,
      sceneryType: 'flower_patch',
      sceneryFrequency: 4
    });

    const finishIndex = this.segments.length - 30;
    if (this.segments[finishIndex]) {
      this.segments[finishIndex].sprites.push({ z: finishIndex * SEGMENT_LENGTH, offset: 0, sprite: 'start_banner' });
      this.segments[finishIndex].sprites.push({ z: finishIndex * SEGMENT_LENGTH, offset: 0, sprite: 'podium' });
      this.segments[finishIndex].sprites.push({ z: finishIndex * SEGMENT_LENGTH, offset: -2.1, sprite: 'spectator_crowd' });
      this.segments[finishIndex].sprites.push({ z: finishIndex * SEGMENT_LENGTH, offset: 2.1, sprite: 'spectator_crowd' });
    }

    this.totalSegments = this.segments.length;
    this.trackLength = this.totalSegments * SEGMENT_LENGTH;

    this.spawnTraffic();
  }

  // Populate realistic cruising traffic cars
  private spawnTraffic() {
    this.traffic = [];
    const carTypes: TrafficCar['type'][] = ['bug', 'porsche', 'pickup', 'truck'];
    const colors = ['#f4d03f', '#3498db', '#e74c3c', '#9b59b6', '#1abc9c', '#e67e22', '#ecf0f1'];

    // Spawn 32 cars spread along the track
    for (let i = 0; i < 32; i++) {
      const z = 7000 + i * (this.trackLength / 35) + (Math.random() * 1500);
      const lane = (Math.floor(Math.random() * 3) - 1) * 0.52; // -0.52, 0, +0.52
      const type = carTypes[Math.floor(Math.random() * carTypes.length)];
      const speed = type === 'truck' ? 95 : type === 'bug' ? 115 : type === 'pickup' ? 135 : 170;

      this.traffic.push({
        id: this.nextTrafficId++,
        z: z % this.trackLength,
        offset: lane,
        speed,
        type,
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    }
  }

  public findSegment(z: number): RoadSegment {
    const idx = Math.floor(z / SEGMENT_LENGTH) % this.totalSegments;
    return this.segments[idx < 0 ? idx + this.totalSegments : idx];
  }

  public startNewGame() {
    this.player = {
      x: 0,
      z: 0,
      speed: 0,
      maxSpeedLow: MAX_SPEED_LOW,
      maxSpeedHigh: MAX_SPEED_HIGH,
      accel: 1.35,
      braking: 3.2,
      gear: 'LOW',
      steerAngle: 0,
      isDrifting: false,
      isCrashed: false,
      crashTimer: 0,
      bounceOffset: 0,
    };
    this.timeRemaining = 75;
    this.score = 0;
    this.stage = 1;
    this.currentStageId = 'coconut_beach';
    this.stageName = 'COCONUT BEACH';
    this.forkChosen = 'NONE';
    this.checkpointPassedStage1 = false;
    this.checkpointPassedStage2 = false;
    this.gameState = 'RACING';
    this.startCountdown = 3.5; // 3, 2, 1, GO! sequence
    this.lapTime = 0;
    this.stageLapTime = 0;
    this.spawnTraffic();
    outrunAudio.startMusic();
    outrunAudio.playCountdownBeep(false);
  }

  public toggleGear() {
    const nextGear: Gear = this.player.gear === 'LOW' ? 'HIGH' : 'LOW';
    this.player.gear = nextGear;
    outrunAudio.playGearShift();
  }

  public setGear(gear: Gear) {
    if (this.player.gear !== gear) {
      this.player.gear = gear;
      outrunAudio.playGearShift();
    }
  }

  public update(dt: number) {
    if (this.gameState !== 'RACING') return;

    // Handle Start Countdown (3, 2, 1, GO!)
    if (this.startCountdown > 0) {
      const prevInt = Math.ceil(this.startCountdown);
      this.startCountdown -= dt;
      const nextInt = Math.ceil(this.startCountdown);

      if (prevInt !== nextInt) {
        if (nextInt >= 1) {
          outrunAudio.playCountdownBeep(false);
        } else if (nextInt === 0) {
          outrunAudio.playCountdownBeep(true);
        }
      }

      if (this.startCountdown > 0) {
        if (this.isAccelerating) {
          this.player.speed = Math.min(30, this.player.speed + 35 * dt);
        } else {
          this.player.speed = Math.max(0, this.player.speed - 20 * dt);
        }
        outrunAudio.updateEngine(0.3, false, this.player.gear);
        return;
      }
    }

    // Track lap time
    this.lapTime += dt;
    this.stageLapTime += dt;

    // Timer countdown
    this.timeRemaining -= dt;
    if (this.timeRemaining <= 0) {
      this.timeRemaining = 0;
      this.gameState = 'GAMEOVER';
      outrunAudio.stopMusic();
      outrunAudio.stopEngine();
      return;
    }

    if (this.nearMissTimer > 0) {
      this.nearMissTimer -= dt;
      if (this.nearMissTimer <= 0) {
        this.isNearMissAlert = false;
      }
    }

    // Handle crashed state
    if (this.player.isCrashed) {
      this.player.crashTimer -= dt;
      this.player.speed = Math.max(0, this.player.speed - 320 * dt);
      this.player.steerAngle += 15 * dt;

      if (this.player.crashTimer <= 0) {
        this.player.isCrashed = false;
        this.player.x = 0; // Return to track center
        this.player.speed = 35;
      }
      outrunAudio.updateEngine(this.player.speed / MAX_SPEED_HIGH, false, this.player.gear);
      return;
    }

    // Max speed based on gear
    const currentMaxSpeed = this.player.gear === 'LOW' ? this.player.maxSpeedLow : this.player.maxSpeedHigh;

    // Acceleration & Braking
    if (this.isAccelerating) {
      if (this.player.speed < currentMaxSpeed) {
        this.player.speed += this.player.accel * (1 - this.player.speed / currentMaxSpeed) * 125 * dt;
      } else {
        // Slow down slightly if above current gear max
        this.player.speed = Math.max(currentMaxSpeed, this.player.speed - 90 * dt);
      }
    } else {
      // Natural rolling friction
      this.player.speed = Math.max(0, this.player.speed - 48 * dt);
    }

    if (this.isBraking) {
      this.player.speed = Math.max(0, this.player.speed - this.player.braking * 150 * dt);
    }

    // Off-road penalty
    const isOffRoad = Math.abs(this.player.x) > 1.05;
    if (isOffRoad) {
      this.player.speed = Math.max(0, this.player.speed - 130 * dt);
      this.player.bounceOffset = Math.sin(Date.now() / 30) * (this.player.speed / 45);
      if (this.player.speed > 80 && Math.random() < 0.12) {
        outrunAudio.playScreech();
      }
    } else {
      this.player.bounceOffset = 0;
    }

    // Steering and Centrifugal Force
    const speedRatio = this.player.speed / MAX_SPEED_HIGH;
    const currentSegIdx = Math.floor(this.player.z / SEGMENT_LENGTH) % this.totalSegments;
    const currentSegment = this.segments[currentSegIdx];

    // Current stage from segment
    if (currentSegment && currentSegment.stageId) {
      this.currentStageId = currentSegment.stageId;
    }

    // Centrifugal curve pull (pulls outward during turns)
    if (currentSegment) {
      this.player.x -= (currentSegment.curve * speedRatio * 1.35) * dt;
    }

    // Player steering
    if (this.steerDirection !== 0) {
      this.player.x += (this.steerDirection * 1.75 * (0.35 + 0.65 * speedRatio)) * dt;
      this.player.steerAngle = this.steerDirection;

      // Drift check at high speed
      if (this.player.speed > 195 && Math.abs(this.steerDirection) > 0.55) {
        this.player.isDrifting = true;
        if (Math.random() < 0.18) outrunAudio.playScreech();
      } else {
        this.player.isDrifting = false;
      }
    } else {
      this.player.steerAngle = 0;
      this.player.isDrifting = false;
    }

    // Clamp player within road limits + road shoulder
    this.player.x = Math.max(-2.2, Math.min(2.2, this.player.x));

    // Advance player position along track
    this.player.z += this.player.speed * 60 * dt;
    if (this.player.z >= this.trackLength) {
      this.player.z -= this.trackLength;
      this.gameState = 'STAGE_CLEAR';
      outrunAudio.playCheckpoint();
      return;
    }

    // Update score based on speed
    this.score += Math.floor(this.player.speed * 8 * dt);

    // Update traffic cars
    this.updateTraffic(dt, currentSegIdx);

    // ==========================================
    // CHECKPOINTS & BRANCHING FORK DETECTION
    // ==========================================
    // Checkpoint 1 (End of Stage 1 ~ segment 1180)
    if (currentSegIdx >= 1175 && currentSegIdx <= 1195 && !this.checkpointPassedStage1) {
      this.checkpointPassedStage1 = true;
      this.timeRemaining += 45;
      this.stage = 2;
      this.score += 100000;
      outrunAudio.playCheckpoint();

      // Branching route decision based on player's lateral road position
      if (this.player.x < 0) {
        this.forkChosen = 'LEFT';
        this.stageName = 'GATEWAY';
        this.currentStageId = 'gateway';
      } else {
        this.forkChosen = 'RIGHT';
        this.stageName = 'DESERT';
        this.currentStageId = 'desert';
      }
    }

    // Checkpoint 2 (End of Stage 2 ~ segment 2235)
    if (currentSegIdx >= 2230 && currentSegIdx <= 2250 && !this.checkpointPassedStage2) {
      this.checkpointPassedStage2 = true;
      this.timeRemaining += 45;
      this.stage = 3;
      this.score += 150000;
      outrunAudio.playCheckpoint();

      if (this.player.x < 0) {
        this.stageName = 'ALPS';
        this.currentStageId = 'alps';
      } else {
        this.stageName = 'VINEYARD';
        this.currentStageId = 'vineyard';
      }
    }

    // Audio update
    outrunAudio.updateEngine(speedRatio, this.isAccelerating, this.player.gear);
  }

  // Update AI traffic along road
  private updateTraffic(dt: number, currentSegIdx: number) {
    for (const car of this.traffic) {
      // Advance AI car along track
      car.z += car.speed * 60 * dt;
      if (car.z >= this.trackLength) {
        car.z -= this.trackLength;
      }

      // Check collision with player
      const dz = car.z - this.player.z;
      const wrappedDz = dz < -this.trackLength / 2 ? dz + this.trackLength : (dz > this.trackLength / 2 ? dz - this.trackLength : dz);

      if (Math.abs(wrappedDz) < 160) {
        const dx = car.offset - this.player.x;

        // Collision box
        if (Math.abs(dx) < 0.42) {
          this.player.isCrashed = true;
          this.player.crashTimer = 1.4;
          this.player.isDrifting = true;
          outrunAudio.playCrash();
        } else if (Math.abs(dx) < 0.75 && this.player.speed > 180 && !this.isNearMissAlert) {
          // Near miss bonus!
          this.isNearMissAlert = true;
          this.nearMissTimer = 1.2;
          this.score += 10000;
        }
      }
    }
  }
}
