import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Clock } from "lucide-react";
import { formatDate } from "@/lib/utils";
import SubmitForm from "./SubmitForm";

export default async function StudentAssignmentDetailPage({ params }: { params: { id: string; aid: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) notFound();

  const assignment = await prisma.assignment.findUnique({
    where: { id: params.aid },
    include: { course: { select: { title: true } } },
  });
  if (!assignment) notFound();

  const submission = await prisma.submission.findUnique({
    where: { assignmentId_studentId: { assignmentId: params.aid, studentId: session.user.id } },
    include: { grade: true },
  });

  const isPast = new Date(assignment.dueDate) < new Date();

  return (
    <div className="space-y-6">
      <div>
        <Link href={`/my-courses/${params.id}/assignments`} className="text-sm text-[#8888a0] hover:text-white flex items-center gap-1 mb-4"><ArrowLeft className="w-4 h-4" /> Assignments</Link>
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-2xl font-bold">{assignment.title}</h1>
          <span className={isPast ? "badge-rose" : "badge-green"}>{isPast ? "Past Due" : "Open"}</span>
        </div>
        <p className="text-[#8888a0] flex items-center gap-4">
          <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> Due: {formatDate(assignment.dueDate)}</span>
          <span>{assignment.totalMarks} marks</span>
        </p>
      </div>

      {assignment.description && (
        <div className="glass-card p-6">
          <h2 className="font-semibold mb-2">Instructions</h2>
          <p className="text-[#8888a0] whitespace-pre-wrap">{assignment.description}</p>
        </div>
      )}

      {/* Grade display */}
      {submission?.grade && (
        <div className="glass-card p-6 border-emerald-500/30">
          <h2 className="font-semibold mb-3 text-emerald-400">📊 Your Grade</h2>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-emerald-400">{submission.grade.marks}</p>
              <p className="text-sm text-[#8888a0]">out of {assignment.totalMarks}</p>
            </div>
            {submission.grade.feedback && (
              <div className="flex-1 bg-[#12121a] rounded-lg p-3">
                <p className="text-xs text-[#8888a0] mb-1">Feedback</p>
                <p className="text-sm">{submission.grade.feedback}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Submit / view submission */}
      <div className="glass-card p-6">
        <h2 className="font-semibold mb-3">Your Submission</h2>
        <p className="text-sm text-[#8888a0] mb-4">Submit a text response or paste a link to your solution (e.g. Google Drive, GitHub).</p>
        <SubmitForm assignmentId={params.aid} existingContent={submission?.content} isGraded={!!submission?.grade} />
      </div>
    </div>
  );
}
