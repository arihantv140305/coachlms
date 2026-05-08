"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { ActionResponse } from "@/types";
import { sendAnnouncementEmail } from "@/lib/email";
import { revalidatePath } from "next/cache";

export async function createAnnouncement(courseId: string, formData: FormData): Promise<ActionResponse> {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role === "STUDENT") return { success: false, message: "Unauthorized" };

    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: { enrollments: { where: { status: "ACTIVE" }, include: { student: { select: { email: true } } } } },
    });
    if (!course) return { success: false, message: "Course not found" };
    if (session.user.role === "INSTRUCTOR" && course.createdById !== session.user.id) return { success: false, message: "Unauthorized" };

    const title = formData.get("title") as string;
    const content = formData.get("content") as string;
    if (!title || !content) return { success: false, message: "Title and content are required" };

    await prisma.announcement.create({ data: { courseId, title, content, authorId: session.user.id } });

    // Email all enrolled students
    const emails = course.enrollments.map((e) => e.student.email);
    if (emails.length > 0) {
      sendAnnouncementEmail(emails, course.title, title, content);
    }

    revalidatePath(`/courses/${courseId}/announcements`);
    return { success: true, message: "Announcement posted" };
  } catch (error) {
    console.error("Create announcement error:", error);
    return { success: false, message: "Failed to create announcement" };
  }
}

export async function getAnnouncements(courseId: string) {
  return prisma.announcement.findMany({
    where: { courseId },
    include: { author: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function deleteAnnouncement(announcementId: string): Promise<ActionResponse> {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role === "STUDENT") return { success: false, message: "Unauthorized" };

    const announcement = await prisma.announcement.findUnique({ where: { id: announcementId }, include: { course: true } });
    if (!announcement) return { success: false, message: "Not found" };
    if (session.user.role === "INSTRUCTOR" && announcement.course.createdById !== session.user.id) return { success: false, message: "Unauthorized" };

    await prisma.announcement.delete({ where: { id: announcementId } });
    revalidatePath(`/courses/${announcement.courseId}/announcements`);
    return { success: true, message: "Announcement deleted" };
  } catch (error) {
    return { success: false, message: "Failed to delete announcement" };
  }
}
