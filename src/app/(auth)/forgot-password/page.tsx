"use client";

import { useState } from "react";
import { requestPasswordReset } from "@/actions/password";
import toast from "react-hot-toast";
import Link from "next/link";
import { Loader2, Mail } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const result = await requestPasswordReset(email);
    if (result.success) { setSent(true); toast.success(result.message); }
    else toast.error(result.message);
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#0a0a0f]">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Forgot Password</h1>
          <p className="text-[#8888a0] mt-2">Enter your email to receive a reset link</p>
        </div>

        {sent ? (
          <div className="glass-card p-8 text-center">
            <p className="text-emerald-400 mb-4">✅ Check your email for the reset link.</p>
            <p className="text-sm text-[#8888a0]">Didn&apos;t receive it? Check spam folder or try again.</p>
            <button onClick={() => setSent(false)} className="text-indigo-400 text-sm mt-3 hover:underline">Try again</button>
          </div>
        ) : (
          <div className="glass-card p-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="label-text">Email</label>
                <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" className="input-field" />
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
                {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</> : "Send Reset Link"}
              </button>
            </form>
          </div>
        )}

        <p className="text-center text-sm text-[#8888a0]">
          Remember your password? <Link href="/login" className="text-indigo-400 hover:underline">Log in</Link>
        </p>
      </div>
    </div>
  );
}
