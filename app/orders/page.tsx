"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type OrderItem = {
  id: number;
  name: string;
  price: number;
  quantity: number;
  state?: string;
  market?: string;
  seller?: string;
  icon?: string;
};

type Order = {
  id: number;
  trackingId: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  status: string;
  createdAt: string;
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const savedOrders = localStorage.getItem("marketlinkOrders");

    if (savedOrders) {
      try {
        const parsedOrders = JSON.parse(savedOrders);

        if (Array.isArray(parsedOrders)) {
          setOrders(parsedOrders);
        }
      } catch (error) {
        console.error("Failed to load orders:", error);
      }
    }
  }, []);

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f5f7f6",
        fontFamily: "Arial, sans-serif",
        padding: "30px 20px",
      }}
    >
      <div
        style={{
          maxWidth: "1000px",
          margin: "0 auto",
        }}
      >
        {/* HEADER */}

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "15px",
            flexWrap: "wrap",
            marginBottom: "30px",
          }}
        >
          <div>
            <Link
              href="/"
              style={{
                color: "#168a45",
                textDecoration: "none",
                fontWeight: "bold",
              }}
            >
              ← MarketLink
            </Link>

            <h1
              style={{
                margin: "15px 0 5px",
              }}
            >
              My Orders
            </h1>

            <p
              style={{
                color: "#666",
                margin: 0,
              }}
            >
              Track your MarketLink orders.
            </p>
          </div>

          <Link
            href="/marketplace"
            style={{
              background: "#168a45",
              color: "white",
              padding: "12px 18px",
              borderRadius: "8px",
              textDecoration: "none",
              fontWeight: "bold",
            }}
          >
            Continue Shopping
          </Link>
        </div>

        {/* EMPTY ORDERS */}

        {orders.length === 0 ? (
          <div
            style={{
              background: "white",
              borderRadius: "15px",
              padding: "50px 25px",
              textAlign: "center",
              boxShadow: "0 5px 20px rgba(0,0,0,0.08)",
            }}
          >
            <div
              style={{
                fontSize: "55px",
                marginBottom: "15px",
              }}
            >
              📦
            </div>

            <h2>No orders yet</h2>

            <p
              style={{
                color: "#666",
                marginBottom: "25px",
              }}
            >
              Your orders will appear here after you make a purchase.
            </p>

            <Link
              href="/marketplace"
              style={{
                display: "inline-block",
                background: "#168a45",
                color: "white",
                padding: "13px 22px",
                borderRadius: "8px",
                textDecoration: "none",
                fontWeight: "bold",
              }}
            >
              Browse Marketplace
            </Link>
          </div>
        ) : (
          /* ORDERS */

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "20px",
            }}
          >
            {orders.map((order) => (
              <div
                key={order.id}
                style={{
                  background: "white",
                  borderRadius: "15px",
                  padding: "25px",
                  boxShadow: "0 5px 20px rgba(0,0,0,0.08)",
                }}
              >
                {/* ORDER HEADER */}

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: "15px",
                    flexWrap: "wrap",
                    borderBottom: "1px solid #eee",
                    paddingBottom: "18px",
                    marginBottom: "18px",
                  }}
                >
                  <div>
                    <p
                      style={{
                        margin: "0 0 5px",
                        color: "#666",
                        fontSize: "14px",
                      }}
                    >
                      Tracking ID
                    </p>

                    <strong
                      style={{
                        fontSize: "18px",
                        color: "#168a45",
                      }}
                    >
                      {order.trackingId}
                    </strong>
                  </div>

                  <div
                    style={{
                      background: "#fff4d6",
                      color: "#8a6200",
                      padding: "8px 14px",
                      borderRadius: "20px",
                      fontWeight: "bold",
                      fontSize: "14px",
                    }}
                  >
                    {order.status}
                  </div>
                </div>

                {/* ORDER ITEMS */}

                <div>
                  {order.items?.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: "15px",
                        padding: "15px 0",
                        borderBottom: "1px solid #f0f0f0",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                        }}
                      >
                        <div
                          style={{
                            width: "50px",
                            height: "50px",
                            background: "#f5f7f6",
                            borderRadius: "10px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "25px",
                          }}
                        >
                          {item.icon || "📦"}
                        </div>

                        <div>
                          <strong>{item.name}</strong>

                          <p
                            style={{
                              margin: "5px 0 0",
                              color: "#666",
                              fontSize: "14px",
                            }}
                          >
                            Quantity: {item.quantity}
                          </p>

                          {item.market && (
                            <p
                              style={{
                                margin: "3px 0 0",
                                color: "#777",
                                fontSize: "13px",
                              }}
                            >
                              📍 {item.market}
                              {item.state ? `, ${item.state}` : ""}
                            </p>
                          )}
                        </div>
                      </div>

                      <strong>
                        ₦
                        {(
                          Number(item.price) * Number(item.quantity)
                        ).toLocaleString()}
                      </strong>
                    </div>
                  ))}
                </div>

                {/* DELIVERY */}

                <div
                  style={{
                    marginTop: "20px",
                    padding: "15px",
                    background: "#f5f7f6",
                    borderRadius: "10px",
                  }}
                >
                  <strong>Delivery Status</strong>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      marginTop: "15px",
                      flexWrap: "wrap",
                    }}
                  >
                    <span>🛒 Ordered</span>

                    <span>→</span>

                    <span>🏪 Confirmed</span>

                    <span>→</span>

                    <span>🏍️ Picked</span>

                    <span>→</span>

                    <span>📦 Delivered</span>
                  </div>
                </div>

                {/* TOTAL */}

                <div
                  style={{
                    marginTop: "20px",
                    paddingTop: "20px",
                    borderTop: "1px solid #eee",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "8px",
                    }}
                  >
                    <span>Subtotal</span>

                    <strong>
                      ₦{Number(order.subtotal).toLocaleString()}
                    </strong>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "8px",
                    }}
                  >
                    <span>Delivery</span>

                    <strong>
                      ₦{Number(order.deliveryFee).toLocaleString()}
                    </strong>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginTop: "15px",
                      fontSize: "20px",
                    }}
                  >
                    <strong>Total</strong>

                    <strong style={{ color: "#168a45" }}>
                      ₦{Number(order.total).toLocaleString()}
                    </strong>
                  </div>
                </div>

                {/* DATE */}

                <p
                  style={{
                    marginTop: "18px",
                    color: "#777",
                    fontSize: "13px",
                  }}
                >
                  Order date:{" "}
                  {order.createdAt
                    ? new Date(order.createdAt).toLocaleString()
                    : "Unknown"}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}