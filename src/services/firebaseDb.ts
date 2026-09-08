import { collection, doc, getDoc, getDocs, setDoc, updateDoc, query, where, orderBy, onSnapshot, runTransaction, limit } from 'firebase/firestore';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { db, auth } from '../lib/firebase';
import { normalizeUsername, tokenAmount } from '../lib/accountValidation';
import { authErrorMessage } from '../lib/authErrors';
import { manageParentAccount } from '../lib/accountApi';
export { normalizeUsername } from '../lib/accountValidation';
export interface FirebaseParentProfile {
  user_id: string;
  username: string;
  parent_name: string;
  child_name: string;
  contact_phone?: string | null;
  activation_code: string;
  spelling_bee_enabled: boolean;
  ai_features_enabled: boolean;
  bee_tokens: number;
  created_at: string;
  updated_at?: string;
}

export interface FirebaseDevice {
  id: string;
  activation_code: string;
  parent_name?: string | null;
  child_name?: string | null;
  notes?: string | null;
  owner_user_id?: string | null;
  owner_username?: string | null;
  spelling_bee_enabled: boolean;
  ai_features_enabled: boolean;
  created_at: string;
  last_seen_at: string;
  entitlements?: Array<{
    id: string;
    product_slug: 'spelling_bee' | 'ai_features';
    active: boolean;
    expires_at: string | null;
  }>;
}

export interface FirebaseActivationRequest {
  id: string;
  request_code: string;
  user_id: string;
  username?: string;
  device_id: string;
  wants_spelling_bee: boolean;
  wants_ai: boolean;
  status: 'pending' | 'approved' | 'rejected';
  requested_at: string;
}

export interface FirebaseStaffUser {
  user_id: string;
  email: string;
  display_name: string;
  role: 'admin' | 'staff';
  active: boolean;
  created_at: string;
}


