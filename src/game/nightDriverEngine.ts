/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Night Driver (Bill Budge / Apple II, 1980 / 1983)
 * Authentic 60 FPS First-Person Pseudo-3D Road Engine
 * Clean-room re-engineered with stable road curvature and pixel-accurate collision physics
 */

import { nightDriverAudio } from './nightDriverAudio';

export interface PylonPair {
  z: number; // Distance ahead (20 = at front bumper, 850 = horizon)
  hasTreeLeft?: boolean;
  hasTreeRight?: boolean;
}

export interface OncomingCar {
  z: number;
  laneOffset: number; // -0.6 to 0.6 relative to road center
  speed: number;
  color: 'yellow' | 'red' | 'blue';
}

export type MonitorMode = 'green' | 'color';
export type TrackDifficulty = 'novice' | 'pro' | 'expert';

export class NightDriverEngine {
  // Road & Perspective Constants
  public static readonly HORIZON_Y = 88; // In Apple II 280x192 coordinates
  public static readonly NUM_PYLONS = 18; // Number of visible pylon pairs
  public static readonly PYLON_SPACING = 45; // Spacing along track depth
  public static readonly Z_NEAR = 25;
  public static readonly Z_FAR = 825;

  // Car Physics State
  public speed: number = 0; // Current speed in MPH (0 - 195)
  public targetSpeed: number = 0;
  public gear: number = 1; // 1 to 4
  public isAutomatic: boolean = false;
  public rpm: number = 1000;
  public carX: number = 0; // Lateral position (-1.0 = left pylon, 0.0 = center, +1.0 = right pylon)
  public steerAngle: number = 0; // Current steering turn rate (-1.0 to 1.0)
  public distanceTraveled: number = 0; // In miles

  // Track Curvature & Geometry
  public currentCurve: number = 0; // Current rendered road curvature (-1.0 to 1.0)
  public targetCurve: number = 0; // Approaching curve target
  public curveTimer: number = 0;
  public trackDifficulty: TrackDifficulty = 'novice';

  // Game Progress & Scoring
  public score: number = 0;
  public highScore: number = 0;
  public timeLeft: number = 90; // 90 seconds round
  public isGameOver: boolean = false;
  public isPaused: boolean = false;
  public isCrashed: boolean = false;
  public crashTimer: number = 0;
  public crashes: number = 0;
  public isOnShoulder: boolean = false;

  // Dynamic Entities
  public pylons: PylonPair[] = [];
  public oncomingCars: OncomingCar[] = [];
  public lastPylonSfxZ: number = 0;

  // Controls input states
  public inputGas: boolean = false;
  public inputBrake: boolean = false;
  public inputLeft: boolean = false;
  public inputRight: boolean = false;
  public analogSteer: number = 0; // -1.0 to 1.0 from touch or gamepad

  // Visual monitor mode
  public monitorMode: MonitorMode = 'green';

  constructor(difficulty: TrackDifficulty = 'novice') {
    this.trackDifficulty = difficulty;
    this.initRoad();
    this.loadHighScore();
  }

  private initRoad() {
    this.pylons = [];
    for (let i = 0; i < NightDriverEngine.NUM_PYLONS; i++) {
      this.pylons.push({
        z: NightDriverEngine.Z_NEAR + (i + 1) * NightDriverEngine.PYLON_SPACING,
        hasTreeLeft: i % 4 === 0 && Math.random() > 0.45,
        hasTreeRight: i % 5 === 0 && Math.random() > 0.45
      });
    }
    this.oncomingCars = [];
  }

  private loadHighScore() {
    try {
      const saved = localStorage.getItem(`night_driver_hi_${this.trackDifficulty}`);
      if (saved) this.highScore = parseInt(saved, 10) || 0;
      else this.highScore = this.trackDifficulty === 'expert' ? 1250 : this.trackDifficulty === 'pro' ? 950 : 650;
    } catch {
      this.highScore = 650;
    }
  }

  private saveHighScore() {
    if (this.score > this.highScore) {
      this.highScore = this.score;
      try {
        localStorage.setItem(`night_driver_hi_${this.trackDifficulty}`, this.highScore.toString());
      } catch {
        // Fallback
      }
    }
  }

