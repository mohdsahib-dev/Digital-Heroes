import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function AdminPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth");
  }

  const { data: profile } = await supabase
  .from("profiles")
  .select("is_admin")
  .eq("id", user.id)
  .single();

if (!profile?.is_admin) {
  redirect("/dashboard");
}

  // Get basic statistics
  const { count: userCount } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true });

  const { count: golfRoundCount } = await supabase
    .from("golf_rounds")
    .select("*", { count: "exact", head: true });

  const { count: drawCount } = await supabase
    .from("prize_draws")
    .select("*", { count: "exact", head: true });

  const { count: winnerCount } = await supabase
    .from("winners")
    .select("*", { count: "exact", head: true });

      const { count: drawEntryCount } = await supabase
    .from("draw_entries")
    .select("*", { count: "exact", head: true });

  const { data: charityData } = await supabase
    .from("charity_contributions")
    .select("amount");

  const totalCharity = (charityData ?? []).reduce(
    (total, contribution) =>
      total + Number(contribution.amount || 0),
    0
  );

  const { data: prizeDrawData } = await supabase
    .from("prize_draws")
    .select("prize_amount");

  const totalPrizeValue = (prizeDrawData ?? []).reduce(
    (total, draw) =>
      total + Number(draw.prize_amount || 0),
    0
  );

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="border-b border-slate-800">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <div>
            <h1 className="text-2xl font-bold">Digital Heroes</h1>
            <p className="text-sm text-slate-400">Admin Panel</p>
          </div>

          <div className="flex gap-3">
            <Link
              href="/dashboard"
              className="rounded-lg border border-slate-700 px-4 py-2 text-sm hover:bg-slate-800"
            >
              Member Dashboard
            </Link>

            <form action="/auth/logout" method="post">
              <button
                type="submit"
                className="rounded-lg border border-slate-700 px-4 py-2 text-sm hover:bg-slate-800"
              >
                Logout
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Content */}
      <section className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-8">
          <h2 className="text-3xl font-bold">Admin Dashboard</h2>

          <p className="mt-2 text-slate-400">
            Manage members, golf activity, prize draws and winners.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-3 lg:grid-cols-4">
  <AdminCard
    title="Members"
    value={(userCount ?? 0).toString()}
  />

  <AdminCard
    title="Golf Rounds"
    value={(golfRoundCount ?? 0).toString()}
  />

  <AdminCard
    title="Prize Draws"
    value={(drawCount ?? 0).toString()}
  />

  <AdminCard
    title="Draw Entries"
    value={(drawEntryCount ?? 0).toString()}
  />

  <AdminCard
    title="Winners"
    value={(winnerCount ?? 0).toString()}
  />

  <AdminCard
    title="Charity Contributions"
    value={`₹${totalCharity.toLocaleString("en-IN")}`}
  />

  <AdminCard
    title="Total Prize Value"
    value={`₹${totalPrizeValue.toLocaleString("en-IN")}`}
  />
</div>

        {/* Admin Actions */}
        <div className="mt-8 grid gap-5 md:grid-cols-2">
          <AdminAction
            title="Prize Draws"
            description="Create and manage monthly prize draws."
            href="/admin/draws"
          />

          <AdminAction
            title="Members"
            description="View registered Digital Heroes members."
            href="/admin/users"
          />

          <AdminAction
            title="Golf Activity"
            description="Review member golf rounds and Stableford scores."
            href="/admin/golf"
          />

          <AdminAction
            title="Winners"
            description="View and manage prize draw winners."
            href="/admin/winners"
          />
        </div>
      </section>
    </main>
  );
}

function AdminCard({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
      <p className="text-sm text-slate-400">{title}</p>

      <p className="mt-3 text-4xl font-bold">{value}</p>
    </div>
  );
}

function AdminAction({
  title,
  description,
  href,
}: {
  title: string;
  description: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-2xl border border-slate-800 bg-slate-900 p-6 transition hover:border-slate-600 hover:bg-slate-800"
    >
      <h3 className="text-xl font-semibold">{title}</h3>

      <p className="mt-2 text-sm text-slate-400">{description}</p>

      <p className="mt-5 text-sm font-medium text-white">
        Open →
      </p>
    </Link>
  );
}