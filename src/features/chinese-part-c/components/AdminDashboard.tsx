import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  RotateCcw,
  Download,
  Upload,
  Sliders,
  Sparkles,
  Check,
  Type,
  Volume2,
  HelpCircle,
  Plus,
  Trash2,
  BookOpen,
  Award,
  Zap,
  Bookmark,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { sound } from '../utils/audio';
import { StimulusPoint, VocabularyWord, ModelAnswer } from '../types';

export const AdminDashboard: React.FC = () => {
  const {
    settings,
    updateSettings,
    resetSettings,
    importSettingsJSON,
    exportSettingsJSON,
    isAdminOpen,
    setIsAdminOpen,
  } = useApp();

  const [activeTab, setActiveTab] = useState<
    'general' | 'stimulus' | 'starters' | 'vocab' | 'model' | 'audio' | 'data'
  >('general');
  const [jsonInput, setJsonInput] = useState<string>('');
  const [showCopyAlert, setShowCopyAlert] = useState<boolean>(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  if (!isAdminOpen) return null;

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

  // Stimulus Points handlers
  const handleUpdatePoint = (index: number, updated: Partial<StimulusPoint>) => {
    const currentPoints = [...settings.task.stimulusPoints];
    currentPoints[index] = { ...currentPoints[index], ...updated };
    updateSettings({
      task: {
        ...settings.task,
        stimulusPoints: currentPoints,
      },
    });
  };

  const handleAddPoint = () => {
    sound.playPop();
    const newPoint: StimulusPoint = {
      id: `pt-${Date.now()}`,
      label: 'New Point',
      detail: 'Describe the details here',
      category: 'General',
    };
    updateSettings({
      task: {
        ...settings.task,
        stimulusPoints: [...settings.task.stimulusPoints, newPoint],
      },
    });
  };

  const handleDeletePoint = (index: number) => {
    sound.playPop();
    const currentPoints = settings.task.stimulusPoints.filter((_, i) => i !== index);
    updateSettings({
      task: {
        ...settings.task,
        stimulusPoints: currentPoints,
      },
    });
  };

  // Vocab Bank handlers
  const handleAddVocab = () => {
    sound.playPop();
    const newVocab: VocabularyWord = {
      id: `vb-${Date.now()}`,
      word: 'newword',
      partOfSpeech: 'noun',
      meaning: 'Word definition',
      example: 'Example sentence.',
    };
    updateSettings({
      task: {
        ...settings.task,
        vocabularyBank: [...settings.task.vocabularyBank, newVocab],
      },
    });
  };

  const handleUpdateVocab = (index: number, updated: Partial<VocabularyWord>) => {
    const currentVocab = [...settings.task.vocabularyBank];
    currentVocab[index] = { ...currentVocab[index], ...updated };
    updateSettings({
      task: {
        ...settings.task,
        vocabularyBank: currentVocab,
      },
    });
  };

  const handleDeleteVocab = (index: number) => {
    sound.playPop();
    const currentVocab = settings.task.vocabularyBank.filter((_, i) => i !== index);
    updateSettings({
      task: {
        ...settings.task,
        vocabularyBank: currentVocab,
      },
    });
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="bg-white border-4 border-[#78350F] rounded-3xl w-full max-w-4xl shadow-[10px_10px_0px_#78350F] overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="bg-[#F59E0B] border-b-4 border-[#78350F] px-4 sm:px-6 py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 rounded-full bg-white border-2 border-[#78350F] flex items-center justify-center font-black text-[#78350F] text-sm shadow-xs">
                G
              </div>
              <div>
                <h2 className="text-base sm:text-xl font-black text-[#78350F] uppercase tracking-tight">
                  供料作文 • 系统设置 (Settings)
                </h2>
                <p className="text-[11px] sm:text-xs font-bold text-[#78350F]/80">
                  设置应用标题、音效与视觉主题 • 按 [G] 开启或关闭
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
          <div className="flex border-b-2 border-[#78350F] bg-[#FEF3C7] px-4 pt-2 gap-1.5 overflow-x-auto">
            <button
              onClick={() => setActiveTab('general')}
              className={`px-3 py-1.5 font-black text-xs sm:text-sm rounded-t-xl border-t-2 border-x-2 transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                activeTab === 'general'
                  ? 'bg-white border-[#78350F] text-[#78350F] shadow-xs'
                  : 'bg-transparent border-transparent text-[#78350F]/70 hover:text-[#78350F]'
              }`}
            >
              <Type className="w-4 h-4" />
              <span>General & Task</span>
            </button>

            <button
              onClick={() => setActiveTab('stimulus')}
              className={`px-3 py-1.5 font-black text-xs sm:text-sm rounded-t-xl border-t-2 border-x-2 transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                activeTab === 'stimulus'
                  ? 'bg-white border-[#78350F] text-[#78350F] shadow-xs'
                  : 'bg-transparent border-transparent text-[#78350F]/70 hover:text-[#78350F]'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Stimulus Notes ({settings.task.stimulusPoints.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('vocab')}
              className={`px-3 py-1.5 font-black text-xs sm:text-sm rounded-t-xl border-t-2 border-x-2 transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                activeTab === 'vocab'
                  ? 'bg-white border-[#78350F] text-[#78350F] shadow-xs'
                  : 'bg-transparent border-transparent text-[#78350F]/70 hover:text-[#78350F]'
              }`}
            >
              <Bookmark className="w-4 h-4" />
              <span>Vocabulary Bank ({settings.task.vocabularyBank.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('model')}
              className={`px-3 py-1.5 font-black text-xs sm:text-sm rounded-t-xl border-t-2 border-x-2 transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                activeTab === 'model'
                  ? 'bg-white border-[#78350F] text-[#78350F] shadow-xs'
                  : 'bg-transparent border-transparent text-[#78350F]/70 hover:text-[#78350F]'
              }`}
            >
              <Award className="w-4 h-4" />
              <span>Model Answers</span>
            </button>

            <button
              onClick={() => setActiveTab('audio')}
              className={`px-3 py-1.5 font-black text-xs sm:text-sm rounded-t-xl border-t-2 border-x-2 transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                activeTab === 'audio'
                  ? 'bg-white border-[#78350F] text-[#78350F] shadow-xs'
                  : 'bg-transparent border-transparent text-[#78350F]/70 hover:text-[#78350F]'
              }`}
            >
              <Volume2 className="w-4 h-4" />
              <span>Audio & Theme</span>
            </button>

            <button
              onClick={() => setActiveTab('data')}
              className={`px-3 py-1.5 font-black text-xs sm:text-sm rounded-t-xl border-t-2 border-x-2 transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                activeTab === 'data'
                  ? 'bg-white border-[#78350F] text-[#78350F] shadow-xs'
                  : 'bg-transparent border-transparent text-[#78350F]/70 hover:text-[#78350F]'
              }`}
            >
              <Download className="w-4 h-4" />
              <span>Export/Import</span>
            </button>
          </div>

          {/* Tab Body */}
          <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">
            {/* GENERAL TAB */}
            {activeTab === 'general' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black text-[#78350F] uppercase mb-1">
                      App Name / Header Title
                    </label>
                    <input
                      type="text"
                      value={settings.appName}
                      onChange={(e) => updateSettings({ appName: e.target.value })}
                      className="w-full px-3 py-2 bg-[#FFFBEB] border-2 border-[#78350F] rounded-xl font-bold text-sm text-[#78350F]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black text-[#78350F] uppercase mb-1">
                      App Subtitle
                    </label>
                    <input
                      type="text"
                      value={settings.appSubtitle}
                      onChange={(e) => updateSettings({ appSubtitle: e.target.value })}
                      className="w-full px-3 py-2 bg-[#FFFBEB] border-2 border-[#78350F] rounded-xl font-bold text-sm text-[#78350F]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black text-[#78350F] uppercase mb-1">
                      Module Badge
                    </label>
                    <input
                      type="text"
                      value={settings.moduleBadge}
                      onChange={(e) => updateSettings({ moduleBadge: e.target.value })}
                      className="w-full px-3 py-2 bg-[#FFFBEB] border-2 border-[#78350F] rounded-xl font-bold text-sm text-[#78350F]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black text-[#78350F] uppercase mb-1">
                      Task Title
                    </label>
                    <input
                      type="text"
                      value={settings.task.title}
                      onChange={(e) =>
                        updateSettings({
                          task: { ...settings.task, title: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 bg-[#FFFBEB] border-2 border-[#78350F] rounded-xl font-bold text-sm text-[#78350F]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black text-[#78350F] uppercase mb-1">
                    Instruction Text
                  </label>
                  <input
                    type="text"
                    value={settings.instructionText}
                    onChange={(e) => updateSettings({ instructionText: e.target.value })}
                    className="w-full px-3 py-2 bg-[#FFFBEB] border-2 border-[#78350F] rounded-xl font-bold text-sm text-[#78350F]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-[#78350F] uppercase mb-1">
                    Situation / Scenario Prompt
                  </label>
                  <textarea
                    rows={3}
                    value={settings.task.scenario}
                    onChange={(e) =>
                      updateSettings({
                        task: { ...settings.task, scenario: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 bg-[#FFFBEB] border-2 border-[#78350F] rounded-xl font-semibold text-sm text-[#78350F]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black text-[#78350F] uppercase mb-1">
                      Min Target Words
                    </label>
                    <input
                      type="number"
                      value={settings.task.minWords}
                      onChange={(e) =>
                        updateSettings({
                          task: { ...settings.task, minWords: Number(e.target.value) || 30 },
                        })
                      }
                      className="w-full px-3 py-2 bg-[#FFFBEB] border-2 border-[#78350F] rounded-xl font-bold text-sm text-[#78350F]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black text-[#78350F] uppercase mb-1">
                      Max Target Words
                    </label>
                    <input
                      type="number"
                      value={settings.task.maxWords}
                      onChange={(e) =>
                        updateSettings({
                          task: { ...settings.task, maxWords: Number(e.target.value) || 50 },
                        })
                      }
                      className="w-full px-3 py-2 bg-[#FFFBEB] border-2 border-[#78350F] rounded-xl font-bold text-sm text-[#78350F]"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STIMULUS TAB */}
            {activeTab === 'stimulus' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black text-[#78350F] uppercase">
                    Stimulus Bullet Points
                  </h3>
                  <button
                    onClick={handleAddPoint}
                    className="px-3 py-1.5 bg-[#F59E0B] text-[#78350F] font-black text-xs rounded-xl border-2 border-[#78350F] flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Point</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {settings.task.stimulusPoints.map((pt, index) => (
                    <div
                      key={pt.id || index}
                      className="p-3 bg-[#FFFBEB] rounded-2xl border-2 border-[#FDE68A] flex flex-col sm:flex-row gap-3 items-start sm:items-center"
                    >
                      <div className="w-full sm:w-1/4">
                        <label className="block text-[10px] font-black text-[#78350F] uppercase">
                          Label
                        </label>
                        <input
                          type="text"
                          value={pt.label}
                          onChange={(e) => handleUpdatePoint(index, { label: e.target.value })}
                          className="w-full px-2 py-1 bg-white border border-[#78350F] rounded-lg font-bold text-xs"
                        />
                      </div>

                      <div className="w-full sm:flex-1">
                        <label className="block text-[10px] font-black text-[#78350F] uppercase">
                          Details
                        </label>
                        <input
                          type="text"
                          value={pt.detail}
                          onChange={(e) => handleUpdatePoint(index, { detail: e.target.value })}
                          className="w-full px-2 py-1 bg-white border border-[#78350F] rounded-lg font-semibold text-xs"
                        />
                      </div>

                      <button
                        onClick={() => handleDeletePoint(index)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg border border-red-300 self-end sm:self-center cursor-pointer"
                        title="Delete point"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* VOCABULARY TAB */}
            {activeTab === 'vocab' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black text-[#78350F] uppercase">
                    Vocabulary Bank Words
                  </h3>
                  <button
                    onClick={handleAddVocab}
                    className="px-3 py-1.5 bg-[#F59E0B] text-[#78350F] font-black text-xs rounded-xl border-2 border-[#78350F] flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Word</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {settings.task.vocabularyBank.map((vb, index) => (
                    <div
                      key={vb.id || index}
                      className="p-3 bg-[#FFFBEB] rounded-2xl border-2 border-[#FDE68A] space-y-2"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex-1">
                          <label className="block text-[10px] font-black text-[#78350F] uppercase">
                            Word
                          </label>
                          <input
                            type="text"
                            value={vb.word}
                            onChange={(e) => handleUpdateVocab(index, { word: e.target.value })}
                            className="w-full px-2 py-1 bg-white border border-[#78350F] rounded-lg font-bold text-xs"
                          />
                        </div>

                        <div className="w-28">
                          <label className="block text-[10px] font-black text-[#78350F] uppercase">
                            Part of Speech
                          </label>
                          <input
                            type="text"
                            value={vb.partOfSpeech || ''}
                            onChange={(e) =>
                              handleUpdateVocab(index, { partOfSpeech: e.target.value })
                            }
                            className="w-full px-2 py-1 bg-white border border-[#78350F] rounded-lg font-semibold text-xs"
                            placeholder="noun / verb"
                          />
                        </div>

                        <button
                          onClick={() => handleDeleteVocab(index)}
                          className="mt-4 p-1.5 text-red-600 hover:bg-red-50 rounded-lg border border-red-300 cursor-pointer"
                          title="Delete word"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div>
                        <label className="block text-[10px] font-black text-[#78350F] uppercase">
                          Meaning / Definition
                        </label>
                        <input
                          type="text"
                          value={vb.meaning}
                          onChange={(e) => handleUpdateVocab(index, { meaning: e.target.value })}
                          className="w-full px-2 py-1 bg-white border border-[#78350F] rounded-lg font-semibold text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-black text-[#78350F] uppercase">
                          Example Sentence
                        </label>
                        <input
                          type="text"
                          value={vb.example}
                          onChange={(e) => handleUpdateVocab(index, { example: e.target.value })}
                          className="w-full px-2 py-1 bg-white border border-[#78350F] rounded-lg font-semibold text-xs text-slate-700"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* MODEL ANSWERS TAB */}
            {activeTab === 'model' && (
              <div className="space-y-4">
                <h3 className="text-sm font-black text-[#78350F] uppercase">
                  Model Answers Configuration
                </h3>
                <div className="space-y-4">
                  {settings.task.modelAnswers.map((ma, index) => (
                    <div
                      key={ma.id || index}
                      className="p-3.5 bg-[#FFFBEB] rounded-2xl border-2 border-[#FDE68A] space-y-2"
                    >
                      <div>
                        <label className="block text-[10px] font-black text-[#78350F] uppercase">
                          Title
                        </label>
                        <input
                          type="text"
                          value={ma.title}
                          onChange={(e) => {
                            const answers = [...settings.task.modelAnswers];
                            answers[index].title = e.target.value;
                            updateSettings({
                              task: { ...settings.task, modelAnswers: answers },
                            });
                          }}
                          className="w-full px-2 py-1 bg-white border border-[#78350F] rounded-lg font-bold text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-black text-[#78350F] uppercase">
                          Model Answer Content
                        </label>
                        <textarea
                          rows={4}
                          value={ma.content}
                          onChange={(e) => {
                            const answers = [...settings.task.modelAnswers];
                            answers[index].content = e.target.value;
                            updateSettings({
                              task: { ...settings.task, modelAnswers: answers },
                            });
                          }}
                          className="w-full px-2.5 py-1.5 bg-white border border-[#78350F] rounded-lg font-sans text-xs font-semibold"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* AUDIO & THEME TAB */}
            {activeTab === 'audio' && (
              <div className="space-y-4">
                <h3 className="text-sm font-black text-[#78350F] uppercase">
                  Audio & Sound Effects Toggles
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className="flex items-center gap-3 p-3 bg-[#FFFBEB] rounded-xl border border-[#78350F]/20 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.soundEnabled}
                      onChange={(e) => updateSettings({ soundEnabled: e.target.checked })}
                      className="w-4 h-4 accent-[#F59E0B]"
                    />
                    <span className="text-xs font-bold text-[#78350F]">Master Sound Enabled</span>
                  </label>

                  <label className="flex items-center gap-3 p-3 bg-[#FFFBEB] rounded-xl border border-[#78350F]/20 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.popSoundEnabled}
                      onChange={(e) => updateSettings({ popSoundEnabled: e.target.checked })}
                      className="w-4 h-4 accent-[#F59E0B]"
                    />
                    <span className="text-xs font-bold text-[#78350F]">Click & Pop Sounds</span>
                  </label>

                  <label className="flex items-center gap-3 p-3 bg-[#FFFBEB] rounded-xl border border-[#78350F]/20 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.chimeSoundEnabled}
                      onChange={(e) => updateSettings({ chimeSoundEnabled: e.target.checked })}
                      className="w-4 h-4 accent-[#F59E0B]"
                    />
                    <span className="text-xs font-bold text-[#78350F]">Chime & Success Sounds</span>
                  </label>

                  <label className="flex items-center gap-3 p-3 bg-[#FFFBEB] rounded-xl border border-[#78350F]/20 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.fanfareSoundEnabled}
                      onChange={(e) => updateSettings({ fanfareSoundEnabled: e.target.checked })}
                      className="w-4 h-4 accent-[#F59E0B]"
                    />
                    <span className="text-xs font-bold text-[#78350F]">Fanfare Celebration</span>
                  </label>
                </div>

                <h3 className="text-sm font-black text-[#78350F] uppercase pt-2">
                  Visual Layout Toggles
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className="flex items-center gap-3 p-3 bg-[#FFFBEB] rounded-xl border border-[#78350F]/20 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.showHoneycombGrid}
                      onChange={(e) => updateSettings({ showHoneycombGrid: e.target.checked })}
                      className="w-4 h-4 accent-[#F59E0B]"
                    />
                    <span className="text-xs font-bold text-[#78350F]">Show Honeycomb Grid Pattern</span>
                  </label>

                  <label className="flex items-center gap-3 p-3 bg-[#FFFBEB] rounded-xl border border-[#78350F]/20 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.showFloatingHexagons}
                      onChange={(e) =>
                        updateSettings({ showFloatingHexagons: e.target.checked })
                      }
                      className="w-4 h-4 accent-[#F59E0B]"
                    />
                    <span className="text-xs font-bold text-[#78350F]">Show Floating Decorative Shapes</span>
                  </label>
                </div>
              </div>
            )}

            {/* DATA EXPORT & IMPORT TAB */}
            {activeTab === 'data' && (
              <div className="space-y-4">
                <div className="bg-[#FFFBEB] p-4 rounded-2xl border-2 border-[#FDE68A] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-[#78350F] uppercase">
                      Export Current Settings to Clipboard
                    </span>
                    <button
                      onClick={handleExport}
                      className="px-3 py-1.5 bg-[#F59E0B] text-[#78350F] font-black text-xs rounded-xl border-2 border-[#78350F] flex items-center gap-1.5 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>{showCopyAlert ? 'Copied JSON!' : 'Copy Settings JSON'}</span>
                    </button>
                  </div>
                  <p className="text-[11px] text-[#B45309] font-medium">
                    Save your custom English Part 6 questions, stimulus notes, and vocabulary lists as a JSON backup.
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-black text-[#78350F] uppercase">
                    Import Settings from JSON
                  </label>
                  <textarea
                    rows={4}
                    value={jsonInput}
                    onChange={(e) => setJsonInput(e.target.value)}
                    placeholder="Paste valid JSON configuration here..."
                    className="w-full p-2.5 bg-[#FFFBEB] border-2 border-[#78350F] rounded-xl text-xs font-mono"
                  />
                  <div className="flex items-center justify-between">
                    <button
                      onClick={handleImport}
                      className="px-4 py-2 bg-[#10B981] text-white font-black text-xs rounded-xl border-2 border-[#065F46] flex items-center gap-1.5 cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Import JSON</span>
                    </button>

                    {importStatus && (
                      <span className="text-xs font-bold text-[#B45309]">{importStatus}</span>
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t-2 border-[#FEF3C7] flex items-center justify-between">
                  <div>
                    <span className="text-xs font-black text-red-600 block">
                      Reset to Default English Part 6
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium">
                      Clears local edits and restores default Science Fair Part 6 task.
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      resetSettings();
                      sound.playPop();
                    }}
                    className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 font-black text-xs rounded-xl border-2 border-red-400 flex items-center gap-1.5 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset Defaults</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
