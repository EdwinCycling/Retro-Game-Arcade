/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Spy Fox: Operatie Melkzuur (1997 Humongous Entertainment / SCUMM)
 * Procedural Web Audio Engine for Funky Spy Themes & Retro Sound Effects
 */

class SpyFoxAudio {
  private ctx: AudioContext | null = null;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private isMuted: boolean = false;
  private isMusicPlaying: boolean = false;
  private musicTimeout: number | null = null;
  private noteIndex: number = 0;

  private init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();

      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.setValueAtTime(this.isMuted ? 0 : 0.12, this.ctx.currentTime);
      this.musicGain.connect(this.ctx.destination);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.setValueAtTime(this.isMuted ? 0 : 0.22, this.ctx.currentTime);
      this.sfxGain.connect(this.ctx.destination);
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.ctx) {
      if (this.musicGain) {
        this.musicGain.gain.setValueAtTime(muted ? 0 : 0.12, this.ctx.currentTime);
      }
      if (this.sfxGain) {
        this.sfxGain.gain.setValueAtTime(muted ? 0 : 0.22, this.ctx.currentTime);
      }
    }
  }

  public playClick() {
    this.init();
    if (this.isMuted || !this.ctx || !this.sfxGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(400, this.ctx.currentTime + 0.04);

    gain.gain.setValueAtTime(0.18, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.04);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.04);
  }

  public playLaserToothpick() {
    this.init();
    if (this.isMuted || !this.ctx || !this.sfxGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(1400, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(320, this.ctx.currentTime + 0.25);

    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.25);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.25);
  }

  public playGadgetWhir() {
    this.init();
    if (this.isMuted || !this.ctx || !this.sfxGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(300, this.ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(850, this.ctx.currentTime + 0.18);
    osc.frequency.linearRampToValueAtTime(600, this.ctx.currentTime + 0.3);

    gain.gain.setValueAtTime(0.18, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.3);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.3);
  }

  public playDialogBlip(pitchOffset: number = 0) {
    this.init();
    if (this.isMuted || !this.ctx || !this.sfxGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(420 + pitchOffset, this.ctx.currentTime);
    gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.005, this.ctx.currentTime + 0.04);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.04);
  }

  public playCoin() {
    this.init();
    if (this.isMuted || !this.ctx || !this.sfxGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(987.77, this.ctx.currentTime);
    osc.frequency.setValueAtTime(1318.51, this.ctx.currentTime + 0.07);

    gain.gain.setValueAtTime(0.18, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.35);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.35);
  }

  public playSuccessJingle() {
    this.init();
    if (this.isMuted || !this.ctx || !this.sfxGain) return;

    const notes = [523.25, 659.25, 783.99, 1046.50]; // C - E - G - C
    notes.forEach((freq, idx) => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.12);

      gain.gain.setValueAtTime(0.2, this.ctx.currentTime + idx * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + idx * 0.12 + 0.25);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(this.ctx.currentTime + idx * 0.12);
      osc.stop(this.ctx.currentTime + idx * 0.12 + 0.25);
    });
  }

  /**
   * Iconic Spy Fox Funky 70s/90s Secret Agent Bassline & Brass Riff
   */
  public startSpyTheme() {
    this.init();
    if (this.isMusicPlaying) return;
    this.isMusicPlaying = true;
    this.noteIndex = 0;
    this.scheduleNextBassline();
  }

  public stopSpyTheme() {
    this.isMusicPlaying = false;
    if (this.musicTimeout !== null) {
      window.clearTimeout(this.musicTimeout);
      this.musicTimeout = null;
    }
  }

  private scheduleNextBassline() {
    if (!this.isMusicPlaying) return;

    // Classic 007 / Spy Fox funk bassline in E minor
    const bassline = [
      { freq: 82.41, dur: 0.22, delay: 240 }, // E2
      { freq: 82.41, dur: 0.16, delay: 240 }, // E2
      { freq: 98.00, dur: 0.22, delay: 240 }, // G2
      { freq: 82.41, dur: 0.20, delay: 240 }, // E2
      { freq: 110.00, dur: 0.26, delay: 240 }, // A2
      { freq: 103.83, dur: 0.22, delay: 240 }, // Ab2
      { freq: 98.00, dur: 0.22, delay: 240 }, // G2
      { freq: 73.42, dur: 0.22, delay: 240 }, // D2
    ];

    const currentNote = bassline[this.noteIndex % bassline.length];

    if (!this.isMuted && this.ctx && this.musicGain) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(currentNote.freq, this.ctx.currentTime);

      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.02, this.ctx.currentTime + currentNote.dur);

      // Low pass filter for warm funky bass
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(380, this.ctx.currentTime);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.musicGain);

      osc.start(this.ctx.currentTime);
      osc.stop(this.ctx.currentTime + currentNote.dur);
    }

    this.noteIndex++;
    this.musicTimeout = window.setTimeout(() => {
      this.scheduleNextBassline();
    }, currentNote.delay);
  }
}

export const spyFoxAudio = new SpyFoxAudio();
