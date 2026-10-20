"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type CartItem = {
  id: number;
  name: string;
  price: number;
  quantity: number;
  state?: string;
  market?: string;
  seller?: string;
  icon?: string;
};

export default function CartPage() {
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    const savedCart = JSON.parse(
      localStorage.getItem("marketlinkCart") || "[]"
    );

    setCart(savedCart);
  }, []);

  const saveCart = (updatedCart: CartItem[]) => {
    setCart(updatedCart);
    localStorage.setItem(
      "marketlinkCart",
      JSON.stringify(updatedCart)
    );
  };

  const increaseQuantity = (id: number) => {
    const updatedCart = cart.map((item) =>
      item.id === id
        ? {
            ...item,
            quantity: item.quantity + 1,
          }
        : item
    );

    saveCart(updatedCart);
  };

  const decreaseQuantity = (id: number) => {
    const updatedCart = cart
      .map((item) =>
        item.id === id
          ? {
              ...item,
              quantity: item.quantity - 1,
            }
          : item
      )
      .filter((item) => item.quantity > 0);

    saveCart(updatedCart);
  };

  const removeItem = (id: number) => {
    const updatedCart = cart.filter(
      (item) => item.id !== id
    );

    saveCart(updatedCart);
  };

  const subtotal = cart.reduce(
    (total, item) =>
      total + item.price * item.quantity,
    0
  );

  const deliveryFee = cart.length > 0 ? 3000 : 0;

  const total = subtotal + deliveryFee;

  return (
    <main className="min-h-screen bg-gray-50">

      {/* NAVBAR */}

      <header className="sticky top-0 z-50 border-b bg-white shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">

          <Link
            href="/"
            className="text-2xl font-extrabold text-green-700"
          >
            MarketLink
          </Link>

          <nav className="flex items-center gap-3 sm:gap-6">

            <Link
              href="/"
              className="hidden font-medium text-gray-700 hover:text-green-700 sm:block"
            >
              Home
            </Link>

            <Link
              href="/marketplace"
              className="font-medium text-gray-700 hover:text-green-700"
            >
              Marketplace
            </Link>

            <Link
              href="/seller"
              className="hidden font-medium text-gray-700 hover:text-green-700 sm:block"
            >
              Sell
            </Link>

          </nav>

        </div>
      </header>

      {/* CONTENT */}

      <div className="mx-auto max-w-6xl px-4 py-10">

        <div className="mb-8">

          <Link
            href="/"
            className="text-sm font-semibold text-green-700"
          >
            ← Back to Home
          </Link>

          <h1 className="mt-4 text-4xl font-extrabold">
            Shopping Cart
          </h1>

          <p className="mt-2 text-gray-600">
            Review your products before checkout.
          </p>

        </div>

        {/* EMPTY CART */}

        {cart.length === 0 ? (

          <div className="rounded-3xl border bg-white p-12 text-center shadow-sm">

            <div className="text-7xl">
              🛒
            </div>

            <h2 className="mt-6 text-2xl font-bold">
              Your cart is empty
            </h2>

            <p className="mt-3 text-gray-500">
              Browse the marketplace and add products to your cart.
            </p>

            <Link
              href="/marketplace"
              className="mt-7 inline-block rounded-xl bg-green-700 px-7 py-3 font-bold text-white hover:bg-green-800"
            >
              Browse Marketplace
            </Link>

          </div>

        ) : (

          <div className="grid gap-8 lg:grid-cols-3">

            {/* CART ITEMS */}

            <div className="space-y-5 lg:col-span-2">

              {cart.map((item) => (

                <div
                  key={item.id}
                  className="rounded-2xl border bg-white p-5 shadow-sm"
                >

                  <div className="flex gap-5">

                    {/* PRODUCT ICON */}

                    <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl bg-green-50 text-5xl">
                      {item.icon || "📦"}
                    </div>

                    {/* PRODUCT INFO */}

                    <div className="flex-1">

                      <div className="flex items-start justify-between gap-4">

                        <div>

                          <h2 className="text-xl font-bold">
                            {item.name}
                          </h2>

                          {item.market && (
                            <p className="mt-1 text-sm text-gray-500">
                              📍 {item.market}
                              {item.state
                                ? `, ${item.state}`
                                : ""}
                            </p>
                          )}

                          {item.seller && (
                            <p className="mt-1 text-sm text-gray-500">
                              Seller: {item.seller}
                            </p>
                          )}

                        </div>

                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-sm font-semibold text-red-600 hover:text-red-800"
                        >
                          Remove
                        </button>

                      </div>

                      <div className="mt-5 flex flex-wrap items-center justify-between gap-4">

                        <p className="text-xl font-extrabold text-green-700">
                          ₦{item.price.toLocaleString()}
                        </p>

                        {/* QUANTITY */}

                        <div className="flex items-center rounded-xl border">

                          <button
                            onClick={() =>
                              decreaseQuantity(item.id)
                            }
                            className="px-4 py-2 text-xl font-bold hover:bg-gray-100"
                          >
                            −
                          </button>

                          <span className="min-w-12 text-center font-bold">
                            {item.quantity}
                          </span>

                          <button
                            onClick={() =>
                              increaseQuantity(item.id)
                            }
                            className="px-4 py-2 text-xl font-bold hover:bg-gray-100"
                          >
                            +
                          </button>

                        </div>

                      </div>

                    </div>

                  </div>

                </div>

              ))}

            </div>

            {/* ORDER SUMMARY */}

            <div className="h-fit rounded-2xl border bg-white p-6 shadow-sm">

              <h2 className="text-xl font-bold">
                Order Summary
              </h2>

              <div className="mt-6 space-y-4">

                <div className="flex justify-between">
                  <span className="text-gray-600">
                    Subtotal
                  </span>

                  <span className="font-semibold">
                    ₦{subtotal.toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">
                    Delivery
                  </span>

                  <span className="font-semibold">
                    ₦{deliveryFee.toLocaleString()}
                  </span>
                </div>

                <div className="border-t pt-4">

                  <div className="flex justify-between">

                    <span className="text-lg font-bold">
                      Total
                    </span>

                    <span className="text-2xl font-extrabold text-green-700">
                      ₦{total.toLocaleString()}
                    </span>

                  </div>

                </div>

              </div>

              <Link
                href="/checkout"
                className="mt-7 block rounded-xl bg-green-700 px-5 py-4 text-center font-bold text-white hover:bg-green-800"
              >
                Proceed to Checkout
              </Link>

              <Link
                href="/marketplace"
                className="mt-3 block text-center font-semibold text-green-700"
              >
                Continue Shopping
              </Link>

            </div>

          </div>

        )}

      </div>

    </main>
  );
}