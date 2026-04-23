"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateUser, deleteUser } from "@/actions/users";
import toast from "react-hot-toast";
import { Search, ToggleLeft, ToggleRight, Trash2, Loader2 } from "lucide-react";
import { formatDate, getInitials } from "@/lib/utils";

type User = {
  id: string; name: string; email: string; role: string; isActive: boolean; createdAt: string;
  _count: { enrollments: number; createdCourses: number };
};

export default function UserTable({ users, initialSearch }: { users: User[]; initialSearch: string }) {
  const router = useRouter();
  const [search, setSearch] = useState(initialSearch);
  const [isPending, startTransition] = useTransition();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  function handleSearch(value: string) {
    setSearch(value);
    startTransition(() => { router.push(`/admin/users?search=${encodeURIComponent(value)}`); });
  }

  async function handleRoleChange(userId: string, newRole: "ADMIN" | "INSTRUCTOR" | "STUDENT") {
    setLoadingId(userId);
    const result = await updateUser(userId, { role: newRole });
    if (result.success) { toast.success(result.message); router.refresh(); } else toast.error(result.message);
    setLoadingId(null);
  }

  async function handleToggleActive(userId: string, currentlyActive: boolean) {
    setLoadingId(userId);
    const result = await updateUser(userId, { isActive: !currentlyActive });
    if (result.success) { toast.success(result.message); router.refresh(); } else toast.error(result.message);
    setLoadingId(null);
  }

  async function handleDelete(userId: string, name: string) {
    if (!confirm(`Are you sure you want to delete "${name}"? This cannot be undone.`)) return;
    setLoadingId(userId);
    const result = await deleteUser(userId);
    if (result.success) { toast.success(result.message); router.refresh(); } else toast.error(result.message);
    setLoadingId(null);
  }

  return (
    <div className="space-y-4">
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#555570]" />
        <input type="text" placeholder="Search users..." value={search} onChange={(e) => handleSearch(e.target.value)} className="input-field pl-10" />
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-[#8888a0] border-b border-[#2a2a45] bg-[#12121a]">
              <th className="text-left py-3 px-4 font-medium">User</th>
              <th className="text-left py-3 px-4 font-medium">Role</th>
              <th className="text-left py-3 px-4 font-medium">Status</th>
              <th className="text-left py-3 px-4 font-medium">Stats</th>
              <th className="text-left py-3 px-4 font-medium">Joined</th>
              <th className="text-right py-3 px-4 font-medium">Actions</th>
            </tr></thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-[#2a2a45]/50 hover:bg-[#232340]/30 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white">{getInitials(user.name)}</div>
                      <div><p className="font-medium">{user.name}</p><p className="text-xs text-[#8888a0]">{user.email}</p></div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <select value={user.role} onChange={(e) => handleRoleChange(user.id, e.target.value as any)} disabled={loadingId === user.id}
                      className="bg-[#12121a] border border-[#2a2a45] rounded-lg px-2 py-1 text-xs focus:outline-none focus:border-indigo-500">
                      <option value="STUDENT">Student</option>
                      <option value="INSTRUCTOR">Instructor</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                  </td>
                  <td className="py-3 px-4">
                    <span className={user.isActive ? "badge-green" : "badge-rose"}>{user.isActive ? "Active" : "Inactive"}</span>
                  </td>
                  <td className="py-3 px-4 text-xs text-[#8888a0]">
                    {user.role === "STUDENT" && <span>{user._count.enrollments} courses</span>}
                    {user.role === "INSTRUCTOR" && <span>{user._count.createdCourses} courses</span>}
                    {user.role === "ADMIN" && <span>Full access</span>}
                  </td>
                  <td className="py-3 px-4 text-[#8888a0] text-xs">{formatDate(user.createdAt)}</td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => handleToggleActive(user.id, user.isActive)} disabled={loadingId === user.id}
                        className={`p-1.5 rounded-lg transition-colors ${user.isActive ? "hover:bg-amber-500/10 text-amber-400" : "hover:bg-emerald-500/10 text-emerald-400"}`}
                        title={user.isActive ? "Deactivate" : "Activate"}>
                        {loadingId === user.id ? <Loader2 className="w-4 h-4 animate-spin" /> : user.isActive ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                      </button>
                      <button onClick={() => handleDelete(user.id, user.name)} disabled={loadingId === user.id}
                        className="p-1.5 rounded-lg hover:bg-rose-500/10 text-rose-400 transition-colors" title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {users.length === 0 && <div className="text-center py-10 text-[#8888a0]">No users found.</div>}
      </div>
    </div>
  );
}
