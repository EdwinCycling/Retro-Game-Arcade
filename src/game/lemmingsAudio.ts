/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Lemmings (1991 DMA Design / Psygnosis) - Web Audio Chiptune Synthesizer
 * Features authentic "Can-Can", "London Bridge / Rondo", "Drunken Sailor" & Voice Chimes
 */

class LemmingsAudioEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private isMusicEnabled: boolean = true;
  private musicTimeoutId: number | null = null;
  private isPlayingMusic: boolean = false;
  private currentTrackIndex: number = 0;
  private noteIndex: number = 0;

  // Track 1: Offenbach's Can-Can (Iconic Lemmings Theme 1)
  // [freq, sixteenths]
  private readonly canCanMelody: Array<[number, number]> = [
    // Intro
    [523.25, 2], [659.25, 2], [783.99, 2], [1046.50, 4], [880.00, 2], [783.99, 2], [659.25, 4],
    [587.33, 2], [659.25, 2], [698.46, 2], [880.00, 4], [783.99, 2], [659.25, 2], [523.25, 4],
    // High Hook
    [1046.50, 2], [1046.50, 2], [1046.50, 2], [1174.66, 2], [1046.50, 2], [987.77, 2], [880.00, 2], [783.99, 2],
    [880.00, 2], [987.77, 2], [1046.50, 2], [880.00, 2], [783.99, 4], [659.25, 4],
    [587.33, 2], [659.25, 2], [698.46, 2], [880.00, 2], [783.99, 2], [659.25, 2], [587.33, 2], [493.88, 2],
    [523.25, 4], [659.25, 2], [783.99, 2], [523.25, 4], [0, 4]
  ];

  // Track 2: London Bridge & Rondo Alla Turca
  private readonly londonBridgeMelody: Array<[number, number]> = [
    [783.99, 3], [880.00, 1], [783.99, 2], [698.46, 2], [659.25, 2], [698.46, 2], [783.99, 4],
    [587.33, 2], [659.25, 2], [698.46, 4], [659.25, 2], [783.99, 2], [880.00, 4],
    [783.99, 3], [880.00, 1], [783.99, 2], [698.46, 2], [659.25, 2], [698.46, 2], [783.99, 4],
    [587.33, 4], [783.99, 4], [659.25, 2], [523.25, 4], [0, 2]
  ];

  // Track 3: Drunken Sailor
  private readonly drunkenSailorMelody: Array<[number, number]> = [
    [440.00, 2], [440.00, 2], [440.00, 2], [440.00, 2], [440.00, 2], [440.00, 2],
    [440.00, 2], [523.25, 2], [659.25, 2], [587.33, 2],
    [392.00, 2], [392.00, 2], [392.00, 2], [392.00, 2], [392.00, 2], [392.00, 2],
    [392.00, 2], [440.00, 2], [523.25, 2], [493.88, 2],
    [440.00, 2], [440.00, 2], [440.00, 2], [440.00, 2], [440.00, 2], [440.00, 2],
    [440.00, 2], [523.25, 2], [659.25, 2], [587.33, 2],
    [659.25, 2], [587.33, 2], [523.25, 2], [493.88, 2], [440.00, 4], [0, 4]
  ];

  private getAudioContext(): AudioContext | null {
    if (!this.ctx && typeof window !== 'undefined') {
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

  public setMusicEnabled(enabled: boolean) {
    this.isMusicEnabled = enabled;
    if (!enabled) {
      this.stopMusic();
    } else if (!this.isMuted && !this.isPlayingMusic) {
      this.startMusic();
    }
  }

  public selectTrack(trackNum: number) {
    this.currentTrackIndex = trackNum % 3;
    this.noteIndex = 0;
  }

  public startMusic() {
    if (this.isPlayingMusic || this.isMuted || !this.isMusicEnabled) return;
    this.isPlayingMusic = true;
    this.noteIndex = 0;
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
    if (!this.isPlayingMusic || this.isMuted || !this.isMusicEnabled) return;

    const tracks = [this.canCanMelody, this.londonBridgeMelody, this.drunkenSailorMelody];
    const currentMelody = tracks[this.currentTrackIndex] || this.canCanMelody;

    const [freq, durationUnits] = currentMelody[this.noteIndex];
    const tempoMs = 70; // High energy chiptune sixteenth-note duration in ms
    const durationMs = durationUnits * tempoMs;

    if (freq > 0) {
      this.playNote(freq, (durationMs / 1000) * 0.85, 'square', 0.08);
      // Add a light bass arpeggio underneath
      this.playNote(freq / 2, (durationMs / 1000) * 0.7, 'triangle', 0.06);
    }

    this.noteIndex = (this.noteIndex + 1) % currentMelody.length;
    this.musicTimeoutId = window.setTimeout(() => {
      this.scheduleNextNote();
    }, durationMs);
  }

  private playNote(freq: number, duration: number, type: OscillatorType = 'square', volume: number = 0.1) {
    const ctx = this.getAudioContext();
    if (!ctx || this.isMuted) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      gain.gain.setValueAtTime(volume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {
      // Ignore audio error
    }
  }

  // --- Iconic Lemmings SFX ---

  // "Let's Go!" trapdoor chime
  public playLetsGo() {
    if (this.isMuted) return;
    const notes = [523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, i) => {
      setTimeout(() => {
        this.playTone(freq, 0.12, 'triangle', 0.2);
      }, i * 90);
    });
  }

  // "Oh No!" high-pitched voice synthesizer tone
  public playOhNo() {
    if (this.isMuted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      // High pitch descending squeak "Oh..."
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.linearRampToValueAtTime(740, now + 0.15);
      // "...No!"
      osc.frequency.setValueAtTime(987, now + 0.16);
      osc.frequency.exponentialRampToValueAtTime(440, now + 0.35);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.35);
    } catch {
      // Ignore
    }
  }

  // "Yippee!" exit celebration
  public playYippee() {
    if (this.isMuted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(659.25, now);
      osc.frequency.exponentialRampToValueAtTime(1318.51, now + 0.2);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.22);
    } catch {
      // Ignore
    }
  }

  // Splat sound on high fall
  public playSplat() {
    if (this.isMuted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      // White noise burst
      const bufferSize = ctx.sampleRate * 0.15;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, now);
      filter.frequency.exponentialRampToValueAtTime(120, now + 0.15);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      noise.start(now);
    } catch {
      // Ignore
    }
  }

  // Brick placement sound (Builder)
  public playChink(isWarning: boolean = false) {
    if (this.isMuted) return;
    const freq = isWarning ? 1200 : 780;
    this.playTone(freq, 0.06, 'triangle', isWarning ? 0.25 : 0.15);
  }

  // Digging / Pickaxe strike
  public playTink() {
    if (this.isMuted) return;
    this.playTone(480 + Math.random() * 120, 0.05, 'square', 0.1);
  }

  // Parachute / Umbrella open
  public playPop() {
    if (this.isMuted) return;
    this.playTone(880, 0.08, 'sine', 0.2);
  }

  // Explosion Boom (Bomber / Nuke)
  public playBoom() {
    if (this.isMuted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const bufferSize = ctx.sampleRate * 0.4;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.1));
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);

      noise.connect(gain);
      gain.connect(ctx.destination);
      noise.start(now);
    } catch {
      // Ignore
    }
  }

  // Skill assigned ping
  public playSelectSkill() {
    if (this.isMuted) return;
    this.playTone(600, 0.04, 'square', 0.12);
  }

  // Nuke siren
  public playNukeSiren() {
    if (this.isMuted) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(300, now);
      osc.frequency.linearRampToValueAtTime(900, now + 0.2);
      osc.frequency.linearRampToValueAtTime(300, now + 0.4);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.4);
    } catch {
      // Ignore
    }
  }

  private playTone(freq: number, duration: number, type: OscillatorType = 'square', volume: number = 0.15) {
    const ctx = this.getAudioContext();
    if (!ctx || this.isMuted) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      gain.gain.setValueAtTime(volume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {
      // Ignore
    }
  }
}

export const lemmingsAudio = new LemmingsAudioEngine();
