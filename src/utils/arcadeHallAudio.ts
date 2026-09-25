/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

class ArcadeHallAudio {
  private ctx: AudioContext | null = null;
  private ambientOsc: OscillatorNode | null = null;
  private ambientGain: GainNode | null = null;
  private isAmbientPlaying = false;

  private init() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioContextClass();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  /** Authentic coin drop in arcade coin door */
  public playCoinDrop() {
    try {
      this.init();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;

      // Metallic ping
      const pingOsc = this.ctx.createOscillator();
      const pingGain = this.ctx.createGain();
      pingOsc.type = 'sine';
      pingOsc.frequency.setValueAtTime(1800, t);
      pingOsc.frequency.exponentialRampToValueAtTime(2400, t + 0.04);
      pingOsc.frequency.exponentialRampToValueAtTime(1200, t + 0.15);

      pingGain.gain.setValueAtTime(0.3, t);
      pingGain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);

      pingOsc.connect(pingGain);
      pingGain.connect(this.ctx.destination);

      pingOsc.start(t);
      pingOsc.stop(t + 0.2);

      // Clink chute
      const chuteOsc = this.ctx.createOscillator();
      const chuteGain = this.ctx.createGain();
      chuteOsc.type = 'triangle';
      chuteOsc.frequency.setValueAtTime(987.77, t + 0.08); // B5
      chuteOsc.frequency.setValueAtTime(1318.51, t + 0.14); // E6

      chuteGain.gain.setValueAtTime(0, t);
      chuteGain.gain.setValueAtTime(0.35, t + 0.08);
      chuteGain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

      chuteOsc.connect(chuteGain);
      chuteGain.connect(this.ctx.destination);

      chuteOsc.start(t + 0.08);
      chuteOsc.stop(t + 0.35);
    } catch {}
  }

  /** Alias for coin sound */
  public playCoin() {
    this.playCoinDrop();
  }

  /** Subtle retro cursor hover blip */
  public playHover() {
    try {
      this.init();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200, t);
      osc.frequency.exponentialRampToValueAtTime(1800, t + 0.03);

      gain.gain.setValueAtTime(0.04, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.03);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.03);
    } catch {}
  }

  /** Retro button click / switch */
  public playSwitch() {
    try {
      this.init();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(800, t);
      osc.frequency.exponentialRampToValueAtTime(400, t + 0.05);

      gain.gain.setValueAtTime(0.12, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.05);
    } catch {}
  }

  /** Retro neon glow hum / ambient toggle */
  public toggleAmbiance(enable: boolean) {
    try {
      this.init();
      if (!this.ctx) return;

      if (!enable) {
        if (this.ambientOsc && this.ambientGain) {
          this.ambientGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.2);
          setTimeout(() => {
            try {
              this.ambientOsc?.stop();
              this.ambientOsc?.disconnect();
              this.ambientGain?.disconnect();
            } catch {}
            this.ambientOsc = null;
            this.ambientGain = null;
            this.isAmbientPlaying = false;
          }, 300);
        }
        return;
      }

      if (this.isAmbientPlaying) return;

      const t = this.ctx.currentTime;
      this.ambientOsc = this.ctx.createOscillator();
      this.ambientGain = this.ctx.createGain();

      // Deep 50Hz/100Hz warm European/BBC CRT & neon transformer hum
      this.ambientOsc.type = 'triangle';
      this.ambientOsc.frequency.setValueAtTime(60, t);

      this.ambientGain.gain.setValueAtTime(0.0001, t);
      this.ambientGain.gain.exponentialRampToValueAtTime(0.03, t + 1.0);

      this.ambientOsc.connect(this.ambientGain);
      this.ambientGain.connect(this.ctx.destination);

      this.ambientOsc.start(t);
      this.isAmbientPlaying = true;
    } catch {}
  }
}

export const arcadeHallAudio = new ArcadeHallAudio();
