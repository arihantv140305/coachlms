import { getAdminStats } from "@/actions/users";
import { Users, BookOpen, UserCheck, TrendingUp, GraduationCap } from "lucide-react";
import { formatDate } from "@/lib/utils";
import Link from "next/link";

export default async function AdminDashboard() {
  const stats = await getAdminStats();

  const statCards = [
    { label: "Total Users", value: stats.totalUsers, icon: Users, color: "from-indigo-500 to-blue-500", href: "/admin/users" },
    { label: "Students", value: stats.totalStudents, icon: GraduationCap, color: "from-emerald-500 to-teal-500" },
    { label: "Instructors", value: stats.totalInstructors, icon: UserCheck, color: "from-purple-500 to-pink-500" },
    { label: "Courses", value: stats.totalCourses, icon: BookOpen, color: "from-amber-500 to-orange-500", href: "/courses" },
    { label: "Active Enrollments", value: stats.totalEnrollments, icon: TrendingUp, color: "from-cyan-500 to-blue-500" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-[#8888a0] mt-1">Overview of your coaching institute</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((card, i) => {
          const Content = (
            <div key={i} className="stat-card group cursor-pointer animate-fade-in-up" style={{ animationDelay: `${i * 0.05}s` }}>
              <div className="flex items-start justify-between mb-4">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <card.icon className="w-5 h-5 text-white" />
                </div>
              </div>
              <p className="text-3xl font-bold">{card.value}</p>
              <p className="text-sm text-[#8888a0] mt-1">{card.label}</p>
            </div>
          );
          return card.href ? <Link key={i} href={card.href}>{Content}</Link> : <div key={i}>{Content}</div>;
        })}
      </div>

      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Recent Users</h2>
          <Link href="/admin/users" className="text-sm text-indigo-400 hover:text-indigo-300">View all →</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-[#8888a0] border-b border-[#2a2a45]">
              <th className="text-left py-3 px-2 font-medium">Name</th>
              <th className="text-left py-3 px-2 font-medium">Email</th>
              <th className="text-left py-3 px-2 font-medium">Role</th>
              <th className="text-left py-3 px-2 font-medium">Joined</th>
            </tr></thead>
            <tbody>
              {stats.recentUsers.map((user) => (
                <tr key={user.id} className="border-b border-[#2a2a45]/50 hover:bg-[#232340]/50">
                  <td className="py-3 px-2 font-medium">{user.name}</td>
                  <td className="py-3 px-2 text-[#8888a0]">{user.email}</td>
                  <td className="py-3 px-2">
                    <span className={user.role === "ADMIN" ? "badge-purple" : user.role === "INSTRUCTOR" ? "badge-blue" : "badge-green"}>{user.role}</span>
                  </td>
                  <td className="py-3 px-2 text-[#8888a0]">{formatDate(user.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
