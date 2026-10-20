import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const product = String(body.product || "Product");
    const quantity = Number(body.quantity || 1);
    const sellerPrice = Number(body.sellerPrice || 0);
    const market = String(body.market || "Market");
    const state = String(body.state || "Lagos");

    if (!sellerPrice || sellerPrice <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Seller price must be greater than 0.",
        },
        { status: 400 }
      );
    }

    /*
      DEMO MARKET INTELLIGENCE

      This creates a historical + projected series.

      Later we can replace this with real market data
      from your database/API.
    */

    const now = new Date();

    const months: {
      month: string;
      label: string;
      price: number;
      type: "historical" | "projected";
    }[] = [];

    // -----------------------------
    // PAST 6 MONTHS
    // -----------------------------

    for (let i = 6; i >= 1; i--) {
      const date = new Date(
        now.getFullYear(),
        now.getMonth() - i,
        1
      );

      // Demo historical movement
      const movement =
        0.88 +
        Math.sin(i * 1.4) * 0.035 +
        (6 - i) * 0.012;

      const price = Math.round(
        sellerPrice * movement
      );

      months.push({
        month: date.toISOString().slice(0, 7),
        label: date.toLocaleString("en-NG", {
          month: "short",
          year: "numeric",
        }),
        price,
        type: "historical",
      });
    }

    // -----------------------------
    // CURRENT MONTH
    // -----------------------------

    months.push({
      month: now.toISOString().slice(0, 7),
      label: now.toLocaleString("en-NG", {
        month: "short",
        year: "numeric",
      }),
      price: sellerPrice,
      type: "historical",
    });

    // -----------------------------
    // NEXT 6 MONTHS
    // -----------------------------

    for (let i = 1; i <= 6; i++) {
      const date = new Date(
        now.getFullYear(),
        now.getMonth() + i,
        1
      );

      /*
        Demo projection.

        The projected price gradually changes instead
        of staying flat.
      */

      const growthRate =
        1 + i * 0.018 + Math.sin(i * 0.9) * 0.012;

      const price = Math.round(
        sellerPrice * growthRate
      );

      months.push({
        month: date.toISOString().slice(0, 7),
        label: date.toLocaleString("en-NG", {
          month: "short",
          year: "numeric",
        }),
        price,
        type: "projected",
      });
    }

    const projectedPrices = months
      .filter((item) => item.type === "projected")
      .map((item) => item.price);

    const estimatedLow = Math.min(...projectedPrices);

    const estimatedHigh = Math.max(...projectedPrices);

    const estimatedAverage = Math.round(
      projectedPrices.reduce(
        (sum, value) => sum + value,
        0
      ) / projectedPrices.length
    );

    const estimatedTotalValue =
      estimatedAverage * quantity;

    let position = "Around market estimate";

    if (sellerPrice < estimatedLow) {
      position = "Below projected market range";
    } else if (sellerPrice > estimatedHigh) {
      position = "Above projected market range";
    }

    return NextResponse.json({
      success: true,

      product,
      quantity,
      sellerPrice,

      market,
      state,

      estimatedMarketPrice: {
        low: estimatedLow,
        average: estimatedAverage,
        high: estimatedHigh,
      },

      estimatedTotalValue,

      position,

      currency: "NGN",

      history: months,

      source: "MarketLink demo market intelligence",

      disclaimer:
        "Historical and future values shown here are estimates for demonstration. Real market prices can vary by location, quality, supply, demand and time.",
    });
  } catch (error) {
    console.error("Market price error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to calculate market price.",
      },
      { status: 500 }
    );
  }
}