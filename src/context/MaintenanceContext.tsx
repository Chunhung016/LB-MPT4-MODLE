import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { PostMaintenanceChangelog, SystemMaintenanceConfig } from '../types';
import { isSupabaseConfigured, supabase } from '../lib/supabase';

const MAINTENANCE_STORAGE_KEY = 'acebee_system_maintenance_v2';
const BROADCAST_CHANNEL_NAME = 'acebee_maintenance_broadcast_channel';
const SEEN_CHANGELOG_KEY_PREFIX = 'acebee_post_maint_seen_';

export const ACEBEE_LOGO_URL = 'https://i.postimg.cc/pVSxYHDv/70f4dd9e-95f6-4f48-869d-74727b17b134.png';

export const DEFAULT_POST_MAINTENANCE_CHANGELOG: PostMaintenanceChangelog = {
  enabled: true,
  releaseId: 'rel_2026_09_01_v1',
  versionTag: 'Update 2026.2',
  headline: 'Welcome Back! ACEBEE is Successfully Restored ✨',
  subtitle: 'Our scheduled cloud optimization is complete. Here is what has been tuned up for your learners:',
  highlights: [
    {
      id: 'hl_speed',
      icon: 'zap',
      title: '3x Faster Module & Worksheet Loading',
      description: 'Streamlined database caching ensures worksheets open instantly on all iPads and tablets.',
    },
    {
      id: 'hl_progress',
      icon: 'star',
      title: '100% Preserved Progress & Bee Tokens',
      description: 'All earned stars, badges, completed lessons, and student avatars remain safe and synced.',
    },
    {
      id: 'hl_reliability',
      icon: 'shield',
      title: 'Enhanced Stability & Cloud Sync',
      description: 'Improved background connectivity prevents lesson interruptions and saves results automatically.',
    },
  ],
  thankYouNote: 'Thank you for your patience while we tuned up the learning hive! Happy learning! 🐝💛',
};

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
  postMaintenanceChangelog: DEFAULT_POST_MAINTENANCE_CHANGELOG,
  updatedAt: new Date().toISOString(),
  updatedBy: 'Admin',
};

