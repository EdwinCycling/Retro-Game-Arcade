/**
 * Authentic 1978 Space Invaders Web Audio API Synthesizer
 * Produces 100% synthesized arcade sounds using Web Audio oscillators and noise buffers.
 */

class SpaceInvadersAudioEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private volume: number = 0.35;

  // UFO continuous warble oscillator
  private ufoOsc: OscillatorNode | null = null;
  private ufoGain: GainNode | null = null;
  private ufoLfo: OscillatorNode | null = null;

  // March 4-note frequencies in Hz
  private marchFrequencies = [110, 103, 98, 92];

  private getContext(): AudioContext | null {
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

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted) {
      this.stopUfoSound();
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
  }

  /**
   * The iconic 4-note heartbeat alien fleet march note
   * @param step 0, 1, 2, or 3
   */
  public playMarchNote(step: number) {
    const ctx = this.getContext();
    if (!ctx || this.isMuted) return;

    const freq = this.marchFrequencies[step % 4] || 100;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(freq, ctx.currentTime);

    // Punchy arcade envelope
    gain.gain.setValueAtTime(0.3 * this.volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.12);
  }

  /**
   * Player Cannon Laser Shoot (Fast descending sweep)
   */
  public playShoot() {
    const ctx = this.getContext();
    if (!ctx || this.isMuted) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(1700, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(220, ctx.currentTime + 0.15);

    gain.gain.setValueAtTime(0.35 * this.volume, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.15);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.15);
  }

  /**
   * Alien hit & destroyed (crunchy white noise pop)
   */
  public playInvaderHit() {
    const ctx = this.getContext();
    if (!ctx || this.isMuted) return;

    const bufferSize = ctx.sampleRate * 0.18;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(800, ctx.currentTime);
    filter.Q.setValueAtTime(1.5, ctx.currentTime);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.5 * this.volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noise.start();
  }

  /**
   * Player Cannon Exploding (Dying crash rumble)
   */
  public playPlayerDeath() {
    const ctx = this.getContext();
    if (!ctx || this.isMuted) return;

    // Noise rumble
    const bufferSize = ctx.sampleRate * 0.8;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(600, ctx.currentTime);
    filter.frequency.linearRampToValueAtTime(60, ctx.currentTime + 0.8);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.6 * this.volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    noise.start();

    // Additional low frequency pitch slide
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(250, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + 0.7);

    oscGain.gain.setValueAtTime(0.3 * this.volume, ctx.currentTime);
    oscGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.7);

    osc.connect(oscGain);
    oscGain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.7);
  }

  /**
   * Mystery UFO Saucer Warble Alarm
   */
  public startUfoSound() {
    const ctx = this.getContext();
    if (!ctx || this.isMuted || this.ufoOsc) return;

    try {
      this.ufoOsc = ctx.createOscillator();
      this.ufoGain = ctx.createGain();
      this.ufoLfo = ctx.createOscillator();

      // High pitch modulated siren
      this.ufoOsc.type = 'triangle';
      this.ufoOsc.frequency.setValueAtTime(360, ctx.currentTime);

      const lfoGain = ctx.createGain();
      lfoGain.gain.setValueAtTime(80, ctx.currentTime);

      this.ufoLfo.frequency.setValueAtTime(6, ctx.currentTime); // 6Hz warble
      this.ufoLfo.connect(lfoGain);
      lfoGain.connect(this.ufoOsc.frequency);

      this.ufoGain.gain.setValueAtTime(0.22 * this.volume, ctx.currentTime);

      this.ufoOsc.connect(this.ufoGain);
      this.ufoGain.connect(ctx.destination);

      this.ufoOsc.start();
      this.ufoLfo.start();
    } catch {
      this.stopUfoSound();
    }
  }

  public stopUfoSound() {
    if (this.ufoOsc) {
      try {
        this.ufoOsc.stop();
        this.ufoOsc.disconnect();
      } catch {}
      this.ufoOsc = null;
    }
    if (this.ufoLfo) {
      try {
        this.ufoLfo.stop();
        this.ufoLfo.disconnect();
      } catch {}
      this.ufoLfo = null;
    }
    if (this.ufoGain) {
      try {
        this.ufoGain.disconnect();
      } catch {}
      this.ufoGain = null;
    }
  }

  /**
   * Mystery UFO Destroyed Chime + Boom
   */
  public playUfoHit() {
    this.stopUfoSound();
    const ctx = this.getContext();
    if (!ctx || this.isMuted) return;

    // High explosion chime
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.35);

    gain.gain.setValueAtTime(0.4 * this.volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.35);

    // Accompanying noise pop
    this.playInvaderHit();
  }

  /**
   * Next Wave Cleared Victory Jingle
   */
  public playWaveClear() {
    const ctx = this.getContext();
    if (!ctx || this.isMuted) return;

    const notes = [440, 554, 659, 880];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const startTime = ctx.currentTime + idx * 0.12;

      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.3 * this.volume, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.18);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.18);
    });
  }
}

export const spaceAudio = new SpaceInvadersAudioEngine();
