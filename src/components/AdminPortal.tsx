import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  Bot,
  Check,
  Coins,
  Copy,
  Download,
  FileSpreadsheet,
  KeyRound,
  LoaderCircle,
  LogOut,
  Plus,
  Printer,
  QrCode,
  RefreshCw,
  Save,
  Search,
  ShieldCheck,
  Sparkles,
  Trash2,
  Upload,
  UserRound,
  Users,
  Smartphone,
  Wrench,
  X,
  Share2,
} from 'lucide-react';
import type { Session, User } from '@supabase/supabase-js';
import PeacefulBeeBackground from './PeacefulBeeBackground';
import ActivationQrScannerModal from './ActivationQrScannerModal';
import ResetPasswordModal from './ResetPasswordModal';
import BulkImportModal from './BulkImportModal';
import PrintableRosterModal, { RosterItem } from './PrintableRosterModal';
import AdminMaintenanceTab from './AdminMaintenanceTab';
import { useMaintenance } from '../context/MaintenanceContext';
import { isSupabaseConfigured, supabase, getFunctionErrorMessage } from '../lib/supabase';
import { exportToCSV, exportToJSON } from '../utils/csvHelper';

interface EntitlementRow {
  id: string;
  product_slug: string;
  active: boolean;
  expires_at: string | null;
}

interface DeviceRow {
  id: string;
  activation_code: string;
  parent_name: string | null;
  child_name: string | null;
  notes: string | null;
  created_at: string;
  last_seen_at: string;
  owner_user_id: string | null;
  entitlements: EntitlementRow[];
}

interface ParentProfileRow {
  user_id: string;
  username: string;
  parent_name: string;
  child_name: string;
  contact_phone: string | null;
}

interface ActivationRequestRow {
  id: string;
  request_code: string;
  user_id: string;
  device_id: string;
  wants_spelling_bee: boolean;
  wants_ai: boolean;
  status: string;
  requested_at: string;
}

interface ActivationDraft {
  spellingBee: boolean;
  ai: boolean;
  tokens: string;
}

function hasProduct(device: DeviceRow, productSlug: 'spelling_bee' | 'ai_features') {
  const entitlement = device.entitlements?.find((item) => item.product_slug === productSlug);
  return Boolean(
    entitlement?.active &&
      (!entitlement.expires_at || new Date(entitlement.expires_at).getTime() > Date.now())
  );
}

