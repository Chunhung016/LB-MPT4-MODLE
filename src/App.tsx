import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import PeacefulBeeBackground from './components/PeacefulBeeBackground';
import PlayBubbleButton from './components/PlayBubbleButton';
import LogicSettingsModal from './components/LogicSettingsModal';
import SecondScreen from './components/SecondScreen';
import SubjectSelectionScreen from './components/SubjectSelectionScreen';
import QRScannerModal from './components/QRScannerModal';
import { LogicConfig, RegisteredModule } from './types';
import AdminPortal from './components/AdminPortal';

const DEFAULT_CONFIG: LogicConfig = {
  systemVersion: 'MPT4-2026.1.0',
  updateChannel: 'stable-2026',
  autoUpdateFeatures: true,
  soundEffects: true,
  bubblePhysics: true,
  bloomEffects: true,
  adaptiveLevel: 'grade-1',
  qrScannerEnabled: true,
  modulesButtonEnabled: true,
  registeredModules: [],
  featureToggles: [
    {
      id: 'feat_ai_phonics',
      name: 'AI Interactive Phonics Voice Engine',
      category: 'audio',
      description: 'Generative interactive phonics feedback tailored for elementary learners.',
      enabled: true,
      targetVersion: 'MPT4-2026.2',
      logicRule: 'trigger_on_voice_input',
    },
    {
      id: 'feat_classroom_sync',
      name: 'Smart Classroom Multi-Desk Sync',
      category: 'sync',
      description: 'Real-time peer-to-peer lesson state sync for classroom learning pods.',
      enabled: false,
      targetVersion: 'MPT4-2026.3',
      logicRule: 'network_broadcast_udp',
    },
    {
      id: 'feat_honey_rewards',
      name: 'Honey Drops Adaptive Reward Pipeline',
      category: 'pedagogy',
      description: 'Dynamic difficulty scaling granting honeycomb badges upon concept mastery.',
      enabled: true,
      targetVersion: 'MPT4-2026.1',
      logicRule: 'evaluate_accuracy_gt_85',
    },
    {
      id: 'feat_tactile_spelling',
      name: 'Tactile Gesture Spelling Canvas',
      category: 'experimental',
      description: 'Next-gen touch tracing handwriting evaluation logic.',
      enabled: false,
      targetVersion: 'MPT4-2026.4',
      logicRule: 'canvas_stroke_vector_eval',
    },
  ],
  customUpdateRules: JSON.stringify(
    {
      module: 'LITTLE_BEE_MPT4_2026',
      channel: 'production',
      features_pipeline: {
        auto_migrate_local_state: true,
        background_ota_fetch: true,
        verification_hash: 'SHA256:BEE-MPT4-2026-STABLE',
        feature_flags_endpoint: 'https://updates.littlebee.module/v1/mpt4/manifest.json',
      },
    },
    null,
    2
  ),
};

