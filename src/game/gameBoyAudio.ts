/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Nintendo Game Boy (DMG-01) 4-Channel Sound Generator (APU)
 * Synthesizes 2 Pulse channels with variable duty cycles, 1 Custom Wave channel (bass), and 1 Noise channel.
 */

class GameBoyAudio {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private volume: number = 0.5;

  // Active BGM interval/state
  private bgmInterval: number | null = null;
  private activeBgmType: string | null = null;
  private currentStep: number = 0;

  constructor() {
    // Lazy initialized on first user interaction
  }

  private initCtx() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted) {
      this.stopBgm();
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
  }

  public getVolume(): number {
    return this.volume;
  }

  /**
   * Authentic Nintendo Game Boy Boot Chime ("Po-ling!")
   * 1. Low ding ascending tone
   * 2. High crisp two-tone coin-like chime
   */
  public playBootChime() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc1 = this.ctx.createOscillator();
    const gain1 = this.ctx.createGain();

    osc1.type = 'square';
    osc1.frequency.setValueAtTime(523.25, now + 0.4); // C5
    osc1.frequency.setValueAtTime(1046.50, now + 0.6); // C6

    gain1.gain.setValueAtTime(0, now);
    gain1.gain.setValueAtTime(0.3 * this.volume, now + 0.4);
    gain1.gain.setValueAtTime(0.35 * this.volume, now + 0.6);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 1.6);

    osc1.connect(gain1);
    gain1.connect(this.ctx.destination);

    osc1.start(now + 0.4);
    osc1.stop(now + 1.7);
  }

  // ==========================================
  // SUPER MARIO LAND (1989) SOUND EFFECTS
  // ==========================================

  public playMarioJump(isSuper: boolean = false) {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    const startFreq = isSuper ? 160 : 180;
    const endFreq = isSuper ? 480 : 540;

    osc.frequency.setValueAtTime(startFreq, now);
    osc.frequency.exponentialRampToValueAtTime(endFreq, now + 0.16);

    gain.gain.setValueAtTime(0.25 * this.volume, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.18);
  }

  public playSuperballShoot() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(1400, now + 0.08);

    gain.gain.setValueAtTime(0.3 * this.volume, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.1);
  }

  public playSuperballBounce() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(900, now);
    osc.frequency.setValueAtTime(1200, now + 0.03);

    gain.gain.setValueAtTime(0.2 * this.volume, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.06);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.07);
  }

  public playCoin() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(987.77, now); // B5
    osc.frequency.setValueAtTime(1318.51, now + 0.07); // E6

    gain.gain.setValueAtTime(0.28 * this.volume, now);
    gain.gain.setValueAtTime(0.25 * this.volume, now + 0.07);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.36);
  }

  public playCoinCollect() {
    this.playCoin();
  }

  public playStomp() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(60, now + 0.12);

    gain.gain.setValueAtTime(0.35 * this.volume, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.13);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.14);
  }

  public playPowerUp() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const notes = [330, 392, 659, 523, 587, 784];
    const now = this.ctx.currentTime;

    notes.forEach((freq, i) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.25 * this.volume, now + i * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.01, now + (i + 1) * 0.05);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + i * 0.05);
      osc.stop(now + (i + 1) * 0.05 + 0.02);
    });
  }

  public playPowerDown() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const notes = [784, 659, 523, 392, 330];
    const now = this.ctx.currentTime;

    notes.forEach((freq, i) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.22 * this.volume, now + i * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.01, now + (i + 1) * 0.06);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + i * 0.06);
      osc.stop(now + (i + 1) * 0.06 + 0.02);
    });
  }

  public playPipeWarp() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    for (let i = 0; i < 4; i++) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(i % 2 === 0 ? 150 : 300, now + i * 0.08);
      gain.gain.setValueAtTime(0.25 * this.volume, now + i * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.01, now + (i + 1) * 0.08);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + i * 0.08);
      osc.stop(now + (i + 1) * 0.08);
    }
  }

  public playBrickSmash() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(200, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.15);

    gain.gain.setValueAtTime(0.3 * this.volume, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.16);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.17);
  }

  public playMarioDeath() {
    this.stopBgm();
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const melody = [
      { f: 523.25, d: 0.15 }, // C5
      { f: 493.88, d: 0.15 }, // B4
      { f: 440.00, d: 0.15 }, // A4
      { f: 392.00, d: 0.15 }, // G4
      { f: 349.23, d: 0.35 }  // F4
    ];

    let t = this.ctx.currentTime;
    melody.forEach((note) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.value = note.f;
      gain.gain.setValueAtTime(0.28 * this.volume, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + note.d);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + note.d + 0.02);
      t += note.d + 0.03;
    });
  }

  public playStageClear() {
    this.stopBgm();
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const notes = [
      { f: 392, d: 0.1 },
      { f: 523.25, d: 0.1 },
      { f: 659.25, d: 0.1 },
      { f: 783.99, d: 0.2 },
      { f: 659.25, d: 0.15 },
      { f: 783.99, d: 0.4 }
    ];

    let t = this.ctx.currentTime;
    notes.forEach((n) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.value = n.f;
      gain.gain.setValueAtTime(0.3 * this.volume, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + n.d);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + n.d + 0.02);
      t += n.d + 0.04;
    });
  }

  // ==========================================
  // TETRIS GAME BOY (1989) SOUND EFFECTS
  // ==========================================

  public playTetrisMove() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(320, now);

    gain.gain.setValueAtTime(0.2 * this.volume, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.04);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.05);
  }

  public playTetrisRotate() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.setValueAtTime(660, now + 0.03);

    gain.gain.setValueAtTime(0.22 * this.volume, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.07);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.08);
  }

  public playTetrisDrop() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.06);

    gain.gain.setValueAtTime(0.3 * this.volume, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.07);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.08);
  }

  public playTetrisLineClear(count: number) {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    if (count >= 4) {
      // 4-Line Tetris Triumph
      const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51];
      let t = this.ctx.currentTime;
      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'square';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.32 * this.volume, t + idx * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.01, t + (idx + 1) * 0.06 + 0.1);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t + idx * 0.06);
        osc.stop(t + (idx + 1) * 0.06 + 0.12);
      });
    } else {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.setValueAtTime(880, now + 0.06);
      gain.gain.setValueAtTime(0.28 * this.volume, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.22);
    }
  }

  public playTetrisLevelUp() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const notes = [440, 554.37, 659.25, 880];
    let t = this.ctx.currentTime;
    notes.forEach((freq, i) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.28 * this.volume, t + i * 0.07);
      gain.gain.exponentialRampToValueAtTime(0.01, t + (i + 1) * 0.07);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t + i * 0.07);
      osc.stop(t + (i + 1) * 0.07 + 0.02);
    });
  }

  public playRocketLaunch() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;

    // Rocket thruster roar (modulated low noise/sawtooth)
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(60, now);
    osc.frequency.linearRampToValueAtTime(140, now + 3.0);

    gain.gain.setValueAtTime(0.1 * this.volume, now);
    gain.gain.linearRampToValueAtTime(0.4 * this.volume, now + 1.0);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 3.5);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 3.5);

    // Fanfare jingle on top
    setTimeout(() => {
      if (this.ctx && !this.isMuted) {
        const fanNotes = [523.25, 659.25, 783.99, 1046.50, 783.99, 1046.50];
        let t = this.ctx.currentTime;
        fanNotes.forEach((f, idx) => {
          if (!this.ctx) return;
          const o = this.ctx.createOscillator();
          const g = this.ctx.createGain();
          o.type = 'square';
          o.frequency.value = f;
          g.gain.setValueAtTime(0.3 * this.volume, t + idx * 0.12);
          g.gain.exponentialRampToValueAtTime(0.01, t + (idx + 1) * 0.12);
          o.connect(g);
          g.connect(this.ctx.destination);
          o.start(t + idx * 0.12);
          o.stop(t + (idx + 1) * 0.12 + 0.02);
        });
      }
    }, 1200);
  }

  // ==========================================
  // BACKGROUND MUSIC ENGINES (CHIPTUNE)
  // ==========================================

  public startSuperMarioLandBGM() {
    if (this.activeBgmType === 'sml') return;
    this.stopBgm();
    this.activeBgmType = 'sml';
    this.currentStep = 0;

    // Super Mario Land 1-1 Birabuto Theme melody (Hirokazu Tanaka)
    // Note frequencies
    const E4 = 329.63, G4 = 392.00, A4 = 440.00, B4 = 493.88, C5 = 523.25, D5 = 587.33, E5 = 659.25, F5 = 698.46, G5 = 783.99, A5 = 880.00;
    const C3 = 130.81, G3 = 196.00, A3 = 220.00, F3 = 174.61;

    const melody = [
      { m: E5, b: C3 }, { m: E5, b: G3 }, { m: 0, b: 0 }, { m: E5, b: C3 },
      { m: 0, b: 0 }, { m: C5, b: G3 }, { m: E5, b: C3 }, { m: G5, b: G3 },
      { m: 0, b: 0 }, { m: 0, b: 0 }, { m: G4, b: G3 }, { m: 0, b: 0 },
      { m: C5, b: C3 }, { m: 0, b: 0 }, { m: G4, b: G3 }, { m: 0, b: 0 },
      { m: E4, b: C3 }, { m: 0, b: 0 }, { m: A4, b: A3 }, { m: B4, b: G3 },
      { m: A4, b: A3 }, { m: G4, b: G3 }, { m: E5, b: C3 }, { m: G5, b: G3 },
      { m: A5, b: F3 }, { m: F5, b: F3 }, { m: G5, b: G3 }, { m: 0, b: 0 },
      { m: E5, b: C3 }, { m: C5, b: G3 }, { m: D5, b: G3 }, { m: B4, b: G3 }
    ];

    const stepDurationMs = 140;

    this.bgmInterval = window.setInterval(() => {
      if (this.isMuted) return;
      this.initCtx();
      if (!this.ctx) return;

      const item = melody[this.currentStep % melody.length];
      this.currentStep++;

      const now = this.ctx.currentTime;

      // Pulse melody channel
      if (item.m > 0) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'square';
        osc.frequency.value = item.m;
        gain.gain.setValueAtTime(0.18 * this.volume, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + (stepDurationMs / 1000) * 0.85);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + (stepDurationMs / 1000) * 0.9);
      }

      // Wave bass channel
      if (item.b > 0) {
        const bassOsc = this.ctx.createOscillator();
        const bassGain = this.ctx.createGain();
        bassOsc.type = 'triangle';
        bassOsc.frequency.value = item.b;
        bassGain.gain.setValueAtTime(0.22 * this.volume, now);
        bassGain.gain.exponentialRampToValueAtTime(0.01, now + (stepDurationMs / 1000) * 0.9);
        bassOsc.connect(bassGain);
        bassGain.connect(this.ctx.destination);
        bassOsc.start(now);
        bassOsc.stop(now + (stepDurationMs / 1000) * 0.95);
      }
    }, stepDurationMs);
  }

  public startTetrisBGM(type: 'A' | 'B' = 'A') {
    if (this.activeBgmType === `tetris_${type}`) return;
    this.stopBgm();
    this.activeBgmType = `tetris_${type}`;
    this.currentStep = 0;

    // Type A: Korobeiniki
    const E5 = 659.25, B4 = 493.88, C5 = 523.25, D5 = 587.33, A4 = 440.00, G4 = 392.00, F4 = 349.23, E4 = 329.63, GS4 = 415.30, F5 = 698.46, G5 = 783.99, A5 = 880.00;
    const E3 = 164.81, A2 = 110.00, D3 = 146.83, C3 = 130.81, B2 = 123.47, GS2 = 103.83;

    const korobeiniki = [
      { m: E5, b: E3 }, { m: B4, b: E3 }, { m: C5, b: E3 }, { m: D5, b: E3 },
      { m: C5, b: A2 }, { m: B4, b: A2 }, { m: A4, b: A2 }, { m: A4, b: A2 },
      { m: C5, b: A2 }, { m: E5, b: A2 }, { m: D5, b: D3 }, { m: C5, b: D3 },
      { m: B4, b: E3 }, { m: B4, b: E3 }, { m: C5, b: E3 }, { m: D5, b: E3 },
      { m: E5, b: E3 }, { m: C5, b: A2 }, { m: A4, b: A2 }, { m: A4, b: A2 },
      { m: 0, b: 0 }, { m: D5, b: D3 }, { m: F5, b: D3 }, { m: A5, b: D3 },
      { m: G5, b: C3 }, { m: F5, b: C3 }, { m: E5, b: C3 }, { m: C5, b: A2 },
      { m: E5, b: A2 }, { m: D5, b: D3 }, { m: C5, b: D3 }, { m: B4, b: E3 },
      { m: B4, b: E3 }, { m: C5, b: E3 }, { m: D5, b: E3 }, { m: E5, b: E3 },
      { m: C5, b: A2 }, { m: A4, b: A2 }, { m: A4, b: A2 }, { m: 0, b: 0 }
    ];

    const stepDurationMs = 150;

    this.bgmInterval = window.setInterval(() => {
      if (this.isMuted) return;
      this.initCtx();
      if (!this.ctx) return;

      const item = korobeiniki[this.currentStep % korobeiniki.length];
      this.currentStep++;

      const now = this.ctx.currentTime;

      if (item.m > 0) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'square';
        osc.frequency.value = item.m;
        gain.gain.setValueAtTime(0.18 * this.volume, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + (stepDurationMs / 1000) * 0.85);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + (stepDurationMs / 1000) * 0.9);
      }

      if (item.b > 0) {
        const bassOsc = this.ctx.createOscillator();
        const bassGain = this.ctx.createGain();
        bassOsc.type = 'triangle';
        bassOsc.frequency.value = item.b;
        bassGain.gain.setValueAtTime(0.22 * this.volume, now);
        bassGain.gain.exponentialRampToValueAtTime(0.01, now + (stepDurationMs / 1000) * 0.9);
        bassOsc.connect(bassGain);
        bassGain.connect(this.ctx.destination);
        bassOsc.start(now);
        bassOsc.stop(now + (stepDurationMs / 1000) * 0.95);
      }
    }, stepDurationMs);
  }

  // ==========================================
  // DR MARIO (1990) AUDIO
  // ==========================================

  public playDrMarioPillRotate() {
    this.playTone(440, 0.06, 'square', 0.15);
  }

  public playDrMarioVirusClear() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(523.25, now);
    osc.frequency.setValueAtTime(659.25, now + 0.08);
    osc.frequency.setValueAtTime(783.99, now + 0.16);
    gain.gain.setValueAtTime(0.2 * this.volume, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.3);
  }

  public playDrMarioStageClear() {
    this.playTone(880, 0.4, 'square', 0.25);
  }

  public playDrMarioGameOver() {
    this.playTone(180, 0.6, 'sawtooth', 0.3);
  }

  public startDrMarioBGM() {
    if (this.activeBgmType === 'dr_mario') return;
    this.stopBgm();
    this.activeBgmType = 'dr_mario';
    this.currentStep = 0;

    // Fever chiptune
    const C5 = 523.25, E5 = 659.25, G5 = 783.99, A5 = 880.00, D5 = 587.33, B4 = 493.88, C4 = 261.63, G3 = 196.00;
    const notes = [
      { m: C5, b: C4 }, { m: E5, b: G3 }, { m: G5, b: C4 }, { m: A5, b: G3 },
      { m: G5, b: C4 }, { m: E5, b: G3 }, { m: D5, b: C4 }, { m: E5, b: G3 },
      { m: C5, b: C4 }, { m: B4, b: G3 }, { m: C5, b: C4 }, { m: 0, b: 0 }
    ];
    this.startSequencer(notes, 160);
  }

  // ==========================================
  // METROID II (1991) AUDIO
  // ==========================================

  public playMetroidBeam() {
    this.playTone(880, 0.08, 'square', 0.18);
  }

  public playMetroidMissile() {
    this.playTone(320, 0.14, 'sawtooth', 0.25);
  }

  public playMetroidJump() {
    this.playTone(360, 0.12, 'square', 0.15);
  }

  public playMetroidMorph() {
    this.playTone(600, 0.08, 'triangle', 0.2);
  }

  public playMetroidWeaponSwitch() {
    this.playTone(720, 0.05, 'square', 0.15);
  }

  public playMetroidHit() {
    this.playTone(220, 0.06, 'sawtooth', 0.2);
  }

  public playMetroidKilled() {
    this.playTone(150, 0.3, 'sawtooth', 0.3);
  }

  public startMetroid2BGM() {
    if (this.activeBgmType === 'metroid2') return;
    this.stopBgm();
    this.activeBgmType = 'metroid2';
    this.currentStep = 0;

    const A2 = 110.00, C3 = 130.81, D3 = 146.83, E3 = 164.81, G3 = 196.00;
    const notes = [
      { m: A2 * 2, b: A2 }, { m: 0, b: A2 }, { m: C3 * 2, b: C3 }, { m: 0, b: C3 },
      { m: D3 * 2, b: D3 }, { m: 0, b: D3 }, { m: E3 * 2, b: E3 }, { m: G3 * 2, b: A2 }
    ];
    this.startSequencer(notes, 220);
  }

  // ==========================================
  // KIRBY'S DREAM LAND (1992) AUDIO
  // ==========================================

  public playKirbyJump() {
    this.playTone(480, 0.1, 'square', 0.15);
  }

  public playKirbyFloat() {
    this.playTone(640, 0.08, 'triangle', 0.18);
  }

  public playKirbyInhale() {
    this.playTone(260, 0.15, 'sawtooth', 0.12);
  }

  public playKirbyGulp() {
    this.playTone(350, 0.12, 'square', 0.2);
  }

  public playKirbySpit() {
    this.playTone(880, 0.1, 'square', 0.22);
  }

  public playKirbyHit() {
    this.playTone(550, 0.1, 'square', 0.2);
  }

  public playKirbyDamage() {
    this.playTone(180, 0.2, 'sawtooth', 0.25);
  }

  public startKirbyBGM() {
    if (this.activeBgmType === 'kirby') return;
    this.stopBgm();
    this.activeBgmType = 'kirby';
    this.currentStep = 0;

    // Green Greens cheerful theme
    const C5 = 523.25, D5 = 587.33, E5 = 659.25, G5 = 783.99, A5 = 880.00, C6 = 1046.50, C3 = 130.81, G3 = 196.00, F3 = 174.61;
    const notes = [
      { m: C5, b: C3 }, { m: E5, b: G3 }, { m: G5, b: C3 }, { m: C6, b: G3 },
      { m: A5, b: F3 }, { m: G5, b: C3 }, { m: E5, b: G3 }, { m: D5, b: G3 },
      { m: C5, b: C3 }, { m: E5, b: G3 }, { m: G5, b: C3 }, { m: E5, b: G3 }
    ];
    this.startSequencer(notes, 140);
  }

  // ==========================================
  // SUPER MARIO LAND 2 (1992) AUDIO
  // ==========================================

  public playMarioBunnyFlap() {
    this.playTone(620, 0.06, 'triangle', 0.18);
  }

  public startMarioLand2BGM() {
    if (this.activeBgmType === 'sml2') return;
    this.stopBgm();
    this.activeBgmType = 'sml2';
    this.currentStep = 0;

    const G4 = 392.00, E5 = 659.25, C5 = 523.25, D5 = 587.33, C3 = 130.81, G3 = 196.00;
    const notes = [
      { m: G4, b: C3 }, { m: C5, b: G3 }, { m: E5, b: C3 }, { m: D5, b: G3 },
      { m: C5, b: C3 }, { m: G4, b: G3 }, { m: E5, b: C3 }, { m: D5, b: G3 }
    ];
    this.startSequencer(notes, 150);
  }

  // ==========================================
  // ZELDA LINK'S AWAKENING (1993) AUDIO
  // ==========================================

  public playZeldaSwordSlash() {
    this.playTone(700, 0.07, 'square', 0.2);
  }

  public playZeldaShield() {
    this.playTone(280, 0.08, 'triangle', 0.22);
  }

  public playZeldaBushCut() {
    this.playTone(480, 0.08, 'square', 0.18);
  }

  public playZeldaEnemyHit() {
    this.playTone(340, 0.1, 'sawtooth', 0.25);
  }

  public playZeldaDamage() {
    this.playTone(190, 0.2, 'sawtooth', 0.25);
  }

  public startZeldaLaBGM() {
    if (this.activeBgmType === 'zelda_la') return;
    this.stopBgm();
    this.activeBgmType = 'zelda_la';
    this.currentStep = 0;

    // Overworld Koholint Theme
    const Bb4 = 466.16, F4 = 349.23, Bb3 = 233.08, Eb4 = 311.13, F3 = 174.61;
    const notes = [
      { m: Bb4, b: Bb3 }, { m: F4, b: F3 }, { m: Bb4, b: Bb3 }, { m: Eb4, b: Eb4 },
      { m: F4, b: F3 }, { m: Bb4, b: Bb3 }, { m: 0, b: 0 }
    ];
    this.startSequencer(notes, 180);
  }

  // ==========================================
  // DONKEY KONG '94 AUDIO
  // ==========================================

  public playDk94KeyGrab() {
    this.playTone(660, 0.12, 'square', 0.22);
  }

  public playDk94DoorUnlock() {
    this.playTone(880, 0.3, 'square', 0.25);
  }

  public startDk94BGM() {
    if (this.activeBgmType === 'dk94') return;
    this.stopBgm();
    this.activeBgmType = 'dk94';
    this.currentStep = 0;

    const C4 = 261.63, E4 = 329.63, G4 = 392.00, Bb4 = 466.16, C3 = 130.81;
    const notes = [
      { m: C4, b: C3 }, { m: E4, b: C3 }, { m: G4, b: C3 }, { m: Bb4, b: C3 },
      { m: G4, b: C3 }, { m: E4, b: C3 }, { m: C4, b: C3 }, { m: 0, b: 0 }
    ];
    this.startSequencer(notes, 160);
  }

  // ==========================================
  // POKEMON RED & BLUE (1996) AUDIO
  // ==========================================

  public playPokemonAttack() {
    this.playTone(520, 0.12, 'sawtooth', 0.25);
  }

  public playPokemonVictory() {
    this.playTone(980, 0.4, 'square', 0.25);
  }

  public startPokemonRedBGM() {
    if (this.activeBgmType === 'pokemon_red') return;
    this.stopBgm();
    this.activeBgmType = 'pokemon_red';
    this.currentStep = 0;

    // Pallet Town peaceful theme
    const G4 = 392.00, C5 = 523.25, D5 = 587.33, E5 = 659.25, C3 = 130.81, G3 = 196.00;
    const notes = [
      { m: G4, b: C3 }, { m: C5, b: G3 }, { m: D5, b: C3 }, { m: E5, b: G3 },
      { m: D5, b: C3 }, { m: C5, b: G3 }, { m: G4, b: C3 }, { m: 0, b: 0 }
    ];
    this.startSequencer(notes, 200);
  }

  public startPokemonBattleBGM() {
    if (this.activeBgmType === 'pokemon_battle') return;
    this.stopBgm();
    this.activeBgmType = 'pokemon_battle';
    this.currentStep = 0;

    // Fast Battle Theme
    const A4 = 440.00, C5 = 523.25, E5 = 659.25, A3 = 220.00, E3 = 164.81;
    const notes = [
      { m: A4, b: A3 }, { m: C5, b: E3 }, { m: E5, b: A3 }, { m: C5, b: E3 },
      { m: A4, b: A3 }, { m: E5, b: E3 }, { m: A4, b: A3 }, { m: 0, b: 0 }
    ];
    this.startSequencer(notes, 120);
  }

  // ==========================================
  // WARIO LAND II (1998) AUDIO
  // ==========================================

  public playWarioJump() {
    this.playTone(340, 0.12, 'square', 0.18);
  }

  public playWarioBash() {
    this.playTone(220, 0.18, 'sawtooth', 0.25);
  }

  public playWarioGroundPound() {
    this.playTone(140, 0.25, 'sawtooth', 0.3);
  }

  public playWarioBlockBreak() {
    this.playTone(400, 0.1, 'square', 0.22);
  }

  public playWarioEnemyHit() {
    this.playTone(280, 0.12, 'sawtooth', 0.25);
  }

  public startWarioLand2BGM() {
    if (this.activeBgmType === 'wario2') return;
    this.stopBgm();
    this.activeBgmType = 'wario2';
    this.currentStep = 0;

    const F4 = 349.23, A4 = 440.00, C5 = 523.25, Eb5 = 622.25, F3 = 174.61, C3 = 130.81;
    const notes = [
      { m: F4, b: F3 }, { m: A4, b: C3 }, { m: C5, b: F3 }, { m: Eb5, b: C3 },
      { m: C5, b: F3 }, { m: A4, b: C3 }, { m: F4, b: F3 }, { m: 0, b: 0 }
    ];
    this.startSequencer(notes, 170);
  }

  private playTone(freq: number, dur: number, type: OscillatorType, vol: number) {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    gain.gain.setValueAtTime(vol * this.volume, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + dur);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + dur);
  }

  private startSequencer(notes: { m: number; b: number }[], stepDurationMs: number) {
    this.bgmInterval = window.setInterval(() => {
      if (this.isMuted) return;
      this.initCtx();
      if (!this.ctx) return;

      const item = notes[this.currentStep % notes.length];
      this.currentStep++;
      const now = this.ctx.currentTime;

      if (item.m > 0) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'square';
        osc.frequency.value = item.m;
        gain.gain.setValueAtTime(0.16 * this.volume, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + (stepDurationMs / 1000) * 0.85);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + (stepDurationMs / 1000) * 0.9);
      }

      if (item.b > 0) {
        const bassOsc = this.ctx.createOscillator();
        const bassGain = this.ctx.createGain();
        bassOsc.type = 'triangle';
        bassOsc.frequency.value = item.b;
        bassGain.gain.setValueAtTime(0.2 * this.volume, now);
        bassGain.gain.exponentialRampToValueAtTime(0.01, now + (stepDurationMs / 1000) * 0.9);
        bassOsc.connect(bassGain);
        bassGain.connect(this.ctx.destination);
        bassOsc.start(now);
        bassOsc.stop(now + (stepDurationMs / 1000) * 0.95);
      }
    }, stepDurationMs);
  }

  public stopBgm() {
    if (this.bgmInterval !== null) {
      clearInterval(this.bgmInterval);
      this.bgmInterval = null;
    }
    this.activeBgmType = null;
    this.currentStep = 0;
  }
}

export const gameBoyAudio = new GameBoyAudio();
