import { ArrowLeft } from 'lucide-react';
import { AdminDashboard } from './components/AdminDashboard';
import { HoneycombBackground } from './components/HoneycombBackground';
import { HealthBoxesScreen } from './components/HealthBoxesScreen';
import { AppProvider } from './context/AppContext';
import { sound } from './utils/audio';

interface BMPartCExperienceProps {
  onExit: () => void;
}

function BMPartCContent({ onExit }: BMPartCExperienceProps) {
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

export function BMPartCExperience({ onExit }: BMPartCExperienceProps) {
  return (
    <div className="fixed inset-0 z-[70] overflow-y-auto bg-[#FFFBEB]">
      <AppProvider>
        <BMPartCContent onExit={onExit} />
      </AppProvider>
    </div>
  );
}
