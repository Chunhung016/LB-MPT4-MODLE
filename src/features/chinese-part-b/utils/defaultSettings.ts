import { AppSettings, ReadingArticle, WorksheetQuestion } from '../types';

export const DEFAULT_ARTICLE: ReadingArticle = {
  section: '乙组',
  type: '阅读与理解',
  marks: 15,
  instruction: '阅读下面的文章，然后回答第 11 至第 15 题。',
  title: '雨后的第一桶水',
  paragraphs: [
    {
      id: 'p-1',
      pIndex: 1,
      text: '校园后方有一片香草园。天气炎热时，同学们每天都要打开水龙头浇水。嘉恩发现，有些水还没流到植物根部就沿着泥地流走了。她想：如果能把雨水留下来，也许可以减少浪费。',
      highlightWords: ['香草园', '流走', '减少浪费'],
    },
    {
      id: 'p-2',
      pIndex: 2,
      text: '科学老师没有马上给答案，只让大家设计一个安全的收集方法。小组成员分工合作：有人找来有盖的旧水桶，有人清洗塑料漏斗，嘉恩则负责画设计图和记录每天的用水量。他们把漏斗接在水桶上方，期待第一场雨。',
      highlightWords: ['分工合作', '画设计图', '记录每天的用水量'],
    },
    {
      id: 'p-3',
      pIndex: 3,
      text: '几天后终于下雨了，大家兴奋地跑去查看，却发现桶里只有浅浅的一层水。原来漏斗太小，雨水大多溅到桶外；几片落叶还堵住了入口。有的同学很失望，认为这个办法行不通。',
      highlightWords: ['浅浅的一层水', '漏斗太小', '溅到桶外', '堵住了入口'],
    },
    {
      id: 'p-4',
      pIndex: 4,
      text: '嘉恩把观察结果写进记录表，并建议扩大接水面。大家用老师准备的材料做成较宽的接水槽，在入口盖上细网，再把桶盖固定好，避免落叶和小虫掉进去。他们也在桶外画上刻度，方便比较每次收集到的水量。',
      highlightWords: ['观察结果', '扩大接水面', '细网', '画上刻度'],
    },
    {
      id: 'p-5',
      pIndex: 5,
      text: '第二场大雨过后，水位升到最高刻度的一半。接下来几天没有下雨，同学们便在清晨用量杯取水，只浇在植物根部，并记录每天用了多少。香草没有枯萎，水桶里还剩下一些雨水。',
      highlightWords: ['水位升到最高刻度的一半', '量杯取水', '植物根部'],
    },
    {
      id: 'p-6',
      pIndex: 6,
      text: '一个月后，小组向全班展示记录：改良后的装置收集到的雨水比第一次多了好几倍。嘉恩明白，失败并不等于停止；只要细心观察、找出原因并不断调整，一个简单的想法也能真正解决问题。',
      highlightWords: ['改良后的装置', '失败并不等于停止', '细心观察', '找出原因', '不断调整'],
    },
  ],
  imageUrl: '',
  themeTags: ['科学探究', '环境保护', '坚持与改良', '团队合作'],
};

