import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { Session } from '@supabase/supabase-js';
import { isSupabaseConfigured, supabase } from '../lib/supabase';

const DEVICE_TOKEN_KEY = 'little_bee_device_token_v1';
const PARENT_EMAIL_DOMAIN = 'parents.littlebee.app';
const USERNAME_PATTERN = /^[a-z0-9][a-z0-9._-]{2,31}$/;

export interface ParentProfile {
  user_id: string;
  username: string;
  parent_name: string;
  child_name: string;
  contact_phone: string | null;
}

export interface ParentAccess {
  activationCode: string | null;
  spellingBeeEnabled: boolean;
  aiFeaturesEnabled: boolean;
  beeTokens: number;
}

export interface ActivationRequest {
  id: string;
  request_code: string;
  wants_spelling_bee: boolean;
  wants_ai: boolean;
  status: 'pending' | 'approved' | 'cancelled';
  requested_at: string;
}

interface ParentAccountContextValue {
  session: Session | null;
  profile: ParentProfile | null;
  access: ParentAccess;
  pendingRequest: ActivationRequest | null;
  loading: boolean;
  actionLoading: boolean;
  error: string | null;
  configured: boolean;
  clearError: () => void;
  signIn: (username: string, password: string) => Promise<boolean>;
  signUp: (details: {
    username: string;
    password: string;
    parentName: string;
    childName: string;
    contactPhone: string;
  }) => Promise<boolean>;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
  requestActivation: (wantsSpellingBee: boolean, wantsAi: boolean) => Promise<boolean>;
  updateProfile: (updates: Pick<ParentProfile, 'parent_name' | 'child_name' | 'contact_phone'>) => Promise<boolean>;
}

const EMPTY_ACCESS: ParentAccess = {
  activationCode: null,
  spellingBeeEnabled: false,
  aiFeaturesEnabled: false,
  beeTokens: 0,
};

const ParentAccountContext = createContext<ParentAccountContextValue | null>(null);

function normalizeUsername(username: string) {
  return username.trim().toLowerCase();
}

function usernameToEmail(username: string) {
  return `${normalizeUsername(username)}@${PARENT_EMAIL_DOMAIN}`;
}

function getOrCreateDeviceToken() {
  const existing = localStorage.getItem(DEVICE_TOKEN_KEY);
  if (existing) return existing;

  const token = `${crypto.randomUUID().replaceAll('-', '')}${crypto.randomUUID().replaceAll('-', '')}`;
  localStorage.setItem(DEVICE_TOKEN_KEY, token);
  return token;
}

function friendlyAuthError(message: string) {
  const normalized = message.toLowerCase();
  if (normalized.includes('invalid login credentials')) return 'Incorrect username or password.';
  if (normalized.includes('signup is disabled') || normalized.includes('signups not allowed')) return 'New account registration is temporarily unavailable. Please ask reception for help.';
  if (normalized.includes('user already registered')) return 'That username is already registered. Please sign in instead.';
  if (normalized.includes('password')) return message;
  if (normalized.includes('fetch')) return 'Unable to reach the account service. Check the internet connection and try again.';
  return message;
}

