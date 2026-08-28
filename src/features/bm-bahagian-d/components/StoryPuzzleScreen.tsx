import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  RotateCcw,
  CheckCircle2,
  Volume2,
  BookOpen,
  Trophy,
  Sliders,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';
import { PuzzlePiece } from '../types';
import { sound } from '../utils/audio';
import { useApp } from '../context/AppContext';
import { formatImgurUrl } from '../utils/imgur';
import confetti from 'canvas-confetti';

interface StoryPuzzleScreenProps {
  onBack?: () => void;
  onRestart?: () => void;
}

function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  if (
    arr.length > 2 &&
    (arr[0] as unknown as PuzzlePiece).targetBox === 1 &&
    (arr[1] as unknown as PuzzlePiece).targetBox === 2
  ) {
    [arr[0], arr[1]] = [arr[1], arr[0]];
  }
  return arr;
}

export const StoryPuzzleScreen: React.FC<StoryPuzzleScreenProps> = () => {
  const {
    settings,
    activeBoxScreen,
    activeBoxScreenIndex,
    setActiveBoxScreenIndex,
    setIsAdminOpen,
    setAdminTab,
  } = useApp();

  const totalScreens = settings.boxScreens.length;
  const currentBoxCount = activeBoxScreen.boxCount;

  const activePieces = useMemo(() => {
    return activeBoxScreen.puzzlePieces.slice(0, currentBoxCount);
  }, [activeBoxScreen.puzzlePieces, currentBoxCount]);

  const targetBoxNumbers = useMemo(() => {
    return Array.from({ length: currentBoxCount }, (_, i) => i + 1);
  }, [currentBoxCount]);

  // Placed pieces state mapping boxNumber -> PuzzlePiece
  const [placedPieces, setPlacedPieces] = useState<{ [boxNum: number]: PuzzlePiece | null }>({});

  const [availablePieces, setAvailablePieces] = useState<PuzzlePiece[]>([]);
  const [selectedPieceId, setSelectedPieceId] = useState<number | null>(null);
  const [wrongBox, setWrongBox] = useState<number | null>(null);
  const [wrongMessage, setWrongMessage] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);

  // Fill in the blanks mode state
  const [fillInBlanksMode, setFillInBlanksMode] = useState(false);
  const [selectedBlanks, setSelectedBlanks] = useState<string[]>([]);
  const [userInputs, setUserInputs] = useState<{ [word: string]: string }>({});
  const [quizPassed, setQuizPassed] = useState(false);

  // Reset / Initialize pieces whenever activeBoxScreen changes
  const initializePieces = useCallback(() => {
    const initialPlaced: { [boxNum: number]: PuzzlePiece | null } = {};
    targetBoxNumbers.forEach((num) => {
      initialPlaced[num] = null;
    });
    setPlacedPieces(initialPlaced);

    if (settings.shufflePieces) {
      setAvailablePieces(shuffleArray(activePieces));
    } else {
      setAvailablePieces([...activePieces]);
    }

    setSelectedPieceId(null);
    setIsCompleted(false);
    setFillInBlanksMode(false);
    setSelectedBlanks([]);
    setUserInputs({});
    setQuizPassed(false);
    setWrongBox(null);
    setWrongMessage(null);
  }, [activePieces, settings.shufflePieces, targetBoxNumbers]);

  useEffect(() => {
    initializePieces();
  }, [initializePieces, activeBoxScreenIndex]);

  // Check if all boxes have the correct piece placed
  const allCorrect = useMemo(() => {
    return (
      targetBoxNumbers.length > 0 &&
      targetBoxNumbers.every((boxNum) => placedPieces[boxNum]?.targetBox === boxNum)
    );
  }, [targetBoxNumbers, placedPieces]);

  const hasStartedEssay = placedPieces[1]?.targetBox === 1;

  const startQuizDirectly = useCallback(() => {
    const availableWords =
      activeBoxScreen.candidateBlankWords && activeBoxScreen.candidateBlankWords.length > 0
        ? activeBoxScreen.candidateBlankWords
        : ['Ahad', 'sekolah', 'gotong-royong', 'membersihkan'];

    const shuffled = shuffleArray(availableWords);
    const count = Math.min(activeBoxScreen.blankWordsCount || 3, shuffled.length);
    setSelectedBlanks(shuffled.slice(0, count));
    setUserInputs({});
    setFillInBlanksMode(true);
  }, [activeBoxScreen.candidateBlankWords, activeBoxScreen.blankWordsCount]);

  // Triggered when all pictures are arranged correctly
  useEffect(() => {
    if (allCorrect && !isCompleted) {
      setIsCompleted(true);
      sound.playChime();
      if (settings.enableConfetti) {
        confetti({
          particleCount: 70,
          spread: 80,
          origin: { y: 0.55 },
          colors: ['#F59E0B', '#10B981', '#78350F', '#FDE68A', '#3B82F6'],
        });
      }

      if (settings.enableFillInBlanks) {
        // ALWAYS start the quiz directly without any overlays or waiting countdowns
        startQuizDirectly();
      }
    }
  }, [allCorrect, isCompleted, settings.enableConfetti, settings.enableFillInBlanks, startQuizDirectly]);

  // Check if student solved all fill-in-the-blanks
  useEffect(() => {
    if (!fillInBlanksMode || quizPassed || selectedBlanks.length === 0) return;

    const allBlanksCorrect = selectedBlanks.every((word) => {
      const inputVal = (userInputs[word] || '').trim().toLowerCase();
      return inputVal === word.toLowerCase();
    });

    if (allBlanksCorrect) {
      setQuizPassed(true);
      sound.playCelebration();
      if (settings.enableConfetti) {
        confetti({
          particleCount: 120,
          spread: 100,
          origin: { y: 0.5 },
          colors: ['#F59E0B', '#10B981', '#3B82F6', '#EC4899', '#78350F'],
        });
      }
      sound.speak('Tahniah! Anda telah berjaya menyelesaikan Cabaran Isi Tempat Kosong!');
    }
  }, [userInputs, fillInBlanksMode, selectedBlanks, quizPassed, settings.enableConfetti]);

  const handlePlacePiece = (piece: PuzzlePiece, targetBoxNumber: number) => {
    if (piece.targetBox === targetBoxNumber) {
      sound.playChime();
      sound.playBeeBuzz();
      setPlacedPieces((prev) => ({
        ...prev,
        [targetBoxNumber]: piece,
      }));
      setAvailablePieces((prev) => prev.filter((p) => p.id !== piece.id));
      setSelectedPieceId(null);
      setWrongBox(null);
      setWrongMessage(null);

      if (settings.enableTTSOnPlacement && piece.sentence) {
        sound.speak(piece.sentence);
      }
    } else {
      sound.playWrong();
      setWrongBox(targetBoxNumber);
      setWrongMessage(`Cuba lagi! Gambar ini bukan untuk Kotak ${targetBoxNumber}. 🐝`);
      setTimeout(() => {
        setWrongBox(null);
        setWrongMessage(null);
      }, 2500);
    }
  };

  const handleDragStart = (e: React.DragEvent, piece: PuzzlePiece) => {
    e.dataTransfer.setData('text/plain', piece.id.toString());
    sound.playPop();
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, boxNumber: number) => {
    e.preventDefault();
    const pieceIdStr = e.dataTransfer.getData('text/plain');
    const pieceId = parseInt(pieceIdStr, 10);
    const piece = availablePieces.find((p) => p.id === pieceId);
    if (piece) {
      handlePlacePiece(piece, boxNumber);
    }
  };

  const handleNextScreen = () => {
    if (activeBoxScreenIndex < totalScreens - 1) {
      setActiveBoxScreenIndex(activeBoxScreenIndex + 1);
      sound.playPop();
    }
  };

  const handlePreviousScreen = () => {
    if (activeBoxScreenIndex > 0) {
      setActiveBoxScreenIndex(activeBoxScreenIndex - 1);
      sound.playPop();
    }
  };

  const fullEssayText = useMemo(() => {
    return activePieces.map((p) => p.sentence).filter(Boolean).join(' ');
  }, [activePieces]);

  const rotations = ['rotate-2', '-rotate-1', 'rotate-3', '-rotate-2', 'rotate-1', '-rotate-3'];

  // Helper renderer for paragraph words with dynamic inline input blanks
  const renderParagraphWithBlanks = () => {
    if (!fullEssayText) return null;

    const words = fullEssayText.split(/(\s+|[,.!?])/);

    return (
      <span className="inline flex-wrap items-center gap-1.5 leading-loose font-bold text-amber-50 text-base sm:text-xl md:text-2xl">
        {words.map((word, idx) => {
          const cleanWord = word.replace(/[^a-zA-Z0-9-]/g, '');
          const isBlankTarget =
            cleanWord.length > 0 &&
            selectedBlanks.some((b) => b.toLowerCase() === cleanWord.toLowerCase());

          if (isBlankTarget) {
            const targetWord =
              selectedBlanks.find((b) => b.toLowerCase() === cleanWord.toLowerCase()) || cleanWord;
            const currentVal = userInputs[targetWord] || '';
            const isWordCorrect = currentVal.trim().toLowerCase() === targetWord.toLowerCase();

            return (
              <span key={`blank-${idx}`} className="inline-flex items-center mx-1 align-baseline">
                <input
                  type="text"
                  value={currentVal}
                  placeholder={`(${targetWord.length} huruf)`}
                  onChange={(e) => {
                    const val = e.target.value;
                    setUserInputs((prev) => ({
                      ...prev,
                      [targetWord]: val,
                    }));
                  }}
                  className={`px-2 py-0.5 rounded-lg border-3 font-mono font-black text-xs sm:text-lg focus:outline-none transition-all shadow-inner text-center ${
                    isWordCorrect
                      ? 'bg-[#10B981] text-white border-white shadow-[0_0_10px_#10B981]'
                      : 'bg-white text-[#78350F] border-[#F59E0B] focus:border-[#78350F] focus:ring-2 focus:ring-[#F59E0B]'
                  }`}
                  style={{ width: `${Math.max(90, targetWord.length * 16)}px` }}
                />
                {isWordCorrect && (
                  <span className="text-[#10B981] bg-white rounded-full p-0.5 ml-1 text-xs font-black shadow-xs">
                    ✓
                  </span>
                )}
              </span>
            );
          }

          return <span key={`tok-${idx}`}>{word}</span>;
        })}
      </span>
    );
  };

  const isLastScreen = activeBoxScreenIndex >= totalScreens - 1;

  return (
    <div className="flex-1 flex flex-col relative w-full max-w-6xl mx-auto px-4 gap-4">
      {/* 
        Inline Minimal Control Row
        Replaces the traditional heavy <header> to let the student easily navigate stages and restart,
        satisfying the instruction to remove standard headers and footers while retaining full functionality.
      */}
      <div className="flex flex-wrap items-center justify-between gap-3 mt-4 px-1 shrink-0">
        <div className="flex items-center gap-2">
          <span className="bg-[#FEF3C7] text-[#78350F] border-2 border-[#F59E0B] text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-xs">
            Aktiviti {activeBoxScreenIndex + 1}/{totalScreens}: {activeBoxScreen.title}
          </span>
          {totalScreens > 1 && (
            <div className="flex items-center gap-1">
              <button
                disabled={activeBoxScreenIndex === 0}
                onClick={handlePreviousScreen}
                className="p-1 rounded-lg border border-[#78350F] bg-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#FEF3C7] cursor-pointer"
                title="Aktiviti Sebelumnya"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <button
                disabled={isLastScreen}
                onClick={handleNextScreen}
                className="p-1 rounded-lg border border-[#78350F] bg-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#FEF3C7] cursor-pointer"
                title="Aktiviti Seterusnya"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setAdminTab('boxes');
              setIsAdminOpen(true);
              sound.playPop();
            }}
            className="px-3 py-1 bg-[#FEF3C7] hover:bg-[#FDE68A] rounded-lg border-2 border-[#78350F] text-[#78350F] font-black text-xs transition-all flex items-center gap-1 cursor-pointer shadow-xs"
          >
            <Sliders className="w-3.5 h-3.5 text-[#B45309]" />
            <span>Ubah Kotak [G]</span>
          </button>

          <button
            onClick={() => {
              sound.playPop();
              initializePieces();
            }}
            className="px-3 py-1 bg-white hover:bg-[#FEF3C7] rounded-lg border-2 border-[#78350F] text-[#78350F] font-bold text-xs transition-all flex items-center gap-1 cursor-pointer shadow-xs"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Mula Semula</span>
          </button>
        </div>
      </div>

      {/* Main 3-Part Content Area */}
      <main className="flex-1 flex flex-col gap-4 pb-6 w-full">
        {/* =========================================================================
            UPPER 1/3: DYNAMIC LINKED BOXES (1:1 Aspect Ratio)
            ========================================================================= */}
        <section className="bg-white/70 rounded-3xl border-4 border-dashed border-[#FCD34D] p-3 sm:p-5 shadow-inner flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="bg-[#F59E0B] text-[#78350F] font-black text-xs px-3 py-1 rounded-full uppercase tracking-wider border border-[#78350F]">
                {activeBoxScreen.title} ({currentBoxCount} Kotak)
              </span>
              <span className="text-xs sm:text-sm font-bold text-[#78350F] hidden md:inline">
                {targetBoxNumbers.map((n) => `Kotak ${n}`).join(' ➔ ')}
              </span>
            </div>
            {wrongMessage && (
              <span className="text-xs font-black text-rose-600 bg-rose-50 border-2 border-rose-300 px-3 py-1 rounded-full animate-pulse">
                {wrongMessage}
              </span>
            )}
          </div>

          {/* Dynamic Linked Boxes Row */}
          <div className="flex items-center justify-center gap-2 sm:gap-4 md:gap-6 flex-wrap sm:flex-nowrap">
            {targetBoxNumbers.map((boxNum, idx) => {
              const placedPiece = placedPieces[boxNum];
              const isWrong = wrongBox === boxNum;
              const isSelectedTarget = selectedPieceId !== null;

              return (
                <React.Fragment key={`box-${boxNum}`}>
                  {/* Drop Box Card with 1:1 Aspect Ratio */}
                  <div
                    id={`drop-target-box-${boxNum}`}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, boxNum)}
                    onClick={() => {
                      if (selectedPieceId !== null) {
                        const piece = availablePieces.find((p) => p.id === selectedPieceId);
                        if (piece) {
                          handlePlacePiece(piece, boxNum);
                        }
                      }
                    }}
                    className={`flex-1 min-w-[90px] max-w-[190px] aspect-square rounded-2xl border-4 flex flex-col items-center justify-center p-1.5 sm:p-2 text-center transition-all cursor-pointer select-none overflow-hidden relative ${
                      placedPiece
                        ? 'bg-white border-[#10B981] shadow-[5px_5px_0px_#A7F3D0]'
                        : isWrong
                        ? 'bg-rose-50 border-rose-400 animate-shake'
                        : isSelectedTarget
                        ? 'bg-[#FEF3C7] border-[#F59E0B] shadow-[5px_5px_0px_#F59E0B] scale-103 ring-2 ring-[#78350F]'
                        : 'bg-white border-[#F59E0B] shadow-[5px_5px_0px_#FDE68A] hover:scale-102'
                    }`}
                  >
                    {placedPiece ? (
                      <div className="relative w-full h-full rounded-xl overflow-hidden group bg-white flex items-center justify-center">
                        <img
                          src={formatImgurUrl(placedPiece.imageUrl)}
                          alt={placedPiece.altText}
                          className="w-full h-full object-contain"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute top-1.5 right-1.5 bg-[#10B981] text-white p-1 rounded-lg border border-white shadow-xs z-10">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </div>
                        <div className="absolute bottom-1 left-1 bg-[#78350F]/80 text-[#FDE68A] px-1.5 py-0.2 rounded text-[10px] font-black z-10">
                          #{boxNum}
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center w-full h-full">
                        <div className="w-8 h-8 sm:w-11 sm:h-11 mb-1 rounded-xl bg-[#FEF3C7] border-2 border-dashed border-[#F59E0B] flex items-center justify-center font-black text-sm sm:text-base text-[#B45309]">
                          {boxNum}
                        </div>
                        <span className="text-[#B45309] font-black text-[10px] sm:text-xs uppercase tracking-wider">
                          {isSelectedTarget ? 'Letak Sini' : `Kotak ${boxNum}`}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Connecting Chevron Arrow */}
                  {idx < targetBoxNumbers.length - 1 && (
                    <div className="shrink-0 hidden sm:flex items-center justify-center text-[#F59E0B]">
                      <svg
                        className="w-5 h-5 sm:w-7 sm:h-7"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M13.172 12l-4.95-4.95 1.414-1.414L16 12l-6.364 6.364-1.414-1.414z" />
                      </svg>
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </section>

        {/* =========================================================================
            MIDDLE PART: RANDOMLY DISTRIBUTED PUZZLE CARDS (1:1 ASPECT RATIO)
            ========================================================================= */}
        <section className="flex-1 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <span className="bg-[#78350F] text-white font-black text-xs px-3 py-1 rounded-full uppercase tracking-wider">
              Pilihan Gambar ({availablePieces.length} Baki)
            </span>
            <span className="text-xs font-bold text-[#78350F]">
              Klik atau seret gambar ke kotak yang betul di atas.
            </span>
          </div>

          {availablePieces.length > 0 ? (
            <div className="flex items-center justify-center gap-3 sm:gap-6 flex-wrap">
              {availablePieces.map((piece, index) => {
                const isSelected = selectedPieceId === piece.id;
                const rotClass = rotations[index % rotations.length];

                return (
                  <motion.div
                    key={piece.id}
                    layoutId={`piece-${piece.id}`}
                    draggable
                    onDragStart={(e) => handleDragStart(e as unknown as React.DragEvent, piece)}
                    onClick={() => {
                      sound.playPop();
                      setSelectedPieceId(isSelected ? null : piece.id);
                    }}
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    className={`w-32 sm:w-44 aspect-square bg-white rounded-2xl border-4 border-[#78350F] p-2 flex flex-col items-center justify-center transition-all cursor-grab active:cursor-grabbing select-none ${rotClass} ${
                      isSelected
                        ? 'shadow-[8px_8px_0px_#F59E0B] ring-4 ring-[#F59E0B] scale-105'
                        : 'shadow-[5px_5px_0px_#78350F] hover:shadow-[7px_7px_0px_#78350F]'
                    }`}
                  >
                    <div className="w-full h-full rounded-xl border-2 border-[#78350F] overflow-hidden relative shadow-inner bg-white flex items-center justify-center">
                      <img
                        src={formatImgurUrl(piece.imageUrl)}
                        alt={piece.altText}
                        className="w-full h-full object-contain pointer-events-none"
                        referrerPolicy="no-referrer"
                      />

                      {isSelected && (
                        <div className="absolute inset-0 bg-[#F59E0B]/30 border-2 border-[#F59E0B] rounded-xl flex items-center justify-center p-2">
                          <span className="bg-[#78350F] text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-sm animate-bounce text-center">
                            Dipilih! Klik Kotak
                          </span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="p-3 text-center bg-[#FEF3C7] rounded-2xl border-2 border-[#F59E0B]">
              <div className="flex items-center justify-center gap-2 text-[#065F46] font-black text-xs sm:text-sm">
                <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                <span>Semua gambar telah berjaya disusun mengikut urutan! 🐝🎉</span>
              </div>
            </div>
          )}
        </section>

        {/* =========================================================================
            BOTTOM 1/3: ESSAY REGION (REVEALED IN REAL-TIME FROM CONFIGURED PIECES)
            ========================================================================= */}
        <AnimatePresence>
          {(hasStartedEssay || allCorrect) && (
            <motion.section
              initial={{ opacity: 0, height: 0, y: 20 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: 20 }}
              transition={{ duration: 0.4 }}
              className="bg-[#78350F] rounded-2xl border-b-8 border-[#451A03] p-4 sm:p-6 flex flex-col relative overflow-hidden text-white shadow-xl"
            >
              {/* Region Header */}
              <div className="flex items-center justify-between mb-3 border-b border-[#F59E0B]/30 pb-2">
                <div className="flex items-center gap-2">
                  <span className="text-[#FDE68A] text-xs font-black uppercase tracking-widest flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-[#FDE68A]" />
                    {fillInBlanksMode
                      ? 'Cabaran Isi Tempat Kosong (Fill in the Blanks)'
                      : `Ruang Karangan (${activeBoxScreen.title})`}
                  </span>
                </div>

                {settings.enableListenEssayButton && (
                  <button
                    onClick={() => {
                      const textToRead = fillInBlanksMode
                        ? fullEssayText
                        : targetBoxNumbers
                            .map((n) => placedPieces[n]?.sentence)
                            .filter(Boolean)
                            .join(' ');
                      sound.speak(textToRead);
                    }}
                    className="flex items-center gap-1.5 bg-[#F59E0B] hover:bg-[#D97706] text-[#78350F] px-3 py-1 rounded-full text-xs font-black transition shadow-xs cursor-pointer"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Dengar Bacaan</span>
                  </button>
                )}
              </div>

              {/* Continuous Flowing Story Paragraph / Fill in Blanks Mode */}
              <div className="relative z-10 bg-[#451A03]/60 p-4 sm:p-5 rounded-2xl border-2 border-[#F59E0B]/30 shadow-inner">
                {fillInBlanksMode ? (
                  renderParagraphWithBlanks()
                ) : (
                  <p className="text-base sm:text-xl md:text-2xl font-bold leading-relaxed tracking-wide text-amber-50">
                    {targetBoxNumbers.map((boxNum) => {
                      const placed = placedPieces[boxNum];
                      if (!placed) return null;
                      return (
                        <motion.span
                          key={`sentence-box-${boxNum}`}
                          initial={{ opacity: 0, filter: 'blur(4px)' }}
                          animate={{ opacity: 1, filter: 'blur(0px)' }}
                          transition={{ duration: 0.4 }}
                          className="text-amber-100 mr-2 inline"
                        >
                          {placed.sentence}
                        </motion.span>
                      );
                    })}

                    {!allCorrect && (
                      <span className="text-[#FDE68A]/40 animate-pulse font-normal ml-1">
                        ...
                      </span>
                    )}
                  </p>
                )}
              </div>

              {/* Completion Action Bar */}
              {allCorrect && (quizPassed || !settings.enableFillInBlanks) && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="mt-4 pt-3 border-t border-[#F59E0B]/30 flex flex-wrap items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-[#FDE68A]">
                    <span>
                      {isLastScreen
                        ? 'LULUS DENGAN CEMERLANG! Anda telah menyelesaikan SEMUA aktiviti! 🐝🎉'
                        : `Tahniah! Anda telah melengkapkan ${activeBoxScreen.title}! 🐝🎉`}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {!isLastScreen && (
                      <button
                        onClick={handleNextScreen}
                        className="bg-[#10B981] hover:bg-[#059669] text-white px-5 py-2.5 rounded-xl text-xs sm:text-sm font-black border-2 border-white shadow-md flex items-center gap-2 transition cursor-pointer"
                      >
                        <span>Aktiviti Seterusnya (Aktiviti {activeBoxScreenIndex + 2})</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </motion.div>
              )}
            </motion.section>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};
