"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { GraduationCap, LayoutDashboard, Users, BookOpen, UserPlus, FolderOpen, LogOut, Menu } from "lucide-react";
import { useState } from "react";
import { getInitials } from "@/lib/utils";

const adminLinks = [
  { href: "/dashboard/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/courses", label: "Courses", icon: BookOpen },
];

const instructorLinks = [
  { href: "/dashboard/instructor", label: "Dashboard", icon: LayoutDashboard },
  { href: "/courses", label: "My Courses", icon: BookOpen },
];

const studentLinks = [
  { href: "/dashboard/student", label: "Dashboard", icon: LayoutDashboard },
  { href: "/join", label: "Join Course", icon: UserPlus },
  { href: "/my-courses", label: "My Courses", icon: FolderOpen },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const role = session?.user?.role;
  const links = role === "ADMIN" ? adminLinks : role === "INSTRUCTOR" ? instructorLinks : studentLinks;
  const roleLabel = role === "ADMIN" ? "Administrator" : role === "INSTRUCTOR" ? "Instructor" : "Student";
  const roleBadge = role === "ADMIN" ? "badge-purple" : role === "INSTRUCTOR" ? "badge-blue" : "badge-green";

  return (
    <div className="min-h-screen flex">
      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      <aside className={`fixed lg:sticky top-0 left-0 h-screen w-64 bg-[#12121a] border-r border-[#2a2a45] z-50 flex flex-col transition-transform lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="p-5 border-b border-[#2a2a45]">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold gradient-text">CoachLMS</span>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {links.map((link) => {
            const isActive = pathname === link.href || (link.href !== "/dashboard/admin" && link.href !== "/dashboard/instructor" && link.href !== "/dashboard/student" && pathname.startsWith(link.href));
            return (
              <Link key={link.href} href={link.href} onClick={() => setSidebarOpen(false)} className={isActive ? "sidebar-link-active" : "sidebar-link"}>
                <link.icon className="w-4 h-4" />
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-[#2a2a45]">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-sm font-bold text-white">
              {session?.user?.name ? getInitials(session.user.name) : "?"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{session?.user?.name}</p>
              <span className={roleBadge}>{roleLabel}</span>
            </div>
          </div>
          <button onClick={() => signOut({ callbackUrl: "/" })} className="sidebar-link w-full text-rose-400 hover:text-rose-300 hover:bg-rose-500/10">
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-h-screen">
        <header className="lg:hidden sticky top-0 z-30 bg-[#0a0a0f]/90 backdrop-blur-lg border-b border-[#2a2a45] px-4 py-3 flex items-center justify-between">
          <button onClick={() => setSidebarOpen(true)} className="p-2 hover:bg-[#232340] rounded-lg"><Menu className="w-5 h-5" /></button>
          <span className="text-sm font-bold gradient-text">CoachLMS</span>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold">
            {session?.user?.name ? getInitials(session.user.name) : "?"}
          </div>
        </header>
        <main className="flex-1 p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
