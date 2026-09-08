import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';
import { createUserWithEmailAndPassword, deleteUser, onAuthStateChanged, signInWithEmailAndPassword, signOut as firebaseSignOut, type User } from 'firebase/auth';
import { collection, doc, onSnapshot, query, setDoc, updateDoc, where } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { authErrorMessage } from '../lib/authErrors';
import { normalizeUsername, parentEmail } from '../lib/accountValidation';
import { createActivationRequest, getParentProfile, registerDevice, type FirebaseParentProfile } from '../services/firebaseDb';

export interface ParentProfile {
  user_id: string; username: string; parent_name: string; child_name: string; contact_phone: string | null;
}
export interface ParentAccess {
  activationCode: string | null; spellingBeeEnabled: boolean; aiFeaturesEnabled: boolean; beeTokens: number;
}
export interface ActivationRequest {
  id: string; request_code: string; wants_spelling_bee: boolean; wants_ai: boolean;
  status: 'pending' | 'approved' | 'cancelled' | 'rejected'; requested_at: string;
}
interface SignupDetails { username: string; password: string; parentName: string; childName: string; contactPhone: string }
interface ParentAccountContextValue {
  session: User | null; profile: ParentProfile | null; access: ParentAccess; pendingRequest: ActivationRequest | null;
  loading: boolean; actionLoading: boolean; error: string | null; configured: boolean; showAccount: boolean;
  setShowAccount: (show: boolean) => void; clearError: () => void;
  signIn: (username: string, password: string) => Promise<boolean>;
  signUp: (details: SignupDetails) => Promise<boolean>; signOut: () => Promise<void>; refresh: () => Promise<void>;
  requestActivation: (spelling: boolean, ai: boolean) => Promise<boolean>;
  updateProfile: (updates: Pick<ParentProfile, 'parent_name' | 'child_name' | 'contact_phone'>) => Promise<boolean>;
}
const EMPTY_ACCESS: ParentAccess = { activationCode: null, spellingBeeEnabled: false, aiFeaturesEnabled: false, beeTokens: 0 };
const ParentAccountContext = createContext<ParentAccountContextValue | null>(null);

function deviceId(uid: string) {
  const key = 'little_bee_device_v2_' + uid;
  try {
    const existing = localStorage.getItem(key);
    if (existing) return existing;
    const id = `${uid}_${crypto.randomUUID()}`;
    localStorage.setItem(key, id);
    return id;
  } catch { return uid + '_browser'; }
}
function usernameFor(user: User) {
  return user.email?.endsWith('@parents.littlebee.app') ? user.email.slice(0, -'@parents.littlebee.app'.length) : null;
}

