"use client";

import Link from "next/link";
import { useState } from "react";

export default function HomePage() {
  const [search, setSearch] = useState("");

  const categories = [
    { name: "Food", icon: "🍚" },
    { name: "Electronics", icon: "📱" },
    { name: "Fashion", icon: "👕" },
    { name: "Farm Products", icon: "🌾" },
    { name: "Vehicles", icon: "🚗" },
    { name: "Home", icon: "🏠" },
    { name: "Other", icon: "📦" },
  ];

  const products = [
    {
      id: 1,
      name: "Rice 50kg Bag",
      price: "₦72,000",
      market: "Mile 12 Market",
      state: "Lagos",
      icon: "🍚",
    },
    {
      id: 2,
      name: "Beans 50kg Bag",
      price: "₦65,000",
      market: "Onitsha Main Market",
      state: "Anambra",
      icon: "🫘",
    },
    {
      id: 3,
      name: "Fresh Tomatoes",
      price: "₦18,000",
      market: "Mile 12 Market",
      state: "Lagos",
      icon: "🍅",
    },
    {
      id: 4,
      name: "Smartphone",
      price: "₦350,000",
      market: "Computer Village",
      state: "Lagos",
      icon: "📱",
    },
  ];

  const markets = [
    {
      name: "Mile 12 Market",
      location: "Lagos",
      icon: "🥬",
    },
    {
      name: "Onitsha Main Market",
      location: "Anambra",
      icon: "🏪",
    },
    {
      name: "Ariaria International Market",
      location: "Abia",
      icon: "🛍️",
    },
    {
      name: "Balogun Market",
      location: "Lagos",
      icon: "👗",
    },
    {
      name: "Alaba International Market",
      location: "Lagos",
      icon: "📺",
    },
    {
      name: "Kantin Kwari Market",
      location: "Kano",
      icon: "👕",
    },
  ];

  const handleSearch = () => {
    if (search.trim()) {
      window.location.href =
        `/marketplace?search=${encodeURIComponent(search.trim())}`;
    } else {
      window.location.href = "/marketplace";
    }
  };

  return (
    <main className="min-h-screen bg-white text-gray-900">

      {/* ================= NAVBAR ================= */}

      <header className="sticky top-0 z-50 border-b bg-white shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">

          {/* LOGO */}

          <Link
            href="/"
            className="text-2xl font-extrabold text-green-700"
          >
            MarketLink
          </Link>

          {/* NAVIGATION */}

          <nav className="hidden items-center gap-6 md:flex">
            <Link
              href="/"
              className="font-medium text-green-700"
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
              className="font-medium text-gray-700 hover:text-green-700"
            >
              Sell
            </Link>

            <Link
              href="/orders"
              className="font-medium text-gray-700 hover:text-green-700"
            >
              Orders
            </Link>

            <Link
              href="/cart"
              className="rounded-lg bg-green-700 px-5 py-2 font-semibold text-white hover:bg-green-800"
            >
              Cart
            </Link>
          </nav>

          {/* MOBILE NAV */}

          <div className="flex items-center gap-2 md:hidden">
            <Link
              href="/marketplace"
              className="rounded-lg border px-3 py-2 text-sm"
            >
              Shop
            </Link>

            <Link
              href="/cart"
              className="rounded-lg bg-green-700 px-3 py-2 text-sm font-semibold text-white"
            >
              Cart
            </Link>
          </div>
        </div>
      </header>

      {/* ================= HERO ================= */}

      <section className="bg-gradient-to-br from-green-700 via-green-600 to-green-500">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-20 md:grid-cols-2 md:items-center">

          <div className="text-white">

            <p className="mb-4 font-semibold uppercase tracking-wide text-green-100">
              Nigeria&apos;s Marketplace
            </p>

            <h1 className="text-4xl font-extrabold leading-tight md:text-6xl">
              Buy and sell from any market in Nigeria.
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-8 text-green-50">
              Discover products from sellers across Nigeria, connect with
              local markets, and get your purchases delivered to you.
            </p>

            {/* SEARCH */}

            <div className="mt-8 flex max-w-2xl flex-col gap-3 sm:flex-row">

              <input
                type="text"
                placeholder="Search for products, markets or locations..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSearch();
                  }
                }}
                className="flex-1 rounded-xl border-0 px-5 py-4 text-gray-900 outline-none"
              />

              <button
                onClick={handleSearch}
                className="rounded-xl bg-white px-7 py-4 font-bold text-green-700 hover:bg-gray-100"
              >
                Search
              </button>

            </div>

            <div className="mt-6 flex flex-wrap gap-3">

              <Link
                href="/marketplace"
                className="rounded-xl bg-white px-6 py-3 font-bold text-green-700 hover:bg-gray-100"
              >
                Browse Marketplace
              </Link>

              <Link
                href="/seller"
                className="rounded-xl border border-white px-6 py-3 font-bold text-white hover:bg-white hover:text-green-700"
              >
                Start Selling
              </Link>

            </div>
          </div>

          {/* HERO CARD */}

          <div className="hidden md:block">
            <div className="rounded-3xl bg-white p-6 shadow-2xl">

              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">
                    Popular today
                  </p>

                  <h2 className="text-xl font-bold">
                    Fresh Market Deals
                  </h2>
                </div>

                <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-700">
                  LIVE
                </span>
              </div>

              <div className="space-y-4">

                {products.slice(0, 3).map((product) => (
                  <Link
                    key={product.id}
                    href={`/product?id=${product.id}`}
                    className="flex items-center gap-4 rounded-2xl border p-4 transition hover:bg-gray-50"
                  >

                    <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-green-50 text-4xl">
                      {product.icon}
                    </div>

                    <div className="flex-1">
                      <h3 className="font-bold">
                        {product.name}
                      </h3>

                      <p className="text-sm text-gray-500">
                        {product.market}
                      </p>
                    </div>

                    <p className="font-bold text-green-700">
                      {product.price}
                    </p>

                  </Link>
                ))}

              </div>

            </div>
          </div>

        </div>
      </section>

      {/* ================= CATEGORIES ================= */}

      <section className="mx-auto max-w-7xl px-4 py-16">

        <div className="mb-8 flex items-end justify-between">

          <div>
            <p className="font-semibold text-green-700">
              SHOP BY CATEGORY
            </p>

            <h2 className="mt-2 text-3xl font-extrabold">
              What are you looking for?
            </h2>
          </div>

          <Link
            href="/marketplace"
            className="hidden font-semibold text-green-700 sm:block"
          >
            View all →
          </Link>

        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 md:grid-cols-7">

          {categories.map((category) => (
            <Link
              key={category.name}
              href={`/marketplace?category=${encodeURIComponent(
                category.name
              )}`}
              className="rounded-2xl border bg-white p-5 text-center shadow-sm transition hover:-translate-y-1 hover:border-green-500 hover:shadow-md"
            >

              <div className="text-4xl">
                {category.icon}
              </div>

              <p className="mt-3 text-sm font-semibold">
                {category.name}
              </p>

            </Link>
          ))}

        </div>

      </section>

      {/* ================= POPULAR PRODUCTS ================= */}

      <section className="bg-gray-50 py-16">

        <div className="mx-auto max-w-7xl px-4">

          <div className="mb-8 flex items-end justify-between">

            <div>
              <p className="font-semibold text-green-700">
                POPULAR PRODUCTS
              </p>

              <h2 className="mt-2 text-3xl font-extrabold">
                Deals from Nigerian markets
              </h2>
            </div>

            <Link
              href="/marketplace"
              className="font-semibold text-green-700"
            >
              See all →
            </Link>

          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">

            {products.map((product) => (
              <Link
                key={product.id}
                href={`/product?id=${product.id}`}
                className="overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >

                <div className="flex h-48 items-center justify-center bg-green-50 text-7xl">
                  {product.icon}
                </div>

                <div className="p-5">

                  <p className="text-sm text-gray-500">
                    {product.category || "Marketplace"}
                  </p>

                  <h3 className="mt-1 text-lg font-bold">
                    {product.name}
                  </h3>

                  <p className="mt-2 text-xl font-extrabold text-green-700">
                    {product.price}
                  </p>

                  <p className="mt-2 text-sm text-gray-500">
                    📍 {product.market}, {product.state}
                  </p>

                </div>

              </Link>
            ))}

          </div>

        </div>

      </section>

      {/* ================= MARKETS ================= */}

      <section className="mx-auto max-w-7xl px-4 py-16">

        <div className="mb-8">

          <p className="font-semibold text-green-700">
            EXPLORE NIGERIAN MARKETS
          </p>

          <h2 className="mt-2 text-3xl font-extrabold">
            Find sellers near you
          </h2>

          <p className="mt-3 max-w-2xl text-gray-600">
            Explore products from major markets across different states
            and connect directly with sellers.
          </p>

        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

          {markets.map((market) => (
            <Link
              key={market.name}
              href={`/marketplace?state=${encodeURIComponent(
                market.location
              )}&market=${encodeURIComponent(market.name)}`}
              className="flex items-center gap-4 rounded-2xl border bg-white p-5 shadow-sm transition hover:border-green-500 hover:shadow-md"
            >

              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-green-50 text-3xl">
                {market.icon}
              </div>

              <div>
                <h3 className="font-bold">
                  {market.name}
                </h3>

                <p className="text-sm text-gray-500">
                  📍 {market.location}
                </p>
              </div>

            </Link>
          ))}

        </div>

      </section>

      {/* ================= AI VOICE MARKET ================= */}

      <section className="bg-gray-900 py-20 text-white">

        <div className="mx-auto grid max-w-7xl gap-12 px-4 md:grid-cols-2 md:items-center">

          <div>

            <span className="rounded-full bg-green-600 px-4 py-2 text-sm font-bold">
              AI VOICE MARKET
            </span>

            <h2 className="mt-6 text-4xl font-extrabold">
              Sell by simply speaking.
            </h2>

            <p className="mt-5 text-lg leading-8 text-gray-300">
              MarketLink will allow sellers to describe their products
              using their voice in Yoruba, Hausa, Igbo or Nigerian English.
            </p>

            <div className="mt-6 rounded-2xl border border-gray-700 bg-gray-800 p-5">

              <p className="text-sm text-gray-400">
                Example
              </p>

              <p className="mt-3 text-lg font-semibold">
                &quot;I get 10 bags rice today 82k.&quot;
              </p>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">

                <div className="rounded-xl bg-gray-700 p-3">
                  <p className="text-xs text-gray-400">
                    PRODUCT
                  </p>
                  <p className="font-bold">
                    Rice
                  </p>
                </div>

                <div className="rounded-xl bg-gray-700 p-3">
                  <p className="text-xs text-gray-400">
                    QUANTITY
                  </p>
                  <p className="font-bold">
                    10 bags
                  </p>
                </div>

                <div className="rounded-xl bg-gray-700 p-3">
                  <p className="text-xs text-gray-400">
                    PRICE
                  </p>
                  <p className="font-bold">
                    ₦82,000
                  </p>
                </div>

                <div className="rounded-xl bg-gray-700 p-3">
                  <p className="text-xs text-gray-400">
                    STATUS
                  </p>
                  <p className="font-bold text-green-400">
                    Ready to confirm
                  </p>
                </div>

              </div>

            </div>

          </div>

          <div className="rounded-3xl bg-gradient-to-br from-green-600 to-green-800 p-8 shadow-2xl">

            <div className="text-center">

              <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-white text-5xl">
                🎙️
              </div>

              <h3 className="mt-6 text-2xl font-bold">
                Voice-powered selling
              </h3>

              <p className="mt-3 text-green-100">
                Speak your product details and let MarketLink structure
                the listing for you.
              </p>

              <Link
                href="/seller"
                className="mt-8 inline-block rounded-xl bg-white px-7 py-3 font-bold text-green-700 hover:bg-gray-100"
              >
                Start Selling
              </Link>

            </div>

          </div>

        </div>

      </section>

      {/* ================= DELIVERY ================= */}

      <section className="mx-auto max-w-7xl px-4 py-20">

        <div className="grid gap-10 md:grid-cols-2 md:items-center">

          <div>

            <p className="font-semibold text-green-700">
              DELIVERY & TRACKING
            </p>

            <h2 className="mt-3 text-4xl font-extrabold">
              Know where your order is.
            </h2>

            <p className="mt-5 leading-8 text-gray-600">
              From the moment you place your order to the moment it
              reaches your doorstep, MarketLink keeps you informed.
            </p>

            <div className="mt-8 space-y-5">

              <div className="flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-100 font-bold text-green-700">
                  1
                </div>

                <div>
                  <h3 className="font-bold">
                    Order Confirmed
                  </h3>

                  <p className="text-sm text-gray-500">
                    Seller receives your order.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-100 font-bold text-green-700">
                  2
                </div>

                <div>
                  <h3 className="font-bold">
                    Order Picked
                  </h3>

                  <p className="text-sm text-gray-500">
                    A rider collects your order from the seller.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-100 font-bold text-green-700">
                  3
                </div>

                <div>
                  <h3 className="font-bold">
                    Delivered
                  </h3>

                  <p className="text-sm text-gray-500">
                    Your order arrives at your location.
                  </p>
                </div>
              </div>

            </div>

            <Link
              href="/orders"
              className="mt-8 inline-block rounded-xl bg-green-700 px-6 py-3 font-bold text-white hover:bg-green-800"
            >
              View My Orders
            </Link>

          </div>

          <div className="rounded-3xl border bg-gray-50 p-8">

            <div className="rounded-2xl bg-white p-6 shadow-sm">

              <div className="flex items-center justify-between">

                <div>
                  <p className="text-sm text-gray-500">
                    Tracking ID
                  </p>

                  <p className="text-xl font-extrabold">
                    MLK-NG-123456
                  </p>
                </div>

                <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-bold text-green-700">
                  In Transit
                </span>

              </div>

              <div className="mt-8">

                <div className="relative h-2 rounded-full bg-gray-200">

                  <div className="h-2 w-2/3 rounded-full bg-green-600" />

                </div>

                <div className="mt-4 flex justify-between text-xs text-gray-500">

                  <span>Ordered</span>
                  <span>Confirmed</span>
                  <span>Picked</span>
                  <span>Delivered</span>

                </div>

              </div>

              <div className="mt-8 rounded-2xl bg-green-50 p-5">

                <p className="text-sm text-gray-500">
                  Current location
                </p>

                <p className="mt-1 font-bold text-green-800">
                  🚚 Rider is on the way
                </p>

              </div>

            </div>

          </div>

        </div>

      </section>

      {/* ================= USER TYPES ================= */}

      <section className="bg-gray-50 py-20">

        <div className="mx-auto max-w-7xl px-4">

          <div className="mx-auto max-w-2xl text-center">

            <p className="font-semibold text-green-700">
              BUILT FOR EVERYONE
            </p>

            <h2 className="mt-3 text-4xl font-extrabold">
              One marketplace. Everyone connected.
            </h2>

          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">

            {/* SELLER */}

            <div className="rounded-3xl border bg-white p-7 shadow-sm">

              <div className="text-5xl">
                🏪
              </div>

              <h3 className="mt-5 text-2xl font-bold">
                Sellers
              </h3>

              <p className="mt-3 leading-7 text-gray-600">
                List your products, reach customers outside your local
                market and grow your business.
              </p>

              <Link
                href="/seller"
                className="mt-6 inline-block font-bold text-green-700"
              >
                Start selling →
              </Link>

            </div>

            {/* CUSTOMER */}

            <div className="rounded-3xl border bg-white p-7 shadow-sm">

              <div className="text-5xl">
                🛒
              </div>

              <h3 className="mt-5 text-2xl font-bold">
                Customers
              </h3>

              <p className="mt-3 leading-7 text-gray-600">
                Discover products from markets across Nigeria and
                order directly from sellers.
              </p>

              <Link
                href="/marketplace"
                className="mt-6 inline-block font-bold text-green-700"
              >
                Start shopping →
              </Link>

            </div>

            {/* RIDER */}

            <div className="rounded-3xl border bg-white p-7 shadow-sm">

              <div className="text-5xl">
                🛵
              </div>

              <h3 className="mt-5 text-2xl font-bold">
                Riders
              </h3>

              <p className="mt-3 leading-7 text-gray-600">
                Help sellers deliver products to customers and earn
                from deliveries.
              </p>

              <Link
                href="/rider"
                className="mt-6 inline-block font-bold text-green-700"
              >
                Become a rider →
              </Link>

            </div>

          </div>

        </div>

      </section>

      {/* ================= CALL TO ACTION ================= */}

      <section className="bg-green-700 py-20 text-white">

        <div className="mx-auto max-w-4xl px-4 text-center">

          <h2 className="text-4xl font-extrabold md:text-5xl">
            Your market is now online.
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-lg text-green-100">
            Whether you are buying, selling or delivering, MarketLink
            connects Nigerian markets with customers everywhere.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">

            <Link
              href="/marketplace"
              className="rounded-xl bg-white px-8 py-4 font-bold text-green-700 hover:bg-gray-100"
            >
              Browse Marketplace
            </Link>

            <Link
              href="/seller"
              className="rounded-xl border border-white px-8 py-4 font-bold text-white hover:bg-white hover:text-green-700"
            >
              Sell on MarketLink
            </Link>

          </div>

        </div>

      </section>

      {/* ================= FOOTER ================= */}

      <footer className="bg-gray-950 text-white">

        <div className="mx-auto max-w-7xl px-4 py-14">

          <div className="grid gap-10 md:grid-cols-4">

            <div>

              <Link
                href="/"
                className="text-2xl font-extrabold text-green-500"
              >
                MarketLink
              </Link>

              <p className="mt-4 leading-7 text-gray-400">
                Connecting Nigerian markets, sellers, customers and
                riders in one marketplace.
              </p>

            </div>

            <div>

              <h3 className="font-bold">
                Marketplace
              </h3>

              <div className="mt-4 space-y-3 text-gray-400">

                <Link
                  href="/marketplace"
                  className="block hover:text-white"
                >
                  Browse Products
                </Link>

                <Link
                  href="/cart"
                  className="block hover:text-white"
                >
                  Cart
                </Link>

                <Link
                  href="/orders"
                  className="block hover:text-white"
                >
                  Orders
                </Link>

              </div>

            </div>

            <div>

              <h3 className="font-bold">
                Sell
              </h3>

              <div className="mt-4 space-y-3 text-gray-400">

                <Link
                  href="/seller"
                  className="block hover:text-white"
                >
                  Sell a Product
                </Link>

                <Link
                  href="/seller"
                  className="block hover:text-white"
                >
                  Seller Dashboard
                </Link>

              </div>

            </div>

            <div>

              <h3 className="font-bold">
                Account
              </h3>

              <div className="mt-4 space-y-3 text-gray-400">

                <Link
                  href="/orders"
                  className="block hover:text-white"
                >
                  My Orders
                </Link>

                <Link
                  href="/cart"
                  className="block hover:text-white"
                >
                  My Cart
                </Link>

                <Link
                  href="/"
                  className="block hover:text-white"
                >
                  Home
                </Link>

              </div>

            </div>

          </div>

          <div className="mt-12 border-t border-gray-800 pt-6 text-center text-sm text-gray-500">
            © {new Date().getFullYear()} MarketLink. All rights reserved.
          </div>

        </div>

      </footer>

    </main>
  );
}