import React from 'react';
import { motion } from 'motion/react';
import { Play, Volume2, VolumeX, Star, HelpCircle, Sliders } from 'lucide-react';
import { BeeMascot } from './BeeMascot';
import { sound } from '../utils/audio';
import { useApp } from '../context/AppContext';

interface MainScreenProps {
  onStart: () => void;
}

export const MainScreen: React.FC<MainScreenProps> = ({ onStart }) => {
  const { settings, activeBoxScreen, updateSettings, setIsAdminOpen, setAdminTab } = useApp();
  const [showGuide, setShowGuide] = React.useState(false);

  const handleToggleMute = () => {
    const isMuted = sound.toggleMute();
    updateSettings({ soundEnabled: !isMuted });
    if (!isMuted) {
      sound.playPop();
    }
  };

  const handleStart = () => {
    sound.playPop();
    sound.playBeeBuzz();
    onStart();
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Header Bar */}
      <header className="h-16 flex items-center justify-between px-4 sm:px-8 md:px-10 bg-white border-b-4 border-[#F59E0B] z-10 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#F59E0B] rounded-full flex items-center justify-center border-2 border-[#78350F] shadow-sm">
            <div className="w-6 h-4 bg-black rounded-full relative">
              <div className="absolute -top-1 -left-1 w-2.5 h-2.5 bg-white rounded-full opacity-60"></div>
            </div>
          </div>
          <span className="text-lg sm:text-2xl font-black text-[#78350F] uppercase tracking-tight">
            {settings.moduleBadge}: {settings.appName}
          </span>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden md:flex px-4 py-1.5 bg-[#FEF3C7] rounded-full border-2 border-[#F59E0B] text-[#B45309] font-bold text-xs sm:text-sm">
            Modul: {settings.subModuleBadge}
          </div>

          <button
            id="btn-admin-dashboard-header"
            onClick={() => {
              setAdminTab('boxes');
              setIsAdminOpen(true);
              sound.playPop();
            }}
            className="px-3 sm:px-4 py-1.5 bg-[#FEF3C7] hover:bg-[#FDE68A] rounded-full border-2 border-[#78350F] text-[#78350F] font-black text-xs sm:text-sm shadow-[2px_2px_0px_#78350F] transition-all flex items-center gap-1.5 cursor-pointer"
            title="Buka Pusat Kawalan & Tetapan Admin [G]"
          >
            <Sliders className="w-4 h-4 text-[#B45309]" />
            <span className="hidden sm:inline">Admin</span>
            <span>[G]</span>
          </button>

          <button
            id="btn-guide"
            onClick={() => {
              sound.playPop();
              setShowGuide(!showGuide);
            }}
            className="px-3 sm:px-4 py-1.5 bg-white rounded-full border-2 border-[#78350F] text-[#78350F] font-bold text-xs sm:text-sm shadow-[2px_2px_0px_#78350F] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_#78350F] transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <HelpCircle className="w-4 h-4 text-[#B45309]" />
            <span>Panduan</span>
          </button>

          <button
            id="btn-sound-toggle"
            onClick={handleToggleMute}
            className="p-1.5 sm:p-2 bg-white rounded-full border-2 border-[#78350F] text-[#78350F] shadow-[2px_2px_0px_#78350F] transition-all hover:bg-[#FEF3C7] cursor-pointer"
            title={settings.soundEnabled ? 'Senyapkan Bunyi' : 'Buka Bunyi'}
          >
            {!settings.soundEnabled ? (
              <VolumeX className="w-4 h-4 text-slate-500" />
            ) : (
              <Volume2 className="w-4 h-4 text-[#B45309]" />
            )}
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8 md:p-12 max-w-5xl mx-auto w-full">
        {/* Guide Modal Card */}
        {showGuide && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-lg mb-6 bg-white border-4 border-[#78350F] rounded-2xl p-5 shadow-[6px_6px_0px_#FDE68A] text-left relative z-20"
          >
            <div className="flex justify-between items-center mb-3 border-b-2 border-[#FDE68A] pb-2">
              <h3 className="font-black text-[#78350F] flex items-center gap-2 text-base">
                <Star className="w-5 h-5 text-[#F59E0B] fill-[#F59E0B]" />
                Langkah Aktiviti Pembelajaran:
              </h3>
              <button
                onClick={() => setShowGuide(false)}
                className="text-[#78350F] hover:bg-[#FEF3C7] w-6 h-6 rounded-full flex items-center justify-center text-sm font-black border border-[#78350F] cursor-pointer"
              >
                ✕
              </button>
            </div>
            <ol className="text-xs sm:text-sm text-[#78350F] space-y-2 list-decimal list-inside font-bold">
              <li>
                <strong className="text-[#B45309]">Langkah 1:</strong> {settings.guideStep1}
              </li>
              <li>
                <strong className="text-[#B45309]">Langkah 2:</strong> {settings.guideStep2}
              </li>
              <li>
                <strong className="text-[#B45309]">Langkah 3:</strong> {settings.guideStep3}
              </li>
            </ol>
            <div className="mt-3 p-2 bg-[#FEF3C7] rounded-xl border border-[#F59E0B] text-xs font-bold text-[#B45309] flex items-center justify-between">
              <span>💡 Tip Admin: Tekan kekunci <strong>&quot;G&quot;</strong> pada bila-bila masa untuk menguruskan sistem!</span>
              <button
                onClick={() => {
                  setIsAdminOpen(true);
                  setShowGuide(false);
                }}
                className="underline font-black text-[#78350F] ml-2 shrink-0"
              >
                Buka Admin ➔
              </button>
            </div>
          </motion.div>
        )}

        {/* Geometric Hero Container */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full bg-white rounded-3xl border-4 border-[#78350F] shadow-[8px_8px_0px_#FDE68A] p-6 sm:p-10 md:p-14 text-center relative overflow-hidden flex flex-col items-center"
        >
          {/* Top Geometric Accent Stripe */}
          <div className="absolute top-0 inset-x-0 h-3 bg-[#F59E0B] border-b-2 border-[#78350F]" />

          {/* Bee Mascot Display */}
          {settings.showMascot && (
            <div className="mt-4 mb-4 flex items-center justify-center gap-4">
              <BeeMascot
                size={120}
                speechBubble={settings.mascotGreeting || 'Mari Belajar Bersama! 🐝'}
                expression="excited"
              />
            </div>
          )}

          {/* Bahagian D Pill */}
          <div className="inline-block bg-[#FEF3C7] border-2 border-[#F59E0B] text-[#B45309] font-black px-6 py-1.5 rounded-full text-sm sm:text-lg uppercase tracking-wider mb-3 shadow-[2px_2px_0px_#F59E0B]">
            {settings.moduleBadge}
          </div>

          {/* Main Title */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-[#78350F] uppercase tracking-tight leading-tight mb-4 font-sans drop-shadow-xs">
            {settings.appName}
          </h1>

          <p className="text-sm sm:text-base md:text-lg text-[#B45309] font-bold max-w-xl mb-8">
            {settings.appSubtitle}
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <motion.button
              id="btn-start-game"
              onClick={handleStart}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="group inline-flex items-center justify-center gap-3 bg-[#F59E0B] hover:bg-[#D97706] text-[#78350F] font-black text-lg sm:text-2xl px-10 sm:px-14 py-4 sm:py-5 rounded-2xl border-4 border-[#78350F] shadow-[6px_6px_0px_#78350F] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_#78350F] transition-all cursor-pointer uppercase tracking-wide"
            >
              <Play className="w-6 h-6 sm:w-8 sm:h-8 fill-[#78350F] text-[#78350F]" />
              <span>
                Mula Belajar ({settings.boxScreens.length > 1 ? `${settings.boxScreens.length} Aktiviti` : `${activeBoxScreen.boxCount} Gambar`})
              </span>
              <span className="text-2xl">🐝</span>
            </motion.button>
          </div>
        </motion.div>
      </main>
    </div>
  );
};