export function ParentAccountProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<User | null>(null);
  const [profile, setProfile] = useState<ParentProfile | null>(null);
  const [access, setAccess] = useState<ParentAccess>(EMPTY_ACCESS);
  const [pendingRequest, setPendingRequest] = useState<ActivationRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAccount, setShowAccount] = useState(false);

  const applyProfile = useCallback((data: FirebaseParentProfile | null) => {
    if (!data || data.user_id !== auth.currentUser?.uid) {
      setProfile(null); setAccess(EMPTY_ACCESS); return;
    }
    setProfile({ user_id: data.user_id, username: data.username, parent_name: data.parent_name, child_name: data.child_name, contact_phone: data.contact_phone ?? null });
    setAccess({ activationCode: data.activation_code, spellingBeeEnabled: data.spelling_bee_enabled, aiFeaturesEnabled: data.ai_features_enabled, beeTokens: data.bee_tokens });
  }, []);

  useEffect(() => {
    let stopProfile: (() => void) | undefined;
    let stopRequests: (() => void) | undefined;
    const stop = onAuthStateChanged(auth, user => {
      stopProfile?.(); stopRequests?.();
      setSession(user); setProfile(null); setAccess(EMPTY_ACCESS); setPendingRequest(null);
      const username = user && usernameFor(user);
      if (!user || !username) { setLoading(false); return; }
      setLoading(true);
      stopProfile = onSnapshot(doc(db, 'parent_profiles', username), snap => {
        if (auth.currentUser?.uid !== user.uid) return;
        applyProfile(snap.exists() ? snap.data() as FirebaseParentProfile : null);
        setLoading(false);
      }, err => { applyProfile(null); setError(authErrorMessage(err)); setLoading(false); });
      stopRequests = onSnapshot(query(collection(db, 'activation_requests'), where('user_id', '==', user.uid)), snaps => {
        if (auth.currentUser?.uid !== user.uid) return;
        const pending = snaps.docs.map(s => ({ ...s.data(), id: s.id }) as ActivationRequest)
          .filter(r => r.status === 'pending').sort((a,b) => b.requested_at.localeCompare(a.requested_at));
        setPendingRequest(pending[0] ?? null);
      }, err => { setPendingRequest(null); setError(authErrorMessage(err)); });
    }, err => { setError(authErrorMessage(err)); setLoading(false); });
    return () => { stop(); stopProfile?.(); stopRequests?.(); };
  }, [applyProfile]);

  const action = async (operation: () => Promise<void>) => {
    setActionLoading(true); setError(null);
    try { await operation(); return true; }
    catch (err) { setError(authErrorMessage(err)); return false; }
    finally { setActionLoading(false); }
  };
  const signIn = (username: string, password: string) => action(async () => {
    const { user } = await signInWithEmailAndPassword(auth, parentEmail(username), password);
    try {
      const data = await getParentProfile(username);
      if (!data || data.user_id !== user.uid) throw new Error('Your account needs setup. Please contact reception.');
      await registerDevice(data, deviceId(user.uid));
      applyProfile(data);
    } catch (err) { await firebaseSignOut(auth); throw err; }
  });
  const signUp = (details: SignupDetails) => action(async () => {
    const email = parentEmail(details.username);
    if (details.password.length < 8) throw new Error('Password must be at least 8 characters.');
    if (!details.parentName.trim() || !details.childName.trim()) throw new Error('Enter parent and child names.');
    const { user } = await createUserWithEmailAndPassword(auth, email, details.password);
    const data: FirebaseParentProfile = {
      user_id: user.uid, username: normalizeUsername(details.username), parent_name: details.parentName.trim(),
      child_name: details.childName.trim(), contact_phone: details.contactPhone.trim() || null,
      activation_code: 'BEE-' + crypto.randomUUID(), spelling_bee_enabled: false, ai_features_enabled: false,
      bee_tokens: 0, created_at: new Date().toISOString(),
    };
    try {
      await setDoc(doc(db, 'parent_profiles', data.username), data);
    } catch (err) {
      await deleteUser(user).catch(() => undefined);
      await firebaseSignOut(auth);
      throw err;
    }
    applyProfile(data);
    await registerDevice(data, deviceId(user.uid));
  });
  const signOut = async () => { await action(() => firebaseSignOut(auth)); };
  const refresh = async () => {
    await action(async () => {
      await auth.authStateReady();
      const user = auth.currentUser;
      if (!user) { applyProfile(null); return; }
      await user.getIdToken();
      const username = usernameFor(user);
      applyProfile(username ? await getParentProfile(username) : null);
    });
  };
  const requestActivation = (spelling: boolean, ai: boolean) => action(async () => {
    if (!profile || profile.user_id !== auth.currentUser?.uid) throw new Error('Please sign in first.');
    if (!spelling && !ai) throw new Error('Select at least one product.');
    if (pendingRequest) return;
    const data = await getParentProfile(profile.username);
    if (!data) throw new Error('Account no longer exists.');
    const id = deviceId(profile.user_id);
    await registerDevice(data, id);
    const request = await createActivationRequest({ request_code: 'ACT-' + crypto.randomUUID(), user_id: profile.user_id,
      username: profile.username, device_id: id, wants_spelling_bee: spelling, wants_ai: ai });
    setPendingRequest(request);
  });
  const updateProfile = (updates: Pick<ParentProfile, 'parent_name' | 'child_name' | 'contact_phone'>) => action(async () => {
    if (!profile) throw new Error('Please sign in first.');
    if (!updates.parent_name.trim() || !updates.child_name.trim()) throw new Error('Enter parent and child names.');
    await updateDoc(doc(db, 'parent_profiles', profile.username), { parent_name: updates.parent_name.trim(), child_name: updates.child_name.trim(), contact_phone: updates.contact_phone?.trim() || null, updated_at: new Date().toISOString() });
  });
  return <ParentAccountContext.Provider value={{ session, profile, access, pendingRequest, loading, actionLoading, error, configured: true,
    showAccount, setShowAccount, clearError: () => setError(null), signIn, signUp, signOut, refresh, requestActivation, updateProfile }}>{children}</ParentAccountContext.Provider>;
}
export function useParentAccount() {
  const value = useContext(ParentAccountContext);
  if (!value) throw new Error('useParentAccount must be used inside ParentAccountProvider');
  return value;
}
