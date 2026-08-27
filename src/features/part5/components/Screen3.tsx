import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Volume2,
  Volume1,
  RotateCcw,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  VolumeX,
  CheckCircle2,
  XCircle,
  Trophy,
  Lightbulb,
  ZoomIn,
  Timer,
  Flame,
  Keyboard,
  BookMarked,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { SpellingWord } from '../data/theme1Words';
import { getThemeById, getThemeWords } from '../data/allThemes';
import { useApp } from '../context/AppContext';
import { sound } from '../utils/audio';
import { VoiceSettingsPanel } from './VoiceSettingsPanel';

interface Screen3Props {
  onBack: () => void;
  initialQuestionIndex?: number;
}

// Time format helper: MM:SS
function formatTime(totalSeconds: number): string {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// Fisher-Yates Shuffle
function shuffleWords(items: SpellingWord[]): SpellingWord[] {
  const shuffled = [...items];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Generate question-specific random image mode decision for each question
function generateQuestionImageModes(
  wordList: SpellingWord[],
  wordImagesMap: Record<number, string> = {},
  enableImageClues: boolean = true,
  imageRandomRate: number = 0.5
): boolean[] {
  return wordList.map((word) => {
    const hasImage = Boolean(wordImagesMap[word.id] !== undefined ? wordImagesMap[word.id] : word.imageUrl);
    if (!enableImageClues || !hasImage) return false;
    if (imageRandomRate >= 1.0) return true;
    if (imageRandomRate <= 0) return false;
    return Math.random() < imageRandomRate;
  });
}

// Thinking time limit per question in seconds
const QUESTION_TIME_LIMIT = 20;

export const Screen3: React.FC<Screen3Props> = ({
  onBack,
  initialQuestionIndex = 0,
}) => {
  const {
    settings,
    updateSettings,
    selectedThemeId,
    mistakes,
    isPracticingMistakes,
    activeMistakeWordIndex,
    recordMistake,
    markWordMastered,
  } = useApp();

  const themeInfo = getThemeById(selectedThemeId);

  // Build the words array depending on whether in normal Theme Practice or Mistake Book practice
  const [words, setWords] = useState<SpellingWord[]>(() => {
    if (isPracticingMistakes && mistakes.length > 0) {
      // In Mistake Book practice mode
      return mistakes.map((m) => ({
        id: m.wordId,
        word: m.word,
        description: m.description,
        firstLetter: m.firstLetter,
        boxCount: m.boxCount,
        chinese: m.chinese,
        phonics: m.phonics,
        imageUrl: m.imageUrl,
      }));
    }
    return shuffleWords(getThemeWords(selectedThemeId));
  });

  // Pre-computed per-question random modes
  const [questionImageModes, setQuestionImageModes] = useState<boolean[]>(() =>
    generateQuestionImageModes(
      words,
      settings.wordImages,
      settings.enableImageClues,
      settings.imageRandomRate
    )
  );

  const [currentIndex, setCurrentIndex] = useState<number>(
    isPracticingMistakes ? Math.min(activeMistakeWordIndex, Math.max(0, words.length - 1)) : initialQuestionIndex
  );
  const [inputs, setInputs] = useState<string[]>([]);
  const [activeSlot, setActiveSlot] = useState<number>(0);
  const [isCorrect, setIsCorrect] = useState<boolean>(false);
  const [isShaking, setIsShaking] = useState<boolean>(false);
  const [completedQuestions, setCompletedQuestions] = useState<Set<number>>(new Set());
  const [failedQuestions, setFailedQuestions] = useState<Set<number>>(new Set());
  const [hintsUsed, setHintsUsed] = useState<number>(0);
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [streak, setStreak] = useState<number>(0);
  const [maxStreak, setMaxStreak] = useState<number>(0);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [strikePopup, setStrikePopup] = useState<{ count: number; title: string; subtitle: string } | null>(null);

  // 1-ATTEMPT & TIMER LOGIC
  const [attemptUsed, setAttemptUsed] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(QUESTION_TIME_LIMIT);

  // Flying word to bag animation state
  const [flyingWord, setFlyingWord] = useState<string | null>(null);
  const [bagBounceTrigger, setBagBounceTrigger] = useState<boolean>(false);
  const [bagPlusOne, setBagPlusOne] = useState<boolean>(false);

  const [isZoomModalOpen, setIsZoomModalOpen] = useState<boolean>(false);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState<boolean>(false);

  // Phonics & Chinese Popout Modal State
  const [showPhonicsModal, setShowPhonicsModal] = useState<boolean>(false);
  const [modalWord, setModalWord] = useState<SpellingWord | null>(null);
  const [wasModalTriggeredByMistake, setWasModalTriggeredByMistake] = useState<boolean>(false);

  // Auto-detect if user is on laptop / computer
  const [isLaptopOrComputer, setIsLaptopOrComputer] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    const hasFinePointer = window.matchMedia('(pointer: fine)').matches;
    const canHover = window.matchMedia('(hover: hover)').matches;
    const isTouchOnly = ('ontouchstart' in window || navigator.maxTouchPoints > 0) && window.innerWidth < 1024;
    return (hasFinePointer && canHover) || !isTouchOnly;
  });

  // Track whether virtual on-screen keyboard should be visible
  const [showVirtualKeyboard, setShowVirtualKeyboard] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    const hasFinePointer = window.matchMedia('(pointer: fine)').matches;
    const canHover = window.matchMedia('(hover: hover)').matches;
    const isTouchOnly = ('ontouchstart' in window || navigator.maxTouchPoints > 0) && window.innerWidth < 1024;
    return !((hasFinePointer && canHover) || !isTouchOnly);
  });

  // Responsive device listener for orientation/resize changes
  useEffect(() => {
    const checkDevice = () => {
      const hasFinePointer = window.matchMedia('(pointer: fine)').matches;
      const canHover = window.matchMedia('(hover: hover)').matches;
      const isTouchOnly = ('ontouchstart' in window || navigator.maxTouchPoints > 0) && window.innerWidth < 1024;
      const isComputer = (hasFinePointer && canHover) || !isTouchOnly;
      setIsLaptopOrComputer(isComputer);
    };

    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  // Hidden proxy input for mobile virtual keyboard focus
  const hiddenInputRef = useRef<HTMLInputElement | null>(null);

  const currentWord: SpellingWord = words[currentIndex] || words[0];
  const targetLetters = currentWord ? currentWord.word.toUpperCase().split('') : [];
  const totalQuestions = words.length;

  // Resolve current active image URL
  const customImg = settings.wordImages?.[currentWord?.id];
  const availableImageUrl = customImg !== undefined ? customImg : currentWord?.imageUrl || '';

  // Whether current question displays image
  const isImageMode = Boolean(
    settings.enableImageClues &&
    availableImageUrl &&
    (questionImageModes[currentIndex] ?? false)
  );

  // Initialize question state whenever current index, word, or mode changes
  useEffect(() => {
    if (!currentWord) return;
    const showImage = isImageMode;
    const letters = currentWord.word.toUpperCase().split('');
    const initialInputs = new Array(letters.length).fill('');

    // Pre-fill hyphens and spaces automatically
    letters.forEach((char, idx) => {
      if (char === '-' || char === ' ') {
        initialInputs[idx] = char;
      }
    });

    if (showImage) {
      let firstSlot = 0;
      while (firstSlot < letters.length && (letters[firstSlot] === '-' || letters[firstSlot] === ' ')) {
        firstSlot++;
      }
      setActiveSlot(firstSlot);
    } else {
      initialInputs[0] = currentWord.firstLetter.toUpperCase();
      let firstSlot = 1;
      while (firstSlot < letters.length && (letters[firstSlot] === '-' || letters[firstSlot] === ' ')) {
        firstSlot++;
      }
      setActiveSlot(firstSlot);
    }

    setInputs(initialInputs);
    setIsCorrect(false);
    setIsShaking(false);
    setShowPhonicsModal(false);
    setModalWord(null);
    setAttemptUsed(false);
    setTimeLeft(QUESTION_TIME_LIMIT);
    setWasModalTriggeredByMistake(false);

    // Focus hidden input for keyboard typing
    hiddenInputRef.current?.focus();
  }, [currentIndex, currentWord, isImageMode]);

  const unmasteredMistakesCount = mistakes.filter((m) => !m.isMastered).length;

  // Active session overall timer
  useEffect(() => {
    if (isFinished) return;
    const interval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isFinished]);

  // Read out the word ONLY when the syllable / phonics popup appears
  useEffect(() => {
    if (showPhonicsModal && modalWord) {
      sound.speakWord(modalWord.word);
    }
  }, [showPhonicsModal, modalWord]);

  // Trigger Bag of Mistakes & Popout when 1 attempt fails
  const triggerMistakeRecord = useCallback(
    (reason: 'wrong_spelling' | 'time_out', attemptedStr?: string) => {
      if (!currentWord || attemptUsed || isCorrect || showPhonicsModal || flyingWord) return;

      setAttemptUsed(true);
      setStreak(0);
      setFailedQuestions((prev) => new Set(prev).add(currentIndex));

      sound.playWrong();

      // Record in AppContext & localStorage
      recordMistake(
        currentWord,
        selectedThemeId,
        themeInfo.name,
        themeInfo.title,
        reason,
        attemptedStr
      );

      // Directly open Correct Answer / Phonics modal for review
      setModalWord(currentWord);
      setWasModalTriggeredByMistake(true);
      setShowPhonicsModal(true);
    },
    [currentWord, attemptUsed, isCorrect, showPhonicsModal, flyingWord, currentIndex, selectedThemeId, themeInfo, recordMistake]
  );

  // Per-Question Thinking Countdown Timer (1 Attempt Thinking Limit)
  useEffect(() => {
    if (isFinished || isCorrect || showPhonicsModal || attemptUsed || Boolean(flyingWord)) {
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isFinished, isCorrect, showPhonicsModal, attemptUsed, flyingWord]);

  // Handle timeout triggering outside state updater
  useEffect(() => {
    if (
      timeLeft === 0 &&
      !attemptUsed &&
      !isCorrect &&
      !showPhonicsModal &&
      !flyingWord &&
      currentWord &&
      !isFinished
    ) {
      triggerMistakeRecord('time_out');
    }
  }, [timeLeft, attemptUsed, isCorrect, showPhonicsModal, flyingWord, currentWord, isFinished, triggerMistakeRecord]);

  // Check answer automatically on 1 attempt
  const handleValidateAnswer = useCallback(
    (currentInputs: string[], wordObj: SpellingWord) => {
      if (isCorrect || showPhonicsModal || attemptUsed || !wordObj || Boolean(flyingWord)) return;

      const typedWord = currentInputs.join('').toUpperCase();
      const targetWord = wordObj.word.toUpperCase();
      const isAllFilled = currentInputs.every((char) => char && char.trim() !== '');

      if (typedWord === targetWord) {
        // CORRECT ANSWER (1st Attempt Passed!)
        setIsCorrect(true);
        setAttemptUsed(true);

        // Mark as mastered in Mistake Book if it was there!
        markWordMastered(wordObj.word);

        const nextStreak = streak + 1;
        setStreak(nextStreak);
        setMaxStreak((prev) => Math.max(prev, nextStreak));

        // Strike audio & visual excitement
        if (nextStreak >= 2) {
          sound.playStrike(nextStreak);
          let title = `🔥 ${nextStreak}x STRIKE!`;
          let sub = 'Awesome streak!';
          if (nextStreak === 2) {
            title = '🔥 2x STRIKE!';
            sub = 'Double Combo!';
          } else if (nextStreak === 3) {
            title = '🔥 3x TRIPLE STRIKE!';
            sub = 'You are on fire!';
          } else if (nextStreak === 4) {
            title = '⚡ 4x MEGA STRIKE!';
            sub = 'Super Speller!';
          } else if (nextStreak >= 5) {
            title = `🚀 ${nextStreak}x UNSTOPPABLE!`;
            sub = 'Legendary Streak!';
          }

          setStrikePopup({ count: nextStreak, title, subtitle: sub });
          setTimeout(() => {
            setStrikePopup(null);
          }, 1600);

          try {
            confetti({
              particleCount: Math.min(120, 60 + nextStreak * 15),
              spread: 70 + nextStreak * 4,
              origin: { y: 0.55 },
            });
          } catch {
            // ignore
          }
        } else {
          sound.playChime();
          try {
            confetti({
              particleCount: 50,
              spread: 65,
              origin: { y: 0.6 },
            });
          } catch {
            // ignore
          }
        }

        setCompletedQuestions((prev) => new Set(prev).add(currentIndex));

        // Open Phonics & Syllable popup after short delay
        setTimeout(() => {
          setModalWord(wordObj);
          setWasModalTriggeredByMistake(false);
          setShowPhonicsModal(true);
        }, 400);
      } else if (isAllFilled && typedWord.length === targetWord.length) {
        // ALL FILLED BUT INCORRECT -> 1 ATTEMPT FAILED!
        setIsShaking(true);
        setTimeout(() => {
          setIsShaking(false);
          triggerMistakeRecord('wrong_spelling', typedWord);
        }, 400);
      }
    },
    [currentIndex, isCorrect, showPhonicsModal, attemptUsed, streak, triggerMistakeRecord, markWordMastered]
  );

  // Unified keystroke processor
  const processKey = useCallback(
    (key: string) => {
      if (isFinished || isCorrect || showPhonicsModal || attemptUsed || !currentWord) return;

      const letters = currentWord.word.toUpperCase().split('');
      const minEditableIndex = isImageMode ? 0 : 1;

      // Single A-Z letter
      if (/^[a-zA-Z]$/.test(key)) {
        const typedChar = key.toUpperCase();
        const next = [...inputs];

        let slotToWrite = activeSlot;
        if (slotToWrite < minEditableIndex || slotToWrite >= letters.length) {
          slotToWrite = minEditableIndex;
        }

        // Skip over any hyphens or spaces
        while (slotToWrite < letters.length && (letters[slotToWrite] === '-' || letters[slotToWrite] === ' ')) {
          slotToWrite++;
        }

        if (slotToWrite < letters.length) {
          next[slotToWrite] = typedChar;
          sound.playPop();

          // Find next empty or editable slot
          let nextSlot = slotToWrite + 1;
          while (nextSlot < letters.length && (letters[nextSlot] === '-' || letters[nextSlot] === ' ')) {
            nextSlot++;
          }
          if (nextSlot < letters.length) {
            setActiveSlot(nextSlot);
          }
        }

        setInputs(next);
        // Validate if complete
        handleValidateAnswer(next, currentWord);
      } else if (key === 'Backspace') {
        sound.playPop();
        const next = [...inputs];

        if (next[activeSlot] && activeSlot >= minEditableIndex && letters[activeSlot] !== '-' && letters[activeSlot] !== ' ') {
          next[activeSlot] = '';
        } else {
          // Move cursor left
          let prevSlot = activeSlot - 1;
          while (prevSlot >= minEditableIndex && (letters[prevSlot] === '-' || letters[prevSlot] === ' ')) {
            prevSlot--;
          }
          if (prevSlot >= minEditableIndex) {
            next[prevSlot] = '';
            setActiveSlot(prevSlot);
          }
        }
        setInputs(next);
      } else if (key === 'ArrowLeft') {
        let prevSlot = activeSlot - 1;
        while (prevSlot >= minEditableIndex && (letters[prevSlot] === '-' || letters[prevSlot] === ' ')) {
          prevSlot--;
        }
        if (prevSlot >= minEditableIndex) {
          setActiveSlot(prevSlot);
        }
      } else if (key === 'ArrowRight') {
        let nextSlot = activeSlot + 1;
        while (nextSlot < letters.length && (letters[nextSlot] === '-' || letters[nextSlot] === ' ')) {
          nextSlot++;
        }
        if (nextSlot < letters.length) {
          setActiveSlot(nextSlot);
        }
      }
    },
    [isFinished, isCorrect, showPhonicsModal, flyingWord, attemptUsed, activeSlot, currentWord, isImageMode, inputs, handleValidateAnswer]
  );

  // Global Keyboard listener
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      // When Phonics Modal is showing, pressing Enter or Space advances
      if (showPhonicsModal) {
        if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowRight') {
          e.preventDefault();
          handleAdvanceFromModal();
        }
        return;
      }

      // Close zoom modal on Escape
      if (isZoomModalOpen && e.key === 'Escape') {
        setIsZoomModalOpen(false);
        return;
      }

      // Intercept valid keys to prevent page scroll
      if (/^[a-zA-Z]$/.test(e.key) || e.key === 'Backspace' || e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        e.preventDefault();
        processKey(e.key);
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [showPhonicsModal, isZoomModalOpen, processKey]);

  const handleToggleMute = () => {
    const isMuted = sound.toggleMute();
    updateSettings({ soundEnabled: !isMuted });
    if (!isMuted) {
      sound.playPop();
    }
  };

  // Speak description
  const handleSpeakDescription = () => {
    if (!currentWord) return;
    sound.playPop();
    sound.speakText(currentWord.description);
  };

  // Speak word aloud
  const handlePronounceWord = (wordText: string) => {
    sound.speakWord(wordText);
  };

  // Hint button (gives 1 letter)
  const handleUseHint = () => {
    if (isCorrect || showPhonicsModal || attemptUsed || !currentWord) return;
    sound.playPop();
    setHintsUsed((prev) => prev + 1);

    const newInputs = [...inputs];
    const startIndex = isImageMode ? 0 : 1;
    let hintedIndex = -1;

    for (let i = startIndex; i < targetLetters.length; i++) {
      if (targetLetters[i] === '-' || targetLetters[i] === ' ') continue;
      if (newInputs[i] !== targetLetters[i]) {
        newInputs[i] = targetLetters[i];
        hintedIndex = i;
        break;
      }
    }

    if (hintedIndex !== -1) {
      setInputs(newInputs);
      let nextActive = hintedIndex + 1;
      while (nextActive < targetLetters.length && (targetLetters[nextActive] === '-' || targetLetters[nextActive] === ' ')) {
        nextActive++;
      }
      if (nextActive >= targetLetters.length) {
        nextActive = targetLetters.length - 1;
      }
      setActiveSlot(nextActive);
      handleValidateAnswer(newInputs, currentWord);
    }
  };

  // Clear inputs
  const handleResetCurrent = () => {
    if (!currentWord || attemptUsed || Boolean(flyingWord)) return;
    sound.playPop();
    const letters = currentWord.word.toUpperCase().split('');
    const reset = new Array(letters.length).fill('');

    letters.forEach((char, idx) => {
      if (char === '-' || char === ' ') {
        reset[idx] = char;
      }
    });

    if (!isImageMode) {
      reset[0] = currentWord.firstLetter.toUpperCase();
      let firstSlot = 1;
      while (firstSlot < letters.length && (letters[firstSlot] === '-' || letters[firstSlot] === ' ')) {
        firstSlot++;
      }
      setActiveSlot(firstSlot);
    } else {
      let firstSlot = 0;
      while (firstSlot < letters.length && (letters[firstSlot] === '-' || letters[firstSlot] === ' ')) {
        firstSlot++;
      }
      setActiveSlot(firstSlot);
    }

    setInputs(reset);
    hiddenInputRef.current?.focus();
  };

  // Advance to next question from modal with delayed flying word effect into Bag if mistake
  const handleAdvanceFromModal = () => {
    sound.playPop();
    const isMistake = wasModalTriggeredByMistake;
    const targetWordStr = modalWord?.word || currentWord?.word || '';

    setShowPhonicsModal(false);
    setModalWord(null);
    setWasModalTriggeredByMistake(false);

    // Immediately advance to the next question / finish
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsFinished(true);
      sound.playCelebration();
      try {
        confetti({
          particleCount: 100,
          spread: 100,
          origin: { y: 0.5 },
        });
      } catch {
        // ignore
      }
    }

    // Only if it was a mistake: delay "fly to bag" animation so it plays after moving to the new question!
    if (isMistake && targetWordStr) {
      setTimeout(() => {
        setFlyingWord(targetWordStr);

        // When flying word reaches the top-right bag
        setTimeout(() => {
          setBagBounceTrigger(true);
          setBagPlusOne(true);
          sound.playBagOfMistakes();
          setTimeout(() => setBagBounceTrigger(false), 500);
          setTimeout(() => setBagPlusOne(false), 1200);
        }, 500);

        // Clear flying capsule after flight completes
        setTimeout(() => {
          setFlyingWord(null);
        }, 850);
      }, 300);
    }
  };

  // Navigation handlers
  const handlePrev = () => {
    sound.playPop();
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleNext = () => {
    sound.playPop();
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  if (!currentWord) {
    return null;
  }

  return (
    <div className="relative min-h-screen bg-[#FEF3C7] text-[#78350F] flex flex-col font-sans select-none overflow-x-hidden">
      {/* Hidden Proxy Input for Mobile Virtual Keyboards */}
      <input
        ref={hiddenInputRef}
        type="text"
        inputMode="text"
        autoCapitalize="characters"
        autoComplete="off"
        autoCorrect="off"
        spellCheck="false"
        className="opacity-0 absolute -top-9999 left-0 pointer-events-none w-1 h-1"
        onChange={(e) => {
          const val = e.target.value;
          if (val) {
            const lastChar = val.slice(-1);
            if (/^[a-zA-Z]$/.test(lastChar)) {
              processKey(lastChar);
            }
            e.target.value = '';
          }
        }}
      />

      {/* STRIKE POPUP OVERLAY */}
      <AnimatePresence>
        {strikePopup && (
          <motion.div
            initial={{ opacity: 0, scale: 0.4, y: 30 }}
            animate={{ opacity: 1, scale: 1.1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -30 }}
            transition={{ type: 'spring', damping: 14, stiffness: 300 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
          >
            <div className="px-6 py-3.5 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 text-white font-black rounded-3xl border-4 border-white shadow-[0_15px_30px_rgba(245,158,11,0.6),0_6px_0_#78350F] flex flex-col items-center gap-0.5 text-center">
              <span className="text-xl sm:text-2xl font-black drop-shadow-md tracking-tight">
                {strikePopup.title}
              </span>
              <span className="text-xs font-bold text-yellow-100">
                {strikePopup.subtitle}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🚀 FLYING WORD INTO BAG OF MISTAKES ANIMATION */}
      <AnimatePresence>
        {flyingWord && (
          <motion.div
            initial={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              x: '-50%',
              y: '-50%',
              scale: 1.25,
              opacity: 1,
              zIndex: 9999,
            }}
            animate={{
              top: '28px',
              left: 'calc(100% - 100px)',
              x: '-50%',
              y: '-50%',
              scale: 0.15,
              opacity: 0,
              rotate: 360,
            }}
            transition={{
              duration: 0.75,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="fixed pointer-events-none"
          >
            <div className="px-6 py-3.5 bg-gradient-to-r from-rose-500 via-red-500 to-amber-500 text-white font-black text-xl sm:text-2xl rounded-2xl border-4 border-white shadow-[0_12px_28px_rgba(239,68,68,0.7),0_5px_0_#78350F] flex items-center gap-2.5">
              <span className="text-2xl sm:text-3xl">🎒</span>
              <span className="uppercase tracking-wide">{flyingWord}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* TOP APP HEADER */}
      <header className="h-16 flex items-center justify-between px-4 sm:px-8 bg-white/90 backdrop-blur-md border-b-3 border-[#FDE047] z-30 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            id="btn-back-to-screen2"
            onClick={() => {
              sound.playPop();
              onBack();
            }}
            className="px-3.5 py-1.5 bg-[#FFFBEB] hover:bg-[#FEF3C7] rounded-full border-2 border-[#78350F] text-[#78350F] font-black text-xs sm:text-sm shadow-[1.5px_1.5px_0px_#78350F] transition-all flex items-center gap-1.5 cursor-pointer active:translate-y-0.5"
            title="Back to Themes"
          >
            <ArrowLeft className="w-4 h-4 text-[#78350F]" />
            <span>{isPracticingMistakes ? 'Mistake Book' : 'Themes'}</span>
          </button>

          <span className="text-base sm:text-lg font-black text-[#78350F] uppercase tracking-tight ml-1 flex items-center gap-2">
            {isPracticingMistakes ? (
              <>
                <BookMarked className="w-5 h-5 text-rose-600" />
                <span>MISTAKE BOOK PRACTICE</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 text-amber-500" />
                <span>{themeInfo.title}: {themeInfo.name}</span>
              </>
            )}
          </span>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Thinking Timer Pill for 1-Attempt Challenge */}
          <div
            className={`flex items-center gap-1 px-3 py-1 rounded-full border-2 border-[#78350F] text-xs font-black shadow-xs transition-colors ${
              timeLeft <= 5
                ? 'bg-rose-500 text-white animate-pulse'
                : timeLeft <= 10
                ? 'bg-amber-300 text-[#78350F]'
                : 'bg-white text-[#78350F]'
            }`}
            title="Thinking Time Left"
          >
            <Timer className="w-3.5 h-3.5" />
            <span>{timeLeft}s</span>
          </div>

          {/* Active Strike Multiplier Badge */}
          {streak >= 2 && (
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: [1, 1.08, 1] }}
              transition={{ repeat: Infinity, duration: 1.2 }}
              className="flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 rounded-full border-2 border-[#78350F] text-white text-xs font-black shadow-[2px_2px_0px_#78350F]"
            >
              <Flame className="w-3.5 h-3.5 fill-yellow-200 text-yellow-200" />
              <span>{streak}x Strike!</span>
            </motion.div>
          )}

          {/* 🎒 FLOATING BAG OF MISTAKES WIDGET ON ANSWERING SCREEN */}
          <motion.div
            id="floating-bag-widget"
            animate={
              bagBounceTrigger
                ? {
                    scale: [1, 1.5, 0.8, 1.25, 1],
                    rotate: [-18, 18, -10, 10, 0],
                  }
                : {
                    y: [0, -3, 0],
                  }
            }
            transition={
              bagBounceTrigger
                ? { duration: 0.55, ease: 'easeOut' }
                : { repeat: Infinity, duration: 2.4, ease: 'easeInOut' }
            }
            className="relative flex items-center"
          >
            <div
              className={`px-3 py-1.5 rounded-full border-2 border-[#78350F] flex items-center gap-1.5 shadow-[2px_2px_0px_#78350F] transition-all cursor-pointer ${
                unmasteredMistakesCount > 0
                  ? 'bg-amber-100 hover:bg-amber-200 text-[#78350F]'
                  : 'bg-white hover:bg-amber-50 text-[#78350F]'
              }`}
              title={`Bag of Mistakes (${unmasteredMistakesCount} words)`}
            >
              <span className="text-lg sm:text-xl leading-none select-none">🎒</span>
              <span className="text-xs font-black hidden sm:inline text-[#78350F]">Bag</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[11px] sm:text-xs font-black ${
                  unmasteredMistakesCount > 0
                    ? 'bg-rose-600 text-white animate-pulse'
                    : 'bg-emerald-600 text-white'
                }`}
              >
                {unmasteredMistakesCount}
              </span>
            </div>

            {/* Floating +1 when word lands inside bag */}
            <AnimatePresence>
              {bagPlusOne && (
                <motion.span
                  initial={{ opacity: 0, y: 0, scale: 0.5 }}
                  animate={{ opacity: 1, y: -26, scale: 1.25 }}
                  exit={{ opacity: 0, y: -36 }}
                  transition={{ duration: 0.85 }}
                  className="absolute -top-3 left-1/2 -translate-x-1/2 font-black text-xs text-rose-600 bg-white border-2 border-rose-500 rounded-full px-2.5 py-0.5 shadow-md pointer-events-none z-50 whitespace-nowrap"
                >
                  +1 🎒
                </motion.span>
              )}
            </AnimatePresence>
          </motion.div>

          <button
            id="btn-sound-toggle-screen3"
            onClick={handleToggleMute}
            className="p-1.5 sm:p-2 bg-white rounded-full border-2 border-[#78350F] text-[#78350F] shadow-[2px_2px_0px_#78350F] transition-all hover:bg-[#FEF3C7] cursor-pointer"
            title={settings.soundEnabled ? 'Mute Audio' : 'Unmute Audio'}
          >
            {!settings.soundEnabled ? (
              <VolumeX className="w-4 h-4 text-slate-500" />
            ) : (
              <Volume2 className="w-4 h-4 text-[#B45309]" />
            )}
          </button>
        </div>
      </header>

      {/* Progress & Question Navigation Bar */}
      <div className="relative z-10 bg-amber-200/90 border-b-2 border-[#78350F]/40 px-4 sm:px-8 py-2 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-black uppercase text-[#78350F]">
            WORD {currentIndex + 1} OF {totalQuestions}
          </span>
          <span className="text-xs font-bold text-[#B45309]">
            ({completedQuestions.size} Mastered • {failedQuestions.size} in Bag 🎒)
          </span>
        </div>

        {/* Question Selector Dots */}
        <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto py-1 max-w-[50vw] sm:max-w-md">
          {words.map((w, idx) => {
            const isCurrent = idx === currentIndex;
            const isDone = completedQuestions.has(idx);
            const isFailed = failedQuestions.has(idx);

            return (
              <button
                key={w.id}
                onClick={() => {
                  sound.playPop();
                  setCurrentIndex(idx);
                }}
                className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 text-[10px] sm:text-xs font-black flex items-center justify-center cursor-pointer transition-transform ${
                  isCurrent
                    ? 'bg-[#F59E0B] border-[#78350F] text-[#78350F] scale-125 shadow-xs ring-2 ring-amber-400'
                    : isDone
                    ? 'bg-emerald-400 border-[#78350F] text-white shadow-2xs'
                    : isFailed
                    ? 'bg-rose-500 border-[#78350F] text-white shadow-2xs'
                    : 'bg-white/80 border-[#78350F]/60 text-[#78350F]/80 hover:bg-white'
                }`}
                title={`Word ${idx + 1}: ${w.word}`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Interactive Stage */}
      <main className="relative z-10 flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 md:p-8 flex flex-col justify-center items-center">
        <AnimatePresence mode="wait">
          {!isFinished ? (
            <motion.div
              key={`q-${currentIndex}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="w-full flex flex-col items-center"
            >
              {/* PRIMARY QUESTION CARD CONTAINER */}
              <div
                className={`w-full bg-white/90 backdrop-blur-xs rounded-3xl border-4 border-[#78350F] p-4 sm:p-6 md:p-8 shadow-[6px_8px_0px_#78350F] grid grid-cols-1 md:grid-cols-12 gap-6 items-center transition-transform ${
                  isShaking ? 'animate-[wiggle_0.4s_ease-in-out]' : ''
                }`}
              >
                {/* LEFT CONTAINER: Visual / First-Letter Clue */}
                <div className="w-full md:col-span-5 flex flex-col items-center justify-center">
                  {isImageMode && availableImageUrl ? (
                    /* Image Clue Card */
                    <div className="w-full max-w-sm bg-white rounded-2xl border-3 border-[#78350F] p-3 sm:p-4 shadow-[3px_4px_0px_#78350F] flex flex-col items-center gap-2">
                      <div className="relative w-full h-44 sm:h-52 bg-amber-50 rounded-xl overflow-hidden border-2 border-[#78350F]/30 flex items-center justify-center p-2">
                        <img
                          src={availableImageUrl}
                          alt={currentWord.word}
                          className="max-h-full max-w-full object-contain drop-shadow-sm transition-transform duration-300 hover:scale-105"
                          loading="eager"
                        />

                        {/* Zoom button */}
                        <button
                          onClick={() => setIsZoomModalOpen(true)}
                          className="absolute bottom-2 right-2 p-1.5 bg-white/90 hover:bg-white rounded-lg border border-[#78350F] text-[#78350F] shadow-xs cursor-pointer"
                          title="Zoom In"
                        >
                          <ZoomIn className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <span className="text-[11px] font-black text-[#B45309] text-center">
                        🖼️ Visual clue active • Spell the whole word!
                      </span>
                    </div>
                  ) : (
                    /* Letter Clue Card (When image is not shown) */
                    <div className="w-full max-w-sm bg-white/90 rounded-2xl border-3 border-[#78350F] p-5 shadow-[3px_4px_0px_#78350F] flex flex-col items-center text-center gap-3">
                      <div className="flex items-center gap-1.5 text-xs font-black text-amber-800 bg-amber-100 px-3 py-1 rounded-full border border-amber-300">
                        <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                        <span>FIRST LETTER GIVEN</span>
                      </div>

                      <div className="w-20 h-22 sm:w-24 sm:h-26 rounded-2xl border-4 border-[#78350F] bg-gradient-to-b from-[#FDE047] via-[#FBBF24] to-[#F59E0B] text-[#78350F] flex items-center justify-center text-4xl sm:text-5xl font-black shadow-[3px_4px_0px_#78350F]">
                        {currentWord.firstLetter.toUpperCase()}
                      </div>

                      <p className="text-xs font-bold text-slate-600 leading-snug">
                        Starts with <strong className="text-[#78350F]">"{currentWord.firstLetter.toUpperCase()}"</strong> ({targetLetters.length} letters total)
                      </p>
                    </div>
                  )}
                </div>

                {/* RIGHT CONTAINER: Description, Letter Boxes, and Controls */}
                <div className="w-full md:col-span-7 flex flex-col items-center text-center gap-5">
                  {/* Word Info Pill */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-[#B45309] bg-white px-3.5 py-1 rounded-full border-2 border-[#78350F] uppercase tracking-wider shadow-xs flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#F59E0B]" />
                      {targetLetters.length} Letters Word • 1 Attempt
                    </span>
                  </div>

                  {/* Description Clue */}
                  <div className="relative w-full bg-white/95 rounded-2xl border-2 border-[#78350F] p-4 sm:p-5 shadow-xs flex flex-col items-center justify-center gap-2.5">
                    <p className="text-base sm:text-lg md:text-xl font-black text-[#78350F] leading-snug">
                      "{currentWord.description}"
                    </p>

                    <button
                      onClick={handleSpeakDescription}
                      className="mt-0.5 px-3 py-1 bg-amber-100 hover:bg-amber-200 text-[#78350F] rounded-full border border-[#78350F]/40 text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                      title="Listen to Description"
                    >
                      <Volume1 className="w-3.5 h-3.5 text-[#B45309]" />
                      <span>Read Description</span>
                    </button>
                  </div>

                  {/* SPELLING LETTER BOXES */}
                  <div className="w-full flex flex-col items-center gap-2 my-1">
                    {(() => {
                      const count = targetLetters.length;
                      let tileClasses = 'w-11 h-14 sm:w-13 sm:h-17 md:w-14 md:h-18 rounded-xl sm:rounded-2xl border-3 sm:border-4 text-2xl sm:text-3xl md:text-4xl';
                      let gapClasses = 'gap-1.5 sm:gap-2.5';
                      let shadowClass = 'shadow-[3px_4px_0px_#78350F]';
                      let cursorHeight = 'h-5 sm:h-7';

                      if (count >= 11) {
                        tileClasses = 'w-5.5 h-8.5 sm:w-7 sm:h-10 md:w-8 md:h-12 rounded-md sm:rounded-xl border-2 sm:border-3 text-xs sm:text-sm md:text-base';
                        gapClasses = 'gap-0.5 sm:gap-1';
                        shadowClass = 'shadow-[1.5px_1.5px_0px_#78350F]';
                        cursorHeight = 'h-3 sm:h-4';
                      } else if (count >= 8) {
                        tileClasses = 'w-7.5 h-11 sm:w-9 sm:h-13 md:w-10.5 md:h-15 rounded-lg sm:rounded-xl border-2 sm:border-3 text-base sm:text-xl md:text-2xl';
                        gapClasses = 'gap-1 sm:gap-1.5';
                        shadowClass = 'shadow-[2px_3px_0px_#78350F]';
                        cursorHeight = 'h-4 sm:h-6';
                      } else if (count >= 6) {
                        tileClasses = 'w-9 h-12 sm:w-11 sm:h-15 md:w-12 md:h-16 rounded-xl border-3 sm:border-4 text-lg sm:text-2xl md:text-3xl';
                        gapClasses = 'gap-1 sm:gap-2';
                        shadowClass = 'shadow-[3px_3px_0px_#78350F]';
                        cursorHeight = 'h-4.5 sm:h-6.5';
                      }

                      return (
                        <div className={`flex flex-nowrap justify-center items-center ${gapClasses} max-w-full overflow-x-auto sm:overflow-x-visible py-1 px-1`}>
                          {targetLetters.map((targetChar, index) => {
                            const isFirst = index === 0;
                            const isFirstGiven = isFirst && !isImageMode;
                            const isFilled = Boolean(inputs[index]);
                            const isActive = !isCorrect && activeSlot === index;
                            const isSpecial = targetChar === '-' || targetChar === ' ';

                            if (isSpecial) {
                              return (
                                <div
                                  key={`box-${index}`}
                                  className="relative flex flex-col items-center shrink-0"
                                >
                                  <div className="w-5 h-11 sm:w-6 sm:h-14 flex items-center justify-center font-black text-xl text-[#78350F]">
                                    {targetChar === '-' ? '-' : ' '}
                                  </div>
                                </div>
                              );
                            }

                            if (isFirstGiven) {
                              return (
                                <div
                                  key={`box-${index}`}
                                  className="relative flex flex-col items-center shrink-0"
                                >
                                  <div
                                    className={`${tileClasses} ${shadowClass} border-[#78350F] bg-gradient-to-b from-[#FDE047] via-[#FBBF24] to-[#F59E0B] text-[#78350F] flex items-center justify-center font-black ${
                                      isCorrect ? 'scale-105 ring-2 ring-emerald-500' : ''
                                    }`}
                                  >
                                    {currentWord.firstLetter.toUpperCase()}
                                  </div>
                                </div>
                              );
                            }

                            return (
                              <div
                                key={`box-${index}`}
                                className="relative flex flex-col items-center shrink-0"
                              >
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (!isCorrect && !attemptUsed) {
                                      sound.playPop();
                                      setActiveSlot(index);
                                      hiddenInputRef.current?.focus();
                                    }
                                  }}
                                  className={`${tileClasses} text-center font-black uppercase transition-all cursor-pointer flex items-center justify-center relative ${
                                    isCorrect
                                      ? 'bg-emerald-100 border-emerald-600 text-emerald-800 shadow-[2px_3px_0px_#059669] scale-105'
                                      : isActive
                                      ? `bg-amber-50 border-amber-500 text-[#78350F] ${shadowClass} ring-2 sm:ring-3 ring-amber-400 scale-105`
                                      : isFilled
                                      ? `bg-white border-[#78350F] text-[#78350F] ${shadowClass}`
                                      : `bg-white/85 border-[#78350F]/70 text-[#78350F] ${shadowClass} hover:bg-amber-50/70`
                                  }`}
                                  id={`spelling-tile-${currentIndex}-${index}`}
                                >
                                  {inputs[index] || ''}

                                  {/* Active typing cursor indicator */}
                                  {isActive && !inputs[index] && (
                                    <span className={`inline-block w-0.5 ${cursorHeight} bg-amber-600 animate-pulse`} />
                                  )}
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })()}
                  </div>

                  {/* Bottom Controls */}
                  <div className="w-full pt-3 border-t-2 border-[#78350F]/20 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleUseHint}
                        disabled={isCorrect || attemptUsed}
                        className="px-3.5 py-2 bg-amber-200 hover:bg-amber-300 disabled:opacity-40 border-2 border-[#78350F] text-[#78350F] rounded-xl text-xs sm:text-sm font-black flex items-center gap-1.5 shadow-[2px_2px_0px_#78350F] transition-all cursor-pointer"
                        title="Reveal Next Letter"
                      >
                        <Lightbulb className="w-4 h-4 text-amber-800" />
                        <span>Get Hint</span>
                      </button>

                      <button
                        onClick={handleResetCurrent}
                        disabled={isCorrect || attemptUsed}
                        className="px-3.5 py-2 bg-white hover:bg-slate-100 disabled:opacity-40 border-2 border-[#78350F] text-[#78350F] rounded-xl text-xs sm:text-sm font-black flex items-center gap-1.5 shadow-[2px_2px_0px_#78350F] transition-all cursor-pointer"
                        title="Clear Inputs"
                      >
                        <RotateCcw className="w-4 h-4 text-[#78350F]" />
                        <span>Clear</span>
                      </button>

                      {/* On-Screen Keyboard Toggle */}
                      <button
                        onClick={() => {
                          sound.playPop();
                          setShowVirtualKeyboard((prev) => !prev);
                        }}
                        className={`px-3 py-2 border-2 border-[#78350F] rounded-xl text-xs sm:text-sm font-black flex items-center gap-1.5 shadow-[2px_2px_0px_#78350F] transition-all cursor-pointer ${
                          showVirtualKeyboard
                            ? 'bg-amber-300 text-[#78350F]'
                            : 'bg-white hover:bg-amber-50 text-[#78350F]'
                        }`}
                        title={showVirtualKeyboard ? 'Hide On-Screen Keyboard' : 'Show On-Screen Keyboard'}
                      >
                        <Keyboard className="w-4 h-4 text-[#78350F]" />
                        <span className="hidden sm:inline">
                          {showVirtualKeyboard ? 'Hide Keys' : 'Keyboard'}
                        </span>
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={handlePrev}
                        disabled={currentIndex === 0}
                        className="px-3.5 py-2 bg-[#FEF3C7] hover:bg-[#FDE68A] disabled:opacity-30 disabled:cursor-not-allowed border-2 border-[#78350F] text-[#78350F] rounded-xl text-xs sm:text-sm font-black flex items-center gap-1 shadow-[2px_2px_0px_#78350F] transition-all cursor-pointer"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Prev</span>
                      </button>

                      <button
                        onClick={handleNext}
                        disabled={currentIndex === totalQuestions - 1}
                        className="px-3.5 py-2 bg-[#FEF3C7] hover:bg-[#FDE68A] disabled:opacity-30 disabled:cursor-not-allowed border-2 border-[#78350F] text-[#78350F] rounded-xl text-xs sm:text-sm font-black flex items-center gap-1 shadow-[2px_2px_0px_#78350F] transition-all cursor-pointer"
                      >
                        <span>Next</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* ON-SCREEN VIRTUAL KEYBOARD */}
              <AnimatePresence>
                {showVirtualKeyboard && (
                  <motion.div
                    initial={{ opacity: 0, y: 15, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: 'auto' }}
                    exit={{ opacity: 0, y: 15, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="w-full max-w-3xl mt-5 bg-white/80 backdrop-blur-xs rounded-2xl border-3 border-[#78350F] p-3 sm:p-4 shadow-[4px_5px_0px_#78350F] flex flex-col gap-2 overflow-hidden"
                  >
                    {[
                      ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
                      ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
                      ['Z', 'X', 'C', 'V', 'B', 'N', 'M', '⌫'],
                    ].map((row, rowIdx) => (
                      <div key={`row-${rowIdx}`} className="flex justify-center gap-1 sm:gap-2">
                        {row.map((char) => {
                          const isBackspace = char === '⌫';

                          return (
                            <button
                              key={char}
                              type="button"
                              onClick={() => {
                                if (isBackspace) {
                                  processKey('Backspace');
                                } else {
                                  processKey(char);
                                }
                              }}
                              className={`h-10 sm:h-12 rounded-xl font-black text-sm sm:text-base border-2 border-[#78350F] transition-all active:scale-90 flex items-center justify-center cursor-pointer ${
                                isBackspace
                                  ? 'px-3 sm:px-4 bg-red-100 hover:bg-red-200 text-red-800 shadow-[1px_2px_0px_#78350F]'
                                  : 'w-7 sm:w-10 bg-white hover:bg-amber-50 text-[#78350F] shadow-[1px_2px_0px_#78350F]'
                              }`}
                            >
                              {char}
                            </button>
                          );
                        })}
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ) : (
            /* COMPLETION SUMMARY */
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white/95 rounded-3xl border-4 border-[#78350F] p-8 sm:p-12 shadow-[6px_8px_0px_#78350F] flex flex-col items-center text-center gap-6 max-w-lg w-full"
            >
              <div className="w-20 h-20 bg-gradient-to-tr from-amber-400 to-yellow-300 rounded-full border-4 border-[#78350F] flex items-center justify-center shadow-md">
                <Trophy className="w-10 h-10 text-[#78350F]" />
              </div>

              <div>
                <span className="text-xs font-black text-[#B45309] bg-amber-100 px-3 py-1 rounded-full border border-amber-300 uppercase">
                  {isPracticingMistakes ? 'MISTAKE BOOK PRACTICE COMPLETE!' : `${themeInfo.title}: ${themeInfo.name} COMPLETE!`}
                </span>
                <h2 className="text-2xl sm:text-4xl font-black text-[#78350F] mt-2 uppercase tracking-tight">
                  Awesome Job! 🎉
                </h2>
                <p className="text-sm font-bold text-slate-600 mt-2">
                  You completed all {totalQuestions} questions! {completedQuestions.size} were mastered on the first try.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 w-full">
                <div className="bg-amber-50 rounded-2xl border-2 border-amber-300 p-3 sm:p-4 flex flex-col items-center shadow-xs">
                  <span className="text-xl sm:text-2xl font-black text-emerald-700">
                    {completedQuestions.size} / {totalQuestions}
                  </span>
                  <span className="text-[11px] font-black text-slate-500 uppercase mt-1">
                    Mastered
                  </span>
                </div>

                <div className="bg-amber-50 rounded-2xl border-2 border-amber-300 p-3 sm:p-4 flex flex-col items-center shadow-xs">
                  <span className="text-xl sm:text-2xl font-black text-rose-600">
                    {failedQuestions.size}
                  </span>
                  <span className="text-[11px] font-black text-slate-500 uppercase mt-1">
                    In Bag 🎒
                  </span>
                </div>

                <div className="bg-amber-50 rounded-2xl border-2 border-amber-300 p-3 sm:p-4 flex flex-col items-center shadow-xs">
                  <span className="text-xl sm:text-2xl font-black text-orange-600 flex items-center gap-1">
                    <Flame className="w-4 h-4 fill-orange-500 text-orange-500 inline" />
                    {maxStreak >= 2 ? `${maxStreak}x` : '1x'}
                  </span>
                  <span className="text-[11px] font-black text-slate-500 uppercase mt-1">
                    Best Strike
                  </span>
                </div>

                <div className="bg-amber-50 rounded-2xl border-2 border-amber-300 p-3 sm:p-4 flex flex-col items-center shadow-xs">
                  <span className="text-xl sm:text-2xl font-black text-[#78350F] flex items-center gap-1">
                    <Timer className="w-4 h-4 text-amber-700 inline" />
                    {formatTime(elapsedSeconds)}
                  </span>
                  <span className="text-[11px] font-black text-slate-500 uppercase mt-1">
                    Time Spent
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3 w-full mt-2">
                <button
                  onClick={() => {
                    sound.playStart();
                    const newWords = isPracticingMistakes && mistakes.length > 0
                      ? mistakes.map((m) => ({
                          id: m.wordId,
                          word: m.word,
                          description: m.description,
                          firstLetter: m.firstLetter,
                          boxCount: m.boxCount,
                          chinese: m.chinese,
                          phonics: m.phonics,
                          imageUrl: m.imageUrl,
                        }))
                      : shuffleWords(getThemeWords(selectedThemeId));
                    setWords(newWords);
                    setQuestionImageModes(
                      generateQuestionImageModes(
                        newWords,
                        settings.wordImages,
                        settings.enableImageClues,
                        settings.imageRandomRate
                      )
                    );
                    setIsFinished(false);
                    setCurrentIndex(0);
                    setCompletedQuestions(new Set());
                    setFailedQuestions(new Set());
                    setHintsUsed(0);
                    setStreak(0);
                    setMaxStreak(0);
                    setElapsedSeconds(0);
                  }}
                  className="w-full sm:flex-1 py-3 bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-500 hover:to-yellow-500 border-3 border-[#78350F] rounded-2xl text-[#78350F] font-black text-sm shadow-[3px_3px_0px_#78350F] flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Practice Again</span>
                </button>

                <button
                  onClick={() => {
                    sound.playPop();
                    onBack();
                  }}
                  className="w-full sm:flex-1 py-3 bg-white hover:bg-slate-100 border-3 border-[#78350F] rounded-2xl text-[#78350F] font-black text-sm shadow-[3px_3px_0px_#78350F] flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>{isPracticingMistakes ? 'Back to Mistake Book' : 'Back to Themes'}</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* PICTURE FULL ZOOM MODAL */}
      <AnimatePresence>
        {isZoomModalOpen && availableImageUrl && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setIsZoomModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="relative max-w-2xl w-full bg-white rounded-3xl border-4 border-[#78350F] overflow-hidden shadow-2xl p-2"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={availableImageUrl}
                alt="Zoomed Clue"
                className="w-full h-auto max-h-[75vh] object-contain rounded-2xl"
              />
              <div className="p-3 text-center">
                <button
                  onClick={() => setIsZoomModalOpen(false)}
                  className="px-5 py-2 bg-[#F59E0B] text-[#78350F] font-black text-xs rounded-xl border-2 border-[#78350F] cursor-pointer"
                >
                  Close Zoom
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* PHONICS & CHINESE BREAKDOWN MODAL */}
      <AnimatePresence>
        {showPhonicsModal && modalWord && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.75, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.75, y: 20 }}
              transition={{ type: 'spring', damping: 18, stiffness: 280 }}
              className="relative max-w-lg w-full bg-white rounded-3xl border-5 border-[#78350F] p-6 sm:p-8 shadow-[8px_10px_0px_#78350F] flex flex-col items-center text-center gap-6 overflow-hidden"
            >
              {/* Header Status Tag */}
              <div className="flex flex-col items-center gap-1">
                {wasModalTriggeredByMistake ? (
                  <>
                    <span className="px-4 py-1.5 bg-rose-100 text-rose-800 rounded-full border-2 border-rose-500 font-black text-xs sm:text-sm uppercase tracking-wider flex items-center gap-1.5 shadow-xs">
                      <XCircle className="w-4 h-4 text-rose-600" />
                      <span>1 Attempt Missed • Correct Word Breakdown</span>
                    </span>
                    <span className="text-[11px] font-bold text-rose-700 flex items-center gap-1 mt-0.5">
                      <span>Word will fly into your Bag of Mistakes</span>
                      <span className="text-sm">🎒</span>
                    </span>
                  </>
                ) : (
                  <span className="px-4 py-1.5 bg-emerald-100 text-emerald-800 rounded-full border-2 border-emerald-500 font-black text-xs sm:text-sm uppercase tracking-wider flex items-center gap-1.5 shadow-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Mastered on 1st Attempt! 🎉</span>
                  </span>
                )}
              </div>

              {/* Full Word */}
              <div className="flex flex-col items-center gap-1">
                <h3 className="text-3xl sm:text-5xl font-black text-[#78350F] tracking-tight uppercase drop-shadow-sm">
                  {modalWord.word}
                </h3>
              </div>

              {/* Syllable Segments */}
              <div className="w-full flex flex-col items-center gap-2">
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-500">
                  Syllable Breakdown • 音节拆分
                </span>
                <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
                  {modalWord.phonics.map((syllable, idx) => (
                    <React.Fragment key={idx}>
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-b from-[#FEF08A] to-[#F59E0B] rounded-2xl border-3 border-[#78350F] text-[#78350F] font-black text-2xl sm:text-4xl shadow-[3px_4px_0px_#78350F] tracking-wide"
                      >
                        {syllable}
                      </motion.div>
                      {idx < modalWord.phonics.length - 1 && (
                        <span className="text-2xl font-black text-[#78350F]/50">
                          •
                        </span>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>

              {/* Chinese Meaning */}
              <div className="w-full bg-white/90 rounded-2xl border-3 border-[#78350F] p-4 sm:p-5 shadow-xs flex flex-col items-center justify-center gap-1">
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-500">
                  中文意思
                </span>
                <p className="text-2xl sm:text-3xl font-black text-[#78350F] tracking-tight">
                  {modalWord.chinese}
                </p>
              </div>

              {/* Pronunciation & Voice Customization Buttons */}
              <div className="flex items-center flex-wrap justify-center gap-2.5">
                <button
                  onClick={() => handlePronounceWord(modalWord.word)}
                  className="px-4 sm:px-5 py-2.5 bg-[#FEF3C7] hover:bg-[#FDE68A] text-[#78350F] rounded-full border-2 border-[#78350F] text-xs sm:text-sm font-black flex items-center gap-2 shadow-[2px_2px_0px_#78350F] transition-all cursor-pointer active:scale-95"
                  title="Listen to Word Pronunciation"
                >
                  <Volume2 className="w-4 h-4 sm:w-5 sm:h-5 text-[#B45309]" />
                  <span>Hear Pronunciation</span>
                </button>

                <button
                  onClick={() => {
                    sound.playPop();
                    setIsVoiceModalOpen(true);
                  }}
                  className="px-3.5 py-2 bg-amber-100/90 hover:bg-amber-200 text-[#78350F] rounded-full border border-[#78350F]/50 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs transition-all"
                  title="Change voice, accent, speed, or tone"
                >
                  <span>🗣️ Change Voice</span>
                </button>
              </div>

              {/* Next Question CTA */}
              <button
                id="btn-modal-next-word"
                onClick={handleAdvanceFromModal}
                className={`w-full py-3.5 sm:py-4 text-white rounded-2xl border-3 border-[#78350F] font-black text-base sm:text-lg shadow-[4px_4px_0px_#78350F] flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] ${
                  wasModalTriggeredByMistake
                    ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 hover:from-amber-600 hover:to-rose-600'
                    : 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700'
                }`}
              >
                <span>
                  {wasModalTriggeredByMistake
                    ? 'Fly to Bag & Next Word 🎒'
                    : currentIndex < totalQuestions - 1
                    ? 'Next Word'
                    : 'See Results'}
                </span>
                <ArrowRight className="w-5 h-5" />
              </button>

              <span className="text-[11px] font-bold text-slate-500 -mt-2">
                (Or press <kbd className="px-1.5 py-0.5 bg-slate-200 border rounded font-mono text-[10px]">Enter</kbd> / <kbd className="px-1.5 py-0.5 bg-slate-200 border rounded font-mono text-[10px]">Space</kbd>)
              </span>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* QUICK VOICE SETTINGS MODAL */}
      <AnimatePresence>
        {isVoiceModalOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs overflow-y-auto"
            onClick={() => setIsVoiceModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 15 }}
              className="relative max-w-xl w-full bg-white rounded-3xl border-4 border-[#78350F] shadow-[8px_8px_0px_#78350F] overflow-hidden p-4 sm:p-6 space-y-4 my-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-2 border-b-2 border-[#FEF3C7]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#F59E0B] border-2 border-[#78350F] flex items-center justify-center text-[#78350F]">
                    <Volume2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-[#78350F] uppercase">
                      Read Aloud Voice Settings
                    </h3>
                    <p className="text-[11px] font-bold text-[#B45309]">
                      Select your preferred voice accent, reading speed, and pitch
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    sound.playPop();
                    setIsVoiceModalOpen(false);
                  }}
                  className="p-1.5 bg-amber-100 hover:bg-amber-200 text-[#78350F] rounded-full border-2 border-[#78350F] cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <VoiceSettingsPanel onClose={() => setIsVoiceModalOpen(false)} />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
