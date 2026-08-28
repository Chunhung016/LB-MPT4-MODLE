import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { AppSettings, HotspotPoint, PuzzlePiece, ScreenState, BoxScreenConfig } from '../types';
import {
  DEFAULT_SETTINGS,
  loadSettings,
  saveSettings,
  PRESET_BOX_PICTURES,
} from '../utils/defaultSettings';
import { sound } from '../utils/audio';

interface AppContextType {
  settings: AppSettings;
  activeBoxScreen: BoxScreenConfig;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  resetSettings: () => void;
  importSettingsJSON: (jsonStr: string) => boolean;
  exportSettingsJSON: () => string;

  // Navigation state
  currentScreen: ScreenState;
  setCurrentScreen: (screen: ScreenState) => void;
  isAdminOpen: boolean;
  setIsAdminOpen: (open: boolean) => void;
  adminTab: 'boxes' | 'hotspots' | 'toggles' | 'info' | 'data';
  setAdminTab: (tab: 'boxes' | 'hotspots' | 'toggles' | 'info' | 'data') => void;

  // Hotspots helpers
  updateHotspotPoint: (id: string, updated: Partial<HotspotPoint>) => void;
  addHotspotPoint: (point?: Partial<HotspotPoint>) => void;
  removeHotspotPoint: (id: string) => void;

  // Box Screens (Next Screens) CRUD helpers
  activeBoxScreenIndex: number;
  setActiveBoxScreenIndex: (index: number) => void;
  addBoxScreen: (screenConfig?: Partial<BoxScreenConfig>) => string;
  duplicateBoxScreen: (screenId: string) => void;
  removeBoxScreen: (screenId: string) => void;
  updateBoxScreen: (screenId: string, updated: Partial<BoxScreenConfig>) => void;
  setBoxCountForScreen: (screenId: string, newCount: number) => void;
  updatePuzzlePieceForScreen: (
    screenId: string,
    pieceId: number,
    updated: Partial<PuzzlePiece>
  ) => void;
  addPuzzlePieceForScreen: (screenId: string) => void;
  removePuzzlePieceForScreen: (screenId: string, pieceId: number) => void;
  addCandidateBlankWordForScreen: (screenId: string, word: string) => void;
  removeCandidateBlankWordForScreen: (screenId: string, word: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettingsState] = useState<AppSettings>(loadSettings);
  const [currentScreen, setCurrentScreen] = useState<ScreenState>('hotspots');
  const [isAdminOpen, setIsAdminOpen] = useState<boolean>(false);
  const [adminTab, setAdminTab] = useState<'boxes' | 'hotspots' | 'toggles' | 'info' | 'data'>(
    'boxes'
  );

  // Sync sound settings to audio singleton whenever settings change
  useEffect(() => {
    sound.syncWithSettings(settings);
  }, [settings]);

  // Save to localStorage whenever settings state changes
  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  // Keyboard shortcut: Press 'G' or 'g' or 'Ctrl+Shift+A' to open Admin Dashboard
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing inside an input or textarea
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
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

  // Hotspots helper methods
  const updateHotspotPoint = useCallback((id: string, updated: Partial<HotspotPoint>) => {
    setSettingsState((prev) => ({
      ...prev,
      hotspots: prev.hotspots.map((p) => (p.id === id ? { ...p, ...updated } : p)),
    }));
  }, []);

  const addHotspotPoint = useCallback((point?: Partial<HotspotPoint>) => {
    const newId = `pt-${Date.now()}`;
    const newPoint: HotspotPoint = {
      id: newId,
      x: point?.x ?? 50,
      y: point?.y ?? 50,
      width: point?.width ?? 20,
      imageUrl: point?.imageUrl || 'https://i.postimg.cc/ZnZphXT9/image.png',
      actionWord: point?.actionWord || 'Aktiviti Baru',
      title: point?.title || `Aktiviti Baru`,
      description: point?.description || 'Penerangan tentang aktiviti di sekolah.',
    };

    setSettingsState((prev) => ({
      ...prev,
      hotspots: [...prev.hotspots, newPoint],
    }));
  }, []);

