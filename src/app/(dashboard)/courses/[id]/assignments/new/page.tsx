"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createAssignment } from "@/actions/assignments";
import toast from "react-hot-toast";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";

export default function NewAssignmentPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const result = await createAssignment(params.id, formData);
    if (result.success) { toast.success(result.message); router.push(`/courses/${params.id}/assignments`); router.refresh(); }
    else toast.error(result.message);
    setLoading(false);
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <Link href={`/courses/${params.id}/assignments`} className="text-sm text-[#8888a0] hover:text-white flex items-center gap-1 mb-4"><ArrowLeft className="w-4 h-4" /> Back</Link>
        <h1 className="text-2xl font-bold">Create Assignment</h1>
      </div>
      <div className="glass-card p-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="title" className="label-text">Title *</label>
            <input id="title" name="title" required placeholder="e.g. Chapter 5 Problems" className="input-field" />
          </div>
          <div>
            <label htmlFor="description" className="label-text">Description / Instructions</label>
            <textarea id="description" name="description" rows={4} placeholder="What students need to do..." className="input-field resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="dueDate" className="label-text">Due Date *</label>
              <input id="dueDate" name="dueDate" type="datetime-local" required className="input-field" />
            </div>
            <div>
              <label htmlFor="totalMarks" className="label-text">Total Marks</label>
              <input id="totalMarks" name="totalMarks" type="number" min="1" max="1000" defaultValue="100" className="input-field" />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating...</> : "Create Assignment"}
            </button>
            <Link href={`/courses/${params.id}/assignments`} className="btn-secondary">Cancel</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
