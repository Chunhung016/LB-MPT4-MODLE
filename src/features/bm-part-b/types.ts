export interface ReadingPassage {
  instruction: string;
  title: string;
  paragraphs: string[];
  imageUrl?: string;
}

export interface VocabularyTooltip {
  id: string;
  word: string;
  meaning: string;
  example?: string;
}

export interface WorksheetQuestion {
  id: string; // e.g., 'q-9a', 'q-9b', 'q-9c', 'q-9d', 'q-9e', 'q-10'
  type: 'fill_in' | 'copy_sentence' | 'text_answer' | 'underline_compound' | 'match_meaning' | 'subjective_ai';
  number: string; // e.g., '9 (a)', '9 (b)', '9 (c)', '9 (d)', '9 (e)', '10'
  questionText: string;
  marks: number;
  sampleAnswer?: string;
  acceptableKeywords?: string[];
  clueTarget: string; // e.g., 'p1', 'p2', 'p3', 'p4' or a specific paragraph index
  linesCount?: number;
}

export interface AppSettings {
  passage: ReadingPassage;
  questions: WorksheetQuestion[];
  vocabularyTooltips: VocabularyTooltip[];
  soundEnabled: boolean;
  beeBuzzEnabled: boolean;
  popSoundEnabled: boolean;
  chimeSoundEnabled: boolean;
  fanfareSoundEnabled: boolean;
}

export type AppScreen = 'home' | 'advertisements';
