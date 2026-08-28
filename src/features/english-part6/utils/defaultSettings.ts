import { AppSettings, HealthCardBox } from '../types';

export const DEFAULT_HEALTH_BOXES: HealthCardBox[] = [
  {
    id: 'hobby-1',
    boxNumber: 1,
    title: 'PLAYING THE PIANO',
    imageUrl: 'https://i.imgur.com/UKXasg1.png',
    altText: 'Playing the piano',
    overlayPngUrl: 'https://i.imgur.com/tQLxJja.png',
    overlayX: 50,
    overlayY: 50,
    overlayScale: 85,
    overlayRotation: 0,
    overlayOpacityAdmin: 1.0,
    textBox1: 'playing the piano',
    textBox2: 'it helps me relax and play my favorite songs on the keys',
    textBox3: 'it makes my fingers quick and improves my concentration and memory',
    showTextBoxesInUserMode: false,
  },
  {
    id: 'hobby-2',
    boxNumber: 2,
    title: 'PAINTING',
    imageUrl: 'https://i.imgur.com/mJ8Wkyd.png',
    altText: 'Painting',
    overlayPngUrl: 'https://i.imgur.com/ExV14uW.png',
    overlayX: 50,
    overlayY: 50,
    overlayScale: 85,
    overlayRotation: 0,
    overlayOpacityAdmin: 1.0,
    textBox1: 'painting',
    textBox2: 'it lets me draw colorful scenery like tall mountains and shining suns',
    textBox3: 'it helps me express my feelings and make beautiful art for my bedroom',
    showTextBoxesInUserMode: false,
  },
  {
    id: 'hobby-3',
    boxNumber: 3,
    title: 'SINGING',
    imageUrl: 'https://i.imgur.com/btYOywz.png',
    altText: 'Singing',
    overlayPngUrl: 'https://i.imgur.com/3ghwikN.png',
    overlayX: 50,
    overlayY: 50,
    overlayScale: 85,
    overlayRotation: 0,
    overlayOpacityAdmin: 1.0,
    textBox1: 'singing',
    textBox2: 'it lets me express my happy feelings and enjoy lovely music melodies',
    textBox3: 'it helps build my confidence when standing on a stage in front of people',
    showTextBoxesInUserMode: false,
  },
  {
    id: 'hobby-4',
    boxNumber: 4,
    title: 'GARDENING',
    imageUrl: 'https://i.imgur.com/1iHnoyh.png',
    altText: 'Gardening',
    overlayPngUrl: 'https://i.imgur.com/frBScah.png',
    overlayX: 50,
    overlayY: 50,
    overlayScale: 85,
    overlayRotation: 0,
    overlayOpacityAdmin: 1.0,
    textBox1: 'gardening',
    textBox2: 'it allows me to watch beautiful flowers grow from tiny little seeds',
    textBox3: 'it teaches me about nature and how to take care of our green planet',
    showTextBoxesInUserMode: false,
  },
  {
    id: 'hobby-5',
    boxNumber: 5,
    title: 'PHOTOGRAPHY',
    imageUrl: 'https://i.imgur.com/VVXHyDm.png',
    altText: 'Photography',
    overlayPngUrl: 'https://i.imgur.com/erAP0Hp.png',
    overlayX: 50,
    overlayY: 50,
    overlayScale: 85,
    overlayRotation: 0,
    overlayOpacityAdmin: 1.0,
    textBox1: 'photography',
    textBox2: 'it allows me to capture beautiful moments in nature, like breathtaking sunsets and wildlife',
    textBox3: 'it helps me express my creativity by experimenting with different camera angles and outdoor lighting',
    showTextBoxesInUserMode: false,
  },
  {
    id: 'hobby-6',
    boxNumber: 6,
    title: 'PLAYING BADMINTON',
    imageUrl: 'https://i.imgur.com/UrA6kK3.png',
    altText: 'Playing badminton',
    overlayPngUrl: 'https://i.imgur.com/f19WSwf.png',
    overlayX: 50,
    overlayY: 50,
    overlayScale: 85,
    overlayRotation: 0,
    overlayOpacityAdmin: 1.0,
    textBox1: 'playing badminton',
    textBox2: 'it keeps my body healthy, strong, and very active',
    textBox3: 'it allows me to make new friends and play fun matches with my classmates',
    showTextBoxesInUserMode: false,
  },
  {
    id: 'hobby-7',
    boxNumber: 7,
    title: 'BAKING',
    imageUrl: 'https://i.imgur.com/fhU1xoN.png',
    altText: 'Baking',
    overlayPngUrl: 'https://i.imgur.com/9fFfmpN.png',
    overlayX: 50,
    overlayY: 50,
    overlayScale: 85,
    overlayRotation: 0,
    overlayOpacityAdmin: 1.0,
    textBox1: 'baking',
    textBox2: 'it lets me decorate sweet cupcakes with yummy frosting and sprinkles',
    textBox3: 'it is exciting to measure ingredients and make delicious treats for my family',
    showTextBoxesInUserMode: false,
  },
  {
    id: 'hobby-8',
    boxNumber: 8,
    title: 'READING',
    imageUrl: 'https://i.imgur.com/5L5uy7k.png',
    altText: 'Reading',
    overlayPngUrl: 'https://i.imgur.com/whywU78.png',
    overlayX: 50,
    overlayY: 50,
    overlayScale: 85,
    overlayRotation: 0,
    overlayOpacityAdmin: 1.0,
    textBox1: 'reading',
    textBox2: 'it takes me on exciting adventures through amazing storybook worlds',
    textBox3: 'it helps me learn many new English words and makes me smarter every day',
    showTextBoxesInUserMode: false,
  },
];

