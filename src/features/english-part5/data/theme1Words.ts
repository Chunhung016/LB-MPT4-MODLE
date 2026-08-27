export interface SpellingWord {
  id: number;
  word: string;
  alternateAnswers?: string[];
  description: string;
  firstLetter: string;
  boxCount: number;
  chinese: string;
  phonics: string[];
  imageUrl?: string;
}

export const WORKSHEET_QUESTIONS: SpellingWord[] = [
  {
    id: 1,
    word: 'lantern',
    description: 'A portable lamp that can be carried outdoors.',
    firstLetter: 'l',
    boxCount: 7,
    chinese: '提灯 / 露营灯 / 灯笼',
    phonics: ['lan', 'tern'],
    imageUrl: '',
  },
  {
    id: 2,
    word: 'squirrel',
    description: 'A small animal with a large bushy tail.',
    firstLetter: 's',
    boxCount: 8,
    chinese: '松鼠',
    phonics: ['squir', 'rel'],
    imageUrl: '',
  },
  {
    id: 3,
    word: 'yoghurt',
    description: 'A thick food made from milk, usually eaten with a spoon.',
    firstLetter: 'y',
    boxCount: 7,
    chinese: '酸奶 / 优格',
    phonics: ['yog', 'hurt'],
    imageUrl: '',
  },
  {
    id: 4,
    word: 'costume',
    description: 'Special clothes worn for a performance or celebration.',
    firstLetter: 'c',
    boxCount: 7,
    chinese: '演出服 / 戏装 / 化装服',
    phonics: ['cos', 'tume'],
    imageUrl: '',
  },
  {
    id: 5,
    word: 'pyramid',
    description: 'A huge stone structure built in ancient Egypt.',
    firstLetter: 'p',
    boxCount: 7,
    chinese: '金字塔',
    phonics: ['pyr', 'a', 'mid'],
    imageUrl: '',
  },
  {
    id: 6,
    word: 'handlebars',
    description: 'The part of a bicycle held with both hands to steer it.',
    firstLetter: 'h',
    boxCount: 10,
    chinese: '自行车车把 / 车头手把',
    phonics: ['han', 'dle', 'bars'],
    imageUrl: '',
  },
  {
    id: 7,
    word: 'microscope',
    description: 'An instrument that makes very small objects look larger.',
    firstLetter: 'm',
    boxCount: 10,
    chinese: '显微镜',
    phonics: ['mi', 'cro', 'scope'],
    imageUrl: '',
  },
  {
    id: 8,
    word: 'carnivore',
    description: 'An animal that eats meat.',
    firstLetter: 'c',
    boxCount: 9,
    chinese: '食肉动物',
    phonics: ['car', 'ni', 'vore'],
    imageUrl: '',
  },
];

export const THEME_1_WORDS = WORKSHEET_QUESTIONS;
