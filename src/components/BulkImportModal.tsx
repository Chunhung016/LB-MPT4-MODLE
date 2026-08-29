import { useState, useRef, ChangeEvent } from 'react';
import {
  Upload,
  FileSpreadsheet,
  Download,
  CheckCircle2,
  AlertCircle,
  LoaderCircle,
  X,
  Plus,
  RefreshCw,
  FileText,
  Sparkles,
} from 'lucide-react';
import { parseCSV, generateSampleCSV, ParentImportRecord } from '../utils/csvHelper';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface BulkImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function BulkImportModal({ isOpen, onClose, onSuccess }: BulkImportModalProps) {
  const [activeTab, setActiveTab] = useState<'csv' | 'json' | 'paste'>('csv');
  const [pasteText, setPasteText] = useState('');
  const [parsedRows, setParsedRows] = useState<ParentImportRecord[]>([]);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [importLogs, setImportLogs] = useState<{ success: number; failed: number; errors: string[] }>({
    success: 0,
    failed: 0,
    errors: [],
  });
  const [step, setStep] = useState<'input' | 'preview' | 'result'>('input');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (file.name.endsWith('.json')) {
        try {
          const json = JSON.parse(content);
          const array = Array.isArray(json) ? json : [json];
          setParsedRows(
            array.map((item) => ({
              username: String(item.username || '').toLowerCase().trim(),
              password: String(item.password || `bee${Math.floor(1000 + Math.random() * 9000)}pass`),
              parent_name: String(item.parent_name || item.parent || 'Parent'),
              child_name: String(item.child_name || item.child || 'Student'),
              contact_phone: item.contact_phone || item.phone || '',
              bee_tokens: Number(item.bee_tokens || item.tokens || 100),
              spelling_bee: item.spelling_bee ?? true,
              ai_features: item.ai_features ?? false,
            }))
          );
          setStep('preview');
        } catch {
          alert('Invalid JSON file format.');
        }
      } else {
        const rows = parseCSV(content);
        if (rows.length === 0) {
          alert('Could not parse any valid parent rows from the CSV file.');
          return;
        }
        setParsedRows(rows);
        setStep('preview');
      }
    };
    reader.readAsText(file);
  };

  const handleParsePaste = () => {
    if (!pasteText.trim()) return;

    if (pasteText.trim().startsWith('[') || pasteText.trim().startsWith('{')) {
      try {
        const json = JSON.parse(pasteText.trim());
        const array = Array.isArray(json) ? json : [json];
        setParsedRows(
          array.map((item) => ({
            username: String(item.username || '').toLowerCase().trim(),
            password: String(item.password || `bee${Math.floor(1000 + Math.random() * 9000)}pass`),
            parent_name: String(item.parent_name || item.parent || 'Parent'),
            child_name: String(item.child_name || item.child || 'Student'),
            contact_phone: item.contact_phone || item.phone || '',
            bee_tokens: Number(item.bee_tokens || item.tokens || 100),
            spelling_bee: item.spelling_bee ?? true,
            ai_features: item.ai_features ?? false,
          }))
        );
        setStep('preview');
      } catch (err: any) {
        alert('Invalid JSON format: ' + err.message);
      }
    } else {
      const rows = parseCSV(pasteText);
      if (rows.length === 0) {
        alert('Could not parse any rows. Make sure the first line has header columns: username,password,parent_name,child_name,contact_phone');
        return;
      }
      setParsedRows(rows);
      setStep('preview');
    }
  };

  const downloadTemplate = () => {
    const csv = generateSampleCSV();
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'little_bee_parents_import_template.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const executeImport = async () => {
    setImporting(true);
    setProgress({ current: 0, total: parsedRows.length });
    let successCount = 0;
    let failCount = 0;
    const errors: string[] = [];

    // Fallback if Supabase not configured: save locally
    if (!isSupabaseConfigured) {
      try {
        const raw = localStorage.getItem('little_bee_local_accounts_v1') || '{}';
        const accounts = JSON.parse(raw);

        for (let i = 0; i < parsedRows.length; i++) {
          const row = parsedRows[i];
          const username = row.username.toLowerCase().trim();
          accounts[username] = {
            profile: {
              user_id: 'local_' + username,
              username,
              parent_name: row.parent_name,
              child_name: row.child_name,
              contact_phone: row.contact_phone || null,
            },
            password: row.password || 'password123',
            access: {
              activationCode: 'BEE-' + Math.floor(1000 + Math.random() * 9000),
              spellingBeeEnabled: Boolean(row.spelling_bee),
              aiFeaturesEnabled: Boolean(row.ai_features),
              beeTokens: row.bee_tokens || 100,
            },
            pendingRequest: null,
          };
          successCount++;
          setProgress({ current: i + 1, total: parsedRows.length });
        }
        localStorage.setItem('little_bee_local_accounts_v1', JSON.stringify(accounts));
      } catch (err: any) {
        errors.push(err.message || 'Error saving to local storage.');
      }
      setImportLogs({ success: successCount, failed: failCount, errors });
      setImporting(false);
      setStep('result');
      onSuccess();
      return;
    }

    // Supabase Import via manage-parent-account edge function or inserts
    for (let i = 0; i < parsedRows.length; i++) {
      const row = parsedRows[i];
      setProgress({ current: i + 1, total: parsedRows.length });

      try {
        const { data, error } = await supabase.functions.invoke('manage-parent-account', {
          body: {
            action: 'create',
            username: row.username,
            password: row.password || `bee${Math.floor(1000 + Math.random() * 9000)}pass`,
            parentName: row.parent_name,
            childName: row.child_name,
            contactPhone: row.contact_phone || '',
          },
        });

        if (error || data?.error) {
          failCount++;
          errors.push(`@${row.username}: ${data?.error || error?.message || 'Creation failed'}`);
        } else {
          successCount++;
          // Optionally add tokens if specified > 0
          if (row.bee_tokens && row.bee_tokens > 0 && data?.user?.id) {
            await supabase.rpc('add_bee_tokens', {
              p_user_id: data.user.id,
              p_amount: row.bee_tokens,
              p_reason: 'Initial Import Balance',
            });
          }
        }
      } catch (err: any) {
        failCount++;
        errors.push(`@${row.username}: ${err?.message || 'Network error'}`);
      }
    }

    setImportLogs({ success: successCount, failed: failCount, errors });
    setImporting(false);
    setStep('result');
    onSuccess();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs">
      <div className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl border-2 border-amber-200 bg-white shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-amber-100 bg-amber-50/50 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-200 text-amber-800">
              <FileSpreadsheet className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-['Fredoka',sans-serif] text-xl font-black text-[#78350F]">
                Import Parent Accounts
              </h2>
              <p className="text-xs text-slate-500">
                Bulk import parent usernames, passwords, child details & tokens
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

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {step === 'input' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between rounded-2xl border border-amber-200 bg-amber-50 p-4">
                <div>
                  <h4 className="text-sm font-bold text-amber-900">Need a sample format?</h4>
                  <p className="text-xs text-amber-700">
                    Download our ready-to-fill CSV template to organize your family data.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={downloadTemplate}
                  className="flex items-center gap-1.5 rounded-full border border-amber-300 bg-white px-3.5 py-2 text-xs font-bold text-amber-800 shadow-xs hover:bg-amber-100 cursor-pointer transition shrink-0"
                >
                  <Download className="h-4 w-4" /> Download Template
                </button>
              </div>

              {/* Upload Tabs */}
              <div className="flex rounded-xl bg-slate-100 p-1 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setActiveTab('csv')}
                  className={`flex-1 py-2 rounded-lg cursor-pointer transition ${
                    activeTab === 'csv' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                  }`}
                >
                  Upload File (CSV / JSON)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('paste')}
                  className={`flex-1 py-2 rounded-lg cursor-pointer transition ${
                    activeTab === 'paste' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                  }`}
                >
                  Paste CSV or JSON Text
                </button>
              </div>

              {activeTab === 'csv' ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-amber-300 bg-amber-50/30 p-8 text-center hover:bg-amber-50/70 transition cursor-pointer"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,.json,text/csv,application/json"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-600 mb-3">
                    <Upload className="h-6 w-6" />
                  </div>
                  <p className="font-bold text-sm text-slate-700">
                    Click to select CSV or JSON file
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    Supports .csv with headers: username, password, parent_name, child_name, contact_phone
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-600">
                    Paste raw CSV or JSON data:
                  </label>
                  <textarea
                    rows={6}
                    value={pasteText}
                    onChange={(e) => setPasteText(e.target.value)}
                    placeholder="username,password,parent_name,child_name,contact_phone&#10;john_doe,beePass123,John Doe,Alex Doe,+60123456789"
                    className="w-full rounded-2xl border-2 border-amber-100 bg-amber-50/30 p-3 font-mono text-xs text-slate-800 outline-none focus:border-amber-300"
                  />
                  <button
                    type="button"
                    onClick={handleParsePaste}
                    disabled={!pasteText.trim()}
                    className="flex items-center gap-2 rounded-full bg-amber-500 px-5 py-2.5 text-xs font-black text-white hover:bg-amber-600 disabled:opacity-50 cursor-pointer shadow-xs"
                  >
                    <Sparkles className="h-4 w-4" /> Parse & Preview Rows
                  </button>
                </div>
              )}
            </div>
          )}

          {step === 'preview' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-slate-800">
                    Previewing {parsedRows.length} Parent Records
                  </h3>
                  <p className="text-xs text-slate-500">
                    Verify the accounts before importing them into the database.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setStep('input')}
                  className="text-xs font-bold text-amber-700 hover:underline cursor-pointer"
                >
                  ← Choose another file
                </button>
              </div>

              <div className="max-h-60 overflow-y-auto rounded-2xl border border-slate-200 bg-slate-50/50">
                <table className="w-full text-left text-xs">
                  <thead className="sticky top-0 bg-slate-100 font-black text-slate-600 border-b border-slate-200">
                    <tr>
                      <th className="p-2.5">Child</th>
                      <th className="p-2.5">Parent</th>
                      <th className="p-2.5">Username</th>
                      <th className="p-2.5">Password</th>
                      <th className="p-2.5">Phone</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {parsedRows.map((row, idx) => (
                      <tr key={idx} className="hover:bg-amber-50/40">
                        <td className="p-2.5 font-bold text-amber-900">{row.child_name}</td>
                        <td className="p-2.5 text-slate-700">{row.parent_name}</td>
                        <td className="p-2.5 font-mono text-violet-700">@{row.username}</td>
                        <td className="p-2.5 font-mono text-slate-500">{row.password || 'Auto'}</td>
                        <td className="p-2.5 text-slate-500">{row.contact_phone || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {importing ? (
                <div className="rounded-2xl bg-amber-50 p-4 text-center border border-amber-200">
                  <LoaderCircle className="mx-auto h-7 w-7 animate-spin text-amber-600 mb-2" />
                  <p className="font-bold text-xs text-amber-900">
                    Importing account {progress.current} of {progress.total}...
                  </p>
                  <div className="mt-2 h-2 w-full bg-amber-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-500 transition-all duration-300"
                      style={{
                        width: `${progress.total ? (progress.current / progress.total) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>
              ) : (
                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setStep('input')}
                    className="flex-1 rounded-full border-2 border-slate-200 bg-white py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={executeImport}
                    className="flex-1 flex items-center justify-center gap-2 rounded-full bg-emerald-500 py-2.5 text-xs font-black text-white shadow-md hover:bg-emerald-600 cursor-pointer"
                  >
                    <Plus className="h-4 w-4" /> Import {parsedRows.length} Accounts Now
                  </button>
                </div>
              )}
            </div>
          )}

          {step === 'result' && (
            <div className="space-y-4 text-center py-4">
              <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500" />
              <h3 className="font-black text-lg text-slate-800">Import Process Completed</h3>
              <p className="text-xs text-slate-600 max-w-md mx-auto">
                Successfully imported <strong>{importLogs.success}</strong> parent accounts.
                {importLogs.failed > 0 && ` (${importLogs.failed} records had issues).`}
              </p>

              {importLogs.errors.length > 0 && (
                <div className="text-left rounded-2xl bg-rose-50 border border-rose-200 p-3 max-h-36 overflow-y-auto text-xs text-rose-700 font-mono">
                  <p className="font-bold mb-1 font-sans">Errors encountered:</p>
                  {importLogs.errors.map((err, i) => (
                    <p key={i}>• {err}</p>
                  ))}
                </div>
              )}

              <button
                type="button"
                onClick={onClose}
                className="rounded-full bg-[#FBBF24] px-8 py-3 text-sm font-black text-[#78350F] shadow-md hover:bg-amber-400 cursor-pointer transition"
              >
                Close & View Directory
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
