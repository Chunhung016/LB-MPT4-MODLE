export interface StoryPassage {
  instruction: string;
  title: string;
  paragraphs: string[];
  imageUrl?: string;
}

export interface QuestionOption {
  id: string;
  label: string; // 'A' | 'B' | 'C'
  text: string;
}

export interface VocabularyTooltip {
  id: string;
  word: string;
  label?: string;
  imageUrl?: string;
  description?: string;
}

export interface WorksheetQuestion {
  id: string;
  number: number;
  questionText: string;
  type: 'mcq' | 'fill-blank' | 'short-answer' | 'open-ended';
  options?: QuestionOption[];
  blankPrefix?: string;
  blankSuffix?: string;
  sectionHeader?: string;
  marks: number;
  sampleAnswer?: string;
  acceptableKeywords: string[];
  clueTarget: string;
  clueText: string;
  clueWords: string[];
  linesCount?: number;
}

export interface AppSettings {
  passage: StoryPassage;
  questions: WorksheetQuestion[];
  vocabularyTooltips: VocabularyTooltip[];
  soundEnabled: boolean;
  beeBuzzEnabled: boolean;
  popSoundEnabled: boolean;
  chimeSoundEnabled: boolean;
  fanfareSoundEnabled: boolean;
}

export type AppScreen = 'home' | 'advertisements';
