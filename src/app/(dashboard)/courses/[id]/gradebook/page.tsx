import { getGradebook } from "@/actions/submissions";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, BookOpen } from "lucide-react";

export default async function GradebookPage({ params }: { params: { id: string } }) {
  const course = await prisma.course.findUnique({ where: { id: params.id }, select: { id: true, title: true } });
  if (!course) notFound();

  const { assignments, enrollments } = await getGradebook(params.id);

  return (
    <div className="space-y-6">
      <div>
        <Link href={`/courses/${params.id}`} className="text-sm text-[#8888a0] hover:text-white flex items-center gap-1 mb-4"><ArrowLeft className="w-4 h-4" /> {course.title}</Link>
        <h1 className="text-2xl font-bold flex items-center gap-2"><BookOpen className="w-6 h-6" /> Gradebook</h1>
      </div>

      {assignments.length === 0 ? (
        <div className="glass-card p-16 text-center"><p className="text-[#8888a0]">No assignments yet. Create assignments to see the gradebook.</p></div>
      ) : (
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="text-[#8888a0] border-b border-[#2a2a45] bg-[#12121a]">
                <th className="text-left py-3 px-4 font-medium sticky left-0 bg-[#12121a] z-10">Student</th>
                {assignments.map((a) => (
                  <th key={a.id} className="text-center py-3 px-4 font-medium min-w-[100px]">
                    <Link href={`/courses/${params.id}/assignments/${a.id}`} className="hover:text-indigo-400">{a.title}</Link>
                    <p className="text-xs font-normal">/{a.totalMarks}</p>
                  </th>
                ))}
                <th className="text-center py-3 px-4 font-medium">Total</th>
              </tr></thead>
              <tbody>
                {enrollments.map((e) => {
                  let totalMarks = 0;
                  let totalMax = 0;
                  return (
                    <tr key={e.student.id} className="border-b border-[#2a2a45]/50 hover:bg-[#232340]/30">
                      <td className="py-3 px-4 font-medium sticky left-0 bg-[#0a0a0f] z-10">{e.student.name}</td>
                      {assignments.map((a) => {
                        const sub = a.submissions.find((s) => s.student.id === e.student.id);
                        const grade = sub?.grade;
                        if (grade) { totalMarks += grade.marks; totalMax += a.totalMarks; }
                        return (
                          <td key={a.id} className="py-3 px-4 text-center">
                            {grade ? (
                              <span className={`font-medium ${grade.marks >= a.totalMarks * 0.7 ? "text-emerald-400" : grade.marks >= a.totalMarks * 0.4 ? "text-amber-400" : "text-rose-400"}`}>
                                {grade.marks}
                              </span>
                            ) : sub ? (
                              <span className="text-[#555570]">—</span>
                            ) : (
                              <span className="text-[#333350]">✗</span>
                            )}
                          </td>
                        );
                      })}
                      <td className="py-3 px-4 text-center font-bold">
                        {totalMax > 0 ? (
                          <span className={`${(totalMarks / totalMax) >= 0.7 ? "text-emerald-400" : (totalMarks / totalMax) >= 0.4 ? "text-amber-400" : "text-rose-400"}`}>
                            {totalMarks}/{totalMax} ({Math.round((totalMarks / totalMax) * 100)}%)
                          </span>
                        ) : <span className="text-[#555570]">—</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
