import { AppSettings, HotspotPoint, PuzzlePiece, BoxScreenConfig } from '../types';

export const DEFAULT_OVERLAY_IMAGE = 'https://i.postimg.cc/ZnZphXT9/image.png';

export const PRESET_BOX_PICTURES: { label: string; url: string }[] = [
  // Pendahuluan
  { label: 'Pendahuluan 1 (Hari Sukan)', url: 'https://imgur.com/r2JmHcz' },
  { label: 'Pendahuluan 2 (Berkumpul di Padang)', url: 'https://imgur.com/p9TQkCc' },
  { label: 'Pendahuluan 3 (Meriah dan Ceria)', url: 'https://imgur.com/ZMFHTJa' },
  // Isi 1
  { label: 'Isi 1 - 1 (Acara Dimulakan)', url: 'https://imgur.com/rN7yyV0' },
  { label: 'Isi 1 - 2 (Lompat Jauh Pasir)', url: 'https://imgur.com/wMfJZ8h' },
  { label: 'Isi 1 - 3 (Mencatat Jarak)', url: 'https://imgur.com/5Rs7NYk' },
  // Isi 2
  { label: 'Isi 2 - 1 (Lari Berganti-ganti)', url: 'https://imgur.com/mAFxSC5' },
  { label: 'Isi 2 - 2 (Membawa Baton)', url: 'https://imgur.com/yqnMN9e' },
  { label: 'Isi 2 - 3 (Murid Bersorak)', url: 'https://imgur.com/FFZaGSj' },
  // Isi 3
  { label: 'Isi 3 - 1 (Berehat di Khemah)', url: 'https://imgur.com/iT8AC5c' },
  { label: 'Isi 3 - 2 (Memberikan Minuman)', url: 'https://imgur.com/fctEbXR' },
  { label: 'Isi 3 - 3 (Menikmati Minuman)', url: 'https://imgur.com/erqQ9SZ' },
  // Isi 4
  { label: 'Isi 4 - 1 (Murid Terjatuh)', url: 'https://imgur.com/C8l5Rud' },
  { label: 'Isi 4 - 2 (Menyapu Ubat)', url: 'https://imgur.com/sgjhLLQ' },
  // Penutup
  { label: 'Penutup 1 (Hari Sukan Tamat)', url: 'https://imgur.com/IqIGtTo' },
  { label: 'Penutup 2 (Berasa Gembira)', url: 'https://imgur.com/kEv1Oda' },
];

export const DEFAULT_HOTSPOTS: HotspotPoint[] = [];

export const DEFAULT_PUZZLE_PIECES_PENDAHULUAN: PuzzlePiece[] = [
  {
    id: 101,
    targetBox: 1,
    imageUrl: 'https://imgur.com/r2JmHcz',
    altText: 'Sekolah Mengadakan Hari Sukan',
    caption: 'Kotak 1',
    sentence: 'Pada hari Sabtu yang lalu, sekolah saya mengadakan hari sukan.',
  },
  {
    id: 102,
    targetBox: 2,
    imageUrl: 'https://imgur.com/p9TQkCc',
    altText: 'Guru dan Murid Berkumpul di Padang',
    caption: 'Kotak 2',
    sentence: 'Seawal pagi, para guru dan murid sudah berkumpul di padang sekolah.',
  },
  {
    id: 103,
    targetBox: 3,
    imageUrl: 'https://imgur.com/ZMFHTJa',
    altText: 'Suasana Sangat Meriah dan Ceria',
    caption: 'Kotak 3',
    sentence: 'Suasana sangat meriah dan ceria.',
  },
];

export const DEFAULT_PUZZLE_PIECES_ISI_1: PuzzlePiece[] = [
  {
    id: 201,
    targetBox: 1,
    imageUrl: 'https://imgur.com/rN7yyV0',
    altText: 'Acara Sukan Dimulakan',
    caption: 'Kotak 1',
    sentence: 'Pada pukul 8.00 pagi, acara sukan pun dimulakan.',
  },
  {
    id: 202,
    targetBox: 2,
    imageUrl: 'https://imgur.com/wMfJZ8h',
    altText: 'Peserta Lompat Jauh',
    caption: 'Kotak 2',
    sentence: 'Para peserta lompat jauh berlari dengan pantas sebelum melompat ke dalam pasir.',
  },
  {
    id: 203,
    targetBox: 3,
    imageUrl: 'https://imgur.com/5Rs7NYk',
    altText: 'Guru Bertugas Mencatat Jarak',
    caption: 'Kotak 3',
    sentence: 'Guru bertugas mencatat jarak lompatan setiap peserta.',
  },
];

export const DEFAULT_PUZZLE_PIECES_ISI_2: PuzzlePiece[] = [
  {
    id: 301,
    targetBox: 1,
    imageUrl: 'https://imgur.com/mAFxSC5',
    altText: 'Acara Lari Berganti-ganti Bermula',
    caption: 'Kotak 1',
    sentence: 'Kemudian, acara lari berganti-ganti 4×100 meter pula bermula.',
  },
  {
    id: 302,
    targetBox: 2,
    imageUrl: 'https://imgur.com/yqnMN9e',
    altText: 'Peserta Berlari Membawa Baton',
    caption: 'Kotak 2',
    sentence: 'Para peserta berlari dengan bersungguh-sungguh sambil membawa baton.',
  },
  {
    id: 303,
    targetBox: 3,
    imageUrl: 'https://imgur.com/FFZaGSj',
    altText: 'Murid Bersorak Sorai Memberi Sokongan',
    caption: 'Kotak 3',
    sentence: 'Murid-murid bersorak sorai untuk memberikan sokongan.',
  },
];

