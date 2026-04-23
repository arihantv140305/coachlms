"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { registerUser } from "@/actions/auth";
import { GraduationCap, User, Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    const formData = new FormData(e.currentTarget);
    const result = await registerUser(formData);

    if (result.success) {
      toast.success(result.message);
      router.push("/login");
    } else {
      if (result.errors) setErrors(result.errors);
      toast.error(result.message);
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative">
      <div className="fixed inset-0 z-0">
        <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-indigo-500/8 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/3 w-72 h-72 bg-purple-500/8 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10 animate-fade-in-up">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <GraduationCap className="w-7 h-7 text-white" />
            </div>
            <span className="text-2xl font-bold gradient-text">CoachLMS</span>
          </Link>
          <h1 className="text-2xl font-bold mb-2">Create your account</h1>
          <p className="text-[#8888a0]">Start your learning journey</p>
        </div>

        <div className="glass-card p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="name" className="label-text">Full Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#555570]" />
                <input id="name" name="name" type="text" required placeholder="John Doe" className="input-field pl-10" />
              </div>
              {errors.name && <p className="text-rose-400 text-xs mt-1">{errors.name[0]}</p>}
            </div>

            <div>
              <label htmlFor="email" className="label-text">Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#555570]" />
                <input id="email" name="email" type="email" required placeholder="you@example.com" className="input-field pl-10" />
              </div>
              {errors.email && <p className="text-rose-400 text-xs mt-1">{errors.email[0]}</p>}
            </div>

            <div>
              <label htmlFor="password" className="label-text">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#555570]" />
                <input id="password" name="password" type={showPassword ? "text" : "password"} required placeholder="Min 8 characters" className="input-field pl-10 pr-10" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#555570] hover:text-white">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-rose-400 text-xs mt-1">{errors.password[0]}</p>}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="label-text">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#555570]" />
                <input id="confirmPassword" name="confirmPassword" type={showPassword ? "text" : "password"} required placeholder="Re-enter password" className="input-field pl-10" />
              </div>
              {errors.confirmPassword && <p className="text-rose-400 text-xs mt-1">{errors.confirmPassword[0]}</p>}
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating account...</> : "Create Account"}
            </button>
          </form>
        </div>

        <p className="text-center mt-6 text-[#8888a0]">
          Already have an account?{" "}
          <Link href="/login" className="text-indigo-400 hover:text-indigo-300 font-medium">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
