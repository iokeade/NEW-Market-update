"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const states = [
  "All States",
  "Abia",
  "Adamawa",
  "Akwa Ibom",
  "Anambra",
  "Bauchi",
  "Bayelsa",
  "Benue",
  "Borno",
  "Cross River",
  "Delta",
  "Ebonyi",
  "Edo",
  "Ekiti",
  "Enugu",
  "Gombe",
  "Imo",
  "Jigawa",
  "Kaduna",
  "Kano",
  "Katsina",
  "Kebbi",
  "Kogi",
  "Kwara",
  "Lagos",
  "Nasarawa",
  "Niger",
  "Ogun",
  "Ondo",
  "Osun",
  "Oyo",
  "Plateau",
  "Rivers",
  "Sokoto",
  "Taraba",
  "Yobe",
  "Zamfara",
  "Federal Capital Territory",
];

const sampleProducts = [
  {
    id: 1,
    name: "Rice 50kg Bag",
    price: 72000,
    category: "Food",
    state: "Lagos",
    market: "Mile 12 Market",
    seller: "John Market Store",
    icon: "🍚",
  },
  {
    id: 2,
    name: "Beans 50kg Bag",
    price: 65000,
    category: "Food",
    state: "Anambra",
    market: "Onitsha Main Market",
    seller: "Onitsha Food Store",
    icon: "🫘",
  },
  {
    id: 3,
    name: "Fresh Tomatoes",
    price: 18000,
    category: "Farm Products",
    state: "Lagos",
    market: "Mile 12 Market",
    seller: "Fresh Farm Produce",
    icon: "🍅",
  },
  {
    id: 4,
    name: "Smartphone",
    price: 350000,
    category: "Electronics",
    state: "Lagos",
    market: "Computer Village",
    seller: "Mary Electronics",
    icon: "📱",
  },
  {
    id: 5,
    name: "Men's T-Shirt",
    price: 15000,
    category: "Fashion",
    state: "Abia",
    market: "Ariaria International Market",
    seller: "Aba Fashion Store",
    icon: "👕",
  },
  {
    id: 6,
    name: "Sneakers",
    price: 45000,
    category: "Fashion",
    state: "Lagos",
    market: "Balogun Market",
    seller: "Lagos Footwear",
    icon: "👟",
  },
  {
    id: 7,
    name: "Kitchen Set",
    price: 35000,
    category: "Home",
    state: "Lagos",
    market: "Balogun Market",
    seller: "Home Store",
    icon: "🏠",
  },
  {
    id: 8,
    name: "Farm Fertilizer",
    price: 28000,
    category: "Farm Products",
    state: "Kaduna",
    market: "Kaduna Central Market",
    seller: "Kaduna Agro Store",
    icon: "🌾",
  },
];

