"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createCourse } from "@/actions/courses";
import toast from "react-hot-toast";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";

export default function NewCoursePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    const formData = new FormData(e.currentTarget);
    const result = await createCourse(formData);
    if (result.success) {
      toast.success(result.message);
      router.push("/courses");
      router.refresh();
    } else {
      if (result.errors) setErrors(result.errors);
      toast.error(result.message);
    }
    setLoading(false);
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <Link href="/courses" className="text-sm text-[#8888a0] hover:text-white flex items-center gap-1 mb-4"><ArrowLeft className="w-4 h-4" /> Back to Courses</Link>
        <h1 className="text-2xl font-bold">Create New Course</h1>
        <p className="text-[#8888a0] mt-1">A join code will be auto-generated for students to enroll.</p>
      </div>

      <div className="glass-card p-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="title" className="label-text">Course Title *</label>
            <input id="title" name="title" required placeholder="e.g. Mathematics Grade 12" className="input-field" />
            {errors.title && <p className="text-rose-400 text-xs mt-1">{errors.title[0]}</p>}
          </div>
          <div>
            <label htmlFor="description" className="label-text">Description</label>
            <textarea id="description" name="description" rows={4} placeholder="Brief description of the course..." className="input-field resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="maxStudents" className="label-text">Max Students</label>
              <input id="maxStudents" name="maxStudents" type="number" min="1" max="500" defaultValue="50" className="input-field" />
            </div>
            <div>
              <label htmlFor="status" className="label-text">Status</label>
              <select id="status" name="status" className="input-field">
                <option value="DRAFT">Draft</option>
                <option value="ACTIVE">Active</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="startDate" className="label-text">Start Date</label>
              <input id="startDate" name="startDate" type="datetime-local" className="input-field" />
            </div>
            <div>
              <label htmlFor="endDate" className="label-text">End Date</label>
              <input id="endDate" name="endDate" type="datetime-local" className="input-field" />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating...</> : "Create Course"}
            </button>
            <Link href="/courses" className="btn-secondary">Cancel</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
