/**
 * Impossible Mission (1984 - Epyx / Dennis Caswell / Commodore 64)
 * Authentic Web Audio API Procedural Synthesizer
 * 
 * Features:
 * - Digitized speech formant synthesis:
 *   "Another visitor... Stay a while, stay forever!"
 *   "Destroy him, my robots!"
 *   Iconic pitch-dropping falling scream ("Aaaiiieeeeee!")
 * - Authentic Commodore 64 SID 6581 sound effects:
 *   Footstep taps, jump somersault whoosh, elevator hydraulic hum,
 *   furniture searching pulses, robot electric laser zaps, terminal beeps,
 *   puzzle assembly fanfare, and clock tick.
 */

class ImpossibleMissionAudio {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;

  private initCtx() {
    if (!this.ctx) {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtxClass();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }

  /**
   * Iconic Falling Scream ("Aaaaiiieeeeee!")
   * The most famous death sound of the 8-bit era.
   */
  public playFallingScream() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc1.type = 'sawtooth';
    osc2.type = 'triangle';

    // Downward pitch bend from ~680Hz down to 90Hz over 2.4 seconds
    osc1.frequency.setValueAtTime(680, now);
    osc1.frequency.exponentialRampToValueAtTime(85, now + 2.4);

    osc2.frequency.setValueAtTime(675, now);
    osc2.frequency.exponentialRampToValueAtTime(80, now + 2.4);

    // Formant vocal tract resonance filter
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1200, now);
    filter.frequency.exponentialRampToValueAtTime(320, now + 2.4);
    filter.Q.setValueAtTime(4.0, now);

    // Envelope
    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.35, now + 0.15);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 2.5);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 2.5);
    osc2.stop(now + 2.5);
  }

  /**
   * Procedural Formant Speech: "Stay a while, stay forever!"
   * Synthesizes the menacing robotic voice of Professor Elvin Atombender.
   */
  public playElvinWelcome() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    // Sequence of phoneme formants to evoke:
    // "AN-O-THER VI-SI-TOR... STAY A WHILE... STAY FOR-E-VER!"
    const syllables = [
      { f1: 650, f2: 1200, f3: 2400, dur: 0.14, pitch: 110 }, // An
      { f1: 500, f2: 1000, f3: 2200, dur: 0.12, pitch: 115 }, // no
      { f1: 450, f2: 1400, f3: 2100, dur: 0.16, pitch: 105 }, // ther
      { f1: 300, f2: 2100, f3: 2700, dur: 0.13, pitch: 110 }, // vi
      { f1: 350, f2: 1800, f3: 2500, dur: 0.12, pitch: 112 }, // si
      { f1: 550, f2: 1100, f3: 2000, dur: 0.22, pitch: 98 },  // tor
      { pause: 0.2 },
      { f1: 450, f2: 1700, f3: 2400, dur: 0.20, pitch: 105 }, // stay
      { f1: 700, f2: 1200, f3: 2400, dur: 0.12, pitch: 108 }, // a
      { f1: 400, f2: 1900, f3: 2600, dur: 0.24, pitch: 102 }, // while
      { pause: 0.22 },
      { f1: 450, f2: 1700, f3: 2400, dur: 0.22, pitch: 115 }, // stay
      { f1: 400, f2: 1000, f3: 2200, dur: 0.16, pitch: 110 }, // for
      { f1: 500, f2: 1600, f3: 2300, dur: 0.16, pitch: 100 }, // e
      { f1: 450, f2: 1300, f3: 1900, dur: 0.38, pitch: 85 }   // ver!
    ];

    let t = this.ctx.currentTime + 0.05;

    syllables.forEach((s) => {
      if ('pause' in s && s.pause) {
        t += s.pause;
        return;
      }
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const noise = this.createNoiseNode(this.ctx);
      const f1 = this.ctx.createBiquadFilter();
      const f2 = this.ctx.createBiquadFilter();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(s.pitch || 105, t);

      f1.type = 'bandpass';
      f1.frequency.setValueAtTime(s.f1 || 500, t);
      f1.Q.setValueAtTime(5.0, t);

      f2.type = 'bandpass';
      f2.frequency.setValueAtTime(s.f2 || 1500, t);
      f2.Q.setValueAtTime(5.0, t);

      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(0.22, t + 0.02);
      gain.gain.linearRampToValueAtTime(0.001, t + (s.dur || 0.15));

      osc.connect(f1);
      osc.connect(f2);
      f1.connect(gain);
      f2.connect(gain);
      if (noise) {
        const noiseGain = this.ctx.createGain();
        noiseGain.gain.setValueAtTime(0.03, t);
        noise.connect(noiseGain);
        noiseGain.connect(gain);
      }
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + (s.dur || 0.15) + 0.02);

      t += (s.dur || 0.15) + 0.04;
    });
  }

  /**
   * Procedural Formant Speech: "Destroy him, my robots!"
   */
  public playDestroyHim() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const syllables = [
      { f1: 450, f2: 1600, dur: 0.14, pitch: 95 },  // Des-
      { f1: 400, f2: 1200, dur: 0.18, pitch: 105 }, // troy
      { f1: 350, f2: 1900, dur: 0.14, pitch: 100 }, // him
      { pause: 0.1 },
      { f1: 450, f2: 1400, dur: 0.15, pitch: 105 }, // my
      { f1: 450, f2: 1000, dur: 0.14, pitch: 95 },  // ro-
      { f1: 550, f2: 1100, dur: 0.22, pitch: 85 }   // bots!
    ];

    let t = this.ctx.currentTime + 0.05;
    syllables.forEach((s) => {
      if ('pause' in s && s.pause) {
        t += s.pause;
        return;
      }
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const filter = this.ctx.createBiquadFilter();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(s.pitch || 95, t);

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(s.f1 || 500, t);
      filter.Q.setValueAtTime(4.5, t);

      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(0.20, t + 0.02);
      gain.gain.linearRampToValueAtTime(0.001, t + (s.dur || 0.15));

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + (s.dur || 0.15) + 0.02);
      t += (s.dur || 0.15) + 0.04;
    });
  }

  /**
   * Footstep click
   */
  public playFootstep() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(120, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.04);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.05);
  }

  /**
   * Somersault Jump whoosh
   */
  public playJump() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(520, now + 0.25);

    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.15, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.3);
  }

  /**
   * Furniture searching beep pulse
   */
  public playSearchTick() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.setValueAtTime(1174, now + 0.03);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.07);
  }

  /**
   * Found puzzle piece fanfare
   */
  public playPieceFound() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const t = now + idx * 0.08;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.18, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.16);
    });
  }

  /**
   * Robot Electric Laser Zap
   */
  public playRobotZap() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(1400, now);
    osc.frequency.linearRampToValueAtTime(200, now + 0.18);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(3000, now);

    gain.gain.setValueAtTime(0.22, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.22);
  }

  /**
   * Elevator hydraulic movement hum
   */
  public playElevatorHum() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(75, now);
    osc.frequency.linearRampToValueAtTime(85, now + 0.15);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.2);
  }

  /**
   * Terminal Snooze Activated
   */
  public playSnooze() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(220, now + 0.4);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.5);
  }

  /**
   * Penalty Buzzer (-10:00 penalty on death)
   */
  public playPenaltyBuzzer() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(90, now);
    osc.frequency.setValueAtTime(70, now + 0.15);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.45);
  }

  private createNoiseNode(ctx: AudioContext): AudioNode | null {
    const bufferSize = ctx.sampleRate * 0.5;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;
    noise.start(ctx.currentTime);
    return noise;
  }
}

export const impossibleMissionAudio = new ImpossibleMissionAudio();
