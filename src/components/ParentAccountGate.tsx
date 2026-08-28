import { FormEvent, ReactNode, useEffect, useState } from 'react';
import { KeyRound, LoaderCircle, LogOut, UserPlus, UserRound } from 'lucide-react';
import PeacefulBeeBackground from './PeacefulBeeBackground';
import ActivationCenter from './ActivationCenter';
import { useParentAccount } from '../context/ParentAccountContext';

export default function ParentAccountGate({ children }: { children: ReactNode }) {
  const {
    session,
    profile,
    access,
    pendingRequest,
    loading,
    actionLoading,
    error,
    configured,
    showAccount,
    setShowAccount,
    clearError,
    signIn,
    signUp,
    signOut,
  } = useParentAccount();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [parentName, setParentName] = useState('');
  const [childName, setChildName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (profile && !access.spellingBeeEnabled && !access.aiFeaturesEnabled && !pendingRequest) {
      setShowAccount(true);
    }
  }, [access.aiFeaturesEnabled, access.spellingBeeEnabled, pendingRequest, profile, setShowAccount]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setFormError(null);
    if (mode === 'signin') {
      await signIn(username, password);
      return;
    }

    if (password !== confirmPassword) {
      setFormError('The passwords do not match.');
      return;
    }

    await signUp({ username, password, parentName, childName, contactPhone });
  };

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center bg-[#FFFBEB]"><LoaderCircle className="h-11 w-11 animate-spin text-amber-500" /></div>;
  }

  if (!configured || !session) {
    return (
      <main className="relative flex min-h-screen items-center justify-center overflow-x-hidden bg-[#FFFBEB] p-5 py-8 text-[#78350F]">
        <PeacefulBeeBackground />
        <form onSubmit={submit} className="relative z-10 w-full max-w-md rounded-[2rem] border-2 border-amber-200 bg-white/95 p-7 shadow-2xl">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FBBF24]">
            {mode === 'signin' ? <KeyRound className="h-7 w-7" /> : <UserPlus className="h-7 w-7" />}
          </div>
          <h1 className="mt-4 text-center font-['Fredoka',sans-serif] text-2xl font-black">
            {mode === 'signin' ? 'Little Bee Parent Login' : 'Create Parent Account'}
          </h1>
          <p className="mt-1 text-center text-sm text-slate-500">
            {mode === 'signin' ? 'Welcome back! Enter your username and password.' : 'Register first, then show your activation QR code at reception.'}
          </p>

          <div className="mt-5 grid grid-cols-2 rounded-full bg-amber-50 p-1 text-sm font-black">
            <button type="button" onClick={() => { setMode('signin'); setFormError(null); clearError(); }} className={`cursor-pointer rounded-full px-4 py-2 transition ${mode === 'signin' ? 'bg-white text-amber-800 shadow' : 'text-slate-500'}`}>Sign in</button>
            <button type="button" onClick={() => { setMode('signup'); setFormError(null); clearError(); }} className={`cursor-pointer rounded-full px-4 py-2 transition ${mode === 'signup' ? 'bg-white text-amber-800 shadow' : 'text-slate-500'}`}>Create account</button>
          </div>

          {mode === 'signup' ? (
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <label className="block text-xs font-black uppercase tracking-wider">
                Parent name
                <input autoComplete="name" value={parentName} onChange={(event) => setParentName(event.target.value)} required maxLength={80} className="mt-1 w-full rounded-2xl border-2 border-amber-100 bg-amber-50/40 px-4 py-3 text-sm font-normal normal-case tracking-normal outline-none focus:border-amber-400" />
              </label>
              <label className="block text-xs font-black uppercase tracking-wider">
                Child name
                <input value={childName} onChange={(event) => setChildName(event.target.value)} required maxLength={80} className="mt-1 w-full rounded-2xl border-2 border-amber-100 bg-amber-50/40 px-4 py-3 text-sm font-normal normal-case tracking-normal outline-none focus:border-amber-400" />
              </label>
              <label className="block text-xs font-black uppercase tracking-wider sm:col-span-2">
                Contact number
                <input autoComplete="tel" type="tel" value={contactPhone} onChange={(event) => setContactPhone(event.target.value)} required maxLength={30} placeholder="For reception verification" className="mt-1 w-full rounded-2xl border-2 border-amber-100 bg-amber-50/40 px-4 py-3 text-sm font-normal normal-case tracking-normal outline-none placeholder:text-slate-400 focus:border-amber-400" />
              </label>
            </div>
          ) : null}

          <label className={`${mode === 'signin' ? 'mt-5' : 'mt-4'} block text-xs font-black uppercase tracking-wider`}>Username</label>
          <input autoComplete="username" value={username} onChange={(event) => setUsername(event.target.value.toLowerCase())} required minLength={3} maxLength={32} pattern="[a-z0-9][a-z0-9._-]{2,31}" title="Use 3–32 lowercase letters, numbers, dots, dashes, or underscores" className="mt-1 w-full rounded-2xl border-2 border-amber-100 bg-amber-50/40 px-4 py-3 outline-none focus:border-amber-400" />
          {mode === 'signup' ? <p className="mt-1 text-[11px] text-slate-500">3–32 lowercase letters, numbers, dots, dashes, or underscores.</p> : null}

          <label className="mt-4 block text-xs font-black uppercase tracking-wider">Password</label>
          <input autoComplete={mode === 'signin' ? 'current-password' : 'new-password'} type="password" value={password} onChange={(event) => setPassword(event.target.value)} required minLength={8} className="mt-1 w-full rounded-2xl border-2 border-amber-100 bg-amber-50/40 px-4 py-3 outline-none focus:border-amber-400" />
          {mode === 'signup' ? <p className="mt-1 text-[11px] text-slate-500">Use at least 8 characters. Keep this password private.</p> : null}

          {mode === 'signup' ? (
            <>
              <label className="mt-4 block text-xs font-black uppercase tracking-wider">Confirm password</label>
              <input autoComplete="new-password" type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} required minLength={8} className="mt-1 w-full rounded-2xl border-2 border-amber-100 bg-amber-50/40 px-4 py-3 outline-none focus:border-amber-400" />
            </>
          ) : null}

          {formError ? <p className="mt-4 rounded-xl bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700">{formError}</p> : null}
          {error ? <p className="mt-4 rounded-xl bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700">{error}</p> : null}
          <button disabled={actionLoading || !configured} className="mt-5 flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-[#FBBF24] px-5 py-3 font-black shadow-md hover:bg-amber-400 disabled:opacity-50">
            {actionLoading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : mode === 'signin' ? <KeyRound className="h-4 w-4" /> : <UserPlus className="h-4 w-4" />}
            {mode === 'signin' ? 'Sign in' : 'Create my account'}
          </button>
          <p className="mt-4 text-center text-xs text-slate-500">
            {mode === 'signin' ? 'Forgot the password? Ask reception staff for assistance.' : 'Creating an account does not activate paid programs. Reception approval is still required.'}
          </p>
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

  return <>{children}</>;
}
