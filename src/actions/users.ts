"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { updateUserSchema } from "@/lib/validations";
import { ActionResponse, AdminStats } from "@/types";
import { revalidatePath } from "next/cache";

export async function getAdminStats(): Promise<AdminStats> {
  const [totalUsers, totalStudents, totalInstructors, totalCourses, totalEnrollments, recentUsers] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: "STUDENT" } }),
    prisma.user.count({ where: { role: "INSTRUCTOR" } }),
    prisma.course.count(),
    prisma.enrollment.count({ where: { status: "ACTIVE" } }),
    prisma.user.findMany({
      take: 5, orderBy: { createdAt: "desc" },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    }),
  ]);
  return { totalUsers, totalStudents, totalInstructors, totalCourses, totalEnrollments, recentUsers };
}

export async function getAllUsers(search?: string) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") throw new Error("Unauthorized");

  const where = search
    ? { OR: [
        { name: { contains: search, mode: "insensitive" as const } },
        { email: { contains: search, mode: "insensitive" as const } },
      ] }
    : {};

  return prisma.user.findMany({
    where, orderBy: { createdAt: "desc" },
    select: {
      id: true, name: true, email: true, role: true, isActive: true, createdAt: true,
      _count: { select: { enrollments: true, createdCourses: true } },
    },
  });
}

export async function updateUser(
  userId: string,
  data: { name?: string; role?: "ADMIN" | "INSTRUCTOR" | "STUDENT"; isActive?: boolean }
): Promise<ActionResponse> {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") return { success: false, message: "Unauthorized" };

    const validated = updateUserSchema.safeParse(data);
    if (!validated.success) return { success: false, message: "Invalid data", errors: validated.error.flatten().fieldErrors as Record<string, string[]> };

    if (userId === session.user.id && data.isActive === false) return { success: false, message: "You cannot deactivate your own account" };
    if (userId === session.user.id && data.role && data.role !== "ADMIN") return { success: false, message: "You cannot remove your own admin role" };

    await prisma.user.update({ where: { id: userId }, data: validated.data });
    revalidatePath("/admin/users");
    return { success: true, message: "User updated successfully" };
  } catch (error) {
    console.error("Update user error:", error);
    return { success: false, message: "Failed to update user" };
  }
}

export async function deleteUser(userId: string): Promise<ActionResponse> {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") return { success: false, message: "Unauthorized" };
    if (userId === session.user.id) return { success: false, message: "You cannot delete your own account" };

    await prisma.user.delete({ where: { id: userId } });
    revalidatePath("/admin/users");
    return { success: true, message: "User deleted successfully" };
  } catch (error) {
    console.error("Delete user error:", error);
    return { success: false, message: "Failed to delete user" };
  }
}
