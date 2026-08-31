import { motion, AnimatePresence } from 'motion/react';
import {
  BookOpen,
  Check,
  Palette,
  Shield,
  Sparkles,
  Star,
  X,
  Zap,
} from 'lucide-react';
import { useMaintenance, ACEBEE_LOGO_URL } from '../context/MaintenanceContext';
import { PostMaintenanceChangelog, PostMaintenanceHighlight } from '../types';

interface PostMaintenanceModalProps {
  previewMode?: boolean;
  previewData?: PostMaintenanceChangelog;
  onClosePreview?: () => void;
}

const ICON_MAP = {
  zap: Zap,
  sparkles: Sparkles,
  shield: Shield,
  palette: Palette,
  star: Star,
  bookOpen: BookOpen,
  check: Check,
};

export default function PostMaintenanceModal({
  previewMode = false,
  previewData,
  onClosePreview,
}: PostMaintenanceModalProps) {
  const { config, showPostMaintenanceModal, dismissPostMaintenanceModal } = useMaintenance();

  const changelog = previewData || config.postMaintenanceChangelog;
  const isVisible = previewMode || showPostMaintenanceModal;

  if (!isVisible || !changelog || !changelog.enabled) {
    return null;
  }

  const handleDismiss = () => {
    if (previewMode && onClosePreview) {
      onClosePreview();
    } else {
      dismissPostMaintenanceModal();
    }
  };

  const logoSrc = config.logoUrl || ACEBEE_LOGO_URL;

  return (
    <AnimatePresence>
      <div
        id="post-maintenance-changelog-modal"
        role="dialog"
        aria-modal="true"
        className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-3.5 sm:p-6 backdrop-blur-sm select-none overflow-y-auto"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="relative my-auto w-full max-w-lg sm:max-w-xl rounded-[2.2rem] border-4 border-amber-300 bg-white p-5 sm:p-7 shadow-2xl text-slate-800"
        >
          {/* Close button (top right) */}
          <button
            type="button"
            onClick={handleDismiss}
            aria-label="Close"
            className="absolute top-4 right-4 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-amber-50 text-amber-800 hover:bg-amber-100 hover:text-amber-950 transition"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Header section with Logo & Tags */}
          <div className="flex flex-col items-center text-center">
            <div className="relative">
              <div className="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-b from-amber-300 via-amber-400 to-amber-500 p-2 shadow-md border-2 border-white">
                <img
                  src={logoSrc}
                  alt="ACEBEE"
                  referrerPolicy="no-referrer"
                  className="h-full w-full object-contain drop-shadow-xs"
                />
              </div>
              <span className="absolute -bottom-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500 text-white shadow-md border-2 border-white">
                <Sparkles className="h-3.5 w-3.5" />
              </span>
            </div>

            {/* Version & Restored Badge */}
            <div className="mt-3 flex items-center gap-2">
              {changelog.versionTag && (
                <span className="rounded-full bg-amber-100 px-3 py-0.5 text-[11px] font-black uppercase tracking-wider text-amber-900 border border-amber-200">
                  {changelog.versionTag}
                </span>
              )}
              <span className="rounded-full bg-emerald-100 px-3 py-0.5 text-[11px] font-black uppercase tracking-wider text-emerald-800 border border-emerald-200">
                🟢 System Restored
              </span>
            </div>

            {/* Headline */}
            <h2
              id="post-maintenance-modal-headline"
              className="mt-2.5 font-['Fredoka',sans-serif] text-xl sm:text-2xl font-black text-[#78350F] leading-tight"
            >
              {changelog.headline || 'Welcome Back! ACEBEE is Successfully Restored ✨'}
            </h2>

            {/* Subtitle */}
            <p className="mt-1 text-xs sm:text-sm text-slate-600 font-medium max-w-md leading-relaxed">
              {changelog.subtitle ||
                'Our scheduled cloud optimization is complete. Here is what has been tuned up for your learners:'}
            </p>
          </div>

          {/* Highlight Cards Grid */}
          <div className="mt-4 space-y-2.5 max-h-[40vh] overflow-y-auto pr-1">
            {changelog.highlights && changelog.highlights.length > 0 ? (
              changelog.highlights.map((item: PostMaintenanceHighlight) => {
                const IconComponent = ICON_MAP[item.icon] || Sparkles;
                return (
                  <div
                    key={item.id}
                    className="flex items-start gap-3 rounded-2xl border-2 border-amber-100 bg-[#FFFDF5] p-3 sm:p-3.5 text-left shadow-2xs hover:border-amber-200 transition"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-200 to-amber-300 text-amber-900 shadow-2xs">
                      <IconComponent className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-['Fredoka',sans-serif] text-xs sm:text-sm font-black text-slate-900">
                        {item.title}
                      </h4>
                      <p className="mt-0.5 text-[11px] sm:text-xs text-slate-600 leading-relaxed font-medium">
                        {item.description}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="rounded-2xl border border-amber-100 bg-amber-50/50 p-4 text-center text-xs text-slate-500">
                All cloud services are running normally with maximum speed and reliability.
              </div>
            )}
          </div>

          {/* Reassurance / Thank you note */}
          {changelog.thankYouNote && (
            <div className="mt-3.5 rounded-xl border border-amber-200/80 bg-amber-50/70 py-2 px-3 text-center">
              <p className="text-[11px] sm:text-xs font-bold text-amber-900">
                {changelog.thankYouNote}
              </p>
            </div>
          )}

          {/* Bottom Action Button */}
          <div className="mt-4 flex flex-col sm:flex-row items-center justify-center gap-2">
            <button
              id="dismiss-post-maintenance-btn"
              type="button"
              onClick={handleDismiss}
              className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 py-3 px-6 font-['Fredoka',sans-serif] text-sm sm:text-base font-black text-white shadow-lg hover:from-amber-500 hover:to-amber-500 active:scale-95 transition"
            >
              <span>Awesome, Let's Learn! 🚀</span>
            </button>
          </div>

          {previewMode && (
            <div className="mt-2 text-center">
              <span className="rounded-full bg-violet-100 px-3 py-0.5 text-[10px] font-bold text-violet-800">
                Admin Preview Mode (Won't affect real user dismissal state)
              </span>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
