"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { ActionResponse } from "@/types";
import { sendGradeEmail } from "@/lib/email";
import { revalidatePath } from "next/cache";

export async function submitAssignment(assignmentId: string, content: string): Promise<ActionResponse> {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "STUDENT") return { success: false, message: "Only students can submit" };

    const assignment = await prisma.assignment.findUnique({ where: { id: assignmentId }, include: { course: true } });
    if (!assignment) return { success: false, message: "Assignment not found" };

    // Check enrollment
    const enrollment = await prisma.enrollment.findUnique({
      where: { studentId_courseId: { studentId: session.user.id, courseId: assignment.courseId } },
    });
    if (!enrollment || enrollment.status !== "ACTIVE") return { success: false, message: "Not enrolled in this course" };

    if (!content.trim()) return { success: false, message: "Submission cannot be empty" };

    const isLate = new Date() > assignment.dueDate;

    const existing = await prisma.submission.findUnique({
      where: { assignmentId_studentId: { assignmentId, studentId: session.user.id } },
    });

    if (existing) {
      await prisma.submission.update({
        where: { id: existing.id },
        data: { content, status: isLate ? "LATE" : "SUBMITTED", submittedAt: new Date() },
      });
    } else {
      await prisma.submission.create({
        data: { assignmentId, studentId: session.user.id, content, status: isLate ? "LATE" : "SUBMITTED" },
      });
    }

    revalidatePath(`/my-courses/${assignment.courseId}/assignments/${assignmentId}`);
    return { success: true, message: isLate ? "Submitted (late)" : "Submitted successfully" };
  } catch (error) {
    console.error("Submit error:", error);
    return { success: false, message: "Failed to submit" };
  }
}

export async function gradeSubmission(submissionId: string, marks: number, feedback: string): Promise<ActionResponse> {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role === "STUDENT") return { success: false, message: "Unauthorized" };

    const submission = await prisma.submission.findUnique({
      where: { id: submissionId },
      include: { assignment: { include: { course: true } }, student: { select: { email: true, name: true } } },
    });
    if (!submission) return { success: false, message: "Submission not found" };
    if (session.user.role === "INSTRUCTOR" && submission.assignment.course.createdById !== session.user.id)
      return { success: false, message: "Unauthorized" };

    if (marks < 0 || marks > submission.assignment.totalMarks) return { success: false, message: `Marks must be between 0 and ${submission.assignment.totalMarks}` };

    await prisma.grade.upsert({
      where: { submissionId },
      update: { marks, feedback: feedback || null, gradedById: session.user.id, gradedAt: new Date() },
      create: { submissionId, marks, feedback: feedback || null, gradedById: session.user.id },
    });

    await prisma.submission.update({ where: { id: submissionId }, data: { status: "GRADED" } });

    // Email student
    sendGradeEmail(
      submission.student.email,
      submission.assignment.course.title,
      submission.assignment.title,
      marks,
      submission.assignment.totalMarks,
      feedback
    );

    revalidatePath(`/courses/${submission.assignment.courseId}/assignments/${submission.assignmentId}`);
    return { success: true, message: "Grade saved" };
  } catch (error) {
    console.error("Grade error:", error);
    return { success: false, message: "Failed to save grade" };
  }
}

export async function getGradebook(courseId: string) {
  const assignments = await prisma.assignment.findMany({
    where: { courseId },
    include: {
      submissions: {
        include: { grade: true, student: { select: { id: true, name: true, email: true } } },
      },
    },
    orderBy: { dueDate: "asc" },
  });

  const enrollments = await prisma.enrollment.findMany({
    where: { courseId, status: "ACTIVE" },
    include: { student: { select: { id: true, name: true, email: true } } },
  });

  return { assignments, enrollments };
}

export async function getStudentGrades(courseId: string) {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("Unauthorized");

  return prisma.assignment.findMany({
    where: { courseId },
    include: {
      submissions: {
        where: { studentId: session.user.id },
        include: { grade: true },
      },
    },
    orderBy: { dueDate: "asc" },
  });
}
