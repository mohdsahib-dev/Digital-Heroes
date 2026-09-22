"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function AdminGolfPage() {
  const supabase = createClient();
  const router = useRouter();

  const [rounds, setRounds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadRounds();
  }, []);

  async function loadRounds() {
    const { data, error } = await supabase
      .from("golf_rounds")
      .select(
        `
        id,
        course_name,
        played_at,
        stableford_points,
        user_id,
        profiles (
          full_name,
          email
        )
        `
      )
      .order("played_at", { ascending: false });

    if (error) {
      setMessage(error.message);
    } else {
      setRounds(data || []);
    }

    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-6xl px-6 py-12">
        {/* Back */}
        <button
          onClick={() => router.push("/admin")}
          className="mb-8 text-sm text-slate-400 hover:text-white"
        >
          ← Back to Admin Dashboard
        </button>

        {/* Header */}
        <h1 className="text-4xl font-bold">Golf Activity</h1>

        <p className="mt-2 text-slate-400">
          Review member golf rounds and Stableford scores.
        </p>

        {/* Error */}
        {message && (
          <div className="mt-6 rounded-lg border border-red-900 bg-red-950 p-4 text-sm text-red-300">
            {message}
          </div>
        )}

        {/* Table */}
        <div className="mt-8 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
          {loading ? (
            <div className="p-6 text-slate-400">
              Loading golf activity...
            </div>
          ) : rounds.length === 0 ? (
            <div className="p-6 text-slate-400">
              No golf rounds found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-slate-800 bg-slate-950">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-medium text-slate-400">
                      Member
                    </th>

                    <th className="px-6 py-4 text-left text-sm font-medium text-slate-400">
                      Course
                    </th>

                    <th className="px-6 py-4 text-left text-sm font-medium text-slate-400">
                      Date
                    </th>

                    <th className="px-6 py-4 text-right text-sm font-medium text-slate-400">
                      Stableford
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {rounds.map((round) => {
                    const profile = Array.isArray(round.profiles)
                      ? round.profiles[0]
                      : round.profiles;

                    return (
                      <tr
                        key={round.id}
                        className="border-b border-slate-800 last:border-b-0"
                      >
                        <td className="px-6 py-4">
                          <p className="font-medium">
                            {profile?.full_name || "Unknown Member"}
                          </p>

                          <p className="text-sm text-slate-500">
                            {profile?.email || "No email"}
                          </p>
                        </td>

                        <td className="px-6 py-4 text-slate-300">
                          {round.course_name}
                        </td>

                        <td className="px-6 py-4 text-slate-400">
                          {round.played_at
                            ? new Date(
                                round.played_at
                              ).toLocaleDateString("en-IN")
                            : "N/A"}
                        </td>

                        <td className="px-6 py-4 text-right">
                          <span className="text-xl font-bold">
                            {round.stableford_points}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}