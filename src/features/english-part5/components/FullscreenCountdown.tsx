import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Hourglass, Sparkles } from 'lucide-react';

interface FullscreenCountdownProps {
  initialSeconds?: number;
  onComplete: () => void;
}

export function FullscreenCountdown({
  initialSeconds = 5,
  onComplete,
}: FullscreenCountdownProps) {
  const [seconds, setSeconds] = useState(initialSeconds);

  useEffect(() => {
    if (seconds <= 0) {
      const completionTimer = window.setTimeout(onComplete, 350);
      return () => window.clearTimeout(completionTimer);
    }

    const timer = window.setTimeout(() => setSeconds((value) => value - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [onComplete, seconds]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.04 }}
      className="absolute inset-0 z-40 flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-[#FEF3C7] via-[#FFFBEB] to-[#FDE68A] px-6 text-center text-[#78350F]"
    >
      <motion.div
        animate={{ y: [-5, 5, -5] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-[#78350F] bg-white shadow-[5px_6px_0_#78350F]"
      >
        <Hourglass className="h-10 w-10 text-amber-500" />
      </motion.div>
      <p className="mt-7 text-sm font-black uppercase tracking-[0.22em] text-amber-700">English Part 5</p>
      <h1 className="mt-2 font-['Fredoka',sans-serif] text-3xl font-black sm:text-5xl">GET READY!</h1>
      <motion.div
        key={seconds}
        initial={{ scale: 0.45, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="mt-7 flex h-36 w-36 items-center justify-center rounded-full border-[10px] border-amber-200 bg-[#FBBF24] text-7xl font-black shadow-[0_18px_45px_rgba(217,119,6,0.35)] sm:h-44 sm:w-44 sm:text-8xl"
      >
        {Math.max(seconds, 0)}
      </motion.div>
      <div className="mt-7 flex items-center gap-2 rounded-full border border-amber-300 bg-white/75 px-4 py-2 text-sm font-bold">
        <Sparkles className="h-4 w-4 text-amber-500" />
        Your worksheet starts automatically
      </div>
    </motion.div>
  );
}
