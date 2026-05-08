"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { submitAssignment } from "@/actions/submissions";
import toast from "react-hot-toast";
import { Loader2, Send } from "lucide-react";

type Props = { assignmentId: string; courseId: string; existingContent?: string; isGraded: boolean };

export default function SubmitForm({ assignmentId, courseId, existingContent, isGraded }: Props) {
  const router = useRouter();
  const [content, setContent] = useState(existingContent || "");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) { toast.error("Cannot submit empty response"); return; }
    setLoading(true);
    const result = await submitAssignment(assignmentId, content);
    if (result.success) { toast.success(result.message); router.refresh(); } else toast.error(result.message);
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={5}
        placeholder="Paste your Google Drive link or type your response here..."
        className="input-field resize-none"
        disabled={isGraded}
      />
      {!isGraded && (
        <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2">
          {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</> : <><Send className="w-4 h-4" /> {existingContent ? "Update Submission" : "Submit"}</>}
        </button>
      )}
      {isGraded && <p className="text-sm text-[#8888a0]">This assignment has been graded. You cannot modify your submission.</p>}
    </form>
  );
}
