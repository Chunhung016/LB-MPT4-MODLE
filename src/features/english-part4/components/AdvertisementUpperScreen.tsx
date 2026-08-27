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
  Image as ImageIcon,
  Check,
  Trophy,
  Volume2,
  VolumeX,
  Settings,
  HelpCircle,
  BookOpen,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useApp } from '../context/AppContext';
import { sound } from '../utils/audio';
import { WorksheetQuestion } from '../types';
import { FairyDustEffect } from './FairyDustEffect';
import { CuteBeeMascot } from './MainScreen';

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
  const { settings, updatePosterImage, setIsAdminOpen } = useApp();
  const poster = settings.poster;
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

  // Image editing popover state
  const [isEditingImage, setIsEditingImage] = useState<boolean>(false);
  const [tempImageUrl, setTempImageUrl] = useState<string>(poster.imageUrl || '');
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
          particleCount: 140,
          spread: 85,
          origin: { y: 0.6 },
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

  // Sub-pixel coordinate finder for clue elements on the poster
  const getClueTargetCoordinates = useCallback((clueTarget: string) => {
    let domId = 'poster-title';
    if (clueTarget === 'title') domId = 'poster-title';
    else if (clueTarget === 'date') domId = 'poster-date';
    else if (clueTarget === 'time') domId = 'poster-time';
    else if (clueTarget === 'venue') domId = 'poster-venue';
    else if (clueTarget === 'activities') domId = 'poster-activities';
    else if (clueTarget === 'bottomBanner') domId = 'poster-bottom-banner';

    const element = document.getElementById(domId);
    if (!element) return { x: window.innerWidth * 0.5, y: 220 };

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

    const posterElem = document.getElementById('story-poster-container');
    if (posterElem) {
      const rect = posterElem.getBoundingClientRect();
      if (rect.top < 60) {
        posterElem.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
  const handleCheckAnswer = (q: WorksheetQuestion) => {
    const rawAnswer = (userAnswers[q.id] || '').trim();
    const answer = rawAnswer.toLowerCase();

    if (!answer) {
      sound.playWrong();
      setShakeQuestionId(q.id);
      setTimeout(() => setShakeQuestionId(null), 500);
      return;
    }

    let isMatch = false;

    // 1. Check keyword array
    if (q.acceptableKeywords && q.acceptableKeywords.length > 0) {
      isMatch = q.acceptableKeywords.some((kw) => answer.includes(kw.trim().toLowerCase()));
    }

    // 2. Check sample answer
    if (!isMatch && q.sampleAnswer) {
      const sampleLower = q.sampleAnswer.toLowerCase();
      isMatch = answer.includes(sampleLower) || sampleLower.includes(answer);
    }

    // 3. For Q6 (opinion question: activity + reason)
    if (q.number === 6 && !isMatch) {
      const hasReasonWord = /because|like|love|enjoy|want|fun|interesting|learn|favorite|favourite|watch|read/i.test(answer);
      const hasActivityWord = /mask|puppet|hunt|read|circle|story|station|stage|book/i.test(answer);
      if (hasReasonWord && hasActivityWord) {
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

      // In step mode, advance to next question if not at end
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

  const handleResetAll = () => {
    sound.playPop();
    setUserAnswers({});
    setCheckedAnswers({});
    setWrongAttempts({});
    setGlowingClueTarget(null);
    setCurrentQuestionIndex(0);
  };

  const handleSaveImageLink = () => {
    updatePosterImage(tempImageUrl.trim());
    setIsEditingImage(false);
    sound.playChime();
  };

  // Render text with animated red underline if clue is active
  const renderClueText = (
    text: string,
    targetKey: 'title' | 'date' | 'time' | 'venue' | 'activities' | 'bottomBanner',
    className: string = ''
  ) => {
    const isTargeted = glowingClueTarget === targetKey;

    if (!isTargeted) {
      return <span className={className}>{text}</span>;
    }

    return (
      <span className={`relative inline-block ${className}`}>
        <span>{text}</span>
        {/* Animated Red Pen Underline */}
        <span
          aria-hidden="true"
          className="absolute left-0 -bottom-1 w-full h-[3.5px] sm:h-[4px] bg-[#DC2626] rounded-full origin-left animate-draw-red-line pointer-events-none shadow-[0_1px_3px_rgba(220,38,38,0.4)]"
        />
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
      <div className="bg-white/90 backdrop-blur-md border-2 border-amber-300 rounded-2xl p-2.5 sm:p-3.5 shadow-sm flex items-center justify-between gap-2 shrink-0">
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
              {poster.title}
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

          {/* Paste Image URL */}
          <button
            id="btn-edit-image-top"
            onClick={() => {
              setTempImageUrl(poster.imageUrl || '');
              setIsEditingImage(!isEditingImage);
              sound.playPop();
            }}
            className="p-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-xl text-xs font-bold transition cursor-pointer shadow-xs"
            title="Paste illustration image URL"
          >
            <ImageIcon className="w-4 h-4 text-amber-700" />
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

      {/* Image Link Input Drawer (When toggled) */}
      <AnimatePresence>
        {isEditingImage && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-amber-50 border-2 border-amber-400 rounded-2xl p-3 flex flex-col sm:flex-row items-center gap-2 shadow-sm shrink-0"
          >
            <div className="flex-1 w-full">
              <label className="text-xs font-black text-amber-900 block mb-1">
                Paste Image Link for the Poster Illustration (e.g. postimg, direct URL):
              </label>
              <input
                type="url"
                value={tempImageUrl}
                onChange={(e) => setTempImageUrl(e.target.value)}
                placeholder="https://i.postimg.cc/... or https://..."
                className="w-full px-3 py-1.5 bg-white border border-amber-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 font-sans"
              />
            </div>
            <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto mt-2 sm:mt-0">
              <button
                type="button"
                onClick={handleSaveImageLink}
                className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-lg flex items-center gap-1 shadow-xs cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Save</span>
              </button>
              {poster.imageUrl && (
                <button
                  type="button"
                  onClick={() => {
                    updatePosterImage('');
                    setTempImageUrl('');
                    setIsEditingImage(false);
                    sound.playPop();
                  }}
                  className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs rounded-lg cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* 🖥️ RESPONSIVE 16:9 / IPAD / LAPTOP SPLIT-SCREEN MAIN WORKSPACE 🖥️ */}
      {/* ========================================================================= */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 items-start">
        {/* LEFT COLUMN: Poster & Instruction (Sticky on widescreen) */}
        <div className="lg:col-span-6 xl:col-span-6 flex flex-col gap-2.5 lg:sticky lg:top-3">
          {/* Instruction subtitle banner */}
          <div className="px-1 flex items-center justify-between">
            <p className="text-xs sm:text-sm md:text-base font-bold text-amber-950 tracking-tight">
              {poster.instruction}
            </p>
            <span className="text-[11px] font-bold text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded-full hidden sm:inline">
              Poster Clue Area
            </span>
          </div>

          {/* 📜 THE STORY EXPLORER SATURDAY POSTER 📜 */}
          <div
            id="story-poster-container"
            className="w-full bg-white border-3 border-black text-black shadow-[4px_4px_0px_#000000] flex flex-col overflow-hidden rounded-xs"
          >
            {/* 1. TOP TITLE BANNER */}
            <div
              id="poster-title"
              className="border-b-3 border-black py-2 px-3 text-center bg-white"
            >
              <h1 className="text-lg sm:text-xl md:text-2xl xl:text-3xl font-black tracking-wider uppercase text-black">
                {renderClueText(poster.title, 'title', 'font-black tracking-wide')}
              </h1>
            </div>

            {/* 2. SUBTITLE BANNER */}
            <div className="border-b-3 border-black py-1 px-3 text-center bg-white">
              <p className="text-xs sm:text-sm md:text-base font-bold text-black tracking-tight">
                {poster.subtitle}
              </p>
            </div>

            {/* 3. MIDDLE SECTION: 2 COLUMNS (INFO ON LEFT, ILLUSTRATION ON RIGHT) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 divide-y-3 sm:divide-y-0 sm:divide-x-3 divide-black bg-white">
              {/* Left Column: Date, Time, Venue, Activities */}
              <div className="p-3 sm:p-4 flex flex-col justify-between space-y-2 sm:space-y-3 text-black text-xs sm:text-sm md:text-[15px]">
                {/* Date */}
                <div id="poster-date" className="leading-snug">
                  <span className="font-black text-black">Date: </span>
                  {renderClueText(poster.date, 'date', 'font-bold text-black')}
                </div>

                {/* Time */}
                <div id="poster-time" className="leading-snug">
                  <span className="font-black text-black">Time: </span>
                  {renderClueText(poster.time, 'time', 'font-bold text-black')}
                </div>

                {/* Venue */}
                <div id="poster-venue" className="leading-snug">
                  <span className="font-black text-black">Venue: </span>
                  {renderClueText(poster.venue, 'venue', 'font-bold text-black')}
                </div>

                {/* Activities */}
                <div id="poster-activities" className="leading-snug pt-0.5">
                  <div className="font-black text-black mb-0.5">Activities:</div>
                  <ul className="space-y-0.5 pl-1">
                    {poster.activities.map((act, idx) => (
                      <li key={idx} className="flex items-start gap-1.5 font-bold text-xs sm:text-sm">
                        <span className="font-black">•</span>
                        <span>{renderClueText(act, 'activities')}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Right Column: Illustration Graphic */}
              <div className="p-2 sm:p-3 flex items-center justify-center bg-slate-50 min-h-[170px] sm:min-h-[200px] relative overflow-hidden">
                {poster.imageUrl ? (
                  <img
                    src={poster.imageUrl}
                    alt="Story Explorer Saturday Activities"
                    className="w-full h-auto max-h-[220px] object-contain pointer-events-none rounded border border-black/10"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  /* High-fidelity graphic representation of the 4 stations */
                  <div className="w-full h-full flex flex-col items-center justify-center p-1.5 border border-slate-300 rounded bg-white relative">
                    <div className="grid grid-cols-2 gap-1.5 w-full h-full text-center">
                      <div className="bg-amber-50/70 border border-slate-300 rounded p-1.5 flex flex-col items-center justify-center text-xs">
                        <span className="text-xl sm:text-2xl mb-0.5">🎭 🎨</span>
                        <span className="font-black text-slate-800 text-[10px] sm:text-[11px] leading-tight">
                          Character Mask
                        </span>
                        <span className="text-[9px] text-slate-500">Making masks</span>
                      </div>

                      <div className="bg-sky-50/70 border border-slate-300 rounded p-1.5 flex flex-col items-center justify-center text-xs">
                        <span className="text-xl sm:text-2xl mb-0.5">🎪 🧸</span>
                        <span className="font-black text-slate-800 text-[10px] sm:text-[11px] leading-tight">
                          Puppet Stage
                        </span>
                        <span className="text-[9px] text-slate-500">Puppet show</span>
                      </div>

                      <div className="bg-emerald-50/70 border border-slate-300 rounded p-1.5 flex flex-col items-center justify-center text-xs">
                        <span className="text-xl sm:text-2xl mb-0.5">🔍 📚</span>
                        <span className="font-black text-slate-800 text-[10px] sm:text-[11px] leading-tight">
                          Book Hunt
                        </span>
                        <span className="text-[9px] text-slate-500">Library hunt</span>
                      </div>

                      <div className="bg-purple-50/70 border border-slate-300 rounded p-1.5 flex flex-col items-center justify-center text-xs">
                        <span className="text-xl sm:text-2xl mb-0.5">📖 👧👦</span>
                        <span className="font-black text-slate-800 text-[10px] sm:text-[11px] leading-tight">
                          Read-Aloud
                        </span>
                        <span className="text-[9px] text-slate-500">Story circle</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 4. BOTTOM BANNER */}
            <div
              id="poster-bottom-banner"
              className="border-t-3 border-black py-2 px-3 text-center bg-white"
            >
              <p className="text-xs sm:text-sm md:text-[15px] font-black text-black leading-snug">
                {renderClueText(poster.bottomBanner, 'bottomBanner', 'font-black')}
              </p>
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
                        title="Click for Fairy Dust Bee Clue Hint!"
                      >
                        <BeeHintIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                      </button>
                    </div>
                  </div>

                  {/* Question Text */}
                  <h2 className="text-base sm:text-lg md:text-xl font-black text-slate-900 mb-3.5 leading-snug">
                    {activeQuestion.questionText}
                  </h2>

                  {/* Answer Input Line */}
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
                            ? 'Correct! Excellent work.'
                            : 'Type answer & press Enter ↵'
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
                          <span>+{activeQuestion.marks} Mark!</span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Feedback Alert */}
                  {checkedAnswers[activeQuestion.id]?.isMatch === false && (
                    <div className="flex items-center justify-between text-xs text-red-600 font-bold mt-2 px-1">
                      <div className="flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>Not quite right. Tap 🐝 Bee for fairy dust clue!</span>
                      </div>
                      {wrongAttempts[activeQuestion.id] >= 2 && activeQuestion.sampleAnswer && (
                        <span className="text-slate-600 italic hidden sm:inline">
                          Tip: Look at {activeQuestion.clueTarget}
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
            /* VIEW ALL QUESTIONS AT ONCE LIST */
            <div className="flex flex-col gap-3.5 max-h-[calc(100vh-210px)] overflow-y-auto pr-1">
              {questions.map((q) => {
                const isCorrect = checkedAnswers[q.id]?.isMatch;
                const isShaking = shakeQuestionId === q.id;

                return (
                  <motion.div
                    key={q.id}
                    id={`question-card-${q.id}`}
                    animate={isShaking ? { x: [-10, 10, -6, 6, -3, 3, 0] } : { x: 0 }}
                    transition={{ duration: 0.4 }}
                    className={`p-3.5 sm:p-4 rounded-2xl border-2 transition-all relative ${
                      isCorrect
                        ? 'bg-emerald-50/70 border-emerald-400 shadow-xs'
                        : 'bg-white border-amber-300 shadow-xs'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
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
                          title="Click for Fairy Dust Bee Clue Hint!"
                        >
                          <BeeHintIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

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
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* 🏆 COMPLETION & SCORE SUMMARY BAR 🏆 */}
          <div className="bg-white/90 backdrop-blur-md border-2 border-amber-300 rounded-2xl p-3 sm:p-4 shadow-sm flex items-center justify-between gap-3 shrink-0">
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
                      🎉 100% Correct!
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
