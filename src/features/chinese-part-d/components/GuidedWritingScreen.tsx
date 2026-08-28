import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft,
  Sparkles,
  BookOpen,
  Volume2,
  CheckCircle2,
  Award,
  ChevronRight,
  RefreshCcw,
  Check,
  Play,
  HelpCircle,
  Lightbulb,
  FileCheck,
  Star,
  Flame,
  Plus
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { sound } from '../utils/audio';

interface GuidedWritingScreenProps {
  topicId: 'discovery' | 'success';
  onBack: () => void;
}

interface TopicData {
  title: string;
  emoji: string;
  colorTheme: {
    primary: string;
    bg: string;
    border: string;
    text: string;
    accent: string;
    btn: string;
  };
  analysis: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  };
  outline: {
    items: { id: string; part: string; desc: string }[];
    correctOrder: string[]; // ids in correct order
  };
  vocabulary: {
    word: string;
    pinyin: string;
    meaning: string;
    sentence: string;
  }[];
  modelEssay: {
    paragraphs: {
      type: 'intro' | 'body' | 'outro';
      label: string;
      content: string;
      highlights: { text: string; note: string }[];
    }[];
  };
  practice: {
    prompt: string;
    paragraphWithBlanks: string; // display with inputs or choices
    blanks: {
      id: string;
      correctWord: string;
      options: string[];
    }[];
  };
}

