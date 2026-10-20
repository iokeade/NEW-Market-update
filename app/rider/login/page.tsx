"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";

export default function RiderLoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setMessage("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    router.push("/rider");
  }

  return (
    <main className="min-h-screen bg-gray-50 px-5 py-10">
      <div className="mx-auto max-w-md">

        <div className="mb-8 text-center">
          <p className="font-bold text-green-700">
            MARKETLINK
          </p>

          <h1 className="mt-2 text-4xl font-bold">
            Rider Login
          </h1>

          <p className="mt-3 text-gray-600">
            Log in to manage your deliveries and earnings.
          </p>
        </div>

        <div className="rounded-3xl bg-white p-7 shadow-sm">

          <form onSubmit={handleLogin} className="space-y-5">

            <div>
              <label className="mb-2 block font-semibold">
                Email
              </label>

              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="rider@example.com"
                required
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-green-600"
              />
            </div>

            <div>
              <label className="mb-2 block font-semibold">
                Password
              </label>

              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
                required
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-green-600"
              />
            </div>

            {message && (
              <div className="rounded-xl bg-red-50 p-4 text-sm text-red-700">
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-green-700 px-5 py-3 font-bold text-white hover:bg-green-800 disabled:opacity-50"
            >
              {loading ? "Logging in..." : "Log In"}
            </button>

          </form>

          <div className="mt-6 border-t pt-6 text-center">
            <p className="text-sm text-gray-500">
              Want to become a MarketLink rider?
            </p>

            <button
              onClick={() => router.push("/rider/register")}
              className="mt-2 font-bold text-green-700 hover:underline"
            >
              Create Rider Account
            </button>
          </div>

        </div>

      </div>
    </main>
  );
}
