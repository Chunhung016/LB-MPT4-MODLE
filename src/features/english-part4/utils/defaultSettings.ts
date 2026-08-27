import { AppSettings, StoryPoster, VocabularyTooltip, WorksheetQuestion } from '../types';

export const DEFAULT_POSTER: StoryPoster = {
  instruction: 'Read the poster below and answer the questions.',
  title: 'STORY EXPLORER SATURDAY',
  subtitle: 'Step into stories through games and performances!',
  date: 'Saturday, 7 November 2026',
  time: '9.00 a.m. – 12.00 noon',
  venue: 'School Library and Reading Courtyard',
  activities: [
    'Character Mask Station',
    'Puppet Story Stage',
    'Book Hunt',
    'Read-Aloud Circle',
  ],
  bottomBanner: 'Bring your favourite storybook and a pencil case. Register with Ms Lee by 30 October.',
  imageUrl: '',
};

export const DEFAULT_VOCABULARY_TOOLTIPS: VocabularyTooltip[] = [
  {
    id: 'vocab-puppet',
    word: 'puppet',
    label: 'Puppet',
    description: 'A model of a person or animal that is moved by your hand or strings.',
  },
  {
    id: 'vocab-mask',
    word: 'mask',
    label: 'Mask',
    description: 'A covering for all or part of the face, worn as a disguise or for fun.',
  },
  {
    id: 'vocab-courtyard',
    word: 'courtyard',
    label: 'Courtyard',
    description: 'An open area of ground surrounded by walls or school buildings.',
  },
];

export const DEFAULT_QUESTIONS: WorksheetQuestion[] = [
  {
    id: 'q-1',
    number: 1,
    questionText: 'What event is being advertised?',
    marks: 1,
    sampleAnswer: 'Story Explorer Saturday',
    acceptableKeywords: [
      'story explorer saturday',
      'story explorer',
      'story explorer saturday!',
      'story explorers saturday',
    ],
    clueTarget: 'title',
    clueWords: ['STORY EXPLORER SATURDAY', 'Story Explorer Saturday'],
    linesCount: 1,
  },
  {
    id: 'q-2',
    number: 2,
    questionText: 'On which date will the event be held?',
    marks: 1,
    sampleAnswer: 'Saturday, 7 November 2026',
    acceptableKeywords: [
      'saturday, 7 november 2026',
      '7 november 2026',
      '7 november',
      'saturday, 7 november',
      '7th november 2026',
      '7th november',
      'saturday 7 november 2026',
      'saturday 7 november',
    ],
    clueTarget: 'date',
    clueWords: ['Saturday, 7 November 2026', '7 November 2026', '7 November'],
    linesCount: 1,
  },
  {
    id: 'q-3',
    number: 3,
    questionText: 'What time will the event begin?',
    marks: 1,
    sampleAnswer: '9.00 a.m.',
    acceptableKeywords: [
      '9.00 a.m.',
      '9:00 a.m.',
      '9.00 am',
      '9:00 am',
      '9.00',
      '9:00',
      '9 a.m.',
      '9 am',
      '9am',
      '9a.m.',
      '9.00 in the morning',
      '9 in the morning',
    ],
    clueTarget: 'time',
    clueWords: ['9.00 a.m.', '9.00 a.m. – 12.00 noon'],
    linesCount: 1,
  },
  {
    id: 'q-4',
    number: 4,
    questionText: 'Where will the event take place?',
    marks: 1,
    sampleAnswer: 'School Library and Reading Courtyard',
    acceptableKeywords: [
      'school library and reading courtyard',
      'school library',
      'reading courtyard',
      'library and reading courtyard',
      'school library and courtyard',
      'library',
      'courtyard',
    ],
    clueTarget: 'venue',
    clueWords: ['School Library and Reading Courtyard', 'School Library', 'Reading Courtyard'],
    linesCount: 1,
  },
  {
    id: 'q-5',
    number: 5,
    questionText: 'Name ONE item pupils should bring.',
    marks: 1,
    sampleAnswer: 'A favourite storybook / A pencil case',
    acceptableKeywords: [
      'storybook',
      'favourite storybook',
      'pencil case',
      'a storybook',
      'a pencil case',
      'story book',
      'favorite storybook',
      'favourite story book',
      'pencil',
      'book',
    ],
    clueTarget: 'bottomBanner',
    clueWords: ['favourite storybook', 'pencil case', 'storybook'],
    linesCount: 1,
  },
  {
    id: 'q-6',
    number: 6,
    questionText: 'Which activity would you like to join? Give ONE reason.',
    marks: 2,
    sampleAnswer: 'I would like to join Character Mask Station because I enjoy making masks.',
    acceptableKeywords: [
      'character mask station',
      'puppet story stage',
      'book hunt',
      'read-aloud circle',
      'character mask',
      'puppet story',
      'read-aloud',
      'mask',
      'puppet',
      'hunt',
      'read',
      'circle',
      'because',
      'like',
      'love',
      'enjoy',
      'want',
      'fun',
      'interesting',
    ],
    clueTarget: 'activities',
    clueWords: [
      'Character Mask Station',
      'Puppet Story Stage',
      'Book Hunt',
      'Read-Aloud Circle',
    ],
    linesCount: 2,
  },
];

export const DEFAULT_SETTINGS: AppSettings = {
  poster: DEFAULT_POSTER,
  vocabularyTooltips: DEFAULT_VOCABULARY_TOOLTIPS,
  questions: DEFAULT_QUESTIONS,
  soundEnabled: true,
  beeBuzzEnabled: true,
  popSoundEnabled: true,
  chimeSoundEnabled: true,
  fanfareSoundEnabled: true,
};

export const SETTINGS_STORAGE_KEY = 'story_explorer_saturday_v1';

export function loadSettings(): AppSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  try {
    const saved = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        ...DEFAULT_SETTINGS,
        ...parsed,
        poster: {
          ...DEFAULT_POSTER,
          ...(parsed.poster || {}),
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
