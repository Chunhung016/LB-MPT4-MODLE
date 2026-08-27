export interface StoryPoster {
  instruction: string;
  title: string;
  subtitle: string;
  date: string;
  time: string;
  venue: string;
  activities: string[];
  bottomBanner: string;
  imageUrl?: string;
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
  marks: number;
  sampleAnswer?: string;
  acceptableKeywords: string[];
  clueTarget: 'title' | 'date' | 'time' | 'venue' | 'activities' | 'bottomBanner';
  clueWords: string[];
  linesCount?: number;
}

export interface AppSettings {
  poster: StoryPoster;
  questions: WorksheetQuestion[];
  vocabularyTooltips: VocabularyTooltip[];
  soundEnabled: boolean;
  beeBuzzEnabled: boolean;
  popSoundEnabled: boolean;
  chimeSoundEnabled: boolean;
  fanfareSoundEnabled: boolean;
}

export type AppScreen = 'home' | 'advertisements';
