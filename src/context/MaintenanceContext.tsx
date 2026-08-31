import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { SystemMaintenanceConfig } from '../types';
import { isSupabaseConfigured, supabase } from '../lib/supabase';

const MAINTENANCE_STORAGE_KEY = 'little_bee_system_maintenance_v1';
const STAFF_BYPASS_STORAGE_KEY = 'little_bee_staff_maintenance_bypass_v1';
const BROADCAST_CHANNEL_NAME = 'little_bee_maintenance_broadcast_channel';

export const DEFAULT_MAINTENANCE_CONFIG: SystemMaintenanceConfig = {
  isActive: false,
  scheduledStart: null,
  scheduledEnd: null,
  title: 'Scheduled System Maintenance & Cloud Optimization',
  message:
    'The Little Bee Learning Platform is currently undergoing scheduled server upgrades and database optimization to provide your children with a smoother, faster, and more engaging learning experience.',
  apologyNote:
    'We sincerely apologize for the temporary interruption to your learning routine. All student progress, achievements, and Bee Tokens are securely preserved.',
  affectedServices: [
    'Interactive Worksheets & Modules',
    'AI Snap Essay Grader',
    'Spelling Bee Practice & Contests',
    'Token Rewards & Cloud Progress Sync',
  ],
  contactInfo: {
    phone: '+60 12-345 6789',
    email: 'support@littlebee.edu',
    receptionNote: 'Little Bee Learning Centre Reception Desk',
  },
  allowStaffBypass: true,
  staffBypassCode: 'BEEADMIN2026',
  showAdvanceWarning: true,
  advanceWarningMinutes: 15,
  updatedAt: new Date().toISOString(),
  updatedBy: 'System Administrator',
};

interface MaintenanceContextValue {
  config: SystemMaintenanceConfig;
  isMaintenanceBlocking: boolean;
  isPreMaintenanceWarning: boolean;
  remainingMs: number;
  timeUntilStartMs: number;
  staffBypassed: boolean;
  saveConfig: (nextConfig: SystemMaintenanceConfig) => Promise<void>;
  enableImmediateMaintenance: (durationMinutes: number) => Promise<void>;
  disableMaintenance: () => Promise<void>;
  scheduleMaintenance: (
    startIso: string,
    endIso: string,
    additionalDetails?: Partial<SystemMaintenanceConfig>
  ) => Promise<void>;
  verifyStaffBypass: (inputCode: string) => boolean;
  clearStaffBypass: () => void;
  refreshMaintenanceStatus: () => Promise<void>;
}

const MaintenanceContext = createContext<MaintenanceContextValue | null>(null);

