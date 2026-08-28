import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  RotateCcw,
  Download,
  Upload,
  Sliders,
  Sparkles,
  Layers,
  FileText,
  Check,
  Move,
  Type,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { sound } from '../utils/audio';

export const AdminDashboard: React.FC = () => {
  const {
    settings,
    updateSettings,
    updateBox,
    resetSettings,
    importSettingsJSON,
    exportSettingsJSON,
    isAdminOpen,
    setIsAdminOpen,
    adminTab,
    setAdminTab,
    setIsAlignMode,
    setActiveAlignBoxId,
  } = useApp();

  const [selectedBoxIndex, setSelectedBoxIndex] = useState<number>(0);
  const [jsonInput, setJsonInput] = useState<string>('');
  const [showCopyAlert, setShowCopyAlert] = useState<boolean>(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  if (!isAdminOpen) return null;

  const currentBox = settings.boxes[selectedBoxIndex] || settings.boxes[0];

  const handleClose = () => {
    setIsAdminOpen(false);
    sound.playPop();
  };

  const handleExport = () => {
    const dataStr = exportSettingsJSON();
    navigator.clipboard.writeText(dataStr);
    setShowCopyAlert(true);
    sound.playChime();
    setTimeout(() => setShowCopyAlert(false), 2500);
  };

  const handleImport = () => {
    if (!jsonInput.trim()) return;
    const success = importSettingsJSON(jsonInput);
    if (success) {
      setImportStatus('Settings successfully imported!');
      setJsonInput('');
      setTimeout(() => setImportStatus(null), 3000);
    } else {
      setImportStatus('Error: Invalid JSON format.');
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-xs overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="bg-white border-4 border-[#78350F] rounded-3xl w-full max-w-4xl shadow-[10px_10px_0px_#78350F] overflow-hidden flex flex-col max-h-[92vh]"
        >
          {/* Header */}
          <div className="bg-[#F59E0B] border-b-4 border-[#78350F] px-4 sm:px-6 py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white border-2 border-[#78350F] flex items-center justify-center font-black text-[#78350F] text-sm shadow-xs">
                G
              </div>
              <div>
                <h2 className="text-sm sm:text-lg font-black text-[#78350F] uppercase tracking-tight">
                  Admin Settings Control Panel
                </h2>
                <p className="text-[10px] sm:text-xs font-bold text-[#78350F]/80">
                  Hobby Showcase Wall • Press [G] to Open / Close
                </p>
              </div>
            </div>

            <button
              onClick={handleClose}
              className="p-1.5 bg-white hover:bg-[#FEF3C7] rounded-full border-2 border-[#78350F] text-[#78350F] shadow-[2px_2px_0px_#78350F] transition-all cursor-pointer"
              title="Close [G]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="flex overflow-x-auto border-b-2 border-[#78350F] bg-[#FEF3C7] px-4 pt-2 gap-1.5 scrollbar-none">
            <button
              onClick={() => setAdminTab('boxes')}
              className={`px-4 py-2 font-black text-xs rounded-t-xl border-t-2 border-x-2 transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                adminTab === 'boxes'
                  ? 'bg-white text-[#78350F] border-[#78350F]'
                  : 'bg-[#FDE68A] text-[#78350F]/70 border-transparent hover:bg-[#FDE68A]/90'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Hobby Cards Data</span>
            </button>

            <button
              onClick={() => setAdminTab('alignment')}
              className={`px-4 py-2 font-black text-xs rounded-t-xl border-t-2 border-x-2 transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                adminTab === 'alignment'
                  ? 'bg-white text-[#78350F] border-[#78350F]'
                  : 'bg-[#FDE68A] text-[#78350F]/70 border-transparent hover:bg-[#FDE68A]/90'
              }`}
            >
              <Move className="w-4 h-4" />
              <span>Alignment & Sizes</span>
            </button>

            <button
              onClick={() => setAdminTab('toggles')}
              className={`px-4 py-2 font-black text-xs rounded-t-xl border-t-2 border-x-2 transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                adminTab === 'toggles'
                  ? 'bg-white text-[#78350F] border-[#78350F]'
                  : 'bg-[#FDE68A] text-[#78350F]/70 border-transparent hover:bg-[#FDE68A]/90'
              }`}
            >
              <Sliders className="w-4 h-4" />
              <span>Audio & Anim FX</span>
            </button>

            <button
              onClick={() => setAdminTab('data')}
              className={`px-4 py-2 font-black text-xs rounded-t-xl border-t-2 border-x-2 transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                adminTab === 'data'
                  ? 'bg-white text-[#78350F] border-[#78350F]'
                  : 'bg-[#FDE68A] text-[#78350F]/70 border-transparent hover:bg-[#FDE68A]/90'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Import / Export</span>
            </button>
          </div>

          {/* Content Area */}
          <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-5">
            
            {/* TAB 1: BOX DATA */}
            {adminTab === 'boxes' && (
              <div className="space-y-4">
                {/* Global Prompt Fields */}
                <div className="bg-[#FEF3C7]/40 p-4 rounded-2xl border-2 border-[#78350F] space-y-3">
                  <h3 className="font-black text-[#78350F] text-xs uppercase flex items-center gap-2">
                    <FileText className="w-4 h-4 text-amber-600" />
                    Global Question & Lesson Header Prompt
                  </h3>
                  <div>
                    <label className="block text-[11px] font-black text-[#78350F] mb-1">
                      Header Prompt (Top of Screen):
                    </label>
                    <textarea
                      rows={2}
                      value={settings.questionPrompt || ''}
                      onChange={(e) => updateSettings({ questionPrompt: e.target.value })}
                      className="w-full p-2 bg-white border-2 border-[#78350F] rounded-xl text-xs font-bold text-[#78350F]"
                    />
                  </div>
                </div>

                {/* 8 Card Grid Selector */}
                <div className="space-y-1">
                  <span className="text-[10px] font-black text-slate-500 uppercase block">
                    Select Hobby Card to Edit:
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pb-2">
                    {settings.boxes.map((box, idx) => (
                      <button
                        key={box.id}
                        onClick={() => {
                          setSelectedBoxIndex(idx);
                          sound.playPop();
                        }}
                        className={`p-2 rounded-xl border-2 font-black text-xs transition-all flex items-center justify-center gap-2 cursor-pointer ${
                          selectedBoxIndex === idx
                            ? 'bg-[#F59E0B] text-[#78350F] border-[#78350F] shadow-[2px_2px_0px_#78350F]'
                            : 'bg-[#FEF3C7]/50 text-[#78350F]/80 border-[#FDE68A] hover:border-[#F59E0B]'
                        }`}
                      >
                        <span className="w-5 h-5 rounded-full bg-white border border-[#78350F] flex items-center justify-center text-[10px] shrink-0">
                          {idx + 1}
                        </span>
                        <span className="truncate">{box.title}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Selected Box Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Visual assets panel */}
                  <div className="space-y-3 bg-[#FEF3C7]/30 p-4 rounded-2xl border-2 border-[#FDE68A]">
                    <h3 className="font-black text-[#78350F] text-xs uppercase flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-[#F59E0B]" />
                      Hobby {selectedBoxIndex + 1} Image Links
                    </h3>

                    {/* Uppercase Label */}
                    <div>
                      <label className="block text-[10px] font-black text-[#78350F] mb-1">
                        Card Title (Uppercase):
                      </label>
                      <input
                        type="text"
                        value={currentBox.title}
                        onChange={(e) => updateBox(currentBox.id, { title: e.target.value })}
                        className="w-full px-3 py-1.5 bg-white border-2 border-[#78350F] rounded-xl text-xs font-bold text-[#78350F]"
                      />
                    </div>

                    {/* Base Image */}
                    <div>
                      <label className="block text-[10px] font-black text-[#78350F] mb-1">
                        Base Image (Black & White):
                      </label>
                      <input
                        type="text"
                        value={currentBox.imageUrl}
                        onChange={(e) => updateBox(currentBox.id, { imageUrl: e.target.value })}
                        className="w-full px-3 py-1.5 bg-white border-2 border-[#78350F] rounded-xl text-xs font-mono text-[#78350F]"
                      />
                    </div>

                    {/* Colored Image */}
                    <div>
                      <label className="block text-[10px] font-black text-[#78350F] mb-1">
                        Colored Overlay Image (On click):
                      </label>
                      <input
                        type="text"
                        value={currentBox.overlayPngUrl}
                        onChange={(e) => updateBox(currentBox.id, { overlayPngUrl: e.target.value })}
                        className="w-full px-3 py-1.5 bg-white border-2 border-[#78350F] rounded-xl text-xs font-mono text-[#78350F]"
                      />
                    </div>
                  </div>

                  {/* Texts panel */}
                  <div className="space-y-3 bg-amber-50/50 p-4 rounded-2xl border-2 border-[#F59E0B]">
                    <h3 className="font-black text-[#78350F] text-xs uppercase flex items-center gap-1.5">
                      <Type className="w-4 h-4 text-amber-600" />
                      Hobby Words & Reasons
                    </h3>

                    {/* Hobby name */}
                    <div>
                      <label className="block text-[10px] font-black text-[#78350F] mb-1">
                        Hobby Name (Drags to Slot 1):
                      </label>
                      <input
                        type="text"
                        value={currentBox.textBox1}
                        onChange={(e) => updateBox(currentBox.id, { textBox1: e.target.value })}
                        className="w-full px-3 py-1.5 bg-white border-2 border-[#78350F] rounded-xl text-xs font-bold text-[#78350F]"
                      />
                    </div>

                    {/* Reason 1 */}
                    <div>
                      <label className="block text-[10px] font-black text-[#78350F] mb-1">
                        Reason 1 (Drags to Slot 2):
                      </label>
                      <textarea
                        rows={2}
                        value={currentBox.textBox2}
                        onChange={(e) => updateBox(currentBox.id, { textBox2: e.target.value })}
                        className="w-full p-2 bg-white border-2 border-[#78350F] rounded-xl text-xs font-bold text-[#78350F]"
                      />
                    </div>

                    {/* Reason 2 */}
                    <div>
                      <label className="block text-[10px] font-black text-[#78350F] mb-1">
                        Reason 2 (Drags to Slot 3):
                      </label>
                      <textarea
                        rows={2}
                        value={currentBox.textBox3}
                        onChange={(e) => updateBox(currentBox.id, { textBox3: e.target.value })}
                        className="w-full p-2 bg-white border-2 border-[#78350F] rounded-xl text-xs font-bold text-[#78350F]"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: ALIGNMENT & SIZES */}
            {adminTab === 'alignment' && (
              <div className="space-y-4">
                <div className="flex gap-2">
                  {settings.boxes.map((box, idx) => (
                    <button
                      key={box.id}
                      onClick={() => setSelectedBoxIndex(idx)}
                      className={`flex-1 py-1.5 px-2 rounded-xl border-2 font-black text-[10px] transition-all cursor-pointer truncate ${
                        selectedBoxIndex === idx
                          ? 'bg-[#F59E0B] text-[#78350F] border-[#78350F]'
                          : 'bg-[#FEF3C7] text-[#78350F] border-transparent'
                      }`}
                    >
                      {box.title}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                  <div className="relative bg-amber-50 rounded-2xl border-3 border-[#78350F] p-4 flex items-center justify-center min-h-[220px] overflow-hidden">
                    <img
                      src={currentBox.imageUrl}
                      alt="Preview"
                      className="max-h-[180px] object-contain pointer-events-none rounded-lg"
                      referrerPolicy="no-referrer"
                    />
                    <div
                      style={{
                        position: 'absolute',
                        left: `${currentBox.overlayX}%`,
                        top: `${currentBox.overlayY}%`,
                        width: `${currentBox.overlayScale}%`,
                        transform: 'translate(-50%, -50%)',
                      }}
                      className="border-2 border-dashed border-[#10B981] rounded-lg"
                    >
                      <img
                        src={currentBox.overlayPngUrl}
                        alt="Overlay"
                        className="w-full h-auto object-contain"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="bg-[#FEF3C7]/40 p-3 rounded-xl border border-[#FDE68A]">
                      <div className="flex justify-between text-[11px] font-black text-[#78350F] mb-1">
                        <span>Overlay Scaling Size (%):</span>
                        <span className="text-amber-700">{currentBox.overlayScale}%</span>
                      </div>
                      <input
                        type="range"
                        min={30}
                        max={100}
                        value={currentBox.overlayScale}
                        onChange={(e) => updateBox(currentBox.id, { overlayScale: Number(e.target.value) })}
                        className="w-full accent-[#F59E0B]"
                      />
                    </div>

                    <div className="bg-[#FEF3C7]/40 p-3 rounded-xl border border-[#FDE68A]">
                      <div className="flex justify-between text-[11px] font-black text-[#78350F] mb-1">
                        <span>Horizontal Position X (%):</span>
                        <span className="text-amber-700">{currentBox.overlayX}%</span>
                      </div>
                      <input
                        type="range"
                        min={5}
                        max={95}
                        value={currentBox.overlayX}
                        onChange={(e) => updateBox(currentBox.id, { overlayX: Number(e.target.value) })}
                        className="w-full accent-[#F59E0B]"
                      />
                    </div>

                    <div className="bg-[#FEF3C7]/40 p-3 rounded-xl border border-[#FDE68A]">
                      <div className="flex justify-between text-[11px] font-black text-[#78350F] mb-1">
                        <span>Vertical Position Y (%):</span>
                        <span className="text-amber-700">{currentBox.overlayY}%</span>
                      </div>
                      <input
                        type="range"
                        min={5}
                        max={95}
                        value={currentBox.overlayY}
                        onChange={(e) => updateBox(currentBox.id, { overlayY: Number(e.target.value) })}
                        className="w-full accent-[#F59E0B]"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: AUDIO & ANIMATIONS */}
            {adminTab === 'toggles' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-[#FEF3C7]/30 p-4 rounded-2xl border-2 border-[#FDE68A] space-y-3">
                  <h3 className="font-black text-[#78350F] text-xs uppercase">Animations & Confetti</h3>
                  
                  <label className="flex items-center justify-between p-2 bg-white rounded-xl border border-[#FDE68A] cursor-pointer">
                    <span className="text-xs font-bold text-[#78350F]">Enable Confetti Burst on Clicks</span>
                    <input
                      type="checkbox"
                      checked={settings.enableConfettiOnClick}
                      onChange={(e) => updateSettings({ enableConfettiOnClick: e.target.checked })}
                      className="w-4 h-4 accent-[#F59E0B]"
                    />
                  </label>
                </div>

                <div className="bg-[#FEF3C7]/30 p-4 rounded-2xl border-2 border-[#FDE68A] space-y-3">
                  <h3 className="font-black text-[#78350F] text-xs uppercase">Sound Effects Toggles</h3>
                  
                  <label className="flex items-center justify-between p-2 bg-white rounded-xl border border-[#FDE68A] cursor-pointer">
                    <span className="text-xs font-bold text-[#78350F]">Master Sound Enabled</span>
                    <input
                      type="checkbox"
                      checked={settings.soundEnabled}
                      onChange={(e) => updateSettings({ soundEnabled: e.target.checked })}
                      className="w-4 h-4 accent-[#F59E0B]"
                    />
                  </label>

                  <label className="flex items-center justify-between p-2 bg-white rounded-xl border border-[#FDE68A] cursor-pointer">
                    <span className="text-xs font-bold text-[#78350F]">Play Bee Buzz on Extra Clicks</span>
                    <input
                      type="checkbox"
                      checked={settings.beeBuzzEnabled}
                      onChange={(e) => updateSettings({ beeBuzzEnabled: e.target.checked })}
                      className="w-4 h-4 accent-[#F59E0B]"
                    />
                  </label>
                </div>
              </div>
            )}

            {/* TAB 4: IMPORT / EXPORT DATA */}
            {adminTab === 'data' && (
              <div className="space-y-4">
                <div className="flex gap-2">
                  <button
                    onClick={handleExport}
                    className="flex-1 py-2.5 bg-[#F59E0B] hover:bg-[#D97706] text-[#78350F] font-black rounded-xl border-2 border-[#78350F] text-xs shadow-[2px_2px_0px_#78350F] flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Copy Config JSON to Clipboard</span>
                  </button>

                  <button
                    onClick={resetSettings}
                    className="py-2.5 px-4 bg-red-500 hover:bg-red-600 text-white font-black rounded-xl border-2 border-[#78350F] text-xs shadow-[2px_2px_0px_#78350F] flex items-center gap-1.5 cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Reset Defaults</span>
                  </button>
                </div>

                {showCopyAlert && (
                  <div className="p-2.5 bg-emerald-500 text-white rounded-xl text-xs font-black flex items-center gap-2">
                    <Check className="w-4 h-4" />
                    <span>Settings copied successfully!</span>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="block text-xs font-black text-[#78350F]">
                    Paste JSON Config to Import:
                  </label>
                  <textarea
                    rows={4}
                    value={jsonInput}
                    onChange={(e) => setJsonInput(e.target.value)}
                    placeholder="Paste exported config JSON here..."
                    className="w-full p-2.5 bg-white border-2 border-[#78350F] rounded-xl text-xs font-mono text-[#78350F]"
                  />
                  <div className="flex justify-between items-center">
                    <button
                      onClick={handleImport}
                      className="py-2 px-4 bg-emerald-500 hover:bg-emerald-600 text-white font-black rounded-xl border-2 border-[#78350F] text-xs shadow-[2px_2px_0px_#78350F] flex items-center gap-1.5 cursor-pointer"
                    >
                      <Upload className="w-4 h-4" />
                      <span>Import JSON</span>
                    </button>
                    {importStatus && (
                      <span className="text-xs font-bold text-amber-900">{importStatus}</span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-[#FEF3C7] border-t-2 border-[#78350F] px-4 py-3 flex items-center justify-between text-xs font-black text-[#78350F]">
            <span>Hobby Showcase Wall Console</span>
            <button
              onClick={handleClose}
              className="px-5 py-1.5 bg-[#F59E0B] hover:bg-[#D97706] rounded-xl border-2 border-[#78350F] text-xs shadow-[2px_2px_0px_#78350F] cursor-pointer"
            >
              Close Admin Screen [G]
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
