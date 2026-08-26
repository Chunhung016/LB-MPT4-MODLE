import { useState, type MouseEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { playBubbleSound } from '../utils/audio';

interface PlayBubbleButtonProps {
  onPlay?: () => void;
}

export default function PlayBubbleButton({ onPlay }: PlayBubbleButtonProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);

  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    playBubbleSound();
    
    // Bubble ripple effect
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setRipples((prev) => [...prev.slice(-3), { id: Date.now(), x, y }]);

    setIsPlaying(true);
    setTimeout(() => setIsPlaying(false), 800);

    if (onPlay) {
      setTimeout(() => {
        onPlay();
      }, 300);
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center">
      {/* Floating subtle ambient bubble particles */}
      <motion.div
        className="absolute -top-5 -left-5 w-4 h-4 rounded-full bg-[#FDE68A] border border-white/60 shadow-xs pointer-events-none opacity-80"
        animate={{ y: [-4, 6, -4], scale: [0.95, 1.05, 0.95] }}
        transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute -bottom-4 -right-5 w-5 h-5 rounded-full bg-[#FEF3C7] border border-[#FDE68A] shadow-xs pointer-events-none opacity-90"
        animate={{ y: [4, -5, 4], scale: [1.05, 0.9, 1.05] }}
        transition={{ duration: 4.8, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
      />

      {/* Main Vibrant Palette Bubbly Button */}
      <motion.button
        id="play-bubble-button"
        onClick={handleClick}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="group relative cursor-pointer flex items-center justify-center w-36 h-36 sm:w-40 sm:h-40 bg-white border-[12px] border-[#FEF3C7] rounded-full shadow-[0_20px_50px_rgba(251,191,36,0.35)] transition-all duration-300 focus:outline-hidden focus-visible:ring-4 focus-visible:ring-[#FBBF24]"
        aria-label="Play Little Bee MPT4 Module"
      >
        {/* Inner subtle yellow highlight tint on hover */}
        <div className="absolute inset-0 bg-[#FBBF24] rounded-full scale-90 opacity-10 group-hover:scale-100 group-hover:opacity-20 transition-transform duration-300 pointer-events-none" />

        {/* Glossy top-left bubble reflection */}
        <div className="absolute top-2 left-3 w-10 h-5 rounded-full bg-gradient-to-b from-white/90 to-transparent rotate-[-25deg] pointer-events-none" />

        {/* Play Triangle with Vibrant Palette #78350F amber-900 color */}
        <motion.div
          animate={isPlaying ? { scale: [1, 1.15, 1] } : {}}
          transition={{ duration: 0.35 }}
          className="relative z-10 flex items-center justify-center ml-2 sm:ml-3"
        >
          <div className="w-0 h-0 border-t-[20px] sm:border-t-[25px] border-t-transparent border-l-[36px] sm:border-l-[45px] border-l-[#78350F] border-b-[20px] sm:border-b-[25px] border-b-transparent drop-shadow-xs" />
        </motion.div>

        {/* Tap Ripples */}
        <AnimatePresence>
          {ripples.map((ripple) => (
            <motion.span
              key={ripple.id}
              initial={{ scale: 0.2, opacity: 0.6 }}
              animate={{ scale: 2.2, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.75, ease: 'easeOut' }}
              className="absolute rounded-full bg-[#FBBF24]/40 pointer-events-none"
              style={{
                left: ripple.x - 20,
                top: ripple.y - 20,
                width: 40,
                height: 40,
              }}
            />
          ))}
        </AnimatePresence>
      </motion.button>

      {/* Gentle feedback state when active */}
      <AnimatePresence>
        {isPlaying && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="absolute -bottom-8 px-3 py-1 rounded-full bg-[#FEF3C7] border border-[#FDE68A] text-[#78350F] text-xs font-bold shadow-xs"
          >
            Starting Module...
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
