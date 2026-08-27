import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Volume2,
  VolumeX,
  RotateCcw,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Trophy,
  Lightbulb,
  ZoomIn,
  Timer,
  Flame,
  Keyboard,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { SpellingWord, WORKSHEET_QUESTIONS } from '../data/theme1Words';
import { useApp } from '../context/AppContext';
import { sound } from '../utils/audio';

interface Screen3Props {
  onRestart?: () => void;
  initialQuestionIndex?: number;
}

// Time format helper: MM:SS
function formatTime(totalSeconds: number): string {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// Thinking time limit per question in seconds
const QUESTION_TIME_LIMIT = 20;

export const Screen3: React.FC<Screen3Props> = ({
  onRestart,
  initialQuestionIndex = 0,
}) => {
  const { settings, updateSettings, markWordMastered } = useApp();

  const words: SpellingWord[] = WORKSHEET_QUESTIONS;
  const [currentIndex, setCurrentIndex] = useState<number>(initialQuestionIndex);
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

  // Modals
  const [isZoomModalOpen, setIsZoomModalOpen] = useState<boolean>(false);

  // Phonics & Chinese Popout Modal State
  const [showPhonicsModal, setShowPhonicsModal] = useState<boolean>(false);
  const [modalWord, setModalWord] = useState<SpellingWord | null>(null);
  const [wasModalTriggeredByMistake, setWasModalTriggeredByMistake] = useState<boolean>(false);

  // On-screen virtual keyboard visibility
  const [showVirtualKeyboard, setShowVirtualKeyboard] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    const isTouchOnly = ('ontouchstart' in window || navigator.maxTouchPoints > 0) && window.innerWidth < 1024;
    return isTouchOnly;
  });

  const currentWord: SpellingWord = words[currentIndex] || words[0];
  const targetLetters = currentWord ? currentWord.word.toUpperCase().split('') : [];
  const totalQuestions = words.length;

  // Resolve current active image URL
  const customImg = settings.wordImages?.[currentWord?.id];
  const availableImageUrl = customImg !== undefined && customImg.trim() !== '' ? customImg : currentWord?.imageUrl || '';

  // Whether current question has image available
  const hasValidImage = Boolean(availableImageUrl && availableImageUrl.trim() !== '');

  // Initialize question state whenever current index or word changes
  useEffect(() => {
    if (!currentWord) return;
    const letters = currentWord.word.toUpperCase().split('');
    const initialInputs = new Array(letters.length).fill('');

    // Pre-fill hyphens and spaces automatically
    letters.forEach((char, idx) => {
      if (char === '-' || char === ' ') {
        initialInputs[idx] = char;
      }
    });

    if (hasValidImage) {
      let firstSlot = 0;
      while (firstSlot < letters.length && (letters[firstSlot] === '-' || letters[firstSlot] === ' ')) {
        firstSlot++;
      }
      setActiveSlot(firstSlot);
    } else {
      // First letter is given as clue in 1st box
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
  }, [currentIndex, currentWord, hasValidImage]);

  // Overall practice timer
  useEffect(() => {
    if (isFinished) return;
    const interval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isFinished]);

  // Read out the word when the syllable / phonics popup appears
  useEffect(() => {
    if (showPhonicsModal && modalWord) {
      sound.speakWord(modalWord.word);
    }
  }, [showPhonicsModal, modalWord]);

  // Trigger mistake on timeout
  const triggerMistakeRecord = useCallback(
    (reason: 'wrong_spelling' | 'time_out') => {
      if (!currentWord || attemptUsed || isCorrect || showPhonicsModal) return;

      setAttemptUsed(true);
      setStreak(0);
      setFailedQuestions((prev) => new Set(prev).add(currentIndex));

      sound.playWrong();

      // Open Correct Answer / Phonics modal for review
      setModalWord(currentWord);
      setWasModalTriggeredByMistake(true);
      setShowPhonicsModal(true);
    },
    [currentWord, attemptUsed, isCorrect, showPhonicsModal, currentIndex]
  );

  // Per-Question Thinking Countdown Timer (1 Attempt Thinking Limit)
  useEffect(() => {
    if (isFinished || isCorrect || showPhonicsModal || attemptUsed) {
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
  }, [isFinished, isCorrect, showPhonicsModal, attemptUsed]);

  // Handle timeout triggering
  useEffect(() => {
    if (
      timeLeft === 0 &&
      !attemptUsed &&
      !isCorrect &&
      !showPhonicsModal &&
      currentWord &&
      !isFinished
    ) {
      triggerMistakeRecord('time_out');
    }
  }, [timeLeft, attemptUsed, isCorrect, showPhonicsModal, currentWord, isFinished, triggerMistakeRecord]);

  // Check answer automatically on 1 attempt
  const handleValidateAnswer = useCallback(
    (currentInputs: string[], wordObj: SpellingWord) => {
      if (isCorrect || showPhonicsModal || attemptUsed || !wordObj) return;

      const typedWord = currentInputs.join('').toUpperCase();
      const targetWord = wordObj.word.toUpperCase();
      const alternateWords = (wordObj.alternateAnswers || []).map((a) => a.toUpperCase());
      const isAllFilled = currentInputs.every((char) => char && char.trim() !== '');

      const isMatch = typedWord === targetWord || alternateWords.includes(typedWord);

      if (isMatch) {
        // CORRECT ANSWER (1st Attempt Passed!)
        setIsCorrect(true);
        setAttemptUsed(true);
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
          triggerMistakeRecord('wrong_spelling');
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
      const minEditableIndex = hasValidImage ? 0 : 1;

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
    [isFinished, isCorrect, showPhonicsModal, attemptUsed, activeSlot, currentWord, hasValidImage, inputs, handleValidateAnswer]
  );

  // Advance to next question from modal
  const handleAdvanceFromModal = useCallback(() => {
    sound.playPop();
    setShowPhonicsModal(false);
    setModalWord(null);
    setWasModalTriggeredByMistake(false);

    // Advance to next question or finish
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsFinished(true);
      sound.playCelebration();
      try {
        confetti({
          particleCount: 120,
          spread: 100,
          origin: { y: 0.5 },
        });
      } catch {
        // ignore
      }
    }
  }, [currentIndex, totalQuestions]);

  // Global Keyboard listener
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      const activeTag = (document.activeElement?.tagName || '').toLowerCase();
      if (activeTag === 'input' || activeTag === 'textarea') {
        return;
      }

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

      // Process typing
      if (!isFinished && !showPhonicsModal && !isZoomModalOpen) {
        if (/^[a-zA-Z]$/.test(e.key) || e.key === 'Backspace' || e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
          e.preventDefault();
        }
        processKey(e.key);
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [isFinished, showPhonicsModal, isZoomModalOpen, processKey, handleAdvanceFromModal]);

  // Sound toggle
  const handleToggleMute = () => {
    const isMuted = sound.toggleMute();
    updateSettings({ soundEnabled: !isMuted });
    if (!isMuted) {
      sound.playPop();
    }
  };

  // Provide next letter hint
  const handleUseHint = () => {
    if (isCorrect || showPhonicsModal || attemptUsed || !currentWord) return;

    sound.playPop();
    setHintsUsed((prev) => prev + 1);

    const letters = currentWord.word.toUpperCase().split('');
    const next = [...inputs];

    const minEditableIndex = hasValidImage ? 0 : 1;
    let targetSlot = -1;

    for (let i = minEditableIndex; i < letters.length; i++) {
      if (letters[i] === '-' || letters[i] === ' ') continue;
      if (!next[i] || next[i] !== letters[i]) {
        targetSlot = i;
        break;
      }
    }

    if (targetSlot !== -1) {
      next[targetSlot] = letters[targetSlot];
      setInputs(next);

      let nextFocus = targetSlot + 1;
      while (nextFocus < letters.length && (letters[nextFocus] === '-' || letters[nextFocus] === ' ')) {
        nextFocus++;
      }
      if (nextFocus < letters.length) {
        setActiveSlot(nextFocus);
      }

      handleValidateAnswer(next, currentWord);
    }
  };

  // Reset inputs for current word
  const handleResetCurrent = () => {
    if (isCorrect || attemptUsed || !currentWord) return;
    sound.playPop();

    const letters = currentWord.word.toUpperCase().split('');
    const resetInputs = new Array(letters.length).fill('');

    letters.forEach((char, idx) => {
      if (char === '-' || char === ' ') {
        resetInputs[idx] = char;
      }
    });

    if (hasValidImage) {
      let firstSlot = 0;
      while (firstSlot < letters.length && (letters[firstSlot] === '-' || letters[firstSlot] === ' ')) {
        firstSlot++;
      }
      setActiveSlot(firstSlot);
    } else {
      resetInputs[0] = currentWord.firstLetter.toUpperCase();
      let firstSlot = 1;
      while (firstSlot < letters.length && (letters[firstSlot] === '-' || letters[firstSlot] === ' ')) {
        firstSlot++;
      }
      setActiveSlot(firstSlot);
    }

    setInputs(resetInputs);
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

  const handleRestartFull = () => {
    sound.playPop();
    setCompletedQuestions(new Set());
    setFailedQuestions(new Set());
    setStreak(0);
    setMaxStreak(0);
    setElapsedSeconds(0);
    setHintsUsed(0);
    setCurrentIndex(0);
    setIsFinished(false);
    if (onRestart) {
      onRestart();
    }
  };

  if (!currentWord) {
    return null;
  }

  return (
    <div className="relative min-h-screen bg-[#FEF3C7] text-[#78350F] flex flex-col font-sans select-none overflow-x-hidden p-4 sm:p-6 md:p-8 justify-center items-center">
      {/* STRIKE POPUP OVERLAY */}
      <AnimatePresence>
        {strikePopup && (
          <motion.div
            initial={{ opacity: 0, scale: 0.4, y: 30 }}
            animate={{ opacity: 1, scale: 1.1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -30 }}
            transition={{ type: 'spring', damping: 14, stiffness: 300 }}
            className="fixed top-12 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
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

      {/* MAIN CONTENT WRAPPER */}
      <div className="relative z-10 w-full max-w-4xl flex flex-col items-center">
        {!isFinished ? (
          <motion.div
            key={`q-${currentIndex}`}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="w-full flex flex-col items-center space-y-4"
          >
            {/* TOP CARD CONTROLS: 8 Question Badges, Timer, Sound */}
            <div className="w-full bg-white/90 backdrop-blur-md rounded-2xl border-3 border-[#78350F] px-4 py-2.5 shadow-[4px_4px_0px_#78350F] flex flex-wrap items-center justify-between gap-2">
              {/* Question Indicators (1 to 8) */}
              <div className="flex items-center gap-1.5 sm:gap-2">
                {words.map((w, idx) => {
                  const isCur = idx === currentIndex;
                  const isDone = completedQuestions.has(idx);
                  const isFailed = failedQuestions.has(idx);

                  return (
                    <button
                      key={w.id}
                      onClick={() => {
                        sound.playPop();
                        setCurrentIndex(idx);
                      }}
                      className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl border-2 text-xs sm:text-sm font-black flex items-center justify-center cursor-pointer transition-all duration-200 active:scale-95 ${
                        isCur
                          ? 'bg-[#F59E0B] border-[#78350F] text-[#78350F] scale-110 shadow-[2px_2px_0px_#78350F] ring-2 ring-amber-400 font-black'
                          : isDone
                          ? 'bg-emerald-500 border-[#78350F] text-white shadow-xs'
                          : isFailed
                          ? 'bg-rose-500 border-[#78350F] text-white shadow-xs'
                          : 'bg-white border-[#78350F]/70 text-[#78350F] hover:bg-amber-50 shadow-2xs'
                      }`}
                      title={`Question ${idx + 1}`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>

              {/* Right status: Timer, Streak, Sound */}
              <div className="flex items-center gap-2 sm:gap-3">
                {/* Streak Badge */}
                {streak >= 2 && (
                  <div className="flex items-center gap-1 px-2.5 py-1 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full border-2 border-[#78350F] text-white text-xs font-black shadow-xs">
                    <Flame className="w-3.5 h-3.5 fill-yellow-200 text-yellow-200" />
                    <span>{streak}x</span>
                  </div>
                )}

                {/* 20s Thinking Timer */}
                <div
                  className={`flex items-center gap-1 px-3 py-1 rounded-full border-2 border-[#78350F] text-xs font-black shadow-xs ${
                    timeLeft <= 5
                      ? 'bg-rose-500 text-white animate-pulse'
                      : timeLeft <= 10
                      ? 'bg-amber-300 text-[#78350F]'
                      : 'bg-[#FFFBEB] text-[#78350F]'
                  }`}
                  title="Thinking timer"
                >
                  <Timer className="w-3.5 h-3.5" />
                  <span>{timeLeft}s</span>
                </div>

                {/* Sound Mute Toggle */}
                <button
                  onClick={handleToggleMute}
                  className="p-1.5 bg-[#FFFBEB] hover:bg-amber-100 rounded-full border-2 border-[#78350F] text-[#78350F] shadow-xs cursor-pointer"
                  title={settings.soundEnabled ? 'Mute Audio' : 'Unmute Audio'}
                >
                  {!settings.soundEnabled ? (
                    <VolumeX className="w-4 h-4 text-slate-400" />
                  ) : (
                    <Volume2 className="w-4 h-4 text-[#B45309]" />
                  )}
                </button>
              </div>
            </div>

            {/* PRIMARY QUESTION CARD */}
            <div
              className={`w-full bg-white/95 rounded-3xl border-4 border-[#78350F] p-5 sm:p-7 md:p-8 shadow-[6px_8px_0px_#78350F] grid grid-cols-1 md:grid-cols-12 gap-6 items-center transition-transform ${
                isShaking ? 'animate-[wiggle_0.4s_ease-in-out]' : ''
              }`}
            >
              {/* LEFT COLUMN: Image Clue or First Letter Box */}
              <div className="w-full md:col-span-5 flex flex-col items-center justify-center">
                {hasValidImage ? (
                  /* Image Clue Card with Zoom */
                  <div className="w-full max-w-xs bg-amber-50/70 rounded-2xl border-3 border-[#78350F] p-3 shadow-[3px_4px_0px_#78350F] flex flex-col items-center gap-2">
                    <div className="relative w-full h-44 sm:h-52 bg-white rounded-xl overflow-hidden border-2 border-[#78350F]/30 flex items-center justify-center p-2">
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
                        title="Click to Zoom Image"
                      >
                        <ZoomIn className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <span className="text-[11px] font-black text-[#78350F] uppercase tracking-wide">
                      Clue Image • Question #{currentIndex + 1}
                    </span>
                  </div>
                ) : (
                  /* First Letter Clue Card */
                  <div className="w-full max-w-xs bg-gradient-to-b from-[#FEF3C7] to-[#FDE68A] rounded-2xl border-3 border-[#78350F] p-5 shadow-[4px_5px_0px_#78350F] flex flex-col items-center text-center gap-2">
                    <span className="text-xs font-black text-[#B45309] uppercase tracking-wider">
                      First Letter Clue
                    </span>
                    <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white rounded-2xl border-4 border-[#78350F] flex items-center justify-center text-5xl sm:text-6xl font-black text-[#78350F] shadow-[3px_4px_0px_#78350F]">
                      {currentWord.firstLetter.toUpperCase()}
                    </div>
                    <span className="text-[11px] font-bold text-[#78350F]/80">
                      Starts with letter &apos;{currentWord.firstLetter.toUpperCase()}&apos; • {targetLetters.length} letters
                    </span>
                  </div>
                )}
              </div>

              {/* RIGHT COLUMN: Question Description, Audio, Letter Slots */}
              <div className="w-full md:col-span-7 flex flex-col items-center md:items-start text-center md:text-left space-y-4">
                {/* Definition Clue Banner */}
                <div className="w-full bg-[#FFFBEB] rounded-2xl border-3 border-[#FDE047] p-4 shadow-xs relative">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-base sm:text-lg md:text-xl font-bold text-[#78350F] leading-snug">
                      &ldquo;{currentWord.description}&rdquo;
                    </p>
                    <button
                      onClick={() => sound.speakWord(currentWord.description)}
                      className="p-2 bg-white hover:bg-amber-100 rounded-full border-2 border-[#78350F] text-[#78350F] shadow-xs shrink-0 cursor-pointer"
                      title="Read Clue Aloud"
                    >
                      <Volume2 className="w-4 h-4 text-[#B45309]" />
                    </button>
                  </div>
                </div>

                {/* LETTER INPUT TILES */}
                <div className="w-full flex flex-col items-center md:items-start gap-2 pt-2">
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-1.5 sm:gap-2">
                    {targetLetters.map((char, index) => {
                      const isHyphenOrSpace = char === '-' || char === ' ';
                      const isGivenClue = !hasValidImage && index === 0;
                      const isActive = activeSlot === index && !isCorrect && !attemptUsed;
                      const val = inputs[index] || '';

                      if (isHyphenOrSpace) {
                        return (
                          <div
                            key={index}
                            className="w-5 sm:w-7 h-10 sm:h-12 flex items-center justify-center text-lg sm:text-xl font-black text-[#78350F]"
                          >
                            {char}
                          </div>
                        );
                      }

                      return (
                        <div
                          key={index}
                          onClick={() => {
                            if (!isGivenClue && !isCorrect && !attemptUsed) {
                              sound.playPop();
                              setActiveSlot(index);
                            }
                          }}
                          className={`w-9 h-11 sm:w-11 sm:h-13 rounded-xl border-3 text-lg sm:text-2xl font-black uppercase transition-all flex items-center justify-center select-none cursor-pointer ${
                            isGivenClue
                              ? 'bg-amber-100 border-[#78350F] text-[#78350F] cursor-default'
                              : isCorrect
                              ? 'bg-emerald-400 border-[#78350F] text-white shadow-xs'
                              : isActive
                              ? 'bg-white border-[#78350F] text-[#78350F] ring-3 ring-amber-400 scale-105 shadow-[2px_3px_0px_#78350F]'
                              : val
                              ? 'bg-white border-[#78350F] text-[#78350F] shadow-xs'
                              : 'bg-amber-50/60 border-[#78350F]/60 text-[#78350F] hover:bg-white'
                          }`}
                        >
                          {val}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* ACTION TOOLBAR: Hint, Clear, Keyboard Toggle, Prev, Next */}
                <div className="w-full pt-3 flex flex-wrap items-center justify-between gap-2 border-t-2 border-amber-100">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    {/* Hint Button */}
                    <button
                      onClick={handleUseHint}
                      disabled={isCorrect || attemptUsed}
                      className="px-3 py-1.5 bg-[#FFFBEB] hover:bg-[#FEF3C7] disabled:opacity-50 text-[#78350F] rounded-xl border-2 border-[#78350F] text-xs font-black flex items-center gap-1 shadow-xs cursor-pointer active:scale-95"
                      title="Reveal 1 letter hint"
                    >
                      <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
                      <span>Hint</span>
                    </button>

                    {/* Clear Button */}
                    <button
                      onClick={handleResetCurrent}
                      disabled={isCorrect || attemptUsed}
                      className="px-3 py-1.5 bg-[#FFFBEB] hover:bg-[#FEF3C7] disabled:opacity-50 text-[#78350F] rounded-xl border-2 border-[#78350F] text-xs font-black flex items-center gap-1 shadow-xs cursor-pointer active:scale-95"
                      title="Clear boxes"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-amber-700" />
                      <span>Clear</span>
                    </button>

                    {/* Keyboard Toggle */}
                    <button
                      onClick={() => {
                        sound.playPop();
                        setShowVirtualKeyboard((prev) => !prev);
                      }}
                      className={`px-3 py-1.5 rounded-xl border-2 border-[#78350F] text-xs font-black flex items-center gap-1 shadow-xs cursor-pointer active:scale-95 ${
                        showVirtualKeyboard ? 'bg-amber-300 text-[#78350F]' : 'bg-[#FFFBEB] text-[#78350F]'
                      }`}
                      title="Toggle on-screen keyboard"
                    >
                      <Keyboard className="w-3.5 h-3.5 text-amber-800" />
                      <span className="hidden sm:inline">Keys</span>
                    </button>
                  </div>

                  {/* Prev & Next Question Buttons */}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={handlePrev}
                      disabled={currentIndex === 0}
                      className="p-1.5 sm:px-2.5 sm:py-1.5 bg-white hover:bg-amber-50 disabled:opacity-30 rounded-xl border-2 border-[#78350F] text-[#78350F] text-xs font-black flex items-center gap-1 shadow-xs cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Prev</span>
                    </button>

                    <button
                      onClick={handleNext}
                      disabled={currentIndex === totalQuestions - 1}
                      className="p-1.5 sm:px-2.5 sm:py-1.5 bg-[#F59E0B] hover:bg-amber-500 disabled:opacity-30 rounded-xl border-2 border-[#78350F] text-[#78350F] text-xs font-black flex items-center gap-1 shadow-xs cursor-pointer"
                    >
                      <span className="hidden sm:inline">Next</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* ON-SCREEN VIRTUAL KEYBOARD (QWERTY) */}
            <AnimatePresence>
              {showVirtualKeyboard && !isFinished && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 15 }}
                  className="w-full bg-white/95 rounded-2xl border-3 border-[#78350F] p-3 shadow-[4px_4px_0px_#78350F] flex flex-col items-center gap-1.5"
                >
                  {/* Row 1 */}
                  <div className="flex justify-center gap-1 sm:gap-1.5 w-full">
                    {'QWERTYUIOP'.split('').map((char) => (
                      <button
                        key={char}
                        onClick={() => processKey(char)}
                        className="flex-1 max-w-10 h-10 sm:h-11 bg-amber-50 hover:bg-amber-100 active:bg-amber-300 border-2 border-[#78350F] rounded-lg text-sm sm:text-base font-black text-[#78350F] shadow-xs cursor-pointer active:scale-95"
                      >
                        {char}
                      </button>
                    ))}
                  </div>

                  {/* Row 2 */}
                  <div className="flex justify-center gap-1 sm:gap-1.5 w-full max-w-xl">
                    {'ASDFGHJKL'.split('').map((char) => (
                      <button
                        key={char}
                        onClick={() => processKey(char)}
                        className="flex-1 max-w-10 h-10 sm:h-11 bg-amber-50 hover:bg-amber-100 active:bg-amber-300 border-2 border-[#78350F] rounded-lg text-sm sm:text-base font-black text-[#78350F] shadow-xs cursor-pointer active:scale-95"
                      >
                        {char}
                      </button>
                    ))}
                  </div>

                  {/* Row 3 */}
                  <div className="flex justify-center gap-1 sm:gap-1.5 w-full max-w-xl">
                    {'ZXCVBNM'.split('').map((char) => (
                      <button
                        key={char}
                        onClick={() => processKey(char)}
                        className="flex-1 max-w-10 h-10 sm:h-11 bg-amber-50 hover:bg-amber-100 active:bg-amber-300 border-2 border-[#78350F] rounded-lg text-sm sm:text-base font-black text-[#78350F] shadow-xs cursor-pointer active:scale-95"
                      >
                        {char}
                      </button>
                    ))}
                    <button
                      onClick={() => processKey('Backspace')}
                      className="px-3 h-10 sm:h-11 bg-rose-100 hover:bg-rose-200 active:bg-rose-300 border-2 border-[#78350F] rounded-lg text-xs sm:text-sm font-black text-rose-800 shadow-xs cursor-pointer active:scale-95"
                      title="Backspace"
                    >
                      ⌫
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ) : (
          /* COMPLETION RESULTS VIEW */
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full bg-white/95 rounded-3xl border-4 border-[#78350F] p-6 sm:p-10 shadow-[8px_10px_0px_#78350F] flex flex-col items-center text-center space-y-6"
          >
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-tr from-amber-400 to-yellow-300 rounded-3xl border-4 border-[#78350F] flex items-center justify-center text-4xl sm:text-5xl shadow-[4px_4px_0px_#78350F]">
              🏆
            </div>

            <div>
              <h2 className="text-2xl sm:text-4xl font-black text-[#78350F] uppercase tracking-tight">
                Practice Completed!
              </h2>
              <p className="text-sm sm:text-base font-bold text-[#92400E] mt-1">
                You went through all 8 vocabulary questions of Worksheet Part 5.
              </p>
            </div>

            {/* Stats Summary Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 w-full max-w-xl">
              <div className="p-3 bg-emerald-50 rounded-2xl border-2 border-emerald-300 flex flex-col items-center">
                <span className="text-2xl sm:text-3xl font-black text-emerald-700">
                  {completedQuestions.size}/{totalQuestions}
                </span>
                <span className="text-xs font-bold text-emerald-800">Correct</span>
              </div>

              <div className="p-3 bg-amber-50 rounded-2xl border-2 border-amber-300 flex flex-col items-center">
                <span className="text-2xl sm:text-3xl font-black text-amber-700">
                  {maxStreak}x
                </span>
                <span className="text-xs font-bold text-amber-800">Max Strike</span>
              </div>

              <div className="p-3 bg-amber-50 rounded-2xl border-2 border-amber-300 flex flex-col items-center">
                <span className="text-2xl sm:text-3xl font-black text-amber-700">
                  {hintsUsed}
                </span>
                <span className="text-xs font-bold text-amber-800">Hints Used</span>
              </div>

              <div className="p-3 bg-blue-50 rounded-2xl border-2 border-blue-300 flex flex-col items-center">
                <span className="text-2xl sm:text-3xl font-black text-blue-700">
                  {formatTime(elapsedSeconds)}
                </span>
                <span className="text-xs font-bold text-blue-800">Total Time</span>
              </div>
            </div>

            {/* Word List Recap */}
            <div className="w-full max-w-xl bg-amber-50/50 rounded-2xl border-2 border-amber-200 p-3 sm:p-4 text-left">
              <span className="text-xs font-black uppercase text-[#78350F] block mb-2">
                Vocabulary Recap:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {words.map((w, idx) => {
                  const wasSuccess = completedQuestions.has(idx);
                  return (
                    <div
                      key={w.id}
                      className={`p-2 rounded-xl border text-xs font-bold flex items-center justify-between ${
                        wasSuccess
                          ? 'bg-emerald-100 border-emerald-300 text-emerald-900'
                          : 'bg-rose-100 border-rose-300 text-rose-900'
                      }`}
                    >
                      <span className="capitalize">{w.word}</span>
                      <span>{wasSuccess ? '✓' : '✗'}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Restart Challenge Button */}
            <button
              onClick={handleRestartFull}
              className="px-8 py-3.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-[#78350F] font-black rounded-2xl border-3 border-[#78350F] shadow-[4px_5px_0px_#78350F] text-base sm:text-lg flex items-center gap-2 cursor-pointer transition-all active:scale-95"
            >
              <RotateCcw className="w-5 h-5" />
              <span>Restart Challenge (5s Countdown)</span>
            </button>
          </motion.div>
        )}
      </div>

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
              className="relative max-w-lg w-full bg-white rounded-3xl border-5 border-[#78350F] p-6 sm:p-8 shadow-[8px_10px_0px_#78350F] flex flex-col items-center text-center gap-5 overflow-hidden"
            >
              {/* Status Header */}
              <div className="flex flex-col items-center gap-1">
                {wasModalTriggeredByMistake ? (
                  <span className="px-4 py-1.5 bg-rose-100 text-rose-800 rounded-full border-2 border-rose-500 font-black text-xs sm:text-sm uppercase tracking-wider flex items-center gap-1.5 shadow-xs">
                    <XCircle className="w-4 h-4 text-rose-600" />
                    <span>Time/Attempt Ended • Correct Answer</span>
                  </span>
                ) : (
                  <span className="px-4 py-1.5 bg-emerald-100 text-emerald-800 rounded-full border-2 border-emerald-500 font-black text-xs sm:text-sm uppercase tracking-wider flex items-center gap-1.5 shadow-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Correct! 🎉</span>
                  </span>
                )}
              </div>

              {/* Word Title */}
              <h3 className="text-3xl sm:text-5xl font-black text-[#78350F] tracking-tight uppercase drop-shadow-sm">
                {modalWord.word}
              </h3>

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
                        className="px-4 sm:px-6 py-2 bg-gradient-to-b from-[#FEF08A] to-[#F59E0B] rounded-2xl border-3 border-[#78350F] text-[#78350F] font-black text-2xl sm:text-3xl shadow-[3px_4px_0px_#78350F] tracking-wide"
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
              <div className="w-full bg-[#FFFBEB] rounded-2xl border-3 border-[#78350F] p-3 sm:p-4 shadow-xs flex flex-col items-center justify-center gap-1">
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-500">
                  中文意思
                </span>
                <p className="text-2xl sm:text-3xl font-black text-[#78350F] tracking-tight">
                  {modalWord.chinese}
                </p>
              </div>

              {/* Audio Pronunciation Button */}
              <button
                onClick={() => sound.speakWord(modalWord.word)}
                className="px-5 py-2.5 bg-[#FEF3C7] hover:bg-[#FDE68A] text-[#78350F] rounded-full border-2 border-[#78350F] text-xs sm:text-sm font-black flex items-center gap-2 shadow-[2px_2px_0px_#78350F] transition-all cursor-pointer active:scale-95"
              >
                <Volume2 className="w-4 h-4 text-[#B45309]" />
                <span>Hear Pronunciation</span>
              </button>

              {/* Next Question CTA */}
              <button
                onClick={handleAdvanceFromModal}
                className="w-full py-3.5 text-white rounded-2xl border-3 border-[#78350F] font-black text-base sm:text-lg shadow-[4px_4px_0px_#78350F] flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
              >
                <span>
                  {currentIndex < totalQuestions - 1
                    ? 'Next Question'
                    : 'See Results'}
                </span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
