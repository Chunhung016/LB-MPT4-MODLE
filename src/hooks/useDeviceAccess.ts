import { useCallback, useEffect, useState } from 'react';
import { isSupabaseConfigured, supabase } from '../lib/supabase';

const DEVICE_TOKEN_KEY = 'little_bee_device_token_v1';

export interface DeviceAccessState {
  activationCode: string | null;
  spellingBeeEnabled: boolean;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

function getOrCreateDeviceToken() {
  const existing = localStorage.getItem(DEVICE_TOKEN_KEY);
  if (existing) return existing;

  const token = `${crypto.randomUUID().replaceAll('-', '')}${crypto.randomUUID().replaceAll('-', '')}`;
  localStorage.setItem(DEVICE_TOKEN_KEY, token);
  return token;
}

export function useDeviceAccess(): DeviceAccessState {
  const [activationCode, setActivationCode] = useState<string | null>(null);
  const [spellingBeeEnabled, setSpellingBeeEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setError('Access service is not configured.');
      setLoading(false);
      return;
    }

    try {
      const token = getOrCreateDeviceToken();
      const { data, error: requestError } = await supabase.rpc('register_device', {
        p_device_token: token,
      });

      if (requestError) throw requestError;

      const access = Array.isArray(data) ? data[0] : data;
      setActivationCode(access?.activation_code ?? null);
      setSpellingBeeEnabled(Boolean(access?.spelling_bee_enabled));
      setError(null);
    } catch (requestError) {
      console.error('Unable to refresh device access', requestError);
      setError('Unable to check program access right now.');
      setSpellingBeeEnabled(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();

    const interval = window.setInterval(() => void refresh(), 12_000);
    const handleFocus = () => void refresh();
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') void refresh();
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [refresh]);

  return { activationCode, spellingBeeEnabled, loading, error, refresh };
}
