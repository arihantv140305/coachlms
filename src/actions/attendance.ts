"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { ActionResponse } from "@/types";
import { revalidatePath } from "next/cache";

export async function markAttendance(
  courseId: string,
  date: string,
  records: { studentId: string; status: "PRESENT" | "ABSENT" | "LATE" }[]
): Promise<ActionResponse> {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role === "STUDENT") return { success: false, message: "Unauthorized" };

    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) return { success: false, message: "Course not found" };
    if (session.user.role === "INSTRUCTOR" && course.createdById !== session.user.id) return { success: false, message: "Unauthorized" };

    const attendanceDate = new Date(date);

    for (const record of records) {
      await prisma.attendance.upsert({
        where: { courseId_studentId_date: { courseId, studentId: record.studentId, date: attendanceDate } },
        update: { status: record.status as any, markedById: session.user.id },
        create: { courseId, studentId: record.studentId, date: attendanceDate, status: record.status as any, markedById: session.user.id },
      });
    }

    revalidatePath(`/courses/${courseId}/attendance`);
    return { success: true, message: `Attendance marked for ${records.length} students` };
  } catch (error) {
    console.error("Mark attendance error:", error);
    return { success: false, message: "Failed to mark attendance" };
  }
}

export async function getAttendance(courseId: string, date?: string) {
  const where: any = { courseId };
  if (date) where.date = new Date(date);

  return prisma.attendance.findMany({
    where,
    include: { student: { select: { id: true, name: true, email: true } } },
    orderBy: [{ date: "desc" }, { student: { name: "asc" } }],
  });
}

export async function getAttendanceSummary(courseId: string) {
  const enrollments = await prisma.enrollment.findMany({
    where: { courseId, status: "ACTIVE" },
    include: { student: { select: { id: true, name: true } } },
  });

  const attendance = await prisma.attendance.findMany({ where: { courseId } });

  const dates = Array.from(new Set(attendance.map((a) => a.date.toISOString().split("T")[0]))).sort().reverse();

  const summary = enrollments.map((e) => {
    const studentAttendance = attendance.filter((a) => a.studentId === e.studentId);
    const present = studentAttendance.filter((a) => a.status === "PRESENT").length;
    const late = studentAttendance.filter((a) => a.status === "LATE").length;
    const absent = studentAttendance.filter((a) => a.status === "ABSENT").length;
    const total = present + late + absent;
    return {
      student: e.student,
      present,
      late,
      absent,
      total,
      percentage: total > 0 ? Math.round(((present + late) / total) * 100) : 0,
    };
  });

  return { summary, dates, totalSessions: dates.length };
}