  public setDifficulty(diff: TrackDifficulty) {
    this.trackDifficulty = diff;
    this.loadHighScore();
    this.resetGame();
  }

  public setMonitorMode(mode: MonitorMode) {
    this.monitorMode = mode;
  }

  public setAutomatic(auto: boolean) {
    this.isAutomatic = auto;
  }

  public shiftUp() {
    if (this.gear < 4 && !this.isAutomatic && !this.isCrashed) {
      this.gear++;
      nightDriverAudio.playShift();
    }
  }

  public shiftDown() {
    if (this.gear > 1 && !this.isAutomatic && !this.isCrashed) {
      this.gear--;
      nightDriverAudio.playShift();
    }
  }

  public setGear(g: number) {
    if (g >= 1 && g <= 4 && !this.isCrashed) {
      if (this.gear !== g) nightDriverAudio.playShift();
      this.gear = g;
    }
  }

  public resetGame() {
    this.speed = 0;
    this.targetSpeed = 0;
    this.gear = 1;
    this.rpm = 1000;
    this.carX = 0;
    this.steerAngle = 0;
    this.distanceTraveled = 0;
    this.score = 0;
    this.timeLeft = 90;
    this.isGameOver = false;
    this.isCrashed = false;
    this.crashTimer = 0;
    this.crashes = 0;
    this.currentCurve = 0;
    this.targetCurve = 0;
    this.curveTimer = 2.0;
    this.initRoad();
    nightDriverAudio.startEngine();
  }

  public update(dt: number = 1 / 60) {
    if (this.isPaused) return;

    if (this.isGameOver) {
      nightDriverAudio.updateEnginePitch(0, 1);
      return;
    }

    // Handle Crash Recovery
    if (this.isCrashed) {
      this.crashTimer -= dt;
      this.speed = Math.max(0, this.speed - 90 * dt);
      nightDriverAudio.updateEnginePitch(0.1, 1);
      if (this.crashTimer <= 0) {
        this.isCrashed = false;
        // Bounce back smoothly safely onto the track
        this.carX = Math.max(-0.4, Math.min(0.4, this.carX * 0.4));
        if (this.isAutomatic) {
          this.gear = this.speed > 80 ? 3 : this.speed > 35 ? 2 : 1;
        }
      }
      return;
    }

    // Update Round Countdown Timer
    this.timeLeft -= dt;
    if (this.timeLeft <= 0) {
      this.timeLeft = 0;
      this.isGameOver = true;
      this.saveHighScore();
      nightDriverAudio.playCheckpoint();
      return;
    }

    // 1. Curvature Generator based on Difficulty
    this.updateCurvature(dt);

    // 2. Car Throttle & Transmission Physics
    this.updateThrottlePhysics(dt);

    // 3. Responsive Steering Physics & Centrifugal Road Drift
    this.updateSteeringPhysics(dt);

    // 4. Road Projection and Pylon Scrolling
    this.updateRoadProgression(dt);

    // 5. Oncoming Traffic
    this.updateTraffic(dt);

    // 6. Collision Detection (Reflector pylons or oncoming cars)
    this.checkCollisions();

    // 7. Update Audio Pitch
    const speedRatio = Math.min(1, this.speed / 195);
    nightDriverAudio.updateEnginePitch(speedRatio, this.gear);
  }

  private updateCurvature(dt: number) {
    this.curveTimer -= dt;
    if (this.curveTimer <= 0) {
      // Pick next road curve duration and intensity
      const mult = this.trackDifficulty === 'expert' ? 0.95 : this.trackDifficulty === 'pro' ? 0.75 : 0.5;
      const duration = 2.5 + Math.random() * 3.5;
      
      // Random chance for straight vs curve
      if (Math.random() < 0.35) {
        this.targetCurve = 0; // Long straight
      } else {
        const sign = Math.random() > 0.5 ? 1 : -1;
        this.targetCurve = sign * (0.35 + Math.random() * 0.65) * mult;
      }
      this.curveTimer = duration;
    }

    // Smooth curve transition
    const curveSpeed = this.trackDifficulty === 'expert' ? 2.5 : 2.0;
    this.currentCurve += (this.targetCurve - this.currentCurve) * (curveSpeed * dt);
  }

