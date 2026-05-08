import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const url = new URL(req.url);
    const date = url.searchParams.get("date");
    if (!date) return NextResponse.json([]);

    const attendance = await prisma.attendance.findMany({
      where: { courseId: params.id, date: new Date(date) },
    });
    return NextResponse.json(attendance);
  } catch {
    return NextResponse.json([], { status: 500 });
  }
}
