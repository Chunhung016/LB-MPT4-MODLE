import { motion } from 'motion/react';
import { AlertTriangle, Clock } from 'lucide-react';
import PeacefulBeeBackground from './PeacefulBeeBackground';
import { useMaintenance, ACEBEE_LOGO_URL } from '../context/MaintenanceContext';

interface MaintenanceAnnouncementScreenProps {
  previewMode?: boolean;
}

export default function MaintenanceAnnouncementScreen({
  previewMode = false,
}: MaintenanceAnnouncementScreenProps) {
  const { config, remainingMs } = useMaintenance();

  const logoSrc = config.logoUrl || ACEBEE_LOGO_URL;

  // Format remaining time if scheduled
  const totalSeconds = Math.max(0, Math.floor(remainingMs / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return (
    <main
      id="system-maintenance-announcement-page"
      role="alert"
      aria-live="polite"
      className="fixed inset-0 z-50 flex min-h-screen w-full items-center justify-center bg-[#FFFDF5] p-4 sm:p-6 text-[#78350F] select-none overflow-hidden"
    >
      <PeacefulBeeBackground />

      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="relative z-10 mx-auto w-full max-w-xl sm:max-w-2xl rounded-[2.2rem] border-4 border-[#FCD34D] bg-white/95 p-6 sm:p-7 shadow-2xl backdrop-blur-md text-center"
      >
        {/* ACEBEE Logo with Maintenance Alert Badge */}
        <div className="flex justify-center">
          <div className="relative inline-block">
            <div className="flex h-18 w-18 sm:h-22 sm:w-22 items-center justify-center overflow-hidden rounded-3xl bg-gradient-to-b from-amber-300 via-amber-400 to-amber-500 p-2 shadow-md border-2 border-white">
              <img
                src={logoSrc}
                alt="ACEBEE"
                referrerPolicy="no-referrer"
                className="h-full w-full object-contain drop-shadow-sm"
              />
            </div>
            {/* Warning triangle badge at bottom-right corner */}
            <div className="absolute -bottom-1.5 -right-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-amber-600 text-white shadow-md border-2 border-white">
              <AlertTriangle className="h-3.5 w-3.5" />
            </div>
          </div>
        </div>

        {/* Title / Headline */}
        <h1
          id="maintenance-announcement-title"
          className="mt-3.5 font-['Fredoka',sans-serif] text-xl sm:text-2xl md:text-3xl font-black text-[#78350F] leading-tight"
        >
          {config.title || 'Scheduled System Maintenance & Cloud Optimization'}
        </h1>

        {/* Main Explanation */}
        <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed max-w-lg mx-auto font-medium">
          {config.message ||
            'The ACEBEE Learning Platform is currently undergoing scheduled server upgrades and database optimization to provide your children with a smoother, faster, and more engaging learning experience.'}
        </p>

        {/* Highly Visible Large Countdown Timer Block */}
        {totalSeconds > 0 && (
          <div className="mt-4 rounded-2xl border-2 border-amber-300 bg-gradient-to-r from-amber-100/90 via-amber-50 to-amber-100/90 p-3 sm:p-4 shadow-sm">
            <div className="flex items-center justify-center gap-1.5 text-[11px] sm:text-xs font-black uppercase tracking-wider text-amber-900 mb-2">
              <Clock className="h-4 w-4 text-amber-600 animate-spin" style={{ animationDuration: '8s' }} />
              <span>Estimated Reopening Countdown</span>
            </div>

            <div className="flex items-center justify-center gap-2 sm:gap-3">
              {hours > 0 && (
                <>
                  <div className="flex flex-col items-center">
                    <span className="flex h-12 w-14 sm:h-14 sm:w-16 items-center justify-center rounded-xl bg-gradient-to-b from-amber-400 to-amber-500 text-xl sm:text-2xl font-black text-white shadow-md border-2 border-amber-200 font-mono tracking-wider">
                      {String(hours).padStart(2, '0')}
                    </span>
                    <span className="mt-1 text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-amber-900">
                      Hours
                    </span>
                  </div>
                  <span className="text-xl sm:text-2xl font-black text-amber-600 self-start mt-2 sm:mt-3">:</span>
                </>
              )}

              <div className="flex flex-col items-center">
                <span className="flex h-12 w-14 sm:h-14 sm:w-16 items-center justify-center rounded-xl bg-gradient-to-b from-amber-400 to-amber-500 text-xl sm:text-2xl font-black text-white shadow-md border-2 border-amber-200 font-mono tracking-wider">
                  {String(minutes).padStart(2, '0')}
                </span>
                <span className="mt-1 text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-amber-900">
                  Minutes
                </span>
              </div>

              <span className="text-xl sm:text-2xl font-black text-amber-600 self-start mt-2 sm:mt-3">:</span>

              <div className="flex flex-col items-center">
                <span className="flex h-12 w-14 sm:h-14 sm:w-16 items-center justify-center rounded-xl bg-gradient-to-b from-amber-400 to-amber-500 text-xl sm:text-2xl font-black text-white shadow-md border-2 border-amber-200 font-mono tracking-wider">
                  {String(seconds).padStart(2, '0')}
                </span>
                <span className="mt-1 text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-amber-900">
                  Seconds
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Sincere Apology Note Card (Picture 2 match) */}
        {config.apologyNote && (
          <div className="mt-3.5 rounded-2xl border-2 border-amber-200/90 bg-[#FFFBEB] p-3.5 sm:p-4 text-left shadow-xs">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-amber-200/90 text-sm shadow-2xs">
                ❤️
              </div>
              <div className="flex-1">
                <h2 className="font-['Fredoka',sans-serif] text-xs sm:text-sm font-black text-[#78350F]">
                  {config.apologyTitle || 'A Sincere Note from ACEBEE Team'}
                </h2>
                <p className="mt-0.5 text-xs sm:text-sm text-amber-900/80 leading-relaxed font-medium">
                  {config.apologyNote}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Status Strip / Restoring Momentarily (Picture 2 match) */}
        <div className="mt-3 rounded-2xl border border-amber-200/80 bg-amber-50/60 py-2.5 px-4 text-center">
          <p className="text-xs sm:text-sm text-amber-900/90 font-semibold">
            {config.statusNote || 'Our technicians are working actively. System will be restored momentarily.'}
          </p>
        </div>

        {previewMode && (
          <div className="mt-2.5">
            <span className="rounded-full bg-violet-100 px-3 py-0.5 text-[11px] font-bold text-violet-800">
              Admin Live Preview Mode
            </span>
          </div>
        )}
      </motion.div>
    </main>
  );
}