export const DEFAULT_SETTINGS: AppSettings = {
  appName: 'Hobby Showcase Wall',
  appSubtitle: 'Which hobby would you like to learn? Give TWO reasons.',
  moduleBadge: 'Hobby Wall',
  subModuleBadge: 'English',
  showMascot: true,
  mascotGreeting: 'Let\'s create our Hobby Showcase Wall! ✨',
  mascotSpeech: 'Click a picture to discover a hobby and reasons!',
  showGuide: true,
  guideStep1: 'Click any picture to discover its name.',
  guideStep2: 'Click it again to color the picture and reveal two reasons.',
  guideStep3: 'Drag or click the boxes to fill the sentence template below!',

  boxes: DEFAULT_HEALTH_BOXES,

  fadeEffect: 'fade-out',
  fadeDurationSeconds: 1.5,
  enableConfettiOnClick: true,

  soundEnabled: true,
  beeBuzzEnabled: true,
  popSoundEnabled: true,
  chimeSoundEnabled: true,
  fanfareSoundEnabled: true,

  themeColor: 'amber',
  showHoneycombGrid: true,
  showFloatingHexagons: true,

  questionPrompt: 'Your class is preparing a Hobby Showcase Wall. Which hobby would you like to learn? Give TWO reasons.',
  tajukKeyword: 'photography',
  kesanKeyword: 'creative',
  kesanDistractors: ['bored', 'tired'],
};

export const SETTINGS_STORAGE_KEY = 'edu_bee_hobby_showcase_v1';

export function loadSettings(): AppSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  try {
    const saved = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      let loadedBoxes: HealthCardBox[] = DEFAULT_HEALTH_BOXES;
      if (Array.isArray(parsed.boxes) && parsed.boxes.length === 8) {
        loadedBoxes = parsed.boxes.map((b: HealthCardBox, idx: number) => ({
          ...DEFAULT_HEALTH_BOXES[idx],
          ...b,
        }));
      }

      const loadedSettings = {
        ...DEFAULT_SETTINGS,
        ...parsed,
        boxes: loadedBoxes,
      };

      return loadedSettings;
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
