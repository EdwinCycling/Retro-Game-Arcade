/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Sega OutRun (1986) - Yamaha YM2151 FM Synthesis & Sound Effects
 */

import { OutrunTrack } from './outrunTypes';

class OutrunAudio {
  private ctx: AudioContext | null = null;
  public isMuted: boolean = false;
  private currentTrack: OutrunTrack = 'magical_sound_shower';
  private musicTimer: number | null = null;
  private engineOsc: OscillatorNode | null = null;
  private engineGain: GainNode | null = null;
  private isEngineRunning: boolean = false;
  private step: number = 0;

  private initCtx() {
    if (typeof window === 'undefined') return;
    if (!this.ctx) {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtxClass) {
        this.ctx = new AudioCtxClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted) {
      this.stopMusic();
      this.stopEngine();
    }
  }

  public setTrack(track: OutrunTrack) {
    this.currentTrack = track;
    this.stopMusic();
    if (!this.isMuted && track !== 'off') {
      this.playRadioTuning();
      this.startMusic();
    }
  }

  public getTrack(): OutrunTrack {
    return this.currentTrack;
  }

  // Radio dial click / tuning sound
  public playRadioTuning() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      // White noise burst
      const bufferSize = this.ctx.sampleRate * 0.12;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.18;
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 1800;

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.12);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      noise.start(now);
      noise.stop(now + 0.12);
    } catch {}
  }

  // Countdown beep for 3-2-1-GO!
  public playCountdownBeep(isGo: boolean = false) {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = isGo ? 'sawtooth' : 'square';
      osc.frequency.setValueAtTime(isGo ? 880 : 440, now);
      if (isGo) {
        osc.frequency.exponentialRampToValueAtTime(1760, now + 0.3);
      }

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.linearRampToValueAtTime(0.01, now + (isGo ? 0.35 : 0.18));

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + (isGo ? 0.35 : 0.18));
    } catch {}
  }

  // Gear shift lever clack
  public playGearShift() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(110, now + 0.08);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.08);
    } catch {}
  }

  // Tire screech when drifting or turning sharp at high speed
  public playScreech() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(800 + Math.random() * 200, now);
      osc.frequency.linearRampToValueAtTime(600, now + 0.15);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.15);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.15);
    } catch {}
  }

  // Passing traffic whoosh
  public playCarPass() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(160, now + 0.35);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.35);
    } catch {}
  }

  // Checkpoint fanfare
  public playCheckpoint() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = 'square';
        osc.frequency.value = freq;

        const startTime = now + idx * 0.09;
        gain.gain.setValueAtTime(0.2, startTime);
        gain.gain.linearRampToValueAtTime(0.01, startTime + 0.18);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(startTime);
        osc.stop(startTime + 0.2);
      });
    } catch {}
  }

  // Crash sound
  public playCrash() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const bufferSize = this.ctx.sampleRate * 0.5;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.4;
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1000, now);
      filter.frequency.linearRampToValueAtTime(100, now + 0.5);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.4, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.5);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      noise.start(now);
      noise.stop(now + 0.5);
    } catch {}
  }

  // Continuous engine audio with RPM frequency scaling
  public updateEngine(speedRatio: number, isAccelerating: boolean, gear: 'LOW' | 'HIGH') {
    if (this.isMuted) {
      this.stopEngine();
      return;
    }
    this.initCtx();
    if (!this.ctx) return;

    if (!this.isEngineRunning || !this.engineOsc || !this.engineGain) {
      try {
        this.engineOsc = this.ctx.createOscillator();
        this.engineGain = this.ctx.createGain();

        this.engineOsc.type = 'sawtooth';
        this.engineOsc.frequency.value = 55; // Idle rumble
        this.engineGain.gain.value = 0.08;

        // Sub filter to give rich Ferrari V8 rumble
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 350;

        this.engineOsc.connect(filter);
        filter.connect(this.engineGain);
        this.engineGain.connect(this.ctx.destination);

        this.engineOsc.start();
        this.isEngineRunning = true;
      } catch {
        return;
      }
    }

    try {
      const now = this.ctx.currentTime;
      // Calculate RPM pitch
      const baseFreq = gear === 'LOW' ? 65 : 45;
      const multiplier = gear === 'LOW' ? 240 : 210;
      const targetFreq = baseFreq + speedRatio * multiplier + (isAccelerating ? 15 : 0);

      this.engineOsc.frequency.setTargetAtTime(targetFreq, now, 0.05);
      const targetGain = 0.05 + speedRatio * 0.08 + (isAccelerating ? 0.04 : 0);
      this.engineGain.gain.setTargetAtTime(targetGain, now, 0.05);
    } catch {}
  }

  public stopEngine() {
    if (this.engineOsc) {
      try {
        this.engineOsc.stop();
        this.engineOsc.disconnect();
      } catch {}
      this.engineOsc = null;
    }
    this.engineGain = null;
    this.isEngineRunning = false;
  }

  // Procedural 16-bit Arcade Radio Soundtrack Sequencer
  public startMusic() {
    this.stopMusic();
    if (this.isMuted || this.currentTrack === 'off') return;
    this.initCtx();
    if (!this.ctx) return;

    this.step = 0;
    const tempoMs = this.currentTrack === 'magical_sound_shower' ? 140 : this.currentTrack === 'splash_wave' ? 125 : 155;

    this.musicTimer = window.setInterval(() => {
      this.playSequencerStep();
      this.step = (this.step + 1) % 32;
    }, tempoMs);
  }

  public stopMusic() {
    if (this.musicTimer !== null) {
      clearInterval(this.musicTimer);
      this.musicTimer = null;
    }
  }

  private playSequencerStep() {
    if (!this.ctx || this.isMuted) return;

    const s = this.step;
    const now = this.ctx.currentTime;

    if (this.currentTrack === 'magical_sound_shower') {
      // Latin-funk bassline: Dm -> G -> C -> F
      const bassNotes = [
        146.83, 146.83, 220.00, 146.83, 196.00, 196.00, 246.94, 196.00,
        130.81, 130.81, 196.00, 130.81, 174.61, 174.61, 220.00, 174.61,
        146.83, 146.83, 220.00, 146.83, 196.00, 196.00, 246.94, 196.00,
        130.81, 130.81, 196.00, 130.81, 220.00, 246.94, 261.63, 293.66
      ];
      this.triggerBass(bassNotes[s], now);

      // Cheerful synth lead stabs
      const leadPattern: { [key: number]: number } = {
        0: 587.33, 2: 659.25, 4: 698.46, 6: 783.99,
        8: 880.00, 10: 783.99, 12: 698.46, 14: 659.25,
        16: 587.33, 18: 523.25, 20: 587.33, 22: 659.25,
        24: 783.99, 26: 880.00, 28: 1046.50, 30: 987.77
      };
      if (leadPattern[s]) {
        this.triggerLead(leadPattern[s], now, 'triangle');
      }

      // Latin percussion tap
      if (s % 2 === 0) {
        this.triggerHiHat(now);
      }
    } else if (this.currentTrack === 'splash_wave') {
      // High-energy fast synthwave
      const bassNotes = [
        110.00, 110.00, 164.81, 110.00, 130.81, 130.81, 196.00, 130.81,
        146.83, 146.83, 220.00, 146.83, 164.81, 164.81, 246.94, 164.81,
        110.00, 110.00, 164.81, 110.00, 130.81, 130.81, 196.00, 130.81,
        146.83, 146.83, 220.00, 146.83, 196.00, 220.00, 246.94, 293.66
      ];
      this.triggerBass(bassNotes[s], now);

      const leadPattern: { [key: number]: number } = {
        0: 440.00, 3: 523.25, 6: 659.25, 8: 587.33,
        12: 523.25, 14: 440.00, 16: 659.25, 19: 783.99,
        22: 880.00, 24: 783.99, 28: 659.25, 30: 587.33
      };
      if (leadPattern[s]) {
        this.triggerLead(leadPattern[s], now, 'sawtooth');
      }

      if (s % 2 === 0) this.triggerHiHat(now);
      if (s % 4 === 2) this.triggerSnare(now);
    } else if (this.currentTrack === 'passing_breeze') {
      // Breezy jazz-funk chord progression
      const bassNotes = [
        98.00, 98.00, 146.83, 98.00, 110.00, 110.00, 164.81, 110.00,
        123.47, 123.47, 185.00, 123.47, 130.81, 130.81, 196.00, 130.81,
        98.00, 98.00, 146.83, 98.00, 110.00, 110.00, 164.81, 110.00,
        123.47, 123.47, 185.00, 123.47, 146.83, 164.81, 185.00, 196.00
      ];
      this.triggerBass(bassNotes[s], now);

      const leadPattern: { [key: number]: number } = {
        0: 392.00, 4: 440.00, 8: 493.88, 12: 587.33,
        16: 659.25, 20: 587.33, 24: 493.88, 28: 440.00
      };
      if (leadPattern[s]) {
        this.triggerLead(leadPattern[s], now, 'sine');
      }

      if (s % 2 === 0) this.triggerHiHat(now);
    }
  }

  private triggerBass(freq: number, now: number) {
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.value = freq;

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.13);
    } catch {}
  }

  private triggerLead(freq: number, now: number, type: OscillatorType) {
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.value = freq;

      gain.gain.setValueAtTime(0.09, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.18);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.19);
    } catch {}
  }

  private triggerHiHat(now: number) {
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(6000, now);
      osc.frequency.linearRampToValueAtTime(8000, now + 0.03);

      gain.gain.setValueAtTime(0.04, now);
      gain.gain.linearRampToValueAtTime(0.001, now + 0.03);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.035);
    } catch {}
  }

  private triggerSnare(now: number) {
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.linearRampToValueAtTime(60, now + 0.06);

      gain.gain.setValueAtTime(0.06, now);
      gain.gain.linearRampToValueAtTime(0.001, now + 0.06);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.065);
    } catch {}
  }
}

export const outrunAudio = new OutrunAudio();
