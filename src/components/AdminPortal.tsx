import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  Check,
  KeyRound,
  LoaderCircle,
  LogOut,
  RefreshCw,
  Save,
  Search,
  ShieldCheck,
  Sparkles,
  UserRound,
} from 'lucide-react';
import type { Session, User } from '@supabase/supabase-js';
import PeacefulBeeBackground from './PeacefulBeeBackground';
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
  entitlements: EntitlementRow[];
}

function hasSpellingBee(device: DeviceRow) {
  const entitlement = device.entitlements?.find((item) => item.product_slug === 'spelling_bee');
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
    const { data, error } = await supabase
      .from('devices')
      .select('id, activation_code, parent_name, child_name, notes, created_at, last_seen_at, entitlements(id, product_slug, active, expires_at)')
      .order('last_seen_at', { ascending: false });

    if (error) {
      setDataError(error.message);
      return;
    }

    setDevices((data ?? []) as DeviceRow[]);
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setAuthReady(true);
      setAuthError('Supabase environment variables are missing.');
      return;
    }

    void supabase.auth.getSession().then(async ({ data }) => {
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

  const signIn = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setAuthError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setAuthError(error.message);
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

  const setSpellingBee = async (device: DeviceRow, active: boolean) => {
    if (!session?.user) return;
    setSavingId(device.id);
    setDataError(null);
    const { error } = await supabase.from('entitlements').upsert(
      {
        device_id: device.id,
        product_slug: 'spelling_bee',
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
                  const enabled = hasSpellingBee(device);
                  const isSaving = savingId === device.id;
                  return (
                    <motion.article key={device.id} layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl border-2 border-amber-200 bg-white/95 p-5 shadow-md">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-amber-600">Device code</p>
                          <p className="font-mono text-2xl font-black tracking-widest">{device.activation_code}</p>
                        </div>
                        <button
                          onClick={() => void setSpellingBee(device, !enabled)}
                          disabled={isSaving}
                          className={`flex min-w-48 cursor-pointer items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-black text-white shadow-md transition-colors disabled:opacity-60 ${enabled ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-slate-500 hover:bg-slate-600'}`}
                        >
                          {isSaving ? <LoaderCircle className="h-4 w-4 animate-spin" /> : enabled ? <Check className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
                          Spelling Bee: {enabled ? 'ON' : 'OFF'}
                        </button>
                      </div>
                      <div className="mt-4 grid gap-3 sm:grid-cols-3">
                        <input value={device.parent_name ?? ''} onChange={(event) => updateDraft(device.id, 'parent_name', event.target.value)} placeholder="Parent name" className="rounded-xl border-2 border-amber-100 px-3 py-2 outline-none focus:border-amber-300" />
                        <input value={device.child_name ?? ''} onChange={(event) => updateDraft(device.id, 'child_name', event.target.value)} placeholder="Child name" className="rounded-xl border-2 border-amber-100 px-3 py-2 outline-none focus:border-amber-300" />
                        <input value={device.notes ?? ''} onChange={(event) => updateDraft(device.id, 'notes', event.target.value)} placeholder="Notes" className="rounded-xl border-2 border-amber-100 px-3 py-2 outline-none focus:border-amber-300" />
                      </div>
                      <div className="mt-3 flex items-center justify-between gap-3">
                        <span className="text-xs text-slate-500">Last seen {new Date(device.last_seen_at).toLocaleString()}</span>
                        <button onClick={() => void saveDevice(device)} disabled={isSaving} className="flex cursor-pointer items-center gap-1.5 rounded-full bg-amber-100 px-4 py-2 text-xs font-black hover:bg-amber-200 disabled:opacity-60">
                          <Save className="h-3.5 w-3.5" /> Save details
                        </button>
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
    </main>
  );
}
