import { getAnnouncements } from "@/actions/announcements";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, Megaphone } from "lucide-react";
import { formatDate } from "@/lib/utils";
import DeleteAnnouncementBtn from "./DeleteAnnouncementBtn";

export default async function AnnouncementsPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const course = await prisma.course.findUnique({ where: { id: params.id }, select: { id: true, title: true, createdById: true } });
  if (!course) notFound();

  const canManage = session?.user.role === "ADMIN" || course.createdById === session?.user.id;
  const announcements = await getAnnouncements(params.id);

  return (
    <div className="space-y-6">
      <div>
        <Link href={`/courses/${params.id}`} className="text-sm text-[#8888a0] hover:text-white flex items-center gap-1 mb-4"><ArrowLeft className="w-4 h-4" /> {course.title}</Link>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold flex items-center gap-2"><Megaphone className="w-6 h-6" /> Announcements</h1>
          {canManage && <Link href={`/courses/${params.id}/announcements/new`} className="btn-primary flex items-center gap-2"><Plus className="w-4 h-4" /> New Announcement</Link>}
        </div>
      </div>

      {announcements.length === 0 ? (
        <div className="glass-card p-16 text-center">
          <Megaphone className="w-16 h-16 text-[#555570] mx-auto mb-4" />
          <p className="text-[#8888a0]">No announcements yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {announcements.map((a, i) => (
            <div key={a.id} className="glass-card p-6 animate-fade-in-up" style={{ animationDelay: `${i * 0.05}s` }}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-lg">{a.title}</h3>
                  <p className="text-xs text-[#8888a0]">By {a.author.name} • {formatDate(a.createdAt)}</p>
                </div>
                {canManage && <DeleteAnnouncementBtn announcementId={a.id} />}
              </div>
              <p className="text-[#8888a0] whitespace-pre-wrap">{a.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
