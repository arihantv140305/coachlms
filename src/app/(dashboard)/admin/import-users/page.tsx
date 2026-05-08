"use client";

import { useState } from "react";
import { bulkImportUsers } from "@/actions/password";
import toast from "react-hot-toast";
import { Upload, Loader2, Download } from "lucide-react";

export default function ImportUsersPage() {
  const [csv, setCsv] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  async function handleImport() {
    if (!csv.trim()) { toast.error("Paste CSV data first"); return; }
    setLoading(true);
    const res = await bulkImportUsers(csv);
    if (res.success) { toast.success(res.message); setResult(res.data); }
    else toast.error(res.message);
    setLoading(false);
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => { setCsv(event.target?.result as string); };
    reader.readAsText(file);
  }

  const sampleCsv = "name,email,role,password\nJohn Doe,john@example.com,STUDENT,Welcome@123\nJane Smith,jane@example.com,INSTRUCTOR,Welcome@123";

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2"><Upload className="w-6 h-6" /> Bulk Import Users</h1>
        <p className="text-[#8888a0] mt-1">Import multiple users from a CSV file</p>
      </div>

      <div className="glass-card p-6">
        <h2 className="font-semibold mb-3">📋 CSV Format</h2>
        <p className="text-sm text-[#8888a0] mb-3">Your CSV must have <strong>name</strong> and <strong>email</strong> columns. Optional: <strong>role</strong> (STUDENT, INSTRUCTOR, ADMIN) and <strong>password</strong>.</p>
        <div className="bg-[#12121a] rounded-lg p-4 font-mono text-sm mb-3 overflow-x-auto">
          <pre>{sampleCsv}</pre>
        </div>
        <div className="text-sm text-[#8888a0] space-y-1">
          <p>• If <strong>role</strong> is omitted, defaults to <strong>STUDENT</strong></p>
          <p>• If <strong>password</strong> is omitted, defaults to <strong>Welcome@123</strong></p>
          <p>• Existing emails are skipped (not duplicated)</p>
          <p>• Users should change their password after first login</p>
        </div>
      </div>

      <div className="glass-card p-6">
        <h2 className="font-semibold mb-3">Upload CSV</h2>
        <div className="flex gap-4 mb-4">
          <label className="btn-secondary flex items-center gap-2 cursor-pointer">
            <Download className="w-4 h-4" /> Choose File
            <input type="file" accept=".csv,.txt" onChange={handleFileUpload} className="hidden" />
          </label>
          <button onClick={() => setCsv(sampleCsv)} className="btn-ghost text-sm">Load Sample</button>
        </div>
        <textarea value={csv} onChange={(e) => setCsv(e.target.value)} rows={10} placeholder="Paste CSV data here or upload a file..." className="input-field font-mono text-sm resize-none" />
        <div className="mt-4 flex items-center gap-4">
          <button onClick={handleImport} disabled={loading || !csv.trim()} className="btn-primary flex items-center gap-2">
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Importing...</> : <><Upload className="w-4 h-4" /> Import Users</>}
          </button>
        </div>
      </div>

      {result && (
        <div className="glass-card p-6">
          <h2 className="font-semibold mb-3">📊 Import Results</h2>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center p-3 bg-emerald-500/10 rounded-xl"><p className="text-2xl font-bold text-emerald-400">{result.created}</p><p className="text-xs text-[#8888a0]">Created</p></div>
            <div className="text-center p-3 bg-amber-500/10 rounded-xl"><p className="text-2xl font-bold text-amber-400">{result.skipped}</p><p className="text-xs text-[#8888a0]">Skipped</p></div>
            <div className="text-center p-3 bg-rose-500/10 rounded-xl"><p className="text-2xl font-bold text-rose-400">{result.errors?.length || 0}</p><p className="text-xs text-[#8888a0]">Errors</p></div>
          </div>
          {result.errors?.length > 0 && (
            <div className="bg-[#12121a] rounded-lg p-3 text-sm">
              {result.errors.map((e: string, i: number) => <p key={i} className="text-rose-400">{e}</p>)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
