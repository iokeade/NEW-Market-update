import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const email = body.email;
    const amount = body.amount;

    if (!email || !amount) {
      return NextResponse.json(
        {
          message: "Email and amount are required",
        },
        { status: 400 }
      );
    }

    const reference = `MLK-${Date.now()}`;

    const response = await fetch(
      "https://api.paystack.co/transaction/initialize",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          amount: Math.round(Number(amount) * 100),
          currency: "NGN",
          reference,
          metadata: {
            platform: "MarketLink",
            order_reference: reference,
          },
        }),
      }
    );

    const data = await response.json();

    if (!response.ok || !data.status) {
      return NextResponse.json(
        {
          message: data.message || "Unable to initialize payment",
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      accessCode: data.data.access_code,
      reference: data.data.reference,
    });
  } catch (error) {
    console.error("Payment initialization error:", error);

    return NextResponse.json(
      {
        message: "Payment initialization failed",
      },
      { status: 500 }
    );
  }
}
