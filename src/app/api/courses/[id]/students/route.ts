import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const enrollments = await prisma.enrollment.findMany({
      where: { courseId: params.id, status: "ACTIVE" },
      include: { student: { select: { id: true, name: true, email: true } } },
      orderBy: { student: { name: "asc" } },
    });
    return NextResponse.json(enrollments.map((e) => e.student));
  } catch {
    return NextResponse.json([], { status: 500 });
  }
}
