import { getAttendanceSummary } from "@/actions/attendance";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Users, CheckCircle, XCircle, Clock } from "lucide-react";

export default async function AttendanceSummaryPage({ params }: { params: { id: string } }) {
  const course = await prisma.course.findUnique({ where: { id: params.id }, select: { id: true, title: true } });
  if (!course) notFound();

  const { summary, totalSessions } = await getAttendanceSummary(params.id);

  return (
    <div className="space-y-6">
      <div>
        <Link href={`/courses/${params.id}/attendance`} className="text-sm text-[#8888a0] hover:text-white flex items-center gap-1 mb-4"><ArrowLeft className="w-4 h-4" /> Mark Attendance</Link>
        <h1 className="text-2xl font-bold flex items-center gap-2"><Users className="w-6 h-6" /> Attendance Summary</h1>
        <p className="text-[#8888a0] mt-1">{course.title} • {totalSessions} sessions recorded</p>
      </div>

      {summary.length === 0 ? (
        <div className="glass-card p-16 text-center"><p className="text-[#8888a0]">No attendance data yet.</p></div>
      ) : (
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="text-[#8888a0] border-b border-[#2a2a45] bg-[#12121a]">
                <th className="text-left py-3 px-4 font-medium">Student</th>
                <th className="text-center py-3 px-4 font-medium"><CheckCircle className="w-4 h-4 text-emerald-400 inline" /> Present</th>
                <th className="text-center py-3 px-4 font-medium"><Clock className="w-4 h-4 text-amber-400 inline" /> Late</th>
                <th className="text-center py-3 px-4 font-medium"><XCircle className="w-4 h-4 text-rose-400 inline" /> Absent</th>
                <th className="text-center py-3 px-4 font-medium">%</th>
              </tr></thead>
              <tbody>
                {summary.map((s) => (
                  <tr key={s.student.id} className="border-b border-[#2a2a45]/50 hover:bg-[#232340]/30">
                    <td className="py-3 px-4 font-medium">{s.student.name}</td>
                    <td className="py-3 px-4 text-center text-emerald-400">{s.present}</td>
                    <td className="py-3 px-4 text-center text-amber-400">{s.late}</td>
                    <td className="py-3 px-4 text-center text-rose-400">{s.absent}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`font-bold ${s.percentage >= 75 ? "text-emerald-400" : s.percentage >= 50 ? "text-amber-400" : "text-rose-400"}`}>{s.percentage}%</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
