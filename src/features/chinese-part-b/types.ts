export interface ArticleParagraph {
  id: string;
  pIndex: number;
  text: string;
  highlightWords?: string[];
}

export interface ReadingArticle {
  section: string;
  type: string;
  marks: number;
  instruction: string;
  title: string;
  paragraphs: ArticleParagraph[];
  imageUrl?: string;
  themeTags?: string[];
}

export interface OrderingItem {
  id: string;
  text: string;
  correctOrder: number;
  isPreFilled?: boolean;
}

export interface CandidateClue {
  id: string;
  pIndex: number;
  text: string;
  isCorrect: boolean;
  feedback: string;
  label?: string;
}

export type QuestionType =
  | 'text_extract'       // 抄写/查找词语 (e.g. Q11)
  | 'two_reasons'        // 简述两个原因 (e.g. Q12)
  | 'ordering'           // 事件先后次序排序 (e.g. Q13)
  | 'trait_evidence'     // 人物性格特点与举例 (e.g. Q14)
  | 'insight_reflection'; // 启示与结合生活看法 (e.g. Q15)

export interface WorksheetQuestion {
  id: string;
  number: number;
  type: QuestionType;
  questionText: string;
  marks: number;
  sampleAnswer: string;
  acceptableKeywords: string[];
  clueTargetParagraph: number | 'all';
  clueKeySentences: string[];
  candidateClues?: CandidateClue[];
  linesCount?: number;
  explanation?: string;
  orderingItems?: OrderingItem[];
  wordBlocks?: string[]; // Recommended/correct word and phrase blocks
  distractorBlocks?: string[]; // Optional extra blocks to test student discernment
}

export interface AppSettings {
  article: ReadingArticle;
  questions: WorksheetQuestion[];
  soundEnabled: boolean;
  beeBuzzEnabled: boolean;
  popSoundEnabled: boolean;
  chimeSoundEnabled: boolean;
  fanfareSoundEnabled: boolean;
}

export type AppScreen = 'home' | 'advertisements';
