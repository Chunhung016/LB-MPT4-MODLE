import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Save,
  RotateCcw,
  Volume2,
  Sliders,
  Check,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { sound } from '../utils/audio';

export const AdminDashboard: React.FC = () => {
  const { isAdminOpen, setIsAdminOpen, settings, updateSettings, resetToDefaultSettings } = useApp();

  const [soundEnabled, setSoundEnabled] = useState<boolean>(settings.soundEnabled);
  const [beeBuzzEnabled, setBeeBuzzEnabled] = useState<boolean>(settings.beeBuzzEnabled);
  const [popSoundEnabled, setPopSoundEnabled] = useState<boolean>(settings.popSoundEnabled);
  const [chimeSoundEnabled, setChimeSoundEnabled] = useState<boolean>(settings.chimeSoundEnabled);
  const [fanfareSoundEnabled, setFanfareSoundEnabled] = useState<boolean>(settings.fanfareSoundEnabled);

  if (!isAdminOpen) return null;

  const handleSave = () => {
    sound.playChime();
    updateSettings({
      soundEnabled,
      beeBuzzEnabled,
      popSoundEnabled,
      chimeSoundEnabled,
      fanfareSoundEnabled,
    });
    setIsAdminOpen(false);
  };

  const handleReset = () => {
    if (window.confirm('Set semula semua jawapan dan tetapan kepada lalai?')) {
      resetToDefaultSettings();
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
                <h3 className="text-lg font-black text-amber-950">Tetapan & Audio</h3>
                <p className="text-xs text-amber-700 font-semibold">Tekan [G] untuk buka/tutup</p>
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
            {/* Info */}
            <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-3.5 space-y-1">
              <span className="font-bold text-amber-950">Latihan Pemahaman Bahagian B</span>
              <p className="text-amber-800 leading-relaxed">
                Tugasan ini direka berasaskan Peperiksaan Sebenar Bahasa Melayu (Soalan 9 & Soalan 10). Ia menampilkan semakan kata kunci segera dan penilaian AI Guru bagi karangan pendek Soalan 10.
              </p>
            </div>

            {/* Sound FX Toggles */}
            <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-3.5 space-y-3">
              <div className="font-bold text-amber-950 flex items-center gap-1.5">
                <Volume2 className="w-4 h-4 text-amber-700" />
                <span>Kesan Bunyi & Audio:</span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs font-semibold">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={soundEnabled}
                    onChange={(e) => setSoundEnabled(e.target.checked)}
                    className="accent-amber-500 w-4 h-4 rounded cursor-pointer"
                  />
                  <span>Suara Induk</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={beeBuzzEnabled}
                    onChange={(e) => setBeeBuzzEnabled(e.target.checked)}
                    className="accent-amber-500 w-4 h-4 rounded cursor-pointer"
                  />
                  <span>Bung Lebah 🐝</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={chimeSoundEnabled}
                    onChange={(e) => setChimeSoundEnabled(e.target.checked)}
                    className="accent-amber-500 w-4 h-4 rounded cursor-pointer"
                  />
                  <span>Bunyi Betul</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={fanfareSoundEnabled}
                    onChange={(e) => setFanfareSoundEnabled(e.target.checked)}
                    className="accent-amber-500 w-4 h-4 rounded cursor-pointer"
                  />
                  <span>Keraian Fanfare</span>
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
              <span>Set Semula Lalai</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsAdminOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center gap-1.5 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Simpan Tetapan</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