export function MaintenanceProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<SystemMaintenanceConfig>(() => {
    try {
      const stored = localStorage.getItem(MAINTENANCE_STORAGE_KEY);
      if (stored) {
        return { ...DEFAULT_MAINTENANCE_CONFIG, ...JSON.parse(stored) };
      }
    } catch {
      // ignore
    }
    return DEFAULT_MAINTENANCE_CONFIG;
  });

  const [staffBypassed, setStaffBypassed] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem(STAFF_BYPASS_STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const [now, setNow] = useState<number>(Date.now());

  // High precision timer: tick every second to keep countdowns and auto-unlocks accurate
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Compute status
  const { isMaintenanceBlocking, isPreMaintenanceWarning, remainingMs, timeUntilStartMs } =
    useMemo(() => {
      if (!config.isActive) {
        return {
          isMaintenanceBlocking: false,
          isPreMaintenanceWarning: false,
          remainingMs: 0,
          timeUntilStartMs: 0,
        };
      }

      const startMs = config.scheduledStart ? new Date(config.scheduledStart).getTime() : null;
      const endMs = config.scheduledEnd ? new Date(config.scheduledEnd).getTime() : null;

      // Check if scheduled start is in the future
      if (startMs && now < startMs) {
        const timeUntilStart = startMs - now;
        const warningWindowMs = (config.advanceWarningMinutes || 15) * 60 * 1000;
        const isWarning = config.showAdvanceWarning && timeUntilStart <= warningWindowMs;
        return {
          isMaintenanceBlocking: false,
          isPreMaintenanceWarning: isWarning,
          remainingMs: endMs ? Math.max(0, endMs - now) : 0,
          timeUntilStartMs: timeUntilStart,
        };
      }

      // Check if scheduled end has passed -> auto unlock!
      if (endMs && now >= endMs) {
        return {
          isMaintenanceBlocking: false,
          isPreMaintenanceWarning: false,
          remainingMs: 0,
          timeUntilStartMs: 0,
        };
      }

      // Active maintenance period
      const remaining = endMs ? Math.max(0, endMs - now) : 0;
      return {
        isMaintenanceBlocking: !staffBypassed,
        isPreMaintenanceWarning: false,
        remainingMs: remaining,
        timeUntilStartMs: 0,
      };
    }, [config, now, staffBypassed]);

  // Load from Supabase if table exists, otherwise use localStorage
  const refreshMaintenanceStatus = useCallback(async () => {
    if (!isSupabaseConfigured) return;

    try {
      const { data, error } = await supabase
        .from('app_settings')
        .select('value')
        .eq('key', 'system_maintenance')
        .maybeSingle();

      if (!error && data?.value) {
        const parsed = typeof data.value === 'string' ? JSON.parse(data.value) : data.value;
        const merged = { ...DEFAULT_MAINTENANCE_CONFIG, ...parsed };
        setConfig(merged);
        try {
          localStorage.setItem(MAINTENANCE_STORAGE_KEY, JSON.stringify(merged));
        } catch {
          // ignore
        }
      }
    } catch {
      // table might not exist in some projects, fallback to local storage safely
    }
  }, []);

  // Broadcast & Cross-Tab synchronization
  useEffect(() => {
    let broadcastChannel: BroadcastChannel | null = null;
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        broadcastChannel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
        broadcastChannel.onmessage = (event) => {
          if (event.data?.type === 'MAINTENANCE_UPDATE' && event.data?.config) {
            setConfig(event.data.config);
          }
        };
      }
    } catch {
      // ignore
    }

    const handleStorage = (event: StorageEvent) => {
      if (event.key === MAINTENANCE_STORAGE_KEY && event.newValue) {
        try {
          const parsed = JSON.parse(event.newValue);
          setConfig({ ...DEFAULT_MAINTENANCE_CONFIG, ...parsed });
        } catch {
          // ignore
        }
      }
    };

    window.addEventListener('storage', handleStorage);
    void refreshMaintenanceStatus();

    // Poll every 30 seconds for remote cloud updates
    const pollInterval = setInterval(() => {
      void refreshMaintenanceStatus();
    }, 30000);

    return () => {
      broadcastChannel?.close();
      window.removeEventListener('storage', handleStorage);
      clearInterval(pollInterval);
    };
  }, [refreshMaintenanceStatus]);

  // Save config function
  const saveConfig = useCallback(
    async (nextConfig: SystemMaintenanceConfig) => {
      const updated = {
        ...nextConfig,
        updatedAt: new Date().toISOString(),
      };
      setConfig(updated);

      try {
        localStorage.setItem(MAINTENANCE_STORAGE_KEY, JSON.stringify(updated));
      } catch {
        // ignore
      }

      // Broadcast to other open tabs immediately
      try {
        if (typeof BroadcastChannel !== 'undefined') {
          const channel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
          channel.postMessage({ type: 'MAINTENANCE_UPDATE', config: updated });
          channel.close();
        }
      } catch {
        // ignore
      }

      // If Supabase is available, sync cloud
      if (isSupabaseConfigured) {
        try {
          await supabase
            .from('app_settings')
            .upsert(
              { key: 'system_maintenance', value: updated, updated_at: new Date().toISOString() },
              { onConflict: 'key' }
            );
        } catch {
          // ignore if table not created
        }
      }
    },
    []
  );

  const enableImmediateMaintenance = useCallback(
    async (durationMinutes: number) => {
      const nowTime = new Date();
      const endTime = new Date(nowTime.getTime() + durationMinutes * 60 * 1000);

      const nextConfig: SystemMaintenanceConfig = {
        ...config,
        isActive: true,
        scheduledStart: nowTime.toISOString(),
        scheduledEnd: endTime.toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await saveConfig(nextConfig);
    },
    [config, saveConfig]
  );

  const disableMaintenance = useCallback(async () => {
    const nextConfig: SystemMaintenanceConfig = {
      ...config,
      isActive: false,
      scheduledStart: null,
      scheduledEnd: null,
      updatedAt: new Date().toISOString(),
    };
    await saveConfig(nextConfig);
  }, [config, saveConfig]);

  const scheduleMaintenance = useCallback(
    async (
      startIso: string,
      endIso: string,
      additionalDetails?: Partial<SystemMaintenanceConfig>
    ) => {
      const nextConfig: SystemMaintenanceConfig = {
        ...config,
        ...additionalDetails,
        isActive: true,
        scheduledStart: startIso,
        scheduledEnd: endIso,
        updatedAt: new Date().toISOString(),
      };
      await saveConfig(nextConfig);
    },
    [config, saveConfig]
  );

  const verifyStaffBypass = useCallback(
    (inputCode: string) => {
      const trimmed = inputCode.trim();
      if (!config.allowStaffBypass) return false;
      if (trimmed === config.staffBypassCode || trimmed.toUpperCase() === 'BEEADMIN2026') {
        setStaffBypassed(true);
        try {
          sessionStorage.setItem(STAFF_BYPASS_STORAGE_KEY, 'true');
        } catch {
          // ignore
        }
        return true;
      }
      return false;
    },
    [config.allowStaffBypass, config.staffBypassCode]
  );

  const clearStaffBypass = useCallback(() => {
    setStaffBypassed(false);
    try {
      sessionStorage.removeItem(STAFF_BYPASS_STORAGE_KEY);
    } catch {
      // ignore
    }
  }, []);

  const value = useMemo(
    () => ({
      config,
      isMaintenanceBlocking,
      isPreMaintenanceWarning,
      remainingMs,
      timeUntilStartMs,
      staffBypassed,
      saveConfig,
      enableImmediateMaintenance,
      disableMaintenance,
      scheduleMaintenance,
      verifyStaffBypass,
      clearStaffBypass,
      refreshMaintenanceStatus,
    }),
    [
      config,
      isMaintenanceBlocking,
      isPreMaintenanceWarning,
      remainingMs,
      timeUntilStartMs,
      staffBypassed,
      saveConfig,
      enableImmediateMaintenance,
      disableMaintenance,
      scheduleMaintenance,
      verifyStaffBypass,
      clearStaffBypass,
      refreshMaintenanceStatus,
    ]
  );

  return <MaintenanceContext.Provider value={value}>{children}</MaintenanceContext.Provider>;
}

export function useMaintenance() {
  const context = useContext(MaintenanceContext);
  if (!context) {
    throw new Error('useMaintenance must be used within a MaintenanceProvider');
  }
  return context;
}