export function ParentAccountProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<ParentProfile | null>(null);
  const [access, setAccess] = useState<ParentAccess>(EMPTY_ACCESS);
  const [pendingRequest, setPendingRequest] = useState<ActivationRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadAccount = useCallback(async (activeSession: Session | null) => {
    if (!activeSession?.user) {
      setProfile(null);
      setAccess(EMPTY_ACCESS);
      setPendingRequest(null);
      setLoading(false);
      return;
    }

    const profileResult = await supabase
      .from('parent_profiles')
      .select('user_id, username, parent_name, child_name, contact_phone')
      .eq('user_id', activeSession.user.id)
      .maybeSingle();

    if (profileResult.error) {
      setError(friendlyAuthError(profileResult.error.message));
      setProfile(null);
      setLoading(false);
      return;
    }

    if (!profileResult.data) {
      setProfile(null);
      setAccess(EMPTY_ACCESS);
      setPendingRequest(null);
      setError('This is not a parent account. Staff should use the Admin Dashboard.');
      setLoading(false);
      return;
    }

    const deviceToken = getOrCreateDeviceToken();
    const accessResult = await supabase.rpc('register_account_device', {
      p_device_token: deviceToken,
    });

    if (accessResult.error) {
      setError(accessResult.error.message);
      setProfile(profileResult.data as ParentProfile);
      setLoading(false);
      return;
    }

    const accessRow = Array.isArray(accessResult.data) ? accessResult.data[0] : accessResult.data;
    const requestResult = await supabase
      .from('activation_requests')
      .select('id, request_code, wants_spelling_bee, wants_ai, status, requested_at')
      .eq('user_id', activeSession.user.id)
      .eq('status', 'pending')
      .order('requested_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    setProfile(profileResult.data as ParentProfile);
    setAccess({
      activationCode: accessRow?.activation_code ?? null,
      spellingBeeEnabled: Boolean(accessRow?.spelling_bee_enabled),
      aiFeaturesEnabled: Boolean(accessRow?.ai_features_enabled),
      beeTokens: Number(accessRow?.bee_tokens ?? 0),
    });
    setPendingRequest((requestResult.data as ActivationRequest | null) ?? null);
    setError(requestResult.error ? requestResult.error.message : null);
    setLoading(false);
  }, []);

  const refresh = useCallback(async () => {
    await loadAccount(session);
  }, [loadAccount, session]);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setError('The account service is not configured for this build. Please contact Little Bee support.');
      setLoading(false);
      return;
    }

    let active = true;
    void supabase.auth.getSession().then(({ data, error: sessionError }) => {
      if (!active) return;
      if (sessionError) {
        setError(friendlyAuthError(sessionError.message));
        setLoading(false);
        return;
      }
      setSession(data.session);
      void loadAccount(data.session);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      window.setTimeout(() => void loadAccount(nextSession), 0);
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, [loadAccount]);

  useEffect(() => {
    if (!session) return;
    const interval = window.setInterval(() => void loadAccount(session), 12_000);
    const handleFocus = () => void loadAccount(session);
    window.addEventListener('focus', handleFocus);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, [loadAccount, session]);

  const signIn = useCallback(async (username: string, password: string) => {
    setActionLoading(true);
    setError(null);
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: usernameToEmail(username),
      password,
    });
    setActionLoading(false);
    if (signInError) {
      setError(friendlyAuthError(signInError.message));
      return false;
    }
    return true;
  }, []);

  const signUp = useCallback(async ({
    username,
    password,
    parentName,
    childName,
    contactPhone,
  }: {
    username: string;
    password: string;
    parentName: string;
    childName: string;
    contactPhone: string;
  }) => {
    const normalizedUsername = normalizeUsername(username);
    if (!USERNAME_PATTERN.test(normalizedUsername)) {
      setError('Username must be 3–32 characters and use only letters, numbers, dots, dashes, or underscores.');
      return false;
    }

    setActionLoading(true);
    setError(null);
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: usernameToEmail(normalizedUsername),
      password,
      options: {
        data: {
          username: normalizedUsername,
          parent_name: parentName.trim(),
          child_name: childName.trim(),
          contact_phone: contactPhone.trim(),
        },
      },
    });

    if (signUpError) {
      setError(friendlyAuthError(signUpError.message));
      setActionLoading(false);
      return false;
    }

    if (!data.session) {
      setError('Your account was created but could not be signed in automatically. Please ask reception for help.');
      setActionLoading(false);
      return false;
    }

    setSession(data.session);
    await loadAccount(data.session);
    setActionLoading(false);
    return true;
  }, [loadAccount]);

  const signOut = useCallback(async () => {
    setActionLoading(true);
    await supabase.auth.signOut();
    setActionLoading(false);
  }, []);

  const requestActivation = useCallback(async (wantsSpellingBee: boolean, wantsAi: boolean) => {
    setActionLoading(true);
    setError(null);
    const { error: requestError } = await supabase.rpc('create_activation_request', {
      p_device_token: getOrCreateDeviceToken(),
      p_wants_spelling_bee: wantsSpellingBee,
      p_wants_ai: wantsAi,
    });
    if (requestError) {
      setError(requestError.message);
      setActionLoading(false);
      return false;
    }
    await loadAccount(session);
    setActionLoading(false);
    return true;
  }, [loadAccount, session]);

  const updateProfile = useCallback(async (
    updates: Pick<ParentProfile, 'parent_name' | 'child_name' | 'contact_phone'>,
  ) => {
    if (!session?.user) return false;
    setActionLoading(true);
    setError(null);
    const { error: updateError } = await supabase
      .from('parent_profiles')
      .update({
        parent_name: updates.parent_name.trim(),
        child_name: updates.child_name.trim(),
        contact_phone: updates.contact_phone?.trim() || null,
      })
      .eq('user_id', session.user.id);
    if (updateError) {
      setError(updateError.message);
      setActionLoading(false);
      return false;
    }
    await loadAccount(session);
    setActionLoading(false);
    return true;
  }, [loadAccount, session]);

  const value = useMemo<ParentAccountContextValue>(() => ({
    session,
    profile,
    access,
    pendingRequest,
    loading,
    actionLoading,
    error,
    configured: isSupabaseConfigured,
    clearError: () => setError(null),
    signIn,
    signUp,
    signOut,
    refresh,
    requestActivation,
    updateProfile,
  }), [
    access,
    actionLoading,
    error,
    loading,
    pendingRequest,
    profile,
    refresh,
    requestActivation,
    session,
    signIn,
    signUp,
    signOut,
    updateProfile,
  ]);

  return <ParentAccountContext.Provider value={value}>{children}</ParentAccountContext.Provider>;
}

export function useParentAccount() {
  const context = useContext(ParentAccountContext);
  if (!context) throw new Error('useParentAccount must be used inside ParentAccountProvider');
  return context;
}
