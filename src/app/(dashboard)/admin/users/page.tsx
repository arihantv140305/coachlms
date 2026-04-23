import { getAllUsers } from "@/actions/users";
import UserTable from "./UserTable";
import { Users } from "lucide-react";

export default async function AdminUsersPage({ searchParams }: { searchParams: { search?: string } }) {
  const search = searchParams?.search || "";
  const users = await getAllUsers(search);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2"><Users className="w-6 h-6" /> User Management</h1>
        <p className="text-[#8888a0] mt-1">Manage all users, roles, and account status</p>
      </div>
      <UserTable users={JSON.parse(JSON.stringify(users))} initialSearch={search} />
    </div>
  );
}
