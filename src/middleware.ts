import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

    // Redirect to role-specific dashboard
    if (pathname === "/dashboard") {
      const role = token?.role;
      if (role === "ADMIN") return NextResponse.redirect(new URL("/dashboard/admin", req.url));
      if (role === "INSTRUCTOR") return NextResponse.redirect(new URL("/dashboard/instructor", req.url));
      return NextResponse.redirect(new URL("/dashboard/student", req.url));
    }

    // Admin-only routes
    if (pathname.startsWith("/admin") && token?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // Instructor/Admin only routes (course management)
    if (
      (pathname.startsWith("/courses/new") || pathname.match(/\/courses\/.*\/edit/)) &&
      token?.role === "STUDENT"
    ) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    return NextResponse.next();
  },
  { callbacks: { authorized: ({ token }) => !!token } }
);

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/courses/:path*",
    "/join",
    "/my-courses/:path*",
    "/profile/:path*",
  ],
};
