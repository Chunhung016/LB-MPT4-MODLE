import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../lib/firebase';

export interface FirebaseParentProfile {
  user_id: string;
  username: string;
  password?: string;
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
  email: string;
  display_name: string;
  role: 'admin' | 'staff';
  active: boolean;
  created_at: string;
}

// Master Admin List (Guaranteed immediate access)
const MASTER_ADMIN_EMAILS = [
  'admin@lb.com',
  'chunhung520@gmail.com',
  'admin@littlebee.app',
];

export const normalizeUsername = (username: string) =>
  username.trim().toLowerCase().replace(/[^a-z0-9._-]/g, '');

/**
 * PARENT PROFILES
 */
export async function getParentProfile(username: string): Promise<FirebaseParentProfile | null> {
  const norm = normalizeUsername(username);
  if (!norm) return null;
  try {
    const snap = await getDoc(doc(db, 'parent_profiles', norm));
    if (snap.exists()) {
      return snap.data() as FirebaseParentProfile;
    }
  } catch (err) {
    console.error('Error fetching parent profile:', err);
  }
  return null;
}

export async function saveParentProfile(profile: FirebaseParentProfile): Promise<void> {
  const norm = normalizeUsername(profile.username);
  await setDoc(
    doc(db, 'parent_profiles', norm),
    {
      ...profile,
      username: norm,
      updated_at: new Date().toISOString(),
    },
    { merge: true }
  );
}

export async function getAllParentProfiles(): Promise<Record<string, FirebaseParentProfile>> {
  const result: Record<string, FirebaseParentProfile> = {};
  try {
    const snaps = await getDocs(collection(db, 'parent_profiles'));
    snaps.forEach((d) => {
      const data = d.data() as FirebaseParentProfile;
      result[data.user_id || d.id] = data;
    });
  } catch (err) {
    console.error('Error fetching all parent profiles:', err);
  }
  return result;
}

export async function deleteParentProfile(username: string): Promise<void> {
  const norm = normalizeUsername(username);
  await deleteDoc(doc(db, 'parent_profiles', norm));
}

/**
 * DEVICES
 */
export async function getDevice(deviceId: string): Promise<FirebaseDevice | null> {
  try {
    const snap = await getDoc(doc(db, 'devices', deviceId));
    if (snap.exists()) {
      return snap.data() as FirebaseDevice;
    }
  } catch (err) {
    console.error('Error fetching device:', err);
  }
  return null;
}

export async function saveDevice(device: FirebaseDevice): Promise<void> {
  await setDoc(doc(db, 'devices', device.id), device, { merge: true });
}

export async function getAllDevices(): Promise<FirebaseDevice[]> {
  const list: FirebaseDevice[] = [];
  try {
    const snaps = await getDocs(collection(db, 'devices'));
    snaps.forEach((d) => {
      list.push(d.data() as FirebaseDevice);
    });
    list.sort((a, b) => new Date(b.last_seen_at).getTime() - new Date(a.last_seen_at).getTime());
  } catch (err) {
    console.error('Error fetching devices:', err);
  }
  return list;
}

export async function deleteDevice(deviceId: string): Promise<void> {
  await deleteDoc(doc(db, 'devices', deviceId));
}

/**
 * ACTIVATION REQUESTS
 */
export async function createActivationRequest(
  req: Omit<FirebaseActivationRequest, 'id' | 'requested_at' | 'status'>
): Promise<FirebaseActivationRequest> {
  const id = 'req_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
  const data: FirebaseActivationRequest = {
    ...req,
    id,
    status: 'pending',
    requested_at: new Date().toISOString(),
  };
  await setDoc(doc(db, 'activation_requests', id), data);
  return data;
}

export async function getPendingActivationRequests(): Promise<FirebaseActivationRequest[]> {
  const list: FirebaseActivationRequest[] = [];
  try {
    const q = query(
      collection(db, 'activation_requests'),
      where('status', '==', 'pending')
    );
    const snaps = await getDocs(q);
    snaps.forEach((d) => {
      list.push(d.data() as FirebaseActivationRequest);
    });
    list.sort((a, b) => new Date(a.requested_at).getTime() - new Date(b.requested_at).getTime());
  } catch (err) {
    console.error('Error fetching activation requests:', err);
  }
  return list;
}

export async function updateActivationRequestStatus(
  id: string,
  status: 'approved' | 'rejected'
): Promise<void> {
  await setDoc(doc(db, 'activation_requests', id), { status }, { merge: true });
}

