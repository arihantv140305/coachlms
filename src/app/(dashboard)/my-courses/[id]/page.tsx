import { getCourse } from "@/actions/courses";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, BookOpen, Calendar, Users, User } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default async function StudentCourseView({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const course = await getCourse(params.id);
  if (!course) notFound();

  // Check student is enrolled
  const enrollment = course.enrollments.find((e) => e.studentId === session.user.id && e.status === "ACTIVE");
  if (!enrollment && session.user.role === "STUDENT") notFound();

  const activeStudents = course.enrollments.filter((e) => e.status === "ACTIVE");

  return (
    <div className="space-y-6">
      <div>
        <Link href="/my-courses" className="text-sm text-[#8888a0] hover:text-white flex items-center gap-1 mb-4"><ArrowLeft className="w-4 h-4" /> My Courses</Link>
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-2xl font-bold">{course.title}</h1>
          <span className={course.status === "ACTIVE" ? "badge-green" : "badge-amber"}>{course.status}</span>
        </div>
        <p className="text-[#8888a0] flex items-center gap-4 flex-wrap">
          <span className="flex items-center gap-1"><User className="w-4 h-4" /> {course.createdBy.name}</span>
          <span className="flex items-center gap-1"><Users className="w-4 h-4" /> {activeStudents.length} students</span>
        </p>
      </div>

      {course.description && (
        <div className="glass-card p-6">
          <h2 className="font-semibold mb-2">About this Course</h2>
          <p className="text-[#8888a0] whitespace-pre-wrap">{course.description}</p>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        {(course.startDate || course.endDate) && (
          <div className="glass-card p-6">
            <h2 className="font-semibold mb-3 flex items-center gap-2"><Calendar className="w-4 h-4" /> Schedule</h2>
            <div className="space-y-2 text-sm">
              {course.startDate && <div><span className="text-[#8888a0]">Starts:</span> <span className="font-medium">{formatDate(course.startDate)}</span></div>}
              {course.endDate && <div><span className="text-[#8888a0]">Ends:</span> <span className="font-medium">{formatDate(course.endDate)}</span></div>}
            </div>
          </div>
        )}
        <div className="glass-card p-6">
          <h2 className="font-semibold mb-3 flex items-center gap-2"><Users className="w-4 h-4" /> Classmates ({activeStudents.length})</h2>
          <div className="space-y-2">
            {activeStudents.slice(0, 10).map((e) => (
              <div key={e.id} className="flex items-center gap-2 text-sm">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-[10px] font-bold text-white">
                  {e.student.name.charAt(0)}
                </div>
                <span>{e.student.name} {e.studentId === session.user.id && <span className="text-indigo-400">(You)</span>}</span>
              </div>
            ))}
            {activeStudents.length > 10 && <p className="text-xs text-[#8888a0]">and {activeStudents.length - 10} more...</p>}
          </div>
        </div>
      </div>

      {/* Phase 2 placeholder */}
      <div className="glass-card p-8 text-center border-dashed">
        <p className="text-[#555570] text-sm">📚 Assignments, materials, and announcements will appear here in Phase 2.</p>
      </div>
    </div>
  );
}
