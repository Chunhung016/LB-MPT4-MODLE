import { ArrowLeft } from 'lucide-react';
import { AdminDashboard } from './components/AdminDashboard';
import { AdvertisementUpperScreen } from './components/AdvertisementUpperScreen';
import { HoneycombBackground } from './components/HoneycombBackground';
import { MainScreen } from './components/MainScreen';
import { AppProvider, useApp } from './context/AppContext';
import { sound } from './utils/audio';

interface EnglishPart3ExperienceProps {
  onExit: () => void;
}

function EnglishPart3Content({ onExit }: EnglishPart3ExperienceProps) {
  const { currentScreen, setCurrentScreen } = useApp();

  return (
    <HoneycombBackground>
      <button
        id="english-part3-exit"
        type="button"
        onClick={() => {
          sound.playPop();
          onExit();
        }}
        className="fixed left-3 top-3 z-[85] flex cursor-pointer items-center gap-1.5 rounded-full border-2 border-[#78350F] bg-white/95 px-3 py-2 text-xs font-black text-[#78350F] shadow-[2px_2px_0_#78350F] backdrop-blur-md transition-transform active:translate-y-0.5 sm:left-5 sm:top-5 sm:px-4 sm:text-sm"
        aria-label="Back to English parts"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>English Parts</span>
      </button>

      {currentScreen === 'home' ? (
        <MainScreen onStart={() => setCurrentScreen('advertisements')} />
      ) : (
        <AdvertisementUpperScreen onBack={() => setCurrentScreen('home')} />
      )}

      <AdminDashboard />
    </HoneycombBackground>
  );
}

export function EnglishPart3Experience({ onExit }: EnglishPart3ExperienceProps) {
  return (
    <div className="fixed inset-0 z-[70] overflow-y-auto bg-[#FFFBEB]">
      <AppProvider>
        <EnglishPart3Content onExit={onExit} />
      </AppProvider>
    </div>
  );
}
