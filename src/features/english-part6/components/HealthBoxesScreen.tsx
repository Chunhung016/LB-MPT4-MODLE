import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Volume2,
  VolumeX,
  Sliders,
  Move,
  CheckCircle2,
  Layers,
  Eye,
  RotateCcw,
  Sparkles,
  X,
  Copy,
  FileText,
  Trophy,
  ArrowRight,
  ArrowLeft,
  HelpCircle,
  Clock,
  Play,
  Heart,
  BookOpen,
  Camera,
  Activity,
  Flame,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useApp } from '../context/AppContext';
import { HealthCardBox } from '../types';
import { sound } from '../utils/audio';

interface HealthBoxesScreenProps {
  onBack: () => void;
}

interface SentenceSlots {
  hobby: string;
  reason1: string;
  reason2: string;
}

const INITIAL_SLOTS: SentenceSlots = {
  hobby: '',
  reason1: '',
  reason2: '',
};

export const HealthBoxesScreen: React.FC<HealthBoxesScreenProps> = ({ onBack }) => {
  const {
    settings,
    updateBox,
    setIsAdminOpen,
    isAlignMode,
    setIsAlignMode,
    activeAlignBoxId,
    setActiveAlignBoxId,
  } = useApp();

  // Multi-stage click tracking per hobby box:
  // 0 = Initial (Black & White)
  // 1 = 1st Click (Hobby Name popped out)
  // 2 = 2nd Click (Colored version loaded, reasons popped out)
  const [boxStages, setBoxStages] = useState<{ [boxId: string]: number }>({});
  const [chosenHobbyId, setChosenHobbyId] = useState<string | null>(null);

  // Active Sentence Construction State
  const [sentenceSlots, setSentenceSlots] = useState<SentenceSlots>(INITIAL_SLOTS);
  const [activeSelectedText, setActiveSelectedText] = useState<{
    text: string;
    type: 'hobby' | 'reason1' | 'reason2';
    boxId: string;
  } | null>(null);

  const [hasCelebratedCompletion, setHasCelebratedCompletion] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  // Challenge Mode State
  const [isBeeChallengeActive, setIsBeeChallengeActive] = useState(false);
  const [beeCountdown, setBeeCountdown] = useState<number | null>(null);
  const [beeRound, setBeeRound] = useState<number>(1);
  const [removedSlots, setRemovedSlots] = useState<Set<keyof SentenceSlots>>(new Set());
  const [beeInputs, setBeeInputs] = useState<{ [K in keyof SentenceSlots]?: string }>({});
  const [dissolvingSlots, setDissolvingSlots] = useState<Set<keyof SentenceSlots>>(new Set());
  const [isVictoryModalOpen, setIsVictoryModalOpen] = useState(false);
  const [typingFeedback, setTypingFeedback] = useState<string | null>(null);
  const [isRoundTransitioning, setIsRoundTransitioning] = useState(false);

  const beeTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Get question prompt from settings
  const questionPrompt = settings.questionPrompt || "Your class is preparing a Hobby Showcase Wall. Which hobby would you like to learn? Give TWO reasons.";

  // Audio mute toggle local state
  const [isMuted, setIsMuted] = useState(false);

  const handleMuteToggle = () => {
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    sound.syncWithSettings({
      ...settings,
      soundEnabled: !nextMute,
      popSoundEnabled: !nextMute,
      chimeSoundEnabled: !nextMute,
      fanfareSoundEnabled: !nextMute,
    });
    sound.playPop();
  };

  // Click handler on the 8 hobby cards
  const handleBoxClick = (box: HealthCardBox, e: React.MouseEvent<HTMLDivElement>) => {
    if (isAlignMode) return;

    if (!chosenHobbyId) {
      setChosenHobbyId(box.id);
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = rect.left + rect.width / 2;
    const clickY = rect.top + rect.height / 2;

    const currentStage = boxStages[box.id] || 0;

    if (currentStage === 0) {
      // 1st Click: Unlock stage 1
      setBoxStages((prev) => ({ ...prev, [box.id]: 1 }));
      sound.playPop();
      triggerConfetti(clickX, clickY);
    } else if (currentStage === 1) {
      // 2nd Click: Unlock stage 2
      setBoxStages((prev) => ({ ...prev, [box.id]: 2 }));
      sound.playCelebration();
      triggerConfetti(clickX, clickY);
    } else {
      // Re-trigger visual feedback
      sound.playPop();
      triggerConfetti(clickX, clickY);
    }
  };

  // Helper for micro-confetti on clicks
  const triggerConfetti = (x: number, y: number) => {
    if (!settings.enableConfettiOnClick) return;
    confetti({
      particleCount: 20,
      spread: 45,
      origin: {
        x: x / window.innerWidth,
        y: y / window.innerHeight,
      },
      colors: ['#F59E0B', '#10B981', '#3B82F6', '#F43F5E', '#10B981'],
    });
  };

  // Check if sentence construction slots are fully complete
  const isSentenceComplete = !!sentenceSlots.hobby && !!sentenceSlots.reason1 && !!sentenceSlots.reason2;

  // Manage 45-second countdown once sentence slots are fully complete
  useEffect(() => {
    if (isSentenceComplete && !isBeeChallengeActive && beeCountdown === null && !isVictoryModalOpen) {
      setBeeCountdown(45);
    }
  }, [isSentenceComplete, isBeeChallengeActive, beeCountdown, isVictoryModalOpen]);

  useEffect(() => {
    if (beeCountdown === null || isBeeChallengeActive) return;

    if (beeCountdown > 0) {
      beeTimerRef.current = setTimeout(() => {
        setBeeCountdown((prev) => (prev !== null && prev > 0 ? prev - 1 : 0));
      }, 1000);
    } else if (beeCountdown === 0) {
      startBeeChallenge();
    }

    return () => {
      if (beeTimerRef.current) clearTimeout(beeTimerRef.current);
    };
  }, [beeCountdown, isBeeChallengeActive]);

  // Handle slot item drag and drop
  const handleDragStart = (
    e: React.DragEvent,
    text: string,
    type: 'hobby' | 'reason1' | 'reason2',
    boxId: string
  ) => {
    e.dataTransfer.setData('text/plain', JSON.stringify({ text, type, boxId }));
    setActiveSelectedText({ text, type, boxId });
  };

  const handleSlotDrop = (e: React.DragEvent, slotKey: keyof SentenceSlots) => {
    e.preventDefault();
    try {
      const dataStr = e.dataTransfer.getData('text/plain');
      if (dataStr) {
        const { text, type } = JSON.parse(dataStr);
        // Ensure type matching
        if (slotKey === 'hobby' && type !== 'hobby') return;
        if (slotKey === 'reason1' && type === 'hobby') return;
        if (slotKey === 'reason2' && type === 'hobby') return;

        setSentenceSlots((prev) => ({ ...prev, [slotKey]: text }));
        sound.playChime();
      }
    } catch {
      if (activeSelectedText) {
        if (slotKey === 'hobby' && activeSelectedText.type !== 'hobby') return;
        if (slotKey === 'reason1' && activeSelectedText.type === 'hobby') return;
        if (slotKey === 'reason2' && activeSelectedText.type === 'hobby') return;

        setSentenceSlots((prev) => ({ ...prev, [slotKey]: activeSelectedText.text }));
        sound.playChime();
      }
    }
    setActiveSelectedText(null);
  };

  // Handle slot click placing / erasing
  const handleSlotClick = (slotKey: keyof SentenceSlots) => {
    if (activeSelectedText) {
      // Place active selection
      if (slotKey === 'hobby' && activeSelectedText.type !== 'hobby') return;
      if (slotKey === 'reason1' && activeSelectedText.type === 'hobby') return;
      if (slotKey === 'reason2' && activeSelectedText.type === 'hobby') return;

      setSentenceSlots((prev) => ({ ...prev, [slotKey]: activeSelectedText.text }));
      sound.playChime();
      setActiveSelectedText(null);
    } else if (sentenceSlots[slotKey]) {
      // Clear slot
      setSentenceSlots((prev) => ({ ...prev, [slotKey]: '' }));
      sound.playPop();
    }
  };

  // Trigger celebration when sentence is completed
  useEffect(() => {
    if (isSentenceComplete && !hasCelebratedCompletion) {
      setHasCelebratedCompletion(true);
      sound.playCelebration();
      confetti({
        particleCount: 80,
        spread: 100,
        origin: { y: 0.6 },
        colors: ['#F59E0B', '#10B981', '#3B82F6', '#EC4899', '#8B5CF6'],
      });
    }
  }, [isSentenceComplete, hasCelebratedCompletion]);

  // Bee Writing Challenge Logic (3 Rounds)
  const startBeeChallenge = () => {
    startChallengeRound(1);
  };

  const startChallengeRound = (roundNum: number) => {
    setIsBeeChallengeActive(true);
    setBeeRound(roundNum);
    setBeeCountdown(null);
    setTypingFeedback(null);
    setIsRoundTransitioning(false);

    // Determine slot to dissolve based on round
    // Round 1: dissolve hobby name
    // Round 2: dissolve reason1
    // Round 3: dissolve reason2
    const targetKey: keyof SentenceSlots = roundNum === 1 ? 'hobby' : roundNum === 2 ? 'reason1' : 'reason2';
    const pickedSet = new Set<keyof SentenceSlots>([targetKey]);

    setDissolvingSlots(pickedSet);
    sound.playPop();

    // Visual dust burst effect
    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.65 },
      colors: ['#FBBF24', '#FEF3C7', '#FFFFFF', '#D97706'],
    });

    setTimeout(() => {
      setRemovedSlots(pickedSet);
      setDissolvingSlots(new Set());
      setBeeInputs({ [targetKey]: '' });
    }, 700);
  };

  // Smart normalized string checker for kid-friendly input checks
  const normalizeText = (str: string | undefined): string => {
    if (!str) return '';
    return str
      .toLowerCase()
      .trim()
      .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()"'`]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  };

  const isAnswerMatch = (input: string | undefined, target: string | undefined) => {
    if (!input || !target) return false;
    return normalizeText(input) === normalizeText(target);
  };

  const handleBeeInputChange = (slotKey: keyof SentenceSlots, val: string) => {
    if (isRoundTransitioning) return;

    const updatedInputs = { ...beeInputs, [slotKey]: val };
    setBeeInputs(updatedInputs);

    const targetVal = sentenceSlots[slotKey];
    if (isAnswerMatch(val, targetVal)) {
      setIsRoundTransitioning(true);
      sound.playCelebration();
      confetti({
        particleCount: 50,
        spread: 80,
        origin: { y: 0.6 },
      });
      setTypingFeedback('Amazing! Correct! 🎉');

      setTimeout(() => {
        setTypingFeedback(null);
        if (beeRound < 3) {
          startChallengeRound(beeRound + 1);
        } else {
          // Completed all 3 rounds! Trophy!
          setIsVictoryModalOpen(true);
          setIsBeeChallengeActive(false);
          setIsRoundTransitioning(false);
          sound.playCelebration();
          confetti({
            particleCount: 120,
            spread: 120,
            origin: { y: 0.4 },
          });
        }
      }, 1200);
    }
  };

  const handleCopyParagraph = () => {
    const fullText = `I would like to learn ${sentenceSlots.hobby || '[hobby]'} as my hobby. Firstly, ${sentenceSlots.reason1 || '[first reason]'}. Secondly, ${sentenceSlots.reason2 || '[second reason]'}.`;
    navigator.clipboard.writeText(fullText);
    setIsCopied(true);
    sound.playChime();
    setTimeout(() => setIsCopied(false), 2500);
  };

  const handleReset = () => {
    if (beeTimerRef.current) clearTimeout(beeTimerRef.current);
    setBoxStages({});
    setSentenceSlots(INITIAL_SLOTS);
    setActiveSelectedText(null);
    setHasCelebratedCompletion(false);
    setIsBeeChallengeActive(false);
    setBeeCountdown(null);
    setBeeRound(1);
    setRemovedSlots(new Set());
    setDissolvingSlots(new Set());
    setBeeInputs({});
    setChosenHobbyId(null);
    sound.playPop();
  };

  // Render slots for sentence builder
  const renderSlot = (slotKey: keyof SentenceSlots, placeholder: string, colorClass: string) => {
    if (dissolvingSlots.has(slotKey)) {
      return (
        <motion.span
          initial={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
          animate={{
            opacity: [1, 0.7, 0],
            scale: [1, 1.15, 1.3],
            filter: ['blur(0px)', 'blur(3px)', 'blur(8px)'],
          }}
          transition={{ duration: 0.7 }}
          className="inline-flex items-center mx-1 px-3 py-1 bg-amber-200 border-2 border-[#78350F] rounded-xl text-sm font-black text-[#78350F]"
        >
          ✨ {sentenceSlots[slotKey]}
        </motion.span>
      );
    }

    if (removedSlots.has(slotKey)) {
      const isCorrect = isAnswerMatch(beeInputs[slotKey], sentenceSlots[slotKey]);
      return (
        <span className="inline-flex items-center mx-1 relative align-middle">
          <input
            type="text"
            value={beeInputs[slotKey] || ''}
            onChange={(e) => handleBeeInputChange(slotKey, e.target.value)}
            placeholder={`Type ${placeholder}...`}
            className={`px-3 py-1 bg-white text-[#78350F] font-black border-2 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-4 transition-all min-w-[200px] max-w-[340px] ${
              isCorrect ? 'border-emerald-500 bg-emerald-50' : 'border-[#78350F] focus:ring-[#F59E0B]'
            }`}
            autoFocus
          />
          {isCorrect && <span className="absolute right-3 text-emerald-500 font-bold">✓</span>}
        </span>
      );
    }

    const value = sentenceSlots[slotKey];
    return (
      <span
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => handleSlotDrop(e, slotKey)}
        onClick={() => handleSlotClick(slotKey)}
        className={`inline-flex items-center align-middle mx-1.5 px-3.5 py-1.5 rounded-xl border-2 transition-all cursor-pointer select-none text-xs sm:text-sm font-black ${
          value
            ? `${colorClass} border-[#78350F] shadow-[3px_3px_0px_#78350F] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_#78350F]`
            : 'bg-white border-dashed border-[#78350F]/40 hover:border-[#78350F] hover:bg-[#FEF3C7]/40 text-[#78350F]/50'
        }`}
      >
        {value ? (
          <>
            <span>{value}</span>
            <X className="w-3.5 h-3.5 ml-1.5 shrink-0 opacity-80 hover:opacity-100" />
          </>
        ) : (
          <span>({placeholder})</span>
        )}
      </span>
    );
  };

  // Determine which cards are currently stage >= 1 and stage >= 2
  const unlockedHobbies = settings.boxes.filter((b) => (boxStages[b.id] || 0) >= 1);
  const unlockedReasons = settings.boxes.filter((b) => (boxStages[b.id] || 0) >= 2);

  return (
    <div className="flex-1 flex flex-col min-h-screen pb-12">
      {/* 1. APP HEADER BANNER WITH TASK QUESTION */}
      <div className="w-full bg-[#FEF3C7] border-b-4 border-[#78350F] px-4 sm:px-6 py-4 z-10 shadow-sm">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <button
              onClick={() => {
                sound.playPop();
                onBack();
              }}
              className="flex cursor-pointer items-center gap-1.5 rounded-full border-2 border-[#78350F] bg-white px-3 py-1.5 text-xs font-black text-[#78350F] shadow-[2px_2px_0_rgba(120,53,15,1)] transition-transform active:translate-y-0.5 hover:bg-amber-50 mr-1"
              aria-label="Back"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>BACK</span>
            </button>
            <span className="shrink-0 mt-0.5 px-2.5 py-1 bg-[#F59E0B] text-[#78350F] font-black text-xs uppercase rounded-lg border-2 border-[#78350F] shadow-[2px_2px_0px_#78350F]">
              TASK
            </span>
            <div className="text-sm sm:text-base font-black text-[#78350F] leading-relaxed">
              {questionPrompt}
            </div>
          </div>

          {/* UTILITIES TRAY */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Audio Toggle */}
            <button
              onClick={handleMuteToggle}
              className="p-2 sm:p-2.5 bg-white hover:bg-[#FEF3C7] border-2 border-[#78350F] rounded-xl text-[#78350F] shadow-[3px_3px_0px_#78350F] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[2px_2px_0px_#78350F] transition-all cursor-pointer"
              title={isMuted ? 'Unmute sound effects' : 'Mute sound effects'}
            >
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>

            {/* Clear/Reset */}
            <button
              onClick={handleReset}
              className="px-3.5 py-2 bg-white hover:bg-[#FEF3C7] border-2 border-[#78350F] rounded-xl text-[#78350F] font-black text-xs shadow-[3px_3px_0px_#78350F] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[2px_2px_0px_#78350F] transition-all cursor-pointer flex items-center gap-1.5"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset</span>
            </button>
          </div>
        </div>
      </div>

      <main className="flex-1 p-3 sm:p-6 md:p-8 max-w-7xl mx-auto w-full flex flex-col gap-8">
        
        {/* 2. 2X4 INTERACTIVE HOBBIES GRID */}
        {!isBeeChallengeActive && (
          <div className="space-y-3">
            {chosenHobbyId ? (
              <div className="flex items-center justify-between px-2">
                <span className="text-xs font-black tracking-wider uppercase text-emerald-800 flex items-center gap-1.5 animate-pulse">
                  ✨ Your Selected Hobby (Click it again to reveal its 2 reasons!)
                </span>
                <button
                  onClick={() => {
                    setChosenHobbyId(null);
                    sound.playPop();
                  }}
                  className="px-3.5 py-1.5 bg-amber-100 hover:bg-amber-200 text-[#78350F] border-2 border-[#78350F] rounded-xl font-black text-xs shadow-[3px_3px_0px_#78350F] active:translate-y-0.5 active:shadow-[1px_1px_0px_#78350F] transition-all cursor-pointer flex items-center gap-1"
                >
                  ← Show All Hobbies
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between px-2">
                <span className="text-xs font-black tracking-wider uppercase text-[#78350F]/70">
                  🎨 Hobby Showcase Wall (Click an image to begin!)
                </span>
                <span className="hidden sm:inline-block text-xs font-bold text-[#78350F]/60">
                  Click twice to color and reveal 2 reasons
                </span>
              </div>
            )}

            <div className={chosenHobbyId ? "flex justify-center w-full max-w-sm mx-auto" : "grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-5 w-full"}>
              <AnimatePresence mode="popLayout">
                {settings.boxes
                  .filter((box) => !chosenHobbyId || box.id === chosenHobbyId)
                  .map((box, index) => {
                    const stage = boxStages[box.id] || 0;
                    const isColored = stage >= 2;
                    const isSelectedForAlign = isAlignMode && activeAlignBoxId === box.id;

                    return (
                      <motion.div
                        key={box.id}
                        id={`hobby-card-${box.id}`}
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.4, y: 15, transition: { duration: 0.3 } }}
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={(e) => {
                          if (isAlignMode) {
                            setActiveAlignBoxId(box.id);
                          } else {
                            handleBoxClick(box, e);
                          }
                        }}
                        className={`relative w-full bg-white rounded-2xl border-4 transition-all duration-200 overflow-hidden flex flex-col p-2.5 shadow-[4px_4px_0px_#78350F] select-none ${
                          isSelectedForAlign
                            ? 'border-emerald-500 ring-4 ring-emerald-500/30'
                            : stage === 1
                            ? 'border-amber-400 shadow-[4px_4px_0px_#D97706]'
                            : stage === 2
                            ? 'border-emerald-500 shadow-[4px_4px_0px_#059669]'
                            : 'border-[#78350F] hover:shadow-[5px_5px_0px_#F59E0B] cursor-pointer'
                        }`}
                      >
                        {/* Header badge */}
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[10px] font-black px-1.5 py-0.5 bg-amber-100 border border-[#78350F]/30 rounded-md">
                            Hobby {index + 1}
                          </span>
                          {stage >= 2 ? (
                            <span className="text-[9px] font-black px-1.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-300 rounded-md uppercase">
                              Completed
                            </span>
                          ) : stage === 1 ? (
                            <span className="text-[9px] font-black px-1.5 py-0.5 bg-amber-50 text-amber-700 border border-amber-300 rounded-md uppercase animate-pulse">
                              Revealed
                            </span>
                          ) : (
                            <span className="text-[9px] font-black px-1.5 py-0.5 bg-slate-100 text-slate-500 border border-slate-300 rounded-md uppercase">
                              Locked
                            </span>
                          )}
                        </div>

                        {/* Image Area */}
                        <div className="relative aspect-video w-full bg-amber-50/50 rounded-xl overflow-hidden flex items-center justify-center p-1 border-2 border-dashed border-[#78350F]/20">
                          <img
                            src={isColored ? box.overlayPngUrl : box.imageUrl}
                            alt={box.altText}
                            className="w-full h-full object-contain pointer-events-none rounded-lg"
                            referrerPolicy="no-referrer"
                          />
                        </div>

                        {/* Footer Title */}
                        <div className="mt-2 text-center text-xs font-black tracking-wide uppercase text-[#78350F]">
                          {box.title}
                        </div>
                      </motion.div>
                    );
                  })}
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* 3. POPPED OUT/UNLOCKED WORD POOL AREA */}
        {!isBeeChallengeActive && (unlockedHobbies.length > 0 || unlockedReasons.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full bg-white border-3 border-[#78350F] rounded-2xl p-4 shadow-[4px_4px_0px_#78350F] space-y-3.5"
          >
            <div className="flex items-center gap-2 border-b-2 border-[#FEF3C7] pb-1.5">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <h3 className="font-black text-sm uppercase tracking-wide text-[#78350F]">
                Unlocked Word Pool (Click or drag items to place in slots below!)
              </h3>
            </div>

            {/* Hobbies list */}
            {unlockedHobbies.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-[10px] font-black tracking-wider uppercase text-slate-500 block">
                  👉 Available Hobbies:
                </span>
                <div className="flex flex-wrap gap-2">
                  {unlockedHobbies.map((b) => {
                    const isPlaced = sentenceSlots.hobby === b.textBox1;
                    if (isPlaced) return null;

                    return (
                      <motion.div
                        key={`unlocked-hobby-${b.id}`}
                        draggable
                        onDragStart={(e) => handleDragStart(e, b.textBox1, 'hobby', b.id)}
                        onClick={() => {
                          setActiveSelectedText({ text: b.textBox1, type: 'hobby', boxId: b.id });
                          sound.playPop();
                        }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`px-3 py-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 border-2 border-[#78350F] rounded-xl font-black text-xs cursor-grab active:cursor-grabbing flex items-center gap-1 shadow-[2px_2px_0px_#78350F] transition-all ${
                          activeSelectedText?.text === b.textBox1 ? 'ring-4 ring-emerald-500' : ''
                        }`}
                      >
                        <Heart className="w-3.5 h-3.5 fill-emerald-500/40" />
                        <span className="capitalize">{b.textBox1}</span>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Reasons list */}
            {unlockedReasons.length > 0 && (
              <div className="space-y-1.5 pt-1.5 border-t border-[#FFFBEB]">
                <span className="text-[10px] font-black tracking-wider uppercase text-slate-500 block">
                  👉 Available Reasons:
                </span>
                <div className="flex flex-col gap-2">
                  {unlockedReasons.map((b) => {
                    const isR1Placed = sentenceSlots.reason1 === b.textBox2 || sentenceSlots.reason2 === b.textBox2;
                    const isR2Placed = sentenceSlots.reason1 === b.textBox3 || sentenceSlots.reason2 === b.textBox3;

                    return (
                      <div key={`unlocked-reasons-group-${b.id}`} className="flex flex-col sm:flex-row gap-2">
                        {/* Reason 1 */}
                        {!isR1Placed && (
                          <motion.div
                            draggable
                            onDragStart={(e) => handleDragStart(e, b.textBox2, 'reason1', b.id)}
                            onClick={() => {
                              setActiveSelectedText({ text: b.textBox2, type: 'reason1', boxId: b.id });
                              sound.playPop();
                            }}
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            className={`flex-1 p-2 bg-amber-50 hover:bg-amber-100 text-amber-950 border-2 border-[#78350F] rounded-xl font-bold text-xs cursor-grab active:cursor-grabbing flex items-start gap-1.5 shadow-[2px_2px_0px_#78350F] transition-all ${
                              activeSelectedText?.text === b.textBox2 ? 'ring-4 ring-amber-400' : ''
                            }`}
                          >
                            <span className="px-1.5 py-0.5 bg-amber-200 text-[#78350F] rounded-md text-[8px] font-black shrink-0 border border-[#78350F]/20">
                              REASON
                            </span>
                            <span className="leading-snug">{b.textBox2}</span>
                          </motion.div>
                        )}

                        {/* Reason 2 */}
                        {!isR2Placed && (
                          <motion.div
                            draggable
                            onDragStart={(e) => handleDragStart(e, b.textBox3, 'reason2', b.id)}
                            onClick={() => {
                              setActiveSelectedText({ text: b.textBox3, type: 'reason2', boxId: b.id });
                              sound.playPop();
                            }}
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            className={`flex-1 p-2 bg-blue-50 hover:bg-blue-100 text-blue-950 border-2 border-[#78350F] rounded-xl font-bold text-xs cursor-grab active:cursor-grabbing flex items-start gap-1.5 shadow-[2px_2px_0px_#78350F] transition-all ${
                              activeSelectedText?.text === b.textBox3 ? 'ring-4 ring-blue-400' : ''
                            }`}
                          >
                            <span className="px-1.5 py-0.5 bg-blue-200 text-blue-900 rounded-md text-[8px] font-black shrink-0 border border-[#78350F]/20">
                              REASON
                            </span>
                            <span className="leading-snug">{b.textBox3}</span>
                          </motion.div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* 4. SENTENCE CONSTRUCTION AND BEE WRITING CHALLENGE TRAY */}
        <div className="w-full max-w-4xl mx-auto flex flex-col gap-4">
          <motion.div
            layout
            className="w-full bg-white border-4 border-[#78350F] rounded-3xl p-5 sm:p-6 shadow-[6px_6px_0px_#78350F] relative overflow-hidden"
          >
            {/* Mascot Decor / Floating help */}
            <div className="absolute top-4 right-4 hidden md:block">
              <div className="w-12 h-12 rounded-full bg-amber-50 border-2 border-amber-300 flex items-center justify-center animate-bounce">
                <span className="text-xl">🐝</span>
              </div>
            </div>

            {/* Header Title */}
            <div className="flex items-center gap-2 border-b-2 border-amber-100 pb-3 mb-4">
              <FileText className="w-5 h-5 text-amber-500" />
              <h2 className="font-black text-base sm:text-lg tracking-wide uppercase text-[#78350F]">
                {isBeeChallengeActive ? 'Writing Challenge Mode! 🐝' : 'Create Your Hobby Paragraph'}
              </h2>
            </div>

            {/* 45s Countdown Alert Bar */}
            {beeCountdown !== null && !isBeeChallengeActive && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-4 p-3 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 border-3 border-[#78350F] rounded-2xl shadow-[3px_3px_0px_#78350F] flex flex-col sm:flex-row items-center justify-between gap-3 text-[#78350F]"
              >
                <div className="flex items-center gap-2.5">
                  <Clock className="w-5 h-5 animate-spin" />
                  <span className="font-black text-xs sm:text-sm uppercase tracking-wider">
                    Writing Challenge begins in <span className="text-rose-600 text-lg font-black">{beeCountdown}s</span>! Memorize the sentences!
                  </span>
                </div>
                <button
                  onClick={startBeeChallenge}
                  className="px-4 py-2 bg-white hover:bg-amber-50 text-[#78350F] font-black text-xs rounded-xl border-2 border-[#78350F] shadow-[2px_2px_0px_#78350F] cursor-pointer shrink-0 transition-transform hover:scale-105 active:scale-95"
                >
                  Start Now! ⚡
                </button>
              </motion.div>
            )}

            {/* Bee Round Indicator */}
            {isBeeChallengeActive && (
              <div className="mb-4 p-3 bg-amber-50 border-3 border-[#78350F] rounded-2xl shadow-[2px_2px_0px_#78350F] flex items-center justify-between gap-2 text-[#78350F]">
                <div className="flex items-center gap-2">
                  <span className="text-xl animate-pulse">🐝</span>
                  <span className="px-3 py-1 bg-[#F59E0B] text-[#78350F] rounded-lg font-black text-xs uppercase border border-[#78350F]">
                    Round {beeRound} / 3
                  </span>
                  <span className="text-xs font-bold">Type the missing parts of the sentence correctly!</span>
                </div>
              </div>
            )}

            {typingFeedback && (
              <div className="mb-4 px-3 py-2 bg-emerald-50 border-2 border-emerald-500 text-emerald-800 rounded-xl font-black text-xs flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>{typingFeedback}</span>
              </div>
            )}

            {/* WRITING TEMPLATE INLINE FLOW */}
            <div className="p-4 sm:p-6 bg-[#FFFBEB] border-2 sm:border-3 border-[#78350F] rounded-2xl text-sm sm:text-base md:text-lg font-bold text-[#78350F] leading-[2.6] sm:leading-[3.0]">
              <span>I would like to learn </span>

              {/* SLOT: HOBBY */}
              {renderSlot('hobby', 'hobby name', 'bg-emerald-100 text-emerald-950')}

              <span> as my hobby. Firstly, </span>

              {/* SLOT: REASON 1 */}
              {renderSlot('reason1', 'first reason', 'bg-amber-100 text-amber-950')}

              <span>. Secondly, </span>

              {/* SLOT: REASON 2 */}
              {renderSlot('reason2', 'second reason', 'bg-blue-100 text-blue-950')}

              <span>.</span>
            </div>

            {/* Bottom Actions Tray */}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 pt-3.5 border-t-2 border-amber-100">
              <span className="text-xs font-black text-slate-500">
                {isSentenceComplete ? '✨ Sentence Complete! Try writing it yourself!' : '💡 Click cards above to fill slots.'}
              </span>

              {isSentenceComplete && !isBeeChallengeActive && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyParagraph}
                    className="px-4 py-2 bg-[#F59E0B] hover:bg-[#D97706] text-[#78350F] hover:text-white font-black text-xs rounded-xl border-2 border-[#78350F] shadow-[2px_2px_0px_#78350F] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_#78350F] cursor-pointer flex items-center gap-1.5"
                  >
                    <Copy className="w-4 h-4" />
                    <span>{isCopied ? 'Copied!' : 'Copy Paragraph'}</span>
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </main>

      {/* GRAND VICTORY CUP MODAL */}
      <AnimatePresence>
        {isVictoryModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 30 }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              className="bg-white border-4 border-[#78350F] rounded-3xl p-6 sm:p-8 shadow-[12px_12px_0px_#78350F] max-w-md w-full flex flex-col items-center text-center gap-5"
            >
              <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#F59E0B] to-[#FBBF24] border-4 border-[#78350F] shadow-[4px_4px_0px_#78350F] flex items-center justify-center animate-bounce">
                <Trophy className="w-10 h-10 text-[#78350F]" />
              </div>

              <div className="space-y-2">
                <h3 className="text-xl sm:text-2xl font-black text-[#78350F] tracking-tight uppercase">
                  EXCELLENT JOB! 🏆
                </h3>
                <p className="text-sm font-bold text-[#78350F]/80">
                  You successfully completed the Hobby Showcase Wall Writing Challenge! You are a brilliant English writer!
                </p>
              </div>

              <div className="w-full pt-2">
                <button
                  onClick={() => {
                    setIsVictoryModalOpen(false);
                    handleReset();
                  }}
                  className="w-full py-3 bg-[#F59E0B] hover:bg-[#D97706] text-[#78350F] hover:text-white font-black text-sm rounded-2xl border-3 border-[#78350F] shadow-[4px_4px_0px_#78350F] hover:shadow-[1px_1px_0px_#78350F] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-5 h-5" />
                  <span>Try Again / Replay</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
