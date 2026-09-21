/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * King's Quest I: Quest for the Crown (1984, Sierra On-Line)
 * Authentic 3-voice PCjr / Tandy SN76489 & IBM PC Speaker Synthesizer
 */

class KingsQuestAudio {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  /**
   * Play an authentic 1984 IBM PCjr square wave tone
   */
  public playTone(freq: number, durationSec: number, volume: number = 0.15, type: OscillatorType = 'square') {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      gain.gain.setValueAtTime(volume, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + durationSec);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + durationSec);
    } catch {
      // AudioContext handling
    }
  }

  /**
   * Keyboard click sound for vintage text input
   */
  public playKeyClick() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(1200, this.ctx.currentTime);
      gain.gain.setValueAtTime(0.04, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.015);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.015);
    } catch {}
  }

  /**
   * 5.25" Floppy Disk Seek Sound (Motor hum + step head pulse)
   */
  public playFloppySeek() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      for (let i = 0; i < 4; i++) {
        const stepTime = now + i * 0.06;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(140 + Math.random() * 40, stepTime);
        gain.gain.setValueAtTime(0.08, stepTime);
        gain.gain.exponentialRampToValueAtTime(0.001, stepTime + 0.035);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(stepTime);
        osc.stop(stepTime + 0.035);
      }
    } catch {}
  }

  /**
   * Daventry Royal Fanfare (Iconic King's Quest opening)
   */
  public playFanfare() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    // Classic notes: C4, G4, C5, E5, G5, C6
    const notes = [
      { f: 261.63, d: 0.15 },
      { f: 392.00, d: 0.15 },
      { f: 523.25, d: 0.25 },
      { f: 659.25, d: 0.20 },
      { f: 783.99, d: 0.45 },
      { f: 1046.50, d: 0.60 }
    ];

    let delay = 0;
    notes.forEach((n) => {
      setTimeout(() => {
        this.playTone(n.f, n.d, 0.18, 'square');
      }, delay * 1000);
      delay += n.d * 0.85;
    });
  }

  /**
   * Item Found / Puzzle Solved Triumph
   */
  public playTriumph() {
    if (this.isMuted) return;
    const notes = [440, 554.37, 659.25, 880];
    notes.forEach((f, idx) => {
      setTimeout(() => {
        this.playTone(f, 0.22, 0.16, 'square');
      }, idx * 110);
    });
  }

  /**
   * Item Pick Up
   */
  public playPickup() {
    if (this.isMuted) return;
    this.playTone(523.25, 0.08, 0.14, 'square');
    setTimeout(() => {
      this.playTone(659.25, 0.12, 0.16, 'square');
    }, 70);
  }

  /**
   * Irish Jig / Fiddle Melody (for Leprechaun dance)
   */
  public playFiddleJig() {
    if (this.isMuted) return;
    const jig = [
      587.33, 659.25, 739.99, 880, 739.99, 659.25,
      587.33, 493.88, 587.33, 659.25, 739.99, 880
    ];
    jig.forEach((freq, idx) => {
      setTimeout(() => {
        this.playTone(freq, 0.10, 0.15, 'sawtooth');
      }, idx * 95);
    });
  }

  /**
   * Dragon Roar / Fire Danger Rumble
   */
  public playDragonDanger() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(110, now);
      osc.frequency.linearRampToValueAtTime(55, now + 0.6);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.65);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.65);
    } catch {}
  }

  /**
   * Footstep pulse while walking
   */
  public playStep() {
    if (this.isMuted) return;
    this.playTone(180 + Math.random() * 20, 0.025, 0.04, 'triangle');
  }

  /**
   * Death / Frak / Game Over tune
   */
  public playDeath() {
    if (this.isMuted) return;
    const notes = [293.66, 277.18, 261.63, 246.94, 220.00];
    notes.forEach((f, idx) => {
      setTimeout(() => {
        this.playTone(f, 0.28, 0.18, 'sawtooth');
      }, idx * 160);
    });
  }

  /**
   * Victory Fanfare
   */
  public playVictory() {
    this.playFanfare();
  }

  /**
   * System Beep for invalid parser commands or prompt confirmation
   */
  public playBeep() {
    if (this.isMuted) return;
    this.playTone(880, 0.08, 0.14, 'square');
  }
}

export const kingsQuestAudio = new KingsQuestAudio();
