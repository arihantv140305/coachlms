import { getMaterials } from "@/actions/materials";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, BookOpen, Link as LinkIcon, Video, FileText, ExternalLink } from "lucide-react";

const typeIcons: Record<string, typeof Video> = { video: Video, document: FileText, link: LinkIcon };

export default async function StudentMaterialsPage({ params }: { params: { id: string } }) {
  const course = await prisma.course.findUnique({ where: { id: params.id }, select: { title: true } });
  if (!course) notFound();

  const materials = await getMaterials(params.id);

  return (
    <div className="space-y-6">
      <div>
        <Link href={`/my-courses/${params.id}`} className="text-sm text-[#8888a0] hover:text-white flex items-center gap-1 mb-4"><ArrowLeft className="w-4 h-4" /> {course.title}</Link>
        <h1 className="text-2xl font-bold flex items-center gap-2"><BookOpen className="w-6 h-6" /> Study Materials</h1>
      </div>

      {materials.length === 0 ? (
        <div className="glass-card p-16 text-center"><BookOpen className="w-16 h-16 text-[#555570] mx-auto mb-4" /><p className="text-[#8888a0]">No materials yet.</p></div>
      ) : (
        <div className="space-y-3">
          {materials.map((m, i) => {
            const Icon = typeIcons[m.type] || LinkIcon;
            return (
              <a key={m.id} href={m.url} target="_blank" rel="noopener noreferrer" className="glass-card p-5 flex items-center gap-4 hover:border-indigo-500/30 transition-all animate-fade-in-up" style={{ animationDelay: `${i * 0.05}s` }}>
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center"><Icon className="w-5 h-5 text-indigo-400" /></div>
                <div className="flex-1">
                  <p className="font-semibold flex items-center gap-1">{m.title} <ExternalLink className="w-3 h-3 text-[#8888a0]" /></p>
                  {m.description && <p className="text-sm text-[#8888a0] mt-0.5">{m.description}</p>}
                </div>
                <span className="badge-blue text-xs">{m.type}</span>
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}
