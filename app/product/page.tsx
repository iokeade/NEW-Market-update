"use client";

import { useState } from "react";

const product = {
  name: "Rice 50kg Bag",
  price: 72000,
  category: "Food",
  market: "Mile 12 Market",
  location: "Ketu, Lagos",
  seller: "John Market Store",
  sellerRating: 4.8,
  quantityAvailable: 20,
  icon: "🍚",
  description:
    "Premium quality Nigerian rice available directly from a seller at Mile 12 Market. Suitable for homes, restaurants, retailers and bulk buyers.",
};

export default function ProductPage() {
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState("");

  const total = product.price * quantity;

  const formatPrice = (price: number) => {
    return `₦${price.toLocaleString("en-NG")}`;
  };

  const increaseQuantity = () => {
    if (quantity < product.quantityAvailable) {
      setQuantity(quantity + 1);
    }
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const addToCart = () => {
    const cartItem = {
      id: 1,
      name: product.name,
      price: product.price,
      quantity,
      seller: product.seller,
      market: product.market,
      icon: product.icon,
    };

    localStorage.setItem(
      "marketlinkCart",
      JSON.stringify([cartItem])
    );

    setMessage(`${quantity} item(s) added to your cart.`);
  };

  const buyNow = () => {
    addToCart();

    setTimeout(() => {
      window.location.href = "/cart";
    }, 300);
  };

  return (
    <main className="min-h-screen bg-[#f7faf8] text-[#10231d]">
      {/* NAVBAR */}

      <nav className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
          <a
            href="/"
            className="flex items-center gap-2"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#087f5b] font-bold text-white">
              M
            </div>

            <div>
              <h1 className="text-xl font-black text-[#087f5b]">
                MarketLink
              </h1>

              <p className="text-[10px] text-gray-500">
                Nigeria&apos;s Marketplace
              </p>
            </div>
          </a>

          <div className="flex items-center gap-3">
            <a
              href="/marketplace"
              className="hidden font-medium hover:text-[#087f5b] sm:block"
            >
              Marketplace
            </a>

            <a
              href="/cart"
              className="rounded-xl border border-gray-200 px-4 py-2 font-semibold"
            >
              🛒 Cart
            </a>
          </div>
        </div>
      </nav>

      {/* BREADCRUMB */}

      <div className="mx-auto max-w-7xl px-5 pt-7">
        <div className="text-sm text-gray-500">
          <a href="/" className="hover:text-[#087f5b]">
            Home
          </a>

          <span className="mx-2">/</span>

          <a
            href="/marketplace"
            className="hover:text-[#087f5b]"
          >
            Marketplace
          </a>

          <span className="mx-2">/</span>

          <span className="text-gray-800">
            {product.name}
          </span>
        </div>
      </div>

      {/* PRODUCT */}

      <section className="mx-auto max-w-7xl px-5 py-8">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* PRODUCT IMAGE */}

          <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white">
            <div className="flex min-h-[400px] items-center justify-center bg-[#e7f7f0] text-[150px]">
              {product.icon}
            </div>
          </div>

          {/* PRODUCT INFORMATION */}

          <div>
            <span className="inline-block rounded-lg bg-[#e7f7f0] px-3 py-1 text-sm font-semibold text-[#087f5b]">
              {product.category}
            </span>

            <h2 className="mt-4 text-4xl font-black sm:text-5xl">
              {product.name}
            </h2>

            <p className="mt-4 text-3xl font-black text-[#087f5b]">
              {formatPrice(product.price)}
            </p>

            <div className="mt-5 space-y-2 text-gray-600">
              <p>📍 {product.location}</p>
              <p>🏪 {product.market}</p>
              <p>
                📦 {product.quantityAvailable} available
              </p>
            </div>

            <div className="my-7 h-px bg-gray-200" />

            {/* DESCRIPTION */}

            <h3 className="text-lg font-bold">
              Product Description
            </h3>

            <p className="mt-3 leading-7 text-gray-600">
              {product.description}
            </p>

            {/* SELLER */}

            <div className="mt-7 rounded-2xl border border-gray-200 bg-white p-5">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#e7f7f0] text-2xl">
                  🏪
                </div>

                <div>
                  <h3 className="font-bold">
                    {product.seller}
                  </h3>

                  <p className="text-sm text-gray-500">
                    ⭐ {product.sellerRating} seller rating
                  </p>
                </div>
              </div>

              <button className="mt-4 w-full rounded-xl border border-[#087f5b] py-3 font-bold text-[#087f5b]">
                View Seller
              </button>
            </div>

            {/* QUANTITY */}

            <div className="mt-7">
              <p className="mb-3 font-bold">
                Quantity
              </p>

              <div className="flex w-fit items-center overflow-hidden rounded-xl border border-gray-300 bg-white">
                <button
                  onClick={decreaseQuantity}
                  className="h-12 w-12 text-xl hover:bg-gray-100"
                >
                  −
                </button>

                <div className="flex h-12 w-14 items-center justify-center border-x border-gray-300 font-bold">
                  {quantity}
                </div>

                <button
                  onClick={increaseQuantity}
                  className="h-12 w-12 text-xl hover:bg-gray-100"
                >
                  +
                </button>
              </div>
            </div>

            {/* TOTAL */}

            <div className="mt-6 rounded-2xl bg-[#e7f7f0] p-5">
              <div className="flex items-center justify-between">
                <span className="font-semibold">
                  Total
                </span>

                <span className="text-2xl font-black text-[#087f5b]">
                  {formatPrice(total)}
                </span>
              </div>
            </div>

            {/* BUTTONS */}

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <button
                onClick={addToCart}
                className="rounded-xl border-2 border-[#087f5b] py-4 font-bold text-[#087f5b] hover:bg-[#e7f7f0]"
              >
                🛒 Add to Cart
              </button>

              <button
                onClick={buyNow}
                className="rounded-xl bg-[#087f5b] py-4 font-bold text-white hover:bg-[#066b4d]"
              >
                Buy Now
              </button>
            </div>

            {/* MESSAGE */}

            {message && (
              <div className="mt-4 rounded-xl bg-green-100 p-4 text-center font-semibold text-green-700">
                ✅ {message}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* DELIVERY */}

      <section className="mx-auto max-w-7xl px-5 pb-16">
        <div className="rounded-3xl bg-[#10231d] p-7 text-white sm:p-10">
          <h2 className="text-2xl font-black">
            🚚 MarketLink Delivery
          </h2>

          <p className="mt-3 max-w-2xl text-gray-300">
            Your order can be picked up from the market by a
            MarketLink rider and delivered to your location.
          </p>

          <div className="mt-7 grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl bg-white/10 p-4">
              <p className="font-bold">1. Order</p>
              <p className="mt-1 text-sm text-gray-400">
                Place your order
              </p>
            </div>

            <div className="rounded-xl bg-white/10 p-4">
              <p className="font-bold">2. Rider Pickup</p>
              <p className="mt-1 text-sm text-gray-400">
                Rider collects your items
              </p>
            </div>

            <div className="rounded-xl bg-white/10 p-4">
              <p className="font-bold">3. Delivery</p>
              <p className="mt-1 text-sm text-gray-400">
                Receive at your doorstep
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}