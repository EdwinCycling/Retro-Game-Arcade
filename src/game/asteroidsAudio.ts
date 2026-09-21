/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Atari Asteroids (1979) Vector Arcade Synthesizer & Heartbeat Audio Engine
 */

class AsteroidsAudio {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private heartbeatInterval: number | null = null;
  private heartbeatPitchStep: number = 0; // 0 = low thump, 1 = high thump
  private heartbeatBpm: number = 60; // accelerates as asteroids decrease
  private thrustGain: GainNode | null = null;
  private thrustNoise: AudioBufferSourceNode | null = null;
  private saucerOsc: OscillatorNode | null = null;
  private saucerGain: GainNode | null = null;

  private getContext(): AudioContext | null {
    if (this.isMuted) return null;
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
      this.stopHeartbeat();
      this.stopThrust();
      this.stopSaucerSound();
      if (this.ctx) {
        this.ctx.suspend().catch(() => {});
      }
    } else {
      if (this.ctx) {
        this.ctx.resume().catch(() => {});
      }
    }
  }

  public isSoundMuted(): boolean {
    return this.isMuted;
  }

  // The iconic alternating two-tone bass heartbeat (Low Thump ~40Hz, High Thump ~50Hz)
  public playHeartbeatThump() {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      const freq = this.heartbeatPitchStep === 0 ? 44 : 52;
      this.heartbeatPitchStep = 1 - this.heartbeatPitchStep;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(24, ctx.currentTime + 0.14);

      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.14);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.14);
    } catch {}
  }

  public setHeartbeatRate(remainingThreats: number, totalThreats: number) {
    if (this.isMuted) {
      this.stopHeartbeat();
      return;
    }

    // Faster tempo as threat count drops
    const fraction = Math.max(0.1, Math.min(1.0, remainingThreats / Math.max(1, totalThreats)));
    // 1.0 (many rocks) -> ~1000ms, 0.1 (few rocks) -> ~250ms
    const intervalMs = 250 + fraction * 750;

    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }

    this.heartbeatInterval = window.setInterval(() => {
      this.playHeartbeatThump();
    }, intervalMs);
  }

  public stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  // Photon Torpedo Fire Sound (High pitched laser chirp)
  public playFire() {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(140, now + 0.12);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.12);
    } catch {}
  }

  // Ship Thruster continuous low noise rumbling
  public startThrust() {
    const ctx = this.getContext();
    if (!ctx || this.thrustGain) return;

    try {
      const bufferSize = ctx.sampleRate * 2;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      this.thrustNoise = ctx.createBufferSource();
      this.thrustNoise.buffer = noiseBuffer;
      this.thrustNoise.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 110;

      this.thrustGain = ctx.createGain();
      this.thrustGain.gain.setValueAtTime(0.18, ctx.currentTime);

      this.thrustNoise.connect(filter);
      filter.connect(this.thrustGain);
      this.thrustGain.connect(ctx.destination);

      this.thrustNoise.start();
    } catch {}
  }

  public stopThrust() {
    if (this.thrustGain && this.ctx) {
      try {
        this.thrustGain.gain.setTargetAtTime(0.001, this.ctx.currentTime, 0.05);
        setTimeout(() => {
          if (this.thrustNoise) {
            this.thrustNoise.stop();
            this.thrustNoise.disconnect();
            this.thrustNoise = null;
          }
          if (this.thrustGain) {
            this.thrustGain.disconnect();
            this.thrustGain = null;
          }
        }, 80);
      } catch {
        this.thrustGain = null;
        this.thrustNoise = null;
      }
    }
  }

  // Explosion noise (Large, Medium, Small Asteroid or Ship)
  public playExplosion(size: 'large' | 'medium' | 'small' | 'ship') {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const duration = size === 'large' || size === 'ship' ? 0.6 : size === 'medium' ? 0.4 : 0.25;
      const bufferSize = Math.floor(ctx.sampleRate * duration);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);

      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * (duration * 0.4)));
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(size === 'small' ? 380 : size === 'medium' ? 240 : 130, now);
      filter.frequency.linearRampToValueAtTime(40, now + duration);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(size === 'ship' ? 0.4 : 0.28, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      noise.start(now);
    } catch {}
  }

  // Flying Saucer Siren (Warbling high or low tone)
  public startSaucerSound(isSmall: boolean) {
    const ctx = this.getContext();
    if (!ctx || this.saucerGain) return;

    try {
      const now = ctx.currentTime;
      this.saucerOsc = ctx.createOscillator();
      this.saucerGain = ctx.createGain();

      this.saucerOsc.type = 'triangle';
      const baseFreq = isSmall ? 820 : 380;
      this.saucerOsc.frequency.setValueAtTime(baseFreq, now);

      // LFO modulation for warble
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.value = isSmall ? 9 : 4.5;
      lfoGain.gain.value = isSmall ? 60 : 35;

      lfo.connect(this.saucerOsc.frequency);
      lfo.start();

      this.saucerGain.gain.setValueAtTime(0.12, now);

      this.saucerOsc.connect(this.saucerGain);
      this.saucerGain.connect(ctx.destination);

      this.saucerOsc.start();
    } catch {}
  }

  public stopSaucerSound() {
    if (this.saucerGain && this.ctx) {
      try {
        this.saucerGain.gain.setTargetAtTime(0.001, this.ctx.currentTime, 0.05);
        setTimeout(() => {
          if (this.saucerOsc) {
            this.saucerOsc.stop();
            this.saucerOsc.disconnect();
            this.saucerOsc = null;
          }
          if (this.saucerGain) {
            this.saucerGain.disconnect();
            this.saucerGain = null;
          }
        }, 60);
      } catch {
        this.saucerGain = null;
        this.saucerOsc = null;
      }
    }
  }

  // Hyperspace Warp Teleport Sound
  public playHyperspace() {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(200, now);
      osc.frequency.linearRampToValueAtTime(1400, now + 0.18);
      osc.frequency.exponentialRampToValueAtTime(80, now + 0.35);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.35);
    } catch {}
  }

  // Extra Life Fanfare
  public playExtraLife() {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const freqs = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const t = ctx.currentTime + idx * 0.09;

        osc.type = 'square';
        osc.frequency.setValueAtTime(freq, t);

        gain.gain.setValueAtTime(0.14, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(t);
        osc.stop(t + 0.15);
      });
    } catch {}
  }
}

export const asteroidsAudio = new AsteroidsAudio();
