import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  Bot,
  Check,
  Coins,
  KeyRound,
  LoaderCircle,
  LogOut,
  Plus,
  QrCode,
  RefreshCw,
  Save,
  Search,
  ShieldCheck,
  Sparkles,
  Trash2,
  UserRound,
  X,
} from 'lucide-react';
import type { Session, User } from '@supabase/supabase-js';
import PeacefulBeeBackground from './PeacefulBeeBackground';
import ActivationQrScannerModal from './ActivationQrScannerModal';
import { isSupabaseConfigured, supabase } from '../lib/supabase';

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
      (!entitlement.expires_at || new Date(entitlement.expires_at).getTime() > Date.now()),
  );
}

export default function AdminPortal() {
  const [session, setSession] = useState<Session | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [isStaff, setIsStaff] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [devices, setDevices] = useState<DeviceRow[]>([]);
  const [search, setSearch] = useState('');
  const [dataError, setDataError] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [showAddParent, setShowAddParent] = useState(false);
  const [creatingParent, setCreatingParent] = useState(false);
  const [newParent, setNewParent] = useState({ username: '', password: '', parentName: '', childName: '', contactPhone: '' });
  const [profiles, setProfiles] = useState<Record<string, ParentProfileRow>>({});
  const [wallets, setWallets] = useState<Record<string, number>>({});
  const [activationRequests, setActivationRequests] = useState<ActivationRequestRow[]>([]);
  const [activationDrafts, setActivationDrafts] = useState<Record<string, ActivationDraft>>({});
  const [activationSearch, setActivationSearch] = useState('');
  const [scannerOpen, setScannerOpen] = useState(false);
  const [reloadAmounts, setReloadAmounts] = useState<Record<string, string>>({});

  const checkStaff = useCallback(async (user: User | null) => {
    if (!user) {
      setIsStaff(false);
      return false;
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

  const loadDevices = useCallback(async () => {
    setDataError(null);
    const [deviceResult, requestResult, profileResult, walletResult] = await Promise.all([
      supabase
        .from('devices')
        .select('id, activation_code, parent_name, child_name, notes, created_at, last_seen_at, owner_user_id, entitlements(id, product_slug, active, expires_at)')
        .order('last_seen_at', { ascending: false }),
      supabase
        .from('activation_requests')
        .select('id, request_code, user_id, device_id, wants_spelling_bee, wants_ai, status, requested_at')
        .eq('status', 'pending')
        .order('requested_at', { ascending: true }),
      supabase
        .from('parent_profiles')
        .select('user_id, username, parent_name, child_name, contact_phone'),
      supabase
        .from('bee_token_wallets')
        .select('user_id, balance'),
    ]);

    const firstError = deviceResult.error ?? requestResult.error ?? profileResult.error ?? walletResult.error;
    if (firstError) {
      setDataError(firstError.message);
      return;
    }

    setDevices((deviceResult.data ?? []) as DeviceRow[]);
    setActivationRequests((requestResult.data ?? []) as ActivationRequestRow[]);
    setProfiles(Object.fromEntries(((profileResult.data ?? []) as ParentProfileRow[]).map((profile) => [profile.user_id, profile])));
    setWallets(Object.fromEntries((walletResult.data ?? []).map((wallet) => [wallet.user_id, Number(wallet.balance)])));
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setAuthReady(true);
      setAuthError('Supabase environment variables are missing.');
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

  const filteredDevices = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return devices;
    return devices.filter((device) =>
      [device.activation_code, device.parent_name, device.child_name, device.notes]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(query)),
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

  const unlinkedProfiles = useMemo(() => {
    const linkedIds = new Set(devices.map((device) => device.owner_user_id).filter(Boolean));
    return (Object.values(profiles) as ParentProfileRow[]).filter((profile) => !linkedIds.has(profile.user_id));
  }, [devices, profiles]);

  const signIn = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setAuthError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setAuthError(error.message.toLowerCase().includes('fetch')
        ? 'Unable to reach Supabase Auth. Please refresh and check the internet connection.'
        : error.message);
    }
    setBusy(false);
  };

  const updateDraft = (id: string, field: 'parent_name' | 'child_name' | 'notes', value: string) => {
    setDevices((current) =>
      current.map((device) => (device.id === id ? { ...device, [field]: value } : device)),
    );
  };

  const saveDevice = async (device: DeviceRow) => {
    setSavingId(device.id);
    setDataError(null);
    const { error } = await supabase
      .from('devices')
      .update({
        parent_name: device.parent_name?.trim() || null,
        child_name: device.child_name?.trim() || null,
        notes: device.notes?.trim() || null,
      })
      .eq('id', device.id);
    if (error) setDataError(error.message);
    else await loadDevices();
    setSavingId(null);
  };

  const createParentAccount = async (event: FormEvent) => {
    event.preventDefault();
    setCreatingParent(true);
    setDataError(null);

    const { data, error } = await supabase.functions.invoke('manage-parent-account', {
      body: {
        action: 'create',
        username: newParent.username,
        password: newParent.password,
        parentName: newParent.parentName,
        childName: newParent.childName,
        contactPhone: newParent.contactPhone,
      },
    });

    if (error || data?.error) {
      setDataError(data?.error ?? error?.message ?? 'Unable to create the parent account.');
    } else {
      setNewParent({ username: '', password: '', parentName: '', childName: '', contactPhone: '' });
      setShowAddParent(false);
      await loadDevices();
    }
    setCreatingParent(false);
  };

  const deleteDevice = async (device: DeviceRow) => {
    const recordName = device.child_name || device.parent_name || device.activation_code;
    const linkedAccount = device.owner_user_id ? profiles[device.owner_user_id] : null;
    const confirmed = window.confirm(
      linkedAccount
        ? `Delete the complete account for ${recordName} (@${linkedAccount.username})? This permanently removes the login, profile, device, program access, Bee Tokens, and token history. This cannot be undone.`
        : `Delete ${recordName}? This permanently removes the legacy device and its program access. This cannot be undone.`,
    );
    if (!confirmed) return;

    setSavingId(device.id);
    setDataError(null);
    if (device.owner_user_id) {
      const { data, error } = await supabase.functions.invoke('manage-parent-account', {
        body: { action: 'delete', userId: device.owner_user_id },
      });
      if (error || data?.error) setDataError(data?.error ?? error?.message ?? 'Unable to delete the parent account.');
      else await loadDevices();
    } else {
      const { error } = await supabase.from('devices').delete().eq('id', device.id);
      if (error) setDataError(error.message);
      else setDevices((current) => current.filter((item) => item.id !== device.id));
    }
    setSavingId(null);
  };

  const deleteUnlinkedAccount = async (profile: ParentProfileRow) => {
    if (!window.confirm(`Delete the complete account for ${profile.child_name} (@${profile.username})? This permanently removes the login and profile.`)) return;
    setSavingId(profile.user_id);
    setDataError(null);
    const { data, error } = await supabase.functions.invoke('manage-parent-account', {
      body: { action: 'delete', userId: profile.user_id },
    });
    if (error || data?.error) setDataError(data?.error ?? error?.message ?? 'Unable to delete the parent account.');
    else await loadDevices();
    setSavingId(null);
  };

  const setProduct = async (device: DeviceRow, productSlug: 'spelling_bee' | 'ai_features', active: boolean) => {
    if (!session?.user) return;
    setSavingId(device.id);
    setDataError(null);
    const { error } = await supabase.from('entitlements').upsert(
      {
        device_id: device.id,
        product_slug: productSlug,
        active,
        granted_by: session.user.id,
        granted_at: new Date().toISOString(),
      },
      { onConflict: 'device_id,product_slug' },
    );
    if (error) setDataError(error.message);
    else await loadDevices();
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

  const reloadBeeTokens = async (device: DeviceRow) => {
    if (!device.owner_user_id) return;
    const amount = Number.parseInt(reloadAmounts[device.owner_user_id] ?? '', 10);
    if (!Number.isFinite(amount) || amount <= 0) {
      setDataError('Enter a positive Bee Token reload amount.');
      return;
    }
    setSavingId(device.id);
    setDataError(null);
    const { error } = await supabase.rpc('add_bee_tokens', {
      p_user_id: device.owner_user_id,
      p_amount: amount,
      p_reason: 'Reception reload',
    });
    if (error) setDataError(error.message);
    else {
      setReloadAmounts((current) => ({ ...current, [device.owner_user_id!]: '' }));
      await loadDevices();
    }
    setSavingId(null);
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#FFFBEB] px-4 py-6 text-[#78350F] sm:px-8">
      <PeacefulBeeBackground />
      <div className="relative z-10 mx-auto max-w-6xl">
        <header className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-3xl border-2 border-amber-200 bg-white/90 px-5 py-4 shadow-lg backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FBBF24] shadow-sm">
              <ShieldCheck className="h-7 w-7" />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-amber-600">Little Bee Centre</p>
              <h1 className="font-['Fredoka',sans-serif] text-2xl font-black">Program Access Dashboard</h1>
            </div>
          </div>
          {session ? (
            <button
              onClick={() => void supabase.auth.signOut()}
              className="flex cursor-pointer items-center gap-2 rounded-full border-2 border-amber-200 bg-white px-4 py-2 text-sm font-bold hover:bg-amber-50"
            >
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          ) : null}
        </header>

        {!authReady ? (
          <div className="flex justify-center py-24"><LoaderCircle className="h-10 w-10 animate-spin text-amber-500" /></div>
        ) : !session ? (
          <form onSubmit={signIn} className="mx-auto max-w-md rounded-3xl border-2 border-amber-200 bg-white/95 p-7 shadow-xl">
            <KeyRound className="mx-auto h-10 w-10 text-amber-500" />
            <h2 className="mt-3 text-center font-['Fredoka',sans-serif] text-xl font-black">Staff sign in</h2>
            <p className="mt-1 text-center text-sm text-amber-900/65">Only approved staff accounts can change program access.</p>
            <label className="mt-6 block text-xs font-black uppercase tracking-wider">Email</label>
            <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" required className="mt-1 w-full rounded-2xl border-2 border-amber-200 bg-amber-50/40 px-4 py-3 outline-none focus:border-amber-400" />
            <label className="mt-4 block text-xs font-black uppercase tracking-wider">Password</label>
            <input value={password} onChange={(event) => setPassword(event.target.value)} type="password" required className="mt-1 w-full rounded-2xl border-2 border-amber-200 bg-amber-50/40 px-4 py-3 outline-none focus:border-amber-400" />
            {authError ? <p className="mt-4 rounded-xl bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700">{authError}</p> : null}
            <button disabled={busy} className="mt-5 flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-[#FBBF24] px-5 py-3 font-black shadow-md disabled:opacity-60">
              {busy ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />} Sign in
            </button>
          </form>
        ) : !isStaff ? (
          <div className="mx-auto max-w-xl rounded-3xl border-2 border-rose-200 bg-white/95 p-8 text-center shadow-xl">
            <UserRound className="mx-auto h-11 w-11 text-rose-500" />
            <h2 className="mt-3 text-xl font-black">This account is not approved for staff access</h2>
            <p className="mt-2 text-sm text-slate-600">Ask the system administrator to add this account to the staff list.</p>
          </div>
        ) : (
          <>
            <section id="activation-queue" className="mb-5 rounded-3xl border-2 border-violet-200 bg-white/95 p-5 shadow-lg">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2"><QrCode className="h-6 w-6 text-violet-500" /><h2 className="font-['Fredoka',sans-serif] text-xl font-black">Reception activation queue</h2></div>
                  <p className="mt-1 text-xs text-slate-500">Scan the parent’s QR or type the BEE code, confirm products, and enter Bee Tokens for AI.</p>
                </div>
                <button type="button" onClick={() => setScannerOpen(true)} className="flex cursor-pointer items-center gap-2 rounded-full bg-violet-500 px-4 py-2.5 text-sm font-black text-white shadow-md hover:bg-violet-600"><QrCode className="h-4 w-4" /> Scan parent QR</button>
              </div>
              <div className="relative mt-4">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-violet-500" />
                <input value={activationSearch} onChange={(event) => setActivationSearch(event.target.value)} placeholder="Type BEE code, username, parent, or child…" className="w-full rounded-xl border-2 border-violet-100 bg-violet-50/40 py-2.5 pl-10 pr-4 outline-none focus:border-violet-300" />
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
                          <p className="font-mono text-lg font-black tracking-wider text-violet-700">{request.request_code}</p>
                          <p className="text-sm font-black">{profile?.child_name ?? 'Unknown child'} <span className="font-normal text-slate-500">· Parent: {profile?.parent_name ?? '—'} · @{profile?.username ?? '—'}</span></p>
                          {profile?.contact_phone ? <p className="mt-0.5 text-xs text-slate-500">Contact: {profile.contact_phone}</p> : null}
                        </div>
                        <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-700">PENDING</span>
                      </div>
                      <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_1fr_1.1fr_auto] sm:items-center">
                        <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-amber-200 bg-white px-3 py-2 text-sm font-black"><input type="checkbox" checked={draft.spellingBee} onChange={(event) => setActivationDrafts((current) => ({ ...current, [request.id]: { ...draft, spellingBee: event.target.checked } }))} className="h-4 w-4 accent-amber-500" /> Spelling Bee</label>
                        <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-violet-200 bg-white px-3 py-2 text-sm font-black"><input type="checkbox" checked={draft.ai} onChange={(event) => setActivationDrafts((current) => ({ ...current, [request.id]: { ...draft, ai: event.target.checked } }))} className="h-4 w-4 accent-violet-500" /> AI features</label>
                        <label className={`flex items-center gap-2 rounded-xl border bg-white px-3 py-2 ${draft.ai ? 'border-amber-300' : 'border-slate-200 opacity-50'}`}><Coins className="h-4 w-4 text-amber-500" /><input type="number" min="1" max="100000" disabled={!draft.ai} value={draft.tokens} onChange={(event) => setActivationDrafts((current) => ({ ...current, [request.id]: { ...draft, tokens: event.target.value } }))} aria-label="Initial Bee Token amount" className="min-w-0 flex-1 bg-transparent text-sm font-black outline-none" /><span className="text-[10px] font-bold text-slate-400">TOKENS</span></label>
                        <button type="button" disabled={isSaving} onClick={() => void processActivation(request)} className="flex cursor-pointer items-center justify-center gap-2 rounded-full bg-emerald-500 px-5 py-2.5 text-sm font-black text-white shadow-md hover:bg-emerald-600 disabled:opacity-50">{isSaving ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />} Activate</button>
                      </div>
                    </article>
                  );
                })}
                {!filteredActivationRequests.length ? <div className="rounded-2xl border-2 border-dashed border-violet-200 py-8 text-center text-sm font-bold text-violet-900/50">No matching pending activation requests.</div> : null}
              </div>
            </section>

            <section className="mb-5 rounded-3xl border-2 border-amber-200 bg-white/90 p-4 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="font-['Fredoka',sans-serif] text-lg font-black">Parent accounts</h2>
                  <p className="text-xs text-slate-500">Create a username and temporary password for the family. The device links automatically on their first sign-in.</p>
                </div>
                <button
                  id="toggle-add-parent-btn"
                  type="button"
                  onClick={() => setShowAddParent((current) => !current)}
                  className="flex cursor-pointer items-center gap-2 rounded-full bg-[#FBBF24] px-4 py-2.5 text-sm font-black shadow-sm hover:bg-amber-400"
                >
                  {showAddParent ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                  {showAddParent ? 'Cancel' : 'Add parent account'}
                </button>
              </div>

              {showAddParent ? (
                <form id="add-parent-form" onSubmit={createParentAccount} className="mt-4 grid gap-3 border-t border-amber-100 pt-4 sm:grid-cols-2 lg:grid-cols-5">
                  <input
                    value={newParent.username}
                    onChange={(event) => setNewParent((current) => ({ ...current, username: event.target.value.toLowerCase() }))}
                    placeholder="Username"
                    minLength={3}
                    maxLength={32}
                    pattern="[a-z0-9][a-z0-9._-]{2,31}"
                    required
                    autoComplete="off"
                    className="rounded-xl border-2 border-amber-100 px-3 py-2.5 outline-none focus:border-amber-300"
                  />
                  <input
                    type="password"
                    value={newParent.password}
                    onChange={(event) => setNewParent((current) => ({ ...current, password: event.target.value }))}
                    placeholder="Temporary password (8+)"
                    minLength={8}
                    maxLength={72}
                    required
                    autoComplete="new-password"
                    className="rounded-xl border-2 border-amber-100 px-3 py-2.5 outline-none focus:border-amber-300"
                  />
                  <input
                    value={newParent.parentName}
                    onChange={(event) => setNewParent((current) => ({ ...current, parentName: event.target.value }))}
                    placeholder="Parent name"
                    required
                    className="rounded-xl border-2 border-amber-100 px-3 py-2.5 outline-none focus:border-amber-300"
                  />
                  <input
                    value={newParent.childName}
                    onChange={(event) => setNewParent((current) => ({ ...current, childName: event.target.value }))}
                    placeholder="Child name"
                    required
                    className="rounded-xl border-2 border-amber-100 px-3 py-2.5 outline-none focus:border-amber-300"
                  />
                  <input
                    type="tel"
                    value={newParent.contactPhone}
                    onChange={(event) => setNewParent((current) => ({ ...current, contactPhone: event.target.value }))}
                    placeholder="Contact phone (optional)"
                    className="rounded-xl border-2 border-amber-100 px-3 py-2.5 outline-none focus:border-amber-300"
                  />
                  <button
                    id="create-parent-btn"
                    type="submit"
                    disabled={creatingParent}
                    className="flex cursor-pointer items-center justify-center gap-2 rounded-full bg-emerald-500 px-5 py-3 text-sm font-black text-white shadow-md hover:bg-emerald-600 disabled:opacity-60 sm:col-span-2 lg:col-span-5 lg:justify-self-end"
                  >
                    {creatingParent ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                    Create account
                  </button>
                </form>
              ) : null}

              {unlinkedProfiles.length ? (
                <div className="mt-4 grid gap-2 border-t border-amber-100 pt-4">
                  <p className="text-xs font-black uppercase tracking-wider text-amber-600">Waiting for first device sign-in</p>
                  {unlinkedProfiles.map((profile) => (
                    <div key={profile.user_id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-amber-50 px-4 py-3">
                      <div><p className="text-sm font-black">{profile.child_name} · @{profile.username}</p><p className="text-xs text-slate-500">Parent: {profile.parent_name}{profile.contact_phone ? ` · ${profile.contact_phone}` : ''}</p></div>
                      <button type="button" disabled={savingId === profile.user_id} onClick={() => void deleteUnlinkedAccount(profile)} className="flex cursor-pointer items-center gap-1.5 rounded-full bg-rose-100 px-3 py-2 text-xs font-black text-rose-700 hover:bg-rose-200 disabled:opacity-50"><Trash2 className="h-3.5 w-3.5" /> Delete account</button>
                    </div>
                  ))}
                </div>
              ) : null}
            </section>

            <div className="mb-5 flex flex-wrap items-center gap-3 rounded-2xl border border-amber-200 bg-white/90 p-3 shadow-sm">
              <div className="relative min-w-[240px] flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-amber-600" />
                <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search code, parent or child…" className="w-full rounded-xl border-2 border-amber-100 bg-amber-50/50 py-2.5 pl-10 pr-4 outline-none focus:border-amber-300" />
              </div>
              <button onClick={() => void loadDevices()} className="flex cursor-pointer items-center gap-2 rounded-full border-2 border-amber-200 bg-white px-4 py-2.5 text-sm font-bold hover:bg-amber-50">
                <RefreshCw className="h-4 w-4" /> Refresh
              </button>
            </div>
            {dataError ? <p className="mb-4 rounded-xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{dataError}</p> : null}
            <div className="grid gap-4">
              <AnimatePresence>
                {filteredDevices.map((device) => {
                  const spellingEnabled = hasProduct(device, 'spelling_bee');
                  const aiEnabled = hasProduct(device, 'ai_features');
                  const isSaving = savingId === device.id;
                  const linkedProfile = device.owner_user_id ? profiles[device.owner_user_id] : null;
                  const beeTokenBalance = device.owner_user_id ? wallets[device.owner_user_id] ?? 0 : 0;
                  return (
                    <motion.article key={device.id} layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl border-2 border-amber-200 bg-white/95 p-5 shadow-md">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-amber-600">Device code</p>
                          <p className="font-mono text-2xl font-black tracking-widest">{device.activation_code}</p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            onClick={() => void setProduct(device, 'spelling_bee', !spellingEnabled)}
                            disabled={isSaving}
                            className={`flex min-w-44 cursor-pointer items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-black text-white shadow-md transition-colors disabled:opacity-60 ${spellingEnabled ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-slate-500 hover:bg-slate-600'}`}
                          >
                            {isSaving ? <LoaderCircle className="h-4 w-4 animate-spin" /> : spellingEnabled ? <Check className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
                            Spelling Bee: {spellingEnabled ? 'ON' : 'OFF'}
                          </button>
                          <button
                            onClick={() => aiEnabled ? void setProduct(device, 'ai_features', false) : undefined}
                            disabled={isSaving || !aiEnabled}
                            title={aiEnabled ? 'Turn off AI features' : 'Use a parent activation request to turn on AI and add tokens together'}
                            className={`flex min-w-36 items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-black text-white shadow-md transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${aiEnabled ? 'cursor-pointer bg-violet-500 hover:bg-violet-600' : 'bg-slate-400'}`}
                          >
                            <Bot className="h-4 w-4" /> AI: {aiEnabled ? 'ON' : 'OFF'}
                          </button>
                        </div>
                      </div>
                      {linkedProfile ? (
                        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-violet-100 bg-violet-50/50 px-4 py-3">
                          <div><p className="text-xs font-black text-violet-700">Parent account @{linkedProfile.username}</p><p className="text-xs text-slate-500">{linkedProfile.parent_name} · {linkedProfile.child_name}</p></div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-2 text-sm font-black"><Coins className="h-4 w-4 text-amber-500" /> {beeTokenBalance.toLocaleString()}</span>
                            <input type="number" min="1" max="100000" value={reloadAmounts[device.owner_user_id!] ?? ''} onChange={(event) => setReloadAmounts((current) => ({ ...current, [device.owner_user_id!]: event.target.value }))} placeholder="Reload amount" aria-label={`Bee Token reload for ${linkedProfile.child_name}`} className="w-32 rounded-xl border-2 border-amber-100 bg-white px-3 py-2 text-sm outline-none focus:border-amber-300" />
                            <button type="button" onClick={() => void reloadBeeTokens(device)} disabled={isSaving} className="flex cursor-pointer items-center gap-1.5 rounded-full bg-amber-500 px-4 py-2 text-xs font-black text-white hover:bg-amber-600 disabled:opacity-50"><Plus className="h-3.5 w-3.5" /> Reload tokens</button>
                          </div>
                        </div>
                      ) : <p className="mt-3 rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-500">Legacy device record — it will link automatically when a parent signs in on that device.</p>}
                      <div className="mt-4 grid gap-3 sm:grid-cols-3">
                        <input value={device.parent_name ?? ''} onChange={(event) => updateDraft(device.id, 'parent_name', event.target.value)} placeholder="Parent name" className="rounded-xl border-2 border-amber-100 px-3 py-2 outline-none focus:border-amber-300" />
                        <input value={device.child_name ?? ''} onChange={(event) => updateDraft(device.id, 'child_name', event.target.value)} placeholder="Child name" className="rounded-xl border-2 border-amber-100 px-3 py-2 outline-none focus:border-amber-300" />
                        <input value={device.notes ?? ''} onChange={(event) => updateDraft(device.id, 'notes', event.target.value)} placeholder="Notes" className="rounded-xl border-2 border-amber-100 px-3 py-2 outline-none focus:border-amber-300" />
                      </div>
                      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                        <span className="text-xs text-slate-500">Last seen {new Date(device.last_seen_at).toLocaleString()}</span>
                        <div className="flex items-center gap-2">
                          <button
                            id={`delete-device-${device.id}`}
                            type="button"
                            onClick={() => void deleteDevice(device)}
                            disabled={isSaving}
                            className="flex cursor-pointer items-center gap-1.5 rounded-full bg-rose-100 px-4 py-2 text-xs font-black text-rose-700 hover:bg-rose-200 disabled:opacity-60"
                          >
                            <Trash2 className="h-3.5 w-3.5" /> Delete data
                          </button>
                          <button onClick={() => void saveDevice(device)} disabled={isSaving} className="flex cursor-pointer items-center gap-1.5 rounded-full bg-amber-100 px-4 py-2 text-xs font-black hover:bg-amber-200 disabled:opacity-60">
                            <Save className="h-3.5 w-3.5" /> Save details
                          </button>
                        </div>
                      </div>
                    </motion.article>
                  );
                })}
              </AnimatePresence>
              {!filteredDevices.length ? <div className="rounded-3xl border-2 border-dashed border-amber-300 bg-white/70 py-16 text-center font-bold text-amber-900/60">No registered devices found.</div> : null}
            </div>
          </>
        )}
      </div>
      <ActivationQrScannerModal
        open={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onCode={(code) => {
          setActivationSearch(code);
          setScannerOpen(false);
        }}
      />
    </main>
  );
}
