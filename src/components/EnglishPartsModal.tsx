import { motion } from 'motion/react';
import {
  BookOpen,
  Languages,
  LoaderCircle,
  LockKeyhole,
  PencilLine,
  RefreshCw,
  Sparkles,
  SpellCheck,
  X,
} from 'lucide-react';
import { RegisteredModule } from '../types';
import { playBubbleSound } from '../utils/audio';

interface EnglishPartsModalProps {
  module: RegisteredModule;
  onClose: () => void;
  onOpenPart3: () => void;
  onOpenPart4: () => void;
  onOpenPart5: () => void;
  onOpenSpellingBee: () => void;
  spellingBeeEnabled: boolean;
  activationCode: string | null;
  accessLoading: boolean;
  accessError: string | null;
  onRefreshAccess: () => Promise<void>;
}

const ENGLISH_PARTS = [
  { number: 3, icon: BookOpen, title: 'Comprehension', available: true },
  { number: 4, icon: PencilLine, title: 'Comprehension', available: true },
  { number: 5, icon: Languages, title: 'Spelling Worksheet', available: true },
  { number: 6, icon: Sparkles, title: 'Coming Soon', available: false },
];

export default function EnglishPartsModal({
  module,
  onClose,
  onOpenPart3,
  onOpenPart4,
  onOpenPart5,
  onOpenSpellingBee,
  spellingBeeEnabled,
  activationCode,
  accessLoading,
  accessError,
  onRefreshAccess,
}: EnglishPartsModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-md sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="english-parts-title"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 15 }}
        className="relative flex max-h-[94vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl border-4 border-[#FEF3C7] bg-[#FFFBEB] text-slate-800 shadow-2xl"
      >
        <header className="flex items-center justify-between border-b border-[#FDE68A] bg-[#FEF3C7] px-5 py-4 sm:px-6 sm:py-5">
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border-2 border-sky-200 bg-white shadow-xs">
              <Languages className="h-7 w-7 text-sky-600" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-[#FBBF24] px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-[#78350F]">
                  {module.name}
                </span>
                <span className="text-xs font-semibold text-sky-700">English</span>
              </div>
              <h2 id="english-parts-title" className="mt-0.5 font-['Fredoka',sans-serif] text-xl font-black text-[#78350F] sm:text-2xl">
                English Learning Parts
              </h2>
            </div>
          </div>
          <button onClick={onClose} className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-white text-slate-700 shadow-xs transition-colors hover:bg-amber-100" aria-label="Close English parts">
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="overflow-y-auto p-5 sm:p-8">
          <div className="mb-6 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-bold text-sky-700">
              <Sparkles className="h-3.5 w-3.5" /> CHOOSE A PART
            </div>
            <p className="mt-2 text-xs font-medium text-amber-900/70 sm:text-sm">More English adventures are on the way.</p>
          </div>

          <div className="flex flex-wrap items-start justify-center gap-x-4 gap-y-6 sm:gap-x-7 sm:gap-y-8">
            {ENGLISH_PARTS.map((part, index) => {
              const Icon = part.icon;
              const openPart = () => {
                if (!part.available) return;
                playBubbleSound();
                if (part.number === 3) onOpenPart3();
                if (part.number === 4) onOpenPart4();
                if (part.number === 5) onOpenPart5();
              };

              return (
                <motion.button
                  key={part.number}
                  id={`english-part-${part.number}-button`}
                  type="button"
                  initial={{ scale: 0, opacity: 0, y: 24 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  transition={{ type: 'spring', damping: 15, stiffness: 220, delay: index * 0.06 }}
                  whileHover={part.available ? { scale: 1.05, y: -5 } : undefined}
                  whileTap={part.available ? { scale: 0.95 } : undefined}
                  onClick={openPart}
                  disabled={!part.available}
                  className={`group flex w-[145px] flex-col items-center rounded-3xl border-2 p-3 text-center transition-colors sm:w-[175px] sm:p-4 ${
                    part.available
                      ? 'cursor-pointer border-sky-200 bg-white hover:border-sky-300 hover:bg-sky-50'
                      : 'cursor-not-allowed border-slate-200 bg-slate-100/70 opacity-70'
                  }`}
                  aria-label={`Part ${part.number}: ${part.title}`}
                >
                  <div className={`relative flex h-24 w-24 items-center justify-center rounded-full border-[8px] bg-white shadow-lg sm:h-28 sm:w-28 sm:border-[10px] ${part.available ? 'border-sky-100 shadow-[0_16px_36px_rgba(59,130,246,0.24)]' : 'border-slate-200'}`}>
                    <div className={`absolute inset-0 scale-90 rounded-full transition-transform group-hover:scale-100 ${part.available ? 'bg-sky-400/20' : 'bg-slate-300/20'}`} />
                    <div className="absolute left-2.5 top-2 h-3.5 w-7 -rotate-[28deg] rounded-full bg-gradient-to-b from-white to-transparent" />
                    <Icon className={`relative z-10 h-9 w-9 sm:h-11 sm:w-11 ${part.available ? 'text-sky-600' : 'text-slate-400'}`} />
                    {part.available ? (
                      <div className="absolute -right-3 -top-2 rounded-full border-2 border-white bg-emerald-500 px-2 py-0.5 text-[9px] font-black text-white shadow-sm">READY</div>
                    ) : (
                      <div className="absolute -right-1 -top-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-slate-400 text-white shadow-sm">
                        <LockKeyhole className="h-3.5 w-3.5" />
                      </div>
                    )}
                  </div>
                  <span className="mt-3 font-['Fredoka',sans-serif] text-base font-black tracking-wide text-[#78350F] sm:text-lg">PART {part.number}</span>
                  <span className={`mt-0.5 text-[10px] font-bold sm:text-xs ${part.available ? 'text-sky-700' : 'text-slate-500'}`}>{part.title}</span>
                </motion.button>
              );
            })}

            {spellingBeeEnabled ? (
              <motion.button
                key="spelling-bee"
                id="english-spelling-bee-button"
                type="button"
                initial={{ scale: 0, opacity: 0, y: 24 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                transition={{ type: 'spring', damping: 15, stiffness: 220, delay: 0.24 }}
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  playBubbleSound();
                  onOpenSpellingBee();
                }}
                className="group flex w-[145px] cursor-pointer flex-col items-center rounded-3xl border-2 border-amber-300 bg-white p-3 text-center transition-colors hover:bg-amber-50 sm:w-[175px] sm:p-4"
                aria-label="Open Spelling Bee"
              >
                <div className="relative flex h-24 w-24 items-center justify-center rounded-full border-[8px] border-amber-100 bg-white shadow-[0_16px_36px_rgba(245,158,11,0.32),inset_0_2px_8px_rgba(255,255,255,0.9)] sm:h-28 sm:w-28 sm:border-[10px]">
                  <div className="absolute inset-0 scale-90 rounded-full bg-amber-400/25 transition-transform group-hover:scale-100" />
                  <div className="absolute left-2.5 top-2 h-3.5 w-7 -rotate-[28deg] rounded-full bg-gradient-to-b from-white to-transparent" />
                  <SpellCheck className="relative z-10 h-9 w-9 text-amber-600 sm:h-11 sm:w-11" />
                  <div className="absolute -right-3 -top-2 rounded-full border-2 border-white bg-emerald-500 px-2 py-0.5 text-[9px] font-black text-white shadow-sm">READY</div>
                </div>
                <span className="mt-3 font-['Fredoka',sans-serif] text-base font-black tracking-wide text-[#78350F] sm:text-lg">SPELLING BEE</span>
                <span className="mt-0.5 text-[10px] font-bold text-amber-700 sm:text-xs">Practice & Mistake Book</span>
              </motion.button>
            ) : null}
          </div>

          <div className="mx-auto mt-7 flex max-w-lg flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-200 bg-white/80 px-4 py-3 text-xs shadow-xs">
            <div>
              <span className="font-bold text-amber-900/60">DEVICE ACCESS CODE</span>
              <p className="mt-0.5 font-mono text-base font-black tracking-[0.18em] text-[#78350F]">{accessLoading ? 'CHECKING…' : activationCode ?? 'UNAVAILABLE'}</p>
            </div>
            <button id="check-device-access-btn" onClick={() => void onRefreshAccess()} disabled={accessLoading} className="flex cursor-pointer items-center gap-1.5 rounded-full bg-amber-100 px-3 py-2 font-bold text-amber-900 hover:bg-amber-200 disabled:opacity-60">
              {accessLoading ? <LoaderCircle className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
              Check access
            </button>
            {accessError ? <p className="w-full font-semibold text-rose-600">{accessError}</p> : null}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
