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
  HelpCircle,
  GraduationCap,
  Copy,
  BrainCircuit,
  MessageSquare,
  Sparkle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useApp } from '../context/AppContext';
import { sound } from '../utils/audio';
import { WorksheetQuestion } from '../types';
import { FairyDustEffect } from './FairyDustEffect';

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
    Record<string, { isMatch: boolean; score: number; feedbackMsg?: string; wordCount?: number; corrected?: string }>
  >({});
  const [wrongAttempts, setWrongAttempts] = useState<Record<string, number>>({});
  const [shakeQuestionId, setShakeQuestionId] = useState<string | null>(null);

  // Subjective interactive template states for Q6
  const [highlightUsaha, setHighlightUsaha] = useState<boolean>(false);
  const [isU1Solved, setIsU1Solved] = useState<boolean>(false);
  const [isU2Solved, setIsU2Solved] = useState<boolean>(false);
  const [isS1Solved, setIsS1Solved] = useState<boolean>(false);
  const [isS2Solved, setIsS2Solved] = useState<boolean>(false);

  // States for Q6 Immersive Memorization Game
  const [immersiveActive, setImmersiveActive] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number>(30);
  const [varnishedSlot, setVarnishedSlot] = useState<'U1' | 'S1' | 'U2' | 'S2' | null>(null);
  const [varnishedTextTyped, setVarnishedTextTyped] = useState<string>('');
  const [varnishedSolved, setVarnishedSolved] = useState<boolean>(false);

  // Kata Majmuk Selection State for 9(d)
  const [selectedWords9d, setSelectedWords9d] = useState<Record<string, boolean>>({});

  // Match meaning selection state for 9(e)
  const [selectedChoice9e, setSelectedChoice9e] = useState<string | null>(null);

  // Subjective Grading state (loading)
  const [isGradingQ10, setIsGradingQ10] = useState<boolean>(false);

  // Fairy Dust & Glowing Clue State
  const [fairyDustActive, setFairyDustActive] = useState<boolean>(false);
  const [fairyStartPos, setFairyStartPos] = useState<{ x: number; y: number } | null>(null);
  const [fairyTargetPos, setFairyTargetPos] = useState<{ x: number; y: number } | null>(null);
  const [glowingClueTarget, setGlowingClueTarget] = useState<string | null>(null);
  const [soundMuted, setSoundMuted] = useState<boolean>(!settings.soundEnabled);

  // Vocabulary Hover Active Index
  const [hoveredVocab, setHoveredVocab] = useState<string | null>(null);

  // References
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
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
  ).reduce((sum, a) => sum + a.score, 0);

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

  // Trigger immersive mode when template is fully filled
  useEffect(() => {
    if (isU1Solved && isU2Solved && isS1Solved && isS2Solved) {
      if (!immersiveActive && !varnishedSlot && !varnishedSolved) {
        setImmersiveActive(true);
        setCountdown(30);
      }
    } else {
      setImmersiveActive(false);
      setVarnishedSlot(null);
      setVarnishedTextTyped('');
      setVarnishedSolved(false);
    }
  }, [isU1Solved, isU2Solved, isS1Solved, isS2Solved]);

  // Countdown ticking effect
  useEffect(() => {
    let interval: any = null;
    if (immersiveActive && countdown > 0 && !varnishedSlot && !varnishedSolved) {
      interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            // Trigger random slot vanishing
            const slots: ('U1' | 'S1' | 'U2' | 'S2')[] = ['U1', 'S1', 'U2', 'S2'];
            const randomSlot = slots[Math.floor(Math.random() * slots.length)];
            setVarnishedSlot(randomSlot);
            sound.playBeeBuzz();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [immersiveActive, countdown, varnishedSlot, varnishedSolved]);

  // Handle Q6 interactive game solution completion
  useEffect(() => {
    if (isU1Solved && isU2Solved && isS1Solved && isS2Solved && varnishedSolved) {
      if (!checkedAnswers['q-10']?.isMatch) {
        setCheckedAnswers((prev) => ({
          ...prev,
          'q-10': {
            isMatch: true,
            score: 5,
            feedbackMsg: 'Syabas! Anda berjaya menyelesaikan Cabaran Memori Lebah Pintar dengan menulis semula jawapan yang hilang secara tepat!'
          }
        }));
        setUserAnswers((prev) => ({
          ...prev,
          'q-10': 'Usaha yang boleh saya contohi ialah saya akan membantu ibu mengemas rumah kerana ia akan menggembirakan hati mereka. Seterusnya, saya akan sentiasa bercakap dengan sopan dan mendengar nasihat supaya hubungan kekeluargaan menjadi lebih erat.'
        }));
        sound.playCelebration();
        try {
          confetti({
            particleCount: 150,
            spread: 80,
            origin: { y: 0.5 }
          });
        } catch {}
      }
    }
  }, [isU1Solved, isU2Solved, isS1Solved, isS2Solved, varnishedSolved, checkedAnswers]);

  const toggleSound = () => {
    const isNowMuted = sound.toggleMute();
    setSoundMuted(isNowMuted);
    if (!isNowMuted) {
      sound.playPop();
    }
  };

  // Coordinates finder for paragraphs to trigger fairy dust flight
  const getClueTargetCoordinates = useCallback((clueTarget: string) => {
    let domId = 'passage-p1';
    if (clueTarget === 'p1') domId = 'passage-p1';
    else if (clueTarget === 'p2') domId = 'passage-p2';
    else if (clueTarget === 'p3') domId = 'passage-p3';
    else if (clueTarget === 'p4') domId = 'passage-p4';
    else if (clueTarget === 'p5') domId = 'passage-p5';

    const element = document.getElementById(domId);
    if (!element) return { x: window.innerWidth * 0.3, y: 280 };

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

    const passageElem = document.getElementById('reading-passage-container');
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
    }, 8000);
  };

  // Click paragraph to copy sentence
  const handleSentenceClick = (sentence: string) => {
    // If the active question accepts sentence copying, let's inject it!
    if (activeQuestion && activeQuestion.type === 'copy_sentence' && !checkedAnswers[activeQuestion.id]?.isMatch) {
      sound.playPop();
      setUserAnswers((prev) => ({
        ...prev,
        [activeQuestion.id]: sentence,
      }));
    }
  };

  // Evaluate single question answer
  const handleCheckAnswer = async (q: WorksheetQuestion) => {
    if (q.type === 'subjective_ai') {
      await handleGradeQ10(q);
      return;
    }

    let isMatch = false;
    let givenAnswer = (userAnswers[q.id] || '').trim();

    if (q.type === 'underline_compound') {
      // Check 9(d): Must select exactly 'surat-khabar' and 'ruang-tamu'
      const correct9d = selectedWords9d['surat-khabar'] && selectedWords9d['ruang-tamu'] && Object.keys(selectedWords9d).filter(k => selectedWords9d[k]).length === 2;
      isMatch = correct9d;
      givenAnswer = Object.keys(selectedWords9d).filter(k => selectedWords9d[k]).join(', ');
    } else if (q.type === 'match_meaning') {
      // Check 9(e): Must select choice 2 (Ibu Nirmala menasihati...)
      isMatch = selectedChoice9e === 'choice-2';
      givenAnswer = selectedChoice9e || '';
    } else {
      // Fill in, text answer, copy sentence:
      const answerLower = givenAnswer.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '').trim();

      if (!answerLower) {
        sound.playWrong();
        setShakeQuestionId(q.id);
        setTimeout(() => setShakeQuestionId(null), 500);
        return;
      }

      // Check against acceptable keywords
      if (q.acceptableKeywords && q.acceptableKeywords.length > 0) {
        isMatch = q.acceptableKeywords.some((kw) => {
          const kwClean = kw.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '').trim();
          return answerLower.includes(kwClean) || kwClean.includes(answerLower);
        });
      }

      // Double-check direct sample answer
      if (!isMatch && q.sampleAnswer) {
        const sampleClean = q.sampleAnswer.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '').trim();
        isMatch = answerLower.includes(sampleClean) || sampleClean.includes(answerLower);
      }
    }

    if (isMatch) {
      sound.playChime();
      setCheckedAnswers((prev) => ({
        ...prev,
        [q.id]: { isMatch: true, score: q.marks },
      }));

      // In step mode, advance to next question
      if (viewMode === 'step' && currentQuestionIndex < questions.length - 1) {
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

  // Evaluate Question 10 using Gemini Server-side AI
  const handleGradeQ10 = async (q: WorksheetQuestion) => {
    const studentAns = (userAnswers[q.id] || '').trim();
    if (!studentAns) {
      sound.playWrong();
      setShakeQuestionId(q.id);
      setTimeout(() => setShakeQuestionId(null), 500);
      return;
    }

    setIsGradingQ10(true);
    sound.playBeeBuzz();

    try {
      const response = await fetch('/api/grade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionText: q.questionText,
          studentAnswer: studentAns,
          passageParagraphs: passage.paragraphs,
          maxMarks: q.marks,
        }),
      });

      const data = await response.json();

      if (data.success) {
        if (data.score >= 4) {
          sound.playChime();
        } else {
          sound.playPop();
        }

        setCheckedAnswers((prev) => ({
          ...prev,
          [q.id]: {
            isMatch: data.score >= 3, // mark as pass if >= 3/5
            score: data.score,
            feedbackMsg: data.feedback,
            wordCount: data.wordCount,
            corrected: data.correctedVersion,
          },
        }));
      } else {
        throw new Error(data.error || 'Terjadi ralat penilaian.');
      }
    } catch (err: any) {
      console.error(err);
      sound.playWrong();
      alert(err.message || 'Ralat semasa menghubungi pelayan penilaian.');
    } finally {
      setIsGradingQ10(false);
    }
  };

  const handleDropEnd = (e: any, info: any, slot: 's1' | 's2') => {
    const dropzoneId = slot === 's1' ? 'dropzone-s1' : 'dropzone-s2';
    const dropzone = document.getElementById(dropzoneId);
    if (!dropzone) return;

    const rect = dropzone.getBoundingClientRect();
    
    // Resolve release coords from standard mouse/touch events
    let cx: number | undefined;
    let cy: number | undefined;

    if (e) {
      if (e.clientX !== undefined) {
        cx = e.clientX;
        cy = e.clientY;
      } else if (e.changedTouches && e.changedTouches.length > 0) {
        cx = e.changedTouches[0].clientX;
        cy = e.changedTouches[0].clientY;
      } else if (e.touches && e.touches.length > 0) {
        cx = e.touches[0].clientX;
        cy = e.touches[0].clientY;
      }
    }

    // Safety margin padding to make it super easy to drop inside
    const margin = 35;
    let isMatch = false;

    if (cx !== undefined && cy !== undefined) {
      isMatch = (
        cx >= rect.left - margin &&
        cx <= rect.right + margin &&
        cy >= rect.top - margin &&
        cy <= rect.bottom + margin
      );
    } else if (info && info.point) {
      isMatch = (
        info.point.x >= rect.left - margin &&
        info.point.x <= rect.right + margin &&
        info.point.y >= rect.top - margin &&
        info.point.y <= rect.bottom + margin
      );
    }

    // Also check distance to center of dropzone (safe fallback for nested transforms)
    if (!isMatch && rect) {
      const targetCenterX = rect.left + rect.width / 2;
      const targetCenterY = rect.top + rect.height / 2;
      
      const pointerX = cx !== undefined ? cx : (info?.point?.x);
      const pointerY = cy !== undefined ? cy : (info?.point?.y);

      if (pointerX !== undefined && pointerY !== undefined) {
        const dist = Math.sqrt(Math.pow(pointerX - targetCenterX, 2) + Math.pow(pointerY - targetCenterY, 2));
        if (dist < 100) { // Within 100 pixels radius
          isMatch = true;
        }
      }
    }

    if (isMatch) {
      if (slot === 's1') {
        setIsS1Solved(true);
        sound.playCelebration();
      } else {
        setIsS2Solved(true);
        sound.playCelebration();
      }
    }
  };

  const handleResetAll = () => {
    sound.playPop();
    setUserAnswers({});
    setCheckedAnswers({});
    setWrongAttempts({});
    setSelectedWords9d({});
    setSelectedChoice9e(null);
    setGlowingClueTarget(null);
    setCurrentQuestionIndex(0);
    // Reset interactive states for Q6
    setHighlightUsaha(false);
    setIsU1Solved(false);
    setIsU2Solved(false);
    setIsS1Solved(false);
    setIsS2Solved(false);
    setImmersiveActive(false);
    setCountdown(30);
    setVarnishedSlot(null);
    setVarnishedTextTyped('');
    setVarnishedSolved(false);
  };

  // Split question text to make "usaha-usaha" clickable
  const renderQuestion6Text = () => {
    const originalText = activeQuestion.questionText;
    const targetWord = "usaha-usaha";
    const parts = originalText.split(targetWord);
    
    if (parts.length > 1) {
      return (
        <h2 className="text-base sm:text-lg font-black text-slate-900 mb-4 leading-snug">
          {parts[0]}
          <motion.button
            type="button"
            onClick={() => {
              sound.playBeeBuzz();
              setHighlightUsaha(true);
            }}
            animate={!highlightUsaha ? { scale: [1, 1.05, 1], boxShadow: ["0 0 0 rgba(245,158,11,0)", "0 0 8px rgba(245,158,11,0.5)", "0 0 0 rgba(245,158,11,0)"] } : {}}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className={`px-2 py-0.5 rounded-lg border-2 font-black transition-all cursor-pointer mx-1 text-sm sm:text-base ${
              highlightUsaha 
                ? 'bg-amber-500 text-white border-amber-600 shadow-sm' 
                : 'bg-amber-100 hover:bg-amber-200 text-amber-950 border-amber-400'
            }`}
          >
            {targetWord} 💡
          </motion.button>
          {parts[1]}
        </h2>
      );
    }
    return (
      <h2 className="text-base sm:text-lg font-black text-slate-900 mb-4 leading-snug">
        {originalText}
      </h2>
    );
  };

  // Nested text formats to highlight clue targets and vocabulary
  const renderVocabAndClickableSentences = (text: string, pId: string, keyPrefix: string) => {
    let elements: React.ReactNode[] = [];
    let remainingText = text;
    let keyIdx = 0;

    const sortedTooltips = [...settings.vocabularyTooltips].sort((a, b) => b.word.length - a.word.length);

    while (remainingText.length > 0) {
      let foundIndex = -1;
      let foundTooltip: typeof settings.vocabularyTooltips[0] | null = null;

      for (const tooltip of sortedTooltips) {
        const index = remainingText.toLowerCase().indexOf(tooltip.word.toLowerCase());
        if (index !== -1 && (foundIndex === -1 || index < foundIndex)) {
          foundIndex = index;
          foundTooltip = tooltip;
        }
      }

      if (foundIndex === -1 || !foundTooltip) {
        const sentences = remainingText.match(/[^.!?]+[.!?]+(\s|$)|[^.!?]+$/g) || [remainingText];
        sentences.forEach((sentence, sIdx) => {
          elements.push(
            <span
              key={`text-${pId}-${keyPrefix}-${keyIdx++}-${sIdx}`}
              onClick={() => handleSentenceClick(sentence.trim())}
              className="hover:bg-amber-100/60 rounded px-0.5 cursor-copy transition-all"
              title="Klik untuk salin ayat ini ke ruangan jawapan"
            >
              {sentence}
            </span>
          );
        });
        break;
      }

      if (foundIndex > 0) {
        const preceding = remainingText.substring(0, foundIndex);
        const sentences = preceding.match(/[^.!?]+[.!?]+(\s|$)|[^.!?]+$/g) || [preceding];
        sentences.forEach((sentence, sIdx) => {
          elements.push(
            <span
              key={`text-${pId}-${keyPrefix}-${keyIdx++}-${sIdx}`}
              onClick={() => handleSentenceClick(sentence.trim())}
              className="hover:bg-amber-100/60 rounded px-0.5 cursor-copy transition-all"
              title="Klik untuk salin ayat ini"
            >
              {sentence}
            </span>
          );
        });
      }

      const exactMatchWord = remainingText.substring(foundIndex, foundIndex + foundTooltip.word.length);
      const activeTooltip = foundTooltip;

      elements.push(
        <span
          key={`vocab-${pId}-${keyPrefix}-${activeTooltip.id}`}
          className="relative inline-block group"
          onMouseEnter={() => {
            setHoveredVocab(activeTooltip.id);
            sound.playPop();
          }}
          onMouseLeave={() => setHoveredVocab(null)}
        >
          <span className="cursor-help font-black border-b-2 border-dashed border-amber-600 bg-amber-100/80 px-1 py-0.5 rounded text-amber-950 transition hover:bg-amber-200">
            {exactMatchWord}
          </span>

          <AnimatePresence>
            {hoveredVocab === activeTooltip.id && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                className="absolute left-0 bottom-full mb-2 w-64 p-3.5 bg-white border-2 border-amber-400 rounded-2xl shadow-xl z-50 pointer-events-none"
              >
                <div className="absolute left-6 top-full -mt-2 w-4 h-4 bg-white border-r-2 border-b-2 border-amber-400 rotate-45" />
                <div className="relative">
                  <div className="flex items-center gap-1.5 text-xs font-black text-amber-900 uppercase tracking-wide mb-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>Kosa Kata Pintar</span>
                  </div>
                  <h4 className="text-sm font-black text-slate-900 mb-1">{activeTooltip.word}</h4>
                  <p className="text-xs text-slate-700 leading-relaxed mb-2 bg-amber-50/50 p-2 rounded-lg border border-amber-100">
                    {activeTooltip.meaning}
                  </p>
                  {activeTooltip.example && (
                    <div className="text-[10px] text-slate-500 italic">
                      <b>Contoh:</b> "{activeTooltip.example}"
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </span>
      );

      remainingText = remainingText.substring(foundIndex + foundTooltip.word.length);
    }

    return elements;
  };

  const renderCluesAndVocab = (text: string, pId: string, keyPrefix: string) => {
    const isBeeActive = glowingClueTarget === pId;
    const EXACT_CLUES: Record<string, string[]> = {
      'q-9a': ['mengemas rumah'],
      'q-9b': ['Nirmala sentiasa menghormati dan menghargai ibu bapanya.'],
      'q-9c': ['mengurangkan perselisihan faham antara satu sama lain.'],
      'q-9d': ['surat khabar', 'ruang tamu'],
      'q-9e': ['Nirmala, kita perlulah membantu ibu bapa dan menjaga tutur kata'],
    };

    const activeClues = isBeeActive ? (EXACT_CLUES[activeQuestion?.id] || []) : [];

    if (isBeeActive && activeClues.length > 0) {
      let elements: React.ReactNode[] = [];
      let remainingText = text;
      let keyIdx = 0;

      const sortedClues = [...activeClues].sort((a, b) => b.length - a.length);

      while (remainingText.length > 0) {
        let foundIndex = -1;
        let foundClue = '';

        for (const clue of sortedClues) {
          const index = remainingText.toLowerCase().indexOf(clue.toLowerCase());
          if (index !== -1 && (foundIndex === -1 || index < foundIndex)) {
            foundIndex = index;
            foundClue = clue;
          }
        }

        if (foundIndex === -1) {
          elements.push(...renderVocabAndClickableSentences(remainingText, pId, `${keyPrefix}-clue-non-${keyIdx++}`));
          break;
        }

        if (foundIndex > 0) {
          const preceding = remainingText.substring(0, foundIndex);
          elements.push(...renderVocabAndClickableSentences(preceding, pId, `${keyPrefix}-clue-pre-${keyIdx++}`));
        }

        const exactClueText = remainingText.substring(foundIndex, foundIndex + foundClue.length);

        elements.push(
          <motion.span
            key={`clue-${pId}-${keyPrefix}-${keyIdx++}`}
            initial={{ scale: 0.9, backgroundColor: 'rgba(251, 191, 36, 0)' }}
            animate={{
              scale: [1, 1.05, 1],
              backgroundColor: ['rgba(251, 191, 36, 0.25)', 'rgba(251, 191, 36, 0.7)', 'rgba(251, 191, 36, 0.3)'],
              boxShadow: [
                '0 0 0 rgba(245, 158, 11, 0)',
                '0 0 10px rgba(245, 158, 11, 0.6)',
                '0 0 0 rgba(245, 158, 11, 0)'
              ]
            }}
            transition={{ duration: 1.2, repeat: Infinity }}
            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-lg border-2 border-amber-500 font-extrabold text-amber-950 bg-amber-100 relative z-10"
          >
            <span className="animate-bounce text-xs">🐝</span>
            <span className="underline decoration-red-500 decoration-2 underline-offset-2">{exactClueText}</span>
          </motion.span>
        );

        remainingText = remainingText.substring(foundIndex + foundClue.length);
      }

      return elements;
    }

    return renderVocabAndClickableSentences(text, pId, keyPrefix);
  };

  const renderParagraphWithTooltips = (pText: string, pId: string) => {
    // 1. If highlightUsaha is active for Q6 (q-10), prioritize highlighting the usaha phrases in the text!
    if (highlightUsaha && (currentQuestionIndex === 5 || viewMode === 'all')) {
      const targetUsahas = [
        { id: 'u1', text: 'membantu ibunya mengemas rumah' },
        { id: 'u2', text: 'bercakap dengan sopan dan mendengar nasihat' }
      ];

      let elements: React.ReactNode[] = [];
      let remainingText = pText;
      let keyIdx = 0;

      while (remainingText.length > 0) {
        let foundIndex = -1;
        let foundUsaha: typeof targetUsahas[0] | null = null;

        for (const u of targetUsahas) {
          const index = remainingText.toLowerCase().indexOf(u.text.toLowerCase());
          if (index !== -1 && (foundIndex === -1 || index < foundIndex)) {
            foundIndex = index;
            foundUsaha = u;
          }
        }

        if (foundIndex === -1 || !foundUsaha) {
          elements.push(...renderCluesAndVocab(remainingText, pId, `usaha-non-${keyIdx++}`));
          break;
        }

        if (foundIndex > 0) {
          const preceding = remainingText.substring(0, foundIndex);
          elements.push(...renderCluesAndVocab(preceding, pId, `usaha-pre-${keyIdx++}`));
        }

        const exactUsahaText = remainingText.substring(foundIndex, foundIndex + foundUsaha.text.length);
        const activeUsaha = foundUsaha;

        const isSolved = activeUsaha.id === 'u1' ? isU1Solved : isU2Solved;

        elements.push(
          <motion.span
            key={`usaha-clue-${pId}-${activeUsaha.id}-${keyIdx++}`}
            initial={{ scale: 0.98 }}
            animate={!isSolved ? {
              scale: [1, 1.02, 1],
              backgroundColor: ['rgba(139, 92, 246, 0.15)', 'rgba(139, 92, 246, 0.45)', 'rgba(139, 92, 246, 0.15)'],
              boxShadow: [
                '0 0 0 rgba(139, 92, 246, 0)',
                '0 0 10px rgba(139, 92, 246, 0.5)',
                '0 0 0 rgba(139, 92, 246, 0)'
              ]
            } : { backgroundColor: 'rgba(16, 185, 129, 0.2)' }}
            transition={{ duration: 1.5, repeat: !isSolved ? Infinity : 0 }}
            onClick={() => {
              if (!isSolved) {
                sound.playChime();
                if (activeUsaha.id === 'u1') {
                  setIsU1Solved(true);
                } else {
                  setIsU2Solved(true);
                }
              }
            }}
            className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-xl border-2 cursor-pointer transition-all ${
              isSolved 
                ? 'border-emerald-500 text-emerald-950 font-black' 
                : 'border-violet-500 text-violet-950 font-black'
            }`}
          >
            <span>{activeUsaha.id === 'u1' ? '🏡' : '🗣️'}</span>
            <span className="underline decoration-dashed underline-offset-2">{exactUsahaText}</span>
            {isSolved && <Check className="w-4 h-4 text-emerald-600 shrink-0" />}
          </motion.span>
        );

        remainingText = remainingText.substring(foundIndex + foundUsaha.text.length);
      }

      return elements;
    }

    // 2. Normal flow: Handle exact clues and vocab tooltips
    return renderCluesAndVocab(pText, pId, 'normal');
  };

  const correctPhrases: Record<string, string> = {
    U1: 'membantu ibu mengemas rumah',
    S1: 'menggembirakan hati mereka',
    U2: 'sentiasa bercakap dengan sopan dan mendengar nasihat',
    S2: 'hubungan kekeluargaan menjadi lebih erat',
  };

  const handleVarnishedTyping = (typedValue: string) => {
    setVarnishedTextTyped(typedValue);
    if (!varnishedSlot) return;
    
    const correctText = correctPhrases[varnishedSlot];
    const normalize = (str: string) => 
      str.toLowerCase()
         .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"']/g, '') // remove punctuation
         .replace(/\s+/g, ' ')                          // normalize spaces
         .trim();

    if (normalize(typedValue) === normalize(correctText)) {
      setVarnishedSolved(true);
      sound.playCelebration();
      try {
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.5 }
        });
      } catch {}
    }
  };

  const handleResetMemoryGame = () => {
    sound.playPop();
    setCountdown(30);
    setVarnishedSlot(null);
    setVarnishedTextTyped('');
    setVarnishedSolved(false);
  };

  const handleResetQ6Fully = () => {
    sound.playPop();
    setIsU1Solved(false);
    setIsU2Solved(false);
    setIsS1Solved(false);
    setIsS2Solved(false);
    setImmersiveActive(false);
    setCountdown(30);
    setVarnishedSlot(null);
    setVarnishedTextTyped('');
    setVarnishedSolved(false);
    setHighlightUsaha(false);
  };

  if (immersiveActive) {
    return (
      <div className="w-full max-w-7xl mx-auto py-3 px-3 sm:px-5 flex flex-col gap-3 sm:gap-4 select-none min-h-[85vh] justify-center items-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-5xl lg:max-w-6xl xl:max-w-7xl flex flex-col gap-5 p-4 sm:p-6 bg-gradient-to-b from-[#FFFDF9] to-[#FFF9EE] border-4 border-amber-400 rounded-[2rem] shadow-[0_20px_50px_rgba(217,119,6,0.18)] relative overflow-hidden select-none font-sans"
        >
          {/* Background decorative bee elements */}
          <div className="absolute -right-12 -bottom-12 opacity-[0.05] pointer-events-none select-none">
            <span className="text-[12rem] sm:text-[15rem]">🐝</span>
          </div>
          <div className="absolute -left-12 -top-12 opacity-[0.05] pointer-events-none select-none">
            <span className="text-[10rem] sm:text-[12rem]">🍯</span>
          </div>

          {/* Top Status and Header */}
          <div className="flex items-center justify-between gap-4 pb-3 border-b-2 border-amber-200/60 relative z-10 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center border-2 border-amber-300 shadow-sm">
                <span className="text-xl">🧠</span>
              </div>
              <div className="text-left">
                <h1 className="text-sm sm:text-base md:text-lg font-black text-amber-950 uppercase tracking-tight">
                  Cabaran Memori Lebah Pintar
                </h1>
                <p className="text-[10px] sm:text-xs text-amber-800 font-bold">
                  Suaikan jawapan anda dengan ingatan yang tajam!
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Sound Toggle */}
              <button
                onClick={toggleSound}
                className="p-2 bg-white hover:bg-amber-50 text-amber-900 border-2 border-amber-200 rounded-lg transition cursor-pointer shadow-xs"
                title={soundMuted ? 'Buka Suara' : 'Senyap'}
              >
                {soundMuted ? (
                  <VolumeX className="w-3.5 h-3.5 text-slate-500" />
                ) : (
                  <Volume2 className="w-3.5 h-3.5 text-amber-700" />
                )}
              </button>

              {/* Back to Worksheet/Reset everything */}
              <button
                onClick={handleResetQ6Fully}
                className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-950 border-2 border-rose-300 text-[10px] sm:text-xs font-black rounded-lg transition-all cursor-pointer flex items-center gap-1 shadow-sm"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Bina Semula</span>
              </button>
            </div>
          </div>

          {/* DUAL-COLUMN LANDSCAPE LAYOUT FOR IPAD HORIZONTAL */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch relative z-10 flex-1 w-full min-h-[340px]">
            {/* LEFT COLUMN: Controls & Interactive Game State (Countdown/Typing Prompt/Success) */}
            <div className="lg:col-span-5 flex flex-col justify-center items-center p-4 sm:p-5 bg-amber-50/40 backdrop-blur-md rounded-2xl border-2 border-amber-200/80 shadow-xs relative overflow-hidden min-h-[220px]">
              {!varnishedSlot ? (
                /* MEMORIZATION COUNTDOWN PHASE */
                <div className="w-full flex flex-col items-center justify-center gap-4 text-center">
                  {/* Visual countdown card */}
                  <div className="bg-white/90 border-2 border-amber-300 rounded-2xl p-5 w-full text-center space-y-4 shadow-sm relative">
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-amber-400 text-amber-950 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border-2 border-amber-500 shadow-md flex items-center gap-1">
                      <span className="animate-spin text-xs">⏳</span>
                      <span>FASA MEMORI</span>
                    </div>

                    <div className="pt-2">
                      <span className="text-4xl sm:text-5xl font-black text-amber-600 block animate-pulse">
                        {countdown}s
                      </span>
                      <p className="text-[11px] sm:text-xs text-amber-950 font-bold mt-1 leading-snug">
                        Lebah Bijak sedang menyembunyikan sebahagian jawapan anda...
                      </p>
                    </div>

                    {/* Progress bar */}
                    <div className="w-full bg-amber-200/50 h-2 rounded-full overflow-hidden border border-amber-300">
                      <motion.div
                        className="h-full bg-gradient-to-r from-amber-400 to-amber-500"
                        initial={{ width: '100%' }}
                        animate={{ width: `${(countdown / 30) * 100}%` }}
                        transition={{ duration: 1, ease: 'linear' }}
                      />
                    </div>

                    {/* Skip Button */}
                    <button
                      onClick={() => {
                        sound.playPop();
                        const slots: ('U1' | 'S1' | 'U2' | 'S2')[] = ['U1', 'S1', 'U2', 'S2'];
                        const randomSlot = slots[Math.floor(Math.random() * slots.length)];
                        setVarnishedSlot(randomSlot);
                        sound.playBeeBuzz();
                      }}
                      className="w-full py-2 bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-black text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <span>🚀</span>
                      <span>Mula Cabaran (Langkau 30s)</span>
                    </button>
                  </div>

                  <p className="text-[10px] sm:text-xs text-amber-800 text-center font-bold italic leading-relaxed max-w-xs">
                    Sila baca dan ingat sebutan perkataan di kertas jawapan sebelah sebelum masa tamat!
                  </p>
                </div>
              ) : (
                /* TYPING CHALLENGE PHASE */
                <div className="w-full flex flex-col justify-center gap-4">
                  {varnishedSolved ? (
                    /* TROPHY & SUCCESS VIEW */
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="bg-emerald-50/90 border-2 border-emerald-400 rounded-2xl p-5 text-center space-y-3.5 w-full shadow-xs"
                    >
                      <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center border-2 border-amber-400 mx-auto shadow-sm animate-bounce">
                        <Trophy className="w-6 h-6 text-amber-500" />
                      </div>
                      <div>
                        <h2 className="text-sm sm:text-base font-black text-emerald-950 uppercase tracking-tight">
                          SANGAT CEMERLANG! 🎉
                        </h2>
                        <p className="text-[10px] sm:text-xs text-emerald-800 font-extrabold mt-0.5">
                          Memori anda memang hebat dan tajam!
                        </p>
                      </div>
                      <p className="text-[11px] text-emerald-900 leading-relaxed bg-white/70 p-3 rounded-xl border border-emerald-200">
                        Anda telah berjaya menulis semula jawapan yang hilang secara tepat dan memenangi 5 markah penuh!
                      </p>
                      <div className="flex flex-col gap-2 pt-1">
                        <button
                          onClick={handleResetMemoryGame}
                          className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-white font-black text-xs rounded-lg transition shadow-md cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Cuba Slot Lain</span>
                        </button>
                        <button
                          onClick={() => {
                            sound.playPop();
                            setImmersiveActive(false);
                          }}
                          className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-lg transition shadow-md cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <span>🎯</span>
                          <span>Selesai & Lihat Markah</span>
                        </button>
                      </div>
                    </motion.div>
                  ) : (
                    /* INPUT PROMPT VIEW */
                    <div className="w-full space-y-3 text-center">
                      <div className="p-3 bg-amber-50/95 border-2 border-amber-300 rounded-xl text-[10px] sm:text-xs text-amber-950 font-extrabold flex items-center justify-center gap-1.5 animate-pulse shadow-xs">
                        <span>🐝</span>
                        <span>
                          Aduhai! Slot <b className="bg-amber-200/80 px-1.5 py-0.5 rounded border border-amber-400 text-amber-950 text-xs">{varnishedSlot}</b> telah dipadamkan! Sila taip semula di bawah:
                        </span>
                      </div>

                      <div className="bg-white border-2 border-amber-300 rounded-xl p-3.5 shadow-xs w-full text-left">
                        <label className="block text-[9px] font-black text-slate-500 uppercase tracking-wider mb-1">
                          Taip Jawapan Anda:
                        </label>
                        <input
                          type="text"
                          autoFocus
                          placeholder="Taip jawapan yang dipadam..."
                          value={varnishedTextTyped}
                          onChange={(e) => handleVarnishedTyping(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 border-2 border-amber-200 focus:border-amber-500 text-slate-950 font-extrabold rounded-xl text-center placeholder-slate-400 focus:outline-none transition-all shadow-inner text-xs sm:text-sm"
                        />
                        <div className="flex justify-between items-center text-[9px] text-slate-400 mt-2 font-bold px-0.5">
                          <span>(Mengesan secara langsung)</span>
                          <button
                            onClick={() => handleVarnishedTyping(correctPhrases[varnishedSlot!])}
                            className="text-amber-600 hover:underline"
                          >
                            Bantuan Lebah 💡
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* RIGHT COLUMN: ENLARGED NOTEPAD TEMPLATE BOX */}
            <div className="lg:col-span-7 bg-[#FFFFFC] border-3 border-amber-300/80 rounded-[2rem] p-5 sm:p-7 md:p-9 shadow-lg relative overflow-hidden flex flex-col justify-center min-h-[220px]">
              {/* Notebook binder lines styling */}
              <div className="absolute top-0 bottom-0 left-4 sm:left-6 w-0.5 bg-rose-200/50" />
              <div className="absolute top-0 bottom-0 left-5 sm:left-7.5 w-0.5 bg-rose-200/30" />
              
              <div className="absolute right-6 top-6 text-[9px] sm:text-[10px] font-black text-amber-600/30 tracking-widest uppercase select-none">
                KERTAS JAWAPAN MEMORI
              </div>

              <p className="text-xs sm:text-sm md:text-base lg:text-lg leading-[2.1] sm:leading-[2.4] font-serif text-slate-800 text-justify pl-7 sm:pl-10 select-none">
                Usaha yang boleh saya contohi ialah saya akan{' '}
                <span
                  className={`inline-flex px-2.5 py-0.5 rounded-xl border transition-all ${
                    varnishedSlot === 'U1' && !varnishedSolved
                      ? 'bg-amber-100 border-dashed border-amber-400 text-amber-700 animate-pulse text-[10px] sm:text-xs md:text-sm min-w-[120px] justify-center font-bold'
                      : 'bg-violet-100 border-violet-400 text-violet-950 font-black'
                  }`}
                >
                  {varnishedSlot === 'U1' && !varnishedSolved
                    ? (varnishedTextTyped || 'U1: Menunggu jawapan...')
                    : 'membantu ibu mengemas rumah'}
                </span>{' '}
                kerana ia akan{' '}
                <span
                  className={`inline-flex px-2.5 py-0.5 rounded-xl border transition-all ${
                    varnishedSlot === 'S1' && !varnishedSolved
                      ? 'bg-amber-100 border-dashed border-amber-400 text-amber-700 animate-pulse text-[10px] sm:text-xs md:text-sm min-w-[120px] justify-center font-bold'
                      : 'bg-amber-50 border-amber-300 text-amber-950 font-black'
                  }`}
                >
                  {varnishedSlot === 'S1' && !varnishedSolved
                    ? (varnishedTextTyped || 'S1: Menunggu jawapan...')
                    : 'menggembirakan hati mereka'}
                </span>
                . Seterusnya, saya akan{' '}
                <span
                  className={`inline-flex px-2.5 py-0.5 rounded-xl border transition-all ${
                    varnishedSlot === 'U2' && !varnishedSolved
                      ? 'bg-amber-100 border-dashed border-amber-400 text-amber-700 animate-pulse text-[10px] sm:text-xs md:text-sm min-w-[120px] justify-center font-bold'
                      : 'bg-violet-100 border-violet-400 text-violet-950 font-black'
                  }`}
                >
                  {varnishedSlot === 'U2' && !varnishedSolved
                    ? (varnishedTextTyped || 'U2: Menunggu jawapan...')
                    : 'sentiasa bercakap dengan sopan dan mendengar nasihat'}
                </span>{' '}
                supaya{' '}
                <span
                  className={`inline-flex px-2.5 py-0.5 rounded-xl border transition-all ${
                    varnishedSlot === 'S2' && !varnishedSolved
                      ? 'bg-amber-100 border-dashed border-amber-400 text-amber-700 animate-pulse text-[10px] sm:text-xs md:text-sm min-w-[120px] justify-center font-bold'
                      : 'bg-emerald-100 border-emerald-400 text-emerald-950 font-black'
                  }`}
                >
                  {varnishedSlot === 'S2' && !varnishedSolved
                    ? (varnishedTextTyped || 'S2: Menunggu jawapan...')
                    : 'hubungan kekeluargaan menjadi lebih erat'}
                </span>
                .
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

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
            title="Kembali ke Utama"
          >
            <ArrowLeft className="w-4 h-4 text-amber-900" />
            <span className="text-xs sm:text-sm font-bold hidden sm:inline">Utama</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-amber-900 uppercase tracking-wide hidden md:inline">
              Petikan:
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
            onClick={() => {
              sound.playPop();
              setViewMode(viewMode === 'step' ? 'all' : 'step');
            }}
            className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer shadow-xs"
          >
            <GraduationCap className="w-3.5 h-3.5 text-amber-700" />
            <span className="hidden sm:inline">{viewMode === 'step' ? 'Lihat Semua' : 'Satu Demi Satu'}</span>
            <span className="sm:hidden">{viewMode === 'step' ? 'Semua' : 'Fokus'}</span>
          </button>

          {/* Sound Toggle */}
          <button
            id="btn-toggle-sound-top"
            onClick={toggleSound}
            className="p-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-xl transition cursor-pointer shadow-xs"
            title={soundMuted ? 'Buka Suara' : 'Senyap'}
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
            title="Tetapan [G]"
          >
            <Settings className="w-4 h-4 text-amber-800" />
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 🖥️ RESPONSIVE SPLIT-SCREEN MAIN WORKSPACE 🖥️ */}
      {/* ========================================================================= */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 items-start">
        {/* LEFT COLUMN: Reading Passage & Helper Instructions */}
        <div className="lg:col-span-6 xl:col-span-6 flex flex-col gap-2.5 lg:sticky lg:top-3">
          <div className="px-1 flex items-center justify-between">
            <p className="text-xs sm:text-sm font-bold text-amber-950 tracking-tight">
              {passage.instruction || 'Baca petikan di bawah dengan teliti.'}
            </p>
            <span className="text-[10px] font-black text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full uppercase tracking-wider hidden sm:inline">
              Kosa Kata & Salin Pintar Aktif
            </span>
          </div>

          {/* 📜 THE READING COMPREHENSION PASSAGE CARD 📜 */}
          <div
            id="reading-passage-container"
            className="w-full bg-[#fdfbf7] border-3 border-amber-900/30 text-amber-950 shadow-[0_10px_25px_rgba(139,94,26,0.06)] flex flex-col overflow-hidden rounded-3xl relative p-5 sm:p-7"
          >
            {/* School Notebook Styled Margins */}
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-red-200/50" />

            {/* Title */}
            <div className="text-center mb-6 relative">
              <h1 className="text-lg sm:text-xl md:text-2xl font-black tracking-wide text-amber-950">
                {passage.title}
              </h1>
              <div className="w-24 h-1 bg-amber-500 mx-auto mt-2 rounded-full" />
            </div>

            {/* Paragraphs with hover tooltips and dynamic red underlines */}
            <div className="space-y-4 font-serif text-sm sm:text-base leading-relaxed text-slate-800 pl-4">
              {passage.paragraphs.map((pText, idx) => {
                const pKey = `p${idx + 1}`;
                const isTargeted = glowingClueTarget === pKey;

                return (
                  <motion.div
                    key={pKey}
                    id={`passage-${pKey}`}
                    animate={
                      isTargeted
                        ? {
                            scale: [1, 1.02, 1],
                            backgroundColor: ['transparent', 'rgba(253, 230, 138, 0.4)', 'transparent'],
                          }
                        : {}
                    }
                    transition={{ duration: 1.5, repeat: isTargeted ? 2 : 0 }}
                    className={`relative p-2 rounded-xl transition-all leading-relaxed ${
                      isTargeted
                        ? 'ring-2 ring-amber-400 border border-amber-300 shadow-sm'
                        : 'border border-transparent'
                    }`}
                  >
                    {/* Paragraph Number Indicator */}
                    <span className="absolute -left-5 top-2.5 text-[10px] font-black text-amber-700 bg-amber-100/60 w-4 h-4 rounded-full flex items-center justify-center">
                      {idx + 1}
                    </span>

                    {/* Format Paragraph text and bind tooltips */}
                    {renderParagraphWithTooltips(pText, pKey)}

                    {/* Animated Red Line clue marker */}
                    {isTargeted && (
                      <span
                        aria-hidden="true"
                        className="absolute left-2 -bottom-1 w-[95%] h-[3.5px] bg-[#DC2626] rounded-full origin-left animate-draw-red-line pointer-events-none shadow-[0_1px_3px_rgba(220,38,38,0.4)]"
                      />
                    )}
                  </motion.div>
                );
              })}
            </div>

            {/* Quick Helper Tips Footer */}
            <div className="mt-6 pt-4 border-t border-amber-200/50 flex items-center gap-2 text-xs text-amber-800 font-semibold pl-4">
              <HelpCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Tip: Lalukan tetikus di atas perkataan bergaris untuk maksud. Klik mana-mana ayat untuk salin segera!</span>
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
                        {currentQuestionIndex + 1}
                      </span>
                      <span className="text-xs font-black uppercase tracking-wider text-amber-700">
                        Soalan {activeQuestion.number} daripada {questions.length}
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
                        [{activeQuestion.marks} {activeQuestion.marks > 1 ? 'markah' : 'markah'}]
                      </span>

                      {/* Bee Clue Hint Button */}
                      {activeQuestion.clueTarget !== 'none' && (
                        <button
                          ref={(el) => (beeButtonRefs.current[activeQuestion.id] = el)}
                          type="button"
                          onClick={() => triggerHint(activeQuestion, beeButtonRefs.current[activeQuestion.id])}
                          className="p-1.5 sm:p-2 rounded-full bg-amber-200 hover:bg-amber-300 border-2 border-amber-500 shadow-sm hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center justify-center"
                          title="Tanya Bung Lebah 🐝 untuk Klu!"
                        >
                          <BeeHintIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Question Text */}
                  {activeQuestion.id === 'q-10' ? renderQuestion6Text() : (
                    <h2 className="text-base sm:text-lg font-black text-slate-900 mb-4 leading-snug">
                      {activeQuestion.questionText}
                    </h2>
                  )}

                  {/* Dynamic Input Render based on question type */}
                  <div className="my-3">
                    {/* TYPE 1 & 2 & 3: Standard fill_in, copy_sentence, text_answer */}
                    {(activeQuestion.type === 'fill_in' || activeQuestion.type === 'copy_sentence' || activeQuestion.type === 'text_answer') && (
                      <div className="relative">
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
                                ? 'Syabas! Jawapan anda betul.'
                                : activeQuestion.type === 'copy_sentence'
                                ? 'Klik ayat dari petikan sebelah atau taip jawapan di sini...'
                                : 'Taip jawapan & tekan Enter ↵'
                            }
                            className={`w-full py-3 px-4 font-bold text-sm sm:text-base border-b-3 focus:outline-none transition-all rounded-t-lg ${
                              checkedAnswers[activeQuestion.id]?.isMatch
                                ? 'border-emerald-600 bg-emerald-50/80 text-emerald-950 font-extrabold'
                                : checkedAnswers[activeQuestion.id]?.isMatch === false
                                ? 'border-red-500 bg-red-50/60 text-red-950'
                                : 'border-amber-400 focus:border-amber-600 bg-amber-50/25 text-slate-900 font-sans'
                            }`}
                          />

                          {!checkedAnswers[activeQuestion.id]?.isMatch ? (
                            <button
                              type="button"
                              id={`btn-check-step-${activeQuestion.id}`}
                              onClick={() => handleCheckAnswer(activeQuestion)}
                              className="px-5 py-3 bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-black text-sm rounded-xl shadow-md transition-all cursor-pointer shrink-0"
                            >
                              Semak
                            </button>
                          ) : (
                            <div className="flex items-center gap-1 text-emerald-600 font-black text-base px-1.5 shrink-0">
                              <CheckCircle2 className="w-6 h-6" />
                              <span>+{activeQuestion.marks}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* TYPE 4: click-to-underline compound words (kata majmuk) */}
                    {activeQuestion.type === 'underline_compound' && (
                      <div className="bg-amber-50/30 p-4 border-2 border-amber-200 rounded-2xl">
                        <p className="text-xs text-amber-900 font-bold mb-3 flex items-center gap-1.5">
                          <HelpCircle className="w-4 h-4 text-amber-600" />
                          <span>Pilih dan klik patah kata yang merupakan KATA MAJMUK dalam ayat di bawah:</span>
                        </p>

                        {/* Bapa Nirmala pula sedang membaca surat khabar di ruang tamu */}
                        <div className="flex flex-wrap gap-2 py-3">
                          {[
                            { id: 'bapa', word: 'Bapa' },
                            { id: 'nirmala', word: 'Nirmala' },
                            { id: 'pula', word: 'pula' },
                            { id: 'sedang', word: 'sedang' },
                            { id: 'membaca', word: 'membaca' },
                            { id: 'surat-khabar', word: 'surat khabar' },
                            { id: 'di', word: 'di' },
                            { id: 'ruang-tamu', word: 'ruang tamu' },
                          ].map((item) => {
                            const isSelected = selectedWords9d[item.id];
                            const isCorrectWord = item.id === 'surat-khabar' || item.id === 'ruang-tamu';
                            const questionDone = checkedAnswers[activeQuestion.id]?.isMatch;

                            return (
                              <button
                                key={item.id}
                                disabled={questionDone}
                                onClick={() => {
                                  sound.playPop();
                                  setSelectedWords9d((prev) => ({
                                    ...prev,
                                    [item.id]: !prev[item.id],
                                  }));
                                }}
                                className={`px-3.5 py-2 text-sm sm:text-base font-bold rounded-xl transition-all shadow-xs cursor-pointer ${
                                  isSelected
                                    ? 'bg-red-500 text-white line-through scale-105 ring-2 ring-red-300 font-black'
                                    : 'bg-white hover:bg-amber-100 border border-amber-300 text-slate-800'
                                }`}
                              >
                                {item.word}
                              </button>
                            );
                          })}
                        </div>

                        <div className="flex items-center justify-between mt-3 pt-2 border-t border-amber-200/50">
                          <span className="text-[11px] font-semibold text-amber-800">
                            Pilihan: {Object.keys(selectedWords9d).filter(k => selectedWords9d[k]).length} dipilih
                          </span>

                          {!checkedAnswers[activeQuestion.id]?.isMatch ? (
                            <button
                              type="button"
                              onClick={() => handleCheckAnswer(activeQuestion)}
                              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-black rounded-lg cursor-pointer transition shadow-xs"
                            >
                              Semak Pilihan
                            </button>
                          ) : (
                            <div className="flex items-center gap-1.5 text-emerald-600 font-black text-sm">
                              <CheckCircle2 className="w-5 h-5" />
                              <span>Syabas! "surat khabar" & "ruang tamu" ialah kata majmuk.</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* TYPE 5: Match Meaning paraphasing (BETUL grid selection) */}
                    {activeQuestion.type === 'match_meaning' && (
                      <div className="space-y-3">
                        <div className="bg-amber-50/50 p-3 rounded-2xl border border-amber-200 mb-2">
                          <span className="text-xs font-bold text-amber-900 block mb-1">Ayat Rujukan:</span>
                          <p className="text-xs font-black text-slate-800 italic leading-snug">
                            "Nirmala, kita perlulah membantu ibu bapa dan menjaga tutur kata," kata ibu Nirmala.
                          </p>
                        </div>

                        {[
                          {
                            id: 'choice-1',
                            text: 'Nirmala menasihati ibunya untuk membantu ibu bapa dan menjaga tutur kata.',
                          },
                          {
                            id: 'choice-2',
                            text: 'Ibu Nirmala menasihati Nirmala untuk membantu ibu bapa dan menjaga tutur kata.',
                          },
                        ].map((choice, cIdx) => {
                          const isSelected = selectedChoice9e === choice.id;
                          const questionDone = checkedAnswers[activeQuestion.id]?.isMatch;

                          return (
                            <div
                              key={choice.id}
                              onClick={() => {
                                if (!questionDone) {
                                  sound.playPop();
                                  setSelectedChoice9e(choice.id);
                                }
                              }}
                              className={`p-3 rounded-2xl border-2 transition-all flex items-center justify-between gap-3 cursor-pointer ${
                                isSelected
                                  ? 'bg-amber-50 border-amber-500 shadow-xs'
                                  : 'bg-white hover:bg-slate-50 border-slate-200'
                              }`}
                            >
                              <div className="flex items-start gap-2.5">
                                <span className="font-bold text-xs text-slate-400 mt-0.5">{cIdx + 1}.</span>
                                <p className="text-xs sm:text-sm font-semibold text-slate-800 leading-snug">
                                  {choice.text}
                                </p>
                              </div>

                              <button
                                type="button"
                                disabled={questionDone}
                                className={`px-3.5 py-1.5 rounded-lg text-xs font-black tracking-wider transition ${
                                  isSelected
                                    ? 'bg-amber-500 text-white font-extrabold'
                                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                                }`}
                              >
                                {isSelected ? 'BETUL' : 'PILIH'}
                              </button>
                            </div>
                          );
                        })}

                        <div className="flex justify-end pt-2">
                          {!checkedAnswers[activeQuestion.id]?.isMatch ? (
                            <button
                              type="button"
                              onClick={() => handleCheckAnswer(activeQuestion)}
                              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-black rounded-xl cursor-pointer transition shadow-md"
                            >
                              Semak Jawapan
                            </button>
                          ) : (
                            <div className="flex items-center gap-1.5 text-emerald-600 font-black text-sm">
                              <CheckCircle2 className="w-5 h-5" />
                              <span>Tepat sekali! Pilihan kedua adalah betul.</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* TYPE 6: Subjective evaluation using Interactive Templated Gameplay */}
                    {activeQuestion.type === 'subjective_ai' && (
                      <div className="space-y-4">
                        {/* 1. Interactive Help Guidelines */}
                        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 flex flex-col gap-1.5 leading-relaxed">
                          {!highlightUsaha && (
                            <p className="flex items-center gap-1.5 font-bold text-slate-800">
                              <span className="text-sm">💡</span>
                              <span>Sila klik perkataan <b className="text-amber-600 uppercase bg-amber-100/80 px-1 py-0.5 rounded border border-amber-300">usaha-usaha</b> di dalam soalan di atas untuk menyalakan klu dalam petikan!</span>
                            </p>
                          )}
                          {highlightUsaha && (!isU1Solved || !isU2Solved) && (
                            <p className="flex items-center gap-1.5 font-bold text-violet-800 animate-pulse">
                              <span className="text-sm">🏡</span>
                              <span>Bagus! Sila cari dan klik dua (2) usaha di dalam petikan di sebelah kiri (ia bergaris ungu berkelip).</span>
                            </p>
                          )}
                          {highlightUsaha && isU1Solved && isU2Solved && (!isS1Solved || !isS2Solved) && (
                            <p className="flex items-center gap-1.5 font-bold text-amber-800">
                              <span className="text-sm animate-bounce">✨</span>
                              <span>Usaha ditemui! Seret atau klik huraian (kotak di bawah) ke dalam zon templat yang sesuai!</span>
                            </p>
                          )}
                          {isU1Solved && isU2Solved && isS1Solved && isS2Solved && (
                            <p className="flex items-center gap-1.5 font-black text-emerald-800">
                              <span className="text-sm">🎉</span>
                              <span>Luar biasa! Anda telah berjaya menyusun semua usaha dan huraian dengan betul!</span>
                            </p>
                          )}
                        </div>

                        {/* 2. Drag & Click Huraian Blocks (active only when respective Usaha is solved) */}
                        <div className="flex flex-col gap-2.5">
                          {isU1Solved && !isS1Solved && (
                            <motion.div
                              drag
                              dragConstraints={{ left: -120, right: 120, top: -120, bottom: 120 }}
                              dragElastic={0.6}
                              onDragEnd={(e, info) => handleDropEnd(e, info, 's1')}
                              onClick={() => {
                                setIsS1Solved(true);
                                sound.playChime();
                              }}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              className="px-4 py-3 bg-gradient-to-r from-amber-400 to-amber-500 text-amber-950 font-black rounded-2xl border-2 border-amber-600 shadow-md cursor-grab active:cursor-grabbing text-center max-w-sm mx-auto flex items-center justify-center gap-2 select-none"
                            >
                              <span>🐝</span>
                              <span>Seret / Klik: "menggembirakan hati mereka" (H1)</span>
                            </motion.div>
                          )}

                          {isU2Solved && !isS2Solved && (
                            <motion.div
                              drag
                              dragConstraints={{ left: -120, right: 120, top: -120, bottom: 120 }}
                              dragElastic={0.6}
                              onDragEnd={(e, info) => handleDropEnd(e, info, 's2')}
                              onClick={() => {
                                setIsS2Solved(true);
                                sound.playChime();
                              }}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              className="px-4 py-3 bg-gradient-to-r from-emerald-400 to-emerald-500 text-emerald-950 font-black rounded-2xl border-2 border-emerald-600 shadow-md cursor-grab active:cursor-grabbing text-center max-w-sm mx-auto flex items-center justify-center gap-2 select-none"
                            >
                              <span>🗣️</span>
                              <span>Seret / Klik: "hubungan kekeluargaan menjadi erat" (H2)</span>
                            </motion.div>
                          )}
                        </div>

                        {/* 3. The Interactive Answer Template Box */}
                        <div className="bg-[#fffdf9] border-2 border-amber-200 rounded-3xl p-5 shadow-sm space-y-4 font-serif text-slate-800 leading-relaxed relative overflow-hidden">
                          <div className="absolute right-4 top-4 text-[10px] font-black text-amber-600/30 tracking-widest uppercase">TEMPLAT JAWAPAN</div>
                          
                          <p className="text-xs sm:text-sm md:text-base leading-loose select-none">
                            Usaha yang boleh saya contohi ialah saya akan{' '}
                            <span className={`inline-flex px-2 py-0.5 rounded-lg mx-1 font-bold border ${
                              isU1Solved 
                                ? 'bg-violet-100 border-violet-400 text-violet-950 text-xs sm:text-sm' 
                                : 'bg-slate-100 border-dashed border-slate-300 text-slate-400 text-[10px]'
                            }`}>
                              {isU1Solved ? 'membantu ibu mengemas rumah' : 'U1: Klik dalam petikan'}
                            </span>{' '}
                            kerana ia akan{' '}
                            <span
                              id="dropzone-s1"
                              className={`inline-flex px-2 py-0.5 rounded-lg mx-1 font-bold transition-all border ${
                                isS1Solved
                                  ? 'bg-amber-100 border-amber-400 text-amber-950 text-xs sm:text-sm'
                                  : isU1Solved
                                  ? 'bg-amber-50/50 border-dashed border-amber-300 text-amber-500 text-[10px] animate-pulse ring-2 ring-amber-200'
                                  : 'bg-slate-50 border-dashed border-slate-200 text-slate-400 text-[10px]'
                              }`}
                            >
                              {isS1Solved ? 'menggembirakan hati mereka' : 'S1: Letak huraian di sini'}
                            </span>
                            . Seterusnya, saya akan{' '}
                            <span className={`inline-flex px-2 py-0.5 rounded-lg mx-1 font-bold border ${
                              isU2Solved 
                                ? 'bg-violet-100 border-violet-400 text-violet-950 text-xs sm:text-sm' 
                                : 'bg-slate-100 border-dashed border-slate-300 text-slate-400 text-[10px]'
                            }`}>
                              {isU2Solved ? 'sentiasa bercakap dengan sopan dan mendengar nasihat' : 'U2: Klik dalam petikan'}
                            </span>{' '}
                            supaya{' '}
                            <span
                              id="dropzone-s2"
                              className={`inline-flex px-2 py-0.5 rounded-lg mx-1 font-bold transition-all border ${
                                isS2Solved
                                  ? 'bg-emerald-100 border-emerald-400 text-emerald-950 text-xs sm:text-sm'
                                  : isU2Solved
                                  ? 'bg-emerald-50/50 border-dashed border-emerald-300 text-emerald-500 text-[10px] animate-pulse ring-2 ring-emerald-200'
                                  : 'bg-slate-50 border-dashed border-slate-200 text-slate-400 text-[10px]'
                              }`}
                            >
                              {isS2Solved ? 'hubungan kekeluargaan menjadi lebih erat' : 'S2: Letak huraian di sini'}
                            </span>
                            .
                          </p>
                        </div>

                        {/* 4. Display Feedback Message if solved */}
                        {checkedAnswers[activeQuestion.id]?.isMatch && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="p-4 bg-emerald-50 border-2 border-emerald-300 rounded-2xl relative overflow-hidden space-y-2 mt-2"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5 text-emerald-900 font-extrabold text-sm">
                                <Trophy className="w-5 h-5 text-amber-500 animate-bounce" />
                                <span>Syabas! 5 / 5 Markah</span>
                              </div>
                            </div>
                            <p className="text-xs text-emerald-950 font-bold leading-relaxed">
                              {checkedAnswers[activeQuestion.id]?.feedbackMsg}
                            </p>
                          </motion.div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Feedback Alert */}
                  {checkedAnswers[activeQuestion.id]?.isMatch === false && activeQuestion.type !== 'subjective_ai' && (
                    <div className="flex items-center justify-between text-xs text-red-600 font-bold mt-2 px-1">
                      <div className="flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>Jawapan kurang tepat. Tekan 🐝 Bung Lebah untuk klu!</span>
                      </div>
                      {wrongAttempts[activeQuestion.id] >= 2 && activeQuestion.sampleAnswer && (
                        <span className="text-slate-600 italic hidden sm:inline">
                          Pembayang: Rujuk perenggan klu
                        </span>
                      )}
                    </div>
                  )}

                  {/* Step Navigation Controls */}
                  <div className="flex items-center justify-between gap-3 mt-5 pt-3 border-t border-slate-200">
                    <button
                      type="button"
                      disabled={currentQuestionIndex === 0}
                      onClick={() => {
                        sound.playPop();
                        setCurrentQuestionIndex((prev) => Math.max(0, prev - 1));
                      }}
                      className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 disabled:pointer-events-none text-slate-800 font-bold text-xs rounded-xl border border-slate-300 transition flex items-center gap-1 cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>Sebelum</span>
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
                      className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-40 disabled:pointer-events-none text-white font-bold text-xs rounded-xl transition flex items-center gap-1 cursor-pointer shadow-xs"
                    >
                      <span>Seterusnya</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          ) : (
            /* VIEW ALL QUESTIONS AT ONCE LIST */
            <div className="flex flex-col gap-3.5 max-h-[calc(100vh-215px)] overflow-y-auto pr-1">
              {questions.map((q, idx) => {
                const isCorrect = checkedAnswers[q.id]?.isMatch;
                const isShaking = shakeQuestionId === q.id;

                return (
                  <motion.div
                    key={q.id}
                    id={`question-card-${q.id}`}
                    animate={isShaking ? { x: [-10, 10, -6, 6, -3, 3, 0] } : { x: 0 }}
                    transition={{ duration: 0.4 }}
                    className={`p-4 rounded-2xl border-2 transition-all relative ${
                      isCorrect
                        ? 'bg-emerald-50/40 border-emerald-400 shadow-xs'
                        : 'bg-white border-amber-300 shadow-xs'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-start gap-1.5 flex-1">
                        <span className="font-black text-sm text-amber-800">
                          {idx + 1}.
                        </span>
                        <h3 className="font-bold text-sm text-slate-900 leading-snug">
                          {q.questionText}
                        </h3>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <span
                          className={`font-semibold italic text-[11px] px-2 py-0.5 rounded-md ${
                            isCorrect
                              ? 'text-emerald-700 bg-emerald-100 font-bold'
                              : 'text-slate-700 bg-amber-50'
                          }`}
                        >
                          [{q.marks} m]
                        </span>

                        {q.clueTarget !== 'none' && (
                          <button
                            ref={(el) => (beeButtonRefs.current[q.id] = el)}
                            type="button"
                            onClick={() => {
                              setCurrentQuestionIndex(idx);
                              triggerHint(q, beeButtonRefs.current[q.id]);
                            }}
                            className="p-1 rounded-full bg-amber-100 hover:bg-amber-200 border-2 border-amber-400 text-amber-900 shadow-xs transition-all cursor-pointer flex items-center justify-center"
                            title="Tanya Bung Lebah 🐝"
                          >
                            <BeeHintIcon className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Question Answer Panel */}
                    <div className="relative mt-2">
                      {q.type === 'underline_compound' ? (
                        <div className="bg-amber-50/10 p-3 rounded-xl border border-amber-200/50">
                          <div className="flex flex-wrap gap-1.5 py-1">
                            {[
                              { id: 'bapa', word: 'Bapa' },
                              { id: 'nirmala', word: 'Nirmala' },
                              { id: 'pula', word: 'pula' },
                              { id: 'sedang', word: 'sedang' },
                              { id: 'membaca', word: 'membaca' },
                              { id: 'surat-khabar', word: 'surat khabar' },
                              { id: 'di', word: 'di' },
                              { id: 'ruang-tamu', word: 'ruang tamu' },
                            ].map((item) => {
                              const isSelected = selectedWords9d[item.id];
                              const qDone = checkedAnswers[q.id]?.isMatch;

                              return (
                                <button
                                  key={item.id}
                                  disabled={qDone}
                                  onClick={() => {
                                    sound.playPop();
                                    setSelectedWords9d((prev) => ({
                                      ...prev,
                                      [item.id]: !prev[item.id],
                                    }));
                                  }}
                                  className={`px-2 py-1 text-xs font-bold rounded-lg transition-all ${
                                    isSelected
                                      ? 'bg-red-500 text-white line-through font-black'
                                      : 'bg-white hover:bg-amber-100 border border-amber-200 text-slate-800'
                                  }`}
                                >
                                  {item.word}
                                </button>
                              );
                            })}
                          </div>
                          <div className="flex justify-end gap-2 mt-2">
                            {!isCorrect ? (
                              <button
                                type="button"
                                onClick={() => handleCheckAnswer(q)}
                                className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-white text-xs font-black rounded-lg cursor-pointer"
                              >
                                Semak
                              </button>
                            ) : (
                              <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                                <Check className="w-4 h-4" />
                                <span>Syabas (+1m)</span>
                              </span>
                            )}
                          </div>
                        </div>
                      ) : q.type === 'match_meaning' ? (
                        <div className="space-y-2">
                          {[
                            {
                              id: 'choice-1',
                              text: 'Nirmala menasihati ibunya untuk membantu ibu bapa dan menjaga tutur kata.',
                            },
                            {
                              id: 'choice-2',
                              text: 'Ibu Nirmala menasihati Nirmala untuk membantu ibu bapa dan menjaga tutur kata.',
                            },
                          ].map((choice) => {
                            const isSelected = selectedChoice9e === choice.id;
                            const qDone = checkedAnswers[q.id]?.isMatch;

                            return (
                              <div
                                key={choice.id}
                                onClick={() => {
                                  if (!qDone) {
                                    sound.playPop();
                                    setSelectedChoice9e(choice.id);
                                  }
                                }}
                                className={`p-2.5 rounded-xl border transition-all flex items-center justify-between gap-3 cursor-pointer text-xs font-semibold ${
                                  isSelected ? 'bg-amber-50/70 border-amber-400' : 'bg-white border-slate-100'
                                }`}
                              >
                                <span>{choice.text}</span>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${isSelected ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-600'}`}>
                                  {isSelected ? 'BETUL' : 'PILIH'}
                                </span>
                              </div>
                            );
                          })}

                          <div className="flex justify-end mt-1">
                            {!isCorrect ? (
                              <button
                                type="button"
                                onClick={() => handleCheckAnswer(q)}
                                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-black rounded-lg cursor-pointer"
                              >
                                Semak
                              </button>
                            ) : (
                              <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                                <Check className="w-4 h-4" />
                                <span>Syabas (+1m)</span>
                              </span>
                            )}
                          </div>
                        </div>
                      ) : q.type === 'subjective_ai' ? (
                        <div className="space-y-2">
                          <textarea
                            value={userAnswers[q.id] || ''}
                            disabled={isGradingQ10}
                            onChange={(e) => {
                              setUserAnswers({
                                ...userAnswers,
                                [q.id]: e.target.value,
                              });
                            }}
                            rows={2}
                            placeholder="Tuliskan cadangan jawapan lengkap anda di sini..."
                            className="w-full p-3 font-semibold text-xs border-2 border-amber-200 rounded-xl bg-transparent"
                          />

                          <div className="flex justify-between items-center text-xs">
                            <span className="text-[10px] text-slate-500">
                              {(userAnswers[q.id] || '').trim().split(/\s+/).filter(Boolean).length} / 30 patah kata
                            </span>

                            {!checkedAnswers[q.id] ? (
                              <button
                                type="button"
                                onClick={() => handleCheckAnswer(q)}
                                className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-black rounded-lg cursor-pointer"
                              >
                                Semak AI
                              </button>
                            ) : (
                              <span className="text-xs font-black text-amber-700">
                                Ditilai: {checkedAnswers[q.id].score} / 5 Markah
                              </span>
                            )}
                          </div>

                          {checkedAnswers[q.id] && (
                            <div className="p-2.5 bg-amber-50/50 rounded-lg border border-amber-200 text-xs text-slate-800 leading-normal mt-1 space-y-1">
                              <p><b>Komen Guru:</b> {checkedAnswers[q.id].feedbackMsg}</p>
                              {checkedAnswers[q.id].corrected && <p className="text-emerald-800"><b>Cadangan:</b> {checkedAnswers[q.id].corrected}</p>}
                            </div>
                          )}
                        </div>
                      ) : (
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
                                ? 'Syabas! Betul.'
                                : 'Taip jawapan & tekan Enter ↵'
                            }
                            className={`w-full py-1.5 px-2.5 font-bold text-xs border-b-2 focus:outline-none transition-all rounded-t-sm ${
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
                              Semak
                            </button>
                          ) : (
                            <div className="flex items-center gap-1 text-emerald-600 font-black text-xs px-1 shrink-0">
                              <CheckCircle2 className="w-4 h-4" />
                              <span>+{q.marks}</span>
                            </div>
                          )}
                        </div>
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
                <div className="text-[10px] font-bold uppercase tracking-wider text-amber-700">
                  Keputusan Prestasi
                </div>
                <div className="text-sm sm:text-base font-black text-slate-900">
                  {totalScore} / {totalPossibleMarks} Markah
                  {isAllCorrect && (
                    <span className="ml-1.5 text-xs text-emerald-600 font-extrabold block sm:inline">
                      🎉 Cemerlang 100%!
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
                <span>Mula Semula</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
