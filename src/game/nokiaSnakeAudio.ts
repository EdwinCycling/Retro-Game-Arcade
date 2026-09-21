/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Nokia Snake (1997 / Taneli Armanto) - Monophonic Piezo Buzzer Audio Synthesizer
 */

class NokiaSnakeAudio {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;

  private init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  /**
   * Authentic 1997 Nokia 6110 / 3310 piezo buzzer beep
   */
  public playDotEat() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(1480, this.ctx.currentTime);
    osc.frequency.setValueAtTime(2217, this.ctx.currentTime + 0.025);

    gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.06);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.06);
  }

  /**
   * Turn direction click
   */
  public playTurn() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(800, this.ctx.currentTime);

    gain.gain.setValueAtTime(0.03, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.015);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.015);
  }

  /**
   * Nokia Keypad rubber button press click
   */
  public playKeyClick() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1100, this.ctx.currentTime);

    gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.02);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.02);
  }

  /**
   * Game Over collision buzz
   */
  public playCrash() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(280, now);
    osc.frequency.linearRampToValueAtTime(80, now + 0.35);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.35);
  }

  /**
   * Iconic Nokia ringtone snippet (Grande Valse / Francisco Tárrega) for high score / menu start
   */
  public playNokiaTune() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    const notes = [
      { f: 1318.5, d: 0.12 }, // E6
      { f: 1174.7, d: 0.12 }, // D6
      { f: 739.99, d: 0.22 }, // F#5
      { f: 830.61, d: 0.22 }, // G#5
      { f: 1108.7, d: 0.12 }, // C#6
      { f: 987.77, d: 0.12 }, // B5
      { f: 587.33, d: 0.22 }, // D5
      { f: 659.25, d: 0.22 }, // E5
      { f: 987.77, d: 0.12 }, // B5
      { f: 880.00, d: 0.12 }, // A5
      { f: 554.37, d: 0.22 }, // C#5
      { f: 659.25, d: 0.22 }, // E5
      { f: 880.00, d: 0.45 }, // A5
    ];

    let t = this.ctx.currentTime;
    notes.forEach((n) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(n.f, t);

      gain.gain.setValueAtTime(0.09, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + n.d - 0.02);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start(t);
      osc.stop(t + n.d);
      t += n.d;
    });
  }
}

export const nokiaSnakeAudio = new NokiaSnakeAudio();