  private updateThrottlePhysics(dt: number) {
    // Gear Speed Thresholds (Authentic Apple II ratios)
    const gearMaxSpeed = [0, 52, 96, 145, 196];
    const gearAcceleration = [0, 65, 48, 36, 24];

    // Automatic transmission shift logic with clear hysteresis
    if (this.isAutomatic && !this.isCrashed) {
      if (this.gear === 1 && this.speed >= 44) this.gear = 2;
      else if (this.gear === 2 && this.speed >= 88) this.gear = 3;
      else if (this.gear === 3 && this.speed >= 138) this.gear = 4;
      else if (this.gear === 4 && this.speed < 122) this.gear = 3;
      else if (this.gear === 3 && this.speed < 76) this.gear = 2;
      else if (this.gear === 2 && this.speed < 34) this.gear = 1;
    }

    const currentMax = gearMaxSpeed[this.gear];
    const accelRate = gearAcceleration[this.gear];

    if (this.inputGas) {
      this.targetSpeed = currentMax;
      if (this.speed < this.targetSpeed) {
        this.speed += accelRate * dt;
      } else {
        // Natural air resistance drop if shifted into wrong gear
        this.speed -= 15 * dt;
      }
    } else {
      this.targetSpeed = 0;
      // Rolling resistance
      this.speed = Math.max(0, this.speed - 32 * dt);
    }

    if (this.inputBrake) {
      // Disc brakes with squeal if braking hard at speed
      this.speed = Math.max(0, this.speed - 110 * dt);
      if (this.speed > 70 && Math.random() < 0.2) {
        nightDriverAudio.playTireScreech();
      }
    }

    // Engine RPM Calculation for audio pitch
    const gearMin = [0, 0, 35, 75, 120][this.gear];
    const gearRange = Math.max(10, currentMax - gearMin);
    const inGearRatio = Math.max(0, Math.min(1, (this.speed - gearMin) / gearRange));
    this.rpm = 1000 + inGearRatio * 6000;
  }

  private updateSteeringPhysics(dt: number) {
    let steerIntent = 0;
    if (this.inputLeft) steerIntent -= 1.0;
    if (this.inputRight) steerIntent += 1.0;
    if (this.analogSteer !== 0) steerIntent = this.analogSteer;

    // Fast, crisp steering wheel response without lagging overshoot
    this.steerAngle += (steerIntent - this.steerAngle) * (22.0 * dt);

    // Centrifugal drift: realistic road pull that is easy to counter-steer
    const speedRatio = Math.max(0.05, this.speed / 120);
    const centrifugalForce = this.currentCurve * Math.pow(speedRatio, 1.05) * 0.48;

    // Agile lateral steering rate
    const steerResponsiveness = 2.4 + speedRatio * 0.5;
    this.carX += (this.steerAngle * steerResponsiveness - centrifugalForce) * dt;

    // Road crown self-centering when driving straight
    if (Math.abs(steerIntent) < 0.1 && Math.abs(this.currentCurve) < 0.1) {
      this.carX *= Math.max(0, 1.0 - 1.2 * dt);
    }

    // Tire squeal when cornering hard at high speed
    if (Math.abs(this.steerAngle) > 0.65 && this.speed > 75) {
      if (Math.random() < 0.22) {
        nightDriverAudio.playTireScreech();
      }
    }

    // Shoulder warning when grazing close to pylons
    this.isOnShoulder = Math.abs(this.carX) > 0.72 && Math.abs(this.carX) < 0.92;
    if (this.isOnShoulder && this.speed > 35 && Math.random() < 0.22) {
      nightDriverAudio.playShoulderRumble();
    }

    // Soft pylon deflection: if player clips pylon edge (0.92 to 1.08), bounce back inward with screech
    if (Math.abs(this.carX) >= 0.92 && Math.abs(this.carX) <= 1.08) {
      this.carX = Math.sign(this.carX) * 0.84;
      this.speed = Math.max(20, this.speed * 0.85);
      nightDriverAudio.playTireScreech();
      nightDriverAudio.playShoulderRumble();
    }
  }

