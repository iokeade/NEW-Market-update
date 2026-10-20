"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";

type Rider = {
  id: string;
  vehicle_type: string | null;
  vehicle_number: string | null;
  is_available: boolean;
};

type Wallet = {
  balance: number;
  total_earned: number;
};

export default function RiderPage() {
  const [rider, setRider] = useState<Rider | null>(null);
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const supabase = createClient();

  useEffect(() => {
    loadRider();
  }, []);

  async function loadRider() {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setMessage("Please log in to your MarketLink rider account.");
      setLoading(false);
      return;
    }

    const { data: riderData, error: riderError } = await supabase
      .from("riders")
      .select("*")
      .eq("profile_id", user.id)
      .maybeSingle();

    if (riderError) {
      setMessage(riderError.message);
      setLoading(false);
      return;
    }

    setRider(riderData);

    if (riderData) {
      const { data: walletData } = await supabase
        .from("wallets")
        .select("balance, total_earned")
        .eq("rider_id", riderData.id)
        .maybeSingle();

      setWallet(walletData);
    }

    setLoading(false);
  }

  async function toggleAvailability() {
    if (!rider) return;

    const { data, error } = await supabase
      .from("riders")
      .update({
        is_available: !rider.is_available,
      })
      .eq("id", rider.id)
      .select()
      .single();

    if (error) {
      setMessage(error.message);
      return;
    }

    setRider(data);
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 p-6">
        <div className="mx-auto max-w-5xl">
          <p className="text-gray-600">Loading rider account...</p>
        </div>
      </main>
    );
  }

  if (!rider) {
    return (
      <main className="min-h-screen bg-gray-50 p-6">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-3xl bg-white p-8 shadow-sm">
            <h1 className="text-3xl font-bold">Rider Account</h1>

            <p className="mt-4 text-gray-600">
              {message ||
                "Your rider account has not been created yet."}
            </p>

            <p className="mt-4 text-sm text-gray-500">
              Once your rider profile is approved, your deliveries and
              earnings will appear here.
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-6xl px-5 py-8">

        {/* HEADER */}
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <p className="font-semibold text-green-700">
              MARKETLINK RIDER
            </p>

            <h1 className="mt-1 text-4xl font-bold">
              Rider Dashboard
            </h1>

            <p className="mt-2 text-gray-600">
              Manage your deliveries and earnings.
            </p>
          </div>

          <button
            onClick={toggleAvailability}
            className={`rounded-full px-6 py-3 font-bold text-white ${
              rider.is_available
                ? "bg-green-600"
                : "bg-gray-500"
            }`}
          >
            {rider.is_available
              ? "● Available for deliveries"
              : "○ Currently unavailable"}
          </button>
        </div>

        {/* ACCOUNT */}
        <section className="mt-8 rounded-3xl bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl">
              🛵
            </div>

            <div>
              <h2 className="text-xl font-bold">
                Your Rider Account
              </h2>

              <p className="text-gray-500">
                Rider ID: {rider.id.slice(0, 8)}
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl bg-gray-50 p-5">
              <p className="text-sm text-gray-500">
                Vehicle
              </p>

              <p className="mt-1 font-bold">
                {rider.vehicle_type || "Not provided"}
              </p>
            </div>

            <div className="rounded-2xl bg-gray-50 p-5">
              <p className="text-sm text-gray-500">
                Vehicle Number
              </p>

              <p className="mt-1 font-bold">
                {rider.vehicle_number || "Not provided"}
              </p>
            </div>
          </div>
        </section>

        {/* WALLET */}
        <section className="mt-6 grid gap-5 md:grid-cols-3">

          <div className="rounded-3xl bg-green-700 p-6 text-white">
            <p className="text-sm opacity-80">
              Available Wallet
            </p>

            <p className="mt-3 text-4xl font-bold">
              ₦{Number(wallet?.balance || 0).toLocaleString()}
            </p>

            <button className="mt-5 rounded-xl bg-white px-5 py-3 font-bold text-green-700">
              Withdraw
            </button>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">
              Total Earnings
            </p>

            <p className="mt-3 text-4xl font-bold">
              ₦{Number(wallet?.total_earned || 0).toLocaleString()}
            </p>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">
              Delivery Status
            </p>

            <p className="mt-3 text-xl font-bold">
              {rider.is_available
                ? "Ready for orders"
                : "Offline"}
            </p>
          </div>

        </section>

        {/* DELIVERIES */}
        <section className="mt-8 rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-bold">
            My Deliveries
          </h2>

          <p className="mt-2 text-gray-500">
            Orders assigned to your rider account will appear here.
          </p>

          <div className="mt-6 rounded-2xl border border-dashed p-8 text-center">
            <div className="text-4xl">📦</div>

            <p className="mt-3 font-semibold">
              No deliveries yet
            </p>

            <p className="mt-1 text-sm text-gray-500">
              When MarketLink assigns you an order, it will appear here.
            </p>
          </div>
        </section>

        {/* EARNINGS */}
        <section className="mt-6 rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-bold">
            Earnings
          </h2>

          <div className="mt-5 rounded-2xl border p-5">
            <p className="text-gray-500">
              Your completed delivery earnings will appear here.
            </p>
          </div>
        </section>

      </div>
    </main>
  );
}
