"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { joinCourse } from "@/actions/enrollments";
import toast from "react-hot-toast";
import { UserPlus, Loader2 } from "lucide-react";

export default function JoinCoursePage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (code.length !== 6) { toast.error("Join code must be exactly 6 characters"); return; }
    setLoading(true);
    const result = await joinCourse(code);
    if (result.success) {
      toast.success(result.message);
      router.push("/my-courses");
      router.refresh();
    } else {
      toast.error(result.message);
    }
    setLoading(false);
  }

  return (
    <div className="max-w-md mx-auto space-y-6 pt-8">
      <div className="text-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mx-auto mb-4">
          <UserPlus className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold">Join a Course</h1>
        <p className="text-[#8888a0] mt-2">Enter the 6-character join code shared by your instructor</p>
      </div>

      <div className="glass-card p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="joinCode" className="label-text text-center block">Join Code</label>
            <input
              id="joinCode"
              type="text"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))}
              placeholder="ABC123"
              className="input-field text-center text-3xl font-mono tracking-[0.5em] py-4"
              autoFocus
            />
          </div>
          <button type="submit" disabled={loading || code.length !== 6} className="btn-primary w-full flex items-center justify-center gap-2 py-3">
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Joining...</> : "Join Course"}
          </button>
        </form>
      </div>

      <p className="text-center text-sm text-[#555570]">
        Ask your instructor for the join code. It&apos;s a 6-character alphanumeric code.
      </p>
    </div>
  );
}
