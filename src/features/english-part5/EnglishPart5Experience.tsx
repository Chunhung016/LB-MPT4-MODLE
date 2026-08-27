import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowLeft } from 'lucide-react';
import { FullscreenCountdown } from './components/FullscreenCountdown';
import { HoneycombBackground } from './components/HoneycombBackground';
import { Screen3 } from './components/Screen3';
import { AppProvider } from './context/AppContext';
import { sound } from './utils/audio';

interface EnglishPart5ExperienceProps {
  onExit: () => void;
}

function EnglishPart5Content({ onExit }: EnglishPart5ExperienceProps) {
  const [showCountdown, setShowCountdown] = useState(true);

  return (
    <HoneycombBackground>
      <button
        id="english-part5-exit"
        type="button"
        onClick={() => {
          sound.playPop();
          onExit();
        }}
        className="fixed left-3 top-3 z-[85] flex cursor-pointer items-center gap-1.5 rounded-full border-2 border-[#78350F] bg-white/95 px-3 py-2 text-xs font-black text-[#78350F] shadow-[2px_2px_0_#78350F] backdrop-blur-md transition-transform active:translate-y-0.5 sm:left-5 sm:top-5 sm:px-4 sm:text-sm"
        aria-label="Back to English parts"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>English Parts</span>
      </button>

      <div className="relative flex min-h-screen flex-1 flex-col overflow-hidden">
        <AnimatePresence mode="wait">
          {showCountdown ? (
            <FullscreenCountdown
              initialSeconds={5}
              onComplete={() => setShowCountdown(false)}
            />
          ) : (
            <motion.div
              key="practice"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="flex min-h-screen flex-1 flex-col"
            >
              <Screen3 onRestart={() => setShowCountdown(true)} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </HoneycombBackground>
  );
}

export function EnglishPart5Experience({ onExit }: EnglishPart5ExperienceProps) {
  return (
    <div className="fixed inset-0 z-[70] overflow-y-auto bg-[#FFFBEB]">
      <AppProvider>
        <EnglishPart5Content onExit={onExit} />
      </AppProvider>
    </div>
  );
}
