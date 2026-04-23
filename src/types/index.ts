import { Role } from "@prisma/client";

// Extend NextAuth types
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: Role;
      isActive: boolean;
    };
  }

  interface User {
    id: string;
    email: string;
    name: string;
    role: Role;
    isActive: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: Role;
    isActive: boolean;
  }
}

// Generic action response
export type ActionResponse<T = undefined> = {
  success: boolean;
  message: string;
  data?: T;
  errors?: Record<string, string[]>;
};

// Dashboard stats
export type AdminStats = {
  totalUsers: number;
  totalStudents: number;
  totalInstructors: number;
  totalCourses: number;
  totalEnrollments: number;
  recentUsers: Array<{
    id: string;
    name: string;
    email: string;
    role: Role;
    createdAt: Date;
  }>;
};

export type InstructorStats = {
  totalCourses: number;
  totalStudents: number;
  activeCourses: number;
};

export type StudentStats = {
  enrolledCourses: number;
  activeCourses: number;
};