export default function App() {
  if (window.location.pathname.replace(/\/+$/, '') === '/admin') {
    return <AdminPortal />;
  }

  const [currentScreen, setCurrentScreen] = useState<'home' | 'secondScreen' | 'subjects'>('home');
  const [activeSelectedModule, setActiveSelectedModule] = useState<RegisteredModule | null>(null);
  const [isQRScannerOpen, setIsQRScannerOpen] = useState(false);
  const [isLogicSettingsOpen, setIsLogicSettingsOpen] = useState(false);
  const [config, setConfig] = useState<LogicConfig>(() => {
    try {
      const saved = localStorage.getItem('little_bee_mpt4_logic_config');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...DEFAULT_CONFIG,
          ...parsed,
          registeredModules: parsed.registeredModules || [],
          qrScannerEnabled: parsed.qrScannerEnabled ?? true,
          modulesButtonEnabled: parsed.modulesButtonEnabled ?? true,
        };
      }
      return DEFAULT_CONFIG;
    } catch {
      return DEFAULT_CONFIG;
    }
  });

  // Listen for keydown 's' or 'S' to toggle hidden logic setting page
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input or textarea
      const target = e.target as HTMLElement;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) {
        return;
      }

      if (e.key === 's' || e.key === 'S') {
        e.preventDefault();
        setIsLogicSettingsOpen((prev) => !prev);
      } else if (e.key === 'Escape') {
        setIsLogicSettingsOpen(false);
        setIsQRScannerOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSaveConfig = (newConfig: LogicConfig) => {
    setConfig(newConfig);
    try {
      localStorage.setItem('little_bee_mpt4_logic_config', JSON.stringify(newConfig));
    } catch {
      // ignore storage full errors
    }
  };

  const handleRegisterSuccess = (newModule: RegisteredModule) => {
    const prevModules = config.registeredModules || [];
    // Ensure uniqueness by id and code
    if (prevModules.some((m) => m.id === newModule.id || m.code === newModule.code)) {
      return;
    }
    const updatedModules = [...prevModules, newModule];
    const updatedConfig: LogicConfig = {
      ...config,
      registeredModules: updatedModules,
    };
    handleSaveConfig(updatedConfig);
  };

  return (
    <div id="little-bee-mpt4-root" className="relative min-h-screen w-full select-none overflow-hidden">
      <AnimatePresence mode="wait">
        {currentScreen === 'home' ? (
          /* FIRST SCREEN */
          <motion.main 
            key="home-screen"
            id="little-bee-mpt4-app" 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.25 }}
            className="relative min-h-screen w-full flex flex-col items-center justify-center p-6 sm:p-10 select-none overflow-hidden bg-[#FFFBEB]"
          >
            {/* Peaceful Vibrant theme background */}
            <PeacefulBeeBackground />

            {/* Centerpiece container evenly balanced on screen */}
            <div 
              id="center-content-card"
              className="w-full max-w-3xl flex flex-col items-center justify-center text-center my-auto space-y-10 sm:space-y-12 z-10"
            >
              {/* Title evenly at centre in Vibrant Palette typography */}
              <h1 
                id="main-title" 
                className="text-4xl sm:text-5xl md:text-6xl font-black text-[#78350F] tracking-widest text-center max-w-2xl px-6 uppercase font-['Fredoka',sans-serif] leading-tight"
              >
                LITTLE BEE MPT4 MODULE @2026
              </h1>

              {/* Play Button, Triangle in a Bubbly Bubble Button */}
              <div className="flex flex-col items-center justify-center space-y-8">
                <PlayBubbleButton onPlay={() => setCurrentScreen('secondScreen')} />

                {/* Vibrant Palette 3 Color Dots Accent */}
                <div className="flex space-x-4 items-center">
                  <div className="w-3.5 h-3.5 bg-[#FBBF24] rounded-full shadow-xs" />
                  <div className="w-3.5 h-3.5 bg-[#FDE68A] rounded-full shadow-xs" />
                  <div className="w-3.5 h-3.5 bg-[#FEF3C7] rounded-full shadow-xs" />
                </div>
              </div>
            </div>
          </motion.main>
        ) : currentScreen === 'secondScreen' ? (
          /* SECOND SCREEN */
          <motion.div
            key="second-screen"
            initial={{ opacity: 0, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <SecondScreen
              onBackToHome={() => setCurrentScreen('home')}
              onOpenQRScanner={() => setIsQRScannerOpen(true)}
              onSelectModule={(mod) => {
                setActiveSelectedModule(mod);
                setCurrentScreen('subjects');
              }}
              registeredModules={config.registeredModules || []}
              isScannerEnabled={config.qrScannerEnabled ?? true}
              isModulesButtonEnabled={config.modulesButtonEnabled ?? true}
            />
          </motion.div>
        ) : (
          /* THIRD SCREEN: 5 SUBJECT BUBBLE SELECTION */
          <motion.div
            key="subjects-screen"
            initial={{ opacity: 0, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            {activeSelectedModule && (
              <SubjectSelectionScreen
                module={activeSelectedModule}
                onBackToModules={() => setCurrentScreen('secondScreen')}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hidden Logic Settings Page (Accessible ONLY by pressing 'S' on keyboard) */}
      <LogicSettingsModal
        isOpen={isLogicSettingsOpen}
        onClose={() => setIsLogicSettingsOpen(false)}
        config={config}
        onSaveConfig={handleSaveConfig}
      />

      {/* QR Scanner Modal */}
      <QRScannerModal
        isOpen={isQRScannerOpen}
        onClose={() => setIsQRScannerOpen(false)}
        isScannerEnabled={config.qrScannerEnabled ?? true}
        registeredModules={config.registeredModules || []}
        onRegisterSuccess={handleRegisterSuccess}
      />
    </div>
  );
}
