import { AppSettings, StoryPassage, VocabularyTooltip, WorksheetQuestion } from '../types';

export const DEFAULT_PASSAGE: StoryPassage = {
  instruction: 'Read the text and answer the questions.',
  title: 'THE MINI HERB GARDEN',
  paragraphs: [
    'Year 4 Cendana prepared a mini herb garden beside the canteen for Open Day. Farah wrote the plant labels, Kumar loosened the soil, Elvin carried the watering cans, and Jia Hui measured the seedlings and recorded their growth in a notebook.',
    "On Thursday night, heavy rain toppled several labels and washed soil away from the pots. The class did not panic. With their teacher's permission, they supported the leaning herbs with bamboo sticks and rewrote the plant names on waterproof labels. Kumar also made shallow channels to guide extra rainwater away.",
    'During Open Day, visitors smelled the mint and lemongrass and asked how the pupils had rescued the plants. Jia Hui showed them the growth records. Their teacher praised the class for solving the problem calmly and protecting the garden together.',
  ],
  imageUrl: '',
};

export const DEFAULT_VOCABULARY_TOOLTIPS: VocabularyTooltip[] = [
  {
    id: 'vocab-seedlings',
    word: 'seedlings',
    label: 'Seedlings',
    description: 'Young, tender plants that have recently sprouted from seeds.',
  },
  {
    id: 'vocab-toppled',
    word: 'toppled',
    label: 'Toppled',
    description: 'Knocked over or pushed down by the force of wind or heavy rain.',
  },
  {
    id: 'vocab-waterproof',
    word: 'waterproof',
    label: 'Waterproof',
    description: 'Treated to keep water out so that it is not damaged by rain or moisture.',
  },
  {
    id: 'vocab-shallow-channels',
    word: 'shallow channels',
    label: 'Shallow Channels',
    description: 'Low, narrow trenches dug in the dirt to guide excess water away safely.',
  },
  {
    id: 'vocab-mint',
    word: 'mint',
    label: 'Mint',
    description: 'An aromatic herb with fragrant green leaves used for cooking and herbal tea.',
  },
  {
    id: 'vocab-lemongrass',
    word: 'lemongrass',
    label: 'Lemongrass',
    description: 'A tall fragrant plant with a fresh lemon-like citrus scent.',
  },
];

