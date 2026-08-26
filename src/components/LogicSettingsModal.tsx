import { useState, useEffect, type FormEvent } from 'react';
import { motion } from 'motion/react';
import { 
  Sliders, 
  Sparkles, 
  Cpu, 
  RefreshCw, 
  Plus, 
  Trash2, 
  Check, 
  X, 
  Layers, 
  ShieldCheck, 
  Radio, 
  Save, 
  Download,
  AlertCircle,
  QrCode,
  Lock,
  Printer,
  Ban,
  RotateCcw
} from 'lucide-react';
import { LogicConfig, FeatureToggle, RegisteredModule } from '../types';
import PrintableQRCodeCard, { printDualModuleSheet } from './PrintableQRCodeCard';

interface LogicSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: LogicConfig;
  onSaveConfig: (updated: LogicConfig) => void;
}

export default function LogicSettingsModal({
  isOpen,
  onClose,
  config,
  onSaveConfig,
}: LogicSettingsModalProps) {
  const [localConfig, setLocalConfig] = useState<LogicConfig>(config);
  const [activeTab, setActiveTab] = useState<'modules' | 'print-qr' | 'features' | 'updates' | 'engine' | 'rules'>('modules');
  const [newFeatureName, setNewFeatureName] = useState('');
  const [newFeatureCategory, setNewFeatureCategory] = useState<FeatureToggle['category']>('experimental');
  const [newFeatureDesc, setNewFeatureDesc] = useState('');
  const [showSaveToast, setShowSaveToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('Logic Parameters Saved & Active!');

  // Sync state whenever modal is opened
  useEffect(() => {
    if (isOpen) {
      setLocalConfig(config);
    }
  }, [isOpen, config]);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setShowSaveToast(true);
    setTimeout(() => setShowSaveToast(false), 2200);
  };

  // Instant Revoke and auto-save
  const handleRevokeModule = (targetIdOrCode: string, moduleName: string) => {
    const updatedModules = (localConfig.registeredModules || []).filter(
      (m) => m.id !== targetIdOrCode && m.code !== targetIdOrCode
    );
    const updatedConfig: LogicConfig = {
      ...localConfig,
      registeredModules: updatedModules,
    };
    setLocalConfig(updatedConfig);
    onSaveConfig(updatedConfig);
    triggerToast(`Revoked ${moduleName}!`);
  };

  // Instant Revoke All
  const handleRevokeAllModules = () => {
    const updatedConfig: LogicConfig = {
      ...localConfig,
      registeredModules: [],
    };
    setLocalConfig(updatedConfig);
    onSaveConfig(updatedConfig);
    triggerToast('All modules revoked & reset!');
  };

  if (!isOpen) return null;

  const handleToggleFeature = (id: string) => {
    setLocalConfig((prev) => ({
      ...prev,
      featureToggles: prev.featureToggles.map((f) =>
        f.id === id ? { ...f, enabled: !f.enabled } : f
      ),
    }));
  };

  const handleAddFeature = (e: FormEvent) => {
    e.preventDefault();
    if (!newFeatureName.trim()) return;

    const newToggle: FeatureToggle = {
      id: `feat_${Date.now()}`,
      name: newFeatureName.trim(),
      category: newFeatureCategory,
      description: newFeatureDesc.trim() || 'Custom future module capability',
      enabled: true,
      targetVersion: 'MPT4-2026.x',
      logicRule: 'auto_evaluate_on_session_start',
    };

    setLocalConfig((prev) => ({
      ...prev,
      featureToggles: [newToggle, ...prev.featureToggles],
    }));

    setNewFeatureName('');
    setNewFeatureDesc('');
  };

  const handleDeleteFeature = (id: string) => {
    setLocalConfig((prev) => ({
      ...prev,
      featureToggles: prev.featureToggles.filter((f) => f.id !== id),
    }));
  };

  const handleSave = () => {
    onSaveConfig(localConfig);
    setShowSaveToast(true);
    setTimeout(() => setShowSaveToast(false), 2000);
  };

  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(localConfig, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `mpt4_logic_config_2026.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div 
      id="logic-settings-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200"
    >
      <motion.div
        id="logic-settings-container"
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="w-full max-w-4xl max-h-[90vh] bg-[#0F172A] border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-200 font-sans"
      >
        {/* Header */}
        <div className="px-6 py-4.5 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#FBBF24]/20 border border-[#FBBF24]/40 flex items-center justify-center text-[#FBBF24]">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-[#FBBF24] tracking-tight font-mono">
                  LOGIC SETTINGS :: MPT4_CORE_v2026
                </h2>
                <span className="px-2 py-0.5 rounded-md text-[10px] uppercase font-mono tracking-wider bg-slate-800 text-amber-300 border border-slate-700">
                  SECURE ACCESS
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Central configuration gateway for QR scanning, module controls, update channels & rule pipelines.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="logic-settings-close-btn"
              onClick={onClose}
              className="px-3 py-1 rounded-lg text-xs font-mono border border-slate-700 hover:bg-slate-800 text-slate-300 transition-colors cursor-pointer"
              title="Close console"
            >
              CLOSE CONSOLE
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 px-6 pt-3 pb-0 bg-[#0F172A] border-b border-slate-800 overflow-x-auto text-xs font-medium">
          <button
            id="tab-modules"
            onClick={() => setActiveTab('modules')}
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-t-lg border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'modules'
                ? 'border-[#FBBF24] text-[#FBBF24] bg-slate-800/70 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <QrCode className="w-4 h-4" />
            Modules & QR Control
          </button>

          <button
            id="tab-print-qr"
            onClick={() => setActiveTab('print-qr')}
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-t-lg border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'print-qr'
                ? 'border-[#FBBF24] text-[#FBBF24] bg-slate-800/70 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Printer className="w-4 h-4 text-[#FBBF24]" />
            Printable QR Codes (M1 & M2)
          </button>

          <button
            id="tab-features"
            onClick={() => setActiveTab('features')}
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-t-lg border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'features'
                ? 'border-[#FBBF24] text-[#FBBF24] bg-slate-800/70 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            Feature Flags ({localConfig.featureToggles.length})
          </button>

          <button
            id="tab-updates"
            onClick={() => setActiveTab('updates')}
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-t-lg border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'updates'
                ? 'border-[#FBBF24] text-[#FBBF24] bg-slate-800/70 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <RefreshCw className="w-4 h-4" />
            Update & Deployment
          </button>

          <button
            id="tab-engine"
            onClick={() => setActiveTab('engine')}
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-t-lg border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'engine'
                ? 'border-[#FBBF24] text-[#FBBF24] bg-slate-800/70 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Sliders className="w-4 h-4" />
            Engine Parameters
          </button>

          <button
            id="tab-rules"
            onClick={() => setActiveTab('rules')}
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-t-lg border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'rules'
                ? 'border-[#FBBF24] text-[#FBBF24] bg-slate-800/70 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Layers className="w-4 h-4" />
            Logic Rules (JSON)
          </button>
        </div>

        {/* Body Content */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6 text-sm text-slate-300">
          {/* TAB 0: MODULES & QR SCANNER CONTROL */}
          {activeTab === 'modules' && (
            <div className="space-y-6">
              {/* PRINTABLE QR CODES BANNER / SHORTCUT */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/20 via-slate-800/60 to-amber-500/10 border border-amber-500/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#FBBF24] flex items-center justify-center text-[#78350F] shadow-sm">
                    <Printer className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#FBBF24] font-mono">
                      OFFICIAL PRINTABLE QR CODES FOR PHYSICAL MODULES
                    </h3>
                    <p className="text-xs text-slate-300 mt-0.5">
                      Generate, download high-res PNG, or print physical QR stickers for Module 1 & Module 2.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    id="quick-print-dual-sheet-btn"
                    type="button"
                    onClick={() => printDualModuleSheet()}
                    className="w-full sm:w-auto px-4 py-2 rounded-xl bg-[#FBBF24] hover:bg-amber-400 text-[#78350F] font-bold text-xs font-['Fredoka',sans-serif] tracking-wide flex items-center justify-center gap-1.5 shadow-md cursor-pointer transition-transform active:scale-95"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>PRINT DUAL SHEET (A4)</span>
                  </button>
                  <button
                    id="jump-to-print-tab-btn"
                    type="button"
                    onClick={() => setActiveTab('print-qr')}
                    className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 text-xs font-semibold cursor-pointer"
                  >
                    View Cards
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* QR Scanner Admin Toggle */}
                <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700 flex items-center justify-between">
                  <div className="space-y-1 pr-4">
                    <div className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                      <QrCode className="w-4 h-4 text-[#FBBF24]" /> QR SCANNER FUNCTION
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Allow users to open and scan module QR codes on the 2nd screen
                    </div>
                  </div>
                  <button
                    id="admin-toggle-qr-scanner"
                    type="button"
                    onClick={() => setLocalConfig(prev => ({ ...prev, qrScannerEnabled: !prev.qrScannerEnabled }))}
                    className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-200 ${
                      localConfig.qrScannerEnabled ? 'bg-[#FBBF24]' : 'bg-slate-700'
                    }`}
                  >
                    <div className={`bg-slate-950 w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
                      localConfig.qrScannerEnabled ? 'translate-x-6' : 'translate-x-0'
                    }`} />
                  </button>
                </div>

                {/* Module Buttons Admin Toggle */}
                <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700 flex items-center justify-between">
                  <div className="space-y-1 pr-4">
                    <div className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                      <Sliders className="w-4 h-4 text-[#FBBF24]" /> MODULE BUTTONS ACTIVE
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Allow clicking registered bubbly buttons to open lessons
                    </div>
                  </div>
                  <button
                    id="admin-toggle-module-buttons"
                    type="button"
                    onClick={() => setLocalConfig(prev => ({ ...prev, modulesButtonEnabled: !prev.modulesButtonEnabled }))}
                    className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-200 ${
                      localConfig.modulesButtonEnabled ? 'bg-[#FBBF24]' : 'bg-slate-700'
                    }`}
                  >
                    <div className={`bg-slate-950 w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
                      localConfig.modulesButtonEnabled ? 'translate-x-6' : 'translate-x-0'
                    }`} />
                  </button>
                </div>
              </div>

              {/* Printable QR Code Cards Deck (Embedded in Modules tab) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#FBBF24] font-mono flex items-center gap-1.5">
                    <QrCode className="w-4 h-4" /> 2 SYSTEM-READABLE QR CODES (DOWNLOAD & PRINT)
                  </span>
                  <button
                    type="button"
                    onClick={() => printDualModuleSheet()}
                    className="text-xs text-amber-300 hover:text-amber-200 flex items-center gap-1 underline underline-offset-2 cursor-pointer font-medium"
                  >
                    <Printer className="w-3.5 h-3.5" /> Print 2-in-1 Sheet
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <PrintableQRCodeCard
                    moduleNumber={1}
                    moduleName="Module 1"
                    moduleSubtitle="Early Reading & Phonics Foundations @2026"
                    qrCodeText="Lb_2026_MPT4_M1_"
                    themeColor="#10B981"
                    themeBg="#064E3B"
                    themeBorder="#10B981"
                  />
                  <PrintableQRCodeCard
                    moduleNumber={2}
                    moduleName="Module 2"
                    moduleSubtitle="Numerical Adventures & Logic Thinking @2026"
                    qrCodeText="Lb_2026_MPT4_M2_"
                    themeColor="#F59E0B"
                    themeBg="#78350F"
                    themeBorder="#F59E0B"
                  />
                </div>
              </div>

              {/* Direct Module Release Command Deck (Admin One-Click Release) */}
              <div className="p-4 rounded-xl bg-slate-800/60 border border-amber-500/30 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#FBBF24]" />
                    <span className="text-xs font-bold uppercase tracking-wider text-[#FBBF24] font-mono">
                      ADMIN ONE-CLICK MODULE RELEASE DECK
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      id="admin-release-both-btn"
                      type="button"
                      onClick={() => {
                        const existing = localConfig.registeredModules || [];
                        const toAdd: RegisteredModule[] = [];
                        if (!existing.some(m => m.id === 'mpt4_m1' || m.code === 'Lb_2026_MPT4_M1_')) {
                          toAdd.push({
                            id: 'mpt4_m1',
                            code: 'Lb_2026_MPT4_M1_',
                            name: 'Module 1',
                            description: 'Little Bee Early Reading & Phonics Foundations @2026',
                            registeredAt: Date.now(),
                            enabled: true,
                            totalLessons: 4,
                          });
                        }
                        if (!existing.some(m => m.id === 'mpt4_m2' || m.code === 'Lb_2026_MPT4_M2_')) {
                          toAdd.push({
                            id: 'mpt4_m2',
                            code: 'Lb_2026_MPT4_M2_',
                            name: 'Module 2',
                            description: 'Little Bee Numerical Adventures & Logic Thinking @2026',
                            registeredAt: Date.now(),
                            enabled: true,
                            totalLessons: 4,
                          });
                        }
                        if (toAdd.length > 0) {
                          setLocalConfig(prev => ({
                            ...prev,
                            registeredModules: [...(prev.registeredModules || []), ...toAdd],
                          }));
                        }
                      }}
                      className="px-2.5 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-[11px] font-semibold border border-amber-500/40 transition-colors cursor-pointer"
                    >
                      Release All (1 & 2)
                    </button>
                    <button
                      id="admin-revoke-all-btn"
                      type="button"
                      onClick={() => handleRevokeAllModules()}
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-rose-950/60 text-slate-400 hover:text-rose-300 text-[11px] font-semibold border border-slate-700 hover:border-rose-800 transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <RotateCcw className="w-3 h-3 text-rose-400" />
                      <span>Revoke / Clear All</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* MODULE 1 RELEASE CARD */}
                  {(() => {
                    const isMod1Released = (localConfig.registeredModules || []).some(
                      m => m.id === 'mpt4_m1' || m.code === 'Lb_2026_MPT4_M1_'
                    );
                    const mod1Data = (localConfig.registeredModules || []).find(
                      m => m.id === 'mpt4_m1' || m.code === 'Lb_2026_MPT4_M1_'
                    );
                    const isMod1Active = mod1Data?.enabled !== false;

                    return (
                      <div 
                        id="admin-module-1-card"
                        className={`p-4 rounded-xl border transition-all ${
                          isMod1Released
                            ? 'bg-slate-900/90 border-emerald-500/50 shadow-xs'
                            : 'bg-slate-900/40 border-slate-700/80'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-2.5">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-white font-['Fredoka',sans-serif]">
                                MODULE 1
                              </span>
                              <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold tracking-wider ${
                                isMod1Released 
                                  ? isMod1Active ? 'bg-emerald-950 text-emerald-300 border border-emerald-700' : 'bg-amber-950 text-amber-300 border border-amber-700'
                                  : 'bg-slate-800 text-slate-400 border border-slate-700'
                              }`}>
                                {isMod1Released ? (isMod1Active ? 'LIVE & RELEASED' : 'RELEASED (PAUSED)') : 'UNRELEASED'}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 mt-1">
                              Early Reading & Phonics Foundations
                            </p>
                            <span className="text-[10px] font-mono text-amber-400/80">
                              QR: Lb_2026_MPT4_M1_
                            </span>
                          </div>
                        </div>

                        <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                          {!isMod1Released ? (
                            <button
                              id="release-module-1-btn"
                              type="button"
                              onClick={() => {
                                const newMod: RegisteredModule = {
                                  id: 'mpt4_m1',
                                  code: 'Lb_2026_MPT4_M1_',
                                  name: 'Module 1',
                                  description: 'Little Bee Early Reading & Phonics Foundations @2026',
                                  registeredAt: Date.now(),
                                  enabled: true,
                                  totalLessons: 4,
                                };
                                setLocalConfig(prev => ({
                                  ...prev,
                                  registeredModules: [...(prev.registeredModules || []), newMod],
                                }));
                              }}
                              className="w-full py-2 px-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold flex items-center justify-center gap-1.5 shadow-md transition-colors cursor-pointer"
                            >
                              <Sparkles className="w-3.5 h-3.5" /> RELEASE MODULE 1 BUTTON
                            </button>
                          ) : (
                            <div className="w-full flex items-center gap-2">
                              <button
                                id="toggle-module-1-active-btn"
                                type="button"
                                onClick={() => {
                                  setLocalConfig(prev => ({
                                    ...prev,
                                    registeredModules: (prev.registeredModules || []).map(m => 
                                      m.id === 'mpt4_m1' || m.code === 'Lb_2026_MPT4_M1_'
                                        ? { ...m, enabled: m.enabled === false ? true : false }
                                        : m
                                    ),
                                  }));
                                }}
                                className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                                  isMod1Active
                                    ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                                    : 'bg-emerald-950 text-emerald-300 border-emerald-800'
                                }`}
                              >
                                {isMod1Active ? 'Pause Visibility' : 'Unpause'}
                              </button>
                              <button
                                id="revoke-module-1-btn"
                                type="button"
                                onClick={() => handleRevokeModule('mpt4_m1', 'Module 1')}
                                className="py-1.5 px-2.5 rounded-lg bg-rose-950/60 hover:bg-rose-900 text-rose-300 text-xs font-semibold border border-rose-800 transition-colors cursor-pointer flex items-center gap-1"
                                title="Revoke release"
                              >
                                <Ban className="w-3 h-3 text-rose-400" />
                                <span>Revoke</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })()}

                  {/* MODULE 2 RELEASE CARD */}
                  {(() => {
                    const isMod2Released = (localConfig.registeredModules || []).some(
                      m => m.id === 'mpt4_m2' || m.code === 'Lb_2026_MPT4_M2_'
                    );
                    const mod2Data = (localConfig.registeredModules || []).find(
                      m => m.id === 'mpt4_m2' || m.code === 'Lb_2026_MPT4_M2_'
                    );
                    const isMod2Active = mod2Data?.enabled !== false;

                    return (
                      <div 
                        id="admin-module-2-card"
                        className={`p-4 rounded-xl border transition-all ${
                          isMod2Released
                            ? 'bg-slate-900/90 border-emerald-500/50 shadow-xs'
                            : 'bg-slate-900/40 border-slate-700/80'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-2.5">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-white font-['Fredoka',sans-serif]">
                                MODULE 2
                              </span>
                              <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold tracking-wider ${
                                isMod2Released 
                                  ? isMod2Active ? 'bg-emerald-950 text-emerald-300 border border-emerald-700' : 'bg-amber-950 text-amber-300 border border-amber-700'
                                  : 'bg-slate-800 text-slate-400 border border-slate-700'
                              }`}>
                                {isMod2Released ? (isMod2Active ? 'LIVE & RELEASED' : 'RELEASED (PAUSED)') : 'UNRELEASED'}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 mt-1">
                              Numerical Adventures & Counting
                            </p>
                            <span className="text-[10px] font-mono text-amber-400/80">
                              QR: Lb_2026_MPT4_M2_
                            </span>
                          </div>
                        </div>

                        <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                          {!isMod2Released ? (
                            <button
                              id="release-module-2-btn"
                              type="button"
                              onClick={() => {
                                const newMod: RegisteredModule = {
                                  id: 'mpt4_m2',
                                  code: 'Lb_2026_MPT4_M2_',
                                  name: 'Module 2',
                                  description: 'Little Bee Numerical Adventures & Logic Thinking @2026',
                                  registeredAt: Date.now(),
                                  enabled: true,
                                  totalLessons: 4,
                                };
                                setLocalConfig(prev => ({
                                  ...prev,
                                  registeredModules: [...(prev.registeredModules || []), newMod],
                                }));
                              }}
                              className="w-full py-2 px-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold flex items-center justify-center gap-1.5 shadow-md transition-colors cursor-pointer"
                            >
                              <Sparkles className="w-3.5 h-3.5" /> RELEASE MODULE 2 BUTTON
                            </button>
                          ) : (
                            <div className="w-full flex items-center gap-2">
                              <button
                                id="toggle-module-2-active-btn"
                                type="button"
                                onClick={() => {
                                  setLocalConfig(prev => ({
                                    ...prev,
                                    registeredModules: (prev.registeredModules || []).map(m => 
                                      m.id === 'mpt4_m2' || m.code === 'Lb_2026_MPT4_M2_'
                                        ? { ...m, enabled: m.enabled === false ? true : false }
                                        : m
                                    ),
                                  }));
                                }}
                                className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                                  isMod2Active
                                    ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                                    : 'bg-emerald-950 text-emerald-300 border-emerald-800'
                                }`}
                              >
                                {isMod2Active ? 'Pause Visibility' : 'Unpause'}
                              </button>
                              <button
                                id="revoke-module-2-btn"
                                type="button"
                                onClick={() => handleRevokeModule('mpt4_m2', 'Module 2')}
                                className="py-1.5 px-2.5 rounded-lg bg-rose-950/60 hover:bg-rose-900 text-rose-300 text-xs font-semibold border border-rose-800 transition-colors cursor-pointer flex items-center gap-1"
                                title="Revoke release"
                              >
                                <Ban className="w-3 h-3 text-rose-400" />
                                <span>Revoke</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* Registered Modules Manager */}
              <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-[#FBBF24] font-mono flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4" /> PERSISTENT SCANNED & REGISTERED MODULES
                    </span>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Modules registered via camera QR scan or admin release. Click <strong>Revoke</strong> to lock and revoke access immediately.
                    </p>
                  </div>
                  <span className="text-[11px] text-amber-400 font-mono font-semibold bg-slate-900 px-2 py-1 rounded border border-slate-800">
                    {localConfig.registeredModules?.length || 0} Registered
                  </span>
                </div>

                {(!localConfig.registeredModules || localConfig.registeredModules.length === 0) ? (
                  <div className="py-6 text-center text-xs text-slate-400 italic bg-slate-900/60 rounded-lg border border-slate-800">
                    No modules currently registered. Use the QR Scanner on the 2nd screen to scan "Lb_2026_MPT4_M1_" or "Lb_2026_MPT4_M2_".
                  </div>
                ) : (
                  <div className="space-y-2">
                    {localConfig.registeredModules.map((mod) => (
                      <div 
                        key={mod.id}
                        className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-3 hover:border-slate-700 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-300 font-bold text-xs font-mono">
                            {mod.id === 'mpt4_m1' ? 'M1' : mod.id === 'mpt4_m2' ? 'M2' : 'MOD'}
                          </div>
                          <div>
                            <div className="text-xs font-bold text-amber-300 flex items-center gap-2">
                              <span>{mod.name}</span>
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-800">
                                SCANNED & ACTIVE
                              </span>
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono mt-0.5 flex items-center gap-2">
                              <span>QR Code: <code className="text-amber-400/80">{mod.code}</code></span>
                              {mod.registeredAt && (
                                <span className="text-slate-500">
                                  • {new Date(mod.registeredAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <button
                          id={`revoke-registered-module-${mod.id}`}
                          type="button"
                          onClick={() => handleRevokeModule(mod.id, mod.name)}
                          className="px-3 py-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900 text-rose-300 text-xs font-semibold border border-rose-800 transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 shadow-xs"
                          title="Revoke and lock this module"
                        >
                          <Ban className="w-3.5 h-3.5 text-rose-400" />
                          <span>Revoke Module</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB: PRINTABLE QR CODES (DEDICATED FULL VIEW) */}
          {activeTab === 'print-qr' && (
            <div className="space-y-6">
              {/* Header explanation & Dual sheet print button */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-500/20 via-slate-900 to-slate-900 border border-amber-500/40 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-400 text-amber-950">
                        OFFICIAL PRINT WORKSHOP
                      </span>
                      <span className="text-xs font-mono text-amber-300">MPT4 @2026</span>
                    </div>
                    <h3 className="text-lg font-bold text-white font-['Fredoka',sans-serif] mt-1">
                      PRINTABLE QR CODES FOR MODULE BOOKS
                    </h3>
                    <p className="text-xs text-slate-300 max-w-xl mt-1">
                      These 2 QR codes are officially registered to be decoded by the Little Bee camera scanner. Download high-resolution PNG images for textbook publishing, or print ready-to-cut physical sticker cards directly.
                    </p>
                  </div>

                  <button
                    id="print-qr-dual-sheet-btn"
                    type="button"
                    onClick={() => printDualModuleSheet()}
                    className="px-5 py-3 rounded-xl bg-[#FBBF24] hover:bg-amber-400 text-[#78350F] font-black text-xs font-['Fredoka',sans-serif] tracking-wider flex items-center justify-center gap-2 shadow-lg hover:shadow-amber-500/20 transition-all cursor-pointer shrink-0 active:scale-95"
                  >
                    <Printer className="w-4 h-4" />
                    <span>PRINT DUAL SHEET (A4)</span>
                  </button>
                </div>

                <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center gap-4 text-xs text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>High-DPI 600px Output</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>High Optical Scanning Error Correction Level H</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Compatible with all Camera Resolutions</span>
                  </div>
                </div>
              </div>

              {/* 2 Printable QR Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <PrintableQRCodeCard
                  moduleNumber={1}
                  moduleName="Module 1"
                  moduleSubtitle="Early Reading & Phonics Foundations @2026"
                  qrCodeText="Lb_2026_MPT4_M1_"
                  themeColor="#10B981"
                  themeBg="#064E3B"
                  themeBorder="#10B981"
                />

                <PrintableQRCodeCard
                  moduleNumber={2}
                  moduleName="Module 2"
                  moduleSubtitle="Numerical Adventures & Logic Thinking @2026"
                  qrCodeText="Lb_2026_MPT4_M2_"
                  themeColor="#F59E0B"
                  themeBg="#78350F"
                  themeBorder="#F59E0B"
                />
              </div>

              {/* Instructions Guide */}
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-400 space-y-2">
                <div className="font-bold text-slate-200 uppercase font-mono tracking-wider text-[11px] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#FBBF24]" /> HOW TO USE ON PHYSICAL LESSON BOOKS:
                </div>
                <ol className="list-decimal list-inside space-y-1.5 pl-1 leading-relaxed text-slate-300">
                  <li>Click <strong>Download PNG</strong> to save high-resolution QR image files for your graphic designer or print shop.</li>
                  <li>Or click <strong>Print Card</strong> / <strong>Print Dual Sheet</strong> to print directly on your office or home printer.</li>
                  <li>Paste or print the QR code on the cover or page 1 of the respective physical Little Bee module book.</li>
                  <li>When children open the app and tap the camera button on the 2nd screen, holding the book in front of the camera will instantly register and unlock the 5 subjects for that module.</li>
                </ol>
              </div>
            </div>
          )}

          {/* TAB 1: FEATURES */}
          {activeTab === 'features' && (
            <div className="space-y-6">
              {/* Add New Feature Form */}
              <form onSubmit={handleAddFeature} className="p-4 rounded-xl bg-slate-800/50 border border-slate-700 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-amber-400 font-mono flex items-center gap-1.5">
                    <Plus className="w-3.5 h-3.5" /> Register New Update Feature
                  </span>
                  <span className="text-[11px] text-slate-400">Future capability registry</span>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input
                    id="new-feature-name"
                    type="text"
                    placeholder="Feature name (e.g., AI Phonics Tutor)"
                    value={newFeatureName}
                    onChange={(e) => setNewFeatureName(e.target.value)}
                    className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder:text-slate-500 focus:outline-hidden focus:border-amber-400"
                  />
                  <select
                    id="new-feature-category"
                    value={newFeatureCategory}
                    onChange={(e) => setNewFeatureCategory(e.target.value as FeatureToggle['category'])}
                    className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-hidden focus:border-amber-400"
                  >
                    <option value="pedagogy">Pedagogy / Learning</option>
                    <option value="core">Core Architecture</option>
                    <option value="audio">Audio / Speech Engine</option>
                    <option value="sync">Multi-Classroom Sync</option>
                    <option value="experimental">Experimental Beta</option>
                  </select>
                  <input
                    id="new-feature-desc"
                    type="text"
                    placeholder="Short description / requirement"
                    value={newFeatureDesc}
                    onChange={(e) => setNewFeatureDesc(e.target.value)}
                    className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder:text-slate-500 focus:outline-hidden focus:border-amber-400"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-3.5 py-1.5 bg-[#FBBF24] hover:bg-amber-300 text-slate-950 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Inject Feature Flag
                  </button>
                </div>
              </form>

              {/* Feature List */}
              <div className="space-y-3">
                <div className="text-xs font-mono text-slate-400 flex items-center justify-between">
                  <span>ACTIVE FEATURE FLAGS ({localConfig.featureToggles.length})</span>
                  <span>TARGET VERSION: MPT4-2026</span>
                </div>

                <div className="grid grid-cols-1 gap-2.5">
                  {localConfig.featureToggles.map((feature) => (
                    <div
                      key={feature.id}
                      className={`p-3.5 rounded-xl border transition-all ${
                        feature.enabled
                          ? 'bg-slate-800/80 border-[#FBBF24]/50 text-slate-100 shadow-xs'
                          : 'bg-slate-900/60 border-slate-800 text-slate-400'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-xs text-white">
                              {feature.name}
                            </span>
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-amber-300 border border-slate-700">
                              {feature.targetVersion}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 leading-relaxed">
                            {feature.description}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleToggleFeature(feature.id)}
                            className={`w-10 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-200 ${
                              feature.enabled ? 'bg-[#FBBF24]' : 'bg-slate-700'
                            }`}
                          >
                            <div
                              className={`bg-slate-950 w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
                                feature.enabled ? 'translate-x-4' : 'translate-x-0'
                              }`}
                            />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteFeature(feature.id)}
                            className="p-1 text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                            title="Delete flag"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                        <span>Rule: {feature.logicRule}</span>
                        <span className="capitalize text-[#FBBF24]/90">{feature.category}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: UPDATE CHANNELS */}
          {activeTab === 'updates' && (
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700 space-y-4">
                <div className="text-xs font-semibold uppercase text-amber-400 font-mono flex items-center gap-2">
                  <Radio className="w-4 h-4" /> Firmware & Curriculum Release Channel
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { id: 'stable-2026', label: 'Stable 2026', desc: 'Recommended classroom release verified for general deployment.' },
                    { id: 'beta-preview', label: 'Beta Preview', desc: 'Pre-release pedagogical tracks for early testing.' },
                    { id: 'canary-mpt4', label: 'Canary MPT4', desc: 'Bleeding-edge daily builds with experimental AI speech.' },
                  ].map((ch) => (
                    <button
                      key={ch.id}
                      type="button"
                      onClick={() => setLocalConfig(prev => ({ ...prev, updateChannel: ch.id as LogicConfig['updateChannel'] }))}
                      className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                        localConfig.updateChannel === ch.id
                          ? 'bg-amber-500/15 border-amber-400 text-amber-200'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold font-mono">{ch.label}</span>
                        {localConfig.updateChannel === ch.id && (
                          <Check className="w-3.5 h-3.5 text-amber-400" />
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 leading-snug">{ch.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700 flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-slate-200">Automatic Background Feature Ingestion</div>
                  <div className="text-[11px] text-slate-400">Silently evaluate and activate backward-compatible updates</div>
                </div>
                <button
                  type="button"
                  onClick={() => setLocalConfig(prev => ({ ...prev, autoUpdateFeatures: !prev.autoUpdateFeatures }))}
                  className={`w-10 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                    localConfig.autoUpdateFeatures ? 'bg-amber-500' : 'bg-slate-700'
                  }`}
                >
                  <div className={`bg-slate-950 w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    localConfig.autoUpdateFeatures ? 'translate-x-4' : 'translate-x-0'
                  }`} />
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: ENGINE & PARAMETERS */}
          {activeTab === 'engine' && (
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700 space-y-4">
                <div className="text-xs font-semibold uppercase text-amber-400 font-mono">
                  Pedagogical Difficulty Calibration
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(['kindergarten', 'grade-1', 'grade-2', 'advanced'] as const).map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setLocalConfig(prev => ({ ...prev, adaptiveLevel: lvl }))}
                      className={`px-3 py-2 rounded-lg text-xs font-medium capitalize border transition-all cursor-pointer ${
                        localConfig.adaptiveLevel === lvl
                          ? 'bg-amber-500 text-slate-950 font-bold border-amber-400'
                          : 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      {lvl.replace('-', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-semibold text-slate-200">Interactive Bubble Audio Feedback</div>
                    <div className="text-[11px] text-slate-400">Harmonic peaceful WebAudio chimes</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setLocalConfig(prev => ({ ...prev, soundEffects: !prev.soundEffects }))}
                    className={`w-10 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                      localConfig.soundEffects ? 'bg-amber-500' : 'bg-slate-700'
                    }`}
                  >
                    <div className={`bg-slate-950 w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      localConfig.soundEffects ? 'translate-x-4' : 'translate-x-0'
                    }`} />
                  </button>
                </div>

                <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-semibold text-slate-200">Bubble Dynamic Motion Physics</div>
                    <div className="text-[11px] text-slate-400">Micro-wobble and floating ripples</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setLocalConfig(prev => ({ ...prev, bubblePhysics: !prev.bubblePhysics }))}
                    className={`w-10 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                      localConfig.bubblePhysics ? 'bg-amber-500' : 'bg-slate-700'
                    }`}
                  >
                    <div className={`bg-slate-950 w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      localConfig.bubblePhysics ? 'translate-x-4' : 'translate-x-0'
                    }`} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SCRIPTING & RULES */}
          {activeTab === 'rules' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-mono">MPT4_RULE_TREE.JSON</span>
                <span className="text-[11px] text-amber-400/80">Direct JSON logic definition</span>
              </div>
              <textarea
                id="custom-update-rules-json"
                value={localConfig.customUpdateRules}
                onChange={(e) => setLocalConfig(prev => ({ ...prev, customUpdateRules: e.target.value }))}
                rows={10}
                className="w-full p-3.5 bg-slate-950 border border-slate-700 rounded-xl font-mono text-xs text-amber-300/90 focus:outline-hidden focus:border-amber-400"
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-800/80 border-t border-slate-700/80 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <AlertCircle className="w-4 h-4 text-amber-400" />
            <span>Shortcut: Press <kbd className="px-1.5 py-0.5 rounded bg-slate-700 text-amber-300 font-mono text-[10px]">S</kbd> to toggle back-panel</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="export-config-btn"
              onClick={handleExportJSON}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" /> Export JSON
            </button>

            <button
              id="save-config-btn"
              onClick={handleSave}
              className="px-4 py-1.5 rounded-lg bg-[#FBBF24] hover:bg-amber-300 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-md transition-colors cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" /> Save Logic State
            </button>
          </div>
        </div>
      </motion.div>

      {/* Save / Revoke confirmation toast */}
      {showSaveToast && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="fixed bottom-6 right-6 px-4 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-xl z-50"
        >
          <Check className="w-4 h-4" /> {toastMessage}
        </motion.div>
      )}
    </div>
  );
}
