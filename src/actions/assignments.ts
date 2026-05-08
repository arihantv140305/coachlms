"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { ActionResponse } from "@/types";
import { sendAssignmentEmail } from "@/lib/email";
import { revalidatePath } from "next/cache";

export async function createAssignment(courseId: string, formData: FormData): Promise<ActionResponse> {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role === "STUDENT") return { success: false, message: "Unauthorized" };

    const course = await prisma.course.findUnique({ where: { id: courseId }, include: { enrollments: { where: { status: "ACTIVE" }, include: { student: { select: { email: true } } } } } });
    if (!course) return { success: false, message: "Course not found" };
    if (session.user.role === "INSTRUCTOR" && course.createdById !== session.user.id) return { success: false, message: "Unauthorized" };

    const title = formData.get("title") as string;
    const description = (formData.get("description") as string) || null;
    const dueDate = formData.get("dueDate") as string;
    const totalMarks = parseInt(formData.get("totalMarks") as string) || 100;

    if (!title || !dueDate) return { success: false, message: "Title and due date are required" };

    const assignment = await prisma.assignment.create({
      data: { courseId, title, description, dueDate: new Date(dueDate), totalMarks },
    });

    // Email enrolled students
    const emails = course.enrollments.map((e) => e.student.email);
    if (emails.length > 0) {
      sendAssignmentEmail(emails, course.title, title, new Date(dueDate).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" }));
    }

    revalidatePath(`/courses/${courseId}`);
    return { success: true, message: "Assignment created", data: assignment as any };
  } catch (error) {
    console.error("Create assignment error:", error);
    return { success: false, message: "Failed to create assignment" };
  }
}

export async function getAssignments(courseId: string) {
  return prisma.assignment.findMany({
    where: { courseId },
    include: { _count: { select: { submissions: true } } },
    orderBy: { dueDate: "asc" },
  });
}

export async function getAssignment(assignmentId: string) {
  return prisma.assignment.findUnique({
    where: { id: assignmentId },
    include: {
      course: { select: { id: true, title: true, createdById: true } },
      submissions: {
        include: {
          student: { select: { id: true, name: true, email: true } },
          grade: true,
        },
        orderBy: { submittedAt: "desc" },
      },
    },
  });
}

export async function deleteAssignment(assignmentId: string): Promise<ActionResponse> {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role === "STUDENT") return { success: false, message: "Unauthorized" };

    const assignment = await prisma.assignment.findUnique({ where: { id: assignmentId }, include: { course: true } });
    if (!assignment) return { success: false, message: "Not found" };
    if (session.user.role === "INSTRUCTOR" && assignment.course.createdById !== session.user.id) return { success: false, message: "Unauthorized" };

    await prisma.assignment.delete({ where: { id: assignmentId } });
    revalidatePath(`/courses/${assignment.courseId}`);
    return { success: true, message: "Assignment deleted" };
  } catch (error) {
    return { success: false, message: "Failed to delete assignment" };
  }
}
