import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, Clock, X, Wrench } from 'lucide-react';
import { useMaintenance } from '../context/MaintenanceContext';

export default function MaintenanceWarningBanner() {
  const { isPreMaintenanceWarning, timeUntilStartMs, config } = useMaintenance();
  const [dismissed, setDismissed] = useState(false);

  if (!isPreMaintenanceWarning || dismissed) return null;

  const minutesUntilStart = Math.max(1, Math.ceil(timeUntilStartMs / (60 * 1000)));
  const startTimeFormatted = config.scheduledStart
    ? new Date(config.scheduledStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '';

  return (
    <AnimatePresence>
      <motion.aside
        id="system-pre-maintenance-warning-banner"
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -40 }}
        className="fixed top-0 left-0 right-0 z-45 bg-gradient-to-r from-amber-500 via-amber-600 to-amber-500 text-white shadow-lg select-none px-4 py-2.5"
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 text-xs sm:text-sm font-bold">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/20 text-white animate-pulse">
              <AlertTriangle className="h-4 w-4" />
            </span>
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="font-black uppercase tracking-wider bg-black/20 px-2 py-0.5 rounded text-[11px]">
                Upcoming Maintenance
              </span>
              <span>
                System maintenance begins in{' '}
                <strong className="underline decoration-amber-200 decoration-2">
                  {minutesUntilStart} minute{minutesUntilStart > 1 ? 's' : ''}
                </strong>
                {startTimeFormatted ? ` (at ${startTimeFormatted})` : ''}.
              </span>
              <span className="hidden md:inline text-amber-100 font-normal">
                Please complete your current worksheet or practice session.
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="hidden sm:flex items-center gap-1 text-xs text-amber-100 bg-white/10 px-2.5 py-1 rounded-full">
              <Clock className="h-3 w-3" /> Auto-Save Active
            </span>
            <button
              id="dismiss-maintenance-warning-banner-btn"
              type="button"
              onClick={() => setDismissed(true)}
              className="rounded-full p-1 text-white/80 hover:bg-white/20 hover:text-white cursor-pointer transition"
              title="Dismiss warning"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </motion.aside>
    </AnimatePresence>
  );
}
