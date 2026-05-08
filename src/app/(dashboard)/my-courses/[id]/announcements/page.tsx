import { getAnnouncements } from "@/actions/announcements";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Megaphone } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default async function StudentAnnouncementsPage({ params }: { params: { id: string } }) {
  const course = await prisma.course.findUnique({ where: { id: params.id }, select: { title: true } });
  if (!course) notFound();

  const announcements = await getAnnouncements(params.id);

  return (
    <div className="space-y-6">
      <div>
        <Link href={`/my-courses/${params.id}`} className="text-sm text-[#8888a0] hover:text-white flex items-center gap-1 mb-4"><ArrowLeft className="w-4 h-4" /> {course.title}</Link>
        <h1 className="text-2xl font-bold flex items-center gap-2"><Megaphone className="w-6 h-6" /> Announcements</h1>
      </div>

      {announcements.length === 0 ? (
        <div className="glass-card p-16 text-center"><Megaphone className="w-16 h-16 text-[#555570] mx-auto mb-4" /><p className="text-[#8888a0]">No announcements yet.</p></div>
      ) : (
        <div className="space-y-4">
          {announcements.map((a, i) => (
            <div key={a.id} className="glass-card p-6 animate-fade-in-up" style={{ animationDelay: `${i * 0.05}s` }}>
              <h3 className="font-semibold text-lg">{a.title}</h3>
              <p className="text-xs text-[#8888a0] mb-3">By {a.author.name} • {formatDate(a.createdAt)}</p>
              <p className="text-[#8888a0] whitespace-pre-wrap">{a.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
