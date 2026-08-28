import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AppSettings, AppScreen } from '../types';
import { DEFAULT_SETTINGS, loadSettings, saveSettings } from '../utils/defaultSettings';
import { sound } from '../utils/audio';

interface AppContextType {
  currentScreen: AppScreen;
  setCurrentScreen: (screen: AppScreen) => void;
  isAdminOpen: boolean;
  setIsAdminOpen: (open: boolean) => void;
  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  updatePosterImage: (url: string) => void;
  resetToDefaultSettings: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('home');
  const [isAdminOpen, setIsAdminOpen] = useState<boolean>(false);
  const [settings, setSettingsState] = useState<AppSettings>(loadSettings);

  // Sync sound settings to audio singleton whenever settings change
  useEffect(() => {
    sound.syncWithSettings(settings);
  }, [settings]);

  // Save to localStorage whenever settings state changes
  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  // Keyboard shortcut listener for admin settings modal: press 'g' or 'G'
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input or textarea
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target as HTMLElement).isContentEditable
      ) {
        return;
      }
      if (e.key === 'g' || e.key === 'G') {
        setIsAdminOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const updateSettings = useCallback((newPartial: Partial<AppSettings>) => {
    setSettingsState((prev) => ({
      ...prev,
      ...newPartial,
    }));
  }, []);

  const updatePosterImage = useCallback((url: string) => {
    setSettingsState((prev) => ({
      ...prev,
      passage: {
        ...prev.passage,
        imageUrl: url,
      },
    }));
  }, []);

  const resetToDefaultSettings = useCallback(() => {
    setSettingsState(DEFAULT_SETTINGS);
    saveSettings(DEFAULT_SETTINGS);
  }, []);

  const value = {
    currentScreen,
    setCurrentScreen,
    isAdminOpen,
    setIsAdminOpen,
    settings,
    updateSettings,
    updatePosterImage,
    resetToDefaultSettings,
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
