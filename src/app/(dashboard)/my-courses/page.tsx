import { getStudentEnrollments } from "@/actions/enrollments";
import Link from "next/link";
import { FolderOpen, UserPlus, Users, BookOpen, User } from "lucide-react";

export default async function MyCoursesPage() {
  const enrollments = await getStudentEnrollments();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><FolderOpen className="w-6 h-6" /> My Courses</h1>
          <p className="text-[#8888a0] mt-1">All courses you&apos;re enrolled in</p>
        </div>
        <Link href="/join" className="btn-primary flex items-center gap-2"><UserPlus className="w-4 h-4" /> Join Course</Link>
      </div>

      {enrollments.length === 0 ? (
        <div className="glass-card p-16 text-center">
          <FolderOpen className="w-16 h-16 text-[#555570] mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">No courses yet</h2>
          <p className="text-[#8888a0] mb-6">Join a course using the code from your instructor.</p>
          <Link href="/join" className="btn-primary inline-flex items-center gap-2"><UserPlus className="w-4 h-4" /> Join a Course</Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {enrollments.map((enrollment, i) => (
            <Link key={enrollment.id} href={`/my-courses/${enrollment.course.id}`} className="glass-card p-6 hover:border-indigo-500/30 transition-all duration-300 group animate-fade-in-up" style={{ animationDelay: `${i * 0.05}s` }}>
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <span className={enrollment.course.status === "ACTIVE" ? "badge-green" : "badge-amber"}>{enrollment.course.status}</span>
              </div>
              <h3 className="font-semibold text-lg mb-1">{enrollment.course.title}</h3>
              <p className="text-sm text-[#8888a0] mb-3 line-clamp-2">{enrollment.course.description || "No description"}</p>
              <div className="flex items-center justify-between text-xs text-[#8888a0] pt-3 border-t border-[#2a2a45]">
                <span className="flex items-center gap-1"><User className="w-3 h-3" /> {enrollment.course.createdBy.name}</span>
                <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {enrollment.course._count.enrollments} students</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
