import { useState, FormEvent } from 'react';
import { KeyRound, Check, Copy, Sparkles, X, LoaderCircle, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface ResetPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  username: string;
  parentName: string;
  childName: string;
  contactPhone?: string | null;
  onSuccess: () => void;
}

export default function ResetPasswordModal({
  isOpen,
  onClose,
  userId,
  username,
  parentName,
  childName,
  contactPhone,
  onSuccess,
}: ResetPasswordModalProps) {
  const [newPassword, setNewPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const generateEasyPassword = () => {
    const prefixes = ['bee', 'honey', 'little', 'smart', 'star', 'bloom'];
    const randomPrefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    setNewPassword(`${randomPrefix}${randomNum}pass`);
  };

  const handleReset = async (e: FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setBusy(true);
    setError(null);

    try {
      if (!isSupabaseConfigured) {
        // Local accounts fallback
        try {
          const raw = localStorage.getItem('little_bee_local_accounts_v1');
          if (raw) {
            const accounts = JSON.parse(raw);
            const normalized = username.toLowerCase().trim();
            if (accounts[normalized]) {
              accounts[normalized].password = newPassword;
              localStorage.setItem('little_bee_local_accounts_v1', JSON.stringify(accounts));
            }
          }
        } catch {
          // ignore
        }
        setSuccess(true);
        onSuccess();
        setBusy(false);
        return;
      }

      // Try invoking manage-parent-account edge function
      const { data, error: funcError } = await supabase.functions.invoke('manage-parent-account', {
        body: {
          action: 'update_password',
          userId,
          password: newPassword,
          username,
        },
      });

      if (funcError || data?.error) {
        // Fallback: try alternative action names or admin rpc if supported
        const { error: altError } = await supabase.rpc('admin_set_parent_password', {
          p_user_id: userId,
          p_password: newPassword,
        });

        if (altError) {
          setError(
            data?.error ??
              funcError?.message ??
              altError.message ??
              'Unable to update password via edge function. Please check staff permissions.'
          );
          setBusy(false);
          return;
        }
      }

      setSuccess(true);
      onSuccess();
    } catch (err: any) {
      setError(err?.message || 'An unexpected error occurred while resetting password.');
    } finally {
      setBusy(false);
    }
  };

  const copyLoginDetails = () => {
    const text = `🐝 *Little Bee Account Login*
👤 *Child:* ${childName}
👨‍👩‍👧 *Parent:* ${parentName}
🔑 *Username:* ${username}
🔒 *New Password:* ${newPassword}
${contactPhone ? `📱 *Phone:* ${contactPhone}\n` : ''}🌐 *App Link:* ${window.location.origin}

_Please keep your login credentials safe!_`;

    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs">
      <div className="w-full max-w-lg rounded-3xl border-2 border-amber-200 bg-white p-6 shadow-2xl sm:p-7">
        <div className="flex items-center justify-between border-b border-amber-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
              <KeyRound className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-['Fredoka',sans-serif] text-xl font-black text-[#78350F]">
                Reset Parent Password
              </h2>
              <p className="text-xs text-slate-500">
                Set a temporary or new password for this family
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 cursor-pointer transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Account Info Summary */}
        <div className="mt-4 rounded-2xl border border-amber-100 bg-amber-50/60 p-4">
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="font-bold text-slate-400 uppercase tracking-wider block text-[10px]">
                Child Name
              </span>
              <span className="font-black text-amber-900 text-sm">{childName}</span>
            </div>
            <div>
              <span className="font-bold text-slate-400 uppercase tracking-wider block text-[10px]">
                Parent Name
              </span>
              <span className="font-black text-amber-900 text-sm">{parentName}</span>
            </div>
            <div>
              <span className="font-bold text-slate-400 uppercase tracking-wider block text-[10px]">
                Username
              </span>
              <span className="font-mono font-black text-violet-700 text-sm">@{username}</span>
            </div>
            <div>
              <span className="font-bold text-slate-400 uppercase tracking-wider block text-[10px]">
                Contact
              </span>
              <span className="font-bold text-slate-700 text-sm">{contactPhone || '—'}</span>
            </div>
          </div>
        </div>

        {success ? (
          <div className="mt-5 space-y-4">
            <div className="rounded-2xl border-2 border-emerald-200 bg-emerald-50 p-4 text-center">
              <CheckCircle2 className="mx-auto h-9 w-9 text-emerald-600" />
              <h3 className="mt-2 font-black text-emerald-900">Password Updated Successfully!</h3>
              <p className="mt-1 text-xs text-emerald-700">
                The new password is active. You can now copy and send the login details to the parent.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 font-mono text-xs text-slate-700">
              <div className="flex justify-between items-center mb-1 pb-1 border-b border-slate-200">
                <span className="font-sans font-bold text-slate-500">Credentials Card:</span>
                <span className="text-[10px] text-slate-400">Ready to send</span>
              </div>
              <p><strong>Username:</strong> @{username}</p>
              <p><strong>Password:</strong> {newPassword}</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <button
                type="button"
                onClick={copyLoginDetails}
                className="flex-1 flex cursor-pointer items-center justify-center gap-2 rounded-full bg-violet-600 px-5 py-3 font-black text-white shadow-md hover:bg-violet-700 transition"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? 'Copied to Clipboard!' : 'Copy Login Card for Parent'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex cursor-pointer items-center justify-center rounded-full border-2 border-slate-200 bg-white px-5 py-3 font-bold text-slate-700 hover:bg-slate-50 transition"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleReset} className="mt-5 space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-black uppercase tracking-wider text-slate-700">
                  New Password
                </label>
                <button
                  type="button"
                  onClick={generateEasyPassword}
                  className="flex items-center gap-1 text-xs font-bold text-amber-700 hover:text-amber-900 cursor-pointer underline hover:no-underline"
                >
                  <Sparkles className="h-3.5 w-3.5" /> Generate Easy Password
                </button>
              </div>
              <input
                type="text"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter 8+ character password"
                minLength={8}
                required
                className="w-full rounded-2xl border-2 border-amber-200 bg-amber-50/40 px-4 py-3 font-mono font-bold text-slate-800 outline-none focus:border-amber-400"
              />
              <p className="mt-1 text-[11px] text-slate-500">
                Minimum 8 characters. You can share this new password directly with the parent.
              </p>
            </div>

            {error && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-bold text-rose-700 flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-full border-2 border-slate-200 bg-white py-3 font-bold text-slate-600 hover:bg-slate-50 cursor-pointer transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={busy || !newPassword}
                className="flex-1 flex cursor-pointer items-center justify-center gap-2 rounded-full bg-[#FBBF24] py-3 font-black text-[#78350F] shadow-md hover:bg-amber-400 disabled:opacity-50 transition"
              >
                {busy ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}
                {busy ? 'Updating...' : 'Save New Password'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