export default function AdminPortal() {
  const { isMaintenanceBlocking } = useMaintenance();
  const [session, setSession] = useState<Session | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [isStaff, setIsStaff] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [activeTab, setActiveTab] = useState<'directory' | 'activation' | 'devices' | 'maintenance'>('directory');
  
  const [devices, setDevices] = useState<DeviceRow[]>([]);
  const [profiles, setProfiles] = useState<Record<string, ParentProfileRow>>({});
  const [wallets, setWallets] = useState<Record<string, number>>({});
  const [activationRequests, setActivationRequests] = useState<ActivationRequestRow[]>([]);
  const [activationDrafts, setActivationDrafts] = useState<Record<string, ActivationDraft>>({});
  
  const [search, setSearch] = useState('');
  const [activationSearch, setActivationSearch] = useState('');
  const [dataError, setDataError] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  // Modals
  const [showAddParent, setShowAddParent] = useState(false);
  const [creatingParent, setCreatingParent] = useState(false);
  const [newParent, setNewParent] = useState({
    username: '',
    password: '',
    parentName: '',
    childName: '',
    contactPhone: '',
  });
  const [resetModalUser, setResetModalUser] = useState<ParentProfileRow | null>(null);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [printRosterOpen, setPrintRosterOpen] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [reloadAmounts, setReloadAmounts] = useState<Record<string, string>>({});

  const checkStaff = useCallback(async (user: User | null) => {
    if (!user) {
      setIsStaff(false);
      return false;
    }

    if (!isSupabaseConfigured) {
      // In local dev mode without cloud supabase, allow access
      setIsStaff(true);
      return true;
    }

    const { data, error } = await supabase
      .from('staff_users')
      .select('user_id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) {
      setAuthError(error.message);
      setIsStaff(false);
      return false;
    }

    const allowed = Boolean(data);
    setIsStaff(allowed);
    return allowed;
  }, []);

  const loadLocalData = useCallback(() => {
    try {
      const raw = localStorage.getItem('little_bee_local_accounts_v1');
      if (raw) {
        const localAccounts = JSON.parse(raw);
        const localProfiles: Record<string, ParentProfileRow> = {};
        const localWallets: Record<string, number> = {};
        const localDevices: DeviceRow[] = [];

        Object.values(localAccounts).forEach((acc: any) => {
          if (acc?.profile) {
            localProfiles[acc.profile.user_id] = acc.profile;
            localWallets[acc.profile.user_id] = acc.access?.beeTokens || 0;
            if (acc.access?.activationCode) {
              localDevices.push({
                id: 'dev_' + acc.profile.user_id,
                activation_code: acc.access.activationCode,
                parent_name: acc.profile.parent_name,
                child_name: acc.profile.child_name,
                notes: 'Local App Device',
                created_at: new Date().toISOString(),
                last_seen_at: new Date().toISOString(),
                owner_user_id: acc.profile.user_id,
                entitlements: [
                  {
                    id: 'ent_spelling_' + acc.profile.user_id,
                    product_slug: 'spelling_bee',
                    active: Boolean(acc.access.spellingBeeEnabled),
                    expires_at: null,
                  },
                  {
                    id: 'ent_ai_' + acc.profile.user_id,
                    product_slug: 'ai_features',
                    active: Boolean(acc.access.aiFeaturesEnabled),
                    expires_at: null,
                  },
                ],
              });
            }
          }
        });

        return { localProfiles, localWallets, localDevices };
      }
    } catch {
      // ignore
    }
    return { localProfiles: {}, localWallets: {}, localDevices: [] };
  }, []);

  const loadDevices = useCallback(async () => {
    setDataError(null);

    if (!isSupabaseConfigured) {
      const { localProfiles, localWallets, localDevices } = loadLocalData();
      setProfiles(localProfiles);
      setWallets(localWallets);
      setDevices(localDevices);
      setActivationRequests([]);
      return;
    }

    const [deviceResult, requestResult, profileResult, walletResult] = await Promise.all([
      supabase
        .from('devices')
        .select(
          'id, activation_code, parent_name, child_name, notes, created_at, last_seen_at, owner_user_id, entitlements(id, product_slug, active, expires_at)'
        )
        .order('last_seen_at', { ascending: false }),
      supabase
        .from('activation_requests')
        .select(
          'id, request_code, user_id, device_id, wants_spelling_bee, wants_ai, status, requested_at'
        )
        .eq('status', 'pending')
        .order('requested_at', { ascending: true }),
      supabase
        .from('parent_profiles')
        .select('user_id, username, parent_name, child_name, contact_phone'),
      supabase.from('bee_token_wallets').select('user_id, balance'),
    ]);

    const firstError =
      deviceResult.error ?? requestResult.error ?? profileResult.error ?? walletResult.error;
    if (firstError) {
      setDataError(firstError.message);
      return;
    }

    const cloudProfiles = Object.fromEntries(
      ((profileResult.data ?? []) as ParentProfileRow[]).map((p) => [p.user_id, p])
    );
    const cloudWallets = Object.fromEntries(
      (walletResult.data ?? []).map((w) => [w.user_id, Number(w.balance)])
    );

    // Merge any local accounts if present
    const { localProfiles, localWallets } = loadLocalData();
    const mergedProfiles = { ...localProfiles, ...cloudProfiles };
    const mergedWallets = { ...localWallets, ...cloudWallets };

    setDevices((deviceResult.data ?? []) as DeviceRow[]);
    setActivationRequests((requestResult.data ?? []) as ActivationRequestRow[]);
    setProfiles(mergedProfiles);
    setWallets(mergedWallets);
  }, [loadLocalData]);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setAuthReady(true);
      setIsStaff(true);
      void loadDevices();
      return;
    }

    void supabase.auth.getSession().then(async ({ data, error }) => {
      if (error) {
        setAuthError(`Unable to connect to Supabase Auth: ${error.message}`);
        setAuthReady(true);
        return;
      }
      setSession(data.session);
      const allowed = await checkStaff(data.session?.user ?? null);
      if (allowed) await loadDevices();
      setAuthReady(true);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      void checkStaff(nextSession?.user ?? null).then((allowed) => {
        if (allowed) void loadDevices();
      });
    });

    return () => listener.subscription.unsubscribe();
  }, [checkStaff, loadDevices]);

  // Combined Roster for Parent Directory & Export
  const allParentRoster: RosterItem[] = useMemo(() => {
    const profileList = Object.values(profiles) as ParentProfileRow[];
    const deviceMap = new Map<string, DeviceRow>();
    devices.forEach((dev) => {
      if (dev.owner_user_id) deviceMap.set(dev.owner_user_id, dev);
    });

    return profileList.map((profile) => {
      const dev = deviceMap.get(profile.user_id);
      const spellingBee = dev ? hasProduct(dev, 'spelling_bee') : false;
      const aiFeatures = dev ? hasProduct(dev, 'ai_features') : false;
      const tokens = wallets[profile.user_id] ?? 0;

      return {
        userId: profile.user_id,
        childName: profile.child_name || 'Student',
        parentName: profile.parent_name || 'Parent',
        username: profile.username,
        contactPhone: profile.contact_phone || '',
        activationCode: dev?.activation_code || 'Pending Device',
        beeTokens: tokens,
        spellingBee,
        aiFeatures,
        status: dev ? 'Device Linked' : 'Waiting for Login',
      };
    });
  }, [devices, profiles, wallets]);

  const filteredParents = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return allParentRoster;
    return allParentRoster.filter((item) =>
      [item.childName, item.parentName, item.username, item.contactPhone, item.activationCode]
        .filter(Boolean)
        .some((val) => val.toLowerCase().includes(query))
    );
  }, [allParentRoster, search]);

  const filteredDevices = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return devices;
    return devices.filter((device) =>
      [device.activation_code, device.parent_name, device.child_name, device.notes]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(query))
    );
  }, [devices, search]);

  const filteredActivationRequests = useMemo(() => {
    const query = activationSearch.trim().toLowerCase();
    if (!query) return activationRequests;
    return activationRequests.filter((request) => {
      const profile = profiles[request.user_id];
      return [request.request_code, profile?.username, profile?.parent_name, profile?.child_name]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(query));
    });
  }, [activationRequests, activationSearch, profiles]);

  const signIn = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setAuthError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setAuthError(
        error.message.toLowerCase().includes('fetch')
          ? 'Unable to reach Supabase Auth. Please refresh and check internet connection.'
          : error.message
      );
    }
    setBusy(false);
  };

  const createParentAccount = async (event: FormEvent) => {
    event.preventDefault();
    setCreatingParent(true);
    setDataError(null);

    const cleanUsername = newParent.username.trim().toLowerCase();

    if (!isSupabaseConfigured) {
      // Local account creation
      const raw = localStorage.getItem('little_bee_local_accounts_v1') || '{}';
      const accounts = JSON.parse(raw);
      accounts[cleanUsername] = {
        profile: {
          user_id: 'local_' + cleanUsername,
          username: cleanUsername,
          parent_name: newParent.parentName.trim(),
          child_name: newParent.childName.trim(),
          contact_phone: newParent.contactPhone.trim() || null,
        },
        password: newParent.password,
        access: {
          activationCode: 'BEE-' + Math.floor(1000 + Math.random() * 9000),
          spellingBeeEnabled: true,
          aiFeaturesEnabled: true,
          beeTokens: 100,
        },
        pendingRequest: null,
      };
      localStorage.setItem('little_bee_local_accounts_v1', JSON.stringify(accounts));
      setNewParent({ username: '', password: '', parentName: '', childName: '', contactPhone: '' });
      setShowAddParent(false);
      await loadDevices();
      setCreatingParent(false);
      return;
    }

    const { data, error } = await supabase.functions.invoke('manage-parent-account', {
      body: {
        action: 'create',
        username: cleanUsername,
        password: newParent.password,
        parentName: newParent.parentName,
        childName: newParent.childName,
        contactPhone: newParent.contactPhone,
      },
    });

    if (error || data?.error) {
      const msg = await getFunctionErrorMessage(error, data);
      setDataError(msg || 'Unable to create the parent account.');
    } else {
      setNewParent({ username: '', password: '', parentName: '', childName: '', contactPhone: '' });
      setShowAddParent(false);
      await loadDevices();
    }
    setCreatingParent(false);
  };

  const generateRandomPassword = () => {
    const prefixes = ['bee', 'honey', 'little', 'smart', 'star'];
    const randomPrefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    setNewParent((prev) => ({ ...prev, password: `${randomPrefix}${randomNum}pass` }));
  };

  const copyUsername = (username: string, id: string) => {
    navigator.clipboard.writeText(username).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const copyParentCard = (parent: RosterItem) => {
    const text = `🐝 *Little Bee Learning Centre Login*
👤 *Child:* ${parent.childName}
👨‍👩‍👧 *Parent:* ${parent.parentName}
🔑 *Username:* ${parent.username}
📱 *Contact:* ${parent.contactPhone || '—'}
🌐 *App Link:* ${window.location.origin}

_If you need your password reset, please contact reception!_`;

    navigator.clipboard.writeText(text).then(() => {
      setCopiedId('card_' + parent.userId);
      setTimeout(() => setCopiedId(null), 2500);
    });
  };

  const exportRosterCSV = () => {
    const rows = allParentRoster.map((item) => ({
      'Child Name': item.childName,
      'Parent Name': item.parentName,
      Username: item.username,
      'Contact Phone': item.contactPhone,
      'Device Code': item.activationCode,
      'Bee Tokens': item.beeTokens,
      'Spelling Bee': item.spellingBee ? 'ON' : 'OFF',
      'AI Features': item.aiFeatures ? 'ON' : 'OFF',
      Status: item.status,
    }));
    exportToCSV(`little_bee_parents_directory_${new Date().toISOString().slice(0, 10)}.csv`, rows);
  };

  const exportRosterJSON = () => {
    exportToJSON(`little_bee_parents_backup_${new Date().toISOString().slice(0, 10)}.json`, allParentRoster);
  };

  const setProductForUser = async (userId: string, productSlug: 'spelling_bee' | 'ai_features', active: boolean) => {
    const dev = devices.find((d) => d.owner_user_id === userId);
    if (!dev) {
      alert('This account has not linked a physical device yet. Access will activate upon their first sign-in.');
      return;
    }
    await setProduct(dev, productSlug, active);
  };

  const setProduct = async (device: DeviceRow, productSlug: 'spelling_bee' | 'ai_features', active: boolean) => {
    setSavingId(device.id);
    setDataError(null);

    if (!isSupabaseConfigured) {
      const raw = localStorage.getItem('little_bee_local_accounts_v1');
      if (raw && device.owner_user_id) {
        const accounts = JSON.parse(raw);
        const profile = profiles[device.owner_user_id];
        if (profile && accounts[profile.username]) {
          if (productSlug === 'spelling_bee') accounts[profile.username].access.spellingBeeEnabled = active;
          if (productSlug === 'ai_features') accounts[profile.username].access.aiFeaturesEnabled = active;
          localStorage.setItem('little_bee_local_accounts_v1', JSON.stringify(accounts));
        }
      }
      await loadDevices();
      setSavingId(null);
      return;
    }

    const { error } = await supabase.from('entitlements').upsert(
      {
        device_id: device.id,
        product_slug: productSlug,
        active,
        granted_by: session?.user?.id || 'admin',
        granted_at: new Date().toISOString(),
      },
      { onConflict: 'device_id,product_slug' }
    );
    if (error) setDataError(error.message);
    else await loadDevices();
    setSavingId(null);
  };

  const reloadBeeTokensForUser = async (userId: string) => {
    const amount = Number.parseInt(reloadAmounts[userId] ?? '', 10);
    if (!Number.isFinite(amount) || amount <= 0) {
      setDataError('Enter a positive Bee Token reload amount.');
      return;
    }

    setSavingId(userId);
    setDataError(null);

    if (!isSupabaseConfigured) {
      const raw = localStorage.getItem('little_bee_local_accounts_v1');
      if (raw) {
        const accounts = JSON.parse(raw);
        const profile = profiles[userId];
        if (profile && accounts[profile.username]) {
          accounts[profile.username].access.beeTokens = (accounts[profile.username].access.beeTokens || 0) + amount;
          localStorage.setItem('little_bee_local_accounts_v1', JSON.stringify(accounts));
        }
      }
      setReloadAmounts((current) => ({ ...current, [userId]: '' }));
      await loadDevices();
      setSavingId(null);
      return;
    }

    const { error } = await supabase.rpc('add_bee_tokens', {
      p_user_id: userId,
      p_amount: amount,
      p_reason: 'Reception reload',
    });

    if (error) setDataError(error.message);
    else {
      setReloadAmounts((current) => ({ ...current, [userId]: '' }));
      await loadDevices();
    }
    setSavingId(null);
  };

  const deleteAccount = async (parent: RosterItem) => {
    const confirmed = window.confirm(
      `Delete account for ${parent.childName} (@${parent.username})? This permanently deletes the parent login, profile, linked device, and Bee Tokens.`
    );
    if (!confirmed) return;

    setSavingId(parent.userId);
    setDataError(null);

    if (!isSupabaseConfigured || parent.userId.startsWith('local_')) {
      const raw = localStorage.getItem('little_bee_local_accounts_v1');
      if (raw) {
        const accounts = JSON.parse(raw);
        delete accounts[parent.username];
        localStorage.setItem('little_bee_local_accounts_v1', JSON.stringify(accounts));
      }
      await loadDevices();
      setSavingId(null);
      return;
    }

    const { data, error } = await supabase.functions.invoke('manage-parent-account', {
      body: { action: 'delete', userId: parent.userId },
    });

    if (error || data?.error) {
      const msg = await getFunctionErrorMessage(error, data);
      setDataError(msg || 'Unable to delete the parent account.');
    } else {
      await loadDevices();
    }
    setSavingId(null);
  };

  const processActivation = async (request: ActivationRequestRow) => {
    const draft = activationDrafts[request.id] ?? {
      spellingBee: request.wants_spelling_bee,
      ai: request.wants_ai,
      tokens: request.wants_ai ? '100' : '0',
    };
    const tokenAmount = draft.ai ? Number.parseInt(draft.tokens, 10) : 0;
    if (!draft.spellingBee && !draft.ai) {
      setDataError('Select Spelling Bee, AI features, or both.');
      return;
    }
    if (draft.ai && (!Number.isFinite(tokenAmount) || tokenAmount <= 0)) {
      setDataError('Enter the purchased Bee Token amount before activating AI features.');
      return;
    }

    setSavingId(request.id);
    setDataError(null);
    const { error } = await supabase.rpc('process_activation_request', {
      p_request_code: request.request_code,
      p_grant_spelling_bee: draft.spellingBee,
      p_grant_ai: draft.ai,
      p_bee_tokens: tokenAmount,
    });
    if (error) setDataError(error.message);
    else await loadDevices();
    setSavingId(null);
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#FFFBEB] px-4 py-6 text-[#78350F] sm:px-8">
      <PeacefulBeeBackground />
      <div className="relative z-10 mx-auto max-w-7xl">
        {/* Top Header */}
        <header className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-3xl border-2 border-amber-200 bg-white/95 px-5 py-4 shadow-lg backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FBBF24] shadow-sm">
              <ShieldCheck className="h-7 w-7" />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-amber-600">
                Little Bee Reception & Admin Centre
              </p>
              <h1 className="font-['Fredoka',sans-serif] text-2xl font-black">
                Parent Accounts & Credential Hub
              </h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setImportModalOpen(true)}
              className="flex cursor-pointer items-center gap-1.5 rounded-full border-2 border-amber-300 bg-amber-50 px-4 py-2 text-xs font-black text-amber-900 shadow-xs hover:bg-amber-100 transition"
              title="Bulk import parents via CSV or JSON"
            >
              <Upload className="h-3.5 w-3.5" /> Import Data
            </button>
            <button
              type="button"
              onClick={exportRosterCSV}
              className="flex cursor-pointer items-center gap-1.5 rounded-full border-2 border-amber-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-xs hover:bg-amber-50 transition"
              title="Export complete roster to CSV"
            >
              <Download className="h-3.5 w-3.5" /> Export CSV
            </button>
            <button
              type="button"
              onClick={() => setPrintRosterOpen(true)}
              className="flex cursor-pointer items-center gap-1.5 rounded-full border-2 border-amber-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-xs hover:bg-amber-50 transition"
              title="Print front-desk lookup sheet"
            >
              <Printer className="h-3.5 w-3.5" /> Print Sheet
            </button>
            <button
              type="button"
              onClick={() => void loadDevices()}
              className="flex cursor-pointer items-center gap-1.5 rounded-full border-2 border-amber-200 bg-white p-2 text-slate-700 hover:bg-amber-50 transition"
              title="Refresh all data"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
            {session ? (
              <button
                type="button"
                onClick={() => void supabase.auth.signOut()}
                className="flex cursor-pointer items-center gap-1.5 rounded-full border-2 border-rose-200 bg-rose-50 px-3.5 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100 transition"
              >
                <LogOut className="h-3.5 w-3.5" /> Sign out
              </button>
            ) : null}
          </div>
        </header>

        {!authReady ? (
          <div className="flex justify-center py-24">
            <LoaderCircle className="h-10 w-10 animate-spin text-amber-500" />
          </div>
        ) : !session && isSupabaseConfigured ? (
          <form
            onSubmit={signIn}
            className="mx-auto max-w-md rounded-3xl border-2 border-amber-200 bg-white/95 p-7 shadow-xl"
          >
            <KeyRound className="mx-auto h-10 w-10 text-amber-500" />
            <h2 className="mt-3 text-center font-['Fredoka',sans-serif] text-xl font-black">
              Staff sign in
            </h2>
            <p className="mt-1 text-center text-sm text-amber-900/65">
              Only approved staff accounts can manage parent credentials and access.
            </p>
            <label className="mt-6 block text-xs font-black uppercase tracking-wider">Email</label>
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              type="email"
              required
              className="mt-1 w-full rounded-2xl border-2 border-amber-200 bg-amber-50/40 px-4 py-3 outline-none focus:border-amber-400"
            />
            <label className="mt-4 block text-xs font-black uppercase tracking-wider">
              Password
            </label>
            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              type="password"
              required
              className="mt-1 w-full rounded-2xl border-2 border-amber-200 bg-amber-50/40 px-4 py-3 outline-none focus:border-amber-400"
            />
            {authError ? (
              <p className="mt-4 rounded-xl bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700">
                {authError}
              </p>
            ) : null}
            <button
              disabled={busy}
              className="mt-5 flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-[#FBBF24] px-5 py-3 font-black shadow-md disabled:opacity-60"
            >
              {busy ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}{' '}
              Sign in
            </button>
          </form>
        ) : !isStaff ? (
          <div className="mx-auto max-w-xl rounded-3xl border-2 border-rose-200 bg-white/95 p-8 text-center shadow-xl">
            <UserRound className="mx-auto h-11 w-11 text-rose-500" />
            <h2 className="mt-3 text-xl font-black">This account is not approved for staff access</h2>
            <p className="mt-2 text-sm text-slate-600">
              Ask the system administrator to add this account to the staff list.
            </p>
          </div>
        ) : (
          <>
            {/* Primary Section Tabs */}
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b-2 border-amber-200 pb-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('directory')}
                  className={`flex cursor-pointer items-center gap-2 rounded-2xl px-5 py-2.5 text-sm font-black transition ${
                    activeTab === 'directory'
                      ? 'bg-[#FBBF24] text-[#78350F] shadow-md'
                      : 'bg-white/80 text-slate-600 hover:bg-white'
                  }`}
                >
                  <Users className="h-4 w-4" /> Parent Accounts Directory
                  <span className="ml-1 rounded-full bg-white/80 px-2 py-0.5 text-xs text-amber-900 font-bold">
                    {allParentRoster.length}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('activation')}
                  className={`flex cursor-pointer items-center gap-2 rounded-2xl px-5 py-2.5 text-sm font-black transition ${
                    activeTab === 'activation'
                      ? 'bg-violet-600 text-white shadow-md'
                      : 'bg-white/80 text-slate-600 hover:bg-white'
                  }`}
                >
                  <QrCode className="h-4 w-4" /> Reception QR Queue
                  {activationRequests.length > 0 && (
                    <span className="ml-1 rounded-full bg-amber-400 px-2 py-0.5 text-xs text-slate-900 font-bold">
                      {activationRequests.length}
                    </span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('devices')}
                  className={`flex cursor-pointer items-center gap-2 rounded-2xl px-5 py-2.5 text-sm font-black transition ${
                    activeTab === 'devices'
                      ? 'bg-amber-800 text-white shadow-md'
                      : 'bg-white/80 text-slate-600 hover:bg-white'
                  }`}
                >
                  <Smartphone className="h-4 w-4" /> Devices & Hardware
                  <span className="ml-1 rounded-full bg-white/30 px-2 py-0.5 text-xs">
                    {devices.length}
                  </span>
                </button>
                <button
                  id="admin-nav-maintenance-tab-btn"
                  type="button"
                  onClick={() => setActiveTab('maintenance')}
                  className={`flex cursor-pointer items-center gap-2 rounded-2xl px-5 py-2.5 text-sm font-black transition ${
                    activeTab === 'maintenance'
                      ? 'bg-rose-600 text-white shadow-md'
                      : isMaintenanceBlocking
                      ? 'bg-rose-100 text-rose-800 border-2 border-rose-400 hover:bg-rose-200 animate-pulse'
                      : 'bg-white/80 text-slate-600 hover:bg-white'
                  }`}
                >
                  <Wrench className="h-4 w-4" /> System Maintenance
                  {isMaintenanceBlocking ? (
                    <span className="ml-1 rounded-full bg-rose-500 text-white px-2 py-0.5 text-[10px] font-black uppercase">
                      LOCKED
                    </span>
                  ) : (
                    <span className="ml-1 rounded-full bg-emerald-100 text-emerald-800 px-2 py-0.5 text-[10px] font-bold">
                      ONLINE
                    </span>
                  )}
                </button>
              </div>

              <button
                type="button"
                onClick={() => setShowAddParent((prev) => !prev)}
                className="flex cursor-pointer items-center gap-2 rounded-full bg-[#FBBF24] px-4 py-2.5 text-xs font-black shadow-md hover:bg-amber-400 transition"
              >
                {showAddParent ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                {showAddParent ? 'Close Form' : 'Add Single Parent'}
              </button>
            </div>

            {/* Add Parent Account Drawer/Form */}
            <AnimatePresence>
              {showAddParent && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-5 overflow-hidden rounded-3xl border-2 border-amber-200 bg-white p-6 shadow-xl"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-['Fredoka',sans-serif] text-lg font-black text-[#78350F]">
                        Create New Parent Account
                      </h3>
                      <p className="text-xs text-slate-500">
                        Create credentials for a family. You can share the username and password with them immediately.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={generateRandomPassword}
                      className="flex items-center gap-1.5 rounded-full border border-amber-300 bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-800 hover:bg-amber-100 cursor-pointer"
                    >
                      <Sparkles className="h-3.5 w-3.5" /> Auto-Generate Password
                    </button>
                  </div>

                  <form onSubmit={createParentAccount} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                    <input
                      value={newParent.username}
                      onChange={(event) =>
                        setNewParent((current) => ({
                          ...current,
                          username: event.target.value.toLowerCase(),
                        }))
                      }
                      placeholder="Username (e.g. alex_doe)"
                      minLength={3}
                      maxLength={32}
                      pattern="[a-z0-9][a-z0-9._-]{2,31}"
                      required
                      autoComplete="off"
                      className="rounded-2xl border-2 border-amber-100 px-4 py-3 outline-none focus:border-amber-300 text-sm"
                    />
                    <input
                      type="text"
                      value={newParent.password}
                      onChange={(event) =>
                        setNewParent((current) => ({ ...current, password: event.target.value }))
                      }
                      placeholder="Temporary password (8+)"
                      minLength={8}
                      maxLength={72}
                      required
                      autoComplete="new-password"
                      className="rounded-2xl border-2 border-amber-100 px-4 py-3 outline-none focus:border-amber-300 font-mono text-sm"
                    />
                    <input
                      value={newParent.parentName}
                      onChange={(event) =>
                        setNewParent((current) => ({ ...current, parentName: event.target.value }))
                      }
                      placeholder="Parent name"
                      required
                      className="rounded-2xl border-2 border-amber-100 px-4 py-3 outline-none focus:border-amber-300 text-sm"
                    />
                    <input
                      value={newParent.childName}
                      onChange={(event) =>
                        setNewParent((current) => ({ ...current, childName: event.target.value }))
                      }
                      placeholder="Child / Student name"
                      required
                      className="rounded-2xl border-2 border-amber-100 px-4 py-3 outline-none focus:border-amber-300 text-sm"
                    />
                    <input
                      type="tel"
                      value={newParent.contactPhone}
                      onChange={(event) =>
                        setNewParent((current) => ({
                          ...current,
                          contactPhone: event.target.value,
                        }))
                      }
                      placeholder="Contact phone (optional)"
                      className="rounded-2xl border-2 border-amber-100 px-4 py-3 outline-none focus:border-amber-300 text-sm"
                    />
                    <button
                      type="submit"
                      disabled={creatingParent}
                      className="flex cursor-pointer items-center justify-center gap-2 rounded-full bg-emerald-500 px-5 py-3 text-sm font-black text-white shadow-md hover:bg-emerald-600 disabled:opacity-60 sm:col-span-2 lg:col-span-5 lg:justify-self-end"
                    >
                      {creatingParent ? (
                        <LoaderCircle className="h-4 w-4 animate-spin" />
                      ) : (
                        <Plus className="h-4 w-4" />
                      )}
                      Save Parent Account
                    </button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>

            {dataError && (
              <p className="mb-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700 border border-rose-200">
                {dataError}
              </p>
            )}

            {/* TAB 1: PARENT DIRECTORY (PRIMARY FOR CREDENTIAL LOOKUP) */}
            {activeTab === 'directory' && (
              <section className="space-y-4">
                {/* Search Bar */}
                <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-amber-200 bg-white/95 p-3 shadow-xs">
                  <div className="relative min-w-[280px] flex-1">
                    <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-amber-600" />
                    <input
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder="Instant search by Child Name, Parent Name, @Username, Phone, or Device Code…"
                      className="w-full rounded-xl border-2 border-amber-100 bg-amber-50/40 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-amber-300"
                    />
                  </div>
                  <div className="text-xs font-bold text-slate-500">
                    Showing <strong>{filteredParents.length}</strong> of {allParentRoster.length} families
                  </div>
                </div>

                {/* Parent Cards Grid */}
                <div className="grid gap-3">
                  <AnimatePresence>
                    {filteredParents.map((parent) => {
                      const isSaving = savingId === parent.userId;
                      const profile = profiles[parent.userId];

                      return (
                        <motion.article
                          key={parent.userId}
                          layout
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.98 }}
                          className="rounded-3xl border-2 border-amber-200 bg-white/95 p-5 shadow-md hover:shadow-lg transition"
                        >
                          <div className="flex flex-wrap items-start justify-between gap-4">
                            {/* Family Identity */}
                            <div className="flex items-start gap-3.5">
                              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-800 font-black text-lg shadow-xs">
                                {parent.childName.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <h3 className="font-['Fredoka',sans-serif] text-xl font-black text-slate-900">
                                    {parent.childName}
                                  </h3>
                                  <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-900">
                                    Parent: {parent.parentName}
                                  </span>
                                  {parent.contactPhone && (
                                    <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-600">
                                      📞 {parent.contactPhone}
                                    </span>
                                  )}
                                </div>

                                {/* Username & Credentials Reminder with 1-Click Copy */}
                                <div className="mt-2 flex items-center gap-2 flex-wrap text-xs">
                                  <span className="text-slate-500 font-bold">Login Username:</span>
                                  <button
                                    type="button"
                                    onClick={() => copyUsername(parent.username, parent.userId)}
                                    className="flex items-center gap-1.5 rounded-lg border border-violet-200 bg-violet-50 px-2.5 py-1 font-mono font-black text-violet-800 hover:bg-violet-100 cursor-pointer shadow-2xs transition"
                                    title="Click to copy username"
                                  >
                                    <span>@{parent.username}</span>
                                    {copiedId === parent.userId ? (
                                      <Check className="h-3 w-3 text-emerald-600" />
                                    ) : (
                                      <Copy className="h-3 w-3 text-violet-500" />
                                    )}
                                  </button>
                                  {copiedId === parent.userId && (
                                    <span className="text-[11px] font-bold text-emerald-600 animate-in fade-in">
                                      Copied username!
                                    </span>
                                  )}

                                  <span className="text-slate-300">|</span>

                                  <button
                                    type="button"
                                    onClick={() => setResetModalUser(profile || {
                                      user_id: parent.userId,
                                      username: parent.username,
                                      parent_name: parent.parentName,
                                      child_name: parent.childName,
                                      contact_phone: parent.contactPhone,
                                    })}
                                    className="flex items-center gap-1 rounded-lg border border-amber-300 bg-amber-50 px-2.5 py-1 font-bold text-amber-900 hover:bg-amber-100 cursor-pointer transition text-xs"
                                  >
                                    <KeyRound className="h-3.5 w-3.5 text-amber-600" /> Reset Password
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => copyParentCard(parent)}
                                    className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 font-bold text-slate-700 hover:bg-slate-50 cursor-pointer transition text-xs"
                                    title="Copy complete login reminder card to WhatsApp/SMS parent"
                                  >
                                    <Share2 className="h-3.5 w-3.5 text-slate-500" />
                                    {copiedId === 'card_' + parent.userId ? 'Card Copied!' : 'Copy Login Card'}
                                  </button>
                                </div>
                              </div>
                            </div>

                            {/* Access & Token Controls */}
                            <div className="flex flex-wrap items-center gap-2">
                              {/* Spelling Bee Switch */}
                              <button
                                type="button"
                                onClick={() => void setProductForUser(parent.userId, 'spelling_bee', !parent.spellingBee)}
                                disabled={isSaving}
                                className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-black shadow-xs transition cursor-pointer ${
                                  parent.spellingBee
                                    ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                                    : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                                }`}
                              >
                                {parent.spellingBee ? <Check className="h-3.5 w-3.5" /> : <Sparkles className="h-3.5 w-3.5" />}
                                Spelling: {parent.spellingBee ? 'ON' : 'OFF'}
                              </button>

                              {/* AI Features Switch */}
                              <button
                                type="button"
                                onClick={() => void setProductForUser(parent.userId, 'ai_features', !parent.aiFeatures)}
                                disabled={isSaving}
                                className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-black shadow-xs transition cursor-pointer ${
                                  parent.aiFeatures
                                    ? 'bg-violet-600 text-white hover:bg-violet-700'
                                    : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                                }`}
                              >
                                <Bot className="h-3.5 w-3.5" />
                                AI: {parent.aiFeatures ? 'ON' : 'OFF'}
                              </button>

                              {/* Delete Account */}
                              <button
                                type="button"
                                onClick={() => void deleteAccount(parent)}
                                disabled={isSaving}
                                className="rounded-full p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 cursor-pointer transition"
                                title="Delete parent account"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>

                          {/* Bottom Row: Device Code & Bee Token Reload */}
                          <div className="mt-3.5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-100 bg-amber-50/50 px-4 py-2.5 text-xs">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-500">Device Code:</span>
                              <span className="font-mono font-bold text-slate-800 bg-white px-2 py-0.5 rounded border border-amber-200">
                                {parent.activationCode}
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="flex items-center gap-1 font-bold text-amber-900 bg-white px-2.5 py-1 rounded-full border border-amber-200">
                                <Coins className="h-4 w-4 text-amber-500" />
                                <strong>{parent.beeTokens.toLocaleString()}</strong> Tokens
                              </span>
                              <input
                                type="number"
                                min="1"
                                max="100000"
                                value={reloadAmounts[parent.userId] ?? ''}
                                onChange={(event) =>
                                  setReloadAmounts((current) => ({
                                    ...current,
                                    [parent.userId]: event.target.value,
                                  }))
                                }
                                placeholder="Reload tokens"
                                className="w-24 rounded-xl border border-amber-200 bg-white px-2.5 py-1 text-xs outline-none focus:border-amber-400"
                              />
                              <button
                                type="button"
                                onClick={() => void reloadBeeTokensForUser(parent.userId)}
                                disabled={isSaving}
                                className="flex cursor-pointer items-center gap-1 rounded-full bg-amber-500 px-3 py-1 text-xs font-black text-white hover:bg-amber-600 shadow-2xs"
                              >
                                <Plus className="h-3 w-3" /> Reload
                              </button>
                            </div>
                          </div>
                        </motion.article>
                      );
                    })}
                  </AnimatePresence>

                  {!filteredParents.length && (
                    <div className="rounded-3xl border-2 border-dashed border-amber-300 bg-white/70 py-16 text-center">
                      <Users className="mx-auto h-10 w-10 text-amber-400 mb-2" />
                      <p className="font-black text-base text-amber-900">No parent accounts found</p>
                      <p className="text-xs text-slate-500 mt-1">
                        Try searching with a different term or click "Import Data" / "Add Single Parent" above.
                      </p>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* TAB 2: RECEPTION QR QUEUE */}
            {activeTab === 'activation' && (
              <section id="activation-queue" className="rounded-3xl border-2 border-violet-200 bg-white/95 p-6 shadow-lg">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <QrCode className="h-6 w-6 text-violet-600" />
                      <h2 className="font-['Fredoka',sans-serif] text-xl font-black text-violet-950">
                        Reception Activation Queue
                      </h2>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">
                      Scan the parent’s QR or type the BEE code, confirm products, and enter Bee Tokens for AI.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setScannerOpen(true)}
                    className="flex cursor-pointer items-center gap-2 rounded-full bg-violet-600 px-5 py-2.5 text-sm font-black text-white shadow-md hover:bg-violet-700"
                  >
                    <QrCode className="h-4 w-4" /> Scan Parent QR
                  </button>
                </div>

                <div className="relative mt-4">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-violet-500" />
                  <input
                    value={activationSearch}
                    onChange={(event) => setActivationSearch(event.target.value)}
                    placeholder="Type BEE code, username, parent, or child…"
                    className="w-full rounded-xl border-2 border-violet-100 bg-violet-50/40 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-violet-300"
                  />
                </div>

                <div className="mt-4 grid gap-3">
                  {filteredActivationRequests.map((request) => {
                    const profile = profiles[request.user_id];
                    const draft = activationDrafts[request.id] ?? {
                      spellingBee: request.wants_spelling_bee,
                      ai: request.wants_ai,
                      tokens: request.wants_ai ? '100' : '0',
                    };
                    const isSaving = savingId === request.id;
                    return (
                      <article key={request.id} className="rounded-2xl border-2 border-violet-100 bg-violet-50/40 p-4">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <p className="font-mono text-lg font-black tracking-wider text-violet-700">
                              {request.request_code}
                            </p>
                            <p className="text-sm font-black">
                              {profile?.child_name ?? 'Unknown child'}{' '}
                              <span className="font-normal text-slate-500">
                                · Parent: {profile?.parent_name ?? '—'} · @{profile?.username ?? '—'}
                              </span>
                            </p>
                            {profile?.contact_phone ? (
                              <p className="mt-0.5 text-xs text-slate-500">
                                Contact: {profile.contact_phone}
                              </p>
                            ) : null}
                          </div>
                          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-700">
                            PENDING
                          </span>
                        </div>
                        <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_1fr_1.1fr_auto] sm:items-center">
                          <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-amber-200 bg-white px-3 py-2 text-sm font-black">
                            <input
                              type="checkbox"
                              checked={draft.spellingBee}
                              onChange={(event) =>
                                setActivationDrafts((current) => ({
                                  ...current,
                                  [request.id]: { ...draft, spellingBee: event.target.checked },
                                }))
                              }
                              className="h-4 w-4 accent-amber-500"
                            />{' '}
                            Spelling Bee
                          </label>
                          <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-violet-200 bg-white px-3 py-2 text-sm font-black">
                            <input
                              type="checkbox"
                              checked={draft.ai}
                              onChange={(event) =>
                                setActivationDrafts((current) => ({
                                  ...current,
                                  [request.id]: { ...draft, ai: event.target.checked },
                                }))
                              }
                              className="h-4 w-4 accent-violet-500"
                            />{' '}
                            AI features
                          </label>
                          <label
                            className={`flex items-center gap-2 rounded-xl border bg-white px-3 py-2 ${
                              draft.ai ? 'border-amber-300' : 'border-slate-200 opacity-50'
                            }`}
                          >
                            <Coins className="h-4 w-4 text-amber-500" />
                            <input
                              type="number"
                              min="1"
                              max="100000"
                              disabled={!draft.ai}
                              value={draft.tokens}
                              onChange={(event) =>
                                setActivationDrafts((current) => ({
                                  ...current,
                                  [request.id]: { ...draft, tokens: event.target.value },
                                }))
                              }
                              aria-label="Initial Bee Token amount"
                              className="min-w-0 flex-1 bg-transparent text-sm font-black outline-none"
                            />
                            <span className="text-[10px] font-bold text-slate-400">TOKENS</span>
                          </label>
                          <button
                            type="button"
                            disabled={isSaving}
                            onClick={() => void processActivation(request)}
                            className="flex cursor-pointer items-center justify-center gap-2 rounded-full bg-emerald-500 px-5 py-2.5 text-sm font-black text-white shadow-md hover:bg-emerald-600 disabled:opacity-50"
                          >
                            {isSaving ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}{' '}
                            Activate
                          </button>
                        </div>
                      </article>
                    );
                  })}
                  {!filteredActivationRequests.length && (
                    <div className="rounded-2xl border-2 border-dashed border-violet-200 py-8 text-center text-sm font-bold text-violet-900/50">
                      No matching pending activation requests.
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* TAB 3: DEVICES & HARDWARE */}
            {activeTab === 'devices' && (
              <section className="space-y-4">
                <div className="grid gap-4">
                  <AnimatePresence>
                    {filteredDevices.map((device) => {
                      const spellingEnabled = hasProduct(device, 'spelling_bee');
                      const aiEnabled = hasProduct(device, 'ai_features');
                      const isSaving = savingId === device.id;
                      const linkedProfile = device.owner_user_id ? profiles[device.owner_user_id] : null;
                      const beeTokenBalance = device.owner_user_id ? wallets[device.owner_user_id] ?? 0 : 0;
                      return (
                        <motion.article
                          key={device.id}
                          layout
                          initial={{ opacity: 0, y: 12 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="rounded-3xl border-2 border-amber-200 bg-white/95 p-5 shadow-md"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-amber-600">
                                Device code
                              </p>
                              <p className="font-mono text-2xl font-black tracking-widest">
                                {device.activation_code}
                              </p>
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                              <button
                                onClick={() => void setProduct(device, 'spelling_bee', !spellingEnabled)}
                                disabled={isSaving}
                                className={`flex min-w-44 cursor-pointer items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-black text-white shadow-md transition-colors disabled:opacity-60 ${
                                  spellingEnabled ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-slate-500 hover:bg-slate-600'
                                }`}
                              >
                                {isSaving ? <LoaderCircle className="h-4 w-4 animate-spin" /> : spellingEnabled ? <Check className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
                                Spelling Bee: {spellingEnabled ? 'ON' : 'OFF'}
                              </button>
                              <button
                                onClick={() => aiEnabled ? void setProduct(device, 'ai_features', false) : void setProduct(device, 'ai_features', true)}
                                disabled={isSaving}
                                className={`flex min-w-36 cursor-pointer items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-black text-white shadow-md transition-colors ${
                                  aiEnabled ? 'bg-violet-600 hover:bg-violet-700' : 'bg-slate-400 hover:bg-slate-500'
                                }`}
                              >
                                <Bot className="h-4 w-4" /> AI: {aiEnabled ? 'ON' : 'OFF'}
                              </button>
                            </div>
                          </div>

                          {linkedProfile ? (
                            <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-violet-100 bg-violet-50/50 px-4 py-3">
                              <div>
                                <p className="text-xs font-black text-violet-700">
                                  Parent account @{linkedProfile.username}
                                </p>
                                <p className="text-xs text-slate-500">
                                  {linkedProfile.parent_name} · {linkedProfile.child_name}
                                </p>
                              </div>
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-2 text-sm font-black">
                                  <Coins className="h-4 w-4 text-amber-500" /> {beeTokenBalance.toLocaleString()}
                                </span>
                              </div>
                            </div>
                          ) : (
                            <p className="mt-3 rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-500">
                              Legacy device record — it will link automatically when a parent signs in on that device.
                            </p>
                          )}
                          <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                            <span>Last seen {new Date(device.last_seen_at).toLocaleString()}</span>
                          </div>
                        </motion.article>
                      );
                    })}
                  </AnimatePresence>
                  {!filteredDevices.length && (
                    <div className="rounded-3xl border-2 border-dashed border-amber-300 bg-white/70 py-16 text-center font-bold text-amber-900/60">
                      No registered devices found.
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* System Maintenance Management Tab */}
            {activeTab === 'maintenance' && (
              <section id="admin-maintenance-tab-section">
                <AdminMaintenanceTab />
              </section>
            )}
          </>
        )}
      </div>

      {/* Modals */}
      <ResetPasswordModal
        isOpen={Boolean(resetModalUser)}
        onClose={() => setResetModalUser(null)}
        userId={resetModalUser?.user_id || ''}
        username={resetModalUser?.username || ''}
        parentName={resetModalUser?.parent_name || ''}
        childName={resetModalUser?.child_name || ''}
        contactPhone={resetModalUser?.contact_phone}
        onSuccess={() => void loadDevices()}
      />

      <BulkImportModal
        isOpen={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        onSuccess={() => void loadDevices()}
      />

      <PrintableRosterModal
        isOpen={printRosterOpen}
        onClose={() => setPrintRosterOpen(false)}
        roster={allParentRoster}
      />

      <ActivationQrScannerModal
        open={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onCode={(code) => {
          setActivationSearch(code);
          setScannerOpen(false);
          setActiveTab('activation');
        }}
      />
    </main>
  );
}
