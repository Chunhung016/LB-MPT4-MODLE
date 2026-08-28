import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft,
  Volume2,
  VolumeX,
  Sliders,
  Sparkles,
  RotateCcw,
  CheckCircle2,
  Award,
  BookOpen,
  Check,
  X,
  Pencil,
  FileCheck,
  GripVertical,
  ArrowUp,
  ArrowDown,
  Plus,
  ListOrdered,
  Layers,
  Sparkle,
  HelpCircle,
  Wand2,
  Smartphone,
  Gamepad2,
  AlertTriangle,
  Moon,
  Eye,
  Clock,
  BookX,
  Flame,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { sound } from '../utils/audio';
import { useApp } from '../context/AppContext';

interface Screen3Props {
  onBack?: () => void;
}

export interface BubbleItem {
  id: number;
  text: string;
  targetSequenceIndex: number; // 1 to 4 (Step in 1 -> 2 -> 3 -> 4)
  fullSentence: string;
  sentencePunctuation: string; // "，" or "。"
  fragments: string[]; // Correct ordered fragments
  scrambledFragments: string[]; // Scrambled mini bubbles pool
  positionClass: string;
  floatDelay: number;
  iconName?: string;
}

// 4 bubble items for "沉迷手机游戏的后果":
// 1. 睡眠不足: "首先这会导致我们睡眠不足" (碎片: 首先这会导致 + 我们 + 睡眠不足)
// 2. 影响视力: "并且严重影响视力健康" (碎片: 并且严重 + 影响视力 + 健康)
// 3. 浪费学习时间: "此外也会浪费宝贵的学习时间" (碎片: 此外也会 + 浪费宝贵的 + 学习时间)
// 4. 上课心不在焉: "最终导致我们上课时心不在焉" (碎片: 最终导致 + 我们 + 上课时 + 心不在焉)
export const BUBBLE_ITEMS: BubbleItem[] = [
  {
    id: 1,
    text: '睡眠不足',
    targetSequenceIndex: 1,
    fullSentence: '首先这会导致我们睡眠不足',
    sentencePunctuation: '，',
    fragments: ['首先这会导致', '我们', '睡眠不足'],
    scrambledFragments: ['睡眠不足', '首先这会导致', '我们'],
    positionClass: 'top-3 left-3 sm:top-10 sm:left-10 lg:top-12 lg:left-12',
    floatDelay: 0,
    iconName: 'Moon',
  },
  {
    id: 2,
    text: '影响视力',
    targetSequenceIndex: 2,
    fullSentence: '并且严重影响视力健康',
    sentencePunctuation: '。',
    fragments: ['并且严重', '影响视力', '健康'],
    scrambledFragments: ['影响视力', '并且严重', '健康'],
    positionClass: 'top-3 right-3 sm:top-10 sm:right-10 lg:top-12 lg:right-12',
    floatDelay: 1.2,
    iconName: 'Eye',
  },
  {
    id: 3,
    text: '浪费学习时间',
    targetSequenceIndex: 3,
    fullSentence: '此外也会浪费宝贵的学习时间',
    sentencePunctuation: '，',
    fragments: ['此外也会', '浪费宝贵的', '学习时间'],
    scrambledFragments: ['学习时间', '此外也会', '浪费宝贵的'],
    positionClass: 'bottom-3 left-3 sm:bottom-10 sm:left-10 lg:bottom-12 lg:left-12',
    floatDelay: 0.6,
    iconName: 'Clock',
  },
  {
    id: 4,
    text: '上课心不在焉',
    targetSequenceIndex: 4,
    fullSentence: '最终导致我们上课时心不在焉',
    sentencePunctuation: '。',
    fragments: ['最终导致', '我们', '上课时', '心不在焉'],
    scrambledFragments: ['心不在焉', '最终导致', '我们', '上课时'],
    positionClass: 'bottom-3 right-3 sm:bottom-10 sm:right-10 lg:bottom-12 lg:right-12',
    floatDelay: 1.8,
    iconName: 'BookX',
  },
];

// Available Linkers (关联词 / 连接词)
export const LINKERS: string[] = [
  '首先',
  '并且',
  '此外',
  '最后',
  '最终',
  '严重',
  '接着',
  '另外',
  '同时',
];

// Available Punctuations (标点符号)
export const PUNCTUATIONS: string[] = ['，', '。', '！', '、'];

// Assembled block in the paragraph builder
export interface ParagraphBlock {
  id: string;
  type: 'starter' | 'linker' | 'sentence' | 'punctuation' | 'text';
  text: string;
  sourceItemId?: number; // bubble id 1..4
}

const STARTER_TEXT = '沉迷手机游戏的后果有很多，';

