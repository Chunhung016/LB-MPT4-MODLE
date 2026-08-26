import { motion, AnimatePresence } from 'motion/react';
import { 
  QrCode, 
  ArrowLeft, 
  Sparkles, 
  Lock
} from 'lucide-react';
import { RegisteredModule } from '../types';
import PeacefulBeeBackground from './PeacefulBeeBackground';
import { playBubbleSound } from '../utils/audio';

interface SecondScreenProps {
  onBackToHome: () => void;
  onOpenQRScanner: () => void;
  onSelectModule: (module: RegisteredModule) => void;
  registeredModules: RegisteredModule[];
  isScannerEnabled: boolean;
  isModulesButtonEnabled: boolean;
}

export default function SecondScreen({
  onBackToHome,
  onOpenQRScanner,
  onSelectModule,
  registeredModules,
  isScannerEnabled,
  isModulesButtonEnabled,
}: SecondScreenProps) {
  // Filter modules that are enabled
  const activeModules = registeredModules.filter((m) => m.enabled !== false);

  const handleModuleClick = (module: RegisteredModule) => {
    if (!isModulesButtonEnabled) return;
    playBubbleSound();
    onSelectModule(module);
  };

  return (
    <main 
      id="second-screen-view"
      className="relative min-h-screen w-full flex flex-col justify-between p-6 sm:p-10 select-none overflow-hidden bg-[#FFFBEB]"
    >
      <PeacefulBeeBackground />

      {/* TOP BAR: Left Back Button + Right QR Scanner Button */}
      <div className="w-full flex items-center justify-between z-20">
        {/* Back to Home Button */}
        <button
          id="back-to-home-btn"
          onClick={() => {
            playBubbleSound();
            onBackToHome();
          }}
          className="group flex items-center gap-2 px-4 py-2 rounded-full bg-white/90 hover:bg-white border-2 border-[#FEF3C7] shadow-sm text-[#78350F] font-bold text-xs sm:text-sm font-['Fredoka',sans-serif] transition-all active:scale-95 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span>BACK</span>
        </button>

        {/* Right Corner: QR Scanner Button */}
        <button
          id="open-qr-scanner-btn"
          onClick={() => {
            playBubbleSound();
            onOpenQRScanner();
          }}
          disabled={!isScannerEnabled}
          className={`flex items-center gap-2.5 px-4 sm:px-5 py-2.5 rounded-full border-2 transition-all shadow-md active:scale-95 cursor-pointer ${
            isScannerEnabled
              ? 'bg-[#FBBF24] hover:bg-amber-300 border-[#FEF3C7] text-[#78350F]'
              : 'bg-slate-200 border-slate-300 text-slate-500 cursor-not-allowed opacity-70'
          }`}
          title={isScannerEnabled ? 'Scan Module QR' : 'QR Scanner disabled in Admin Settings'}
        >
          {isScannerEnabled ? (
            <>
              <QrCode className="w-4 h-4 sm:w-5 sm:h-5 text-[#78350F]" />
              <span className="font-bold text-xs sm:text-sm font-['Fredoka',sans-serif] tracking-wide uppercase">
                SCAN QR MODULE
              </span>
            </>
          ) : (
            <>
              <Lock className="w-4 h-4" />
              <span className="font-bold text-xs sm:text-sm font-['Fredoka',sans-serif] tracking-wide uppercase">
                SCANNER LOCKED
              </span>
            </>
          )}
        </button>
      </div>

      {/* MIDDLE CONTAINER: Registered Modules Bubbly Buttons aligned neatly in centre horizontally */}
      <div 
        id="second-screen-center"
        className="my-auto w-full max-w-5xl mx-auto flex flex-col items-center justify-center text-center z-10 py-8"
      >
        {activeModules.length === 0 ? (
          /* EMPTY STATE at first */
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center space-y-4 max-w-md p-8 rounded-3xl bg-white/40 border-2 border-dashed border-[#FDE68A] backdrop-blur-xs"
          >
            <div className="w-16 h-16 rounded-full bg-[#FEF3C7] border-2 border-[#FBBF24] flex items-center justify-center text-[#78350F] shadow-inner">
              <QrCode className="w-8 h-8 opacity-80" />
            </div>

            <div className="space-y-1">
              <h2 className="text-xl font-bold text-[#78350F] font-['Fredoka',sans-serif]">
                NO MODULE REGISTERED YET
              </h2>
              <p className="text-xs text-amber-900/80 leading-relaxed">
                Click the <strong className="font-bold text-[#78350F]">SCAN QR MODULE</strong> button at the top right corner to register Module 1 or Module 2, or release them from Admin settings (press 'S').
              </p>
            </div>
          </motion.div>
        ) : (
          /* REGISTERED MODULES BUBBLY BUTTONS ALLIGNED HORIZONTALLY IN CENTRE */
          <div className="space-y-8 flex flex-col items-center justify-center w-full">
            {!isModulesButtonEnabled && (
              <div className="px-3 py-1 rounded-full bg-amber-200/90 text-[#78350F] text-xs font-semibold flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5" /> Module Buttons Paused by Admin in Settings
              </div>
            )}

            <div 
              id="registered-modules-grid"
              className="flex flex-row flex-wrap items-center justify-center gap-8 sm:gap-14 md:gap-18"
            >
              <AnimatePresence>
                {activeModules.map((mod, idx) => (
                  <motion.div
                    key={mod.id}
                    id={`module-item-${mod.id}`}
                    initial={{ scale: 0, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{
                      type: 'spring',
                      damping: 15,
                      stiffness: 220,
                      delay: idx * 0.1,
                    }}
                    className="flex flex-col items-center justify-center group"
                  >
                    {/* BUBBLY BUBBLE BUTTON */}
                    <motion.button
                      id={`bubble-btn-${mod.id}`}
                      onClick={() => handleModuleClick(mod)}
                      disabled={!isModulesButtonEnabled}
                      whileHover={isModulesButtonEnabled ? { scale: 1.08, y: -4 } : {}}
                      whileTap={isModulesButtonEnabled ? { scale: 0.94 } : {}}
                      className={`relative flex items-center justify-center w-32 h-32 sm:w-36 sm:h-36 md:w-40 md:h-40 rounded-full bg-white border-[10px] sm:border-[12px] border-[#FEF3C7] shadow-[0_16px_40px_rgba(251,191,36,0.35)] transition-all duration-300 focus:outline-hidden focus-visible:ring-4 focus-visible:ring-[#FBBF24] ${
                        isModulesButtonEnabled ? 'cursor-pointer' : 'cursor-not-allowed opacity-75'
                      }`}
                      aria-label={`Open ${mod.name} Subjects`}
                    >
                      {/* Inner honey tint */}
                      <div className="absolute inset-0 bg-[#FBBF24] rounded-full scale-90 opacity-15 group-hover:scale-100 group-hover:opacity-25 transition-transform duration-300 pointer-events-none" />

                      {/* Glossy top-left bubble highlight */}
                      <div className="absolute top-2 left-3 w-10 h-5 rounded-full bg-gradient-to-b from-white/90 to-transparent rotate-[-25deg] pointer-events-none" />

                      {/* Play Triangle Icon */}
                      <div className="relative z-10 flex items-center justify-center ml-2">
                        <div className="w-0 h-0 border-t-[18px] sm:border-t-[22px] border-t-transparent border-l-[32px] sm:border-l-[40px] border-l-[#78350F] border-b-[18px] sm:border-b-[22px] border-b-transparent drop-shadow-xs" />
                      </div>

                      {/* Sparkle badge */}
                      <div className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-[#FBBF24] border-2 border-white flex items-center justify-center text-[#78350F] shadow-xs">
                        <Sparkles className="w-3.5 h-3.5" />
                      </div>
                    </motion.button>

                    {/* NAME LABEL UNDER THE BUBBLY BUTTON */}
                    <div className="mt-4 flex flex-col items-center">
                      <span 
                        id={`module-label-${mod.id}`}
                        className="text-lg sm:text-xl md:text-2xl font-black text-[#78350F] font-['Fredoka',sans-serif] tracking-wider uppercase drop-shadow-xs"
                      >
                        {mod.name}
                      </span>
                      <span className="text-[11px] text-amber-900/70 font-semibold mt-0.5">
                        Tap for 5 Subjects
                      </span>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>

      {/* BOTTOM FOOTER / ACCENT */}
      <div className="w-full flex items-center justify-between z-10 text-[11px] text-amber-900/60 font-semibold px-2">
        <span>LITTLE BEE MPT4 MODULE SYSTEM @2026</span>
        <div className="flex space-x-2 items-center">
          <div className="w-2.5 h-2.5 bg-[#FBBF24] rounded-full" />
          <div className="w-2.5 h-2.5 bg-[#FDE68A] rounded-full" />
          <div className="w-2.5 h-2.5 bg-[#FEF3C7] rounded-full" />
        </div>
      </div>
    </main>
  );
}
