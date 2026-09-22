"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function SubscriptionPage() {
  const supabase = createClient();
  const router = useRouter();

  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activating, setActivating] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadSubscription();
  }, []);

  async function loadSubscription() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/auth");
      return;
    }

    const { data, error } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      setMessage(error.message);
    } else {
      setSubscription(data);
    }

    setLoading(false);
  }

  async function activateMembership() {
    setMessage("");
    setActivating(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/auth");
      return;
    }

    const now = new Date();
    const expiry = new Date(now);
    expiry.setMonth(expiry.getMonth() + 1);

    const { data, error } = await supabase
      .from("subscriptions")
      .insert({
        user_id: user.id,
        plan_name: "Digital Heroes Monthly",
        status: "active",
        started_at: now.toISOString(),
        expires_at: expiry.toISOString(),
      })
      .select()
      .single();

    if (error) {
      setMessage(error.message);
    } else {
      setSubscription(data);
      setMessage("Membership activated successfully! 🎉");
    }

    setActivating(false);
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
        <button
          onClick={() => router.push("/dashboard")}
          className="mb-8 text-sm text-slate-400 hover:text-white"
        >
          ← Back to Dashboard
        </button>

        <h1 className="text-4xl font-bold">
          Membership
        </h1>

        <p className="mt-2 text-slate-400">
          Manage your Digital Heroes membership.
        </p>

        {subscription ? (
          <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-8">
            <p className="text-sm text-slate-400">
              Current Membership
            </p>

            <h2 className="mt-2 text-2xl font-bold">
              {subscription.plan_name}
            </h2>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <div className="rounded-xl bg-slate-950 p-5">
                <p className="text-sm text-slate-400">
                  Status
                </p>

                <p className="mt-1 font-semibold capitalize">
                  {subscription.status}
                </p>
              </div>

              <div className="rounded-xl bg-slate-950 p-5">
                <p className="text-sm text-slate-400">
                  Started
                </p>

                <p className="mt-1 font-semibold">
                  {subscription.started_at
                    ? new Date(
                        subscription.started_at
                      ).toLocaleDateString("en-IN")
                    : "N/A"}
                </p>
              </div>

              <div className="rounded-xl bg-slate-950 p-5">
                <p className="text-sm text-slate-400">
                  Expires
                </p>

                <p className="mt-1 font-semibold">
                  {subscription.expires_at
                    ? new Date(
                        subscription.expires_at
                      ).toLocaleDateString("en-IN")
                    : "N/A"}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-8">
            <p className="text-sm text-slate-400">
              Membership Plan
            </p>

            <h2 className="mt-2 text-3xl font-bold">
              Digital Heroes Monthly
            </h2>

            <p className="mt-4 text-slate-400">
              Get access to the Digital Heroes golf membership,
              monthly prize draws and charity participation.
            </p>

            <button
              onClick={activateMembership}
              disabled={activating}
              className="mt-8 rounded-lg bg-white px-6 py-3 font-semibold text-slate-950 hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {activating
                ? "Activating..."
                : "Activate Membership"}
            </button>

            {message && (
              <p className="mt-4 rounded-lg bg-slate-950 p-4 text-sm text-slate-300">
                {message}
              </p>
            )}
          </div>
        )}

        {subscription && message && (
          <p className="mt-4 rounded-lg bg-slate-900 p-4 text-sm text-slate-300">
            {message}
          </p>
        )}
      </div>
    </main>
  );
}