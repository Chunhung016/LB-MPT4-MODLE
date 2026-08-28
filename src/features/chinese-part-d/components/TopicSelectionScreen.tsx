import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, BookOpen, Sparkles, Volume2, VolumeX, HelpCircle, GraduationCap } from 'lucide-react';
import { sound } from '../utils/audio';

interface TopicSelectionScreenProps {
  onSelectTopic: (topicId: 'discovery' | 'success') => void;
  onExit: () => void;
}

export function TopicSelectionScreen({ onSelectTopic, onExit }: TopicSelectionScreenProps) {
  const [isMuted, setIsMuted] = React.useState(sound.isMuted);

  const toggleMute = () => {
    const nextMute = sound.toggleMute();
    setIsMuted(nextMute);
    if (!nextMute) {
      sound.playPop();
    }
  };

  const selectTopic = (topic: 'discovery' | 'success') => {
    sound.playPop();
    onSelectTopic(topic);
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col bg-gradient-to-b from-[#FFFDF5] via-[#FFFBEB] to-[#FEF3C7] overflow-hidden p-4 sm:p-6 md:p-8">
      {/* Background patterns */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.04]" style={{
        backgroundImage: 'radial-gradient(#78350F 2px, transparent 2px)',
        backgroundSize: '24px 24px'
      }} />

      {/* Top Header Row */}
      <header className="relative z-10 w-full max-w-5xl mx-auto flex items-center justify-between gap-4">
        <button
          onClick={() => {
            sound.playPop();
            onExit();
          }}
          className="flex cursor-pointer items-center gap-1.5 rounded-full border-2 border-[#78350F] bg-white px-3.5 py-2 text-xs font-black text-[#78350F] shadow-[2px_2px_0_rgba(120,53,15,1)] transition-transform active:translate-y-0.5 hover:bg-amber-50"
          aria-label="返回华语组别选择"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="font-['Fredoka',sans-serif]">返回华语组别</span>
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleMute}
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border-2 border-[#78350F] bg-white text-[#78350F] shadow-[2px_2px_0_rgba(120,53,15,1)] transition-transform active:translate-y-0.5 hover:bg-amber-50"
            aria-label="切换声音"
          >
            {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </button>
        </div>
      </header>

      {/* Center Mascot & Description */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center max-w-4xl mx-auto w-full mt-6 mb-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 rounded-full border-2 border-[#78350F] bg-amber-100 px-4 py-1.5 text-xs font-black text-[#78350F] shadow-sm mb-4"
        >
          <Sparkles className="h-4 w-4 text-amber-600 animate-spin" />
          <span>华语丁组 · 命题作文</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="font-['Fredoka',sans-serif] text-3xl sm:text-4xl md:text-5xl font-black text-[#78350F] tracking-wide max-w-2xl leading-tight"
        >
          创意作文挑战台 ✍️
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="mt-3 text-sm sm:text-base md:text-lg font-bold text-amber-800/80 max-w-xl"
        >
          点击下方五彩缤纷的气泡，开启属于你的华语丁组高分作文探秘之旅！
        </motion.p>

        {/* The Two Big Bouncy Bubbles requested */}
        <div className="mt-10 md:mt-14 w-full flex flex-col sm:flex-row items-center justify-center gap-8 md:gap-12 px-4">
          
          {/* Bubble 1: 一次新发现 */}
          <motion.button
            onClick={() => selectTopic('discovery')}
            initial={{ scale: 0, opacity: 0, y: 40 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ type: 'spring', damping: 12, stiffness: 180 }}
            whileHover={{ scale: 1.1, y: -8, rotate: -2 }}
            whileTap={{ scale: 0.95 }}
            className="group relative flex flex-col items-center justify-center w-60 h-60 rounded-full border-4 border-[#78350F] bg-gradient-to-tr from-cyan-200 via-sky-100 to-white shadow-[0_12px_24px_-8px_rgba(14,116,144,0.3),6px_6px_0_#78350F] cursor-pointer p-6"
          >
            {/* Glossy overlay effect */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-b from-white/40 via-transparent to-transparent opacity-80 pointer-events-none" />
            <div className="absolute top-4 left-6 w-12 h-6 bg-white/50 rounded-full blur-[2px] -rotate-12" />

            <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-cyan-300 bg-white shadow-md mb-3 group-hover:scale-110 transition-transform">
              <span className="text-3xl">🔍</span>
            </div>

            <h3 className="relative z-10 font-['Fredoka',sans-serif] text-2xl font-black text-cyan-900 tracking-wide">
              《一次新发现》
            </h3>

            <p className="relative z-10 mt-2 text-xs font-extrabold text-cyan-800/75 max-w-[180px] leading-relaxed">
              探索大自然或日常生活中的神奇秘密，发现新奇乐趣！
            </p>

            <div className="absolute bottom-4 right-4 animate-bounce">
              <span className="rounded-full bg-cyan-500 px-2.5 py-0.5 text-[9px] font-black text-white shadow-xs">
                进入挑战
              </span>
            </div>
          </motion.button>

          {/* Bubble 2: 我成功了 */}
          <motion.button
            onClick={() => selectTopic('success')}
            initial={{ scale: 0, opacity: 0, y: 40 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ type: 'spring', damping: 12, stiffness: 180, delay: 0.12 }}
            whileHover={{ scale: 1.1, y: -8, rotate: 2 }}
            whileTap={{ scale: 0.95 }}
            className="group relative flex flex-col items-center justify-center w-60 h-60 rounded-full border-4 border-[#78350F] bg-gradient-to-tr from-rose-200 via-rose-100 to-white shadow-[0_12px_24px_-8px_rgba(190,24,74,0.3),6px_6px_0_#78350F] cursor-pointer p-6"
          >
            {/* Glossy overlay effect */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-b from-white/40 via-transparent to-transparent opacity-80 pointer-events-none" />
            <div className="absolute top-4 left-6 w-12 h-6 bg-white/50 rounded-full blur-[2px] -rotate-12" />

            <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-rose-300 bg-white shadow-md mb-3 group-hover:scale-110 transition-transform">
              <span className="text-3xl">🏆</span>
            </div>

            <h3 className="relative z-10 font-['Fredoka',sans-serif] text-2xl font-black text-rose-950 tracking-wide">
              《我成功了》
            </h3>

            <p className="relative z-10 mt-2 text-xs font-extrabold text-rose-800/75 max-w-[180px] leading-relaxed">
              分享战胜困难、坚持不懈取得辉煌硕果的喜悦瞬间！
            </p>

            <div className="absolute bottom-4 right-4 animate-bounce">
              <span className="rounded-full bg-rose-500 px-2.5 py-0.5 text-[9px] font-black text-white shadow-xs">
                进入挑战
              </span>
            </div>
          </motion.button>

        </div>

        {/* Bottom Educational Tip Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-12 sm:mt-16 w-full max-w-xl bg-white/80 border-2 border-[#78350F] rounded-2xl p-4 flex items-start gap-3.5 text-left shadow-sm"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700 border-2 border-amber-300">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-sm font-black text-[#78350F]">小蜜蜂写作文法宝 🐝</h4>
            <p className="mt-1 text-xs font-bold text-amber-900/70 leading-relaxed">
              华语丁组（命题作文）要求围绕题目进行生动的叙事与抒情。写好一篇作文需要经历
              <strong> 审清题目 ➔ 构思提纲 ➔ 积累好词 ➔ 范文学习</strong> 的过程。让我们现在就开始闯关吧！
            </p>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
