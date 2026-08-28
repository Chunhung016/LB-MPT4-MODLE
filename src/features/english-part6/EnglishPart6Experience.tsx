import { AdminDashboard } from './components/AdminDashboard';
import { HoneycombBackground } from './components/HoneycombBackground';
import { HealthBoxesScreen } from './components/HealthBoxesScreen';
import { AppProvider } from './context/AppContext';
import { sound } from './utils/audio';

interface EnglishPart6ExperienceProps {
  onExit: () => void;
}

function EnglishPart6Content({ onExit }: EnglishPart6ExperienceProps) {
  return (
    <HoneycombBackground>
      <div className="relative flex-1 overflow-hidden flex flex-col w-full h-full">
        <HealthBoxesScreen onBack={() => {
          sound.playPop();
          onExit();
        }} />
      </div>

      <AdminDashboard />
    </HoneycombBackground>
  );
}

export function EnglishPart6Experience({ onExit }: EnglishPart6ExperienceProps) {
  return (
    <div className="fixed inset-0 z-[70] overflow-y-auto bg-[#FFFBEB]">
      <AppProvider>
        <EnglishPart6Content onExit={onExit} />
      </AppProvider>
    </div>
  );
}
