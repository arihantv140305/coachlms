"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { ActionResponse } from "@/types";
import { revalidatePath } from "next/cache";

export async function createMaterial(courseId: string, formData: FormData): Promise<ActionResponse> {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role === "STUDENT") return { success: false, message: "Unauthorized" };

    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) return { success: false, message: "Course not found" };
    if (session.user.role === "INSTRUCTOR" && course.createdById !== session.user.id) return { success: false, message: "Unauthorized" };

    const title = formData.get("title") as string;
    const description = (formData.get("description") as string) || null;
    const url = formData.get("url") as string;
    const type = (formData.get("type") as string) || "link";

    if (!title || !url) return { success: false, message: "Title and URL are required" };

    // Validate URL
    try { new URL(url); } catch { return { success: false, message: "Please enter a valid URL" }; }

    const maxOrder = await prisma.material.aggregate({ where: { courseId }, _max: { order: true } });
    const order = (maxOrder._max.order ?? -1) + 1;

    await prisma.material.create({ data: { courseId, title, description, url, type, order } });
    revalidatePath(`/courses/${courseId}/materials`);
    return { success: true, message: "Material added" };
  } catch (error) {
    console.error("Create material error:", error);
    return { success: false, message: "Failed to add material" };
  }
}

export async function getMaterials(courseId: string) {
  return prisma.material.findMany({ where: { courseId }, orderBy: { order: "asc" } });
}

export async function deleteMaterial(materialId: string): Promise<ActionResponse> {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role === "STUDENT") return { success: false, message: "Unauthorized" };

    const material = await prisma.material.findUnique({ where: { id: materialId }, include: { course: true } });
    if (!material) return { success: false, message: "Not found" };
    if (session.user.role === "INSTRUCTOR" && material.course.createdById !== session.user.id) return { success: false, message: "Unauthorized" };

    await prisma.material.delete({ where: { id: materialId } });
    revalidatePath(`/courses/${material.courseId}/materials`);
    return { success: true, message: "Material deleted" };
  } catch {
    return { success: false, message: "Failed to delete material" };
  }
}
