"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function DrawPage() {
  const supabase = createClient();
  const router = useRouter();

  const [draw, setDraw] = useState<any>(null);
  const [winner, setWinner] = useState<any>(null);
  const [isWinner, setIsWinner] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadDraw();
  }, []);

  async function loadDraw() {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Get scheduled draw first
    const { data: scheduledDraw, error: scheduledError } =
      await supabase
        .from("prize_draws")
        .select("*")
        .eq("status", "scheduled")
        .order("draw_date", { ascending: true })
        .limit(1)
        .maybeSingle();

    if (scheduledError) {
      setMessage(scheduledError.message);
      setLoading(false);
      return;
    }

    if (scheduledDraw) {
      setDraw(scheduledDraw);
      setLoading(false);
      return;
    }

    // If there is no scheduled draw, get latest completed draw
    const { data: completedDraw, error: completedError } =
      await supabase
        .from("prize_draws")
        .select("*")
        .eq("status", "completed")
        .order("draw_date", { ascending: false })
        .limit(1)
        .maybeSingle();

    if (completedError) {
      setMessage(completedError.message);
      setLoading(false);
      return;
    }

    if (!completedDraw) {
      setDraw(null);
      setLoading(false);
      return;
    }

    setDraw(completedDraw);

    // Check winner for completed draw
    if (user) {
      const { data: winnerData, error: winnerError } =
        await supabase
          .from("winners")
          .select(
            `
            id,
            user_id,
            verified,
            claimed
            `
          )
          .eq("draw_id", completedDraw.id)
          .eq("user_id", user.id)
          .maybeSingle();

      if (winnerError) {
        setMessage(winnerError.message);
      } else if (winnerData) {
        setWinner(winnerData);
        setIsWinner(true);
      }
    }

    setLoading(false);
  }

  async function enterDraw() {
    setMessage("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/auth");
      return;
    }

    if (!draw || draw.status !== "scheduled") {
      setMessage("No active prize draw is available.");
      return;
    }

    // Check if user is already entered
    const { data: existingEntry, error: checkError } =
      await supabase
        .from("draw_entries")
        .select("id")
        .eq("draw_id", draw.id)
        .eq("user_id", user.id)
        .maybeSingle();

    if (checkError) {
      setMessage(checkError.message);
      return;
    }

    if (existingEntry) {
      setMessage("You are already entered in this draw.");
      return;
    }

    // Create draw entry
    const { error } = await supabase
      .from("draw_entries")
      .insert({
        draw_id: draw.id,
        user_id: user.id,
      });

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage("Successfully entered the prize draw! 🎉");
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 p-10 text-white">
        Loading...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-4xl px-6 py-12">
        {/* Back Button */}
        <button
          onClick={() => router.push("/dashboard")}
          className="mb-8 text-sm text-slate-400 hover:text-white"
        >
          ← Back to Dashboard
        </button>

        {/* Page Header */}
        <h1 className="text-4xl font-bold">
          Monthly Prize Draw
        </h1>

        <p className="mt-2 text-slate-400">
          Enter monthly prize draws and check your results.
        </p>

        {/* No Draw */}
        {!draw ? (
          <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-8">
            <h2 className="text-xl font-semibold">
              No Prize Draw Available
            </h2>

            <p className="mt-2 text-slate-400">
              There is currently no scheduled or completed prize draw.
            </p>
          </div>
        ) : (
          <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-8">
            {/* Status */}
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm text-slate-400">
                {draw.status === "completed"
                  ? "Completed Draw"
                  : "Current Draw"}
              </p>

              <span
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  draw.status === "completed"
                    ? "bg-green-950 text-green-300"
                    : "bg-blue-950 text-blue-300"
                }`}
              >
                {draw.status === "completed"
                  ? "Completed"
                  : "Scheduled"}
              </span>
            </div>

            {/* Prize Name */}
            <h2 className="mt-4 text-3xl font-bold">
              {draw.prize_name || "Monthly Prize Draw"}
            </h2>

            {/* Draw Information */}
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="rounded-xl bg-slate-950 p-5">
                <p className="text-sm text-slate-400">
                  Prize
                </p>

                <p className="mt-1 text-xl font-semibold">
                  ₹
                  {Number(
                    draw.prize_amount || 0
                  ).toLocaleString("en-IN")}
                </p>
              </div>

              <div className="rounded-xl bg-slate-950 p-5">
                <p className="text-sm text-slate-400">
                  Draw Date
                </p>

                <p className="mt-1 text-xl font-semibold">
                  {draw.draw_date
                    ? new Date(
                        draw.draw_date
                      ).toLocaleDateString("en-IN")
                    : "TBA"}
                </p>
              </div>
            </div>

            {/* Scheduled Draw */}
            {draw.status === "scheduled" && (
              <>
                <button
                  onClick={enterDraw}
                  className="mt-8 rounded-lg bg-white px-6 py-3 font-semibold text-slate-950 hover:bg-slate-200"
                >
                  Enter Prize Draw
                </button>

                {message && (
                  <p className="mt-4 rounded-lg bg-slate-950 p-4 text-sm text-slate-300">
                    {message}
                  </p>
                )}
              </>
            )}

            {/* Completed Draw */}
            {draw.status === "completed" && (
              <div className="mt-8 rounded-xl border border-slate-800 bg-slate-950 p-6">
                {isWinner && winner ? (
                  <>
                    <p className="text-sm text-green-400">
                      🎉 Congratulations!
                    </p>

                    <h3 className="mt-2 text-2xl font-bold">
                      You won this prize draw!
                    </h3>

                    <div className="mt-5 grid gap-4 md:grid-cols-2">
                      <div>
                        <p className="text-sm text-slate-500">
                          Prize
                        </p>

                        <p className="mt-1 font-semibold">
                          {draw.prize_name}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm text-slate-500">
                          Amount
                        </p>

                        <p className="mt-1 text-xl font-bold">
                          ₹
                          {Number(
                            draw.prize_amount || 0
                          ).toLocaleString("en-IN")}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm text-slate-500">
                          Verification
                        </p>

                        <p className="mt-1 font-semibold">
                          {winner.verified
                            ? "Verified"
                            : "Pending Verification"}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm text-slate-500">
                          Claim
                        </p>

                        <p className="mt-1 font-semibold">
                          {winner.claimed
                            ? "Claimed"
                            : "Not Claimed"}
                        </p>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="text-sm text-slate-400">
                      Draw Completed
                    </p>

                    <h3 className="mt-2 text-2xl font-bold">
                      The monthly draw has been completed.
                    </h3>

                    <p className="mt-2 text-slate-500">
                      Check your dashboard for your personal prize
                      result.
                    </p>

                    <button
                      onClick={() =>
                        router.push("/dashboard")
                      }
                      className="mt-6 rounded-lg bg-white px-5 py-3 font-semibold text-slate-950 hover:bg-slate-200"
                    >
                      View Dashboard
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}