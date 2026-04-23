"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { courseSchema } from "@/lib/validations";
import { generateCourseCode, generateJoinCode } from "@/lib/utils";
import { ActionResponse } from "@/types";
import { revalidatePath } from "next/cache";

export async function createCourse(formData: FormData): Promise<ActionResponse> {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role === "STUDENT") return { success: false, message: "Unauthorized" };

    const rawData = {
      title: formData.get("title") as string,
      description: (formData.get("description") as string) || undefined,
      status: (formData.get("status") as string) || "DRAFT",
      maxStudents: parseInt(formData.get("maxStudents") as string) || 50,
      startDate: (formData.get("startDate") as string) || undefined,
      endDate: (formData.get("endDate") as string) || undefined,
    };

    const validated = courseSchema.safeParse(rawData);
    if (!validated.success) return { success: false, message: "Validation failed", errors: validated.error.flatten().fieldErrors as Record<string, string[]> };

    // Generate unique course code
    let code = generateCourseCode(validated.data.title);
    while (await prisma.course.findUnique({ where: { code } })) { code = generateCourseCode(validated.data.title); }

    // Generate unique join code
    let joinCode = generateJoinCode();
    while (await prisma.course.findUnique({ where: { joinCode } })) { joinCode = generateJoinCode(); }

    const course = await prisma.course.create({
      data: {
        title: validated.data.title,
        description: validated.data.description,
        code,
        joinCode,
        status: validated.data.status as any,
        createdById: session.user.id,
        maxStudents: validated.data.maxStudents,
        startDate: validated.data.startDate ? new Date(validated.data.startDate) : null,
        endDate: validated.data.endDate ? new Date(validated.data.endDate) : null,
      },
    });

    revalidatePath("/courses");
    return { success: true, message: `Course created! Join code: ${joinCode}`, data: course as any };
  } catch (error) {
    console.error("Create course error:", error);
    return { success: false, message: "Failed to create course" };
  }
}

export async function updateCourse(courseId: string, formData: FormData): Promise<ActionResponse> {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role === "STUDENT") return { success: false, message: "Unauthorized" };

    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) return { success: false, message: "Course not found" };
    if (session.user.role === "INSTRUCTOR" && course.createdById !== session.user.id) return { success: false, message: "You can only edit your own courses" };

    const rawData = {
      title: formData.get("title") as string,
      description: (formData.get("description") as string) || undefined,
      status: (formData.get("status") as string) || course.status,
      maxStudents: parseInt(formData.get("maxStudents") as string) || course.maxStudents,
      startDate: (formData.get("startDate") as string) || undefined,
      endDate: (formData.get("endDate") as string) || undefined,
    };

    const validated = courseSchema.safeParse(rawData);
    if (!validated.success) return { success: false, message: "Validation failed", errors: validated.error.flatten().fieldErrors as Record<string, string[]> };

    await prisma.course.update({
      where: { id: courseId },
      data: {
        title: validated.data.title,
        description: validated.data.description,
        status: validated.data.status as any,
        maxStudents: validated.data.maxStudents,
        startDate: validated.data.startDate ? new Date(validated.data.startDate) : null,
        endDate: validated.data.endDate ? new Date(validated.data.endDate) : null,
      },
    });

    revalidatePath("/courses");
    revalidatePath(`/courses/${courseId}`);
    return { success: true, message: "Course updated successfully" };
  } catch (error) {
    console.error("Update course error:", error);
    return { success: false, message: "Failed to update course" };
  }
}

export async function deleteCourse(courseId: string): Promise<ActionResponse> {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") return { success: false, message: "Only admins can delete courses" };

    await prisma.course.delete({ where: { id: courseId } });
    revalidatePath("/courses");
    return { success: true, message: "Course deleted successfully" };
  } catch (error) {
    console.error("Delete course error:", error);
    return { success: false, message: "Failed to delete course" };
  }
}

export async function regenerateJoinCode(courseId: string): Promise<ActionResponse> {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role === "STUDENT") return { success: false, message: "Unauthorized" };

    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) return { success: false, message: "Course not found" };
    if (session.user.role === "INSTRUCTOR" && course.createdById !== session.user.id) return { success: false, message: "Unauthorized" };

    let joinCode = generateJoinCode();
    while (await prisma.course.findUnique({ where: { joinCode } })) { joinCode = generateJoinCode(); }

    await prisma.course.update({ where: { id: courseId }, data: { joinCode } });
    revalidatePath(`/courses/${courseId}`);
    return { success: true, message: `New join code: ${joinCode}` };
  } catch (error) {
    return { success: false, message: "Failed to regenerate code" };
  }
}

export async function getCourses() {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Unauthorized");

  const where = session.user.role === "ADMIN" ? {} : { createdById: session.user.id };

  return prisma.course.findMany({
    where, orderBy: { createdAt: "desc" },
    include: {
      createdBy: { select: { id: true, name: true, email: true } },
      _count: { select: { enrollments: { where: { status: "ACTIVE" } } } },
    },
  });
}

export async function getCourse(courseId: string) {
  return prisma.course.findUnique({
    where: { id: courseId },
    include: {
      createdBy: { select: { id: true, name: true, email: true } },
      enrollments: {
        include: { student: { select: { id: true, name: true, email: true, phone: true, createdAt: true } } },
        orderBy: { enrolledAt: "desc" },
      },
    },
  });
}
