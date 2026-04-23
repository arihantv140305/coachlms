"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { regenerateJoinCode } from "@/actions/courses";
import { removeStudent } from "@/actions/enrollments";
import toast from "react-hot-toast";
import { Copy, RefreshCw, UserMinus, Loader2 } from "lucide-react";

type Props = {
  courseId: string;
  joinCode: string;
  canManage: boolean;
  enrollmentId?: string;
  studentName?: string;
  isRemoveAction?: boolean;
};

export default function CourseActions({ courseId, joinCode, canManage, enrollmentId, studentName, isRemoveAction }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleCopyCode() {
    await navigator.clipboard.writeText(joinCode);
    toast.success("Join code copied!");
  }

  async function handleRegenerate() {
    if (!confirm("Regenerating the code will invalidate the old code. Continue?")) return;
    setLoading(true);
    const result = await regenerateJoinCode(courseId);
    if (result.success) { toast.success(result.message); router.refresh(); } else toast.error(result.message);
    setLoading(false);
  }

  async function handleRemove() {
    if (!enrollmentId) return;
    if (!confirm(`Remove "${studentName}" from this course?`)) return;
    setLoading(true);
    const result = await removeStudent(enrollmentId);
    if (result.success) { toast.success(result.message); router.refresh(); } else toast.error(result.message);
    setLoading(false);
  }

  if (isRemoveAction) {
    return (
      <button onClick={handleRemove} disabled={loading} className="p-1.5 rounded-lg hover:bg-rose-500/10 text-rose-400 transition-colors" title="Remove student">
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserMinus className="w-4 h-4" />}
      </button>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2 bg-[#12121a] rounded-xl px-4 py-3 border border-[#2a2a45]">
        <span className="text-2xl font-mono font-bold tracking-widest text-indigo-400">{joinCode}</span>
      </div>
      <button onClick={handleCopyCode} className="btn-secondary flex items-center gap-2 px-4 py-3"><Copy className="w-4 h-4" /> Copy</button>
      {canManage && (
        <button onClick={handleRegenerate} disabled={loading} className="btn-ghost flex items-center gap-2 px-4 py-3 text-amber-400 hover:text-amber-300">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />} Regenerate
        </button>
      )}
    </div>
  );
}
