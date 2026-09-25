/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Topografie Europa (Cees Kramer & Roel Kramer • Radarsoft, 1984)
 * Authentic C64 Scrolling Flight Mechanics, Radar Telemetry, Fuel, and Scoring Engine
 */

import {
  CityTarget,
  CountryTarget,
  GeoFeature,
  EUROPEAN_CAPITALS,
  EUROPEAN_COUNTRIES,
  MAJOR_CITIES,
  GEO_FEATURES,
  HOME_HELIPORT,
  WORLD_WIDTH,
  WORLD_HEIGHT,
  SCREEN_WIDTH,
  VIEW_HEIGHT
} from './topografieEuropaData';
import { topografieEuropaAudio } from './topografieEuropaAudio';

export type GameMode = 'capitals' | 'countries' | 'cities' | 'geo' | 'free';
export type DifficultyMode = 'hard' | 'easy';
export type FlightState = 'landed' | 'taking_off' | 'airborne' | 'landing';

export interface LandingResult {
  message: { nl: string; en: string };
  type: 'success' | 'close' | 'miss' | 'refuel' | 'info';
  distanceKm: number;
  direction: string;
  points: number;
}

export interface MissionResultRecord {
  targetName: { nl: string; en: string };
  distanceKm: number;
  points: number;
  type: 'success' | 'close' | 'miss' | 'timeup';
}

export class TopografieEuropaEngine {
  // Helicopter physics in World Space (0 - WORLD_WIDTH, 0 - WORLD_HEIGHT)
  public x: number = HOME_HELIPORT.x;
  public y: number = HOME_HELIPORT.y;
  public vx: number = 0;
  public vy: number = 0;
  public heading: number = 0; // In radians
  public altitude: number = 0; // 0.0 = on ground, 1.0 = airborne cruising
  public flightState: FlightState = 'landed';
  public rotorAngle: number = 0;
  public fuel: number = 100; // 0 to 100%
  public isRefueling: boolean = false;

  // Camera viewport in World Space
  public cameraX: number = 0;
  public cameraY: number = 0;
  public isOverviewMap: boolean = false; // Toggle between Scrolling Zoom vs Full Continent

  // Game configuration & status
  public gameMode: GameMode = 'capitals';
  public difficulty: DifficultyMode = 'hard'; // Default: Hard (Classic 1984 without beacon dot)
  public currentMission: CityTarget | CountryTarget | GeoFeature | null = null;
  public missionQueue: Array<CityTarget | CountryTarget | GeoFeature> = [];
  public missionHistory: MissionResultRecord[] = []; // End score report card details
  public completedCount: number = 0;
  public totalMissions: number = 10;
  public score: number = 0;
  public highScore: number = 0;
  public timeLeft: number = 180; // 3:00 minutes round (matches YouTube screenshot TIJD:2'16)
  public isGameOver: boolean = false;
  public isPaused: boolean = false;

  // Visual aids & Feedback
  public showCityDots: boolean = false;
  public hintUsedOnCurrent: boolean = false;
  public landingResult: LandingResult | null = null;
  public resultTimer: number = 0;
  public nearestLocationName: { nl: string; en: string } | null = null;

  // Control inputs
  public inputUp: boolean = false;
  public inputDown: boolean = false;
  public inputLeft: boolean = false;
  public inputRight: boolean = false;
  public analogX: number = 0;
  public analogY: number = 0;
  public inputLandToggle: boolean = false;
  public hintButtonPressed: boolean = false;

  // Low fuel warning throttle
  private lowFuelTimer: number = 0;

  constructor(mode: GameMode = 'capitals', difficulty: DifficultyMode = 'hard') {
    this.gameMode = mode;
    this.difficulty = difficulty;
    this.loadHighScore();
    this.initMissions();
    this.updateCamera(1.0);
  }

  private loadHighScore() {
    try {
      const saved = localStorage.getItem(`topografie_europa_hi_${this.gameMode}_${this.difficulty}`);
      if (saved) this.highScore = parseInt(saved, 10) || 0;
      else this.highScore = 850;
    } catch {
      this.highScore = 850;
    }
  }

