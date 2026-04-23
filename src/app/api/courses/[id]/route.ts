import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const course = await prisma.course.findUnique({ where: { id: params.id } });
    if (!course) return NextResponse.json(null, { status: 404 });
    return NextResponse.json(course);
  } catch {
    return NextResponse.json(null, { status: 500 });
  }
}
