"use client";

import { useState } from "react";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

type HistoryItem = {
  month: string;
  label: string;
  price: number;
  type: "historical" | "projected";
};

type Result = {
  success: boolean;
  product: string;
  quantity: number;
  sellerPrice: number;
  market: string;
  state: string;

  estimatedMarketPrice: {
    low: number;
    average: number;
    high: number;
  };

  estimatedTotalValue: number;

  position: string;

  history: HistoryItem[];

  disclaimer: string;
};

function formatNaira(value: number) {
  return `₦${value.toLocaleString("en-NG")}`;
}

export default function MarketPricePage() {
  const [product, setProduct] = useState("Rice");
  const [quantity, setQuantity] = useState("10");
  const [sellerPrice, setSellerPrice] = useState("82000");
  const [market, setMarket] = useState("Mile 12");
  const [state, setState] = useState("Lagos");

  const [result, setResult] = useState<Result | null>(null);

  const [loading, setLoading] = useState(false);

  const [graphType, setGraphType] =
    useState<"line" | "bar" | "area">("line");

  async function checkMarketPrice() {
    try {
      setLoading(true);

      const response = await fetch(
        "/api/market-price",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            product,
            quantity: Number(quantity),
            sellerPrice: Number(sellerPrice),
            market,
            state,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to check market price."
        );
      }

      setResult(data);
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50">
      {/* HEADER */}

      <header className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-6 py-6">
          <h1 className="text-3xl font-bold text-green-700">
            MarketLink
          </h1>

          <p className="mt-1 text-slate-500">
            Market Price Intelligence
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-8">

        {/* INPUT SECTION */}

        <section className="rounded-3xl bg-white p-6 shadow-sm">

          <h2 className="text-2xl font-bold text-slate-900">
            Check Market Price
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Compare estimated historical prices and projected
            prices for the coming months.
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-5">

            <div>
              <label className="mb-2 block text-sm font-semibold">
                Product
              </label>

              <input
                value={product}
                onChange={(e) =>
                  setProduct(e.target.value)
                }
                className="w-full rounded-xl border px-4 py-3"
                placeholder="Rice"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">
                Quantity
              </label>

              <input
                type="number"
                value={quantity}
                onChange={(e) =>
                  setQuantity(e.target.value)
                }
                className="w-full rounded-xl border px-4 py-3"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">
                Current Price
              </label>

              <input
                type="number"
                value={sellerPrice}
                onChange={(e) =>
                  setSellerPrice(e.target.value)
                }
                className="w-full rounded-xl border px-4 py-3"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">
                Market
              </label>

              <input
                value={market}
                onChange={(e) =>
                  setMarket(e.target.value)
                }
                className="w-full rounded-xl border px-4 py-3"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">
                State
              </label>

              <select
                value={state}
                onChange={(e) =>
                  setState(e.target.value)
                }
                className="w-full rounded-xl border px-4 py-3"
              >
                <option>Lagos</option>
                <option>Abuja</option>
                <option>Kano</option>
                <option>Rivers</option>
                <option>Oyo</option>
                <option>Enugu</option>
                <option>Kaduna</option>
              </select>
            </div>

          </div>

          <button
            onClick={checkMarketPrice}
            disabled={loading}
            className="mt-6 rounded-xl bg-green-600 px-8 py-4 font-bold text-white hover:bg-green-700 disabled:opacity-50"
          >
            {loading
              ? "Analyzing Market..."
              : "Analyze Market Price"}
          </button>

        </section>

        {/* RESULTS */}

        {result && (
          <div className="mt-8 space-y-6">

            {/* SUMMARY CARDS */}

            <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">

              <div className="rounded-2xl bg-white p-6 shadow-sm">
                <p className="text-sm text-slate-500">
                  Current Price
                </p>

                <p className="mt-2 text-2xl font-bold">
                  {formatNaira(result.sellerPrice)}
                </p>
              </div>

              <div className="rounded-2xl bg-white p-6 shadow-sm">
                <p className="text-sm text-slate-500">
                  Projected Average
                </p>

                <p className="mt-2 text-2xl font-bold text-green-700">
                  {formatNaira(
                    result.estimatedMarketPrice.average
                  )}
                </p>
              </div>

              <div className="rounded-2xl bg-white p-6 shadow-sm">
                <p className="text-sm text-slate-500">
                  Projected Range
                </p>

                <p className="mt-2 text-lg font-bold">
                  {formatNaira(
                    result.estimatedMarketPrice.low
                  )}
                </p>

                <p className="text-sm text-slate-500">
                  to
                </p>

                <p className="text-lg font-bold">
                  {formatNaira(
                    result.estimatedMarketPrice.high
                  )}
                </p>
              </div>

              <div className="rounded-2xl bg-white p-6 shadow-sm">
                <p className="text-sm text-slate-500">
                  Estimated Total Value
                </p>

                <p className="mt-2 text-2xl font-bold">
                  {formatNaira(
                    result.estimatedTotalValue
                  )}
                </p>
              </div>

            </section>

            {/* POSITION */}

            <section className="rounded-2xl border border-green-200 bg-green-50 p-6">
              <p className="text-sm font-semibold text-green-800">
                Market Position
              </p>

              <p className="mt-1 text-xl font-bold text-green-900">
                {result.position}
              </p>
            </section>

            {/* GRAPH */}

            <section className="rounded-3xl bg-white p-6 shadow-sm">

              <div className="flex flex-col justify-between gap-4 md:flex-row">

                <div>
                  <h2 className="text-2xl font-bold">
                    {result.product} Price Trend
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Past 6 months + next 6 months projection
                  </p>
                </div>

                {/* GRAPH SELECTOR */}

                <div className="flex gap-2">

                  <button
                    onClick={() =>
                      setGraphType("line")
                    }
                    className={`rounded-lg px-4 py-2 text-sm font-semibold ${
                      graphType === "line"
                        ? "bg-green-600 text-white"
                        : "bg-slate-100"
                    }`}
                  >
                    Line
                  </button>

                  <button
                    onClick={() =>
                      setGraphType("bar")
                    }
                    className={`rounded-lg px-4 py-2 text-sm font-semibold ${
                      graphType === "bar"
                        ? "bg-green-600 text-white"
                        : "bg-slate-100"
                    }`}
                  >
                    Bar
                  </button>

                  <button
                    onClick={() =>
                      setGraphType("area")
                    }
                    className={`rounded-lg px-4 py-2 text-sm font-semibold ${
                      graphType === "area"
                        ? "bg-green-600 text-white"
                        : "bg-slate-100"
                    }`}
                  >
                    Area
                  </button>

                </div>

              </div>

              <div className="mt-8 h-[450px] w-full">

                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >

                  {graphType === "line" ? (
                    <LineChart
                      data={result.history}
                    >
                      <CartesianGrid strokeDasharray="3 3" />

                      <XAxis dataKey="label" />

                      <YAxis
                        tickFormatter={(value) =>
                          `₦${(
                            value / 1000
                          ).toFixed(0)}k`
                        }
                      />

                      <Tooltip
                        formatter={(value) =>
                          formatNaira(Number(value))
                        }
                      />

                      <Legend />

                      <Line
                        type="monotone"
                        dataKey="price"
                        name="Estimated Price"
                        strokeWidth={3}
                        dot={{ r: 4 }}
                      />
                    </LineChart>
                  ) : graphType === "bar" ? (
                    <BarChart
                      data={result.history}
                    >
                      <CartesianGrid strokeDasharray="3 3" />

                      <XAxis dataKey="label" />

                      <YAxis
                        tickFormatter={(value) =>
                          `₦${(
                            value / 1000
                          ).toFixed(0)}k`
                        }
                      />

                      <Tooltip
                        formatter={(value) =>
                          formatNaira(Number(value))
                        }
                      />

                      <Legend />

                      <Bar
                        dataKey="price"
                        name="Estimated Price"
                      />
                    </BarChart>
                  ) : (
                    <AreaChart
                      data={result.history}
                    >
                      <CartesianGrid strokeDasharray="3 3" />

                      <XAxis dataKey="label" />

                      <YAxis
                        tickFormatter={(value) =>
                          `₦${(
                            value / 1000
                          ).toFixed(0)}k`
                        }
                      />

                      <Tooltip
                        formatter={(value) =>
                          formatNaira(Number(value))
                        }
                      />

                      <Legend />

                      <Area
                        type="monotone"
                        dataKey="price"
                        name="Estimated Price"
                        strokeWidth={3}
                        fillOpacity={0.25}
                      />
                    </AreaChart>
                  )}

                </ResponsiveContainer>

              </div>

            </section>

            {/* MONTHLY TABLE */}

            <section className="rounded-3xl bg-white p-6 shadow-sm">

              <h2 className="text-xl font-bold">
                Monthly Market Outlook
              </h2>

              <div className="mt-5 overflow-x-auto">

                <table className="w-full text-left">

                  <thead>
                    <tr className="border-b text-sm text-slate-500">
                      <th className="px-4 py-3">
                        Month
                      </th>

                      <th className="px-4 py-3">
                        Price
                      </th>

                      <th className="px-4 py-3">
                        Type
                      </th>
                    </tr>
                  </thead>

                  <tbody>

                    {result.history.map(
                      (item) => (
                        <tr
                          key={item.month}
                          className="border-b"
                        >
                          <td className="px-4 py-4 font-medium">
                            {item.label}
                          </td>

                          <td className="px-4 py-4 font-bold">
                            {formatNaira(
                              item.price
                            )}
                          </td>

                          <td className="px-4 py-4">

                            {item.type ===
                            "projected" ? (
                              <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                                Projected
                              </span>
                            ) : (
                              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                                Historical
                              </span>
                            )}

                          </td>
                        </tr>
                      )
                    )}

                  </tbody>

                </table>

              </div>

            </section>

            {/* DISCLAIMER */}

            <section className="rounded-2xl bg-amber-50 p-5 text-sm text-amber-800">
              <strong>Market information:</strong>{" "}
              {result.disclaimer}
            </section>

          </div>
        )}

      </div>
    </main>
  );
}