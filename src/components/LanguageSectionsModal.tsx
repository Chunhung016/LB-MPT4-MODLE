import { motion } from 'motion/react';
import {
  BookMarked,
  GraduationCap,
  LockKeyhole,
  PencilLine,
  Sparkles,
  X,
} from 'lucide-react';
import { RegisteredModule, SubjectDefinition } from '../types';
import { playBubbleSound } from '../utils/audio';

interface LanguageSectionsModalProps {
  module: RegisteredModule;
  subject: SubjectDefinition;
  onClose: () => void;
  onOpenFirstSection: () => void;
}

interface LanguageSection {
  id: string;
  label: string;
  title: string;
  available: boolean;
  icon: typeof BookMarked;
}

const BM_SECTIONS: LanguageSection[] = [
  { id: 'a', label: 'Bahagian A', title: 'Asas Bahasa', available: true, icon: BookMarked },
  { id: 'b', label: 'Bahagian B', title: 'Akan Datang', available: false, icon: PencilLine },
  { id: 'c', label: 'Bahagian C', title: 'Akan Datang', available: false, icon: Sparkles },
  { id: 'd', label: 'Bahagian D', title: 'Akan Datang', available: false, icon: BookMarked },
];

const CHINESE_SECTIONS: LanguageSection[] = [
  { id: 'jia', label: '甲组', title: '基础学习', available: true, icon: GraduationCap },
  { id: 'yi', label: '乙组', title: '即将推出', available: false, icon: PencilLine },
  { id: 'bing', label: '丙组', title: '即将推出', available: false, icon: Sparkles },
  { id: 'ding', label: '丁组', title: '即将推出', available: false, icon: GraduationCap },
];

export default function LanguageSectionsModal({
  module,
  subject,
  onClose,
  onOpenFirstSection,
}: LanguageSectionsModalProps) {
  const isBm = subject.id === 'bm';
  const sections = isBm ? BM_SECTIONS : CHINESE_SECTIONS;
  const accentClasses = isBm
    ? {
        border: 'border-emerald-200',
        hoverBorder: 'hover:border-emerald-300',
        hoverBackground: 'hover:bg-emerald-50',
        ring: 'border-emerald-100',
        icon: 'text-emerald-600',
        tint: 'bg-emerald-400/20',
        label: 'text-emerald-700',
      }
    : {
        border: 'border-rose-200',
        hoverBorder: 'hover:border-rose-300',
        hoverBackground: 'hover:bg-rose-50',
        ring: 'border-rose-100',
        icon: 'text-rose-600',
        tint: 'bg-rose-400/20',
        label: 'text-rose-700',
      };
  const HeaderIcon = isBm ? BookMarked : GraduationCap;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-md sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="language-sections-title"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 15 }}
        className="relative flex max-h-[94vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl border-4 border-[#FEF3C7] bg-[#FFFBEB] text-slate-800 shadow-2xl"
      >
        <header className="flex items-center justify-between border-b border-[#FDE68A] bg-[#FEF3C7] px-5 py-4 sm:px-6 sm:py-5">
          <div className="flex items-center gap-3.5">
            <div className={`flex h-12 w-12 items-center justify-center rounded-2xl border-2 bg-white shadow-xs ${accentClasses.border}`}>
              <HeaderIcon className={`h-7 w-7 ${accentClasses.icon}`} />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-[#FBBF24] px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-[#78350F]">
                  {module.name}
                </span>
                <span className={`text-xs font-semibold ${accentClasses.label}`}>
                  {subject.secondaryName}
                </span>
              </div>
              <h2 id="language-sections-title" className="mt-0.5 font-['Fredoka',sans-serif] text-xl font-black text-[#78350F] sm:text-2xl">
                {isBm ? 'Bahagian Bahasa Melayu' : '华语学习组别'}
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-white text-slate-700 shadow-xs transition-colors hover:bg-amber-100"
            aria-label={isBm ? 'Tutup bahagian Bahasa Melayu' : '关闭华语组别'}
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="overflow-y-auto p-5 sm:p-8">
          <div className="mb-6 text-center">
            <div className={`inline-flex items-center gap-2 rounded-full border bg-white px-3 py-1 text-xs font-bold ${accentClasses.border} ${accentClasses.label}`}>
              <Sparkles className="h-3.5 w-3.5" />
              {isBm ? 'PILIH BAHAGIAN' : '选择组别'}
            </div>
          </div>

          <div className="flex flex-wrap items-start justify-center gap-x-4 gap-y-6 sm:gap-x-7 sm:gap-y-8">
            {sections.map((section, index) => {
              const Icon = section.icon;

              return (
                <motion.button
                  key={section.id}
                  id={`${subject.id}-section-${section.id}-button`}
                  type="button"
                  initial={{ scale: 0, opacity: 0, y: 24 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  transition={{ type: 'spring', damping: 15, stiffness: 220, delay: index * 0.06 }}
                  whileHover={section.available ? { scale: 1.05, y: -5 } : undefined}
                  whileTap={section.available ? { scale: 0.95 } : undefined}
                  onClick={() => {
                    if (!section.available) return;
                    playBubbleSound();
                    onOpenFirstSection();
                  }}
                  disabled={!section.available}
                  className={`group flex w-[145px] flex-col items-center rounded-3xl border-2 p-3 text-center transition-colors sm:w-[175px] sm:p-4 ${
                    section.available
                      ? `cursor-pointer bg-white ${accentClasses.border} ${accentClasses.hoverBorder} ${accentClasses.hoverBackground}`
                      : 'cursor-not-allowed border-slate-200 bg-slate-100/70 opacity-70'
                  }`}
                  aria-label={`${section.label}: ${section.title}`}
                >
                  <div className={`relative flex h-24 w-24 items-center justify-center rounded-full border-[8px] bg-white shadow-lg sm:h-28 sm:w-28 sm:border-[10px] ${section.available ? `${accentClasses.ring} shadow-[0_16px_36px_rgba(120,113,108,0.22)]` : 'border-slate-200'}`}>
                    <div className={`absolute inset-0 scale-90 rounded-full transition-transform group-hover:scale-100 ${section.available ? accentClasses.tint : 'bg-slate-300/20'}`} />
                    <div className="absolute left-2.5 top-2 h-3.5 w-7 -rotate-[28deg] rounded-full bg-gradient-to-b from-white to-transparent" />
                    <Icon className={`relative z-10 h-9 w-9 sm:h-11 sm:w-11 ${section.available ? accentClasses.icon : 'text-slate-400'}`} />
                    {section.available ? (
                      <div className="absolute -right-3 -top-2 rounded-full border-2 border-white bg-emerald-500 px-2 py-0.5 text-[9px] font-black text-white shadow-sm">READY</div>
                    ) : (
                      <div className="absolute -right-1 -top-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-slate-400 text-white shadow-sm">
                        <LockKeyhole className="h-3.5 w-3.5" />
                      </div>
                    )}
                  </div>
                  <span className="mt-3 font-['Fredoka',sans-serif] text-base font-black tracking-wide text-[#78350F] sm:text-lg">
                    {section.label}
                  </span>
                  <span className={`mt-0.5 text-[10px] font-bold sm:text-xs ${section.available ? accentClasses.label : 'text-slate-500'}`}>
                    {section.title}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