export const DEFAULT_QUESTIONS: WorksheetQuestion[] = [
  {
    id: 'q-11',
    number: 11,
    type: 'text_extract',
    questionText: '从第二段抄出一个表示“小组成员按照不同任务一起做事”的词语。',
    marks: 2,
    sampleAnswer: '分工合作',
    acceptableKeywords: [
      '分工合作',
      '“分工合作”',
      '分工合作。',
      '小组成员分工合作',
    ],
    clueTargetParagraph: 2,
    clueKeySentences: [
      '小组成员分工合作：有人找来有盖的旧水桶，有人清洗塑料漏斗，嘉恩则负责画设计图和记录每天的用水量。',
    ],
    candidateClues: [
      {
        id: 'q11-c1',
        pIndex: 2,
        text: '小组成员分工合作',
        isCorrect: true,
        feedback: '太棒了！“分工合作”正是指大家按照不同任务分工配合一起做事。',
        label: '关键证据'
      },
      {
        id: 'q11-c2',
        pIndex: 2,
        text: '有人清洗塑料漏斗',
        isCorrect: false,
        feedback: '这是其中一位同学的具体任务，不是表示“一起做事”的概括词语哦。',
        label: '干扰项'
      },
      {
        id: 'q11-c3',
        pIndex: 2,
        text: '嘉恩则负责画设计图和记录每天的用水量',
        isCorrect: false,
        feedback: '这是嘉恩负责的个人任务，请寻找表示大家相互配合做事的四个字成语词语。',
        label: '干扰项'
      }
    ],
    linesCount: 1,
    explanation: '“分工合作”指成员分别承担不同任务并相互配合共同完成目标。',
    wordBlocks: ['分工合作'],
    distractorBlocks: ['画设计图', '记录每天用水量', '清洗塑料漏斗', '有盖的旧水桶', '第一场雨'],
  },
  {
    id: 'q-12',
    number: 12,
    type: 'two_reasons',
    questionText: '第一次下雨后，水桶里为什么只有浅浅的一层水？写出两个原因。',
    marks: 3,
    sampleAnswer: '原因一：漏斗太小，雨水大多溅到桶外。\n原因二：几片落叶堵住了入口。',
    acceptableKeywords: [
      '漏斗太小',
      '溅到桶外',
      '落叶堵住',
      '堵塞',
      '堵住入口',
      '落叶堵住了入口',
      '漏斗太小，雨水大多溅到桶外',
    ],
    clueTargetParagraph: 3,
    clueKeySentences: [
      '原来漏斗太小，雨水大多溅到桶外；几片落叶还堵住了入口。',
    ],
    candidateClues: [
      {
        id: 'q12-c1',
        pIndex: 3,
        text: '原来漏斗太小，雨水大多溅到桶外；几片落叶还堵住了入口。',
        isCorrect: true,
        feedback: '找到了！这里清楚说明了两个原因：漏斗太小溅出 + 落叶堵住入口。',
        label: '核心原因'
      },
      {
        id: 'q12-c2',
        pIndex: 3,
        text: '大家兴奋地跑去查看，却发现桶里只有浅浅的一层水。',
        isCorrect: false,
        feedback: '这是同学们看到的“现象/结果”，请找一找造成这个现象的具体“原因”句子。',
        label: '现象描述'
      },
      {
        id: 'q12-c3',
        pIndex: 3,
        text: '有的同学很失望，认为这个办法行不通。',
        isCorrect: false,
        feedback: '这是其他同学的心情与看法，不是水桶里水少的原因哦。',
        label: '同学反应'
      }
    ],
    linesCount: 2,
    explanation: '第三段明确指出了两个原因：① 漏斗太小，雨水大多溅到桶外；② 几片落叶堵住了入口。',
    wordBlocks: [
      '漏斗太小，雨水大多溅到桶外。',
      '几片落叶堵住了入口。',
    ],
    distractorBlocks: [
      '水桶底部破了一个大洞。',
      '天气太炎热雨水都蒸发了。',
      '同学们没有用量杯取水。',
      '大家忘记把水桶盖子固定好。',
    ],
  },
  {
    id: 'q-13',
    number: 13,
    type: 'ordering',
    questionText: '按先后次序，在括号里写 1、2、3、4。第一项已作答。',
    marks: 3,
    sampleAnswer: '顺序为：( 1 )、( 2 )、( 3 )、( 4 )',
    acceptableKeywords: ['1,2,3,4', '1234', '2,3,4', '234'],
    clueTargetParagraph: 'all',
    clueKeySentences: [
      '嘉恩发现，有些水还没流到植物根部就沿着泥地流走了。',
      '原来漏斗太小，雨水大多溅到桶外；几片落叶还堵住了入口。',
      '大家用老师准备的材料做成较宽的接水槽，在入口盖上细网。',
      '同学们便在清晨用量杯取水，只浇在植物根部。',
    ],
    linesCount: 4,
    orderingItems: [
      {
        id: 'ord-1',
        text: '嘉恩发现浇水时有些水流走了。',
        correctOrder: 1,
        isPreFilled: true,
      },
      {
        id: 'ord-2',
        text: '小组发现漏斗太小，而且入口被落叶堵住。',
        correctOrder: 2,
        isPreFilled: false,
      },
      {
        id: 'ord-3',
        text: '大家扩大接水面，并在入口盖上细网。',
        correctOrder: 3,
        isPreFilled: false,
      },
      {
        id: 'ord-4',
        text: '同学们用收集到的雨水浇香草。',
        correctOrder: 4,
        isPreFilled: false,
      },
    ],
    explanation: '事件发展脉络：发现浪费(1) → 首次尝试发现漏斗小且落叶堵塞(2) → 改进扩大接水面并加细网(3) → 成功收集雨水用于浇灌香草(4)。',
  },
  {
    id: 'q-14',
    number: 14,
    type: 'trait_evidence',
    questionText: '你认为嘉恩是怎样的人？写出一个特点，并从文中举例说明。',
    marks: 3,
    sampleAnswer: '嘉恩是一个善于观察、遇到困难不轻易放弃的人。例如，她细心观察到浇花的水流走浪费了，便提议收集雨水；在第一次收集失败后，她没有气馁，而是把观察结果写进记录表并建议扩大接水面改良装置。',
    acceptableKeywords: [
      '善于观察',
      '细心',
      '聪明',
      '爱动脑筋',
      '不放弃',
      '不轻言放弃',
      '坚持不懈',
      '环保',
      '有责任心',
      '勇于尝试',
      '善于解决问题',
      '勤于思考',
      '勤奋',
      '有毅力',
    ],
    clueTargetParagraph: 4,
    clueKeySentences: [
      '嘉恩发现，有些水还没流到植物根部就沿着泥地流走了。她想：如果能把雨水留下来，也许可以减少浪费。',
      '嘉恩把观察结果写进记录表，并建议扩大接水面。',
    ],
    candidateClues: [
      {
        id: 'q14-c1',
        pIndex: 1,
        text: '嘉恩发现，有些水还没流到植物根部就沿着泥地流走了。她想：如果能把雨水留下来，也许可以减少浪费。',
        isCorrect: true,
        feedback: '非常好！这句话体现出嘉恩“善于观察、爱动脑筋且具有环保节约意识”。',
        label: '特点证据①（善于观察）'
      },
      {
        id: 'q14-c2',
        pIndex: 3,
        text: '有的同学很失望，认为这个办法行不通。',
        isCorrect: false,
        feedback: '这是其他同学面对失败时的消极反应，不是嘉恩的表现哦！',
        label: '他人反应（干扰项）'
      },
      {
        id: 'q14-c3',
        pIndex: 4,
        text: '嘉恩把观察结果写进记录表，并建议扩大接水面。',
        isCorrect: true,
        feedback: '太棒了！面对失败，嘉恩“不气馁、坚持改良、做事认真负责并主动想办法解决问题”。',
        label: '特点证据②（坚持改良）'
      },
      {
        id: 'q14-c4',
        pIndex: 5,
        text: '接下来几天没有下雨，同学们便在清晨用量杯取水，只浇在植物根部。',
        isCorrect: false,
        feedback: '这是大家共同执行浇水的过程，不能最直接体现嘉恩个人面对困难的品质特点。',
        label: '日常过程（干扰项）'
      }
    ],
    linesCount: 2,
    explanation: '写出嘉恩的品质特点（如细心观察、爱动脑筋、坚持不放弃、有环保意识等），并结合文章中她发现浪费、记录数据或改良装置的具体行为举例。',
    wordBlocks: [
      '我认为嘉恩是一个',
      '善于细心观察、',
      '遇到困难不轻易放弃的人。',
      '例如：',
      '她发现浇花的水流走后提议收集雨水；',
      '在第一次失败后，',
      '她把观察结果写进记录表，',
      '并建议扩大接水面改良装置。',
    ],
    distractorBlocks: [
      '她遇到一点困难就马上放弃了。',
      '她不肯和同学分工合作。',
      '她只顾着自己玩不关心香草园。',
    ],
  },
  {
    id: 'q-15',
    number: 15,
    type: 'insight_reflection',
    questionText: '“失败并不等于停止”给了你什么启示？结合文章写出你的看法。',
    marks: 4,
    sampleAnswer: '这句话给我的启示是：面对失败与挫折时，我们不要灰心和放弃。我们要像嘉恩和她的小组一样，细心观察、认真找出失败的原因，并不断调整和改进方法，只要勇于尝试与坚持到底，就一定能解决问题并取得成功。',
    acceptableKeywords: [
      '失败',
      '不要放弃',
      '不放弃',
      '坚持',
      '不气馁',
      '不灰心',
      '细心观察',
      '找出原因',
      '不断调整',
      '改进',
      '解决问题',
      '成功',
      '勇于尝试',
      '总结经验',
      '克服困难',
    ],
    clueTargetParagraph: 6,
    clueKeySentences: [
      '嘉恩明白，失败并不等于停止；只要细心观察、找出原因并不断调整，一个简单的想法也能真正解决问题。',
    ],
    candidateClues: [
      {
        id: 'q15-c1',
        pIndex: 1,
        text: '天气炎热时，同学们每天都要打开水龙头浇水。',
        isCorrect: false,
        feedback: '这是故事开头的起因背景，不是面对失败与挫折时的感悟启示哦。',
        label: '起因背景（干扰项）'
      },
      {
        id: 'q15-c2',
        pIndex: 3,
        text: '有的同学很失望，认为这个办法行不通。',
        isCorrect: false,
        feedback: '这是遇到挫折时的灰心放弃想法，“失败并不等于停止”正是要我们不要轻易放弃！',
        label: '消极想法（干扰项）'
      },
      {
        id: 'q15-c3',
        pIndex: 4,
        text: '大家用老师准备的材料做成较宽的接水槽，在入口盖上细网，再把桶盖固定好。',
        isCorrect: false,
        feedback: '这是具体的改良动作，第六段有嘉恩总结的更高层次的人生感悟启示，再找找看！',
        label: '行动细节'
      },
      {
        id: 'q15-c4',
        pIndex: 6,
        text: '嘉恩明白，失败并不等于停止；只要细心观察、找出原因并不断调整，一个简单的想法也能真正解决问题。',
        isCorrect: true,
        feedback: '完全正确！这就是全篇的核心启示：面对失败不要灰心，找出原因并不断调整改良，坚持到底就能解决问题！',
        label: '核心金句启示'
      }
    ],
    linesCount: 3,
    explanation: '回答需包含两个核心要素：① 启示（面对失败不轻言放弃、保持积极）；② 结合文章或实际（细心观察原因、不断调整改进、最终战胜困难取得成功）。',
    wordBlocks: [
      '这句话给我的启示是：',
      '面对失败与挫折时，',
      '我们不要灰心和放弃。',
      '我们要像嘉恩一样，',
      '细心观察、找出原因，',
      '并不断调整和改进方法，',
      '只要勇于尝试与坚持，',
      '就一定能解决问题取得成功。',
    ],
    distractorBlocks: [
      '失败了就说明这个想法完全没有用。',
      '只要失败一次就应该立刻停止。',
      '我们不应该花时间去找出失败的原因。',
    ],
  },
];

