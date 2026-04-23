"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { updateCourse } from "@/actions/courses";
import toast from "react-hot-toast";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { formatDateForInput } from "@/lib/utils";

export default function EditCoursePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [course, setCourse] = useState<any>(null);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    fetch(`/api/courses/${params.id}`).then(r => r.json()).then(data => { setCourse(data); setFetching(false); }).catch(() => setFetching(false));
  }, [params.id]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const result = await updateCourse(params.id, formData);
    if (result.success) { toast.success(result.message); router.push(`/courses/${params.id}`); router.refresh(); }
    else toast.error(result.message);
    setLoading(false);
  }

  if (fetching) return <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-indigo-400" /></div>;
  if (!course) return <div className="text-center py-20 text-[#8888a0]">Course not found.</div>;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <Link href={`/courses/${params.id}`} className="text-sm text-[#8888a0] hover:text-white flex items-center gap-1 mb-4"><ArrowLeft className="w-4 h-4" /> Back</Link>
        <h1 className="text-2xl font-bold">Edit Course</h1>
      </div>
      <div className="glass-card p-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="title" className="label-text">Course Title *</label>
            <input id="title" name="title" required defaultValue={course.title} className="input-field" />
          </div>
          <div>
            <label htmlFor="description" className="label-text">Description</label>
            <textarea id="description" name="description" rows={4} defaultValue={course.description || ""} className="input-field resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="maxStudents" className="label-text">Max Students</label>
              <input id="maxStudents" name="maxStudents" type="number" min="1" max="500" defaultValue={course.maxStudents} className="input-field" />
            </div>
            <div>
              <label htmlFor="status" className="label-text">Status</label>
              <select id="status" name="status" defaultValue={course.status} className="input-field">
                <option value="DRAFT">Draft</option>
                <option value="ACTIVE">Active</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="startDate" className="label-text">Start Date</label>
              <input id="startDate" name="startDate" type="datetime-local" defaultValue={formatDateForInput(course.startDate)} className="input-field" />
            </div>
            <div>
              <label htmlFor="endDate" className="label-text">End Date</label>
              <input id="endDate" name="endDate" type="datetime-local" defaultValue={formatDateForInput(course.endDate)} className="input-field" />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : "Save Changes"}
            </button>
            <Link href={`/courses/${params.id}`} className="btn-secondary">Cancel</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
