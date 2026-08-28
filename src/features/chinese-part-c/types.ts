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

  // English Part 6 Task Data
  task: Part6Task;

  // Sound Effects Toggles
  soundEnabled: boolean;
  beeBuzzEnabled: boolean;
  popSoundEnabled: boolean;
  chimeSoundEnabled: boolean;
  fanfareSoundEnabled: boolean;

  // Theme & Visual
  themeColor: 'amber' | 'emerald' | 'blue' | 'purple' | 'orange';
  showHoneycombGrid: boolean;
  showFloatingHexagons: boolean;
}

export type ScreenState = 'screen1' | 'screen2' | 'screen3';