export const Screen3: React.FC<Screen3Props> = ({ onBack }) => {
  const { settings, setIsAdminOpen } = useApp();

  // Array of successfully ordered item IDs in sequence of discovery
  const [completedItemIds, setCompletedItemIds] = useState<number[]>([]);
  // Store the badge number assigned to each item id: { [itemId]: badgeNumber }
  const [assignedBadges, setAssignedBadges] = useState<Record<number, number>>({});
  // Shake animation trigger for wrong clicks
  const [shakingItemId, setShakingItemId] = useState<number | null>(null);
  // Feedback message
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  // Active sentence building workshop modal for a specific bubble
  const [activeBuildingItem, setActiveBuildingItem] = useState<BubbleItem | null>(null);

  // User's assembled fragments in the large target assembly bubble: { [itemId]: string[] }
  const [assembledSentences, setAssembledSentences] = useState<Record<number, string[]>>({});

  // Finished verified sentence IDs: number[]
  const [completedSentenceIds, setCompletedSentenceIds] = useState<number[]>([]);

  // Paragraph Assembly Mode (Side-by-side: Visual & Bubbles on Left, Builder on Right)
  const [isParagraphMode, setIsParagraphMode] = useState<boolean>(false);

  // Assembled blocks in the Right-hand Workbench (excluding the fixed starter)
  const [assembledBlocks, setAssembledBlocks] = useState<ParagraphBlock[]>([]);

  // Feedback specific to paragraph building
  const [paragraphFeedback, setParagraphFeedback] = useState<{
    text: string;
    isError?: boolean;
  } | null>(null);

  // Final Celebration Modal
  const [isFinalCompleted, setIsFinalCompleted] = useState<boolean>(false);

  const nextRequiredSequence = completedItemIds.length + 1;
  const isSequenceDone = completedItemIds.length === 4;
  const isAllSentencesBuilt = completedSentenceIds.length === 4;

  const handleToggleMute = () => {
    const isMuted = sound.toggleMute();
    sound.setMuted(isMuted);
  };

  const handleOpenSettings = () => {
    sound.playPop();
    setIsAdminOpen(true);
  };

  const handleBack = () => {
    sound.playPop();
    if (onBack) {
      onBack();
    } else {
      setIsFinalCompleted(false);
    }
  };

  const handleReset = () => {
    sound.playPop();
    setCompletedItemIds([]);
    setAssignedBadges({});
    setShakingItemId(null);
    setFeedbackMsg(null);
    setActiveBuildingItem(null);
    setAssembledSentences({});
    setCompletedSentenceIds([]);
    setIsParagraphMode(false);
    setAssembledBlocks([]);
    setParagraphFeedback(null);
    setIsFinalCompleted(false);
  };

  // Quick Unlock All for testing or direct paragraph building practice
  const handleDirectToParagraph = () => {
    sound.playPop();
    setCompletedItemIds([1, 2, 3, 4]);
    setAssignedBadges({ 1: 1, 2: 2, 3: 3, 4: 4 });
    setCompletedSentenceIds([1, 2, 3, 4]);
    setIsParagraphMode(true);
    setFeedbackMsg('已进入作文段落组装工作台！请结合左侧要点、关联词与标点拼写段落。');
  };

  // Click on a bubble on the stimulus screen
  const handleBubbleClick = (item: BubbleItem) => {
    // If in Paragraph Mode, clicking the bubble adds its full sentence to the assembly!
    if (isParagraphMode) {
      addSentenceBlock(item);
      return;
    }

    // If all 4 sequence steps are already assigned OR this item is already numbered
    if (completedItemIds.includes(item.id)) {
      // Open the interactive sentence construction modal for this bubble
      sound.playPop();
      setActiveBuildingItem(item);
      return;
    }

    // Still in sequence ordering phase (1 -> 2 -> 3 -> 4)
    if (item.targetSequenceIndex === nextRequiredSequence) {
      // Correct sequence choice!
      const newBadgeNumber = nextRequiredSequence;
      const nextCompleted = [...completedItemIds, item.id];

      setCompletedItemIds(nextCompleted);
      setAssignedBadges((prev) => ({
        ...prev,
        [item.id]: newBadgeNumber,
      }));
      setFeedbackMsg(`太棒了！已标上第 ${newBadgeNumber} 步。点击气泡可进行“微型气泡造句”！`);

      sound.playChime();
      confetti({
        particleCount: 30,
        spread: 50,
        origin: { y: 0.6 },
        colors: ['#F59E0B', '#10B981', '#FEF08A', '#3B82F6'],
      });

      // If this completed the 4th item, prompt student to start assembling sentences
      if (nextCompleted.length === 4) {
        setTimeout(() => {
          sound.playCelebration();
          setFeedbackMsg('🎉 4个核心要点顺序全部排对！现在点击任意气泡，拖曳微型气泡拼出完整句子！');
          // Automatically open the 1st sequence bubble workshop
          const firstItem = BUBBLE_ITEMS.find((b) => b.id === 1);
          if (firstItem) {
            setActiveBuildingItem(firstItem);
          }
        }, 600);
      }
    } else {
      // Incorrect sequence order
      sound.playWrong();
      setShakingItemId(item.id);
      setFeedbackMsg(`顺序不对哦！请先找出第 ${nextRequiredSequence} 个沉迷手机游戏的后果要点。`);

      setTimeout(() => {
        setShakingItemId(null);
      }, 500);
    }
  };

  // --- Sentence Building Logic inside the Modal / Attached Workshop ---

  const currentPlacedFragments = activeBuildingItem
    ? assembledSentences[activeBuildingItem.id] || []
    : [];

  const availableFragments = activeBuildingItem
    ? activeBuildingItem.scrambledFragments.filter((frag) => {
        const placedCount = currentPlacedFragments.filter((f) => f === frag).length;
        const totalInScrambled = activeBuildingItem.scrambledFragments.filter((f) => f === frag).length;
        return placedCount < totalInScrambled;
      })
    : [];

  const isCurrentSentenceVerified = activeBuildingItem
    ? completedSentenceIds.includes(activeBuildingItem.id)
    : false;

  const handleAddFragment = (frag: string) => {
    if (!activeBuildingItem || isCurrentSentenceVerified) return;
    sound.playPop();

    const newPlaced = [...currentPlacedFragments, frag];
    const itemId = activeBuildingItem.id;

    setAssembledSentences((prev) => ({
      ...prev,
      [itemId]: newPlaced,
    }));

    checkSentenceCompletion(activeBuildingItem, newPlaced);
  };

  const handleRemoveFragment = (indexToRemove: number) => {
    if (!activeBuildingItem || isCurrentSentenceVerified) return;
    sound.playPop();

    const newPlaced = currentPlacedFragments.filter((_, idx) => idx !== indexToRemove);
    const itemId = activeBuildingItem.id;

    setAssembledSentences((prev) => ({
      ...prev,
      [itemId]: newPlaced,
    }));
  };

  const handleResetCurrentSentence = () => {
    if (!activeBuildingItem || isCurrentSentenceVerified) return;
    sound.playPop();
    const itemId = activeBuildingItem.id;
    setAssembledSentences((prev) => ({
      ...prev,
      [itemId]: [],
    }));
  };

  const checkSentenceCompletion = (item: BubbleItem, placed: string[]) => {
    if (placed.length === item.fragments.length) {
      const isCorrect = placed.every((frag, i) => frag === item.fragments[i]);
      if (isCorrect) {
        sound.playCelebration();
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#10B981', '#F59E0B', '#FEF08A', '#3B82F6'],
        });

        const nextCompleted = Array.from(new Set([...completedSentenceIds, item.id]));
        setCompletedSentenceIds(nextCompleted);

        // Check if all 4 sentences are fully constructed
        if (nextCompleted.length === 4) {
          setTimeout(() => {
            setActiveBuildingItem(null);
            setIsParagraphMode(true);
            sound.playCelebration();
            setFeedbackMsg('🎉 太棒了！4个句子已全部拼装完成！整套图表已移至左侧，请在右侧结合关联词与标点拼写完整作文！');
          }, 800);
        }
      } else {
        sound.playWrong();
      }
    }
  };

  // --- Right-Hand Paragraph Workbench Handlers ---

  const addLinkerBlock = (linker: string) => {
    sound.playPop();
    const newBlock: ParagraphBlock = {
      id: `linker-${Date.now()}-${Math.random()}`,
      type: 'linker',
      text: linker,
    };
    setAssembledBlocks((prev) => [...prev, newBlock]);
  };

  const addPunctuationBlock = (punc: string) => {
    sound.playPop();
    const newBlock: ParagraphBlock = {
      id: `punc-${Date.now()}-${Math.random()}`,
      type: 'punctuation',
      text: punc,
    };
    setAssembledBlocks((prev) => [...prev, newBlock]);
  };

  const addSentenceBlock = (item: BubbleItem) => {
    sound.playPop();
    const newBlock: ParagraphBlock = {
      id: `sentence-${item.id}-${Date.now()}`,
      type: 'sentence',
      text: item.fullSentence,
      sourceItemId: item.id,
    };
    setAssembledBlocks((prev) => [...prev, newBlock]);
  };

  const removeBlock = (indexToRemove: number) => {
    sound.playPop();
    setAssembledBlocks((prev) => prev.filter((_, idx) => idx !== indexToRemove));
    setParagraphFeedback(null);
  };

  const moveBlock = (index: number, direction: 'up' | 'down') => {
    sound.playPop();
    const newBlocks = [...assembledBlocks];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newBlocks.length) return;
    const temp = newBlocks[index];
    newBlocks[index] = newBlocks[targetIndex];
    newBlocks[targetIndex] = temp;
    setAssembledBlocks(newBlocks);
    setParagraphFeedback(null);
  };

  const handleClearParagraph = () => {
    sound.playPop();
    setAssembledBlocks([]);
    setParagraphFeedback(null);
  };

  // One-click Model Paragraph Demo (Matching the exact requested 62-word final paragraph)
  // "沉迷手机游戏的后果有很多，首先这会导致我们睡眠不足，并且严重影响视力健康。此外，这也会浪费宝贵的学习时间，最后导致我们上课时心不在焉。"
  const handleLoadModelParagraph = () => {
    sound.playChime();
    const modelBlocks: ParagraphBlock[] = [
      { id: 'm-1', type: 'sentence', text: '首先这会导致我们睡眠不足', sourceItemId: 1 },
      { id: 'm-2', type: 'punctuation', text: '，' },
      { id: 'm-3', type: 'sentence', text: '并且严重影响视力健康', sourceItemId: 2 },
      { id: 'm-4', type: 'punctuation', text: '。' },
      { id: 'm-5', type: 'linker', text: '此外' },
      { id: 'm-6', type: 'punctuation', text: '，' },
      { id: 'm-7', type: 'text', text: '这也会浪费宝贵的学习时间', sourceItemId: 3 },
      { id: 'm-8', type: 'punctuation', text: '，' },
      { id: 'm-9', type: 'linker', text: '最后' },
      { id: 'm-10', type: 'text', text: '导致我们上课时心不在焉', sourceItemId: 4 },
      { id: 'm-11', type: 'punctuation', text: '。' },
    ];
    setAssembledBlocks(modelBlocks);
    setParagraphFeedback({
      text: '✨ 已载入优秀范文搭配！包含固定开头、承接（首先、并且）、补充（此外）、结尾（最后）与4个核心要点（约62字）。',
    });
  };

  // Generate live manuscript string
  const fullManuscriptString = `${STARTER_TEXT}${assembledBlocks.map((b) => b.text).join('')}`;
  const characterCount = fullManuscriptString.replace(/[，。、！？]/g, '').length;

  // Validate Paragraph Composition
  const handleVerifyParagraph = () => {
    // Check required components:
    // 1. Must contain all 4 sentence points or phrases
    const hasPoint1 = assembledBlocks.some((b) => b.text.includes('睡眠不足') || b.sourceItemId === 1);
    const hasPoint2 = assembledBlocks.some((b) => b.text.includes('视力') || b.sourceItemId === 2);
    const hasPoint3 = assembledBlocks.some(
      (b) => b.text.includes('学习时间') || b.text.includes('浪费') || b.sourceItemId === 3
    );
    const hasPoint4 = assembledBlocks.some(
      (b) => b.text.includes('心不在焉') || b.text.includes('上课') || b.sourceItemId === 4
    );

    if (!hasPoint1 || !hasPoint2 || !hasPoint3 || !hasPoint4) {
      sound.playWrong();
      setParagraphFeedback({
        text: '段落中还需要包含全部 4 个后果要点（睡眠不足、影响视力、浪费学习时间、上课心不在焉）哦！请检查是否遗漏了要点句子。',
        isError: true,
      });
      return;
    }

    if (characterCount < 40) {
      sound.playWrong();
      setParagraphFeedback({
        text: `当前字数为 ${characterCount} 字，题目要求“字数不少于40字”，可加入适当关联词丰富段落！`,
        isError: true,
      });
      return;
    }

    // Success!
    sound.playCelebration();
    confetti({
      particleCount: 130,
      spread: 90,
      origin: { y: 0.5 },
      colors: ['#10B981', '#F59E0B', '#3B82F6', '#FEF08A', '#F43F5E'],
    });

    setParagraphFeedback({
      text: '🎉 太棒了！段落结构严谨，语意连贯，字数达标，成功写出高分供料作文！',
    });

    setTimeout(() => {
      setIsFinalCompleted(true);
    }, 1200);
  };

  // Drag and drop support for workbench
  const handleWorkbenchDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const linkerData = e.dataTransfer.getData('application/linker');
    if (linkerData) {
      addLinkerBlock(linkerData);
      return;
    }
    const puncData = e.dataTransfer.getData('application/punc');
    if (puncData) {
      addPunctuationBlock(puncData);
      return;
    }
    const bubbleIdData = e.dataTransfer.getData('application/bubble-id');
    if (bubbleIdData) {
      const item = BUBBLE_ITEMS.find((b) => b.id === Number(bubbleIdData));
      if (item) addSentenceBlock(item);
      return;
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen text-[#78350F] select-none justify-between">
      {/* 
        ============================================================
        TOP QUESTION TITLE & CONTROL BANNER (CLEAN DIRECT WORKBENCH)
        ============================================================
      */}
      <div className="sticky top-0 z-30 w-full px-3 sm:px-6 py-2.5 bg-gradient-to-b from-amber-100/95 via-amber-50/95 to-amber-100/90 backdrop-blur-md border-b-2 border-amber-300/80 shadow-sm">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5">
          {/* Question Text */}
          <div className="flex-1 w-full bg-white/95 border-2 border-amber-400 rounded-2xl px-4 py-2 sm:py-2.5 shadow-[0_3px_0_#F59E0B] text-center sm:text-left flex items-center justify-between gap-3">
            <h1 className="text-xs sm:text-sm md:text-base font-black text-[#78350F] leading-snug tracking-wide">
              根据所提供的资料，书写一段文字，说明沉迷手机游戏的后果，字数不少于40字。
            </h1>

            {/* Quick Status / Paragraph Mode Switch */}
            <div className="hidden md:flex items-center gap-1.5 shrink-0">
              <div className="flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-300 text-[11px] font-bold text-[#78350F]">
                <span>标号:</span>
                <span className="text-amber-800 font-extrabold">{completedItemIds.length}/4</span>
                <span className="text-amber-400 mx-0.5">|</span>
                <span>造句:</span>
                <span className="text-emerald-700 font-extrabold">{completedSentenceIds.length}/4</span>
              </div>
              {!isParagraphMode && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleDirectToParagraph}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white text-[11px] font-black shadow-xs cursor-pointer"
                  title="直接进入右侧段落组装工作台"
                >
                  <Wand2 className="w-3 h-3" />
                  <span>组装段落 ➔</span>
                </motion.button>
              )}
            </div>
          </div>

          {/* Quick Utility Controls (Sound, Reset) */}
          <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
            <motion.button
              id="btn-sound-q1"
              onClick={handleToggleMute}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              className="p-1.5 sm:p-2 rounded-xl bg-white border-2 border-amber-300 shadow-[0_2px_0_#F59E0B] hover:bg-amber-50 active:translate-y-0.5 active:shadow-none text-[#78350F] cursor-pointer"
              title={sound.getMuted() ? '开启声音' : '静音'}
            >
              {sound.getMuted() ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-amber-700" />}
            </motion.button>

            <motion.button
              id="btn-reset-q1"
              onClick={handleReset}
              whileHover={{ scale: 1.08, rotate: -45 }}
              whileTap={{ scale: 0.92 }}
              className="p-1.5 sm:p-2 rounded-xl bg-white border-2 border-amber-300 shadow-[0_2px_0_#F59E0B] hover:bg-amber-50 active:translate-y-0.5 active:shadow-none text-[#78350F] cursor-pointer"
              title="重新开始 (Reset)"
            >
              <RotateCcw className="w-4 h-4 text-amber-700" />
            </motion.button>
          </div>
        </div>
      </div>

      {/* 
        ============================================================
        MAIN WORKSPACE AREA:
        - Mode A (Centered): Topic Visual + 4 Bubbles layout
        - Mode B (Side-by-Side): The Visual + 4 Bubbles set on the LEFT,
          with the Rich Paragraph Builder on the RIGHT!
        ============================================================
      */}
      <main className="flex-1 flex flex-col items-center justify-center p-2 sm:p-4 md:p-6 max-w-7xl mx-auto w-full relative z-10">
        
        {/* Dynamic Instructional Banner */}
        <div className="w-full max-w-4xl text-center mb-2.5">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-amber-300 shadow-xs text-xs sm:text-sm font-bold text-[#78350F]">
            <span className="text-amber-600 font-black">提示：</span>
            <span>
              {!isSequenceDone
                ? `请依序找出第 [ ${nextRequiredSequence} ] 个核心后果要点并点击气泡标号`
                : !isAllSentencesBuilt && !isParagraphMode
                ? '🎯 点击已标号的气泡，拖曳微型气泡拼出完整句子！'
                : '✨ 开头已设为“沉迷手机游戏的后果有很多，”，请在右侧拖入关联词、句子和标点符号完成作文！'}
            </span>
          </div>
          {(feedbackMsg || paragraphFeedback) && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className={`text-xs sm:text-sm font-bold mt-1 ${
                paragraphFeedback?.isError ? 'text-red-600' : 'text-amber-900'
              }`}
            >
              {paragraphFeedback?.text || feedbackMsg}
            </motion.p>
          )}
        </div>

        {/* 
          ============================================================
          CONTAINER FOR VISUAL GRAPHIC (LEFT) + PARAGRAPH WORKBENCH (RIGHT)
          ============================================================
        */}
        <div
          className={`w-full transition-all duration-500 ${
            isParagraphMode
              ? 'grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 items-start'
              : 'flex items-center justify-center'
          }`}
        >
          {/* 
            ----------------------------------------------------------
            THE VISUAL GRAPHIC CANVAS (4 CORNER BUBBLES + CENTER TOPIC CARD)
            Center: Stylized "沉迷手机游戏的后果" Infographic Card
            Top-Left: 睡眠不足 (1)
            Top-Right: 影响视力 (2)
            Bottom-Left: 浪费学习时间 (3)
            Bottom-Right: 上课心不在焉 (4)
            ----------------------------------------------------------
          */}
          <div
            className={`transition-all duration-500 ${
              isParagraphMode
                ? 'lg:col-span-6 w-full flex flex-col items-center'
                : 'w-full max-w-4xl flex items-center justify-center'
            }`}
          >
            {/* Visual Canvas Container */}
            <div
              className={`relative w-full rounded-3xl p-3 sm:p-5 flex items-center justify-center ${
                isParagraphMode
                  ? 'min-h-[460px] sm:min-h-[500px] bg-white/40 backdrop-blur-xs border border-amber-200/60 shadow-xs'
                  : 'min-h-[480px] sm:min-h-[540px] md:min-h-[580px]'
              }`}
            >
              {/* Subtle Ambient Glow behind Center Graphic */}
              <div className="absolute w-64 h-64 sm:w-80 sm:h-80 rounded-full bg-amber-300/30 blur-3xl pointer-events-none" />

              {/* Center Stylized Topic Illustration Card */}
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className={`relative z-10 p-4 sm:p-5 bg-gradient-to-br from-amber-50 via-white to-amber-100/90 backdrop-blur-md rounded-2xl sm:rounded-3xl border-3 border-amber-400 shadow-[0_12px_30px_rgba(245,158,11,0.25)] flex flex-col items-center justify-center text-center transition-all ${
                  isParagraphMode
                    ? 'max-w-[210px] sm:max-w-[250px]'
                    : 'max-w-[280px] sm:max-w-[340px]'
                }`}
              >
                {/* Visual Phone & Gaming Illustration Graphic from User */}
                <div className="relative mb-3 flex items-center justify-center overflow-hidden rounded-2xl border-2 border-amber-400 bg-white p-1 shadow-sm max-w-[160px] sm:max-w-[200px]">
                  <img
                    src="https://i.postimg.cc/pL2KXFK3/image.png"
                    alt="沉迷手机游戏的后果"
                    className="w-full h-auto object-contain rounded-xl"
                    referrerPolicy="no-referrer"
                  />
                </div>

                {/* Main Topic Title Badge */}
                <div className="px-3 py-1 rounded-full bg-amber-200/90 border border-amber-400 text-amber-950 text-xs sm:text-sm font-black mb-1.5 shadow-2xs">
                  供料作文主题
                </div>

                <h2 className="text-base sm:text-xl font-black text-[#78350F] tracking-tight leading-snug drop-shadow-xs">
                  沉迷手机游戏的后果
                </h2>


              </motion.div>

              {/* 
                4 Floating Bubbles Desktop/Tablet 
                Positioned around the center topic card
              */}
              <div className="hidden sm:block absolute inset-0 pointer-events-none z-20">
                {BUBBLE_ITEMS.map((item) => {
                  const isNumbered = completedItemIds.includes(item.id);
                  const badgeNum = assignedBadges[item.id] || item.targetSequenceIndex;
                  const isShaking = shakingItemId === item.id;
                  const isSentenceDone = completedSentenceIds.includes(item.id);

                  return (
                    <div
                      key={`bubble-${item.id}`}
                      className={`absolute pointer-events-auto ${item.positionClass}`}
                    >
                      <motion.button
                        id={`bubble-item-${item.id}`}
                        draggable={isParagraphMode}
                        onDragStart={(e) => {
                          e.dataTransfer.setData('application/bubble-id', item.id.toString());
                        }}
                        animate={
                          isShaking
                            ? { x: [-10, 10, -8, 8, -4, 4, 0] }
                            : {
                                y: [0, -5, 0],
                                rotate: [0, 0.8, -0.8, 0],
                              }
                        }
                        transition={
                          isShaking
                            ? { duration: 0.45 }
                            : {
                                duration: 3.5,
                                repeat: Infinity,
                                ease: 'easeInOut',
                                delay: item.floatDelay,
                              }
                        }
                        whileHover={{ scale: 1.05, y: -4 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleBubbleClick(item)}
                        className={`relative rounded-full border-3 backdrop-blur-md transition-all text-center flex flex-col items-center justify-center cursor-pointer select-none group shadow-lg ${
                          isParagraphMode
                            ? 'min-w-[150px] max-w-[220px] px-3 py-2 text-xs sm:text-sm'
                            : 'min-w-[190px] max-w-[280px] px-4 py-3 text-sm sm:text-base'
                        } ${
                          isSentenceDone
                            ? 'bg-gradient-to-r from-emerald-50/95 via-teal-50/95 to-emerald-100/95 border-emerald-500 shadow-[0_6px_0_#059669,0_10px_20px_rgba(16,185,129,0.25)]'
                            : isNumbered
                            ? 'bg-gradient-to-r from-amber-100/95 via-yellow-100/95 to-amber-200/95 border-amber-500 shadow-[0_6px_0_#D97706,0_10px_20px_rgba(245,158,11,0.25)]'
                            : 'bg-white/95 border-amber-300 shadow-[0_6px_0_#F59E0B,0_10px_20px_rgba(245,158,11,0.15)] hover:border-amber-400'
                        }`}
                        title={
                          isParagraphMode
                            ? `点击或拖曳放入右侧作文组装区`
                            : isNumbered
                            ? `点击造句`
                            : `第 ${item.targetSequenceIndex} 步`
                        }
                      >
                        <div className="absolute top-1 left-4 right-4 h-2.5 bg-gradient-to-b from-white/80 to-transparent rounded-full pointer-events-none" />

                        {/* Content inside the Bubble */}
                        {isSentenceDone ? (
                          <div className="flex flex-col items-center justify-center gap-0.5 text-center">
                            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-200/80 border border-emerald-400/80 text-[10px] font-extrabold text-emerald-900 shadow-2xs">
                              <Check className="w-2.5 h-2.5 text-emerald-700 stroke-[3]" />
                              <span>要点：{item.text}</span>
                            </div>
                            <span
                              className={`font-black text-emerald-950 leading-tight tracking-wide text-center drop-shadow-[0_1px_0_rgba(255,255,255,0.7)] px-1 ${
                                isParagraphMode ? 'text-xs sm:text-sm mt-0.5' : 'text-sm sm:text-base'
                              }`}
                            >
                              {item.fullSentence}
                            </span>
                            {isParagraphMode && (
                              <span className="text-[9px] font-bold text-emerald-800/80 bg-white/70 rounded-full px-2 py-0.2 mt-0.5">
                                点击/拖入段落 ➔
                              </span>
                            )}
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center">
                            <span
                              className={`font-black tracking-wide ${
                                isParagraphMode ? 'text-sm sm:text-base' : 'text-base sm:text-xl'
                              } ${isNumbered ? 'text-amber-950' : 'text-[#78350F]'}`}
                            >
                              {item.text}
                            </span>
                            {isNumbered && !isParagraphMode && (
                              <div className="mt-1 px-2.5 py-0.5 rounded-full bg-amber-200/90 border border-amber-400/90 flex items-center gap-1 animate-pulse shadow-2xs">
                                <Pencil className="w-3 h-3 text-amber-800" />
                                <span className="text-[10px] font-extrabold text-amber-900">
                                  点击拼造完整句子 ✍️
                                </span>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Numbered Bubble Badge */}
                        <AnimatePresence>
                          {isNumbered && (
                            <motion.div
                              initial={{ scale: 0, rotate: -45 }}
                              animate={{ scale: 1, rotate: 0 }}
                              exit={{ scale: 0 }}
                              className={`absolute -top-2.5 -right-2.5 w-8 h-8 rounded-full border-2 border-white shadow-[0_2px_0_#B45309] flex items-center justify-center z-30 ${
                                isSentenceDone
                                  ? 'bg-gradient-to-br from-emerald-300 via-emerald-400 to-teal-500'
                                  : 'bg-gradient-to-br from-yellow-300 via-amber-400 to-amber-500'
                              }`}
                            >
                              <div className="absolute top-0.5 left-1 right-1 h-1.5 bg-gradient-to-b from-white/80 to-transparent rounded-full pointer-events-none" />
                              <span className="text-sm font-black text-[#78350F] drop-shadow-xs">
                                {badgeNum}
                              </span>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.button>
                    </div>
                  );
                })}
              </div>

              {/* Mobile Stacked Buttons (< 640px) */}
              <div className="sm:hidden grid grid-cols-2 gap-2 w-full mt-3 z-20">
                {BUBBLE_ITEMS.map((item) => {
                  const isNumbered = completedItemIds.includes(item.id);
                  const badgeNum = assignedBadges[item.id] || item.targetSequenceIndex;
                  const isSentenceDone = completedSentenceIds.includes(item.id);

                  return (
                    <button
                      key={`mob-${item.id}`}
                      onClick={() => handleBubbleClick(item)}
                      className={`relative p-2 rounded-2xl border-2 text-center flex flex-col items-center justify-center shadow-xs cursor-pointer text-xs ${
                        isSentenceDone
                          ? 'bg-emerald-50 border-emerald-400'
                          : isNumbered
                          ? 'bg-amber-100 border-amber-400'
                          : 'bg-white border-amber-300'
                      }`}
                    >
                      <span className="font-black text-[#78350F]">{item.text}</span>
                      {isSentenceDone && (
                        <span className="text-[10px] text-emerald-800 font-bold mt-0.5 line-clamp-1">
                          {item.fullSentence}
                        </span>
                      )}
                      {isNumbered && (
                        <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-amber-500 text-white font-black text-[10px] flex items-center justify-center">
                          {badgeNum}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bottom Helper Bar on Left in Paragraph Mode */}
            {isParagraphMode && (
              <div className="w-full mt-2 px-3 py-2 rounded-2xl bg-amber-100/70 border border-amber-300 flex items-center justify-between text-xs font-bold text-amber-900">
                <span className="flex items-center gap-1.5">
                  <Sparkle className="w-3.5 h-3.5 text-amber-600" />
                  <span>点击左侧气泡，可直接将句子加入右侧段落！</span>
                </span>
                <span className="text-[11px] text-amber-700 bg-white/70 px-2 py-0.5 rounded-md">
                  4/4 要点
                </span>
              </div>
            )}
          </div>

          {/* 
            ----------------------------------------------------------
            RIGHT COLUMN: RICH PARAGRAPH BUILDER WORKBENCH
            - Fixed Opening: "沉迷手机游戏的后果有很多，"
            - Draggable Linkers (首先、并且、此外、最后、最终、接着、另外、同时)
            - Draggable Punctuations (， 。 ！ 、)
            - Interactive Paragraph Assembly Strip (Reorder & Remove)
            - Live Chinese Manuscript Preview with ≥40 Character Counter
            ----------------------------------------------------------
          */}
          {isParagraphMode && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4 }}
              className="lg:col-span-6 w-full flex flex-col gap-3.5"
            >
              {/* Workbench Header */}
              <div className="flex items-center justify-between bg-white/95 backdrop-blur-md rounded-2xl border-2 border-amber-300 px-4 py-2.5 shadow-xs">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-white font-black text-xs flex items-center justify-center shadow-xs">
                    <ListOrdered className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-black text-[#78350F]">
                      作文段落组装工作台 (Build Paragraph)
                    </h3>
                    <p className="text-[11px] font-bold text-amber-800/80">
                      开头：『{STARTER_TEXT}』+ 关联词 + 核心句子 + 标点
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={handleLoadModelParagraph}
                    className="px-2.5 py-1 rounded-xl bg-amber-100 hover:bg-amber-200 border border-amber-300 text-xs font-black text-amber-900 cursor-pointer flex items-center gap-1"
                    title="一键载入示范范文"
                  >
                    <Wand2 className="w-3 h-3 text-amber-700" />
                    <span>参考范文</span>
                  </button>
                  <button
                    onClick={handleClearParagraph}
                    disabled={assembledBlocks.length === 0}
                    className="px-2.5 py-1 rounded-xl bg-white hover:bg-red-50 border border-amber-300 text-xs font-bold text-amber-800 hover:text-red-700 disabled:opacity-40 cursor-pointer"
                  >
                    清空
                  </button>
                </div>
              </div>

              {/* 
                ========================================================
                TOOLBOX: DRAGGABLE LINKERS & PUNCTUATIONS & SENTENCES
                ========================================================
              */}
              <div className="bg-white/95 rounded-2xl sm:rounded-3xl border-2 border-amber-300 p-3 sm:p-4 shadow-sm flex flex-col gap-3">
                {/* Section A: Draggable Linkers (关联词 / 连接词) */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-amber-900 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                      <span>关联词库 (点击或拖入组装盒)：</span>
                    </span>
                    <span className="text-[10px] font-bold text-amber-700">
                      建议使用：首先、并且、此外、最后等
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {LINKERS.map((linker) => (
                      <motion.button
                        key={`linker-${linker}`}
                        draggable
                        onDragStart={(e) => {
                          e.dataTransfer.setData('application/linker', linker);
                        }}
                        whileHover={{ scale: 1.08, y: -2 }}
                        whileTap={{ scale: 0.94 }}
                        onClick={() => addLinkerBlock(linker)}
                        className="px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 border-2 border-amber-600 text-amber-950 font-black text-xs sm:text-sm shadow-[0_2px_0_#B45309] hover:brightness-105 transition-all cursor-grab active:cursor-grabbing select-none"
                      >
                        + {linker}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Section B: Draggable Punctuations (标点符号块) */}
                <div className="flex flex-col gap-1.5 pt-2 border-t border-amber-200/80">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-amber-900 flex items-center gap-1">
                      <span>标点符号库 (点击或拖入)：</span>
                    </span>
                    <span className="text-[10px] font-bold text-amber-700">
                      ，逗号  。句号  ！叹号  、顿号
                    </span>
                  </div>

                  <div className="flex items-center gap-2.5">
                    {PUNCTUATIONS.map((punc) => (
                      <motion.button
                        key={`punc-${punc}`}
                        draggable
                        onDragStart={(e) => {
                          e.dataTransfer.setData('application/punc', punc);
                        }}
                        whileHover={{ scale: 1.15, y: -2 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => addPunctuationBlock(punc)}
                        className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-white border-2 border-amber-400 text-amber-950 font-black text-base sm:text-lg shadow-[0_2px_0_#D97706] hover:bg-amber-100 transition-all flex items-center justify-center cursor-grab active:cursor-grabbing select-none"
                      >
                        {punc}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Section C: Quick Core Sentence Palette (4个核心句子) */}
                <div className="flex flex-col gap-1.5 pt-2 border-t border-amber-200/80">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-amber-900">
                      核心句子块 (也可直接点击左侧气泡)：
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {BUBBLE_ITEMS.map((item) => {
                      const isIncluded = assembledBlocks.some(
                        (b) => b.sourceItemId === item.id || b.text === item.fullSentence
                      );
                      const badgeNum = assignedBadges[item.id] || item.targetSequenceIndex;

                      return (
                        <motion.button
                          key={`quick-sent-${item.id}`}
                          draggable
                          onDragStart={(e) => {
                            e.dataTransfer.setData('application/bubble-id', item.id.toString());
                          }}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => addSentenceBlock(item)}
                          className={`p-2 rounded-xl border text-left flex items-center gap-2 text-xs font-bold transition-all cursor-pointer ${
                            isIncluded
                              ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                              : 'bg-amber-50 hover:bg-amber-100 border-amber-300 text-[#78350F]'
                          }`}
                        >
                          <span className="w-5 h-5 rounded-full bg-amber-500 text-white font-black text-[10px] flex items-center justify-center shrink-0">
                            {badgeNum}
                          </span>
                          <span className="truncate flex-1 font-extrabold">{item.fullSentence}</span>
                          <Plus className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* 
                ========================================================
                INTERACTIVE ASSEMBLY STRIP / WORKSPACE (DROP ZONE)
                ========================================================
              */}
              <div
                onDrop={handleWorkbenchDrop}
                onDragOver={handleDragOver}
                className="bg-white/95 rounded-3xl border-3 border-amber-400 p-4 shadow-md flex flex-col gap-2.5 min-h-[160px]"
              >
                <div className="flex items-center justify-between border-b border-amber-200 pb-2">
                  <span className="text-xs font-black text-amber-900 flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-amber-600" />
                    <span>作文段落组装槽（按顺序连接）：</span>
                  </span>
                  <span className="text-[11px] font-bold text-amber-700">
                    可拖曳或点击上下箭头调序
                  </span>
                </div>

                {/* Fixed Introductory Sentence Anchor */}
                <div className="flex items-center gap-2 p-2 rounded-xl bg-amber-100/90 border border-amber-300 text-xs sm:text-sm font-black text-amber-950 shadow-2xs">
                  <span className="px-2 py-0.5 rounded-md bg-amber-500 text-white text-[10px] font-black uppercase shrink-0">
                    固定开头
                  </span>
                  <span>{STARTER_TEXT}</span>
                </div>

                {/* Assembled Draggable / Reorderable Chips */}
                <div className="flex flex-wrap items-center gap-2 py-1 min-h-[60px]">
                  {assembledBlocks.length === 0 ? (
                    <div className="w-full py-4 text-center text-xs font-bold text-amber-800/50 border-2 border-dashed border-amber-200 rounded-xl bg-amber-50/50">
                      拖曳或点击上方的【关联词】、【标点】或左侧【句子气泡】放入此处进行组装
                    </div>
                  ) : (
                    assembledBlocks.map((block, idx) => (
                      <motion.div
                        key={block.id}
                        layout
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs sm:text-sm font-black shadow-xs border ${
                          block.type === 'linker'
                            ? 'bg-amber-400 border-amber-600 text-amber-950'
                            : block.type === 'punctuation'
                            ? 'bg-white border-amber-400 text-[#78350F] px-3'
                            : 'bg-emerald-100 border-emerald-400 text-emerald-950'
                        }`}
                      >
                        <span>{block.text}</span>

                        {/* Order & Remove Controls */}
                        <div className="flex items-center gap-0.5 ml-1">
                          <button
                            onClick={() => moveBlock(idx, 'up')}
                            disabled={idx === 0}
                            className="p-0.5 rounded hover:bg-black/10 disabled:opacity-20 cursor-pointer"
                            title="前移"
                          >
                            <ArrowUp className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => moveBlock(idx, 'down')}
                            disabled={idx === assembledBlocks.length - 1}
                            className="p-0.5 rounded hover:bg-black/10 disabled:opacity-20 cursor-pointer"
                            title="后移"
                          >
                            <ArrowDown className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => removeBlock(idx)}
                            className="p-0.5 rounded hover:bg-red-500 hover:text-white text-red-600 cursor-pointer"
                            title="删除"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </div>

              {/* 
                ========================================================
                LIVE CHINESE MANUSCRIPT PREVIEW & WORD COUNTER
                ========================================================
              */}
              <div className="bg-white/95 rounded-3xl border-3 border-amber-300 p-4 sm:p-5 shadow-md text-left flex flex-col gap-2.5">
                <div className="flex items-center justify-between border-b border-amber-200 pb-2">
                  <span className="text-xs font-black text-amber-900 flex items-center gap-1.5">
                    <FileCheck className="w-4 h-4 text-emerald-600" />
                    <span>供料作文稿纸实时预览：</span>
                  </span>
                  <span
                    className={`text-[11px] font-black px-2.5 py-0.5 rounded-full border ${
                      characterCount >= 40
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        : 'bg-amber-100 text-amber-900 border-amber-300'
                    }`}
                  >
                    字数：{characterCount} 字 {characterCount >= 40 ? '（≥40字 达标 ✅）' : '（需不少于40字）'}
                  </span>
                </div>

                {/* Manuscript Paper Container */}
                <div className="p-3 sm:p-4 rounded-2xl bg-amber-50/70 border border-amber-200 min-h-[80px] flex items-center">
                  <p className="text-sm sm:text-base font-bold text-[#78350F] leading-relaxed tracking-wide text-justify indent-8">
                    {fullManuscriptString}
                  </p>
                </div>

                {/* Final Verification Button */}
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleVerifyParagraph}
                  className="w-full mt-1 py-3 px-6 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 border-2 border-amber-600 text-amber-950 font-black text-sm sm:text-base shadow-[0_4px_0_#B45309] hover:brightness-105 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  <span>验证并提交作文段落</span>
                </motion.button>
              </div>
            </motion.div>
          )}
        </div>

        {/* Bottom Progression Track (Shown before Paragraph Mode) */}
        {!isParagraphMode && (
          <div className="w-full max-w-md mt-4 sm:mt-6 bg-white/80 backdrop-blur-md rounded-2xl border border-amber-200 p-2.5 sm:p-3 shadow-sm flex items-center justify-between">
            <div className="text-xs font-bold text-[#78350F]">后果要点标号进度:</div>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4].map((step) => {
                const isStepDone = completedItemIds.length >= step;
                return (
                  <div
                    key={`prog-${step}`}
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-black text-xs transition-all ${
                      isStepDone
                        ? 'bg-amber-400 text-[#78350F] border-2 border-amber-500 shadow-xs scale-105'
                        : 'bg-amber-100/60 text-amber-400 border border-amber-200'
                    }`}
                  >
                    {step}
                  </div>
                );
              })}
            </div>
            <button
              onClick={handleReset}
              className="text-[11px] font-bold text-amber-700 hover:text-amber-900 underline cursor-pointer"
            >
              重置
            </button>
          </div>
        )}
      </main>

      {/* 
        ============================================================
        MICRO-BUBBLE SENTENCE BUILDING WORKSHOP MODAL
        ============================================================
      */}
      <AnimatePresence>
        {activeBuildingItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-amber-950/60 backdrop-blur-md overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className="w-full max-w-2xl bg-white rounded-3xl sm:rounded-[36px] border-4 border-amber-300 p-5 sm:p-8 text-center shadow-[0_24px_60px_rgba(245,158,11,0.4)] relative flex flex-col gap-5 overflow-hidden"
            >
              {/* Modal Top Header */}
              <div className="flex items-center justify-between border-b border-amber-200 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-amber-500 text-white font-black text-sm flex items-center justify-center shadow-xs">
                    {assignedBadges[activeBuildingItem.id] || activeBuildingItem.targetSequenceIndex}
                  </div>
                  <span className="text-base sm:text-xl font-black text-[#78350F]">
                    微型气泡拼句 • {activeBuildingItem.text}
                  </span>
                </div>

                <button
                  onClick={() => setActiveBuildingItem(null)}
                  className="p-1.5 rounded-full hover:bg-amber-100 text-[#78350F] transition-all cursor-pointer"
                  title="关闭"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Main Prompt Bubble Display */}
              <div className="flex flex-col items-center">
                <div className="relative px-6 py-2.5 rounded-full bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-200 border-2 border-amber-400 shadow-md">
                  <span className="text-base sm:text-lg font-black text-[#78350F]">
                    要点词语：{activeBuildingItem.text}
                  </span>
                </div>
                <p className="text-xs sm:text-sm font-bold text-[#78350F]/80 mt-2">
                  请将下方的微型词语气泡【拖曳】或【点击】放入大装配气泡中，组成通顺完整的句子：
                </p>
              </div>

              {/* Large Target Assembly Bubble (Drop Zone / Sentence Box) */}
              <div
                onDrop={(e) => {
                  e.preventDefault();
                  const frag = e.dataTransfer.getData('text/plain');
                  if (frag && availableFragments.includes(frag)) {
                    handleAddFragment(frag);
                  }
                }}
                onDragOver={(e) => e.preventDefault()}
                className={`relative w-full min-h-[110px] sm:min-h-[130px] rounded-3xl p-4 sm:p-6 border-3 transition-all flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 ${
                  isCurrentSentenceVerified
                    ? 'bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-100 border-emerald-500 shadow-[0_8px_0_#059669,0_10px_25px_rgba(16,185,129,0.3)]'
                    : 'bg-gradient-to-br from-amber-50/90 via-yellow-50/80 to-amber-100/90 border-dashed border-amber-400 shadow-inner'
                }`}
              >
                <div className="absolute top-2 left-6 right-6 h-4 bg-gradient-to-b from-white/80 to-transparent rounded-full pointer-events-none" />

                {currentPlacedFragments.length === 0 ? (
                  <div className="text-amber-800/60 font-bold text-xs sm:text-sm flex items-center gap-2 pointer-events-none">
                    <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
                    <span>（将下方的微型词语气泡点击或拖入此处）</span>
                  </div>
                ) : (
                  currentPlacedFragments.map((frag, idx) => (
                    <motion.button
                      key={`${frag}-${idx}`}
                      initial={{ scale: 0, y: 10 }}
                      animate={{ scale: 1, y: 0 }}
                      exit={{ scale: 0 }}
                      whileHover={!isCurrentSentenceVerified ? { scale: 1.08 } : {}}
                      whileTap={!isCurrentSentenceVerified ? { scale: 0.92 } : {}}
                      onClick={() => handleRemoveFragment(idx)}
                      className={`relative px-4 py-2 sm:px-5 sm:py-2.5 rounded-full font-black text-sm sm:text-base cursor-pointer transition-all border-2 shadow-sm flex items-center gap-1.5 ${
                        isCurrentSentenceVerified
                          ? 'bg-emerald-400 border-emerald-600 text-emerald-950 shadow-[0_3px_0_#059669]'
                          : 'bg-amber-300 border-amber-500 text-amber-950 shadow-[0_3px_0_#D97706] hover:bg-amber-200'
                      }`}
                      title={!isCurrentSentenceVerified ? '点击移回气泡池' : ''}
                    >
                      <span>{frag}</span>
                      {!isCurrentSentenceVerified && (
                        <span className="text-[10px] text-amber-800 bg-white/60 rounded-full px-1">
                          ✕
                        </span>
                      )}
                    </motion.button>
                  ))
                )}
              </div>

              {/* Status Message */}
              {isCurrentSentenceVerified ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-3 rounded-2xl bg-emerald-100 border-2 border-emerald-400 text-emerald-900 font-black text-sm sm:text-base flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span>拼句成功！完整句子：“{activeBuildingItem.fullSentence}”</span>
                </motion.div>
              ) : currentPlacedFragments.length === activeBuildingItem.fragments.length ? (
                <div className="text-xs sm:text-sm font-bold text-red-600">
                  语序不太通顺哦，请调整微型气泡的先后顺序！
                </div>
              ) : null}

              {/* Available Mini Bubbles Pool */}
              {!isCurrentSentenceVerified && (
                <div className="flex flex-col items-center gap-2 mt-1">
                  <div className="text-xs font-bold text-[#78350F]/70">
                    待拼装微型气泡（可拖曳或直接点击）：
                  </div>

                  <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 p-3 bg-amber-50 rounded-2xl border border-amber-200 w-full min-h-[70px]">
                    {availableFragments.length === 0 ? (
                      <span className="text-xs font-bold text-amber-700/60">
                        所有微型气泡均已放入大装配气泡中
                      </span>
                    ) : (
                      availableFragments.map((frag, idx) => (
                        <motion.div
                          key={`pool-${frag}-${idx}`}
                          draggable
                          onDragStart={(e) => e.dataTransfer.setData('text/plain', frag)}
                          whileHover={{ scale: 1.12, y: -2 }}
                          whileTap={{ scale: 0.94 }}
                          animate={{
                            y: [0, -3, 0],
                          }}
                          transition={{
                            duration: 2 + idx * 0.4,
                            repeat: Infinity,
                            ease: 'easeInOut',
                          }}
                          onClick={() => handleAddFragment(frag)}
                          className="relative px-4 py-2 sm:px-5 sm:py-2.5 rounded-full bg-gradient-to-br from-yellow-200 via-amber-300 to-amber-400 border-2 border-amber-500 font-black text-sm sm:text-base text-amber-950 shadow-[0_4px_0_#D97706,0_6px_12px_rgba(245,158,11,0.25)] cursor-grab active:cursor-grabbing hover:from-yellow-100 hover:to-amber-300 transition-all select-none"
                        >
                          <div className="absolute top-0.5 left-2 right-2 h-2 bg-gradient-to-b from-white/70 to-transparent rounded-full pointer-events-none" />
                          <span>{frag}</span>
                        </motion.div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* Action Buttons in Modal */}
              <div className="flex items-center justify-between gap-3 pt-2 border-t border-amber-200">
                <button
                  onClick={handleResetCurrentSentence}
                  disabled={isCurrentSentenceVerified || currentPlacedFragments.length === 0}
                  className="px-4 py-2 rounded-xl bg-amber-100 text-[#78350F] font-bold text-xs hover:bg-amber-200 disabled:opacity-40 cursor-pointer"
                >
                  清空重拼
                </button>

                <button
                  onClick={() => setActiveBuildingItem(null)}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 border border-amber-600 text-[#78350F] font-black text-sm shadow-[0_3px_0_#B45309] hover:brightness-105 cursor-pointer"
                >
                  {isCurrentSentenceVerified ? '完成返回' : '返回题目'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 
        ============================================================
        FINAL ESSAY SHOWCASE MODAL
        ============================================================
      */}
      <AnimatePresence>
        {isFinalCompleted && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-amber-950/60 backdrop-blur-md overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 20 }}
              className="w-full max-w-lg bg-white rounded-3xl sm:rounded-[36px] border-4 border-amber-400 p-6 sm:p-8 text-center shadow-[0_20px_50px_rgba(245,158,11,0.5)] relative overflow-hidden"
            >
              <div className="w-16 h-16 rounded-full bg-amber-100 border-2 border-amber-300 mx-auto flex items-center justify-center mb-3 text-amber-600 shadow-inner">
                <Award className="w-9 h-9 animate-bounce" />
              </div>

              <h3 className="text-2xl sm:text-3xl font-black text-[#78350F] tracking-tight mb-1">
                恭喜通关第 1 题！
              </h3>
              <p className="text-xs sm:text-sm font-bold text-[#78350F]/80 mb-4">
                你已成功将要点、关联词与标点组装为流畅规范的供料作文段落！
              </p>

              {/* Assembled Essay Display */}
              <div className="text-left bg-amber-50 rounded-2xl border-2 border-amber-300 p-4 sm:p-5 mb-5 shadow-inner">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-black text-amber-800 flex items-center gap-1">
                    <FileCheck className="w-4 h-4 text-emerald-600" />
                    <span>你编写的供料作文段落：</span>
                  </span>
                  <span className="text-[11px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                    字数：{characterCount} 字 (≥40字达标 ✨)
                  </span>
                </div>
                <p className="text-sm sm:text-base font-bold text-[#78350F] leading-relaxed tracking-wide indent-8 text-justify">
                  {fullManuscriptString}
                </p>
              </div>

              <div className="flex items-center justify-center gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleReset}
                  className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 border-2 border-amber-600 text-[#78350F] font-black text-sm shadow-[0_4px_0_#B45309] hover:brightness-105 transition-all cursor-pointer"
                >
                  重新练习
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsFinalCompleted(false)}
                  className="flex-1 py-3 px-4 rounded-2xl bg-amber-100 border-2 border-amber-300 text-[#78350F] font-black text-sm hover:bg-amber-200 transition-all cursor-pointer"
                >
                  关闭
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
