import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, email")
    .eq("id", user.id)
    .single();

  const { data: golfRounds } = await supabase
    .from("golf_rounds")
    .select("*")
    .eq("user_id", user.id)
    .order("played_at", { ascending: false });

  const rounds = golfRounds ?? [];
  const { data: charityContributions } = await supabase
  .from("charity_contributions")
  .select("amount")
  .eq("user_id", user.id);

const totalCharity = (charityContributions ?? []).reduce(
  (total, contribution) => total + Number(contribution.amount || 0),
  0
);

  const totalStableford = rounds.reduce(
    (total, round) => total + Number(round.stableford_points || 0),
    0
  );
  const { data: subscription } = await supabase
  .from("subscriptions")
  .select("plan_name, status, started_at, expires_at")
  .eq("user_id", user.id)
  .order("created_at", { ascending: false })
  .limit(1)
  .maybeSingle();
  const { data: latestWinner } = await supabase
    .from("winners")
    .select(
      `
      id,
      draw_id,
      verified,
      claimed,
      created_at,
      prize_draws (
        prize_name,
        prize_amount,
        draw_date
      )
      `
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const winnerDraw = Array.isArray(latestWinner?.prize_draws)
    ? latestWinner?.prize_draws[0]
    : latestWinner?.prize_draws;

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-6xl px-6 py-10">
        {/* Header */}
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <p className="text-sm text-slate-400">Welcome back</p>

            <h1 className="mt-1 text-3xl font-bold">
              {profile?.full_name || user.email}
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              {profile?.email || user.email}
            </p>
          </div>

          <form action="/auth/logout" method="POST">
            <button
              type="submit"
              className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:bg-slate-900"
            >
              Logout
            </button>
          </form>
        </div>

        {/* Stats */}
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-sm text-slate-400">Stableford Points</p>

            <p className="mt-2 text-4xl font-bold">
              {totalStableford}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-sm text-slate-400">Golf Rounds</p>

            <p className="mt-2 text-4xl font-bold">
              {rounds.length}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
  <p className="text-sm text-slate-400">Charity</p>

  <p className="mt-2 text-4xl font-bold">
    ₹{totalCharity.toLocaleString("en-IN")}
  </p>

  <p className="mt-1 text-xs text-slate-500">
    Total charity contributions
  </p>

  <Link
    href="/charity"
    className="mt-4 inline-block rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-slate-200"
  >
    Contribute to Charity
  </Link>
</div>
        </div>

        {/* Membership */}
<div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">
  <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
    <div>
      <p className="text-sm text-slate-400">
        Membership
      </p>

      <h2 className="mt-1 text-2xl font-semibold">
        {subscription?.plan_name || "No Active Membership"}
      </h2>

      <p className="mt-1 text-sm text-slate-400">
        {subscription?.status
          ? `Status: ${subscription.status}`
          : "Activate your Digital Heroes membership."}
      </p>

      {subscription?.expires_at && (
        <p className="mt-1 text-xs text-slate-500">
          Expires:{" "}
          {new Date(subscription.expires_at).toLocaleDateString(
            "en-IN"
          )}
        </p>
      )}
    </div>

    <Link
      href="/subscription"
      className="inline-block rounded-lg bg-white px-5 py-3 font-semibold text-slate-950 hover:bg-slate-200"
    >
      Manage Membership
    </Link>
  </div>
</div>

        {/* Golf Activity */}
        <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <h2 className="text-xl font-semibold">Golf Activity</h2>

              <p className="mt-1 text-sm text-slate-400">
                Track your recent golf rounds and Stableford scores.
              </p>
            </div>

            <Link
              href="/golf"
              className="inline-block rounded-lg bg-white px-5 py-3 font-medium text-slate-950 hover:bg-slate-200"
            >
              Add Golf Round
            </Link>
          </div>

          {rounds.length === 0 ? (
            <div className="mt-6 rounded-xl bg-slate-950 p-5 text-sm text-slate-400">
              No golf rounds recorded yet.
            </div>
          ) : (
            <div className="mt-6 overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-800">
                    <th className="px-4 py-3 text-left text-sm font-medium text-slate-400">
                      Course
                    </th>

                    <th className="px-4 py-3 text-left text-sm font-medium text-slate-400">
                      Date
                    </th>

                    <th className="px-4 py-3 text-right text-sm font-medium text-slate-400">
                      Stableford
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {rounds.map((round) => (
                    <tr
                      key={round.id}
                      className="border-b border-slate-800 last:border-b-0"
                    >
                      <td className="px-4 py-4">
                        {round.course_name}
                      </td>

                      <td className="px-4 py-4 text-slate-400">
                        {round.played_at
                          ? new Date(
                              round.played_at
                            ).toLocaleDateString("en-IN")
                          : "N/A"}
                      </td>

                      <td className="px-4 py-4 text-right text-xl font-bold">
                        {round.stableford_points}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Monthly Prize Draw */}
        <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="text-xl font-semibold">
            Monthly Prize Draw
          </h2>

          <p className="mt-1 text-sm text-slate-400">
            Enter the monthly draw and check your prize status.
          </p>

          <Link
            href="/draw"
            className="mt-5 inline-block rounded-lg bg-white px-5 py-3 font-semibold text-slate-950 hover:bg-slate-200"
          >
            View Prize Draw
          </Link>
        </div>

        {/* Prize Result */}
        <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="text-xl font-semibold">
            Prize Result
          </h2>

          <p className="mt-1 text-sm text-slate-400">
            Your latest monthly prize draw result.
          </p>

          {!latestWinner ? (
            <div className="mt-6 rounded-xl bg-slate-950 p-5">
              <p className="font-medium">No winning result yet.</p>

              <p className="mt-1 text-sm text-slate-500">
                If you win a future prize draw, your result will appear here.
              </p>
            </div>
          ) : (
            <div className="mt-6 rounded-xl border border-green-900 bg-green-950/30 p-6">
              <p className="text-sm text-green-400">
                🎉 Congratulations!
              </p>

              <h3 className="mt-2 text-2xl font-bold">
                You won the prize draw!
              </h3>

              <div className="mt-5 grid gap-4 md:grid-cols-3">
                <div>
                  <p className="text-sm text-slate-500">
                    Prize
                  </p>

                  <p className="mt-1 font-semibold">
                    {winnerDraw?.prize_name || "Prize Draw"}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-slate-500">
                    Amount
                  </p>

                  <p className="mt-1 text-xl font-bold">
                    ₹
                    {Number(
                      winnerDraw?.prize_amount || 0
                    ).toLocaleString("en-IN")}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-slate-500">
                    Status
                  </p>

                  <p className="mt-1 font-semibold">
                    {latestWinner.claimed
                      ? "Claimed"
                      : latestWinner.verified
                      ? "Verified"
                      : "Pending Verification"}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}