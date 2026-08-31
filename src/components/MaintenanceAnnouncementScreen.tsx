import { FormEvent, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  AlertTriangle,
  Clock,
  KeyRound,
  Lock,
  Phone,
  Mail,
  RefreshCw,
  ShieldAlert,
  Sparkles,
  CheckCircle2,
  HelpCircle,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import PeacefulBeeBackground from './PeacefulBeeBackground';
import { useMaintenance } from '../context/MaintenanceContext';

interface MaintenanceAnnouncementScreenProps {
  previewMode?: boolean;
}

export default function MaintenanceAnnouncementScreen({
  previewMode = false,
}: MaintenanceAnnouncementScreenProps) {
  const {
    config,
    remainingMs,
    verifyStaffBypass,
    refreshMaintenanceStatus,
    isMaintenanceBlocking,
  } = useMaintenance();

  const [checking, setChecking] = useState(false);
  const [checkMessage, setCheckMessage] = useState<string | null>(null);
  const [showBypassModal, setShowBypassModal] = useState(false);
  const [bypassCode, setBypassCode] = useState('');
  const [bypassError, setBypassError] = useState<string | null>(null);

  // Time calculations
  const totalSeconds = Math.max(0, Math.floor(remainingMs / 1000));
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  // Calculate percentage if start and end exist
  let progressPercentage = 0;
  if (config.scheduledStart && config.scheduledEnd) {
    const startMs = new Date(config.scheduledStart).getTime();
    const endMs = new Date(config.scheduledEnd).getTime();
    const totalMs = endMs - startMs;
    if (totalMs > 0) {
      const elapsed = Date.now() - startMs;
      progressPercentage = Math.min(100, Math.max(0, Math.round((elapsed / totalMs) * 100)));
    }
  }

  const handleCheckStatus = async () => {
    setChecking(true);
    setCheckMessage(null);
    await refreshMaintenanceStatus();
    setTimeout(() => {
      setChecking(false);
      if (!isMaintenanceBlocking) {
        setCheckMessage('System is online! Unlocking application...');
      } else {
        setCheckMessage('Maintenance is still in progress. Thank you for your patience!');
        setTimeout(() => setCheckMessage(null), 4000);
      }
    }, 800);
  };

  const handleBypassSubmit = (e: FormEvent) => {
    e.preventDefault();
    setBypassError(null);
    const success = verifyStaffBypass(bypassCode);
    if (success) {
      setShowBypassModal(false);
    } else {
      setBypassError('Invalid staff authorization passcode.');
    }
  };

  return (
    <div
      id="system-maintenance-announcement-page"
      className="fixed inset-0 z-50 flex min-h-screen w-full flex-col items-center justify-center overflow-y-auto bg-[#FFFBEB] px-4 py-8 text-[#78350F] select-none"
    >
      <PeacefulBeeBackground />

      <div className="relative z-10 mx-auto w-full max-w-3xl space-y-6">
        {/* Main Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="overflow-hidden rounded-[2.5rem] border-4 border-amber-300 bg-white/95 p-6 sm:p-10 shadow-2xl backdrop-blur-md"
        >
          {/* Top Status Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-amber-100 pb-5">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-4 w-4">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex h-4 w-4 rounded-full bg-amber-500"></span>
              </span>
              <span className="rounded-full bg-amber-100 px-3.5 py-1 font-['Fredoka',sans-serif] text-xs font-black uppercase tracking-wider text-amber-900">
                System Under Maintenance
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
              <Clock className="h-3.5 w-3.5 text-amber-600" />
              <span>
                Updated: {new Date(config.updatedAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>

          {/* Animated Mascot & Title Section */}
          <div className="mt-6 flex flex-col items-center text-center">
            <motion.div
              animate={{
                y: [0, -8, 0],
                rotate: [0, 2, -2, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="relative mb-4 flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-tr from-amber-400 via-amber-300 to-yellow-200 p-3 shadow-lg border-2 border-white"
            >
              {/* Working Bee Icon Illustration */}
              <span className="text-5xl select-none" role="img" aria-label="Bee working">
                🐝
              </span>
              <div className="absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-amber-600 text-white shadow-md">
                <AlertTriangle className="h-4 w-4" />
              </div>
            </motion.div>

            <h1
              id="maintenance-announcement-title"
              className="font-['Fredoka',sans-serif] text-2xl sm:text-3xl md:text-4xl font-black text-[#78350F] leading-tight max-w-xl"
            >
              {config.title || 'Scheduled System Maintenance'}
            </h1>

            <p className="mt-3 text-sm sm:text-base text-slate-600 max-w-xl leading-relaxed">
              {config.message}
            </p>
          </div>

          {/* Sincere Apology Card */}
          {config.apologyNote && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 rounded-2xl border-2 border-amber-200 bg-amber-50/70 p-4 sm:p-5 text-left"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-200/80 text-amber-800 font-black">
                  ❤️
                </div>
                <div>
                  <h3 className="font-['Fredoka',sans-serif] text-sm font-black text-amber-900">
                    A Sincere Note from Little Bee Team
                  </h3>
                  <p className="mt-1 text-xs sm:text-sm text-amber-900/80 leading-relaxed">
                    {config.apologyNote}
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Countdown Clock (if scheduledEnd exists) */}
          {config.scheduledEnd && totalSeconds > 0 ? (
            <div className="mt-7 rounded-3xl border-2 border-amber-200 bg-gradient-to-b from-amber-50/50 to-white p-5 text-center shadow-inner">
              <div className="flex items-center justify-center gap-1.5 text-xs font-black uppercase tracking-wider text-amber-700">
                <Clock className="h-4 w-4 text-amber-600 animate-pulse" />
                <span>Estimated Time Remaining</span>
              </div>

              <div className="mt-3 grid grid-cols-3 sm:grid-cols-4 gap-2.5 max-w-md mx-auto">
                {days > 0 && (
                  <div className="flex flex-col rounded-2xl border border-amber-200 bg-white p-3 shadow-xs">
                    <span className="font-mono font-black text-2xl sm:text-3xl text-amber-900">
                      {String(days).padStart(2, '0')}
                    </span>
                    <span className="text-[10px] font-bold uppercase text-slate-400">Days</span>
                  </div>
                )}
                <div className="flex flex-col rounded-2xl border border-amber-200 bg-white p-3 shadow-xs">
                  <span className="font-mono font-black text-2xl sm:text-3xl text-amber-900">
                    {String(hours).padStart(2, '0')}
                  </span>
                  <span className="text-[10px] font-bold uppercase text-slate-400">Hours</span>
                </div>
                <div className="flex flex-col rounded-2xl border border-amber-200 bg-white p-3 shadow-xs">
                  <span className="font-mono font-black text-2xl sm:text-3xl text-amber-900">
                    {String(minutes).padStart(2, '0')}
                  </span>
                  <span className="text-[10px] font-bold uppercase text-slate-400">Minutes</span>
                </div>
                <div className="flex flex-col rounded-2xl border border-amber-200 bg-white p-3 shadow-xs">
                  <span className="font-mono font-black text-2xl sm:text-3xl text-amber-600">
                    {String(seconds).padStart(2, '0')}
                  </span>
                  <span className="text-[10px] font-bold uppercase text-slate-400">Seconds</span>
                </div>
              </div>

              {progressPercentage > 0 && (
                <div className="mt-4 max-w-md mx-auto">
                  <div className="flex justify-between text-[11px] font-bold text-slate-500 mb-1">
                    <span>Upgrade Progress</span>
                    <span>{progressPercentage}%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-amber-100">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progressPercentage}%` }}
                      transition={{ duration: 1 }}
                      className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-500"
                    />
                  </div>
                </div>
              )}

              <p className="mt-3 text-[11px] text-slate-500">
                ✨ The app will automatically reopen and refresh the moment maintenance concludes.
              </p>
            </div>
          ) : (
            <div className="mt-7 rounded-2xl border border-amber-200 bg-amber-50/50 p-4 text-center">
              <p className="text-xs text-amber-800 font-semibold">
                Our technicians are working actively. System will be restored momentarily.
              </p>
            </div>
          )}

          {/* Affected Services Badges */}
          {config.affectedServices && config.affectedServices.length > 0 && (
            <div className="mt-6">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 text-center mb-2.5">
                Paused Modules & Services
              </h4>
              <div className="flex flex-wrap items-center justify-center gap-2">
                {config.affectedServices.map((service, idx) => (
                  <span
                    key={idx}
                    className="flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50/80 px-3 py-1 text-xs font-bold text-amber-900"
                  >
                    <Lock className="h-3 w-3 text-amber-600" />
                    {service}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Refresh / Check Button & Support */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              id="maintenance-refresh-status-btn"
              type="button"
              onClick={handleCheckStatus}
              disabled={checking}
              className="flex w-full sm:w-auto cursor-pointer items-center justify-center gap-2 rounded-full bg-[#FBBF24] px-6 py-3 font-['Fredoka',sans-serif] text-sm font-black text-[#78350F] shadow-md hover:bg-amber-400 active:scale-95 transition disabled:opacity-60"
            >
              <RefreshCw className={`h-4 w-4 ${checking ? 'animate-spin' : ''}`} />
              {checking ? 'Checking Status...' : 'Check Server Status'}
            </button>

            {previewMode && (
              <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-bold text-violet-800">
                [Admin Preview Mode]
              </span>
            )}
          </div>

          {checkMessage && (
            <motion.p
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 text-center text-xs font-bold text-amber-800"
            >
              {checkMessage}
            </motion.p>
          )}

          {/* Support & Contact Details */}
          {(config.contactInfo.phone || config.contactInfo.email) && (
            <div className="mt-8 border-t border-amber-100 pt-5 text-center text-xs text-slate-500">
              <p className="font-bold text-slate-700">Need urgent assistance?</p>
              <div className="mt-2 flex flex-wrap items-center justify-center gap-4 text-xs font-medium">
                {config.contactInfo.phone && (
                  <a
                    href={`tel:${config.contactInfo.phone}`}
                    className="flex items-center gap-1.5 text-amber-700 hover:underline"
                  >
                    <Phone className="h-3.5 w-3.5" />
                    {config.contactInfo.phone}
                  </a>
                )}
                {config.contactInfo.email && (
                  <a
                    href={`mailto:${config.contactInfo.email}`}
                    className="flex items-center gap-1.5 text-amber-700 hover:underline"
                  >
                    <Mail className="h-3.5 w-3.5" />
                    {config.contactInfo.email}
                  </a>
                )}
                {config.contactInfo.receptionNote && (
                  <span className="text-slate-400">· {config.contactInfo.receptionNote}</span>
                )}
              </div>
            </div>
          )}
        </motion.div>

        {/* Footer with Staff Bypass Access */}
        <div className="flex items-center justify-between px-4 text-xs text-slate-500">
          <p className="text-[11px] text-slate-400">
            Little Bee Learning Platform · System Engine vMPT4
          </p>

          <div className="flex items-center gap-3">
            <a
              href="/admin"
              className="font-bold text-amber-700 hover:text-amber-900 underline hover:no-underline cursor-pointer"
            >
              Staff Admin Portal
            </a>

            {config.allowStaffBypass && (
              <button
                id="maintenance-staff-bypass-btn"
                type="button"
                onClick={() => setShowBypassModal(true)}
                className="flex items-center gap-1 font-bold text-slate-500 hover:text-slate-700 cursor-pointer"
              >
                <KeyRound className="h-3 w-3" />
                Staff Bypass
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Staff Bypass Modal */}
      <AnimatePresence>
        {showBypassModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md rounded-3xl border-2 border-amber-200 bg-white p-6 shadow-2xl text-slate-800"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-800">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-['Fredoka',sans-serif] text-lg font-black text-slate-900">
                      Staff Emergency Bypass
                    </h3>
                    <p className="text-xs text-slate-500">
                      Authorized teachers & staff access during maintenance
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowBypassModal(false)}
                  className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleBypassSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-slate-600 mb-1">
                    Staff Passcode
                  </label>
                  <input
                    type="password"
                    value={bypassCode}
                    onChange={(e) => setBypassCode(e.target.value)}
                    placeholder="Enter staff bypass passcode..."
                    required
                    autoFocus
                    className="w-full rounded-2xl border-2 border-amber-200 bg-amber-50/40 px-4 py-3 text-sm font-mono outline-none focus:border-amber-400"
                  />
                  <p className="mt-1 text-[11px] text-slate-400">
                    Default staff passcode is <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-700">BEEADMIN2026</code>
                  </p>
                </div>

                {bypassError && (
                  <p className="rounded-xl bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700">
                    {bypassError}
                  </p>
                )}

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowBypassModal(false)}
                    className="rounded-full px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex cursor-pointer items-center gap-1.5 rounded-full bg-amber-500 px-5 py-2 text-xs font-black text-white hover:bg-amber-600 shadow-md"
                  >
                    <KeyRound className="h-3.5 w-3.5" /> Verify & Unlock
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
