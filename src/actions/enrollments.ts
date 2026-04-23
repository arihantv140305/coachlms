"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { ActionResponse } from "@/types";
import { revalidatePath } from "next/cache";

export async function joinCourse(joinCode: string): Promise<ActionResponse> {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "STUDENT") return { success: false, message: "Only students can join courses" };

    const course = await prisma.course.findUnique({
      where: { joinCode: joinCode.toUpperCase() },
      include: { _count: { select: { enrollments: { where: { status: "ACTIVE" } } } } },
    });

    if (!course) return { success: false, message: "Invalid join code. Please check and try again." };
    if (course.status === "ARCHIVED") return { success: false, message: "This course is no longer active." };
    if (course.status === "DRAFT") return { success: false, message: "This course is not yet open for enrollment." };

    const activeCount = course._count.enrollments;
    if (activeCount >= course.maxStudents) return { success: false, message: "This course is full." };

    const existing = await prisma.enrollment.findUnique({
      where: { studentId_courseId: { studentId: session.user.id, courseId: course.id } },
    });

    if (existing) {
      if (existing.status === "ACTIVE") return { success: false, message: "You are already enrolled in this course." };
      if (existing.status === "REMOVED") return { success: false, message: "You were removed from this course. Contact the instructor." };
      await prisma.enrollment.update({ where: { id: existing.id }, data: { status: "ACTIVE" } });
    } else {
      await prisma.enrollment.create({ data: { studentId: session.user.id, courseId: course.id, status: "ACTIVE" } });
    }

    revalidatePath("/my-courses");
    revalidatePath("/dashboard/student");
    return { success: true, message: `Successfully joined "${course.title}"` };
  } catch (error) {
    console.error("Join course error:", error);
    return { success: false, message: "Failed to join course" };
  }
}

export async function removeStudent(enrollmentId: string): Promise<ActionResponse> {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role === "STUDENT") return { success: false, message: "Unauthorized" };

    const enrollment = await prisma.enrollment.findUnique({
      where: { id: enrollmentId },
      include: { course: { select: { createdById: true } } },
    });

    if (!enrollment) return { success: false, message: "Enrollment not found" };
    if (session.user.role === "INSTRUCTOR" && enrollment.course.createdById !== session.user.id) return { success: false, message: "Unauthorized" };

    await prisma.enrollment.update({ where: { id: enrollmentId }, data: { status: "REMOVED" } });
    revalidatePath(`/courses/${enrollment.courseId}`);
    return { success: true, message: "Student removed from course" };
  } catch (error) {
    return { success: false, message: "Failed to remove student" };
  }
}

export async function getStudentEnrollments() {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Unauthorized");

  return prisma.enrollment.findMany({
    where: { studentId: session.user.id, status: "ACTIVE" },
    include: {
      course: {
        include: {
          createdBy: { select: { id: true, name: true } },
          _count: { select: { enrollments: { where: { status: "ACTIVE" } } } },
        },
      },
    },
    orderBy: { enrolledAt: "desc" },
  });
}
