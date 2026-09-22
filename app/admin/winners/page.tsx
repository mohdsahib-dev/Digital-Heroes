"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function AdminWinnersPage() {
  const supabase = createClient();
  const router = useRouter();

  const [winners, setWinners] = useState<any[]>([]);
  const [draws, setDraws] = useState<any[]>([]);

  const [drawId, setDrawId] = useState("");
  const [userId, setUserId] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    setMessage("");

    const [
      { data: winnersData, error: winnersError },
      { data: drawsData, error: drawsError },
    ] = await Promise.all([
      supabase
        .from("winners")
        .select(
          `
          id,
          draw_id,
          user_id,
          verified,
          claimed,
          created_at,
          profiles (
            full_name,
            email
          ),
          prize_draws (
            prize_name,
            prize_amount,
            month,
            draw_date
          )
          `
        )
        .order("created_at", { ascending: false }),

      supabase
        .from("prize_draws")
        .select(
          "id, prize_name, prize_amount, month, draw_date, status"
        )
        .order("draw_date", { ascending: false }),
    ]);

    if (winnersError) {
      setMessage(winnersError.message);
    } else if (drawsError) {
      setMessage(drawsError.message);
    } else {
      setWinners(winnersData || []);
      setDraws(drawsData || []);
    }

    setLoading(false);
  }

  async function addWinner() {
    setMessage("");

    if (!drawId || !userId) {
      setMessage("Please select a draw and enter the user ID.");
      return;
    }

    setSaving(true);

    const { error } = await supabase.from("winners").insert({
      draw_id: drawId,
      user_id: userId,
      verified: false,
      claimed: false,
    });

    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Winner added successfully.");

      setDrawId("");
      setUserId("");

      await loadData();
    }

    setSaving(false);
  }

  async function updateWinner(
    winnerId: string,
    field: "verified" | "claimed",
    value: boolean
  ) {
    setMessage("");
    setUpdatingId(winnerId);

    const { error } = await supabase
      .from("winners")
      .update({
        [field]: value,
      })
      .eq("id", winnerId);

    if (error) {
      setMessage(error.message);
    } else {
      setWinners((current) =>
        current.map((winner) =>
          winner.id === winnerId
            ? {
                ...winner,
                [field]: value,
              }
            : winner
        )
      );

      setMessage(
        field === "verified"
          ? value
            ? "Winner verified successfully."
            : "Winner verification removed."
          : value
          ? "Winner marked as claimed."
          : "Claim status removed."
      );
    }

    setUpdatingId(null);
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

        <h1 className="text-4xl font-bold">Winners</h1>

        <p className="mt-2 text-slate-400">
          Manage monthly prize draw winners and verification status.
        </p>

        {message && (
          <div className="mt-6 rounded-lg border border-slate-800 bg-slate-900 p-4 text-sm text-slate-300">
            {message}
          </div>
        )}

        {/* Add Winner */}
        <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="text-xl font-semibold">Add Winner</h2>

          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm text-slate-400">
                Prize Draw
              </label>

              <select
                value={drawId}
                onChange={(e) => setDrawId(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-slate-500"
              >
                <option value="">Select draw</option>

                {draws.map((draw) => (
                  <option key={draw.id} value={draw.id}>
                    {draw.prize_name} — ₹
                    {Number(draw.prize_amount || 0).toLocaleString(
                      "en-IN"
                    )}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm text-slate-400">
                User ID
              </label>

              <input
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="Paste Supabase user ID"
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none placeholder:text-slate-600 focus:border-slate-500"
              />
            </div>
          </div>

          <button
            onClick={addWinner}
            disabled={saving}
            className="mt-6 rounded-lg bg-white px-6 py-3 font-semibold text-slate-950 hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? "Adding..." : "Add Winner"}
          </button>
        </div>

        {/* Winners List */}
        <div className="mt-8 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
          {loading ? (
            <div className="p-6 text-slate-400">
              Loading winners...
            </div>
          ) : winners.length === 0 ? (
            <div className="p-6 text-slate-400">
              No winners have been recorded yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-slate-800 bg-slate-950">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-medium text-slate-400">
                      Winner
                    </th>

                    <th className="px-6 py-4 text-left text-sm font-medium text-slate-400">
                      Draw
                    </th>

                    <th className="px-6 py-4 text-left text-sm font-medium text-slate-400">
                      Draw Date
                    </th>

                    <th className="px-6 py-4 text-right text-sm font-medium text-slate-400">
                      Prize
                    </th>

                    <th className="px-6 py-4 text-left text-sm font-medium text-slate-400">
                      Verification
                    </th>

                    <th className="px-6 py-4 text-left text-sm font-medium text-slate-400">
                      Claim
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {winners.map((winner) => {
                    const profile = Array.isArray(winner.profiles)
                      ? winner.profiles[0]
                      : winner.profiles;

                    const draw = Array.isArray(winner.prize_draws)
                      ? winner.prize_draws[0]
                      : winner.prize_draws;

                    const updating = updatingId === winner.id;

                    return (
                      <tr
                        key={winner.id}
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
                          {draw?.prize_name || "Unknown Draw"}
                        </td>

                        <td className="px-6 py-4 text-slate-400">
                          {draw?.draw_date
                            ? new Date(
                                draw.draw_date
                              ).toLocaleDateString("en-IN")
                            : "N/A"}
                        </td>

                        <td className="px-6 py-4 text-right">
                          <span className="text-xl font-bold">
                            ₹
                            {Number(
                              draw?.prize_amount || 0
                            ).toLocaleString("en-IN")}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex flex-col items-start gap-2">
                            {winner.verified ? (
                              <span className="rounded-full bg-green-950 px-3 py-1 text-xs text-green-300">
                                Verified
                              </span>
                            ) : (
                              <span className="rounded-full bg-yellow-950 px-3 py-1 text-xs text-yellow-300">
                                Pending
                              </span>
                            )}

                            <button
                              onClick={() =>
                                updateWinner(
                                  winner.id,
                                  "verified",
                                  !winner.verified
                                )
                              }
                              disabled={updating}
                              className="rounded-lg border border-slate-700 px-3 py-2 text-xs font-medium hover:bg-slate-800 disabled:opacity-50"
                            >
                              {updating
                                ? "Updating..."
                                : winner.verified
                                ? "Unverify"
                                : "Verify Winner"}
                            </button>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex flex-col items-start gap-2">
                            {winner.claimed ? (
                              <span className="rounded-full bg-green-950 px-3 py-1 text-xs text-green-300">
                                Claimed
                              </span>
                            ) : (
                              <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-400">
                                Not Claimed
                              </span>
                            )}

                            <button
                              onClick={() =>
                                updateWinner(
                                  winner.id,
                                  "claimed",
                                  !winner.claimed
                                )
                              }
                              disabled={updating}
                              className="rounded-lg border border-slate-700 px-3 py-2 text-xs font-medium hover:bg-slate-800 disabled:opacity-50"
                            >
                              {updating
                                ? "Updating..."
                                : winner.claimed
                                ? "Mark Unclaimed"
                                : "Mark Claimed"}
                            </button>
                          </div>
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