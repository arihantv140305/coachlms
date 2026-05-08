"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { gradeSubmission } from "@/actions/submissions";
import toast from "react-hot-toast";
import { Loader2, CheckCircle } from "lucide-react";

type Props = {
  submissionId: string;
  totalMarks: number;
  existingGrade: { marks: number; feedback: string | null } | null;
};

export default function GradeForm({ submissionId, totalMarks, existingGrade }: Props) {
  const router = useRouter();
  const [marks, setMarks] = useState(existingGrade?.marks?.toString() || "");
  const [feedback, setFeedback] = useState(existingGrade?.feedback || "");
  const [loading, setLoading] = useState(false);

  async function handleGrade() {
    const m = parseInt(marks);
    if (isNaN(m) || m < 0 || m > totalMarks) { toast.error(`Marks must be 0-${totalMarks}`); return; }
    setLoading(true);
    const result = await gradeSubmission(submissionId, m, feedback);
    if (result.success) { toast.success(result.message); router.refresh(); } else toast.error(result.message);
    setLoading(false);
  }

  return (
    <div className="flex items-end gap-3">
      <div className="flex-1">
        <label className="text-xs text-[#8888a0] block mb-1">Marks (/{totalMarks})</label>
        <input type="number" min="0" max={totalMarks} value={marks} onChange={(e) => setMarks(e.target.value)} className="input-field py-2 text-sm" placeholder="0" />
      </div>
      <div className="flex-[2]">
        <label className="text-xs text-[#8888a0] block mb-1">Feedback</label>
        <input type="text" value={feedback} onChange={(e) => setFeedback(e.target.value)} className="input-field py-2 text-sm" placeholder="Optional feedback..." />
      </div>
      <button onClick={handleGrade} disabled={loading} className="btn-primary py-2 px-4 flex items-center gap-1 text-sm">
        {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3" />}
        {existingGrade ? "Update" : "Grade"}
      </button>
    </div>
  );
}
