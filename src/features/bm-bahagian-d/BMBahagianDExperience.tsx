import React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { HoneycombBackground } from './components/HoneycombBackground';
import { HotspotScreen } from './components/HotspotScreen';
import { VerbExploreScreen } from './components/VerbExploreScreen';
import { StoryPuzzleScreen } from './components/StoryPuzzleScreen';
import { AdminDashboard } from './components/AdminDashboard';
import { AppProvider, useApp } from './context/AppContext';

function AppContent({ onExit }: { onExit: () => void }) {
  const { currentScreen, setCurrentScreen } = useApp();

  const renderActiveScreen = () => {
    switch (currentScreen) {
      case 'hotspots':
        return (
          <motion.div
            key="screen-hotspots"
            initial={{ opacity: 0, x: -25 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 25 }}
            transition={{ duration: 0.35 }}
            className="flex-1 flex flex-col"
          >
            <HotspotScreen
              onNext={() => setCurrentScreen('verbs')}
              onBack={onExit}
            />
          </motion.div>
        );
      case 'verbs':
        return (
          <motion.div
            key="screen-verbs"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.35 }}
            className="flex-1 flex flex-col"
          >
            <VerbExploreScreen
              onNext={() => setCurrentScreen('puzzle')}
              onBack={() => setCurrentScreen('hotspots')}
            />
          </motion.div>
        );
      case 'puzzle':
      default:
        return (
          <motion.div
            key="screen-puzzle"
            initial={{ opacity: 0, x: 25 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -25 }}
            transition={{ duration: 0.35 }}
            className="flex-1 flex flex-col"
          >
            <StoryPuzzleScreen
              onBack={() => setCurrentScreen('verbs')}
              onRestart={() => setCurrentScreen('hotspots')}
            />
          </motion.div>
        );
    }
  };

  return (
    <HoneycombBackground>
      <AnimatePresence mode="wait">
        {renderActiveScreen()}
      </AnimatePresence>

      {/* Global Admin Dashboard Modal */}
      <AdminDashboard />
    </HoneycombBackground>
  );
}

export function BMBahagianDExperience({ onExit }: { onExit: () => void }) {
  return (
    <AppProvider>
      <AppContent onExit={onExit} />
    </AppProvider>
  );
}
