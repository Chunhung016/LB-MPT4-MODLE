/**
 * Web Audio API synthesizer for kid-friendly bee-themed sound effects
 */

class SoundEffects {
  private ctx: AudioContext | null = null;
  public isMuted: boolean = false;
  public beeBuzzEnabled: boolean = true;
  public popEnabled: boolean = true;
  public chimeEnabled: boolean = true;
  public fanfareEnabled: boolean = true;

  // TTS Voice Preferences
  public ttsVoiceURI: string = '';
  public ttsRate: number = 0.9;
  public ttsPitch: number = 1.05;
  public ttsLang: string = 'en-US';
  private cachedVoices: SpeechSynthesisVoice[] = [];

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.initVoices();
    }
  }

  private initVoices() {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      this.cachedVoices = window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => {
        this.cachedVoices = window.speechSynthesis.getVoices();
      };
    } catch {
      // ignore
    }
  }

  public getVoices(): SpeechSynthesisVoice[] {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return [];
    if (!this.cachedVoices || this.cachedVoices.length === 0) {
      this.cachedVoices = window.speechSynthesis.getVoices();
    }
    return this.cachedVoices;
  }

  public setVoicePreferences(prefs: {
    voiceURI?: string;
    rate?: number;
    pitch?: number;
    lang?: string;
  }) {
    if (prefs.voiceURI !== undefined) this.ttsVoiceURI = prefs.voiceURI;
    if (prefs.rate !== undefined) this.ttsRate = prefs.rate;
    if (prefs.pitch !== undefined) this.ttsPitch = prefs.pitch;
    if (prefs.lang !== undefined) this.ttsLang = prefs.lang;
  }

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public syncWithSettings(settings: {
    soundEnabled?: boolean;
    beeBuzzEnabled?: boolean;
    popSoundEnabled?: boolean;
    chimeSoundEnabled?: boolean;
    fanfareSoundEnabled?: boolean;
    ttsVoiceURI?: string;
    ttsRate?: number;
    ttsPitch?: number;
    ttsLang?: string;
  }) {
    if (settings.soundEnabled !== undefined) {
      this.isMuted = !settings.soundEnabled;
    }
    if (settings.beeBuzzEnabled !== undefined) {
      this.beeBuzzEnabled = settings.beeBuzzEnabled;
    }
    if (settings.popSoundEnabled !== undefined) {
      this.popEnabled = settings.popSoundEnabled;
    }
    if (settings.chimeSoundEnabled !== undefined) {
      this.chimeEnabled = settings.chimeSoundEnabled;
    }
    if (settings.fanfareSoundEnabled !== undefined) {
      this.fanfareEnabled = settings.fanfareSoundEnabled;
    }
    if (settings.ttsVoiceURI !== undefined) {
      this.ttsVoiceURI = settings.ttsVoiceURI;
    }
    if (settings.ttsRate !== undefined) {
      this.ttsRate = settings.ttsRate;
    }
    if (settings.ttsPitch !== undefined) {
      this.ttsPitch = settings.ttsPitch;
    }
    if (settings.ttsLang !== undefined) {
      this.ttsLang = settings.ttsLang;
    }
  }

  // Cheerful pop sound for clicking points / buttons
  public playPop() {
    if (this.isMuted || !this.popEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.12);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.12);
    } catch {
      // ignore
    }
  }

  // Exciting, energetic Game Start Sound (Bright ascending chord arpeggio with sparkle)
  public playStart() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;

      // 1. Initial bouncy swoosh / pop
      const popOsc = ctx.createOscillator();
      const popGain = ctx.createGain();
      popOsc.type = 'sine';
      popOsc.frequency.setValueAtTime(300, now);
      popOsc.frequency.exponentialRampToValueAtTime(600, now + 0.09);
      popGain.gain.setValueAtTime(0.25, now);
      popGain.gain.exponentialRampToValueAtTime(0.01, now + 0.09);
      popOsc.connect(popGain);
      popGain.connect(ctx.destination);
      popOsc.start(now);
      popOsc.stop(now + 0.1);

      // 2. Ascending energetic major fanfare chord: C5 -> E5 -> G5 -> C6 -> E6
      const startNotes = [
        { freq: 523.25, delay: 0.04, dur: 0.22, vol: 0.22 }, // C5
        { freq: 659.25, delay: 0.10, dur: 0.24, vol: 0.24 }, // E5
        { freq: 783.99, delay: 0.16, dur: 0.26, vol: 0.26 }, // G5
        { freq: 1046.5, delay: 0.22, dur: 0.45, vol: 0.32 }, // C6 (Bright sustained peak)
        { freq: 1318.51, delay: 0.28, dur: 0.40, vol: 0.22 }, // E6 (Sparkling harmonic top)
      ];

      startNotes.forEach(({ freq, delay, dur, vol }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const start = now + delay;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, start);
        osc.frequency.exponentialRampToValueAtTime(freq * 1.02, start + dur);

        gain.gain.setValueAtTime(vol, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + dur);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(start);
        osc.stop(start + dur + 0.05);
      });

      // 3. Gentle harmonic bell shimmer in the background
      const bellOsc = ctx.createOscillator();
      const bellGain = ctx.createGain();
      bellOsc.type = 'sine';
      bellOsc.frequency.setValueAtTime(2093.0, now + 0.24); // C7 bell ring
      bellGain.gain.setValueAtTime(0.08, now + 0.24);
      bellGain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
      bellOsc.connect(bellGain);
      bellGain.connect(ctx.destination);
      bellOsc.start(now + 0.24);
      bellOsc.stop(now + 0.75);
    } catch {
      // ignore
    }
  }

  // Friendly bee buzz sound effect
  public playBeeBuzz() {
    if (this.isMuted || !this.beeBuzzEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.linearRampToValueAtTime(280, now + 0.15);
      osc.frequency.linearRampToValueAtTime(240, now + 0.3);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.3);
    } catch {
      // ignore
    }
  }

  // Correct chime sound effect
  public playChime() {
    if (this.isMuted || !this.chimeEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const startTime = now + idx * 0.07;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.25, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.28);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + 0.3);
      });
    } catch {
      // ignore
    }
  }

  // Wrong placement sound (gentle friendly wobble)
  public playWrong() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.linearRampToValueAtTime(240, now + 0.2);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.25);
    } catch {
      // ignore
    }
  }

  // Sound effect when a mistake word is stored in the Bag of Mistakes (whoosh + gentle pouch drop)
  public playBagOfMistakes() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;

      // 1. Whoosh / zoom sound
      const whooshOsc = ctx.createOscillator();
      const whooshGain = ctx.createGain();
      whooshOsc.type = 'sine';
      whooshOsc.frequency.setValueAtTime(480, now);
      whooshOsc.frequency.exponentialRampToValueAtTime(160, now + 0.35);

      whooshGain.gain.setValueAtTime(0.2, now);
      whooshGain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

      whooshOsc.connect(whooshGain);
      whooshGain.connect(ctx.destination);
      whooshOsc.start(now);
      whooshOsc.stop(now + 0.36);

      // 2. Gentle pouch drop / resonant thud
      const dropOsc = ctx.createOscillator();
      const dropGain = ctx.createGain();
      dropOsc.type = 'triangle';
      dropOsc.frequency.setValueAtTime(220, now + 0.25);
      dropOsc.frequency.exponentialRampToValueAtTime(80, now + 0.55);

      dropGain.gain.setValueAtTime(0.25, now + 0.25);
      dropGain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);

      dropOsc.connect(dropGain);
      dropGain.connect(ctx.destination);
      dropOsc.start(now + 0.25);
      dropOsc.stop(now + 0.6);
    } catch {
      // ignore
    }
  }

  // Strike combo sound effect (scales pitch and energy with combo count)
  public playStrike(count: number = 2) {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const baseMultiplier = Math.min(1.8, 1 + (count - 1) * 0.12);
      const baseFreq = 523.25 * baseMultiplier; // Scaled root pitch

      const chord = [baseFreq, baseFreq * 1.25, baseFreq * 1.5, baseFreq * 2];
      chord.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const start = now + idx * 0.05;

        osc.type = count >= 4 ? 'sawtooth' : 'triangle';
        osc.frequency.setValueAtTime(freq, start);
        osc.frequency.exponentialRampToValueAtTime(freq * 1.03, start + 0.25);

        gain.gain.setValueAtTime(0.25, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.3);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(start);
        osc.stop(start + 0.32);
      });
    } catch {
      // ignore
    }
  }

  // Countdown beep for 3..2..1
  public playCountdownBeep(isFinal: boolean = false) {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = isFinal ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(isFinal ? 880 : 523.25, now);
      if (isFinal) {
        osc.frequency.exponentialRampToValueAtTime(1046.5, now + 0.2);
      }

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + (isFinal ? 0.35 : 0.18));

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + (isFinal ? 0.35 : 0.18));
    } catch {
      // ignore
    }
  }

  // Grand celebration fanfare
  public playCelebration() {
    if (this.isMuted || !this.fanfareEnabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const fanfare = [
        { f: 523.25, d: 0.12, t: 0 },
        { f: 659.25, d: 0.12, t: 0.12 },
        { f: 783.99, d: 0.12, t: 0.24 },
        { f: 1046.5, d: 0.4, t: 0.36 },
        { f: 880.0, d: 0.15, t: 0.78 },
        { f: 1046.5, d: 0.6, t: 0.95 },
      ];

      fanfare.forEach((item) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const start = now + item.t;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(item.f, start);

        gain.gain.setValueAtTime(0.28, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + item.d);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(start);
        osc.stop(start + item.d + 0.05);
      });
    } catch {
      // ignore
    }
  }

  // Fairy dust magical shimmer sound effect
  public playFairyDust() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      // Arpeggio of shimmering magical high notes
      const freqs = [587.33, 659.25, 880.0, 1046.5, 1318.51, 1567.98, 1760.0, 2093.0];
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const startTime = now + idx * 0.08;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startTime);
        osc.frequency.exponentialRampToValueAtTime(freq * 1.05, startTime + 0.3);

        gain.gain.setValueAtTime(0.18, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.35);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + 0.36);
      });
    } catch {
      // ignore
    }
  }

  // Find suitable SpeechSynthesisVoice based on preferences
  public findVoice(
    targetVoiceURI?: string,
    targetLang?: string
  ): SpeechSynthesisVoice | null {
    const voices = this.getVoices();
    if (!voices || voices.length === 0) return null;

    const uriToMatch = targetVoiceURI || this.ttsVoiceURI;
    if (uriToMatch) {
      const exactMatch = voices.find(
        (v) => v.voiceURI === uriToMatch || v.name === uriToMatch
      );
      if (exactMatch) return exactMatch;
    }

    const langToMatch = (targetLang || this.ttsLang || 'en').toLowerCase();
    // 1. Try exact language match
    const exactLangMatch = voices.find((v) =>
      v.lang.toLowerCase().replace('_', '-').startsWith(langToMatch)
    );
    if (exactLangMatch) return exactLangMatch;

    // 2. Try any English voice
    const englishVoice = voices.find(
      (v) =>
        v.lang.toLowerCase().startsWith('en') ||
        v.name.toLowerCase().includes('english')
    );
    if (englishVoice) return englishVoice;

    // 3. Fallback to default voice
    return voices.find((v) => v.default) || voices[0] || null;
  }

  public cancelSpeech() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        // ignore
      }
    }
  }

  // Speak vocabulary word aloud using Web Speech API with customizable voice, pitch, and speed
  public speakWord(
    word: string,
    options?: {
      voiceURI?: string;
      rate?: number;
      pitch?: number;
      lang?: string;
      onEnd?: () => void;
    }
  ) {
    if (this.isMuted || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      this.cancelSpeech();
      const utterance = new SpeechSynthesisUtterance(word);
      const voice = this.findVoice(options?.voiceURI, options?.lang);
      if (voice) {
        utterance.voice = voice;
        utterance.lang = voice.lang;
      } else {
        utterance.lang = options?.lang || this.ttsLang || 'en-US';
      }

      utterance.rate = options?.rate ?? this.ttsRate ?? 0.9;
      utterance.pitch = options?.pitch ?? this.ttsPitch ?? 1.05;

      if (options?.onEnd) {
        utterance.onend = options.onEnd;
      }

      window.speechSynthesis.speak(utterance);
    } catch {
      // ignore
    }
  }

  // Speak arbitrary text (e.g. clue description or model answer sentence)
  public speakText(
    text: string,
    options?: {
      voiceURI?: string;
      rate?: number;
      pitch?: number;
      lang?: string;
      onEnd?: () => void;
    }
  ) {
    if (this.isMuted || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      this.cancelSpeech();
      const utterance = new SpeechSynthesisUtterance(text);
      const voice = this.findVoice(options?.voiceURI, options?.lang);
      if (voice) {
        utterance.voice = voice;
        utterance.lang = voice.lang;
      } else {
        utterance.lang = options?.lang || this.ttsLang || 'en-US';
      }

      utterance.rate = options?.rate ?? this.ttsRate ?? 0.9;
      utterance.pitch = options?.pitch ?? this.ttsPitch ?? 1.05;

      if (options?.onEnd) {
        utterance.onend = options.onEnd;
      }

      window.speechSynthesis.speak(utterance);
    } catch {
      // ignore
    }
  }
}

export const sound = new SoundEffects();
