import { AppSettings, ReadingPassage, VocabularyTooltip, WorksheetQuestion } from '../types';

export const DEFAULT_PASSAGE: ReadingPassage = {
  instruction: 'Baca petikan di bawah dengan teliti.',
  title: 'Keluarga Nirmala yang Bahagia',
  paragraphs: [
    'Pada suatu petang, Nirmala sedang membantu ibunya mengemas rumah. Bapa Nirmala pula sedang membaca surat khabar di ruang tamu. Nirmala sentiasa menghormati dan menghargai ibu bapanya.',
    '"Nirmala, kita perlulah membantu ibu bapa dan menjaga tutur kata," kata ibu Nirmala.',
    '"Baik, ibu. Saya akan sentiasa membantu ibu dan bapa," jawab Nirmala.',
    'Nirmala segera membantu ibunya mengemas rumah. Selepas itu, dia menyediakan kopi panas untuk bapanya. Dia juga bercakap dengan sopan dan mendengar nasihat ibu bapanya. Ibu dan bapanya berasa gembira melihat sikap Nirmala.',
    '"Kita mestilah menghormati ibu bapa dan menghargai jasa mereka," kata bapa Nirmala. Jika kita sentiasa menghormati ibu bapa, hubungan kekeluargaan akan menjadi lebih erat dan mengurangkan perselisihan faham antara satu sama lain.'
  ],
  imageUrl: '',
};

export const DEFAULT_VOCABULARY_TOOLTIPS: VocabularyTooltip[] = [
  {
    id: 'vocab-mengemas',
    word: 'mengemas rumah',
    meaning: 'membersihkan, menyusun dan merapikan barang-barang di dalam rumah.',
    example: 'Nirmala sedang membantu ibunya mengemas rumah pada waktu petang.',
  },
  {
    id: 'vocab-tutur-kata',
    word: 'tutur kata',
    meaning: 'perkataan atau cara bercakap yang diucapkan oleh seseorang.',
    example: 'Kita hendaklah menjaga tutur kata agar sentiasa sopan dan hormat.',
  },
  {
    id: 'vocab-menghargai',
    word: 'menghargai jasa',
    meaning: 'mengenang kebaikan, usaha, dan pengorbanan yang dilakukan oleh seseorang.',
    example: 'Kita mesti menghormati ibu bapa untuk menghargai jasa dan kasih sayang mereka.',
  },
  {
    id: 'vocab-perselisihan',
    word: 'perselisihan faham',
    meaning: 'perbezaan pendapat atau salah faham yang boleh mencetuskan pertelingkahan kecil.',
    example: 'Sikap bertolak ansur dapat mengurangkan perselisihan faham antara adik-beradik.',
  },
];

export const DEFAULT_QUESTIONS: WorksheetQuestion[] = [
  {
    id: 'q-9a',
    type: 'fill_in',
    number: '9 (a)',
    questionText: 'Pada suatu petang, Nirmala sedang membantu ibunya _______________________.',
    marks: 1,
    sampleAnswer: 'mengemas rumah',
    acceptableKeywords: [
      'mengemas rumah',
      'mengemas rumah.',
      'membantu ibunya mengemas rumah',
      'membantu ibunya mengemas rumah.'
    ],
    clueTarget: 'p1',
    linesCount: 1,
  },
  {
    id: 'q-9b',
    type: 'copy_sentence',
    number: '9 (b)',
    questionText: 'Salin satu ayat yang menunjukkan bahawa Nirmala seorang anak yang baik.',
    marks: 1,
    sampleAnswer: 'Nirmala sentiasa menghormati dan menghargai ibu bapanya.',
    acceptableKeywords: [
      'nirmala sentiasa menghormati dan menghargai ibu bapanya',
      'nirmala sentiasa menghormati dan menghargai ibu bapanya.',
      'nirmala segera membantu ibunya mengemas rumah',
      'nirmala segera membantu ibunya mengemas rumah.',
      'dia menyediakan kopi panas untuk bapanya',
      'dia menyediakan kopi panas untuk bapanya.',
      'selepas itu, dia menyediakan kopi panas untuk bapanya',
      'selepas itu, dia menyediakan kopi panas untuk bapanya.',
      'dia juga bercakap dengan sopan dan mendengar nasihat ibu bapanya',
      'dia juga bercakap dengan sopan dan mendengar nasihat ibu bapanya.',
      'ibu dan bapanya berasa gembira melihat sikap nirmala',
      'ibu dan bapanya berasa gembira melihat sikap nirmala.'
    ],
    clueTarget: 'p4',
    linesCount: 2,
  },
  {
    id: 'q-9c',
    type: 'text_answer',
    number: '9 (c)',
    questionText: 'Selain hubungan kekeluargaan akan menjadi lebih erat, apakah kepentingan menghormati ibu bapa?',
    marks: 1,
    sampleAnswer: 'Kepentingannya ialah mengurangkan perselisihan faham antara satu sama lain.',
    acceptableKeywords: [
      'mengurangkan perselisihan faham',
      'mengurangkan perselisihan faham antara satu sama lain',
      'mengurangkan perselisihan faham antara satu sama lain.',
      'mengurangkan perselisihan',
      'mengurangkan perselisihan faham.',
      'kurangkan perselisihan faham',
      'mengurangkan perselisihan faham antara satu sama lain'
    ],
    clueTarget: 'p5',
    linesCount: 2,
  },
  {
    id: 'q-9d',
    type: 'underline_compound',
    number: '9 (d)',
    questionText: 'Gariskan KATA MAJMUK yang terdapat dalam ayat yang diberikan.',
    marks: 1,
    sampleAnswer: 'surat khabar, ruang tamu',
    clueTarget: 'p1', // points to paragraph 1 where it says "surat khabar" and "ruang tamu"
    linesCount: 1,
  },
  {
    id: 'q-9e',
    type: 'match_meaning',
    number: '9 (e)',
    questionText: 'Pilih dan tuliskan (BETUL) bagi ayat yang mempunyai maksud yang sama dengan ayat yang diberikan.',
    marks: 1,
    sampleAnswer: 'Ibu Nirmala menasihati Nirmala untuk membantu ibu bapa dan menjaga tutur kata.',
    clueTarget: 'p2',
    linesCount: 1,
  },
  {
    id: 'q-10',
    type: 'subjective_ai',
    number: '10',
    questionText: 'Berdasarkan petikan, apakah usaha-usaha yang boleh kamu contohi untuk menghormati ibu bapa? Nyatakan sebabnya. (Panjang jawapan tidak boleh melebihi 30 patah perkataan.)',
    marks: 5,
    sampleAnswer: 'Usaha yang boleh dicontohi ialah membantu mengemas rumah dan menyediakan minuman supaya dapat meringankan beban serta menggembirakan mereka.',
    acceptableKeywords: [
      'membantu',
      'mengemas',
      'menyediakan kopi',
      'menyediakan minuman',
      'sopan',
      'mendengar nasihat',
      'supaya',
      'kerana',
      'agar'
    ],
    clueTarget: 'p4',
    linesCount: 3,
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

export const SETTINGS_STORAGE_KEY = 'bahagian_b_nirmala_v1';

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
