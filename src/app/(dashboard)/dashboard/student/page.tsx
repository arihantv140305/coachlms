import { getStudentEnrollments } from "@/actions/enrollments";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import { FolderOpen, UserPlus, Users, BookOpen } from "lucide-react";

export default async function StudentDashboard() {
  const session = await getServerSession(authOptions);
  if (!session) return null;

  const enrollments = await getStudentEnrollments();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold">Student Dashboard</h1>
          <p className="text-[#8888a0] mt-1">Welcome, {session.user.name}</p>
        </div>
        <Link href="/join" className="btn-primary flex items-center gap-2"><UserPlus className="w-4 h-4" /> Join Course</Link>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="stat-card">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center mb-3">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <p className="text-3xl font-bold">{enrollments.length}</p>
          <p className="text-sm text-[#8888a0] mt-1">Enrolled Courses</p>
        </div>
        <div className="stat-card">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center mb-3">
            <FolderOpen className="w-5 h-5 text-white" />
          </div>
          <p className="text-3xl font-bold">{enrollments.filter((e) => e.course.status === "ACTIVE").length}</p>
          <p className="text-sm text-[#8888a0] mt-1">Active Courses</p>
        </div>
      </div>

      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">My Courses</h2>
          <Link href="/my-courses" className="text-sm text-indigo-400 hover:text-indigo-300">View all →</Link>
        </div>
        {enrollments.length === 0 ? (
          <div className="text-center py-10">
            <FolderOpen className="w-12 h-12 text-[#555570] mx-auto mb-3" />
            <p className="text-[#8888a0] mb-4">You haven&apos;t joined any courses yet.</p>
            <Link href="/join" className="btn-primary inline-flex items-center gap-2"><UserPlus className="w-4 h-4" /> Join a Course</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {enrollments.map((enrollment) => (
              <Link key={enrollment.id} href={`/my-courses/${enrollment.course.id}`} className="flex items-center justify-between p-4 rounded-xl bg-[#12121a] hover:bg-[#232340] transition-colors">
                <div>
                  <p className="font-medium">{enrollment.course.title}</p>
                  <p className="text-sm text-[#8888a0]">By {enrollment.course.createdBy.name}</p>
                </div>
                <div className="text-right">
                  <span className={enrollment.course.status === "ACTIVE" ? "badge-green" : "badge-amber"}>{enrollment.course.status}</span>
                  <p className="text-xs text-[#8888a0] mt-1"><Users className="w-3 h-3 inline mr-1" />{enrollment.course._count.enrollments} students</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
