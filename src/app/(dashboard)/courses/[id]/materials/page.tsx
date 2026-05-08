import { getMaterials } from "@/actions/materials";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, BookOpen, Link as LinkIcon, Video, FileText, ExternalLink } from "lucide-react";
import DeleteMaterialBtn from "./DeleteMaterialBtn";

const typeIcons: Record<string, any> = { video: Video, document: FileText, link: LinkIcon };

export default async function MaterialsPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const course = await prisma.course.findUnique({ where: { id: params.id }, select: { id: true, title: true, createdById: true } });
  if (!course) notFound();

  const canManage = session?.user.role === "ADMIN" || course.createdById === session?.user.id;
  const materials = await getMaterials(params.id);

  return (
    <div className="space-y-6">
      <div>
        <Link href={`/courses/${params.id}`} className="text-sm text-[#8888a0] hover:text-white flex items-center gap-1 mb-4"><ArrowLeft className="w-4 h-4" /> {course.title}</Link>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold flex items-center gap-2"><BookOpen className="w-6 h-6" /> Study Materials</h1>
          {canManage && <Link href={`/courses/${params.id}/materials/new`} className="btn-primary flex items-center gap-2"><Plus className="w-4 h-4" /> Add Material</Link>}
        </div>
      </div>

      {materials.length === 0 ? (
        <div className="glass-card p-16 text-center">
          <BookOpen className="w-16 h-16 text-[#555570] mx-auto mb-4" />
          <p className="text-[#8888a0]">No study materials added yet.</p>
          {canManage && <Link href={`/courses/${params.id}/materials/new`} className="btn-primary inline-flex items-center gap-2 mt-4"><Plus className="w-4 h-4" /> Add Material</Link>}
        </div>
      ) : (
        <div className="space-y-3">
          {materials.map((m, i) => {
            const Icon = typeIcons[m.type] || LinkIcon;
            return (
              <div key={m.id} className="glass-card p-5 flex items-center justify-between animate-fade-in-up" style={{ animationDelay: `${i * 0.05}s` }}>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-indigo-400" />
                  </div>
                  <div>
                    <a href={m.url} target="_blank" rel="noopener noreferrer" className="font-semibold hover:text-indigo-400 transition-colors flex items-center gap-1">
                      {m.title} <ExternalLink className="w-3 h-3" />
                    </a>
                    {m.description && <p className="text-sm text-[#8888a0] mt-0.5">{m.description}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="badge-blue text-xs">{m.type}</span>
                  {canManage && <DeleteMaterialBtn materialId={m.id} />}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