  const removeHotspotPoint = useCallback((id: string) => {
    setSettingsState((prev) => ({
      ...prev,
      hotspots: prev.hotspots.filter((p) => p.id !== id),
    }));
  }, []);

  // ---------------------------------------------------------------------------
  // Multiple Box Screens (Stages / Activities) Helpers
  // ---------------------------------------------------------------------------
  const activeBoxScreenIndex = useMemo(() => {
    if (!settings.boxScreens || settings.boxScreens.length === 0) return 0;
    return Math.max(0, Math.min(settings.activeBoxScreenIndex ?? 0, settings.boxScreens.length - 1));
  }, [settings.boxScreens, settings.activeBoxScreenIndex]);

  const activeBoxScreen = useMemo((): BoxScreenConfig => {
    if (!settings.boxScreens || settings.boxScreens.length === 0) {
      return {
        id: 'box-screen-default',
        title: 'Aktiviti 1: Susunan Gambar Karangan',
        boxCount: 3,
        puzzlePieces: [],
        candidateBlankWords: ['Ahad', 'sekolah', 'gotong-royong'],
        blankWordsCount: 3,
      };
    }
    return settings.boxScreens[activeBoxScreenIndex] || settings.boxScreens[0];
  }, [settings.boxScreens, activeBoxScreenIndex]);

  const setActiveBoxScreenIndex = useCallback((index: number) => {
    setSettingsState((prev) => ({
      ...prev,
      activeBoxScreenIndex: Math.max(0, Math.min(index, prev.boxScreens.length - 1)),
    }));
  }, []);

  // Add a new Box Screen / Stage
  const addBoxScreen = useCallback((screenConfig?: Partial<BoxScreenConfig>): string => {
    const newScreenId = `box-screen-${Date.now()}`;
    const screenIndex = settings.boxScreens.length + 1;

    // Generate initial 3 puzzle pieces with presets
    const initialPieces: PuzzlePiece[] = [
      {
        id: Date.now() + 1,
        targetBox: 1,
        imageUrl: PRESET_BOX_PICTURES[0]?.url || 'https://i.postimg.cc/zvb2KSSd/Chat-GPT-Image-2026nian8yue17ri-15-40-54-(1).png',
        altText: `Aktiviti ${screenIndex} - Gambar 1`,
        caption: 'Gambar 1',
        sentence: `Pada waktu pagi, semua murid bersedia untuk menjalankan tugas.`,
      },
      {
        id: Date.now() + 2,
        targetBox: 2,
        imageUrl: PRESET_BOX_PICTURES[1]?.url || 'https://i.postimg.cc/d3rXgjkL/Chat-GPT-Image-2026nian8yue17ri-15-40-54-(2).png',
        altText: `Aktiviti ${screenIndex} - Gambar 2`,
        caption: 'Gambar 2',
        sentence: `Mereka bekerjasama dengan penuh semangat dan ceria.`,
      },
      {
        id: Date.now() + 3,
        targetBox: 3,
        imageUrl: PRESET_BOX_PICTURES[2]?.url || 'https://i.postimg.cc/NjMDHxs9/Chat-GPT-Image-2026nian8yue17ri-15-40-54-(3).png',
        altText: `Aktiviti ${screenIndex} - Gambar 3`,
        caption: 'Gambar 3',
        sentence: `Kawasan sekolah akhirnya kelihatan sangat bersih dan kemas.`,
      },
    ];

    const newScreen: BoxScreenConfig = {
      id: newScreenId,
      title: screenConfig?.title || `Aktiviti ${screenIndex}: Bahagian Karangan Baru`,
      description: screenConfig?.description || `Paparan susun kotak aktiviti ${screenIndex}.`,
      boxCount: screenConfig?.boxCount || 3,
      puzzlePieces: screenConfig?.puzzlePieces || initialPieces,
      candidateBlankWords: screenConfig?.candidateBlankWords || ['pagi', 'murid', 'bekerjasama', 'bersih', 'kemas'],
      blankWordsCount: screenConfig?.blankWordsCount || 3,
    };

    setSettingsState((prev) => ({
      ...prev,
      boxScreens: [...prev.boxScreens, newScreen],
      activeBoxScreenIndex: prev.boxScreens.length, // switch to newly created screen
    }));

    sound.playChime();
    return newScreenId;
  }, [settings.boxScreens.length]);

