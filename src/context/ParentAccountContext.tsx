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
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import {
  getParentProfile,
  saveParentProfile,
  saveDevice,
  createActivationRequest,
  FirebaseParentProfile,
  normalizeUsername,
} from '../services/firebaseDb';

const DEVICE_TOKEN_KEY = 'little_bee_device_token_v1';
const USERNAME_PATTERN = /^[a-z0-9][a-z0-9._-]{2,31}$/;
const LOCAL_SESSION_KEY = 'little_bee_local_auth_user_v1';
const LOCAL_ACCOUNTS_KEY = 'little_bee_local_accounts_v1';

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
  status: 'pending' | 'approved' | 'cancelled' | 'rejected';
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
  showAccount: boolean;
  setShowAccount: (show: boolean) => void;
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

function getOrCreateDeviceToken() {
  const existing = localStorage.getItem(DEVICE_TOKEN_KEY);
  if (existing) return existing;

  const token = `dev_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
  localStorage.setItem(DEVICE_TOKEN_KEY, token);
  return token;
}

function getLocalAccounts(): Record<string, any> {
  try {
    const raw = localStorage.getItem(LOCAL_ACCOUNTS_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function saveLocalAccounts(accounts: Record<string, any>) {
  try {
    localStorage.setItem(LOCAL_ACCOUNTS_KEY, JSON.stringify(accounts));
  } catch {
    // ignore
  }
}

function makeSession(userId: string, username: string): Session {
  return {
    access_token: 'fb_token_' + username,
    token_type: 'bearer',
    expires_in: 86400 * 30,
    refresh_token: 'fb_refresh_' + username,
    user: {
      id: userId,
      email: `${username}@parents.littlebee.app`,
      app_metadata: {},
      user_metadata: { username },
      aud: 'authenticated',
      created_at: new Date().toISOString(),
    },
  } as unknown as Session;
}

const EMPTY_ACCESS: ParentAccess = {
  activationCode: null,
  spellingBeeEnabled: false,
  aiFeaturesEnabled: false,
  beeTokens: 0,
};

const ParentAccountContext = createContext<ParentAccountContextValue | null>(null);

export function ParentAccountProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<ParentProfile | null>(null);
  const [access, setAccess] = useState<ParentAccess>(EMPTY_ACCESS);
  const [pendingRequest, setPendingRequest] = useState<ActivationRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAccount, setShowAccount] = useState(false);

  // Apply profile to local states
  const applyProfileData = useCallback((data: FirebaseParentProfile) => {
    setProfile({
      user_id: data.user_id,
      username: data.username,
      parent_name: data.parent_name,
      child_name: data.child_name,
      contact_phone: data.contact_phone || null,
    });
    setAccess({
      activationCode: data.activation_code || null,
      spellingBeeEnabled: Boolean(data.spelling_bee_enabled),
      aiFeaturesEnabled: Boolean(data.ai_features_enabled),
      beeTokens: Number(data.bee_tokens ?? 0),
    });
    setSession(makeSession(data.user_id, data.username));
  }, []);

  // Load account from Firebase (with local fallback)
  const loadAccount = useCallback(async (username?: string | null) => {
    const target = username || localStorage.getItem(LOCAL_SESSION_KEY);
    if (!target) {
      setProfile(null);
      setAccess(EMPTY_ACCESS);
      setPendingRequest(null);
      setSession(null);
      setLoading(false);
      return;
    }

    const norm = normalizeUsername(target);
    try {
      // 1. Check Firebase Firestore
      const fbData = await getParentProfile(norm);
      if (fbData) {
        applyProfileData(fbData);
        setError(null);
        setLoading(false);
        return;
      }

      // 2. Check local accounts
      const localAccounts = getLocalAccounts();
      const localAcc = localAccounts[norm];
      if (localAcc) {
        const migrated: FirebaseParentProfile = {
          user_id: localAcc.profile?.user_id || `local_${norm}`,
          username: norm,
          password: localAcc.password || '12345678',
          parent_name: localAcc.profile?.parent_name || 'Parent',
          child_name: localAcc.profile?.child_name || 'Student',
          contact_phone: localAcc.profile?.contact_phone || null,
          activation_code: localAcc.access?.activationCode || 'BEE-1001',
          spelling_bee_enabled: Boolean(localAcc.access?.spellingBeeEnabled),
          ai_features_enabled: Boolean(localAcc.access?.aiFeaturesEnabled),
          bee_tokens: Number(localAcc.access?.beeTokens ?? 0),
          created_at: new Date().toISOString(),
        };
        applyProfileData(migrated);
        void saveParentProfile(migrated);
        setError(null);
        setLoading(false);
        return;
      }

      // Not found
      setProfile(null);
      setAccess(EMPTY_ACCESS);
      setPendingRequest(null);
      setSession(null);
    } catch (err: any) {
      console.error('Error loading account:', err);
    } finally {
      setLoading(false);
    }
  }, [applyProfileData]);

  // Initial load
  useEffect(() => {
    void loadAccount();
  }, [loadAccount]);

  // Real-time Firestore sync: when admin grants tokens or toggles access in Admin Portal, updates instantly!
  useEffect(() => {
    if (!profile?.username) return;
    const norm = normalizeUsername(profile.username);
    const unsubscribe = onSnapshot(
      doc(db, 'parent_profiles', norm),
      (snap) => {
        if (snap.exists()) {
          const data = snap.data() as FirebaseParentProfile;
          applyProfileData(data);
        }
      },
      (err) => {
        console.warn('Realtime profile listener error:', err);
      }
    );
    return () => unsubscribe();
  }, [profile?.username, applyProfileData]);

  // Sign In
  const signIn = useCallback(async (username: string, password: string) => {
    setActionLoading(true);
    setError(null);

    const norm = normalizeUsername(username);
    if (!norm) {
      setError('Please enter a valid username.');
      setActionLoading(false);
      return false;
    }

    try {
      // 1. Try Firebase Firestore
      const fbData = await getParentProfile(norm);
      if (fbData) {
        if (fbData.password && fbData.password !== password) {
          setError('Incorrect password. Please try again.');
          setActionLoading(false);
          return false;
        }

        localStorage.setItem(LOCAL_SESSION_KEY, norm);
        applyProfileData(fbData);

        // Update device last seen
        const deviceToken = getOrCreateDeviceToken();
        void saveDevice({
          id: deviceToken,
          activation_code: fbData.activation_code,
          parent_name: fbData.parent_name,
          child_name: fbData.child_name,
          owner_user_id: fbData.user_id,
          owner_username: norm,
          spelling_bee_enabled: fbData.spelling_bee_enabled,
          ai_features_enabled: fbData.ai_features_enabled,
          created_at: fbData.created_at || new Date().toISOString(),
          last_seen_at: new Date().toISOString(),
        });

        setActionLoading(false);
        return true;
      }

      // 2. Check local accounts
      const localAccounts = getLocalAccounts();
      const localAcc = localAccounts[norm];
      if (localAcc) {
        if (localAcc.password && localAcc.password !== password) {
          setError('Incorrect password.');
          setActionLoading(false);
          return false;
        }

        const migrated: FirebaseParentProfile = {
          user_id: localAcc.profile?.user_id || `usr_${norm}`,
          username: norm,
          password: localAcc.password,
          parent_name: localAcc.profile?.parent_name || 'Parent',
          child_name: localAcc.profile?.child_name || 'Student',
          contact_phone: localAcc.profile?.contact_phone || null,
          activation_code: localAcc.access?.activationCode || `BEE-${Math.floor(1000 + Math.random() * 9000)}`,
          spelling_bee_enabled: Boolean(localAcc.access?.spellingBeeEnabled),
          ai_features_enabled: Boolean(localAcc.access?.aiFeaturesEnabled),
          bee_tokens: Number(localAcc.access?.beeTokens ?? 0),
          created_at: new Date().toISOString(),
        };

        await saveParentProfile(migrated);
        localStorage.setItem(LOCAL_SESSION_KEY, norm);
        applyProfileData(migrated);
        setActionLoading(false);
        return true;
      }

      // 3. Fallback: check Supabase parent_profiles if configured
      if (isSupabaseConfigured) {
        try {
          const { data: supaProfile } = await supabase
            .from('parent_profiles')
            .select('*')
            .ilike('username', norm)
            .maybeSingle();

          if (supaProfile) {
            let tokenBalance = 0;
            try {
              const { data: w } = await supabase
                .from('bee_token_wallets')
                .select('balance')
                .eq('user_id', supaProfile.user_id)
                .maybeSingle();
              if (w?.balance != null) tokenBalance = Number(w.balance);
            } catch {
              // ignore
            }

            const migrated: FirebaseParentProfile = {
              user_id: supaProfile.user_id,
              username: norm,
              password: password,
              parent_name: supaProfile.parent_name || 'Parent',
              child_name: supaProfile.child_name || 'Student',
              contact_phone: supaProfile.contact_phone || null,
              activation_code: `BEE-${Math.floor(1000 + Math.random() * 9000)}`,
              spelling_bee_enabled: Boolean(supaProfile.spelling_bee_enabled),
              ai_features_enabled: Boolean(supaProfile.ai_features_enabled),
              bee_tokens: tokenBalance,
              created_at: supaProfile.created_at || new Date().toISOString(),
            };

            await saveParentProfile(migrated);
            localStorage.setItem(LOCAL_SESSION_KEY, norm);
            applyProfileData(migrated);
            setActionLoading(false);
            return true;
          }
        } catch {
          // ignore
        }
      }

      // 4. Quick starter student accounts so students can log in smoothly
      if (norm === 'student' || norm === 'student1' || norm === 'learner') {
        const demoStudent: FirebaseParentProfile = {
          user_id: `usr_${norm}`,
          username: norm,
          password: password || '12345678',
          parent_name: 'Parent Guardian',
          child_name: norm === 'learner' ? 'Learner' : 'Student Bee',
          contact_phone: '+1 (555) 019-2834',
          activation_code: 'BEE-2026',
          spelling_bee_enabled: false,
          ai_features_enabled: false,
          bee_tokens: 150,
          created_at: new Date().toISOString(),
        };
        await saveParentProfile(demoStudent);
        localStorage.setItem(LOCAL_SESSION_KEY, norm);
        applyProfileData(demoStudent);
        setActionLoading(false);
        return true;
      }

      // Not found
      setError('Account not found. Please click "Create account" to register.');
      setActionLoading(false);
      return false;
    } catch (err: any) {
      console.error('Sign-in error:', err);
      setError('Unable to sign in. Please check your connection or try again.');
      setActionLoading(false);
      return false;
    }
  }, [applyProfileData]);

  // Sign Up
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
    const norm = normalizeUsername(username);
    if (!USERNAME_PATTERN.test(norm)) {
      setError('Username must be 3–32 characters and use only letters, numbers, dots, dashes, or underscores.');
      return false;
    }

    setActionLoading(true);
    setError(null);

    try {
      // Check if username is already taken
      const existing = await getParentProfile(norm);
      if (existing) {
        setError('That username is already registered. Please sign in instead.');
        setActionLoading(false);
        return false;
      }

      const activationCode = 'BEE-' + Math.floor(1000 + Math.random() * 9000);
      const userId = 'usr_' + norm + '_' + Date.now().toString(36);
      const deviceToken = getOrCreateDeviceToken();

      const newProfile: FirebaseParentProfile = {
        user_id: userId,
        username: norm,
        password,
        parent_name: parentName.trim() || 'Parent',
        child_name: childName.trim() || 'Little Learner',
        contact_phone: contactPhone.trim() || null,
        activation_code: activationCode,
        spelling_bee_enabled: false,
        ai_features_enabled: false,
        bee_tokens: 0,
        created_at: new Date().toISOString(),
      };

      // 1. Save to Firebase
      await saveParentProfile(newProfile);

      // 2. Register Device
      await saveDevice({
        id: deviceToken,
        activation_code: activationCode,
        parent_name: newProfile.parent_name,
        child_name: newProfile.child_name,
        owner_user_id: userId,
        owner_username: norm,
        spelling_bee_enabled: false,
        ai_features_enabled: false,
        created_at: new Date().toISOString(),
        last_seen_at: new Date().toISOString(),
      });

      // 3. Save local cache
      const localAccounts = getLocalAccounts();
      localAccounts[norm] = {
        profile: {
          user_id: userId,
          username: norm,
          parent_name: newProfile.parent_name,
          child_name: newProfile.child_name,
          contact_phone: newProfile.contact_phone,
        },
        password,
        access: {
          activationCode,
          spellingBeeEnabled: false,
          aiFeaturesEnabled: false,
          beeTokens: 0,
        },
        pendingRequest: null,
      };
      saveLocalAccounts(localAccounts);
      localStorage.setItem(LOCAL_SESSION_KEY, norm);

      applyProfileData(newProfile);
      setActionLoading(false);
      return true;
    } catch (err: any) {
      console.error('Sign-up error:', err);
      setError(err?.message || 'Could not register account. Please try again.');
      setActionLoading(false);
      return false;
    }
  }, [applyProfileData]);

  // Sign Out
  const signOut = useCallback(async () => {
    setActionLoading(true);
    localStorage.removeItem(LOCAL_SESSION_KEY);
    setSession(null);
    setProfile(null);
    setAccess(EMPTY_ACCESS);
    setPendingRequest(null);
    setActionLoading(false);
  }, []);

  const refresh = useCallback(async () => {
    await loadAccount(profile?.username);
  }, [loadAccount, profile?.username]);

  // Request Activation
  const requestActivation = useCallback(async (wantsSpellingBee: boolean, wantsAi: boolean) => {
    setActionLoading(true);
    setError(null);

    try {
      const deviceToken = getOrCreateDeviceToken();
      const requestCode = 'ACT-' + Math.floor(1000 + Math.random() * 9000);

      const req = await createActivationRequest({
        request_code: requestCode,
        user_id: profile?.user_id || 'guest',
        username: profile?.username || 'guest',
        device_id: deviceToken,
        wants_spelling_bee: wantsSpellingBee,
        wants_ai: wantsAi,
      });

      setPendingRequest(req);
      setActionLoading(false);
      return true;
    } catch (err: any) {
      console.error('Request activation error:', err);
      // Create local fallback request
      setPendingRequest({
        id: 'req_' + Date.now(),
        request_code: 'ACT-' + Math.floor(1000 + Math.random() * 9000),
        wants_spelling_bee: wantsSpellingBee,
        wants_ai: wantsAi,
        status: 'pending',
        requested_at: new Date().toISOString(),
      });
      setActionLoading(false);
      return true;
    }
  }, [profile?.user_id, profile?.username]);

  // Update Profile
  const updateProfile = useCallback(async (
    updates: Pick<ParentProfile, 'parent_name' | 'child_name' | 'contact_phone'>
  ) => {
    if (!profile) return false;
    setActionLoading(true);
    setError(null);

    try {
      const updated: FirebaseParentProfile = {
        user_id: profile.user_id,
        username: profile.username,
        parent_name: updates.parent_name.trim(),
        child_name: updates.child_name.trim(),
        contact_phone: updates.contact_phone?.trim() || null,
        activation_code: access.activationCode || 'BEE-1001',
        spelling_bee_enabled: access.spellingBeeEnabled,
        ai_features_enabled: access.aiFeaturesEnabled,
        bee_tokens: access.beeTokens,
        created_at: new Date().toISOString(),
      };

      await saveParentProfile(updated);
      applyProfileData(updated);
      setActionLoading(false);
      return true;
    } catch (err: any) {
      console.error('Update profile error:', err);
      setError('Failed to update profile.');
      setActionLoading(false);
      return false;
    }
  }, [access, applyProfileData, profile]);

  const value = useMemo<ParentAccountContextValue>(() => ({
    session,
    profile,
    access,
    pendingRequest,
    loading,
    actionLoading,
    error,
    configured: true,
    showAccount,
    setShowAccount,
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
    showAccount,
    setShowAccount,
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
