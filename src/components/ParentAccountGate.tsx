import { FormEvent, ReactNode, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Coins, KeyRound, LoaderCircle, LogOut, UserRound } from 'lucide-react';
import PeacefulBeeBackground from './PeacefulBeeBackground';
import ActivationCenter from './ActivationCenter';
import { useParentAccount } from '../context/ParentAccountContext';

export default function ParentAccountGate({ children }: { children: ReactNode }) {
  const { session, profile, access, pendingRequest, loading, actionLoading, error, configured, signIn, signOut } = useParentAccount();
  const [showAccount, setShowAccount] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (profile && !access.spellingBeeEnabled && !access.aiFeaturesEnabled && !pendingRequest) {
      setShowAccount(true);
    }
  }, [access.aiFeaturesEnabled, access.spellingBeeEnabled, pendingRequest, profile]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    await signIn(username, password);
  };

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center bg-[#FFFBEB]"><LoaderCircle className="h-11 w-11 animate-spin text-amber-500" /></div>;
  }

  if (!configured || !session) {
    return (
      <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#FFFBEB] p-5 text-[#78350F]">
        <PeacefulBeeBackground />
        <form onSubmit={submit} className="relative z-10 w-full max-w-md rounded-[2rem] border-2 border-amber-200 bg-white/95 p-7 shadow-2xl">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FBBF24]"><KeyRound className="h-7 w-7" /></div>
          <h1 className="mt-4 text-center font-['Fredoka',sans-serif] text-2xl font-black">Little Bee Parent Login</h1>
          <p className="mt-1 text-center text-sm text-slate-500">Enter the username and password issued by Little Bee reception.</p>

          <label className="mt-5 block text-xs font-black uppercase tracking-wider">Username</label>
          <input autoComplete="username" value={username} onChange={(event) => setUsername(event.target.value)} required minLength={3} maxLength={32} className="mt-1 w-full rounded-2xl border-2 border-amber-100 bg-amber-50/40 px-4 py-3 outline-none focus:border-amber-400" />

          <label className="mt-4 block text-xs font-black uppercase tracking-wider">Password</label>
          <input autoComplete="current-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required minLength={8} className="mt-1 w-full rounded-2xl border-2 border-amber-100 bg-amber-50/40 px-4 py-3 outline-none focus:border-amber-400" />

          {error ? <p className="mt-4 rounded-xl bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700">{error}</p> : null}
          <button disabled={actionLoading || !configured} className="mt-5 flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-[#FBBF24] px-5 py-3 font-black shadow-md hover:bg-amber-400 disabled:opacity-50">
            {actionLoading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}
            Sign in
          </button>
          <p className="mt-4 text-center text-xs text-slate-500">Need an account or forgot the password? Ask reception staff for assistance.</p>
          {!configured ? <p className="mt-3 text-center text-xs text-rose-600">Production account configuration is unavailable. Please contact support.</p> : null}
        </form>
      </main>
    );
  }

  if (!profile) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#FFFBEB] p-5 text-[#78350F]">
        <div className="max-w-md rounded-3xl border-2 border-amber-200 bg-white p-8 text-center shadow-xl">
          <UserRound className="mx-auto h-11 w-11 text-amber-500" />
          <h1 className="mt-3 text-xl font-black">Parent account required</h1>
          <p className="mt-2 text-sm text-slate-600">This login belongs to staff or has no family profile. Use the Admin Dashboard for staff access.</p>
          <button type="button" onClick={() => void signOut()} className="mt-5 flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-amber-100 px-4 py-3 font-black"><LogOut className="h-4 w-4" /> Sign out</button>
        </div>
      </main>
    );
  }

  if (showAccount) return <ActivationCenter onContinue={() => setShowAccount(false)} />;

  return (
    <>
      {children}
      <AnimatePresence>
        <motion.button
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          type="button"
          onClick={() => setShowAccount(true)}
          className="fixed right-4 top-4 z-40 flex cursor-pointer items-center gap-2 rounded-full border-2 border-white bg-[#FBBF24] px-4 py-2.5 font-['Fredoka',sans-serif] text-sm font-black text-[#78350F] shadow-xl hover:bg-amber-400"
          aria-label="Open account and activation settings"
        >
          <Coins className="h-5 w-5" />
          <span>{access.beeTokens.toLocaleString()} Bee Tokens</span>
          <span className="hidden rounded-full bg-white/70 px-2 py-0.5 text-[10px] sm:inline">ACCOUNT</span>
        </motion.button>
      </AnimatePresence>
    </>
  );
}
