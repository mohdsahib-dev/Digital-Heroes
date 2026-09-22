"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const router = useRouter();
  const supabase = createClient();

  const [isLogin, setIsLogin] = useState(true);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setMessage(error.message);
        setLoading(false);
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } else {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) {
  console.error("LOGIN ERROR:", error);

  setMessage(
    `${error.message}${error.code ? ` | Code: ${error.code}` : ""}`
  );

  setLoading(false);
  return;
}

      if (data.user) {
        await supabase.from("profiles").insert({
          id: data.user.id,
          full_name: fullName,
          email,
        });
      }

      setMessage(
        "Account created successfully. You can now log in."
      );

      setIsLogin(true);
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-white">
            Digital Heroes
          </h1>

          <p className="mt-2 text-slate-400">
            Golf. Rewards. Charity.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-xl">
          <div className="mb-6 flex rounded-lg bg-slate-800 p-1">
            <button
              type="button"
              onClick={() => {
                setIsLogin(true);
                setMessage("");
              }}
              className={`flex-1 rounded-md py-2 text-sm font-medium ${
                isLogin
                  ? "bg-white text-slate-900"
                  : "text-slate-400"
              }`}
            >
              Login
            </button>

            <button
              type="button"
              onClick={() => {
                setIsLogin(false);
                setMessage("");
              }}
              className={`flex-1 rounded-md py-2 text-sm font-medium ${
                !isLogin
                  ? "bg-white text-slate-900"
                  : "text-slate-400"
              }`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="mb-1 block text-sm text-slate-300">
                  Full Name
                </label>

                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-white"
                  placeholder="John Doe"
                />
              </div>
            )}

            <div>
              <label className="mb-1 block text-sm text-slate-300">
                Email
              </label>

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-white"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm text-slate-300">
                Password
              </label>

              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none focus:border-white"
                placeholder="••••••••"
              />
            </div>

            {message && (
              <div className="rounded-lg bg-slate-800 px-4 py-3 text-sm text-slate-300">
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-white py-3 font-semibold text-slate-950 transition hover:bg-slate-200 disabled:opacity-50"
            >
              {loading
                ? "Please wait..."
                : isLogin
                ? "Login"
                : "Create Account"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}