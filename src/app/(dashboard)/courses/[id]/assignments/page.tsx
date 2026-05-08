import { getAssignments } from "@/actions/assignments";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, ClipboardList, Clock, Users } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default async function AssignmentsPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const course = await prisma.course.findUnique({ where: { id: params.id }, select: { id: true, title: true, createdById: true } });
  if (!course) notFound();

  const canManage = session?.user.role === "ADMIN" || course.createdById === session?.user.id;
  const assignments = await getAssignments(params.id);

  return (
    <div className="space-y-6">
      <div>
        <Link href={`/courses/${params.id}`} className="text-sm text-[#8888a0] hover:text-white flex items-center gap-1 mb-4"><ArrowLeft className="w-4 h-4" /> {course.title}</Link>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold flex items-center gap-2"><ClipboardList className="w-6 h-6" /> Assignments</h1>
          {canManage && <Link href={`/courses/${params.id}/assignments/new`} className="btn-primary flex items-center gap-2"><Plus className="w-4 h-4" /> New Assignment</Link>}
        </div>
      </div>

      {assignments.length === 0 ? (
        <div className="glass-card p-16 text-center">
          <ClipboardList className="w-16 h-16 text-[#555570] mx-auto mb-4" />
          <p className="text-[#8888a0]">No assignments yet.</p>
          {canManage && <Link href={`/courses/${params.id}/assignments/new`} className="btn-primary inline-flex items-center gap-2 mt-4"><Plus className="w-4 h-4" /> Create Assignment</Link>}
        </div>
      ) : (
        <div className="space-y-3">
          {assignments.map((a, i) => {
            const isPast = new Date(a.dueDate) < new Date();
            return (
              <Link key={a.id} href={`/courses/${params.id}/assignments/${a.id}`} className="glass-card p-5 flex items-center justify-between hover:border-indigo-500/30 transition-all animate-fade-in-up" style={{ animationDelay: `${i * 0.05}s` }}>
                <div>
                  <h3 className="font-semibold">{a.title}</h3>
                  <p className="text-sm text-[#8888a0] flex items-center gap-3 mt-1">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Due: {formatDate(a.dueDate)}</span>
                    <span>{a.totalMarks} marks</span>
                    <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {a._count.submissions} submitted</span>
                  </p>
                </div>
                <span className={isPast ? "badge-rose" : "badge-green"}>{isPast ? "Past Due" : "Open"}</span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
