import { FormEvent, useState } from 'react';
import { AnimatePresence } from 'motion/react';
import {
  Calendar,
  CheckCircle2,
  Eye,
  HeartHandshake,
  Lock,
  MessageSquare,
  Save,
  Smartphone,
  Unlock,
  X,
} from 'lucide-react';
import { useMaintenance } from '../context/MaintenanceContext';
import { SystemMaintenanceConfig } from '../types';
import MaintenanceAnnouncementScreen from './MaintenanceAnnouncementScreen';

export default function AdminMaintenanceTab() {
  const {
    config,
    saveConfig,
    enableImmediateMaintenance,
    disableMaintenance,
    scheduleMaintenance,
    isMaintenanceBlocking,
    remainingMs,
  } = useMaintenance();

  const [editForm, setEditForm] = useState<SystemMaintenanceConfig>({ ...config });
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');

  // Custom scheduling states
  const [customStart, setCustomStart] = useState<string>(() => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 5);
    return now.toISOString().slice(0, 16);
  });
  const [customEnd, setCustomEnd] = useState<string>(() => {
    const end = new Date();
    end.setHours(end.getHours() + 1);
    return end.toISOString().slice(0, 16);
  });

  const totalRemainingSeconds = Math.max(0, Math.floor(remainingMs / 1000));
  const remainingHours = Math.floor(totalRemainingSeconds / 3600);
  const remainingMinutes = Math.floor((totalRemainingSeconds % 3600) / 60);
  const remainingSeconds = totalRemainingSeconds % 60;

  const handleSaveForm = async (e?: FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);
    await saveConfig(editForm);
    setSaving(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleQuickImmediate = async (minutes: number) => {
    setSaving(true);
    await enableImmediateMaintenance(minutes);
    setEditForm((prev) => ({
      ...prev,
      isActive: true,
      scheduledStart: new Date().toISOString(),
      scheduledEnd: new Date(Date.now() + minutes * 60 * 1000).toISOString(),
    }));
    setSaving(false);
  };

  const handleExtend = async (addedMinutes: number) => {
    setSaving(true);
    const currentEnd = config.scheduledEnd ? new Date(config.scheduledEnd).getTime() : Date.now();
    const newEnd = new Date(Math.max(Date.now(), currentEnd) + addedMinutes * 60 * 1000);
    const nextConfig: SystemMaintenanceConfig = {
      ...config,
      isActive: true,
      scheduledEnd: newEnd.toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await saveConfig(nextConfig);
    setEditForm(nextConfig);
    setSaving(false);
  };

  const handleApplySchedule = async () => {
    const startIso = new Date(customStart).toISOString();
    const endIso = new Date(customEnd).toISOString();

    if (new Date(endIso).getTime() <= new Date(startIso).getTime()) {
      alert('Scheduled End Time must be later than Start Time.');
      return;
    }

    setSaving(true);
    await scheduleMaintenance(startIso, endIso, editForm);
    setEditForm((prev) => ({
      ...prev,
      isActive: true,
      scheduledStart: startIso,
      scheduledEnd: endIso,
    }));
    setSaving(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  return (
    <div id="admin-maintenance-tab-container" className="space-y-6">
      {/* 1. TOP STATUS & EMERGENCY CONTROLS BAR */}
      <section
        id="maintenance-master-status-card"
        className={`rounded-3xl border-3 p-6 shadow-xl transition backdrop-blur-md ${
          isMaintenanceBlocking
            ? 'border-rose-400 bg-gradient-to-r from-rose-50 via-white to-rose-50'
            : 'border-emerald-300 bg-gradient-to-r from-emerald-50 via-white to-emerald-50'
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Status Indicator */}
          <div className="flex items-center gap-3.5">
            <div
              className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl shadow-md ${
                isMaintenanceBlocking
                  ? 'bg-rose-500 text-white animate-pulse'
                  : 'bg-emerald-500 text-white'
              }`}
            >
              {isMaintenanceBlocking ? (
                <Lock className="h-7 w-7" />
              ) : (
                <Unlock className="h-7 w-7" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={`rounded-full px-3 py-0.5 text-xs font-black uppercase tracking-wider ${
                    isMaintenanceBlocking
                      ? 'bg-rose-100 text-rose-800 border border-rose-300'
                      : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  }`}
                >
                  {isMaintenanceBlocking
                    ? '🚨 SYSTEM LOCKOUT ACTIVE (NOTICE SCREEN DISPLAYED)'
                    : '🟢 NORMAL OPERATIONS (OPEN)'}
                </span>

                {isMaintenanceBlocking && (
                  <span className="font-mono text-xs font-bold text-rose-700 bg-rose-100/70 px-2 py-0.5 rounded">
                    Remaining: {remainingHours}h {remainingMinutes}m {remainingSeconds}s
                  </span>
                )}
              </div>

              <h2 className="font-['Fredoka',sans-serif] text-xl font-black text-slate-900 mt-1">
                {isMaintenanceBlocking
                  ? 'ACEBEE is locked for maintenance'
                  : 'ACEBEE learning modules and worksheets are online'}
              </h2>
              <p className="text-xs text-slate-500">
                {isMaintenanceBlocking
                  ? 'When the countdown ends or when you click "Stop Maintenance & Open App", the lock immediately lifts automatically.'
                  : 'You can trigger immediate emergency maintenance or schedule a planned maintenance window below.'}
              </p>
            </div>
          </div>

          {/* Master Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {isMaintenanceBlocking ? (
              <>
                <button
                  id="admin-stop-maintenance-btn"
                  type="button"
                  onClick={() => void disableMaintenance()}
                  disabled={saving}
                  className="flex cursor-pointer items-center gap-2 rounded-full bg-emerald-600 px-5 py-2.5 text-xs font-black text-white shadow-lg hover:bg-emerald-700 active:scale-95 transition"
                >
                  <Unlock className="h-4 w-4" /> Stop Maintenance & Open App
                </button>
                <div className="flex items-center gap-1 bg-white p-1 rounded-full border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-500 px-2">Extend:</span>
                  <button
                    type="button"
                    onClick={() => void handleExtend(15)}
                    className="rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-bold text-amber-900 hover:bg-amber-200 cursor-pointer"
                  >
                    +15m
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleExtend(30)}
                    className="rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-bold text-amber-900 hover:bg-amber-200 cursor-pointer"
                  >
                    +30m
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleExtend(60)}
                    className="rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-bold text-amber-900 hover:bg-amber-200 cursor-pointer"
                  >
                    +1h
                  </button>
                </div>
              </>
            ) : (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-slate-600">Quick Lock:</span>
                <button
                  id="quick-start-15m-btn"
                  type="button"
                  onClick={() => void handleQuickImmediate(15)}
                  disabled={saving}
                  className="rounded-full border-2 border-rose-300 bg-rose-50 px-3 py-1.5 text-xs font-black text-rose-800 hover:bg-rose-100 cursor-pointer shadow-xs"
                >
                  🚨 Lock 15 Mins
                </button>
                <button
                  id="quick-start-30m-btn"
                  type="button"
                  onClick={() => void handleQuickImmediate(30)}
                  disabled={saving}
                  className="rounded-full border-2 border-rose-300 bg-rose-50 px-3 py-1.5 text-xs font-black text-rose-800 hover:bg-rose-100 cursor-pointer shadow-xs"
                >
                  🚨 Lock 30 Mins
                </button>
                <button
                  id="quick-start-1h-btn"
                  type="button"
                  onClick={() => void handleQuickImmediate(60)}
                  disabled={saving}
                  className="rounded-full border-2 border-rose-300 bg-rose-50 px-3 py-1.5 text-xs font-black text-rose-800 hover:bg-rose-100 cursor-pointer shadow-xs"
                >
                  🚨 Lock 1 Hour
                </button>
              </div>
            )}

            <button
              id="admin-preview-maintenance-screen-btn"
              type="button"
              onClick={() => setPreviewOpen(true)}
              className="flex cursor-pointer items-center gap-1.5 rounded-full border-2 border-amber-300 bg-white px-4 py-2 text-xs font-bold text-amber-900 hover:bg-amber-50 shadow-xs"
            >
              <Eye className="h-4 w-4 text-amber-600" /> Preview Notice Screen
            </button>
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* 2. SCHEDULE & TIMING CONFIGURATION (4 COLS) */}
        <div className="space-y-6 lg:col-span-4">
          <div className="rounded-3xl border-2 border-amber-200 bg-white p-6 shadow-md">
            <div className="flex items-center gap-2 border-b border-amber-100 pb-3 mb-4">
              <Calendar className="h-5 w-5 text-amber-600" />
              <h3 className="font-['Fredoka',sans-serif] text-base font-black text-slate-800">
                Scheduled Lockout
              </h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-600 mb-1">
                  Start Time
                </label>
                <input
                  type="datetime-local"
                  value={customStart}
                  onChange={(e) => setCustomStart(e.target.value)}
                  className="w-full rounded-2xl border-2 border-amber-100 bg-amber-50/40 px-3 py-2 text-xs font-medium outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-slate-600 mb-1">
                  End Time (Auto-Reopen)
                </label>
                <input
                  type="datetime-local"
                  value={customEnd}
                  onChange={(e) => setCustomEnd(e.target.value)}
                  className="w-full rounded-2xl border-2 border-amber-100 bg-amber-50/40 px-3 py-2 text-xs font-medium outline-none focus:border-amber-400"
                />
              </div>

              <button
                id="apply-schedule-btn"
                type="button"
                onClick={handleApplySchedule}
                disabled={saving}
                className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-[#FBBF24] px-4 py-2.5 text-xs font-black text-[#78350F] shadow-md hover:bg-amber-400 active:scale-95 transition"
              >
                <Calendar className="h-4 w-4" /> Apply Schedule
              </button>
            </div>
          </div>
        </div>

        {/* 3. ANNOUNCEMENT & APOLOGY CONTENT EDITOR (8 COLS) */}
        <div className="space-y-6 lg:col-span-8">
          <form
            onSubmit={handleSaveForm}
            className="rounded-3xl border-2 border-amber-200 bg-white p-6 sm:p-7 shadow-md space-y-5"
          >
            <div className="flex items-center justify-between border-b border-amber-100 pb-3">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-amber-600" />
                <h3 className="font-['Fredoka',sans-serif] text-lg font-black text-slate-900">
                  Notice Screen Information
                </h3>
              </div>
              <span className="text-xs text-slate-400">Fits iPad & tablet screens</span>
            </div>

            {/* Announcement Title */}
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1">
                Headline / Title
              </label>
              <input
                type="text"
                value={editForm.title}
                onChange={(e) => setEditForm((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="Scheduled System Maintenance & Cloud Optimization"
                required
                className="w-full rounded-2xl border-2 border-amber-100 bg-amber-50/40 px-4 py-2.5 text-sm font-bold text-slate-800 outline-none focus:border-amber-400"
              />
            </div>

            {/* Main Message */}
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1">
                Main Explanation
              </label>
              <textarea
                rows={3}
                value={editForm.message}
                onChange={(e) => setEditForm((prev) => ({ ...prev, message: e.target.value }))}
                placeholder="The ACEBEE Learning Platform is currently undergoing scheduled server upgrades..."
                required
                className="w-full rounded-2xl border-2 border-amber-100 bg-amber-50/40 px-4 py-2.5 text-xs leading-relaxed text-slate-700 outline-none focus:border-amber-400"
              />
            </div>

            {/* Sincere Apology Card Settings */}
            <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-4 space-y-3">
              <div className="flex items-center gap-1.5">
                <HeartHandshake className="h-4 w-4 text-amber-600" />
                <label className="block text-xs font-black uppercase tracking-wider text-slate-700">
                  Apology Card Content
                </label>
              </div>

              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-slate-500 mb-1">
                  Card Header Title
                </label>
                <input
                  type="text"
                  value={editForm.apologyTitle || ''}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, apologyTitle: e.target.value }))}
                  placeholder="A Sincere Note from ACEBEE Team"
                  className="w-full rounded-xl border border-amber-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-800 outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-slate-500 mb-1">
                  Apology & Reassurance Note
                </label>
                <textarea
                  rows={2}
                  value={editForm.apologyNote}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, apologyNote: e.target.value }))}
                  placeholder="We sincerely apologize for the temporary interruption to your learning routine..."
                  className="w-full rounded-xl border border-amber-200 bg-white px-3 py-2 text-xs leading-relaxed text-slate-700 outline-none focus:border-amber-400"
                />
              </div>
            </div>

            {/* Bottom Status Note */}
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-700 mb-1">
                Bottom Status Note
              </label>
              <input
                type="text"
                value={editForm.statusNote || ''}
                onChange={(e) => setEditForm((prev) => ({ ...prev, statusNote: e.target.value }))}
                placeholder="Our technicians are working actively. System will be restored momentarily."
                className="w-full rounded-2xl border-2 border-amber-100 bg-amber-50/40 px-4 py-2 text-xs font-medium text-slate-700 outline-none focus:border-amber-400"
              />
            </div>

            {/* Save Buttons & Feedback */}
            <div className="flex items-center justify-between border-t border-amber-100 pt-4">
              {saveSuccess ? (
                <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 animate-in fade-in">
                  <CheckCircle2 className="h-4 w-4" /> Notice content saved successfully!
                </span>
              ) : (
                <span className="text-[11px] text-slate-400">
                  Updates sync instantly across all user devices.
                </span>
              )}

              <button
                id="admin-save-maintenance-content-btn"
                type="submit"
                disabled={saving}
                className="flex cursor-pointer items-center gap-2 rounded-full bg-amber-500 px-6 py-2.5 text-xs font-black text-white shadow-md hover:bg-amber-600 active:scale-95 transition disabled:opacity-60"
              >
                <Save className="h-4 w-4" /> {saving ? 'Saving...' : 'Save Notice Content'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* 4. MODAL: LIVE PREVIEW OF MAINTENANCE SCREEN */}
      <AnimatePresence>
        {previewOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
            <div className="flex h-[92vh] w-full max-w-4xl flex-col rounded-3xl border-2 border-amber-300 bg-slate-900 shadow-2xl overflow-hidden text-white">
              {/* Preview Controls Bar */}
              <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950 px-6 py-3">
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-amber-400" />
                  <span className="font-['Fredoka',sans-serif] text-sm font-black text-amber-300">
                    Live Maintenance Screen Simulator (iPad & Desktop)
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center rounded-full bg-slate-800 p-1 text-xs">
                    <button
                      type="button"
                      onClick={() => setPreviewDevice('desktop')}
                      className={`cursor-pointer rounded-full px-3 py-1 font-bold transition ${
                        previewDevice === 'desktop' ? 'bg-amber-500 text-slate-950' : 'text-slate-400'
                      }`}
                    >
                      iPad / Desktop
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewDevice('mobile')}
                      className={`cursor-pointer rounded-full px-3 py-1 font-bold transition ${
                        previewDevice === 'mobile' ? 'bg-amber-500 text-slate-950' : 'text-slate-400'
                      }`}
                    >
                      <Smartphone className="h-3.5 w-3.5 inline mr-1" /> Mobile
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => setPreviewOpen(false)}
                    className="rounded-full p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white cursor-pointer"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Simulated Screen Area */}
              <div className="flex-1 overflow-y-auto bg-slate-950 flex items-center justify-center p-4">
                <div
                  className={`w-full overflow-hidden transition-all shadow-2xl rounded-2xl ${
                    previewDevice === 'mobile'
                      ? 'max-w-sm h-[650px] border-4 border-slate-700 rounded-3xl'
                      : 'max-w-2xl'
                  }`}
                >
                  <MaintenanceAnnouncementScreen previewMode={true} />
                </div>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
