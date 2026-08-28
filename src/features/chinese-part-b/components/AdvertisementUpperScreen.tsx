import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Image as ImageIcon,
  Check,
  Trophy,
  Volume2,
  VolumeX,
  Settings,
  HelpCircle,
  BookOpen,
  Info,
  Lightbulb,
  Play,
  Square,
  MoveHorizontal,
  GripVertical,
  Trash2,
  Edit3,
  Layers,
  ArrowUp,
  ArrowDown,
  Plus,
  X,
  Columns,
  Rows,
  Type,
  Maximize2,
  Minimize2,
  Search,
  KeyRound,
  Unlock,
  Smile,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useApp } from '../context/AppContext';
import { sound } from '../utils/audio';
import { WorksheetQuestion, OrderingItem, CandidateClue } from '../types';
import { FairyDustEffect } from './FairyDustEffect';
import { CuteBeeMascot } from './MainScreen';

// Small cute Bee Icon for hint buttons
const BeeHintIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <ellipse cx="11" cy="9" rx="6" ry="4" transform="rotate(-30 11 9)" fill="#BAE6FD" stroke="#0284C7" strokeWidth="1.5" opacity="0.9" />
    <ellipse cx="21" cy="9" rx="6" ry="4" transform="rotate(30 21 9)" fill="#BAE6FD" stroke="#0284C7" strokeWidth="1.5" opacity="0.9" />
    <ellipse cx="16" cy="18" rx="8" ry="10" transform="rotate(90 16 18)" fill="#F59E0B" stroke="#78350F" strokeWidth="2" />
    <path d="M13 10.5C14 10.2 15 10 16 10C17 10 18 10.2 19 10.5V25.5C18 25.8 17 26 16 26C15 26 14 25.8 13 25.5V10.5Z" fill="#78350F" />
    <path d="M7.5 15C8.5 13.5 10 12 11.5 11.5V24.5C10 24 8.5 22.5 7.5 21C6.8 19.8 6.5 18.5 6.5 18C6.5 17.5 6.8 16.2 7.5 15Z" fill="#78350F" />
    <path d="M5 18L7 16V20L5 18Z" fill="#78350F" />
    <circle cx="21" cy="16" r="1.5" fill="#78350F" />
    <circle cx="21" cy="20" r="1.5" fill="#78350F" />
    <path d="M24 17.5C24.5 18 24.5 18 24 18.5" stroke="#78350F" strokeWidth="1.2" strokeLinecap="round" />
    <path d="M22 14C23 12 25 11 27 12" stroke="#78350F" strokeWidth="1.5" strokeLinecap="round" />
    <circle cx="27" cy="12" r="1.2" fill="#78350F" />
    <path d="M22 22C23 24 25 25 27 24" stroke="#78350F" strokeWidth="1.5" strokeLinecap="round" />
    <circle cx="27" cy="24" r="1.2" fill="#78350F" />
  </svg>
);

type FontScale = 'compact' | 'normal' | 'large';

