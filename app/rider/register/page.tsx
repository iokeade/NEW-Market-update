"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";

export default function RiderRegisterPage() {
  const router = useRouter();
  const supabase = createClient();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [vehicleType, setVehicleType] = useState("Motorcycle");
  const [vehicleNumber, setVehicleNumber] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleRegister(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setMessage("");
    setSuccess(false);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/rider`,
        data: {
          full_name: fullName,
          phone,
          role: "rider",
          vehicle_type: vehicleType,
          vehicle_number: vehicleNumber,
        },
      },
    });

    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    if (!data.user) {
      setMessage("Registration could not be completed.");
      setLoading(false);
      return;
    }

    setSuccess(true);
    setMessage(
      "Registration successful. Please check your email and click the verification link. You will then be taken to your Rider Dashboard."
    );

    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-gray-50 px-5 py-10">
      <div className="mx-auto max-w-md">

        <div className="mb-8 text-center">
          <p className="font-bold text-green-700">
            MARKETLINK
          </p>

          <h1 className="mt-2 text-4xl font-bold">
            Become a Rider
          </h1>

          <p className="mt-3 text-gray-600">
            Register to receive and deliver MarketLink orders.
          </p>
        </div>

        <div className="rounded-3xl bg-white p-7 shadow-sm">

          <form onSubmit={handleRegister} className="space-y-5">

            <div>
              <label className="mb-2 block font-semibold">
                Full Name
              </label>

              <input
                type="text"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                placeholder="Your full name"
                required
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-green-600"
              />
            </div>

            <div>
              <label className="mb-2 block font-semibold">
                Phone Number
              </label>

              <input
                type="tel"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="08012345678"
                required
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-green-600"
              />
            </div>

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
                placeholder="Create a password"
                minLength={6}
                required
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-green-600"
              />

              <p className="mt-2 text-xs text-gray-500">
                Password must be at least 6 characters.
              </p>
            </div>

            <div>
              <label className="mb-2 block font-semibold">
                Vehicle Type
              </label>

              <select
                value={vehicleType}
                onChange={(event) => setVehicleType(event.target.value)}
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:border-green-600"
              >
                <option value="Motorcycle">Motorcycle</option>
                <option value="Car">Car</option>
                <option value="Van">Van</option>
                <option value="Truck">Truck</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block font-semibold">
                Vehicle Number
              </label>

              <input
                type="text"
                value={vehicleNumber}
                onChange={(event) =>
                  setVehicleNumber(event.target.value.toUpperCase())
                }
                placeholder="ABC-123-XY"
                required
                className="w-full rounded-xl border border-gray-300 px-4 py-3 uppercase outline-none focus:border-green-600"
              />
            </div>

            {message && (
              <div
                className={`rounded-xl p-4 text-sm ${
                  success
                    ? "bg-green-50 text-green-700"
                    : "bg-red-50 text-red-700"
                }`}
              >
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-green-700 px-5 py-3 font-bold text-white hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Creating account..." : "Create Rider Account"}
            </button>

          </form>

          <div className="mt-6 border-t pt-6 text-center">
            <p className="text-sm text-gray-500">
              Already have a rider account?
            </p>

            <button
              type="button"
              onClick={() => router.push("/rider/login")}
              className="mt-2 font-bold text-green-700 hover:underline"
            >
              Log In
            </button>
          </div>

        </div>

      </div>
    </main>
  );
}
