"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function GolfPage() {
  const supabase = createClient();
  const router = useRouter();

  const [courseName, setCourseName] = useState("");
  const [playedAt, setPlayedAt] = useState("");
  const [points, setPoints] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setLoading(true);
    setMessage("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/auth");
      return;
    }

    const { error } = await supabase.from("golf_rounds").insert({
      user_id: user.id,
      course_name: courseName,
      played_at: playedAt,
      stableford_points: Number(points),
    });

    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    setMessage("Golf round saved successfully.");

    setCourseName("");
    setPlayedAt("");
    setPoints("");

    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-2xl">
        <button
          onClick={() => router.push("/dashboard")}
          className="mb-8 text-sm text-slate-400 hover:text-white"
        >
          ← Back to Dashboard
        </button>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8">
          <h1 className="text-3xl font-bold">
            Add Golf Round
          </h1>

          <p className="mt-2 text-slate-400">
            Record your Stableford score for a completed round.
          </p>

          <form
            onSubmit={handleSubmit}
            className="mt-8 space-y-5"
          >
            <div>
              <label className="mb-2 block text-sm text-slate-300">
                Golf Course
              </label>

              <input
                type="text"
                required
                value={courseName}
                onChange={(e) => setCourseName(e.target.value)}
                placeholder="Example Golf Club"
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-white"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-slate-300">
                Date Played
              </label>

              <input
                type="date"
                required
                value={playedAt}
                onChange={(e) => setPlayedAt(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-white"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-slate-300">
                Stableford Points
              </label>

              <input
                type="number"
                min="0"
                max="100"
                required
                value={points}
                onChange={(e) => setPoints(e.target.value)}
                placeholder="Example: 36"
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-white"
              />

              <p className="mt-2 text-xs text-slate-500">
                Enter the Stableford points recorded for this round.
              </p>
            </div>

            {message && (
              <div className="rounded-lg bg-slate-800 px-4 py-3 text-sm text-slate-300">
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-white py-3 font-semibold text-slate-950 hover:bg-slate-200 disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save Golf Round"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}