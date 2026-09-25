/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Spy Fox in "Dry Cereal" (1997 Humongous Entertainment)
 * Web Speech Synthesis Engine for Authentic Character Voices
 * (Spy Fox / Jan Nonhof, Monkey Penny, Prof. Quack, William the Kid, Henchman)
 */

export type SpeakerId = 'fox' | 'penny' | 'quack' | 'william' | 'henchman' | 'cow';

interface VoiceConfig {
  pitch: number;
  rate: number;
  volume: number;
}

class SpyFoxSpeechEngine {
  private isEnabled: boolean = true;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private availableVoices: SpeechSynthesisVoice[] = [];
  private onSpeakingChangeCallbacks: ((isSpeaking: boolean, speaker?: SpeakerId) => void)[] = [];

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.loadVoices();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = () => this.loadVoices();
      }
    }
  }

  private loadVoices() {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    this.availableVoices = window.speechSynthesis.getVoices();
  }

  public setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
    if (!enabled) {
      this.stop();
    }
  }

  public getEnabled(): boolean {
    return this.isEnabled;
  }

  public onSpeakingChange(callback: (isSpeaking: boolean, speaker?: SpeakerId) => void) {
    this.onSpeakingChangeCallbacks.push(callback);
  }

  private notifySpeaking(isSpeaking: boolean, speaker?: SpeakerId) {
    this.onSpeakingChangeCallbacks.forEach(cb => cb(isSpeaking, speaker));
  }

  public stop() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      this.currentUtterance = null;
      this.notifySpeaking(false);
    }
  }

  public speak(text: string, speaker: SpeakerId = 'fox', lang: 'nl' | 'en' = 'nl') {
    if (!this.isEnabled || typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return;
    }

    // Cancel any previous speech
    this.stop();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang === 'nl' ? 'nl-NL' : 'en-US';

    // Best matching voice for the target language
    const voices = this.availableVoices.length > 0 ? this.availableVoices : window.speechSynthesis.getVoices();
    const langPrefix = lang === 'nl' ? 'nl' : 'en';
    const matchingVoice = voices.find(v => v.lang.toLowerCase().startsWith(langPrefix));

    if (matchingVoice) {
      utterance.voice = matchingVoice;
    }

    // Authentic character voice profiles
    const profiles: Record<SpeakerId, VoiceConfig> = {
      // Spy Fox: Cool, witty, dry gentleman detective (like Jan Nonhof)
      fox: { pitch: 0.88, rate: 0.96, volume: 1.0 },
      // Monkey Penny: Bright, warm, energetic British/Dutch intelligence officer
      penny: { pitch: 1.25, rate: 1.05, volume: 1.0 },
      // Professor Quack: Quirky, fast-talking scientist with duck cadence
      quack: { pitch: 1.35, rate: 1.15, volume: 0.95 },
      // William the Kid: Arrogant, dramatic theatrical goat supervillain
      william: { pitch: 0.68, rate: 0.88, volume: 1.0 },
      // Shady Henchman: Low gruff goat thug
      henchman: { pitch: 0.62, rate: 0.85, volume: 0.95 },
      // Mr. Udderly: Gentle, distressed dairy cow
      cow: { pitch: 0.78, rate: 0.82, volume: 0.95 }
    };

    const config = profiles[speaker] || profiles.fox;
    utterance.pitch = config.pitch;
    utterance.rate = config.rate;
    utterance.volume = config.volume;

    utterance.onstart = () => {
      this.notifySpeaking(true, speaker);
    };

    utterance.onend = () => {
      this.notifySpeaking(false, speaker);
      this.currentUtterance = null;
    };

    utterance.onerror = () => {
      this.notifySpeaking(false, speaker);
      this.currentUtterance = null;
    };

    this.currentUtterance = utterance;

    // Small delay to let browser audio context settle
    setTimeout(() => {
      window.speechSynthesis.speak(utterance);
    }, 40);
  }
}

export const spyFoxSpeech = new SpyFoxSpeechEngine();
