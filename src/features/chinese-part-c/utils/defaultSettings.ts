import { AppSettings, Part6Task } from '../types';

export const DEFAULT_GONG_LIAO_TASK: Part6Task = {
  title: '沉迷手机游戏的后果',
  recipient: '',
  sender: '',
  subject: '说明沉迷手机游戏的后果',
  scenario: '根据所提供的资料，书写一段文字，说明沉迷手机游戏的后果，字数不少于40字。',
  minWords: 40,
  maxWords: 80,
  stimulusPoints: [
    {
      id: 'pt-1',
      label: '睡眠不足',
      detail: '首先这会导致我们睡眠不足',
      category: '后果一',
    },
    {
      id: 'pt-2',
      label: '影响视力',
      detail: '并且严重影响视力健康',
      category: '后果二',
    },
    {
      id: 'pt-3',
      label: '浪费学习时间',
      detail: '此外也会浪费宝贵的学习时间',
      category: '后果三',
    },
    {
      id: 'pt-4',
      label: '上课心不在焉',
      detail: '最终导致我们上课时心不在焉',
      category: '后果四',
    },
  ],
  sentenceStarters: [
    {
      id: 'st-1',
      title: '关联词库',
      phrases: ['首先', '并且', '此外', '最后', '最终', '接着', '另外', '同时'],
    },
  ],
  vocabularyBank: [
    {
      id: 'vb-1',
      word: '沉迷',
      meaning: '深深陷入某种不良嗜好中无法自拔',
      example: '长时间沉迷手机游戏会荒废学业。',
      partOfSpeech: '动词',
    },
    {
      id: 'vb-2',
      word: '睡眠不足',
      meaning: '睡眠的时间和质量不够',
      example: '经常熬夜打游戏会导致睡眠不足。',
      partOfSpeech: '名词/短语',
    },
    {
      id: 'vb-3',
      word: '心不在焉',
      meaning: '心思不在这里，思想不集中',
      example: '他上课时心不在焉，常常走神。',
      partOfSpeech: '成语',
    },
    {
      id: 'vb-4',
      word: '宝贵',
      meaning: '极有价值，非常珍贵',
      example: '我们应该珍惜宝贵的学习时间。',
      partOfSpeech: '形容词',
    },
  ],
  modelAnswers: [
    {
      id: 'ma-1',
      title: '高分示范范文 (约62字)',
      level: 'Model',
      wordCount: 62,
      content:
        '沉迷手机游戏的后果有很多，首先这会导致我们睡眠不足，并且严重影响视力健康。此外，这也会浪费宝贵的学习时间，最后导致我们上课时心不在焉。',
      tips: [
        '固定开头：沉迷手机游戏的后果有很多，',
        '承接连贯：首先这会导致我们睡眠不足，并且严重影响视力健康。',
        '递进补充：此外，这也会浪费宝贵的学习时间，',
        '总结构尾：最后导致我们上课时心不在焉。',
      ],
    },
  ],
};

export const DEFAULT_SETTINGS: AppSettings = {
  appName: '供料作文',
  appSubtitle: '供料作文 (写作)',
  moduleBadge: '供料作文',
  subModuleBadge: '华文写作',
  instructionText: '根据所提供的资料，书写一段文字，说明沉迷手机游戏的后果，字数不少于40字。',

  task: DEFAULT_GONG_LIAO_TASK,

  soundEnabled: true,
  beeBuzzEnabled: true,
  popSoundEnabled: true,
  chimeSoundEnabled: true,
  fanfareSoundEnabled: true,

  themeColor: 'amber',
  showHoneycombGrid: true,
  showFloatingHexagons: true,
};

export const SETTINGS_STORAGE_KEY = 'app_gongliao_zuowen_v2_mobile_game';

export function loadSettings(): AppSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  try {
    // Clear all legacy storage keys
    localStorage.removeItem('app_gongliao_zuowen_v1');
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
        task: parsed.task ? { ...DEFAULT_GONG_LIAO_TASK, ...parsed.task } : DEFAULT_GONG_LIAO_TASK,
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

