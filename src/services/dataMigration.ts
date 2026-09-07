import { doc, setDoc } from 'firebase/firestore';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import {
  saveParentProfile,
  getParentProfile,
  saveDevice,
  ensureMasterStaffBootstrapped,
  saveStaffUser,
  saveSystemMaintenance,
  saveLeaderboardScore,
  FirebaseParentProfile,
  FirebaseDevice,
  FirebaseActivationRequest,
  FirebaseStaffUser,
  FirebaseLeaderboardEntry,
} from './firebaseDb';
import { db } from '../lib/firebase';

export interface MigrationSummary {
  parentProfilesCount: number;
  devicesCount: number;
  walletsSyncedCount: number;
  activationRequestsCount: number;
  staffUsersCount: number;
  leaderboardCount: number;
  maintenanceSynced: boolean;
  errors: string[];
  notes: string[];
}

export async function migrateAllDataToFirebase(): Promise<MigrationSummary> {
  const summary: MigrationSummary = {
    parentProfilesCount: 0,
    devicesCount: 0,
    walletsSyncedCount: 0,
    activationRequestsCount: 0,
    staffUsersCount: 0,
    leaderboardCount: 0,
    maintenanceSynced: false,
    errors: [],
    notes: [],
  };

  // 1. Ensure Master Staff Accounts are bootstrapped in Firestore
  try {
    await ensureMasterStaffBootstrapped();
    summary.staffUsersCount += 3;
    summary.notes.push('Master admin accounts bootstrapped in Firebase');
  } catch (err: any) {
    summary.errors.push(`Staff bootstrap error: ${err?.message || err}`);
  }

  // 2. Merge Staff Users from Supabase
  if (isSupabaseConfigured) {
    try {
      const { data: staffList, error } = await supabase
        .from('staff_users')
        .select('*');

      if (!error && staffList && Array.isArray(staffList)) {
        for (const staff of staffList) {
          if (staff.email) {
            const staffObj: FirebaseStaffUser = {
              email: staff.email.trim().toLowerCase(),
              display_name: staff.display_name || staff.email.split('@')[0],
              role: staff.role || 'staff',
              active: staff.active ?? true,
              created_at: staff.created_at || new Date().toISOString(),
            };
            await saveStaffUser(staffObj);
            summary.staffUsersCount++;
          }
        }
      }
    } catch (staffErr: any) {
      // If RLS restricted, not fatal
    }
  }

  // 3. Merge Supabase App Settings (System Maintenance & Changelog)
  if (isSupabaseConfigured) {
    try {
      const { data: settingsData, error } = await supabase
        .from('app_settings')
        .select('*')
        .eq('key', 'system_maintenance')
        .maybeSingle();

      if (!error && settingsData?.value) {
        await saveSystemMaintenance(settingsData.value);
        summary.maintenanceSynced = true;
        summary.notes.push('Imported live system maintenance configuration from Supabase');
      }
    } catch (maintErr: any) {
      summary.errors.push(`Maintenance sync from Supabase error: ${maintErr?.message || maintErr}`);
    }
  }

  // Fallback / merge local maintenance settings if not already synced
  if (!summary.maintenanceSynced) {
    try {
      const localMaintRaw =
        localStorage.getItem('acebee_system_maintenance_v2') ||
        localStorage.getItem('little_bee_system_maintenance_v1');
      if (localMaintRaw) {
        const parsed = JSON.parse(localMaintRaw);
        await saveSystemMaintenance(parsed);
        summary.maintenanceSynced = true;
        summary.notes.push('Imported maintenance settings from local store');
      }
    } catch {
      // ignore
    }
  }

  // 4. Merge Supabase Spelling Bee Leaderboard entries (33+ historical records)
  if (isSupabaseConfigured) {
    try {
      const { data: leaderboardData, error } = await supabase
        .from('spelling_bee_leaderboard')
        .select('*')
        .order('score', { ascending: false });

      if (!error && leaderboardData && Array.isArray(leaderboardData)) {
        for (const entry of leaderboardData) {
          const lbEntry: FirebaseLeaderboardEntry = {
            id: entry.id || 'score_' + Math.random().toString(36).substring(2, 9),
            child_name: entry.child_name || 'Learner',
            theme_name: entry.theme_name || 'Spelling Bee',
            score: Number(entry.score) || 0,
            mastered_count: Number(entry.mastered_count) || 0,
            total_questions: Number(entry.total_questions) || 0,
            max_streak: Number(entry.max_streak) || 0,
            time_seconds: Number(entry.time_seconds) || 0,
            created_at: entry.created_at || new Date().toISOString(),
          };
          await saveLeaderboardScore(lbEntry);
          summary.leaderboardCount++;
        }
        summary.notes.push(`Merged ${summary.leaderboardCount} leaderboard scores from Supabase into Firebase`);
      }
    } catch (lbErr: any) {
      summary.errors.push(`Leaderboard sync error: ${lbErr?.message || lbErr}`);
    }
  }

  // Also merge local leaderboard scores
  try {
    const localLbRaw = localStorage.getItem('little_bee_spelling_leaderboard_v1');
    if (localLbRaw) {
      const parsedLocalLb = JSON.parse(localLbRaw);
      if (Array.isArray(parsedLocalLb)) {
        for (const localEntry of parsedLocalLb) {
          if (localEntry.id && localEntry.score) {
            await saveLeaderboardScore({
              id: localEntry.id,
              child_name: localEntry.child_name || 'Learner',
              theme_name: localEntry.theme_name || 'Spelling Bee',
              score: Number(localEntry.score) || 0,
              mastered_count: Number(localEntry.mastered_count) || 0,
              total_questions: Number(localEntry.total_questions) || 0,
              max_streak: Number(localEntry.max_streak) || 0,
              time_seconds: Number(localEntry.time_seconds) || 0,
              created_at: localEntry.created_at || new Date().toISOString(),
            });
          }
        }
      }
    }
  } catch {
    // ignore
  }

  // 5. Merge Wallets from Supabase (to match with parent accounts)
  const walletMap: Record<string, number> = {};
  if (isSupabaseConfigured) {
    try {
      const { data: walletsData } = await supabase
        .from('bee_token_wallets')
        .select('user_id, balance');

      if (walletsData && Array.isArray(walletsData)) {
        for (const w of walletsData) {
          if (w.user_id) {
            walletMap[w.user_id] = Number(w.balance) || 0;
            summary.walletsSyncedCount++;
          }
        }
      }
    } catch {
      // ignore
    }
  }

  // 6. Merge Parent Profiles from Supabase
  if (isSupabaseConfigured) {
    try {
      const { data: supabaseProfiles, error } = await supabase
        .from('parent_profiles')
        .select('*');

      if (!error && supabaseProfiles && Array.isArray(supabaseProfiles)) {
        for (const p of supabaseProfiles) {
          const username = (p.username || '').trim().toLowerCase();
          if (!username) continue;

          // Check if already in Firebase to preserve existing updates
          const existing = await getParentProfile(username);
          const assignedTokens = walletMap[p.user_id] ?? existing?.bee_tokens ?? 100;

          const profile: FirebaseParentProfile = {
            user_id: p.user_id,
            username: username,
            password: existing?.password || '12345678',
            parent_name: p.parent_name || existing?.parent_name || 'Parent',
            child_name: p.child_name || existing?.child_name || 'Student',
            contact_phone: p.contact_phone ?? existing?.contact_phone ?? null,
            activation_code: existing?.activation_code || `BEE-${Math.floor(1000 + Math.random() * 9000)}`,
            spelling_bee_enabled: existing?.spelling_bee_enabled ?? true,
            ai_features_enabled: existing?.ai_features_enabled ?? true,
            bee_tokens: assignedTokens,
            created_at: p.created_at || existing?.created_at || new Date().toISOString(),
          };

          await saveParentProfile(profile);
          summary.parentProfilesCount++;
        }
      }
    } catch (profErr: any) {
      summary.errors.push(`Supabase parent profiles error: ${profErr?.message || profErr}`);
    }
  }

  // Merge Local Accounts from localStorage (both key versions)
  const localKeys = ['little_bee_local_accounts_v1', 'acebee_local_parent_accounts'];
  for (const lKey of localKeys) {
    try {
      const raw = localStorage.getItem(lKey);
      if (raw) {
        const localAccounts = JSON.parse(raw);
        for (const [keyUser, acc] of Object.entries<any>(localAccounts)) {
          const uname = (acc.profile?.username || keyUser).trim().toLowerCase();
          if (!uname) continue;

          const existing = await getParentProfile(uname);
          const profile: FirebaseParentProfile = {
            user_id: acc.profile?.user_id || existing?.user_id || `local_${uname}`,
            username: uname,
            password: acc.password || existing?.password || '12345678',
            parent_name: acc.profile?.parent_name || existing?.parent_name || 'Parent',
            child_name: acc.profile?.child_name || existing?.child_name || 'Student',
            contact_phone: acc.profile?.contact_phone || existing?.contact_phone || null,
            activation_code: acc.access?.activationCode || existing?.activation_code || `BEE-${Math.floor(1000 + Math.random() * 9000)}`,
            spelling_bee_enabled: acc.access?.spellingBeeEnabled ?? existing?.spelling_bee_enabled ?? true,
            ai_features_enabled: acc.access?.aiFeaturesEnabled ?? existing?.ai_features_enabled ?? true,
            bee_tokens: acc.access?.beeTokens ?? existing?.bee_tokens ?? 100,
            created_at: existing?.created_at || new Date().toISOString(),
          };

          await saveParentProfile(profile);
          summary.parentProfilesCount++;
        }
      }
    } catch {
      // ignore
    }
  }

  // 7. Merge Devices & Entitlements from Supabase
  if (isSupabaseConfigured) {
    try {
      const { data: supabaseDevices, error } = await supabase
        .from('devices')
        .select('*, entitlements(*)');

      if (!error && supabaseDevices && Array.isArray(supabaseDevices)) {
        for (const d of supabaseDevices) {
          const entitlements = Array.isArray(d.entitlements) ? d.entitlements : [];
          const spellingActive = entitlements.some(
            (e: any) => e.product_slug === 'spelling_bee' && Boolean(e.active)
          );
          const aiActive = entitlements.some(
            (e: any) => e.product_slug === 'ai_features' && Boolean(e.active)
          );

          const device: FirebaseDevice = {
            id: d.id,
            activation_code: d.activation_code || `BEE-${Math.floor(1000 + Math.random() * 9000)}`,
            parent_name: d.parent_name,
            child_name: d.child_name,
            notes: d.notes,
            owner_user_id: d.owner_user_id,
            spelling_bee_enabled: entitlements.length > 0 ? spellingActive : true,
            ai_features_enabled: entitlements.length > 0 ? aiActive : true,
            created_at: d.created_at || new Date().toISOString(),
            last_seen_at: d.last_seen_at || new Date().toISOString(),
            entitlements: entitlements.map((e: any) => ({
              id: e.id,
              product_slug: e.product_slug,
              active: Boolean(e.active),
              expires_at: e.expires_at || null,
            })),
          };

          await saveDevice(device);
          summary.devicesCount++;
        }
      }
    } catch (devErr: any) {
      summary.errors.push(`Supabase devices error: ${devErr?.message || devErr}`);
    }
  }

  // 8. Merge Activation Requests from Supabase
  if (isSupabaseConfigured) {
    try {
      const { data: requestsData, error } = await supabase
        .from('activation_requests')
        .select('*');

      if (!error && requestsData && Array.isArray(requestsData)) {
        for (const r of requestsData) {
          const reqItem: FirebaseActivationRequest = {
            id: r.id,
            request_code: r.request_code,
            user_id: r.user_id,
            device_id: r.device_id,
            wants_spelling_bee: Boolean(r.wants_spelling_bee),
            wants_ai: Boolean(r.wants_ai),
            status: r.status === 'approved' ? 'approved' : r.status === 'rejected' ? 'rejected' : 'pending',
            requested_at: r.requested_at || new Date().toISOString(),
          };
          await setDoc(doc(db, 'activation_requests', r.id), reqItem, { merge: true });
          summary.activationRequestsCount++;
        }
      }
    } catch {
      // ignore
    }
  }

  return summary;
}
