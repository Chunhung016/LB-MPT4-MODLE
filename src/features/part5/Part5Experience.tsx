import { AnimatePresence, motion } from 'motion/react';
import { AdminDashboard } from './components/AdminDashboard';
import { HoneycombBackground } from './components/HoneycombBackground';
import { MistakeBookScreen } from './components/MistakeBookScreen';
import { ModeSelectionScreen } from './components/ModeSelectionScreen';
import { Screen2 } from './components/Screen2';
import { Screen3 } from './components/Screen3';
import { AppProvider, useApp } from './context/AppContext';

interface SpellingBeeExperienceProps {
  onExit: () => void;
}

function SpellingBeeContent({ onExit }: SpellingBeeExperienceProps) {
  const {
    currentScreen,
    setCurrentScreen,
    setIsPracticingMistakes,
    setActiveMistakeWordIndex,
    isPracticingMistakes,
  } = useApp();

  return (
    <HoneycombBackground>
      <div className="relative flex flex-1 flex-col overflow-hidden">
        <AnimatePresence mode="wait">
          {currentScreen === 'menu' && (
            <motion.div
              key="menu"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="flex flex-1 flex-col"
            >
              <ModeSelectionScreen
                onBack={onExit}
                onSelectPractice={() => {
                  setIsPracticingMistakes(false);
                  setCurrentScreen('screen2');
                }}
                onSelectMistakeBook={() => setCurrentScreen('mistake_book')}
              />
            </motion.div>
          )}

          {currentScreen === 'mistake_book' && (
            <motion.div
              key="mistake_book"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.35, ease: 'easeInOut' }}
              className="flex flex-1 flex-col"
            >
              <MistakeBookScreen
                onBack={() => setCurrentScreen('menu')}
                onStartMistakePractice={(mistakeIndex = 0) => {
                  setIsPracticingMistakes(true);
                  setActiveMistakeWordIndex(mistakeIndex);
                  setCurrentScreen('screen3');
                }}
              />
            </motion.div>
          )}

          {currentScreen === 'screen2' && (
            <motion.div
              key="screen2"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.35, ease: 'easeInOut' }}
              className="flex flex-1 flex-col"
            >
              <Screen2
                onBack={() => setCurrentScreen('menu')}
                onSelectTheme={() => {
                  setIsPracticingMistakes(false);
                  setCurrentScreen('screen3');
                }}
              />
            </motion.div>
          )}

          {currentScreen === 'screen3' && (
            <motion.div
              key="screen3"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 100 }}
              transition={{ duration: 0.35, ease: 'easeInOut' }}
              className="flex flex-1 flex-col"
            >
              <Screen3
                onBack={() => {
                  setCurrentScreen(isPracticingMistakes ? 'mistake_book' : 'screen2');
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AdminDashboard />
    </HoneycombBackground>
  );
}

export function SpellingBeeExperience({ onExit }: SpellingBeeExperienceProps) {
  return (
    <div className="fixed inset-0 z-[70] overflow-y-auto bg-[#FFFBEB]">
      <AppProvider initialScreen="menu">
        <SpellingBeeContent onExit={onExit} />
      </AppProvider>
    </div>
  );
}
