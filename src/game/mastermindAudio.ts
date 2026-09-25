/**
 * Mastermind Procedural Audio Engine
 * Uses Web Audio API to synthesize tactile retro plastic clicks, pin drops, and arcade chimes.
 */

class MastermindAudioEngine {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;

  private getContext(): AudioContext | null {
    if (!this.enabled) return null;
    if (typeof window === 'undefined') return null;

    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }

    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }

    return this.ctx;
  }

  /**
   * Crisp tactile plastic peg snap into socket
   */
  public playPegClick(colorIdx: number = 0) {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const baseFreq = 420 + (colorIdx * 45);
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(baseFreq * 2, ctx.currentTime);
      filter.Q.setValueAtTime(4.0, ctx.currentTime);

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(baseFreq, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.5, ctx.currentTime + 0.04);

      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.045);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } catch {
      // Audio fallback
    }
  }

  /**
   * Sound when clearing or removing a peg
   */
  public playRemovePeg() {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(250, ctx.currentTime + 0.06);

      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.07);
    } catch {
      // Ignore
    }
  }

  /**
   * Mechanical evaluation sound when row is checked
   */
  public playCheckRow() {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      [0, 0.04, 0.08].forEach((delay, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'square';
        osc.frequency.setValueAtTime(320 + idx * 80, ctx.currentTime + delay);
        gain.gain.setValueAtTime(0.08, ctx.currentTime + delay);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 0.035);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + delay);
        osc.stop(ctx.currentTime + delay + 0.04);
      });
    } catch {
      // Ignore
    }
  }

  /**
   * Chime for clue pins (black = solid crystal chime, white = soft warm harmonic)
   */
  public playPinFeedback(isBlack: boolean, delayMs: number = 0) {
    setTimeout(() => {
      const ctx = this.getContext();
      if (!ctx) return;

      try {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        if (isBlack) {
          osc.type = 'sine';
          osc.frequency.setValueAtTime(880, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.08);
          gain.gain.setValueAtTime(0.18, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
        } else {
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
          gain.gain.setValueAtTime(0.12, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
        }

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + 0.14);
      } catch {
        // Ignore
      }
    }, delayMs);
  }

  /**
   * Mystery shield opening sound
   */
  public playSecretReveal() {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const notes = [440, 554.37, 659.25, 880];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.07);
        gain.gain.setValueAtTime(0.15, ctx.currentTime + idx * 0.07);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.07 + 0.2);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + idx * 0.07);
        osc.stop(ctx.currentTime + idx * 0.07 + 0.22);
      });
    } catch {
      // Ignore
    }
  }

  /**
   * Triumphant fanfare when the secret code is successfully cracked
   */
  public playWinFanfare() {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const melody = [
        { note: 523.25, duration: 0.12, time: 0 },       // C5
        { note: 659.25, duration: 0.12, time: 0.13 },    // E5
        { note: 783.99, duration: 0.12, time: 0.26 },    // G5
        { note: 1046.50, duration: 0.4, time: 0.39 },    // C6
        { note: 880.00, duration: 0.12, time: 0.8 },     // A5
        { note: 1046.50, duration: 0.6, time: 0.95 },    // C6
      ];

      melody.forEach(({ note, duration, time }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(note, ctx.currentTime + time);
        gain.gain.setValueAtTime(0.2, ctx.currentTime + time);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + time + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + time);
        osc.stop(ctx.currentTime + time + duration + 0.05);
      });
    } catch {
      // Ignore
    }
  }

  /**
   * Game over sound when all attempts are exhausted
   */
  public playLoseSound() {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const notes = [
        { note: 392.00, duration: 0.2, time: 0 },    // G4
        { note: 349.23, duration: 0.2, time: 0.22 }, // F4
        { note: 329.63, duration: 0.25, time: 0.44 },// E4
        { note: 261.63, duration: 0.5, time: 0.7 },  // C4
      ];

      notes.forEach(({ note, duration, time }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(note, ctx.currentTime + time);
        gain.gain.setValueAtTime(0.12, ctx.currentTime + time);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + time + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + time);
        osc.stop(ctx.currentTime + time + duration + 0.05);
      });
    } catch {
      // Ignore
    }
  }
}

export const mastermindAudio = new MastermindAudioEngine();
