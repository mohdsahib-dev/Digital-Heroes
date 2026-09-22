"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function AdminDrawsPage() {
  const supabase = createClient();
  const router = useRouter();

  const [draws, setDraws] = useState<any[]>([]);

  const [month, setMonth] = useState("");
  const [prizeName, setPrizeName] = useState("");
  const [prizeAmount, setPrizeAmount] = useState("");
  const [drawDate, setDrawDate] = useState("");
  const [status, setStatus] = useState("scheduled");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [runningDrawId, setRunningDrawId] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadDraws();
  }, []);

  async function loadDraws() {
    setLoading(true);
    setMessage("");

    const { data, error } = await supabase
      .from("prize_draws")
      .select("*")
      .order("draw_date", { ascending: false });

    if (error) {
      setMessage(error.message);
    } else {
      setDraws(data || []);
    }

    setLoading(false);
  }

  async function createDraw() {
    setMessage("");

    if (!month || !prizeName || !prizeAmount || !drawDate) {
      setMessage("Please fill in all draw fields.");
      return;
    }

    const amount = Number(prizeAmount);

    if (Number.isNaN(amount) || amount <= 0) {
      setMessage("Please enter a valid prize amount.");
      return;
    }

    setSaving(true);

    const { error } = await supabase.from("prize_draws").insert({
      month,
      prize_name: prizeName,
      prize_amount: amount,
      draw_date: drawDate,
      status,
    });

    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Prize draw created successfully.");

      setMonth("");
      setPrizeName("");
      setPrizeAmount("");
      setDrawDate("");
      setStatus("scheduled");

      await loadDraws();
    }

    setSaving(false);
  }

  async function runDraw(draw: any) {
    setMessage("");

    if (draw.status !== "scheduled") {
      setMessage("Only scheduled draws can be run.");
      return;
    }

    const confirmed = window.confirm(
      `Run the draw for "${draw.prize_name}" now? This will select one eligible entry as the winner.`
    );

    if (!confirmed) {
      return;
    }

    setRunningDrawId(draw.id);

    try {
      // Check whether this draw already has a winner.
      const { data: existingWinner, error: winnerCheckError } =
        await supabase
          .from("winners")
          .select("id")
          .eq("draw_id", draw.id)
          .limit(1)
          .maybeSingle();

      if (winnerCheckError) {
        setMessage(winnerCheckError.message);
        return;
      }

      if (existingWinner) {
        setMessage("This draw already has a winner.");
        return;
      }

      // Get all entries for this draw.
      const { data: entries, error: entriesError } = await supabase
        .from("draw_entries")
        .select("id, user_id")
        .eq("draw_id", draw.id);

      if (entriesError) {
        setMessage(entriesError.message);
        return;
      }

      if (!entries || entries.length === 0) {
        setMessage("There are no entries for this draw.");
        return;
      }

      // Select a random entry.
      const randomIndex = Math.floor(Math.random() * entries.length);
      const selectedEntry = entries[randomIndex];

      // Create winner.
      const { error: winnerInsertError } = await supabase
        .from("winners")
        .insert({
          draw_id: draw.id,
          user_id: selectedEntry.user_id,
          verified: false,
          claimed: false,
        });

      if (winnerInsertError) {
        setMessage(winnerInsertError.message);
        return;
      }

      // Mark draw as completed.
      const { error: updateDrawError } = await supabase
        .from("prize_draws")
        .update({
          status: "completed",
        })
        .eq("id", draw.id);

      if (updateDrawError) {
        setMessage(
          `Winner was created, but the draw status could not be updated: ${updateDrawError.message}`
        );
        return;
      }

      setMessage(
        `Draw completed successfully. Winner selected from ${entries.length} eligible entry(ies).`
      );

      await loadDraws();
    } finally {
      setRunningDrawId(null);
    }
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

        <h1 className="text-4xl font-bold">Prize Draw Management</h1>

        <p className="mt-2 text-slate-400">
          Create and manage monthly prize draws.
        </p>

        {message && (
          <div className="mt-6 rounded-lg border border-slate-800 bg-slate-900 p-4 text-sm text-slate-300">
            {message}
          </div>
        )}

        {/* Create Draw */}
        <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="text-xl font-semibold">Create New Draw</h2>

          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm text-slate-400">
                Month
              </label>

              <input
                type="date"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-slate-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-slate-400">
                Prize Name
              </label>

              <input
                value={prizeName}
                onChange={(e) => setPrizeName(e.target.value)}
                placeholder="September Golf Prize"
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none placeholder:text-slate-600 focus:border-slate-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-slate-400">
                Prize Amount
              </label>

              <input
                type="number"
                min="0"
                value={prizeAmount}
                onChange={(e) => setPrizeAmount(e.target.value)}
                placeholder="10000"
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none placeholder:text-slate-600 focus:border-slate-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-slate-400">
                Draw Date
              </label>

              <input
                type="date"
                value={drawDate}
                onChange={(e) => setDrawDate(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-slate-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-slate-400">
                Status
              </label>

              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-slate-500"
              >
                <option value="scheduled">Scheduled</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <button
            onClick={createDraw}
            disabled={saving}
            className="mt-6 rounded-lg bg-white px-6 py-3 font-semibold text-slate-950 hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? "Creating..." : "Create Draw"}
          </button>
        </div>

        {/* Draw List */}
        <div className="mt-8 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
          {loading ? (
            <div className="p-6 text-slate-400">
              Loading draws...
            </div>
          ) : draws.length === 0 ? (
            <div className="p-6 text-slate-400">
              No prize draws found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-slate-800 bg-slate-950">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-medium text-slate-400">
                      Prize
                    </th>

                    <th className="px-6 py-4 text-left text-sm font-medium text-slate-400">
                      Month
                    </th>

                    <th className="px-6 py-4 text-left text-sm font-medium text-slate-400">
                      Draw Date
                    </th>

                    <th className="px-6 py-4 text-right text-sm font-medium text-slate-400">
                      Amount
                    </th>

                    <th className="px-6 py-4 text-left text-sm font-medium text-slate-400">
                      Status
                    </th>

                    <th className="px-6 py-4 text-right text-sm font-medium text-slate-400">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {draws.map((draw) => (
                    <tr
                      key={draw.id}
                      className="border-b border-slate-800 last:border-b-0"
                    >
                      <td className="px-6 py-4 font-medium">
                        {draw.prize_name}
                      </td>

                      <td className="px-6 py-4 text-slate-400">
                        {draw.month
                          ? new Date(draw.month).toLocaleDateString("en-IN")
                          : "N/A"}
                      </td>

                      <td className="px-6 py-4 text-slate-400">
                        {draw.draw_date
                          ? new Date(
                              draw.draw_date
                            ).toLocaleDateString("en-IN")
                          : "N/A"}
                      </td>

                      <td className="px-6 py-4 text-right font-semibold">
                        ₹
                        {Number(
                          draw.prize_amount || 0
                        ).toLocaleString("en-IN")}
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs ${
                            draw.status === "completed"
                              ? "bg-green-950 text-green-300"
                              : draw.status === "cancelled"
                              ? "bg-red-950 text-red-300"
                              : "bg-blue-950 text-blue-300"
                          }`}
                        >
                          {draw.status}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-right">
                        {draw.status === "scheduled" ? (
                          <button
                            onClick={() => runDraw(draw)}
                            disabled={runningDrawId === draw.id}
                            className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {runningDrawId === draw.id
                              ? "Running..."
                              : "Run Draw"}
                          </button>
                        ) : (
                          <span className="text-sm text-slate-600">
                            No action
                          </span>
                        )}
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