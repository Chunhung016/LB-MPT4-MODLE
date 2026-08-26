import { motion } from 'motion/react';

export default function PeacefulBeeBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden select-none -z-10 bg-[#FFFBEB]">
      {/* Ambient Vibrant Palette glow orbs */}
      <div className="absolute top-10 left-10 w-44 h-44 bg-[#FDE68A] rounded-full blur-3xl opacity-60" />
      <div className="absolute bottom-20 right-20 w-64 h-64 bg-[#FDE68A] rounded-full blur-3xl opacity-50" />
      <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-[#FEF3C7] rounded-full blur-3xl opacity-70" />

      {/* Geometric circular accent rings from Vibrant Palette */}
      <div className="absolute top-1/2 left-1/4 w-20 h-20 border-4 border-[#FBBF24] rounded-full opacity-20" />
      <div className="absolute bottom-1/4 right-1/3 w-28 h-28 border-4 border-[#FBBF24] rounded-full opacity-20" />
      <div className="absolute top-1/4 right-1/6 w-14 h-14 border-4 border-[#FDE68A] rounded-full opacity-30" />

      {/* Floating gentle daisies */}
      {[
        { x: '8%', y: '18%', size: 18, delay: 0, duration: 6 },
        { x: '86%', y: '16%', size: 24, delay: 1.2, duration: 7.5 },
        { x: '78%', y: '80%', size: 20, delay: 2.4, duration: 8 },
        { x: '12%', y: '82%', size: 26, delay: 0.8, duration: 6.8 },
        { x: '90%', y: '48%', size: 14, delay: 1.8, duration: 9 },
        { x: '7%', y: '52%', size: 16, delay: 3, duration: 7.2 },
      ].map((item, idx) => (
        <motion.div
          key={idx}
          className="absolute"
          style={{ left: item.x, top: item.y }}
          animate={{
            y: ['-8px', '8px', '-8px'],
            rotate: [0, 6, -6, 0],
          }}
          transition={{
            duration: item.duration,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: item.delay,
          }}
        >
          <div 
            className="rounded-full bg-white shadow-xs flex items-center justify-center border border-[#FEF3C7]"
            style={{ width: item.size * 1.5, height: item.size * 1.5 }}
          >
            <div 
              className="rounded-full bg-[#FBBF24]"
              style={{ width: item.size * 0.6, height: item.size * 0.6 }}
            />
          </div>
        </motion.div>
      ))}

      {/* Cute Little Bee floating peacefully in top-right */}
      <motion.div
        className="absolute top-8 right-8 md:top-14 md:right-20"
        animate={{
          x: [0, 10, -6, 0],
          y: [0, -12, 6, 0],
          rotate: [-3, 5, -2, -3],
        }}
        transition={{
          duration: 5.5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        <div className="relative flex items-center">
          {/* Bee wings */}
          <motion.div 
            className="absolute -top-3 left-2 w-4 h-5 rounded-full bg-sky-200/80 border border-sky-300/60 rotate-[-25deg] origin-bottom shadow-xs"
            animate={{ scaleY: [0.85, 1.25, 0.85], scaleX: [1.1, 0.9, 1.1] }}
            transition={{ duration: 0.15, repeat: Infinity }}
          />
          <motion.div 
            className="absolute -top-3 left-4 w-4 h-5 rounded-full bg-sky-200/80 border border-sky-300/60 rotate-[25deg] origin-bottom shadow-xs"
            animate={{ scaleY: [1.25, 0.85, 1.25], scaleX: [0.9, 1.1, 0.9] }}
            transition={{ duration: 0.15, repeat: Infinity }}
          />

          {/* Bee body */}
          <div className="w-10 h-7 rounded-full bg-[#FBBF24] border-2 border-amber-600/30 flex items-center justify-center overflow-hidden shadow-md relative">
            <div className="w-1.5 h-full bg-[#78350F] mx-0.5" />
            <div className="w-1.5 h-full bg-[#78350F] mx-0.5" />
            
            <div className="absolute right-2 top-2 w-1.5 h-1.5 rounded-full bg-slate-900 ring-1 ring-white/60" />
            <div className="absolute right-1.5 bottom-1.5 w-2 h-1 rounded-full bg-rose-400/80" />
          </div>

          <div className="w-1 h-1 bg-[#78350F] rounded-l-full -ml-0.5" />

          <div className="absolute -left-10 top-4 flex space-x-1.5 opacity-40">
            <span className="w-1 h-1 rounded-full bg-[#FBBF24]" />
            <span className="w-1 h-1 rounded-full bg-[#FBBF24]" />
            <span className="w-1 h-1 rounded-full bg-[#FBBF24]" />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
