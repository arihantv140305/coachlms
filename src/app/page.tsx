import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { GraduationCap, Users, BookOpen, Shield, ArrowRight, Sparkles } from "lucide-react";

export default async function HomePage() {
  const session = await getServerSession(authOptions);
  if (session) redirect("/dashboard");

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background effects */}
      <div className="fixed inset-0 z-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl" />
      </div>

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 lg:px-12 py-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold gradient-text">CoachLMS</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="btn-ghost">Log in</Link>
          <Link href="/register" className="btn-primary flex items-center gap-2">
            Get Started <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <main className="relative z-10 px-6 lg:px-12">
        <div className="max-w-5xl mx-auto pt-20 pb-32 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-medium mb-8 animate-fade-in-up">
            <Sparkles className="w-4 h-4" /> Modern Coaching Management Platform
          </div>
          <h1 className="text-5xl lg:text-7xl font-extrabold leading-tight mb-6 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
            Manage Your <br />
            <span className="gradient-text">Coaching Institute</span>
            <br />Effortlessly
          </h1>
          <p className="text-lg lg:text-xl text-[#8888a0] max-w-2xl mx-auto mb-10 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
            Create courses, manage batches, track student progress, and streamline your entire coaching workflow — all in one powerful platform.
          </p>
          <div className="flex items-center justify-center gap-4 animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
            <Link href="/register" className="btn-primary text-lg px-8 py-3 flex items-center gap-2">
              Start Free <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="/login" className="btn-secondary text-lg px-8 py-3">Log In</Link>
          </div>
        </div>

        {/* Features */}
        <div className="max-w-6xl mx-auto pb-32">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: BookOpen, title: "Course Management", desc: "Create and organize courses with ease. Track all your academic content in one place.", color: "from-indigo-500 to-blue-500" },
              { icon: Users, title: "Batch Enrollment", desc: "Students join with a simple batch code. Manage enrollments and approvals effortlessly.", color: "from-purple-500 to-pink-500" },
              { icon: Shield, title: "Role-Based Access", desc: "Admin, Instructor, and Student roles with granular permissions for every feature.", color: "from-cyan-500 to-teal-500" },
              { icon: GraduationCap, title: "Academic Tracking", desc: "Assignments, grading, attendance, and progress reports — coming in Phase 2.", color: "from-amber-500 to-orange-500" },
            ].map((feature, i) => (
              <div key={i} className="glass-card p-6 hover:border-indigo-500/30 transition-all duration-300 group animate-fade-in-up" style={{ animationDelay: `${0.4 + i * 0.1}s` }}>
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-[#8888a0]">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-[#2a2a45] px-6 py-8 text-center text-sm text-[#555570]">
        <p>© {new Date().getFullYear()} CoachLMS. Built for coaching institutes.</p>
      </footer>
    </div>
  );
}