/**
 * STAFF USERS & ADMIN CHECK
 */
export async function isStaffUser(email: string): Promise<boolean> {
  const normEmail = email.trim().toLowerCase();
  if (
    MASTER_ADMIN_EMAILS.includes(normEmail) ||
    normEmail.startsWith('admin@')
  ) {
    return true;
  }

  try {
    const snap = await getDoc(doc(db, 'staff_users', normEmail));
    if (snap.exists() && snap.data()?.active) {
      return true;
    }
  } catch (err) {
    console.error('Error checking staff user:', err);
  }
  return false;
}

export async function ensureMasterStaffBootstrapped(): Promise<void> {
  for (const adminEmail of MASTER_ADMIN_EMAILS) {
    try {
      await setDoc(
        doc(db, 'staff_users', adminEmail),
        {
          email: adminEmail,
          display_name: adminEmail.split('@')[0],
          role: 'admin',
          active: true,
          created_at: new Date().toISOString(),
        },
        { merge: true }
      );
    } catch {
      // Ignore
    }
  }
}

/**
 * SYSTEM MAINTENANCE SETTINGS
 */
export async function getSystemMaintenance(): Promise<any | null> {
  try {
    const snap = await getDoc(doc(db, 'app_settings', 'system_maintenance'));
    if (snap.exists()) {
      return snap.data()?.config || snap.data();
    }
  } catch (err) {
    console.error('Error getting system maintenance setting:', err);
  }
  return null;
}

export async function saveSystemMaintenance(config: any): Promise<void> {
  await setDoc(
    doc(db, 'app_settings', 'system_maintenance'),
    {
      config,
      updated_at: new Date().toISOString(),
    },
    { merge: true }
  );
}

export function subscribeSystemMaintenance(
  callback: (config: any) => void
): () => void {
  return onSnapshot(
    doc(db, 'app_settings', 'system_maintenance'),
    (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        callback(data?.config || data);
      }
    },
    (err) => {
      console.warn('Error listening to maintenance status:', err);
    }
  );
}

/**
 * SPELLING BEE LEADERBOARD
 */
export interface FirebaseLeaderboardEntry {
  id: string;
  child_name: string;
  theme_name: string;
  score: number;
  mastered_count: number;
  total_questions: number;
  max_streak: number;
  time_seconds: number;
  created_at: string;
}

export async function saveLeaderboardScore(entry: FirebaseLeaderboardEntry): Promise<void> {
  await setDoc(doc(db, 'spelling_bee_leaderboard', entry.id), entry, { merge: true });
}

export async function getLeaderboardScores(filter: 'all' | 'today' = 'all'): Promise<FirebaseLeaderboardEntry[]> {
  const list: FirebaseLeaderboardEntry[] = [];
  try {
    const q = query(
      collection(db, 'spelling_bee_leaderboard'),
      orderBy('score', 'desc')
    );
    const snaps = await getDocs(q);
    snaps.forEach((d) => {
      list.push(d.data() as FirebaseLeaderboardEntry);
    });

    if (filter === 'today') {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const startOfDayTime = startOfDay.getTime();
      return list.filter((e) => new Date(e.created_at).getTime() >= startOfDayTime);
    }
    return list;
  } catch (err) {
    console.error('Error fetching leaderboard scores from Firestore:', err);
    return [];
  }
}

export async function clearLeaderboardScores(): Promise<void> {
  try {
    const snaps = await getDocs(collection(db, 'spelling_bee_leaderboard'));
    for (const d of snaps.docs) {
      await deleteDoc(d.ref);
    }
  } catch (err) {
    console.error('Error clearing leaderboard scores from Firestore:', err);
  }
}

export async function saveStaffUser(user: FirebaseStaffUser): Promise<void> {
  const normEmail = user.email.trim().toLowerCase();
  await setDoc(doc(db, 'staff_users', normEmail), {
    ...user,
    email: normEmail,
  }, { merge: true });
}

export async function getAllStaffUsers(): Promise<FirebaseStaffUser[]> {
  const list: FirebaseStaffUser[] = [];
  try {
    const snaps = await getDocs(collection(db, 'staff_users'));
    snaps.forEach((d) => {
      list.push(d.data() as FirebaseStaffUser);
    });
  } catch (err) {
    console.error('Error getting staff users:', err);
  }
  return list;
}
