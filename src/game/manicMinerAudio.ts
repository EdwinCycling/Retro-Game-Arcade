/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Sinclair ZX Spectrum 1-bit Beeper Sound Synthesizer for Manic Miner (1983)
 */

class ManicMinerAudio {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private isMusicPlaying: boolean = false;
  private musicInterval: any = null;
  private noteIndex: number = 0;

  // In the Hall of the Mountain King (Edvard Grieg) - The legendary in-game theme of Manic Miner
  private readonly MOUNTAIN_KING_NOTES = [
    { freq: 293.66, dur: 0.15 }, // D4
    { freq: 329.63, dur: 0.15 }, // E4
    { freq: 349.23, dur: 0.15 }, // F4
    { freq: 392.00, dur: 0.15 }, // G4
    { freq: 440.00, dur: 0.15 }, // A4
    { freq: 349.23, dur: 0.15 }, // F4
    { freq: 440.00, dur: 0.30 }, // A4
    
    { freq: 415.30, dur: 0.15 }, // G#4
    { freq: 329.63, dur: 0.15 }, // E4
    { freq: 415.30, dur: 0.30 }, // G#4
    
    { freq: 392.00, dur: 0.15 }, // G4
    { freq: 311.13, dur: 0.15 }, // D#4
    { freq: 392.00, dur: 0.30 }, // G4
    
    { freq: 293.66, dur: 0.15 }, // D4
    { freq: 329.63, dur: 0.15 }, // E4
    { freq: 349.23, dur: 0.15 }, // F4
    { freq: 392.00, dur: 0.15 }, // G4
    { freq: 440.00, dur: 0.15 }, // A4
    { freq: 349.23, dur: 0.15 }, // F4
    { freq: 440.00, dur: 0.15 }, // A4
    { freq: 523.25, dur: 0.15 }, // C5
    { freq: 493.88, dur: 0.15 }, // B4
    { freq: 440.00, dur: 0.15 }, // A4
    { freq: 392.00, dur: 0.15 }, // G4
    { freq: 440.00, dur: 0.30 }, // A4
  ];

  // Blue Danube Waltz (Johann Strauss II) - Title screen theme
  private readonly BLUE_DANUBE_NOTES = [
    { freq: 261.63, dur: 0.25 }, // C4
    { freq: 261.63, dur: 0.25 }, // C4
    { freq: 329.63, dur: 0.25 }, // E4
    { freq: 392.00, dur: 0.25 }, // G4
    { freq: 392.00, dur: 0.50 }, // G4
    { freq: 523.25, dur: 0.50 }, // C5
    { freq: 523.25, dur: 0.50 }, // C5
    { freq: 329.63, dur: 0.25 }, // E4
    { freq: 329.63, dur: 0.25 }, // E4
    { freq: 392.00, dur: 0.25 }, // G4
    { freq: 523.25, dur: 0.25 }, // C5
    { freq: 523.25, dur: 0.50 }, // C5
    { freq: 659.25, dur: 0.50 }, // E5
  ];