const TOPICS_DATA: Record<'discovery' | 'success', TopicData> = {
  discovery: {
    title: '一次新发现',
    emoji: '🔍',
    colorTheme: {
      primary: 'cyan',
      bg: 'bg-cyan-50/50',
      border: 'border-cyan-300',
      text: 'text-cyan-900',
      accent: 'bg-cyan-100 text-cyan-800 border-cyan-300',
      btn: 'bg-cyan-600 hover:bg-cyan-700 text-white border-cyan-700 shadow-[0_4px_0_#0891b2]',
    },
    analysis: {
      question: '写《一次新发现》这篇作文，核心切入点应该是什么？',
      options: [
        '写一件在网上看到的新闻奇事',
        '写自己在日常生活或大自然中通过观察，第一次发现的有趣秘密或现象',
        '写自己发明了一项高科技电子产品',
        '写和朋友去游乐场玩的快乐经历'
      ],
      correctIndex: 1,
      explanation: '正确！命题作文《一次新发现》要求立足于个人的“观察与发现”，写出自己通过亲眼所见、亲身经历所获得的新认识或新感悟，要突出“新”和“发现的过程”。',
    },
    outline: {
      items: [
        { id: 'b', part: '内容（发现过程）', desc: '具体叙述发现的过程，以及自己是如何去探究、观察这个现象的细节。' },
        { id: 'a', part: '开头（点明发现）', desc: '交代时间、地点，引出自己发现了什么新奇的现象，引发读者的好奇心。' },
        { id: 'd', part: '结尾（收获感悟）', desc: '总结这次新发现带给自己的启示，懂得生活中要留心观察、勇于探究的道理。' },
        { id: 'c', part: '内容（揭开秘密）', desc: '写自己通过查找资料或询问他人，弄清楚了这一发现背后的科学道理。' },
      ],
      correctOrder: ['a', 'b', 'c', 'd'],
    },
    vocabulary: [
      {
        word: '留心观察',
        pinyin: 'liú xīn guān chá',
        meaning: '仔细地察看、注视周围的事物。',
        sentence: '只要你留心观察，就会发现大自然里有许许多多有趣的秘密。',
      },
      {
        word: '豁然开朗',
        pinyin: 'huò rán kāi lǎng',
        meaning: '形容顿时领悟，明白了某种道理。',
        sentence: '听了老师的细心解释，我脑中的疑惑顿时消失，真是豁然开朗！',
      },
      {
        word: '锲而不舍',
        pinyin: 'qiè ér bù shě',
        meaning: '比喻有恒心，坚持不懈。',
        sentence: '凭借锲而不舍的精神，法布尔终于完成了著名的《昆虫记》。',
      },
      {
        word: '大开眼界',
        pinyin: 'dà kāi yǎn jiè',
        meaning: '开阔视野，增广见识。',
        sentence: '这次科学展览馆之行让我大开眼界，学到了许多天文物理知识。',
      },
    ],
    modelEssay: {
      paragraphs: [
        {
          type: 'intro',
          label: '【开头 · 点明发现】',
          content: '生活就像一本书，只要我们留心观察，就能在书页中找到惊喜。上个周末，我就在自家的后院里，有了一个奇特的新发现。',
          highlights: [
            { text: '生活就像一本书', note: '【比喻手法】生动形象地引出观察生活的重要性，吸引阅读兴趣。' },
            { text: '有了一个奇特的新发现', note: '【开门见山】直接点题，干净利落地引出下文。' }
          ]
        },
        {
          type: 'body',
          label: '【内容 · 观察过程】',
          content: '那天下午，我看见一群小蚂蚁正在搬运面包屑。突然，一滴雨水落在了领头蚂蚁的前方。奇怪的是，那只蚂蚁停了下来，触角不停地摆动，随后整支队伍居然改变了方向，井然有序地绕过了水洼，朝着墙角高处走去。难道蚂蚁懂得预测天气？',
          highlights: [
            { text: '触角不停地摆动', note: '【细节描写】抓住了蚂蚁观察和沟通的动态细节，让叙事更具画面感。' },
            { text: '难道蚂蚁懂得预测天气？', note: '【设问激趣】提出疑问，自然过渡到下文探究真相的过程。' }
          ]
        },
        {
          type: 'body',
          label: '【内容 · 揭开奥秘】',
          content: '带着满脑子的疑惑，我立刻跑回房间翻阅百科全书。原来，蚂蚁在出行时会释放出一种叫“信息素”的气味。当雨水阻断了气味，它们便会依靠灵敏的触角感知空气湿度的变化，并引导同伴向高处搬家，以防巢穴被淹。这一科学奥秘让我大开眼界，赞叹不已！',
          highlights: [
            { text: '“信息素”的气味', note: '【科学解释】作文中引入准确的自然常识，使内容更有深度和说服力。' },
            { text: '大开眼界，赞叹不已', note: '【情感表达】真实写出科学探究给作者带来的兴奋感和喜悦感。' }
          ]
        },
        {
          type: 'outro',
          label: '【结尾 · 收获启示】',
          content: '这次的新发现让我明白了一个道理：大自然就像是一座无尽的宝库。只要我们怀着一颗好奇心，锲而不舍地去探索，就能发现其中无限的精彩和奥秘。',
          highlights: [
            { text: '大自然就像是一座无尽的宝库', note: '【总结提升】呼应开头，深化主题，将具体发现升华为对大自然的热爱与求知欲。' }
          ]
        }
      ]
    },
    practice: {
      prompt: '请在下文空白处，填入最合适的华语词汇，组装出连贯的高分开头与结尾：',
      paragraphWithBlanks: '大自然里藏着无穷的奥秘。只要我们在生活中（ 1 ），就会有很多新发现。上周末，我发现含羞草被触碰后会合拢叶子，这让我（ 2 ）。通过查阅资料，我明白了它是在自我保护。这次发现让我懂得了，只要我们（ 3 ）地探索，就能揭开更多神奇的科学面纱。',
      blanks: [
        { id: '1', correctWord: '留心观察', options: ['走马观花', '留心观察', '胡思乱想'] },
        { id: '2', correctWord: '大开眼界', options: ['大开眼界', '垂头丧气', '豁然开朗'] },
        { id: '3', correctWord: '锲而不舍', options: ['半途而废', '随波逐流', '锲而不舍'] }
      ]
    }
  },
  success: {
    title: '我成功了',
    emoji: '🏆',
    colorTheme: {
      primary: 'rose',
      bg: 'bg-rose-50/50',
      border: 'border-rose-300',
      text: 'text-rose-950',
      accent: 'bg-rose-100 text-rose-800 border-rose-300',
      btn: 'bg-rose-600 hover:bg-rose-700 text-white border-rose-700 shadow-[0_4px_0_#9f1239]',
    },
    analysis: {
      question: '写《我成功了》这篇作文，想要拿高分，最应该着重描写什么？',
      options: [
        '详细描写成功后，亲戚朋友送给自己的各种昂贵礼物',
        '略写成功的结果，重点并生动地描写在通往成功的过程中所遇到的具体困难，以及自己如何不懈坚持、战胜困难的心路历程',
        '用大量篇幅描写失败时自己是如何伤心、甚至大哭大闹的画面',
        '描写成功后，自己如何骄傲地向班上同学们炫耀'
      ],
      correctIndex: 1,
      explanation: '正确！写《我成功了》这类记事类作文，“不经历风雨，怎能见彩虹”。成功的过程和付出的汗水才是文章的灵魂所在。生动细腻地描写“克服困难的坚持”和“内心的情感起伏”最能打动阅卷老师。',
    },
    outline: {
      items: [
        { id: 'b', part: '内容（面临困难）', desc: '描写在尝试过程中遇到了哪些挫折或阻碍，以及自己当时气馁、想要放弃的内心活动。' },
        { id: 'a', part: '开头（点明成功）', desc: '开门见山，点出自己取得成功的喜悦事件（如：学会骑自行车、克服登台恐惧），并点题。' },
        { id: 'd', part: '结尾（总结启示）', desc: '通过这次成功的经历，总结出“世上无难事，只怕有心人”等深刻的人生哲理。' },
        { id: 'c', part: '内容（努力克服）', desc: '重点写自己如何重振旗鼓，克服重重难关。具体写出付出的努力与坚持。' },
      ],
      correctOrder: ['a', 'b', 'c', 'd'],
    },
    vocabulary: [
      {
        word: '垂头丧气',
        pinyin: 'chuí tóu sàng qì',
        meaning: '形容失望沮丧、精神不振的样子。',
        sentence: '虽然这次比赛输了，但我们不能垂头丧气，要继续加油！',
      },
      {
        word: '手舞足蹈',
        pinyin: 'shǒu wǔ zú dǎo',
        meaning: '两手舞动，两只脚也跳起来。形容高兴到了极点。',
        sentence: '当听到自己获得全国画画比赛冠军时，小丽兴奋得手舞足蹈！',
      },
      {
        word: '喜出望外',
        pinyin: 'xǐ chū wàng wài',
        meaning: '遇到出乎意料的喜事而特别高兴。',
        sentence: '大考成绩公布，看到自己考获全A，我简直喜出望外。',
      },
      {
        word: '坚持不懈',
        pinyin: 'jiān chí bú xiè',
        meaning: '坚持到底，一点也不松懈。',
        sentence: '只要你坚持不懈地练习弹钢琴，总有一天会登上耀眼的舞台。',
      },
    ],
    modelEssay: {
      paragraphs: [
        {
          type: 'intro',
          label: '【开头 · 喜出望外】',
          content: '“太棒了！我终于学会骑自行车了！”望着身后那辆双轮自行车，我忍不住大喊起来。那一刻，喜悦的泪水在我的眼眶里打转，所有的辛苦都变成了蜜糖。',
          highlights: [
            { text: '“太棒了！我终于学会骑自行车了！”', note: '【语言描写开头】用极具张力的台词直接开篇，先声夺人，充满情感爆发力。' },
            { text: '所有的辛苦都变成了蜜糖', note: '【通感修饰】将抽象的辛苦转化为甜甜的蜜糖，妙笔生花。' }
          ]
        },
        {
          type: 'body',
          label: '【内容 · 遭遇困难】',
          content: '然而，成功的背后隐藏着无数次跌倒。刚开始练习时，自行车就像一头桀骜不驯的小野兽，根本不听我的使唤。我总是歪歪斜斜地骑行几米就重重跌倒在地，双膝摔得又红又肿。看着那伤痕，我痛得直流眼泪，心里甚至垂头丧气地想放弃。',
          highlights: [
            { text: '像一头桀骜不驯的小野兽', note: '【拟人/比喻】把不听话的自行车比作野兽，趣味横生。' },
            { text: '心里甚至垂头丧气地想放弃', note: '【心理活动】写出最真实、最接地气的犹豫，为后文的坚持和反弹做足铺垫。' }
          ]
        },
        {
          type: 'body',
          label: '【内容 · 执着坚持】',
          content: '“别放弃，失败乃成功之母！”爸爸走过来，温柔地扶起我并鼓励道。听了爸爸的话，我深吸一口气，再次跨上车座。一次、两次、十次……我咬紧牙关，双手紧紧握住车把，拼命保持平衡。摔倒了，就站起来继续；衣服湿透了，也顾不上擦汗。',
          highlights: [
            { text: '失败乃成功之母！', note: '【名言穿插】引用脍炙人口的名言，增加文章的文学色彩。' },
            { text: '咬紧牙关，双手紧紧握住车把', note: '【动作描写】精细的动词堆叠生动地刻画出作者坚韧不拔的斗志。' }
          ]
        },
        {
          type: 'outro',
          label: '【结尾 · 收获感悟】',
          content: '终于，我能迎着夕阳在公园小径上欢快平稳地骑行了。这次的成功让我明白：世上无难事，只怕有心人。只要我们有坚持不懈的信念和直面困难的勇气，就一定能品尝到成功的甘甜。',
          highlights: [
            { text: '世上无难事，只怕有心人', note: '【画龙点睛】在结尾点明人生大道理，点题准确，回味无穷。' }
          ]
        }
      ]
    },
    practice: {
      prompt: '请在下文空白处，填入最合适的华语词汇，组装出连贯的高分开头与结尾：',
      paragraphWithBlanks: '“哈哈，我成功了！”看着手中亲手烘焙的香甜小蛋糕，我高兴得（ 1 ）。虽然在烘烤过程中曾因为火候掌握不好而失败了两次，让我感到有些（ 2 ），但幸好有妈妈的鼓励。这次经历让我明白，只要（ 3 ）地尝试，任何难题都能迎刃而解！',
      blanks: [
        { id: '1', correctWord: '手舞足蹈', options: ['垂头丧气', '大惊失色', '手舞足蹈'] },
        { id: '2', correctWord: '垂头丧气', options: ['垂头丧气', '欣喜若狂', '兴高采烈'] },
        { id: '3', correctWord: '坚持不懈', options: ['半途而废', '游手好闲', '坚持不懈'] }
      ]
    }
  }
};

