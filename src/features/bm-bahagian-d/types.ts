export interface HotspotPoint {
  id: string;
  x: number; // percentage 0-100 (center X position)
  y: number; // percentage 0-100 (center Y position)
  width?: number; // percentage width relative to container, default 20%
  imageUrl?: string; // transparent background image URL
  title: string;
  actionWord?: string; // Kata Kerja (action word e.g., Mengecat, Membersihkan)
  description: string;
  completed?: boolean;
}

export interface PuzzlePiece {
  id: number;
  targetBox: number; // 1, 2, 3, 4, 5, 6
  imageUrl: string;
  altText: string;
  caption: string;
  sentence: string; // Text that comes along with the picture
}

export interface BoxScreenConfig {
  id: string;
  title: string; // e.g. "Aktiviti 1: Permulaan Gotong-Royong"
  description?: string;
  boxCount: number;
  puzzlePieces: PuzzlePiece[];
  candidateBlankWords: string[];
  blankWordsCount: number;
}

export interface AppSettings {
  // App Info
  appName: string;
  appSubtitle: string;
  moduleBadge: string;
  subModuleBadge: string;
  showMascot: boolean;
  mascotGreeting: string;
  mascotSpeech: string;
  showGuide: boolean;
  guideStep1: string;
  guideStep2: string;
  guideStep3: string;

  // Screen 1: Hotspots / Scene
  sceneImageUrl: string;
  requireAllHotspotsDiscovered: boolean;
  speakHotspotActionOnClick: boolean;
  showHotspotActionBadges: boolean;
  hotspots: HotspotPoint[];

  // Screen 2+: Multiple Box Screens (Stages / Activities)
  boxScreens: BoxScreenConfig[];
  activeBoxScreenIndex: number;

  // Global Box Screen Flow Toggles
  shufflePieces: boolean;
  enableContinuousEssay: boolean;
  postArrangeWaitSeconds: number; // 0 = disabled
  enableCountdownOverlay: boolean;
  countdownSeconds: number;
  enableFillInBlanks: boolean;
  enableConfetti: boolean;
  enableTTSOnPlacement: boolean;
  enableListenEssayButton: boolean;

  // Audio / Sound Toggles
  soundEnabled: boolean;
  beeBuzzEnabled: boolean;
  popSoundEnabled: boolean;
  chimeSoundEnabled: boolean;
  fanfareSoundEnabled: boolean;
  ttsEnabled: boolean;
  ttsRate: number; // 0.6 - 1.4
  ttsPitch: number; // 0.8 - 1.3

  // Theme & Visual
  themeColor: 'amber' | 'emerald' | 'blue' | 'purple' | 'orange';
  showHoneycombGrid: boolean;
  showFloatingHexagons: boolean;
}

export type ScreenState = 'home' | 'hotspots' | 'verbs' | 'puzzle';
