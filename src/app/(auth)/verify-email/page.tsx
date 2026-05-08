"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { verifyEmail } from "@/actions/password";
import Link from "next/link";
import { Loader2, CheckCircle, XCircle } from "lucide-react";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");
  const calledRef = useRef(false);

  useEffect(() => {
    if (!token) { setStatus("error"); setMessage("Invalid verification link."); return; }
    // Guard against React Strict Mode double-fire
    if (calledRef.current) return;
    calledRef.current = true;

    verifyEmail(token).then((result) => {
      setStatus(result.success ? "success" : "error");
      setMessage(result.message);
    });
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#0a0a0f]">
      <div className="glass-card p-8 text-center max-w-md w-full">
        {status === "loading" && <Loader2 className="w-8 h-8 animate-spin text-indigo-400 mx-auto" />}
        {status === "success" && (
          <>
            <CheckCircle className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
            <h1 className="text-xl font-bold mb-2">Email Verified!</h1>
            <p className="text-[#8888a0] mb-4">{message}</p>
            <Link href="/dashboard" className="btn-primary inline-flex">Go to Dashboard</Link>
          </>
        )}
        {status === "error" && (
          <>
            <XCircle className="w-16 h-16 text-rose-400 mx-auto mb-4" />
            <h1 className="text-xl font-bold mb-2">Verification Failed</h1>
            <p className="text-[#8888a0] mb-4">{message}</p>
            <Link href="/login" className="btn-primary inline-flex">Go to Login</Link>
          </>
        )}
      </div>
    </div>
  );
}