interface MaintenanceContextValue {
  config: SystemMaintenanceConfig;
  isMaintenanceBlocking: boolean;
  remainingMs: number;
  showPostMaintenanceModal: boolean;
  dismissPostMaintenanceModal: () => void;
  saveConfig: (nextConfig: SystemMaintenanceConfig) => Promise<void>;
  enableImmediateMaintenance: (durationMinutes: number) => Promise<void>;
  disableMaintenance: (generateNewReleaseId?: boolean) => Promise<void>;
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
        const parsed = JSON.parse(stored);
        return {
          ...DEFAULT_MAINTENANCE_CONFIG,
          ...parsed,
          postMaintenanceChangelog: {
            ...DEFAULT_POST_MAINTENANCE_CHANGELOG,
            ...(parsed.postMaintenanceChangelog || {}),
          },
        };
      }
    } catch {
      // ignore
    }
    return DEFAULT_MAINTENANCE_CONFIG;
  });

  const [now, setNow] = useState<number>(Date.now());
  const [hasDismissedCurrentRelease, setHasDismissedCurrentRelease] = useState<boolean>(false);

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

    // To prevent clock-skew issues on mobile devices (e.g. iPad clock is a few minutes behind),
    // only delay the block if the start time is significantly in the future (> 5 mins)
    if (startMs && startMs - now > 5 * 60 * 1000) {
      return { isMaintenanceBlocking: false, remainingMs: endMs ? Math.max(0, endMs - now) : 0 };
    }

    // We do NOT automatically unlock based on the client's clock (now >= endMs).
    // Client clocks (especially on iPads/phones) can be easily misconfigured or set 
    // to the future, which would bypass the maintenance screen instantly.
    // The system remains locked until `config.isActive` is explicitly set to false by admin.
    const remaining = endMs ? Math.max(0, endMs - now) : 0;
    
    return {
      isMaintenanceBlocking: true,
      remainingMs: remaining,
    };
  }, [config, now]);

  // Compute whether post-maintenance modal should display (only if system is unlocked & not seen yet)
  const showPostMaintenanceModal = useMemo(() => {
    if (isMaintenanceBlocking) return false;
    const changelog = config.postMaintenanceChangelog;
    if (!changelog || !changelog.enabled || !changelog.releaseId) return false;
    if (hasDismissedCurrentRelease) return false;

    try {
      const seen = localStorage.getItem(SEEN_CHANGELOG_KEY_PREFIX + changelog.releaseId);
      return seen !== 'true';
    } catch {
      return false;
    }
  }, [isMaintenanceBlocking, config.postMaintenanceChangelog, hasDismissedCurrentRelease]);

  const dismissPostMaintenanceModal = useCallback(() => {
    const releaseId = config.postMaintenanceChangelog?.releaseId;
    if (releaseId) {
      try {
        localStorage.setItem(SEEN_CHANGELOG_KEY_PREFIX + releaseId, 'true');
      } catch {
        // ignore
      }
    }
    setHasDismissedCurrentRelease(true);
  }, [config.postMaintenanceChangelog?.releaseId]);

  // Helper to apply and cache fresh config
  const applyNewConfig = useCallback((parsed: any) => {
    if (!parsed) return;
    const merged: SystemMaintenanceConfig = {
      ...DEFAULT_MAINTENANCE_CONFIG,
      ...parsed,
      postMaintenanceChangelog: {
        ...DEFAULT_POST_MAINTENANCE_CHANGELOG,
        ...(parsed.postMaintenanceChangelog || {}),
      },
    };
    setConfig(merged);
    try {
      localStorage.setItem(MAINTENANCE_STORAGE_KEY, JSON.stringify(merged));
    } catch {
      // ignore
    }
  }, []);

  // Direct fetch fallback for mobile and tablet browsers
  const fetchDirectMaintenanceSetting = useCallback(async () => {
    try {
      const response = await fetch(
        `https://yneayotsllbfslziwijm.supabase.co/rest/v1/app_settings?key=eq.system_maintenance&select=value`,
        {
          headers: {
            apikey: 'sb_publishable_d8LQQOSBMM-opWxRA5mTWg_XuwCVTKP',
            Authorization: 'Bearer sb_publishable_d8LQQOSBMM-opWxRA5mTWg_XuwCVTKP',
          },
          cache: 'no-store',
        }
      );
      if (response.ok) {
        const rows = await response.json();
        if (Array.isArray(rows) && rows.length > 0 && rows[0]?.value) {
          const raw = rows[0].value;
          const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
          applyNewConfig(parsed);
          return true;
        }
      }
    } catch {
      // ignore
    }
    return false;
  }, [applyNewConfig]);

  // Sync from Supabase if configured
  const refreshMaintenanceStatus = useCallback(async () => {
    // 1. Try direct Supabase JS client
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase
          .from('app_settings')
          .select('value')
          .eq('key', 'system_maintenance')
          .maybeSingle();

        if (!error && data?.value) {
          const parsed = typeof data.value === 'string' ? JSON.parse(data.value) : data.value;
          applyNewConfig(parsed);
          return;
        }
      } catch {
        // fallback
      }
    }

    // 2. HTTP REST direct fetch fallback (vital for mobile Safari / Chrome)
    await fetchDirectMaintenanceSetting();
  }, [applyNewConfig, fetchDirectMaintenanceSetting]);

  // Realtime multi-device sync, cross-tab listener, and focus/wake listeners
  useEffect(() => {
    let broadcastChannel: BroadcastChannel | null = null;
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        broadcastChannel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
        broadcastChannel.onmessage = (event) => {
          if (event.data?.type === 'MAINTENANCE_UPDATE' && event.data?.config) {
            applyNewConfig(event.data.config);
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
          applyNewConfig(parsed);
        } catch {
          // ignore
        }
      }
    };

    const handleVisibilityOrFocus = () => {
      if (document.visibilityState === 'visible') {
        void refreshMaintenanceStatus();
      }
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener('focus', handleVisibilityOrFocus);
    document.addEventListener('visibilitychange', handleVisibilityOrFocus);

    // Initial fetch
    void refreshMaintenanceStatus();

    // Setup Supabase Realtime channel for instant cross-device updates (Laptop -> iPad -> Mobile)
    let realtimeChannel: any = null;
    if (isSupabaseConfigured) {
      try {
        realtimeChannel = supabase
          .channel('acebee_maintenance_realtime')
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'app_settings',
              filter: 'key=eq.system_maintenance',
            },
            (payload) => {
              if (payload.new && (payload.new as any).value) {
                const rawVal = (payload.new as any).value;
                const parsed = typeof rawVal === 'string' ? JSON.parse(rawVal) : rawVal;
                applyNewConfig(parsed);
              }
            }
          )
          .subscribe();
      } catch (err) {
        console.warn('Realtime subscription setup skipped:', err);
      }
    }

    // Rapid fallback poll interval (every 6s) to ensure mobile devices sync without delay
    const pollInterval = setInterval(() => {
      void refreshMaintenanceStatus();
    }, 6000);

    return () => {
      broadcastChannel?.close();
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('focus', handleVisibilityOrFocus);
      document.removeEventListener('visibilitychange', handleVisibilityOrFocus);
      if (realtimeChannel) {
        try {
          supabase.removeChannel(realtimeChannel);
        } catch {
          // ignore
        }
      }
      clearInterval(pollInterval);
    };
  }, [refreshMaintenanceStatus, applyNewConfig]);

  const saveConfig = useCallback(
    async (nextConfig: SystemMaintenanceConfig) => {
      const updated = {
        ...nextConfig,
        updatedAt: new Date().toISOString(),
      };
      applyNewConfig(updated);

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
          const { error: upsertError } = await supabase
            .from('app_settings')
            .upsert(
              { key: 'system_maintenance', value: updated, updated_at: new Date().toISOString() },
              { onConflict: 'key' }
            );

          if (upsertError) {
            // Try helper RPC as secondary avenue
            await supabase.rpc('set_app_setting', {
              p_key: 'system_maintenance',
              p_value: updated,
            });
          }
        } catch (err) {
          console.error('Failed to sync maintenance config to Supabase:', err);
        }
      }
    },
    [applyNewConfig]
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

  const disableMaintenance = useCallback(
    async (generateNewReleaseId: boolean = true) => {
      const currentChangelog = config.postMaintenanceChangelog || DEFAULT_POST_MAINTENANCE_CHANGELOG;
      const nextReleaseId = generateNewReleaseId
        ? `rel_${Date.now()}`
        : currentChangelog.releaseId;

      const nextConfig: SystemMaintenanceConfig = {
        ...config,
        isActive: false,
        scheduledStart: null,
        scheduledEnd: null,
        postMaintenanceChangelog: {
          ...currentChangelog,
          releaseId: nextReleaseId,
        },
        updatedAt: new Date().toISOString(),
      };
      setHasDismissedCurrentRelease(false);
      await saveConfig(nextConfig);
    },
    [config, saveConfig]
  );

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
      showPostMaintenanceModal,
      dismissPostMaintenanceModal,
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
      showPostMaintenanceModal,
      dismissPostMaintenanceModal,
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
