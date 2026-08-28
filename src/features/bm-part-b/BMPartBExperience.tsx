import React from 'react';
import { HoneycombBackground } from './components/HoneycombBackground';
import { MainScreen } from './components/MainScreen';
import { AdvertisementUpperScreen } from './components/AdvertisementUpperScreen';
import { AdminDashboard } from './components/AdminDashboard';
import { AppProvider, useApp } from './context/AppContext';

interface BMPartBExperienceProps {
  onExit: () => void;
}

function AppContent({ onExit }: BMPartBExperienceProps) {
  const { currentScreen, setCurrentScreen } = useApp();

  return (
    <HoneycombBackground>
      {currentScreen === 'home' ? (
        <MainScreen 
          onStart={() => setCurrentScreen('advertisements')} 
          onExit={onExit}
        />
      ) : (
        <AdvertisementUpperScreen onBack={() => setCurrentScreen('home')} />
      )}
      {/* Global Settings Modal [G] */}
      <AdminDashboard />
    </HoneycombBackground>
  );
}

export function BMPartBExperience({ onExit }: BMPartBExperienceProps) {
  return (
    <div className="fixed inset-0 z-[70] overflow-y-auto bg-[#FFFBEB]">
      <AppProvider>
        <AppContent onExit={onExit} />
      </AppProvider>
    </div>
  );
}