  // Duplicate an existing Box Screen
  const duplicateBoxScreen = useCallback((screenId: string) => {
    setSettingsState((prev) => {
      const target = prev.boxScreens.find((s) => s.id === screenId);
      if (!target) return prev;

      const duplicatedId = `box-screen-${Date.now()}`;
      const duplicatedPieces = target.puzzlePieces.map((p, idx) => ({
        ...p,
        id: Date.now() + idx + 1,
      }));

      const duplicatedScreen: BoxScreenConfig = {
        ...target,
        id: duplicatedId,
        title: `${target.title} (Salinan)`,
        puzzlePieces: duplicatedPieces,
      };

      const newScreens = [...prev.boxScreens, duplicatedScreen];
      return {
        ...prev,
        boxScreens: newScreens,
        activeBoxScreenIndex: newScreens.length - 1,
      };
    });
    sound.playChime();
  }, []);

  // Remove a Box Screen (keep at least 1)
  const removeBoxScreen = useCallback((screenId: string) => {
    setSettingsState((prev) => {
      if (prev.boxScreens.length <= 1) {
        sound.playWrong();
        return prev;
      }
      const filtered = prev.boxScreens.filter((s) => s.id !== screenId);
      const newActive = Math.max(0, Math.min(prev.activeBoxScreenIndex, filtered.length - 1));
      return {
        ...prev,
        boxScreens: filtered,
        activeBoxScreenIndex: newActive,
      };
    });
    sound.playPop();
  }, []);

  // Update a Box Screen's config
  const updateBoxScreen = useCallback((screenId: string, updated: Partial<BoxScreenConfig>) => {
    setSettingsState((prev) => ({
      ...prev,
      boxScreens: prev.boxScreens.map((s) => (s.id === screenId ? { ...s, ...updated } : s)),
    }));
  }, []);

  // Change Box Count for a specific screen (adjusts pieces array)
  const setBoxCountForScreen = useCallback((screenId: string, newCount: number) => {
    const clampedCount = Math.max(2, Math.min(6, newCount));

    setSettingsState((prev) => {
      const screen = prev.boxScreens.find((s) => s.id === screenId);
      if (!screen) return prev;

      let currentPieces = [...screen.puzzlePieces];

      // If expanding count, add missing pieces
      if (currentPieces.length < clampedCount) {
        for (let i = currentPieces.length + 1; i <= clampedCount; i++) {
          const presetIdx = (i - 1) % PRESET_BOX_PICTURES.length;
          currentPieces.push({
            id: Date.now() + i,
            targetBox: i,
            imageUrl:
              PRESET_BOX_PICTURES[presetIdx]?.url ||
              'https://i.postimg.cc/zvb2KSSd/Chat-GPT-Image-2026nian8yue17ri-15-40-54-(1).png',
            altText: `Gambar Aktiviti ${i}`,
            caption: `Gambar ${i}`,
            sentence: `Seterusnya, aktiviti bahagian ${i} dijalankan dengan teratur dan lancar.`,
          });
        }
      }

      const updatedScreens = prev.boxScreens.map((s) => {
        if (s.id === screenId) {
          return {
            ...s,
            boxCount: clampedCount,
            puzzlePieces: currentPieces,
          };
        }
        return s;
      });

      return {
        ...prev,
        boxScreens: updatedScreens,
      };
    });
  }, []);

  // Update a specific puzzle piece on a specific screen
  const updatePuzzlePieceForScreen = useCallback(
    (screenId: string, pieceId: number, updated: Partial<PuzzlePiece>) => {
      setSettingsState((prev) => {
        const updatedScreens = prev.boxScreens.map((s) => {
          if (s.id === screenId) {
            return {
              ...s,
              puzzlePieces: s.puzzlePieces.map((p) =>
                p.id === pieceId ? { ...p, ...updated } : p
              ),
            };
          }
          return s;
        });
        return { ...prev, boxScreens: updatedScreens };
      });
    },
    []
  );