export async function getParentProfile(username: string): Promise<FirebaseParentProfile | null> {
  const snap = await getDoc(doc(db, 'parent_profiles', normalizeUsername(username)));
  return snap.exists() ? snap.data() as FirebaseParentProfile : null;
}
export async function getAllParentProfiles(): Promise<Record<string, FirebaseParentProfile>> {
  const snapshots = await getDocs(collection(db, 'parent_profiles'));
  return Object.fromEntries(snapshots.docs.map(s => [s.data().user_id, s.data() as FirebaseParentProfile]));
}
export async function getAllDevices(): Promise<FirebaseDevice[]> {
  const snapshots = await getDocs(collection(db, 'devices'));
  return snapshots.docs.map(s => ({ ...s.data(), id: s.id }) as FirebaseDevice).sort((a,b) => b.last_seen_at.localeCompare(a.last_seen_at));
}
export async function registerDevice(profile: FirebaseParentProfile, deviceId: string) {
  const ref = doc(db, 'devices', deviceId);
  await runTransaction(db, async tx => {
    const existing = await tx.get(ref);
    if (existing.exists()) {
      if (existing.data().owner_user_id !== profile.user_id) throw new Error('Device belongs to a different account.');
      tx.update(ref, { last_seen_at: new Date().toISOString() });
    } else {
      tx.set(ref, {
        id: deviceId, activation_code: profile.activation_code, owner_user_id: profile.user_id,
        owner_username: profile.username, parent_name: profile.parent_name, child_name: profile.child_name,
        spelling_bee_enabled: false, ai_features_enabled: false,
        created_at: new Date().toISOString(), last_seen_at: new Date().toISOString(),
      });
    }
  });
}
export async function createActivationRequest(req: Omit<FirebaseActivationRequest, 'id' | 'requested_at' | 'status'>) {
  // One pending request per account, including requests from multiple devices.
  const ref = doc(db, 'activation_requests', req.user_id);
  return runTransaction(db, async tx => {
    const snap = await tx.get(ref);
    if (snap.exists() && snap.data().status === 'pending') return snap.data() as FirebaseActivationRequest;
    const data: FirebaseActivationRequest = { ...req, id: req.user_id, status: 'pending', requested_at: new Date().toISOString() };
    tx.set(ref, data);
    return data;
  });
}
export async function getPendingActivationRequests(): Promise<FirebaseActivationRequest[]> {
  const snapshots = await getDocs(query(collection(db, 'activation_requests'), where('status', '==', 'pending')));
  return snapshots.docs.map(s => ({ ...s.data(), id: s.id }) as FirebaseActivationRequest).sort((a,b) => a.requested_at.localeCompare(b.requested_at));
}
export async function isStaffUser(email: string): Promise<boolean> {
  const user = auth.currentUser;
  if (!user || user.email?.toLowerCase() !== email.toLowerCase()) return false;
  const snapshot = await getDoc(doc(db, 'staff_users', email.trim().toLowerCase()));
  const staff = snapshot.data();
  return staff?.user_id === user.uid && staff?.active === true && ['admin', 'staff'].includes(staff?.role);
}
export async function authenticateStaffUser(email: string, password: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { user } = await signInWithEmailAndPassword(auth, email.trim().toLowerCase(), password);
    if (!(await isStaffUser(user.email!))) {
      await signOut(auth);
      return { success: false, error: 'This account is not approved for staff access. Contact the administrator.' };
    }
    return { success: true };
  } catch (error) {
    return { success: false, error: authErrorMessage(error) };
  }
}
export async function setParentProduct(username: string, product: 'spelling_bee' | 'ai_features', active: boolean) {
  await updateDoc(doc(db, 'parent_profiles', normalizeUsername(username)), { [product + '_enabled']: active, updated_at: new Date().toISOString() });
}
export async function setDeviceProduct(id: string, product: 'spelling_bee' | 'ai_features', active: boolean) {
  await updateDoc(doc(db, 'devices', id), { [product + '_enabled']: active });
}
export async function addBeeTokens(username: string, amount: number) {
  tokenAmount(amount, false);
  const ref = doc(db, 'parent_profiles', normalizeUsername(username));
  await runTransaction(db, async tx => {
    const snap = await tx.get(ref);
    if (!snap.exists()) throw new Error('Parent account no longer exists.');
    const balance = Number(snap.data().bee_tokens ?? 0) + amount;
    if (!Number.isSafeInteger(balance)) throw new Error('Token balance exceeds the supported limit.');
    tx.update(ref, { bee_tokens: balance, updated_at: new Date().toISOString() });
  });
}
export async function approveActivation(id: string, username: string, spelling: boolean, ai: boolean, amount: number) {
  tokenAmount(amount);
  const requestRef = doc(db, 'activation_requests', id);
  const profileRef = doc(db, 'parent_profiles', normalizeUsername(username));
  await runTransaction(db, async tx => {
    const request = await tx.get(requestRef);
    const profile = await tx.get(profileRef);
    if (!request.exists() || !profile.exists()) throw new Error('Request or account no longer exists.');
    if (request.data().user_id !== profile.data().user_id) throw new Error('Request does not belong to this account.');
    if (request.data().status !== 'pending') throw new Error('This request has already been processed.');
    const balance = Number(profile.data().bee_tokens ?? 0) + amount;
    if (!Number.isSafeInteger(balance)) throw new Error('Token balance exceeds the supported limit.');
    tx.update(profileRef, {
      spelling_bee_enabled: spelling || profile.data().spelling_bee_enabled,
      ai_features_enabled: ai || profile.data().ai_features_enabled,
      bee_tokens: balance, updated_at: new Date().toISOString(),
    });
    tx.update(requestRef, { status: 'approved' });
  });
}
export async function getSystemMaintenance(): Promise<any | null> {
  const snap = await getDoc(doc(db, 'app_settings', 'system_maintenance'));
  return snap.exists() ? snap.data().config ?? snap.data() : null;
}
export async function saveSystemMaintenance(config: any) {
  await setDoc(doc(db, 'app_settings', 'system_maintenance'), { config, updated_at: new Date().toISOString() });
}
export function subscribeSystemMaintenance(callback: (config: any) => void): () => void {
  return onSnapshot(doc(db, 'app_settings', 'system_maintenance'), snap => callback(snap.exists() ? snap.data().config ?? snap.data() : null), error => console.warn('Maintenance sync unavailable:', error.code));
}
export interface FirebaseLeaderboardEntry {
  id: string; user_id?: string; child_name: string; theme_name: string; score: number; mastered_count: number;
  total_questions: number; max_streak: number; time_seconds: number; created_at: string;
}
export async function saveLeaderboardScore(entry: FirebaseLeaderboardEntry) {
  if (!auth.currentUser) throw new Error('Please sign in before saving your score.');
  await setDoc(doc(db, 'spelling_bee_leaderboard', entry.id), { ...entry, user_id: auth.currentUser.uid });
}
export async function getLeaderboardScores(filter: 'all' | 'today' = 'all'): Promise<FirebaseLeaderboardEntry[]> {
  const start = new Date(); start.setHours(0,0,0,0);
  const constraints = filter === 'today' ? [where('created_at', '>=', start.toISOString())] : [];
  const snaps = await getDocs(query(collection(db, 'spelling_bee_leaderboard'), ...constraints, orderBy('score', 'desc'), limit(100)));
  return snaps.docs.map(s => s.data() as FirebaseLeaderboardEntry);
}
export async function clearLeaderboardScores() {
  await manageParentAccount({ action: 'clear_leaderboard' });
}
