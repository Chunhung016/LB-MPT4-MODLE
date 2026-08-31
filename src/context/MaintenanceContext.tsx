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

const MAINTENANCE_STORAGE_KEY = 'acebee_system_maintenance_v2';
const BROADCAST_CHANNEL_NAME = 'acebee_maintenance_broadcast_channel';

export const ACEBEE_LOGO_URL = 'https://i.postimg.cc/pVSxYHDv/70f4dd9e-95f6-4f48-869d-74727b17b134.png';

export const DEFAULT_MAINTENANCE_CONFIG: SystemMaintenanceConfig = {
  isActive: false,
  scheduledStart: null,
  scheduledEnd: null,
  title: 'Scheduled System Maintenance & Cloud Optimization',
  message:
    'The ACEBEE Learning Platform is currently undergoing scheduled server upgrades and database optimization to provide your children with a smoother, faster, and more engaging learning experience.',
  apologyTitle: 'A Sincere Note from ACEBEE Team',
  apologyNote:
    'We sincerely apologize for the temporary interruption to your learning routine. All student progress, achievements, and Bee Tokens are securely preserved.',
  statusNote: 'Our technicians are working actively. System will be restored momentarily.',
  logoUrl: ACEBEE_LOGO_URL,
  updatedAt: new Date().toISOString(),
  updatedBy: 'Admin',
};

interface MaintenanceContextValue {
  config: SystemMaintenanceConfig;
  isMaintenanceBlocking: boolean;
  remainingMs: number;
  saveConfig: (nextConfig: SystemMaintenanceConfig) => Promise<void>;
  enableImmediateMaintenance: (durationMinutes: number) => Promise<void>;
  disableMaintenance: () => Promise<void>;
  scheduleMaintenance: (
    startIso: string,
    endIso: string,
    additionalDetails?: Partial<SystemMaintenanceConfig>
  ) => Promise<void>;
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

  const [now, setNow] = useState<number>(Date.now());

  // Precision timer: tick every second to check auto-expiration and keep countdown in sync
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Compute maintenance blocking state
  const { isMaintenanceBlocking, remainingMs } = useMemo(() => {
    if (!config.isActive) {
      return { isMaintenanceBlocking: false, remainingMs: 0 };
    }

    const startMs = config.scheduledStart ? new Date(config.scheduledStart).getTime() : null;
    const endMs = config.scheduledEnd ? new Date(config.scheduledEnd).getTime() : null;

    // If scheduled for a future start time, do not block yet
    if (startMs && now < startMs) {
      return { isMaintenanceBlocking: false, remainingMs: endMs ? Math.max(0, endMs - now) : 0 };
    }

    // If scheduled end time has been reached, automatically unlock the app!
    if (endMs && now >= endMs) {
      return { isMaintenanceBlocking: false, remainingMs: 0 };
    }

    const remaining = endMs ? Math.max(0, endMs - now) : 0;
    return {
      isMaintenanceBlocking: true,
      remainingMs: remaining,
    };
  }, [config, now]);

  // Sync from Supabase if configured
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
      // fallback
    }
  }, []);

  // Cross-tab broadcast listener
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

    const pollInterval = setInterval(() => {
      void refreshMaintenanceStatus();
    }, 20000);

    return () => {
      broadcastChannel?.close();
      window.removeEventListener('storage', handleStorage);
      clearInterval(pollInterval);
    };
  }, [refreshMaintenanceStatus]);

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

      try {
        if (typeof BroadcastChannel !== 'undefined') {
          const channel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
          channel.postMessage({ type: 'MAINTENANCE_UPDATE', config: updated });
          channel.close();
        }
      } catch {
        // ignore
      }

      if (isSupabaseConfigured) {
        try {
          await supabase
            .from('app_settings')
            .upsert(
              { key: 'system_maintenance', value: updated, updated_at: new Date().toISOString() },
              { onConflict: 'key' }
            );
        } catch {
          // ignore
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

  const value = useMemo(
    () => ({
      config,
      isMaintenanceBlocking,
      remainingMs,
      saveConfig,
      enableImmediateMaintenance,
      disableMaintenance,
      scheduleMaintenance,
      refreshMaintenanceStatus,
    }),
    [
      config,
      isMaintenanceBlocking,
      remainingMs,
      saveConfig,
      enableImmediateMaintenance,
      disableMaintenance,
      scheduleMaintenance,
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
