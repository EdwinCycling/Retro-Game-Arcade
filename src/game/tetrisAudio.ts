/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Tetris 8-Bit Web Audio Synthesizer
 * Features authentic "Korobeiniki" (Tetris Type-A Theme) & Chiptune SFX
 */

class TetrisAudioEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private isMusicEnabled: boolean = true;
  private musicTimeoutId: number | null = null;
  private isPlayingMusic: boolean = false;
  private currentNoteIndex: number = 0;

  // Korobeiniki (Type-A) melody notes & durations [noteName, durationInSixteenths]
  // Frequencies in Hz:
  // E5: 659.25, B4: 493.88, C5: 523.25, D5: 587.33, E5: 659.25, C5: 523.25, A4: 440.00
  // D5: 587.33, F5: 698.46, A5: 880.00, G5: 783.99, F5: 698.46, E5: 659.25
  // C5: 523.25, E5: 659.25, D5: 587.33, C5: 523.25, B4: 493.88, C5: 523.25, D5: 587.33, E5: 659.25
  // C5: 523.25, A4: 440.00, A4: 440.00
  private readonly melody: Array<[number, number]> = [
    // Part A
    [659.25, 4], // E5
    [493.88, 2], // B4
    [523.25, 2], // C5
    [587.33, 4], // D5
    [523.25, 2], // C5
    [493.88, 2], // B4
    [440.00, 4], // A4
    [440.00, 2], // A4
    [523.25, 2], // C5
    [659.25, 4], // E5
    [587.33, 2], // D5
    [523.25, 2], // C5
    [493.88, 6], // B4
    [523.25, 2], // C5
    [587.33, 4], // D5
    [659.25, 4], // E5
    [523.25, 4], // C5
    [440.00, 4], // A4
    [440.00, 4], // A4
    [0, 4],      // rest

    // Part B
    [587.33, 6], // D5
    [698.46, 2], // F5
    [880.00, 4], // A5
    [783.99, 2], // G5
    [698.46, 2], // F5
    [659.25, 6], // E5
    [523.25, 2], // C5
    [659.25, 4], // E5
    [587.33, 2], // D5
    [523.25, 2], // C5
    [493.88, 4], // B4
    [493.88, 2], // B4
    [523.25, 2], // C5
    [587.33, 4], // D5
    [659.25, 4], // E5
    [523.25, 4], // C5
    [440.00, 4], // A4
    [440.00, 4], // A4
    [0, 4],      // rest
  ];

  // Bass line corresponding to part A & B
  private readonly bassLine: Array<[number, number]> = [
    [164.81, 4], // E3
    [164.81, 4],
    [146.83, 4], // D3
    [146.83, 4],
    [110.00, 4], // A2
    [110.00, 4],
    [123.47, 4], // B2
    [123.47, 4],
    [164.81, 4],
    [164.81, 4],
    [110.00, 4],
    [110.00, 4],
    [146.83, 4],
    [146.83, 4],
    [164.81, 4],
    [164.81, 4],
    [123.47, 4],
    [123.47, 4],
    [110.00, 4],
    [110.00, 4],
  ];

  private ensureContext(): AudioContext | null {
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
      this.stopMusic();
    } else if (this.isMusicEnabled && !this.isPlayingMusic) {
      this.startMusic();
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public setMusicEnabled(enabled: boolean) {
    this.isMusicEnabled = enabled;
    if (!enabled) {
      this.stopMusic();
    } else if (!this.isMuted && !this.isPlayingMusic) {
      this.startMusic();
    }
  }

  public getMusicEnabled(): boolean {
    return this.isMusicEnabled;
  }

  /**
   * Play a square wave 8-bit tone
   */
  private playTone(freq: number, duration: number, volume: number = 0.1, type: OscillatorType = 'square') {
    if (this.isMuted || freq <= 0) return;
    const ctx = this.ensureContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      gain.gain.setValueAtTime(volume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + duration);
    } catch {
      // Audio context might be restricted
    }
  }

  // Sound Effects

  public playMove() {
    if (this.isMuted) return;
    this.playTone(220, 0.05, 0.04, 'triangle');
  }

  public playRotate() {
    if (this.isMuted) return;
    const ctx = this.ensureContext();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(320, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(560, ctx.currentTime + 0.07);
      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.07);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.07);
    } catch {}
  }

  public playSoftDrop() {
    if (this.isMuted) return;
    this.playTone(180, 0.04, 0.03, 'triangle');
  }

  public playHardDrop() {
    if (this.isMuted) return;
    const ctx = this.ensureContext();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(240, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(60, ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } catch {}
  }

  public playHold() {
    if (this.isMuted) return;
    this.playTone(440, 0.08, 0.07, 'sine');
    setTimeout(() => this.playTone(660, 0.08, 0.07, 'sine'), 50);
  }

  public playLineClear() {
    if (this.isMuted) return;
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this.playTone(freq, 0.12, 0.08, 'square');
      }, idx * 60);
    });
  }

  public playTetris() {
    if (this.isMuted) return;
    // Fanfare for 4 lines
    const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98];
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this.playTone(freq, 0.18, 0.12, 'square');
      }, idx * 75);
    });
  }

  public playLevelUp() {
    if (this.isMuted) return;
    const notes = [440, 554.37, 659.25, 880];
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this.playTone(freq, 0.15, 0.1, 'triangle');
      }, idx * 70);
    });
  }

  public playGameOver() {
    if (this.isMuted) return;
    this.stopMusic();
    const notes = [440, 415.30, 392.00, 349.23, 311.13, 261.63];
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this.playTone(freq, 0.25, 0.12, 'sawtooth');
      }, idx * 120);
    });
  }

  // Music Engine (Korobeiniki Loop)

  public startMusic() {
    if (this.isMuted || !this.isMusicEnabled || this.isPlayingMusic) return;
    this.isPlayingMusic = true;
    this.currentNoteIndex = 0;
    this.scheduleNextNote();
  }

  public stopMusic() {
    this.isPlayingMusic = false;
    if (this.musicTimeoutId !== null) {
      clearTimeout(this.musicTimeoutId);
      this.musicTimeoutId = null;
    }
  }

  private scheduleNextNote() {
    if (!this.isPlayingMusic || this.isMuted || !this.isMusicEnabled) {
      this.isPlayingMusic = false;
      return;
    }

    const note = this.melody[this.currentNoteIndex];
    if (!note) {
      this.currentNoteIndex = 0;
      this.scheduleNextNote();
      return;
    }

    const [freq, durationUnits] = note;
    // Each 16th unit is approx 115ms (approx 130 BPM)
    const unitMs = 110;
    const durationMs = durationUnits * unitMs;

    if (freq > 0) {
      // Play lead melody note
      this.playTone(freq, (durationMs / 1000) * 0.85, 0.045, 'square');
    }

    this.currentNoteIndex = (this.currentNoteIndex + 1) % this.melody.length;

    this.musicTimeoutId = window.setTimeout(() => {
      this.scheduleNextNote();
    }, durationMs);
  }
}

export const tetrisAudio = new TetrisAudioEngine();
