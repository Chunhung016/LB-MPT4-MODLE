import { Printer, X, Download } from 'lucide-react';
import { exportToCSV } from '../utils/csvHelper';

export interface RosterItem {
  userId: string;
  childName: string;
  parentName: string;
  username: string;
  contactPhone: string;
  activationCode: string;
  beeTokens: number;
  spellingBee: boolean;
  aiFeatures: boolean;
  status: string;
}

interface PrintableRosterModalProps {
  isOpen: boolean;
  onClose: () => void;
  roster: RosterItem[];
}

export default function PrintableRosterModal({
  isOpen,
  onClose,
  roster,
}: PrintableRosterModalProps) {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadCSV = () => {
    const rows = roster.map((item) => ({
      'Child Name': item.childName,
      'Parent Name': item.parentName,
      Username: item.username,
      'Contact Phone': item.contactPhone,
      'Device Code': item.activationCode,
      'Bee Tokens': item.beeTokens,
      'Spelling Bee': item.spellingBee ? 'Active' : 'Inactive',
      'AI Features': item.aiFeatures ? 'Active' : 'Inactive',
    }));
    exportToCSV(`little_bee_parent_directory_${new Date().toISOString().slice(0, 10)}.csv`, rows);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-xs">
      <div className="w-full max-w-4xl max-h-[90vh] flex flex-col rounded-3xl border border-slate-300 bg-white shadow-2xl overflow-hidden text-slate-800">
        {/* Modal Controls (Hidden in Print) */}
        <div className="print:hidden flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-4">
          <div>
            <h2 className="font-['Fredoka',sans-serif] text-xl font-black text-slate-800">
              Reception Lookup Sheet & Print Roster
            </h2>
            <p className="text-xs text-slate-500">
              Instant offline reference for front desk staff to assist parents with forgotten usernames
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadCSV}
              className="flex items-center gap-1.5 rounded-full border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer shadow-xs transition"
            >
              <Download className="h-3.5 w-3.5" /> Export CSV
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 rounded-full bg-amber-500 px-4 py-2 text-xs font-black text-white hover:bg-amber-600 cursor-pointer shadow-xs transition"
            >
              <Printer className="h-3.5 w-3.5" /> Print Sheet
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-2 text-slate-400 hover:bg-slate-200 cursor-pointer transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Printable Area */}
        <div className="flex-1 overflow-y-auto p-8 print:p-0 print:overflow-visible font-sans bg-white">
          <div className="border-b-2 border-slate-800 pb-4 mb-6 flex justify-between items-end">
            <div>
              <p className="text-xs font-bold tracking-widest text-amber-600 uppercase">
                Little Bee Learning Centre
              </p>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight font-['Fredoka',sans-serif]">
                Parent & Student Credential Directory
              </h1>
              <p className="text-xs text-slate-500">
                Official reception front-desk lookup log · Generated on {new Date().toLocaleDateString()}
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold bg-amber-100 text-amber-900 px-3 py-1 rounded-full">
                Total Families: {roster.length}
              </span>
            </div>
          </div>

          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-700 bg-slate-100 text-slate-900 uppercase font-black tracking-wider text-[10px]">
                <th className="p-2">#</th>
                <th className="p-2">Child Name</th>
                <th className="p-2">Parent Name</th>
                <th className="p-2">Username</th>
                <th className="p-2">Contact Phone</th>
                <th className="p-2">Device Code</th>
                <th className="p-2">Tokens</th>
                <th className="p-2">Program</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {roster.map((item, idx) => (
                <tr key={idx} className="hover:bg-amber-50/50 print:hover:bg-transparent">
                  <td className="p-2 text-slate-400 font-mono">{idx + 1}</td>
                  <td className="p-2 font-black text-slate-900 text-sm">{item.childName}</td>
                  <td className="p-2 font-bold text-slate-700">{item.parentName}</td>
                  <td className="p-2 font-mono font-bold text-violet-700">@{item.username}</td>
                  <td className="p-2 font-mono text-slate-600">{item.contactPhone || '—'}</td>
                  <td className="p-2 font-mono text-slate-600">{item.activationCode || '—'}</td>
                  <td className="p-2 font-bold text-amber-800">{item.beeTokens}</td>
                  <td className="p-2">
                    <span className="inline-flex gap-1">
                      {item.spellingBee && (
                        <span className="bg-emerald-100 text-emerald-800 text-[9px] font-bold px-1.5 py-0.5 rounded">
                          Spelling
                        </span>
                      )}
                      {item.aiFeatures && (
                        <span className="bg-violet-100 text-violet-800 text-[9px] font-bold px-1.5 py-0.5 rounded">
                          AI
                        </span>
                      )}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-8 pt-4 border-t border-slate-300 text-center text-[10px] text-slate-400">
            Confidential · For Little Bee Staff Reception use only · Do not distribute externally.
          </div>
        </div>
      </div>
    </div>
  );
}