export default function MarketplacePage() {
  const [products, setProducts] = useState(sampleProducts);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All Categories");
  const [state, setState] = useState("All States");
  const [sort, setSort] = useState("Newest");

  useEffect(() => {
    const savedProducts = JSON.parse(
      localStorage.getItem("marketlinkProducts") || "[]"
    );

    if (savedProducts.length > 0) {
      const sellerProducts = savedProducts.map((product: any) => ({
        ...product,
        name: product.product,
        icon: getCategoryIcon(product.category),
      }));

      setProducts([...sellerProducts, ...sampleProducts]);
    }
  }, []);

  function getCategoryIcon(category: string) {
    switch (category) {
      case "Food":
        return "🍚";

      case "Electronics":
        return "📱";

      case "Fashion":
        return "👕";

      case "Farm Products":
        return "🌾";

      case "Vehicles":
        return "🚗";

      case "Home":
        return "🏠";

      default:
        return "📦";
    }
  }

  const filteredProducts = products
    .filter((product) => {
      const matchesSearch =
        product.name
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        product.market
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        product.seller
          .toLowerCase()
          .includes(search.toLowerCase());

      const matchesCategory =
        category === "All Categories" ||
        product.category === category;

      const matchesState =
        state === "All States" ||
        product.state === state;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesState
      );
    })
    .sort((a, b) => {
      if (sort === "Lowest Price") {
        return a.price - b.price;
      }

      if (sort === "Highest Price") {
        return b.price - a.price;
      }

      return 0;
    });

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

            <Link
              href="/"
              className="text-gray-600 hover:text-green-600"
            >
              Home
            </Link>

            <Link
              href="/marketplace"
              className="font-semibold text-green-600"
            >
              Marketplace
            </Link>

            <Link
              href="/seller"
              className="text-gray-600 hover:text-green-600"
            >
              Sell
            </Link>

          </div>
        </div>
      </nav>

      {/* HEADER */}
      <section className="bg-green-600 px-6 py-12 text-white">

        <div className="mx-auto max-w-7xl">

          <h1 className="text-4xl font-bold">
            MarketLink Marketplace
          </h1>

          <p className="mt-3 text-green-100">
            Buy products from markets across Nigeria.
          </p>

          <div className="mt-8">

            <input
              type="text"
              placeholder="Search products, markets or sellers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl px-5 py-4 text-gray-900 outline-none"
            />

          </div>

        </div>

      </section>

      {/* FILTERS */}
      <section className="mx-auto max-w-7xl px-6 py-8">

        <div className="grid gap-4 md:grid-cols-3">

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="rounded-lg border bg-white px-4 py-3"
          >
            <option>All Categories</option>
            <option>Food</option>
            <option>Electronics</option>
            <option>Fashion</option>
            <option>Farm Products</option>
            <option>Vehicles</option>
            <option>Home</option>
            <option>Other</option>
          </select>

          <select
            value={state}
            onChange={(e) => setState(e.target.value)}
            className="rounded-lg border bg-white px-4 py-3"
          >
            {states.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="rounded-lg border bg-white px-4 py-3"
          >
            <option>Newest</option>
            <option>Lowest Price</option>
            <option>Highest Price</option>
          </select>

        </div>

      </section>

      {/* PRODUCTS */}
      <section className="mx-auto max-w-7xl px-6 pb-16">

        <div className="mb-6 flex items-center justify-between">

          <h2 className="text-2xl font-bold text-gray-900">
            Products
          </h2>

          <span className="text-gray-500">
            {filteredProducts.length} products
          </span>

        </div>

        {filteredProducts.length === 0 ? (

          <div className="rounded-xl bg-white p-12 text-center">

            <p className="text-lg text-gray-500">
              No products found.
            </p>

            <button
              onClick={() => {
                setSearch("");
                setCategory("All Categories");
                setState("All States");
              }}
              className="mt-4 rounded-lg bg-green-600 px-5 py-3 text-white"
            >
              Clear Filters
            </button>

          </div>

        ) : (

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">

            {filteredProducts.map((product) => (

              <Link
                href={`/product?id=${product.id}`}
                key={product.id}
                className="overflow-hidden rounded-xl bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >

                <div className="flex h-48 items-center justify-center bg-gray-100 text-7xl">
                  {product.icon}
                </div>

                <div className="p-5">

                  <h3 className="text-lg font-bold text-gray-900">
                    {product.name}
                  </h3>

                  <p className="mt-2 text-xl font-bold text-green-600">
                    ₦{product.price.toLocaleString()}
                  </p>

                  <p className="mt-3 text-sm text-gray-500">
                    📍 {product.market}
                  </p>

                  <p className="text-sm text-gray-500">
                    {product.state}
                  </p>

                  <p className="mt-2 text-sm text-gray-600">
                    Seller: {product.seller}
                  </p>

                  <div className="mt-4 rounded-lg bg-green-50 py-2 text-center font-semibold text-green-700">
                    View Product
                  </div>

                </div>

              </Link>

            ))}

          </div>

        )}

      </section>

      {/* SELLER CTA */}
      <section className="bg-white px-6 py-16">

        <div className="mx-auto max-w-4xl text-center">

          <h2 className="text-3xl font-bold">
            Have products to sell?
          </h2>

          <p className="mt-3 text-gray-600">
            List your products and reach customers across Nigeria.
          </p>

          <Link
            href="/seller"
            className="mt-6 inline-block rounded-xl bg-green-600 px-8 py-4 font-semibold text-white hover:bg-green-700"
          >
            Start Selling
          </Link>

        </div>

      </section>

    </main>
  );
}