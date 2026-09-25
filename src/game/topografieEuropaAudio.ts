/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Topografie Europa (Cees Kramer & Roel Kramer • Radarsoft, 1984)
 * Authentic Commodore 64 SID 6581 Audio Synthesizer
 * Features procedural helicopter rotor pulse synthesis, C64 jingles, takeoffs, touchdowns, and radar beeps.
 */

class TopografieEuropaAudio {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private isEngineRunning: boolean = false;
  private rotorTimer: number | null = null;
  private rotorSpeed: number = 0; // 0 = idle, 1 = cruising

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioContextClass();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted && this.rotorTimer) {
      window.clearTimeout(this.rotorTimer);
      this.rotorTimer = null;
    } else if (!muted && this.isEngineRunning) {
      this.scheduleNextRotorChop();
    }
  }

  public toggleMute(): boolean {
    this.setMuted(!this.isMuted);
    return this.isMuted;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public updateEngine(running: boolean, speedRatio: number) {
    this.rotorSpeed = Math.max(0, Math.min(1, speedRatio));
    if (running && !this.isEngineRunning) {
      this.startEngine();
    } else if (!running && this.isEngineRunning) {
      this.stopEngine();
    }
  }

  /**
   * Start authentic C64 SID rotor sound loop
   */
  public startEngine() {
    if (this.isEngineRunning) return;
    this.initCtx();
    if (!this.ctx || this.isMuted) return;

    this.isEngineRunning = true;
    this.scheduleNextRotorChop();
  }

  public stopEngine() {
    this.isEngineRunning = false;
    if (this.rotorTimer) {
      window.clearTimeout(this.rotorTimer);
      this.rotorTimer = null;
    }
  }

  private scheduleNextRotorChop = () => {
    if (!this.isEngineRunning || this.isMuted) return;

    this.playRotorChop();

    // Rhythmic interval between blade chops: 85ms at high speed, 150ms at idle
    const intervalMs = 150 - this.rotorSpeed * 65;
    this.rotorTimer = window.setTimeout(this.scheduleNextRotorChop, intervalMs);
  };

  /**
   * Generates a single authentic SID 6581 rhythmic helicopter rotor blade chop ("tup-tup")
   */
  private playRotorChop() {
    if (!this.ctx || this.isMuted) return;

    try {
      const now = this.ctx.currentTime;

      // 1. Low frequency thump oscillator (SID pulse wave)
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      const baseFreq = 48 + this.rotorSpeed * 28;
      osc.frequency.setValueAtTime(baseFreq, now);
      osc.frequency.exponentialRampToValueAtTime(18, now + 0.055);

      gain.gain.setValueAtTime(0.09, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.055);

      // Lowpass filter to emulate the warm SID 6581 filter capacitor
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(220 + this.rotorSpeed * 180, now);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.058);

      // 2. Micro noise hiss burst for blade air resistance
      const bufferSize = Math.floor(this.ctx.sampleRate * 0.025);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.3;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.04, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);

      const noiseFilter = this.ctx.createBiquadFilter();
      noiseFilter.type = 'bandpass';
      noiseFilter.frequency.setValueAtTime(650, now);

      noise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(this.ctx.destination);

      noise.start(now);
    } catch {
      // Audio fallback
    }
  }

  /**
   * Takeoff whoosh sound
   */
  public playTakeoff() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(90, now);
      osc.frequency.exponentialRampToValueAtTime(320, now + 0.45);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.linearRampToValueAtTime(0.12, now + 0.3);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.52);
    } catch {
      // Audio fallback
    }
  }

  /**
   * Touchdown landing sound
   */
  public playTouchdown() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(240, now);
      osc.frequency.exponentialRampToValueAtTime(45, now + 0.35);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.36);
    } catch {
      // Audio fallback
    }
  }

  /**
   * Radarsoft Victory Fanfare:
   * Cheerful C64 arpeggio sequence celebrating a spot-on target landing!
   */
  public playVictoryFanfare() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const notes = [
        { freq: 261.63, dur: 0.08 }, // C4
        { freq: 329.63, dur: 0.08 }, // E4
        { freq: 392.00, dur: 0.08 }, // G4
        { freq: 523.25, dur: 0.08 }, // C5
        { freq: 659.25, dur: 0.08 }, // E5
        { freq: 783.99, dur: 0.12 }, // G5
        { freq: 1046.50, dur: 0.28 } // C6
      ];

      let offset = 0;
      notes.forEach((n) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = 'square';
        osc.frequency.setValueAtTime(n.freq, now + offset);

        gain.gain.setValueAtTime(0.12, now + offset);
        gain.gain.exponentialRampToValueAtTime(0.001, now + offset + n.dur);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(now + offset);
        osc.stop(now + offset + n.dur + 0.01);

        offset += n.dur;
      });
    } catch {
      // Audio fallback
    }
  }

  /**
   * Missed target or landed off-course
   */
  public playMissBuzzer() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.linearRampToValueAtTime(75, now + 0.3);

      gain.gain.setValueAtTime(0.14, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.36);
    } catch {
      // Audio fallback
    }
  }

  /**
   * City hint radar ping
   */
  public playHintPing() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(1250, now);
      osc.frequency.exponentialRampToValueAtTime(2200, now + 0.08);

      gain.gain.setValueAtTime(0.09, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.13);
    } catch {
      // Audio fallback
    }
  }

  /**
   * Fuel refilled at heliport
   */
  public playRefuelChime() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const notes = [440, 554, 659, 880];
      notes.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.06);

        gain.gain.setValueAtTime(0.1, now + idx * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.12);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(now + idx * 0.06);
        osc.stop(now + idx * 0.06 + 0.13);
      });
    } catch {
      // Audio fallback
    }
  }

  /**
   * Low fuel warning beeper
   */
  public playLowFuelWarning() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(880, now);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.09);
    } catch {
      // Audio fallback
    }
  }
}

export const topografieEuropaAudio = new TopografieEuropaAudio();
