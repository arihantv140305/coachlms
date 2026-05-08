"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { resetPassword } from "@/actions/password";
import toast from "react-hot-toast";
import Link from "next/link";
import { Loader2, Lock } from "lucide-react";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirmPassword) { toast.error("Passwords do not match"); return; }
    if (password.length < 8) { toast.error("Password must be at least 8 characters"); return; }
    setLoading(true);
    const result = await resetPassword(token, password);
    if (result.success) { setDone(true); toast.success(result.message); }
    else toast.error(result.message);
    setLoading(false);
  }

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[#0a0a0f]">
        <div className="glass-card p-8 text-center max-w-md">
          <p className="text-rose-400 mb-4">Invalid reset link.</p>
          <Link href="/forgot-password" className="text-indigo-400 hover:underline">Request a new one</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#0a0a0f]">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Reset Password</h1>
        </div>

        {done ? (
          <div className="glass-card p-8 text-center">
            <p className="text-emerald-400 mb-4">✅ Password reset successfully!</p>
            <Link href="/login" className="btn-primary inline-flex">Log In</Link>
          </div>
        ) : (
          <div className="glass-card p-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="password" className="label-text">New Password</label>
                <input id="password" type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} className="input-field" />
              </div>
              <div>
                <label htmlFor="confirmPassword" className="label-text">Confirm Password</label>
                <input id="confirmPassword" type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="input-field" />
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
                {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Resetting...</> : "Reset Password"}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