export const DEFAULT_QUESTIONS: WorksheetQuestion[] = [
  {
    id: 'q-1',
    number: 1,
    questionText: 'What problem did the heavy rain cause?',
    marks: 1,
    type: 'mcq',
    options: [
      { id: 'q1-opt-a', label: 'A', text: 'Labels fell and soil was washed away.' },
      { id: 'q1-opt-b', label: 'B', text: 'The herbs were stolen.' },
      { id: 'q1-opt-c', label: 'C', text: 'The watering cans broke.' },
    ],
    sampleAnswer: 'A) Labels fell and soil was washed away.',
    acceptableKeywords: [
      'a',
      'labels fell and soil was washed away',
      'labels fell and soil was washed away.',
      'labels fell',
      'soil was washed away',
      'toppled several labels',
    ],
    clueTarget: 'clue-q1',
    clueText: 'heavy rain toppled several labels and washed soil away from the pots.',
    clueWords: ['heavy rain', 'toppled several labels', 'washed soil away'],
    linesCount: 1,
  },
  {
    id: 'q-2',
    number: 2,
    questionText: 'Who recorded the growth of the seedlings?',
    marks: 1,
    type: 'mcq',
    options: [
      { id: 'q2-opt-a', label: 'A', text: 'Jia Hui' },
      { id: 'q2-opt-b', label: 'B', text: 'Kumar' },
      { id: 'q2-opt-c', label: 'C', text: 'Elvin' },
    ],
    sampleAnswer: 'A) Jia Hui',
    acceptableKeywords: ['a', 'jia hui', 'jiahui', 'jia-hui'],
    clueTarget: 'clue-q2',
    clueText: 'Jia Hui measured the seedlings and recorded their growth in a notebook.',
    clueWords: ['Jia Hui', 'measured the seedlings', 'recorded their growth'],
    linesCount: 1,
  },
  {
    id: 'q-3',
    number: 3,
    sectionHeader: 'Choose ONE word from the text and write it in the blank.',
    questionText: 'The pupils rewrote the plant names on __________ labels.',
    blankPrefix: 'The pupils rewrote the plant names on ',
    blankSuffix: ' labels.',
    marks: 1,
    type: 'fill-blank',
    sampleAnswer: 'waterproof',
    acceptableKeywords: ['waterproof', 'water-proof', 'water proof'],
    clueTarget: 'clue-q3',
    clueText: 'rewrote the plant names on waterproof labels.',
    clueWords: ['waterproof labels', 'waterproof'],
    linesCount: 1,
  },
  {
    id: 'q-4',
    number: 4,
    questionText: 'Why did Kumar make shallow channels?',
    marks: 1,
    type: 'short-answer',
    sampleAnswer: 'To guide extra rainwater away.',
    acceptableKeywords: [
      'guide extra rainwater away',
      'to guide extra rainwater away',
      'guide rainwater away',
      'to guide rainwater away',
      'guide extra water away',
      'to guide extra water away',
      'guide water away',
      'to guide water away',
      'drain extra rainwater away',
      'drain extra rainwater',
      'drain rainwater away',
      'drain water away',
      'extra rainwater away',
      'guide the extra rainwater away',
      'lead extra rainwater away',
    ],
    clueTarget: 'clue-q4',
    clueText: 'Kumar also made shallow channels to guide extra rainwater away.',
    clueWords: ['shallow channels', 'guide extra rainwater away'],
    linesCount: 1,
  },
  {
    id: 'q-5',
    number: 5,
    questionText: 'Name ONE herb that the visitors smelled.',
    marks: 1,
    type: 'short-answer',
    sampleAnswer: 'Mint (or Lemongrass)',
    acceptableKeywords: [
      'mint',
      'lemongrass',
      'lemon grass',
      'the mint',
      'the lemongrass',
      'mint and lemongrass',
      'mint or lemongrass',
      'mint / lemongrass',
    ],
    clueTarget: 'clue-q5',
    clueText: 'visitors smelled the mint and lemongrass',
    clueWords: ['visitors smelled the mint and lemongrass', 'mint', 'lemongrass'],
    linesCount: 1,
  },
  {
    id: 'q-6',
    number: 6,
    questionText: 'Do you think the class solved the problem well? Give ONE reason.',
    marks: 2,
    type: 'open-ended',
    sampleAnswer: 'Yes, because they worked together calmly and used bamboo sticks and waterproof labels to protect the garden.',
    acceptableKeywords: [
      'yes',
      'because',
      'calmly',
      'together',
      'bamboo sticks',
      'bamboo',
      'waterproof labels',
      'waterproof',
      'shallow channels',
      'guided extra rainwater',
      'protected the garden',
      'protect',
      'rescued the plants',
      'rescued',
      'did not panic',
      'cooperated',
      'helped each other',
      'fixed the problem',
      'teacher praised',
    ],
    clueTarget: 'clue-q6',
    clueText: 'supported the leaning herbs with bamboo sticks and rewrote the plant names on waterproof labels. Kumar also made shallow channels... solving the problem calmly and protecting the garden together.',
    clueWords: [
      'bamboo sticks',
      'waterproof labels',
      'shallow channels',
      'solving the problem calmly',
      'protecting the garden together',
    ],
    linesCount: 2,
  },
];

export const DEFAULT_SETTINGS: AppSettings = {
  passage: DEFAULT_PASSAGE,
  vocabularyTooltips: DEFAULT_VOCABULARY_TOOLTIPS,
  questions: DEFAULT_QUESTIONS,
  soundEnabled: true,
  beeBuzzEnabled: true,
  popSoundEnabled: true,
  chimeSoundEnabled: true,
  fanfareSoundEnabled: true,
};

export const SETTINGS_STORAGE_KEY = 'worksheet_english_part3_settings_v1';

export function loadSettings(): AppSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  try {
    const saved = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        ...DEFAULT_SETTINGS,
        ...parsed,
        passage: {
          ...DEFAULT_PASSAGE,
          ...(parsed.passage || {}),
        },
        questions:
          parsed.questions && parsed.questions.length > 0
            ? parsed.questions
            : DEFAULT_QUESTIONS,
      };
    }
  } catch (err) {
    console.error('Error loading settings from localStorage', err);
  }
  return DEFAULT_SETTINGS;
}
export function saveSettings(settings: AppSettings): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch (err) {
    console.error('Error saving settings to localStorage', err);
  }
}
