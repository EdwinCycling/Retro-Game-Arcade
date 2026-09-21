/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Super Mario Bros. (1985 NES) - Authentic Multi-Track Chiptune Synthesizer
 * Reproduces the Ricoh 2A03 5-channel NES sound chip:
 * Square, Triangle, Noise channels for Overworld, Underground, Castle, Underwater, Starman.
 */

export type MarioMusicTrack = 'overworld' | 'athletic' | 'underground' | 'castle' | 'underwater' | 'starman' | 'none';

class SuperMarioAudioEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private masterGain: GainNode | null = null;
  private currentTrack: MarioMusicTrack = 'none';
  private musicTimeout: number | null = null;

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.35, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(muted ? 0 : 0.35, this.ctx.currentTime);
    }
    if (muted && this.currentTrack !== 'none') {
      this.stopMusic();
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  // Jump small sound (fast rising frequency chirp)
  public playJumpSmall() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const t = this.ctx.currentTime;

    osc.type = 'square';
    osc.frequency.setValueAtTime(140, t);
    osc.frequency.exponentialRampToValueAtTime(620, t + 0.16);

    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.18);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.18);
  }

  // Jump super sound (richer, lower base)
  public playJumpSuper() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const t = this.ctx.currentTime;

    osc.type = 'square';
    osc.frequency.setValueAtTime(110, t);
    osc.frequency.exponentialRampToValueAtTime(740, t + 0.22);

    gain.gain.setValueAtTime(0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.24);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.24);
  }

  // Coin collect ping (B5 -> E6)
  public playCoin() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(987.77, t); // B5
    osc.frequency.setValueAtTime(1318.51, t + 0.08); // E6

    gain.gain.setValueAtTime(0.35, t);
    gain.gain.setValueAtTime(0.35, t + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.35);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.36);
  }

  // Block bump (head hit without break)
  public playBlockBump() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(180, t);
    osc.frequency.exponentialRampToValueAtTime(60, t + 0.1);

    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.12);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.12);
  }

  // Brick break (shattering into fragments)
  public playBrickBreak() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;
    const bufferSize = this.ctx.sampleRate * 0.18;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.18);

    noise.connect(gain);
    gain.connect(this.masterGain);
    noise.start(t);
  }

  // Stomp enemy
  public playStomp() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(280, t);
    osc.frequency.exponentialRampToValueAtTime(70, t + 0.12);

    gain.gain.setValueAtTime(0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.14);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.14);
  }

  // Kick turtle shell
  public playKick() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(320, t);
    osc.frequency.exponentialRampToValueAtTime(90, t + 0.15);

    gain.gain.setValueAtTime(0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.16);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.16);
  }

  // Mushroom / Powerup emerge
  public playPowerupSprout() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;
    const freqs = [330, 392, 659, 523, 587, 784];
    freqs.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      const startTime = t + idx * 0.06;
      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, startTime);
      gain.gain.setValueAtTime(0.2, startTime);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.055);
      osc.connect(gain);
      gain.connect(this.masterGain!);
      osc.start(startTime);
      osc.stop(startTime + 0.06);
    });
  }

  // Powerup collect
  public playPowerupCollect() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;
    const notes = [
      330, 392, 659, 523, 587, 784,
      370, 415, 698, 554, 622, 830,
      392, 440, 740, 587, 659, 880
    ];
    notes.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      const st = t + idx * 0.035;
      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, st);
      gain.gain.setValueAtTime(0.22, st);
      gain.gain.exponentialRampToValueAtTime(0.01, st + 0.033);
      osc.connect(gain);
      gain.connect(this.masterGain!);
      osc.start(st);
      osc.stop(st + 0.035);
    });
  }

  // 1-Up Chime (E6, G6, E7, C7, D7, G7)
  public play1Up() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;
    const notes = [1318.5, 1568.0, 2637.0, 2093.0, 2349.3, 3136.0];
    notes.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      const st = t + idx * 0.07;
      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, st);
      gain.gain.setValueAtTime(0.25, st);
      gain.gain.exponentialRampToValueAtTime(0.01, st + 0.065);
      osc.connect(gain);
      gain.connect(this.masterGain!);
      osc.start(st);
      osc.stop(st + 0.07);
    });
  }

  // Fireball shoot sound (High chirp sweep)
  public playFireball() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(900, t);
    osc.frequency.exponentialRampToValueAtTime(200, t + 0.09);

    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.1);
  }

  // Pipe entry / Mario shrink
  public playPipe() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(320, t);
    osc.frequency.exponentialRampToValueAtTime(65, t + 0.35);

    gain.gain.setValueAtTime(0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.38);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.38);
  }

  // Bowser Fire Breath / Fall
  public playBowserFlame() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;
    const bufferSize = this.ctx.sampleRate * 0.4;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.sin((i / bufferSize) * Math.PI);
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.4);

    noise.connect(gain);
    gain.connect(this.masterGain);
    noise.start(t);
  }

  public playBowserFall() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(250, t);
    osc.frequency.exponentialRampToValueAtTime(40, t + 0.8);

    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.85);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.85);
  }

  // Mario death jingle
  public playDeath() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    this.stopMusic();
    const t = this.ctx.currentTime;
    const notes: [number, number][] = [
      [587.33, 0.15],
      [554.37, 0.15],
      [523.25, 0.15],
      [493.88, 0.3],
      [392.00, 0.2],
      [440.00, 0.2],
      [493.88, 0.35],
    ];

    let offset = 0;
    notes.forEach(([freq, dur]) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      const st = t + offset;
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, st);
      gain.gain.setValueAtTime(0.35, st);
      gain.gain.exponentialRampToValueAtTime(0.01, st + dur - 0.02);
      osc.connect(gain);
      gain.connect(this.masterGain!);
      osc.start(st);
      osc.stop(st + dur);
      offset += dur;
    });
  }

  // Flagpole slide & level clear fanfare
  public playStageClear() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    this.stopMusic();
    const t = this.ctx.currentTime;
    const slide = this.ctx.createOscillator();
    const slideGain = this.ctx.createGain();
    slide.type = 'triangle';
    slide.frequency.setValueAtTime(550, t);
    slide.frequency.exponentialRampToValueAtTime(140, t + 0.6);
    slideGain.gain.setValueAtTime(0.3, t);
    slideGain.gain.exponentialRampToValueAtTime(0.01, t + 0.6);
    slide.connect(slideGain);
    slideGain.connect(this.masterGain);
    slide.start(t);
    slide.stop(t + 0.6);

    const fanfare: [number, number][] = [
      [392, 0.12], [523.25, 0.12], [659.25, 0.12],
      [783.99, 0.12], [1046.5, 0.25], [783.99, 0.12], [1046.5, 0.4]
    ];
    let offset = 0.7;
    fanfare.forEach(([freq, dur]) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      const st = t + offset;
      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, st);
      gain.gain.setValueAtTime(0.3, st);
      gain.gain.exponentialRampToValueAtTime(0.01, st + dur - 0.02);
      osc.connect(gain);
      gain.connect(this.masterGain!);
      osc.start(st);
      osc.stop(st + dur);
      offset += dur;
    });
  }

  // World Clear / Princess Rescued Fanfare
  public playWorldClear() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    this.stopMusic();
    const t = this.ctx.currentTime;
    const melody: [number, number][] = [
      [523.25, 0.15], [659.25, 0.15], [783.99, 0.15], [1046.5, 0.3],
      [880.0, 0.15], [1046.5, 0.15], [1174.66, 0.15], [1318.5, 0.4],
      [1046.5, 0.2], [1318.5, 0.2], [1568.0, 0.6]
    ];
    let offset = 0;
    melody.forEach(([freq, dur]) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      const st = t + offset;
      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, st);
      gain.gain.setValueAtTime(0.3, st);
      gain.gain.exponentialRampToValueAtTime(0.01, st + dur - 0.02);
      osc.connect(gain);
      gain.connect(this.masterGain!);
      osc.start(st);
      osc.stop(st + dur);
      offset += dur;
    });
  }

  // Music Player Router
  public playMusic(theme: MarioMusicTrack) {
    if (this.isMuted) return;
    if (this.currentTrack === theme) return;
    this.stopMusic();
    this.currentTrack = theme;

    if (theme === 'overworld' || theme === 'athletic') {
      this.playOverworldChunk();
    } else if (theme === 'underground') {
      this.playUndergroundChunk();
    } else if (theme === 'castle') {
      this.playCastleChunk();
    } else if (theme === 'underwater') {
      this.playUnderwaterChunk();
    } else if (theme === 'starman') {
      this.playStarmanChunk();
    }
  }

  public startOverworldTheme() {
    this.playMusic('overworld');
  }

  public stopMusic() {
    this.currentTrack = 'none';
    if (this.musicTimeout !== null) {
      window.clearTimeout(this.musicTimeout);
      this.musicTimeout = null;
    }
  }

  // Overworld Music Theme Loop
  private playOverworldChunk() {
    if (this.currentTrack !== 'overworld' && this.currentTrack !== 'athletic') return;
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;
    const notes: [number, number, number][] = [
      [659.25, 0.12, 0.0],
      [659.25, 0.12, 0.16],
      [0, 0.08, 0.32],
      [659.25, 0.12, 0.44],
      [0, 0.08, 0.60],
      [523.25, 0.12, 0.72],
      [659.25, 0.16, 0.88],
      [0, 0.08, 1.08],
      [783.99, 0.24, 1.20],
      [0, 0.16, 1.50],
      [392.00, 0.24, 1.70],
      [0, 0.20, 2.00],

      [523.25, 0.18, 2.25],
      [392.00, 0.18, 2.58],
      [329.63, 0.18, 2.91],
      [440.00, 0.16, 3.24],
      [493.88, 0.16, 3.44],
      [466.16, 0.12, 3.64],
      [440.00, 0.16, 3.80],
      [392.00, 0.18, 4.00],
      [659.25, 0.16, 4.22],
      [783.99, 0.16, 4.42],
      [880.00, 0.20, 4.62],
      [698.46, 0.14, 4.86],
      [783.99, 0.16, 5.04],
      [659.25, 0.16, 5.36],
      [523.25, 0.14, 5.56],
      [587.33, 0.14, 5.74],
      [493.88, 0.22, 5.92],
    ];

    const totalDuration = 6.4;
    notes.forEach(([freq, dur, offset]) => {
      if (freq <= 0) return;
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      const startTime = t + offset;
      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, startTime);
      gain.gain.setValueAtTime(0.12, startTime);
      gain.gain.exponentialRampToValueAtTime(0.008, startTime + dur);
      osc.connect(gain);
      gain.connect(this.masterGain!);
      osc.start(startTime);
      osc.stop(startTime + dur);
    });

    this.musicTimeout = window.setTimeout(() => {
      if (this.currentTrack === 'overworld' || this.currentTrack === 'athletic') {
        this.playOverworldChunk();
      }
    }, totalDuration * 1000);
  }

  // Underground Bass Theme Loop (C3, C4, A2, A3, Bb2, Bb3)
  private playUndergroundChunk() {
    if (this.currentTrack !== 'underground') return;
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;
    const motif: [number, number, number][] = [
      [130.81, 0.12, 0.0],  // C3
      [261.63, 0.12, 0.15], // C4
      [110.00, 0.12, 0.30], // A2
      [220.00, 0.12, 0.45], // A3
      [116.54, 0.12, 0.60], // Bb2
      [233.08, 0.12, 0.75], // Bb3
      [0, 0.2, 0.90],
    ];

    const loopLen = 1.2;
    for (let rep = 0; rep < 4; rep++) {
      const repOffset = rep * loopLen;
      motif.forEach(([freq, dur, offset]) => {
        if (freq <= 0) return;
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        const startTime = t + repOffset + offset;
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, startTime);
        gain.gain.setValueAtTime(0.25, startTime);
        gain.gain.exponentialRampToValueAtTime(0.01, startTime + dur);
        osc.connect(gain);
        gain.connect(this.masterGain!);
        osc.start(startTime);
        osc.stop(startTime + dur);
      });
    }

    this.musicTimeout = window.setTimeout(() => {
      if (this.currentTrack === 'underground') {
        this.playUndergroundChunk();
      }
    }, loopLen * 4 * 1000);
  }

  // Castle Theme Loop (tense chromatic arpeggio)
  private playCastleChunk() {
    if (this.currentTrack !== 'castle') return;
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;
    const motif: [number, number, number][] = [
      [146.83, 0.1, 0.0],  // D3
      [155.56, 0.1, 0.12], // Eb3
      [164.81, 0.1, 0.24], // E3
      [174.61, 0.1, 0.36], // F3
      [164.81, 0.1, 0.48], // E3
      [155.56, 0.1, 0.60], // Eb3
      [146.83, 0.15, 0.72],// D3
      [110.00, 0.25, 0.90],// A2
    ];

    const loopLen = 1.3;
    for (let rep = 0; rep < 4; rep++) {
      const repOffset = rep * loopLen;
      motif.forEach(([freq, dur, offset]) => {
        if (freq <= 0) return;
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        const startTime = t + repOffset + offset;
        osc.type = 'square';
        osc.frequency.setValueAtTime(freq, startTime);
        gain.gain.setValueAtTime(0.12, startTime);
        gain.gain.exponentialRampToValueAtTime(0.01, startTime + dur);
        osc.connect(gain);
        gain.connect(this.masterGain!);
        osc.start(startTime);
        osc.stop(startTime + dur);
      });
    }

    this.musicTimeout = window.setTimeout(() => {
      if (this.currentTrack === 'castle') {
        this.playCastleChunk();
      }
    }, loopLen * 4 * 1000);
  }

  // Underwater Theme Loop (3/4 Waltz melody)
  private playUnderwaterChunk() {
    if (this.currentTrack !== 'underwater') return;
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;
    const notes: [number, number, number][] = [
      [261.63, 0.25, 0.0],  // C4
      [329.63, 0.25, 0.35], // E4
      [392.00, 0.25, 0.70], // G4
      [523.25, 0.35, 1.05], // C5
      [493.88, 0.25, 1.50], // B4
      [440.00, 0.25, 1.85], // A4
      [392.00, 0.40, 2.20], // G4
    ];

    const totalDur = 3.2;
    notes.forEach(([freq, dur, offset]) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      const startTime = t + offset;
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, startTime);
      gain.gain.setValueAtTime(0.2, startTime);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + dur);
      osc.connect(gain);
      gain.connect(this.masterGain!);
      osc.start(startTime);
      osc.stop(startTime + dur);
    });

    this.musicTimeout = window.setTimeout(() => {
      if (this.currentTrack === 'underwater') {
        this.playUnderwaterChunk();
      }
    }, totalDur * 1000);
  }

  // Starman Invincibility High Tempo Loop
  private playStarmanChunk() {
    if (this.currentTrack !== 'starman') return;
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;
    const notes: [number, number, number][] = [
      [440.0, 0.08, 0.0],
      [440.0, 0.08, 0.1],
      [440.0, 0.08, 0.2],
      [392.0, 0.08, 0.3],
      [440.0, 0.08, 0.4],
      [440.0, 0.08, 0.5],
      [493.88, 0.08, 0.6],
      [523.25, 0.12, 0.7],
    ];

    const totalDur = 0.9;
    notes.forEach(([freq, dur, offset]) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      const startTime = t + offset;
      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, startTime);
      gain.gain.setValueAtTime(0.15, startTime);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + dur);
      osc.connect(gain);
      gain.connect(this.masterGain!);
      osc.start(startTime);
      osc.stop(startTime + dur);
    });

    this.musicTimeout = window.setTimeout(() => {
      if (this.currentTrack === 'starman') {
        this.playStarmanChunk();
      }
    }, totalDur * 1000);
  }
}

export const superMarioAudio = new SuperMarioAudioEngine();
