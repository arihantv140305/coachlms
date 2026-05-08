import { getAssignments } from "@/actions/assignments";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ClipboardList, Clock } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default async function StudentAssignmentsPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) notFound();

  const course = await prisma.course.findUnique({ where: { id: params.id }, select: { title: true } });
  if (!course) notFound();

  const enrollment = await prisma.enrollment.findUnique({
    where: { studentId_courseId: { studentId: session.user.id, courseId: params.id } },
  });
  if (!enrollment || enrollment.status !== "ACTIVE") notFound();

  const assignments = await getAssignments(params.id);

  // Get student's submissions
  const submissions = await prisma.submission.findMany({
    where: { studentId: session.user.id, assignmentId: { in: assignments.map((a) => a.id) } },
    include: { grade: true },
  });
  const subMap = new Map(submissions.map((s) => [s.assignmentId, s]));

  return (
    <div className="space-y-6">
      <div>
        <Link href={`/my-courses/${params.id}`} className="text-sm text-[#8888a0] hover:text-white flex items-center gap-1 mb-4"><ArrowLeft className="w-4 h-4" /> {course.title}</Link>
        <h1 className="text-2xl font-bold flex items-center gap-2"><ClipboardList className="w-6 h-6" /> Assignments</h1>
      </div>

      {assignments.length === 0 ? (
        <div className="glass-card p-16 text-center">
          <ClipboardList className="w-16 h-16 text-[#555570] mx-auto mb-4" />
          <p className="text-[#8888a0]">No assignments yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {assignments.map((a, i) => {
            const sub = subMap.get(a.id);
            const isPast = new Date(a.dueDate) < new Date();
            let statusBadge = isPast ? "badge-rose" : "badge-green";
            let statusText = isPast ? "Past Due" : "Open";
            if (sub?.grade) { statusBadge = "badge-blue"; statusText = `${sub.grade.marks}/${a.totalMarks}`; }
            else if (sub) { statusBadge = "badge-amber"; statusText = "Submitted"; }

            return (
              <Link key={a.id} href={`/my-courses/${params.id}/assignments/${a.id}`} className="glass-card p-5 flex items-center justify-between hover:border-indigo-500/30 transition-all animate-fade-in-up" style={{ animationDelay: `${i * 0.05}s` }}>
                <div>
                  <h3 className="font-semibold">{a.title}</h3>
                  <p className="text-sm text-[#8888a0] flex items-center gap-3 mt-1">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Due: {formatDate(a.dueDate)}</span>
                    <span>{a.totalMarks} marks</span>
                  </p>
                </div>
                <span className={statusBadge}>{statusText}</span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
