import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Save,
  RotateCcw,
  Volume2,
  Sliders,
  Image as ImageIcon,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { sound } from '../utils/audio';

export const AdminDashboard: React.FC = () => {
  const { isAdminOpen, setIsAdminOpen, settings, updateSettings, resetToDefaultSettings } = useApp();

  const [imageUrl, setImageUrl] = useState<string>(settings.article.imageUrl || '');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(settings.soundEnabled);
  const [beeBuzzEnabled, setBeeBuzzEnabled] = useState<boolean>(settings.beeBuzzEnabled);
  const [popSoundEnabled, setPopSoundEnabled] = useState<boolean>(settings.popSoundEnabled);
  const [chimeSoundEnabled, setChimeSoundEnabled] = useState<boolean>(settings.chimeSoundEnabled);
  const [fanfareSoundEnabled, setFanfareSoundEnabled] = useState<boolean>(settings.fanfareSoundEnabled);

  if (!isAdminOpen) return null;

  const handleSave = () => {
    sound.playChime();
    updateSettings({
      article: {
        ...settings.article,
        imageUrl: imageUrl.trim(),
      },
      soundEnabled,
      beeBuzzEnabled,
      popSoundEnabled,
      chimeSoundEnabled,
      fanfareSoundEnabled,
    });
    setIsAdminOpen(false);
  };

  const handleReset = () => {
    if (window.confirm('确定要重置所有试题与设置为默认值吗？')) {
      resetToDefaultSettings();
      setImageUrl('');
      setIsAdminOpen(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-white border-3 border-amber-400 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative overflow-hidden max-h-[90vh] flex flex-col"
        >
          {/* Modal Header */}
          <div className="flex items-center justify-between pb-4 border-b border-amber-200">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-amber-100 text-amber-800 rounded-xl">
                <Sliders className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-amber-950">系统设置与插图管理</h3>
                <p className="text-xs text-amber-700 font-semibold">可随时按键盘 [G] 键开启或关闭</p>
              </div>
            </div>
            <button
              onClick={() => {
                sound.playPop();
                setIsAdminOpen(false);
              }}
              className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="py-4 overflow-y-auto space-y-4 text-xs sm:text-sm">
            {/* Article Illustration URL */}
            <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-3.5 space-y-2">
              <label className="font-bold text-amber-950 flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-amber-700" />
                <span>篇章插图图片网址 (URL)：</span>
              </label>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://... (图片直接链接)"
                className="w-full px-3 py-2 bg-white border border-amber-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 font-sans"
              />
              <p className="text-[11px] text-amber-700">
                可粘贴任意图片直接链接以替换《雨后的第一桶水》上方插图。
              </p>
            </div>

            {/* Sound FX Toggles */}
            <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-3.5 space-y-3">
              <div className="font-bold text-amber-950 flex items-center gap-1.5">
                <Volume2 className="w-4 h-4 text-amber-700" />
                <span>音效与语音反馈设置：</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={soundEnabled}
                    onChange={(e) => setSoundEnabled(e.target.checked)}
                    className="accent-amber-500 w-4 h-4 rounded"
                  />
                  <span>主音效开关</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={beeBuzzEnabled}
                    onChange={(e) => setBeeBuzzEnabled(e.target.checked)}
                    className="accent-amber-500 w-4 h-4 rounded"
                  />
                  <span>蜜蜂蜂鸣音效</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={chimeSoundEnabled}
                    onChange={(e) => setChimeSoundEnabled(e.target.checked)}
                    className="accent-amber-500 w-4 h-4 rounded"
                  />
                  <span>回答正确和弦铃声</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={fanfareSoundEnabled}
                    onChange={(e) => setFanfareSoundEnabled(e.target.checked)}
                    className="accent-amber-500 w-4 h-4 rounded"
                  />
                  <span>满分庆祝礼炮乐</span>
                </label>
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="pt-3 border-t border-amber-200 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleReset}
              className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>恢复默认题库</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsAdminOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center gap-1.5 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>保存设置</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
