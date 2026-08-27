import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AppSettings, ScreenState } from '../types';
import { DEFAULT_SETTINGS, loadSettings, saveSettings } from '../utils/defaultSettings';
import { sound } from '../utils/audio';
import {
  MistakeRecord,
  loadMistakes,
  addOrUpdateMistake as addMistakeHelper,
  markMistakeMastered as markMistakeMasteredHelper,
  removeMistake as removeMistakeHelper,
  clearAllMistakes as clearMistakesHelper,
} from '../utils/mistakeStore';
import { SpellingWord } from '../data/theme1Words';

interface AppContextType {
  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  resetSettings: () => void;
  importSettingsJSON: (jsonStr: string) => boolean;
  exportSettingsJSON: () => string;

  currentScreen: ScreenState;
  setCurrentScreen: (screen: ScreenState) => void;
  selectedThemeId: number;
  setSelectedThemeId: (id: number) => void;
  isAdminOpen: boolean;
  setIsAdminOpen: (open: boolean | ((prev: boolean) => boolean)) => void;

  // Mistake Book state and actions
  mistakes: MistakeRecord[];
  activeMistakeWordIndex: number;
  setActiveMistakeWordIndex: (idx: number) => void;
  isPracticingMistakes: boolean;
  setIsPracticingMistakes: (val: boolean) => void;
  recordMistake: (
    word: SpellingWord,
    themeId: number,
    themeName: string,
    themeTitle: string,
    failReason: 'wrong_spelling' | 'time_out',
    studentAttempt?: string
  ) => void;
  markWordMastered: (wordText: string) => void;
  deleteMistake: (id: string) => void;
  clearMistakes: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{
  children: React.ReactNode;
  initialScreen?: ScreenState;
}> = ({ children, initialScreen = 'menu' }) => {
  const [settings, setSettingsState] = useState<AppSettings>(loadSettings);
  const [currentScreen, setCurrentScreen] = useState<ScreenState>(initialScreen);
  const [selectedThemeId, setSelectedThemeId] = useState<number>(2); // Default to Theme 2: My week
  const [isAdminOpen, setIsAdminOpen] = useState<boolean>(false);

  // Mistake records state
  const [mistakes, setMistakes] = useState<MistakeRecord[]>(loadMistakes);
  const [activeMistakeWordIndex, setActiveMistakeWordIndex] = useState<number>(0);
  const [isPracticingMistakes, setIsPracticingMistakes] = useState<boolean>(false);

  // Sync sound settings to audio singleton whenever settings change
  useEffect(() => {
    sound.syncWithSettings(settings);
  }, [settings]);

  // Save to localStorage whenever settings state changes
  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  const recordMistake = useCallback(
    (
      word: SpellingWord,
      themeId: number,
      themeName: string,
      themeTitle: string,
      failReason: 'wrong_spelling' | 'time_out',
      studentAttempt?: string
    ) => {
      const updated = addMistakeHelper(word, themeId, themeName, themeTitle, failReason, studentAttempt);
      setMistakes(updated);
    },
    []
  );

  const markWordMastered = useCallback((wordText: string) => {
    const updated = markMistakeMasteredHelper(wordText);
    setMistakes(updated);
  }, []);

  const deleteMistake = useCallback((id: string) => {
    const updated = removeMistakeHelper(id);
    setMistakes(updated);
  }, []);

  const clearMistakes = useCallback(() => {
    clearMistakesHelper();
    setMistakes([]);
  }, []);

  // Keyboard shortcut: Press '1' to toggle System Settings
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing inside an active visible input or textarea
      const target = e.target as HTMLElement;
      if (
        (target.tagName === 'INPUT' && !target.classList.contains('opacity-0')) ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      if (e.key === '1') {
        setIsAdminOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const updateSettings = useCallback((newPartial: Partial<AppSettings>) => {
    setSettingsState((prev) => {
      const next = { ...prev, ...newPartial };
      return next;
    });
  }, []);

  const resetSettings = useCallback(() => {
    setSettingsState(DEFAULT_SETTINGS);
    sound.playPop();
  }, []);

  const importSettingsJSON = useCallback((jsonStr: string): boolean => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (parsed && typeof parsed === 'object') {
        setSettingsState((prev) => ({
          ...prev,
          ...parsed,
        }));
        sound.playChime();
        return true;
      }
    } catch (err) {
      console.error('Failed to import JSON', err);
    }
    sound.playWrong();
    return false;
  }, []);

  const exportSettingsJSON = useCallback((): string => {
    return JSON.stringify(settings, null, 2);
  }, [settings]);

  const value = {
    settings,
    updateSettings,
    resetSettings,
    importSettingsJSON,
    exportSettingsJSON,
    currentScreen,
    setCurrentScreen,
    selectedThemeId,
    setSelectedThemeId,
    isAdminOpen,
    setIsAdminOpen,
    mistakes,
    activeMistakeWordIndex,
    setActiveMistakeWordIndex,
    isPracticingMistakes,
    setIsPracticingMistakes,
    recordMistake,
    markWordMastered,
    deleteMistake,
    clearMistakes,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
