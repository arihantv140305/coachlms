import { getAssignment } from "@/actions/assignments";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Clock, Users } from "lucide-react";
import { formatDate } from "@/lib/utils";
import GradeForm from "./GradeForm";

export default async function AssignmentDetailPage({ params }: { params: { id: string; aid: string } }) {
  const session = await getServerSession(authOptions);
  const assignment = await getAssignment(params.aid);
  if (!assignment) notFound();

  const canManage = session?.user.role === "ADMIN" || assignment.course.createdById === session?.user.id;
  const isPast = new Date(assignment.dueDate) < new Date();

  return (
    <div className="space-y-6">
      <div>
        <Link href={`/courses/${params.id}/assignments`} className="text-sm text-[#8888a0] hover:text-white flex items-center gap-1 mb-4"><ArrowLeft className="w-4 h-4" /> Assignments</Link>
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-2xl font-bold">{assignment.title}</h1>
          <span className={isPast ? "badge-rose" : "badge-green"}>{isPast ? "Past Due" : "Open"}</span>
        </div>
        <p className="text-[#8888a0] flex items-center gap-4">
          <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> Due: {formatDate(assignment.dueDate)}</span>
          <span>{assignment.totalMarks} marks</span>
          <span className="flex items-center gap-1"><Users className="w-4 h-4" /> {assignment.submissions.length} submissions</span>
        </p>
      </div>

      {assignment.description && (
        <div className="glass-card p-6">
          <h2 className="font-semibold mb-2">Instructions</h2>
          <p className="text-[#8888a0] whitespace-pre-wrap">{assignment.description}</p>
        </div>
      )}

      {canManage && (
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold mb-4">Submissions ({assignment.submissions.length})</h2>
          {assignment.submissions.length === 0 ? (
            <p className="text-[#8888a0] text-center py-6">No submissions yet.</p>
          ) : (
            <div className="space-y-4">
              {assignment.submissions.map((sub) => (
                <div key={sub.id} className="bg-[#12121a] rounded-xl p-4 border border-[#2a2a45]">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-medium">{sub.student.name}</p>
                      <p className="text-xs text-[#8888a0]">{sub.student.email} • {formatDate(sub.submittedAt)}</p>
                    </div>
                    <span className={sub.status === "GRADED" ? "badge-green" : sub.status === "LATE" ? "badge-amber" : "badge-blue"}>{sub.status}</span>
                  </div>
                  <div className="bg-[#0a0a0f] rounded-lg p-3 mb-3 text-sm">
                    {sub.content.startsWith("http") ? (
                      <a href={sub.content} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-indigo-300 underline break-all">{sub.content}</a>
                    ) : (
                      <p className="text-[#8888a0] whitespace-pre-wrap">{sub.content}</p>
                    )}
                  </div>
                  <GradeForm submissionId={sub.id} totalMarks={assignment.totalMarks} existingGrade={sub.grade} />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
