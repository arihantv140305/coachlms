import { getCourses } from "@/actions/courses";
import Link from "next/link";
import { BookOpen, Plus, Users } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default async function CoursesPage() {
  const courses = await getCourses();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><BookOpen className="w-6 h-6" /> Courses</h1>
          <p className="text-[#8888a0] mt-1">Manage your courses and students</p>
        </div>
        <Link href="/courses/new" className="btn-primary flex items-center gap-2"><Plus className="w-4 h-4" /> New Course</Link>
      </div>

      {courses.length === 0 ? (
        <div className="glass-card p-16 text-center">
          <BookOpen className="w-16 h-16 text-[#555570] mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">No courses yet</h2>
          <p className="text-[#8888a0] mb-6">Create your first course to get started.</p>
          <Link href="/courses/new" className="btn-primary inline-flex items-center gap-2"><Plus className="w-4 h-4" /> Create Course</Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map((course, i) => (
            <Link key={course.id} href={`/courses/${course.id}`} className="glass-card p-6 hover:border-indigo-500/30 transition-all duration-300 group animate-fade-in-up" style={{ animationDelay: `${i * 0.05}s` }}>
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <span className={course.status === "ACTIVE" ? "badge-green" : course.status === "DRAFT" ? "badge-amber" : "badge-gray"}>{course.status}</span>
              </div>
              <h3 className="font-semibold text-lg mb-1">{course.title}</h3>
              <p className="text-sm text-[#8888a0] mb-3 line-clamp-2">{course.description || "No description"}</p>
              <div className="flex items-center justify-between text-xs text-[#8888a0]">
                <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {course._count.enrollments} students</span>
                <span>Join: <span className="font-mono text-indigo-400">{course.joinCode}</span></span>
              </div>
              <div className="mt-3 pt-3 border-t border-[#2a2a45] text-xs text-[#8888a0]">
                By {course.createdBy.name} • {formatDate(course.createdAt)}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
