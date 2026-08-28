import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles, BookOpen, ArrowRight, Star, Volume2, VolumeX, Settings, Award, CheckCircle2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { sound } from '../utils/audio';

// Cute Animated Honey Bee Mascot Icon
export const CuteBeeMascot: React.FC<{ className?: string }> = ({ className = 'w-16 h-16' }) => (
  <svg
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Wings */}
    <ellipse cx="22" cy="18" rx="12" ry="8" transform="rotate(-30 22 18)" fill="#BAE6FD" stroke="#0284C7" strokeWidth="2.5" opacity="0.9" />
    <ellipse cx="42" cy="18" rx="12" ry="8" transform="rotate(30 42 18)" fill="#BAE6FD" stroke="#0284C7" strokeWidth="2.5" opacity="0.9" />
    {/* Body */}
    <ellipse cx="32" cy="36" rx="16" ry="20" transform="rotate(90 32 36)" fill="#F59E0B" stroke="#78350F" strokeWidth="3" />
    {/* Stripes */}
    <path d="M26 21C28 20.4 30 20 32 20C34 20 36 20.4 38 21V51C36 51.6 34 52 32 52C30 52 28 51.6 26 51V21Z" fill="#78350F" />
    <path d="M15 30C17 27 20 24 23 23V49C20 48 17 45 15 42C13.6 39.6 13 37 13 36C13 35 13.6 32.4 15 30Z" fill="#78350F" />
    {/* Stinger */}
    <path d="M10 36L14 32V40L10 36Z" fill="#78350F" />
    {/* Cheeks */}
    <circle cx="43" cy="30" r="3" fill="#FCA5A5" opacity="0.7" />
    <circle cx="43" cy="42" r="3" fill="#FCA5A5" opacity="0.7" />
    {/* Eyes */}
    <circle cx="44" cy="32" r="2.8" fill="#78350F" />
    <circle cx="44" cy="40" r="2.8" fill="#78350F" />
    <circle cx="45" cy="31" r="0.9" fill="#FFFFFF" />
    <circle cx="45" cy="39" r="0.9" fill="#FFFFFF" />
    {/* Smile */}
    <path d="M48 34C49 35 49 37 48 38" stroke="#78350F" strokeWidth="2" strokeLinecap="round" />
    {/* Antennas */}
    <path d="M44 28C46 24 50 22 54 24" stroke="#78350F" strokeWidth="2.5" strokeLinecap="round" />
    <circle cx="54" cy="24" r="2.2" fill="#78350F" />
    <path d="M44 44C46 48 50 50 54 48" stroke="#78350F" strokeWidth="2.5" strokeLinecap="round" />
    <circle cx="54" cy="48" r="2.2" fill="#78350F" />
  </svg>
);

