import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import AuthProvider from "@/components/providers/AuthProvider";

export const metadata: Metadata = {
  title: "CoachLMS - Coaching Institute Management",
  description: "A modern learning management system for coaching institutes. Manage courses, batches, students, and academic activities.",
  keywords: ["LMS", "coaching", "education", "learning management"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen">
        <AuthProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: { background: "#1a1a2e", color: "#f0f0f5", border: "1px solid #2a2a45", borderRadius: "12px" },
              success: { iconTheme: { primary: "#10b981", secondary: "#f0f0f5" } },
              error: { iconTheme: { primary: "#f43f5e", secondary: "#f0f0f5" } },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