export const AdvertisementUpperScreen: React.FC<{
  onBack: () => void;
}> = ({ onBack }) => {
  const { settings, updateArticleImage, setIsAdminOpen } = useApp();
  const article = settings.article;
  const questions = settings.questions;

  // Active question state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  
  // Layout mode: 'split' (iPad-friendly side-by-side) or 'stacked' (top-bottom)
  const [layoutMode, setLayoutMode] = useState<'split' | 'stacked'>('split');
  
  // Font scale mode for fitting iPad without scrolling
  const [fontScale, setFontScale] = useState<FontScale>('compact');

  // Placed Word Blocks state per question (Array of block strings in order)
  const [placedBlocks, setPlacedBlocks] = useState<Record<string, string[]>>({});
  
  // Custom manual typing input state (Optional fallback)
  const [manualInputMode, setManualInputMode] = useState<Record<string, boolean>>({});
  const [manualAnswers, setManualAnswers] = useState<Record<string, string>>({});

  // 🔍 Interactive Clue Scavenger & Discovery state
  // tracks whether the glowing candidates mode is active
  const [investigationActive, setInvestigationActive] = useState<Record<string, boolean>>({
    'q-14': true,
    'q-15': true,
  });
  // tracks whether correct clue has been found, unlocking the word blocks
  const [unlockedClues, setUnlockedClues] = useState<Record<string, boolean>>({
    'q-11': false,
    'q-12': false,
    'q-13': true,
    'q-14': false,
    'q-15': false,
  });
  // tracks discovered correct clues IDs per question
  const [foundClueIds, setFoundClueIds] = useState<Record<string, string[]>>({});
  // active feedback for clicked candidate
  const [candidateFeedback, setCandidateFeedback] = useState<{
    qId: string;
    cId: string;
    text: string;
    isCorrect: boolean;
    feedback: string;
    label?: string;
  } | null>(null);

  // Ordering Q13 state
  const [orderingAnswers, setOrderingAnswers] = useState<Record<string, number | null>>({
    'ord-1': 1,
    'ord-2': null,
    'ord-3': null,
    'ord-4': null,
  });

  // Evaluation & feedback state
  const [checkedAnswers, setCheckedAnswers] = useState<
    Record<string, { isMatch: boolean; score: number; feedbackMsg?: string }>
  >({});
  const [showSampleAnswer, setShowSampleAnswer] = useState<Record<string, boolean>>({});
  const [wrongAttempts, setWrongAttempts] = useState<Record<string, number>>({});
  const [shakeQuestionId, setShakeQuestionId] = useState<string | null>(null);

  // Dragging state for word blocks
  const [draggedBlockInfo, setDraggedBlockInfo] = useState<{
    qId: string;
    text: string;
    source: 'bank' | 'answer';
    index?: number;
  } | null>(null);

  // Fairy Dust & Glowing Clue State
  const [fairyDustActive, setFairyDustActive] = useState<boolean>(false);
  const [fairyStartPos, setFairyStartPos] = useState<{ x: number; y: number } | null>(null);
  const [fairyTargetPos, setFairyTargetPos] = useState<{ x: number; y: number } | null>(null);
  const [glowingClueParagraph, setGlowingClueParagraph] = useState<number | 'all' | null>(null);

  // Article speech reading state
  const [isReadingAloud, setIsReadingAloud] = useState<boolean>(false);
  const [activeReadingParagraph, setActiveReadingParagraph] = useState<number | null>(null);

  // Image editing popover state
  const [isEditingImage, setIsEditingImage] = useState<boolean>(false);
  const [tempImageUrl, setTempImageUrl] = useState<string>(article.imageUrl || '');
  const [soundMuted, setSoundMuted] = useState<boolean>(!settings.soundEnabled);

  // Score pop badge state
  const [poppingScore, setPoppingScore] = useState<{ qId: string; marks: number } | null>(null);

  // References
  const beeButtonRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const glowTimerRef = useRef<NodeJS.Timeout | null>(null);
  const articleScrollRef = useRef<HTMLDivElement | null>(null);

  const activeQuestion = questions[currentQuestionIndex] || questions[0];

  useEffect(() => {
    return () => {
      if (glowTimerRef.current) clearTimeout(glowTimerRef.current);
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // When question changes, clear stale candidate feedback bubble if from another question
  useEffect(() => {
    if (candidateFeedback && candidateFeedback.qId !== activeQuestion.id) {
      setCandidateFeedback(null);
    }
  }, [activeQuestion.id, candidateFeedback]);

  const totalScore = (
    Object.values(checkedAnswers) as Array<{ isMatch: boolean; score: number }>
  ).reduce((sum, a) => sum + (a.isMatch ? a.score : 0), 0);
  const totalPossibleMarks = questions.reduce((sum, q) => sum + q.marks, 0);
  const isAllCorrect = questions.length > 0 && questions.every((q) => checkedAnswers[q.id]?.isMatch);

  // Trigger celebration confetti when all correct
  useEffect(() => {
    if (isAllCorrect) {
      sound.playCelebration();
      try {
        confetti({
          particleCount: 160,
          spread: 100,
          origin: { y: 0.5 },
          colors: ['#F59E0B', '#10B981', '#3B82F6', '#EC4899', '#8B5CF6', '#FBBF24'],
        });
      } catch {
        // ignore
      }
    }
  }, [isAllCorrect]);

  const toggleSound = () => {
    const isNowMuted = sound.toggleMute();
    setSoundMuted(isNowMuted);
    if (!isNowMuted) {
      sound.playPop();
    }
  };

  // Text-to-speech for whole article or single paragraph
  const handleReadParagraph = (text: string, pIdx: number) => {
    if (isReadingAloud && activeReadingParagraph === pIdx) {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setIsReadingAloud(false);
      setActiveReadingParagraph(null);
      return;
    }

    sound.playPop();
    setIsReadingAloud(true);
    setActiveReadingParagraph(pIdx);
    sound.speakChineseText(text);

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const checkSpeechInterval = setInterval(() => {
        if (!window.speechSynthesis.speaking) {
          setIsReadingAloud(false);
          setActiveReadingParagraph(null);
          clearInterval(checkSpeechInterval);
        }
      }, 500);
    }
  };

  // Sub-pixel coordinate finder for clue elements in the article
  const getClueTargetCoordinates = useCallback((clueTargetParagraph: number | 'all') => {
    let domId = 'article-title';
    if (typeof clueTargetParagraph === 'number') {
      domId = `article-paragraph-${clueTargetParagraph}`;
    } else {
      domId = 'article-container';
    }

    const element = document.getElementById(domId);
    if (!element) return { x: window.innerWidth * 0.3, y: 180 };

    const rect = element.getBoundingClientRect();
    return {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    };
  }, []);

  // Trigger fairy dust animation and activate candidate discovery mode
  const triggerHint = (q: WorksheetQuestion, buttonElem: HTMLButtonElement | null) => {
    if (fairyDustActive) return;

    // Activate candidate investigation in article
    setInvestigationActive((prev) => ({
      ...prev,
      [q.id]: true,
    }));

    sound.playBeeBuzz();
    setTimeout(() => {
      sound.playFairyDust();
    }, 120);

    let start = { x: window.innerWidth * 0.8, y: window.innerHeight * 0.7 };
    if (buttonElem) {
      const rect = buttonElem.getBoundingClientRect();
      start = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      };
    }

    const target = getClueTargetCoordinates(q.clueTargetParagraph);

    const targetElemId = typeof q.clueTargetParagraph === 'number'
      ? `article-paragraph-${q.clueTargetParagraph}`
      : 'article-container';
    const targetElem = document.getElementById(targetElemId);
    if (targetElem) {
      targetElem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    setFairyStartPos(start);
    setFairyTargetPos(target);
    setFairyDustActive(true);
  };

  const handleFairyDustArrival = () => {
    setFairyDustActive(false);
    if (!activeQuestion) return;

    sound.playChime();
    setGlowingClueParagraph(activeQuestion.clueTargetParagraph);

    if (glowTimerRef.current) clearTimeout(glowTimerRef.current);
    glowTimerRef.current = setTimeout(() => {
      setGlowingClueParagraph(null);
    }, 12000);
  };

  // Student clicks on a candidate sentence in the article
  const handleCandidateClueClick = (clue: CandidateClue, q: WorksheetQuestion) => {
    sound.playPop();

    setCandidateFeedback({
      qId: q.id,
      cId: clue.id,
      text: clue.text,
      isCorrect: clue.isCorrect,
      feedback: clue.feedback,
      label: clue.label,
    });

    if (clue.isCorrect) {
      sound.playChime();
      try {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#10B981', '#34D399', '#F59E0B', '#FBBF24'],
        });
      } catch {
        // ignore
      }

      setFoundClueIds((prev) => ({
        ...prev,
        [q.id]: Array.from(new Set([...(prev[q.id] || []), clue.id])),
      }));

      // Unlock Word Blocks for this question!
      setUnlockedClues((prev) => ({
        ...prev,
        [q.id]: true,
      }));
    } else {
      sound.playWrong();
    }
  };

  // Directly unlock word blocks if student wants to bypass clue search
  const handleDirectUnlockBlocks = (qId: string) => {
    sound.playChime();
    setUnlockedClues((prev) => ({
      ...prev,
      [qId]: true,
    }));
  };

  // Stable shuffled block pool per question to ensure answers and distractors are randomized
  const shuffledBlockPools = useMemo(() => {
    const pools: Record<string, string[]> = {};
    questions.forEach((q) => {
      const base = q.wordBlocks || [];
      const distractors = q.distractorBlocks || [];
      const combined = Array.from(new Set([...base, ...distractors]));

      // Deterministic pseudo-random shuffle per question
      const shuffled = [...combined];
      let seed = 127;
      for (let i = 0; i < q.id.length; i++) {
        seed = (seed * 37 + q.id.charCodeAt(i)) % 65536;
      }
      for (let i = 0; i < (q.questionText || '').length; i++) {
        seed = (seed * 31 + q.questionText.charCodeAt(i)) % 65536;
      }
      for (let i = shuffled.length - 1; i > 0; i--) {
        seed = (seed * 9301 + 49297) % 233280;
        const rnd = seed / 233280;
        const j = Math.floor(rnd * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      pools[q.id] = shuffled;
    });
    return pools;
  }, [questions]);

  // Get available word pool blocks (wordBlocks + distractors) for a question
  const getQuestionBlockPool = (q: WorksheetQuestion): string[] => {
    return shuffledBlockPools[q.id] || Array.from(new Set([...(q.wordBlocks || []), ...(q.distractorBlocks || [])]));
  };

  // Get current answer string for evaluation
  const getCombinedAnswerText = (q: WorksheetQuestion): string => {
    if (manualInputMode[q.id]) {
      return (manualAnswers[q.id] || '').trim();
    }
    const blocks = placedBlocks[q.id] || [];
    if (q.type === 'two_reasons') {
      return blocks.join('；');
    }
    return blocks.join('');
  };

  // Add block to answer line
  const handleAddBlockToAnswer = (qId: string, blockText: string, isTwoReasons?: boolean) => {
    sound.playPop();
    setPlacedBlocks((prev) => {
      const current = prev[qId] || [];

      if (isTwoReasons) {
        if (current.includes(blockText)) {
          // Toggle off if already placed
          return {
            ...prev,
            [qId]: current.filter((t) => t !== blockText),
          };
        }
        if (current.length < 2) {
          return {
            ...prev,
            [qId]: [...current, blockText],
          };
        }
        return {
          ...prev,
          [qId]: [current[0], blockText],
        };
      }

      return {
        ...prev,
        [qId]: [...current, blockText],
      };
    });

    if (checkedAnswers[qId]?.isMatch === false) {
      setCheckedAnswers((prev) => {
        const next = { ...prev };
        delete next[qId];
        return next;
      });
    }
  };

  // Remove block from answer line
  const handleRemoveBlockFromAnswer = (qId: string, indexToRemove: number) => {
    sound.playPop();
    setPlacedBlocks((prev) => {
      const current = prev[qId] || [];
      const updated = current.filter((_, idx) => idx !== indexToRemove);
      return {
        ...prev,
        [qId]: updated,
      };
    });

    if (checkedAnswers[qId]?.isMatch === false) {
      setCheckedAnswers((prev) => {
        const next = { ...prev };
        delete next[qId];
        return next;
      });
    }
  };

  // Move block left/right in answer line
  const handleShiftBlock = (qId: string, index: number, direction: 'left' | 'right') => {
    sound.playPop();
    setPlacedBlocks((prev) => {
      const current = [...(prev[qId] || [])];
      const targetIndex = direction === 'left' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= current.length) return prev;

      const temp = current[index];
      current[index] = current[targetIndex];
      current[targetIndex] = temp;
      return {
        ...prev,
        [qId]: current,
      };
    });
  };

  // Clear all blocks for a question
  const handleClearBlocks = (qId: string) => {
    sound.playPop();
    setPlacedBlocks((prev) => ({
      ...prev,
      [qId]: [],
    }));
    if (checkedAnswers[qId]?.isMatch === false) {
      setCheckedAnswers((prev) => {
        const next = { ...prev };
        delete next[qId];
        return next;
      });
    }
  };

  // Drag and drop handlers
  const handleDragStartFromBank = (qId: string, blockText: string) => {
    setDraggedBlockInfo({ qId, text: blockText, source: 'bank' });
  };

  const handleDragStartFromAnswer = (qId: string, blockText: string, index: number) => {
    setDraggedBlockInfo({ qId, text: blockText, source: 'answer', index });
  };

  // Drop on standard answer line
  const handleDropOnAnswerLine = (qId: string, targetIndex?: number) => {
    if (!draggedBlockInfo || draggedBlockInfo.qId !== qId) return;

    sound.playPop();
    setPlacedBlocks((prev) => {
      const current = [...(prev[qId] || [])];

      if (draggedBlockInfo.source === 'bank') {
        if (typeof targetIndex === 'number') {
          current.splice(targetIndex, 0, draggedBlockInfo.text);
        } else {
          current.push(draggedBlockInfo.text);
        }
      } else if (draggedBlockInfo.source === 'answer' && typeof draggedBlockInfo.index === 'number') {
        const [movedItem] = current.splice(draggedBlockInfo.index, 1);
        if (typeof targetIndex === 'number') {
          current.splice(targetIndex, 0, movedItem);
        } else {
          current.push(movedItem);
        }
      }

      return {
        ...prev,
        [qId]: current,
      };
    });

    setDraggedBlockInfo(null);
  };

  // Drop on welded reason slots (Slot 0 for Reason 1, Slot 1 for Reason 2)
  const handleDropOnReasonSlot = (qId: string, slotIndex: 0 | 1) => {
    if (!draggedBlockInfo || draggedBlockInfo.qId !== qId) return;
    sound.playPop();
    setPlacedBlocks((prev) => {
      const current = [...(prev[qId] || [])];
      const text = draggedBlockInfo.text;

      if (slotIndex === 0) {
        const remaining = current.filter((t) => t !== text);
        return {
          ...prev,
          [qId]: [text, remaining[0] || ''].filter(Boolean),
        };
      } else {
        const first = current[0] && current[0] !== text ? current[0] : (current[1] && current[1] !== text ? current[1] : '');
        return {
          ...prev,
          [qId]: [first, text].filter(Boolean),
        };
      }
    });
    setDraggedBlockInfo(null);
  };

  // Evaluate single question answer
  const handleCheckAnswer = (q: WorksheetQuestion) => {
    // Q13 Ordering Evaluation
    if (q.type === 'ordering') {
      const isComplete = (q.orderingItems || []).every((item) => orderingAnswers[item.id] !== null);
      if (!isComplete) {
        sound.playWrong();
        setShakeQuestionId(q.id);
        setTimeout(() => setShakeQuestionId(null), 500);
        return;
      }

      const isAllCorrectOrder = (q.orderingItems || []).every(
        (item) => orderingAnswers[item.id] === item.correctOrder
      );

      if (isAllCorrectOrder) {
        sound.playChime();
        setCheckedAnswers((prev) => ({
          ...prev,
          [q.id]: { isMatch: true, score: q.marks },
        }));
        setPoppingScore({ qId: q.id, marks: q.marks });
        setTimeout(() => setPoppingScore(null), 2500);

        if (currentQuestionIndex < questions.length - 1) {
          setTimeout(() => {
            setCurrentQuestionIndex((prev) => prev + 1);
          }, 1200);
        }
      } else {
        sound.playWrong();
        setShakeQuestionId(q.id);
        setTimeout(() => setShakeQuestionId(null), 500);
        setWrongAttempts((prev) => ({ ...prev, [q.id]: (prev[q.id] || 0) + 1 }));
        setCheckedAnswers((prev) => ({
          ...prev,
          [q.id]: { isMatch: false, score: 0 },
        }));
      }
      return;
    }

    // Text & Written Questions Evaluation
    const rawAnswer = getCombinedAnswerText(q);
    const answer = rawAnswer.toLowerCase();

    if (!answer) {
      sound.playWrong();
      setShakeQuestionId(q.id);
      setTimeout(() => setShakeQuestionId(null), 500);
      return;
    }

    let isMatch = false;

    // 1. Q11: Exact Word extraction ("分工合作")
    if (q.number === 11) {
      isMatch = answer.includes('分工合作');
    }
    // 2. Q12: Two reasons (漏斗太小/溅出 + 落叶堵塞)
    else if (q.number === 12 || q.type === 'two_reasons') {
      const placed = placedBlocks[q.id] || [];
      const hasReason1 = /漏斗太小|太小|溅到桶外|溅出|洒出/i.test(answer);
      const hasReason2 = /落叶|堵住|堵塞|入口/i.test(answer);
      const hasDistractor = /破了一个大洞|破洞|蒸发|没有用量杯|忘记/i.test(answer);
      if (manualInputMode[q.id]) {
        isMatch = hasReason1 && hasReason2 && !hasDistractor;
      } else {
        isMatch = placed.length >= 2 && hasReason1 && hasReason2 && !hasDistractor;
      }
    }
    // 3. Q14: Character Trait + Example (嘉恩是怎样的人)
    else if (q.number === 14) {
      const hasTrait = /观察|细心|动脑|脑筋|聪明|不放弃|坚持|环保|负责|责任|解决|想办法|尝试|毅力/i.test(answer);
      const hasExample = /浇水|水流走|流走|留下来|雨水|记录|设计图|扩大|接水面|细网|刻度|量杯|改良/i.test(answer);
      const hasDistractor = /马上放弃|不肯和同学|自己玩/i.test(answer);
      isMatch = hasTrait && hasExample && !hasDistractor;
    }
    // 4. Q15: Insight reflection (“失败并不等于停止”启示)
    else if (q.number === 15) {
      const hasInsight = /不要放弃|不放弃|不灰心|坚持|克服|面对失败|不气馁|勇于|努力/i.test(answer);
      const hasAction = /观察|找出原因|原因|调整|改进|改良|解决|方法|成功/i.test(answer);
      const hasDistractor = /完全没有用|立刻停止|不要再去尝试|不应该花时间/i.test(answer);
      isMatch = hasInsight && hasAction && !hasDistractor;
    }

    // Fallback keyword matching
    if (!isMatch && q.acceptableKeywords && q.acceptableKeywords.length > 0) {
      isMatch = q.acceptableKeywords.some((kw) => answer.includes(kw.trim().toLowerCase()));
    }

    if (isMatch) {
      sound.playChime();
      setCheckedAnswers((prev) => ({
        ...prev,
        [q.id]: { isMatch: true, score: q.marks },
      }));

      setPoppingScore({ qId: q.id, marks: q.marks });
      setTimeout(() => setPoppingScore(null), 2500);

      if (currentQuestionIndex < questions.length - 1) {
        setTimeout(() => {
          setCurrentQuestionIndex((prev) => prev + 1);
        }, 1200);
      }
    } else {
      sound.playWrong();
      setShakeQuestionId(q.id);
      setTimeout(() => setShakeQuestionId(null), 500);

      setWrongAttempts((prev) => ({
        ...prev,
        [q.id]: (prev[q.id] || 0) + 1,
      }));

      setCheckedAnswers((prev) => ({
        ...prev,
        [q.id]: { isMatch: false, score: 0 },
      }));
    }
  };

  const handleResetAll = () => {
    sound.playPop();
    setPlacedBlocks({});
    setManualAnswers({});
    setOrderingAnswers({
      'ord-1': 1,
      'ord-2': null,
      'ord-3': null,
      'ord-4': null,
    });
    setCheckedAnswers({});
    setShowSampleAnswer({});
    setWrongAttempts({});
    setGlowingClueParagraph(null);
    setCandidateFeedback(null);
    setFoundClueIds({});
    setUnlockedClues({
      'q-11': false,
      'q-12': false,
      'q-13': true,
      'q-14': false,
      'q-15': false,
    });
    setCurrentQuestionIndex(0);
  };

  // Dynamic typography scale helpers to fit iPad view without scrolling
  const getArticleTextClass = () => {
    switch (fontScale) {
      case 'compact':
        return 'text-xs sm:text-sm leading-relaxed text-slate-900 font-medium tracking-normal indent-6';
      case 'large':
        return 'text-base sm:text-lg leading-relaxed text-slate-900 font-medium tracking-wide indent-8';
      case 'normal':
      default:
        return 'text-sm sm:text-base leading-relaxed text-slate-900 font-medium tracking-normal indent-7';
    }
  };

  const getQuestionTextClass = () => {
    switch (fontScale) {
      case 'compact':
        return 'text-sm sm:text-base md:text-lg font-black text-slate-900 leading-relaxed';
      case 'large':
        return 'text-lg sm:text-xl md:text-2xl font-black text-slate-900 leading-relaxed';
      case 'normal':
      default:
        return 'text-base sm:text-lg md:text-xl font-black text-slate-900 leading-relaxed';
    }
  };

  const getBlockPillClass = () => {
    switch (fontScale) {
      case 'compact':
        return 'text-xs sm:text-xs py-1 px-2.5';
      case 'large':
        return 'text-sm sm:text-base py-2 px-3.5';
      case 'normal':
      default:
        return 'text-xs sm:text-sm py-1.5 px-3';
    }
  };

  // Helper to render paragraph with glowing candidate sentences
  const renderParagraphContent = (p: { id: string; pIndex: number; text: string }) => {
    const isParagraphTargeted =
      glowingClueParagraph === p.pIndex || glowingClueParagraph === 'all';

    const isInvestigationOn = !!investigationActive[activeQuestion.id];
    const candidateCluesInP = (activeQuestion.candidateClues || []).filter(
      (c) => c.pIndex === p.pIndex
    );

    // If candidate clue exploration is active and paragraph contains candidates:
    // Render text with glowing, clickable candidate spans
    let paragraphContentNode: React.ReactNode = p.text;

    if (isInvestigationOn && candidateCluesInP.length > 0) {
      // Find candidate spans in paragraph text
      let remainingText = p.text;
      const segments: React.ReactNode[] = [];

      // Sort candidate clues by their appearance in the text
      const sortedCandidates = [...candidateCluesInP].sort(
        (a, b) => p.text.indexOf(a.text) - p.text.indexOf(b.text)
      );

      sortedCandidates.forEach((candidate, idx) => {
        const foundIndex = remainingText.indexOf(candidate.text);
        if (foundIndex !== -1) {
          // Preceding text before the candidate
          if (foundIndex > 0) {
            segments.push(remainingText.substring(0, foundIndex));
          }

          const isFoundCorrect = (foundClueIds[activeQuestion.id] || []).includes(candidate.id);
          const isCurrentSelected = candidateFeedback?.cId === candidate.id;

          // Glowing candidate button span
          segments.push(
            <button
              key={`${candidate.id}-${idx}`}
              type="button"
              onClick={() => handleCandidateClueClick(candidate, activeQuestion)}
              className={`inline-flex items-center gap-1 mx-1 my-0.5 px-2 py-0.5 rounded-lg font-black transition-all cursor-pointer select-none text-left leading-normal ${
                isFoundCorrect
                  ? 'bg-emerald-100/95 text-emerald-950 border-2 border-emerald-500 ring-2 ring-emerald-300 shadow-sm'
                  : isCurrentSelected && !candidate.isCorrect
                  ? 'bg-red-100 text-red-950 border-2 border-red-500 ring-2 ring-red-200 animate-shake'
                  : 'bg-gradient-to-r from-yellow-200/95 via-amber-200/95 to-yellow-200/95 text-amber-950 border-2 border-dashed border-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.45)] hover:border-amber-600 hover:scale-[1.02] active:scale-98 animate-pulse'
              }`}
              title="点击检验此句子是否是正确证据！"
            >
              {isFoundCorrect ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0 inline" />
              ) : (
                <Search className="w-3 h-3 text-amber-700 shrink-0 inline animate-bounce" />
              )}
              <span className="underline decoration-amber-600 decoration-2 underline-offset-2">
                {candidate.text}
              </span>
              {isFoundCorrect && (
                <span className="text-[10px] font-black bg-emerald-600 text-white px-1.5 py-0.2 rounded-full shrink-0 ml-1">
                  关键证据
                </span>
              )}
            </button>
          );

          remainingText = remainingText.substring(foundIndex + candidate.text.length);
        }
      });

      if (remainingText) {
        segments.push(remainingText);
      }

      paragraphContentNode = segments;
    }

    return (
      <div
        key={p.id}
        id={`article-paragraph-${p.pIndex}`}
        className={`relative transition-all duration-300 rounded-xl p-2 sm:p-2.5 ${
          isParagraphTargeted
            ? 'bg-amber-100/90 ring-2 ring-amber-400 shadow-sm'
            : 'hover:bg-amber-50/60'
        }`}
      >
        <div className="flex items-center justify-between gap-1 mb-1">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] sm:text-xs font-black text-amber-950 bg-amber-200/90 px-2 py-0.5 rounded-full select-none shadow-2xs">
              第 {p.pIndex} 段
            </span>
            {isInvestigationOn && candidateCluesInP.length > 0 && (
              <span className="text-[10px] font-black text-amber-900 bg-yellow-300/80 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                <Search className="w-2.5 h-2.5 text-amber-800" />
                <span>{candidateCluesInP.length} 处证据候选</span>
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={() => handleReadParagraph(p.text, p.pIndex)}
            className="px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-bold text-amber-900 bg-amber-100 hover:bg-amber-200 transition cursor-pointer flex items-center gap-1 shadow-2xs"
            title="朗读本段"
          >
            <Volume2 className="w-3 h-3 text-amber-800" />
            <span>朗读</span>
          </button>
        </div>

        {/* Scalable, comfortable reading typography */}
        <p className={getArticleTextClass()}>
          {paragraphContentNode}
        </p>

        {/* Animated Red Pen Underline if targeted by fairy dust */}
        {isParagraphTargeted && (
          <div className="mt-1.5 w-full h-[3px] bg-[#DC2626] rounded-full origin-left animate-draw-red-line pointer-events-none shadow-[0_1px_3px_rgba(220,38,38,0.4)]" />
        )}
      </div>
    );
  };

  // Render question interactive workspace
  const renderQuestionBlockWorkspace = (q: WorksheetQuestion) => {
    const isCorrect = checkedAnswers[q.id]?.isMatch;
    const isManual = !!manualInputMode[q.id];
    const currentPlaced = placedBlocks[q.id] || [];
    const pool = getQuestionBlockPool(q);
    const assembledText = getCombinedAnswerText(q);
    const pillPadding = getBlockPillClass();

    const hasCandidateClues = (q.candidateClues || []).length > 0;
    const isClueUnlocked = !!unlockedClues[q.id];
    const isInvestigationOn = !!investigationActive[q.id];

    // Q13 Ordering View
    if (q.type === 'ordering') {
      return (
        <div className="space-y-2 mt-1.5">
          <div className="bg-amber-50/90 border border-amber-200 rounded-xl p-2.5">
            <div className="text-[11px] sm:text-xs text-amber-900 font-bold mb-2 flex items-center gap-1">
              <MoveHorizontal className="w-3.5 h-3.5 text-amber-700" />
              <span>请选择事件发生的先后次序 (1、2、3、4)：</span>
            </div>

            <div className="space-y-1.5">
              {(q.orderingItems || []).map((item) => (
                <div
                  key={item.id}
                  className={`flex items-center gap-2 p-2 rounded-xl border transition-all ${
                    orderingAnswers[item.id] === item.correctOrder && isCorrect
                      ? 'bg-emerald-50 border-emerald-400'
                      : 'bg-white border-amber-200 shadow-2xs'
                  }`}
                >
                  {/* Number Selector / Pill */}
                  {item.isPreFilled ? (
                    <div className="w-10 h-7 flex items-center justify-center font-black text-slate-700 bg-slate-200 rounded-lg border border-slate-300 text-xs shrink-0">
                      ( 1 )
                    </div>
                  ) : (
                    <div className="flex items-center gap-0.5 shrink-0">
                      <span className="font-bold text-xs text-amber-900">(</span>
                      <select
                        value={orderingAnswers[item.id] || ''}
                        onChange={(e) => {
                          const val = e.target.value ? parseInt(e.target.value, 10) : null;
                          setOrderingAnswers((prev) => ({ ...prev, [item.id]: val }));
                          if (checkedAnswers[q.id]?.isMatch === false) {
                            setCheckedAnswers((prev) => {
                              const next = { ...prev };
                              delete next[q.id];
                              return next;
                            });
                          }
                        }}
                        disabled={isCorrect}
                        className={`w-9 h-7 px-0.5 text-center font-black text-xs border rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer ${
                          isCorrect
                            ? 'bg-emerald-100 border-emerald-500 text-emerald-950'
                            : 'bg-amber-50 border-amber-400 text-amber-950 hover:bg-amber-100'
                        }`}
                      >
                        <option value="">-</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="4">4</option>
                      </select>
                      <span className="font-bold text-xs text-amber-900">)</span>
                    </div>
                  )}

                  <span className="text-xs sm:text-sm font-semibold text-slate-800 flex-1 leading-tight">
                    {item.text}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-2 flex items-center justify-between pt-1.5 border-t border-amber-200 text-xs">
              <span className="text-[11px] text-amber-800 font-bold">
                💡 提示：第一项为已知(1)，请排列(2)(3)(4)。
              </span>

              {!isCorrect ? (
                <button
                  type="button"
                  onClick={() => handleCheckAnswer(q)}
                  className="px-3.5 py-1 bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-black text-xs rounded-lg shadow-sm transition cursor-pointer"
                >
                  核对排序
                </button>
              ) : (
                <div className="flex items-center gap-1 text-emerald-600 font-black text-xs">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>排序正确！+{q.marks} 分</span>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    // =========================================================================
    // 🔍 STAGE 1: ACTIVE CLUE DISCOVERY & SCAVENGER MODE (BEFORE UNLOCKING BLOCKS)
    // (Especially for Q14 Character Trait & Q15 Reflection, and Q11, Q12)
    // =========================================================================
    if (hasCandidateClues && !isClueUnlocked && !isManual && !isCorrect) {
      return (
        <div className="space-y-2 mt-1">
          {/* Top Mission Briefing Card */}
          <div className="bg-amber-50/95 border-2 border-amber-300 rounded-xl p-2.5 sm:p-3 shadow-xs space-y-2">
            <div className="flex items-center justify-between gap-1">
              <div className="flex items-center gap-1.5 text-amber-950 font-black text-xs sm:text-sm">
                <Search className="w-4 h-4 text-amber-700" />
                <span>
                  {q.type === 'trait_evidence'
                    ? '探案任务：寻找【嘉恩品质特点与行动证据】'
                    : q.type === 'insight_reflection'
                    ? '探案任务：寻找【“失败并不等于停止”核心启示】'
                    : '探案任务：在文章中寻找关键证据'}
                </span>
              </div>

              <button
                type="button"
                onClick={() => handleDirectUnlockBlocks(q.id)}
                className="text-[10px] text-amber-800 hover:text-amber-950 font-bold underline cursor-pointer"
                title="跳过探寻，直接显示词句积木"
              >
                直接解锁积木
              </button>
            </div>

            <p className="text-xs text-amber-900 leading-normal font-medium">
              左侧文章中所有可能的答案句子已经发光亮起 ✨！请仔细阅读并在左侧文章中<b>点击真正的关键证据</b>。一旦点击正确，魔法词句积木就会为你解锁！
            </p>

            {/* If Bee Hint Not Triggered Yet, Big Action Button */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => triggerHint(q, beeButtonRefs.current[q.id])}
                className="px-3 py-1.5 bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-500 hover:to-yellow-500 text-amber-950 font-black text-xs rounded-xl shadow-2xs transition flex items-center gap-1.5 cursor-pointer hover:scale-102 active:scale-98"
              >
                <BeeHintIcon className="w-4 h-4" />
                <span>{isInvestigationOn ? '再次呼唤蜜蜂金粉指引 🐝' : '点亮文章中的可能答案 🐝'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  sound.playPop();
                  setManualInputMode((prev) => ({ ...prev, [q.id]: true }));
                }}
                className="px-2.5 py-1.5 bg-white hover:bg-amber-50 text-amber-900 border border-amber-300 font-bold text-xs rounded-xl transition flex items-center gap-1 cursor-pointer"
              >
                <Edit3 className="w-3 h-3 text-amber-700" />
                <span>换为键盘手写</span>
              </button>
            </div>

            {/* Real-time Candidate Feedback coaching box */}
            <AnimatePresence>
              {candidateFeedback && candidateFeedback.qId === q.id && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={`p-2 rounded-xl text-xs space-y-1 border ${
                    candidateFeedback.isCorrect
                      ? 'bg-emerald-50 border-emerald-400 text-emerald-950 font-bold'
                      : 'bg-red-50 border-red-300 text-red-950 font-medium'
                  }`}
                >
                  <div className="flex items-center gap-1 font-black">
                    {candidateFeedback.isCorrect ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>恭喜！找到了正确关键线索：</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-3.5 h-3.5 text-red-600" />
                        <span>提示与思考点：</span>
                      </>
                    )}
                  </div>
                  <div className="text-[11px] leading-relaxed pl-1">
                    {candidateFeedback.feedback}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Locked Word Blocks Placeholder Teaser */}
          <div className="p-3 rounded-xl border-2 border-dashed border-amber-300 bg-amber-50/40 text-center space-y-1.5">
            <div className="flex items-center justify-center gap-1.5 text-amber-900 font-black text-xs">
              <KeyRound className="w-4 h-4 text-amber-600" />
              <span>词句积木库处于锁定状态 🔒</span>
            </div>
            <p className="text-[11px] text-amber-800">
              在左侧文章中点击正确发光的关键句子后，积木方块即可立即解锁！
            </p>
          </div>
        </div>
      );
    }

    // =========================================================================
    // 🧩 STAGE 2: WORD BLOCKS ASSEMBLY & MANUAL SUBMISSION WORKSPACE
    // =========================================================================
    return (
      <div className="space-y-2 mt-1">
        {/* If successfully unlocked from clue finding, show celebration banner */}
        {hasCandidateClues && isClueUnlocked && (
          <div className="bg-emerald-50/90 border border-emerald-300 rounded-xl px-2.5 py-1.5 flex items-center justify-between gap-1 text-[11px]">
            <div className="flex items-center gap-1 text-emerald-900 font-black">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>已锁定文章关键证据！词句积木已解锁，请开始拼装答卷。</span>
            </div>
            <button
              type="button"
              onClick={() => {
                sound.playPop();
                setUnlockedClues((prev) => ({ ...prev, [q.id]: false }));
              }}
              className="text-emerald-800 hover:text-emerald-950 font-bold underline cursor-pointer text-[10px]"
            >
              重新寻宝
            </button>
          </div>
        )}

        {/* Mode switcher link */}
        <div className="flex items-center justify-between text-[11px] text-slate-600">
          <div className="flex items-center gap-1 text-amber-900 font-bold">
            <Layers className="w-3.5 h-3.5 text-amber-700" />
            <span>
              {isManual ? '键盘手写输入' : '词语积木（点击或拖动放入）'}
            </span>
          </div>

          <button
            type="button"
            onClick={() => {
              sound.playPop();
              setManualInputMode((prev) => ({
                ...prev,
                [q.id]: !prev[q.id],
              }));
            }}
            className="text-amber-800 hover:text-amber-950 font-bold underline cursor-pointer flex items-center gap-1"
          >
            <Edit3 className="w-3 h-3" />
            <span>{isManual ? '换为积木模式' : '换为键盘手写'}</span>
          </button>
        </div>

        {isManual ? (
          <div className="relative">
            <textarea
              rows={2}
              value={manualAnswers[q.id] || ''}
              disabled={isCorrect}
              onChange={(e) => {
                setManualAnswers({
                  ...manualAnswers,
                  [q.id]: e.target.value,
                });
                if (checkedAnswers[q.id]?.isMatch === false) {
                  setCheckedAnswers((prev) => {
                    const next = { ...prev };
                    delete next[q.id];
                    return next;
                  });
                }
              }}
              placeholder="直接输入答案内容……"
              className={`w-full p-2.5 font-medium text-xs sm:text-sm border-2 rounded-xl focus:outline-none transition leading-normal ${
                isCorrect
                  ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold'
                  : 'border-amber-400 focus:border-amber-600 bg-amber-50/40 text-slate-900'
              }`}
            />
          </div>
        ) : (
          <div className="space-y-2">
            {/* 1. ANSWER LINE: TWO REASONS WELDED SLOTS OR STANDARD ANSWER LINE */}
            {q.type === 'two_reasons' ? (
              <div className="space-y-2">
                {/* Welded Reason 1 Slot */}
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => handleDropOnReasonSlot(q.id, 0)}
                  className={`p-2 sm:p-2.5 rounded-xl border-2 transition-all flex flex-col gap-1.5 ${
                    isCorrect
                      ? 'bg-emerald-50/90 border-emerald-500 shadow-2xs'
                      : checkedAnswers[q.id]?.isMatch === false
                      ? 'bg-red-50/70 border-red-400'
                      : currentPlaced[0]
                      ? 'bg-amber-50/90 border-amber-400 ring-1 ring-amber-300 shadow-2xs'
                      : 'bg-amber-50/40 border-dashed border-amber-300'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1">
                    <div className="flex items-center gap-1.5">
                      <span className="px-2.5 py-0.5 rounded-md bg-amber-500 text-white font-black text-xs shadow-2xs">
                        原因一：
                      </span>
                      <span className="text-[11px] font-bold text-amber-900">
                        （第一处原因答题线）
                      </span>
                    </div>

                    {currentPlaced[0] && !isCorrect && (
                      <button
                        type="button"
                        onClick={() => handleRemoveBlockFromAnswer(q.id, 0)}
                        className="px-1.5 py-0.5 text-[10px] text-red-600 hover:bg-red-100 rounded font-bold transition flex items-center gap-0.5 cursor-pointer"
                        title="移出原因一"
                      >
                        <X className="w-3 h-3" />
                        <span>移出</span>
                      </button>
                    )}
                  </div>

                  {currentPlaced[0] ? (
                    <div
                      draggable={!isCorrect}
                      onDragStart={() => handleDragStartFromAnswer(q.id, currentPlaced[0], 0)}
                      className={`rounded-lg font-bold border p-2 flex items-center justify-between text-xs sm:text-sm shadow-2xs transition ${
                        isCorrect
                          ? 'bg-emerald-600 text-white border-emerald-700'
                          : 'bg-white text-amber-950 border-amber-400 hover:border-amber-500'
                      }`}
                    >
                      <span className="leading-snug">{currentPlaced[0]}</span>
                      {!isCorrect && (
                        <button
                          type="button"
                          onClick={() => handleRemoveBlockFromAnswer(q.id, 0)}
                          className="p-0.5 hover:bg-red-100 rounded text-red-500 cursor-pointer ml-1 shrink-0"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="py-2 px-3 text-center border border-dashed border-amber-300 rounded-lg text-xs text-amber-800/80 font-bold bg-amber-50/50">
                      📝 点击下方积木填入【原因一】
                    </div>
                  )}
                </div>

                {/* Welded Reason 2 Slot */}
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => handleDropOnReasonSlot(q.id, 1)}
                  className={`p-2 sm:p-2.5 rounded-xl border-2 transition-all flex flex-col gap-1.5 ${
                    isCorrect
                      ? 'bg-emerald-50/90 border-emerald-500 shadow-2xs'
                      : checkedAnswers[q.id]?.isMatch === false
                      ? 'bg-red-50/70 border-red-400'
                      : currentPlaced[1]
                      ? 'bg-amber-50/90 border-amber-400 ring-1 ring-amber-300 shadow-2xs'
                      : 'bg-amber-50/40 border-dashed border-amber-300'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1">
                    <div className="flex items-center gap-1.5">
                      <span className="px-2.5 py-0.5 rounded-md bg-amber-500 text-white font-black text-xs shadow-2xs">
                        原因二：
                      </span>
                      <span className="text-[11px] font-bold text-amber-900">
                        （第二处原因答题线）
                      </span>
                    </div>

                    {currentPlaced[1] && !isCorrect && (
                      <button
                        type="button"
                        onClick={() => handleRemoveBlockFromAnswer(q.id, 1)}
                        className="px-1.5 py-0.5 text-[10px] text-red-600 hover:bg-red-100 rounded font-bold transition flex items-center gap-0.5 cursor-pointer"
                        title="移出原因二"
                      >
                        <X className="w-3 h-3" />
                        <span>移出</span>
                      </button>
                    )}
                  </div>

                  {currentPlaced[1] ? (
                    <div
                      draggable={!isCorrect}
                      onDragStart={() => handleDragStartFromAnswer(q.id, currentPlaced[1], 1)}
                      className={`rounded-lg font-bold border p-2 flex items-center justify-between text-xs sm:text-sm shadow-2xs transition ${
                        isCorrect
                          ? 'bg-emerald-600 text-white border-emerald-700'
                          : 'bg-white text-amber-950 border-amber-400 hover:border-amber-500'
                      }`}
                    >
                      <span className="leading-snug">{currentPlaced[1]}</span>
                      {!isCorrect && (
                        <button
                          type="button"
                          onClick={() => handleRemoveBlockFromAnswer(q.id, 1)}
                          className="p-0.5 hover:bg-red-100 rounded text-red-500 cursor-pointer ml-1 shrink-0"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="py-2 px-3 text-center border border-dashed border-amber-300 rounded-lg text-xs text-amber-800/80 font-bold bg-amber-50/50">
                      📝 点击下方积木填入【原因二】
                    </div>
                  )}
                </div>

                {/* Real-time Preview for Reason 1 & Reason 2 */}
                {(currentPlaced[0] || currentPlaced[1]) && (
                  <div className="mt-1 pt-1 border-t border-amber-200/80 text-[11px] text-slate-800 space-y-0.5">
                    <span className="font-bold text-amber-900">完整作答呈现：</span>
                    {currentPlaced[0] && (
                      <div className="text-slate-900 bg-white/90 px-2 py-0.5 rounded border border-amber-200">
                        原因一：{currentPlaced[0]}
                      </div>
                    )}
                    {currentPlaced[1] && (
                      <div className="text-slate-900 bg-white/90 px-2 py-0.5 rounded border border-amber-200">
                        原因二：{currentPlaced[1]}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              /* Standard Single/Multi-Piece Answer Line for other questions */
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => handleDropOnAnswerLine(q.id)}
                className={`p-2 sm:p-2.5 rounded-xl border-2 min-h-[58px] transition-all flex flex-col justify-between ${
                  isCorrect
                    ? 'bg-emerald-50/90 border-emerald-500 shadow-2xs'
                    : checkedAnswers[q.id]?.isMatch === false
                    ? 'bg-red-50/70 border-red-400'
                    : currentPlaced.length > 0
                    ? 'bg-amber-50 border-amber-500 ring-1 ring-amber-200'
                    : 'bg-amber-50/30 border-dashed border-amber-300'
                }`}
              >
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="text-[11px] font-bold text-amber-900 flex items-center gap-1">
                    <span>📝 答题线：</span>
                    {currentPlaced.length === 0 && (
                      <span className="text-amber-700/80 font-normal">
                        (点击下方词句积木)
                      </span>
                    )}
                  </span>

                  {currentPlaced.length > 0 && !isCorrect && (
                    <button
                      type="button"
                      onClick={() => handleClearBlocks(q.id)}
                      className="px-1.5 py-0.5 text-[10px] text-red-600 hover:bg-red-100 rounded font-bold transition flex items-center gap-0.5 cursor-pointer"
                      title="清空答题线"
                    >
                      <RotateCcw className="w-2.5 h-2.5" />
                      <span>清空</span>
                    </button>
                  )}
                </div>

                {/* Placed Blocks container */}
                <div className="flex flex-wrap items-center gap-1.5 min-h-[32px]">
                  {currentPlaced.map((blockText, idx) => (
                    <div
                      key={`${blockText}-${idx}`}
                      draggable={!isCorrect}
                      onDragStart={() => handleDragStartFromAnswer(q.id, blockText, idx)}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.stopPropagation();
                        handleDropOnAnswerLine(q.id, idx);
                      }}
                      className={`group rounded-lg font-bold border shadow-2xs transition-all flex items-center gap-1 ${pillPadding} ${
                        isCorrect
                          ? 'bg-emerald-600 text-white border-emerald-700'
                          : 'bg-white text-amber-950 border-amber-400 hover:border-amber-600 cursor-grab active:cursor-grabbing'
                      }`}
                    >
                      <GripVertical className="w-3 h-3 text-amber-500 opacity-60 group-hover:opacity-100 shrink-0" />
                      <span className="truncate max-w-[240px] sm:max-w-none">{blockText}</span>

                      {!isCorrect && (
                        <div className="flex items-center gap-0.5 ml-0.5">
                          {idx > 0 && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleShiftBlock(q.id, idx, 'left');
                              }}
                              className="p-0.5 hover:bg-amber-100 rounded text-amber-800 cursor-pointer"
                              title="左移"
                            >
                              <ChevronLeft className="w-2.5 h-2.5" />
                            </button>
                          )}
                          {idx < currentPlaced.length - 1 && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleShiftBlock(q.id, idx, 'right');
                              }}
                              className="p-0.5 hover:bg-amber-100 rounded text-amber-800 cursor-pointer"
                              title="右移"
                            >
                              <ChevronRight className="w-2.5 h-2.5" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveBlockFromAnswer(q.id, idx);
                            }}
                            className="p-0.5 hover:bg-red-100 rounded text-red-500 cursor-pointer"
                            title="移回"
                          >
                            <X className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Real-time Assembled Sentence Preview */}
                {assembledText && (
                  <div className="mt-1.5 pt-1 border-t border-amber-200/80 text-[11px] text-slate-800 truncate">
                    <span className="font-bold text-amber-900">完整句：</span>
                    <span className="font-medium text-slate-900 bg-white/80 px-1.5 py-0.5 rounded border border-amber-200">
                      {assembledText}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* 2. AVAILABLE WORD/PHRASE BLOCKS POOL (TRAY) */}
            {!isCorrect && (
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-amber-100/50 border border-amber-200 rounded-xl p-2 sm:p-2.5 space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black text-amber-950 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-700" />
                    <span>可选词句积木库（已随机打乱，点击放入）：</span>
                  </span>
                  <span className="text-[10px] text-amber-800 font-bold">
                    {pool.length} 个备选
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {pool.map((blockText, bIdx) => {
                    const isAlreadyPlaced = currentPlaced.includes(blockText);

                    return (
                      <button
                        key={`${blockText}-${bIdx}`}
                        type="button"
                        draggable={!isAlreadyPlaced}
                        onDragStart={() => handleDragStartFromBank(q.id, blockText)}
                        onClick={() => handleAddBlockToAnswer(q.id, blockText, q.type === 'two_reasons')}
                        className={`rounded-lg font-bold border transition-all flex items-center gap-1 cursor-pointer shadow-2xs ${pillPadding} ${
                          isAlreadyPlaced
                            ? 'bg-amber-200/40 text-amber-900/40 border-amber-300 opacity-60'
                            : 'bg-white hover:bg-amber-50 text-amber-950 border-amber-300 hover:border-amber-500 hover:scale-102 active:scale-98'
                        }`}
                        title="点击直接添加"
                      >
                        <Plus className="w-3 h-3 text-amber-700 shrink-0" />
                        <span>{blockText}</span>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </div>
        )}

        {/* 3. SUBMIT & HINTS CONTROLS */}
        <div className="pt-1 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => {
              setShowSampleAnswer((prev) => ({
                ...prev,
                [q.id]: !prev[q.id],
              }));
              sound.playPop();
            }}
            className="text-[11px] font-bold text-amber-800 hover:text-amber-950 flex items-center gap-1 cursor-pointer"
          >
            <Lightbulb className="w-3 h-3 text-amber-600" />
            <span>{showSampleAnswer[q.id] ? '收起答案' : '查看参考答案'}</span>
          </button>

          {!isCorrect ? (
            <button
              type="button"
              id={`btn-check-${q.id}`}
              onClick={() => handleCheckAnswer(q)}
              className="px-4 py-1.5 bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-black text-xs sm:text-sm rounded-xl shadow-xs transition cursor-pointer"
            >
              核对答案
            </button>
          ) : (
            <div className="flex items-center gap-1 text-emerald-600 font-black text-xs sm:text-sm px-1">
              <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>+{q.marks} 分 (正确)</span>
            </div>
          )}
        </div>

        {/* Sample Answer Box */}
        <AnimatePresence>
          {showSampleAnswer[q.id] && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-1.5 p-2 bg-amber-50 border border-amber-300 rounded-lg text-xs space-y-1 text-slate-800"
            >
              <div className="font-bold text-amber-950 flex items-center gap-1 text-[11px]">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                <span>参考标准答案：</span>
              </div>
              <div className="whitespace-pre-line text-slate-900 font-medium pl-1 bg-white p-1.5 rounded border border-amber-200 text-xs">
                {q.sampleAnswer}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Feedback Alert if incorrect */}
        {checkedAnswers[q.id]?.isMatch === false && (
          <div className="flex items-center gap-1 text-[11px] text-red-600 font-bold mt-1">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>答案未完全匹配。请点击右上角 🐝 小蜜蜂查看段落线索！</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full h-full flex flex-col overflow-hidden select-none p-1.5 sm:p-2.5">
      {/* 🌟 FAIRY DUST FLIGHT ANIMATION OVERLAY 🌟 */}
      {fairyDustActive && (
        <FairyDustEffect
          startPos={fairyStartPos}
          targetPos={fairyTargetPos}
          getTargetPos={() => {
            if (!activeQuestion) return null;
            return getClueTargetCoordinates(activeQuestion.clueTargetParagraph);
          }}
          onComplete={handleFairyDustArrival}
        />
      )}

      {/* TOP COMPACT APP BAR */}
      <div className="bg-white/95 backdrop-blur-md border border-amber-300 rounded-xl px-2.5 py-1.5 shadow-2xs flex items-center justify-between gap-2 shrink-0 mb-2">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            id="btn-back-home"
            onClick={() => {
              sound.playPop();
              onBack();
            }}
            className="p-1.5 bg-amber-100 hover:bg-amber-200 text-amber-950 font-bold rounded-lg border border-amber-300 transition flex items-center gap-1 cursor-pointer shadow-2xs"
            title="返回首页"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-amber-900" />
            <span className="text-xs font-bold hidden sm:inline">首页</span>
          </button>

          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-black bg-amber-500 text-white px-2 py-0.5 rounded shadow-2xs">
              {article.section}
            </span>
            <span className="text-xs sm:text-sm font-black text-amber-950 truncate max-w-[140px] sm:max-w-xs">
              《{article.title}》
            </span>
          </div>
        </div>

        {/* Center Progress Step Switcher */}
        <div className="flex items-center gap-1">
          {questions.map((q, idx) => {
            const isCorrect = checkedAnswers[q.id]?.isMatch;
            const isSelected = currentQuestionIndex === idx;

            return (
              <button
                key={q.id}
                onClick={() => {
                  sound.playPop();
                  setCurrentQuestionIndex(idx);
                }}
                className={`w-6 h-6 sm:w-7 sm:h-7 rounded-lg text-xs font-black flex items-center justify-center transition cursor-pointer ${
                  isCorrect
                    ? 'bg-emerald-500 text-white shadow-2xs'
                    : isSelected
                    ? 'bg-amber-500 text-white ring-2 ring-amber-300 scale-105 shadow-2xs'
                    : 'bg-amber-100 text-amber-900 hover:bg-amber-200'
                }`}
                title={`第 ${q.number} 题`}
              >
                {isCorrect ? <Check className="w-3 h-3" /> : q.number}
              </button>
            );
          })}
        </div>

        {/* Right Controls: Font Scale, Layout Mode, Sound, Settings */}
        <div className="flex items-center gap-1 sm:gap-1.5">
          {/* Font Scaler (A- / A / A+) for iPad view */}
          <div className="flex items-center bg-amber-50 border border-amber-300 rounded-lg p-0.5">
            <button
              onClick={() => {
                sound.playPop();
                setFontScale('compact');
              }}
              className={`px-1.5 py-0.5 rounded text-[10px] font-black transition cursor-pointer ${
                fontScale === 'compact' ? 'bg-amber-500 text-white shadow-2xs' : 'text-amber-900 hover:bg-amber-100'
              }`}
              title="紧凑小字号 (iPad最佳适配)"
            >
              小
            </button>
            <button
              onClick={() => {
                sound.playPop();
                setFontScale('normal');
              }}
              className={`px-1.5 py-0.5 rounded text-[10px] font-black transition cursor-pointer ${
                fontScale === 'normal' ? 'bg-amber-500 text-white shadow-2xs' : 'text-amber-900 hover:bg-amber-100'
              }`}
              title="标准中字号"
            >
              中
            </button>
            <button
              onClick={() => {
                sound.playPop();
                setFontScale('large');
              }}
              className={`px-1.5 py-0.5 rounded text-[10px] font-black transition cursor-pointer ${
                fontScale === 'large' ? 'bg-amber-500 text-white shadow-2xs' : 'text-amber-900 hover:bg-amber-100'
              }`}
              title="大字号"
            >
              大
            </button>
          </div>

          {/* Layout Mode Toggle (Split / Stacked) */}
          <button
            onClick={() => {
              sound.playPop();
              setLayoutMode(layoutMode === 'split' ? 'stacked' : 'split');
            }}
            className="p-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-lg text-xs font-bold transition cursor-pointer shadow-2xs hidden md:flex items-center gap-1"
            title={layoutMode === 'split' ? '切换为上下排列' : '切换为左右分屏 (iPad最佳)'}
          >
            {layoutMode === 'split' ? <Columns className="w-3.5 h-3.5 text-amber-700" /> : <Rows className="w-3.5 h-3.5 text-amber-700" />}
            <span className="text-[11px] hidden lg:inline">{layoutMode === 'split' ? '分屏' : '上下'}</span>
          </button>

          {/* Read Whole Article Speech */}
          <button
            onClick={() => {
              const fullText = `${article.title}。` + article.paragraphs.map((p) => p.text).join(' ');
              handleReadParagraph(fullText, 0);
            }}
            className={`p-1.5 border rounded-lg text-xs font-bold transition cursor-pointer shadow-2xs flex items-center gap-1 ${
              isReadingAloud
                ? 'bg-amber-500 text-white border-amber-600 animate-pulse'
                : 'bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-300'
            }`}
            title={isReadingAloud ? '停止朗读' : '朗读全文'}
          >
            {isReadingAloud ? <Square className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
          </button>

          {/* Sound Toggle */}
          <button
            id="btn-toggle-sound-top"
            onClick={toggleSound}
            className="p-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-lg transition cursor-pointer shadow-2xs"
            title={soundMuted ? '开启声音' : '静音'}
          >
            {soundMuted ? (
              <VolumeX className="w-3.5 h-3.5 text-slate-400" />
            ) : (
              <Volume2 className="w-3.5 h-3.5 text-amber-700" />
            )}
          </button>

          {/* Settings */}
          <button
            id="btn-open-settings"
            onClick={() => {
              sound.playPop();
              setIsAdminOpen(true);
            }}
            className="p-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-lg transition cursor-pointer shadow-2xs"
            title="设置 [G]"
          >
            <Settings className="w-3.5 h-3.5 text-amber-800" />
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 📱 NO-SCROLL IPAD WORKSPACE: SPLIT LEFT/RIGHT OR COMPACT STACKED 📱 */}
      {/* ========================================================================= */}
      <div
        className={`flex-1 min-h-0 w-full flex overflow-hidden gap-2 sm:gap-3 ${
          layoutMode === 'split' ? 'flex-col md:flex-row' : 'flex-col overflow-y-auto'
        }`}
      >
        {/* 📖 LEFT PANEL: ARTICLE COMPREHENSION (SELF-CONTAINED SCROLL IF OVERFLOW) */}
        <div
          id="article-container"
          ref={articleScrollRef}
          className={`bg-white border-2 border-amber-900/30 rounded-2xl shadow-sm flex flex-col overflow-hidden relative ${
            layoutMode === 'split'
              ? 'w-full md:w-[48%] lg:w-[47%] h-full flex flex-col shrink-0'
              : 'w-full shrink-0'
          }`}
        >
          {/* Article Header */}
          <div className="bg-amber-50/90 border-b border-amber-200 px-3 py-2 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-amber-700" />
              <span className="text-xs sm:text-sm font-black text-slate-900">
                《{article.title}》
              </span>
            </div>
            <span className="text-[10px] sm:text-xs font-bold text-amber-800 bg-amber-200/80 px-2 py-0.5 rounded">
              {article.instruction}
            </span>
          </div>

          {/* Paragraphs body */}
          <div className="flex-1 overflow-y-auto p-2.5 sm:p-3 space-y-2">
            {article.imageUrl && (
              <div className="mb-2 rounded-xl overflow-hidden border border-amber-200 shadow-2xs max-w-xs mx-auto">
                <img
                  src={article.imageUrl}
                  alt="文章插图"
                  className="w-full max-h-32 object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
            )}

            {article.paragraphs.map((p) => renderParagraphContent(p))}

            <div className="pt-2 border-t border-amber-100 text-center">
              <span className="text-[11px] font-bold text-amber-900 italic">
                💡 核心启示：细心观察、找出原因并不断调整，一个简单的想法也能解决问题。
              </span>
            </div>
          </div>
        </div>

        {/* ✍️ RIGHT PANEL: QUESTION CARD & DRAG/TAP WORD BLOCKS WORKSPACE */}
        <div
          className={`flex-1 min-h-0 bg-white border-2 border-amber-400 rounded-2xl shadow-sm flex flex-col justify-between overflow-hidden relative p-2.5 sm:p-3.5 ${
            checkedAnswers[activeQuestion.id]?.isMatch
              ? 'border-emerald-400 bg-emerald-50/20'
              : ''
          }`}
        >
          {/* Top question header */}
          <div className="flex items-center justify-between gap-2 shrink-0 border-b border-slate-100 pb-1.5 mb-1.5">
            <div className="flex items-center gap-1.5">
              <span className="w-6 h-6 rounded-lg bg-amber-500 text-white font-black text-xs flex items-center justify-center shadow-2xs">
                {activeQuestion.number}
              </span>
              <span className="text-xs font-black text-amber-900">
                第 {activeQuestion.number} 题
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <span
                className={`font-black text-xs px-2 py-0.5 rounded-md ${
                  checkedAnswers[activeQuestion.id]?.isMatch
                    ? 'text-emerald-700 bg-emerald-100 font-extrabold'
                    : 'text-amber-900 bg-amber-100'
                }`}
              >
                [{activeQuestion.marks} 分]
              </span>

              {/* Bee Clue Hint Button */}
              <button
                ref={(el) => (beeButtonRefs.current[activeQuestion.id] = el)}
                type="button"
                onClick={() => triggerHint(activeQuestion, beeButtonRefs.current[activeQuestion.id])}
                className="p-1 rounded-xl bg-amber-200 hover:bg-amber-300 border border-amber-400 shadow-2xs hover:scale-105 active:scale-95 transition cursor-pointer flex items-center gap-1"
                title="呼唤小蜜蜂仙子下凡，指引文章线索！"
              >
                <BeeHintIcon className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                <span className="text-[10px] font-black text-amber-950 hidden sm:inline">
                  {investigationActive[activeQuestion.id] ? '蜜蜂引路' : '寻线索'}
                </span>
              </button>
            </div>
          </div>

          {/* Question Text with prominent styling */}
          <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl px-3 py-2 shrink-0 mb-1.5 shadow-2xs">
            <h2 className={`${getQuestionTextClass()} tracking-wide text-slate-900`}>
              {activeQuestion.questionText}
            </h2>
          </div>

          {/* Scrollable Center: Word Block Workspace */}
          <div className="flex-1 overflow-y-auto min-h-0 py-0.5">
            {renderQuestionBlockWorkspace(activeQuestion)}
          </div>

          {/* Popping Score Badge */}
          <AnimatePresence>
            {poppingScore?.qId === activeQuestion.id && (
              <motion.div
                initial={{ opacity: 0, y: 0, scale: 0.5 }}
                animate={{ opacity: 1, y: -30, scale: 1.1 }}
                exit={{ opacity: 0, y: -45, scale: 0.8 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className="absolute right-3 top-2 pointer-events-none z-50 bg-amber-400 text-amber-950 font-black px-3 py-1 rounded-full border border-amber-800 shadow-md flex items-center gap-1 text-xs"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-950" />
                <span>+{activeQuestion.marks} 分！</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Bottom Footer: Navigation & Score Bar */}
          <div className="flex items-center justify-between gap-2 pt-2 mt-1 border-t border-slate-100 shrink-0">
            <button
              type="button"
              disabled={currentQuestionIndex === 0}
              onClick={() => {
                sound.playPop();
                setCurrentQuestionIndex((prev) => Math.max(0, prev - 1));
              }}
              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 disabled:pointer-events-none text-slate-800 font-bold text-xs rounded-lg border border-slate-200 transition flex items-center gap-1 cursor-pointer"
            >
              <ChevronLeft className="w-3 h-3" />
              <span>上一题</span>
            </button>

            {/* Score pill */}
            <div className="text-[11px] font-black text-amber-900 bg-amber-100/80 px-2.5 py-0.5 rounded-full border border-amber-200">
              得分：<span className="text-amber-700 font-extrabold">{totalScore}</span> / {totalPossibleMarks}
            </div>

            <button
              type="button"
              disabled={currentQuestionIndex === questions.length - 1}
              onClick={() => {
                sound.playPop();
                setCurrentQuestionIndex((prev) => Math.min(questions.length - 1, prev + 1));
              }}
              className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 disabled:opacity-40 disabled:pointer-events-none text-white font-bold text-xs rounded-lg transition flex items-center gap-1 cursor-pointer shadow-2xs"
            >
              <span>下一题</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
