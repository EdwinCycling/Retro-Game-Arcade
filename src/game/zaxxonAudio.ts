/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Authentic 1982 Sega Zaxxon Web Audio API Synthesizer
 * 100% synthesized analog arcade sound effects
 */

class ZaxxonAudioEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private masterGain: GainNode | null = null;

  // Engine drone oscillators
  private engineOsc1: OscillatorNode | null = null;
  private engineOsc2: OscillatorNode | null = null;
  private engineGain: GainNode | null = null;
  private engineRunning: boolean = false;

  // Siren oscillator for low fuel
  private sirenOsc: OscillatorNode | null = null;
  private sirenGain: GainNode | null = null;
  private sirenRunning: boolean = false;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(0.3, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(muted ? 0 : 0.3, this.ctx.currentTime);
    }
    if (muted) {
      this.stopEngine();
      this.stopLowFuelSiren();
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  /**
   * Continuous throbbing spaceship engine drone with pitch modulation
   */
  public startEngine(altitude: number = 1) {
    if (this.isMuted || this.engineRunning) return;
    const ctx = this.getContext();
    if (!ctx || !this.masterGain) return;

    try {
      this.engineOsc1 = ctx.createOscillator();
      this.engineOsc2 = ctx.createOscillator();
      this.engineGain = ctx.createGain();

      this.engineOsc1.type = 'sawtooth';
      this.engineOsc2.type = 'triangle';

      const baseFreq = 58 + altitude * 8;
      this.engineOsc1.frequency.setValueAtTime(baseFreq, ctx.currentTime);
      this.engineOsc2.frequency.setValueAtTime(baseFreq * 1.5, ctx.currentTime);

      this.engineGain.gain.setValueAtTime(0.08, ctx.currentTime);

      this.engineOsc1.connect(this.engineGain);
      this.engineOsc2.connect(this.engineGain);
      this.engineGain.connect(this.masterGain);

      this.engineOsc1.start();
      this.engineOsc2.start();
      this.engineRunning = true;
    } catch {
      this.engineRunning = false;
    }
  }

  public updateEngineAltitude(altitude: number) {
    if (!this.engineRunning || !this.engineOsc1 || !this.engineOsc2 || !this.ctx) return;
    const baseFreq = 55 + altitude * 9;
    this.engineOsc1.frequency.setTargetAtTime(baseFreq, this.ctx.currentTime, 0.05);
    this.engineOsc2.frequency.setTargetAtTime(baseFreq * 1.5, this.ctx.currentTime, 0.05);
  }

  public stopEngine() {
    if (!this.engineRunning) return;
    try {
      if (this.engineOsc1) {
        this.engineOsc1.stop();
        this.engineOsc1.disconnect();
      }
      if (this.engineOsc2) {
        this.engineOsc2.stop();
        this.engineOsc2.disconnect();
      }
      if (this.engineGain) {
        this.engineGain.disconnect();
      }
    } catch {}
    this.engineRunning = false;
    this.engineOsc1 = null;
    this.engineOsc2 = null;
    this.engineGain = null;
  }

  /**
   * Dual laser cannon firing sound
   */
  public playLaser() {
    const ctx = this.getContext();
    if (!ctx || this.isMuted || !this.masterGain) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    const now = ctx.currentTime;

    osc.frequency.setValueAtTime(950, now);
    osc.frequency.exponentialRampToValueAtTime(140, now + 0.12);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.13);
  }

  /**
   * Explosions of structures and enemy fighters
   */
  public playExplosion(isBig: boolean = false) {
    const ctx = this.getContext();
    if (!ctx || this.isMuted || !this.masterGain) return;

    const duration = isBig ? 0.7 : 0.35;
    const bufferSize = Math.floor(ctx.sampleRate * duration);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-3 * (i / bufferSize));
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(isBig ? 450 : 800, ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(60, ctx.currentTime + duration);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(isBig ? 0.35 : 0.22, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    noise.start();
  }

  /**
   * Fuel Tank Hit & Refill Chime
   */
  public playFuelChime() {
    const ctx = this.getContext();
    if (!ctx || this.isMuted || !this.masterGain) return;

    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const startTime = ctx.currentTime + idx * 0.04;

      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.12, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.08);

      osc.connect(gain);
      gain.connect(this.masterGain!);

      osc.start(startTime);
      osc.stop(startTime + 0.09);
    });
  }

  /**
   * Surface-to-Air Missile Launch Whoosh
   */
  public playMissileLaunch() {
    const ctx = this.getContext();
    if (!ctx || this.isMuted || !this.masterGain) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const now = ctx.currentTime;

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(120, now);
    osc.frequency.linearRampToValueAtTime(650, now + 0.3);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.36);
  }

  /**
   * Low Fuel Emergency Warning Siren
   */
  public startLowFuelSiren() {
    if (this.isMuted || this.sirenRunning) return;
    const ctx = this.getContext();
    if (!ctx || !this.masterGain) return;

    try {
      this.sirenOsc = ctx.createOscillator();
      this.sirenGain = ctx.createGain();

      this.sirenOsc.type = 'sawtooth';
      this.sirenOsc.frequency.setValueAtTime(440, ctx.currentTime);

      // Warble modulation
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.setValueAtTime(3.5, ctx.currentTime); // 3.5 Hz pulse
      lfoGain.gain.setValueAtTime(180, ctx.currentTime);

      lfo.connect(this.sirenOsc.frequency);
      lfo.start();

      this.sirenGain.gain.setValueAtTime(0.15, ctx.currentTime);

      this.sirenOsc.connect(this.sirenGain);
      this.sirenGain.connect(this.masterGain);

      this.sirenOsc.start();
      this.sirenRunning = true;
    } catch {
      this.sirenRunning = false;
    }
  }

  public stopLowFuelSiren() {
    if (!this.sirenRunning) return;
    try {
      if (this.sirenOsc) {
        this.sirenOsc.stop();
        this.sirenOsc.disconnect();
      }
      if (this.sirenGain) {
        this.sirenGain.disconnect();
      }
    } catch {}
    this.sirenRunning = false;
    this.sirenOsc = null;
    this.sirenGain = null;
  }

  /**
   * Zaxxon Robot Boss Mechanical Drone
   */
  public playRobotBossHum() {
    const ctx = this.getContext();
    if (!ctx || this.isMuted || !this.masterGain) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const now = ctx.currentTime;

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(75, now);
    osc.frequency.linearRampToValueAtTime(110, now + 0.4);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.45);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.46);
  }

  /**
   * Stage Clear / Victory Jingle
   */
  public playStageClear() {
    const ctx = this.getContext();
    if (!ctx || this.isMuted || !this.masterGain) return;

    const notes = [
      { f: 523.25, d: 0.12 },
      { f: 659.25, d: 0.12 },
      { f: 783.99, d: 0.12 },
      { f: 1046.5, d: 0.25 },
      { f: 880.0, d: 0.15 },
      { f: 1046.5, d: 0.4 }
    ];

    let time = ctx.currentTime;
    notes.forEach(n => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(n.f, time);

      gain.gain.setValueAtTime(0.18, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + n.d);

      osc.connect(gain);
      gain.connect(this.masterGain!);

      osc.start(time);
      osc.stop(time + n.d + 0.01);
      time += n.d * 0.9;
    });
  }

  /**
   * Game Over Jingle
   */
  public playGameOver() {
    const ctx = this.getContext();
    if (!ctx || this.isMuted || !this.masterGain) return;

    this.stopEngine();
    this.stopLowFuelSiren();

    const notes = [
      { f: 392.00, d: 0.25 },
      { f: 369.99, d: 0.25 },
      { f: 349.23, d: 0.25 },
      { f: 329.63, d: 0.50 }
    ];

    let time = ctx.currentTime;
    notes.forEach(n => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(n.f, time);

      gain.gain.setValueAtTime(0.2, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + n.d);

      osc.connect(gain);
      gain.connect(this.masterGain!);

      osc.start(time);
      osc.stop(time + n.d);
      time += n.d;
    });
  }
}

export const zaxxonAudio = new ZaxxonAudioEngine();