  private saveHighScore() {
    if (this.score > this.highScore) {
      this.highScore = this.score;
      try {
        localStorage.setItem(`topografie_europa_hi_${this.gameMode}_${this.difficulty}`, this.highScore.toString());
      } catch {
        // Fallback
      }
    }
  }

  public setGameMode(mode: GameMode) {
    this.gameMode = mode;
    this.loadHighScore();
    this.resetGame();
  }

  public setDifficulty(diff: DifficultyMode) {
    this.difficulty = diff;
    this.loadHighScore();
  }

  public toggleDifficulty() {
    this.difficulty = this.difficulty === 'hard' ? 'easy' : 'hard';
    this.loadHighScore();
  }

  public toggleOverviewMap() {
    this.isOverviewMap = !this.isOverviewMap;
  }

  public resetGame() {
    this.x = HOME_HELIPORT.x;
    this.y = HOME_HELIPORT.y;
    this.vx = 0;
    this.vy = 0;
    this.heading = 0;
    this.altitude = 0;
    this.flightState = 'landed';
    this.fuel = 100;
    this.score = 0;
    this.timeLeft = 180;
    this.completedCount = 0;
    this.isGameOver = false;
    this.showCityDots = false;
    this.hintUsedOnCurrent = false;
    this.landingResult = null;
    this.resultTimer = 0;
    this.missionHistory = []; // Clear previous report card
    this.initMissions();
    this.updateCamera(1.0);
    topografieEuropaAudio.stopEngine();
  }

  private initMissions() {
    let sourcePool: Array<CityTarget | CountryTarget | GeoFeature> = [];
    if (this.gameMode === 'capitals') {
      sourcePool = [...EUROPEAN_CAPITALS];
    } else if (this.gameMode === 'countries') {
      sourcePool = [...EUROPEAN_COUNTRIES];
    } else if (this.gameMode === 'cities') {
      sourcePool = [...MAJOR_CITIES];
    } else if (this.gameMode === 'geo') {
      sourcePool = [...GEO_FEATURES];
    } else {
      // Free flight mode
      sourcePool = [...EUROPEAN_CAPITALS, ...EUROPEAN_COUNTRIES, ...MAJOR_CITIES];
    }

    // High-quality, unbiased Fisher-Yates random shuffle to guarantee a different order every single time
    const shuffled = [...sourcePool];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = shuffled[i];
      shuffled[i] = shuffled[j];
      shuffled[j] = temp;
    }

