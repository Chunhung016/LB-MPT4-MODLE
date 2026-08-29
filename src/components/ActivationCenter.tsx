import { FormEvent, useEffect, useState } from 'react';
import QRCode from 'qrcode';
import {
  ArrowLeft,
  Bot,
  Check,
  Coins,
  LoaderCircle,
  LogOut,
  QrCode,
  Save,
  Sparkles,
  UserRound,
} from 'lucide-react';
import PeacefulBeeBackground from './PeacefulBeeBackground';
import { useParentAccount } from '../context/ParentAccountContext';

interface ActivationCenterProps {
  onContinue: () => void;
}

export default function ActivationCenter({ onContinue }: ActivationCenterProps) {
  const {
    profile,
    access,
    pendingRequest,
    actionLoading,
    error,
    requestActivation,
    updateProfile,
    signOut,
  } = useParentAccount();
  const [wantsSpellingBee, setWantsSpellingBee] = useState(
    pendingRequest?.wants_spelling_bee ?? !access.spellingBeeEnabled,
  );
  const [wantsAi, setWantsAi] = useState(pendingRequest?.wants_ai ?? !access.aiFeaturesEnabled);
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [profileDraft, setProfileDraft] = useState({
    parent_name: profile?.parent_name ?? '',
    child_name: profile?.child_name ?? '',
    contact_phone: profile?.contact_phone ?? '',
  });

  useEffect(() => {
    setWantsSpellingBee(pendingRequest?.wants_spelling_bee ?? !access.spellingBeeEnabled);
    setWantsAi(pendingRequest?.wants_ai ?? !access.aiFeaturesEnabled);
  }, [access.aiFeaturesEnabled, access.spellingBeeEnabled, pendingRequest]);

  useEffect(() => {
    setProfileDraft({
      parent_name: profile?.parent_name ?? '',
      child_name: profile?.child_name ?? '',
      contact_phone: profile?.contact_phone ?? '',
    });
  }, [profile]);

  useEffect(() => {
    if (!pendingRequest?.request_code) {
      setQrDataUrl('');
      return;
    }
    void QRCode.toDataURL(`LB-ACT:${pendingRequest.request_code}`, {
      width: 420,
      margin: 2,
      errorCorrectionLevel: 'H',
      color: { dark: '#78350F', light: '#FFFFFF' },
    }).then(setQrDataUrl);
  }, [pendingRequest?.request_code]);

  const submitRequest = async (event: FormEvent) => {
    event.preventDefault();
    await requestActivation(wantsSpellingBee, wantsAi);
  };

  const saveProfile = async (event: FormEvent) => {
    event.preventDefault();
    await updateProfile(profileDraft);
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#FFFBEB] px-4 py-6 text-[#78350F] sm:px-8">
      <PeacefulBeeBackground />
      <div className="relative z-10 mx-auto max-w-5xl">
        <header className="mb-5 flex flex-wrap items-center justify-between gap-4 rounded-3xl border-2 border-amber-200 bg-white/95 px-5 py-4 shadow-lg">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onContinue}
              className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-2xl border-2 border-amber-200 bg-amber-50 text-[#78350F] hover:bg-amber-100 transition shadow-xs"
              title="Return to modules & worksheets"
              aria-label="Return to learning app"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FBBF24]"><UserRound className="h-7 w-7" /></div>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-amber-600">Little Bee account</p>
              <h1 className="font-['Fredoka',sans-serif] text-2xl font-black">Welcome, {profile?.child_name}</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onContinue}
              className="flex cursor-pointer items-center gap-2 rounded-full border-2 border-amber-300 bg-[#FBBF24] px-4 py-2 text-sm font-black text-[#78350F] hover:bg-amber-400 shadow-xs transition"
            >
              <ArrowLeft className="h-4 w-4" /> Return to App
            </button>
            <div className="flex items-center gap-2 rounded-full bg-amber-100 px-4 py-2 font-black">
              <Coins className="h-5 w-5 text-amber-500" /> {access.beeTokens.toLocaleString()} Bee Tokens
            </div>
            <button type="button" onClick={() => void signOut()} className="flex cursor-pointer items-center gap-2 rounded-full border-2 border-amber-200 bg-white px-4 py-2 text-sm font-bold hover:bg-amber-50">
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          </div>
        </header>

        {error ? <p className="mb-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{error}</p> : null}

        <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="rounded-3xl border-2 border-amber-200 bg-white/95 p-6 shadow-lg">
            <div className="flex items-center gap-2"><Sparkles className="h-6 w-6 text-amber-500" /><h2 className="font-['Fredoka',sans-serif] text-xl font-black">Reception activation</h2></div>
            <p className="mt-2 text-sm text-slate-600">Choose what you purchased, create the QR, then show this screen to reception. No password is stored in the QR.</p>

            <form onSubmit={submitRequest} className="mt-5 space-y-3">
              <label className={`flex cursor-pointer items-center gap-4 rounded-2xl border-2 p-4 ${wantsSpellingBee ? 'border-amber-400 bg-amber-50' : 'border-slate-200'}`}>
                <input type="checkbox" checked={wantsSpellingBee} onChange={(event) => setWantsSpellingBee(event.target.checked)} className="h-5 w-5 accent-amber-500" />
                <div className="flex-1"><p className="font-black">Spelling Bee</p><p className="text-xs text-slate-500">Unlock the Spelling Bee bubble and practice program.</p></div>
                {access.spellingBeeEnabled ? <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700">ACTIVE</span> : null}
              </label>
              <label className={`flex cursor-pointer items-center gap-4 rounded-2xl border-2 p-4 ${wantsAi ? 'border-violet-400 bg-violet-50' : 'border-slate-200'}`}>
                <input type="checkbox" checked={wantsAi} onChange={(event) => setWantsAi(event.target.checked)} className="h-5 w-5 accent-violet-500" />
                <Bot className="h-6 w-6 text-violet-500" />
                <div className="flex-1"><p className="font-black">AI features + Bee Tokens</p><p className="text-xs text-slate-500">Reception will enter your purchased starting token amount.</p></div>
                {access.aiFeaturesEnabled ? <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700">ACTIVE</span> : null}
              </label>
              <button type="submit" disabled={actionLoading || (!wantsSpellingBee && !wantsAi)} className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-[#FBBF24] px-5 py-3 font-black shadow-md hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-50">
                {actionLoading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <QrCode className="h-4 w-4" />} {pendingRequest ? 'Update activation QR' : 'Create activation QR'}
              </button>
            </form>

            {pendingRequest ? (
              <div className="mt-6 rounded-3xl border-2 border-dashed border-amber-300 bg-amber-50/60 p-5 text-center">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-amber-600">Show this to reception</p>
                {qrDataUrl ? <img src={qrDataUrl} alt="Little Bee reception activation QR code" className="mx-auto mt-3 h-52 w-52 rounded-2xl border-4 border-white shadow-md" /> : <LoaderCircle className="mx-auto mt-8 h-9 w-9 animate-spin" />}
                <p className="mt-3 font-mono text-xl font-black tracking-wider">{pendingRequest.request_code}</p>
                <p className="mt-1 text-xs text-slate-500">Reception can scan the QR or type this code.</p>
              </div>
            ) : null}
          </section>

          <section className="space-y-5">
            <form onSubmit={saveProfile} className="rounded-3xl border-2 border-amber-200 bg-white/95 p-6 shadow-lg">
              <h2 className="font-['Fredoka',sans-serif] text-lg font-black">Family profile</h2>
              <p className="mt-1 text-xs text-slate-500">Reception uses this profile for faster activation and future token reloads.</p>
              <label className="mt-4 block text-xs font-black uppercase tracking-wider">Username</label>
              <input value={profile?.username ?? ''} disabled className="mt-1 w-full rounded-xl border-2 border-slate-100 bg-slate-100 px-3 py-2 text-slate-500" />
              <label className="mt-3 block text-xs font-black uppercase tracking-wider">Parent name</label>
              <input required value={profileDraft.parent_name} onChange={(event) => setProfileDraft((current) => ({ ...current, parent_name: event.target.value }))} className="mt-1 w-full rounded-xl border-2 border-amber-100 px-3 py-2 outline-none focus:border-amber-300" />
              <label className="mt-3 block text-xs font-black uppercase tracking-wider">Child name</label>
              <input required value={profileDraft.child_name} onChange={(event) => setProfileDraft((current) => ({ ...current, child_name: event.target.value }))} className="mt-1 w-full rounded-xl border-2 border-amber-100 px-3 py-2 outline-none focus:border-amber-300" />
              <label className="mt-3 block text-xs font-black uppercase tracking-wider">Contact phone (optional)</label>
              <input type="tel" value={profileDraft.contact_phone} onChange={(event) => setProfileDraft((current) => ({ ...current, contact_phone: event.target.value }))} className="mt-1 w-full rounded-xl border-2 border-amber-100 px-3 py-2 outline-none focus:border-amber-300" />
              <button type="submit" disabled={actionLoading} className="mt-4 flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-amber-100 px-4 py-2.5 text-sm font-black hover:bg-amber-200 disabled:opacity-50">
                <Save className="h-4 w-4" /> Save profile
              </button>
            </form>

            <div className="rounded-3xl border-2 border-emerald-200 bg-emerald-50/90 p-5">
              <div className="flex items-center gap-2 font-black text-emerald-800"><Check className="h-5 w-5" /> Your worksheets stay available</div>
              <p className="mt-1 text-xs text-emerald-800/75">You can continue using normal worksheets while reception completes paid-feature activation.</p>
              <button type="button" onClick={onContinue} className="mt-4 w-full cursor-pointer rounded-full bg-emerald-500 px-5 py-3 font-black text-white shadow-md hover:bg-emerald-600">Continue to app</button>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
