"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { markAttendance } from "@/actions/attendance";
import toast from "react-hot-toast";
import Link from "next/link";
import { ArrowLeft, CheckCircle, XCircle, Clock, Loader2, Users } from "lucide-react";

type Student = { id: string; name: string; email: string };

export default function AttendancePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>([]);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [records, setRecords] = useState<Record<string, "PRESENT" | "ABSENT" | "LATE">>({});
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    fetch(`/api/courses/${params.id}/students`).then((r) => r.json()).then((data) => {
      setStudents(data || []);
      const initial: Record<string, "PRESENT" | "ABSENT" | "LATE"> = {};
      (data || []).forEach((s: Student) => { initial[s.id] = "PRESENT"; });
      setRecords(initial);
      setFetching(false);
    }).catch(() => setFetching(false));
  }, [params.id]);

  // Load existing attendance for selected date
  useEffect(() => {
    if (!date) return;
    fetch(`/api/courses/${params.id}/attendance?date=${date}`).then((r) => r.json()).then((data) => {
      if (data && data.length > 0) {
        const existing: Record<string, "PRESENT" | "ABSENT" | "LATE"> = {};
        students.forEach((s) => { existing[s.id] = "PRESENT"; });
        data.forEach((a: { studentId: string; status: "PRESENT" | "ABSENT" | "LATE" }) => { existing[a.studentId] = a.status; });
        setRecords(existing);
      }
    }).catch(() => {});
  }, [date, students, params.id]);

  function toggleStatus(studentId: string) {
    setRecords((prev) => {
      const order: ("PRESENT" | "ABSENT" | "LATE")[] = ["PRESENT", "LATE", "ABSENT"];
      const current = prev[studentId] || "PRESENT";
      const next = order[(order.indexOf(current) + 1) % 3];
      return { ...prev, [studentId]: next };
    });
  }

  async function handleSave() {
    setLoading(true);
    const recordsArray = Object.entries(records).map(([studentId, status]) => ({ studentId, status }));
    const result = await markAttendance(params.id, date, recordsArray);
    if (result.success) { toast.success(result.message); router.refresh(); } else toast.error(result.message);
    setLoading(false);
  }

  const statusColors = { PRESENT: "text-emerald-400 bg-emerald-500/10", LATE: "text-amber-400 bg-amber-500/10", ABSENT: "text-rose-400 bg-rose-500/10" };
  const statusIcons = { PRESENT: CheckCircle, LATE: Clock, ABSENT: XCircle };

  if (fetching) return <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-indigo-400" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <Link href={`/courses/${params.id}`} className="text-sm text-[#8888a0] hover:text-white flex items-center gap-1 mb-4"><ArrowLeft className="w-4 h-4" /> Back to Course</Link>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold flex items-center gap-2"><Users className="w-6 h-6" /> Attendance</h1>
          <Link href={`/courses/${params.id}/attendance/summary`} className="btn-secondary text-sm">View Summary</Link>
        </div>
      </div>

      <div className="glass-card p-6">
        <div className="flex items-center gap-4 mb-6">
          <div>
            <label className="label-text">Date</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="input-field" />
          </div>
          <div className="flex gap-4 text-sm mt-5">
            <span className="flex items-center gap-1"><CheckCircle className="w-4 h-4 text-emerald-400" /> Present</span>
            <span className="flex items-center gap-1"><Clock className="w-4 h-4 text-amber-400" /> Late</span>
            <span className="flex items-center gap-1"><XCircle className="w-4 h-4 text-rose-400" /> Absent</span>
          </div>
        </div>

        {students.length === 0 ? (
          <p className="text-[#8888a0] text-center py-6">No students enrolled.</p>
        ) : (
          <>
            <div className="space-y-2">
              {students.map((student) => {
                const status = records[student.id] || "PRESENT";
                const Icon = statusIcons[status];
                return (
                  <button key={student.id} onClick={() => toggleStatus(student.id)} className={`w-full flex items-center justify-between p-3 rounded-xl border border-[#2a2a45] hover:border-indigo-500/30 transition-all ${statusColors[status]}`}>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white">{student.name.charAt(0)}</div>
                      <div className="text-left"><p className="font-medium text-white">{student.name}</p><p className="text-xs text-[#8888a0]">{student.email}</p></div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Icon className="w-5 h-5" />
                      <span className="text-sm font-medium w-16 text-right">{status}</span>
                    </div>
                  </button>
                );
              })}
            </div>
            <div className="mt-6 flex justify-end">
              <button onClick={handleSave} disabled={loading} className="btn-primary flex items-center gap-2">
                {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : "Save Attendance"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