  const addPuzzlePieceForScreen = useCallback((screenId: string) => {
    setSettingsState((prev) => {
      const screen = prev.boxScreens.find((s) => s.id === screenId);
      if (!screen) return prev;
      if (screen.boxCount >= 6) return prev;

      const newBoxCount = screen.boxCount + 1;
      const presetIdx = (newBoxCount - 1) % PRESET_BOX_PICTURES.length;

      const newPiece: PuzzlePiece = {
        id: Date.now(),
        targetBox: newBoxCount,
        imageUrl:
          PRESET_BOX_PICTURES[presetIdx]?.url ||
          'https://i.postimg.cc/zvb2KSSd/Chat-GPT-Image-2026nian8yue17ri-15-40-54-(1).png',
        altText: `Gambar Aktiviti ${newBoxCount}`,
        caption: `Gambar ${newBoxCount}`,
        sentence: `Bahagian ${newBoxCount} menceriakan suasana aktiviti di sekolah.`,
      };

      const updatedScreens = prev.boxScreens.map((s) => {
        if (s.id === screenId) {
          return {
            ...s,
            boxCount: newBoxCount,
            puzzlePieces: [...s.puzzlePieces, newPiece],
          };
        }
        return s;
      });

      return { ...prev, boxScreens: updatedScreens };
    });
  }, []);

  const removePuzzlePieceForScreen = useCallback((screenId: string, pieceId: number) => {
    setSettingsState((prev) => {
      const screen = prev.boxScreens.find((s) => s.id === screenId);
      if (!screen) return prev;
      if (screen.boxCount <= 2) return prev;

      const newPieces = screen.puzzlePieces.filter((p) => p.id !== pieceId);
      // Re-index targetBox numbers sequentially 1..N
      const reindexedPieces = newPieces.map((p, idx) => ({
        ...p,
        targetBox: idx + 1,
        caption: p.caption.startsWith('Gambar') ? `Gambar ${idx + 1}` : p.caption,
      }));

      const updatedScreens = prev.boxScreens.map((s) => {
        if (s.id === screenId) {
          return {
            ...s,
            boxCount: reindexedPieces.length,
            puzzlePieces: reindexedPieces,
          };
        }
        return s;
      });

      return { ...prev, boxScreens: updatedScreens };
    });
  }, []);

  const addCandidateBlankWordForScreen = useCallback((screenId: string, word: string) => {
    const clean = word.trim();
    if (!clean) return;
    setSettingsState((prev) => {
      const updatedScreens = prev.boxScreens.map((s) => {
        if (s.id === screenId) {
          if (s.candidateBlankWords.includes(clean)) return s;
          return {
            ...s,
            candidateBlankWords: [...s.candidateBlankWords, clean],
          };
        }
        return s;
      });
      return { ...prev, boxScreens: updatedScreens };
    });
  }, []);

  const removeCandidateBlankWordForScreen = useCallback((screenId: string, word: string) => {
    setSettingsState((prev) => {
      const updatedScreens = prev.boxScreens.map((s) => {
        if (s.id === screenId) {
          return {
            ...s,
            candidateBlankWords: s.candidateBlankWords.filter((w) => w !== word),
          };
        }
        return s;
      });
      return { ...prev, boxScreens: updatedScreens };
    });
  }, []);

  const value = {
    settings,
    activeBoxScreen,
    updateSettings,
    resetSettings,
    importSettingsJSON,
    exportSettingsJSON,
    currentScreen,
    setCurrentScreen,
    isAdminOpen,
    setIsAdminOpen,
    adminTab,
    setAdminTab,
    updateHotspotPoint,
    addHotspotPoint,
    removeHotspotPoint,
    activeBoxScreenIndex,
    setActiveBoxScreenIndex,
    addBoxScreen,
    duplicateBoxScreen,
    removeBoxScreen,
    updateBoxScreen,
    setBoxCountForScreen,
    updatePuzzlePieceForScreen,
    addPuzzlePieceForScreen,
    removePuzzlePieceForScreen,
    addCandidateBlankWordForScreen,
    removeCandidateBlankWordForScreen,
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
