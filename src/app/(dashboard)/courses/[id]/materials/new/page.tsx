"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createMaterial } from "@/actions/materials";
import toast from "react-hot-toast";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";

export default function NewMaterialPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const result = await createMaterial(params.id, formData);
    if (result.success) { toast.success(result.message); router.push(`/courses/${params.id}/materials`); router.refresh(); }
    else toast.error(result.message);
    setLoading(false);
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <Link href={`/courses/${params.id}/materials`} className="text-sm text-[#8888a0] hover:text-white flex items-center gap-1 mb-4"><ArrowLeft className="w-4 h-4" /> Back</Link>
        <h1 className="text-2xl font-bold">Add Study Material</h1>
        <p className="text-[#8888a0] mt-1">Add a link to external resources — Google Drive, YouTube, websites, etc.</p>
      </div>
      <div className="glass-card p-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="title" className="label-text">Title *</label>
            <input id="title" name="title" required placeholder="e.g. Chapter 5 Notes" className="input-field" />
          </div>
          <div>
            <label htmlFor="url" className="label-text">URL *</label>
            <input id="url" name="url" type="url" required placeholder="https://drive.google.com/..." className="input-field" />
          </div>
          <div>
            <label htmlFor="description" className="label-text">Description</label>
            <input id="description" name="description" placeholder="Brief description..." className="input-field" />
          </div>
          <div>
            <label htmlFor="type" className="label-text">Type</label>
            <select id="type" name="type" className="input-field">
              <option value="link">Link</option>
              <option value="document">Document</option>
              <option value="video">Video</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Adding...</> : "Add Material"}
            </button>
            <Link href={`/courses/${params.id}/materials`} className="btn-secondary">Cancel</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