export const DEFAULT_PUZZLE_PIECES_ISI_3: PuzzlePiece[] = [
  {
    id: 401,
    targetBox: 1,
    imageUrl: 'https://imgur.com/iT8AC5c',
    altText: 'Berehat di Khemah',
    caption: 'Kotak 1',
    sentence: 'Selepas itu, kami berehat di khemah.',
  },
  {
    id: 402,
    targetBox: 2,
    imageUrl: 'https://imgur.com/fctEbXR',
    altText: 'Guru Memberikan Minuman',
    caption: 'Kotak 2',
    sentence: 'Guru memberikan minuman kepada murid-murid yang keletihan.',
  },
  {
    id: 403,
    targetBox: 3,
    imageUrl: 'https://imgur.com/erqQ9SZ',
    altText: 'Duduk Berbual dan Menikmati Minuman',
    caption: 'Kotak 3',
    sentence: 'Kami duduk sambil berbual dan menikmati minuman.',
  },
];

export const DEFAULT_PUZZLE_PIECES_ISI_4: PuzzlePiece[] = [
  {
    id: 501,
    targetBox: 1,
    imageUrl: 'https://imgur.com/C8l5Rud',
    altText: 'Murid Terjatuh dan Lutut Luka',
    caption: 'Kotak 1',
    sentence: 'Tiba-tiba, seorang murid terjatuh dan lututnya luka.',
  },
  {
    id: 502,
    targetBox: 2,
    imageUrl: 'https://imgur.com/sgjhLLQ',
    altText: 'Guru Memapah dan Menyapu Ubat',
    caption: 'Kotak 2',
    sentence: 'Guru segera memapahnya lalu menyapu ubat pada lukanya.',
  },
];

export const DEFAULT_PUZZLE_PIECES_PENUTUP: PuzzlePiece[] = [
  {
    id: 601,
    targetBox: 1,
    imageUrl: 'https://imgur.com/IqIGtTo',
    altText: 'Hari Sukan Tamat',
    caption: 'Kotak 1',
    sentence: 'Pada pukul 1.00 tengah hari, hari sukan pun tamat.',
  },
  {
    id: 602,
    targetBox: 2,
    imageUrl: 'https://imgur.com/kEv1Oda',
    altText: 'Berasa Gembira Menyertai Acara',
    caption: 'Kotak 2',
    sentence: 'Walaupun penat, kami berasa gembira kerana dapat menyertai acara yang menyeronokkan ini.',
  },
];

export const DEFAULT_BOX_SCREENS: BoxScreenConfig[] = [
  {
    id: 'box-screen-pendahuluan',
    title: 'Pendahuluan',
    description: 'Menyusun urutan gambar perenggan pendahuluan Hari Sukan.',
    boxCount: 3,
    puzzlePieces: DEFAULT_PUZZLE_PIECES_PENDAHULUAN,
    candidateBlankWords: ['Sabtu', 'sukan', 'padang', 'berkumpul', 'meriah', 'ceria'],
    blankWordsCount: 3,
  },
  {
    id: 'box-screen-isi-1',
    title: 'Isi 1',
    description: 'Menyusun urutan acara permulaan dan lompat jauh.',
    boxCount: 3,
    puzzlePieces: DEFAULT_PUZZLE_PIECES_ISI_1,
    candidateBlankWords: ['acara', 'pantas', 'lompat', 'pasir', 'mencatat', 'peserta'],
    blankWordsCount: 3,
  },
  {
    id: 'box-screen-isi-2',
    title: 'Isi 2',
    description: 'Menyusun urutan acara lari berganti-ganti dan sorakan penyokong.',
    boxCount: 3,
    puzzlePieces: DEFAULT_PUZZLE_PIECES_ISI_2,
    candidateBlankWords: ['berganti-ganti', 'berlari', 'baton', 'bersorak', 'sokongan'],
    blankWordsCount: 3,
  },
  {
    id: 'box-screen-isi-3',
    title: 'Isi 3',
    description: 'Menyusun urutan berehat di khemah dan menikmati minuman.',
    boxCount: 3,
    puzzlePieces: DEFAULT_PUZZLE_PIECES_ISI_3,
    candidateBlankWords: ['berehat', 'khemah', 'minuman', 'keletihan', 'berbual', 'menikmati'],
    blankWordsCount: 3,
  },
  {
    id: 'box-screen-isi-4',
    title: 'Isi 4',
    description: 'Menyusun urutan rawatan kecemasan murid yang terjatuh.',
    boxCount: 2,
    puzzlePieces: DEFAULT_PUZZLE_PIECES_ISI_4,
    candidateBlankWords: ['terjatuh', 'lututnya', 'luka', 'memapahnya', 'menyapu', 'ubat'],
    blankWordsCount: 2,
  },
  {
    id: 'box-screen-penutup',
    title: 'Penutup',
    description: 'Menyusun urutan penutupan Hari Sukan dan perasaan murid.',
    boxCount: 2,
    puzzlePieces: DEFAULT_PUZZLE_PIECES_PENUTUP,
    candidateBlankWords: ['tengah', 'tamat', 'penat', 'gembira', 'menyeronokkan'],
    blankWordsCount: 2,
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
  postArrangeWaitSeconds: 30,
  enableCountdownOverlay: true,
  countdownSeconds: 30,
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

export const SETTINGS_STORAGE_KEY = 'edu_bee_app_settings_v13'; // updated version key for 30s countdown and randomization

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
