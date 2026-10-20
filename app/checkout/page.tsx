"use client";

import { useState } from "react";

type LocationData = {
  latitude: number;
  longitude: number;
  state: string;
  lga: string;
  town: string;
  area: string;
  address: string;
  landmark: string;
  displayName: string;
};

export default function CheckoutPage() {
  const [isPaying, setIsPaying] = useState(false);

  const [locationLoading, setLocationLoading] = useState(false);
  const [locationMessage, setLocationMessage] = useState("");
  const [locationError, setLocationError] = useState("");

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const [state, setState] = useState("");
  const [lga, setLga] = useState("");
  const [town, setTown] = useState("");
  const [area, setArea] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [landmark, setLandmark] = useState("");
  const [instructions, setInstructions] = useState("");

  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);

  const [deliveryType, setDeliveryType] = useState("standard");

  const subtotal = 72000;
  const standardDeliveryFee = 3000;
  const expressDeliveryFee = 5000;

  const deliveryFee =
    deliveryType === "express"
      ? expressDeliveryFee
      : standardDeliveryFee;

  const total = subtotal + deliveryFee;

  async function handleUseCurrentLocation() {
    setLocationLoading(true);
    setLocationMessage("");
    setLocationError("");

    if (!navigator.geolocation) {
      setLocationError(
        "Your browser does not support location services."
      );
      setLocationLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        setLatitude(lat);
        setLongitude(lon);

        setLocationMessage("Location found. Getting address...");

        try {
          const response = await fetch(
            `/api/reverse-geocode?lat=${encodeURIComponent(
              lat
            )}&lon=${encodeURIComponent(lon)}`
          );

          const data = await response.json();

          if (!response.ok || !data.success) {
            throw new Error(
              data.message || "Could not get address."
            );
          }

          const location: LocationData = data.location;

          setState(location.state || "");
          setLga(location.lga || "");
          setTown(location.town || "");
          setArea(location.area || "");
          setDeliveryAddress(location.address || "");
          setLandmark(location.landmark || "");

          setLocationMessage(
            "Your location has been added. Please check the details before continuing."
          );
        } catch (error) {
          console.error(error);

          setDeliveryAddress(
            `GPS Location: ${lat.toFixed(6)}, ${lon.toFixed(6)}`
          );

          setLocationError(
            "GPS location was found, but we could not convert it to a full address. Please enter your address manually."
          );
        } finally {
          setLocationLoading(false);
        }
      },
      (error) => {
        console.error("Geolocation error:", error);

        if (error.code === error.PERMISSION_DENIED) {
          setLocationError(
            "Location permission was denied. Please allow location access in your browser settings."
          );
        } else if (
          error.code === error.POSITION_UNAVAILABLE
        ) {
          setLocationError(
            "Your current location could not be determined."
          );
        } else if (error.code === error.TIMEOUT) {
          setLocationError(
            "Location request timed out. Please try again."
          );
        } else {
          setLocationError(
            "Could not get your current location."
          );
        }

        setLocationLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  }

  async function handlePayment() {
    if (!fullName.trim()) {
      alert("Please enter your full name.");
      return;
    }

    if (!phone.trim()) {
      alert("Please enter your phone number.");
      return;
    }

    if (!email.trim()) {
      alert("Please enter your email address.");
      return;
    }

    if (!state.trim()) {
      alert("Please enter your state.");
      return;
    }

    if (!lga.trim()) {
      alert("Please enter your LGA.");
      return;
    }

    if (!deliveryAddress.trim()) {
      alert("Please enter your delivery address.");
      return;
    }

    setIsPaying(true);

    try {
      const response = await fetch(
        "/api/payment/initialize",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            amount: total,

            customer: {
              fullName,
              phone,
              email,
            },

            delivery: {
              state,
              lga,
              town,
              area,
              address: deliveryAddress,
              landmark,
              instructions,
            },

            location: {
              latitude,
              longitude,
            },

            deliveryType,
            deliveryFee,
            subtotal,
            total,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to initialize payment."
        );
      }

      if (!data.accessCode) {
        throw new Error(
          "Payment access code was not returned."
        );
      }

      /*
       * Paystack must be loaded inside the browser.
       * Do NOT import @paystack/inline-js at the top
       * of this file because it uses window.
       */
      const { default: PaystackPop } =
        await import("@paystack/inline-js");

      const paystack = new PaystackPop();

      paystack.resumeTransaction(
        data.accessCode
      );
    } catch (error) {
      console.error("Payment error:", error);

      alert(
        error instanceof Error
          ? error.message
          : "Payment could not be started."
      );
    } finally {
      setIsPaying(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Checkout
          </h1>

          <p className="mt-2 text-gray-600">
            Complete your delivery information and
            payment.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* LEFT SIDE */}
          <section className="space-y-6 lg:col-span-2">
            {/* CUSTOMER INFORMATION */}
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <h2 className="mb-5 text-xl font-bold text-gray-900">
                Customer Information
              </h2>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Full Name
                  </label>

                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) =>
                      setFullName(e.target.value)
                    }
                    placeholder="Enter your full name"
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-green-600"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Phone Number
                  </label>

                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) =>
                      setPhone(e.target.value)
                    }
                    placeholder="08012345678"
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-green-600"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Email Address
                  </label>

                  <input
                    id="customer-email"
                    type="email"
                    value={email}
                    onChange={(e) =>
                      setEmail(e.target.value)
                    }
                    placeholder="you@example.com"
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-green-600"
                  />
                </div>
              </div>
            </div>

            {/* DELIVERY LOCATION */}
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Delivery Location
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Enter your location or use your
                    current GPS location.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleUseCurrentLocation}
                  disabled={locationLoading}
                  className="rounded-xl border border-green-600 bg-green-50 px-5 py-3 font-semibold text-green-700 transition hover:bg-green-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {locationLoading
                    ? "📍 Finding Location..."
                    : "📍 Use My Current Location"}
                </button>
              </div>

              {locationMessage && (
                <div className="mt-4 rounded-xl bg-green-50 p-4 text-sm text-green-700">
                  {locationMessage}
                </div>
              )}

              {locationError && (
                <div className="mt-4 rounded-xl bg-red-50 p-4 text-sm text-red-700">
                  {locationError}
                </div>
              )}

              {latitude !== null &&
                longitude !== null && (
                  <div className="mt-4 rounded-xl bg-gray-50 p-4 text-sm text-gray-600">
                    <strong>GPS Coordinates:</strong>{" "}
                    {latitude.toFixed(6)},{" "}
                    {longitude.toFixed(6)}
                  </div>
                )}

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {/* STATE */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    State
                  </label>

                  <input
                    type="text"
                    value={state}
                    onChange={(e) =>
                      setState(e.target.value)
                    }
                    placeholder="e.g. Lagos"
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-green-600"
                  />
                </div>

                {/* LGA */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    LGA
                  </label>

                  <input
                    type="text"
                    value={lga}
                    onChange={(e) =>
                      setLga(e.target.value)
                    }
                    placeholder="e.g. Kosofe"
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-green-600"
                  />
                </div>

                {/* TOWN */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Town / City
                  </label>

                  <input
                    type="text"
                    value={town}
                    onChange={(e) =>
                      setTown(e.target.value)
                    }
                    placeholder="e.g. Lagos"
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-green-600"
                  />
                </div>

                {/* AREA */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Area
                  </label>

                  <input
                    type="text"
                    value={area}
                    onChange={(e) =>
                      setArea(e.target.value)
                    }
                    placeholder="e.g. Ketu"
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-green-600"
                  />
                </div>

                {/* ADDRESS */}
                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Delivery Address
                  </label>

                  <textarea
                    value={deliveryAddress}
                    onChange={(e) =>
                      setDeliveryAddress(
                        e.target.value
                      )
                    }
                    placeholder="House number, street and detailed address"
                    rows={3}
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-green-600"
                  />
                </div>

                {/* LANDMARK */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Landmark
                  </label>

                  <input
                    type="text"
                    value={landmark}
                    onChange={(e) =>
                      setLandmark(e.target.value)
                    }
                    placeholder="e.g. Near Ketu Bus Stop"
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-green-600"
                  />
                </div>

                {/* INSTRUCTIONS */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Delivery Instructions
                  </label>

                  <input
                    type="text"
                    value={instructions}
                    onChange={(e) =>
                      setInstructions(e.target.value)
                    }
                    placeholder="Any special instructions?"
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-green-600"
                  />
                </div>
              </div>
            </div>

            {/* DELIVERY TYPE */}
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <h2 className="mb-5 text-xl font-bold text-gray-900">
                Delivery Method
              </h2>

              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() =>
                    setDeliveryType("standard")
                  }
                  className={`w-full rounded-xl border p-4 text-left ${
                    deliveryType === "standard"
                      ? "border-green-600 bg-green-50"
                      : "border-gray-200 bg-white"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-gray-900">
                        Standard Delivery
                      </p>

                      <p className="mt-1 text-sm text-gray-500">
                        Regular delivery service
                      </p>
                    </div>

                    <span className="font-bold text-gray-900">
                      ₦3,000
                    </span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setDeliveryType("express")
                  }
                  className={`w-full rounded-xl border p-4 text-left ${
                    deliveryType === "express"
                      ? "border-green-600 bg-green-50"
                      : "border-gray-200 bg-white"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-gray-900">
                        Express Delivery
                      </p>

                      <p className="mt-1 text-sm text-gray-500">
                        Faster delivery service
                      </p>
                    </div>

                    <span className="font-bold text-gray-900">
                      ₦5,000
                    </span>
                  </div>
                </button>
              </div>
            </div>

            {/* PAYMENT */}
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <h2 className="mb-5 text-xl font-bold text-gray-900">
                Payment
              </h2>

              <div className="rounded-xl border border-gray-200 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-xl">
                    💳
                  </div>

                  <div>
                    <p className="font-bold text-gray-900">
                      Paystack
                    </p>

                    <p className="text-sm text-gray-500">
                      Pay securely with card, bank transfer
                      or other supported methods.
                    </p>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handlePayment}
                disabled={isPaying}
                className="mt-6 w-full rounded-xl bg-green-600 px-6 py-4 text-lg font-bold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isPaying
                  ? "Processing Payment..."
                  : `Pay ₦${total.toLocaleString()}`}
              </button>
            </div>
          </section>

          {/* ORDER SUMMARY */}
          <aside className="h-fit rounded-2xl bg-white p-6 shadow-sm lg:sticky lg:top-6">
            <h2 className="mb-6 text-xl font-bold text-gray-900">
              Order Summary
            </h2>

            <div className="rounded-xl bg-gray-50 p-4">
              <div className="flex gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-green-100 text-3xl">
                  🍚
                </div>

                <div className="flex-1">
                  <p className="font-bold text-gray-900">
                    Rice 50kg Bag
                  </p>

                  <p className="mt-1 text-sm text-gray-500">
                    Quantity: 1
                  </p>

                  <p className="mt-2 font-semibold text-gray-900">
                    ₦72,000
                  </p>
                </div>
              </div>
            </div>

            <div className="my-6 border-t border-gray-200" />

            <div className="space-y-4">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>
                  ₦{subtotal.toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between text-gray-600">
                <span>Delivery</span>
                <span>
                  ₦{deliveryFee.toLocaleString()}
                </span>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <div className="flex justify-between text-xl font-bold text-gray-900">
                  <span>Total</span>
                  <span>
                    ₦{total.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-xl bg-green-50 p-4">
              <p className="text-sm font-semibold text-green-800">
                🔒 Secure Checkout
              </p>

              <p className="mt-1 text-xs text-green-700">
                Your payment is processed securely through
                Paystack.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}