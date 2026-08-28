import { motion } from 'motion/react';
import {
  BookOpen,
  GraduationCap,
  Sparkles,
  X,
  PencilLine,
  FileText,
  Lock,
} from 'lucide-react';
import { RegisteredModule, SubjectDefinition } from '../types';
import { playBubbleSound } from '../utils/audio';

interface ChinesePartsModalProps {
  module: RegisteredModule;
  subject: SubjectDefinition;
  onClose: () => void;
  onOpenPartA: () => void;
  onOpenPartB: () => void;
}

const CHINESE_PARTS = [
  {
    id: 'jia',
    label: '甲组',
    title: '基础学习',
    subtitle: '词语应用与语法基础',
    icon: GraduationCap,
    available: true,
    accent: 'from-rose-500 to-red-600',
    badge: '基础',
  },
  {
    id: 'yi',
    label: '乙组',
    title: '阅读理解',
    subtitle: '第11-15题 互动理解问答',
    icon: BookOpen,
    available: true,
    accent: 'from-amber-500 to-orange-600',
    badge: '热门互动',
  },
  {
    id: 'bing',
    label: '丙组',
    title: '供料作文',
    subtitle: 'Akan Datang',
    icon: PencilLine,
    available: false,
    accent: 'from-purple-500 to-indigo-600',
    badge: '即将推出',
  },
  {
    id: 'ding',
    label: '丁组',
    title: '命题作文',
    subtitle: 'Akan Datang',
    icon: FileText,
    available: false,
    accent: 'from-emerald-500 to-teal-600',
    badge: '即将推出',
  },
];

export default function ChinesePartsModal({
  module,
  subject,
  onClose,
  onOpenPartA,
  onOpenPartB,
}: ChinesePartsModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-md sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="chinese-parts-title"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 15 }}
        className="relative flex max-h-[94vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl border-4 border-rose-200 bg-[#FFF5F5] text-slate-800 shadow-2xl"
      >
        {/* Header */}
        <header className="flex items-center justify-between border-b border-rose-200 bg-rose-100/90 px-5 py-4 sm:px-6 sm:py-5">
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border-2 border-rose-300 bg-white shadow-xs">
              <GraduationCap className="h-7 w-7 text-rose-600" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-rose-500 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-white">
                  {module.name}
                </span>
                <span className="text-xs font-semibold text-rose-700">{subject.name} {subject.secondaryName}</span>
              </div>
              <h2
                id="chinese-parts-title"
                className="mt-0.5 font-['Fredoka',sans-serif] text-xl font-black text-rose-950 sm:text-2xl"
              >
                华语学习组别
              </h2>
            </div>
          </div>
          <button
            id="chinese-parts-close"
            type="button"
            onClick={() => {
              playBubbleSound();
              onClose();
            }}
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-white text-slate-700 shadow-xs transition-colors hover:bg-rose-200"
            aria-label="关闭华语组别选择"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        {/* Content */}
        <div className="overflow-y-auto p-5 sm:p-8">
          <div className="mb-6 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-rose-300 bg-rose-50 px-3 py-1 text-xs font-bold text-rose-800">
              <Sparkles className="h-3.5 w-3.5" /> 选择学习组别 (BAHAGIAN)
            </div>
            <p className="mt-2 text-xs font-medium text-rose-900/70 sm:text-sm">
              针对 UASA 考试要求设计，轻松掌握华语各项技能。
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {CHINESE_PARTS.map((part, index) => {
              const Icon = part.icon;
              const handleSelect = () => {
                if (!part.available) return;
                playBubbleSound();
                if (part.id === 'jia') {
                  onOpenPartA();
                } else if (part.id === 'yi') {
                  onOpenPartB();
                }
              };

              return (
                <motion.button
                  key={part.id}
                  id={`chinese-part-${part.id}-button`}
                  type="button"
                  initial={{ scale: 0.9, opacity: 0, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ type: 'spring', damping: 15, stiffness: 220, delay: index * 0.06 }}
                  whileHover={part.available ? { scale: 1.03, y: -4 } : undefined}
                  whileTap={part.available ? { scale: 0.97 } : undefined}
                  onClick={handleSelect}
                  disabled={!part.available}
                  className={`group relative flex flex-col items-center rounded-3xl border-2 p-5 text-center transition-all ${
                    part.available
                      ? 'cursor-pointer border-rose-200 bg-white shadow-md hover:border-rose-400 hover:shadow-xl'
                      : 'cursor-not-allowed border-slate-200 bg-slate-100/80 opacity-60'
                  }`}
                >
                  {/* Badge */}
                  <span
                    className={`absolute top-3 right-3 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      part.available
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {part.badge}
                  </span>

                  {/* Icon Circle */}
                  <div
                    className={`mb-3 flex h-16 w-16 items-center justify-center rounded-2xl text-white shadow-md transition-transform group-hover:scale-110 bg-gradient-to-tr ${part.accent}`}
                  >
                    <Icon className="h-8 w-8" />
                  </div>

                  <span className="text-lg font-black text-slate-800">{part.label}</span>
                  <span className="mt-0.5 text-sm font-bold text-rose-700">{part.title}</span>
                  <span className="mt-1 text-xs text-slate-500">{part.subtitle}</span>

                  <div className="mt-4 w-full">
                    {part.available ? (
                      <span className="inline-flex w-full items-center justify-center rounded-xl bg-rose-500 py-1.5 text-xs font-black text-white shadow-xs transition-colors group-hover:bg-rose-600">
                        进入作答
                      </span>
                    ) : (
                      <span className="inline-flex w-full items-center justify-center gap-1 rounded-xl bg-slate-200 py-1.5 text-xs font-bold text-slate-500">
                        <Lock className="h-3 w-3" /> 即将推出
                      </span>
                    )}
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
