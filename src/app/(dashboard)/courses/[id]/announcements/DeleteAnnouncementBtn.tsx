"use client";

import { useRouter } from "next/navigation";
import { deleteAnnouncement } from "@/actions/announcements";
import toast from "react-hot-toast";
import { Trash2 } from "lucide-react";

export default function DeleteAnnouncementBtn({ announcementId }: { announcementId: string }) {
  const router = useRouter();

  async function handleDelete() {
    if (!confirm("Delete this announcement?")) return;
    const result = await deleteAnnouncement(announcementId);
    if (result.success) { toast.success(result.message); router.refresh(); } else toast.error(result.message);
  }

  return (
    <button onClick={handleDelete} className="p-1.5 rounded-lg hover:bg-rose-500/10 text-rose-400 transition-colors" title="Delete">
      <Trash2 className="w-4 h-4" />
    </button>
  );
}
