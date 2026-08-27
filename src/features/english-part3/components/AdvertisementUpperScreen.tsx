import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Check,
  Trophy,
  Volume2,
  VolumeX,
  Settings,
  BookOpen,
  Volume1,
  X,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useApp } from '../context/AppContext';
import { sound } from '../utils/audio';
import { WorksheetQuestion, VocabularyTooltip } from '../types';
import { FairyDustEffect } from './FairyDustEffect';

// Small cute Bee Icon for hint buttons
const BeeHintIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
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

export const AdvertisementUpperScreen: React.FC<{
  onBack: () => void;
}> = ({ onBack }) => {
  const { settings, setIsAdminOpen } = useApp();
  const passage = settings.passage;
  const questions = settings.questions;

  // Active question state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [viewMode, setViewMode] = useState<'step' | 'all'>('step');
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [checkedAnswers, setCheckedAnswers] = useState<
    Record<string, { isMatch: boolean; score: number; feedbackMsg?: string }>
  >({});
  const [wrongAttempts, setWrongAttempts] = useState<Record<string, number>>({});
  const [shakeQuestionId, setShakeQuestionId] = useState<string | null>(null);

  // Fairy Dust & Glowing Clue State
  const [fairyDustActive, setFairyDustActive] = useState<boolean>(false);
  const [fairyStartPos, setFairyStartPos] = useState<{ x: number; y: number } | null>(null);
  const [fairyTargetPos, setFairyTargetPos] = useState<{ x: number; y: number } | null>(null);
  const [glowingClueTarget, setGlowingClueTarget] = useState<string | null>(null);

  // Vocabulary popup state
  const [activeVocab, setActiveVocab] = useState<VocabularyTooltip | null>(null);
  const [soundMuted, setSoundMuted] = useState<boolean>(!settings.soundEnabled);

  // Score pop badge state
  const [poppingScore, setPoppingScore] = useState<{ qId: string; marks: number } | null>(null);

  // References
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const beeButtonRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const glowTimerRef = useRef<NodeJS.Timeout | null>(null);

  const activeQuestion = questions[currentQuestionIndex] || questions[0];

  useEffect(() => {
    return () => {
      if (glowTimerRef.current) clearTimeout(glowTimerRef.current);
    };
  }, []);

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
          particleCount: 150,
          spread: 85,
          origin: { y: 0.6 },
          colors: ['#10B981', '#F59E0B', '#3B82F6', '#EC4899', '#8B5CF6', '#FBBF24'],
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

  // Coordinate finder for clue elements on the passage
  const getClueTargetCoordinates = useCallback((clueTarget: string) => {
    const element = document.getElementById(clueTarget);
    if (!element) {
      const container = document.getElementById('passage-box-container');
      if (container) {
        const rect = container.getBoundingClientRect();
        return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
      }
      return { x: window.innerWidth * 0.35, y: 260 };
    }

    const rect = element.getBoundingClientRect();
    return {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    };
  }, []);

  // Trigger fairy dust animation
  const triggerHint = (q: WorksheetQuestion, buttonElem: HTMLButtonElement | null) => {
    if (fairyDustActive) return;

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

    const target = getClueTargetCoordinates(q.clueTarget);

    const passageElem = document.getElementById('passage-box-container');
    if (passageElem) {
      const rect = passageElem.getBoundingClientRect();
      if (rect.top < 60) {
        passageElem.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }

    setFairyStartPos(start);
    setFairyTargetPos(target);
    setFairyDustActive(true);
  };

  const handleFairyDustArrival = () => {
    setFairyDustActive(false);
    if (!activeQuestion) return;

    sound.playChime();
    setGlowingClueTarget(activeQuestion.clueTarget);

    if (glowTimerRef.current) clearTimeout(glowTimerRef.current);
    glowTimerRef.current = setTimeout(() => {
      setGlowingClueTarget(null);
    }, 9000);
  };

  // Evaluate single question answer
  const handleCheckAnswer = (q: WorksheetQuestion, overrideAnswer?: string) => {
    const rawAnswer = (overrideAnswer !== undefined ? overrideAnswer : userAnswers[q.id] || '').trim();
    const answer = rawAnswer.toLowerCase();

    if (!answer) {
      sound.playWrong();
      setShakeQuestionId(q.id);
      setTimeout(() => setShakeQuestionId(null), 500);
      return;
    }

    let isMatch = false;

    // 1. Multiple Choice Questions (Q1 & Q2)
    if (q.type === 'mcq') {
      if (q.number === 1) {
        isMatch =
          answer === 'a' ||
          answer.startsWith('a)') ||
          answer.startsWith('a.') ||
          answer.includes('labels fell') ||
          answer.includes('soil was washed away') ||
          answer.includes('toppled several labels');
      } else if (q.number === 2) {
        isMatch =
          answer === 'a' ||
          answer.startsWith('a)') ||
          answer.startsWith('a.') ||
          answer.includes('jia hui') ||
          answer.includes('jiahui');
      }
    }

    // 2. Fill-in-the-blank (Q3)
    if (q.type === 'fill-blank') {
      const cleanWord = answer.replace(/labels|\.|,/g, '').trim();
      isMatch =
        cleanWord === 'waterproof' ||
        cleanWord === 'water-proof' ||
        cleanWord === 'water proof' ||
        answer.includes('waterproof');
    }

    // 3. Short answer / open-ended keyword check
    if (!isMatch && q.acceptableKeywords && q.acceptableKeywords.length > 0) {
      isMatch = q.acceptableKeywords.some((kw) => answer.includes(kw.trim().toLowerCase()));
    }

    // 4. Sample answer fuzzy check
    if (!isMatch && q.sampleAnswer) {
      const sampleLower = q.sampleAnswer.toLowerCase();
      if (sampleLower.includes(answer) && answer.length >= 3) {
        isMatch = true;
      }
    }

    // 5. Open-ended reasoning evaluation for Q6
    if (q.number === 6 && !isMatch) {
      const hasAgreement = /yes|they did|i think so|good|well|praised/i.test(answer);
      const hasReasonWord =
        /because|calm|together|bamboo|waterproof|channels|rainwater|protect|rescued|fixed|solved|helped|cooperated/i.test(
          answer
        );
      if (hasAgreement && hasReasonWord) {
        isMatch = true;
      } else if (hasReasonWord) {
        // reasonable partial/full answer even if "Yes" was omitted
        isMatch = true;
      }
    }

    if (isMatch) {
      sound.playChime();
      setCheckedAnswers((prev) => ({
        ...prev,
        [q.id]: { isMatch: true, score: q.marks },
      }));

      setPoppingScore({ qId: q.id, marks: q.marks });
      setTimeout(() => setPoppingScore(null), 2500);

      // In step mode, advance to next question smoothly
      if (viewMode === 'step' && currentQuestionIndex < questions.length - 1) {
        setTimeout(() => {
          setCurrentQuestionIndex((prev) => prev + 1);
          setTimeout(() => {
            const nextQ = questions[currentQuestionIndex + 1];
            if (nextQ) inputRefs.current[nextQ.id]?.focus();
          }, 150);
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

      setTimeout(() => {
        inputRefs.current[q.id]?.focus();
      }, 100);
    }
  };

  const handleSelectMCQOption = (q: WorksheetQuestion, optLabel: string, optText: string) => {
    sound.playPop();
    const formatted = `${optLabel}) ${optText}`;
    setUserAnswers((prev) => ({
      ...prev,
      [q.id]: formatted,
    }));
    handleCheckAnswer(q, formatted);
  };

  const handleResetAll = () => {
    sound.playPop();
    setUserAnswers({});
    setCheckedAnswers({});
    setWrongAttempts({});
    setGlowingClueTarget(null);
    setCurrentQuestionIndex(0);
  };

  const openVocabTooltip = (word: string) => {
    const found = settings.vocabularyTooltips.find(
      (v) => v.word.toLowerCase() === word.toLowerCase() || word.toLowerCase().includes(v.word.toLowerCase())
    );
    if (found) {
      sound.playPop();
      sound.speakWord(found.word);
      setActiveVocab(found);
    }
  };

  // Helper to render interactive clue segment with red animated underline
  const renderClueSegment = (
    id: string,
    text: string,
    className: string = ''
  ) => {
    const isTargeted = glowingClueTarget === id;

    return (
      <span
        id={id}
        className={`relative inline transition-all duration-300 ${
          isTargeted ? 'bg-amber-100/90 text-amber-950 font-semibold px-1 rounded-sm' : ''
        } ${className}`}
      >
        <span>{text}</span>
        {isTargeted && (
          <span
            aria-hidden="true"
            className="absolute left-0 -bottom-0.5 w-full h-[3.5px] bg-[#DC2626] rounded-full origin-left animate-draw-red-line pointer-events-none shadow-[0_1px_3px_rgba(220,38,38,0.4)]"
          />
        )}
      </span>
    );
  };

  return (
    <div className="w-full max-w-7xl mx-auto py-3 px-3 sm:px-5 flex flex-col gap-3 sm:gap-4 select-none">
      {/* 🌟 FAIRY DUST FLIGHT ANIMATION OVERLAY 🌟 */}
      {fairyDustActive && (
        <FairyDustEffect
          startPos={fairyStartPos}
          targetPos={fairyTargetPos}
          getTargetPos={() => {
            if (!activeQuestion) return null;
            return getClueTargetCoordinates(activeQuestion.clueTarget);
          }}
          onComplete={handleFairyDustArrival}
        />
      )}

      {/* TOP APP BAR: Navigation & Header Controls */}
      <div className="bg-white/95 backdrop-blur-md border-2 border-amber-300 rounded-2xl p-2.5 sm:p-3.5 shadow-sm flex items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            id="btn-back-home"
            onClick={() => {
              sound.playPop();
              onBack();
            }}
            className="p-2 bg-amber-100 hover:bg-amber-200 text-amber-950 font-bold rounded-xl border border-amber-300 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
            title="Back to Home Screen"
          >
            <ArrowLeft className="w-4 h-4 text-amber-900" />
            <span className="text-xs sm:text-sm font-bold hidden sm:inline">Home</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-amber-900 uppercase tracking-wide hidden md:inline">
              Worksheet:
            </span>
            <span className="text-sm sm:text-base font-black text-amber-950 truncate max-w-[180px] sm:max-w-xs md:max-w-none">
              {passage.title}
            </span>
          </div>
        </div>

        {/* Center Progress Steps */}
        <div className="hidden sm:flex items-center gap-1.5">
          {questions.map((q, idx) => {
            const isCorrect = checkedAnswers[q.id]?.isMatch;
            const isSelected = currentQuestionIndex === idx;

            return (
              <button
                key={q.id}
                onClick={() => {
                  sound.playPop();
                  setCurrentQuestionIndex(idx);
                  if (viewMode === 'all') {
                    document.getElementById(`question-card-${q.id}`)?.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full text-xs sm:text-sm font-black flex items-center justify-center transition-all cursor-pointer ${
                  isCorrect
                    ? 'bg-emerald-500 text-white shadow-xs'
                    : isSelected
                    ? 'bg-amber-500 text-white ring-2 ring-amber-300 scale-110 shadow-xs'
                    : 'bg-amber-100 text-amber-900 hover:bg-amber-200'
                }`}
              >
                {isCorrect ? <Check className="w-4 h-4" /> : idx + 1}
              </button>
            );
          })}
        </div>

        {/* Right Action buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Mode Switcher */}
          <button
            id="btn-mode-toggle"
            onClick={() => {
              sound.playPop();
              setViewMode(viewMode === 'step' ? 'all' : 'step');
            }}
            className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer shadow-xs"
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-700" />
            <span className="hidden sm:inline">{viewMode === 'step' ? 'View All' : 'Step-by-Step'}</span>
            <span className="sm:hidden">{viewMode === 'step' ? 'All' : 'Steps'}</span>
          </button>

          {/* Sound Toggle */}
          <button
            id="btn-toggle-sound-top"
            onClick={toggleSound}
            className="p-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-xl transition cursor-pointer shadow-xs"
            title={soundMuted ? 'Unmute' : 'Mute'}
          >
            {soundMuted ? (
              <VolumeX className="w-4 h-4 text-slate-500" />
            ) : (
              <Volume2 className="w-4 h-4 text-amber-700" />
            )}
          </button>

          {/* Settings modal button */}
          <button
            id="btn-open-settings"
            onClick={() => {
              sound.playPop();
              setIsAdminOpen(true);
            }}
            className="p-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-xl transition cursor-pointer shadow-xs"
            title="Settings [G]"
          >
            <Settings className="w-4 h-4 text-amber-800" />
          </button>
        </div>
      </div>

      {/* Vocabulary Tooltip Modal Popover */}
      <AnimatePresence>
        {activeVocab && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs"
            onClick={() => setActiveVocab(null)}
          >
            <div
              className="bg-white border-3 border-amber-400 rounded-3xl p-5 max-w-sm w-full shadow-2xl space-y-3 relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setActiveVocab(null)}
                className="absolute top-3 right-3 p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-amber-100 text-amber-800 rounded-xl">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-black text-amber-950 capitalize">{activeVocab.word}</h4>
                  <span className="text-[11px] text-amber-700 font-semibold">Vocabulary Word</span>
                </div>
                <button
                  onClick={() => sound.speakWord(activeVocab.word)}
                  className="ml-auto p-1.5 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-full cursor-pointer transition"
                  title="Listen to pronunciation"
                >
                  <Volume1 className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium bg-amber-50/60 p-3 rounded-2xl border border-amber-200">
                {activeVocab.description}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* 🖥️ RESPONSIVE SPLIT-SCREEN MAIN WORKSPACE 🖥️ */}
      {/* ========================================================================= */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 items-start">
        {/* LEFT COLUMN: Passage & Instruction (Sticky on widescreen) */}
        <div className="lg:col-span-6 xl:col-span-6 flex flex-col gap-2.5 lg:sticky lg:top-3">
          {/* Instruction Header */}
          <div className="px-1 flex items-center justify-between">
            <h2 className="text-xs sm:text-sm md:text-base font-bold text-black tracking-tight">
              {passage.instruction}
            </h2>
            <span className="text-[11px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full hidden sm:inline">
              Reading Passage
            </span>
          </div>

          {/* 🌿 THE MINI HERB GARDEN PASSAGE BOX 🌿 */}
          <div
            id="passage-box-container"
            className="w-full bg-white border-3 border-black text-black shadow-[4px_4px_0px_#000000] p-4 sm:p-5 md:p-6 flex flex-col gap-3 rounded-xs font-sans leading-relaxed text-xs sm:text-sm md:text-[15px]"
          >
            {/* Title */}
            <div className="text-center pb-2">
              <h1 className="text-base sm:text-lg md:text-xl font-black uppercase tracking-wider text-black">
                {passage.title}
              </h1>
            </div>

            {/* Paragraph 1 */}
            <p className="text-black text-justify leading-relaxed indent-4">
              Year 4 Cendana prepared a mini herb garden beside the canteen for Open Day. Farah wrote the plant labels,
              Kumar loosened the soil, Elvin carried the watering cans, and{' '}
              {renderClueSegment(
                'clue-q2',
                'Jia Hui measured the seedlings and recorded their growth in a notebook.'
              )}
            </p>

            {/* Paragraph 2 */}
            <p className="text-black text-justify leading-relaxed indent-4">
              On Thursday night,{' '}
              {renderClueSegment(
                'clue-q1',
                'heavy rain toppled several labels and washed soil away from the pots.'
              )}{' '}
              The class did not panic. With their teacher’s permission, they supported the leaning herbs with bamboo
              sticks and {renderClueSegment('clue-q3', 'rewrote the plant names on waterproof labels.')}{' '}
              {renderClueSegment('clue-q4', 'Kumar also made shallow channels to guide extra rainwater away.')}
            </p>

            {/* Paragraph 3 */}
            <p className="text-black text-justify leading-relaxed indent-4">
              During Open Day,{' '}
              {renderClueSegment('clue-q5', 'visitors smelled the mint and lemongrass')}{' '}
              and asked how the pupils had rescued the plants. Jia Hui showed them the growth records.{' '}
              {renderClueSegment(
                'clue-q6',
                'Their teacher praised the class for solving the problem calmly and protecting the garden together.'
              )}
            </p>

            {/* Interactive vocabulary chips footer */}
            <div className="pt-2 mt-1 border-t border-dashed border-slate-300 flex flex-wrap items-center gap-1.5 text-[11px]">
              <span className="font-bold text-slate-500">Vocabulary:</span>
              {['seedlings', 'toppled', 'waterproof', 'shallow channels', 'mint', 'lemongrass'].map((w) => (
                <button
                  key={w}
                  type="button"
                  onClick={() => openVocabTooltip(w)}
                  className="px-2 py-0.5 rounded-full bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 font-semibold cursor-pointer transition capitalize"
                >
                  {w} 🔊
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Interactive Questions & Score Board */}
        <div className="lg:col-span-6 xl:col-span-6 flex flex-col gap-4">
          {viewMode === 'step' ? (
            /* STEP-BY-STEP SINGLE QUESTION FOCUSED CARD */
            <div className="flex flex-col gap-3">
              {activeQuestion && (
                <motion.div
                  key={activeQuestion.id}
                  id={`question-card-${activeQuestion.id}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-4 sm:p-6 rounded-3xl border-3 bg-white shadow-[0_8px_30px_rgba(217,119,6,0.12)] relative transition-all ${
                    checkedAnswers[activeQuestion.id]?.isMatch
                      ? 'border-emerald-400 bg-emerald-50/30'
                      : 'border-amber-400'
                  }`}
                >
                  {/* Section header if present */}
                  {activeQuestion.sectionHeader && (
                    <div className="mb-3 px-3 py-1.5 bg-amber-100/70 border border-amber-300 rounded-xl text-xs font-bold text-amber-900">
                      {activeQuestion.sectionHeader}
                    </div>
                  )}

                  {/* Card Header: Step number & Mark & Bee Hint */}
                  <div className="flex items-center justify-between gap-3 mb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-amber-500 text-white font-black text-xs sm:text-sm flex items-center justify-center shadow-xs">
                        {activeQuestion.number}
                      </span>
                      <span className="text-xs font-black uppercase tracking-wider text-amber-700">
                        Question {activeQuestion.number} of {questions.length}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`font-bold italic text-xs sm:text-sm px-2.5 py-1 rounded-lg ${
                          checkedAnswers[activeQuestion.id]?.isMatch
                            ? 'text-emerald-700 bg-emerald-100 font-extrabold'
                            : 'text-amber-900 bg-amber-100'
                        }`}
                      >
                        [{activeQuestion.marks} {activeQuestion.marks > 1 ? 'marks' : 'mark'}]
                      </span>

                      {/* Bee Clue Hint Button */}
                      <button
                        ref={(el) => (beeButtonRefs.current[activeQuestion.id] = el)}
                        type="button"
                        onClick={() => triggerHint(activeQuestion, beeButtonRefs.current[activeQuestion.id])}
                        className="p-1.5 sm:p-2 rounded-full bg-amber-200 hover:bg-amber-300 border-2 border-amber-500 shadow-sm hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center justify-center"
                        title="Click for Fairy Dust Bee Clue Hint in the passage!"
                      >
                        <BeeHintIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                      </button>
                    </div>
                  </div>

                  {/* Question Text */}
                  <h2 className="text-base sm:text-lg md:text-xl font-black text-slate-900 mb-3.5 leading-snug">
                    {activeQuestion.number}. {activeQuestion.questionText}
                  </h2>

                  {/* MCQ Options Rendering */}
                  {activeQuestion.type === 'mcq' && activeQuestion.options && (
                    <div className="space-y-2 mb-3">
                      {activeQuestion.options.map((opt) => {
                        const isChosen =
                          userAnswers[activeQuestion.id]?.startsWith(opt.label) ||
                          userAnswers[activeQuestion.id]?.includes(opt.text);
                        const isCorrect = checkedAnswers[activeQuestion.id]?.isMatch;

                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => handleSelectMCQOption(activeQuestion, opt.label, opt.text)}
                            className={`w-full text-left p-3 rounded-2xl border-2 font-bold text-xs sm:text-sm transition-all flex items-start gap-2.5 cursor-pointer ${
                              isChosen && isCorrect
                                ? 'bg-emerald-100 border-emerald-500 text-emerald-950 shadow-xs'
                                : isChosen && !isCorrect
                                ? 'bg-amber-100 border-amber-500 text-amber-950'
                                : 'bg-slate-50 hover:bg-amber-50/60 border-slate-200 hover:border-amber-300 text-slate-800'
                            }`}
                          >
                            <span className="w-6 h-6 rounded-full bg-amber-500 text-white text-xs font-black flex items-center justify-center shrink-0">
                              {opt.label}
                            </span>
                            <span className="leading-snug pt-0.5">{opt.text}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Fill in the Blank Rendering (Q3) */}
                  {activeQuestion.type === 'fill-blank' && (
                    <div className="my-3 p-3 bg-amber-50/50 rounded-2xl border border-amber-200">
                      <p className="text-sm sm:text-base font-bold text-slate-900 leading-loose">
                        The pupils rewrote the plant names on{' '}
                        <input
                          ref={(el) => (inputRefs.current[activeQuestion.id] = el)}
                          type="text"
                          id={`input-step-${activeQuestion.id}`}
                          value={userAnswers[activeQuestion.id] || ''}
                          disabled={checkedAnswers[activeQuestion.id]?.isMatch}
                          onChange={(e) => {
                            setUserAnswers({
                              ...userAnswers,
                              [activeQuestion.id]: e.target.value,
                            });
                            if (checkedAnswers[activeQuestion.id]?.isMatch === false) {
                              setCheckedAnswers((prev) => {
                                const next = { ...prev };
                                delete next[activeQuestion.id];
                                return next;
                              });
                            }
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleCheckAnswer(activeQuestion);
                            }
                          }}
                          placeholder="write ONE word"
                          className="inline-block px-3 py-1 font-black text-sm sm:text-base border-b-2 border-amber-600 bg-white focus:outline-none rounded-t text-amber-950 w-36 sm:w-44 text-center mx-1"
                        />{' '}
                        labels.
                      </p>
                    </div>
                  )}

                  {/* Short Answer / Open-ended Standard Input (Q4, Q5, Q6) */}
                  {(activeQuestion.type === 'short-answer' || activeQuestion.type === 'open-ended') && (
                    <div className="relative mt-1">
                      <div className="flex items-center gap-2">
                        <input
                          ref={(el) => (inputRefs.current[activeQuestion.id] = el)}
                          type="text"
                          id={`input-step-${activeQuestion.id}`}
                          value={userAnswers[activeQuestion.id] || ''}
                          disabled={checkedAnswers[activeQuestion.id]?.isMatch}
                          onChange={(e) => {
                            setUserAnswers({
                              ...userAnswers,
                              [activeQuestion.id]: e.target.value,
                            });
                            if (checkedAnswers[activeQuestion.id]?.isMatch === false) {
                              setCheckedAnswers((prev) => {
                                const next = { ...prev };
                                delete next[activeQuestion.id];
                                return next;
                              });
                            }
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleCheckAnswer(activeQuestion);
                            }
                          }}
                          placeholder={
                            checkedAnswers[activeQuestion.id]?.isMatch
                              ? 'Correct! Excellent answer.'
                              : 'Type your answer & press Enter ↵'
                          }
                          className={`w-full py-2.5 sm:py-3 px-3 sm:px-4 font-bold text-sm sm:text-base border-b-3 focus:outline-none transition-all rounded-t-lg ${
                            checkedAnswers[activeQuestion.id]?.isMatch
                              ? 'border-emerald-600 bg-emerald-50/80 text-emerald-950 font-extrabold'
                              : checkedAnswers[activeQuestion.id]?.isMatch === false
                              ? 'border-red-500 bg-red-50/60 text-red-950'
                              : 'border-amber-400 focus:border-amber-600 bg-amber-50/40 text-slate-900'
                          }`}
                        />

                        {!checkedAnswers[activeQuestion.id]?.isMatch ? (
                          <button
                            type="button"
                            id={`btn-check-step-${activeQuestion.id}`}
                            onClick={() => handleCheckAnswer(activeQuestion)}
                            className="px-4 sm:px-5 py-2.5 sm:py-3 bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-black text-xs sm:text-sm rounded-xl shadow-md transition-all cursor-pointer shrink-0"
                          >
                            Check
                          </button>
                        ) : (
                          <div className="flex items-center gap-1 text-emerald-600 font-black text-sm sm:text-base px-1.5 shrink-0">
                            <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6" />
                            <span>+{activeQuestion.marks}</span>
                          </div>
                        )}
                      </div>

                      {activeQuestion.linesCount === 2 && (
                        <div className="w-full border-b border-slate-300 my-2 h-3" />
                      )}
                    </div>
                  )}

                  {/* Score pop animation */}
                  <AnimatePresence>
                    {poppingScore?.qId === activeQuestion.id && (
                      <motion.div
                        initial={{ opacity: 0, y: 0, scale: 0.5 }}
                        animate={{ opacity: 1, y: -30, scale: 1.2 }}
                        exit={{ opacity: 0, y: -45, scale: 0.8 }}
                        transition={{ duration: 0.5, ease: 'easeOut' }}
                        className="absolute right-2 top-0 pointer-events-none z-50 bg-amber-400 text-amber-950 font-black px-3.5 py-1 rounded-full border-2 border-amber-800 shadow-lg flex items-center gap-1.5 text-xs sm:text-sm"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-950" />
                        <span>+{activeQuestion.marks} {activeQuestion.marks > 1 ? 'Marks' : 'Mark'}!</span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Feedback Alert */}
                  {checkedAnswers[activeQuestion.id]?.isMatch === false && (
                    <div className="flex items-center justify-between text-xs text-red-600 font-bold mt-2 px-1">
                      <div className="flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>Not quite right. Tap 🐝 Bee for the passage clue!</span>
                      </div>
                      {wrongAttempts[activeQuestion.id] >= 2 && activeQuestion.sampleAnswer && (
                        <span className="text-slate-600 italic hidden sm:inline">
                          Tip: Look at the highlighted text in the passage
                        </span>
                      )}
                    </div>
                  )}

                  {/* Step Navigation Controls */}
                  <div className="flex items-center justify-between gap-3 mt-4 pt-3 border-t border-slate-200">
                    <button
                      type="button"
                      disabled={currentQuestionIndex === 0}
                      onClick={() => {
                        sound.playPop();
                        setCurrentQuestionIndex((prev) => Math.max(0, prev - 1));
                      }}
                      className="px-3.5 py-1.5 sm:px-4 sm:py-2 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 disabled:pointer-events-none text-slate-800 font-bold text-xs sm:text-sm rounded-xl border border-slate-300 transition flex items-center gap-1 cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>Previous</span>
                    </button>

                    <div className="text-xs font-bold text-slate-500">
                      {currentQuestionIndex + 1} / {questions.length}
                    </div>

                    <button
                      type="button"
                      disabled={currentQuestionIndex === questions.length - 1}
                      onClick={() => {
                        sound.playPop();
                        setCurrentQuestionIndex((prev) => Math.min(questions.length - 1, prev + 1));
                      }}
                      className="px-3.5 py-1.5 sm:px-4 sm:py-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-40 disabled:pointer-events-none text-white font-bold text-xs sm:text-sm rounded-xl transition flex items-center gap-1 cursor-pointer shadow-xs"
                    >
                      <span>Next</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          ) : (
            /* VIEW ALL QUESTIONS AT ONCE LIST (Match exact printed worksheet format) */
            <div className="flex flex-col gap-3.5 max-h-[calc(100vh-210px)] overflow-y-auto pr-1">
              {questions.map((q) => {
                const isCorrect = checkedAnswers[q.id]?.isMatch;
                const isShaking = shakeQuestionId === q.id;

                return (
                  <React.Fragment key={q.id}>
                    {/* Section Header before Question 3 */}
                    {q.sectionHeader && (
                      <div className="p-2.5 bg-amber-100/90 border border-amber-300 rounded-xl text-xs font-black text-amber-950">
                        {q.sectionHeader}
                      </div>
                    )}

                    <motion.div
                      id={`question-card-${q.id}`}
                      animate={isShaking ? { x: [-10, 10, -6, 6, -3, 3, 0] } : { x: 0 }}
                      transition={{ duration: 0.4 }}
                      className={`p-3.5 sm:p-4 rounded-2xl border-2 transition-all relative ${
                        isCorrect
                          ? 'bg-emerald-50/70 border-emerald-400 shadow-xs'
                          : 'bg-white border-amber-300 shadow-xs'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-start gap-1.5 flex-1">
                          <span className="font-black text-sm sm:text-base text-slate-900">
                            {q.number}.
                          </span>
                          <h3 className="font-bold text-sm sm:text-base text-slate-900 leading-snug">
                            {q.questionText}
                          </h3>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <span
                            className={`font-semibold italic text-xs px-2 py-0.5 rounded-md ${
                              isCorrect
                                ? 'text-emerald-700 bg-emerald-100 font-bold'
                                : 'text-slate-700 bg-amber-50'
                            }`}
                          >
                            [{q.marks} {q.marks > 1 ? 'marks' : 'mark'}]
                          </span>

                          <button
                            ref={(el) => (beeButtonRefs.current[q.id] = el)}
                            type="button"
                            onClick={() => triggerHint(q, beeButtonRefs.current[q.id])}
                            className="p-1 rounded-full bg-amber-100 hover:bg-amber-200 border-2 border-amber-400 text-amber-900 shadow-xs transition-all cursor-pointer flex items-center justify-center"
                            title="Click for Fairy Dust Bee Clue Hint in the passage!"
                          >
                            <BeeHintIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* MCQ options in View All mode */}
                      {q.type === 'mcq' && q.options && (
                        <div className="space-y-1.5 my-2 pl-4">
                          {q.options.map((opt) => {
                            const isChosen =
                              userAnswers[q.id]?.startsWith(opt.label) ||
                              userAnswers[q.id]?.includes(opt.text);

                            return (
                              <button
                                key={opt.id}
                                type="button"
                                onClick={() => handleSelectMCQOption(q, opt.label, opt.text)}
                                className={`w-full text-left py-1.5 px-3 rounded-xl border text-xs sm:text-sm font-semibold flex items-center gap-2 transition cursor-pointer ${
                                  isChosen && isCorrect
                                    ? 'bg-emerald-100 border-emerald-500 text-emerald-950 font-bold'
                                    : isChosen
                                    ? 'bg-amber-100 border-amber-400 text-amber-950'
                                    : 'bg-slate-50 hover:bg-amber-50 border-slate-200 text-slate-800'
                                }`}
                              >
                                <span className="font-black text-amber-900">{opt.label})</span>
                                <span>{opt.text}</span>
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {/* Fill-in-the-blank in View All mode (Q3) */}
                      {q.type === 'fill-blank' && (
                        <div className="flex items-center gap-2 mt-1">
                          <input
                            ref={(el) => (inputRefs.current[q.id] = el)}
                            type="text"
                            id={`input-all-${q.id}`}
                            value={userAnswers[q.id] || ''}
                            disabled={isCorrect}
                            onChange={(e) => {
                              setUserAnswers({
                                ...userAnswers,
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
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleCheckAnswer(q);
                              }
                            }}
                            placeholder="Type the one word from text (e.g. waterproof)"
                            className={`w-full py-1.5 sm:py-2 px-2.5 font-semibold text-xs sm:text-sm border-b-2 focus:outline-none transition-all rounded-t-sm ${
                              isCorrect
                                ? 'border-emerald-600 bg-emerald-50/80 text-emerald-950 font-bold'
                                : checkedAnswers[q.id]?.isMatch === false
                                ? 'border-red-500 bg-red-50/50 text-red-950'
                                : 'border-slate-400 focus:border-amber-600 bg-transparent text-slate-900'
                            }`}
                          />

                          {!isCorrect ? (
                            <button
                              type="button"
                              id={`btn-check-all-${q.id}`}
                              onClick={() => handleCheckAnswer(q)}
                              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-black text-xs rounded-lg shadow-sm transition-all cursor-pointer shrink-0"
                            >
                              Check
                            </button>
                          ) : (
                            <div className="flex items-center gap-1 text-emerald-600 font-black text-xs px-1 shrink-0">
                              <CheckCircle2 className="w-4 h-4" />
                              <span>+{q.marks}</span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Short Answer / Open-ended in View All mode */}
                      {(q.type === 'short-answer' || q.type === 'open-ended') && (
                        <div className="relative mt-1">
                          <div className="flex items-center gap-2">
                            <input
                              ref={(el) => (inputRefs.current[q.id] = el)}
                              type="text"
                              id={`input-all-${q.id}`}
                              value={userAnswers[q.id] || ''}
                              disabled={isCorrect}
                              onChange={(e) => {
                                setUserAnswers({
                                  ...userAnswers,
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
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  handleCheckAnswer(q);
                                }
                              }}
                              placeholder={
                                isCorrect
                                  ? 'Correct! Well done.'
                                  : 'Type answer & press Enter ↵'
                              }
                              className={`w-full py-1.5 sm:py-2 px-2.5 font-semibold text-xs sm:text-sm border-b-2 focus:outline-none transition-all rounded-t-sm ${
                                isCorrect
                                  ? 'border-emerald-600 bg-emerald-50/80 text-emerald-950 font-bold'
                                  : checkedAnswers[q.id]?.isMatch === false
                                  ? 'border-red-500 bg-red-50/50 text-red-950'
                                  : 'border-slate-400 focus:border-amber-600 bg-transparent text-slate-900'
                              }`}
                            />

                            {!isCorrect ? (
                              <button
                                type="button"
                                id={`btn-check-all-${q.id}`}
                                onClick={() => handleCheckAnswer(q)}
                                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-black text-xs rounded-lg shadow-sm transition-all cursor-pointer shrink-0"
                              >
                                Check
                              </button>
                            ) : (
                              <div className="flex items-center gap-1 text-emerald-600 font-black text-xs px-1 shrink-0">
                                <CheckCircle2 className="w-4 h-4" />
                                <span>+{q.marks}</span>
                              </div>
                            )}
                          </div>

                          {q.linesCount === 2 && (
                            <div className="w-full border-b border-slate-300 my-1.5 h-3" />
                          )}
                        </div>
                      )}
                    </motion.div>
                  </React.Fragment>
                );
              })}
            </div>
          )}

          {/* 🏆 COMPLETION & SCORE SUMMARY BAR 🏆 */}
          <div className="bg-white/95 backdrop-blur-md border-2 border-amber-300 rounded-2xl p-3 sm:p-4 shadow-sm flex items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-amber-100 text-amber-800 rounded-xl border border-amber-300 shadow-xs">
                <Trophy className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-amber-700">
                  Worksheet Score
                </div>
                <div className="text-base sm:text-lg font-black text-slate-900">
                  {totalScore} / {totalPossibleMarks} Marks
                  {isAllCorrect && (
                    <span className="ml-1.5 text-xs text-emerald-600 font-extrabold">
                      🎉 100% Complete!
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                id="btn-reset-worksheet-upper"
                type="button"
                onClick={handleResetAll}
                className="px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-950 font-bold text-xs rounded-xl border border-amber-300 transition flex items-center gap-1 cursor-pointer shadow-xs"
              >
                <RotateCcw className="w-3.5 h-3.5 text-amber-900" />
                <span>Reset</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
