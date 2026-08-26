import { motion } from 'motion/react';
import { X, Play, BookOpen, Star, CheckCircle } from 'lucide-react';
import { RegisteredModule } from '../types';
import { playBubbleSound } from '../utils/audio';

interface ModuleLessonModalProps {
  module: RegisteredModule | null;
  onClose: () => void;
}

export default function ModuleLessonModal({ module, onClose }: ModuleLessonModalProps) {
  if (!module) return null;

  return (
    <div 
      id="module-lesson-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <motion.div
        id="module-lesson-modal"
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="w-full max-w-lg bg-[#FFFBEB] border-4 border-[#FEF3C7] rounded-3xl shadow-2xl overflow-hidden flex flex-col relative text-slate-800"
      >
        {/* Header */}
        <div className="px-6 py-5 bg-[#FEF3C7] flex items-center justify-between border-b border-amber-200">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#FBBF24] flex items-center justify-center text-[#78350F] shadow-sm">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-200 text-[#78350F]">
                Active Little Bee Module @2026
              </span>
              <h2 className="text-2xl font-bold text-[#78350F] font-['Fredoka',sans-serif]">
                {module.name}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/80 hover:bg-white text-slate-700 flex items-center justify-center transition-colors shadow-xs cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <div className="p-4 rounded-2xl bg-white border border-amber-200 space-y-2">
            <div className="text-xs font-bold uppercase text-[#78350F] font-['Fredoka',sans-serif]">
              Module Description & QR Registration
            </div>
            <p className="text-sm text-slate-700 leading-relaxed">
              {module.description || 'Welcome to this Little Bee learning journey. Designed specifically for child engagement, interactive voice responses, and joyful discovery.'}
            </p>
            <div className="pt-1 text-[11px] font-mono text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 inline-block">
              Code: {module.code}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3 rounded-2xl bg-[#FEF3C7]/60 border border-amber-200/80">
              <div className="text-xs text-amber-900 font-medium">Lessons</div>
              <div className="text-xl font-black text-[#78350F] font-['Fredoka',sans-serif]">
                {module.totalLessons || 12}
              </div>
            </div>
            <div className="p-3 rounded-2xl bg-[#FEF3C7]/60 border border-amber-200/80">
              <div className="text-xs text-amber-900 font-medium">Stars Earned</div>
              <div className="text-xl font-black text-amber-600 font-['Fredoka',sans-serif] flex items-center justify-center gap-1">
                <Star className="w-4 h-4 fill-current" /> 36
              </div>
            </div>
            <div className="p-3 rounded-2xl bg-[#FEF3C7]/60 border border-amber-200/80">
              <div className="text-xs text-amber-900 font-medium">Status</div>
              <div className="text-sm font-bold text-emerald-600 flex items-center justify-center gap-1 mt-1">
                <CheckCircle className="w-4 h-4" /> Ready
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              playBubbleSound();
              onClose();
            }}
            className="w-full py-3.5 rounded-full bg-[#FBBF24] hover:bg-amber-400 text-[#78350F] font-bold text-base font-['Fredoka',sans-serif] tracking-wide shadow-md transition-all active:scale-98 cursor-pointer flex items-center justify-center gap-2"
          >
            <Play className="w-5 h-5 fill-current" /> START {module.name.toUpperCase()} LESSON
          </button>
        </div>
      </motion.div>
    </div>
  );
}