  private updateRoadProgression(dt: number) {
    const distanceStep = (this.speed / 3600) * dt; // Miles
    this.distanceTraveled += distanceStep;
    this.score += Math.round((this.speed / 8) * dt * 12);

    // Move pylon pairs towards camera
    const pylonMove = (this.speed * 6.5 + 40) * dt;

    for (let i = 0; i < this.pylons.length; i++) {
      const p = this.pylons[i];
      p.z -= pylonMove;

      // Pylon whiz sound when passing closest pylons
      if (p.z < 45 && p.z > 20 && Math.abs(p.z - this.lastPylonSfxZ) > 15 && this.speed > 45) {
        this.lastPylonSfxZ = p.z;
        nightDriverAudio.playPylonPass();
      }

      // Recycle pylon at the horizon
      if (p.z <= NightDriverEngine.Z_NEAR) {
        p.z += NightDriverEngine.NUM_PYLONS * NightDriverEngine.PYLON_SPACING;
        p.hasTreeLeft = Math.random() < (this.trackDifficulty === 'expert' ? 0.35 : 0.2);
        p.hasTreeRight = Math.random() < (this.trackDifficulty === 'expert' ? 0.35 : 0.2);
      }
    }

    // Sort pylons from farthest to nearest for depth rendering
    this.pylons.sort((a, b) => b.z - a.z);
  }

  private updateTraffic(dt: number) {
    // Spawn oncoming cars
    const spawnChance = this.trackDifficulty === 'expert' ? 0.016 : this.trackDifficulty === 'pro' ? 0.010 : 0.006;
    if (Math.random() < spawnChance && this.oncomingCars.length < 2 && this.speed > 25) {
      // Spawn in oncoming lane (typically right or left of center)
      const lane = Math.random() > 0.5 ? 0.35 : -0.35;
      this.oncomingCars.push({
        z: 800,
        laneOffset: lane + (Math.random() - 0.5) * 0.2,
        speed: 45 + Math.random() * 35,
        color: Math.random() > 0.5 ? 'yellow' : 'red'
      });
    }

    // Update existing oncoming cars
    for (let i = this.oncomingCars.length - 1; i >= 0; i--) {
      const car = this.oncomingCars[i];
      // Car approaches relative to combined speed
      car.z -= (this.speed + car.speed) * 5.0 * dt;

      // Passed oncoming car successfully
      if (car.z <= NightDriverEngine.Z_NEAR) {
        this.oncomingCars.splice(i, 1);
        this.score += 75; // Bonus for dodging oncoming traffic
        nightDriverAudio.playPylonPass();
      }
    }
  }

  private checkCollisions() {
    if (this.isCrashed) return;

    // 1. Road boundaries: only trigger catastrophic crash if car drives completely past pylons
    if (Math.abs(this.carX) > 1.10) {
      this.triggerCrash('pylon');
      return;
    }

    // 2. Collision with oncoming cars
    for (const car of this.oncomingCars) {
      if (car.z < 55 && car.z > 20) {
        const dx = Math.abs(this.carX - car.laneOffset);
        if (dx < 0.32) {
          this.triggerCrash('traffic');
          return;
        }
      }
    }
  }

  private triggerCrash(reason: 'pylon' | 'traffic') {
    if (this.isCrashed) return;
    this.isCrashed = true;
    this.crashTimer = 0.85; // Crisp 0.85s recovery
    this.crashes++;
    this.timeLeft = Math.max(0, this.timeLeft - 3); // 3 seconds penalty
    
    // Reduce speed by half or down to 25 MPH
    this.speed = Math.max(15, this.speed * 0.4);

    // Bounce car back onto the road
    if (reason === 'pylon') {
      this.carX = Math.sign(this.carX) * 0.5;
    }

    nightDriverAudio.playCrash();
  }
}
