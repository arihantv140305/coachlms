"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createAnnouncement } from "@/actions/announcements";
import toast from "react-hot-toast";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";

export default function NewAnnouncementPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const result = await createAnnouncement(params.id, formData);
    if (result.success) { toast.success(result.message); router.push(`/courses/${params.id}/announcements`); router.refresh(); }
    else toast.error(result.message);
    setLoading(false);
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <Link href={`/courses/${params.id}/announcements`} className="text-sm text-[#8888a0] hover:text-white flex items-center gap-1 mb-4"><ArrowLeft className="w-4 h-4" /> Back</Link>
        <h1 className="text-2xl font-bold">New Announcement</h1>
        <p className="text-[#8888a0] mt-1">All enrolled students will receive an email notification.</p>
      </div>
      <div className="glass-card p-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="title" className="label-text">Title *</label>
            <input id="title" name="title" required placeholder="e.g. Class cancelled tomorrow" className="input-field" />
          </div>
          <div>
            <label htmlFor="content" className="label-text">Content *</label>
            <textarea id="content" name="content" required rows={6} placeholder="Write your announcement..." className="input-field resize-none" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Posting...</> : "Post Announcement"}
            </button>
            <Link href={`/courses/${params.id}/announcements`} className="btn-secondary">Cancel</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
