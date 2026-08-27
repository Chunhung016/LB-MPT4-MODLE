import React from 'react';
import { motion } from 'motion/react';
import {
  ArrowLeft,
  Volume2,
  VolumeX,
  Sparkles,
  BookMarked,
  Layers,
  Flame,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { sound } from '../utils/audio';
import { useApp } from '../context/AppContext';

interface ModeSelectionScreenProps {
  onBack: () => void;
  onSelectPractice: () => void;
  onSelectMistakeBook: () => void;
}

export const ModeSelectionScreen: React.FC<ModeSelectionScreenProps> = ({
  onBack,
  onSelectPractice,
  onSelectMistakeBook,
}) => {
  const { settings, updateSettings, mistakes } = useApp();

  const unmasteredMistakesCount = mistakes.filter((m) => !m.isMastered).length;
  const totalMistakesCount = mistakes.length;

  const handleToggleMute = () => {
    const isMuted = sound.toggleMute();
    updateSettings({ soundEnabled: !isMuted });
    if (!isMuted) {
      sound.playPop();
    }
  };

  const handlePracticeClick = () => {
    sound.playStart();
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch {
      // ignore
    }
    onSelectPractice();
  };

  const handleMistakeBookClick = () => {
    sound.playPop();
    onSelectMistakeBook();
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen select-none relative bg-[#FEF3C7] text-[#78350F] overflow-x-hidden">
      {/* SOFT HONEYCOMB PATTERN BACKGROUND */}
      <div
        className="absolute inset-0 pointer-events-none opacity-25 z-0"
        style={{
          backgroundImage: `
            linear-gradient(30deg, #FDE68A 12%, transparent 12.5%, transparent 87%, #FDE68A 87.5%, #FDE68A),
            linear-gradient(150deg, #FDE68A 12%, transparent 12.5%, transparent 87%, #FDE68A 87.5%, #FDE68A),
            linear-gradient(30deg, #FDE68A 12%, transparent 12.5%, transparent 87%, #FDE68A 87.5%, #FDE68A),
            linear-gradient(150deg, #FDE68A 12%, transparent 12.5%, transparent 87%, #FDE68A 87.5%, #FDE68A),
            linear-gradient(60deg, #FEF08A 25%, transparent 25.5%, transparent 75%, #FEF08A 75%, #FEF08A),
            linear-gradient(60deg, #FEF08A 25%, transparent 25.5%, transparent 75%, #FEF08A 75%, #FEF08A)
          `,
          backgroundSize: '80px 140px',
          backgroundPosition: '0 0, 0 0, 40px 70px, 40px 70px, 0 0, 40px 70px',
        }}
      />

      {/* Top Header Bar */}
      <header className="h-16 flex items-center justify-between px-4 sm:px-8 bg-white/85 backdrop-blur-md border-b-3 border-[#FDE047] z-30 shadow-xs relative">
        <div className="flex items-center gap-3">
          <button
            id="btn-mode-back"
            onClick={() => {
              sound.playPop();
              onBack();
            }}
            className="px-3.5 py-1.5 bg-[#FFFBEB] hover:bg-[#FEF3C7] rounded-full border-2 border-[#78350F] text-[#78350F] font-black text-xs sm:text-sm shadow-[1.5px_1.5px_0px_#78350F] transition-all flex items-center gap-1.5 cursor-pointer active:translate-y-0.5"
            title="Back to English Parts"
          >
            <ArrowLeft className="w-4 h-4 text-[#78350F]" />
            <span>English Parts</span>
          </button>

          <span className="text-base sm:text-lg font-black text-[#78350F] uppercase tracking-tight ml-1 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <span>SPELLING BEE</span>
          </span>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            id="btn-sound-toggle-mode"
            onClick={handleToggleMute}
            className="p-1.5 sm:p-2 bg-white rounded-full border-2 border-[#78350F] text-[#78350F] shadow-[1.5px_1.5px_0px_#78350F] transition-all hover:bg-[#FFFBEB] cursor-pointer active:scale-95"
            title={settings.soundEnabled ? 'Mute Audio' : 'Unmute Audio'}
          >
            {!settings.soundEnabled ? (
              <VolumeX className="w-4 h-4 text-slate-400" />
            ) : (
              <Volume2 className="w-4 h-4 text-amber-600" />
            )}
          </button>
        </div>
      </header>

      {/* Main Center Content: 2 Big Square Buttons */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-8 flex flex-col items-center justify-center z-10 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center mb-8 sm:mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-amber-100/90 rounded-full border-2 border-[#78350F] text-xs font-black text-[#78350F] shadow-xs mb-3">
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span>CHOOSE LEARNING MODE</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-[#78350F] tracking-tight uppercase drop-shadow-[2px_2px_0px_#F59E0B]">
            What Would You Like To Do?
          </h1>
          <p className="text-sm sm:text-base font-bold text-[#92400E] mt-2 max-w-md mx-auto">
            Practice spelling with 1-attempt challenge, or review unmastered words in your Mistake Book!
          </p>
        </motion.div>

        {/* 2 Square Buttons in the Middle */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-10 w-full max-w-3xl justify-items-center">
          {/* Button 1: Practice */}
          <motion.button
            id="btn-mode-practice"
            onClick={handlePracticeClick}
            whileHover={{ scale: 1.04, y: -6 }}
            whileTap={{ scale: 0.96, y: 2 }}
            className="w-full max-w-sm aspect-square bg-gradient-to-tr from-amber-400 via-yellow-300 to-amber-200 rounded-3xl border-4 sm:border-5 border-[#78350F] p-6 sm:p-8 shadow-[6px_8px_0px_#78350F] flex flex-col items-center justify-center text-center cursor-pointer transition-shadow hover:shadow-[8px_12px_0px_#78350F] relative overflow-hidden group"
          >
            {/* Top Glossy Highlight */}
            <div className="absolute top-2 left-6 right-6 h-8 bg-white/40 rounded-full blur-[1px] pointer-events-none" />

            <div className="absolute top-4 right-4 z-10">
              <div className="w-9 h-9 rounded-full bg-amber-500/20 border border-[#78350F]/20 flex items-center justify-center">
                <Flame className="w-5 h-5 text-[#78350F]" />
              </div>
            </div>

            {/* Big Center Visual */}
            <div className="relative flex flex-col items-center z-10">
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl bg-white border-4 border-[#78350F] flex items-center justify-center shadow-[4px_5px_0px_#78350F] group-hover:rotate-3 transition-transform">
                <Layers className="w-14 h-14 sm:w-16 sm:h-16 text-amber-600 fill-amber-100" />
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-[#78350F] uppercase mt-5 tracking-tight drop-shadow-xs">
                Practice
              </h2>
            </div>
          </motion.button>

          {/* Button 2: Mistake Book */}
          <motion.button
            id="btn-mode-mistake-book"
            onClick={handleMistakeBookClick}
            whileHover={{ scale: 1.04, y: -6 }}
            whileTap={{ scale: 0.96, y: 2 }}
            className="w-full max-w-sm aspect-square bg-gradient-to-tr from-rose-400 via-red-300 to-amber-100 rounded-3xl border-4 sm:border-5 border-[#78350F] p-6 sm:p-8 shadow-[6px_8px_0px_#78350F] flex flex-col items-center justify-center text-center cursor-pointer transition-shadow hover:shadow-[8px_12px_0px_#78350F] relative overflow-hidden group"
          >
            {/* Top Glossy Highlight */}
            <div className="absolute top-2 left-6 right-6 h-8 bg-white/40 rounded-full blur-[1px] pointer-events-none" />

            <div className="absolute top-4 right-4 z-10">
              {unmasteredMistakesCount > 0 ? (
                <span className="px-3 py-1 bg-red-600 text-white rounded-full text-xs font-black border-2 border-white animate-pulse shadow-xs">
                  {unmasteredMistakesCount}
                </span>
              ) : (
                <div className="w-9 h-9 rounded-full bg-rose-500/20 border border-[#78350F]/20 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-rose-800" />
                </div>
              )}
            </div>

            {/* Big Center Visual (Bag of Mistakes / Mistake Book) */}
            <div className="relative flex flex-col items-center z-10">
              <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-2xl bg-white border-4 border-[#78350F] flex items-center justify-center shadow-[4px_5px_0px_#78350F] group-hover:-rotate-3 transition-transform">
                <BookMarked className="w-14 h-14 sm:w-16 sm:h-16 text-rose-600 fill-rose-100" />
                {/* Bag indicator */}
                <div className="absolute -bottom-2.5 -right-2.5 w-10 h-10 bg-amber-400 rounded-full border-2 sm:border-3 border-[#78350F] flex items-center justify-center text-xl shadow-xs">
                  🎒
                </div>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-[#78350F] uppercase mt-5 tracking-tight drop-shadow-xs">
                Mistake Book
              </h2>
            </div>
          </motion.button>
        </div>
      </main>

      <div className="h-6" />
    </div>
  );
};
