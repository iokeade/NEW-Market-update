"use client";

import { useState } from "react";
import Link from "next/link";
import { states, stateMarkets } from "../data/locations";

export default function SellerPage() {
  const [state, setState] = useState("");
  const [market, setMarket] = useState("");
  const [product, setProduct] = useState("");
  const [category, setCategory] = useState("Food");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState("");

  const markets = state ? stateMarkets[state] || [] : [];

  function publishProduct(e: React.FormEvent) {
    e.preventDefault();

    if (
      !state ||
      !market ||
      !product ||
      !price ||
      !quantity
    ) {
      setMessage("Please fill in all required fields.");
      return;
    }

    const existingProducts = JSON.parse(
      localStorage.getItem("marketlinkProducts") || "[]"
    );

    const newProduct = {
      id: Date.now(),
      product,
      category,
      price: Number(price),
      quantity: Number(quantity),
      state,
      market,
      description,
      seller: "My Store",
      createdAt: new Date().toISOString(),
    };

    localStorage.setItem(
      "marketlinkProducts",
      JSON.stringify([
        newProduct,
        ...existingProducts,
      ])
    );

    setMessage("Product published successfully!");

    setProduct("");
    setPrice("");
    setQuantity("");
    setDescription("");
    setMarket("");
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* NAVBAR */}
      <nav className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link
            href="/"
            className="text-2xl font-bold text-green-600"
          >
            MarketLink
          </Link>

          <div className="flex gap-6">
            <Link href="/" className="text-gray-600">
              Home
            </Link>

            <Link
              href="/marketplace"
              className="text-gray-600"
            >
              Marketplace
            </Link>

            <Link
              href="/seller"
              className="font-semibold text-green-600"
            >
              Sell
            </Link>
          </div>
        </div>
      </nav>

      {/* HEADER */}
      <section className="bg-green-600 px-6 py-12 text-white">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-4xl font-bold">
            Sell on MarketLink
          </h1>

          <p className="mt-3 text-green-100">
            List your products and reach customers across Nigeria.
          </p>
        </div>
      </section>

      {/* FORM */}
      <section className="px-6 py-10">
        <form
          onSubmit={publishProduct}
          className="mx-auto max-w-3xl space-y-6 rounded-2xl bg-white p-8 shadow-sm"
        >
          {/* STATE */}
          <div>
            <label className="mb-2 block font-semibold">
              State *
            </label>

            <select
              value={state}
              onChange={(e) => {
                setState(e.target.value);
                setMarket("");
              }}
              className="w-full rounded-lg border px-4 py-3"
            >
              <option value="">Select State</option>

              {states.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          {/* MARKET */}
          <div>
            <label className="mb-2 block font-semibold">
              Market *
            </label>

            <select
              value={market}
              onChange={(e) => setMarket(e.target.value)}
              disabled={!state}
              className="w-full rounded-lg border px-4 py-3 disabled:bg-gray-100"
            >
              <option value="">
                {state
                  ? "Select Market"
                  : "Select a state first"}
              </option>

              {markets.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          {/* PRODUCT */}
          <div>
            <label className="mb-2 block font-semibold">
              Product Name *
            </label>

            <input
              type="text"
              value={product}
              onChange={(e) => setProduct(e.target.value)}
              placeholder="e.g. Rice 50kg Bag"
              className="w-full rounded-lg border px-4 py-3"
            />
          </div>

          {/* CATEGORY */}
          <div>
            <label className="mb-2 block font-semibold">
              Category
            </label>

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-lg border px-4 py-3"
            >
              <option>Food</option>
              <option>Electronics</option>
              <option>Fashion</option>
              <option>Farm Products</option>
              <option>Vehicles</option>
              <option>Home</option>
              <option>Other</option>
            </select>
          </div>

          {/* PRICE */}
          <div>
            <label className="mb-2 block font-semibold">
              Price (₦) *
            </label>

            <input
              type="number"
              min="0"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="e.g. 72000"
              className="w-full rounded-lg border px-4 py-3"
            />
          </div>

          {/* QUANTITY */}
          <div>
            <label className="mb-2 block font-semibold">
              Quantity Available *
            </label>

            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="e.g. 20"
              className="w-full rounded-lg border px-4 py-3"
            />
          </div>

          {/* DESCRIPTION */}
          <div>
            <label className="mb-2 block font-semibold">
              Description
            </label>

            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your product..."
              rows={5}
              className="w-full rounded-lg border px-4 py-3"
            />
          </div>

          {/* MESSAGE */}
          {message && (
            <div className="rounded-lg bg-green-50 p-4 font-medium text-green-700">
              {message}
            </div>
          )}

          {/* BUTTON */}
          <button
            type="submit"
            className="w-full rounded-xl bg-green-600 py-4 text-lg font-semibold text-white hover:bg-green-700"
          >
            Publish Product
          </button>
        </form>
      </section>
    </main>
  );
}