  private getContext(): AudioContext | null {
    if (this.ctx) return this.ctx;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    } catch {
      // AudioContext unavailable
    }
    return this.ctx;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted && this.musicInterval) {
      clearInterval(this.musicInterval);
      this.isMusicPlaying = false;
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  /**
   * Generates authentic 1-bit square wave pulse identical to the ZX Spectrum ULA beeper
   */
  private playBeeperTone(freq: number, duration: number, gainVal: number = 0.15) {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(freq, ctx.currentTime);

    // Hard clip envelope to mimic raw 1-bit CPU I/O port toggling
    gain.gain.setValueAtTime(gainVal, ctx.currentTime);
    gain.gain.setValueAtTime(gainVal, ctx.currentTime + duration - 0.005);
    gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  }

  /**
   * Footstep step blip
   */
  public playFootstep() {
    if (this.isMuted) return;
    this.playBeeperTone(180, 0.02, 0.08);
  }

  /**
   * Willy Jump Sound (Spectrum pitch glide up)
   */
  public playJump() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'square';
    const now = ctx.currentTime;
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.12);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.linearRampToValueAtTime(0.01, now + 0.12);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.12);
  }

  /**
   * Item / Key Collected Chime (Bright ZX Spectrum multi-tone arpeggio)
   */
  public playKeyCollect() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const freqs = [523.25, 659.25, 783.99, 1046.50, 1318.51];
    freqs.forEach((f, i) => {
      setTimeout(() => {
        this.playBeeperTone(f, 0.06, 0.18);
      }, i * 40);
    });
  }

  /**
   * Cavern Exit Unlocked Portal Pulse
   */
  public playExitOpen() {
    if (this.isMuted) return;
    const freqs = [300, 450, 600, 750, 900, 1200];
    freqs.forEach((f, i) => {
      setTimeout(() => {
        this.playBeeperTone(f, 0.08, 0.2);
      }, i * 60);
    });
  }

  /**
   * Cavern Completed Level Fanfare
   */
  public playCavernComplete() {
    if (this.isMuted) return;
    const notes = [
      { f: 523.25, d: 0.1 },
      { f: 659.25, d: 0.1 },
      { f: 783.99, d: 0.1 },
      { f: 1046.50, d: 0.25 },
      { f: 880.00, d: 0.1 },
      { f: 1046.50, d: 0.4 },
    ];

    let delay = 0;
    notes.forEach((n) => {
      setTimeout(() => {
        this.playBeeperTone(n.f, n.d, 0.2);
      }, delay);
      delay += n.d * 1000 + 30;
    });
  }

  /**
   * Fall too far / Splat Death sound
   */
  public playDeath() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    // Spectrum low buzz crunch
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    const now = ctx.currentTime;
    osc.frequency.setValueAtTime(120, now);
    osc.frequency.linearRampToValueAtTime(40, now + 0.35);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.linearRampToValueAtTime(0.01, now + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.35);
  }

  /**
   * Giant Monty Python Boot Stomp (Game Over sound)
   */
  public playBootStomp() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    // Thunderous crunch
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'square';
    const now = ctx.currentTime;
    osc.frequency.setValueAtTime(80, now);
    osc.frequency.linearRampToValueAtTime(25, now + 0.5);

    gain.gain.setValueAtTime(0.4, now);
    gain.gain.linearRampToValueAtTime(0.01, now + 0.5);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.5);
  }

  /**
   * Conveyor belt vibration tick
   */
  public playConveyor() {
    if (this.isMuted) return;
    this.playBeeperTone(90, 0.015, 0.05);
  }

  /**
   * Crumbly floor crumbling sound
   */
  public playCrumble() {
    if (this.isMuted) return;
    this.playBeeperTone(140 + Math.random() * 80, 0.02, 0.08);
  }

  /**
   * Start in-game Mountain King music loop
   */
  public startInGameMusic() {
    if (this.isMuted || this.isMusicPlaying) return;
    this.isMusicPlaying = true;
    this.noteIndex = 0;

    const playNextNote = () => {
      if (!this.isMusicPlaying || this.isMuted) return;
      const note = this.MOUNTAIN_KING_NOTES[this.noteIndex];
      this.playBeeperTone(note.freq, note.dur * 0.85, 0.12);
      this.noteIndex = (this.noteIndex + 1) % this.MOUNTAIN_KING_NOTES.length;
      this.musicInterval = setTimeout(playNextNote, note.dur * 1000);
    };

    playNextNote();
  }

  /**
   * Stop in-game music
   */
  public stopMusic() {
    this.isMusicPlaying = false;
    if (this.musicInterval) {
      clearTimeout(this.musicInterval);
      this.musicInterval = null;
    }
  }
}

export const manicMinerAudio = new ManicMinerAudio();