    this.totalMissions = Math.min(10, shuffled.length);
    this.missionQueue = shuffled.slice(0, this.totalMissions);
    this.currentMission = this.missionQueue[0] || null;
    this.missionHistory = [];
  }

  public toggleTakeoffLand() {
    if (this.isGameOver) {
      this.resetGame();
      return;
    }

    if (this.flightState === 'landed') {
      if (this.fuel <= 0) {
        topografieEuropaAudio.playLowFuelWarning();
        return;
      }
      this.flightState = 'taking_off';
      topografieEuropaAudio.playTakeoff();
      topografieEuropaAudio.startEngine();
    } else if (this.flightState === 'airborne') {
      this.flightState = 'landing';
    }
  }

  public toggleShowCityDots() {
    this.showCityDots = !this.showCityDots;
    if (this.showCityDots) {
      this.hintUsedOnCurrent = true;
      topografieEuropaAudio.playHintPing();
    }
  }

  public update(dt: number = 1 / 60) {
    if (this.isPaused) return;

    // Fast blade rotation animation
    if (this.flightState !== 'landed' || this.altitude > 0) {
      this.rotorAngle = (this.rotorAngle + 25.0) % (Math.PI * 2);
    }

    // Handle Landing Result Notification Timer
    if (this.landingResult) {
      this.resultTimer -= dt;
      if (this.resultTimer <= 0) {
        this.landingResult = null;
      }
    }

    // Game Timer Countdown
    if (!this.isGameOver && this.gameMode !== 'free') {
      this.timeLeft -= dt;
      if (this.timeLeft <= 0) {
        this.timeLeft = 0;
        this.isGameOver = true;

        // Push any remaining targets onto the report history as 'timeup'
        for (const remaining of this.missionQueue) {
          this.missionHistory.push({
            targetName: remaining.name,
            distanceKm: -1,
            points: 0,
            type: 'timeup'
          });
        }

        this.saveHighScore();
        topografieEuropaAudio.stopEngine();
        return;
      }
    }

    // Handle Takeoff & Landing Altitude Transitions
    if (this.flightState === 'taking_off') {
      this.altitude += 2.2 * dt;
      if (this.altitude >= 1.0) {
        this.altitude = 1.0;
        this.flightState = 'airborne';
      }
    } else if (this.flightState === 'landing') {
      this.altitude -= 1.9 * dt;
      this.vx *= 0.88;
      this.vy *= 0.88;

      if (this.altitude <= 0.0) {
        this.altitude = 0.0;
        this.flightState = 'landed';
        this.vx = 0;
        this.vy = 0;
        topografieEuropaAudio.playTouchdown();
        topografieEuropaAudio.stopEngine();
        this.evaluateLanding();
      }
    }

    // Handle Flight Physics when airborne
    if (this.flightState === 'airborne' || this.flightState === 'taking_off') {
      this.handleFlightControls(dt);
    }

    // Fuel Consumption & Low Fuel Warning
    if (this.flightState !== 'landed') {
      const speed = Math.hypot(this.vx, this.vy);
      const fuelBurn = (0.28 + speed * 0.005) * dt;
      this.fuel = Math.max(0, this.fuel - fuelBurn);

      if (this.fuel < 20 && this.fuel > 0) {
        this.lowFuelTimer -= dt;
        if (this.lowFuelTimer <= 0) {
          topografieEuropaAudio.playLowFuelWarning();
          this.lowFuelTimer = 1.8;
        }
      }

      if (this.fuel <= 0 && this.flightState === 'airborne') {
        this.flightState = 'landing';
      }
    }

    // Update camera to smoothly follow helicopter across Europe
    this.updateCamera(dt);

    // Update nearest city for telemetry
    this.updateNearestLocation();

    // Check Heliport Refueling when landed
    if (this.flightState === 'landed') {
      const distToHeliport = Math.hypot(this.x - HOME_HELIPORT.x, this.y - HOME_HELIPORT.y);
      if (distToHeliport < HOME_HELIPORT.radius + 6 && this.fuel < 100) {
        this.fuel = Math.min(100, this.fuel + 35 * dt);
        if (!this.isRefueling) {
          this.isRefueling = true;
          topografieEuropaAudio.playRefuelChime();
        }
      } else {
        this.isRefueling = false;
      }
    }
  }

  private handleFlightControls(dt: number) {
    let ax = 0;
    let ay = 0;

    if (this.inputLeft) ax -= 1;
    if (this.inputRight) ax += 1;
    if (this.inputUp) ay -= 1;
    if (this.inputDown) ay += 1;

    if (this.analogX !== 0 || this.analogY !== 0) {
      ax = this.analogX;
      ay = this.analogY;
    }

    const inputLen = Math.hypot(ax, ay);
    if (inputLen > 1.0) {
      ax /= inputLen;
      ay /= inputLen;
    }

    // High-responsiveness flight physics across 960x740 virtual world
    const acceleration = 240.0;
    const friction = 0.92;
    const maxSpeed = 160.0;

    this.vx += ax * acceleration * dt;
    this.vy += ay * acceleration * dt;

    this.vx *= friction;
    this.vy *= friction;

    const currentSpeed = Math.hypot(this.vx, this.vy);
    if (currentSpeed > maxSpeed) {
      this.vx = (this.vx / currentSpeed) * maxSpeed;
      this.vy = (this.vy / currentSpeed) * maxSpeed;
    }

    this.x += this.vx * dt;
    this.y += this.vy * dt;

    // World map boundaries
    this.x = Math.max(16, Math.min(WORLD_WIDTH - 16, this.x));
    this.y = Math.max(16, Math.min(WORLD_HEIGHT - 16, this.y));

    if (currentSpeed > 4.0) {
      this.heading = Math.atan2(this.vy, this.vx);
    }

    const speedRatio = Math.min(1, currentSpeed / maxSpeed);
    topografieEuropaAudio.updateEngine(true, speedRatio);
  }

  private updateCamera(dt: number) {
    const targetCamX = this.x - SCREEN_WIDTH / 2;
    const targetCamY = this.y - VIEW_HEIGHT / 2;

    // Smooth camera tracking
    const lerpRate = Math.min(1.0, 8.0 * dt);
    this.cameraX += (targetCamX - this.cameraX) * lerpRate;
    this.cameraY += (targetCamY - this.cameraY) * lerpRate;

    // Clamp camera within world bounds
    this.cameraX = Math.max(0, Math.min(WORLD_WIDTH - SCREEN_WIDTH, this.cameraX));
    this.cameraY = Math.max(0, Math.min(WORLD_HEIGHT - VIEW_HEIGHT, this.cameraY));
  }

  private updateNearestLocation() {
    let nearest: CityTarget | CountryTarget | GeoFeature | null = null;
    let minDist = 9999;

    const allLocations = [...EUROPEAN_CAPITALS, ...MAJOR_CITIES];
    for (const loc of allLocations) {
      const d = Math.hypot(this.x - loc.x, this.y - loc.y);
      if (d < minDist) {
        minDist = d;
        nearest = loc;
      }
    }

    if (nearest && minDist < 45) {
      this.nearestLocationName = (nearest as any).name;
    } else {
      this.nearestLocationName = null;
    }
  }

  private evaluateLanding() {
    // Check if landed at home heliport
    const distToHeliport = Math.hypot(this.x - HOME_HELIPORT.x, this.y - HOME_HELIPORT.y);
    if (distToHeliport < HOME_HELIPORT.radius + 6) {
      this.landingResult = {
        message: {
          nl: 'GELAND OP DE HELIPORT SCHIPHOL! BRANDSTOF WORDT BIJGETANKT!',
          en: 'LANDED ON SCHIPHOL HELIPORT! FUEL IS BEING REPLENISHED!'
        },
        type: 'refuel',
        distanceKm: 0,
        direction: '',
        points: 0
      };
      this.resultTimer = 4.0;
      return;
    }

    // Free flight exploration mode
    if (this.gameMode === 'free' || !this.currentMission) {
      const nearest = this.getNearestCityAt(this.x, this.y);
      if (nearest) {
        this.landingResult = {
          message: {
            nl: `GELAND BIJ ${nearest.name.nl.toUpperCase()} (${nearest.country.nl.toUpperCase()})!`,
            en: `LANDED NEAR ${nearest.name.en.toUpperCase()} (${nearest.country.en.toUpperCase()})!`
          },
          type: 'info',
          distanceKm: 0,
          direction: '',
          points: 10
        };
        topografieEuropaAudio.playVictoryFanfare();
      } else {
        this.landingResult = {
          message: {
            nl: 'GELAND IN HET EUROPESE LANDSCHAP.',
            en: 'LANDED IN THE EUROPEAN COUNTRYSIDE.'
          },
          type: 'info',
          distanceKm: 0,
          direction: '',
          points: 0
        };
      }
      this.resultTimer = 4.0;
      return;
    }

    // Real world distance calculation (1 world pixel = approx 6.5 km)
    const target = this.currentMission;
    const pxDist = Math.hypot(this.x - target.x, this.y - target.y);
    const distanceKm = Math.round(pxDist * 6.5);

    // Direction calculation from player landing spot to target
    const dx = target.x - this.x;
    const dy = target.y - this.y;
    const direction = this.getCompassDirection(dx, dy);

    // Thresholds for scrolling 960x740 map:
    // pxDist < 12 (~75 km): Bullseye!
    // pxDist < 28 (~180 km): Close nearby!
    // pxDist >= 28: Miss
    if (pxDist < 14) {
      // Direct Bullseye Hit!
      const hintPenalty = this.hintUsedOnCurrent ? 25 : 0;
      const speedBonus = Math.max(10, Math.round(this.fuel * 0.4));
      const points = 100 - hintPenalty + speedBonus;
      this.score += points;

      this.missionHistory.push({
        targetName: target.name,
        distanceKm: 0,
        points,
        type: 'success'
      });

      this.landingResult = {
        message: {
          nl: `FANTASTISCH! EXACT OP ${target.name.nl.toUpperCase()} GELAND! (+${points} PTN)`,
          en: `BRILLIANT! TOUCHDOWN ON ${target.name.en.toUpperCase()}! (+${points} PTS)`
        },
        type: 'success',
        distanceKm: 0,
        direction: '',
        points
      };
      this.resultTimer = 5.0;
      topografieEuropaAudio.playVictoryFanfare();
      this.advanceMission();
    } else if (pxDist < 30) {
      // Close Hit!
      const hintPenalty = this.hintUsedOnCurrent ? 15 : 0;
      const points = Math.max(25, 55 - hintPenalty);
      this.score += points;

      this.missionHistory.push({
        targetName: target.name,
        distanceKm,
        points,
        type: 'close'
      });

      this.landingResult = {
        message: {
          nl: `GOED GEDAAN! VLAKBIJ ${target.name.nl.toUpperCase()}! (${distanceKm} KM, +${points} PTN)`,
          en: `WELL DONE! CLOSE TO ${target.name.en.toUpperCase()}! (${distanceKm} KM, +${points} PTS)`
        },
        type: 'close',
        distanceKm,
        direction,
        points
      };
      this.resultTimer = 4.5;
      topografieEuropaAudio.playVictoryFanfare();
      this.advanceMission();
    } else {
      // Missed landing
      this.landingResult = {
        message: {
          nl: `MIS! ${target.name.nl.toUpperCase()} IS NOG ${distanceKm} KM NAAR HET ${direction.toUpperCase()}!`,
          en: `MISS! ${target.name.en.toUpperCase()} IS STILL ${distanceKm} KM TO THE ${direction.toUpperCase()}!`
        },
        type: 'miss',
        distanceKm,
        direction,
        points: 0
      };
      this.resultTimer = 5.0;
      topografieEuropaAudio.playMissBuzzer();
    }
  }

  private advanceMission() {
    this.completedCount++;
    this.hintUsedOnCurrent = false;

    if (this.missionQueue.length > 1) {
      this.missionQueue.shift();
      this.currentMission = this.missionQueue[0];
    } else {
      this.currentMission = null;
      this.isGameOver = true;
      this.saveHighScore();
    }
  }

  private getNearestCityAt(x: number, y: number): CityTarget | null {
    let nearest: CityTarget | null = null;
    let minDist = 9999;

    const all = [...EUROPEAN_CAPITALS, ...MAJOR_CITIES];
    for (const c of all) {
      const d = Math.hypot(x - c.x, y - c.y);
      if (d < minDist) {
        minDist = d;
        nearest = c;
      }
    }

    return minDist < 35 ? nearest : null;
  }

  private getCompassDirection(dx: number, dy: number): string {
    const angle = Math.atan2(dy, dx) * (180 / Math.PI);
    if (angle >= -22.5 && angle < 22.5) return 'Oosten';
    if (angle >= 22.5 && angle < 67.5) return 'Zuid-Oosten';
    if (angle >= 67.5 && angle < 112.5) return 'Zuiden';
    if (angle >= 112.5 && angle < 157.5) return 'Zuid-Westen';
    if (angle >= 157.5 || angle < -157.5) return 'Westen';
    if (angle >= -157.5 && angle < -112.5) return 'Noord-Westen';
    if (angle >= -112.5 && angle < -67.5) return 'Noorden';
    return 'Noord-Oosten';
  }
}
