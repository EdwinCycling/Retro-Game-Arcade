// Mobile Haptic Feedback Manager (navigator.vibrate)

class HapticsManager {
  private enabled: boolean = true;

  constructor() {
    try {
      const saved = localStorage.getItem('pacman_haptics_enabled');
      if (saved !== null) {
        this.enabled = saved === 'true';
      }
    } catch {
      this.enabled = true;
    }
  }

  public isSupported(): boolean {
    return typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function';
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  public setEnabled(val: boolean) {
    this.enabled = val;
    try {
      localStorage.setItem('pacman_haptics_enabled', String(val));
    } catch {}
    if (val && this.isSupported()) {
      this.light();
    }
  }

  public toggle(): boolean {
    this.setEnabled(!this.enabled);
    return this.enabled;
  }

  /** Subtle tick when changing direction (swipe, D-pad, or phone tilt) */
  public light() {
    if (!this.enabled || !this.isSupported()) return;
    try {
      navigator.vibrate(15);
    } catch {}
  }

  /** Medium feedback */
  public medium() {
    if (!this.enabled || !this.isSupported()) return;
    try {
      navigator.vibrate(40);
    } catch {}
  }

  /** Heavy vibration for collisions */
  public heavy() {
    if (!this.enabled || !this.isSupported()) return;
    try {
      navigator.vibrate(80);
    } catch {}
  }

  /** Warning alert feedback */
  public warning() {
    if (!this.enabled || !this.isSupported()) return;
    try {
      navigator.vibrate([30, 40, 30]);
    } catch {}
  }

  /** Error or invalid move feedback */
  public error() {
    this.heavy();
  }

  /** Eating a Power Pellet (energizer) */
  public powerPellet() {
    if (!this.enabled || !this.isSupported()) return;
    try {
      navigator.vibrate([40, 30, 60]);
    } catch {}
  }

  /** Eating a blue Frightened Ghost */
  public eatGhost() {
    if (!this.enabled || !this.isSupported()) return;
    try {
      navigator.vibrate([80, 40, 120]);
    } catch {}
  }

  /** Eating bonus fruit */
  public eatFruit() {
    if (!this.enabled || !this.isSupported()) return;
    try {
      navigator.vibrate([50, 30, 50]);
    } catch {}
  }

  /** Pac-Man losing a life */
  public death() {
    if (!this.enabled || !this.isSupported()) return;
    try {
      navigator.vibrate([100, 50, 150, 50, 200]);
    } catch {}
  }

  /** Level cleared fanfare */
  public levelClear() {
    if (!this.enabled || !this.isSupported()) return;
    try {
      navigator.vibrate([60, 40, 60, 40, 100, 60, 150]);
    } catch {}
  }

  /** Space Invaders: Cannon shooting laser */
  public laserShoot() {
    if (!this.enabled || !this.isSupported()) return;
    try {
      navigator.vibrate(12);
    } catch {}
  }

  /** Space Invaders: Invader hit & destroyed */
  public invaderKilled() {
    if (!this.enabled || !this.isSupported()) return;
    try {
      navigator.vibrate(35);
    } catch {}
  }

  /** Space Invaders: Mystery UFO destroyed */
  public ufoKilled() {
    if (!this.enabled || !this.isSupported()) return;
    try {
      navigator.vibrate([80, 40, 100]);
    } catch {}
  }

  /** Space Invaders: Bunker struck by bomb */
  public bunkerHit() {
    if (!this.enabled || !this.isSupported()) return;
    try {
      navigator.vibrate(18);
    } catch {}
  }

  /** Success feedback (e.g. saving score or goal reached) */
  public success() {
    if (!this.enabled || !this.isSupported()) return;
    try {
      navigator.vibrate([30, 20, 50]);
    } catch {}
  }

  /** Subtle click or tap feedback */
  public softClick() {
    this.light();
  }

  /** Button press feedback */
  public buttonPress() {
    this.selection();
  }

  /** Wall hit or error feedback */
  public wallHit() {
    this.heavy();
  }

  /** Coin insert feedback */
  public coinInsert() {
    if (!this.enabled || !this.isSupported()) return;
    try {
      navigator.vibrate([20, 30, 40]);
    } catch {}
  }

  /** Fruit or bonus item eaten */
  public fruitEaten() {
    this.eatFruit();
  }

  /** Game over vibration */
  public gameOver() {
    this.death();
  }

  /** Selection / UI toggle feedback */
  public selection() {
    if (!this.enabled || !this.isSupported()) return;
    try {
      navigator.vibrate(10);
    } catch {}
  }

  /** Key / Item collected */
  public key() {
    if (!this.enabled || !this.isSupported()) return;
    try {
      navigator.vibrate([25, 15, 35]);
    } catch {}
  }
}

export const haptics = new HapticsManager();
