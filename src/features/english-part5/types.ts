export interface StimulusPoint {
  id: string;
  label: string;
  detail: string;
  iconType?: string;
  category?: string;
}

export interface VocabularyWord {
  id: string;
  word: string;
  meaning: string;
  example: string;
  partOfSpeech?: string;
}

export interface SentenceStarterCategory {
  id: string;
  title: string;
  phrases: string[];
}

export interface ModelAnswer {
  id: string;
  title: string;
  level: 'Model' | 'Standard' | 'Simple';
  wordCount: number;
  content: string;
  tips: string[];
}

export interface Part6Task {
  title: string;
  recipient: string;
  sender: string;
  subject: string;
  scenario: string;
  minWords: number;
  maxWords: number;
  stimulusPoints: StimulusPoint[];
  sentenceStarters: SentenceStarterCategory[];
  vocabularyBank: VocabularyWord[];
  modelAnswers: ModelAnswer[];
}

export interface AppSettings {
  // App Info & Badges
  appName: string;
  appSubtitle: string;
  moduleBadge: string;
  subModuleBadge: string;
  instructionText: string;

  // English Part 5 Task Data
  task: Part6Task;

  // Sound Effects Toggles
  soundEnabled: boolean;
  beeBuzzEnabled: boolean;
  popSoundEnabled: boolean;
  chimeSoundEnabled: boolean;
  fanfareSoundEnabled: boolean;

  // Read Aloud / TTS Voice Preferences
  ttsVoiceURI: string; // Empty string means auto-select best English voice
  ttsRate: number; // 0.6 to 1.4 (default 0.9)
  ttsPitch: number; // 0.7 to 1.4 (default 1.05)
  ttsLang: string; // e.g. 'en-US', 'en-GB'

  // Theme & Visual
  themeColor: 'amber' | 'emerald' | 'blue' | 'purple' | 'orange';
  showHoneycombGrid: boolean;
  showFloatingHexagons: boolean;

  // Image Clues & Randomization Settings
  enableImageClues: boolean;
  imageRandomRate: number; // 0 to 1 (e.g. 0.5 = 50% chance of image)
  wordImages: Record<number, string>; // Word ID -> Custom Image Link
}

export type ScreenState = 'menu' | 'questions' | 'mistake_book' | 'screen3';
