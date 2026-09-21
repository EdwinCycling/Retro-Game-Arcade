import { Direction } from '../types';
import { haptics } from './haptics';

export interface TiltState {
  active: boolean;
  supported: boolean;
  beta: number;
  gamma: number;
  neutralBeta: number;
  currentDirection: Direction | null;
  calibrated: boolean;
  permissionGranted: boolean;
}

type DirectionCallback = (dir: Direction) => void;
type StateCallback = (state: TiltState) => void;

class TiltController {
  private active: boolean = false;
  private supported: boolean = false;
  private permissionGranted: boolean = false;
  private neutralBeta: number = 42; // default comfortable viewing angle
  private lastBeta: number = 42;
  private lastGamma: number = 0;
  private lastDirection: Direction | null = null;
  private lastInputTime: number = 0;
  private directionCallback: DirectionCallback | null = null;
  private stateCallbacks: Set<StateCallback> = new Set();
  private boundHandler: ((e: DeviceOrientationEvent) => void) | null = null;

  // Tilt sensitivity threshold in degrees
  private threshold: number = 13;

  constructor() {
    if (typeof window !== 'undefined') {
      this.supported = 'DeviceOrientationEvent' in window;
    }
  }

  public isSupported(): boolean {
    return this.supported;
  }

  public isActive(): boolean {
    return this.active;
  }

  public getState(): TiltState {
    return {
      active: this.active,
      supported: this.supported,
      beta: Math.round(this.lastBeta),
      gamma: Math.round(this.lastGamma),
      neutralBeta: Math.round(this.neutralBeta),
      currentDirection: this.lastDirection,
      calibrated: true,
      permissionGranted: this.permissionGranted
    };
  }

  public subscribe(cb: StateCallback): () => void {
    this.stateCallbacks.add(cb);
    cb(this.getState());
    return () => this.stateCallbacks.delete(cb);
  }

  private notify() {
    const state = this.getState();
    this.stateCallbacks.forEach((cb) => cb(state));
  }

  /**
   * Requests device orientation permission for iOS 13+ Safari
   */
  public async requestPermission(): Promise<boolean> {
    if (typeof window === 'undefined') return false;

    const deviceOrientation = window.DeviceOrientationEvent as unknown as {
      requestPermission?: () => Promise<'granted' | 'denied'>;
    };

    if (deviceOrientation && typeof deviceOrientation.requestPermission === 'function') {
      try {
        const response = await deviceOrientation.requestPermission();
        this.permissionGranted = response === 'granted';
        return this.permissionGranted;
      } catch (err) {
        console.warn('DeviceOrientation permission request failed:', err);
        return false;
      }
    }

    // Android and standard desktop/browsers don't require explicit popup
    this.permissionGranted = true;
    return true;
  }

  /**
   * Start tilt monitoring and steering
   */
  public async start(onDirection: DirectionCallback): Promise<boolean> {
    this.directionCallback = onDirection;

    if (!this.permissionGranted) {
      const granted = await this.requestPermission();
      if (!granted) {
        this.notify();
        return false;
      }
    }

    if (this.boundHandler) {
      window.removeEventListener('deviceorientation', this.boundHandler);
    }

    let initialReadingsCount = 0;

    this.boundHandler = (e: DeviceOrientationEvent) => {
      const beta = e.beta;
      const gamma = e.gamma;

      if (beta === null || gamma === null) return;

      this.lastBeta = beta;
      this.lastGamma = gamma;

      // Auto-calibrate neutralBeta to the first stable readings when activated
      if (initialReadingsCount < 5) {
        initialReadingsCount++;
        if (initialReadingsCount === 4) {
          this.neutralBeta = beta;
        }
      }

      this.evaluateTilt(beta, gamma);
      this.notify();
    };

    window.addEventListener('deviceorientation', this.boundHandler, { passive: true });
    this.active = true;
    haptics.light();
    this.notify();
    return true;
  }

  /**
   * Calibrate neutral resting position to whatever angle user is holding their phone
   */
  public calibrate() {
    this.neutralBeta = this.lastBeta;
    haptics.light();
    this.notify();
  }

  public stop() {
    if (this.boundHandler) {
      window.removeEventListener('deviceorientation', this.boundHandler);
      this.boundHandler = null;
    }
    this.active = false;
    this.lastDirection = null;
    this.notify();
  }

  public toggle(onDirection: DirectionCallback): Promise<boolean> {
    if (this.active) {
      this.stop();
      return Promise.resolve(false);
    } else {
      return this.start(onDirection);
    }
  }

  private evaluateTilt(beta: number, gamma: number) {
    const deltaBeta = beta - this.neutralBeta;
    const deltaGamma = gamma;

    const absBeta = Math.abs(deltaBeta);
    const absGamma = Math.abs(deltaGamma);

    // Check if phone tilt exceeds deadzone threshold
    if (absBeta < this.threshold && absGamma < this.threshold) {
      return;
    }

    let detectedDir: Direction;

    // Prioritize the axis with the greater tilt deflection
    if (absGamma >= absBeta) {
      detectedDir = deltaGamma > 0 ? 'RIGHT' : 'LEFT';
    } else {
      // Tilting top of phone forward away from user (beta decreases) -> UP
      // Tilting top of phone backward towards user (beta increases) -> DOWN
      detectedDir = deltaBeta < 0 ? 'UP' : 'DOWN';
    }

    const now = Date.now();
    // Emit direction if changed or if sustained every 160ms
    if (detectedDir !== this.lastDirection || now - this.lastInputTime > 160) {
      if (detectedDir !== this.lastDirection) {
        haptics.light();
      }
      this.lastDirection = detectedDir;
      this.lastInputTime = now;
      this.directionCallback?.(detectedDir);
    }
  }
}

export const tiltController = new TiltController();
