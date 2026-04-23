import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { BookOpen, Users, Plus, TrendingUp } from "lucide-react";

export default async function InstructorDashboard() {
  const session = await getServerSession(authOptions);
  if (!session) return null;

  const [courses, studentCount] = await Promise.all([
    prisma.course.findMany({
      where: { createdById: session.user.id },
      include: { _count: { select: { enrollments: { where: { status: "ACTIVE" } } } } },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.enrollment.count({
      where: { status: "ACTIVE", course: { createdById: session.user.id } },
    }),
  ]);

  const activeCourses = courses.filter((c) => c.status === "ACTIVE").length;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold">Instructor Dashboard</h1>
          <p className="text-[#8888a0] mt-1">Welcome back, {session.user.name}</p>
        </div>
        <Link href="/courses/new" className="btn-primary flex items-center gap-2"><Plus className="w-4 h-4" /> New Course</Link>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "My Courses", value: courses.length, icon: BookOpen, color: "from-indigo-500 to-blue-500" },
          { label: "Active Courses", value: activeCourses, icon: TrendingUp, color: "from-emerald-500 to-teal-500" },
          { label: "Total Students", value: studentCount, icon: Users, color: "from-amber-500 to-orange-500" },
        ].map((card, i) => (
          <div key={i} className="stat-card animate-fade-in-up" style={{ animationDelay: `${i * 0.05}s` }}>
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center mb-3`}>
              <card.icon className="w-5 h-5 text-white" />
            </div>
            <p className="text-3xl font-bold">{card.value}</p>
            <p className="text-sm text-[#8888a0] mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">My Courses</h2>
          <Link href="/courses" className="text-sm text-indigo-400 hover:text-indigo-300">View all →</Link>
        </div>
        {courses.length === 0 ? (
          <div className="text-center py-10">
            <BookOpen className="w-12 h-12 text-[#555570] mx-auto mb-3" />
            <p className="text-[#8888a0]">No courses yet. Create your first course to get started.</p>
            <Link href="/courses/new" className="btn-primary inline-flex items-center gap-2 mt-4"><Plus className="w-4 h-4" /> Create Course</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {courses.map((course) => (
              <Link key={course.id} href={`/courses/${course.id}`} className="flex items-center justify-between p-4 rounded-xl bg-[#12121a] hover:bg-[#232340] transition-colors">
                <div>
                  <p className="font-medium">{course.title}</p>
                  <p className="text-sm text-[#8888a0]">Code: <span className="font-mono text-indigo-400">{course.joinCode}</span></p>
                </div>
                <div className="text-right">
                  <span className={course.status === "ACTIVE" ? "badge-green" : course.status === "DRAFT" ? "badge-amber" : "badge-gray"}>{course.status}</span>
                  <p className="text-xs text-[#8888a0] mt-1">{course._count.enrollments} students</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
