import { AppSettings, Part6Task } from '../types';

export const EMPTY_PART6_TASK: Part6Task = {
  title: '',
  recipient: '',
  sender: '',
  subject: '',
  scenario: '',
  minWords: 30,
  maxWords: 50,
  stimulusPoints: [],
  sentenceStarters: [],
  vocabularyBank: [],
  modelAnswers: [],
};

export const DEFAULT_SETTINGS: AppSettings = {
  appName: 'ENGLISH PART 5',
  appSubtitle: 'PART 5',
  moduleBadge: 'PART 5',
  subModuleBadge: 'ENGLISH',
  instructionText: '',

  task: EMPTY_PART6_TASK,

  soundEnabled: true,
  beeBuzzEnabled: true,
  popSoundEnabled: true,
  chimeSoundEnabled: true,
  fanfareSoundEnabled: true,

  ttsVoiceURI: '',
  ttsRate: 0.9,
  ttsPitch: 1.05,
  ttsLang: 'en-US',

  themeColor: 'amber',
  showHoneycombGrid: true,
  showFloatingHexagons: true,

  enableImageClues: true,
  imageRandomRate: 0.5,
  wordImages: {},
};

export const SETTINGS_STORAGE_KEY = 'worksheet_english_part5_settings_v1';

export function loadSettings(): AppSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  try {
    // Clear all legacy storage keys including Part 6 keys
    localStorage.removeItem('app_english_part6_clean_v2');
    localStorage.removeItem('app_english_part6_v1');
    localStorage.removeItem('app_english_part4_v1');
    localStorage.removeItem('edu_bee_kesihatan_diri_bahagian_c_v1');
    localStorage.removeItem('edu_bee_kesihatan_diri_bahagian_c');
    localStorage.removeItem('app_clean_template_v2');

    const saved = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        ...DEFAULT_SETTINGS,
        ...parsed,
        appName: parsed.appName === 'ENGLISH PART 6' ? 'ENGLISH PART 5' : (parsed.appName || 'ENGLISH PART 5'),
        appSubtitle: parsed.appSubtitle === 'PART 6 (WRITING)' ? 'PART 5' : (parsed.appSubtitle || 'PART 5'),
        moduleBadge: parsed.moduleBadge === 'PART 6' ? 'PART 5' : (parsed.moduleBadge || 'PART 5'),
        task: parsed.task ? { ...EMPTY_PART6_TASK, ...parsed.task } : EMPTY_PART6_TASK,
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