export const MainScreen: React.FC<{
  onStart: () => void;
}> = ({ onStart }) => {
  const { settings, setIsAdminOpen } = useApp();
  const [muted, setMuted] = useState(!settings.soundEnabled);
  const totalQuestions = settings.questions.length;
  const totalMarks = settings.questions.reduce((sum, q) => sum + q.marks, 0);

  const handleToggleMute = () => {
    const isMuted = sound.toggleMute();
    setMuted(isMuted);
    if (!isMuted) {
      sound.playPop();
    }
  };

  const handleStart = () => {
    sound.playPop();
    setTimeout(() => {
      sound.playBeeBuzz();
      sound.playStart();
    }, 120);
    onStart();
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-3 sm:p-4 relative max-w-3xl mx-auto w-full my-auto">
      {/* Top right home controls */}
      <div className="absolute top-2 right-2 sm:top-4 sm:right-4 flex items-center gap-2">
        <button
          id="btn-sound-toggle-main"
          onClick={handleToggleMute}
          className="p-2.5 rounded-full bg-white/90 hover:bg-amber-100/90 text-amber-800 backdrop-blur-md border-2 border-amber-300 shadow-sm hover:scale-105 active:scale-95 transition-all cursor-pointer"
          title={muted ? '开启声音' : '静音'}
        >
          {muted ? (
            <VolumeX className="w-4 h-4 sm:w-5 sm:h-5 text-amber-900/50" />
          ) : (
            <Volume2 className="w-4 h-4 sm:w-5 sm:h-5 text-amber-800" />
          )}
        </button>

        <button
          id="btn-admin-open-main"
          onClick={() => {
            sound.playPop();
            setIsAdminOpen(true);
          }}
          className="p-2.5 rounded-full bg-white/90 hover:bg-amber-100/90 text-amber-800 backdrop-blur-md border-2 border-amber-300 shadow-sm hover:scale-105 active:scale-95 transition-all cursor-pointer"
          title="设置与题目选项 [G]"
        >
          <Settings className="w-4 h-4 sm:w-5 sm:h-5 text-amber-800" />
        </button>
      </div>

      {/* Floating Animated Mascot Bee */}
      <motion.div
        animate={{
          y: [-4, 4, -4],
          rotate: [-2, 2, -2],
        }}
        transition={{
          repeat: Infinity,
          duration: 3.5,
          ease: 'easeInOut',
        }}
        className="mb-2 cursor-pointer shrink-0"
        onClick={() => {
          sound.playBeeBuzz();
          sound.playFairyDust();
          sound.speakChineseText('加油！一起来完成乙组阅读理解吧！');
        }}
      >
        <div className="relative">
          <CuteBeeMascot className="w-16 h-16 sm:w-20 sm:h-20 drop-shadow-md" />
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.6, 1, 0.6] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="absolute -top-1 -right-1 bg-amber-400 text-amber-950 p-1 rounded-full shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-950" />
          </motion.div>
        </div>
      </motion.div>

      {/* Main Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-lg w-full bg-white/95 backdrop-blur-xl border-2 border-amber-300 rounded-3xl p-4 sm:p-5 shadow-[0_8px_30px_rgba(217,119,6,0.15)] text-center relative overflow-hidden shrink-0"
      >
        {/* Glowing header stripe */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500" />

        {/* Section Badges */}
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-950 border border-amber-300 text-xs font-black tracking-wider mb-2 shadow-2xs">
          <BookOpen className="w-3.5 h-3.5 text-amber-700" />
          <span>华文试卷 · {settings.article.section} {settings.article.type}</span>
        </div>

        {/* Title */}
        <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-amber-950 tracking-tight mb-1.5">
          《{settings.article.title}》
        </h1>

        <p className="text-xs sm:text-sm text-amber-800 font-bold mb-3 max-w-md mx-auto leading-normal">
          {settings.article.instruction}
        </p>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="bg-amber-50/90 border border-amber-200 rounded-xl p-2 flex flex-col items-center">
            <span className="text-[10px] sm:text-xs font-bold text-amber-700 uppercase tracking-wide">题目数量</span>
            <span className="text-lg sm:text-xl font-black text-amber-950">{totalQuestions} 题（第11-15题）</span>
          </div>

          <div className="bg-amber-50/90 border border-amber-200 rounded-xl p-2 flex flex-col items-center">
            <span className="text-[10px] sm:text-xs font-bold text-amber-700 uppercase tracking-wide">满分分值</span>
            <span className="text-lg sm:text-xl font-black text-amber-950">{totalMarks} 分</span>
          </div>
        </div>

        {/* Instructions / Interactive features summary */}
        <div className="bg-amber-100/50 border border-amber-300 rounded-xl p-2.5 text-left mb-3.5 text-xs text-amber-950 flex items-start gap-2">
          <Star className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p className="font-black text-amber-950">互动特色（无需繁琐打字，适配iPad）：</p>
            <ul className="text-amber-900 leading-tight space-y-0.5 pl-0.5 text-[11px] sm:text-xs">
              <li className="flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                <span><b>词句积木答题：</b>点击或拖拽词句即可快速排列完整答卷。</span>
              </li>
              <li className="flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                <span><b>小蜜蜂仙子 🐝：</b>点击题目蜜蜂，仙子金粉直达文章段落与红笔批划！</span>
              </li>
              <li className="flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                <span><b>字号缩放 A-/A/A+：</b>专为iPad免滚动阅读与答题设计。</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Start Button */}
        <button
          id="btn-start-worksheet"
          onClick={handleStart}
          className="w-full py-2.5 px-5 bg-gradient-to-r from-amber-500 via-amber-600 to-amber-500 hover:from-amber-600 hover:to-amber-600 text-white font-black text-sm sm:text-base rounded-xl shadow-[0_4px_14px_rgba(217,119,6,0.3)] hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>开始作答乙组试题</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </motion.div>
    </div>
  );
};
