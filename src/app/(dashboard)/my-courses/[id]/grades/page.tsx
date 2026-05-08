import { getStudentGrades } from "@/actions/submissions";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Award } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default async function StudentGradesPage({ params }: { params: { id: string } }) {
  const course = await prisma.course.findUnique({ where: { id: params.id }, select: { title: true } });
  if (!course) notFound();

  const assignments = await getStudentGrades(params.id);

  let totalMarks = 0;
  let totalMax = 0;
  assignments.forEach((a) => {
    const sub = a.submissions[0];
    if (sub?.grade) { totalMarks += sub.grade.marks; totalMax += a.totalMarks; }
  });

  return (
    <div className="space-y-6">
      <div>
        <Link href={`/my-courses/${params.id}`} className="text-sm text-[#8888a0] hover:text-white flex items-center gap-1 mb-4"><ArrowLeft className="w-4 h-4" /> {course.title}</Link>
        <h1 className="text-2xl font-bold flex items-center gap-2"><Award className="w-6 h-6" /> My Grades</h1>
      </div>

      {totalMax > 0 && (
        <div className="glass-card p-6 text-center">
          <p className="text-4xl font-bold gradient-text">{Math.round((totalMarks / totalMax) * 100)}%</p>
          <p className="text-[#8888a0] mt-1">{totalMarks}/{totalMax} marks overall</p>
        </div>
      )}

      {assignments.length === 0 ? (
        <div className="glass-card p-16 text-center"><Award className="w-16 h-16 text-[#555570] mx-auto mb-4" /><p className="text-[#8888a0]">No graded assignments yet.</p></div>
      ) : (
        <div className="space-y-3">
          {assignments.map((a, i) => {
            const sub = a.submissions[0];
            const grade = sub?.grade;
            return (
              <div key={a.id} className="glass-card p-5 flex items-center justify-between animate-fade-in-up" style={{ animationDelay: `${i * 0.05}s` }}>
                <div>
                  <h3 className="font-semibold">{a.title}</h3>
                  <p className="text-sm text-[#8888a0]">Due: {formatDate(a.dueDate)}</p>
                  {grade?.feedback && <p className="text-xs text-[#8888a0] mt-1">💬 {grade.feedback}</p>}
                </div>
                <div className="text-right">
                  {grade ? (
                    <p className={`text-xl font-bold ${grade.marks >= a.totalMarks * 0.7 ? "text-emerald-400" : grade.marks >= a.totalMarks * 0.4 ? "text-amber-400" : "text-rose-400"}`}>
                      {grade.marks}/{a.totalMarks}
                    </p>
                  ) : sub ? (
                    <span className="badge-amber">Pending</span>
                  ) : (
                    <span className="badge-gray">Not submitted</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
