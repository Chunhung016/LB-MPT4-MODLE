import { useState, useEffect } from "react";
import { 
  Sparkles, 
  BookOpen, 
  Volume2, 
  VolumeX, 
  Copy, 
  RefreshCw, 
  ChefHat, 
  Check, 
  ChevronRight, 
  Star, 
  Heart,
  Calendar,
  MapPin,
  HelpCircle,
  Clock,
  ThumbsUp,
  AlertCircle,
  Trophy,
  Award,
  SkipForward,
  RotateCcw,
  CheckCircle2,
  Puzzle
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

// Option interface
interface IngredientOption {
  key: string; // A, B, C
  text: string;
  emoji: string;
  feedback: string;
}

// Game Chunk item for word break reorder game
interface ChunkItem {
  id: string;
  text: string;
}

interface GameRoundData {
  roundNum: number;
  title: string;
  targetSentence: string;
  originalChunks: string[];
  scrambledChunks: ChunkItem[];
}

// Steps structure
interface GameStep {
  number: number;
  title: string;
  subTitle: string;
  question: string;
  icon: string;
  layerName: string;
}

export default function App() {
  // Game states: 
  // 0: Welcome Screen
  // 1: Choose Cake Sponge (Step 1)
  // 2: Add Jam Filling (Step 2)
  // 3: Apply Frosting (Step 3)
  // 4: Add Sprinkles & Decoration (Step 4)
  // 5: Bake & Result Screen (Step 5)
  const [currentStep, setCurrentStep] = useState<number>(0);
  
  // Selection states
  const [step1Selection, setStep1Selection] = useState<string>("");
  const [step2Selection, setStep2Selection] = useState<string>("");
  const [step3Selection, setStep3Selection] = useState<string>("");
  const [step4Selection, setStep4Selection] = useState<string>("");

  // Feedback states (to show sweet remarks immediately after clicking)
  const [praiseText, setPraiseText] = useState<string>("");
  const [tempFeedback, setTempFeedback] = useState<string>("");

  // API loading / result states
  const [isBaking, setIsBaking] = useState<boolean>(false);
  const [bakeResult, setBakeResult] = useState<{
    title: string;
    content: string;
    praise: string;
    wordCount: number;
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");

  // Text-To-Speech reading state
  const [isReading, setIsReading] = useState<boolean>(false);
  const [speechSynth, setSpeechSynth] = useState<SpeechSynthesis | null>(null);
  const [activeUtterance, setActiveUtterance] = useState<SpeechSynthesisUtterance | null>(null);

  // Immersive View & 3-Round Game states
  const [resultSubMode, setResultSubMode] = useState<"read" | "game" | "completed">("read");
  const [readingTimeRemaining, setReadingTimeRemaining] = useState<number>(45);
  const [isReadingTimerActive, setIsReadingTimerActive] = useState<boolean>(false);

  // 3-Round Game Data
  const [gameRounds, setGameRounds] = useState<GameRoundData[]>([]);
  const [currentRoundIndex, setCurrentRoundIndex] = useState<number>(0);
  const [placedChunkIds, setPlacedChunkIds] = useState<string[]>([]);
  const [roundStatus, setRoundStatus] = useState<"playing" | "success" | "error">("playing");
  const [showHint, setShowHint] = useState<boolean>(false);

  // Sound effects toggles (simulated or visual indicators)
  const [showParticle, setShowParticle] = useState<boolean>(false);

  // 45s Reading Timer Countdown Effect
  useEffect(() => {
    let timer: any = null;
    if (currentStep === 5 && resultSubMode === "read" && isReadingTimerActive && readingTimeRemaining > 0) {
      timer = setInterval(() => {
        setReadingTimeRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setIsReadingTimerActive(false);
            // Auto start word break game after 45s reading!
            startWordGame();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [currentStep, resultSubMode, isReadingTimerActive, readingTimeRemaining]);

  // Helper to build 3 rounds from composition content
  const build3Rounds = (content: string): GameRoundData[] => {
    const paragraphs = content.split("\n").filter(p => p.trim().length > 0);
    const p1 = paragraphs[0] || "星期天在客厅玩红气球，我把气球在衣服上摩擦几下，拿到头顶，头发竟然全都竖着吸了上去！";
    const p2 = paragraphs[1] || "我把气球靠近碎纸片，小纸片也纷纷像轻盈的雪花一样粘在上面，跳起了欢快的舞蹈！";
    const p4 = paragraphs[3] || paragraphs[2] || "亲自动手发现真理的感觉太棒了，学到科学新知识让我感到无比快乐！";

    const chunkSentence = (sentence: string): string[] => {
      const rawMatches = sentence.match(/[^，。！？：；]+[，。！？：；]?/g);
      if (rawMatches && rawMatches.length >= 3 && rawMatches.length <= 6) {
        return rawMatches;
      }
      const chunks: string[] = [];
      let cur = "";
      for (let i = 0; i < sentence.length; i++) {
        cur += sentence[i];
        if (cur.length >= 8 || i === sentence.length - 1) {
          chunks.push(cur);
          cur = "";
        }
      }
      return chunks;
    };

    const createScrambled = (chunks: string[], prefix: string): ChunkItem[] => {
      const items = chunks.map((text, idx) => ({ id: `${prefix}-${idx}`, text }));
      const scrambled = [...items].sort(() => Math.random() - 0.5);
      if (scrambled.map(s => s.text).join("") === chunks.join("") && scrambled.length > 1) {
        scrambled.reverse();
      }
      return scrambled;
    };

    const r1Chunks = chunkSentence(p1);
    const r2Chunks = chunkSentence(p2);
    const r3Chunks = chunkSentence(p4);

    return [
      {
        roundNum: 1,
        title: "第一关：起因句打散重组 🧩",
        targetSentence: p1,
        originalChunks: r1Chunks,
        scrambledChunks: createScrambled(r1Chunks, "r1"),
      },
      {
        roundNum: 2,
        title: "第二关：观察细节句打散重组 🔍",
        targetSentence: p2,
        originalChunks: r2Chunks,
        scrambledChunks: createScrambled(r2Chunks, "r2"),
      },
      {
        roundNum: 3,
        title: "第三关：心得总结金句打散重组 💡",
        targetSentence: p4,
        originalChunks: r3Chunks,
        scrambledChunks: createScrambled(r3Chunks, "r3"),
      },
    ];
  };

  const startWordGame = () => {
    setIsReadingTimerActive(false);
    setResultSubMode("game");
    setCurrentRoundIndex(0);
    setPlacedChunkIds([]);
    setRoundStatus("playing");
    setShowHint(false);
  };

  const handleSelectChunk = (chunkId: string) => {
    if (roundStatus === "success") return;
    if (placedChunkIds.includes(chunkId)) return;

    const newPlaced = [...placedChunkIds, chunkId];
    setPlacedChunkIds(newPlaced);

    const currentRound = gameRounds[currentRoundIndex];
    if (!currentRound) return;

    // Auto-check when all pieces are placed
    if (newPlaced.length === currentRound.originalChunks.length) {
      const userString = newPlaced
        .map(id => currentRound.scrambledChunks.find(x => x.id === id)?.text || "")
        .join("");
      const targetString = currentRound.originalChunks.join("");

      if (userString === targetString) {
        setRoundStatus("success");
        setTimeout(() => {
          if (currentRoundIndex < 2) {
            setCurrentRoundIndex(prev => prev + 1);
            setPlacedChunkIds([]);
            setRoundStatus("playing");
            setShowHint(false);
          } else {
            setResultSubMode("completed");
          }
        }, 1400);
      } else {
        setRoundStatus("error");
      }
    }
  };

  const handleUnselectChunk = (chunkId: string) => {
    if (roundStatus === "success") return;
    setPlacedChunkIds(prev => prev.filter(id => id !== chunkId));
    setRoundStatus("playing");
  };

  const handleResetRound = () => {
    setPlacedChunkIds([]);
    setRoundStatus("playing");
  };

  // Initialize Speech Synthesis
  useEffect(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      setSpeechSynth(window.speechSynthesis);
    }
  }, []);

  // Handle TTS reading
  const handleToggleRead = () => {
    if (!speechSynth || !bakeResult) return;

    if (isReading) {
      speechSynth.cancel();
      setIsReading(false);
      return;
    }

    const textToRead = `${bakeResult.title}。${bakeResult.content}`;
    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.lang = "zh-CN";
    utterance.rate = 1.0;

    utterance.onend = () => {
      setIsReading(false);
    };

    utterance.onerror = () => {
      setIsReading(false);
    };

    setActiveUtterance(utterance);
    setIsReading(true);
    speechSynth.speak(utterance);
  };

  // Stop reading if step changes or on unmount
  useEffect(() => {
    return () => {
      if (speechSynth) {
        speechSynth.cancel();
      }
    };
  }, [speechSynth, currentStep]);

  // Copy to Clipboard
  const [copied, setCopied] = useState<boolean>(false);
  const handleCopy = async () => {
    if (!bakeResult) return;
    try {
      await navigator.clipboard.writeText(`${bakeResult.title}\n\n${bakeResult.content}\n\n🍰 糕点师评语：${bakeResult.praise}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy", err);
    }
  };

  // Definitions for all options
  const step1Options: IngredientOption[] = [
    {
      key: "A",
      text: "发现五彩斗鱼吐泡泡 🐠",
      emoji: "🐠",
      feedback: "哇！彩色斗鱼当蛋糕底，这篇作文一定像水下世界一样色彩斑斓！💦"
    },
    {
      key: "B",
      text: "发现落叶慢慢移动 🍂",
      emoji: "🍂",
      feedback: "天哪！会动的树叶？你挑选了充满神秘大自然芬芳的森林蛋糕胚！🌳"
    },
    {
      key: "C",
      text: "发现气球吸起头发 🎈",
      emoji: "🎈",
      feedback: "太酷了！气球魔法蛋糕胚！这篇作文肯定充满了科学魔力的静电火花！⚡"
    }
  ];

  // Step 2 options depend dynamically on Step 1 choice
  const getStep2Options = (s1: string): IngredientOption[] => {
    switch (s1) {
      case "A": // Betta fish
        return [
          {
            key: "A",
            text: "筑起白云般的泡沫巢 ☁️",
            emoji: "☁️",
            feedback: "白云气泡夹心！你的眼睛比显微镜还要亮，抓住了最生动的细节！🔍"
          },
          {
            key: "B",
            text: "雄鱼在泡沫下守护 🐟",
            emoji: "🐟",
            feedback: "坚强守护夹心！雄鱼爸爸的爱像巧克力一样浓郁，真让人感动！❤️"
          },
          {
            key: "C",
            text: "鱼卵孵出活泼鱼苗 🧚",
            emoji: "🧚",
            feedback: "生命奇迹夹心！无数的小生命在跳舞，蛋糕一瞬间变得超级有活力！✨"
          }
        ];
      case "B": // Dead leaf butterfly
        return [
          {
            key: "A",
            text: "翅膀和枯叶一模一样 🍁",
            emoji: "🍁",
            feedback: "魔法伪装夹心！枯叶蝶可是大自然的顶级魔术师，你的观察真敏锐！🕵️"
          },
          {
            key: "B",
            text: "跟着周围树叶轻轻摇摆 🍃",
            emoji: "🍃",
            feedback: "随风摇摆夹心！它不仅穿了迷彩服，还会演戏呢，太生动了！🎬"
          },
          {
            key: "C",
            text: "凑近看翅膀微微颤动 🦋",
            emoji: "🦋",
            feedback: "呼吸颤动夹心！连那么细微的抖动都被你捕捉到了，简直是天才侦探！🌟"
          }
        ];
      case "C": // Static balloon
        return [
          {
            key: "A",
            text: "头发吸附到气球上 ⚡",
            emoji: "⚡",
            feedback: "魔力发丝夹心！无形的小手在拉扯，这个比喻简直像草莓酱一样甜美！🍓"
          },
          {
            key: "B",
            text: "小纸片像雪花般贴上 ✨",
            emoji: "✨",
            feedback: "飞雪纸屑夹心！小纸片在跳芭蕾舞呢，科学的魅力真让人着迷！💃"
          },
          {
            key: "C",
            text: "吸在墙上稳稳不掉下 🧲",
            emoji: "🧲",
            feedback: "坚固磁吸夹心！气球也会壁虎功，你的科学脑瓜子转得可真快！🧠"
          }
        ];
      default:
        return [];
    }
  };

  const step3Options: IngredientOption[] = [
    {
      key: "A",
      text: "请教大人的疑惑 🙋‍♂️",
      emoji: "🙋‍♂️",
      feedback: "博学多才奶油霜！虚心请教大人的你，一定是个最聪明的甜心宝贝！🍦"
    },
    {
      key: "B",
      text: "动手做对比实验 🧪",
      emoji: "🧪",
      feedback: "硬核实验奶油霜！动手实践出真知，你未来的科学家奖章已经预定啦！🎖️"
    },
    {
      key: "C",
      text: "翻书或查阅资料 📚",
      emoji: "📚",
      feedback: "博览群书奶油霜！用知识武装头脑，这层科学奶油最美味、最有营养！🥛"
    }
  ];

  const step4Options: IngredientOption[] = [
    {
      key: "A",
      text: "明白了留心观察的道理 💡",
      emoji: "💡",
      feedback: "智慧启迪糖霜！完美的点睛之笔，这颗智慧糖让作文更有深度啦！🍬"
    },
    {
      key: "B",
      text: "大自然的世界真神奇 🌍",
      emoji: "🌍",
      feedback: "探索宇宙糖霜！大自然是最好的老师，你的好奇心会带你飞得更高！🚀"
    },
    {
      key: "C",
      text: "学到新知识真快乐 🎉",
      emoji: "🎉",
      feedback: "喜悦收获糖霜！成就感爆棚，写作文和学知识原来都可以这么快乐！🧁"
    }
  ];

  // Step names & icons
  const steps: GameStep[] = [
    { number: 1, title: "挑选蛋糕胚", subTitle: "选择发现契机", question: "你想在什么时候、哪里，发现什么有趣的线索呢？", icon: "🎂", layerName: "蛋糕胚 (起因)" },
    { number: 2, title: "注入夹心酱", subTitle: "仔细观察细节", question: "仔细观察时，你发现了什么奇妙的现象？", icon: "🍓", layerName: "夹心酱 (观察)" },
    { number: 3, title: "抹上奶油霜", subTitle: "探索背后原因", question: "你是怎么知道背后的奇妙科学秘密的呢？", icon: "🥛", layerName: "奶油霜 (过程)" },
    { number: 4, title: "撒上小糖霜", subTitle: "抒发所得感悟", question: "这次奇妙的发现，让你明白了什么道理呢？", icon: "⭐", layerName: "金糖霜 (感悟)" }
  ];

  // Helper to trigger confetti effects visually
  const triggerCelebration = () => {
    setShowParticle(true);
    setTimeout(() => setShowParticle(false), 2000);
  };

  // Selection Action
  const handleSelect = (key: string, option: IngredientOption) => {
    triggerCelebration();
    setTempFeedback(option.feedback);

    if (currentStep === 1) {
      setStep1Selection(option.text);
      // Automatically advance with smooth fade/praise delay
    } else if (currentStep === 2) {
      setStep2Selection(option.text);
    } else if (currentStep === 3) {
      setStep3Selection(option.text);
    } else if (currentStep === 4) {
      setStep4Selection(option.text);
    }
  };

  // Proceed to next step manually with a cute button or automatically
  const handleNextStep = () => {
    setTempFeedback("");
    if (currentStep < 4) {
      setCurrentStep(prev => prev + 1);
    } else if (currentStep === 4) {
      // Bake the cake! Call API
      bakeTheComposition();
    }
  };

  // Go back to edit
  const handlePrevStep = () => {
    setTempFeedback("");
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  // Start the baking game
  const startBakingGame = () => {
    setIsReadingTimerActive(false);
    setResultSubMode("read");
    setStep1Selection("");
    setStep2Selection("");
    setStep3Selection("");
    setStep4Selection("");
    setTempFeedback("");
    setBakeResult(null);
    setErrorMessage("");
    setCurrentStep(1);
  };

  // Main local deterministic essay generator - 100% offline, bulletproof, and extremely high-quality
  const generateLocalEssay = (
    s1Sel: string,
    s2Sel: string,
    s3Sel: string,
    s4Sel: string
  ) => {
    // Determine branch
    let branch: "A" | "B" | "C" = "A";
    if (s1Sel.includes("落叶") || s1Sel.includes("🍂")) branch = "B";
    else if (s1Sel.includes("气球") || s1Sel.includes("🎈")) branch = "C";

    // Determine Step 2 key
    let s2Key: "A" | "B" | "C" = "A";
    if (branch === "A") {
      if (s2Sel.includes("守护") || s2Sel.includes("🐟")) s2Key = "B";
      else if (s2Sel.includes("鱼卵") || s2Sel.includes("🧚")) s2Key = "C";
    } else if (branch === "B") {
      if (s2Sel.includes("摇摆") || s2Sel.includes("🍃")) s2Key = "B";
      else if (s2Sel.includes("颤动") || s2Sel.includes("🦋")) s2Key = "C";
    } else if (branch === "C") {
      if (s2Sel.includes("纸片") || s2Sel.includes("✨")) s2Key = "B";
      else if (s2Sel.includes("墙上") || s2Sel.includes("🧲")) s2Key = "C";
    }

    // Determine Step 3 key
    let s3Key: "A" | "B" | "C" = "A";
    if (s3Sel.includes("动手") || s3Sel.includes("🧪")) s3Key = "B";
    else if (s3Sel.includes("翻书") || s3Sel.includes("📚")) s3Key = "C";

    // Determine Step 4 key
    let s4Key: "A" | "B" | "C" = "A";
    if (s4Sel.includes("神奇") || s4Sel.includes("🌍")) s4Key = "B";
    else if (s4Sel.includes("快乐") || s4Sel.includes("🎉")) s4Key = "C";

    // Title selector
    let title = "《一次新发现》";
    if (branch === "A") {
      title = s2Key === "A" ? "《泡泡筑巢的发现》" : s2Key === "B" ? "《伟大的斗鱼爸爸》" : "《鱼缸里的生命奇迹》";
    } else if (branch === "B") {
      title = s2Key === "A" ? "《会飞落叶的发现》" : s2Key === "B" ? "《森林里的伪装大师》" : "《树叶呼吸的秘密》";
    } else if (branch === "C") {
      title = s2Key === "A" ? "《气球吸头发的奥秘》" : s2Key === "B" ? "《纸屑跳舞的魔法》" : "《长了吸盘的气球》";
    }

    // Paragraphs optimized for Elementary Level (exactly ~120-150 words total)
    let p1 = "";
    let p2 = "";
    let p3 = "";
    let p4 = "";

    // Paragraph 1 (起因)
    if (branch === "A") {
      p1 = "星期天，我去阿姨家做客，惊奇地发现鱼缸里有一条五彩斑斓的斗鱼。它浮在水面上，嘴里咕嘟咕嘟地吐着泡泡，真是太新奇了！";
    } else if (branch === "B") {
      p1 = "星期六下午，我在公园里散步，突然发现地上的一片枯树叶竟然在慢慢向前移动，把我吓了一跳！";
    } else {
      p1 = "星期天在客厅玩红气球，我把气球在衣服上摩擦几下，拿到头顶，头发竟然全都竖着吸了上去！";
    }

    // Paragraph 2 (观察)
    if (branch === "A") {
      if (s2Key === "A") {
        p2 = "它用无数白色小气泡筑成了一个白云般的“泡沫巢”，里面还藏着亮晶晶的鱼卵呢。";
      } else if (s2Key === "B") {
        p2 = "斗鱼爸爸一直在泡沫底下游来游去，温柔地保护着鱼卵，不让任何小鱼靠近，真负责！";
      } else {
        p2 = "几天后，鱼卵孵化出了一只只像小逗号一样的鱼苗。它们在水里快乐地游动，真是生命的奇迹！";
      }
    } else if (branch === "B") {
      if (s2Key === "A") {
        p2 = "我凑近一瞧，原来这是一只枯叶蝶。它的翅膀和地上的落叶一模一样，连脉络都非常逼真，太会伪装了！";
      } else if (s2Key === "B") {
        p2 = "我凑近一瞧，发现微风吹过时，它还会跟着旁边的枯叶一起轻轻摇摆，好像在和秋风跳舞，真好玩！";
      } else {
        p2 = "我凑近一瞧，静止的枯叶蝶翅膀还在不易察觉地微微颤动，它是在悄悄呼吸呢，生命的奥秘真奇特！";
      }
    } else if (branch === "C") {
      if (s2Key === "A") {
        p2 = "头发被无形的小手拉扯着，跟着气球的方向飘动，就像在变魔法一样，有趣极了！";
      } else if (s2Key === "B") {
        p2 = "我把气球靠近碎纸片，小纸片也纷纷像轻盈的雪花一样粘在上面，跳起了欢快的舞蹈！";
      } else {
        p2 = "我把摩擦后的气球按在干燥的白墙上，它居然像磁铁一样稳稳地贴住不掉下来，真神奇！";
      }
    }

    // Paragraph 3 (探求)
    if (s3Key === "A") {
      p3 = "我向大人们请教，原来这是因为奇特的生物和物理学现象。";
    } else if (s3Key === "B") {
      p3 = "我动手做了趣味小实验，用实践探索，证实了其中的科学规律。";
    } else {
      p3 = "我翻开了厚厚的科普童话书，查阅资料弄懂了背后的神奇原因。";
    }

    // Paragraph 4 (道理)
    if (s4Key === "A") {
      p4 = "这次大发现让我懂得：只要留心观察，身边处处都是神奇的小秘密！";
    } else if (s4Key === "B") {
      p4 = "大自然真是一位神奇的魔术师，未来我要继续保持好奇心去探索奥秘！";
    } else {
      p4 = "亲自动手发现真理的感觉太棒了，学到科学新知识让我感到无比快乐！";
    }

    // Word Count Approximation
    const fullText = `${p1}\n${p2}\n${p3}\n${p4}`;
    const wordCount = fullText.replace(/\s+/g, "").length;

    // Feedback Selector
    let praise = `⭐ 小学生特级五星作文奖 ⭐

亲爱的小朋友，你真是一个出色的作文小糕点师！
这篇小观察日记写得生动有趣、结构合理！从起因到细节描写，字数正好约 ${wordCount} 字，符合小学低中年级满分小作文标准！
你挑选的配方让大自然/科学原理活灵活现地跃然纸上，继续加油哦！🍰`;

    return {
      title,
      content: fullText,
      praise,
      wordCount
    };
  };

  // Live draft builder to show real-time 120-word grid essay frame-by-frame
  const getLiveDraftText = () => {
    let text = "";
    if (!step1Selection) return "";

    let branch: "A" | "B" | "C" = "A";
    if (step1Selection.includes("落叶") || step1Selection.includes("🍂")) branch = "B";
    else if (step1Selection.includes("气球") || step1Selection.includes("🎈")) branch = "C";

    // P1 (起因)
    if (branch === "A") {
      text += "星期天，我去阿姨家做客，惊奇地发现鱼缸里有一条五彩斑斓的斗鱼。它浮在水面上，嘴里咕嘟咕嘟地吐着泡泡，真是太新奇了！";
    } else if (branch === "B") {
      text += "星期六下午，我在公园里散步，突然发现地上的一片枯树叶竟然在慢慢向前移动，把我吓了一跳！";
    } else {
      text += "星期天在客厅玩红气球，我把气球在衣服上摩擦几下，拿到头顶，头发竟然全都竖着吸了上去！";
    }

    if (!step2Selection) return text;

    // P2 (观察)
    if (branch === "A") {
      if (step2Selection.includes("泡沫") || step2Selection.includes("☁️")) {
        text += "它用无数白色小气泡筑成了一个白云般的“泡沫巢”，里面还藏着亮晶晶的鱼卵呢。";
      } else if (step2Selection.includes("守护") || step2Selection.includes("🐟")) {
        text += "斗鱼爸爸一直在泡沫底下游来游去，温柔地保护着鱼卵，不让任何小鱼靠近，真负责！";
      } else {
        text += "几天后，鱼卵孵化出了一只只像小逗号一样的鱼苗。它们在水里快乐地游动，真是生命的奇迹！";
      }
    } else if (branch === "B") {
      if (step2Selection.includes("一模一样") || step2Selection.includes("🍁")) {
        text += "我凑近一瞧，原来这是一只枯叶蝶。它的翅膀和地上的落叶一模一样，连脉络都非常逼真，太会伪装了！";
      } else if (step2Selection.includes("摇摆") || step2Selection.includes("🍃")) {
        text += "我凑近一瞧，发现微风吹过时，它还会跟着旁边的枯叶一起轻轻摇摆，好像在和秋风跳舞，真好玩！";
      } else {
        text += "我凑近一瞧，静止的枯叶蝶翅膀还在不易察觉地微微颤动，它是在悄悄呼吸呢，生命的奥秘真奇特！";
      }
    } else if (branch === "C") {
      if (step2Selection.includes("吸附") || step2Selection.includes("⚡")) {
        text += "头发被无形的小手拉扯着，跟着气球的方向飘动，就像在变魔法一样，有趣极了！";
      } else if (step2Selection.includes("雪花") || step2Selection.includes("✨")) {
        text += "我把气球靠近碎纸片，小纸片也纷纷像轻盈的雪花一样粘在上面，跳起了欢快的舞蹈！";
      } else {
        text += "我把摩擦后的气球按在干燥的白墙上，它居然像磁铁一样稳稳地贴住不掉下来，真神奇！";
      }
    }

    if (!step3Selection) return text;

    // P3 (过程)
    if (step3Selection.includes("请教") || step3Selection.includes("🙋‍♂️")) {
      text += "我向大人们请教，原来这是因为奇特的生物和物理学现象。";
    } else if (step3Selection.includes("实验") || step3Selection.includes("🧪")) {
      text += "我动手做了趣味小实验，用实践探索，证实了其中的科学规律。";
    } else {
      text += "我翻开了厚厚的科普童话书，查阅资料弄懂了背后的神奇原因。";
    }

    if (!step4Selection) return text;

    // P4 (感悟)
    if (step4Selection.includes("留心") || step4Selection.includes("💡")) {
      text += "这次大发现让我懂得：只要留心观察，身边处处都是神奇的小秘密！";
    } else if (step4Selection.includes("大自然") || step4Selection.includes("🌍")) {
      text += "大自然真是一位神奇的魔术师，未来我要继续保持好奇心去探索奥秘！";
    } else {
      text += "亲自动手发现真理的感觉太棒了，学到科学新知识让我感到无比快乐！";
    }

    return text;
  };

  // Main API Call to Bake the Composition using Gemini on the server-side
  const bakeTheComposition = async () => {
    setCurrentStep(5);
    setIsBaking(true);
    setErrorMessage("");
    setBakeResult(null);

    // Simulate delightful baking sound & delay so kids feel the "Oven is Baking"
    setTimeout(() => {
      try {
        const result = generateLocalEssay(
          step1Selection,
          step2Selection,
          step3Selection,
          step4Selection
        );
        setBakeResult(result);

        // Build 3 rounds for word reorder game
        const rounds = build3Rounds(result.content);
        setGameRounds(rounds);

        // Reset modes & 45s timer
        setResultSubMode("read");
        setReadingTimeRemaining(45);
        setIsReadingTimerActive(true);
        setCurrentRoundIndex(0);
        setPlacedChunkIds([]);
        setRoundStatus("playing");
        setShowHint(false);
      } catch (err: any) {
        console.error(err);
        setErrorMessage("哎呀，作文烤箱温度不对，请小糕点师重试一下！🍰");
      } finally {
        setIsBaking(false);
      }
    }, 1200);
  };

  // Get options for current step
  const getCurrentOptions = () => {
    if (currentStep === 1) return step1Options;
    // A robust way: detect choice A, B, C based on content of step1Selection
    const step1Key = step1Selection.includes("斗鱼") ? "A" : step1Selection.includes("落叶") ? "B" : "C";
    if (currentStep === 2) return getStep2Options(step1Key);
    if (currentStep === 3) return step3Options;
    if (currentStep === 4) return step4Options;
    return [];
  };

  // Determine if the current step has a valid selection
  const isCurrentStepSelected = () => {
    if (currentStep === 1) return !!step1Selection;
    if (currentStep === 2) return !!step2Selection;
    if (currentStep === 3) return !!step3Selection;
    if (currentStep === 4) return !!step4Selection;
    return false;
  };

  // Get active selected text for current step
  const getCurrentSelectedValue = () => {
    if (currentStep === 1) return step1Selection;
    if (currentStep === 2) return step2Selection;
    if (currentStep === 3) return step3Selection;
    if (currentStep === 4) return step4Selection;
    return "";
  };

  return (
    <div className="min-h-screen bg-[#FFF9F2] font-sans text-[#4A3428] flex flex-col overflow-x-hidden selection:bg-rose-200 selection:text-rose-800 relative">
      
      {/* Top playful Header (Immersive UI Style) */}
      <nav className="relative z-10 h-20 bg-[#FFD7BA] border-b-4 border-[#F4A261] flex items-center justify-between px-4 sm:px-8 shadow-sm shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-[#E76F51] rounded-full flex items-center justify-center text-white text-2xl shadow-inner border border-[#f4a261]/20 select-none">
            🍰
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#264653] underline decoration-wavy decoration-[#E9C46A] decoration-2">
              《一次新发现》
            </h1>
            <p className="text-[10px] sm:text-xs text-[#E76F51] font-semibold">✨ 像做甜点一样快乐拼搭写作文 🍰</p>
          </div>
        </div>
        
        {/* Playful stats or actions */}
        <div className="flex gap-4 items-center">
          <div className="hidden md:flex bg-white/60 px-4 py-2 rounded-full border border-[#F4A261] gap-4 text-xs sm:text-sm font-bold text-[#264653]">
            <span>🍓 创意草莓: {currentStep > 0 ? `${currentStep * 5}/20` : "0/20"}</span>
            <span>🍯 灵感糖浆: {currentStep === 5 ? "100%" : `${currentStep * 20 + 20}%`}</span>
          </div>
          <button 
            onClick={startBakingGame} 
            title="重置厨房"
            className="w-10 h-10 bg-[#2A9D8F] hover:bg-[#217d72] rounded-lg border-2 border-[#264653] flex items-center justify-center text-white text-xl cursor-pointer shadow transition-all active:scale-95"
          >
            ⚙️
          </button>
        </div>
      </nav>

      {/* Main interactive area */}
      <main className="relative z-10 w-full max-w-7xl mx-auto px-4 py-6 sm:py-8 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-stretch">
        
        {/* Left Side: The Chef & Dialogue Area (Takes 5 columns) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          {/* Dialogue Box */}
          <div className="relative bg-white border-4 border-[#E9C46A] rounded-[40px] p-6 sm:p-8 shadow-xl flex flex-col items-center justify-center text-center">
            <div className="absolute -top-6 -left-2 text-6xl select-none animate-bounce">👨‍🍳</div>
            {currentStep === 0 ? (
              <>
                <h2 className="text-xl font-bold mb-4 text-[#E76F51]">欢迎来到作文烘焙坊！</h2>
                <p className="text-base leading-relaxed font-semibold mb-2 text-[#4A3428]">
                  哈喽！小小糕点师！✨<br />
                  今天我们要制作一个名为<br />
                  <span className="bg-[#FFE66D] px-2 py-0.5 rounded-md font-bold">《一次新发现》</span>的超赞蛋糕！🍰<br /><br />
                  你准备好施展你的创意，一步步做出超级好玩的文章了吗？
                </p>
              </>
            ) : currentStep === 5 ? (
              <>
                <h2 className="text-xl font-bold mb-4 text-[#2A9D8F]">🍰 蛋糕成功出炉！</h2>
                <p className="text-sm font-semibold leading-relaxed mb-4 text-[#4A3428]">
                  哇！香气扑鼻！你的作文大蛋糕烤好啦！<br />
                  快尝尝它的神奇味道，并把它抄写保存下来吧！
                </p>
              </>
            ) : (
              <>
                <h2 className="text-lg sm:text-xl font-bold mb-3 text-[#E76F51]">
                  第{currentStep}步：{steps[currentStep - 1].title}
                </h2>
                <p className="text-sm font-semibold leading-relaxed text-amber-950 mb-4">
                  {steps[currentStep - 1].question}
                </p>
                <div className="w-full h-2.5 bg-[#F1F1F1] rounded-full overflow-hidden border border-amber-100">
                  <div 
                    className="h-full bg-[#E76F51] transition-all duration-500" 
                    style={{ width: `${currentStep * 25}%` }}
                  ></div>
                </div>
                <p className="text-[10px] mt-1.5 text-[#E76F51] font-bold uppercase tracking-widest">烹饪进度：{currentStep * 25}%</p>
              </>
            )}
          </div>

          {/* Cake Preview Slot */}
          <div className="bg-[#FFE8D6] rounded-[30px] border-4 border-dashed border-[#B5838D] p-5 flex flex-col items-center justify-center relative min-h-[250px] flex-1 shadow-inner">
            {showParticle && (
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-30">
                <span className="text-3xl animate-bounce">✨</span>
                <span className="text-3xl animate-ping absolute">🍓</span>
                <span className="text-2xl animate-bounce absolute left-12 top-10">🍬</span>
                <span className="text-2xl animate-bounce absolute right-12 bottom-10">⭐</span>
              </div>
            )}

            <AnimatePresence mode="popLayout">
              {currentStep === 0 ? (
                <motion.div 
                  key="empty-cake"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="text-center"
                >
                  <div className="text-5xl mb-2 opacity-30 select-none">🧁</div>
                  <p className="text-xs font-bold text-[#B5838D] tracking-wide">正在等待加入“蛋糕胚”...</p>
                </motion.div>
              ) : (
                <div className="flex flex-col-reverse items-center justify-center w-full max-w-[240px] relative pt-8 pb-4">
                  {/* Foundation Plate */}
                  <div className="w-full h-3.5 bg-gradient-to-r from-amber-200 to-amber-300 rounded-full border-b-4 border-amber-400 shadow-sm relative z-0">
                    <div className="absolute inset-0 flex justify-around items-center opacity-35">
                      <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                      <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                      <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                    </div>
                  </div>

                  {/* Layer 1: Cake Sponge (Step 1) */}
                  {step1Selection && (
                    <motion.div 
                      initial={{ y: -60, opacity: 0, scale: 0.95 }}
                      animate={{ y: 0, opacity: 1, scale: 1 }}
                      className="w-[200px] h-12 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 rounded-t-lg border-t-2 border-amber-200 relative z-10 -mb-1 shadow-md flex items-center justify-center animate-pulse"
                    >
                      <div className="text-center px-3">
                        <p className="text-[11px] font-bold text-amber-950 truncate max-w-[180px]">
                          {step1Selection.includes("斗鱼") ? "🐠 斗鱼水族胚" : step1Selection.includes("枯叶") ? "🍂 奇妙枯叶胚" : "🎈 魔力静电胚"}
                        </p>
                        <p className="text-[8px] text-amber-800 font-extrabold">一楼：发现契机</p>
                      </div>
                    </motion.div>
                  )}

                  {/* Layer 2: Jam Filling (Step 2) */}
                  {step2Selection && (
                    <motion.div 
                      initial={{ y: -60, opacity: 0, scale: 0.95 }}
                      animate={{ y: 0, opacity: 1, scale: 1 }}
                      className="w-[170px] h-9 bg-gradient-to-r from-rose-500 via-pink-400 to-rose-500 rounded-t-md border-b-2 border-rose-600 relative z-20 -mb-1 shadow-sm flex items-center justify-center"
                    >
                      <div className="text-center px-3 z-10">
                        <p className="text-[11px] font-bold text-white truncate max-w-[150px]">
                          🍓 仔细观察夹心
                        </p>
                        <p className="text-[8px] text-rose-100 font-extrabold">二楼：观察细节</p>
                      </div>
                    </motion.div>
                  )}

                  {/* Layer 3: Buttercream Frosting (Step 3) */}
                  {step3Selection && (
                    <motion.div 
                      initial={{ y: -60, opacity: 0, scale: 0.95 }}
                      animate={{ y: 0, opacity: 1, scale: 1 }}
                      className="w-[140px] h-11 bg-gradient-to-r from-orange-50 via-white to-orange-50 rounded-t-md border-t-2 border-amber-100 relative z-30 -mb-1 shadow-md flex items-center justify-center"
                    >
                      <div className="text-center px-2 z-10">
                        <p className="text-[11px] font-bold text-amber-950 truncate max-w-[120px]">
                          🥛 探秘奶油霜
                        </p>
                        <p className="text-[8px] text-amber-700 font-extrabold">三楼：探求真相</p>
                      </div>
                    </motion.div>
                  )}

                  {/* Layer 4: Sprinkles & Decoration (Step 4) */}
                  {step4Selection && (
                    <motion.div 
                      initial={{ y: -60, opacity: 0, scale: 0.95 }}
                      animate={{ y: 0, opacity: 1, scale: 1 }}
                      className="w-[110px] h-10 bg-gradient-to-r from-amber-100 via-amber-200 to-amber-100 rounded-t-2xl border-b-2 border-amber-300 relative z-40 -mb-1 shadow-sm flex flex-col items-center justify-center"
                    >
                      <div className="absolute -top-1.5 flex gap-0.5 z-50">
                        <span className="animate-bounce text-[10px]">⭐</span>
                        <span className="animate-bounce text-[10px]">🍓</span>
                      </div>
                      <div className="text-center px-1 z-10 mt-1">
                        <p className="text-[10px] font-bold text-amber-950 truncate max-w-[90px]">
                          ✨ 智慧糖霜
                        </p>
                        <p className="text-[8px] text-amber-800 font-extrabold">顶楼：获得道理</p>
                      </div>
                    </motion.div>
                  )}
                </div>
              )}
            </AnimatePresence>
          </div>

          {/* Real-time Progressive 120-word Draft Notebook Grid (School style) */}
          {currentStep > 0 && currentStep <= 4 && (
            <div className="w-full bg-white border-4 border-[#2A9D8F]/60 rounded-3xl p-4 shadow-md flex flex-col gap-2">
              <div className="flex justify-between items-center bg-[#F0FAF9] px-3 py-1 rounded-full border border-[#2A9D8F]/20">
                <span className="text-xs font-black text-[#2A9D8F] flex items-center gap-1">
                  📝 小学生120字草稿本 (方格本)
                </span>
                <span className="text-[11px] font-bold text-amber-800">
                  {getLiveDraftText().length} 字 / 120字极简标准
                </span>
              </div>
              
              {getLiveDraftText() ? (
                <div className="bg-[#FFFDF9] border border-green-200 p-2 rounded-xl max-h-[140px] overflow-y-auto custom-scrollbar shadow-inner">
                  <div className="flex flex-wrap gap-1 justify-start">
                    {getLiveDraftText().split("").map((char, index) => {
                      const isPunctuation = /[，。？！“”‘’（）：]/.test(char);
                      return (
                        <div 
                          key={index} 
                          className={`w-5.5 h-5.5 text-[10px] font-black flex items-center justify-center border rounded shadow-xs select-none transition-all duration-150 hover:scale-105 ${
                            isPunctuation 
                              ? "border-amber-200 text-amber-600 bg-amber-50"
                              : "border-green-200 text-emerald-800 bg-green-50/40"
                          }`}
                        >
                          {char}
                        </div>
                      );
                    })}
                  </div>
                  {getLiveDraftText().length >= 120 && (
                    <div className="mt-2 text-center text-[10px] text-emerald-600 font-extrabold bg-emerald-50 rounded-lg py-1 border border-emerald-200">
                      🎉 已达成小学低段120字优秀标准！
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-4 text-center border-2 border-dashed border-gray-200 rounded-xl text-[11px] font-bold text-gray-400">
                  ✍️ 请挑选第一个“蛋糕胚”开始拼搭
                </div>
              )}
            </div>
          )}

        </div>

        {/* Right Side: Selection Area or Results Sheet (Takes 8 columns) */}
        <div className="lg:col-span-8 flex flex-col justify-between">
          <AnimatePresence mode="wait">
            
            {currentStep === 0 ? (
              // Welcome Screen Panel
              <motion.div
                key="welcome-panel"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="bg-white border-4 border-[#F4A261] rounded-[32px] p-6 sm:p-8 flex-1 flex flex-col justify-between shadow-xl"
              >
                <div className="space-y-6">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="flex items-center gap-1.5 bg-rose-50 border border-rose-200 px-3 py-1 rounded-full w-fit">
                      <span className="text-xs">🏫</span>
                      <span className="text-[11px] sm:text-xs font-black text-rose-600">小学低段专享烘焙</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-[#F0FAF9] border border-[#2A9D8F]/30 px-3 py-1 rounded-full w-fit">
                      <span className="text-xs">📐</span>
                      <span className="text-[11px] sm:text-xs font-black text-[#2A9D8F]">精准 120 字极简满分作文</span>
                    </div>
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-black text-[#264653] leading-tight">
                    小学生《一次新发现》趣味烘焙坊 🎂
                  </h2>

                  <p className="text-sm sm:text-base text-amber-900 leading-relaxed font-semibold">
                    哈喽，小小糕点师！在这里，写作文就像拼搭美味的小蛋糕一样简单好玩！<br />
                    每一层食材都是一段精彩的文字，拼完就能瞬间端出精准符合小学标准的 <span className="text-[#E76F51] underline font-extrabold">120字满分观察日记</span>！<br /><br />
                    跟着我的引导，开启你的烘焙创意吧：
                  </p>

                  <div className="p-4 bg-[#FFF9F2] rounded-2xl border-2 border-dashed border-[#F4A261]/60 grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="bg-white p-3 rounded-xl border border-amber-200 shadow-xs text-center">
                      <span className="text-3xl block mb-1">🐠</span>
                      <h4 className="text-xs font-black text-[#264653] mb-0.5">斗鱼吐泡泡</h4>
                      <p className="text-[10px] text-amber-800 font-bold">趣味生物观察</p>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-amber-200 shadow-xs text-center">
                      <span className="text-3xl block mb-1">🍂</span>
                      <h4 className="text-xs font-black text-[#264653] mb-0.5">会动的落叶</h4>
                      <p className="text-[10px] text-amber-800 font-bold">神奇昆虫拟态</p>
                    </div>
                    <div className="bg-white p-3 rounded-xl border border-amber-200 shadow-xs text-center">
                      <span className="text-3xl block mb-1">🎈</span>
                      <h4 className="text-xs font-black text-[#264653] mb-0.5">气球吸头发</h4>
                      <p className="text-[10px] text-amber-800 font-bold">魔力摩擦起电</p>
                    </div>
                  </div>
                </div>

                <button
                  id="start-baking-btn"
                  onClick={startBakingGame}
                  className="w-full mt-6 py-4 bg-gradient-to-r from-[#E76F51] to-[#F4A261] hover:opacity-95 text-white font-extrabold text-lg rounded-2xl shadow-lg border-b-4 border-[#C85A3F] active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>开始拼搭美味作文！🍰</span>
                  <ChevronRight className="w-5 h-5" />
                </button>
              </motion.div>
            ) : currentStep >= 1 && currentStep <= 4 ? (
              // Choosing Step Options (Interactive Grid Layout)
              <motion.div
                key={`step-selection-${currentStep}`}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="flex-1 flex flex-col justify-between"
              >
                {/* 3 Option cards */}
                <div className="grid grid-cols-1 gap-4">
                  {getCurrentOptions().map((opt) => {
                    const isSelected = getCurrentSelectedValue() === opt.text;
                    let borderClass = "border-[#E76F51]";
                    let hoverClass = "hover:bg-[#FFF4E0]/40";
                    let circleBg = "bg-[#FFF4E0] text-[#E76F51]";
                    let badgeClass = "border-[#E76F51] text-[#E76F51]";

                    if (opt.key === "B") {
                      borderClass = "border-[#2A9D8F]";
                      hoverClass = "hover:bg-[#F0FAF9]/40";
                      circleBg = "bg-[#F0FAF9] text-[#2A9D8F]";
                      badgeClass = "border-[#2A9D8F] text-[#2A9D8F]";
                    } else if (opt.key === "C") {
                      borderClass = "border-[#E9C46A]";
                      hoverClass = "hover:bg-[#FEFAE0]/40";
                      circleBg = "bg-[#FEFAE0] text-[#D9A51B]";
                      badgeClass = "border-[#E9C46A] text-[#9A7312]";
                    }

                    return (
                      <div
                        key={opt.key}
                        onClick={() => handleSelect(opt.key, opt)}
                        className={`bg-white border-4 ${borderClass} ${hoverClass} ${
                          isSelected ? "ring-4 ring-offset-2 ring-amber-300 scale-[1.01]" : ""
                        } rounded-3xl p-5 sm:p-6 cursor-pointer flex flex-col sm:flex-row items-center text-center sm:text-left gap-4 sm:gap-6 shadow-md transition-all duration-300 relative`}
                      >
                        {/* BIG Emoji Circle */}
                        <div className={`w-18 h-18 sm:w-20 sm:h-20 ${circleBg} rounded-2xl flex items-center justify-center text-4xl sm:text-5xl shadow-inner shrink-0 select-none`}>
                          {opt.emoji}
                        </div>
                        
                        <div className="flex-1 min-w-0 sm:pr-12">
                          <h3 className="text-lg sm:text-2xl font-black text-[#4A3428] flex items-center justify-center sm:justify-start gap-2">
                            <span className="text-xl sm:text-3xl text-amber-500 font-extrabold">{opt.key}.</span>
                            <span>{opt.text}</span>
                          </h3>
                        </div>

                        {/* Status tag */}
                        <div className={`absolute top-3 right-3 text-[10px] font-bold bg-white px-2.5 py-0.5 rounded-full border ${badgeClass}`}>
                          {opt.key === "A" ? "水族观察" : opt.key === "B" ? "森林昆虫" : "科学物理"}
                        </div>

                        {/* Tick bubble */}
                        {isSelected && (
                          <div className={`absolute -right-2 -top-2 w-7 h-7 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-md ${
                            opt.key === "A" ? "bg-[#E76F51]" : opt.key === "B" ? "bg-[#2A9D8F]" : "bg-[#E9C46A]"
                          }`}>
                            ✓
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Feedback area */}
                <div className="mt-4 flex-1 flex flex-col justify-end min-h-[120px]">
                  <AnimatePresence mode="wait">
                    {tempFeedback ? (
                      <motion.div
                        key="feedback"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="bg-[#FFF4E0] border-2 border-dashed border-[#F4A261] rounded-2xl p-4 flex gap-3 items-start"
                      >
                        <span className="text-2xl animate-bounce">🍓</span>
                        <div className="space-y-0.5">
                          <p className="text-xs font-bold text-[#E76F51]">主厨赞许：</p>
                          <p className="text-xs sm:text-sm font-bold text-amber-950 leading-relaxed">
                            {tempFeedback}
                          </p>
                        </div>
                      </motion.div>
                    ) : (
                      <div className="h-[74px]"></div>
                    )}
                  </AnimatePresence>

                  {/* Navigation Button Footer */}
                  <div className="flex items-center justify-between pt-6 border-t border-amber-200/50 mt-4">
                    <button
                      onClick={handlePrevStep}
                      disabled={currentStep === 1}
                      className={`py-3 px-6 rounded-xl border-2 text-xs font-bold tracking-wide transition-all ${
                        currentStep === 1
                          ? "border-amber-100 text-amber-200 pointer-events-none"
                          : "border-[#F4A261] bg-white text-[#E76F51] hover:bg-[#FFF4E0]/20 cursor-pointer"
                      }`}
                    >
                      上一步
                    </button>

                    <div className="text-xs font-bold text-amber-700/80">
                      层层拼搭：第 {currentStep} 层 / 共 4 层
                    </div>

                    <button
                      onClick={handleNextStep}
                      disabled={!isCurrentStepSelected()}
                      className={`py-3.5 px-6 rounded-xl text-xs font-bold tracking-wide transition-all shadow-md active:scale-95 flex items-center gap-1.5 cursor-pointer ${
                        isCurrentStepSelected()
                          ? "bg-gradient-to-r from-[#2A9D8F] to-[#264653] text-white border-b-4 border-[#1b645b]"
                          : "bg-gray-100 text-gray-400 border border-gray-200 pointer-events-none"
                      }`}
                    >
                      <span>{currentStep === 4 ? "送进智能烤箱 (生成大作)" : "锁定调料，迈向下一步"}</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ) : (
              // Results sheet (Step 5)
              <motion.div
                key="result"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="bg-white border-4 border-[#E9C46A] rounded-[32px] p-6 shadow-xl flex-1 flex flex-col justify-between"
              >
                {isBaking ? (
                  <div className="py-16 flex flex-col items-center justify-center space-y-6 flex-1">
                    <div className="relative">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
                        className="w-24 h-24 border-8 border-[#FFE66D]/30 border-t-[#E76F51] border-r-[#2A9D8F] rounded-full flex items-center justify-center shadow-inner"
                      />
                      <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-5xl block animate-bounce">🧑‍🍳</span>
                    </div>
                    <div className="text-center space-y-2">
                      <h3 className="text-xl font-bold text-[#E76F51] animate-pulse">智能作文大烤箱运行中...</h3>
                      <p className="text-xs text-amber-800 font-bold max-w-sm leading-relaxed">
                        正在施展修辞魔法！润色过渡语、融合生动的科学描写、保证烘烤出不小于120字的美味佳作... ✨
                      </p>
                    </div>
                  </div>
                ) : errorMessage ? (
                  <div className="py-12 text-center space-y-6 flex-1 flex flex-col items-center justify-center">
                    <span className="text-5xl block">⚠️</span>
                    <div className="space-y-2">
                      <h3 className="text-lg font-bold text-rose-600">哎呀，烤箱电源松开啦！</h3>
                      <p className="text-xs text-rose-500 max-w-md font-bold">{errorMessage}</p>
                    </div>
                    <div className="flex gap-4">
                      <button
                        onClick={handlePrevStep}
                        className="py-2.5 px-5 bg-orange-50 text-[#E76F51] border border-[#E76F51] hover:bg-orange-100 font-bold text-xs rounded-xl cursor-pointer"
                      >
                        返回修改配方
                      </button>
                      <button
                        onClick={bakeTheComposition}
                        className="py-2.5 px-5 bg-[#2A9D8F] text-white hover:opacity-95 font-bold text-xs rounded-xl shadow-md cursor-pointer flex items-center gap-1.5"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        重新烘烤
                      </button>
                    </div>
                  </div>
                ) : resultSubMode === "read" ? (
                  /* SUB-MODE 1: Immersive Tabular Manuscript Paper View with 45s Countdown Timer */
                  <div className="space-y-4 flex-1 flex flex-col justify-between">
                    {/* 45s Timer Bar */}
                    <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-3 flex flex-wrap items-center justify-between gap-3 shadow-xs">
                      <div className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-amber-600 animate-spin" />
                        <div>
                          <div className="text-xs font-black text-amber-900 flex items-center gap-1.5">
                            <span>⏱️ 45秒沉浸阅读倒计时:</span>
                            <span className="bg-amber-500 text-white text-xs font-black px-2 py-0.5 rounded-full animate-pulse">
                              {readingTimeRemaining} 秒
                            </span>
                          </div>
                          <p className="text-[10px] text-amber-700 font-bold">
                            阅读完后文字将魔法分裂打散，进入3轮解密拼字大闯关！
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={startWordGame}
                        className="py-2 px-3.5 bg-gradient-to-r from-[#2A9D8F] to-[#264653] hover:opacity-95 text-white font-extrabold text-xs rounded-xl shadow-xs active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <SkipForward className="w-3.5 h-3.5" />
                        <span>跳过倒计时，直接闯关</span>
                      </button>
                    </div>

                    {/* Immersive Tabular Manuscript Paper (中国小学作文方格纸, 1 char = 1 box) */}
                    <div className="bg-[#FFFDF7] border-4 border-[#2A9D8F]/50 rounded-2xl p-4 sm:p-5 relative shadow-inner overflow-y-auto max-h-[340px] flex-1">
                      {/* Tabular Grid Paragraphs */}
                      <div className="space-y-3">
                        {bakeResult?.content.split("\n").filter(Boolean).map((para, pIdx) => (
                          <div key={pIdx} className="flex flex-wrap gap-1 items-center">
                            {/* Paragraph Indent - 2 empty grid slots */}
                            <div className="w-6 h-6 sm:w-7 sm:h-7 border border-dashed border-emerald-300/60 bg-emerald-50/60 rounded flex items-center justify-center text-[9px] text-emerald-400 font-bold select-none">
                              首
                            </div>
                            <div className="w-6 h-6 sm:w-7 sm:h-7 border border-dashed border-emerald-300/60 bg-emerald-50/60 rounded flex items-center justify-center text-[9px] text-emerald-400 font-bold select-none">
                              行
                            </div>

                            {/* Characters */}
                            {para.split("").map((char, cIdx) => {
                              const isPunctuation = /[，。？！“”‘’（）：；]/.test(char);
                              return (
                                <div
                                  key={cIdx}
                                  className={`w-6 h-6 sm:w-7 sm:h-7 font-black text-xs sm:text-sm rounded flex items-center justify-center shadow-2xs select-none transition-transform hover:scale-110 ${
                                    isPunctuation
                                      ? "border border-amber-300 bg-amber-50 text-amber-800"
                                      : "border border-emerald-300/80 bg-white text-emerald-950"
                                  }`}
                                >
                                  {char}
                                </div>
                              );
                            })}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Toolbar buttons */}
                    <div className="flex flex-wrap gap-3 items-center justify-between pt-3 border-t border-amber-200/40">
                      <div className="flex gap-2">
                        <button
                          onClick={handleCopy}
                          className="py-2 px-3.5 rounded-xl border-2 border-[#F4A261] text-[#E76F51] bg-white hover:bg-[#FFF4E0]/20 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          {copied ? (
                            <>
                              <Check className="w-4 h-4 text-green-500" />
                              <span className="text-green-600">已抄走</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-4 h-4" />
                              <span>抄写带走</span>
                            </>
                          )}
                        </button>

                        <button
                          onClick={handleToggleRead}
                          className="py-2 px-3.5 rounded-xl border-2 border-[#2A9D8F] text-[#2A9D8F] bg-white hover:bg-[#F0FAF9]/20 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          {isReading ? (
                            <>
                              <VolumeX className="w-4 h-4 text-rose-500 animate-pulse" />
                              <span>静音</span>
                            </>
                          ) : (
                            <>
                              <Volume2 className="w-4 h-4" />
                              <span>朗读佳作</span>
                            </>
                          )}
                        </button>
                      </div>

                      <button
                        onClick={startWordGame}
                        className="py-2.5 px-4 bg-[#E76F51] hover:bg-[#d65f42] text-white font-extrabold text-xs rounded-xl shadow-md border-b-2 border-[#b54a32] active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <Puzzle className="w-4 h-4" />
                        <span>开启3轮打散拼字大闯关！</span>
                      </button>
                    </div>
                  </div>
                ) : resultSubMode === "game" ? (
                  /* SUB-MODE 2: 3-Round Interactive Word Break Reordering Game */
                  <div className="bg-[#FFFDF9] border-4 border-[#F4A261] rounded-2xl p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-4">
                    {/* Game Round Header */}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-200/80 pb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-[#E76F51] text-white rounded-xl flex items-center justify-center font-black text-sm shadow-xs">
                          {currentRoundIndex + 1}
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-[#264653]">
                            {gameRounds[currentRoundIndex]?.title}
                          </h4>
                          <p className="text-[10px] text-amber-800 font-bold">
                            将打碎的句子词块按正确逻辑顺序重组入框
                          </p>
                        </div>
                      </div>

                      {/* 3 Stars progress indicator */}
                      <div className="flex items-center gap-1">
                        {[0, 1, 2].map(idx => (
                          <Star
                            key={idx}
                            className={`w-5 h-5 ${
                              idx < currentRoundIndex
                                ? "text-amber-400 fill-amber-400 animate-bounce"
                                : idx === currentRoundIndex
                                ? "text-amber-500 animate-pulse"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Target Drop/Placement Slot Line */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-xs font-black text-[#4A3428]">
                        <span>🎯 拼装槽（点击下方词块按顺序加入）：</span>
                        <button
                          onClick={handleResetRound}
                          className="text-[11px] text-rose-500 hover:text-rose-700 font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <RotateCcw className="w-3 h-3" />
                          清空重新选
                        </button>
                      </div>

                      <div className={`p-3 border-2 border-dashed rounded-xl min-h-[72px] flex flex-wrap gap-2 items-center transition-all ${
                        roundStatus === "success"
                          ? "border-emerald-400 bg-emerald-50/80 ring-2 ring-emerald-300"
                          : roundStatus === "error"
                          ? "border-rose-300 bg-rose-50/60"
                          : "border-amber-300 bg-amber-50/30"
                      }`}>
                        {placedChunkIds.length === 0 ? (
                          <span className="text-xs text-amber-800/60 font-bold italic mx-auto">
                            👇 请依次点击下方碎块，重组出顺畅正确的语句
                          </span>
                        ) : (
                          placedChunkIds.map((id, index) => {
                            const item = gameRounds[currentRoundIndex]?.scrambledChunks.find(x => x.id === id);
                            if (!item) return null;
                            return (
                              <motion.button
                                key={id}
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                onClick={() => handleUnselectChunk(id)}
                                className="py-2 px-3 bg-white border-2 border-[#2A9D8F] text-[#264653] font-black text-xs sm:text-sm rounded-xl shadow-xs hover:bg-rose-50 hover:border-rose-400 hover:text-rose-600 transition-all cursor-pointer flex items-center gap-1"
                              >
                                <span className="text-[10px] text-[#2A9D8F] font-extrabold">{index + 1}.</span>
                                <span>{item.text}</span>
                              </motion.button>
                            );
                          })
                        )}
                      </div>
                    </div>

                    {/* Status & Feedback */}
                    {roundStatus === "success" && (
                      <div className="bg-emerald-100 border border-emerald-300 text-emerald-800 p-2.5 rounded-xl text-center text-xs font-black animate-bounce flex items-center justify-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>🎉 拼接正确！自动核对成功，进入下一关...</span>
                      </div>
                    )}

                    {roundStatus === "error" && (
                      <div className="bg-rose-100 border border-rose-300 text-rose-800 p-2.5 rounded-xl text-center text-xs font-black flex items-center justify-center gap-2">
                        <AlertCircle className="w-4 h-4 text-rose-600" />
                        <span>❌ 顺序不太对哦！点击词块退回，或点击右上角重置。</span>
                      </div>
                    )}

                    {/* Scrambled Word Tiles Pool */}
                    <div className="space-y-2">
                      <div className="text-xs font-black text-[#4A3428]">
                        🧩 待选词语碎块库（打散的片段）：
                      </div>

                      <div className="flex flex-wrap gap-2.5 justify-center p-3 bg-amber-100/40 rounded-xl border border-amber-200">
                        {gameRounds[currentRoundIndex]?.scrambledChunks.map((item) => {
                          const isPlaced = placedChunkIds.includes(item.id);
                          return (
                            <button
                              key={item.id}
                              disabled={isPlaced}
                              onClick={() => handleSelectChunk(item.id)}
                              className={`py-2.5 px-4 font-black text-xs sm:text-sm rounded-xl shadow-md transition-all cursor-pointer ${
                                isPlaced
                                  ? "bg-gray-200 border-2 border-gray-300 text-gray-400 opacity-40 cursor-not-allowed scale-95"
                                  : "bg-white border-2 border-[#F4A261] text-[#E76F51] hover:bg-amber-50 hover:scale-105 active:scale-95"
                              }`}
                            >
                              {item.text}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Hint toggle */}
                    <div className="flex flex-wrap justify-between items-center pt-2 gap-2">
                      <button
                        onClick={() => setShowHint(!showHint)}
                        className="text-xs font-bold text-amber-700 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <HelpCircle className="w-3.5 h-3.5" />
                        <span>{showHint ? "隐藏提示" : "查看参考原句"}</span>
                      </button>

                      {showHint && (
                        <span className="text-[11px] text-emerald-700 font-extrabold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          💡 原句：{gameRounds[currentRoundIndex]?.targetSentence}
                        </span>
                      )}

                      <button
                        onClick={() => setResultSubMode("read")}
                        className="text-xs text-[#2A9D8F] font-bold hover:underline cursor-pointer"
                      >
                        返回稿纸阅读 📖
                      </button>
                    </div>
                  </div>
                ) : (
                  /* SUB-MODE 3: 3-Round Game Completed Celebration */
                  <div className="bg-[#FFFDF7] border-4 border-[#2A9D8F] rounded-2xl p-6 text-center space-y-5 shadow-xl">
                    <div className="w-20 h-20 bg-amber-100 text-amber-600 rounded-3xl flex items-center justify-center text-4xl mx-auto shadow-inner animate-bounce">
                      🏆
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-xl font-black text-[#264653]">
                        🎉 恭喜小糕点师！3轮打散关卡全优通关！
                      </h3>
                      <p className="text-xs text-amber-900 font-bold max-w-md mx-auto leading-relaxed">
                        你不仅拼搭出了《一次新发现》小作文，还在3轮解密关卡中把起因、观察细节与心得总结句全盘搞懂！
                      </p>
                    </div>

                    <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 text-left space-y-2">
                      <h4 className="text-xs font-black text-[#E76F51]">⭐ 3轮大闯关成功复盘：</h4>
                      {gameRounds.map((rd, i) => (
                        <div key={i} className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                          <span>第 {i + 1} 关：{rd.targetSentence}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex flex-wrap gap-3 justify-center pt-2">
                      <button
                        onClick={() => setResultSubMode("read")}
                        className="py-2.5 px-4 bg-white border-2 border-[#2A9D8F] text-[#2A9D8F] font-extrabold text-xs rounded-xl hover:bg-emerald-50 transition-all cursor-pointer"
                      >
                        返回稿纸沉浸阅读 📖
                      </button>
                      <button
                        onClick={startBakingGame}
                        className="py-2.5 px-4 bg-gradient-to-r from-[#E76F51] to-[#F4A261] text-white font-extrabold text-xs rounded-xl shadow-md border-b-2 border-[#C85A3F] active:scale-95 transition-all cursor-pointer flex items-center gap-1"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        再烤一个新蛋糕！🍰
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

          </AnimatePresence>
        </div>

      </main>

      {/* Immersive UI Bottom Status Footer */}
      <footer className="h-12 bg-[#4A3428] flex items-center justify-between px-4 sm:px-10 text-white text-[10px] sm:text-xs font-bold shrink-0 relative z-20 shadow-lg mt-auto">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
          <span>糕点师小助手已就绪</span>
        </div>
        <div className="hidden sm:block">当前配方库：3款精选大自然物理食材 + 智能段落融合</div>
        <div className="flex gap-2 items-center text-[10px]">
          <span className="bg-white/20 px-2 py-0.5 rounded">甜美奶油风格</span>
          <span className="bg-white/20 px-2 py-0.5 rounded">小学/初中科学观察日记系列</span>
        </div>
      </footer>

    </div>
  );
}