type StepId = 'analysis' | 'outline' | 'vocab' | 'model' | 'practice';

export function GuidedWritingScreen({ topicId, onBack }: GuidedWritingScreenProps) {
  const data = TOPICS_DATA[topicId];
  const [activeStep, setActiveStep] = useState<StepId>('analysis');
  const [selectedAnalysisIndex, setSelectedAnalysisIndex] = useState<number | null>(null);
  const [analysisChecked, setAnalysisChecked] = useState<boolean>(false);
  const [isAnalysisCorrect, setIsAnalysisCorrect] = useState<boolean>(false);

  // Outline state
  const [shuffledOutline, setShuffledOutline] = useState<{ id: string; part: string; desc: string }[]>(() => {
    return [...data.outline.items].sort(() => Math.random() - 0.5);
  });
  const [outlineChecked, setOutlineChecked] = useState<boolean>(false);
  const [outlineCorrect, setOutlineCorrect] = useState<boolean>(false);

  // Vocabulary audio speak state
  const [spokenWords, setSpokenWords] = useState<string[]>([]);

  // Practice state
  const [practiceAnswers, setPracticeAnswers] = useState<Record<string, string>>({});
  const [practiceChecked, setPracticeChecked] = useState<boolean>(false);
  const [practiceSuccess, setPracticeSuccess] = useState<boolean>(false);

  // Model essay highlight state
  const [selectedHighlight, setSelectedHighlight] = useState<{ text: string; note: string } | null>(null);

  // Reset steps
  const resetAnalysis = () => {
    setSelectedAnalysisIndex(null);
    setAnalysisChecked(false);
    setIsAnalysisCorrect(false);
  };

  const checkAnalysis = () => {
    if (selectedAnalysisIndex === null) return;
    setAnalysisChecked(true);
    const correct = selectedAnalysisIndex === data.analysis.correctIndex;
    setIsAnalysisCorrect(correct);
    if (correct) {
      sound.playChime();
    } else {
      sound.playWrong();
    }
  };

  const moveOutlineItem = (index: number, direction: 'up' | 'down') => {
    sound.playPop();
    const newItems = [...shuffledOutline];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newItems.length) return;
    
    // Swap
    const temp = newItems[index];
    newItems[index] = newItems[targetIndex];
    newItems[targetIndex] = temp;
    setShuffledOutline(newItems);
    setOutlineChecked(false);
  };

  const checkOutline = () => {
    const currentOrder = shuffledOutline.map(item => item.id);
    const isCorrect = JSON.stringify(currentOrder) === JSON.stringify(data.outline.correctOrder);
    setOutlineChecked(true);
    setOutlineCorrect(isCorrect);
    if (isCorrect) {
      sound.playChime();
      confetti({ particleCount: 60, spread: 60, origin: { y: 0.7 } });
    } else {
      sound.playWrong();
    }
  };

  const speakVocab = (word: string) => {
    sound.speakChinese(word);
    if (!spokenWords.includes(word)) {
      setSpokenWords(prev => [...prev, word]);
    }
  };

  const checkPractice = () => {
    let allCorrect = true;
    data.practice.blanks.forEach(blank => {
      if (practiceAnswers[blank.id] !== blank.correctWord) {
        allCorrect = false;
      }
    });

    setPracticeChecked(true);
    setPracticeSuccess(allCorrect);
    if (allCorrect) {
      sound.playCelebration();
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
    } else {
      sound.playWrong();
    }
  };

  const resetPractice = () => {
    setPracticeAnswers({});
    setPracticeChecked(false);
    setPracticeSuccess(false);
  };

  const handleHighlightClick = (hl: { text: string; note: string }) => {
    sound.playPop();
    setSelectedHighlight(hl);
  };

  const stepsList: { id: StepId; label: string; icon: string }[] = [
    { id: 'analysis', label: '1. 审题剖析', icon: '💡' },
    { id: 'outline', label: '2. 结构提纲', icon: '📝' },
    { id: 'vocab', label: '3. 好词佳句', icon: '🌟' },
    { id: 'model', label: '4. 范文赏析', icon: '📖' },
    { id: 'practice', label: '5. 实战挑战', icon: '✍️' },
  ];

  return (
    <div className={`min-h-screen w-full flex flex-col ${data.colorTheme.bg} overflow-hidden p-3 sm:p-5 md:p-6 pb-20`}>
      {/* Upper Navigation Row */}
      <header className="w-full max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 border-b-2 border-amber-900/10 pb-4 mb-5">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              sound.playPop();
              onBack();
            }}
            className="flex cursor-pointer items-center gap-1.5 rounded-full border-2 border-[#78350F] bg-white px-3 py-1.5 text-xs font-black text-[#78350F] shadow-[2px_2px_0_rgba(120,53,15,1)] transition-transform active:translate-y-0.5 hover:bg-amber-50"
            aria-label="返回命题作文列表"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>返回列表</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="text-2xl">{data.emoji}</span>
            <h2 className="font-['Fredoka',sans-serif] text-xl md:text-2xl font-black text-[#78350F] tracking-wide">
              《{data.title}》写作闯关
            </h2>
          </div>
        </div>

        {/* Step Tabs Indicator */}
        <div className="flex flex-wrap items-center justify-center gap-1 sm:gap-2 bg-amber-100/60 p-1 rounded-2xl border border-amber-900/10">
          {stepsList.map(step => (
            <button
              key={step.id}
              onClick={() => {
                sound.playPop();
                setActiveStep(step.id);
              }}
              className={`px-2.5 py-1.5 text-xs font-black rounded-xl transition-all cursor-pointer ${
                activeStep === step.id
                  ? 'bg-amber-800 text-white shadow-xs'
                  : 'text-amber-900/60 hover:text-amber-900 hover:bg-amber-50'
              }`}
            >
              <span className="mr-1">{step.icon}</span>
              <span className="hidden sm:inline">{step.label.slice(2)}</span>
            </button>
          ))}
        </div>
      </header>

      {/* Main Sandbox Interactive Workspace */}
      <main className="flex-1 w-full max-w-5xl mx-auto bg-white rounded-3xl border-4 border-[#78350F] shadow-[8px_8px_0px_#78350F] overflow-hidden flex flex-col">
        
        {/* Step Banner */}
        <div className="bg-[#FEF3C7] border-b-4 border-[#78350F] px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-[#78350F]">
            <Star className="h-5 w-5 fill-amber-400 text-[#78350F]" />
            <span className="font-['Fredoka',sans-serif] text-base font-black">
              {stepsList.find(s => s.id === activeStep)?.label}
            </span>
          </div>
          <div className="text-xs font-bold text-amber-900/70">
            华语丁组高分秘笈 🐝
          </div>
        </div>

        {/* Step Content Arena */}
        <div className="flex-1 p-5 md:p-8 overflow-y-auto">
          <AnimatePresence mode="wait">
            
            {/* STEP 1: ANALYSIS */}
            {activeStep === 'analysis' && (
              <motion.div
                key="analysis"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-6"
              >
                <div className="bg-amber-50/50 rounded-2xl p-4 border border-amber-200">
                  <h3 className="text-lg font-black text-[#78350F] flex items-center gap-2">
                    <span>💡</span> 审题大考验：在动笔写《{data.title}》前，让我们先做对这道题！
                  </h3>
                  <p className="mt-2 text-xs font-bold text-amber-900/60 leading-relaxed">
                    磨刀不误砍柴工。审清题目的核心要素，是作文拿到高分（一等水平）的首要条件。
                  </p>
                </div>

                <div className="bg-white rounded-2xl p-5 border-2 border-amber-900/15 space-y-4 shadow-sm">
                  <h4 className="text-base font-black text-slate-800 leading-snug">
                    {data.analysis.question}
                  </h4>

                  <div className="grid grid-cols-1 gap-3">
                    {data.analysis.options.map((option, index) => {
                      const isSelected = selectedAnalysisIndex === index;
                      const showSuccess = analysisChecked && index === data.analysis.correctIndex;
                      const showFailure = analysisChecked && isSelected && index !== data.analysis.correctIndex;

                      return (
                        <button
                          key={index}
                          onClick={() => {
                            if (analysisChecked) return;
                            sound.playPop();
                            setSelectedAnalysisIndex(index);
                          }}
                          disabled={analysisChecked}
                          className={`w-full text-left p-4 rounded-xl border-2 font-bold text-sm transition-all flex items-start gap-3 ${
                            analysisChecked
                              ? showSuccess
                                ? 'bg-emerald-50 border-emerald-500 text-emerald-900'
                                : showFailure
                                  ? 'bg-rose-50 border-rose-500 text-rose-900'
                                  : 'bg-slate-50 border-slate-200 text-slate-400'
                              : isSelected
                                ? 'bg-amber-50 border-amber-500 text-amber-900 scale-[1.01]'
                                : 'bg-white border-slate-200 hover:border-amber-300 text-slate-700'
                          }`}
                        >
                          <span className={`h-5 w-5 rounded-full shrink-0 flex items-center justify-center border text-xs font-black ${
                            isSelected ? 'bg-amber-500 border-amber-600 text-white' : 'border-slate-300'
                          }`}>
                            {String.fromCharCode(65 + index)}
                          </span>
                          <span className="flex-1 leading-snug">{option}</span>
                        </button>
                      );
                    })}
                  </div>

                  <div className="pt-3 flex flex-wrap items-center gap-3 justify-between">
                    <button
                      onClick={resetAnalysis}
                      className="px-4 py-2 border-2 border-[#78350F] rounded-xl text-xs font-black text-[#78350F] hover:bg-amber-50 active:translate-y-0.5 shadow-[2px_2px_0_#78350F] transition-transform cursor-pointer"
                    >
                      重新选择
                    </button>

                    <button
                      onClick={checkAnalysis}
                      disabled={selectedAnalysisIndex === null || analysisChecked}
                      className="px-6 py-2 bg-amber-500 text-white border-2 border-amber-700 rounded-xl text-xs font-black hover:bg-amber-600 disabled:opacity-50 active:translate-y-0.5 shadow-[2px_2px_0_#78350F] transition-transform cursor-pointer"
                    >
                      提交答案
                    </button>
                  </div>
                </div>

                {/* Explanation Output */}
                <AnimatePresence>
                  {analysisChecked && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className={`rounded-2xl p-4 border-2 flex items-start gap-3 ${
                        isAnalysisCorrect ? 'bg-emerald-50 border-emerald-300' : 'bg-rose-50 border-rose-300'
                      }`}
                    >
                      <span className="text-2xl">{isAnalysisCorrect ? '🏆' : '💡'}</span>
                      <div>
                        <h4 className={`text-sm font-black ${isAnalysisCorrect ? 'text-emerald-900' : 'text-rose-900'}`}>
                          {isAnalysisCorrect ? '太棒了！答对啦！' : '哎呀，选错咯！'}
                        </h4>
                        <p className={`mt-1 text-xs font-semibold leading-relaxed ${isAnalysisCorrect ? 'text-emerald-800' : 'text-rose-800'}`}>
                          {data.analysis.explanation}
                        </p>
                        <button
                          onClick={() => {
                            sound.playPop();
                            setActiveStep('outline');
                          }}
                          className="mt-3 inline-flex items-center gap-1 bg-amber-800 text-white px-3.5 py-1.5 rounded-lg text-xs font-black hover:bg-amber-900"
                        >
                          <span>下一关：结构提纲</span>
                          <ChevronRight className="h-3 w-3" />
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {/* STEP 2: OUTLINE */}
            {activeStep === 'outline' && (
              <motion.div
                key="outline"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-6"
              >
                <div className="bg-amber-50/50 rounded-2xl p-4 border border-amber-200">
                  <h3 className="text-base font-black text-[#78350F] flex items-center gap-2">
                    <span>📝</span> 结构连连看：用正确的逻辑，拖动或移动段落提纲！
                  </h3>
                  <p className="mt-1 text-xs font-bold text-amber-900/60 leading-relaxed">
                    一篇优秀的作文必须段落分明、条理清晰。请使用右侧的 ⬆️ ⬇️ 按钮调整段落结构，使其符合高分作文逻辑。
                  </p>
                </div>

                <div className="space-y-3">
                  {shuffledOutline.map((item, index) => {
                    return (
                      <motion.div
                        key={item.id}
                        layout
                        className="flex items-center gap-3 bg-white p-4 rounded-xl border-2 border-slate-200 shadow-xs hover:border-amber-300 transition-colors"
                      >
                        {/* Bullet Number */}
                        <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center font-black text-amber-900 shrink-0 border border-amber-200">
                          {index + 1}
                        </div>

                        {/* Title and details */}
                        <div className="flex-1 min-w-0">
                          <span className="inline-block px-2.5 py-0.5 rounded-md bg-amber-100 text-[#78350F] font-black text-xs border border-amber-200 mb-1">
                            {item.part}
                          </span>
                          <p className="text-xs font-semibold text-slate-600 leading-snug">
                            {item.desc}
                          </p>
                        </div>

                        {/* Order Controls */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={() => moveOutlineItem(index, 'up')}
                            disabled={index === 0}
                            className="h-8 w-8 rounded-lg border border-slate-200 bg-slate-50 text-slate-600 flex items-center justify-center hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
                            aria-label="向上移动"
                          >
                            <span>▲</span>
                          </button>
                          <button
                            onClick={() => moveOutlineItem(index, 'down')}
                            disabled={index === shuffledOutline.length - 1}
                            className="h-8 w-8 rounded-lg border border-slate-200 bg-slate-50 text-slate-600 flex items-center justify-center hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
                            aria-label="向下移动"
                          >
                            <span>▼</span>
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                <div className="flex justify-between items-center pt-2">
                  <button
                    onClick={() => {
                      sound.playPop();
                      setShuffledOutline([...data.outline.items].sort(() => Math.random() - 0.5));
                      setOutlineChecked(false);
                      setOutlineCorrect(false);
                    }}
                    className="px-4 py-2 border-2 border-slate-400 text-slate-700 bg-white rounded-xl text-xs font-black hover:bg-slate-50 cursor-pointer"
                  >
                    随机打乱
                  </button>

                  <button
                    onClick={checkOutline}
                    className="px-6 py-2 bg-amber-500 text-white border-2 border-amber-700 rounded-xl text-xs font-black hover:bg-amber-600 shadow-[2px_2px_0_#78350F] cursor-pointer"
                  >
                    检查结构
                  </button>
                </div>

                {/* Explanation Output */}
                <AnimatePresence>
                  {outlineChecked && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className={`rounded-2xl p-4 border-2 flex items-start gap-3 ${
                        outlineCorrect ? 'bg-emerald-50 border-emerald-300' : 'bg-rose-50 border-rose-300'
                      }`}
                    >
                      <span className="text-2xl">{outlineCorrect ? '🎉' : '💡'}</span>
                      <div>
                        <h4 className={`text-sm font-black ${outlineCorrect ? 'text-emerald-900' : 'text-rose-900'}`}>
                          {outlineCorrect ? '结构完美！你真棒！' : '顺序不太对哦！再试一次'}
                        </h4>
                        <p className={`mt-1 text-xs font-semibold leading-relaxed ${outlineCorrect ? 'text-emerald-800' : 'text-rose-800'}`}>
                          {outlineCorrect 
                            ? `太出色了！标准的写作逻辑是：【开头】点明中心 ➔ 【内容】细节与阻碍 ➔ 【内容】探究与改变 ➔ 【结尾】情感升华。你已经完全掌握了！`
                            : '提示：一般开头交代起因，接着交代遇到的重重困难（发展），随后写自己如何努力或明白道理（高潮），最后写总结和感悟（结尾）。'}
                        </p>
                        {outlineCorrect && (
                          <button
                            onClick={() => {
                              sound.playPop();
                              setActiveStep('vocab');
                            }}
                            className="mt-3 inline-flex items-center gap-1 bg-amber-800 text-white px-3.5 py-1.5 rounded-lg text-xs font-black hover:bg-amber-900"
                          >
                            <span>下一关：积累好词佳句</span>
                            <ChevronRight className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {/* STEP 3: VOCABULARY */}
            {activeStep === 'vocab' && (
              <motion.div
                key="vocab"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-6"
              >
                <div className="bg-amber-50/50 rounded-2xl p-4 border border-amber-200">
                  <h3 className="text-base font-black text-[#78350F] flex items-center gap-2">
                    <span>🌟</span> 好词佳句宝箱：点击词卡收听发音，将它们装进脑海！
                  </h3>
                  <p className="mt-1 text-xs font-bold text-amber-900/60 leading-relaxed">
                    在作文中合理使用高级成语和关联词，能瞬间提升作文的文采！请点击小喇叭收听标准国语（华语）发音。
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {data.vocabulary.map((vocab, index) => {
                    const hasSpoken = spokenWords.includes(vocab.word);
                    return (
                      <motion.div
                        key={vocab.word}
                        whileHover={{ scale: 1.02 }}
                        className="bg-white rounded-2xl border-2 border-amber-900/15 p-5 shadow-xs relative flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <h4 className="text-lg font-black text-[#78350F] tracking-wide">
                                {vocab.word}
                              </h4>
                              <span className="text-xs font-bold text-slate-400 font-mono">
                                {vocab.pinyin}
                              </span>
                            </div>

                            <button
                              onClick={() => speakVocab(vocab.word)}
                              className={`h-9 w-9 rounded-full flex items-center justify-center border-2 border-amber-500 hover:bg-amber-50 text-amber-600 transition-colors shadow-xs shrink-0 cursor-pointer ${
                                hasSpoken ? 'bg-amber-100/50' : 'bg-white'
                              }`}
                              title="播放朗读"
                            >
                              <Volume2 className="h-4 w-4 animate-bounce" />
                            </button>
                          </div>

                          <div className="mt-3 p-2.5 rounded-lg bg-amber-50/30 text-xs text-amber-900/80 leading-relaxed font-bold border border-amber-900/5">
                            <span className="text-amber-800 font-black">【释义】</span>
                            {vocab.meaning}
                          </div>

                          <div className="mt-3 text-xs font-semibold text-slate-500 leading-relaxed">
                            <span className="text-amber-600 font-black">【例句】</span>
                            {vocab.sentence}
                          </div>
                        </div>

                        {hasSpoken && (
                          <div className="mt-3 flex items-center gap-1 text-[10px] font-black text-emerald-600 bg-emerald-50 self-start px-2 py-0.5 rounded-md">
                            <Check className="h-3 w-3" />
                            <span>已收听积累</span>
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>

                <div className="flex justify-end pt-3">
                  <button
                    onClick={() => {
                      sound.playPop();
                      setActiveStep('model');
                    }}
                    className="px-6 py-2 bg-amber-500 text-white border-2 border-amber-700 rounded-xl text-xs font-black hover:bg-amber-600 shadow-[2px_2px_0_#78350F]"
                  >
                    下一关：满分范文赏析
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 4: MODEL ESSAY */}
            {activeStep === 'model' && (
              <motion.div
                key="model"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-6"
              >
                <div className="bg-amber-50/50 rounded-2xl p-4 border border-amber-200">
                  <h3 className="text-base font-black text-[#78350F] flex items-center gap-2">
                    <span>📖</span> 满分范文赏析：点击亮色彩色文本，解锁专业写作手法！
                  </h3>
                  <p className="mt-1 text-xs font-bold text-amber-900/60 leading-relaxed">
                    精选5星级考场满分范文，学习高分作文的字里行间！点击带有下划线的橙色文字即可弹出专业批注。
                  </p>
                </div>

                {/* Essay Paper Sheet */}
                <div className="bg-amber-50/20 border-2 border-amber-900/10 rounded-2xl p-6 space-y-6 relative overflow-hidden shadow-xs">
                  
                  {/* Grid background effect to look like paper */}
                  <div className="absolute inset-0 pointer-events-none opacity-20" style={{
                    backgroundImage: 'linear-gradient(#f59e0b 1px, transparent 1px)',
                    backgroundSize: '100% 28px'
                  }} />

                  <h4 className="text-center text-lg font-black text-[#78350F] tracking-widest relative z-10 border-b-2 border-amber-900/15 pb-2">
                    《{data.title}》
                  </h4>

                  <div className="space-y-5 text-sm leading-relaxed text-slate-700 relative z-10">
                    {data.modelEssay.paragraphs.map((para, pIdx) => {
                      // We can render highlights interactively
                      let renderedContent: React.ReactNode = para.content;
                      
                      // Match and replace highlights with clickable buttons
                      para.highlights.forEach((hl, hlIdx) => {
                        const parts = (renderedContent as string).split(hl.text);
                        if (parts.length > 1) {
                          renderedContent = (
                            <>
                              {parts[0]}
                              <button
                                onClick={() => handleHighlightClick(hl)}
                                className="bg-amber-100 hover:bg-amber-200 text-amber-950 px-1 rounded border-b-2 border-amber-500 font-extrabold cursor-pointer inline transition-colors"
                              >
                                {hl.text}
                              </button>
                              {parts.slice(1).join(hl.text)}
                            </>
                          );
                        }
                      });

                      return (
                        <div key={pIdx} className="space-y-1.5">
                          <span className="inline-block text-[10px] font-black tracking-wider text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md">
                            {para.label}
                          </span>
                          <p className="indent-8 font-semibold text-slate-800 leading-loose">
                            {renderedContent}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Highlight Drawer / Notification Panel */}
                <AnimatePresence>
                  {selectedHighlight && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="bg-sky-50 border-2 border-sky-300 rounded-2xl p-4 flex items-start gap-3"
                    >
                      <span className="text-2xl">💡</span>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h5 className="text-xs font-black text-sky-900">
                            【高分句型赏析】：“{selectedHighlight.text}”
                          </h5>
                          <button
                            onClick={() => setSelectedHighlight(null)}
                            className="text-sky-700 hover:text-sky-900 text-xs font-black"
                          >
                            关闭
                          </button>
                        </div>
                        <p className="mt-1 text-xs font-bold text-sky-800 leading-relaxed">
                          {selectedHighlight.note}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex justify-end pt-3">
                  <button
                    onClick={() => {
                      sound.playPop();
                      setActiveStep('practice');
                    }}
                    className="px-6 py-2 bg-amber-500 text-white border-2 border-amber-700 rounded-xl text-xs font-black hover:bg-amber-600 shadow-[2px_2px_0_#78350F]"
                  >
                    下一关：实战演练
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 5: PRACTICE */}
            {activeStep === 'practice' && (
              <motion.div
                key="practice"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-6"
              >
                <div className="bg-amber-50/50 rounded-2xl p-4 border border-amber-200">
                  <h3 className="text-base font-black text-[#78350F] flex items-center gap-2">
                    <span>✍️</span> 实战挑战：将正确的高分词汇填入空白处，组装高分佳段！
                  </h3>
                  <p className="mt-1 text-xs font-bold text-amber-900/60 leading-relaxed">
                    趁热打铁。将刚才积累的佳句词汇填入段落中，检验你的学习成果！
                  </p>
                </div>

                <div className="bg-white rounded-3xl p-6 border-2 border-amber-900/15 space-y-6 shadow-sm">
                  <h4 className="text-sm font-black text-slate-500 flex items-center gap-1">
                    <Lightbulb className="h-4 w-4 text-amber-500" />
                    {data.practice.prompt}
                  </h4>

                  {/* Paragraph with inline inputs */}
                  <div className="p-5 rounded-2xl bg-amber-50/10 border border-amber-200 text-slate-800 font-semibold text-sm leading-loose">
                    {/* Construct paragraph chunks */}
                    {data.practice.paragraphWithBlanks.split(/(\(\s*\d+\s*\))/).map((chunk, index) => {
                      const match = chunk.match(/\(\s*(\d+)\s*\)/);
                      if (match) {
                        const blankId = match[1];
                        const blank = data.practice.blanks.find(b => b.id === blankId);
                        const userVal = practiceAnswers[blankId];

                        return (
                          <span key={index} className="inline-block mx-1">
                            <select
                              value={userVal ?? ''}
                              onChange={(e) => {
                                sound.playPop();
                                setPracticeAnswers(prev => ({ ...prev, [blankId]: e.target.value }));
                              }}
                              disabled={practiceChecked}
                              className={`px-3 py-1 text-xs font-black border-2 rounded-lg cursor-pointer ${
                                practiceChecked
                                  ? userVal === blank?.correctWord
                                    ? 'bg-emerald-50 border-emerald-500 text-emerald-900'
                                    : 'bg-rose-50 border-rose-500 text-rose-900'
                                  : userVal
                                    ? 'border-amber-500 bg-amber-50 text-amber-900'
                                    : 'border-slate-300 bg-white text-slate-600'
                              }`}
                            >
                              <option value="">-- 请选择词语 --</option>
                              {blank?.options.map(opt => (
                                <option key={opt} value={opt}>
                                  {opt}
                                </option>
                              ))}
                            </select>
                          </span>
                        );
                      }
                      return <span key={index}>{chunk}</span>;
                    })}
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <button
                      onClick={resetPractice}
                      className="px-4 py-2 border-2 border-[#78350F] rounded-xl text-xs font-black text-[#78350F] hover:bg-amber-50 shadow-[2px_2px_0_#78350F] cursor-pointer"
                    >
                      重新挑战
                    </button>

                    <button
                      onClick={checkPractice}
                      disabled={practiceChecked || Object.keys(practiceAnswers).length < data.practice.blanks.length}
                      className="px-6 py-2 bg-amber-500 text-white border-2 border-amber-700 rounded-xl text-xs font-black hover:bg-amber-600 shadow-[2px_2px_0_#78350F] disabled:opacity-50 cursor-pointer"
                    >
                      提交评语
                    </button>
                  </div>
                </div>

                {/* Practice Feedback Stamp */}
                <AnimatePresence>
                  {practiceChecked && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className={`rounded-2xl p-5 border-2 flex flex-col sm:flex-row items-center gap-4 relative overflow-hidden ${
                        practiceSuccess ? 'bg-emerald-50 border-emerald-300 text-emerald-900' : 'bg-rose-50 border-rose-300 text-rose-900'
                      }`}
                    >
                      {/* Big interactive congratulatory stamp */}
                      {practiceSuccess && (
                        <div className="absolute right-4 top-4 rotate-[15deg] border-4 border-emerald-500 rounded-xl px-3 py-1 font-black text-emerald-600 text-xs tracking-widest opacity-20 scale-125 pointer-events-none uppercase">
                          Excellent
                        </div>
                      )}

                      <div className="h-14 w-14 rounded-full bg-white flex items-center justify-center shadow-md text-3xl shrink-0 border border-slate-100">
                        {practiceSuccess ? '🏆' : '✏️'}
                      </div>

                      <div className="flex-1 text-center sm:text-left">
                        <h4 className="text-base font-black">
                          {practiceSuccess ? '闯关成功！荣获高分作文勋章！' : '词语搭配还不够完美哦！'}
                        </h4>
                        <p className="mt-1 text-xs font-bold leading-relaxed opacity-90">
                          {practiceSuccess
                            ? '你已经成功掌握了该作文题目的核心句型、结构和高级好词。写出这般行云流水的优美段落，在考场上必能给阅卷老师留下极其美妙的初印象！'
                            : '提示：请仔细回想“好词佳句宝箱”和“范文赏析”里的正确搭配，结合上下文句意，调整你的选择后再次提交！'}
                        </p>

                        {practiceSuccess && (
                          <div className="mt-4 flex flex-wrap items-center gap-3">
                            <button
                              onClick={() => {
                                sound.playPop();
                                onBack();
                              }}
                              className="bg-amber-800 text-white px-4 py-2 rounded-xl text-xs font-black hover:bg-amber-900 cursor-pointer"
                            >
                              完成本课学习
                            </button>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

      </main>
    </div>
  );
}
