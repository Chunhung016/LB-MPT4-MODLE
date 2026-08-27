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
  appName: 'SPELLING BEE',
  appSubtitle: 'PRACTICE',
  moduleBadge: 'SPELLING BEE',
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

export const SETTINGS_STORAGE_KEY = 'app_english_part5_clean_v2';

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
        appName: ['ENGLISH PART 5', 'ENGLISH PART 6'].includes(parsed.appName) ? 'SPELLING BEE' : (parsed.appName || 'SPELLING BEE'),
        appSubtitle: ['PART 5', 'PART 6 (WRITING)'].includes(parsed.appSubtitle) ? 'PRACTICE' : (parsed.appSubtitle || 'PRACTICE'),
        moduleBadge: ['PART 5', 'PART 6'].includes(parsed.moduleBadge) ? 'SPELLING BEE' : (parsed.moduleBadge || 'SPELLING BEE'),
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
