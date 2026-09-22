"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function AdminUsersPage() {
  const supabase = createClient();
  const router = useRouter();

  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name, email, is_admin, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      setMessage(error.message);
    } else {
      setUsers(data || []);
    }

    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <button
          onClick={() => router.push("/admin")}
          className="mb-8 text-sm text-slate-400 hover:text-white"
        >
          ← Back to Admin Dashboard
        </button>

        <h1 className="text-4xl font-bold">Members</h1>

        <p className="mt-2 text-slate-400">
          View registered Digital Heroes members.
        </p>

        {message && (
          <div className="mt-6 rounded-lg border border-red-900 bg-red-950 p-4 text-sm text-red-300">
            {message}
          </div>
        )}

        <div className="mt-8 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
          {loading ? (
            <div className="p-6 text-slate-400">
              Loading members...
            </div>
          ) : users.length === 0 ? (
            <div className="p-6 text-slate-400">
              No members found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-slate-800 bg-slate-950">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-medium text-slate-400">
                      Name
                    </th>

                    <th className="px-6 py-4 text-left text-sm font-medium text-slate-400">
                      Email
                    </th>

                    <th className="px-6 py-4 text-left text-sm font-medium text-slate-400">
                      Role
                    </th>

                    <th className="px-6 py-4 text-left text-sm font-medium text-slate-400">
                      Joined
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {users.map((member) => (
                    <tr
                      key={member.id}
                      className="border-b border-slate-800 last:border-b-0"
                    >
                      <td className="px-6 py-4 font-medium">
                        {member.full_name || "Unnamed Member"}
                      </td>

                      <td className="px-6 py-4 text-slate-400">
                        {member.email || "No email"}
                      </td>

                      <td className="px-6 py-4">
                        {member.is_admin ? (
                          <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-950">
                            Admin
                          </span>
                        ) : (
                          <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-300">
                            Member
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-400">
                        {member.created_at
                          ? new Date(
                              member.created_at
                            ).toLocaleDateString("en-IN")
                          : "N/A"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}   