export const DEFAULT_SETTINGS: AppSettings = {
  article: DEFAULT_ARTICLE,
  questions: DEFAULT_QUESTIONS,
  soundEnabled: true,
  beeBuzzEnabled: true,
  popSoundEnabled: true,
  chimeSoundEnabled: true,
  fanfareSoundEnabled: true,
};

export const SETTINGS_STORAGE_KEY = 'worksheet_section_b_chinese_v3';

export function loadSettings(): AppSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  try {
    const saved = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      const mergedQuestions = (parsed.questions && parsed.questions.length > 0 ? parsed.questions : DEFAULT_QUESTIONS).map((q: WorksheetQuestion) => {
        const defaultQ = DEFAULT_QUESTIONS.find(dq => dq.id === q.id) || DEFAULT_QUESTIONS.find(dq => dq.number === q.number);
        return {
          ...defaultQ,
          ...q,
          wordBlocks: q.wordBlocks || defaultQ?.wordBlocks || [],
          distractorBlocks: q.distractorBlocks || defaultQ?.distractorBlocks || [],
        };
      });

      return {
        ...DEFAULT_SETTINGS,
        ...parsed,
        article: {
          ...DEFAULT_ARTICLE,
          ...(parsed.article || {}),
        },
        questions: mergedQuestions,
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
