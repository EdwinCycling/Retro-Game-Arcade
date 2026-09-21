/**
 * Retro Arcade Web Audio API Synthesizer
 * Generates 100% authentic synthesized sounds using pure Web Audio API oscillators.
 */

class RetroAudioEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private volume: number = 0.35;
  private sirenOsc: OscillatorNode | null = null;
  private sirenGain: GainNode | null = null;
  private currentSirenType: 'none' | 'normal' | 'frightened' | 'eyes' = 'none';
  private wakaToggle: boolean = false;
  private lastWakaTime: number = 0;

  constructor() {
    // Lazy AudioContext initialization on first user interaction
  }

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
      this.stopSiren();
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
  }

  /**
   * Play the iconic authentic Pac-Man game start fanfare!
   */
  public playIntroTheme(onComplete?: () => void) {
    const ctx = this.getContext();
    if (!ctx || this.isMuted) {
      if (onComplete) setTimeout(onComplete, 4200);
      return;
    }

    this.stopSiren();

    // Notes sequence (freq, duration in seconds)
    const B4 = 493.88;
    const B5 = 987.77;
    const FS5 = 739.99;
    const DS5 = 622.25;
    const C5 = 523.25;
    const C6 = 1046.50;
    const G5 = 783.99;
    const E5 = 659.25;
    const D5 = 587.33;
    const DS6 = 1244.51;

    const melody: [number, number][] = [
      [B4, 0.13], [B5, 0.13], [FS5, 0.13], [DS5, 0.13],
      [B5, 0.08], [FS5, 0.13], [DS5, 0.18],
      [C5, 0.13], [C6, 0.13], [G5, 0.13], [E5, 0.13],
      [C6, 0.08], [G5, 0.13], [E5, 0.18],
      [B4, 0.13], [B5, 0.13], [FS5, 0.13], [DS5, 0.13],
      [B5, 0.08], [FS5, 0.13], [DS5, 0.18],
      [DS5, 0.07], [E5, 0.07], [FS5, 0.07],
      [FS5, 0.07], [G5, 0.07], [784, 0.07],
      [830.6, 0.07], [880, 0.07], [932.3, 0.07], [B5, 0.28]
    ];

    let startTime = ctx.currentTime + 0.05;
    melody.forEach(([freq, dur]) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(this.volume * 0.4, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + dur - 0.02);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + dur);

      startTime += dur;
    });

    const totalDuration = (startTime - ctx.currentTime) * 1000;
    if (onComplete) {
      setTimeout(onComplete, Math.max(100, totalDuration));
    }
  }

  /**
   * Dot munching sound (alternates between two pitch modulations)
   */
  public playWaka() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    if (now - this.lastWakaTime < 0.08) return; // limit rate
    this.lastWakaTime = now;

    this.wakaToggle = !this.wakaToggle;
    const startFreq = this.wakaToggle ? 480 : 340;
    const endFreq = this.wakaToggle ? 240 : 180;
    const duration = 0.08;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(startFreq, now);
    osc.frequency.exponentialRampToValueAtTime(endFreq, now + duration);

    gain.gain.setValueAtTime(this.volume * 0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + duration);
  }

  /**
   * Fruit eating chime
   */
  public playEatFruit() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const notes = [440, 554, 659, 880, 1108];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, now + idx * 0.06);

      gain.gain.setValueAtTime(this.volume * 0.35, now + idx * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.06 + 0.1);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.06);
      osc.stop(now + idx * 0.06 + 0.1);
    });
  }

  /**
   * Ghost eaten sound (high chirp sound)
   */
  public playEatGhost() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(200, now);
    osc.frequency.exponentialRampToValueAtTime(900, now + 0.35);

    gain.gain.setValueAtTime(this.volume * 0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.35);
  }

  /**
   * Pac-Man death sound (falling frequencies + pop)
   */
  public playDeath(onComplete?: () => void) {
    this.stopSiren();
    if (this.isMuted) {
      if (onComplete) setTimeout(onComplete, 1600);
      return;
    }
    const ctx = this.getContext();
    if (!ctx) {
      if (onComplete) setTimeout(onComplete, 1600);
      return;
    }

    const now = ctx.currentTime + 0.1;
    const steps = 11;
    const startFreq = 780;
    const stepDur = 0.11;

    for (let i = 0; i < steps; i++) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      const f1 = startFreq - i * 55;
      const f2 = f1 - 40;
      const t = now + i * stepDur;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(f1, t);
      osc.frequency.exponentialRampToValueAtTime(Math.max(60, f2), t + stepDur);

      gain.gain.setValueAtTime(this.volume * 0.45, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + stepDur);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(t);
      osc.stop(t + stepDur);
    }

    // Final pop
    const popTime = now + steps * stepDur + 0.05;
    const popOsc = ctx.createOscillator();
    const popGain = ctx.createGain();

    popOsc.type = 'square';
    popOsc.frequency.setValueAtTime(120, popTime);
    popGain.gain.setValueAtTime(this.volume * 0.5, popTime);
    popGain.gain.exponentialRampToValueAtTime(0.01, popTime + 0.15);

    popOsc.connect(popGain);
    popGain.connect(ctx.destination);

    popOsc.start(popTime);
    popOsc.stop(popTime + 0.15);

    if (onComplete) {
      setTimeout(onComplete, 1600);
    }
  }

  /**
   * Extra life fanfare
   */
  public playExtraLife() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const melody = [523.25, 659.25, 783.99, 1046.50, 783.99, 1046.50];
    melody.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, now + i * 0.09);

      gain.gain.setValueAtTime(this.volume * 0.4, now + i * 0.09);
      gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.09 + 0.12);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + i * 0.09);
      osc.stop(now + i * 0.09 + 0.12);
    });
  }

  /**
   * Background continuous ambient sirens (normal / frightened / eyes returning)
   */
  public updateSiren(type: 'none' | 'normal' | 'frightened' | 'eyes', dotsRemaining: number = 244) {
    if (this.isMuted || type === 'none') {
      this.stopSiren();
      return;
    }

    if (this.currentSirenType === type && this.sirenOsc) {
      // If normal siren, slightly raise pitch as dots decrease
      if (type === 'normal' && this.ctx && this.sirenOsc) {
        const factor = Math.max(0, (244 - dotsRemaining) / 244);
        const baseFreq = 140 + factor * 60;
        this.sirenOsc.frequency.setTargetAtTime(baseFreq, this.ctx.currentTime, 0.1);
      }
      return;
    }

    this.stopSiren();
    const ctx = this.getContext();
    if (!ctx) return;

    this.currentSirenType = type;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    if (type === 'normal') {
      osc.type = 'triangle';
      const factor = Math.max(0, (244 - dotsRemaining) / 244);
      osc.frequency.setValueAtTime(140 + factor * 60, ctx.currentTime);
      gain.gain.setValueAtTime(this.volume * 0.12, ctx.currentTime);
    } else if (type === 'frightened') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(110, ctx.currentTime);
      gain.gain.setValueAtTime(this.volume * 0.18, ctx.currentTime);
    } else if (type === 'eyes') {
      osc.type = 'square';
      osc.frequency.setValueAtTime(750, ctx.currentTime);
      gain.gain.setValueAtTime(this.volume * 0.18, ctx.currentTime);
    }

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();

    this.sirenOsc = osc;
    this.sirenGain = gain;
  }

  public stopSiren() {
    if (this.sirenOsc) {
      try {
        this.sirenOsc.stop();
        this.sirenOsc.disconnect();
      } catch {
        // ignore
      }
      this.sirenOsc = null;
    }
    if (this.sirenGain) {
      try {
        this.sirenGain.disconnect();
      } catch {
        // ignore
      }
      this.sirenGain = null;
    }
    this.currentSirenType = 'none';
  }

  /**
   * Sound when cycling or selecting initials
   */
  public playKeyBlip() {
    const ctx = this.getContext();
    if (!ctx || this.isMuted) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(660, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.05);

    gain.gain.setValueAtTime(this.volume * 0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.06);
  }

  /**
   * Triumphant arcade fanfare when earning a top score
   */
  public playHighScoreFanfare() {
    const ctx = this.getContext();
    if (!ctx || this.isMuted) return;

    this.stopSiren();

    const notes: [number, number][] = [
      [523.25, 0.12], // C5
      [659.25, 0.12], // E5
      [783.99, 0.12], // G5
      [1046.50, 0.28], // C6
      [783.99, 0.10], // G5
      [1046.50, 0.40]  // C6 hold
    ];

    let start = ctx.currentTime + 0.02;
    notes.forEach(([freq, dur]) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, start);

      gain.gain.setValueAtTime(this.volume * 0.4, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + dur - 0.02);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(start);
      osc.stop(start + dur);

      start += dur;
    });
  }
}

export const retroAudio = new RetroAudioEngine();
