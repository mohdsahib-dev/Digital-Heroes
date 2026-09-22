"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const charities = [
  "Education Support",
  "Healthcare Support",
  "Community Development",
  "Environmental Protection",
];

export default function CharityPage() {
  const supabase = createClient();
  const router = useRouter();

  const [charityName, setCharityName] = useState(charities[0]);
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  async function submitContribution() {
    setMessage("");

    if (!amount) {
      setMessage("Please enter a contribution amount.");
      return;
    }

    const contributionAmount = Number(amount);

    if (
      Number.isNaN(contributionAmount) ||
      contributionAmount <= 0
    ) {
      setMessage("Please enter a valid amount.");
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/auth");
      return;
    }

    setSaving(true);

    const { error } = await supabase
      .from("charity_contributions")
      .insert({
        user_id: user.id,
        charity_name: charityName,
        amount: contributionAmount,
      });

    if (error) {
      setMessage(error.message);
    } else {
      setMessage(
        `₹${contributionAmount.toLocaleString(
          "en-IN"
        )} contribution recorded successfully.`
      );

      setAmount("");
    }

    setSaving(false);
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-3xl px-6 py-12">
        <button
          onClick={() => router.push("/dashboard")}
          className="mb-8 text-sm text-slate-400 hover:text-white"
        >
          ← Back to Dashboard
        </button>

        <h1 className="text-4xl font-bold">
          Charity Contributions
        </h1>

        <p className="mt-2 text-slate-400">
          Support a cause through your Digital Heroes membership.
        </p>

        <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <div>
            <label className="mb-2 block text-sm text-slate-400">
              Choose a Cause
            </label>

            <select
              value={charityName}
              onChange={(e) => setCharityName(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-slate-500"
            >
              {charities.map((charity) => (
                <option key={charity} value={charity}>
                  {charity}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-6">
            <label className="mb-2 block text-sm text-slate-400">
              Contribution Amount
            </label>

            <input
              type="number"
              min="1"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="500"
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none placeholder:text-slate-600 focus:border-slate-500"
            />
          </div>

          <button
            onClick={submitContribution}
            disabled={saving}
            className="mt-6 rounded-lg bg-white px-6 py-3 font-semibold text-slate-950 hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? "Saving..." : "Record Contribution"}
          </button>

          {message && (
            <div className="mt-5 rounded-lg bg-slate-950 p-4 text-sm text-slate-300">
              {message}
            </div>
          )}
        </div>

        <div className="mt-6 rounded-xl border border-slate-800 bg-slate-900 p-5">
          <p className="text-sm text-slate-400">
            Prototype note
          </p>

          <p className="mt-1 text-sm text-slate-500">
            This records the contribution in the database. Real payment
            processing can be connected later.
          </p>
        </div>
      </div>
    </main>
  );
}