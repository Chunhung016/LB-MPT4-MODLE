import { AppSettings, HotspotPoint, PuzzlePiece, BoxScreenConfig } from '../types';

export const DEFAULT_OVERLAY_IMAGE = 'https://i.postimg.cc/ZnZphXT9/image.png';

export const PRESET_BOX_PICTURES: { label: string; url: string }[] = [
  {
    label: 'Gambar 1 (Perlawanan Lari Guni)',
    url: 'https://i.postimg.cc/ZnZphXT9/image.png',
  },
  {
    label: 'Gambar 2 (Perbarisan Lintas Hormat)',
    url: 'https://i.postimg.cc/zvb2KSSd/Chat-GPT-Image-2026nian8yue17ri-15-40-54-(1).png',
  },
  {
    label: 'Gambar 3 (Penyampaian Pingat Hari Sukan)',
    url: 'https://i.postimg.cc/NjMDHxs9/Chat-GPT-Image-2026nian8yue17ri-15-40-54-(3).png',
  },
];

export const DEFAULT_HOTSPOTS: HotspotPoint[] = [];

export const DEFAULT_PUZZLE_PIECES_SCREEN_1: PuzzlePiece[] = [
  {
    id: 1,
    targetBox: 1,
    imageUrl: 'https://i.postimg.cc/zvb2KSSd/Chat-GPT-Image-2026nian8yue17ri-15-40-54-(1).png',
    altText: 'Hari Sukan Permulaan',
    caption: 'Gambar 1',
    sentence: 'Pada hari Sabtu yang lalu, sekolah saya telah mengadakan temasya Hari Sukan Tahunan yang sangat meriah.',
  },
  {
    id: 2,
    targetBox: 2,
    imageUrl: 'https://i.postimg.cc/ZnZphXT9/image.png',
    altText: 'Semua Murid Berkumpul',
    caption: 'Gambar 2',
    sentence: 'Semua murid berkumpul di padang sekolah dengan memakai baju sukan mengikut rumah masing-masing.',
  },
  {
    id: 3,
    targetBox: 3,
    imageUrl: 'https://i.postimg.cc/NjMDHxs9/Chat-GPT-Image-2026nian8yue17ri-15-40-54-(3).png',
    altText: 'Hiasan Bendera Meriah',
    caption: 'Gambar 3',
    sentence: 'Padang sekolah juga dihiasi dengan bendera dan belon yang berwarna-warni bagi menceriakan suasana.',
  },
];

export const DEFAULT_PUZZLE_PIECES_SCREEN_2: PuzzlePiece[] = [
  {
    id: 101,
    targetBox: 1,
    imageUrl: 'https://i.postimg.cc/zvb2KSSd/Chat-GPT-Image-2026nian8yue17ri-15-40-54-(1).png',
    altText: 'Acara Perbarisan Mulai',
    caption: 'Gambar 1',
    sentence: 'Acara sukan dimulakan dengan upacara perbarisan lintas hormat oleh pasukan rumah sukan.',
  },
  {
    id: 102,
    targetBox: 2,
    imageUrl: 'https://i.postimg.cc/ZnZphXT9/image.png',
    altText: 'Lari dalam guni dan Tarik tali',
    caption: 'Gambar 2',
    sentence: 'Pelbagai acara sukaneka yang menarik telah dijalankan seperti lari dalam guni dan tarik tali.',
  },
  {
    id: 103,
    targetBox: 3,
    imageUrl: 'https://i.postimg.cc/NjMDHxs9/Chat-GPT-Image-2026nian8yue17ri-15-40-54-(3).png',
    altText: 'Penyampaian pingat dan hadiah',
    caption: 'Gambar 3',
    sentence: 'Pada akhir temasya, Guru Besar menyampaikan pingat dan piala kepada para pemenang yang gembira.',
  },
];

export const DEFAULT_BOX_SCREENS: BoxScreenConfig[] = [
  {
    id: 'box-screen-1',
    title: 'Aktiviti 1: Permulaan Hari Sukan Tahunan',
    description: 'Menyusun urutan pembukaan temasya sukan tahunan sekolah.',
    boxCount: 3,
    puzzlePieces: DEFAULT_PUZZLE_PIECES_SCREEN_1,
    candidateBlankWords: ['Sabtu', 'Sukan', 'padang', 'sukan', 'warna-warni'],
    blankWordsCount: 4,
  },
  {
    id: 'box-screen-2',
    title: 'Aktiviti 2: Acara Menarik & Penyampaian Piala',
    description: 'Menyusun urutan aktiviti sukaneka dan upacara penutupan temasya.',
    boxCount: 3,
    puzzlePieces: DEFAULT_PUZZLE_PIECES_SCREEN_2,
    candidateBlankWords: ['perbarisan', 'sukaneka', 'guni', 'piala', 'pemenang'],
    blankWordsCount: 3,
  },
];

export const DEFAULT_SETTINGS: AppSettings = {
  appName: 'Hari Sukan Sekolah',
  appSubtitle:
    'Modul pembelajaran interaktif membina karangan Bahasa Melayu berpandukan gambar urutan Hari Sukan Tahunan.',
  moduleBadge: 'Hari Sukan',
  subModuleBadge: 'Bahasa Melayu',
  showMascot: true,
  mascotGreeting: 'Mari Belajar Bersama! 🐝',
  mascotSpeech: 'Sedia! Cabaran Bermula!',
  showGuide: true,
  guideStep1: 'Lihat gambar suasana Hari Sukan Sekolah yang meriah dan gembira.',
  guideStep2: 'Susun gambar ke dalam Drop Box mengikut urutan kronologi yang betul.',
  guideStep3: 'Isi tempat kosong bagi kata kunci penting untuk menyempurnakan karangan!',

  sceneImageUrl: 'https://i.imgur.com/g4RIcQr.png',
  requireAllHotspotsDiscovered: false,
  speakHotspotActionOnClick: false,
  showHotspotActionBadges: false,
  hotspots: DEFAULT_HOTSPOTS,

  // Multiple Box Screens Architecture
  boxScreens: DEFAULT_BOX_SCREENS,
  activeBoxScreenIndex: 0,

  // Global Flow Toggles
  shufflePieces: true,
  enableContinuousEssay: true,
  postArrangeWaitSeconds: 0,
  enableCountdownOverlay: false,
  countdownSeconds: 3,
  enableFillInBlanks: true,
  enableConfetti: true,
  enableTTSOnPlacement: false,
  enableListenEssayButton: false,

  soundEnabled: true,
  beeBuzzEnabled: true,
  popSoundEnabled: true,
  chimeSoundEnabled: true,
  fanfareSoundEnabled: true,
  ttsEnabled: false,
  ttsRate: 0.9,
  ttsPitch: 1.1,

  themeColor: 'amber',
  showHoneycombGrid: true,
  showFloatingHexagons: true,
};

export const SETTINGS_STORAGE_KEY = 'edu_bee_app_settings_v10'; // updated version key to refresh user localStorage

export function loadSettings(): AppSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  try {
    const saved = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      let loadedScreens: BoxScreenConfig[] = DEFAULT_BOX_SCREENS;
      if (Array.isArray(parsed.boxScreens) && parsed.boxScreens.length > 0) {
        loadedScreens = parsed.boxScreens;
      }
      return {
        ...DEFAULT_SETTINGS,
        ...parsed,
        hotspots: [],
        boxScreens: loadedScreens,
        activeBoxScreenIndex: Math.max(0, Math.min(parsed.activeBoxScreenIndex || 0, loadedScreens.length - 1)),
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
