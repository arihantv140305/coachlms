import { getCourse } from "@/actions/courses";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Users, Edit, Calendar, BookOpen } from "lucide-react";
import { formatDate } from "@/lib/utils";
import CourseActions from "./CourseActions";

export default async function CourseDetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const course = await getCourse(params.id);
  if (!course) notFound();

  const canManage = session?.user.role === "ADMIN" || course.createdById === session?.user.id;
  const activeEnrollments = course.enrollments.filter((e) => e.status === "ACTIVE");

  return (
    <div className="space-y-6">
      <div>
        <Link href="/courses" className="text-sm text-[#8888a0] hover:text-white flex items-center gap-1 mb-4"><ArrowLeft className="w-4 h-4" /> Back to Courses</Link>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold">{course.title}</h1>
              <span className={course.status === "ACTIVE" ? "badge-green" : course.status === "DRAFT" ? "badge-amber" : "badge-gray"}>{course.status}</span>
            </div>
            <p className="text-[#8888a0] flex items-center gap-4 flex-wrap">
              <span>By {course.createdBy.name}</span>
              <span>Max: {course.maxStudents} students</span>
            </p>
          </div>
          {canManage && <Link href={`/courses/${course.id}/edit`} className="btn-secondary flex items-center gap-2"><Edit className="w-4 h-4" /> Edit</Link>}
        </div>
      </div>

      {/* Join Code Card */}
      {canManage && (
        <div className="glass-card p-6">
          <h2 className="font-semibold mb-3">Join Code</h2>
          <p className="text-sm text-[#8888a0] mb-3">Share this code with students so they can enroll in this course.</p>
          <CourseActions courseId={course.id} joinCode={course.joinCode} canManage={canManage} />
        </div>
      )}

      {course.description && (
        <div className="glass-card p-6">
          <h2 className="font-semibold mb-2">Description</h2>
          <p className="text-[#8888a0] whitespace-pre-wrap">{course.description}</p>
        </div>
      )}

      {(course.startDate || course.endDate) && (
        <div className="glass-card p-6">
          <h2 className="font-semibold mb-3 flex items-center gap-2"><Calendar className="w-4 h-4" /> Schedule</h2>
          <div className="flex gap-6 text-sm">
            {course.startDate && <div><span className="text-[#8888a0]">Starts:</span> <span className="font-medium">{formatDate(course.startDate)}</span></div>}
            {course.endDate && <div><span className="text-[#8888a0]">Ends:</span> <span className="font-medium">{formatDate(course.endDate)}</span></div>}
          </div>
        </div>
      )}

      {/* Enrolled Students */}
      <div className="glass-card p-6">
        <h2 className="text-lg font-semibold flex items-center gap-2 mb-4"><Users className="w-5 h-5" /> Enrolled Students ({activeEnrollments.length})</h2>
        {activeEnrollments.length === 0 ? (
          <p className="text-[#8888a0] text-center py-6">No students enrolled yet. Share the join code to get started.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="text-[#8888a0] border-b border-[#2a2a45]">
                <th className="text-left py-3 px-2 font-medium">Student</th>
                <th className="text-left py-3 px-2 font-medium">Email</th>
                <th className="text-left py-3 px-2 font-medium">Enrolled</th>
                {canManage && <th className="text-right py-3 px-2 font-medium">Actions</th>}
              </tr></thead>
              <tbody>
                {activeEnrollments.map((enrollment) => (
                  <tr key={enrollment.id} className="border-b border-[#2a2a45]/50 hover:bg-[#232340]/30">
                    <td className="py-3 px-2 font-medium">{enrollment.student.name}</td>
                    <td className="py-3 px-2 text-[#8888a0]">{enrollment.student.email}</td>
                    <td className="py-3 px-2 text-[#8888a0]">{formatDate(enrollment.enrolledAt)}</td>
                    {canManage && (
                      <td className="py-3 px-2 text-right">
                        <CourseActions enrollmentId={enrollment.id} studentName={enrollment.student.name} courseId={course.id} joinCode={course.joinCode} canManage={canManage} isRemoveAction />
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
